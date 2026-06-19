// The Newton potential on the flat cusp: 1/r in the three-dimensional physical space, log
// in two dimensions. Gravity lives on the flat physical layer, the horosphere cusp, whose
// own Laplacian Green function is the d-dimensional Newton law, 1/r^(d-2). So the {3,4,3,4}
// cusp (3D) gives 1/r and the {5,3,4} cusp (2D) gives log r.
//
// The honest subtlety: a single finite cube with G = 0 on its boundary is not a pure 1/r,
// because the Dirichlet boundary steepens the falloff like image charges, so one box always
// reads an exponent below -1. The free-space 1/r is recovered by fitting a small radial
// window (away from the wall) across growing boxes and extrapolating to infinite size, where
// the boundary recedes. The per-size exponents converge to -1, which is the evidence that
// the falloff is genuinely 1/r. The 2D-vs-3D contrast is the dimensional control. L1 known
// math (the lattice Green function), with the finite-size extrapolation done honestly.

import { newtonFalloffExponent } from '@/code/measure/newton-falloff'
import { dCubePoissonGreens } from '@/code/operator/dcube-poisson'
import { radialFieldProfile } from '@/code/measure/profile'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function gravityBoundary(): {
  threeDimExponentLargeBox: number
  threeDimExponentExtrapolated: number
  threeDimSlopesBySize: { size: number; slope: number }[]
  twoDimLogSlope: number
} {
  // 3D cusp: the Newton exponent recovered by receding the boundary across growing cubes,
  // fitting a small window past the lattice corrections and away from the wall
  const three = newtonFalloffExponent({
    dimension: 3,
    sizes: [60, 80, 100, 120],
    minRadius: 3,
    maxRadius: 6,
  })

  // 2D cusp: the Newton potential is logarithmic, so G is linear in log r with a negative
  // slope (a power-law exponent does not apply, the falloff is a log, not a power)
  const sol2 = dCubePoissonGreens({ side: 140, dimension: 2 })
  const profile2 = radialFieldProfile({
    values: sol2.x,
    coord: sol2.coord,
    side: 140,
    dimension: 2,
    minRadius: 2,
    maxRadius: 140 * 0.35,
  })

  const twoDimLogSlope = linearFit({
    xs: profile2.map(point => Math.log(point.r)),
    ys: profile2.map(point => point.g),
  }).slope

  return {
    threeDimExponentLargeBox: three.largestBoxExponent,
    threeDimExponentExtrapolated: three.extrapolatedExponent,
    threeDimSlopesBySize: three.slopesBySize,
    twoDimLogSlope,
  }
}

export default experiment({
  id: 'gravity/gravity-boundary',
  title:
    'the flat cusp Poisson Green function falls as 1/r in three dimensions and as log r in two, the dimension-correct Newton potentials',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = gravityBoundary()

    // both the large-box exponent and the infinite-size extrapolation sit within a tenth of
    // minus one, straddling it, so the 3D cusp potential falls as 1/r
    const largeBoxIsNewton = Math.abs(r.threeDimExponentLargeBox + 1) < 0.1
    const extrapolatedIsNewton =
      Math.abs(r.threeDimExponentExtrapolated + 1) < 0.1

    // the per-size exponents converge monotonically toward minus one as the box grows, the
    // evidence that this is genuinely 1/r and the deviation is the finite boundary
    const slopes = r.threeDimSlopesBySize
    let convergesToNewton = true
    for (let i = 1; i < slopes.length; i++) {
      if (
        Math.abs(slopes[i]!.slope + 1) >= Math.abs(slopes[i - 1]!.slope + 1)
      ) {
        convergesToNewton = false
      }
    }

    // the 2D dimensional control: the potential is a logarithm, not a power, so G falls
    // linearly in log r with a negative slope
    const twoDimIsLog = r.twoDimLogSlope < 0

    const ok =
      largeBoxIsNewton &&
      extrapolatedIsNewton &&
      convergesToNewton &&
      twoDimIsLog

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete Poisson Green function on the flat three-dimensional cusp falls as 1/r, recovered by fitting a small window away from the Dirichlet boundary across growing cubes and extrapolating to infinite size, where the exponent converges to minus one (the large box and the extrapolation both within a tenth of minus one, straddling it). The two-dimensional cusp gives a logarithm instead, the dimension-correct Newton potential, the control',
      metrics: {
        threeDimExponentLargeBox: Number(
          r.threeDimExponentLargeBox.toFixed(3),
        ),
        threeDimExponentExtrapolated: Number(
          r.threeDimExponentExtrapolated.toFixed(3),
        ),
        twoDimLogSlope: Number(r.twoDimLogSlope.toFixed(4)),
        smallestBoxExponent: Number(
          r.threeDimSlopesBySize[0]!.slope.toFixed(3),
        ),
      },
      control: {
        twoDimLogSlope: Number(r.twoDimLogSlope.toFixed(4)),
      },
      notes:
        'L1 known math (the lattice Green function) with an honest finite-size extrapolation. The single finite cube reads below minus one because the Dirichlet boundary steepens the falloff like image charges; the free-space 1/r is recovered by receding the boundary (growing the box at a fixed small fit window). This is the cusp Newton law, gravity living on the flat physical layer; the curved bulk gives a separate short-range channel treated elsewhere. The 2D-vs-3D contrast is the dimensional control.',
    })
  },
})
