// EXTERNAL THEORY: Margolus (and the FCHC lattice-gas lineage of Frisch-Hasslacher-Pomeau, d'Humieres,
// Lallemand), the four-dimensional face-centred-hypercubic lattice gas (author-bridges/norman-margolus.md).
// Their finding: a lattice gas recovers isotropic hydrodynamics only if its set of moving directions carries
// a large enough symmetry group, and the special 24-direction FCHC coin works because its directions are the
// 24-cell, whose symmetry group has order 1152. Vibe's committed coin is exactly these 24 D4 root directions,
// so it should carry that same order-1152 (F4) symmetry, the structural reason it is isotropic, while a naive
// cubic coin does not.
//
// Tested on the committed coin directly (code/algebra/group/root-system rootsD4 and code/algebra/group/
// automorphism). (1) the coin has exactly 24 directions (the 24-cell / FCHC set), (2) its root-system
// reflection group is W(D4) of order 192, (3) its full automorphism group (lifting D4 to F4 by the threefold
// triality) has order 1152, which (4) equals the Weyl group of F4 read independently. CONTROL: the naive
// hypercubic coins (the 8 four-dimensional axes, the 6 cubic axes) have automorphism groups of order 384 and
// 48, neither 1152, so the order-1152 symmetry is special to the 24-cell coin, not generic to any lattice.

import {
  rootsD4,
  rootsF4,
  hypercubicAxes,
} from '@/code/algebra/group/root-system'
import {
  weylGroupOrder,
  automorphismGroupOrder,
} from '@/code/algebra/group/automorphism'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'geometry/margolus-24-cell-symmetry',
  code: 'E-GMT-0026',
  title:
    "vibe's 24-direction coin carries the order-1152 F4 symmetry of the 24-cell that the FCHC lattice gas needs for isotropy (Margolus), where the naive cubic coins do not",
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const coin = rootsD4()

    // (1) exactly the 24-cell / FCHC direction set.
    const directionCount = coin.length
    const isTwentyFour = directionCount === 24

    // (2) the reflection (Weyl) group of D4.
    const weylD4 = weylGroupOrder(coin)
    // (3) the full automorphism group, D4 lifted to F4 by the threefold triality.
    const autD4 = automorphismGroupOrder(coin)
    // (4) cross-check: that order is the Weyl group of F4 read independently.
    const weylF4 = weylGroupOrder(rootsF4())

    const carriesF4 = autD4 === 1152
    const trialityFactor = autD4 / weylD4 // 1152 / 192 = 6, the S3 triality
    const trialityIsS3 = trialityFactor === 6
    const matchesF4Weyl = autD4 === weylF4

    // CONTROL: the naive hypercubic coins do NOT carry the order-1152 symmetry.
    const aut4dAxes = automorphismGroupOrder(hypercubicAxes(4)) // 8 dirs -> 384
    const aut3dAxes = automorphismGroupOrder(hypercubicAxes(3)) // 6 dirs -> 48
    const controlLacksF4 = aut4dAxes !== 1152 && aut3dAxes !== 1152

    const ok =
      isTwentyFour &&
      weylD4 === 192 &&
      carriesF4 &&
      trialityIsS3 &&
      matchesF4Weyl &&
      controlLacksF4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "vibe's coin is the 24-direction 24-cell / FCHC set whose full automorphism group has order 1152, the F4 Weyl group (D4's order-192 reflection group lifted by the threefold triality), the exact symmetry Margolus identifies as what makes the four-dimensional lattice gas isotropic, while the naive 4d and 3d cubic coins carry only the smaller hyperoctahedral symmetries (384 and 48), so the isotropy is special to the 24-cell coin",
      metrics: {
        directionCount,
        weylD4,
        autD4,
        weylF4,
        trialityFactor,
      },
      control: {
        hypercubic4dAxesAut: aut4dAxes,
        cubic3dAxesAut: aut3dAxes,
        controlLacksF4: controlLacksF4 ? 1 : 0,
      },
      notes:
        "L2, exact group theory on the committed coin (integer equality, no tolerance). The 24 D4 roots are the 24-cell vertices and the FCHC moving directions. Their reflection group is W(D4) = 192. The threefold triality of D4 (the order-6 S3 that permutes the vector and the two spinor 8s) lifts this to the full automorphism group of order 1152 = W(F4), confirmed by reading W(F4) off the 48 F4 roots independently. The hypercubic controls (8 axes -> 384, 6 axes -> 48) show the order-1152 symmetry is the 24-cell coin's, not a generic lattice property. This is the structural reason vibe's lattice gas is isotropic, the FCHC result of Margolus and the FHP lineage.",
    })
  },
})
