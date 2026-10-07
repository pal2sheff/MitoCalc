import type {
  CalculationResult,
  DomainDefinition,
  IndicatorDefinition,
  IndicatorId,
  IndicatorInputs,
  IndicatorReferenceConfig,
  IndicatorResult,
  PatternDefinition,
  SafetyRuleDefinition,
} from './types'
import { normalizeIndicator } from './normalize'
import { getRiskScore, getZone } from './zones'
import { calculateDomains } from './domains'
import { detectPatterns } from './patterns'
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
  domains: DomainDefinition[]
  patterns: PatternDefinition[]
  safetyRules: SafetyRuleDefinition[]
  staticSafetyNotes: CalculationResult['generalSafetyNotes']
}

/** Top-level pipeline: raw form inputs -> full three-level clinical interpretation. */
export function runCalculation(inputs: IndicatorInputs, config: CalculationConfig): CalculationResult {
  const indicatorResults: IndicatorResult[] = []

  for (const definition of config.indicatorList) {
    const normalized = normalizeIndicator(inputs[definition.id], definition)
    if (normalized === null) continue

    const zone = getZone(normalized, config.referenceRanges[definition.id])
    indicatorResults.push({ id: definition.id, definition, value: normalized, zone, riskScore: getRiskScore(zone) })
  }

  const domainResults = calculateDomains(indicatorResults, config.domains)
  const { matches: patternMatches, notEvaluated: notEvaluatedPatterns } = detectPatterns(indicatorResults, config.patterns)
  const safetyFlags = detectSafetyFlags(indicatorResults, config.safetyRules)

  const topPatterns = patternMatches.slice(0, 3)
  const leadDomain = domainResults.find((d) => d.evaluated && d.avgRisk > 0) ?? null
  const overallRiskLevel = calculateOverallRisk(domainResults, patternMatches, safetyFlags)
  const { briefConclusion, narrativeText } = generateClinicalSummary(overallRiskLevel, leadDomain, topPatterns)

  return {
    indicatorResults,
    domainResults,
    patternMatches,
    topPatterns,
    notEvaluatedPatterns,
    leadDomain,
    overallRiskLevel,
    briefConclusion,
    narrativeText,
    safetyFlags,
    generalSafetyNotes: config.staticSafetyNotes,
  }
}
