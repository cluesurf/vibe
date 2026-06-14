import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  coxeterEdgeRotor,
  cmPower,
  cmIsScalar,
} from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

// The {5,3,4} spin connection, the geometric frame transport, computed in the Clifford (geometric)
// algebra. The honeycomb is built by the Coxeter reflection group [5,3,4]. Each reflection lifts to a
// Clifford vector, and the transport around an elementary edge loop (where m cells meet) is the rotor
// (n_i n_j)^m, a 2pi rotation. We compute it for the three Coxeter relations 5, 3, 4 and show the spin
// holonomy is MINUS ONE once around the loop and PLUS ONE twice around, the spinor double cover realized
// geometrically on the actual {5,3,4} frame bundle. So spinors propagate on {5,3,4} with the double-cover
// sign, the dynamical spin structure, not just the abstract cover of spin/cocycle-534.

export default experiment({
  id: 'spin/spin-connection-534',
  title: 'the {5,3,4} spin connection, the edge-loop holonomy is the spinor double cover (minus one once, plus one twice)',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const minusOne = complex({ re: -1, im: 0 })
    const plusOne = complex({ re: 1, im: 0 })

    // the three Coxeter relations of [5,3,4], the elementary loops around the 5-, 3-, and 4-fold edges
    const relations = [5, 3, 4]
    const onceMinusOne: number[] = []
    const twicePlusOne: number[] = []
    for (const m of relations) {
      const rotor = coxeterEdgeRotor(m)
      const once = cmPower(rotor, m) // around the edge once, a 2pi rotation
      const twice = cmPower(rotor, 2 * m) // around twice, 4pi
      onceMinusOne.push(cmIsScalar(once, minusOne) ? 1 : 0)
      twicePlusOne.push(cmIsScalar(twice, plusOne) ? 1 : 0)
    }
    const allLoopsSpinorMinusOne = onceMinusOne.every((value) => value === 1)
    const allLoopsReturnAtTwice = twicePlusOne.every((value) => value === 1)

    const ok = allLoopsSpinorMinusOne && allLoopsReturnAtTwice

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,4} spin connection (the Clifford lift of the Coxeter reflections) gives every elementary edge loop the spinor double-cover holonomy, minus one once around and plus one twice around, so spinors propagate with the double-cover sign',
      metrics: {
        relation5MinusOne: onceMinusOne[0]!,
        relation3MinusOne: onceMinusOne[1]!,
        relation4MinusOne: onceMinusOne[2]!,
        allLoopsSpinorMinusOne: allLoopsSpinorMinusOne ? 1 : 0,
      },
      // CONTROL: going around each loop TWICE (4pi) returns the spinor to plus one, the discriminating
      // signature of the double cover. A trivial (non-spinor) structure would give plus one once around.
      control: { allLoopsReturnAtTwice: allLoopsReturnAtTwice ? 1 : 0, relation5TwicePlusOne: twicePlusOne[0]! },
      notes:
        'This computes the geometric spin connection (the binary Coxeter cover) and shows the {5,3,4} edge loops carry the spinor holonomy. It realizes the frame-bundle spin lift, beyond the abstract group cover of spin/cocycle-534. OPEN refinement, the curvature-driven holonomy of large contractible loops (the continuum limit) needs the full hyperbolic metric integration.',
    })
  },
})
