// Conformance for code/measure/associative-memory (vector-symbolic memory). The recall accuracy is
// deterministic (a fixed integer hash). The rigorously-derivable case is a SINGLE stored binding:
// the memory vector is exactly key*value, so unbinding returns value bit-for-bit and the cleanup
// always lands on the one stored value, giving accuracy 1 at every dimension. We also check the
// result stays a valid fraction for a few-items, large-dimension configuration.

import { suite, check, equal, ok } from '@/test/code/harness'
import { vsaRecallAccuracy } from '@/code/measure/associative-memory'

suite('measure/associative-memory: vsaRecallAccuracy', [
  check(
    'a single binding is recalled perfectly at any dimension',
    () => {
      // memory = sign(key*value) = key*value (single term); unbind: memory*key = value exactly.
      equal(vsaRecallAccuracy({ dim: 4, items: 1 }), 1)
      equal(vsaRecallAccuracy({ dim: 16, items: 1 }), 1)
      equal(vsaRecallAccuracy({ dim: 64, items: 1 }), 1)
    },
  ),
  check('accuracy is a fraction in [0,1]', () => {
    const a = vsaRecallAccuracy({ dim: 128, items: 5 })
    ok(a >= 0 && a <= 1)
  }),
])
