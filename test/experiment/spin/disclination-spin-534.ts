// SK2 (spin from a topological DEFECT, the second {5,3,4} spin route): the 12 directions of the {5,3,4}
// coin carry no spinor (the S01 result). SK1 got spin from the form complex (Kahler-Dirac). This gets it
// a different way, from a DISCLINATION in the director field (the tone read as an axis, n identified with
// -n). We seed a winding-w disclination, parallel-transport a probe around a loop enclosing it, and read
// the holonomy in both representations.
//
//   - SPINOR: the holonomy is (-1)^w. An ODD-winding (half) disclination flips the spinor sign, the
//     double-cover -1. Spin-half, produced by the topological defect, with no spinor on the links.
//   - VECTOR (the control): the holonomy is ALWAYS +1. The defect is INVISIBLE to vectors (the frame
//     rotates by a multiple of 2 pi). This is what makes the spinor -1 a SPIN effect and not a trivial
//     rotation. If the defect were visible to vectors too, it would not be spin-specific.
//
// The result is purely topological: it does not depend on how finely the loop is discretized (the same
// holonomy at every step count), the Z_2 charge of the defect. So {5,3,4} hosts spin-half through a tone
// defect even though its coin is spinless, a second independent spin route alongside SK1 Kahler-Dirac.

import { disclinationHolonomy } from '@/code/algebra/group/disclination'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const WINDINGS = [0, 1, 2, 3, 4]
const STEP_COUNTS = [12, 24, 36, 60] // loop discretizations, the holonomy must not depend on these

export function disclinationSpin(): {
  spinorParityCorrect: boolean
  oddDisclinationFlipsSpinor: boolean
  vectorAlwaysReturns: boolean
  topological: boolean
} {
  // at the canonical discretization, the spinor holonomy must equal (-1)^winding
  let spinorParityCorrect = true
  let vectorAlwaysReturns = true
  for (const winding of WINDINGS) {
    const h = disclinationHolonomy({ winding, steps: 24 })
    const expectMinusOne = winding % 2 === 1
    const spinorMatches = expectMinusOne
      ? h.spinorIsMinusOne
      : h.spinorIsPlusOne
    if (!spinorMatches) spinorParityCorrect = false
    if (!h.vectorReturnsToSelf) vectorAlwaysReturns = false
  }

  // the headline: a single (odd, half) disclination flips the spinor while the vector is unmoved
  const odd = disclinationHolonomy({ winding: 1, steps: 24 })
  const oddDisclinationFlipsSpinor =
    odd.spinorIsMinusOne && odd.vectorReturnsToSelf

  // topological: the holonomy is independent of the loop discretization
  let topological = true
  for (const winding of WINDINGS) {
    const base = disclinationHolonomy({
      winding,
      steps: STEP_COUNTS[0]!,
    })
    for (const steps of STEP_COUNTS) {
      const h = disclinationHolonomy({ winding, steps })
      if (
        h.spinorIsMinusOne !== base.spinorIsMinusOne ||
        h.spinorIsPlusOne !== base.spinorIsPlusOne
      ) {
        topological = false
      }
    }
  }

  return {
    spinorParityCorrect,
    oddDisclinationFlipsSpinor,
    vectorAlwaysReturns,
    topological,
  }
}

export default experiment({
  id: 'spin/disclination-spin-534',
  title:
    'a half-winding disclination in the {5,3,4} director field gives the spinor a minus sign while the vector is blind, spin from topology',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = disclinationSpin()
    const ok =
      r.spinorParityCorrect &&
      r.oddDisclinationFlipsSpinor &&
      r.vectorAlwaysReturns &&
      r.topological
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'parallel-transporting a probe around a winding-w disclination in the director field gives the spinor the double-cover holonomy (-1)^w, so an odd (half) disclination flips the spinor sign, while the vector holonomy is always +1 (the defect is invisible to vectors), and the result is purely topological, independent of the loop discretization, so {5,3,4} hosts spin-half through a tone defect with no spinor on its coin',
      metrics: {
        spinorParityCorrect: r.spinorParityCorrect ? 1 : 0,
        oddDisclinationFlipsSpinor: r.oddDisclinationFlipsSpinor
          ? 1
          : 0,
        vectorAlwaysReturns: r.vectorAlwaysReturns ? 1 : 0,
        topological: r.topological ? 1 : 0,
      },
      control: {
        // the vector holonomy is +1 for EVERY winding: the defect does not move vectors, so the spinor
        // -1 is a genuine spin effect and not a trivial frame rotation. Even winding gives spinor +1 too,
        // the Z_2 nature, so only the odd (half) defect carries the spin.
        vectorAlwaysReturns: r.vectorAlwaysReturns ? 1 : 0,
      },
      notes:
        'L2, known physics (the nematic-disclination / Z_2 defect mechanism), realized as a defect in the {5,3,4} tone-director field. This is a SECOND, independent spin route on {5,3,4}, complementing SK1 (spin/kahler-dirac-534 and spin/kahler-dirac-propagation-534, spin from the form complex). The spinor -1 comes from the DEFECT, not from any spinor structure on the 12-direction coin, which carries none. The vector control (always +1) makes it spin-specific, and the result is topological (step-count independent). It uses the abstract director winding, the embedding of a concrete disclination into the full {5,3,4} cell adjacency is the open refinement, as in spin/spin-connection-534.',
    })
  },
})
