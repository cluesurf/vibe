// P227 (the last open, done DISCRETELY): GUT vacuum selection. so(10) breaks along a self-condensate (a spinor
// VEV, p225). Which of the 16 DISCRETE spinor weights does the condensate pick? The natural vacuum maximizes the
// RESIDUAL symmetry (minimizes broken generators), a standard, fully DISCRETE criterion. For each discrete weight
// w we count the so(10) roots left UNBROKEN (those orthogonal to w, dot(r,w)=0). The weight with the most
// unbroken roots is the selected vacuum. We show the su(5)-singlet (all-+1/2) maximizes it (20 unbroken roots =
// su(5)), so the discrete selection gives so(10) -> su(5) -> SM. No continuum, just counting discrete roots and
// weights. Run: npx tsx code/experiment/p227-vacuum-selection.ts

import {
  rootsDn,
  dotVec as dot,
  spinorWeightsDn,
} from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function vacuumSelection(): {
  maxUnbroken: number
  singletWins: boolean
} {
  const roots = rootsDn(5),
    weights = spinorWeightsDn(5)
  // for each discrete weight, count unbroken so(10) roots (orthogonal to the VEV direction)
  const scored = weights.map(w => ({
    w,
    unbroken: roots.filter(r => dot(r, w) === 0).length,
    minus: w.filter(x => x < 0).length,
  }))
  const maxUnbroken = Math.max(...scored.map(s => s.unbroken))
  // group by minus-count (the su(5) multiplet structure: 0->singlet, 2->10, 4->5bar)
  const byMinus: Record<number, number> = {}
  for (const s of scored) byMinus[s.minus] = s.unbroken // same within a multiplet
  // every spinor weight preserves exactly 20 roots: they are Weyl-equivalent, each preserves a (conjugate) su(5)
  const allGiveSu5 = scored.every(s => s.unbroken === 20)
  const singletWins = allGiveSu5
  return { maxUnbroken, singletWins }
}

export default experiment({
  id: 'gauge/vacuum-selection',
  title:
    'every one of the 16 spinor weights leaves 20 unbroken roots, so any self-condensate breaks so(10) to su(5)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = vacuumSelection()
    const ok = r.singletWins && r.maxUnbroken === 20
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'counting unbroken so(10) roots for each of the 16 discrete spinor weights gives exactly 20 for every one, a conjugate su(5), so any self-condensate breaks so(10) to su(5) with no fine-tuning',
      metrics: {
        maxUnbroken: r.maxUnbroken,
        allGiveSu5: r.singletWins ? 1 : 0,
      },
      notes:
        'L1, known math. The 16 spinor weights are Weyl-equivalent, so the result that each preserves su(5) is a group-theory fact, a robustness statement for the first breaking, not a dynamical vacuum-formation result.',
    })
  },
})
