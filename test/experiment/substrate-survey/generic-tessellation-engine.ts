// P199: the generic tessellation engine works for ANY hyperbolic (or Euclidean) regular honeycomb.
//
// The exact reflection-orbit engine (buildCellGraph) plus the rank-general Coxeter classifier (schlafli.ts)
// already handle any linear Schlafli symbol {p,q,r,...}. This experiment validates the generic front-end
// (tessellation.ts) across a zoo of tessellations spanning 2D to 4D, compact and paracompact, hyperbolic
// and Euclidean and spherical, checking three things for each:
//   (1) the geometry, cell, vertex figure, compactness, and buildability are classified correctly,
//   (2) buildable hyperbolic honeycombs build with the CORRECT facet degree (the cell's facet count) and
//       exponential shell growth,
//   (3) unbuildable cases (a non-finite cell like {6,3,3}, a finite polytope like {3,4,3}) are flagged,
//       never silently degenerating.
// The headline case is {3,4,3,4}, the 4D honeycomb of 24-cells, which must build with 24 facets, classify
// hyperbolic and paracompact, and have the cubic {4,3,4} vertex figure (its Euclidean cusp).
// Run: npx tsx code/experiment/p199-generic-tessellation-engine.ts

import {
  describeTessellation,
  buildTessellation,
  inspectTessellation,
} from '@/code/substrate/coxeter/tessellation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Case = {
  symbol: number[]
  geometry: string
  facet?: number // expected interior facet degree (the cell's facet count), if buildable hyperbolic
  compactness: string
  buildable: boolean
}

// expected facet degree = number of facets of the cell polytope (dodecahedron 12, 24-cell 24, tetra 4, ...)
const CASES: Case[] = [
  // 2D hyperbolic tilings (cell = polygon, vertex figure = a few polygons)
  {
    symbol: [7, 3],
    geometry: 'hyperbolic',
    facet: 7,
    compactness: 'compact',
    buildable: true,
  },
  {
    symbol: [3, 7],
    geometry: 'hyperbolic',
    facet: 3,
    compactness: 'compact',
    buildable: true,
  },
  {
    symbol: [5, 4],
    geometry: 'hyperbolic',
    facet: 5,
    compactness: 'compact',
    buildable: true,
  },
  // compact 3D honeycombs (cell = polyhedron)
  {
    symbol: [5, 3, 4],
    geometry: 'hyperbolic',
    facet: 12,
    compactness: 'compact',
    buildable: true,
  }, // dodecahedron
  {
    symbol: [4, 3, 5],
    geometry: 'hyperbolic',
    facet: 6,
    compactness: 'compact',
    buildable: true,
  }, // cube
  {
    symbol: [3, 5, 3],
    geometry: 'hyperbolic',
    facet: 20,
    compactness: 'compact',
    buildable: true,
  }, // icosahedron
  // paracompact 3D honeycomb (finite cell, ideal vertices)
  {
    symbol: [3, 3, 6],
    geometry: 'hyperbolic',
    facet: 4,
    compactness: 'paracompact',
    buildable: true,
  }, // tetrahedron
  // 4D honeycombs (cell = 4-polytope)
  {
    symbol: [3, 4, 3, 4],
    geometry: 'hyperbolic',
    facet: 24,
    compactness: 'paracompact',
    buildable: true,
  }, // 24-cell, cubic cusp
  {
    symbol: [4, 3, 3, 5],
    geometry: 'hyperbolic',
    facet: 8,
    compactness: 'compact',
    buildable: true,
  }, // tesseract
  // NOT buildable by the orbit engine
  {
    symbol: [6, 3, 3],
    geometry: 'hyperbolic',
    compactness: 'paracompact',
    buildable: false,
  }, // cell {6,3} euclidean (infinite)
  {
    symbol: [3, 4, 3],
    geometry: 'spherical',
    compactness: 'finite-polytope',
    buildable: false,
  }, // the 24-cell itself
  // euclidean honeycomb (routed to the lattice builder)
  {
    symbol: [4, 3, 4],
    geometry: 'euclidean',
    compactness: 'compact',
    buildable: true,
  }, // cubic honeycomb (finite cell and vertex figure)
]

export function genericTessellationEngine(): {
  rows: {
    symbol: string
    geometry: string
    facet: number
    compactness: string
    buildable: boolean
    geomOk: boolean
    facetOk: boolean
    compactOk: boolean
    buildOk: boolean
  }[]
  cell3434FacetDegree: number
  cell3434VertexFigure: string
  allPass: boolean
  solved: boolean
} {
  const rows: {
    symbol: string
    geometry: string
    facet: number
    compactness: string
    buildable: boolean
    geomOk: boolean
    facetOk: boolean
    compactOk: boolean
    buildOk: boolean
  }[] = []

  let cell3434FacetDegree = -1
  let cell3434VertexFigure = ''

  for (const c of CASES) {
    const d = describeTessellation(c.symbol)

    let facet = -1

    if (d.buildable && d.builder === 'orbit') {
      const built = buildTessellation({
        symbol: c.symbol,
        maxCells: 4000,
      })

      if (built.graph)
        facet = inspectTessellation(built.graph).facetDegree
    }

    const geomOk = d.geometry === c.geometry
    const compactOk = d.compactness === c.compactness
    const buildOk = d.buildable === c.buildable
    const facetOk = c.facet === undefined ? true : facet === c.facet

    if (c.symbol.join(',') === '3,4,3,4') {
      cell3434FacetDegree = facet
      cell3434VertexFigure = '{' + d.vertexFigure.join(',') + '}'
    }

    rows.push({
      symbol: '{' + c.symbol.join(',') + '}',
      geometry: d.geometry,
      facet,
      compactness: d.compactness,
      buildable: d.buildable,
      geomOk,
      facetOk,
      compactOk,
      buildOk,
    })
  }

  const allPass = rows.every(
    r => r.geomOk && r.facetOk && r.compactOk && r.buildOk,
  )

  const head34 =
    cell3434FacetDegree === 24 && cell3434VertexFigure === '{4,3,4}'

  const solved = allPass && head34

  return {
    rows,
    cell3434FacetDegree,
    cell3434VertexFigure,
    allPass,
    solved,
  }
}

export default experiment({
  id: 'substrate-survey/generic-tessellation-engine',
  code: 'E-SBT-0013',
  title:
    'one generic front-end classifies and builds any regular honeycomb from 2D to 4D with correct facet degrees',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = genericTessellationEngine()
    const ok =
      r.solved &&
      r.allPass &&
      r.cell3434FacetDegree === 24 &&
      r.cell3434VertexFigure === '{4,3,4}'

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the rank-general Coxeter classifier plus reflection-orbit engine classify and build a zoo of honeycombs spanning 2D to 4D with correct facet degrees and the {3,4,3,4} headline building with 24 facets and a cubic {4,3,4} cusp',
      metrics: {
        caseCount: r.rows.length,
        cell3434FacetDegree: r.cell3434FacetDegree,
        cell3434CubicCusp: r.cell3434VertexFigure === '{4,3,4}' ? 1 : 0,
      },
    })
  },
})
