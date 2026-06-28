// Integration correlates (P9). Locates the structural correlates of a self on a
// configuration. These are documented proxies, not true IIT Phi: they only mark
// where, on the framework's own terms, an integrated region would sit.
//
// markovBlanketScore: how cleanly a candidate region screens off from the rest,
//   as the ratio of internal edges to boundary edges (higher = better blanket).
// integrationPhi: a cheap integration proxy, the algebraic connectivity (second
//   smallest Laplacian eigenvalue) of the region's subgraph (higher = harder to
//   cut into independent parts).

import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import { Configuration } from '@/code/tone/configuration'
import { Rng } from '@/code/tool/rng'

// Pick the highest-degree node as the seed of the candidate region.
function highestDegreeNode(adjacency: readonly Uint32Array[]): number {
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
  adjacency: readonly Uint32Array[]
}): Set<number> {
  const seed = highestDegreeNode(input.adjacency)
  const region = new Set<number>([seed])
  const row = input.adjacency[seed] ?? new Uint32Array(0)

  for (const value of row) {
    region.add(value ?? 0)
  }

  return region
}

// Algebraic connectivity (Fiedler value) of the region's induced subgraph, via
// power iteration on the deflated graph Laplacian. This is the second-smallest
// eigenvalue of L = D - A. A higher value means the region resists being split
// into independent parts, the integration proxy we want. Returns 0 for trivial
// or disconnected regions.
export function algebraicConnectivity(input: {
  adjacency: readonly Uint32Array[]
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
  const localAdjacency: number[][] = nodes.map(node => {
    const row = input.adjacency[node] ?? new Uint32Array(0)
    const local: number[] = []

    for (const value of row) {
      const neighbor = value ?? 0
      const j = indexOf.get(neighbor)

      if (j !== undefined) {
        local.push(j)
      }
    }

    return local
  })

  const degree = localAdjacency.map(row => row.length)

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

    for (const value of row) {
      const neighbor = value ?? 0

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

// Tone-aware integrated information. Unlike algebraicConnectivity (which reads only
// the graph), this reads the RULE's dynamics on tones. For a candidate region it
// estimates the minimum-information bipartition: over random tone configurations it
// measures, for each candidate cut, how much one side's NEXT tones depend on the
// other side's CURRENT tones (replace that side with independent noise, re-run the
// rule, count changed nodes). The cut's cost is the smaller of the two directions
// (both must survive a real cut), and Phi is the weakest cut's cost. A region is
// integrated only if EVERY way of splitting it still leaves the parts strongly
// shaping each other's dynamics: a dense cell scores high, a loosely-coupled or
// disconnected bag scores near zero. Because it uses the fills and the update rule,
// two regions with identical wiring but different fills score differently, which the
// purely structural measure cannot see.
export function toneIntegration(input: {
  adjacency: readonly Uint32Array[]
  region: number[]
  fillOf?: (a: number, b: number) => number
  rng: Rng
  samples?: number
  bipartitions?: number
}): number {
  const nodes = [...new Set(input.region)].sort((a, b) => a - b)
  const n = nodes.length

  if (n < 2) {
    return 0
  }

  const samples = input.samples ?? 24
  const cuts = input.bipartitions ?? 16
  const fillOf = input.fillOf ?? ((): number => 1)
  const indexOf = new Map<number, number>()
  nodes.forEach((node, i) => indexOf.set(node, i))

  const nb: { j: number; f: number }[][] = nodes.map(node => {
    const row = input.adjacency[node] ?? new Uint32Array(0)
    const out: { j: number; f: number }[] = []

    for (const w of row) {
      const j = indexOf.get(w)

      if (j !== undefined) {
        out.push({ j, f: fillOf(node, w) })
      }
    }

    return out
  })

  // one rule step for node i: next tone = sign(sum of fill * neighbour tone)
  const step = (tone: Int8Array, i: number): number => {
    let acc = 0

    for (const { j, f } of nb[i] ?? []) {
      acc += f * (tone[j] ?? 0)
    }

    return acc > 0 ? 1 : acc < 0 ? -1 : (tone[i] ?? 0)
  }

  // cross-influence cost of one bipartition mask (part[i] in {0,1})
  const cutCost = (part: Uint8Array): number => {
    let total = 0

    for (let s = 0; s < samples; s++) {
      const tone = new Int8Array(n)

      for (let i = 0; i < n; i++) {
        tone[i] = input.rng.next() < 0.5 ? -1 : 1
      }

      const base = new Int8Array(n)

      for (let i = 0; i < n; i++) {
        base[i] = step(tone, i)
      }

      const repl = new Int8Array(n)

      for (let i = 0; i < n; i++) {
        repl[i] = input.rng.next() < 0.5 ? -1 : 1
      }

      // B -> A: replace side-1 current tones, recompute side-0 next tones
      const tA = Int8Array.from(tone)

      for (let i = 0; i < n; i++) {
        if (part[i] === 1) {
          tA[i] = repl[i] ?? 0
        }
      }

      let changedA = 0
      let sizeA = 0

      for (let i = 0; i < n; i++) {
        if (part[i] === 0) {
          sizeA++

          if (step(tA, i) !== base[i]) {
            changedA++
          }
        }
      }

      // A -> B
      const tB = Int8Array.from(tone)

      for (let i = 0; i < n; i++) {
        if (part[i] === 0) {
          tB[i] = repl[i] ?? 0
        }
      }

      let changedB = 0
      let sizeB = 0

      for (let i = 0; i < n; i++) {
        if (part[i] === 1) {
          sizeB++

          if (step(tB, i) !== base[i]) {
            changedB++
          }
        }
      }

      const infA = sizeA > 0 ? changedA / sizeA : 0
      const infB = sizeB > 0 ? changedB / sizeB : 0
      total += Math.min(infA, infB)
    }

    return total / samples
  }

  // Candidate bipartitions to minimise over (the minimum-information partition). For a small
  // region we enumerate ALL balanced bipartitions, so the weakest cut is genuinely found (node 0
  // fixed to side 0 to avoid counting a partition and its complement twice). For a large region we
  // sample `bipartitions` random balanced cuts.
  const masks: Uint8Array[] = []

  if (n <= 14) {
    const k = Math.floor(n / 2)
    const chosen: number[] = []

    const recurse = (start: number): void => {
      if (chosen.length === k) {
        const part = new Uint8Array(n)

        for (const i of chosen) {
          part[i] = 1
        }

        if (part[0] === 0) {
          masks.push(part)
        }

        return
      }

      for (let i = start; i < n; i++) {
        chosen.push(i)
        recurse(i + 1)
        chosen.pop()
      }
    }

    recurse(0)
  } else {
    for (let c = 0; c < cuts; c++) {
      const order = nodes.map((_, i) => i)

      for (let i = order.length - 1; i > 0; i--) {
        const k = input.rng.nextInt({ max: i + 1 })
        const tmp = order[i] ?? 0
        order[i] = order[k] ?? 0
        order[k] = tmp
      }

      const part = new Uint8Array(n)

      for (let i = 0; i < n; i++) {
        part[order[i] ?? 0] = i < Math.floor(n / 2) ? 0 : 1
      }

      masks.push(part)
    }
  }

  let phi = Infinity

  for (const part of masks) {
    phi = Math.min(phi, cutCost(part))
  }

  return phi === Infinity ? 0 : phi
}
