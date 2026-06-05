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

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { Poset } from '~/core/poset'
import { Action, smearedBenincasaDowker, benincasaDowkerAction } from '~/dynamics/action'
import { sampleCausalSets } from '~/dynamics/mcmc'
import { orderStatistics } from '~/measure/order-stats'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { kleitmanRothschildOrder } from '~/substrate/layered-order'

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

export function main(): void {
  const sprinkle = sprinkleMinkowski({
    dimension: 2,
    count: SIZE,
    rng: makeRng({ seed: 1 }),
  })
  const layered = kleitmanRothschildOrder({ size: SIZE })
  const ref = orderStatistics({ poset: sprinkle })
  const refLayered = orderStatistics({ poset: layered })

  console.log(`P2 transition (N=${SIZE}, smeared action eps=0.9)`)
  console.log(
    `  warm starts: sprinkle heightRatio ${ref.heightRatio.toFixed(2)} (dim ${ref.mmDimension.toFixed(2)}), layered ${refLayered.heightRatio.toFixed(2)}`,
  )
  console.log('  beta   sprinkle-start hr   layered-start hr   gap')

  const smeared = smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 })
  for (const beta of [0.5, 1, 2, 4]) {
    const fromManifold = equilibratedHeightRatio({
      action: smeared,
      beta,
      start: sprinkle,
      seed: 100 + Math.round(beta * 10),
    })
    const fromLayered = equilibratedHeightRatio({
      action: smeared,
      beta,
      start: layered,
      seed: 200 + Math.round(beta * 10),
    })
    console.log(
      `  ${beta.toFixed(1).padStart(4)}  ${fromManifold.toFixed(2).padStart(16)}  ${fromLayered.toFixed(2).padStart(17)}  ${Math.abs(fromManifold - fromLayered).toFixed(2).padStart(5)}`,
    )
  }

  // Contrast: the sharp action should drive even the manifold start to layered.
  const sharp = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
  const sharpFromManifold = equilibratedHeightRatio({
    action: sharp,
    beta: 2,
    start: sprinkle,
    seed: 900,
  })
  console.log('')
  console.log(
    `  contrast: sharp action, beta=2, sprinkle start -> heightRatio ${sharpFromManifold.toFixed(2)} (manifold start decays toward layered)`,
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
