// The Newton-potential falloff exponent on a flat lattice, recovered cleanly by receding
// the finite-box boundary.
//
// The discrete Poisson Green function on a finite cube with G = 0 on the boundary is NOT a
// pure free-space 1/r: the Dirichlet boundary acts like image charges that steepen the
// falloff, more the closer to the wall, so a single finite box always reads an exponent
// below -1. The free-space exponent is recovered by fitting only a small radial window
// (past the near-source lattice corrections, far from the wall) and extrapolating the
// fitted exponent to infinite box size, where the boundary recedes to infinity. The
// per-size exponents converge monotonically to the true value, which is the evidence that
// the falloff is genuinely 1/r and the deviation is the finite box.

import { dCubePoissonGreens } from '@/code/operator/dcube-poisson'
import { radialFieldProfile } from '@/code/measure/profile'
import { logLogSlope, linearFit } from '@/code/measure/regression'

export type NewtonFalloff = {
  // the fitted log-log exponent of G(r) at each box size, smallest size first
  slopesBySize: { size: number; slope: number }[]
  // the exponent at the largest box (boundary furthest away)
  largestBoxExponent: number
  // the exponent extrapolated to infinite box size (the 1/size -> 0 intercept)
  extrapolatedExponent: number
}

// Fit the power-law falloff exponent of the discrete Poisson Green function on flat
// d-cubes of several sizes, over a fixed small absolute radial window, and extrapolate to
// infinite size. A bigger set of sizes is a more accurate measurement, not a speed knob.
export function newtonFalloffExponent(input: {
  dimension: number
  sizes: readonly number[]
  minRadius: number
  maxRadius: number
}): NewtonFalloff {
  const slopesBySize = [...input.sizes]
    .sort((a, b) => a - b)
    .map(size => {
      const sol = dCubePoissonGreens({ side: size, dimension: input.dimension })
      const profile = radialFieldProfile({
        values: sol.x,
        coord: sol.coord,
        side: size,
        dimension: input.dimension,
        minRadius: input.minRadius,
        maxRadius: input.maxRadius,
      }).filter(point => point.g > 0)

      return {
        size,
        slope: logLogSlope(
          profile.map(point => point.r),
          profile.map(point => point.g),
        ),
      }
    })

  const fit = linearFit({
    xs: slopesBySize.map(s => 1 / s.size),
    ys: slopesBySize.map(s => s.slope),
  })

  return {
    slopesBySize,
    largestBoxExponent: slopesBySize[slopesBySize.length - 1]!.slope,
    extrapolatedExponent: fit.intercept,
  }
}
