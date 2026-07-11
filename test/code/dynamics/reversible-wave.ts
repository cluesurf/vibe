// Conformance for code/dynamics/reversible-wave: the second-order reversible wave on a
// neighbours graph. The load-bearing invariants are EXACT (integer mod-q):
//   - REVERSIBILITY: next[i] = (sum_{j~i} curr[j] - prev[i]) mod q, so the same step with the
//     roles of (prev, next) swapped recovers prev exactly. Holds for the linear and the nonlinear
//     (current-only self-coupling) rule, since the extra term depends only on `current`.
//   - DETERMINISM: no RNG, so two runs of the same step are bit-for-bit identical.
//   - RANGE: every tone stays in {0, ..., q-1}.

import { suite, check, exactArray, ok } from '@/test/code/harness'
import {
  reversibleWaveStep,
  reversibleWaveStepNonlinear,
} from '@/code/dynamics/reversible-wave'

// A periodic ring of n nodes (each adjacent to its two neighbours).
function ringNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [
    (i - 1 + n) % n,
    (i + 1) % n,
  ])
}

const N = 12
const Q = 5
const neighbors = ringNeighbors(N)

// A deterministic structured initial pair (no RNG, stays reproducible).
function makePrev(): Uint8Array {
  return Uint8Array.from({ length: N }, (_, i) => (i * 3 + 1) % Q)
}

function makeCurr(): Uint8Array {
  return Uint8Array.from({ length: N }, (_, i) => (i * i + 2) % Q)
}

suite('dynamics/reversible-wave: exact reversibility', [
  check(
    'linear: a forward step then a swapped step recovers the previous slice',
    () => {
      const prev = makePrev()
      const curr = makeCurr()
      const next = new Uint8Array(N)

      reversibleWaveStep({
        neighbors,
        previous: prev,
        current: curr,
        next,
        modulus: Q,
      })

      // reverse: with previous := next and current := curr, the step yields the old previous
      const back = new Uint8Array(N)

      reversibleWaveStep({
        neighbors,
        previous: next,
        current: curr,
        next: back,
        modulus: Q,
      })
      exactArray(back, prev, 'recovered previous == original previous')
    },
  ),
  check(
    'nonlinear self-coupling stays exactly reversible (term depends only on current)',
    () => {
      const prev = makePrev()
      const curr = makeCurr()
      const next = new Uint8Array(N)
      const coupling = 2

      reversibleWaveStepNonlinear({
        neighbors,
        previous: prev,
        current: curr,
        next,
        modulus: Q,
        selfCoupling: coupling,
      })

      const back = new Uint8Array(N)

      reversibleWaveStepNonlinear({
        neighbors,
        previous: next,
        current: curr,
        next: back,
        modulus: Q,
        selfCoupling: coupling,
      })
      exactArray(back, prev, 'nonlinear reverse recovers previous')
    },
  ),
  check('selfCoupling 0 equals the linear rule', () => {
    const prev = makePrev()
    const curr = makeCurr()
    const a = new Uint8Array(N)
    const b = new Uint8Array(N)

    reversibleWaveStep({
      neighbors,
      previous: prev,
      current: curr,
      next: a,
      modulus: Q,
    })

    reversibleWaveStepNonlinear({
      neighbors,
      previous: prev,
      current: curr,
      next: b,
      modulus: Q,
      selfCoupling: 0,
    })
    exactArray(b, a, 'nonlinear with zero coupling == linear')
  }),
])

suite('dynamics/reversible-wave: determinism and range', [
  check('two identical forward steps are bit-for-bit equal', () => {
    const a = new Uint8Array(N)
    const b = new Uint8Array(N)

    reversibleWaveStep({
      neighbors,
      previous: makePrev(),
      current: makeCurr(),
      next: a,
      modulus: Q,
    })

    reversibleWaveStep({
      neighbors,
      previous: makePrev(),
      current: makeCurr(),
      next: b,
      modulus: Q,
    })
    exactArray(a, b, 'deterministic')
  }),
  check('every tone stays in {0, ..., q-1}', () => {
    let prev = makePrev()
    let curr = makeCurr()

    for (let t = 0; t < 30; t++) {
      const next = new Uint8Array(N)

      reversibleWaveStep({
        neighbors,
        previous: prev,
        current: curr,
        next,
        modulus: Q,
      })

      for (let i = 0; i < N; i++) {
        ok(next[i]! >= 0 && next[i]! < Q, `tone in range at ${i}`)
      }

      prev = curr
      curr = next
    }
  }),
])
