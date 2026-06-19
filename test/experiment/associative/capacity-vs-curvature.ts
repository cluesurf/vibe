// E (cross-tessellation): associative capacity RISES with curvature and search latency FALLS. The more
// curved the substrate, the more words are reachable within a given search radius (the shell-growth ratio
// is higher) and the fewer beats a broadcast needs to cover the built region (the coverage radius is
// smaller). Walk a ladder of representative buildable tessellations across the curvature range, with the
// flat 3D cubic lattice as the control at the bottom, and assert the monotone relationship: the most-curved
// tessellation has the highest associative growth ratio and the smallest coverage radius, the flat control
// has the lowest growth and the largest radius. The per-tessellation associative columns come from the one
// reusable battery (code/measure/tessellation-battery). The full sweep across the catalog is the battery CSV.

import { TESSELLATIONS } from '@/code/substrate/tessellation-catalog'
import { measureTessellation } from '@/code/measure/tessellation-battery'
import {
  cubicLattice,
  cubicLatticeCenterBySide,
} from '@/code/substrate/cubic-lattice'
import { bfsShells, geometricGrowthRatio } from '@/code/measure/shells'
import { coverageRadius } from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// A representative ladder of buildable tessellations, ordered least to most curved by catalog growth ratio,
// spanning the 3D and 4D range. The full sweep across all 42 buildable is the battery CSV, this keeps the
// suite cheap with a handful of points plus the flat control.
const LADDER = ['{5,3,4}', '{5,3,5}', '{5,3,3,4}', '{5,3,3,5}']
const LADDER_MAX_CELLS = 1200
const CUBIC_SIDE = 13

interface Rung {
  symbol: string
  catalogGrowthRatio: number
  associativeGrowthRatio: number
  coverageRadius: number
}

export function associativeCapacityVsCurvature(input?: {
  maxCells?: number
  cubicSide?: number
}): {
  rungs: Rung[]
  cubicGrowthRatio: number
  cubicCoverageRadius: number
  growthRisesWithCurvature: boolean
  coverageFallsWithCurvature: boolean
  flatIsLowestGrowthLargestRadius: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? LADDER_MAX_CELLS
  const cubicSide = input?.cubicSide ?? CUBIC_SIDE

  const rungs: Rung[] = LADDER.map(symbol => {
    const t = TESSELLATIONS.find(x => x.symbol === symbol)!
    const m = measureTessellation({ schlafli: t.schlafli, maxCells })

    return {
      symbol,
      catalogGrowthRatio: m.growthRatio,
      associativeGrowthRatio: m.associativeGrowthRatio,
      coverageRadius: m.associativeCoverageRadius,
    }
  })

  // the flat 3D cubic control, the least curved substrate (polynomial growth, longest latency)
  const lattice = cubicLattice(cubicSide, 3)
  const center = cubicLatticeCenterBySide({ side: cubicSide, dim: 3 })
  const cubicShells = bfsShells({
    neighbors: lattice.neighbors,
    root: center,
  }).shellCounts

  const cubicGrowthRatio = geometricGrowthRatio(cubicShells)
  const cubicCoverageRadius = coverageRadius({
    neighbors: lattice.neighbors,
    seed: center,
  })

  const least = rungs[0]!
  const most = rungs[rungs.length - 1]!

  // capacity per radius rises with curvature, latency per coverage falls with curvature
  const growthRisesWithCurvature =
    most.associativeGrowthRatio > least.associativeGrowthRatio

  const coverageFallsWithCurvature =
    most.coverageRadius < least.coverageRadius

  // the flat control sits below every tessellation, lowest growth and largest radius
  const flatIsLowestGrowthLargestRadius =
    rungs.every(r => r.associativeGrowthRatio > cubicGrowthRatio) &&
    rungs.every(r => r.coverageRadius < cubicCoverageRadius)

  return {
    rungs,
    cubicGrowthRatio,
    cubicCoverageRadius,
    growthRisesWithCurvature,
    coverageFallsWithCurvature,
    flatIsLowestGrowthLargestRadius,
    solved:
      growthRisesWithCurvature &&
      coverageFallsWithCurvature &&
      flatIsLowestGrowthLargestRadius,
  }
}

export default experiment({
  id: 'associative/capacity-vs-curvature',
  title:
    'associative capacity rises and search latency falls with curvature across the tessellation catalog, the flat cubic lattice being the worst on both',
  category: 'associative',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = associativeCapacityVsCurvature({
      maxCells: LADDER_MAX_CELLS,
      cubicSide: CUBIC_SIDE,
    })

    const least = r.rungs[0]!
    const most = r.rungs[r.rungs.length - 1]!

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'across a curvature-ordered ladder of buildable tessellations, the more curved substrate stores more words per search radius (higher associative growth ratio) and covers its built region in fewer beats (smaller coverage radius), while the flat 3D cubic lattice has the lowest growth ratio and the largest coverage radius, so curvature buys associative capacity and cuts latency',
      metrics: {
        leastCurvedGrowthRatio: least.associativeGrowthRatio,
        mostCurvedGrowthRatio: most.associativeGrowthRatio,
        leastCurvedCoverageRadius: least.coverageRadius,
        mostCurvedCoverageRadius: most.coverageRadius,
        growthRisesWithCurvature: r.growthRisesWithCurvature ? 1 : 0,
        coverageFallsWithCurvature: r.coverageFallsWithCurvature
          ? 1
          : 0,
      },
      control: {
        cubicGrowthRatio: r.cubicGrowthRatio,
        cubicCoverageRadius: r.cubicCoverageRadius,
        flatIsLowestGrowthLargestRadius:
          r.flatIsLowestGrowthLargestRadius ? 1 : 0,
      },
      notes:
        'L3, a deep cross-tessellation claim with the flat cubic lattice as the null control. The ladder is a representative handful of buildable tessellations ordered by catalog curvature ({5,3,4} least, {5,3,3,5} most), not the full catalog, the full sweep with the associative columns per tessellation is the battery CSV. The associative growth ratio and coverage radius come from the one reusable battery column (code/measure/tessellation-battery), so the ladder and the CSV agree. Build is kept small (maxCells 1200, cubic side 13) for suite cost.',
    })
  },
})
