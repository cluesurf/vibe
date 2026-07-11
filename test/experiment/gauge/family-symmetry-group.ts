// The family symmetry group is the full S3, computed exactly. E-FRC-0069 found an order-three
// automorphism cyclically permuting the three families (the quaternionic subalgebras through the
// preferred unit). The full enumeration sharpens this: the discrete symmetry group of the octonion
// multiplication (unit permutations that are signed automorphisms) has exactly 168 elements,
// PSL(2,7), and the stabilizer of the preferred unit has exactly 24 (the point stabilizer,
// isomorphic to S4), consistent with orbit-stabilizer (168 = 7 times 24, the group transitive on
// the seven units). Those 24 automorphisms induce ALL SIX permutations of the three families,
// each realized exactly four times, so the family group is the full permutation group S3 (not
// just the cyclic Z3), and the kernel (the four automorphisms fixing every family setwise) is the
// Klein four-group, each non-identity element of order two, the intra-family structure.
//
// This matters for the generations story: S3 family symmetry is the symmetry class of the S3
// flavor models of the Standard Model generations (democratic mass matrices), so the substrate's
// geometric family group lands exactly on a studied flavor-symmetry class, and it also delivers
// the transpositions (any two families can be swapped fixing the third), which the order-three
// result alone did not establish.
//
// The control is the checker itself on a non-automorphism: the bare transposition of two units
// from DIFFERENT Fano positions (swapping units 1 and 2 alone) breaks the multiplication and is
// rejected, so the 168 are a strict subgroup of the 5040 unit permutations, not an artifact of a
// vacuous test.
//
// Depth L1. It computes the full automorphism count (168), the stabilizer (24), the orbit-
// stabilizer consistency, the induced family group (S3, uniform multiplicity four), and the
// kernel (Klein four-group) exactly, refining E-FRC-0069. Known group theory (PSL(2,7) and its
// point stabilizer), confirmed by direct enumeration; the mapping to the family group is the
// program's content.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  allUnitAutomorphisms,
  automorphismsFixingUnit,
  inducedFamilyPermutation,
  isSignedOctonionAutomorphism,
} from '@/code/measure/quaternionic-generations'

const PREFERRED_UNIT = 7
const IDENTITY = '012'
const THREE_CYCLES = ['120', '201']
const TRANSPOSITIONS = ['021', '210', '102']

export default experiment({
  id: 'gauge/family-symmetry-group',
  code: 'E-FRC-0071',
  title:
    'the family symmetry group is the full S3 (all six family permutations, uniform multiplicity) from the order-24 stabilizer of the preferred unit inside the order-168 automorphism group, with a Klein four-group kernel, refining the order-three result',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const all = allUnitAutomorphisms()
    const stabilizer = automorphismsFixingUnit(PREFERRED_UNIT)

    // the induced family permutations with multiplicities
    const counts = new Map<string, number>()

    for (const perm of stabilizer) {
      const induced = inducedFamilyPermutation({
        perm,
        unit: PREFERRED_UNIT,
      })

      counts.set(induced, (counts.get(induced) ?? 0) + 1)
    }

    const groupIs168 = all.length === 168
    const stabilizerIs24 = stabilizer.length === 24
    const orbitStabilizer = all.length === 7 * stabilizer.length

    const hasAllSix =
      counts.size === 6 &&
      [IDENTITY, ...THREE_CYCLES, ...TRANSPOSITIONS].every(key =>
        counts.has(key),
      )

    const uniform = [...counts.values()].every(count => count === 4)

    // the kernel: the four automorphisms inducing the identity on families, each of order two
    const kernel = stabilizer.filter(
      perm =>
        inducedFamilyPermutation({ perm, unit: PREFERRED_UNIT }) ===
        IDENTITY,
    )

    const kernelIsKleinFour =
      kernel.length === 4 &&
      kernel.every(perm => {
        // perm squared is the identity
        for (let i = 1; i <= 7; i++) {
          if (perm[perm[i]!] !== i) return false
        }

        return true
      })

    // CONTROL: a bare transposition of two units is not an automorphism
    const bare: Record<number, number> = {}

    for (let i = 1; i <= 7; i++) bare[i] = i

    bare[1] = 2
    bare[2] = 1

    const bareRejected = !isSignedOctonionAutomorphism(bare)

    const ok =
      groupIs168 &&
      stabilizerIs24 &&
      orbitStabilizer &&
      hasAllSix &&
      uniform &&
      kernelIsKleinFour &&
      bareRejected

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the unit permutations preserving the octonion multiplication up to sign number exactly 168 (PSL(2,7)) with the stabilizer of the preferred unit exactly 24 (the S4 point stabilizer, orbit-stabilizer consistent since 168 = 7 times 24), and those 24 induce all six permutations of the three families with uniform multiplicity four, so the family symmetry group is the full S3 including the transpositions (any two families swap fixing the third), refining the order-three result of E-FRC-0069, with the kernel the Klein four-group (four order-two automorphisms fixing every family setwise, the intra-family structure), landing the substrate generations exactly on the S3 flavor-symmetry class, while a bare transposition of two units is rejected by the multiplication so the 168 are a strict, non-vacuous subgroup of the 5040 unit permutations',
      metrics: {
        automorphismCount: all.length,
        stabilizerCount: stabilizer.length,
        inducedPermutationKinds: counts.size,
        multiplicityUniform: uniform ? 1 : 0,
        kernelSize: kernel.length,
        kernelKleinFour: kernelIsKleinFour ? 1 : 0,
      },
      // CONTROL: a bare unit transposition breaks the multiplication, rejected.
      control: { bareTranspositionAccepted: bareRejected ? 0 : 1 },
      notes:
        'PSL(2,7) order 168, point stabilizer S4 order 24, confirmed by enumeration. The family group is the full S3 (uniform multiplicity four, kernel V4), the S3 flavor-model class. Refines E-FRC-0069 (order-three element) and pairs with E-FRC-0070 (mixing angles free).',
    })
  },
})
