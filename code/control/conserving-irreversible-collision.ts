// A collision that CONSERVES charge exactly but is NOT invertible, the control that separates
// conservation from recoverability. It sorts each cell's slots into canonical order (all the minus
// tones first, then the zeros, then the plus tones) by a counting sort over the three tone values.
//
// Sorting permutes the multiset of a cell's slot values, so the per-cell charge, and therefore the
// total charge, is preserved to the integer. It is many-to-one, because every arrangement of the
// same multiset lands on the same sorted arrangement, so which direction carried which tone is
// destroyed and no inverse exists.
//
// This is the case Herbert names in the Chronoflux governing regime: a quantity can be conserved
// while the field carrying it becomes unrecoverable. Conservation is a strictly weaker gate than
// recoverability, and this collision is the lattice witness for that gap. The erasing collision in
// `lossy-collision` fails BOTH gates, so the pair brackets the distinction.

import { Collision } from '@/code/rule/collision'

export const sortingCollision: Collision = (slots, base, degree) => {
  let minus = 0
  let zero = 0

  for (let d = 0; d < degree; d++) {
    const value = slots[base + d]!

    if (value < 0) {
      minus++
    } else if (value === 0) {
      zero++
    }
  }

  const zeroEnd = minus + zero

  for (let d = 0; d < degree; d++) {
    slots[base + d] = d < minus ? -1 : d < zeroEnd ? 0 : 1
  }
}
