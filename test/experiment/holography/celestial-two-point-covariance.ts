// Celestial holography seed: a boundary two-point function on the substrate's
// ideal boundary transforms as a celestial correlator under the substrate's
// isometries. This is the discrete seed of Pasterski's celestial amplitudes,
// where a 4D scattering correlator becomes a 2D conformal correlator on the
// celestial sphere.
//
// A boundary map is conformal exactly when the distance stretch it applies
// between points factorizes into a per-point conformal factor, D(x,y) =
// |phi x - phi y|^2 / |x - y|^2 = Omega(x) Omega(y). We test this three ways for
// a hyperbolic boost on the substrate's own D4 boundary directions:
//   1. the distortion cross-ratio D(1,2) D(3,4) / (D(1,3) D(2,4)) equals one,
//      the factorization condition, independent of any formula for Omega,
//   2. the independently computed boundary conformal factor Omega satisfies
//      D(x,y) = Omega(x) Omega(y) exactly, so the factor is the real one,
//   3. the conformal two-point G(x,y) = |x - y|^(-2 Delta) transforms as a
//      product of two weight-Delta primaries, G(phi x, phi y) Omega(x)^Delta
//      Omega(y)^Delta = G(x,y).
// The control is a non-conformal shear, whose distortion does not factorize, so
// its distortion cross-ratio departs from one and no correlator covariance holds.
//
// Depth L2. This reproduces the conformal two-point transformation, a known
// construction, on the committed substrate boundary. It is the seed of a
// celestial correlator, not a celestial amplitude, which would presuppose
// emergent Lorentzian spacetime and a scattering matrix.

import {
  normalize,
  norm,
  scale,
  sub,
  type Vec,
} from '@/code/algebra/vector'
import {
  ballIsometry,
  ballBoundaryConformalFactor,
} from '@/code/geometry/mobius'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const FOUR_DIRECTIONS: Vec[] = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, -1],
]

const BOOST_AXIS: Vec = [1, 0, -1, 0]
const BOOST_RADIUS = 0.6
const WEIGHT = 1

// the squared distance stretch a map applies between two boundary points
function distortion(map: (v: Vec) => Vec, x: Vec, y: Vec): number {
  const before = norm(sub(x, y)) ** 2
  const after = norm(sub(map(x), map(y))) ** 2

  return after / Math.max(1e-15, before)
}

// the factorization condition as a cross-ratio of distortions, one iff conformal
function distortionCrossRatio(map: (v: Vec) => Vec, p: Vec[]): number {
  const d = (i: number, j: number) => distortion(map, p[i]!, p[j]!)

  return (d(0, 1) * d(2, 3)) / (d(0, 2) * d(1, 3))
}

export default experiment({
  id: 'holography/celestial-two-point-covariance',
  code: 'E-HLG-0023',
  title:
    'a boundary two-point function transforms as a celestial correlator under a substrate boost, the seed of celestial amplitudes',
  category: 'holography',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const points = FOUR_DIRECTIONS.map(normalize)
    const axis = scale(normalize(BOOST_AXIS), BOOST_RADIUS)
    const boost = ballIsometry(axis)
    const shear = (p: Vec): Vec =>
      normalize([1.7 * p[0]!, p[1]!, p[2]!, p[3]!])

    // 1. the factorization condition, one for a conformal map
    const boostDcr = distortionCrossRatio(boost, points)
    const factorizes = Math.abs(boostDcr - 1)

    // 2. the independently computed conformal factor reproduces the distortion
    let factorResidual = 0
    let twoPointResidual = 0

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const x = points[i]!
        const y = points[j]!
        const omegaX = ballBoundaryConformalFactor(axis, x)
        const omegaY = ballBoundaryConformalFactor(axis, y)
        const d = distortion(boost, x, y)

        factorResidual = Math.max(
          factorResidual,
          Math.abs(d - omegaX * omegaY) / (omegaX * omegaY),
        )

        // 3. the conformal two-point transforms as a weight-Delta primary pair
        const g = (a: Vec, b: Vec) => norm(sub(a, b)) ** (-2 * WEIGHT)
        const transformed =
          g(boost(x), boost(y)) * omegaX ** WEIGHT * omegaY ** WEIGHT

        twoPointResidual = Math.max(
          twoPointResidual,
          Math.abs(transformed - g(x, y)) / g(x, y),
        )
      }
    }

    // control: the shear does not factorize, so its distortion cross-ratio departs
    const shearDcr = distortionCrossRatio(shear, points)
    const controlDelta = Math.abs(shearDcr - 1)

    const ok =
      factorizes < 1e-9 &&
      factorResidual < 1e-9 &&
      twoPointResidual < 1e-9 &&
      controlDelta > 1e-2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hyperbolic boost stretches the substrate boundary by a conformal factor that factorizes per point, so a boundary two-point transforms as a weight-one celestial correlator, while a shear does not factorize',
      metrics: {
        distortionCrossRatio: boostDcr,
        factorResidual,
        twoPointResidual,
        weight: WEIGHT,
      },
      control: { shearDistortionCrossRatioShift: controlDelta },
    })
  },
})
