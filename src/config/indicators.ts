import type { IndicatorDefinition, IndicatorId } from '@/engine/types'

/**
 * Editable medical config layer — indicator catalogue.
 *
 * This file defines WHAT is measured (labels, units, hints) but not the
 * reference zones/colors — those live in `referenceRanges.ts` so a physician
 * can recalibrate thresholds without touching labels or vice versa.
 */
export const indicators: Record<IndicatorId, IndicatorDefinition> = {
  // ---- Блок 1. Иммунно-клеточный и стрессовый статус ----
  phagocytosis: {
    id: 'phagocytosis',
    block: 1,
    order: 1,
    label: 'Фагоцитоз (латексный тест)',
    shortLabel: 'Фагоцитоз',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Доля фагоцитов, захватывающих частицы — базовая активность врождённого иммунитета.',
    description:
      'Отражает функциональную готовность нейтрофилов/моноцитов к захвату чужеродных частиц. Снижение может указывать на иммунное истощение, повышение — на активный воспалительный/инфекционный процесс.',
  },
  nst: {
    id: 'nst',
    block: 1,
    order: 2,
    label: 'Кислородный и энергетический обмен (НСТ-тест)',
    shortLabel: 'НСТ-тест',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Кислород-зависимая активность фагоцитов (респираторный взрыв).',
    description:
      'Характеризует способность фагоцитов генерировать активные формы кислорода. Снижение — слабый окислительный ответ, повышение — выраженная активация/гиперреактивность.',
  },
  oxidativeStress: {
    id: 'oxidativeStress',
    block: 1,
    order: 3,
    label: 'Оксидативный стресс',
    shortLabel: 'Оксид. стресс',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Уровень окислительной нагрузки на клетку.',
    description:
      'Один из ключевых маркеров безопасности интерпретации: высокий уровень требует первоочередной оценки мембран, воспаления, гипоксии и антиоксидантной защиты до любых энергостимулирующих рекомендаций.',
  },
  calciumStress: {
    id: 'calciumStress',
    block: 1,
    order: 4,
    label: 'Кальциевый стресс',
    shortLabel: 'Ca²⁺-стресс',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Степень кальциевой нагрузки на клетку/иммунные клетки.',
    description:
      'Отражает выраженность внутриклеточной кальциевой перегрузки — компонент воспалительной сигнализации и потенциального митохондриального повреждения при сочетании с оксидативным стрессом.',
  },
  proteinMetabolism: {
    id: 'proteinMetabolism',
    block: 1,
    order: 5,
    label: 'Белковый обмен',
    shortLabel: 'Белковый обмен',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Состояние белоксинтетической/пластической функции клетки.',
    description:
      'Снижение может отражать дефицит субстратов (белок, аминокислоты), катаболическую направленность обмена или рибосомный стресс.',
  },
  mitoActivity: {
    id: 'mitoActivity',
    block: 1,
    order: 6,
    label: 'Митохондриальная активность',
    shortLabel: 'Мито-активность',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Суммарная функциональная активность митохондриального пула клетки.',
    description:
      'Интегральный показатель работы митохондрий. Низкие значения сами по себе не равны «митохондриальной недостаточности» — требуют сопоставления с иммунным и воспалительным контекстом.',
  },
  nadh: {
    id: 'nadh',
    block: 1,
    order: 7,
    label: 'Внутриклеточное накопление NADH',
    shortLabel: 'NADH',
    unit: '%',
    valueType: 'absolute',
    min: 0,
    max: 100,
    step: 0.1,
    hint: 'Уровень внутриклеточного NADH в покое.',
    description:
      'Базовый уровень восстановительных эквивалентов. Используется как опорная точка для интерпретации ΔNADH-показателей комплексов дыхательной цепи (Блок 2).',
  },

  // ---- Блок 2. Функциональное состояние митохондриальных комплексов и дыхания (ΔNADH) ----
  complexI: {
    id: 'complexI',
    block: 2,
    order: 8,
    label: 'Комплекс I, NADH-редуктаза',
    shortLabel: 'Комплекс I',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH при стимуляции/блокировании Комплекса I.',
    description:
      'Оценивает участок NADH-убихинон оксидоредуктазы дыхательной цепи. Интерпретируется только в сочетании с базовым NADH, мембраной и оксидативным стрессом.',
  },
  complexII: {
    id: 'complexII',
    block: 2,
    order: 9,
    label: 'Комплекс II, сукцинатдегидрогеназа',
    shortLabel: 'Комплекс II',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH при оценке сукцинат-зависимого звена.',
    description:
      'Связан с сукцинатдегидрогеназой и циклом Кребса; значимые отклонения сопоставляют с гипоксическими и воспалительными маркерами (сукцинат-фумарат/HIF-1α ось).',
  },
  complexIII: {
    id: 'complexIII',
    block: 2,
    order: 10,
    label: 'Комплекс III, цитохром bc1-комплекс',
    shortLabel: 'Комплекс III',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH на участке цитохром bc1.',
    description:
      'Участок повышенного риска утечки электронов/ROS. Часто оценивается вместе с мембраной и комплексом IV.',
  },
  complexIV: {
    id: 'complexIV',
    block: 2,
    order: 11,
    label: 'Комплекс IV, цитохром c-оксидаза',
    shortLabel: 'Комплекс IV',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH на участке цитохром c-оксидазы.',
    description:
      'Терминальный акцептор электронов дыхательной цепи. Отклонения сопоставляют с кислородным статусом и токсическими/гипоксическими воздействиями.',
  },
  complexV: {
    id: 'complexV',
    block: 2,
    order: 12,
    label: 'Комплекс V, АТФ-синтаза',
    shortLabel: 'Комплекс V',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH при оценке АТФ-синтазы.',
    description:
      'Отражает работу протонного канала/синтеза АТФ. Интерпретируется совместно с состоянием мембраны и протонного градиента.',
  },
  mitoMembrane: {
    id: 'mitoMembrane',
    block: 2,
    order: 13,
    label: 'Митохондриальная мембрана',
    shortLabel: 'Мембрана',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH при оценке состояния мембраны/мембранного потенциала.',
    description:
      'Косвенный маркер целостности мембраны и протонного градиента (ΔΨ). Ключевой показатель для оксидативно-мембранного и мембранно-АТФ-синтазного паттернов.',
  },
  stressReaction: {
    id: 'stressReaction',
    block: 2,
    order: 14,
    label: 'Митохондриальная реакция на клеточный стресс',
    shortLabel: 'Реакция на стресс',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Изменение NADH в ответ на стресс-нагрузку.',
    description:
      'Отражает резерв метаболической гибкости митохондрий при нагрузке/стрессе. Используется для оценки компенсаторных возможностей.',
  },
  nonMitoRespiration: {
    id: 'nonMitoRespiration',
    block: 2,
    order: 15,
    label: 'Немитохондриальное дыхание',
    shortLabel: 'Немито дыхание',
    unit: 'ΔNADH %',
    valueType: 'deltaNadh',
    min: -100,
    max: 100,
    step: 0.1,
    hint: 'Доля немитохондриальных окислительных процессов.',
    description:
      'Маркер компенсаторного гликолитического/немитохондриального сдвига (NADPH-оксидазы, ксантиноксидаза, ЛДГ-путь). Выраженное повышение сопоставляют с гипоксией, воспалением и метаболическим синдромом.',
  },
}

export const indicatorList: IndicatorDefinition[] = Object.values(indicators).sort(
  (a, b) => a.order - b.order,
)

export const block1Indicators = indicatorList.filter((i) => i.block === 1)
export const block2Indicators = indicatorList.filter((i) => i.block === 2)
