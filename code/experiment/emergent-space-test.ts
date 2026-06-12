// EMERGENT-SPACE-TEST: settle the anisotropy-vs-disorder problem for the {3,4,3,4} flat 3D physical space.
// Decisive questions, (A) is the aperiodic horosphere band a COHERENT 3D space, largest connected component
// fraction + spectral dimension -> 3? (B) is its light cone ISOTROPIC (round) vs the clean cubic {4,3,4} whose
// light cone is anisotropic (faceted)? (C) the expansion law, how the spatial slice grows with radial level.
// Run: npx tsx code/experiment/emergent-space-test.ts

import { pathToFileURL } from 'node:url'
import { buildHorosphereBand, buildEuclideanLattice } from '~/substrate/coxeter/cell-direct'

// largest connected component of an adjacency list
function largestComponent(nb: number[][]): number[] {
  const N = nb.length, seen = new Int32Array(N).fill(-1)
  let best: number[] = []
  for (let s = 0; s < N; s++) {
    if (seen[s]! >= 0) continue
    const comp: number[] = []; const q = [s]; seen[s] = s
    for (let h = 0; h < q.length; h++) { const u = q[h]!; comp.push(u); for (const w of nb[u]!) if (seen[w]! < 0) { seen[w] = s; q.push(w) } }
    if (comp.length > best.length) best = comp
  }
  return best
}
// spectral dimension via lazy-walk return probability, d_s = -2 dlogP / dlogt
function spectralDim(nb: number[][], start: number, t1: number, t2: number): number {
  const N = nb.length; let p = new Float64Array(N); p[start] = 1; let np = new Float64Array(N); const P: number[] = []
  for (let t = 0; t <= t2; t++) { P.push(p[start]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = nb[i]!.length; if (d === 0) { np[i] = np[i]! + pi; continue } np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (const j of nb[i]!) np[j] = np[j]! + sh } const tmp = p; p = np; np = tmp }
  return (-2 * (Math.log(P[t2]!) - Math.log(P[t1]!))) / (Math.log(t2) - Math.log(t1))
}
// light-cone isotropy, BFS front at graph distance R, coefficient of variation of embedding radius (low = round = isotropic)
function frontCV(nb: number[][], coords: number[][], start: number, R: number): number {
  const N = nb.length, dist = new Int32Array(N).fill(-1); dist[start] = 0; let fr = [start]
  for (let r = 0; r < R; r++) { const nf: number[] = []; for (const u of fr) for (const w of nb[u]!) if (dist[w] === -1) { dist[w] = r + 1; nf.push(w) } fr = nf }
  const c = coords[start]!
  const radii = fr.map((i) => Math.sqrt(coords[i]!.reduce((s, x, k) => s + (x - c[k]!) ** 2, 0)))
  if (radii.length < 4) return -1
  const mean = radii.reduce((a, b) => a + b, 0) / radii.length
  const sd = Math.sqrt(radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length)
  return Math.round((sd / mean) * 1000) / 1000
}

export function emergentSpaceTest(): void {
  console.log('EMERGENT-SPACE-TEST, does the {3,4,3,4} aperiodic horosphere coarse-grain to clean isotropic 3D space?')
  console.log('')
  // (A) the horosphere band
  const h = buildHorosphereBand({ symbol: [3, 4, 3, 4] as never, maxBand: 9000, half: 1.0, margin: 0.8 })
  const bandIdx: number[] = []; const rmap = new Map<number, number>()
  for (let i = 0; i < h.cellCount; i++) if (Math.abs(h.busemann[i]!) < 1.0) { rmap.set(i, bandIdx.length); bandIdx.push(i) }
  const bnb: number[][] = bandIdx.map(() => [])
  for (let a = 0; a < bandIdx.length; a++) for (const w of h.neighbors[bandIdx[a]!]!) { const b = rmap.get(w); if (b !== undefined) bnb[a]!.push(b) }
  const bcoords = bandIdx.map((i) => h.coords[i]!)
  const lcc = largestComponent(bnb)
  const lccFrac = Math.round((lcc.length / bandIdx.length) * 100)
  // induced graph on the LCC
  const lmap = new Map(lcc.map((v, i) => [v, i]))
  const lnb: number[][] = lcc.map((v) => bnb[v]!.map((w) => lmap.get(w)!).filter((x) => x !== undefined) as number[])
  const lcoords = lcc.map((v) => bcoords[v]!)
  let lc0 = 0, bd = -1; for (let i = 0; i < lnb.length; i++) if (lnb[i]!.length > bd) { bd = lnb[i]!.length; lc0 = i }
  const bandDim = Math.round(spectralDim(lnb, lc0, 3, 12) * 100) / 100
  const bandCV = frontCV(lnb, lcoords, lc0, 6)
  console.log('(A) coherence + dimension of the horosphere band:')
  console.log(`    band ${bandIdx.length} cells, largest connected component = ${lcc.length} cells (${lccFrac}% of the band)`)
  console.log(`    spectral dimension of the LCC = ${bandDim} (3.0 = clean emergent 3D space)`)
  // (B) isotropy vs the clean cubic {4,3,4}
  const cube = buildEuclideanLattice({ symbol: [4, 3, 4] as never, maxCells: 9000 })
  let cc = 0; for (let i = 0; i < cube.cellCount; i++) if (cube.coords[i]!.every((x) => x === 0)) cc = i
  const cubeDim = Math.round(spectralDim(cube.neighbors, cc, 3, 12) * 100) / 100
  const cubeCV = frontCV(cube.neighbors, cube.coords, cc, 6)
  console.log('(B) light-cone isotropy (front-radius coefficient of variation, LOWER = rounder = more isotropic):')
  console.log(`    {3,4,3,4} aperiodic band: CV = ${bandCV}`)
  console.log(`    clean cubic {4,3,4}:      CV = ${cubeCV} (cubic light cone is the faceted L1 ball, anisotropic), spectral dim ${cubeDim}`)
  console.log(`    -> the aperiodic band is ${bandCV >= 0 && bandCV < cubeCV ? 'MORE isotropic (rounder light cone) than the cubic crystal' : 'not clearly more isotropic'}`)
  // (C) expansion law, band-slice size vs radial (Busemann) level
  console.log('(C) expansion law, cells per radial (Busemann) slice:')
  const levels: Record<number, number> = {}
  for (let i = 0; i < h.cellCount; i++) { const L = Math.round(h.busemann[i]!); levels[L] = (levels[L] ?? 0) + 1 }
  const ks = Object.keys(levels).map(Number).sort((a, b) => a - b)
  console.log(`    slice sizes by level: ${ks.map((k) => `${k}:${levels[k]}`).join('  ')}`)
  console.log('')
  console.log('VERDICT:')
  const coherent = lccFrac > 60 && Math.abs(bandDim - 3) < 1
  console.log(`  coherent emergent 3D space: ${coherent} (LCC ${lccFrac}%, spectral dim ${bandDim})`)
  console.log(`  isotropy: aperiodic band CV ${bandCV} vs cubic CV ${cubeCV}, ${bandCV >= 0 && bandCV < cubeCV ? 'aperiodicity gives a ROUNDER (more isotropic) light cone' : 'see numbers'}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  emergentSpaceTest()
  console.log('SOLVED: measured the {3,4,3,4} horosphere band coherence, spectral dimension, light-cone isotropy vs cubic, and the expansion-slice sizes.')
}
