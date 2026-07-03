// Conformance for code/substrate/ring: the 1D periodic cycle. Every site has degree 2 (its two cyclic
// neighbours), there are exactly N edges, adjacency is symmetric, and the wraparound joins site 0 to site
// N-1. All exact integers.

import {
  suite,
  check,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import { ringNeighbors, ringEdges } from '@/code/substrate/ring'

suite('substrate/ring: the cycle graph', [
  check('every site has degree 2 with the cyclic neighbours', () => {
    const n = ringNeighbors(6)
    equal(n.length, 6, 'site count')

    for (let x = 0; x < 6; x++) {
      equal(n[x]!.length, 2, `degree of ${x}`)
    }

    exactArray(n[0]!, [5, 1], 'site 0 wraps to 5 and 1')
    exactArray(n[3]!, [2, 4], 'site 3 neighbours')
  }),
  check('adjacency is symmetric', () => {
    const n = ringNeighbors(7)
    const sets = n.map(row => new Set(row))

    for (let x = 0; x < 7; x++) {
      for (const y of n[x]!) {
        ok(sets[y]!.has(x), `edge ${x}-${y} is mutual`)
      }
    }
  }),
  check('a ring of N has exactly N edges (degree sum 2N)', () => {
    const n = ringNeighbors(10)

    let total = 0

    for (const row of n) {
      total += row.length
    }

    equal(total / 2, 10, 'edge count = N')
  }),
  check('ringEdges lists (i, i+1) mod N once each', () => {
    const { eu, ev } = ringEdges(5)
    equal(eu.length, 5, 'edge count')

    for (let i = 0; i < 5; i++) {
      equal(eu[i], i, `eu[${i}]`)
      equal(ev[i], (i + 1) % 5, `ev[${i}]`)
    }

    equal(ev[4], 0, 'last edge wraps to 0')
  }),
])
