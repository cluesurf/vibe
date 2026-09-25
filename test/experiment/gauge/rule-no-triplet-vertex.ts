// Does the committed rule have the three-body vertex color needs? In SU(3) three quarks make a
// singlet through the epsilon tensor, and three gluon lines meet at a vertex, so a color structure on
// the coin needs interactions among three directions at once, and the natural triples of the D4 coin
// are its closed triangles, three root directions summing to zero (each A2 subsystem, the root system
// of SU(3) itself, holds two). The coin has the room: the 24 D4 roots hold 32 such triangles, 16 A2
// subsystems. The question is whether the rule ever lets a triangle interact.
//
// Measured from the collision function, not its source: every beat of the 24-beat turning schedule is
// probed for which slots influence which, the influence graph's components are the interaction
// blocks, the product of the exact block maps is checked back against the collision on every probe,
// and the triangles that fall inside a single block are counted.
//
// Controls: sticky reflection, a collision that couples the whole cell, puts every triangle inside its
// one block, so the count can come out nonzero. Pure streaming couples nothing (every block a single
// slot), zero by construction.
//
// Depth L2: a structural measurement of the committed collision (no run through beat on a mesh), so
// it says what one collision can do. It does not rule out an effective three-body coupling built up
// over several beats through streaming between cells, which is stated in the verdict.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  passThrough,
  stickyReflect,
  turningWeave,
} from '@/code/rule/collision'
import {
  blocksReproduceCollision,
  interactionBlocks,
  probeConfigurations,
  trianglesInsideBlocks,
  zeroSumTriangles,
} from '@/code/measure/collision-anatomy'
import { scheduleAnatomy } from '@/code/measure/coin-symmetry'

const PERIOD = 24

export default experiment({
  id: 'gauge/rule-no-triplet-vertex',
  code: 'E-FRC-0094',
  title:
    'the D4 coin holds 32 zero-sum triangles (16 A2 subsystems, the room for color) but no beat of the committed rule lets any of them interact inside one collision block, the blocks being at most two lines, so the rule has no single-collision three-body vertex of the epsilon kind',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = meshOpposites(d4Mesh({ side: 3 }))
    const directions = rootsD4()
    const triangles = zeroSumTriangles({ directions })
    const committed = turningWeave({ opposite })
    const anatomy = scheduleAnatomy({
      schedule: committed,
      period: PERIOD,
      degree: 24,
    })
    const probes = probeConfigurations({ degree: 24 })
    const decompositionExact = anatomy.every((beatAnatomy, t) =>
      blocksReproduceCollision({
        collision: committed(t),
        degree: 24,
        blocks: beatAnatomy.blocks,
        maps: beatAnatomy.maps,
        probes,
      }),
    )
    const lineOf = (slot: number): number =>
      Math.min(slot, opposite[slot] ?? slot)
    const trianglesInside = anatomy.reduce(
      (sum, beatAnatomy) =>
        sum +
        trianglesInsideBlocks({
          triangles,
          blocks: beatAnatomy.blocks,
        }),
      0,
    )
    const largestBlock = Math.max(
      ...anatomy.flatMap(a => a.blocks.map(block => block.length)),
    )
    const mostLinesInABlock = Math.max(
      ...anatomy.flatMap(a =>
        a.blocks.map(block => new Set(block.map(lineOf)).size),
      ),
    )
    // how many distinct lines ever interact with some other line, over the schedule
    const interactingLines = new Set(
      anatomy.flatMap(a =>
        a.blocks
          .filter(block => new Set(block.map(lineOf)).size > 1)
          .flatMap(block => block.map(lineOf)),
      ),
    ).size

    const stickyBlocks = interactionBlocks({
      collision: stickyReflect({ opposite }),
      degree: 24,
      probes,
    })
    const stickyInside = trianglesInsideBlocks({
      triangles,
      blocks: stickyBlocks,
    })
    const streamingBlocks = interactionBlocks({
      collision: passThrough,
      degree: 24,
      probes,
    })
    const streamingInside = trianglesInsideBlocks({
      triangles,
      blocks: streamingBlocks,
    })

    const roomExists = triangles.length === 32
    const noVertex = trianglesInside === 0 && mostLinesInABlock <= 2
    const detectorWorks =
      stickyInside === triangles.length && streamingInside === 0
    const ok =
      decompositionExact && roomExists && noVertex && detectorWorks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 24 D4 coin directions hold 32 zero-sum triangles, and over all 24 beats of the committed turning weave none of them falls inside one interaction block (the largest block spans two lines), so no single collision couples three directions of a triangle, the vertex an epsilon-tensor color singlet or a three-gluon coupling would need, while a whole-cell collision puts all 32 inside',
      metrics: {
        triangles: triangles.length,
        a2Subsystems: triangles.length / 2,
        trianglesInsideCommittedBlocks: trianglesInside,
        largestBlockSlots: largestBlock,
        mostLinesInABlock,
        linesThatEverInteract: interactingLines,
        blockDecompositionExact: decompositionExact ? 1 : 0,
      },
      control: {
        stickyReflectTrianglesInside: stickyInside,
        stickyReflectBlocks: stickyBlocks.length,
        streamingTrianglesInside: streamingInside,
        streamingBlocks: streamingBlocks.length,
      },
      notes:
        'L2, a structural measurement of the committed collision, with no random numbers (the probe set is a fixed enumeration of sparse and structured cell states). An honest negative for color at the level of one collision. It does not exclude an effective three-body coupling assembled over several beats as tones stream between cells, which a separate dynamical measurement would have to test. What the rule would need: a collision whose blocks join three lines whose directions close a triangle, which the per-line clock and the two-line swap never do.',
    })
  },
})
