// Conformance for code/dynamics/cohesive-sweep: the company-driven (cohesive) perception beat. Every move
// (annihilate / company-gated hop / balanced create) preserves the pair sum, so total charge is conserved.
// With annihilate off and arrow 0 it is a pure conserved hop (sign counts preserved). agreeCount reports the
// same-tone neighbour company. Deterministic.

import { suite, check, equal } from '@/test/code/harness'
import {
  cohesiveEdgeSweep,
  agreeCount,
} from '@/code/dynamics/cohesive-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 36

// CSR adjacency of a periodic ring (each node adjacent to its two neighbours).
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
  Int8Array.from({ length: n }, (_, i) => ((i * 7 + 3) % 3) - 1)

const charge = (t: Int8Array): number =>
  t.reduce((s: number, v) => s + v, 0)

const countSign = (t: Int8Array, s: number): number =>
  t.reduce((c: number, v) => c + (v === s ? 1 : 0), 0)

const { offsets, adj, eu, ev } = ringCsr(N)

suite('dynamics/cohesive-sweep: agreeCount', [
  check(
    'agreeCount counts same-tone neighbours, skipping the partner',
    () => {
      // tone: [1,1,0,1] on a 4-ring; node 0 neighbours are 3 (tone 1) and 1 (tone 1)
      const small = ringCsr(4)
      const tone = Int8Array.from([1, 1, 0, 1])

      // company of node 0 with tone 1, excluding partner 1: only neighbour 3 (tone 1) counts
      equal(
        agreeCount(tone, small.offsets, small.adj, 0, 1, 1),
        1,
        'excludes the partner',
      )

      // company of node 0 with tone 1, excluding nothing real (except = -1): both neighbours
      equal(
        agreeCount(tone, small.offsets, small.adj, 0, 1, -1),
        2,
        'both neighbours agree',
      )
    },
  ),
])

suite('dynamics/cohesive-sweep: conservation', [
  check(
    'total charge is conserved (annihilate + create + cohesive hop)',
    () => {
      const tone = makeTone(N)
      const q0 = charge(tone)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 1 })

      for (let b = 0; b < 40; b++) {
        cohesiveEdgeSweep({
          tone,
          eu,
          ev,
          offsets,
          adj,
          moved,
          rng,
          annihilate: true,
          arrow: 0.2,
        })
        equal(charge(tone), q0, `charge at beat ${b}`)
      }
    },
  ),
  check(
    'annihilate off, arrow 0: a pure conserved hop preserves each sign count',
    () => {
      const tone = makeTone(N)
      const plus0 = countSign(tone, 1)
      const minus0 = countSign(tone, -1)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 2 })

      for (let b = 0; b < 30; b++) {
        cohesiveEdgeSweep({
          tone,
          eu,
          ev,
          offsets,
          adj,
          moved,
          rng,
          annihilate: false,
          arrow: 0,
        })
        equal(countSign(tone, 1), plus0, `+1 count ${b}`)
        equal(countSign(tone, -1), minus0, `-1 count ${b}`)
      }
    },
  ),
])

suite('dynamics/cohesive-sweep: determinism', [
  check('two seeded runs are identical', () => {
    const run = (): Int8Array => {
      const tone = makeTone(N)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 5 })

      for (let b = 0; b < 20; b++) {
        cohesiveEdgeSweep({
          tone,
          eu,
          ev,
          offsets,
          adj,
          moved,
          rng,
          annihilate: true,
          arrow: 0.2,
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
