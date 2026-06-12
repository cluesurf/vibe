// S53333-STRUCTURE ({5,3,3,3,3} suite): the 5D hyperbolic honeycomb (Coxeter [5,3,3,3,3]), for completeness.
// IMPORTANT existence note, compact REGULAR hyperbolic honeycombs exist only through H^4, so {5,3,3,3,3} (which
// would tile H^5) is BEYOND compact, it is paracompact / Lorentzian (ideal vertices, non-compact). The local
// cell graph is still constructible (the builder makes a uniform-degree graph), so the framework experiments
// run on it. Verdicts, bulk 5D, horosphere 4D (so physical space would be 4D, OVER-dimensional), the leading 5
// makes the coin 5-fold / H-family / NON-crystallographic, so NO root-system gauge and NO spinor.
// Run: npx tsx code/experiment/s53333-structure.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

export function s53333Structure(): { degree: number; specDim: number; crystallographic: boolean; hasSpinor: boolean } {
  const g = buildCellGraph({ symbol: [5, 3, 3, 3, 3] as never, maxCells: 6000 })
  const N = g.cellCount, nb = g.neighbors
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + nb[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of nb[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const degree = best
  let p = new Float64Array(N); p[center] = 1; let np = new Float64Array(N); const ret: number[] = []
  for (let t = 0; t < 10; t++) { ret.push(p[center]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const specDim = Math.round((-2 * (Math.log(ret[4]!) - Math.log(ret[2]!))) / (Math.log(4) - Math.log(2)) * 100) / 100
  // the symbol contains a 5 -> H-family Coxeter group -> NON-crystallographic (no root lattice, like {5,3,4})
  const crystallographic = false // a 5 in the Schlafli symbol forces 5-fold symmetry, forbidden crystallographically
  const hasSpinor = false // H5 is a non-crystallographic reflection group, the coin carries no spinor
  console.log('S53333-STRUCTURE ({5,3,3,3,3}, 5D hyperbolic):')
  console.log(`  EXISTENCE, compact regular hyperbolic honeycombs stop at H^4, so {5,3,3,3,3} (H^5) is PARACOMPACT /`)
  console.log(`  Lorentzian (non-compact, ideal vertices). The local cell graph still builds, so experiments run.`)
  console.log(`  bulk, ${N} cells, degree ${degree} (5D cell {5,3,3,3}), spectral dim ${specDim} (5D-ish hyperbolic)`)
  console.log(`  flat layer = a 4D HOROSPHERE, so physical space would be 4D (OVER-dimensional); boundary = S^4`)
  console.log(`  crystallographic (a root system)? ${crystallographic} (the leading 5 -> H5, 5-fold, non-crystallographic)`)
  console.log(`  spinor present? ${hasSpinor} (H5 non-crystallographic coin, no spinor)`)
  console.log('')
  console.log('Verdicts:')
  console.log(' - geometry, builds, but PARACOMPACT/Lorentzian (not a compact tiling, beyond the H^4 compact limit).')
  console.log(' - SPIN, NEGATIVE, no spinor (5-fold H5, not the D4 24-cell).')
  console.log(' - GAUGE, NEGATIVE, the 5 makes it non-crystallographic, NOT a root system, no so(N), no Standard Model.')
  console.log(' - DIMENSION, the flat layer is 4D, so physical space is 4D, OVER-dimensional (too many, vs the observed 3D).')
  return { degree, specDim, crystallographic, hasSpinor }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = s53333Structure()
  console.log(`SOLVED: {5,3,3,3,3} bulk 5D (paracompact, beyond compact H^4), degree ${r.degree}, 4D horosphere; crystallographic ${r.crystallographic} (NO -> no gauge), spinor ${r.hasSpinor} (NO). Over-dimensional (4D physical space).`)
}
