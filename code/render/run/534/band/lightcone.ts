// The emergent LIGHT CONE, faithful and SHARP. Two copies of the same random background evolve under the pure
// five-thing rule, identical except one has a tiny perturbation at the centre. Render only where they DIFFER,
// that difference is the causal cone of the perturbation, and it spreads at the emergent light speed (z=1,
// isotropic, P150). No smoothing, no scaffolding, just the rule, run twice, subtracted. The growing bright
// disk IS causality and the emergent lightcone on the {5,3,4} boundary.
// Run: pnpm tsx code/gpu/render-lightcone.ts   then assemble with ffmpeg

import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_BAND = 90000
const HALF = 0.5,
  MARGIN = 0.6,
  FRAMES = 150,
  IMG = 1200,
  RADIUS = 2,
  ZOOM_FIT = 0.92

const PERM = [5, 3, 6, 1, 4, 7, 2, 0, 8]
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

  const n = slab.cellCount,
    dim = slab.coords[0]!.length,
    xi = slab.idealPoint,
    nb = slab.neighbors

  const seedVec = (k: number): number[] =>
    Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))

  const sub = (a: number[], b: number[], s: number): number[] =>
    a.map((x, i) => x - s * b[i]!)

  const nz = (v: number[]): number[] => {
    const m = norm(v) || 1

    return v.map(x => x / m)
  }

  let axis = 0

  for (let k = 1; k < dim; k++) {
    if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) {
      axis = k
    }
  }

  const e1 = nz(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))

  let axis2 = (axis + 1) % dim

  for (let k = 0; k < dim; k++) {
    if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) {
      axis2 = k
    }
  }

  const e2 = nz(
    sub(
      sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)),
      e1,
      dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1),
    ),
  )

  const bandCells: number[] = [],
    uv: [number, number][] = []

  for (let i = 0; i < n; i++) {
    if (Math.abs(slab.busemann[i]!) >= HALF) {
      continue
    }

    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map(v => v / d2)
    bandCells.push(i)
    uv.push([dot(w, e1), dot(w, e2)])
  }

  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)

    return s[Math.floor(s.length / 2)] ?? 0
  }

  const cu = median(uv.map(c => c[0])),
    cv = median(uv.map(c => c[1]))

  const radii = uv
    .map(c => Math.max(Math.abs(c[0] - cu), Math.abs(c[1] - cv)))
    .sort((a, b) => a - b)

  const halfExtent =
    (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1

  const halfPix = IMG / 2 - 20
  const pix = uv.map((c): [number, number] => [
    Math.round(IMG / 2 + ((c[0] - cu) / halfExtent) * halfPix),
    Math.round(IMG / 2 + ((c[1] - cv) / halfExtent) * halfPix),
  ])

  const eu: number[] = [],
    ev: number[] = []

  for (let i = 0; i < n; i++) {
    for (const w of nb[i]!) {
      if (w > i) {
        eu.push(i)
        ev.push(w)
      }
    }
  }

  const E = eu.length
  const mask = new Uint32Array(n)
  const color = new Int32Array(E)

  let maxC = 0

  for (let i = 0; i < E; i++) {
    const used = mask[eu[i]!]! | mask[ev[i]!]!

    let c = 0

    while (used & (1 << c)) {
      c++
    }

    color[i] = c
    mask[eu[i]!]! |= 1 << c
    mask[ev[i]!]! |= 1 << c

    if (c > maxC) {
      maxC = c
    }
  }

  const Cn = maxC + 1
  const off = new Array(Cn + 1).fill(0)

  for (let i = 0; i < E; i++) {
    off[color[i]! + 1]++
  }

  for (let c = 0; c < Cn; c++) {
    off[c + 1] += off[c]!
  }

  const edgeV = new Uint32Array(E),
    edgeW = new Uint32Array(E),
    cur = off.slice()

  for (let i = 0; i < E; i++) {
    const at = cur[color[i]!]!++
    edgeV[at] = eu[i]!
    edgeW[at] = ev[i]!
  }

  // identical random background; copy A gets a tiny central perturbation
  const A = new Uint8Array(n),
    B = new Uint8Array(n)

  const r = makeRng({ seed: 987654321 })
  const rr = () => r.next()

  for (let i = 0; i < n; i++) {
    const x = rr()
    const v = x < 0.2 ? 1 : x < 0.4 ? 2 : 0
    A[i] = v
    B[i] = v
  }

  // centre cell + a few neighbours, bump the tone (the perturbation) only in A
  let ctr = bandCells[0]!,
    bd = 1e9

  for (let j = 0; j < bandCells.length; j++) {
    const d = Math.hypot(uv[j]![0] - cu, uv[j]![1] - cv)

    if (d < bd) {
      bd = d
      ctr = bandCells[j]!
    }
  }

  A[ctr] = ((A[ctr]! + 1) % 3)

  for (const w of nb[ctr]!) {
    A[w] = ((A[w]! + 1) % 3)
  }

  const beat = (t: Uint8Array): void => {
    for (let c = 0; c < Cn; c++) {
      for (let e = off[c]!; e < off[c + 1]!; e++) {
        const v = edgeV[e]!,
          w = edgeW[e]!

        const o = PERM[t[v]! * 3 + t[w]!]!
        t[v] = (o / 3) | 0
        t[w] = o % 3
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
  console.log(
    `lightcone: ${bandCells.length.toLocaleString()} cells, ${Cn} colours, ${FRAMES} frames`,
  )

  for (let f = 0; f < FRAMES; f++) {
    beat(A)
    beat(B)

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 6
      rgba[i * 4 + 1] = 6
      rgba[i * 4 + 2] = 9
      rgba[i * 4 + 3] = 255
    }

    let diff = 0

    for (let j = 0; j < bandCells.length; j++) {
      const i = bandCells[j]!

      if (A[i] === B[i]) {
        continue
      }

      diff++

      const [cx, cy] = pix[j]!
      const col: [number, number, number] =
        A[i]! > B[i]! ? [120, 230, 255] : [255, 200, 120]

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = cx + dx,
            y = cy + dy

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

    if (f % 30 === 0) {
      console.log(`  frame ${f}, cone ${diff.toLocaleString()} cells`)
    }
  }

  console.log('wrote frames, assemble with ffmpeg')
}

run()
