// P76: 3D addressed navigation on the dodecagrid.
// P42 routed a signal between any two cells of the 2D heptagrid using addresses, delivered
// exactly. Here is the 3D analogue, on the dodecagrid {5,3,4}, the real spatial crystal. Each
// cell's address is its position in the hyperbolic embedding (its coordinate in the Poincare
// ball). Routing is greedy: from the source, step each time to the neighbor whose address is
// closest, in hyperbolic distance, to the target, until the target is reached. Greedy routing on
// a hyperbolic address is known to succeed with high reliability, and we confirm it delivers
// across the 3D crystal at low stretch (path length close to the shortest path).
// Run: npx tsx code/experiment/p76-dodecagrid-navigation.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { graphDistance } from '@/code/measure/distance'
import { greedyRouteHops } from '@/code/measure/navigation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Greedy hyperbolic-address routing (greedyRouteHops) and BFS hop distance
// (graphDistance) are library capabilities; routing steps to the neighbor closest to
// the target in Poincare-ball distance.

export function dodecagridNavigation(input: { seed: number }): {
  cells: number
  pairs: number
  successRate: number
  meanStretch: number
  solved: boolean
} {
  const g = hyperbolicDodecagrid({
    depth: 4,
    connectThreshold: 2.0,
    maxVertices: 1500,
  })

  const rng = makeRng({ seed: input.seed })

  let delivered = 0
  let attempted = 0
  let stretchSum = 0
  let stretchN = 0

  const pairs = 300

  for (let p = 0; p < pairs; p++) {
    const s = rng.nextInt({ max: g.size })

    let t = rng.nextInt({ max: g.size })

    if (t === s) {
      t = (t + 1) % g.size
    }

    const shortest = graphDistance({ substrate: g, from: s, to: t })

    if (shortest <= 0) {
      continue
    } // not connected (or same), skip

    attempted += 1

    const hops = greedyRouteHops({ graph: g, source: s, target: t })

    if (hops > 0) {
      delivered += 1
      stretchSum += hops / shortest
      stretchN += 1
    }
  }

  const successRate = delivered / Math.max(1, attempted)
  const meanStretch = stretchSum / Math.max(1, stretchN)

  return {
    cells: g.size,
    pairs: attempted,
    successRate,
    meanStretch,
    // Solved: greedy routing on the 3D hyperbolic address delivers almost every pair at low stretch.
    solved: successRate > 0.9 && meanStretch < 2.0,
  }
}

export default experiment({
  id: 'addressing/dodecagrid-navigation',
  title:
    'greedy hyperbolic-address routing delivers at low stretch on the dodecagrid',
  category: 'addressing',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = dodecagridNavigation({ seed: 1 })
    const ok = r.solved && r.successRate > 0.9 && r.meanStretch < 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'greedy address routing on the 3D dodecagrid delivers nearly every pair at low stretch using local address comparisons',
      metrics: {
        cells: r.cells,
        successRate: r.successRate,
        meanStretch: r.meanStretch,
      },
    })
  },
})
