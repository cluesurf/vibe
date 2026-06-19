// P70: the Born rule, derived without assuming it.
// The model makes exactly one quantum assumption: a patch's amplitude is the square
// root of how many vibes are co-excited in it, amplitude = sqrt(count). Everything
// below is derived from that plus "a measurement samples the substrate fairly."
//
// The earlier version of this experiment seeded the substrate with weights = |c|^2
// and then "recovered" |c|^2 (circular), and "selected exponent 2" by comparing to
// that same pre-squared data (rigged). Both are removed. The exponent 2 is now
// forced by a functional equation, not by peeking at the answer:
//   1. Disjoint patches: their vibe counts add, so (amplitude = sqrt count) means
//      amplitudes add in quadrature, a_total^2 = a1^2 + a2^2. A substrate fact,
//      measured here, not assumed.
//   2. Probabilities of disjoint outcomes must add: P_total = P1 + P2.
//   3. If P = |a|^p, then (1) and (2) force (a1^2 + a2^2)^(p/2) = a1^p + a2^p for
//      ALL amplitudes, which holds only at p = 2. The exponent is selected by
//      self-consistency, not by comparison to |c|^2.
//   4. Fair sampling of the vibes then gives probability = count / total =
//      amplitude^2 = |c|^2, the Born rule.
// Run: npx tsx code/experiment/p70-born-rule.ts

import {
  quadratureAdditivityResidual,
  exponentResidual,
  fairSampleFrequencies,
} from '@/code/measure/born-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function bornRule(input: { seed: number }): {
  born: number[]
  sampled: number[]
  samplingError: number
  quadratureResidual: number
  exponentResiduals: { p: number; residual: number }[]
  uniqueExponent: number
  solved: boolean
} {
  const amps = [0.2, 0.5, 0.7, 0.46] // amplitudes, NOT pre-squared
  const norm2 = amps.reduce((s, c) => s + c * c, 0)
  const born = amps.map(c => (c * c) / norm2) // the answer we must reproduce
  const scale = 100000

  const quadratureResidual = quadratureAdditivityResidual(amps, scale)
  const exponentResiduals = [1, 2, 3].map(p => ({
    p,
    residual: exponentResidual({ p, seed: input.seed + p }),
  }))

  const uniqueExponent = exponentResiduals.reduce(
    (best, e) => (e.residual < best.residual ? e : best),
    exponentResiduals[0] ?? { p: 2, residual: 0 },
  ).p

  const sampled = fairSampleFrequencies({
    amps,
    scale,
    draws: 400000,
    seed: input.seed + 17,
  })

  let samplingError = 0

  for (let k = 0; k < born.length; k++) {
    samplingError = Math.max(
      samplingError,
      Math.abs((sampled[k] ?? 0) - (born[k] ?? 0)),
    )
  }

  const p1 = exponentResiduals.find(e => e.p === 1)?.residual ?? 0
  const p2 = exponentResiduals.find(e => e.p === 2)?.residual ?? 1
  const p3 = exponentResiduals.find(e => e.p === 3)?.residual ?? 0

  return {
    born,
    sampled,
    samplingError,
    quadratureResidual,
    exponentResiduals,
    uniqueExponent,
    // Solved: quadrature additivity holds, the functional equation selects p=2 alone
    // (p=1 and p=3 fail by a wide margin), and fair sampling reproduces |c|^2.
    solved:
      quadratureResidual < 1e-6 &&
      p2 < 1e-9 &&
      p1 > 0.05 &&
      p3 > 0.05 &&
      samplingError < 0.01,
  }
}

export default experiment({
  id: 'quantum/born-rule',
  title: 'the exponent 2 is forced by quadrature plus additivity',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = bornRule({ seed: 1 })
    const ok =
      r.solved &&
      r.uniqueExponent === 2 &&
      r.quadratureResidual < 1e-6 &&
      r.samplingError < 0.01

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the functional equation forces the exponent 2 and fair substrate sampling then yields the Born weights',
      metrics: {
        quadratureResidual: r.quadratureResidual,
        uniqueExponent: r.uniqueExponent,
        samplingError: r.samplingError,
      },
    })
  },
})
