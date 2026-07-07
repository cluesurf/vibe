// What a three-dimensional observer sees of the four-dimensional substrate. The base carries 24
// directions, the D4 root system (the 24-cell). A 3D observer is one who has singled out a
// preferred fourth axis, the substrate arrow, the same direction that fixes the three fermion
// families (E-FRC-0069). Reading only the three transverse coordinates as spatial, the 24
// directions sort cleanly and exactly: the twelve directions with no fourth component land on the
// twelve D3 roots, the cuboctahedron, which is the face-centred-cubic kissing shell, ordinary
// dense 3D space; and the twelve directions with a fourth component collapse in PAIRS onto the six
// octahedral coordinate axes, each axis carrying a two-valued label, the sign of the hidden fourth
// coordinate. So 24 = 12 spatial + 6 axes times 2 internal, with nothing left over.
//
// The physical reading is direct. The fourth dimension does not disappear when the observer becomes
// three-dimensional: it survives as an INTERNAL two-state degree of freedom sitting on the spatial
// axes, an isospin-like label, rather than as a place to move. So the same arrow that makes the
// world three-dimensional also creates an internal quantum number, and the count of hidden states
// is exactly two (a doublet), forced by the single reflected coordinate. This is a from-below map
// of how 4D substrate structure appears as 3D space plus internal structure.
//
// The control projects along a generic, non-lattice direction: the 24 roots then give 24 distinct
// shadows with no degeneracy and no spatial shell, so the clean 12 + 6x2 split is a property of the
// preferred lattice axis, not of dimensional reduction in general. The split needs the arrow to lie
// along a root direction.
//
// Depth L2. It exhibits the exact decomposition of the substrate's 24 directions under projection
// to the preferred 3-space (12 D3 spatial roots plus 6 axes carrying a two-valued internal label)
// against a generic-direction control, a concrete 4D-to-3D map where the reduced dimension becomes
// internal. Known lattice geometry (D3 inside D4), read as the dimensional-reduction structure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  shadowCensus,
  genericProjectionShadowCount,
} from '@/code/measure/dimensional-shadow'
import { rootsD4 } from '@/code/algebra/group/root-system'

export default experiment({
  id: 'geometry/dimensional-shadow',
  code: 'E-GMT-0032',
  title:
    'the 24 substrate directions project to 3-space as 12 D3 (FCC) spatial roots plus 6 octahedral axes each carrying a two-valued internal label (24 = 12 + 6x2), so the reduced fourth dimension becomes an internal doublet, while a generic projection gives 24 structureless shadows',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const census = shadowCensus()

    // 12 spatial D3 directions, 6 internal-doubled axes, nothing else
    const spatialCorrect = census.spatialD3 === 12
    const internalCorrect = census.internalDoubledAxes === 6
    const nothingElse = census.other === 0

    // the accounting closes: 12 spatial roots + 6 axes x 2 hidden signs = 24 directions
    const accounted = census.spatialD3 + census.internalDoubledAxes * 2
    const closes = accounted === rootsD4().length

    // CONTROL: a generic projection direction gives 24 distinct shadows, no degeneracy
    const genericShadows = genericProjectionShadowCount([
      0.3,
      0.5,
      0.7,
      Math.SQRT2 / 2,
    ])

    const genericStructureless = genericShadows === 24

    const ok =
      spatialCorrect &&
      internalCorrect &&
      nothingElse &&
      closes &&
      genericStructureless

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'projecting the 24 D4 substrate directions onto the 3-space transverse to the preferred fourth axis gives exactly twelve directions landing on the twelve D3 roots (the cuboctahedron, the face-centred-cubic kissing shell, ordinary 3D space) and exactly six octahedral coordinate axes onto each of which two directions collapse, differing only by the sign of the hidden fourth coordinate (a two-valued internal label), so the twenty-four directions split as twelve spatial plus six axes times two internal with nothing left over, the reduced fourth dimension surviving as an internal doublet rather than a spatial direction, while projecting along a generic non-lattice direction gives twenty-four distinct structureless shadows, so the clean split is a property of the arrow lying along a root axis',
      metrics: {
        spatialD3Directions: census.spatialD3,
        internalDoubledAxes: census.internalDoubledAxes,
        otherShadows: census.other,
        accountedDirections: accounted,
        genericProjectionShadows: genericShadows,
      },
      // CONTROL: a generic projection direction gives 24 distinct shadows, no spatial shell.
      control: { genericProjectionShadows: genericShadows },
      notes:
        'The 4D-to-3D shadow: 24 = 12 (D3/FCC spatial) + 6 axes x 2 (internal doublet). The reduced dimension becomes an internal two-state label on the octahedral axes. Same arrow as the three-family selection (E-FRC-0069) and the ternary-and-4D forcing (E-FND-0038).',
    })
  },
})
