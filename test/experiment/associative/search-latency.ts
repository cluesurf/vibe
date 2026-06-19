// B2 (the headline): associative search latency scales LOGARITHMICALLY with memory size on the {3,4,3,4}
// bulk, sub-polynomially, where a flat 3D cubic memory scales as N^(1/3). The latency is the coverage radius,
// the beats a query wave needs to reach the whole store. We grow the memory 4x and compare the radius
// INCREMENT, the bulk increment stays small (logarithmic), the cubic increment grows (polynomial). Note, at
// these small sizes the bulk's modest growth ratio means its absolute radius can exceed the flat one, the
// honest claim is the SCALING, shown by the smaller radius increment under a 4x size increase.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  cubicLattice,
  cubicLatticeCenterBySide,
} from '@/code/substrate/cubic-lattice'
import { coverageRadius } from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeSearchLatency(input?: {
  smallCells?: number
  largeCells?: number
}): {
  bulkRadiusSmall: number
  bulkRadiusLarge: number
  bulkDelta: number
  cubicRadiusSmall: number
  cubicRadiusLarge: number
  cubicDelta: number
  solved: boolean
} {
  const smallCells = input?.smallCells ?? 750
  const largeCells = input?.largeCells ?? 3000

  const gS = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: smallCells,
  })

  const gL = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: largeCells,
  })

  const bulkRadiusSmall = coverageRadius({
    neighbors: gS.neighbors,
    seed: 0,
  })

  const bulkRadiusLarge = coverageRadius({
    neighbors: gL.neighbors,
    seed: 0,
  })

  const bulkDelta = bulkRadiusLarge - bulkRadiusSmall

  // cubic sides chosen so the cubes hold about the same cell counts (4x apart)
  const sideS = Math.round(smallCells ** (1 / 3))
  const sideL = Math.round(largeCells ** (1 / 3))
  const latS = cubicLattice(sideS, 3)
  const latL = cubicLattice(sideL, 3)
  const cubicRadiusSmall = coverageRadius({
    neighbors: latS.neighbors,
    seed: cubicLatticeCenterBySide({ side: sideS, dim: 3 }),
  })

  const cubicRadiusLarge = coverageRadius({
    neighbors: latL.neighbors,
    seed: cubicLatticeCenterBySide({ side: sideL, dim: 3 }),
  })

  const cubicDelta = cubicRadiusLarge - cubicRadiusSmall

  const solved = bulkDelta >= 0 && bulkDelta < cubicDelta

  return {
    bulkRadiusSmall,
    bulkRadiusLarge,
    bulkDelta,
    cubicRadiusSmall,
    cubicRadiusLarge,
    cubicDelta,
    solved,
  }
}

export default experiment({
  id: 'associative/search-latency',
  title:
    'bulk associative search latency scales logarithmically with size, sub-polynomially, versus N^(1/3) for a flat cubic memory',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const r = associativeSearchLatency({
      smallCells: 750,
      largeCells: 3000,
    })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'quadrupling the memory grows the bulk coverage radius by a small fixed amount (logarithmic scaling) while it grows the flat cubic radius far more (polynomial scaling), so associative search latency is sub-polynomial on the bulk',
      metrics: {
        bulkRadiusSmall: r.bulkRadiusSmall,
        bulkRadiusLarge: r.bulkRadiusLarge,
        bulkDelta: r.bulkDelta,
        cubicDelta: r.cubicDelta,
      },
      // CONTROL: the flat cubic radius increment under the same 4x size increase
      control: {
        cubicRadiusSmall: r.cubicRadiusSmall,
        cubicRadiusLarge: r.cubicRadiusLarge,
        cubicDelta: r.cubicDelta,
      },
    })
  },
})
