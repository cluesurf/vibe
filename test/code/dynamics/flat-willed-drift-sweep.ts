// Conformance for code/dynamics/flat-willed-drift-sweep: a willed (biased) hop on a flat 2D grid. It is a
// pure hop (nothing created or annihilated), so total charge AND the nonzero-cell count are conserved EXACTLY,
// for any bias. Deterministic.

import { suite, check, equal } from '@/test/code/harness'
import { flatWilledDriftSweep } from '@/code/dynamics/flat-willed-drift-sweep'
import { makeRng } from '@/code/tool/rng'

const L = 8

// a deterministic sparse charge pattern on the L x L grid
function makeTone(): Int8Array {
  const t = new Int8Array(L * L)
  for (let i = 0; i < L * L; i++) t[i] = i % 5 === 0 ? 1 : i % 7 === 0 ? -1 : 0
  return t
}
const charge = (t: Int8Array): number => t.reduce((s: number, v) => s + v, 0)
const nonzero = (t: Int8Array): number => t.reduce((c: number, v) => c + (v !== 0 ? 1 : 0), 0)

suite('dynamics/flat-willed-drift-sweep: conservation', [
  check('a biased hop conserves charge and the nonzero count', () => {
    const tone = makeTone()
    const q0 = charge(tone)
    const nz0 = nonzero(tone)
    const moved = new Uint8Array(L * L)
    const rng = makeRng({ seed: 1 })
    for (let b = 0; b < 30; b++) {
      flatWilledDriftSweep({ tone, length: L, moved, rng, bias: 1.5 })
      equal(charge(tone), q0, `charge ${b}`)
      equal(nonzero(tone), nz0, `nonzero count ${b}`)
    }
  }),
  check('an unbiased hop (bias 0) also conserves charge and count', () => {
    const tone = makeTone()
    const q0 = charge(tone)
    const nz0 = nonzero(tone)
    const moved = new Uint8Array(L * L)
    const rng = makeRng({ seed: 2 })
    for (let b = 0; b < 30; b++) {
      flatWilledDriftSweep({ tone, length: L, moved, rng, bias: 0 })
      equal(charge(tone), q0, `charge ${b}`)
      equal(nonzero(tone), nz0, `nonzero count ${b}`)
    }
  }),
])

suite('dynamics/flat-willed-drift-sweep: determinism', [
  check('two seeded runs are identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone()
      const moved = new Uint8Array(L * L)
      const rng = makeRng({ seed: 7 })
      for (let b = 0; b < 15; b++) flatWilledDriftSweep({ tone, length: L, moved, rng, bias: 1 })
      return tone
    }
    const a = run()
    const b = run()
    for (let i = 0; i < L * L; i++) equal(a[i]!, b[i]!, `cell ${i}`)
  }),
])
