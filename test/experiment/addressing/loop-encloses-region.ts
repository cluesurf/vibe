// A loop is a mental anchor: walking it pins down a definite bulk region. A closed walk between two
// boundary cells and back encloses a bulk region, the subtree under their common ancestor, which is
// a contiguous block of boundary cells sharing that ancestor's address prefix. So circling a part of
// the boundary picks out an object (a region and its bulk interior), and a self can anchor a thought
// to that object by holding the loop around it. Two loops around disjoint boundary arcs enclose
// disjoint bulk regions, so distinct anchors pin distinct objects with no overlap, and a wider loop
// (endpoints farther apart) encloses a larger region reaching deeper into the bulk (a shallower
// common ancestor).
//
// Measured on the bulk tree: the loop between two boundary cells encloses exactly the subtree block
// under their common ancestor (a contiguous range of the predicted size), two loops around
// separated arcs enclose disjoint regions, and as the loop widens the enclosed region grows and its
// bulk penetration (the depth it reaches, the ancestor level) increases in step. So a loop is an
// exact, composable anchor: it names a bulk region, distinct loops name distinct regions, and the
// loop's reach into the bulk scales with the region it holds.
//
// The control is a degenerate loop with both endpoints at the same cell: it encloses a single leaf
// (region size one) and reaches no depth, so the enclosing is nontrivial only for a loop that
// actually separates two boundary points.
//
// Depth L2. It establishes the loop-to-region correspondence on the bulk (a loop encloses a definite
// contiguous subtree, disjoint loops enclose disjoint regions, wider loops reach deeper) with the
// degenerate-loop control, the anchor reading of a loop. Known tree geometry, read as the anchoring
// map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  enclosedRegion,
  bulkPenetration,
} from '@/code/measure/bulk-routing'

const BRANCHING = 3
const DEPTH = 8

export default experiment({
  id: 'addressing/loop-encloses-region',
  code: 'E-NVG-0012',
  title:
    'a boundary loop encloses a definite bulk region (the subtree under the common ancestor), disjoint loops enclose disjoint regions, and a wider loop reaches deeper, so a loop is an exact composable anchor for an object',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the loop encloses the exact subtree block under the common ancestor
    const region = enclosedRegion({
      leafA: 0,
      leafB: 5,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const penetration = bulkPenetration({
      leafA: 0,
      leafB: 5,
      branching: BRANCHING,
      depth: DEPTH,
    })

    // the enclosed size is branching to the penetration (a full subtree block)
    const sizeMatchesSubtree = region.size === BRANCHING ** penetration

    // two loops around separated arcs enclose disjoint regions
    const regionA = enclosedRegion({
      leafA: 0,
      leafB: 8,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const regionB = enclosedRegion({
      leafA: 100,
      leafB: 108,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const disjoint =
      regionA.start + regionA.size <= regionB.start ||
      regionB.start + regionB.size <= regionA.start

    // a wider loop encloses a larger region reaching deeper into the bulk
    const widths = [1, 9, 80]
    const sizes = widths.map(
      w =>
        enclosedRegion({
          leafA: 0,
          leafB: w,
          branching: BRANCHING,
          depth: DEPTH,
        }).size,
    )

    const penetrations = widths.map(w =>
      bulkPenetration({
        leafA: 0,
        leafB: w,
        branching: BRANCHING,
        depth: DEPTH,
      }),
    )

    let widerReachesDeeper = true

    for (let i = 1; i < widths.length; i++) {
      if (
        sizes[i]! <= sizes[i - 1]! ||
        penetrations[i]! <= penetrations[i - 1]!
      ) {
        widerReachesDeeper = false
      }
    }

    // CONTROL: a degenerate loop (same endpoint) encloses a single leaf, no depth
    const degenerate = enclosedRegion({
      leafA: 42,
      leafB: 42,
      branching: BRANCHING,
      depth: DEPTH,
    })

    const degenerateTrivial = degenerate.size === 1

    const ok =
      sizeMatchesSubtree &&
      disjoint &&
      widerReachesDeeper &&
      degenerateTrivial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a closed walk between two boundary cells and back encloses exactly the subtree block under their common ancestor (a contiguous range of boundary cells of size the branching raised to the bulk penetration), two loops around separated boundary arcs enclose disjoint bulk regions, and a wider loop (endpoints farther apart) encloses a strictly larger region whose bulk penetration is strictly deeper, so a loop is an exact composable anchor that names a bulk region and its object, distinct loops name disjoint objects, and the loop reach into the bulk scales with the region it holds, while a degenerate loop with both endpoints at one cell encloses a single leaf and reaches no depth, so the anchoring is nontrivial only for a loop that separates two boundary points',
      metrics: {
        enclosedStart: region.start,
        enclosedSize: region.size,
        bulkPenetration: penetration,
        disjointRegions: disjoint ? 1 : 0,
        degenerateSize: degenerate.size,
      },
      // CONTROL: the degenerate loop encloses a single leaf, no anchoring.
      control: { degenerateSize: degenerate.size },
      notes:
        'A loop as a mental anchor: it encloses a definite bulk region (subtree), disjoint loops name disjoint objects, wider loops reach deeper. Complements the object-cone map (E-CSM-0050) and the depth-is-scale routing (E-NVG-0008).',
    })
  },
})
