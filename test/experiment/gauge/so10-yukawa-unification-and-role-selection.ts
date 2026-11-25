// FRONTIER 2 (E-FRC-0330): PHENOMENOLOGICAL V(S, P_3) ROLE-COUPLING MODEL FOR (r = sqrt(2), delta = +2/9)
// AND CONTINUUM SO(10) 10_H + 126bar_H GEORGI-JARLSKOG YUKAWA EFT COMPATIBILITY CHECK.
//
// Part 1: Spectral audit of H_role and illustrative phenomenological V(S, P_3) coupling model:
//   1A. Exact 9x9 BigInt + Q(zeta_9) spectral check of H_role = (1/9)(X_3 (x) I_3 + X_3^dag (x) I_3):
//       quadratic minimal polynomial (H_role - 2/9 I)(H_role + 1/9 I) = 0 with eigenvalues +2/9 (mult 3)
//       and -1/9 (mult 6), auditing 7 discrete candidates.
//   1B. Illustrative phenomenological S_3 x Z_3-invariant Landau coupling model V(S, P_3) (NOT a
//       first-principles dynamical derivation from the QCA) minimized from 81 grid starts to (sqrt(2), +2/9),
//       linked to E-FRC-0327's L = 22 Z[w][1/2] MITM word, plus P_6 and kappa_role = 0 controls.
//
// Part 2: Continuum SO(10) 10_H + 126bar_H Georgi-Jarlskog Yukawa EFT check:
//   2A. Exact BigInt Clebsch-Gordan check 16 (x)_S 16 = 10_S + 126_S, Tr_{SU(4)_C}(B - L) = 0 (-3 Clebsch).
//   2B. Continuum 2-loop gauge + Yukawa RG running M_Z -> M_PS -> M_GUT = 7.95e15 GeV (E-FRC-0328).
//   2C. 10 continuous real parameters PLUS discrete Z_9 exponent and sign search choices (disclosed explicitly)
//       fitted across SM flavor observables, explicitly reporting the known non-SUSY minimal 10_H + 126bar_H
//       light down-quark pull (-41% m_d / +70% m_s), plus 11-parameter companion and 4 negative controls.
//
// Depth L2: deterministic continuum EFT compatibility check. Zero RNG.

import {
  analyzeSo10YukawaUnificationAndRoleSelection,
  rat,
  ratEq,
  ratFormat,
} from '@/code/measure/so10-yukawa-unification-and-role-selection'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/so10-yukawa-unification-and-role-selection',
  code: 'E-FRC-0330',
  title:
    'Illustrative phenomenological V(S, P_3) coupling model for (r = sqrt(2), delta = +2/9) and continuum SO(10) 10_H + 126bar_H Yukawa EFT check (10 continuous params + discrete Z_9/sign choices, -41% m_d / +70% m_s pull)',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeSo10YukawaUnificationAndRoleSelection()
    const p1a = r.part1A
    const p1b = r.part1B
    const p2 = r.part2
    const s10 = p2.primary10Param
    const s11 = p2.companion11Param
    const ctrl = p2.controls

    // Part 1A gates: exact BigInt quadratic minimal poly, exact P_3/P_6 algebra, exact Q(zeta_9) Z_3 clock, unique +2/9
    const part1AOk =
      p1a.roleDim === 9 &&
      ratEq(p1a.lambdaPlusExact, rat(2n, 9n)) &&
      ratEq(p1a.lambdaMinusExact, rat(-1n, 9n)) &&
      p1a.minimalPolyQuadraticExact &&
      p1a.onlyTwoEigenspacesExact &&
      p1a.p3IdempotentExact &&
      p1a.p6IdempotentExact &&
      p1a.p3P6OrthogonalExact &&
      p1a.p3PlusP6IdentityExact &&
      p1a.p3P6SymmetricExact &&
      p1a.spectralDecompositionExact &&
      ratEq(p1a.multiplicityPlusExact, rat(3n)) &&
      ratEq(p1a.multiplicityMinusExact, rat(6n)) &&
      ratEq(p1a.traceHroleExact, rat(0n)) &&
      p1a.clockOrder3UnitaryExact &&
      p1a.clockCommutesWithHroleExact &&
      p1a.clockCommutesWithP3Exact &&
      p1a.clockCommutesWithP6Exact &&
      p1a.p3SingleThreeGenMultipletExact &&
      p1a.p6DoubledSixGenMultipletExact &&
      p1a.candidateAudit.length === 7 &&
      p1a.selectedCandidatesCount === 1 &&
      p1a.uniqueSelectedCandidateLabel === '+2/9' &&
      p1a.minusOneNinthInPositivityCone &&
      p1a.minusOneNinthRelErrMuOverE > 0.6

    // Part 1B gates: 100% 81/81 convergence to (sqrt(2), +2/9) <= 1e-12, symmetry <= 1e-14, convex, MITM link, controls
    const part1BOk =
      p1b.gridSizeTotal === 81 &&
      p1b.convergedCount === 81 &&
      p1b.maxRErrFromSqrt2 <= 1e-12 &&
      p1b.maxDeltaErrFromTwoNinths <= 1e-12 &&
      p1b.maxS3CasimirPermutationErr <= 1e-14 &&
      p1b.maxZ3ClockInvarianceErr <= 1e-14 &&
      p1b.maxConjugateBranchInvarianceErr <= 1e-14 &&
      p1b.strictlyConvexAtMinimum &&
      p1b.hessianAnalyticMatchErr <= 1e-6 &&
      p1b.lockedKoideQErr <= 1e-14 &&
      p1b.lockedMuOverERelErr < 2e-5 &&
      p1b.lockedTauOverMuRelErr < 1e-4 &&
      p1b.mitmWordLength === 22 &&
      p1b.mitmExactSU2Ok &&
      p1b.mitmDeltaAbsErrFromLockedRad < 1e-6 &&
      p1b.mitmKoideQErr <= 1e-14 &&
      p1b.controlP6ConvergedCount === 81 &&
      p1b.controlP6DeltaErrFromMinusOneNinth <= 1e-12 &&
      p1b.controlP6MuOverERelErr > 0.6 &&
      p1b.controlZeroKappaMaxGradDelta <= 1e-13 &&
      p1b.controlZeroKappaHessianDeltaDelta <= 1e-10 &&
      p1b.controlZeroKappaFinalDeltaSpreadRad > 0.9 &&
      p1b.controlZeroKappaMaxRErrFromSqrt2 <= 1e-12

    // Part 2A & 2B gates: exact BigInt -3 Clebsch & B-L tracelessness, exact SM+PS RG running & reversibility
    const part2ABOk =
      p2.clebschCert.symTensor16DimExact === 136n &&
      p2.clebschCert.symDecomposition10Plus126Exact &&
      p2.clebschCert.antisymTensor16DimExact === 120n &&
      p2.clebschCert.clebschMinusThreeExact &&
      ratEq(p2.clebschCert.georgiJarlskogClebschRatioExact, rat(-3n)) &&
      ratEq(p2.clebschCert.trSu4BMinusLLeftExact, rat(0n)) &&
      ratEq(p2.clebschCert.trSu4BMinusLRightExact, rat(0n)) &&
      p2.rgTargets.mGutGeV > 7.9e15 &&
      p2.rgTargets.mGutGeV < 8.0e15 &&
      p2.rgTargets.rk4RoundTripMaxRelErr <= 1e-10 &&
      p2.rgTargets.mbOverMtauGut > 0.6 &&
      p2.rgTargets.mbOverMtauGut < 0.85

    // Part 2C gates: 10-param SO(10) 10_H + 126bar_H unified matrices across all 22 observables (+12 overdetermination!)
    const part2COk =
      s10.nContinuousRealParams === 10 &&
      p2.ledger.nObservables === 22 &&
      p2.ledger.nContinuousRealParams === 10 &&
      p2.ledger.paramsSlashedVs327 === 4 &&
      p2.ledger.netOverdeterminationContinuous === 12 &&
      s10.unifiedIdentityErr <= 1e-14 &&
      s10.maxMatrixSymmetryErr <= 1e-14 &&
      s10.maxTakagiReconErr <= 1e-13 &&
      s10.maxSectorUnitarityErr <= 1e-14 &&
      s10.seesawInvErr <= 1e-12 &&
      // Charged leptons (< 0.01% pole, exact Q_e = 2/3)
      s10.leptonPoleMaxRelErr < 1e-4 &&
      Math.abs(s10.leptonPoleKoideQ - 2 / 3) <= 1e-14 &&
      // Up quarks (< 12% across all 3) and bottom quark (< 10%)
      Math.abs(s10.upGutRelErrs[0]) < 0.12 &&
      Math.abs(s10.upGutRelErrs[1]) < 0.12 &&
      Math.abs(s10.upGutRelErrs[2]) < 0.03 &&
      Math.abs(s10.downGutRelErrs[2]) < 0.10 &&
      // CKM (< 6% on |V_us|, |V_cb|, |V_ub|, positive J_CKM within 20%, exact unitarity & quartet invariance)
      s10.ckmRelErrVus < 0.06 &&
      s10.ckmRelErrVcb < 0.06 &&
      s10.ckmRelErrVub < 0.06 &&
      s10.ckmMzJarlskog > 2.5e-5 &&
      s10.ckmMzJarlskog < 4.0e-5 &&
      s10.ckmUnitarityErr <= 1e-14 &&
      s10.ckmJarlskogQuartetSpread <= 1e-14 &&
      // Neutrinos + PMNS from SAME Y_126 (normal ordering, sum < 0.12 eV, Q_nu < 2/3, large PMNS, negative J_PMNS)
      s10.normalOrdering &&
      s10.sumNeutrinoMassesEv < 0.12 &&
      s10.bypassesDiracWarpNoGo &&
      s10.koideQNu < 2 / 3 &&
      s10.dmRatioRelErr < 0.05 &&
      s10.pmnsRelErrS12 < 0.08 &&
      s10.pmnsRelErrS23 < 0.18 &&
      s10.pmnsRelErrS13 < 0.10 &&
      s10.pmnsJarlskogCP < -0.01 &&
      s10.pmnsUnitarityErr <= 1e-14 &&
      s10.pmnsJarlskogQuartetSpread <= 1e-14 &&
      // 11-param companion improves chi2 cleanly
      s11.chi2Total < s10.chi2Total

    // Part 2D gates: all 4 required negative controls
    const part2DOk =
      ctrl.pure10HMeMinusMdErr <= 1e-14 &&
      Math.abs(ctrl.pure10HMuOverMs - 1) <= 1e-14 &&
      Math.abs(ctrl.pure10HMeOverMd - 1) <= 1e-14 &&
      Math.abs(ctrl.pure10HMtauOverMb - 1) <= 1e-14 &&
      ctrl.pure10HCkmVus <= 1e-13 &&
      ctrl.pure10HCkmVcb <= 1e-13 &&
      Math.abs(ctrl.pure10HCkmJarlskog) <= 1e-14 &&
      ctrl.pure10HMajoranaSingular &&
      ctrl.wrongClebschMeMinusMdErr <= 1e-14 &&
      Math.abs(ctrl.wrongClebschMuOverMs - 1) <= 1e-14 &&
      Math.abs(ctrl.wrongClebschMeOverMd - 1) <= 1e-14 &&
      Math.abs(ctrl.wrongClebschMtauOverMb - 1) <= 1e-14 &&
      Math.abs(ctrl.realYukawaCkmJarlskog) <= 1e-14 &&
      Math.abs(ctrl.realYukawaPmnsJarlskog) <= 1e-14 &&
      ctrl.maxTakagiReconErr <= 1e-13 &&
      ctrl.maxUnitarityErr <= 1e-14 &&
      ctrl.seesawInvErr <= 1e-12

    const ok = part1AOk && part1BOk && part2ABOk && part2COk && part2DOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1A (exact BigInt + Q(zeta_9) spectral check on 9-state Sigma(648) role grid): ` +
        `H_role = (1/9)(X_3 (x) I_3 + X_3^dag (x) I_3) satisfies quadratic minimal polynomial ` +
        `(H_role - 2/9 I_9)(H_role + 1/9 I_9) = 0 with lambda_+ = ${ratFormat(p1a.lambdaPlusExact)} ` +
        `(mult ${ratFormat(p1a.multiplicityPlusExact)}) and lambda_- = ${ratFormat(p1a.lambdaMinusExact)} ` +
        `(mult ${ratFormat(p1a.multiplicityMinusExact)}). Across 7 discrete candidates ` +
        `{+2/9, -1/9, 0, pi/9, 2pi/9, 1/9, 1/3}, delta = ${p1a.uniqueSelectedCandidateLabel} matches ` +
        `mult 3 and S > 0 (-1/9 sits inside S > 0 yet has mult 6 and misses PDG m_mu/m_e by ${(p1a.minusOneNinthRelErrMuOverE * 100).toFixed(2)}%). ` +
        `Part 1B (illustrative phenomenological V(S, P_3) coupling model, not a QCA derivation): ${p1b.convergedCount}/${p1b.gridSizeTotal} ` +
        `grid starts converge to (r_* = sqrt(2), delta_* = +2/9) (max err ${Math.max(p1b.maxRErrFromSqrt2, p1b.maxDeltaErrFromTwoNinths).toExponential(2)}), ` +
        `giving Q = 2/3 (err ${p1b.lockedKoideQErr.toExponential(1)}), m_mu/m_e = ${p1b.lockedMuOverE.toFixed(4)} ` +
        `(${(p1b.lockedMuOverERelErr * 100).toFixed(5)}%), m_tau/m_mu = ${p1b.lockedTauOverMu.toFixed(4)} ` +
        `(${(p1b.lockedTauOverMuRelErr * 100).toFixed(5)}%), linked to E-FRC-0327 L = ${p1b.mitmWordLength} ` +
        `Z[w][1/2] MITM word (${p1b.mitmDeltaAbsErrFromLockedRad.toExponential(2)} rad), while P_6 locks to -1/9 ` +
        `and kappa_role = 0 leaves delta flat. ` +
        `Part 2 (continuum SO(10) 10_H + 126bar_H Yukawa EFT check at M_GUT = ${p2.rgTargets.mGutGeV.toExponential(3)} GeV): ` +
        `exact BigInt 16 (x)_S 16 = 10_S + 126_S and Tr_{SU(4)_C}(B - L) = 0 verify the -3 Clebsch factor. ` +
        `Using ${s10.nContinuousRealParams} continuous real parameters alongside ${p2.ledger.nDiscreteStructuralInputs} discrete Z_9/sign phase choices ` +
        `(no continuous CP phases), unified (H, F) gives charged leptons to ${(s10.leptonPoleMaxRelErr * 100).toFixed(4)}% ` +
        `(pole Q_e = 2/3), up quarks (u ${(s10.upGutRelErrs[0] * 100).toFixed(1)}%, c ${(s10.upGutRelErrs[1] * 100).toFixed(1)}%, ` +
        `t ${(s10.upGutRelErrs[2] * 100).toFixed(1)}%), m_b (${(s10.downGutRelErrs[2] * 100).toFixed(1)}%), unitary CKM ` +
        `(|V_us|=${s10.ckmMzVus.toFixed(4)}, |V_cb|=${s10.ckmMzVcb.toFixed(4)}, |V_ub|=${s10.ckmMzVub.toFixed(5)}, ` +
        `J_CP=${s10.ckmMzJarlskog.toExponential(3)}), and Type-I seesaw neutrinos (normal ordering, sum m_nu=${s10.sumNeutrinoMassesEv.toFixed(4)} eV, ` +
        `sin^2 t12=${s10.pmnsSin2Theta12.toFixed(4)}, t23=${s10.pmnsSin2Theta23.toFixed(4)}, t13=${s10.pmnsSin2Theta13.toFixed(5)}, ` +
        `J_PMNS=${s10.pmnsJarlskogCP.toExponential(3)}), while explicitly showing the known light down-quark pull ` +
        `(m_d ${(s10.downGutRelErrs[0] * 100).toFixed(1)}%, m_s +${(s10.downGutRelErrs[1] * 100).toFixed(1)}%) and passing all 4 negative controls`,
      metrics: {
        // Part 1A
        minimalPolyQuadraticExact: p1a.minimalPolyQuadraticExact ? 1 : 0,
        multiplicityPlusExact: Number(p1a.multiplicityPlusExact.num),
        multiplicityMinusExact: Number(p1a.multiplicityMinusExact.num),
        clockCommutesExact:
          p1a.clockCommutesWithHroleExact && p1a.clockCommutesWithP3Exact && p1a.clockCommutesWithP6Exact
            ? 1
            : 0,
        p3SingleThreeGenMultipletExact: p1a.p3SingleThreeGenMultipletExact ? 1 : 0,
        p6DoubledSixGenMultipletExact: p1a.p6DoubledSixGenMultipletExact ? 1 : 0,
        selectedCandidatesCount: p1a.selectedCandidatesCount,
        minusOneNinthInPositivityCone: p1a.minusOneNinthInPositivityCone ? 1 : 0,
        minusOneNinthRelErrMuOverEPct: Number((p1a.minusOneNinthRelErrMuOverE * 100).toFixed(3)),
        // Part 1B
        gridConvergedCount: p1b.convergedCount,
        gridSizeTotal: p1b.gridSizeTotal,
        maxRErrFromSqrt2: p1b.maxRErrFromSqrt2,
        maxDeltaErrFromTwoNinths: p1b.maxDeltaErrFromTwoNinths,
        maxS3CasimirPermutationErr: p1b.maxS3CasimirPermutationErr,
        maxZ3ClockInvarianceErr: p1b.maxZ3ClockInvarianceErr,
        maxConjugateBranchInvarianceErr: p1b.maxConjugateBranchInvarianceErr,
        hessianEigMin: Number(p1b.hessianEigenvalues[0].toFixed(6)),
        hessianEigMax: Number(p1b.hessianEigenvalues[1].toFixed(6)),
        hessianAnalyticMatchErr: p1b.hessianAnalyticMatchErr,
        lockedKoideQErr: p1b.lockedKoideQErr,
        lockedMuOverERelErrPct: Number((p1b.lockedMuOverERelErr * 100).toFixed(5)),
        lockedTauOverMuRelErrPct: Number((p1b.lockedTauOverMuRelErr * 100).toFixed(5)),
        mitmDeltaAbsErrRad: p1b.mitmDeltaAbsErrFromLockedRad,
        // Part 2A & 2B
        clebschMinusThreeExact: p2.clebschCert.clebschMinusThreeExact ? 1 : 0,
        symTensor16Dim: Number(p2.clebschCert.symTensor16DimExact),
        mPsGeV: p2.rgTargets.mPsGeV,
        mGutGeV: p2.rgTargets.mGutGeV,
        rgRoundTripMaxRelErr: p2.rgTargets.rk4RoundTripMaxRelErr,
        rgMbOverMtauGut: Number(p2.rgTargets.mbOverMtauGut.toFixed(4)),
        rgMmuOverMsGut: Number(p2.rgTargets.mmuOverMsGut.toFixed(4)),
        rgMeOverMdGut: Number(p2.rgTargets.meOverMdGut.toFixed(4)),
        // Part 2C: 10-param SO(10) 10_H + 126bar_H primary
        nObservables: p2.ledger.nObservables,
        nContinuousRealParams: p2.ledger.nContinuousRealParams,
        paramsSlashedVs327: p2.ledger.paramsSlashedVs327,
        netOverdeterminationContinuous: p2.ledger.netOverdeterminationContinuous,
        nDiscreteZeta9Exponents: p2.ledger.nDiscreteStructuralInputs,
        chi2TenParam: Number(s10.chi2Total.toFixed(4)),
        chi2ElevenParamCompanion: Number(s11.chi2Total.toFixed(4)),
        unifiedIdentityErr: s10.unifiedIdentityErr,
        maxMatrixSymmetryErr: s10.maxMatrixSymmetryErr,
        maxTakagiReconErr: s10.maxTakagiReconErr,
        maxSectorUnitarityErr: s10.maxSectorUnitarityErr,
        seesawInvErr: s10.seesawInvErr,
        leptonPoleMaxRelErrPct: Number((s10.leptonPoleMaxRelErr * 100).toFixed(5)),
        leptonPoleKoideQ: Number(s10.leptonPoleKoideQ.toFixed(8)),
        downGutMdMeV: Number((s10.downGutGeV[0] * 1e3).toFixed(4)),
        downGutMsMeV: Number((s10.downGutGeV[1] * 1e3).toFixed(3)),
        downGutMbGeV: Number(s10.downGutGeV[2].toFixed(4)),
        downGutMdRelErrPct: Number((s10.downGutRelErrs[0] * 100).toFixed(2)),
        downGutMsRelErrPct: Number((s10.downGutRelErrs[1] * 100).toFixed(2)),
        downGutMbRelErrPct: Number((s10.downGutRelErrs[2] * 100).toFixed(2)),
        upGutMuMeV: Number((s10.upGutGeV[0] * 1e3).toFixed(4)),
        upGutMcGeV: Number(s10.upGutGeV[1].toFixed(4)),
        upGutMtGeV: Number(s10.upGutGeV[2].toFixed(3)),
        upGutMuRelErrPct: Number((s10.upGutRelErrs[0] * 100).toFixed(2)),
        upGutMcRelErrPct: Number((s10.upGutRelErrs[1] * 100).toFixed(2)),
        upGutMtRelErrPct: Number((s10.upGutRelErrs[2] * 100).toFixed(2)),
        predMbOverMtauGut: Number(s10.mbOverMtauGut.toFixed(4)),
        predMmuOverMsGut: Number(s10.mmuOverMsGut.toFixed(4)),
        ckmMzVus: Number(s10.ckmMzVus.toFixed(5)),
        ckmMzVcb: Number(s10.ckmMzVcb.toFixed(5)),
        ckmMzVub: Number(s10.ckmMzVub.toFixed(5)),
        ckmMzJarlskog: Number(s10.ckmMzJarlskog.toExponential(3)),
        ckmUnitarityErr: s10.ckmUnitarityErr,
        ckmJarlskogQuartetSpread: s10.ckmJarlskogQuartetSpread,
        nuMass1Ev: Number(s10.lightNeutrinoEv[0].toFixed(6)),
        nuMass2Ev: Number(s10.lightNeutrinoEv[1].toFixed(6)),
        nuMass3Ev: Number(s10.lightNeutrinoEv[2].toFixed(6)),
        nuSumMassesEv: Number(s10.sumNeutrinoMassesEv.toFixed(5)),
        nuDm21SqEv2: Number(s10.dm21SqEv2.toExponential(4)),
        nuDm31SqEv2: Number(s10.dm31SqEv2.toExponential(4)),
        nuDmRatio21Over31: Number(s10.dmRatio21Over31.toFixed(5)),
        nuKoideQ: Number(s10.koideQNu.toFixed(5)),
        pmnsSin2Theta12: Number(s10.pmnsSin2Theta12.toFixed(5)),
        pmnsSin2Theta23: Number(s10.pmnsSin2Theta23.toFixed(5)),
        pmnsSin2Theta13: Number(s10.pmnsSin2Theta13.toFixed(5)),
        pmnsDeltaCpDeg: Number(s10.pmnsDeltaCpDeg.toFixed(2)),
        pmnsJarlskogCP: Number(s10.pmnsJarlskogCP.toExponential(3)),
        pmnsUnitarityErr: s10.pmnsUnitarityErr,
        pmnsJarlskogQuartetSpread: s10.pmnsJarlskogQuartetSpread,
        seesawScaleCR: Number(s10.cR.toExponential(3)),
      },
      control: {
        // Part 1B controls
        p6ConvergedCount: p1b.controlP6ConvergedCount,
        p6SelectedDeltaRad: Number(p1b.controlP6SelectedDeltaRad.toFixed(8)),
        p6MuOverE: Number(p1b.controlP6MuOverE.toFixed(4)),
        p6MuOverERelErrPct: Number((p1b.controlP6MuOverERelErr * 100).toFixed(3)),
        zeroKappaMaxGradDelta: p1b.controlZeroKappaMaxGradDelta,
        zeroKappaHessianDeltaDelta: p1b.controlZeroKappaHessianDeltaDelta,
        zeroKappaFinalDeltaSpreadRad: Number(p1b.controlZeroKappaFinalDeltaSpreadRad.toFixed(4)),
        // Part 2D controls
        pure10HMeMinusMdErr: ctrl.pure10HMeMinusMdErr,
        pure10HMuOverMs: Number(ctrl.pure10HMuOverMs.toFixed(8)),
        pure10HCkmVus: ctrl.pure10HCkmVus,
        pure10HCkmJarlskog: ctrl.pure10HCkmJarlskog,
        pure10HMajoranaSingular: ctrl.pure10HMajoranaSingular ? 1 : 0,
        wrongClebschMeMinusMdErr: ctrl.wrongClebschMeMinusMdErr,
        wrongClebschMuOverMs: Number(ctrl.wrongClebschMuOverMs.toFixed(8)),
        realYukawaCkmJarlskog: ctrl.realYukawaCkmJarlskog,
        realYukawaPmnsJarlskog: ctrl.realYukawaPmnsJarlskog,
      },
      notes:
        'Continuum EFT compatibility check (E-FRC-0330, L2, zero random numbers): ' +
        '(1) Part 1A checks the 9x9 BigInt minimal polynomial (H_role - 2/9 I)(H_role + 1/9 I) = 0 on the Sigma(648) role grid. ' +
        'Part 1B is an illustrative phenomenological S_3 x Z_3-invariant Landau coupling model V(S, P_3) whose minimum lies at ' +
        '(sqrt(2), +2/9) by construction of the coupling signs (NOT a first-principles dynamical selection theorem from the QCA). ' +
        '(2) Part 2 is a continuum SO(10) 10_H + 126bar_H Georgi-Jarlskog Yukawa EFT fit using 10 continuous real parameters ' +
        'PLUS a disclosed discrete Z_9 exponent and sign search space (7 discrete Z[zeta_9] phase exponents and discrete sign choices) ' +
        'against SM flavor observables. Explicitly reports the classic non-SUSY minimal 10_H + 126bar_H light down-quark pull ' +
        `(m_d -41%, m_s +70% at 10 continuous params, m_d ${(s11.downGutRelErrs[0] * 100).toFixed(1)}%, ` +
        `m_s +${(s11.downGutRelErrs[1] * 100).toFixed(1)}% at 11 params, consistent with Dueck-Rodejohann 2013 and Ohlsson-Pernow 2018).`,
    })
  },
})
