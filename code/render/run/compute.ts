// THE COMPUTATION CAPSTONE. A signal routes across a hyperbolic tiling by pure ADDRESS ARITHMETIC, the very
// thing Margenstern's splitting method makes possible, animated cell by cell. The backdrop colors every cell by
// its PATTERN class (its angular sector, read off its address), so the tiling's symmetry shows; the signal then
// travels the address-route from the center to a far target, lighting the path as it goes. This ties together
// everything, the Margenstern addressing, the routing, the cell faces, the pattern labels, and the animation.
// Run: pnpm tsx code/render/run/compute.ts [symbol] [model]   e.g. pnpm tsx code/render/run/compute.ts 7-3

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMargensternGrid } from '@/code/substrate/margenstern/grid'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import {
  patternClass,
  patternClassCount,
} from '@/code/render/geometry/pattern'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import type { Scene, SceneEdge, SceneFace } from '@/code/render/scene'
import type { ProjectionModel } from '@/code/render/geometry/projection'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'compute')

// a soft sector palette for the backdrop (dim) and a bright signal/trail
const SECTORS: [number, number, number][] = [
  [40, 36, 70],
  [70, 50, 110],
  [50, 60, 120],
  [80, 55, 120],
  [55, 48, 100],
  [70, 64, 130],
  [60, 52, 115],
  [48, 56, 110],
]

const TRAIL: [number, number, number] = [150, 120, 230]
const SIGNAL: [number, number, number] = [250, 245, 255]
const EDGE: [number, number, number] = [16, 16, 24]

function run(): void {
  mkdirSync(outDir, { recursive: true })

  const symbolText = process.argv[2] ?? '7-3'
  const model = (process.argv[3] ?? 'poincare') as ProjectionModel
  const symbol = symbolText.split('-').map(Number)
  const maxCells = 1500
  const size = 720

  // same maxCells -> the grid and the face geometry share cell indices (both BFS the same cell graph)
  const grid = buildMargensternGrid({ symbol, maxCells })
  const faces = buildTilingFaces({ symbol, maxCells })
  const sectors = patternClassCount(grid, 'sector')

  // a target cell far from the center, then the address-route to it (the computed path)
  const target = Math.min(grid.size - 1, Math.floor(grid.size * 0.7))
  const path = grid.route(grid.origin, target)

  const edges = cellOutlines(faces.polygons)
  const frames: Uint8Array[] = []
  const totalFrames = path.length + 8 // a few trailing frames to hold the finished path

  for (let f = 0; f < totalFrames; f++) {
    const head = Math.min(f, path.length - 1)
    const onPath = new Map<number, number>() // cell -> brightness phase

    for (let k = 0; k <= head; k++)
      onPath.set(path[k]!, k === head ? 2 : 1)

    const sceneFaces: SceneFace[] = []

    for (let cell = 0; cell < faces.cellCount; cell++) {
      const phase = onPath.get(cell)
      const color =
        phase === 2
          ? SIGNAL
          : phase === 1
            ? TRAIL
            : SECTORS[
                patternClass(grid, cell, 'sector') % SECTORS.length
              ]!

      sceneFaces.push({ polygon: faces.polygons[cell]!, color })
    }

    const scene: Scene = {
      dim: 2,
      symbol: symbol.slice(),
      edges,
      faces: sceneFaces,
      cellCount: faces.cellCount,
    }

    const { rgba } = renderSceneToRgba({
      scene,
      size,
      segments: 16,
      lineWidth: 1.0,
      near: EDGE,
      far: EDGE,
      model,
    })

    frames.push(rgba)

    if (f === 0 || f === Math.floor(totalFrames / 2)) {
      writeFileSync(
        join(outDir, `compute-${symbolText}-${model}-frame${f}.png`),
        encodePng(rgba, size, size),
      )
    }
  }

  const gif = encodeGif({
    frames,
    width: size,
    height: size,
    delayMs: 90,
  })

  writeFileSync(join(outDir, `compute-${symbolText}-${model}.gif`), gif)
  console.log(
    `computed a route on {${symbol.join(',')}} (${sectors} sectors), path length ${path.length}, wrote compute-${symbolText}-${model}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${totalFrames} frames`,
  )
}

function cellOutlines(polygons: number[][][]): SceneEdge[] {
  const edges: SceneEdge[] = []
  const seen = new Set<string>()

  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!
      const b = poly[(i + 1) % poly.length]!
      const ka = a.map(x => Math.round(x * 1e4)).join(',')
      const kb = b.map(x => Math.round(x * 1e4)).join(',')
      const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`

      if (seen.has(key)) continue

      seen.add(key)
      edges.push({ a, b })
    }
  }

  return edges
}

run()
