// Conformance for code/algebra/group/icosahedral: the order-60 icosahedral rotation
// group A5 built from a 5-fold and a 2-fold generator, and the decomposition of its
// 12-vertex permutation representation. Every expected number is re-derived from A5
// character theory, never from the implementation.
//
// The 12 icosahedron vertices give a permutation character with fixed-point counts
// chi = [12, 2, 2, 0, 0] on the classes [e, 5a, 5b, 2, 3] (a 5-fold rotation fixes its
// two pole vertices; 2-fold and 3-fold axes pass through no vertex). With class sizes
// [1,12,12,15,20] and the A5 character table, the inner products give
//   triv:1, 3:1, 3':1, 4:0, 5:1
// so the rep is 1 + 3 + 3' + 5 (dim 12), with NO four-dimensional or spinor copy.

import { suite, check, equal, ok } from '@/test/code/harness'
import { icosahedralFacePermutationDecomposition } from '@/code/algebra/group/icosahedral'

suite('algebra/group/icosahedral: A5 and the 12-vertex perm rep', [
  check('the generated rotation group has order 60 (= |A5|)', () => {
    const { groupOrder } = icosahedralFacePermutationDecomposition()

    equal(groupOrder, 60, '|icosahedral rotation group| = 60')
  }),
  check('the 12-vertex rep decomposes as 1 + 3 + 3prime + 5', () => {
    const { multiplicities } = icosahedralFacePermutationDecomposition()

    equal(multiplicities['1'], 1, 'trivial once')
    equal(multiplicities['3'], 1, '3 once')
    equal(multiplicities["3'"], 1, "3' once")
    equal(multiplicities['5'], 1, '5 once')
    equal(multiplicities['4'], 0, 'no 4-dimensional copy')
  }),
  check('the multiplicities reproduce the dimension 12', () => {
    const { multiplicities } = icosahedralFacePermutationDecomposition()
    const dimensions: Record<string, number> = {
      '1': 1,
      '3': 3,
      "3'": 3,
      '4': 4,
      '5': 5,
    }

    const total = Object.entries(multiplicities).reduce(
      (sum, [name, m]) => sum + dimensions[name]! * m,
      0,
    )

    equal(total, 12, 'sum dim*mult = 12 vertices')
  }),
  check('the absence of the 4-rep is reported as no spinor', () => {
    const { noSpinor } = icosahedralFacePermutationDecomposition()

    ok(noSpinor, 'a linear 12-direction rep cannot carry spin')
  }),
])
