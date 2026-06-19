// THE PURE BASE RULE, nothing added. No maintenance, no cohesion bias, no will, no steering, no tunable
// arrow rate. Just the exact 9-state perception permutation (the-rule-exactly.md, P176) applied to a
// deterministic matching of edges each beat, on the horosphere. The arrow is the (0,0) -> (1,-1) move that
// is already IN the permutation (peace creates a balanced pair, then the create-flip-annihilate 3-cycle),
// so creation is part of the rule, not a knob. Deterministic (a rotating index start, no RNG), conserving.
// We seed peace and WATCH what the five base elements alone actually do, with no intervention.
// Run: pnpm tsx code/gpu/render-pure-rule-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { TONE_COLORS } from '@/code/draw/color'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 90000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1500
const RADIUS = 1
const ZOOM_FIT = 0.9

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

const norm = (v: number[]): number => Math.sqrt(dot(v, v))

// the exact 9-state perception permutation on an ordered pair (a, b), tones in {-1,0,1}
function perm(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) {
    return [-1, -1]
  } // same sign, inert

  if (a === 1 && b === 1) {
    return [1, 1]
  }

  if (a === -1 && b === 0) {
    return [0, -1]
  } // hop

  if (a === 0 && b === -1) {
    return [-1, 0]
  }

  if (a === 1 && b === 0) {
    return [0, 1]
  }

  if (a === 0 && b === 1) {
    return [1, 0]
  }

  if (a === 0 && b === 0) {
    return [1, -1]
  } // the arrow, peace creates a balanced pair

  if (a === 1 && b === -1) {
    return [-1, 1]
  } // the create-flip-annihilate 3-cycle

  return [0, 0] // (-1, 1) -> (0, 0), annihilation closes the cycle
}

function run(): void {
  const slab = buildHorosphereBand({
    maxBand: MAX_BAND,
    half: HALF,
    margin: MARGIN,
  })

  const n = slab.cellCount
  const dim = slab.coords[0]!.length
  const xi = slab.idealPoint
  const off = new Int32Array(n + 1)

  for (let i = 0; i < n; i++) {
    off[i + 1] = off[i]! + slab.neighbors[i]!.length
  }

  const adj = new Int32Array(off[n]!)

  {
    let p = 0

    for (let i = 0; i < n; i++) {
      for (const w of slab.neighbors[i]!) {
        adj[p++] = w
      }
    }
  }

  console.log(
    `pure rule, slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()}, no interventions`,
  )

  // 2D positions (stereographic from xi, zoomed on the core)
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
    if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) {
      axis = k
    }
  }

  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))

  let axis2 = (axis + 1) % dim

  for (let k = 0; k < dim; k++) {
    if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) {
      axis2 = k
    }
  }

  const e2 = normalize(
    sub(
      sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)),
      e1,
      dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1),
    ),
  )

  type Cell = { index: number; px: number; py: number }
  const raw: { index: number; u: number; v: number }[] = []

  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) {
      continue
    }

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
  const band: Cell[] = raw.map(c => ({
    index: c.index,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix),
  }))

  // seed PEACE (all zero), the rule's arrow does the creating, nothing else
  const tone = new Int8Array(n)
  const matched = new Uint8Array(n)
  const q0 = 0

  const COLORS = TONE_COLORS

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
    'frames',
  )

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  for (let f = 0; f < FRAMES; f++) {
    // a deterministic matching of edges, each cell acted on once, rotating start, no randomness
    matched.fill(0)
    const start = (f * 2654435761) % n

    for (let s = 0; s < n; s++) {
      const v = (start + s) % n

      if (matched[v]) {
        continue
      }

      for (let p = off[v]!; p < off[v + 1]!; p++) {
        const w = adj[p]!

        if (matched[w]) {
          continue
        }

        const [a, b] = perm(tone[v]!, tone[w]!)
        tone[v] = a as -1 | 0 | 1
        tone[w] = b as -1 | 0 | 1
        matched[v] = 1
        matched[w] = 1
        break
      }
    }

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 10
      rgba[i * 4 + 1] = 10
      rgba[i * 4 + 2] = 11
      rgba[i * 4 + 3] = 255
    }

    for (const c of band) {
      const t = tone[c.index]!

      if (t === 0) {
        continue
      }

      const col = COLORS[t === 1 ? 1 : 2]!

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy

          if (x < 0 || x >= IMG || y < 0 || y >= IMG) {
            continue
          }

          const idx = (y * IMG + x) * 4
          rgba[idx] = col[0]
          rgba[idx + 1] = col[1]
          rgba[idx + 2] = col[2]
        }
      }
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })

    if (f % 40 === 0 || f === FRAMES - 1) {
      let charged = 0
      let q = 0

      for (let i = 0; i < n; i++) {
        if (tone[i] !== 0) {
          charged++
        }

        q += tone[i]!
      }

      console.log(
        `  beat ${f}, charged ${((charged / n) * 100).toFixed(0)}%, charge conserved ${q === q0}`,
      )
    }
  }

  console.log(
    `wrote ${FRAMES} frames of the pure base rule, assemble with task/render-video.sh`,
  )
}

run()
