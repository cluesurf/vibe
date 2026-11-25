// L2 GR BENCHMARKS: 1PN/2.5PN BINARY INSPIRAL TO 7 r_g, WARPED-COLUMN TT WAVE PROPAGATION,
// AND VACUUM SCHWARZSCHILD REGGE-WHEELER / ZERILLI QUASINORMAL RINGDOWN (E-GRV-0161).
//
// Depth L2 (continuum GR benchmarks parameterized by warped-column G_eff = 0.07859254 and
// c_u = 0.9779246684, NOT a binary black-hole plunge/merger simulation and NOT derived from the QCA):
//   1. 1PN conservative + 2.5PN Peters-Mathews / Burke-Thorne equal-mass inspiral from 135 r_g down
//      to 7.0 r_g (stops outside r_ISCO = 6 r_g with no plunge or horizon formation), verified via
//      4th-order RK step-halving (<= 1e-8), Cartesian cross-check, energy/angular-momentum balance
//      (<= 1e-4), and radiation-reaction-OFF controls.
//   2. Time-dependent (1+1) radial + {3,4,3,4} warped-column (F = 12) symplectic leapfrog spin-2
//      TT wave propagation of Part 1's chirp strain to wave-zone detectors r_1 = 80 and r_2 = 160,
//      verifying c_u arrival time (<= 0.5%), 1/r amplitude falloff (<= 2%), free-wave symplectic
//      energy conservation and time-reversal (<= 1e-12), and screening in the raw unwarped bulk.
//   3. Vacuum Schwarzschild l = 2, n = 0 quasinormal ringdown in tortoise coordinate r_* under BOTH
//      axial Regge-Wheeler V_RW and polar Zerilli V_Z potentials (evaluated as a vacuum Schwarzschild
//      benchmark independently of E-GRV-0160's diffuse star, which has no event horizon), matching
//      Chandrasekhar-Detweiler omega_R = 0.37367 (<= 1.5%), omega_I = 0.08896 (<= 2.5%), axial-polar
//      isospectrality (<= 1%), and flat-space M = 0 Huygens control (< 1e-6).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  QNM_L2_N0_OMEGA_I_EXACT,
  QNM_L2_N0_OMEGA_R_EXACT,
  runBinaryMergerQnmRingdown,
} from '@/code/measure/binary-merger-qnm-ringdown'

export default experiment({
  id: 'gravity/binary-merger-qnm-ringdown',
  code: 'E-GRV-0161',
  title:
    'L2 GR benchmarks: 1PN/2.5PN inspiral to 7 r_g, warped-column TT wave propagation, and vacuum Schwarzschild QNM ringdown',
  category: 'gravity',
  substrates: ['eft-continuum'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runBinaryMergerQnmRingdown()
    const p1 = res.part1
    const p2 = res.part2
    const p3 = res.part3

    // Gate 0: Parameter-free {3,4,3,4} constants from E-GRV-0157 / E-RLT-0125 / E-GRV-0160 & runtime budget
    const g0ConstantsAndRuntime =
      Math.abs(res.kEff - 1.0125321220) < 1e-7 &&
      Math.abs(res.gEff - 0.07859254) < 1e-6 &&
      Math.abs(res.cUniversal - 0.9779246684) < 1e-8 &&
      res.mKKMin > 3.2 &&
      p3.eGrv0160SchwarzschildAMetricErr <= 1e-10 &&
      p3.eGrv0160SchwarzschildBMetricErr <= 1e-10 &&
      p3.eGrv0160VacuumEinsteinMax <= 1e-9 &&
      res.elapsedSeconds <= 12

    // Gate 1: Live 1PN + 2.5PN radiative binary inspiral, Peters-Mathews chirp, exact E & L balance, controls
    const g1BinaryInspiralChirp =
      p1.rEnd < p1.r0 &&
      p1.rStrictlyShrinking &&
      p1.fGwStrictlyRising &&
      p1.fGwRatio > 1.8 &&
      p1.adiabaticPmDfDtMaxRelErr <= 0.02 &&
      p1.pmPhaseRelErrAdiabatic <= 0.02 &&
      p1.adiabatic1PnDfDtMaxRelErr <= 0.002 &&
      p1.energyBalanceRelErrVsEGw <= 1e-3 &&
      p1.energyBalanceRelErrVsEOrb <= 1e-4 &&
      p1.angMomBalanceRelErrVsJGw <= 1e-3 &&
      p1.angMomBalanceRelErrVsLz <= 1e-4 &&
      p1.rk4StepHalvingMaxRelErr <= 1e-8 &&
      p1.cartVsPolarCrossCheckRelErr <= 1e-8 &&
      p1.negCtrlNewtonianEGw === 0 &&
      p1.negCtrlNewtonianMaxRDriftRel <= 1e-10 &&
      p1.negCtrlNewtonianFreqDriftRel <= 1e-10 &&
      p1.negCtrl1PnEGw === 0 &&
      p1.negCtrl1PnMaxRDriftRel <= 1e-10 &&
      p1.negCtrl1PnFreqDriftRel <= 1e-10

    // Gate 2: Live (1+1) radial + {3,4,3,4} F = 12 warped-column spin-2 TT wave propagation & controls
    const g2WarpedColumnWave =
      p2.stabilityRatio < 1 &&
      p2.speedRelErrVsCU <= 0.005 &&
      p2.peakAmplitudeFalloffRelErr <= 0.02 &&
      p2.rmsAmplitudeFalloffRelErr <= 0.02 &&
      p2.detectorWaveformCorrelation >= 0.995 &&
      p2.freeWaveEnergyDriftMax <= 1e-12 &&
      p2.freeWaveTimeReversalRelErr <= 1e-12 &&
      p2.rawOverWarpedRatioAtR2 < 1e-4

    // Gate 3: Exact l = 2, n = 0 Schwarzschild QNM ringdown (Regge-Wheeler + Zerilli isospectrality) & control
    const g3QnmRingdownIsospectral =
      p3.cflNumber < 0.85 &&
      p3.darbouxSuperpotentialMaxErr <= 1e-12 &&
      p3.potentialPointwiseRelDiffMax > 0.01 &&
      p3.rwSymplecticTimeReversalRelErr <= 1e-12 &&
      p3.rwOmegaRRelErrVsCD <= 0.015 &&
      p3.rwOmegaIRelErrVsCD <= 0.025 &&
      p3.rwFitR2 >= 0.999 &&
      p3.zerilliOmegaRRelErrVsCD <= 0.015 &&
      p3.zerilliOmegaIRelErrVsCD <= 0.025 &&
      p3.zerilliFitR2 >= 0.999 &&
      p3.isospectralOmegaRRelDiff <= 0.01 &&
      p3.isospectralOmegaIRelDiff <= 0.01 &&
      p3.flatPromptPeakAmp > 0.45 &&
      p3.flatLateWindowEnergyRatio < 1e-6 &&
      p3.flatLateBoxEnergyRatio < 1e-6

    const ok =
      g0ConstantsAndRuntime &&
      g1BinaryInspiralChirp &&
      g2WarpedColumnWave &&
      g3QnmRingdownIsospectral

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `L2 continuum GR benchmarks parameterized by warped-column constants G_eff = ${res.gEff.toFixed(8)}, ` +
        `c_u = ${res.cUniversal.toFixed(10)}, K_eff = ${res.kEff.toFixed(10)} (r_s = ${p3.rSchwarzschild.toFixed(6)}, ` +
        `not derived from the QCA and without plunge or horizon formation): ` +
        `(1) 1PN + 2.5PN equal-mass binary inspiral shrinks from r_0 = ${(p1.r0 / p1.rG).toFixed(1)} r_g to ` +
        `${(p1.rEnd / p1.rG).toFixed(2)} r_g (${p1.totalOrbits.toFixed(1)} orbits, RK4 step-halving err ${p1.rk4StepHalvingMaxRelErr.toExponential(2)}), ` +
        `chirping f_GW by ${p1.fGwRatio.toFixed(2)}x and matching Peters-Mathews df/dt to ${(100 * p1.adiabaticPmDfDtMaxRelErr).toFixed(2)}% ` +
        `(1PN-exact ${(100 * p1.adiabatic1PnDfDtMaxRelErr).toFixed(3)}%) with energy balance ${p1.energyBalanceRelErrVsEGw.toExponential(2)} ` +
        `and angular-momentum balance ${p1.angMomBalanceRelErrVsJGw.toExponential(2)} (radiation-reaction-OFF controls: E_GW = 0, ` +
        `max dr/r = ${p1.negCtrlNewtonianMaxRDriftRel.toExponential(2)}). ` +
        `(2) (1+1) radial + {3,4,3,4} F=12 warped-column symplectic leapfrog propagates Part 1's chirp to r_1 = ${p2.rDet1} and r_2 = ${p2.rDet2} ` +
        `at c_meas = ${p2.measuredWaveSpeed.toFixed(6)} (rel err ${(100 * p2.speedRelErrVsCU).toFixed(3)}% vs c_u), ` +
        `1/r falloff err ${(100 * p2.rmsAmplitudeFalloffRelErr).toFixed(3)}% (corr ${p2.detectorWaveformCorrelation.toFixed(6)}), ` +
        `free-wave symplectic energy drift ${p2.freeWaveEnergyDriftMax.toExponential(2)}, time-reversal ${p2.freeWaveTimeReversalRelErr.toExponential(2)}, ` +
        `while raw unwarped {3,4,3,4} bulk (w(D)=1) screens exponentially to |h_raw/h_warp| = ${p2.rawOverWarpedRatioAtR2.toExponential(2)}. ` +
        `(3) Vacuum Schwarzschild l = 2, n = 0 QNM ringdown (evaluated independently of E-GRV-0160's diffuse star) yields Regge-Wheeler ` +
        `(omega_R, omega_I)*(G_eff M / c_u^3) = (${p3.rwDimlessOmegaR.toFixed(5)}, ${p3.rwDimlessOmegaI.toFixed(5)}) ` +
        `and Zerilli (${p3.zerilliDimlessOmegaR.toFixed(5)}, ${p3.zerilliDimlessOmegaI.toFixed(5)}) vs Chandrasekhar-Detweiler ` +
        `(${QNM_L2_N0_OMEGA_R_EXACT.toFixed(5)}, ${QNM_L2_N0_OMEGA_I_EXACT.toFixed(5)}) ` +
        `(RW err ${(100 * p3.rwOmegaRRelErrVsCD).toFixed(3)}% / ${(100 * p3.rwOmegaIRelErrVsCD).toFixed(3)}%, ` +
        `axial-polar isospectrality ${(100 * p3.isospectralOmegaRRelDiff).toFixed(3)}% / ${(100 * p3.isospectralOmegaIRelDiff).toFixed(3)}%, ` +
        `flat-space M=0 late energy ratio ${p3.flatLateWindowEnergyRatio.toExponential(2)})`,
      metrics: {
        g0ConstantsAndRuntime: g0ConstantsAndRuntime ? 1 : 0,
        g1BinaryInspiralChirp: g1BinaryInspiralChirp ? 1 : 0,
        g2WarpedColumnWave: g2WarpedColumnWave ? 1 : 0,
        g3QnmRingdownIsospectral: g3QnmRingdownIsospectral ? 1 : 0,
        kEff: res.kEff,
        gEff: res.gEff,
        cUniversal: res.cUniversal,
        mKKMin: res.mKKMin,
        // Part 1
        p1MTotal: p1.mTotal,
        p1MChirp: p1.mChirp,
        p1RG: p1.rG,
        p1RIsco: p1.rIsco,
        p1R0OverRG: p1.r0 / p1.rG,
        p1REndOverRG: p1.rEnd / p1.rG,
        p1TotalOrbits: p1.totalOrbits,
        p1FGwStart: p1.fGwStart,
        p1FGwEnd: p1.fGwEnd,
        p1FGwRatio: p1.fGwRatio,
        p1AdiabaticPmDfDtMaxRelErr: p1.adiabaticPmDfDtMaxRelErr,
        p1AdiabaticPmDfDtMeanRelErr: p1.adiabaticPmDfDtMeanRelErr,
        p1Adiabatic1PnDfDtMaxRelErr: p1.adiabatic1PnDfDtMaxRelErr,
        p1PmPhaseRelErrAdiabatic: p1.pmPhaseRelErrAdiabatic,
        p1EGwTotal: p1.eGwTotal,
        p1RadiatedMassFrac: p1.radiatedMassFrac,
        p1EnergyBalanceRelErrVsEGw: p1.energyBalanceRelErrVsEGw,
        p1EnergyBalanceRelErrVsEOrb: p1.energyBalanceRelErrVsEOrb,
        p1JGwTotal: p1.jGwTotal,
        p1AngMomBalanceRelErrVsJGw: p1.angMomBalanceRelErrVsJGw,
        p1AngMomBalanceRelErrVsLz: p1.angMomBalanceRelErrVsLz,
        p1Rk4StepHalvingRelErrR: p1.rk4StepHalvingRelErrR,
        p1Rk4StepHalvingRelErrPhi: p1.rk4StepHalvingRelErrPhi,
        p1Rk4StepHalvingRelErrEGw: p1.rk4StepHalvingRelErrEGw,
        p1Rk4StepHalvingMaxRelErr: p1.rk4StepHalvingMaxRelErr,
        p1CartVsPolarCrossCheckRelErr: p1.cartVsPolarCrossCheckRelErr,
        // Part 2
        p2FloorF: p2.floorF,
        p2StabilityRatio: p2.stabilityRatio,
        p2ExpectedDelayBeats: p2.expectedDelayBeats,
        p2MeasuredDelayBeats: p2.measuredDelayBeats,
        p2MeasuredWaveSpeed: p2.measuredWaveSpeed,
        p2SpeedRelErrVsCU: p2.speedRelErrVsCU,
        p2PeakRh1: p2.peakRh1,
        p2PeakRh2: p2.peakRh2,
        p2PeakAmplitudeFalloffRelErr: p2.peakAmplitudeFalloffRelErr,
        p2RmsAmplitudeFalloffRelErr: p2.rmsAmplitudeFalloffRelErr,
        p2DetectorWaveformCorrelation: p2.detectorWaveformCorrelation,
        p2FreeWaveEnergyDriftMax: p2.freeWaveEnergyDriftMax,
        p2FreeWaveTimeReversalRelErr: p2.freeWaveTimeReversalRelErr,
        // Part 3
        p3MRemnantAdm: p3.mRemnantAdm,
        p3RSchwarzschild: p3.rSchwarzschild,
        p3CflNumber: p3.cflNumber,
        p3DarbouxSuperpotentialMaxErr: p3.darbouxSuperpotentialMaxErr,
        p3PotentialPointwiseRelDiffMax: p3.potentialPointwiseRelDiffMax,
        p3RwSymplecticTimeReversalRelErr: p3.rwSymplecticTimeReversalRelErr,
        p3RwDimlessOmegaR: p3.rwDimlessOmegaR,
        p3RwDimlessOmegaI: p3.rwDimlessOmegaI,
        p3RwOmegaRRelErrVsCD: p3.rwOmegaRRelErrVsCD,
        p3RwOmegaIRelErrVsCD: p3.rwOmegaIRelErrVsCD,
        p3RwFitR2: p3.rwFitR2,
        p3ZerilliDimlessOmegaR: p3.zerilliDimlessOmegaR,
        p3ZerilliDimlessOmegaI: p3.zerilliDimlessOmegaI,
        p3ZerilliOmegaRRelErrVsCD: p3.zerilliOmegaRRelErrVsCD,
        p3ZerilliOmegaIRelErrVsCD: p3.zerilliOmegaIRelErrVsCD,
        p3ZerilliFitR2: p3.zerilliFitR2,
        p3IsospectralOmegaRRelDiff: p3.isospectralOmegaRRelDiff,
        p3IsospectralOmegaIRelDiff: p3.isospectralOmegaIRelDiff,
        p3RwLateBoxEnergyRatio: p3.rwLateBoxEnergyRatio,
        elapsedSeconds: res.elapsedSeconds,
      },
      control: {
        p1NegCtrlNewtonianEGw: p1.negCtrlNewtonianEGw,
        p1NegCtrlNewtonianMaxRDriftRel: p1.negCtrlNewtonianMaxRDriftRel,
        p1NegCtrlNewtonianFreqDriftRel: p1.negCtrlNewtonianFreqDriftRel,
        p1NegCtrl1PnEGw: p1.negCtrl1PnEGw,
        p1NegCtrl1PnMaxRDriftRel: p1.negCtrl1PnMaxRDriftRel,
        p1NegCtrl1PnFreqDriftRel: p1.negCtrl1PnFreqDriftRel,
        p2RawBulkPeakHAtR1: p2.rawBulkPeakHAtR1,
        p2RawBulkPeakHAtR2: p2.rawBulkPeakHAtR2,
        p2WarpedPeakHAtR2: p2.warpedPeakHAtR2,
        p2RawOverWarpedRatioAtR2: p2.rawOverWarpedRatioAtR2,
        p3FlatPromptPeakAmp: p3.flatPromptPeakAmp,
        p3FlatLateWindowEnergyRatio: p3.flatLateWindowEnergyRatio,
        p3FlatLateBoxEnergyRatio: p3.flatLateBoxEnergyRatio,
      },
      notes:
        'L2 continuum GR benchmarks parameterized by warped-column (G_eff, c_u), not derived from the discrete QCA. Part 1 integrates an equal-mass binary under 1PN ADM conservative dynamics plus 2.5PN Peters-Mathews / Burke-Thorne radiation reaction from 135 r_g down to 7 r_g (stopping outside r_ISCO with no plunge or black-hole collision), cross-checked via step-halving, Cartesian RK4, energy/angular-momentum balance, and radiation-reaction-OFF controls. Part 2 propagates Part 1 quadrupole chirp strain through a (1+1) radial + {3,4,3,4} F=12 warped-column symplectic leapfrog spin-2 TT solver, verifying c_u arrival, 1/r falloff, symplectic conservation, time-reversal, and raw-bulk screening. Part 3 evaluates vacuum Schwarzschild axial Regge-Wheeler and polar Zerilli l = 2 QNM ringdown in tortoise coordinate r_* independently of E-GRV-0160 diffuse star (which has no event horizon), matching Chandrasekhar-Detweiler QNM frequencies and isospectrality against a flat-space Huygens control.',
    })
  },
})
