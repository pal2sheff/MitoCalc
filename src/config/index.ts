import type { CalculationConfig } from '@/engine'
import { block1Indicators, block2Indicators, indicatorList, indicators } from './indicators'
import { referenceRanges } from './referenceRanges'
import { contours } from './contours'
import { panels } from './panels'
import { preanalyticItems, infectionPeriods, clinicalFindings, clinicalSituations } from './clinicalContext'
import { redFlags } from './redFlags'
import { baseWorkupSet, baseWorkupExtension, indicatorWorkup, nlrBands, garkaviBands } from './workup'
import { patterns } from './patterns'
import { dynamicSafetyRules, staticSafetyNotes } from './safetyRules'
import { exampleInputs } from './example'

export {
  indicators,
  indicatorList,
  block1Indicators,
  block2Indicators,
  referenceRanges,
  contours,
  patterns,
  panels,
  preanalyticItems,
  infectionPeriods,
  clinicalFindings,
  clinicalSituations,
  dynamicSafetyRules,
  staticSafetyNotes,
  exampleInputs,
}

/** Assembles the editable config layer into the shape `runCalculation` expects. */
export const calculationConfig: CalculationConfig = {
  indicatorList,
  referenceRanges,
  contours,
  patterns,
  safetyRules: dynamicSafetyRules,
  staticSafetyNotes,
  panels,
  preanalyticItems,
  infectionPeriods,
  clinicalFindings,
  redFlags,
  workup: {
    baseSet: baseWorkupSet,
    baseSetExtension: baseWorkupExtension,
    byIndicator: indicatorWorkup,
    situations: clinicalSituations,
  },
  nlrBands,
  garkaviBands,
}
