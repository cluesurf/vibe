// Conformance for code/substrate/modular-mesh: numCells cohesive cells of cellSize vibes, dense inside and
// sparse between. The cell labelling is exact (cellOf[c*cellSize + i] = c), the node count is the product,
// adjacency is symmetric with no self-loops, every fill is +1, and the whole build is a pure function of the
// seed. EXACT for labels and determinism.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import { modularMesh } from '@/code/substrate/modular-mesh'
import { makeRng } from '@/code/tool/rng'

const cfg = {
  numCells: 5,
  cellSize: 8,
  intraDegree: 3,
  interPerCell: 2,
}

suite('substrate/modular-mesh: structure', [
  check(
    'node count is numCells * cellSize and the cell labels are exact',
    () => {
      const { g, cellOf } = modularMesh({
        ...cfg,
        rng: makeRng({ seed: 1 }),
      })

      equal(g.size, cfg.numCells * cfg.cellSize, 'node count')

      for (let c = 0; c < cfg.numCells; c++) {
        for (let i = 0; i < cfg.cellSize; i++) {
          equal(
            cellOf[c * cfg.cellSize + i],
            c,
            `cell label of ${c}.${i}`,
          )
        }
      }
    },
  ),
  check(
    'adjacency is symmetric with no self-loops and all fills are +1',
    () => {
      const { g, fills } = modularMesh({
        ...cfg,
        rng: makeRng({ seed: 1 }),
      })

      const sets = g.neighbors.map(row => new Set(row))

      for (let i = 0; i < g.size; i++) {
        notOk(sets[i]!.has(i), `node ${i} has no self-loop`)

        for (const j of g.neighbors[i]!) {
          ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
        }

        for (const f of fills[i]!) {
          equal(f, 1, `fill of node ${i} is +1`)
        }
      }
    },
  ),
])

suite('substrate/modular-mesh: determinism', [
  check('the same seed reproduces the same mesh', () => {
    const a = modularMesh({ ...cfg, rng: makeRng({ seed: 99 }) })
    const b = modularMesh({ ...cfg, rng: makeRng({ seed: 99 }) })

    for (let i = 0; i < a.g.size; i++) {
      exactArray(
        Array.from(a.g.neighbors[i]!),
        Array.from(b.g.neighbors[i]!),
        `neighbours of ${i} identical`,
      )
    }
  }),
])
