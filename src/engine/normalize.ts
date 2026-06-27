import type { IndicatorDefinition } from './types'

/**
 * Clamp and round a raw form value to the indicator's valid domain.
 * Returns `null` when the value was not entered or is not a finite number.
 */
export function normalizeIndicator(
  rawValue: number | string | undefined | null,
  definition: IndicatorDefinition,
): number | null {
  if (rawValue === undefined || rawValue === null || rawValue === '') return null
  const parsed = typeof rawValue === 'number' ? rawValue : Number.parseFloat(rawValue)
  if (!Number.isFinite(parsed)) return null

  const clamped = Math.min(definition.max, Math.max(definition.min, parsed))
  return Math.round(clamped * 10) / 10
}
