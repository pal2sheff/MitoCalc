import type {
  CbcIndices,
  ClinicalContext,
  ClinicalSituationDefinition,
  IndicatorId,
  IndicatorResult,
  IndicatorWorkup,
  PatternMatch,
  WorkupPlan,
} from './types'

export interface WorkupConfig {
  baseSet: string[]
  baseSetExtension: string
  byIndicator: Record<IndicatorId, IndicatorWorkup>
  situations: ClinicalSituationDefinition[]
}

/** План обследования по главе 7: базовый набор, по показателям, по паттернам, по клинической ситуации. */
export function buildWorkup(
  indicatorResults: IndicatorResult[],
  orderedPatterns: PatternMatch[],
  context: ClinicalContext,
  config: WorkupConfig,
): WorkupPlan {
  const byId = new Map(indicatorResults.map((r) => [r.id, r]))

  return {
    baseSet: config.baseSet,
    baseSetExtension: config.baseSetExtension,
    byIndicator: indicatorResults
      .filter((r) => r.riskScore > 0)
      .map((r) => ({
        id: r.id,
        label: r.definition.shortLabel,
        zoneLabel: r.zone.label,
        firstLine: config.byIndicator[r.id].firstLine,
        secondLine: config.byIndicator[r.id].secondLine,
      })),
    byPattern: orderedPatterns.map((m) => ({
      manualNumber: m.pattern.manualNumber,
      name: m.pattern.name,
      excludeFirst: m.pattern.excludeFirst,
      analyses: m.pattern.whatToCheck,
    })),
    situations: config.situations
      .filter((s) => context.situations.includes(s.id))
      .map((s) => ({
        id: s.id,
        label: s.label,
        indicators: s.indicatorIds.map((id) => {
          const r = byId.get(id)
          return {
            id,
            label: r?.definition.shortLabel ?? id,
            zoneLabel: r ? r.zone.label : null,
            deviated: !!r && r.riskScore > 0,
          }
        }),
      })),
  }
}

/** Индексы из ОАК (раздел 7.5). */
export function calculateCbcIndices(
  context: ClinicalContext,
  indicatorResults: IndicatorResult[],
  nlrBands: { max: number; text: string }[],
  garkaviBands: { maxPct: number; type: string }[],
): CbcIndices {
  const { neutrophilsAbs, lymphocytesAbs, lymphocytesPct } = context.cbc
  const notes: string[] = []

  const nlr =
    neutrophilsAbs !== undefined && lymphocytesAbs !== undefined && lymphocytesAbs > 0
      ? (() => {
          const value = Math.round((neutrophilsAbs / lymphocytesAbs) * 100) / 100
          return { value, interpretation: nlrBands.find((b) => value <= b.max)!.text }
        })()
      : null

  const garkavi =
    lymphocytesPct !== undefined ? { type: garkaviBands.find((b) => lymphocytesPct <= b.maxPct)!.type, lymphocytesPct } : null

  if (nlr) notes.push('НЛС неспецифично и не имеет утверждённых диагностических порогов: используется как ориентир рядом с фагоцитозом, НСТ и оксидативным стрессом.')
  if (garkavi) {
    notes.push('Тип реакции по Гаркави: границы различаются по источникам, международного стандарта нет. Наиболее полезен в динамике у одного пациента.')
    const stress = indicatorResults.find((r) => r.id === 'stressReaction')
    const absent = stress && ['neutral', 'neg', 'negStrong'].includes(stress.zone.id)
    if (absent && (garkavi.type === 'Реакция стресса' || garkavi.type === 'Переактивация')) {
      notes.push(`${garkavi.type} рядом с отсутствием ответа на кортизоловую пробу усиливает гипотезу о сниженном адаптационном резерве.`)
    }
  }

  return { nlr, garkavi, notes }
}
