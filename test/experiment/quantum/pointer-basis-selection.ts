// Axis selection by the drain coupling: a drain coupled along one spatial axis writes a
// record along that axis and not along the orthogonal one. The bath here is the open
// frontier at the x = 0 slab, so the coupling is along x. We measure the record (the
// occupancy gradient) along x (the drain direction) AND along y (orthogonal to it). The
// OPEN system forms a definite, stable record along x but NOT along y. The CLOSED
// reversible system forms no record in either direction.
//
// What this is and is not. The two "bases" compared are two spatial axes of a classical
// coarse density profile, not two competing quantum bases of one system, so this is an
// axis-selection CONSISTENCY result (the record forms where the coupling is, a necessary
// condition any einselection story must satisfy), not a demonstration of preferred-basis
// einselection itself. The initial state is a structured, cell-varying pattern (period 5
// does not divide the coin degree 24, so cells differ), so the orthogonal and closed
// numbers are dynamically small rather than zero by the translation symmetry of a
// homogeneous fill.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  pointerTrajectory,
  tailMean,
} from '@/code/dynamics/measurement'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/pointer-basis-selection',
  code: 'E-QTM-0019',
  title:
    'a drain coupled along one spatial axis writes a record along that axis and not the orthogonal one, an axis-selection consistency result for the coupling direction',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const side = 6
    const beats = 300
    const mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const table = streamSourceTable(mesh)
    const init = makeWill(mesh)

    // a structured, cell-varying deterministic pattern: period 5 does not divide the
    // coin degree 24, so the state differs from cell to cell and the orthogonal and
    // closed records are dynamical measurements, not symmetry-forced zeros
    for (let i = 0; i < init.data.length; i++) {
      init.data[i] = ((i % 5) % 3) - 1
    }

    const frontierX = 0 // the drain couples along x

    const openX = tailMean(
      pointerTrajectory({
        init,
        forward,
        table,
        beats,
        open: true,
        frontierX,
        axis: 0,
      }),
    )

    const openY = tailMean(
      pointerTrajectory({
        init,
        forward,
        table,
        beats,
        open: true,
        frontierX,
        axis: 1,
      }),
    )

    const closedX = tailMean(
      pointerTrajectory({
        init,
        forward,
        table,
        beats,
        open: false,
        frontierX,
        axis: 0,
      }),
    )

    const closedY = tailMean(
      pointerTrajectory({
        init,
        forward,
        table,
        beats,
        open: false,
        frontierX,
        axis: 1,
      }),
    )

    const recordAlongCoupling = openX > 0.1 // the record forms along the drain axis
    const noRecordOrthogonal = openY < 0.5 * openX // not along the orthogonal axis
    const closedNoRecord =
      closedX < 0.5 * openX && closedY < 0.5 * openX // closed forms no record in either

    const ok =
      recordAlongCoupling && noRecordOrthogonal && closedNoRecord

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the open drain, coupling along the x frontier, writes a definite stable record along x but not along the orthogonal y, while the closed reversible system forms no record in either direction, so the record forms along the axis the drain couples to, an axis-selection consistency result for the coupling direction',
      metrics: {
        cells: mesh.cellCount,
        openAlongCoupling: Number(openX.toFixed(4)),
        openOrthogonal: Number(openY.toFixed(4)),
        closedAlongCoupling: Number(closedX.toFixed(4)),
        closedOrthogonal: Number(closedY.toFixed(4)),
      },
      // CONTROL: along the ORTHOGONAL axis (open) and in BOTH axes (closed) no stable record forms, so the record follows the drain-coupling direction, not an arbitrary one.
      control: {
        openOrthogonal: Number(openY.toFixed(4)),
        closedAlongCoupling: Number(closedX.toFixed(4)),
      },
      notes:
        'L1. The record follows the drain axis on a structured cell-varying initial state, so the orthogonal and closed values are dynamically small (order 0.02 against 1.3 along the coupling), not zeros forced by a homogeneous init. Honest scope: the two compared "bases" are two spatial axes of a classical coarse density profile, not competing quantum bases of one system, so this is a consistency condition for the coupling direction, not preferred-basis einselection. The preferred-basis question itself stays open.',
    })
  },
})
