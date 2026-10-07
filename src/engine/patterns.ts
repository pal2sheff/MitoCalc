import type {
  IndicatorCondition,
  IndicatorResult,
  NotEvaluatedPattern,
  PatternConfidence,
  PatternDefinition,
  PatternMatch,
} from './types'
import { collectLeaves, conditionWeight, evaluateCondition, evaluateConditionTri, type IndicatorResultMap } from './conditions'

function confidenceFromRatio(ratio: number): PatternConfidence {
  if (ratio >= 0.85) return 'высокая'
  if (ratio >= 0.6) return 'средняя'
  return 'низкая'
}


function buildTriggeredIndicators(
  leaves: IndicatorCondition[],
  resultMap: IndicatorResultMap,
): PatternMatch['triggeredIndicators'] {
  const seen = new Set<string>()
  const triggered: PatternMatch['triggeredIndicators'] = []

  for (const leaf of leaves) {
    if (seen.has(leaf.indicator)) continue
    const result = resultMap[leaf.indicator]
    if (!result || !evaluateCondition(leaf, resultMap)) continue
    seen.add(leaf.indicator)
    triggered.push({
      id: leaf.indicator,
      label: result.definition.shortLabel,
      zoneLabel: result.zone.label,
      value: result.value,
    })
  }

  return triggered
}

/**
 * Level 3: evaluate every pattern's trigger rule against this patient's
 * indicator results. A pattern activates once `requiredConditions` holds;
 * confidence is the ratio of satisfied "evidence units" (required weight +
 * satisfied supporting conditions) over all possible units. See
 * `src/config/patterns.ts` for how weight is assigned per pattern.
 */
export interface PatternDetection {
  matches: PatternMatch[]
  /** Паттерны, которые нельзя ни подтвердить, ни исключить: не хватает измерений (правило 6). */
  notEvaluated: NotEvaluatedPattern[]
}

export function detectPatterns(indicatorResults: IndicatorResult[], patternDefs: PatternDefinition[]): PatternDetection {
  const resultMap: IndicatorResultMap = {}
  for (const r of indicatorResults) resultMap[r.id] = r

  const matches: PatternMatch[] = []
  const notEvaluated: NotEvaluatedPattern[] = []

  for (const pattern of patternDefs) {
    const status = evaluateConditionTri(pattern.requiredConditions, resultMap)
    if (status === false) continue
    if (status === null) {
      const missing = [...new Set(collectLeaves(pattern.requiredConditions).map((l) => l.indicator))].filter(
        (id) => !resultMap[id],
      )
      notEvaluated.push({ pattern, missingIndicatorIds: missing })
      continue
    }

    const requiredWeight = conditionWeight(pattern.requiredConditions)
    const supportingTotal = pattern.supportingConditions.length
    const supportingSatisfied = pattern.supportingConditions.filter((c) => evaluateCondition(c, resultMap)).length

    const totalUnits = requiredWeight + supportingTotal
    const supportRatio = totalUnits === 0 ? 1 : (requiredWeight + supportingSatisfied) / totalUnits

    const leaves = [...collectLeaves(pattern.requiredConditions), ...pattern.supportingConditions.flatMap(collectLeaves)]

    matches.push({
      pattern,
      confidence: confidenceFromRatio(supportRatio),
      triggeredIndicators: buildTriggeredIndicators(leaves, resultMap),
      supportRatio,
      subtype: pattern.subtypes?.find((st) => evaluateCondition(st.when, resultMap))?.label ?? null,
    })
  }

  // Порядок уровней по разделу 6.3: A → B → C → D → E, внутри уровня по номеру пособия.
  matches.sort((a, b) => a.pattern.level.localeCompare(b.pattern.level) || a.pattern.order - b.pattern.order)
  notEvaluated.sort((a, b) => a.pattern.order - b.pattern.order)

  return { matches, notEvaluated }
}
