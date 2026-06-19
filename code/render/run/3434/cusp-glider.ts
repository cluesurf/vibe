// 3D GLIDER video in the {3,4,3,4} flat 3D CUSP ({4,3,4} cubic space). The conserving perception HOP carries
// coherent particles BALLISTICALLY through flat 3D (measured in testing-3434-results.md), here visualized,
// several single charges and a small cluster glide across the cube, leaving comet trails so the straight-line
// motion is clear. A faint wireframe cube gives 3D depth reference. Volume-composited (red -1, blue +1, black
// 0), no white. Run: pnpm tsx code/gpu/render-cusp-3434-glider.ts   then task/render-video.sh

import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { PLEASURE, PAIN } from '@/code/draw/color'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const L = 100
const FRAMES = 150
const IMG = 1000
const AX = 0.5
const AY = 0.9
const ALPHA = 0.75
const SPLAT = 3
const DECAY = 0.93 // trail fade per beat (long comet tails so motion reads clearly)

const N = L * L * L
const idx = (x: number, y: number, z: number): number =>
  (z * L + y) * L + x

const dx = [1, -1, 0, 0, 0, 0]
const dy = [0, 0, 1, -1, 0, 0]
const dz = [0, 0, 0, 0, 1, -1]

// the conserving perception hop (annihilate + hop, no creation), deterministic matching, rotating start
function step(tone: Int8Array, f: number): void {
  const m = new Uint8Array(N)
  const start = (f * 2654435761) % N

  for (let s = 0; s < N; s++) {
    const v = (start + s) % N

    if (m[v] || tone[v] === 0) {
      continue
    }

    const vx = v % L
    const vy = ((v / L) | 0) % L
    const vz = (v / (L * L)) | 0

    for (let k = 0; k < 6; k++) {
      const wx = (vx + dx[k]! + L) % L // toroidal, so gliders flow continuously and never pile at a face
      const wy = (vy + dy[k]! + L) % L
      const wz = (vz + dz[k]! + L) % L
      const w = idx(wx, wy, wz)

      if (m[w]) {
        continue
      }

      const a = tone[v]!
      const b = tone[w]!

      if (a === -b && a !== 0) {
        tone[v] = 0
        tone[w] = 0
        m[v] = 1
        m[w] = 1
        break
      }

      if (a !== 0 && b === 0) {
        tone[w] = a as -1 | 1
        tone[v] = 0
        m[v] = 1
        m[w] = 1
        break
      }
    }
  }
}

function run(): void {
  // precompute projection (fixed rotation) + back-to-front order
  const cosx = Math.cos(AX)
  const sinx = Math.sin(AX)
  const cosy = Math.cos(AY)
  const siny = Math.sin(AY)
  const half = (L - 1) / 2
  const scale = (IMG * 0.6) / L

  const project = (
    x: number,
    y: number,
    z: number,
  ): [number, number, number] => {
    const ox = x - half
    const oy = y - half
    const oz = z - half
    const y1 = oy * cosx - oz * sinx
    const z1 = oy * sinx + oz * cosx
    const x2 = ox * cosy + z1 * siny
    const z2 = -ox * siny + z1 * cosy

    return [IMG / 2 + x2 * scale, IMG / 2 - y1 * scale, z2]
  }

  const PX = new Int32Array(N)
  const PY = new Int32Array(N)
  const DEPTH = new Float32Array(N)
  const z2arr = new Float32Array(N)

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const [px, py, pz] = project(x, y, z)
        const i = idx(x, y, z)
        PX[i] = Math.round(px)
        PY[i] = Math.round(py)
        z2arr[i] = pz
        DEPTH[i] = 0.5 + 0.5 * (pz / L + 0.5)
      }
    }
  }

  const order = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => z2arr[a]! - z2arr[b]!,
  )

  // wireframe cube edges (the 8 corners, 12 edges), projected
  const corners: [number, number][] = []

  for (let cz = 0; cz < 2; cz++) {
    for (let cy = 0; cy < 2; cy++) {
      for (let cx = 0; cx < 2; cx++) {
        const [px, py] = project(
          cx * (L - 1),
          cy * (L - 1),
          cz * (L - 1),
        )

        corners.push([Math.round(px), Math.round(py)])
      }
    }
  }

  const edges: [number, number][] = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]

  // seed several gliders at low x, spread across y and z, so they all glide +x across the cube (and wrap)
  const tone = new Int8Array(N)
  const seeds: [number, number, number, number][] = [
    [8, 25, 30, 1],
    [8, 55, 40, -1],
    [8, 40, 68, 1],
    [8, 72, 70, -1],
    [8, 30, 78, 1],
    [8, 65, 22, -1],
  ]

  for (const [x, y, z, s] of seeds) {
    tone[idx(x, y, z)] = s as -1 | 1
  }

  for (let k = 0; k < 6; k++) {
    tone[idx(8 + dx[k]!, 45 + dy[k]!, 45 + dz[k]!)] = 1
  } // a 7-cell cluster glider

  tone[idx(8, 45, 45)] = 1

  const trail = new Float32Array(N)
  const tsign = new Int8Array(N)

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
    'frames',
  )

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const BLUE: [number, number, number] = PLEASURE
  const RED: [number, number, number] = PAIN
  const accR = new Float32Array(IMG * IMG)
  const accG = new Float32Array(IMG * IMG)
  const accB = new Float32Array(IMG * IMG)

  for (let f = 0; f < FRAMES; f++) {
    // update trails from the current charges
    for (let i = 0; i < N; i++) {
      trail[i] = trail[i]! * DECAY

      if (tone[i] !== 0) {
        trail[i] = 1
        tsign[i] = tone[i]!
      }
    }

    accR.fill(0)
    accG.fill(0)
    accB.fill(0)

    // faint wireframe first (so charges draw over it)
    const drawLine = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
    ): void => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1

      for (let s = 0; s <= steps; s++) {
        const ix = Math.round(x0 + ((x1 - x0) * s) / steps)
        const iy = Math.round(y0 + ((y1 - y0) * s) / steps)

        if (ix < 0 || ix >= IMG || iy < 0 || iy >= IMG) {
          continue
        }

        const pix = iy * IMG + ix
        accR[pix] = 26
        accG[pix] = 28
        accB[pix] = 34
      }
    }

    for (const [a, b] of edges) {
      drawLine(
        corners[a]![0],
        corners[a]![1],
        corners[b]![0],
        corners[b]![1],
      )
    }

    // composite trails + heads back-to-front
    for (let k = 0; k < N; k++) {
      const cell = order[k]!
      const tr = trail[cell]!

      if (tr < 0.03) {
        continue
      }

      const col = tsign[cell] === 1 ? BLUE : RED
      const d = DEPTH[cell]!
      const a = Math.min(0.95, ALPHA * tr)
      const cxp = PX[cell]!
      const cyp = PY[cell]!
      const rad = tone[cell] !== 0 ? SPLAT : SPLAT - 1 // bright head bigger than trail

      for (let ddy = -rad; ddy <= rad; ddy++) {
        for (let ddx = -rad; ddx <= rad; ddx++) {
          const ix = cxp + ddx
          const iy = cyp + ddy

          if (ix < 0 || ix >= IMG || iy < 0 || iy >= IMG) {
            continue
          }

          const pix = iy * IMG + ix
          accR[pix] = accR[pix]! * (1 - a) + col[0] * d * a
          accG[pix] = accG[pix]! * (1 - a) + col[1] * d * a
          accB[pix] = accB[pix]! * (1 - a) + col[2] * d * a
        }
      }
    }

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = Math.min(255, 6 + accR[i]!)
      rgba[i * 4 + 1] = Math.min(255, 6 + accG[i]!)
      rgba[i * 4 + 2] = Math.min(255, 7 + accB[i]!)
      rgba[i * 4 + 3] = 255
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })

    step(tone, f)
  }

  console.log(
    `wrote ${FRAMES} frames of 3D gliders in the {3,4,3,4} cusp, assemble with task/render-video.sh`,
  )
}

run()
