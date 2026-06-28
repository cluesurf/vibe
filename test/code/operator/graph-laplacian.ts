// Conformance for code/operator/graph-laplacian: the neighbor-list graph Laplacian
// (L x)_i = deg(i) x_i - sum_{j~i} x_j, its deflated conjugate-gradient Poisson solve,
// and its Green's function. Re-derivable facts:
//   - L is symmetric and every row sums to zero, so L * 1 = 0 EXACTLY (integer arithmetic).
//   - The CG solve returns phi with L phi = b for a zero-mean right-hand side (the only
//     obstruction is the constant null space, which a zero-mean b avoids), to machine zero.
//   - The Green's function solves L phi = delta_center - 1/n exactly, and the potential is
//     largest at the source and decays with graph distance.

import { suite, check, equal, ok, close, closeArray } from '@/test/code/harness'
import {
  graphLaplacian,
  solveGraphPoisson,
  graphLaplacianGreensFunction,
} from '@/code/operator/graph-laplacian'

// A 4-cycle 0-1-2-3-0 and an open path of 5 nodes.
const cycle4: number[][] = [
  [1, 3],
  [0, 2],
  [1, 3],
  [0, 2],
]

const path5: number[][] = [[1], [0, 2], [1, 3], [2, 4], [3]]

function apply(neighbors: number[][], x: Float64Array): Float64Array {
  const out = new Float64Array(x.length)
  graphLaplacian({ neighbors, x, out })

  return out
}

// Materialise the operator as a dense matrix by applying it to each standard basis vector.
function denseRows(neighbors: number[][]): number[][] {
  const n = neighbors.length
  const cols: Float64Array[] = []

  for (let j = 0; j < n; j++) {
    const e = new Float64Array(n)
    e[j] = 1
    cols.push(apply(neighbors, e))
  }

  // cols[j][i] is L[i][j]; build rows.
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => cols[j]![i] ?? 0),
  )
}

suite('operator/graph-laplacian: L = D - A structure', [
  check('the 4-cycle Laplacian equals 2I - A exactly', () => {
    const rows = denseRows(cycle4)
    const expected = [
      [2, -1, 0, -1],
      [-1, 2, -1, 0],
      [0, -1, 2, -1],
      [-1, 0, -1, 2],
    ]

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        equal(rows[i]![j], expected[i]![j], `L[${i}][${j}]`)
      }
    }
  }),
  check('L is symmetric (cycle and path)', () => {
    for (const g of [cycle4, path5]) {
      const rows = denseRows(g)

      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows.length; j++) {
          equal(rows[i]![j], rows[j]![i], `symmetry [${i}][${j}]`)
        }
      }
    }
  }),
  check('L * 1 = 0 exactly: the constant vector is the zero mode', () => {
    for (const g of [cycle4, path5]) {
      const ones = new Float64Array(g.length).fill(1)
      const product = apply(g, ones)

      for (let i = 0; i < g.length; i++) {
        equal(product[i] ?? NaN, 0, `(L 1)[${i}]`)
      }
    }
  }),
])

suite('operator/graph-laplacian: Poisson solve', [
  check('L phi = b for the deflated CG solution on a zero-mean b (cycle)', () => {
    const b = new Float64Array([1, -1, 1, -1])
    const phi = solveGraphPoisson({ neighbors: cycle4, b })
    closeArray(apply(cycle4, phi), b, 1e-9, 'cycle4 L phi vs b')
  }),
  check('L phi = b for the deflated CG solution on a zero-mean b (path)', () => {
    const b = new Float64Array([2, -1, 0, -1, 0])
    const phi = solveGraphPoisson({ neighbors: path5, b })
    closeArray(apply(path5, phi), b, 1e-9, 'path5 L phi vs b')
  }),
  check('the returned potential is zero-mean (the deflation gauge)', () => {
    const b = new Float64Array([2, -1, 0, -1, 0])
    const phi = solveGraphPoisson({ neighbors: path5, b })

    let mean = 0
    for (const v of phi) mean += v
    close(mean / phi.length, 0, 1e-12, 'phi mean')
  }),
])

suite('operator/graph-laplacian: Greens function', [
  check('L phi = delta_center - 1/n exactly (cycle)', () => {
    const center = 0
    const n = cycle4.length
    const phi = graphLaplacianGreensFunction({ neighbors: cycle4, center })
    const b = Float64Array.from({ length: n }, (_, i) =>
      (i === center ? 1 : 0) - 1 / n,
    )
    closeArray(apply(cycle4, phi), b, 1e-9, 'L greens vs delta-1/n')
  }),
  check('the potential peaks at the source and decays with distance (path)', () => {
    const phi = graphLaplacianGreensFunction({ neighbors: path5, center: 0 })
    // index 0 source, distance increases monotonically to index 4.
    for (let i = 0; i + 1 < path5.length; i++) {
      ok((phi[i] ?? 0) > (phi[i + 1] ?? 0), `phi[${i}] > phi[${i + 1}]`)
    }
  }),
])
