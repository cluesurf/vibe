// Celestial holography seed: the substrate's isometries act conformally on its
// ideal boundary. This is the discrete seed of Pasterski's founding fact, that
// the Lorentz group acts as the conformal group on the celestial sphere.
//
// We take four of the {3,4,3,4} coin's own boundary directions (D4 roots, the
// 24 directions the substrate steps in, normalized to the boundary sphere), and
// apply a hyperbolic translation, the ball isometry that is the analog of a
// Lorentz boost. A boost genuinely deforms the chordal distances between the
// points, yet it preserves their conformal cross-ratio exactly. A non-conformal
// shear of the same points, the control, breaks the cross-ratio. So the boundary
// carries a conformal structure the substrate's own geometry respects.
//
// Depth L1. This confirms a known geometric fact (hyperbolic isometries are
// boundary conformal maps) on the committed substrate. It is the seed a
// celestial structure would grow from, not a reproduction of celestial
// holography, which would presuppose emergent Lorentzian spacetime.

import { normalize, scale, type Vec } from '@/code/algebra/vector'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { ballIsometry } from '@/code/geometry/mobius'
import {
  crossRatio,
  maxChordDistortion,
} from '@/code/measure/cross-ratio'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// four D4 roots in general position, the substrate's own boundary directions
const FOUR_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
]

// the boost axis, another D4 root direction, at radius 0.6 inside the ball
const BOOST_AXIS: Vec = [1, 0, -1, 0]
const BOOST_RADIUS = 0.6

// a D4 root is one of the 24 vectors with two nonzero entries of magnitude one
function isD4Root(v: Vec, roots: Vec[]): boolean {
  return roots.some(
    r =>
      r.length === v.length &&
      r.every((c, i) => Math.abs(c - v[i]!) < 1e-9),
  )
}

export default experiment({
  id: 'holography/celestial-conformal-boundary',
  code: 'E-HLG-0161',
  title:
    'the substrate isometries act conformally on the ideal boundary, the discrete seed of the celestial sphere',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const roots = rootsD4()

    // grounding: the four directions and the boost axis are real coin directions
    const grounded =
      FOUR_DIRECTIONS.every(v => isD4Root(v, roots)) &&
      isD4Root(BOOST_AXIS, roots)

    const points = FOUR_DIRECTIONS.map(normalize)
    const boost = ballIsometry(
      scale(normalize(BOOST_AXIS), BOOST_RADIUS),
    )

    const boosted = points.map(boost)

    const crBefore = crossRatio(points)
    const crBoosted = crossRatio(boosted)
    const boostDelta = Math.abs(crBoosted - crBefore)
    const distortion = maxChordDistortion(points, boosted)

    // control: a non-conformal shear (stretch one axis, reproject to the sphere)
    const sheared = points.map(p =>
      normalize([1.7 * p[0]!, p[1]!, p[2]!, p[3]!]),
    )

    const crSheared = crossRatio(sheared)
    const controlDelta = Math.abs(crSheared - crBefore)

    const invariant = boostDelta < 1e-9
    const nonTrivial = distortion > 0.1
    const controlBreaks = controlDelta > 1e-2
    const ok = grounded && invariant && nonTrivial && controlBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hyperbolic boost deforms the substrate boundary directions yet preserves their conformal cross-ratio, while a shear breaks it, so the ideal boundary is a conformal sphere the substrate isometries respect',
      metrics: {
        crossRatio: crBefore,
        boostDelta,
        distortion,
        controlDelta,
      },
      control: { shearCrossRatioShift: controlDelta },
      notes: grounded
        ? undefined
        : 'the chosen directions are not all D4 roots, grounding failed',
    })
  },
})
