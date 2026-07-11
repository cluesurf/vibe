// Conformance for code/algebra/group/rotation-matrix: the SO(3) Rodrigues rotation
// matrices and the basic 3x3 operations. Every expected value is a defining property
// of a rotation matrix (orthogonal, det 1, trace = 1 + 2 cos t, R(a)R(b) = R(a+b)
// about a common axis), re-derived independently, never read from the implementation.

import { suite, check, close, closeArray } from '@/test/code/harness'
import {
  IDENTITY3,
  multiply3,
  transpose3,
  trace3,
  rotationMatrix3,
  type Matrix3,
} from '@/code/algebra/group/rotation-matrix'

const TOL = 1e-12

// Independent 3x3 determinant by cofactor expansion (NOT via the impl).
const det3 = (m: Matrix3): number =>
  m[0]![0]! * (m[1]![1]! * m[2]![2]! - m[1]![2]! * m[2]![1]!) -
  m[0]![1]! * (m[1]![0]! * m[2]![2]! - m[1]![2]! * m[2]![0]!) +
  m[0]![2]! * (m[1]![0]! * m[2]![1]! - m[1]![1]! * m[2]![0]!)

const closeMatrix = (a: Matrix3, b: Matrix3, message: string): void => {
  for (let i = 0; i < 3; i++)
    closeArray(a[i]!, b[i]!, TOL, `${message} row ${i}`)
}

const Z = [0, 0, 1]
const AXES = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 1],
  [2, -1, 3],
]

const ANGLES = [0.3, 1.0, Math.PI / 2, 2.4, Math.PI]

suite('algebra/group/rotation-matrix: 3x3 operations', [
  check(
    'multiply by identity returns the matrix; identity is the unit',
    () => {
      const R = rotationMatrix3([1, 2, -1], 0.7)

      closeMatrix(multiply3(R, IDENTITY3), R, 'R I = R')
      closeMatrix(multiply3(IDENTITY3, R), R, 'I R = R')
    },
  ),
  check('transpose is an involution', () => {
    const R = rotationMatrix3([0, 1, 2], 1.3)

    closeMatrix(transpose3(transpose3(R)), R, 'R^TT = R')
  }),
  check('multiplication is associative', () => {
    const A = rotationMatrix3([1, 0, 0], 0.5)
    const B = rotationMatrix3([0, 1, 0], 0.9)
    const C = rotationMatrix3([0, 0, 1], 1.7)

    closeMatrix(
      multiply3(multiply3(A, B), C),
      multiply3(A, multiply3(B, C)),
      '(AB)C = A(BC)',
    )
  }),
])

suite('algebra/group/rotation-matrix: rotations are in SO(3)', [
  check('R is orthogonal: R R^T = I, for many axes and angles', () => {
    for (const axis of AXES) {
      for (const ang of ANGLES) {
        const R = rotationMatrix3(axis, ang)

        closeMatrix(multiply3(R, transpose3(R)), IDENTITY3, 'R R^T = I')
      }
    }
  }),
  check('det(R) = 1 (a proper rotation, not a reflection)', () => {
    for (const axis of AXES) {
      for (const ang of ANGLES)
        close(det3(rotationMatrix3(axis, ang)), 1, TOL, 'det = 1')
    }
  }),
  check('trace(R) = 1 + 2 cos(angle)', () => {
    for (const ang of ANGLES) {
      close(
        trace3(rotationMatrix3([1, 1, 1], ang)),
        1 + 2 * Math.cos(ang),
        TOL,
        'trace identity',
      )
    }
  }),
])

suite('algebra/group/rotation-matrix: the rotation homomorphism', [
  check('R(a) R(b) = R(a + b) about a common axis', () => {
    for (const [a, b] of [
      [0.4, 1.1],
      [Math.PI / 3, Math.PI / 6],
      [2.0, -0.7],
    ]) {
      closeMatrix(
        multiply3(rotationMatrix3(Z, a!), rotationMatrix3(Z, b!)),
        rotationMatrix3(Z, a! + b!),
        'R(a)R(b) = R(a+b)',
      )
    }
  }),
  check('a full turn (2 pi) is the identity', () => {
    closeMatrix(
      rotationMatrix3([1, -2, 3], 2 * Math.PI),
      IDENTITY3,
      'R(2pi) = I',
    )
  }),
  check('90 deg about z sends e_x -> e_y, e_y -> -e_x', () => {
    const R = rotationMatrix3(Z, Math.PI / 2)

    // column j of R is the image of basis vector e_j
    closeArray(
      [R[0]![0]!, R[1]![0]!, R[2]![0]!],
      [0, 1, 0],
      TOL,
      'e_x -> e_y',
    )

    closeArray(
      [R[0]![1]!, R[1]![1]!, R[2]![1]!],
      [-1, 0, 0],
      TOL,
      'e_y -> -e_x',
    )
  }),
])
