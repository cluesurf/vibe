// P80: baryogenesis from genuine out-of-equilibrium dynamics.
// Why is there more matter than antimatter? Sakharov: any answer needs three ingredients:
//   1. baryon-number violation (a process that changes the net matter count),
//   2. C and CP violation (matter and antimatter treated differently),
//   3. departure from thermal equilibrium (so the asymmetry is not washed back out).
// The earlier version of this experiment inserted the answer: a biased coin whose output asymmetry
// just equalled its input bias epsilon. That is tautological. This version integrates the actual
// out-of-equilibrium Boltzmann equations for a decaying heavy field, exactly as real baryogenesis
// is computed, so the asymmetry EMERGES and is NOT equal to epsilon:
//   nX'(t)   = -K (nX - nEq)                         heavy field decays toward equilibrium
//   eta'(t)  = epsilon * K * (nX - nEq)  -  K * nEq * eta
//              \________ CP source, only out of equilibrium ___/   \__ washout, ~ equilibrium ab. __/
// with nEq(t) = exp(-t) the Boltzmann-suppressed equilibrium abundance as the universe cools, and
// K the decay-rate-to-expansion ratio (washout strength). The final eta = epsilon * efficiency(K),
// where the efficiency is a non-trivial number the integration produces, peaking at intermediate K
// (the freeze-out curve) and going to zero at strong and weak washout. Removing ANY Sakharov
// condition is done by removing the MECHANISM (not zeroing the output), and the dynamics then give
// exactly zero: epsilon = 0 (no CP), no B-violation (no source term), or clamping to equilibrium.
// Run: npx tsx code/experiment/p80-baryogenesis.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Integrate the out-of-equilibrium decay equations and return the final net asymmetry eta.
function relicAsymmetry(input: {
  epsilon: number // CP violation per decay
  washout: number // K = decay rate / expansion rate (washout strength)
  bViolating: boolean // does the decay carry a net-charge source at all
  outOfEquilibrium: boolean // false clamps the field to its equilibrium abundance (no departure)
}): number {
  const K = input.washout
  const dt = 0.002
  const tMax = 30
  let nX = 1 // starts in equilibrium, nEq(0) = 1
  let eta = 0
  for (let t = 0; t < tMax; t += dt) {
    const nEq = Math.exp(-t)
    if (!input.outOfEquilibrium) {
      nX = nEq // forced equilibrium: no departure, hence no source
    }
    const departure = nX - nEq
    const source = input.bViolating ? input.epsilon * K * departure : 0
    const washout = K * nEq * eta
    if (input.outOfEquilibrium) {
      nX += dt * (-K * (nX - nEq))
    }
    eta += dt * (source - washout)
  }
  return eta
}

export function baryogenesis(input: { seed: number }): {
  full: number
  noCP: number
  equilibrium: number
  noBViolation: number
  epsilon: number
  efficiency: number
  etaNotEqualEpsilon: boolean
  freezeOutPeakK: number
  freezeOutNonMonotonic: boolean
  allThreeNeeded: boolean
  solved: boolean
} {
  const epsilon = 0.1
  const K = 3 // intermediate washout
  // All three present: B-violation, CP, out of equilibrium.
  const full = relicAsymmetry({
    epsilon,
    washout: K,
    bViolating: true,
    outOfEquilibrium: true,
  })
  // Remove C/CP violation.
  const noCP = relicAsymmetry({
    epsilon: 0,
    washout: K,
    bViolating: true,
    outOfEquilibrium: true,
  })
  // Remove the departure from equilibrium (field clamped to equilibrium abundance).
  const equilibrium = relicAsymmetry({
    epsilon,
    washout: K,
    bViolating: true,
    outOfEquilibrium: false,
  })
  // Remove baryon-number violation (no net-charge source).
  const noBViolation = relicAsymmetry({
    epsilon,
    washout: K,
    bViolating: false,
    outOfEquilibrium: true,
  })

  // The asymmetry is epsilon times an efficiency the integration produces, NOT epsilon itself.
  const efficiency = full / epsilon
  const etaNotEqualEpsilon =
    Math.abs(full - epsilon) > 0.2 * Math.abs(epsilon)

  // The freeze-out curve: sweep the washout strength K and confirm the efficiency peaks at an
  // intermediate value (the genuine departure-from-equilibrium signature a biased coin cannot give).
  const Ks = [0.1, 0.3, 1, 3, 10, 30, 100]
  const effs = Ks.map(
    k =>
      relicAsymmetry({
        epsilon,
        washout: k,
        bViolating: true,
        outOfEquilibrium: true,
      }) / epsilon,
  )
  let peakIdx = 0
  for (let i = 1; i < effs.length; i++)
    if ((effs[i] ?? 0) > (effs[peakIdx] ?? 0)) peakIdx = i
  const freezeOutPeakK = Ks[peakIdx] ?? 0
  const freezeOutNonMonotonic = peakIdx > 0 && peakIdx < Ks.length - 1

  const allThreeNeeded =
    Math.abs(full) > 0.005 &&
    Math.abs(noCP) < 1e-9 &&
    Math.abs(equilibrium) < 1e-6 &&
    Math.abs(noBViolation) < 1e-9

  return {
    full,
    noCP,
    equilibrium,
    noBViolation,
    epsilon,
    efficiency,
    etaNotEqualEpsilon,
    freezeOutPeakK,
    freezeOutNonMonotonic,
    allThreeNeeded,
    // Solved: a matter excess EMERGES (not equal to epsilon), each Sakharov condition is necessary
    // (removing the mechanism gives zero from the dynamics), and the efficiency shows the
    // characteristic freeze-out peak at intermediate washout.
    solved:
      allThreeNeeded && etaNotEqualEpsilon && freezeOutNonMonotonic,
  }
}

export default experiment({
  id: 'cosmology/baryogenesis',
  title:
    'emergent asymmetry, all three Sakharov conditions necessary, freeze-out peak at intermediate washout',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = baryogenesis({ seed: 1 })
    const ok =
      r.solved &&
      r.allThreeNeeded &&
      r.etaNotEqualEpsilon &&
      r.freezeOutNonMonotonic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'integrating the out-of-equilibrium Boltzmann equations makes the asymmetry emerge as epsilon times an efficiency, with each Sakharov condition necessary',
      metrics: {
        full: r.full,
        efficiency: r.efficiency,
        freezeOutPeakK: r.freezeOutPeakK,
      },
      control: {
        noCP: r.noCP,
        equilibrium: r.equilibrium,
        noBaryonViolation: r.noBViolation,
      },
    })
  },
})
