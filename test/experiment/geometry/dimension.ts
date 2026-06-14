// CROSS-TESSELLATION PATTERN, worked example (take one measure across the catalog). This experiment
// measures one quantity on one substrate. To run a measure against ALL the regular hyperbolic
// tessellations, see `note/cross-tessellation-experiments.md`. In short: write the per-substrate measure
// once in `code/measure/`, wire it into `measureTessellation` (`@/code/measure/tessellation-battery`) so
// every tessellation gets it, then loop `TESSELLATIONS` (`@/code/substrate/tessellation-catalog`) in a thin
// `substrates: 'any'` experiment. `coxeter-engine.ts` is the companion "build any tessellation" example.
//
// P6: does the 2D path integral land on 2-dimensional orders?
// P6 is the 2D specialisation of P2, and the P2 machinery (the 2D smeared action,
// the correct uniform sampler) is already 2D. P6's own question is whether the
// stable manifold phase is genuinely 2-dimensional. We warm-start the correct
// sampler from a 2D sprinkling at scale and read the Myrheim-Meyer dimension of the
// stable phase from its ordering fraction. If it sits near 2, the path integral
// lands on 2D orders. See note/questions/p2-p6-optimal-path.md.
// Run: npx tsx code/experiment/p6-dimension.ts

import { makeRng } from '@/code/tool/rng'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { dimensionFromOrderingFraction } from '@/code/measure/dimension'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The 2D smeared path integral lands on 2-dimensional causal orders. We warm-start the
// uniform sampler from a 2D Minkowski sprinkling and read the Myrheim-Meyer dimension of
// the stable manifold phase off its ordering fraction. It sits near 2, the dimension we
// seeded, so the stable phase is genuinely 2D. This is the standard causal-set dimension
// estimator on a random sprinkling, a known construction, so L2. It relies on a random
// sprinkling, so it is a statistical claim about an ensemble, not a property of the
// deterministic base rule, and we say so.
export default experiment({
  id: 'geometry/dimension',
  title: 'the 2D smeared path integral stays on near-2-dimensional causal orders',
  category: 'geometry',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const n = 128
    const sprinkle = sprinkleMinkowski({ dimension: 2, count: n, rng: makeRng({ seed: 1 }) })
    const result = sampleUniform({
      size: n,
      beta: 1,
      epsilon: 0.9,
      steps: 50000,
      rng: makeRng({ seed: 30 + n }),
      sampleEvery: Math.max(1, Math.floor(n / 2)),
      startFuture: sprinkle.future,
    })
    const dimension = dimensionFromOrderingFraction(result.meanOrderingFraction)
    const ok = Math.abs(dimension - 2) < 0.5
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the stable manifold phase of the 2D smeared action has Myrheim-Meyer dimension near 2',
      metrics: {
        dimension,
        manifoldFraction: result.manifoldFraction,
        orderingFraction: result.meanOrderingFraction,
      },
      notes:
        'L2, the causal-set Myrheim-Meyer dimension estimator on a random Minkowski sprinkling. This relies on a random sprinkling, so it is a statistical claim about an ensemble, not a property of the deterministic base rule.',
    })
  },
})
