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

/** Тяжесть состояния контура: 0 сохранён, 1 наблюдение, 2 изменён, 3 выраженно изменён. */
export type ContourSeverity = 0 | 1 | 2 | 3

export interface ContourStateRule {
  id: string
  label: string
  severity: ContourSeverity
  when: ConditionNode
  /** Пояснение к состоянию, как в таблицах раздела 5.1. */
  text: string
}

export interface ContourNoteRule {
  when: ConditionNode
  text: string
}

/** Функциональный контур (глава 5 пособия). */
export interface ContourDefinition {
  id: string
  order: number
  label: string
  /** На какой вопрос отвечает контур. */
  question: string
  /** К — ключевые показатели по матрице 5.2. */
  keyIndicators: IndicatorId[]
  /** д — дополнительные показатели по матрице 5.2. */
  additionalIndicators: IndicatorId[]
  /** Без этих показателей контур не собирается (раздел 5.6). */
  requiredIndicators: IndicatorId[]
  /** Состояния в порядке проверки: срабатывает первое выполненное. */
  states: ContourStateRule[]
  /** Отдельные находки внутри контура (например, редокс-иммунное рассогласование). */
  notes?: ContourNoteRule[]
  /** Направление поиска, если контур ведущий (раздел 5.4). */
  searchDirection: string
}

export type ContourStatus = 'оценён' | 'оценён частично' | 'не оценён'

export interface ContourResult {
  id: string
  label: string
  question: string
  status: ContourStatus
  /** null, если контур не оценён. */
  state: { id: string; label: string; severity: ContourSeverity; text: string } | null
  missingIndicatorIds: IndicatorId[]
  /** Показатели контура вне целевой зоны или с отклонённой пробой. */
  deviatedIndicators: { id: IndicatorId; label: string; zoneLabel: string }[]
  notes: string[]
  searchDirection: string
}

export interface LeadingContour {
  contour: ContourResult
  /** Какой ориентир раздела 5.4 сработал. */
  reason: string
}

/** A single leaf condition evaluated against one indicator's computed result. */
export interface IndicatorCondition {
  indicator: IndicatorId
  /** Matches if the indicator's current zone id is one of these. */
  zoneIn?: string[]
  /** Matches if riskScore >= this threshold (any deviation from the calm/optimal/neutral zone is riskScoreMin: 1). */
  riskScoreMin?: RiskScore
  /**
   * Необязательный компонент: если показатель не измерен, условие считается
   * выполненным. Нужен для состояний контуров, которые по пособию собираются
   * и при неполном объёме (раздел 5.6), например иммунный контур без кальция.
   */
  ifMeasured?: boolean
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

/**
 * Уровень паттерна по разделу 6.3:
 * A системный контекст, B функциональный контур, C уровень ограничения,
 * D компенсация и резерв, E сохранный профиль.
 */
export type PatternLevel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface PatternSubtypeRule {
  label: string
  when: ConditionNode
}

export interface PatternDefinition {
  id: string
  order: number
  /** Номер паттерна в пособии (1–15). */
  manualNumber: number
  level: PatternLevel
  name: string
  /** «Строка для заключения» из карточки паттерна. */
  conclusionLine: string
  /** Глубина или стадия: проверяются по порядку, берётся первая выполненная. */
  subtypes?: PatternSubtypeRule[]
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
  /** Глубина или стадия паттерна, если определяется по показателям. */
  subtype: string | null
}

/** Паттерн, который при данном объёме исследования нельзя ни подтвердить, ни исключить. */
export interface NotEvaluatedPattern {
  pattern: PatternDefinition
  missingIndicatorIds: IndicatorId[]
}

/** Клинические отметки врача, влияющие на выбор ведущего паттерна (правила 7 и 8). */
export interface PriorityContext {
  /** Паттерны уровня A, подтверждённые клиникой (правило 8). */
  confirmedSystemic: string[]
  /** Паттерны, полностью объяснимые условиями забора или недавним событием (правило 7). */
  explainedByEvent: string[]
}

export interface PatternPriority {
  leading: PatternMatch | null
  /** Почему выбран именно этот паттерн (или почему ведущего нет). */
  leadingReason: string
  /** Остальные активные паттерны: проявления и уточнения ведущего. */
  manifestations: PatternMatch[]
  /** Активные паттерны уровня A без подтверждения клиникой. */
  unconfirmedSystemic: PatternMatch[]
  /** Исключённые из выбора ведущего по правилу 7. */
  explainedByEvent: PatternMatch[]
  /** Применённые правила, в виде строк для врача. */
  appliedRules: string[]
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
  /** Шесть функциональных контуров (глава 5). */
  contourResults: ContourResult[]
  /** Ведущий контур по ориентирам раздела 5.4; null, если изменённых контуров нет. */
  leadingContour: LeadingContour | null
  /** Все активированные паттерны в порядке уровня A→E, внутри уровня по номеру. */
  patternMatches: PatternMatch[]
  /** Выбор ведущего паттерна по правилам раздела 6.3. */
  priority: PatternPriority
  /** Паттерны без оценки из-за неполного объёма исследования (правило 6 раздела 6.3). */
  notEvaluatedPatterns: NotEvaluatedPattern[]
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
