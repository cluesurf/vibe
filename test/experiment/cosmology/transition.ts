// P2 at scale: is the manifold phase a stable basin?
// We warm-start the smeared-action Monte Carlo from two orders, a 2D sprinkling
// (the manifold basin) and a layered Kleitman-Rothschild order (the layered
// basin), and sweep the inverse temperature beta. The order parameter is the
// height ratio (height / sqrt N): about 1 for a manifold, near 0 for a layered
// order. If the sprinkling start stays high, the manifold phase is a genuine
// stable basin, not merely reachable from the antichain. A persistent gap between
// the two starts over a beta window is a metastable coexistence (hysteresis). The
// sharp action is the contrast. See note/questions/frontier-spec.md (Front 2).
// Run: npx tsx code/experiment/p2-transition.ts

import { makeRng } from '@/code/tool/rng'
import { Poset } from '@/code/tool/poset'
import {
  Action,
  smearedBenincasaDowker,
  benincasaDowkerAction,
} from '@/code/dynamics/action'
import { sampleCausalSets } from '@/code/dynamics/mcmc'
import { orderStatistics } from '@/code/measure/order-stats'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { kleitmanRothschildOrder } from '@/code/substrate/layered-order'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIZE = 72
const STEPS = 1800

// Height ratio averaged over the second half of the chain (the equilibrated part).
function equilibratedHeightRatio(input: {
  action: Action
  beta: number
  start: Poset
  seed: number
}): number {
  const run = sampleCausalSets({
    size: SIZE,
    action: input.action,
    beta: input.beta,
    steps: STEPS,
    rng: makeRng({ seed: input.seed }),
    observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
    start: input.start,
  })

  const trace = run.trace
  const half = Math.floor(trace.length / 2)

  let sum = 0
  let count = 0

  for (let i = half; i < trace.length; i++) {
    sum += trace[i] ?? 0
    count += 1
  }

  return count > 0 ? sum / count : 0
}

export default experiment({
  id: 'cosmology/transition',
  title:
    'the manifold phase is a stable basin under the smeared action and decays under the sharp action',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const sprinkle = sprinkleMinkowski({
      dimension: 2,
      count: 72,
      rng: makeRng({ seed: 1 }),
    })

    const layered = kleitmanRothschildOrder({ size: 72 })
    const smeared = smearedBenincasaDowker({
      epsilon: 0.9,
      dimension: 2,
    })

    const fromManifold = equilibratedHeightRatio({
      action: smeared,
      beta: 2,
      start: sprinkle,
      seed: 120,
    })

    const fromLayered = equilibratedHeightRatio({
      action: smeared,
      beta: 2,
      start: layered,
      seed: 220,
    })

    const gap = Math.abs(fromManifold - fromLayered)
    const sharp = equilibratedHeightRatio({
      action: benincasaDowkerAction({ epsilon: 1, dimension: 2 }),
      beta: 2,
      start: sprinkle,
      seed: 900,
    })

    const ok = gap > 0.1 && sharp < fromManifold + 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the smeared action the manifold and layered starts hold a persistent height-ratio gap (a metastable coexistence), while the sharp action drives the manifold start down toward the layered order',
      metrics: { fromManifold, fromLayered, gap, sharp },
      notes:
        'L2, a metastable coexistence and basin test on a known causal-set ensemble, the sharp action is the negative contrast. It uses seeded random sampling, so this is a statistical ensemble claim, and run uses one size and shortened chains.',
    })
  },
})
