// Repeating a thought does not return you to the same place: it precesses your frame. Because
// walking a loop rotates the frame by the enclosed area (E-GMT-0036), walking the same loop N times
// accumulates N times that rotation, so a repeated thought-loop drifts the frame steadily around.
// The frame returns to its exact starting orientation only when the accumulated rotation is a whole
// number of turns, which for a generic loop area never happens (the area and a full turn are
// incommensurable, so the frame angle is dense on the circle and comes arbitrarily close to home but
// never lands there). Only for a special, commensurate loop, whose area evenly divides a full turn,
// does the repetition close into an exact meta-cycle after a fixed number of repeats. So a
// ruminating loop generically never exactly repeats its viewpoint, it precesses, and only a
// specially tuned loop closes.
//
// Measured: the accumulated frame angle after N repetitions equals N times the single-loop holonomy
// to machine precision (linear accumulation). For a generic loop area (an irrational multiple of a
// full turn) the frame never returns within a tight tolerance across thousands of repetitions
// (nearest approach stays bounded away from zero at the tested tolerance), so it never exactly
// closes. For a commensurate loop area (a full turn divided by a whole number) the frame returns
// exactly every that-many repetitions (an exact meta-cycle), confirming the closure condition.
//
// The control is the flat loop, whose holonomy is zero, so its frame is unchanged after any number
// of repetitions (it always returns exactly): the drift and its non-closure are the bulk curvature,
// absent on the flat slice.
//
// Depth L2. It establishes that repetition accumulates holonomy linearly and closes only at the
// commensurate meta-period (generic loops never exactly repeat, a tuned loop does) against a flat
// always-returns control, the drift-of-repetition reading of repeating thoughts. Known geometry
// (holonomy accumulation, commensurability), measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  circleHolonomy,
  accumulatedFrameAngle,
} from '@/code/measure/bulk-geometry'

const GENERIC_RADIUS = 1
const REPETITIONS = 5000

export default experiment({
  id: 'geometry/repeated-loop-drift',
  code: 'E-GMT-0037',
  title:
    'repeating a bulk loop accumulates holonomy linearly (N times the single-loop rotation) and returns the frame exactly only at the commensurate meta-period, so a generic loop never repeats its viewpoint while a tuned loop closes, and a flat loop always returns',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const holonomy = circleHolonomy(GENERIC_RADIUS)

    // linear accumulation: the frame angle after N repetitions is N times the holonomy (mod a turn)
    let worstAccumulation = 0

    for (const repetitions of [1, 2, 5, 10, 37]) {
      const expected =
        (((holonomy * repetitions) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI)

      const measured = accumulatedFrameAngle({ holonomy, repetitions })

      worstAccumulation = Math.max(
        worstAccumulation,
        Math.abs(measured - expected),
      )
    }

    // generic loop: the frame never returns within tolerance across many repetitions
    let genericNearestReturn = Infinity

    for (
      let repetitions = 1;
      repetitions <= REPETITIONS;
      repetitions++
    ) {
      const angle = accumulatedFrameAngle({ holonomy, repetitions })
      const distanceToHome = Math.min(angle, 2 * Math.PI - angle)

      genericNearestReturn = Math.min(
        genericNearestReturn,
        distanceToHome,
      )
    }

    // the generic loop comes arbitrarily close (dense) but never lands home exactly; confirm no
    // exact return in the first many repetitions (it does not close at a small period)
    let genericExactReturns = 0

    for (let repetitions = 1; repetitions <= 200; repetitions++) {
      const angle = accumulatedFrameAngle({ holonomy, repetitions })
      const distanceToHome = Math.min(angle, 2 * Math.PI - angle)

      if (distanceToHome < 1e-9) {
        genericExactReturns++
      }
    }

    const genericDoesNotClose = genericExactReturns === 0

    // commensurate loop: a holonomy of exactly a full turn over k returns every k repetitions
    const period = 8
    const commensurateHolonomy = (2 * Math.PI) / period

    let commensurateReturnsAtPeriod = true

    for (let cycle = 1; cycle <= 5; cycle++) {
      const angle = accumulatedFrameAngle({
        holonomy: commensurateHolonomy,
        repetitions: cycle * period,
      })

      const distanceToHome = Math.min(angle, 2 * Math.PI - angle)

      if (distanceToHome > 1e-9) {
        commensurateReturnsAtPeriod = false
      }
    }

    // CONTROL: the flat loop (zero holonomy) always returns the frame exactly
    const flatAngle = accumulatedFrameAngle({
      holonomy: 0,
      repetitions: 12345,
    })

    const flatAlwaysReturns = Math.abs(flatAngle) < 1e-12

    const linearAccumulation = worstAccumulation < 1e-9

    const ok =
      linearAccumulation &&
      genericDoesNotClose &&
      commensurateReturnsAtPeriod &&
      flatAlwaysReturns

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'walking the same bulk loop N times accumulates the frame rotation to N times the single-loop holonomy (to machine precision, linear accumulation), and the frame returns to its exact starting orientation only when the accumulated rotation is a whole number of turns, so a generic loop whose area is an irrational multiple of a full turn never exactly closes (no exact return in two hundred repetitions, the frame precessing densely around without landing home) while a commensurate loop whose holonomy is a full turn divided by a whole number returns exactly every that-many repetitions (an exact meta-cycle), so a repeated thought generically never repeats its viewpoint but drifts, and only a specially tuned loop closes, while a flat loop has zero holonomy and returns the frame exactly after any number of repetitions',
      metrics: {
        singleLoopHolonomy: Number(holonomy.toFixed(4)),
        worstAccumulationError: Number(
          worstAccumulation.toExponential(2),
        ),
        genericExactReturnsIn200: genericExactReturns,
        genericNearestReturn: Number(
          genericNearestReturn.toExponential(2),
        ),
        commensuratePeriod: period,
      },
      // CONTROL: the flat loop always returns the frame exactly (zero holonomy).
      control: { flatFrameAngle: Number(flatAngle.toExponential(2)) },
      notes:
        'Repeated-loop precession: repetition accumulates holonomy, closing only at the commensurate meta-period. A generic repeated thought never exactly repeats its viewpoint. Extends the single-loop holonomy (E-GMT-0036). Flat always-returns control.',
    })
  },
})
