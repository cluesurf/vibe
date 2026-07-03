// Conformance for code/measure/rotation-curve: v^2(r) = r |dphi/dr| from a binned potential, via
// central differences. The v^2 array is re-derived by hand from the same central-difference formula
// and matched exactly. Two analytic potentials pin down the regimes: phi = ln r gives a FLAT curve
// (v^2 -> const, flatness ~1, slope ~0); phi = -1/r gives a KEPLERIAN decline (v^2 ~ 1/r, flatness
// well below 1, negative slope).

import {
  suite,
  check,
  close,
  closeArray,
  ok,
} from '@/test/code/harness'
import { rotationCurveFromPotential } from '@/code/measure/rotation-curve'

// the central-difference v^2 the module should produce, computed independently
function expectedV2(radii: number[], potential: number[]): number[] {
  const v2: number[] = []

  for (let k = 1; k < radii.length - 1; k++) {
    const dphi =
      (potential[k + 1]! - potential[k - 1]!) /
      (radii[k + 1]! - radii[k - 1]!)

    v2.push(radii[k]! * Math.abs(dphi))
  }

  return v2
}

const radii = Array.from({ length: 16 }, (_, i) => i + 1) // 1..16

suite('measure/rotation-curve: flat curve (phi = ln r)', [
  // For phi = ln r, dphi/dr ~ 1/r so v^2 = r * (1/r) -> 1, a flat curve.
  check('v^2 matches the hand-derived central difference', () => {
    const phi = radii.map(r => Math.log(r))
    const out = rotationCurveFromPotential({ radii, potential: phi })
    closeArray(out.v2, expectedV2(radii, phi), 1e-12)
  }),
  check('the curve is flat (ratio ~1, slope ~0)', () => {
    const phi = radii.map(r => Math.log(r))
    const out = rotationCurveFromPotential({ radii, potential: phi })
    close(out.flatnessRatio, 1, 0.1)
    ok(
      Math.abs(out.outerSlope) < 0.01,
      `slope should be ~0, got ${out.outerSlope}`,
    )
  }),
])

suite('measure/rotation-curve: Keplerian decline (phi = -1/r)', [
  check('v^2 matches the hand-derived central difference', () => {
    const phi = radii.map(r => -1 / r)
    const out = rotationCurveFromPotential({ radii, potential: phi })
    closeArray(out.v2, expectedV2(radii, phi), 1e-12)
  }),
  // v^2 ~ 1/r declines, so the outer/inner flatness ratio is well below 1 and the slope is negative.
  check('the curve declines (ratio << 1, slope < 0)', () => {
    const phi = radii.map(r => -1 / r)
    const out = rotationCurveFromPotential({ radii, potential: phi })
    ok(
      out.flatnessRatio < 0.5,
      `flatness should be << 1, got ${out.flatnessRatio}`,
    )
    ok(
      out.outerSlope < 0,
      `slope should be negative, got ${out.outerSlope}`,
    )
  }),
])
