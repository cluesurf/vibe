// E-CSM-0068: COHEN-KAPLAN-NELSON HOLOGRAPHIC D_Lambda = 2 D_H BOUND, EXACT NONLINEAR
// SPHERICAL-COLLAPSE WEINBERG GALAXY-FORMATION WINDOW IN DISCRETE {3,4,3,4} SHELLS,
// AND DISCRETE Z_3-FLUX BOUSSO-POLCHINSKI DISCRETUUM AUDIT.
//
// Part 1: Proves the Cohen-Kaplan-Nelson (CKN) holographic non-black-hole bound L^3 rho_vac <= 3 M_P^2 L
//   enforces exact algebraic scaling D_CKN = 2 D_H + log_b(8 pi / 3) on {3,4,3,4} (b = 6034/330), landing at
//   D_CKN(bare c=1, L=L_H0) = 97.2843 shells vs observed D_Lambda = 97.4146 shells (0.1303 shells apart =
//   log_b(1 / Omega_Lambda)), exact 0 residual (<= 1e-13) in the asymptotic de Sitter limit connected to
//   E-CSM-0065 (w = -0.999984, H -> H_inf = sqrt(Omega_Lambda) H_0), and slope d(D_CKN)/d(D_H) = 2 across
//   60 decades while naive 3D QFT volume scaling fails by 122.95 decades (97.415 shells, S_QFT / S_BH ~ 2.7e60).
//
// Part 2: Integrates the exact nonlinear spherical top-hat collapse ODE d^2 y / d tau^2 = -(1/2) / y^2 +
//   lambda_tilde * y via 4th-order RK4 (energy first integral <= 1e-12, step-halving <= 1e-10, direct-tau RK4
//   cross-check <= 1e-10), verifies Weinberg's exact (500/729) analytic prefactor to < 0.1%, maps discrete
//   {3,4,3,4} shells D in [92..100] for Milky-Way halos (showing D <= 95 is lifeless, collapse turns on at
//   D_Weinberg = 95.873, and the entire upper habitable window spans Delta D = 1.542 < 2 integer shells),
//   and passes both negative controls (Lambda = 0 cycloid t_coll = 2 t_ta <= 1e-10 and delta_i = 0 homogeneous).
//
// Part 3: Exhaustively scans a deterministic K = 8 {3,4,3,4} Z_3/4-form flux lattice (|n_k| <= 6, 7^8 =
//   5,764,801 unsigned / 13^8 = 815,730,721 signed vectors) with O(1) mutually incommensurate {3,4,3,4}
//   cusp-cycle charges, showing dense population of [96.0, 98.5] (>> 10 vacua, min |D(n) - D_obs| < 0.05)
//   while equal commensurate charges and K = 1 controls both yield 0 vacua, and logs an honest Weinberg (1989)
//   No-Go Ledger distinguishing verified holographic/collapse/discretuum physics from open dynamical selection.
//
// Depth L2: deterministic {3,4,3,4} algebra + 4th-order RK4 nonlinear collapse + exhaustive 4+4 meet-in-the-middle
// flux lattice scan. Zero PRNGs.

import { analyzeHolographicLambdaAndWeinbergWindow } from '@/code/measure/holographic-lambda-and-weinberg-window'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const IDENTITY_TOL = 1e-13
const ENERGY_TOL = 1e-12
const STEP_TOL = 1e-10

export default experiment({
  id: 'cosmology/holographic-lambda-and-weinberg-window',
  code: 'E-CSM-0068',
  title:
    'Cohen-Kaplan-Nelson holographic D_Lambda = 2 D_H bound, exact nonlinear spherical-collapse Weinberg galaxy-formation window in discrete {3,4,3,4} shells, and discrete Z_3-flux Bousso-Polchinski discretuum audit',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const r = analyzeHolographicLambdaAndWeinbergWindow()
    const seconds = (Date.now() - started) / 1000
    const p1 = r.part1
    const p2 = r.part2
    const p3 = r.part3

    // Gate 1: Part 1 CKN holographic D_Lambda = 2 D_H identity, E-CSM-0065/0066 consistency, and QFT volume control
    const gPart1CknIdentities =
      Math.abs(p1.cuspBranchingB - 6034 / 330) <= 1e-12 &&
      p1.eCsm0066DepthH0Diff <= IDENTITY_TOL &&
      p1.eCsm0066DepthLambdaDiff <= IDENTITY_TOL &&
      p1.eCsm0066RhoLambdaRelDiff <= IDENTITY_TOL &&
      p1.identityH0ErrB <= IDENTITY_TOL &&
      p1.identityDeSitterErrB <= IDENTITY_TOL &&
      p1.identityDeSitterErrBulkLambda <= IDENTITY_TOL &&
      p1.depthCknBareH0B > 97.2 &&
      p1.depthCknBareH0B < 97.35 &&
      p1.depthLambdaObsB > 97.35 &&
      p1.depthLambdaObsB < 97.5 &&
      p1.depthCknBareOffsetFromObsB > 0.12 &&
      p1.depthCknBareOffsetFromObsB < 0.14 &&
      Math.abs(p1.cosmicHistoryLateWEff - -1) <= 1e-3 &&
      p1.cknSlopeErrFromTwo <= IDENTITY_TOL &&
      p1.scalingSamples.every(s => s.depthIdentityErr <= IDENTITY_TOL)

    const gPart1NaiveQftControl =
      p1.depthNaiveQft === 0 &&
      p1.naiveCatastropheLog10FullPl > 122 &&
      p1.naiveCatastropheLog10RedPl > 119 &&
      p1.qftOverBekensteinEntropyRatio > 1e60 &&
      p1.naiveVolumeSlopeDDLambdaOverDDH === 0

    // Gate 2: Part 2 exact RK4 spherical collapse, Weinberg (500/729) prefactor, < 2-shell window, and 2 controls
    const gPart2WeinbergNumer =
      p2.maxEnergyDriftAcrossSweep <= ENERGY_TOL &&
      p2.rk4StepHalvingRelErrAtObs <= STEP_TOL &&
      p2.directTauCrossCheckMaxErr <= STEP_TOL &&
      p2.weinbergPrefactorRelErr < 1e-3

    const gPart2WeinbergWindow =
      p2.allShellsUpTo95LifelessCanonical &&
      p2.allShellsUpTo95Lifeless3Sig &&
      p2.rhoAtShell95OverObs > 1100 &&
      p2.depthWeinbergCanonicalB > 95.7 &&
      p2.depthWeinbergCanonicalB < 96.1 &&
      p2.rhoLambdaMaxOverObsCanonical > 50 &&
      p2.rhoLambdaMaxOverObsCanonical < 120 &&
      p2.windowWidthCanonicalShells > 1.3 &&
      p2.windowWidthCanonicalShells < 2.0 &&
      p2.obsShellCollapsesCanonical &&
      p2.obsShellCollapses1Sig

    const gPart2Controls =
      p2.control1EdSMaxEnergyDrift <= ENERGY_TOL &&
      p2.control1EdSYTaRelErr <= STEP_TOL &&
      p2.control1EdSTauTaRelErr <= STEP_TOL &&
      p2.control1EdSTCollOver2TTaRelErr <= STEP_TOL &&
      p2.control1EdSReturnSymRelErr <= STEP_TOL &&
      !p2.control2HomogeneousCollapsedAny &&
      p2.control2HomogeneousMinV > 0 &&
      p2.control2HomogeneousMaxEnergyDrift <= ENERGY_TOL &&
      p2.control2HomogeneousEdSExactErr <= STEP_TOL

    // Gate 3: Part 3 discrete Z_3-flux Bousso-Polchinski discretuum, 2 negative controls, and honest No-Go ledger
    const gPart3FluxDiscretuum =
      p3.numChannelsK === 8 &&
      p3.maxAbsFluxInt === 6 &&
      p3.unsignedFluxStatesSearched === 7 ** 8 &&
      p3.minChargeDimensionless >= 0.9 &&
      p3.maxChargeDimensionless <= 2.0 &&
      p3.absRhoBareOverObs > 1e5 &&
      p3.vacuaCountInTargetBand >= 10 &&
      p3.vacuaCountInWeinbergWindow >= 10 &&
      p3.closestVacuum.absDepthErrFromObs < 0.05 &&
      p3.planckScaleChannelsNeededK > 100 &&
      p3.planckScaleChannelsNeededK < 200

    const gPart3ControlsAndLedger =
      p3.control1EqualChargesVacuaInBand === 0 &&
      p3.control2SingleChannelVacuaInBand === 0 &&
      p3.ledger.cknHolographicBoundVerified &&
      p3.ledger.weinbergCollapseWindowVerified &&
      p3.ledger.z3FluxDiscretuumPopulatesWindow &&
      !p3.ledger.zeroInputDynamicalDerivationClaimed &&
      p3.ledger.weinberg1989NoGoBoundaryOpen &&
      p3.ledger.agreesWithECsm0066OpenFlag

    const ok =
      gPart1CknIdentities &&
      gPart1NaiveQftControl &&
      gPart2WeinbergNumer &&
      gPart2WeinbergWindow &&
      gPart2Controls &&
      gPart3FluxDiscretuum &&
      gPart3ControlsAndLedger

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (CKN holographic bound on {3,4,3,4}, b=6034/330=${p1.cuspBranchingB.toFixed(6)}): ` +
        `naive 3D volume QFT cutoff rho_UV=M_Pl^4 sits at D=0 (${p1.naiveCatastropheRatioFullPl.toExponential(3)}x = ` +
        `${p1.naiveCatastropheLog10FullPl.toFixed(2)} decades off, violating Bekenstein entropy by ${p1.qftOverBekensteinEntropyRatio.toExponential(2)}x), ` +
        `whereas CKN non-black-hole bound rho_CKN=3 c_HDE^2 M_P^2 H^2 enforces exact D_CKN=2 D_H+log_b(8pi/3) ` +
        `(slope=${p1.cknSlopeDDLambdaOverDDH.toFixed(12)}): bare c=1 at L_H0 gives D_CKN=${p1.depthCknBareH0B.toFixed(4)} vs ` +
        `observed D_Lambda=${p1.depthLambdaObsB.toFixed(4)} (offset=${p1.depthCknBareOffsetFromObsB.toFixed(4)} shells = log_b(1/Omega_Lambda), ` +
        `H_0 identity err=${p1.identityH0ErrB.toExponential(1)}), and in E-CSM-0065's asymptotic de Sitter limit ` +
        `(w=${p1.cosmicHistoryLateWEff.toFixed(6)}, H->H_inf, c_HDE=${p1.cHdeDeSitter.toFixed(4)}) D_Lambda=2 D_Hinf+log_b(8pi/3) ` +
        `holds with ${p1.identityDeSitterErrB.toExponential(1)} residual. ` +
        `Part 2 (exact RK4 nonlinear spherical collapse & Weinberg window): RK4 integrates y''=-1/(2y^2)+lambda_tilde*y ` +
        `(max |Delta E|=${p2.maxEnergyDriftAcrossSweep.toExponential(1)}, step-halving err=${p2.rk4StepHalvingRelErrAtObs.toExponential(1)}, ` +
        `direct-tau cross-check=${p2.directTauCrossCheckMaxErr.toExponential(1)}), reproducing Weinberg's exact 500/729=${p2.weinbergAnalyticPrefactor.toFixed(7)} ` +
        `prefactor to relErr=${p2.weinbergPrefactorRelErr.toExponential(2)} (RK4=${p2.weinbergRk4Prefactor.toFixed(7)}). ` +
        `For Milky-Way halos (M=1e12 M_sun, sigma(z_rec=1089)=2.4e-3, 2.5-sigma peak delta_i=6.0e-3), every shell D<=95 ` +
        `(rho>=${p2.rhoAtShell95OverObs.toFixed(1)}x obs) is strictly lifeless, collapse turns on at D_Weinberg=${p2.depthWeinbergCanonicalB.toFixed(4)} ` +
        `(${p2.rhoLambdaMaxOverObsCanonical.toFixed(2)}x obs), and the entire upper habitable window [D_Weinberg, D_obs] spans only ` +
        `Delta D=${p2.windowWidthCanonicalShells.toFixed(4)} discrete shells (<2 integer shells), while Lambda=0 verifies cycloid ` +
        `t_coll=2 t_ta (err=${p2.control1EdSTCollOver2TTaRelErr.toExponential(1)}) and delta_i=0 never collapses. ` +
        `Part 3 (K=${p3.numChannelsK} Z_3-flux Bousso-Polchinski discretuum & Weinberg 1989 No-Go ledger): exhaustive scan of ` +
        `${p3.unsignedFluxStatesSearched} unsigned (${p3.signedFluxStatesRepresented} signed) O(1) flux vectors |n_k|<=6 with O(1) ` +
        `incommensurate {3,4,3,4} charges from lifeless bare scale |rho_bare|=${p3.absRhoBareOverObs.toExponential(2)}x obs populates ` +
        `[96.0, 98.5] with ${p3.vacuaCountInTargetBand} distinct vacua (closest n=[${p3.closestVacuum.nVector.join(',')}], ` +
        `D=${p3.closestVacuum.shellDepthB.toFixed(4)}, |Delta D|=${p3.closestVacuum.absDepthErrFromObs.toExponential(2)} shells), ` +
        `while commensurate q_k=1 and K=1 controls yield 0 vacua, unwarped D=0 requires K_Planck=${p3.planckScaleChannelsNeededK} channels, ` +
        `and Weinberg's 1989 zero-input dynamical selection boundary is explicitly recorded as open`,
      metrics: {
        gPart1CknIdentities: gPart1CknIdentities ? 1 : 0,
        gPart1NaiveQftControl: gPart1NaiveQftControl ? 1 : 0,
        gPart2WeinbergNumer: gPart2WeinbergNumer ? 1 : 0,
        gPart2WeinbergWindow: gPart2WeinbergWindow ? 1 : 0,
        gPart2Controls: gPart2Controls ? 1 : 0,
        gPart3FluxDiscretuum: gPart3FluxDiscretuum ? 1 : 0,
        gPart3ControlsAndLedger: gPart3ControlsAndLedger ? 1 : 0,
        // Part 1 metrics
        part1CuspB: Number(p1.cuspBranchingB.toFixed(8)),
        part1LnB: Number(p1.logBranchingB.toFixed(8)),
        part1BulkLambda: Number(p1.bulkLambda.toFixed(8)),
        part1MPlGeV: p1.mPlanckGeV,
        part1MPRedGeV: p1.mPlanckReducedGeV,
        part1H0GeV: p1.h0GeV,
        part1HInfGeV: p1.hInfGeV,
        part1RhoLambdaObsGeV4: p1.rhoLambdaObsGeV4,
        part1RhoCknBareH0GeV4: p1.rhoCknBareH0GeV4,
        part1CHdeDeSitter: Number(p1.cHdeDeSitter.toFixed(6)),
        part1DepthH0B: Number(p1.depthH0B.toFixed(6)),
        part1DepthHInfB: Number(p1.depthHInfB.toFixed(6)),
        part1DepthCknBareH0B: Number(p1.depthCknBareH0B.toFixed(6)),
        part1DepthLambdaObsB: Number(p1.depthLambdaObsB.toFixed(6)),
        part1DepthCknBareOffsetB: Number(p1.depthCknBareOffsetFromObsB.toFixed(6)),
        part1IdentityH0ErrB: p1.identityH0ErrB,
        part1IdentityDeSitterErrB: p1.identityDeSitterErrB,
        part1IdentityDeSitterErrBulk: p1.identityDeSitterErrBulkLambda,
        part1CknSlope: p1.cknSlopeDDLambdaOverDDH,
        part1CknSlopeErrFromTwo: p1.cknSlopeErrFromTwo,
        part1CknUvCutoffGeV: p1.cknUvCutoffGeV,
        part1DepthCknUvCutoffB: Number(p1.depthCknUvCutoffB.toFixed(6)),
        part1CosmicHistoryLateWEff: Number(p1.cosmicHistoryLateWEff.toFixed(6)),
        part1ECsm0066DepthLambdaDiff: p1.eCsm0066DepthLambdaDiff,
        // Part 2 metrics
        part2RhoMRecombGeV4: p2.rhoMRecombGeV4,
        part2LambdaTildeObsZRec: p2.lambdaTildeObsAtZRec,
        part2WeinbergAnalyticPrefactor: Number(p2.weinbergAnalyticPrefactor.toFixed(8)),
        part2WeinbergRk4Prefactor: Number(p2.weinbergRk4Prefactor.toFixed(8)),
        part2WeinbergPrefactorRelErr: p2.weinbergPrefactorRelErr,
        part2RhoMaxOverObsCanonical: Number(p2.rhoLambdaMaxOverObsCanonical.toFixed(4)),
        part2DepthWeinbergCanonicalB: Number(p2.depthWeinbergCanonicalB.toFixed(6)),
        part2WindowWidthCanonicalShells: Number(p2.windowWidthCanonicalShells.toFixed(6)),
        part2RhoMaxOverObs1Sig: Number(p2.rhoLambdaMaxOverObs1Sig.toFixed(4)),
        part2DepthWeinberg1SigB: Number(p2.depthWeinberg1SigB.toFixed(6)),
        part2WindowWidth1SigShells: Number(p2.windowWidth1SigShells.toFixed(6)),
        part2RhoMaxOverObs3Sig: Number(p2.rhoLambdaMaxOverObs3Sig.toFixed(4)),
        part2DepthWeinberg3SigB: Number(p2.depthWeinberg3SigB.toFixed(6)),
        part2WindowWidth3SigShells: Number(p2.windowWidth3SigShells.toFixed(6)),
        part2RhoAtShell95OverObs: Number(p2.rhoAtShell95OverObs.toFixed(4)),
        part2MaxEnergyDrift: p2.maxEnergyDriftAcrossSweep,
        part2Rk4StepHalvingRelErr: p2.rk4StepHalvingRelErrAtObs,
        part2DirectTauCrossCheckErr: p2.directTauCrossCheckMaxErr,
        // Part 3 metrics
        part3NumChannelsK: p3.numChannelsK,
        part3MaxAbsFluxInt: p3.maxAbsFluxInt,
        part3UnsignedStatesSearched: p3.unsignedFluxStatesSearched,
        part3SignedStatesRepresented: p3.signedFluxStatesRepresented,
        part3AnchorShellD: p3.anchorShellD,
        part3AbsRhoBareOverObs: p3.absRhoBareOverObs,
        part3DepthAbsRhoBareB: Number(p3.depthAbsRhoBareB.toFixed(4)),
        part3VacuaInTargetBand: p3.vacuaCountInTargetBand,
        part3VacuaInWeinbergWindow: p3.vacuaCountInWeinbergWindow,
        part3VacuaWithin005OfObs: p3.vacuaCountWithin005OfObs,
        part3ClosestVacuumDepthB: Number(p3.closestVacuum.shellDepthB.toFixed(6)),
        part3ClosestVacuumRhoOverObs: Number(p3.closestVacuum.rhoOverObs.toFixed(6)),
        part3ClosestVacuumAbsDepthErr: p3.closestVacuum.absDepthErrFromObs,
        part3PlanckScaleChannelsNeededK: p3.planckScaleChannelsNeededK,
        part3ZeroInputDynamicalClaimed: p3.ledger.zeroInputDynamicalDerivationClaimed ? 1 : 0,
        part3WeinbergNoGoOpen: p3.ledger.weinberg1989NoGoBoundaryOpen ? 1 : 0,
        seconds,
      },
      control: {
        // Part 1 non-holographic 3D volume QFT negative control
        part1CtrlNaiveDepth: p1.depthNaiveQft,
        part1CtrlNaiveCatastropheFullPl: p1.naiveCatastropheRatioFullPl,
        part1CtrlNaiveLog10FullPl: Number(p1.naiveCatastropheLog10FullPl.toFixed(4)),
        part1CtrlNaiveLog10RedPl: Number(p1.naiveCatastropheLog10RedPl.toFixed(4)),
        part1CtrlQftOverBekensteinEntropy: p1.qftOverBekensteinEntropyRatio,
        part1CtrlNaiveSlope: p1.naiveVolumeSlopeDDLambdaOverDDH,
        // Part 2 Lambda = 0 cycloid & delta_i = 0 homogeneous negative controls
        part2Ctrl1EdSYTaRelErr: p2.control1EdSYTaRelErr,
        part2Ctrl1EdSTauTaRelErr: p2.control1EdSTauTaRelErr,
        part2Ctrl1EdSTCollOver2TTaRelErr: p2.control1EdSTCollOver2TTaRelErr,
        part2Ctrl1EdSReturnSymRelErr: p2.control1EdSReturnSymRelErr,
        part2Ctrl1EdSMaxEnergyDrift: p2.control1EdSMaxEnergyDrift,
        part2Ctrl2HomogeneousCollapsedAny: p2.control2HomogeneousCollapsedAny ? 1 : 0,
        part2Ctrl2HomogeneousMinV: Number(p2.control2HomogeneousMinV.toFixed(6)),
        part2Ctrl2HomogeneousEdSExactErr: p2.control2HomogeneousEdSExactErr,
        // Part 3 commensurate & single-channel flux negative controls
        part3Ctrl1EqualChargesVacuaInBand: p3.control1EqualChargesVacuaInBand,
        part3Ctrl2SingleChannelVacuaInBand: p3.control2SingleChannelVacuaInBand,
      },
      notes:
        'L2, 100% deterministic, zero PRNGs. Reuses E-FRC-0328, E-CSM-0065, and E-CSM-0066 directly. ' +
        '(1) CKN holography on {3,4,3,4} closes the 122.95-decade (97.415-shell) naive 3D QFT catastrophe to ' +
        '0.1303 shells at c_HDE = 1, L = L_H0 and 0 residual (<= 1e-13) in E-CSM-0065 asymptotic de Sitter ' +
        '(H -> H_inf, w = -1), proving exact D_Lambda = 2 D_H + log_b(8 pi / 3). ' +
        '(2) Exact 4th-order RK4 spherical top-hat collapse reproduces Weinberg (1987) 500/729 prefactor, proves ' +
        'all shells D <= 95 are strictly lifeless for Milky-Way halos, and compresses the entire upper Weinberg ' +
        'galaxy-formation window into Delta D = 1.542 discrete {3,4,3,4} shells (< 2 integer shells), passing both ' +
        'Lambda = 0 cycloid and delta_i = 0 homogeneous controls. ' +
        '(3) Exhaustive 4+4 meet-in-the-middle scan over a deterministic K = 8 {3,4,3,4} Z_3-flux lattice (|n_k| <= 6) ' +
        'densely populates [96.0, 98.5] using O(1) charges while equal-charge and K = 1 controls fail with 0 vacua, ' +
        'and an honest Weinberg (1989) No-Go Ledger records that zero-input dynamical derivation of D_Lambda = 97.415 ' +
        'without holographic IR cutoff or environmental selection remains open.',
    })
  },
})
