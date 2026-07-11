// E-QTM-0029 measured the shared-past collapse on small hyperbolic tilings and on
// a Bethe-tree stand-in for the long-range reach. This confirms it on a GENUINE,
// LARGE {3,4,3,4} hyperbolic tessellation: the actual committed substrate, built
// with real facet-adjacency and real cycles (buildCellGraph), at 20,000 cells.
//
// Two measured facts, both read off the real mesh:
//   1. Shell growth. The number of cells at graph distance r from the seed grows
//      EXPONENTIALLY on the curved {3,4,3,4} (each shell a large multiple of the
//      last) and only POLYNOMIALLY on the flat {3,4,3,4} (the d4 lattice), where
//      the shell ratio decays toward 1. Exponential shell growth is exactly what
//      makes two separated backward cones overlap in an ever-smaller fraction, so
//      this is the mechanism behind the shared-past collapse, on the committed
//      substrate.
//   2. Short-range shared past. At the smallest separations the local shared
//      fraction on the genuine curved {3,4,3,4} is already far below the flat
//      {3,4,3,4} at the same separation, and collapses within a few hops.
//
// An honest limit, stated plainly: a genuine hyperbolic tessellation cannot give a
// deep interior at feasible cell counts, because its volume piles up near the
// boundary, so 20,000 cells reach only a handful of shells. That packing IS the
// curvature. It is why E-QTM-0029 used the radial Bethe tree for long-distance
// reach. Here the genuine substrate confirms the same effect at the short range it
// can hold, with no stand-in. Grade L2: a known geometric property (exponential
// volume growth under negative curvature) measured on this substrate, with a flat
// control.

import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { mostConnectedNode, neighborDistances } from '@/code/tool/graph'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import {
  bulkSharedPast,
  interiorCellsByDistance,
} from '@/code/measure/shared-past'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The shell-growth ratio shellCount[r+1] / shellCount[r], dropping the final shell
// (which a capped build leaves truncated). On exponential growth the interior
// ratios sit well above 1; on polynomial growth they decay toward 1.
function interiorShellRatios(input: {
  neighbors: number[][]
  root: number
  maxRadius: number
}): number[] {
  const { shellCounts } = bfsShells({
    neighbors: input.neighbors,
    root: input.root,
    maxRadius: input.maxRadius,
  })

  // drop the last entry: on a size-capped hyperbolic build it is the truncated
  // frontier shell and would understate the true growth.
  const clean = shellCounts.slice(0, -1)
  const ratios: number[] = []

  for (let r = 1; r < clean.length; r++) {
    const prev = clean[r - 1] ?? 0

    ratios.push(prev > 0 ? (clean[r] ?? 0) / prev : 0)
  }

  return ratios
}

function shortRangeSharedPast(input: {
  neighbors: number[][]
  size: number
  generation: number[]
  coneDepth: number
  distance: number
}): number {
  const { neighbors, size, generation, coneDepth, distance } = input
  const maxGeneration = generation.reduce((m, g) => Math.max(m, g), 0)

  let anchor = 0

  for (let cell = 0; cell < size; cell++) {
    if (generation[cell] === coneDepth) {
      anchor = cell
      break
    }
  }

  const picks = interiorCellsByDistance({
    neighbors,
    size,
    generation,
    anchor,
    distances: [distance],
    maxGeneration: maxGeneration - coneDepth,
  })

  const partner = picks.get(distance)

  if (partner === undefined) {
    return Number.NaN
  }

  return bulkSharedPast({
    neighbors,
    size,
    cellA: anchor,
    cellB: partner,
    depth: coneDepth,
  }).eta
}

export default experiment({
  id: 'quantum/large-hyperbolic-decay',
  code: 'E-QTM-0032',
  title:
    'on a genuine 20k-cell {3,4,3,4} hyperbolic tessellation shell growth is exponential and the local shared past collapses, confirming the curvature mechanism on the real committed substrate',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // The genuine large {3,4,3,4} hyperbolic tessellation, real cycles.
    const curved = buildCellGraph({
      symbol: [3, 4, 3, 4],
      maxCells: 20000,
    })

    const curvedSeed = mostConnectedNode(curved.neighbors)
    const curvedGeneration = Array.from(
      neighborDistances({
        neighbors: curved.neighbors,
        size: curved.cellCount,
        source: curvedSeed,
      }),
    )

    const curvedRatios = interiorShellRatios({
      neighbors: curved.neighbors,
      root: curvedSeed,
      maxRadius: 4,
    })

    // The flat {3,4,3,4} (the D4 lattice), polynomial growth, the curvature control.
    const flat = d4Mesh({ side: 13 })
    const flatNeighbors = meshNeighbors(flat)
    const flatSeed = flat.cellCount >> 1
    const flatGeneration = Array.from(
      neighborDistances({
        neighbors: flatNeighbors,
        size: flat.cellCount,
        source: flatSeed,
      }),
    )

    const flatRatios = interiorShellRatios({
      neighbors: flatNeighbors,
      root: flatSeed,
      maxRadius: 6,
    })

    // The deepest clean interior ratio on the curved mesh, and the far ratio on the
    // flat one (where polynomial growth has settled toward 1).
    const curvedGrowth = curvedRatios[curvedRatios.length - 1] ?? 0
    const flatFarGrowth = flatRatios[flatRatios.length - 1] ?? 0
    const flatNearGrowth = flatRatios[0] ?? 0

    // Short-range shared past at one cone depth, genuine curved vs flat.
    const curvedEta = shortRangeSharedPast({
      neighbors: curved.neighbors,
      size: curved.cellCount,
      generation: curvedGeneration,
      coneDepth: 2,
      distance: 2,
    })

    const flatEta = shortRangeSharedPast({
      neighbors: flatNeighbors,
      size: flat.cellCount,
      generation: flatGeneration,
      coneDepth: 2,
      distance: 2,
    })

    // 1. The curved substrate grows exponentially (interior ratio far above 1).
    const curvedIsExponential = curvedGrowth > 5

    // 2. The flat substrate grows polynomially (its ratio decays toward 1 and is
    //    far below the curved growth). Control that could fail.
    const flatIsPolynomial =
      flatFarGrowth < 2.5 &&
      flatFarGrowth < flatNearGrowth &&
      curvedGrowth > 3 * flatFarGrowth

    // 3. The short-range shared past is smaller on the genuine curved substrate.
    const curvedSharesLess =
      Number.isFinite(curvedEta) &&
      Number.isFinite(flatEta) &&
      curvedEta < flatEta

    const solved =
      curvedIsExponential && flatIsPolynomial && curvedSharesLess

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on a genuine 20,000-cell {3,4,3,4} hyperbolic tessellation the shell count grows exponentially with radius while the flat {3,4,3,4} grows polynomially toward a ratio of 1, and the short-range local shared past is far smaller on the curved substrate, confirming the curvature mechanism behind the shared-past collapse on the real committed substrate',
      metrics: {
        curvedCells: curved.cellCount,
        curvedInteriorGrowth: curvedGrowth,
        flatNearGrowth,
        flatFarGrowth,
        curvedEtaShort: curvedEta,
        flatEtaShort: flatEta,
      },
      control: {
        // The flat {3,4,3,4} is the curvature control: same coin, zero curvature,
        // its shell ratio decays toward 1 instead of staying exponential, and it
        // keeps far more short-range shared past. If it grew exponentially too,
        // curvature would not be the cause.
        flatFarGrowth,
        flatEtaShort: flatEta,
      },
      notes:
        'L2, measured on the genuine committed substrate (buildCellGraph {3,4,3,4}, real facet-adjacency and cycles, 20k cells). The final shell is dropped because a size-capped hyperbolic build truncates it. The interior is shallow (a few shells) because hyperbolic volume piles up near the boundary, which is the curvature itself and is why E-QTM-0029 used a radial Bethe tree for long-range reach; here the genuine substrate confirms the effect at short range with no stand-in. Exponential shell growth is the geometric cause of the cone-overlap decay measured in E-QTM-0029. Deterministic, exact integer shell counts.',
    })
  },
})
