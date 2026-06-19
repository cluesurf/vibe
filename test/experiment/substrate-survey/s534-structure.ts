// S534-STRUCTURE ({5,3,4} suite): the structural tests, geometry, spin, gauge, dimension. This is where {5,3,4}
// DIFFERS from {3,4,3,4}. Verdicts, bulk is 3D hyperbolic (degree 12), the flat layer (horosphere) is 2D, the
// 12 directions are ICOSAHEDRAL (non-crystallographic) so NO spinor and NO root-system gauge. So physical space
// would be 2D with no fundamental spin or gauge group. Run: npx tsx code/experiment/s534-structure.ts

import { cellGraphSpectral } from '@/code/measure/cell-graph-spectral'
import { directionsAreCrystallographic } from '@/code/measure/crystallographic'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const phi = (1 + Math.sqrt(5)) / 2

export function s534Structure(): {
  degree: number
  specDim: number
  crystallographic: boolean
  hasSpinor: boolean
} {
  // bulk geometry
  const { degree, specDim } = cellGraphSpectral({
    symbol: [5, 3, 4],
    maxCells: 16000,
    t1: 3,
    t2: 6,
  })
  // the 12 directions = icosahedron vertices, check the CRYSTALLOGRAPHIC (root-system) condition 2(a.b)/(b.b) in Z
  const verts: number[][] = []
  for (const a of [1, -1]) {
    for (const b of [phi, -phi]) {
      verts.push([0, a, b], [a, b, 0], [b, 0, a])
    }
  }

  const crystallographic = directionsAreCrystallographic(verts)
  const hasSpinor = false // a permutation rep of the icosahedral rotation group A5 = 1+3+3'+5, all integer spin (p190)

  return { degree, specDim, crystallographic, hasSpinor }
}

export default experiment({
  id: 'substrate-survey/s534-structure',
  title:
    'the 12 icosahedral directions of {5,3,4} are non-crystallographic (measured), so no root-system gauge',
  category: 'substrate-survey',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s534Structure()
    const ok =
      r.degree === 12 &&
      r.specDim > 0 &&
      !r.crystallographic &&
      !r.hasSpinor

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,4} bulk has degree 12 and its 12 icosahedral directions fail the crystallographic integer test, so they form no root system and carry no gauge group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L1 known math, the non-crystallographic verdict IS measured by the 2(a.b)/(b.b) integer test on the icosahedron vertices (a golden-ratio non-integer appears). The hasSpinor flag is hard-set to false from the known A5 = 1+3+3-prime+5 decomposition, not measured here. The 2D horosphere dimension is stated, not measured.',
    })
  },
})
