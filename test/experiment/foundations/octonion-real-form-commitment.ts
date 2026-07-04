// The real-form commitment, the fork Gogberashvili takes and vibe does not
// (merab-gogberashvili-split-octonions in the related-theories census). Gogberashvili builds
// Standard Model particles as the primitive ZERO DIVISORS of the SPLIT octonions, which need
// the split real form (signature (4,4), a noncompact G2). Those zero divisors are IMPOSSIBLE
// in the division octonions, the positive-definite form (signature (8,0), a compact G2) that
// vibe's {3,4,3,4} / D4 / F4 geometry grows from. This experiment pins the commitment: the
// division octonions (Cayley-Dickson level 3) have no zero divisors and satisfy norm
// composition, so vibe's base cannot host a zero-divisor particle mechanism, while the next
// level up (the sedenions, level 4, the first place zero divisors appear) does, which is the
// control that shows the test discriminates. Adopting Gogberashvili's split fork would mean
// abandoning the positive-definite norm the selection arguments for {3,4,3,4} rely on.
//
// Depth L1, an established fact of the Cayley-Dickson tower (the octonions are the last
// division algebra), confirmed on the tower with the sedenion level the discriminating
// control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  hasZeroDivisor,
  hasNormComposition,
} from '@/code/measure/division-algebra'

const OCTONION_LEVEL = 3 // Cayley-Dickson level 3, dimension 8, the division octonions
const SEDENION_LEVEL = 4 // level 4, dimension 16, the first level with zero divisors

export default experiment({
  id: 'foundations/octonion-real-form-commitment',
  code: 'E-FND-0047',
  title:
    'vibe commits to the division octonions (no zero divisors, norm composition, compact G2), so it cannot host Gogberashvili split-octonion zero-divisor particles, the road not taken',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const divisionHasZeroDivisor = hasZeroDivisor(OCTONION_LEVEL)
    const divisionComposes = hasNormComposition(OCTONION_LEVEL)
    // the control: the next level up (sedenions) is where zero divisors first appear and
    // norm composition first fails, so the same tests give the opposite answer, the test
    // is not vacuous.
    const sedenionHasZeroDivisor = hasZeroDivisor(SEDENION_LEVEL)
    const sedenionComposes = hasNormComposition(SEDENION_LEVEL)

    const divisionIsClean = !divisionHasZeroDivisor && divisionComposes
    const controlDiscriminates =
      sedenionHasZeroDivisor && !sedenionComposes

    const ok = divisionIsClean && controlDiscriminates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'vibe commits to the division octonions, the positive-definite real form with a compact G2, and this form has no zero divisors and satisfies norm composition, so vibe base cannot host Gogberashvili particle mechanism, which builds Standard Model states as the primitive zero divisors of the SPLIT octonions (signature (4,4), noncompact G2). The next Cayley-Dickson level up, the sedenions, is the first place zero divisors appear and norm composition fails, the control that shows the test is not vacuous. So the split-octonion fork is a genuine road, and it is the one vibe does not take, because taking it would abandon the positive-definite norm the {3,4,3,4} selection arguments rely on. Depth L1, an established fact of the Cayley-Dickson tower confirmed on the tower.',
      metrics: {
        divisionHasZeroDivisor: divisionHasZeroDivisor ? 1 : 0,
        divisionComposes: divisionComposes ? 1 : 0,
        sedenionHasZeroDivisor: sedenionHasZeroDivisor ? 1 : 0,
        sedenionComposes: sedenionComposes ? 1 : 0,
      },
      control: {
        sedenionHasZeroDivisor: sedenionHasZeroDivisor ? 1 : 0,
      },
      notes:
        'the two real forms of the octonions are the division form (positive-definite, compact G2, no zero divisors) and the split form (signature (4,4), noncompact G2, with zero divisors). vibe D4 / 24-cell / F4 geometry is the compact division side, so the zero-divisor particle mechanism is structurally unavailable, not merely unused. The sedenion control confirms the measure flips where it should. This scopes which real form vibe is committed to, an algebra fact, so it is L1.',
    })
  },
})
