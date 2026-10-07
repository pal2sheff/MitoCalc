import type { ClinicalContext, ContourResult, IndicatorResult, RedFlagDefinition, RedFlagResult } from './types'
import { evaluateCondition, type IndicatorResultMap } from './conditions'

/** Красные флаги раздела 9.3: числовое условие + клиническая находка. */
export function detectRedFlags(
  indicatorResults: IndicatorResult[],
  contours: ContourResult[],
  context: ClinicalContext,
  defs: RedFlagDefinition[],
): RedFlagResult[] {
  const map: IndicatorResultMap = {}
  for (const r of indicatorResults) map[r.id] = r
  const maxSeverity = contours.reduce((m, c) => Math.max(m, c.state?.severity ?? 0), 0)

  const results: RedFlagResult[] = []
  for (const def of defs) {
    const numeric =
      (def.when ? evaluateCondition(def.when, map) : true) &&
      (def.contourSeverityMin !== undefined ? maxSeverity >= def.contourSeverityMin : true)

    let clinical = def.requiresFinding ? context.clinicalFindings.includes(def.requiresFinding) : true
    if (!clinical && def.neutropeniaBelow !== undefined && context.cbc.neutrophilsAbs !== undefined) {
      clinical = context.cbc.neutrophilsAbs < def.neutropeniaBelow
    }

    const base = { id: def.id, finding: def.finding, exclude: def.exclude, action: def.action }
    if (numeric && clinical) results.push({ ...base, status: 'confirmed' })
    else if (numeric && def.when && def.checkPrompt) results.push({ ...base, status: 'check', prompt: def.checkPrompt })
    else if (!numeric && clinical && def.id === 'constitutionalSymptoms') {
      results.push({
        ...base,
        status: 'check',
        prompt:
          'Отмечены немотивированная потеря веса, лихорадка, ночная потливость или лимфаденопатия. Онкопоиск показан по клинике независимо от результата анализа.',
      })
    }
  }
  return results
}
