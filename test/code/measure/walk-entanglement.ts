// Conformance for code/measure/walk-entanglement: interval entropy of the coined Dirac walk.
//
// Exact anchor: at mass theta = pi/2 the lower-band projector averages over momentum to C(0) = (1/2) I
// (the sin/cos sums over a full period vanish exactly), so a length-1 interval is two independent modes
// each at occupation 1/2, giving entropy 2 ln 2 EXACTLY, independent of the momentum sampling. We
// re-derive this by hand and pin it. We also pin non-negativity/finiteness, and the area-law ordering:
// a near-gapless (small-mass) walk carries MORE interval entropy than a maximally gapped one.

import { suite, check, close, ok, allFinite } from '@/test/code/harness'
import { coinedWalkIntervalEntropy } from '@/code/measure/walk-entanglement'

const LN2 = Math.log(2)

suite(
  'measure/walk-entanglement: exact length-1 anchor at theta = pi/2',
  [
    check('a length-1 interval has entropy exactly 2 ln 2', () => {
      // C(0) = (1/2) I -> four occupation-1/2 modes in the real embedding, /2 -> 2 ln 2.
      const s = coinedWalkIntervalEntropy({
        theta: Math.PI / 2,
        momentumCount: 64,
        intervalLength: 1,
      })

      close(s, 2 * LN2, 1e-7)
    }),
    check(
      'independent of the momentum sampling (32 vs 96 agree)',
      () => {
        const a = coinedWalkIntervalEntropy({
          theta: Math.PI / 2,
          momentumCount: 32,
          intervalLength: 1,
        })

        const b = coinedWalkIntervalEntropy({
          theta: Math.PI / 2,
          momentumCount: 96,
          intervalLength: 1,
        })

        close(a, b, 1e-9)
      },
    ),
  ],
)

suite('measure/walk-entanglement: physical bounds and the area law', [
  check(
    'entropy is finite and non-negative across masses and lengths',
    () => {
      const values: number[] = []

      for (const theta of [0.1, 0.6, Math.PI / 2]) {
        for (const intervalLength of [2, 4, 6]) {
          const s = coinedWalkIntervalEntropy({
            theta,
            momentumCount: 96,
            intervalLength,
          })

          values.push(s)
          ok(s >= -1e-9, `entropy must be non-negative, got ${s}`)
        }
      }

      allFinite(values)
    },
  ),
  check(
    'a near-gapless walk carries more interval entropy than a gapped one',
    () => {
      // gapless (small mass) entropy grows with length; the maximal-gap walk saturates lower.
      const gapless = coinedWalkIntervalEntropy({
        theta: 0.05,
        momentumCount: 128,
        intervalLength: 8,
      })

      const gapped = coinedWalkIntervalEntropy({
        theta: Math.PI / 2,
        momentumCount: 128,
        intervalLength: 8,
      })

      ok(
        gapless > gapped,
        `gapless ${gapless} should exceed gapped ${gapped}`,
      )
    },
  ),
])
