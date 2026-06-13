// P246 (GM1-GM6): {3,4,3,4} is FLAT, the honest cost of choosing spin over hyperbolic geometry. On a D4 ball:
// GM2/GM3 ball volume grows POLYNOMIALLY V(r) ~ r^4 (dimension 4, NOT exponential like {5,3,4}), GM6 graph
// distance tracks the Euclidean metric linearly, GM1 Ollivier-Ricci curvature is ~0 (flat). GM4/GM5 follow,
// polynomial growth means no fractal boundary and no holographic 1/r, the price paid for spin.
// Run: npx tsx code/experiment/p246-gm-geometry-3434.ts

import { pathToFileURL } from 'node:url'

function d4Roots(): number[][] {
  const r: number[][] = []
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = [0, 0, 0, 0]; v[i] = si; v[j] = sj; r.push(v) }
  return r
}
const key = (p: number[]): string => p.join(',')
const add = (p: number[], r: number[]): number[] => [p[0]! + r[0]!, p[1]! + r[1]!, p[2]! + r[2]!, p[3]! + r[3]!]
const euc = (p: number[]): number => Math.hypot(p[0]!, p[1]!, p[2]!, p[3]!)

// BFS ball: graph distance from origin out to radius R
function ball(R: number): { dist: Map<string, number>; cells: number[][]; roots: number[][] } {
  const roots = d4Roots()
  const dist = new Map<string, number>([['0,0,0,0', 0]])
  const cells: number[][] = [[0, 0, 0, 0]]
  let frontier = [[0, 0, 0, 0]]
  for (let r = 1; r <= R; r++) {
    const next: number[][] = []
    for (const p of frontier) for (const root of roots) { const q = add(p, root); const k = key(q); if (!dist.has(k)) { dist.set(k, r); cells.push(q); next.push(q) } }
    frontier = next
  }
  return { dist, cells, roots }
}

// graph distance between two cells via local BFS (both near the origin edge)
function graphDist(a: number[], b: number[], roots: number[][], cap: number): number {
  if (key(a) === key(b)) return 0
  const seen = new Set([key(a)]); let frontier = [a]
  for (let r = 1; r <= cap; r++) { const next: number[][] = []; for (const p of frontier) for (const root of roots) { const q = add(p, root); const k = key(q); if (k === key(b)) return r; if (!seen.has(k)) { seen.add(k); next.push(q) } } frontier = next }
  return cap + 1
}

// Sinkhorn W1 between two uniform distributions over equal-size supports with cost matrix C
function sinkhornW1(C: number[][], eps: number, iters: number): number {
  const n = C.length, m = C[0]!.length
  const K = C.map((row) => row.map((c) => Math.exp(-c / eps)))
  let u = new Array(n).fill(1), v = new Array(m).fill(1)
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < m; j++) s += K[i]![j]! * v[j]!; u[i] = (1 / n) / (s || 1e-300) }
    for (let j = 0; j < m; j++) { let s = 0; for (let i = 0; i < n; i++) s += K[i]![j]! * u[i]!; v[j] = (1 / m) / (s || 1e-300) }
  }
  let w = 0; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) w += u[i]! * K[i]![j]! * v[j]! * C[i]![j]!
  return w
}

export function gmGeometry(): { exponent: number; dimensionOk: boolean; subexponential: boolean; metricLinear: boolean; ricciFlat: boolean } {
  const { dist, roots } = ball(9)
  // GM2/GM3: V(r) volume growth
  const Vr: number[] = []
  for (let r = 0; r <= 9; r++) { let c = 0; for (const d of dist.values()) if (d <= r) c++; Vr.push(c) }
  // fit log V ~ dim * log r over r = 3..9
  let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0
  for (let r = 3; r <= 9; r++) { const x = Math.log(r), y = Math.log(Vr[r]!); sx += x; sy += y; sxx += x * x; sxy += x * y; n++ }
  const exponent = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const dimensionOk = Math.abs(exponent - 4) < 0.5
  const ratios = [6, 7, 8, 9].map((r) => Vr[r]! / Vr[r - 1]!)
  const subexponential = ratios.every((q) => q < 2.2) && ratios[3]! < ratios[0]! + 0.01 // ratio decreasing toward 1, not constant > 1
  console.log(`P246 (GM2/GM3) D4 ball volume V(r): ${Vr.slice(0, 10).join(', ')}`)
  console.log(`  log-log growth exponent ${exponent.toFixed(2)} (expect 4, dimension 4): ${dimensionOk}; shell ratios ${ratios.map((q) => q.toFixed(2)).join(', ')} decreasing toward 1 => POLYNOMIAL not exponential: ${subexponential}`)

  // GM6: graph distance vs Euclidean, linear correlation
  const samples = [...dist.entries()].filter(([, d]) => d >= 1 && d <= 6).slice(0, 400)
  let cx = 0, cy = 0, cxx = 0, cyy = 0, cxy = 0, cn = 0
  for (const [k, d] of samples) { const e = euc(k.split(',').map(Number)); cx += d; cy += e; cxx += d * d; cyy += e * e; cxy += d * e; cn++ }
  const corr = (cn * cxy - cx * cy) / Math.sqrt((cn * cxx - cx * cx) * (cn * cyy - cy * cy))
  const metricLinear = corr > 0.9 // D4 word metric is flat but anisotropic, strong linear correlation with Euclidean
  console.log(`P246 (GM6) graph-distance vs Euclidean correlation ${corr.toFixed(4)} (strong linear correlation, the flat D4 word metric is recovered up to lattice anisotropy): ${metricLinear}`)

  // GM1: Ollivier-Ricci of an edge (origin, root0), Sinkhorn W1 over the two 24-neighbour distributions
  const x = [0, 0, 0, 0], y = roots[0]!
  const nx = roots.map((r) => add(x, r)), ny = roots.map((r) => add(y, r))
  const C = nx.map((a) => ny.map((b) => graphDist(a, b, roots, 6)))
  const w1 = sinkhornW1(C, 0.05, 400)
  const ricci = 1 - w1 / 1 // d(x,y) = 1
  const ricciFlat = Math.abs(ricci) < 0.12
  console.log(`P246 (GM1) Ollivier-Ricci of an edge: W1 ${w1.toFixed(3)}, kappa ${ricci.toFixed(3)} (~0 = FLAT, contrast {5,3,4} negative): ${ricciFlat}`)
  console.log(`P246 (GM4/GM5) polynomial growth => no fractal ideal boundary, no holographic 1/r. The honest cost of spin: {3,4,3,4} is flat.\n`)

  return { exponent, dimensionOk, subexponential, metricLinear, ricciFlat }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gmGeometry()
  const pass = r.dimensionOk && r.subexponential && r.metricLinear && r.ricciFlat
  console.log(`SOLVED GM: dim-4 ${r.dimensionOk}, polynomial ${r.subexponential}, metric ${r.metricLinear}, flat-curvature ${r.ricciFlat} => ${pass ? 'PASSED' : 'FAILED'}`)
}
