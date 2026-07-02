// Conformance for code/tone/configuration: a dense tone assignment over elements. We
// check the storage layout (values length = size * slotsPerElement), the empty default
// (all zero, no rng), the getTone/setTone index round-trip including the spinor slot
// offset, and that cloneConfiguration is an independent copy. All exact.

import { suite, check, equal, ok } from '@/test/code/harness'
import { slotsPerElement } from '@/code/tone/alphabet'
import {
  makeConfiguration,
  getTone,
  setTone,
  cloneConfiguration,
} from '@/code/tone/configuration'

suite('tone/configuration: storage', [
  check(
    'slots = slotsPerElement and values length = size * slots',
    () => {
      const c = makeConfiguration({
        alphabet: { form: 'ternary' },
        size: 10,
      })

      equal(c.slots, slotsPerElement(c.alphabet), 'slots from alphabet')
      equal(c.values.length, c.size * c.slots, 'values length')
    },
  ),
  check(
    'spinor configuration stores components slots per element',
    () => {
      const c = makeConfiguration({
        alphabet: { form: 'spinor', components: 4 },
        size: 6,
      })

      equal(c.slots, 4, 'four slots per element')
      equal(c.values.length, 6 * 4, 'dense length size * components')
    },
  ),
  check('without an rng every value is zero', () => {
    const c = makeConfiguration({
      alphabet: { form: 'ternary' },
      size: 8,
    })

    for (let i = 0; i < c.values.length; i++) {
      equal(c.values[i], 0, `value ${i} default zero`)
    }
  }),
])

suite('tone/configuration: get / set / clone', [
  check('setTone then getTone round-trips at element and slot', () => {
    const c = makeConfiguration({
      alphabet: { form: 'spinor', components: 3 },
      size: 5,
    })

    setTone(c, { element: 2, slot: 0, value: 1 })
    setTone(c, { element: 2, slot: 2, value: -1 })
    equal(getTone(c, { element: 2, slot: 0 }), 1, 'slot 0')
    equal(getTone(c, { element: 2, slot: 1 }), 0, 'slot 1 untouched')
    equal(getTone(c, { element: 2, slot: 2 }), -1, 'slot 2')
    // verify the raw index is element*slots + slot
    equal(c.values[2 * c.slots + 2], -1, 'raw index layout')
  }),
  check('default slot is 0', () => {
    const c = makeConfiguration({
      alphabet: { form: 'ternary' },
      size: 4,
    })

    setTone(c, { element: 1, value: 1 })
    equal(getTone(c, { element: 1 }), 1, 'default-slot round-trip')
  }),
  check('cloneConfiguration is an independent copy', () => {
    const c = makeConfiguration({
      alphabet: { form: 'ternary' },
      size: 4,
    })

    setTone(c, { element: 0, value: 1 })

    const copy = cloneConfiguration(c)
    setTone(copy, { element: 0, value: -1 })
    equal(getTone(c, { element: 0 }), 1, 'original unchanged')
    equal(getTone(copy, { element: 0 }), -1, 'copy changed')
    ok(c.values !== copy.values, 'distinct backing arrays')
  }),
])
