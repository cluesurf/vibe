// Conformance for code/measure/wilson-loop. The independently-derivable observable here is the
// Creutz ratio chi = -ln[(W(2,2) W(1,1)) / (W(2,1) W(1,2))], and its guard that returns 0 when any
// loop average is non-positive (the logarithm would be undefined). The Wilson loop phase/value run on
// a GaugeField and are exercised by the gauge-field tests. We re-derive the Creutz ratio in closed
// form.

import { suite, check, equal, close } from '@/test/code/harness'
import { creutzRatioFromLoops } from '@/code/measure/wilson-loop'

const TOL = 1e-12

suite('measure/wilson-loop: creutzRatioFromLoops', [
  check('a flat field (all loops 1) has zero tension', () => {
    equal(
      creutzRatioFromLoops({ loop11: 1, loop21: 1, loop12: 1, loop22: 1 }),
      0,
    )
  }),
  check('matches the closed form -ln(num/den)', () => {
    // num = W22*W11 = 0.5*0.5 = 0.25, den = W21*W12 = 0.5*1 = 0.5 -> -ln(0.5) = ln 2.
    close(
      creutzRatioFromLoops({ loop11: 0.5, loop21: 0.5, loop12: 1, loop22: 0.5 }),
      Math.LN2,
      TOL,
    )
  }),
  check('a non-positive loop average yields 0 (log undefined)', () => {
    equal(
      creutzRatioFromLoops({ loop11: 0.5, loop21: 0.5, loop12: 0.5, loop22: -1 }),
      0,
    )
  }),
])
