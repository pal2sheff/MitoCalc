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
  /** «Типичная ошибка» из карточки показателя (глава 3). */
  typicalError?: string
  /** «Что могло изменить результат временно» (глава 3). */
  temporaryFactors?: string
  /** Комментарий бланка, требующий осторожности, не привязанный к зоне (раздел 1.8). */
  blankNote?: string
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
  /** «Первое действие» для зоны (таблицы зон главы 3). */
  firstAction?: string
  /** Формулировка бланка для этой зоны, которую нельзя переносить в заключение (раздел 1.8). */
  blankNote?: string
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
  /** «Исключить прежде всего» из таблицы 7.3. */
  excludeFirst: string
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

// ---------------------------------------------------------------------------
// Клинический контекст (этап 3): комплектация, условия забора, анамнез, ОАК
// ---------------------------------------------------------------------------

export type PanelId = 'light' | 'standart' | 'pro' | 'max'

export interface PanelDefinition {
  id: PanelId
  label: string
  /** Показатели, входящие в комплектацию. */
  indicatorIds: IndicatorId[]
  /** Показатели, которые встречаются в части отчётов этой комплектации (Pro с комплексом III). */
  optionalIndicatorIds: IndicatorId[]
  notes: string[]
}

export type InfectionPeriod = 'none' | 'acute' | 'prolonged' | 'chronic'

export interface CbcInputs {
  /** Доля лимфоцитов в лейкоформуле, %. */
  lymphocytesPct?: number
  /** Абсолютное число нейтрофилов, ×10⁹/л. */
  neutrophilsAbs?: number
  /** Абсолютное число лимфоцитов, ×10⁹/л. */
  lymphocytesAbs?: number
}

/** Всё, что врач вводит помимо чисел МИТОпаспорта. */
export interface ClinicalContext extends PriorityContext {
  /** 'auto' — комплектация определяется по введённым показателям. */
  panel: PanelId | 'auto'
  /** Отмеченные нарушения условий забора и события предшествующих недель. */
  preanalytics: string[]
  infectionPeriod: InfectionPeriod
  /** Клинические находки для красных флагов раздела 9.3. */
  clinicalFindings: string[]
  /** Клинические ситуации из таблицы 7.4. */
  situations: string[]
  cbc: CbcInputs
  /** Дата исследования, свободный текст. */
  studyDate?: string
  /** Цель повторного исследования (таблица 8.3), id из controlGoals. */
  controlGoal?: string
}

export interface PreanalyticItem {
  id: string
  label: string
  /** Строка для раздела «Условия исследования» заключения. */
  conclusionText: string
  /** Номера паттернов, которые это событие может объяснить (подсказка к правилу 7). */
  mayExplainPatterns: number[]
}

export interface InfectionPeriodDefinition {
  id: InfectionPeriod
  label: string
  /** Стадия паттерна 14 и тактика (таблица стадий в разделе 6.2). */
  stage14: string | null
  conclusionText: string | null
  mayExplainPatterns: number[]
}

export interface ClinicalFindingDefinition {
  id: string
  label: string
}

/** Красный флаг раздела 9.3: числовое условие и клиническая находка. */
export interface RedFlagDefinition {
  id: string
  finding: string
  exclude: string
  action: string
  /** Числовое условие по показателям; если не задано, флаг зависит только от клиники. */
  when?: ConditionNode
  /** Альтернатива when: хотя бы один контур с тяжестью не ниже указанной. */
  contourSeverityMin?: ContourSeverity
  /** Клиническая находка (id из clinicalFindings), без которой флаг не срабатывает. */
  requiresFinding?: string
  /** Считать нейтропенией абсолютное число нейтрофилов ниже порога, ×10⁹/л. */
  neutropeniaBelow?: number
  /** Текст подсказки, если числовое условие выполнено, а клиника не отмечена. */
  checkPrompt?: string
}

export interface RedFlagResult {
  id: string
  /** confirmed — условие и клиника совпали; check — проверить клинику. */
  status: 'confirmed' | 'check'
  finding: string
  exclude: string
  action: string
  prompt?: string
}

export interface IndicatorWorkup {
  firstLine: string[]
  secondLine: string[]
}

export interface ClinicalSituationDefinition {
  id: string
  label: string
  indicatorIds: IndicatorId[]
}

export interface WorkupPlan {
  baseSet: string[]
  baseSetExtension: string
  byIndicator: { id: IndicatorId; label: string; zoneLabel: string; firstLine: string[]; secondLine: string[] }[]
  byPattern: { manualNumber: number; name: string; excludeFirst: string; analyses: string[] }[]
  situations: {
    id: string
    label: string
    indicators: { id: IndicatorId; label: string; zoneLabel: string | null; deviated: boolean }[]
  }[]
}

export interface CbcIndices {
  nlr: { value: number; interpretation: string } | null
  garkavi: { type: string; lymphocytesPct: number } | null
  notes: string[]
}

export interface StudyContextResult {
  panel: {
    id: PanelId | 'custom'
    label: string
    /** true — определена по введённым показателям, false — выбрана врачом. */
    detected: boolean
    ignoredIndicatorIds: IndicatorId[]
    notes: string[]
  }
  preanalytics: {
    items: { id: string; label: string; conclusionText: string }[]
    /** Есть факторы, ограничивающие интерпретацию. */
    limited: boolean
    /** Подсказки к правилу 7: активные паттерны, которые может объяснить отмеченное событие. */
    rule7Hints: { patternId: string; manualNumber: number; reasons: string[] }[]
    conclusionLine: string
  }
}

// ---------------------------------------------------------------------------
// Этап 4: динамика (глава 8) и заключение (раздел 9.2)
// ---------------------------------------------------------------------------

export interface ControlGoalDefinition {
  id: string
  label: string
  term: string
}

export interface ComparabilityItem {
  id: string
  label: string
}

export interface BetweenStudiesEvent {
  id: string
  label: string
}

/** Что врач вводит для сравнения двух отчётов. */
export interface DynamicsContext {
  /** Отмеченные условия сопоставимости (раздел 8.1). Неотмеченное — не воспроизведено. */
  comparability: string[]
  /** Что происходило между исследованиями (шаг 6 раздела 8.6). */
  betweenEvents: string[]
  previousDate?: string
}

export interface IndicatorChange {
  id: IndicatorId
  label: string
  before: number
  after: number
  zoneBefore: string
  zoneAfter: string
  kind: 'zoneChange' | 'signChange' | 'withinZone'
  /** К целевой зоне или от неё; null для изменений внутри зоны. */
  direction: 'toward' | 'away' | null
}

export interface ContourChange {
  id: string
  label: string
  stateBefore: string | null
  stateAfter: string | null
  direction: 'improved' | 'worsened' | 'same' | 'notComparable'
  /** Согласованный сдвиг двух-трёх показателей контура без перехода зон. */
  coordinatedShift: 'toward' | 'away' | null
}

export type DynamicsType =
  | 'Улучшение'
  | 'Адаптация'
  | 'Компенсация'
  | 'Перегрузка'
  | 'Ухудшение'
  | 'Восстановление после болезни'
  | 'Временная реакция'
  | 'Без значимой динамики'
  | 'Смешанная динамика'

export interface DynamicsResult {
  comparable: boolean
  notReproduced: string[]
  notes: string[]
  indicatorChanges: IndicatorChange[]
  contourChanges: ContourChange[]
  /** Три вопроса раздела 8.5. null — не оценено. */
  checks: { compensationGrew: boolean | null; backgroundGrew: boolean | null; stressProbeImproved: boolean | null }
  /** Сработавшие варианты «показатель улучшился, контур ухудшился» (8.5). */
  traps: string[]
  type: DynamicsType
  meaning: string
  tactics: string
  /** Прогрессирующее ухудшение всех контуров при адекватном лечении (красный флаг 9.3). */
  progressiveWorsening: boolean
  conclusionText: string
}

export interface ForbiddenPhraseRule {
  id: string
  pattern: string
  message: string
}

export interface ForbiddenPhraseHit {
  id: string
  match: string
  message: string
}

/** Сочетание двух-трёх показателей и первая гипотеза («Сочетания внутри анализа», глава 3). */
export interface PairHintDefinition {
  id: string
  when: ConditionNode
  text: string
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

/** Сводная степень функциональных изменений для шапки экрана (не клиническая категория пособия). */
export type OverallRiskLevel =
  | 'без значимых изменений'
  | 'умеренные изменения'
  | 'выраженные изменения'
  | 'красный флаг: профильное обследование'

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
  /** Комплектация и условия исследования. */
  study: StudyContextResult
  /** Красные флаги раздела 9.3. */
  redFlags: RedFlagResult[]
  /** План обследования по главе 7. */
  workup: WorkupPlan
  /** Индексы из ОАК (раздел 7.5). */
  cbcIndices: CbcIndices
  /** Сработавшие сочетания показателей с первой гипотезой (глава 3). */
  pairHints: { id: string; text: string }[]
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
