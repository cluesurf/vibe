// Vibe-to-Hameroff bridge (Orch-OR): the definite outcome vibe forms needs no
// sustained quantum coherence, so the Tegmark decoherence objection that has dogged
// Orch-OR for a quarter century simply does not apply to vibe. Hameroff and Penrose
// need a real quantum superposition to survive coherent in warm microtubules for
// about 25 ms until gravity collapses it, and Tegmark's estimate (coherence gone in
// about 10^-13 s) is the standard near-fatal blow. Vibe reaches the same destination
// (a definite, observer-free outcome, the substrate analogue of a moment of
// experience) by a discrete deterministic route that never banks on coherence.
//
// We measure this directly. A deterministic body on the committed reversible lattice
// gas is coupled to the open growing edge (the wake the fine phase leaks into). Two
// clocks run at once:
//   - the COHERENCE clock: the Loschmidt echo, the error when the dynamics is run
//     forward then exactly inverted. Closed (no wake) it is exactly zero, the phase is
//     fully recoverable, coherence intact. Open (coupled to the wake) it jumps well
//     above zero and stays there, the fine phase is gone, coherence irreversibly lost.
//   - the RECORD clock: the coarse pointer (the occupancy gradient) that settles to a
//     definite value and HOLDS, the classical outcome. Its late-time drift is the
//     persistence of the record.
// The point: coherence is destroyed (open echo well above zero) yet the record is rock
// stable (drift near zero), so the definite outcome does not live on the coherence
// clock at all. And it holds at every mesh size from 256 to 4096 cells, so no
// privileged hardware (no microtubule) is needed, the immunity is substrate scale
// independent.
//
// The control is the CLOSED bulk: its echo is exactly zero (fully coherent, no record),
// which proves the open bath genuinely destroys coherence rather than the measure being
// blind to it, so the immunity is real and not an artifact.
//
// Depth L2. This reproduces the measurement / decoherence structure on the committed
// substrate with a control, and reads it against the Orch-OR bridge. It is not a claim
// about biology or about Orch-OR being wrong, only that vibe's route to a definite
// outcome carries no coherence bill.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  pointerTrajectory,
  loschmidtEcho,
  tailMean,
} from '@/code/dynamics/measurement'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDES = [4, 5, 6, 7, 8]
const BEATS = 300
const ECHO_BEATS = 60
const FRONTIER_X = 0

// the mean of a window of a trajectory, the settled record over that window
function windowMean(
  trajectory: number[],
  lo: number,
  hi: number,
): number {
  let sum = 0

  for (let t = lo; t < hi; t++) sum += trajectory[t] ?? 0

  return sum / Math.max(1, hi - lo)
}

export default experiment({
  id: 'quantum/decoherence-immunity',
  code: 'E-QTM-0049',
  title:
    "the definite outcome persists while quantum coherence is destroyed, so vibe reaches Orch-OR's destination with no coherence bill (Hameroff bridge)",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    let minOpenEcho = Infinity
    let maxClosedEcho = 0
    let maxRecordDrift = 0
    let minRecord = Infinity

    const perSize: Record<string, number> = {}

    for (const side of SIDES) {
      const mesh = d4Mesh({ side })
      const opposite = Array.from(
        { length: mesh.degree },
        (unused, d) => mesh.opposite(d),
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

      fillWillPattern(init) // a deterministic body, never random

      // the coherence clock: open loses it irreversibly, closed keeps it exactly
      const openEcho = loschmidtEcho({
        init,
        forward,
        inverse,
        table,
        beats: ECHO_BEATS,
        open: true,
        frontierX: FRONTIER_X,
      })

      const closedEcho = loschmidtEcho({
        init,
        forward,
        inverse,
        table,
        beats: ECHO_BEATS,
        open: false,
        frontierX: FRONTIER_X,
      })

      // the record clock: the coarse pointer settles and holds, its late drift is tiny
      const trajectory = pointerTrajectory({
        init,
        forward,
        table,
        beats: BEATS,
        open: true,
        frontierX: FRONTIER_X,
      })

      const early = windowMean(trajectory, 50, 100)
      const late = windowMean(trajectory, 250, 300)
      const record = tailMean(trajectory)
      const drift = Math.abs(late - early)

      minOpenEcho = Math.min(minOpenEcho, openEcho)
      maxClosedEcho = Math.max(maxClosedEcho, closedEcho)
      maxRecordDrift = Math.max(maxRecordDrift, drift)
      minRecord = Math.min(minRecord, record)
      perSize[`echo_side${side}`] = Number(openEcho.toFixed(4))
      perSize[`drift_side${side}`] = Number(drift.toExponential(2))
    }

    // coherence is reliably destroyed, the closed control stays exactly coherent,
    // the record forms and persists, at every size
    const coherenceDestroyed = minOpenEcho > 0.1
    const controlStaysCoherent = maxClosedEcho < 1e-9
    const recordPersists = maxRecordDrift < 0.02
    const recordDefinite = minRecord > 0.5
    const ok =
      coherenceDestroyed &&
      controlStaysCoherent &&
      recordPersists &&
      recordDefinite

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "at every mesh size the fine-phase quantum coherence is irreversibly destroyed (open Loschmidt echo above 0.1) while the coarse classical record forms and holds with near-zero late drift, and the closed bulk stays exactly coherent, so vibe's definite outcome (the substrate analogue of a moment of experience) is decoupled from the coherence clock and needs no privileged hardware, reaching Orch-OR's destination without the warm-coherence bill Tegmark objects to",
      metrics: {
        sizes: SIDES.length,
        minOpenEcho: Number(minOpenEcho.toFixed(4)),
        maxClosedEcho,
        maxRecordDrift: Number(maxRecordDrift.toExponential(2)),
        minRecord: Number(minRecord.toFixed(4)),
        ...perSize,
      },
      // CONTROL: the closed reversible bulk recovers exactly (echo zero at every size),
      // so the open bath genuinely destroys coherence and the immunity is real.
      control: { maxClosedEcho },
      notes:
        'Hameroff / Orch-OR bridge (author-bridges/stuart-hameroff.md, point 6). The record persists while coherence dies, across a size sweep, so vibe needs no warm-brain coherence to reach a definite outcome. This is a bridge reading of measurement-as-settling (E-QTM-0016), not a claim about biology.',
    })
  },
})
