// P142: the horosphere is a FLAT layer inside the curved {5,3,4}. (coxeter-reflection-structures.md, P133, P137.)
//
// The QFT and Lorentz physics belong to an emergent FLAT geometry, not the hyperbolic scaffold (P133,
// P134, P137). The natural flat surface inside hyperbolic space is a HOROSPHERE. {5,3,4} is cocompact, so
// a horosphere is not a reflection subgroup, it is a flat SURFACE the cells cross aperiodically
// (buildHorosphere extracts it as a Busemann level set). This verifies the extracted sheet is genuinely
// FLAT, its cell count grows POLYNOMIALLY (like a Euclidean disk, count ~ r^2), in sharp contrast to the
// bulk, whose ball grows EXPONENTIALLY. Flat growth confirms the horosphere is the Euclidean layer.
// Run: npx tsx code/experiment/p142-horosphere-flat.ts

import {
  buildCellGraph,
  buildHorosphere,
} from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { growthFromShells } from '@/code/measure/dimension'
import {
  centerNearestOrigin,
  proximityGraph,
} from '@/code/substrate/proximity-graph'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The geometry is read intrinsically off the connectivity: BFS shells (bfsShells), an
// effective dimension and shell ratio from them (growthFromShells), and for the sheet
// its in-surface nearest-neighbour adjacency (proximityGraph, seeded at the cell
// nearest the origin). All live in code/measure and code/substrate.

export function horosphereFlat(input?: { maxCells?: number }): {
  bulkCells: number
  horoCells: number
  horoDim: number
  horoRatio: number
  bulkRatio: number
  horoIsFlat: boolean
  bulkIsExponential: boolean
  flatterThanBulk: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 14000
  const bulk = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const horo = buildHorosphere({
    symbol: [5, 3, 4],
    maxCells,
    bandHalfWidth: 0.3,
  })

  // bulk: intrinsic growth via the face-adjacency BFS shells (exponential on the hyperbolic crystal)
  const bulkG = growthFromShells(
    bfsShells({ neighbors: bulk.neighbors, root: 0, maxRadius: 9 })
      .shellCounts,
  )

  // horosphere: build the in-surface PROXIMITY graph, then BFS shells (linear if flat, exponential if curved)
  const prox = proximityGraph({ coords: horo.coords })
  const hc = centerNearestOrigin(horo.coords)
  const horoG = growthFromShells(
    bfsShells({ neighbors: prox, root: hc, maxRadius: 14 }).shellCounts,
  )

  // flat = POLYNOMIAL (finite-dimensional, sub-exponential) growth, the slab is a few cells thick so the
  // dimension sits a little above 2, the decisive signal is polynomial vs the bulk's exponential
  const horoIsFlat =
    horoG.dim > 1.4 && horoG.dim < 3.5 && horoG.ratio < 2.6

  const bulkIsExponential = bulkG.ratio > 1.8 // shells multiply
  const flatterThanBulk = horoG.ratio < bulkG.ratio - 1.5 // far flatter than the exponential bulk
  const solved = horoIsFlat && bulkIsExponential && flatterThanBulk

  return {
    bulkCells: bulk.cellCount,
    horoCells: horo.cellCount,
    horoDim: horoG.dim,
    horoRatio: horoG.ratio,
    bulkRatio: bulkG.ratio,
    horoIsFlat,
    bulkIsExponential,
    flatterThanBulk,
    solved,
  }
}

export default experiment({
  id: 'geometry/horosphere-flat',
  title:
    'a Busemann level set of {5,3,4} grows polynomially, a flat 2D sheet inside the curved crystal',
  category: 'geometry',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = horosphereFlat({ maxCells: 14000 })
    const ok =
      r.solved &&
      r.horoIsFlat &&
      r.bulkIsExponential &&
      r.flatterThanBulk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a horosphere of {5,3,4} grows polynomially with effective dimension near two while the bulk grows exponentially, the natural Euclidean flat layer inside the curved crystal',
      metrics: {
        horoDimension: r.horoDim,
        horoRatio: r.horoRatio,
      },
      control: {
        bulkRatio: r.bulkRatio,
      },
    })
  },
})
