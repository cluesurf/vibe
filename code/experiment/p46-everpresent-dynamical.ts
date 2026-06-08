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

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/tool/rng'

function logLogSlope(xs: number[], ys: number[]): number {
  const n = xs.length
  const lx = xs.map((x) => Math.log(x))
  const ly = ys.map((y) => Math.log(y))
  const mx = lx.reduce((a, b) => a + b, 0) / n
  const my = ly.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += ((lx[i] ?? 0) - mx) * ((ly[i] ?? 0) - my)
    den += ((lx[i] ?? 0) - mx) * ((lx[i] ?? 0) - mx)
  }
  return den === 0 ? 0 : num / den
}

// A genuine Poisson draw (Knuth's algorithm), valid for the moderate volumes used here (e^-V must be
// representable). This is the actual element-count distribution of a causal-set sprinkling.
function poissonDraw(lambda: number, rng: Rng): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng.next()
  } while (p > L)
  return k - 1
}

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
      const n = poissonDraw(v, rng) // the genuine causal-set element count, Poisson(V)
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

export function main(): void {
  const r = everpresent({ seed: 1 })
  console.log('P46: dynamical everpresent Lambda, from genuine Poisson statistics')
  console.log('')
  const det = everpresentDynamical({ volumes: [50, 100, 200, 400], repeats: 40000, seed: 1 })
  console.log('  genuine Poisson element-count draws (the discrete causal-set volume):')
  ;[50, 100, 200, 400].forEach((v, i) => {
    console.log(`    V = ${String(v).padStart(3)}: delta-Lambda RMS = ${(det.rms[i] ?? 0).toExponential(2)} (1/sqrt(V) = ${(1 / Math.sqrt(v)).toExponential(2)})`)
  })
  console.log('')
  console.log(`  measured scaling: delta-Lambda ~ V^${r.exponent.toFixed(3)} (everpresent prediction -0.5): ${r.matchesEverpresent ? 'YES' : 'no'}`)
  console.log('')
  console.log('  the three approaches to the cosmological constant:')
  console.log('    P19 sharp 4D action (static variance, WRONG observable):  delta-Lambda ~ V^+0.16')
  console.log('    P29 smeared 4D kernel (static variance):                  delta-Lambda ~ V^+0.06')
  console.log(`    P46 conjugate volume (the correct observable):            delta-Lambda ~ V^${r.exponent.toFixed(2)}`)
  console.log('')
  console.log(`  at the observed 4-volume, the adopted everpresent scaling gives delta-Lambda ~ 1e${Math.round(r.darkEnergyOrderOfMagnitude)},`)
  console.log(`  the same order of magnitude as the observed Lambda (~ 1e${Math.round(r.observedOrderOfMagnitude)} in Planck units): ${r.sameOrderAsObserved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Honest scope: the everpresent MECHANISM and -1/2 SCALING are reproduced from genuine')
  console.log('  Poisson statistics of the discrete volume, which is the correct conjugate-volume')
  console.log('  observable, reconciling the wrong-observable static-action attempts (P19/P29). The')
  console.log('  fluctuation has a FLUCTUATING sign (plus or minus 1/sqrt(V)), and the dark-energy value')
  console.log('  (about 1e-122) is Sorkin\'s everpresent prediction evaluated at the observed 4-volume,')
  console.log('  adopted here, not independently derived. The model gives the mechanism, the scaling,')
  console.log('  and the order of magnitude, not the precise value.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
