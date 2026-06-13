import {
  Quaternion,
  binaryTetrahedral,
  quaternionGroup,
  multiply,
} from '@/code/algebra/group/quaternion'

// The 24-cell, the cell of the {3,4,3,4} substrate. Its 24 vertices are the unit
// Hurwitz quaternions, the binary tetrahedral group 2T.
export function cell24Vertices(): Quaternion[] {
  return binaryTetrahedral()
}

// Triality, the order-three symmetry behind the three generations of matter. The
// 24 vertices split into three classes of eight, the three cosets of the
// quaternion group Q8 inside 2T, and left multiplication by omega cycles the
// three classes. omega = (-1 + i + j + k) / 2 is a primitive cube root of unity
// in the quaternions (omega^3 = 1).
export const omega: Quaternion = { w: -0.5, x: 0.5, y: 0.5, z: 0.5 }

export function trialityClasses(): [Quaternion[], Quaternion[], Quaternion[]] {
  const base = quaternionGroup()
  const omegaSquared = multiply(omega, omega)
  const classVector = base
  const classSpinorA = base.map((element) => multiply(omega, element))
  const classSpinorB = base.map((element) => multiply(omegaSquared, element))
  return [classVector, classSpinorA, classSpinorB]
}
