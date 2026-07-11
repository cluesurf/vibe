// Conformance for code/algebra/group/quaternion: the Hamilton product and the unit
// quaternion groups Q8 / 2T / 2I. Every expected value here is re-derived from the
// defining relations of the quaternions (i^2 = j^2 = k^2 = ijk = -1) and from the
// known orders of the finite subgroups, never from the implementation itself.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  Quaternion,
  quaternion,
  multiply,
  conjugate,
  negate,
  quaternionGroup,
  binaryTetrahedral,
  binaryIcosahedral,
  evenPermutations,
  quaternionKey,
} from '@/code/algebra/group/quaternion'

// Squared norm, an exact integer for integer-coordinate quaternions.
const normSquared = (q: Quaternion): number =>
  q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z

const components = (q: Quaternion): number[] => [q.w, q.x, q.y, q.z]

const equalQuaternion = (
  actual: Quaternion,
  expected: Quaternion,
  message: string,
): void => {
  const a = components(actual)
  const e = components(expected)

  for (let i = 0; i < 4; i++) {
    equal(a[i]!, e[i]!, `${message} [${i}]`)
  }
}

const ONE = quaternion(1, 0, 0, 0)
const I = quaternion(0, 1, 0, 0)
const J = quaternion(0, 0, 1, 0)
const K = quaternion(0, 0, 0, 1)
const MINUS_ONE = quaternion(-1, 0, 0, 0)

// Closure of a finite set under the Hamilton product, tested by rounded key.
const closedUnderMultiply = (group: Quaternion[]): boolean => {
  const present = new Set(group.map(quaternionKey))

  for (const a of group) {
    for (const b of group) {
      if (!present.has(quaternionKey(multiply(a, b)))) {
        return false
      }
    }
  }

  return true
}

const distinctCount = (group: Quaternion[]): number =>
  new Set(group.map(quaternionKey)).size

suite('algebra/group/quaternion: Hamilton relations', [
  check('i^2 = j^2 = k^2 = -1', () => {
    equalQuaternion(multiply(I, I), MINUS_ONE, 'i^2')
    equalQuaternion(multiply(J, J), MINUS_ONE, 'j^2')
    equalQuaternion(multiply(K, K), MINUS_ONE, 'k^2')
  }),
  check('ij = k, jk = i, ki = j', () => {
    equalQuaternion(multiply(I, J), K, 'ij')
    equalQuaternion(multiply(J, K), I, 'jk')
    equalQuaternion(multiply(K, I), J, 'ki')
  }),
  check('the units anticommute: ji = -k, kj = -i, ik = -j', () => {
    equalQuaternion(multiply(J, I), negate(K), 'ji')
    equalQuaternion(multiply(K, J), negate(I), 'kj')
    equalQuaternion(multiply(I, K), negate(J), 'ik')
  }),
  check('ijk = -1', () => {
    equalQuaternion(multiply(multiply(I, J), K), MINUS_ONE, 'ijk')
  }),
  check('1 is the multiplicative identity', () => {
    const q = quaternion(2, -3, 5, 7)

    equalQuaternion(multiply(ONE, q), q, '1 q')
    equalQuaternion(multiply(q, ONE), q, 'q 1')
  }),
])

suite('algebra/group/quaternion: norm and conjugate', [
  check('q conjugate(q) = |q|^2 (a real quaternion)', () => {
    const q = quaternion(1, 2, 3, 4)
    const product = multiply(q, conjugate(q))

    equalQuaternion(product, quaternion(30, 0, 0, 0), 'q q*')
    equal(normSquared(q), 30, '|q|^2')
  }),
  check('the norm is multiplicative: |pq|^2 = |p|^2 |q|^2', () => {
    const p = quaternion(1, 2, 3, 4)
    const q = quaternion(2, -1, 0, 5)

    equal(
      normSquared(multiply(p, q)),
      normSquared(p) * normSquared(q),
      '|pq|^2 must equal |p|^2 |q|^2 (composition algebra)',
    )
  }),
  check('conjugation is an anti-homomorphism: (pq)* = q* p*', () => {
    const p = quaternion(1, 2, 3, 4)
    const q = quaternion(0, 1, -2, 3)

    equalQuaternion(
      conjugate(multiply(p, q)),
      multiply(conjugate(q), conjugate(p)),
      '(pq)*',
    )
  }),
  check('negate is an involution and (-1)^2 = 1', () => {
    const q = quaternion(3, -1, 4, -1)

    equalQuaternion(negate(negate(q)), q, '--q')
    equalQuaternion(multiply(MINUS_ONE, MINUS_ONE), ONE, '(-1)^2')
  }),
])

suite('algebra/group/quaternion: finite unit groups', [
  check('Q8 has 8 distinct unit elements', () => {
    const group = quaternionGroup()

    equal(group.length, 8, 'Q8 size')
    equal(distinctCount(group), 8, 'Q8 distinct')

    for (const q of group) {
      equal(normSquared(q), 1, 'Q8 element is a unit')
    }
  }),
  check('Q8 is closed under the Hamilton product', () => {
    ok(closedUnderMultiply(quaternionGroup()), 'Q8 must be a group')
  }),
  check('2T (binary tetrahedral) has 24 distinct units', () => {
    const group = binaryTetrahedral()

    equal(group.length, 24, '2T size')
    equal(distinctCount(group), 24, '2T distinct')

    for (const q of group) {
      // 8 Lipschitz units have |q|^2 = 1; 16 Hurwitz units (+-1/2)^4 also have
      // |q|^2 = 4*(1/4) = 1. All 24 are unit quaternions.
      close(normSquared(q), 1, 1e-12, '2T element is a unit')
    }
  }),
  check(
    '2T is closed under the Hamilton product (a group of order 24)',
    () => {
      ok(closedUnderMultiply(binaryTetrahedral()), '2T must be a group')
    },
  ),
  check(
    '2I (binary icosahedral) has 120 distinct units of norm 1',
    () => {
      const group = binaryIcosahedral()

      equal(group.length, 120, '2I size')
      equal(distinctCount(group), 120, '2I distinct')

      for (const q of group) {
        close(normSquared(q), 1, 1e-12, '2I element is a unit')
      }
    },
  ),
  check(
    '2I is closed under the Hamilton product (a group of order 120)',
    () => {
      ok(closedUnderMultiply(binaryIcosahedral()), '2I must be a group')
    },
  ),
])

suite('algebra/group/quaternion: even permutations', [
  check(
    'there are 12 even permutations of 4 elements (|A4| = 12)',
    () => {
      const evens = evenPermutations([0, 1, 2, 3])

      equal(evens.length, 12, 'count of even permutations of S4')
    },
  ),
  check(
    'each is a genuine permutation of {0,1,2,3} and all are distinct',
    () => {
      const evens = evenPermutations([0, 1, 2, 3])
      const keys = new Set<string>()

      for (const order of evens) {
        equal(order.length, 4, 'permutation length')
        equal(
          [...order].sort().join(','),
          '0,1,2,3',
          'is a permutation of 0..3',
        )
        keys.add(order.join(','))
      }

      equal(keys.size, 12, 'all 12 distinct')
      ok(
        keys.has('0,1,2,3'),
        'the identity (an even permutation) is present',
      )
    },
  ),
])
