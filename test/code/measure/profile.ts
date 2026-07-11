// Conformance for code/measure/profile. profileGradient is (range / mean) of a profile,
// radialFieldProfile is the shell-averaged field by integer radius, and weightedGridRadiusOfGyration
// is the RMS distance of a weighted blob from its center of mass. Each is re-derived by hand. The
// chargeDensityProfile over a Will is dynamics-adjacent and not re-run here.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  profileGradient,
  radialFieldProfile,
  weightedGridRadiusOfGyration,
} from '@/code/measure/profile'

const TOL = 1e-12

suite('measure/profile: profileGradient', [
  check('a flat profile has zero gradient', () => {
    equal(profileGradient([2, 2, 2]), 0)
  }),
  check('range over mean for [1,3] is 1', () => {
    // (3-1)/((1+3)/2) = 2/2 = 1.
    close(profileGradient([1, 3]), 1, TOL)
  }),
])

suite('measure/profile: radialFieldProfile', [
  check(
    'shell averages by integer radius (1D, dropping the center)',
    () => {
      // side 4, center c0=2, coord(i)=[i]; values 10..50 at i=0..4.
      // radii: i0->2, i1->1, i2->0, i3->1, i4->2. Keep [1,2]: r1 avg(20,40)=30, r2 avg(10,50)=30.
      const out = radialFieldProfile({
        values: [10, 20, 30, 40, 50],
        coord: i => [i],
        side: 4,
        dimension: 1,
        minRadius: 1,
        maxRadius: 2,
      })

      equal(out.length, 2)
      equal(out[0]!.r, 1)
      close(out[0]!.g, 30, TOL)
      equal(out[1]!.r, 2)
      close(out[1]!.g, 30, TOL)
    },
  ),
])

suite('measure/profile: weightedGridRadiusOfGyration', [
  check('two diagonal unit masses on a 2x2 grid', () => {
    // cells 0=(0,0) and 3=(1,1) weight 1, else 0. COM=(0.5,0.5),
    // each at squared distance 0.5 -> RMS = sqrt((0.5+0.5)/2) = sqrt(0.5).
    const w = [1, 0, 0, 1]

    close(
      weightedGridRadiusOfGyration({
        cellCount: 4,
        side: 2,
        weightOf: i => w[i]!,
      }),
      Math.sqrt(0.5),
      TOL,
    )
  }),
  check('zero total weight returns 0', () => {
    equal(
      weightedGridRadiusOfGyration({
        cellCount: 4,
        side: 2,
        weightOf: () => 0,
      }),
      0,
    )
  }),
])
