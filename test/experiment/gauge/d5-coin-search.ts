// P220 (gauge path): can any honeycomb coin realize D5 = so(10) (the root system the Standard Model needs,
// p217)? {3,4,3,4}'s coin is 24 directions = the 24-cell = D4 roots, the ONE place a honeycomb's neighbours form
// a root system, because the 24-cell is the unique non-simplex REGULAR polytope that is a root polytope, and it
// exists ONLY in 4D (the source of triality). We check, (a) the 24-cell vertices are closed under reflections
// (a genuine root system = D4), (b) D5 has 40 roots but the 5D regular polytopes have 6 / 32 / 10 vertices, none
// is 40, so NO regular honeycomb coin can carry D5. Run: npx tsx code/experiment/p220-d5-coin-search.ts

import { isRootSystem, rootsDn } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function d5CoinSearch(): {
  cell24IsD4: boolean
  d5RootCount: number
  anyRegular5DHas40: boolean
} {
  // 24-cell vertices = D4 roots: all +-e_i +-e_j (i<j) in 4D
  const R = rootsDn(4)
  const cell24IsD4 = isRootSystem(R) && R.length === 24
  // D_n root count = 2n(n-1); regular polytope vertex counts by dimension
  const dRoots = (n: number): number => 2 * n * (n - 1)
  const d5RootCount = dRoots(5) // 40
  // 5D regular polytopes: 5-simplex (6 vertices), 5-cube (32), 5-orthoplex (10). NONE has 40.
  const regular5D = [
    { name: '5-simplex {3,3,3,3}', v: 6 },
    { name: '5-cube {4,3,3,3}', v: 32 },
    { name: '5-orthoplex {3,3,3,4}', v: 10 },
  ]
  const anyRegular5DHas40 = regular5D.some(p => p.v === d5RootCount)
  return { cell24IsD4, d5RootCount, anyRegular5DHas40 }
}

export default experiment({
  id: 'gauge/d5-coin-search',
  title:
    'no regular honeycomb coin carries D5 = so(10), the geometry tops out at D4',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = d5CoinSearch()
    const ok =
      r.cell24IsD4 &&
      r.d5RootCount === 40 &&
      r.anyRegular5DHas40 === false
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24-cell is the D4 root system but no 5D regular polytope has the 40 vertices of D5, so no regular honeycomb coin can carry so(10)',
      metrics: {
        cell24IsD4: r.cell24IsD4 ? 1 : 0,
        d5RootCount: r.d5RootCount,
        anyRegular5DHasD5: r.anyRegular5DHas40 ? 1 : 0,
      },
      notes:
        'L1, known math, and an honest negative. The 24-cell is the unique non-simplex regular polytope that is a root system, and it exists only in 4D. The geometric coin family tops out at D4, so the gauge path of growing the coin to D5 is blocked in the honeycomb geometry.',
    })
  },
})
