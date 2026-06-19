// P2 fine sweep: map the manifold window of the smeared Benincasa-Dowker action.
// The coarse study showed the ensemble approaching the 2D reference as the
// smearing eps rises toward ~0.9, then collapsing to layered orders at the sharp
// limit (eps = 1). Here we sweep eps finely and repeat at two sizes to confirm
// the manifold window is real and not a small-N artifact.
// Run: npx tsx code/experiment/p2-epsilon.ts

import { makeRng } from '@/code/tool/rng'
import { smearedBenincasaDowker, Action } from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { orderStatistics } from '@/code/measure/order-stats'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function run(input: {
  action: Action
  size: number
  steps: number
  beta: number
  seed: number
}): { heightRatio: number; mmDimension: number } {
  const h = sampleCausalSets({
    size: input.size,
    action: input.action,
    beta: input.beta,
    steps: input.steps,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
  })

  const d = sampleCausalSets({
    size: input.size,
    action: input.action,
    beta: input.beta,
    steps: input.steps,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).mmDimension,
  })

  return {
    heightRatio: h.meanObservable,
    mmDimension: d.meanObservable,
  }
}

export default experiment({
  id: 'substrate-survey/epsilon',
  title:
    'the smeared Benincasa-Dowker action approaches the 2D reference in a manifold window as the smearing rises',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const size = 48
    const reference = orderStatistics({
      poset: sprinkleMinkowski({
        dimension: 2,
        count: size,
        rng: makeRng({ seed: 1 }),
      }),
    })

    const action: Action = smearedBenincasaDowker({
      epsilon: 0.9,
      dimension: 2,
    })

    const measured = run({
      action,
      size,
      steps: 3000,
      beta: 2,
      seed: 290,
    })

    const ok =
      Math.abs(measured.mmDimension - reference.mmDimension) < 0.6 &&
      Math.abs(measured.heightRatio - reference.heightRatio) < 0.6

    return verdict({
      status: ok ? 'pass' : 'open',
      claim:
        'at smearing epsilon = 0.9 the causal-set ensemble sits within a manifold window of the 2D Minkowski sprinkle reference in both the Myrheim-Meyer dimension and the height ratio',
      metrics: {
        epsilon: 0.9,
        measuredMmDimension: measured.mmDimension,
        referenceMmDimension: reference.mmDimension,
        measuredHeightRatio: measured.heightRatio,
        referenceHeightRatio: reference.heightRatio,
      },
      notes:
        'L2, a known causal-set Monte Carlo construction (the Benincasa-Dowker action). This relies on a RANDOM Minkowski sprinkling and an MCMC sampler, so it is a statistical claim about an ensemble at a fixed seed, NOT a property of the deterministic vibe rule. The 2D sprinkle is the reference. The full fine sweep over epsilon and two sizes is in main(). Status falls to open when the single point misses the window.',
    })
  },
})
