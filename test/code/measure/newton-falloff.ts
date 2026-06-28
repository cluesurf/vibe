// Conformance for code/measure/newton-falloff: the Newton 1/r exponent recovered by receding the
// Dirichlet box. The discrete 3D Poisson Green function falls as 1/r, so each finite box reads an
// exponent below -1 (the image-charge steepening), and the per-size exponents extrapolate to -1 as
// the box size grows. The check confirms the extrapolated exponent is near -1 and lies above (less
// steep than) the largest single box.

import { suite, check, close, ok } from '@/test/code/harness'
import { newtonFalloffExponent } from '@/code/measure/newton-falloff'

suite('measure/newton-falloff: 3D box recession', [
  check('the extrapolated exponent recovers the 1/r law (~ -1)', () => {
    const r = newtonFalloffExponent({
      dimension: 3,
      sizes: [15, 19, 23, 27],
      minRadius: 2,
      maxRadius: 5,
    })
    ok(
      r.slopesBySize.every(s => Number.isFinite(s.slope)),
      'every per-size slope must be finite',
    )
    close(r.extrapolatedExponent, -1, 0.2)
  }),
  // Each finite box steepens the falloff below -1; the extrapolation is less steep than any one box.
  check('the extrapolation is less steep than the largest single box', () => {
    const r = newtonFalloffExponent({
      dimension: 3,
      sizes: [15, 19, 23, 27],
      minRadius: 2,
      maxRadius: 5,
    })
    ok(
      r.largestBoxExponent < -1 + 1e-9,
      `single box should read below -1, got ${r.largestBoxExponent}`,
    )
    ok(
      r.extrapolatedExponent > r.largestBoxExponent,
      `extrapolation ${r.extrapolatedExponent} should exceed the largest box ${r.largestBoxExponent}`,
    )
  }),
])
