// Integration correlates (P9). Locates the structural correlates of a self on a
// configuration. These are documented proxies, not true IIT Phi: they only mark
// where, on the framework's own terms, an integrated region would sit.
//
// markovBlanketScore: how cleanly a candidate region screens off from the rest,
//   as the ratio of internal edges to boundary edges (higher = better blanket).
// integrationPhi: a cheap integration proxy, the algebraic connectivity (second
//   smallest Laplacian eigenvalue) of the region's subgraph (higher = harder to
//   cut into independent parts).

import { Substrate, undirectedAdjacency } from '~/core/substrate'
import { Configuration } from '~/tone/configuration'

// Pick the highest-degree node as the seed of the candidate region.
function highestDegreeNode(adjacency: ReadonlyArray<Uint32Array>): number {
  let best = 0
  let bestDegree = -1
  for (let node = 0; node < adjacency.length; node++) {
    const degree = (adjacency[node] ?? new Uint32Array(0)).length
    if (degree > bestDegree) {
      bestDegree = degree
      best = node
    }
  }
  return best
}

// Build the candidate region: a ball of radius 1 around the highest-degree node
// (the node and its immediate neighbors). A natural Markov-blanket candidate.
function candidateRegion(input: {
  adjacency: ReadonlyArray<Uint32Array>
}): Set<number> {
  const seed = highestDegreeNode(input.adjacency)
  const region = new Set<number>([seed])
  const row = input.adjacency[seed] ?? new Uint32Array(0)
  for (let k = 0; k < row.length; k++) {
    region.add(row[k] ?? 0)
  }
  return region
}

// Algebraic connectivity (Fiedler value) of the region's induced subgraph, via
// power iteration on the deflated graph Laplacian. This is the second-smallest
// eigenvalue of L = D - A. A higher value means the region resists being split
// into independent parts, the integration proxy we want. Returns 0 for trivial
// or disconnected regions.
export function algebraicConnectivity(input: {
  adjacency: ReadonlyArray<Uint32Array>
  region: Set<number>
}): number {
  const nodes = [...input.region].sort((a, b) => a - b)
  const n = nodes.length
  if (n < 2) {
    return 0
  }
  const indexOf = new Map<number, number>()
  nodes.forEach((node, i) => indexOf.set(node, i))

  // Local adjacency restricted to the region.
  const localAdjacency: number[][] = nodes.map((node) => {
    const row = input.adjacency[node] ?? new Uint32Array(0)
    const local: number[] = []
    for (let k = 0; k < row.length; k++) {
      const neighbor = row[k] ?? 0
      const j = indexOf.get(neighbor)
      if (j !== undefined) {
        local.push(j)
      }
    }
    return local
  })
  const degree = localAdjacency.map((row) => row.length)

  // Apply L = D - A to a vector x.
  const applyLaplacian = (x: Float64Array): Float64Array => {
    const out = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      let value = (degree[i] ?? 0) * (x[i] ?? 0)
      const row = localAdjacency[i] ?? []
      for (const j of row) {
        value -= x[j] ?? 0
      }
      out[i] = value
    }
    return out
  }

  // Find the largest Laplacian eigenvalue (Gershgorin-bounded) by power
  // iteration, then iterate on (lambdaMax I - L) and deflate the constant vector
  // (the trivial eigenvector with eigenvalue 0) to surface the Fiedler value.
  const lambdaMax = 2 * Math.max(1, ...degree)
  const ones = 1 / Math.sqrt(n)

  let x = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    // Deterministic non-constant start, orthogonalised against the ones vector.
    x[i] = i % 2 === 0 ? 1 : -1
  }
  const orthogonalize = (v: Float64Array): void => {
    let mean = 0
    for (let i = 0; i < n; i++) {
      mean += v[i] ?? 0
    }
    mean /= n
    let norm = 0
    for (let i = 0; i < n; i++) {
      v[i] = (v[i] ?? 0) - mean
      norm += (v[i] ?? 0) * (v[i] ?? 0)
    }
    norm = Math.sqrt(norm)
    if (norm > 0) {
      for (let i = 0; i < n; i++) {
        v[i] = (v[i] ?? 0) / norm
      }
    }
  }
  orthogonalize(x)

  let estimate = 0
  for (let iteration = 0; iteration < 200; iteration++) {
    const lx = applyLaplacian(x)
    // y = (lambdaMax I - L) x, whose dominant eigenvector (after deflating the
    // constant mode) corresponds to the smallest nonzero Laplacian eigenvalue.
    const y = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      y[i] = lambdaMax * (x[i] ?? 0) - (lx[i] ?? 0)
    }
    orthogonalize(y)
    x = y
    // Rayleigh quotient x^T L x gives the current eigenvalue estimate.
    const lxNew = applyLaplacian(x)
    let rayleigh = 0
    for (let i = 0; i < n; i++) {
      rayleigh += (x[i] ?? 0) * (lxNew[i] ?? 0)
    }
    estimate = rayleigh
  }
  void ones
  return Math.max(0, estimate)
}

export function integrationCorrelates(input: {
  substrate: Substrate
  configuration: Configuration
}): { markovBlanketScore: number; integrationPhi: number } {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  if (adjacency.length === 0) {
    return { markovBlanketScore: 0, integrationPhi: 0 }
  }
  const region = candidateRegion({ adjacency })

  // Markov-blanket score: internal edges (both endpoints inside) over boundary
  // edges (one endpoint inside, one outside). A clean blanket has many internal
  // and few boundary edges.
  let internalEdges = 0
  let boundaryEdges = 0
  for (const node of region) {
    const row = adjacency[node] ?? new Uint32Array(0)
    for (let k = 0; k < row.length; k++) {
      const neighbor = row[k] ?? 0
      if (region.has(neighbor)) {
        if (node < neighbor) {
          internalEdges++
        }
      } else {
        boundaryEdges++
      }
    }
  }
  const markovBlanketScore =
    boundaryEdges === 0
      ? internalEdges > 0
        ? 1
        : 0
      : internalEdges / (internalEdges + boundaryEdges)

  const integrationPhi = algebraicConnectivity({ adjacency, region })

  // The configuration is accepted for interface parity and future tone-based
  // integration measures; the structural proxy above does not yet read tones.
  void input.configuration

  return { markovBlanketScore, integrationPhi }
}
