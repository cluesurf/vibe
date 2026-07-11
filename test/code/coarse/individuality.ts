// Conformance for code/coarse/individuality: the Price-equation fitness-variance partition. The
// defining algebraic identity is the ANOVA decomposition: between-group variance + within-group
// variance = total variance. A purely between-group population has within 0 and ratio enormous;
// a population with identical group means has between 0 and ratio 0. All re-derived by hand.

import { suite, check, close, ok } from '@/test/code/harness'
import { fitnessVariancePartition } from '@/code/coarse/individuality'

const TOL = 1e-9

// total variance of a flat list, the reference the partition must reconstruct.
function totalVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
}

suite('coarse/individuality: variance partition', [
  // groups {1,1,1} and {3,3,3}: grand mean 2, within 0, between = (3*1 + 3*1)/6 = 1. Total var 1.
  check('a between-group population: within 0, between = total', () => {
    const r = fitnessVariancePartition([
      [1, 1, 1],
      [3, 3, 3],
    ])

    close(r.between, 1, TOL)
    close(r.within, 0, TOL)
    close(r.between + r.within, totalVariance([1, 1, 1, 3, 3, 3]), TOL)
    ok(r.ratio > 1e6, 'all variance between groups, ratio explodes')
  }),
  // groups {1,3} and {1,3}: both group means 2 = grand mean, so between 0, within = total = 4/6.
  check('equal group means: between 0, within = total', () => {
    const r = fitnessVariancePartition([
      [1, 3],
      [1, 3],
    ])

    close(r.between, 0, TOL)
    close(r.within, totalVariance([1, 3, 1, 3]), TOL)
    close(r.ratio, 0, TOL)
  }),
  // The ANOVA identity holds for a mixed case too.
  check('between + within = total variance (ANOVA identity)', () => {
    const groups = [
      [2, 4, 6],
      [1, 1],
      [5, 9, 5, 1],
    ]

    const r = fitnessVariancePartition(groups)

    close(r.between + r.within, totalVariance(groups.flat()), TOL)
  }),
  check('an empty population is all zeros', () => {
    const r = fitnessVariancePartition([])

    close(r.between, 0, TOL)
    close(r.within, 0, TOL)
    close(r.ratio, 0, TOL)
  }),
])
