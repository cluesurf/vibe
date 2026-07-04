// Whitehead's concrescence on the substrate (footnotes2plato-segall in the census, the
// philosophical-foundation bridge): "the many become one and are increased by one." Many
// previously independent local patterns bind into ONE unified occasion whose integration
// exceeds that of its parts. On the mesh this is exact: take a compact whole, split it into
// parts, and compare the binding margin of the whole against the mean margin of its parts.
// When the parts merge, the edges that were BOUNDARY between the parts become INTERNAL to
// the whole, so the whole is more individuated than any part was alone, the concrescence
// jump. On a degree-preserving scramble the parts and the whole are both expander-like, so
// merging adds no such jump, which is the control.
//
// Depth L2, a graph property read through Whitehead concrescence, with the scramble the
// control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { scrambleNeighbors } from '@/code/control/scramble'
import { ballAtRadius, bindingMargin } from '@/code/coarse/binding-margin'
import { nearestSeedLabels, evenlySpacedSeeds } from '@/code/measure/factorization'

function concrescenceJump(input: {
  neighbors: number[][]
  whole: number[]
  parts: number
}): { wholeMargin: number; meanPartMargin: number; jump: number } {
  const { neighbors, whole, parts } = input

  // split the whole into `parts` compact sub-regions, grown from evenly spaced seeds
  // among the whole's own cells, so the parts partition the whole with no randomness.
  const seedIndices = evenlySpacedSeeds({ cellCount: whole.length, blocks: parts })
  const seeds = seedIndices.map(i => whole[i]!)
  // restrict the label growth to the whole by giving nearestSeedLabels the full graph
  // but reading labels only for the whole's cells.
  const labels = nearestSeedLabels({ neighbors, seeds })

  const wholeMargin = bindingMargin({ neighbors, region: whole }).margin

  let sum = 0

  for (let p = 0; p < parts; p++) {
    const part = whole.filter(cell => labels[cell] === p)

    if (part.length > 0) {
      sum += bindingMargin({ neighbors, region: part }).margin
    }
  }

  const meanPartMargin = sum / parts

  return { wholeMargin, meanPartMargin, jump: wholeMargin - meanPartMargin }
}

export default experiment({
  id: 'selves/concrescence-jump',
  code: 'E-SLF-0159',
  title:
    'many parts bound into one occasion on {3,4,3,4} are more individuated than the parts alone (Whitehead concrescence, the many become one and are increased), a jump a scramble does not show',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 6 })
    const neighbors = meshNeighbors(mesh)
    const scrambled = scrambleNeighbors({ neighbors, seed: 1, passes: 8 })

    const whole = ballAtRadius({ mesh, center: 0, radius: 3 })
    const parts = 6

    const meshResult = concrescenceJump({ neighbors, whole, parts })
    // control: the SAME whole and parts, but on the scramble the boundary-between-parts
    // edges are not concentrated, so merging does not lift the margin.
    const scrambleResult = concrescenceJump({ neighbors: scrambled, whole, parts })

    const meshConcresces = meshResult.jump > 0
    const scrambleFlat = scrambleResult.jump < 0.5 * meshResult.jump
    const ok = meshConcresces && scrambleFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'many parts bound into one occasion on {3,4,3,4} are more individuated than the parts were alone, Whitehead concrescence, the many become one and are increased by one. When the parts merge, the edges that were boundary between them become internal to the whole, so the whole binding margin rises above the mean margin of its parts, a positive concrescence jump. On a degree-preserving scramble the parts and the whole are both expander-like, so merging adds no such jump. The geometry, not the labelling, produces the many-into-one binding. Depth L2, a graph property read through concrescence, the scramble the control.',
      metrics: {
        meshWholeMargin: meshResult.wholeMargin,
        meshMeanPartMargin: meshResult.meanPartMargin,
        meshJump: meshResult.jump,
        scrambleJump: scrambleResult.jump,
      },
      control: {
        scrambleJump: scrambleResult.jump,
      },
      notes:
        'the jump measures superadditivity of binding: the whole is more bound than the sum of its parts because inter-part coupling turns into intra-whole integration. On the scramble there is no compact part structure, so no jump. This is the discrete, checkable form of concrescence, and it backs vibe use of Whitehead as the metaphysical floor for the many-into-one binding of a self.',
    })
  },
})
