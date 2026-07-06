// The Born rule from norm concentration, a route independent of envariance. The standing debate
// is whether the envariance derivation (E-QTM-0012) smuggles in probability assumptions. This
// experiment uses only two ingredients, neither probabilistic: the conserved squared norm (the
// substrate's exactness result, Pythagoras over orthogonal branches) and unitary invariance. For
// N copies of a superposition, the branches whose outcome frequency deviates from the squared
// amplitude have a combined squared NORM that vanishes as N grows: whatever weight respects the
// conserved norm must land the Born frequency in the large-N limit.
//
// The rival measure, branch COUNTING (every branch weighted equally), fails twice, and both
// failures are computed. It concentrates at frequency one half for EVERY state, so it carries no
// information about the state at all: at large N the counting measure declares the Born-frequency
// window itself deviant (its count goes to one). And it is not invariant under unitary
// refinement: splitting one branch into two by a unitary on an ancilla changes the count of
// outcome zero from one half to two thirds while the norm stays exactly at the squared amplitude,
// so counting contradicts unitary invariance while the norm measure is preserved by it.
//
// Depth L1. It confirms the norm-concentration route to the Born rule (the finite-copies
// frequency-operator argument) with the counting-measure double control, known mathematics. The
// limitations of the route (the ordering of limits, the meaning of norm weight for a single
// case) are the standing literature debate and are not settled here, stated plainly.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  deviantBranchNorm,
  deviantBranchCount,
  refinementShift,
} from '@/code/measure/born-branches'

const WEIGHT = 0.64
const EPSILON = 0.05
const COPIES = [64, 256, 1024, 4096]

export default experiment({
  id: 'quantum/born-norm-concentration',
  code: 'E-QTM-0067',
  title:
    'the conserved norm concentrates branch weight on the Born frequency (deviant norm falling ten orders across the copy sweep) while branch counting concentrates at one half for every state and breaks under unitary refinement',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // the deviant-branch norm vanishes as copies grow
    const norms = COPIES.map(copies =>
      deviantBranchNorm({ weight: WEIGHT, copies, epsilon: EPSILON }),
    )

    let shrinking = true

    for (let i = 1; i < norms.length; i++) {
      if (norms[i]! >= norms[i - 1]!) {
        shrinking = false
      }
    }

    const finalNorm = norms[norms.length - 1]!
    const decades = Math.log10(norms[0]! / finalNorm)

    // the counting measure declares the Born window deviant (its deviant count goes to one)
    const countAtBorn = deviantBranchCount({
      copies: COPIES[COPIES.length - 1]!,
      target: WEIGHT,
      epsilon: EPSILON,
    })

    // and counting is not invariant under unitary refinement, while the norm is
    const shift = refinementShift(1 - WEIGHT)
    const countShifts =
      Math.abs(shift.countAfter - shift.countBefore) > 0.1

    const normInvariant = shift.normAfter === shift.normBefore

    const concentrates = shrinking && finalNorm < 1e-9 && decades > 8

    const countingFails = countAtBorn > 0.99

    const ok =
      concentrates && countingFails && countShifts && normInvariant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the combined squared norm of the branches whose outcome frequency deviates from the squared amplitude by more than five hundredths falls monotonically by more than eight orders of magnitude across the copy sweep to below one part in a billion (norm concentration on the Born frequency, using only Pythagoras over orthogonal branches and the conserved norm), while the branch-counting measure concentrates at one half for every state so it assigns the Born window itself a deviant count above ninety-nine percent, and counting shifts from one half to two thirds under a unitary refinement that leaves the norm exactly unchanged, so any weight consistent with the conserved norm and unitary invariance must give Born frequencies, and counting is consistent with neither',
      metrics: {
        deviantNormAt64: Number(norms[0]!.toExponential(2)),
        deviantNormAt4096: Number(finalNorm.toExponential(2)),
        decadesFallen: Number(decades.toFixed(1)),
        countingDeviantAtBorn: Number(countAtBorn.toFixed(4)),
        countAfterRefinement: Number(shift.countAfter.toFixed(4)),
      },
      // CONTROL: counting concentrates away from Born and shifts under refinement.
      control: {
        countingDeviantAtBorn: Number(countAtBorn.toFixed(4)),
      },
      notes:
        'Norm-concentration route to the Born rule (frequency-operator, Finkelstein-Graham-Hartle style), independent of envariance (E-QTM-0012). Counting-measure double control: state-independence and refinement instability. The limit-ordering debate is the standing literature caveat, stated plainly.',
    })
  },
})
