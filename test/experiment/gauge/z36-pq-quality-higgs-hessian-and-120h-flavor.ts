// E-FRC-0332: CONTINUUM SO(10) Z_36 PQ-QUALITY, HIGGS-POTENTIAL HESSIAN, AND 10_H + 126bar_H + 120_H
// YUKAWA EFT COMPATIBILITY CHECK (14 CONTINUOUS REAL PARAMS + DISCRETE Z_9/SIGN CHOICES).
//
// Part 1: Continuum SO(10) discrete gauge symmetry check in exact BigInt + Q(zeta_9): Z_9 x Z_4 = Z_36
//   (containing Z_18 and directly anomaly-free Z_12), Ibanez-Ross anomaly universality A_3 = A_2 = A_1 = 6,
//   and Planck-suppressed operator scan giving d_min = 18 (Delta theta_grav < 1e-50) vs Z_6 control.
//
// Part 2: Continuum SO(10) 210_H + 126_H + 10_H Higgs-potential Hessian check with 5 perturbative quartic
//   couplings in [0.05, 1.5], exact 24 + 9 Goldstone zeros, positive physical spectrum in [1/3, 3], closing
//   CODATA alpha^{-1}(0) = 137.035999177 and PDG gauge couplings through E-FRC-0329's D_4 BLM + 2-loop flow
//   (with degenerate-quartic 130.58 and tachyon negative controls).
//
// Part 3: Continuum SO(10) 10_H + 126bar_H + 120_H Yukawa EFT fit using 14 continuous real parameters
//   ALONGSIDE disclosed discrete Z_9/sign phase choices over 18-19 independent SM observables (22 listed
//   quantities including dependent ratios/unitarity relations), reducing E-FRC-0330 chi^2 from 87.97 to 0.616
//   (max pull < 2.9%), verified against 3 negative controls.
//
// Depth L2: deterministic continuum SO(10) EFT compatibility check. Zero RNG.

import {
  analyzeZ36PqQualityHiggsHessianAnd120HFlavor,
  rat,
  ratEq,
  ratFormat,
} from '@/code/measure/z36-pq-quality-higgs-hessian-and-120h-flavor'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/z36-pq-quality-higgs-hessian-and-120h-flavor',
  code: 'E-FRC-0332',
  title:
    'Continuum SO(10) Z_36 PQ-quality, Higgs-potential Hessian, and 10_H + 126bar_H + 120_H Yukawa EFT compatibility check (14 continuous params + discrete Z_9/sign choices over 18-19 independent SM observables)',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeZ36PqQualityHiggsHessianAnd120HFlavor()
    const p1 = r.part1PqQuality
    const p2 = r.part2HiggsHessian
    const p3 = r.part3Yukawa120H

    // Part 1 gates: exact BigInt Z_9 x Z_4 = Z_36, native Z_18 = <-zeta_9^5>, Ibanez-Ross SO(10) anomaly
    // universality, exhaustive operator scan d_min = 12/18/36, Delta theta_grav < 1e-50, Z_6 negative control
    const part1Ok =
      p1.zeta9ExactOrder === 9 &&
      p1.zeta18ElementInZeta9ExactOrder === 18 &&
      p1.spin10CenterExactOrder === 4 &&
      p1.spin10CenterAll16Congruent1Mod4Exact &&
      p1.gcd9And4Exact === 1n &&
      p1.lcm9And4Exact === 36n &&
      p1.z9TimesZ4CyclicOrder36Exact &&
      p1.z18SubgroupOrderExact === 18 &&
      p1.z12SubgroupOrderExact === 12 &&
      p1.so10AnomalyUniversalityExact &&
      p1.z12DirectAnomalyFreeExact &&
      ratEq(p1.aSu3_3GenExact, rat(6n)) &&
      ratEq(p1.aSu2_3GenExact, rat(6n)) &&
      ratEq(p1.aU1Y_3GenExact, rat(6n)) &&
      p1.z36Q2RenormalizablePortal.allYukawasZeroModN &&
      p1.z36Q2RenormalizablePortal.conjugateYukawasForbidden &&
      p1.z36Q2RenormalizablePortal.portalZeroModN &&
      p1.z36Q2RenormalizablePortal.dMinAllowed === 18 &&
      p1.z36Q2RenormalizablePortal.log10DeltaThetaAtMPsFullPl < -50 &&
      p1.z36Q2RenormalizablePortal.log10DeltaThetaAtMPsOver3FullPl < -50 &&
      p1.z36Q1MaxProtection.dMinAllowed === 36 &&
      p1.z36Q1MaxProtection.log10DeltaThetaAtMPsFullPl < -200 &&
      p1.z18Q1NativeSubgroup.dMinAllowed === 18 &&
      p1.z18Q1NativeSubgroup.log10DeltaThetaAtMPsFullPl < -50 &&
      p1.z12Q1AnomalyFreeSubgroup.dMinAllowed === 12 &&
      p1.z12Q1AnomalyFreeSubgroup.directNonGsAnomalyFree &&
      p1.z12Q1AnomalyFreeSubgroup.log10DeltaThetaAtMPsOver3FullPl < -12 &&
      p1.controlZ6Q1FailsCatastrophically.dMinAllowed === 6 &&
      p1.controlZ6Q1FailsCatastrophically.log10DeltaThetaAtMPsFullPl > 30 &&
      p1.allQualityGatesPassed

    // Part 2 gates: explicit SO(10) 210_H + 126_H + 10_H Higgs potential with O(1) quartics in [0.05, 1.5],
    // exact 24+9 Goldstone zeros <= 1e-14, zero tachyons, all ratios in [1/3, 3], CODATA & PDG closure < 1e-12,
    // degenerate 130.58 and flipped-sign tachyon controls
    const part2Ok =
      p2.allQuarticsInPerturbativeBand &&
      p2.stationarityGradInfNorm <= 1e-10 &&
      p2.hessianAnalyticVsNumericMaxErr <= 1e-6 &&
      p2.eatenGoldstoneSo10Count === 24 &&
      p2.eatenGoldstonePsCount === 9 &&
      p2.maxAbsGoldstoneMassSq <= 1e-14 &&
      p2.zeroTachyons &&
      p2.minPhysicalScalarMassSqOverMGutSq > 0.1 &&
      p2.allHeavyRatiosWithinOneThirdToThree &&
      p2.maxObservableErr < 1e-12 &&
      p2.controlDegenerateMatchE329Err <= 1e-12 &&
      p2.controlDegenerateAlphaZero > 130.4 &&
      p2.controlDegenerateAlphaZero < 130.8 &&
      p2.controlTachyonDetected &&
      p2.controlTachyonMinMassSqOverMGutSq < 0

    // Part 3 gates: exact BigInt 16x16 = 10_S + 126_S + 120_A, <= 14 continuous real params (+8 overdetermination),
    // 0 continuous CP phases, chi^2 < 5 & chi^2/dof < 1, max individual pull < 5%, charged leptons < 0.01% with
    // Q_e = 2/3, normal ordering sum m_nu < 0.12 eV, Q_nu < 2/3, CKM & PMNS accurate, and all 3 negative controls
    const part3Ok =
      p3.groupCert.decomposition256Exact &&
      p3.groupCert.ps120DynkinSumExact &&
      p3.groupCert.hasZero10Bar13MajoranaComponentExact &&
      p3.nObservables === 22 &&
      p3.nContinuousRealParams <= 14 &&
      p3.nContinuousCpPhases === 0 &&
      p3.netOverdetermination >= 8 &&
      p3.chi2With120H < 5 &&
      p3.chi2PerDof < 1 &&
      p3.chi2ImprovementFactor > 50 &&
      p3.maxIndividualPullPct < 5 &&
      p3.leptonPoleMaxRelErr < 1e-4 &&
      Math.abs(p3.leptonPoleKoideQ - 2 / 3) <= 1e-14 &&
      p3.leptonGutMaxRelErrFromKoide <= 1e-9 &&
      p3.ckmMzJarlskog > 2.5e-5 &&
      p3.ckmMzJarlskog < 3.5e-5 &&
      p3.normalOrdering &&
      p3.sumNeutrinoMassesEv < 0.12 &&
      p3.koideQNu < 2 / 3 &&
      p3.pmnsJarlskogCP < -0.01 &&
      p3.pmnsDeltaCpDeg > 180 &&
      p3.pmnsDeltaCpDeg < 360 &&
      p3.hSymmetryErr <= 1e-14 &&
      p3.fSymmetryErr <= 1e-14 &&
      p3.gAntisymmetryErr <= 1e-14 &&
      p3.mNuSymmetryErr <= 1e-14 &&
      p3.unifiedEquationsErr <= 1e-14 &&
      p3.maxSvdTakagiReconErr <= 1e-13 &&
      p3.maxSectorUnitarityErr <= 1e-14 &&
      p3.seesawInvErr <= 1e-12 &&
      p3.control1E330GZeroChi2 > 50 &&
      p3.control1TurnOffGOnNewHFChi2 > 50 &&
      Math.abs(p3.control2RealYukawaCkmJarlskog) <= 1e-14 &&
      Math.abs(p3.control2RealYukawaPmnsJarlskog) <= 1e-14

    const ok = part1Ok && part2Ok && part3Ok

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Continuum SO(10) EFT compatibility check (not derived from the discrete QCA): ` +
        `Part 1 (Z_18/Z_36 PQ quality): Z_9 (order ${p1.zeta9ExactOrder}) x Z_4 (Spin(10) center, gcd=${p1.gcd9And4Exact}) = Z_36 ` +
        `(lcm=${p1.lcm9And4Exact}) with Z_18 and directly anomaly-free Z_12 subgroups, Ibanez-Ross universality ` +
        `A_3=A_2=A_1=${ratFormat(p1.aSu3_3GenExact)}, and operator scan d_min=18 giving Delta theta_grav=10^${p1.z36Q2RenormalizablePortal.log10DeltaThetaAtMPsFullPl.toFixed(1)} ` +
        `at M_PS (d_min=36 gives 10^${p1.z36Q1MaxProtection.log10DeltaThetaAtMPsFullPl.toFixed(1)}, Z_12 gives ` +
        `10^${p1.z12Q1AnomalyFreeSubgroup.log10DeltaThetaAtMPsOver3FullPl.toFixed(1)} at M_PS/3, Z_6 control fails at ` +
        `10^${p1.controlZ6Q1FailsCatastrophically.log10DeltaThetaAtMPsFullPl.toFixed(1)}). ` +
        `Part 2 (SO(10) 210_H + 126_H + 10_H Higgs-potential Hessian fit): five quartics {l1=${p2.quartics.lambda1.toFixed(3)}, ` +
        `l2=${p2.quartics.lambda2.toFixed(4)}, l3=${p2.quartics.lambda3.toFixed(4)}, l4=${p2.quartics.lambda4.toFixed(4)}, ` +
        `aMix=${p2.quartics.alphaMix.toFixed(3)}} in [0.05, 1.5] give 24+9 Goldstone zeros (<= ${p2.maxAbsGoldstoneMassSq.toExponential(1)}), ` +
        `positive physical masses in [${p2.minHeavyMassRatio.toFixed(3)}, ${p2.maxHeavyMassRatio.toFixed(3)}], and match CODATA ` +
        `alpha^-1(0)=${p2.predAlphaEmInvZero.toFixed(9)} and PDG couplings to ${p2.maxObservableErr.toExponential(2)} ` +
        `(degenerate control ${p2.controlDegenerateAlphaZero.toFixed(2)}, tachyon control ${p2.controlTachyonMinMassSqOverMGutSq.toFixed(3)} < 0). ` +
        `Part 3 (10_H + 126bar_H + 120_H Yukawa EFT fit, ${p3.nContinuousRealParams} continuous real params plus discrete Z_9/sign phase choices ` +
        `over 18-19 independent SM observables, 22 listed quantities): pure (1,2,2) 120_H reduces E-FRC-0330 chi^2 from ` +
        `${p3.chi2E330Baseline.toFixed(2)} to ${p3.chi2With120H.toFixed(3)} (max pull ${p3.maxIndividualPullPct.toFixed(2)}%, ` +
        `m_d ${p3.downGutRelErrPct[0] >= 0 ? '+' : ''}${p3.downGutRelErrPct[0].toFixed(2)}%, m_s +${p3.downGutRelErrPct[1].toFixed(2)}%, ` +
        `m_b ${p3.downGutRelErrPct[2].toFixed(2)}%, CKM J_CP=${p3.ckmMzJarlskog.toExponential(3)}, ` +
        `sum m_nu=${p3.sumNeutrinoMassesEv.toFixed(4)} eV, J_PMNS=${p3.pmnsJarlskogCP.toExponential(3)}), passing all 3 controls`,
      metrics: {
        // Part 1: Exact Z_18 / Z_36 PQ quality
        zeta9ExactOrder: p1.zeta9ExactOrder,
        zeta18InZeta9ExactOrder: p1.zeta18ElementInZeta9ExactOrder,
        spin10CenterExactOrder: p1.spin10CenterExactOrder,
        gcd9And4Exact: Number(p1.gcd9And4Exact),
        lcm9And4Exact: Number(p1.lcm9And4Exact),
        z9TimesZ4CyclicOrder36Exact: p1.z9TimesZ4CyclicOrder36Exact ? 1 : 0,
        aSu3_3Gen: Number(p1.aSu3_3GenExact.num) / Number(p1.aSu3_3GenExact.den),
        aSu2_3Gen: Number(p1.aSu2_3GenExact.num) / Number(p1.aSu2_3GenExact.den),
        aU1Y_3Gen: Number(p1.aU1Y_3GenExact.num) / Number(p1.aU1Y_3GenExact.den),
        so10AnomalyUniversalityExact: p1.so10AnomalyUniversalityExact ? 1 : 0,
        z12DirectAnomalyFreeExact: p1.z12DirectAnomalyFreeExact ? 1 : 0,
        z36Q2DMin: p1.z36Q2RenormalizablePortal.dMinAllowed,
        z36Q2Log10DeltaThetaMPs: Number(p1.z36Q2RenormalizablePortal.log10DeltaThetaAtMPsFullPl.toFixed(3)),
        z36Q2Log10DeltaThetaMPsOver3: Number(
          p1.z36Q2RenormalizablePortal.log10DeltaThetaAtMPsOver3FullPl.toFixed(3),
        ),
        z36Q2DeltaThetaMPsReducedPl: p1.z36Q2RenormalizablePortal.deltaThetaAtMPsReducedPl,
        z36Q1DMin: p1.z36Q1MaxProtection.dMinAllowed,
        z36Q1Log10DeltaThetaMPs: Number(p1.z36Q1MaxProtection.log10DeltaThetaAtMPsFullPl.toFixed(3)),
        z18Q1DMin: p1.z18Q1NativeSubgroup.dMinAllowed,
        z18Q1Log10DeltaThetaMPs: Number(p1.z18Q1NativeSubgroup.log10DeltaThetaAtMPsFullPl.toFixed(3)),
        z12Q1DMin: p1.z12Q1AnomalyFreeSubgroup.dMinAllowed,
        z12Q1Log10DeltaThetaMPs: Number(p1.z12Q1AnomalyFreeSubgroup.log10DeltaThetaAtMPsFullPl.toFixed(3)),
        z12Q1Log10DeltaThetaMPsOver3: Number(
          p1.z12Q1AnomalyFreeSubgroup.log10DeltaThetaAtMPsOver3FullPl.toFixed(3),
        ),
        pure126Bar4kDMinZ36: p1.pure126Bar4kDMinZ36,
        // Part 2: Explicit SO(10) Higgs-potential Hessian closure
        alphaGutMsBarInvD4Blm: Number(p2.alphaGutMsBarInvD4Blm.toFixed(5)),
        gGut: Number(p2.gGut.toFixed(6)),
        vGutOverMGut: Number(p2.vGutOverMGut.toFixed(5)),
        quarticLambda1: Number(p2.quartics.lambda1.toFixed(5)),
        quarticLambda2: Number(p2.quartics.lambda2.toFixed(5)),
        quarticLambda3: Number(p2.quartics.lambda3.toFixed(5)),
        quarticLambda4: Number(p2.quartics.lambda4.toFixed(5)),
        quarticAlphaMix: Number(p2.quartics.alphaMix.toFixed(5)),
        allQuarticsInPerturbativeBand: p2.allQuarticsInPerturbativeBand ? 1 : 0,
        stationarityGradInfNorm: p2.stationarityGradInfNorm,
        hessianAnalyticVsNumericMaxErr: p2.hessianAnalyticVsNumericMaxErr,
        maxAbsGoldstoneMassSq: p2.maxAbsGoldstoneMassSq,
        minPhysicalScalarMassSqOverMGutSq: Number(p2.minPhysicalScalarMassSqOverMGutSq.toFixed(5)),
        minHeavyMassRatio: Number(p2.minHeavyMassRatio.toFixed(4)),
        maxHeavyMassRatio: Number(p2.maxHeavyMassRatio.toFixed(4)),
        allHeavyRatiosInOneThirdToThree: p2.allHeavyRatiosWithinOneThirdToThree ? 1 : 0,
        predAlphaEmInvZero: Number(p2.predAlphaEmInvZero.toFixed(9)),
        predAlphaEmInvZeroErr: p2.predAlphaEmInvZeroErr,
        predAlphaEmInvMz: Number(p2.predAlphaEmInvMz.toFixed(6)),
        predSin2ThetaWMz: Number(p2.predSin2ThetaWMz.toFixed(7)),
        predAlpha3Mz: Number(p2.predAlpha3Mz.toFixed(6)),
        maxGaugeObservableErr: p2.maxObservableErr,
        // Part 3: Full 10_H + 126bar_H + 120_H zero-pull Yukawa unification
        so10120HDecompositionExact: p3.groupCert.decomposition256Exact ? 1 : 0,
        so10120HDynkinSumExact: p3.groupCert.ps120DynkinSumExact ? 1 : 0,
        nObservables: p3.nObservables,
        nContinuousRealParams: p3.nContinuousRealParams,
        nContinuousCpPhases: p3.nContinuousCpPhases,
        netOverdetermination: p3.netOverdetermination,
        chi2E330Baseline: Number(p3.chi2E330Baseline.toFixed(4)),
        chi2With120H: Number(p3.chi2With120H.toFixed(5)),
        chi2PerDof: Number(p3.chi2PerDof.toFixed(5)),
        chi2ImprovementFactor: Number(p3.chi2ImprovementFactor.toFixed(2)),
        maxIndividualPullPct: Number(p3.maxIndividualPullPct.toFixed(3)),
        leptonPoleMaxRelErrPct: Number((p3.leptonPoleMaxRelErr * 100).toFixed(5)),
        leptonPoleKoideQ: Number(p3.leptonPoleKoideQ.toFixed(8)),
        leptonGutMaxRelErrFromKoide: p3.leptonGutMaxRelErrFromKoide,
        downGutMdRelErrPct: Number(p3.downGutRelErrPct[0].toFixed(3)),
        downGutMsRelErrPct: Number(p3.downGutRelErrPct[1].toFixed(3)),
        downGutMbRelErrPct: Number(p3.downGutRelErrPct[2].toFixed(3)),
        upGutMuRelErrPct: Number(p3.upGutRelErrPct[0].toFixed(3)),
        upGutMcRelErrPct: Number(p3.upGutRelErrPct[1].toFixed(3)),
        upGutMtRelErrPct: Number(p3.upGutRelErrPct[2].toFixed(3)),
        ckmMzVus: Number(p3.ckmMzVus.toFixed(5)),
        ckmMzVcb: Number(p3.ckmMzVcb.toFixed(5)),
        ckmMzVub: Number(p3.ckmMzVub.toFixed(6)),
        ckmMzJarlskog: Number(p3.ckmMzJarlskog.toExponential(4)),
        nuSumMassesEv: Number(p3.sumNeutrinoMassesEv.toFixed(5)),
        nuDmRatio21Over31: Number(p3.dmRatio21Over31.toFixed(5)),
        nuDmRatioRelErrPct: Number(p3.dmRatioRelErrPct.toFixed(3)),
        nuKoideQ: Number(p3.koideQNu.toFixed(5)),
        pmnsSin2Theta12: Number(p3.pmnsSin2Theta12.toFixed(5)),
        pmnsSin2Theta23: Number(p3.pmnsSin2Theta23.toFixed(5)),
        pmnsSin2Theta13: Number(p3.pmnsSin2Theta13.toFixed(5)),
        pmnsDeltaCpDeg: Number(p3.pmnsDeltaCpDeg.toFixed(2)),
        pmnsJarlskogCP: Number(p3.pmnsJarlskogCP.toExponential(4)),
        hSymmetryErr: p3.hSymmetryErr,
        fSymmetryErr: p3.fSymmetryErr,
        gAntisymmetryErr: p3.gAntisymmetryErr,
        mNuSymmetryErr: p3.mNuSymmetryErr,
        maxSvdTakagiReconErr: p3.maxSvdTakagiReconErr,
        maxSectorUnitarityErr: p3.maxSectorUnitarityErr,
        seesawInvErr: p3.seesawInvErr,
      },
      control: {
        // Part 1 negative control: Z_6 (d_min = 6) catastrophically violates nEDM
        controlZ6DMin: p1.controlZ6Q1FailsCatastrophically.dMinAllowed,
        controlZ6Log10DeltaThetaMPs: Number(
          p1.controlZ6Q1FailsCatastrophically.log10DeltaThetaAtMPsFullPl.toFixed(3),
        ),
        controlZ6Log10DeltaThetaMPsOver3: Number(
          p1.controlZ6Q1FailsCatastrophically.log10DeltaThetaAtMPsOver3FullPl.toFixed(3),
        ),
        // Part 2 negative controls: degenerate quartics -> 130.58 and flipped quartic -> tachyon
        controlDegenerateAlphaZero: Number(p2.controlDegenerateAlphaZero.toFixed(5)),
        controlDegenerateRelPct: Number(p2.controlDegenerateRelPct.toFixed(3)),
        controlDegenerateMatchE329Err: p2.controlDegenerateMatchE329Err,
        controlTachyonMinMassSqOverMGutSq: Number(p2.controlTachyonMinMassSqOverMGutSq.toFixed(5)),
        controlTachyonDetected: p2.controlTachyonDetected ? 1 : 0,
        // Part 3 negative controls: G = 0 (E-FRC-0330 & turned off on new H,F), real Yukawas (J = 0)
        control1E330GZeroChi2: Number(p3.control1E330GZeroChi2.toFixed(4)),
        control1E330GZeroMdRelErrPct: Number(p3.control1E330GZeroMdRelErrPct.toFixed(2)),
        control1E330GZeroMsRelErrPct: Number(p3.control1E330GZeroMsRelErrPct.toFixed(2)),
        control1TurnOffGOnNewHFChi2: Number(p3.control1TurnOffGOnNewHFChi2.toFixed(2)),
        control2RealYukawaCkmJarlskog: p3.control2RealYukawaCkmJarlskog,
        control2RealYukawaPmnsJarlskog: p3.control2RealYukawaPmnsJarlskog,
      },
      notes:
        'Continuum SO(10) EFT compatibility check (E-FRC-0332, L2, 100% deterministic, zero Math.random, not derived from the QCA): ' +
        '(1) Z_36 PQ quality: checks Z_9 x Z_4 = Z_36 (with Z_18 and directly anomaly-free Z_12 subgroups) and SO(10) ' +
        'Ibanez-Ross universality A_3 = A_2 = A_1 = 6, pushing Planck-suppressed PQ violation to d_min = 18 (Delta theta_grav < 10^-50) ' +
        'vs Z_6 failure. ' +
        '(2) Higgs-potential Hessian check: 5 perturbative quartic couplings in SO(10) 210_H + 126_H + 10_H yield 24 + 9 ' +
        'Goldstone zeros and positive heavy scalar ratios in [0.423, 1.747], matching CODATA 137.035999177 and PDG gauge ' +
        'couplings to < 1e-12 through E-FRC-0329 D_4 BLM + 2-loop flow. ' +
        '(3) 10_H + 126bar_H + 120_H Yukawa EFT fit: uses 14 continuous real parameters ALONGSIDE disclosed discrete Z_9/sign ' +
        'phase choices over 18-19 independent SM observables (22 listed quantities including dependent Koide/unitarity checks), ' +
        `reducing E-FRC-0330 chi^2 from 87.97 to ${p3.chi2With120H.toFixed(3)} with max pull ${p3.maxIndividualPullPct.toFixed(2)}%.`,
    })
  },
})
