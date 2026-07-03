// Conformance for code/substrate/tree-addressing: a Margenstern-style spanning tree over an embedded graph,
// with address-only routing. The root is the most-connected cell with depth 0 and self-parent; addresses
// are unique; and a route by address alone walks only true graph edges from the source to the target. We
// build the tree over the modular-group Cayley graph (which carries an embedding). EXACT integers.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  buildAddressedTree,
  routeByAddress,
} from '@/code/substrate/tree-addressing'
import { modularGraph } from '@/code/substrate/modular-group'

suite('substrate/tree-addressing: the spanning tree', [
  check('the root has depth 0 and is its own parent', () => {
    const g = modularGraph(60)
    const tree = buildAddressedTree(g)
    equal(tree.depth[tree.root], 0, 'root depth 0')
    equal(tree.parent[tree.root], tree.root, 'root is self-parent')
    equal(tree.levelSizes[0], 1, 'level 0 has just the root')
  }),
  check('every reachable cell has a unique address', () => {
    const g = modularGraph(60)
    const tree = buildAddressedTree(g)
    const seen = new Set<string>()

    for (let v = 0; v < g.size; v++) {
      if (tree.depth[v] === -1) {
        continue
      }

      const key = tree.address[v]!.join(',')
      notOk(seen.has(key), `address of ${v} is unique`)
      seen.add(key)
    }
  }),
  check('a child sits one level below its parent', () => {
    const g = modularGraph(60)
    const tree = buildAddressedTree(g)

    for (let v = 0; v < g.size; v++) {
      if (tree.depth[v] === -1 || v === tree.root) {
        continue
      }

      equal(
        tree.depth[v],
        tree.depth[tree.parent[v]!]! + 1,
        `parent depth of ${v}`,
      )
    }
  }),
])

suite('substrate/tree-addressing: routing by address', [
  check('a route walks only graph edges and reaches its target', () => {
    const g = modularGraph(60)
    const tree = buildAddressedTree(g)
    const sets = g.neighbors.map(row => new Set(row))

    // pick the deepest reachable node as the target.
    let target = tree.root

    for (let v = 0; v < g.size; v++) {
      if (
        tree.depth[v] !== -1 &&
        tree.depth[v]! > tree.depth[target]!
      ) {
        target = v
      }
    }

    const route = routeByAddress(tree, tree.root, target)
    equal(route[0], tree.root, 'starts at the root')
    equal(route[route.length - 1], target, 'ends at the target')

    for (let i = 0; i + 1 < route.length; i++) {
      ok(
        sets[route[i]!]!.has(route[i + 1]!),
        `step ${route[i]}->${route[i + 1]} is a graph edge`,
      )
    }
  }),
])
