// Conformance for code/operator/substrate-gate: logic gates as fixed points of the
// model's own asynchronous signed-majority dynamics. Facts:
//   - a settled NAND gate reads the NAND truth table for all four input combinations.
//   - a settled NOT gate reads the NOT truth table.
//   - the settled configuration is a genuine fixed point of the rule.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  makeCircuit,
  clampedBus,
  nandBus,
  notBus,
  settle,
  isFixedPoint,
  busValue,
} from '@/code/operator/substrate-gate'
import type { Bit } from '@/code/operator/logic-gate'

const BITS: Bit[] = [-1, 1]

suite('operator/substrate-gate: NAND gate', [
  check('a settled NAND gate matches the NAND truth table', () => {
    for (const a of BITS) {
      for (const b of BITS) {
        const c = makeCircuit()
        const A = clampedBus(c, a, 4)
        const B = clampedBus(c, b, 4)
        // bias width = min(|A|,|B|) = 4, so the margin is 4 > outWidth 1.
        const O = nandBus(c, A, B, 1)
        const tone = settle(c, { seed: 1 })

        ok(
          isFixedPoint(c, tone),
          `settled config is a fixed point for (${a},${b})`,
        )

        const expected: Bit = a === 1 && b === 1 ? -1 : 1

        equal(busValue(tone, O), expected, `nand(${a},${b})`)
      }
    }
  }),
])

suite('operator/substrate-gate: NOT gate', [
  check('a settled NOT gate matches the NOT truth table', () => {
    for (const x of BITS) {
      const c = makeCircuit()
      const X = clampedBus(c, x, 3)
      const G = notBus(c, X, 1)
      const tone = settle(c, { seed: 2 })

      ok(
        isFixedPoint(c, tone),
        `settled config is a fixed point for x=${x}`,
      )
      equal(busValue(tone, G), x === 1 ? -1 : 1, `not(${x})`)
    }
  }),
])
