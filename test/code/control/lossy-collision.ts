// Conformance for code/control/lossy-collision: the erasing collision, the negative control for the
// reversibility experiments. It is genuinely lossy: it zeroes slot `base` of each cell, so it cannot be
// a charge-conserving reversible map, and a forward-then-backward run does NOT recover the start
// (round-trip Hamming > 0). A real involution collision, by contrast, recovers exactly (Hamming 0),
// which is what makes the erasing control a true negative.

import { suite, check, equal, ok } from '@/test/code/harness'
import { erasingCollision } from '@/code/control/lossy-collision'
import { roundtrip } from '@/code/check/reversibility'
import { momentumRotate2D } from '@/code/rule/collision'
import { squareMesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, charge } from '@/code/tone/will'

suite('control/lossy-collision: the erase destroys one slot', [
  // Directly: only slot `base` is zeroed, the other slots of the cell are untouched.
  check('it zeroes slot base and leaves the rest', () => {
    const slots = Int8Array.from([1, -1, 1, -1])
    erasingCollision(slots, 0, 4)
    equal(slots[0]!, 0, 'slot base is erased')
    equal(slots[1]!, -1, 'other slots untouched')
    equal(slots[2]!, 1)
    equal(slots[3]!, -1)
  }),
])

suite('control/lossy-collision: it is a genuine negative', [
  // A structured will carries information; erasing slot 0 each beat loses it, so the round-trip cannot
  // recover the start.
  check('the erasing collision fails the round-trip (Hamming > 0)', () => {
    const square = squareMesh({ side: 4 })
    const will = makeWill(square)
    fillWillPattern(will)
    ok(charge(will) !== 0, 'the will must carry information to lose')
    const { roundtripHamming } = roundtrip({
      will,
      collision: erasingCollision,
      beats: 2,
    })
    ok(roundtripHamming > 0, 'an erasing collision cannot be inverted')
  }),
  // The contrast: a real involution recovers the start exactly, proving the failure above is the
  // erasing, not the harness.
  check('a real involution recovers exactly (Hamming 0)', () => {
    const square = squareMesh({ side: 4 })
    const will = makeWill(square)
    fillWillPattern(will)
    const { roundtripHamming } = roundtrip({
      will,
      collision: momentumRotate2D,
      beats: 5,
    })
    equal(roundtripHamming, 0, 'an involution is reversible')
  }),
])
