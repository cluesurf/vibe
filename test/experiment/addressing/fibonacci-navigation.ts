// P42: addressed propagation (Fibonacci-tree navigation on the heptagrid).
// P37 showed a disturbance propagates with a causal light-cone. This adds Margenstern's
// tool: lay a spanning tree on the heptagrid {7,3}, give every cell a tree address (the
// path of child-ordinals from the root, the Fibonacci-tree coordinate), and route a
// signal between any two cells by address arithmetic alone, no global shortest-path
// lookup. We confirm the routing is exact (always reaches the target), local (uses only
// parent and ordered children), and efficient (path length grows like the tree depth,
// logarithmic in the cell count). The tree's level sizes grow by a Fibonacci-like
// recurrence, the signature of the heptagrid. See note/deterministic-substrate.md.
// Run: npx tsx code/experiment/p42-fibonacci-navigation.ts

import { makeRng } from '@/code/tool/rng'
import { hyperbolicTiling } from '@/code/substrate/hyperbolic-graph'
import { buildAddressedTree, routeByAddress } from '@/code/substrate/tree-addressing'
import { graphDistance } from '@/code/measure/distance'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The Margenstern tree addressing (a BFS spanning tree with embedding-angle child
// order plus child-ordinal addresses) and the address-arithmetic router live in
// code/substrate/tree-addressing.

export function fibonacciNavigation(input: { pairs: number; seed: number }): {
  cells: number
  treeDepth: number
  deliveryRate: number
  meanHops: number
  meanStretch: number
  levelGrowthRatio: number
} {
  const g = hyperbolicTiling({ p: 7, q: 3, depth: 6, connectThreshold: 0.5, maxVertices: 2200 })
  const tree = buildAddressedTree(g)

  // Adjacency sets for an honest validity check of each route.
  const adj = g.neighbors.map((row) => new Set<number>(Array.from(row)))

  const rng = makeRng({ seed: input.seed })
  let delivered = 0
  let hopSum = 0
  let stretchSum = 0
  let stretchCount = 0
  for (let k = 0; k < input.pairs; k++) {
    const s = rng.nextInt({ max: g.size })
    const t = rng.nextInt({ max: g.size })
    if ((tree.depth[s] ?? -1) < 0 || (tree.depth[t] ?? -1) < 0) {
      continue
    }
    const path = routeByAddress(tree, s, t)
    // Validity: every consecutive pair adjacent, and the path ends at t.
    let valid = path[0] === s && path[path.length - 1] === t
    for (let i = 0; i + 1 < path.length && valid; i++) {
      if (!(adj[path[i] ?? 0] ?? new Set()).has(path[i + 1] ?? -1)) {
        valid = false
      }
    }
    if (valid) {
      delivered++
      const hops = path.length - 1
      hopSum += hops
      const d = graphDistance({ substrate: g, from: s, to: t })
      if (d > 0) {
        stretchSum += hops / d
        stretchCount++
      }
    }
  }
  // Level-growth in the bulk only: ring sizes grow exponentially until the boundary of
  // the finite generated patch, where they fall off. Measure up to the peak ring.
  let peak = 1
  for (let i = 1; i < tree.levelSizes.length; i++) {
    if ((tree.levelSizes[i] ?? 0) > (tree.levelSizes[peak] ?? 0)) {
      peak = i
    }
  }
  const ratios: number[] = []
  for (let i = 2; i <= peak; i++) {
    const prev = tree.levelSizes[i - 1] ?? 0
    if (prev > 0) {
      ratios.push((tree.levelSizes[i] ?? 0) / prev)
    }
  }
  const levelGrowthRatio = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0

  return {
    cells: g.size,
    treeDepth: Math.max(...Array.from(tree.depth)),
    deliveryRate: delivered / Math.max(1, input.pairs),
    meanHops: hopSum / Math.max(1, delivered),
    meanStretch: stretchSum / Math.max(1, stretchCount),
    levelGrowthRatio,
  }
}

export default experiment({
  id: 'addressing/fibonacci-navigation',
  title: 'address arithmetic routes every signal exactly and efficiently on the heptagrid',
  category: 'addressing',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = fibonacciNavigation({ pairs: 1000, seed: 1 })
    const ok =
      r.deliveryRate === 1 &&
      r.meanStretch < 3 &&
      r.levelGrowthRatio > 1.1 &&
      r.meanHops < 2 * r.treeDepth + 1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'routing by tree-address arithmetic on the heptagrid delivers every pair exactly at low stretch with exponential ring growth',
      metrics: {
        deliveryRate: r.deliveryRate,
        meanHops: r.meanHops,
        meanStretch: r.meanStretch,
        levelGrowthRatio: r.levelGrowthRatio,
        treeDepth: r.treeDepth,
      },
    })
  },
})
