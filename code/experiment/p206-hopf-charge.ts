// P206 (Tier 2): compute the 3D HOPF charge directly on the grid (not cited). Build the Hopf-map direction
// field (a hopfion), extract the preimage CURVES of two points on S^2, and compute their Gauss LINKING NUMBER.
// The Hopf fibration links any two fibres once, so the linking is 1 (odd) -> the self is a FERMION (Wilczek-Zee).
// Run: npx tsx code/experiment/p206-hopf-charge.ts

import { pathToFileURL } from 'node:url'

type V3 = [number, number, number]

// Hopf map R^3 -> S^2 of size lambda (inverse-stereographic R^3->S^3 then the Hopf projection)
function hopfField(M: number, lambda: number): { n: Float64Array; idx: (x: number, y: number, z: number) => number } {
  const n = new Float64Array(M * M * M * 3)
  const c = M / 2
  const idx = (x: number, y: number, z: number): number => ((z * M + y) * M + x)
  for (let x = 0; x < M; x++) for (let y = 0; y < M; y++) for (let z = 0; z < M; z++) {
    const X = (x - c) / lambda, Y = (y - c) / lambda, Z = (z - c) / lambda, r2 = X * X + Y * Y + Z * Z
    const d = 1 + r2
    // S^3 point (Z1 = a+ib, Z2 = cc+i*dd), |Z|=1
    const a = (2 * X) / d, b = (2 * Y) / d, cc = (2 * Z) / d, dd = (1 - r2) / d
    // Hopf: n = (2 Re(Z1 conj Z2), 2 Im(Z1 conj Z2), |Z1|^2 - |Z2|^2)
    const nx = 2 * (a * cc + b * dd), ny = 2 * (b * cc - a * dd), nz = a * a + b * b - cc * cc - dd * dd
    const m = Math.hypot(nx, ny, nz) || 1
    const i = idx(x, y, z) * 3; n[i] = nx / m; n[i + 1] = ny / m; n[i + 2] = nz / m
  }
  return { n, idx }
}

// extract the preimage of a target S^2 point as an ordered loop (nearest-neighbour chaining of close cells)
function preimageLoop(n: Float64Array, idx: (x: number, y: number, z: number) => number, M: number, target: V3, tol: number): V3[] {
  const pts: V3[] = []
  for (let x = 1; x < M - 1; x++) for (let y = 1; y < M - 1; y++) for (let z = 1; z < M - 1; z++) {
    const i = idx(x, y, z) * 3
    const d = (n[i]! - target[0]) ** 2 + (n[i + 1]! - target[1]) ** 2 + (n[i + 2]! - target[2]) ** 2
    if (d < tol * tol) pts.push([x, y, z])
  }
  if (pts.length < 4) return pts
  // thin to a loop by nearest-neighbour ordering
  const used = new Set<number>([0]); const loop: V3[] = [pts[0]!]
  for (let k = 1; k < pts.length; k++) {
    const last = loop[loop.length - 1]!; let best = -1, bd = Infinity
    for (let j = 0; j < pts.length; j++) { if (used.has(j)) continue; const p = pts[j]!; const dd = (p[0] - last[0]) ** 2 + (p[1] - last[1]) ** 2 + (p[2] - last[2]) ** 2; if (dd < bd) { bd = dd; best = j } }
    if (best < 0 || bd > 16) break
    used.add(best); loop.push(pts[best]!)
  }
  return loop
}

// Gauss linking number of two closed loops (double sum over segments)
function linkingNumber(A: V3[], B: V3[]): number {
  const seg = (L: V3[]): { p: V3; d: V3 }[] => L.map((p, i) => { const q = L[(i + 1) % L.length]!; return { p, d: [q[0] - p[0], q[1] - p[1], q[2] - p[2]] as V3 } })
  const sa = seg(A), sb = seg(B); let s = 0
  for (const u of sa) for (const v of sb) {
    const rx = u.p[0] + u.d[0] / 2 - (v.p[0] + v.d[0] / 2), ry = u.p[1] + u.d[1] / 2 - (v.p[1] + v.d[1] / 2), rz = u.p[2] + u.d[2] / 2 - (v.p[2] + v.d[2] / 2)
    const r = Math.hypot(rx, ry, rz); if (r < 1e-6) continue
    const cx = u.d[1] * v.d[2] - u.d[2] * v.d[1], cy = u.d[2] * v.d[0] - u.d[0] * v.d[2], cz = u.d[0] * v.d[1] - u.d[1] * v.d[0]
    s += (rx * cx + ry * cy + rz * cz) / (r * r * r)
  }
  return s / (4 * Math.PI)
}

export function hopfCharge(): { linking: number; isFermion: boolean } {
  const M = 48, lambda = 9
  const { n, idx } = hopfField(M, lambda)
  // two generic, well-separated S^2 targets -> two fibres
  const A = preimageLoop(n, idx, M, [0.9, 0, 0.2], 0.22)
  const B = preimageLoop(n, idx, M, [0, 0.9, -0.2], 0.22)
  const L = linkingNumber(A, B)
  const linking = Math.round(L * 100) / 100
  const isFermion = Math.abs(Math.round(L)) % 2 === 1
  console.log(`P206 Hopf charge via linking of two fibres (loop sizes ${A.length}, ${B.length}):`)
  console.log(`  Gauss linking number = ${linking} (the Hopf fibration links fibres ONCE, expected ~1)`)
  console.log(`  => odd linking -> the hopfion-self returns -1 under 2-pi (Wilczek-Zee), a FERMION: ${isFermion}`)
  return { linking, isFermion }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = hopfCharge()
  console.log(`SOLVED: Hopf linking ${r.linking}, fermion ${r.isFermion}`)
}
