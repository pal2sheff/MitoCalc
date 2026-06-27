/**
 * Core type system for the МИТОпаспорт calculation engine.
 *
 * These types are intentionally decoupled from React/UI — the engine is a pure
 * data pipeline: indicator values in, structured clinical interpretation out.
 * Medical content (labels, ranges, texts) lives in `src/config/*`, not here.
 */

/** The 15 base МИТО-паспорт indicators. Extend this union to add new indicators. */
export type IndicatorId =
  // Блок 1. Иммунно-клеточный и стрессовый статус
  | 'phagocytosis'
  | 'nst'
  | 'oxidativeStress'
  | 'calciumStress'
  | 'proteinMetabolism'
  | 'mitoActivity'
  | 'nadh'
  // Блок 2. Функциональное состояние митохондриальных комплексов и дыхания (ΔNADH)
  | 'complexI'
  | 'complexII'
  | 'complexIII'
  | 'complexIV'
  | 'complexV'
  | 'mitoMembrane'
  | 'stressReaction'
  | 'nonMitoRespiration'

export type IndicatorBlock = 1 | 2

/** How a raw input value is scaled/displayed. */
export type IndicatorValueType =
  /** 0–100%, monotonic or U-shaped reference bands. */
  | 'absolute'
  /** Bidirectional deviation (ΔNADH %), can be negative or positive. */
  | 'deltaNadh'

export interface IndicatorDefinition {
  id: IndicatorId
  block: IndicatorBlock
  order: number
  label: string
  shortLabel: string
  unit: string
  valueType: IndicatorValueType
  min: number
  max: number
  step: number
  hint: string
  description: string
}

export type ZoneColor = 'green' | 'yellow' | 'orange' | 'red'

export type RiskScore = 0 | 1 | 2 | 3

export interface ReferenceZone {
  /** Stable id within the indicator, e.g. 'severelyLow'. */
  id: string
  label: string
  riskScore: RiskScore
  /** Inclusive lower bound. */
  min: number
  /** Inclusive upper bound. */
  max: number
  /** One-line clinical meaning shown at Level 1. */
  meaning: string
}

export interface IndicatorReferenceConfig {
  indicatorId: IndicatorId
  zones: ReferenceZone[]
  /**
   * True when numeric breakpoints are provisional scaffolding rather than
   * validated clinical thresholds (currently: all ΔNADH/Block 2 indicators).
   * The UI must surface this so a physician knows to calibrate before
   * trusting Level-1 colour coding in isolation.
   */
  isEditablePlaceholder?: boolean
}

export interface IndicatorResult {
  id: IndicatorId
  definition: IndicatorDefinition
  value: number
  zone: ReferenceZone
  riskScore: RiskScore
}

export type DomainCategory =
  | 'норма'
  | 'умеренное напряжение'
  | 'выраженное нарушение'
  | 'критический паттерн'

export interface DomainDefinition {
  id: string
  order: number
  label: string
  indicatorIds: IndicatorId[]
  /** Shown under the domain title — what this domain represents clinically. */
  description: string
  /** Template fragments used to build interpretation text per category. */
  interpretationByCategory: Record<DomainCategory, string>
  nextStep: string
}

export interface DomainResult {
  id: string
  label: string
  description: string
  indicatorIds: IndicatorId[]
  avgRisk: number
  maxRisk: RiskScore
  category: DomainCategory
  interpretation: string
  nextStep: string
}

/** A single leaf condition evaluated against one indicator's computed result. */
export interface IndicatorCondition {
  indicator: IndicatorId
  /** Matches if the indicator's current zone id is one of these. */
  zoneIn?: string[]
  /** Matches if riskScore >= this threshold (any deviation from the calm/optimal/neutral zone is riskScoreMin: 1). */
  riskScoreMin?: RiskScore
}

export interface ConditionGroupAll {
  all: ConditionNode[]
}
export interface ConditionGroupAny {
  any: ConditionNode[]
}
export interface ConditionGroupNone {
  none: ConditionNode[]
}

export type ConditionNode =
  | IndicatorCondition
  | ConditionGroupAll
  | ConditionGroupAny
  | ConditionGroupNone

export type PatternConfidence = 'низкая' | 'средняя' | 'высокая'

export interface PatternDefinition {
  id: string
  order: number
  name: string
  /** Must hold for the pattern to be considered triggered at all. */
  requiredConditions: ConditionNode
  /**
   * Each satisfied entry raises confidence from 'низкая' toward 'высокая'.
   * An entry may itself be an `any`/`all` group (e.g. "any complex abnormal")
   * so it counts as a single weighted signal rather than diluting the ratio
   * across many leaves.
   */
  supportingConditions: ConditionNode[]
  pathophysiology: string
  possibleCauses: string[]
  whatToCheck: string[]
  clinicalMeaning: string
  cautiousStrategy: string
}

export interface PatternMatch {
  pattern: PatternDefinition
  confidence: PatternConfidence
  /** Indicators (required + supporting) that were actually satisfied, for "why triggered". */
  triggeredIndicators: {
    id: IndicatorId
    label: string
    zoneLabel: string
    value: number
  }[]
  supportRatio: number
}

export type SafetyFlagLevel = 'info' | 'warning' | 'critical'

export interface SafetyRuleCondition {
  /** Condition under which this flag should surface; reuses the pattern condition DSL. */
  when: ConditionNode
}

export interface SafetyRuleDefinition extends SafetyRuleCondition {
  id: string
  level: SafetyFlagLevel
  text: string
}

export interface SafetyFlag {
  id: string
  level: SafetyFlagLevel
  text: string
}

export type OverallRiskLevel = 'норма' | 'умеренный риск' | 'высокий риск' | 'критический риск'

export interface CalculationResult {
  indicatorResults: IndicatorResult[]
  domainResults: DomainResult[]
  /** All triggered patterns, sorted by confidence desc, then order. */
  patternMatches: PatternMatch[]
  topPatterns: PatternMatch[]
  leadDomain: DomainResult | null
  overallRiskLevel: OverallRiskLevel
  briefConclusion: string
  narrativeText: string
  safetyFlags: SafetyFlag[]
  generalSafetyNotes: {
    redFlags: string[]
    whenNotToInterpretAlone: string[]
    whenToReferToStandardWorkup: string[]
    generalDisclaimer: string
  }
}

/** Raw input collected from the form: indicator id -> numeric value (or undefined if not entered). */
export type IndicatorInputs = Partial<Record<IndicatorId, number>>

/**
 * Extension point for future composite indices (SRC / резервная дыхательная
 * ёмкость, интегральный митохондриальный индекс, иммунный индекс,
 * стресс-редокс индекс, анаболический индекс, клинический индекс риска).
 * No formulas are implemented yet — these are placeholders so the data model
 * does not need to change when real formulas become available.
 */
export interface DerivedIndexDefinition {
  id: string
  label: string
  status: 'planned' | 'active'
  description: string
}
