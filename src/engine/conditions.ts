import type { ConditionNode, IndicatorCondition, IndicatorId, IndicatorResult } from './types'

export type IndicatorResultMap = Partial<Record<IndicatorId, IndicatorResult>>

function isLeaf(node: ConditionNode): node is IndicatorCondition {
  return 'indicator' in node
}

function evaluateLeaf(condition: IndicatorCondition, results: IndicatorResultMap): boolean {
  const result = results[condition.indicator]
  if (!result) return false // indicator not entered -> cannot be satisfied
  if (condition.zoneIn && !condition.zoneIn.includes(result.zone.id)) return false
  if (condition.riskScoreMin !== undefined && result.riskScore < condition.riskScoreMin) return false
  return true
}

export function evaluateCondition(node: ConditionNode, results: IndicatorResultMap): boolean {
  if (isLeaf(node)) return evaluateLeaf(node, results)
  if ('all' in node) return node.all.every((child) => evaluateCondition(child, results))
  if ('any' in node) return node.any.some((child) => evaluateCondition(child, results))
  return node.none.every((child) => !evaluateCondition(child, results))
}

/** Flatten every leaf condition out of a (possibly nested) condition tree. */
export function collectLeaves(node: ConditionNode): IndicatorCondition[] {
  if (isLeaf(node)) return [node]
  if ('all' in node) return node.all.flatMap(collectLeaves)
  if ('any' in node) return node.any.flatMap(collectLeaves)
  return node.none.flatMap(collectLeaves)
}

/**
 * Recursive "requirement weight" of a condition tree: a leaf counts as 1,
 * `all` sums its children's weight (every branch is independent evidence),
 * `any`/`none` count as exactly 1 (satisfying one of several alternatives is
 * a single unit of evidence, regardless of how many alternatives existed).
 */
export function conditionWeight(node: ConditionNode): number {
  if (isLeaf(node)) return 1
  if ('all' in node) return node.all.reduce((sum, child) => sum + conditionWeight(child), 0)
  return 1
}
