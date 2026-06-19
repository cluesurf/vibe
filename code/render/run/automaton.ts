// SEE THE COMPUTER ANIMATING. Runs a cellular automaton on a hyperbolic tiling and colors each cell FACE by
// its state, beat by beat, into one animated GIF. The rule is the deterministic, reversible second-order wave
// (code/dynamics/reversible-wave), which propagates ballistically across the cell graph, so a single seed at
// the center sends a clean wavefront outward through the curved tiling. Renders through the projection system,
// so you can watch it in the Poincare disk, the Klein disk, the band, etc.
// Run: pnpm tsx code/render/run/automaton.ts [symbol] [model]   e.g. pnpm tsx ... automaton.ts 7-3 poincare

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { reversibleWaveStep } from '@/code/dynamics/reversible-wave'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import type { Scene, SceneEdge, SceneFace } from '@/code/render/scene'
import type { ProjectionModel } from '@/code/render/geometry/projection'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(
  here,
  '..',
  '..',
  '..',
  'make',
  'render',
  'automaton',
)

// a violet state ramp, tone 0 (rest) dark to tone q-1 bright
const PALETTE: [number, number, number][] = [
  [25, 25, 40],
  [60, 40, 120],
  [110, 70, 200],
  [160, 110, 235],
  [210, 170, 250],
  [245, 225, 255],
]

const MODULUS = PALETTE.length
const EDGE_COLOR: [number, number, number] = [18, 18, 26]

function run(): void {
  mkdirSync(outDir, { recursive: true })
  const symbolText = process.argv[2] ?? '7-3'
  const model = (process.argv[3] ?? 'poincare') as ProjectionModel
  const symbol = symbolText.split('-').map(Number)
  const size = 720
  const frameCount = 60
  const tiling = buildTilingFaces({ symbol, maxCells: 1800 })
  const n = tiling.cellCount

  // the cell-boundary outlines (deduplicated), drawn faintly over the colored faces so cells stay legible
  const edges = cellOutlines(tiling.polygons)

  // the reversible wave, seed a localized bump at the central cell with zero initial velocity, so it spreads
  // outward symmetrically. State is a tone in 0..MODULUS-1 per cell.
  let previous = new Uint8Array(n)
  let current = new Uint8Array(n)

  const next = new Uint8Array(n)
  current[0] = MODULUS - 1
  previous[0] = MODULUS - 1

  const frames: Uint8Array[] = []

  for (let f = 0; f < frameCount; f++) {
    const faces: SceneFace[] = []

    for (let cell = 0; cell < n; cell++) {
      const tone = current[cell]!

      if (tone === 0) {
        continue
      } // leave rest cells as background, so the wavefront reads clearly

      faces.push({
        polygon: tiling.polygons[cell]!,
        color: PALETTE[tone]!,
      })
    }

    const scene: Scene = {
      dim: 2,
      symbol: symbol.slice(),
      edges,
      faces,
      cellCount: n,
    }

    const { rgba } = renderSceneToRgba({
      scene,
      size,
      segments: 16,
      lineWidth: 1.0,
      near: EDGE_COLOR,
      far: EDGE_COLOR,
      model,
    })

    frames.push(rgba)

    if (f === 0 || f === Math.floor(frameCount / 2)) {
      writeFileSync(
        join(outDir, `automaton-${symbolText}-${model}-frame${f}.png`),
        encodePng(rgba, size, size),
      )
    }

    // advance one beat of the reversible wave, then roll the buffers
    reversibleWaveStep({
      neighbors: tiling.neighbors,
      previous,
      current,
      next,
      modulus: MODULUS,
    })
    const spent = previous
    previous = current
    current = next.slice()
    spent.fill(0)
  }

  const gif = encodeGif({
    frames,
    width: size,
    height: size,
    delayMs: 70,
  })

  writeFileSync(
    join(outDir, `automaton-${symbolText}-${model}.gif`),
    gif,
  )
  console.log(
    `wrote automaton-${symbolText}-${model}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frameCount} frames  ${size}x${size}  (${n} cells)`,
  )
}

// the deduplicated boundary edges of all cell polygons
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
