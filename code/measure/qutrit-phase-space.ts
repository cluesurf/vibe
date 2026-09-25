// The discrete phase space of one qutrit, and which unitaries act on it classically.
//
// A qutrit has a 3 x 3 phase space, the points (a, b) in Z_3^2. Its displacement (Weyl) operators
// are D(a, b) = omega^(2ab) X^a Z^b, with X|j> = |j + 1>, Z|j> = omega^j |j>, and 2 = 1/2 mod 3. The
// phase-point operators A(a, b) = D(a, b) P D(a, b)^dagger, with P|j> = |-j> the parity, give the
// discrete Wigner function W(a, b) = Tr(rho A(a, b)) / 3 (Wootters 1987, Gross 2006). It sums to 1 and
// is real, and for odd dimension it is nonnegative exactly on the stabilizer states and their mixtures.
//
// A unitary acts CLASSICALLY on this phase space when conjugation permutes the nine phase-point
// operators, U A(p) U^dagger = A(pi(p)). Then every Wigner function is carried point to point, with no
// mixing and no sign, which is a permutation of nine classical states. For odd dimension these are
// exactly the Clifford unitaries, and the induced pi is an affine map of Z_3^2 with determinant 1:
// a translation (a, b) and a matrix in SL(2, 3).
//
// Everything here is exact up to floating rounding on 3 x 3 matrices, with no random numbers.

import { Matrix3, multiply3 } from '@/code/dynamics/finite-gauge'

const OMEGA_RE = Math.cos((2 * Math.PI) / 3)
const OMEGA_IM = Math.sin((2 * Math.PI) / 3)

function omegaPower(k: number): [number, number] {
  const r = ((k % 3) + 3) % 3

  return [
    Math.cos((2 * Math.PI * r) / 3),
    Math.sin((2 * Math.PI * r) / 3),
  ]
}

function zero3(): Matrix3 {
  return new Float64Array(18)
}

export function dagger3(a: Matrix3): Matrix3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[2 * (3 * i + j)] = a[2 * (3 * j + i)] ?? 0
      out[2 * (3 * i + j) + 1] = -(a[2 * (3 * j + i) + 1] ?? 0)
    }
  }

  return out
}

// The displacement operator D(a, b) = omega^(2ab) X^a Z^b.
export function displacement(a: number, b: number): Matrix3 {
  const out = zero3()
  const [pr, pi] = omegaPower(2 * a * b)

  for (let j = 0; j < 3; j++) {
    // X^a Z^b |j> = omega^(b j) |j + a>
    const [zr, zi] = omegaPower(b * j)
    const row = (j + a) % 3

    out[2 * (3 * row + j)] = pr * zr - pi * zi
    out[2 * (3 * row + j) + 1] = pr * zi + pi * zr
  }

  return out
}

// The phase-point operator A(a, b) = D(a, b) P D(a, b)^dagger.
export function phasePoint(a: number, b: number): Matrix3 {
  const parity = zero3()

  for (let j = 0; j < 3; j++) {
    parity[2 * (3 * ((3 - j) % 3) + j)] = 1
  }

  const d = displacement(a, b)

  return multiply3(multiply3(d, parity), dagger3(d))
}

export const PHASE_POINTS: readonly [number, number][] = [
  0, 1, 2,
].flatMap(a => [0, 1, 2].map(b => [a, b] as [number, number]))

function distance(a: Matrix3, b: Matrix3): number {
  let sum = 0

  for (let k = 0; k < 18; k++) {
    sum += ((a[k] ?? 0) - (b[k] ?? 0)) ** 2
  }

  return Math.sqrt(sum)
}

// The permutation of the nine phase points a unitary induces by conjugation, or undefined when some
// A(p) is not carried to another A(q), i.e. the unitary is not classical on phase space.
export function phaseSpaceAction(input: {
  unitary: Matrix3
  tolerance?: number
}): number[] | undefined {
  const { unitary, tolerance = 1e-8 } = input
  const adjoint = dagger3(unitary)
  const points = PHASE_POINTS.map(([a, b]) => phasePoint(a, b))
  const map: number[] = []

  for (const point of points) {
    const image = multiply3(multiply3(unitary, point), adjoint)
    const found = points.findIndex(
      candidate => distance(candidate, image) < tolerance,
    )

    if (found < 0) {
      return undefined
    }

    map.push(found)
  }

  return new Set(map).size === 9 ? map : undefined
}

// The affine map p -> M p + t that a phase-space permutation is, read from the images of the origin
// and the two unit vectors, or undefined when the permutation is not affine.
export function affineOf(input: { map: readonly number[] }):
  | {
      matrix: [number, number, number, number]
      shift: [number, number]
    }
  | undefined {
  const { map } = input
  const at = (index: number): [number, number] =>
    PHASE_POINTS[map[index] ?? 0] ?? [0, 0]
  const indexOf = (a: number, b: number): number =>
    3 * (((a % 3) + 3) % 3) + (((b % 3) + 3) % 3)
  const shift = at(indexOf(0, 0))
  const e1 = at(indexOf(1, 0))
  const e2 = at(indexOf(0, 1))
  const matrix: [number, number, number, number] = [
    (e1[0] - shift[0] + 3) % 3,
    (e2[0] - shift[0] + 3) % 3,
    (e1[1] - shift[1] + 3) % 3,
    (e2[1] - shift[1] + 3) % 3,
  ]

  for (const [a, b] of PHASE_POINTS) {
    const image = at(indexOf(a, b))
    const predicted: [number, number] = [
      (matrix[0] * a + matrix[1] * b + shift[0]) % 3,
      (matrix[2] * a + matrix[3] * b + shift[1]) % 3,
    ]

    if (image[0] !== predicted[0] || image[1] !== predicted[1]) {
      return undefined
    }
  }

  return { matrix, shift }
}

// The Wigner function of a pure state |psi>, W(a, b) = <psi|A(a, b)|psi> / 3.
export function wignerFunction(input: {
  re: readonly number[]
  im: readonly number[]
}): number[] {
  const { re, im } = input

  return PHASE_POINTS.map(([a, b]) => {
    const point = phasePoint(a, b)

    let sum = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const ar = point[2 * (3 * i + j)] ?? 0
        const ai = point[2 * (3 * i + j) + 1] ?? 0
        // conj(psi_i) A_ij psi_j, real part
        const xr =
          (re[i] ?? 0) * (re[j] ?? 0) + (im[i] ?? 0) * (im[j] ?? 0)
        const xi =
          (re[i] ?? 0) * (im[j] ?? 0) - (im[i] ?? 0) * (re[j] ?? 0)

        sum += ar * xr - ai * xi
      }
    }

    return sum / 3
  })
}

// Apply a 3 x 3 unitary to a state.
export function applyUnitary(input: {
  unitary: Matrix3
  re: readonly number[]
  im: readonly number[]
}): {
  re: number[]
  im: number[]
} {
  const { unitary, re, im } = input
  const outRe = [0, 0, 0]
  const outIm = [0, 0, 0]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ur = unitary[2 * (3 * i + j)] ?? 0
      const ui = unitary[2 * (3 * i + j) + 1] ?? 0

      outRe[i] = (outRe[i] ?? 0) + ur * (re[j] ?? 0) - ui * (im[j] ?? 0)
      outIm[i] = (outIm[i] ?? 0) + ur * (im[j] ?? 0) + ui * (re[j] ?? 0)
    }
  }

  return { re: outRe, im: outIm }
}

// The Wigner negativity, the sum of |W| over the points where W < 0: zero for a classical state.
export function wignerNegativity(wigner: readonly number[]): number {
  return wigner.reduce(
    (sum, value) => sum + (value < 0 ? -value : 0),
    0,
  )
}

export const OMEGA: readonly [number, number] = [OMEGA_RE, OMEGA_IM]
