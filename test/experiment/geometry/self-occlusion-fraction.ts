// The perceivable fraction of a self's Being, derived from the {3,4,3,4} geometry. A line of spiritual work
// claims a self perceives 270 of 360 degrees, one quarter occluded, like a tetrahedron resting under gravity
// with one of its four faces hidden. We compute the candidate fractions exactly and report the honest spread.
// The clean 3/4 (270 degrees) does appear, but specifically from the bulk-cusp dimensional structure (a 3D self
// on the boundary of a 4D bulk, the radial fourth dimension occluded) and the tetrahedron face count, which
// agree. The 24 directions themselves are centrally symmetric and give exactly 1/2 (180 degrees), and triality
// gives 2/3. So 270 degrees is real and derived, but it is the dimensional occlusion, not the direction count.
//
// L1 geometry, with the central-symmetry control. Compute in code/measure/self-occlusion.

import {
  directionalFacingFraction,
  trialityChiralFraction,
  dimensionalCuspFraction,
  tetrahedronFaceFraction,
  spinorCoverFraction,
} from '@/code/measure/self-occlusion'
import { probeDirections4D } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'geometry/self-occlusion-fraction',
  code: 'E-GMT-0023',
  title:
    'the perceivable fraction of Being is 3/4 (270 degrees) from the bulk-cusp dimensional occlusion, while the 24 directions give exactly 1/2',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // direction set: facing-out fraction over many views; central symmetry forces exactly 1/2 every time
    const views = [
      ...probeDirections4D(),
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 1],
    ]

    const facings = views.map(directionalFacingFraction)
    const directionalAlwaysHalf = facings.every(
      f => Math.abs(f.fraction - 0.5) < 1e-9 && f.centrallySymmetric,
    )

    const triality = trialityChiralFraction()
    const dimensional = dimensionalCuspFraction().fraction
    const tetrahedron = tetrahedronFaceFraction()
    const spinor = spinorCoverFraction()

    // the headline: the dimensional and tetrahedral occlusions agree at exactly 3/4 = 270 degrees
    const dimensionalGives270 =
      Math.abs(dimensional - 0.75) < 1e-12 &&
      Math.abs(tetrahedron - 0.75) < 1e-12

    const trialityGives240 = Math.abs(triality - 2 / 3) < 1e-12
    const spinorGivesHalf = Math.abs(spinor - 0.5) < 1e-12

    const ok =
      directionalAlwaysHalf &&
      dimensionalGives270 &&
      trialityGives240 &&
      spinorGivesHalf

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the perceivable fraction of Being is exactly 3/4 (270 degrees) from the bulk-cusp dimensional occlusion (a 3D self on the boundary of a 4D bulk, the radial fourth dimension hidden), matching the tetrahedron-under-gravity analogy, while the 24 directions are centrally symmetric and give exactly 1/2 (180 degrees) and triality gives 2/3 (240 degrees)',
      metrics: {
        dimensionalFraction: dimensional,
        tetrahedronFraction: tetrahedron,
        trialityFraction: triality,
        spinorFraction: spinor,
      },
      control: {
        directionalFacingFraction: facings[0]!.fraction,
      },
      notes:
        'L1 geometry. the 270 degrees is real and derived, specifically as the dimensional / holographic occlusion (the radial depth is the occluded direction, the gravity direction in the tetrahedron analogy). the direction count gives 1/2 by central symmetry, an honest distinction',
    })
  },
})
