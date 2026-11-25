// E-GRV-0163: EXACT BigInt R = INFINITY {3,4,3,4} HONEYCOMB QUANTUM WALK WITH Z[w][1/2]
// GATE COMPILATION ON PRESCRIBED HARTREE TWO-BODY AND GULLSTRAND-PAINLEVE HORIZON BACKGROUNDS.
//
// Depth L2: prescribed background-field / Hartree mean-field encoding (NOT emergent GR from a bare QCA).
// Combines an on-the-fly R = infinity exact SO(4,1; Z[sqrt(2)]) {3,4,3,4} honeycomb neighbor engine
// (zero outer boundary, 0 frontier hits through t = 4, 5 using a constant flat coin, exact BigInt
// Busemann-level graph depth beyond floor = 3) with exact BigInt Z[w][1/2] SU(2) gate compilation
// over {W_1, W_1^dag, W_2, W_2^dag} (< 1e-3 operator norm, 0n det and unitarity residuals) and exact
// BigInt Z[w][1/2] multi-slot quantum walk evolution (external force/angle lookup is Float64):
//   1. Exact 100% isomorphism of InfiniteHoneycomb with coverBall(2) (481 docks) and coverBall(3)
//      (8,857 docks), exact algebraic involutive adjacency step(step(d, s), opp(s)) === d, exact
//      Busemann-level depth verification on B_3 and beyond floor = 3 (stepping up from depth = 4
//      returns 3, never 5), and sparse constant-flat-coin evolution beyond R = 3 to r = 4, 5.
//   2. Exact BigInt Z[w][1/2] gate compilation of prescribed Hartree two-body coins (1:1 and 1:3)
//      and all 5 horizon-penetrating Gullstrand-Painleve coins (r_s / r_0 in {0.00, 0.25, 0.64,
//      1.00, 1.44}) to < 1e-3 operator norm with 0n BigInt det and unitarity residuals.
//   3. Hartree two-body mutual attraction and action-reaction (1:1 and 1:3 matching Float64 ref to
//      < 1%, 0n mirror weight difference, 0n norm error, 0 diff-slot reversal, 0 drift at G = 0)
//      and genuine exact bijective Gullstrand-Painleve split-step QCA sweep (U_b = S_river^{m_b} * S_light * W(theta_cU),
//      r = r_areal, verifying BOTH orthogonal polarizations rayAOut AND rayAIn: symmetric flat +-c_u,
//      redshifted exterior with |v_in| > |v_out|, exact horizon freeze |v_out| < 5e-3 while v_in < -1.0
//      never stalls, and genuine trapped interior r_areal = 0.6944 r_s < r_s where BOTH v_out < 0 AND v_in < 0),
//      with 0n single-particle norm, 0 reversal diff slots, and (0n, 0n) orthogonality <rayAOut | rayAIn> = 0
//      at EVERY beat (unitary walk certificate, NOT Hawking evaporation or Page-curve entropy).
// Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runExactTernaryInfiniteHoneycomb } from '@/code/measure/exact-ternary-l3-infinite-honeycomb'

export default experiment({
  id: 'gravity/exact-ternary-l3-infinite-honeycomb',
  code: 'E-GRV-0163',
  title:
    'Exact BigInt R = infinity {3,4,3,4} honeycomb quantum walk with Z[w][1/2] gate compilation on prescribed Hartree two-body and bijective Gullstrand-Painleve split-step horizon backgrounds (L2)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = runExactTernaryInfiniteHoneycomb()
    const p1 = r.part1InfiniteHoneycomb
    const p2 = r.part2Synthesis
    const tb = r.part3TwoBody
    const hor = r.part3Horizon
    const cr = r.part3CrossRadiusControls

    // Gate 0: Exact Z[sqrt(2)] on-the-fly R = infinity isomorphism, GR-8 Busemann depth, and beyond R = 3
    const g0InfiniteHoneycombAndBeyondR3 =
      p1.nBall0to3[0] === 1 &&
      p1.nBall0to3[1] === 25 &&
      p1.nBall0to3[2] === 481 &&
      p1.nBall0to3[3] === 8857 &&
      p1.r2BijectionMissing === 0 &&
      p1.r2BijectionMismatches === 0 &&
      p1.r3BijectionMissing === 0 &&
      p1.r3BijectionMismatches === 0 &&
      p1.inconsistentSteps === 0 &&
      p1.involutiveEdgesChecked > 10000 &&
      p1.involutiveEdgeFailures === 0 &&
      p1.b3BusemannDepthMismatches === 0 &&
      p1.beyondR3DepthLipschitzFailures === 0 &&
      p1.beyondR3DepthZeroLevelFailures === 0 &&
      p1.beyondR3Depth4StepUpTo3Checks > 0 &&
      p1.beyondR3Depth4StepUpWrongDepthCount === 0 &&
      p1.beyondR3T4ReachedExactRadius4Count > 0 &&
      p1.beyondR3T4InfiniteFrontierHits === 0 &&
      p1.beyondR3T4StaticR3FrontierHits > 0 &&
      p1.beyondR3T5ReachedExactRadius5Count > 0 &&
      p1.beyondR3T5InfiniteFrontierHits === 0 &&
      p1.beyondR3T5StaticR3FrontierHits > 0 &&
      p1.beyondR3T5VisitedDocks < 5000 &&
      p1.beyondR3T5ExactBigIntNormErr === 0n &&
      p1.beyondR3T5ExactBigIntReversalDiffSlots === 0 &&
      r.elapsedSeconds <= 8

    // Gate 1: Exact BigInt Z[w][1/2] SU(2) gate compilation (< 1e-3 op norm, 0n det & unitarity residuals)
    const g1ExactBigIntSynthesis =
      p2.allGeneratorsExactSU2 &&
      p2.allCoinsExactSU2 &&
      p2.maxDetResidual === 0n &&
      p2.maxUnitarityResidual === 0n &&
      p2.maxOpDistAllCoins < 1e-3 &&
      p2.horizonCoins.length === 5 &&
      p2.gravityCoins.length >= 2

    // Gate 2: Prescribed Hartree two-body mutual attraction, action-reaction, exact 0n norm/reversal/symmetry & G = 0
    const eq = tb.equalMass
    const uq = tb.unequalMass1to3
    const g0 = tb.controlFreeG0

    const g2ExactBigIntTwoBody =
      eq.frontierHits === 0 &&
      uq.frontierHits === 0 &&
      g0.frontierHits === 0 &&
      eq.exactBigIntNormErrMax === 0n &&
      uq.exactBigIntNormErrMax === 0n &&
      g0.exactBigIntNormErrMax === 0n &&
      eq.exactBigIntReversalDiffSlots === 0 &&
      uq.exactBigIntReversalDiffSlots === 0 &&
      g0.exactBigIntReversalDiffSlots === 0 &&
      // Mutual attraction strictly shrinks separation at t = 1 and t = 2
      eq.deltaXA1 > 1e-3 &&
      eq.deltaXB1 < -1e-3 &&
      eq.deltaDAB1 < -2e-3 &&
      eq.deltaXA2 > eq.deltaXA1 &&
      eq.deltaXB2 < eq.deltaXB1 &&
      eq.deltaDAB2 < eq.deltaDAB1 &&
      // Exact equal-mass symmetry: 0n BigInt mirror weight difference & <= 1e-14 readout COM sum
      eq.exactBigIntSymmetricWeightMaxDiff === 0n &&
      eq.comSum2 <= 1e-14 &&
      eq.maxTransverseDrift <= 1e-14 &&
      // Unequal-mass 1:3 action-reaction matching Float64 reference within < 1%
      uq.deltaXA1 > 0 &&
      uq.deltaXB1 < 0 &&
      uq.deltaDAB2 < uq.deltaDAB1 &&
      Math.abs(uq.displacementRatio1 - 3.0) < 0.01 &&
      Math.abs(uq.displacementRatio2 - 3.0) < 0.01 &&
      eq.relErrVsFloatRefBeat1 < 0.01 &&
      eq.relErrVsFloatRefBeat2 < 0.01 &&
      uq.relErrVsFloatRefBeat1 < 0.01 &&
      uq.relErrVsFloatRefBeat2 < 0.01 &&
      // Negative control: G = 0 exact zero drift
      g0.deltaXA1 === 0 &&
      g0.deltaXB1 === 0 &&
      g0.deltaDAB1 === 0 &&
      g0.deltaXA2 === 0 &&
      g0.deltaXB2 === 0 &&
      g0.deltaDAB2 === 0

    // Gate 3: Genuine exact bijective Gullstrand-Painleve split-step QCA sweep verifying BOTH orthogonal
    // polarizations (rayAOut AND rayAIn) through flat, exterior, event horizon, and trapped interior
    // (r_areal = 0.6944 r_s < r_s where BOTH v_out < 0 AND v_in < 0), plus exact 0n norm, reversal,
    // beat-by-beat (0n, 0n) orthogonality, and cross-radius convergence controls.
    const sw0 = hor.sweep[0]! // r_s / r_0 = 0.00 (flat)
    const sw1 = hor.sweep[1]! // r_s / r_0 = 0.25 (r_areal = 4.0 r_s)
    const sw2 = hor.sweep[2]! // r_s / r_0 = 0.64 (r_areal = 1.5625 r_s)
    const sw3 = hor.sweep[3]! // r_s / r_0 = 1.00 (r_areal = 1.0 r_s, exact event horizon)
    const sw4 = hor.sweep[4]! // r_s / r_0 = 1.44 (r_areal = 0.6944 r_s < r_s, genuine trapped interior)

    const g3ExactBigIntHorizonAndControls =
      hor.totalFrontierHits === 0 &&
      hor.strictlyMonotonicVOut &&
      hor.strictlyMonotonicVIn &&
      hor.strictlyMonotonicDeltaROut &&
      hor.strictlyMonotonicDeltaRIn &&
      Math.abs(sw1.rArealOverRs - 4.0) < 1e-12 &&
      Math.abs(sw2.rArealOverRs - 1.5625) < 1e-12 &&
      Math.abs(sw3.rArealOverRs - 1.0) < 1e-12 &&
      sw4.rArealOverRs < 0.7 &&
      Math.abs(sw4.rArealOverRs - 1 / 1.44) < 1e-12 &&
      // Flat: exact symmetric +-c_u
      sw0.vOut > 0.9 &&
      sw0.vIn < -0.9 &&
      Math.abs(sw0.vOut + sw0.vIn) < 1e-3 &&
      // Exterior: outgoing escapes redshifted (vOut > 0), ingoing falls faster inward (|vIn| > |vOut|)
      sw1.vOut > 0.45 &&
      sw1.vIn < -1.4 &&
      Math.abs(sw1.vIn) > sw1.vOut &&
      sw2.vOut > 0.15 &&
      sw2.vIn < -1.7 &&
      Math.abs(sw2.vIn) > sw2.vOut &&
      // Event horizon (r_s / r_0 = 1.00): outgoing ray freezes (|vOut| < 5e-3) while ingoing ray falls swiftly inward (vIn < -1.0)
      Math.abs(sw3.vOut) < 5e-3 &&
      sw3.vIn < -1.0 &&
      // Genuine trapped interior (r_s / r_0 = 1.44, r_areal = 0.6944 r_s < r_s): BOTH orthogonal null rays fall strictly inward!
      sw4.vOut < -0.15 &&
      sw4.vIn < -2.0 &&
      sw4.deltaROut < -5 &&
      sw4.deltaRIn < -90 &&
      // Tight match against Float64 split-step GP reference & continuum GP c_out/c_in
      hor.maxVOutDiffVsRef < 1e-2 &&
      hor.maxVInDiffVsRef < 1e-2 &&
      hor.maxVOutDiffVsContinuumGP < 1e-2 &&
      hor.maxVInDiffVsContinuumGP < 1e-2 &&
      // Pure exact BigInt unitarity, memoryless U^dag reversal, and beat-by-beat (0n, 0n) orthogonality
      hor.worstExactBigIntNormErr === 0n &&
      hor.worstExactBigIntReversalDiffSlots === 0 &&
      hor.allProbesExactBigIntOrthogonal &&
      hor.allBeatsInOutExactBigIntOrthogonal &&
      // Exact 0-diff-slot equivalence across R = 2, R = 3, and R = infinity inside shared causal window
      cr.sharedWindowFrontierHits === 0 &&
      cr.r2VsR3VsInfOrigin2BeatDiffSlots === 0 &&
      cr.r2VsR3VsInfHorizon1BeatDiffSlots === 0 &&
      cr.r2VsR3VsInfTwoBody1BeatDiffSlots === 0

    const ok =
      g0InfiniteHoneycombAndBeyondR3 &&
      g1ExactBigIntSynthesis &&
      g2ExactBigIntTwoBody &&
      g3ExactBigIntHorizonAndControls

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `L2 exact BigInt R = infinity {3,4,3,4} honeycomb quantum walk with Z[w][1/2] gate compilation on prescribed ` +
        `Hartree two-body and bijective Gullstrand-Painleve split-step horizon backgrounds (${r.elapsedSeconds.toFixed(2)}s, not emergent GR, ` +
        `external force/angle lookup is Float64, canonical single-face [1, 4, 20, 100] K_eff = ${r.constants.kEff.toFixed(8)}, ` +
        `G_eff = ${r.constants.gEff.toFixed(8)}, c_u = ${r.constants.cUniversal.toFixed(8)}): ` +
        `(1) InfiniteHoneycomb matches coverBall(0..3) = [${p1.nBall0to3.join(', ')}] with 0 missing, 0 mismatches, ` +
        `0 inconsistent steps, ${p1.involutiveEdgesChecked} algebraic Z[sqrt(2)] involutive edges (0 failures), ` +
        `Busemann-level descent empirically verified 0/8,857 on B_3 (${p1.b3BusemannDepthMismatches} mismatches) ` +
        `plus ${p1.beyondR3Depth4StepUpTo3Checks} depth-4->3 step-up checks (${p1.beyondR3Depth4StepUpWrongDepthCount} wrong depths, ` +
        `${p1.beyondR3DepthLipschitzFailures} Lipschitz failures; not a general arbitrary-depth proof), ` +
        `and evolves a constant-flat-coin wavepacket beyond R = 3 to r = 4 (t = 4, ${p1.beyondR3T4ReachedExactRadius4Count} docks) ` +
        `and r = 5 (t = 5, ${p1.beyondR3T5ReachedExactRadius5Count} docks, max cosh d_H4 = ${p1.beyondR3T5MaxHyperbolicCosh.toFixed(2)}) ` +
        `using ${p1.beyondR3T5VisitedDocks} sparse visited docks with 0 frontier hits (static R = 3 hits its frontier ` +
        `${p1.beyondR3T4StaticR3FrontierHits} times at t = 4 and ${p1.beyondR3T5StaticR3FrontierHits} at t = 5), ` +
        `0n norm error, and 0 reversal diff slots. ` +
        `(2) All prescribed gravity and Equivalence-Principle GP local SU(2) coins compile into exact Z[w][1/2] words over ` +
        `{W1, W1^dag, W2, W2^dag} to max operator norm ${p2.maxOpDistAllCoins.toExponential(2)} (< 1e-3) with 0n det and unitarity residuals. ` +
        `(3) Prescribed Hartree two-body walk yields mutual attraction (1:1 Delta d_AB = ${eq.deltaDAB1.toFixed(6)} at t=1, ` +
        `${eq.deltaDAB2.toFixed(6)} at t=2, matching Float64 ref to ${(100 * eq.relErrVsFloatRefBeat2).toFixed(3)}%), ` +
        `0n BigInt mirror weight symmetry (|Delta x_A + Delta x_B| = ${eq.comSum2.toExponential(2)}), ` +
        `1:3 action-reaction ratio ${uq.displacementRatio1.toFixed(5)} (t=1) / ${uq.displacementRatio2.toFixed(5)} (t=2) ` +
        `(matching Float64 ref to ${(100 * uq.relErrVsFloatRefBeat2).toFixed(3)}%), exact 0 drift at G = 0, ` +
        `0n norm error, and 0 reversal diff slots. ` +
        `(4) Genuine bijective Gullstrand-Painleve split-step QCA (P = ${hor.riverPeriodP} beats, S_river^{m_b} * S_light * W(theta_cU)) ` +
        `across r_s / r_0 in {0.00, 0.25, 0.64, 1.00, 1.44} (r_areal / r_s = [inf, ${sw1.rArealOverRs.toFixed(4)}, ` +
        `${sw2.rArealOverRs.toFixed(4)}, ${sw3.rArealOverRs.toFixed(4)}, ${sw4.rArealOverRs.toFixed(4)}]) tracks BOTH orthogonal ` +
        `null polarizations: flat (+${sw0.vOut.toFixed(5)}, ${sw0.vIn.toFixed(5)}), exterior 0.25 (+${sw1.vOut.toFixed(5)}, ${sw1.vIn.toFixed(5)}), ` +
        `exterior 0.64 (+${sw2.vOut.toFixed(5)}, ${sw2.vIn.toFixed(5)}), event horizon 1.00 (v_out = ${sw3.vOut.toFixed(5)} freeze, ` +
        `v_in = ${sw3.vIn.toFixed(5)} swift infall), and genuine trapped interior 1.44 (r_areal = ${sw4.rArealOverRs.toFixed(4)} r_s < r_s: ` +
        `BOTH v_out = ${sw4.vOut.toFixed(5)} < 0 AND v_in = ${sw4.vIn.toFixed(5)} < 0, max diff vs Float64 GP ref ` +
        `${Math.max(hor.maxVOutDiffVsRef, hor.maxVInDiffVsRef).toExponential(2)}, vs continuum GP ` +
        `${Math.max(hor.maxVOutDiffVsContinuumGP, hor.maxVInDiffVsContinuumGP).toExponential(2)}), with 0n norm error, ` +
        `0 reversal diff slots on both polarizations, and (0n, 0n) orthogonality at every beat ` +
        `(unitary walk certificate, not Hawking evaporation or Page-curve entropy)`,
      metrics: {
        g0InfiniteHoneycombAndBeyondR3: g0InfiniteHoneycombAndBeyondR3 ? 1 : 0,
        g1ExactBigIntSynthesis: g1ExactBigIntSynthesis ? 1 : 0,
        g2ExactBigIntTwoBody: g2ExactBigIntTwoBody ? 1 : 0,
        g3ExactBigIntHorizonAndControls: g3ExactBigIntHorizonAndControls ? 1 : 0,
        elapsedSeconds: r.elapsedSeconds,
        kEff: r.constants.kEff,
        gEff: r.constants.gEff,
        cUniversal: r.constants.cUniversal,
        // Part 1: On-the-fly R = infinity engine, GR-8 Busemann depth & beyond R = 3
        nBallR0: p1.nBall0to3[0],
        nBallR1: p1.nBall0to3[1],
        nBallR2: p1.nBall0to3[2],
        nBallR3: p1.nBall0to3[3],
        r2BijectionMissing: p1.r2BijectionMissing,
        r2BijectionMismatches: p1.r2BijectionMismatches,
        r3BijectionMissing: p1.r3BijectionMissing,
        r3BijectionMismatches: p1.r3BijectionMismatches,
        inconsistentSteps: p1.inconsistentSteps,
        involutiveEdgesChecked: p1.involutiveEdgesChecked,
        involutiveEdgeFailures: p1.involutiveEdgeFailures,
        b3BusemannDepthMismatches: p1.b3BusemannDepthMismatches,
        beyondR3DepthLipschitzFailures: p1.beyondR3DepthLipschitzFailures,
        beyondR3DepthZeroLevelFailures: p1.beyondR3DepthZeroLevelFailures,
        beyondR3Depth4StepUpTo3Checks: p1.beyondR3Depth4StepUpTo3Checks,
        beyondR3Depth4StepUpWrongDepthCount: p1.beyondR3Depth4StepUpWrongDepthCount,
        beyondR3T4ActiveDocks: p1.beyondR3T4ActiveDocks,
        beyondR3T4VisitedDocks: p1.beyondR3T4VisitedDocks,
        beyondR3T4ExactRadius4Docks: p1.beyondR3T4ReachedExactRadius4Count,
        beyondR3T4InfFrontierHits: p1.beyondR3T4InfiniteFrontierHits,
        beyondR3T5ActiveDocks: p1.beyondR3T5ActiveDocks,
        beyondR3T5VisitedDocks: p1.beyondR3T5VisitedDocks,
        beyondR3T5ExactRadius5Docks: p1.beyondR3T5ReachedExactRadius5Count,
        beyondR3T5InfFrontierHits: p1.beyondR3T5InfiniteFrontierHits,
        beyondR3T5ExactNormErr: Number(p1.beyondR3T5ExactBigIntNormErr),
        beyondR3T5ExactRevDiffSlots: p1.beyondR3T5ExactBigIntReversalDiffSlots,
        beyondR3T5MaxHyperbolicCosh: p1.beyondR3T5MaxHyperbolicCosh,
        // Part 2: Exact BigInt Z[w][1/2] synthesis
        p2AllGeneratorsExactSU2: p2.allGeneratorsExactSU2 ? 1 : 0,
        p2AllCoinsExactSU2: p2.allCoinsExactSU2 ? 1 : 0,
        p2MitmHalfDepth: p2.mitmHalfDepth,
        p2MitmTreeNodes: p2.mitmTreeNodes,
        p2MaxDetResidual: Number(p2.maxDetResidual),
        p2MaxUnitarityResidual: Number(p2.maxUnitarityResidual),
        p2MaxOpDistAllCoins: p2.maxOpDistAllCoins,
        // Part 3A: Exact BigInt two-body Hartree walk
        tbEqualFrontierHits: eq.frontierHits,
        tbEqualVisitedDocks: eq.visitedDocksOnInfinite,
        tbEqualDeltaXA1: eq.deltaXA1,
        tbEqualDeltaXB1: eq.deltaXB1,
        tbEqualDeltaDAB1: eq.deltaDAB1,
        tbEqualDeltaXA2: eq.deltaXA2,
        tbEqualDeltaXB2: eq.deltaXB2,
        tbEqualDeltaDAB2: eq.deltaDAB2,
        tbEqualComSum2: eq.comSum2,
        tbEqualExactMirrorWeightDiff: Number(eq.exactBigIntSymmetricWeightMaxDiff),
        tbEqualRelErrVsFloatRef2: eq.relErrVsFloatRefBeat2,
        tbEqualExactNormErr: Number(eq.exactBigIntNormErrMax),
        tbEqualExactRevDiffSlots: eq.exactBigIntReversalDiffSlots,
        tbEqualFinalDenomPow2: eq.finalDenomPowBeat2,
        tbUnequalFrontierHits: uq.frontierHits,
        tbUnequalVisitedDocks: uq.visitedDocksOnInfinite,
        tbUnequalDeltaXA1: uq.deltaXA1,
        tbUnequalDeltaXB1: uq.deltaXB1,
        tbUnequalDeltaDAB2: uq.deltaDAB2,
        tbUnequalRatio1: uq.displacementRatio1,
        tbUnequalRatio2: uq.displacementRatio2,
        tbUnequalRelErrVsFloatRef1: uq.relErrVsFloatRefBeat1,
        tbUnequalRelErrVsFloatRef2: uq.relErrVsFloatRefBeat2,
        tbUnequalExactNormErr: Number(uq.exactBigIntNormErrMax),
        tbUnequalExactRevDiffSlots: uq.exactBigIntReversalDiffSlots,
        // Part 3B: Genuine bijective Gullstrand-Painleve split-step QCA sweep (BOTH out and in polarizations)
        horTotalFrontierHits: hor.totalFrontierHits,
        horRiverPeriodP: hor.riverPeriodP,
        horRArealOverRsWeak025: sw1.rArealOverRs,
        horRArealOverRsStrong064: sw2.rArealOverRs,
        horRArealOverRsHorizon100: sw3.rArealOverRs,
        horRArealOverRsInterior144: sw4.rArealOverRs,
        horVOutFlat: sw0.vOut,
        horVInFlat: sw0.vIn,
        horVOutRs025: sw1.vOut,
        horVInRs025: sw1.vIn,
        horVOutRs064: sw2.vOut,
        horVInRs064: sw2.vIn,
        horVOutRs100: sw3.vOut,
        horVInRs100: sw3.vIn,
        horVOutRs144: sw4.vOut,
        horVInRs144: sw4.vIn,
        horDeltaROutRs144: sw4.deltaROut,
        horDeltaRInRs144: sw4.deltaRIn,
        horMaxVOutDiffVsRef: hor.maxVOutDiffVsRef,
        horMaxVInDiffVsRef: hor.maxVInDiffVsRef,
        horMaxVOutDiffVsContinuumGP: hor.maxVOutDiffVsContinuumGP,
        horMaxVInDiffVsContinuumGP: hor.maxVInDiffVsContinuumGP,
        horWorstExactNormErr: Number(hor.worstExactBigIntNormErr),
        horWorstExactRevDiffSlots: hor.worstExactBigIntReversalDiffSlots,
        horAllProbesExactOrthogonal: hor.allProbesExactBigIntOrthogonal ? 1 : 0,
        horAllBeatsInOutExactOrthogonal: hor.allBeatsInOutExactBigIntOrthogonal ? 1 : 0,
        horInterior144InnerInA0: Number(sw4.exactBigIntInnerInA[0]),
        horInterior144InnerInA1: Number(sw4.exactBigIntInnerInA[1]),
        horInterior144InnerSup0: Number(sw4.exactBigIntInnerSup[0]),
        horInterior144InnerSup1: Number(sw4.exactBigIntInnerSup[1]),
        // Cross-radius R = 2 vs R = 3 vs R = infinity exact convergence
        crSharedWindowFrontierHits: cr.sharedWindowFrontierHits,
        crOrigin2BeatDiffSlots: cr.r2VsR3VsInfOrigin2BeatDiffSlots,
        crHorizon1BeatDiffSlots: cr.r2VsR3VsInfHorizon1BeatDiffSlots,
        crTwoBody1BeatDiffSlots: cr.r2VsR3VsInfTwoBody1BeatDiffSlots,
      },
      control: {
        tbFreeG0DeltaXA1: g0.deltaXA1,
        tbFreeG0DeltaXB1: g0.deltaXB1,
        tbFreeG0DeltaDAB1: g0.deltaDAB1,
        tbFreeG0DeltaXA2: g0.deltaXA2,
        tbFreeG0DeltaXB2: g0.deltaXB2,
        tbFreeG0DeltaDAB2: g0.deltaDAB2,
        tbFreeG0ExactNormErr: Number(g0.exactBigIntNormErrMax),
        tbFreeG0ExactRevDiffSlots: g0.exactBigIntReversalDiffSlots,
        beyondR3T4StaticR3FrontierHits: p1.beyondR3T4StaticR3FrontierHits,
        beyondR3T5StaticR3FrontierHits: p1.beyondR3T5StaticR3FrontierHits,
      },
      notes:
        'L2 prescribed-background exact BigInt R = infinity {3,4,3,4} honeycomb quantum walk with Z[w][1/2] gate compilation (NOT emergent GR from a bare QCA; external force/angle lookup is Float64; r = 4, 5 beyond-R=3 walk uses a constant flat coin; single-particle norm/orthogonality preservation is NOT Hawking evaporation or Page-curve entropy). Part 1 certifies exact SO(4,1; Z[sqrt(2)]) bijection against coverBall(2) and coverBall(3), empirically verifies Busemann-level descent 0/8,857 on B_3 plus 0 mismatches stepping depth 4 -> 3 (eliminating GR-8 past floor = 3; not a general arbitrary-depth convexity proof), and runs a constant-flat-coin walk to r = 4, 5 with 0 frontier hits. Part 2 compiles all prescribed SU(2) coins into exact BigInt Z[w][1/2] words over {W1, W1^dag, W2, W2^dag} (< 1e-3 operator norm, 0n det and unitarity residuals). Part 3 runs the Hartree two-body walk (1:1, 1:3, G = 0) and a genuine exact bijective Gullstrand-Painleve split-step QCA (U_b = S_river^{m_b} * S_light * W(theta_cU), P = 45 beats) using canonical single-face [1, 4, 20, 100] constants (K_eff = 1.012532, G_eff = 0.078593, c_u = 0.977925), verifying BOTH orthogonal null polarizations (rayAOut and rayAIn): symmetric flat +-c_u, redshifted exterior (|v_in| > |v_out|), exact horizon freeze |v_out| < 5e-3 while v_in < -1.0 never stalls, and genuine trapped interior r_areal = 0.6944 r_s < r_s where BOTH v_out < 0 AND v_in < 0, with 0n norm error, 0 memoryless reversal diff slots, and (0n, 0n) orthogonality at every beat.',
    })
  },
})
