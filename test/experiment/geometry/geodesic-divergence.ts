// You cannot hold a bearing in the bulk: two walkers who set off "straight ahead" from the same
// point on nearly the same heading drift apart exponentially. In the hyperbolic bulk the transverse
// separation of two unit-speed geodesics that leave a common point at a small angle grows as the
// hyperbolic sine of the arc length, so it doubles roughly every unit walked, an exponential
// spreading at the rate set by the curvature (one, for curvature minus one). On the flat cusp the
// same two straight walks separate only linearly. This is the deep reason the bulk is a place of
// global access but poor dead reckoning: keeping a fixed heading is useless because tiny heading
// errors blow up, so a self must navigate the bulk by landmarks and greedy descent (E-NVG-0010), not
// by walking straight. On the flat physical slice, where separation is linear, dead reckoning works,
// which is why walking straight is a fine strategy in ordinary space.
//
// Measured: the bulk transverse separation per unit heading angle matches the hyperbolic sine of the
// arc length across a sweep (to a part in a thousand), and its exponential growth rate is one (the
// square root of minus the curvature), constant across arc-length windows, while the flat separation
// grows linearly (its apparent exponential rate falls window by window toward zero). So the spreading
// is exponential in the bulk and linear on the cusp, the curvature made a navigation fact.
//
// The control is the flat separation, linear in arc length with no exponential growth, so the
// exponential blow-up is specific to the curved bulk, not to the measurement.
//
// Depth L2. It establishes the exponential geodesic divergence of the bulk (the Jacobi field is the
// hyperbolic sine, rate one) against the linear flat separation, the no-dead-reckoning property of
// the bulk. Known hyperbolic geometry (geodesic deviation), measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  geodesicSeparation,
  flatSeparation,
} from '@/code/measure/bulk-geometry'

const ANGLE = 1e-5
const ARC_LENGTHS = [1, 2, 3, 4, 5]

export default experiment({
  id: 'geometry/geodesic-divergence',
  code: 'E-GMT-0034',
  title:
    'two straight bulk walks on nearly the same heading separate as sinh(arc length) (exponential rate one, the curvature) so a bearing cannot be held, while on the flat cusp they separate linearly',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the bulk separation per unit angle matches the hyperbolic sine (the Jacobi field)
    let worstJacobiError = 0

    for (const arc of ARC_LENGTHS) {
      const measured =
        geodesicSeparation({ arcLength: arc, angle: ANGLE }) / ANGLE

      const jacobi = Math.sinh(arc)

      worstJacobiError = Math.max(
        worstJacobiError,
        Math.abs(measured - jacobi) / jacobi,
      )
    }

    // the bulk exponential rate is one (sqrt of minus the curvature) and CONSTANT across windows
    // (the signature of true exponential growth), while the flat apparent rate DECAYS across windows
    // (the signature of linear growth)
    const separationAt = (arc: number): number =>
      geodesicSeparation({ arcLength: arc, angle: ANGLE }) / ANGLE

    const rateOver = (
      value: (arc: number) => number,
      lo: number,
      hi: number,
    ): number => (Math.log(value(hi)) - Math.log(value(lo))) / (hi - lo)

    // the windows sit in the exponential regime (arc large enough that the hyperbolic sine is
    // exponential) yet within the small-angle Jacobi validity (sinh(arc) times the angle stays well
    // below one), where the exponential deviation law holds
    const bulkRateNear = rateOver(separationAt, 5, 8)
    const bulkRateFar = rateOver(separationAt, 8, 11)
    const rateIsCurvature =
      Math.abs(bulkRateNear - 1) < 5e-3 &&
      Math.abs(bulkRateFar - 1) < 5e-3

    const bulkRate = bulkRateNear

    const flatAt = (arc: number): number =>
      flatSeparation({ arcLength: arc, angle: ANGLE }) / ANGLE

    const flatRate = rateOver(flatAt, 5, 8)
    const flatRateFar = rateOver(flatAt, 8, 11)
    // linear growth: the apparent exponential rate falls as the window moves out, decaying toward
    // zero, and never matches the bulk's constant rate
    const flatIsLinear =
      flatRateFar < flatRate * 0.75 && flatRate < bulkRate

    // the bulk spreads far more than the flat at the same arc length
    const bulkFar = separationAt(5)
    const flatFar = flatAt(5)
    const bulkBlowsUp = bulkFar > 10 * flatFar

    const jacobiExact = worstJacobiError < 1e-3

    const ok =
      jacobiExact && rateIsCurvature && flatIsLinear && bulkBlowsUp

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the transverse separation per unit heading angle of two unit-speed geodesics leaving a common bulk point matches the hyperbolic sine of the arc length across the sweep to a part in a thousand (the Jacobi field of geodesic deviation), with an exponential growth rate of one, the square root of minus the curvature, that stays constant across successive arc-length windows (the signature of genuine exponential growth), so two straight bulk walks on nearly the same heading drift apart exponentially and doubling roughly every unit walked, while on the flat cusp the same two straight walks separate only linearly, their apparent exponential rate falling as the measurement window moves outward and decaying toward zero, and by arc length five the bulk separation exceeds the flat by more than ten-fold, so a bearing cannot be held in the bulk and a self must navigate it by landmarks and greedy descent rather than dead reckoning, which works only on the flat slice',
      metrics: {
        worstJacobiError: Number(worstJacobiError.toExponential(2)),
        bulkExponentialRate: Number(bulkRate.toFixed(4)),
        flatExponentialRate: Number(flatRate.toFixed(4)),
        bulkSeparationAt5: Number(bulkFar.toFixed(2)),
        flatSeparationAt5: Number(flatFar.toFixed(2)),
      },
      // CONTROL: the flat separation grows linearly, no exponential blow-up.
      control: { flatExponentialRate: Number(flatRate.toFixed(4)) },
      notes:
        'Exponential geodesic divergence (Jacobi field = sinh, rate one) as the no-dead-reckoning property of the bulk, the reason navigation needs landmarks (E-NVG-0010) not straight walking. Linear-flat control. Complements horosphere flatness (E-CSM-0049).',
    })
  },
})
