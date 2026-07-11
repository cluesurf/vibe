// Combinatorial curvature. A simplified Forman-Ricci curvature per edge, from
// degrees and shared neighbors, and its mean over the substrate's edges.

import { Rng } from '@/code/tool/rng'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'

// BFS hop distances from a source over an undirected adjacency.
function bfsDistances(
  adj: readonly Uint32Array[],
  source: number,
  size: number,
): Int32Array {
  const dist = new Int32Array(size).fill(-1)

  dist[source] = 0

  let frontier = [source]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const v of frontier) {
      for (const w of adj[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = (dist[v] ?? 0) + 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return dist
}

// Count common neighbors of a and b given the adjacency.
function triangleCount(input: {
  adjacency: readonly Uint32Array[]
  a: number
  b: number
}): number {
  const rowA = input.adjacency[input.a] ?? new Uint32Array(0)
  const rowB = input.adjacency[input.b] ?? new Uint32Array(0)
  const setB = new Set<number>()

  for (const value of rowB) setB.add(value ?? -1)

  let common = 0

  for (const value of rowA) {
    const node = value ?? -1

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

    for (const value of row) {
      const b = value ?? 0

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

export type CurvatureSign = 'positive' | 'flat' | 'negative'

// Sectional curvature read off the growth of geodesic shells (the discrete Raychaudhuri focusing). The number of
// cells at graph distance d from a root is the area of a geodesic sphere of radius d, the expansion of a geodesic
// congruence. On a POSITIVE-curvature space (a sphere) the shells grow then SHRINK, geodesics reconverge, the
// focusing an attractive mass produces. On a FLAT space the shells grow polynomially as d^(D-1), so the ratio of
// successive shells falls toward one. On a NEGATIVE-curvature space the shells grow EXPONENTIALLY, the ratio stays
// bounded above one, geodesics diverge, an anti-confining geometry. Classify from the shell sizes (the final shell
// is dropped, it is truncated by the finite patch). A turnover (an interior shell smaller than its predecessor) is
// positive. Otherwise a late successive-shell ratio above `negativeThreshold` is negative (still exponential), and
// a late ratio below `flatThreshold` is flat (the ratio has decayed toward one).
export function shellGrowthCurvature(input: {
  shellCounts: readonly number[]
  negativeThreshold?: number
  flatThreshold?: number
}): {
  sign: CurvatureSign
  lateRatio: number
  minInteriorRatio: number
} {
  const negativeThreshold = input.negativeThreshold ?? 1.8
  const flatThreshold = input.flatThreshold ?? 1.5
  const shells = input.shellCounts.slice(
    0,
    Math.max(2, input.shellCounts.length - 1),
  )

  const ratios: number[] = []

  for (let i = 2; i < shells.length; i++) {
    if (shells[i - 1]! > 0) ratios.push(shells[i]! / shells[i - 1]!)
  }

  const minInteriorRatio = ratios.length ? Math.min(...ratios) : 1
  const lateRatio = ratios.length ? ratios[ratios.length - 1]! : 1

  let sign: CurvatureSign

  if (minInteriorRatio < 0.97) sign = 'positive'
  else if (lateRatio > negativeThreshold) sign = 'negative'
  else sign = lateRatio < flatThreshold ? 'flat' : 'negative'

  return { sign, lateRatio, minInteriorRatio }
}

// Gromov delta-hyperbolicity from the sampled four-point condition. For four points,
// of the three sums of opposite-pair graph distances, the largest two differ by at
// most 2 delta; the returned delta is the worst (largest) half-difference over the
// samples. A tree reads delta 0, a hyperbolic crystal a small bounded delta, and a
// flat grid a delta growing with size. The tree-likeness measure.
export function gromovDelta(input: {
  substrate: Substrate
  samples: number
  rng: Rng
}): number {
  const { substrate, samples, rng } = input
  const adj = undirectedAdjacency({ substrate })
  const size = substrate.size

  let worst = 0

  for (let k = 0; k < samples; k++) {
    const pts = [
      rng.nextInt({ max: size }),
      rng.nextInt({ max: size }),
      rng.nextInt({ max: size }),
      rng.nextInt({ max: size }),
    ]

    const d = pts.map(p => bfsDistances(adj, p, size))
    const dij = (a: number, b: number): number => d[a]?.[pts[b]!] ?? 0
    const s1 = dij(0, 1) + dij(2, 3)
    const s2 = dij(0, 2) + dij(1, 3)
    const s3 = dij(0, 3) + dij(1, 2)
    const sorted = [s1, s2, s3].sort((a, b) => b - a)
    const delta = ((sorted[0] ?? 0) - (sorted[1] ?? 0)) / 2

    worst = Math.max(worst, delta)
  }

  return worst
}
