// Is the knit rule forced, or one of a family (BE1). The committed knit (headOnRotate) rotates a zero-momentum head-on
// pair (both slots of one line carrying the same tone) between PAIRED lines, conserving charge and momentum and being
// a reversible involution. The free part is the PAIRING of the 12 lines into 6 pairs. This experiment counts the
// family and tests whether the 24-cell symmetry forces a unique rule.
//
//   - BY CONSERVATION ALONE, A VAST FAMILY. Any pairing of the 12 lines gives a valid momentum-conserving reversible
//     knit, and there are 10395 perfect matchings of 12 lines, so conservation and reversibility alone do NOT force
//     the rule, it is one of a vast family.
//   - THE 24-CELL SYMMETRY FORCES A UNIQUE RULE. Of those 10395 pairings, exactly ONE is invariant under the
//     hyperoctahedral B4 symmetry of the 24-cell (the signed coordinate permutations). So the momentum-conserving,
//     reversible, minimal-support knit that RESPECTS the substrate symmetry is unique, forced. The full F4 symmetry
//     (the B4 extended by triality) can only narrow this further, so the symmetric knit is unique.
//   - SO THE KNIT IS FORCED UP TO THE NATURAL REQUIREMENTS. Demanding charge and momentum conservation, reversibility,
//     minimal support (the head-on-pair rotation), and the 24-cell symmetry leaves exactly one rule. The base rule is
//     a THEOREM given those requirements, not a free choice. The freedom in the general (asymmetric) case is a
//     relabeling of the 12 lines, removed by the symmetry.
//
// So the answer to BE1 is, the knit is one of a vast family by conservation alone (10395 minimal momentum-conserving
// reversible rules), but the 24-cell symmetry forces it to a UNIQUE rule, so the committed knit is forced up to the
// natural requirements (conservation, reversibility, minimal support, symmetry). Depth L2, the family and the
// symmetric subfamily counted deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linePairingFamily } from '@/code/measure/collision-family'

export default experiment({
  id: 'foundations/knit-rule-forced',
  code: 'E-FND-0028',
  title:
    'the knit rule is one of 10395 by conservation alone, but the 24-cell symmetry forces a UNIQUE rule (forced up to the natural requirements)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const family = linePairingFamily()

    // by conservation alone the family is vast (the perfect matchings of 12 lines)
    const vastFamily = family.totalPairings > 1000
    // the 24-cell (B4) symmetry forces a unique rule
    const symmetryForcesUnique = family.symmetricPairings === 1

    const ok = vastFamily && symmetryForcesUnique

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the knit rule is forced up to the natural requirements. The committed knit rotates a zero-momentum head-on pair between paired lines, and the free part is the pairing of the 12 lines into 6 pairs. By conservation and reversibility alone there is a vast family (10395 perfect matchings of 12 lines), so the rule is not forced by conservation. But exactly ONE of those pairings is invariant under the hyperoctahedral B4 symmetry of the 24-cell, so the momentum-conserving, reversible, minimal-support knit that respects the substrate symmetry is UNIQUE. The full F4 symmetry (B4 plus triality) can only narrow this further. So demanding conservation, reversibility, minimal support, and the 24-cell symmetry leaves exactly one rule, the base knit is a theorem given those natural requirements, not a free choice.',
      metrics: {
        totalPairings: family.totalPairings,
        symmetricPairings: family.symmetricPairings,
      },
      control: {
        totalPairings: family.totalPairings,
        symmetricPairings: family.symmetricPairings,
      },
      notes:
        'the committed headOnRotate rotates a zero-momentum head-on pair (both slots of a line carrying the same tone) to a paired empty line, conserving charge (the tones move together) and 4-momentum (a zero-momentum pair stays zero-momentum) and being its own inverse. Any pairing of the 12 lines (the 12 opposite-direction pairs of the 24 directions) gives a valid such rule, and there are 12!/(2^6 6!) = 10395 perfect matchings, so conservation and reversibility alone do not force the rule (a vast family). Counting the matchings invariant under the B4 generators (the coordinate transpositions and a sign flip, the signed-permutation symmetry of the 24-cell) gives exactly ONE, so the symmetric momentum-conserving minimal knit is unique. The full F4 symmetry (1152, B4 extended by triality) is a supergroup, so the F4-invariant set is a subset of the one B4-invariant matching, hence at most one. So the knit is FORCED once the natural requirements (conservation, reversibility, minimal support, the 24-cell symmetry) are imposed, the answer to BE1, one of a family by conservation, unique by symmetry. The general-case freedom (the choice of pairing) is a relabeling of the 12 lines, a gauge choice removed by the symmetry.',
    })
  },
})
