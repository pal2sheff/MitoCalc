import type { CalculationConfig } from '@/engine'
import { block1Indicators, block2Indicators, indicatorList, indicators } from './indicators'
import { referenceRanges } from './referenceRanges'
import { domains, domainCategories } from './domains'
import { patterns } from './patterns'
import { dynamicSafetyRules, staticSafetyNotes } from './safetyRules'
import { exampleInputs } from './example'

export {
  indicators,
  indicatorList,
  block1Indicators,
  block2Indicators,
  referenceRanges,
  domains,
  domainCategories,
  patterns,
  dynamicSafetyRules,
  staticSafetyNotes,
  exampleInputs,
}

/** Assembles the editable config layer into the shape `runCalculation` expects. */
export const calculationConfig: CalculationConfig = {
  indicatorList,
  referenceRanges,
  domains,
  patterns,
  safetyRules: dynamicSafetyRules,
  staticSafetyNotes,
}
