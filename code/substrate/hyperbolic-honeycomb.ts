// The dodecagrid: the regular {5,3,4} hyperbolic honeycomb in 3-space (dodecahedral
// cells, three around each edge of a face, four cells around each edge), Margenstern's
// main 3D structure. Built deterministically by reflecting a central hyperbolic
// dodecahedron across its face-planes (spheres orthogonal to the unit ball), breadth
// first. See note/deterministic-substrate.md.

import { Embedding, ManifoldSpec } from '@/code/tool/embedding'
import { Graph, makeGraph } from '@/code/tool/graph'
import { poincareCoshFromParts } from '@/code/geometry/distance'

interface V3 {
  x: number
  y: number
  z: number
}

// Unit regular dodecahedron: 20 vertices (all at magnitude sqrt(3)) and its 12 faces,
// each the five vertices most aligned with an icosahedral face-direction.
function dodecahedron(): { verts: V3[]; faces: number[][] } {
  const phi = (1 + Math.sqrt(5)) / 2
  const ip = 1 / phi
  const verts: V3[] = []
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push({ x: sx, y: sy, z: sz })
      }
    }
  }

  for (const a of [-ip, ip]) {
    for (const b of [-phi, phi]) {
      verts.push({ x: 0, y: a, z: b })
      verts.push({ x: a, y: b, z: 0 })
      verts.push({ x: b, y: 0, z: a })
    }
  }

  const dirs: V3[] = []
  for (const a of [-1, 1]) {
    for (const b of [-phi, phi]) {
      dirs.push({ x: 0, y: a, z: b })
      dirs.push({ x: a, y: b, z: 0 })
      dirs.push({ x: b, y: 0, z: a })
    }
  }

  const faces = dirs.map(d => {
    const scored = verts
      .map((v, i) => [i, v.x * d.x + v.y * d.y + v.z * d.z] as const)
      .sort((p, q) => q[1] - p[1])

    return scored.slice(0, 5).map(s => s[0])
  })

  return { verts, faces }
}

// The sphere orthogonal to the unit sphere through three points (a face-plane geodesic).
// 2 p_i . c = |p_i|^2 + 1 for each point, solved for the center c, then radius^2.
function faceSphere(p: V3[]): { c: V3; r2: number } | null {
  const a = p.map(q => [2 * q.x, 2 * q.y, 2 * q.z])
  const b = p.map(q => q.x * q.x + q.y * q.y + q.z * q.z + 1)
  const m = a
  const det =
    (m[0]![0] ?? 0) *
      ((m[1]![1] ?? 0) * (m[2]![2] ?? 0) -
        (m[1]![2] ?? 0) * (m[2]![1] ?? 0)) -
    (m[0]![1] ?? 0) *
      ((m[1]![0] ?? 0) * (m[2]![2] ?? 0) -
        (m[1]![2] ?? 0) * (m[2]![0] ?? 0)) +
    (m[0]![2] ?? 0) *
      ((m[1]![0] ?? 0) * (m[2]![1] ?? 0) -
        (m[1]![1] ?? 0) * (m[2]![0] ?? 0))
  if (Math.abs(det) < 1e-12) {
    return null
  }

  const solve = (col: number): number => {
    const mm = m.map(row => [...row])
    for (let i = 0; i < 3; i++) {
      mm[i]![col] = b[i] ?? 0
    }

    const d =
      (mm[0]![0] ?? 0) *
        ((mm[1]![1] ?? 0) * (mm[2]![2] ?? 0) -
          (mm[1]![2] ?? 0) * (mm[2]![1] ?? 0)) -
      (mm[0]![1] ?? 0) *
        ((mm[1]![0] ?? 0) * (mm[2]![2] ?? 0) -
          (mm[1]![2] ?? 0) * (mm[2]![0] ?? 0)) +
      (mm[0]![2] ?? 0) *
        ((mm[1]![0] ?? 0) * (mm[2]![1] ?? 0) -
          (mm[1]![1] ?? 0) * (mm[2]![0] ?? 0))

    return d / det
  }

  const c = { x: solve(0), y: solve(1), z: solve(2) }

  return { c, r2: c.x * c.x + c.y * c.y + c.z * c.z - 1 }
}

function invert(z: V3, c: V3, r2: number): V3 {
  const dx = z.x - c.x
  const dy = z.y - c.y
  const dz = z.z - c.z
  const s = r2 / (dx * dx + dy * dy + dz * dz)

  return { x: c.x + s * dx, y: c.y + s * dy, z: c.z + s * dz }
}

// Dihedral angle along a shared edge of two faces, the angle between their geodesic
// spheres (conformal, so it is the Euclidean sphere angle).
function dihedral(
  s1: { c: V3; r2: number },
  s2: { c: V3; r2: number },
): number {
  const dx = s1.c.x - s2.c.x
  const dy = s1.c.y - s2.c.y
  const dz = s1.c.z - s2.c.z
  const d2 = dx * dx + dy * dy + dz * dz
  const cos = (s1.r2 + s2.r2 - d2) / (2 * Math.sqrt(s1.r2 * s2.r2))

  return Math.acos(Math.max(-1, Math.min(1, cos)))
}

// Scale unit vertices to Poincare-Euclidean radius r0 (all unit verts have magnitude
// sqrt(3)), then return the cell vertices and face-spheres.
function cellAt(
  r0: number,
  base: { verts: V3[]; faces: number[][] },
): { verts: V3[]; spheres: ({ c: V3; r2: number } | null)[] } {
  const s = r0 / Math.sqrt(3)
  const verts = base.verts.map(v => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
  }))
  const spheres = base.faces.map(f =>
    faceSphere([verts[f[0]!]!, verts[f[1]!]!, verts[f[2]!]!]),
  )

  return { verts, spheres }
}

// Find the Poincare radius r0 giving a 90-degree dihedral (four cells around an edge).
function solveRadius(base: { verts: V3[]; faces: number[][] }): number {
  // Two faces sharing an edge (sharing two vertices).
  let fa = 0
  let fb = 1
  outer: for (let i = 0; i < base.faces.length; i++) {
    for (let j = i + 1; j < base.faces.length; j++) {
      const shared = base.faces[i]!.filter(v =>
        base.faces[j]!.includes(v),
      )
      if (shared.length === 2) {
        fa = i
        fb = j
        break outer
      }
    }
  }

  const dihedralAt = (r0: number): number => {
    const cell = cellAt(r0, base)
    const s1 = cell.spheres[fa]
    const s2 = cell.spheres[fb]
    if (!s1 || !s2) {
      return Math.PI
    }

    return dihedral(s1, s2)
  }

  // Dihedral increases with r0. Binary search for 90 degrees (four cells per edge).
  let lo = 0.05
  let hi = 0.95
  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2
    if (dihedralAt(mid) < Math.PI / 2) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

export function hyperbolicDodecagrid(input: {
  depth: number
  connectThreshold: number
  maxVertices?: number
}): Graph {
  const base = dodecahedron()
  const r0 = solveRadius(base)
  const central = cellAt(r0, base)

  const key = (v: V3): string =>
    `${Math.round(v.x * 1e4)},${Math.round(v.y * 1e4)},${Math.round(v.z * 1e4)}`
  const vkeys = new Set<string>()
  const vx: number[] = []
  const vy: number[] = []
  const vz: number[] = []
  const addV = (v: V3): void => {
    const k = key(v)
    if (!vkeys.has(k)) {
      vkeys.add(k)
      vx.push(v.x)
      vy.push(v.y)
      vz.push(v.z)
    }
  }

  central.verts.forEach(addV)

  const cellKey = (verts: V3[]): string => {
    let cx = 0
    let cy = 0
    let cz = 0
    for (const v of verts) {
      cx += v.x
      cy += v.y
      cz += v.z
    }

    return key({
      x: cx / verts.length,
      y: cy / verts.length,
      z: cz / verts.length,
    })
  }

  const seen = new Set<string>([cellKey(central.verts)])
  const cap = input.maxVertices ?? 4000

  let frontier: V3[][] = [central.verts]
  for (let d = 0; d < input.depth && vx.length < cap; d++) {
    const next: V3[][] = []
    for (const cellVerts of frontier) {
      if (vx.length >= cap) {
        break
      }

      // Recompute this cell's face-spheres from its own vertices.
      for (const face of base.faces) {
        const sph = faceSphere([
          cellVerts[face[0]!]!,
          cellVerts[face[1]!]!,
          cellVerts[face[2]!]!,
        ])
        if (!sph) {
          continue
        }

        const reflected = cellVerts.map(v => invert(v, sph.c, sph.r2))
        const ck = cellKey(reflected)
        if (!seen.has(ck)) {
          seen.add(ck)
          reflected.forEach(addV)
          next.push(reflected)
        }
      }
    }

    frontier = next
  }

  // Build the graph: 3D Poincare-ball coords, connect by Euclidean proximity.
  const n = vx.length
  const dimension = 3
  const coords = new Float64Array(n * dimension)
  for (let i = 0; i < n; i++) {
    coords[i * dimension] = vx[i] ?? 0
    coords[i * dimension + 1] = vy[i] ?? 0
    coords[i * dimension + 2] = vz[i] ?? 0
  }

  // Connect by HYPERBOLIC distance (uniform connectivity, not biased by the boundary
  // compression of the disc): cosh(d) = 1 + 2|u-v|^2 / ((1-|u|^2)(1-|v|^2)).
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  const coshThreshold = Math.cosh(input.connectThreshold)
  const oneMinus = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    oneMinus[i] = Math.max(
      1e-9,
      1 - ((vx[i] ?? 0) ** 2 + (vy[i] ?? 0) ** 2 + (vz[i] ?? 0) ** 2),
    )
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = (vx[i] ?? 0) - (vx[j] ?? 0)
      const dy = (vy[i] ?? 0) - (vy[j] ?? 0)
      const dz = (vz[i] ?? 0) - (vz[j] ?? 0)
      const coshd = poincareCoshFromParts(
        dx * dx + dy * dy + dz * dz,
        oneMinus[i] ?? 1,
        oneMinus[j] ?? 1,
      )
      if (coshd <= coshThreshold) {
        neighbors[i]?.push(j)
        neighbors[j]?.push(i)
      }
    }
  }

  const manifold: ManifoldSpec = {
    form: 'hyperbolic',
    dimension: 3,
    curvature: -1,
  }
  const embedding: Embedding = {
    form: 'embedding',
    dimension,
    signature: 'riemannian',
    coords,
    manifold,
  }

  return makeGraph({ size: n, directed: false, neighbors, embedding })
}
