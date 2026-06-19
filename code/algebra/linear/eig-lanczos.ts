// Lanczos iteration for the low spectrum of a large symmetric operator. Used by
// the discrete Laplacian and the Kahler-Dirac operator (P4). Builds a small
// tridiagonal and diagonalises it with the Jacobi solver.

import { LinearOperator } from '@/code/algebra/linear/sparse'
import { makeDense, denseSet } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s
}

function axpy(
  y: Float64Array,
  input: { alpha: number; x: Float64Array },
): void {
  for (let i = 0; i < y.length; i++) {
    y[i] = (y[i] ?? 0) + input.alpha * (input.x[i] ?? 0)
  }
}

// A small deterministic PRNG (mulberry32) for the Lanczos start vector. Using a
// fixed-seed generator instead of Math.random makes the spectrum reproducible run
// to run (a fully constant start vector is unsafe: all-ones is exactly the
// Laplacian null eigenvector). Callers may still pass their own rng.
function deterministicRand(): () => number {
  let a = 0x9e3779b9 >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Lowest `count` eigenvalues (ascending). `steps` is the Krylov dimension.
export function lowestEigenvalues(input: {
  operator: LinearOperator
  count: number
  steps?: number
  rng?: () => number
}): Float64Array {
  const n = input.operator.size
  const m = Math.min(
    n,
    input.steps ?? Math.max(2 * input.count + 20, 40),
  )
  const rand = input.rng ?? deterministicRand()

  const basis: Float64Array[] = []
  let v = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    v[i] = rand() - 0.5
  }
  let norm = Math.sqrt(dot(v, v))
  for (let i = 0; i < n; i++) {
    v[i] = (v[i] ?? 0) / (norm || 1)
  }

  const alpha = new Float64Array(m)
  const beta = new Float64Array(m)
  let prev = new Float64Array(n)

  for (let j = 0; j < m; j++) {
    basis.push(v)
    const w = input.operator.apply({ x: v })
    const a = dot(w, v)
    alpha[j] = a
    axpy(w, { alpha: -a, x: v })
    if (j > 0) {
      axpy(w, { alpha: -(beta[j] ?? 0), x: prev })
    }
    // full reorthogonalisation against the stored basis (m is small)
    for (let k = 0; k < basis.length; k++) {
      const bk = basis[k]
      if (!bk) {
        continue
      }
      const proj = dot(w, bk)
      axpy(w, { alpha: -proj, x: bk })
    }
    const b = Math.sqrt(dot(w, w))
    if (j + 1 < m) {
      beta[j + 1] = b
    }
    if (b < 1e-12) {
      break
    }
    prev = v
    v = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      v[i] = (w[i] ?? 0) / b
    }
  }

  const t = makeDense({ rows: basis.length, cols: basis.length })
  for (let j = 0; j < basis.length; j++) {
    denseSet(t, { row: j, col: j, value: alpha[j] ?? 0 })
    if (j + 1 < basis.length) {
      const b = beta[j + 1] ?? 0
      denseSet(t, { row: j, col: j + 1, value: b })
      denseSet(t, { row: j + 1, col: j, value: b })
    }
  }
  const eig = eigSymmetric({ matrix: t })
  return eig.values.slice(0, Math.min(input.count, eig.values.length))
}
