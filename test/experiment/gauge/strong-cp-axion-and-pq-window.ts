// FRONTIER 5 (E-FRC-0331): CONTINUUM SO(10) DFSZ AXION EFT COMPATIBILITY CHECK: E/N = 8/3 ANOMALY
// RATIO, QCD AXION RELAXATION AT f_a ~ M_PS, MISALIGNMENT DM, AND N_DW = 3 / H_inf TENSION DISCLOSURE.
//
// Part 1: Exact BigInt SO(10) Peccei-Quinn anomaly check on 3 x 16 = 48 Weyl fermions: q_PQ(16) = +1,
//   q_PQ(10_H) = -2, q_PQ(126bar_H) = -2 gives N = 6, E = 16, E/N = 8/3, and Spin(10) center quotient
//   N_DW = 3 (reduced from 6), plus strong-CP audit of complex SO(10) Yukawa textures.
//
// Part 2: Continuum 2-flavor chiral QCD axion potential and RK4 cosmological oscillator relaxation ODE
//   evaluated at E-FRC-0328's Pati-Salam scale M_PS = 1.434e11 GeV (m_a = 39.68, 119.05, 238.10 micro-eV
//   for f_a = M_PS, M_PS/3, M_PS/6), checking misalignment abundance Omega_a h^2 (note: shares the total
//   Omega_DM h^2 = 0.120 budget with WIMP dark matter in E-CSM-0066 rather than double-counting 200%).
//
// Part 3: Negative controls (no-PQ nEDM violation, f_a = M_GUT overclosure, KSVZ E/N = 0 vs DFSZ E/N = 8/3)
//   plus explicit disclosure of the N_DW = 3 pre-inflationary CMB isocurvature bound H_inf < 9.9e6 GeV
//   tension with high-scale inflation (H_inf ~ 10^13 GeV in E-CSM-0067) and the gravitational PQ-quality bound.
//
// Depth L2: deterministic continuum SO(10) DFSZ axion EFT compatibility check. Zero RNG.

import {
  analyzeStrongCpAxionAndPqWindow,
  rat,
  ratEq,
  ratFormat,
} from '@/code/measure/strong-cp-axion-and-pq-window'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gauge/strong-cp-axion-and-pq-window',
  code: 'E-FRC-0331',
  title:
    'Continuum SO(10) DFSZ axion EFT compatibility check (E/N = 8/3, f_a ~ M_PS, misalignment DM, and N_DW = 3 pre-inflationary H_inf < 9.9e6 GeV tension with E-CSM-0067)',
  category: 'gauge',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const r = analyzeStrongCpAxionAndPqWindow()
    const pq = r.pqAnomaly
    const cp = r.strongCpTension
    const pot = r.chiralPotential
    const b1 = r.benchmarkFaAtMPs
    const b3 = r.benchmarkFaAtMPsOver3
    const b6 = r.benchmarkFaAtMPsOver6
    const ctrl = r.controlsAndBoundary

    // Part 1 gates: exact BigInt PQ charges, Yukawa invariance, E/N = 8/3, Spin(10) Z_2 quotient,
    // and Z[zeta_9] strong-CP tension audit
    const part1Ok =
      pq.allAllowedYukawasInvariantExact &&
      pq.conjugate10HStarForbiddenExact &&
      pq.scalarPortalInvariantExact &&
      pq.coloredStates1Gen === 12 &&
      pq.totalStates1Gen === 16 &&
      pq.totalStates3Gen === 48 &&
      ratEq(pq.nColor1Gen, rat(2n)) &&
      ratEq(pq.nColor3Gen, rat(6n)) &&
      ratEq(pq.eEm1Gen, rat(16n, 3n)) &&
      ratEq(pq.eEm3Gen, rat(16n)) &&
      ratEq(pq.eOverNExact, rat(8n, 3n)) &&
      pq.eOverNEqualsInvSin2ThetaWGutExact &&
      pq.eOverNConstantAcrossNg1To5Exact &&
      pq.spin10CenterXMod4AllOneExact &&
      pq.domainWallNumberUnquotiented === 6 &&
      pq.domainWallNumberMinimalZ2Quotient === 3 &&
      Math.abs(pq.cAgammaSo10 - (8 / 3 - 1.92)) <= 1e-12 &&
      cp.so10MuSymmetryErr <= 1e-12 &&
      cp.so10MdSymmetryErr <= 1e-12 &&
      Math.abs(cp.thetaYukawaSo10FullRad) > 0.1 &&
      Math.abs(cp.thetaYukawaZeta9OnlyRad) > 1e-3 &&
      Math.abs(cp.thetaYukawaHermitianRad) <= 1e-14 &&
      Math.abs(cp.thetaYukawaRealControlRad) <= 1e-14 &&
      cp.requiresStrongCpMechanism

    // Part 2 gates: chiral QCD potential, live RK4 relaxation ODE (step-halving <= 1e-9),
    // Bessel harmonic check, Pati-Salam axion window [10, 400] micro-eV, and O(1) misalignment DM
    const part2Ok =
      pot.uniqueGlobalMinimumAtZero &&
      pot.minConvergedMaxAbsTheta <= 1e-14 &&
      pot.curvatureAnalyticVsNumericRelErr <= 1e-8 &&
      Math.abs(pot.chiTopQuarterRelDiffFromLatticePct) < 1.5 &&
      r.harmonicAnalyticVsOdeRelErr < 5e-3 &&
      r.relaxationMaxStepHalvingErrTheta <= 1e-9 &&
      r.relaxationMaxStepHalvingErrJ <= 1e-9 &&
      r.relaxationMaxCosmicThetaToday < 1e-18 &&
      r.relaxationMaxLocalHaloThetaToday < 1e-18 &&
      r.allThreeBenchmarksInWindowAndSafe &&
      b1.mAUeV > 39 &&
      b1.mAUeV < 40.5 &&
      b3.mAUeV > 118 &&
      b3.mAUeV < 120.5 &&
      b6.mAUeV > 236 &&
      b6.mAUeV < 240.5 &&
      b1.thetaStarForPlanckDmRad > 1.0 &&
      b1.thetaStarForPlanckDmRad < 2.8 &&
      Math.abs(b1.omegaAH2AtThetaStar - 0.12) < 1e-3 &&
      b3.thetaStarForPlanckDmRad > 1.5 &&
      b3.thetaStarForPlanckDmRad < Math.PI &&
      Math.abs(b3.omegaAH2AtThetaStar - 0.12) < 1e-3

    // Part 3 gates: three negative controls + honest gravitational PQ-quality & domain-wall flags
    const part3Ok =
      ctrl.control1NoPqViolationFactor > 1e8 &&
      ctrl.control2MGutOmegaAH2AtTheta1 > 100 &&
      ctrl.control2MGutOverclosureFactor > 1e3 &&
      ctrl.control2MGutRequiredThetaStarRad < 0.01 &&
      ctrl.control2FineTuningRatioVsMPs > 100 &&
      ratEq(ctrl.control3Ksvz0ENExact, rat(0n)) &&
      ctrl.control3CouplingSeparationRatio > 2.5 &&
      ctrl.control3CouplingSeparationRatio < 2.65 &&
      ctrl.control3HaloscopePowerRatio > 6.5 &&
      ctrl.pqQualityMinSafeDimAtMPsFullPl >= 10 &&
      ctrl.pqQualityMinSafeDimAtMPsOver3FullPl >= 10 &&
      ctrl.pqQualityProblemRemainsOpen &&
      ctrl.postInflationaryDomainWallProblemNote

    const ok = part1Ok && part2Ok && part3Ok

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part 1 (exact BigInt SO(10) Peccei-Quinn U(1)_PQ on E-FRC-0324's 48 fermions): q_PQ(16)=+1, ` +
        `q_PQ(10_H)=-2, q_PQ(126bar_H)=-2 preserves all 7/7 Dirac+Majorana Yukawas and scalar portal ` +
        `(10_H)^2(126_H)^2 while forbidding 16*16*10_H^* (charge +4), yielding exact N=${ratFormat(pq.nColor3Gen)}, ` +
        `E=${ratFormat(pq.eEm3Gen)}, E/N=${ratFormat(pq.eOverNExact)}=1/sin^2(theta_W)_GUT identically for all N_g>=1, ` +
        `Spin(10) center X=3(B-L)-4T_3^R===1 (mod 4) quotienting N_DW from ${pq.domainWallNumberUnquotiented} to ` +
        `${pq.domainWallNumberMinimalZ2Quotient}, and C_{a gamma gamma}=${pq.cAgammaSo10.toFixed(4)}, while SO(10)-symmetric ` +
        `E-FRC-0327 Z[zeta_9] quarks generate |theta_Yukawa|=${Math.abs(cp.thetaYukawaSo10FullRad).toFixed(4)} rad ` +
        `(pure zeta_9^7: ${Math.abs(cp.thetaYukawaZeta9OnlyRad).toFixed(4)} rad, violating nEDM by ${cp.nedmViolationFactorFull.toExponential(2)}x). ` +
        `Part 2 (chiral QCD relaxation + E-FRC-0328 Pati-Salam axion window): chiral potential curvature gives ` +
        `chi_top^{1/4}=${pot.chiTopLoQuarterMeV.toFixed(2)} MeV (${pot.chiTopQuarterRelDiffFromLatticePct.toFixed(2)}% vs lattice 75.5 MeV) ` +
        `with unique minimum at 0, live 2-stage RK4 cosmological ODE (step-halving err ${r.relaxationMaxStepHalvingErrTheta.toExponential(2)}, ` +
        `Bessel harmonic match ${(r.harmonicAnalyticVsOdeRelErr * 100).toFixed(3)}%) relaxes O(1) bare theta_bar to ` +
        `cosmic ${r.relaxationMaxCosmicThetaToday.toExponential(2)} (local halo ${r.relaxationMaxLocalHaloThetaToday.toExponential(2)} < 1e-18), ` +
        `and E-FRC-0328 M_PS=${r.eFrc0328MPsGeV.toExponential(3)} GeV predicts m_a=${b1.mAUeV.toFixed(2)}, ` +
        `${b3.mAUeV.toFixed(2)}, ${b6.mAUeV.toFixed(2)} micro-eV (|g_{a gamma gamma}|=${b1.absGAgammaGeVInv.toExponential(2)}, ` +
        `${b3.absGAgammaGeVInv.toExponential(2)}, ${b6.absGAgammaGeVInv.toExponential(2)} GeV^-1) for f_a=M_PS, M_PS/3, M_PS/6, ` +
        `all squarely inside the live 10..400 micro-eV haloscope window and hitting Planck DM Omega_a h^2=0.120 naturally ` +
        `at O(1) theta_i=${b1.thetaStarForPlanckDmRad.toFixed(3)} rad (f_a=M_PS) and ${b3.thetaStarForPlanckDmRad.toFixed(3)} rad (f_a=M_PS/3). ` +
        `Part 3 (controls & honest boundary): no-PQ violates nEDM by ${ctrl.control1NoPqViolationFactor.toExponential(2)}x, ` +
        `f_a=M_GUT=${ctrl.control2MGutGeV.toExponential(2)} GeV overcloses with Omega_a h^2=${ctrl.control2MGutOmegaAH2AtTheta1.toFixed(1)} ` +
        `(requiring theta_i=${ctrl.control2MGutRequiredThetaStarRad.toExponential(2)}), E/N=0 KSVZ separates from SO(10) E/N=8/3 by ` +
        `${ctrl.control3CouplingSeparationRatio.toFixed(3)}x in coupling (${ctrl.control3HaloscopePowerRatio.toFixed(2)}x in power), ` +
        `and gravitational PQ-quality protection (d>=${ctrl.pqQualityMinSafeDimAtMPsOver3FullPl}..${ctrl.pqQualityMinSafeDimAtMPsFullPl}) ` +
        `plus pre-inflationary H_inf<${b1.preInflationaryMaxHInfGeV.toExponential(2)} GeV remain explicit open checks`,
      metrics: {
        // Upstream E-FRC-0328 scales
        eFrc0328Log10MPsGeV: Number(r.eFrc0328Log10MPsGeV.toFixed(5)),
        eFrc0328Log10MGutGeV: Number(r.eFrc0328Log10MGutGeV.toFixed(5)),
        eFrc0328MPsGeV: r.eFrc0328MPsGeV,
        // Part 1: Exact BigInt PQ anomaly certification
        allAllowedYukawasInvariantExact: pq.allAllowedYukawasInvariantExact ? 1 : 0,
        conjugate10HStarForbiddenExact: pq.conjugate10HStarForbiddenExact ? 1 : 0,
        scalarPortalInvariantExact: pq.scalarPortalInvariantExact ? 1 : 0,
        nColor1Gen: Number(pq.nColor1Gen.num) / Number(pq.nColor1Gen.den),
        nColor3Gen: Number(pq.nColor3Gen.num) / Number(pq.nColor3Gen.den),
        eEm3Gen: Number(pq.eEm3Gen.num) / Number(pq.eEm3Gen.den),
        eOverNNum: Number(pq.eOverNExact.num),
        eOverNDen: Number(pq.eOverNExact.den),
        eOverNEqualsInvSin2ThetaWGutExact: pq.eOverNEqualsInvSin2ThetaWGutExact ? 1 : 0,
        eOverNConstantAcrossNg1To5Exact: pq.eOverNConstantAcrossNg1To5Exact ? 1 : 0,
        spin10CenterXMod4AllOneExact: pq.spin10CenterXMod4AllOneExact ? 1 : 0,
        domainWallNumberUnquotiented: pq.domainWallNumberUnquotiented,
        domainWallNumberMinimalZ2Quotient: pq.domainWallNumberMinimalZ2Quotient,
        cAgammaSo10: Number(pq.cAgammaSo10.toFixed(6)),
        cAgammaLoChptCheck: Number(pq.cAgammaLoChptCheck.toFixed(6)),
        // Part 1B: Z[zeta_9] strong-CP tension audit
        thetaYukawaSo10FullRad: Number(cp.thetaYukawaSo10FullRad.toFixed(6)),
        thetaYukawaZeta9OnlyRad: Number(cp.thetaYukawaZeta9OnlyRad.toFixed(6)),
        thetaYukawaHermitianRad: cp.thetaYukawaHermitianRad,
        thetaYukawaRealControlRad: cp.thetaYukawaRealControlRad,
        // Part 2A: Chiral QCD axion potential
        kappaChiral: Number(pot.kappaChiral.toFixed(6)),
        chiTopLoQuarterMeV: Number(pot.chiTopLoQuarterMeV.toFixed(4)),
        chiTopNloQuarterMeV: pot.chiTopNloQuarterMeV,
        chiTopQuarterRelDiffFromLatticePct: Number(
          pot.chiTopQuarterRelDiffFromLatticePct.toFixed(3),
        ),
        chiralCurvatureNumericRelErr: pot.curvatureAnalyticVsNumericRelErr,
        chiralMinMaxAbsTheta: pot.minConvergedMaxAbsTheta,
        // Part 2B: Live cosmological RK4 relaxation & Bessel check
        harmonicBesselAnalyticJCoeff: Number(r.harmonicBesselAnalyticJCoeff.toFixed(6)),
        harmonicOdeNumericJCoeff: Number(r.harmonicOdeNumericJCoeff.toFixed(6)),
        harmonicAnalyticVsOdeRelErr: Number(r.harmonicAnalyticVsOdeRelErr.toExponential(4)),
        rk4MaxStepHalvingErrTheta: r.relaxationMaxStepHalvingErrTheta,
        rk4MaxStepHalvingErrJ: r.relaxationMaxStepHalvingErrJ,
        relaxationMaxCosmicThetaToday: r.relaxationMaxCosmicThetaToday,
        relaxationMaxLocalHaloThetaToday: r.relaxationMaxLocalHaloThetaToday,
        // Part 2C: Pati-Salam axion benchmarks f_a in {M_PS, M_PS/3, M_PS/6}
        faMPsGeV: b1.fAGeV,
        maAtMPsUeV: Number(b1.mAUeV.toFixed(4)),
        freqAtMPsGHz: Number(b1.frequencyGHz.toFixed(4)),
        gAgammaAtMPsGeVInv: b1.absGAgammaGeVInv,
        omegaAH2AtMPsTheta1: Number(b1.omegaAH2AtTheta1.toFixed(5)),
        omegaAH2AtMPsRmsTheta: Number(b1.omegaAH2AtRmsTheta.toFixed(5)),
        thetaStarAtMPsRad: Number(b1.thetaStarForPlanckDmRad.toFixed(5)),
        omegaAH2AtMPsThetaStar: Number(b1.omegaAH2AtThetaStar.toFixed(5)),
        preInfMaxHInfAtMPsGeV: b1.preInflationaryMaxHInfGeV,
        faMPsOver3GeV: b3.fAGeV,
        maAtMPsOver3UeV: Number(b3.mAUeV.toFixed(4)),
        freqAtMPsOver3GHz: Number(b3.frequencyGHz.toFixed(4)),
        gAgammaAtMPsOver3GeVInv: b3.absGAgammaGeVInv,
        thetaStarAtMPsOver3Rad: Number(b3.thetaStarForPlanckDmRad.toFixed(5)),
        omegaAH2AtMPsOver3ThetaStar: Number(b3.omegaAH2AtThetaStar.toFixed(5)),
        faMPsOver6GeV: b6.fAGeV,
        maAtMPsOver6UeV: Number(b6.mAUeV.toFixed(4)),
        freqAtMPsOver6GHz: Number(b6.frequencyGHz.toFixed(4)),
        gAgammaAtMPsOver6GeVInv: b6.absGAgammaGeVInv,
        thetaStarAtMPsOver6Rad: Number(b6.thetaStarForPlanckDmRad.toFixed(5)),
        allThreeBenchmarksInWindowAndSafe: r.allThreeBenchmarksInWindowAndSafe ? 1 : 0,
        // Part 3: PQ quality open boundary
        pqQualityMinSafeDimAtMPsFullPl: ctrl.pqQualityMinSafeDimAtMPsFullPl,
        pqQualityMinSafeDimAtMPsOver3FullPl: ctrl.pqQualityMinSafeDimAtMPsOver3FullPl,
        pqQualityProblemRemainsOpen: ctrl.pqQualityProblemRemainsOpen ? 1 : 0,
      },
      control: {
        // Control 1: No PQ axion (bare SO(10) Z[zeta_9] quark phase)
        control1NoPqThetaRad: Number(ctrl.control1NoPqThetaRad.toFixed(6)),
        control1NoPqNedmECm: ctrl.control1NoPqNedmECm,
        control1NoPqViolationFactor: ctrl.control1NoPqViolationFactor,
        control1Zeta9OnlyNedmViolationFactor: cp.nedmViolationFactorZeta9Only,
        // Control 2: f_a = M_GUT overclosure and fine-tuning
        control2MGutGeV: ctrl.control2MGutGeV,
        control2MGutAxionMassUeV: Number(ctrl.control2MGutAxionMassUeV.toExponential(4)),
        control2MGutOmegaAH2AtTheta1: Number(ctrl.control2MGutOmegaAH2AtTheta1.toFixed(2)),
        control2MGutOverclosureFactor: Number(ctrl.control2MGutOverclosureFactor.toFixed(2)),
        control2MGutRequiredThetaStarRad: Number(
          ctrl.control2MGutRequiredThetaStarRad.toExponential(4),
        ),
        control2FineTuningRatioVsMPs: Number(ctrl.control2FineTuningRatioVsMPs.toFixed(2)),
        // Control 3: Wrong E/N = 0 KSVZ-neutral vs SO(10) E/N = 8/3
        control3Ksvz0CAgamma: Number(ctrl.control3Ksvz0CAgamma.toFixed(6)),
        control3So10CAgamma: Number(ctrl.control3So10CAgamma.toFixed(6)),
        control3CouplingSeparationRatio: Number(ctrl.control3CouplingSeparationRatio.toFixed(5)),
        control3HaloscopePowerRatio: Number(ctrl.control3HaloscopePowerRatio.toFixed(5)),
        control3Ksvz0GAgammaAtMPsGeVInv: ctrl.control3Ksvz0GAgammaAtMPsGeVInv,
        control3So10GAgammaAtMPsGeVInv: ctrl.control3So10GAgammaAtMPsGeVInv,
      },
      notes:
        'Continuum SO(10) DFSZ axion EFT compatibility check (L2, zero random numbers, not derived from the QCA): ' +
        '(1) Exact BigInt group theory on 3 x 16 = 48 Weyl states verifies N = 6, E = 16, E/N = 8/3 = 1/sin^2(theta_W)_GUT, ' +
        'and Spin(10) center quotient N_DW = 3 (from 6). ' +
        '(2) At E-FRC-0328 Pati-Salam scale M_PS = 1.434e11 GeV, f_a in {M_PS, M_PS/3, M_PS/6} gives m_a = 39.68, 119.05, ' +
        `238.10 micro-eV and misalignment Omega_a h^2 = 0.120 at theta_i = ${b1.thetaStarForPlanckDmRad.toFixed(3)} rad ` +
        '(sharing the total dark-matter budget with WIMP dark matter in E-CSM-0066 rather than double-counting 200%). ' +
        '(3) Explicit tensions and open boundaries: (a) Domain walls and inflation tension: because N_DW = 3 > 1, ' +
        'post-inflationary PQ breaking produces stable domain walls unless explicitly biased, while pre-inflationary ' +
        `PQ breaking faces the CMB isocurvature bound H_inf < ${b1.preInflationaryMaxHInfGeV.toExponential(2)} GeV ` +
        '(~9.9e6 GeV), in direct tension with high-scale Starobinsky inflation (H_inf ~ 10^13 GeV in E-CSM-0067). ' +
        `(b) Gravitational PQ quality requires suppressing operators up to d >= ${ctrl.pqQualityMinSafeDimAtMPsOver3FullPl}..${ctrl.pqQualityMinSafeDimAtMPsFullPl}.`,
    })
  },
})
