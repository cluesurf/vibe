// Conformance for code/control/null: the random-null baselines. A null must (1) preserve the tone
// multiset and the total charge exactly (it only permutes slots), (2) be deterministic in its seed
// (same seed -> identical), and (3) be a genuine NEGATIVE: it destroys the spatial structure, so a
// structured input is actually rearranged. All re-derived from the permutation property.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  randomNull,
  preservesCharge,
  shuffledToneField,
} from '@/code/control/null'
import { squareMesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, charge } from '@/code/tone/will'
import { makeRng } from '@/code/tool/rng'

// the sorted multiset of an Int8Array, the invariant a permutation must preserve.
function multiset(data: Int8Array): number[] {
  return Array.from(data).sort((a, b) => a - b)
}

function structuredWill() {
  const will = makeWill(squareMesh({ side: 4 }))

  fillWillPattern(will)

  return will
}

suite('control/null: randomNull is a charge-preserving permutation', [
  check('the total charge is preserved exactly', () => {
    const will = structuredWill()

    equal(
      charge(randomNull(will, 123)),
      charge(will),
      'shuffle conserves charge',
    )
    ok(preservesCharge(will, 123), 'preservesCharge agrees')
  }),
  check('the tone multiset is preserved exactly', () => {
    const will = structuredWill()
    const shuffled = randomNull(will, 99)

    equal(
      JSON.stringify(multiset(shuffled.data)),
      JSON.stringify(multiset(will.data)),
      'a permutation keeps the histogram',
    )
  }),
  check('the same seed gives an identical null', () => {
    const will = structuredWill()
    const a = randomNull(will, 7)
    const b = randomNull(will, 7)

    equal(
      JSON.stringify(Array.from(a.data)),
      JSON.stringify(Array.from(b.data)),
    )
  }),
  check('the null genuinely destroys structure', () => {
    const will = structuredWill()
    const shuffled = randomNull(will, 31)

    let differs = false

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== shuffled.data[i]) {
        differs = true
        break
      }
    }

    ok(differs, 'a structured input is actually rearranged')
  }),
])

suite('control/null: shuffledToneField', [
  check(
    'the shuffled field preserves the multiset and total charge',
    () => {
      const tone = Int8Array.from([1, 1, 0, -1, 1, 0, -1, -1, 0, 1])
      const out = shuffledToneField({ tone, rng: makeRng({ seed: 5 }) })

      equal(
        JSON.stringify(multiset(out)),
        JSON.stringify(multiset(tone)),
        'multiset preserved',
      )

      const sum = (a: Int8Array): number =>
        Array.from(a).reduce((x, y) => x + y, 0)

      equal(sum(out), sum(tone), 'total charge preserved')
    },
  ),
  check('shuffledToneField is deterministic in its rng', () => {
    const tone = Int8Array.from([1, 1, 0, -1, 1, 0, -1, -1, 0, 1])
    const a = shuffledToneField({ tone, rng: makeRng({ seed: 5 }) })
    const b = shuffledToneField({ tone, rng: makeRng({ seed: 5 }) })

    equal(JSON.stringify(Array.from(a)), JSON.stringify(Array.from(b)))
  }),
])
