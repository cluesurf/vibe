import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { busemannLevels } from '@/code/measure/radial'

// SS14 (experiments/17). Array on the cusp (the honest caveat). A dense array lives only on the flat horosphere
// slice, not in the bulk, because the bulk interior is sparse (the radial pyramid concentrates cells outward).
// We confirm the inner radial levels hold far fewer cells than the outer ones, so a dense uniform array stored
// across the bulk would waste the interior, the array belongs on a single flat horosphere level. Control: a
// flat RAM array is uniform, the bulk is not.

export default experiment({
  id: 'data-structure/cusp-array',
  title: 'SS14: a dense array belongs on the flat horosphere, the bulk interior is too sparse to be an array',
  category: 'data-structure',
  substrates: ['534'],
  depth: 'L1',
  paper: true,
  run() {
    const graph = hyperbolicDodecagrid({ depth: 4, connectThreshold: 2.0, maxVertices: 1500 })
    const levels = busemannLevels(graph, 6)
    const innermost = levels[0]!
    const outermost = levels[levels.length - 1]!
    const total = levels.reduce((s, n) => s + n, 0)

    // the interior is sparse: the innermost radial level holds a tiny fraction, so a uniform dense array across
    // the bulk wastes the interior, the flat array belongs on a single (outer) horosphere level
    const interiorSparse = innermost < total * 0.1 && outermost > innermost * 3

    return verdict({
      status: interiorSparse ? 'pass' : 'fail',
      claim:
        'the bulk interior is sparse, the innermost radial level holds a tiny fraction of the cells, so a dense uniform array stored across the bulk wastes the interior, a flat array belongs on a single horosphere level (the cusp), not in the bulk',
      metrics: { innermostCells: innermost, outermostCells: outermost, totalCells: total, interiorSparse: interiorSparse ? 1 : 0 },
      // CONTROL: a flat RAM array is uniform with no wasted interior, the bulk concentrates cells on the boundary.
      control: { interiorFraction: innermost / total },
      notes: 'SS14 of experiments/17, the honest caveat. The flat array lives on the cusp horosphere, the tree structures (SS1) live in the bulk, the hash structures (SS2) on the boundary.',
    })
  },
})
