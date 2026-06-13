// The signature of the Coxeter Gram matrix for a linear Schlafli symbol, the count of negative and
// zero eigenvalues. This is the geometry test: a spherical (finite) honeycomb has a positive-definite
// Gram matrix (no negative, no zero), a Euclidean one is positive-semidefinite (a zero eigenvalue),
// and a hyperbolic one is Lorentzian (exactly one negative eigenvalue). Uses the Jacobi symmetric
// eigensolver (code/algebra/linear/eig-jacobi) for the tiny rank-by-rank matrix.

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import type { DenseMatrix } from '@/code/algebra/linear/dense'

export function gramSignature(symbol: number[]): { negative: number; zero: number } {
  const size = symbol.length + 1
  const data = new Float64Array(size * size)
  for (let index = 0; index < size; index++) data[index * size + index] = 1
  for (let edge = 0; edge < symbol.length; edge++) {
    const value = -Math.cos(Math.PI / symbol[edge]!)
    data[edge * size + (edge + 1)] = value
    data[(edge + 1) * size + edge] = value
  }
  const matrix: DenseMatrix = { form: 'dense', rows: size, cols: size, data }
  const values = Array.from(eigSymmetric({ matrix }).values)
  return { negative: values.filter((value) => value < -1e-9).length, zero: values.filter((value) => Math.abs(value) < 1e-9).length }
}
