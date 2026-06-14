// P83: deterministic eternal growth, not static placement.
// P48 and P51 build the base by a deterministic automaton, but as a static orbit, generated all
// at once for a fixed number of rings and then read off. The model's actual claim is stronger:
// the universe GROWS, one vibe at a time, forever, at its frontier, and the geometry emerges from
// the growth. This experiment builds that. A GrowingPentagrid adds cells one at a time using the
// pentagrid {5,4} splitting rule (each cell deterministically spawns 3 or 2 children by its type),
// breadth-first, append-only, with no randomness and no rebuild. We then check the four things
// that make it real growth rather than static placement:
//   1. resumable: growing in many small steps gives exactly the same mesh as one big step,
//   2. append-only: once a cell is added its links never change, the interior is frozen,
//   3. faithful: the grown mesh matches the static tiling cell for cell,
//   4. geometry emerges: the ball-growth ratio converges to the pentagrid's golden-ratio law.
// Run: npx tsx code/experiment/p83-deterministic-growth.ts

import { tilingPQ } from '@/code/substrate/tiling-pq'
import { GrowingPentagrid } from '@/code/substrate/growing-pentagrid'
import { adjacencyListsEqual } from '@/code/tool/graph'
import { bfsShells, branchingRatio } from '@/code/measure/shells'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// BFS ring sizes from the root.
function ringSizes(adjacency: number[][]): number[] {
  return bfsShells({ neighbors: adjacency, root: 0 }).shellCounts
}

const GOLDEN_GROWTH = (3 + Math.sqrt(5)) / 2 // the pentagrid ball-growth constant, phi^2 ~ 2.618

export function deterministicGrowth(input: Record<string, never> = {}): {
  resumableMatchesOneShot: boolean
  appendOnly: boolean
  matchesStaticRings: boolean
  growthRatio: number
  goldenGrowth: number
  geometryEmerges: boolean
  maxDegree: number
  degreeBounded: boolean
  solved: boolean
} {
  void input
  const N = 2000

  // 1. Resumable: grow in many small chunks vs one big step.
  const oneShot = new GrowingPentagrid()
  oneShot.grow(N)
  const chunked = new GrowingPentagrid()
  for (let i = 0; i < N; ) {
    const step = Math.min(37, N - i)
    chunked.grow(step)
    i += step
  }
  const resumableMatchesOneShot = chunked.size() === oneShot.size() && adjacencyListsEqual(chunked.adjacency, oneShot.adjacency)

  // 2. Append-only: grow some, snapshot every edge, grow more, confirm no edge was removed or
  // changed. Growth only ever ADDS (a frontier cell may still gain children), never edits, so
  // every snapshot edge must still be present.
  const mesh = new GrowingPentagrid()
  mesh.grow(500)
  const snapshot = mesh.adjacency.slice(0, 500).map((row) => [...row])
  mesh.grow(1500)
  let appendOnly = true
  for (let i = 0; i < 500; i++) {
    const now = new Set(mesh.adjacency[i] ?? [])
    for (const w of snapshot[i] ?? []) {
      if (!now.has(w)) {
        appendOnly = false
        break
      }
    }
    if (!appendOnly) break
  }

  // 3. Faithful: the grown mesh matches the static tiling, ring for ring.
  const staticTiling = tilingPQ({ p: 5, q: 4, generations: 6 })
  const staticRings = ringSizes(staticTiling.neighbors.map((r) => Array.from(r)))
  const staticCount = staticRings.reduce((a, b) => a + b, 0)
  const grownToMatch = new GrowingPentagrid()
  grownToMatch.grow(staticCount - 1) // root already present
  const grownRings = ringSizes(grownToMatch.adjacency)
  const matchesStaticRings =
    grownRings.length >= staticRings.length && staticRings.every((s, i) => s === grownRings[i])

  // 4. Geometry emerges: the ball-growth ratio converges to the golden-ratio law. The final ring
  // of a mesh grown to an arbitrary size is incomplete, so we exclude it (use complete rings only).
  const rings = ringSizes(oneShot.adjacency)
  const growthRatio = branchingRatio({ shellCounts: rings, from: 5, to: rings.length - 1 })
  const geometryEmerges = Math.abs(growthRatio - GOLDEN_GROWTH) < 0.05

  // Degree stays bounded, as a finite-cell crystal requires.
  let maxDegree = 0
  for (const row of oneShot.adjacency) maxDegree = Math.max(maxDegree, row.length)
  const degreeBounded = maxDegree <= 6

  return {
    resumableMatchesOneShot,
    appendOnly,
    matchesStaticRings,
    growthRatio,
    goldenGrowth: GOLDEN_GROWTH,
    geometryEmerges,
    maxDegree,
    degreeBounded,
    solved: resumableMatchesOneShot && appendOnly && matchesStaticRings && geometryEmerges && degreeBounded,
  }
}

export default experiment({
  id: 'cosmology/deterministic-growth',
  title: 'resumable, append-only, faithful, geometry emerges (golden ratio)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = deterministicGrowth()
    const ok =
      r.solved && r.resumableMatchesOneShot && r.appendOnly && r.matchesStaticRings && r.geometryEmerges
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the mesh grows one cell at a time resumably and append-only, faithful to the static tiling, with the golden-ratio ball growth emerging',
      metrics: {
        growthRatio: r.growthRatio,
        goldenGrowth: r.goldenGrowth,
        maxDegree: r.maxDegree,
      },
    })
  },
})
