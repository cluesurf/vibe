// Conformance for code/substrate/radial-tree: the breadth-first radial tree of an embedded cell graph.
// The root is the innermost (smallest-radius) cell; every non-root depth is one more than its parent's;
// and the lowest-common-ancestor depth is computed from the tree. We test on an explicit small graph whose
// answers we work out by hand. All exact integers.

import { suite, check, equal } from '@/test/code/harness'
import {
  innermostCell,
  boundaryByRadius,
  radialBfsTree,
} from '@/code/substrate/radial-tree'

suite('substrate/radial-tree: root and boundary', [
  check(
    'the innermost cell has the smallest radius (ties to lowest index)',
    () => {
      equal(innermostCell([0.5, 0.1, 0.9, 0.3]), 1, 'smallest radius')
      equal(innermostCell([0.2, 0.2, 0.9]), 0, 'tie to lowest index')
    },
  ),
  check(
    'boundaryByRadius keeps cells beyond a fraction of the max radius',
    () => {
      const out = boundaryByRadius({
        radii: [0, 1, 2, 3, 4],
        fraction: 0.5,
      })

      // max = 4, cut = 2: keep radii > 2, i.e. indices 3 and 4.
      equal(out.join(','), '3,4', 'outer cells')
    },
  ),
])

suite('substrate/radial-tree: the BFS tree and LCA', [
  check('on a path graph the depths and LCA depths are exact', () => {
    // Path 0-1-2-3 with radii 0,1,2,3: root = 0.
    const neighbors = [[1], [0, 2], [1, 3], [2]]
    const radii = [0, 1, 2, 3]
    const tree = radialBfsTree({ neighbors, radii })

    equal(tree.root, 0, 'root is the innermost cell')
    equal(tree.depth[0], 0, 'depth of root')
    equal(tree.depth[3], 3, 'depth of far end')
    equal(tree.maxDepth, 3, 'max depth')

    // parent depths are one less than the child.
    for (let v = 0; v < neighbors.length; v++) {
      if (v !== tree.root) {
        equal(
          tree.depth[v],
          tree.depth[tree.parent[v]!]! + 1,
          `parent depth of ${v}`,
        )
      }
    }

    // LCA of 2 and 3 on a path rooted at 0 is 2; of 1 and 3 is 1; of 0 and 3 is 0.
    equal(tree.lcaDepth(2, 3), 2, 'lca(2,3)')
    equal(tree.lcaDepth(1, 3), 1, 'lca(1,3)')
    equal(tree.lcaDepth(0, 3), 0, 'lca(0,3)')
    equal(tree.lcaDepth(3, 3), 3, 'lca of a node with itself')
  }),
  check(
    'on a balanced binary tree the LCA depth is the branch point',
    () => {
      //        0
      //      /   \
      //     1     2
      //    / \   / \
      //   3   4 5   6
      const neighbors = [
        [1, 2],
        [0, 3, 4],
        [0, 5, 6],
        [1],
        [1],
        [2],
        [2],
      ]

      const radii = [0, 1, 1, 2, 2, 2, 2]
      const tree = radialBfsTree({ neighbors, radii })

      equal(tree.root, 0, 'root')
      equal(tree.lcaDepth(3, 4), 1, 'siblings under 1')
      equal(tree.lcaDepth(3, 6), 0, 'cross-subtree meets at the root')
      equal(tree.lcaDepth(5, 6), 1, 'siblings under 2')
    },
  ),
])
