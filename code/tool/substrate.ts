// The substrate union and a shared adjacency view, so measurements that need
// only adjacency run on either a Poset (causal set) or a Graph (mesh / tiling).

import { Poset } from '@/code/tool/poset'
import { Graph } from '@/code/tool/graph'
import { Embedding } from '@/code/tool/embedding'

export type Substrate = Poset | Graph

export type AdjacencyView = {
  readonly size: number
  outDegree(input: { node: number }): number
  forEachOut(input: { node: number; visit: (to: number) => void }): void
}

export function embeddingOf(input: {
  substrate: Substrate
}): Embedding | undefined {
  return input.substrate.embedding
}

// Out-adjacency: a Poset uses its covering links, a Graph uses its neighbors.
export function adjacencyOf(input: {
  substrate: Substrate
}): AdjacencyView {
  const s = input.substrate

  if (s.form === 'poset') {
    return {
      size: s.size,
      outDegree: ({ node }) =>
        (s.links[node] ?? new Uint32Array(0)).length,
      forEachOut: ({ node, visit }) => {
        const row = s.links[node] ?? new Uint32Array(0)

        for (const value of row) visit(value)
      },
    }
  }

  return {
    size: s.size,
    outDegree: ({ node }) =>
      (s.neighbors[node] ?? new Uint32Array(0)).length,
    forEachOut: ({ node, visit }) => {
      const row = s.neighbors[node] ?? new Uint32Array(0)

      for (const value of row) visit(value)
    },
  }
}

// Undirected adjacency view: a Poset is symmetrised over its links, a Graph
// over its neighbours. Used by distance and ball-growth measures.
export function undirectedAdjacency(input: {
  substrate: Substrate
}): readonly Uint32Array[] {
  const s = input.substrate
  const out: number[][] = Array.from({ length: s.size }, () => [])

  if (s.form === 'poset') {
    for (let a = 0; a < s.size; a++) {
      const row = s.links[a] ?? new Uint32Array(0)

      for (const b of row) {
        out[a]?.push(b)
        out[b]?.push(a)
      }
    }
  } else {
    for (let a = 0; a < s.size; a++) {
      const row = s.neighbors[a] ?? new Uint32Array(0)

      for (const b of row) {
        out[a]?.push(b)

        if (s.directed) out[b]?.push(a)
      }
    }
  }

  return out.map(r =>
    Uint32Array.from([...new Set(r)].sort((x, y) => x - y)),
  )
}

// Mean out-degree over a substrate (a Poset's links or a Graph's neighbours). Works
// on either form, unlike the Graph-only meanDegree in tool/graph.
export function substrateMeanDegree(input: {
  substrate: Substrate
}): number {
  const view = adjacencyOf({ substrate: input.substrate })

  let total = 0

  for (let node = 0; node < view.size; node++)
    total += view.outDegree({ node })

  return total / Math.max(1, view.size)
}

// Mean UNDIRECTED degree over a substrate: builds the symmetrized neighbour list
// (so a -> b also counts at b) and averages its length. The right notion when the
// substrate's edges are physically undirected (the spatial-substrate comparisons).
export function substrateUndirectedMeanDegree(input: {
  substrate: Substrate
}): number {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })

  let total = 0

  for (let node = 0; node < input.substrate.size; node++)
    total += (adjacency[node] ?? new Uint32Array(0)).length

  return total / Math.max(1, input.substrate.size)
}
