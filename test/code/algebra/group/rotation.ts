// Conformance for code/algebra/group/rotation: the two ways a unit quaternion acts,
// as an SO(3) rotation on a vector (conjugation) and as an SU(2) rotor on a spinor
// (left multiplication). The headline is the double cover: a vector rotation by a
// quaternion q and by -q are the same, but a spinor picks up a minus sign after a 2 pi
// turn. Every expected value comes from quaternion rotation theory, not the impl.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  quaternion,
  negate,
  type Quaternion,
} from '@/code/algebra/group/quaternion'
import {
  rotateVector,
  rotateSpinor,
  rotateSpinorTimes,
  rotateVectorTimes,
  rotationMatrixAxisAngle,
  rotationKey,
} from '@/code/algebra/group/rotation'

const TOL = 1e-12

const closeQuat = (
  a: Quaternion,
  b: Quaternion,
  message: string,
): void => {
  close(a.w, b.w, TOL, `${message} w`)
  close(a.x, b.x, TOL, `${message} x`)
  close(a.y, b.y, TOL, `${message} y`)
  close(a.z, b.z, TOL, `${message} z`)
}

const I = quaternion(0, 1, 0, 0)
const J = quaternion(0, 0, 1, 0)
const ONE = quaternion(1, 0, 0, 0)
const K = quaternion(0, 0, 0, 1) // unit quaternion = rotation by pi about z

// a unit quaternion rotating by `angle` about z: cos(a/2) + sin(a/2) k
const zRotor = (angle: number): Quaternion =>
  quaternion(Math.cos(angle / 2), 0, 0, Math.sin(angle / 2))

suite('algebra/group/rotation: vector action (SO(3) by conjugation)', [
  check('90 deg about z sends the x-vector to the y-vector', () => {
    closeQuat(rotateVector(zRotor(Math.PI / 2), I), J, 'x -> y')
  }),
  check('rotateVector preserves the vector length', () => {
    const g = zRotor(1.3)
    const v = quaternion(0, 2, -1, 3)
    const out = rotateVector(g, v)

    close(
      out.x * out.x + out.y * out.y + out.z * out.z,
      4 + 1 + 9,
      1e-9,
      'rotation is an isometry',
    )
    close(out.w, 0, TOL, 'a rotated pure quaternion stays pure')
  }),
  check(
    'a 180 deg rotor applied twice (a full turn) returns the vector',
    () => {
      closeQuat(
        rotateVectorTimes(K, I, 2),
        I,
        'vector after 2 pi = itself',
      )
    },
  ),
])

suite('algebra/group/rotation: spinor action and the double cover', [
  check('a 2 pi turn flips a spinor sign (k^2 = -1)', () => {
    // K is a pi rotation; two of them is a 2 pi turn, which on a spinor is -1.
    closeQuat(
      rotateSpinorTimes(K, ONE, 2),
      negate(ONE),
      'spinor after 2 pi = -psi',
    )
  }),
  check('rotateSpinor is plain left multiplication', () => {
    // k*(1 + 2i + 3j + 4k) = -4 - 3i + 2j + k, using ki=j, kj=-i, kk=-1
    const psi = quaternion(1, 2, 3, 4)

    closeQuat(rotateSpinor(K, psi), quaternion(-4, -3, 2, 1), 'k * psi')
  }),
  check('a 4 pi turn restores the spinor (the cover closes)', () => {
    closeQuat(
      rotateSpinorTimes(K, ONE, 4),
      ONE,
      'spinor after 4 pi = +psi',
    )
  }),
  check(
    'q and -q give the same SO(3) rotation key (2-to-1 cover)',
    () => {
      for (const g of [zRotor(0.9), I, K, quaternion(1, 1, 1, 1)]) {
        equal(
          rotationKey(g),
          rotationKey(negate(g)),
          'q and -q same rotation',
        )
      }
    },
  ),
])

suite('algebra/group/rotation: Rodrigues matrix companion', [
  check('rotationMatrixAxisAngle is orthogonal with det 1', () => {
    const R = rotationMatrixAxisAngle({ axis: [1, -2, 1], angle: 1.1 })

    // R R^T = I
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const dot =
          R[i]![0]! * R[j]![0]! +
          R[i]![1]! * R[j]![1]! +
          R[i]![2]! * R[j]![2]!

        close(dot, i === j ? 1 : 0, 1e-12, 'orthonormal rows')
      }
    }

    const det =
      R[0]![0]! * (R[1]![1]! * R[2]![2]! - R[1]![2]! * R[2]![1]!) -
      R[0]![1]! * (R[1]![0]! * R[2]![2]! - R[1]![2]! * R[2]![0]!) +
      R[0]![2]! * (R[1]![0]! * R[2]![1]! - R[1]![1]! * R[2]![0]!)

    close(det, 1, 1e-12, 'det = 1')
  }),
  check('the matrix and the quaternion agree on a vector', () => {
    const angle = 0.8
    const axis = [0, 0, 1]
    const R = rotationMatrixAxisAngle({ axis, angle })
    const v = quaternion(0, 1, 2, 3)
    const byMatrix = [
      R[0]![0]! * v.x + R[0]![1]! * v.y + R[0]![2]! * v.z,
      R[1]![0]! * v.x + R[1]![1]! * v.y + R[1]![2]! * v.z,
      R[2]![0]! * v.x + R[2]![1]! * v.y + R[2]![2]! * v.z,
    ]

    const byQuat = rotateVector(zRotor(angle), v)

    close(byMatrix[0]!, byQuat.x, 1e-12, 'x agrees')
    close(byMatrix[1]!, byQuat.y, 1e-12, 'y agrees')
    close(byMatrix[2]!, byQuat.z, 1e-12, 'z agrees')
  }),
])
