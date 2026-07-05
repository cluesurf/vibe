// Celestial holography seed, the memory corner of the infrared triangle, held
// open on purpose. Pasterski's triangle links a conserved boundary charge, a
// soft mode, and a memory, a permanent boundary shift after radiation passes.
// On a conserved current the permanent shift of a boundary region equals the net
// flux through its cuts, exactly, by the continuity equation. We verify that
// continuity here on a deterministic streaming chain, integer-exact.
//
// But that identity is the continuity equation itself, the tautology the
// methodology names (a boundary shift defined as an integrated flux, then found
// to equal the integrated flux). A genuine memory effect, distinct from
// continuity, needs a boundary observable that is not the conserved charge, a
// permanent displacement, phase, or winding predicted by, not defined as, the
// flux. The substrate does not yet provide one.
//
// So the status is OPEN. The continuity consistency passes as a check, but the
// memory-as-emergence claim is not made. It becomes testable once vibe has a
// boundary observable independent of the conserved charge, which itself leans on
// the emergent Lorentzian spacetime vibe has not built. Depth L1 for the
// consistency, the emergent claim open.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a deterministic charge profile on a periodic chain, no random
const CHARGES = [3, 1, 4, 1, 5, 9, 2, 6]
// the two cuts bounding the region [LEFT_CUT + 1 .. RIGHT_CUT]
const LEFT_CUT = 3
const RIGHT_CUT = 7

// stream every charge one cell to the right on the periodic chain
function streamRight(charges: number[]): number[] {
  const n = charges.length

  return charges.map((_, i) => charges[(i - 1 + n) % n]!)
}

function regionCharge(
  charges: number[],
  from: number,
  to: number,
): number {
  let sum = 0

  for (let i = from; i <= to; i++) {
    sum += charges[i]!
  }

  return sum
}

export default experiment({
  id: 'holography/celestial-memory-continuity',
  code: 'E-HLG-0028',
  title:
    'the memory corner is held open, the boundary shift equals the integrated flux by continuity, which is not yet an emergent memory',
  category: 'holography',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const before = CHARGES
    const after = streamRight(before)

    // the permanent shift of the region [4..7]
    const regionBefore = regionCharge(before, LEFT_CUT + 1, RIGHT_CUT)
    const regionAfter = regionCharge(after, LEFT_CUT + 1, RIGHT_CUT)
    const shift = regionAfter - regionBefore

    // the net flux into the region: inflow across the left cut (charge that was
    // at LEFT_CUT moves in) minus outflow across the right cut (charge at
    // RIGHT_CUT moves out to the next cell past the region)
    const inflow = before[LEFT_CUT]!
    const outflow = before[RIGHT_CUT]!
    const netFlux = inflow - outflow

    const continuityResidual = Math.abs(shift - netFlux)
    const continuityHolds = continuityResidual === 0

    return verdict({
      // OPEN, not pass: the continuity consistency holds, but the emergent
      // memory claim is gated on a boundary observable independent of the charge
      status: continuityHolds ? 'open' : 'fail',
      claim:
        'the permanent shift of a boundary region equals the net flux by continuity, an exact consistency, but a genuine memory effect distinct from continuity needs a boundary observable independent of the conserved charge, which the substrate does not yet provide, so this corner stays open',
      metrics: {
        regionShift: shift,
        netFlux,
        continuityResidual,
      },
    })
  },
})
