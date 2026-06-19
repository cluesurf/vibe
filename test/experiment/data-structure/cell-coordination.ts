import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cellCoordination } from '@/code/measure/tessellation-profile'

// Phase 3 (plans/data-structures-on-all-tessellations). The exact per-family fan-out, the B-tree order. The
// chamber graph gives a generic small degree (the rank), but the geometric cell coordination, the number of
// neighbours a cell actually has, is the true B-tree order. It is computable from the symbol alone as
// |W(cell)| / |W(facet)|. We verify it against the known coordinations of the compact tessellations and confirm
// it is finite for compact honeycombs and infinite for the paracompact ones (whose cells are tilings).

const EXPECTED: Array<{ symbol: number[]; coordination: number }> = [
  { symbol: [7, 3], coordination: 7 }, // heptagon, 7 edges
  { symbol: [5, 4], coordination: 5 }, // pentagon, 5 edges
  { symbol: [8, 3], coordination: 8 },
  { symbol: [5, 3, 4], coordination: 12 }, // dodecahedron, 12 faces
  { symbol: [4, 3, 5], coordination: 6 }, // cube, 6 faces
  { symbol: [3, 5, 3], coordination: 20 }, // icosahedron, 20 faces
  { symbol: [5, 3, 5], coordination: 12 },
  { symbol: [3, 4, 3, 4], coordination: 24 }, // 24-cell, 24 facets
  { symbol: [5, 3, 3, 5], coordination: 120 }, // 120-cell, 120 facets
]

export default experiment({
  id: 'data-structure/cell-coordination',
  title:
    'phase 3: the exact B-tree order (cell coordination) of every tessellation, computed from its symbol',
  category: 'data-structure',
  substrates: ['all'],
  depth: 'L1',
  paper: true,
  run() {
    let allMatch = true
    const measured: Record<string, number> = {}
    for (const e of EXPECTED) {
      const c = cellCoordination(e.symbol)
      measured[`{${e.symbol.join(',')}}`] = c
      if (c !== e.coordination) {
        allMatch = false
      }
    }
    // the paracompact pentacomb has an infinite cell, so infinite coordination (a tiling, not a finite polytope)
    const pentacombInfinite = !Number.isFinite(
      cellCoordination([3, 4, 3, 3, 4]),
    )

    const ok = allMatch && pentacombInfinite

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exact B-tree order of any tessellation is its cell coordination |W(cell)| / |W(facet)|, computed from the Schlafli symbol, matching the known values (12 for {5,3,4}, 24 for {3,4,3,4}, 120 for {5,3,3,5}), finite for compact honeycombs and infinite for paracompact ones',
      metrics: {
        verified: EXPECTED.length,
        allMatch: allMatch ? 1 : 0,
        coordination534: measured['{5,3,4}']!,
        coordination3434: measured['{3,4,3,4}']!,
        pentacombInfinite: pentacombInfinite ? 1 : 0,
      },
      // CONTROL: the chamber-graph degree is just the rank (3 to 6), the cell coordination is the true
      // geometric fan-out, so the exact B-tree order needs the cell, not the chamber, count.
      control: {
        chamberDegree534: 4,
        cellCoordination534: measured['{5,3,4}']!,
      },
      notes:
        'Phase 3 of plans/data-structures-on-all-tessellations, DONE. The cell coordination is the exact B-tree order, so the B-tree depth on a tessellation is log of the cell count to the base of its coordination. Compact honeycombs give a finite order, paracompact ones an infinite (tiling) cell.',
    })
  },
})
