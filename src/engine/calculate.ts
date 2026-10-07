import type {
  CalculationResult,
  ContourDefinition,
  IndicatorDefinition,
  IndicatorId,
  IndicatorInputs,
  IndicatorReferenceConfig,
  IndicatorResult,
  PatternDefinition,
  PriorityContext,
  SafetyRuleDefinition,
} from './types'
import { normalizeIndicator } from './normalize'
import { getRiskScore, getZone } from './zones'
import { calculateContours, selectLeadingContour } from './contours'
import { detectPatterns } from './patterns'
import { emptyPriorityContext, selectLeadingPattern } from './priority'
import { detectSafetyFlags } from './safety'
import { calculateOverallRisk } from './risk'
import { generateClinicalSummary } from './summary'

/**
 * Everything medically-editable the engine needs, injected by the caller
 * (the React layer, which owns the `src/config` imports). The engine itself
 * never imports `src/config` directly — see other files in this folder.
 */
export interface CalculationConfig {
  indicatorList: IndicatorDefinition[]
  referenceRanges: Record<IndicatorId, IndicatorReferenceConfig>
  contours: ContourDefinition[]
  patterns: PatternDefinition[]
  safetyRules: SafetyRuleDefinition[]
  staticSafetyNotes: CalculationResult['generalSafetyNotes']
}

/**
 * Конвейер: показатели → контуры (гл. 5) → паттерны и выбор ведущего (гл. 6).
 * context — клинические отметки врача для правил 7 и 8 раздела 6.3.
 */
export function runCalculation(
  inputs: IndicatorInputs,
  config: CalculationConfig,
  context: PriorityContext = emptyPriorityContext,
): CalculationResult {
  const indicatorResults: IndicatorResult[] = []

  for (const definition of config.indicatorList) {
    const normalized = normalizeIndicator(inputs[definition.id], definition)
    if (normalized === null) continue

    const zone = getZone(normalized, config.referenceRanges[definition.id])
    indicatorResults.push({ id: definition.id, definition, value: normalized, zone, riskScore: getRiskScore(zone) })
  }

  const contourResults = calculateContours(indicatorResults, config.contours)
  const leadingContour = selectLeadingContour(contourResults)
  const { matches: patternMatches, notEvaluated: notEvaluatedPatterns } = detectPatterns(indicatorResults, config.patterns)
  const priority = selectLeadingPattern(patternMatches, context)
  const safetyFlags = detectSafetyFlags(indicatorResults, config.safetyRules)

  const overallRiskLevel = calculateOverallRisk(contourResults, safetyFlags)
  const { briefConclusion, narrativeText } = generateClinicalSummary(priority, leadingContour, contourResults)

  return {
    indicatorResults,
    contourResults,
    leadingContour,
    patternMatches,
    priority,
    notEvaluatedPatterns,
    overallRiskLevel,
    briefConclusion,
    narrativeText,
    safetyFlags,
    generalSafetyNotes: config.staticSafetyNotes,
  }
}
