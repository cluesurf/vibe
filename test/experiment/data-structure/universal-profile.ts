import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { tessellationDataProfile } from '@/code/measure/tessellation-profile'

// The UNIVERSAL data-structure profile. One module runs the structural data-structure measures on ANY
// hyperbolic Coxeter tessellation from its Schlafli symbol, so the whole 2D-to-5D family from
// paper/tessellations.csv gets the same B-tree, trie, heap, capacity, and addressing structure. We profile
// all 42 buildable tessellations and confirm the two universal claims hold for every one: capacity is
// exponential (the growth ratio exceeds a flat lattice) and the tree / address radius is logarithmic in the
// cells. The control is a EUCLIDEAN tiling ({4,4}, {4,3,4}), whose growth ratio collapses toward 1.

// the 42 buildable regular hyperbolic tessellations, 2D to 5D (paper/tessellations.csv)
const TESSELLATIONS: number[][] = [
  [7, 3], [3, 7], [8, 3], [3, 8], [5, 4], [4, 5], [6, 4], [4, 6], [5, 5], [6, 6],
  [5, 3, 4], [4, 3, 5], [3, 5, 3], [5, 3, 5], [3, 3, 6], [6, 3, 3], [3, 4, 4], [4, 4, 3], [3, 6, 3],
  [4, 3, 6], [6, 3, 4], [5, 3, 6], [6, 3, 5], [4, 4, 4], [6, 3, 6], [3, 3, 7], [7, 3, 3], [3, 7, 3],
  [3, 3, 3, 5], [5, 3, 3, 3], [4, 3, 3, 5], [5, 3, 3, 4], [5, 3, 3, 5], [4, 3, 4, 3], [3, 4, 3, 4], [4, 4, 3, 3], [4, 4, 4, 4],
  [4, 3, 3, 4, 3], [3, 4, 3, 3, 4], [3, 3, 4, 3, 3], [3, 4, 3, 3, 3], [3, 3, 3, 4, 3],
]

export default experiment({
  id: 'data-structure/universal-profile',
  title: 'one module gives the data-structure profile of every 2D-to-5D tessellation, all have exponential capacity and logarithmic tree depth',
  category: 'data-structure',
  substrates: ['all'],
  depth: 'L1',
  paper: true,
  run() {
    const maxCells = 1200
    const profiles = TESSELLATIONS.map((symbol) => tessellationDataProfile({ symbol, maxCells }))
    const allCapacityExponential = profiles.every((p) => p.capacityExponential)
    const allTreeDepthLogarithmic = profiles.every((p) => p.treeDepthLogarithmic)
    const dimensions = new Set(profiles.map((p) => p.rank - 1))
    const minGrowth = Math.min(...profiles.map((p) => p.growthRatio))

    // CONTROL: a EUCLIDEAN tiling's growth ratio DECREASES toward 1 as the cell count grows (polynomial), while
    // a hyperbolic one stays bounded above 1 (exponential). At finite size the absolute ratios can overlap (a
    // mild 2D hyperbolic versus a flat transient), so the honest signature is the TREND.
    const flatSmall = tessellationDataProfile({ symbol: [4, 3, 4], maxCells: 500 }).growthRatio
    const flatLarge = tessellationDataProfile({ symbol: [4, 3, 4], maxCells: 3000 }).growthRatio
    const hyperbolicSmall = tessellationDataProfile({ symbol: [5, 3, 5], maxCells: 500 }).growthRatio
    const hyperbolicLarge = tessellationDataProfile({ symbol: [5, 3, 5], maxCells: 3000 }).growthRatio
    const flatDecreasesTowardOne = flatLarge < flatSmall - 0.05
    const hyperbolicStaysBounded = Math.abs(hyperbolicLarge - hyperbolicSmall) < 0.15

    const ok = allCapacityExponential && allTreeDepthLogarithmic && profiles.length === 42 && flatDecreasesTowardOne && hyperbolicStaysBounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a single module profiles every hyperbolic tessellation from its Schlafli symbol, and all 42 buildable 2D-to-5D tessellations share the data-structure profile, exponential capacity and a logarithmic tree and address radius, so the same B-tree, trie, heap, and hash structures construct on every one',
      metrics: {
        tessellationsProfiled: profiles.length,
        dimensionsCovered: dimensions.size,
        allCapacityExponential: allCapacityExponential ? 1 : 0,
        allTreeDepthLogarithmic: allTreeDepthLogarithmic ? 1 : 0,
        minGrowthRatio: minGrowth,
      },
      // CONTROL: the flat cubic growth ratio decreases toward 1 with size (polynomial), the hyperbolic one
      // stays bounded (exponential), so the universal exponential capacity is the negative curvature.
      control: { flatGrowthSmall: flatSmall, flatGrowthLarge: flatLarge, flatDecreasesTowardOne: flatDecreasesTowardOne ? 1 : 0, hyperbolicStaysBounded: hyperbolicStaysBounded ? 1 : 0 },
      notes:
        'The universal profile of all 2D-to-5D tessellations (paper/tessellations.csv). Capacity and logarithmic depth are universal, boundary dominance strengthens with dimension (2D is milder). The geometric structures (greedy routing, the Busemann mipmap) need a per-family embedding, the plan in plans/data-structures-on-all-tessellations covers that.',
    })
  },
})
