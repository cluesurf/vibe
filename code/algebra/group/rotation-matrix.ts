// Real 3x3 rotation matrices and the basic matrix operations on them, the SO(3) prototype for
// non-abelian lattice gauge fields. A link variable is an SO(3) matrix, a Wilson loop is the trace of
// the ordered product of link matrices around a loop, and the holonomy is gauge-invariant under
// U_link -> g_start U_link g_end^T.

export type Matrix3 = number[][]

export const IDENTITY3: Matrix3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

export function multiply3(A: Matrix3, B: Matrix3): Matrix3 {
  const C: Matrix3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0
      for (let k = 0; k < 3; k++) {
        s += A[i]![k]! * B[k]![j]!
      }

      C[i]![j] = s
    }
  }

  return C
}

export function transpose3(A: Matrix3): Matrix3 {
  return [
    [A[0]![0]!, A[1]![0]!, A[2]![0]!],
    [A[0]![1]!, A[1]![1]!, A[2]![1]!],
    [A[0]![2]!, A[1]![2]!, A[2]![2]!],
  ]
}

export function trace3(A: Matrix3): number {
  return A[0]![0]! + A[1]![1]! + A[2]![2]!
}

// The SO(3) rotation matrix about `axis` by angle `ang`, by the Rodrigues formula
// R = cos(t) I + sin(t) K + (1 - cos(t)) k k^T, with k the unit axis and K its cross-product matrix.
export function rotationMatrix3(axis: number[], ang: number): Matrix3 {
  const n = Math.hypot(axis[0]!, axis[1]!, axis[2]!)
  const k = axis.map(x => x / n)
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const K: Matrix3 = [
    [0, -k[2]!, k[1]!],
    [k[2]!, 0, -k[0]!],
    [-k[1]!, k[0]!, 0],
  ]
  const o: Matrix3 = k.map(a => k.map(b => a * b))

  return [0, 1, 2].map(i =>
    [0, 1, 2].map(
      j => c * (i === j ? 1 : 0) + s * K[i]![j]! + (1 - c) * o[i]![j]!,
    ),
  )
}
