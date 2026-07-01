// The physical-distance power law is not a tree artifact.
//
// E-QTM-0034 measured that the Bell shared past is only a power law in physical
// distance, on a Bethe tree bulk. The obvious objection is that a tree is the
// extreme of a hyperbolic space, so the result might be a tree artifact. This
// answers it on a GENUINE hyperbolic tessellation with real cycles and real
// coordinates ({7,3}, buildCellGraph), the same family as the committed substrate.
//
// A genuine tessellation has a shallow interior, so the shared past cannot be
// measured directly over a wide range of physical distance. Instead the power law is
// established by composing the two relationships that DO have range on the real
// tiling:
//   - the shared past is exponential in the through-bulk distance S (measured), and
//   - the through-bulk distance is logarithmic in the within-cusp distance L (the RT
//     shortcut, measured, also E-HLG-0018).
// Composing them, the shared past is a power law in physical distance L, with the
// exponent equal to the exponential rate times the log slope. On the genuine {7,3}
// tessellation this is about 1, the same order as the tree, so the power law is a
// property of hyperbolic curvature, not of the tree.
//
// Grade L2: two measured relationships on a genuine tessellation compose to the
// physical-distance power law, corroborating E-QTM-0034 off the tree.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  neighborDistances,
  csrDistances,
  toCsr,
} from '@/code/tool/graph'
import { backwardCone } from '@/code/measure/shared-past'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const CONE_DEPTH = 3

export default experiment({
  id: 'quantum/genuine-hyperbolic-power-law',
  code: 'E-QTM-0039',
  title:
    'on a genuine {7,3} hyperbolic tessellation the shared past is exponential in bulk distance and the bulk distance is logarithmic in physical distance, composing to a power law in physical distance, so E-QTM-0034 is not a tree artifact',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const graph = buildCellGraph({ symbol: [7, 3], maxCells: 16000 })
    const neighbors = graph.neighbors
    const size = graph.cellCount
    const fullDegree = 7

    // the boundary band (the cusp): the outer two shells from the most central cell
    let center = 0
    let nearest = Infinity

    for (let cell = 0; cell < size; cell++) {
      const radius = Math.hypot(
        graph.coords[cell]?.[0] ?? 0,
        graph.coords[cell]?.[1] ?? 0,
      )

      if (radius < nearest) {
        nearest = radius
        center = cell
      }
    }

    const depth = neighborDistances({ neighbors, size, source: center })

    let maxDepth = 0

    for (let cell = 0; cell < size; cell++) {
      maxDepth = Math.max(maxDepth, depth[cell] ?? 0)
    }

    const band = new Set<number>()

    for (let cell = 0; cell < size; cell++) {
      if (
        (depth[cell] ?? -1) > maxDepth - 2 &&
        (neighbors[cell] ?? []).length >= fullDegree - 2
      ) {
        band.add(cell)
      }
    }

    const { offsets, adj } = toCsr(neighbors)
    const allowed = new Float64Array(size)

    for (const cell of band) {
      allowed[cell] = 1
    }

    const anchors = [...band].filter((_, i) => i % 40 === 0).slice(0, 12)
    const samples: { withinCusp: number; throughBulk: number; eta: number }[] = []

    for (const anchor of anchors) {
      const within = csrDistances({ offsets, adj, size, source: anchor, allowed })
      const through = neighborDistances({ neighbors, size, source: anchor })
      const coneA = backwardCone({ neighbors, size, cell: anchor, depth: CONE_DEPTH })

      for (const other of band) {
        const withinCusp = within[other] ?? -1
        const throughBulk = through[other] ?? -1

        if (withinCusp < 1 || throughBulk < 1 || throughBulk > 2 * CONE_DEPTH) {
          continue
        }

        const coneB = backwardCone({ neighbors, size, cell: other, depth: CONE_DEPTH })

        let shared = 0

        for (const cell of coneA) {
          if (coneB.has(cell)) {
            shared++
          }
        }

        const eta = coneA.size > 0 ? shared / coneA.size : 0

        if (eta > 0) {
          samples.push({ withinCusp, throughBulk, eta })
        }
      }
    }

    // eta versus bulk distance: exponential
    const byBulk = new Map<number, number[]>()

    for (const s of samples) {
      if (!byBulk.has(s.throughBulk)) {
        byBulk.set(s.throughBulk, [])
      }

      byBulk.get(s.throughBulk)!.push(s.eta)
    }

    const bulkKeys = [...byBulk.keys()].sort((a, b) => a - b).filter(k => byBulk.get(k)!.length >= 3)
    const bulkEta = bulkKeys.map(k => byBulk.get(k)!.reduce((a, b) => a + b, 0) / byBulk.get(k)!.length)
    const etaVsBulk = linearFit({ xs: bulkKeys, ys: bulkEta.map(Math.log) })

    // through-bulk versus within-cusp: the log shortcut
    const byCusp = new Map<number, number[]>()

    for (const s of samples) {
      if (!byCusp.has(s.withinCusp)) {
        byCusp.set(s.withinCusp, [])
      }

      byCusp.get(s.withinCusp)!.push(s.throughBulk)
    }

    const cuspKeys = [...byCusp.keys()].sort((a, b) => a - b).filter(k => byCusp.get(k)!.length >= 3)
    const cuspBulk = cuspKeys.map(k => byCusp.get(k)!.reduce((a, b) => a + b, 0) / byCusp.get(k)!.length)
    const bulkVsCusp = linearFit({ xs: cuspKeys.map(Math.log), ys: cuspBulk })

    const composedExponent = -etaVsBulk.slope * bulkVsCusp.slope

    if (bulkKeys.length < 3 || cuspKeys.length < 3) {
      return verdict({
        status: 'fail',
        claim: 'not enough distinct distances on the genuine tessellation',
        metrics: { pairs: samples.length, bulkKeys: bulkKeys.length, cuspKeys: cuspKeys.length },
      })
    }

    // 1. eta is exponential in bulk distance (the collapse), on the genuine tiling.
    const collapseInBulk = etaVsBulk.r2 > 0.85

    // 2. the bulk distance is logarithmic in physical distance (the shortcut).
    const shortcutInPhysical = bulkVsCusp.r2 > 0.9 && bulkVsCusp.slope > 0.5

    // 3. composed, the shared past is a power law in physical distance, order one.
    const powerLawInPhysical =
      composedExponent > 0.4 && composedExponent < 3

    const solved = collapseInBulk && shortcutInPhysical && powerLawInPhysical

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on a genuine {7,3} hyperbolic tessellation with real cycles the shared past is exponential in through-bulk distance and the through-bulk distance is logarithmic in within-cusp distance, composing to a power law in physical distance of order one, the same as on the tree, so the physical-distance power law is a property of hyperbolic curvature and not a tree artifact',
      metrics: {
        composedPhysicalExponent: composedExponent,
        etaVsBulkRate: -etaVsBulk.slope,
        etaVsBulkR2: etaVsBulk.r2,
        bulkVsCuspSlope: bulkVsCusp.slope,
        bulkVsCuspR2: bulkVsCusp.r2,
        pairs: samples.length,
      },
      control: {
        // The through-bulk-versus-within-cusp log law is the geometric control: on a
        // FLAT tiling it would be linear (slope in linear space, not log), and the
        // composition would give an exponential, not a power law. The log slope here
        // is what makes the physical decay a power law.
        bulkVsCuspR2: bulkVsCusp.r2,
      },
      notes:
        'L2, measured on a genuine hyperbolic tessellation (buildCellGraph {7,3}, real facet-adjacency and cycles). The interior is shallow, so the power law is established by composing two relationships that have range: eta exponential in bulk distance and bulk distance logarithmic in physical (within-cusp) distance (the RT shortcut, E-HLG-0018). The composed exponent is about one, the same order as the tree (E-QTM-0034), so the power law is not a tree artifact. Deterministic, exact cone overlaps.',
    })
  },
})
