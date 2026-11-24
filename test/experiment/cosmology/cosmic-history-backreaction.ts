// FULL COSMIC HISTORY (RADIATION w = +1/3 -> MATTER w = 0 -> DARK ENERGY w = -1)
// VIA REVERSIBLE MULTI-VIBE DENSITY BACKREACTION ON THE FIXED {3,4,3,4} HONEYCOMB
// (E-CSM-0065, gaps B-18, B-42; follow-up to E-CSM-0064 and E-GRV-0157).
//
// Part A: Microscopic reversible unitary radial walk on the fixed {3,4,3,4} branching tree (b = 18/1/5)
//   with self-consistent density backreaction theta(rho) = pi / (1 + kappa * G_eff * rho) where
//   rho(t) = N_rad / a(t)^4 + N_mat / a(t)^3. Verifies exact unitarity (normErr <= 1e-13), exact memoryless
//   adjoint reversal (<= 1e-12), early high-density braking and deceleration, and late-time relaxation to the
//   exact E-CSM-0064 dilute de Sitter limit (q -> -1, w_eff -> -1).
// Part B: Exact reversible 6th-order Yoshida symplectic Friedmann-Horosphere closure coupling E-CSM-0064's
//   H_inf = (ln(r_vol) / 3) * v_D and E-GRV-0157's G_eff = 0.07716700 to radiation (w = +1/3) and matter
//   (w = 0). Verifies all four landmarks in one continuous run: Radiation (w = +1/3, q = +1, a ~ t^{1/2}),
//   exact matter-radiation equality a_eq = rho_r0 / rho_m0, Matter (w = 0, q = +1/2, a ~ t^{2/3}), clean
//   deceleration-to-acceleration turnaround q = 0 at Omega_m / Omega_Lambda = 2 (<= 1e-4), and late-time
//   horosphere de Sitter (w -> -1, q -> -1, H -> H_inf matching E-CSM-0064 to <= 1e-4), with exact Hamiltonian
//   conservation and backward time-reversal <= 1e-12.
// Part C: Two mandatory negative controls (dilute zero-backreaction stuck at q = -1, w = -1; flat cubic b = 1
//   with H_inf = 0 decelerating forever with zero q = 0 crossing).
//
// Depth L2: exact {3,4,3,4} cusp constants + microscopic unitary backreacted walk + 6th-order Yoshida
// symplectic Friedmann-Horosphere closure. Deterministic, zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runCosmicHistoryBackreaction } from '@/code/measure/cosmic-history-backreaction'

const NORM_TOL = 1e-13
const REV_TOL = 1e-12
const HAM_TOL = 1e-12

export default experiment({
  id: 'cosmology/cosmic-history-backreaction',
  code: 'E-CSM-0065',
  title:
    'Full 3-era cosmic history (Radiation w = +1/3 -> Matter w = 0 -> Dark Energy w = -1) via reversible multi-vibe density backreaction on the fixed {3,4,3,4} honeycomb (B-18, B-42)',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const res = runCosmicHistoryBackreaction()
    const seconds = (Date.now() - started) / 1000
    const { constants: c, partA: a, partB: b, partC: ctrl } = res
    const bw = a.backreactedWalk
    const dw = a.diluteControlWalk
    const fw = a.flatCubicControlWalk
    const full = b.fullCosmicHistory
    const e1 = full.era1Radiation
    const e2 = full.era2Matter
    const e3 = full.era3DarkEnergy
    const turn = full.turnaround
    const cDil = ctrl.diluteControlSymplectic
    const cFlat = ctrl.flatCubicControlSymplectic

    // Gate 1: Upstream {3,4,3,4} constants match E-GRV-0157 (G_eff = 0.07716700) and E-CSM-0064 (v_D, H_inf)
    const gUpstream =
      c.shellCountsD0to3[0] === 1 &&
      c.shellCountsD0to3[1] === 18 &&
      c.shellCountsD0to3[2] === 330 &&
      c.shellCountsD0to3[3] === 6034 &&
      Math.abs(c.gEff - 0.077167) < 1e-6 &&
      Math.abs(c.diluteFgPiVelD - 0.53384199) < 1e-5 &&
      Math.abs(c.hInfB18 - 0.51433394) < 1e-5 &&
      Math.abs(c.hInfRVol - 0.51712789) < 1e-5

    // Gate 2: Part A microscopic unitary walk exact unitarity, zero floor reflection, exact memoryless reversal
    const gPartAUnitaryRev =
      bw.maxNormErr <= NORM_TOL &&
      bw.floorWeightAtMaxD === 0 &&
      bw.reversedMeanD <= REV_TOL &&
      bw.reversedMaxAmpDiff <= REV_TOL &&
      dw.maxNormErr <= NORM_TOL &&
      dw.floorWeightAtMaxD === 0 &&
      dw.reversedMaxAmpDiff <= REV_TOL &&
      fw.maxNormErr <= NORM_TOL &&
      fw.floorWeightAtMaxD === 0 &&
      fw.reversedMaxAmpDiff <= REV_TOL

    // Gate 3: Part A dynamical slowdown -> speedup to exact E-CSM-0064 dilute de Sitter limit
    const gPartATransition =
      bw.initialTheta < 0.25 &&
      bw.finalThetaErrFromPi < 1e-6 &&
      bw.finalRho < 1e-6 &&
      a.earlyVelSuppressionRatio < 0.6 &&
      bw.lateVelD > 1.5 * bw.earlyVelD &&
      bw.maxEarlyQLog > 0 &&
      a.lateVelMatchErr < 1e-3 &&
      a.lateHubbleMatchErr < 1e-3 &&
      Math.abs(bw.lateQLog - -1) < 0.02 &&
      Math.abs(bw.lateWEff - -1) < 0.02 &&
      Math.abs(fw.scaleAAtEnd - 1) <= 1e-14 &&
      fw.lateHubble === 0

    // Gate 4: Part B symplectic Hamiltonian conservation and exact backward time-reversal
    const gPartBSymplectic =
      full.maxHamiltonianErr <= HAM_TOL &&
      full.maxFriedmannRelErr <= HAM_TOL &&
      full.maxFriedmannLateAbsErr <= HAM_TOL &&
      full.reversedAErr <= REV_TOL &&
      full.reversedPErr <= REV_TOL &&
      full.reversedTErr <= REV_TOL

    // Gate 5: Part B all four cosmological landmarks in one continuous run
    const gEra1 =
      e1 !== null &&
      Math.abs(e1.meanWEff - 1 / 3) <= 0.02 &&
      Math.abs(e1.meanQ - 1) <= 0.02 &&
      Math.abs(e1.powerLawSlope - 0.5) <= 0.03 &&
      e1.slopeR2 > 0.9999

    const gEra2 =
      e2 !== null &&
      Math.abs(e2.meanWEff) <= 0.03 &&
      Math.abs(e2.meanQ - 0.5) <= 0.05 &&
      Math.abs(e2.powerLawSlope - 2 / 3) <= 0.04 &&
      e2.slopeR2 > 0.9999

    const gTurnaround =
      turn.crossed &&
      turn.crossingCount === 1 &&
      turn.ratioErrFromTwo <= 1e-4 &&
      turn.exactRadiationCorrectedErr <= 1e-5 &&
      full.aEqRelErr <= 1e-4

    const gEra3 =
      Math.abs(e3.finalWEff - -1) <= 1e-3 &&
      Math.abs(e3.finalQ - -1) <= 1e-3 &&
      Math.abs(e3.lateWindowMeanWEff - -1) <= 1e-3 &&
      Math.abs(e3.lateWindowMeanQ - -1) <= 1e-3 &&
      e3.finalHAbsErrFromHInf <= 1e-4

    // Gate 6: Part C both negative controls behave as required
    const gControlDilute =
      cDil.maxHamiltonianErr <= HAM_TOL &&
      cDil.maxFriedmannRelErr <= HAM_TOL &&
      cDil.reversedAErr <= REV_TOL &&
      !cDil.turnaround.crossed &&
      Math.abs(cDil.minQ - -1) <= 1e-12 &&
      Math.abs(cDil.maxQ - -1) <= 1e-12 &&
      Math.abs(cDil.minWEff - -1) <= 1e-12 &&
      Math.abs(cDil.maxWEff - -1) <= 1e-12

    const gControlFlat =
      cFlat.maxHamiltonianErr <= HAM_TOL &&
      cFlat.maxFriedmannRelErr <= HAM_TOL &&
      cFlat.reversedAErr <= REV_TOL &&
      !cFlat.turnaround.crossed &&
      cFlat.minQ > 0.49 &&
      Math.abs(cFlat.era3DarkEnergy.finalQ - 0.5) <= 1e-3 &&
      Math.abs(cFlat.era3DarkEnergy.finalWEff) <= 1e-3

    const ok =
      gUpstream &&
      gPartAUnitaryRev &&
      gPartATransition &&
      gPartBSymplectic &&
      gEra1 &&
      gEra2 &&
      gTurnaround &&
      gEra3 &&
      gControlDilute &&
      gControlFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Fixed reversible {3,4,3,4} honeycomb (r_vol=${c.rVol.toFixed(5)}, G_eff=${c.gEff.toFixed(8)}, H_inf=${c.hInfRVol.toFixed(5)}, Lambda_eff=${c.lambdaEff.toFixed(5)}): ` +
        `Part A unitary density-backreacted branching walk (steps=${bw.steps}, normErr=${bw.maxNormErr.toExponential(2)}, ` +
        `memoryless U^dag err=${bw.reversedMaxAmpDiff.toExponential(2)}) brakes early density (theta0=${bw.initialTheta.toFixed(4)}, ` +
        `early v_D=${bw.earlyVelD.toFixed(5)} = ${(a.earlyVelSuppressionRatio * 100).toFixed(1)}% of dilute, max early q=${bw.maxEarlyQLog.toFixed(3)}) ` +
        `then dilutes (rho_end=${bw.finalRho.toExponential(2)}, theta_end=pi-${bw.finalThetaErrFromPi.toExponential(2)}) and accelerates to the exact E-CSM-0064 dilute limit ` +
        `(late v_D=${bw.lateVelD.toFixed(5)} vs ${dw.lateVelD.toFixed(5)}, H=${bw.lateHubble.toFixed(5)}, q=${bw.lateQLog.toFixed(4)}, w_eff=${bw.lateWEff.toFixed(4)}). ` +
        `Part B 6th-order Yoshida symplectic Friedmann-Horosphere closure (hamErr=${full.maxHamiltonianErr.toExponential(2)}, ` +
        `relFriedmannErr=${full.maxFriedmannRelErr.toExponential(2)}, revErr=${full.reversedAErr.toExponential(2)}) traverses all 4 landmarks in one continuous run: ` +
        `Era 1 Radiation (w=${e1?.meanWEff.toFixed(4)}, q=${e1?.meanQ.toFixed(4)}, d ln a / d ln t=${e1?.powerLawSlope.toFixed(4)}), ` +
        `a_eq=${full.aEqObserved.toExponential(5)} (exact ${full.aEqExact.toExponential(5)}, relErr=${full.aEqRelErr.toExponential(2)}), ` +
        `Era 2 Matter (w=${e2?.meanWEff.toFixed(4)}, q=${e2?.meanQ.toFixed(4)}, d ln a / d ln t=${e2?.powerLawSlope.toFixed(4)}), ` +
        `Turnaround q=0 at a=${turn.aTurn.toFixed(5)} with Omega_m/Omega_Lambda=${turn.omegaMOverOmegaLambda.toFixed(6)} (err from 2: ${turn.ratioErrFromTwo.toExponential(2)}), ` +
        `Era 3 Dark Energy (w=${e3.finalWEff.toFixed(5)}, q=${e3.finalQ.toFixed(5)}, H=${e3.finalH.toFixed(5)} vs H_inf=${c.hInfRVol.toFixed(5)}). ` +
        `Part C controls: dilute control stays at q=${cDil.minQ.toFixed(6)}..${cDil.maxQ.toFixed(6)}, w=${cDil.minWEff.toFixed(6)} (0 crossings); ` +
        `flat cubic b=1 control decelerates forever with min q=${cFlat.minQ.toFixed(5)} (0 crossings)`,
      metrics: {
        gUpstream: gUpstream ? 1 : 0,
        gPartAUnitaryRev: gPartAUnitaryRev ? 1 : 0,
        gPartATransition: gPartATransition ? 1 : 0,
        gPartBSymplectic: gPartBSymplectic ? 1 : 0,
        gEra1: gEra1 ? 1 : 0,
        gEra2: gEra2 ? 1 : 0,
        gTurnaround: gTurnaround ? 1 : 0,
        gEra3: gEra3 ? 1 : 0,
        gControlDilute: gControlDilute ? 1 : 0,
        gControlFlat: gControlFlat ? 1 : 0,
        rVol: c.rVol,
        gEff: c.gEff,
        diluteFgPiVelD: c.diluteFgPiVelD,
        hInfB18: c.hInfB18,
        hInfRVol: c.hInfRVol,
        lambdaEff: c.lambdaEff,
        rhoLambda: c.rhoLambda,
        partAMaxNormErr: bw.maxNormErr,
        partARevMaxAmpDiff: bw.reversedMaxAmpDiff,
        partAInitTheta: bw.initialTheta,
        partAFinalThetaErr: bw.finalThetaErrFromPi,
        partAFinalRho: bw.finalRho,
        partAEarlyVelD: bw.earlyVelD,
        partALateVelD: bw.lateVelD,
        partADiluteVelD: dw.lateVelD,
        partAEarlyVelRatio: a.earlyVelSuppressionRatio,
        partAMaxEarlyQLog: bw.maxEarlyQLog,
        partALateHubble: bw.lateHubble,
        partALateQLog: bw.lateQLog,
        partALateWEff: bw.lateWEff,
        partBSteps: full.steps,
        partBHamErr: full.maxHamiltonianErr,
        partBFriedmannRelErr: full.maxFriedmannRelErr,
        partBFriedmannLateAbsErr: full.maxFriedmannLateAbsErr,
        partBRevAErr: full.reversedAErr,
        partBRevPErr: full.reversedPErr,
        partBRevTErr: full.reversedTErr,
        era1MeanW: e1?.meanWEff ?? NaN,
        era1MeanQ: e1?.meanQ ?? NaN,
        era1Slope: e1?.powerLawSlope ?? NaN,
        era1R2: e1?.slopeR2 ?? NaN,
        aEqExact: full.aEqExact,
        aEqObserved: full.aEqObserved,
        aEqRelErr: full.aEqRelErr,
        era2MeanW: e2?.meanWEff ?? NaN,
        era2MeanQ: e2?.meanQ ?? NaN,
        era2Slope: e2?.powerLawSlope ?? NaN,
        era2R2: e2?.slopeR2 ?? NaN,
        turnA: turn.aTurn,
        turnT: turn.tTurn,
        turnOmegaMOverL: turn.omegaMOverOmegaLambda,
        turnRatioErrFromTwo: turn.ratioErrFromTwo,
        turnExactRadCorrErr: turn.exactRadiationCorrectedErr,
        era3FinalA: e3.finalA,
        era3FinalH: e3.finalH,
        era3FinalHAbsErr: e3.finalHAbsErrFromHInf,
        era3FinalQ: e3.finalQ,
        era3FinalW: e3.finalWEff,
        era3LateMeanQ: e3.lateWindowMeanQ,
        era3LateMeanW: e3.lateWindowMeanWEff,
        seconds,
      },
      control: {
        partADiluteEarlyVelD: dw.earlyVelD,
        partADiluteLateVelD: dw.lateVelD,
        partAFlatCubicScaleA: fw.scaleAAtEnd,
        partAFlatCubicHubble: fw.lateHubble,
        partCDiluteMinQ: cDil.minQ,
        partCDiluteMaxQ: cDil.maxQ,
        partCDiluteMinW: cDil.minWEff,
        partCDiluteCrossed: cDil.turnaround.crossed ? 1 : 0,
        partCFlatMinQ: cFlat.minQ,
        partCFlatFinalQ: cFlat.era3DarkEnergy.finalQ,
        partCFlatFinalW: cFlat.era3DarkEnergy.finalWEff,
        partCFlatCrossed: cFlat.turnaround.crossed ? 1 : 0,
      },
      notes:
        `L2. Extends E-CSM-0064 from pure dilute de Sitter expansion to the full 3-era cosmological history ` +
        `(Radiation w = +1/3 -> Matter w = 0 -> Dark Energy w = -1) on the same fixed, reversible {3,4,3,4} ` +
        `honeycomb without mesh growth. Part A shows exact depth-preserving unitary backreaction C_+(theta(rho)) ` +
        `is autonomously time-reversible with zero recorded history and produces early high-density braking followed ` +
        `by smooth relaxation to the exact E-CSM-0064 dilute de Sitter walk. Part B closes the Friedmann-Horosphere ` +
        `dynamics with E-GRV-0157 G_eff and E-CSM-0064 H_inf via a 6th-order Yoshida symplectic Hamiltonian flow, ` +
        `reproducing Radiation (a ~ t^{1/2}), exact equality a_eq, Matter (a ~ t^{2/3}), deceleration-to-acceleration ` +
        `turnaround at Omega_m / Omega_Lambda = 2, and asymptotic horosphere de Sitter H -> H_inf, while both ` +
        `negative controls fail in the exact predicted ways.`,
    })
  },
})
