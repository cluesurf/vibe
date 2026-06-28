// Conformance for code/substrate/margenstern/pentagrid: the pentagrid {5,4} built from pure address
// arithmetic. The defining facts are that the graph is 5-regular (every tile has exactly five neighbours),
// adjacency is symmetric with no self-loops, and there are four quarter roots. Exact integer construction.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  pentagridNeighbors,
  pentagridRoots,
  buildPentagridPure,
} from '@/code/substrate/margenstern/pentagrid'

suite('substrate/margenstern/pentagrid: the address-arithmetic graph', [
  check('there are four quarter roots, each with five neighbours', () => {
    const roots = pentagridRoots()
    equal(roots.length, 4, 'quarter roots')
    for (const r of roots) {
      equal(pentagridNeighbors(r).length, 5, 'root has 5 neighbours')
    }
  }),
  check('every tile reports exactly five neighbours', () => {
    // pentagridNeighbors is the local 5-neighbour rule; it returns five for any tile.
    for (let q = 0; q < 4; q++) {
      for (let n = 1; n <= 40; n++) {
        equal(pentagridNeighbors({ q, n }).length, 5, `tile ${q}.${n}`)
      }
    }
  }),
  check('the built graph is 5-regular in its interior', () => {
    const grid = buildPentagridPure({ maxCells: 2000 })
    equal(grid.facetCount, 5, 'max degree is 5')
    // No tile exceeds degree 5; interior tiles (all neighbours materialized) reach it.
    // (In a hyperbolic tiling the boundary dominates, so we only require that the
    // full-degree interior is non-empty, not a majority.)
    let full = 0
    for (const row of grid.neighbors) {
      if (row.length === 5) {
        full++
      }
      ok(row.length <= 5, 'no tile exceeds degree 5')
    }
    ok(full > 0, 'the interior carries full degree-5 tiles')
  }),
  check('adjacency is symmetric with no self-loops', () => {
    const grid = buildPentagridPure({ maxCells: 1500 })
    const sets = grid.neighbors.map(row => new Set(row))
    for (let i = 0; i < grid.cellCount; i++) {
      notOk(sets[i]!.has(i), `cell ${i} has no self-loop`)
      for (const j of grid.neighbors[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
])
