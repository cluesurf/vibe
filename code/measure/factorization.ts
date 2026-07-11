// The preferred-factorization measure, from Tegmark's quantum factorization problem
// (arXiv:1401.1219). Tegmark asks why the state factors into the integrated, nearly
// independent objects we perceive, rather than into any of the countless other valid
// partitions. His criterion for a good object is a high ratio of internal integration
// to external coupling. On a graph this is exact and integer: for a partition of the
// cells into blocks, the internal edges (both endpoints in one block) measure
// integration, the crossing edges (endpoints in different blocks) measure coupling,
// and the robustness fraction is internal / (internal + external).
//
// The claim vibe makes is that its {3,4,3,4} mesh SUPPLIES such a partition by
// construction (spatially compact blocks are internally dense and touch only at their
// boundary). The honest test compares the SAME block labels on the real mesh against a
// degree-preserving scramble (which keeps every degree but destroys locality) and
// against a flat lattice. If the mesh alone gives a high robustness fraction that the
// scramble destroys, the geometry is doing the factorizing, not the labelling.

// Multi-source breadth-first labels: each cell takes the label of the nearest seed, so
// the blocks are spatially compact Voronoi regions grown on the graph itself. Seeds are
// passed in explicitly (chosen deterministically by the caller, evenly spaced indices),
// so there is no randomness. Ties break to the lower seed index, deterministically.
export function nearestSeedLabels(input: {
  neighbors: readonly (readonly number[])[]
  seeds: readonly number[]
}): Int32Array {
  const { neighbors, seeds } = input
  const cellCount = neighbors.length
  const label = new Int32Array(cellCount).fill(-1)
  const distance = new Int32Array(cellCount).fill(-1)
  const queue: number[] = []

  for (let s = 0; s < seeds.length; s++) {
    const seed = seeds[s]!

    if (label[seed] === -1) {
      label[seed] = s
      distance[seed] = 0
      queue.push(seed)
    }
  }

  let head = 0

  while (head < queue.length) {
    const cell = queue[head]!

    head++

    const row = neighbors[cell]!

    for (const next of row) {
      if (label[next] === -1) {
        label[next] = label[cell]!
        distance[next] = distance[cell]! + 1
        queue.push(next)
      }
    }
  }

  return label
}

// The exact internal / external / crossing edge counts for a labelled partition, and
// the robustness fraction internal / (internal + external). Counts each undirected edge
// once (a < b).
export function edgeRobustness(input: {
  neighbors: readonly (readonly number[])[]
  labels: ArrayLike<number>
}): { internal: number; external: number; fraction: number } {
  const { neighbors, labels } = input
  const cellCount = neighbors.length

  let internal = 0
  let external = 0

  for (let a = 0; a < cellCount; a++) {
    const row = neighbors[a]!

    for (const b of row) {
      if (b <= a) continue

      if (labels[a] === labels[b]) {
        internal++
      } else {
        external++
      }
    }
  }

  const total = internal + external
  const fraction = total === 0 ? 0 : internal / total

  return { internal, external, fraction }
}

// Evenly spaced seed indices over a cell count, deterministic. Used to place the block
// centres without any random choice.
export function evenlySpacedSeeds(input: {
  cellCount: number
  blocks: number
}): number[] {
  const { cellCount, blocks } = input
  const seeds: number[] = []
  const step = cellCount / blocks

  for (let i = 0; i < blocks; i++)
    seeds.push(Math.min(cellCount - 1, Math.floor(i * step)))

  return seeds
}
