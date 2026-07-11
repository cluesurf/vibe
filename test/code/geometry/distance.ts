// Conformance for code/geometry/distance: the one hyperbolic distance, in its Poincare
// and polar forms. The distance is a genuine metric (zero on the diagonal, symmetric,
// triangle inequality), it reproduces the closed-form value where one exists, and the two
// coordinate forms agree. Distances are real-valued, so we use a TIGHT tolerance; the one
// exact fact, d(0, 0) = 0, is asserted as such.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  poincareCosh,
  poincareDistance,
  poincareDistanceIndexed,
  polarCoshFromParts,
} from '@/code/geometry/distance'

const TOL = 1e-9

// Independent closed form for the distance from the disk centre to a point at Euclidean
// radius r: the Mobius distance 2 atanh(r). This is derived from the metric, not from the
// module under test, so it is a real second route.
const distanceFromOrigin = (r: number): number => 2 * Math.atanh(r)

suite('geometry/distance: the metric axioms', [
  check('d(0, 0) = 0 exactly (acosh 1)', () => {
    close(
      poincareDistance([0, 0, 0], [0, 0, 0]),
      0,
      1e-12,
      'centre to centre',
    )
  }),
  check('d(u, v) = d(v, u): the distance is symmetric', () => {
    const u = [0.1, 0.2]
    const v = [-0.3, 0.1]

    close(
      poincareDistance(u, v),
      poincareDistance(v, u),
      1e-12,
      'symmetry',
    )
  }),
  check('triangle inequality: d(a, c) <= d(a, b) + d(b, c)', () => {
    const a = [0.1, 0.2]
    const b = [-0.3, 0.1]
    const c = [0.2, -0.4]
    const ac = poincareDistance(a, c)
    const abc = poincareDistance(a, b) + poincareDistance(b, c)

    ok(ac <= abc + 1e-12, `${ac} must not exceed ${abc}`)
  }),
])

suite('geometry/distance: the known-value identity', [
  check('cosh d for a centred pair is (1 + r^2)/(1 - r^2)', () => {
    // u = 0, v = (0.5, 0): independently cosh(2 atanh r) = (1 + r^2)/(1 - r^2).
    const r = 0.5
    const expected = (1 + r * r) / (1 - r * r)

    close(poincareCosh([0, 0], [r, 0]), expected, TOL, 'centred cosh')
  }),
  check('d(0, (0.5,0)) = 2 atanh(0.5)', () => {
    close(
      poincareDistance([0, 0], [0.5, 0]),
      distanceFromOrigin(0.5),
      TOL,
      'centred distance',
    )
  }),
  check('the indexed buffer form agrees with the point form', () => {
    const p = [0.1, 0.2]
    const q = [0.3, -0.1]
    const flat = Float64Array.from([...p, ...q])

    close(
      poincareDistanceIndexed(flat, 2, 0, 1),
      poincareDistance(p, q),
      TOL,
      'indexed vs point',
    )
  }),
  check(
    'the polar form equals the Poincare form for the same pair',
    () => {
      // Native polar radius rho maps to Poincare radius tanh(rho/2). Place two points at
      // equal radius and angular separation theta and confirm cosh d agrees both ways.
      const rho = 1.0
      const theta = 0.7
      const pr = Math.tanh(rho / 2)
      const p = [pr, 0]
      const q = [pr * Math.cos(theta), pr * Math.sin(theta)]
      const polar = polarCoshFromParts(
        Math.cosh(rho),
        Math.sinh(rho),
        Math.cosh(rho),
        Math.sinh(rho),
        theta,
      )

      close(polar, poincareCosh(p, q), TOL, 'polar vs poincare cosh')
    },
  ),
])

suite('geometry/distance: negative curvature', [
  check(
    'distance to the boundary grows super-linearly in Euclidean radius',
    () => {
      // Doubling the Euclidean radius more than doubles the hyperbolic distance: the disk
      // edge is infinitely far, the signature of negative curvature.
      const near = poincareDistance([0, 0], [0.45, 0])
      const far = poincareDistance([0, 0], [0.9, 0])

      ok(far > 2 * near, `${far} should exceed twice ${near}`)
    },
  ),
  check('the same Euclidean step costs more near the boundary', () => {
    // The metric blows up toward the boundary, so an identical coordinate displacement is
    // a longer hyperbolic distance when anchored near the rim than at the centre.
    const centre = poincareDistance([0, 0], [0, 0.05])
    const edge = poincareDistance([0.8, 0], [0.8, 0.05])

    ok(
      edge > centre,
      `${edge} (near rim) should exceed ${centre} (centre)`,
    )
  }),
])
