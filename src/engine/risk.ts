import type { ContourResult, OverallRiskLevel, SafetyFlag } from './types'

/**
 * Интегральная степень изменений по контурам. Пособие такой шкалы не задаёт:
 * это сводка для экрана калькулятора, а не клиническая категория.
 * Критический флаг безопасности поднимает уровень независимо от контуров.
 */
export function calculateOverallRisk(contours: ContourResult[], safetyFlags: SafetyFlag[]): OverallRiskLevel {
  if (safetyFlags.some((f) => f.level === 'critical')) return 'критический риск'
  const max = contours.reduce((m, c) => Math.max(m, c.state?.severity ?? 0), 0)
  const changedCount = contours.filter((c) => (c.state?.severity ?? 0) >= 2).length
  if (max >= 3 || changedCount >= 3) return 'высокий риск'
  if (max === 2) return 'умеренный риск'
  return 'норма'
}
