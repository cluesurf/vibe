// EXACT C, P, CP, T AND CPT VERTEX TABLE (E-FND-0181, item vibe-roadmap-board-0020, gaps B-23, B-44).
// Compares bare, adopted ODD (k* = 4), linear dipole (k = 1/2), and EVEN control on the exact R = 2 {3,4,3,4} ball
// under split coin, exact in Z[w][1/2], zero floats, zero random numbers.
//
// Depth L2: exact rule pieces on the exact honeycomb ball within horizon.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runVertexSymmetryTable } from '@/code/measure/vertex-symmetry'

export default experiment({
  id: 'foundations/vertex-symmetry-table',
  code: 'E-FND-0181',
  title:
    'Exact C, P, CP, T and CPT table on the R = 2 {3,4,3,4} ball for bare, ODD (k* = 4), linear dipole, and EVEN',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runVertexSymmetryTable()
    const find = (piece: 'bare' | 'odd' | 'dipole' | 'even', start: 'P2_neutral' | 'X1_chiral') =>
      res.rows.find(r => r.piece === piece && r.start === start)!

    const i0 = res.rows.every(r => r.reversible)
    const totalHits = res.rows.reduce((a, r) => a + r.frontierHits, 0)
    const i1 = totalHits === 0

    const bareP2 = find('bare', 'P2_neutral')
    const bareX1 = find('bare', 'X1_chiral')
    const i2 =
      bareP2.C &&
      bareP2.P_kept === bareP2.P_total &&
      bareP2.CP_kept === bareP2.CP_total &&
      bareP2.T &&
      bareP2.CPT_kept === bareP2.CPT_total &&
      bareX1.C &&
      bareX1.P_kept === bareX1.P_total &&
      bareX1.CP_kept === bareX1.CP_total &&
      bareX1.T &&
      bareX1.CPT_kept === bareX1.CPT_total

    const oddP2 = find('odd', 'P2_neutral')
    const oddX1 = find('odd', 'X1_chiral')
    const dipP2 = find('dipole', 'P2_neutral')
    const evenX1 = find('even', 'X1_chiral')

    const g1 =
      oddP2.silentVsBare &&
      oddP2.C &&
      oddP2.P_kept === oddP2.P_total &&
      !oddX1.C &&
      oddX1.P_kept === 0 &&
      oddX1.CP_kept === oddX1.CP_total
    const g2 = !dipP2.C && dipP2.P_kept < dipP2.P_total
    const g3 = !evenX1.C && evenX1.P_kept === evenX1.P_total && evenX1.CP_kept === 0

    const ok = i0 && i1 && i2 && g1 && g2 && g3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `R = 2 ball (${res.ballCells} docks, split coin, ${totalHits} frontier hits, reversible=${i0 ? 1 : 0}): ` +
        `bare symmetry gate i2=${i2 ? 1 : 0} (bareP2 T=${bareP2.T ? 1 : 0}, bareX1 T=${bareX1.T ? 1 : 0}); ` +
        `ODD is silent=${oddP2.silentVsBare ? 1 : 0} on neutral 2-vibe P2 and on 4-vibe X1 gives C=${oddX1.C ? 1 : 0}, P=${oddX1.P_kept}/${oddX1.P_total}, CP=${oddX1.CP_kept}/${oddX1.CP_total} (g1=${g1 ? 1 : 0}); ` +
        `linear dipole on P2 gives C=${dipP2.C ? 1 : 0}, P=${dipP2.P_kept}/${dipP2.P_total} (g2=${g2 ? 1 : 0}); ` +
        `EVEN control on X1 gives C=${evenX1.C ? 1 : 0}, P=${evenX1.P_kept}/${evenX1.P_total}, CP=${evenX1.CP_kept}/${evenX1.CP_total} (g3=${g3 ? 1 : 0})`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        i2: i2 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        oddP2Silent: oddP2.silentVsBare ? 1 : 0,
        oddX1_C: oddX1.C ? 1 : 0,
        oddX1_P: oddX1.P_kept,
        oddX1_CP: oddX1.CP_kept,
        oddX1_T: oddX1.T ? 1 : 0,
        oddX1_CPT: oddX1.CPT_kept,
        dipP2_C: dipP2.C ? 1 : 0,
        dipP2_P: dipP2.P_kept,
        dipP2_CP: dipP2.CP_kept,
        evenX1_C: evenX1.C ? 1 : 0,
        evenX1_P: evenX1.P_kept,
        evenX1_CP: evenX1.CP_kept,
      },
    })
  },
})
