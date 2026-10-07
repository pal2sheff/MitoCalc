import type { CalculationConfig, DynamicsConfig } from '@/engine'
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
import { betweenStudiesEvents, comparabilityItems, controlGoals, dynamicsTypeTexts, WITHIN_ZONE_SHIFT_PP } from './dynamics'
import { conclusionChecklist, forbiddenPhrases } from './conclusion'
import { pairHints } from './pairHints'
import { authorDecisions } from './calibration'

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
  betweenStudiesEvents,
  comparabilityItems,
  controlGoals,
  conclusionChecklist,
  forbiddenPhrases,
  authorDecisions,
}

/** Конфигурация модуля динамики (глава 8). */
export const dynamicsConfig: DynamicsConfig = {
  comparabilityItems,
  withinZoneShiftPp: WITHIN_ZONE_SHIFT_PP,
  typeTexts: dynamicsTypeTexts,
  contourMembers: Object.fromEntries(contours.map((c) => [c.id, [...c.keyIndicators, ...c.additionalIndicators]])),
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
  pairHints,
}
