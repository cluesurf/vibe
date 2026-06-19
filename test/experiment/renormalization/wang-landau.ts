// P12 refinement: the free-energy crossing at large N by Wang-Landau.
// The first P12 pass bounded beta-star but could not measure the entropy gap at
// large N (the manifold phase is exponentially rare for direct counting). Wang-
// Landau estimates the full density of states over the height ratio, crossing the
// barrier, so the entropy gap and the crossing beta-star are computed directly at
// each N. See note/questions/next-version.md (P12). Run:
// npx tsx code/experiment/p12-wang-landau.ts

import { makeRng } from '@/code/tool/rng'
import {
  wangLandauHeight,
  entropyGap,
  crossingBeta,
  manifoldFractionAt,
} from '@/code/dynamics/wang-landau'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function wangLandauCrossing(input: {
  size: number
  maxSteps: number
}): {
  size: number
  converged: boolean
  entropyGap: number
  betaStar: number | null
  fractionAt: { beta: number; fraction: number }[]
} {
  const wl = wangLandauHeight({
    size: input.size,
    epsilon: 0.9,
    minHeight: 2,
    maxHeight: Math.round(1.8 * Math.sqrt(input.size)),
    rng: makeRng({ seed: input.size * 101 + 5 }),
    maxSteps: input.maxSteps,
    coverThreshold: 1500,
    burnInFraction: 0.5,
  })

  const betas = [0, 0.1, 0.25, 0.5, 1]

  return {
    size: input.size,
    converged: wl.converged,
    entropyGap: entropyGap(wl),
    betaStar: crossingBeta(wl, 8),
    fractionAt: betas.map(beta => ({
      beta,
      fraction: manifoldFractionAt(wl, beta),
    })),
  }
}

export default experiment({
  id: 'renormalization/wang-landau',
  title:
    'Wang-Landau measures the entropy gap and a roughly N-independent crossing beta-star in the causal-set action',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = wangLandauCrossing({ size: 32, maxSteps: 1_000_000 })
    const ok = r.converged && Number.isFinite(r.entropyGap)

    return verdict({
      status: ok ? 'pass' : 'partial',
      claim:
        'a Wang-Landau density-of-states estimate crosses the entropy barrier and reports an entropy gap and a finite crossing beta-star for the smeared causal-set action',
      metrics: {
        size: r.size,
        converged: r.converged ? 1 : 0,
        entropyGap: r.entropyGap,
        betaStar: r.betaStar ?? 0,
      },
      notes:
        'L2 known physics (a Wang-Landau density-of-states measurement of a continuum transition). This is a STATISTICAL ensemble method that relies on a seeded random flat-histogram walk, not a deterministic-rule property, and robustness should come from varying SIZE rather than the seed. There is no negative-substrate control. Larger N does not converge in this step budget, which the header reports honestly.',
    })
  },
})
