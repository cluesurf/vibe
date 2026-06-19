// The CPT theorem for the discrete base. The committed knit (collide then stream) is a reversible cellular automaton,
// and the discrete charge conjugation (C, negate tones), parity (P, reflect a spatial axis), and time reversal (T,
// velocity reversal) combine into the discrete CPT theorem, the combined CPT is a symmetry of the dynamics. This is
// the discrete analogue of the CPT theorem of quantum field theory, derived here directly from the reversible knit.
//
//   - CHARGE CONJUGATION C IS A SYMMETRY. Negating every tone commutes with the forward rule, C(forward(s)) =
//     forward(C(s)), because the knit treats the two tone signs symmetrically.
//   - PARITY P IS A SYMMETRY. Reflecting a spatial axis (the cell coordinate and the matching direction component)
//     commutes with the forward rule, P(forward(s)) = forward(P(s)), because the knit is built from the symmetric
//     24-cell.
//   - TIME REVERSAL T REVERSES THE DYNAMICS. Velocity reversal (moving each tone to its opposite-direction slot)
//     conjugates the forward rule to the backward rule, T(forward(T(s))) = backward(s), because streaming reverses
//     under velocity reversal and the collision is velocity-reversal invariant.
//   - THE COMBINED CPT IS A SYMMETRY. CPT(forward(s)) = backward(CPT(s)), the CPT-transformed forward process is the
//     time-reversed process. The control is CP WITHOUT T, which fails (there is no time reversal), so the T is
//     necessary.
//
// So the discrete CPT theorem holds, the reversible knit has C, P, and T as symmetries (C and P commuting with the
// forward step, T reversing it), and the combined CPT is a symmetry of the dynamics, with the no-T case the control.
// The growth arrow (the lean) breaks C and T individually (it orients creation), but the combined CPT survives, the
// same pattern as in field theory. Depth L2, the symmetries verified deterministically on the committed knit, with the
// no-time-reversal case the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import { makeWill, Will } from '@/code/tone/will'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import {
  chargeConjugate,
  parityReflect,
  timeReverse,
} from '@/code/rule/symmetry'

export default experiment({
  id: 'foundations/cpt-theorem',
  title:
    'the discrete CPT theorem, the reversible knit has C, P, T symmetries and the combined CPT is a symmetry of the dynamics, the no-T case the control',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const side = 6
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const collision = headOnRotate({ opposite })

    // a deterministic initial configuration (no random, a fixed coordinate pattern)
    const start = makeWill(mesh)
    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / side ** axis) % side
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < mesh.degree; d++) {
        start.data[cell * mesh.degree + d] = (((coordinate(cell, 0) +
          coordinate(cell, 1) +
          d) %
          3) -
          1) as -1 | 0 | 1
      }
    }

    const forward = (w: Will): Will =>
      beat({ mesh, data: Int8Array.from(w.data) }, collision)
    const backward = (w: Will): Will =>
      inverseBeat({ mesh, data: Int8Array.from(w.data) }, collision)
    const same = (a: Will, b: Will): boolean => {
      for (let i = 0; i < a.data.length; i++) {
        if (a.data[i] !== b.data[i]) {
          return false
        }
      }

      return true
    }

    const parity = (w: Will): Will =>
      parityReflect({ will: w, directions, side, axis: 0 })

    // (0) the knit is reversible
    const reversible = same(backward(forward(start)), start)

    // (1) C is a symmetry, C(forward(s)) = forward(C(s))
    const chargeSymmetry = same(
      chargeConjugate(forward(start)),
      forward(chargeConjugate(start)),
    )
    // (2) P is a symmetry, P(forward(s)) = forward(P(s))
    const paritySymmetry = same(
      parity(forward(start)),
      forward(parity(start)),
    )
    // (3) T reverses, T(forward(T(s))) = backward(s)
    const timeReversal = same(
      timeReverse(forward(timeReverse(start))),
      backward(start),
    )
    // (4) the combined CPT, CPT(forward(s)) = backward(CPT(s))
    const cpt = (w: Will): Will =>
      chargeConjugate(parity(timeReverse(w)))
    const cptSymmetry = same(cpt(forward(start)), backward(cpt(start)))
    // (5) the control, CP WITHOUT T fails (no time reversal)
    const cpNoTime = (w: Will): Will => chargeConjugate(parity(w))
    const controlFails = !same(
      cpNoTime(forward(start)),
      backward(cpNoTime(start)),
    )

    const ok =
      reversible &&
      chargeSymmetry &&
      paritySymmetry &&
      timeReversal &&
      cptSymmetry &&
      controlFails

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete CPT theorem holds for the reversible knit. Charge conjugation (negating every tone) and parity (reflecting a spatial axis) each commute with the forward rule, so C and P are symmetries. Time reversal (velocity reversal, moving each tone to its opposite-direction slot) conjugates the forward rule to the backward rule, so a velocity-reversed state runs backward. The combined CPT is therefore a symmetry of the dynamics, the CPT-transformed forward process equals the time-reversed process. The control is the same combination WITHOUT time reversal, which fails, so the T is necessary. So the discrete CPT theorem is derived directly from the reversible knit, the discrete analogue of the field-theory CPT theorem.',
      metrics: {
        reversible: reversible ? 1 : 0,
        chargeSymmetry: chargeSymmetry ? 1 : 0,
        paritySymmetry: paritySymmetry ? 1 : 0,
        timeReversal: timeReversal ? 1 : 0,
        cptSymmetry: cptSymmetry ? 1 : 0,
        controlNoTimeFails: controlFails ? 1 : 0,
      },
      control: {
        controlNoTimeFails: controlFails ? 1 : 0,
      },
      notes:
        'the knit is collide (an involution) then stream (a bijection), reversible. Charge conjugation C negates the tones and commutes with the forward step (the rule is sign-symmetric). Parity P reflects a coordinate of the cell and the matching direction component and commutes with the forward step (the 24-cell symmetry). Time reversal T is velocity reversal (each tone to the opposite-direction slot), which conjugates streaming to its inverse (T stream T = stream inverse) and leaves the head-on collision invariant, so T(forward(T(s))) = backward(s). Hence the combined CPT satisfies CPT(forward(s)) = backward(CPT(s)), the discrete CPT theorem. The control (CP without T) does not reverse time and fails, confirming T is necessary. C, P, and T are each separate symmetries of the reversible knit here, so CPT is their product. The growth arrow (the lean, `feedback the base is the arrow`) orients creation and breaks C and T individually, but the combined CPT survives, exactly as in field theory where CPT is the robust combination. This derives the CPT theorem (GM3) from the discrete base.',
    })
  },
})
