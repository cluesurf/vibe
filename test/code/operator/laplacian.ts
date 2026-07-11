// Conformance for code/operator/laplacian: the discrete graph Laplacian
// L = D - A. The defining algebraic facts are exact and re-derivable by hand on a
// tiny graph: every row sums to ZERO (degree minus the count of its -1 neighbors),
// L is symmetric, L * 1 = 0 (the constant vector is the zero eigenvector), and the
// spectrum is non-negative with smallest eigenvalue 0. We check the small-graph
// matrix entry-for-entry, the row sums exactly (integer arithmetic), and the
// spectrum against the analytic eigenvalues of a cycle and a path.

import {
  suite,
  check,
  equal,
  ok,
  close,
  exactArray,
  closeArray,
} from '@/test/code/harness'
import { laplacian, laplacianSpectrum } from '@/code/operator/laplacian'
import { makeGraph, Graph } from '@/code/tool/graph'
import { SparseMatrix } from '@/code/algebra/linear/sparse'
import { DenseMatrix, makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// A 4-cycle 0-1-2-3-0 and a path of 5 nodes 0-1-2-3-4.
const cycle4: Graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [
    [1, 3],
    [0, 2],
    [1, 3],
    [0, 2],
  ],
})

const path5: Graph = makeGraph({
  size: 5,
  directed: false,
  neighbors: [[1], [0, 2], [1, 3], [2, 4], [3]],
})

function toDense(m: SparseMatrix): DenseMatrix {
  const d = makeDense({ rows: m.rows, cols: m.cols })

  for (let r = 0; r < m.rows; r++) {
    for (let p = m.rowPtr[r] ?? 0; p < (m.rowPtr[r + 1] ?? 0); p++)
      d.data[r * m.cols + (m.colIdx[p] ?? 0)]! += m.value[p] ?? 0
  }

  return d
}

function rowSum(m: SparseMatrix, r: number): number {
  let s = 0

  for (let p = m.rowPtr[r] ?? 0; p < (m.rowPtr[r + 1] ?? 0); p++)
    s += m.value[p] ?? 0

  return s
}

// Analytic Laplacian eigenvalues. Cycle of n: 2 - 2 cos(2 pi k / n). Path of n
// (Neumann): 2 - 2 cos(pi k / n).
const cycle4Spectrum = [0, 1, 2, 3]
  .map(k => 2 - 2 * Math.cos((2 * Math.PI * k) / 4))
  .sort((a, b) => a - b)

const path5Spectrum = [0, 1, 2, 3, 4]
  .map(k => 2 - 2 * Math.cos((Math.PI * k) / 5))
  .sort((a, b) => a - b)

suite('operator/laplacian: L = D - A structure', [
  check('the 4-cycle Laplacian equals 2I - A exactly', () => {
    const L = toDense(laplacian({ substrate: cycle4 }))
    // degree 2 everywhere; -1 on each adjacency.
    const expected = [
      2, -1, 0, -1, -1, 2, -1, 0, 0, -1, 2, -1, -1, 0, -1, 2,
    ]

    exactArray(L.data, expected, 'cycle4 L')
  }),
  check('every row sums to exactly zero (cycle and path)', () => {
    for (const g of [cycle4, path5]) {
      const L = laplacian({ substrate: g })

      for (let r = 0; r < L.rows; r++)
        equal(rowSum(L, r), 0, `row ${r} of L must sum to 0`)
    }
  }),
  check('L is symmetric (cycle and path)', () => {
    for (const g of [cycle4, path5]) {
      const L = toDense(laplacian({ substrate: g }))

      for (let i = 0; i < L.rows; i++) {
        for (let j = 0; j < L.cols; j++) {
          equal(
            L.data[i * L.cols + j] ?? 0,
            L.data[j * L.cols + i] ?? 0,
            `L[${i}][${j}] must equal L[${j}][${i}]`,
          )
        }
      }
    }
  }),
  check(
    'L * 1 = 0: the constant vector is the zero eigenvector (exact)',
    () => {
      for (const g of [cycle4, path5]) {
        const L = laplacian({ substrate: g })
        const ones = new Float64Array(L.rows).fill(1)
        // row sums are zero in integer arithmetic, so the product is exactly zero.
        const zeros = new Float64Array(L.rows)
        const product = new Float64Array(L.rows)

        for (let r = 0; r < L.rows; r++) {
          let s = 0

          for (
            let p = L.rowPtr[r] ?? 0;
            p < (L.rowPtr[r + 1] ?? 0);
            p++
          )
            s += (L.value[p] ?? 0) * (ones[L.colIdx[p] ?? 0] ?? 0)

          product[r] = s
        }

        exactArray(product, zeros, `L * 1 for ${g.size}-node graph`)
      }
    },
  ),
])

suite('operator/laplacian: spectrum', [
  check(
    'the dense spectrum matches the analytic cycle eigenvalues',
    () => {
      const L = toDense(laplacian({ substrate: cycle4 }))
      const eig = eigSymmetric({ matrix: L })

      closeArray(eig.values, cycle4Spectrum, 1e-9, 'cycle4 spectrum')
    },
  ),
  check(
    'the dense spectrum matches the analytic path eigenvalues',
    () => {
      const L = toDense(laplacian({ substrate: path5 }))
      const eig = eigSymmetric({ matrix: L })

      closeArray(eig.values, path5Spectrum, 1e-9, 'path5 spectrum')
    },
  ),
  check(
    'the production Lanczos path: smallest eigenvalue is 0, all non-negative',
    () => {
      for (const g of [cycle4, path5]) {
        const values = laplacianSpectrum({ substrate: g, count: 3 })

        close(
          values[0] ?? NaN,
          0,
          1e-8,
          `smallest eigenvalue of ${g.size}-node L`,
        )

        for (const v of values)
          ok((v ?? 0) >= -1e-8, `eigenvalue ${v} must be non-negative`)
      }
    },
  ),
])
