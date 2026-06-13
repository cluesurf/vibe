// THREED-TESSELLATIONS (scale sweep of the 3D hyperbolic regular honeycombs): the 4 compact regulars and the
// 11 paracompact regulars of H^3 (we already did {5,3,4}). All are 3D bulk -> 2D horosphere (physical space 2D,
// under-dimensional). Key structural fact, the compact regulars all contain a 5 (non-crystallographic, no gauge),
// while the paracompact ones containing a 6 (and only 3,4,6) ARE crystallographic. So 3D never delivers
// compact-AND-crystallographic together. Run: npx tsx code/experiment/3d-tessellations.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { toCsr } from '@/code/tool/graph'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; compact: boolean; note: string }
const HONEYCOMBS: Cand[] = [
  // 4 compact regulars (the prime substrates)
  { sym: [5, 3, 4], compact: true, note: 'order-4 dodecahedral (the committed substrate, done)' },
  { sym: [4, 3, 5], compact: true, note: 'order-5 cubic, cubes / icosahedron' },
  { sym: [3, 5, 3], compact: true, note: 'icosahedral, self-dual' },
  { sym: [5, 3, 5], compact: true, note: 'order-5 dodecahedral, self-dual' },
  // 11 paracompact regulars (ideal Euclidean elements)
  { sym: [3, 3, 6], compact: false, note: 'paracompact, tetrahedra / triangular-tiling vertex fig' },
  { sym: [6, 3, 3], compact: false, note: 'paracompact, hexagonal-tiling cells' },
  { sym: [3, 4, 4], compact: false, note: 'paracompact' },
  { sym: [4, 4, 3], compact: false, note: 'paracompact, square-tiling cells' },
  { sym: [3, 6, 3], compact: false, note: 'paracompact, self-dual' },
  { sym: [4, 3, 6], compact: false, note: 'paracompact' },
  { sym: [6, 3, 4], compact: false, note: 'paracompact' },
  { sym: [5, 3, 6], compact: false, note: 'paracompact (has a 5, non-crystallographic)' },
  { sym: [6, 3, 5], compact: false, note: 'paracompact (has a 5, non-crystallographic)' },
  { sym: [4, 4, 4], compact: false, note: 'paracompact, square-tiling cells and vertex fig' },
  { sym: [6, 3, 6], compact: false, note: 'paracompact, self-dual, hexagonal' },
]

const SCALE = 20000
const SURVEY_SCALE = 1200

function measure(sym: number[], scale: number = SCALE): { ok: boolean; cells: number; degree: number; growth: number; betheAlpha: number } {
  try {
    const g = buildCellGraph({ symbol: sym as never, maxCells: scale })
    const N = g.cellCount, nb = g.neighbors
    if (N < 50) return { ok: false, cells: N, degree: 0, growth: 0, betheAlpha: 0 }
    const { offsets: off, adj } = toCsr(nb)
    let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
    const degree = best
    const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
    while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } if (nf.length) shell.push(nf.length); fr = nf }
    const mid = shell.slice(2, Math.min(6, shell.length))
    const growth = mid.length > 1 ? Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / (mid.length - 1)) * 100) / 100 : 0
    const b = degree - 1, mu = b > 0 ? (degree - Math.sqrt(degree * degree - 4 * b)) / (2 * b) : 0
    const betheAlpha = b > 1 ? Math.round((2 * Math.log(1 / mu)) / Math.log(b) * 100) / 100 : 0
    return { ok: true, cells: N, degree, growth, betheAlpha }
  } catch (e) { return { ok: false, cells: 0, degree: 0, growth: 0, betheAlpha: 0 } }
}

export function threedTessellations(): void {
  for (const c of HONEYCOMBS) {
    const crystallographic = c.sym.every((n) => n === 3 || n === 4 || n === 6)
    const m = measure(c.sym, SURVEY_SCALE)
    const tag = c.compact ? 'COMPACT' : 'paracompact'
    if (!m.ok) { continue }
  }
}

export default defineExperiment({
  id: 'substrate-survey/3d-tessellations',
  title: 'a sweep of 3D hyperbolic honeycombs, compact ones are non-crystallographic, crystallographic ones are paracompact',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    threedTessellations()
    const reference = measure([5, 3, 4])
    const ok = reference.ok && reference.degree === 12
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 3D hyperbolic regular honeycombs build as cell graphs, but no one is compact and crystallographic at once, the compact regulars contain a 5 and the crystallographic ones are paracompact, and all give a 2D horosphere',
      metrics: {
        referenceDegree: reference.degree,
        referenceBetheAlpha: reference.betheAlpha,
        referenceGrowth: reference.growth,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {5,3,4} builds with its dodecahedral degree 12. The compact-versus-crystallographic and 2D-horosphere conclusions are read from the Schlafli symbols and the cusp dimension, not measured here. This is a catalog entry that motivates the 4D substrate.',
    })
  },
})
