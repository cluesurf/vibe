// Conformance for code/coarse/level-stack: the renormalization tower's scale accounting. The effective
// vibe count is N_top times the product of the per-level compressions (a flat tower of constant C over
// L levels gives N_top * C^L), and a level is clean only when it really compresses (C > 1) and its
// effective rule commutes within the error bound.

import {
  suite,
  check,
  equal,
  close,
  ok,
  notOk,
} from '@/test/code/harness'
import {
  effectiveVibeCount,
  isCleanLevel,
  type Level,
} from '@/code/coarse/level-stack'

const lv = (compression: number, commutingError: number): Level => ({
  level: 0,
  unitCount: 0,
  compression,
  commutingError,
})

suite('coarse/level-stack: effective vibe count', [
  // product of compressions: 10 * 2 * 3 = 60.
  check('effective count multiplies the per-level compressions', () => {
    close(
      effectiveVibeCount({
        topUnits: 10,
        levels: [lv(2, 0), lv(3, 0)],
      }),
      60,
      1e-9,
    )
  }),
  // flat tower: 10 * 4^3 = 640.
  check('a flat tower gives N_top * C^L', () => {
    close(
      effectiveVibeCount({
        topUnits: 10,
        levels: [lv(4, 0), lv(4, 0), lv(4, 0)],
      }),
      640,
      1e-9,
    )
  }),
  // no levels: just the top units.
  check('an empty stack is the top units', () => {
    equal(effectiveVibeCount({ topUnits: 7, levels: [] }), 7)
  }),
])

suite('coarse/level-stack: clean-level criterion', [
  check('a compressing, commuting level is clean', () => {
    ok(isCleanLevel({ level: lv(2, 0.1) }))
  }),
  check('a non-compressing level is not clean', () => {
    notOk(
      isCleanLevel({ level: lv(1, 0) }),
      'compression must exceed 1',
    )
  }),
  check('a high-error level is not clean', () => {
    notOk(
      isCleanLevel({ level: lv(3, 0.3) }),
      'error 0.3 exceeds default bound 0.25',
    )
  }),
  check('the error bound is configurable', () => {
    ok(isCleanLevel({ level: lv(3, 0.3), errorBound: 0.5 }))
  }),
])
