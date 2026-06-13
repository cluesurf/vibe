// Unit quaternions and the binary tetrahedral group, the algebra behind the
// 24-cell, the D4 coin, and triality. The 24 unit Hurwitz quaternions are exactly
// the vertices of the 24-cell and form the binary tetrahedral group 2T, which is
// why the cell's coin carries spin and the three generations.

export interface Quaternion {
  w: number
  x: number
  y: number
  z: number
}

export function quaternion(w: number, x: number, y: number, z: number): Quaternion {
  return { w, x, y, z }
}

export function multiply(left: Quaternion, right: Quaternion): Quaternion {
  return {
    w: left.w * right.w - left.x * right.x - left.y * right.y - left.z * right.z,
    x: left.w * right.x + left.x * right.w + left.y * right.z - left.z * right.y,
    y: left.w * right.y - left.x * right.z + left.y * right.w + left.z * right.x,
    z: left.w * right.z + left.x * right.y - left.y * right.x + left.z * right.w,
  }
}

export function conjugate(value: Quaternion): Quaternion {
  return { w: value.w, x: -value.x, y: -value.y, z: -value.z }
}

export function equals(left: Quaternion, right: Quaternion, tolerance = 1e-9): boolean {
  return (
    Math.abs(left.w - right.w) < tolerance &&
    Math.abs(left.x - right.x) < tolerance &&
    Math.abs(left.y - right.y) < tolerance &&
    Math.abs(left.z - right.z) < tolerance
  )
}

// The 8 Lipschitz unit quaternions, the quaternion group Q8: +-1, +-i, +-j, +-k.
export function quaternionGroup(): Quaternion[] {
  const units: Quaternion[] = []
  for (const sign of [1, -1]) {
    units.push(quaternion(sign, 0, 0, 0))
    units.push(quaternion(0, sign, 0, 0))
    units.push(quaternion(0, 0, sign, 0))
    units.push(quaternion(0, 0, 0, sign))
  }
  return units
}

// The 24 Hurwitz unit quaternions, the binary tetrahedral group 2T, also the 24
// vertices of the 24-cell: the 8 of Q8 plus the 16 of (+-1 +-i +-j +-k)/2.
export function binaryTetrahedral(): Quaternion[] {
  const units = quaternionGroup()
  for (const signW of [0.5, -0.5]) {
    for (const signX of [0.5, -0.5]) {
      for (const signY of [0.5, -0.5]) {
        for (const signZ of [0.5, -0.5]) {
          units.push(quaternion(signW, signX, signY, signZ))
        }
      }
    }
  }
  return units
}
