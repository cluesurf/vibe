// P210 (Tier 3): gravity via the proper COMMON-ANCESTOR tree-path propagator (the fix for the confounded p198).
// Two boundary points couple through their meeting point in the bulk radial tree, with a per-edge transmission
// factor, coupling = tau^(tree-path length). Fit coupling vs boundary (surface) distance. Calibrate on {5,3,4}
// (2D boundary, expect ~ 1/r) then read {3,4,3,4} (3D boundary, expect steeper, toward 1/r^2).
// Run: npx tsx code/experiment/p210-gravity-treepath.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

function measure(symbol: number[], maxCells: number, tau: number): { N: number; slope: number; pairs: number } {
  const g = buildCellGraph({ symbol: symbol as never, maxCells })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  const rad = g.coords.map(norm); const rmax = Math.max(...rad)
  // root = innermost cell; radial BFS tree gives depth + parent
  let root = 0, rmin = Infinity; for (let i = 0; i < N; i++) if (rad[i]! < rmin) { rmin = rad[i]!; root = i }
  const depth = new Int32Array(N).fill(-1), par = new Int32Array(N).fill(-1); depth[root] = 0; let fr = [root]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (depth[w] === -1) { depth[w] = depth[u]! + 1; par[w] = u; nf.push(w) } } fr = nf }
  const maxDepth = Math.max(...depth)
  const boundary = [...Array(N).keys()].filter((i) => depth[i]! >= maxDepth - 1)
  const isB = new Uint8Array(N); for (const b of boundary) isB[b] = 1
  // LCA depth via walking up
  const lcaDepth = (a: number, b: number): number => { let x = a, y = b; while (depth[x]! > depth[y]!) x = par[x]!; while (depth[y]! > depth[x]!) y = par[y]!; while (x !== y) { x = par[x]!; y = par[y]! } return depth[x]! }
  // source boundary cell; surface BFS distance to other boundary cells
  const src = boundary[0]!
  const sdist = new Int32Array(N).fill(-1); sdist[src] = 0; let f2 = [src]
  while (f2.length) { const nf: number[] = []; for (const u of f2) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (isB[w] && sdist[w] === -1) { sdist[w] = sdist[u]! + 1; nf.push(w) } } f2 = nf }
  const pts: [number, number][] = []
  for (const b of boundary) { if (b === src || sdist[b]! <= 0) continue; const treePath = depth[src]! + depth[b]! - 2 * lcaDepth(src, b); const coupling = Math.pow(tau, treePath); pts.push([sdist[b]!, coupling]) }
  const maxs = Math.max(...pts.map((x) => x[0]))
  const mid = pts.filter((x) => x[0] >= Math.round(maxs * 0.2) && x[0] <= Math.round(maxs * 0.7) && x[1] > 0)
  let n = mid.length, sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const [r, v] of mid) { const X = Math.log(r), Y = Math.log(v); sx += X; sy += Y; sxx += X * X; sxy += X * Y }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { N, slope, pairs: n }
}

export function gravityTreePath(): { fiveSlope: number; fourSlope: number; calibrated: boolean } {
  const a = measure([5, 3, 4], 40000, 0.5)
  const b = measure([3, 4, 3, 4], 40000, 0.5)
  console.log('P210 gravity via the common-ancestor tree-path propagator:')
  console.log(`  {5,3,4} (2D boundary, expect ~ -1): coupling ~ r^${a.slope.toFixed(2)}  (${a.pairs} pairs)`)
  console.log(`  {3,4,3,4} (3D boundary, expect steeper toward -2): coupling ~ r^${b.slope.toFixed(2)}  (${b.pairs} pairs)`)
  const calibrated = Math.abs(a.slope + 1) < 0.8
  console.log(`  => {5,3,4} calibration near -1: ${calibrated}. If calibrated, {3,4,3,4} being steeper supports`)
  console.log('     a 1/r^2 (3D-space) gravity law from the 4D bulk. Honest, the tree-path method, unlike p198 diffusion.')
  return { fiveSlope: a.slope, fourSlope: b.slope, calibrated }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gravityTreePath()
  console.log(`RESULT: {5,3,4} r^${r.fiveSlope.toFixed(1)}, {3,4,3,4} r^${r.fourSlope.toFixed(1)}, calibrated ${r.calibrated}`)
}
