// BOUNDARY #2 (E-FRC-0328): DOWNSTREAM CONTINUUM 2-LOOP PATI-SALAM / SO(10) EFT COMPATIBILITY
// CHECK WITH {3,4,3,4} SHELL HIERARCHY b = 6034/330 AND BARE-LATTICE ALPHA(0) TEST.
//
// Part 1: Uses the {3,4,3,4} cusp shell counts N_D = [1, 18, 330, 6034, ...], branching factor
// b = 6034/330 = 18.28484848, and bulk Perron growth lambda = 18.27870777 to map M_Planck / v_EW
// onto D_EW = 13.23 discrete shells (contrasted with the flat-mesh b = 1 control).
//
// Part 2: Continuum 2-loop SO(10) -> Pati-Salam -> SM EFT compatibility check: verifies exact BigInt
// 16 = (4,2,1) + (4bar,1,2) matching weights and 1-loop/2-loop beta coefficients for minimal PS
// ((1,2,2) + (10,1,3)), checks 3-coupling unification (<= 1e-12), backward sin^2(theta_W) = 0.23122,
// proton-decay safe M_GUT = 10^{15.90} GeV, seesaw scale M_PS = 10^{11.16} GeV, RK4 round-trip, and
// the no-PS control recovering the 4.91 non-SUSY mismatch.
//
// Part 3: Tests running canonical single-face bare alpha_lat^{-1} = 4 pi K_eff ln(lambda) = 36.9722 (and 1 / G_eff = 12.7239)
// down through the continuum 2-loop chain to M_Z and q^2 = 0, reporting residuals transparently and
// noting that deriving CODATA alpha(0) and selecting D_GUT, D_PS, D_EW dynamically remain open.
//
// Depth L2: deterministic continuum EFT compatibility check (BigInt rationals + 2-loop RK4). Zero RNG.

import { analyzePatiSalamUnificationHierarchy } from '@/code/measure/pati-salam-unification-hierarchy'
import { ratFormat } from '@/code/measure/so10-three-generations'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/pati-salam-unification-hierarchy',
  code: 'E-FRC-0328',
  title:
    'Downstream continuum 2-loop Pati-Salam / SO(10) EFT compatibility check with {3,4,3,4} shell hierarchy b = 6034/330',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzePatiSalamUnificationHierarchy()
    const h = r.hierarchy
    const emb = r.embedding
    const p = r.primary
    const gj = r.companionGeorgiJarlskog
    const dp = r.companionDParity
    const ctrl = r.noPatiSalamControl
    const lat = r.bareLatticeAlpha

    // Part 1 gates: {3,4,3,4} geometric hierarchy (~13 shells), scale additivity, flat b=1 negative control
    const part1Ok =
      Math.abs(h.cuspBranchingFactorB - 6034 / 330) <= 1e-12 &&
      h.bulkPerronGrowthLambda > 18.27 &&
      h.bulkPerronGrowthLambda < 18.285 &&
      h.depthEwFromB > 13.0 &&
      h.depthEwFromB < 13.5 &&
      h.nearestIntegerShellEw === 13 &&
      h.bPow13 > 2.5e16 &&
      h.bPow13 < 2.65e16 &&
      h.shellCountN13 > 2.5e16 &&
      h.shellCountN13 < 2.65e16 &&
      h.depthPlToGut > 2.0 &&
      h.depthPlToGut < 3.5 &&
      h.depthGutToEw > 10.2 &&
      h.depthGutToEw < 11.4 &&
      h.depthAdditivityErr <= 1e-12 &&
      h.flatControlBranchingB === 1 &&
      h.flatControlShellCountAtD13 === 1 &&
      h.flatControlShellCountAtD1000 === 1 &&
      h.flatControlWarpRatioAtD13 === 1 &&
      h.flatControlResidualTuning > 4.9e16

    // Part 2 gates: exact BigInt PS embedding + beta coefficients, exact 2-loop unification <= 1e-12,
    // exact sin^2(theta_W)(M_Z) = 0.23122, proton-decay safe M_GUT > 10^{15.5}, seesaw M_PS in 10^{11..13.8},
    // round-trip reversibility <= 1e-11, and no-PS control recovering 4.91 mismatch
    const part2Ok =
      emb.embeddingExact &&
      r.smBetaExactMatch &&
      r.primaryPsBetaExpectedMatch &&
      p.matchingBoundaryErr <= 1e-12 &&
      p.unificationMaxResidual <= 1e-12 &&
      p.backwardSin2ThetaWErr <= 1e-10 &&
      p.backwardAlphaEmInvErr <= 1e-9 &&
      p.backwardAlpha3Err <= 1e-10 &&
      p.roundTripMaxErr <= 1e-11 &&
      p.protonDecaySafe &&
      p.log10MGutGeV > 15.5 &&
      p.seesawScaleInWindow &&
      p.seesawNuMassFromMbEV >= 0.01 &&
      p.seesawNuMassFromMbEV <= 0.3 &&
      p.seesawNuMassFromMTauEV >= 0.01 &&
      p.seesawNuMassFromMTauEV <= 0.3 &&
      ctrl.unificationMismatchNoPS > 4.5 &&
      gj.unificationMaxResidual <= 1e-12 &&
      dp.unificationMaxResidual <= 1e-12

    // Part 3 gates: honest canonical single-face bare-lattice alpha(0) running (zero numerology):
    //   - bare unmatched alpha_lat^{-1} = 36.9722 hits a 2-loop QCD Landau pole slightly above M_Z in minimal PS,
    //     while remaining perturbative to M_Z in Georgi-Jarlskog PS (129.52, -5.48%) and D-parity PS (127.01, -7.32%)
    //   - unlogged 1/G_eff = 12.7239 hits a 1-loop QCD Landau pole well above M_Z
    //   - exact 9-digit CODATA alpha(0) remains explicitly open
    const part3Ok =
      Math.abs(lat.alphaLatInvLambda - 36.9722) < 0.001 &&
      Math.abs(lat.invGEff4PiKEff - 12.7239) < 0.001 &&
      !lat.primaryMinimalPsRun.perturbativeToMz &&
      lat.primaryMinimalPsRun.predAlpha3InvMz < 0 &&
      lat.georgiJarlskogPsRun.perturbativeToMz &&
      lat.georgiJarlskogPsRun.stepConvergenceErr <= 1e-6 &&
      lat.georgiJarlskogPsRun.predAlphaEmInvZero > 125 &&
      lat.georgiJarlskogPsRun.predAlphaEmInvZero < 140 &&
      lat.dParityPsRun.perturbativeToMz &&
      lat.dParityPsRun.stepConvergenceErr <= 1e-6 &&
      lat.invGEffHitsLandauPoleAboveMz &&
      !lat.anyZeroParamCodataHit &&
      lat.exactAlphaRemainsOpen

    const ok = part1Ok && part2Ok && part3Ok

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 ({3,4,3,4} geometric hierarchy): with exact cusp branching b=6034/330=${h.cuspBranchingFactorB.toFixed(6)} ` +
        `(bulk lambda=${h.bulkPerronGrowthLambda.toFixed(6)}), M_Planck/v_EW=${h.planckToEwRatio.toExponential(4)} is generated ` +
        `in D_EW=${h.depthEwFromB.toFixed(2)} discrete shells (b^13=${h.bPow13.toExponential(3)}, N_13=${h.shellCountN13.toExponential(3)}, ` +
        `M_Pl/N_13=${h.warpedScaleAtShell13GeV.toFixed(1)} GeV, zero 10^16 fine-tuning), decomposing as D(Pl->GUT)=${h.depthPlToGut.toFixed(2)} + ` +
        `D(GUT->PS)=${h.depthGutToPs.toFixed(2)} + D(PS->EW)=${h.depthPsToEw.toFixed(2)} (D(GUT->EW)=${h.depthGutToEw.toFixed(2)}), ` +
        `while flat-mesh b=1 keeps N_D=1 at every depth with full 4.96e16 fine-tuning. ` +
        `Part 2 (exact 2-loop SO(10)->Pati-Salam->SM unification): exact BigInt 16=(4,2,1)+(4bar,1,2) embedding gives ` +
        `matching weights (${ratFormat(emb.matchingWeight2R)},${ratFormat(emb.matchingWeight4C)}) and minimal PS beta ` +
        `b_PS=(${p.betaCert.b1Formatted.join(',')}) for (1,2,2)_C+(10,1,3)_C, achieving exact 3-coupling unification ` +
        `(res=${p.unificationMaxResidual.toExponential(1)}, alpha_GUT^-1=${p.alphaGutInv.toFixed(4)}) at ` +
        `M_GUT=10^${p.log10MGutGeV.toFixed(3)} GeV (proton-decay safe >10^15.5 GeV, tau_p~${p.protonLifetimeEstimateYr.toExponential(2)} yr) ` +
        `and M_PS=10^${p.log10MPsGeV.toFixed(3)} GeV (Type-I seesaw m_nu=${p.seesawNuMassFromMTauEV.toFixed(3)}..${p.seesawNuMassFromMbEV.toFixed(3)} eV ` +
        `for m_D=m_tau..m_b), backward sin^2(theta_W)(M_Z)=${p.backwardSin2ThetaWMz.toFixed(5)} (err=${p.backwardSin2ThetaWErr.toExponential(1)}), ` +
        `RK4 round-trip err=${p.roundTripMaxErr.toExponential(1)}, while removing PS recovers E-FRC-0326's ${ctrl.unificationMismatchNoPS.toFixed(2)} failure. ` +
        `Part 3 (honest canonical single-face bare-lattice alpha(0) test): running parameter-free alpha_lat^-1=4pi*K_eff*ln(lambda)=${lat.alphaLatInvLambda.toFixed(4)} ` +
        `downward with zero matching hits a 2-loop QCD Landau pole slightly above M_Z in minimal PS (alpha_3^-1(M_Z)=${lat.primaryMinimalPsRun.predAlpha3InvMz.toFixed(2)} < 0), ` +
        `while staying perturbative in Georgi-Jarlskog PS with alpha^-1(0)=${lat.georgiJarlskogPsRun.predAlphaEmInvZero.toFixed(2)} (${lat.georgiJarlskogPsRun.zeroRelResidualPct.toFixed(2)}% vs CODATA 137.036) ` +
        `and D-parity PS with ${lat.dParityPsRun.predAlphaEmInvZero.toFixed(2)} (${lat.dParityPsRun.zeroRelResidualPct.toFixed(2)}%), while unlogged 1/G_eff=${lat.invGEff4PiKEff.toFixed(4)} hits a QCD Landau pole ` +
        `at 10^${lat.invGEffOneLoopLandauLog10GeV.toFixed(2)} GeV (exact 9-digit alpha(0) and discrete shell indices D_PS, D_GUT remain open)`,
      metrics: {
        // Part 1: {3,4,3,4} geometric hierarchy
        cuspBranchingFactorB: Number(h.cuspBranchingFactorB.toFixed(8)),
        bulkPerronGrowthLambda: Number(h.bulkPerronGrowthLambda.toFixed(8)),
        logBranchingFactor: Number(h.logBranchingFactor.toFixed(8)),
        planckToEwRatio: h.planckToEwRatio,
        depthEwFromB: Number(h.depthEwFromB.toFixed(4)),
        depthEwFromLambda: Number(h.depthEwFromLambda.toFixed(4)),
        depthEwFromExactShellN: Number(h.depthEwFromExactShellN.toFixed(4)),
        nearestIntegerShellEw: h.nearestIntegerShellEw,
        bPow13: h.bPow13,
        shellCountN13: h.shellCountN13,
        warpedScaleAtShell13GeV: Number(h.warpedScaleAtShell13GeV.toFixed(3)),
        randallSundrumWarpExponent: Number(h.randallSundrumWarpExponent.toFixed(4)),
        depthPlToGut: Number(h.depthPlToGut.toFixed(4)),
        depthGutToPs: Number(h.depthGutToPs.toFixed(4)),
        depthPsToEw: Number(h.depthPsToEw.toFixed(4)),
        depthGutToEw: Number(h.depthGutToEw.toFixed(4)),
        depthAdditivityErr: h.depthAdditivityErr,
        // Part 2: exact 2-loop SO(10) -> Pati-Salam -> SM unification
        embeddingExact: emb.embeddingExact ? 1 : 0,
        smBetaExactMatch: r.smBetaExactMatch ? 1 : 0,
        primaryPsBetaExpectedMatch: r.primaryPsBetaExpectedMatch ? 1 : 0,
        log10MPsGeV: Number(p.log10MPsGeV.toFixed(5)),
        log10MGutGeV: Number(p.log10MGutGeV.toFixed(5)),
        alphaGutInv: Number(p.alphaGutInv.toFixed(6)),
        matchingBoundaryErr: p.matchingBoundaryErr,
        unificationMaxResidual: p.unificationMaxResidual,
        backwardSin2ThetaWMz: Number(p.backwardSin2ThetaWMz.toFixed(6)),
        backwardSin2ThetaWErr: p.backwardSin2ThetaWErr,
        backwardAlphaEmInvMz: Number(p.backwardAlphaEmInvMz.toFixed(4)),
        backwardAlphaEmInvErr: p.backwardAlphaEmInvErr,
        backwardAlpha3Err: p.backwardAlpha3Err,
        roundTripMaxErr: p.roundTripMaxErr,
        protonLifetimeEstimateYr: p.protonLifetimeEstimateYr,
        protonDecaySafe: p.protonDecaySafe ? 1 : 0,
        seesawNuMassFromMTauEV: Number(p.seesawNuMassFromMTauEV.toFixed(5)),
        seesawNuMassFromMbEV: Number(p.seesawNuMassFromMbEV.toFixed(5)),
        seesawNuMassFromY002EV: Number(p.seesawNuMassFromY002EV.toFixed(5)),
        seesawNuMassFromTopPsEV: Number(p.seesawNuMassFromTopPsEV.toFixed(3)),
        // Companion SO(10) PS variants
        realBidoubletLog10MPs: Number(r.companionRealBidoublet.log10MPsGeV.toFixed(4)),
        realBidoubletLog10MGut: Number(r.companionRealBidoublet.log10MGutGeV.toFixed(4)),
        realBidoubletAlphaGutInv: Number(r.companionRealBidoublet.alphaGutInv.toFixed(4)),
        gjLog10MPs: Number(gj.log10MPsGeV.toFixed(4)),
        gjLog10MGut: Number(gj.log10MGutGeV.toFixed(4)),
        gjAlphaGutInv: Number(gj.alphaGutInv.toFixed(4)),
        dParityLog10MPs: Number(dp.log10MPsGeV.toFixed(4)),
        dParityLog10MGut: Number(dp.log10MGutGeV.toFixed(4)),
        dParityAlphaGutInv: Number(dp.alphaGutInv.toFixed(4)),
        // Part 3: honest bare-lattice alpha(0) test
        latticeKEff: Number(lat.latticeKEff.toFixed(8)),
        latticeGEff: Number(lat.latticeGEff.toFixed(8)),
        invGEff4PiKEff: Number(lat.invGEff4PiKEff.toFixed(6)),
        alphaLatInvLambda: Number(lat.alphaLatInvLambda.toFixed(6)),
        alphaLatInvCuspB: Number(lat.alphaLatInvCuspB.toFixed(6)),
        barePredAlphaEmInvMz: Number(lat.primaryMinimalPsRun.predAlphaEmInvMz.toFixed(4)),
        barePredAlphaEmInvMzResidualPct: Number(
          lat.primaryMinimalPsRun.mzRelResidualPct.toFixed(3),
        ),
        barePredAlphaEmInvZero: Number(lat.primaryMinimalPsRun.predAlphaEmInvZero.toFixed(4)),
        barePredAlphaEmInvZeroResidualPct: Number(
          lat.primaryMinimalPsRun.zeroRelResidualPct.toFixed(3),
        ),
        barePredSin2ThetaWMz: Number(lat.primaryMinimalPsRun.predSin2ThetaWMz.toFixed(5)),
        barePredAlpha3InvMz: Number(lat.primaryMinimalPsRun.predAlpha3InvMz.toFixed(4)),
        barePredStepConvergenceErr: lat.primaryMinimalPsRun.stepConvergenceErr,
        gjBarePredAlphaEmInvMz: Number(lat.georgiJarlskogPsRun.predAlphaEmInvMz.toFixed(4)),
        gjBarePredAlphaEmInvZero: Number(lat.georgiJarlskogPsRun.predAlphaEmInvZero.toFixed(4)),
        gjBarePredZeroResidualPct: Number(
          lat.georgiJarlskogPsRun.zeroRelResidualPct.toFixed(3),
        ),
        dParityBarePredAlphaEmInvZero: Number(lat.dParityPsRun.predAlphaEmInvZero.toFixed(4)),
        dParityBarePredZeroResidualPct: Number(lat.dParityPsRun.zeroRelResidualPct.toFixed(3)),
        anyZeroParamCodataHit: lat.anyZeroParamCodataHit ? 1 : 0,
        exactAlphaRemainsOpen: lat.exactAlphaRemainsOpen ? 1 : 0,
      },
      control: {
        // Part 1 flat-mesh and Euclidean negative controls
        flatControlBranchingB: h.flatControlBranchingB,
        flatControlShellCountAtD13: h.flatControlShellCountAtD13,
        flatControlShellCountAtD1000: h.flatControlShellCountAtD1000,
        flatControlWarpRatioAtD13: h.flatControlWarpRatioAtD13,
        flatControlResidualTuning: h.flatControlResidualTuning,
        euclidean3DShellsNeeded: Number(h.euclidean3DShellsNeeded.toFixed(2)),
        // Part 2 no-Pati-Salam negative control (M_PS = M_GUT -> E-FRC-0326 4.91 failure)
        noPsLog10M12GeV: Number(ctrl.log10M12GeV.toFixed(4)),
        noPsAlpha12Inv: Number(ctrl.alpha12Inv.toFixed(4)),
        noPsAlpha3InvAtM12: Number(ctrl.alpha3InvAtM12.toFixed(4)),
        unificationMismatchNoPS: Number(ctrl.unificationMismatchNoPS.toFixed(4)),
        // Part 3 unlogged 1 / G_eff Landau-pole negative control
        invGEffOneLoopAlpha3InvAtMPs: Number(lat.invGEffOneLoopAlpha3InvAtMPs.toFixed(4)),
        invGEffOneLoopAlpha3InvAtMz: Number(lat.invGEffOneLoopAlpha3InvAtMz.toFixed(4)),
        invGEffOneLoopLandauLog10GeV: Number(lat.invGEffOneLoopLandauLog10GeV.toFixed(4)),
        invGEffHitsLandauPoleAboveMz: lat.invGEffHitsLandauPoleAboveMz ? 1 : 0,
      },
      notes:
        'Downstream continuum 2-loop Pati-Salam / SO(10) EFT compatibility check with {3,4,3,4} shell hierarchy b = 6034/330 (L2, zero random numbers, EFT continuum rather than QCA dynamics): ' +
        '(1) Shell hierarchy mapping: b = 6034/330 = 18.284848 (bulk Perron lambda = 18.278708) maps M_Planck/v_EW = 4.96e16 ' +
        'to D_EW = 13.23 discrete shells (N_13 = 2.52e16, M_Pl/N_13 = 484 GeV), contrasted with flat b = 1. ' +
        '(2) Continuum 2-loop RG compatibility: minimal Pati-Salam (1,2,2)_C + (10,1,3)_C inside SO(10) closes the non-SUSY ' +
        `4.91 mismatch to ${p.unificationMaxResidual.toExponential(1)}, reproduces sin^2(theta_W)(M_Z) = 0.23122 from 3/8 ` +
        `to ${p.backwardSin2ThetaWErr.toExponential(1)}, places M_GUT = 10^${p.log10MGutGeV.toFixed(3)} GeV above Super-K, ` +
        `and puts M_PS = 10^${p.log10MPsGeV.toFixed(3)} GeV in the Type-I seesaw window (m_nu = 0.022..0.122 eV for m_D = m_tau..m_b). ` +
        `(3) Bare-lattice alpha(0) boundary: running canonical single-face alpha_lat^-1 = 4 pi K_eff ln(lambda) = ${lat.alphaLatInvLambda.toFixed(4)} downward without lattice matching ` +
        `hits a 2-loop QCD Landau pole slightly above M_Z in minimal PS (alpha_3^-1(M_Z) = ${lat.primaryMinimalPsRun.predAlpha3InvMz.toFixed(2)} < 0), ` +
        `while staying perturbative at alpha^-1(0) = ${lat.georgiJarlskogPsRun.predAlphaEmInvZero.toFixed(2)} (${lat.georgiJarlskogPsRun.zeroRelResidualPct.toFixed(2)}%) ` +
        `with (15,2,2)_R and ${lat.dParityPsRun.predAlphaEmInvZero.toFixed(2)} (${lat.dParityPsRun.zeroRelResidualPct.toFixed(2)}%) in D-parity PS, while unlogged 1/G_eff = ${lat.invGEff4PiKEff.toFixed(4)} hits a QCD Landau pole above M_Z. Deriving CODATA alpha(0) and ` +
        'dynamically selecting symmetry-breaking scales D_GUT, D_PS, D_EW from the live QCA remain open.',
    })
  },
})
