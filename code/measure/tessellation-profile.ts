// A universal data-structure profile for ANY hyperbolic Coxeter tessellation, given only its Schlafli symbol.
// It builds the chamber (Cayley) graph and reads off the structural data-structure metrics that every
// tessellation shares: exponential capacity, a logarithmic tree radius, boundary dominance, and a
// heap-ordered BFS tree. These cover the combinatorial data structures (capacity, addressing, B-tree, trie,
// heap, Merkle, union-find, DHT, LSM, BFS, sorting, paths, skip-list, the interior and range caveats). The
// geometric structures (greedy routing, the Busemann mipmap) need a coordinate embedding, added per family.

import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import {
  lastCompleteShellRatio,
  outermostShellFraction,
} from '@/code/substrate/coxeter/growth'

export type TessellationProfile = {
  symbol: number[]
  rank: number
  cells: number
  growthRatio: number // capacity, exponential when above 1
  radius: number // the tree / address depth (BFS eccentricity from the root)
  outermostFraction: number // boundary dominance
  ballRatio: number // the range-scan cost growth
  capacityExponential: boolean
  treeDepthLogarithmic: boolean
  boundaryDominated: boolean
}

const bfsDepths = (
  adjacency: readonly (readonly number[])[],
  root: number,
): number[] => {
  const depth = new Array<number>(adjacency.length).fill(-1)
  depth[root] = 0

  let frontier = [root]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const u of frontier) {
      for (const v of adjacency[u]!) {
        if (v >= 0 && depth[v] === -1) {
          depth[v] = depth[u]! + 1
          next.push(v)
        }
      }
    }

    frontier = next
  }

  return depth
}

const ballRatioOf = (shells: number[]): number => {
  const ball = (radius: number): number =>
    shells.slice(0, radius + 1).reduce((s, n) => s + n, 0)

  const r = Math.max(2, shells.length - 2)

  return ball(r) / Math.max(1, ball(r - 1))
}

// The geometric cell coordination (the B-tree order / fan-out) of a honeycomb, the number of cells sharing a
// facet with a cell. It equals |W(cell)| / |W(facet)|, the ratio of the orders of the finite Coxeter groups of
// the cell polytope and its facet, both counted by terminating the chamber BFS. Finite for compact honeycombs
// (a finite B-tree order), Infinity when the cell is itself a tiling (paracompact / noncompact).
export function cellCoordination(symbol: number[]): number {
  if (symbol.length < 2) {
    return symbol[0] ?? 0
  }

  const cap = 50000
  const cell = symbol.slice(0, symbol.length - 1)
  const facet = symbol.slice(0, symbol.length - 2)
  const cellOrder = buildCoxeterMatrixMesh(cell, cap).adjacency.length

  if (cellOrder >= cap) {
    return Infinity // the cell is a tiling, infinite coordination
  }

  const facetOrder =
    facet.length === 0
      ? 2
      : buildCoxeterMatrixMesh(facet, cap).adjacency.length

  return Math.round(cellOrder / facetOrder)
}

export function tessellationDataProfile(input: {
  symbol: number[]
  maxCells: number
}): TessellationProfile {
  const mesh = buildCoxeterMatrixMesh(input.symbol, input.maxCells)
  const cells = mesh.adjacency.length
  const depth = bfsDepths(mesh.adjacency, 0)
  const radius = depth.reduce((m, d) => Math.max(m, d), 0)
  const growthRatio = lastCompleteShellRatio(mesh.shells)
  const outermostFraction = outermostShellFraction(mesh.shells)
  const ballRatio = ballRatioOf(mesh.shells)

  return {
    symbol: input.symbol,
    rank: input.symbol.length + 1,
    cells,
    growthRatio,
    radius,
    outermostFraction,
    ballRatio,
    capacityExponential: growthRatio > 1.05,
    treeDepthLogarithmic: cells > 1 && radius <= 8 * Math.log2(cells),
    boundaryDominated: outermostFraction > 0.2,
  }
}
