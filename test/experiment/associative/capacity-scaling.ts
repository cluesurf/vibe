// B1: associative capacity grows EXPONENTIALLY with radius on the {3,4,3,4} bulk, where a flat 3D cubic
// memory grows only polynomially. Capacity within a given search radius is the number of cells (storable
// words) reachable in that many beats, so the per-radius growth ratio of the shells is the capacity growth.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  cubicLattice,
  cubicLatticeCenterBySide,
} from '@/code/substrate/cubic-lattice'
import { bfsShells, geometricGrowthRatio } from '@/code/measure/shells'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeCapacityScaling(input?: {
  maxCells?: number
  cubicSide?: number
}): {
  bulkCells: number
  cubicCells: number
  bulkGrowthRatio: number
  cubicGrowthRatio: number
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 3000
  const cubicSide = input?.cubicSide ?? 15
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const bulkShells = bfsShells({
    neighbors: g.neighbors,
    root: 0,
  }).shellCounts

  const bulkGrowthRatio = geometricGrowthRatio(bulkShells)

  const lat = cubicLattice(cubicSide, 3)
  const center = cubicLatticeCenterBySide({ side: cubicSide, dim: 3 })
  const cubicShells = bfsShells({
    neighbors: lat.neighbors,
    root: center,
  }).shellCounts

  const cubicGrowthRatio = geometricGrowthRatio(cubicShells)

  const solved =
    bulkGrowthRatio > 1.3 && bulkGrowthRatio > cubicGrowthRatio + 0.25

  return {
    bulkCells: g.cellCount,
    cubicCells: lat.size,
    bulkGrowthRatio,
    cubicGrowthRatio,
    solved,
  }
}

export default experiment({
  id: 'associative/capacity-scaling',
  code: 'E-MMR-0001',
  title:
    'bulk associative capacity grows exponentially with radius while a flat cubic memory grows polynomially',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = associativeCapacityScaling({
      maxCells: 3000,
      cubicSide: 15,
    })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'the per-radius shell growth ratio of the {3,4,3,4} bulk is well above one and well above the flat cubic control, so the words storable within a given search radius grow exponentially in the bulk and polynomially flat',
      metrics: {
        bulkCells: r.bulkCells,
        cubicCells: r.cubicCells,
        bulkGrowthRatio: r.bulkGrowthRatio,
        cubicGrowthRatio: r.cubicGrowthRatio,
      },
      control: { cubicGrowthRatio: r.cubicGrowthRatio },
    })
  },
})
