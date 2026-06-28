// Conformance for code/algebra/linear/eig-lanczos: Lanczos tridiagonalization with
// full reorthogonalization. The math fact under test is that Lanczos on a symmetric
// operator preserves the spectrum, so the lowest eigenvalues of the tridiagonal it
// builds match the lowest eigenvalues of the original matrix. We feed operators with
// closed-form spectra: a diagonal matrix and the P3 path tridiagonal {2-sqrt2, 2,
// 2+sqrt2}. With a full Krylov space (steps = n) the recovery is exact to tolerance.

import { suite, check, closeArray } from '@/test/code/harness'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'
import {
  sparseFromTriplets,
  operatorFromSparse,
  Triplet,
} from '@/code/algebra/linear/sparse'

function operatorFrom(rows: number[][]) {
  const n = rows.length
  const triplets: Triplet[] = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = rows[r]![c]!
      if (v !== 0) {
        triplets.push({ row: r, col: c, value: v })
      }
    }
  }
  return operatorFromSparse(
    sparseFromTriplets({ rows: n, cols: n, triplets }),
  )
}

suite('algebra/linear/eig-lanczos: spectrum is preserved', [
  check('lowest 2 of diag(1,2,3,4) are {1,2}', () => {
    const op = operatorFrom([
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4],
    ])
    const vals = lowestEigenvalues({ operator: op, count: 2, steps: 4 })
    closeArray(vals, [1, 2], 1e-7, 'lowest two diagonal entries')
  }),
  check('full spectrum of the P3 path tridiagonal {2-sqrt2, 2, 2+sqrt2}', () => {
    const r2 = Math.SQRT2
    const op = operatorFrom([
      [2, 1, 0],
      [1, 2, 1],
      [0, 1, 2],
    ])
    const vals = lowestEigenvalues({ operator: op, count: 3, steps: 3 })
    closeArray(vals, [2 - r2, 2, 2 + r2], 1e-7, 'full tridiagonal spectrum')
  }),
  check('lowest 1 of [[2,1],[1,2]] is 1', () => {
    const op = operatorFrom([
      [2, 1],
      [1, 2],
    ])
    const vals = lowestEigenvalues({ operator: op, count: 1, steps: 2 })
    closeArray(vals, [1], 1e-7, 'smallest eigenvalue')
  }),
])
