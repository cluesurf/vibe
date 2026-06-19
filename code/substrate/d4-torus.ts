// A finite D4 torus: the even-sum integer 4-vectors modulo M (M even keeps the even-sum
// condition well defined), with the 24 D4 roots as the step directions. Every cell has
// exactly 24 in-lattice neighbours and the lattice closes under the roots, the periodic
// finite model of the {3,4,3,4} substrate for exact (integer) dynamics checks.

import { rootsD4 } from '@/code/algebra/group/root-system'

export function buildD4Torus(M: number): {
  cells: number[][]
  index: Map<string, number>
  roots: number[][]
  neigh: number[][]
} {
  const roots = rootsD4()
  const cells: number[][] = []
  const index = new Map<string, number>()
  for (let a = 0; a < M; a++) {
    for (let b = 0; b < M; b++) {
      for (let c = 0; c < M; c++) {
        for (let d = 0; d < M; d++) {
          if ((a + b + c + d) % 2 === 0) {
            index.set(`${a},${b},${c},${d}`, cells.length)
            cells.push([a, b, c, d])
          }
        }
      }
    }
  }

  const wrap = (x: number): number => ((x % M) + M) % M
  const neigh: number[][] = cells.map(p =>
    roots.map(
      r =>
        index.get(
          `${wrap(p[0]! + r[0]!)},${wrap(p[1]! + r[1]!)},${wrap(p[2]! + r[2]!)},${wrap(p[3]! + r[3]!)}`,
        )!,
    ),
  )

  return { cells, index, roots, neigh }
}
