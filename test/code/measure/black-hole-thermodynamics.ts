// Conformance for code/measure/black-hole-thermodynamics: the closed-form Schwarzschild and
// de Sitter relations. Every quantity here is an exact analytic function of M (or H), so the
// checks re-derive the textbook identities by hand and assert them to floating tolerance: the
// area law A = 16 pi M^2, the first law T dS = dM, the Smarr relation M = 2 T S, the M^-2
// luminosity, the M^3 evaporation scaling, and the de Sitter horizon set.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  schwarzschildRadius,
  schwarzschildArea,
  schwarzschildEntropy,
  schwarzschildSurfaceGravity,
  hawkingTemperature,
  horizonLuminosity,
  schwarzschildEvaporationLifetime,
  deSitterHorizon,
} from '@/code/measure/black-hole-thermodynamics'

const TOL = 1e-9

suite('measure/black-hole-thermodynamics: Schwarzschild', [
  // r_s = 2M exactly.
  check('horizon radius is 2M', () => {
    equal(schwarzschildRadius(3), 6)
    equal(schwarzschildRadius(0.5), 1)
  }),
  // A = 4 pi r_s^2 = 16 pi M^2.
  check('area is 16 pi M^2', () => {
    close(schwarzschildArea(2), 16 * Math.PI * 4, TOL)
    close(schwarzschildArea(2), 4 * Math.PI * schwarzschildRadius(2) ** 2, TOL)
  }),
  // S = A / 4 = 4 pi M^2.
  check('entropy is the area over four', () => {
    close(schwarzschildEntropy(2), 4 * Math.PI * 4, TOL)
    close(schwarzschildEntropy(2), schwarzschildArea(2) / 4, TOL)
  }),
  // kappa = 1 / (4M), T = kappa / 2pi = 1 / (8 pi M).
  check('surface gravity and Hawking temperature', () => {
    close(schwarzschildSurfaceGravity(2), 1 / 8, TOL)
    close(hawkingTemperature(2), 1 / (16 * Math.PI), TOL)
    close(hawkingTemperature(2), schwarzschildSurfaceGravity(2) / (2 * Math.PI), TOL)
  }),
  // First law dM = T dS: S = 4 pi M^2 so dS/dM = 8 pi M, and T (dS/dM) = 1.
  check('the first law T dS = dM holds (T * 8 pi M = 1)', () => {
    for (const M of [0.5, 1, 2, 5]) {
      close(hawkingTemperature(M) * 8 * Math.PI * M, 1, TOL)
    }
  }),
  // Smarr relation for Schwarzschild: M = 2 T S. T S = (1/(8 pi M))(4 pi M^2) = M/2.
  check('the Smarr relation M = 2 T S holds', () => {
    for (const M of [0.5, 1, 3]) {
      close(2 * hawkingTemperature(M) * schwarzschildEntropy(M), M, TOL)
    }
  }),
  // L = A T^4 = 1 / (256 pi^3 M^2), so L ~ M^-2: L(1)/L(2) = 4.
  check('luminosity is 1 / (256 pi^3 M^2) and scales as M^-2', () => {
    close(horizonLuminosity(1), 1 / (256 * Math.PI ** 3), TOL)
    close(horizonLuminosity(1) / horizonLuminosity(2), 4, TOL)
  }),
  // Integrating dM/dt = -L ~ -M^-2 gives lifetime ~ M^3, so doubling M octuples the lifetime.
  check('evaporation lifetime scales as M^3 (doubling M gives ~8x)', () => {
    const t1 = schwarzschildEvaporationLifetime({ mass: 1 })
    const t2 = schwarzschildEvaporationLifetime({ mass: 2 })
    close(t2 / t1, 8, 0.2)
  }),
])

suite('measure/black-hole-thermodynamics: de Sitter', [
  // radius 1/H, area 4 pi / H^2, entropy pi / H^2, temperature H / 2pi, Lambda = 3 H^2.
  check('the Gibbons-Hawking horizon set for H = 2', () => {
    const d = deSitterHorizon(2)
    close(d.radius, 0.5, TOL)
    close(d.area, Math.PI, TOL)
    close(d.entropy, Math.PI / 4, TOL)
    close(d.temperature, 1 / Math.PI, TOL)
    close(d.cosmologicalConstant, 12, TOL)
  }),
  // entropy is always A/4, temperature is kappa/2pi with kappa = H.
  check('entropy is A/4 and Lambda = 3 H^2 across H', () => {
    for (const H of [0.5, 1, 3]) {
      const d = deSitterHorizon(H)
      close(d.entropy, d.area / 4, TOL)
      close(d.cosmologicalConstant, 3 * H * H, TOL)
      close(d.temperature, H / (2 * Math.PI), TOL)
    }
  }),
])
