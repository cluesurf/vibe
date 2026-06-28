// Conformance for code/substrate/torus-grid: the periodic d-dimensional mesh (a discrete torus). With no
// boundary, EVERY cell has degree 2d, there are L^d cells, adjacency is symmetric, and there are no
// self-loops (which requires L >= 3, so that a +1 and a -1 step along an axis land on distinct cells). EXACT.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import { torusGrid } from '@/code/substrate/torus-grid'

suite('substrate/torus-grid: uniform degree 2d', [
  check('a 2D torus has L^2 cells, all of degree 4', () => {
    const adj = torusGrid(2, 3)
    equal(adj.length, 9, 'L^d cells')
    for (let i = 0; i < adj.length; i++) {
      equal(adj[i]!.length, 4, `cell ${i} degree 2d=4`)
    }
  }),
  check('a 3D torus has L^3 cells, all of degree 6', () => {
    const adj = torusGrid(3, 3)
    equal(adj.length, 27, 'L^d cells')
    for (let i = 0; i < adj.length; i++) {
      equal(adj[i]!.length, 6, `cell ${i} degree 2d=6`)
    }
  }),
  check('adjacency is symmetric with no self-loops', () => {
    const adj = torusGrid(2, 4)
    const sets = adj.map(row => new Set(row))
    for (let i = 0; i < adj.length; i++) {
      notOk(sets[i]!.has(i), `cell ${i} has no self-loop`)
      for (const j of adj[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
])
