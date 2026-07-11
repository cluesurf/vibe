// Conformance for code/tone/alphabet: the finite tone alphabets. slotsPerElement and
// valueCount are fixed by the alphabet kind, and randomValue is a deterministic map of
// a given u into the alphabet's range. We check the slot/value counts against the
// definitions and that randomValue, for hand-chosen u, lands on the expected value and
// always stays inside the alphabet. Exact (integer codes and counts).

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  Alphabet,
  slotsPerElement,
  valueCount,
  randomValue,
} from '@/code/tone/alphabet'

suite('tone/alphabet: slot and value counts', [
  check(
    'slotsPerElement is 1 except spinor, which stores its components',
    () => {
      equal(slotsPerElement({ form: 'boolean' }), 1, 'boolean')
      equal(slotsPerElement({ form: 'ternary' }), 1, 'ternary')
      equal(slotsPerElement({ form: 'clock', q: 7 }), 1, 'clock')
      equal(
        slotsPerElement({ form: 'spinor', components: 4 }),
        4,
        'spinor',
      )
    },
  ),
  check('valueCount matches each alphabet definition', () => {
    equal(valueCount({ form: 'boolean' }), 2, 'boolean {0,1}')
    equal(valueCount({ form: 'ternary' }), 3, 'ternary {-1,0,1}')
    equal(valueCount({ form: 'clock', q: 12 }), 12, 'clock Z_12')
    equal(
      valueCount({ form: 'spinor', components: 4 }),
      3,
      'spinor ternary amplitudes',
    )
  }),
])

suite('tone/alphabet: randomValue mapping', [
  check('ternary: u in thirds maps to -1, 0, +1', () => {
    const a: Alphabet = { form: 'ternary' }

    equal(randomValue({ alphabet: a, u: 0 }), -1, 'u=0 -> -1')
    equal(randomValue({ alphabet: a, u: 0.5 }), 0, 'u=0.5 -> 0')
    equal(randomValue({ alphabet: a, u: 0.99 }), 1, 'u=0.99 -> +1')
  }),
  check('boolean: u < 0.5 -> 0 else 1', () => {
    const a: Alphabet = { form: 'boolean' }

    equal(randomValue({ alphabet: a, u: 0 }), 0, 'u=0 -> 0')
    equal(randomValue({ alphabet: a, u: 0.49 }), 0, 'u=0.49 -> 0')
    equal(randomValue({ alphabet: a, u: 0.5 }), 1, 'u=0.5 -> 1')
    equal(randomValue({ alphabet: a, u: 0.99 }), 1, 'u=0.99 -> 1')
  }),
  check('clock Z_q: u maps to floor(u*q), staying in [0, q)', () => {
    const a: Alphabet = { form: 'clock', q: 5 }

    equal(randomValue({ alphabet: a, u: 0 }), 0, 'u=0 -> 0')
    equal(randomValue({ alphabet: a, u: 0.99 }), 4, 'u=0.99 -> 4')

    for (let i = 0; i < 100; i++) {
      const v = randomValue({ alphabet: a, u: i / 100 })

      ok(v >= 0 && v < 5, `clock value out of range: ${v}`)
    }
  }),
  check('ternary values always stay in {-1,0,1}', () => {
    const a: Alphabet = { form: 'ternary' }

    for (let i = 0; i < 100; i++) {
      const v = randomValue({ alphabet: a, u: i / 100 })

      ok(
        v === -1 || v === 0 || v === 1,
        `ternary value out of range: ${v}`,
      )
    }
  }),
])
