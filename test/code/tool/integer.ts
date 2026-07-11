// Conformance for code/tool/integer: the non-negative modulo. The language's %
// keeps the dividend's sign, so modulo(value, m) must always land in [0, m). We
// re-derive the answer two independent ways: small hand values, and the floored
// modulo identity value - m * floor(value / m), which is the mathematical
// definition the function claims to implement.

import { suite, check, equal, ok } from '@/test/code/harness'
import { modulo } from '@/code/tool/integer'

// The mathematical floored modulo, an independent second route (NOT the impl).
function flooredModulo(value: number, modulus: number): number {
  return value - modulus * Math.floor(value / modulus)
}

// Hand-computed (value, modulus, expected) triples, the negatives most of all.
const HAND: [number, number, number][] = [
  [7, 3, 1],
  [10, 4, 2],
  [0, 5, 0],
  [5, 5, 0],
  [-1, 3, 2],
  [-3, 3, 0],
  [-4, 3, 2],
  [-5, 5, 0],
  [-7, 4, 1],
  [-6, 6, 0],
  [12, 12, 0],
  [-1, 1, 0],
]

suite('tool/integer: modulo', [
  ...HAND.map(([value, modulus, expected]) =>
    check(`modulo(${value}, ${modulus}) = ${expected}`, () => {
      equal(modulo(value, modulus), expected, 'hand value')
    }),
  ),
  check(
    'agrees with the floored-modulo identity over a wide range',
    () => {
      for (let modulus = 1; modulus <= 13; modulus++) {
        for (let value = -50; value <= 50; value++) {
          equal(
            modulo(value, modulus),
            flooredModulo(value, modulus),
            `modulo(${value}, ${modulus})`,
          )
        }
      }
    },
  ),
  check('result is always in [0, modulus)', () => {
    for (let modulus = 1; modulus <= 13; modulus++) {
      for (let value = -50; value <= 50; value++) {
        const r = modulo(value, modulus)

        ok(
          r >= 0 && r < modulus,
          `modulo(${value}, ${modulus}) out of range: ${r}`,
        )
      }
    }
  }),
  check('value minus result is a multiple of modulus', () => {
    for (let modulus = 1; modulus <= 13; modulus++) {
      for (let value = -50; value <= 50; value++) {
        const r = modulo(value, modulus)

        equal(
          (value - r) % modulus,
          0,
          `(${value} - ${r}) not divisible by ${modulus}`,
        )
      }
    }
  }),
])
