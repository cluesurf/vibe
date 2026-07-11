// Conformance for code/algebra/linear/sparse: CSR construction and the sparse
// matrix-vector product. Checked against the equivalent dense action by hand, that
// duplicate triplets sum, and that the Aubry-Andre potential adds exactly
// strength*cos(2 pi phi i) to the diagonal (phi = the golden ratio fractional part,
// which we re-derive as (sqrt5 - 1)/2 rather than read the implementation constant).

import {
  suite,
  check,
  equal,
  close,
  closeArray,
} from '@/test/code/harness'
import {
  sparseFromTriplets,
  sparseMatVec,
  operatorFromSparse,
  sparseWithAubryAndrePotential,
  Triplet,
} from '@/code/algebra/linear/sparse'

// independent golden fractional part, equal to the implementation's literal
const GOLDEN = (Math.sqrt(5) - 1) / 2

suite('algebra/linear/sparse: CSR matvec', [
  check('[[2,1],[1,2]] x = hand product', () => {
    const triplets: Triplet[] = [
      { row: 0, col: 0, value: 2 },
      { row: 0, col: 1, value: 1 },
      { row: 1, col: 0, value: 1 },
      { row: 1, col: 1, value: 2 },
    ]

    const m = sparseFromTriplets({ rows: 2, cols: 2, triplets })

    // (1,1) -> (3,3) ; eigenvector (1,-1) -> (1,-1)
    closeArray(
      sparseMatVec(m, { x: Float64Array.from([1, 1]) }),
      [3, 3],
      1e-12,
      'x=(1,1)',
    )

    closeArray(
      sparseMatVec(m, { x: Float64Array.from([1, -1]) }),
      [1, -1],
      1e-12,
      'x=(1,-1)',
    )
  }),
  check('duplicate (row,col) triplets are summed', () => {
    const triplets: Triplet[] = [
      { row: 0, col: 0, value: 1 },
      { row: 0, col: 0, value: 1 }, // duplicate -> total 2
      { row: 1, col: 1, value: 3 },
    ]

    const m = sparseFromTriplets({ rows: 2, cols: 2, triplets })

    closeArray(
      sparseMatVec(m, { x: Float64Array.from([1, 1]) }),
      [2, 3],
      1e-12,
      'summed diagonal',
    )
  }),
  check(
    'operatorFromSparse exposes the size and the same action',
    () => {
      const m = sparseFromTriplets({
        rows: 3,
        cols: 3,
        triplets: [
          { row: 0, col: 1, value: 5 },
          { row: 2, col: 2, value: 7 },
        ],
      })

      const op = operatorFromSparse(m)

      equal(op.size, 3, 'size')
      closeArray(
        op.apply({ x: Float64Array.from([1, 1, 1]) }),
        [5, 0, 7],
        1e-12,
        'operator action',
      )
    },
  ),
])

suite('algebra/linear/sparse: Aubry-Andre potential', [
  check('strength 0 leaves the bare operator unchanged', () => {
    const m = sparseFromTriplets({
      rows: 2,
      cols: 2,
      triplets: [
        { row: 0, col: 1, value: 1 },
        { row: 1, col: 0, value: 1 },
      ],
    })

    const op = sparseWithAubryAndrePotential(m, 0)

    closeArray(
      op.apply({ x: Float64Array.from([1, 1]) }),
      [1, 1],
      1e-12,
      'bare hopping only',
    )
  }),
  check(
    'nonzero strength adds strength*cos(2 pi golden i) to the diagonal',
    () => {
      // empty matrix: the operator acts purely as the on-site potential.
      const m = sparseFromTriplets({ rows: 3, cols: 3, triplets: [] })
      const strength = 1.5
      const op = sparseWithAubryAndrePotential(m, strength)

      // applying to a basis vector e_i reads out V_i on row i.
      for (let i = 0; i < 3; i++) {
        const e = new Float64Array(3)

        e[i] = 1

        const expected = strength * Math.cos(2 * Math.PI * GOLDEN * i)
        const y = op.apply({ x: e })

        close(y[i]!, expected, 1e-9, `V_${i}`)
      }
    },
  ),
])
