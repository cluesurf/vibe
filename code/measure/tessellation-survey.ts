// The shared per-symbol measurement used by the hyperbolic-tessellation survey experiments
// (2d/3d/4d/5d). Build the cell graph (or the flat Euclidean lattice) for a Schlafli symbol,
// find the highest-degree interior cell as the centre, then read the bulk degree, a near-shell
// growth ratio (the cosmology branching factor), the Bethe correlator exponent, and optionally
// the lazy-walk spectral dimension. The growth window and its denominator are parameterised so
// each survey reproduces its own near-shell average exactly.

import {
  buildCellGraph,
  buildEuclideanLattice,
} from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'
import { shellGrowthRatio } from '@/code/measure/shell-growth-ratio'
import {
  betheCorrelatorExponent,
  spectralDimension,
} from '@/code/measure/dimension'

export function surveyTessellation(input: {
  symbol: number[]
  flat?: boolean
  maxCells: number
  minCells?: number
  growthFrom?: number
  growthTo?: number
  safeDenominator?: boolean
  withSpectralDimension?: boolean
  specDimT1?: number
  specDimT2?: number
}): {
  ok: boolean
  cells: number
  degree: number
  growth: number
  betheAlpha: number
  specDim: number
} {
  try {
    const g = input.flat
      ? buildEuclideanLattice({
          symbol: input.symbol,
          maxCells: input.maxCells,
        })
      : buildCellGraph({
          symbol: input.symbol,
          maxCells: input.maxCells,
        })

    const N = g.cellCount,
      nb = g.neighbors

    const minCells = input.minCells ?? 50

    if (N < minCells) {
      return {
        ok: false,
        cells: N,
        degree: 0,
        growth: 0,
        betheAlpha: 0,
        specDim: 0,
      }
    }

    let center = 0,
      best = -1

    for (let i = 0; i < N; i++) {
      const d = nb[i]!.length

      if (d > best) {
        best = d
        center = i
      }
    }

    const degree = best
    const shell = bfsShells({ neighbors: nb, root: center }).shellCounts
    const growth = shellGrowthRatio({
      shellCounts: shell,
      from: input.growthFrom ?? 2,
      to: input.growthTo ?? 6,
      safeDenominator: input.safeDenominator,
    })

    const betheAlpha = betheCorrelatorExponent(degree)
    const specDim = input.withSpectralDimension
      ? Math.round(
          spectralDimension({
            neighbors: nb,
            start: center,
            t1: input.specDimT1 ?? 2,
            t2: input.specDimT2 ?? 4,
          }) * 100,
        ) / 100
      : 0

    return { ok: true, cells: N, degree, growth, betheAlpha, specDim }
  } catch (e) {
    return {
      ok: false,
      cells: 0,
      degree: 0,
      growth: 0,
      betheAlpha: 0,
      specDim: 0,
    }
  }
}
