import type {
  CalculationResult,
  ComparabilityItem,
  ContourChange,
  DynamicsContext,
  DynamicsResult,
  DynamicsType,
  IndicatorChange,
  IndicatorId,
  IndicatorResult,
  ReferenceZone,
} from './types'

export interface DynamicsConfig {
  comparabilityItems: ComparabilityItem[]
  withinZoneShiftPp: number
  typeTexts: Record<DynamicsType, { meaning: string; tactics: string }>
  /** Состав контуров для поиска согласованного сдвига внутри зон. */
  contourMembers: Record<string, IndicatorId[]>
}

const NEG = ['neg', 'negStrong']
const POS = ['pos', 'posStrong']
const sign = (zoneId: string) => (NEG.includes(zoneId) ? -1 : POS.includes(zoneId) ? 1 : 0)

/** Расстояние значения до целевой (нулевого риска) области показателя. */
function distanceToTarget(r: IndicatorResult, zones: ReferenceZone[]): number {
  const target = zones.filter((z) => z.riskScore === 0)
  if (target.length === 0) return 0
  return Math.min(...target.map((z) => (r.value < z.min ? z.min - r.value : r.value > z.max ? r.value - z.max : 0)))
}

const byId = (res: CalculationResult) => new Map(res.indicatorResults.map((r) => [r.id, r]))

/**
 * Сравнение двух отчётов по разделу 8.6:
 * условия → переходы зон и смена знака → контуры → обходной путь и проба
 * на стресс → ловушки 8.5 → тип динамики (8.4).
 */
export function compareReports(
  prev: CalculationResult,
  curr: CalculationResult,
  context: DynamicsContext,
  zonesOf: (id: IndicatorId) => ReferenceZone[],
  config: DynamicsConfig,
): DynamicsResult {
  const before = byId(prev)
  const after = byId(curr)
  const notes: string[] = []

  // Шаг 1. Условия сопоставимости.
  const notReproduced = config.comparabilityItems.filter((i) => !context.comparability.includes(i.id)).map((i) => i.label)
  const comparable = notReproduced.length === 0
  if (!comparable) notes.push('Условия забора воспроизведены не полностью: вывод о динамике предварительный.')

  const nadhUnitsDiffer =
    (prev.study.panel.id === 'standart') !== (curr.study.panel.id === 'standart') && before.has('nadh') && after.has('nadh')
  if (nadhUnitsDiffer) {
    notes.push('НАДН измерен в разных комплектациях (условные единицы и проценты): динамика НАДН оценивается с оговоркой.')
  }

  // Шаг 2. Переходы зон и смена знака.
  const indicatorChanges: IndicatorChange[] = []
  for (const [id, a] of after) {
    const b = before.get(id)
    if (!b) continue
    const signChanged = a.definition.valueType === 'deltaNadh' && sign(b.zone.id) * sign(a.zone.id) === -1
    const zoneChanged = a.zone.id !== b.zone.id
    if (!zoneChanged && a.value === b.value) continue
    const kind: IndicatorChange['kind'] = signChanged ? 'signChange' : zoneChanged ? 'zoneChange' : 'withinZone'
    const direction = kind === 'withinZone' ? null : a.riskScore < b.riskScore ? 'toward' : a.riskScore > b.riskScore ? 'away' : null
    indicatorChanges.push({
      id,
      label: a.definition.shortLabel,
      before: b.value,
      after: a.value,
      zoneBefore: b.zone.label,
      zoneAfter: a.zone.label,
      kind,
      direction,
    })
  }
  const significant = indicatorChanges.filter((c) => c.kind !== 'withinZone')

  // Шаги 3–4. Контуры.
  const contourChanges: ContourChange[] = curr.contourResults.map((c) => {
    const p = prev.contourResults.find((x) => x.id === c.id)
    const sb = p?.state?.severity
    const sa = c.state?.severity
    const direction: ContourChange['direction'] =
      sb === undefined || sa === undefined ? 'notComparable' : sa < sb ? 'improved' : sa > sb ? 'worsened' : 'same'

    // Согласованный сдвиг внутри зон: ≥2 показателя контура без смены зоны сдвинулись в одну сторону.
    let toward = 0
    let away = 0
    if (comparable) {
      for (const id of config.contourMembers[c.id] ?? []) {
        const a = after.get(id)
        const b = before.get(id)
        if (!a || !b || a.zone.id !== b.zone.id || Math.abs(a.value - b.value) < config.withinZoneShiftPp) continue
        const da = distanceToTarget(a, zonesOf(id))
        const db = distanceToTarget(b, zonesOf(id))
        if (da < db) toward++
        else if (da > db) away++
      }
    }
    const coordinatedShift = toward >= 2 && away === 0 ? 'toward' : away >= 2 && toward === 0 ? 'away' : null

    return {
      id: c.id,
      label: c.label,
      stateBefore: p?.state?.label ?? null,
      stateAfter: c.state?.label ?? null,
      direction,
      coordinatedShift,
    }
  })
  const improved = contourChanges.filter((c) => c.direction === 'improved' || (c.direction === 'same' && c.coordinatedShift === 'toward'))
  const worsened = contourChanges.filter((c) => c.direction === 'worsened' || (c.direction === 'same' && c.coordinatedShift === 'away'))

  // Шаг 5. Обходной путь и проба на стресс.
  const riskUp = (id: IndicatorId) => {
    const a = after.get(id)
    const b = before.get(id)
    return a && b ? a.riskScore > b.riskScore : null
  }
  const riskDown = (id: IndicatorId) => {
    const a = after.get(id)
    const b = before.get(id)
    return a && b ? a.riskScore < b.riskScore : null
  }
  const valueUp = (id: IndicatorId) => {
    const a = after.get(id)
    const b = before.get(id)
    return a && b ? a.value > b.value : null
  }

  const compensationGrew = riskUp('nonMitoRespiration')
  const ox = riskUp('oxidativeStress')
  const ca = riskUp('calciumStress')
  const backgroundGrew = ox === null && ca === null ? null : !!ox || !!ca
  const stressProbeImproved = riskDown('stressReaction')

  // Ловушки раздела 8.5.
  const traps: string[] = []
  const nadhB = before.get('nadh')
  const nadhA = after.get('nadh')
  if (nadhB && nadhA && nadhB.zone.id !== 'target' && nadhA.zone.id === 'target' && compensationGrew && !riskDown('mitoActivity')) {
    traps.push('НАДН вошёл в целевую зону за счёт обходного пути: обходной путь стал выраженнее, митохондриальная активность не улучшилась. Энергетический контур не улучшился.')
  }
  if (valueUp('mitoActivity') && ox) {
    traps.push('Митохондриальная активность выросла вместе с оксидативным стрессом: это перегрузка, а не адаптация. Основание пересмотреть интенсивность вмешательства.')
  }
  for (const id of ['phagocytosis', 'nst'] as IndicatorId[]) {
    const b = before.get(id)
    const a = after.get(id)
    if (b && a && ['low', 'severelyLow'].includes(b.zone.id) && ['elevated', 'hyperactivation', 'severeHyperactivation'].includes(a.zone.id)) {
      traps.push(`${a.definition.shortLabel} прошёл целевую зону и вышел за неё вверх: это не улучшение, а появление воспалительной стимуляции, требующей поиска источника.`)
    }
  }
  if (valueUp('proteinMetabolism') && ca) {
    traps.push('Белковый обмен вырос на фоне роста кальциевого стресса: анаболический контур перешёл в напряжённое состояние.')
  }
  if (riskDown('oxidativeStress') && riskUp('mitoActivity')) {
    traps.push('Оксидативный стресс снизился вместе со всей активностью клеток: это переход в гипофункцию, а не разрешение окислительной нагрузки.')
  }

  // Шаг 7. Тип динамики.
  const events = context.betweenEvents
  const temporary = curr.study.preanalytics.limited && significant.length > 0 && significant.length <= 2
  const overload = (!!valueUp('mitoActivity') || !!valueUp('proteinMetabolism')) && backgroundGrew === true
  const notImprovement = compensationGrew === true || backgroundGrew === true || stressProbeImproved === false

  let type: DynamicsType
  if (significant.length === 0 && improved.length === 0 && worsened.length === 0) type = 'Без значимой динамики'
  else if (temporary) type = 'Временная реакция'
  else if (overload) type = 'Перегрузка'
  else if ((events.includes('illness') || events.includes('surgery')) && riskDown('oxidativeStress') && worsened.length === 0)
    type = 'Восстановление после болезни'
  else if (worsened.length > 0 && improved.length === 0) type = 'Ухудшение'
  else if (improved.length > 0 && compensationGrew === true && stressProbeImproved !== true) type = 'Компенсация'
  else if (valueUp('mitoActivity') && backgroundGrew !== true && stressProbeImproved === true) type = 'Адаптация'
  else if (improved.length > 0 && worsened.length === 0 && !notImprovement) type = 'Улучшение'
  else if (worsened.length > 0) type = improved.length > 0 ? 'Смешанная динамика' : 'Ухудшение'
  else type = 'Смешанная динамика'

  if (type === 'Улучшение' && stressProbeImproved === null) {
    notes.push('Проба на клеточный стресс в одном из отчётов отсутствует: без неё рост функции не отличить от роста напряжения, вывод об улучшении предварительный.')
  }

  const evaluated = contourChanges.filter((c) => c.direction !== 'notComparable')
  const progressiveWorsening =
    events.includes('adequateTreatment') && evaluated.length >= 3 && evaluated.every((c) => c.direction === 'worsened' || c.coordinatedShift === 'away')

  const texts = config.typeTexts[type]
  const conclusionText =
    `Динамика${context.previousDate ? ` относительно исследования от ${context.previousDate}` : ''}: ${type.toLowerCase()}. ${texts.meaning}` +
    (comparable ? '' : ' Условия забора воспроизведены не полностью, вывод предварительный.') +
    (traps.length > 0 ? ` ${traps.join(' ')}` : '') +
    ` Тактика: ${texts.tactics}`

  return {
    comparable,
    notReproduced,
    notes,
    indicatorChanges,
    contourChanges,
    checks: { compensationGrew, backgroundGrew, stressProbeImproved },
    traps,
    type,
    meaning: texts.meaning,
    tactics: texts.tactics,
    progressiveWorsening,
    conclusionText,
  }
}
