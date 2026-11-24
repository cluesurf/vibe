// RULE-GROWN POINTER RECORDS, DECOHERENCE, REDUNDANCY AND RECORD-BRANCH CHSH (E-QTM-0206, item vibe-roadmap-board-0018, gaps B-03, B-04, B-06).
// Verifies pointer decoherence, Quantum Darwinism redundancy (R_0.01 = 4), record-branch CHSH > 2.80 using L = 14
// Sigma(648) rule-word settings (every branch counted), classical dephased control <= 2.0, and exact no-signaling.
//
// Depth L2: exact unitary two-mode rule-word synthesis + environment record branches. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runRecordBranchChsh } from '@/code/measure/record-branch-chsh'

export default experiment({
  id: 'quantum/record-branch-chsh',
  code: 'E-QTM-0206',
  title:
    'Rule-grown redundant pointer records, decoherence curve (1/2^k), record-branch CHSH (> 2.80 vs classical control <= 2), and no-signaling',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const res = runRecordBranchChsh()
    const i0 = res.maxUnitarityErr <= 1e-13 && res.maxBranchSumErr <= 1e-13
    const g1 = res.fullCopyCoherenceAt4 <= 1e-13 && res.partialCopyCoherenceCurve[4]! <= 0.0625
    const g2 = res.redundancyR001 >= 4 && res.fragmentMutualInfoBits >= 0.99
    const g3 =
      res.quantumRecordChsh > 2.8 &&
      res.classicalControlChsh <= 2.0 &&
      res.maxNoSignalingDrift <= 1e-13
    const ok = i0 && g1 && g2 && g3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `From frame-invariant singlet with L=14 Sigma(648) rule-word settings (unitarity err ${res.maxUnitarityErr.toExponential(2)}, ` +
        `100% branch count err ${res.maxBranchSumErr.toExponential(2)}): full-copy pointer coherence |rho_01(4)| = ${res.fullCopyCoherenceAt4}, ` +
        `controlled-C partial-copy coherence decays exactly as 1/2^k (${res.partialCopyCoherenceCurve.join(', ')}); ` +
        `redundancy R_0.01 = ${res.redundancyR001} disjoint probes (each I(S:F_j) = ${res.fragmentMutualInfoBits.toFixed(4)} bits); ` +
        `record-branch CHSH = ${res.quantumRecordChsh.toFixed(6)} (passes 2.80) vs failable dephased classical control = ` +
        `${res.classicalControlChsh.toFixed(6)} (<= 2.0000), no-signaling drift = ${res.maxNoSignalingDrift.toExponential(2)}`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        maxUnitarityErr: res.maxUnitarityErr,
        maxBranchSumErr: res.maxBranchSumErr,
        maxSettingDist: res.maxSettingDist,
        fullCopyCoherenceAt4: res.fullCopyCoherenceAt4,
        partialCoherenceAt4: res.partialCopyCoherenceCurve[4]!,
        redundancyR001: res.redundancyR001,
        fragmentMutualInfoBits: res.fragmentMutualInfoBits,
        quantumRecordChsh: res.quantumRecordChsh,
        classicalControlChsh: res.classicalControlChsh,
        maxNoSignalingDrift: res.maxNoSignalingDrift,
      },
    })
  },
})
