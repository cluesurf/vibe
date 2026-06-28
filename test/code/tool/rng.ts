// Conformance for code/tool/rng: the seeded PRNG. We do NOT test statistical quality
// (that belongs in an experiment). We test the hard contract: DETERMINISM (same seed =>
// identical stream), the stated RANGE bounds (next in [0,1), nextInt in [0,max)), and
// that deriveSeed is a pure deterministic function returning a uint32. Determinism is a
// methodology hard rule, so these are exact equalities.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import { makeRng, deriveSeed, sampleEmpiricalFrequencies } from '@/code/tool/rng'

function firstK(seed: number, k: number): number[] {
  const rng = makeRng({ seed })
  const out: number[] = []
  for (let i = 0; i < k; i++) {
    out.push(rng.next())
  }
  return out
}

suite('tool/rng: determinism', [
  check('same seed produces an identical next() stream', () => {
    const a = firstK(12345, 64)
    const b = firstK(12345, 64)
    for (let i = 0; i < a.length; i++) {
      equal(a[i]!, b[i]!, `next() #${i}`)
    }
  }),
  check('same seed produces an identical nextInt() stream', () => {
    const a = makeRng({ seed: 7 })
    const b = makeRng({ seed: 7 })
    for (let i = 0; i < 64; i++) {
      equal(a.nextInt({ max: 1000 }), b.nextInt({ max: 1000 }), `nextInt #${i}`)
    }
  }),
  check('same seed produces an identical gaussian stream', () => {
    const a = makeRng({ seed: 99 })
    const b = makeRng({ seed: 99 })
    for (let i = 0; i < 32; i++) {
      equal(a.nextGaussian(), b.nextGaussian(), `gaussian #${i}`)
    }
  }),
  check('different seeds give a different stream (not constant)', () => {
    const a = firstK(1, 16)
    const b = firstK(2, 16)
    ok(a.some((v, i) => v !== b[i]), 'streams must differ for different seeds')
  }),
])

suite('tool/rng: range bounds', [
  check('next() stays in [0, 1)', () => {
    const rng = makeRng({ seed: 424242 })
    for (let i = 0; i < 5000; i++) {
      const v = rng.next()
      ok(v >= 0 && v < 1, `next out of [0,1): ${v}`)
    }
  }),
  check('nextInt({max}) stays in [0, max) and is an integer', () => {
    const rng = makeRng({ seed: 31337 })
    for (let i = 0; i < 5000; i++) {
      const v = rng.nextInt({ max: 7 })
      ok(Number.isInteger(v), `nextInt not integer: ${v}`)
      ok(v >= 0 && v < 7, `nextInt out of [0,7): ${v}`)
    }
  }),
])

suite('tool/rng: deriveSeed and sampling identities', [
  check('deriveSeed is deterministic for the same inputs', () => {
    equal(
      deriveSeed({ base: 100, index: 5 }),
      deriveSeed({ base: 100, index: 5 }),
      'same inputs => same seed',
    )
  }),
  check('deriveSeed returns a uint32 and varies with the index', () => {
    const s0 = deriveSeed({ base: 100, index: 0 })
    const s1 = deriveSeed({ base: 100, index: 1 })
    ok(Number.isInteger(s0) && s0 >= 0 && s0 <= 0xffffffff, `s0 not uint32: ${s0}`)
    ok(s0 !== s1, 'consecutive indices should differ')
  }),
  check('empirical frequencies sum to 1 (hits/draws is a normalised histogram)', () => {
    const freqs = sampleEmpiricalFrequencies({
      counts: [1, 2, 3, 4],
      draws: 1000,
      rng: makeRng({ seed: 5 }),
    })
    equal(freqs.length, 4, 'one frequency per bin')
    const total = freqs.reduce((s, f) => s + f, 0)
    close(total, 1, 1e-9, 'frequencies must normalise to 1')
    for (const f of freqs) {
      ok(f >= 0 && f <= 1, `frequency out of [0,1]: ${f}`)
    }
  }),
])
