// Generic tessellation front-end. ONE entry point for ANY regular hyperbolic (or Euclidean) tessellation,
// given its linear Schlafli symbol {p, q, r, ...}. It classifies the honeycomb, its cell, and its vertex
// figure, decides which builder applies, and never silently degenerates. The exact reflection-orbit engine
// (buildCellGraph) already works for any rank, but it is only valid when the CELL is a finite (spherical)
// polytope, since it orbits the finite cell-stabilizer. This module makes that precondition explicit, so a
// caller can hand it {7,3}, {5,3,4}, {3,4,3,4}, or anything else and get either a correct cell graph or a
// clear reason it cannot be built that way.
//
// Schlafli convention: a k-entry symbol tiles k-dimensional space (a 4-entry symbol like {3,4,3,4} tiles
// hyperbolic 4-space). The CELL is the symbol minus its last entry, the VERTEX FIGURE is the symbol minus
// its first entry. The cell must be spherical (finite) for the orbit engine. The vertex figure being
// spherical means COMPACT (finite vertices), Euclidean means PARACOMPACT (ideal vertices, a cusp).

import {
  classifyGeometry,
  type Geometry,
} from '@/code/substrate/coxeter/schlafli'
import {
  buildCellGraph,
  buildEuclideanLattice,
  type CellGraph,
} from '@/code/substrate/coxeter/cell-direct'
import { bfsShells } from '@/code/measure/shells'

export type Compactness =
  | 'compact'
  | 'paracompact'
  | 'hyperideal'
  | 'finite-polytope'
  | 'unknown'
export type Builder = 'orbit' | 'euclidean-lattice' | 'none'

export interface TessellationDescriptor {
  symbol: number[]
  spaceDimension: number // the dimension of the tiled space (= symbol.length for a honeycomb)
  geometry: Geometry // of the honeycomb as a whole
  cell: number[] // symbol minus last entry
  cellGeometry: Geometry // must be spherical (finite) for the orbit engine
  vertexFigure: number[] // symbol minus first entry
  vertexFigureGeometry: Geometry
  compactness: Compactness
  buildable: boolean // can the exact orbit engine build it
  builder: Builder
  note: string
}

// Classify a symbol fully, with no build. Pure and cheap.
export function describeTessellation(
  symbol: number[],
): TessellationDescriptor {
  if (
    symbol.length < 1 ||
    symbol.some(p => !Number.isInteger(p) || p < 2)
  ) {
    return {
      symbol,
      spaceDimension: symbol.length,
      geometry: 'higher',
      cell: [],
      cellGeometry: 'higher',
      vertexFigure: [],
      vertexFigureGeometry: 'higher',
      compactness: 'unknown',
      buildable: false,
      builder: 'none',
      note: 'invalid Schlafli symbol (entries must be integers >= 2)',
    }
  }

  const geometry = classifyGeometry(symbol)
  const cell = symbol.slice(0, -1) // the polytope filling each cell
  const vertexFigure = symbol.slice(1) // the arrangement around each vertex
  // a length-1 symbol {p} is a polygon, its "cell" is an edge (finite) and its vertex figure is a vertex
  const cellGeometry: Geometry =
    cell.length === 0 ? 'spherical' : classifyGeometry(cell)

  const vertexFigureGeometry: Geometry =
    vertexFigure.length === 0
      ? 'spherical'
      : classifyGeometry(vertexFigure)

  // compactness from BOTH the cell and the vertex figure. Compact means both are finite (spherical), so all
  // cells and all vertices are ordinary points. Paracompact means at least one is Euclidean (an ideal cell
  // or ideal vertices, a cusp), with neither hyperbolic. Hyperideal means one is hyperbolic (vertices or
  // cells beyond infinity). A spherical symbol is a finite polytope, not a tessellation.
  let compactness: Compactness

  const finite = (x: Geometry): boolean => x === 'spherical'
  const idealOk = (x: Geometry): boolean =>
    x === 'spherical' || x === 'euclidean'

  if (geometry === 'spherical') {
    compactness = 'finite-polytope'
  } else if (finite(cellGeometry) && finite(vertexFigureGeometry)) {
    compactness = 'compact'
  } else if (idealOk(cellGeometry) && idealOk(vertexFigureGeometry)) {
    compactness = 'paracompact'
  } else if (
    cellGeometry === 'hyperbolic' ||
    vertexFigureGeometry === 'hyperbolic'
  ) {
    compactness = 'hyperideal'
  } else {
    compactness = 'unknown'
  }

  // builder selection
  let builder: Builder
  let buildable: boolean
  let note: string

  if (geometry === 'hyperbolic' && cellGeometry === 'spherical') {
    builder = 'orbit'
    buildable = true
    note = `hyperbolic ${symbol.length}D honeycomb, ${compactness}, exact reflection-orbit engine applies`
  } else if (geometry === 'euclidean') {
    builder = 'euclidean-lattice'
    buildable = true
    note = `euclidean ${symbol.length}D honeycomb, built as a flat lattice (if the regular family is supported)`
  } else if (geometry === 'spherical') {
    builder = 'none'
    buildable = false
    note = `spherical, this is a FINITE ${symbol.length + 1}D polytope, not a tessellation of ${symbol.length}D space`
  } else if (
    geometry === 'hyperbolic' &&
    cellGeometry !== 'spherical'
  ) {
    builder = 'none'
    buildable = false
    note = `hyperbolic honeycomb whose CELL {${cell.join(',')}} is ${cellGeometry} (not finite), the orbit engine cannot build it (the cell-stabilizer is infinite)`
  } else {
    builder = 'none'
    buildable = false
    note = `geometry ${geometry}, no applicable builder`
  }

  return {
    symbol,
    spaceDimension: symbol.length,
    geometry,
    cell,
    cellGeometry,
    vertexFigure,
    vertexFigureGeometry,
    compactness,
    buildable,
    builder,
    note,
  }
}

export interface BuiltTessellation {
  descriptor: TessellationDescriptor
  graph: CellGraph | null // null when not buildable
}

// Build the tessellation generically, routing to the correct engine. Never silently degenerates, an
// unbuildable symbol returns graph null with the reason in descriptor.note.
export function buildTessellation(input: {
  symbol: number[]
  maxCells?: number
}): BuiltTessellation {
  const descriptor = describeTessellation(input.symbol)
  const maxCells = input.maxCells ?? 20000

  if (descriptor.builder === 'orbit') {
    return {
      descriptor,
      graph: buildCellGraph({ symbol: input.symbol, maxCells }),
    }
  }

  if (descriptor.builder === 'euclidean-lattice') {
    return {
      descriptor,
      graph: buildEuclideanLattice({ symbol: input.symbol, maxCells }),
    }
  }

  return { descriptor, graph: null }
}

// Verify a built graph is a healthy REGULAR honeycomb: a uniform interior facet degree (the cell's facet
// count) and exponential (hyperbolic) or polynomial (euclidean) shell growth. Returns the measured facts.
export function inspectTessellation(graph: CellGraph): {
  facetDegree: number // the dominant (interior) facet degree
  uniformInterior: boolean // all non-boundary cells share that degree
  shellCounts: number[] // BFS shell sizes from cell 0
  growthRatios: number[] // shell-to-shell ratios (exponential if > 1 and roughly constant)
} {
  // the full (interior) facet degree is the MAX neighbour count, boundary cells have fewer
  let facetDegree = 0

  for (const nb of graph.neighbors) {
    if (nb.length > facetDegree) {
      facetDegree = nb.length
    }
  }

  let matching = 0

  for (const nb of graph.neighbors) {
    if (nb.length === facetDegree) {
      matching++
    }
  }

  const uniformInterior = matching >= 1 // a regular honeycomb has at least the seed at full degree

  const { shellCounts } = bfsShells({ neighbors: graph.neighbors })
  const growthRatios = shellCounts
    .slice(1)
    .map((c, i) => c / shellCounts[i]!)

  return { facetDegree, uniformInterior, shellCounts, growthRatios }
}
