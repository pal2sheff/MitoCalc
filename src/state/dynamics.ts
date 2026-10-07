import type { CalculationResult, DynamicsContext, DynamicsResult, IndicatorInputs } from '@/engine'
import { compareReports, emptyClinicalContext, runCalculation } from '@/engine'
import { calculationConfig, dynamicsConfig, referenceRanges } from '@/config'

/** Сравнение с предыдущим отчётом; null, если предыдущий отчёт не введён. */
export function computeDynamics(
  current: CalculationResult,
  prevInputs: IndicatorInputs,
  context: DynamicsContext,
): DynamicsResult | null {
  if (Object.keys(prevInputs).length === 0) return null
  const prev = runCalculation(prevInputs, calculationConfig, emptyClinicalContext)
  return compareReports(prev, current, context, (id) => referenceRanges[id].zones, dynamicsConfig)
}
