// The periodic box of the D4 lattice in integers only (E-MTH-0027): the box of code/substrate/d4-box with
// every construction exact, so the committed knit's path holds no real number.
//
// A dock is stored by its coordinates c in the basis b1 = (1, -1, 0, 0), b2 = (0, 1, -1, 0),
// b3 = (0, 0, 1, -1), b4 = (0, 0, 1, 1) of D4, each taken mod L, index c1 + L c2 + L^2 c3 + L^3 c4. The
// basis matrix B (columns b1..b4) has determinant 2, and its inverse is its integer ADJUGATE over 2, so the
// coordinates of a D4 vector v are c = adj(B) v / 2, an exact integer quotient: every row of adj(B) sums the
// coordinates of v with signs, and a D4 vector has an even coordinate sum. There are no half-integers, no
// rounding and no tolerance. A vector that is not in D4 is refused, not rounded.
//
// A symmetry of the box (an element of W(F4), triality included) has half-integer entries, so it is held
// DOUBLED: the integer matrix 2M. Its action on docks is c' = adj(B) (2M) B c / 4, again an exact quotient.
//
// code/substrate/d4-box is the public face: it re-exports all of this and adds the real readouts (the
// Euclidean distance between docks, and W(F4) matrices with their halves as floats).

import { Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/integer-roots'

const BASIS: readonly (readonly number[])[] = [
  [1, -1, 0, 0],
  [0, 1, -1, 0],
  [0, 0, 1, -1],
  [0, 0, 1, 1],
]

// the adjugate of the basis matrix (columns b1..b4), rows as written: ADJUGATE B = DETERMINANT I
export const D4_ADJUGATE: readonly (readonly number[])[] = [
  [2, 0, 0, 0],
  [2, 2, 0, 0],
  [1, 1, 1, -1],
  [1, 1, 1, 1],
]

export const D4_DETERMINANT = 2

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(root =>
  ROOTS.findIndex(other =>
    other.every((x, k) => x === -(root[k] ?? 0)),
  ),
)

function modulo(value: number, side: number): number {
  return ((value % side) + side) % side
}

// the exact quotient of an integer by a positive divisor, or undefined when there is a remainder
function divides(value: number, divisor: number): number | undefined {
  const quotient = Math.trunc(value / divisor)

  return quotient * divisor === value ? quotient : undefined
}

// adj(B) v, an integer vector for an integer v
function adjugateTimes(vector: readonly number[]): number[] {
  return D4_ADJUGATE.map(row => row.reduce((sum, x, k) => sum + x * (vector[k] ?? 0), 0))
}

// the basis coordinates of a D4 vector: adj(B) v / 2, exact. A vector outside D4 is refused.
export function d4Coordinates(vector: readonly number[]): number[] {
  return adjugateTimes(vector).map(n => {
    const c = divides(n, D4_DETERMINANT)

    if (c === undefined) {
      throw new Error(`d4Coordinates: (${vector.join(', ')}) is not a D4 lattice vector`)
    }

    return c
  })
}

// a D4 vector from basis coordinates
export function d4Vector(coordinates: readonly number[]): number[] {
  return [0, 1, 2, 3].map(axis =>
    BASIS.reduce(
      (sum, b, k) => sum + (b[axis] ?? 0) * (coordinates[k] ?? 0),
      0,
    ),
  )
}

export function d4BoxCell(input: {
  coordinates: readonly number[]
  side: number
}): number {
  const { coordinates, side } = input

  return coordinates.reduce(
    (index, c, k) => index + modulo(c, side) * side ** k,
    0,
  )
}

export function d4BoxCoordinates(input: {
  cell: number
  side: number
}): number[] {
  const { cell, side } = input

  return [0, 1, 2, 3].map(k => Math.floor(cell / side ** k) % side)
}

// The SQUARED distance between two docks of the box, an integer: the shortest of the vectors between them
// over the periods L D4, trying the shift by each combination of -1, 0 and 1 periods along b1..b4.
export function d4BoxDistanceSquared(input: {
  a: number
  b: number
  side: number
}): number {
  const { a, b, side } = input
  const ca = d4BoxCoordinates({ cell: a, side })
  const cb = d4BoxCoordinates({ cell: b, side })
  const half = Math.floor(side / 2)
  const raw = ca.map((x, k) => modulo(x - (cb[k] ?? 0) + half, side) - half)

  let best = -1

  for (let shift = 0; shift < 81; shift++) {
    const s = [0, 1, 2, 3].map(k => (Math.floor(shift / 3 ** k) % 3) - 1)
    const vector = d4Vector(raw.map((x, k) => x + side * (s[k] ?? 0)))
    const squared = vector.reduce((sum, x) => sum + x * x, 0)

    best = best < 0 ? squared : Math.min(best, squared)
  }

  return best
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

      return d4BoxCell({
        coordinates: c.map((x, k) => x + (step[k] ?? 0)),
        side,
      })
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }
}

// The 4 x 4 linear map (rows) that a permutation of the 24 roots is, DOUBLED: the integer matrix 2M, read
// from four independent roots (b1..b4 are roots) as 2M = images adj(B), and checked on every root. Undefined
// when the permutation is not linear.
export function linearMapOfDoubled(
  permutation: readonly number[],
): number[][] | undefined {
  const indexOf = (vector: readonly number[]): number =>
    ROOTS.findIndex(r => r.every((x, k) => x === vector[k]))
  // images of the basis vectors, as columns
  const images = BASIS.map(
    b => ROOTS[permutation[indexOf(b)] ?? 0] ?? [0, 0, 0, 0],
  )
  // 2M[i][j] = sum_k images[k][i] ADJUGATE[k][j]
  const doubled = [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(j =>
      images.reduce(
        (sum, image, k) => sum + (image[i] ?? 0) * (D4_ADJUGATE[k]?.[j] ?? 0),
        0,
      ),
    ),
  )
  const linear = ROOTS.every((root, d) => {
    const image = doubled.map(row =>
      row.reduce((sum, x, k) => sum + x * (root[k] ?? 0), 0),
    )
    const target = ROOTS[permutation[d] ?? 0] ?? []

    return image.every((x, k) => x === 2 * (target[k] ?? 0))
  })

  return linear ? doubled : undefined
}

// The permutation of docks that a DOUBLED linear map 2M of R^4 (integer entries) induces on the box, or
// undefined when some dock is not sent to a dock (the map does not preserve D4, or not L D4). The image of
// the dock with coordinates c has coordinates adj(B) (2M) B c / 4, which must divide exactly.
export function boxCellMapDoubled(input: {
  doubled: readonly (readonly number[])[]
  side: number
}): number[] | undefined {
  const { doubled, side } = input
  const cells = side ** 4
  const map: number[] = []

  for (let cell = 0; cell < cells; cell++) {
    const vector = d4Vector(d4BoxCoordinates({ cell, side }))
    const image = doubled.map(row =>
      row.reduce((sum, x, k) => sum + x * (vector[k] ?? 0), 0),
    )
    const raw: number[] = []

    for (const n of adjugateTimes(image)) {
      const c = divides(n, 2 * D4_DETERMINANT)

      if (c === undefined) {
        return undefined
      }

      raw.push(c)
    }

    map.push(d4BoxCell({ coordinates: raw, side }))
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
      out[(cellMap[cell] ?? 0) * degree + (permutation[d] ?? 0)] =
        data[cell * degree + d] ?? 0
    }
  }

  return out
}
