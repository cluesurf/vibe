// Conformance for code/measure/division-algebra: the Cayley-Dickson tower R, C, H, O, S. The product
// reproduces complex multiplication on dimension 2, the norm-composition property |xy| = |x||y| holds
// exactly through the octonions (level 3) and FAILS at the sedenions (level 4), zero divisors appear
// only at level 4, and the imaginary-unit triples split 7 associative (Fano lines) + 28 non-associative.

import { suite, check, equal, close, ok, exactArray } from '@/test/code/harness'
import {
  cayleyConjugate,
  cayleyMultiply,
  normSquared,
  hasZeroDivisor,
  hasNormComposition,
  octonionTrialityCyclic,
  nonAssociativeTripleCount,
} from '@/code/measure/division-algebra'

suite('measure/division-algebra: Cayley-Dickson product', [
  // (1 + 2i)(3 + 4i) = -5 + 10i.
  check('dimension-2 multiplication is complex multiplication', () => {
    exactArray(cayleyMultiply([1, 2], [3, 4]), [-5, 10])
  }),
  // i * i = -1: [0,1]*[0,1] = [-1, 0].
  check('i squared is -1', () => {
    exactArray(cayleyMultiply([0, 1], [0, 1]), [-1, 0])
  }),
  // conj(a, b) = (conj a, -b): conjugate of (1,2,3,4) is (1,-2,-3,-4).
  check('the conjugate negates the imaginary part', () => {
    exactArray(cayleyConjugate([1, 2, 3, 4]), [1, -2, -3, -4])
  }),
  check('the norm squared is the sum of squares', () => {
    equal(normSquared([1, 2, 3, 4]), 30)
    equal(normSquared([0, 0]), 0)
  }),
  // |x|^2 = x * conj(x) for a quaternion (real part of the product).
  check('x conj(x) has norm-squared on its real part', () => {
    const x = [2, -1, 3, 1]
    const p = cayleyMultiply(x, cayleyConjugate(x))
    close(p[0]!, normSquared(x), 1e-12)
    for (let i = 1; i < 4; i++) {
      close(p[i]!, 0, 1e-12)
    }
  }),
])

suite('measure/division-algebra: division-algebra boundary', [
  // Norm composition holds through the octonions (Hurwitz), fails at the sedenions.
  check('norm composition holds for R, C, H, O but not S', () => {
    equal(hasNormComposition(0), true)
    equal(hasNormComposition(1), true)
    equal(hasNormComposition(2), true)
    equal(hasNormComposition(3), true)
    equal(hasNormComposition(4), false)
  }),
  // Zero divisors first appear at the sedenions (level 4).
  check('zero divisors appear only at the sedenions', () => {
    equal(hasZeroDivisor(1), false)
    equal(hasZeroDivisor(2), false)
    equal(hasZeroDivisor(3), false)
    equal(hasZeroDivisor(4), true)
  }),
])

suite('measure/division-algebra: octonion structure', [
  // The trilinear form Re((xy)z) is Z3 cyclic (the order-three Spin(8) triality core).
  check('the octonion triality form is cyclic', () => {
    equal(octonionTrialityCyclic(), true)
  }),
  // 35 imaginary-unit triples split into 7 Fano lines (associative) + 28 non-associative.
  check('28 of the 35 imaginary triples are non-associative', () => {
    equal(nonAssociativeTripleCount(), 28)
  }),
])
