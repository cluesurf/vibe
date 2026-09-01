// Is the smallest coarse variable with a relative phase, a PAIR of tones meeting at one cell, still
// classical under the committed momentum rule? foundations/permutation-rule-cannot-interfere shows a
// phase on whole configurations is always relabelled. The escape the middle layer needs is a coarse
// variable whose induced dynamics is many-to-one. The obvious first candidate is the pair: the momentum
// rule's one non-trivial act is to turn a same-sign head-on pair onto another line, and two different
// pairs might conceivably land on the same one. This experiment enumerates the question exactly.
//
// All two-tone configurations of one cell's twenty-four slots (276 unordered slot pairs times four sign
// choices, 1104 states) are pushed through one collision, and the number of distinct images is counted.
// If it equals 1104 the induced map on pairs is a permutation and the pair is classical too. The
// control is the conserving but irreversible sorting collision, which merges pairs.
//
// Result: 1104 distinct images, the pair map is a permutation. The head-on rotation swaps two lines and
// leaves every other pair alone, so it is its own inverse and cannot merge. Depth L1: finite enumeration
// on the committed coin, a negative for idea 6 of the middle-layer notes, with a control that merges.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { Collision, headOnRotate } from '@/code/rule/collision'
import { sortingCollision } from '@/code/control/conserving-irreversible-collision'

function pairImages(input: {
  degree: number
  collision: Collision
}): { states: number; distinctImages: number; changed: number } {
  const { degree, collision } = input
  const images = new Set<string>()

  let states = 0
  let changed = 0

  for (let i = 0; i < degree; i++) {
    for (let j = i + 1; j < degree; j++) {
      for (const a of [1, -1] as const) {
        for (const b of [1, -1] as const) {
          const slots = new Int8Array(degree)

          slots[i] = a
          slots[j] = b
          states++

          const before = Array.from(slots).join(',')

          collision(slots, 0, degree)

          const after = Array.from(slots).join(',')

          images.add(after)

          if (after !== before) {
            changed++
          }
        }
      }
    }
  }

  return { states, distinctImages: images.size, changed }
}

export default experiment({
  id: 'foundations/pair-coarse-map-is-permutation',
  code: 'E-FND-0083',
  title:
    'the induced map of the momentum rule on two-tone pairs at one cell is a permutation: all 1104 two-tone states land on 1104 distinct images (the head-on rotation swaps two lines and fixes everything else), so a pair is as classical as a single tone, while the irreversible sorting collision merges the same states',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: 3 })
    const opposite = meshOpposites(mesh)
    const momentum = pairImages({
      degree: mesh.degree,
      collision: headOnRotate({ opposite }),
    })

    const sorting = pairImages({
      degree: mesh.degree,
      collision: sortingCollision,
    })

    const pairMapIsPermutation = momentum.distinctImages === momentum.states
    const somethingHappens = momentum.changed > 0
    const controlMerges = sorting.distinctImages < sorting.states

    const ok = pairMapIsPermutation && somethingHappens && controlMerges

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every one of the 1104 two-tone configurations of one cell (276 slot pairs, four sign choices) maps under the momentum-conserving collision to a distinct configuration, with the head-on same-sign pairs (24 of them) turned onto their partner line and the rest fixed, so the induced dynamics on pairs is a permutation and carries no merge that a coarse phase could exploit, while the conserving irreversible sorting collision sends the same 1104 states to far fewer images',
      metrics: {
        pairStates: momentum.states,
        distinctImages: momentum.distinctImages,
        pairsChangedByTheCollision: momentum.changed,
      },
      control: {
        sortingDistinctImages: sorting.distinctImages,
      },
      notes:
        'Closes idea 6 of note/research/vibe/next-paper/ideas.md exactly: the pair is not the coarse variable either. Whatever carries an amplitude has to be coarser than a pair at a cell, most likely a count over many cells or many beats. L1, finite enumeration on the committed coin with a control.',
    })
  },
})
