// Conformance for code/coarse/surrogate: the learned-surrogate fit-and-validate layer. A Markov
// surrogate fit from a label trajectory is row-stochastic; the marginal baseline is the next-state
// occupancy; predictive log-likelihood and forward accuracy reward a matrix that predicts a held-out
// trajectory; and a time-shuffle preserves the label multiset while destroying order. The load-bearing
// claim: on a perfectly periodic trajectory the learned surrogate predicts perfectly and beats the
// marginal. All re-derived by hand.

import {
  suite,
  check,
  close,
  equal,
  ok,
  exactArray,
} from '@/test/code/harness'
import {
  fitMarkovSurrogate,
  marginalDistribution,
  predictiveLogLikelihood,
  marginalLogLikelihood,
  forwardAccuracy,
  timeShuffle,
} from '@/code/coarse/surrogate'

const TOL = 1e-12

suite('coarse/surrogate: fit and marginal', [
  // [0,1,0,1,0] at lag 1, alpha 0: counts [[0,2],[2,0]] -> rows [0,1] and [1,0].
  check(
    'the fit surrogate is row-stochastic and matches the counts',
    () => {
      const tpm = fitMarkovSurrogate({
        trajectory: [0, 1, 0, 1, 0],
        stateCount: 2,
        lag: 1,
        alpha: 0,
      })

      closeRow(tpm[0]!, [0, 1])
      closeRow(tpm[1]!, [1, 0])
    },
  ),
  // With smoothing the rows still sum to 1.
  check('add-alpha smoothing keeps rows stochastic', () => {
    const tpm = fitMarkovSurrogate({
      trajectory: [0, 1, 0, 1, 0],
      stateCount: 2,
      lag: 1,
      alpha: 0.5,
    })

    for (const row of tpm) {
      close(
        row.reduce((a, b) => a + b, 0),
        1,
        TOL,
        'row sums to 1',
      )
    }
  }),
  // next states over t=0..3 are 1,0,1,0 -> two of each -> marginal [0.5,0.5].
  check('the marginal is the next-state occupancy', () => {
    const m = marginalDistribution({
      trajectory: [0, 1, 0, 1, 0],
      stateCount: 2,
      lag: 1,
      alpha: 0,
    })

    closeRow(m, [0.5, 0.5])
  }),
])

suite('coarse/surrogate: prediction beats the baseline', [
  // A perfect deterministic surrogate on a periodic test trajectory: log-likelihood 0 (probability 1
  // each step), accuracy 1. The marginal predicts 0.5 each step -> log-likelihood ln(0.5) < 0.
  check('a perfect surrogate predicts with LL 0 and accuracy 1', () => {
    const tpm = [
      [0, 1],
      [1, 0],
    ]

    const test = [0, 1, 0, 1, 0]
    close(predictiveLogLikelihood({ tpm, test, lag: 1 }), 0, TOL)
    close(forwardAccuracy({ tpm, test, lag: 1 }), 1, TOL)
  }),
  check(
    'the marginal baseline is strictly worse on structured data',
    () => {
      const test = [0, 1, 0, 1, 0]
      const ll = predictiveLogLikelihood({
        tpm: [
          [0, 1],
          [1, 0],
        ],
        test,
        lag: 1,
      })

      const mll = marginalLogLikelihood({
        marginal: [0.5, 0.5],
        test,
        lag: 1,
      })

      close(mll, Math.log(0.5), 1e-12)
      ok(
        ll > mll,
        'the learned surrogate must beat the memoryless marginal',
      )
    },
  ),
])

suite('coarse/surrogate: time shuffle is a permutation', [
  check('time-shuffle preserves the label multiset', () => {
    const traj = [0, 1, 2, 3, 4, 5, 6, 7]
    const shuffled = timeShuffle({ trajectory: traj, seed: 9 })
    exactArray(
      shuffled.slice().sort((a, b) => a - b),
      traj,
      'shuffle is a permutation',
    )
  }),
  check('time-shuffle is deterministic in its seed', () => {
    const traj = [4, 1, 1, 0, 2, 3, 3, 2, 0, 1]
    const a = timeShuffle({ trajectory: traj, seed: 42 })
    const b = timeShuffle({ trajectory: traj, seed: 42 })
    exactArray(a, b, 'same seed gives the same shuffle')
  }),
])

// element-wise close with a tight tolerance for a probability row.
function closeRow(actual: ArrayLike<number>, expected: number[]): void {
  equal(actual.length, expected.length, 'row length')

  for (let i = 0; i < expected.length; i++) {
    close(actual[i]!, expected[i]!, TOL, `entry ${i}`)
  }
}
