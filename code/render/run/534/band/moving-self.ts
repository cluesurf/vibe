// A PROPAGATING self, a stable structure that MOVES. The bare rule does not spontaneously make propagating
// structures (it churns, P101, P159). But the model has the mechanism, a self held by conserving maintenance
// (P178) and STEERED by the will (P113, P157, the arrow as a value-direction). So a bounded self glides
// across the horosphere holding its form while its matter flows through (the whirlpool). The motion is the
// will, the cohesion plus the arrow, base elements, no new piece. Each beat the self's target centre drifts,
// the maintenance refills the new position by balanced creation and lets the old edge churn away, so the
// form propagates while the cells turn over. Coloured by persistence, the moving self glows, the churn is
// dark. Run: pnpm tsx code/gpu/render-moving-self-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { toCSR, beat, discreteArrow } from '@/test/experiment/misc/self-kit'
import { encodePng } from '@/code/draw/png'
import { makeRng } from '@/code/tool/rng'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 110000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1600
const RADIUS = 1 // small dots (a 5-pixel plus), set 0 for single pixels, so more cells pack in
const ZOOM_FIT = 0.96
const ARROW_PERIOD = 40 // discrete arrow, deterministic creation period (defining-the-arrow.md)
const COHESION = 0.3
const SEED_DENSITY = 0.18 // a churning background to move through
const SELF_RADIUS = 0.18 // self size, as a fraction of the zoom half-extent
const SPEED = 0.009 // how far the self's centre drifts per beat (the will's velocity), as a fraction
const PMAX = 30

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

function run(): void {
  const slab = buildHorosphereBand({ maxBand: MAX_BAND, half: HALF, margin: MARGIN })
  const n = slab.cellCount
  const dim = slab.coords[0]!.length
  const xi = slab.idealPoint
  const g = toCSR(slab.neighbors)
  console.log(`moving self, slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()}`)

  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => {
    const m = norm(v) || 1
    return v.map((x) => x / m)
  }
  let axis = 0
  for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim
  for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  const e2 = normalize(sub(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1, dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1)))

  // band cells with their 2D position (u, v) and pixel position
  type Cell = { index: number; u: number; v: number; px: number; py: number }
  const cells: Cell[] = []
  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) continue
    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map((v) => v / d2)
    cells.push({ index: i, u: dot(w, e1), v: dot(w, e2), px: 0, py: 0 })
  }
  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)] ?? 0
  }
  const cu = median(cells.map((c) => c.u))
  const cv = median(cells.map((c) => c.v))
  const radii = cells.map((c) => Math.max(Math.abs(c.u - cu), Math.abs(c.v - cv))).sort((a, b) => a - b)
  const halfExtent = (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1
  const pad = 20
  const halfPix = IMG / 2 - pad
  for (const c of cells) {
    c.px = Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix)
    c.py = Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix)
  }
  // index cells by their own index for the maintenance step
  const cellByIndex = new Map<number, Cell>()
  for (const c of cells) cellByIndex.set(c.index, c)

  // ground for conserving maintenance, off-screen margin cells
  const ground: number[] = []
  for (let i = 0; i < n; i++) if (Math.abs(slab.busemann[i]!) >= HALF) ground.push(i)

  const rng = makeRng({ seed: 7 })
  const tone = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    const r = rng.next()
    tone[i] = (r < SEED_DENSITY ? 1 : r < SEED_DENSITY * 1.3 ? -1 : 0) as -1 | 0 | 1
  }
  const moved = new Uint8Array(n)
  const prev = tone.slice()
  const persist = new Uint16Array(n)

  const selfR = SELF_RADIUS * halfExtent
  const startU = cu - 0.6 * halfExtent // start the self on the left, the will drives it to the right
  const speedU = SPEED * halfExtent

  // conserving maintenance, refill the cells within selfR of the moving centre to +1, balanced -1 to ground
  const maintainAt = (centreU: number, centreV: number): void => {
    let need = 0
    for (const c of cells) {
      if ((c.u - centreU) ** 2 + (c.v - centreV) ** 2 <= selfR * selfR) {
        if (tone[c.index] !== 1) {
          need += 1 - tone[c.index]!
          tone[c.index] = 1
        }
      }
    }
    for (const gc of ground) {
      if (need <= 0) break
      if (tone[gc] === 0) {
        tone[gc] = -1
        need--
      }
    }
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'make', 'frames')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  for (let f = 0; f < FRAMES; f++) {
    beat(tone, g, moved, rng, 0, COHESION)
    discreteArrow(tone, g, f, ARROW_PERIOD) // discrete arrow drive; the rule churns, the self leaks at its edge
    const centreU = startU + speedU * f // the will steers the self to the right
    maintainAt(centreU, cv) // refill it at the new position, so the FORM propagates while matter turns over

    for (let i = 0; i < n; i++) {
      if (tone[i] !== 0 && tone[i] === prev[i]) persist[i] = Math.min(persist[i]! + 1, PMAX)
      else persist[i] = 0
      prev[i] = tone[i]!
    }

    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 8
      rgba[i * 4 + 1] = 8
      rgba[i * 4 + 2] = 9
      rgba[i * 4 + 3] = 255
    }
    for (const c of cells) {
      const t = tone[c.index]!
      if (t === 0) continue
      const inten = 0.12 + 0.88 * (persist[c.index]! / PMAX)
      const r8 = t === 1 ? Math.round(40 + 90 * inten) : Math.round(120 + 135 * inten)
      const g8 = t === 1 ? Math.round(70 + 170 * inten) : Math.round(40 + 90 * inten)
      const b8 = t === 1 ? Math.round(120 + 135 * inten) : Math.round(70 + 90 * inten)
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy
          if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue
          const idx = (y * IMG + x) * 4
          rgba[idx] = r8
          rgba[idx + 1] = g8
          rgba[idx + 2] = b8
        }
      }
    }
    writeFileSync(join(outDir, `frame_${String(f).padStart(4, '0')}.png`), encodePng(rgba, IMG, IMG))
  }
  console.log(`wrote ${FRAMES} frames, the self glides left to right, assemble with task/render-video.sh`)
}

run()
