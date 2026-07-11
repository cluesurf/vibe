// Conformance for code/dynamics/uniform-sampler: the transitivity-preserving single-pair
// move and its observables on hand states. We pin:
//   - height: a chain of n elements has height n, an antichain has height 1.
//   - toggle / isRelated: a single bit flips a relation on and off.
//   - toggleKeepsValid: adding a pair to an antichain is valid; removing a relation with a
//     mediator (0<1<2, remove 0<2) is rejected, removing a covering relation is allowed.
//   - smearedAction on a 3-chain matches the closed form independently.
//   - the sampler is deterministic under a fixed seed.

import {
  suite,
  check,
  equal,
  close,
  ok,
  notOk,
} from '@/test/code/harness'
import {
  makeState,
  isRelated,
  toggle,
  toggleKeepsValid,
  height,
  smearedAction,
  sampleUniform,
  State,
} from '@/code/dynamics/uniform-sampler'
import { makeBitMatrix, setBit, BitMatrix } from '@/code/tool/bitset'
import { makeRng } from '@/code/tool/rng'

// The full transitive future of a chain 0 < 1 < ... < n-1 (every i < j related).
function chainFuture(n: number): BitMatrix {
  const future = makeBitMatrix({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) setBit(future, { row: i, col: j })
  }

  return future
}

const chainState = (n: number): State => makeState(n, chainFuture(n))
const antichainState = (n: number): State => makeState(n)

suite('dynamics/uniform-sampler: height', [
  check('a chain of n elements has height n', () => {
    for (const n of [1, 3, 5, 8])
      equal(height(chainState(n)), n, `chain of ${n} has height ${n}`)
  }),
  check('an antichain has height 1 (0 when empty)', () => {
    equal(height(antichainState(5)), 1, 'antichain height = 1')
    equal(height(antichainState(0)), 0, 'empty order height = 0')
  }),
])

suite('dynamics/uniform-sampler: toggle and validity', [
  check('toggle flips a single relation on then off', () => {
    const state = antichainState(4)

    notOk(isRelated(state, 0, 1), 'starts unrelated')
    toggle(state, 0, 1)
    ok(isRelated(state, 0, 1), 'toggled on')
    toggle(state, 0, 1)
    notOk(isRelated(state, 0, 1), 'toggled off')
  }),
  check('adding a pair to an antichain keeps it valid', () => {
    const state = antichainState(4)

    ok(
      toggleKeepsValid(state, 0, 1, false),
      'adding 0<1 to an antichain is transitive',
    )
  }),
  check(
    'removing a mediated relation (0<1<2, drop 0<2) is rejected',
    () => {
      const state = chainState(3)

      ok(isRelated(state, 0, 2), '0<2 holds in the chain')
      notOk(
        toggleKeepsValid(state, 0, 2, true),
        'cannot drop 0<2 while 1 sits between (would break transitivity)',
      )
    },
  ),
  check('removing a covering relation (drop 0<1) is allowed', () => {
    const state = chainState(3)

    ok(
      toggleKeepsValid(state, 0, 1, true),
      'dropping the covering pair 0<1 keeps the order transitive',
    )
  }),
])

suite('dynamics/uniform-sampler: smeared action', [
  check(
    '3-chain smeared action matches -N/2 + eps*(2 f(0) + f(1))',
    () => {
      const e = 0.1
      // f(0) = 1, f(1) = 1 - 3e (the 2D smeared kernel).
      const expected = -3 / 2 + e * (2 * 1 + (1 - 3 * e))

      close(
        smearedAction(chainState(3), e),
        expected,
        1e-12,
        'chain smeared action',
      )
    },
  ),
  check('3-antichain smeared action is -N/2', () => {
    close(
      smearedAction(antichainState(3), 0.25),
      -3 / 2,
      1e-12,
      'antichain = -N/2',
    )
  }),
])

suite('dynamics/uniform-sampler: determinism', [
  check('two runs with the same seed give identical summaries', () => {
    const run = (): ReturnType<typeof sampleUniform> =>
      sampleUniform({
        size: 6,
        beta: 0,
        epsilon: 0.2,
        steps: 400,
        rng: makeRng({ seed: 12345 }),
      })

    const a = run()
    const b = run()

    equal(a.acceptance, b.acceptance, 'acceptance')
    equal(a.meanHeightRatio, b.meanHeightRatio, 'mean height ratio')
    equal(
      a.meanOrderingFraction,
      b.meanOrderingFraction,
      'mean ordering fraction',
    )
    equal(a.meanAction, b.meanAction, 'mean action')
  }),
])
