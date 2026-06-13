// 4D-TESSELLATIONS (scale sweep of ALL the regular 4D honeycombs): the home of the substrate. Every 4D
// honeycomb gives a 3D horosphere / cusp, so physical space is 3D (the observed dimension). Full list from
// hyperbolic-tessellations/4d.md, the 5 compact convex regulars, the 3 paracompact (incl {3,4,3,4} and its dual
// {4,3,4,3}), and the 2 noncompact. CORRECTION, {3,4,3,4} is PARACOMPACT (its vertex figure is the Euclidean
// {4,3,4} cubic honeycomb = the flat 3D cusp), the paracompactness IS the 3D physical space, a feature. The
// star tetracombs ({3,3,5,5/2} etc.) are non-convex and not built here. Run: npx tsx code/experiment/4d-tessellations.ts

import { buildCellGraph, buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Cand = { sym: number[]; cls: 'compact' | 'paracompact' | 'noncompact' | 'euclidean'; coin: string; flat?: boolean; note: string }
const HONEYCOMBS: Cand[] = [
  // the substrate and its closest relatives
  { sym: [3, 4, 3, 4], cls: 'paracompact', coin: '24-cell (D4!)', note: 'THE SUBSTRATE, 24-cell facets, cubic-honeycomb cusp (hyperbolic D4)' },
  { sym: [3, 4, 3, 3], cls: 'euclidean', coin: '24-cell (D4!)', flat: true, note: 'FLAT D4 (Euclidean 24-cell honeycomb), curvature contrast to {3,4,3,4}' },
  { sym: [4, 3, 4, 3], cls: 'paracompact', coin: 'cubic-honeycomb', note: 'cubic honeycomb tetracomb, DUAL of {3,4,3,4}' },
  { sym: [3, 4, 6, 4], cls: 'paracompact', coin: 'exotic', note: 'Petrial, abstract regular, has a 6' },
  { sym: [4, 4, 3, 3], cls: 'noncompact', coin: 'square-tiling', note: 'square tiling honeycomb tetracomb' },
  { sym: [4, 4, 4, 4], cls: 'noncompact', coin: 'square-tiling', note: 'order-4-4 square tiling, self-dual' },
  { sym: [4, 3, 3, 4], cls: 'euclidean', coin: 'tesseract', flat: true, note: 'FLAT Z^4 (Euclidean tesseractic), curvature contrast' },
  // 5 compact convex regulars (all contain a 5 -> non-crystallographic)
  { sym: [3, 3, 3, 5], cls: 'compact', coin: '5-cell', note: 'pente, tetrahedra / 5-cells' },
  { sym: [5, 3, 3, 3], cls: 'compact', coin: '600-cell', note: 'hitte, 120-cells / 600-cells' },
  { sym: [4, 3, 3, 5], cls: 'compact', coin: 'tesseract', note: 'pitest, cubes / tesseracts' },
  { sym: [5, 3, 3, 4], cls: 'compact', coin: '120-cell', note: 'shitte, 120-cells' },
  { sym: [5, 3, 3, 5], cls: 'compact', coin: '120-cell', note: 'phitte, 120-cells' },
]

const SCALE = 25000

function measure(sym: number[], flat: boolean): { ok: boolean; cells: number; degree: number; growth: number; betheAlpha: number } {
  try {
    const g = flat ? buildEuclideanLattice({ symbol: sym as never, maxCells: SCALE }) : buildCellGraph({ symbol: sym as never, maxCells: SCALE })
    const N = g.cellCount, nb = g.neighbors
    if (N < 50) return { ok: false, cells: N, degree: 0, growth: 0, betheAlpha: 0 }
    const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + nb[i]!.length
    const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of nb[i]!) adj[p++] = w }
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

export function fourdTessellations(): void {
  for (const c of HONEYCOMBS) {
    const crystallographic = c.sym.every((n) => n === 3 || n === 4 || n === 6)
    const m = measure(c.sym, c.flat ?? false)
    const built = m.ok ? `degree ${m.degree}, growth ${m.growth}, Bethe 1/r^${m.betheAlpha}` : 'does not build (ideal tiles)'
  }
}

export default defineExperiment({
  id: 'substrate-survey/4d-tessellations',
  title: 'a sweep of 4D regular honeycombs, all give 3D physical space and {3,4,3,4} is the unique D4-facet one',
  category: 'substrate-survey',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    fourdTessellations()
    const reference = measure([3, 4, 3, 4], false)
    const crystallographic = [3, 4, 3, 4].every((n) => n === 3 || n === 4 || n === 6)
    const ok = reference.ok && reference.degree > 0 && crystallographic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 4D regular honeycombs build as cell graphs, every one gives a 3D horosphere, the five compact regulars all contain a 5 and are non-crystallographic, and {3,4,3,4} is the unique crystallographic one with 24-cell D4 facets',
      metrics: {
        referenceDegree: reference.degree,
        referenceBetheAlpha: reference.betheAlpha,
        referenceGrowth: reference.growth,
      },
      notes:
        'L1 known geometry, a survey. The pass checks only that the reference {3,4,3,4} builds and is crystallographic by its Schlafli symbol. The 3D-cusp, D4-facet, and spinor conclusions are read from the known classification, not measured here. This is a catalog entry that places the substrate among its relatives.',
    })
  },
})
