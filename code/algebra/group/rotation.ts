// The two ways a unit-quaternion rotation acts: on a vector and on a spinor. These
// are the same group element acting through its two representations, and the gap
// between them is the spin-half double cover. The spinor tests on the 24-cell coin
// (SP1 onward) compose these.

import { Quaternion, multiply, conjugate } from '@/code/algebra/group/quaternion'

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
