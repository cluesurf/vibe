// State-independent quantum contextuality on the cell's own spin algebra. The Peres-Mermin magic square of nine
// two-qubit Pauli observables (the Pauli algebra is the {3,4,3,4} cell's quaternion algebra) reaches a
// magic-square value of 6, while any noncontextual hidden-variable assignment is capped at 4. Both numbers are
// computed, the 6 from the actual operator products, the 4 by brute force over all assignments. So the
// deterministic substrate carries genuine contextuality, no value assignment can pre-fix all the answers.
//
// L2, a known quantum result reproduced on the substrate algebra, with a computed classical control. Compute in
// code/measure/contextuality.

import { peresMerminSquare } from '@/code/measure/contextuality'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/contextuality-peres-mermin',
  code: 'E-QTM-0007',
  title:
    'the Peres-Mermin square reaches quantum value 6 against the noncontextual bound 4 on the cell spin algebra',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = peresMerminSquare()

    const ok =
      r.allInvolutions &&
      r.rowsCommute &&
      r.colsCommute &&
      Math.abs(r.quantumValue - 6) < 1e-9 &&
      Math.abs(r.noncontextualBound - 4) < 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the nine two-qubit Pauli observables are commuting involutions in each row and column whose products give a magic-square value of 6, while the best noncontextual value assignment reaches only 4, so the substrate spin algebra is genuinely contextual',
      metrics: {
        quantumValue: r.quantumValue,
        allInvolutions: r.allInvolutions ? 1 : 0,
        contextsCommute: r.rowsCommute && r.colsCommute ? 1 : 0,
      },
      control: { noncontextualBound: r.noncontextualBound },
      notes:
        'L2 known quantum contextuality reproduced on the cell quaternion (Pauli) algebra. the classical bound 4 is computed by brute force over all 512 assignments, not assumed',
    })
  },
})
