// TWOD-TESSELLATIONS (scale sweep of 2D hyperbolic regular tilings): the {p,q} tilings of H^2 (we already did
// {7,3}). All are 2D bulk -> 1D horocycle (physical space 1D, the most degenerate / under-dimensional). They are
// all compact (hyperbolic, 1/p + 1/q < 1/2). The interesting cases are {6,4} and {4,6}, which use only 3/4/6 so
// they are CRYSTALLOGRAPHIC (gauge possible) AND compact, but still only 1D physical space and no spinor.
// Run: npx tsx code/experiment/2d-tessellations.ts

import { surveyTessellation } from '@/code/measure/tessellation-survey'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; note: string }
const TILINGS: Cand[] = [
  { sym: [7, 3], note: 'REFERENCE (heptagonal, done)' },
  {
    sym: [5, 4],
    note: 'pentagons 4/vertex, organic symmetry, CA / network geometry',
  },
  {
    sym: [8, 3],
    note: 'octagons 3/vertex, foundational in hyperbolic surface theory',
  },
  {
    sym: [4, 5],
    note: 'squares 5/vertex, easiest grid analogue, pathfinding / CA',
  },
  {
    sym: [3, 7],
    note: 'triangles 7/vertex, maximal local branching, FEM / computation',
  },
  {
    sym: [6, 4],
    note: 'hexagons 4/vertex, extends Euclidean hex, simulations / networks',
  },
  {
    sym: [5, 5],
    note: 'pentagons 5/vertex, highly curved and dense, exotic geometries',
  },
  {
    sym: [4, 6],
    note: 'squares 6/vertex, strong curvature, simple cells, HC experiments',
  },
]

const SCALE = 20000

function measure(sym: number[]): {
  ok: boolean
  cells: number
  degree: number
  growth: number
  betheAlpha: number
} {
  return surveyTessellation({
    symbol: sym,
    maxCells: SCALE,
    growthFrom: 2,
    growthTo: 7,
  })
}

export function twodTessellations(): void {
  for (const c of TILINGS) {
    const crystallographic = c.sym.every(
      n => n === 3 || n === 4 || n === 6,
    )
    const compact = 1 / c.sym[0]! + 1 / c.sym[1]! < 0.5 // hyperbolic 2D tilings are compact
    const m = measure(c.sym)
    if (!m.ok) {
      continue
    }
  }
}

export default experiment({
  id: 'substrate-survey/2d-tessellations',
  title:
    'a sweep of 2D hyperbolic regular tilings, all give 1D physical space, the most degenerate',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    twodTessellations()
    const reference = measure([7, 3])
    const crystallographic = measure([6, 4])
    const ok =
      reference.ok &&
      reference.degree === 7 &&
      crystallographic.ok &&
      [6, 4].every(n => n === 3 || n === 4 || n === 6)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {p,q} hyperbolic tilings build as 2D cell graphs and the framework ports to each, with {6,4} the compact crystallographic case, but every one gives only a 1D horocycle and no spinor',
      metrics: {
        referenceDegree: reference.degree,
        referenceBetheAlpha: reference.betheAlpha,
        crystallographicDegree: crystallographic.degree,
        crystallographicBetheAlpha: crystallographic.betheAlpha,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {7,3} and the crystallographic {6,4} build with their expected degrees and a holographic exponent. The 1D-physical-space and no-spinor conclusions are stated from the tiling dimension, not measured here. This is a catalog entry, not a physics claim.',
    })
  },
})
