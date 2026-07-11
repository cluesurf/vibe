// Conformance for code/operator/signed-majority: the synchronous ternary signed-majority
// rule, its symmetric edge fills, and the asynchronous driver. Facts:
//   - symmetricEdgeFills writes the SAME coupling to both half-edges (exact), ternary.
//   - one synchronous step equals the hand-computed sign of the local field (exact).
//   - keepOnTie holds the current tone on a zero field, otherwise resets to 0 (exact).
//   - the asynchronous driver is deterministic in its seed and reports a sane histogram.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  symmetricEdgeFills,
  signedMajorityStep,
  runAsynchronousSignedMajority,
} from '@/code/operator/signed-majority'
import { makeRng } from '@/code/tool/rng'

// A periodic ring of 4 cells, each linked to its two neighbours.
const ring4: number[][] = [
  [1, 3],
  [0, 2],
  [1, 3],
  [0, 2],
]

suite('operator/signed-majority: symmetric edge fills', [
  check(
    'both half-edges of an undirected edge carry the same coupling',
    () => {
      const fills = symmetricEdgeFills({
        neighbors: ring4,
        rng: makeRng({ seed: 4 }),
      })

      for (let v = 0; v < ring4.length; v++) {
        const row = ring4[v]!

        for (let k = 0; k < row.length; k++) {
          const w = row[k]!
          const kk = ring4[w]!.indexOf(v)

          equal(
            fills[v]![k],
            fills[w]![kk],
            `edge ${v}-${w} is symmetric`,
          )
        }
      }
    },
  ),
  check('every coupling is ternary', () => {
    const fills = symmetricEdgeFills({
      neighbors: ring4,
      rng: makeRng({ seed: 99 }),
    })

    for (const row of fills) {
      for (const f of row)
        ok(f === -1 || f === 0 || f === 1, 'coupling in {-1,0,1}')
    }
  }),
])

suite('operator/signed-majority: synchronous step', [
  // path 0-1-2 with couplings: edge 0-1 = +1, edge 1-2 = -1.
  check(
    'one step equals the sign of the hand-computed local field',
    () => {
      const neighbors = [[1], [0, 2], [1]]
      const fills = [
        Int8Array.from([1]),
        Int8Array.from([1, -1]),
        Int8Array.from([-1]),
      ]

      const tone = Int8Array.from([1, 1, 1])
      const next = signedMajorityStep({ neighbors, fills, tone })

      // next0 = sign(1*tone1) = +1; next1 = sign(1*tone0 - 1*tone2) = sign(0) = 0; next2 = sign(-1*tone1) = -1
      equal(next[0], 1, 'cell 0 -> +1')
      equal(next[1], 0, 'cell 1 has a tied field -> 0')
      equal(next[2], -1, 'cell 2 -> -1')
    },
  ),
  check('keepOnTie holds the current tone on a tied field', () => {
    const neighbors = [[1], [0, 2], [1]]
    const fills = [
      Int8Array.from([1]),
      Int8Array.from([1, -1]),
      Int8Array.from([-1]),
    ]

    const tone = Int8Array.from([1, 1, 1])
    const next = signedMajorityStep({
      neighbors,
      fills,
      tone,
      keepOnTie: true,
    })

    equal(next[1], 1, 'tied cell 1 keeps its current +1')
  }),
])

suite('operator/signed-majority: asynchronous driver', [
  check('is deterministic in its seed', () => {
    const a = runAsynchronousSignedMajority({
      neighbors: ring4,
      beats: 20,
      seed: 5,
    })

    const b = runAsynchronousSignedMajority({
      neighbors: ring4,
      beats: 20,
      seed: 5,
    })

    equal(
      a.settledFraction,
      b.settledFraction,
      'same seed -> same settled fraction',
    )

    equal(
      a.toneHistogram.minus,
      b.toneHistogram.minus,
      'same minus count',
    )
    equal(a.toneHistogram.zero, b.toneHistogram.zero, 'same zero count')
    equal(a.toneHistogram.plus, b.toneHistogram.plus, 'same plus count')
  }),
  check(
    'the histogram covers every cell and settled fraction is in [0,1]',
    () => {
      const r = runAsynchronousSignedMajority({
        neighbors: ring4,
        beats: 30,
        seed: 8,
      })

      const { minus, zero, plus } = r.toneHistogram

      equal(
        minus + zero + plus,
        ring4.length,
        'histogram sums to the cell count',
      )

      ok(
        r.settledFraction >= 0 && r.settledFraction <= 1,
        'settled fraction is a fraction',
      )
    },
  ),
])
