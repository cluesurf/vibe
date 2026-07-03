// Conformance for code/dynamics/mcmc: the Metropolis sampler over labelled causal sets.
// We test the deterministically checkable mechanics, not statistical convergence:
//   - transitiveClosure: a hand relation 0->1->2 closes to include 0->2 (Warshall).
//   - at beta = 0 there is no energetic rejection (exp(-0*dS) = 1), so the only moves
//     that fail are the ones that would break transitivity. A larger beta rejects those
//     SAME validity-failing moves PLUS uphill energy moves, so acceptance at beta = 0 is
//     at least acceptance at large beta, and is positive.
//   - the sampler is deterministic under a fixed seed (identical trace, mean, acceptance).

import {
  suite,
  check,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  transitiveClosure,
  sampleCausalSets,
} from '@/code/dynamics/mcmc'
import { makeBitMatrix, setBit, getBit } from '@/code/tool/bitset'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { relationCount, Poset } from '@/code/tool/poset'
import { makeRng } from '@/code/tool/rng'

const action = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
const observe = ({ poset }: { poset: Poset }): number =>
  relationCount(poset)

suite('dynamics/mcmc: transitive closure', [
  check('0->1 and 1->2 close to include 0->2', () => {
    const relation = makeBitMatrix({ rows: 3, cols: 3 })
    setBit(relation, { row: 0, col: 1 })
    setBit(relation, { row: 1, col: 2 })

    const closed = transitiveClosure({ size: 3, relation })
    ok(getBit(closed, { row: 0, col: 1 }), '0->1 retained')
    ok(getBit(closed, { row: 1, col: 2 }), '1->2 retained')
    ok(
      getBit(closed, { row: 0, col: 2 }),
      '0->2 inferred by transitivity',
    )
    ok(
      !getBit(closed, { row: 1, col: 0 }),
      'no spurious reverse relation',
    )
  }),
])

suite('dynamics/mcmc: acceptance at beta = 0', [
  check(
    'beta=0 accepts at least as often as a large beta, and is positive',
    () => {
      const at = (beta: number): number =>
        sampleCausalSets({
          size: 5,
          action,
          beta,
          steps: 300,
          rng: makeRng({ seed: 4 }),
          observe,
        }).acceptanceRate

      const free = at(0)
      const cold = at(10)
      ok(free > 0, 'some valid move is accepted at beta=0')
      ok(
        free >= cold,
        'beta=0 has no energetic rejection, so it accepts at least as often as a cold chain',
      )
    },
  ),
])

suite('dynamics/mcmc: determinism', [
  check('two runs with the same seed agree exactly', () => {
    const run = (): ReturnType<typeof sampleCausalSets> =>
      sampleCausalSets({
        size: 5,
        action,
        beta: 1.5,
        steps: 300,
        rng: makeRng({ seed: 2024 }),
        observe,
      })

    const a = run()
    const b = run()
    equal(a.acceptanceRate, b.acceptanceRate, 'acceptance rate')
    equal(a.meanObservable, b.meanObservable, 'mean observable')
    exactArray(
      a.trace,
      b.trace,
      'the observable trace must match bit-for-bit',
    )
  }),
])
