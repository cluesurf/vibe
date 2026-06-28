// Conformance for code/measure/numerology-density: the count of formulas a pi^3 + b pi^2 + c pi + d
// (small integer coefficients) landing within epsilon of a target. The count is verified on inputs
// with a hand-countable answer, shown monotone in epsilon, and confirmed to contain the famous
// 4 pi^3 + pi^2 + pi = 137.036 hit.

import { suite, check, equal, ok } from '@/test/code/harness'
import { closedFormHitCount } from '@/code/measure/numerology-density'

suite('measure/numerology-density: hit counting', [
  // With only the constant free (k=0) and target 0, the single hit is d=0.
  check('only d=0 hits target 0 when no pi terms are allowed', () => {
    equal(
      closedFormHitCount({ target: 0, epsilon: 0.5, maxCoefficient: 0, maxConstant: 2 }),
      1,
    )
  }),
  // pi^3 = 31.006...: a=1 (others 0) hits exactly; no other small combination is within 0.01.
  check('pi^3 is hit exactly once', () => {
    equal(
      closedFormHitCount({
        target: Math.PI ** 3,
        epsilon: 0.01,
        maxCoefficient: 1,
        maxConstant: 0,
      }),
      1,
    )
  }),
  // 2 pi needs a coefficient of 2 on pi, unreachable with maxCoefficient 1 and no constant.
  check('2 pi has no hit in the {-1,0,1} family without a constant', () => {
    equal(
      closedFormHitCount({
        target: 2 * Math.PI,
        epsilon: 0.01,
        maxCoefficient: 1,
        maxConstant: 0,
      }),
      0,
    )
  }),
  // The famous coincidence 4 pi^3 + pi^2 + pi = 137.036 is inside the family.
  check('the 137.036 family contains the famous formula', () => {
    ok(
      closedFormHitCount({
        target: 137.036,
        epsilon: 0.01,
        maxCoefficient: 4,
        maxConstant: 1,
      }) >= 1,
      'the famous 4 pi^3 + pi^2 + pi formula should be counted',
    )
  }),
  // More slack means at least as many hits (the count is monotone in epsilon).
  check('the count is monotone in epsilon', () => {
    const wide = closedFormHitCount({
      target: 137.036,
      epsilon: 1,
      maxCoefficient: 3,
      maxConstant: 3,
    })
    const narrow = closedFormHitCount({
      target: 137.036,
      epsilon: 0.1,
      maxCoefficient: 3,
      maxConstant: 3,
    })
    ok(wide >= narrow, `wider epsilon should not reduce hits: ${wide} >= ${narrow}`)
  }),
])
