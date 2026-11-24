// FRONTIER 3 (E-GRV-0162): TRUE L3 TWO-BODY MUTUAL GRAVITATIONAL ATTRACTION, ACTION-REACTION,
// AND STRONG-FIELD EVENT-HORIZON TRAPPING WITH EXACT UNITARY INFORMATION PRESERVATION
// DIRECTLY ON EXACT 4D {3,4,3,4} HONEYCOMB BALLS (R = 2: 481 DOCKS, R = 3: 8,857 DOCKS).
//
// Depth L3: runs directly on the exact 4D {3,4,3,4} honeycomb balls (R = 2: 481 docks / 11,544
// slots, R = 3: 8,857 docks / 212,568 slots, 0 frontier hits, 0 coordinate/cover conflicts) using
// parameter-free constants G_eff = 0.07716700 (E-GRV-0157), c_u = 0.9869161538 (E-RLT-0125), and
// E-GRV-0160's nonlinear isotropic Schwarzschild lapse alpha(r) and conformal factor psi(r):
//   1. Coupled live two-body Strang-split reversible unitary attraction & Newton's 3rd law
//      (equal mass 1:1 and unequal mass 1:3) directly on the 8,857-dock 4D ball, with G = 0 null
//      control, raw unwarped w(D) = 1 & Cheeger-screened bulk controls (> 100x collapse), and
//      exact memoryless U_2body^dag reversal <= 1e-13.
//   2. Nonlinear strong-field event-horizon trapping across chi = r_H / r_0 = r_s / (4 r_0) in
//      {0.0, 0.4, 0.75, 1.0, 1.35} on the 8,857-dock 4D ball: strictly monotonic slowdown from
//      v_r = +c_u -> 0 (exact horizon stall) -> negative (inward fall inside trapped interior),
//      with simultaneous proof of exact unitary information preservation behind the horizon
//      (norm <= 1e-13, purity Tr(rho^2) = 1 <= 1e-13, memoryless U_horizon^dag reversal <= 1e-13,
//      and orthogonality preservation |<psi_1(t) | psi_2(t)>| <= 1e-13).
//   3. Exact R = 2 vs R = 3 zero-contamination convergence (<= 1e-14), < 1% weak-field bridge to
//      E-GRV-0160 L2 predictions, and certified {3,4,3,4} N_ball(0..3) = [1, 25, 481, 8857]
//      ~ 18^R hardware scaling law. Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runHoneycombBallL3TwoBodyAndHorizon } from '@/code/measure/honeycomb-ball-l3-two-body-and-horizon'

export default experiment({
  id: 'gravity/honeycomb-ball-l3-two-body-and-horizon',
  code: 'E-GRV-0162',
  title:
    'True L3 two-body mutual gravitational attraction, action-reaction, and strong-field event-horizon trapping with exact unitary information preservation directly on exact 4D {3,4,3,4} honeycomb balls',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const r = runHoneycombBallL3TwoBodyAndHorizon()
    const g = r.geometry
    const p1 = r.part1TwoBody
    const p2 = r.part2Horizon
    const p3 = r.part3ConvergenceAndScaling

    // Gate 0: Exact 4D {3,4,3,4} ball geometry, cusp chart consistency, zero conflicts, constants & runtime
    const g0GeometryAndConstants =
      Math.abs(r.constants.gEff - 0.077167) < 1e-6 &&
      Math.abs(r.constants.cUniversal - 0.9869161538) < 1e-8 &&
      g.nBall0to3[0] === 1 &&
      g.nBall0to3[1] === 25 &&
      g.nBall0to3[2] === 481 &&
      g.nBall0to3[3] === 8857 &&
      g.r2TotalSlots === 11544 &&
      g.r3TotalSlots === 212568 &&
      g.r2CoverConflicts === 0 &&
      g.r2CoverMissing === 0 &&
      g.r2OrientationConflicts === 0 &&
      g.r2ChartConsistencyErr < 1e-11 &&
      g.r3CoverConflicts === 0 &&
      g.r3CoverMissing === 0 &&
      g.r3OrientationConflicts === 0 &&
      g.r3ChartConsistencyErr < 1e-11 &&
      g.r3UnitOff < 1e-12 &&
      g.r3PairOff < 1e-12 &&
      g.dBallA === 1 &&
      g.dBallB === 1 &&
      Math.abs(g.initialSeparation - 2.0) < 1e-12 &&
      r.elapsedSeconds <= 10

    // Gate 1: True L3 two-body mutual gravitational attraction, action-reaction (1:1 & 1:3), and controls on R = 3
    const eq = p1.equalMass
    const uq = p1.unequalMass1to3
    const uqLin = p1.unequalMassLinearResponse
    const free = p1.controlFreeG0
    const rawS = p1.controlRawSchur
    const rawC = p1.controlRawCheeger

    const g1TwoBodyAttractionAndNewton3 =
      p1.dockMatrixUnitarityMaxErr <= 1e-13 &&
      p1.pairReciprocityMaxErr <= 1e-14 &&
      eq.frontierHits === 0 &&
      uq.frontierHits === 0 &&
      uqLin.frontierHits === 0 &&
      free.frontierHits === 0 &&
      rawS.frontierHits === 0 &&
      rawC.frontierHits === 0 &&
      eq.maxNormErr <= 1e-13 &&
      uq.maxNormErr <= 1e-13 &&
      eq.reversalErr2Beats <= 1e-13 &&
      uq.reversalErr2Beats <= 1e-13 &&
      // Mutual attraction strictly shrinks separation at both t = 1 and t = 2
      eq.deltaXA1 > 1e-3 &&
      eq.deltaXB1 < -1e-3 &&
      eq.deltaDAB1 < -2e-3 &&
      eq.deltaXA2 > eq.deltaXA1 &&
      eq.deltaXB2 < eq.deltaXB1 &&
      eq.deltaDAB2 < eq.deltaDAB1 &&
      eq.maxTransverseDrift <= 1e-12 &&
      // Equal-mass exact center-of-mass conservation
      Math.abs(eq.deltaXA1 + eq.deltaXB1) <= 1e-12 &&
      Math.abs(eq.deltaXA2 + eq.deltaXB2) <= 1e-12 &&
      // Unequal-mass (m_A = 1, m_B = 3) exact Newton's 3rd law (lighter lump shifts 3x farther)
      uq.deltaXA1 > 0 &&
      uq.deltaXB1 < 0 &&
      uq.deltaDAB2 < uq.deltaDAB1 &&
      uq.newton3RelErr1 <= 1e-12 &&
      Math.abs(uq.displacementRatio1 - 3.0) <= 1e-10 &&
      Math.abs(uq.displacementRatio2 - 3.0) <= 0.005 &&
      uqLin.newton3RelErr1 <= 1e-8 &&
      uqLin.newton3RelErr2 <= 1e-6 &&
      Math.abs(uqLin.displacementRatio2 - 3.0) <= 1e-5 &&
      // Negative controls: G = 0 null control & raw unwarped bulk > 100x collapse
      Math.abs(free.deltaXA1) <= 1e-13 &&
      Math.abs(free.deltaXB1) <= 1e-13 &&
      Math.abs(free.deltaXA2) <= 1e-13 &&
      Math.abs(free.deltaXB2) <= 1e-13 &&
      Math.abs(free.deltaDAB2) <= 1e-13 &&
      p1.rawSchurCollapseFactorBeat1 > 100 &&
      p1.rawSchurCollapseFactorBeat2 > 100 &&
      p1.rawCheegerCollapseFactorBeat1 > 100 &&
      p1.rawCheegerCollapseFactorBeat2 > 100

    // Gate 2: True L3 nonlinear event-horizon trapping + exact unitary information preservation on R = 3
    const sw0 = p2.sweep[0]! // chi = 0.0 (flat)
    const sw1 = p2.sweep[1]! // chi = 0.4 (weak)
    const sw2 = p2.sweep[2]! // chi = 0.75 (strong)
    const sw3 = p2.sweep[3]! // chi = 1.0 (horizon)
    const sw4 = p2.sweep[4]! // chi = 1.35 (trapped interior)

    const g2HorizonTrappingAndUnitarity =
      p2.dockMatrixUnitarityMaxErr <= 1e-13 &&
      p2.totalFrontierHits === 0 &&
      p2.strictlyMonotonicVRadial1 &&
      p2.strictlyMonotonicDeltaR1 &&
      p2.strictlyMonotonicDeltaR2 &&
      p2.maxRaySpeedDiscrepancy <= 1e-13 &&
      // Flat escape at c_u, monotonic slowdown, exact horizon stall at chi = 1.0, inward fall at chi = 1.35
      Math.abs(sw0.vRadial1 - r.constants.cUniversal) <= 1e-13 &&
      sw0.deltaR2 > 0.15 &&
      sw1.vRadial1 > 0.15 &&
      sw2.vRadial1 > 0.02 &&
      Math.abs(sw3.vRadial1) <= 1e-14 &&
      Math.abs(sw3.deltaR1) <= 1e-14 &&
      Math.abs(sw3.deltaR2) < 0.005 &&
      sw4.coinAngle2ThetaRad > Math.PI / 2 &&
      sw4.vRadial1 < -0.02 &&
      sw4.deltaR1 < -0.004 &&
      sw4.deltaR2 < -0.002 &&
      // Exact unitary information preservation across ALL chi including trapped interior chi = 1.35
      p2.worstNormErr <= 1e-13 &&
      p2.worstPurityErr <= 1e-13 &&
      p2.worstReversalErr <= 1e-13 &&
      p2.worstOrthogonalityErr <= 1e-13 &&
      p2.worstSuperpositionOrthErr <= 1e-13

    // Gate 3: Exact R = 2 vs R = 3 convergence, < 1% L3 <-> L2 weak-field match, and hardware scaling law
    const g3ConvergenceAndScaling =
      p3.r2VsR3Origin2BeatFrontierHits === 0 &&
      p3.r2VsR3Origin2BeatDiff <= 1e-14 &&
      p3.r2VsR3TwoBody1BeatFrontierHits === 0 &&
      p3.r2VsR3TwoBody1BeatDiff <= 1e-14 &&
      p3.r2VsR3Horizon1BeatFrontierHits === 0 &&
      p3.r2VsR3Horizon1BeatDiff <= 1e-14 &&
      p3.weakFieldMaxSpeedDiffVsExactL2 <= 1e-13 &&
      p3.weakFieldMaxRedshiftDiffVsExactL2 <= 1e-13 &&
      p3.l3WeakSpeedSlopeRelErr < 0.01 &&
      p3.l3WeakRedshiftSlopeRelErr < 0.01 &&
      p3.shellRatioS3OverS2 > 18 &&
      p3.docksAtR8LowerBound > 1e10 &&
      p3.docksAtR10LowerBound > 1e12

    const ok =
      g0GeometryAndConstants &&
      g1TwoBodyAttractionAndNewton3 &&
      g2HorizonTrappingAndUnitarity &&
      g3ConvergenceAndScaling

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Directly on the exact 4D {3,4,3,4} honeycomb balls (N_ball(0..3) = [${g.nBall0to3.join(', ')}], ` +
        `R = 3: ${g.r3Cells} docks / ${g.r3TotalSlots} slots, 0 cover/chart/orientation conflicts, 0 frontier hits everywhere, ` +
        `G_eff = ${r.constants.gEff.toFixed(8)}, c_u = ${r.constants.cUniversal.toFixed(10)}): ` +
        `(1) Live coupled two-body Strang-split reversible unitary evolution on R = 3 yields strict mutual attraction ` +
        `(Delta d_AB = ${eq.deltaDAB1.toFixed(6)} at t=1, ${eq.deltaDAB2.toFixed(6)} at t=2, Delta x_A = +${eq.deltaXA2.toFixed(6)}, ` +
        `Delta x_B = ${eq.deltaXB2.toFixed(6)}), exact equal-mass COM conservation (|Delta x_A + Delta x_B| = ` +
        `${Math.abs(eq.deltaXA2 + eq.deltaXB2).toExponential(2)}), unequal-mass (1:3) Newton 3rd law ` +
        `(Delta x_A / (-Delta x_B) = ${uq.displacementRatio1.toFixed(8)} at t=1 with rel err ${uq.newton3RelErr1.toExponential(2)}, ` +
        `${uq.displacementRatio2.toFixed(6)} at t=2, linear-response ${uqLin.displacementRatio2.toFixed(7)}), ` +
        `exact norm (${eq.maxNormErr.toExponential(2)}) and memoryless 2-beat U^dag reversal (${eq.reversalErr2Beats.toExponential(2)}), ` +
        `zero drift at G = 0 (${Math.abs(free.deltaDAB2).toExponential(2)}), and > 100x collapse in raw unwarped {3,4,3,4} bulk ` +
        `(${p1.rawSchurCollapseFactorBeat2.toFixed(1)}x raw Schur, ${p1.rawCheegerCollapseFactorBeat2.toFixed(1)}x Cheeger exp(-m_gap r)). ` +
        `(2) Nonlinear isotropic Schwarzschild unitary radial coin U_horizon(M) at dock 0 sweeps chi = r_H / r_0 = r_s / (4 r_0) ` +
        `across {0.0, 0.4, 0.75, 1.0, 1.35} on R = 3 (0 frontier hits), slowing strictly monotonically from v_r(0) = +${sw0.vRadial1.toFixed(6)} ` +
        `(= c_u) through v_r(0.4) = +${sw1.vRadial1.toFixed(6)} and v_r(0.75) = +${sw2.vRadial1.toFixed(6)} to exact horizon stall ` +
        `v_r(1.0) = ${sw3.vRadial1.toFixed(6)} and inward trapped fall v_r(1.35) = ${sw4.vRadial1.toFixed(6)} (Delta r_2 = ${sw4.deltaR2.toFixed(6)} < 0, ` +
        `2*theta = ${sw4.coinAngle2ThetaRad.toFixed(4)} > pi/2), while proving exact unitary information preservation behind the horizon ` +
        `(norm err ${p2.worstNormErr.toExponential(2)}, purity err ${p2.worstPurityErr.toExponential(2)}, memoryless U^dag reversal ` +
        `${p2.worstReversalErr.toExponential(2)}, orthogonality |<psi_1|psi_2>| = ${p2.worstOrthogonalityErr.toExponential(2)}). ` +
        `(3) Exact R = 2 vs R = 3 agreement inside the shared causal window is ${p3.r2VsR3Origin2BeatDiff.toExponential(2)} (origin 2-beat) ` +
        `and ${p3.r2VsR3TwoBody1BeatDiff.toExponential(2)} (two-body 1-beat), L3 weak-field radial speed and redshift slopes match E-GRV-0160 L2 ` +
        `to ${(100 * p3.l3WeakSpeedSlopeRelErr).toFixed(3)}% and ${(100 * p3.l3WeakRedshiftSlopeRelErr).toFixed(3)}% (exact nonlinear match ` +
        `${p3.weakFieldMaxSpeedDiffVsExactL2.toExponential(2)}), and N_ball(R) ~ 18^R scaling certifies > ${p3.docksAtR8LowerBound.toExponential(2)} ` +
        `docks at R = 8 for unfactored multi-orbit mergers`,
      metrics: {
        g0GeometryAndConstants: g0GeometryAndConstants ? 1 : 0,
        g1TwoBodyAttractionAndNewton3: g1TwoBodyAttractionAndNewton3 ? 1 : 0,
        g2HorizonTrappingAndUnitarity: g2HorizonTrappingAndUnitarity ? 1 : 0,
        g3ConvergenceAndScaling: g3ConvergenceAndScaling ? 1 : 0,
        elapsedSeconds: r.elapsedSeconds,
        kEff: r.constants.kEff,
        gEff: r.constants.gEff,
        cUniversal: r.constants.cUniversal,
        rawBulkMGap: r.constants.rawBulkMGap,
        // Geometry
        nBallR0: g.nBall0to3[0],
        nBallR1: g.nBall0to3[1],
        nBallR2: g.nBall0to3[2],
        nBallR3: g.nBall0to3[3],
        r2Slots: g.r2TotalSlots,
        r3Slots: g.r3TotalSlots,
        r2CoverConflicts: g.r2CoverConflicts,
        r3CoverConflicts: g.r3CoverConflicts,
        r3ChartConsistencyErr: g.r3ChartConsistencyErr,
        // Part 1: Two-Body L3 Attraction & Newton 3rd Law
        p1DockMatrixUnitarityMaxErr: p1.dockMatrixUnitarityMaxErr,
        p1PairReciprocityMaxErr: p1.pairReciprocityMaxErr,
        p1EqualFrontierHits: eq.frontierHits,
        p1EqualMaxNormErr: eq.maxNormErr,
        p1EqualReversalErr2Beats: eq.reversalErr2Beats,
        p1EqualDeltaXA1: eq.deltaXA1,
        p1EqualDeltaXB1: eq.deltaXB1,
        p1EqualDeltaDAB1: eq.deltaDAB1,
        p1EqualDeltaXA2: eq.deltaXA2,
        p1EqualDeltaXB2: eq.deltaXB2,
        p1EqualDeltaDAB2: eq.deltaDAB2,
        p1EqualComShift2: eq.comShift2,
        p1EqualMaxTransverseDrift: eq.maxTransverseDrift,
        p1EqualActiveDocksBeat2: eq.activeDocksBeat2,
        p1UnequalFrontierHits: uq.frontierHits,
        p1UnequalMaxNormErr: uq.maxNormErr,
        p1UnequalReversalErr2Beats: uq.reversalErr2Beats,
        p1UnequalDeltaXA1: uq.deltaXA1,
        p1UnequalDeltaXB1: uq.deltaXB1,
        p1UnequalRatio1: uq.displacementRatio1,
        p1UnequalNewton3RelErr1: uq.newton3RelErr1,
        p1UnequalDeltaXA2: uq.deltaXA2,
        p1UnequalDeltaXB2: uq.deltaXB2,
        p1UnequalRatio2: uq.displacementRatio2,
        p1UnequalLinearRatio2: uqLin.displacementRatio2,
        p1UnequalLinearNewton3RelErr2: uqLin.newton3RelErr2,
        // Part 2: Horizon Trapping & Unitary Information Preservation
        p2DockMatrixUnitarityMaxErr: p2.dockMatrixUnitarityMaxErr,
        p2TotalFrontierHits: p2.totalFrontierHits,
        p2MaxRaySpeedDiscrepancy: p2.maxRaySpeedDiscrepancy,
        p2VRadialFlat: sw0.vRadial1,
        p2VRadialChi040: sw1.vRadial1,
        p2VRadialChi075: sw2.vRadial1,
        p2VRadialChi100: sw3.vRadial1,
        p2VRadialChi135: sw4.vRadial1,
        p2DeltaR2Flat: sw0.deltaR2,
        p2DeltaR2Chi040: sw1.deltaR2,
        p2DeltaR2Chi075: sw2.deltaR2,
        p2DeltaR2Chi100: sw3.deltaR2,
        p2DeltaR2Chi135: sw4.deltaR2,
        p2CoinAngle2ThetaChi135: sw4.coinAngle2ThetaRad,
        p2WorstNormErr: p2.worstNormErr,
        p2WorstPurityErr: p2.worstPurityErr,
        p2WorstReversalErr: p2.worstReversalErr,
        p2WorstOrthogonalityErr: p2.worstOrthogonalityErr,
        p2WorstSuperpositionOrthErr: p2.worstSuperpositionOrthErr,
        // Part 3: Convergence, Weak-Field Bridge & Hardware Scaling
        p3R2VsR3Origin2BeatDiff: p3.r2VsR3Origin2BeatDiff,
        p3R2VsR3Origin2BeatFrontierHits: p3.r2VsR3Origin2BeatFrontierHits,
        p3R2VsR3TwoBody1BeatDiff: p3.r2VsR3TwoBody1BeatDiff,
        p3R2VsR3TwoBody1BeatFrontierHits: p3.r2VsR3TwoBody1BeatFrontierHits,
        p3R2VsR3Horizon1BeatDiff: p3.r2VsR3Horizon1BeatDiff,
        p3R2VsR3Horizon1BeatFrontierHits: p3.r2VsR3Horizon1BeatFrontierHits,
        p3WeakFieldMaxSpeedDiffVsExactL2: p3.weakFieldMaxSpeedDiffVsExactL2,
        p3WeakFieldMaxRedshiftDiffVsExactL2: p3.weakFieldMaxRedshiftDiffVsExactL2,
        p3L3WeakSpeedSlope: p3.l3WeakSpeedSlope,
        p3L3WeakSpeedSlopeRelErr: p3.l3WeakSpeedSlopeRelErr,
        p3L3WeakRedshiftSlope: p3.l3WeakRedshiftSlope,
        p3L3WeakRedshiftSlopeRelErr: p3.l3WeakRedshiftSlopeRelErr,
        p3ShellRatioS2OverS1: p3.shellRatioS2OverS1,
        p3ShellRatioS3OverS2: p3.shellRatioS3OverS2,
        p3AsymptoticShellRatio: p3.asymptoticShellRatio,
        p3DocksAtR8LowerBound: p3.docksAtR8LowerBound,
        p3DocksAtR10LowerBound: p3.docksAtR10LowerBound,
      },
      control: {
        p1FreeG0DeltaXA2: free.deltaXA2,
        p1FreeG0DeltaXB2: free.deltaXB2,
        p1FreeG0DeltaDAB2: free.deltaDAB2,
        p1FreeG0FrontierHits: free.frontierHits,
        p1RawSchurDeltaDAB1: rawS.deltaDAB1,
        p1RawSchurDeltaDAB2: rawS.deltaDAB2,
        p1RawSchurCollapseFactorBeat1: p1.rawSchurCollapseFactorBeat1,
        p1RawSchurCollapseFactorBeat2: p1.rawSchurCollapseFactorBeat2,
        p1RawCheegerDeltaDAB1: rawC.deltaDAB1,
        p1RawCheegerDeltaDAB2: rawC.deltaDAB2,
        p1RawCheegerCollapseFactorBeat1: p1.rawCheegerCollapseFactorBeat1,
        p1RawCheegerCollapseFactorBeat2: p1.rawCheegerCollapseFactorBeat2,
        p2FlatHuskVRadial1: sw0.huskVRadial1,
        p2HorizonHuskVRadial1: sw3.huskVRadial1,
        p2InteriorHuskVRadial1: sw4.huskVRadial1,
      },
      notes:
        'Part 1 runs coupled two-body Strang-split reversible unitary evolution U_2body = V_half * S_4D * V_half directly on the exact 8,857-dock (212,568-slot) R = 3 4D {3,4,3,4} honeycomb ball from symmetric d_ball = 1 cusp-husk docks d_A = (-1, 0, 0) and d_B = (+1, 0, 0) with 0 frontier hits through t = 1..2. Because V_half is strictly dock-local unitary on all 12 opposite-displacement pairs of each dock, dock densities rho_A and rho_B are identically invariant across each kick, guaranteeing strict norm preservation and exact memoryless time-reversal U_2body^dag without storing potential history. Part 2 encodes E-GRV-0160 nonlinear isotropic Schwarzschild lapse alpha(r) = (1 - r_s/(4r))/(1 + r_s/(4r)) and conformal factor psi(r) = 1 + r_s/(4r) via local SU(2) radial coins cos(2 theta) = c_u (1 - u_rad^2) + u_rad^2 c_rad(r) across all 8,857 docks, demonstrating monotonic light-cone tipping from flat escape at c_u through exact stalling at the isotropic horizon chi = r_H/r_0 = 1.0 to inward fall inside the trapped surface chi = 1.35 while preserving global norm, pure-state purity, memoryless reversibility, and inner products of orthogonal states to <= 1e-13. Part 3 verifies zero boundary contamination between R = 2 and R = 3 inside the shared causal window, < 1% weak-field slope match to E-GRV-0160, and the exact N_ball(0..3) = [1, 25, 481, 8857] ~ 18^R hardware scaling boundary for unfactored multi-orbit L3 mergers.',
    })
  },
})
