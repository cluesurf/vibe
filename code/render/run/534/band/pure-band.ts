// A FAITHFUL video of the pure five-thing rule on the horosphere band. The conserved-exchange permutation
// (the-rule-exactly.md, PERM = [5,3,6,1,4,7,2,0,8]) run in 12 conflict-free colour passes, NO cohesion, NO
// randomness in the rule, NO scaffolding. We render the COARSE CHARGE DENSITY (the L0 tones smoothed over a
// few hops), so the screen shows the emergent slow middle layer (the conserved-density mode) instead of the
// raw L0 churn, blue = net pleasure, red = net pain, dark = balanced. Watch the slow blobs drift while the
// microscopic tone churns beneath.
// Run: pnpm tsx code/gpu/render-pure-band-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { encodePng } from '@/code/draw/png'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 90000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1200
const RADIUS = 2
const ZOOM_FIT = 0.9
const SMOOTH = 14 // hops of smoothing, reveals the coarse density (the middle layer)
const PERM = [5, 3, 6, 1, 4, 7, 2, 0, 8]

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

function run(): void {
  const slab = buildHorosphereBand({ maxBand: MAX_BAND, half: HALF, margin: MARGIN })
  const n = slab.cellCount, dim = slab.coords[0]!.length, xi = slab.idealPoint, nb = slab.neighbors

  // flat coords (stereographic inversion), same as the band renderers
  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => { const m = norm(v) || 1; return v.map((x) => x / m) }
  let axis = 0; for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim; for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  const e2 = normalize(sub(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1, dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1)))
  const bandCells: number[] = [], uv: [number, number][] = []
  for (let i = 0; i < n; i++) { if (Math.abs(slab.busemann[i]!) >= HALF) continue; const x = slab.coords[i]!; const diff = x.map((v, k) => v - xi[k]!); const d2 = dot(diff, diff) || 1e-12; const w = diff.map((v) => v / d2); bandCells.push(i); uv.push([dot(w, e1), dot(w, e2)]) }
  const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0 }
  const cu = median(uv.map((c) => c[0])), cv = median(uv.map((c) => c[1]))
  const radii = uv.map((c) => Math.max(Math.abs(c[0] - cu), Math.abs(c[1] - cv))).sort((a, b) => a - b)
  const halfExtent = (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1
  const halfPix = IMG / 2 - 20
  const pix = uv.map((c): [number, number] => [Math.round(IMG / 2 + ((c[0] - cu) / halfExtent) * halfPix), Math.round(IMG / 2 + ((c[1] - cv) / halfExtent) * halfPix)])

  // edge-colour the band (greedy, each colour a matching), sort edges by colour
  const eu: number[] = [], ev: number[] = []
  for (let i = 0; i < n; i++) for (const w of nb[i]!) if (w > i) { eu.push(i); ev.push(w) }
  const E = eu.length; const mask = new Uint32Array(n); const color = new Int32Array(E); let maxC = 0
  for (let i = 0; i < E; i++) { const used = mask[eu[i]!]! | mask[ev[i]!]!; let c = 0; while (used & (1 << c)) c++; color[i] = c; mask[eu[i]!]! |= (1 << c); mask[ev[i]!]! |= (1 << c); if (c > maxC) maxC = c }
  const C = maxC + 1; const off = new Array(C + 1).fill(0); for (let i = 0; i < E; i++) off[color[i]! + 1]++; for (let c = 0; c < C; c++) off[c + 1] += off[c]!
  const edgeV = new Uint32Array(E), edgeW = new Uint32Array(E), cur = off.slice()
  for (let i = 0; i < E; i++) { const at = cur[color[i]!]!++; edgeV[at] = eu[i]!; edgeW[at] = ev[i]! }

  // seed: mostly peace plus a balanced sprinkle of charges
  const tone = new Uint8Array(n); let r = 987654321; const rr = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff }
  for (let i = 0; i < n; i++) { const x = rr(); tone[i] = x < 0.2 ? 1 : x < 0.4 ? 2 : 0 }

  const pureBeat = (): void => { for (let c = 0; c < C; c++) for (let e = off[c]!; e < off[c + 1]!; e++) { const v = edgeV[e]!, w = edgeW[e]!; const o = PERM[tone[v]! * 3 + tone[w]!]!; tone[v] = (o / 3) | 0; tone[w] = o % 3 } }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'make', 'frames')
  rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true })
  let q = new Float32Array(n), q2 = new Float32Array(n)
  console.log(`pure rule on the band, ${bandCells.length.toLocaleString()} cells, ${C} colours, rendering ${FRAMES} frames (coarse density)`)

  for (let f = 0; f < FRAMES; f++) {
    pureBeat()
    for (let i = 0; i < n; i++) q[i] = tone[i] === 1 ? 1 : tone[i] === 2 ? -1 : 0
    for (let it = 0; it < SMOOTH; it++) { for (let i = 0; i < n; i++) { let s = q[i]!, c = 1; for (const w of nb[i]!) { s += q[w]!; c++ } q2[i] = s / c } const t = q; q = q2; q2 = t }
    // per-frame normalize so the slow density structure is always visible
    let maxAbs = 1e-6; for (let j = 0; j < bandCells.length; j++) { const v = Math.abs(q[bandCells[j]!]!); if (v > maxAbs) maxAbs = v }
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < IMG * IMG; i++) { rgba[i * 4] = 8; rgba[i * 4 + 1] = 8; rgba[i * 4 + 2] = 10; rgba[i * 4 + 3] = 255 }
    for (let j = 0; j < bandCells.length; j++) {
      const d = q[bandCells[j]!]! / maxAbs; const a = Math.min(1, Math.abs(d)); if (a < 0.05) continue
      const col: [number, number, number] = d > 0 ? [59 * a + 8, 130 * a + 8, 246 * a + 10] : [248 * a + 8, 90 * a + 8, 114 * a + 10]
      const [cx, cy] = pix[j]!
      for (let dy = -RADIUS; dy <= RADIUS; dy++) for (let dx = -RADIUS; dx <= RADIUS; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue; const idx = (y * IMG + x) * 4; rgba[idx] = col[0]; rgba[idx + 1] = col[1]; rgba[idx + 2] = col[2] }
    }
    writeFileSync(join(outDir, `frame_${String(f).padStart(4, '0')}.png`), encodePng(rgba, IMG, IMG))
    if (f % 50 === 0) console.log(`  frame ${f}`)
  }
  console.log(`wrote ${FRAMES} frames to make/frames, assemble with task/render-video.sh`)
}
run()
