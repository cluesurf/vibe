// The generalized symmetric eigenvalue problem A v = lambda B v, A symmetric and B symmetric positive
// definite, by Cholesky reduction: B = L L^T, then the ordinary eigenvalues of L^-1 A L^-T. The
// variational method of lattice spectroscopy (Michael 1985, Luscher and Wolff 1990) is this with
// A = C(t1) and B = C(t0) for a matrix of correlators between several operators: the largest
// eigenvalue is exp(-E0 (t1 - t0)) for the ground state, with the excited states projected out far
// better than any one operator can.

import { jacobiEigenvalues } from '@/code/algebra/linear/eig-jacobi'

export function generalizedEigenvalues(input: {
  a: readonly (readonly number[])[]
  b: readonly (readonly number[])[]
}): number[] {
  const { a, b } = input
  const n = b.length
  const lower = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let j = 0; j < n; j++) {
    let diagonal = b[j]?.[j] ?? 0

    for (let k = 0; k < j; k++) {
      diagonal -= (lower[j]?.[k] ?? 0) ** 2
    }

    if (!(diagonal > 0)) {
      return new Array<number>(n).fill(Number.NaN)
    }

    const pivot = Math.sqrt(diagonal)
    const row = lower[j]

    if (row !== undefined) {
      row[j] = pivot
    }

    for (let i = j + 1; i < n; i++) {
      let value = b[i]?.[j] ?? 0

      for (let k = 0; k < j; k++) {
        value -= (lower[i]?.[k] ?? 0) * (lower[j]?.[k] ?? 0)
      }

      const target = lower[i]

      if (target !== undefined) {
        target[j] = value / pivot
      }
    }
  }

  // inverse of the lower-triangular factor, by forward substitution
  const inverse = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let column = 0; column < n; column++) {
    for (let i = 0; i < n; i++) {
      let value = i === column ? 1 : 0

      for (let k = 0; k < i; k++) {
        value -= (lower[i]?.[k] ?? 0) * (inverse[k]?.[column] ?? 0)
      }

      const target = inverse[i]

      if (target !== undefined) {
        target[column] = value / (lower[i]?.[i] ?? 1)
      }
    }
  }

  // M = L^-1 A L^-T, symmetrized against rounding
  const reduced = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => {
      let total = 0

      for (let p = 0; p < n; p++) {
        for (let q = 0; q < n; q++) {
          total += (inverse[i]?.[p] ?? 0) * (a[p]?.[q] ?? 0) * (inverse[j]?.[q] ?? 0)
        }
      }

      return total
    }),
  )
  const symmetric = reduced.map((row, i) => row.map((v, j) => (v + (reduced[j]?.[i] ?? 0)) / 2))

  return jacobiEigenvalues(symmetric, 100, 1e-24)
}
