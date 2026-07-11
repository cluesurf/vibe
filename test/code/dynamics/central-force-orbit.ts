// Conformance for code/dynamics/central-force-orbit: planar orbits under an inverse-(d-1) central force,
// RK4-integrated. These reproduce Bertrand's and Ehrenfest's results:
//   - d = 3 (inverse-square): the orbit is BOUND and CLOSED (no precession).
//   - d = 2: bound but PRECESSING (not closed).
//   - d = 4: NOT stable (the orbit plunges or escapes).
//   - the acceleration is the exact closed form a = -r / |r|^d.
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  centralForceAcceleration,
  integrateCentralForceOrbit,
} from '@/code/dynamics/central-force-orbit'

suite('dynamics/central-force-orbit: acceleration closed form', [
  check('a = -r / |r|^d at sampled points', () => {
    // at (1, 0), d = 3: f = -1, accel = (-1, 0)
    const [ax, ay] = centralForceAcceleration(1, 0, 3)

    close(ax, -1, 1e-12, 'ax')
    close(ay, 0, 1e-12, 'ay')

    // at (3, 4) (r = 5), d = 3: f = -1/125, accel = (-3/125, -4/125)
    const [bx, by] = centralForceAcceleration(3, 4, 3)

    close(bx, -3 / 125, 1e-12, 'bx')
    close(by, -4 / 125, 1e-12, 'by')
  }),
])

suite('dynamics/central-force-orbit: Bertrand / Ehrenfest', [
  check(
    'inverse-square (d=3) is bound and closed (no precession)',
    () => {
      const r = integrateCentralForceOrbit({ dimension: 3 })

      ok(r.stable, 'd=3 stays bound')
      ok(r.closed, 'd=3 closes')
      close(r.precessionPerOrbit, 0, 0.15, 'd=3 precession ~ 0')
    },
  ),
  check('the 2D law (d=2) is bound but precesses (not closed)', () => {
    const r = integrateCentralForceOrbit({ dimension: 2 })

    ok(r.stable, 'd=2 stays bound')
    ok(!r.closed, 'd=2 does not close (precesses)')
  }),
  check('the 4D law (d=4) is not stable', () => {
    const r = integrateCentralForceOrbit({ dimension: 4 })

    ok(!r.stable, 'd=4 plunges or escapes')
  }),
])

suite('dynamics/central-force-orbit: determinism', [
  check('two identical integrations agree', () => {
    const opts = { dimension: 3, maxSteps: 40000 }
    const a = integrateCentralForceOrbit(opts)
    const b = integrateCentralForceOrbit(opts)

    equal(a.stable, b.stable, 'stable')
    equal(a.orbits, b.orbits, 'orbit count')
    close(
      a.precessionPerOrbit,
      b.precessionPerOrbit,
      0,
      'precession identical',
    )
  }),
])
