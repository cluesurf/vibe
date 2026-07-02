// Conformance for code/measure/localization: the return probability under unitary leapfrog evolution.
//   - A zero Hamiltonian cannot move the excitation: the return probability is identically 1, its time
//     average is 1, and the norm drift is 0 (the trapped / fully localized control).
//   - A two-site hopping H = [[0,1],[1,0]] is exactly solvable: starting at site 0 the return amplitude
//     is cos(t), so the return probability is cos^2(t) and its long-time average is 1/2 (the extended /
//     propagating signature). The leapfrog must hold the norm (drift ~ 0). Both re-derived by hand.

import { suite, check, close, equal } from '@/test/code/harness'
import { returnProbability } from '@/code/measure/localization'
import { type LinearOperator } from '@/code/algebra/linear/sparse'

// the zero operator on n sites: H = 0.
function zeroOperator(n: number): LinearOperator {
  return { size: n, apply: () => new Float64Array(n) }
}

// the two-site hopping H = [[0,1],[1,0]].
const hopping2: LinearOperator = {
  size: 2,
  apply: ({ x }) => Float64Array.from([x[1] ?? 0, x[0] ?? 0]),
}

suite('measure/localization: zero Hamiltonian traps the excitation', [
  check(
    'return probability stays 1, time average 1, norm exactly conserved',
    () => {
      const out = returnProbability({
        operator: zeroOperator(3),
        source: 0,
        steps: 200,
        dt: 0.05,
      })

      close(out.timeAverage, 1, 1e-12)
      equal(out.normDrift, 0)
    },
  ),
])

suite('measure/localization: two-site hopping is exactly cos^2(t)', [
  check('the long-time return probability averages to 1/2', () => {
    const out = returnProbability({
      operator: hopping2,
      source: 0,
      steps: 8000,
      dt: 0.01,
    })

    close(out.timeAverage, 0.5, 0.02)
  }),
  check('the leapfrog conserves the norm (drift ~ 0)', () => {
    const out = returnProbability({
      operator: hopping2,
      source: 0,
      steps: 8000,
      dt: 0.01,
    })

    close(out.normDrift, 0, 1e-3)
  }),
])
