// RULE-WORD POINTER RECORDS, PARTIAL-TRACE DECOHERENCE, REDUNDANCY, AND RECORD-BRANCH CHSH (E-QTM-0206).
// L1 abstract multi-qubit circuit using Sigma(648) rule-word generators (no spatial mesh):
//   - Explicit (1 + 4)-qubit (dim = 32) unitary evolution and partial traces rho_S, rho_{F_j}, rho_{S F_j}
//     with exact 2x2 closed-form and 4x4 Hermitian Jacobi eigensolver computing von Neumann entropies and
//     mutual information I(S : F_j) directly from the evolved state vector.
//   - Explicit (2 + 8)-qubit (dim = 1024) record-branch CHSH read directly from the 8 environment-record bits
//     with 100% unanimous consensus check, classical dephased density-matrix control <= 2.0, and no-signaling.
//
// Depth L1: exact deterministic multi-qubit state-vector arithmetic. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runRecordBranchChsh } from '@/code/measure/record-branch-chsh'

export default experiment({
  id: 'quantum/record-branch-chsh',
  code: 'E-QTM-0206',
  title:
    'L1 multi-qubit partial-trace decoherence (1/2^k), Quantum Darwinism redundancy (R_0.01 = 4), and (2+8)-qubit record-branch CHSH (> 2.80 vs dephased control <= 2)',
  category: 'quantum',
  substrates: ['none'],
  depth: 'L1',
  paper: false,
  run() {
    const res = runRecordBranchChsh()
    const i0 =
      res.maxUnitarityErr <= 1e-13 &&
      res.maxBranchSumErr <= 1e-13 &&
      res.maxStateNormErr <= 1e-13 &&
      res.maxEnvConsensusErr <= 1e-15
    const g1 =
      res.fullCopyCoherenceAt4 < 1e-15 &&
      res.maxPartialCopyCurveErr < 1e-14 &&
      res.partialCopyCoherenceCurve[4]! <= 0.0625 + 1e-14
    const g2 =
      res.redundancyR001 === 4 &&
      res.fragmentMutualInfoBits >= 0.99 &&
      res.fragmentMutualInfos.every(mi => Math.abs(mi - 1.0) <= 1e-13)
    const g3 =
      res.quantumRecordChsh > 2.8 &&
      res.classicalControlChsh <= 2.0 &&
      res.maxNoSignalingDrift <= 1e-13
    const ok = i0 && g1 && g2 && g3

    const curveStr = res.partialCopyCoherenceCurve.map(v => v.toFixed(4)).join(', ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `On explicit (1+4)-qubit (dim=32) and (2+8)-qubit (dim=1024) unitary circuits with L=14 Sigma(648) rule-word settings ` +
        `(unitarity err ${res.maxUnitarityErr.toExponential(2)}, state norm err ${res.maxStateNormErr.toExponential(2)}, ` +
        `branch sum err ${res.maxBranchSumErr.toExponential(2)}, env consensus err ${res.maxEnvConsensusErr.toExponential(2)}): ` +
        `partial-trace full-copy coherence |rho_S[0,1]| = ${res.fullCopyCoherenceAt4.toExponential(2)}, ` +
        `controlled-C partial-copy coherence 2|rho_S[0,1](k)| = [${curveStr}] matching (1/2)^k to ${res.maxPartialCopyCurveErr.toExponential(2)}, ` +
        `partial-trace redundancy R_0.01 = ${res.redundancyR001}/4 disjoint probes (each I(S:F_j) = ${res.fragmentMutualInfoBits.toFixed(6)} bits), ` +
        `and 10-qubit environment-record CHSH = ${res.quantumRecordChsh.toFixed(6)} (> 2.80) vs dephased classical control = ` +
        `${res.classicalControlChsh.toFixed(6)} (<= 2.0000) with no-signaling drift = ${res.maxNoSignalingDrift.toExponential(2)}`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        maxUnitarityErr: res.maxUnitarityErr,
        maxBranchSumErr: res.maxBranchSumErr,
        maxStateNormErr: res.maxStateNormErr,
        maxEnvConsensusErr: res.maxEnvConsensusErr,
        maxSettingDist: res.maxSettingDist,
        fullCopyCoherenceAt4: res.fullCopyCoherenceAt4,
        partialCoherenceAt4: res.partialCopyCoherenceCurve[4]!,
        maxPartialCopyCurveErr: res.maxPartialCopyCurveErr,
        redundancyR001: res.redundancyR001,
        fragmentMutualInfoBits: res.fragmentMutualInfoBits,
        quantumRecordChsh: res.quantumRecordChsh,
        classicalControlChsh: res.classicalControlChsh,
        maxNoSignalingDrift: res.maxNoSignalingDrift,
      },
      control: {
        classicalControlChsh: res.classicalControlChsh,
        maxNoSignalingDrift: res.maxNoSignalingDrift,
        maxEnvConsensusErr: res.maxEnvConsensusErr,
      },
      notes:
        'L1 abstract multi-qubit circuit (not a {3,4,3,4} spatial mesh simulation). ' +
        'All reduced density matrices rho_S, rho_{F_j}, rho_{S F_j} and von Neumann entropies are computed directly ' +
        'from evolved complex state vectors (dim = 32 and dim = 1024), and record-branch CHSH reads purely from the ' +
        '8 environment-record bits with zero disagreeing probe weight.',
    })
  },
})
