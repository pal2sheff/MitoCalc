import type { IndicatorId, PanelDefinition } from '@/engine/types'

/**
 * Комплектации панели (пособие, раздел 1.6).
 * Состав проверяется по бланку: в отчётах разных периодов MITO Pro
 * встречается и с пробой комплекса III.
 */
const LIGHT: IndicatorId[] = ['phagocytosis', 'nst', 'oxidativeStress', 'proteinMetabolism', 'mitoActivity']
const STANDART: IndicatorId[] = [...LIGHT, 'calciumStress', 'nadh']
const PRO: IndicatorId[] = [...STANDART, 'complexI', 'complexV', 'mitoMembrane', 'stressReaction', 'nonMitoRespiration']
const MAX: IndicatorId[] = [...PRO, 'complexII', 'complexIII', 'complexIV']

const NO_RESERVE =
  'Функциональных проб нет: резерв и компенсация не оцениваются. Вывод о резерве не формулируется — не потому что он сохранён, а потому что не измерялся.'

export const panels: PanelDefinition[] = [
  {
    id: 'light',
    label: 'MITO Light (ФАН)',
    indicatorIds: LIGHT,
    optionalIndicatorIds: [],
    notes: [
      'Нет кальциевого стресса и НАДН — именно тех показателей, которые связывают иммунный контур с энергетическим.',
      NO_RESERVE,
    ],
  },
  {
    id: 'standart',
    label: 'MITO Standart',
    indicatorIds: STANDART,
    optionalIndicatorIds: [],
    notes: [
      'НАДН в MITO Standart выражен в условных единицах, в Pro и Max — в процентах. До разъяснения лаборатории значения разных комплектаций при оценке динамики напрямую не сопоставляются.',
      NO_RESERVE,
    ],
  },
  {
    id: 'pro',
    label: 'MITO Pro',
    indicatorIds: PRO,
    optionalIndicatorIds: ['complexIII'],
    notes: ['Паттерны 9 и 10 не оцениваются. При наличии пробы комплекса III дополнительно оцениваются паттерны 3, 7 и 10.'],
  },
  {
    id: 'max',
    label: 'MITO Max',
    indicatorIds: MAX,
    optionalIndicatorIds: [],
    notes: [],
  },
]
