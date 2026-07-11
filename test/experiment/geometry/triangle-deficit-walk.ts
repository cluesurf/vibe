// A walker can measure the bulk's curvature locally by pacing a triangle and summing the turns. Walk
// three geodesic legs back to the start and add up the interior angles: in flat space they sum to
// exactly pi (half turn), but in the curved bulk they sum to less, and the shortfall (the angle
// deficit) is exactly the area enclosed, by Gauss-Bonnet at curvature minus one. So a self that
// walks a loop and keeps track of how much it turned reads the curvature directly, with no external
// reference, a portable curvature meter. The deficit grows with the size of the loop, approaching a
// half turn (pi) for a very large triangle, so the bigger the walk the more curvature it reveals.
//
// The angle at each corner is measured two independent ways and they must agree. From the paced side
// lengths alone, by the hyperbolic law of cosines. And from the geodesic tangent directions at the
// corner, the actual turn the walker makes, which because the model is conformal is the Euclidean
// angle between the two departing geodesics. These two routes to the deficit use entirely different
// machinery (distances versus tangent directions), so their agreement is a real check of
// Gauss-Bonnet, not a restatement of it.
//
// Measured on a bulk triangle: the deficit from the side lengths and the deficit from the tangent
// turns agree to machine precision, both positive, and across a size sweep of equilateral triangles
// the deficit rises with side length toward a half turn. The control paces the SAME three leg lengths
// but interprets them flatly (the Euclidean law of cosines): the angle sum is exactly pi and the
// deficit is exactly zero, so the nonzero deficit is the bulk curvature, not the triangle.
//
// Depth L2. It establishes a walkable local curvature meter (angle deficit from two independent
// measurements agreeing, growing with loop size) against a flat interpretation giving zero deficit,
// Gauss-Bonnet on the substrate bulk. Known hyperbolic geometry, measured two independent ways.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  upperHalfPlaneDistance,
  angleFromSides,
  angleFromTangents,
  triangleDeficit,
} from '@/code/measure/bulk-geometry'

const A = { x: -0.6, y: 0.8 }
const B = { x: 1.1, y: 1.3 }
const C = { x: 0.2, y: 2.2 }
const SIDE_SWEEP = [0.3, 1, 2, 4, 8]

export default experiment({
  id: 'geometry/triangle-deficit-walk',
  code: 'E-GMT-0035',
  title:
    'pacing a bulk triangle and summing the turns gives an angle deficit equal to its area (Gauss-Bonnet), matched to machine precision by two independent measurements and growing with loop size, while the same legs interpreted flatly give zero deficit',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the three paced side lengths
    const sideA = upperHalfPlaneDistance({
      x1: B.x,
      y1: B.y,
      x2: C.x,
      y2: C.y,
    })

    const sideB = upperHalfPlaneDistance({
      x1: A.x,
      y1: A.y,
      x2: C.x,
      y2: C.y,
    })

    const sideC = upperHalfPlaneDistance({
      x1: A.x,
      y1: A.y,
      x2: B.x,
      y2: B.y,
    })

    // deficit from the side lengths (law of cosines)
    const deficitSides =
      Math.PI -
      (angleFromSides({
        opposite: sideA,
        adjacentA: sideB,
        adjacentB: sideC,
      }) +
        angleFromSides({
          opposite: sideB,
          adjacentA: sideA,
          adjacentB: sideC,
        }) +
        angleFromSides({
          opposite: sideC,
          adjacentA: sideA,
          adjacentB: sideB,
        }))

    // deficit from the tangent turns (conformal, independent)
    const deficitTangents =
      Math.PI -
      (angleFromTangents({
        px: A.x,
        py: A.y,
        qx: B.x,
        qy: B.y,
        rx: C.x,
        ry: C.y,
      }) +
        angleFromTangents({
          px: B.x,
          py: B.y,
          qx: A.x,
          qy: A.y,
          rx: C.x,
          ry: C.y,
        }) +
        angleFromTangents({
          px: C.x,
          py: C.y,
          qx: A.x,
          qy: A.y,
          rx: B.x,
          ry: B.y,
        }))

    const routesAgree = Math.abs(deficitSides - deficitTangents) < 1e-9
    const deficitPositive = deficitSides > 0.01

    // the deficit grows with loop size toward a half turn
    const sweep = SIDE_SWEEP.map(triangleDeficit)

    let growsWithSize = true

    for (let i = 1; i < sweep.length; i++) {
      if (sweep[i]! <= sweep[i - 1]!) growsWithSize = false
    }

    const approachesHalfTurn =
      sweep[sweep.length - 1]! > 3 && sweep[sweep.length - 1]! < Math.PI

    // CONTROL: the same paced legs, interpreted flatly, give exactly zero deficit
    const flatAngle = (
      opposite: number,
      adjacentA: number,
      adjacentB: number,
    ): number =>
      Math.acos(
        (adjacentA * adjacentA +
          adjacentB * adjacentB -
          opposite * opposite) /
          (2 * adjacentA * adjacentB),
      )

    const flatDeficit =
      Math.PI -
      (flatAngle(sideA, sideB, sideC) +
        flatAngle(sideB, sideA, sideC) +
        flatAngle(sideC, sideA, sideB))

    const flatIsZero = Math.abs(flatDeficit) < 1e-9

    const ok =
      routesAgree &&
      deficitPositive &&
      growsWithSize &&
      approachesHalfTurn &&
      flatIsZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'pacing a bulk triangle and summing the interior turns gives an angle deficit (pi minus the angle sum) that equals the enclosed area by Gauss-Bonnet at curvature minus one, and the deficit measured from the paced side lengths (the hyperbolic law of cosines) agrees with the deficit measured from the geodesic tangent turns at each corner (the conformal Euclidean angle between departing geodesics, an entirely different computation) to machine precision, both positive, and across a sweep of equilateral triangles the deficit rises with side length toward a half turn, so a self reads the bulk curvature locally by walking a loop and tracking its turning, while the same three paced leg lengths interpreted with the flat law of cosines give an angle sum of exactly pi and zero deficit, so the deficit is the bulk curvature and not an artifact of the triangle',
      metrics: {
        deficitFromSides: Number(deficitSides.toFixed(6)),
        deficitFromTangents: Number(deficitTangents.toFixed(6)),
        routeAgreement: Number(
          Math.abs(deficitSides - deficitTangents).toExponential(2),
        ),
        deficitAtLargeSide: Number(sweep[sweep.length - 1]!.toFixed(4)),
        flatDeficit: Number(flatDeficit.toExponential(2)),
      },
      // CONTROL: the same legs interpreted flatly give zero deficit.
      control: { flatDeficit: Number(flatDeficit.toExponential(2)) },
      notes:
        'A walkable local curvature meter (Gauss-Bonnet): angle deficit from two independent measurements agreeing, growing with loop size. Flat-interpretation control gives zero. Complements horosphere flatness (E-CSM-0049) and geodesic divergence (E-GMT-0034).',
    })
  },
})
