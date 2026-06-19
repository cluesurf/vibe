// Radial structure of an embedded cell graph, used by the boundary-coupling (bulk-tree propagator)
// gravity probes. The bulk is organised as a breadth-first tree rooted at the innermost cell (the
// one nearest the embedding origin); the outer shell of cells is the boundary; and two boundary
// points couple through the bulk via their lowest common ancestor in that radial tree.

import { toCsr } from '@/code/tool/graph'

// Index of the innermost cell, the one with the smallest radius (nearest the embedding origin), the
// deterministic root the radial probes start from. Ties resolve to the lowest index.
export function innermostCell(radii: ReadonlyArray<number>): number {
  let node = 0
  let best = Infinity
  for (let i = 0; i < radii.length; i++) {
    if (radii[i]! < best) {
      best = radii[i]!
      node = i
    }
  }

  return node
}

// Boundary cells: those whose radius exceeds `fraction` of the maximum radius.
export function boundaryByRadius(input: {
  radii: ReadonlyArray<number>
  fraction: number
}): number[] {
  const { radii, fraction } = input
  const rmax = Math.max(...radii)
  const cut = fraction * rmax
  const out: number[] = []
  for (let i = 0; i < radii.length; i++) {
    if (radii[i]! > cut) {
      out.push(i)
    }
  }

  return out
}

// Breadth-first surface distance from `source` to every boundary cell, hopping only through cells
// flagged in `isBoundary` (graph supplied in CSR form). Returns the distance array (-1 = unreached).
export function surfaceDistances(input: {
  offsets: ArrayLike<number>
  adjacency: ArrayLike<number>
  isBoundary: ArrayLike<number>
  source: number
  nodeCount: number
}): Int32Array {
  const { offsets, adjacency, isBoundary, source, nodeCount } = input
  const dist = new Int32Array(nodeCount).fill(-1)
  dist[source] = 0
  let frontier = [source]
  while (frontier.length) {
    const next: number[] = []
    for (const u of frontier) {
      for (let q = offsets[u]!; q < offsets[u + 1]!; q++) {
        const w = adjacency[q]!
        if (isBoundary[w] && dist[w] === -1) {
          dist[w] = dist[u]! + 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return dist
}

// Breadth-first radial tree rooted at the innermost cell (smallest radius). Returns the root, the
// per-cell depth and parent, and an lca-depth function giving the depth of the lowest common
// ancestor of two cells (the bulk meeting point of two boundary points).
export function radialBfsTree(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  radii: ReadonlyArray<number>
}): {
  root: number
  depth: Int32Array
  parent: Int32Array
  maxDepth: number
  lcaDepth: (a: number, b: number) => number
} {
  const { neighbors, radii } = input
  const n = neighbors.length
  const { offsets: off, adj } = toCsr(neighbors)
  const root = innermostCell(radii)
  const depth = new Int32Array(n).fill(-1)
  const parent = new Int32Array(n).fill(-1)
  depth[root] = 0
  let frontier = [root]
  while (frontier.length) {
    const next: number[] = []
    for (const u of frontier) {
      for (let q = off[u]!; q < off[u + 1]!; q++) {
        const w = adj[q]!
        if (depth[w] === -1) {
          depth[w] = depth[u]! + 1
          parent[w] = u
          next.push(w)
        }
      }
    }

    frontier = next
  }

  const maxDepth = Math.max(...depth)
  const lcaDepth = (a: number, b: number): number => {
    let x = a
    let y = b
    while (depth[x]! > depth[y]!) {
      x = parent[x]!
    }

    while (depth[y]! > depth[x]!) {
      y = parent[y]!
    }

    while (x !== y) {
      x = parent[x]!
      y = parent[y]!
    }

    return depth[x]!
  }

  return { root, depth, parent, maxDepth, lcaDepth }
}
