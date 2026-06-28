// Conformance for code/measure/statistics: the small shared estimators. Every value
// below is re-derived BY HAND from the textbook definition, so the test pins the
// implementation to the math, not to itself. Means and variances on integer data are
// exact; the float-valued ratios use a tight tolerance.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  mean,
  populationVariance,
  standardDeviation,
  pearson,
  relativeStandardDeviation,
  relativeL2Error,
  crossJointCounts,
  mutualInformationBits,
} from '@/code/measure/statistics'

const TOL = 1e-12

suite('measure/statistics: mean / variance / stddev', [
  check('mean of 1..4 is the exact average 2.5', () => {
    equal(mean([1, 2, 3, 4]), 2.5)
  }),
  check('mean of an empty series is 0', () => {
    equal(mean([]), 0)
  }),
  // The canonical textbook population variance example: data 2,4,4,4,5,5,7,9 has
  // mean 5 and population variance 4, so the standard deviation is exactly 2.
  check('population variance of the textbook set is 4', () => {
    equal(mean([2, 4, 4, 4, 5, 5, 7, 9]), 5)
    equal(populationVariance([2, 4, 4, 4, 5, 5, 7, 9]), 4)
  }),
  check('standard deviation is the sqrt of the population variance', () => {
    equal(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]), 2)
  }),
  check('variance of a constant series is 0', () => {
    equal(populationVariance([7, 7, 7, 7]), 0)
  }),
])

suite('measure/statistics: pearson correlation', [
  check('a perfect positive linear relation correlates at +1', () => {
    close(pearson({ a: [1, 2, 3, 4], b: [2, 4, 6, 8] }), 1, TOL)
  }),
  check('a perfect negative linear relation correlates at -1', () => {
    close(pearson({ a: [1, 2, 3, 4], b: [8, 6, 4, 2] }), -1, TOL)
  }),
  check('a constant series (no variance) gives 0, not NaN', () => {
    equal(pearson({ a: [1, 2, 3], b: [5, 5, 5] }), 0)
  }),
])

suite('measure/statistics: relative spreads', [
  // A conserved quantity reads near-zero relative spread; a constant series is exactly 0.
  check('relative standard deviation of a constant series is 0', () => {
    equal(relativeStandardDeviation([3, 3, 3]), 0)
  }),
  // [1,-1]: mean 0, population variance 1, sd 1, scale = max|x| = 1, so the ratio is 1.
  check('relative standard deviation of [1,-1] is sd/scale = 1', () => {
    close(relativeStandardDeviation([1, -1]), 1, TOL)
  }),
  check('relative L2 error of identical series is 0', () => {
    equal(relativeL2Error([1, 2, 3], [1, 2, 3]), 0)
  }),
  // sqrt( sum (a-b)^2 / sum a^2 ) = sqrt( 4 / 4 ) = 1.
  check('relative L2 error: a=[2,0] vs b=[0,0] is 1', () => {
    close(relativeL2Error([2, 0], [0, 0]), 1, TOL)
  }),
])

suite('measure/statistics: joint counts and mutual information', [
  // A=[0,1,0,1], B=[1,0,1,0], lag 1, last index = 4-1 = 3.
  //   t0: (A0=0, B1=0) -> [0][0]; t1: (A1=1, B2=1) -> [1][1]; t2: (A2=0, B3=0) -> [0][0].
  check('cross joint counts match the hand tally', () => {
    const c = crossJointCounts({
      seriesA: [0, 1, 0, 1],
      seriesB: [1, 0, 1, 0],
      stateCount: 2,
      lag: 1,
    })
    exactArray(c[0]!, [2, 0])
    exactArray(c[1]!, [0, 1])
  }),
  check('mutual information of an independent joint is 0 bits', () => {
    close(mutualInformationBits([[1, 1], [1, 1]]), 0, TOL)
  }),
  // A perfectly dependent 2x2 (mass on the diagonal) carries exactly 1 bit:
  //   I = 0.5 log2(0.5/0.25) * 2 = 1.
  check('mutual information of a perfectly correlated 2x2 is 1 bit', () => {
    close(mutualInformationBits([[1, 0], [0, 1]]), 1, TOL)
  }),
])
