import type { IndicatorId, IndicatorReferenceConfig, ReferenceZone } from '@/engine/types'

/**
 * Editable medical config layer — reference zones per indicator.
 *
 * EDIT THIS FILE to recalibrate thresholds. Nothing else in the codebase
 * needs to change: `min`/`max` define the band (inclusive), `riskScore`
 * (0–3) drives both the colour shown in the UI (0=green,1=yellow,2=orange,
 * 3=red — see `src/engine/colors.ts`) and the domain/pattern aggregation.
 *
 * Block 1 (0–100%) bands below come directly from the source МИТО-паспорт /
 * MITOLAB interpretation logic supplied by the physician.
 *
 * Block 2 (ΔNADH, complexes I–V, membrane, stress reaction, non-mito
 * respiration) bands are PROVISIONAL PLACEHOLDERS — `isEditablePlaceholder:
 * true`. Exact clinical breakpoints were not provided and must not be
 * invented as final; the 5-band symmetric shape here exists only so the
 * calculator is usable out of the box. Recalibrate per-indicator once real
 * MITOLAB Excel reference data is available.
 */

function deltaNadhPlaceholderZones(): ReferenceZone[] {
  return [
    {
      id: 'strongDecrease',
      label: 'Выраженное снижение Δ',
      riskScore: 3,
      min: -100,
      max: -40.1,
      meaning: 'Значимое снижение — оценить в комплексе с NADH, мембраной и оксидативным стрессом.',
    },
    {
      id: 'mildDecrease',
      label: 'Умеренное снижение Δ',
      riskScore: 1,
      min: -40,
      max: -15.1,
      meaning: 'Умеренное снижение — самостоятельного значения не имеет, смотреть в составе паттерна.',
    },
    {
      id: 'neutral',
      label: 'Около нуля / слабая реакция',
      riskScore: 0,
      min: -15,
      max: 15,
      meaning: 'Слабая реакция участка — значимого влияния не выявлено.',
    },
    {
      id: 'mildIncrease',
      label: 'Умеренное повышение Δ',
      riskScore: 1,
      min: 15.1,
      max: 40,
      meaning: 'Умеренное повышение — самостоятельного значения не имеет, смотреть в составе паттерна.',
    },
    {
      id: 'strongIncrease',
      label: 'Выраженное повышение Δ',
      riskScore: 3,
      min: 40.1,
      max: 100,
      meaning: 'Значимое повышение — возможный блок/накопление, оценить в комплексе с NADH и мембраной.',
    },
  ]
}

export const referenceRanges: Record<IndicatorId, IndicatorReferenceConfig> = {
  // ---- Блок 1 ----
  phagocytosis: {
    indicatorId: 'phagocytosis',
    zones: [
      { id: 'severelyLow', label: 'Резко снижен', riskScore: 3, min: 0, max: 19.9, meaning: 'Выраженное угнетение фагоцитарной функции.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 20, max: 39.9, meaning: 'Ослабленный фагоцитарный ответ.' },
      { id: 'moderate', label: 'Умеренная зона', riskScore: 1, min: 40, max: 59.9, meaning: 'Погранично достаточная активность.' },
      { id: 'optimal', label: 'Оптимально / активная норма', riskScore: 0, min: 60, max: 79.9, meaning: 'Активная норма фагоцитоза.' },
      { id: 'hyperactivation', label: 'Гиперактивация', riskScore: 2, min: 80, max: 100, meaning: 'Возможен активный воспалительный/инфекционный процесс.' },
    ],
  },
  nst: {
    indicatorId: 'nst',
    zones: [
      { id: 'severelyLow', label: 'Резко снижен', riskScore: 3, min: 0, max: 9.9, meaning: 'Слабый кислород-зависимый ответ фагоцитов.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 10, max: 29.9, meaning: 'Сниженная активация респираторного взрыва.' },
      { id: 'normal', label: 'Норма', riskScore: 0, min: 30, max: 59.9, meaning: 'Адекватный окислительный ответ.' },
      { id: 'elevated', label: 'Повышен', riskScore: 1, min: 60, max: 79.9, meaning: 'Умеренная активация окислительного ответа.' },
      { id: 'severeHyperactivation', label: 'Выраженная гиперактивация', riskScore: 2, min: 80, max: 100, meaning: 'Высокая нагрузка респираторного взрыва.' },
    ],
  },
  oxidativeStress: {
    indicatorId: 'oxidativeStress',
    zones: [
      { id: 'low', label: 'Низкий / спокойный уровень', riskScore: 0, min: 0, max: 19.9, meaning: 'Спокойный окислительный фон.' },
      { id: 'moderate', label: 'Умеренный', riskScore: 1, min: 20, max: 59.9, meaning: 'Умеренная окислительная нагрузка.' },
      { id: 'high', label: 'Высокий', riskScore: 3, min: 60, max: 100, meaning: 'Приоритетный маркер безопасности — оценить мембраны, воспаление, гипоксию до энергостимулирующих рекомендаций.' },
    ],
  },
  calciumStress: {
    indicatorId: 'calciumStress',
    zones: [
      { id: 'calm', label: 'Спокойный иммунитет / норма', riskScore: 0, min: 0, max: 29.9, meaning: 'Кальциевая сигнализация в пределах нормы.' },
      { id: 'activation', label: 'Активация', riskScore: 1, min: 30, max: 49.9, meaning: 'Умеренная активация кальциевой сигнализации.' },
      { id: 'stress', label: 'Кальциевый стресс', riskScore: 2, min: 50, max: 100, meaning: 'Выраженная кальциевая нагрузка на клетку.' },
    ],
  },
  proteinMetabolism: {
    indicatorId: 'proteinMetabolism',
    zones: [
      { id: 'severelyLow', label: 'Резко снижен', riskScore: 3, min: 0, max: 19.9, meaning: 'Выраженный дефицит пластического ресурса.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 20, max: 59.9, meaning: 'Сниженная белоксинтетическая активность.' },
      { id: 'moderatelyPreserved', label: 'Умеренно сохранён', riskScore: 1, min: 60, max: 79.9, meaning: 'Близко к достаточному уровню.' },
      { id: 'optimal', label: 'Оптимально / активный синтез', riskScore: 0, min: 80, max: 100, meaning: 'Активный белковый синтез.' },
    ],
  },
  mitoActivity: {
    indicatorId: 'mitoActivity',
    zones: [
      { id: 'severelyLow', label: 'Резко снижена', riskScore: 3, min: 0, max: 9.9, meaning: 'Выраженное угнетение митохондриального пула.' },
      { id: 'low', label: 'Снижена', riskScore: 2, min: 10, max: 29.9, meaning: 'Сниженная функциональная активность митохондрий.' },
      { id: 'working', label: 'Умеренная / рабочая зона', riskScore: 1, min: 30, max: 79.9, meaning: 'Рабочий диапазон, не оптимум.' },
      { id: 'high', label: 'Высокая активность', riskScore: 0, min: 80, max: 100, meaning: 'Высокая митохондриальная активность.' },
    ],
  },
  nadh: {
    indicatorId: 'nadh',
    zones: [
      { id: 'lowAccumulation', label: 'Сниженное накопление', riskScore: 2, min: 0, max: 20.9, meaning: 'Низкий пул восстановительных эквивалентов.' },
      { id: 'borderlineLow', label: 'Погранично низко', riskScore: 1, min: 21, max: 29.9, meaning: 'На нижней границе нормы.' },
      { id: 'optimal', label: 'Оптимально', riskScore: 0, min: 30, max: 59.9, meaning: 'Сбалансированный уровень NADH.' },
      { id: 'elevated', label: 'Повышено', riskScore: 1, min: 60, max: 79.9, meaning: 'Умеренное накопление NADH.' },
      { id: 'sharplyElevated', label: 'Резко повышено', riskScore: 3, min: 80, max: 100, meaning: 'Риск редокс-застоя и затруднённого реокисления NADH.' },
    ],
  },

  // ---- Блок 2 (ΔNADH) — провизорные пороги, требуют калибровки ----
  complexI: { indicatorId: 'complexI', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  complexII: { indicatorId: 'complexII', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  complexIII: { indicatorId: 'complexIII', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  complexIV: { indicatorId: 'complexIV', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  complexV: { indicatorId: 'complexV', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  mitoMembrane: { indicatorId: 'mitoMembrane', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  stressReaction: { indicatorId: 'stressReaction', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
  nonMitoRespiration: { indicatorId: 'nonMitoRespiration', zones: deltaNadhPlaceholderZones(), isEditablePlaceholder: true },
}
