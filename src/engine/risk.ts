import type { DomainCategory, DomainResult, OverallRiskLevel, PatternMatch, SafetyFlag } from './types'

const DOMAIN_CATEGORY_RANK: Record<DomainCategory, number> = {
  'норма': 0,
  'умеренное напряжение': 1,
  'выраженное нарушение': 2,
  'критический паттерн': 3,
}

/**
 * Integral risk level: escalates from the worst domain category and the
 * strongest triggered pattern, with any critical safety flag forcing the
 * top tier regardless of domain/pattern numbers.
 */
export function calculateOverallRisk(
  domainResults: DomainResult[],
  patternMatches: PatternMatch[],
  safetyFlags: SafetyFlag[],
): OverallRiskLevel {
  const hasCriticalFlag = safetyFlags.some((f) => f.level === 'critical')
  const maxDomainRank = domainResults.reduce((max, d) => Math.max(max, DOMAIN_CATEGORY_RANK[d.category]), 0)
  const hasHighConfidencePattern = patternMatches.some((p) => p.confidence === 'высокая')
  const hasMediumConfidencePattern = patternMatches.some((p) => p.confidence === 'средняя')

  if (hasCriticalFlag || maxDomainRank >= 3) return 'критический риск'
  if (maxDomainRank === 2 || hasHighConfidencePattern) return 'высокий риск'
  if (maxDomainRank === 1 || hasMediumConfidencePattern) return 'умеренный риск'
  return 'норма'
}
