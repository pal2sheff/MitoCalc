import type { IndicatorReferenceConfig, ReferenceZone, RiskScore } from './types'

/** Find the reference zone a normalized value falls into. */
export function getZone(value: number, referenceConfig: IndicatorReferenceConfig): ReferenceZone {
  const zone = referenceConfig.zones.find((z) => value >= z.min && value <= z.max)
  if (zone) return zone

  // Defensive fallback: clamp into the nearest edge zone rather than throwing,
  // in case a value sits exactly on a floating-point boundary gap.
  const sorted = [...referenceConfig.zones].sort((a, b) => a.min - b.min)
  return value < sorted[0].min ? sorted[0] : sorted[sorted.length - 1]
}

export function getRiskScore(zone: ReferenceZone): RiskScore {
  return zone.riskScore
}
