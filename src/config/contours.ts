import type { ContourDefinition } from '@/engine/types'
import {
  below,
  bypassPronounced,
  calciumAbove,
  deviated,
  inTarget,
  maPreserved,
  nadhAbove,
  noComplexDeviated,
  notDeviated,
  nstAbove,
  oxidativeAbove,
  phagoAbove,
  stressResponseAbsent,
  stressResponsePreserved,
  anyComplexDeviated,
} from './zoneGroups'

/**
 * Editable medical config layer — шесть функциональных контуров.
 *
 * Источник: пособие, глава 5. Состав — по матрице 5.2 (К ключевой, д
 * дополнительный). Состояния — по таблицам раздела 5.1, проверяются сверху
 * вниз, срабатывает первое выполненное. Несколько промежуточных состояний
 * («Смещён», «Частично снижен», «Окислительная нагрузка без редокс-застоя»)
 * взяты из разборов отчётов А и Б (раздел 5.5); в сводных таблицах 5.1 их нет.
 *
 * ifMeasured: true — компонент необязателен для сборки при неполном объёме
 * (раздел 5.6): если показатель не измерен, условие не блокирует состояние.
 */
export const contours: ContourDefinition[] = [
  {
    id: 'energy',
    order: 1,
    label: 'Энергетический контур',
    question: 'Способна ли клетка окислять восстановительные эквиваленты в митохондрии и получать из этого энергию.',
    keyIndicators: ['mitoActivity', 'nadh', 'complexI', 'complexII', 'complexV', 'nonMitoRespiration'],
    additionalIndicators: ['complexIII', 'complexIV'],
    requiredIndicators: ['mitoActivity'],
    states: [
      {
        id: 'compensated',
        label: 'Компенсирован',
        severity: 2,
        when: { all: [below('mitoActivity'), bypassPronounced, inTarget('nadh')] },
        text: 'Митохондриальная активность снижена, обходной путь окисления выражен, НАДН удерживается в целевой зоне за счёт перехвата.',
      },
      {
        id: 'limited',
        label: 'Ограничен',
        severity: 3,
        when: { all: [below('mitoActivity'), { any: [{ indicator: 'nadh', riskScoreMin: 1 }, anyComplexDeviated] }] },
        text: 'Митохондриальная активность снижена, НАДН смещён или пробы комплексов отклонены.',
      },
      {
        id: 'shifted',
        label: 'Смещён',
        severity: 2,
        when: { all: [maPreserved, bypassPronounced, { any: [{ indicator: 'nadh', riskScoreMin: 1 }, anyComplexDeviated] }] },
        text: 'Митохондриальная активность в целевой зоне, но окисление НАДН идёт помимо дыхательной цепи.',
      },
      {
        id: 'reducedPartial',
        label: 'Снижен',
        severity: 2,
        when: below('mitoActivity'),
        text: 'Митохондриальная активность снижена. Остальные компоненты контура в целевых зонах или не измерены.',
      },
      {
        id: 'preserved',
        label: 'Сохранён',
        severity: 0,
        when: {
          all: [
            maPreserved,
            inTarget('nadh', true),
            noComplexDeviated,
            { indicator: 'nonMitoRespiration', zoneIn: ['neg', 'neutral', 'pos', 'posStrong'], ifMeasured: true },
          ],
        },
        text: 'Митохондриальная активность и НАДН в целевых зонах, пробы комплексов положительные или около нуля, обходной путь не выражен.',
      },
    ],
    searchDirection: 'Обеспечение: гипоксия, анемия, нутритивные и кофакторные дефициты, эндокринный фон, лекарства.',
  },
  {
    id: 'membrane',
    order: 2,
    label: 'Мембранно-сопрягающий контур',
    question: 'Формируется ли протонный градиент и превращается ли он в АТФ.',
    keyIndicators: ['mitoMembrane', 'complexV'],
    additionalIndicators: ['complexIII', 'complexIV', 'mitoActivity'],
    requiredIndicators: ['mitoMembrane', 'complexV'],
    states: [
      {
        id: 'wholeNode',
        label: 'Нарушен весь узел',
        severity: 3,
        when: {
          all: [
            deviated('mitoMembrane'),
            deviated('complexV'),
            { any: [{ indicator: 'mitoMembrane', zoneIn: ['negStrong'] }, { indicator: 'complexV', zoneIn: ['negStrong'] }] },
          ],
        },
        text: 'Мембрана и комплекс V отклонены совместно, хотя бы одна проба выраженно. Часто вместе с комплексами III и IV.',
      },
      {
        id: 'wholeNodeModerate',
        label: 'Узел умеренно отклонён',
        severity: 2,
        when: { all: [deviated('mitoMembrane'), deviated('complexV')] },
        text: 'Мембрана и комплекс V отклонены совместно, без выраженных значений.',
      },
      {
        id: 'coupling',
        label: 'Нарушено сопряжение',
        severity: 2,
        when: { all: [notDeviated('mitoMembrane'), deviated('complexV')] },
        text: 'Комплекс V отклонён при относительно сохранной мембране: градиент формируется, но используется хуже.',
      },
      {
        id: 'membraneOnly',
        label: 'Умеренно отклонён',
        severity: 2,
        when: { all: [deviated('mitoMembrane'), notDeviated('complexV')] },
        text: 'Проба на мембрану отклонена при сохранном комплексе V.',
      },
      {
        id: 'preserved',
        label: 'Сохранён',
        severity: 0,
        when: { all: [notDeviated('mitoMembrane'), notDeviated('complexV')] },
        text: 'Мембрана и комплекс V без выраженных отклонений.',
      },
    ],
    searchDirection: 'Окислительное повреждение, липидный обмен и желчеотток, дефицит омега-3 и фосфолипидов.',
  },
  {
    id: 'redox',
    order: 3,
    label: 'Редокс-контур',
    question: 'Справляется ли клетка с окислительной нагрузкой.',
    keyIndicators: ['oxidativeStress', 'nadh', 'complexI', 'complexIII'],
    additionalIndicators: ['calciumStress', 'mitoActivity', 'mitoMembrane'],
    requiredIndicators: ['oxidativeStress'],
    states: [
      {
        id: 'damage',
        label: 'Повреждение накоплено',
        severity: 3,
        when: { all: [{ indicator: 'oxidativeStress', zoneIn: ['high'] }, below('mitoActivity'), deviated('mitoMembrane')] },
        text: 'Оксидативный стресс выражен, митохондриальная активность снижена, мембрана отклонена.',
      },
      {
        id: 'overloaded',
        label: 'Перегружен',
        severity: 3,
        when: { all: [oxidativeAbove, nadhAbove, { any: [deviated('complexI'), deviated('complexIII')] }] },
        text: 'Оксидативный стресс повышен, НАДН повышен, комплексы I или III отклонены.',
      },
      {
        id: 'oxidativeLoad',
        label: 'Окислительная нагрузка повышена',
        severity: 2,
        when: oxidativeAbove,
        text: 'Оксидативный стресс повышен без признаков редокс-застоя по НАДН. Одного показателя для вывода о редокс-перегрузке недостаточно: сопоставить с энергетикой и клиникой.',
      },
      {
        id: 'preserved',
        label: 'Сохранён',
        severity: 0,
        when: { all: [inTarget('oxidativeStress'), inTarget('calciumStress', true)] },
        text: 'Оксидативный стресс в целевой зоне. Изменения НАДН и проб комплексов без окислительной нагрузки оцениваются в энергетическом контуре.',
      },
    ],
    notes: [
      {
        when: { all: [oxidativeAbove, below('nst')] },
        text: 'Редокс-иммунное рассогласование: высокий оксидативный стресс при низком НСТ. НСТ в редокс-контур не входит, их расхождение — самостоятельная находка.',
      },
    ],
    searchDirection: 'Источник окислительной нагрузки: воспаление, метаболическая декомпенсация, гипоксия, токсическое воздействие.',
  },
  {
    id: 'immune',
    order: 4,
    label: 'Иммунно-активационный контур',
    question: 'В каком функциональном состоянии находится врождённый иммунный ответ.',
    keyIndicators: ['phagocytosis', 'nst', 'calciumStress'],
    additionalIndicators: ['proteinMetabolism'],
    requiredIndicators: ['phagocytosis', 'nst'],
    states: [
      {
        id: 'activated',
        label: 'Активирован',
        severity: 3,
        when: { all: [{ any: [phagoAbove, nstAbove] }, calciumAbove] },
        text: 'Фагоцитоз и/или НСТ повышены вместе с кальциевым стрессом.',
      },
      {
        id: 'mismatched',
        label: 'Рассогласован',
        severity: 2,
        when: {
          any: [
            { all: [below('phagocytosis'), nstAbove] },
            { all: [phagoAbove, below('nst')] },
          ],
        },
        text: 'Захват и кислородзависимый ответ изменены разнонаправленно.',
      },
      {
        id: 'hyporeactive',
        label: 'Гипореактивен',
        severity: 2,
        when: { all: [below('phagocytosis'), below('nst'), inTarget('calciumStress', true)] },
        text: 'Фагоцитоз и НСТ снижены, кальциевый стресс низкий.',
      },
      {
        id: 'activatedNoCalcium',
        label: 'Активация без кальциевого компонента',
        severity: 2,
        when: { all: [{ any: [phagoAbove, nstAbove] }, inTarget('calciumStress', true)] },
        text: 'Фагоцитоз и/или НСТ повышены при спокойном кальциевом фоне или без его оценки.',
      },
      {
        id: 'captureReduced',
        label: 'Частично снижен',
        severity: 1,
        when: { all: [below('phagocytosis'), inTarget('nst')] },
        text: 'Захват ограничен при сохранном кислородзависимом ответе.',
      },
      {
        id: 'nstReduced',
        label: 'Частично снижен',
        severity: 1,
        when: { all: [inTarget('phagocytosis'), below('nst')] },
        text: 'Кислородзависимый ответ снижен при сохранном захвате.',
      },
      {
        id: 'coordinated',
        label: 'Согласован',
        severity: 0,
        when: { all: [inTarget('phagocytosis'), inTarget('nst'), inTarget('calciumStress', true)] },
        text: 'Фагоцитоз и НСТ в целевых зонах, кальциевый стресс низкий.',
      },
    ],
    searchDirection: 'Инфекционный или воспалительный источник, нутритивный статус, кортизоловый фон.',
  },
  {
    id: 'anabolic',
    order: 5,
    label: 'Анаболически-восстановительный контур',
    question: 'Хватает ли клетке ресурса на синтез и восстановление.',
    keyIndicators: ['proteinMetabolism', 'mitoActivity'],
    additionalIndicators: ['nadh', 'oxidativeStress'],
    requiredIndicators: ['proteinMetabolism'],
    states: [
      {
        id: 'resourceLimited',
        label: 'Ограничен ресурсом',
        severity: 2,
        when: { all: [below('proteinMetabolism'), below('mitoActivity')] },
        text: 'Белковый обмен снижен вместе с митохондриальной активностью. Тактика: работа с обеспечением.',
      },
      {
        id: 'stressSuppressed',
        label: 'Подавлен стрессом',
        severity: 2,
        when: { all: [below('proteinMetabolism'), maPreserved, oxidativeAbove] },
        text: 'Белковый обмен снижен при сохранной энергетике и повышенном оксидативном стрессе. Тактика: работа с источником стресса.',
      },
      {
        id: 'strained',
        label: 'Напряжён',
        severity: 2,
        when: { all: [{ indicator: 'proteinMetabolism', zoneIn: ['elevated'] }, oxidativeAbove, calciumAbove] },
        text: 'Белковый обмен повышен на фоне повышенного оксидативного и кальциевого стресса.',
      },
      {
        id: 'reducedIsolated',
        label: 'Снижен изолированно',
        severity: 1,
        when: below('proteinMetabolism'),
        text: 'Белковый обмен снижен при сохранной энергетике и спокойном редокс-фоне.',
      },
      {
        id: 'preserved',
        label: 'Сохранён',
        severity: 0,
        when: { all: [{ indicator: 'proteinMetabolism', zoneIn: ['target', 'elevated'] }, maPreserved] },
        text: 'Белковый обмен в целевой зоне при сохранной энергетике.',
      },
    ],
    searchDirection: 'Белковое и энергетическое обеспечение, пищеварение и всасывание, катаболический фон.',
  },
  {
    id: 'adaptive',
    order: 6,
    label: 'Адаптационно-резервный контур',
    question: 'Что произойдёт с системой при нагрузке.',
    keyIndicators: ['stressReaction', 'nonMitoRespiration', 'mitoActivity'],
    additionalIndicators: ['nadh'],
    requiredIndicators: ['stressReaction'],
    states: [
      {
        id: 'exhausted',
        label: 'Резерв исчерпан',
        severity: 3,
        when: {
          all: [
            { indicator: 'stressReaction', zoneIn: ['neg', 'negStrong'] },
            bypassPronounced,
            below('mitoActivity'),
          ],
        },
        text: 'Проба на стресс отрицательная, обходной путь выражен уже в покое, митохондриальная активность снижена.',
      },
      {
        id: 'hiddenDecrease',
        label: 'Резерв снижен скрыто',
        severity: 2,
        when: {
          all: [
            stressResponseAbsent,
            maPreserved,
            inTarget('nadh', true),
            inTarget('oxidativeStress', true),
            inTarget('phagocytosis', true),
            inTarget('proteinMetabolism', true),
          ],
        },
        text: 'Базовые показатели в целевых зонах, а ответа на кортизоловую нагрузку нет. Наиболее клинически значимая находка метода.',
      },
      {
        id: 'decreased',
        label: 'Резерв снижен',
        severity: 2,
        when: stressResponseAbsent,
        text: 'Ответ на кортизоловую нагрузку отсутствует на фоне изменений базовых показателей.',
      },
      {
        id: 'preservedWithBypass',
        label: 'Резерв сохранён, обходной путь выражен',
        severity: 1,
        when: { all: [stressResponsePreserved, bypassPronounced] },
        text: 'Ответ на нагрузку сохранён при выраженном обходном пути в покое.',
      },
      {
        id: 'preserved',
        label: 'Резерв сохранён',
        severity: 0,
        when: stressResponsePreserved,
        text: 'Проба на стресс положительная, обходной путь в покое не выражен.',
      },
    ],
    searchDirection: 'Соотношение нагрузки и восстановления, сон, кортизоловый фон; при необходимости — повторная оценка после снижения нагрузки.',
  },
]
