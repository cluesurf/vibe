// Record-preserving paths, the other half of the Timeless Dynamics bridge
// (timeless-dynamics in the related-theories census). TD needs its paths to be
// record-preserving, distinguishability once made is not lost, and that is exactly what its
// emergent time is accumulated along. Vibe makes the same demand under a different name: the
// knit is REVERSIBLE, so it erases nothing, so a record made is a record kept. This
// experiment measures that the two names point at one property.
//
// The exact test of record-preservation is recoverability. Run the reversible knit forward,
// then run its inverse the same number of beats, and the initial state comes back BIT FOR
// BIT, zero slots changed, the record perfectly intact. The control is a lossy,
// record-destroying rule (an erasing collision): the same forward-then-inverse cannot recover
// the start, a fraction of the slots are gone for good, the record destroyed. So the
// reversible knit is a record-preserving path and the lossy rule is not, which is the
// condition TD builds its emergent time on.
//
// Depth L2, the exact integer recoverability of the reversible knit read through TD
// record-preservation, with the lossy rule the control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { roundtrip } from '@/code/check/reversibility'

const SIDE = 8
const BEATS = 30

export default experiment({
  id: 'foundations/record-preserving-paths',
  code: 'E-FND-0049',
  title:
    'the reversible knit is a record-preserving path (forward then inverse recovers the start bit for bit) while a lossy rule destroys the record, the condition Timeless Dynamics builds emergent time on',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const slots = mesh.cellCount * mesh.degree

    // the reversible record-preserving path: forward then inverse recovers the start exactly
    const reversibleWill = makeWill(mesh)
    fillWillPattern(reversibleWill)

    const reversible = roundtrip({
      will: reversibleWill,
      collision: pairCollision({ opposite, forward: true }),
      beats: BEATS,
      inverseCollision: pairCollision({ opposite, forward: false }),
    })

    // the lossy control: an erasing rule destroys the record, recovery fails on a fraction
    const lossyWill = makeWill(mesh)
    fillWillPattern(lossyWill)

    const lossy = roundtrip({
      will: lossyWill,
      collision: erasingCollision,
      beats: BEATS,
      inverseCollision: pairCollision({ opposite, forward: false }),
    })

    const recordKept = reversible.roundtripHamming === 0
    const recordDestroyed = lossy.roundtripHamming > 0
    const ok = recordKept && recordDestroyed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible knit is a record-preserving path in the exact sense Timeless Dynamics needs. Run it forward for thirty beats then run its inverse for thirty, and the initial state returns bit for bit, zero of the ninety-eight thousand slots changed, the record perfectly intact and every distinction recoverable. A lossy erasing rule is not record-preserving: the same forward-then-inverse cannot recover the start, a definite fraction of the slots are lost for good. So record-preservation and reversibility are one property under two names, which is the condition TD accumulates its emergent time along and the resonance the tone author asked about. Depth L2, exact integer recoverability read through TD record-preservation, the lossy rule the control.',
      metrics: {
        reversibleHamming: reversible.roundtripHamming,
        lossyHamming: lossy.roundtripHamming,
        totalSlots: slots,
        lossyFractionLost: lossy.roundtripHamming / slots,
      },
      control: {
        lossyHamming: lossy.roundtripHamming,
      },
      notes:
        'record-preservation is measured as EXACT recoverability, an integer Hamming distance of zero after the forward-inverse round trip, not a tolerance. The reversible knit recovers every slot, the erasing control loses a definite fraction. This is the same reversibility the substrate already has, read here as the record-preserving condition TD emergent time requires, so the two frameworks share this backbone exactly. Deterministic fill, no random.',
    })
  },
})
