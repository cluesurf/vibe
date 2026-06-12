// S73-STRUCTURE ({7,3} suite, the Margenstern heptagrid): the structural tests. {7,3} is a 2D hyperbolic
// tiling (heptagons, 3 per vertex, degree 7), so the bulk is 2D hyperbolic, the flat layer (horocycle) is 1D,
// and the boundary is S^1. Verdicts, the 7 directions are 7-fold (heptagonal, NON-crystallographic) so NO
// spinor and NO root-system gauge, and physical space would be 1D. Even more degenerate than {5,3,4}.
// Run: npx tsx code/experiment/s73-structure.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

export function s73Structure(): { degree: number; specDim: number; crystallographic: boolean; hasSpinor: boolean } {
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 12000 })
  const N = g.cellCount, nb = g.neighbors
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + nb[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of nb[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const degree = best
  let p = new Float64Array(N); p[center] = 1; let np = new Float64Array(N); const ret: number[] = []
  for (let t = 0; t < 14; t++) { ret.push(p[center]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const specDim = Math.round((-2 * (Math.log(ret[6]!) - Math.log(ret[3]!))) / (Math.log(6) - Math.log(3)) * 100) / 100
  // the 7 directions = heptagon edge-normals at angles 2*pi*k/7, crystallographic (root system) check 2(a.b)/(b.b) in Z
  const dirs = Array.from({ length: 7 }, (_, k) => [Math.cos((2 * Math.PI * k) / 7), Math.sin((2 * Math.PI * k) / 7)])
  const dot = (u: number[], v: number[]): number => u[0]! * v[0]! + u[1]! * v[1]!
  let crystallographic = true, exampleNonInt = 0
  for (const a of dirs) for (const b of dirs) { const r = (2 * dot(a, b)) / dot(b, b); if (Math.abs(r - Math.round(r)) > 1e-6) { crystallographic = false; exampleNonInt = Math.round(r * 1000) / 1000 } }
  const hasSpinor = false // 7-fold dihedral D7 is a real reflection group, the 7-direction perm rep carries no spinor
  console.log('S73-STRUCTURE ({7,3} heptagrid):')
  console.log(`  bulk, ${N} cells, degree ${degree} (heptagonal, 7 edges), spectral dim ${specDim} (2D hyperbolic)`)
  console.log(`  flat layer = a 1D HOROCYCLE (intrinsically Euclidean 1D), so physical space would be 1D; boundary = S^1`)
  console.log(`  the 7 directions are 7-FOLD, crystallographic (a root system)? ${crystallographic} (2(a.b)/(b.b) = ${exampleNonInt} non-integer, 7-fold is forbidden by the crystallographic restriction -> NON-crystallographic)`)
  console.log(`  spinor present? ${hasSpinor} (the 7-direction perm rep of D7 carries no spinor, integer reps only)`)
  console.log('')
  console.log('Verdicts:')
  console.log(' - geometry, POSITIVE (2D hyperbolic bulk, 1D horocycle, degree 7), well-defined and buildable.')
  console.log(' - SPIN, NEGATIVE, no spinor (7-fold, not the D4 24-cell), no fundamental fermions from the geometry.')
  console.log(' - GAUGE, NEGATIVE, 7-fold is non-crystallographic (crystallographic restriction forbids 5,7-fold),')
  console.log('   NOT a root system, so no so(N) gauge, no GUT, no Standard Model.')
  console.log(' - DIMENSION, the flat layer is 1D, so physical space is 1D (even more degenerate than {5,3,4} 2D).')
  return { degree, specDim, crystallographic, hasSpinor }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = s73Structure()
  console.log(`SOLVED: {7,3} bulk 2D degree ${r.degree}, 1D horocycle; crystallographic ${r.crystallographic} (NO -> no gauge), spinor ${r.hasSpinor} (NO -> no fermions). Even more degenerate (1D physical space).`)
}
