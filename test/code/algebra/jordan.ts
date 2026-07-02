// Conformance for code/algebra/jordan: the Hermitian octonion matrices and their
// Jordan product. The headline facts, re-derived from the structure theory: H3(O)
// (the Albert algebra) has real dimension 27; H_n(O) satisfies the Jordan identity
// for n <= 3 and FAILS it for n >= 4 (because the octonions are non-associative);
// and the three diagonal idempotents form a complete orthogonal Jordan frame whose
// S_3 slot-permutations are automorphisms.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  hermitianOctonionDimension,
  jordanProduct,
  isHermitian,
  jordanIdentityResidual,
  maxJordanIdentityResidual,
  isJordanAutomorphism,
  permutations,
  diagonalJordanFrame,
  isJordanIdempotent,
  areJordanOrthogonal,
  octonionMatrixTrace,
  octonionMatrixIdentity,
  octonionMatrixAdd,
  octonionMatrixEquals,
  deterministicHermitian,
} from '@/code/algebra/jordan'

suite('algebra/jordan: dimensions of H_n(O)', [
  check('H3(O) is the 27-dimensional Albert algebra', () => {
    // 3 real diagonal entries + 3 octonionic off-diagonal entries * 8 reals = 27.
    equal(hermitianOctonionDimension(3), 27, 'dim H3(O) = 27')
  }),
  check('H1(O) = 1, H2(O) = 10', () => {
    equal(hermitianOctonionDimension(1), 1, 'dim H1(O) = 1')
    equal(hermitianOctonionDimension(2), 10, 'dim H2(O) = 10')
  }),
])

suite('algebra/jordan: the Jordan product and the rank-3 frame', [
  check(
    'the test elements are Hermitian and the Jordan product preserves Hermiticity',
    () => {
      for (let variant = 0; variant < 4; variant++) {
        const a = deterministicHermitian(3, variant)
        const b = deterministicHermitian(3, variant + 1)
        ok(isHermitian(a), 'test element A is Hermitian')
        ok(isHermitian(b), 'test element B is Hermitian')
        ok(isHermitian(jordanProduct(a, b)), 'A . B is Hermitian')
      }
    },
  ),
  check(
    'the diagonal frame: three primitive idempotents, each of trace 1',
    () => {
      const frame = diagonalJordanFrame(3)
      equal(frame.length, 3, 'three frame idempotents')

      for (const e of frame) {
        ok(isJordanIdempotent(e), 'E . E = E')
        close(octonionMatrixTrace(e), 1, 1e-12, 'trace 1')
      }
    },
  ),
  check(
    'the frame idempotents are pairwise orthogonal and sum to the identity',
    () => {
      const [e0, e1, e2] = diagonalJordanFrame(3)
      ok(areJordanOrthogonal(e0!, e1!), 'E0 . E1 = 0')
      ok(areJordanOrthogonal(e0!, e2!), 'E0 . E2 = 0')
      ok(areJordanOrthogonal(e1!, e2!), 'E1 . E2 = 0')

      const sum = octonionMatrixAdd(octonionMatrixAdd(e0!, e1!), e2!)
      ok(
        octonionMatrixEquals(sum, octonionMatrixIdentity(3)),
        'E0 + E1 + E2 = I',
      )
    },
  ),
])

suite(
  'algebra/jordan: the Jordan identity holds at n<=3, fails at n>=4',
  [
    check(
      'a single residual at n=3 is ~0 (the Jordan identity holds)',
      () => {
        const a = deterministicHermitian(3, 0)
        const b = deterministicHermitian(3, 1)
        close(
          jordanIdentityResidual(a, b),
          0,
          1e-9,
          'one H3(O) residual ~ 0',
        )
      },
    ),
    check('the worst residual at n=2 and n=3 is ~0', () => {
      close(
        maxJordanIdentityResidual(2),
        0,
        1e-9,
        'H2(O) is a Jordan algebra',
      )
      close(
        maxJordanIdentityResidual(3),
        0,
        1e-9,
        'H3(O) is a Jordan algebra',
      )
    }),
    check(
      'the residual at n=4 is large (H4(O) is NOT a Jordan algebra)',
      () => {
        // The non-associativity of the octonions breaks the Jordan identity at n >= 4.
        // The failure is order unity, far above the ~1e-12 rounding floor at n <= 3.
        ok(
          maxJordanIdentityResidual(4) > 1e-3,
          'H4(O) fails the Jordan identity by an order-1 amount',
        )
      },
    ),
  ],
)

suite('algebra/jordan: S_3 slot permutations are automorphisms', [
  check(
    'there are exactly 6 permutations of 3 slots (|S_3| = 6)',
    () => {
      const perms = permutations(3)
      equal(perms.length, 6, '|S_3| = 6')

      const keys = new Set(perms.map(p => p.join(',')))
      equal(keys.size, 6, 'all distinct')

      for (const p of perms) {
        equal(
          [...p].sort().join(','),
          '0,1,2',
          'is a permutation of {0,1,2}',
        )
      }
    },
  ),
  check(
    'every slot permutation is a Jordan automorphism of H3(O)',
    () => {
      for (const perm of permutations(3)) {
        ok(
          isJordanAutomorphism(perm),
          `P(A . B) = P(A) . P(B) for perm ${perm.join('')}`,
        )
      }
    },
  ),
])
