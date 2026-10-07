import type { ContourSeverity, OverallRiskLevel, RiskScore, ZoneColor } from './types'

/**
 * Presentation mapping only (not a medical judgement): risk score and contour
 * category always render with the same colour across the app. Kept separate
 * from `src/config` because it is a UI invariant, not an editable clinical
 * threshold.
 */
export const RISK_SCORE_COLOR: Record<RiskScore, ZoneColor> = {
  0: 'green',
  1: 'yellow',
  2: 'orange',
  3: 'red',
}

export function riskScoreToColor(riskScore: RiskScore): ZoneColor {
  return RISK_SCORE_COLOR[riskScore]
}

/** Цвет состояния контура: 0 зелёный … 3 красный. */
export function contourSeverityToColor(severity: ContourSeverity): ZoneColor {
  return RISK_SCORE_COLOR[severity]
}

export const OVERALL_RISK_COLOR: Record<OverallRiskLevel, ZoneColor> = {
  'без значимых изменений': 'green',
  'умеренные изменения': 'yellow',
  'выраженные изменения': 'orange',
  'красный флаг: профильное обследование': 'red',
}

export function overallRiskLevelToColor(level: OverallRiskLevel): ZoneColor {
  return OVERALL_RISK_COLOR[level]
}
