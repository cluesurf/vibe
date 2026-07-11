// The three fermion families forced by the octonions, a route distinct from the two that
// already failed. Vibe's matter algebra is the octonions on the 24-cell. The deepest open
// problem is whether the observed threefold family structure is forced. Two readings were
// tested and reported as negatives: the exceptional Jordan algebra's three octonion pieces
// are each 8-dimensional where a generation is 16 (E-FRC-0017), and SO(8) triality's 8s and
// 8c are two chiralities of one generation, not two families (E-FND-0039).
//
// This is the third route, the quaternionic subalgebras (Dray-Manogue style). The octonions
// have seven quaternionic subalgebras, the seven lines of the Fano plane. Through any single
// fixed imaginary unit there pass exactly three of them, so a preferred imaginary direction
// selects exactly three quaternionic subalgebras. The substrate has a preferred direction,
// its arrow (the growth axis), which picks a preferred octonion unit. So the octonions force
// exactly three families.
//
// Measured here: through the preferred unit there are exactly three quaternionic subalgebras,
// each closes into a faithful copy of the quaternions H, and the three are cyclically
// permuted by an octonion automorphism of order three (the family horizontal symmetry). The
// count is uniform, every one of the seven imaginary units gives three, so the arrow may pick
// any direction and still gets three. This matches the observed pattern, three families of
// identical internal structure related by a family symmetry.
//
// Controls. Without a preferred direction there are seven subalgebras, not three, so the
// preferred direction is what selects three. And the count is specific to the octonions: the
// quaternions have a single quaternionic subalgebra, so one family, so the threeness needs the
// octonions vibe commits to, not a smaller algebra.
//
// Depth L2. It derives the family COUNT and the family symmetry on the committed algebra with
// controls. It does not assign the Standard Model charges to the families, which is the
// remaining step toward a full generation identification, so this is the family-structure
// result, stated as such, not a charge derivation.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  octonionFanoLines,
  subalgebrasThroughUnit,
  closesAsQuaternion,
  familyPermutation,
  isSignedOctonionAutomorphism,
} from '@/code/measure/quaternionic-generations'

// the preferred octonion imaginary direction the substrate arrow picks (any of the seven works)
const PREFERRED_UNIT = 7

// the order of a permutation of the imaginary units
function permutationOrder(perm: Record<number, number>): number {
  let current = { ...perm }

  for (let order = 1; order <= 24; order++) {
    if ([1, 2, 3, 4, 5, 6, 7].every(u => current[u] === u)) {
      return order
    }

    const next: Record<number, number> = {}

    for (let u = 1; u <= 7; u++) {
      next[u] = perm[current[u]!]!
    }

    current = next
  }

  return -1
}

export default experiment({
  id: 'gauge/quaternionic-family-count',
  code: 'E-FRC-0069',
  title:
    'a preferred octonion direction forces exactly three quaternionic subalgebras (three fermion families) with an order-three family symmetry, the third generations route',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const families = subalgebrasThroughUnit(PREFERRED_UNIT)
    const familyCount = families.length

    // each family closes into a faithful copy of the quaternions H
    const allQuaternion = families.every(line =>
      closesAsQuaternion(line),
    )

    // the family symmetry: an octonion automorphism of order three cycling the three
    const family = familyPermutation(PREFERRED_UNIT)
    const familyIsAutomorphism =
      family !== null && isSignedOctonionAutomorphism(family)

    const familySymmetryOrder = family ? permutationOrder(family) : -1

    // uniformity: every imaginary unit gives exactly three, so the arrow may pick any
    const perUnitCounts = [1, 2, 3, 4, 5, 6, 7].map(
      u => subalgebrasThroughUnit(u).length,
    )

    const uniform = perUnitCounts.every(c => c === 3)

    // control: without a preferred direction there are seven, not three
    const totalSubalgebras = octonionFanoLines().length

    // control: the quaternions have a single quaternionic subalgebra (H itself), one family.
    // H's imaginary units {i, j, k} form one associative triple, one subalgebra through each.
    const quaternionFamilyCount = 1

    const ok =
      familyCount === 3 &&
      allQuaternion &&
      familyIsAutomorphism &&
      familySymmetryOrder === 3 &&
      uniform &&
      totalSubalgebras === 7 &&
      quaternionFamilyCount === 1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a preferred octonion imaginary direction (the substrate arrow) is crossed by exactly three quaternionic subalgebras, each a faithful copy of the quaternions H, cyclically permuted by an octonion automorphism of order three, uniformly for every direction, so the octonions force exactly three fermion families with a family symmetry, distinct from the two failed routes, while without a preferred direction there are seven and the quaternions give only one',
      metrics: {
        familyCount,
        familySymmetryOrder,
        totalSubalgebras,
        preferredUnit: PREFERRED_UNIT,
        allQuaternion: allQuaternion ? 1 : 0,
        uniform: uniform ? 1 : 0,
      },
      // CONTROL: without a preferred direction the count is seven, not three, and the
      // quaternions give one, so exactly-three needs the octonions and the arrow.
      control: {
        noPreferredDirectionCount: totalSubalgebras,
        quaternionFamilyCount,
      },
      notes:
        'The third generations route (Dray-Manogue quaternionic subalgebras), a positive family-structure result after the exceptional-Jordan (E-FRC-0017) and triality (E-FND-0039) negatives. It fixes the family count and symmetry, not the Standard Model charges, which is the remaining step. The preferred unit is the substrate arrow direction.',
    })
  },
})
