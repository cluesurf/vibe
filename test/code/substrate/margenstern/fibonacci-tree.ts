// Conformance for code/substrate/margenstern/fibonacci-tree: navigating the pentagrid/heptagrid by pure
// address arithmetic. The load-bearing invariant is that father and sons are inverse: every son's father
// is the node, depth grows by one at each son, and the per-level node counts are 1, 3, 8, 21, 55 (the
// golden-ratio-squared splitting). A route is a walk along genuine tree edges. All integer, so EXACT.

import {
  suite,
  check,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  father,
  continuator,
  nodeType,
  sons,
  depth,
  pathToRoot,
  route,
} from '@/code/substrate/margenstern/fibonacci-tree'

suite(
  'substrate/margenstern/fibonacci-tree: father and sons are inverse',
  [
    check('every son has the node as its father', () => {
      for (let n = 1; n <= 60; n++) {
        for (const s of sons(n)) {
          equal(father(s), n, `father(son ${s} of ${n})`)
        }
      }
    }),
    check(
      'a node has 3 sons (white) or 2 sons (black) matching nodeType',
      () => {
        for (let n = 1; n <= 60; n++) {
          equal(
            sons(n).length,
            nodeType(n),
            `son count = nodeType for ${n}`,
          )
          ok(
            nodeType(n) === 2 || nodeType(n) === 3,
            `nodeType in {2,3} for ${n}`,
          )
        }
      },
    ),
    check('the continuator is the middle/first preferred son', () => {
      for (let n = 2; n <= 60; n++) {
        ok(
          sons(n).includes(continuator(n)),
          `continuator is a son of ${n}`,
        )
      }
    }),
    check('a son sits one level below its parent', () => {
      for (let n = 1; n <= 60; n++) {
        for (const s of sons(n)) {
          equal(depth(s), depth(n) + 1, `depth(${s}) = depth(${n})+1`)
        }
      }
    }),
  ],
)

suite('substrate/margenstern/fibonacci-tree: depth, paths and routes', [
  check('the root has depth 0 and pathToRoot ends at 1', () => {
    equal(depth(1), 0, 'root depth')

    for (let n = 1; n <= 50; n++) {
      const p = pathToRoot(n)
      equal(p[0], n, 'path starts at the node')
      equal(p[p.length - 1], 1, 'path ends at the root')
      equal(p.length, depth(n) + 1, 'path length = depth + 1')
    }
  }),
  check('per-level node counts are 1, 3, 8, 21, 55', () => {
    // BFS the tree by sons() and count cells at each depth, independently of the
    // sector-generation closed form.
    const counts: number[] = []

    let frontier = [1]

    for (let level = 0; level < 5; level++) {
      counts.push(frontier.length)

      const next: number[] = []

      for (const node of frontier) {
        next.push(...sons(node))
      }

      frontier = next
    }

    exactArray(counts, [1, 3, 8, 21, 55], 'level counts')
  }),
  check(
    'a route walks only true tree edges and reaches its target',
    () => {
      const pairs: [number, number][] = [
        [5, 17],
        [12, 30],
        [4, 40],
        [9, 9],
      ]

      for (const [from, to] of pairs) {
        const r = route(from, to)
        equal(r[0], from, `route starts at ${from}`)
        equal(r[r.length - 1], to, `route ends at ${to}`)

        for (let i = 0; i + 1 < r.length; i++) {
          const a = r[i]!
          const b = r[i + 1]!
          // every step is a parent/child edge: one is the father of the other.
          ok(
            father(a) === b || father(b) === a,
            `step ${a}->${b} is a tree edge`,
          )
        }
      }
    },
  ),
])
