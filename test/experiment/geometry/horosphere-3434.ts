// P196: extract the HOROSPHERE from the {3,4,3,4} 4D bulk (the same buildHorosphereBand used for {5,3,4}) and
// measure it. The generic band is a thin slab reading ~2.5D (the clean flat-3D {4,3,4} is the special cusp,
// not a generic horosphere). Ported from the throwaway probe.
// Run: npx tsx code/experiment/p196-horosphere-3434.ts

import { pathToFileURL } from 'node:url'
import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'

export function horosphere3434(): { cells: number; meanDegree: number; specDim16: number } {
  const slab = buildHorosphereBand({ symbol: [3, 4, 3, 4] as never, maxBand: 30000, half: 0.5, margin: 0.6 })
  const n = slab.cellCount
  let sum = 0, mx = 0
  for (let i = 0; i < n; i++) { const d = slab.neighbors[i]!.length; sum += d; if (d > mx) mx = d }
  const off = new Int32Array(n + 1); for (let i = 0; i < n; i++) off[i + 1] = off[i]! + slab.neighbors[i]!.length
  const adj = new Int32Array(off[n]!); { let p = 0; for (let i = 0; i < n; i++) for (const w of slab.neighbors[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < n; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  let p = new Float64Array(n); p[center] = 1; let np = new Float64Array(n); const P: number[] = []
  for (let t = 0; t < 36; t++) {
    P.push(p[center]!); np.fill(0)
    for (let i = 0; i < n; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; const sh = (0.5 * pi) / d; np[i] = np[i]! + 0.5 * pi; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh }
    const tmp = p; p = np; np = tmp
  }
  const ds = (t: number): number => (-2 * (Math.log(P[t + 2]!) - Math.log(P[t - 2]!))) / (Math.log(t + 2) - Math.log(t - 2))
  const meanDegree = Math.round((sum / n) * 10) / 10
  console.log(`P196 {3,4,3,4} horosphere band: ${n} cells, band ${slab.bandCount}, mean degree ${meanDegree}, max ${mx}`)
  console.log(`  spectral dim t4=${ds(4).toFixed(2)} t8=${ds(8).toFixed(2)} t16=${ds(16).toFixed(2)} (flat-3D ~3)`)
  console.log('  => the GENERIC horosphere band is a thin slab reading ~2.5D; the clean flat-3D {4,3,4} is the')
  console.log('     special CUSP, not a generic horosphere (same as {5,3,4}, whose generic horosphere is aperiodic-2D).')
  return { cells: n, meanDegree, specDim16: ds(16) }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = horosphere3434()
  console.log(`SOLVED: ${r.cells} band cells, mean degree ${r.meanDegree}, spectral dim ~${r.specDim16.toFixed(1)}`)
}
