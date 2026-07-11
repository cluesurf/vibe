// Conformance for code/geometry/tree-embedding: the Sarkar embedding of a complete tree
// into the Poincare disk. The exact facts are combinatorial (a complete b-ary tree's node
// count, the hop distances through the lowest common ancestor). The geometric fact is that
// the hyperbolic embedding places every tree edge at exactly the requested hyperbolic
// length (Mobius isometries preserve it), and embeds the tree with LOWER distortion than
// the Euclidean plane can. Counts are exact; the edge length is real-valued (tight tol).

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  hyperbolicDistance,
  completeTree,
  treeDistance,
  embedTree,
  embeddingDistortion,
} from '@/code/geometry/tree-embedding'

// Depth of every node from the parent array (parents always precede children).
function depthsFrom(parent: number[]): number[] {
  const depth = new Array<number>(parent.length).fill(0)

  for (let i = 0; i < parent.length; i++) {
    const p = parent[i]!

    depth[i] = p < 0 ? 0 : depth[p]! + 1
  }

  return depth
}

suite('geometry/tree-embedding: the complete tree', [
  check('a complete b-ary tree has (b^(d+1) - 1)/(b - 1) nodes', () => {
    const b = 2
    const d = 3
    const tree = completeTree({ branching: b, depth: d })

    equal(tree.size, (Math.pow(b, d + 1) - 1) / (b - 1), 'node count') // 15
  }),
  check(
    'every internal node has exactly b children and there are b^d leaves',
    () => {
      const b = 2
      const d = 3
      const tree = completeTree({ branching: b, depth: d })

      let leaves = 0
      let internal = 0

      for (const kids of tree.children) {
        if (kids.length === 0) {
          leaves++
        } else {
          internal++
          equal(kids.length, b, 'internal node child count')
        }
      }

      equal(leaves, Math.pow(b, d), 'leaf count') // 8
      equal(internal, tree.size - Math.pow(b, d), 'internal count')
    },
  ),
])

suite('geometry/tree-embedding: hop distance', [
  check(
    'tree distances match the hand-computed values on a depth-2 binary tree',
    () => {
      // parent = [-1,0,0,1,1,2,2], depth = [0,1,1,2,2,2,2]
      const tree = completeTree({ branching: 2, depth: 2 })
      const depth = depthsFrom(tree.parent)

      equal(treeDistance(tree.parent, depth, 3, 3), 0, 'd(x,x)=0')
      equal(treeDistance(tree.parent, depth, 3, 4), 2, 'siblings')
      equal(
        treeDistance(tree.parent, depth, 1, 2),
        2,
        'level-1 siblings',
      )
      equal(treeDistance(tree.parent, depth, 0, 5), 2, 'root to leaf')
      equal(
        treeDistance(tree.parent, depth, 3, 5),
        4,
        'cross-subtree leaves',
      )

      equal(
        treeDistance(tree.parent, depth, 3, 6),
        4,
        'cross-subtree leaves',
      )
    },
  ),
])

suite('geometry/tree-embedding: the isometric placement', [
  check(
    'every tree edge has exactly the requested hyperbolic length',
    () => {
      // Each child sits at Poincare radius tanh(edge/2) in the parent's frame, mapped out by
      // a Mobius isometry, so the hyperbolic distance parent-to-child is the edge length for
      // every edge, not only the root's.
      const edge = 1.0
      const tree = completeTree({ branching: 2, depth: 3 })
      const { coords } = embedTree({
        parent: tree.parent,
        children: tree.children,
        edge,
        hyperbolic: true,
      })

      for (let i = 1; i < tree.size; i++) {
        const p = tree.parent[i]!

        close(
          hyperbolicDistance(coords[i]!, coords[p]!),
          edge,
          1e-9,
          `edge ${p}-${i}`,
        )
      }
    },
  ),
  check(
    'hyperbolicDistance is symmetric and zero on the diagonal',
    () => {
      const z: [number, number] = [0.3, -0.2]
      const w: [number, number] = [-0.1, 0.4]

      close(hyperbolicDistance(z, z), 0, 1e-12, 'd(z,z)=0')
      close(
        hyperbolicDistance(z, w),
        hyperbolicDistance(w, z),
        1e-12,
        'symmetry',
      )
    },
  ),
])

suite('geometry/tree-embedding: distortion bound', [
  check('hyperbolic distortion is finite and at least 1', () => {
    const tree = completeTree({ branching: 3, depth: 3 })
    const embed = embedTree({
      parent: tree.parent,
      children: tree.children,
      edge: 1,
      hyperbolic: true,
    })

    const distortion = embeddingDistortion({
      coords: embed.coords,
      depth: embed.depth,
      parent: tree.parent,
      hyperbolic: true,
    })

    ok(Number.isFinite(distortion), 'finite')
    ok(distortion >= 1, `distortion ${distortion} must be >= 1`)
  }),
  check(
    'the Euclidean plane distorts the tree more than hyperbolic space',
    () => {
      const tree = completeTree({ branching: 3, depth: 3 })
      const hyp = embedTree({
        parent: tree.parent,
        children: tree.children,
        edge: 1,
        hyperbolic: true,
      })

      const euc = embedTree({
        parent: tree.parent,
        children: tree.children,
        edge: 1,
        hyperbolic: false,
      })

      const hypD = embeddingDistortion({
        coords: hyp.coords,
        depth: hyp.depth,
        parent: tree.parent,
        hyperbolic: true,
      })

      const eucD = embeddingDistortion({
        coords: euc.coords,
        depth: euc.depth,
        parent: tree.parent,
        hyperbolic: false,
      })

      ok(
        eucD > hypD,
        `Euclidean distortion ${eucD} should exceed hyperbolic ${hypD}`,
      )
    },
  ),
])
