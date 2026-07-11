// SELF EMERGENCE on the horosphere, animated. Same targeted horosphere slab as render-band-anim, but driven
// by the COHESIVE PERCEPTION rule (annihilate opposites, hop toward like company, the arrow creates) instead
// of the free wave. Under this rule charges CONDENSE into persistent self-clusters (P106, P178), and the flat
// horosphere is where selves are most robust (P180). So instead of TV static you see selves emerge and hold.
// It also prints a light emergence TEST, the largest self grows over beats where the static wave has none.
// Run: pnpm tsx code/gpu/render-band-life-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { TONE_COLORS } from '@/code/draw/color'
import {
  toCSR,
  beat,
  largestPositiveCluster,
  discreteArrow,
} from '@/code/model/self-kit'
import { writeFrame } from '@/code/draw/animation'
import { makeRng } from '@/code/tool/rng'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 80000 // moderate, so the cohesive rule runs fast on the CPU and the selves stay legible
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1400
const RADIUS = 2
const ZOOM_FIT = 0.85
const ARROW_PERIOD = 40 // the discrete arrow (defining-the-arrow.md), one balanced pair per this many cells/beat, deterministic
const COHESION = 0.3 // how strongly like charges bunch (the surface tension that makes selves)
const SEED_DENSITY = 0.42 // dense net-positive start, plenty of material to coarsen into big selves

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

const COLORS = TONE_COLORS

function run(): void {
  const slab = buildHorosphereBand({
    maxBand: MAX_BAND,
    half: HALF,
    margin: MARGIN,
  })

  const n = slab.cellCount
  const dim = slab.coords[0]!.length
  const xi = slab.idealPoint
  const g = toCSR(slab.neighbors)

  console.log(
    `horosphere slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()}, running the cohesive rule`,
  )

  // 2D positions, stereographic inversion from xi then onto an orthonormal basis of the plane perp to xi
  const seedVec = (k: number): number[] =>
    Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))

  const sub = (a: number[], b: number[], s: number): number[] =>
    a.map((x, i) => x - s * b[i]!)

  const normalize = (v: number[]): number[] => {
    const m = norm(v) || 1

    return v.map(x => x / m)
  }

  let axis = 0

  for (let k = 1; k < dim; k++) {
    if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  }

  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))

  let axis2 = (axis + 1) % dim

  for (let k = 0; k < dim; k++) {
    if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  }

  const e2 = normalize(
    sub(
      sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)),
      e1,
      dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1),
    ),
  )

  type BandCell = { index: number; px: number; py: number }
  const raw: { index: number; u: number; v: number }[] = []

  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) continue

    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map(v => v / d2)

    raw.push({ index: i, u: dot(w, e1), v: dot(w, e2) })
  }

  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)

    return s[Math.floor(s.length / 2)] ?? 0
  }

  const cu = median(raw.map(c => c.u))
  const cv = median(raw.map(c => c.v))
  const radii = raw
    .map(c => Math.max(Math.abs(c.u - cu), Math.abs(c.v - cv)))
    .sort((a, b) => a - b)

  const halfExtent =
    (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1

  const pad = 20
  const halfPix = IMG / 2 - pad
  const band: BandCell[] = raw.map(c => ({
    index: c.index,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix),
  }))

  // dilute net-positive seed, the material that the cohesive rule condenses into selves
  const rng = makeRng({ seed: 7 })
  const tone = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    const r = rng.next()

    tone[i] = r < SEED_DENSITY ? 1 : r < SEED_DENSITY * 1.3 ? -1 : 0
  }

  const moved = new Uint8Array(n)

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
    'frames',
  )

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  let firstSelf = 0

  for (let f = 0; f < FRAMES; f++) {
    beat(tone, g, moved, rng, 0, COHESION)
    discreteArrow(tone, g, f, ARROW_PERIOD) // the discrete arrow, the drive

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 10
      rgba[i * 4 + 1] = 10
      rgba[i * 4 + 2] = 11
      rgba[i * 4 + 3] = 255
    }

    for (const c of band) {
      const t = tone[c.index]!

      if (t === 0) continue

      const col = COLORS[t === 1 ? 1 : 2]!

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy

          if (x < 0 || x >= IMG || y < 0 || y >= IMG) continue

          const idx = (y * IMG + x) * 4

          rgba[idx] = col[0]
          rgba[idx + 1] = col[1]
          rgba[idx + 2] = col[2]
        }
      }
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })

    // the emergence test, the largest self over time, it should grow as clusters condense
    if (f % 40 === 0 || f === FRAMES - 1) {
      const largest = largestPositiveCluster(tone, g).length

      if (f === 0) firstSelf = largest

      console.log(`  beat ${f}, largest self ${largest} cells`)
    }
  }

  const finalSelf = largestPositiveCluster(tone, g).length

  console.log(
    `emergence test, largest self grew from ${firstSelf} to ${finalSelf} cells, ${finalSelf > firstSelf * 3 ? 'SELVES EMERGED' : 'weak'}`,
  )

  console.log(
    `wrote ${FRAMES} frames, assemble with task/render-video.sh`,
  )
}

run()
