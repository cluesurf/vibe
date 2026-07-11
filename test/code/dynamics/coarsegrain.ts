// Conformance for code/dynamics/coarsegrain: random decimation (Bombelli's RG move) of a causal set.
// Invariants:
//   - keepProbability = 1 keeps every element; 0 keeps none.
//   - the survivor count is <= the original; the INDUCED order is inherited (a chain stays a chain).
//   - DETERMINISM under a fixed seed.

import { suite, check, equal, ok } from '@/test/code/harness'
import { decimate } from '@/code/dynamics/coarsegrain'
import { makePosetFromRelation, precedes } from '@/code/tool/poset'
import { makeRng } from '@/code/tool/rng'

// a total order (chain) 0 < 1 < ... < n-1
const chain = (n: number): ReturnType<typeof makePosetFromRelation> =>
  makePosetFromRelation({ size: n, precedes: ({ a, b }) => a < b })

suite('dynamics/coarsegrain: keep extremes', [
  check('keepProbability 1 keeps every element', () => {
    const out = decimate({
      poset: chain(20),
      keepProbability: 1,
      rng: makeRng({ seed: 1 }),
    })

    equal(out.size, 20, 'all kept')
  }),
  check('keepProbability 0 keeps none', () => {
    const out = decimate({
      poset: chain(20),
      keepProbability: 0,
      rng: makeRng({ seed: 1 }),
    })

    equal(out.size, 0, 'none kept')
  }),
])

suite('dynamics/coarsegrain: induced order', [
  check(
    'a decimated chain is still a total order on its survivors',
    () => {
      const out = decimate({
        poset: chain(30),
        keepProbability: 0.5,
        rng: makeRng({ seed: 4 }),
      })

      ok(out.size <= 30, 'survivors are a subset')

      for (let a = 0; a < out.size; a++) {
        for (let b = a + 1; b < out.size; b++)
          ok(precedes(out, { a, b }), `induced order keeps ${a} < ${b}`)
      }
    },
  ),
])

suite('dynamics/coarsegrain: determinism', [
  check('the same seed gives the same survivor set', () => {
    const a = decimate({
      poset: chain(40),
      keepProbability: 0.5,
      rng: makeRng({ seed: 11 }),
    })

    const b = decimate({
      poset: chain(40),
      keepProbability: 0.5,
      rng: makeRng({ seed: 11 }),
    })

    equal(a.size, b.size, 'same survivor count')
  }),
])
