// FRONTIER 4 (E-CSM-0066): 5-STATE NON-QCA SAKHAROV TOY WALK WITH Z[zeta_9] PHASES,
// CONTINUUM SO(10) THERMAL LEPTOGENESIS, MATTER-PARITY WIMP DARK-SECTOR CHECK, AND LAMBDA SHELL AUDIT.
//
// Part 1: 5-state non-QCA Sakharov toy unitary walk built with Z[zeta_9][1/6] phases coupled to a
//   1D branching depth register (NOT the 4D {3,4,3,4} QCA). Verifies Q(zeta_9) unitarity, reversal,
//   nonzero freeze-out asymmetry Delta B(T) > 0 from B(0) = 0, CPT/CP phase flip, and all three
//   Sakharov ablation negative controls (g_BL = 0, zeta_9 -> 1, static closed equilibrium box).
//
// Part 2: Continuum Spin(10) EFT thermal leptogenesis compatibility check at E-FRC-0328's M_PS =
//   1.434e11 GeV using C_sph = 28/79, E-FRC-0327's seesaw neutrino spectrum, sin(2pi/9) phase,
//   Bessel K_nu(z), and RK4 Boltzmann ODEs. Checks Davidson-Ibarra compliance, strong-washout
//   initial-condition insensitivity, Planck eta_B = (6.12 +/- 0.04) x 10^-10 match, and 3 controls.
//
// Part 3: Continuum SO(10) EFT matter-parity check P_M = (-1)^{3(B-L)} on the 16 spinor, Lee-Weinberg
//   thermal WIMP freeze-out RK4 ODE at m_DM = 484.3 GeV (explicitly noting WIMP dark matter here and
//   axion dark matter in E-FRC-0331 share the total Planck Omega_DM h^2 = 0.1200 budget rather than
//   double-counting 200%), and a logarithmic {3,4,3,4} cosmological constant shell audit keeping
//   dynamical selection of D_Lambda open.
//
// Depth L2: deterministic continuum EFT compatibility check + 5-state toy walk. Zero RNG.

import {
  PLANCK_ETA_B,
  PLANCK_OMEGA_DM_H2,
  analyzeBaryogenesisDarkSectorAndLambda,
  ratFormat,
  ratToNumber,
} from '@/code/measure/baryogenesis-dark-sector-and-lambda'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const EXACT_TOL = 1e-14

export default experiment({
  id: 'cosmology/baryogenesis-dark-sector-and-lambda',
  code: 'E-CSM-0066',
  title:
    '5-state non-QCA Sakharov toy walk with Z[zeta_9] phases, continuum SO(10) EFT leptogenesis and WIMP dark-sector checks (shared budget with axion), and Lambda shell audit',
  category: 'cosmology',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const r = analyzeBaryogenesisDarkSectorAndLambda()
    const seconds = (Date.now() - started) / 1000
    const p1 = r.part1
    const p2 = r.part2
    const p3 = r.part3
    const mp = p3.matterParity
    const dm = p3.darkMatterFreezeOut
    const lam = p3.lambdaShellAudit

    // Gate 1: Part 1 exact Z[zeta_9][1/6] algebra, unitarity, reversal, nonzero freeze-out Delta B,
    // exact CPT/CP phase flip, and all three Sakharov ablation controls exact 0 (<= 1e-14)
    const gPart1ExactAlgebra =
      p1.uIntExactUnitaryInNinth &&
      p1.uIntConjugateExactCSymInNinth &&
      p1.uIntRealExactCSymInNinth &&
      p1.uIntNoBlConservesBInNinth &&
      p1.exactBeat1FormulaErr <= EXACT_TOL &&
      p1.coupledDenseUnitarityErr <= EXACT_TOL &&
      p1.maxNormErr <= EXACT_TOL &&
      p1.maxFloorWeight === 0 &&
      p1.reversalMaxAmpErr <= EXACT_TOL

    const gPart1BaryogenesisAndControls =
      Math.abs(p1.initialB) <= EXACT_TOL &&
      p1.finalDeltaB > 0.1 &&
      p1.lateWindowMinDeltaB > 0.1 &&
      p1.finalProbHeavyN < 0.05 &&
      p1.finalMeanDLight > 10 &&
      p1.lateWindowSpread < 0.1 &&
      p1.lateWindowSpread < 0.15 * p1.staticBoxNonEqLateSpread &&
      p1.cptPhaseFlipMaxErr <= EXACT_TOL &&
      p1.control1NoBlMaxAbsDeltaB <= EXACT_TOL &&
      p1.control2RealCpMaxAbsDeltaB <= EXACT_TOL &&
      p1.control3EquilibriumBoxMaxAbsDeltaB <= EXACT_TOL

    // Gate 2: Part 2 exact BigInt sphaleron 28/79, Bessel precision <= 1e-12, RK4 convergence <= 1e-9,
    // Davidson-Ibarra bound compliance, strong-washout insensitivity < 1%, Planck eta_B match, and 3 controls
    const gPart2AlgebraAndNumer =
      p2.sphaleron.cSphExactMatch &&
      p2.besselRecurrenceMaxRelErr <= 1e-12 &&
      p2.besselAsymptoticErr <= 1e-10 &&
      p2.mPsAboveDavidsonIbarraRatio > 100 &&
      p2.planckMatchAtMPs.obeysDiBound &&
      p2.planckMatchAtFixedK.obeysDiBound &&
      p2.planckMatchAtMPs.rk4StepHalvingRelErr <= 1e-9

    const gPart2PlanckAndControls =
      p2.naturalBenchmarkAtM3.etaBBdp > 2e-10 &&
      p2.naturalBenchmarkAtM3.etaBBdp < 2e-9 &&
      p2.planckMatchAtMPs.tildeM1Ev > p2.nuMassesEv[1] &&
      p2.planckMatchAtMPs.tildeM1Ev < p2.nuMassesEv[2] &&
      p2.planckMatchAtMPs.kWashout >= 10 &&
      p2.planckMatchAtMPs.planckRelErr < 0.01 &&
      p2.planckMatchAtMPs.initConditionRelDiff < 0.01 &&
      p2.planckMatchAtFixedK.m1GeV >= 1e10 &&
      p2.planckMatchAtFixedK.m1GeV <= p2.mPsGeV &&
      p2.planckMatchAtFixedK.planckRelErr < 0.01 &&
      p2.planckMatchAtFixedK.initConditionRelDiff < 0.01 &&
      Math.abs(p2.controlNoCpEtaB) <= EXACT_TOL &&
      Math.abs(p2.controlLowM1EtaB) < 1e-11 &&
      p2.controlWeakWashoutInitRelDiff > 0.5 &&
      p2.controlStrongWashoutK20InitRelDiff < 0.01

    // Gate 3: Part 3A exact BigInt SO(10) matter parity + Lee-Weinberg RK4 freeze-out at D_EW = 13 (484 GeV)
    const gPart3ADarkSector =
      mp.allCertificatesExact &&
      dm.mDmShell13GeV > 450 &&
      dm.mDmShell13GeV < 520 &&
      dm.canonicalOmegaDmH2 > 0.08 &&
      dm.canonicalOmegaDmH2 < 0.18 &&
      dm.planckRelErr < 0.01 &&
      dm.planckMatchedSigmaVCm3S > 1.5e-26 &&
      dm.planckMatchedSigmaVCm3S < 3.5e-26 &&
      dm.rk4StepHalvingRelErr <= 1e-9 &&
      dm.xStartInvarianceRelErr <= 1e-9 &&
      dm.controlStrongAnnihilationOmegaDmH2 < 0.005 &&
      dm.controlWeakAnnihilationOmegaDmH2 > 5

    // Gate 4: Part 3B honest {3,4,3,4} cosmological constant shell audit + pre-registered null refusal
    const gPart3BLambdaAudit =
      Math.abs(lam.cuspBranchingB - 6034 / 330) <= 1e-12 &&
      lam.wEqualsMinusOneDerivedFrom3434 &&
      lam.depthH0B > 48.0 &&
      lam.depthH0B < 49.0 &&
      lam.depthLambdaFromHInfB > 96.0 &&
      lam.depthLambdaFromHInfB < 98.0 &&
      lam.depthLambdaFromRhoB > 96.0 &&
      lam.depthLambdaFromRhoB < 98.5 &&
      lam.all122DecadesFitUnder100Shells &&
      lam.euclidean3DShellsForRhoLambda > 1e40 &&
      lam.refusedZeroParamH0Claim &&
      lam.dynamicalSelectionOfDLambdaOpen

    const ok =
      gPart1ExactAlgebra &&
      gPart1BaryogenesisAndControls &&
      gPart2AlgebraAndNumer &&
      gPart2PlanckAndControls &&
      gPart3ADarkSector &&
      gPart3BLambdaAudit

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (5-state non-QCA Sakharov toy walk using Z[zeta_9][1/6] phases and 1D branching depth register): ` +
        `Q(zeta_9) unitary core + coupled walk (dense dim=${p1.coupledDenseDim} ||U^dag U-I||=${p1.coupledDenseUnitarityErr.toExponential(1)}, ` +
        `T=${p1.steps} reversal=${p1.reversalMaxAmpErr.toExponential(1)}) starting at B(0)=0 generates frozen-out ` +
        `Delta B(T)=+${p1.finalDeltaB.toFixed(6)} (beat-1 formula err=${p1.exactBeat1FormulaErr.toExponential(1)}, ` +
        `P_N(T)=${p1.finalProbHeavyN.toExponential(2)}, <D_light>=${p1.finalMeanDLight.toFixed(2)}), flips sign under ` +
        `zeta_9 -> zeta_9^* (max err=${p1.cptPhaseFlipMaxErr.toExponential(1)}), and gives 0 across all 3 Sakharov ablations ` +
        `(g_BL=0: ${p1.control1NoBlMaxAbsDeltaB.toExponential(1)}, zeta_9->1: ${p1.control2RealCpMaxAbsDeltaB.toExponential(1)}, ` +
        `closed equilibrium box: ${p1.control3EquilibriumBoxMaxAbsDeltaB.toExponential(1)}). ` +
        `Part 2 (continuum Spin(10) EFT thermal leptogenesis check at M_PS=${p2.mPsGeV.toExponential(3)} GeV): ` +
        `C_sph=${ratFormat(p2.sphaleron.cSphFromFormula)} (d_BDP=${ratToNumber(p2.sphaleron.conversionFactorBdp).toFixed(6)}), ` +
        `Bessel recurrence err=${p2.besselRecurrenceMaxRelErr.toExponential(1)}, RK4 step-halving err=${p2.planckMatchAtMPs.rk4StepHalvingRelErr.toExponential(1)}, ` +
        `M_1=M_PS benchmark at tilde_m_1=m_3 gives eta_B=${p2.naturalBenchmarkAtM3.etaBBdp.toExponential(3)}, ` +
        `and strong-washout tilde_m_1=${p2.planckMatchAtMPs.tildeM1Ev.toFixed(4)} eV (K=${p2.planckMatchAtMPs.kWashout.toFixed(2)}) matches Planck ` +
        `eta_B=${p2.planckMatchAtMPs.etaBZeroInit.toExponential(3)} (relErr=${p2.planckMatchAtMPs.planckRelErr.toExponential(1)}, ` +
        `zero-vs-thermal diff=${p2.planckMatchAtMPs.initConditionRelDiff.toExponential(1)}) while eps_1=0 gives 0 and M_1=1e7 GeV gives ${p2.controlLowM1EtaB.toExponential(2)}. ` +
        `Part 3A (continuum SO(10) EFT matter-parity WIMP check, sharing the Omega_DM h^2=0.1200 budget with axions in E-FRC-0331 rather than 200%): ` +
        `P_M=(-1)^{3(B-L)} stays unbroken under <126_H> (3(B-L)=${mp.deltaR126VevThreeBlExact}) while broken by <16_H> (${mp.control16HVevThreeBlExact}), ` +
        `and at m_DM=${dm.mDmShell13GeV.toFixed(1)} GeV canonical <sigma v>=2.2e-26 cm^3/s gives Omega_DM h^2=${dm.canonicalOmegaDmH2.toFixed(4)} ` +
        `and <sigma v>=${dm.planckMatchedSigmaVCm3S.toExponential(3)} cm^3/s saturates 0.1200 (RK4 err=${dm.rk4StepHalvingRelErr.toExponential(1)}). ` +
        `Part 3B (logarithmic {3,4,3,4} Lambda shell audit): w=${lam.cosmicHistoryLateWEff.toFixed(5)} from E-CSM-0065 and 122 decades from M_Pl to rho_Lambda ` +
        `span D_Lambda=${lam.depthLambdaFromRhoB.toFixed(2)} shells (D_H0=${lam.depthH0B.toFixed(2)}, 2*D_Hinf=${lam.depthLambdaFromHInfB.toFixed(2)}), ` +
        `refusing any zero-parameter H_0=48 claim (offset=${lam.depthH0OffsetFrom48.toFixed(2)} shells, dynamical selection of D_Lambda remains open)`,
      metrics: {
        gPart1ExactAlgebra: gPart1ExactAlgebra ? 1 : 0,
        gPart1BaryogenesisAndControls: gPart1BaryogenesisAndControls ? 1 : 0,
        gPart2AlgebraAndNumer: gPart2AlgebraAndNumer ? 1 : 0,
        gPart2PlanckAndControls: gPart2PlanckAndControls ? 1 : 0,
        gPart3ADarkSector: gPart3ADarkSector ? 1 : 0,
        gPart3BLambdaAudit: gPart3BLambdaAudit ? 1 : 0,
        // Part 1 metrics
        part1DenseUnitarityErr: p1.coupledDenseUnitarityErr,
        part1MaxNormErr: p1.maxNormErr,
        part1ReversalErr: p1.reversalMaxAmpErr,
        part1ExactBeat1Err: p1.exactBeat1FormulaErr,
        part1Beat1DeltaB: Number(p1.beat1DeltaB.toFixed(8)),
        part1FinalDeltaB: Number(p1.finalDeltaB.toFixed(8)),
        part1FinalProbHeavyN: p1.finalProbHeavyN,
        part1FinalMeanDLight: Number(p1.finalMeanDLight.toFixed(4)),
        part1LateWindowMinDeltaB: Number(p1.lateWindowMinDeltaB.toFixed(6)),
        part1LateWindowSpread: p1.lateWindowSpread,
        part1CptPhaseFlipMaxErr: p1.cptPhaseFlipMaxErr,
        // Part 2 metrics
        part2CSphNum: Number(p2.sphaleron.cSphFromFormula.num),
        part2CSphDen: Number(p2.sphaleron.cSphFromFormula.den),
        part2ConvFactorBdp: Number(ratToNumber(p2.sphaleron.conversionFactorBdp).toFixed(7)),
        part2BesselRecurrenceErr: p2.besselRecurrenceMaxRelErr,
        part2BesselAsymptoticErr: p2.besselAsymptoticErr,
        part2MPsGeV: p2.mPsGeV,
        part2MStarEv: Number(p2.mStarEv.toExponential(5)),
        part2DavidsonIbarraMinM1GeV: p2.davidsonIbarraMinM1GeV,
        part2NaturalM3EtaB: p2.naturalBenchmarkAtM3.etaBBdp,
        part2NaturalGeomEtaB: p2.naturalBenchmarkAtGeomMean.etaBBdp,
        part2PlanckMatchTildeM1Ev: Number(p2.planckMatchAtMPs.tildeM1Ev.toFixed(6)),
        part2PlanckMatchK: Number(p2.planckMatchAtMPs.kWashout.toFixed(4)),
        part2PlanckMatchEps1: p2.planckMatchAtMPs.eps1,
        part2PlanckMatchEps1DiBound: p2.planckMatchAtMPs.eps1DiBound,
        part2PlanckMatchKappa: Number(p2.planckMatchAtMPs.efficiencyKappa.toFixed(6)),
        part2PlanckMatchEtaBZeroInit: p2.planckMatchAtMPs.etaBZeroInit,
        part2PlanckMatchEtaBThermalInit: p2.planckMatchAtMPs.etaBThermalInit,
        part2PlanckMatchInitRelDiff: p2.planckMatchAtMPs.initConditionRelDiff,
        part2PlanckMatchRelErr: p2.planckMatchAtMPs.planckRelErr,
        part2Rk4StepHalvingRelErr: p2.planckMatchAtMPs.rk4StepHalvingRelErr,
        part2FixedKM1GeV: p2.planckMatchAtFixedK.m1GeV,
        part2FixedKM1OverMPs: Number(p2.planckMatchAtFixedK.m1OverMPs.toFixed(4)),
        part2FixedKEtaB: p2.planckMatchAtFixedK.etaBZeroInit,
        part2FixedKInitRelDiff: p2.planckMatchAtFixedK.initConditionRelDiff,
        planckEtaBRef: PLANCK_ETA_B,
        // Part 3A metrics
        part3AMatterParityAllExact: mp.allCertificatesExact ? 1 : 0,
        part3ADmMassShell13GeV: Number(dm.mDmShell13GeV.toFixed(3)),
        part3ACanonicalFreezeOutX: Number(dm.canonicalFreezeOutX.toFixed(3)),
        part3ACanonicalOmegaDmH2: Number(dm.canonicalOmegaDmH2.toFixed(5)),
        part3APlanckMatchedSigmaV: dm.planckMatchedSigmaVCm3S,
        part3APlanckMatchedOmegaDmH2: Number(dm.planckMatchedOmegaDmH2.toFixed(6)),
        part3ARk4StepHalvingRelErr: dm.rk4StepHalvingRelErr,
        part3AXStartInvarianceRelErr: dm.xStartInvarianceRelErr,
        planckOmegaDmH2Ref: PLANCK_OMEGA_DM_H2,
        // Part 3B metrics
        part3BCuspB: Number(lam.cuspBranchingB.toFixed(8)),
        part3BLateWEff: Number(lam.cosmicHistoryLateWEff.toFixed(6)),
        part3BRhoLambdaGeV4: lam.rhoLambdaGeV4,
        part3BRhoPlOverRhoLambda: lam.rhoPlanckOverRhoLambda,
        part3BLambdaPlOverObs: lam.lambdaPlanckOverLambdaObs,
        part3BDepthH0: Number(lam.depthH0B.toFixed(4)),
        part3BDepthHInf: Number(lam.depthHInfB.toFixed(4)),
        part3BDepthLambdaFromHInf: Number(lam.depthLambdaFromHInfB.toFixed(4)),
        part3BDepthLambdaFromRho: Number(lam.depthLambdaFromRhoB.toFixed(4)),
        part3BEuclidean3DShells: lam.euclidean3DShellsForRhoLambda,
        part3BDepthH0OffsetFrom48: Number(lam.depthH0OffsetFrom48.toFixed(4)),
        part3BFactorErrAtShell48: Number(lam.factorErrorAtShell48.toFixed(4)),
        part3BUniformChanceAtH0Offset: Number(lam.uniformMod1ChanceAtH0Offset.toFixed(4)),
        part3BRefusedZeroParamH0Claim: lam.refusedZeroParamH0Claim ? 1 : 0,
        part3BDynamicalDLambdaOpen: lam.dynamicalSelectionOfDLambdaOpen ? 1 : 0,
        seconds,
      },
      control: {
        // Part 1 Sakharov ablation negative controls
        part1Ctrl1NoBlMaxAbsDeltaB: p1.control1NoBlMaxAbsDeltaB,
        part1Ctrl2RealCpMaxAbsDeltaB: p1.control2RealCpMaxAbsDeltaB,
        part1Ctrl3EquilibriumBoxMaxAbsDeltaB: p1.control3EquilibriumBoxMaxAbsDeltaB,
        part1StaticBoxNonEqLateSpread: Number(p1.staticBoxNonEqLateSpread.toFixed(6)),
        part1StaticBoxNonEqFinalProbN: Number(p1.staticBoxNonEqFinalProbN.toFixed(6)),
        // Part 2 leptogenesis negative controls
        part2CtrlNoCpEtaB: p2.controlNoCpEtaB,
        part2CtrlLowM1EtaB: p2.controlLowM1EtaB,
        part2CtrlWeakWashoutInitRelDiff: Number(p2.controlWeakWashoutInitRelDiff.toFixed(6)),
        part2CtrlStrongK20InitRelDiff: p2.controlStrongWashoutK20InitRelDiff,
        // Part 3A dark sector negative controls
        part3ACtrl16HBreaksParity: mp.control16HBreaksMatterParity ? 1 : 0,
        part3ACtrlStrongAnnihOmegaDmH2: Number(dm.controlStrongAnnihilationOmegaDmH2.toFixed(6)),
        part3ACtrlWeakAnnihOmegaDmH2: Number(dm.controlWeakAnnihilationOmegaDmH2.toFixed(4)),
      },
      notes:
        'L2 continuum EFT compatibility check and 5-state non-QCA toy walk (100% deterministic, zero Math.random): ' +
        '(1) Part 1 is a 5-state non-QCA Sakharov toy walk using Z[zeta_9][1/6] phases coupled to a 1D branching depth ' +
        'register (not the 4D {3,4,3,4} QCA), checking net Delta B > 0 from B(0) = 0 with CPT/CP sign flip and 0 on all three ablations. ' +
        '(2) Part 2 is a continuum Spin(10) EFT thermal leptogenesis compatibility check at M_PS = 1.434e11 GeV matching ' +
        'Planck eta_B = 6.12e-10 in strong washout within the Davidson-Ibarra bound. ' +
        '(3) Part 3 is a continuum SO(10) EFT matter-parity WIMP freeze-out check at m_DM = 484 GeV and a logarithmic ' +
        'Lambda shell audit. Budget disclosure: WIMP dark matter here and QCD axion dark matter in E-FRC-0331 share the ' +
        'single observed budget Omega_DM h^2 = 0.1200 (not 200%), and dynamical selection of D_Lambda ~ 97 remains open.',
    })
  },
})
