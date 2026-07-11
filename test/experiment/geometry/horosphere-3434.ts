// P196: extract the HOROSPHERE from the {3,4,3,4} 4D bulk (the same buildHorosphereBand used for {5,3,4}) and
// measure it. The generic band is a thin slab reading ~2.5D (the clean flat-3D {4,3,4} is the special cusp,
// not a generic horosphere). Ported from the throwaway probe.
// Run: npx tsx code/experiment/p196-horosphere-3434.ts

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { spectralDimension } from '@/code/measure/dimension'
import { mostConnectedNode } from '@/code/tool/graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function horosphere3434(): {
  cells: number
  meanDegree: number
  specDim16: number
} {
  const slab = buildHorosphereBand({
    symbol: [3, 4, 3, 4] as never,
    maxBand: 3000,
    half: 0.5,
    margin: 0.6,
  })

  const n = slab.cellCount

  let sum = 0

  for (let i = 0; i < n; i++) sum += slab.neighbors[i]!.length

  const center = mostConnectedNode(slab.neighbors)
  // spectral dimension via the lazy-walk return probability, the central difference at
  // t = 16 is the endpoint slope between t = 14 and t = 18.
  const specDim16 = spectralDimension({
    neighbors: slab.neighbors,
    start: center,
    t1: 14,
    t2: 18,
  })

  const meanDegree = Math.round((sum / n) * 10) / 10

  return { cells: n, meanDegree, specDim16 }
}

// The generic horosphere of the {3,4,3,4} bulk is a thin slab, not clean flat 3D space. We
// extract the band with the same horosphere builder used for {5,3,4} and measure its
// spectral dimension, which reads near 2.5, a thin slab between a surface and a volume. The
// clean flat-3D {4,3,4} is the special cusp, not a generic horosphere. This is an honest
// structural finding, not the headline result, so paper is false. L1, a measured property
// of a known tessellation.
export default experiment({
  id: 'geometry/horosphere-3434',
  code: 'E-GMT-0017',
  title:
    'the generic {3,4,3,4} horosphere band is a thin slab (~2.5D), not clean flat 3D',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const r = horosphere3434()
    const thinSlab = r.specDim16 > 2 && r.specDim16 < 3
    const ok = thinSlab && r.cells > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the generic horosphere band of the {3,4,3,4} bulk reads spectral dimension near 2.5, a thin slab rather than clean flat 3D space',
      metrics: {
        bandCells: r.cells,
        meanDegree: r.meanDegree,
        spectralDimension: r.specDim16,
      },
      notes:
        'L1, a measured property of a known tessellation, and an honest structural finding. The generic band is a thin slab, the clean flat-3D {4,3,4} is the special cusp, not a generic horosphere.',
    })
  },
})
