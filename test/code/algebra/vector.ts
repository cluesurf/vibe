// Conformance for code/algebra/vector: the low-level real Euclidean and Minkowski
// vector primitives. Every expected value here is computed by hand from the
// definition, never from the implementation: dot is a sum of products, norm is the
// square root of the self-dot, the Minkowski inner product weights each axis by the
// metric sign. Exact where the arithmetic is exact, a tight float tolerance only on
// the square roots.

import {
  suite,
  check,
  equal,
  close,
  closeArray,
  exactArray,
} from '@/test/code/harness'
import {
  dot,
  norm,
  add,
  sub,
  scale,
  normalize,
  innerJ,
  normJ,
} from '@/code/algebra/vector'

suite('algebra/vector: euclidean primitives', [
  check('dot is the sum of componentwise products', () => {
    // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    equal(dot([1, 2, 3], [4, 5, 6]), 32, 'dot([1,2,3],[4,5,6]) = 32')
    // orthogonal vectors have zero dot
    equal(dot([1, 0], [0, 1]), 0, 'orthogonal -> 0')
  }),
  check('norm is the length of a 3-4-5 and 1-2-2 triple', () => {
    close(norm([3, 4]), 5, 1e-12, '|(3,4)| = 5')
    close(norm([1, 2, 2]), 3, 1e-12, '|(1,2,2)| = 3')
  }),
  check('add is componentwise', () => {
    exactArray(add([1, 2, 3], [4, 5, 6]), [5, 7, 9], 'add')
  }),
  check(
    'sub defaults to plain difference and scales the second arg',
    () => {
      exactArray(sub([5, 7], [1, 2]), [4, 5], 'a - b')
      // a - s*b with s = 2: (5 - 2*1, 7 - 2*2) = (3, 3)
      exactArray(sub([5, 7], [1, 2], 2), [3, 3], 'a - 2b')
    },
  ),
  check('scale multiplies every component', () => {
    exactArray(scale([1, 2, 3], 2), [2, 4, 6], 'scale by 2')
  }),
  check('normalize gives an exact unit direction', () => {
    // (3,4)/5 = (0.6, 0.8), length exactly 1
    closeArray(normalize([3, 4]), [0.6, 0.8], 1e-12, 'unit (0.6,0.8)')
    close(norm(normalize([3, 4])), 1, 1e-12, 'normalized norm = 1')
    close(
      norm(normalize([2, -3, 6])),
      1,
      1e-12,
      'normalized norm = 1 (3d)',
    )
  }),
  check(
    'normalize leaves the zero vector at zero (guard against /0)',
    () => {
      exactArray(normalize([0, 0]), [0, 0], 'zero stays zero')
    },
  ),
])

suite('algebra/vector: minkowski (J) inner product', [
  check('innerJ weights each axis by its metric sign', () => {
    // 1*1*4 + (-1)*2*5 + 1*3*6 = 4 - 10 + 18 = 12
    equal(
      innerJ([1, 2, 3], [4, 5, 6], [1, -1, 1]),
      12,
      'metric (+,-,+)',
    )
  }),
  check(
    'a timelike unit vector has J-square -1, a spacelike one +1',
    () => {
      const metric = [-1, 1, 1, 1] // mostly-plus with timelike axis 0
      equal(
        innerJ([1, 0, 0, 0], [1, 0, 0, 0], metric),
        -1,
        'timelike^2 = -1',
      )
      equal(
        innerJ([0, 1, 0, 0], [0, 1, 0, 0], metric),
        1,
        'spacelike^2 = +1',
      )
    },
  ),
  check('normJ is the square root of the absolute J-square', () => {
    const metric = [-1, 1, 1, 1]
    // innerJ((2,1,0,0)) = -4 + 1 = -3, normJ = sqrt(3)
    close(
      normJ([2, 1, 0, 0], metric),
      Math.sqrt(3),
      1e-12,
      'sqrt(|-3|)',
    )
  }),
])
