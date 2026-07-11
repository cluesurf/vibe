// Conformance for code/measure/self-occlusion. The perceivable fractions are exact rationals of the
// {3,4,3,4} geometry: the triality split 16/24 = 2/3, the bulk-cusp 3/4, the tetrahedron 3/4, the
// spinor double cover 1/2. The directional facing fraction is exactly 1/2 for every view because the
// 24 D4 directions are centrally symmetric (visible count equals occluded count).

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  directionalFacingFraction,
  trialityChiralFraction,
  dimensionalCuspFraction,
  tetrahedronFaceFraction,
  spinorCoverFraction,
  toDegrees,
} from '@/code/measure/self-occlusion'

const TOL = 1e-12

suite('measure/self-occlusion: exact geometric fractions', [
  check('triality chiral fraction is 16/24 = 2/3', () => {
    close(trialityChiralFraction(), 2 / 3, TOL)
  }),
  check('bulk-cusp dimensional fraction is 3/4', () => {
    const f = dimensionalCuspFraction()

    equal(f.perceived, 3)
    equal(f.total, 4)
    close(f.fraction, 0.75, TOL)
  }),
  check('tetrahedron face fraction is 3/4', () => {
    close(tetrahedronFaceFraction(), 0.75, TOL)
  }),
  check('spinor double-cover fraction is 1/2', () => {
    close(spinorCoverFraction(), 0.5, TOL)
  }),
  check('toDegrees maps fractions of the full turn', () => {
    close(toDegrees(0.75), 270, TOL)
    close(toDegrees(0.5), 180, TOL)
  }),
])

suite('measure/self-occlusion: directionalFacingFraction', [
  check(
    'the centrally symmetric 24-cell faces exactly 1/2 under any view',
    () => {
      const r = directionalFacingFraction([1, 0, 0, 0])

      // D4 roots are the 24 vectors +-e_a+-e_b; under view e_0: 6 have +e_0 (visible),
      // 6 have -e_0 (occluded), 12 are perpendicular (rim). (6 + 12/2)/24 = 1/2.
      equal(r.visible, 6)
      equal(r.occluded, 6)
      equal(r.rim, 12)
      equal(r.visible + r.occluded + r.rim, 24)
      ok(r.centrallySymmetric)
      close(r.fraction, 0.5, TOL)
    },
  ),
])
