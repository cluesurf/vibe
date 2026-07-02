// Conformance for code/measure/sketch. The hashing is a fixed deterministic mix, so we test it on
// degenerate cases with a forced answer: a 1-slot Bloom filter has every bit set after any insert, so
// every query is a false positive (rate 1); an empty filter never matches (rate 0). A 1-slot open
// hash table places the first key in 1 probe and collides the second in 2 probes (rate 1/2, mean
// probe 3/2). cellHash is checked for determinism and range.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  cellHash,
  hashTableProbeStats,
  bloomFalsePositiveRate,
} from '@/code/measure/sketch'

suite('measure/sketch: cellHash', [
  check('deterministic and in range', () => {
    equal(cellHash(123, 1000), cellHash(123, 1000))

    const h = cellHash(123, 1000)
    ok(h >= 0 && h < 1000)
  }),
])

suite('measure/sketch: hashTableProbeStats', [
  check('a single key never collides (mean probe 1)', () => {
    const s = hashTableProbeStats({ cells: 10, keys: 1 })
    equal(s.collisionRate, 0)
    close(s.meanProbe, 1, 1e-12)
  }),
  check('a 1-slot table collides the second key', () => {
    // key0: 1 probe, placed. key1: slot full, 1 wrap probe -> 2 probes, a collision.
    // collisionRate = 1/2, meanProbe = (1+2)/2 = 1.5.
    const s = hashTableProbeStats({ cells: 1, keys: 2 })
    close(s.collisionRate, 0.5, 1e-12)
    close(s.meanProbe, 1.5, 1e-12)
  }),
])

suite('measure/sketch: bloomFalsePositiveRate', [
  check(
    'a 1-slot filter is always a false positive after any insert',
    () => {
      equal(
        bloomFalsePositiveRate({
          cells: 1,
          items: 1,
          hashes: 1,
          queries: 5,
        }),
        1,
      )
    },
  ),
  check('an empty filter never matches', () => {
    equal(
      bloomFalsePositiveRate({
        cells: 8,
        items: 0,
        hashes: 2,
        queries: 4,
      }),
      0,
    )
  }),
])
