import type { DomainResult, OverallRiskLevel, PatternMatch } from './types'

export interface ClinicalSummary {
  briefConclusion: string
  narrativeText: string
}

/**
 * Level 3 wrap-up: turns the already-computed lead domain + top patterns
 * into hedged, physician-facing text. Reads only `PatternMatch.pattern`
 * (data already resolved by `detectPatterns`), so no config import is
 * needed here — keeps the engine decoupled from `src/config`.
 */
export function generateClinicalSummary(
  overallRiskLevel: OverallRiskLevel,
  leadDomain: DomainResult | null,
  topPatterns: PatternMatch[],
): ClinicalSummary {
  if (topPatterns.length === 0) {
    const briefConclusion = leadDomain
      ? `Выраженных клинических паттернов не выявлено. Основное направление внимания — домен «${leadDomain.label}» (${leadDomain.category}).`
      : 'Выраженных отклонений и клинических паттернов не выявлено. Показатели МИТО-паспорта преимущественно в пределах рабочих диапазонов.'

    const narrativeText = leadDomain
      ? `По данным МИТО-паспорта чётко выраженных клинических паттернов не определяется. Наибольшее напряжение отмечается в домене «${leadDomain.label}»: ${leadDomain.interpretation} Рекомендуется сопоставить с жалобами, анамнезом, объективным осмотром, образом жизни (сон, питание, нагрузка, восстановление) и стандартными лабораторными показателями перед формированием клинических выводов.`
      : 'По данным МИТО-паспорта значимых отклонений и клинических паттернов не определяется. Это не исключает необходимости клинической оценки при наличии жалоб — результат следует сопоставлять с анамнезом, осмотром и стандартными методами диагностики.'

    return { briefConclusion, narrativeText }
  }

  const [leadMatch, ...otherMatches] = topPatterns
  const lead = leadMatch.pattern

  const briefConclusion =
    `Ведущий паттерн: «${lead.name}» (уверенность: ${leadMatch.confidence})` +
    `${leadDomain ? `, основной домен напряжения — «${leadDomain.label}»` : ''}.` +
    ` Общий уровень риска: ${overallRiskLevel}.`

  const otherPatternsText =
    otherMatches.length > 0
      ? ` Также обращают на себя внимание: ${otherMatches.map((m) => `«${m.pattern.name}» (уверенность: ${m.confidence})`).join(', ')}.`
      : ''

  const narrativeText =
    `По данным МИТО-паспорта определяется паттерн «${lead.name}» (уверенность: ${leadMatch.confidence}). ` +
    `${lead.clinicalMeaning} ` +
    `Это может отражать следующие механизмы: ${lead.pathophysiology} ` +
    `Возможные причины: ${lead.possibleCauses.join(', ')}. ` +
    `Наиболее вероятные направления поиска: ${lead.whatToCheck.join(', ')}.` +
    `${otherPatternsText} ` +
    `Рекомендуется сопоставить с жалобами, анамнезом, объективным осмотром, образом жизни (сон, питание, нагрузка, восстановление) и стандартными лабораторными показателями перед формированием клинических выводов. ${lead.cautiousStrategy}`

  return { briefConclusion, narrativeText }
}
