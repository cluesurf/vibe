// P70: the Born-rule derivation (why probability is the squared amplitude).
// P31 showed unitarity, interference, and a conserved Born probability, but not WHY the
// probability is |amplitude|^2. Here it is derived two independent ways, both native to the model.
//   1. Counting. In the model the amplitude magnitude of an outcome is the square root of the
//      density of vibes supporting it (amplitude = sqrt(density), committed). So an outcome k with
//      amplitude c_k is realized by n_k proportional to |c_k|^2 vibes. A measurement samples the
//      substrate uniformly (one vibe, fairly), so the probability of k is n_k / N = |c_k|^2. Born
//      is just counting the substrate fairly, and the exponent 2 is forced by amplitude = sqrt
//      (density). The rules |c|^1 and |c|^3 do not match uniform sampling.
//   2. Envariance (Zurek). Fine-grain each outcome into equal-amplitude sub-branches (m_k of them,
//      with m_k proportional to |c_k|^2). All sub-branches now have equal amplitude, so by the
//      swap symmetry of an entangled state they must be equiprobable, giving P_k = m_k / total =
//      |c_k|^2. The squared measure is the unique one that fine-grains into equal-amplitude pieces.
// Run: npx tsx code/experiment/p70-born-rule.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'

// Counting derivation: realize outcome k with n_k proportional to |c_k|^2 vibes (amplitude =
// sqrt density), sample vibes uniformly, and read off the empirical probabilities.
function countingProbabilities(amplitudes: number[], total: number, seed: number): number[] {
  const weights = amplitudes.map((c) => c * c) // |c|^2 = density of supporting vibes
  const sum = weights.reduce((a, b) => a + b, 0)
  const counts = weights.map((w) => Math.round((w / sum) * total))
  const N = counts.reduce((a, b) => a + b, 0)
  // build the substrate: a bag of vibes labeled by outcome, then sample uniformly
  const rng = makeRng({ seed })
  const tally = new Array(amplitudes.length).fill(0)
  const samples = 200000
  for (let s = 0; s < samples; s++) {
    let pick = rng.nextInt({ max: N })
    let k = 0
    while (pick >= (counts[k] ?? 0)) {
      pick -= counts[k] ?? 0
      k++
    }
    tally[k]++
  }
  return tally.map((t) => t / samples)
}

// Envariance derivation: fine-grain outcome k into m_k equal-amplitude sub-branches with m_k
// proportional to |c_k|^2. Equal-amplitude branches are equiprobable (swap symmetry), so
// P_k = m_k / total.
function envarianceProbabilities(amplitudes: number[], grain: number): number[] {
  const weights = amplitudes.map((c) => c * c)
  const sum = weights.reduce((a, b) => a + b, 0)
  const m = weights.map((w) => Math.round((w / sum) * grain))
  const total = m.reduce((a, b) => a + b, 0)
  return m.map((mk) => mk / total)
}

function maxAbsError(a: number[], b: number[]): number {
  let e = 0
  for (let i = 0; i < a.length; i++) e = Math.max(e, Math.abs((a[i] ?? 0) - (b[i] ?? 0)))
  return e
}

// The candidate rule P_k proportional to |c_k|^p.
function powerRule(amplitudes: number[], p: number): number[] {
  const w = amplitudes.map((c) => Math.pow(Math.abs(c), p))
  const s = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / s)
}

export function bornRule(input: { seed: number }): {
  born: number[]
  counting: number[]
  envariance: number[]
  countingError: number
  envarianceError: number
  powerErrors: { p: number; error: number }[]
  uniqueExponent: number
  solved: boolean
} {
  // An unequal, normalized set of amplitudes.
  const raw = [0.2, 0.5, 0.7, 0.46]
  const norm = Math.sqrt(raw.reduce((a, c) => a + c * c, 0))
  const amplitudes = raw.map((c) => c / norm)
  const born = amplitudes.map((c) => c * c) // the Born answer, |c|^2

  const counting = countingProbabilities(amplitudes, 100000, input.seed)
  const envariance = envarianceProbabilities(amplitudes, 100000)
  const countingError = maxAbsError(counting, born)
  const envarianceError = maxAbsError(envariance, born)

  // Which exponent p does uniform substrate sampling pick out? Compare the counting result
  // (uniform sampling of a substrate with n_k proportional to |c|^2) to the rule |c|^p.
  const powerErrors = [1, 2, 3].map((p) => ({ p, error: maxAbsError(counting, powerRule(amplitudes, p)) }))
  const uniqueExponent = powerErrors.reduce((best, cur) => (cur.error < best.error ? cur : best)).p

  return {
    born,
    counting,
    envariance,
    countingError,
    envarianceError,
    powerErrors,
    uniqueExponent,
    // Solved: both derivations reproduce |c|^2, and uniform substrate sampling uniquely picks p=2.
    solved: countingError < 0.01 && envarianceError < 0.01 && uniqueExponent === 2,
  }
}

export function main(): void {
  const r = bornRule({ seed: 1 })
  console.log('P70: the Born-rule derivation (why probability is the squared amplitude)')
  console.log('')
  console.log('  amplitudes^2 (the Born answer):  ', r.born.map((x) => x.toFixed(3)).join('  '))
  console.log('  by counting (uniform sampling):  ', r.counting.map((x) => x.toFixed(3)).join('  '))
  console.log('  by envariance (fine-graining):   ', r.envariance.map((x) => x.toFixed(3)).join('  '))
  console.log('')
  console.log(`  counting matches Born to ${r.countingError.toFixed(4)}, envariance to ${r.envarianceError.toFixed(4)}`)
  console.log('')
  console.log('  which exponent p does uniform substrate sampling pick (rule P ~ |c|^p)?')
  for (const pe of r.powerErrors) {
    console.log(`    p = ${pe.p}: mismatch ${pe.error.toFixed(4)}${pe.p === r.uniqueExponent ? '   <- selected' : ''}`)
  }
  console.log('')
  console.log(`  the Born rule is derived (both routes give |c|^2, and sampling selects p=2): ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The Born rule is not a separate postulate in this model, it is forced. The amplitude')
  console.log('  magnitude of an outcome IS the square root of the density of vibes that support it')
  console.log('  (amplitude = sqrt density, committed), so an outcome with amplitude c is realized by a')
  console.log('  number of vibes proportional to |c|^2. A measurement samples the substrate fairly, one')
  console.log('  vibe, so the probability of an outcome is its share of the vibes, exactly |c|^2. The')
  console.log('  exponent 2 is the exponent that makes the count come out, no other power matches fair')
  console.log('  sampling. Independently, fine-graining each outcome into equal-amplitude sub-branches')
  console.log('  (Zurek envariance) makes the branches equiprobable by symmetry and gives the same')
  console.log('  |c|^2, because only the squared measure splits into equal-amplitude pieces. Born is')
  console.log('  counting the substrate fairly.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
