// THREED-TESSELLATIONS (scale sweep of the 3D hyperbolic regular honeycombs): the 4 compact regulars and the
// 11 paracompact regulars of H^3 (we already did {5,3,4}). All are 3D bulk -> 2D horosphere (physical space 2D,
// under-dimensional). Key structural fact, the compact regulars all contain a 5 (non-crystallographic, no gauge),
// while the paracompact ones containing a 6 (and only 3,4,6) ARE crystallographic. So 3D never delivers
// compact-AND-crystallographic together. Run: npx tsx code/experiment/3d-tessellations.ts

import { surveyTessellation } from '@/code/measure/tessellation-survey'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; compact: boolean; note: string }
const HONEYCOMBS: Cand[] = [
  // 4 compact regulars (the prime substrates)
  {
    sym: [5, 3, 4],
    compact: true,
    note: 'order-4 dodecahedral (the committed substrate, done)',
  },
  {
    sym: [4, 3, 5],
    compact: true,
    note: 'order-5 cubic, cubes / icosahedron',
  },
  { sym: [3, 5, 3], compact: true, note: 'icosahedral, self-dual' },
  {
    sym: [5, 3, 5],
    compact: true,
    note: 'order-5 dodecahedral, self-dual',
  },
  // 11 paracompact regulars (ideal Euclidean elements)
  {
    sym: [3, 3, 6],
    compact: false,
    note: 'paracompact, tetrahedra / triangular-tiling vertex fig',
  },
  {
    sym: [6, 3, 3],
    compact: false,
    note: 'paracompact, hexagonal-tiling cells',
  },
  { sym: [3, 4, 4], compact: false, note: 'paracompact' },
  {
    sym: [4, 4, 3],
    compact: false,
    note: 'paracompact, square-tiling cells',
  },
  { sym: [3, 6, 3], compact: false, note: 'paracompact, self-dual' },
  { sym: [4, 3, 6], compact: false, note: 'paracompact' },
  { sym: [6, 3, 4], compact: false, note: 'paracompact' },
  {
    sym: [5, 3, 6],
    compact: false,
    note: 'paracompact (has a 5, non-crystallographic)',
  },
  {
    sym: [6, 3, 5],
    compact: false,
    note: 'paracompact (has a 5, non-crystallographic)',
  },
  {
    sym: [4, 4, 4],
    compact: false,
    note: 'paracompact, square-tiling cells and vertex fig',
  },
  {
    sym: [6, 3, 6],
    compact: false,
    note: 'paracompact, self-dual, hexagonal',
  },
]

const SCALE = 20000
const SURVEY_SCALE = 1200

function measure(
  sym: number[],
  scale: number = SCALE,
): {
  ok: boolean
  cells: number
  degree: number
  growth: number
  betheAlpha: number
} {
  return surveyTessellation({
    symbol: sym,
    maxCells: scale,
    growthFrom: 2,
    growthTo: 6,
  })
}

export function threedTessellations(): void {
  for (const c of HONEYCOMBS) {
    const crystallographic = c.sym.every(
      n => n === 3 || n === 4 || n === 6,
    )

    const m = measure(c.sym, SURVEY_SCALE)
    const tag = c.compact ? 'COMPACT' : 'paracompact'

    if (!m.ok) {
      continue
    }
  }
}

export default experiment({
  id: 'substrate-survey/3d-tessellations',
  title:
    'a sweep of 3D hyperbolic honeycombs, compact ones are non-crystallographic, crystallographic ones are paracompact',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    threedTessellations()

    const reference = measure([5, 3, 4])
    const ok = reference.ok && reference.degree === 12

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 3D hyperbolic regular honeycombs build as cell graphs, but no one is compact and crystallographic at once, the compact regulars contain a 5 and the crystallographic ones are paracompact, and all give a 2D horosphere',
      metrics: {
        referenceDegree: reference.degree,
        referenceBetheAlpha: reference.betheAlpha,
        referenceGrowth: reference.growth,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {5,3,4} builds with its dodecahedral degree 12. The compact-versus-crystallographic and 2D-horosphere conclusions are read from the Schlafli symbols and the cusp dimension, not measured here. This is a catalog entry that motivates the 4D substrate.',
    })
  },
})
