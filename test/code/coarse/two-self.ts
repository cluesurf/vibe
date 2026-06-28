// Conformance for code/coarse/two-self: the two-self interaction machinery. The exact, derivable parts
// are the stamping and the observables: stamping a k-cell shape sets exactly k plus cells; the plus
// count is the exact charge tally; and the two-self separation is the Euclidean distance between the
// two largest clusters' centroids (0 when only one cluster survives). emergeSelfShape (stochastic) is
// checked for reproducibility and self-consistency.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  emergeSelfShape,
  stampShape,
  plusCount,
  twoSelfSeparation,
} from '@/code/coarse/two-self'
import { flatGraph } from '@/code/model/self-kit'

// an L-tromino, three mutually-adjacent cells on the triangular flat graph.
const tromino: (readonly [number, number])[] = [
  [0, 0],
  [1, 0],
  [0, 1],
]

suite('coarse/two-self: stamping and counting', [
  check('stamping a k-cell shape sets exactly k plus cells', () => {
    const L = 20
    const tone = new Int8Array(L * L)
    stampShape({ tone, L, offsets: tromino, px: 5, py: 5 })
    equal(plusCount(tone), 3, 'three cells stamped, three plus charges')
  }),
  check('plusCount counts only +1 cells', () => {
    const tone = Int8Array.from([1, 0, -1, 1, 1, -1, 0])
    equal(plusCount(tone), 3)
  }),
  check('stamping off the lattice clips out-of-bounds cells', () => {
    const L = 8
    const tone = new Int8Array(L * L)
    // place at the far corner so the +x and +y offsets fall outside, leaving only [0,0].
    stampShape({ tone, L, offsets: tromino, px: L - 1, py: L - 1 })
    equal(plusCount(tone), 1, 'only the in-bounds offset is stamped')
  }),
])

suite('coarse/two-self: separation observable', [
  // two trominoes 10 columns apart on the same rows: centroids differ by 10 in x, 0 in y.
  check('separation is the centroid distance of the two clusters', () => {
    const L = 24
    const graph = flatGraph(L)
    const tone = new Int8Array(L * L)
    stampShape({ tone, L, offsets: tromino, px: 2, py: 2 })
    stampShape({ tone, L, offsets: tromino, px: 12, py: 2 })
    const sep = twoSelfSeparation({ tone, graph, L, minSize: 3 })
    close(sep, 10, 1e-9, 'two clusters 10 columns apart')
  }),
  check('a single cluster reports separation 0', () => {
    const L = 24
    const graph = flatGraph(L)
    const tone = new Int8Array(L * L)
    stampShape({ tone, L, offsets: tromino, px: 5, py: 5 })
    equal(twoSelfSeparation({ tone, graph, L, minSize: 3 }), 0)
  }),
])

suite('coarse/two-self: emerged shape', [
  check('an emerged shape is reproducible and self-consistent', () => {
    const a = emergeSelfShape({ L: 20, seed: 3 })
    const b = emergeSelfShape({ L: 20, seed: 3 })
    equal(a.size, b.size, 'same seed, same size')
    equal(a.size, a.offsets.length, 'size matches the offset count')
    equal(a.L, 20)
    ok(a.size > 0, 'a self emerged')
  }),
])
