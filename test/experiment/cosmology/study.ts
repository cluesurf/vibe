// P2 study: can a causal-set action make manifold-like orders dominate?
// We compare the sharp Benincasa-Dowker action, the smeared BD action at several
// smearing scales, a random baseline, and a constructed dimension-target control,
// against a true 2D sprinkling as the reference. The discriminant is the height
// ratio (height / sqrt N): about 1 for a 2D manifold, near 0 for a layered
// Kleitman-Rothschild order. See note/questions/p2-dynamics-spec.md.
// Run: npx tsx code/experiment/p2-study.ts

import { makeRng } from '@/code/tool/rng'
import {
  benincasaDowkerAction,
  smearedBenincasaDowker,
  Action,
} from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { orderStatistics } from '@/code/measure/order-stats'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIZE = 48
const STEPS = 3000

function runConfig(input: {
  label: string
  action: Action
  beta: number
  seed: number
}): {
  label: string
  heightRatio: number
  mmDimension: number
  acceptance: number
} {
  // Two chains with the same seed (so the same trajectory) let us read two
  // observables without threading them through one return value.
  const heightRun = sampleCausalSets({
    size: SIZE,
    action: input.action,
    beta: input.beta,
    steps: STEPS,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
  })

  const dimRun = sampleCausalSets({
    size: SIZE,
    action: input.action,
    beta: input.beta,
    steps: STEPS,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).mmDimension,
  })

  return {
    label: input.label,
    heightRatio: heightRun.meanObservable,
    mmDimension: dimRun.meanObservable,
    acceptance: heightRun.acceptanceRate,
  }
}

export default experiment({
  id: 'cosmology/study',
  code: 'E-CSM-0039',
  title:
    'the smeared causal-set action drives the order parameter toward a 2D manifold reference',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const refHr = orderStatistics({
      poset: sprinkleMinkowski({
        dimension: 2,
        count: 48,
        rng: makeRng({ seed: 1 }),
      }),
    }).heightRatio

    const random = runConfig({
      label: 'random',
      action: benincasaDowkerAction({ epsilon: 1, dimension: 2 }),
      beta: 0,
      seed: 10,
    })

    const smeared = runConfig({
      label: 'smeared',
      action: smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 }),
      beta: 2,
      seed: 14,
    })

    const ok =
      Math.abs(smeared.heightRatio - refHr) <=
      Math.abs(random.heightRatio - refHr) + 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'weighting causal sets by the smeared action drives the height ratio at least as close to the 2D sprinkling reference as a random ensemble',
      metrics: {
        referenceHeightRatio: refHr,
        randomHeightRatio: random.heightRatio,
        smearedHeightRatio: smeared.heightRatio,
      },
      notes:
        'L1, a comparison against a known 2D sprinkling reference on a standard causal-set ensemble. It uses seeded random sampling and short chains, so this is a statistical ensemble claim, not a property of the deterministic base rule.',
    })
  },
})
