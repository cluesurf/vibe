// Conformance for code/measure/shadow-gravity: the Le Sage geometry. The Fibonacci-sphere directions
// are unit vectors with a near-zero centroid. The isotropic shadow fraction is the body's solid angle
// (1 - cos theta)/2 with sin theta = a/r, so it falls as ~1/r^2; the directional (columnar) shadow is
// the area ratio a^2/beam^2, distance-independent. The Le Sage drag averages to -velocity/3 (first
// order in velocity). distanceExponent is checked against an exact power law.

import { suite, check, close, equal, ok } from '@/test/code/harness'
import {
  fibonacciSphereDirections,
  isotropicShadowFraction,
  directionalShadowFraction,
  leSageDrag,
  distanceExponent,
} from '@/code/measure/shadow-gravity'

suite('measure/shadow-gravity: Fibonacci directions', [
  // Every direction is a unit vector.
  check('the directions are unit vectors', () => {
    const dirs = fibonacciSphereDirections(500)

    equal(dirs.length, 500)

    for (const d of dirs)
      close(Math.hypot(d[0]!, d[1]!, d[2]!), 1, 1e-9)
  }),
  // A near-uniform sphere sampling has a centroid near the origin.
  check('the centroid is near the origin', () => {
    const dirs = fibonacciSphereDirections(20000)
    const sum = [0, 0, 0]

    for (const d of dirs) {
      sum[0]! += d[0]!
      sum[1]! += d[1]!
      sum[2]! += d[2]!
    }

    const mean = sum.map(s => s / dirs.length)

    ok(
      Math.hypot(mean[0]!, mean[1]!, mean[2]!) < 0.01,
      `centroid ${String(mean)}`,
    )
  }),
])

suite('measure/shadow-gravity: isotropic (1/r^2) shadow', [
  // The blocked fraction is the body's solid angle: (1 - cos theta)/2 with sin theta = a/r.
  check('the fraction matches the solid-angle cap', () => {
    const dirs = fibonacciSphereDirections(200000)
    const a = 1

    for (const r of [6, 10]) {
      const f = isotropicShadowFraction({
        directions: dirs,
        bodyDistance: r,
        bodyRadius: a,
      })

      const expected = (1 - Math.sqrt(1 - (a / r) ** 2)) / 2

      close(f, expected, expected * 0.1)
    }
  }),
  // The fraction falls as ~1/r^2: the log-log distance exponent is near -2.
  check('the isotropic shadow falls as ~1/r^2', () => {
    const dirs = fibonacciSphereDirections(200000)
    const rs = [5, 7, 10, 14, 20]
    const fs = rs.map(r =>
      isotropicShadowFraction({
        directions: dirs,
        bodyDistance: r,
        bodyRadius: 1,
      }),
    )

    close(distanceExponent(rs, fs), -2, 0.2)
  }),
])

suite('measure/shadow-gravity: directional (columnar) shadow', [
  // A parallel beam: the body blocks its own cross section, fraction = a^2 / beam^2.
  check('the directional fraction is the area ratio a^2/beam^2', () => {
    const f = directionalShadowFraction({
      bodyRadius: 1,
      beamRadius: 4,
      steps: 600,
    })

    close(f, 1 / 16, 1e-3)
  }),
])

suite('measure/shadow-gravity: Le Sage drag', [
  // Mean over the sphere of -(1 + v d_x) d_x = -v/3 (mean d_x = 0, mean d_x^2 = 1/3).
  check('the drag is -velocity/3, first order in velocity', () => {
    const dirs = fibonacciSphereDirections(60000)

    close(leSageDrag({ directions: dirs, velocity: 0 }), 0, 0.01)
    close(leSageDrag({ directions: dirs, velocity: 0.6 }), -0.2, 0.01)
    close(leSageDrag({ directions: dirs, velocity: 0.9 }), -0.3, 0.01)
  }),
])

suite('measure/shadow-gravity: distanceExponent', [
  // Exact power laws: r^-2 and r^-1.
  check('it recovers exact log-log exponents', () => {
    close(distanceExponent([1, 2, 4], [1, 0.25, 0.0625]), -2, 1e-12)
    close(distanceExponent([1, 2, 4], [1, 0.5, 0.25]), -1, 1e-12)
  }),
])
