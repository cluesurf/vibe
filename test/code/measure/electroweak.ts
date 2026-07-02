// Conformance for code/measure/electroweak: the custodial rho parameter and the tree-level W/Z mass
// ratio. rho = (T(T+1) - T_3^2) / (2 T_3^2) is exactly 1 for the SU(2) doublet (T=T_3=1/2) and 1/2
// for the triplet (T=T_3=1), the group-theory fact that the observed rho=1 forces the doublet. The
// mass ratio is cos(theta_W) = sqrt(1 - sin^2 theta_W).

import { suite, check, close } from '@/test/code/harness'
import { custodialRho, wToZMassRatio } from '@/code/measure/electroweak'

const TOL = 1e-12

suite('measure/electroweak: custodial rho', [
  // Doublet T = 1/2, T_3 = 1/2: (0.75 - 0.25) / (2 * 0.25) = 1.
  check('the SU(2) doublet gives rho = 1', () => {
    close(custodialRho({ isospin: 0.5, isospinComponent: 0.5 }), 1, TOL)
  }),
  // Triplet T = 1, T_3 = 1: (2 - 1) / (2 * 1) = 1/2.
  check('the triplet gives rho = 1/2', () => {
    close(custodialRho({ isospin: 1, isospinComponent: 1 }), 0.5, TOL)
  }),
  // A T=3/2, T_3=3/2 representation: (3.75 - 2.25) / (2 * 2.25) = 1.5/4.5 = 1/3.
  check('the T=3/2 representation gives rho = 1/3', () => {
    close(
      custodialRho({ isospin: 1.5, isospinComponent: 1.5 }),
      1 / 3,
      TOL,
    )
  }),
])

suite('measure/electroweak: W/Z mass ratio', [
  // cos(theta_W) = sqrt(1 - sin^2 theta_W).
  check('the ratio is cos(theta_W)', () => {
    close(wToZMassRatio(0), 1, TOL)
    close(wToZMassRatio(0.25), Math.sqrt(0.75), TOL)
    close(wToZMassRatio(0.231), Math.sqrt(1 - 0.231), TOL)
  }),
  // rho = M_W^2 / (M_Z^2 cos^2 theta_W) = 1 by construction when M_W/M_Z = cos theta_W.
  check('the tree relation makes rho = 1', () => {
    const sin2 = 0.231
    const ratio = wToZMassRatio(sin2)
    close((ratio * ratio) / (1 - sin2), 1, TOL)
  }),
])
