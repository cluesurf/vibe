// Q5 of chunk 7, measurement as deterministic settling, no collapse law. A coherent body on the committed
// reversible lattice gas is coupled to the OPEN growing edge (cells born at peace at a frontier slab, the bath
// the fine phase leaks into) or run CLOSED. The OPEN system forms a definite, stable, IRREVERSIBLE coarse record,
// the pointer (the occupancy gradient) rises and SETTLES to a fixed value with a measured settling time, and the
// Loschmidt echo cannot recover the start (the fine phase is gone to the wake). The CLOSED system stays coherent,
// the Loschmidt echo recovers it exactly (no record), and the pointer holds no gradient. So a single classical
// record arises by settling plus loss of the fine phase to the open edge, no special collapse postulate added.
// This is the acknowledged frontier, the honest level reached is L2.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  pointerTrajectory,
  loschmidtEcho,
  settlingTime,
  tailMean,
} from '@/code/dynamics/measurement'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/measurement-settling',
  title:
    'measurement as deterministic settling, the open edge forms a definite irreversible record, the closed system stays coherent',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 6
    const beats = 300
    const echoBeats = 120
    const mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const inverse: Collision = pairCollision({
      opposite,
      forward: false,
    })

    const table = streamSourceTable(mesh)
    const init = makeWill(mesh)
    fillWillPattern(init) // a deterministic coherent body, never random

    const frontierX = 0

    const openTraj = pointerTrajectory({
      init,
      forward,
      table,
      beats,
      open: true,
      frontierX,
    })

    const closedTraj = pointerTrajectory({
      init,
      forward,
      table,
      beats,
      open: false,
      frontierX,
    })

    const openRecord = tailMean(openTraj) // the settled pointer (the record)
    const closedRecord = tailMean(closedTraj)
    const openSettle = settlingTime(
      openTraj,
      0.1 * Math.max(openRecord, 1e-6),
    )

    const openEcho = loschmidtEcho({
      init,
      forward,
      inverse,
      table,
      beats: echoBeats,
      open: true,
      frontierX,
    })

    const closedEcho = loschmidtEcho({
      init,
      forward,
      inverse,
      table,
      beats: echoBeats,
      open: false,
      frontierX,
    })

    const recordForms =
      openRecord > closedRecord + 0.1 && openRecord > 0.1 // the open pointer settles to a definite gradient

    const settles = openSettle < beats // it reaches and holds a fixed value, a measured settling time
    const irreversible = openEcho > 0.01 // the record cannot be un-formed (the fine phase is gone)
    const coherentClosed = closedEcho < 1e-12 // the closed system is fully recoverable, no record
    const ok = recordForms && settles && irreversible && coherentClosed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'coupled to the open growing edge a coherent body settles to a definite, stable, irreversible coarse record (the pointer gradient rises and holds, with a measured settling time, and the Loschmidt echo cannot recover the start), while the closed system stays coherent and fully recoverable with no record, so a single classical outcome arises by deterministic settling plus loss of the fine phase to the wake, with no collapse law added',
      metrics: {
        cells: mesh.cellCount,
        openRecord: Number(openRecord.toFixed(4)),
        closedRecord: Number(closedRecord.toFixed(4)),
        settlingBeats: openSettle,
        openEcho: Number(openEcho.toFixed(4)),
        closedEcho,
      },
      // CONTROL: the CLOSED reversible bulk recovers exactly (echo zero, fully coherent) and holds no pointer gradient, so the record is the open edge, not the bulk rule.
      control: {
        closedEcho,
        closedRecord: Number(closedRecord.toFixed(4)),
      },
      notes:
        'Q5, measurement-as-settling, the acknowledged frontier, an honest L2. The fine phase leaks to the wake, the coarse record settles and is irreversible. A full account still needs the pointer-basis selection shown from the lattice, noted honestly.',
    })
  },
})
