import type { SafetyRuleDefinition } from '@/engine/types'

/**
 * Editable medical config layer — safety layer (Level 2/3 cross-cutting).
 *
 * `dynamicSafetyRules` are evaluated against this patient's indicator
 * results (operationalising clinical rules 4–6 from the project brief:
 * oxidative-stress caution, membrane-first sequencing, inflammation-before-
 * mitochondrial-insufficiency). `staticSafetyNotes` are universal reminders
 * shown regardless of input — they describe the calculator's scope limits,
 * not this patient's numbers.
 */
export const dynamicSafetyRules: SafetyRuleDefinition[] = [
  {
    id: 'highOxidativeStressCaution',
    level: 'warning',
    when: { indicator: 'oxidativeStress', zoneIn: ['high'] },
    text:
      'Выявлен высокий оксидативный стресс — не следует автоматически рекомендовать агрессивные энерготропные стимуляторы. Целесообразно сначала оценить мембраны, воспаление, антиоксидантную защиту, гипоксию, токсическую нагрузку и восстановление.',
  },
  {
    id: 'pronouncedMembranePattern',
    level: 'warning',
    when: { indicator: 'mitoMembrane', riskScoreMin: 3 },
    text:
      'Выраженный мембранный сдвиг — приоритет: стабилизация мембран и снижение повреждающих факторов, затем осторожная и постепенная поддержка энергетического обмена.',
  },
  {
    id: 'inflammatoryContextCaution',
    level: 'warning',
    when: {
      all: [
        { any: [{ indicator: 'phagocytosis', zoneIn: ['hyperactivation'] }, { indicator: 'nst', zoneIn: ['severeHyperactivation'] }] },
        { indicator: 'calciumStress', zoneIn: ['stress'] },
        { indicator: 'oxidativeStress', zoneIn: ['high'] },
      ],
    },
    text:
      'Признаки активного иммунно-воспалительного паттерна — сниженную митохондриальную активность не следует трактовать как первичную митохондриальную недостаточность без учёта воспалительного/инфекционного процесса.',
  },
  {
    id: 'severeEnergeticCombination',
    level: 'critical',
    when: {
      all: [
        { indicator: 'oxidativeStress', zoneIn: ['high'] },
        { indicator: 'mitoMembrane', riskScoreMin: 3 },
        { indicator: 'mitoActivity', zoneIn: ['severelyLow'] },
      ],
    },
    text:
      'Сочетание выраженного оксидативного стресса, нарушения мембраны и резко сниженной митохондриальной активности — рассмотреть приоритетную очную оценку и расширенное обследование до содержательных клинических решений.',
  },
]

export const staticSafetyNotes = {
  redFlags: [
    'Острое тяжёлое состояние, быстрое ухудшение самочувствия',
    'Выраженная клиническая симптоматика, не объяснимая находками МИТО-паспорта',
    'Подозрение на острый инфекционный, аутоиммунный или онкологический процесс',
    'Признаки органной недостаточности (печёночной, почечной, сердечной, дыхательной)',
    'Беременность — интерпретация требует дополнительной осторожности и привлечения профильных специалистов',
  ],
  whenNotToInterpretAlone: [
    'МИТО-паспорт не интерпретируется в отрыве от жалоб, анамнеза и объективного осмотра',
    'Результат не заменяет стандартные лабораторные и инструментальные исследования',
    'Изолированное отклонение одного показателя без учёта остальных и клинической картины не является основанием для выводов',
    'Без учёта приёма лекарственных препаратов, БАД, недавних инфекций, тренировочной нагрузки и сна интерпретация может быть искажена',
    'У физически активных пациентов часть отклонений может быть адаптационной — но только при хорошем восстановлении, нормальном самочувствии и отсутствии признаков перетренированности',
  ],
  whenToReferToStandardWorkup: [
    'При любых red-flag симптомах — стандартное дообследование и очная оценка приоритетнее интерпретации МИТО-паспорта',
    'При подозрении на эндокринную, гематологическую, инфекционную или аутоиммунную патологию — направить на соответствующую стандартную диагностику',
    'При выраженных и/или множественных критических паттернах — рассмотреть приоритетную очную консультацию и расширенное лабораторное обследование',
  ],
  generalDisclaimer:
    'МИТОпаспорт — вспомогательный инструмент формирования клинической гипотезы. Он не ставит диагноз, не назначает лечение и не заменяет врачебное мышление, жалобы, анамнез, осмотр и стандартные методы диагностики.',
}
