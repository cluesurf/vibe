// E-GRV-0163: TRUE L3 -- PURE ZERO-DECIMAL BigInt Z[w][1/2] TWO-BODY MUTUAL GRAVITY &
// STRONG-FIELD EVENT-HORIZON TRAPPING ON AN ON-THE-FLY R = INFINITY 4D {3,4,3,4} HONEYCOMB.
//
// Depth L3: combines an on-the-fly R = infinity exact SO(4,1; Z[sqrt(2)]) {3,4,3,4} honeycomb
// neighbor engine (zero pre-built static ball, zero outer boundary, 0 frontier hits through t = 4, 5
// strictly beyond R = 3) with pure zero-decimal BigInt Z[w][1/2] SU(2) rule-word synthesis over
// {W_1, W_1^dag, W_2, W_2^dag} (< 1e-3 operator norm, 0n det & unitarity residuals) and pure exact
// BigInt Z[w][1/2] multi-slot quantum evolution:
//   1. Exact 100% isomorphism of InfiniteHoneycomb with coverBall(2) (481 docks) and coverBall(3)
//      (8,857 docks), exact algebraic involutive adjacency step(step(d, s), opp(s)) === d, and
//      sparse evolution strictly beyond R = 3 to exact graph radii r = 4 (t = 4) and r = 5 (t = 5)
//      with 0 frontier hits (where static R = 3 hits its frontier at t = 4).
//   2. Pure BigInt Z[w][1/2] synthesis of all two-body gravity coins (1:1 & 1:3) and all 5
//      strong-field Schwarzschild horizon coins (chi in {0.0, 0.4, 0.75, 1.0, 1.35}) to < 1e-3
//      operator norm with 0n BigInt det and unitarity residuals.
//   3. Pure BigInt L3 two-body mutual attraction & Newton's 3rd law (1:1 & 1:3 matching E-GRV-0162
//      to < 1%, 0n BigInt mirror-weight asymmetry, 0n norm error, 0 diff-slot memoryless reversal,
//      exact 0 drift at G = 0) and strong-field event-horizon trapping (strictly monotonic v_r from
//      > +0.98 through |v_r(1.0)| < 5e-3 stall to < -0.02 inward fall at chi = 1.35, matching
//      E-GRV-0162 to < 1e-2) with literally 0n exact BigInt norm, reversal, and orthogonality behind
//      the horizon. Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runExactTernaryL3InfiniteHoneycomb } from '@/code/measure/exact-ternary-l3-infinite-honeycomb'

export default experiment({
  id: 'gravity/exact-ternary-l3-infinite-honeycomb',
  code: 'E-GRV-0163',
  title:
    'True L3 pure zero-decimal BigInt Z[w][1/2] two-body mutual gravity and strong-field event-horizon trapping on an on-the-fly R = infinity 4D {3,4,3,4} honeycomb',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const r = runExactTernaryL3InfiniteHoneycomb()
    const p1 = r.part1InfiniteHoneycomb
    const p2 = r.part2Synthesis
    const tb = r.part3TwoBody
    const hor = r.part3Horizon
    const cr = r.part3CrossRadiusControls

    // Gate 0: Exact Z[sqrt(2)] on-the-fly R = infinity isomorphism with R = 2 & R = 3 + strictly beyond R = 3
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

    // Gate 1: Pure zero-decimal BigInt Z[w][1/2] SU(2) synthesis (< 1e-3 op norm, 0n det & unitarity residuals)
    const g1ExactBigIntSynthesis =
      p2.allGeneratorsExactSU2 &&
      p2.allCoinsExactSU2 &&
      p2.maxDetResidual === 0n &&
      p2.maxUnitarityResidual === 0n &&
      p2.maxOpDistAllCoins < 1e-3 &&
      p2.horizonCoins.length === 5 &&
      p2.gravityCoins.length >= 2

    // Gate 2: Pure BigInt L3 two-body mutual attraction, Newton's 3rd law, exact 0n norm/reversal/symmetry & G = 0
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
      // Unequal-mass 1:3 Newton's 3rd law matching E-GRV-0162 within < 1%
      uq.deltaXA1 > 0 &&
      uq.deltaXB1 < 0 &&
      uq.deltaDAB2 < uq.deltaDAB1 &&
      Math.abs(uq.displacementRatio1 - 3.0) < 0.03 &&
      Math.abs(uq.displacementRatio2 - 3.0) < 0.03 &&
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

    // Gate 3: Pure BigInt L3 event-horizon trapping + exact 0n norm/reversal/orthogonality + cross-radius control
    const sw0 = hor.sweep[0]! // chi = 0.0
    const sw1 = hor.sweep[1]! // chi = 0.4
    const sw2 = hor.sweep[2]! // chi = 0.75
    const sw3 = hor.sweep[3]! // chi = 1.0
    const sw4 = hor.sweep[4]! // chi = 1.35

    const g3ExactBigIntHorizonAndControls =
      hor.totalFrontierHits === 0 &&
      hor.strictlyMonotonicVRadial1 &&
      hor.strictlyMonotonicDeltaR2 &&
      sw0.vRadial1 > 0.98 &&
      sw1.vRadial1 > 0.15 &&
      sw2.vRadial1 > 0.02 &&
      Math.abs(sw3.vRadial1) < 5e-3 &&
      sw4.vRadial1 < -0.02 &&
      sw4.deltaR2 < -0.002 &&
      hor.maxVRadial1DiffVsRef < 1e-2 &&
      hor.maxDeltaR2DiffVsRef < 1e-2 &&
      hor.worstExactBigIntNormErr === 0n &&
      hor.worstExactBigIntReversalDiffSlots === 0 &&
      hor.allProbesExactBigIntOrthogonal &&
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
        `Pure zero-decimal BigInt Z[w][1/2] L3 quantum gravity and event-horizon trapping directly on an on-the-fly ` +
        `R = infinity exact SO(4,1; Z[sqrt(2)]) 4D {3,4,3,4} honeycomb (${r.elapsedSeconds.toFixed(2)}s): ` +
        `(1) InfiniteHoneycomb matches coverBall(0..3) = [${p1.nBall0to3.join(', ')}] with 0 missing, 0 mismatches, ` +
        `0 inconsistent steps, and ${p1.involutiveEdgesChecked} algebraic Z[sqrt(2)] involutive edges (0 failures), ` +
        `then evolves strictly beyond R = 3 to exact graph radii r = 4 (t = 4, ${p1.beyondR3T4ReachedExactRadius4Count} docks at r=4) ` +
        `and r = 5 (t = 5, ${p1.beyondR3T5ReachedExactRadius5Count} docks at r=5, max cosh d_H4 = ${p1.beyondR3T5MaxHyperbolicCosh.toFixed(2)}) ` +
        `using only ${p1.beyondR3T5VisitedDocks} sparse visited docks with 0 frontier hits (static R = 3 suffers ` +
        `${p1.beyondR3T4StaticR3FrontierHits} frontier hits at t = 4 and ${p1.beyondR3T5StaticR3FrontierHits} at t = 5), ` +
        `0n norm error, and 0 reversal diff slots. ` +
        `(2) All gravity and horizon SU(2) coins are synthesized from Vibe's exact Z[w][1/2] generators {W1, W1^dag, W2, W2^dag} ` +
        `to max operator norm ${p2.maxOpDistAllCoins.toExponential(2)} (< 1e-3) with 0n BigInt det and unitarity residuals. ` +
        `(3) Pure BigInt two-body evolution on R = infinity yields strict mutual attraction (1:1 Delta d_AB = ${eq.deltaDAB1.toFixed(6)} at t=1, ` +
        `${eq.deltaDAB2.toFixed(6)} at t=2, matching E-GRV-0162 to ${(100 * eq.relErrVsFloatRefBeat2).toFixed(3)}%), ` +
        `exact 0n BigInt mirror weight symmetry (|Delta x_A + Delta x_B| = ${eq.comSum2.toExponential(2)}), ` +
        `1:3 Newton 3rd law ratio ${uq.displacementRatio1.toFixed(5)} (t=1) / ${uq.displacementRatio2.toFixed(5)} (t=2) ` +
        `(matching E-GRV-0162 to ${(100 * uq.relErrVsFloatRefBeat2).toFixed(3)}%), exact 0 drift at G = 0, ` +
        `0n norm error, and 0 reversal diff slots. ` +
        `(4) Pure BigInt horizon sweep across chi in {0.0, 0.4, 0.75, 1.0, 1.35} on R = infinity slows strictly monotonically ` +
        `from v_r(0) = +${sw0.vRadial1.toFixed(5)} through v_r(0.4) = +${sw1.vRadial1.toFixed(5)} and v_r(0.75) = +${sw2.vRadial1.toFixed(5)} ` +
        `to horizon stall v_r(1.0) = ${sw3.vRadial1.toFixed(5)} and trapped inward fall v_r(1.35) = ${sw4.vRadial1.toFixed(5)} ` +
        `(Delta r_2 = ${sw4.deltaR2.toFixed(5)} < 0, max diff vs E-GRV-0162 ${hor.maxVRadial1DiffVsRef.toExponential(2)}), ` +
        `while certifying literally 0n BigInt norm error, 0 reversal diff slots, and 0n + 0n * w orthogonality behind the horizon`,
      metrics: {
        g0InfiniteHoneycombAndBeyondR3: g0InfiniteHoneycombAndBeyondR3 ? 1 : 0,
        g1ExactBigIntSynthesis: g1ExactBigIntSynthesis ? 1 : 0,
        g2ExactBigIntTwoBody: g2ExactBigIntTwoBody ? 1 : 0,
        g3ExactBigIntHorizonAndControls: g3ExactBigIntHorizonAndControls ? 1 : 0,
        elapsedSeconds: r.elapsedSeconds,
        gEff: r.constants.gEff,
        cUniversal: r.constants.cUniversal,
        // Part 1: On-the-fly R = infinity engine & beyond R = 3
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
        // Part 3A: Exact BigInt two-body gravity
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
        // Part 3B: Exact BigInt event-horizon trapping
        horTotalFrontierHits: hor.totalFrontierHits,
        horVRadialFlat: sw0.vRadial1,
        horVRadialChi040: sw1.vRadial1,
        horVRadialChi075: sw2.vRadial1,
        horVRadialChi100: sw3.vRadial1,
        horVRadialChi135: sw4.vRadial1,
        horDeltaR2Flat: sw0.deltaR2,
        horDeltaR2Chi040: sw1.deltaR2,
        horDeltaR2Chi075: sw2.deltaR2,
        horDeltaR2Chi100: sw3.deltaR2,
        horDeltaR2Chi135: sw4.deltaR2,
        horMaxVRadial1DiffVsRef: hor.maxVRadial1DiffVsRef,
        horMaxDeltaR2DiffVsRef: hor.maxDeltaR2DiffVsRef,
        horWorstExactNormErr: Number(hor.worstExactBigIntNormErr),
        horWorstExactRevDiffSlots: hor.worstExactBigIntReversalDiffSlots,
        horAllProbesExactOrthogonal: hor.allProbesExactBigIntOrthogonal ? 1 : 0,
        horChi135InnerInA0: Number(sw4.exactBigIntInnerInA[0]),
        horChi135InnerInA1: Number(sw4.exactBigIntInnerInA[1]),
        horChi135InnerSup0: Number(sw4.exactBigIntInnerSup[0]),
        horChi135InnerSup1: Number(sw4.exactBigIntInnerSup[1]),
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
        'Part 1 builds the reusable on-the-fly InfiniteHoneycomb engine over exact BigInt SO(4,1; Z[sqrt(2)]) frames, certifies 100% bijection and algebraic involutive adjacency against coverBall(2) (481 docks) and coverBall(3) (8,857 docks), and evolves a pure BigInt Z[w][1/2] wavepacket strictly beyond R = 3 to exact graph radii r = 4 (t = 4) and r = 5 (t = 5) with 0 frontier hits while static R = 3 hits its frontier at t = 4. Part 2 eliminates all Float64 coin angles by synthesizing explicit BigInt Z[w][1/2] SU(2) words over {W1, W1^dag, W2, W2^dag} via deterministic L <= 16 MITM + balanced group commutator refinement to < 1e-3 operator norm with 0n det and unitarity residuals. Part 3 evolves two-body mutual gravity (1:1, 1:3, G = 0) and all 5 nonlinear Schwarzschild horizon compactness values (chi in {0.0, 0.4, 0.75, 1.0, 1.35}) in pure BigInt Z[w][1/2] on InfiniteHoneycomb, matching E-GRV-0162 while certifying exact 0n BigInt norm preservation, exact 0 diff-slot memoryless U^dag reversal, exact 0n equal-mass mirror symmetry, and exact 0n + 0n * w orthogonality behind the trapped event horizon.',
    })
  },
})
