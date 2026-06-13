// GRAVITY, tested FAITHFULLY on the five base things only, animated. The mesh ({5,3,4} horosphere band), the
// tone, the conserved-exchange rule (self-kit beat, annihilate opposites, hop toward like company, the arrow
// creates), nothing else, no diffusion-proxy signal, no gradient-following, no k-NN, no capture. We seed a
// big dense MASS (a pleasure clump) at the centre and sparse matter around it, run the REAL rule, and measure
// honestly whether the surrounding matter MIGRATES toward the mass (gravity) or just forms local selves where
// it sits (surface tension, no gravity). This is the honest companion, it shows what the five things ACTUALLY
// do, not what scaffolding can be made to do.
// Run: pnpm tsx code/gpu/render-infall-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { TONE_COLORS } from '@/code/draw/color'
import { toCSR, beat } from '@/test/experiment/misc/self-kit'
import { encodePng } from '@/code/draw/png'
import { makeRng } from '@/code/tool/rng'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 80000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 240
const IMG = 1200
const RADIUS = 2
const ZOOM_FIT = 0.9
const ARROW = 0.02 // the arrow's creation rate (base thing)
const COHESION = 0.3 // the conserved-exchange cohesion (base thing), surface tension
const MASS_PCT = 0.18 // central mass = pleasure out to this percentile flat radius
const SURROUND_DENSITY = 0.22 // sparse matter outside the mass, the test matter that may or may not fall in

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)
const COLORS = TONE_COLORS

function run(): void {
  const slab = buildHorosphereBand({ maxBand: MAX_BAND, half: HALF, margin: MARGIN })
  const n = slab.cellCount, dim = slab.coords[0]!.length, xi = slab.idealPoint
  const g = toCSR(slab.neighbors)

  // flat (horospherical) coordinates, same stereographic inversion as the band renderers
  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => { const m = norm(v) || 1; return v.map((x) => x / m) }
  let axis = 0
  for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim
  for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  const e2 = normalize(sub(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1, dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1)))

  const bandCells: number[] = []
  const uv: [number, number][] = []
  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) continue
    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map((v) => v / d2)
    bandCells.push(i)
    uv.push([dot(w, e1), dot(w, e2)])
  }
  const median = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0 }
  const cu = median(uv.map((c) => c[0])), cv = median(uv.map((c) => c[1]))
  const fdistOf = (j: number): number => Math.hypot(uv[j]![0] - cu, uv[j]![1] - cv)
  const radii = bandCells.map((_, j) => fdistOf(j)).sort((a, b) => a - b)
  const massR = radii[Math.floor(radii.length * MASS_PCT)]!
  const surroundR = radii[Math.floor(radii.length * 0.85)]!

  // seed, the five things only, a dense pleasure MASS at the centre, sparse matter in the surround
  const rng = makeRng({ seed: 7 })
  const tone = new Int8Array(n)
  const isSurround = new Uint8Array(n)
  for (let j = 0; j < bandCells.length; j++) {
    const i = bandCells[j]!, r = fdistOf(j)
    if (r <= massR) tone[i] = 1
    else if (r <= surroundR && rng.next() < SURROUND_DENSITY) { tone[i] = 1; isSurround[i] = 1 }
  }
  const moved = new Uint8Array(n)

  // pixel mapping
  const halfExtent = (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1
  const halfPix = IMG / 2 - 20
  const pix = bandCells.map((_, j): [number, number] => [
    Math.round(IMG / 2 + ((uv[j]![0] - cu) / halfExtent) * halfPix),
    Math.round(IMG / 2 + ((uv[j]![1] - cv) / halfExtent) * halfPix),
  ])

  // honest measure, mean flat distance of the SURROUND matter to the centre, it should SHRINK if gravity is real
  const surroundIdx = bandCells.map((i, j) => [i, j] as [number, number]).filter(([i]) => isSurround[i])
  const meanSurroundDist = (): number => {
    let s = 0, c = 0
    for (const [i, j] of surroundIdx) if (tone[i] === 1) { s += fdistOf(j); c++ }
    return c ? s / c : 0
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'make', 'frames')
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const startDist = meanSurroundDist()
  console.log(`band ${bandCells.length.toLocaleString()} cells, mass radius ${massR.toFixed(1)}, surround starts at mean distance ${startDist.toFixed(1)}`)

  for (let f = 0; f < FRAMES; f++) {
    beat(tone, g, moved, rng, ARROW, COHESION) // THE RULE, nothing else

    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < IMG * IMG; i++) { rgba[i * 4] = 8; rgba[i * 4 + 1] = 8; rgba[i * 4 + 2] = 10; rgba[i * 4 + 3] = 255 }
    for (let j = 0; j < bandCells.length; j++) {
      const t = tone[bandCells[j]!]!
      if (t === 0) continue
      const col = COLORS[t === 1 ? 1 : 2]!
      const [cx, cy] = pix[j]!
      for (let dy = -RADIUS; dy <= RADIUS; dy++) for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        const x = cx + dx, y = cy + dy
        if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue
        const idx = (y * IMG + x) * 4; rgba[idx] = col[0]; rgba[idx + 1] = col[1]; rgba[idx + 2] = col[2]
      }
    }
    writeFileSync(join(outDir, `frame_${String(f).padStart(4, '0')}.png`), encodePng(rgba, IMG, IMG))
    if (f % 40 === 0 || f === FRAMES - 1) console.log(`  frame ${f}, surround mean distance to mass ${meanSurroundDist().toFixed(1)}`)
  }
  const endDist = meanSurroundDist()
  const verdict = endDist < startDist * 0.8 ? 'matter MIGRATED inward (gravity)' : endDist < startDist * 0.95 ? 'weak inward drift' : 'NO net migration (local cohesion only, no gravity)'
  console.log(`surround mean distance ${startDist.toFixed(1)} -> ${endDist.toFixed(1)}, ${verdict}`)
  console.log(`wrote ${FRAMES} frames, assemble with task/render-video.sh`)
}

run()
