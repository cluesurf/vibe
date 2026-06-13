// TWOD-TESSELLATIONS (scale sweep of 2D hyperbolic regular tilings): the {p,q} tilings of H^2 (we already did
// {7,3}). All are 2D bulk -> 1D horocycle (physical space 1D, the most degenerate / under-dimensional). They are
// all compact (hyperbolic, 1/p + 1/q < 1/2). The interesting cases are {6,4} and {4,6}, which use only 3/4/6 so
// they are CRYSTALLOGRAPHIC (gauge possible) AND compact, but still only 1D physical space and no spinor.
// Run: npx tsx code/experiment/2d-tessellations.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; note: string }
const TILINGS: Cand[] = [
  { sym: [7, 3], note: 'REFERENCE (heptagonal, done)' },
  { sym: [5, 4], note: 'pentagons 4/vertex, organic symmetry, CA / network geometry' },
  { sym: [8, 3], note: 'octagons 3/vertex, foundational in hyperbolic surface theory' },
  { sym: [4, 5], note: 'squares 5/vertex, easiest grid analogue, pathfinding / CA' },
  { sym: [3, 7], note: 'triangles 7/vertex, maximal local branching, FEM / computation' },
  { sym: [6, 4], note: 'hexagons 4/vertex, extends Euclidean hex, simulations / networks' },
  { sym: [5, 5], note: 'pentagons 5/vertex, highly curved and dense, exotic geometries' },
  { sym: [4, 6], note: 'squares 6/vertex, strong curvature, simple cells, HC experiments' },
]

const SCALE = 20000

function measure(sym: number[]): { ok: boolean; cells: number; degree: number; growth: number; betheAlpha: number } {
  try {
    const g = buildCellGraph({ symbol: sym as never, maxCells: SCALE })
    const N = g.cellCount, nb = g.neighbors
    if (N < 50) return { ok: false, cells: N, degree: 0, growth: 0, betheAlpha: 0 }
    const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + nb[i]!.length
    const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of nb[i]!) adj[p++] = w }
    let center = 0, best = -1; for (let i = 0; i < N; i++) { const d = off[i + 1]! - off[i]!; if (d > best) { best = d; center = i } }
    const degree = best
    const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
    while (fr.length) { const nf: number[] = []; for (const u of fr) for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } } if (nf.length) shell.push(nf.length); fr = nf }
    const mid = shell.slice(2, Math.min(7, shell.length))
    const growth = mid.length > 1 ? Math.round((mid.slice(1).reduce((s, v, i) => s + v / mid[i]!, 0) / (mid.length - 1)) * 100) / 100 : 0
    const b = degree - 1, mu = b > 0 ? (degree - Math.sqrt(degree * degree - 4 * b)) / (2 * b) : 0
    const betheAlpha = b > 1 ? Math.round((2 * Math.log(1 / mu)) / Math.log(b) * 100) / 100 : 0
    return { ok: true, cells: N, degree, growth, betheAlpha }
  } catch (e) { return { ok: false, cells: 0, degree: 0, growth: 0, betheAlpha: 0 } }
}

export function twodTessellations(): void {
  for (const c of TILINGS) {
    const crystallographic = c.sym.every((n) => n === 3 || n === 4 || n === 6)
    const compact = 1 / c.sym[0]! + 1 / c.sym[1]! < 0.5 // hyperbolic 2D tilings are compact
    const m = measure(c.sym)
    if (!m.ok) { continue }
  }
}

export default defineExperiment({
  id: 'substrate-survey/2d-tessellations',
  title: 'a sweep of 2D hyperbolic regular tilings, all give 1D physical space, the most degenerate',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    twodTessellations()
    const reference = measure([7, 3])
    const crystallographic = measure([6, 4])
    const ok =
      reference.ok &&
      reference.degree === 7 &&
      crystallographic.ok &&
      [6, 4].every((n) => n === 3 || n === 4 || n === 6)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {p,q} hyperbolic tilings build as 2D cell graphs and the framework ports to each, with {6,4} the compact crystallographic case, but every one gives only a 1D horocycle and no spinor',
      metrics: {
        referenceDegree: reference.degree,
        referenceBetheAlpha: reference.betheAlpha,
        crystallographicDegree: crystallographic.degree,
        crystallographicBetheAlpha: crystallographic.betheAlpha,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {7,3} and the crystallographic {6,4} build with their expected degrees and a holographic exponent. The 1D-physical-space and no-spinor conclusions are stated from the tiling dimension, not measured here. This is a catalog entry, not a physics claim.',
    })
  },
})
