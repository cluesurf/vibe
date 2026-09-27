// The Weil representation: the linear lift of a qudit's Clifford turns, for any odd prime p.
//
// The role grid of the model is the phase space Z_p^2 of one qudit (p = 3: the 3 x 3 grid, code/measure/
// qutrit-phase-space). Its turns SL(2, p) act on the grid by permuting points, and on the qudit's amplitudes
// only up to a phase: U D(v) U^dagger = D(M v) fixes U up to a scalar. A LIFT picks the scalars so that the
// unitaries multiply exactly as the matrices do, a genuine (linear) representation of SL(2, p). This module
// finds every lift by exhaustive search, with nothing assumed about which one exists:
//
//   the generators S = [[0, -1], [1, 0]] (order 4) and T = [[1, 1], [0, 1]] (order p) are carried, up to a
//   phase, by the discrete Fourier transform F and the chirp D = diag(omega^(h x^2)), h = 1/2 mod p. A lift
//   of S must have fourth power I and a lift of T p-th power I, so their phases a and b range over the 4th
//   and the p-th roots of unity (F^4 = I, D^p = I). Each of the 4p pairs (a F, b D) is closed into a matrix
//   group, and the pair is a lift exactly when the group has p (p^2 - 1) elements and projects one to one
//   onto SL(2, p) (then its inverse is a homomorphism). Any other phase choice generates a larger group,
//   carrying extra scalars, and is refused.
//
// Once a lift is in hand, the image of the central turn -I is read off: it is the unique element whose
// action on the grid is x -> -x. The parity P |x> = |-x> has that action, so the image is c P for a scalar c,
// and c is what the experiments measure. Because -I lies in the commutator subgroup of SL(2, p), c is the same
// for every lift.
//
// Everything is exact up to floating rounding on p x p matrices. Nothing here is random.

import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'

export type GridMatrix = readonly [number, number, number, number]

// the one element of the lifted group together with the grid matrix it acts by
export type LiftedElement = { readonly unitary: ComplexMatrix; readonly grid: GridMatrix }

export type WeilLift = {
  readonly p: number
  // the phases chosen for F and D, as angles in units of 2 pi
  readonly phaseOfF: number
  readonly phaseOfD: number
  readonly elements: readonly LiftedElement[]
}

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// e^(2 pi i t)
export function unitPhase(t: number): [number, number] {
  return [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t)]
}

export function scaleMatrix(a: ComplexMatrix, s: readonly [number, number]): ComplexMatrix {
  const re = new Float64Array(a.re.length)
  const im = new Float64Array(a.im.length)

  for (let i = 0; i < re.length; i++) {
    re[i] = (a.re[i] ?? 0) * s[0] - (a.im[i] ?? 0) * s[1]
    im[i] = (a.re[i] ?? 0) * s[1] + (a.im[i] ?? 0) * s[0]
  }

  return { re, im, n: a.n }
}

export function daggerMatrix(a: ComplexMatrix): ComplexMatrix {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      re[i * n + j] = a.re[j * n + i] ?? 0
      im[i * n + j] = -(a.im[j * n + i] ?? 0)
    }
  }

  return { re, im, n }
}

export function conjugateMatrix(a: ComplexMatrix): ComplexMatrix {
  return { re: Float64Array.from(a.re), im: Float64Array.from(a.im, x => -x), n: a.n }
}

// the Frobenius distance between two matrices
export function matrixDistance(a: ComplexMatrix, b: ComplexMatrix): number {
  let sum = 0

  for (let i = 0; i < a.re.length; i++) {
    sum += ((a.re[i] ?? 0) - (b.re[i] ?? 0)) ** 2 + ((a.im[i] ?? 0) - (b.im[i] ?? 0)) ** 2
  }

  return Math.sqrt(sum)
}

export function traceOf(a: ComplexMatrix): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < a.n; i++) {
    re += a.re[i * a.n + i] ?? 0
    im += a.im[i * a.n + i] ?? 0
  }

  return [re, im]
}

// the Kronecker product a (x) b
export function kronecker(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const n = a.n * b.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      const xr = a.re[i * a.n + j] ?? 0
      const xi = a.im[i * a.n + j] ?? 0

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let k = 0; k < b.n; k++) {
        for (let l = 0; l < b.n; l++) {
          const yr = b.re[k * b.n + l] ?? 0
          const yi = b.im[k * b.n + l] ?? 0
          const at = (i * b.n + k) * n + (j * b.n + l)

          re[at] = xr * yr - xi * yi
          im[at] = xr * yi + xi * yr
        }
      }
    }
  }

  return { re, im, n }
}

// the unitary discrete Fourier transform F_(x y) = omega^(x y) / sqrt p
export function fourierMatrix(p: number): ComplexMatrix {
  const re = new Float64Array(p * p)
  const im = new Float64Array(p * p)

  for (let x = 0; x < p; x++) {
    for (let y = 0; y < p; y++) {
      const [c, s] = unitPhase(modulo(x * y, p) / p)

      re[x * p + y] = c / Math.sqrt(p)
      im[x * p + y] = s / Math.sqrt(p)
    }
  }

  return { re, im, n: p }
}

// the chirp D = diag(omega^(h x^2)), h = (p + 1) / 2 the inverse of 2 mod p
export function chirpMatrix(p: number): ComplexMatrix {
  const h = (p + 1) / 2
  const re = new Float64Array(p * p)
  const im = new Float64Array(p * p)

  for (let x = 0; x < p; x++) {
    const [c, s] = unitPhase(modulo(h * x * x, p) / p)

    re[x * p + x] = c
    im[x * p + x] = s
  }

  return { re, im, n: p }
}

// the parity P |x> = |-x>
export function parityMatrix(p: number): ComplexMatrix {
  const re = new Float64Array(p * p)

  for (let x = 0; x < p; x++) {
    re[modulo(-x, p) * p + x] = 1
  }

  return { re, im: new Float64Array(p * p), n: p }
}

// the displacement D(a, b) = omega^(h a b) X^a Z^b, X |x> = |x + 1>, Z |x> = omega^x |x>; for p = 3 this is
// code/measure/qutrit-phase-space's displacement exactly (h = 2)
export function displacementMatrix(p: number, a: number, b: number): ComplexMatrix {
  const h = (p + 1) / 2
  const re = new Float64Array(p * p)
  const im = new Float64Array(p * p)

  for (let x = 0; x < p; x++) {
    const [c, s] = unitPhase(modulo(h * a * b + b * x, p) / p)
    const row = modulo(x + a, p)

    re[row * p + x] = c
    im[row * p + x] = s
  }

  return { re, im, n: p }
}

// the phase-point operator A(a, b) = D(a, b) P D(a, b)^dagger, whose expectation over 3 (over p) is the
// discrete Wigner weight at (a, b)
export function phasePointMatrix(p: number, a: number, b: number): ComplexMatrix {
  const d = displacementMatrix(p, a, b)

  return complexMultiply(complexMultiply(d, parityMatrix(p)), daggerMatrix(d))
}

// The grid matrix M with U D(v) U^dagger proportional to D(M v), read from the images of the two unit
// vectors, or undefined when U does not carry displacements to displacements.
export function gridActionOf(u: ComplexMatrix, p: number): GridMatrix | undefined {
  const adjoint = daggerMatrix(u)
  const image = (a: number, b: number): [number, number] | undefined => {
    const moved = complexMultiply(complexMultiply(u, displacementMatrix(p, a, b)), adjoint)
    // D(c, d) holds one entry per column, at row x + c, and column x's entry is omega^(d x) times column 0's:
    // read c from column 0's nonzero row and d from the phase between columns 1 and 0, then confirm that
    // moved is exactly that phase times D(c, d)
    let c = -1

    for (let r = 0; r < p; r++) {
      if (Math.hypot(moved.re[r * p] ?? 0, moved.im[r * p] ?? 0) > 0.5) {
        c = r
      }
    }

    if (c < 0) {
      return undefined
    }

    const r1 = modulo(1 + c, p)
    const z0: [number, number] = [moved.re[c * p] ?? 0, moved.im[c * p] ?? 0]
    const z1: [number, number] = [moved.re[r1 * p + 1] ?? 0, moved.im[r1 * p + 1] ?? 0]
    // z1 / z0 = omega^d
    const angle = Math.atan2(z1[1] * z0[0] - z1[0] * z0[1], z1[0] * z0[0] + z1[1] * z0[1])
    const d = modulo(Math.round((angle / (2 * Math.PI)) * p), p)
    const reference = displacementMatrix(p, c, d)
    const phase: [number, number] = [
      z0[0] * (reference.re[c * p] ?? 0) + z0[1] * (reference.im[c * p] ?? 0),
      z0[1] * (reference.re[c * p] ?? 0) - z0[0] * (reference.im[c * p] ?? 0),
    ]

    return matrixDistance(moved, scaleMatrix(reference, phase)) < 1e-8 ? [c, d] : undefined
  }
  const e1 = image(1, 0)
  const e2 = image(0, 1)

  if (!e1 || !e2) {
    return undefined
  }

  return [e1[0], e2[0], e1[1], e2[1]]
}

export function multiplyGrid(p: number, m: GridMatrix, n: GridMatrix): GridMatrix {
  return [modulo(m[0] * n[0] + m[1] * n[2], p), modulo(m[0] * n[1] + m[1] * n[3], p), modulo(m[2] * n[0] + m[3] * n[2], p), modulo(m[2] * n[1] + m[3] * n[3], p)]
}

export function gridOrder(p: number, m: GridMatrix): number {
  let power = m
  let n = 1

  while (!(power[0] === 1 && power[1] === 0 && power[2] === 0 && power[3] === 1)) {
    power = multiplyGrid(p, power, m)
    n++
  }

  return n
}

const matrixKey = (a: ComplexMatrix): string => {
  const out: string[] = []

  for (let i = 0; i < a.re.length; i++) {
    out.push((Math.round((a.re[i] ?? 0) * 1e6) / 1e6 + 0).toFixed(6), (Math.round((a.im[i] ?? 0) * 1e6) / 1e6 + 0).toFixed(6))
  }

  return out.join(',')
}

// The closure of a set of unitaries under multiplication, stopping (and returning undefined) once it has
// more than `limit` elements.
export function closeGroup(generators: readonly ComplexMatrix[], limit: number): ComplexMatrix[] | undefined {
  const n = generators[0]?.n ?? 1
  const identity = complexIdentity(n)
  const seen = new Map<string, ComplexMatrix>([[matrixKey(identity), identity]])
  let frontier = [identity]

  while (frontier.length > 0) {
    const next: ComplexMatrix[] = []

    for (const g of frontier) {
      for (const h of generators) {
        const product = complexMultiply(g, h)
        const key = matrixKey(product)

        if (!seen.has(key)) {
          seen.set(key, product)
          next.push(product)

          if (seen.size > limit) {
            return undefined
          }
        }
      }
    }

    frontier = next
  }

  return [...seen.values()]
}

// Every linear lift of SL(2, p)'s Clifford action, by the search in the header.
export function weilLifts(p: number): WeilLift[] {
  const order = p * (p * p - 1)
  const f = fourierMatrix(p)
  const d = chirpMatrix(p)
  const lifts: WeilLift[] = []

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < p; b++) {
      const group = closeGroup([scaleMatrix(f, unitPhase(a / 4)), scaleMatrix(d, unitPhase(b / p))], order)

      if (!group || group.length !== order) {
        continue
      }

      const elements = group.map(unitary => ({ unitary, grid: gridActionOf(unitary, p) }))

      if (elements.some(e => e.grid === undefined)) {
        continue
      }

      const grids = new Set(elements.map(e => (e.grid ?? []).join(',')))

      if (grids.size !== order) {
        continue
      }

      lifts.push({ p, phaseOfF: a / 4, phaseOfD: b / p, elements: elements as LiftedElement[] })
    }
  }

  return lifts
}

// the lifted element acting on the grid by m
export function liftOf(lift: WeilLift, m: GridMatrix): ComplexMatrix | undefined {
  return lift.elements.find(e => e.grid.every((x, k) => x === m[k]))?.unitary
}

// The scalar c with lift(-I) = c P, or undefined when the image is not a multiple of the parity.
export function centralScalar(lift: WeilLift): [number, number] | undefined {
  const p = lift.p
  const minusOne: GridMatrix = [p - 1, 0, 0, p - 1]
  const image = liftOf(lift, minusOne)

  if (!image) {
    return undefined
  }

  // c = <0| image |0>, since P |0> = |0>; then check image = c P everywhere
  const c: [number, number] = [image.re[0] ?? 0, image.im[0] ?? 0]

  return matrixDistance(image, scaleMatrix(parityMatrix(p), c)) < 1e-9 ? c : undefined
}

// the Legendre symbol (a / p) for an odd prime p, by Euler's criterion
export function legendre(a: number, p: number): number {
  let result = 1
  let base = modulo(a, p)
  let exponent = (p - 1) / 2

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % p
    }

    base = (base * base) % p
    exponent = Math.floor(exponent / 2)
  }

  return result === 1 ? 1 : result === 0 ? 0 : -1
}
