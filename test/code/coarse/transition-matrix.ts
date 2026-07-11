// Conformance for code/coarse/transition-matrix: the Markov-state-model layer. The count
// matrix, row-stochastic normalization, detailed-balance violation, symmetric eigenvalues,
// reversibilized spectrum, spectral gap, and implied timescale are each checked against a
// hand-computed reference, exact where the arithmetic is exact and tight otherwise.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  quantileLabels,
  countMatrix,
  detailedBalanceViolation,
  rowStochastic,
  symmetricEigenvalues,
  transitionEigenvalues,
  spectralGap,
  impliedTimescale,
} from '@/code/coarse/transition-matrix'

const TOL = 1e-9

suite('coarse/transition-matrix: counts and normalization', [
  // Trajectory 0,1,0,1,0 at lag 1: pairs (0,1),(1,0),(0,1),(1,0).
  check('the lag-1 count matrix matches the hand tally', () => {
    const c = countMatrix({
      trajectory: [0, 1, 0, 1, 0],
      stateCount: 2,
      lag: 1,
    })

    exactArray(c[0]!, [0, 2])
    exactArray(c[1]!, [2, 0])
  }),
  // Each populated row normalizes to 1; an empty row maps to itself (a self-loop).
  check('row-stochastic rows sum to 1, empty rows self-loop', () => {
    const p = rowStochastic([
      [1, 3],
      [0, 0],
    ])

    close(p[0]![0]!, 0.25, TOL)
    close(p[0]![1]!, 0.75, TOL)
    close(
      p[0]!.reduce((a, b) => a + b, 0),
      1,
      TOL,
    )
    exactArray(p[1]!, [0, 1])
  }),
])

suite('coarse/transition-matrix: detailed balance', [
  // Symmetric counts: zero asymmetry, so violation = 0.
  check('symmetric counts have zero detailed-balance violation', () => {
    const r = detailedBalanceViolation({
      counts: [0, 5, 5, 0],
      states: 2,
    })

    close(r.violation, 0, TOL)
  }),
  // f=8, r=2: asymmetry 6 over total 10, violation 0.6.
  check('an asymmetric drive has violation |f-r|/(f+r) = 0.6', () => {
    const r = detailedBalanceViolation({
      counts: [0, 8, 2, 0],
      states: 2,
    })

    close(r.violation, 0.6, TOL)
  }),
])

suite('coarse/transition-matrix: spectra', [
  // A diagonal matrix's eigenvalues are its diagonal, sorted descending.
  check(
    'symmetric eigenvalues of a diagonal matrix are the diagonal',
    () => {
      const e = symmetricEigenvalues([
        [2, 0],
        [0, 3],
      ])

      closeSorted(e, [3, 2])
    },
  ),
  // [[0,1],[1,0]] has eigenvalues +1, -1.
  check('symmetric eigenvalues of the swap matrix are +1,-1', () => {
    const e = symmetricEigenvalues([
      [0, 1],
      [1, 0],
    ])

    closeSorted(e, [1, -1])
  }),
  // The reversibilized transition matrix of a connected chain has top eigenvalue 1.
  check('the transition spectrum has a stationary eigenvalue 1', () => {
    const e = transitionEigenvalues([
      [0, 3],
      [3, 0],
    ])

    close(e[0]!, 1, TOL)
    close(e[1]!, -1, TOL)
  }),
])

suite('coarse/transition-matrix: gap and timescale', [
  // gap = (lambda2 - lambda3) / (1 - lambda2) = (0.8 - 0.2)/(1 - 0.8) = 3.
  check('the spectral gap is (l2-l3)/(1-l2)', () => {
    const g = spectralGap([1, 0.8, 0.2, 0.1])

    close(g.lambda1, 1, TOL)
    close(g.lambda2, 0.8, TOL)
    close(g.lambda3, 0.2, TOL)
    close(g.gap, 3, TOL)
  }),
  // t = -tau / ln(lambda). With lambda = e^-2 and tau = 4, t = -4 / -2 = 2.
  check('implied timescale is -tau/ln(lambda)', () => {
    close(
      impliedTimescale({ eigenvalue: Math.exp(-2), lag: 4 }),
      2,
      TOL,
    )
  }),
  check('a lambda >= 1 has an infinite timescale, <= 0 is zero', () => {
    equal(impliedTimescale({ eigenvalue: 1, lag: 3 }), Infinity)
    equal(impliedTimescale({ eigenvalue: 0, lag: 3 }), 0)
  }),
])

suite('coarse/transition-matrix: quantile bins', [
  // series 10,20,30,40 into 2 bins: threshold = sorted[floor(0.5*4)] = sorted[2] = 30, so
  // x > 30 maps to bin 1, the rest to bin 0.
  check('quantile labels follow the equal-occupancy threshold', () => {
    exactArray(
      quantileLabels({ series: [10, 20, 30, 40], bins: 2 }),
      [0, 0, 0, 1],
    )
  }),
])

// symmetricEigenvalues returns descending order; compare element-wise against an expected
// descending list with a tight tolerance.
function closeSorted(actual: number[], expected: number[]): void {
  equal(actual.length, expected.length, 'eigenvalue count')

  for (let i = 0; i < expected.length; i++) {
    close(actual[i]!, expected[i]!, TOL, `eigenvalue ${i}`)
  }
}
