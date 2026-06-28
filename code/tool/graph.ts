// A general substrate graph: the mesh or tiling form. Carries adjacency, with
// optional edge weights, optional Margenstern/Fibonacci addresses (tilings),
// and an optional embedding.

import { Embedding } from '@/code/tool/embedding'

export interface Graph {
  readonly form: 'graph'
  readonly size: number
  readonly directed: boolean
  // neighbors[a] is the sorted list of neighbor ids of a
  readonly neighbors: readonly Uint32Array[]
  // optional edge weights aligned index for index with neighbors[a]
  readonly weight?: readonly Float64Array[]
  // optional Fibonacci / Margenstern address per node (tilings only)
  readonly address?: readonly string[]
  readonly embedding?: Embedding
}

export function makeGraph(input: {
  size: number
  directed: boolean
  neighbors: readonly (readonly number[])[]
  weight?: readonly (readonly number[])[]
  address?: readonly string[]
  embedding?: Embedding
}): Graph {
  const neighbors = input.neighbors.map(row =>
    Uint32Array.from([...row].sort((x, y) => x - y)),
  )

  const weight = input.weight
    ? input.weight.map(row => Float64Array.from(row))
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

// Return a copy of the graph whose embedding coordinates are SCRAMBLED by a fixed deterministic permutation
// (each node receives another node's coordinates), keeping the graph topology unchanged. Greedy routing, which
// works only when a node's address encodes its geometric position, then fails. This is the control for
// greedy-routing experiments, it isolates the geometric embedding by destroying the position-address link
// without touching the graph. The permutation is a fixed half-rotation, so it is deterministic.
export function withScrambledEmbedding(g: Graph): Graph {
  if (!g.embedding) {
    return g
  }

  const size = g.size
  const dimension = g.embedding.dimension
  const source = g.embedding.coords
  const coords = new Float64Array(source.length)
  const shift = Math.floor(size / 2)

  for (let node = 0; node < size; node++) {
    const from = (node + shift) % size

    for (let axis = 0; axis < dimension; axis++) {
      coords[node * dimension + axis] =
        source[from * dimension + axis] ?? 0
    }
  }

  const embedding: Embedding = { ...g.embedding, coords }

  return { ...g, embedding }
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

// Index of the most-connected node (highest degree), the deterministic centre the substrate
// experiments root their balls, walks, and spectral probes at. Ties resolve to the lowest index.
export function mostConnectedNode(
  neighbors: readonly ArrayLike<number>[],
): number {
  let node = 0
  let best = -1

  for (let i = 0; i < neighbors.length; i++) {
    const d = neighbors[i]!.length

    if (d > best) {
      best = d
      node = i
    }
  }

  return node
}

// Compressed sparse row form of a neighbors list. The GPU uploads and many experiments built this inline,
// offsets[i]..offsets[i+1] index into adj for node i's neighbors. Accepts a plain number[][] or the Graph's
// Uint32Array rows.
export function toCsr(neighbors: readonly (readonly number[])[]): {
  offsets: Uint32Array
  adj: Uint32Array
} {
  const n = neighbors.length
  const offsets = new Uint32Array(n + 1)

  for (let i = 0; i < n; i++) {
    offsets[i + 1] = offsets[i]! + (neighbors[i]?.length ?? 0)
  }

  const adj = new Uint32Array(offsets[n]!)

  let p = 0

  for (let i = 0; i < n; i++) {
    const row = neighbors[i] ?? []

    for (let k = 0; k < row.length; k++) {
      adj[p++] = row[k]!
    }
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

  for (let v = 0; v < n; v++) {
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!

      if (w > v) {
        eu.push(v)
        ev.push(w)
      }
    }
  }

  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

// A plain number[][] view of a Graph's neighbors (for the neighbors-native measures and renders).
export function neighborsOf(g: Graph): number[][] {
  return g.neighbors.map(row => Array.from(row))
}

// The node indices of the largest connected component of a plain neighbors list, in
// BFS-discovery order. The lightweight sibling of largestComponent (which rebuilds a
// whole Graph): this just returns the member indices so the caller can carve its own
// induced subgraph.
export function largestComponentNodes(
  neighbors: readonly (readonly number[])[],
): number[] {
  const n = neighbors.length
  const seen = new Int32Array(n).fill(-1)

  let best: number[] = []

  for (let s = 0; s < n; s++) {
    if (seen[s]! >= 0) {
      continue
    }

    const comp: number[] = []
    const q = [s]
    seen[s] = s

    for (let h = 0; h < q.length; h++) {
      const u = q[h]!
      comp.push(u)

      for (const w of neighbors[u]!) {
        if (seen[w]! < 0) {
          seen[w] = s
          q.push(w)
        }
      }
    }

    if (comp.length > best.length) {
      best = comp
    }
  }

  return best
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

      for (const u of fr) {
        for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
          const w = adj[p]!

          if (dist[w] === -1 && (!allowed || allowed[w])) {
            dist[w] = r
            next.push(w)
          }
        }
      }

      fr = next
    }

    return dist
  }

  while (fr.length > 0) {
    const next: number[] = []

    for (const u of fr) {
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!

        if (dist[w] === -1 && (!allowed || allowed[w])) {
          dist[w] = dist[u]! + 1
          next.push(w)
        }
      }
    }

    fr = next
  }

  return dist
}

// A connected BFS ball: the first up-to-`limit` nodes reached from `source` in
// breadth-first order, returned in that order. The contiguous blob the memory /
// imprint experiments stamp onto the tone before testing retention.
export function csrBallNodes(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
  source: number
  limit: number
}): number[] {
  const { offsets, adj, size, source, limit } = input
  const ball: number[] = []
  const seen = new Uint8Array(size)

  let frontier = [source]
  seen[source] = 1

  while (frontier.length > 0 && ball.length < limit) {
    const next: number[] = []

    for (const u of frontier) {
      ball.push(u)

      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!

        if (!seen[w] && ball.length + next.length < limit) {
          seen[w] = 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return ball
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

    for (const u of fr) {
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!

        if (dist[w] === -1) {
          dist[w] = dist[u]! + 1

          if (dist[w] > ecc) {
            ecc = dist[w]!
            far = w
          }

          next.push(w)
        }
      }
    }

    fr = next
  }

  return { dist, far }
}

// The full BFS visitation order from node 0 over a CSR graph, as an Int32Array of length `size`
// (every node listed once, in the order a breadth-first traversal reaches it). Used where a
// deterministic distance-sorted index of all cells is wanted (e.g. taking BFS-order prefixes).
export function csrBfsOrder(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
}): Int32Array {
  const { offsets, adj, size } = input
  const order = new Int32Array(size)
  const seen = new Uint8Array(size)

  let head = 0
  let tail = 0
  seen[0] = 1
  order[tail++] = 0

  while (head < tail) {
    const u = order[head++]!

    for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!

      if (!seen[w]) {
        seen[w] = 1
        order[tail++] = w
      }
    }
  }

  return order
}

// The LAST node discovered by a BFS from `source` (the deepest node in BFS-queue order, with
// ties broken by adjacency order rather than by first-at-max-distance). Differs from
// csrEccentricity().far, which returns the FIRST node reaching the maximum distance. Used as a
// far-seed picker where the deepest-discovered cell, not a canonical eccentric one, is wanted.
export function csrFarthestNode(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
  source: number
}): number {
  const { offsets, adj, size, source } = input
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0

  let fr = [source]
  let far = source

  while (fr.length > 0) {
    const next: number[] = []

    for (const u of fr) {
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!

        if (dist[w] === -1) {
          dist[w] = dist[u]! + 1
          far = w
          next.push(w)
        }
      }
    }

    fr = next
  }

  return far
}

// Breadth-first hop distance from `source` over a neighbor list (number[][] or the Graph's
// Uint32Array rows). Returns an Int32Array of distances (-1 for unreached).
export function neighborDistances(input: {
  neighbors: readonly (readonly number[] | Uint32Array)[]
  size: number
  source: number
}): Int32Array {
  const { neighbors, size, source } = input
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0

  let frontier = [source]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const u of frontier) {
      for (const w of neighbors[u]!) {
        if (dist[w] === -1) {
          dist[w] = (dist[u] ?? 0) + 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return dist
}

// BFS over an adjacency list returning both the distance and the predecessor (parent)
// of every reached node, so a geodesic path back to the source can be reconstructed by
// walking parents. Unreached nodes keep dist = -1, parent = -1.
export function neighborBfsTree(input: {
  neighbors: readonly (readonly number[] | Uint32Array)[]
  size: number
  source: number
}): { dist: Int32Array; parent: Int32Array } {
  const { neighbors, size, source } = input
  const dist = new Int32Array(size).fill(-1)
  const parent = new Int32Array(size).fill(-1)
  dist[source] = 0

  let frontier = [source]

  while (frontier.length > 0) {
    const next: number[] = []

    for (const u of frontier) {
      for (const w of neighbors[u]!) {
        if (dist[w] === -1) {
          dist[w] = (dist[u] ?? 0) + 1
          parent[w] = u
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return { dist, parent }
}

// Whether two adjacency lists describe the same undirected graph: same node count and,
// for every node, the same neighbor set (order-insensitive).
export function adjacencyListsEqual(
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    const x = [...(a[i] ?? [])].sort((p, q) => p - q)
    const y = [...(b[i] ?? [])].sort((p, q) => p - q)

    if (x.length !== y.length || x.some((v, k) => v !== y[k])) {
      return false
    }
  }

  return true
}

// Undirected edge list (each edge once, a < b). Useful for curvature and gauge.
// Undirected edges of an adjacency list as [v, w] tuples with v < w (each edge once).
export function edgesOf(
  neighbors: readonly ArrayLike<number>[],
): [number, number][] {
  const edges: [number, number][] = []

  for (let v = 0; v < neighbors.length; v++) {
    const row = neighbors[v]

    if (!row) {
      continue
    }

    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0

      if (w > v) {
        edges.push([v, w])
      }
    }
  }

  return edges
}

// A greedy proper edge coloring of a CSR graph: each color class is a set of disjoint edges
// (a matching), so updating all edges of one color in parallel touches every vertex at most
// once. Returns the edge endpoint arrays eu, ev (one entry per undirected edge w > v) and
// byColor, the edge indices grouped by color. Used to drive a reversible edge-local block
// rule over a whole crystal one matching at a time (run the colors backward to invert).
export function greedyEdgeColoring(input: {
  offsets: ArrayLike<number>
  adjacency: ArrayLike<number>
  size: number
}): { eu: Int32Array; ev: Int32Array; byColor: number[][] } {
  const { offsets, adjacency, size } = input
  const eu: number[] = []
  const ev: number[] = []
  const incident: number[][] = Array.from({ length: size }, () => [])

  for (let v = 0; v < size; v++) {
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adjacency[p]!

      if (w > v) {
        const e = eu.length
        eu.push(v)
        ev.push(w)
        incident[v]!.push(e)
        incident[w]!.push(e)
      }
    }
  }

  const color = new Int32Array(eu.length).fill(-1)

  for (let e = 0; e < eu.length; e++) {
    const used = new Set<number>()

    for (const f of incident[eu[e]!]!) {
      if (color[f]! >= 0) {
        used.add(color[f]!)
      }
    }

    for (const f of incident[ev[e]!]!) {
      if (color[f]! >= 0) {
        used.add(color[f]!)
      }
    }

    let c = 0

    while (used.has(c)) {
      c++
    }

    color[e] = c
  }

  let colorCount = 0

  for (let e = 0; e < eu.length; e++) {
    colorCount = Math.max(colorCount, color[e]! + 1)
  }

  const byColor: number[][] = Array.from(
    { length: colorCount },
    () => [],
  )

  for (let e = 0; e < eu.length; e++) {
    byColor[color[e]!]!.push(e)
  }

  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev), byColor }
}

export function edgeList(g: Graph): { a: number; b: number }[] {
  const out: { a: number; b: number }[] = []

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

    if (d > best) {
      best = d
      center = i
    }
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
    for (let a = 0; a < dim; a++) {
      coords[i * dim + a] = oldCoords[old * dim + a] ?? 0
    }

    return Array.from(g.neighbors[old] ?? new Uint32Array(0))
      .map(w => remap.get(w) ?? -1)
      .filter(x => x >= 0)
  })

  const embedding = g.embedding ? { ...g.embedding, coords } : undefined

  return makeGraph({
    size: kept.length,
    directed: false,
    neighbors,
    embedding,
  })
}
