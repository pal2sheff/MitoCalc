import type { ContourResult, LeadingContour, PatternPriority, RedFlagResult, StudyContextResult } from './types'

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
  study: StudyContextResult,
  redFlags: RedFlagResult[],
): ClinicalSummary {
  const { leading, manifestations } = priority

  const confirmedFlags = redFlags.filter((f) => f.status === 'confirmed')
  const redFlagText =
    confirmedFlags.length > 0
      ? `Красный флаг: ${confirmedFlags.map((f) => f.finding.toLowerCase()).join('; ')}. Первоочередное действие — ${confirmedFlags.map((f) => f.action.toLowerCase()).join('; ')}; остальная интерпретация вторична. `
      : ''
  const studyText = `Комплектация: ${study.panel.label}. ${study.preanalytics.conclusionLine} `

  const notEvaluatedContours = contours.filter((c) => c.status === 'не оценён').map((c) => c.label)
  const notEvaluatedText =
    notEvaluatedContours.length > 0
      ? ` Не оценивались, объём исследования их не включает: ${notEvaluatedContours.join(', ')}.`
      : ''

  const contourText = leadingContour
    ? ` Ведущий контур: ${leadingContour.contour.label} (${leadingContour.contour.state?.label}). Направление поиска: ${leadingContour.contour.searchDirection}`
    : ''

  if (!leading) {
    const briefConclusion = `${redFlagText}${priority.leadingReason}${contourText}`
    return {
      briefConclusion,
      narrativeText: `${studyText}${briefConclusion}${notEvaluatedText} ${CLINICAL_CHECK}`,
    }
  }

  const leadName = leading.subtype ? `${leading.pattern.name} (${leading.subtype})` : leading.pattern.name
  const withText =
    manifestations.length > 0 ? `. Проявления и уточнения: ${manifestations.map((m) => `${m.pattern.manualNumber}. ${m.pattern.name}`).join('; ')}` : ''

  const systemicText =
    priority.unconfirmedSystemic.length > 0 && leading.pattern.level !== 'A'
      ? ' Системный контекст не установлен: паттерны уровня A клиникой не подтверждены.'
      : ''

  const briefConclusion = `${redFlagText}Ведущий паттерн: ${leadName}${withText}.${systemicText}${contourText}`

  const narrativeText =
    `${studyText}${redFlagText}${leading.pattern.conclusionLine}${systemicText}${contourText}${notEvaluatedText} ` +
    `${CLINICAL_CHECK} Приоритет действий: ${leading.pattern.cautiousStrategy}`

  return { briefConclusion, narrativeText }
}
