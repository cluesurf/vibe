// Conformance for code/algebra/group/invariant-theory: the Molien dimension of the
// degree-d invariant polynomials of a finite matrix group. Every expected dimension is
// re-derived independently:
//   - the trivial group: ALL polynomials are invariant, so the count is the number of
//     degree-d monomials in n variables, C(n + d - 1, d).
//   - the planar rotation group C4 (90 deg): degree-2 invariants are spanned by x^2+y^2
//     (dim 1); degree-4 by (x^2+y^2)^2, Re((x+iy)^4), Im((x+iy)^4) (dim 3).
//   - the full square symmetry B2 (signed permutations, order 8): the invariant ring is
//     R[x^2+y^2, x^2 y^2], so degree-2 dim 1 and degree-4 dim 2 (the reflections kill
//     the Im((x+iy)^4) invariant, the anisotropy drop from C4 to B2).

import { suite, check, equal } from '@/test/code/harness'
import { invariantPolynomialDimension } from '@/code/algebra/group/invariant-theory'

type Matrix = number[][]

const matmul = (a: Matrix, b: Matrix): Matrix => {
  const n = a.length
  const out: Matrix = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0

      for (let k = 0; k < n; k++) s += a[i]![k]! * b[k]![j]!

      out[i]![j] = s
    }
  }

  return out
}

const trace = (a: Matrix): number =>
  a.reduce((s, row, i) => s + row[i]!, 0)

const identity = (n: number): Matrix =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

// number of degree-d monomials in n variables: C(n + d - 1, d)
const monomialCount = (n: number, d: number): number => {
  let num = 1
  let den = 1

  for (let i = 0; i < d; i++) {
    num *= n + i
    den *= i + 1
  }

  return num / den
}

const dim = (group: Matrix[], n: number, degree: 2 | 4): number =>
  invariantPolynomialDimension({
    group,
    degree,
    identity: identity(n),
    multiply: matmul,
    trace,
  })

// C4: the cyclic group of 90-degree rotations in the plane.
const R90: Matrix = [
  [0, -1],
  [1, 0],
]

const c4 = (): Matrix[] => {
  const group: Matrix[] = [identity(2)]

  for (let k = 1; k < 4; k++) group.push(matmul(group[k - 1]!, R90))

  return group
}

// B2: the 8 signed permutations of two coordinates (full symmetry of the square).
const b2 = (): Matrix[] => {
  const diagonals: Matrix[] = []

  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      diagonals.push([
        [sx, 0],
        [0, sy],
      ])

      diagonals.push([
        [0, sx],
        [sy, 0],
      ])
    }
  }

  return diagonals
}

suite(
  'algebra/group/invariant-theory: trivial group counts all monomials',
  [
    check('R^3: degree-2 = 6, degree-4 = 15', () => {
      equal(dim([identity(3)], 3, 2), monomialCount(3, 2), 'C(4,2) = 6')
      equal(dim([identity(3)], 3, 2), 6, 'degree-2 = 6')
      equal(
        dim([identity(3)], 3, 4),
        monomialCount(3, 4),
        'C(6,4) = 15',
      )
      equal(dim([identity(3)], 3, 4), 15, 'degree-4 = 15')
    }),
    check('R^4: degree-2 = 10, degree-4 = 35', () => {
      equal(dim([identity(4)], 4, 2), 10, 'C(5,2) = 10')
      equal(dim([identity(4)], 4, 4), 35, 'C(7,4) = 35')
    }),
  ],
)

suite(
  'algebra/group/invariant-theory: planar rotations vs square symmetry',
  [
    check('C4 (90 deg rotations): degree-2 = 1, degree-4 = 3', () => {
      const group = c4()

      equal(group.length, 4, '|C4| = 4')
      equal(dim(group, 2, 2), 1, 'only x^2+y^2')
      equal(dim(group, 2, 4), 3, '(x^2+y^2)^2, Re and Im of (x+iy)^4')
    }),
    check(
      'B2 (signed perms, order 8): degree-2 = 1, degree-4 = 2',
      () => {
        const group = b2()

        equal(group.length, 8, '|B2| = 8')
        equal(dim(group, 2, 2), 1, 'only x^2+y^2')
        equal(
          dim(group, 2, 4),
          2,
          'reflections drop the Im invariant: 3 -> 2',
        )
      },
    ),
  ],
)
