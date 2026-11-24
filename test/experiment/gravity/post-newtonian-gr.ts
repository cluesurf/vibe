// POST-NEWTONIAN GENERAL RELATIVITY ON THE {3,4,3,4} 1/N_D^2 WARPED CUSP COLUMN
// (E-GRV-0159, gap B-52; Frontier 6).
//
// Depth L2: parameter-free {3,4,3,4} couplings G_eff = 0.07716700 (E-GRV-0157) and
// c_u = 0.9869161538 (E-RLT-0125) on the isotropic warped-cusp metric (gamma_PPN = 1,
// beta_PPN = 1). Verifies all four classic post-Newtonian GR tests against temporal-only,
// flat-space, Newtonian, special-relativistic Kepler, and raw unwarped bulk screened controls:
//   1. Gravitational clock redshift via live discrete-time unitary chiral Weyl/Dirac internal clock.
//   2. Eddington 2x light bending via exact 6th-order symplectic null rays AND live 2D split-step
//      unitary optical wavepacket.
//   3. Shapiro time delay via exact endpoint-to-endpoint null geodesic integration.
//   4. Relativistic perihelion precession across e in {0.2, 0.4, 0.6} via exact conformal-time
//      6th-order symplectic geodesic integration.
//
// Honest boundary: G_eff and c_u are derived parameter-free from {3,4,3,4}. Once the isotropic
// cusp warp responds symmetrically (gamma_PPN = 1, beta_PPN = 1), all four classic GR tests hold
// cleanly. Deriving gamma_PPN = 1 and beta_PPN = 1 from a full nonlinear 4D spin-2 self-interaction
// on the live {3,4,3,4} honeycomb remains an explicit open target.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runPostNewtonianGR } from '@/code/measure/post-newtonian-gr'

export default experiment({
  id: 'gravity/post-newtonian-gr',
  code: 'E-GRV-0159',
  title:
    'Post-Newtonian General Relativity on the {3,4,3,4} 1/N_D^2 warped cusp metric: gravitational redshift, Eddington 2x light bending (null rays + live 2D unitary optical wavepacket), Shapiro delay, and relativistic perihelion precession',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runPostNewtonianGR()
    const rd = res.redshift
    const lb = res.lightBending
    const sh = res.shapiro
    const pr = res.precession

    // Gate 0: Parameter-free {3,4,3,4} constants and numerical invariants
    const g0ConstantsAndInvariants =
      Math.abs(res.gEff - 0.077167) < 1e-6 &&
      Math.abs(res.cUniversal - 0.9869161538) < 1e-8 &&
      rd.maxNormErr <= 1e-13 &&
      rd.maxReverseErr <= 1e-13 &&
      lb.rayMaxNullConstraintErr <= 1e-13 &&
      lb.rayMaxAngMomErr <= 1e-13 &&
      lb.rayReverseErr <= 1e-11 &&
      lb.waveMaxNormErr <= 1e-13 &&
      lb.waveMaxReverseErr <= 1e-12 &&
      sh.maxEndpointErr <= 1e-11 &&
      pr.maxEnergyErr <= 1e-12 &&
      pr.maxAngMomErr <= 1e-12 &&
      pr.maxReverseErr <= 1e-11

    // Gate 1: Gravitational clock redshift via live unitary chiral Weyl/Dirac internal clock
    const g1Redshift =
      rd.maxExactMetricAbsErr <= 1e-12 &&
      rd.maxExactMetricRelErr <= 1e-10 &&
      rd.maxWeakFieldAbsErr <= 1e-4 &&
      rd.flatControlMaxShift <= 1e-13 &&
      rd.rawBulkControlMaxShift <= 1e-12

    // Gate 2: Eddington 2x light bending (exact symplectic null rays + live 2D unitary wavepacket)
    const g2LightBending =
      lb.rayMaxGRRelErr <= 0.01 &&
      Math.abs(lb.rayMeanGammaPPN - 1) <= 0.02 &&
      Math.abs(lb.raySlopeVsB + 1) <= 0.01 &&
      lb.rayMaxNewtRelErr <= 0.01 &&
      Math.abs(lb.rayMinGRToNewtRatio - 2) <= 0.02 &&
      Math.abs(lb.rayMaxGRToNewtRatio - 2) <= 0.02 &&
      lb.rayRawCollapseFactorAtB10 > 100 &&
      lb.waveMaxGRRelErrInf <= 0.01 &&
      lb.waveMaxGRRelErrFinite <= 0.01 &&
      Math.abs(lb.waveMeanGammaPPN - 1) <= 0.02 &&
      Math.abs(lb.waveSlopeVsB + 1) <= 0.03 &&
      Math.abs(lb.waveSlopeFiniteCorrectedVsB + 1) <= 0.02 &&
      Math.abs(lb.waveMinGRToNewtRatio - 2) <= 0.02 &&
      Math.abs(lb.waveMaxGRToNewtRatio - 2) <= 0.02 &&
      lb.waveMinRawCollapseFactor > 100

    // Gate 3: Shapiro time delay (GR vs temporal-only 2.00x, flat control 0, raw bulk collapsed)
    const g3Shapiro =
      sh.maxGRRelErr <= 0.01 &&
      sh.maxNewtRelErr <= 0.01 &&
      Math.abs(sh.minGRToNewtRatio - 2) <= 0.02 &&
      Math.abs(sh.maxGRToNewtRatio - 2) <= 0.02 &&
      sh.flatControlDelay <= 1e-13 &&
      sh.minRawCollapseFactor > 100

    // Gate 4: Relativistic perihelion precession across e in {0.2, 0.4, 0.6} vs Newtonian (0),
    // temporal-only metric (gamma=0, beta=1 -> exact Will PPN 1/3), and SR flat Kepler (1/6)
    const g4Precession =
      pr.maxGRRelErr <= 0.01 &&
      pr.maxNewtAbsRad <= 1e-10 &&
      pr.maxTemporalOnlyRatioErrFromThird <= 0.01 &&
      pr.maxSRKeplerRatioErrFromSixth <= 0.01

    const ok =
      g0ConstantsAndInvariants && g1Redshift && g2LightBending && g3Shapiro && g4Precession

    const prE02 = pr.entries[0]!
    const prE04 = pr.entries[1]!
    const prE06 = pr.entries[2]!
    const shB40 = sh.entries[0]!
    const lbRay40 = lb.rayEntries[0]!
    const lbWave22 = lb.waveEntries[0]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Using parameter-free {3,4,3,4} warped-cusp couplings G_eff = ${res.gEff.toFixed(8)} (E-GRV-0157) ` +
        `and c_u = ${res.cUniversal.toFixed(10)} (E-RLT-0125) on the symmetric isotropic cusp metric ` +
        `(gamma_PPN = 1, beta_PPN = 1), all four classic post-Newtonian GR tests hold: ` +
        `(1) live unitary chiral Dirac internal clock across r = 20..80 matches exact sqrt(g_00(r1)/g_00(r2)) - 1 ` +
        `to ${rd.maxExactMetricAbsErr.toExponential(2)} and weak-field Delta Phi / c_u^2 to ${rd.maxWeakFieldAbsErr.toExponential(2)} ` +
        `(norm err ${rd.maxNormErr.toExponential(2)}, U^dag reversal ${rd.maxReverseErr.toExponential(2)}, flat control ${rd.flatControlMaxShift.toExponential(2)}); ` +
        `(2) Eddington 2x light bending matches 4 G_eff M / (b c_u^2) to ${(lb.rayMaxGRRelErr * 100).toFixed(3)}% ` +
        `on exact symplectic null rays (gamma_PPN = ${lb.rayMeanGammaPPN.toFixed(4)}, 1/b slope ${lb.raySlopeVsB.toFixed(4)}, ` +
        `GR/Newt = ${lb.rayMinGRToNewtRatio.toFixed(4)}..${lb.rayMaxGRToNewtRatio.toFixed(4)}) and to ` +
        `${(lb.waveMaxGRRelErrInf * 100).toFixed(3)}% inf / ${(lb.waveMaxGRRelErrFinite * 100).toFixed(3)}% finite ` +
        `on live 2D unitary optical wavepackets (gamma_PPN = ${lb.waveMeanGammaPPN.toFixed(4)}, GR/Newt = ` +
        `${lb.waveMinGRToNewtRatio.toFixed(4)}..${lb.waveMaxGRToNewtRatio.toFixed(4)}, norm err ${lb.waveMaxNormErr.toExponential(2)}, ` +
        `reversal ${lb.waveMaxReverseErr.toExponential(2)}, raw bulk collapses by ${lb.waveMinRawCollapseFactor.toExponential(2)}x); ` +
        `(3) Shapiro transit delay matches 2 G_eff M / c_u^3 * ln((r1+r2+2L)/(r1+r2-2L)) to ${(sh.maxGRRelErr * 100).toFixed(3)}% ` +
        `with GR/temporal-only = ${sh.minGRToNewtRatio.toFixed(4)}..${sh.maxGRToNewtRatio.toFixed(4)}; ` +
        `(4) relativistic perihelion precession across e = 0.2, 0.4, 0.6 matches Einstein 6 pi G_eff M / (a(1-e^2)c_u^2) ` +
        `to ${(pr.maxGRRelErr * 100).toFixed(3)}% (H err ${pr.maxEnergyErr.toExponential(2)}, L err ${pr.maxAngMomErr.toExponential(2)}, ` +
        `3-orbit reversal ${pr.maxReverseErr.toExponential(2)}), vs Newtonian 1/r (${pr.maxNewtAbsRad.toExponential(2)} rad), ` +
        `temporal-only metric gamma=0,beta=1 (${prE02.temporalOnlyRatioToGR.toFixed(4)} = exact Will PPN 1/3), and ` +
        `flat-space SR Kepler (${prE02.srKeplerRatioToGR.toFixed(4)} = exact Sommerfeld 1/6). ` +
        `Honest boundary: deriving gamma_PPN = 1, beta_PPN = 1 from a full nonlinear 4D spin-2 self-interaction on the live {3,4,3,4} honeycomb remains an explicit open target.`,
      metrics: {
        g0ConstantsAndInvariants: g0ConstantsAndInvariants ? 1 : 0,
        g1Redshift: g1Redshift ? 1 : 0,
        g2LightBending: g2LightBending ? 1 : 0,
        g3Shapiro: g3Shapiro ? 1 : 0,
        g4Precession: g4Precession ? 1 : 0,
        kEff: res.kEff,
        gEff: res.gEff,
        mEff: res.mEff,
        cUniversal: res.cUniversal,
        redshiftMaxNormErr: rd.maxNormErr,
        redshiftMaxReverseErr: rd.maxReverseErr,
        redshiftMaxExactMetricAbsErr: rd.maxExactMetricAbsErr,
        redshiftMaxExactMetricRelErr: rd.maxExactMetricRelErr,
        redshiftMaxWeakFieldAbsErr: rd.maxWeakFieldAbsErr,
        redshiftMaxWeakFieldRelErr: rd.maxWeakFieldRelErr,
        rayThetaGRB40: lbRay40.thetaGR,
        rayThetaGRTheoryB40: lbRay40.thetaGRTheory,
        rayMaxGRRelErr: lb.rayMaxGRRelErr,
        rayMeanGammaPPN: lb.rayMeanGammaPPN,
        raySlopeVsB: lb.raySlopeVsB,
        rayMinGRToNewtRatio: lb.rayMinGRToNewtRatio,
        rayMaxGRToNewtRatio: lb.rayMaxGRToNewtRatio,
        rayMaxNullConstraintErr: lb.rayMaxNullConstraintErr,
        rayMaxAngMomErr: lb.rayMaxAngMomErr,
        rayReverseErr: lb.rayReverseErr,
        waveThetaGRB22: lbWave22.thetaGR,
        waveThetaGRTheoryInfB22: lbWave22.thetaGRTheoryInf,
        waveMaxGRRelErrInf: lb.waveMaxGRRelErrInf,
        waveMaxGRRelErrFinite: lb.waveMaxGRRelErrFinite,
        waveMeanGammaPPN: lb.waveMeanGammaPPN,
        waveSlopeVsB: lb.waveSlopeVsB,
        waveSlopeFiniteCorrectedVsB: lb.waveSlopeFiniteCorrectedVsB,
        waveMinGRToNewtRatio: lb.waveMinGRToNewtRatio,
        waveMaxGRToNewtRatio: lb.waveMaxGRToNewtRatio,
        waveMaxNormErr: lb.waveMaxNormErr,
        waveMaxReverseErr: lb.waveMaxReverseErr,
        shapiroDeltaTGRB40: shB40.deltaTGR,
        shapiroDeltaTTheoryB40: shB40.deltaTGRTheory,
        shapiroMaxGRRelErr: sh.maxGRRelErr,
        shapiroMaxNewtRelErr: sh.maxNewtRelErr,
        shapiroMinGRToNewtRatio: sh.minGRToNewtRatio,
        shapiroMaxGRToNewtRatio: sh.maxGRToNewtRatio,
        shapiroMaxEndpointErr: sh.maxEndpointErr,
        precessionE02GR: prE02.deltaPhiGR,
        precessionE02Einstein: prE02.deltaPhiEinstein,
        precessionE04GR: prE04.deltaPhiGR,
        precessionE04Einstein: prE04.deltaPhiEinstein,
        precessionE06GR: prE06.deltaPhiGR,
        precessionE06Einstein: prE06.deltaPhiEinstein,
        precessionMaxGRRelErr: pr.maxGRRelErr,
        precessionMaxEnergyErr: pr.maxEnergyErr,
        precessionMaxAngMomErr: pr.maxAngMomErr,
        precessionMaxReverseErr: pr.maxReverseErr,
        elapsedSeconds: res.elapsedSeconds,
      },
      control: {
        redshiftFlatControlMaxShift: rd.flatControlMaxShift,
        redshiftRawBulkControlMaxShift: rd.rawBulkControlMaxShift,
        rawBulkY0: res.rawBulkY0,
        rawBulkKRaw: res.rawBulkKRaw,
        rawBulkMu: res.rawBulkMu,
        rawBulkLatticeG1: res.rawBulkLatticeG1,
        rawBulkLatticeG6: res.rawBulkLatticeG6,
        rawBulkLatticeG8: res.rawBulkLatticeG8,
        rayMaxNewtRelErr: lb.rayMaxNewtRelErr,
        rayRawCollapseFactorAtB10: lb.rayRawCollapseFactorAtB10,
        waveMinRawCollapseFactor: lb.waveMinRawCollapseFactor,
        shapiroFlatControlDelay: sh.flatControlDelay,
        shapiroMinRawCollapseFactor: sh.minRawCollapseFactor,
        precessionMaxNewtAbsRad: pr.maxNewtAbsRad,
        precessionE02TemporalOnlyRatioToGR: prE02.temporalOnlyRatioToGR,
        precessionE04TemporalOnlyRatioToGR: prE04.temporalOnlyRatioToGR,
        precessionE06TemporalOnlyRatioToGR: prE06.temporalOnlyRatioToGR,
        precessionMaxTemporalOnlyRatioErrFromThird: pr.maxTemporalOnlyRatioErrFromThird,
        precessionE02SRKeplerRatioToGR: prE02.srKeplerRatioToGR,
        precessionE04SRKeplerRatioToGR: prE04.srKeplerRatioToGR,
        precessionE06SRKeplerRatioToGR: prE06.srKeplerRatioToGR,
        precessionMaxSRKeplerRatioErrFromSixth: pr.maxSRKeplerRatioErrFromSixth,
      },
      notes:
        'Test 4 uses the exact conformal-time separable geodesic Hamiltonian K = B(r)(H + c_u^2/2) = 1/2 |p|^2 + 1/2 B(r) c_u^2 (1 - E^2/A(r)) = 0, which is algebraically identical to the exact isotropic metric geodesic equation H = -c_u^2/2 on the mass shell while allowing exact 6th-order symmetric Yoshida symplectic integration with exact angular momentum conservation and machine-precision multi-orbit time reversal. Note on perihelion controls: in PPN theory Delta phi = ((2 + 2 gamma - beta)/3) * Delta phi_GR, so the temporal-only metric (gamma = 0, beta = 1) gives exactly 1/3 of Einstein precession, while the flat-space special-relativistic Kepler problem gives Sommerfeld exact 1/6, and Newtonian 1/r gives 0; all three controls are verified. Honest boundary: G_eff and c_u come parameter-free from {3,4,3,4}, whereas deriving gamma_PPN = 1 and beta_PPN = 1 from a full nonlinear 4D spin-2 self-interaction on the live {3,4,3,4} honeycomb remains an explicit open target.',
    })
  },
})
