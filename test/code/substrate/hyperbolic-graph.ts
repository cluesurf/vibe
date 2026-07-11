// Conformance for code/substrate/hyperbolic-graph: hyperbolic disc graphs built by area-measure sprinkling
// and hyperbolic-proximity connection. Every builder embeds points strictly inside the Poincare disc, the
// adjacency is symmetric, and the deterministic builders (sunflower, Halton, tiling) reproduce identical
// graphs on a rebuild, while the seeded random builder reproduces under a fixed seed. EXACT for adjacency.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import {
  hyperbolicGraph,
  hyperbolicHalton,
  hyperbolicSunflower,
  hyperbolicTiling,
} from '@/code/substrate/hyperbolic-graph'
import { Graph } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'

function assertInsideDisc(g: Graph, label: string): void {
  const coords = g.embedding!.coords

  for (let i = 0; i < g.size; i++) {
    const r = Math.hypot(coords[i * 2] ?? 0, coords[i * 2 + 1] ?? 0)

    ok(r < 1, `${label}: node ${i} inside the unit disc`)
  }
}

function assertSymmetric(g: Graph, label: string): void {
  const sets = g.neighbors.map(row => new Set(row))

  for (let i = 0; i < g.size; i++) {
    notOk(sets[i]!.has(i), `${label}: node ${i} has no self-loop`)

    for (const j of g.neighbors[i]!)
      ok(sets[j]!.has(i), `${label}: edge ${i}-${j} is mutual`)
  }
}

const flatNeighbors = (g: Graph): number[] =>
  g.neighbors.flatMap(r => Array.from(r))

suite('substrate/hyperbolic-graph: embedding and symmetry', [
  check(
    'the sunflower graph embeds inside the disc and is symmetric',
    () => {
      const g = hyperbolicSunflower({
        count: 80,
        radius: 5,
        connectThreshold: 1.2,
      })

      assertInsideDisc(g, 'sunflower')
      assertSymmetric(g, 'sunflower')
    },
  ),
  check(
    'the regular {5,4} tiling embeds inside the disc and is symmetric',
    () => {
      const g = hyperbolicTiling({
        p: 5,
        q: 4,
        depth: 3,
        connectThreshold: 1.2,
      })

      assertInsideDisc(g, 'tiling')
      assertSymmetric(g, 'tiling')
    },
  ),
])

suite('substrate/hyperbolic-graph: determinism', [
  check('the sunflower (no rng) rebuilds identically', () => {
    const a = hyperbolicSunflower({
      count: 60,
      radius: 4,
      connectThreshold: 1,
    })

    const b = hyperbolicSunflower({
      count: 60,
      radius: 4,
      connectThreshold: 1,
    })

    exactArray(
      flatNeighbors(a),
      flatNeighbors(b),
      'sunflower adjacency',
    )
  }),
  check('the Halton graph rebuilds identically', () => {
    const a = hyperbolicHalton({
      count: 60,
      radius: 4,
      connectThreshold: 1,
    })

    const b = hyperbolicHalton({
      count: 60,
      radius: 4,
      connectThreshold: 1,
    })

    exactArray(flatNeighbors(a), flatNeighbors(b), 'halton adjacency')
  }),
  check(
    'the seeded random graph reproduces under the same seed',
    () => {
      const a = hyperbolicGraph({
        count: 60,
        radius: 4,
        connectThreshold: 1,
        rng: makeRng({ seed: 7 }),
      })

      const b = hyperbolicGraph({
        count: 60,
        radius: 4,
        connectThreshold: 1,
        rng: makeRng({ seed: 7 }),
      })

      equal(a.size, b.size, 'same size')
      exactArray(
        flatNeighbors(a),
        flatNeighbors(b),
        'random adjacency under fixed seed',
      )
    },
  ),
])
