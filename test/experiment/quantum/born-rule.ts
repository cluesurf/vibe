// P70: the Born exponent from branch counting, with the postulate stated plainly.
// The POSTULATE (assumed input, not derived): a patch's amplitude is the square root
// of how many vibes are co-excited in it, amplitude = sqrt(count), and a measurement
// samples the vibes fairly. Given that postulate, what is SHOWN here is that the
// exponent 2 is the unique self-consistent power among the tested family P = |a|^p:
//   1. Disjoint patches: their vibe counts add.
//   2. Probabilities of disjoint outcomes must add: P_total = P1 + P2.
//   3. If P = |a|^p with a = sqrt(count), then (1) and (2) require
//      (a1^2 + a2^2)^(p/2) = a1^p + a2^p for ALL amplitudes. p = 1 and p = 3 fail
//      this by a wide margin (the discriminating measurement below), p = 2 holds.
//   4. Fair sampling of the vibes then gives probability = count / total =
//      amplitude^2 = |c|^2, the Born weights.
// Two quantities that earlier versions treated as pass criteria are arithmetic
// identities that cannot fail and are now printed only as labeled consistency
// metrics: the quadrature residual sqrt(n1+n2)^2 - (sqrt(n1)^2 + sqrt(n2)^2) is 0
// for ANY counts, and the p = 2 residual (a1^2 + a2^2)^1 - (a1^2 + a2^2) is 0 for
// ANY amplitudes. The real content is the REJECTION of p = 1 and p = 3, which is
// the known Everett-Graham branch-counting mathematics.

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

  // an identity, printed as a consistency metric only: it is 0 for any counts
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
  const p3 = exponentResiduals.find(e => e.p === 3)?.residual ?? 0

  return {
    born,
    sampled,
    samplingError,
    quadratureResidual,
    exponentResiduals,
    uniqueExponent,
    // Solved: p = 1 and p = 3 FAIL the additivity equation by a wide margin (the
    // real discriminating criterion, the identities above are not counted) and
    // fair sampling reproduces |c|^2. The p = 2 residual is an identity (always 0)
    // and the quadrature residual is an identity (always 0), so neither is a
    // criterion.
    solved: p1 > 0.05 && p3 > 0.05 && samplingError < 0.01,
  }
}

export default experiment({
  id: 'quantum/born-rule',
  code: 'E-QTM-0005',
  title:
    'given the amplitude-equals-sqrt-count postulate, the exponent 2 is the unique self-consistent power among the tested family, p = 1 and p = 3 are rejected by additivity',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const r = bornRule({ seed: 1 })
    const ok = r.solved && r.uniqueExponent === 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'amplitude = sqrt(branch count) plus fair sampling is the assumed postulate, and given it the additivity of disjoint outcomes rejects p = 1 and p = 3 by a wide margin while p = 2 survives, so the exponent 2 is the unique self-consistent power among the tested family and fair sampling then yields the Born weights',
      metrics: {
        // identity, cannot fail: sqrt(n1+n2)^2 - (sqrt(n1)^2 + sqrt(n2)^2) is 0 for any counts
        quadratureResidualIdentity: r.quadratureResidual,
        uniqueExponent: r.uniqueExponent,
        p1Residual:
          r.exponentResiduals.find(e => e.p === 1)?.residual ?? 0,
        // identity, cannot fail: (a1^2 + a2^2)^1 - (a1^2 + a2^2) is 0 for any amplitudes
        p2ResidualIdentity:
          r.exponentResiduals.find(e => e.p === 2)?.residual ?? 0,
        p3Residual:
          r.exponentResiduals.find(e => e.p === 3)?.residual ?? 0,
        samplingError: r.samplingError,
      },
      control: {
        // p = 1 and p = 3 are the controls: they fail the additivity equation by a
        // wide margin, so the equation genuinely discriminates among exponents
        p1Residual:
          r.exponentResiduals.find(e => e.p === 1)?.residual ?? 0,
        p3Residual:
          r.exponentResiduals.find(e => e.p === 3)?.residual ?? 0,
      },
      notes:
        'L1. The postulate (assumed input, not derived): amplitude = sqrt(branch count) and fair sampling of the branches. What is shown: among the tested family P = |a|^p, the additivity of disjoint outcomes rejects p = 1 and p = 3 (residuals about 0.29 and 0.41) while p = 2 is consistent, and fair sampling reproduces |c|^2. Two quantities are printed as labeled identities, not criteria: the quadrature residual is 0 for any counts and the p = 2 residual is 0 for any amplitudes, neither can fail. This is the known branch-counting mathematics of Everett (Rev. Mod. Phys. 29, 454 (1957)) and Graham (in The Many-Worlds Interpretation of Quantum Mechanics, 1973). The stronger uniqueness results, that the quadratic measure is the only consistent one on Hilbert space, are Gleason (J. Math. Mech. 6, 885 (1957)) and Zurek envariance (Phys. Rev. Lett. 90, 120404 (2003), tested separately in E-QTM-0012). The measurement here is the p = 1 versus p = 3 rejection plus the sampling check, not a derivation of the Born rule from the substrate.',
    })
  },
})
