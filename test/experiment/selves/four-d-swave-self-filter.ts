// 4D M_pair(zeta_18) s-WAVE SELF, SPECTRAL ERROR FILTER, AND FAST SPARSE BATH CHECK (E-SLF-0200).
//
// Two coupled breakthroughs toward a 4D self on the {3,4,3,4} honeycomb and its bath survival:
//
//   Part A (4D s-wave spectral filter on exact cached R = 3 ball, 8,857 docks):
//     - On a dock holding a full-line pair (12 basis states |full_l>), M_pair(zeta_18) (theta = pi/9) has exact
//       eigenvalue u = zeta_18 = e^{i pi/9} on the unique W(F4)-invariant 4D s-wave |s> = (1/sqrt 12) sum_l |full_l>
//       and exact eigenvalue 1 on all 11 orthogonal transverse modes (spectralGap = 2 sin(pi/18) = 0.347296).
//     - Evolves localized 2-love states (|s>, single-line |full_0>, perturbed |s> + eps |trans>, and a phase-matched
//       2-shell 4D s-wave interferometer packet) for beats t = 1..3 under M_pair(zeta_18) + split coin + P_meet + 'pass'
//       + stream vs the bare free 2-love null, measuring exact unitarity (normErr <= 1e-13), W(F4) isotropy across all
//       24 neighbor docks (spread <= 1e-14), and closure c_A(t) inside r <= 1 and r <= 2 via fastBallClosure.
//
//   Part B (Fast nMax = 5 sparse error-boundary bath survival check on L = 32):
//     - Uses runSparseBoundary (code/measure/sparse-error-boundary.ts) on L = 32, d = 8, nMax = 5 over 30 beats with
//       2 bath arrivals reaching n = 5, comparing boundary (B) vs plain swap (S) vs no boundary (N) on bound-trio
//       retention R(t), outflow E(t) vs arrivals A(t), and exact trace/merge conservation.
//
// Depth L2: exact cached R = 3 honeycomb ball (8,857 docks) and exact L = 32 sparse cold-line engine. Zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  ballClosureByRadius,
  buildBall2LoveTables,
  dock0LineCoeffsState,
  inspectPairMixerSpectrum,
  line0ClosureByRadius,
  lineDispersionOf,
  neighborDockIsotropy,
  perturbedSWaveCoeffs,
  runFastBathSurvivalCheck,
  singleLineCoeffs,
  sWaveCoeffs,
  sWaveCoreCoherence,
  transverseModeCoeffs,
  twoLoveBeat,
  twoLoveInner,
  twoLoveNorm,
  twoShellResonantState,
  type TwoLoveBeatOptions,
  type TwoLoveState,
} from '@/code/measure/swave-self-filter'

const THETA = Math.PI / 9
const EPS = 0.25
const BEATS_4D = 3
const NORM_TOL = 1e-13
const ISO_TOL = 1e-14

const PAIR_OPTS: TwoLoveBeatOptions = { interacting: true, pairTheta: THETA }
const FREE_OPTS: TwoLoveBeatOptions = { interacting: false, pairTheta: null }

function angleDiff(a: number, b: number): number {
  let d = a - b

  while (d > Math.PI) d -= 2 * Math.PI
  while (d <= -Math.PI) d += 2 * Math.PI

  return Math.abs(d)
}

export default experiment({
  id: 'selves/four-d-swave-self-filter',
  code: 'E-SLF-0200',
  title:
    '4D M_pair(zeta_18) s-wave self, spectral error filter on cached exact R = 3 ball (8,857 docks), and fast L = 32 nMax = 5 sparse error-boundary bath survival check',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()

    // ==== PART A: 4D s-wave spectral filter on exact cached R = 3 ball ====
    const spec = inspectPairMixerSpectrum(THETA)
    const tables = buildBall2LoveTables(3)

    const s0 = dock0LineCoeffsState(sWaveCoeffs())
    const line0 = dock0LineCoeffsState(singleLineCoeffs(0))
    const trans0 = dock0LineCoeffsState(transverseModeCoeffs())
    const pert0 = dock0LineCoeffsState(perturbedSWaveCoeffs(EPS))

    const evolve = (init: TwoLoveState, opts: TwoLoveBeatOptions): TwoLoveState[] => {
      const hist: TwoLoveState[] = [init]
      let cur = init

      for (let t = 1; t <= BEATS_4D; t++) {
        cur = twoLoveBeat(tables, cur, opts)
        hist.push(cur)
      }

      return hist
    }

    const sHist = evolve(s0, PAIR_OPTS)
    const sFreeHist = evolve(s0, FREE_OPTS)
    const lineHist = evolve(line0, PAIR_OPTS)
    const lineFreeHist = evolve(line0, FREE_OPTS)
    const transHist = evolve(trans0, PAIR_OPTS)
    const transFreeHist = evolve(trans0, FREE_OPTS)
    const pertHist = evolve(pert0, PAIR_OPTS)

    // Exact unitarity across all trajectories
    let maxNormErr = 0

    for (const hist of [sHist, sFreeHist, lineHist, lineFreeHist, transHist, transFreeHist, pertHist]) {
      for (const st of hist) {
        maxNormErr = Math.max(maxNormErr, Math.abs(twoLoveNorm(st) - 1))
      }
    }

    // W(F4) isotropy of 4D s-wave across all 24 neighbor docks at t = 1, 2, 3
    const sIso1 = neighborDockIsotropy(tables, sHist[1]!)
    const sIso2 = neighborDockIsotropy(tables, sHist[2]!)
    const sIso3 = neighborDockIsotropy(tables, sHist[3]!)
    const maxSWaveIsoSpread = Math.max(sIso1.spread, sIso2.spread, sIso3.spread)

    const lineIso1 = neighborDockIsotropy(tables, lineHist[1]!)
    const pertIso1 = neighborDockIsotropy(tables, pertHist[1]!)

    // Closure c_A(t) inside r <= 1 and r <= 2 via fastBallClosure
    const sClR1 = [1, 2, 3].map(t => ballClosureByRadius(tables, sHist[t]!, 1))
    const sClR2 = [1, 2, 3].map(t => ballClosureByRadius(tables, sHist[t]!, 2))
    const freeClR1 = [1, 2, 3].map(t => ballClosureByRadius(tables, sFreeHist[t]!, 1))
    const freeClR2 = [1, 2, 3].map(t => ballClosureByRadius(tables, sFreeHist[t]!, 2))

    // Single-line closure c_{line 0}(t) comparing M_pair dispersion vs bare free null on |full_0>
    const line0ClPair1 = line0ClosureByRadius(tables, lineHist[1]!, 1)
    const line0ClFree1 = line0ClosureByRadius(tables, lineFreeHist[1]!, 1)
    const line0ClPair3 = line0ClosureByRadius(tables, lineHist[3]!, 1)
    const line0ClFree3 = line0ClosureByRadius(tables, lineFreeHist[3]!, 1)

    // 4D bulk line dispersion of single-line pair under M_pair(zeta_18)
    const lineDisp1 = lineDispersionOf(lineHist[1]!)
    const lineDisp3 = lineDispersionOf(lineHist[3]!)
    const lineFreeDisp3 = lineDispersionOf(lineFreeHist[3]!)

    // Spectral phase separation between |s> (eigenvalue zeta_18) and |trans> (eigenvalue 1) vs bare free null
    const [sFreeR3, sFreeI3] = twoLoveInner(sHist[3]!, sFreeHist[3]!)
    const sVsFreeFidelity3 = sFreeR3 * sFreeR3 + sFreeI3 * sFreeI3
    const [tFreeR3, tFreeI3] = twoLoveInner(transHist[3]!, transFreeHist[3]!)
    const transVsFreeFidelity3 = tFreeR3 * tFreeR3 + tFreeI3 * tFreeI3

    // Core s-wave coherence & phase shift on returning core at t = 1 (shell 1), t = 2 (dock 0), t = 3 (shell 1)
    const sCore1 = sWaveCoreCoherence(tables, sHist[1]!, 1)
    const sCore2 = sWaveCoreCoherence(tables, sHist[2]!, 0)
    const sCore3 = sWaveCoreCoherence(tables, sHist[3]!, 1)
    const sFreeCore1 = sWaveCoreCoherence(tables, sFreeHist[1]!, 1)
    const sFreeCore3 = sWaveCoreCoherence(tables, sFreeHist[3]!, 1)
    const pertCore3 = sWaveCoreCoherence(tables, pertHist[3]!, 1)

    // Phase-matched 2-shell 4D s-wave interferometer: tests direct constructive closure c_{r<=1}(2) advantage
    // of |s> over |trans>, perturbed |s> + eps |trans>, and the bare free 2-love null!
    const resS0 = twoShellResonantState(tables, sWaveCoeffs(), THETA)
    const resT0 = twoShellResonantState(tables, transverseModeCoeffs(), THETA)
    const resP0 = twoShellResonantState(tables, perturbedSWaveCoeffs(EPS), THETA)

    const resSHist = evolve(resS0, PAIR_OPTS)
    const resSFreeHist = evolve(resS0, FREE_OPTS)
    const resTHist = evolve(resT0, PAIR_OPTS)
    const resPHist = evolve(resP0, PAIR_OPTS)

    for (const hist of [resSHist, resSFreeHist, resTHist, resPHist]) {
      for (const st of hist) {
        maxNormErr = Math.max(maxNormErr, Math.abs(twoLoveNorm(st) - 1))
      }
    }

    const resIso2 = neighborDockIsotropy(tables, resSHist[1]!)
    const resSClR1At2 = ballClosureByRadius(tables, resSHist[2]!, 1)
    const resTClR1At2 = ballClosureByRadius(tables, resTHist[2]!, 1)
    const resPClR1At2 = ballClosureByRadius(tables, resPHist[2]!, 1)
    const resFreeClR1At2 = ballClosureByRadius(tables, resSFreeHist[2]!, 1)

    const resSClR2At3 = ballClosureByRadius(tables, resSHist[3]!, 2)
    const resTClR2At3 = ballClosureByRadius(tables, resTHist[3]!, 2)
    const resFreeClR2At3 = ballClosureByRadius(tables, resSFreeHist[3]!, 2)

    const partASeconds = (Date.now() - started) / 1000

    // ==== PART B: Fast nMax = 5 sparse error-boundary bath survival check on L = 32 ====
    const bath = runFastBathSurvivalCheck({
      box: 8,
      beats: 28,
      arrivals: [
        { beat: 16, dock: 16, label: 0 },
        { beat: 22, dock: 23, label: 1 },
      ],
    })

    const B = bath.arms.boundary
    const S = bath.arms.swap
    const N = bath.arms.none

    const totalSeconds = (Date.now() - started) / 1000

    // ---- verification gates ----
    const gSpectrum =
      spec.unitarityErr <= 1e-14 &&
      spec.sWaveEigenErr <= 1e-14 &&
      spec.maxTransverseEigenErr <= 1e-14 &&
      spec.maxOrthoErr <= 1e-14 &&
      Math.abs(spec.spectralGap - 2 * Math.sin(Math.PI / 18)) <= 1e-14

    const gBallUnitarity = tables.cells === 8857 && tables.streamBijective && maxNormErr <= NORM_TOL
    const gIsotropy =
      maxSWaveIsoSpread <= ISO_TOL &&
      resIso2.spread <= ISO_TOL &&
      lineIso1.spread > 0.5 &&
      pertIso1.spread > 0.01

    const gFilter =
      sCore1.sWaveFraction > 1 - 1e-14 &&
      sCore2.sWaveFraction > 1 - 1e-14 &&
      sCore3.sWaveFraction > 1 - 1e-14 &&
      lineDisp1.activeLines === 12 &&
      lineDisp3.offLine0Fraction > lineDisp1.offLine0Fraction &&
      line0ClPair1.c < line0ClFree1.c &&
      line0ClPair3.c < line0ClFree3.c &&
      resSClR1At2.c > resPClR1At2.c &&
      resPClR1At2.c > resTClR1At2.c &&
      resSClR1At2.c > resFreeClR1At2.c &&
      Math.abs(sVsFreeFidelity3 - transVsFreeFidelity3) > 0.1

    // Part B gates:
    //  - box=8 bound level matches recorded box=12 energy within 1e-4 (E-SLF-0191 smoke bar)
    //  - exact trace and merge conservation across all 3 arms (<= 1e-9)
    //  - both arrivals enter (A > 1.8) and n = 5 sector is populated
    //  - boundary preserves the self (R > 0.40, broken < 1e-3), exports arriving bath loves (E > 0.8, loves < N.loves - 0.8),
    //    and decisively beats plain swap (S destroys the self: R < 0.05, broken > 0.95) while none exports 0 and piles up loves!
    const gBath =
      bath.levelOff <= 1e-4 &&
      B.traceOff <= 1e-9 &&
      S.traceOff <= 1e-9 &&
      N.traceOff <= 1e-9 &&
      B.mergeOff <= 1e-9 &&
      S.mergeOff <= 1e-9 &&
      N.mergeOff <= 1e-9 &&
      B.entered > 1.8 &&
      B.peakWeightN5 > 0.05 &&
      N.peakWeightN5 > 0.5 &&
      B.REnd > 0.4 &&
      B.broken < 1e-3 &&
      B.exported > 0.8 &&
      B.lovesEnd < N.lovesEnd - 0.8 &&
      S.REnd < 0.05 &&
      S.broken > 0.95 &&
      N.exported === 0

    const ok = gSpectrum && gBallUnitarity && gIsotropy && gFilter && gBath
    const arrStr = bath.arrivals.map(a => a.beat).join(',')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Part A (cached exact R=3 ball, ${tables.cells} docks, ${partASeconds.toFixed(2)}s): ` +
        `M_pair(zeta_18) exact spectrum (s-wave err ${spec.sWaveEigenErr.toExponential(1)}, 11 transverse err ${spec.maxTransverseEigenErr.toExponential(1)}, gap ${spec.spectralGap.toFixed(6)}); ` +
        `exact unitarity (maxNormErr ${maxNormErr.toExponential(2)}), W(F4) isotropy of 4D s-wave across all 24 neighbor docks (spread ${maxSWaveIsoSpread.toExponential(2)} vs single-line ${lineIso1.spread.toFixed(4)}); ` +
        `dock-0 s-wave stays 100% s-wave coherent (c_{r<=1}(1..3)=${sClR1.map(x => x.c.toFixed(4)).join('/')}, c_{r<=2}(1..3)=${sClR2.map(x => x.c.toFixed(4)).join('/')}, |<s|free>|^2(3)=${sVsFreeFidelity3.toFixed(4)} vs |<trans|free>|^2(3)=${transVsFreeFidelity3.toFixed(4)}) ` +
        `while single-line pair disperses into all ${lineDisp1.activeLines}/12 lines (off-line0 ${(lineDisp1.offLine0Fraction * 100).toFixed(2)}% -> ${(lineDisp3.offLine0Fraction * 100).toFixed(2)}%, line-0 closure ${line0ClPair3.c.toFixed(4)} < free ${line0ClFree3.c.toFixed(4)}); ` +
        `2-shell resonant interferometer closure c_{r<=1}(2): s-wave ${resSClR1At2.c.toFixed(4)} > perturbed ${resPClR1At2.c.toFixed(4)} > transverse ${resTClR1At2.c.toFixed(4)} > free null ${resFreeClR1At2.c.toFixed(4)}. ` +
        `Part B (fast L=${bath.L}, box=${bath.box}, nMax=${bath.nMax} sparse error boundary, ${bath.beats} beats, 2 arrivals at t=${arrStr} reaching n=5, ${bath.totalSeconds.toFixed(2)}s): ` +
        `boundary R(${bath.beats})=${B.REnd.toFixed(4)} (loves=${B.lovesEnd.toFixed(3)}, E=${B.exported.toFixed(4)}, A=${B.entered.toFixed(4)}, E-A=${B.outflowMinusArrivals.toFixed(4)}, peak w5=${B.peakWeightN5.toFixed(4)}, broken=${B.broken.toExponential(1)}) ` +
        `vs swap R(${bath.beats})=${S.REnd.toFixed(4)} (broken=${S.broken.toFixed(4)}) and none R(${bath.beats})=${N.REnd.toFixed(4)} (loves=${N.lovesEnd.toFixed(3)}, E=0, peak w5=${N.peakWeightN5.toFixed(4)}), traceOff=${Math.max(B.traceOff, S.traceOff, N.traceOff).toExponential(2)}.`,
      metrics: {
        // Part A: spectrum & geometry
        ballCells: tables.cells,
        spectralGap: spec.spectralGap,
        mixerUnitarityErr: spec.unitarityErr,
        sWaveEigenErr: spec.sWaveEigenErr,
        maxTransverseEigenErr: spec.maxTransverseEigenErr,
        maxNormErr,
        sWaveIsoSpreadMax: maxSWaveIsoSpread,
        resSWaveIsoSpread1: resIso2.spread,
        singleLineIsoSpread1: lineIso1.spread,
        perturbedIsoSpread1: pertIso1.spread,
        // Part A: dock-0 closures & dispersion
        sWaveClosureR1_t1: sClR1[0]!.c,
        sWaveClosureR1_t2: sClR1[1]!.c,
        sWaveClosureR1_t3: sClR1[2]!.c,
        sWaveClosureR2_t1: sClR2[0]!.c,
        sWaveClosureR2_t2: sClR2[1]!.c,
        sWaveClosureR2_t3: sClR2[2]!.c,
        freeClosureR1_t3: freeClR1[2]!.c,
        freeClosureR2_t3: freeClR2[2]!.c,
        sWaveCoreFraction_t3: sCore3.sWaveFraction,
        perturbedCoreSWaveFraction_t3: pertCore3.sWaveFraction,
        sWavePhaseShiftVsFree_t1: angleDiff(sCore1.phaseRad, sFreeCore1.phaseRad),
        sWavePhaseShiftVsFree_t3: angleDiff(sCore3.phaseRad, sFreeCore3.phaseRad),
        sVsFreeFidelity_t3: sVsFreeFidelity3,
        transVsFreeFidelity_t3: transVsFreeFidelity3,
        singleLineActiveLines_t1: lineDisp1.activeLines,
        singleLineOffLine0_t1: lineDisp1.offLine0Fraction,
        singleLineOffLine0_t3: lineDisp3.offLine0Fraction,
        singleLineFreeOffLine0_t3: lineFreeDisp3.offLine0Fraction,
        line0ClosurePair_t1: line0ClPair1.c,
        line0ClosureFree_t1: line0ClFree1.c,
        line0ClosurePair_t3: line0ClPair3.c,
        line0ClosureFree_t3: line0ClFree3.c,
        // Part A: 2-shell interferometer spectral filter closures
        resonantSWaveClosureR1_t2: resSClR1At2.c,
        resonantPerturbedClosureR1_t2: resPClR1At2.c,
        resonantTransverseClosureR1_t2: resTClR1At2.c,
        resonantFreeNullClosureR1_t2: resFreeClR1At2.c,
        resonantSWaveClosureR2_t3: resSClR2At3.c,
        resonantTransverseClosureR2_t3: resTClR2At3.c,
        resonantFreeNullClosureR2_t3: resFreeClR2At3.c,
        partASeconds,
        // Part B: fast L=32 nMax=5 sparse error boundary
        bathBox: bath.box,
        bathBeats: bath.beats,
        bathLevelOff: bath.levelOff,
        bathSetupSeconds: bath.setupSeconds,
        bath_B_REnd: B.REnd,
        bath_B_RupEnd: B.RupEnd,
        bath_B_RAfter1: B.RAfter1,
        bath_B_RAfter2: B.RAfter2,
        bath_B_lovesEnd: B.lovesEnd,
        bath_B_entered: B.entered,
        bath_B_exported: B.exported,
        bath_B_EminusA: B.outflowMinusArrivals,
        bath_B_peakW5: B.peakWeightN5,
        bath_B_w3End: B.weightN3End,
        bath_B_w5End: B.weightN5End,
        bath_B_trunc: B.trunc,
        bath_B_broken: B.broken,
        bath_B_traceOff: B.traceOff,
        bath_B_seconds: B.seconds,
        bath_S_REnd: S.REnd,
        bath_S_exported: S.exported,
        bath_S_broken: S.broken,
        bath_S_seconds: S.seconds,
        bath_N_REnd: N.REnd,
        bath_N_lovesEnd: N.lovesEnd,
        bath_N_entered: N.entered,
        bath_N_exported: N.exported,
        bath_N_peakW5: N.peakWeightN5,
        bath_N_w5End: N.weightN5End,
        bath_N_seconds: N.seconds,
        partBSeconds: bath.totalSeconds,
        totalSeconds,
        gateSpectrum: gSpectrum ? 1 : 0,
        gateBallUnitarity: gBallUnitarity ? 1 : 0,
        gateIsotropy: gIsotropy ? 1 : 0,
        gateFilter: gFilter ? 1 : 0,
        gateBath: gBath ? 1 : 0,
      },
      notes:
        `L2. Part A on cached exact R=3 {3,4,3,4} ball (8,857 docks) with exact Float64 2-love sparse amplitudes and fastBallClosure. ` +
        `Part B on L=${bath.L} periodic-grade ring (box=${bath.box}), d=${bath.d}, nMax=${bath.nMax} via runSparseBoundary (dropTol=1e-30, stream=true), ` +
        `${bath.beats} beats with 2 arrivals at t=${arrStr} reaching n=5. Zero Math.random; deterministic throughout.`,
    })
  },
})
