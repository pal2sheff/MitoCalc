import type {
  ClinicalFindingDefinition,
  ClinicalSituationDefinition,
  InfectionPeriodDefinition,
  PreanalyticItem,
} from '@/engine/types'

/**
 * Условия забора и события предшествующих недель (пособие, раздел 1.1).
 *
 * mayExplainPatterns — подсказка к правилу 7 раздела 6.3: какие паттерны
 * событие может объяснить. Это рабочее соответствие калькулятора, а не
 * таблица пособия; решение об исключении паттерна принимает врач.
 */
export const preanalyticItems: PreanalyticItem[] = [
  { id: 'lateSampling', label: 'Забор позже 10:00', conclusionText: 'забор позже 10 часов', mayExplainPatterns: [] },
  { id: 'notFasting', label: 'Не натощак (менее 8 ч без пищи)', conclusionText: 'забор не натощак', mayExplainPatterns: [] },
  { id: 'noRest', label: 'Без 15 минут покоя перед забором', conclusionText: 'забор без предварительного покоя', mayExplainPatterns: [] },
  {
    id: 'afterProcedures',
    label: 'Забор после процедур или приёма препаратов',
    conclusionText: 'забор после процедур или приёма препаратов',
    mayExplainPatterns: [],
  },
  {
    id: 'feverAcuteInfection',
    label: 'Лихорадка или острый период инфекции',
    conclusionText: 'забор на фоне лихорадки или острого периода инфекции',
    mayExplainPatterns: [2, 3, 14],
  },
  {
    id: 'recentVaccination',
    label: 'Вакцинация в последние дни',
    conclusionText: 'недавняя вакцинация',
    mayExplainPatterns: [2, 14],
  },
  {
    id: 'intenseExercise',
    label: 'Интенсивная физическая нагрузка в последние 3 суток',
    conclusionText: 'интенсивная физическая нагрузка в предшествующие трое суток',
    mayExplainPatterns: [3, 12, 13],
  },
  {
    id: 'systemicGlucocorticoids',
    label: 'Системная терапия глюкокортикоидами',
    conclusionText: 'системная терапия глюкокортикоидами',
    mayExplainPatterns: [1, 5, 13],
  },
  {
    id: 'surgeryTrauma',
    label: 'Операция или травма в предшествующие недели',
    conclusionText: 'операция или травма в предшествующие недели',
    mayExplainPatterns: [2, 3, 5, 14],
  },
  {
    id: 'sleepDeprivation',
    label: 'Выраженный недосып или ночная смена накануне',
    conclusionText: 'недосып накануне исследования',
    mayExplainPatterns: [13],
  },
]

/** Срок от перенесённой инфекции — стадии паттерна 14 (раздел 6.2). */
export const infectionPeriods: InfectionPeriodDefinition[] = [
  { id: 'none', label: 'Инфекции в последние месяцы не было или нет данных', stage14: null, conclusionText: null, mayExplainPatterns: [] },
  {
    id: 'acute',
    label: 'Острая или ранняя постинфекционная фаза (до 4 недель)',
    stage14: 'Острая и ранняя постинфекционная стадия. Тактика: наблюдение, повтор через 4–6 недель.',
    conclusionText: 'перенесённая инфекция в предшествующие 4 недели',
    mayExplainPatterns: [2, 14],
  },
  {
    id: 'prolonged',
    label: 'Затянувшееся восстановление (1–3 месяца)',
    stage14: 'Затянувшаяся стадия, 1–3 месяца. Тактика: поиск сохраняющегося очага, нутритивная поддержка.',
    conclusionText: 'инфекция 1–3 месяца назад',
    mayExplainPatterns: [],
  },
  {
    id: 'chronic',
    label: 'Более 3 месяцев после инфекции или хроническое воспаление',
    stage14: 'Хроническая стадия, свыше 3 месяцев. Тактика: систематический поиск очага, поэтапная коррекция.',
    conclusionText: 'инфекция более 3 месяцев назад или хронический воспалительный процесс',
    mayExplainPatterns: [],
  },
]

/** Клинические находки для красных флагов (раздел 9.3). */
export const clinicalFindings: ClinicalFindingDefinition[] = [
  { id: 'recurrentInfections', label: 'Рецидивирующие инфекции, абсцессы, длительное заживление' },
  { id: 'purulentFungal', label: 'Гнойные или грибковые инфекции, гранулематозное воспаление' },
  { id: 'neutropenia', label: 'Нейтропения в общем анализе крови' },
  {
    id: 'neuromuscular',
    label: 'Мышечная слабость, птоз, непереносимость нагрузки, нарушение слуха или зрения, отягощённый семейный анамнез',
  },
  { id: 'constitutional', label: 'Немотивированная потеря веса, лихорадка, ночная потливость, лимфаденопатия' },
  { id: 'immunosuppressiveTherapy', label: 'Противоопухолевая, иммуносупрессивная или противовирусная терапия' },
]

/** Клиническая ситуация → наиболее информативные показатели (таблица 7.4). */
export const clinicalSituations: ClinicalSituationDefinition[] = [
  {
    id: 'fatigue',
    label: 'Хроническая усталость без явной причины',
    indicatorIds: ['mitoActivity', 'nadh', 'stressReaction', 'nonMitoRespiration', 'proteinMetabolism'],
  },
  { id: 'exerciseIntolerance', label: 'Плохая переносимость нагрузки', indicatorIds: ['stressReaction', 'nonMitoRespiration', 'mitoActivity'] },
  { id: 'recurrentInfections', label: 'Рецидивирующие инфекции', indicatorIds: ['phagocytosis', 'nst', 'proteinMetabolism', 'oxidativeStress'] },
  {
    id: 'postInfection',
    label: 'Затяжное восстановление после инфекции',
    indicatorIds: ['oxidativeStress', 'mitoActivity', 'phagocytosis', 'proteinMetabolism'],
  },
  {
    id: 'metabolicSyndrome',
    label: 'Метаболический синдром, инсулинорезистентность',
    indicatorIds: ['nadh', 'oxidativeStress', 'nonMitoRespiration', 'mitoMembrane'],
  },
  { id: 'obesity', label: 'Ожирение и метаболическое воспаление', indicatorIds: ['oxidativeStress', 'calciumStress', 'nst', 'nadh'] },
  {
    id: 'chronicInflammatory',
    label: 'Хроническое воспалительное заболевание',
    indicatorIds: ['oxidativeStress', 'calciumStress', 'phagocytosis', 'nst', 'mitoActivity'],
  },
  {
    id: 'hypoxia',
    label: 'Подозрение на гипоксию, апноэ сна',
    indicatorIds: ['nadh', 'complexIII', 'complexIV', 'nonMitoRespiration', 'oxidativeStress'],
  },
  { id: 'sarcopenia', label: 'Саркопения, снижение мышечной массы', indicatorIds: ['proteinMetabolism', 'mitoActivity', 'stressReaction'] },
  {
    id: 'glucocorticoids',
    label: 'Длительный приём глюкокортикоидов',
    indicatorIds: ['phagocytosis', 'nst', 'stressReaction', 'proteinMetabolism'],
  },
  {
    id: 'surgeryPrep',
    label: 'Подготовка к плановой операции',
    indicatorIds: ['stressReaction', 'mitoActivity', 'phagocytosis', 'oxidativeStress'],
  },
]
