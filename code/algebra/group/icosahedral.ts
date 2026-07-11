// The icosahedral rotation group A5 (order 60) and the decomposition of its 12-direction
// permutation representation. The 12 icosahedron vertex directions (= the 12 dodecahedron
// faces of {5,3,4}) carry the permutation rep, which decomposes by the A5 character inner
// product into 1 + 3 + 3' + 5, with NO four-dimensional or half-integer (spinor) copy. This
// is the structural reason {5,3,4}'s linear direction rep cannot carry spin (the spinor lives
// only in the projective rep 2I).

import { icosahedronVertexDirections } from '@/code/algebra/group/root-system'
import { rotationMatrixAxisAngle } from '@/code/algebra/group/rotation'

const PHI = (1 + Math.sqrt(5)) / 2

type Matrix3 = number[][]

function matmul3(a: Matrix3, b: Matrix3): Matrix3 {
  const c: Matrix3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      c[i]![j] =
        a[i]![0]! * b[0]![j]! +
        a[i]![1]! * b[1]![j]! +
        a[i]![2]! * b[2]![j]!
    }
  }

  return c
}

const apply3 = (a: Matrix3, v: number[]): number[] =>
  [0, 1, 2].map(
    i => a[i]![0]! * v[0]! + a[i]![1]! * v[1]! + a[i]![2]! * v[2]!,
  )

const identity3 = (): Matrix3 => [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

const close3 = (a: Matrix3, b: Matrix3): boolean =>
  a.every((r, i) => r.every((x, j) => Math.abs(x - b[i]![j]!) < 1e-5))

const key3 = (a: Matrix3): string =>
  a
    .flat()
    .map(x => Math.round(x * 1e4))
    .join(',')

const rot3 = (axis: number[], angle: number): Matrix3 =>
  rotationMatrixAxisAngle({ axis, angle })

// Build the order-60 icosahedral rotation group from a 5-fold and a 2-fold generator and
// decompose the 12-vertex permutation rep against the A5 character table.
export function icosahedralFacePermutationDecomposition(): {
  multiplicities: Record<string, number>
  groupOrder: number
  noSpinor: boolean
} {
  const vertices = icosahedronVertexDirections() // the 12 directions
  const permutation = (matrix: Matrix3): number[] =>
    vertices.map(v => {
      const w = apply3(matrix, v)

      let best = 0,
        bestDistance = Infinity

      vertices.forEach((u, j) => {
        const d =
          (u[0]! - w[0]!) ** 2 +
          (u[1]! - w[1]!) ** 2 +
          (u[2]! - w[2]!) ** 2

        if (d < bestDistance) {
          bestDistance = d
          best = j
        }
      })

      return best
    })

  const generators = [
    rot3(vertices[0]!, (2 * Math.PI) / 5),
    rot3([0, 0, 1], Math.PI),
  ]

  const group: Matrix3[] = [identity3()]
  const seen = new Set([key3(identity3())])

  for (const element of group) {
    for (const g of generators) {
      const m = matmul3(g, element)
      const k = key3(m)

      if (!seen.has(k)) {
        seen.add(k)
        group.push(m)
      }
    }
  }

  const elementOrder = (m: Matrix3): number => {
    let p = m

    for (let o = 1; o <= 10; o++) {
      if (close3(p, identity3())) return o

      p = matmul3(m, p)
    }

    return -1
  }

  // fixed-point count of one representative per rotation order (e, 5, 2, 3)
  const fixByOrder: Record<number, number> = {}

  for (const m of group) {
    const o = elementOrder(m)

    if (!(o in fixByOrder)) {
      const p = permutation(m)

      fixByOrder[o] = p.filter((pj, j) => pj === j).length
    }
  }

  // A5 conjugacy-class sizes (e, 5a, 5b, 2, 3) and the character table
  const sizes = [1, 12, 12, 15, 20]
  const characters: Record<string, number[]> = {
    '1': [1, 1, 1, 1, 1],
    '3': [3, PHI, 1 - PHI, -1, 0],
    "3'": [3, 1 - PHI, PHI, -1, 0],
    '4': [4, -1, -1, 0, 1],
    '5': [5, 0, 0, 1, -1],
  }

  const permCharacter = [
    12,
    fixByOrder[5] ?? 0,
    fixByOrder[5] ?? 0,
    fixByOrder[2] ?? 0,
    fixByOrder[3] ?? 0,
  ]

  const multiplicities: Record<string, number> = {}

  for (const [name, character] of Object.entries(characters)) {
    multiplicities[name] =
      Math.round(
        (sizes.reduce(
          (s, sz, k) => s + sz * permCharacter[k]! * character[k]!,
          0,
        ) /
          group.length) *
          100,
      ) / 100
  }

  // the spinor would appear as the 4-dimensional rep; its absence means no spinor
  const noSpinor = multiplicities['4'] === 0

  return { multiplicities, groupOrder: group.length, noSpinor }
}
