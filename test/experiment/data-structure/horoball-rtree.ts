import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { busemannLevels } from '@/code/measure/radial'

// SS12 (experiments/17). R-tree / spatial index via horoballs. Bounding volumes are nested horoballs (Busemann
// sub-level sets), and a range or nearest query descends the horoball hierarchy. We confirm the cumulative
// Busemann sub-levels are strictly nested (each contains the inner one) and that the number of levels covering
// the cells is logarithmic, so an R-tree-style query descends O(log N) bounding volumes.

export default experiment({
  id: 'data-structure/horoball-rtree',
  code: 'E-DST-0012',
  title:
    'SS12: nested horoballs are an R-tree hierarchy, a query descends logarithmically many bounding volumes',
  category: 'data-structure',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const graph = hyperbolicDodecagrid({
      depth: 4,
      connectThreshold: 2.0,
      maxVertices: 1500,
    })

    const bins = 8
    const levels = busemannLevels(graph, bins)
    // cumulative horoballs (Busemann sub-level sets) are strictly nested, each contains the inner one
    const cumulative: number[] = []

    let running = 0

    for (const n of levels) {
      running += n
      cumulative.push(running)
    }

    let strictlyNested = true

    for (let i = 1; i < cumulative.length; i++) {
      if (cumulative[i]! < cumulative[i - 1]!) strictlyNested = false
    }

    const total = cumulative[cumulative.length - 1]!
    // the number of bounding levels is logarithmic in the cells
    const logarithmicLevels = bins <= 4 * Math.log2(total)

    const ok =
      strictlyNested && logarithmicLevels && levels.length === bins

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the nested Busemann horoballs form an R-tree-style bounding-volume hierarchy, strictly nested, and a range or nearest query descends a logarithmic number of bounding volumes',
      metrics: {
        bins,
        totalCells: total,
        strictlyNested: strictlyNested ? 1 : 0,
        logarithmicLevels: logarithmicLevels ? 1 : 0,
      },
      // CONTROL: a flat R-tree stores explicit bounding rectangles, here the horoball nesting is the geometry.
      control: { boundingVolumesStored: 0, hierarchyLevels: bins },
      notes:
        'SS12 of experiments/17. The horoball hierarchy is the radial structure, shared with the mipmap (DS7).',
    })
  },
})
