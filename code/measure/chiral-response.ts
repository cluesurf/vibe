// Handedness measures for a lattice-gas rule on the D4 coin, and the rotation algebra they need.
//
// - vacuumCellTrajectory: the vacuum born from the empty state. The empty state is the same in every
//   cell, streaming moves a uniform state onto itself, so the vacuum stays uniform and is exactly the
//   iteration of the cell collision from zero. The vacuum of a rule whose empty cell is not fixed is a
//   condensate, and this is its exact per-cell history.
// - loneChargeCurrent: the charge current carried by one added tone over a run, the vacuum current
//   subtracted. After beat t's collision a tone in slot d moves along direction d, so the current of
//   a state is the sum over slots of tone times direction, and the difference current is exact
//   integer arithmetic with no centroid and no wrapping. Its time average is the rate at which the
//   added charge's dipole moment grows: a lone free tone gives exactly its direction, a pinned one 0,
//   and a tone that radiates pairs can exceed the single-tone speed (a love and a fear moving apart
//   carry twice the current of one).
// - selfDualSplit: the antisymmetric part of a 4 x 4 matrix as a two-form, split into its self-dual
//   and anti-self-dual halves, the su(2) + su(2) of so(4). A reflection of R^4 exchanges the halves,
//   so a response whose halves differ in size is not mirror symmetric.
// - isoclinicFactors: a rotation of R^4 as x -> l x conj(r) with unit quaternions l and r, the pair
//   (l, r) in SU(2)_L x SU(2)_R that covers it (up to one overall sign), from x = 1 (giving l conj(r))
//   and the rotation of the imaginary quaternions that remains.

import { Collision } from '@/code/rule/collision'
import { Mesh } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  quaternionConjugate,
  quaternionMultiply,
  type Quaternion as Quaternion4,
} from '@/code/algebra/binary-tetrahedral'

export function vacuumCellTrajectory(input: {
  schedule: (beat: number) => Collision
  beats: number
  degree: number
}): Int8Array[] {
  const cell = new Int8Array(input.degree)
  const out: Int8Array[] = []

  for (let t = 0; t < input.beats; t++) {
    input.schedule(t)(cell, 0, input.degree)
    out.push(Int8Array.from(cell))
  }

  return out
}

// the mean charge current of one tone added at (cell, direction) on the vacuum, over `beats` beats
export function loneChargeCurrent(input: {
  mesh: Mesh
  schedule: (beat: number) => Collision
  directions: readonly (readonly number[])[]
  vacuum: readonly Int8Array[]
  cell: number
  direction: number
  tone: number
  beats: number
}): number[] {
  const { mesh, schedule, directions, vacuum, beats } = input
  const degree = mesh.degree
  const dimension = directions[0]?.length ?? 0
  const table = streamSourceTable(mesh)
  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)
  const total = new Array<number>(dimension).fill(0)

  src.data[input.cell * degree + input.direction] = input.tone

  for (let t = 0; t < beats; t++) {
    const collision = schedule(t)

    for (let c = 0; c < mesh.cellCount; c++) {
      collision(src.data, c * degree, degree)
    }

    for (let i = 0; i < src.data.length; i++) {
      const tone = src.data[i] ?? 0

      if (tone !== 0) {
        const direction = directions[i % degree] ?? []

        for (let a = 0; a < dimension; a++) {
          total[a] = (total[a] ?? 0) + tone * (direction[a] ?? 0)
        }
      }
    }

    const cellVacuum = vacuum[t] ?? new Int8Array(degree)

    for (let d = 0; d < degree; d++) {
      const tone = cellVacuum[d] ?? 0

      if (tone !== 0) {
        const direction = directions[d] ?? []

        for (let a = 0; a < dimension; a++) {
          total[a] =
            (total[a] ?? 0) - tone * (direction[a] ?? 0) * mesh.cellCount
        }
      }
    }

    const from = src.data
    const to = dst.data

    for (let i = 0; i < table.length; i++) {
      to[i] = from[table[i] ?? 0] ?? 0
    }

    const swap = src

    src = dst
    dst = swap
  }

  return total.map(x => x / beats)
}

// Is one tone added at (cell, direction) on the vacuum an exactly free traveller: after every beat the
// state differs from the vacuum in exactly one slot, the same direction, one step further along it.
// Returns the largest number of differing slots seen and whether every beat was that single step.
export function loneTravel(input: {
  mesh: Mesh
  schedule: (beat: number) => Collision
  vacuum: readonly Int8Array[]
  cell: number
  direction: number
  tone: number
  beats: number
}): { exactlyFree: boolean; largestSupport: number } {
  const { mesh, schedule, vacuum, direction, beats } = input
  const degree = mesh.degree
  const table = streamSourceTable(mesh)
  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)
  let expected = input.cell
  let exactlyFree = true
  let largestSupport = 0

  src.data[input.cell * degree + direction] = input.tone

  for (let t = 0; t < beats; t++) {
    const collision = schedule(t)

    for (let c = 0; c < mesh.cellCount; c++) {
      collision(src.data, c * degree, degree)
    }

    const from = src.data
    const to = dst.data

    for (let i = 0; i < table.length; i++) {
      to[i] = from[table[i] ?? 0] ?? 0
    }

    const swap = src

    src = dst
    dst = swap
    expected = mesh.neighbour(expected, direction)

    // after streaming a uniform vacuum is still v_t in every cell
    const background = vacuum[t] ?? new Int8Array(degree)
    let support = 0
    let at = -1

    for (let i = 0; i < src.data.length; i++) {
      if (src.data[i] !== background[i % degree]) {
        support++
        at = i
      }
    }

    largestSupport = Math.max(largestSupport, support)

    if (support !== 1 || at !== expected * degree + direction) {
      exactlyFree = false
    }
  }

  return { exactlyFree, largestSupport }
}

// response[i][j] = sum over directions d of current(d)_i direction(d)_j
export function responseMatrix(input: {
  currents: readonly (readonly number[])[]
  directions: readonly (readonly number[])[]
}): number[][] {
  const { currents, directions } = input

  return [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(j =>
      currents.reduce(
        (sum, v, d) => sum + (v[i] ?? 0) * (directions[d]?.[j] ?? 0),
        0,
      ),
    ),
  )
}

export function selfDualSplit(matrix: readonly (readonly number[])[]): {
  selfDual: number[]
  antiSelfDual: number[]
} {
  const f = (i: number, j: number): number =>
    ((matrix[i]?.[j] ?? 0) - (matrix[j]?.[i] ?? 0)) / 2

  return {
    selfDual: [f(0, 1) + f(2, 3), f(0, 2) - f(1, 3), f(0, 3) + f(1, 2)],
    antiSelfDual: [f(0, 1) - f(2, 3), f(0, 2) + f(1, 3), f(0, 3) - f(1, 2)],
  }
}

function asQuaternion(q: readonly number[]): Quaternion4 {
  return [q[0] ?? 0, q[1] ?? 0, q[2] ?? 0, q[3] ?? 0]
}

function quaternionProduct(
  a: readonly number[],
  b: readonly number[],
): Quaternion4 {
  return quaternionMultiply(asQuaternion(a), asQuaternion(b))
}

function quaternionBar(q: readonly number[]): Quaternion4 {
  return quaternionConjugate(asQuaternion(q))
}

function applyMatrix(
  matrix: readonly (readonly number[])[],
  x: readonly number[],
): number[] {
  return matrix.map(row =>
    row.reduce((sum, value, k) => sum + value * (x[k] ?? 0), 0),
  )
}

// the unit quaternion r (up to sign) whose conjugation x -> r x conj(r) is the given rotation Q of
// the imaginary three-space (Q given as its action on i, j, k, columns), by the trace formula
function quaternionOfRotation(q: readonly (readonly number[])[]): Quaternion4 {
  const m = (i: number, j: number): number => q[i]?.[j] ?? 0
  const trace = m(0, 0) + m(1, 1) + m(2, 2)
  const candidates: Quaternion4[] = [
    [1 + trace, m(2, 1) - m(1, 2), m(0, 2) - m(2, 0), m(1, 0) - m(0, 1)],
    [m(2, 1) - m(1, 2), 1 + m(0, 0) - m(1, 1) - m(2, 2), m(0, 1) + m(1, 0), m(0, 2) + m(2, 0)],
    [m(0, 2) - m(2, 0), m(0, 1) + m(1, 0), 1 - m(0, 0) + m(1, 1) - m(2, 2), m(1, 2) + m(2, 1)],
    [m(1, 0) - m(0, 1), m(0, 2) + m(2, 0), m(1, 2) + m(2, 1), 1 - m(0, 0) - m(1, 1) + m(2, 2)],
  ]
  // the numerically best of the four equivalent forms is the one with the largest norm
  const best = candidates.reduce((x, y) =>
    Math.hypot(...y) > Math.hypot(...x) ? y : x,
  )
  const norm = Math.hypot(...best)

  return best.map(v => v / norm) as Quaternion4
}

// (l, r) with matrix x = l x conj(r) for every x, or undefined when the matrix is not a rotation of
// that form (a reflection)
export function isoclinicFactors(
  matrix: readonly (readonly number[])[],
): { left: Quaternion4; right: Quaternion4 } | undefined {
  const a = applyMatrix(matrix, [1, 0, 0, 0])
  const aBar = quaternionBar(a)
  // Q(x) = conj(a) M(x), a rotation fixing 1, restricted to i, j, k
  const basis = [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  const images = basis.map(x => quaternionProduct(aBar, applyMatrix(matrix, x)))
  const rotation = [0, 1, 2].map(i => [0, 1, 2].map(j => images[j]?.[i + 1] ?? 0))
  const right = quaternionOfRotation(rotation)
  const left = quaternionProduct(a, right)

  // check the factorization on every basis vector
  for (const x of [[1, 0, 0, 0], ...basis]) {
    const image = quaternionProduct(quaternionProduct(left, x), quaternionBar(right))
    const target = applyMatrix(matrix, x)

    if (image.some((v, k) => Math.abs(v - (target[k] ?? 0)) > 1e-9)) {
      return undefined
    }
  }

  return { left, right }
}

// the SO(3) rotation angle, in degrees, of the unit quaternion q acting by conjugation (sign blind)
export function so3AngleDegrees(q: readonly number[]): number {
  return (2 * Math.acos(Math.min(1, Math.abs(q[0] ?? 0))) * 180) / Math.PI
}

// the order of a unit quaternion in SU(2), or 0 when none up to the limit
export function quaternionOrder(q: readonly number[], limit = 48): number {
  let power: Quaternion4 = [q[0] ?? 0, q[1] ?? 0, q[2] ?? 0, q[3] ?? 0]

  for (let n = 1; n <= limit; n++) {
    if (
      Math.abs(power[0] - 1) < 1e-9 &&
      Math.abs(power[1]) < 1e-9 &&
      Math.abs(power[2]) < 1e-9 &&
      Math.abs(power[3]) < 1e-9
    ) {
      return n
    }

    power = quaternionProduct(power, q)
  }

  return 0
}
