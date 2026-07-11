// Conformance for code/algebra/binary-tetrahedral: the tuple-form unit quaternions
// of 2T and the spinor / vector actions of the double cover. Expected values come
// from the quaternion relations and from the defining property of the spin double
// cover (the quaternion -1 acts as -1 on a spinor but as +1 on a vector).

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  Quaternion,
  quaternionMultiply,
  quaternionConjugate,
  binaryTetrahedralGroup,
  isClosedUnderMultiplication,
  spinorAction,
  vectorAction,
  quaternionsClose,
} from '@/code/algebra/binary-tetrahedral'

const I: Quaternion = [0, 1, 0, 0]
const J: Quaternion = [0, 0, 1, 0]
const K: Quaternion = [0, 0, 0, 1]
const ONE: Quaternion = [1, 0, 0, 0]
const MINUS_ONE: Quaternion = [-1, 0, 0, 0]

const normSquared = (q: Quaternion): number =>
  q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]

const negate = (q: Quaternion): Quaternion => [
  -q[0],
  -q[1],
  -q[2],
  -q[3],
]

const equalTuple = (
  actual: Quaternion,
  expected: Quaternion,
  message: string,
): void => {
  for (let i = 0; i < 4; i++) {
    equal(actual[i]!, expected[i]!, `${message} [${i}]`)
  }
}

const key = (q: Quaternion): string =>
  q.map(x => x.toFixed(3)).join(',')

suite('algebra/binary-tetrahedral: Hamilton relations (tuple form)', [
  check('i^2 = j^2 = k^2 = -1', () => {
    equalTuple(quaternionMultiply(I, I), MINUS_ONE, 'i^2')
    equalTuple(quaternionMultiply(J, J), MINUS_ONE, 'j^2')
    equalTuple(quaternionMultiply(K, K), MINUS_ONE, 'k^2')
  }),
  check('ij = k, jk = i, ki = j, and ijk = -1', () => {
    equalTuple(quaternionMultiply(I, J), K, 'ij')
    equalTuple(quaternionMultiply(J, K), I, 'jk')
    equalTuple(quaternionMultiply(K, I), J, 'ki')
    equalTuple(
      quaternionMultiply(quaternionMultiply(I, J), K),
      MINUS_ONE,
      'ijk',
    )
  }),
  check(
    'conjugate is the inverse for a unit quaternion: q q* = 1',
    () => {
      const q: Quaternion = [0.5, 0.5, 0.5, 0.5]

      equalTuple(
        quaternionMultiply(q, quaternionConjugate(q)),
        ONE,
        'q q*',
      )
    },
  ),
])

suite('algebra/binary-tetrahedral: the group 2T', [
  check('2T has 24 distinct unit quaternions', () => {
    const group = binaryTetrahedralGroup()

    equal(group.length, 24, '2T size')
    equal(new Set(group.map(key)).size, 24, '2T distinct')

    for (const q of group) {
      ok(Math.abs(normSquared(q) - 1) < 1e-12, '2T element is a unit')
    }
  }),
  check('2T is closed under multiplication', () => {
    ok(
      isClosedUnderMultiplication(binaryTetrahedralGroup()),
      '2T must be a group',
    )
  }),
  check(
    'a non-group set is correctly rejected by the closure test',
    () => {
      // {1, i} is not closed: i*i = -1 is absent. A real negative control on the test.
      ok(
        !isClosedUnderMultiplication([ONE, I]),
        '{1, i} is not closed (i^2 = -1 missing)',
      )
    },
  ),
])

suite('algebra/binary-tetrahedral: spin double cover', [
  check(
    'the quaternion -1 acts as -1 on a spinor (2pi turn flips sign)',
    () => {
      const spinor: Quaternion = [0.5, 0.5, 0.5, 0.5]

      equalTuple(
        spinorAction(MINUS_ONE, spinor),
        negate(spinor),
        '(-1) . spinor',
      )
    },
  ),
  check(
    'the quaternion -1 acts as +1 on a vector (2pi turn is trivial)',
    () => {
      const vector: Quaternion = [0, 1, 2, 3]

      ok(
        quaternionsClose(vectorAction(MINUS_ONE, vector), vector),
        '(-1) v (-1)^-1 = v',
      )
    },
  ),
  check(
    'q and -q give the same rotation on a vector but opposite on a spinor',
    () => {
      const q: Quaternion = [0.5, 0.5, 0.5, 0.5] // a unit quaternion in 2T
      const vector: Quaternion = [0, 1, -1, 2]
      const spinor: Quaternion = [1, 0, 0, 0]

      // vector action: q and -q agree (the double cover collapses on SO(3))
      ok(
        quaternionsClose(
          vectorAction(q, vector),
          vectorAction(negate(q), vector),
        ),
        'q and -q rotate a vector identically',
      )

      // spinor action: q and -q differ by the sign
      ok(
        quaternionsClose(
          spinorAction(q, spinor),
          negate(spinorAction(negate(q), spinor)),
        ),
        'q and -q rotate a spinor with opposite sign',
      )
    },
  ),
  check(
    'conjugation by a unit quaternion preserves the vector norm',
    () => {
      const q: Quaternion = [0.5, 0.5, 0.5, 0.5]
      const vector: Quaternion = [0, 1, 2, 3]
      const rotated = vectorAction(q, vector)

      ok(
        Math.abs(normSquared(rotated) - normSquared(vector)) < 1e-9,
        'a rotation preserves length',
      )
    },
  ),
])
