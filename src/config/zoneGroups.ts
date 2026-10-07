import type { ConditionNode, IndicatorId } from '@/engine/types'

/**
 * Общие группы зон для формул паттернов и состояний контуров.
 * Идентификаторы зон заданы в referenceRanges.ts.
 *
 * «↓» и «↑» для базовых показателей — зоны ниже или выше целевой.
 * «Отклонение» функциональной пробы — отрицательная область.
 */
export const BELOW = ['low', 'severelyLow']
export const NADH_BELOW = ['lowAccumulation', 'borderlineLow']
export const NADH_ABOVE = ['elevated', 'sharplyElevated']
export const PROBE_DEVIATED = ['neg', 'negStrong']
export const PROBE_NOT_DEVIATED = ['neutral', 'pos', 'posStrong']

export const below = (indicator: IndicatorId, ifMeasured = false): ConditionNode => ({ indicator, zoneIn: BELOW, ifMeasured })
export const inTarget = (indicator: IndicatorId, ifMeasured = false): ConditionNode => ({
  indicator,
  zoneIn: ['target'],
  ifMeasured,
})
export const deviated = (indicator: IndicatorId, ifMeasured = false): ConditionNode => ({
  indicator,
  zoneIn: PROBE_DEVIATED,
  ifMeasured,
})
export const notDeviated = (indicator: IndicatorId, ifMeasured = false): ConditionNode => ({
  indicator,
  zoneIn: PROBE_NOT_DEVIATED,
  ifMeasured,
})

export const phagoAbove: ConditionNode = { indicator: 'phagocytosis', zoneIn: ['elevated', 'hyperactivation'] }
export const nstAbove: ConditionNode = { indicator: 'nst', zoneIn: ['elevated', 'severeHyperactivation'] }
export const oxidativeAbove: ConditionNode = { indicator: 'oxidativeStress', zoneIn: ['elevated', 'high'] }
export const calciumAbove: ConditionNode = { indicator: 'calciumStress', zoneIn: ['activation', 'stress'] }
export const nadhBelow: ConditionNode = { indicator: 'nadh', zoneIn: NADH_BELOW }
export const nadhAbove: ConditionNode = { indicator: 'nadh', zoneIn: NADH_ABOVE }
export const maPreserved: ConditionNode = { indicator: 'mitoActivity', zoneIn: ['target', 'high'] }
/** «Обходной путь выражен» — зона negStrong немитохондриального дыхания. */
export const bypassPronounced: ConditionNode = { indicator: 'nonMitoRespiration', zoneIn: ['negStrong'] }
/** Ответа на кортизоловую нагрузку нет: около нуля или минус. */
export const stressResponseAbsent: ConditionNode = { indicator: 'stressReaction', zoneIn: ['neutral', 'neg', 'negStrong'] }
export const stressResponsePreserved: ConditionNode = { indicator: 'stressReaction', zoneIn: ['pos', 'posStrong'] }

export const anyComplexDeviated: ConditionNode = {
  any: (['complexI', 'complexII', 'complexIII', 'complexIV', 'complexV'] as IndicatorId[]).map((id) => deviated(id)),
}
export const noComplexDeviated: ConditionNode = {
  all: (['complexI', 'complexII', 'complexIII', 'complexIV', 'complexV'] as IndicatorId[]).map((id) => notDeviated(id, true)),
}
