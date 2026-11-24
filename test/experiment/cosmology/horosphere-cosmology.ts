// EMERGENT COSMOLOGICAL EXPANSION a(t), H(t), q(t), w_eff(t) FROM A FINITE DISTURBANCE SPREADING
// IN THE FIXED INFINITE {3,4,3,4} MESH WITHOUT MESH GROWTH (E-CSM-0064, gaps B-18, B-42).
//
// Proves that under adopted Proposal 003 (fixed infinite {3,4,3,4} honeycomb, zero irreversible mesh growth),
// a finite localized disturbance starting at the cusp (D = 0) and evolving under the exact reversible unitary
// walk (split coin + F-G / M_pair) drifts ballistically into exponentially expanding horospheres, producing
// emergent de Sitter expansion a(t) ~ exp(H t), H > 0, q -> -1, w_eff -> -1 while remaining 100% reversible
// under U^dag (past hypothesis from a localized low-entropy seed).
//
// Part A: Exact cached cusp (period = 2, floor = 3; 51,064 docks) and cached R = 3 ball (8,857 docks),
//   t = 0..3 beats with zero forward frontier hits, exact unitarity (normErr <= 1e-13), and exact 3-beat
//   adjoint reversal (<D_back> <= 1e-13, maxAmpDiff <= 1e-13).
// Part B: Exact infinite 7-ary frame-tree solver matching Part A at t = 0..3 to < 1e-12 plus explicit 1D
//   unitary branching-tree walk (b = 18 down / 1 up / 5 lateral, D_max = 60, zero floor reflection, 40-beat
//   U^dag reversal) vs flat cubic control (b = 1 -> a(t) = 1, H = 0 identically).
//
// Depth L2: exact cached {3,4,3,4} Coxeter cusp & ball + exact infinite frame-tree Green's function +
// explicit 1D unitary branching-tree walk. Deterministic, zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runHorosphereCosmology } from '@/code/measure/horosphere-cosmology'

const NORM_TOL = 1e-13
const REV_TOL = 1e-13
const MATCH_TOL = 1e-12

export default experiment({
  id: 'cosmology/horosphere-cosmology',
  code: 'E-CSM-0064',
  title:
    'Emergent de Sitter expansion a(t), H(t), q -> -1, w_eff -> -1 from a reversible unitary disturbance spreading into fixed infinite {3,4,3,4} horospheres without mesh growth (B-18, B-42)',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const res = runHorosphereCosmology()
    const seconds = (Date.now() - started) / 1000
    const { geometry: g, partA: a, partB: b } = res

    // Gate 1: Exact {3,4,3,4} cusp geometry & R=3 ball covering map
    const gGeom =
      g.cuspCells === 51064 &&
      g.ballCells === 8857 &&
      g.coverConflicts === 0 &&
      g.coverMissing === 0 &&
      g.shellCountsD0to3[0] === 1 &&
      g.shellCountsD0to3[1] === 18 &&
      g.shellCountsD0to3[2] === 330 &&
      g.shellCountsD0to3[3] === 6034 &&
      g.allD0Frames026 &&
      g.allBulkUpFrames107 &&
      g.zeroUpOrLatSelfLines

    // Gate 2: Part A exact unitarity, zero forward frontier hits, and exact 3-beat reversibility
    const partARules = [
      a.cuspBare,
      a.cuspFgPi,
      a.cuspFg4Pi9,
      a.cuspMpairSingleLine,
      a.cuspMpairUniform,
      a.ballBare,
      a.ballFgPi,
    ]
    const gPartAUnitaryRev =
      partARules.every(
        r =>
          r.maxNormErr <= NORM_TOL &&
          r.forwardFrontierHits === 0 &&
          r.reversedMeanD <= REV_TOL &&
          r.reversedMaxAmpDiff <= REV_TOL,
      ) &&
      a.ballBareMaxDepthDiff <= MATCH_TOL &&
      a.ballFgPiWavefrontDiffT2 <= MATCH_TOL &&
      a.ballFgPiWavefrontDiffT3 <= MATCH_TOL

    // Gate 3: Part A genuine horosphere expansion at t = 1..3, amplified by F-G frame mixing over bare
    const bareT3 = a.cuspBare.beats[3]!
    const fgPiT3 = a.cuspFgPi.beats[3]!
    const fg49T3 = a.cuspFg4Pi9.beats[3]!
    const mpairSingleT3 = a.cuspMpairSingleLine.beats[3]!
    const gPartAExpansion =
      bareT3.meanD > 0.5 &&
      bareT3.scaleA > 5 &&
      fgPiT3.meanD > bareT3.meanD &&
      fgPiT3.scaleA > 10 &&
      fg49T3.meanD > bareT3.meanD &&
      fg49T3.scaleA > 9 &&
      mpairSingleT3.meanD > 0.5 &&
      mpairSingleT3.scaleA > 5

    // Gate 4: Part B exact match to Part A at t = 0..3, long-time unitarity (t = 0..40), zero floor reflection
    const gPartBExact =
      b.exactTreeBare.matchPartAMaxErr <= MATCH_TOL &&
      b.exactTreeFgPi.matchPartAMaxErr <= MATCH_TOL &&
      b.exactTreeFg4Pi9.matchPartAMaxErr <= MATCH_TOL &&
      b.exactTreeBare.maxNormErr <= NORM_TOL &&
      b.exactTreeFgPi.maxNormErr <= NORM_TOL &&
      b.exactTreeFg4Pi9.maxNormErr <= NORM_TOL &&
      b.groverBranchingB18.maxNormErr <= NORM_TOL &&
      b.groverBranchingB18.floorWeightAtMaxD === 0 &&
      b.groverBranchingB18.reversedMeanD <= REV_TOL &&
      b.groverBranchingB18.reversedMaxAmpDiff <= REV_TOL &&
      b.flatCubicControlB1.maxNormErr <= NORM_TOL &&
      b.flatCubicControlB1.floorWeightAtMaxD === 0 &&
      b.flatCubicControlB1.reversedMeanD <= REV_TOL &&
      b.flatCubicControlB1.reversedMaxAmpDiff <= REV_TOL

    // Gate 5: Emergent de Sitter expansion (v_D > 0, linear R^2 > 0.999, H > 0, q -> -1, w_eff -> -1)
    // across exact F-G(pi), F-G(4pi/9), and b = 18 branching-tree walk, vs flat cubic control (a = 1, H = 0)
    const gDeSitter =
      b.exactTreeFgPi.fitVelocityD > 0.5 &&
      b.exactTreeFgPi.fitVelocityD > b.exactTreeBare.fitVelocityD &&
      b.exactTreeFgPi.fitR2LinearD > 0.9995 &&
      b.exactTreeFgPi.hubbleLateMean > 0.45 &&
      Math.abs(b.exactTreeFgPi.qLogLateMean - -1) < 0.05 &&
      Math.abs(b.exactTreeFgPi.wEffLateMean - -1) < 0.04 &&
      b.exactTreeFgPi.qFdBenchmarkRelErr < 0.03 &&
      b.exactTreeFg4Pi9.fitVelocityD > 0.4 &&
      b.exactTreeFg4Pi9.fitR2LinearD > 0.9995 &&
      Math.abs(b.exactTreeFg4Pi9.qLogLateMean - -1) < 0.05 &&
      Math.abs(b.exactTreeFg4Pi9.wEffLateMean - -1) < 0.04 &&
      b.groverBranchingB18.fitVelocityD > 0.25 &&
      b.groverBranchingB18.fitR2LinearD > 0.9995 &&
      b.groverBranchingB18.hubbleLateMean > 0.25 &&
      Math.abs(b.groverBranchingB18.qLogLateMean - -1) < 0.05 &&
      Math.abs(b.groverBranchingB18.wEffLateMean - -1) < 0.04 &&
      b.groverBranchingB18.qFdBenchmarkRelErr < 0.03

    const gFlatControl =
      Math.abs(b.flatCubicControlB1.scaleAAt40 - 1) <= 1e-14 &&
      b.flatCubicControlB1.hubbleLateMean === 0 &&
      b.flatCubicControlB1.meanDAt40 > 5

    const ok =
      gGeom &&
      gPartAUnitaryRev &&
      gPartAExpansion &&
      gPartBExact &&
      gDeSitter &&
      gFlatControl

    const maxPartANormErr = Math.max(...partARules.map(r => r.maxNormErr))
    const maxPartARevErr = Math.max(...partARules.map(r => r.reversedMaxAmpDiff))
    const maxTreeMatchErr = Math.max(
      b.exactTreeBare.matchPartAMaxErr,
      b.exactTreeFgPi.matchPartAMaxErr,
      b.exactTreeFg4Pi9.matchPartAMaxErr,
    )

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Fixed infinite {3,4,3,4} honeycomb (N_D = ${g.shellCountsD0to3.join(', ')}, all bulk active frames identically 1-up/0-lat/7-dn): ` +
        `Part A exact 51,064-dock cusp + 8,857-dock R=3 ball (0 forward frontier hits, normErr <= ${maxPartANormErr.toExponential(2)}, ` +
        `3-beat U^dag reversal err <= ${maxPartARevErr.toExponential(2)}) shows rapid horosphere expansion from a localized dock-0 seed ` +
        `at t=3 (bare <D>=${bareT3.meanD.toFixed(4)}, a=${bareT3.scaleA.toFixed(4)}; F-G(pi) <D>=${fgPiT3.meanD.toFixed(4)}, a=${fgPiT3.scaleA.toFixed(4)}; ` +
        `F-G(4pi/9) <D>=${fg49T3.meanD.toFixed(4)}, a=${fg49T3.scaleA.toFixed(4)}; 2-love M_pair(-1) single-line <D>=${mpairSingleT3.meanD.toFixed(4)}, a=${mpairSingleT3.scaleA.toFixed(4)}). ` +
        `Part B exact infinite frame-tree walk (t=0..40, matching Part A at t=0..3 to ${maxTreeMatchErr.toExponential(2)}, normErr <= ${Math.max(b.exactTreeBare.maxNormErr, b.exactTreeFgPi.maxNormErr, b.exactTreeFg4Pi9.maxNormErr).toExponential(2)}) ` +
        `and explicit b=18/1/5 branching-tree walk (D_max=60, 0 floor weight, 40-beat U^dag err ${b.groverBranchingB18.reversedMaxAmpDiff.toExponential(2)}) ` +
        `yield ballistic depth drift and emergent de Sitter expansion a(t) ~ exp(H t): ` +
        `F-G(pi) v_D=${b.exactTreeFgPi.fitVelocityD.toFixed(5)} (R^2=${b.exactTreeFgPi.fitR2LinearD.toFixed(6)}), H=${b.exactTreeFgPi.hubbleLateMean.toFixed(5)}, q=${b.exactTreeFgPi.qLogLateMean.toFixed(4)}, w_eff=${b.exactTreeFgPi.wEffLateMean.toFixed(4)}; ` +
        `F-G(4pi/9) v_D=${b.exactTreeFg4Pi9.fitVelocityD.toFixed(5)}, H=${b.exactTreeFg4Pi9.hubbleLateMean.toFixed(5)}, q=${b.exactTreeFg4Pi9.qLogLateMean.toFixed(4)}, w_eff=${b.exactTreeFg4Pi9.wEffLateMean.toFixed(4)}; ` +
        `b=18 Grover tree v_D=${b.groverBranchingB18.fitVelocityD.toFixed(5)}, H=${b.groverBranchingB18.hubbleLateMean.toFixed(5)}, q=${b.groverBranchingB18.qLogLateMean.toFixed(4)}, w_eff=${b.groverBranchingB18.wEffLateMean.toFixed(4)}, ` +
        `vs flat cubic control (b=1: <D(40)>=${b.flatCubicControlB1.meanDAt40.toFixed(4)} yet a(t)=${b.flatCubicControlB1.scaleAAt40.toFixed(6)}, H=0 identically)`,
      metrics: {
        gGeom: gGeom ? 1 : 0,
        gPartAUnitaryRev: gPartAUnitaryRev ? 1 : 0,
        gPartAExpansion: gPartAExpansion ? 1 : 0,
        gPartBExact: gPartBExact ? 1 : 0,
        gDeSitter: gDeSitter ? 1 : 0,
        gFlatControl: gFlatControl ? 1 : 0,
        cuspCells: g.cuspCells,
        ballCells: g.ballCells,
        nD0: g.shellCountsD0to3[0],
        nD1: g.shellCountsD0to3[1],
        nD2: g.shellCountsD0to3[2],
        nD3: g.shellCountsD0to3[3],
        asymptoticVolRatio: g.asymptoticVolRatio,
        partABareMeanD3: bareT3.meanD,
        partABareVol3: bareT3.meanV,
        partABareScaleA3: bareT3.scaleA,
        partAFgPiMeanD1: a.cuspFgPi.beats[1]!.meanD,
        partAFgPiMeanD2: a.cuspFgPi.beats[2]!.meanD,
        partAFgPiMeanD3: fgPiT3.meanD,
        partAFgPiVol3: fgPiT3.meanV,
        partAFgPiScaleA3: fgPiT3.scaleA,
        partAFg4Pi9MeanD3: fg49T3.meanD,
        partAFg4Pi9ScaleA3: fg49T3.scaleA,
        partAMpairSingleMeanD3: mpairSingleT3.meanD,
        partAMpairSingleScaleA3: mpairSingleT3.scaleA,
        partAMaxNormErr: maxPartANormErr,
        partAMaxRevErr: maxPartARevErr,
        partABallBareMaxDiff: a.ballBareMaxDepthDiff,
        partABallFgPiWavefrontDiffT3: a.ballFgPiWavefrontDiffT3,
        partBTreeMatchMaxErr: maxTreeMatchErr,
        treeBareVelD: b.exactTreeBare.fitVelocityD,
        treeBareHubble: b.exactTreeBare.hubbleLateMean,
        treeFgPiMeanD40: b.exactTreeFgPi.meanDAt40,
        treeFgPiVelD: b.exactTreeFgPi.fitVelocityD,
        treeFgPiR2: b.exactTreeFgPi.fitR2LinearD,
        treeFgPiHubble: b.exactTreeFgPi.hubbleLateMean,
        treeFgPiHubbleAsympVol: b.exactTreeFgPi.hubbleAsympVolRatio,
        treeFgPiQLog: b.exactTreeFgPi.qLogLateMean,
        treeFgPiWEff: b.exactTreeFgPi.wEffLateMean,
        treeFgPiQFd: b.exactTreeFgPi.qFdLateMean,
        treeFgPiQFdBenchmark: b.exactTreeFgPi.qFdDeSitterBenchmark,
        treeFgPiNormErr: b.exactTreeFgPi.maxNormErr,
        treeFg4Pi9MeanD40: b.exactTreeFg4Pi9.meanDAt40,
        treeFg4Pi9VelD: b.exactTreeFg4Pi9.fitVelocityD,
        treeFg4Pi9Hubble: b.exactTreeFg4Pi9.hubbleLateMean,
        treeFg4Pi9QLog: b.exactTreeFg4Pi9.qLogLateMean,
        treeFg4Pi9WEff: b.exactTreeFg4Pi9.wEffLateMean,
        groverB18MeanD40: b.groverBranchingB18.meanDAt40,
        groverB18VelD: b.groverBranchingB18.fitVelocityD,
        groverB18R2: b.groverBranchingB18.fitR2LinearD,
        groverB18Hubble: b.groverBranchingB18.hubbleLateMean,
        groverB18QLog: b.groverBranchingB18.qLogLateMean,
        groverB18WEff: b.groverBranchingB18.wEffLateMean,
        groverB18QFd: b.groverBranchingB18.qFdLateMean,
        groverB18QFdBenchmark: b.groverBranchingB18.qFdDeSitterBenchmark,
        groverB18RevErr: b.groverBranchingB18.reversedMaxAmpDiff,
        flatCubicMeanD40: b.flatCubicControlB1.meanDAt40,
        flatCubicScaleA40: b.flatCubicControlB1.scaleAAt40,
        flatCubicHubble: b.flatCubicControlB1.hubbleLateMean,
        seconds,
      },
      control: {
        flatCubicMeanD40: b.flatCubicControlB1.meanDAt40,
        flatCubicScaleA40: b.flatCubicControlB1.scaleAAt40,
        flatCubicHubble: b.flatCubicControlB1.hubbleLateMean,
        treeBareVelD: b.exactTreeBare.fitVelocityD,
        treeFgPiVelD: b.exactTreeFgPi.fitVelocityD,
        partAMaxRevErr: maxPartARevErr,
        groverB18RevErr: b.groverBranchingB18.reversedMaxAmpDiff,
      },
      notes:
        `L2. Proves emergent de Sitter expansion (a(t) ~ exp(H t), H > 0, q -> -1, w_eff -> -1) inside the fixed infinite ` +
        `{3,4,3,4} honeycomb without irreversible mesh growth (Proposal 003). Part A verifies exact unitarity and exact 3-beat ` +
        `U^dag reversibility on the cached 51,064-dock exact cusp and 8,857-dock R=3 ball (0 forward frontier hits). Part B ` +
        `matches Part A at t = 0..3 to < 1e-12 via the exact infinite 7-ary frame-tree solver (every active bulk frame at D >= 1 ` +
        `is identically 1-up/0-lat/7-dn) and confirms the same de Sitter law on the explicit b = 18/1/5 unitary branching tree ` +
        `(D_max = 60, 0 floor reflection, 40-beat U^dag reversal), while the flat cubic control (b = 1) stays at a(t) = 1, H = 0. ` +
        `Note on discrete derivatives: for an exact exponential a(t) = exp(H t), the exact log-Hubble identity ` +
        `q_log = -1 - dH/H^2 equals -1 with zero discretization bias, whereas the raw central difference -a d2a / da^2 has ` +
        `exact discrete de Sitter value -1 / cosh^2(H/2) (both reported and verified). ` +
        `Still open: deriving the realistic multi-era cosmological transition and Hubble slowdown from early radiation ` +
        `(w = +1/3, q = +1) through matter (w = 0, q = +1/2) to late-time dark energy (w = -1, q = -1), which requires ` +
        `multi-vibe density backreaction and self-gravitation slowing v_D(t) at early times before asymptotic vacuum drift dominates.`,
    })
  },
})
