// Conformance for code/substrate/bethe-tree: the regular tree of coordination number q. The root has q
// children; every later interior cell has q-1 children plus one parent, so degree q; leaves have degree 1.
// Shell sizes grow as q*(q-1)^(r-1), the whole structure is a tree (edges = nodes - 1, acyclic), and
// adjacency is symmetric. All exact integers.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import { betheTree } from '@/code/substrate/bethe-tree'

suite('substrate/bethe-tree: coordination and shells', [
  check('q=3 depth=3 has the expected per-shell node counts', () => {
    const adj = betheTree(3, 3)

    // Shell sizes: 1, q, q(q-1), q(q-1)^2 = 1, 3, 6, 12 -> 22 nodes.
    equal(adj.length, 22, 'total nodes')

    // BFS the adjacency from the root and count by depth, independently.
    const depth = new Array<number>(adj.length).fill(-1)

    depth[0] = 0

    const queue = [0]

    for (const u of queue) {
      for (const v of adj[u]!) {
        if (depth[v] === -1) {
          depth[v] = depth[u]! + 1
          queue.push(v)
        }
      }
    }

    const counts = [0, 0, 0, 0]

    for (const d of depth) {
      counts[d]!++
    }

    equal(counts[0], 1, 'root')
    equal(counts[1], 3, 'shell 1 = q')
    equal(counts[2], 6, 'shell 2 = q(q-1)')
    equal(counts[3], 12, 'shell 3 = q(q-1)^2')
  }),
  check(
    'the root has degree q and interior cells have degree q',
    () => {
      const adj = betheTree(3, 3)

      equal(adj[0]!.length, 3, 'root degree q')

      // a node whose neighbours include deeper nodes is interior (degree q).
      for (let i = 0; i < adj.length; i++) {
        const deg = adj[i]!.length

        ok(
          deg === 1 || deg === 3,
          `node ${i} degree is 1 (leaf) or q=3`,
        )
      }
    },
  ),
])

suite('substrate/bethe-tree: tree structure', [
  check(
    'it is a tree: edges = nodes - 1, and adjacency is symmetric',
    () => {
      const adj = betheTree(4, 2)

      let degSum = 0

      const sets = adj.map(row => new Set(row))

      for (let i = 0; i < adj.length; i++) {
        degSum += adj[i]!.length
        notOk(sets[i]!.has(i), `node ${i} has no self-loop`)

        for (const j of adj[i]!) {
          ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
        }
      }

      equal(degSum / 2, adj.length - 1, 'edges = nodes - 1 (a tree)')
    },
  ),
  check('q=4 depth=2 has root degree 4 and leaves degree 1', () => {
    const adj = betheTree(4, 2)

    // shells 1, 4, 12 -> 17 nodes.
    equal(adj.length, 17, 'node count')
    equal(adj[0]!.length, 4, 'root degree q=4')

    let leaves = 0

    for (const row of adj) {
      if (row.length === 1) {
        leaves++
      }
    }

    equal(leaves, 12, 'outermost shell are leaves')
  }),
])
