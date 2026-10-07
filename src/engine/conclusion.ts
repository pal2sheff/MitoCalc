import type {
  CalculationResult,
  ClinicalContext,
  ControlGoalDefinition,
  DynamicsResult,
  ForbiddenPhraseHit,
  ForbiddenPhraseRule,
  IndicatorResult,
} from './types'

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1)).replace('.', ',')

function describeIndicator(r: IndicatorResult): string {
  if (r.definition.valueType === 'deltaNadh') {
    const signed = r.value > 0 ? `+${fmt(r.value)}` : r.value < 0 ? `−${fmt(Math.abs(r.value))}` : '0'
    return `${r.definition.label.split(',')[0]} ${signed} (${r.zone.label.toLowerCase()})`
  }
  return `${r.definition.label} ${fmt(r.value)} % — ${r.zone.label.toLowerCase()}`
}

/**
 * Заключение по шаблону раздела 9.2. Поля без содержания опускаются.
 * Возвращает список абзацев: заголовок раздела отделён от текста двоеточием.
 */
export function buildConclusion(
  result: CalculationResult,
  context: ClinicalContext,
  controlGoals: ControlGoalDefinition[],
  dynamics: DynamicsResult | null,
): { title: string; sections: { heading: string; text: string }[] } {
  const sections: { heading: string; text: string }[] = []
  const add = (heading: string, text: string) => {
    if (text.trim()) sections.push({ heading, text: text.trim() })
  }

  const confirmed = result.redFlags.filter((f) => f.status === 'confirmed')
  if (confirmed.length > 0) {
    add(
      'Красный флаг',
      confirmed.map((f) => `${f.finding}. Исключить: ${f.exclude.toLowerCase()}. Действие: ${f.action.toLowerCase()}.`).join(' ') +
        ' Первоочередное действие — профильное обследование, остальная интерпретация вторична.',
    )
  }
  if (dynamics?.progressiveWorsening) {
    add(
      'Красный флаг',
      'Прогрессирующее ухудшение всех контуров при адекватном лечении. Исключить недиагностированное системное заболевание. Действие: пересмотр диагностической гипотезы, расширение обследования.',
    )
  }

  if (context.studyDate) add('Дата исследования', context.studyDate)

  const probes = result.indicatorResults.filter((r) => r.definition.valueType === 'deltaNadh').map((r) => r.definition.label.split(',')[0])
  add('Комплектация', `${result.study.panel.label}.${probes.length > 0 ? ` Фактический состав проб: ${probes.join(', ')}.` : ' Функциональных проб нет.'}`)
  const conditions = result.study.preanalytics.conclusionLine.replace(/^Условия исследования:\s*/, '')
  add('Условия исследования', conditions.charAt(0).toUpperCase() + conditions.slice(1))

  const base = result.indicatorResults.filter((r) => r.definition.valueType !== 'deltaNadh')
  const outside = base.filter((r) => r.riskScore > 0).map(describeIndicator)
  const inside = base.filter((r) => r.riskScore === 0).map((r) => r.definition.label)
  const probeTexts = result.indicatorResults.filter((r) => r.definition.valueType === 'deltaNadh').map(describeIndicator)
  add(
    'Результаты',
    [
      outside.length > 0 ? `${outside.join('. ')}.` : '',
      probeTexts.length > 0 ? `Функциональные пробы: ${probeTexts.join('; ')}.` : '',
      inside.length > 0 ? `В целевых зонах: ${inside.join(', ')}.` : '',
    ].join(' '),
  )

  const contourText = result.contourResults
    .map((c) => (c.state ? `${c.label}: ${c.state.label.toLowerCase()}.` : `${c.label}: не оценивался, объём исследования его не включает.`))
    .join(' ')
  const adaptive = result.contourResults.find((c) => c.id === 'adaptive')
  const energy = result.contourResults.find((c) => c.id === 'energy')
  const reserveText = adaptive?.state
    ? `Резерв: ${adaptive.state.text.charAt(0).toLowerCase()}${adaptive.state.text.slice(1)}`
    : 'Резерв и компенсация не оценивались: в комплектации нет функциональных проб. При необходимости оценки резерва показано исследование в комплектации MITO Pro.'
  const compensationText = energy?.state?.id === 'compensated' || energy?.state?.id === 'shifted' ? ` Компенсация: ${energy.state.text.charAt(0).toLowerCase()}${energy.state.text.slice(1)}` : ''
  add('Функциональная гипотеза', `${contourText} ${reserveText}${compensationText}`)

  const { leading, manifestations, unconfirmedSystemic, leadingReason } = result.priority
  if (leading) {
    const name = leading.subtype ? `${leading.pattern.name} (${leading.subtype.charAt(0).toLowerCase()}${leading.subtype.slice(1)})` : leading.pattern.name
    const manif = manifestations.length > 0 ? `, с проявлениями: ${manifestations.map((m) => m.pattern.name.charAt(0).toLowerCase() + m.pattern.name.slice(1)).join('; ')}` : ''
    const systemic =
      unconfirmedSystemic.length > 0 && leading.pattern.level !== 'A' ? ' Системный контекст не установлен: паттерны уровня A клиникой не подтверждаются.' : ''
    add('Ведущий паттерн', `${name}${manif}. ${leading.pattern.conclusionLine}${systemic}`)
  } else {
    add('Ведущий паттерн', leadingReason)
  }

  const causes = leading ? leading.pattern.possibleCauses.map((c) => c.charAt(0).toLowerCase() + c.slice(1)) : []
  const search = result.leadingContour?.contour.searchDirection
  add(
    'Направления поиска',
    [causes.length > 0 ? `Проверить: ${causes.join(', ')}.` : '', search ? `По ведущему контуру: ${search.charAt(0).toLowerCase()}${search.slice(1)}` : '']
      .join(' '),
  )

  const baseLower = result.workup.baseSet.map((b) => b.toLowerCase())
  const patternAnalyses = [...new Set(result.workup.byPattern.slice(0, 3).flatMap((p) => p.analyses))].filter(
    (a) => !baseLower.some((b) => b.includes(a.toLowerCase())),
  )
  add(
    'План обследования',
    `Первая линия: ${result.workup.baseSet.join(', ')}.${patternAnalyses.length > 0 ? ` По гипотезе: ${patternAnalyses.join(', ')}.` : ''}`,
  )

  add(
    'Направления воздействия',
    `Устранение выявленных ограничивающих факторов: режим, питание, физическая активность, сон, коррекция подтверждённых дефицитов, пересмотр лекарственной нагрузки. Формулируются после получения результатов дообследования.${leading ? ` ${leading.pattern.cautiousStrategy}` : ''}`,
  )

  if (dynamics) add('Динамика', dynamics.conclusionText)

  const goal = controlGoals.find((g) => g.id === context.controlGoal)
  add(
    'Контроль',
    goal
      ? `Повторное исследование: ${goal.term} (${goal.label.toLowerCase()}). Условия забора воспроизвести: то же время суток, натощак, вне инфекции и не ранее чем через трое суток после интенсивной нагрузки.`
      : 'Срок повторного исследования не выбран.',
  )

  add(
    'Ограничение',
    'Исследование является функциональным и дополнительным. Диагноз устанавливается на основании клинической картины, анамнеза и стандартного обследования.',
  )

  return { title: 'ИММУННО-МИТОХОНДРИАЛЬНЫЙ ФУНКЦИОНАЛЬНЫЙ АНАЛИЗ', sections }
}

export function conclusionToText(c: { title: string; sections: { heading: string; text: string }[] }): string {
  return [c.title, '', ...c.sections.map((s) => `${s.heading}. ${s.text}`)].join('\n\n').replace(/\n{3,}/g, '\n\n')
}

/** Проверка на формулировки раздела 9.4. */
export function checkForbiddenPhrases(text: string, rules: ForbiddenPhraseRule[]): ForbiddenPhraseHit[] {
  const hits: ForbiddenPhraseHit[] = []
  for (const rule of rules) {
    const re = new RegExp(rule.pattern, 'giu')
    for (const m of text.matchAll(re)) hits.push({ id: rule.id, match: m[0], message: rule.message })
  }
  return hits
}

/** Пункты чек-листа 9.5, которые можно проверить автоматически. null — проверяет врач. */
export function autoChecklist(
  result: CalculationResult,
  context: ClinicalContext,
  hits: ForbiddenPhraseHit[],
): Record<string, boolean | null> {
  return {
    conditions: null,
    rule7: result.study.preanalytics.rule7Hints.length === 0 ? null : result.study.preanalytics.rule7Hints.every((h) => context.explainedByEvent.includes(h.patternId)) ? true : null,
    contours: true,
    leading: result.priority.leading !== null,
    reserve: result.contourResults.some((c) => c.id === 'adaptive' && c.state !== null) ? true : null,
    redFlags: result.redFlags.every((f) => f.status === 'confirmed'),
    template: true,
    plan: !!context.controlGoal,
    noForbidden: hits.length === 0,
  }
}
