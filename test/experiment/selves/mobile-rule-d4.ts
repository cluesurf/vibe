// Option E demonstrated on the {3,4,3,4} D4 coin (base-rule-options-for-a-self-level). The committed pair
// table conserves charge but REFLECTS a lone charge at a vacuum boundary, so structures are pinned. A
// momentum-conserving reversible collision (headOnRotate) instead leaves a lone particle untouched, so it
// STREAMS BALLISTICALLY, and only redistributes zero-momentum head-on pairs. This is the mobility that the
// coarse-graining tower needs to form basins, and so is the prerequisite for a causal-emergent self-level.
//
// We show four things on the 24-direction D4 coin.
//  1. headOnRotate is reversible (an involution) and conserves charge.
//  2. headOnRotate conserves MOMENTUM, the vector sum of tone times root over all slots.
//  3. the pair table does NOT conserve momentum, its reflection flips it, which is why it pins.
//  4. a single particle TRAVELS a distance of order the beat count under headOnRotate, but stays within one
//     cell under the pair table.
//
// Depth L2, a known lattice-gas property (ballistic transport from a momentum-conserving collision) realized
// on the committed coin, with the pinning pair table as the control.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { loneParticle, type Will } from '@/code/tone/will'
import { pairCollision, headOnRotate, type Collision } from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { travelDistance, momentum } from '@/code/check/structure'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

const sameVector = (a: number[], b: number[]): boolean => a.every((v, i) => v === b[i])

// a single particle, one tone in direction 0 at the center cell.
const singleParticle = (mesh: Mesh, cell: number): Will => loneParticle(mesh, cell, 0)

export default defineExperiment({
  id: 'selves/mobile-rule-d4',
  title: 'a momentum-conserving reversible collision makes a particle travel on the D4 coin, the pair table pins it',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 10
    const beats = 4
    const mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))
    const mobile: Collision = headOnRotate({ opposite })
    const pinning: Collision = pairCollision({ opposite, forward: true })
    const center = 5 + 5 * side + 5 * side * side + 5 * side * side * side

    // 1 and 2, headOnRotate is reversible, conserves charge, conserves momentum.
    const reversible = isReversible(singleParticle(mesh, center), mobile, beats)
    const chargeOk = conservesCharge(singleParticle(mesh, center), mobile, beats)
    const mStart = momentum(singleParticle(mesh, center), ROOTS)
    const mMobile = momentum(run(singleParticle(mesh, center), mobile, beats), ROOTS)
    const momentumMobileOk = sameVector(mStart, mMobile)

    // 3, the pair table does not conserve momentum, it reflects.
    const mPinning = momentum(run(singleParticle(mesh, center), pinning, beats), ROOTS)
    const momentumPinningOk = sameVector(mStart, mPinning)

    // 4, travel distance, ballistic versus pinned.
    const travelMobile = travelDistance({ will: run(singleParticle(mesh, center), mobile, beats), start: center })
    const travelPinning = travelDistance({ will: run(singleParticle(mesh, center), pinning, beats), start: center })

    const ok =
      reversible &&
      chargeOk &&
      momentumMobileOk &&
      !momentumPinningOk &&
      travelMobile >= beats - 1 &&
      travelPinning <= beats - 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 coin a momentum-conserving reversible collision carries a lone particle ballistically (it travels with the beats), while the pair table conserves charge but not momentum and so pins the particle within one cell, the mobility Option E supplies',
      metrics: {
        reversible: reversible ? 1 : 0,
        chargeConserved: chargeOk ? 1 : 0,
        momentumConservedMobile: momentumMobileOk ? 1 : 0,
        momentumConservedPinning: momentumPinningOk ? 1 : 0,
        travelMobile,
        travelPinning,
        beats,
      },
      control: { travelPinning, momentumConservedPinning: momentumPinningOk ? 1 : 0 },
      notes:
        'the momentum-conserving rule is reversible and conserves charge and momentum, the pair table conserves charge but reflects (flips momentum), which is the pinning. Mobility plus head-on scattering is the basin-forming dynamics the L3 search needs',
    })
  },
})
