// Conformance for code/substrate/psl-cayley: the Cayley graph of PSL(2,p). The group order is the textbook
// |PSL(2,p)| = p(p^2 - 1)/2 (60 for p=5, 168 for p=7), the standard generator set is closed under inverse so
// the graph is symmetric and vertex-transitive (every vertex the same degree), and matrix multiply mod p has
// the identity as a unit. All exact modular integers.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  ProjectiveMatrix,
  projectiveMultiply,
  standardPslGenerators,
  pslCayleyGraph,
} from '@/code/substrate/psl-cayley'

const order = (p: number): number => (p * (p * p - 1)) / 2

suite('substrate/psl-cayley: group order', [
  check('PSL(2,5) and PSL(2,7) reach the textbook order', () => {
    for (const p of [5, 7, 11]) {
      const g = pslCayleyGraph({ p, generators: standardPslGenerators(p) })
      equal(g.matrices.length, order(p), `|PSL(2,${p})| = ${order(p)}`)
      equal(g.keys.length, g.matrices.length, 'one key per element')
    }
  }),
])

suite('substrate/psl-cayley: Cayley graph structure', [
  check('the graph is vertex-transitive (uniform degree) and symmetric', () => {
    const p = 7
    const g = pslCayleyGraph({ p, generators: standardPslGenerators(p) })
    const deg = g.adjacency[0]!.length
    ok(deg >= 1, 'positive degree')
    for (let i = 0; i < g.adjacency.length; i++) {
      equal(g.adjacency[i]!.length, deg, `node ${i} has uniform degree`)
    }
    const sets = g.adjacency.map(row => new Set(row))
    for (let i = 0; i < g.adjacency.length; i++) {
      notOk(sets[i]!.has(i), `node ${i} has no self-loop`)
      for (const j of g.adjacency[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
  check('matrix multiply mod p has the identity as a unit', () => {
    const id: ProjectiveMatrix = [1, 0, 0, 1]
    const m: ProjectiveMatrix = [2, 3, 1, 4]
    equal(projectiveMultiply(id, m, 7).join(','), m.join(','), 'I*M = M')
    equal(projectiveMultiply(m, id, 7).join(','), m.join(','), 'M*I = M')
  }),
])
