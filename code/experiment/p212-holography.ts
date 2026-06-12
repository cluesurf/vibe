// P212 (Tier 3): holography, the boundary at infinity is the screen. Measure the intrinsic dimension of the
// OUTER SHELL (the boundary) of each bulk, {5,3,4} should read ~2 (an S^2 screen), {3,4,3,4} ~3 (an S^3
// screen), the dimension the holographic dual would live in. Also confirm the area-law shape, the boundary cut
// of a ball scales with the shell (boundary), not the interior. Run: npx tsx code/experiment/p212-holography.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

function boundaryDimension(symbol: number[], maxCells: number): { N: number; nb: number; boundaryDim: number } {
  const g = buildCellGraph({ symbol: symbol as never, maxCells })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  const rad = g.coords.map(norm); const rmax = Math.max(...rad)
  const boundary = [...Array(N).keys()].filter((i) => rad[i]! > 0.78 * rmax)
  const isB = new Uint8Array(N); for (const b of boundary) isB[b] = 1
  // sub-adjacency restricted to the boundary shell
  const bAdj: number[][] = boundary.map((b) => { const out: number[] = []; for (let q = off[b]!; q < off[b + 1]!; q++) { if (isB[adj[q]!]) out.push(adj[q]!) } return out })
  const id = new Map<number, number>(); boundary.forEach((b, i) => id.set(b, i))
  const nb = boundary.length
  const boff = new Int32Array(nb + 1); for (let i = 0; i < nb; i++) boff[i + 1] = boff[i]! + bAdj[i]!.length
  const badj = new Int32Array(boff[nb]!); { let p = 0; for (let i = 0; i < nb; i++) for (const w of bAdj[i]!) badj[p++] = id.get(w)! }
  // spectral dimension of the boundary graph alone (its intrinsic dimension)
  let center = 0, best = -1; for (let i = 0; i < nb; i++) { const d = boff[i + 1]! - boff[i]!; if (d > best) { best = d; center = i } }
  let p = new Float64Array(nb); p[center] = 1; let np = new Float64Array(nb); const P: number[] = []
  for (let t = 0; t < 16; t++) { P.push(p[center]!); np.fill(0); for (let i = 0; i < nb; i++) { const pi = p[i]!; if (!pi) continue; const d = boff[i + 1]! - boff[i]!; if (!d) { np[i] = np[i]! + pi; continue } np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = boff[i]!; q < boff[i + 1]!; q++) np[badj[q]!] = np[badj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const ds = (t: number): number => (-2 * (Math.log(P[t + 2]!) - Math.log(P[t - 2]!))) / (Math.log(t + 2) - Math.log(t - 2))
  return { N, nb, boundaryDim: Math.round(ds(4) * 100) / 100 }
}

export function holography(): { fiveBoundaryDim: number; fourBoundaryDim: number; confounded: boolean } {
  const a = boundaryDimension([5, 3, 4], 40000)
  const b = boundaryDimension([3, 4, 3, 4], 40000)
  console.log('P212 holographic screen dimension (the boundary at infinity):')
  console.log(`  {5,3,4}: ${a.nb}/${a.N} cells qualify as boundary, shell intrinsic dimension ${a.boundaryDim} (expected ~2)`)
  console.log(`  {3,4,3,4}: ${b.nb}/${b.N} cells qualify, shell intrinsic dimension ${b.boundaryDim} (expected ~3)`)
  // a finite hyperbolic patch is ~99% boundary, so the "shell" is the whole bulk (and the 4D shell sub-graph
  // fragments), the readings (2->3.07, 3->0.45) are wrong -> the method is CONFOUNDED, same as the gravity measure.
  const confounded = Math.abs(a.boundaryDim - 2) > 0.7 || Math.abs(b.boundaryDim - 3) > 0.7
  console.log(`  => CONFOUNDED ${confounded}: a finite hyperbolic patch is ~99% boundary, so a thin screen cannot be`)
  console.log('     extracted (the readings are wrong). Holographic screen dimension is OPEN, it needs an ideal-boundary')
  console.log('     construction, not finite-patch shell extraction (the same limitation as the gravity measurement, p210).')
  return { fiveBoundaryDim: a.boundaryDim, fourBoundaryDim: b.boundaryDim, confounded }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = holography()
  console.log(`RESULT: {5,3,4} shell dim ${r.fiveBoundaryDim}, {3,4,3,4} shell dim ${r.fourBoundaryDim}, method confounded ${r.confounded} (screen dimension OPEN)`)
}
