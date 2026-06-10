// P198: gravity via the bulk-tree propagator on {3,4,3,4}. HONEST result, a naive screened-diffusion measure
// is CONFOUNDED, the {5,3,4} calibration (which should give ~ -1 for its 2D boundary) fails too, because a
// finite hyperbolic patch is ~99 percent boundary (no real bulk to propagate through). So the exact gravity
// law is OPEN, it needs a proper common-ancestor tree-path propagator at large scale, not naive diffusion.
// Ported from the throwaway probe. Run: npx tsx code/experiment/p198-gravity-3434.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

function measure(symbol: number[], maxCells: number): { N: number; nb: number; slope: number; calibrated: boolean } {
  const g = buildCellGraph({ symbol: symbol as never, maxCells })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  const rad = g.coords.map(norm); const rmax = Math.max(...rad)
  const boundary = [...Array(N).keys()].filter((i) => rad[i]! > 0.9 * rmax)
  const isB = new Uint8Array(N); for (const b of boundary) isB[b] = 1
  const src = boundary[0]!
  const leak = 0.1; let p = new Float64Array(N); p[src] = 1; let np = new Float64Array(N)
  for (let t = 0; t < 400; t++) { np.fill(0); np[src] = 1; for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; const sh = ((1 - leak) * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const dist = new Int32Array(N).fill(-1); dist[src] = 0; let fr = [src]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (isB[w] && dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } fr = nf }
  const pts: [number, number][] = []
  for (const b of boundary) { if (b === src || dist[b]! <= 0 || p[b]! <= 1e-14) continue; pts.push([dist[b]!, p[b]!]) }
  const maxd = Math.max(...pts.map((x) => x[0]))
  const mid = pts.filter((x) => x[0] >= Math.round(maxd * 0.15) && x[0] <= Math.round(maxd * 0.6))
  let n = mid.length, sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const [r, v] of mid) { const X = Math.log(r), Y = Math.log(v); sx += X; sy += Y; sxx += X * X; sxy += X * Y }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { N, nb: boundary.length, slope, calibrated: false }
}

export function gravity3434(): { fiveSlope: number; fourSlope: number; confounded: boolean } {
  const a = measure([5, 3, 4], 45000)
  const b = measure([3, 4, 3, 4], 45000)
  console.log(`P198 gravity propagator (geodesic distance), calibration + test:`)
  console.log(`  {5,3,4} (2D boundary, should be ~ -1): slope ${a.slope.toFixed(2)}  (${a.nb}/${a.N} cells are boundary)`)
  console.log(`  {3,4,3,4} (3D boundary, should be ~ -2): slope ${b.slope.toFixed(2)}  (${b.nb}/${b.N} cells are boundary)`)
  const confounded = Math.abs(a.slope + 1) > 1.5 // calibration should be near -1; if far, method confounded
  console.log(`  => calibration ${confounded ? 'FAILS' : 'ok'} (a finite hyperbolic patch is ~99% boundary, no bulk to`)
  console.log('     propagate through). Exact gravity law OPEN, needs a proper tree-path propagator at large scale.')
  return { fiveSlope: a.slope, fourSlope: b.slope, confounded }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gravity3434()
  console.log(`RESULT: {5,3,4} ${r.fiveSlope.toFixed(1)}, {3,4,3,4} ${r.fourSlope.toFixed(1)}, method confounded ${r.confounded} (gravity law OPEN)`)
}
