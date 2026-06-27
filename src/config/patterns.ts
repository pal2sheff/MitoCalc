import type { ConditionNode, PatternDefinition } from '@/engine/types'

/**
 * Editable medical config layer — pattern matrix (Level 3).
 *
 * Each pattern has:
 *  - requiredConditions: must ALL hold for the pattern to be considered
 *    triggered at all (a recursive all/any/none tree).
 *  - supportingConditions: each entry (leaf or group) that is also satisfied
 *    raises confidence. See `src/engine/patterns.ts` for the exact scoring.
 *
 * Convention: for any indicator, `riskScoreMin: 1` means "outside the
 * calm/optimal/neutral zone", i.e. any deviation regardless of direction —
 * every indicator in `referenceRanges.ts` has exactly one risk-0 zone, so
 * this is a safe generic "abnormal" check.
 */

const anyComplexAbnormal: ConditionNode = {
  any: [
    { indicator: 'complexI', riskScoreMin: 1 },
    { indicator: 'complexII', riskScoreMin: 1 },
    { indicator: 'complexIII', riskScoreMin: 1 },
    { indicator: 'complexIV', riskScoreMin: 1 },
    { indicator: 'complexV', riskScoreMin: 1 },
  ],
}

export const patterns: PatternDefinition[] = [
  {
    id: 'oxidativeMembrane',
    order: 1,
    name: 'Оксидативно-мембранный паттерн',
    requiredConditions: {
      all: [
        { indicator: 'oxidativeStress', zoneIn: ['high'] },
        { indicator: 'mitoMembrane', riskScoreMin: 1 },
      ],
    },
    supportingConditions: [
      { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
      { any: [{ indicator: 'complexIII', riskScoreMin: 1 }, { indicator: 'complexIV', riskScoreMin: 1 }] },
    ],
    pathophysiology:
      'Повреждение липидного бислоя и кардиолипина, нарушение протонного градиента, ROS-leak и снижение эффективности окислительного фосфорилирования (OXPHOS).',
    possibleCauses: [
      'Хроническое воспаление',
      'Гипоксия',
      'Дефицит антиоксидантной защиты',
      'Токсическая нагрузка',
      'Дефицит омега-3 / фосфолипидов',
      'Дефицит CoQ10',
      'Дефицит белка',
      'Перегрузка тренировками',
      'Нарушения сна',
    ],
    whatToCheck: [
      'CRP',
      'Ферритин',
      'Гомоцистеин',
      'GGT, ALT/AST, билирубин',
      'Глутатион / ОАА при доступности',
      'Омега-3 индекс',
      'Витамин D',
      'Магний, медь/цинк',
      'Признаки хронических инфекций',
    ],
    clinicalMeaning:
      'Сочетание высокой окислительной нагрузки и мембранного сдвига может соответствовать повреждению мембранных структур митохондрий, опережающему собственно энергетический дефицит.',
    cautiousStrategy:
      'Приоритет — стабилизация мембран и снижение повреждающих факторов (воспаление, гипоксия, токсическая нагрузка, дефицит антиоксидантной защиты); энергостимулирующие меры рассматривать только после этого этапа и с осторожностью.',
  },
  {
    id: 'energyDeficit',
    order: 2,
    name: 'Энергетический дефицит / низкая митохондриальная активность',
    requiredConditions: {
      all: [
        { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
        { indicator: 'nadh', zoneIn: ['lowAccumulation', 'borderlineLow'] },
      ],
    },
    supportingConditions: [{ indicator: 'proteinMetabolism', zoneIn: ['low', 'severelyLow'] }],
    pathophysiology:
      'Низкий пул функционально активных митохондрий, дефицит субстратов, сниженный анаболизм, дефицит белка/аминокислот, гиподинамия, постстрессовое истощение.',
    possibleCauses: [
      'Дефицит калорий и белка',
      'Дефицит B-витаминов, железа, магния, CoQ10',
      'Хронический стресс',
      'Плохой сон',
      'Гипотиреоз',
      'Инсулинорезистентность',
      'Постинфекционный синдром',
    ],
    whatToCheck: [
      'ОАК, ферритин',
      'B12, фолат',
      'TSH, fT3/fT4',
      'Глюкоза, инсулин, HbA1c',
      'Альбумин, общий белок, мочевина',
      'Витамин D',
    ],
    clinicalMeaning:
      'Сочетание низкой митохондриальной активности и сниженного/погранично низкого NADH может отражать общий энергетический и субстратный дефицит, а не первичный дефект конкретного комплекса.',
    cautiousStrategy:
      'Рассмотреть коррекцию сна, питания и белковой обеспеченности, восстановления и нагрузки, восполнение выявленных дефицитов; энерготропная поддержка — только как дополнительный слой после базовой коррекции.',
  },
  {
    id: 'immuneExhaustion',
    order: 3,
    name: 'Иммунное истощение / низкая фагоцитарная реакция',
    requiredConditions: { indicator: 'phagocytosis', zoneIn: ['low', 'severelyLow'] },
    supportingConditions: [
      { indicator: 'nst', zoneIn: ['low', 'severelyLow'] },
      { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
    ],
    pathophysiology:
      'Снижение реактивности врождённого иммунного ответа, дефицит энергетического обеспечения нейтрофилов, влияние кортизола, постинфекционная иммуносупрессия.',
    possibleCauses: [
      'Хронический стресс, высокий кортизол',
      'Дефицит сна',
      'Дефицит белка',
      'Дефицит цинка / витамина D / железа',
      'Вирусная нагрузка',
      'Перетренированность',
    ],
    whatToCheck: [
      'ОАК с лейкоформулой',
      'CRP',
      'Витамин D, ферритин, цинк',
      'Общий белок / альбумин',
      'Кортизол по клинике',
      'Признаки хронической инфекции',
    ],
    clinicalMeaning:
      'Низкая фагоцитарная реактивность может соответствовать функциональному истощению врождённого иммунитета, требующему оценки нагрузки, восстановления и дефицитов, а не самостоятельной «слабости иммунитета».',
    cautiousStrategy:
      'Целесообразно сопоставить с нагрузкой, сном и стрессом; рассмотреть коррекцию восстановления, белка и выявленных дефицитов перед иммуномодулирующими вмешательствами.',
  },
  {
    id: 'immuneHyperactivation',
    order: 4,
    name: 'Иммунная гиперактивация / воспалительный паттерн',
    requiredConditions: {
      all: [
        { any: [{ indicator: 'phagocytosis', zoneIn: ['hyperactivation'] }, { indicator: 'nst', zoneIn: ['severeHyperactivation'] }] },
        { indicator: 'calciumStress', zoneIn: ['stress'] },
        { indicator: 'oxidativeStress', zoneIn: ['high'] },
      ],
    },
    supportingConditions: [],
    pathophysiology:
      'Активация врождённого иммунитета, ROS burst, риск NETosis, кальциевая перегрузка, усиленная воспалительная сигнализация.',
    possibleCauses: [
      'Инфекция',
      'Аутоиммунная активность',
      'Аллергия',
      'Травма',
      'Перегрузка/перетренированность',
      'Метаболическое воспаление',
      'Повышенная кишечная проницаемость',
    ],
    whatToCheck: [
      'CRP, СОЭ, ферритин',
      'Лейкоформула',
      'IgE по показаниям',
      'ANA / аутоиммунный скрининг по клинике',
      'Кишечные маркеры',
      'Очаги инфекции',
    ],
    clinicalMeaning:
      'Сочетание гиперреактивности фагоцитов/НСТ с кальциевым и оксидативным стрессом может отражать активный воспалительный процесс — сниженную митохондриальную активность в этом контексте не следует трактовать как первичную митохондриальную недостаточность без учёта иммунного процесса.',
    cautiousStrategy:
      'Приоритет — поиск и коррекция источника воспалительной/инфекционной активации; энергетические показатели переоценить после стихания острого процесса.',
  },
  {
    id: 'ribosomalAnabolicDeficit',
    order: 5,
    name: 'Рибосомно-анаболический дефицит',
    requiredConditions: {
      all: [
        { indicator: 'proteinMetabolism', zoneIn: ['low', 'severelyLow'] },
        { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
      ],
    },
    supportingConditions: [{ indicator: 'phagocytosis', zoneIn: ['low', 'severelyLow'] }],
    pathophysiology:
      'Снижение внеядерной РНК и белкового синтеза, рибосомный стресс, дефицит аминокислот, переключение обмена на катаболизм.',
    possibleCauses: [
      'Недостаток белка / незаменимых аминокислот',
      'Дефицит калорий',
      'Терапия аналогами GLP-1 на фоне недоедания',
      'Мальабсорбция',
      'Хроническое воспаление',
      'Гиперкортизолизм',
      'Перетренированность',
    ],
    whatToCheck: [
      'Общий белок, альбумин',
      'Мочевина, креатинин',
      'Ферритин, B12, фолат',
      'Витамин D, цинк',
      'Пищевой дневник, состав тела',
    ],
    clinicalMeaning:
      'Сочетанное снижение белкового обмена и митохондриальной активности может соответствовать дефициту пластического ресурса, ограничивающему энергетические процессы вторично, а не первичному дефекту дыхательной цепи.',
    cautiousStrategy:
      'Рассмотреть оценку и коррекцию белковой обеспеченности, калорийности и нагрузочного режима до интерпретации показателей как энергетической недостаточности.',
  },
  {
    id: 'nadhAccumulation',
    order: 6,
    name: 'NADH-накопление / блок утилизации восстановительных эквивалентов',
    requiredConditions: {
      all: [
        { indicator: 'nadh', zoneIn: ['elevated', 'sharplyElevated'] },
        {
          any: [
            { indicator: 'complexI', riskScoreMin: 1 },
            { indicator: 'complexIII', riskScoreMin: 1 },
            { indicator: 'complexIV', riskScoreMin: 1 },
          ],
        },
      ],
    },
    supportingConditions: [
      { indicator: 'oxidativeStress', zoneIn: ['moderate', 'high'] },
      { indicator: 'complexI', riskScoreMin: 1 },
      { indicator: 'complexIII', riskScoreMin: 1 },
      { indicator: 'complexIV', riskScoreMin: 1 },
    ],
    pathophysiology:
      'Затруднённое реокисление NADH до NAD+, блок электронного транспорта, редокс-застой с риском усиления продукции ROS.',
    possibleCauses: [
      'Гипоксия',
      'Токсическое воздействие',
      'Дефицит CoQ10, B2/B3, железо-серных кластеров',
      'Воспаление',
      'Митохондриальная токсичность лекарственных препаратов',
      'Перегрузка субстратами',
    ],
    whatToCheck: [
      'Лактат/пируват при доступности',
      'Печёночные маркеры',
      'Ферритин',
      'B-витамины',
      'CoQ10 при доступности',
      'Кислородный статус, сонное апноэ',
      'Токсические воздействия',
    ],
    clinicalMeaning:
      'Повышение NADH на фоне отклонений комплексов I/III/IV может соответствовать затруднённой утилизации восстановительных эквивалентов — состоянию, при котором стимуляция дыхательной цепи без устранения причины блока может быть нецелесообразной.',
    cautiousStrategy:
      'Сначала рассмотреть оценку гипоксии, токсической нагрузки и дефицитов кофакторов (B2/B3, CoQ10, железо); прямая энергостимуляция до этого — не приоритет.',
  },
  {
    id: 'succinateComplexII',
    order: 7,
    name: 'Сукцинат-зависимый паттерн (комплекс II)',
    requiredConditions: {
      all: [
        { indicator: 'complexII', riskScoreMin: 3 },
        {
          any: [
            { indicator: 'nadh', riskScoreMin: 1 },
            { indicator: 'mitoMembrane', riskScoreMin: 1 },
            { indicator: 'nonMitoRespiration', riskScoreMin: 1 },
          ],
        },
      ],
    },
    supportingConditions: [
      { indicator: 'nadh', riskScoreMin: 1 },
      { indicator: 'mitoMembrane', riskScoreMin: 1 },
      { indicator: 'nonMitoRespiration', riskScoreMin: 1 },
    ],
    pathophysiology:
      'Нарушение сукцинатдегидрогеназы, дисбаланс сукцинат-фумарат, активация HIF-1α сигнализации, воспалительно-гипоксический метаболический сдвиг.',
    possibleCauses: [
      'Гипоксия',
      'Воспаление',
      'Дефицит FAD/B2, железо-серных кластеров',
      'Нарушение цикла Кребса',
      'Метаболический стресс',
    ],
    whatToCheck: [
      'Витамин B2',
      'Железо / ферритин',
      'Маркеры гипоксии',
      'Лактат',
      'Маркеры воспаления',
      'Печёночные показатели',
      'Физическая толерантность',
    ],
    clinicalMeaning:
      'Выраженное отклонение комплекса II в сочетании с изменениями NADH/мембраны/немитохондриального дыхания может соответствовать сукцинат-зависимому, гипоксически-воспалительному паттерну дыхательной цепи.',
    cautiousStrategy:
      'Целесообразно прежде оценить гипоксический и воспалительный статус, обеспеченность B2 и железом; вопрос энергетической поддержки рассматривать после этой оценки.',
  },
  {
    id: 'membraneAtpSynthase',
    order: 8,
    name: 'Мембранно-АТФ-синтазный паттерн',
    requiredConditions: {
      all: [
        { indicator: 'mitoMembrane', riskScoreMin: 1 },
        { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
      ],
    },
    supportingConditions: [{ indicator: 'complexV', riskScoreMin: 1 }],
    pathophysiology:
      'Недостаточный протонный градиент, нарушение мембранного потенциала (ΔΨ), сниженная эффективность АТФ-синтазы, мембранная нестабильность. Реакция комплекса V около нуля в этом контексте может отражать не норму, а функциональное «молчание» из-за отсутствия движущей силы градиента.',
    possibleCauses: [
      'Дефицит фосфолипидов, омега-3, CoQ10',
      'Дефицит магния',
      'Оксидативное повреждение',
      'Токсическое воздействие',
      'Воспаление',
    ],
    whatToCheck: [
      'Омега-3 индекс, липидный профиль',
      'Печень / желчь',
      'Магний',
      'Витамин D',
      'Маркеры воспаления',
      'Нутритивный статус',
    ],
    clinicalMeaning:
      'Сочетание нарушения мембраны со сниженной митохондриальной активностью может соответствовать мембранно-протонной дисфункции, ограничивающей синтез АТФ независимо от состояния самих комплексов дыхательной цепи.',
    cautiousStrategy:
      'Сначала стабилизация мембран (нутритивный статус, омега-3, антиоксидантная защита, снижение токсической нагрузки), затем — осторожная и постепенная поддержка энергетического обмена.',
  },
  {
    id: 'nonMitoCompensation',
    order: 9,
    name: 'Немитохондриальная компенсация / гликолитический сдвиг',
    requiredConditions: {
      all: [
        { indicator: 'nonMitoRespiration', riskScoreMin: 3 },
        { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
      ],
    },
    supportingConditions: [{ indicator: 'oxidativeStress', zoneIn: ['moderate', 'high'] }, anyComplexAbnormal],
    pathophysiology:
      'Смещение в сторону анаэробного гликолиза, цитоплазматическое окисление NADH, участие NADPH-оксидаз, ксантиноксидазы, ЛДГ-пути.',
    possibleCauses: [
      'Гипоксия',
      'Интенсивные тренировки',
      'Воспаление',
      'Метаболический синдром',
      'Инсулинорезистентность',
      'Постстрессовая адаптация',
    ],
    whatToCheck: [
      'Глюкоза, инсулин, HbA1c, HOMA-IR',
      'Лактат',
      'Мочевая кислота',
      'CRP',
      'Физическая нагрузка, сон, восстановление',
    ],
    clinicalMeaning:
      'Выраженное немитохондриальное дыхание на фоне низкой митохондриальной активности может отражать компенсаторный гликолитический сдвиг — клинически значим в сочетании с метаболическим профилем и переносимостью нагрузок.',
    cautiousStrategy:
      'Рассмотреть оценку гликемического и воспалительного профиля, режима нагрузок и восстановления прежде, чем интерпретировать находку как изолированную митохондриальную проблему.',
  },
  {
    id: 'overtrainingAllostatic',
    order: 10,
    name: 'Перетренированность / аллостатическая перегрузка',
    requiredConditions: { indicator: 'phagocytosis', zoneIn: ['low', 'severelyLow'] },
    supportingConditions: [
      { indicator: 'nst', zoneIn: ['low', 'severelyLow'] },
      { indicator: 'oxidativeStress', zoneIn: ['moderate', 'high'] },
      { indicator: 'proteinMetabolism', zoneIn: ['low', 'severelyLow'] },
      { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
    ],
    pathophysiology:
      'Кортизол-зависимое подавление иммунитета, катаболическая направленность обмена, истощение субстратов, сниженное восстановление, рост окислительной нагрузки.',
    possibleCauses: [
      'Чрезмерные тренировки',
      'Дефицит сна',
      'Дефицит калорий/белка',
      'Психологический стресс',
      'Частые перелёты/смена часовых поясов',
    ],
    whatToCheck: [
      'HRV, качество сна',
      'Дневник нагрузок',
      'Калорийность и белок рациона',
      'Ферритин, витамин D',
      'Кортизол по показаниям',
      'КФК (CK), мочевина',
    ],
    clinicalMeaning:
      'Сочетание сниженной иммунной реактивности с признаками окислительной и анаболической нагрузки на нескольких осях может соответствовать аллостатической перегрузке — клиническая картина определяется не отдельным показателем, а широтой вовлечённых систем.',
    cautiousStrategy:
      'Рассмотреть снижение/коррекцию тренировочной нагрузки, восстановление сна и питания как приоритет перед любыми другими вмешательствами; повторная оценка после периода разгрузки.',
  },
  {
    id: 'postInfectiousInflammatory',
    order: 11,
    name: 'Постинфекционный / хронически воспалительный митохондриальный паттерн',
    requiredConditions: {
      all: [
        { indicator: 'oxidativeStress', zoneIn: ['moderate', 'high'] },
        { indicator: 'mitoActivity', zoneIn: ['low', 'severelyLow'] },
        {
          any: [
            { indicator: 'phagocytosis', riskScoreMin: 1 },
            { indicator: 'nst', riskScoreMin: 1 },
            { indicator: 'calciumStress', riskScoreMin: 1 },
          ],
        },
        anyComplexAbnormal,
      ],
    },
    supportingConditions: [{ indicator: 'nadh', riskScoreMin: 1 }],
    pathophysiology:
      'Иммунно-метаболическое торможение, влияние ROS и цитокинов на OXPHOS, снижение биогенеза митохондрий.',
    possibleCauses: [
      'Вирусные инфекции',
      'Бактериальные очаги (хронический тонзиллит/синусит)',
      'Кишечное воспаление, дисбиоз',
    ],
    whatToCheck: [
      'CRP, ОАК',
      'Ферритин',
      'Очаги инфекции',
      'EBV/CMV по клинике',
      'Кишечные маркеры',
      'Сон, питание',
    ],
    clinicalMeaning:
      'Сочетание окислительной нагрузки, сниженной митохондриальной активности, иммунных отклонений и нарушений комплексов может отражать вторичное, иммунно-опосредованное угнетение митохондриальной функции на фоне хронического воспалительного/постинфекционного процесса — а не первичную митохондриальную патологию.',
    cautiousStrategy:
      'Приоритет — поиск и коррекция очага воспаления/инфекции, поддержка сна и питания; энергетическую интерпретацию пересмотреть после контроля воспалительного процесса.',
  },
  {
    id: 'adaptedTrained',
    order: 12,
    name: 'Относительно тренированный / адаптированный паттерн',
    requiredConditions: {
      all: [
        { indicator: 'mitoActivity', zoneIn: ['working', 'high'] },
        { indicator: 'oxidativeStress', zoneIn: ['low', 'moderate'] },
        { indicator: 'nonMitoRespiration', zoneIn: ['neutral', 'mildIncrease'] },
        { indicator: 'stressReaction', zoneIn: ['neutral', 'mildIncrease', 'mildDecrease'] },
      ],
    },
    supportingConditions: [],
    pathophysiology: 'Метаболическая гибкость, физиологическая адаптация к нагрузкам, сохранённый функциональный резерв.',
    possibleCauses: ['Регулярная физическая нагрузка с адекватным восстановлением'],
    whatToCheck: ['Жалобы и переносимость нагрузок', 'Качество сна и восстановления', 'Динамика показателей при повторном тесте'],
    clinicalMeaning:
      'Может быть вариантом нормы у физически активных пациентов, но требует сопоставления с жалобами, тренировочной нагрузкой и восстановлением — отклонения у плохо восстанавливающегося или симптомного пациента не следует автоматически трактовать как адаптацию.',
    cautiousStrategy:
      'Подтвердить отсутствием признаков перетренированности (хорошее самочувствие, нормальное восстановление) прежде, чем считать находку благоприятной; при симптомах — переоценить как один из иных паттернов.',
  },
]
