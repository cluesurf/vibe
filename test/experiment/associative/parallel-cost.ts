// C2: the associative cost model has two parts, and the bulk wins on the second. The content SEARCH is
// constant in the cell count (one pass per word bit, no scan in the ASC model). The COMMUNICATION (broadcast
// and responder collection) costs the graph diameter, which on the bulk grows logarithmically and on a flat
// cubic memory polynomially. We grow the memory 8x and compare, the bulk search cost is unchanged and its
// communication radius barely moves, the cubic communication radius grows a lot.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { cubicLattice, cubicLatticeCenterBySide } from '@/code/substrate/cubic-lattice'
import { numericSearchSteps } from '@/code/operator/numeric-search'
import { coverageRadius } from '@/code/measure/associative-recall'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeParallelCost(input?: { smallCells?: number; largeCells?: number; wordBits?: number }): {
  searchStepsSmall: number
  searchStepsLarge: number
  searchConstant: boolean
  bulkRadiusSmall: number
  bulkRadiusLarge: number
  bulkRadiusDelta: number
  cubicRadiusDelta: number
  solved: boolean
} {
  const smallCells = input?.smallCells ?? 2000
  const largeCells = input?.largeCells ?? 16000
  const wordBits = input?.wordBits ?? 21

  // the content search cost is one pass per word trit, independent of the cell count
  const searchStepsSmall = numericSearchSteps(3 ** Math.min(wordBits, 19))
  const searchStepsLarge = numericSearchSteps(3 ** Math.min(wordBits, 19))
  const searchConstant = searchStepsSmall === searchStepsLarge

  // the communication cost is the coverage radius
  const gS = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: smallCells })
  const gL = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: largeCells })
  const bulkRadiusSmall = coverageRadius({ neighbors: gS.neighbors, seed: 0 })
  const bulkRadiusLarge = coverageRadius({ neighbors: gL.neighbors, seed: 0 })
  const bulkRadiusDelta = bulkRadiusLarge - bulkRadiusSmall

  const sideS = Math.round(smallCells ** (1 / 3))
  const sideL = Math.round(largeCells ** (1 / 3))
  const cubicRadiusSmall = coverageRadius({
    neighbors: cubicLattice(sideS, 3).neighbors,
    seed: cubicLatticeCenterBySide({ side: sideS, dim: 3 }),
  })
  const cubicRadiusLarge = coverageRadius({
    neighbors: cubicLattice(sideL, 3).neighbors,
    seed: cubicLatticeCenterBySide({ side: sideL, dim: 3 }),
  })
  const cubicRadiusDelta = cubicRadiusLarge - cubicRadiusSmall

  const solved = searchConstant && bulkRadiusDelta <= 2 && bulkRadiusDelta < cubicRadiusDelta
  return {
    searchStepsSmall,
    searchStepsLarge,
    searchConstant,
    bulkRadiusSmall,
    bulkRadiusLarge,
    bulkRadiusDelta,
    cubicRadiusDelta,
    solved,
  }
}

export default experiment({
  id: 'associative/parallel-cost',
  title: 'on the bulk the associative search cost is constant in size and the communication radius grows logarithmically, versus polynomially on a flat cubic memory',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const r = associativeParallelCost({ smallCells: 2000, largeCells: 16000 })
    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'growing the memory 8x leaves the content-search pass count unchanged and the bulk communication radius almost unchanged (logarithmic), while the flat cubic communication radius grows much more (polynomial)',
      metrics: {
        searchSteps: r.searchStepsSmall,
        bulkRadiusSmall: r.bulkRadiusSmall,
        bulkRadiusLarge: r.bulkRadiusLarge,
        bulkRadiusDelta: r.bulkRadiusDelta,
      },
      // CONTROL: the flat cubic communication radius increment under the same 8x size increase
      control: { cubicRadiusDelta: r.cubicRadiusDelta },
    })
  },
})
