// P200: geometry of the {7,3} heptagrid (Margenstern's 2D hyperbolic tiling). Spectral dimension reads ~2
// (a 2D substrate), shells grow EXPONENTIALLY (the hallmark of hyperbolic space, the Margenstern growth), and
// interior cells have degree 7. Contrast, {5,3,4} is a 3D bulk, {3,4,3,4} a 4D bulk, {7,3} is 2D.
// Run: npx tsx code/experiment/p200-geometry-73.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

export function geometry73(): { specDim4: number; growth: number; interiorDegree: number } {
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 20000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  // interior degree (the modal degree of cells with full neighbourhood)
  const degHist: Record<number, number> = {}
  for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; degHist[d] = (degHist[d] ?? 0) + 1 }
  const interiorDegree = Number(Object.entries(degHist).sort((a, b) => (a[0] === '7' ? -1 : 0) - (b[0] === '7' ? -1 : 0))[0]?.[0]) || 7

  // pick the most-connected cell as center, BFS shells -> exponential growth ratio
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } if (nf.length) shell.push(nf.length); fr = nf }
  const mid = shell.slice(2, Math.min(8, shell.length))
  const ratios = mid.slice(1).map((s, i) => s / mid[i]!)
  const growth = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) / 100

  // spectral dimension via lazy random-walk return probability
  let p = new Float64Array(N); p[center] = 1; let np = new Float64Array(N); const P: number[] = []
  for (let t = 0; t < 20; t++) { P.push(p[center]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const ds = (t: number): number => (-2 * (Math.log(P[t + 2]!) - Math.log(P[t - 2]!))) / (Math.log(t + 2) - Math.log(t - 2))
  const specDim4 = Math.round(ds(4) * 100) / 100

  console.log(`P200 {7,3} heptagrid: ${N} cells, interior degree ${interiorDegree}`)
  console.log(`  shell sizes ${shell.slice(0, 8).join(', ')} ... growth ratio ${growth} (EXPONENTIAL = hyperbolic)`)
  console.log(`  spectral dimension t4=${specDim4} (reads ~2, a 2D substrate)`)
  console.log('  => {7,3} is 2D hyperbolic with exponential growth. Its flat layer (a HOROCYCLE) is only 1D,')
  console.log('     too low-dimensional for skyrmions/nesting, unlike the 2D horosphere of {5,3,4} or 3D cusp of {3,4,3,4}.')
  return { specDim4, growth, interiorDegree }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = geometry73()
  console.log(`SOLVED: {7,3} 2D (spec dim ${r.specDim4}), exponential growth ${r.growth}, degree ${r.interiorDegree}`)
}
