import type { IndicatorId, IndicatorReferenceConfig, ReferenceZone } from '@/engine/types'

/**
 * Editable medical config layer — reference zones per indicator.
 *
 * Источник: «Интерпретация митопаспорта», 2-е изд., раздел 1.4
 * (сводная таблица зон) и раздел 1.5 / глава 4 (логика функциональных проб).
 *
 * БЛОК 1. Пять цветных зон на шкале 0–100 %. Целевая зона = riskScore 0.
 * Двусторонняя шкала (неблагоприятны и низкие, и высокие значения):
 * фагоцитоз, НСТ, белковый обмен, митохондриальная активность, НАДН.
 * Односторонняя (чем ниже, тем лучше): оксидативный и кальциевый стресс.
 *
 * Соответствие riskScore цвету: зона, прилегающая к целевой, = 2 (умеренное
 * отклонение), крайняя зона = 3 (выраженное отклонение). У белкового обмена
 * и митохондриальной активности выше целевой одна зона, ей присвоен 1.
 * Это рабочее соглашение калькулятора: пособие делит зоны на «умеренные»
 * и «выраженные», но не задаёт числовой вес.
 *
 * Идентификаторы целевых зон у всех показателей блока 1 одинаковые: 'target'.
 *
 * БЛОК 2. Функциональные пробы (ΔНАДН после направленной блокировки).
 * Знак читается асимметрично (раздел 1.5):
 *   выше нуля  — звено вносило вклад в поток, НАДН накопился;
 *   около нуля — вклад звена в текущих условиях незначим;
 *   ниже нуля  — НАДН расходуется в обход заблокированного звена.
 * Исключение — комплекс V: отрицательное значение = снижение эффективности
 * синтеза АТФ, а не обходной путь.
 * Отклонением пробы считается отрицательная область (зоны 'neg', 'negStrong').
 *
 * Числовые границы блока 2 (коридор «около нуля» ±15 и порог «выражено» 40)
 * в пособии НЕ заданы и остаются черновыми (isEditablePlaceholder: true).
 * Идентификаторы зон блока 2 одинаковы для всех проб:
 * 'negStrong' | 'neg' | 'neutral' | 'pos' | 'posStrong'.
 */

/** Черновые пороги проб. Менять здесь — изменится у всех проб сразу. */
const PROBE_NEUTRAL_LIMIT = 15
const PROBE_STRONG_LIMIT = 40

interface ProbeTexts {
  negStrong: [string, string]
  neg: [string, string]
  neutral: [string, string]
  pos: [string, string]
  posStrong: [string, string]
}

interface ProbeRisks {
  negStrong: ReferenceZone['riskScore']
  neg: ReferenceZone['riskScore']
  neutral: ReferenceZone['riskScore']
  pos: ReferenceZone['riskScore']
  posStrong: ReferenceZone['riskScore']
}

function probeZones(texts: ProbeTexts, risks: ProbeRisks): ReferenceZone[] {
  const n = PROBE_NEUTRAL_LIMIT
  const s = PROBE_STRONG_LIMIT
  return [
    { id: 'negStrong', label: texts.negStrong[0], meaning: texts.negStrong[1], riskScore: risks.negStrong, min: -100, max: -(s + 0.1) },
    { id: 'neg', label: texts.neg[0], meaning: texts.neg[1], riskScore: risks.neg, min: -s, max: -(n + 0.1) },
    { id: 'neutral', label: texts.neutral[0], meaning: texts.neutral[1], riskScore: risks.neutral, min: -n, max: n },
    { id: 'pos', label: texts.pos[0], meaning: texts.pos[1], riskScore: risks.pos, min: n + 0.1, max: s },
    { id: 'posStrong', label: texts.posStrong[0], meaning: texts.posStrong[1], riskScore: risks.posStrong, min: s + 0.1, max: 100 },
  ]
}

/** Комплексы I–IV и мембрана: минус = обходной путь окисления НАДН. */
const electronTransportTexts: ProbeTexts = {
  negStrong: ['Выраженно отрицательная', 'НАДН активно расходуется в обход звена. Это не снижение функции, а признак выраженного альтернативного пути окисления.'],
  neg: ['Отрицательная', 'НАДН расходуется в обход заблокированного звена. Читается вместе с немитохондриальным дыханием и НАДН.'],
  neutral: ['Около нуля', 'Вклад звена в текущих условиях незначим либо изменение компенсировано.'],
  pos: ['Положительная', 'Звено вносит вклад в поток электронов: блокировка привела к накоплению НАДН.'],
  posStrong: ['Выраженно положительная', 'Звено вносит выраженный вклад в поток электронов.'],
}
const electronTransportRisks: ProbeRisks = { negStrong: 3, neg: 2, neutral: 0, pos: 0, posStrong: 0 }

/** Комплекс V: минус = снижение эффективности синтеза АТФ (исключение из общего правила). */
const complexVTexts: ProbeTexts = {
  negStrong: ['Выраженно отрицательная', 'Выраженное снижение эффективности использования протонного градиента для синтеза АТФ. Читается вместе с пробой на мембрану.'],
  neg: ['Отрицательная', 'Снижение эффективности синтеза АТФ: градиент преобразуется в энергию хуже. Для комплекса V минус не означает обходной путь.'],
  neutral: ['Около нуля', 'Выраженного изменения нет.'],
  pos: ['Положительная', 'Градиент используется для синтеза АТФ.'],
  posStrong: ['Выраженно положительная', 'Выраженный вклад АТФ-синтазы в оборот НАДН.'],
}

/** Реакция на клеточный стресс: около нуля или минус = сниженный резерв (гл. 4, проба 7). */
const stressReactionTexts: ProbeTexts = {
  negStrong: ['Выраженно отрицательная', 'При кортизоловой нагрузке НАДН окисляется вне дыхательной цепи. Адаптационный резерв снижен.'],
  neg: ['Отрицательная', 'Ответ на нагрузку обеспечивается обходным путём. Адаптационный резерв снижен.'],
  neutral: ['Около нуля', 'Ответа на нагрузку нет. При спокойных базовых показателях это скрытое снижение резерва.'],
  pos: ['Положительная', 'Митохондриальный ответ на кортизоловую нагрузку сохранён.'],
  posStrong: ['Выраженно положительная', 'Митохондриальный ответ на нагрузку сохранён.'],
}
const stressReactionRisks: ProbeRisks = { negStrong: 3, neg: 2, neutral: 2, pos: 0, posStrong: 0 }

/** Немитохондриальное дыхание: минус = обходной путь включён; «выражено» = negStrong. */
const nonMitoTexts: ProbeTexts = {
  negStrong: ['Обходной путь выражен', 'Выраженное окисление НАДН вне митохондрии. Компенсация: поддерживает редокс-оборот ценой меньшей энергетической эффективности.'],
  neg: ['Обходной путь умеренный', 'Умеренное использование немитохондриального окисления НАДН.'],
  neutral: ['Около нуля', 'Обходной путь не выражен.'],
  pos: ['Положительная', 'Обходной путь не выявлен.'],
  posStrong: ['Выраженно положительная', 'Обходной путь не выявлен. Трактовка положительных значений в пособии не описана.'],
}
const nonMitoRisks: ProbeRisks = { negStrong: 2, neg: 1, neutral: 0, pos: 0, posStrong: 0 }

export const referenceRanges: Record<IndicatorId, IndicatorReferenceConfig> = {
  // ---- Блок 1 ----
  phagocytosis: {
    indicatorId: 'phagocytosis',
    zones: [
      { id: 'severelyLow', label: 'Значительно снижен', riskScore: 3, min: 0, max: 19.9, meaning: 'Захват частиц отсутствует или значительно снижен.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 20, max: 39.9, meaning: 'Сниженная фагоцитарная готовность.' },
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 40, max: 59.9, meaning: 'Адекватная фагоцитарная реакция.' },
      { id: 'elevated', label: 'Повышен', riskScore: 2, min: 60, max: 79.9, meaning: 'Повышенная фагоцитарная реакция.' },
      { id: 'hyperactivation', label: 'Значительно повышен', riskScore: 3, min: 80, max: 100, meaning: 'Выраженная фагоцитарная активация.' },
    ],
  },
  nst: {
    indicatorId: 'nst',
    zones: [
      { id: 'severelyLow', label: 'Значительно снижен', riskScore: 3, min: 0, max: 9.9, meaning: 'Кислородзависимый ответ фагоцитов значительно снижен.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 10, max: 29.9, meaning: 'Сниженная способность к кислородному взрыву.' },
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 30, max: 59.9, meaning: 'Кислородзависимый ответ в целевой зоне.' },
      { id: 'elevated', label: 'Повышен', riskScore: 2, min: 60, max: 79.9, meaning: 'Усиленный кислородный взрыв.' },
      { id: 'severeHyperactivation', label: 'Значительно повышен', riskScore: 3, min: 80, max: 100, meaning: 'Выраженная активация кислородного взрыва.' },
    ],
  },
  oxidativeStress: {
    indicatorId: 'oxidativeStress',
    zones: [
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 0, max: 19.9, meaning: 'Доля клеток со спонтанным повреждением мембраны в целевой зоне.' },
      { id: 'elevated', label: 'Повышен', riskScore: 2, min: 20, max: 59.9, meaning: 'Повышенная доля повреждённых клеток: дисбаланс окислителей и антиоксидантной защиты.' },
      { id: 'high', label: 'Выраженно повышен', riskScore: 3, min: 60, max: 100, meaning: 'Значительно повышена доля повреждённых клеток. До любой энергостимуляции оценить воспаление, гипоксию, мембрану.' },
    ],
  },
  calciumStress: {
    indicatorId: 'calciumStress',
    zones: [
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 0, max: 29.9, meaning: 'Кальциевый обмен в целевой зоне.' },
      { id: 'activation', label: 'Повышен', riskScore: 2, min: 30, max: 49.9, meaning: 'Повышенная доля клеток с накоплением внутриклеточного кальция.' },
      { id: 'stress', label: 'Выраженно повышен', riskScore: 3, min: 50, max: 100, meaning: 'Выраженная кальциевая нагрузка на клетки.' },
    ],
  },
  proteinMetabolism: {
    indicatorId: 'proteinMetabolism',
    zones: [
      { id: 'severelyLow', label: 'Значительно снижен', riskScore: 3, min: 0, max: 19.9, meaning: 'Значительно снижена доля клеток с активной внеядерной РНК.' },
      { id: 'low', label: 'Снижен', riskScore: 2, min: 20, max: 59.9, meaning: 'Снижены пластические процессы. Причина по значению не устанавливается.' },
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 60, max: 79.9, meaning: 'Пластические процессы в целевой зоне.' },
      { id: 'elevated', label: 'Повышен', riskScore: 1, min: 80, max: 100, meaning: 'Высокая синтетическая активность. Читать вместе с оксидативным и кальциевым стрессом.' },
    ],
  },
  mitoActivity: {
    indicatorId: 'mitoActivity',
    zones: [
      { id: 'severelyLow', label: 'Значительно снижена', riskScore: 3, min: 0, max: 9.9, meaning: 'Конгломерат активных митохондрий практически не выявляется.' },
      { id: 'low', label: 'Снижена', riskScore: 2, min: 10, max: 29.9, meaning: 'Снижена доля гранулоцитов с активным конгломератом митохондрий.' },
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 30, max: 79.9, meaning: 'Доля клеток с активными митохондриями в целевой зоне.' },
      { id: 'high', label: 'Выше целевой', riskScore: 1, min: 80, max: 100, meaning: 'Высокая доля клеток с активными митохондриями. Читать вместе с оксидативным и кальциевым стрессом.' },
    ],
  },
  nadh: {
    indicatorId: 'nadh',
    zones: [
      { id: 'lowAccumulation', label: 'Значительно снижен', riskScore: 3, min: 0, max: 20.9, meaning: 'Низкое внутриклеточное накопление НАДН: недостаточное образование либо перехват обходным путём.' },
      { id: 'borderlineLow', label: 'Снижен', riskScore: 2, min: 21, max: 29.9, meaning: 'Сниженное накопление НАДН.' },
      { id: 'target', label: 'Целевая зона', riskScore: 0, min: 30, max: 59.9, meaning: 'Накопление НАДН в целевой зоне.' },
      { id: 'elevated', label: 'Повышен', riskScore: 2, min: 60, max: 79.9, meaning: 'Накопление НАДН: образование опережает окисление.' },
      { id: 'sharplyElevated', label: 'Значительно повышен', riskScore: 3, min: 80, max: 100, meaning: 'Выраженное накопление НАДН: вероятно ограничение его окисления в дыхательной цепи.' },
    ],
  },

  // ---- Блок 2 (ΔНАДН) — асимметричная логика знака, числовые пороги черновые ----
  complexI: { indicatorId: 'complexI', zones: probeZones(electronTransportTexts, electronTransportRisks), isEditablePlaceholder: true },
  complexII: { indicatorId: 'complexII', zones: probeZones(electronTransportTexts, electronTransportRisks), isEditablePlaceholder: true },
  complexIII: { indicatorId: 'complexIII', zones: probeZones(electronTransportTexts, electronTransportRisks), isEditablePlaceholder: true },
  complexIV: { indicatorId: 'complexIV', zones: probeZones(electronTransportTexts, electronTransportRisks), isEditablePlaceholder: true },
  complexV: { indicatorId: 'complexV', zones: probeZones(complexVTexts, electronTransportRisks), isEditablePlaceholder: true },
  mitoMembrane: { indicatorId: 'mitoMembrane', zones: probeZones(electronTransportTexts, electronTransportRisks), isEditablePlaceholder: true },
  stressReaction: { indicatorId: 'stressReaction', zones: probeZones(stressReactionTexts, stressReactionRisks), isEditablePlaceholder: true },
  nonMitoRespiration: { indicatorId: 'nonMitoRespiration', zones: probeZones(nonMitoTexts, nonMitoRisks), isEditablePlaceholder: true },
}
