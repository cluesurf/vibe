// Conformance for code/measure/gravity-potential: the closed-form weak-field potentials. The bare
// 3D Newtonian potential is exactly 1/(4 pi r). The brane (Kaluza-Klein) potential crosses over
// from 4D (1/r^2 force, so r^2 * G -> const at short range) to 3D (1/(4 pi L r) at long range). The
// light-deflection integrand integrates to 2M/b analytically, and the GR-to-Newton ratio is exactly 2.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  newtonianPotential3D,
  branePotential,
  weakFieldLightDeflection,
} from '@/code/measure/gravity-potential'

const TOL = 1e-12

suite('measure/gravity-potential: Newtonian 3D', [
  // 1/(4 pi r): value at r=1 and the 1/r scaling.
  check('the potential is 1/(4 pi r)', () => {
    close(newtonianPotential3D(1), 1 / (4 * Math.PI), TOL)
    close(newtonianPotential3D(2), 1 / (8 * Math.PI), TOL)
  }),
  check('it falls as 1/r (P(1) = 2 P(2))', () => {
    close(newtonianPotential3D(1), 2 * newtonianPotential3D(2), TOL)
  }),
])

suite('measure/gravity-potential: brane potential', [
  // The closed form 1 / (4 pi L r (1 - exp(-2 pi r / L))), re-evaluated by hand.
  check('matches the Kaluza-Klein closed form', () => {
    const r = 1
    const L = 2
    const expected =
      1 / (4 * Math.PI * L * r * (1 - Math.exp((-2 * Math.PI * r) / L)))

    close(
      branePotential({ radius: r, extraDimension: L }),
      expected,
      TOL,
    )
  }),
  // Long range r >> L: the exponential vanishes, brane -> 1/(4 pi L r), so brane * (4 pi L r) -> 1.
  check('long range recovers the 3D 1/(4 pi L r) law', () => {
    const L = 1
    const r = 1000
    close(
      branePotential({ radius: r, extraDimension: L }) *
        (4 * Math.PI * L * r),
      1,
      1e-6,
    )
  }),
  // Short range r << L: 1 - exp(-2 pi r/L) ~ 2 pi r/L, so brane -> 1/(8 pi^2 r^2), a 4D 1/r^2
  // potential. Then r^2 * brane -> 1/(8 pi^2), the same constant at two small radii.
  check('short range is 4D (r^2 * brane -> 1/(8 pi^2))', () => {
    const L = 100
    const c = 1 / (8 * Math.PI ** 2)
    close(
      branePotential({ radius: 0.1, extraDimension: L }) * 0.1 ** 2,
      c,
      2e-4,
    )
    close(
      branePotential({ radius: 0.2, extraDimension: L }) * 0.2 ** 2,
      c,
      2e-4,
    )
  }),
])

suite('measure/gravity-potential: light deflection', [
  // integral_{-inf}^{inf} b/(x^2+b^2)^{3/2} dx = 2/b, so newtonAngle = M*2/b = 2M/b and grAngle = 4M/b.
  check('Newton angle is 2M/b, GR angle is 4M/b', () => {
    const d = weakFieldLightDeflection({ mass: 1, impact: 1 })
    close(d.newtonAngle, 2, 5e-3)
    close(d.grAngle, 4, 1e-2)
  }),
  // The GR result is exactly twice the Newtonian (time + space terms vs time only).
  check('the GR-to-Newton ratio is exactly 2', () => {
    const d = weakFieldLightDeflection({ mass: 2, impact: 3 })
    equal(d.ratio, 2)
    close(d.grAngle, 2 * d.newtonAngle, TOL)
  }),
  // Scaling: doubling M doubles the angle, doubling b halves it (angle ~ M/b).
  check('the angle scales as M/b', () => {
    const base = weakFieldLightDeflection({
      mass: 1,
      impact: 1,
    }).newtonAngle

    close(
      weakFieldLightDeflection({ mass: 2, impact: 1 }).newtonAngle,
      2 * base,
      1e-2,
    )
    close(
      weakFieldLightDeflection({ mass: 1, impact: 2 }).newtonAngle,
      base / 2,
      1e-2,
    )
  }),
])
