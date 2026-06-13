// A general substrate graph: the mesh or tiling form. Carries adjacency, with
// optional edge weights, optional Margenstern/Fibonacci addresses (tilings),
// and an optional embedding.

import { Embedding } from '@/code/tool/embedding'

export interface Graph {
  readonly form: 'graph'
  readonly size: number
  readonly directed: boolean
  // neighbors[a] is the sorted list of neighbor ids of a
  readonly neighbors: ReadonlyArray<Uint32Array>
  // optional edge weights aligned index for index with neighbors[a]
  readonly weight?: ReadonlyArray<Float64Array>
  // optional Fibonacci / Margenstern address per node (tilings only)
  readonly address?: ReadonlyArray<string>
  readonly embedding?: Embedding
}

export function makeGraph(input: {
  size: number
  directed: boolean
  neighbors: ReadonlyArray<ReadonlyArray<number>>
  weight?: ReadonlyArray<ReadonlyArray<number>>
  address?: ReadonlyArray<string>
  embedding?: Embedding
}): Graph {
  const neighbors = input.neighbors.map((row) =>
    Uint32Array.from([...row].sort((x, y) => x - y)),
  )
  const weight = input.weight
    ? input.weight.map((row) => Float64Array.from(row))
    : undefined
  return {
    form: 'graph',
    size: input.size,
    directed: input.directed,
    neighbors,
    weight,
    address: input.address,
    embedding: input.embedding,
  }
}

export function degree(g: Graph, input: { node: number }): number {
  return (g.neighbors[input.node] ?? new Uint32Array(0)).length
}

// The average number of neighbours per node, the density readout the substrate
// experiments use to hold connectivity fixed as the size grows.
export function meanDegree(g: Graph): number {
  let total = 0
  for (let i = 0; i < g.size; i++) {
    total += (g.neighbors[i] ?? new Uint32Array(0)).length
  }
  return total / Math.max(1, g.size)
}

// Compressed sparse row form of a neighbors list. The GPU uploads and many experiments built this inline,
// offsets[i]..offsets[i+1] index into adj for node i's neighbors. Accepts a plain number[][] or the Graph's
// Uint32Array rows.
export function toCsr(neighbors: ReadonlyArray<ReadonlyArray<number>>): {
  offsets: Uint32Array
  adj: Uint32Array
} {
  const n = neighbors.length
  const offsets = new Uint32Array(n + 1)
  for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i]! + (neighbors[i]?.length ?? 0)
  const adj = new Uint32Array(offsets[n]!)
  let p = 0
  for (let i = 0; i < n; i++) {
    const row = neighbors[i] ?? []
    for (let k = 0; k < row.length; k++) adj[p++] = row[k]!
  }
  return { offsets, adj }
}

// Undirected edge list of a CSR adjacency as two parallel arrays (each edge once,
// with eu[k] < ev[k]). The compact form the lattice-gas dynamics sweep over.
export function edgesFromCsr(
  offsets: ArrayLike<number>,
  adj: ArrayLike<number>,
  n: number,
): { eu: Int32Array; ev: Int32Array } {
  const eu: number[] = []
  const ev: number[] = []
  for (let v = 0; v < n; v++) for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    const w = adj[p]!
    if (w > v) {
      eu.push(v)
      ev.push(w)
    }
  }
  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

// A plain number[][] view of a Graph's neighbors (for the neighbors-native measures and renders).
export function neighborsOf(g: Graph): number[][] {
  return g.neighbors.map((row) => Array.from(row))
}

// Breadth-first hop distance from `source` over a CSR adjacency. Returns an
// Int32Array of distances (-1 for unreached). With `maxRadius` the sweep stops
// after that many rings (cells beyond stay -1). With `allowed` (a truthy-per-node
// mask) the sweep only crosses into nodes the mask permits, so distances are
// measured within an induced subgraph (e.g. a single shell or band).
export function csrDistances(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
  source: number
  maxRadius?: number
  allowed?: ArrayLike<number>
}): Int32Array {
  const { offsets, adj, size, source, allowed } = input
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0
  let fr = [source]
  if (input.maxRadius !== undefined) {
    const maxR = input.maxRadius
    let r = 0
    while (fr.length > 0 && r < maxR) {
      r++
      const next: number[] = []
      for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!
        if (dist[w] === -1 && (!allowed || allowed[w])) {
          dist[w] = r
          next.push(w)
        }
      }
      fr = next
    }
    return dist
  }
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1 && (!allowed || allowed[w])) {
        dist[w] = dist[u]! + 1
        next.push(w)
      }
    }
    fr = next
  }
  return dist
}

// Like csrDistances (unbounded) but also returns the eccentric (farthest) node,
// chosen as the first node reaching the maximum distance in BFS order.
export function csrEccentricity(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
  source: number
}): { dist: Int32Array; far: number } {
  const { offsets, adj, size, source } = input
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0
  let fr = [source]
  let far = source
  let ecc = 0
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        if (dist[w]! > ecc) {
          ecc = dist[w]!
          far = w
        }
        next.push(w)
      }
    }
    fr = next
  }
  return { dist, far }
}

// Breadth-first hop distance from `source` over a neighbor list (number[][] or the Graph's
// Uint32Array rows). Returns an Int32Array of distances (-1 for unreached).
export function neighborDistances(input: {
  neighbors: ReadonlyArray<ReadonlyArray<number> | Uint32Array>
  size: number
  source: number
}): Int32Array {
  const { neighbors, size, source } = input
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0
  let frontier = [source]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const u of frontier) for (const w of neighbors[u]!) if (dist[w] === -1) {
      dist[w] = (dist[u] ?? 0) + 1
      next.push(w)
    }
    frontier = next
  }
  return dist
}

// Undirected edge list (each edge once, a < b). Useful for curvature and gauge.
export function edgeList(g: Graph): Array<{ a: number; b: number }> {
  const out: Array<{ a: number; b: number }> = []
  for (let a = 0; a < g.size; a++) {
    const row = g.neighbors[a] ?? new Uint32Array(0)
    for (let k = 0; k < row.length; k++) {
      const b = row[k] ?? 0
      if (g.directed || a < b) {
        out.push({ a, b })
      }
    }
  }
  return out
}

// The connected component containing the most-connected node, returned as a fresh Graph with ids
// remapped to a dense 0..k range and the embedding carried over. Picking the max-degree seed lands
// in the bulk, and isolating one component makes a Laplacian solve well posed (a disconnected graph
// carries a spurious zero mode per component).
export function largestComponent(g: Graph): Graph {
  let center = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) { best = d; center = i }
  }
  const reach = new Int32Array(g.size).fill(-1)
  reach[center] = 0
  let frontier = [center]
  const kept: number[] = [center]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (reach[w] === -1) {
          reach[w] = 1
          kept.push(w)
          next.push(w)
        }
      }
    }
    frontier = next
  }
  const remap = new Map<number, number>()
  kept.forEach((old, i) => remap.set(old, i))
  const dim = g.embedding?.dimension ?? 2
  const oldCoords = g.embedding?.coords ?? new Float64Array(0)
  const coords = new Float64Array(kept.length * dim)
  const neighbors: number[][] = kept.map((old, i) => {
    for (let a = 0; a < dim; a++) coords[i * dim + a] = oldCoords[old * dim + a] ?? 0
    return Array.from(g.neighbors[old] ?? new Uint32Array(0)).map((w) => remap.get(w) ?? -1).filter((x) => x >= 0)
  })
  const embedding = g.embedding ? { ...g.embedding, coords } : undefined
  return makeGraph({ size: kept.length, directed: false, neighbors, embedding })
}
