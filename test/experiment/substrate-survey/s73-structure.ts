// S73-STRUCTURE ({7,3} suite, the Margenstern heptagrid): the structural tests. {7,3} is a 2D hyperbolic
// tiling (heptagons, 3 per vertex, degree 7), so the bulk is 2D hyperbolic, the flat layer (horocycle) is 1D,
// and the boundary is S^1. Verdicts, the 7 directions are 7-fold (heptagonal, NON-crystallographic) so NO
// spinor and NO root-system gauge, and physical space would be 1D. Even more degenerate than {5,3,4}.
// Run: npx tsx code/experiment/s73-structure.ts

import { dot } from '@/code/algebra/vector'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { toCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s73Structure(): { degree: number; specDim: number; crystallographic: boolean; hasSpinor: boolean } {
  const g = buildCellGraph({ symbol: [7, 3] as never, maxCells: 12000 })
  const N = g.cellCount, nb = g.neighbors
  const { offsets: off, adj } = toCsr(nb)
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const degree = best
  let p = new Float64Array(N); p[center] = 1; let np = new Float64Array(N); const ret: number[] = []
  for (let t = 0; t < 14; t++) { ret.push(p[center]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const specDim = Math.round((-2 * (Math.log(ret[6]!) - Math.log(ret[3]!))) / (Math.log(6) - Math.log(3)) * 100) / 100
  // the 7 directions = heptagon edge-normals at angles 2*pi*k/7, crystallographic (root system) check 2(a.b)/(b.b) in Z
  const dirs = Array.from({ length: 7 }, (_, k) => [Math.cos((2 * Math.PI * k) / 7), Math.sin((2 * Math.PI * k) / 7)])
  let crystallographic = true, exampleNonInt = 0
  for (const a of dirs) for (const b of dirs) { const r = (2 * dot(a, b)) / dot(b, b); if (Math.abs(r - Math.round(r)) > 1e-6) { crystallographic = false; exampleNonInt = Math.round(r * 1000) / 1000 } }
  const hasSpinor = false // 7-fold dihedral D7 is a real reflection group, the 7-direction perm rep carries no spinor
  return { degree, specDim, crystallographic, hasSpinor }
}

export default defineExperiment({
  id: 'substrate-survey/s73-structure',
  title: 'the 7 directions of {7,3} are non-crystallographic (measured), so no root-system gauge and 1D physical space',
  category: 'substrate-survey',
  substrates: ['73'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s73Structure()
    const ok = r.degree === 7 && r.specDim > 0 && !r.crystallographic && !r.hasSpinor
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {7,3} bulk has degree 7 and its 7-fold directions fail the crystallographic integer test, so they form no root system and carry no gauge group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L1 known math, the non-crystallographic verdict IS measured by the 2(a.b)/(b.b) integer test on the heptagon directions. The hasSpinor flag is hard-set to false from the known D7 reflection group, not measured. The 1D horocycle dimension is stated, not measured.',
    })
  },
})
