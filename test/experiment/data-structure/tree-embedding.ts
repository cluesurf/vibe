import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { completeTree, embedTree, embeddingDistortion } from '@/code/geometry/tree-embedding'

// DS6 and SS11 (experiments/16 and 17). Tree and hierarchy embedding. A tree embeds in hyperbolic space with
// distortion approaching 1, which the Euclidean plane cannot do, because hyperbolic circles have exponential
// circumference and fit a node's children at large angular separation. We embed a complete b-ary tree into the
// Poincare disk (Sarkar) and into the Euclidean plane by the same recursive fan-out, and compare the worst-case
// distortion. The hyperbolic distortion is far lower. References, Sarkar 2011, Nickel-Kiela 2017.

export default experiment({
  id: 'data-structure/tree-embedding',
  title: 'DS6: a tree embeds in the hyperbolic disk at low distortion, the Euclidean plane cannot',
  category: 'data-structure',
  substrates: ['73'],
  depth: 'L2',
  paper: true,
  run() {
    const tree = completeTree({ branching: 3, depth: 4 })
    const edge = 4 // a hyperbolic edge length large enough that the children sit at full angular separation
    const hyperbolic = embedTree({ parent: tree.parent, children: tree.children, edge, hyperbolic: true })
    const euclidean = embedTree({ parent: tree.parent, children: tree.children, edge, hyperbolic: false })
    const hyperbolicDistortion = embeddingDistortion({ coords: hyperbolic.coords, depth: hyperbolic.depth, parent: tree.parent, hyperbolic: true })
    const euclideanRaw = embeddingDistortion({ coords: euclidean.coords, depth: euclidean.depth, parent: tree.parent, hyperbolic: false })
    const euclideanDistortion = Number.isFinite(euclideanRaw) ? euclideanRaw : 1e18

    // the hyperbolic embedding has LOW distortion (near 1), the Euclidean one is unbounded (children crowd to
    // overlaps), so the tree embeds in the disk and not in the plane
    const hyperbolicLowDistortion = hyperbolicDistortion < 3
    const euclideanUnbounded = euclideanDistortion > 100 * hyperbolicDistortion
    const ok = hyperbolicLowDistortion && euclideanUnbounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a complete tree embeds in the Poincare disk with distortion near 1, while the same tree in the Euclidean plane has unbounded distortion (the children crowd to overlaps), because only hyperbolic space has the exponential angular room a tree needs',
      metrics: { nodes: tree.size, hyperbolicDistortion, hyperbolicLowDistortion: hyperbolicLowDistortion ? 1 : 0, euclideanUnbounded: euclideanUnbounded ? 1 : 0 },
      // CONTROL: the Euclidean embedding of the identical tree has orders-of-magnitude higher distortion, so the
      // low distortion is the hyperbolic geometry, not the tree.
      control: { euclideanDistortion },
      notes: 'DS6 of experiments/16 and SS11 of experiments/17. The bulk embeds the hierarchies and scale-free graphs that dominate real data.',
    })
  },
})
