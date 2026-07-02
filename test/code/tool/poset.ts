// Conformance for code/tool/poset: a causal set as a transitive-closure bit matrix
// plus extracted covering relations. We build two tiny posets whose order, covering
// relations, relation count, and interval sizes are all worked out BY HAND, and check
// the implementation reproduces them. Every quantity is an exact count.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  makePosetFromRelation,
  precedes,
  relationCount,
  intervalSize,
  pastMatrix,
  subPoset,
} from '@/code/tool/poset'

// A total order on {0,1,2,3}: a precedes b iff a < b.
// Ordered pairs: C(4,2) = 6. Covering relations form the chain 0->1->2->3.
function totalOrder() {
  return makePosetFromRelation({
    size: 4,
    precedes: ({ a, b }) => a < b,
  })
}

// A diamond: 0 < 1, 0 < 2, 1 < 3, 2 < 3 (and transitively 0 < 3).
// Ordered pairs: {(0,1),(0,2),(0,3),(1,3),(2,3)} = 5.
// Covering relations: 0->1, 0->2, 1->3, 2->3 (0->3 is NOT a cover, reached via 1 or 2).
const DIAMOND_PAIRS = new Set(['0-1', '0-2', '0-3', '1-3', '2-3'])

function diamond() {
  return makePosetFromRelation({
    size: 4,
    precedes: ({ a, b }) => DIAMOND_PAIRS.has(`${a}-${b}`),
  })
}

suite('tool/poset: total order on four elements', [
  check('precedes matches a < b for all pairs', () => {
    const p = totalOrder()

    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        equal(precedes(p, { a, b }), a < b, `precedes(${a},${b})`)
      }
    }
  }),
  check('relationCount = C(4,2) = 6', () => {
    equal(relationCount(totalOrder()), 6, 'ordered pair count')
  }),
  check('covering relations form the chain 0->1->2->3', () => {
    const p = totalOrder()
    exactArray(p.links[0]!, Uint32Array.from([1]), 'links[0]')
    exactArray(p.links[1]!, Uint32Array.from([2]), 'links[1]')
    exactArray(p.links[2]!, Uint32Array.from([3]), 'links[2]')
    exactArray(p.links[3]!, Uint32Array.from([]), 'links[3]')
  }),
  check(
    'interval A(0,3) has the two strictly-between elements 1,2',
    () => {
      const p = totalOrder()
      const past = pastMatrix(p)
      equal(intervalSize(p, { a: 0, b: 3, past }), 2, '|A(0,3)|')
      // A(0,1) is empty (no element strictly between adjacent chain links)
      equal(intervalSize(p, { a: 0, b: 1, past }), 0, '|A(0,1)|')
    },
  ),
])

suite('tool/poset: diamond', [
  check('relationCount = 5', () => {
    equal(relationCount(diamond()), 5, 'ordered pair count')
  }),
  check('covering relations omit the transitive 0->3', () => {
    const p = diamond()
    exactArray(p.links[0]!, Uint32Array.from([1, 2]), 'links[0]')
    exactArray(p.links[1]!, Uint32Array.from([3]), 'links[1]')
    exactArray(p.links[2]!, Uint32Array.from([3]), 'links[2]')
    exactArray(p.links[3]!, Uint32Array.from([]), 'links[3]')
  }),
  check('interval A(0,3) has the two middle elements 1,2', () => {
    const p = diamond()
    const past = pastMatrix(p)
    equal(intervalSize(p, { a: 0, b: 3, past }), 2, '|A(0,3)| diamond')
  }),
  check('subPoset on {0,1,3} keeps the induced order 0<1<3', () => {
    const sub = subPoset(diamond(), { elements: [0, 1, 3] })
    // relabelled 0->0, 1->1, 3->2; chain of three: pairs (0,1),(0,2),(1,2) = 3
    equal(relationCount(sub), 3, 'induced pair count')
    equal(precedes(sub, { a: 0, b: 2 }), true, 'induced 0<3')
  }),
])
