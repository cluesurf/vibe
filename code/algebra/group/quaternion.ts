// Unit quaternions and the binary tetrahedral group, the algebra behind the
// 24-cell, the D4 coin, and triality. The 24 unit Hurwitz quaternions are exactly
// the vertices of the 24-cell and form the binary tetrahedral group 2T, which is
// why the cell's coin carries spin and the three generations.

export type Quaternion = {
  w: number
  x: number
  y: number
  z: number
}

export function quaternion(
  w: number,
  x: number,
  y: number,
  z: number,
): Quaternion {
  return { w, x, y, z }
}

export function multiply(
  left: Quaternion,
  right: Quaternion,
): Quaternion {
  return {
    w:
      left.w * right.w -
      left.x * right.x -
      left.y * right.y -
      left.z * right.z,
    x:
      left.w * right.x +
      left.x * right.w +
      left.y * right.z -
      left.z * right.y,
    y:
      left.w * right.y -
      left.x * right.z +
      left.y * right.w +
      left.z * right.x,
    z:
      left.w * right.z +
      left.x * right.y -
      left.y * right.x +
      left.z * right.w,
  }
}

export function conjugate(value: Quaternion): Quaternion {
  return { w: value.w, x: -value.x, y: -value.y, z: -value.z }
}

// The additive inverse, the -1 the spinor double cover turns on.
export function negate(value: Quaternion): Quaternion {
  return { w: -value.w, x: -value.x, y: -value.y, z: -value.z }
}

export function equals(
  left: Quaternion,
  right: Quaternion,
  tolerance = 1e-9,
): boolean {
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
        for (const signZ of [0.5, -0.5])
          units.push(quaternion(signW, signX, signY, signZ))
      }
    }
  }

  return units
}

// The 120 unit icosians, the binary icosahedral group 2I, also the 600-cell vertices:
// the 24 of 2T plus 96 even permutations of (+-phi/2, +-1/2, +-1/(2 phi), 0). This is the
// spinor double cover of the icosahedral rotation group A5, the spin algebra of {5,3,4}.
// The 12 face-directions of {5,3,4} carry no spinor in the LINEAR rep, but A5 has Schur
// multiplier Z2, so the PROJECTIVE rep is a spinor, exactly as 2T is the coin of {3,4,3,4}.
export function binaryIcosahedral(): Quaternion[] {
  const units = binaryTetrahedral()
  const phi = (1 + Math.sqrt(5)) / 2
  const magnitudes = [phi / 2, 0.5, 1 / (2 * phi), 0]
  const positions = [0, 1, 2, 3]

  for (const order of evenPermutations(positions)) {
    const base = [0, 0, 0, 0]

    for (let index = 0; index < 4; index++)
      base[order[index]!] = magnitudes[index]!

    const zeroSlot = order[3]!
    const nonzero = positions.filter(position => position !== zeroSlot)

    for (let signMask = 0; signMask < 8; signMask++) {
      const components = [...base]

      for (let bit = 0; bit < 3; bit++) {
        if ((signMask >> bit) & 1)
          components[nonzero[bit]!] = -components[nonzero[bit]!]!
      }

      units.push(
        quaternion(
          components[0]!,
          components[1]!,
          components[2]!,
          components[3]!,
        ),
      )
    }
  }

  return units
}

// The even permutations of a list (the alternating group action), used to build the icosians.
export function evenPermutations(items: number[]): number[][] {
  const result: number[][] = []

  const recurse = (current: number[], rest: number[]): void => {
    if (rest.length === 0) {
      if (permutationParity(current) === 0) result.push(current)

      return
    }

    for (let index = 0; index < rest.length; index++) {
      recurse(
        [...current, rest[index]!],
        rest.filter((_, other) => other !== index),
      )
    }
  }

  recurse([], items)

  return result
}

function permutationParity(permutation: number[]): number {
  let inversions = 0

  for (let left = 0; left < permutation.length; left++) {
    for (let right = left + 1; right < permutation.length; right++) {
      if (permutation[left]! > permutation[right]!) {
        inversions++
      }
    }
  }

  return inversions % 2
}

// A canonical rounded key for a unit quaternion, for membership and closure tests.
export function quaternionKey(value: Quaternion): string {
  const round = (component: number): number =>
    Math.round(component * 1e6)

  return `${round(value.w)},${round(value.x)},${round(value.y)},${round(value.z)}`
}
