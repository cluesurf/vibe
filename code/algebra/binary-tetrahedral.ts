// The binary tetrahedral group 2T, the 24 unit Hurwitz quaternions, which are the 24 directions of the cell
// seen as the double cover of the rotation group. This is what makes the cell carry spin: a spinor is acted on
// by left quaternion multiplication, where a full 2-pi turn (the quaternion -1) acts as minus the identity, and
// only a 4-pi turn returns. A vector is acted on by conjugation, where the same -1 acts as the identity. The
// gap between the two is the spin-one-half double cover, realized concretely on the 24 directions.

export type Quaternion = [number, number, number, number]

export function quaternionMultiply(
  a: Quaternion,
  b: Quaternion,
): Quaternion {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ]
}

// the conjugate, which for a unit quaternion is the inverse.
export function quaternionConjugate(q: Quaternion): Quaternion {
  return [q[0], -q[1], -q[2], -q[3]]
}

// The 24 unit quaternions of the binary tetrahedral group: the 8 Lipschitz units (plus or minus one in a single
// slot) and the 16 Hurwitz units (all four slots plus or minus one half).
export function binaryTetrahedralGroup(): Quaternion[] {
  const group: Quaternion[] = []

  for (const s of [-1, 1]) {
    group.push([s, 0, 0, 0])
    group.push([0, s, 0, 0])
    group.push([0, 0, s, 0])
    group.push([0, 0, 0, s])
  }

  for (const a of [-0.5, 0.5]) {
    for (const b of [-0.5, 0.5]) {
      for (const c of [-0.5, 0.5]) {
        for (const d of [-0.5, 0.5]) {
          group.push([a, b, c, d])
        }
      }
    }
  }

  return group
}

// whether a set of quaternions is closed under multiplication, the group test.
export function isClosedUnderMultiplication(
  group: Quaternion[],
): boolean {
  const key = (q: Quaternion): string =>
    q.map(x => x.toFixed(3)).join(',')

  const present = new Set(group.map(key))

  for (const a of group) {
    for (const b of group) {
      if (!present.has(key(quaternionMultiply(a, b)))) {
        return false
      }
    }
  }

  return true
}

// the action of a quaternion on a spinor (left multiplication) and on a vector (conjugation, q v q-inverse).
export function spinorAction(
  q: Quaternion,
  spinor: Quaternion,
): Quaternion {
  return quaternionMultiply(q, spinor)
}

export function vectorAction(q: Quaternion, vector: Quaternion): Quaternion {
  return quaternionMultiply(
    quaternionMultiply(q, vector),
    quaternionConjugate(q),
  )
}

export function quaternionsClose(
  a: Quaternion,
  b: Quaternion,
  tolerance = 1e-9,
): boolean {
  for (let i = 0; i < 4; i++) {
    if (Math.abs(a[i]! - b[i]!) > tolerance) {
      return false
    }
  }

  return true
}
