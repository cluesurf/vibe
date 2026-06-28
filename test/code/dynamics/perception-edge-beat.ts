// Conformance for code/dynamics/perception-edge-beat: the dispatcher between the cohesive and the plain
// conserving sweep. Invariants:
//   - DELEGATION: with cohesive = false the beat is exactly conservingEdgeSweep (bit-for-bit, same RNG order).
//   - CHARGE CONSERVATION in both modes.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import { perceptionEdgeBeat } from '@/code/dynamics/perception-edge-beat'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

const N = 36

function ringCsr(n: number): { offsets: Int32Array; adj: Int32Array; eu: Int32Array; ev: Int32Array } {
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
  Int8Array.from({ length: n }, (_, i) => ((i * 7 + 2) % 3) - 1)
const charge = (t: Int8Array): number => t.reduce((s: number, v) => s + v, 0)

const { offsets, adj, eu, ev } = ringCsr(N)

suite('dynamics/perception-edge-beat: delegation', [
  check('cohesive = false reproduces conservingEdgeSweep bit-for-bit', () => {
    const viaBeat = makeTone(N)
    const viaSweep = makeTone(N)
    const movedA = new Uint8Array(N)
    const movedB = new Uint8Array(N)
    const rngA = makeRng({ seed: 7 })
    const rngB = makeRng({ seed: 7 })
    for (let b = 0; b < 20; b++) {
      perceptionEdgeBeat({
        tone: viaBeat, eu, ev, offsets, adj, moved: movedA, rng: rngA,
        arrow: 0.3, cohesive: false, temperature: 0.02,
      })
      conservingEdgeSweep({ tone: viaSweep, eu, ev, moved: movedB, rng: rngB, arrow: 0.3 })
    }
    exactArray(viaBeat, viaSweep, 'dispatcher == plain conserving sweep')
  }),
])

suite('dynamics/perception-edge-beat: charge conservation', [
  check('both modes conserve total charge', () => {
    for (const cohesive of [false, true]) {
      const tone = makeTone(N)
      const q0 = charge(tone)
      const moved = new Uint8Array(N)
      const rng = makeRng({ seed: 1 })
      for (let b = 0; b < 30; b++) {
        perceptionEdgeBeat({ tone, eu, ev, offsets, adj, moved, rng, arrow: 0.25, cohesive, temperature: 0.05 })
        equal(charge(tone), q0, `charge (cohesive=${cohesive}) at beat ${b}`)
      }
    }
  }),
])
