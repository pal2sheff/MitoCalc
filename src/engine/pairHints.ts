import type { IndicatorResult, PairHintDefinition } from './types'
import { evaluateCondition, type IndicatorResultMap } from './conditions'

/** Сочетания показателей с первой гипотезой (глава 3). */
export function detectPairHints(indicatorResults: IndicatorResult[], defs: PairHintDefinition[]): { id: string; text: string }[] {
  const map: IndicatorResultMap = {}
  for (const r of indicatorResults) map[r.id] = r
  return defs.filter((d) => evaluateCondition(d.when, map)).map((d) => ({ id: d.id, text: d.text }))
}
