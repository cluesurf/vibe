// Block (cluster) constructions for real-space renormalization on a graph, and the coherence-tunable
// edge fills that set whether coherent domains can form. Three pieces:
//   - geometricBlocks: tone-INDEPENDENT blocks (BFS balls grown from random seeds), so a coarse rule
//     measured on them is not a same-tone-cluster tautology.
//   - domainBlocks: connected regions of one tone (the system's own coherent domains), each internally
//     uniform, the coarse-graining that respects the structure.
//   - coherentFills: symmetric per-edge fills, +1 with probability p else -1. p = 0.5 is frustrated
//     (spin-glass, no domains), p -> 1 is ordered (ferromagnetic), the knob that turns coherence on.
// Coarse-graining a tone field to per-cluster majorities is code/measure/agreement clusterMajority.

import { Graph } from '@/code/tool/graph'
import { Rng } from '@/code/tool/rng'

// Compact Voronoi blocks on a CSR graph: scatter ~size/targetSize seeds, assign each cell to its
// nearest seed by multi-source BFS. Returns the block index per cell and the block count. The CSR
// counterpart of geometricBlocks (which works on a Graph's adjacency lists).
export function csrVoronoiBlocks(input: {
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  size: number
  targetSize: number
  rng: Rng
}): { blockOf: Int32Array; numBlocks: number } {
  const { offsets, adj, size, targetSize, rng } = input
  const numSeeds = Math.max(1, Math.floor(size / targetSize))
  const isSeed = new Uint8Array(size)
  const seeds: number[] = []

  while (seeds.length < numSeeds) {
    const c = rng.nextInt({ max: size })

    if (!isSeed[c]) {
      isSeed[c] = 1
      seeds.push(c)
    }
  }

  const blockOf = new Int32Array(size).fill(-1)

  let fr: number[] = []

  for (let s = 0; s < seeds.length; s++) {
    blockOf[seeds[s]!] = s
    fr.push(seeds[s]!)
  }

  while (fr.length > 0) {
    const next: number[] = []

    for (const u of fr) {
      for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
        const w = adj[p]!

        if (blockOf[w] === -1) {
          blockOf[w] = blockOf[u]!
          next.push(w)
        }
      }
    }

    fr = next
  }

  return { blockOf, numBlocks: numSeeds }
}

// Geometric (tone-independent) blocks: scatter ~size^-1 seeds, grow each by multi-source BFS until the
// whole graph is claimed, leftover unreached cells become singleton blocks. Returns the block index per
// cell and the total block count.
export function geometricBlocks(
  g: Graph,
  blockSize: number,
  rng: Rng,
): { cl: Int32Array; K: number } {
  const n = g.size
  const numSeeds = Math.max(2, Math.floor(n / blockSize))
  const seedSet = new Set<number>()

  while (seedSet.size < numSeeds) {
    seedSet.add(rng.nextInt({ max: n }))
  }

  const cl = new Int32Array(n).fill(-1)

  let frontier: number[] = []

  ;[...seedSet].forEach((sd, c) => {
    cl[sd] = c
    frontier.push(sd)
  })

  while (frontier.length > 0) {
    const next: number[] = []

    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (cl[w] === -1) {
          cl[w] = cl[v] ?? 0
          next.push(w)
        }
      }
    }

    frontier = next
  }

  let nc = seedSet.size

  for (let v = 0; v < n; v++) {
    if (cl[v] === -1) {
      cl[v] = nc++
    }
  }

  return { cl, K: nc }
}

// Domain blocks: connected regions of one tone (the coherent domains of the field). Each block is
// internally uniform, so the mean-field closure (a member is its block's tone) is exact on them.
export function domainBlocks(
  g: Graph,
  tone: Int8Array,
): { cl: Int32Array; K: number } {
  const n = g.size
  const cl = new Int32Array(n).fill(-1)

  let K = 0

  for (let s = 0; s < n; s++) {
    if (cl[s] !== -1) {
      continue
    }

    cl[s] = K
    let frontier = [s]

    while (frontier.length > 0) {
      const next: number[] = []

      for (const v of frontier) {
        for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
          if (cl[w] === -1 && tone[w] === tone[v]) {
            cl[w] = K
            next.push(w)
          }
        }
      }

      frontier = next
    }

    K++
  }

  return { cl, K }
}

// Symmetric coherence-tunable edge fills: each undirected edge gets +1 with probability p else -1,
// written to both half-edges. p = 0.5 is frustrated, p -> 1 is ordered (coherent domains form).
export function coherentFills(
  g: Graph,
  p: number,
  rng: Rng,
): Int8Array[] {
  const indexOf = g.neighbors.map(row => {
    const m = new Map<number, number>()

    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }

    return m
  })

  const fills = g.neighbors.map(row => new Int8Array(row.length))

  for (let v = 0; v < g.size; v++) {
    const row = g.neighbors[v] ?? new Uint32Array(0)

    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0

      if (w > v) {
        const fillVal: number = rng.next() < p ? 1 : -1

        ;(fills[v] as Int8Array)[k] = fillVal
        const kk = indexOf[w]?.get(v)

        if (kk !== undefined) {
          ;(fills[w] as Int8Array)[kk] = fillVal
        }
      }
    }
  }

  return fills
}
