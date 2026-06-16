// Helicity of a polarization, the spin of a wave read off how its polarization rotates. A spin-s polarization
// picks up a phase of s times the rotation angle, so its overlap with itself after a rotation by theta is
// cos(s theta), and it returns to itself with period 360/s degrees. A scalar (spin 0) is invariant, a vector
// (spin 1) has period 360, and a symmetric-traceless tensor (spin 2, the graviton) has period 180, its two
// polarizations plus and cross swapping at 45 degrees. These helpers rotate a 3-tensor about the z axis and
// measure the polarization overlap, which is how the graviton's spin-2 helicity is verified.

export type Matrix3 = [number[], number[], number[]]

// rotation by `theta` (radians) about the z axis
export function rotationZ(theta: number): Matrix3 {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ]
}

// R * e * R^T, the rotation of a rank-2 tensor
export function conjugateTensor(r: Matrix3, e: Matrix3): Matrix3 {
  const out: Matrix3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) sum += r[i]![a]! * e[a]![b]! * r[j]![b]!
      }
      out[i]![j] = sum
    }
  }
  return out
}

// the Frobenius inner product sum_ij a_ij b_ij
export function tensorInner(a: Matrix3, b: Matrix3): number {
  let sum = 0
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) sum += a[i]![j]! * b[i]![j]!
  return sum
}

// the two transverse-traceless polarization tensors of a wave moving along z, the graviton's plus and cross
export const PLUS_POLARIZATION: Matrix3 = [
  [1, 0, 0],
  [0, -1, 0],
  [0, 0, 0],
]
export const CROSS_POLARIZATION: Matrix3 = [
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 0],
]

// the normalized overlap of the plus polarization with its own rotation by `theta`, which for a spin-2 tensor is
// cos(2 theta). Returns a value in [-1, 1].
export function plusSelfOverlap(theta: number): number {
  const rotated = conjugateTensor(rotationZ(theta), PLUS_POLARIZATION)
  const norm = tensorInner(PLUS_POLARIZATION, PLUS_POLARIZATION)
  return tensorInner(PLUS_POLARIZATION, rotated) / norm
}

// the normalized overlap of the CROSS polarization with the rotation of the PLUS polarization by `theta`, which
// for spin 2 is sin(2 theta), so it is one at 45 degrees (plus rotates into cross).
export function plusToCrossOverlap(theta: number): number {
  const rotated = conjugateTensor(rotationZ(theta), PLUS_POLARIZATION)
  const norm = Math.sqrt(tensorInner(PLUS_POLARIZATION, PLUS_POLARIZATION) * tensorInner(CROSS_POLARIZATION, CROSS_POLARIZATION))
  return tensorInner(CROSS_POLARIZATION, rotated) / norm
}
