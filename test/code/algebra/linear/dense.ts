// Conformance for code/algebra/linear/dense: small dense matrices, the number[][]
// product, the determinant, and the linear solver. Each result is re-derived by a
// second route: the matrix product by hand, the determinant cross-checked through
// the multiplicative law det(AB) = det(A) det(B), and the solver by substituting the
// solution back into A x = b.

import {
  suite,
  check,
  equal,
  close,
  closeArray,
  exactArray,
} from '@/test/code/harness'
import {
  makeDense,
  denseGet,
  denseSet,
  denseMatVec,
  matrixProduct,
  determinant,
  solveLinearSystem,
} from '@/code/algebra/linear/dense'

suite('algebra/linear/dense: get/set and matvec', [
  check('denseSet then denseGet round-trips by row-major index', () => {
    const m = makeDense({ rows: 2, cols: 3 })
    denseSet(m, { row: 1, col: 2, value: 7 })
    equal(denseGet(m, { row: 1, col: 2 }), 7, 'set/get')
    equal(m.data[1 * 3 + 2], 7, 'row-major layout')
    equal(denseGet(m, { row: 0, col: 0 }), 0, 'untouched stays 0')
  }),
  check('denseMatVec computes A x by hand', () => {
    const m = makeDense({ rows: 2, cols: 2 })
    denseSet(m, { row: 0, col: 0, value: 1 })
    denseSet(m, { row: 0, col: 1, value: 2 })
    denseSet(m, { row: 1, col: 0, value: 3 })
    denseSet(m, { row: 1, col: 1, value: 4 })
    // [[1,2],[3,4]] (5,6) = (1*5+2*6, 3*5+4*6) = (17, 39)
    exactArray(
      denseMatVec(m, { x: Float64Array.from([5, 6]) }),
      [17, 39],
      'A x',
    )
  }),
])

suite('algebra/linear/dense: number[][] product', [
  check('matrixProduct matches the hand product', () => {
    const a = [
      [1, 2],
      [3, 4],
    ]

    const b = [
      [5, 6],
      [7, 8],
    ]

    // [[19,22],[43,50]]
    const p = matrixProduct(a, b)
    exactArray(p[0]!, [19, 22], 'row 0')
    exactArray(p[1]!, [43, 50], 'row 1')
  }),
  check('the identity is a two-sided product unit', () => {
    const a = [
      [2, -1, 0],
      [3, 5, 7],
    ]

    const id3 = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]

    const id2 = [
      [1, 0],
      [0, 1],
    ]

    const right = matrixProduct(a, id3)
    const left = matrixProduct(id2, a)

    for (let r = 0; r < 2; r++) {
      exactArray(right[r]!, a[r]!, 'A I = A')
      exactArray(left[r]!, a[r]!, 'I A = A')
    }
  }),
  check('product of non-square shapes (2x3)(3x2) is 2x2', () => {
    const a = [
      [1, 0, 2],
      [0, 3, 0],
    ]

    const b = [
      [1, 1],
      [0, 1],
      [4, 0],
    ]

    // row0: (1*1+0*0+2*4, 1*1+0*1+2*0) = (9, 1)
    // row1: (0+0+0, 0+3+0) = (0, 3)
    const p = matrixProduct(a, b)
    equal(p.length, 2, 'rows')
    exactArray(p[0]!, [9, 1], 'row 0')
    exactArray(p[1]!, [0, 3], 'row 1')
  }),
])

suite('algebra/linear/dense: determinant', [
  check('2x2 and 3x3 determinants by hand', () => {
    close(
      determinant([
        [1, 2],
        [3, 4],
      ]),
      -2,
      1e-12,
      'det = 1*4 - 2*3 = -2',
    )
    close(
      determinant([
        [2, 0, 0],
        [0, 3, 0],
        [0, 0, 4],
      ]),
      24,
      1e-12,
      'diagonal product',
    )
  }),
  check('a singular matrix has determinant 0', () => {
    equal(
      determinant([
        [1, 2],
        [2, 4],
      ]),
      0,
      'rank-deficient -> 0',
    )
  }),
  check('det(AB) = det(A) det(B) (the multiplicative law)', () => {
    const a = [
      [1, 2],
      [3, 4],
    ]

    const b = [
      [2, 0],
      [1, 2],
    ]

    const detA = determinant(a)
    const detB = determinant(b)
    const detAB = determinant(matrixProduct(a, b))
    close(detAB, detA * detB, 1e-9, 'det(AB) = det(A)det(B)')
  }),
])

suite('algebra/linear/dense: linear solve', [
  check(
    'solveLinearSystem solves a 2x2 and the residual is zero',
    () => {
      const matrix = [
        [2, 1],
        [1, 3],
      ]

      const rightHandSide = [3, 5]
      // 2x + y = 3, x + 3y = 5  ->  x = 0.8, y = 1.4
      const x = solveLinearSystem({ matrix, rightHandSide })
      closeArray(x, [0.8, 1.4], 1e-9, 'solution')

      // substitute back: A x must equal b
      for (let r = 0; r < 2; r++) {
        const lhs = matrix[r]![0]! * x[0]! + matrix[r]![1]! * x[1]!
        close(lhs, rightHandSide[r]!, 1e-9, `row ${r} residual`)
      }
    },
  ),
  check('a 3x3 solve substitutes back exactly', () => {
    const matrix = [
      [2, 1, 1],
      [1, 3, 2],
      [1, 0, 0],
    ]

    const rightHandSide = [5, 10, 1]
    const x = solveLinearSystem({ matrix, rightHandSide })

    for (let r = 0; r < 3; r++) {
      const lhs =
        matrix[r]![0]! * x[0]! +
        matrix[r]![1]! * x[1]! +
        matrix[r]![2]! * x[2]!

      close(lhs, rightHandSide[r]!, 1e-9, `row ${r} residual`)
    }
  }),
])
