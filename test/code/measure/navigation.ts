// Conformance for code/measure/navigation. greedyRouteHops steps each move to the neighbor closest to
// the target by embedding distance, returning the hop count or -1 when it stalls at a local minimum.
// On a path with a monotone Euclidean (non-hyperbolic) embedding, greedy descent reaches the far end
// in exactly (distance) hops; on a graph whose only neighbor is farther than the current node it
// stalls (-1). Both outcomes are re-derived by hand.

import { suite, check, equal } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import { Embedding } from '@/code/tool/embedding'
import { greedyRouteHops } from '@/code/measure/navigation'

// A 1D Euclidean embedding (Minkowski spec keeps targetDistance on the Euclidean branch).
function lineEmbedding(positions: number[]): Embedding {
  return {
    form: 'embedding',
    dimension: 1,
    signature: 'riemannian',
    coords: Float64Array.from(positions),
    manifold: { form: 'minkowski', dimension: 1 },
  }
}

suite('measure/navigation: greedyRouteHops', [
  check('greedy descent on a monotone path reaches the far end', () => {
    // path 0-1-2-3-4 with coords 0..4: each step moves one closer; 4 hops to the end.
    const graph = makeGraph({
      size: 5,
      directed: false,
      neighbors: [[1], [0, 2], [1, 3], [2, 4], [3]],
      embedding: lineEmbedding([0, 1, 2, 3, 4]),
    })
    equal(greedyRouteHops({ graph, source: 0, target: 4 }), 4)
  }),
  check('source equal to target takes 0 hops', () => {
    const graph = makeGraph({
      size: 5,
      directed: false,
      neighbors: [[1], [0, 2], [1, 3], [2, 4], [3]],
      embedding: lineEmbedding([0, 1, 2, 3, 4]),
    })
    equal(greedyRouteHops({ graph, source: 2, target: 2 }), 0)
  }),
  check('greedy stalls (-1) when no neighbor is closer to the target', () => {
    // node 0 (pos 0) only neighbor is node 1 (pos 5); target node 2 sits at pos 1.
    // |0-1| = 1 < |5-1| = 4, so the only neighbor is farther: a local minimum.
    const graph = makeGraph({
      size: 3,
      directed: false,
      neighbors: [[1], [0], []],
      embedding: lineEmbedding([0, 5, 1]),
    })
    equal(greedyRouteHops({ graph, source: 0, target: 2 }), -1)
  }),
])
