// Conformance for code/dynamics/pumped-reserve-sweep: the self-vs-field pump/leak hop dynamics. Every move
// is a pure hop (swap a charge with a neutral), so total charge AND each sign count are conserved EXACTLY,
// whether the pump is on or off. Deterministic.

import { suite, check, equal } from '@/test/code/harness'
import { pumpedReserveSweep } from '@/code/dynamics/pumped-reserve-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 40
const edges = (n: number): [number, number][] =>
  Array.from(
    { length: n },
    (_, i) => [i, (i + 1) % n] as [number, number],
  )

const makeTone = (n: number): Int8Array =>
  Int8Array.from({ length: n }, (_, i) => ((i * 7 + 2) % 3) - 1)

const charge = (t: Int8Array): number =>
  t.reduce((s: number, v) => s + v, 0)

const countSign = (t: Int8Array, s: number): number =>
  t.reduce((c: number, v) => c + (v === s ? 1 : 0), 0)

// a self occupying the middle third, with hop distance to the centre
function selfAndDist(n: number): {
  inSelf: Uint8Array
  distC: Int32Array
} {
  const inSelf = new Uint8Array(n)
  const distC = new Int32Array(n)
  const c = Math.floor(n / 2)

  for (let i = 0; i < n; i++) {
    inSelf[i] = i >= n / 3 && i < (2 * n) / 3 ? 1 : 0
    distC[i] = Math.abs(i - c)
  }

  return { inSelf, distC }
}

suite('dynamics/pumped-reserve-sweep: conservation', [
  check(
    'a pure hop conserves total charge and each sign count (pump on)',
    () => {
      const tone = makeTone(N)
      const { inSelf, distC } = selfAndDist(N)
      const q0 = charge(tone)
      const p0 = countSign(tone, 1)
      const m0 = countSign(tone, -1)
      const rng = makeRng({ seed: 1 })

      for (let b = 0; b < 40; b++) {
        pumpedReserveSweep({
          tone,
          edges: edges(N),
          inSelf,
          distC,
          rng,
          fieldLeak: 0.2,
          pump: true,
        })
        equal(charge(tone), q0, `charge ${b}`)
        equal(countSign(tone, 1), p0, `+1 count ${b}`)
        equal(countSign(tone, -1), m0, `-1 count ${b}`)
      }
    },
  ),
  check('pump off (unbiased walk) also conserves charge', () => {
    const tone = makeTone(N)
    const { inSelf, distC } = selfAndDist(N)
    const q0 = charge(tone)
    const rng = makeRng({ seed: 2 })

    for (let b = 0; b < 30; b++) {
      pumpedReserveSweep({
        tone,
        edges: edges(N),
        inSelf,
        distC,
        rng,
        fieldLeak: 0.5,
        pump: false,
      })
      equal(charge(tone), q0, `charge ${b}`)
    }
  }),
])

suite('dynamics/pumped-reserve-sweep: determinism', [
  check('two seeded runs are identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone(N)
      const { inSelf, distC } = selfAndDist(N)
      const rng = makeRng({ seed: 8 })

      for (let b = 0; b < 20; b++) {
        pumpedReserveSweep({
          tone,
          edges: edges(N),
          inSelf,
          distC,
          rng,
          fieldLeak: 0.2,
          pump: true,
        })
      }

      return tone
    }

    const a = run()
    const b = run()

    for (let i = 0; i < N; i++) equal(a[i]!, b[i]!, `cell ${i}`)
  }),
])
