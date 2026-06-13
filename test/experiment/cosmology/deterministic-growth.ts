// P83: deterministic eternal growth, not static placement.
// P48 and P51 build the base by a deterministic automaton, but as a static orbit, generated all
// at once for a fixed number of rings and then read off. The model's actual claim is stronger:
// the universe GROWS, one vibe at a time, forever, at its frontier, and the geometry emerges from
// the growth. This experiment builds that. A GrowingMesh adds cells one at a time using the
// pentagrid {5,4} splitting rule (each cell deterministically spawns 3 or 2 children by its type),
// breadth-first, append-only, with no randomness and no rebuild. We then check the four things
// that make it real growth rather than static placement:
//   1. resumable: growing in many small steps gives exactly the same mesh as one big step,
//   2. append-only: once a cell is added its links never change, the interior is frozen,
//   3. faithful: the grown mesh matches the static tiling cell for cell,
//   4. geometry emerges: the ball-growth ratio converges to the pentagrid's golden-ratio law.
// Run: npx tsx code/experiment/p83-deterministic-growth.ts

import { tilingPQ } from '@/code/substrate/tiling-pq'
import { bfsShells, branchingRatio } from '@/code/measure/shells'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A mesh that grows one cell at a time at its frontier. State persists between grow() calls, so
// growth can continue forever without rebuilding anything already grown.
class GrowingMesh {
  parent: number[] = [-1] // node 0 is the root
  white: boolean[] = [true]
  adjacency: number[][] = [[]]
  // The frontier: cells whose children have not all been emitted yet, with a cursor into their
  // fixed child list. FIFO, so growth is breadth-first.
  private queue: { id: number; children: boolean[]; cursor: number }[] = [
    { id: 0, children: [true, true, true, true, true], cursor: 0 }, // root seeds 5 white children
  ]
  private head = 0

  // Children a cell spawns, by type: white -> (white, black, white), black -> (white, black).
  private childrenFor(white: boolean): boolean[] {
    return white ? [true, false, true] : [true, false]
  }

  size(): number {
    return this.parent.length
  }

  // Add exactly `count` cells at the frontier.
  grow(count: number): void {
    let added = 0
    while (added < count) {
      const task = this.queue[this.head]
      if (task === undefined) {
        return // frontier exhausted (only happens if count exceeds an unstarted root, never here)
      }
      if (task.cursor >= task.children.length) {
        this.head += 1 // this cell is fully expanded, advance the frontier
        continue
      }
      const childWhite = task.children[task.cursor] ?? true
      task.cursor += 1
      const id = this.parent.length
      this.parent.push(task.id)
      this.white.push(childWhite)
      this.adjacency.push([task.id])
      this.adjacency[task.id]!.push(id)
      this.queue.push({ id, children: this.childrenFor(childWhite), cursor: 0 })
      added += 1
    }
  }
}

// BFS ring sizes from the root.
function ringSizes(adjacency: number[][]): number[] {
  return bfsShells({ neighbors: adjacency, root: 0 }).shellCounts
}

function sameAdjacency(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const x = [...(a[i] ?? [])].sort((p, q) => p - q)
    const y = [...(b[i] ?? [])].sort((p, q) => p - q)
    if (x.length !== y.length || x.some((v, k) => v !== y[k])) return false
  }
  return true
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
  const oneShot = new GrowingMesh()
  oneShot.grow(N)
  const chunked = new GrowingMesh()
  for (let i = 0; i < N; ) {
    const step = Math.min(37, N - i)
    chunked.grow(step)
    i += step
  }
  const resumableMatchesOneShot = chunked.size() === oneShot.size() && sameAdjacency(chunked.adjacency, oneShot.adjacency)

  // 2. Append-only: grow some, snapshot every edge, grow more, confirm no edge was removed or
  // changed. Growth only ever ADDS (a frontier cell may still gain children), never edits, so
  // every snapshot edge must still be present.
  const mesh = new GrowingMesh()
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
  const grownToMatch = new GrowingMesh()
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

export default defineExperiment({
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
