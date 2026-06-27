import type { IndicatorResult, SafetyFlag, SafetyRuleDefinition } from './types'
import { evaluateCondition, type IndicatorResultMap } from './conditions'

/**
 * Cross-cutting safety layer: evaluates `dynamicSafetyRules` (see
 * `src/config/safetyRules.ts`) against this patient's indicator results.
 * Reuses the same condition DSL as pattern detection, so a rule can be as
 * simple as one indicator or as complex as a nested all/any/none tree.
 */
export function detectSafetyFlags(indicatorResults: IndicatorResult[], safetyRules: SafetyRuleDefinition[]): SafetyFlag[] {
  const resultMap: IndicatorResultMap = {}
  for (const r of indicatorResults) resultMap[r.id] = r

  return safetyRules
    .filter((rule) => evaluateCondition(rule.when, resultMap))
    .map((rule) => ({ id: rule.id, level: rule.level, text: rule.text }))
}
