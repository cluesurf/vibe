// The reversible charge-conserving lattice-gas rule on a generated Coxeter matrix mesh (the adjacency
// from buildCoxeterMatrixMesh). State is one occupation per generator direction per cell. STREAM moves
// each occupation across its generator to the neighbour, or reflects in place where the mesh boundary
// has no neighbour (adjacency -1). Each generator is an involution (the neighbour of the neighbour is
// the cell again), so per-direction streaming is a bijection: charge-conserving and exactly reversible.
// COLLIDE is a fixed cyclic permutation of the directions per cell, reversible (forward shifts one way,
// backward the other). A beat is collide-then-stream, the inverse stream-then-collide-backward.

type Adjacency = readonly (readonly number[])[]

// One stream beat: occupation on direction d at cell hops to adjacency[cell][d] (or stays put at a boundary).
export function streamCoxeterMeshGas(input: {
  state: readonly (readonly number[])[]
  adjacency: Adjacency
  rank: number
}): number[][] {
  const { state, adjacency, rank } = input
  const cells = adjacency.length
  const out = Array.from({ length: cells }, () =>
    new Array<number>(rank).fill(0),
  )

  for (let cell = 0; cell < cells; cell++) {
    for (let d = 0; d < rank; d++) {
      const target =
        (adjacency[cell]![d]!) === -1 ? cell : adjacency[cell]![d]!

      out[target]![d] = state[cell]![d]!
    }
  }

  return out
}

// One collide beat: a cyclic permutation of each cell's direction slots. forward shifts by minus one,
// backward by plus one (the exact inverse).
export function collideCoxeterMeshGas(input: {
  state: readonly (readonly number[])[]
  rank: number
  forward: boolean
}): number[][] {
  const { state, rank, forward } = input

  return state.map(slots =>
    slots.map(
      (_, d) =>
        slots[forward ? (d + rank - 1) % rank : (d + 1) % rank]!,
    ),
  )
}

// Total charge over all cells and direction slots.
export function countCoxeterMeshGas(
  state: readonly (readonly number[])[],
): number {
  return state.reduce(
    (sum, slots) => sum + slots.reduce((s, v) => s + v, 0),
    0,
  )
}
