// SELF EMERGENCE BY GRAVITY, animated. Local cohesion only crystallizes (saturates, no boundary). GRAVITY,
// the bulk tree's long-range 1/r coupling (gravity-through-the-bulk-tree.md), instead CONDENSES charge into
// BOUNDED bodies with voids around them, the way matter forms discrete bodies. Here gravity is a density
// field (two diffusion passes, a screened long-ish range mass) and each charge hops up the mass gradient,
// CONSERVING (it moves charge, never creates it). The result is a bounded, form-persistent self, a dense
// region that holds while matter flows through it, surrounded by evacuated void. Coloured by local DENSITY
// (form-persistence), so the self glows and the void is dark. No external hand, only the rule, the arrow,
// and the bulk. Run: pnpm tsx code/gpu/render-gravity-anim.ts   then task/render-video.sh

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { discreteArrow, type Graph } from '@/code/model/self-kit'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { makeRng } from '@/code/tool/rng'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 40000
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 200
const IMG = 1300
const RADIUS = 2
const ZOOM_FIT = 0.9
const SEED_DENSITY = 0.12 // dilute, conserving gravity then condenses it into bounded bodies
const SCREEN = 0.45 // weight of the second (longer-range) diffusion pass, the gravity reach
const DMAX = 18 // density at which a cell glows fully (form-persistence brightness)
const ARROW_PERIOD = 33 // the DISCRETE arrow (defining-the-arrow.md), one balanced pair created per this many
// cells each beat, deterministic and RNG-free (an integer K, not a float rate). The drive that keeps the self
// far from equilibrium so it flows instead of freezing, a dissipative structure not a frozen blob (P107)

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

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
    `gravity self, slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()}`,
  )

  // 2D positions, stereographic inversion from xi onto the plane perp to xi, zoomed on the core
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

  type BandCell = { index: number; px: number; py: number }
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
  const band: BandCell[] = raw.map(c => ({
    index: c.index,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix),
  }))

  const rng = makeRng({ seed: 7 })
  const tone = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    const r = rng.next()
    tone[i] = (r < SEED_DENSITY ? 1 : r < 2 * SEED_DENSITY ? -1 : 0) as
      | -1
      | 0
      | 1 // BALANCED, net charge 0
  }

  const q0 = (() => {
    let s = 0

    for (let i = 0; i < n; i++) {
      s += tone[i]!
    }

    return s
  })()

  const moved = new Uint8Array(n)
  // SIGN-AWARE gravity, separate mass fields for the two charges, so like attracts like and the two signs
  // condense into separate bodies (blue +1 bodies, red -1 bodies) instead of all falling into the same well
  const d1P = new Float32Array(n)
  const d1M = new Float32Array(n)
  const densP = new Float32Array(n)
  const densM = new Float32Array(n)

  const diffuse = (
    isPlus: boolean,
    d1: Float32Array,
    out: Float32Array,
  ): void => {
    const sign = isPlus ? 1 : -1

    for (let i = 0; i < n; i++) {
      let s = tone[i] === sign ? 1 : 0

      for (let p = off[i]!; p < off[i + 1]!; p++) {
        s += tone[adj[p]!] === sign ? 1 : 0
      }

      d1[i] = s
    }

    for (let i = 0; i < n; i++) {
      let s = d1[i]! * (1 - SCREEN)

      for (let p = off[i]!; p < off[i + 1]!; p++) {
        s += SCREEN * d1[adj[p]!]!
      }

      out[i] = s
    }
  }

  const computeDens = (): void => {
    diffuse(true, d1P, densP)
    diffuse(false, d1M, densM)
  }

  // the DRIVE is the DISCRETE arrow (discreteArrow), a deterministic minimal creation schedule, no float, no
  // randomness, keeping the system far from equilibrium so the self flows instead of freezing
  const graph: Graph = { cellCount: n, offsets: off, adj }

  // gravity migration, a charge hops to the empty neighbour of highest density (up the mass gradient),
  // opposites annihilate on contact, conserving throughout
  const grav = (): void => {
    moved.fill(0)
    const st = Math.floor(rng.next() * n)

    for (let s = 0; s < n; s++) {
      const v = (st + s) % n

      if (moved[v] || tone[v] === 0) {
        continue
      }

      const dens = tone[v] === 1 ? densP : densM // pull toward SAME-sign mass, like attracts like

      let bestJ = -1
      let bestD = dens[v]!

      for (let p = off[v]!; p < off[v + 1]!; p++) {
        const w = adj[p]!

        if (moved[w]) {
          continue
        }

        if (tone[w] === -tone[v]!) {
          tone[v] = 0
          tone[w] = 0
          moved[v] = 1
          moved[w] = 1
          bestJ = -2
          break
        } else if (tone[w] === 0 && dens[w]! > bestD) {
          bestD = dens[w]!
          bestJ = w
        }
      }

      if (bestJ >= 0) {
        tone[bestJ] = tone[v]!
        tone[v] = 0
        moved[v] = 1
        moved[bestJ] = 1
      }
    }
  }

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
    discreteArrow(tone, graph, f, ARROW_PERIOD) // the arrow (base element), discrete and deterministic, the drive
    computeDens()
    grav()

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 8
      rgba[i * 4 + 1] = 8
      rgba[i * 4 + 2] = 9
      rgba[i * 4 + 3] = 255
    }

    for (const c of band) {
      const t = tone[c.index]!

      if (t === 0) {
        continue
      }

      const dfield = t === 1 ? densP : densM
      const inten = 0.15 + 0.85 * Math.min(dfield[c.index]! / DMAX, 1) // brightness by same-sign mass density
      const r8 =
        t === 1
          ? Math.round(40 + 90 * inten)
          : Math.round(120 + 135 * inten)

      const g8 =
        t === 1
          ? Math.round(70 + 170 * inten)
          : Math.round(40 + 90 * inten)

      const b8 =
        t === 1
          ? Math.round(120 + 135 * inten)
          : Math.round(70 + 90 * inten)

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy

          if (x < 0 || x >= IMG || y < 0 || y >= IMG) {
            continue
          }

          const idx = (y * IMG + x) * 4
          rgba[idx] = r8
          rgba[idx + 1] = g8
          rgba[idx + 2] = b8
        }
      }
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })

    if (f % 40 === 0 || f === FRAMES - 1) {
      let maxD = 0
      let charged = 0
      let q = 0

      for (let i = 0; i < n; i++) {
        const d = Math.max(densP[i]!, densM[i]!)

        if (d > maxD) {
          maxD = d
        }

        if (tone[i] !== 0) {
          charged++
        }

        q += tone[i]!
      }

      console.log(
        `  beat ${f}, max density ${maxD.toFixed(0)}, charged ${((charged / n) * 100).toFixed(0)}%, charge conserved ${q === q0}`,
      )
    }
  }

  console.log(
    `wrote ${FRAMES} frames, assemble with task/render-video.sh`,
  )
}

run()
