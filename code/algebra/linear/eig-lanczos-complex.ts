// Lanczos iteration for the low spectrum of a large HERMITIAN operator given only
// as a matrix-free apply (no stored matrix), with complex state. Two routines:
// largestEigenvalueOfSquare (power iteration on H^2, for a spectral fold constant)
// and lowestAbsoluteEigenvalues (the eigenvalues of H nearest zero, found by
// running Lanczos on the FOLDED operator C*I - H^2 whose LARGEST eigenvalues are the
// SMALLEST of H^2, hence the |lambda| of H nearest zero). The operator acts on
// complex vectors carried as parallel real/imag Float64Arrays. Used for Dirac
// zero-mode / bound-state spectra on soliton backgrounds.

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { makeDense } from '@/code/algebra/linear/dense'

export type ComplexVector = {
  re: Float64Array
  im: Float64Array
}

export type HermitianApply = (
  input: ComplexVector,
  output: ComplexVector,
) => void

function realDot(
  a: ComplexVector,
  b: ComplexVector,
  dimension: number,
): number {
  let s = 0

  for (let i = 0; i < dimension; i++) {
    s += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
  }

  return s
}

function newVector(dimension: number): ComplexVector {
  return {
    re: new Float64Array(dimension),
    im: new Float64Array(dimension),
  }
}

// Largest eigenvalue of H^2 by power iteration, the constant used to fold the
// spectrum. `rand` fills the start vector (deterministic for reproducibility).
export function largestEigenvalueOfSquare(input: {
  apply: HermitianApply
  dimension: number
  iterations?: number
  rand: () => number
}): number {
  const { apply, dimension, rand } = input
  const iterations = input.iterations ?? 40
  const v = newVector(dimension)

  for (let i = 0; i < dimension; i++) {
    v.re[i] = rand() - 0.5
  }

  let norm = Math.sqrt(realDot(v, v, dimension))

  for (let i = 0; i < dimension; i++) {
    v.re[i]! /= norm
  }

  const t = newVector(dimension)
  const w = newVector(dimension)

  let lambda = 0

  for (let it = 0; it < iterations; it++) {
    apply(v, t)
    apply(t, w)
    lambda = realDot(v, w, dimension)
    norm = Math.sqrt(realDot(w, w, dimension))

    for (let i = 0; i < dimension; i++) {
      v.re[i] = w.re[i]! / norm
      v.im[i] = w.im[i]! / norm
    }
  }

  return lambda
}

// The `count` eigenvalues of H nearest zero (ascending |lambda|), via folded
// Lanczos on C*I - H^2 with full reorthogonalization. `fold` is C (typically just
// above the largest eigenvalue of H^2); `steps` is the Krylov dimension. `rand`
// fills the start vector.
export function lowestAbsoluteEigenvalues(input: {
  apply: HermitianApply
  dimension: number
  fold: number
  steps: number
  count?: number
  rand: () => number
}): number[] {
  const { apply, dimension, fold, steps, rand } = input
  const count = input.count ?? 8
  const basis: ComplexVector[] = []

  let v = newVector(dimension)

  for (let i = 0; i < dimension; i++) {
    v.re[i] = rand() - 0.5
  }

  const norm = Math.sqrt(realDot(v, v, dimension))

  for (let i = 0; i < dimension; i++) {
    v.re[i]! /= norm
  }

  const alpha: number[] = []
  const beta: number[] = []
  const t = newVector(dimension)
  const w = newVector(dimension)

  let vprev: ComplexVector | null = null
  let bprev = 0

  // the folded operator C*I - H^2
  const foldedApply = (x: ComplexVector, y: ComplexVector): void => {
    apply(x, t)
    apply(t, y)

    for (let i = 0; i < dimension; i++) {
      y.re[i] = fold * x.re[i]! - y.re[i]!
      y.im[i] = fold * x.im[i]! - y.im[i]!
    }
  }

  for (let j = 0; j < steps; j++) {
    basis.push({ re: v.re.slice(), im: v.im.slice() })
    foldedApply(v, w)

    if (vprev) {
      for (let i = 0; i < dimension; i++) {
        w.re[i]! -= bprev * vprev.re[i]!
        w.im[i]! -= bprev * vprev.im[i]!
      }
    }

    const aj = realDot(v, w, dimension)
    alpha.push(aj)

    for (let i = 0; i < dimension; i++) {
      w.re[i]! -= aj * v.re[i]!
      w.im[i]! -= aj * v.im[i]!
    }

    // full reorthogonalization against the whole basis
    for (const u of basis) {
      const d = realDot(u, w, dimension)

      for (let i = 0; i < dimension; i++) {
        w.re[i]! -= d * u.re[i]!
        w.im[i]! -= d * u.im[i]!
      }
    }

    const bj = Math.sqrt(realDot(w, w, dimension))

    if (bj < 1e-9 || j === steps - 1) {
      break
    }

    beta.push(bj)
    vprev = { re: v.re.slice(), im: v.im.slice() }
    bprev = bj
    v = newVector(dimension)

    for (let i = 0; i < dimension; i++) {
      v.re[i] = w.re[i]! / bj
      v.im[i] = w.im[i]! / bj
    }
  }

  const k = alpha.length
  const matrix = makeDense({ rows: k, cols: k })

  for (let i = 0; i < k; i++) {
    matrix.data[i * k + i] = alpha[i]!

    if (i + 1 < k) {
      matrix.data[i * k + (i + 1)] = beta[i]!
      matrix.data[(i + 1) * k + i] = beta[i]!
    }
  }

  const theta = Array.from(eigSymmetric({ matrix }).values).sort(
    (a, b) => b - a,
  ) // largest of (C - H^2) first

  // map back: H^2 eigenvalue = C - theta; |lambda| = sqrt(max(0, C - theta)); smallest first
  return theta
    .slice(0, count)
    .map(th => Math.sqrt(Math.max(0, fold - th)))
    .sort((a, b) => a - b)
}
