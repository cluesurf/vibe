// Render regular tilings of all THREE constant-curvature geometries through one dispatcher, the spherical
// polyhedra, the Euclidean plane tilings, and the hyperbolic tilings, so they can be compared on equal footing.
// `buildTilingScene` classifies the symbol and routes it, stereographic for the sphere, a flat lattice patch
// for the plane, the Poincare ball for hyperbolic.
//
// Run: pnpm tsx code/render/run/geometries.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingScene } from '@/code/render/geometry/honeycomb'
import { classifyGeometry } from '@/code/substrate/coxeter/schlafli'
import { renderSceneToPng } from '@/code/render/adapter/raster'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(
  here,
  '..',
  '..',
  '..',
  'make',
  'render',
  'geometries',
)

mkdirSync(outDir, { recursive: true })

// one representative per geometry, all 2D so they render to a disk
const SYMBOLS: number[][] = [
  [3, 3], // spherical, tetrahedron
  [4, 3], // spherical, cube
  [3, 4], // spherical, octahedron
  [5, 3], // spherical, dodecahedron
  [3, 5], // spherical, icosahedron
  [4, 4], // euclidean, square
  [3, 6], // euclidean, triangular
  [7, 3], // hyperbolic, heptagonal
  [5, 4], // hyperbolic, pentagonal
]

for (const symbol of SYMBOLS) {
  const geometry = classifyGeometry(symbol)
  const scene = buildTilingScene({
    symbol,
    maxCells: geometry === 'hyperbolic' ? 1600 : 1200,
  })

  // flat geodesics are straight lines (one segment), curved geometries get many segments so the arcs read
  // smooth, and 3x supersampling resolves the edges to retina quality (no jagged stair-step).
  const segments = geometry === 'euclidean' ? 1 : 96
  const png = renderSceneToPng({
    scene,
    size: 800,
    segments,
    superSample: 3,
  })

  const file = join(outDir, `${symbol.join('-')}-${geometry}.png`)
  writeFileSync(file, png)
  console.log(
    `${symbol.join(',')} (${geometry}): ${scene.cellCount} cells, ${scene.edges.length} edges -> ${file}`,
  )
}
