// THE BLUR DIAL (discrete to continuous). On the flat horosphere, seed each cell a DISCRETE ternary tone
// {-1,0,+1} sampled from a smooth large-scale pattern. Then turn the COARSE-GRAINING knob: average the
// discrete field over neighbours, one pass per frame. Frame 0 shows chunky discrete cells in three flat
// tones (black 0, blue +1, red -1). As the dial turns, the discrete cells blur into a SMOOTH CONTINUOUS
// field, the emergent continuum. This isolates the discreteness knob (no curvature change, the horosphere is
// already flat). The shades that appear are meaningful, they ARE the emergent continuum. CPU. Run:
// npx tsx code/gpu/render-blur-dial-534.ts, then ffmpeg the frames.

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 120000
const HALF = 0.5
const FRAMES = 72 // one extra coarse-graining pass per frame
const IMG = 1200
const DOT = 8 // big enough that cells fully cover (no background gaps showing as speckle)

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

function run(): void {
  const slab = buildHorosphereBand({ symbol: [5, 3, 4], maxBand: MAX_BAND, half: HALF, margin: 0.6 })
  const n = slab.cellCount
  const xi = slab.idealPoint
  const dim = xi.length

  // horocyclic flat coordinate (invert about the ideal point, then project)
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => { const m = norm(v) || 1; return v.map((x) => x / m) }
  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  let axis = 0
  for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim
  for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  const e2 = normalize(sub(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1, dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1)))
  const U = new Float32Array(n), V = new Float32Array(n)
  for (let i = 0; i < n; i++) { const d = sub(slab.coords[i]!, xi, 1); const dd = dot(d, d) || 1e-9; const inv = d.map((x) => x / dd); U[i] = dot(inv, e1); V[i] = dot(inv, e2) }

  // the band and its induced adjacency
  const bandList: number[] = []
  const reindex = new Int32Array(n).fill(-1)
  for (let i = 0; i < n; i++) if (Math.abs(slab.busemann[i]!) < HALF) { reindex[i] = bandList.length; bandList.push(i) }
  const B = bandList.length
  const bandNbr: number[][] = bandList.map(() => [])
  for (let a = 0; a < B; a++) for (const w of slab.neighbors[bandList[a]!]!) { const b = reindex[w]!; if (b >= 0) bandNbr[a]!.push(b) }
  const med = (xs: number[]): number => { const s = [...xs].sort((p, q) => p - q); return s[Math.floor(s.length / 2)] ?? 0 }
  const cu = med(bandList.map((i) => U[i]!)), cv = med(bandList.map((i) => V[i]!))
  const radii = bandList.map((i) => Math.max(Math.abs(U[i]! - cu), Math.abs(V[i]! - cv))).sort((p, q) => p - q)
  const ext = (radii[Math.floor(radii.length * 0.55)] ?? 1) || 1
  const halfPx = IMG / 2 - 16
  const px = new Int32Array(B), py = new Int32Array(B), un = new Float32Array(B), vn = new Float32Array(B)
  for (let a = 0; a < B; a++) { const i = bandList[a]!; un[a] = (U[i]! - cu) / ext; vn[a] = (V[i]! - cv) / ext; px[a] = Math.round(IMG / 2 + un[a]! * halfPx); py[a] = Math.round(IMG / 2 + vn[a]! * halfPx) }
  console.log(`flat band ${B.toLocaleString()} cells`)

  // seed: a smooth large-scale pattern, sampled DISCRETELY to ternary {-1,0,+1} per cell
  let field = new Float32Array(B)
  for (let a = 0; a < B; a++) {
    const p = Math.sin(2.6 * un[a]!) * Math.cos(2.6 * vn[a]!) + 0.6 * Math.sin(3.5 * (un[a]! + 0.4 * vn[a]!))
    field[a] = p > 0.18 ? 1 : p < -0.18 ? -1 : 0 // ternary sampling (peace deadzone)
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, '..', '..', 'make', 'frames-blur')
  rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true })

  const drawDot = (rgba: Uint8Array, cx: number, cy: number, col: [number, number, number]): void => {
    for (let dy = -DOT; dy <= DOT; dy++) for (let dx = -DOT; dx <= DOT; dx++) {
      if (dx * dx + dy * dy > DOT * DOT) continue
      const x = cx + dx, y = cy + dy
      if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue
      const o = (y * IMG + x) * 4; rgba[o] = col[0]; rgba[o + 1] = col[1]; rgba[o + 2] = col[2]
    }
  }

  for (let f = 0; f < FRAMES; f++) {
    // render the current field: blue for +, red for -, black near 0, brightness = magnitude (per-frame norm)
    let mx = 1e-6
    for (let a = 0; a < B; a++) { const v = Math.abs(field[a]!); if (v > mx) mx = v }
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < rgba.length; i += 4) { rgba[i] = 0; rgba[i + 1] = 0; rgba[i + 2] = 0; rgba[i + 3] = 255 }
    for (let a = 0; a < B; a++) {
      const v = field[a]! / mx
      const m = Math.min(1, Math.abs(v))
      if (m < 0.04) continue
      const col: [number, number, number] = v > 0
        ? [Math.round(60 * m), Math.round(130 * m), Math.round(255 * m)]
        : [Math.round(255 * m), Math.round(60 * m), Math.round(70 * m)]
      drawDot(rgba, px[a]!, py[a]!, col)
    }
    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG, prefix: 'blur_' })
    // turn the dial: one more coarse-graining pass (display only, the base field stays discrete)
    const ns = new Float32Array(B)
    for (let a = 0; a < B; a++) { let s = field[a]!, d = 1; for (const b of bandNbr[a]!) { s += field[b]!; d++ } ns[a] = s / d }
    field = ns
    if (f % 12 === 0) console.log(`  pass ${f}/${FRAMES}`)
  }
  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log(`ffmpeg -y -framerate 12 -i ${join(outDir, 'blur_%04d.png')} -pix_fmt yuv420p ${join(here, '..', '..', 'make', '534', 'blur-dial-534.mp4')}`)
}

run()
