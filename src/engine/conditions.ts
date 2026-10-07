import type { ConditionNode, IndicatorCondition, IndicatorId, IndicatorResult } from './types'

export type IndicatorResultMap = Partial<Record<IndicatorId, IndicatorResult>>

/**
 * Трёхзначный результат условия:
 *  true  — условие выполнено;
 *  false — условие не выполнено по измеренным показателям;
 *  null  — не оценено: для решения не хватает неизмеренного показателя.
 *
 * Неизмеренный показатель не равен «норме» и не равен «отклонению»
 * (пособие, раздел 1.6 и правило 6 раздела 6.3).
 */
export type TriState = boolean | null

function isLeaf(node: ConditionNode): node is IndicatorCondition {
  return 'indicator' in node
}

function evaluateLeaf(condition: IndicatorCondition, results: IndicatorResultMap): TriState {
  const result = results[condition.indicator]
  if (!result) return null
  if (condition.zoneIn && !condition.zoneIn.includes(result.zone.id)) return false
  if (condition.riskScoreMin !== undefined && result.riskScore < condition.riskScoreMin) return false
  return true
}

/** Логика Клини: false в `all` побеждает неизвестность, true в `any` тоже. */
export function evaluateConditionTri(node: ConditionNode, results: IndicatorResultMap): TriState {
  if (isLeaf(node)) return evaluateLeaf(node, results)

  if ('all' in node) {
    let unknown = false
    for (const child of node.all) {
      const v = evaluateConditionTri(child, results)
      if (v === false) return false
      if (v === null) unknown = true
    }
    return unknown ? null : true
  }

  if ('any' in node) {
    let unknown = false
    for (const child of node.any) {
      const v = evaluateConditionTri(child, results)
      if (v === true) return true
      if (v === null) unknown = true
    }
    return unknown ? null : false
  }

  let unknown = false
  for (const child of node.none) {
    const v = evaluateConditionTri(child, results)
    if (v === true) return false
    if (v === null) unknown = true
  }
  return unknown ? null : true
}

/** Двузначная обёртка: true только при достоверно выполненном условии. */
export function evaluateCondition(node: ConditionNode, results: IndicatorResultMap): boolean {
  return evaluateConditionTri(node, results) === true
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
