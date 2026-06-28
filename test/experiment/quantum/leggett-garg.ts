// The Leggett-Garg temporal inequality on the cell's two-state spin. A dichotomic observable measured at three
// times during a coherent rotation gives a Leggett-Garg value of 3/2, violating the macrorealist bound of 1. The
// quantum value is computed from the actual unitary and observable (the two-time correlator is Tr[Z R^dag Z R]/2),
// and the classical bound 1 is computed by brute force. So the substrate violates macrorealism in time, the
// temporal counterpart of Bell, with no injected randomness.
//
// L2, a known quantum result reproduced on the substrate spin, with a computed classical control. Compute in
// code/measure/leggett-garg.

import { leggettGarg } from '@/code/measure/leggett-garg'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/leggett-garg',
  code: 'E-QTM-0015',
  title:
    'a coherent qubit reaches the Leggett-Garg value 3/2, violating the macrorealist bound 1',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = leggettGarg()

    const ok =
      Math.abs(r.quantumMax - 1.5) < 0.02 &&
      Math.abs(r.classicalBound - 1) < 1e-9 &&
      r.quantumMax > r.classicalBound + 0.4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the coherent two-time correlators give a Leggett-Garg value of about 3/2 at a rotation of pi/3, above the macrorealist bound of 1, so the substrate violates macrorealism in time as it violates locality in space',
      metrics: {
        quantumMax: r.quantumMax,
        bestThetaOverPi: r.bestTheta / Math.PI,
      },
      control: { macrorealistBound: r.classicalBound },
      notes:
        'L2 known temporal Bell result reproduced on the cell spin. the quantum value is computed from the unitary and observable, the classical bound by brute force, neither assumed',
    })
  },
})
