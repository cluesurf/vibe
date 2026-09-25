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

import { Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'

const BASIS: readonly (readonly number[])[] = [
  [1, -1, 0, 0],
  [0, 1, -1, 0],
  [0, 0, 1, -1],
  [0, 0, 1, 1],
]

// the inverse of the basis matrix (columns b1..b4), rows as written, so c = INVERSE v
const INVERSE: readonly (readonly number[])[] = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [0.5, 0.5, 0.5, -0.5],
  [0.5, 0.5, 0.5, 0.5],
]

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(root => ROOTS.findIndex(other => other.every((x, k) => x === -(root[k] ?? 0))))

function modulo(value: number, side: number): number {
  return ((value % side) + side) % side
}

// the basis coordinates of a D4 vector (exact integers for a lattice vector)
export function d4Coordinates(vector: readonly number[]): number[] {
  return INVERSE.map(row => Math.round(row.reduce((sum, x, k) => sum + x * (vector[k] ?? 0), 0)))
}

// a D4 vector from basis coordinates
export function d4Vector(coordinates: readonly number[]): number[] {
  return [0, 1, 2, 3].map(axis => BASIS.reduce((sum, b, k) => sum + (b[axis] ?? 0) * (coordinates[k] ?? 0), 0))
}

export function d4BoxCell(input: { coordinates: readonly number[]; side: number }): number {
  const { coordinates, side } = input

  return coordinates.reduce((index, c, k) => index + modulo(c, side) * side ** k, 0)
}

export function d4BoxCoordinates(input: { cell: number; side: number }): number[] {
  const { cell, side } = input

  return [0, 1, 2, 3].map(k => Math.floor(cell / side ** k) % side)
}

// The D4 lattice mod L D4, with the 24 D4 roots as directions in the order of rootsD4.
export function d4BoxMesh(input: { side: number }): Mesh {
  const { side } = input
  const rootCoordinates = ROOTS.map(d4Coordinates)

  return {
    id: `d4-box-${side}`,
    degree: 24,
    cellCount: side ** 4,
    neighbour(cell, direction) {
      const c = d4BoxCoordinates({ cell, side })
      const step = rootCoordinates[direction] ?? [0, 0, 0, 0]

      return d4BoxCell({ coordinates: c.map((x, k) => x + (step[k] ?? 0)), side })
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }
}

// The 4 x 4 linear map (rows) that a permutation of the 24 roots is, read from four independent roots
// (b1..b4 are roots). Undefined when the permutation is not linear.
export function linearMapOf(permutation: readonly number[]): number[][] | undefined {
  const indexOf = (vector: readonly number[]): number => ROOTS.findIndex(r => r.every((x, k) => x === vector[k]))
  // images of the basis vectors, as columns
  const images = BASIS.map(b => ROOTS[permutation[indexOf(b)] ?? 0] ?? [0, 0, 0, 0])
  // M = images * INVERSE_BASIS, M[i][j] = sum_k images[k][i] INVERSE[k][j]
  const matrix = [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(j => images.reduce((sum, image, k) => sum + (image[i] ?? 0) * (INVERSE[k]?.[j] ?? 0), 0)),
  )
  const linear = ROOTS.every((root, d) => {
    const image = matrix.map(row => row.reduce((sum, x, k) => sum + x * (root[k] ?? 0), 0))
    const target = ROOTS[permutation[d] ?? 0] ?? []

    return image.every((x, k) => Math.abs(x - (target[k] ?? 0)) < 1e-9)
  })

  return linear ? matrix : undefined
}

// The permutation of cells a linear map of R^4 induces on the box, or undefined when some cell is not
// sent to a cell (the map does not preserve D4, or not L D4).
export function boxCellMap(input: { matrix: readonly (readonly number[])[]; side: number }): number[] | undefined {
  const { matrix, side } = input
  const cells = side ** 4
  const map: number[] = []

  for (let cell = 0; cell < cells; cell++) {
    const vector = d4Vector(d4BoxCoordinates({ cell, side }))
    const image = matrix.map(row => row.reduce((sum, x, k) => sum + x * (vector[k] ?? 0), 0))
    const raw = INVERSE.map(row => row.reduce((sum, x, k) => sum + x * (image[k] ?? 0), 0))

    if (raw.some(x => Math.abs(x - Math.round(x)) > 1e-9)) {
      return undefined
    }

    map.push(d4BoxCell({ coordinates: raw.map(Math.round), side }))
  }

  return new Set(map).size === cells ? map : undefined
}

// A symmetry acting on a state: the tone in slot (cell, d) moves to (cellMap[cell], permutation[d]).
export function transformState(input: {
  data: Int8Array
  cellMap: readonly number[]
  permutation: readonly number[]
  degree: number
}): Int8Array {
  const { data, cellMap, permutation, degree } = input
  const out = new Int8Array(data.length)

  for (let cell = 0; cell < cellMap.length; cell++) {
    for (let d = 0; d < degree; d++) {
      out[(cellMap[cell] ?? 0) * degree + (permutation[d] ?? 0)] = data[cell * degree + d] ?? 0
    }
  }

  return out
}
