// P46: dynamical everpresent Lambda, from genuine Poisson statistics, stated honestly.
// Two earlier static-action attempts gave the WRONG observable: P19 (sharp 4D action variance) found
// delta-Lambda growing with volume (exponent +0.16), and P29 (smeared) only tamed it toward zero
// (+0.06). Neither is the everpresent prediction. The reason is that Lambda is NOT the static action
// variance. In unimodular gravity Lambda is the variable conjugate to the spacetime 4-volume V, and
// in a causal set V is the element count N, which is genuinely Poisson. So the conjugate Lambda
// fluctuates as delta-Lambda ~ delta-N / N = 1/sqrt(N) ~ 1/sqrt(V): Sorkin's everpresent prediction,
// exponent -1/2, with a fluctuating SIGN.
//
// Here we MEASURE this from genuine Poisson draws of the element count (the actual sprinkling
// statistics, not a Gaussian identity) and recover the -1/2 scaling. We are explicit about scope:
// this reproduces the everpresent MECHANISM and SCALING (the correct observable, the conjugate
// volume), reconciling the wrong-observable static-action results. The dark-energy NUMBER (~1e-122)
// is Sorkin's everpresent prediction evaluated at the observed 4-volume, adopted, not independently
// derived here. Run: npx tsx code/experiment/p46-everpresent-dynamical.ts

import { makeRng, poissonSample } from '@/code/tool/rng'
import { logLogSlope } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Measure the RMS of the implied Lambda fluctuation, delta-Lambda = (N - V) / V, from GENUINE Poisson
// draws of the element count N at expected 4-volume V (in Planck units, N = V at unit density).
export function everpresentDynamical(input: { volumes: number[]; repeats: number; seed: number }): {
  rms: number[]
  exponent: number
} {
  const rng = makeRng({ seed: input.seed })
  const rms = input.volumes.map((v) => {
    let sumSq = 0
    for (let r = 0; r < input.repeats; r++) {
      const n = poissonSample({ lambda: v, rng }) // the genuine causal-set element count, Poisson(V)
      const lambda = (n - v) / v
      sumSq += lambda * lambda
    }
    return Math.sqrt(sumSq / input.repeats)
  })
  return { rms, exponent: logLogSlope(input.volumes, rms) }
}

export function everpresent(input: { seed: number }): {
  exponent: number
  matchesEverpresent: boolean
  darkEnergyOrderOfMagnitude: number
  observedOrderOfMagnitude: number
  sameOrderAsObserved: boolean
  solved: boolean
} {
  // Knuth-safe volumes (e^-V representable): genuine Poisson draws give the -1/2 scaling.
  const volumes = [50, 100, 200, 400]
  const { exponent } = everpresentDynamical({ volumes, repeats: 40000, seed: input.seed })
  const matchesEverpresent = Math.abs(exponent + 0.5) < 0.05

  // The dark-energy VALUE is the everpresent prediction at the observed 4-volume (adopted, Sorkin).
  const cT = 2.998e8 * 4.35e17
  const lP = 1.616e-35
  const Vobs = (cT / lP) ** 4
  const darkEnergyOrderOfMagnitude = Math.log10(1 / Math.sqrt(Vobs)) // ~ -122 in Planck units
  const observedOrderOfMagnitude = Math.log10(1.1e-52 * lP * lP) // observed Lambda in Planck units
  const sameOrderAsObserved = Math.abs(darkEnergyOrderOfMagnitude - observedOrderOfMagnitude) < 3

  return {
    exponent,
    matchesEverpresent,
    darkEnergyOrderOfMagnitude,
    observedOrderOfMagnitude,
    sameOrderAsObserved,
    // Solved: the everpresent -1/2 scaling is recovered from genuine Poisson statistics (the correct
    // conjugate-volume observable), and at the observed volume the adopted scaling lands at the
    // observed order of magnitude. The exact value and sign are not independently derived.
    solved: matchesEverpresent && sameOrderAsObserved,
  }
}

export default experiment({
  id: 'cosmology/everpresent-dynamical',
  title: 'genuine Poisson statistics give V^-0.5, adopted scaling matches the observed order of magnitude',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = everpresent({ seed: 1 })
    const ok = r.solved && r.matchesEverpresent && r.sameOrderAsObserved
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'genuine Poisson draws of the element count recover delta-Lambda ~ V^-0.5 and the adopted scaling lands at the observed dark-energy order of magnitude',
      metrics: {
        exponent: r.exponent,
        darkEnergyOrderOfMagnitude: r.darkEnergyOrderOfMagnitude,
        observedOrderOfMagnitude: r.observedOrderOfMagnitude,
      },
      notes:
        'the dark-energy value is Sorkin everpresent prediction at the observed 4-volume, adopted not independently derived',
    })
  },
})
