// RENDER THE NESTING on {5,3,4}. Build the hyperbolic bulk, take a thin slice through the origin to get a
// Poincare-disk view, and draw each cell as a dot sized by its conformal scale (1 - r^2) so cells shrink
// toward the boundary, coloured by BFS SHELL DEPTH from the seed. The result shows the recursive nested
// rings crowding the boundary circle (the geometric nesting P189 measures). Writes one PNG per shell as a
// GROWTH animation (shell 0, then 0-1, then 0-2, ...), so the nested structure visibly accumulates outward.
// Pure CPU (no GPU needed). Run: npx tsx code/gpu/render-nesting-534.ts, then ffmpeg the frames.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { encodePng } from '@/code/draw/png'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_CELLS = 200000 // enough for ~6 clean shells
const SLICE = 0.05 // keep cells with |z| < SLICE, a thin slab through the origin -> a 2D disk view
const IMG = 1400
const MARGIN = 0.94
const DOT_SCALE = 30 // pixels per unit conformal size at the centre

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))

// a depth -> colour palette, warm at the centre, cool toward the boundary (rainbow by shell)
function shellColor(depth: number, maxDepth: number): [number, number, number] {
  const t = maxDepth > 0 ? depth / maxDepth : 0
  const hue = 12 + 280 * t // red-orange centre -> blue-violet rim
  // simple HSV->RGB at full saturation, value 1
  const h = hue / 60
  const c = 1
  const x = c * (1 - Math.abs((h % 2) - 1))
  let r = 0, g = 0, b = 0
  if (h < 1) [r, g, b] = [c, x, 0]
  else if (h < 2) [r, g, b] = [x, c, 0]
  else if (h < 3) [r, g, b] = [0, c, x]
  else if (h < 4) [r, g, b] = [0, x, c]
  else if (h < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function run(): void {
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount

  // BFS shell depth from cell 0
  const depth = new Array<number>(n).fill(-1)
  depth[0] = 0
  let frontier = [0]
  const shellCounts: number[] = [1]
  while (frontier.length) {
    const next: number[] = []
    for (const u of frontier) for (const v of g.neighbors[u]!) if (depth[v]! < 0) { depth[v] = depth[u]! + 1; next.push(v) }
    if (next.length) shellCounts.push(next.length)
    frontier = next
  }
  // clean (untruncated) shells: stop at the first shell whose ratio collapses
  let maxClean = 0
  for (let i = 1; i < shellCounts.length; i++) {
    if (shellCounts[i]! / shellCounts[i - 1]! > 2) maxClean = i
    else break
  }

  // project ALL clean cells orthographically onto the (x,y) plane (the Poincare-ball shadow), so the disk
  // fills, big inner-shell dots at the centre and exponentially many tiny outer-shell dots crowding the rim
  const slice: number[] = []
  for (let i = 0; i < n; i++) {
    if (depth[i]! < 0 || depth[i]! > maxClean) continue
    slice.push(i)
  }
  console.log(`cells ${n}, clean shells 0..${maxClean} (counts ${shellCounts.slice(0, maxClean + 1).join(',')}), drawn cells ${slice.length}`)

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, 'frames-nesting-534')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const half = IMG / 2
  const scale = half * MARGIN

  // draw a filled disk (cell dot) into the rgba buffer
  const drawDot = (rgba: Uint8Array, cx: number, cy: number, rad: number, col: [number, number, number]): void => {
    const r0 = Math.max(0, Math.floor(cx - rad)), r1 = Math.min(IMG - 1, Math.ceil(cx + rad))
    const c0 = Math.max(0, Math.floor(cy - rad)), c1 = Math.min(IMG - 1, Math.ceil(cy + rad))
    const rr = rad * rad
    for (let py = c0; py <= c1; py++) for (let px = r0; px <= r1; px++) {
      const dx = px - cx, dy = py - cy
      if (dx * dx + dy * dy <= rr) {
        const o = (py * IMG + px) * 4
        rgba[o] = col[0]; rgba[o + 1] = col[1]; rgba[o + 2] = col[2]; rgba[o + 3] = 255
      }
    }
  }

  // one cumulative frame per shell: frame f shows shells 0..f
  for (let f = 0; f <= maxClean; f++) {
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < rgba.length; i += 4) { rgba[i] = 12; rgba[i + 1] = 12; rgba[i + 2] = 16; rgba[i + 3] = 255 }
    // boundary circle (sphere at infinity), dim grey ring
    for (let a = 0; a < 3600; a++) {
      const th = (a / 3600) * 2 * Math.PI
      const px = Math.round(half + scale * Math.cos(th)), py = Math.round(half + scale * Math.sin(th))
      if (px >= 0 && px < IMG && py >= 0 && py < IMG) { const o = (py * IMG + px) * 4; rgba[o] = 70; rgba[o + 1] = 70; rgba[o + 2] = 78 }
    }
    // draw cells up to shell f, deepest first so shallow shells sit on top
    for (let s = f; s >= 0; s--) {
      const col = shellColor(s, maxClean)
      for (const i of slice) {
        if (depth[i]! !== s) continue
        const x = g.coords[i]![0]!, y = g.coords[i]![1]!
        const r2 = norm(g.coords[i]!) ** 2
        const px = half + scale * x, py = half - scale * y
        const rad = Math.max(0.7, DOT_SCALE * (1 - r2))
        drawDot(rgba, px, py, rad, col)
      }
    }
    const path = join(outDir, `nesting-${String(f).padStart(3, '0')}.png`)
    writeFileSync(path, encodePng(rgba, IMG, IMG))
  }
  console.log(`wrote ${maxClean + 1} frames to ${outDir}`)
  console.log(`ffmpeg -framerate 2 -i ${join(outDir, 'nesting-%03d.png')} -vf "scale=${IMG}:${IMG}" -pix_fmt yuv420p ${join(here, 'nesting-534.mp4')}`)
}

run()
