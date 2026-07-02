// Conformance for code/measure/connected-correlation.
//   - timeAveragedRingCorrelation: an alternating +/-1 field has mean 0 and C(r) = (-1)^r; a constant
//     field has C(r) = 0 for all r. Re-derived by hand.
//   - correlationLengthFromDecay: a clean C(r) = exp(-r/xi) returns xi; a non-decaying correlator
//     returns Infinity.
//   - connectedCorrelationByDistance on a 4-ring with the alternating field is deterministic (every
//     +/-1 product is fixed by parity), giving C = [1, -1, 1] regardless of which sources are sampled.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  timeAveragedRingCorrelation,
  correlationLengthFromDecay,
  connectedCorrelationByDistance,
} from '@/code/measure/connected-correlation'
import { makeRng } from '@/code/tool/rng'

const TIGHT = 1e-9

suite('measure/connected-correlation: timeAveragedRingCorrelation', [
  check('an alternating field gives C(r) = (-1)^r', () => {
    const c = timeAveragedRingCorrelation({
      tone: Int8Array.from([1, -1, 1, -1]),
      length: 4,
      maxR: 2,
      beats: 1,
      relax: () => undefined,
    })

    close(c[0]!, 1, TIGHT)
    close(c[1]!, -1, TIGHT)
    close(c[2]!, 1, TIGHT)
  }),
  check(
    'a constant field is fully correlated, so connected C(r) = 0',
    () => {
      const c = timeAveragedRingCorrelation({
        tone: Int8Array.from([1, 1, 1, 1]),
        length: 4,
        maxR: 2,
        beats: 1,
        relax: () => undefined,
      })

      close(c[0]!, 0, TIGHT)
      close(c[1]!, 0, TIGHT)
      close(c[2]!, 0, TIGHT)
    },
  ),
])

suite('measure/connected-correlation: correlationLengthFromDecay', [
  check('C(r) = exp(-r/2) recovers xi = 2', () => {
    const correlation = Array.from({ length: 10 }, (_, r) =>
      Math.exp(-r / 2),
    )

    close(
      correlationLengthFromDecay({ correlation, rLo: 1, rHi: 8 }),
      2,
      1e-9,
    )
  }),
  check('a non-decaying correlator has infinite range', () => {
    equal(
      correlationLengthFromDecay({
        correlation: [1, 1, 1, 1, 1],
        rLo: 1,
        rHi: 4,
      }),
      Infinity,
    )
  }),
])

suite('measure/connected-correlation: connectedCorrelationByDistance', [
  check(
    '4-ring alternating field is deterministic: C = [1, -1, 1]',
    () => {
      // ring 0-1-2-3-0: offsets/adj in CSR; distances 0,1,2,1 from any node.
      const c = connectedCorrelationByDistance({
        tone: Int8Array.from([1, -1, 1, -1]),
        offsets: Int32Array.from([0, 2, 4, 6, 8]),
        adj: Int32Array.from([1, 3, 0, 2, 1, 3, 2, 0]),
        size: 4,
        maxRadius: 2,
        samples: 8,
        rng: makeRng({ seed: 1 }),
      })

      close(c[0]!, 1, TIGHT) // on-site variance of +/-1 is exactly 1
      close(c[1]!, -1, TIGHT) // nearest-neighbour anti-correlation
      close(c[2]!, 1, TIGHT) // distance-2 correlation
    },
  ),
])
