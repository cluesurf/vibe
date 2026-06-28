// B1 down-payment: finite-size scaling of the P2 first-order transition.
// The continuum dominance proof is open in mathematics, but we can strengthen the
// evidence: if the manifold/layered coexistence survives and sharpens as N grows,
// the transition is heading for the continuum, not a small-system artefact. We
// measure, at fixed coupling, the manifold fraction from a warm (sprinkling) start
// and a cold start at several sizes. A persistent, sharp gap that holds as N grows
// is the finite-size signature of a genuine first-order transition. See
// note/questions/remaining-frontier-spec.md (B1) and p2-uniform.md.
// Run: npx tsx code/experiment/p2-scaling.ts

import { makeRng } from '@/code/tool/rng'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function gapAtSize(n: number): number {
  const cold = sampleUniform({
    size: n,
    beta: 2,
    epsilon: 0.9,
    steps: 40000,
    rng: makeRng({ seed: 10 + n }),
    sampleEvery: Math.max(1, Math.floor(n / 2)),
  })

  const warm = sampleUniform({
    size: n,
    beta: 2,
    epsilon: 0.9,
    steps: 40000,
    rng: makeRng({ seed: 20 + n }),
    sampleEvery: Math.max(1, Math.floor(n / 2)),
    startFuture: sprinkleMinkowski({
      dimension: 2,
      count: n,
      rng: makeRng({ seed: 1 }),
    }).future,
  })

  return warm.manifoldFraction - cold.manifoldFraction
}

export default experiment({
  id: 'cosmology/scaling',
  code: 'E-CSM-0037',
  title:
    'the manifold and layered phases coexist with a wide gap that persists as size grows',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const gap48 = gapAtSize(48)
    const gap96 = gapAtSize(96)
    const gapHolds = gap48 > 0.5 && gap96 > 0.5
    const ok = gapHolds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at fixed coupling a warm manifold start and a cold start hold a wide manifold-fraction gap that persists across two system sizes, the finite-size signature of a first-order transition',
      metrics: { gap48, gap96 },
      notes:
        'L2, finite-size evidence (not a proof) for a first-order transition on a known causal-set ensemble, the continuum dominance remains open in mathematics. It uses seeded random sampling, so this is a statistical ensemble claim, and run uses only two sizes.',
    })
  },
})
