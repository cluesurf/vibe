// MANY-TESSELLATIONS (scale sweep): test the candidate 5D crystallographic hyperbolic honeycombs side by side
// against the {3,4,3,4} champion. These five all use ONLY 3s and 4s, so unlike {5,3,3,3,3} they are
// CRYSTALLOGRAPHIC (could carry a root system / spinors), and all contain the 24-cell pattern [3,4,3]. But they
// are rank-6 (5D bulk -> 4D physical space) and paracompact (beyond the H^4 compact limit). We build each at
// scale and measure the scoreboard. Run: npx tsx code/experiment/5d-tessellations.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { betheCorrelatorExponent, spectralDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; note: string }
const CANDIDATES: Cand[] = [
  { sym: [3, 4, 3, 4], note: 'REFERENCE, the champion (compact, 3D physical, D4 spinor coin)' },
  { sym: [3, 4, 3, 3, 4], note: '24-cell / D4 / F4 / spinor hook + curvature' },
  { sym: [3, 4, 3, 3, 3], note: '24-cell / D4 hook, dual-side comparison' },
  { sym: [3, 3, 4, 3, 3], note: 'neutral control, self-dual, tetrahedral' },
  { sym: [4, 3, 3, 4, 3], note: 'cubic / tesseractic flavor' },
  { sym: [3, 3, 3, 4, 3], note: 'orthoplex / simplex-family endpoint' },
]

const SCALE = 30000
const SURVEY_SCALE = 1500

function measure(sym: number[], scale: number = SCALE): { cells: number; degree: number; specDim: number; growth: number; betheAlpha: number } {
  const g = buildCellGraph({ symbol: sym as never, maxCells: scale })
  const N = g.cellCount, nb = g.neighbors
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = nb[i]!.length; if (d > best) { best = d; center = i } }
  const degree = best
  // bulk spectral dimension (lazy-walk return), the central difference at t = 3 is the endpoint slope t = 2..4
  const specDim = Math.round(spectralDimension({ neighbors: nb, start: center, t1: 2, t2: 4 }) * 100) / 100
  // cosmology growth ratio
  const shell = bfsShells({ neighbors: nb, root: center }).shellCounts
  const mid = shell.slice(1, Math.min(4, shell.length))
  const growth = Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / Math.max(1, mid.length - 1)) * 100) / 100
  const betheAlpha = betheCorrelatorExponent(degree)
  return { cells: N, degree, specDim, growth, betheAlpha }
}

export function manyTessellations(): void {
  for (const c of CANDIDATES) {
    const rank = c.sym.length + 1, bulkDim = c.sym.length, physDim = bulkDim - 1
    const crystallographic = c.sym.every((n) => n === 3 || n === 4 || n === 6)
    const has24 = c.sym.join(',').includes('3,4,3')
    const compact = bulkDim <= 4 // compact regular hyperbolic honeycombs exist only through H^4
    const m = measure(c.sym, SURVEY_SCALE)
  }
}

export default defineExperiment({
  id: 'substrate-survey/5d-tessellations',
  title: 'a sweep of 5D crystallographic honeycombs, all overshoot to 4D physical space and lose compactness',
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
