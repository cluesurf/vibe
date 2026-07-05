// Conformance for code/dynamics/soc-sweep: the self-organized-criticality beat (conserving share + hop +
// demand-driven creation). Every move preserves the pair sum, so total charge is conserved. localActivity
// is the nonzero fraction of the endpoints' neighbourhoods (in [0, 1]). Deterministic.

import { suite, check, equal, ok } from '@/test/code/harness'
import { socEdgeSweep, localActivity } from '@/code/dynamics/soc-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 36

function ringCsr(n: number): {
  offsets: Int32Array
  adj: Int32Array
  eu: Int32Array
  ev: Int32Array
} {
  const offsets = new Int32Array(n + 1)
  const adj = new Int32Array(2 * n)

  for (let i = 0; i < n; i++) {
    offsets[i] = 2 * i
    adj[2 * i] = (i - 1 + n) % n
    adj[2 * i + 1] = (i + 1) % n
  }

  offsets[n] = 2 * n

  const eu = new Int32Array(n)
  const ev = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    eu[i] = i
    ev[i] = (i + 1) % n
  }

  return { offsets, adj, eu, ev }
}

const makeTone = (n: number): Int8Array =>
  Int8Array.from({ length: n }, (_, i) => ((i * 11 + 4) % 3) - 1)

const charge = (t: Int8Array): number =>
  t.reduce((s: number, v) => s + v, 0)

const { offsets, adj, eu, ev } = ringCsr(N)

suite('dynamics/soc-sweep: localActivity', [
  check(
    'localActivity is the nonzero fraction, 0 for empty and 1 for full',
    () => {
      const empty = new Int8Array(N)
      ok(
        localActivity(empty, offsets, adj, 0, 1) === 0,
        'empty neighbourhood = 0',
      )

      const full = new Int8Array(N).fill(1)
      equal(
        localActivity(full, offsets, adj, 0, 1),
        1,
        'full neighbourhood = 1',
      )
    },
  ),
])

suite('dynamics/soc-sweep: conservation', [
  check('total charge is conserved (feedback creation)', () => {
    const tone = makeTone(N)
    const q0 = charge(tone)
    const moved = new Uint8Array(N)
    const rng = makeRng({ seed: 1 })

    for (let b = 0; b < 40; b++) {
      socEdgeSweep({
        tone,
        offsets,
        adj,
        eu,
        ev,
        moved,
        rng,
        arrow: 0.3,
        uniform: false,
      })
      equal(charge(tone), q0, `charge at beat ${b}`)
    }
  }),
  check('uniform control also conserves charge', () => {
    const tone = makeTone(N)
    const q0 = charge(tone)
    const moved = new Uint8Array(N)
    const rng = makeRng({ seed: 2 })

    for (let b = 0; b < 30; b++) {
      socEdgeSweep({
        tone,
        offsets,
        adj,
        eu,
        ev,
        moved,
        rng,
        arrow: 0.3,
        uniform: true,
      })
      equal(charge(tone), q0, `uniform charge at beat ${b}`)
    }
  }),
])

suite('dynamics/soc-sweep: determinism', [
  check('two seeded runs are identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone(N)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 9 })

      for (let b = 0; b < 20; b++) {
        socEdgeSweep({
          tone,
          offsets,
          adj,
          eu,
          ev,
          moved,
          rng,
          arrow: 0.3,
          uniform: false,
        })
      }

      return tone
    }

    const a = run()
    const b = run()

    for (let i = 0; i < N; i++) {
      equal(a[i]!, b[i]!, `cell ${i}`)
    }
  }),
])
