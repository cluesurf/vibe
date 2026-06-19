// The dimension of a regular hyperbolic honeycomb, read the curvature-AWARE way.
//
// A strongly curved honeycomb has no Euclidean regime: its balls grow exponentially
// at every scale, so a flat-calibrated spectral-dimension or shell-slope estimator
// cannot read its topological dimension (the curvature inflates the reading and there
// is no scale window where it is flat). The dimension does, however, live cleanly on
// the FLAT cusp. The ideal boundary of the bulk is a horosphere, a flat Euclidean
// slice (the cubic honeycomb {4,3,...}), whose own ball growth IS polynomial, so its
// dimension can be read directly. The bulk is then one dimension higher than its cusp,
// because the cusp is a codimension-one horosphere of the bulk.
//
// So this measures the cusp dimension (polynomial, clean) and reports the bulk
// dimension as cusp + 1, with the bulk's exponential growth ratio as the curvature
// signature that distinguishes the two. Reuses buildHorosphere / proximityGraph
// (the in-surface adjacency) / bfsShells / growthFromShells.

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

export type CuspDimension = {
  // number of cells in the extracted horosphere slice
  cuspCells: number
  // the effective dimension of the cusp, read off its in-surface shell growth
  // (a flat (d-1)-sheet reads near d-1)
  cuspDim: number
  // the cusp shell-growth ratio (near 1 for a flat polynomial slice)
  cuspRatio: number
  // the bulk shell-growth ratio (well above 1, the exponential curvature signature)
  bulkRatio: number
  // the inferred bulk dimension, cusp dimension rounded up by one
  bulkDim: number
}

// Read the cusp (horosphere) dimension and the bulk growth ratio for a honeycomb.
// bandHalfWidth and the radii are tuned per substrate by the caller, since the right
// slice thickness depends on the cell size at the sampled depth; bigger maxCells is a
// more accurate measurement (more cells in the slice), never a knob to trade for speed.
export function cuspDimension(input: {
  symbol: number[]
  maxCells: number
  bandHalfWidth: number
  bulkMaxRadius?: number
  cuspMaxRadius?: number
}): CuspDimension {
  const {
    symbol,
    maxCells,
    bandHalfWidth,
    bulkMaxRadius = 6,
    cuspMaxRadius = 16,
  } = input

  // the bulk grows exponentially (the curvature signature) off the face-adjacency BFS
  const bulk = buildCellGraph({ symbol, maxCells })
  const bulkGrowth = growthFromShells(
    bfsShells({
      neighbors: bulk.neighbors,
      root: 0,
      maxRadius: bulkMaxRadius,
    }).shellCounts,
  )

  // the cusp is the Busemann level set (a flat slice); its in-surface proximity graph
  // grows polynomially, so growthFromShells reads its true (d-1) dimension
  const horo = buildHorosphere({ symbol, maxCells, bandHalfWidth })
  const prox = proximityGraph({ coords: horo.coords })
  const center = centerNearestOrigin(horo.coords)
  const cuspGrowth = growthFromShells(
    bfsShells({ neighbors: prox, root: center, maxRadius: cuspMaxRadius })
      .shellCounts,
  )

  return {
    cuspCells: horo.cellCount,
    cuspDim: cuspGrowth.dim,
    cuspRatio: cuspGrowth.ratio,
    bulkRatio: bulkGrowth.ratio,
    bulkDim: Math.round(cuspGrowth.dim) + 1,
  }
}
