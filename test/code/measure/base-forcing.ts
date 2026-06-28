// Conformance for code/measure/base-forcing. The two base choices (ternary tone, four dimensions)
// are forced facts we can re-derive: the minimal alphabet with both a vacuum and charge conjugation
// is {-1,0,+1} (size 3), and the D_n Dynkin diagram has an order-6 automorphism group (triality)
// only at n = 4. We check the predicates and the automorphism counts directly.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  toneAlphabetQualifies,
  minimalQualifyingAlphabetSize,
  dynkinAutomorphismOrder,
  hasTriality,
} from '@/code/measure/base-forcing'

suite('measure/base-forcing: tone alphabet', [
  check('ternary qualifies (vacuum + charge conjugation)', () => {
    ok(toneAlphabetQualifies([-1, 0, 1]))
  }),
  check('binary {0,1} has no charge conjugation', () => {
    notOk(toneAlphabetQualifies([0, 1]))
  }),
  check('signs {-1,1} have no vacuum', () => {
    notOk(toneAlphabetQualifies([-1, 1]))
  }),
  check('{0} alone is trivial (no nonzero element)', () => {
    notOk(toneAlphabetQualifies([0]))
  }),
  check('the minimal qualifying alphabet has size 3', () => {
    equal(minimalQualifyingAlphabetSize(), 3)
  }),
])

suite('measure/base-forcing: Dynkin triality', [
  // D4 fixes the center node and freely permutes the three leaves: |Aut| = 3! = 6.
  check('D4 automorphism group has order 6 (S3 triality)', () => {
    equal(dynkinAutomorphismOrder(4), 6)
  }),
  // D5 is a chain forking at one end: only the two terminal fork leaves can swap, order 2.
  check('D5 automorphism group has order 2', () => {
    equal(dynkinAutomorphismOrder(5), 2)
  }),
  check('D6 automorphism group has order 2', () => {
    equal(dynkinAutomorphismOrder(6), 2)
  }),
  check('triality holds only at n = 4', () => {
    ok(hasTriality(4))
    notOk(hasTriality(3))
    notOk(hasTriality(5))
    notOk(hasTriality(6))
  }),
])
