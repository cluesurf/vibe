// Conformance for code/algebra/group/dihedral: the decomposition of the n-face
// permutation representation of the dihedral group D_n (odd n) into irreps. Every
// expected multiplicity is re-derived from the character inner product, not the impl.
//
// For odd n the n-point (face) permutation character is chi(e)=n, chi(rotation)=0,
// chi(reflection)=1. Taking inner products with the irreducible characters of D_n:
//   <chi, triv> = (1/2n)(n*1 + n*1)            = 1
//   <chi, sign> = (1/2n)(n*1 + n*1*(-1))       = 0
//   <chi, E_j>  = (1/2n)(n*2 + n*1*0)          = 1   for each j = 1..(n-1)/2
// So the rep is triv + sum_j E_j, with NO sign copy and NO spinor (point group).
// The dimensions then sum to 1 + 2*(n-1)/2 = n, as a transitive perm rep must.

import { suite, check, equal, ok } from '@/test/code/harness'
import { dihedralFacePermutationDecomposition } from '@/code/algebra/group/dihedral'

const totalDimension = (
  multiplicities: Record<string, number>,
): number =>
  Object.entries(multiplicities).reduce(
    (sum, [name, m]) =>
      sum + (name === 'triv' || name === 'sign' ? 1 : 2) * m,
    0,
  )

suite(
  'algebra/group/dihedral: face permutation decomposition (odd n)',
  [
    check(
      'D7 face rep = triv + E1 + E2 + E3 (heptagon, the {7,3} case)',
      () => {
        const { multiplicities, hasSpinor } =
          dihedralFacePermutationDecomposition(7)

        equal(multiplicities.triv, 1, 'one trivial copy (one orbit)')
        equal(multiplicities.sign, 0, 'no sign copy for odd n')
        equal(multiplicities.E1, 1, 'E1 once')
        equal(multiplicities.E2, 1, 'E2 once')
        equal(multiplicities.E3, 1, 'E3 once')
        equal(
          hasSpinor,
          false,
          'a point-group perm rep carries no spinor',
        )
      },
    ),
    check(
      'D7 dimensions sum to 7 (a 7-point transitive permutation rep)',
      () => {
        const { multiplicities } =
          dihedralFacePermutationDecomposition(7)

        equal(totalDimension(multiplicities), 7, 'sum of dim*mult = n')
      },
    ),
    check('D5 face rep = triv + E1 + E2, dimensions sum to 5', () => {
      const { multiplicities, hasSpinor } =
        dihedralFacePermutationDecomposition(5)

      equal(multiplicities.triv, 1, 'one trivial copy')
      equal(multiplicities.sign, 0, 'no sign copy for odd n')
      equal(multiplicities.E1, 1, 'E1 once')
      equal(multiplicities.E2, 1, 'E2 once')
      equal(totalDimension(multiplicities), 5, 'sum of dim*mult = 5')
      equal(hasSpinor, false, 'no spinor')
    }),
    check('every multiplicity is a non-negative integer', () => {
      for (const n of [5, 7, 9, 11]) {
        const { multiplicities } =
          dihedralFacePermutationDecomposition(n)

        for (const [name, m] of Object.entries(multiplicities)) {
          ok(
            Number.isInteger(m),
            `${name} multiplicity ${m} is an integer`,
          )
          ok(m >= 0, `${name} multiplicity ${m} >= 0`)
        }

        equal(
          totalDimension(multiplicities),
          n,
          `D${n} dimensions sum to n`,
        )
      }
    }),
  ],
)
