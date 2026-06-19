// Galactic rotation curve from a radial potential profile. Given the binned potential phi(r), the
// circular-orbit speed squared is v^2(r) = r |dphi/dr| (central differences). The outer-half slope
// of v^2 distinguishes a Keplerian decline (negative) from a flat curve (near zero), and the
// flatness ratio (mean v^2 over the outer third vs the inner third) is below one for a Keplerian
// decline and at or above one for a flat or rising curve.

import { linearFit } from '@/code/measure/regression'

export function rotationCurveFromPotential(input: {
  radii: readonly number[]
  potential: readonly number[]
}): {
  r: number[]
  v2: number[]
  outerSlope: number
  flatnessRatio: number
} {
  const { radii: r, potential: phiR } = input
  const rr: number[] = []
  const v2: number[] = []

  for (let k = 1; k < r.length - 1; k++) {
    const dphi =
      ((phiR[k + 1] ?? 0) - (phiR[k - 1] ?? 0)) /
      ((r[k + 1] ?? 1) - (r[k - 1] ?? 1))

    rr.push(r[k] ?? 0)
    v2.push((r[k] ?? 0) * Math.abs(dphi))
  }

  const half = Math.floor(rr.length / 2)
  const outerSlope = linearFit({
    xs: rr.slice(half),
    ys: v2.slice(half),
  }).slope

  const third = Math.max(1, Math.floor(v2.length / 3))
  const innerMean =
    v2.slice(0, third).reduce((a, b) => a + b, 0) / third

  const outerMean =
    v2.slice(v2.length - third).reduce((a, b) => a + b, 0) / third

  const flatnessRatio = innerMean > 0 ? outerMean / innerMean : 0

  return { r: rr, v2, outerSlope, flatnessRatio }
}
