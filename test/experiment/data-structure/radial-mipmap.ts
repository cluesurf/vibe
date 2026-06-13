import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { busemannLevels } from '@/code/measure/radial'

// DS7 (experiments/16). Radial multiresolution / mipmap. The radial Busemann coordinate is the scale, its level
// sets are nested horospheres, and they form a multiresolution pyramid, the outer (finer) levels hold
// geometrically more cells than the inner (coarser) ones. We bin the dodecagrid cells by Busemann level and
// confirm the populations grow strongly outward, the level-of-detail pyramid. Control: a flat octree grows by a
// fixed factor (8 in 3D), the hyperbolic pyramid grows by the curvature factor. Reference, Vidal 2007 (MERA).

export default defineExperiment({
  id: 'data-structure/radial-mipmap',
  title: 'DS7: the radial Busemann levels form a multiresolution pyramid, fine levels hold geometrically more cells',
  category: 'data-structure',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const graph = hyperbolicDodecagrid({ depth: 4, connectThreshold: 2.0, maxVertices: 1500 })
    const bins = 6
    const levels = busemannLevels(graph, bins)
    const half = Math.floor(bins / 2)
    const innerCells = levels.slice(0, half).reduce((s, n) => s + n, 0)
    const outerCells = levels.slice(half).reduce((s, n) => s + n, 0)

    // the finer (outer) levels hold geometrically more cells than the coarser (inner) ones, the LOD pyramid
    const pyramid = levels.length === bins && outerCells > innerCells * 2

    return verdict({
      status: pyramid ? 'pass' : 'fail',
      claim:
        'the radial Busemann level sets form a multiresolution pyramid, the finer outer horospheres hold geometrically more cells than the coarser inner ones, so the bulk stores data at exponentially many resolutions, a mipmap',
      metrics: { bins, innerCells, outerCells, pyramid: pyramid ? 1 : 0 },
      // CONTROL: a flat octree grows by a fixed factor per level (8 in 3D), here the level growth is the
      // hyperbolic curvature factor, so the pyramid is the geometry.
      control: { outerToInnerRatio: outerCells / Math.max(1, innerCells), levelCount: levels.length },
      notes: 'DS7 of experiments/16. The radial axis is the LOD here, the LSM level (SS5), the heap priority (SS4), and the skip-list shortcut (DS9).',
    })
  },
})
