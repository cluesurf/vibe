// Coordinate blocking on a 4D periodic mesh. Cells of a d4Mesh of side `meshSide` are indexed
// x + side*y + side^2*z + side^3*w, and a block of side `blockSide` groups them into cubes.
// This is the one source of truth for that grouping, shared by the continuity balance and the
// coarse-resolution measure.
//
// The factory returns a closure so the per-cell call stays a single argument, which keeps it cheap
// inside a loop over every cell and lets it drop straight into any `regionOf` slot.

export function blockIndexer(input: {
  meshSide: number
  blockSide: number
}): (cell: number) => number {
  const { meshSide, blockSide } = input
  const area = meshSide * meshSide
  const volume = area * meshSide
  const nb = meshSide / blockSide

  return function blockIndexOf(cell: number): number {
    const x = cell % meshSide
    const y = Math.floor(cell / meshSide) % meshSide
    const z = Math.floor(cell / area) % meshSide
    const w = Math.floor(cell / volume) % meshSide
    const bx = Math.floor(x / blockSide)
    const by = Math.floor(y / blockSide)
    const bz = Math.floor(z / blockSide)
    const bw = Math.floor(w / blockSide)

    return bx + nb * by + nb * nb * bz + nb * nb * nb * bw
  }
}

// How many blocks a mesh of side `meshSide` splits into at block side `blockSide`.
export function blockCount(input: {
  meshSide: number
  blockSide: number
}): number {
  const nb = input.meshSide / input.blockSide

  return nb * nb * nb * nb
}
