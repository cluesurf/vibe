// Conformance for code/measure/tone-entropy. ternaryToneEntropyBits is the Shannon entropy (bits) of
// the {-1,0,+1} histogram over chosen indices: log2(3) when the three tones are equally likely, 1 bit
// for two equally likely tones, 0 for a pure region. Re-derived from -sum p log2 p.

import { suite, check, equal, close } from '@/test/code/harness'
import { ternaryToneEntropyBits } from '@/code/measure/tone-entropy'

const TOL = 1e-12

suite('measure/tone-entropy: ternaryToneEntropyBits', [
  check('a uniform ternary region has entropy log2(3)', () => {
    const v = Int8Array.from([-1, 0, 1])
    close(ternaryToneEntropyBits(v, [0, 1, 2]), Math.log2(3), TOL)
  }),
  check('two equally likely tones carry 1 bit', () => {
    const v = Int8Array.from([-1, 1])
    close(ternaryToneEntropyBits(v, [0, 1]), 1, TOL)
  }),
  check('a pure region carries 0 bits', () => {
    const v = Int8Array.from([1, 1, 1])
    close(ternaryToneEntropyBits(v, [0, 1, 2]), 0, TOL)
  }),
  check('an empty index set is 0', () => {
    equal(ternaryToneEntropyBits(Int8Array.from([1, 0, -1]), []), 0)
  }),
])
