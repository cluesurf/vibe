// L2 CONTINUUM GR CONSISTENCY BENCHMARK PARAMETERIZED BY WARPED-COLUMN (G_eff, c_u):
// LINEARIZED FIERZ-PAULI, LICHNEROWICZ-EINSTEIN STAR, AND 3D REGGE CONVERGENCE (E-GRV-0160).
//
// Depth L2 (continuum EFT / GR benchmark, NOT derived from the discrete QCA): takes warped-column
// constants G_eff = 0.07859254 (E-GRV-0157), c_u = 0.9779246684 (E-RLT-0125), and m_KK = 3.2725
// as continuum inputs and runs three standard GR consistency benchmarks:
//   1. Linearized Fierz-Pauli spin-2 + trace operator yielding h_ij = h_00 delta_ij and gamma_PPN = 1
//      to <= 1e-12 (contrasted with Nordstrom -1, temporal-only 0, and Horava-detuned controls).
//   2. Iterative Lichnerowicz-Einstein self-gravitating relativistic star from flat space converging
//      (residual <= 1e-13) to isotropic Schwarzschild outside the star, checking gamma_PPN = 1,
//      beta_PPN = 1, vacuum max|G_{mu nu}| <= 1e-9, interior Einstein equations, Bianchi identity
//      <= 1e-10, and Kretschmann scalar K (contrasted with linear-only and no-pressure controls).
//   3. Discrete 3D Regge deficit-angle curvature on the {4,3,4} Freudenthal triangulation deformed by
//      psi(r)^2 converging at O(h^2) to the continuum Ricci scalar R^{(3)} and 3D Einstein-Hilbert action.
//
// Honest boundary: this is an L2 continuum GR consistency benchmark parameterized by warped-column
// (G_eff, c_u), NOT a microscopic derivation of Einstein's equations from the {3,4,3,4} QCA.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runNonlinearEinsteinCurvature } from '@/code/measure/nonlinear-einstein-curvature'

export default experiment({
  id: 'gravity/nonlinear-einstein-curvature',
  code: 'E-GRV-0160',
  title:
    'L2 continuum GR consistency benchmark parameterized by warped-column (G_eff, c_u): linearized Fierz-Pauli, Lichnerowicz-Einstein star, and Regge convergence (not derived from QCA)',
  category: 'gravity',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runNonlinearEinsteinCurvature()
    const p1 = res.part1
    const p2 = res.part2
    const p3 = res.part3

    // Gate 0: Parameter-free {3,4,3,4} constants, KK gap (zero light Horava scalar), spectral self-check
    const g0ConstantsAndSetup =
      Math.abs(res.kEff - 1.0125321220) < 1e-7 &&
      Math.abs(res.gEff - 0.07859254) < 1e-6 &&
      Math.abs(res.cUniversal - 0.9779246684) < 1e-8 &&
      p1.zeroModeCount === 1 &&
      res.mKKMin > 3.2 &&
      p2.spectralChebSelfCheckErr <= 1e-11 &&
      res.elapsedSeconds <= 12

    // Gate 1: Exact derivation of gamma_PPN = 1 from Fierz-Pauli spin-2 + trace on {3,4,3,4} warped column
    const g1FierzPauliGamma =
      p1.maxSymmetryErr <= 1e-14 &&
      p1.maxDiffeoNullErr <= 1e-13 &&
      p1.maxBianchiErr <= 1e-13 &&
      p1.maxGammaBardeenErr <= 1e-12 &&
      p1.maxGammaColumnMomentumErr <= 1e-12 &&
      p1.maxColumnIsotropyErr <= 1e-12 &&
      p1.maxColumnResidualErr <= 1e-12 &&
      p1.maxGammaRealSpaceErr <= 1e-12 &&
      Math.abs(p1.nordstromGammaPPN + 1) <= 1e-12 &&
      p1.nordstromLightBendingRatio === 0 &&
      p1.temporalOnlyGammaPPN === 0 &&
      p1.temporalOnlyLightBendingRatio === 0.5 &&
      Math.abs(p1.horavaDetunedGammaPPN - 1) > 0.1 &&
      p1.horavaDetunedBianchiViolation > 0.05

    // Gate 2: Iterative Lichnerowicz-Einstein nonlinear fixed point, exact isotropic Schwarzschild,
    // gamma_PPN = 1, beta_PPN = 1, full 4D Einstein equations, Bianchi identity, Kretschmann scalar
    const g2NonlinearEinstein =
      p2.finalResidual <= 1e-13 &&
      p2.contractionRatioAvg > 0 &&
      p2.contractionRatioAvg < 0.7 &&
      p2.komarVsAdmRelErr <= 1e-10 &&
      p2.gammaErr <= 1e-4 &&
      p2.betaErr <= 1e-3 &&
      p2.maxSchwarzschildAMetricRelErr <= 1e-10 &&
      p2.maxSchwarzschildBMetricRelErr <= 1e-10 &&
      p2.vacuumMaxEinsteinAbs <= 1e-9 &&
      p2.interiorMaxG00RelErr <= 1e-3 &&
      p2.interiorMaxGrrRelErr <= 1e-3 &&
      p2.interiorMaxGttRelErr <= 1e-3 &&
      p2.bianchiMaxEverywhere <= 1e-10 &&
      p2.kretschmannMaxExteriorRelErr <= 1e-4 &&
      p2.fdCrossCheckPsiMaxDiff <= 1e-7 &&
      p2.fdCrossCheckAlphaMaxDiff <= 1e-7 &&
      Math.abs(p2.linearControlBetaPPN) <= 1e-6 &&
      p2.linearControlVacuumMaxEinsteinAbs > 1e-6 &&
      p2.linearControlVacuumViolationRatio > 1e5 &&
      p2.noPressureKomarVsAdmRelErr > 1e-2 &&
      p2.noPressureVacuumMaxEinsteinAbs > 1e-5

    // Gate 3: Discrete Regge-Einstein deficit-angle curvature convergence O(h^2) on {4,3,4} / {3,4,3,4}
    const g3ReggeCurvature =
      p3.flatControlMaxDeficit <= 1e-14 &&
      Math.abs(p3.flatControlRRegge) <= 1e-12 &&
      Math.abs(p3.coreCenterConvergenceOrder - 2) <= 0.1 &&
      p3.coreCenterFinestRelErr <= 1e-3 &&
      Math.abs(p3.offCenterConvergenceOrder - 2) <= 0.1 &&
      p3.offCenterFinestRelErr <= 1e-3 &&
      Math.abs(p3.vacuumConvergenceOrder - 2) <= 0.15 &&
      p3.vacuumCancellationRatio <= 1e-3 &&
      Math.abs(p3.actionConvergenceOrder - 2) <= 0.15 &&
      p3.actionFinestRelErr <= 2e-2

    const ok = g0ConstantsAndSetup && g1FierzPauliGamma && g2NonlinearEinstein && g3ReggeCurvature

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `L2 continuum GR consistency benchmark parameterized by warped-column constants K_eff = ${res.kEff.toFixed(10)}, ` +
        `G_eff = ${res.gEff.toFixed(8)}, c_u = ${res.cUniversal.toFixed(10)}, and KK gap m_KK = ${res.mKKMin.toFixed(4)} ` +
        `(not derived from the discrete QCA): ` +
        `(1) Linearized 7x7 Fierz-Pauli operator (3 diffeo null modes <= ${p1.maxDiffeoNullErr.toExponential(2)}, ` +
        `Bianchi <= ${p1.maxBianchiErr.toExponential(2)}) and ${p1.columnSystemDim}x${p1.columnSystemDim} ` +
        `warped-column de Donder operator give h_ij = h_00 delta_ij and gamma_PPN = 1 to ` +
        `${p1.maxGammaBardeenErr.toExponential(2)} (Bardeen), ${p1.maxGammaColumnMomentumErr.toExponential(2)} (column k), ` +
        `and ${p1.maxGammaRealSpaceErr.toExponential(2)} (3D real space), contrasting with Nordstrom scalar ` +
        `(gamma = ${p1.nordstromGammaPPN.toFixed(1)}, light bending 0x), temporal-only (gamma = ${p1.temporalOnlyGammaPPN.toFixed(1)}, ` +
        `0.5x), and Horava detuning alpha_H=${p1.horavaDetuneAlpha} (gamma = ${p1.horavaDetunedGammaPPN.toFixed(4)}, ` +
        `Bianchi err ${p1.horavaDetunedBianchiViolation.toExponential(2)}). ` +
        `(2) Iterative Lichnerowicz-Einstein relativistic star solver from flat space contracts in ` +
        `${p2.iterations} steps (avg ratio ${p2.contractionRatioAvg.toFixed(4)}, residual ${p2.finalResidual.toExponential(2)}, ` +
        `M_Komar/M_ADM err ${p2.komarVsAdmRelErr.toExponential(2)}, r_s/R_star = ${p2.compactnessRsOverRStar.toFixed(4)}) ` +
        `to isotropic Schwarzschild outside the star (A err ${p2.maxSchwarzschildAMetricRelErr.toExponential(2)}, ` +
        `B err ${p2.maxSchwarzschildBMetricRelErr.toExponential(2)}), checking gamma_PPN = ${p2.extractedGammaPPN.toFixed(10)} ` +
        `(err ${p2.gammaErr.toExponential(2)}) and beta_PPN = ${p2.extractedBetaPPN.toFixed(10)} ` +
        `(err ${p2.betaErr.toExponential(2)}), vacuum max|G_{mu nu}| = ${p2.vacuumMaxEinsteinAbs.toExponential(2)}, ` +
        `interior G_{00}/(8piG T_{00}/c^4) err = ${p2.interiorMaxG00RelErr.toExponential(2)}, ` +
        `G_{rr} err = ${p2.interiorMaxGrrRelErr.toExponential(2)}, Bianchi max|nabla^mu G_{mu nu}| = ` +
        `${p2.bianchiMaxEverywhere.toExponential(2)} everywhere, and Kretschmann K(r) rel err = ` +
        `${p2.kretschmannMaxExteriorRelErr.toExponential(2)} (linear-only control yields beta_PPN = ` +
        `${p2.linearControlBetaPPN.toFixed(6)} and breaks vacuum G_{mu nu}=0 by ${p2.linearControlVacuumViolationRatio.toExponential(2)}x). ` +
        `(3) Discrete 3D Regge deficit-angle curvature on the {4,3,4} Freudenthal triangulation deformed by ` +
        `psi(r)^2 converges at O(h^2) to continuum R^{(3)} at core center (order ${p3.coreCenterConvergenceOrder.toFixed(3)}, ` +
        `err ${p3.coreCenterFinestRelErr.toExponential(2)}), off-center (order ${p3.offCenterConvergenceOrder.toFixed(3)}, ` +
        `err ${p3.offCenterFinestRelErr.toExponential(2)}), vacuum exterior cancellation (order ${p3.vacuumConvergenceOrder.toFixed(3)}, ` +
        `ratio ${p3.vacuumCancellationRatio.toExponential(2)}), and integrated 3D Einstein-Hilbert action ` +
        `(order ${p3.actionConvergenceOrder.toFixed(3)}, err ${p3.actionFinestRelErr.toExponential(2)}). ` +
        `Honest boundary: this is a continuum GR consistency benchmark parameterized by warped-column (G_eff, c_u), ` +
        `not an emergent derivation of Einstein curvature from the discrete QCA.`,
      metrics: {
        g0ConstantsAndSetup: g0ConstantsAndSetup ? 1 : 0,
        g1FierzPauliGamma: g1FierzPauliGamma ? 1 : 0,
        g2NonlinearEinstein: g2NonlinearEinstein ? 1 : 0,
        g3ReggeCurvature: g3ReggeCurvature ? 1 : 0,
        kEff: res.kEff,
        gEff: res.gEff,
        mEff: res.mEff,
        cUniversal: res.cUniversal,
        mKKMin: res.mKKMin,
        // Part 1
        p1ColumnSystemDim: p1.columnSystemDim,
        p1MaxSymmetryErr: p1.maxSymmetryErr,
        p1MaxDiffeoNullErr: p1.maxDiffeoNullErr,
        p1MaxBianchiErr: p1.maxBianchiErr,
        p1MaxGammaBardeenErr: p1.maxGammaBardeenErr,
        p1MaxGammaColumnMomentumErr: p1.maxGammaColumnMomentumErr,
        p1MaxColumnIsotropyErr: p1.maxColumnIsotropyErr,
        p1MaxColumnResidualErr: p1.maxColumnResidualErr,
        p1MaxGammaRealSpaceErr: p1.maxGammaRealSpaceErr,
        // Part 2
        p2SpectralChebSelfCheckErr: p2.spectralChebSelfCheckErr,
        p2Iterations: p2.iterations,
        p2FinalResidual: p2.finalResidual,
        p2ContractionRatioAvg: p2.contractionRatioAvg,
        p2MRestFlat: p2.mRestFlat,
        p2MAdm: p2.mAdm,
        p2MKomar: p2.mKomar,
        p2KomarVsAdmRelErr: p2.komarVsAdmRelErr,
        p2RSchwarzschild: p2.rSchwarzschild,
        p2CompactnessRsOverRStar: p2.compactnessRsOverRStar,
        p2PsiCenter: p2.psiCenter,
        p2AlphaCenter: p2.alphaCenter,
        p2ExtractedRg: p2.extractedRg,
        p2ExtractedGammaPPN: p2.extractedGammaPPN,
        p2ExtractedBetaPPN: p2.extractedBetaPPN,
        p2GammaErr: p2.gammaErr,
        p2BetaErr: p2.betaErr,
        p2MaxSchwarzschildAMetricRelErr: p2.maxSchwarzschildAMetricRelErr,
        p2MaxSchwarzschildBMetricRelErr: p2.maxSchwarzschildBMetricRelErr,
        p2VacuumMaxEinsteinAbs: p2.vacuumMaxEinsteinAbs,
        p2InteriorMaxG00RelErr: p2.interiorMaxG00RelErr,
        p2InteriorMaxGrrRelErr: p2.interiorMaxGrrRelErr,
        p2InteriorMaxGttRelErr: p2.interiorMaxGttRelErr,
        p2BianchiMaxInterior: p2.bianchiMaxInterior,
        p2BianchiMaxExterior: p2.bianchiMaxExterior,
        p2BianchiMaxEverywhere: p2.bianchiMaxEverywhere,
        p2KretschmannMaxExteriorRelErr: p2.kretschmannMaxExteriorRelErr,
        p2KretschmannAtR6: p2.kretschmannAtR6,
        p2KretschmannExactAtR6: p2.kretschmannExactAtR6,
        p2FdCrossCheckPsiMaxDiff: p2.fdCrossCheckPsiMaxDiff,
        p2FdCrossCheckAlphaMaxDiff: p2.fdCrossCheckAlphaMaxDiff,
        // Part 3
        p3CoreCenterContinuumR3: p3.coreCenterContinuumR3,
        p3CoreCenterConvergenceOrder: p3.coreCenterConvergenceOrder,
        p3CoreCenterFinestRelErr: p3.coreCenterFinestRelErr,
        p3OffCenterContinuumR3: p3.offCenterContinuumR3,
        p3OffCenterConvergenceOrder: p3.offCenterConvergenceOrder,
        p3OffCenterFinestRelErr: p3.offCenterFinestRelErr,
        p3VacuumConvergenceOrder: p3.vacuumConvergenceOrder,
        p3VacuumFinestAbsR3: p3.vacuumFinestAbsR3,
        p3VacuumCancellationRatio: p3.vacuumCancellationRatio,
        p3ContinuumEHAction3D: p3.continuumEHAction3D,
        p3ActionConvergenceOrder: p3.actionConvergenceOrder,
        p3ActionFinestRelErr: p3.actionFinestRelErr,
        elapsedSeconds: res.elapsedSeconds,
      },
      control: {
        p1NordstromGammaPPN: p1.nordstromGammaPPN,
        p1NordstromLightBendingRatio: p1.nordstromLightBendingRatio,
        p1TemporalOnlyGammaPPN: p1.temporalOnlyGammaPPN,
        p1TemporalOnlyLightBendingRatio: p1.temporalOnlyLightBendingRatio,
        p1HoravaDetuneAlpha: p1.horavaDetuneAlpha,
        p1HoravaDetunedGammaPPN: p1.horavaDetunedGammaPPN,
        p1HoravaDetunedBianchiViolation: p1.horavaDetunedBianchiViolation,
        p2LinearControlGammaPPN: p2.linearControlGammaPPN,
        p2LinearControlBetaPPN: p2.linearControlBetaPPN,
        p2LinearControlVacuumMaxEinsteinAbs: p2.linearControlVacuumMaxEinsteinAbs,
        p2LinearControlVacuumViolationRatio: p2.linearControlVacuumViolationRatio,
        p2NoPressureKomarVsAdmRelErr: p2.noPressureKomarVsAdmRelErr,
        p2NoPressureGammaPPN: p2.noPressureGammaPPN,
        p2NoPressureBetaPPN: p2.noPressureBetaPPN,
        p2NoPressureVacuumMaxEinsteinAbs: p2.noPressureVacuumMaxEinsteinAbs,
        p3FlatControlMaxDeficit: p3.flatControlMaxDeficit,
        p3FlatControlRRegge: p3.flatControlRRegge,
      },
      notes:
        'L2 continuum GR consistency benchmark parameterized by warped-column (G_eff, c_u), NOT derived from the discrete {3,4,3,4} QCA. Part 1 checks gamma_PPN = 1 in the linearized Fierz-Pauli spin-2 + trace operator (contrasted with Nordstrom, temporal-only, and Horava-detuned controls). Part 2 runs a continuum Lichnerowicz-Einstein diffuse relativistic star solver starting from flat space (cross-checked between 2-domain spectral collocation and 4th-order Numerov finite differences), verifying exterior isotropic Schwarzschild, gamma_PPN = beta_PPN = 1, interior G_{mu nu} = (8 pi G_eff / c_u^4) T_{mu nu}, Bianchi identity, and Kretschmann scalar. Part 3 checks O(h^2) convergence of discrete 3D Regge deficit-angle curvature on the {4,3,4} Freudenthal triangulation deformed by psi(r)^2 to continuum R^{(3)} and the 3D Einstein-Hilbert action.',
    })
  },
})
