// P35: this is an ANALYTIC / CONSISTENCY CHECK that ASSUMES standard causal-set and discreteness results, then
// plugs real physical constants into them. None of these numbers are produced by the vibe substrate. Specifically
// it ASSUMES:
//   - Dark energy: Sorkin's everpresent-Lambda formula delta-Lambda ~ 1/sqrt(V) is ASSUMED, and we simply
//     evaluate it at the observed 4-volume. The order-of-magnitude match to the measured Lambda follows from
//     the assumed formula plus the measured constants. The substrate is not shown to derive this formula.
//   - Lorentz violation: it ASSUMES the random-sprinkling Lorentz-safety result (P27) gives NO linear LIV, and
//     compares to the measured gamma-ray-burst bound. The prediction value is assumed, not derived here.
//   - Swerves: it ASSUMES the Planck-suppressed diffusion (P26) and notes it sits below current bounds.
// All inputs are real physical constants and measurements, fed into assumed formulas. This file does NOT show
// the vibe substrate produces any of these predictions. See note/questions/frontiers.md.
// Run: npx tsx code/experiment/p35-contact-with-data.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Physical constants (SI) and the relevant measurements.
const C = 2.998e8 // speed of light, m/s
const PLANCK_LENGTH = 1.616e-35 // m
const PLANCK_ENERGY_GEV = 1.22e19 // GeV
const AGE_OF_UNIVERSE = 4.35e17 // s (13.8 Gyr)
const LAMBDA_OBSERVED = 1.1e-52 // observed cosmological constant, m^-2

// Order-of-magnitude formatting.

export function darkEnergyPrediction(): { predicted: number; observed: number; ratio: number } {
  // Spacetime 4-volume of the observable past, in Planck 4-volumes: (c t / l_P)^4.
  const horizon = C * AGE_OF_UNIVERSE // meters
  const v4 = (horizon / PLANCK_LENGTH) ** 4
  // Everpresent Lambda: delta-Lambda ~ 1/sqrt(V) in Planck units.
  const predicted = 1 / Math.sqrt(v4)
  // Observed Lambda in Planck units (multiply by l_P^2).
  const observed = LAMBDA_OBSERVED * PLANCK_LENGTH * PLANCK_LENGTH
  return { predicted, observed, ratio: predicted / observed }
}

export function lorentzPrediction(): { gribBoundInPlanck: number; frameworkLinearLIV: boolean } {
  // Gamma-ray-burst bound (GRB 090510, Fermi LAT): the linear-LIV energy scale exceeds
  // about 7.6 times the Planck energy, so linear LIV is excluded below the Planck scale.
  // The framework (random sprinkling, P27) predicts NO linear LIV at all.
  return { gribBoundInPlanck: 7.6, frameworkLinearLIV: false }
}

export default defineExperiment({
  id: 'cosmology/contact-with-data',
  title: 'adopted everpresent scaling lands at the observed dark-energy order of magnitude, no linear Lorentz violation',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const de = darkEnergyPrediction()
    const liv = lorentzPrediction()
    const ok = de.ratio > 0.1 && de.ratio < 10 && liv.frameworkLinearLIV === false && liv.gribBoundInPlanck > 1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the adopted everpresent Lambda formula at the observed 4-volume matches the measured dark energy to an order of magnitude and the framework predicts no linear Lorentz violation',
      metrics: {
        lambdaRatio: de.ratio,
        frameworkLinearLorentzViolation: liv.frameworkLinearLIV ? 1 : 0,
        gammaRayBurstBoundInPlanck: liv.gribBoundInPlanck,
      },
      notes:
        'analytic consistency check that plugs real constants into assumed causal-set formulas, the values are adopted not derived from the substrate',
    })
  },
})
