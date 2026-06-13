// The two ways a unit-quaternion rotation acts: on a vector and on a spinor. These
// are the same group element acting through its two representations, and the gap
// between them is the spin-half double cover. The spinor tests on the 24-cell coin
// (SP1 onward) compose these.

import { Quaternion, multiply, conjugate, quaternion } from '@/code/algebra/group/quaternion'

// The vector-rep action of a unit rotation g on a 3-vector v (a pure quaternion):
// conjugation g v g^-1. This is the SO(3) action, where a full 2pi rotation is the
// identity. For a unit g the inverse is the conjugate.
export function rotateVector(g: Quaternion, v: Quaternion): Quaternion {
  return multiply(multiply(g, v), conjugate(g))
}

// The spinor-rep action of a unit rotation g on a spinor psi: left multiplication.
// Quaternions are the spin representation space, so a 2pi rotation (a g with g
// squared = -1, applied to make a full turn) acts as minus one. This is the SU(2)
// action, the double cover of SO(3).
export function rotateSpinor(g: Quaternion, psi: Quaternion): Quaternion {
  return multiply(g, psi)
}

// Apply a rotation g to a spinor `turns` times, composing the rotation.
export function rotateSpinorTimes(
  g: Quaternion,
  psi: Quaternion,
  turns: number,
): Quaternion {
  let current = psi
  for (let step = 0; step < turns; step++) {
    current = rotateSpinor(g, current)
  }
  return current
}

// Apply a rotation g to a vector `turns` times, composing the rotation.
export function rotateVectorTimes(
  g: Quaternion,
  v: Quaternion,
  turns: number,
): Quaternion {
  let current = v
  for (let step = 0; step < turns; step++) {
    current = rotateVector(g, current)
  }
  return current
}

// A 3x3 rotation matrix about a (not necessarily unit) axis by angle `angle`, via
// the Rodrigues formula R = cos(t) I + sin(t) K + (1 - cos t) (k k^T), where k is
// the unit axis and K is its cross-product matrix. The matrix is returned row major
// as number[][]. The matrix-rep companion to the quaternion rotateVector.
export function rotationMatrixAxisAngle(input: { axis: number[]; angle: number }): number[][] {
  const { axis, angle } = input
  const length = Math.hypot(...axis)
  const k = axis.map((x) => x / length)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const cross = [
    [0, -k[2]!, k[1]!],
    [k[2]!, 0, -k[0]!],
    [-k[1]!, k[0]!, 0],
  ]
  const outer = k.map((ki) => k.map((kj) => ki * kj))
  return [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => c * (i === j ? 1 : 0) + s * cross[i]![j]! + (1 - c) * outer[i]![j]!),
  )
}

// A canonical key for the SO(3) rotation a unit quaternion represents, found by
// conjugating the three imaginary basis vectors (the columns of the rotation
// matrix) and rounding to `decimals` decimal places. Quaternions q and -q give the
// SAME rotation key (the double cover collapses to one rotation), so this is the key
// used to count distinct rotations of a quaternion group.
export function rotationKey(value: Quaternion, decimals = 4): string {
  const scale = 10 ** decimals
  const basis = [quaternion(0, 1, 0, 0), quaternion(0, 0, 1, 0), quaternion(0, 0, 0, 1)]
  return basis
    .map((axis) => {
      const rotated = multiply(multiply(value, axis), conjugate(value))
      return [rotated.x, rotated.y, rotated.z].map((part) => Math.round(part * scale)).join(',')
    })
    .join(';')
}
