// Head-on scattering on the {3,4,3,4} D4 coin under the momentum-conserving collision (headOnRotate). Mobility
// alone is not enough for a self-forming dynamics, particles must also INTERACT. The pair table interacts but
// pins, the streaming-only rule (passThrough) moves but never interacts (particles cross straight through). The
// momentum-conserving collision does both, two particles that meet head-on are DEFLECTED onto a rotated axis,
// not passed through, and the whole event is reversible and momentum-conserving.
//
// We show three things.
//  1. DEFLECTION, a head-on pair sitting on one direction-line is rotated by one collide onto a different line,
//     so its axis of travel changes, while passThrough leaves it on its incoming line (a straight crossing).
//  2. INTERACTION under full streaming, two particles launched head-on collide and emerge on a different axis,
//     so the final state differs from the non-interacting passThrough control where they cross unchanged.
//  3. The collision conserves momentum and the entire scattering event is reversible (an involution beat).
//
// Depth L2, the lattice-gas scattering property (a momentum-conserving collision deflects a head-on pair)
// realized on the committed coin, with passThrough (free crossing) as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, charge, type Will } from '@/code/tone/will'
import {
  passThrough,
  headOnRotate,
  type Collision,
} from '@/code/rule/collision'
import { collide, run } from '@/code/rule/lattice-gas'
import { isReversible } from '@/code/check/invariant'
import { momentum } from '@/code/check/structure'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

const sameVector = (a: number[], b: number[]): boolean =>
  a.every((v, i) => v === b[i])

const differs = (a: Will, b: Will): boolean =>
  a.data.some((v, i) => v !== b.data[i])

export default experiment({
  id: 'selves/scatter-d4',
  title:
    'a head-on pair is deflected onto a rotated axis by the momentum-conserving collision, not passed through',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 8
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const mobile: Collision = headOnRotate({ opposite })
    const center =
      4 + 4 * side + 4 * side * side + 4 * side * side * side

    // direction 0 and its opposite, the first incoming line.
    const dir = 0
    const opp = mesh.opposite(dir)

    // 1, DEFLECTION. A head-on pair (s, s) on line (dir, opp) at the center cell.
    const headOn = makeWill(mesh)
    headOn.data[center * degree + dir] = 1
    headOn.data[center * degree + opp] = 1

    const mBeforePair = momentum(headOn, ROOTS)

    const deflected = { mesh, data: headOn.data.slice() }
    collide(deflected, mobile)

    // after the momentum-conserving collide the incoming line is empty (the pair moved to its partner line).
    const incomingEmptied =
      deflected.data[center * degree + dir] === 0 &&
      deflected.data[center * degree + opp] === 0

    const stillTwoCharges =
      deflected.data.reduce((s, v) => s + Math.abs(v), 0) === 2

    const deflectMomentumOk = sameVector(
      mBeforePair,
      momentum(deflected, ROOTS),
    )

    // the control, passThrough leaves the pair on its incoming line (a straight crossing, no deflection).
    const crossed = { mesh, data: headOn.data.slice() }
    collide(crossed, passThrough)

    const crossingStays =
      crossed.data[center * degree + dir] === 1 &&
      crossed.data[center * degree + opp] === 1

    // 2, INTERACTION under full streaming. Two particles one step apart on the same line, approaching head-on.
    // After streaming they coincide at the center as a head-on pair, then collide and recede on a rotated axis.
    const approach = makeWill(mesh)
    approach.data[mesh.neighbour(center, opp) * degree + dir] = 1 // streams forward into the center along dir
    approach.data[mesh.neighbour(center, dir) * degree + opp] = 1 // streams back into the center along opp

    const beats = 4
    const mStart = momentum(approach, ROOTS)

    const scattered = run(
      { mesh, data: approach.data.slice() },
      mobile,
      beats,
    )

    const crossedRun = run(
      { mesh, data: approach.data.slice() },
      passThrough,
      beats,
    )

    const interacted = differs(scattered, crossedRun)
    const runMomentumOk = sameVector(mStart, momentum(scattered, ROOTS))
    const chargeOk = charge(scattered) === charge(approach)

    // 3, the scattering event is reversible.
    const reversible = isReversible(
      { mesh, data: approach.data.slice() },
      mobile,
      beats,
    )

    const ok =
      incomingEmptied &&
      stillTwoCharges &&
      deflectMomentumOk &&
      crossingStays &&
      interacted &&
      runMomentumOk &&
      chargeOk &&
      reversible

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 coin the momentum-conserving collision deflects a head-on pair onto a rotated axis (the incoming line empties, the partner line fills) and two particles launched head-on scatter to a state distinct from the free-crossing control, conserving charge and momentum and remaining reversible',
      metrics: {
        incomingEmptied: incomingEmptied ? 1 : 0,
        stillTwoCharges: stillTwoCharges ? 1 : 0,
        deflectMomentumConserved: deflectMomentumOk ? 1 : 0,
        crossingStaysUnderPassThrough: crossingStays ? 1 : 0,
        interactedVsCrossingControl: interacted ? 1 : 0,
        runMomentumConserved: runMomentumOk ? 1 : 0,
        chargeConserved: chargeOk ? 1 : 0,
        reversible: reversible ? 1 : 0,
        beats,
      },
      control: {
        crossingStaysUnderPassThrough: crossingStays ? 1 : 0,
        interactedVsCrossingControl: interacted ? 1 : 0,
      },
      notes:
        'deflection plus mobility is the basin-forming interaction the self-level search needs, the pair table interacts but pins, passThrough moves but never interacts (particles cross straight through), the momentum-conserving collision does both and stays reversible',
    })
  },
})
