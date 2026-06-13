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

// A plain number[][] view of a Graph's neighbors (for the neighbors-native measures and renders).
export function neighborsOf(g: Graph): number[][] {
  return g.neighbors.map((row) => Array.from(row))
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
