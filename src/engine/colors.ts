import type { DomainCategory, OverallRiskLevel, RiskScore, ZoneColor } from './types'

/**
 * Presentation mapping only (not a medical judgement): risk score and domain
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

export const DOMAIN_CATEGORY_COLOR: Record<DomainCategory, ZoneColor> = {
  'норма': 'green',
  'умеренное напряжение': 'yellow',
  'выраженное нарушение': 'orange',
  'критический паттерн': 'red',
}

export function domainCategoryToColor(category: DomainCategory): ZoneColor {
  return DOMAIN_CATEGORY_COLOR[category]
}

export const OVERALL_RISK_COLOR: Record<OverallRiskLevel, ZoneColor> = {
  'норма': 'green',
  'умеренный риск': 'yellow',
  'высокий риск': 'orange',
  'критический риск': 'red',
}

export function overallRiskLevelToColor(level: OverallRiskLevel): ZoneColor {
  return OVERALL_RISK_COLOR[level]
}
