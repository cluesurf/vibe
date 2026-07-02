// Conformance for code/operator/exterior-derivative: discrete exterior calculus on a cell
// complex (boundary maps, the exterior derivative d, the Kahler-Dirac operator D = d + delta).
// The defining identities are exact:
//   - d composed with d is zero (B_k . B_{k+1} = 0), the chain-complex condition.
//   - The exterior derivative is the transpose of the boundary (coboundary), exactly.
//   - D = d + delta is symmetric.
//   - D^2 is block-diagonal in grade and equals the Hodge Laplacian (delta d + d delta), so D
//     is a true square root of the Laplacian.
//   - dim ker D = total Betti number. For the filled n-gon (a disk: b0=1, b1=0, b2=0) that is 1,
//     and the spectrum is symmetric about 0 (D anticommutes with the grade parity).

import { suite, check, equal, close } from '@/test/code/harness'
import {
  polygonComplex,
  kahlerDirac,
  exteriorDerivative,
  multiply,
  transpose,
  boundaryOfBoundaryIsZero,
} from '@/code/operator/exterior-derivative'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

const pentagon = polygonComplex(5)
const triangle = polygonComplex(3)

suite('operator/exterior-derivative: chain complex identities', [
  check('d . d = 0 (boundary of boundary, every polygon)', () => {
    for (const c of [triangle, pentagon, polygonComplex(7)]) {
      equal(
        boundaryOfBoundaryIsZero(c),
        true,
        'boundaryOfBoundaryIsZero',
      )

      const product = multiply(c.boundary[0]!, c.boundary[1]!)

      for (const row of product) {
        for (const value of row) {equal(value, 0, 'B0 B1 entry')}
      }
    }
  }),
  check(
    'the exterior derivative is the transpose of the boundary',
    () => {
      for (let grade = 0; grade < pentagon.boundary.length; grade++) {
        const d = exteriorDerivative(pentagon, grade)
        const bt = transpose(pentagon.boundary[grade]!)
        equal(d.length, bt.length, `grade ${grade} rows`)

        for (let i = 0; i < d.length; i++) {
          for (let j = 0; j < d[i]!.length; j++) {
            equal(d[i]![j] ?? 0, bt[i]![j] ?? 0, `d=B^T [${i}][${j}]`)
          }
        }
      }
    },
  ),
])

suite('operator/exterior-derivative: Kahler-Dirac operator', [
  check('D = d + delta is symmetric', () => {
    const D = kahlerDirac(pentagon)

    for (let i = 0; i < D.length; i++) {
      for (let j = 0; j < D.length; j++) {
        equal(D[i]![j] ?? 0, D[j]![i] ?? 0, `D symmetric [${i}][${j}]`)
      }
    }
  }),
  check(
    'D^2 is block-diagonal in grade (off-grade blocks vanish)',
    () => {
      // grades: vertices 0..4, edges 5..9, face 10. D maps grade k to k+/-1, so D^2 maps grade
      // k to k, k+/-2; on a 3-grade complex the only same-grade target is k itself, so D^2 must
      // be block-diagonal: D^2[vertex][edge] = 0 etc.
      const D = kahlerDirac(pentagon)
      const D2 = multiply(D, D)
      const gradeOf = (i: number): number =>
        i < 5 ? 0 : i < 10 ? 1 : 2

      for (let i = 0; i < D2.length; i++) {
        for (let j = 0; j < D2.length; j++) {
          if (gradeOf(i) !== gradeOf(j)) {
            close(
              D2[i]![j] ?? 0,
              0,
              1e-12,
              `D^2 off-grade [${i}][${j}]`,
            )
          }
        }
      }
    },
  ),
  check(
    'D^2 equals the Hodge Laplacian delta d + d delta on the vertex block',
    () => {
      // on 0-forms (vertices) the Hodge Laplacian is delta_1 d_0 = B0 (B0)^T (the graph Laplacian
      // of the cycle), so D^2 restricted to the vertex block must equal that.
      const D = kahlerDirac(pentagon)
      const D2 = multiply(D, D)
      const B0 = pentagon.boundary[0]!
      const L0 = multiply(B0, transpose(B0)) // 5x5 vertex Laplacian

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          close(
            D2[i]![j] ?? 0,
            L0[i]![j] ?? 0,
            1e-12,
            `D^2 = L on vertices [${i}][${j}]`,
          )
        }
      }
    },
  ),
  check(
    'dim ker D = total Betti number = 1 for the disk, spectrum symmetric about 0',
    () => {
      const D = kahlerDirac(pentagon)
      const n = D.length
      const dense = makeDense({ rows: n, cols: n })

      for (let i = 0; i < n; i++)
        {for (let j = 0; j < n; j++)
          {dense.data[i * n + j] = D[i]![j] ?? 0}}

      const values = Array.from(
        eigSymmetric({ matrix: dense }).values,
      ).sort((a, b) => a - b)

      let zeroModes = 0

      for (const v of values) {if (Math.abs(v) < 1e-7) {zeroModes += 1}}

      equal(zeroModes, 1, 'disk has b0+b1+b2 = 1 zero mode')

      for (let i = 0; i < n; i++) {
        close(
          (values[i] ?? 0) + (values[n - 1 - i] ?? 0),
          0,
          1e-9,
          `spectral mirror ${i}`,
        )
      }
    },
  ),
])
