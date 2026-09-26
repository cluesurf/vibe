// A periodic box of the D4 lattice on which the whole symmetry group of the coin acts.
//
// d4Mesh is the integer torus Z^4 / L Z^4 with the 24 D4 roots as directions. Its symmetries are
// the signed coordinate permutations, 384 of them, and the triality elements of W(F4) are not among
// them: a triality has entries of one half, so it maps L Z^4 to a lattice that is not L Z^4, and a
// cell to a point that is not a cell. The adoption search for the committed rule ran on that box, and
// its note records that "the triality cosets of the full 1,152 group do not act on the integer torus".
//
// This box takes its cells to be the D4 lattice itself (integer vectors with even coordinate sum) and
// its periods to be L D4. W(F4) permutes the D4 roots, so it maps D4 to D4 and L D4 to L D4, and every
// one of its 1,152 elements, triality included, is an exact automorphism of the box. The box has L^4
// cells, one connected D4 lattice (no parity split, since every cell already has even sum).
//
// A cell is stored by its coordinates c in the basis b1 = (1, -1, 0, 0), b2 = (0, 1, -1, 0),
// b3 = (0, 0, 1, -1), b4 = (0, 0, 1, 1) of D4, each taken mod L, index c1 + L c2 + L^2 c3 + L^3 c4.
//
// Since 2026-09-26 (E-MTH-0027) the box itself is built in integers only, in
// code/substrate/d4-box-integer: the basis inverted by its integer adjugate, W(F4) held doubled, no
// half-integer, rounding or tolerance. That file is what the committed knit imports. This file re-exports
// it unchanged and adds the REAL readouts, which measurement uses: the Euclidean distance between two
// cells and the W(F4) matrices with their halves as floats. E-MTH-0027 proves every output here equal to
// the half-integer implementation it replaced.

import {
  boxCellMapDoubled,
  d4BoxCell,
  d4BoxCoordinates,
  d4BoxDistanceSquared,
  d4BoxMesh,
  d4Coordinates,
  d4Vector,
  linearMapOfDoubled,
  transformState,
} from '@/code/substrate/d4-box-integer'

export {
  boxCellMapDoubled,
  d4BoxCell,
  d4BoxCoordinates,
  d4BoxDistanceSquared,
  d4BoxMesh,
  d4Coordinates,
  d4Vector,
  linearMapOfDoubled,
  transformState,
}

function modulo(value: number, side: number): number {
  return ((value % side) + side) % side
}

// The distance between two cells of the box: the shortest of the vectors between them over the
// periods L D4. Wrapping each basis coordinate on its own is not enough, since the basis is skewed,
// and it overstates distances near half a period, so the shift by each combination of -1, 0 and 1
// periods along b1..b4 is tried and the shortest kept. A real readout (a Euclidean length):
// d4BoxDistanceSquared is the exact integer it is the root of.
export function d4BoxDistance(input: {
  a: number
  b: number
  side: number
}): number {
  const { a, b, side } = input
  const ca = d4BoxCoordinates({ cell: a, side })
  const cb = d4BoxCoordinates({ cell: b, side })
  const raw = ca.map(
    (x, k) =>
      modulo(x - (cb[k] ?? 0) + Math.floor(side / 2), side) -
      Math.floor(side / 2),
  )

  let best = Number.POSITIVE_INFINITY

  for (let shift = 0; shift < 81; shift++) {
    const s = [0, 1, 2, 3].map(
      k => (Math.floor(shift / 3 ** k) % 3) - 1,
    )
    const vector = d4Vector(raw.map((x, k) => x + side * (s[k] ?? 0)))

    best = Math.min(best, Math.hypot(...vector))
  }

  return best
}

// The 4 x 4 linear map (rows) that a permutation of the 24 roots is, read from four independent roots
// (b1..b4 are roots), with its half-integer entries as floats: linearMapOfDoubled halved. Undefined when
// the permutation is not linear.
export function linearMapOf(
  permutation: readonly number[],
): number[][] | undefined {
  return linearMapOfDoubled(permutation)?.map(row => row.map(x => x / 2))
}

// The permutation of cells a linear map of R^4 induces on the box, or undefined when some cell is not
// sent to a cell (the map does not preserve D4, or not L D4). A map that preserves D4 has half-integer
// entries, so twice it is an integer matrix; one that does not is refused before any cell is read.
export function boxCellMap(input: {
  matrix: readonly (readonly number[])[]
  side: number
}): number[] | undefined {
  const doubled = input.matrix.map(row => row.map(x => 2 * x))

  if (doubled.some(row => row.some(x => !Number.isInteger(x)))) {
    return undefined
  }

  return boxCellMapDoubled({ doubled, side: input.side })
}
