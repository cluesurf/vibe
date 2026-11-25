// ZUREK ENVARIANCE SYMMETRY PREREQUISITES ON THE WORKING RULE (E-QTM-0205, gap B-05).
// Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally
// derived. This experiment verifies the algebraic Zurek envariance symmetry prerequisites on explicit bipartite
// state vectors |Psi_SE> in H_S (x) H_E constructed from the single-beat branching amplitudes of R = 2 {3,4,3,4}
// (with cross-branch role fine-graining via the Tier-B Sigma(648) qutrit Fourier gate Z_3 F_3).
//
// Depth L2: exact Z[w][1/6] bipartite matrix-vector arithmetic on the exact R = 2 ball. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runEnvarianceBorn } from '@/code/measure/envariance-born'

export default experiment({
  id: 'quantum/envariance-born',
  code: 'E-QTM-0205',
  title:
    'Algebraic Zurek envariance symmetry prerequisites (explicit bipartite Z_6 phase and S_4 swap unitaries via Sigma(648) qutrit fine-graining) on single-beat R = 2 {3,4,3,4} amplitudes',
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
    const g1 =
      res.phaseEnvarianceExact === res.phaseEnvarianceTested &&
      res.phaseEnvarianceTested === 36
    const g2 =
      res.fineGrainingUnitaryExact &&
      res.fineGrainedInZOmegaHalf &&
      res.fineGrainedWeights.every(w => w === 0.25) &&
      res.swapPermutationsExact === 24 &&
      res.equalBranchCounts[0] === 3 &&
      res.equalBranchCounts[1] === 1 &&
      res.derivedCrossProb === res.schmidtWeights[0] &&
      res.derivedKeepProb === res.schmidtWeights[1]
    const ok = i0 && g1 && g2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally derived. ` +
        `On the exact R = 2 {3,4,3,4} ball (${res.ballCells} docks, 0 frontier hits, normErr=0), 1 working-rule coin+stream beat produces ` +
        `exact single-beat Schmidt weights (${res.schmidtWeights[0]}, ${res.schmidtWeights[1]}). ` +
        `On the explicit 2-branch bipartite state |Psi_2> in H_S^(2) (x) H_E^(2), all ${res.phaseEnvarianceExact}/${res.phaseEnvarianceTested} ` +
        `exact Z_6 x Z_6 unitary matrix pairs U_S (x) U_E leave |Psi_2> invariant entry-by-entry (err 0). ` +
        `Applying the exact 6x6 unitary diag(I_3, Z_3 F_3) in the Tier-B Sigma(648) qutrit Clifford group (extending bare single-excitation U) ` +
        `plus controlled environment-role entanglement on H_S^(6) (x) H_E^(6) yields a 4-branch Schmidt vector |Psi_4> reducing exactly into ` +
        `Z[w][1/2] with computed branch weights (${res.fineGrainedWeights.join(', ')}), invariant entry-by-entry under all ` +
        `${res.swapPermutationsExact}/${res.swapPermutationsTested} explicit S_4 swap-and-phase unitaries U_S(pi) (x) U_E(pi). ` +
        `Branch-count symmetry weights (${res.equalBranchCounts[0]}/4=${res.derivedCrossProb}, ${res.equalBranchCounts[1]}/4=${res.derivedKeepProb}) ` +
        `match the R=2 ball squared moduli conditional on Zurek premises (E1)-(E4)`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        frontierHits: res.frontierHits,
        normErr: res.normErr,
        schmidtCross: res.schmidtWeights[0],
        schmidtKeep: res.schmidtWeights[1],
        phaseEnvarianceExact: res.phaseEnvarianceExact,
        fineGrainingUnitaryExact: res.fineGrainingUnitaryExact ? 1 : 0,
        fineGrainedInZOmegaHalf: res.fineGrainedInZOmegaHalf ? 1 : 0,
        swapPermutationsExact: res.swapPermutationsExact,
        equalBranchesCross: res.equalBranchCounts[0],
        equalBranchesKeep: res.equalBranchCounts[1],
        derivedCrossProb: res.derivedCrossProb,
        derivedKeepProb: res.derivedKeepProb,
      },
      notes:
        'Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally derived. ' +
        'The 3-branch cross-role fine-graining gate Z_3 F_3 lies in the Tier-B qutrit Clifford group Sigma(648) over Z[w][1/3] ' +
        '(beyond bare single-excitation U), and the exact identity (1-w)/(2*(1+2w)) = -(1+w)/2 collapses the 4-branch Schmidt vector ' +
        'back into Z[w][1/2].',
    })
  },
})
