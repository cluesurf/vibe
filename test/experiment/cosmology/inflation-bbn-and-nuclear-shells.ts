// FRONTIER 6 (E-CSM-0067): DOWNSTREAM CONTINUUM COMPATIBILITY CHECKS: STAROBINSKY PLATEAU INFLATION
// (alpha = 1), STANDARD SDIRK4 BBN (PDG/AME2020 INPUTS), AND TEXTBOOK 1D WOODS-SAXON NUCLEAR SHELL
// BENCHMARK (INDEPENDENT OF THE {3,4,3,4} QCA).
//
// Part 1: Standard continuum Starobinsky R+R^2 plateau inflation V(phi) = V_0 (1 - exp(-sqrt(2/(3 alpha)) phi / M_Pl))^2
//   (alpha = 1 plus comparison alpha-attractor scales) integrated via coupled Friedmann-Klein-Gordon RK4 ODEs
//   across N_e = 50, 55, 60 e-folds (independent of the {3,4,3,4} QCA), checking Planck n_s, BICEP/Keck-safe r,
//   running alpha_s, horizon/flatness closure, and quadratic m^2 phi^2 and pure-radiation controls.
//
// Part 2: Standard continuum 6-species (n, p, D, T, ^3He, ^4He) BBN Boltzmann network from T = 5 MeV to 0.01 MeV
//   integrated via 5-stage 4th-order L-stable SDIRK using PDG/AME2020 nuclear and weak inputs (v_EW = 246.22 GeV,
//   tau_n = 878.4 s, eta_B = 6.12e-10, independent of the {3,4,3,4} QCA), checking Y_p, D/H, and 3 controls.
//
// Part 3: Textbook 1D radial Schrodinger Woods-Saxon + Thomas spin-orbit nuclear shell eigenproblem
//   (N_r = 200 on (0, 14 fm), independent of the {3,4,3,4} QCA), extracting magic numbers [2, 8, 20, 28, 50, 82, 126]
//   and contrasting with the V_so = 0 harmonic-oscillator control [2, 8, 20, 40, 70, 112].
//
// Depth L2: deterministic downstream continuum compatibility checks. Zero RNG.

import {
  BICEP_KECK_R_UPPER,
  OBS_D_OVER_H,
  PDG_YP,
  PLANCK_ETA_B,
  PLANCK_NS,
  analyzeInflationBbnAndNuclearShells,
} from '@/code/measure/inflation-bbn-and-nuclear-shells'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/inflation-bbn-and-nuclear-shells',
  code: 'E-CSM-0067',
  title:
    'Downstream continuum compatibility checks: Starobinsky plateau inflation (alpha = 1), standard SDIRK4 BBN (PDG/AME2020 inputs), and textbook 1D Woods-Saxon nuclear shell benchmark (independent of {3,4,3,4} QCA)',
  category: 'cosmology',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const r = analyzeInflationBbnAndNuclearShells()
    const seconds = (Date.now() - started) / 1000

    const p1 = r.part1Inflation
    const st = p1.starobinskyAlpha1
    const st50 = st.pivots[0]
    const st55 = st.pivots[1]
    const st60 = st.pivots[2]
    const c1 = p1.cuspCurvatureInvLnB2.pivots[1]
    const c2 = p1.cuspCurvature3Over2LnB2.pivots[1]
    const c3 = p1.cuspWarpExactAlpha.pivots[1]
    const q55 = p1.controlQuadratic.pivots[1]
    const rad = p1.controlPureRadiation

    const p2 = r.part2Bbn
    const bbn = p2.standardBbn
    const p3 = r.part3NuclearShells

    // Gate 1: Part 1 numerical rigor (RK4 step-halving <= 1e-9, Friedmann <= 1e-12, exact alpha_s cross-check)
    const gPart1Numer =
      st.maxFriedmannRelErr <= 1e-12 &&
      st.rk4StepHalvingErrNs <= 1e-9 &&
      st.rk4StepHalvingErrR <= 1e-9 &&
      st.rk4StepHalvingErrPhiEnd <= 1e-9 &&
      Math.abs(st.epsilonHAtEnd - 1) <= 1e-12 &&
      st55.alphaSNumericalCheckErr <= 1e-7 &&
      p1.cuspCurvatureInvLnB2.maxFriedmannRelErr <= 1e-12 &&
      p1.cuspCurvature3Over2LnB2.maxFriedmannRelErr <= 1e-12 &&
      p1.controlQuadratic.maxFriedmannRelErr <= 1e-12 &&
      rad.maxFriedmannRelErr <= 1e-11 &&
      rad.analyticGrowthRelErr <= 1e-10

    // Gate 2: Part 1 Planck / BICEP-Keck observables, horizon/flatness closure, M_GUT match, and controls
    const gPart1PhysicsAndControls =
      st55.ns >= 0.964 &&
      st55.ns <= 0.966 &&
      st55.nsSigmaFromPlanck < 0.3 &&
      st55.r >= 0.0034 &&
      st55.r <= 0.004 &&
      st55.r < BICEP_KECK_R_UPPER &&
      st55.alphaS < -4e-4 &&
      st55.alphaS > -9e-4 &&
      st55.alphaSSigmaFromPlanck < 1 &&
      st55.omegaKShrinkFactor < 1e-45 &&
      st60.omegaKShrinkFactor < 1e-50 &&
      st55.cuspShellsForNe > 18.5 &&
      st55.cuspShellsForNe < 19.5 &&
      st60.cuspShellsForNe > 20.0 &&
      st60.cuspShellsForNe < 21.0 &&
      st55.v0QuarterRelDiffFromMGut <= 0.05 &&
      c1.ns >= 0.963 &&
      c1.ns <= 0.966 &&
      c1.r < BICEP_KECK_R_UPPER &&
      c2.ns >= 0.963 &&
      c2.ns <= 0.966 &&
      c2.r < BICEP_KECK_R_UPPER &&
      p1.attractorNsSpreadAtN55 < 2e-3 &&
      q55.r > 4 * BICEP_KECK_R_UPPER &&
      rad.omegaKGrowthFactor > 1e17 &&
      Math.abs(rad.cosmicHistoryEra1MeanW - 1 / 3) < 0.02

    // Gate 3: Part 2 BBN thermodynamics, weak detailed balance, 4th-order convergence, and nucleon conservation
    const gPart2Numer =
      p2.weakDetailedBalanceMaxErr <= 1e-13 &&
      p2.zeroTempBetaDecayRateErr <= 1e-10 &&
      p2.entropyReheatingRatioCubedErr <= 1e-12 &&
      p2.sdirk4StepHalvingErrYp <= 1e-8 &&
      p2.sdirk4StepHalvingErrDH <= 1e-8 &&
      bbn.maxNucleonConservationErr <= 1e-12 &&
      p2.controlNeff4.maxNucleonConservationErr <= 1e-12 &&
      p2.controlLowEtaB.maxNucleonConservationErr <= 1e-12 &&
      p2.controlNoNeutronDecay.maxNucleonConservationErr <= 1e-12

    // Gate 4: Part 2 BBN physical observables (T_f, T_nuc, Y_p, D/H) and all 3 mandatory negative controls
    const gPart2PhysicsAndControls =
      bbn.tFreezeOutMeV >= 0.65 &&
      bbn.tFreezeOutMeV <= 0.85 &&
      bbn.xNeutronAtFreezeOut >= 0.145 &&
      bbn.xNeutronAtFreezeOut <= 0.18 &&
      bbn.tNucPeakBurnMeV >= 0.068 &&
      bbn.tNucPeakBurnMeV <= 0.078 &&
      bbn.helium4MassFractionYp >= 0.244 &&
      bbn.helium4MassFractionYp <= 0.249 &&
      p2.ypRelErrFromPdg <= 0.02 &&
      bbn.deuteriumToHydrogen >= 2.3e-5 &&
      bbn.deuteriumToHydrogen <= 2.8e-5 &&
      p2.dhRelErrFromObs <= 0.1 &&
      p2.controlNeff4DeltaYp >= 0.012 &&
      p2.controlNeff4DeltaYp <= 0.015 &&
      p2.controlNeff4SigmaFromPdg > 4 &&
      p2.controlLowEtaBDHRatio > 10 &&
      p2.controlNoNeutronDecay.helium4MassFractionYp > 0.3

    // Gate 5: Part 3 live Woods-Saxon + spin-orbit magic numbers [2, 8, 20, 28, 50, 82, 126] + BigInt + control
    const gPart3NuclearShells =
      p3.gridRefinementMaxRelErr <= 1e-3 &&
      p3.allSevenMagicNumbersExact &&
      p3.bigIntMagicSumsExact &&
      p3.bigIntHoControlExact &&
      p3.withSpinOrbit.gapProminenceRatio > 1.0 &&
      p3.controlNoSpinOrbitMatchesHo &&
      p3.controlNoSpinOrbitMissesHighMagic

    const ok =
      gPart1Numer &&
      gPart1PhysicsAndControls &&
      gPart2Numer &&
      gPart2PhysicsAndControls &&
      gPart3NuclearShells

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Downstream continuum compatibility checks (independent of the {3,4,3,4} QCA): ` +
        `Part 1 (Starobinsky plateau inflation alpha=1 + alpha-attractor comparison): ` +
        `coupled FKG RK4 (Friedmann err=${st.maxFriedmannRelErr.toExponential(1)}, step-halving ns=${st.rk4StepHalvingErrNs.toExponential(1)}) ` +
        `at alpha=1, N_e=55 gives n_s=${st55.ns.toFixed(5)} (${st55.nsSigmaFromPlanck.toFixed(2)} sigma from Planck ${PLANCK_NS}), ` +
        `r=${st55.r.toFixed(5)} (< BICEP/Keck ${BICEP_KECK_R_UPPER}), alpha_s=${st55.alphaS.toExponential(2)}, ` +
        `|Omega_K(end)|/|Omega_K(start)|=${st55.omegaKShrinkFactor.toExponential(2)} (${st55.cuspShellsForNe.toFixed(2)}..${st60.cuspShellsForNe.toFixed(2)} log-b units), ` +
        `and Planck A_s yields H_inf=${st55.hInfGeV.toExponential(2)} GeV, V_0^{1/4}=${st55.v0QuarterGeV.toExponential(3)} GeV ` +
        `(${(st55.v0QuarterRelDiffFromMGut * 100).toFixed(2)}% from E-FRC-0328 M_GUT=${p1.upstreamMGutGeV.toExponential(3)} GeV). ` +
        `Comparison alpha scales give n_s=${c1.ns.toFixed(5)}/${c2.ns.toFixed(5)} (r=${c1.r.toExponential(2)}/${c2.r.toExponential(2)}), ` +
        `while quadratic m^2 phi^2 fails with r=${q55.r.toFixed(4)} and pure radiation grows |Omega_K| by ${rad.omegaKGrowthFactor.toExponential(2)}. ` +
        `Part 2 (standard SDIRK4 BBN with PDG/AME2020 inputs, eta_B=${PLANCK_ETA_B.toExponential(2)}, v_EW=${p2.upstreamVEwGeV.toFixed(2)} GeV): ` +
        `detailed balance err=${p2.weakDetailedBalanceMaxErr.toExponential(1)}, (T_gamma/T_nu)^3-11/4=${p2.entropyReheatingRatioCubedErr.toExponential(1)}, ` +
        `step-halving Y_p=${p2.sdirk4StepHalvingErrYp.toExponential(1)}, nucleon err=${bbn.maxNucleonConservationErr.toExponential(1)}, ` +
        `T_f=${bbn.tFreezeOutMeV.toFixed(3)} MeV (X_n=${bbn.xNeutronAtFreezeOut.toFixed(4)}), T_nuc=${bbn.tNucPeakBurnMeV.toFixed(4)} MeV, ` +
        `Y_p=${bbn.helium4MassFractionYp.toFixed(5)} (PDG ${PDG_YP}, ${(p2.ypRelErrFromPdg * 100).toFixed(2)}%), ` +
        `D/H=${bbn.deuteriumToHydrogen.toExponential(3)} (obs ${OBS_D_OVER_H.toExponential(3)}, ${(p2.dhRelErrFromObs * 100).toFixed(2)}%), ` +
        `with controls N_eff=4 (+${p2.controlNeff4DeltaYp.toFixed(4)}), eta_B/10 (${p2.controlLowEtaBDHRatio.toFixed(1)}x D/H), and tau_n->inf (Y_p=${p2.controlNoNeutronDecay.helium4MassFractionYp.toFixed(4)}). ` +
        `Part 3 (textbook 1D radial Woods-Saxon + Thomas spin-orbit benchmark, N_r=200 vs 400 maxRelErr=${p3.gridRefinementMaxRelErr.toExponential(2)}): ` +
        `top 7 energy gaps reproduce empirical magic numbers [${p3.withSpinOrbit.detectedMagicNumbers.join(', ')}] ` +
        `(BigInt exact=${p3.bigIntMagicSumsExact}, gap prominence=${p3.withSpinOrbit.gapProminenceRatio.toFixed(2)}x), ` +
        `while V_so=0 collapses to harmonic-oscillator closures [${p3.controlNoSpinOrbit.detectedMagicNumbers.join(', ')}]`,
      metrics: {
        gPart1Numer: gPart1Numer ? 1 : 0,
        gPart1PhysicsAndControls: gPart1PhysicsAndControls ? 1 : 0,
        gPart2Numer: gPart2Numer ? 1 : 0,
        gPart2PhysicsAndControls: gPart2PhysicsAndControls ? 1 : 0,
        gPart3NuclearShells: gPart3NuclearShells ? 1 : 0,
        // Part 1 inflation metrics
        p1CuspB: Number(p1.cuspBranchingB.toFixed(8)),
        p1LnB: Number(p1.lnB.toFixed(8)),
        p1FriedmannRelErr: st.maxFriedmannRelErr,
        p1Rk4StepHalvingNs: st.rk4StepHalvingErrNs,
        p1Rk4StepHalvingR: st.rk4StepHalvingErrR,
        p1Rk4StepHalvingPhiEnd: st.rk4StepHalvingErrPhiEnd,
        p1CuspInvLnB2FriedmannErr: p1.cuspCurvatureInvLnB2.maxFriedmannRelErr,
        p1Cusp3Over2LnB2FriedmannErr: p1.cuspCurvature3Over2LnB2.maxFriedmannRelErr,
        p1CtrlQuadFriedmannErr: p1.controlQuadratic.maxFriedmannRelErr,
        p1RadFriedmannErr: rad.maxFriedmannRelErr,
        p1RadGrowthRelErr: rad.analyticGrowthRelErr,
        p1Ns50: Number(st50.ns.toFixed(6)),
        p1R50: Number(st50.r.toFixed(6)),
        p1Ns55: Number(st55.ns.toFixed(6)),
        p1R55: Number(st55.r.toFixed(6)),
        p1AlphaS55: st55.alphaS,
        p1AlphaSNumCheckErr: st55.alphaSNumericalCheckErr,
        p1Ns55SigmaPlanck: Number(st55.nsSigmaFromPlanck.toFixed(4)),
        p1Ns60: Number(st60.ns.toFixed(6)),
        p1R60: Number(st60.r.toFixed(6)),
        p1OmegaKShrink55: st55.omegaKShrinkFactor,
        p1OmegaKShrink60: st60.omegaKShrinkFactor,
        p1CuspShells55: Number(st55.cuspShellsForNe.toFixed(4)),
        p1CuspShells60: Number(st60.cuspShellsForNe.toFixed(4)),
        p1HInfGeV: st55.hInfGeV,
        p1V0QuarterGeV: st55.v0QuarterGeV,
        p1UpstreamMGutGeV: p1.upstreamMGutGeV,
        p1V0QuarterRelDiffMGut: Number(st55.v0QuarterRelDiffFromMGut.toFixed(5)),
        p1CuspInvLnB2Alpha: Number((p1.cuspCurvatureInvLnB2.alphaAttr ?? 0).toFixed(6)),
        p1CuspInvLnB2Ns55: Number(c1.ns.toFixed(6)),
        p1CuspInvLnB2R55: c1.r,
        p1Cusp3Over2LnB2Alpha: Number((p1.cuspCurvature3Over2LnB2.alphaAttr ?? 0).toFixed(6)),
        p1Cusp3Over2LnB2Ns55: Number(c2.ns.toFixed(6)),
        p1Cusp3Over2LnB2R55: c2.r,
        p1CuspWarpExactNs55: Number(c3.ns.toFixed(6)),
        p1CuspWarpExactR55: c3.r,
        p1AttractorNsSpread: p1.attractorNsSpreadAtN55,
        // Part 2 BBN metrics
        p2GFermiGeVInv2: p2.gFermiGeVInv2,
        p2EwCoulombRadTauNSec: Number(p2.ewCoulombRadiativeLifetimeSec.toFixed(2)),
        p2WeakDetailedBalErr: p2.weakDetailedBalanceMaxErr,
        p2ZeroTBetaRateErr: p2.zeroTempBetaDecayRateErr,
        p2EntropyRatioCubedErr: p2.entropyReheatingRatioCubedErr,
        p2Sdirk4StepErrYp: p2.sdirk4StepHalvingErrYp,
        p2Sdirk4StepErrDH: p2.sdirk4StepHalvingErrDH,
        p2NucleonConsErr: bbn.maxNucleonConservationErr,
        p2TFreezeOutMeV: Number(bbn.tFreezeOutMeV.toFixed(4)),
        p2XnFreezeOut: Number(bbn.xNeutronAtFreezeOut.toFixed(5)),
        p2TSahaBottleneckMeV: Number(bbn.tSahaBottleneckMeV.toFixed(5)),
        p2TNucPeakBurnMeV: Number(bbn.tNucPeakBurnMeV.toFixed(5)),
        p2Yp: Number(bbn.helium4MassFractionYp.toFixed(6)),
        p2YpRelErrPdg: Number(p2.ypRelErrFromPdg.toFixed(5)),
        p2YpSigmaPdg: Number(p2.ypSigmaFromPdg.toFixed(3)),
        p2DOverH: bbn.deuteriumToHydrogen,
        p2DOverHRelErrObs: Number(p2.dhRelErrFromObs.toFixed(5)),
        p2He3PlusTOverH: bbn.he3PlusTToHydrogen,
        // Part 3 nuclear shell metrics
        p3GridRefinementMaxRelErr: p3.gridRefinementMaxRelErr,
        p3BoundOrbitals: p3.withSpinOrbit.boundOrbitalCount,
        p3MagicMatchCount: p3.withSpinOrbit.detectedMagicNumbers.filter(
          (v, i) => v === [2, 8, 20, 28, 50, 82, 126][i],
        ).length,
        p3MinMagicGapMeV: Number(p3.withSpinOrbit.minDetectedGapMeV.toFixed(4)),
        p3MaxIntraShellGapMeV: Number(p3.withSpinOrbit.maxIntraShellGapMeV.toFixed(4)),
        p3GapProminenceRatio: Number(p3.withSpinOrbit.gapProminenceRatio.toFixed(4)),
        p3BigIntMagicExact: p3.bigIntMagicSumsExact ? 1 : 0,
        seconds,
      },
      control: {
        // Part 1 negative controls
        p1CtrlQuadraticNs55: Number(q55.ns.toFixed(6)),
        p1CtrlQuadraticR55: Number(q55.r.toFixed(5)),
        p1CtrlQuadraticRToBicepRatio: Number((q55.r / BICEP_KECK_R_UPPER).toFixed(3)),
        p1CtrlRadiationOmegaKGrowth: rad.omegaKGrowthFactor,
        p1CtrlRadiationEra1MeanW: Number(rad.cosmicHistoryEra1MeanW.toFixed(5)),
        // Part 2 negative controls
        p2CtrlNeff4Yp: Number(p2.controlNeff4.helium4MassFractionYp.toFixed(6)),
        p2CtrlNeff4DeltaYp: Number(p2.controlNeff4DeltaYp.toFixed(6)),
        p2CtrlNeff4SigmaPdg: Number(p2.controlNeff4SigmaFromPdg.toFixed(3)),
        p2CtrlLowEtaBYp: Number(p2.controlLowEtaB.helium4MassFractionYp.toFixed(6)),
        p2CtrlLowEtaBDOverH: p2.controlLowEtaB.deuteriumToHydrogen,
        p2CtrlLowEtaBDHRatio: Number(p2.controlLowEtaBDHRatio.toFixed(3)),
        p2CtrlNoNeutronDecayYp: Number(p2.controlNoNeutronDecay.helium4MassFractionYp.toFixed(6)),
        // Part 3 negative control (V_so = 0)
        p3CtrlNoSoHoMatch: p3.controlNoSpinOrbitMatchesHo ? 1 : 0,
        p3CtrlNoSoMissesHighMagic: p3.controlNoSpinOrbitMissesHighMagic ? 1 : 0,
        p3CtrlNoSoClosuresCount: p3.controlNoSpinOrbit.detectedMagicNumbers.length,
        p3CtrlNoSoClosure4: p3.controlNoSpinOrbit.detectedMagicNumbers[3] ?? 0,
        p3CtrlNoSoClosure5: p3.controlNoSpinOrbit.detectedMagicNumbers[4] ?? 0,
        p3CtrlNoSoClosure6: p3.controlNoSpinOrbit.detectedMagicNumbers[5] ?? 0,
      },
      notes:
        'Downstream continuum compatibility checks (L2, 100% deterministic, zero Math.random, independent of the {3,4,3,4} QCA): ' +
        '(1) Standard Starobinsky plateau inflation (alpha = 1) integrated via coupled Friedmann-Klein-Gordon RK4 ODEs ' +
        '(step-halving <= 1e-9, Friedmann <= 1e-12), checking Planck n_s, r, alpha_s, horizon/flatness closure, and ' +
        'quadratic/radiation negative controls (note high-scale H_inf ~ 10^13 GeV sits in tension with the pre-inflationary ' +
        'N_DW = 3 axion isocurvature bound H_inf < 9.9e6 GeV noted in E-FRC-0331). ' +
        '(2) Standard 6-species SDIRK4 BBN using PDG/AME2020 nuclear and weak inputs, reproducing PDG Y_p and observed D/H ' +
        'and checking N_eff = 4, eta_B / 10, and tau_n -> inf controls. ' +
        '(3) Textbook 1D radial Woods-Saxon + Thomas spin-orbit nuclear shell eigenproblem reproducing magic numbers ' +
        '[2, 8, 20, 28, 50, 82, 126] vs V_so = 0 closures [2, 8, 20, 40, 70, 112].',
    })
  },
})
