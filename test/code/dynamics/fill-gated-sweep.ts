// Conformance for code/dynamics/fill-gated-sweep: the per-edge fill-gated conserved exchange. Every gated
// move preserves the pair sum (polarize 0/0 -> +/-, annihilate +/- -> 0/0, hop swaps charge and neutral),
// so the total tone charge is conserved EXACTLY. Insulating (fill 0) edges are inert. Deterministic.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import { fillGatedSweep } from '@/code/dynamics/fill-gated-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 36
const edges = (n: number): [number, number][] =>
  Array.from(
    { length: n },
    (_, i) => [i, (i + 1) % n] as [number, number],
  )

const makeTone = (n: number): Int8Array =>
  Int8Array.from({ length: n }, (_, i) => ((i * 5 + 1) % 3) - 1)

const charge = (t: Int8Array): number =>
  t.reduce((s: number, v) => s + v, 0)

// alternating fills covering all three gate kinds
const makeFill = (n: number): Int8Array =>
  Int8Array.from({ length: n }, (_, i) => (i % 3) - 1) // -1 polarize, 0 insulate, +1 share

suite('dynamics/fill-gated-sweep: charge conservation', [
  check('total charge is conserved across many beats', () => {
    const tone = makeTone(N)
    const fill = makeFill(N)
    const e = edges(N)
    const q0 = charge(tone)
    const rng = makeRng({ seed: 1 })

    for (let b = 0; b < 50; b++) {
      fillGatedSweep({ tone, edges: e, fill, rng })
      equal(charge(tone), q0, `charge at beat ${b}`)
    }
  }),
  check('all-insulating fills (0) leave the field inert', () => {
    const tone = makeTone(N)
    const before = tone.slice()
    const fill = new Int8Array(N) // all zero = insulating

    fillGatedSweep({
      tone,
      edges: edges(N),
      fill,
      rng: makeRng({ seed: 2 }),
    })
    exactArray(tone, before, 'insulating edges do nothing')
  }),
])

suite('dynamics/fill-gated-sweep: determinism', [
  check('two runs with the same seed are identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone(N)
      const fill = makeFill(N)
      const e = edges(N)
      const rng = makeRng({ seed: 7 })

      for (let b = 0; b < 20; b++) {
        fillGatedSweep({ tone, edges: e, fill, rng })
      }

      return tone
    }

    exactArray(run(), run(), 'deterministic')
  }),
])
