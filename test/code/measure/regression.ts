// Conformance for code/measure/regression: the least-squares fits that read scaling
// exponents off experiment data. Every fit is checked against DATA WITH A KNOWN
// answer (y = x^k has log-log slope k, y = m x + b has slope m / intercept b / r2 = 1),
// never against the implementation's own output. Guard cases (zero variance, too few
// usable points) must return a defined 0, not NaN.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  logLogSlope,
  powerLawExponent,
  linearFit,
  fitForm,
  loglogExponentWindow,
  powerLawFit,
  localForceLawExponent,
} from '@/code/measure/regression'

const TIGHT = 1e-9

suite('measure/regression: logLogSlope', [
  check('y = x^2 has log-log slope exactly 2', () => {
    const xs = [1, 2, 3, 4, 5, 6]
    const ys = xs.map(x => x * x)
    close(logLogSlope(xs, ys), 2, TIGHT)
  }),
  check('y = x^3 has log-log slope exactly 3', () => {
    const xs = [1, 2, 3, 4, 5, 6]
    const ys = xs.map(x => x ** 3)
    close(logLogSlope(xs, ys), 3, TIGHT)
  }),
  check('a flat profile (constant y) has slope 0', () => {
    close(logLogSlope([1, 2, 3, 4], [5, 5, 5, 5]), 0, TIGHT)
  }),
  check('guard: identical x (zero variance) returns 0 not NaN', () => {
    equal(logLogSlope([2, 2, 2], [1, 2, 3]), 0)
  }),
])

suite('measure/regression: powerLawExponent', [
  check('ballistic spread ~ t has exponent 1', () => {
    const times = [1, 2, 3, 4, 5]
    const spreads = times.map(t => t)
    close(powerLawExponent({ times, spreads }), 1, TIGHT)
  }),
  check(
    'diffusive spread ~ t^2 has exponent 2 (and drops the t=1 zero point)',
    () => {
      // spread = t^2 for t in 2..5, but spread 0 at t=1 must be DROPPED (no log),
      // leaving a clean t^2 fit on the survivors -> exponent exactly 2.
      const times = [1, 2, 3, 4, 5]
      const spreads = [0, 4, 9, 16, 25]
      close(powerLawExponent({ times, spreads }), 2, TIGHT)
    },
  ),
  check('sub-diffusive spread ~ sqrt(t) has exponent 1/2', () => {
    const times = [1, 2, 3, 4, 5, 6]
    const spreads = times.map(t => Math.sqrt(t))
    close(powerLawExponent({ times, spreads }), 0.5, TIGHT)
  }),
  check(
    'guard: fewer than two usable (positive) points returns 0',
    () => {
      equal(powerLawExponent({ times: [1, 2], spreads: [0, 5] }), 0)
      equal(
        powerLawExponent({ times: [1, 2, 3], spreads: [0, 0, 0] }),
        0,
      )
    },
  ),
])

suite('measure/regression: linearFit', [
  check(
    'y = 3x + 1 recovers slope 3, intercept 1, r2 = 1, residual 0',
    () => {
      const xs = [0, 1, 2, 3, 4, 5]
      const ys = xs.map(x => 3 * x + 1)
      const fit = linearFit({ xs, ys })
      close(fit.slope, 3, TIGHT)
      close(fit.intercept, 1, TIGHT)
      close(fit.residual, 0, TIGHT)
      close(fit.r2, 1, TIGHT)
    },
  ),
  check('a negative-slope line is recovered exactly', () => {
    const xs = [1, 2, 3, 4]
    const ys = xs.map(x => -2 * x + 7)
    const fit = linearFit({ xs, ys })
    close(fit.slope, -2, TIGHT)
    close(fit.intercept, 7, TIGHT)
    close(fit.r2, 1, TIGHT)
  }),
  check('guard: constant y gives slope 0 and r2 0 (ssTot = 0)', () => {
    const fit = linearFit({ xs: [1, 2, 3], ys: [7, 7, 7] })
    close(fit.slope, 0, TIGHT)
    close(fit.intercept, 7, TIGHT)
    equal(fit.r2, 0)
  }),
])

suite('measure/regression: fitForm', [
  check(
    'y = 2*f(x) + 3 with f = identity recovers a = 2, r2 = 1',
    () => {
      const x = [1, 2, 3, 4, 5]
      const y = x.map(v => 2 * v + 3)
      const out = fitForm(x, y, v => v)
      close(out.a, 2, TIGHT)
      close(out.r2, 1, TIGHT)
    },
  ),
  check('y = 5*(1/x) fits the 1/x basis with a = 5, r2 = 1', () => {
    const x = [1, 2, 4, 5, 8]
    const y = x.map(v => 5 / v)
    const out = fitForm(x, y, v => 1 / v)
    close(out.a, 5, TIGHT)
    close(out.r2, 1, TIGHT)
  }),
  check('guard: constant basis (zero variance) returns a = 0', () => {
    equal(fitForm([1, 2, 3], [1, 2, 3], () => 5).a, 0)
  }),
])

suite('measure/regression: loglogExponentWindow', [
  check('values[t] = t^2 over window [1,5] has slope 2', () => {
    const values = [0, 1, 4, 9, 16, 25]
    close(loglogExponentWindow({ values, lo: 1, hi: 5 }), 2, TIGHT)
  }),
  check(
    'a non-positive sample inside the window is dropped, slope stays 2',
    () => {
      // t = 3 set to 0 (dropped); survivors t = 1,2,4,5 still lie on t^2.
      const values = [0, 1, 4, 0, 16, 25]
      close(loglogExponentWindow({ values, lo: 1, hi: 5 }), 2, TIGHT)
    },
  ),
  check('guard: an all-zero window returns 0 not NaN', () => {
    equal(
      loglogExponentWindow({ values: [0, 0, 0, 0], lo: 1, hi: 3 }),
      0,
    )
  }),
])

suite('measure/regression: powerLawFit', [
  check(
    'a clean y = x^2 gives exponent 2 and ~zero max deviation',
    () => {
      const xs = [1, 2, 3, 4, 5, 6]
      const ys = xs.map(x => x * x)
      const out = powerLawFit({ xs, ys })
      close(out.exponent, 2, TIGHT)
      close(out.maxDeviation, 0, TIGHT)
    },
  ),
  check('guard: identical x returns exponent 0', () => {
    equal(powerLawFit({ xs: [3, 3, 3], ys: [1, 2, 3] }).exponent, 0)
  }),
])

suite('measure/regression: localForceLawExponent', [
  check(
    'an inverse-square force (potential 1/r) reads exponent -2',
    () => {
      // force = -dG/dr of G = 1/r is 1/r^2, whose local log-log slope is -2.
      close(
        localForceLawExponent({ potential: r => 1 / r, r: 1 }),
        -2,
        1e-3,
      )
    },
  ),
  check(
    'a 4D short-range force (potential 1/r^2) reads exponent -3',
    () => {
      close(
        localForceLawExponent({ potential: r => 1 / (r * r), r: 1 }),
        -3,
        1e-3,
      )
    },
  ),
])
