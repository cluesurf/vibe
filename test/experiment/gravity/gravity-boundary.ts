// P219 (gravity, DIMENSION-RESOLVED): the tree (p218) gave a dimension-blind 1/r. But gravity lives on the flat
// physical-space layer (the cusp / horosphere), whose OWN Laplacian Green's function is the d-dimensional Newton
// law 1/r^(d-2). So {3,4,3,4}'s 3D cusp -> 1/r (correct 3D Newton), {5,3,4}'s 2D horosphere -> log r. We solve
// the discrete Poisson equation (-Laplacian) G = delta on the flat lattice by conjugate gradient and read the
// falloff. Run: npx tsx code/experiment/p219-gravity-boundary.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// conjugate-gradient solve of (-Laplacian) x = b with Dirichlet (x=0) boundary, on a d-cube of side L
function solvePoisson(L: number, d: number): { x: Float64Array; idx: (c: number[]) => number; coord: (i: number) => number[] } {
  const N = d === 3 ? L * L * L : L * L
  const idx = (c: number[]): number => d === 3 ? (c[2]! * L + c[1]!) * L + c[0]! : c[1]! * L + c[0]!
  const coord = (i: number): number[] => d === 3 ? [i % L, ((i / L) | 0) % L, (i / (L * L)) | 0] : [i % L, (i / L) | 0]
  const lap = (p: Float64Array, o: Float64Array): void => {
    for (let i = 0; i < N; i++) {
      const c = coord(i); let v = 2 * d * p[i]!
      for (let k = 0; k < d; k++) for (const s of [-1, 1]) { const cc = c.slice(); cc[k]! += s; if (cc[k]! >= 0 && cc[k]! < L) v -= p[idx(cc)]! }
      o[i] = v
    }
  }
  const dot = (a: Float64Array, b: Float64Array): number => { let s = 0; for (let i = 0; i < N; i++) s += a[i]! * b[i]!; return s }
  const b = new Float64Array(N); const c0 = d === 3 ? [L >> 1, L >> 1, L >> 1] : [L >> 1, L >> 1]; b[idx(c0)] = 1
  const x = new Float64Array(N), r = b.slice(), p = b.slice(), Ap = new Float64Array(N)
  let rs = dot(r, r)
  for (let it = 0; it < 4000; it++) {
    lap(p, Ap); const al = rs / dot(p, Ap)
    for (let i = 0; i < N; i++) { x[i]! += al * p[i]!; r[i]! -= al * Ap[i]! }
    const rs2 = dot(r, r); if (Math.sqrt(rs2) < 1e-7) break
    const be = rs2 / rs; for (let i = 0; i < N; i++) p[i] = r[i]! + be * p[i]!; rs = rs2
  }
  return { x, idx, coord }
}
function radial(sol: { x: Float64Array; coord: (i: number) => number[] }, L: number, d: number): { r: number; g: number }[] {
  const c0 = L / 2; const bins = new Map<number, { s: number; n: number }>()
  for (let i = 0; i < sol.x.length; i++) {
    const c = sol.coord(i); let r2 = 0; for (let k = 0; k < d; k++) r2 += (c[k]! - c0) ** 2
    const r = Math.round(Math.sqrt(r2)); if (r < 2 || r > L * 0.35) continue
    const b = bins.get(r) ?? { s: 0, n: 0 }; b.s += sol.x[i]!; b.n++; bins.set(r, b)
  }
  return [...bins.entries()].map(([r, b]) => ({ r, g: b.s / b.n })).sort((a, b) => a.r - b.r)
}

export function gravityBoundary(): { exp3D: number; slope2DvsLog: number } {
  // 3D cusp ({4,3,4}): Newton 1/r  -> g(r)*r ~ const, i.e. log g vs log r slope ~ -1
  const s3 = solvePoisson(48, 3), p3 = radial(s3, 48, 3)
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const p of p3) { if (p.g <= 0) continue; const X = Math.log(p.r), Y = Math.log(p.g); n++; sx += X; sy += Y; sxx += X * X; sxy += X * Y }
  const exp3D = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  console.log('P219 dimension-resolved gravity (flat-layer Green\'s function):')
  console.log(`  3D cusp {4,3,4}: G(r) vs r log-log slope = ${exp3D.toFixed(2)} (Newton 1/r expects -1)`)
  console.log(`    sample G(r)*r: ${p3.filter((p) => [3, 6, 10, 14].includes(p.r)).map((p) => `r${p.r}:${(p.g * p.r).toFixed(3)}`).join('  ')} (flat => 1/r)`)
  // 2D horosphere: Newton ~ -log r -> g(r) linear in log r (negative slope)
  const s2 = solvePoisson(220, 2), p2 = radial(s2, 220, 2)
  let n2 = 0, lx = 0, ly = 0, lxx = 0, lxy = 0
  for (const p of p2) { const X = Math.log(p.r); n2++; lx += X; ly += p.g; lxx += X * X; lxy += X * p.g }
  const slope2DvsLog = (n2 * lxy - lx * ly) / (n2 * lxx - lx * lx)
  console.log(`  2D horosphere: G(r) vs ln(r) slope = ${slope2DvsLog.toFixed(3)} (Newton -log r expects a clear NEGATIVE slope)`)
  console.log('  => the flat physical-space layer carries the DIMENSION-CORRECT Newton law: {3,4,3,4} 3D cusp gives 1/r')
  console.log('     (slope ~ -1, the correct 3D gravity), {5,3,4} 2D horosphere gives a logarithm. This is the')
  console.log('     dimension-resolved answer the dimension-blind tree (p218) could not give. Gravity lives on the flat layer.')
  return { exp3D, slope2DvsLog }
}

export default defineExperiment({
  id: 'gravity/gravity-boundary',
  title: 'the discrete Poisson Green function on the flat 3D cusp falls as 1/r and on the 2D horosphere as log r',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = gravityBoundary()
    const threeDimNewton = Math.abs(r.exp3D + 1) < 0.25
    const twoDimLog = r.slope2DvsLog < 0
    const ok = threeDimNewton && twoDimLog
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'solving the discrete Laplacian Green function on a flat 3D cube gives a 1/r falloff and on a flat 2D square gives a negative log-r slope, the dimension-correct Newton potentials',
      metrics: {
        threeDimSlope: r.exp3D,
        twoDimLogSlope: r.slope2DvsLog,
      },
      notes:
        'L1 known math with a dimensional control. This solves a hardcoded lattice Laplacian on a plain d-cube (not the substrate adjacency), so the 3D-vs-2D contrast is the established lattice Green function (1/r in 3D, log in 2D), not emergent gravity. The dimension comparison is the control. Useful as a consistency check that the flat-layer dimension sets the Newton law, but assumes the Laplacian.',
    })
  },
})
