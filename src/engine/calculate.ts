import type {
  CalculationResult,
  ClinicalContext,
  ClinicalFindingDefinition,
  InfectionPeriodDefinition,
  PairHintDefinition,
  PanelDefinition,
  PreanalyticItem,
  RedFlagDefinition,
  ContourDefinition,
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
import { calculateContours, selectLeadingContour } from './contours'
import { detectPatterns } from './patterns'
import { selectLeadingPattern } from './priority'
import { applyInfectionStage, evaluatePreanalytics, resolvePanel } from './study'
import { detectRedFlags } from './redFlags'
import { detectPairHints } from './pairHints'
import { buildWorkup, calculateCbcIndices, type WorkupConfig } from './workup'
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
  panels: PanelDefinition[]
  preanalyticItems: PreanalyticItem[]
  infectionPeriods: InfectionPeriodDefinition[]
  clinicalFindings: ClinicalFindingDefinition[]
  redFlags: RedFlagDefinition[]
  workup: WorkupConfig
  nlrBands: { max: number; text: string }[]
  garkaviBands: { maxPct: number; type: string }[]
  pairHints: PairHintDefinition[]
}

export const emptyClinicalContext: ClinicalContext = {
  confirmedSystemic: [],
  explainedByEvent: [],
  panel: 'auto',
  preanalytics: [],
  infectionPeriod: 'none',
  clinicalFindings: [],
  situations: [],
  cbc: {},
}

/**
 * Конвейер: комплектация → показатели → контуры (гл. 5) → паттерны и выбор
 * ведущего (гл. 6) → красные флаги (9.3) → план обследования (гл. 7).
 * context — всё, что врач вводит помимо чисел: комплектация, условия забора,
 * анамнез, отметки для правил 7 и 8, данные ОАК.
 */
export function runCalculation(
  rawInputs: IndicatorInputs,
  config: CalculationConfig,
  context: ClinicalContext = emptyClinicalContext,
): CalculationResult {
  const { filteredInputs: inputs, panel } = resolvePanel(rawInputs, context, config.panels)
  const indicatorResults: IndicatorResult[] = []

  for (const definition of config.indicatorList) {
    const normalized = normalizeIndicator(inputs[definition.id], definition)
    if (normalized === null) continue

    const zone = getZone(normalized, config.referenceRanges[definition.id])
    indicatorResults.push({ id: definition.id, definition, value: normalized, zone, riskScore: getRiskScore(zone) })
  }

  const contourResults = calculateContours(indicatorResults, config.contours)
  const leadingContour = selectLeadingContour(contourResults)
  const detection = detectPatterns(indicatorResults, config.patterns)
  const patternMatches = applyInfectionStage(detection.matches, context, config.infectionPeriods)
  const notEvaluatedPatterns = detection.notEvaluated
  const priority = selectLeadingPattern(patternMatches, context)
  const safetyFlags = detectSafetyFlags(indicatorResults, config.safetyRules)

  const preanalytics = evaluatePreanalytics(context, config.preanalyticItems, config.infectionPeriods, patternMatches)
  const study = { panel, preanalytics }
  const redFlags = detectRedFlags(indicatorResults, contourResults, context, config.redFlags)

  const orderedPatterns = [...(priority.leading ? [priority.leading] : []), ...priority.manifestations]
  const workup = buildWorkup(indicatorResults, orderedPatterns, context, config.workup)
  const cbcIndices = calculateCbcIndices(context, indicatorResults, config.nlrBands, config.garkaviBands)

  const overallRiskLevel = calculateOverallRisk(contourResults, safetyFlags, redFlags)
  const { briefConclusion, narrativeText } = generateClinicalSummary(priority, leadingContour, contourResults, study, redFlags)

  return {
    indicatorResults,
    contourResults,
    leadingContour,
    patternMatches,
    priority,
    notEvaluatedPatterns,
    study,
    redFlags,
    workup,
    cbcIndices,
    pairHints: detectPairHints(indicatorResults, config.pairHints),
    overallRiskLevel,
    briefConclusion,
    narrativeText,
    safetyFlags,
    generalSafetyNotes: config.staticSafetyNotes,
  }
}
