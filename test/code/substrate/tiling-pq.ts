// Conformance for code/substrate/tiling-pq: the {p,q} splitting-tree tiling with Zeckendorf addressing.
// The spanning tree carries only parent-child edges, so it is a tree (edges = nodes - 1) with symmetric
// adjacency; the first ring out of the root holds q (or 5 for the pentagrid) cells; and every node address
// is a legal Zeckendorf word (no "11"). Counts and addresses are EXACT.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import { tilingPQ } from '@/code/substrate/tiling-pq'

suite('substrate/tiling-pq: tree structure', [
  check(
    'the pentagrid {5,4} tree has edges = nodes - 1 and is symmetric',
    () => {
      const g = tilingPQ({ p: 5, q: 4, generations: 5 })

      let degSum = 0

      const sets = g.neighbors.map(row => new Set(row))

      for (let i = 0; i < g.size; i++) {
        degSum += g.neighbors[i]!.length
        notOk(sets[i]!.has(i), `node ${i} has no self-loop`)

        for (const j of g.neighbors[i]!) {
          ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
        }
      }

      equal(
        degSum / 2,
        g.size - 1,
        'a spanning tree has nodes - 1 edges',
      )
    },
  ),
  check(
    'the first ring out of the root holds 5 cells (pentagrid)',
    () => {
      const g = tilingPQ({ p: 5, q: 4, generations: 1 })
      // root + its 5 first-ring children.
      equal(g.size, 6, 'root plus 5 children')
      equal(g.neighbors[0]!.length, 5, 'root degree 5')
    },
  ),
  check('a generic {7,3} tree still grows and stays a tree', () => {
    const g = tilingPQ({ p: 7, q: 3, generations: 4 })

    let degSum = 0

    for (const row of g.neighbors) {
      degSum += row.length
    }

    equal(degSum / 2, g.size - 1, 'tree edge count')
    ok(g.size > 1, 'non-trivial')
  }),
])

suite('substrate/tiling-pq: Zeckendorf addressing', [
  check('every node address is a legal Zeckendorf word', () => {
    const g = tilingPQ({ p: 5, q: 4, generations: 5 })
    const addresses = g.address!
    equal(addresses.length, g.size, 'one address per node')

    for (const a of addresses) {
      notOk(a.includes('11'), `address ${a} has no "11"`)
      ok(/^[01]+$/.test(a), `address ${a} is binary`)
    }
  }),
])
