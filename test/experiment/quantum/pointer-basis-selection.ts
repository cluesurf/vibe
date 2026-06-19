// Q5 completed, the POINTER-BASIS selection (the preferred-basis problem). Why does the open dynamics settle a
// record in ONE basis and not another. The answer is einselection, the pointer basis is the one ALIGNED with the
// system-bath coupling. The bath here is the open frontier at the x = 0 slab, so the coupling is along x. We
// measure the record (the occupancy gradient) along x (the bath direction) AND along y (orthogonal to it). The
// OPEN system forms a definite, stable record along x but NOT along y, the bath selects the x-basis. The CLOSED
// reversible system forms no record in either direction (no basis selected without the bath). So the lattice
// SELECTS the pointer basis dynamically, the one the environmental coupling monitors, exactly as decoherence
// theory requires. This closes the remaining piece of Q5.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
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
  title:
    'the pointer basis is einselected by the bath coupling, a record forms along the coupling axis but not the orthogonal one',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
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
    fillWillPattern(init)

    const frontierX = 0 // the bath couples along x

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

    const recordAlongCoupling = openX > 0.1 // the record forms along the bath-coupling axis
    const noRecordOrthogonal = openY < 0.5 * openX // not along the orthogonal axis, the basis is selected
    const closedNoRecord =
      closedX < 0.5 * openX && closedY < 0.5 * openX // closed forms no record in either, no selection

    const ok =
      recordAlongCoupling && noRecordOrthogonal && closedNoRecord

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the open bath, coupling along the x frontier, einselects the x-basis, a definite stable record forms along x but not along the orthogonal y, while the closed reversible system forms no record in either direction, so the lattice selects the pointer basis dynamically as the one the environmental coupling monitors, closing the preferred-basis piece of measurement',
      metrics: {
        cells: mesh.cellCount,
        openAlongCoupling: Number(openX.toFixed(4)),
        openOrthogonal: Number(openY.toFixed(4)),
        closedAlongCoupling: Number(closedX.toFixed(4)),
        closedOrthogonal: Number(closedY.toFixed(4)),
      },
      // CONTROL: along the ORTHOGONAL axis (open) and in BOTH axes (closed) no stable record forms, so the record is the bath-coupling direction, the einselected pointer basis, not an arbitrary one.
      control: {
        openOrthogonal: Number(openY.toFixed(4)),
        closedAlongCoupling: Number(closedX.toFixed(4)),
      },
      notes:
        'Q5 completed, the pointer-basis selection by einselection (the bath-coupling axis).',
    })
  },
})
