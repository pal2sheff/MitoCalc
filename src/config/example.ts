import type { IndicatorInputs } from '@/engine'

/**
 * Synthetic demo dataset for the "Загрузить пример" action. Values were
 * chosen to land in specific reference zones so the result screen shows a
 * coherent, non-trivial combination (oxidative-membrane damage + energy
 * deficit + a secondary inflammatory/complex signature) across all three
 * interpretation levels — not a real patient record.
 */
export const exampleInputs: IndicatorInputs = {
  phagocytosis: 65,
  nst: 45,
  oxidativeStress: 75,
  calciumStress: 35,
  proteinMetabolism: 50,
  mitoActivity: 25,
  nadh: 18,
  complexI: 10,
  complexII: 5,
  complexIII: -20,
  complexIV: -18,
  complexV: -10,
  mitoMembrane: -45,
  stressReaction: 5,
  nonMitoRespiration: 20,
}
