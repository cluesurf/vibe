// Complex Hermitian eigendecomposition and the Hermitian matrix sign.
//
// The eigensolver embeds the n-by-n Hermitian H = A + iB (A real symmetric, B real antisymmetric) as the
// 2n-by-2n real symmetric M = [[A, -B], [B, A]] and diagonalizes M with the real Jacobi solver. A complex
// eigenvector v = u + i w of H appears in M twice, as (u; w) and as (-w; u), which is i v. So every complex
// eigenvalue of multiplicity k is a real eigenvalue of M with multiplicity 2k, and its 2k real eigenvectors
// span the realification of the k-dimensional complex eigenspace.
//
// E-FRC-0178: the earlier version kept every second real column. For a simple eigenvalue that is right,
// since both columns are the same complex line. Inside a degenerate eigenspace the kept columns are
// real-orthogonal but need not be complex-orthogonal, and in the extreme two of them are one complex vector
// and its i-multiple, so the returned vectors were not orthonormal and could fail to span the eigenspace
// (E-MTH-0011: 26 of 37 degenerate test matrices, 10 of them missing a direction). Anything built from them,
// the matrix sign above all, was wrong while every eigenvalue was right. Now:
//
//   1. The 2n real eigenvalues (ascending) are split into clusters wherever two neighbors differ by more
//      than CLUSTER_TOLERANCE * max(1, max |lambda|). An exact k-fold complex eigenvalue is one cluster of
//      2k. A cluster of odd size, which only a Jacobi error above the tolerance could make, is merged with
//      its successor so each cluster holds whole complex dimensions.
//   2. A cluster of 2 (a simple eigenvalue) keeps its first real column unchanged, bit for bit as before.
//   3. A cluster of 2k > 2 turns all 2k real columns into complex vectors and runs complex Gram-Schmidt with
//      pivoting: each step takes the remaining candidate with the largest residual, whose squared norm is at
//      least 1 / k of the unit budget (the residual projector has real trace 2(k - j) over 2k orthonormal
//      columns), normalizes it, and orthogonalizes it a second time against the cluster ("twice is enough").
//      The k vectors are orthonormal and span the cluster's eigenspace. Values keep the Jacobi order,
//      entry 2i of the real spectrum for complex index i.
//
// Two eigenvalues closer than the tolerance but not equal land in one cluster, and its vectors span the sum
// of their eigenspaces: each vector then is an eigenvector to within the tolerance times the matrix scale.
//
// The matrix sign does not use eigenvectors at all. hermitianMatrixSign runs the scaled Newton iteration
// X <- (mu X + (mu X)^-1) / 2 from X = H (Higham, Functions of Matrices, section 5.3), with the Frobenius
// scaling mu = sqrt(|X^-1| / |X|) until the step falls below NEWTON_SCALING_OFF, then unscaled, then two
// inverse-free Newton-Schulz steps X <- X (3 I - X^2) / 2, each followed by Hermitian symmetrization. Newton
// converges globally for a nonsingular Hermitian H and is blind to degeneracy, the standard way the overlap
// operator's sign function is computed in lattice QCD. A singular H has no sign and the iteration throws.
// hermitianMatrixSignEigen is the eigenvector route, kept only as a cross-check (it maps an exact zero
// eigenvalue to 0).

import {
  ComplexMatrix,
  makeComplexMatrix,
  makeDense,
} from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { complexInverse } from '@/code/algebra/linear/complex-matrix'

export const CLUSTER_TOLERANCE = 1e-10
export const NEWTON_MAX_ITERATIONS = 100
export const NEWTON_SCALING_OFF = 1e-2
export const NEWTON_CONVERGED = 1e-10
export const NEWTON_SCHULZ_STEPS = 2

export type HermitianEigen = {
  readonly values: Float64Array // n, ascending
  readonly vectorsRe: Float64Array // n*n, [a*n + i] = Re component a of eigvec i
  readonly vectorsIm: Float64Array
}

export function eigHermitian(input: {
  matrix: ComplexMatrix
}): HermitianEigen {
  const n = input.matrix.rows
  const twoN = 2 * n
  const m = makeDense({ rows: twoN, cols: twoN })

  const set = (r: number, c: number, x: number): void => {
    m.data[r * twoN + c] = x
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = input.matrix.re[i * n + j] ?? 0
      const b = input.matrix.im[i * n + j] ?? 0

      set(i, j, a) // top-left A
      set(n + i, n + j, a) // bottom-right A
      set(i, n + j, -b) // top-right -B
      set(n + i, j, b) // bottom-left B
    }
  }

  const eig = eigSymmetric({ matrix: m })
  const values = new Float64Array(n)
  const vectorsRe = new Float64Array(n * n)
  const vectorsIm = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    values[i] = eig.values[2 * i] ?? 0
  }

  for (const [start, end] of clusters(eig.values)) {
    const size = end - start
    const first = start / 2

    if (size === 2) {
      // a simple eigenvalue: either real column is the eigenvector, keep the first unchanged
      for (let a = 0; a < n; a++) {
        vectorsRe[a * n + first] = eig.vectors[a * twoN + start] ?? 0
        vectorsIm[a * n + first] = eig.vectors[(n + a) * twoN + start] ?? 0
      }

      continue
    }

    const basis = spanCluster({ vectors: eig.vectors, n, start, end })

    basis.forEach((v, j) => {
      for (let a = 0; a < n; a++) {
        vectorsRe[a * n + first + j] = v.re[a] ?? 0
        vectorsIm[a * n + first + j] = v.im[a] ?? 0
      }
    })
  }

  return { values, vectorsRe, vectorsIm }
}

// [start, end) ranges of the ascending real spectrum, split at gaps above the tolerance, each of even size
function clusters(values: Float64Array): [number, number][] {
  const scale = Math.max(1, ...Array.from(values, v => Math.abs(v)))
  const gap = CLUSTER_TOLERANCE * scale
  const out: [number, number][] = []

  let start = 0

  for (let i = 1; i <= values.length; i++) {
    const split = i === values.length || (values[i] ?? 0) - (values[i - 1] ?? 0) > gap

    if (split && (i - start) % 2 === 0) {
      out.push([start, i])
      start = i
    }
  }

  return out
}

type ComplexVector = { re: Float64Array; im: Float64Array }

// Pivoted complex Gram-Schmidt over the real columns [start, end) of the embedding, (end - start) / 2 vectors
function spanCluster(input: {
  vectors: Float64Array
  n: number
  start: number
  end: number
}): ComplexVector[] {
  const { vectors, n, start, end } = input
  const twoN = 2 * n
  const k = (end - start) / 2
  const candidates: ComplexVector[] = []

  for (let col = start; col < end; col++) {
    candidates.push({
      re: Float64Array.from({ length: n }, (_, a) => vectors[a * twoN + col] ?? 0),
      im: Float64Array.from({ length: n }, (_, a) => vectors[(n + a) * twoN + col] ?? 0),
    })
  }

  const basis: ComplexVector[] = []
  const used = new Array<boolean>(candidates.length).fill(false)

  for (let j = 0; j < k; j++) {
    let best = -1
    let bestNorm = -1

    candidates.forEach((c, index) => {
      if (used[index]) {
        return
      }

      const norm = vectorNorm(c)

      if (norm > bestNorm) {
        best = index
        bestNorm = norm
      }
    })

    used[best] = true

    const q = candidates[best]!

    scaleVector(q, 1 / bestNorm)

    // second pass against the cluster's basis, then renormalize
    for (const b of basis) {
      project(q, b)
    }

    scaleVector(q, 1 / vectorNorm(q))
    basis.push(q)

    // remove q from every remaining candidate (modified Gram-Schmidt)
    candidates.forEach((c, index) => {
      if (!used[index]) {
        project(c, q)
      }
    })
  }

  return basis
}

function vectorNorm(v: ComplexVector): number {
  let s = 0

  for (let a = 0; a < v.re.length; a++) {
    s += (v.re[a] ?? 0) ** 2 + (v.im[a] ?? 0) ** 2
  }

  return Math.sqrt(s)
}

function scaleVector(v: ComplexVector, factor: number): void {
  for (let a = 0; a < v.re.length; a++) {
    v.re[a] = (v.re[a] ?? 0) * factor
    v.im[a] = (v.im[a] ?? 0) * factor
  }
}

// z <- z - q (q^dagger z), q unit
function project(z: ComplexVector, q: ComplexVector): void {
  let cr = 0
  let ci = 0

  for (let a = 0; a < z.re.length; a++) {
    const qr = q.re[a] ?? 0
    const qi = q.im[a] ?? 0
    const zr = z.re[a] ?? 0
    const zi = z.im[a] ?? 0

    cr += qr * zr + qi * zi
    ci += qr * zi - qi * zr
  }

  for (let a = 0; a < z.re.length; a++) {
    const qr = q.re[a] ?? 0
    const qi = q.im[a] ?? 0

    z.re[a] = (z.re[a] ?? 0) - (cr * qr - ci * qi)
    z.im[a] = (z.im[a] ?? 0) - (cr * qi + ci * qr)
  }
}

export type NewtonSign = {
  readonly sign: ComplexMatrix
  readonly iterations: number
  // max |S^2 - I| entry after the last step
  readonly residual: number
}

// sign(H) by scaled Newton, then Newton-Schulz polish. Throws for a singular or non-converging H.
export function hermitianMatrixSignNewton(input: {
  matrix: ComplexMatrix
}): NewtonSign {
  const n = input.matrix.rows
  let x = { re: Float64Array.from(input.matrix.re), im: Float64Array.from(input.matrix.im), n }
  let scaling = true
  let iterations = 0

  for (;;) {
    if (iterations >= NEWTON_MAX_ITERATIONS) {
      throw new Error('hermitianMatrixSignNewton: no convergence, the matrix is singular to working precision')
    }

    const y = complexInverse(x)
    const mu = scaling ? Math.sqrt(frobenius(y) / frobenius(x)) : 1
    const next = { re: new Float64Array(n * n), im: new Float64Array(n * n), n }

    for (let i = 0; i < n * n; i++) {
      next.re[i] = 0.5 * (mu * (x.re[i] ?? 0) + (y.re[i] ?? 0) / mu)
      next.im[i] = 0.5 * (mu * (x.im[i] ?? 0) + (y.im[i] ?? 0) / mu)
    }

    hermitize(next)

    let change = 0

    for (let i = 0; i < n * n; i++) {
      change += ((next.re[i] ?? 0) - (x.re[i] ?? 0)) ** 2 + ((next.im[i] ?? 0) - (x.im[i] ?? 0)) ** 2
    }

    const relative = Math.sqrt(change) / frobenius(next)

    x = next
    iterations++

    if (relative < NEWTON_SCALING_OFF) {
      scaling = false
    }

    if (relative < NEWTON_CONVERGED) {
      break
    }
  }

  for (let step = 0; step < NEWTON_SCHULZ_STEPS; step++) {
    // X <- X (3 I - X^2) / 2
    const x2 = multiply(x, x)

    for (let i = 0; i < n; i++) {
      x2.re[i * n + i] = (x2.re[i * n + i] ?? 0) - 3
    }

    const p = multiply(x, x2)

    for (let i = 0; i < n * n; i++) {
      p.re[i] = -0.5 * (p.re[i] ?? 0)
      p.im[i] = -0.5 * (p.im[i] ?? 0)
    }

    hermitize(p)
    x = p
  }

  const square = multiply(x, x)

  let residual = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      residual = Math.max(residual, Math.hypot((square.re[i * n + j] ?? 0) - (i === j ? 1 : 0), square.im[i * n + j] ?? 0))
    }
  }

  const sign = makeComplexMatrix({ rows: n, cols: n })

  sign.re.set(x.re)
  sign.im.set(x.im)

  return { sign, iterations, residual }
}

type Square = { re: Float64Array; im: Float64Array; n: number }

function frobenius(a: Square): number {
  let s = 0

  for (let i = 0; i < a.re.length; i++) {
    s += (a.re[i] ?? 0) ** 2 + (a.im[i] ?? 0) ** 2
  }

  return Math.sqrt(s)
}

// A <- (A + A^dagger) / 2
function hermitize(a: Square): void {
  const n = a.n

  for (let i = 0; i < n; i++) {
    a.im[i * n + i] = 0

    for (let j = i + 1; j < n; j++) {
      const re = 0.5 * ((a.re[i * n + j] ?? 0) + (a.re[j * n + i] ?? 0))
      const im = 0.5 * ((a.im[i * n + j] ?? 0) - (a.im[j * n + i] ?? 0))

      a.re[i * n + j] = re
      a.re[j * n + i] = re
      a.im[i * n + j] = im
      a.im[j * n + i] = -im
    }
  }
}

function multiply(a: Square, b: Square): Square {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const xr = a.re[i * n + k] ?? 0
      const xi = a.im[i * n + k] ?? 0

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const yr = b.re[k * n + j] ?? 0
        const yi = b.im[k * n + j] ?? 0

        re[i * n + j] = (re[i * n + j] ?? 0) + xr * yr - xi * yi
        im[i * n + j] = (im[i * n + j] ?? 0) + xr * yi + xi * yr
      }
    }
  }

  return { re, im, n }
}

// The matrix sign of a nonsingular Hermitian matrix, by Newton iteration (no eigenvectors).
export function hermitianMatrixSign(input: {
  matrix: ComplexMatrix
}): ComplexMatrix {
  return hermitianMatrixSignNewton(input).sign
}

// The cross-check: sum_i sign(lambda_i) |v_i><v_i| over the eigendecomposition, sign(0) = 0.
export function hermitianMatrixSignEigen(input: {
  matrix: ComplexMatrix
}): ComplexMatrix {
  const n = input.matrix.rows
  const eig = eigHermitian({ matrix: input.matrix })
  const out = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    const lambda = eig.values[i] ?? 0
    const s = lambda > 0 ? 1 : lambda < 0 ? -1 : 0

    if (s === 0) {
      continue
    }

    for (let a = 0; a < n; a++) {
      const va = eig.vectorsRe[a * n + i] ?? 0
      const vaIm = eig.vectorsIm[a * n + i] ?? 0

      for (let b = 0; b < n; b++) {
        const vb = eig.vectorsRe[b * n + i] ?? 0
        const vbIm = eig.vectorsIm[b * n + i] ?? 0
        // |v><v|_{ab} = v_a * conj(v_b)
        const re = va * vb + vaIm * vbIm
        const im = vaIm * vb - va * vbIm

        out.re[a * n + b] = (out.re[a * n + b] ?? 0) + s * re
        out.im[a * n + b] = (out.im[a * n + b] ?? 0) + s * im
      }
    }
  }

  return out
}

// Count eigenvalues of a Hermitian matrix below a tolerance (the near-zero modes).
export function countNearZeroEigenvalues(input: {
  matrix: ComplexMatrix
  tolerance: number
}): number {
  const eig = eigHermitian({ matrix: input.matrix })

  let count = 0

  for (const value of eig.values) {
    if (Math.abs(value ?? 0) < input.tolerance) {
      count += 1
    }
  }

  return count
}
