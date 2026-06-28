// Conformance for code/measure/standard-model-charges: the 16 fermions of one generation
// (the so(10) spinor) and the group-theory numbers they force. The counts and ratios are
// exact rational facts, re-derived here by hand: the generation has 16 Weyl fermions, the
// GUT-normalized weak mixing angle is sin^2(theta_W) = sum T_3^2 / sum Q^2 = 3/8, and the
// hypercharge trace sum mult (Q - T_3) vanishes.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  generationFermionCount,
  weinbergAngleAtUnification,
  hyperchargeTrace,
  STANDARD_MODEL_GENERATION,
} from '@/code/measure/standard-model-charges'

const TOL = 1e-12

suite('measure/standard-model-charges', [
  // 3 + 3 + 1 + 1 + 3 + 3 + 1 + 1 = 16.
  check('one generation has 16 Weyl fermions', () => {
    equal(generationFermionCount(), 16)
  }),
  // sum mult T_3^2 = 2, sum mult Q^2 = 16/3, ratio = 2 / (16/3) = 3/8.
  check('the unification weak mixing angle is 3/8', () => {
    close(weinbergAngleAtUnification(), 3 / 8, TOL)
  }),
  // Independent hand-sum of the two moments behind the ratio.
  check('the moment sums behind 3/8 are 2 and 16/3', () => {
    const sumT3sq = STANDARD_MODEL_GENERATION.reduce(
      (s, f) => s + f.mult * f.t3 * f.t3,
      0,
    )
    const sumQsq = STANDARD_MODEL_GENERATION.reduce(
      (s, f) => s + f.mult * f.q * f.q,
      0,
    )
    close(sumT3sq, 2, TOL)
    close(sumQsq, 16 / 3, TOL)
  }),
  // Tr Y = sum mult (Q - T_3) = 0 over the 16.
  check('the hypercharge trace vanishes', () => {
    close(hyperchargeTrace(), 0, TOL)
  }),
])
