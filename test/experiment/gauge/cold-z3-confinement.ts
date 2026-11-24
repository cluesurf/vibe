// Cold-vacuum T = 0 quantum unitary Z_3-center / Sigma(648) confining string (E-FRC-0322, B-45 / B-23).
//
// THE QUESTION. The classical reversible Sigma(648) demon link rule m1 (E-FRC-0110, E-FRC-0254)
// froze at T = 0 because zero demon energy leaves no quantum electric tunneling out of U_p = 1.
// Does the exact zero-temperature (T = 0) quantum Kogut-Susskind and discrete-time Floquet
// Z_3-center gauge theory of Sigma(648) form a linear confining string in the cold vacuum with
// exact triality and exact unitary Gauss-law conservation?
//
// MODEL. Open 2D plaquette ladder of L_x = 6 plaquettes (14 vertices, 19 links, exact gauge-invariant
// Hilbert dimension 3^6 = 729). Link variables live in the exact Z_3 center {1, omega, omega^2} of
// Sigma(648) inside Z[omega][1/6], with qutrit electric shift E_l and magnetic clock U_l inside
// Delta(27) subset Sigma(648). Hamiltonian:
//   H = g^2 sum_l (1 - Re(E_l)) - (1 / g^2) sum_p Re(U_p)
// Floquet unitary:
//   U_dt = exp(-i dt H_E) exp(-i dt H_B) at g^2 = 1, dt = 4 pi / 9 (exact in Z[zeta_9][1/6]).
//
// GATES (fixed before the first run):
//   G1 (Sigma(648) Z_3 center): |Sigma(648)| = 648, |Z(Sigma(648))| = 3, exact Q(zeta_9) commutation
//      with all 4 generators, entries in Z[omega][1/6], and exact Weyl relation E U = omega U E.
//   G2 (Cold T = 0 linear confinement): across g^2 in {2.0, 1.0, 0.5} on R = 1..5 in the exact cold
//      ground state (zero temperature, zero heat bath), string tension sigma > 0 and linear R^2 > 0.999.
//   G3 (Triality): 3 like charges (+1, +1, +1) form a gauge-invariant color-neutral baryon (dim = 729,
//      0 Gauss violations, finite E_baryon > 0), 2 like charges (+1, +1) have empty physical space
//      (dim = 0), and an adjoint Z_3-neutral pair (q = 0 mod 3) has zero string tension (|sigma_adj| <= 1e-12).
//   G4 (Unitary Floquet evolution vs frozen g^2 = 0 control): exact Z[zeta_9][1/6] gate unitarity,
//      ||U_dt^dag U_dt - I||_max <= 1e-14, ||[U_dt, G_x]||_max <= 1e-14, quantum tunneling out of
//      |U_p = 1> (survival < 0.9), whereas the frozen classical g^2 = 0 control stays locked at
//      |U_p = 1> (survival = 1 to 1e-12) with zero string tension (|sigma_frozen| <= 1e-12).
//
// Depth L2: exact diagonalization and Floquet verification of Z_3 Kogut-Susskind lattice gauge theory
// for the center of Sigma(648) on a 2D plaquette ladder.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  auditFloquetUnitary,
  auditSigma648Center,
  auditTriality,
  buildPlaquetteLadder,
  measureStaticPotentialCurve,
  verifyDenseVsLanczos,
} from '@/code/measure/cold-z3-confinement'

const COUPLINGS = [2.0, 1.0, 0.5] as const
const DISTANCES = [1, 2, 3, 4, 5] as const
const LX = 6

export default experiment({
  id: 'gauge/cold-z3-confinement',
  code: 'E-FRC-0322',
  title: 'Cold-vacuum T = 0 quantum unitary Z_3-center confinement in Sigma(648)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const center = auditSigma648Center()
    const ladder = buildPlaquetteLadder(LX)

    const curves = COUPLINGS.map(g2 => measureStaticPotentialCurve(ladder, g2, DISTANCES))
    const edCheck = verifyDenseVsLanczos(ladder, 1.0)
    const triality = auditTriality(ladder, 1.0, DISTANCES)
    const floquet = auditFloquetUnitary(ladder)

    const g1 =
      center.groupOrder === 648 &&
      center.centerOrder === 3 &&
      center.exactCenterCommutesWithAllGenerators &&
      center.exactCenterInZOmegaOneSixth &&
      center.exactWeylAlgebraHolds

    const g2 =
      curves.every(c => c.sigma > 0 && c.rSquared > 0.999 && Number.isFinite(c.sigma)) &&
      edCheck.maxAbsError <= 1e-12

    const g3 =
      triality.baryonSolvable &&
      triality.baryonHilbertDim === ladder.hilbertDim &&
      triality.baryonGaussViolations === 0 &&
      Number.isFinite(triality.baryonEnergy) &&
      triality.baryonEnergy > 0 &&
      !triality.diquarkSolvable &&
      triality.diquarkHilbertDim === 0 &&
      Math.abs(triality.adjointSigma) <= 1e-12 &&
      triality.adjointMaxAbsPotential <= 1e-12

    const g4 =
      floquet.exactPlaquetteGateUnitary &&
      floquet.exactPlaquetteGateInZZeta9OneSixth &&
      floquet.exactElectricPhasesInZZeta9OneSixth &&
      floquet.fullUnitarityError <= 1e-14 &&
      floquet.gaussCommutatorMaxError <= 1e-14 &&
      floquet.quantumTunnelingSurvival < 0.9 &&
      floquet.quantumPlaquetteShift > 1e-3 &&
      Math.abs(floquet.frozenControlSurvival - 1) <= 1e-12 &&
      floquet.frozenControlPlaquetteShift <= 1e-12 &&
      Math.abs(floquet.frozenControlSigma) <= 1e-12

    const passed = g1 && g2 && g3 && g4

    const c20 = curves[0]!
    const c10 = curves[1]!
    const c05 = curves[2]!

    const metrics: Record<string, number> = {
      sigma648_order: center.groupOrder,
      sigma648_center_order: center.centerOrder,
      center_exact_in_z_omega_1_6: center.exactCenterInZOmegaOneSixth ? 1 : 0,
      weyl_algebra_exact: center.exactWeylAlgebraHolds ? 1 : 0,
      ladder_plaquettes: ladder.plaquetteCount,
      hilbert_dim: ladder.hilbertDim,
      sigma_g2_2_0: c20.sigma,
      r2_g2_2_0: c20.rSquared,
      v1_g2_2_0: c20.potentials[0]!,
      v5_g2_2_0: c20.potentials[4]!,
      sigma_g2_1_0: c10.sigma,
      r2_g2_1_0: c10.rSquared,
      v1_g2_1_0: c10.potentials[0]!,
      v5_g2_1_0: c10.potentials[4]!,
      sigma_g2_0_5: c05.sigma,
      r2_g2_0_5: c05.rSquared,
      v1_g2_0_5: c05.potentials[0]!,
      v5_g2_0_5: c05.potentials[4]!,
      baryon_energy_g2_1_0: triality.baryonEnergy,
      baryon_hilbert_dim: triality.baryonHilbertDim,
      baryon_gauss_violations: triality.baryonGaussViolations,
      diquark_hilbert_dim: triality.diquarkHilbertDim,
      ed_vs_lanczos_max_error: edCheck.maxAbsError,
      floquet_exact_in_z_zeta9_1_6:
        floquet.exactPlaquetteGateInZZeta9OneSixth && floquet.exactElectricPhasesInZZeta9OneSixth
          ? 1
          : 0,
      floquet_unitarity_error: floquet.fullUnitarityError,
      floquet_gauss_commutator_error: floquet.gaussCommutatorMaxError,
      floquet_quantum_survival: floquet.quantumTunnelingSurvival,
      floquet_quantum_plaquette_shift: floquet.quantumPlaquetteShift,
    }

    const control: Record<string, number> = {
      adjoint_sigma_g2_1_0: triality.adjointSigma,
      adjoint_max_abs_potential: triality.adjointMaxAbsPotential,
      diquark_solvable: triality.diquarkSolvable ? 1 : 0,
      frozen_g2_0_sigma: floquet.frozenControlSigma,
      frozen_g2_0_survival: floquet.frozenControlSurvival,
      frozen_g2_0_plaquette_shift: floquet.frozenControlPlaquetteShift,
    }

    return verdict({
      status: passed ? 'pass' : 'fail',
      claim: passed
        ? 'The exact T = 0 quantum Z_3-center gauge theory of Sigma(648) on a 6-plaquette ladder produces a linear confining string (R^2 > 0.999 across g^2 = 2.0, 1.0, 0.5), exact triality (finite-energy baryon, forbidden diquark, zero adjoint tension), and exact unitary Gauss-conserving Floquet dynamics in Z[zeta_9][1/6], contrasting with the frozen g^2 = 0 limit.'
        : 'Cold-vacuum T = 0 Z_3-center confinement failed one or more pre-registered gates.',
      metrics,
      control,
      notes: `Gates: G1(center)=${g1}, G2(linear confinement)=${g2}, G3(triality)=${g3}, G4(Floquet vs frozen)=${g4}. Bare strong-coupling tensions 1.5*g^2 are 3.0, 1.5, 0.75 vs measured renormalized tensions ${c20.sigma.toFixed(6)}, ${c10.sigma.toFixed(6)}, ${c05.sigma.toFixed(6)}.`,
    })
  },
})
