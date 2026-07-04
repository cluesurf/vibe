// Tegmark's quantum factorization problem, in its discrete graph form (arXiv:1401.1219,
// max-tegmark-perceptronium in the related-theories census). Tegmark asks why the world
// factors into the integrated, nearly independent objects we perceive rather than into
// any of the countless other valid partitions, and his criterion for a good object is a
// high ratio of internal integration to external coupling. Vibe claims its {3,4,3,4}
// mesh supplies such a partition by construction. This is the honest test of that boast.
//
// The measure is exact and integer: partition the cells into spatially compact blocks
// (Voronoi regions grown from evenly spaced seeds on the graph), then count internal
// edges (integration) against crossing edges (coupling). The robustness fraction is
// internal / (internal + external). The controls decide whether the geometry or the
// labelling is doing the work. SCRAMBLE keeps every cell's degree but destroys locality,
// FLAT is a Euclidean lattice. If the same block labels give a high fraction on the mesh
// and a low one on the scramble, the mesh geometry is supplying the factorization.
//
// This is a static structural property of the mesh graph, not the dynamical rule, so the
// depth is L2 (a graph-locality fact reproduced on this substrate and read through
// Tegmark's criterion), with the scramble as the control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, cubicMesh, meshNeighbors } from '@/code/tool/mesh'
import { scrambleNeighbors } from '@/code/control/scramble'
import {
  nearestSeedLabels,
  edgeRobustness,
  evenlySpacedSeeds,
} from '@/code/measure/factorization'

function robustnessOf(input: {
  neighbors: number[][]
  blocks: number
}): number {
  const { neighbors, blocks } = input
  const seeds = evenlySpacedSeeds({
    cellCount: neighbors.length,
    blocks,
  })

  const labels = nearestSeedLabels({ neighbors, seeds })

  return edgeRobustness({ neighbors, labels }).fraction
}

export default experiment({
  id: 'geometry/mesh-preferred-factorization',
  code: 'E-GMT-0029',
  title:
    'the {3,4,3,4} mesh supplies a preferred factorization (compact blocks are internally dense and externally sparse), which a degree-preserving scramble destroys',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const blocks = 16

    // the real mesh: 256 cells, degree 24, compact blocks grown on the graph
    const mesh = d4Mesh({ side: 4 })
    const neighbors = meshNeighbors(mesh)
    const meshFraction = robustnessOf({ neighbors, blocks })

    // control one, SCRAMBLE: same degree sequence, locality destroyed. The same block
    // labels now cut through edges everywhere, so the internal fraction collapses.
    const scrambled = scrambleNeighbors({
      neighbors,
      seed: 1,
      passes: 8,
    })

    const seeds = evenlySpacedSeeds({
      cellCount: neighbors.length,
      blocks,
    })

    const scrambledSameLabels = edgeRobustness({
      neighbors: scrambled,
      labels: nearestSeedLabels({ neighbors, seeds }),
    }).fraction

    // even re-growing the blocks on the scramble cannot recover locality (an expander
    // has no compact partition), so its best-effort fraction is still low.
    const scrambledBestEffort = robustnessOf({
      neighbors: scrambled,
      blocks,
    })

    // control two, FLAT: a Euclidean lattice gives a compact partition too, but at its
    // own (lower-degree) geometry, a different fingerprint from the hyperbolic mesh.
    const flat = cubicMesh({ side: 6 })
    const flatFraction = robustnessOf({
      neighbors: meshNeighbors(flat),
      blocks,
    })

    // the discriminating claim is the control ratio: the mesh integration-to-coupling
    // beats the degree-matched scramble by a clear factor. The absolute fraction is set
    // by the block count and the coin degree (a degree-24 block shares many boundary
    // edges), so the ratio, not an absolute bar, is what could have failed.
    const meshOverScramble =
      scrambledBestEffort === 0 ? 0 : meshFraction / scrambledBestEffort

    const beatsScramble = meshOverScramble > 2
    const scrambleCollapsed = scrambledBestEffort < 0.5 * meshFraction
    const ok = beatsScramble && scrambleCollapsed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} mesh supplies a preferred factorization by construction, the discrete form of Tegmark quantum factorization problem. Partitioned into compact blocks, the mesh keeps a far larger share of edges inside a block than a degree-matched scramble does (the internal fraction is more than twice the scramble here), so the blocks are the integrated nearly independent objects Tegmark asks for and the geometry, not the labelling, supplies them. A degree-preserving scramble keeps every cell degree but destroys locality, and the same partition then cuts edges everywhere, collapsing the internal fraction. A flat lattice also factors but at its own lower-degree fingerprint. Depth L2, a graph-locality property of the static mesh read through Tegmark criterion, with the scramble the control that could have failed.',
      metrics: {
        meshFraction,
        scrambledSameLabels,
        scrambledBestEffort,
        flatFraction,
        meshOverScramble,
      },
      control: {
        scrambledBestEffort,
        scrambledSameLabels,
      },
      notes:
        'the discriminating control is the scramble: same 24-regular degree sequence, locality gone. The mesh internal fraction stays high because compact blocks on a real geometry touch only at their boundary, while on the scramble no partition is compact so the fraction falls toward the blocks-to-cells ratio. This is Tegmark integration (internal) and independence (external) at the connectivity level, not a Hilbert-space factorization, so it is scoped L2 and named as the discrete analogue, not the full quantum claim.',
    })
  },
})
