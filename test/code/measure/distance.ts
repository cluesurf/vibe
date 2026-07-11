// Conformance for code/measure/distance: graphDistance (spatial BFS hop count) and
// longestChain (the timelike geodesic / proper time in a causal order). Both are
// checked on hand-built structures: a path and a cycle for hop count, a chain and a
// diamond DAG for the longest chain.

import { suite, check, equal } from '@/test/code/harness'
import { graphDistance, longestChain } from '@/code/measure/distance'
import { makeGraph, Graph } from '@/code/tool/graph'
import { makePosetFromRelation, Poset } from '@/code/tool/poset'

function pathGraph(n: number): Graph {
  const neighbors = Array.from({ length: n }, (_, i) =>
    [i - 1, i + 1].filter(j => j >= 0 && j < n),
  )

  return makeGraph({ size: n, directed: false, neighbors })
}

function posetFromPairs(
  size: number,
  pairs: [number, number][],
): Poset {
  const set = new Set(pairs.map(([a, b]) => a * size + b))

  return makePosetFromRelation({
    size,
    precedes: ({ a, b }) => set.has(a * size + b),
  })
}

suite('measure/distance: graphDistance', [
  check('hop count along a path is the index gap', () => {
    const g = pathGraph(5)

    equal(graphDistance({ substrate: g, from: 0, to: 4 }), 4)
    equal(graphDistance({ substrate: g, from: 1, to: 3 }), 2)
  }),
  check('distance to self is 0', () => {
    equal(graphDistance({ substrate: pathGraph(5), from: 2, to: 2 }), 0)
  }),
  check('a 6-cycle takes the shorter arc', () => {
    const g = makeGraph({
      size: 6,
      directed: false,
      neighbors: Array.from({ length: 6 }, (_, i) => [
        (i + 5) % 6,
        (i + 1) % 6,
      ]),
    })

    equal(graphDistance({ substrate: g, from: 0, to: 3 }), 3)
    equal(graphDistance({ substrate: g, from: 0, to: 5 }), 1)
  }),
  check('an unreachable target returns -1', () => {
    const g = makeGraph({
      size: 4,
      directed: false,
      neighbors: [[1], [0], [3], [2]],
    })

    equal(graphDistance({ substrate: g, from: 0, to: 3 }), -1)
  }),
])

suite('measure/distance: longestChain', [
  check(
    'a 5-element chain has longest chain 4 links from end to end',
    () => {
      const pairs: [number, number][] = []

      for (let a = 0; a < 5; a++) {
        for (let b = a + 1; b < 5; b++) {
          pairs.push([a, b])
        }
      }

      equal(
        longestChain({
          poset: posetFromPairs(5, pairs),
          from: 0,
          to: 4,
        }),
        4,
      )
    },
  ),
  check('a diamond DAG has longest chain 2 from bottom to top', () => {
    // 0 < 1, 0 < 2, 1 < 3, 2 < 3, and the transitive 0 < 3.
    const diamond = posetFromPairs(4, [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [0, 3],
    ])

    equal(longestChain({ poset: diamond, from: 0, to: 3 }), 2)
    equal(longestChain({ poset: diamond, from: 0, to: 1 }), 1)
  }),
  check('unrelated elements have longest chain 0', () => {
    const diamond = posetFromPairs(4, [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [0, 3],
    ])

    equal(longestChain({ poset: diamond, from: 1, to: 2 }), 0)
    equal(longestChain({ poset: diamond, from: 2, to: 2 }), 0)
  }),
])
