// Recursive finite-subdivision of a dodecahedron's SURFACE, the "jewel mesh", rendered in 3D (rotated,
// perspective, depth-shaded, backface-culled) so it reads as a faceted jewel rather than a cluttered web.
// Each pentagonal face subdivides into smaller polygons ON the sphere, recursively (the boundary/face
// subdivision the finite-subdivision-rule docs describe). This is a VISUALIZATION overlay, not a base
// dynamical ingredient (the five base things stand, see recursive-subdivision-of-534.md).
// Run: pnpm tsx code/gpu/render-jewel-mesh.ts

import { encodePng } from '@/code/draw/png'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Vec3 = [number, number, number]

const DEPTH = 4 // surface subdivision levels
const IMG = 1400

const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
]

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const norm3 = (v: Vec3): number => Math.hypot(v[0], v[1], v[2])

const normalize = (v: Vec3): Vec3 => {
  const n = norm3(v) || 1

  return [v[0] / n, v[1] / n, v[2] / n]
}

const centroid = (pts: Vec3[]): Vec3 => {
  const n = pts.length

  return [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n,
    pts.reduce((s, p) => s + p[2], 0) / n,
  ]
}

// subdivide a polygon face ON THE SPHERE, center + edge-midpoints, into a quad per edge, all kept on the unit
// sphere. A pentagon becomes 5 quads, each quad becomes 4, and so on, a fine subdivided surface.
function subdivideFace(face: Vec3[]): Vec3[][] {
  const c = normalize(centroid(face))
  const m = face.map((v, i) =>
    normalize([
      (v[0] + face[(i + 1) % face.length]![0]) / 2,
      (v[1] + face[(i + 1) % face.length]![1]) / 2,
      (v[2] + face[(i + 1) % face.length]![2]) / 2,
    ]),
  )

  const out: Vec3[][] = []

  for (let i = 0; i < face.length; i++) {
    const prev = m[(i - 1 + face.length) % face.length]!

    out.push([face[i]!, m[i]!, c, prev])
  }

  return out
}

function dodecahedronFaces(): Vec3[][] {
  const phi = (1 + Math.sqrt(5)) / 2
  const inv = 1 / phi
  const raw: Vec3[] = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
    [0, inv, phi],
    [0, inv, -phi],
    [0, -inv, phi],
    [0, -inv, -phi],
    [inv, phi, 0],
    [-inv, phi, 0],
    [inv, -phi, 0],
    [-inv, -phi, 0],
    [phi, 0, inv],
    [phi, 0, -inv],
    [-phi, 0, inv],
    [-phi, 0, -inv],
  ]

  const verts = raw.map(v => normalize(v))
  const dirs: Vec3[] = [
    [0, 1, phi],
    [0, 1, -phi],
    [0, -1, phi],
    [0, -1, -phi],
    [1, phi, 0],
    [1, -phi, 0],
    [-1, phi, 0],
    [-1, -phi, 0],
    [phi, 0, 1],
    [phi, 0, -1],
    [-phi, 0, 1],
    [-phi, 0, -1],
  ]

  return dirs.map(d => {
    const u = normalize(d)
    const idx = verts
      .map((_, i) => i)
      .sort(
        (a, b) =>
          verts[b]![0] * u[0] +
          verts[b]![1] * u[1] +
          verts[b]![2] * u[2] -
          (verts[a]![0] * u[0] +
            verts[a]![1] * u[1] +
            verts[a]![2] * u[2]),
      )
      .slice(0, 5)

    const ref = verts[idx[0]!]!
    const e1 = normalize(
      sub(ref, [
        u[0] * (ref[0] * u[0] + ref[1] * u[1] + ref[2] * u[2]),
        u[1] * (ref[0] * u[0] + ref[1] * u[1] + ref[2] * u[2]),
        u[2] * (ref[0] * u[0] + ref[1] * u[1] + ref[2] * u[2]),
      ]),
    )

    const e2 = cross(u, e1)
    const ordered = idx.slice().sort((a, b) => {
      const va = verts[a]!
      const vb = verts[b]!

      return (
        Math.atan2(
          va[0] * e2[0] + va[1] * e2[1] + va[2] * e2[2],
          va[0] * e1[0] + va[1] * e1[1] + va[2] * e1[2],
        ) -
        Math.atan2(
          vb[0] * e2[0] + vb[1] * e2[1] + vb[2] * e2[2],
          vb[0] * e1[0] + vb[1] * e1[1] + vb[2] * e1[2],
        )
      )
    })

    return ordered.map(i => verts[i]!)
  })
}

// rotate a point, fixed pleasing angles
function rotate(v: Vec3): Vec3 {
  const ax = 0.5
  const ay = 0.9
  const cx = Math.cos(ax)
  const sx = Math.sin(ax)
  const cy = Math.cos(ay)
  const sy = Math.sin(ay)
  const y1 = v[1] * cx - v[2] * sx
  const z1 = v[1] * sx + v[2] * cx
  const x2 = v[0] * cy + z1 * sy
  const z2 = -v[0] * sy + z1 * cy

  return [x2, y1, z2]
}

function line(
  rgba: Uint8Array,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  b: number,
): void {
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)

  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1

  let err = dx + dy
  let x = x0
  let y = y0

  for (;;) {
    if (x >= 0 && x < IMG && y >= 0 && y < IMG) {
      const i = (y * IMG + x) * 4

      rgba[i] = Math.min(255, (rgba[i]! + b * 0.45) | 0)
      rgba[i + 1] = Math.min(255, (rgba[i + 1]! + b * 0.75) | 0)
      rgba[i + 2] = Math.min(255, rgba[i + 2]! + b)
    }

    if (x === x1 && y === y1) {
      break
    }

    const e2 = 2 * err

    if (e2 >= dy) {
      err += dy
      x += sx
    }

    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

function run(): void {
  let faces = dodecahedronFaces()

  for (let d = 0; d < DEPTH; d++) {
    faces = faces.flatMap(subdivideFace)
  }

  console.log(
    `jewel mesh, dodecahedron surface subdivided depth ${DEPTH} -> ${faces.length.toLocaleString()} faces`,
  )

  const rgba = new Uint8Array(IMG * IMG * 4)

  for (let i = 0; i < IMG * IMG; i++) {
    rgba[i * 4 + 3] = 255
  }

  const cam = 5.5
  const scale = IMG * 1.55

  const project = (v: Vec3): [number, number, number] => {
    const r = rotate(v)
    const f = scale / (cam - r[2])

    return [IMG / 2 + r[0] * f, IMG / 2 - r[1] * f, r[2]]
  }

  for (const face of faces) {
    const r = face.map(rotate)
    // backface cull, only draw faces whose outward normal faces the camera (+z toward viewer)
    const n = cross(sub(r[1]!, r[0]!), sub(r[2]!, r[0]!))

    if (n[2] <= 0) {
      continue
    }

    // depth brightness, front (larger z) brighter
    const zc = (r[0]![2] + r[1]![2] + r[2]![2] + r[3]![2]) / 4
    const b = Math.max(
      20,
      Math.min(255, Math.round(60 + (150 * (zc + 1)) / 2)),
    )

    const pts = face.map(project)

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!
      const c = pts[(i + 1) % pts.length]!

      line(
        rgba,
        Math.round(a[0]),
        Math.round(a[1]),
        Math.round(c[0]),
        Math.round(c[1]),
        b,
      )
    }
  }

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
  )

  mkdirSync(outDir, { recursive: true })

  const outPath = join(outDir, 'jewel-mesh.png')

  writeFileSync(outPath, encodePng(rgba, IMG, IMG))
  console.log(`wrote ${outPath}`)
}

run()
