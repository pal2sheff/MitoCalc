import type { ConditionNode, PairHintDefinition } from '@/engine/types'
import { below, calciumAbove, inTarget, maPreserved, nadhAbove, nadhBelow, nstAbove, oxidativeAbove, phagoAbove } from './zoneGroups'

/**
 * Сочетания внутри анализа (пособие, глава 3): пара или тройка показателей
 * и первая гипотеза. Повторяющиеся в разных карточках сочетания сведены в
 * одну запись. Это подсказка для разбора, а не паттерн: выбор ведущего
 * механизма — по главе 6.
 */
const proteinAbove: ConditionNode = { indicator: 'proteinMetabolism', zoneIn: ['elevated'] }
const maAbove: ConditionNode = { indicator: 'mitoActivity', zoneIn: ['high'] }

export const pairHints: PairHintDefinition[] = [
  {
    id: 'phagoLowNstNormal',
    when: { all: [below('phagocytosis'), inTarget('nst')] },
    text: 'Фагоцитоз ↓ при нормальном НСТ: снижена готовность к захвату при сохранной кислородзависимой функции. Чаще нутритивный, стрессовый или поствирусный контекст.',
  },
  {
    id: 'phagoLowNstLow',
    when: { all: [below('phagocytosis'), below('nst')] },
    text: 'Фагоцитоз ↓ + НСТ ↓: иммунная гипореактивность, более глубокое функциональное снижение врождённого ответа.',
  },
  {
    id: 'phagoProteinMaLow',
    when: { all: [below('phagocytosis'), below('proteinMetabolism'), below('mitoActivity')] },
    text: 'Фагоцитоз ↓ + белковый обмен ↓ + митохондриальная активность ↓: общая клеточная гипофункция, а не изолированная иммунная проблема.',
  },
  {
    id: 'immuneCalciumUp',
    when: { all: [phagoAbove, nstAbove, calciumAbove] },
    text: 'Фагоцитоз ↑ + НСТ ↑ + кальциевый стресс ↑: активированный врождённый иммунный ответ, активный воспалительный контур.',
  },
  {
    id: 'phagoOxUp',
    when: { all: [phagoAbove, oxidativeAbove] },
    text: 'Фагоцитоз ↑ + оксидативный стресс ↑: активация на фоне высокой редокс-нагрузки.',
  },
  {
    id: 'nstLowOxUp',
    when: { all: [below('nst'), oxidativeAbove] },
    text: 'НСТ ↓ + оксидативный стресс ↑: редокс-иммунное рассогласование — высокая фоновая окислительная нагрузка при слабом управляемом ответе.',
  },
  {
    id: 'nstUpOxUp',
    when: { all: [nstAbove, oxidativeAbove] },
    text: 'НСТ ↑ + оксидативный стресс ↑: воспалительно-редоксная активация.',
  },
  {
    id: 'nstMaProteinLow',
    when: { all: [below('nst'), below('mitoActivity'), below('proteinMetabolism')] },
    text: 'НСТ ↓ + митохондриальная активность ↓ + белковый обмен ↓: системное снижение функциональной активности клеток.',
  },
  {
    id: 'oxUpMaLow',
    when: { all: [oxidativeAbove, below('mitoActivity')] },
    text: 'Оксидативный стресс ↑ + митохондриальная активность ↓: накопление окислительного повреждения с ограничением энергетической функции.',
  },
  {
    id: 'oxUpNadhUp',
    when: { all: [oxidativeAbove, nadhAbove] },
    text: 'Оксидативный стресс ↑ + НАДН ↑: редокс-перегрузка — восстановительных эквивалентов больше, чем клетка способна безопасно окислить.',
  },
  {
    id: 'oxUpCaUp',
    when: { all: [oxidativeAbove, calciumAbove] },
    text: 'Оксидативный стресс ↑ + кальциевый стресс ↑: кальциево-редоксная перегрузка, клеточная активация перешла в перегрузку, механизмы усиливают друг друга.',
  },
  {
    id: 'oxUpProteinLow',
    when: { all: [oxidativeAbove, below('proteinMetabolism')] },
    text: 'Оксидативный стресс ↑ + белковый обмен ↓: стрессовое подавление синтетической активности.',
  },
  {
    id: 'caUpProteinUp',
    when: { all: [calciumAbove, proteinAbove] },
    text: 'Кальциевый стресс ↑ + белковый обмен ↑: активированный клеточный фенотип с высокой функциональной нагрузкой.',
  },
  {
    id: 'caUpMaLow',
    when: { all: [calciumAbove, below('mitoActivity')] },
    text: 'Кальциевый стресс ↑ + митохондриальная активность ↓: перегрузка при сниженной буферной ёмкости митохондрий.',
  },
  {
    id: 'proteinUpResourceOk',
    when: { all: [proteinAbove, maPreserved, inTarget('nadh', true), inTarget('oxidativeStress')] },
    text: 'Белковый обмен ↑ при сохранной энергетике: функциональная активация с достаточным ресурсом.',
  },
  {
    id: 'proteinUpOxCaUp',
    when: { all: [proteinAbove, oxidativeAbove, calciumAbove] },
    text: 'Белковый обмен ↑ + оксидативный стресс ↑ + кальциевый стресс ↑: напряжённая активация, риск последующего истощения.',
  },
  {
    id: 'proteinUpImmuneUp',
    when: { all: [proteinAbove, nstAbove, phagoAbove] },
    text: 'Белковый обмен ↑ + НСТ ↑ + фагоцитоз ↑: иммунная активация.',
  },
  {
    id: 'maUpOxCaUp',
    when: { all: [maAbove, oxidativeAbove, calciumAbove] },
    text: 'Митохондриальная активность ↑ + оксидативный стресс ↑ + кальциевый стресс ↑: энергетическая перегрузка на фоне активации.',
  },
  {
    id: 'maLowNadhLow',
    when: { all: [below('mitoActivity'), nadhBelow] },
    text: 'Митохондриальная активность ↓ + НАДН ↓: общее снижение метаболизма — образование и использование эквивалентов снижены совместно, либо перехват НАДН альтернативным путём.',
  },
  {
    id: 'maLowNadhUp',
    when: { all: [below('mitoActivity'), nadhAbove] },
    text: 'Митохондриальная активность ↓ + НАДН ↑: образование опережает окисление, ограничение на уровне дыхательной цепи.',
  },
  {
    id: 'maNormNadhUp',
    when: { all: [{ indicator: 'mitoActivity', zoneIn: ['target'] }, nadhAbove] },
    text: 'Митохондриальная активность в норме + НАДН ↑: субстратная перегрузка при работающей энергетике, окисление не успевает за притоком.',
  },
  {
    id: 'maNormNadhLow',
    when: { all: [{ indicator: 'mitoActivity', zoneIn: ['target'] }, nadhBelow] },
    text: 'Митохондриальная активность в норме + НАДН ↓: ускоренный расход — обходные пути либо недостаточное поступление субстратов. Уточняется по функциональным пробам.',
  },
]
