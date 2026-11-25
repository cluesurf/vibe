// L1 10-QUBIT BRICKWORK SCRAMBLER PAGE-CURVE BENCHMARK, BOSONIC BOGOLIUBOV TWO-MODE-SQUEEZER
// THERMAL-CONSISTENCY CHECK, AND L1 Z[w][1/2] SU(2) MITM GATE-SYNTHESIS BENCHMARK (E-QTM-0207).
//
// Honest scope:
//   - Part A.1: L1 10-qubit unitary brickwork scrambler Page-curve benchmark using Z[zeta_9][1/6] gates
//     and M_pair(zeta_18) entanglers. This is a generic 10-qubit scrambler, NOT a {3,4,3,4} honeycomb black hole,
//     and does NOT resolve E-GRV-0134.
//   - Part A.2: Bosonic Bogoliubov two-mode-squeezer thermal-consistency check confirming that Fock-space unitary
//     squeezing U_sq(r) satisfies sinh^2(r) = 1/(exp(omega/T_H) - 1) when r = atanh(exp(-omega / (2 T_H))),
//     evaluated at the benchmark input kappa = ln(6034/330). Does NOT derive Hawking temperature from {3,4,3,4}.
//   - Part B: L1 Z[w][1/2] SU(2) MITM gate-synthesis convergence benchmark on a prepared Bell singlet transported
//     along an open 128-dock line. The spatial line walk commutes with uniform uA (x) uB, so this benchmarks SU(2)
//     gate synthesis while dynamical open-line entanglement saturation (E-QTM-0202 / B-08) remains open.
//
// Depth L1: exact deterministic unitary benchmarks and BigInt Z[w][1/2] arithmetic. Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runHorizonPageAndOpenTsirelson } from '@/code/measure/horizon-page-and-open-tsirelson'

export default experiment({
  id: 'quantum/horizon-page-and-open-tsirelson',
  code: 'E-QTM-0207',
  title:
    'L1 10-qubit brickwork scrambler Page-curve benchmark, bosonic Bogoliubov two-mode-squeezer thermal-consistency check, and L1 Z[w][1/2] SU(2) MITM gate-synthesis benchmark on a prepared Bell singlet',
  category: 'quantum',
  substrates: ['none'],
  depth: 'L1',
  paper: false,
  run() {
    const { partA, partB } = runHorizonPageAndOpenTsirelson()

    // Part A gates:
    //   a0: global purity, exact norm conservation, exact backward U^dag reversal, exact gate unitarity
    //   a1: L1 10-qubit brickwork scrambler Page curve (S_R(0) = 0, rise, turnover at k = N/2, S_R(N) = 0)
    //   a2: bosonic Bogoliubov two-mode-squeezer thermal-consistency check (sinh^2(r) = 1/(e^{omega/T_H} - 1))
    //   a3: controls (r = 0 vacuum squeezer emits 0, non-scrambling identity circuit gives S_R = 0)
    const a0 =
      partA.maxGlobalNormErr <= 1e-13 &&
      partA.maxGlobalEntropyBits <= 1e-13 &&
      partA.maxReducedTraceErr <= 1e-13 &&
      partA.backwardReversalErr <= 1e-13 &&
      partA.maxGateUnitarityErr <= 1e-13

    const a1 =
      partA.sRadAt0 <= 1e-12 &&
      partA.sRadAtEnd <= 1e-12 &&
      partA.earlyMonotoneRise &&
      partA.lateMonotoneFall &&
      partA.peakDiffFromAsymptoticPage <= 0.5

    const a2 =
      partA.maxPlanckAbsErr <= 1e-12 &&
      partA.planckFitR2 > 0.999999 &&
      partA.planckTempRelErr <= 1e-12 &&
      partA.maxBogoliubovUnitErr <= 1e-13 &&
      partA.maxFockNormErr <= 1e-13 &&
      partA.maxFockReversalErr <= 1e-13

    const a3 =
      partA.maxFlatControlOccupation <= 1e-14 && partA.maxControlEntropyBits <= 1e-14

    // Part B gates:
    //   b0: open 128-dock transport (0 boundary hits, disjoint A/B packets), exact unitarity & BigInt Z[w][1/2] ring
    //   b1: strict monotonic MITM SU(2) gate-synthesis convergence across L = 6..22 to |2 sqrt 2 - CHSH| < 1e-6
    //   b2: exact U^dag reversal (<= 1e-14), exact no-signaling (<= 1e-15), classical dephased control <= 2.0
    const b0 =
      partB.boundaryHits === 0 &&
      partB.separationGapDocks > 0 &&
      partB.allExactRingOk &&
      partB.maxUnitarityErr <= 1e-14 &&
      partB.maxMitmConsistencyErr <= 1e-11

    const b1 = partB.strictlyMonotonicConvergence && partB.bestGapToTsirelson < 1e-6

    const b2 =
      partB.fullReversalErr <= 1e-14 &&
      partB.maxNoSignalingDrift <= 1e-15 &&
      partB.maxClassicalControlChsh <= 2.0

    const ok = a0 && a1 && a2 && a3 && b0 && b1 && b2

    const pageSeriesStr = partA.pageCurve.map(r => r.entropyBits.toFixed(3)).join(', ')
    const chshSeriesStr = partB.wordCurve
      .map(r => `L${r.wordLength}=${r.chshOpen.toFixed(9)}(gap ${r.gapToTsirelson.toExponential(2)})`)
      .join(', ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part A.1 (L1 10-qubit unitary brickwork scrambler Page-curve benchmark, generic scrambler NOT a {3,4,3,4} black hole, does not resolve E-GRV-0134): ` +
        `N=${partA.nQubits} Z[zeta_9][1/6] scrambler + M_pair(zeta_18) gives S_R(0..10)=[${pageSeriesStr}] ` +
        `(peak S_R(5)=${partA.sRadAtPage.toFixed(4)} vs Page ${partA.asymptoticPagePeakBits.toFixed(4)}, ` +
        `S_R(10)=${partA.sRadAtEnd.toExponential(2)}, normErr=${partA.maxGlobalNormErr.toExponential(2)}, ` +
        `U^dag revErr=${partA.backwardReversalErr.toExponential(2)}, identity control=${partA.maxControlEntropyBits.toExponential(2)}). ` +
        `Part A.2 (bosonic Bogoliubov two-mode-squeezer thermal-consistency check at input parameter kappa=ln(6034/330)=${partA.surfaceGravityKappa.toFixed(6)}, T_H=${partA.hawkingTempTH.toFixed(6)}, NOT derived from {3,4,3,4}): ` +
        `Fock squeezing at r=atanh(exp(-omega/(2 T_H))) matches sinh^2(r)=1/(exp(omega/T_H)-1) to ${partA.maxPlanckAbsErr.toExponential(2)} ` +
        `(R^2=${partA.planckFitR2.toFixed(12)}, T_fit relErr=${partA.planckTempRelErr.toExponential(2)}, r=0 control=${partA.maxFlatControlOccupation.toExponential(2)}). ` +
        `Part B (L1 Z[w][1/2] SU(2) MITM gate-synthesis convergence benchmark on a prepared Bell singlet, spatial walk commutes with uniform uA (x) uB, dynamical E-QTM-0202 / B-08 remains open): ` +
        `${partB.lineLen}-dock line (0 boundary hits, separation=${partB.separationGapDocks} docks) MITM Z[w][1/2] synthesis gives ${chshSeriesStr}, ` +
        `reaching gap ${partB.bestGapToTsirelson.toExponential(2)} (< 1e-6), ` +
        `unitarity=${partB.maxUnitarityErr.toExponential(2)}, U^dag revErr=${partB.fullReversalErr.toExponential(2)}, ` +
        `no-signaling=${partB.maxNoSignalingDrift.toExponential(2)}, dephased control=${partB.maxClassicalControlChsh.toFixed(6)}`,
      metrics: {
        a0: a0 ? 1 : 0,
        a1: a1 ? 1 : 0,
        a2: a2 ? 1 : 0,
        a3: a3 ? 1 : 0,
        b0: b0 ? 1 : 0,
        b1: b1 ? 1 : 0,
        b2: b2 ? 1 : 0,
        pageSR0: partA.sRadAt0,
        pageSR1: partA.pageCurve[1]!.entropyBits,
        pageSR2: partA.pageCurve[2]!.entropyBits,
        pageSR3: partA.pageCurve[3]!.entropyBits,
        pageSR4: partA.pageCurve[4]!.entropyBits,
        pageSR5: partA.sRadAtPage,
        pageSR6: partA.pageCurve[6]!.entropyBits,
        pageSR7: partA.pageCurve[7]!.entropyBits,
        pageSR8: partA.pageCurve[8]!.entropyBits,
        pageSR9: partA.pageCurve[9]!.entropyBits,
        pageSR10: partA.sRadAtEnd,
        asymptoticPagePeakBits: partA.asymptoticPagePeakBits,
        exactPagePeakBits: partA.exactPagePeakBits,
        peakDiffFromAsymptoticPage: partA.peakDiffFromAsymptoticPage,
        pageMaxGlobalNormErr: partA.maxGlobalNormErr,
        pageMaxGlobalEntropyBits: partA.maxGlobalEntropyBits,
        pageBackwardReversalErr: partA.backwardReversalErr,
        pageControlMaxEntropyBits: partA.maxControlEntropyBits,
        cuspKappa: partA.surfaceGravityKappa,
        hawkingTempTH: partA.hawkingTempTH,
        hawkingMaxPlanckAbsErr: partA.maxPlanckAbsErr,
        hawkingPlanckFitR2: partA.planckFitR2,
        hawkingTempRelErr: partA.planckTempRelErr,
        hawkingMaxBogoliubovErr: partA.maxBogoliubovUnitErr,
        hawkingMaxFockReversalErr: partA.maxFockReversalErr,
        hawkingFlatControlMaxOcc: partA.maxFlatControlOccupation,
        openBoundaryHits: partB.boundaryHits,
        openSeparationGapDocks: partB.separationGapDocks,
        openActiveSpatialPairs: partB.activeSpatialPairs,
        openChshL6: partB.wordCurve[0]!.chshOpen,
        openGapL6: partB.wordCurve[0]!.gapToTsirelson,
        openChshL10: partB.wordCurve[1]!.chshOpen,
        openGapL10: partB.wordCurve[1]!.gapToTsirelson,
        openChshL14: partB.wordCurve[2]!.chshOpen,
        openGapL14: partB.wordCurve[2]!.gapToTsirelson,
        openChshL18: partB.wordCurve[3]!.chshOpen,
        openGapL18: partB.wordCurve[3]!.gapToTsirelson,
        openChshL22: partB.wordCurve[4]!.chshOpen,
        openGapL22: partB.wordCurve[4]!.gapToTsirelson,
        openImprovementOverE0202: partB.improvementOverE0202,
        openAllExactRingOk: partB.allExactRingOk ? 1 : 0,
        openMaxMitmConsistencyErr: partB.maxMitmConsistencyErr,
        openMaxUnitarityErr: partB.maxUnitarityErr,
        openFullReversalErr: partB.fullReversalErr,
        openMaxNoSignalingDrift: partB.maxNoSignalingDrift,
        openMaxClassicalControlChsh: partB.maxClassicalControlChsh,
      },
      control: {
        pageControlMaxEntropyBits: partA.maxControlEntropyBits,
        squeezerZeroControlOcc: partA.maxFlatControlOccupation,
        openMaxClassicalControlChsh: partB.maxClassicalControlChsh,
      },
      notes:
        'L1 abstract benchmarks (substrates: none, matching test/mesh.csv no-mesh). ' +
        'Part A.1 is a generic 10-qubit unitary brickwork scrambler Page-curve benchmark, not a {3,4,3,4} honeycomb black hole, and does not resolve E-GRV-0134. ' +
        'Part A.2 is a bosonic Bogoliubov two-mode-squeezer thermal-consistency check verifying sinh^2(r) = 1/(e^{omega/T_H} - 1) when r = atanh(exp(-omega/(2 T_H))), not a derivation of Hawking temperature from {3,4,3,4}. ' +
        'Part B is an L1 Z[w][1/2] SU(2) MITM gate-synthesis convergence benchmark on a prepared Bell singlet whose spatial line walk commutes with uniform uA (x) uB. Dynamical open-line entanglement saturation (E-QTM-0202 / B-08) remains open.',
    })
  },
})
