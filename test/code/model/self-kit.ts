// Conformance for code/model/self-kit: the shared self-dynamics engine. The exact, derivable facts: the
// flat triangular and square graphs have the right per-cell degrees; toCSR round-trips an adjacency list;
// a BFS ball grows from one cell to the whole graph; the boundary fraction is 0 for the whole graph and
// 1 for a lone cell; the conserving beat preserves total charge under the passive (arrow-off) rule; the
// discrete arrow creates balanced pairs (charge unchanged) deterministically; and cluster detection /
// integration read off a hand-built tone. Stochastic emergence is checked for reproducibility.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  flatGraph,
  squareGraph,
  toCSR,
  ball,
  boundaryFraction,
  degreeOf,
  beat,
  totalCharge,
  discreteArrow,
  largestPositiveCluster,
  positiveClusters,
  clusterIntegration,
  countPlus,
  countLargeSameSignComponents,
  emergeSelf,
} from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

suite('model/self-kit: graph construction', [
  // flatGraph(2): the four cells of a 2x2 triangular patch have degrees 2,3,3,2 (corner cells reach two
  // neighbours, the off-diagonal pair reach three via the (1,-1)/(-1,1) bonds).
  check('the flat triangular graph has the right degrees', () => {
    const g = flatGraph(2)
    equal(g.cellCount, 4)
    equal(degreeOf(g, 0), 2)
    equal(degreeOf(g, 1), 3)
    equal(degreeOf(g, 2), 3)
    equal(degreeOf(g, 3), 2)
  }),
  // squareGraph(2): every cell of a 2x2 4-neighbour patch reaches exactly two in-bounds neighbours.
  check('the square graph has degree 2 at every corner', () => {
    const g = squareGraph(2)
    equal(g.cellCount, 4)

    for (let c = 0; c < 4; c++) {
      equal(degreeOf(g, c), 2)
    }
  }),
  check('toCSR round-trips an adjacency list', () => {
    const g = toCSR([[1, 2], [0], [0]])
    equal(g.cellCount, 3)
    equal(degreeOf(g, 0), 2)
    equal(degreeOf(g, 1), 1)
    equal(degreeOf(g, 2), 1)
    // cell 0's neighbours are 1 and 2.
    equal(g.adj[g.offsets[0]!]!, 1)
    equal(g.adj[g.offsets[0]! + 1]!, 2)
  }),
])

suite('model/self-kit: ball and boundary', [
  check(
    'a radius-0 ball is the centre and a large ball is everything',
    () => {
      const g = flatGraph(4)
      equal(ball(g, 5, 0).length, 1)
      equal(
        ball(g, 5, 20).length,
        16,
        'a large ball covers the connected graph',
      )
    },
  ),
  check(
    'boundary fraction is 0 for the whole graph and 1 for a lone cell',
    () => {
      const g = flatGraph(4)
      const all = Array.from({ length: 16 }, (_, i) => i)
      close(
        boundaryFraction(all, g),
        0,
        1e-12,
        'no cell of the full set touches outside',
      )
      close(
        boundaryFraction([5], g),
        1,
        1e-12,
        'a lone cell is all boundary',
      )
    },
  ),
])

suite('model/self-kit: charge conservation', [
  // The passive beat (arrow 0) only annihilates opposite pairs and hops charge, never creates, so the
  // total charge is exactly conserved across many beats.
  check('the passive beat conserves total charge', () => {
    const g = flatGraph(12)
    const tone = new Int8Array(g.cellCount)
    const rng = makeRng({ seed: 1 })

    for (let i = 0; i < tone.length; i++) {
      tone[i] = i % 5 === 0 ? 1 : i % 7 === 0 ? -1 : 0
    }

    const before = totalCharge(tone)
    const moved = new Uint8Array(g.cellCount)

    for (let t = 0; t < 25; t++) {
      beat(tone, g, moved, rng, 0, 0.22)
    }

    equal(
      totalCharge(tone),
      before,
      'arrow-off dynamics conserve charge',
    )
  }),
])

suite('model/self-kit: the discrete arrow', [
  // The discrete arrow creates balanced +1/-1 pairs deterministically, so it adds zero net charge and
  // leaves exactly 2*created nonzero cells.
  check('the arrow creates balanced pairs with zero net charge', () => {
    const g = flatGraph(8)
    const tone = new Int8Array(g.cellCount)
    const created = discreteArrow(tone, g, 0, 4)
    ok(created > 0, 'some pairs were created')
    equal(totalCharge(tone), 0, 'balanced pairs add no net charge')

    let plus = 0
    let minus = 0

    for (const v of tone) {
      if (v === 1) {
        plus++
      } else if (v === -1) {
        minus++
      }
    }

    equal(plus, created, 'one + per pair')
    equal(minus, created, 'one - per pair')
  }),
  check('the arrow is deterministic', () => {
    const g = flatGraph(8)
    const a = new Int8Array(g.cellCount)
    const b = new Int8Array(g.cellCount)
    const ca = discreteArrow(a, g, 2, 4)
    const cb = discreteArrow(b, g, 2, 4)
    equal(ca, cb)
    equal(JSON.stringify(Array.from(a)), JSON.stringify(Array.from(b)))
  }),
])

suite('model/self-kit: cluster detection', [
  // cells 0 and 1 are adjacent (+1), cell 24 is an isolated +1. The largest positive cluster is {0,1}.
  check(
    'largest cluster and component count read a hand-built tone',
    () => {
      const g = flatGraph(5)
      const tone = new Int8Array(g.cellCount)
      tone[0] = 1
      tone[1] = 1
      tone[24] = 1

      const largest = largestPositiveCluster(tone, g)
      equal(largest.length, 2, 'the two-cell cluster is largest')
      equal(
        positiveClusters(tone, g).length,
        2,
        'two positive components total',
      )
      equal(countPlus(tone, [0, 1, 24]), 3)
      equal(
        countLargeSameSignComponents({
          tone,
          g,
          minSize: 2,
          sign: 'positive',
        }),
        1,
        'one component of size >= 2',
      )
      equal(
        countLargeSameSignComponents({
          tone,
          g,
          minSize: 3,
          sign: 'positive',
        }),
        0,
        'no component of size >= 3',
      )
    },
  ),
  // cluster {0,1} on flatGraph(5): cell 0 has degree 2, cell 1 degree 4, 6 directed edges, 2 internal
  // (0->1 and 1->0), so integration = 2/6 = 1/3.
  check('cluster integration is the internal-edge fraction', () => {
    const g = flatGraph(5)
    close(clusterIntegration([0, 1], g), 1 / 3, 1e-12)
  }),
])

suite('model/self-kit: emergence reproducibility', [
  check('emergeSelf is reproducible for a fixed seed', () => {
    const run = (): Int8Array => {
      const g = flatGraph(24)
      const moved = new Uint8Array(g.cellCount)

      return emergeSelf(g, makeRng({ seed: 9 }), moved, { beats: 20 })
        .tone
    }

    const a = run()
    const b = run()
    equal(a.length, b.length)

    for (let i = 0; i < a.length; i++) {
      equal(a[i]!, b[i]!, 'same seed, same emerged field')
    }
  }),
])
