// NON-CLOSURE OF 3D COLUMN-SUM PROJECTION AND ACTIVE 4D BULK DYNAMICS ON {3,4,3,4}
// (E-HLG-0043, item vibe-roadmap-board-0028, gaps B-36, B-55).
// Tests proposal 005 on buildExactCusp (period 2, floors 1 to 3) under split coin with bare rule and F-G:
// measures cross-column neighbor share by depth D = 0..3, L1 husk divergence of two bulk states sharing identical
// initial column charge Q_c(0), and bipartite parity-class mixing in a single-beat column sum.
// Scope note (HN-7): demonstrates non-closure of the flat 3D column-sum projection due to active 4D bulk dynamics
// on {3,4,3,4}, and makes no claim of non-epiphenomenal bulk experience steering physics.
//
// Depth L2: exact cusp geometry + exact split-coin and F-G dynamics. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runColumnHuskClosure } from '@/code/measure/column-husk-closure'

export default experiment({
  id: 'holography/column-husk-closure',
  code: 'E-HLG-0043',
  title:
    'Non-closure of 3D column-sum projection (active 4D bulk dynamics on {3,4,3,4})',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runColumnHuskClosure()
    const i0 = res.classConflicts === 0 && res.normErrMax <= 1e-12
    const i1 = res.startDiff === 0

    const s0 = res.freezing[0]!.crossColumnShare
    const s1 = res.freezing[1]!.crossColumnShare
    const s2 = res.freezing[2]!.crossColumnShare
    const s3 = res.freezing[3]!.crossColumnShare

    const g1 = s0 > s1 && s1 > s2 && s2 > s3
    const g2 = res.bareDiv1 > 0.05 && res.fgDiv1 > 0.05
    const g3 = res.evenWeightAt1 > 0.1 && res.oddWeightAt1 > 0.1

    const ok = i0 && i1 && g1 && g2 && g3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `On exact {3,4,3,4} cusp (period 2, floor 3, ${res.totalDocks} docks): cross-column neighbor share drops with depth ` +
        `D=0..3 (${s0.toFixed(4)}, ${s1.toFixed(4)}, ${s2.toFixed(4)}, ${s3.toFixed(4)}), ` +
        `two 4D bulk states sharing identical initial 3D column sum Q_c(0) diverge at t=1 by L1=${res.bareDiv1.toFixed(4)} (bare) and ` +
        `${res.fgDiv1.toFixed(4)} (F-G), demonstrating non-closure of the flat 3D column-sum projection under active 4D bulk dynamics, ` +
        `and the column sum mixes both bipartite parity classes (even=${res.evenWeightAt1.toFixed(3)}, odd=${res.oddWeightAt1.toFixed(3)})`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        shareD0: s0,
        shareD1: s1,
        shareD2: s2,
        shareD3: s3,
        startDiff: res.startDiff,
        normErrMax: res.normErrMax,
        bareDiv1: res.bareDiv1,
        bareDiv2: res.bareDiv2,
        fgDiv1: res.fgDiv1,
        fgDiv2: fgDiv2Val(res),
        evenWeightAt1: res.evenWeightAt1,
        oddWeightAt1: res.oddWeightAt1,
      },
      notes:
        'Measures non-closure of the flat 3D column-sum projection and depth-dependent cross-column freezing on the exact {3,4,3,4} cusp (period 2, floor 3). This is a dynamical projection property of active 4D bulk degrees of freedom under the bare and F-G walks, and does NOT claim non-epiphenomenal bulk experience steering physics.',
    })
  },
})

function fgDiv2Val(r: { fgDiv2: number }): number {
  return r.fgDiv2
}
