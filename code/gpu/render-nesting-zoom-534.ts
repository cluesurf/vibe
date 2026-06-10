// NESTING SELF-SIMILARITY ZOOM. Build the {5,3,4} bulk, project all cells to the Poincare disk coloured by
// BFS shell depth (a structural map, NOT tones), then ZOOM steadily toward a point partway to the boundary.
// As the zoom deepens, ever-finer shells become visible and the magnified region looks like the whole, the
// signature of self-similar recursive nesting. Structural visualization (depth colours), CPU. Run:
// npx tsx code/gpu/render-nesting-zoom-534.ts, then ffmpeg the frames.

import { buildCellGraph } from '~/substrate/coxeter/cell-direct'
import { encodePng } from '~/gpu/png'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_CELLS = 500000
const FRAMES = 90
const IMG = 1200
const MARGIN = 0.94
const DOT_SCALE = 30
const TARGET = [0.74, 0.0] // zoom toward this disk point (into the nested rim)
const ZOOM_MAX = 11

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))

function shellColor(depth: number, maxDepth: number): [number, number, number] {
  const t = maxDepth > 0 ? depth / maxDepth : 0
  const hue = 12 + 280 * t
  const h = hue / 60, c = 1, x = c * (1 - Math.abs((h % 2) - 1))
  let r = 0, g = 0, b = 0
  if (h < 1) [r, g, b] = [c, x, 0]; else if (h < 2) [r, g, b] = [x, c, 0]; else if (h < 3) [r, g, b] = [0, c, x]
  else if (h < 4) [r, g, b] = [0, x, c]; else if (h < 5) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function run(): void {
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount
  const depth = new Array<number>(n).fill(-1); depth[0] = 0
  let frontier = [0]; const shellCounts: number[] = [1]
  while (frontier.length) { const next: number[] = []; for (const u of frontier) for (const v of g.neighbors[u]!) if (depth[v]! < 0) { depth[v] = depth[u]! + 1; next.push(v) } if (next.length) shellCounts.push(next.length); frontier = next }
  let maxClean = 0
  for (let i = 1; i < shellCounts.length; i++) { if (shellCounts[i]! / shellCounts[i - 1]! > 2) maxClean = i; else break }
  console.log(`cells ${n}, clean shells 0..${maxClean} (${shellCounts.slice(0, maxClean + 1).join(',')})`)

  const cells = [] as { x: number; y: number; r2: number; col: [number, number, number] }[]
  for (let i = 0; i < n; i++) { if (depth[i]! < 0 || depth[i]! > maxClean) continue; cells.push({ x: g.coords[i]![0]!, y: g.coords[i]![1]!, r2: norm(g.coords[i]!) ** 2, col: shellColor(depth[i]!, maxClean) }) }
  cells.sort((a, b) => b.r2 - a.r2)

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, 'frames-nesting-zoom-534')
  rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true })
  const half = IMG / 2, baseScale = half * MARGIN
  const drawDot = (rgba: Uint8Array, cx: number, cy: number, rad: number, col: [number, number, number]): void => {
    const r0 = Math.max(0, Math.floor(cx - rad)), r1 = Math.min(IMG - 1, Math.ceil(cx + rad)), c0 = Math.max(0, Math.floor(cy - rad)), c1 = Math.min(IMG - 1, Math.ceil(cy + rad)), rr = rad * rad
    for (let py = c0; py <= c1; py++) for (let px = r0; px <= r1; px++) { const dx = px - cx, dy = py - cy; if (dx * dx + dy * dy <= rr) { const o = (py * IMG + px) * 4; rgba[o] = col[0]; rgba[o + 1] = col[1]; rgba[o + 2] = col[2]; rgba[o + 3] = 255 } }
  }
  for (let f = 0; f < FRAMES; f++) {
    const zoom = Math.exp((f / (FRAMES - 1)) * Math.log(ZOOM_MAX)) // exponential zoom 1 -> ZOOM_MAX
    const scale = baseScale * zoom
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < rgba.length; i += 4) { rgba[i] = 10; rgba[i + 1] = 10; rgba[i + 2] = 14; rgba[i + 3] = 255 }
    for (const c of cells) {
      const px = half + scale * (c.x - TARGET[0]!), py = half - scale * (c.y - TARGET[1]!)
      if (px < -20 || px > IMG + 20 || py < -20 || py > IMG + 20) continue
      const rad = Math.max(0.6, DOT_SCALE * (1 - c.r2) * Math.min(zoom, 6))
      drawDot(rgba, px, py, rad, c.col)
    }
    writeFileSync(join(outDir, `zoom-${String(f).padStart(3, '0')}.png`), encodePng(rgba, IMG, IMG))
    if (f % 20 === 0) console.log(`  frame ${f}/${FRAMES} zoom ${zoom.toFixed(2)}x`)
  }
  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log(`ffmpeg -y -framerate 24 -i ${join(outDir, 'zoom-%03d.png')} -pix_fmt yuv420p ${join(here, '..', '..', 'make', '534', 'nesting-zoom-534.mp4')}`)
}

run()
