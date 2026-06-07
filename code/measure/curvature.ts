// Combinatorial curvature. A simplified Forman-Ricci curvature per edge, from
// degrees and shared neighbors, and its mean over the substrate's edges.

import { Substrate, undirectedAdjacency } from '~/tool/substrate'

// Count common neighbors of a and b given the adjacency.
function triangleCount(input: {
  adjacency: ReadonlyArray<Uint32Array>
  a: number
  b: number
}): number {
  const rowA = input.adjacency[input.a] ?? new Uint32Array(0)
  const rowB = input.adjacency[input.b] ?? new Uint32Array(0)
  const setB = new Set<number>()
  for (let k = 0; k < rowB.length; k++) {
    setB.add(rowB[k] ?? -1)
  }
  let common = 0
  for (let k = 0; k < rowA.length; k++) {
    const node = rowA[k] ?? -1
    if (node !== input.b && setB.has(node)) {
      common++
    }
  }
  return common
}

// Simplified combinatorial Forman-Ricci curvature for an unweighted edge (a,b):
// F = 4 - deg(a) - deg(b) + 3 * (triangles through the edge). Positive curvature
// signals a tightly clustered region; large negative curvature signals a tree-like
// (hyperbolic) region.
export function formanRicci(input: {
  substrate: Substrate
  a: number
  b: number
}): number {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const degreeA = (adjacency[input.a] ?? new Uint32Array(0)).length
  const degreeB = (adjacency[input.b] ?? new Uint32Array(0)).length
  const triangles = triangleCount({ adjacency, a: input.a, b: input.b })
  return 4 - degreeA - degreeB + 3 * triangles
}

// Mean Forman-Ricci curvature over all undirected edges of the substrate.
// Returns 0 when there are no edges.
export function meanCurvature(input: { substrate: Substrate }): number {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  let total = 0
  let edges = 0
  for (let a = 0; a < adjacency.length; a++) {
    const row = adjacency[a] ?? new Uint32Array(0)
    for (let k = 0; k < row.length; k++) {
      const b = row[k] ?? 0
      if (a < b) {
        const degreeA = row.length
        const degreeB = (adjacency[b] ?? new Uint32Array(0)).length
        const triangles = triangleCount({ adjacency, a, b })
        total += 4 - degreeA - degreeB + 3 * triangles
        edges++
      }
    }
  }
  return edges === 0 ? 0 : total / edges
}
