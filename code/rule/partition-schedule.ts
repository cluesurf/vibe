// The partition schedule of a pair rule: the edges of a cell graph split into matchings (color classes of a proper
// edge coloring), applied one matching after another, and an orientation on each matched edge naming which cell is
// "first". Both are outside structure (an outside clock phase and a direction), so every result records them:
// the coloring method, the color count, the color order and the orientation.
//
// The matchings come from greedyEdgeColoring (code/tool/graph). It is greedy, so it can use more than degree + 1
// colors; the count is recorded because one round of c colors can carry a difference c hops.

import { greedyEdgeColoring } from '@/code/tool/graph'

export type PartitionSchedule = {
  size: number
  // each matching as a flat list first0, second0, first1, second1, ... in the order the round applies them
  matchings: Int32Array[]
  // 'generator-coloring': a coloring defined on the infinite tiling itself (code/compute/lab/lazy-space.ts)
  method: 'greedy-edge-coloring' | 'generator-coloring'
  colorCount: number
  // the greedy color index of each matching, in round order
  colorOrder: number[]
  orientation: string
}

export type ScheduleCheck = {
  // no matching touches a cell twice
  everyColorIsMatching: boolean
  // every edge of the graph is in exactly one matching, and no matched pair is a non-edge
  coversEveryEdgeOnce: boolean
  edgeCount: number
}

export function buildPartitionSchedule(input: {
  neighbors: readonly ArrayLike<number>[]
  // the oriented pair (first, second) of the undirected edge u < v
  orient: (u: number, v: number) => [number, number]
  orientation: string
  colorOrder: 'forward' | 'reverse'
}): PartitionSchedule {
  const size = input.neighbors.length
  const offsets = new Int32Array(size + 1)

  for (let v = 0; v < size; v++) {
    offsets[v + 1] = offsets[v]! + input.neighbors[v]!.length
  }

  const adjacency = new Int32Array(offsets[size]!)

  for (let v = 0; v < size; v++) {
    const row = input.neighbors[v]!

    for (let k = 0; k < row.length; k++) {
      adjacency[offsets[v]! + k] = row[k]!
    }
  }

  const { eu, ev, byColor } = greedyEdgeColoring({
    offsets,
    adjacency,
    size,
  })
  const colors = byColor.map((_, c) => c)
  const order =
    input.colorOrder === 'forward' ? colors : [...colors].reverse()
  const matchings = order.map(c => {
    const edges = byColor[c]!
    const flat = new Int32Array(edges.length * 2)

    edges.forEach((e, k) => {
      const [first, second] = input.orient(eu[e]!, ev[e]!)

      flat[2 * k] = first
      flat[2 * k + 1] = second
    })

    return flat
  })

  return {
    size,
    matchings,
    method: 'greedy-edge-coloring',
    colorCount: byColor.length,
    colorOrder: order,
    orientation: input.orientation,
  }
}

// The ring of n cells (torusGrid(1, n)), every edge oriented left to right, (i, i + 1 mod n).
export function ringSchedule(input: {
  neighbors: readonly ArrayLike<number>[]
  colorOrder: 'forward' | 'reverse'
}): PartitionSchedule {
  return buildPartitionSchedule({
    neighbors: input.neighbors,
    orient: (u, v) => (v === u + 1 ? [u, v] : [v, u]),
    orientation: 'left-to-right (i, i + 1 mod n)',
    colorOrder: input.colorOrder,
  })
}

// Checks a schedule against its graph: each color a matching, the colors cover every edge exactly once.
export function checkSchedule(input: {
  schedule: PartitionSchedule
  neighbors: readonly (Uint32Array | readonly number[])[]
}): ScheduleCheck {
  const { schedule, neighbors } = input
  const key = (u: number, v: number): number =>
    Math.min(u, v) * schedule.size + Math.max(u, v)
  const edges = new Set<number>()

  neighbors.forEach((row, v) => {
    for (const w of row) {
      edges.add(key(v, w))
    }
  })

  let everyColorIsMatching = true
  let coversEveryEdgeOnce = true

  const used = new Map<number, number>()

  for (const matching of schedule.matchings) {
    const touched = new Set<number>()

    for (let k = 0; k < matching.length; k += 2) {
      const a = matching[k]!
      const b = matching[k + 1]!

      if (touched.has(a) || touched.has(b) || a === b) {
        everyColorIsMatching = false
      }

      touched.add(a)
      touched.add(b)

      const e = key(a, b)

      if (!edges.has(e)) {
        coversEveryEdgeOnce = false
      }

      used.set(e, (used.get(e) ?? 0) + 1)
    }
  }

  for (const e of edges) {
    if (used.get(e) !== 1) {
      coversEveryEdgeOnce = false
    }
  }

  return {
    everyColorIsMatching,
    coversEveryEdgeOnce,
    edgeCount: edges.size,
  }
}
