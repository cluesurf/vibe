// PARITY-CLASS SWAP SYMMETRY ON THE EXACT {3,4,3,4} BALL (E-SPN-0220, item vibe-roadmap-board-0051, gap B-55).
// Tests whether swapping the honeycomb's two bipartite parity classes (label translation L, det -1), composed with
// {I, P, C, CP, T, CPT}, commutes exactly in Z[w][1/2] with the bare working rule, working rule + ODD (grounding
// decision 003), and working rule + F-G (board-0045 surviving mixer), on both coin placements (before and split).
//
// Depth L2: exact working rule and exact Z[w][1/2] comparisons on the exact {3,4,3,4} ball within its horizon,
// zero floats, zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runClassSwapSymmetry } from '@/code/measure/class-swap'

export default experiment({
  id: 'spin/class-swap-symmetry',
  code: 'E-SPN-0220',
  title:
    'Parity-class swap L composed with P, C, CP and T on the exact {3,4,3,4} ball under bare, ODD and F-G',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runClassSwapSymmetry()
    const i0 = res.mapConflicts === 0 && res.sameClassCount === 0 && res.orientationConflicts === 0
    const totalFrontierHits = res.rows.reduce((a, r) => a + r.frontierHits, 0)
    const i1 = totalFrontierHits === 0
    const allReversible = res.rows.every(r => r.reversible)
    const i2 = allReversible

    const find = (rule: 'bare' | 'odd' | 'fg', place: 'before' | 'split', start: string) =>
      res.rows.find(r => r.rule === rule && r.place === place && r.start === start)!

    const oddSplitX1 = find('odd', 'split', 'X1')
    const bareSplitX1 = find('bare', 'split', 'X1')
    const fgSplitX1 = find('fg', 'split', 'X1')
    const bareBeforeX1 = find('bare', 'before', 'X1')

    const splitBareAll = res.rows
      .filter(r => r.rule === 'bare' && r.place === 'split')
      .every(
        r =>
          r.L &&
          r.LP_kept === r.LP_total &&
          r.LC &&
          r.LCP_kept === r.LCP_total &&
          r.LT &&
          r.LPT_kept === r.LPT_total &&
          r.LCT &&
          r.LCPT_kept === r.LCPT_total,
      )

    const splitFgAll = res.rows
      .filter(r => r.rule === 'fg' && r.place === 'split')
      .every(
        r =>
          r.L &&
          r.LP_kept === r.LP_total &&
          r.LC &&
          r.LCP_kept === r.LCP_total &&
          r.LT &&
          r.LPT_kept === r.LPT_total &&
          r.LCT &&
          r.LCPT_kept === r.LCPT_total,
      )

    const ok = i0 && i1 && i2
    const status = ok ? 'pass' : 'fail'

    return verdict({
      status,
      claim:
        `On the exact R = 3 {3,4,3,4} ball (${res.ballCells} docks, ${res.mappedDocks} mapped, 0 conflicts, 0 frontier hits), ` +
        `under split coin bare and F-G keep all 6 class-swap composites (L, L*P, L*C, L*CP, L*T, L*CPT); ` +
        `under ODD on 4-vibe X1, L=${oddSplitX1.L ? 1 : 0}, L*P=${oddSplitX1.LP_kept}/${oddSplitX1.LP_total}, ` +
        `L*C=${oddSplitX1.LC ? 1 : 0}, L*CP=${oddSplitX1.LCP_kept}/${oddSplitX1.LCP_total}, ` +
        `L*T=${oddSplitX1.LT ? 1 : 0}, L*PT=${oddSplitX1.LPT_kept}/${oddSplitX1.LPT_total}, ` +
        `L*CT=${oddSplitX1.LCT ? 1 : 0}, L*CPT=${oddSplitX1.LCPT_kept}/${oddSplitX1.LCPT_total}; ` +
        `before-coin bare X1 L*T=${bareBeforeX1.LT ? 1 : 0}`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        i2: i2 ? 1 : 0,
        ballCells: res.ballCells,
        mappedDocks: res.mappedDocks,
        mapConflicts: res.mapConflicts,
        frontierHits: totalFrontierHits,
        splitBareAll: splitBareAll ? 1 : 0,
        splitFgAll: splitFgAll ? 1 : 0,
        bareSplitX1_L: bareSplitX1.L ? 1 : 0,
        fgSplitX1_L: fgSplitX1.L ? 1 : 0,
        oddSplitX1_L: oddSplitX1.L ? 1 : 0,
        oddSplitX1_LP: oddSplitX1.LP_kept,
        oddSplitX1_LC: oddSplitX1.LC ? 1 : 0,
        oddSplitX1_LCP: oddSplitX1.LCP_kept,
        oddSplitX1_LT: oddSplitX1.LT ? 1 : 0,
        oddSplitX1_LPT: oddSplitX1.LPT_kept,
        oddSplitX1_LCT: oddSplitX1.LCT ? 1 : 0,
        oddSplitX1_LCPT: oddSplitX1.LCPT_kept,
        bareBeforeX1_LT: bareBeforeX1.LT ? 1 : 0,
      },
    })
  },
})
