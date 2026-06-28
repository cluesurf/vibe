// Conformance for code/operator/signed-majority-settle: asynchronous Hopfield-style
// relaxation of the signed-majority rule. Facts:
//   - a configuration that is already a fixed point is left unchanged and reports zero
//     final flip (exact).
//   - the relaxation is deterministic in its rng seed (exact).
//   - from a single defect on a ferromagnet it converges back to the all-aligned state.

import { suite, check, equal, ok } from '@/test/code/harness'
import { settleAsync } from '@/code/operator/signed-majority-settle'
import { makeGraph } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'

// A ring of 6 cells with all-positive (ferromagnetic) couplings: the all-+1 state is a
// fixed point (each cell's field is the sum of positive couplings times +1 neighbours).
const ring = makeGraph({
  size: 6,
  directed: false,
  neighbors: Array.from({ length: 6 }, (_, i) => [(i + 5) % 6, (i + 1) % 6]),
})
const ferroFills = Array.from({ length: 6 }, () => Int8Array.from([1, 1]))
const allPlus = Int8Array.from({ length: 6 }, () => 1)

suite('operator/signed-majority-settle: fixed point', [
  check('an all-aligned ferromagnet is left unchanged with zero final flip', () => {
    const { state, finalFlip } = settleAsync({
      graph: ring,
      fills: ferroFills,
      init: allPlus,
      sweeps: 5,
      rng: makeRng({ seed: 1 }),
    })
    equal(finalFlip, 0, 'no cell flips in the final sweep')
    ok(
      state.every(v => v === 1),
      'the fixed point is preserved exactly',
    )
  }),
])

suite('operator/signed-majority-settle: determinism', [
  check('is deterministic in its rng seed', () => {
    const init = Int8Array.from([1, -1, 1, -1, 0, 1])
    const a = settleAsync({ graph: ring, fills: ferroFills, init, sweeps: 30, rng: makeRng({ seed: 7 }) })
    const b = settleAsync({ graph: ring, fills: ferroFills, init, sweeps: 30, rng: makeRng({ seed: 7 }) })
    equal(a.finalFlip, b.finalFlip, 'same seed -> same final flip')
    ok(a.state.every((v, i) => v === b.state[i]), 'same seed -> same final state')
  }),
])

suite('operator/signed-majority-settle: convergence', [
  check('a single defect on a ferromagnet heals to the all-aligned state', () => {
    const init = Int8Array.from([1, 1, -1, 1, 1, 1])
    const { state, finalFlip } = settleAsync({
      graph: ring,
      fills: ferroFills,
      init,
      sweeps: 50,
      rng: makeRng({ seed: 3 }),
    })
    ok(
      state.every(v => v === 1),
      'the defect is repaired back to all +1',
    )
    equal(finalFlip, 0, 'a fixed point is reached')
  }),
])
