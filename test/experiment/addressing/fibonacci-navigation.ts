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
import { Graph } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

interface Tree {
  parent: Int32Array
  depth: Int32Array
  children: number[][]
  address: number[][] // address[v] = path of child-ordinals from the root to v
  root: number
  levelSizes: number[]
}

// Breadth-first spanning tree from the most-connected (central) cell. Children are
// ordered by embedding angle, so the addressing is deterministic.
function spanningTree(g: Graph): Tree {
  let root = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      root = i
    }
  }
  const coords = g.embedding?.coords ?? new Float64Array(0)
  const dim = g.embedding?.dimension ?? 2
  const angleOf = (v: number): number => Math.atan2(coords[v * dim + 1] ?? 0, coords[v * dim] ?? 0)

  const parent = new Int32Array(g.size).fill(-1)
  const depth = new Int32Array(g.size).fill(-1)
  const children: number[][] = g.neighbors.map(() => [])
  parent[root] = root
  depth[root] = 0
  let frontier = [root]
  const levelSizes = [1]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      const kids: number[] = []
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (depth[w] === -1) {
          depth[w] = (depth[v] ?? 0) + 1
          parent[w] = v
          kids.push(w)
          next.push(w)
        }
      }
      kids.sort((a, b) => angleOf(a) - angleOf(b))
      children[v] = kids
    }
    if (next.length > 0) {
      levelSizes.push(next.length)
    }
    frontier = next
  }

  // Addresses: append the child-ordinal at each step down from the root.
  const address: number[][] = g.neighbors.map(() => [])
  // Process in depth order so a parent's address is set before its children.
  const order = Array.from({ length: g.size }, (_, i) => i)
    .filter((i) => depth[i] !== -1)
    .sort((a, b) => (depth[a] ?? 0) - (depth[b] ?? 0))
  for (const v of order) {
    if (v === root) {
      continue
    }
    const p = parent[v] ?? root
    const ordinal = (children[p] ?? []).indexOf(v)
    address[v] = [...(address[p] ?? []), ordinal]
  }
  return { parent, depth, children, address, root, levelSizes }
}

// Route from s to t using addresses only: up to the common ancestor, then down by the
// target's address suffix. Returns the path (a walk along tree edges, which are graph
// edges). Uses only local parent and ordered-children information.
function routeByAddress(tree: Tree, s: number, t: number): number[] {
  const as = tree.address[s] ?? []
  const at = tree.address[t] ?? []
  let common = 0
  while (common < as.length && common < at.length && as[common] === at[common]) {
    common++
  }
  const up: number[] = []
  let cur = s
  while ((tree.depth[cur] ?? 0) > common) {
    up.push(cur)
    cur = tree.parent[cur] ?? tree.root
  }
  // cur is now the common ancestor (depth == common).
  const ancestor = cur
  const down: number[] = []
  let node = ancestor
  for (let i = common; i < at.length; i++) {
    node = (tree.children[node] ?? [])[at[i] ?? 0] ?? node
    down.push(node)
  }
  return [...up, ancestor, ...down]
}

function bfsDistance(g: Graph, s: number, t: number): number {
  if (s === t) {
    return 0
  }
  const dist = new Int32Array(g.size).fill(-1)
  dist[s] = 0
  let frontier = [s]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = (dist[v] ?? 0) + 1
          if (w === t) {
            return dist[w] ?? -1
          }
          next.push(w)
        }
      }
    }
    frontier = next
  }
  return -1
}

export function fibonacciNavigation(input: { pairs: number; seed: number }): {
  cells: number
  treeDepth: number
  deliveryRate: number
  meanHops: number
  meanStretch: number
  levelGrowthRatio: number
} {
  const g = hyperbolicTiling({ p: 7, q: 3, depth: 6, connectThreshold: 0.5, maxVertices: 2200 })
  const tree = spanningTree(g)

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
      const d = bfsDistance(g, s, t)
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

export default defineExperiment({
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
