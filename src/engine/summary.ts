import type { ContourResult, LeadingContour, PatternPriority } from './types'

export interface ClinicalSummary {
  briefConclusion: string
  narrativeText: string
}

const CLINICAL_CHECK =
  'Вывод является функциональной гипотезой и требует сопоставления с жалобами, анамнезом, осмотром и стандартными анализами.'

/**
 * Формулировка вывода по разделу 6.3: один ведущий паттерн, далее его
 * проявления, далее направление поиска. Ведущий контур (раздел 5.4) задаёт
 * направление поиска причины.
 */
export function generateClinicalSummary(
  priority: PatternPriority,
  leadingContour: LeadingContour | null,
  contours: ContourResult[],
): ClinicalSummary {
  const { leading, manifestations } = priority

  const notEvaluatedContours = contours.filter((c) => c.status === 'не оценён').map((c) => c.label)
  const notEvaluatedText =
    notEvaluatedContours.length > 0
      ? ` Не оценивались, объём исследования их не включает: ${notEvaluatedContours.join(', ')}.`
      : ''

  const contourText = leadingContour
    ? ` Ведущий контур: ${leadingContour.contour.label} (${leadingContour.contour.state?.label}). Направление поиска: ${leadingContour.contour.searchDirection}`
    : ''

  if (!leading) {
    const briefConclusion = `${priority.leadingReason}${contourText}`
    return {
      briefConclusion,
      narrativeText: `${briefConclusion}${notEvaluatedText} ${CLINICAL_CHECK}`,
    }
  }

  const leadName = leading.subtype ? `${leading.pattern.name} (${leading.subtype})` : leading.pattern.name
  const withText =
    manifestations.length > 0 ? `. Проявления и уточнения: ${manifestations.map((m) => `${m.pattern.manualNumber}. ${m.pattern.name}`).join('; ')}` : ''

  const systemicText =
    priority.unconfirmedSystemic.length > 0 && leading.pattern.level !== 'A'
      ? ' Системный контекст не установлен: паттерны уровня A клиникой не подтверждены.'
      : ''

  const briefConclusion = `Ведущий паттерн: ${leadName}${withText}.${systemicText}${contourText}`

  const narrativeText =
    `${leading.pattern.conclusionLine}${systemicText}${contourText}${notEvaluatedText} ` +
    `${CLINICAL_CHECK} Приоритет действий: ${leading.pattern.cautiousStrategy}`

  return { briefConclusion, narrativeText }
}
