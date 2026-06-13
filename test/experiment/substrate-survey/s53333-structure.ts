// S53333-STRUCTURE ({5,3,3,3,3} suite): the 5D hyperbolic honeycomb (Coxeter [5,3,3,3,3]), for completeness.
// IMPORTANT existence note, compact REGULAR hyperbolic honeycombs exist only through H^4, so {5,3,3,3,3} (which
// would tile H^5) is BEYOND compact, it is paracompact / Lorentzian (ideal vertices, non-compact). The local
// cell graph is still constructible (the builder makes a uniform-degree graph), so the framework experiments
// run on it. Verdicts, bulk 5D, horosphere 4D (so physical space would be 4D, OVER-dimensional), the leading 5
// makes the coin 5-fold / H-family / NON-crystallographic, so NO root-system gauge and NO spinor.
// Run: npx tsx code/experiment/s53333-structure.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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
  return { degree, specDim, crystallographic, hasSpinor }
}

export default defineExperiment({
  id: 'substrate-survey/s53333-structure',
  title: 'the {5,3,3,3,3} bulk builds as a 5D hyperbolic graph, over-dimensional with no spinor',
  category: 'substrate-survey',
  substrates: ['53333'],
  depth: 'L0',
  paper: false,
  run() {
    const r = s53333Structure()
    const ok = r.degree > 0 && r.specDim > 0 && !r.crystallographic && !r.hasSpinor
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,3,3,3} cell graph builds with a measured bulk degree and spectral dimension, and is recorded as non-crystallographic with no spinor because its leading 5 forces the H5 reflection group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L0 for the spin and gauge content, the crystallographic and hasSpinor flags are hard-set to false by hand from the known fact that a 5 in the symbol gives a non-crystallographic H5 group, they are not measured. Only the bulk degree and spectral dimension are measured. The dimension and spinor conclusions are stated, not derived here.',
    })
  },
})
