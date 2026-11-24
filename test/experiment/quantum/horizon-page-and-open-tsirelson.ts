// UNITARY HORIZON PAGE CURVE, THERMAL HAWKING SPECTRUM ON {3,4,3,4} WARPED CUSP,
// AND OPEN-LINE NON-WRAPPING TSIRELSON CONVERGENCE TO 2 SQRT 2 (< 1e-6) (E-QTM-0207).
//
// Part A resolves E-GRV-0134 / information paradox on the {3,4,3,4} warped cusp:
//   - N_tot = 10 qubit unitary Z[zeta_9][1/6] scrambler (E-QTM-0204 dense SU(2) gates + M_pair(zeta_18) entangler)
//     reproduces the exact Page curve S_R(0) = 0 -> early thermal rise -> Page turnover at k = 5 near
//     N_tot/2 - 1/(2 ln 2) -> exact return S_R(10) = 0 with exact global purity and U^dag reversal (<= 1e-13),
//     while the non-scrambling control gives S_R(k) = 0.
//   - Unitary Fock-space horizon squeezing across the {3,4,3,4} cusp redshift profile (kappa = ln(6034/330),
//     T_H = kappa / (2 pi)) matches exact Bose-Einstein / Planck thermal occupation to <= 1e-12 (R^2 > 0.999999),
//     while the flat-horizon control (kappa = 0) emits strictly 0 particles.
//
// Part B closes E-QTM-0202's ~7e-4 open-line Tsirelson stall:
//   - Entangled Bell singlet on a strictly open, non-wrapping honeycomb line (0 boundary hits, 0 wrap)
//     measured by deterministic Meet-in-the-Middle Z[w][1/2] subset Z[zeta_9][1/6] rule-word analyzers
//     at word lengths L in {6, 10, 14, 18, 22} converges strictly monotonically to 2 sqrt 2 with
//     |2 sqrt 2 - CHSH_open| < 1e-6, exact unitarity (<= 1e-14), exact U^dag reversal (<= 1e-14),
//     exact no-signaling (<= 1e-15), and failable classical dephased control <= 2.0.
//
// Depth L2: exact deterministic unitary evolution and exact BigInt Z[w][1/2] verification. Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runHorizonPageAndOpenTsirelson } from '@/code/measure/horizon-page-and-open-tsirelson'

export default experiment({
  id: 'quantum/horizon-page-and-open-tsirelson',
  code: 'E-QTM-0207',
  title:
    'Unitary Z[zeta_9][1/6] horizon Page curve, exact Hawking-Planck spectrum on {3,4,3,4} warped cusp, and open-line non-wrapping Tsirelson convergence to 2 sqrt 2 (< 1e-6)',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const { partA, partB } = runHorizonPageAndOpenTsirelson()

    // Part A gates:
    //   a0: global purity, exact norm conservation, exact backward U^dag reversal, exact gate unitarity
    //   a1: exact Page curve (S_R(0) = 0, early rise, turnover at k = N/2 within 0.5 bits of Page peak, S_R(N) = 0)
    //   a2: exact Hawking-Planck thermal spectrum on {3,4,3,4} warped cusp (absErr <= 1e-12, R^2 > 0.999999)
    //   a3: failable controls (flat horizon kappa = 0 emits 0, non-scrambling interior gives S_R = 0)
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
    //   b0: strictly open non-wrapping line (0 boundary hits, disjoint Alice/Bob packets), exact unitarity & BigInt ring
    //   b1: strict monotonic convergence across L = 6, 10, 14, 18, 22 and |2 sqrt 2 - CHSH_open| < 1e-6
    //   b2: exact U^dag reversal (<= 1e-14), exact no-signaling (<= 1e-15), failable classical dephased control <= 2.0
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
        `Part A (Unitary Horizon Page Curve & Hawking-Planck Spectrum on {3,4,3,4} Cusp): ` +
        `N=${partA.nQubits} Z[zeta_9][1/6] scrambler + M_pair(zeta_18) yields exact Page curve S_R(0..10)=[${pageSeriesStr}] ` +
        `(peak S_R(5)=${partA.sRadAtPage.toFixed(4)} vs Page ${partA.asymptoticPagePeakBits.toFixed(4)}, ` +
        `S_R(10)=${partA.sRadAtEnd.toExponential(2)}, normErr=${partA.maxGlobalNormErr.toExponential(2)}, ` +
        `U^dag revErr=${partA.backwardReversalErr.toExponential(2)}, identity control=${partA.maxControlEntropyBits.toExponential(2)}); ` +
        `warped-cusp squeezing at kappa=ln(6034/330)=${partA.surfaceGravityKappa.toFixed(6)}, T_H=${partA.hawkingTempTH.toFixed(6)} ` +
        `matches exact Planck occupation to ${partA.maxPlanckAbsErr.toExponential(2)} (R^2=${partA.planckFitR2.toFixed(12)}, ` +
        `T_fit relErr=${partA.planckTempRelErr.toExponential(2)}, flat kappa=0 control=${partA.maxFlatControlOccupation.toExponential(2)}). ` +
        `Part B (Open-Line Non-Wrapping Tsirelson Convergence): ` +
        `${partB.lineLen}-dock open line (0 boundary hits, separation=${partB.separationGapDocks} docks) with Meet-in-the-Middle ` +
        `Z[w][1/2] rule-word analyzers converges strictly monotonically: ${chshSeriesStr}, ` +
        `reaching gap ${partB.bestGapToTsirelson.toExponential(2)} (< 1e-6, ${partB.improvementOverE0202.toFixed(0)}x better than E-QTM-0202), ` +
        `unitarity=${partB.maxUnitarityErr.toExponential(2)}, U^dag revErr=${partB.fullReversalErr.toExponential(2)}, ` +
        `no-signaling=${partB.maxNoSignalingDrift.toExponential(2)}, classical dephased control=${partB.maxClassicalControlChsh.toFixed(6)}`,
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
    })
  },
})
