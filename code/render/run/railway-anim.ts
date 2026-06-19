// Margenstern's RAILWAY realized as a cellular automaton ON the hyperbolic tiling, animated. A TRACK is a chain
// of blue cells (a route across the pentagrid / heptagrid), and the LOCOMOTIVE is a green-front / red-rear pair
// that advances one cell per beat, exactly the picture in Vol II Ch 4. Rendered through the projection system,
// so the train runs across the Poincare disk (or any model). This is the railway as a CA, the form his
// universal machines take. Run: pnpm tsx code/render/run/railway-anim.ts [symbol] [model]

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildMargensternGrid } from '@/code/substrate/margenstern/grid'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { patternClass } from '@/code/render/geometry/pattern'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import type { Scene, SceneEdge, SceneFace } from '@/code/render/scene'
import type { ProjectionModel } from '@/code/render/geometry/projection'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'railway')

const BACKDROP: [number, number, number] = [26, 24, 44]
const TRACK: [number, number, number] = [70, 110, 210] // blue track cells
const GREEN: [number, number, number] = [110, 235, 130] // locomotive front
const RED: [number, number, number] = [240, 90, 90] // locomotive rear
const EDGE: [number, number, number] = [16, 16, 24]

function run(): void {
  mkdirSync(outDir, { recursive: true })
  const symbolText = process.argv[2] ?? '7-3'
  const model = (process.argv[3] ?? 'poincare') as ProjectionModel
  const symbol = symbolText.split('-').map(Number)
  const maxCells = 1400
  const size = 720
  const grid = buildMargensternGrid({ symbol, maxCells })
  const faces = buildTilingFaces({ symbol, maxCells })

  // lay a TRACK as a long route across the tiling (a loop, so the locomotive runs forever)
  const out = grid.route(grid.origin, Math.floor(grid.size * 0.62))
  const back = grid.route(out[out.length - 1]!, grid.origin).slice(1)
  const track = [...out, ...back] // out and return, a closed run the train loops on
  const trackSet = new Set(track)

  const edges = cellOutlines(faces.polygons)
  const frames: Uint8Array[] = []
  for (let beat = 0; beat < track.length; beat++) {
    const headCell = track[beat]!
    const tailCell = track[(beat - 1 + track.length) % track.length]!
    const sceneFaces: SceneFace[] = []
    for (let cell = 0; cell < faces.cellCount; cell++) {
      let color = BACKDROP
      if (trackSet.has(cell)) {
        color = TRACK
      }
      if (cell === tailCell) {
        color = RED
      }
      if (cell === headCell) {
        color = GREEN
      }
      // a faint sector tint on the non-track backdrop so the tiling structure still reads
      if (color === BACKDROP) {
        const s = patternClass(grid, cell, 'sector') % 3
        color = [26 + s * 6, 24 + s * 4, 44 + s * 8]
      }
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
      segments: 14,
      lineWidth: 1.0,
      near: EDGE,
      far: EDGE,
      model,
    })
    frames.push(rgba)
    if (beat === 0 || beat === Math.floor(track.length / 2)) {
      writeFileSync(
        join(outDir, `railway-${symbolText}-${model}-frame${beat}.png`),
        encodePng(rgba, size, size),
      )
    }
  }

  const gif = encodeGif({
    frames,
    width: size,
    height: size,
    delayMs: 110,
  })
  writeFileSync(join(outDir, `railway-${symbolText}-${model}.gif`), gif)
  console.log(
    `ran the locomotive on {${symbol.join(',')}}, track length ${track.length}, wrote railway-${symbolText}-${model}.gif  ${(gif.length / 1024).toFixed(0)} KB`,
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
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      edges.push({ a, b })
    }
  }
  return edges
}

run()
