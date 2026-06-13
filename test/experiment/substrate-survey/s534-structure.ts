// S534-STRUCTURE ({5,3,4} suite): the structural tests, geometry, spin, gauge, dimension. This is where {5,3,4}
// DIFFERS from {3,4,3,4}. Verdicts, bulk is 3D hyperbolic (degree 12), the flat layer (horosphere) is 2D, the
// 12 directions are ICOSAHEDRAL (non-crystallographic) so NO spinor and NO root-system gauge. So physical space
// would be 2D with no fundamental spin or gauge group. Run: npx tsx code/experiment/s534-structure.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const phi = (1 + Math.sqrt(5)) / 2

export function s534Structure(): { degree: number; specDim: number; crystallographic: boolean; hasSpinor: boolean } {
  // bulk geometry
  const g = buildCellGraph({ symbol: [5, 3, 4] as never, maxCells: 16000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
  const degree = best
  let p = new Float64Array(N); p[center] = 1; let np = new Float64Array(N); const ret: number[] = []
  for (let t = 0; t < 14; t++) { ret.push(p[center]!); np.fill(0); for (let i = 0; i < N; i++) { const pi = p[i]!; if (!pi) continue; const d = off[i + 1]! - off[i]!; np[i] = np[i]! + 0.5 * pi; const sh = (0.5 * pi) / d; for (let q = off[i]!; q < off[i + 1]!; q++) np[adj[q]!] = np[adj[q]!]! + sh } const tmp = p; p = np; np = tmp }
  const specDim = Math.round((-2 * (Math.log(ret[6]!) - Math.log(ret[3]!))) / (Math.log(6) - Math.log(3)) * 100) / 100
  // the 12 directions = icosahedron vertices, check the CRYSTALLOGRAPHIC (root-system) condition 2(a.b)/(b.b) in Z
  const verts: number[][] = []
  for (const a of [1, -1]) for (const b of [phi, -phi]) verts.push([0, a, b], [a, b, 0], [b, 0, a])
  const dot = (u: number[], v: number[]): number => u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!
  let crystallographic = true; let exampleNonInt = 0
  for (const a of verts) for (const b of verts) { const r = (2 * dot(a, b)) / dot(b, b); if (Math.abs(r - Math.round(r)) > 1e-6) { crystallographic = false; exampleNonInt = Math.round(r * 1000) / 1000 } }
  const hasSpinor = false // a permutation rep of the icosahedral rotation group A5 = 1+3+3'+5, all integer spin (p190)
  console.log('S534-STRUCTURE ({5,3,4}):')
  console.log(`  bulk, ${N} cells, degree ${degree} (dodecahedral, 12 faces), spectral dim ${specDim} (3D hyperbolic, compact, no cusp)`)
  console.log(`  flat layer = a 2D HOROSPHERE (intrinsically Euclidean 2D), so physical space would be 2D`)
  console.log(`  the 12 directions are ICOSAHEDRAL, crystallographic (a root system)? ${crystallographic} (a non-integer 2(a.b)/(b.b) = ${exampleNonInt} appears, the golden ratio -> NON-crystallographic)`)
  console.log(`  spinor present? ${hasSpinor} (the 12-direction perm rep of A5 = 1 + 3 + 3' + 5, all integer spin, p190)`)
  console.log('')
  console.log('Verdicts:')
  console.log(' - geometry, POSITIVE (3D hyperbolic bulk, 2D horosphere, degree 12), well-defined and buildable.')
  console.log(' - SPIN, NEGATIVE, no spinor (icosahedral, not the D4 24-cell), so no fundamental fermions from the geometry.')
  console.log(' - GAUGE, NEGATIVE, the 12 directions are non-crystallographic (icosahedral, golden ratio), NOT a root')
  console.log('   system, so no so(N) gauge group, no GUT, no sin^2(theta_W), no generations from triality.')
  console.log(' - DIMENSION, the flat layer is 2D, so physical space is 2D (vs 3D for {3,4,3,4}).')
  return { degree, specDim, crystallographic, hasSpinor }
}

export default defineExperiment({
  id: 'substrate-survey/s534-structure',
  title: 'the 12 icosahedral directions of {5,3,4} are non-crystallographic (measured), so no root-system gauge',
  category: 'substrate-survey',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s534Structure()
    const ok = r.degree === 12 && r.specDim > 0 && !r.crystallographic && !r.hasSpinor
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,4} bulk has degree 12 and its 12 icosahedral directions fail the crystallographic integer test, so they form no root system and carry no gauge group',
      metrics: {
        degree: r.degree,
        specDim: r.specDim,
        crystallographic: r.crystallographic ? 1 : 0,
        hasSpinor: r.hasSpinor ? 1 : 0,
      },
      notes:
        'L1 known math, the non-crystallographic verdict IS measured by the 2(a.b)/(b.b) integer test on the icosahedron vertices (a golden-ratio non-integer appears). The hasSpinor flag is hard-set to false from the known A5 = 1+3+3-prime+5 decomposition, not measured here. The 2D horosphere dimension is stated, not measured.',
    })
  },
})
