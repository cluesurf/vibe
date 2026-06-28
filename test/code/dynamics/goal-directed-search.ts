// Conformance for code/dynamics/goal-directed-search: goal-directed vs aimless bit-string search.
// Invariants:
//   - the GOAL-DIRECTED search always reaches the target (gap-reducing moves only) in few steps.
//   - the UNDIRECTED search needs vastly more steps; at the same K the directed search is much faster.
//   - DETERMINISM under a fixed seed.

import { suite, check, ok, equal } from '@/test/code/harness'
import { solveGoalDirected, solveUndirected } from '@/code/dynamics/goal-directed-search'
import { makeRng } from '@/code/tool/rng'

const target = (k: number): Int8Array => Int8Array.from({ length: k }, (_, i) => (i % 2) as 0 | 1)

suite('dynamics/goal-directed-search: convergence', [
  check('the goal-directed search reaches the target well within the guard', () => {
    const K = 20
    const steps = solveGoalDirected({ target: target(K), rng: makeRng({ seed: 1 }) })
    ok(steps < 1000 * K, 'terminates before the guard')
    // each successful gap-reducing move needs ~ K log K attempts at worst; far below 2^K
    ok(steps < 2 ** K, 'far faster than the undirected expectation')
  }),
  check('the undirected search solves a small target within budget but takes many more steps', () => {
    const K = 8
    const directed = solveGoalDirected({ target: target(K), rng: makeRng({ seed: 2 }) })
    const undirected = solveUndirected({ target: target(K), rng: makeRng({ seed: 2 }), budget: 1 << 16 })
    ok(undirected.solved, 'undirected eventually solves a small target')
    ok(undirected.steps > directed, 'undirected is slower than directed')
  }),
])

suite('dynamics/goal-directed-search: determinism', [
  check('the same seed gives the same step count', () => {
    const K = 16
    equal(
      solveGoalDirected({ target: target(K), rng: makeRng({ seed: 5 }) }),
      solveGoalDirected({ target: target(K), rng: makeRng({ seed: 5 }) }),
      'reproducible',
    )
  }),
])
