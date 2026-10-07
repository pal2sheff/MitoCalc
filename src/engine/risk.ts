import type { ContourResult, OverallRiskLevel, RedFlagResult, SafetyFlag } from './types'

/**
 * Сводная степень изменений для шапки экрана. В пособии такой шкалы нет:
 * это навигация по экрану, а не клиническая категория.
 * Подтверждённый красный флаг раздела 9.3 ставится выше всего: он меняет
 * приоритет действий (сначала профильное обследование).
 */
export function calculateOverallRisk(
  contours: ContourResult[],
  safetyFlags: SafetyFlag[],
  redFlags: RedFlagResult[],
): OverallRiskLevel {
  if (redFlags.some((f) => f.status === 'confirmed')) return 'красный флаг: профильное обследование'
  const max = contours.reduce((m, c) => Math.max(m, c.state?.severity ?? 0), 0)
  const changedCount = contours.filter((c) => (c.state?.severity ?? 0) >= 2).length
  if (max >= 3 || changedCount >= 3 || safetyFlags.some((f) => f.level === 'critical')) return 'выраженные изменения'
  if (max === 2) return 'умеренные изменения'
  return 'без значимых изменений'
}
