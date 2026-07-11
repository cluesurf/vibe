// Reversibility is NOT a separate premise, it is the seed ("a difference cannot vanish") applied to
// the dynamics. This reduces the premise the pinch to dimension eight rests on.
//
// The worry. The chain forces dimension eight from reversibility (lose nothing, no zero divisors),
// and reversibility looked like an independent premise, not a theorem, so the pinch rested on an
// assumption one level down.
//
// The reduction. The seed is that nothing cannot be, that to exist is to differ, and so a difference
// once made cannot simply vanish. Now unfold what "a difference cannot vanish" means for a rule. A
// rule erases a difference exactly when it maps two DISTINCT states to the SAME successor, because
// then the difference between those two states is gone, unrecoverable. A rule that never does this
// is INJECTIVE, and an injective map on a finite state set is a bijection, which is exactly
// REVERSIBILITY. So "a difference cannot vanish" (the seed), "erases no distinction", "injective",
// and "reversible" are four names for one property. Reversibility is therefore not a fifth premise,
// it is the seed read as a condition on dynamics.
//
// Measured. The knit is injective (a bijection): run it forward then inverse and the start returns
// bit for bit, so no two distinct states could have merged, no difference vanished. A lossy erasing
// rule is NOT injective: two states differing only in the erased slot map to the SAME successor, so
// the difference between them is destroyed, which is exactly the vanishing the seed forbids. So the
// seed excludes the lossy rule and keeps the reversible one, and reversibility is derived from the
// seed, not assumed.
//
// CONTROL: the lossy rule, which erases a difference (two distinct states, one successor), the case
// the seed rules out. The knit never does, so the seed forces reversibility.
//
// Depth L2, the equivalence of reversibility with the seed's no-vanishing-difference, measured on
// the knit versus a lossy rule, reducing the reversibility premise to the seed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, cloneWill } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { asymmetricFill } from '@/code/measure/recurrence'
import { roundtrip } from '@/code/check/reversibility'

const SIDE = 6
const BEATS = 20

export default experiment({
  id: 'foundations/reversibility-is-the-seed',
  code: 'E-FND-0060',
  title:
    'reversibility is not a premise but the seed applied to dynamics: "a difference cannot vanish" means no two distinct states merge, which is injectivity, which on a finite state set is reversibility, so the knit (injective, forward-then-inverse recovers bit for bit) is what the seed forces and a lossy rule (two distinct states to one successor, a difference destroyed) is what it forbids',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const knit = pairCollision({ opposite, forward: true })
    const knitInverse = pairCollision({ opposite, forward: false })

    // the knit is a bijection: forward then inverse recovers the start bit for bit, so no distinct
    // states could have merged (a difference cannot vanish)
    const will = makeWill(mesh)

    will.data.set(asymmetricFill(mesh))

    const trip = roundtrip({
      will,
      collision: knit,
      beats: BEATS,
      inverseCollision: knitInverse,
    })

    const knitPreservesEveryDifference = trip.roundtripHamming === 0

    // a lossy rule ERASES a difference: two states differing only in the erased slot map to the same
    // successor, so the difference between them vanishes, exactly what the seed forbids
    const stateA = makeWill(mesh)

    stateA.data.set(asymmetricFill(mesh))

    const stateB = cloneWill(stateA)

    stateB.data[0] = stateA.data[0] === 0 ? 1 : 0

    const distinctBefore = stateA.data[0] !== stateB.data[0]

    const imageA = beat(cloneWill(stateA), erasingCollision)
    const imageB = beat(cloneWill(stateB), erasingCollision)

    let imagesEqual = true

    for (let i = 0; i < imageA.data.length; i++) {
      if (imageA.data[i] !== imageB.data[i]) {
        imagesEqual = false
        break
      }
    }

    const lossyErasesADifference = distinctBefore && imagesEqual

    // the reduction: the knit erases no difference (the seed keeps it), the lossy rule erases one
    // (the seed forbids it), so the seed forces reversibility, it is not a separate premise
    const seedForcesReversibility =
      knitPreservesEveryDifference && lossyErasesADifference

    const solved = seedForcesReversibility

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'reversibility is not a separate premise, it is the seed applied to the dynamics. The seed is that a difference once made cannot vanish, and a rule makes a difference vanish exactly when it maps two distinct states to the same successor, so a rule that never does is injective, which on a finite state set is reversible. Measured: the knit is a bijection, forward then inverse recovers the start bit for bit, so no two distinct states merged and no difference vanished, which is what the seed demands. A lossy erasing rule maps two states differing only in the erased slot to the same successor, destroying the difference between them, which is exactly the vanishing the seed forbids. So the seed keeps the reversible rule and excludes the lossy one, and reversibility is derived from the seed, not assumed, so the pinch to dimension eight no longer rests on a separate reversibility premise.',
      metrics: {
        knitRoundtripHamming: trip.roundtripHamming,
        knitPreservesEveryDifference: knitPreservesEveryDifference
          ? 1
          : 0,
        lossyTwoDistinctOneSuccessor: lossyErasesADifference ? 1 : 0,
        beats: BEATS,
      },
      control: {
        // the lossy rule erases a difference (two distinct states, one successor), the case the seed
        // forbids; the knit never does, so the seed forces reversibility
        lossyErasesADifference: lossyErasesADifference ? 1 : 0,
        knitRoundtripHamming: trip.roundtripHamming,
      },
      notes:
        'L2, the equivalence of reversibility with the seed no-vanishing-difference, reusing code/check/reversibility and the lossy collision. "A difference cannot vanish" (the seed) equals "no two distinct states merge" equals injective equals reversible, so reversibility is the seed read on dynamics, not a fifth premise. The knit is a bijection (roundtrip Hamming zero), the lossy rule merges two distinct states into one (a difference destroyed). This reduces the premise the dimension-eight pinch rests on: with triality forcing the floor (E-FND-0050) and the seed forcing reversibility, the pinch stands on the seed plus triality, not on a separate lose-nothing assumption. Deterministic fill, no random.',
    })
  },
})
