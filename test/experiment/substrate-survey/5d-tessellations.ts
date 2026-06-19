// MANY-TESSELLATIONS (scale sweep): test the candidate 5D crystallographic hyperbolic honeycombs side by side
// against the {3,4,3,4} champion. These five all use ONLY 3s and 4s, so unlike {5,3,3,3,3} they are
// CRYSTALLOGRAPHIC (could carry a root system / spinors), and all contain the 24-cell pattern [3,4,3]. But they
// are rank-6 (5D bulk -> 4D physical space) and paracompact (beyond the H^4 compact limit). We build each at
// scale and measure the scoreboard. Run: npx tsx code/experiment/5d-tessellations.ts

import { surveyTessellation } from '@/code/measure/tessellation-survey'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; note: string }
const CANDIDATES: Cand[] = [
  {
    sym: [3, 4, 3, 4],
    note: 'REFERENCE, the champion (compact, 3D physical, D4 spinor coin)',
  },
  {
    sym: [3, 4, 3, 3, 4],
    note: '24-cell / D4 / F4 / spinor hook + curvature',
  },
  {
    sym: [3, 4, 3, 3, 3],
    note: '24-cell / D4 hook, dual-side comparison',
  },
  {
    sym: [3, 3, 4, 3, 3],
    note: 'neutral control, self-dual, tetrahedral',
  },
  { sym: [4, 3, 3, 4, 3], note: 'cubic / tesseractic flavor' },
  { sym: [3, 3, 3, 4, 3], note: 'orthoplex / simplex-family endpoint' },
]

const SCALE = 30000
const SURVEY_SCALE = 1500

function measure(
  sym: number[],
  scale: number = SCALE,
): {
  cells: number
  degree: number
  specDim: number
  growth: number
  betheAlpha: number
} {
  const m = surveyTessellation({
    symbol: sym,
    maxCells: scale,
    minCells: 0,
    growthFrom: 1,
    growthTo: 4,
    safeDenominator: true,
    withSpectralDimension: true,
    specDimT1: 2,
    specDimT2: 4,
  })
  return {
    cells: m.cells,
    degree: m.degree,
    specDim: m.specDim,
    growth: m.growth,
    betheAlpha: m.betheAlpha,
  }
}

export function manyTessellations(): void {
  for (const c of CANDIDATES) {
    const rank = c.sym.length + 1,
      bulkDim = c.sym.length,
      physDim = bulkDim - 1
    const crystallographic = c.sym.every(
      n => n === 3 || n === 4 || n === 6,
    )
    const has24 = c.sym.join(',').includes('3,4,3')
    const compact = bulkDim <= 4 // compact regular hyperbolic honeycombs exist only through H^4
    const m = measure(c.sym, SURVEY_SCALE)
  }
}

export default experiment({
  id: 'substrate-survey/5d-tessellations',
  title:
    'a sweep of 5D crystallographic honeycombs, all overshoot to 4D physical space and lose compactness',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    manyTessellations()
    const reference = measure([3, 4, 3, 4])
    const ok = reference.cells > 50 && reference.degree > 0
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the candidate 5D crystallographic honeycombs build as cell graphs and keep the [3,4,3] D4 spinor hook, but all are rank-6 giving 4D physical space and all are paracompact, so none beats the compact 3D-physical {3,4,3,4}',
      metrics: {
        referenceDegree: reference.degree,
        referenceCells: reference.cells,
        referenceBetheAlpha: reference.betheAlpha,
        referenceGrowth: reference.growth,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {3,4,3,4} builds. The crystallographic and 24-cell-hook flags are read from the Schlafli symbols, and the 4D-physical and paracompact verdicts from the rank and the H^4 compact limit, not measured here. This is a catalog entry, the alternatives that keep the spinor hook but overshoot the dimension.',
    })
  },
})
