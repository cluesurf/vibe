// Conformance for code/operator/chain-operators: the adjacency A and graph Laplacian L = D - A
// of a 1D open chain. Re-derivable facts:
//   - A is symmetric with 1 on each nearest-neighbour edge and 0 elsewhere (exact).
//   - L = D - A exactly: diagonal is the degree, off-diagonal -1 on edges, and every row of L
//     sums to zero (integer arithmetic).
//   - Open-chain adjacency spectrum is 2 cos(pi k / (n+1)), k = 1..n.
//   - Open-chain (path) Laplacian spectrum is 2 - 2 cos(pi k / n), k = 0..n-1.

import { suite, check, equal, closeArray } from '@/test/code/harness'
import { chainOperators } from '@/code/operator/chain-operators'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { DenseMatrix } from '@/code/algebra/linear/dense'

const spec = (m: DenseMatrix): number[] =>
  Array.from(eigSymmetric({ matrix: m }).values).sort((a, b) => a - b)

const sortAsc = (xs: number[]): number[] =>
  [...xs].sort((a, b) => a - b)

suite('operator/chain-operators: A and L = D - A structure', [
  check(
    'adjacency is symmetric with 1 on nearest-neighbour edges only',
    () => {
      const n = 5
      const { adjacency: A } = chainOperators(n)

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const expected = Math.abs(i - j) === 1 ? 1 : 0
          equal(A.data[i * n + j] ?? 0, expected, `A[${i}][${j}]`)
          equal(
            A.data[i * n + j] ?? 0,
            A.data[j * n + i] ?? 0,
            `A symmetric [${i}][${j}]`,
          )
        }
      }
    },
  ),
  check('L = D - A exactly and every row sums to zero', () => {
    const n = 5
    const { adjacency: A, laplacian: L } = chainOperators(n)

    for (let i = 0; i < n; i++) {
      let degree = 0

      for (let j = 0; j < n; j++) {
        degree += A.data[i * n + j] ?? 0
      }

      let rowSum = 0

      for (let j = 0; j < n; j++) {
        const expected =
          (i === j ? degree : 0) - (A.data[i * n + j] ?? 0)

        equal(
          L.data[i * n + j] ?? 0,
          expected,
          `L = D - A at [${i}][${j}]`,
        )
        rowSum += L.data[i * n + j] ?? 0
      }

      equal(rowSum, 0, `row ${i} of L sums to zero`)
    }
  }),
])

suite('operator/chain-operators: spectra', [
  check('adjacency spectrum is 2 cos(pi k / (n+1))', () => {
    const n = 5
    const { adjacency } = chainOperators(n)
    const expected = sortAsc(
      Array.from(
        { length: n },
        (_, i) => 2 * Math.cos((Math.PI * (i + 1)) / (n + 1)),
      ),
    )

    closeArray(spec(adjacency), expected, 1e-9, 'adjacency spectrum')
  }),
  check(
    'Laplacian spectrum is 2 - 2 cos(pi k / n) (smallest eigenvalue 0)',
    () => {
      const n = 5
      const { laplacian } = chainOperators(n)
      const expected = sortAsc(
        Array.from(
          { length: n },
          (_, k) => 2 - 2 * Math.cos((Math.PI * k) / n),
        ),
      )

      closeArray(spec(laplacian), expected, 1e-9, 'Laplacian spectrum')
    },
  ),
])
