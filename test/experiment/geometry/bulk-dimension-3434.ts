// P195: spectral dimension of the {3,4,3,4} substrate. The 4D bulk reads ~4 at small scale (a genuine 4D
// hyperbolic bulk), calibrated against 4D and 3D grids; the cusp {4,3,4} is flat 3D. Ported from the
// throwaway probe. Run: npx tsx code/experiment/p195-bulk-dimension-3434.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { cubicLattice, cubicLatticeCenterBySide } from '@/code/substrate/cubic-lattice'
import { spectralDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The small-scale spectral dimension is the lazy-walk return exponent (spectralDimension
// in code/measure/dimension); the central difference at t = 4 is the endpoint slope
// between t = 2 and t = 6. The calibration grids are cubic lattices (code/substrate).
// The d_s at t = 4 reads the genuine small-scale dimension.

export function bulkDimension(): { d4: number; d3: number; bulk: number } {
  const g4 = cubicLattice(13, 4)
  const g3 = cubicLattice(40, 3)
  const d4 = spectralDimension({ neighbors: g4.neighbors, start: cubicLatticeCenterBySide({ side: 13, dim: 4 }), t1: 2, t2: 6 })
  const d3 = spectralDimension({ neighbors: g3.neighbors, start: cubicLatticeCenterBySide({ side: 40, dim: 3 }), t1: 2, t2: 6 })
  const g34 = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 50000 })
  let c = 0, best = -1
  for (let i = 0; i < g34.cellCount; i++) { const d = g34.neighbors[i]!.length; if (d > best) { best = d; c = i } }
  const bulk = spectralDimension({ neighbors: g34.neighbors, start: c, t1: 2, t2: 6 })
  return { d4, d3, bulk }
}

// The {3,4,3,4} bulk is genuinely four dimensional. We measure the small-scale spectral
// dimension of the cell graph by a lazy random walk return probability, and it reads near
// 4, the same as a 4D grid and clearly above a 3D grid (the calibration controls). The 4D
// grid reading ~4 and the 3D grid reading ~3 are the controls that give the {3,4,3,4}
// number its meaning. This is a measured property of a known tessellation, an established
// mathematical fact, so L1.
export default defineExperiment({
  id: 'geometry/bulk-dimension-3434',
  title: 'the {3,4,3,4} bulk reads spectral dimension ~4, a genuine 4D substrate',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = bulkDimension()
    const calibrationOk = Math.abs(r.d4 - 4) < 0.6 && Math.abs(r.d3 - 3) < 0.6
    const bulkIs4D = Math.abs(r.bulk - 4) < 0.7
    const ok = calibrationOk && bulkIs4D
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the small-scale spectral dimension of the {3,4,3,4} bulk reads near 4, matching a 4D grid and above a 3D grid',
      metrics: {
        bulkDimension: r.bulk,
        grid4dDimension: r.d4,
        grid3dDimension: r.d3,
      },
      control: {
        grid4dDimension: r.d4,
        grid3dDimension: r.d3,
      },
      notes:
        'L1, the dimension of a known tessellation measured by a lazy-walk return exponent. The 4D and 3D grids are the calibration controls. Not a discovery, an established geometric fact.',
    })
  },
})
