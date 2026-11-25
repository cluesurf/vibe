// ZUREK ENVARIANCE SYMMETRY PREREQUISITES ON THE WORKING RULE (E-QTM-0205, gap B-05).
// Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally
// derived. This experiment verifies the algebraic Zurek envariance symmetry prerequisites (Z_6 phase invariance and
// exact Z[w][1/2] Clifford fine-graining identity) on the single-beat branching amplitudes of R = 2 {3,4,3,4}.
//
// Depth L2: exact Z[w][1/2] branch arithmetic on the exact R = 2 ball. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runEnvarianceBorn } from '@/code/measure/envariance-born'

export default experiment({
  id: 'quantum/envariance-born',
  code: 'E-QTM-0205',
  title:
    'Algebraic Zurek envariance symmetry prerequisites (Z_6 phase invariance and Z[w][1/2] Clifford fine-graining) on single-beat R = 2 {3,4,3,4} branching amplitudes',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runEnvarianceBorn()
    const i0 =
      res.normErr === 0 &&
      res.frontierHits === 0 &&
      res.schmidtWeights[0] === 0.75 &&
      res.schmidtWeights[1] === 0.25
    const g1 = res.phaseEnvarianceExact === res.phaseEnvarianceTested && res.phaseEnvarianceTested === 36
    const g2 =
      res.fineGrainedWeights.every(w => w === 0.25) &&
      res.swapPermutationsExact === 24 &&
      res.derivedCrossProb === 0.75 &&
      res.derivedKeepProb === 0.25
    const g3 = res.dyadicMaxErrByM.every((err, idx) => err <= 1 / 4 ** (idx + 1))
    const ok = i0 && g1 && g2 && g3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally derived. ` +
        `On the exact R = 2 {3,4,3,4} ball (${res.ballCells} docks, 0 frontier hits, normErr=0), 1 working-rule coin+stream beat produces ` +
        `exact single-beat Schmidt weights (${res.schmidtWeights[0]}, ${res.schmidtWeights[1]}). ` +
        `All 36/36 Z_6 phase shifts are exactly phase-envariant (err 0), and exact qutrit Clifford fine-graining splits the 3/4 branch into three ` +
        `exact Z[w][1/2] branches of norm 1/4 ((1-w)/(2*(1+2w)) = -(1+w)/2), giving 4 equal-norm branches (1/4, 1/4, 1/4, 1/4) ` +
        `with all 24/24 S_4 swaps undone exactly on E (symmetry-assigned weights P(cross)=3/4, P(keep)=1/4 conditional on Zurek premises (E1)-(E4)). ` +
        `Iterated m=1..4 dyadic-4 partitions approximate [0,1] within 1/4^m (max err m=4: ${res.dyadicMaxErrByM[3]!.toExponential(2)})`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        frontierHits: res.frontierHits,
        normErr: res.normErr,
        schmidtCross: res.schmidtWeights[0],
        schmidtKeep: res.schmidtWeights[1],
        phaseEnvarianceExact: res.phaseEnvarianceExact,
        swapPermutationsExact: res.swapPermutationsExact,
        derivedCrossProb: res.derivedCrossProb,
        derivedKeepProb: res.derivedKeepProb,
        dyadicMaxErrM4: res.dyadicMaxErrByM[3]!,
      },
      notes:
        'Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally derived. ' +
        'This experiment verifies the algebraic Zurek envariance symmetry prerequisites (Z_6 phase invariance and exact Z[w][1/2] ' +
        'Clifford fine-graining identity) on the single-beat branching amplitudes of R = 2 {3,4,3,4}.',
    })
  },
})
