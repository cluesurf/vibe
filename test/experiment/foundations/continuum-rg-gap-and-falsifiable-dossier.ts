// FRONTIER 7 (E-FND-0188): FINITE-VOLUME Z_3 TRANSFER-MATRIX MASS GAP, 2-LOOP ASYMPTOTIC-SCALING
// CURVE INVERSION CHECK, FREE D_4 DISPERSION IR O(k^4) ROTATIONAL-ISOTROPY SCALING CHECK, AND
// LIVE UNIFIED FALSIFIABLE DOSSIER WITH EXPLICIT CROSS-SECTOR TENSION LEDGER.
//
// Part 1:
//   1A. Exact real-symmetric Z_3 center-gauge transfer matrices T(beta) on 1-plaquette channel (dim = 3),
//       Gauss-law-projected 2-plaquette D_4 ridge slice (dim = 9), and 3-plaquette D_4 octahedral-face
//       ring (dim = 27) across beta in [0.1..8.0]: verifies strict Perron-Frobenius dominance, strictly
//       positive spectral gap m_gap(beta) > 0, Jacobi eigen-residual <= 1e-14, Osterwalder-Seiler
//       strong-coupling match at beta = 0.1, and exact T^t exponential decay across t = 1..8 (<= 1e-13).
//   1B. 2-loop asymptotic-scaling curve inversion check (perturbative RG invariant, NOT a non-perturbative
//       lattice mass-gap measurement): certifies exact BigInt pure Yang-Mills beta coefficients for SU(3)
//       (11, 102) and SO(10) (88/3, 2176/3) and Newton inversion of a * Lambda_lat(g_0) across a..a/16.
//   1C. Free D_4 dispersion IR O(k^4) rotational-isotropy scaling check (free lattice dispersion hat_k^2,
//       NOT real-space interacting Wilson-Kadanoff block-spin RG): proves 256/256 BigInt D_4 4th-moment
//       SO(4) isotropy killing O(a^2) anisotropy, so momentum halving contracts Z^4 at 1/4 and D_4 at 1/16
//       (> 10^4x isotropy advantage by n = 4), against UV Bragg and weak-coupling U(1) Coulomb controls.
//
// Part 2:
//   Executes 8 frontier modules live, computes 0nu2beta m_{beta beta} via exact complex 3x3 Takagi
//   factorization of E-FRC-0327's Type-I seesaw matrix, separates zero-fit predictions from fitted/calibrated
//   consistency checks, explicitly surfaces all 5 active cross-sector tensions, and audits the full Lean 4
//   proof suite (Vibe.lean + Vibe/*.lean) plus compiled .olean artifacts.
//
// Depth L2: flat D_4 lattice + continuum EFT dossier (substrates: d4-box), 100% deterministic, zero RNG.

import { analyzeContinuumRgGapAndFalsifiableDossier } from '@/code/measure/continuum-rg-gap-and-falsifiable-dossier'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/continuum-rg-gap-and-falsifiable-dossier',
  code: 'E-FND-0188',
  title:
    'Finite-volume Z_3 transfer-matrix mass gap, 2-loop asymptotic-scaling curve inversion check, free D_4 dispersion IR O(k^4) isotropy check, and live falsifiable dossier with explicit cross-sector tension ledger',
  category: 'foundations',
  substrates: ['d4-box'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeContinuumRgGapAndFalsifiableDossier()
    const p1a = r.part1A
    const p1b = r.part1B
    const p1c = r.part1C
    const p2 = r.part2
    const d1 = p1a.onePlaquetteDim3
    const d9 = p1a.twoPlaquetteRidgeDim9
    const d27 = p1a.threePlaquetteRingDim27
    const u1 = p1c.u1Control
    const bb = p2.doubleBetaDecay
    const lean = p2.leanAudit
    const snap = p2.liveModuleSnapshots

    // Gate 1: Part 1A finite-volume Z_3 transfer-matrix spectral gap (dim = 3, 9, 27) & T^t decay
    const g1TransferMatrixGap =
      d1.allPerronPositive &&
      d1.allMassGapsStrictlyPositive &&
      d1.maxJacobiResidualRel <= 1e-14 &&
      d1.maxJacobiOrthoErr <= 1e-14 &&
      d1.strongCouplingRelErrAt01 <= 1e-14 &&
      d1.correlatorMaxAbsErr <= 1e-13 &&
      d1.correlatorMaxRelErr <= 1e-12 &&
      d9.allPerronPositive &&
      d9.allMassGapsStrictlyPositive &&
      d9.minMassGapAcrossBeta > 0 &&
      d9.maxJacobiResidualRel <= 1e-14 &&
      d9.maxJacobiOrthoErr <= 1e-14 &&
      d9.strongCouplingRelErrAt01 < 0.01 &&
      d9.correlatorMaxAbsErr <= 1e-13 &&
      d9.correlatorMaxRelErr <= 1e-9 &&
      d9.rawPlaquetteEffectiveMassMonotoneDecrease &&
      d27.allPerronPositive &&
      d27.allMassGapsStrictlyPositive &&
      d27.minMassGapAcrossBeta > 0 &&
      d27.maxJacobiResidualRel <= 1e-14 &&
      d27.maxJacobiOrthoErr <= 1e-14 &&
      d27.strongCouplingRelErrAt01 < 0.01 &&
      d27.correlatorMaxAbsErr <= 1e-13 &&
      d27.correlatorMaxRelErr <= 1e-9 &&
      d27.rawPlaquetteEffectiveMassMonotoneDecrease

    // Gate 2: Part 1B 2-loop asymptotic-scaling curve inversion check
    const g2TwoLoopScalingInversion =
      p1b.su3.exactCoefficientsVerified &&
      p1b.so10.exactCoefficientsVerified &&
      p1b.universalPureYmExponentExact &&
      p1b.su3.g0StrictlyDecreasing &&
      p1b.so10.g0StrictlyDecreasing &&
      p1b.su3.maxNewtonResidualRel <= 1e-14 &&
      p1b.so10.maxNewtonResidualRel <= 1e-14 &&
      p1b.su3.maxMPhysInvarianceErr <= 1e-12 &&
      p1b.so10.maxMPhysInvarianceErr <= 1e-12

    // Gate 3: Part 1C free D_4 dispersion IR O(k^4) rotational-isotropy scaling check + controls
    const g3FreeDispersionIsotropyAndControls =
      p1c.d4RootCount === 24 &&
      p1c.d4PositiveRootCount === 12 &&
      p1c.d4FourthMoment256ExactIsotropic &&
      p1c.z4FourthMomentViolations > 0 &&
      p1c.d4SixthMomentAnisotropyNonzero &&
      p1c.directionsCount === 10 &&
      p1c.blockingSteps.length === 5 &&
      Math.abs(p1c.finalZ4ContractionRatio - 0.25) < 1e-3 &&
      Math.abs(p1c.finalD4ContractionRatio - 0.0625) < 1e-3 &&
      p1c.finalD4AdvantageFactorOverZ4 > 1e4 &&
      p1c.uvPiZ4Anisotropy > 0.3 &&
      p1c.uvPiD4MaxContinuumDeviation > 0.5 &&
      p1c.uvPiD4RatioOverIrN4 > 1e6 &&
      Math.abs(p1c.uvBraggCornerD4Dispersion) <= 1e-14 &&
      p1c.uvBraggCornerD4FracAnisotropy > 0.99 &&
      u1.u1OnePlaquetteQuadErr <= 1e-14 &&
      u1.u1OnePlaquetteGap < 0.06 &&
      u1.u1GapCollapsedVsZ3RidgeFactor > 200 &&
      u1.u1FreePhotonMassGap === 0 &&
      u1.u1TensionDecayRatioR6OverR1 < 0.08 &&
      Math.abs(u1.u1FittedLinearStringTension) < 1e-3 &&
      p1c.constructiveFiniteVolAndRgProved &&
      p1c.infiniteVolNonPerturbativeContinuumGapOpen

    // Gate 4: Part 2 live dossier honesty gate (explicitly records all real cross-sector tensions + zero-fit/fitted split + live m_{beta beta})
    const requiredTensionIds = [
      'inflation-vs-axion-isocurvature',
      'minimal-10H-126barH-light-down-quark-pull',
      'zero-fit-alpha0-residual',
      'dm-budget-and-rge-impact',
      'mps-scale-alignment',
    ] as const
    const allRealTensionsRecorded = requiredTensionIds.every(id =>
      p2.crossSectorTensions.some(t => t.id === id),
    )
    const g4LiveDossierAndTensionHonesty =
      p2.predictions.length >= 12 &&
      p2.zeroFitPredictionCount >= 5 &&
      p2.fittedCheckCount >= 7 &&
      p2.crossSectorTensions.length >= 5 &&
      p2.currentTensionCount >= 3 &&
      p2.predictionTensionCount >= 3 &&
      allRealTensionsRecorded &&
      bb.mBetaBetaSumVsMatrixErr <= 1e-14 &&
      bb.takagiMassMatchErrEv <= 1e-13 &&
      bb.takagiPmnsAbsMatchErr <= 1e-12 &&
      bb.takagiReconErr <= 1e-13 &&
      bb.mBetaBetaMeV > 0.5 &&
      bb.mBetaBetaMeV < 15 &&
      bb.belowKamlandZenBound

    // Gate 5: Lean 4 formal proof-suite audit (0 sorry/axiom/native_decide/unsafe/implemented_by, .olean present, substantive theoremCount >= 80) & bounded runtime
    const g5LeanHonestyAndRuntime =
      lean.allClean &&
      lean.theoremCount >= 80 &&
      lean.familyCount >= 6 &&
      lean.sorryCount === 0 &&
      lean.axiomCount === 0 &&
      lean.nativeDecideCount === 0 &&
      lean.unsafeCount === 0 &&
      lean.implementedByCount === 0 &&
      lean.oleanArtifactsPresent &&
      p2.honestyAudit.explicitO1InputsAndFits.length >= 4 &&
      p2.honestyAudit.remainingUniversalFrontiers.length >= 4 &&
      r.totalSeconds <= 25.0

    const ok =
      g1TransferMatrixGap &&
      g2TwoLoopScalingInversion &&
      g3FreeDispersionIsotropyAndControls &&
      g4LiveDossierAndTensionHonesty &&
      g5LeanHonestyAndRuntime

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1A (finite-volume Z_3 lattice transfer-matrix spectral gap across beta in [0.1, 8.0], Jacobi residual <= ${Math.max(d9.maxJacobiResidualRel, d27.maxJacobiResidualRel).toExponential(1)}): ` +
        `strict Perron-Frobenius positivity and m_gap(beta) > 0 hold everywhere on dim=3 (Osterwalder-Seiler match err=${d1.strongCouplingRelErrAt01.toExponential(1)}), ` +
        `dim=9 (min gap=${d9.minMassGapAcrossBeta.toFixed(4)} at beta=${d9.minMassGapBeta}, T^t decay err=${d9.correlatorMaxAbsErr.toExponential(1)}), ` +
        `and dim=27 (min gap=${d27.minMassGapAcrossBeta.toFixed(4)} at beta=${d27.minMassGapBeta}, T^t decay err=${d27.correlatorMaxAbsErr.toExponential(1)}). ` +
        `Part 1B (2-loop asymptotic-scaling curve inversion check, perturbative RG invariant NOT a non-perturbative lattice gap): BigInt SU(3) (${p1b.su3.b0Formatted}, ${p1b.su3.b1Formatted}) and ` +
        `SO(10) (${p1b.so10.b0Formatted}, ${p1b.so10.b1Formatted}) with Newton inversion err <= ${Math.max(p1b.su3.maxNewtonResidualRel, p1b.so10.maxNewtonResidualRel).toExponential(1)} ` +
        `and scaling-curve invariance err <= ${Math.max(p1b.su3.maxMPhysInvarianceErr, p1b.so10.maxMPhysInvarianceErr).toExponential(1)}. ` +
        `Part 1C (free D_4 dispersion IR O(k^4) rotational-isotropy scaling check, NOT interacting Wilson-Kadanoff block-spin RG): exact 256/256 BigInt D_4 4th-moment isotropy kills O(a^2), ` +
        `halving momentum contracts D_4 anisotropy at ${p1c.finalD4ContractionRatio.toFixed(5)} (1/16, O(k^4)) vs Z^4 at ${p1c.finalZ4ContractionRatio.toFixed(5)} (1/4, O(k^2)), ` +
        `giving ${p1c.finalD4AdvantageFactorOverZ4.toFixed(0)}x advantage by n=4 (UV Bragg anisotropy=${p1c.uvBraggCornerD4FracAnisotropy.toFixed(3)}, U(1) beta=10 gap=${u1.u1OnePlaquetteGap.toFixed(4)}). ` +
        `Part 2 (live falsifiable dossier + Lean ${lean.toolchain} audit: ${lean.theoremCount} theorems across ${lean.familyCount} families, ${lean.oleanFileCount}/${lean.leanFileCount} .olean artifacts, 0 sorry/axiom/native_decide): ` +
        `${p2.predictions.length} entries (${p2.zeroFitPredictionCount} zero-fit predictions, ${p2.fittedCheckCount} fitted/calibrated consistency checks) with ${p2.currentTensionCount} explicitly recorded active cross-sector tensions ` +
        `(inflation vs N_DW=3 axion isocurvature 1.5e6x, minimal 10_H+126bar_H light down-quark pull, zero-fit alpha(0) -4.71% residual, WIMP+axion DM budget/RGE constraint, legacy M_PS=${snap.eFrc0327LegacyMPsGeV.toExponential(2)} vs unified ${snap.eFrc0328UnifiedMPsGeV.toExponential(3)} GeV), ` +
        `live 0nu2beta m_{beta beta}=${bb.mBetaBetaMeV.toFixed(3)} meV (sum vs (M_nu)_ee err=${bb.mBetaBetaSumVsMatrixErr.toExponential(1)} eV), runtime=${r.totalSeconds.toFixed(2)}s. ` +
        `Honest boundary: infinite-volume non-perturbative a->0 Yang-Mills mass gap remains open`,
      metrics: {
        g1TransferMatrixGap: g1TransferMatrixGap ? 1 : 0,
        g2TwoLoopScalingInversion: g2TwoLoopScalingInversion ? 1 : 0,
        g3FreeDispersionIsotropyAndControls: g3FreeDispersionIsotropyAndControls ? 1 : 0,
        g4LiveDossierAndTensionHonesty: g4LiveDossierAndTensionHonesty ? 1 : 0,
        g5LeanHonestyAndRuntime: g5LeanHonestyAndRuntime ? 1 : 0,
        // Part 1A metrics
        p1aDim3ScRelErr01: d1.strongCouplingRelErrAt01,
        p1aDim3CorrMaxAbsErr: d1.correlatorMaxAbsErr,
        p1aDim9MinGap: Number(d9.minMassGapAcrossBeta.toFixed(6)),
        p1aDim9MinGapBeta: d9.minMassGapBeta,
        p1aDim9Beta01Gap: Number(d9.strongCouplingBeta01Gap.toFixed(6)),
        p1aDim9ScRelErr01: Number(d9.strongCouplingRelErrAt01.toFixed(6)),
        p1aDim9MaxJacobiRes: d9.maxJacobiResidualRel,
        p1aDim9CorrMaxAbsErr: d9.correlatorMaxAbsErr,
        p1aDim27MinGap: Number(d27.minMassGapAcrossBeta.toFixed(6)),
        p1aDim27MinGapBeta: d27.minMassGapBeta,
        p1aDim27Beta01Gap: Number(d27.strongCouplingBeta01Gap.toFixed(6)),
        p1aDim27ScRelErr01: Number(d27.strongCouplingRelErrAt01.toFixed(6)),
        p1aDim27MaxJacobiRes: d27.maxJacobiResidualRel,
        p1aDim27CorrMaxAbsErr: d27.correlatorMaxAbsErr,
        // Part 1B metrics
        p1bSu3B0: Number(p1b.su3.b0Exact.num),
        p1bSu3B1: Number(p1b.su3.b1Exact.num),
        p1bSu3MaxNewtonRes: p1b.su3.maxNewtonResidualRel,
        p1bSu3MaxMPhysErr: p1b.su3.maxMPhysInvarianceErr,
        p1bSo10MaxNewtonRes: p1b.so10.maxNewtonResidualRel,
        p1bSo10MaxMPhysErr: p1b.so10.maxMPhysInvarianceErr,
        // Part 1C metrics
        p1cD4FourthMomentExact: p1c.d4FourthMoment256ExactIsotropic ? 1 : 0,
        p1cFinalZ4ContractionRatio: Number(p1c.finalZ4ContractionRatio.toFixed(6)),
        p1cFinalD4ContractionRatio: Number(p1c.finalD4ContractionRatio.toFixed(6)),
        p1cFinalD4AdvantageOverZ4: Number(p1c.finalD4AdvantageFactorOverZ4.toFixed(2)),
        // Part 2 dossier, tensions & Lean audit
        p2PredictionsCount: p2.predictions.length,
        p2ZeroFitPredictionCount: p2.zeroFitPredictionCount,
        p2FittedCheckCount: p2.fittedCheckCount,
        p2PredictionTensionCount: p2.predictionTensionCount,
        p2CrossSectorTensionCount: p2.crossSectorTensions.length,
        p2CurrentTensionCount: p2.currentTensionCount,
        p2LeanTheoremCount: lean.theoremCount,
        p2LeanFamilyCount: lean.familyCount,
        p2LeanFileCount: lean.leanFileCount,
        p2LeanOleanFileCount: lean.oleanFileCount,
        p2LeanSorryCount: lean.sorryCount,
        p2LeanAxiomCount: lean.axiomCount,
        p2LeanNativeDecideCount: lean.nativeDecideCount,
        p2MBetaBetaMeV: Number(bb.mBetaBetaMeV.toFixed(5)),
        p2MBetaBetaUpperBoundMeV: Number(bb.mBetaBetaIncoherentUpperBoundMeV.toFixed(5)),
        p2MBetaBetaSumVsMatrixErr: bb.mBetaBetaSumVsMatrixErr,
        p2TakagiMassMatchErrEv: bb.takagiMassMatchErrEv,
        p2TakagiPmnsAbsMatchErr: bb.takagiPmnsAbsMatchErr,
        p2ERlt0125MaxSpeciesRelDiff: snap.eRlt0125MaxSpeciesRelDiff,
        p2EGrv0160GammaPPN: Number(snap.eGrv0160GammaPPN.toFixed(10)),
        p2EGrv0160BetaPPN: Number(snap.eGrv0160BetaPPN.toFixed(8)),
        p2EGrv0161RwOmegaR: Number(snap.eGrv0161RwOmegaR.toFixed(5)),
        p2EGrv0161RwOmegaI: Number(snap.eGrv0161RwOmegaI.toFixed(5)),
        p2EGrv0163HorizonWorstNormErr: snap.eGrv0163HorizonWorstNormErr,
        p2EGrv0163HorizonOutVelocity: Number(snap.eGrv0163HorizonOutVelocity.toFixed(5)),
        p2EGrv0163HorizonInVelocity: Number(snap.eGrv0163HorizonInVelocity.toFixed(5)),
        p2EGrv0163InteriorOutVelocity: Number(snap.eGrv0163InteriorOutVelocity.toFixed(5)),
        p2EGrv0163InteriorInVelocity: Number(snap.eGrv0163InteriorInVelocity.toFixed(5)),
        p2EFrc0327NuSumMassesEv: Number(snap.eFrc0327NuSumMassesEv.toFixed(5)),
        p2EFrc0327PmnsDeltaCpDeg: Number(snap.eFrc0327PmnsDeltaCpDeg.toFixed(2)),
        p2EFrc0327LegacyMPsGeV: snap.eFrc0327LegacyMPsGeV,
        p2EFrc0328Log10MGutGeV: Number(snap.eFrc0328Log10MGutGeV.toFixed(5)),
        p2EFrc0328UnifiedMPsGeV: snap.eFrc0328UnifiedMPsGeV,
        p2EFrc0328ProtonLifetimeYr: snap.eFrc0328ProtonLifetimeYr,
        p2EFrc0329ZeroFitD4BlmAlphaZero: Number(snap.eFrc0329ZeroFitD4BlmAlphaZero.toFixed(4)),
        p2EFrc0329ThresholdRatioMin: Number(snap.eFrc0329ThresholdRatioMin.toFixed(4)),
        p2EFrc0329ThresholdRatioMax: Number(snap.eFrc0329ThresholdRatioMax.toFixed(4)),
        p2ECsm0066EtaB: snap.eCsm0066EtaB,
        p2ECsm0066OmegaDmH2: Number(snap.eCsm0066OmegaDmH2.toFixed(5)),
        p2ECsm0066DmMassGeV: Number(snap.eCsm0066DmMassGeV.toFixed(2)),
        p2ECsm0066DepthLambda: Number(snap.eCsm0066DepthLambda.toFixed(4)),
        part1Seconds: Number(r.part1Seconds.toFixed(4)),
        totalSeconds: Number(r.totalSeconds.toFixed(4)),
      },
      control: {
        uvPiZ4Anisotropy: Number(p1c.uvPiZ4Anisotropy.toFixed(6)),
        uvPiD4Anisotropy: Number(p1c.uvPiD4Anisotropy.toFixed(6)),
        uvPiD4MaxContinuumDeviation: Number(p1c.uvPiD4MaxContinuumDeviation.toFixed(6)),
        uvBraggCornerD4Dispersion: p1c.uvBraggCornerD4Dispersion,
        uvBraggCornerD4FracAnisotropy: Number(p1c.uvBraggCornerD4FracAnisotropy.toFixed(6)),
        u1Beta: u1.beta,
        u1OnePlaquetteGap: Number(u1.u1OnePlaquetteGap.toFixed(6)),
        u1GapCollapsedVsZ3RidgeFactor: Number(u1.u1GapCollapsedVsZ3RidgeFactor.toFixed(2)),
        u1FreePhotonMassGap: u1.u1FreePhotonMassGap,
        u1FittedLinearStringTension: u1.u1FittedLinearStringTension,
        infiniteVolNonPerturbativeContinuumGapOpen: p1c.infiniteVolNonPerturbativeContinuumGapOpen
          ? 1
          : 0,
      },
      notes:
        'Frontier 7 (E-FND-0188, flat D_4 lattice + continuum EFT dossier, substrates: d4-box, L2, 100% deterministic, zero RNG): ' +
        '(1) Part 1A proves finite-volume Z_3 transfer-matrix gap positivity on dim = 3, 9, 27 with exact T^t exponential decay <= 1e-13. ' +
        'Part 1B is a 2-loop asymptotic-scaling curve inversion check (perturbative RG invariant, not a non-perturbative lattice mass-gap measurement). ' +
        'Part 1C is a free D_4 dispersion IR O(k^4) rotational-isotropy scaling check (256/256 BigInt 4th-moment isotropy giving 1/16 vs Z^4 1/4 under momentum halving, not real-space interacting Wilson-Kadanoff block-spin RG). ' +
        'Infinite-volume non-perturbative a->0 constructive 4D Yang-Mills mass gap remains open. ' +
        `(2) Part 2 executes 8 frontier modules live, separates ${p2.zeroFitPredictionCount} zero-fit predictions from ${p2.fittedCheckCount} fitted/calibrated consistency checks, ` +
        `and explicitly records all ${p2.crossSectorTensions.length} active cross-sector tensions (inflation vs N_DW=3 axion isocurvature, minimal 10_H+126bar_H light down-quark pull, zero-fit alpha(0) residual, shared WIMP+axion DM budget & RGE neutrality, and legacy vs unified M_PS scale alignment). ` +
        `Audits Lean ${lean.toolchain} (${lean.theoremCount} theorems across ${lean.familyCount} families, 0 sorry/axiom/native_decide/unsafe/implemented_by, ${lean.oleanFileCount}/${lean.leanFileCount} .olean artifacts present, live lake build run by pnpm check:lean).`,
    })
  },
})
