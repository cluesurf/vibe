// Conformance for code/dynamics/genesis: the conserving rule run as a genesis / forgetting dynamics.
// Invariants:
//   - CHARGE CONSERVATION: every trajectory preserves the total charge (qStart == qEnd, conserved flag true),
//     including the growing-mesh and balanced variants.
//   - balanceToZero forces total charge to exactly 0.
//   - chargedCount counts the nonzero cells.
//   - firstDistinction from the void mints a BALANCED, ADJACENT +/- pair.
//   - DETERMINISM under a fixed seed.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  chargedCount,
  chargeTrajectory,
  balanceToZero,
  firstDistinction,
  growingMeshGenesis,
} from '@/code/dynamics/genesis'
import { totalCharge } from '@/code/model/self-kit'

// a periodic ring of n nodes
function ringNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [
    (i - 1 + n) % n,
    (i + 1) % n,
  ])
}

// a deterministic ternary tone with nonzero net charge
function makeTone(n: number): Int8Array {
  return Int8Array.from({ length: n }, (_, i) => ((i * 7 + 2) % 3) - 1)
}

suite('dynamics/genesis: counts and balancing', [
  check('chargedCount counts nonzero cells', () => {
    equal(
      chargedCount(Int8Array.from([0, 1, -1, 0, 1])),
      3,
      'three nonzero',
    )
  }),
  check('balanceToZero forces total charge to 0', () => {
    const tone = makeTone(30)

    equal(
      totalCharge(balanceToZero(tone)),
      0,
      'net charge zero after balancing',
    )
  }),
])

suite('dynamics/genesis: charge conservation', [
  check('chargeTrajectory conserves total charge', () => {
    const N = 40
    const out = chargeTrajectory({
      neighbors: ringNeighbors(N),
      initial: makeTone(N),
      beats: 30,
      arrow: 0.2,
      seed: 1,
    })

    ok(out.conserved, 'conserved flag set')
    equal(out.qStart, out.qEnd, 'qStart == qEnd')
    equal(out.trajectory.length, 31, 'trajectory length = beats + 1')
  }),
  check(
    'growingMeshGenesis conserves charge from the void (Q = 0)',
    () => {
      const N = 24
      const depth = Int32Array.from({ length: N }, (_, i) =>
        Math.abs(i - Math.floor(N / 2)),
      )

      const out = growingMeshGenesis({
        neighbors: ringNeighbors(N),
        depth,
      })

      ok(out.conserved, 'conserved')
      equal(out.qStart, 0, 'starts from the void')
      equal(out.qEnd, 0, 'stays balanced')
    },
  ),
])

suite('dynamics/genesis: first distinction', [
  check(
    'the first creation from the void is a balanced, adjacent pair',
    () => {
      const N = 30
      const out = firstDistinction({
        neighbors: ringNeighbors(N),
        cells: N,
        arrow: 0.5,
        seed: 3,
        maxBeats: 200,
      })

      ok(out.beatsToFirst > 0, 'a pair appears')
      ok(out.balanced, 'equal + and - counts')
      ok(out.adjacent, 'the pair is adjacent')
      equal(out.plus, out.minus, 'plus == minus')
    },
  ),
  check('arrow 0 never creates a distinction (dead peace)', () => {
    const N = 20
    const out = firstDistinction({
      neighbors: ringNeighbors(N),
      cells: N,
      arrow: 0,
      seed: 1,
      maxBeats: 50,
    })

    equal(out.beatsToFirst, -1, 'no creation')
  }),
])

suite('dynamics/genesis: determinism', [
  check('two seeded trajectories agree', () => {
    const N = 30
    const run = (): number[] =>
      chargeTrajectory({
        neighbors: ringNeighbors(N),
        initial: makeTone(N),
        beats: 20,
        arrow: 0.3,
        seed: 42,
      }).trajectory

    const a = run()
    const b = run()

    for (let i = 0; i < a.length; i++)
      equal(a[i]!, b[i]!, `trajectory ${i}`)
  }),
])
