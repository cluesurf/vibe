// Conformance for code/substrate/coxeter/matrix-group: the reflection group as a matrix Cayley graph. Each
// generator R_i = I - 2 G_i is a reflection, hence an involution (R_i^2 = I). For a FINITE (spherical)
// symbol the BFS closes, and the cell count equals the group order, which we re-derive: |I2(m)| = 2m,
// |A3| = 24. The adjacency of a closed group is complete (no -1). Floating but exact-in-principle.

import {
  suite,
  check,
  equal,
  ok,
  closeArray,
} from '@/test/code/harness'
import {
  reflections,
  multiply,
  buildCoxeterMatrixMesh,
} from '@/code/substrate/coxeter/matrix-group'

const flat = (m: number[][]): number[] => m.flat()
const identity = (n: number): number[][] =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

suite('substrate/coxeter/matrix-group: generators are involutions', [
  check('each reflection squares to the identity', () => {
    for (const symbol of [[3], [4], [3, 3], [5, 3]]) {
      const gens = reflections(symbol)
      const n = symbol.length + 1

      equal(
        gens.length,
        n,
        `${String(symbol)}: one reflection per mirror`,
      )

      for (const r of gens) {
        closeArray(
          flat(multiply(r, r)),
          flat(identity(n)),
          1e-9,
          `R^2 = I for {${String(symbol)}}`,
        )
      }
    }
  }),
])

suite(
  'substrate/coxeter/matrix-group: finite cell counts are group orders',
  [
    check('dihedral and A3 meshes close at the group order', () => {
      for (const [symbol, order] of [
        [[3], 6],
        [[4], 8],
        [[5], 10],
        [[3, 3], 24],
      ] as const) {
        const { shells, adjacency } = buildCoxeterMatrixMesh(
          [...symbol],
          2000,
        )

        const total = shells.reduce((a, b) => a + b, 0)

        equal(total, order, `|{${String(symbol)}}| = ${order}`)
        equal(shells[0], 1, 'identity at shell 0')

        // a closed finite group has every generator-neighbour inside the mesh.
        for (const row of adjacency) {
          for (const j of row) {
            ok(j >= 0, 'no neighbour falls outside a closed mesh')
          }
        }
      }
    }),
  ],
)
