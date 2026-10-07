import type {
  ClinicalContext,
  IndicatorId,
  IndicatorInputs,
  InfectionPeriodDefinition,
  PanelDefinition,
  PatternMatch,
  PreanalyticItem,
  StudyContextResult,
} from './types'

/**
 * Комплектация (раздел 1.6): если врач выбрал комплектацию, показатели вне её
 * в расчёт не берутся; если нет — комплектация определяется по введённым
 * показателям. Перед интерпретацией важен фактический состав проб, а не
 * название комплектации.
 */
export function resolvePanel(
  inputs: IndicatorInputs,
  context: ClinicalContext,
  panels: PanelDefinition[],
): { filteredInputs: IndicatorInputs; panel: StudyContextResult['panel'] } {
  const entered = (Object.keys(inputs) as IndicatorId[]).filter((id) => inputs[id] !== undefined)

  if (context.panel !== 'auto') {
    const def = panels.find((p) => p.id === context.panel)!
    const allowed = new Set([...def.indicatorIds, ...def.optionalIndicatorIds])
    const filteredInputs: IndicatorInputs = {}
    for (const id of entered) if (allowed.has(id)) filteredInputs[id] = inputs[id]
    const ignoredIndicatorIds = entered.filter((id) => !allowed.has(id))
    const missing = def.indicatorIds.filter((id) => inputs[id] === undefined)
    const notes = [...def.notes]
    if (missing.length > 0) notes.unshift('Не все показатели комплектации введены: соответствующие контуры и паттерны оцениваются частично.')
    if (def.id === 'pro' && inputs.complexIII !== undefined) notes.push('Расширенный вариант MITO Pro с пробой комплекса III.')
    return { filteredInputs, panel: { id: def.id, label: def.label, detected: false, ignoredIndicatorIds, notes } }
  }

  // Наименьшая комплектация, которая покрывает все введённые показатели.
  const fit = panels.find((p) => {
    const allowed = new Set([...p.indicatorIds, ...p.optionalIndicatorIds])
    return entered.every((id) => allowed.has(id))
  })
  const exact = fit && fit.indicatorIds.every((id) => inputs[id] !== undefined)

  if (fit && exact) {
    const notes = [...fit.notes]
    if (fit.id === 'pro' && inputs.complexIII !== undefined) notes.push('Расширенный вариант MITO Pro с пробой комплекса III.')
    return { filteredInputs: inputs, panel: { id: fit.id, label: fit.label, detected: true, ignoredIndicatorIds: [], notes } }
  }

  return {
    filteredInputs: inputs,
    panel: {
      id: 'custom',
      label: 'Нестандартный набор показателей',
      detected: true,
      ignoredIndicatorIds: [],
      notes: [
        'Введённый набор не совпадает ни с одной комплектацией. Проверьте бланк: возможно, часть показателей пропущена при вводе. Контуры и паттерны собираются только из введённого.',
      ],
    },
  }
}

/** Условия забора и события предшествующих недель (раздел 1.1, правило 7). */
export function evaluatePreanalytics(
  context: ClinicalContext,
  items: PreanalyticItem[],
  periods: InfectionPeriodDefinition[],
  matches: PatternMatch[],
): StudyContextResult['preanalytics'] {
  const selected = items.filter((i) => context.preanalytics.includes(i.id))
  const period = periods.find((p) => p.id === context.infectionPeriod)

  const sources: { text: string; patterns: number[] }[] = selected.map((i) => ({ text: i.label, patterns: i.mayExplainPatterns }))
  if (period && period.mayExplainPatterns.length > 0) sources.push({ text: period.label, patterns: period.mayExplainPatterns })

  const rule7Hints = matches
    .map((m) => ({
      patternId: m.pattern.id,
      manualNumber: m.pattern.manualNumber,
      reasons: sources.filter((src) => src.patterns.includes(m.pattern.manualNumber)).map((src) => src.text),
    }))
    .filter((h) => h.reasons.length > 0)

  const parts = selected.map((i) => i.conclusionText)
  if (period?.conclusionText) parts.push(period.conclusionText)

  const conclusionLine =
    parts.length > 0
      ? `Условия исследования: ${parts.join('; ')}. Интерпретация с ограничением, с учётом указанных факторов.`
      : 'Условия исследования: нарушений условий забора и значимых событий предшествующих недель не отмечено.'

  return {
    items: selected.map((i) => ({ id: i.id, label: i.label, conclusionText: i.conclusionText })),
    limited: parts.length > 0,
    rule7Hints,
    conclusionLine,
  }
}

/** Стадия паттерна 14 по сроку от перенесённой инфекции. */
export function applyInfectionStage(matches: PatternMatch[], context: ClinicalContext, periods: InfectionPeriodDefinition[]): PatternMatch[] {
  const stage = periods.find((p) => p.id === context.infectionPeriod)?.stage14
  return matches.map((m) =>
    m.pattern.manualNumber === 14
      ? { ...m, subtype: stage ?? 'Стадия не определена: укажите срок от перенесённой инфекции.' }
      : m,
  )
}
