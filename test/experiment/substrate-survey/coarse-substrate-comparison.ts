// E7 (multi-level-selves plan), substrate comparison. Which substrate supports clean, compact selves. A
// self must be low-leak, most of its cells interior, few on the boundary, so its blanket can screen. This is
// an isoperimetric property of the substrate. On a flat horosphere layer a region's boundary fraction falls
// as it grows (compact selves exist). In the hyperbolic bulk a region is almost all boundary at every size
// (no compact selves), the exponential-growth signature. We measure the boundary fraction of a region at a
// matched size across substrates.
//
// Depth L2, a known geometric property (the isoperimetric contrast of flat versus hyperbolic) measured on
// this substrate, with the bulk as the control. It is the reason the self experiments use the flat layer.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { flatGraph, squareGraph, bulkGraph, ball, boundaryFraction, type Graph } from '@/test/experiment/misc/self-kit'

// grow a ball around a center until it reaches at least the target size, then its boundary fraction.
function fractionAtSize(input: { graph: Graph; center: number; targetSize: number; maxRadius: number }): {
  fraction: number
  size: number
} {
  const { graph, center, targetSize, maxRadius } = input
  let cells = [center]
  for (let r = 1; r <= maxRadius; r++) {
    cells = ball(graph, center, r)
    if (cells.length >= targetSize) break
  }
  return { fraction: boundaryFraction(cells, graph), size: cells.length }
}

export default defineExperiment({
  id: 'substrate-survey/coarse-substrate-comparison',
  title: 'flat and square horospheres support compact low-leak selves, the hyperbolic bulk does not',
  category: 'substrate-survey',
  substrates: ['flat-horosphere', 'square-horosphere', '534-bulk'],
  depth: 'L2',
  paper: false,
  run() {
    const target = 250

    const flat = fractionAtSize({ graph: flatGraph(96), center: 48 * 96 + 48, targetSize: target, maxRadius: 40 })
    const square = fractionAtSize({ graph: squareGraph(96), center: 48 * 96 + 48, targetSize: target, maxRadius: 40 })
    const bulk = fractionAtSize({ graph: bulkGraph(8000), center: 0, targetSize: target, maxRadius: 12 })

    // flat and square are compact (low boundary fraction), the bulk is leaky (near all boundary).
    const ok = flat.fraction < bulk.fraction - 0.3 && square.fraction < bulk.fraction - 0.3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at a matched region size, the flat and square horospheres have a far lower boundary fraction than the hyperbolic bulk, so only they admit compact low-leak selves',
      metrics: {
        flatFraction: flat.fraction,
        flatSize: flat.size,
        squareFraction: square.fraction,
        squareSize: square.size,
        bulkFraction: bulk.fraction,
        bulkSize: bulk.size,
      },
      control: { bulkFraction: bulk.fraction },
      notes: 'the isoperimetric contrast, flat boundary falls as 1 over sqrt(size), the hyperbolic bulk stays near all boundary, which is why selves are clean on the flat layer',
    })
  },
})
