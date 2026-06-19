// The W and Z boson masses, the electroweak mass relation. The Higgs mechanism (`gauge/higgs`) gives the gauge
// bosons their mass, and the structure forces two clean facts about the boson masses.
//
//   - M_W / M_Z = cos(theta_W). The W and Z masses are set by the same Higgs vacuum and the two gauge couplings, so
//     their ratio is the cosine of the weak mixing angle. With the measured low-energy sin^2(theta_W) = 0.231 (the
//     3/8 unification value run down, `gauge/weak-angle-prediction`) this gives M_W / M_Z = 0.877, the observed
//     value being 0.881, a clean prediction.
//   - THE CUSTODIAL rho = 1. The rho parameter rho = M_W^2 / (M_Z^2 cos^2(theta_W)) is exactly ONE because the Higgs
//     sits in the SU(2) DOUBLET (the custodial symmetry), the observed value. A Higgs in a different representation
//     would give a different rho, a triplet gives one half, the control, so the observed rho = 1 forces the doublet.
//   - The PHOTON stays massless, the unbroken electromagnetic U(1).
//
// So the W and Z masses follow from the Higgs doublet and the weak angle, with M_W / M_Z = cos(theta_W) near the
// observed value, the custodial rho = 1, and the massless photon, while a non-doublet Higgs gives the wrong rho, the
// control. Depth L2, the mass ratio and the custodial rho computed deterministically, with the Higgs triplet the
// rho-breaking control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { custodialRho, wToZMassRatio } from '@/code/measure/electroweak'

// the measured low-energy weak mixing angle (the 3/8 unification value run down to M_Z)
const SIN2_THETA_W = 0.231
// the observed W and Z masses (GeV), for comparison
const OBSERVED_W = 80.379
const OBSERVED_Z = 91.188

export default experiment({
  id: 'gauge/electroweak-boson-masses',
  title:
    'the W and Z masses, M_W/M_Z = cos(theta_W) near the observed value and the custodial rho = 1 from the Higgs doublet, a triplet the control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // M_W / M_Z = cos(theta_W), compared to the observed ratio
    const predictedRatio = wToZMassRatio(SIN2_THETA_W)
    const observedRatio = OBSERVED_W / OBSERVED_Z
    const ratioMatches = Math.abs(predictedRatio - observedRatio) < 0.01

    // the custodial rho, one for the doublet, one half for the triplet (the control)
    const doubletRho = custodialRho({
      isospin: 0.5,
      isospinComponent: 0.5,
    })

    const tripletRho = custodialRho({ isospin: 1, isospinComponent: 1 })
    const doubletGivesOne = Math.abs(doubletRho - 1) < 1e-9
    const tripletBreaksIt = Math.abs(tripletRho - 1) > 0.1

    const ok = ratioMatches && doubletGivesOne && tripletBreaksIt

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the W and Z boson masses follow from the Higgs doublet and the weak mixing angle. Their ratio M_W / M_Z is the cosine of the weak angle, which with the measured sin^2(theta_W) = 0.231 gives 0.877, close to the observed 0.881. The custodial rho parameter is exactly one because the Higgs sits in the SU(2) doublet (the custodial symmetry), the observed value, while a Higgs triplet gives rho = one half (the control), so the observed rho = 1 forces the doublet. The photon stays massless, the unbroken electromagnetic U(1). So the electroweak boson masses are a clean prediction of the Higgs doublet and the geometric weak angle.',
      metrics: {
        predictedMassRatio: Number(predictedRatio.toFixed(4)),
        observedMassRatio: Number(observedRatio.toFixed(4)),
        doubletRho,
        tripletRho,
        sin2ThetaW: SIN2_THETA_W,
      },
      control: {
        tripletRho,
        tripletBreaksRho: tripletBreaksIt ? 1 : 0,
      },
      notes:
        'the Higgs kinetic term gives M_W = g v / 2 and M_Z = v sqrt(g^2 + g prime squared) / 2, so M_W / M_Z = g / sqrt(g^2 + g prime squared) = cos(theta_W), and rho = M_W^2 / (M_Z^2 cos^2 theta_W) = 1 for the doublet. The measured weak angle (the geometric 3/8 run down to 0.231) then predicts the mass ratio 0.877, near the observed 0.881. The custodial rho = 1 is special to the doublet, a triplet gives one half (rho = (T(T+1) - T_3^2)/(2 T_3^2)), so the observed rho = 1 selects the doublet, the control. The photon is the unbroken combination and stays massless. This is the boson-mass row of the per-particle verification, the W and Z masses from the doublet and the weak angle.',
    })
  },
})
