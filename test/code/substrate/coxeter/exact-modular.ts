// Conformance for code/substrate/coxeter/exact-modular: geometry-free cell navigation by modular integer
// arithmetic. A reflection across a face is an involution, so stepping across a face and back returns the
// origin EXACTLY (its fingerprint matches). The facet count of a 2D {p,q} tile is p (pentagon 5, heptagon
// 7), and the BFS-built graph is symmetric with no self-loops. Modular integers, so the identity is exact.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  makeExactEngine,
  buildTilingExact,
} from '@/code/substrate/coxeter/exact-modular'

suite('substrate/coxeter/exact-modular: face reflections are involutions', [
  check('a pentagon cell has 5 faces and each step is reversible', () => {
    const engine = makeExactEngine([5, 4])
    equal(engine.faceCount, 5, '{5,4} facet count')
    const home = engine.fingerprint(engine.origin)
    const neighbors = engine.neighbors(engine.origin)
    equal(neighbors.length, 5, 'five neighbours of the origin')
    for (const nc of neighbors) {
      const back = engine.neighbors(nc).map(c => engine.fingerprint(c))
      ok(back.includes(home), 'stepping back returns the origin')
      notOk(engine.fingerprint(nc) === home, 'a neighbour is not the origin')
    }
  }),
  check('a heptagon cell has 7 faces', () => {
    equal(makeExactEngine([7, 3]).faceCount, 7, '{7,3} facet count')
  }),
])

suite('substrate/coxeter/exact-modular: the built graph', [
  check('{5,4} builds a symmetric degree-5 graph with no self-loops', () => {
    const g = buildTilingExact({ symbol: [5, 4], maxCells: 60 })
    equal(g.facetCount, 5, 'max facet count')
    ok(g.cellCount > 1, 'more than one cell')
    const sets = g.neighbors.map(row => new Set(row))
    for (let i = 0; i < g.cellCount; i++) {
      notOk(sets[i]!.has(i), `cell ${i} has no self-loop`)
      for (const j of g.neighbors[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
  check('{7,3} builds with facet count 7', () => {
    equal(buildTilingExact({ symbol: [7, 3], maxCells: 50 }).facetCount, 7, '{7,3}')
  }),
])
