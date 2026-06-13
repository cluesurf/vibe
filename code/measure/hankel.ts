// The Osterwalder-Schrader / Kallen-Lehmann spectral-positivity test in its Hankel form. A
// correlation sequence C(0), C(1), ... is a positive spectral integral (C(r) = integral of
// e^{-m r} d-rho(m) with rho >= 0, real particle states of positive norm) if and only if its
// Hankel moment matrix H[i][j] = C(i + j) is positive semi-definite. The reflection-positivity
// experiments build this from a spatial two-point function (a particle spectrum) or a temporal
// beat-autocorrelation (a positive-energy generator) and read positivity off the minimum
// eigenvalue. A staggered variant absorbs pair anti-correlation (a band-edge particle).

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// The (m+1) x (m+1) Hankel matrix H[i][j] = sequence[i + j] of a correlation sequence. Requires
// the sequence to have at least 2*m + 1 entries.
export function hankelMatrix(input: {
  sequence: ReadonlyArray<number>
  size: number
}): number[][] {
  const { sequence, size } = input
  const h: number[][] = []
  for (let i = 0; i <= size; i++) {
    const row: number[] = []
    for (let j = 0; j <= size; j++) row.push(sequence[i + j] ?? 0)
    h.push(row)
  }
  return h
}

// The eigenvalues (ascending) of a symmetric matrix given as nested arrays, via the cyclic Jacobi
// solver.
export function symmetricEigenvalues(matrix: ReadonlyArray<ReadonlyArray<number>>): number[] {
  const n = matrix.length
  const dense = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) dense.data[i * n + j] = matrix[i]![j] ?? 0
  }
  return Array.from(eigSymmetric({ matrix: dense }).values)
}

// The minimum eigenvalue of a symmetric matrix given as nested arrays. PSD (the spectral-positivity
// condition) means this is non-negative within tolerance.
export function symmetricMinEigenvalue(matrix: ReadonlyArray<ReadonlyArray<number>>): number {
  const values = symmetricEigenvalues(matrix)
  let mn = Infinity
  for (const v of values) mn = Math.min(mn, v)
  return mn
}

// The normalized minimum Hankel eigenvalue of a correlation sequence: build H[i][j] = C(i + j)
// of order `size`, take its smallest eigenvalue, and divide by C(0). A value at or above
// (slightly negative) tolerance means the sequence passes the Hankel spectral-positivity test.
export function hankelMinEigenvalue(input: {
  sequence: ReadonlyArray<number>
  size: number
}): number {
  const h = hankelMatrix(input)
  return symmetricMinEigenvalue(h) / (input.sequence[0] ?? 1)
}
