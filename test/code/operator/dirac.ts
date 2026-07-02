// Conformance for code/operator/dirac: the discrete Kahler-Dirac operator
// D = d + delta on a cell complex. The exact, re-derivable facts:
//   - boundary of boundary is zero: B1 . B2 = 0 (integer matrix, exactly zero).
//   - D is symmetric (B and B^T placed in mirror blocks).
//   - D anticommutes with the grade parity, so its spectrum is symmetric about 0.
//   - dim ker D equals the total Betti number of the complex (a topological count).
// We build the 2-skeleton of the tetrahedron (K4: a triangulated S^2, total Betti
// 1+0+1 = 2) and the filled triangle (K3: a disk, total Betti 1), and check each.

import { suite, check, equal, close } from '@/test/code/harness'
import { cellComplexOf, kahlerDirac } from '@/code/operator/dirac'
import { makeGraph, Graph } from '@/code/tool/graph'
import { SparseMatrix } from '@/code/algebra/linear/sparse'
import {
  DenseMatrix,
  makeDense,
  matrixProduct,
} from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// K4 (complete on 4 vertices): 4 vertices, 6 edges, 4 triangles -> a triangulated
// sphere. K3 (triangle): 3 vertices, 3 edges, 1 triangle -> a disk.
const k4: Graph = makeGraph({
  size: 4,
  directed: false,
  neighbors: [
    [1, 2, 3],
    [0, 2, 3],
    [0, 1, 3],
    [0, 1, 2],
  ],
})

const k3: Graph = makeGraph({
  size: 3,
  directed: false,
  neighbors: [
    [1, 2],
    [0, 2],
    [0, 1],
  ],
})

function toRows(m: SparseMatrix): number[][] {
  const out = Array.from({ length: m.rows }, () =>
    new Array<number>(m.cols).fill(0),
  )

  for (let r = 0; r < m.rows; r++) {
    for (let p = m.rowPtr[r] ?? 0; p < (m.rowPtr[r + 1] ?? 0); p++) {
      out[r]![m.colIdx[p] ?? 0]! += m.value[p] ?? 0
    }
  }

  return out
}

function toDense(m: SparseMatrix): DenseMatrix {
  const d = makeDense({ rows: m.rows, cols: m.cols })

  for (let r = 0; r < m.rows; r++) {
    for (let p = m.rowPtr[r] ?? 0; p < (m.rowPtr[r + 1] ?? 0); p++) {
      d.data[r * m.cols + (m.colIdx[p] ?? 0)]! += m.value[p] ?? 0
    }
  }

  return d
}

function countZeroModes(complexInput: { substrate: Graph }): number {
  const complex = cellComplexOf({
    substrate: complexInput.substrate,
    maxGrade: 2,
  })

  const eig = eigSymmetric({
    matrix: toDense(kahlerDirac({ complex })),
  })

  let zeroModes = 0

  for (const v of eig.values) {
    if (Math.abs(v ?? 0) < 1e-7) {
      zeroModes += 1
    }
  }

  return zeroModes
}

suite('operator/dirac: cell complex and boundary', [
  check(
    'K4 has the expected cell counts (4 vertices, 6 edges, 4 triangles)',
    () => {
      const complex = cellComplexOf({ substrate: k4, maxGrade: 2 })
      equal(complex.cellCount[0] ?? -1, 4, 'vertices')
      equal(complex.cellCount[1] ?? -1, 6, 'edges')
      equal(complex.cellCount[2] ?? -1, 4, 'triangles')
    },
  ),
  check('boundary of boundary is zero: B1 . B2 = 0 (K4)', () => {
    const complex = cellComplexOf({ substrate: k4, maxGrade: 2 })
    const product = matrixProduct(
      toRows(complex.boundary[1]!),
      toRows(complex.boundary[2]!),
    )

    for (let i = 0; i < product.length; i++) {
      for (let j = 0; j < (product[i]?.length ?? 0); j++) {
        equal(product[i]![j] ?? 0, 0, `(B1 B2)[${i}][${j}] must be 0`)
      }
    }
  }),
  check('boundary of boundary is zero: B1 . B2 = 0 (K3)', () => {
    const complex = cellComplexOf({ substrate: k3, maxGrade: 2 })
    const product = matrixProduct(
      toRows(complex.boundary[1]!),
      toRows(complex.boundary[2]!),
    )

    for (const row of product) {
      for (const value of row) {
        equal(value, 0, 'B1 B2 entry must be 0')
      }
    }
  }),
])

suite('operator/dirac: Kahler-Dirac operator', [
  check('D is symmetric (K4)', () => {
    const complex = cellComplexOf({ substrate: k4, maxGrade: 2 })
    const D = toDense(kahlerDirac({ complex }))

    for (let i = 0; i < D.rows; i++) {
      for (let j = 0; j < D.cols; j++) {
        equal(
          D.data[i * D.cols + j] ?? 0,
          D.data[j * D.cols + i] ?? 0,
          `D[${i}][${j}] must equal D[${j}][${i}]`,
        )
      }
    }
  }),
  check(
    'the spectrum is symmetric about 0 (D anticommutes with grade parity)',
    () => {
      const complex = cellComplexOf({ substrate: k4, maxGrade: 2 })
      const eig = eigSymmetric({
        matrix: toDense(kahlerDirac({ complex })),
      })

      const n = eig.values.length

      for (let i = 0; i < n; i++) {
        close(
          (eig.values[i] ?? 0) + (eig.values[n - 1 - i] ?? 0),
          0,
          1e-9,
          `eigenvalue ${i} and its mirror must sum to 0`,
        )
      }
    },
  ),
  check(
    'dim ker D = total Betti number: 2 for K4 (a triangulated S^2)',
    () => {
      equal(
        countZeroModes({ substrate: k4 }),
        2,
        'K4 2-skeleton (S^2) has b0 + b1 + b2 = 1 + 0 + 1 = 2',
      )
    },
  ),
  check('dim ker D = total Betti number: 1 for K3 (a disk)', () => {
    equal(
      countZeroModes({ substrate: k3 }),
      1,
      'K3 filled triangle (disk) has b0 + b1 + b2 = 1 + 0 + 0 = 1',
    )
  }),
])
