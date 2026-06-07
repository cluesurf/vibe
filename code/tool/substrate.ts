// The substrate union and a shared adjacency view, so measurements that need
// only adjacency run on either a Poset (causal set) or a Graph (mesh / tiling).

import { Poset } from '~/tool/poset'
import { Graph } from '~/tool/graph'
import { Embedding } from '~/tool/embedding'

export type Substrate = Poset | Graph

export interface AdjacencyView {
  readonly size: number
  outDegree(input: { node: number }): number
  forEachOut(input: { node: number; visit: (to: number) => void }): void
}

export function embeddingOf(input: { substrate: Substrate }): Embedding | undefined {
  return input.substrate.embedding
}

// Out-adjacency: a Poset uses its covering links, a Graph uses its neighbors.
export function adjacencyOf(input: { substrate: Substrate }): AdjacencyView {
  const s = input.substrate
  if (s.form === 'poset') {
    return {
      size: s.size,
      outDegree: ({ node }) => (s.links[node] ?? new Uint32Array(0)).length,
      forEachOut: ({ node, visit }) => {
        const row = s.links[node] ?? new Uint32Array(0)
        for (let k = 0; k < row.length; k++) {
          visit(row[k] ?? 0)
        }
      },
    }
  }
  return {
    size: s.size,
    outDegree: ({ node }) => (s.neighbors[node] ?? new Uint32Array(0)).length,
    forEachOut: ({ node, visit }) => {
      const row = s.neighbors[node] ?? new Uint32Array(0)
      for (let k = 0; k < row.length; k++) {
        visit(row[k] ?? 0)
      }
    },
  }
}

// Undirected adjacency view: a Poset is symmetrised over its links, a Graph
// over its neighbours. Used by distance and ball-growth measures.
export function undirectedAdjacency(input: {
  substrate: Substrate
}): ReadonlyArray<Uint32Array> {
  const s = input.substrate
  const out: number[][] = Array.from({ length: s.size }, () => [])
  if (s.form === 'poset') {
    for (let a = 0; a < s.size; a++) {
      const row = s.links[a] ?? new Uint32Array(0)
      for (let k = 0; k < row.length; k++) {
        const b = row[k] ?? 0
        out[a]?.push(b)
        out[b]?.push(a)
      }
    }
  } else {
    for (let a = 0; a < s.size; a++) {
      const row = s.neighbors[a] ?? new Uint32Array(0)
      for (let k = 0; k < row.length; k++) {
        const b = row[k] ?? 0
        out[a]?.push(b)
        if (s.directed) {
          out[b]?.push(a)
        }
      }
    }
  }
  return out.map((r) => Uint32Array.from([...new Set(r)].sort((x, y) => x - y)))
}
