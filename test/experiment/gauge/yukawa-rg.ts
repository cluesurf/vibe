// YUKAWA-RG: elevate the GUT MASS RELATIONS from "predicted (at GUT)" to "computed and compared to experiment".
// (1) b-tau, run m_b / m_tau from m_b = m_tau at the GUT scale down to M_Z, the QCD running enhances m_b (the
//     tau is colourless), so the ratio grows, the standard prediction ~2.3 (observed 2.35). (2) the determinant
//     relation, det(M_e) = det(M_d) at GUT, so (m_d m_s m_b)/(m_e m_mu m_tau) at M_Z = (QCD factor)^3, an
//     order-10 prediction (observed ~13). Run: npx tsx code/experiment/yukawa-rg.ts

import { qcdRunningMassFactor } from '@/code/dynamics/renormalization-group'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MZ = 91.19, MGUT = 2e16
const asMZ = 0.1184 // alpha_s(M_Z)

// QCD running-mass factor m(MZ)/m(MGUT) = [alpha_s(MZ)/alpha_s(MGUT)]^(gamma0/(2 b0)), gamma0 = 8 (= 6 C_F),
// b0 = |b3|. (1-loop, the dominant, QCD-only, the electroweak pieces add ~10-15 percent.)
function qcdMassFactor(b3: number): number {
  return qcdRunningMassFactor({ couplingAtReference: asMZ, beta3: b3, referenceScale: MZ, highScale: MGUT })
}

export function yukawaRG(): { bTauSM: number; bTauMSSM: number; detRatio: number } {
  // (1) b-tau, ratio at GUT is 1, at M_Z it is the QCD enhancement of m_b (the tau gets none)
  const etaSM = qcdMassFactor(-7) // SM b3
  const etaMSSM = qcdMassFactor(-3) // MSSM b3
  const ewBoost = 1.12 // approximate electroweak (hypercharge) correction, raises the ratio ~10 percent
  const bTauSM = Math.round(etaSM * ewBoost * 100) / 100
  const bTauMSSM = Math.round(etaMSSM * ewBoost * 100) / 100
  // (2) determinant relation, det(M_d)/det(M_e) at M_Z = (QCD factor)^3 (each down quark enhanced, leptons not)
  const detRatio = Math.round(etaSM ** 3 * 10) / 10
  return { bTauSM, bTauMSSM, detRatio }
}

export default experiment({
  id: 'gauge/yukawa-rg',
  title: 'running b-tau unification down gives the observed mass ratio and determinant relation',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = yukawaRG()
    const ok = r.bTauMSSM > 1.8 && r.bTauMSSM < 3 && r.detRatio > 5
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'running the GUT mass relations down at one loop gives a low-energy b over tau mass ratio near the observed 2.35 and a down-quark over lepton determinant ratio of order ten near the observed value',
      metrics: {
        bTauStandardModel: r.bTauSM,
        bTauMssm: r.bTauMSSM,
        determinantRatio: r.detRatio,
      },
      notes:
        'L2, known physics, one-loop renormalization-group running of standard GUT mass relations compared to experiment. The running uses textbook QCD beta functions, not the substrate dynamics. The substrate supplies only the GUT-scale boundary conditions. Deriving the beta functions from the rule is open.',
    })
  },
})
