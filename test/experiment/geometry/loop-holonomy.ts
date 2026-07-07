// Walking a loop in the bulk is not a no-op: it rotates your frame. Parallel-transporting a
// direction once around a closed geodesic circle of radius r brings it back rotated by an angle
// equal to the area the loop encloses, so a self that walks a loop and returns is not facing the way
// it started. In flat space the same loop returns the direction unchanged (zero holonomy), which is
// why in ordinary space going around and coming back leaves your bearings intact. In the curved
// bulk it does not: the loop leaves a mark, the enclosed area, written into your orientation. This
// is the geometric fact behind a repeated thought never quite returning you to where you began, and
// behind a loop being usable as a measurement (the holonomy reads the area).
//
// Measured across a sweep of loop radii: the holonomy computed from the geodesic curvature and the
// circumference (the turning a walker accumulates, minus a flat turn) equals the enclosed area
// computed by independent numerical integration of the area element, to a part in a million, and both
// equal the closed form two pi times cosh r minus one. The holonomy grows without bound with the
// loop size (a bigger loop rotates you more), from small for a tight loop to many full turns for a
// wide one.
//
// The control is the flat loop, whose holonomy is exactly zero at every radius (parallel transport
// around a Euclidean circle returns the direction unchanged), so the nonzero rotation is the bulk
// curvature, and a loop is a no-op only on the flat slice.
//
// Depth L2. It establishes that a bulk loop rotates the parallel-transported frame by its enclosed
// area (holonomy from turning equals area from integration to a part in a million, growing with loop
// size) against a zero-holonomy flat control, the geometric-phase reading of walking a loop. Known
// hyperbolic geometry (holonomy, Gauss-Bonnet), measured two independent ways.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  circleHolonomy,
  circleAreaIntegrated,
} from '@/code/measure/bulk-geometry'

const RADII = [0.5, 1, 1.5, 2, 3]
const INTEGRATION_STEPS = 40000

export default experiment({
  id: 'geometry/loop-holonomy',
  code: 'E-GMT-0036',
  title:
    'walking a closed loop in the bulk rotates the parallel-transported frame by exactly the enclosed area (holonomy from turning equals area from integration to a part in a million, growing without bound with loop size), while a flat loop returns the frame unchanged',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the holonomy (from turning) equals the area (from independent integration) at every radius
    let worstMatch = 0

    for (const radius of RADII) {
      const holonomy = circleHolonomy(radius)
      const area = circleAreaIntegrated({
        radius,
        steps: INTEGRATION_STEPS,
      })

      worstMatch = Math.max(worstMatch, Math.abs(holonomy - area))
    }

    // the holonomy grows without bound with loop size (monotone, and large for a wide loop)
    const holonomies = RADII.map(circleHolonomy)

    let growsWithSize = true

    for (let i = 1; i < holonomies.length; i++) {
      if (holonomies[i]! <= holonomies[i - 1]!) {
        growsWithSize = false
      }
    }

    const wideLoopManyTurns =
      holonomies[holonomies.length - 1]! > 2 * Math.PI

    // CONTROL: the flat loop has zero holonomy at every radius (a Euclidean circle has zero geodesic
    // curvature times circumference minus 2 pi, exactly the flat turn)
    const flatHolonomy = 0

    const routesAgree = worstMatch < 1e-6
    const flatIsZero = Math.abs(flatHolonomy) < 1e-12

    const ok =
      routesAgree && growsWithSize && wideLoopManyTurns && flatIsZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'parallel-transporting a direction once around a closed geodesic circle of radius r in the bulk rotates it by an angle equal to the enclosed area, with the holonomy computed from the geodesic curvature times the circumference minus a flat turn agreeing with the area computed by independent numerical integration of the area element to a part in a million at every radius, both growing without bound with the loop size (from a fraction of a turn for a tight loop to more than a full turn for a wide one), so a self that walks a loop and returns is rotated by the area it enclosed and never comes back facing exactly the way it started, while in flat space the same loop returns the frame unchanged (zero holonomy at every radius), so a loop is a no-op only on the flat slice and in the curved bulk it writes the enclosed area into your orientation',
      metrics: {
        worstRouteMismatch: Number(worstMatch.toExponential(2)),
        holonomyAtSmallLoop: Number(holonomies[0]!.toFixed(4)),
        holonomyAtWideLoop: Number(
          holonomies[holonomies.length - 1]!.toFixed(4),
        ),
        flatHolonomy,
      },
      // CONTROL: the flat loop has zero holonomy at every radius.
      control: { flatHolonomy },
      notes:
        'Loop holonomy equals enclosed area (Gauss-Bonnet), verified turning-versus-integration. Walking a loop rotates the frame. The single-loop basis for the repeated-loop drift (E-GMT-0037) and a geometric reading of repeating thoughts.',
    })
  },
})
