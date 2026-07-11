// Conformance for code/algebra/linear/eig-jacobi: the symmetric Jacobi eigensolvers.
// The strongest independent check is a matrix whose spectrum is known in closed
// form. [[2,1],[1,2]] has eigenvalues {1,3}; a 2x2 circulant block embedded in a
// 3x3 gives {1,3,5}; the all-ones-plus-diagonal 3x3 gives {3,3,6}. For eigSymmetric
// we also verify the eigenvectors are orthonormal and that sum_i lambda_i v_i v_i^T
// reconstructs the original matrix. Eigenvalues are sorted before comparison.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  jacobiEigenvalues3,
  jacobiEigenvalues,
  eigSymmetric,
} from '@/code/algebra/linear/eig-jacobi'
import {
  makeDense,
  denseSet,
  DenseMatrix,
} from '@/code/algebra/linear/dense'

function denseFrom(rows: number[][]): DenseMatrix {
  const n = rows.length
  const m = makeDense({ rows: n, cols: n })

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++)
      denseSet(m, { row: r, col: c, value: rows[r]![c]! })
  }

  return m
}

const SORT = (a: number, b: number): number => a - b

suite(
  'algebra/linear/eig-jacobi: jacobiEigenvalues3 (3x3, eigenvalues only)',
  [
    check('block circulant: {1, 3, 5}', () => {
      // [[2,1,0],[1,2,0],[0,0,5]] -> block [[2,1],[1,2]] gives {1,3}, plus 5
      const values = jacobiEigenvalues3([
        [2, 1, 0],
        [1, 2, 0],
        [0, 0, 5],
      ]).sort(SORT)

      closeArray(values, [1, 3, 5], 1e-9, 'spectrum')
    }),
    check('a diagonal matrix returns its diagonal', () => {
      const values = jacobiEigenvalues3([
        [3, 0, 0],
        [0, 1, 0],
        [0, 0, 2],
      ]).sort(SORT)

      closeArray(values, [1, 2, 3], 1e-9, 'diagonal spectrum')
    }),
    check(
      'J + 2I has a doubly-degenerate eigenvalue: {3, 3, 6}',
      () => {
        // all-ones J has spectrum {3,0,0}; adding 3I shifts to {6,3,3}
        const values = jacobiEigenvalues3([
          [4, 1, 1],
          [1, 4, 1],
          [1, 1, 4],
        ]).sort(SORT)

        closeArray(values, [3, 3, 6], 1e-9, 'degenerate spectrum')
      },
    ),
  ],
)

suite(
  'algebra/linear/eig-jacobi: jacobiEigenvalues (n x n, ascending)',
  [
    check('[[2,1],[1,2]] -> {1, 3} already ascending', () => {
      closeArray(
        jacobiEigenvalues([
          [2, 1],
          [1, 2],
        ]),
        [1, 3],
        1e-9,
        '2x2 spectrum',
      )
    }),
    check('path-graph-3 tridiagonal: 2 + sqrt2*{-1,0,1}', () => {
      // adjacency of P3 has eigenvalues {-sqrt2, 0, sqrt2}; +2 on the diagonal shifts.
      const r2 = Math.SQRT2

      closeArray(
        jacobiEigenvalues([
          [2, 1, 0],
          [1, 2, 1],
          [0, 1, 2],
        ]),
        [2 - r2, 2, 2 + r2],
        1e-9,
        'tridiagonal spectrum',
      )
    }),
    check('trace and determinant are preserved by the spectrum', () => {
      const m = [
        [4, 1, 2],
        [1, 3, -1],
        [2, -1, 5],
      ]

      const vals = jacobiEigenvalues(m)
      const trace = 4 + 3 + 5

      close(
        vals.reduce((s, v) => s + v, 0),
        trace,
        1e-9,
        'sum of eigenvalues = trace',
      )

      // det = 4(15-1) - 1(5+2) + 2(-1-6) = 56 - 7 - 14 = 35
      close(
        vals.reduce((s, v) => s * v, 1),
        35,
        1e-7,
        'product of eigenvalues = det',
      )
    }),
  ],
)

suite('algebra/linear/eig-jacobi: eigSymmetric (values + vectors)', [
  check(
    '[[2,1],[1,2]] eigenpairs: values {1,3}, vectors orthonormal',
    () => {
      const eig = eigSymmetric({
        matrix: denseFrom([
          [2, 1],
          [1, 2],
        ]),
      })

      closeArray(eig.values, [1, 3], 1e-9, 'ascending values')

      const n = 2

      // columns orthonormal: v_j . v_k = delta_jk
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          let d = 0

          for (let i = 0; i < n; i++)
            d += eig.vectors[i * n + j]! * eig.vectors[i * n + k]!

          close(d, j === k ? 1 : 0, 1e-9, `<v${j}|v${k}>`)
        }
      }
    },
  ),
  check('A v_j = lambda_j v_j for every eigenpair', () => {
    const A = [
      [4, 1, 2],
      [1, 3, -1],
      [2, -1, 5],
    ]

    const eig = eigSymmetric({ matrix: denseFrom(A) })
    const n = 3

    for (let j = 0; j < n; j++) {
      const lambda = eig.values[j]!

      for (let i = 0; i < n; i++) {
        let av = 0

        for (let k = 0; k < n; k++)
          av += A[i]![k]! * eig.vectors[k * n + j]!

        close(
          av,
          lambda * eig.vectors[i * n + j]!,
          1e-8,
          `row ${i} of A v${j}`,
        )
      }
    }
  }),
  check('reconstruction: sum_j lambda_j v_j v_j^T = A', () => {
    const A = [
      [4, 1, 2],
      [1, 3, -1],
      [2, -1, 5],
    ]

    const eig = eigSymmetric({ matrix: denseFrom(A) })
    const n = 3

    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        let acc = 0

        for (let j = 0; j < n; j++) {
          acc +=
            eig.values[j]! *
            eig.vectors[i * n + j]! *
            eig.vectors[k * n + j]!
        }

        close(acc, A[i]![k]!, 1e-8, `reconstructed A[${i}][${k}]`)
      }
    }
  }),
])
