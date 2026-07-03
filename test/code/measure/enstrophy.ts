// Conformance for code/measure/enstrophy. The enstrophy is the sum over all slots of tone squared,
// which for ternary tone {-1,0,+1} is exactly the count of nonzero slots. We check it on a known
// buffer (reading only will.data, the only field enstrophy touches).

import { suite, check, equal } from '@/test/code/harness'
import { Will } from '@/code/tone/will'
import { enstrophy } from '@/code/measure/enstrophy'

const willOf = (data: number[]): Will =>
  ({ mesh: {} as Will['mesh'], data: Int8Array.from(data) })

suite('measure/enstrophy: enstrophy', [
  check(
    'sum of squares equals the nonzero count for ternary tone',
    () => {
      // [1,0,-1,1,0]: squares 1+0+1+1+0 = 3, the count of nonzero slots.
      equal(enstrophy(willOf([1, 0, -1, 1, 0])), 3)
    },
  ),
  check('an all-zero (vacuum) field has enstrophy 0', () => {
    equal(enstrophy(willOf([0, 0, 0, 0])), 0)
  }),
  check('a fully charged field equals its length', () => {
    equal(enstrophy(willOf([1, -1, 1, -1, 1, -1])), 6)
  }),
])
