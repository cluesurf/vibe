// Vibe-to-Hameroff bridge (Orch-OR): the definite outcome survives thermal noise, the
// WARM half of Tegmark's objection. Tegmark's blow to Orch-OR has two prongs, the brain
// is warm and it is wet: warm (thermal agitation scrambles delicate states) and wet
// (the environment decoheres them in about 10^-13 s). The companion experiment
// decoherence-immunity handles the wet prong (coherence is destroyed yet the record
// holds). This one handles the warm prong: a definite classical record still forms and
// holds when the body it starts from is thermally scrambled.
//
// A deterministic body is heated by flipping a fraction (the temperature) of its tones,
// using a seeded generator so the perturbation is deterministic, and the temperature is
// swept, never the seed. Coupled to the open growing edge, the coarse pointer still
// settles to a definite value and holds with near-zero late drift at every temperature,
// even with 40 percent of the tones flipped. The record is immune to thermal noise.
//
// The control is the CLOSED run from the hottest body: with no wake to leak the fine
// phase into, no stable definite record forms (the pointer holds far less gradient), so
// the record comes from the arrow (the growing edge), not from the structure of the hot
// body. That is why heating the body does not erase the outcome: the outcome is made by
// the settling on the wake, which thermal noise in the body does not stop.
//
// Depth L2. This reads the substrate's measurement-as-settling against the warm prong of
// the Tegmark objection, with a control. It is a bridge statement about vibe's route to a
// definite outcome, not a claim about biology.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  pointerTrajectory,
  tailMean,
} from '@/code/dynamics/measurement'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { windowMean } from '@/code/measure/statistics'

const SIDE = 6
const BEATS = 300
const SEED = 12345
const TEMPERATURES = [0, 0.05, 0.1, 0.2, 0.4]
const FRONTIER_X = 0

// heat a body by flipping a `temperature` fraction of its tones, deterministically
function heat(base: ReturnType<typeof makeWill>, temperature: number) {
  const hot = cloneWill(base)
  const rng = makeRng({ seed: SEED })

  for (let i = 0; i < hot.data.length; i++) {
    if (rng.next() < temperature) {
      hot.data[i] = hot.data[i] === 0 ? 1 : 0
    }
  }

  return hot
}

export default experiment({
  id: 'quantum/thermal-record-immunity',
  code: 'E-QTM-0050',
  title:
    'the definite outcome survives thermal noise (the warm prong of the Tegmark objection), a Hameroff bridge companion to decoherence-immunity',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = Array.from({ length: mesh.degree }, (unused, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const table = streamSourceTable(mesh)
    const base = makeWill(mesh)

    fillWillPattern(base) // a deterministic body, never random

    let minRecord = Infinity
    let maxDrift = 0

    const perTemp: Record<string, number> = {}

    for (const temperature of TEMPERATURES) {
      const init = heat(base, temperature)
      const trajectory = pointerTrajectory({
        init,
        forward,
        table,
        beats: BEATS,
        open: true,
        frontierX: FRONTIER_X,
      })

      const early = windowMean({ series: trajectory, lo: 50, hi: 100 })
      const late = windowMean({ series: trajectory, lo: 250, hi: 300 })
      const record = tailMean(trajectory)
      const drift = Math.abs(late - early)

      minRecord = Math.min(minRecord, record)
      maxDrift = Math.max(maxDrift, drift)
      perTemp[`record_t${Math.round(temperature * 100)}`] = Number(
        record.toFixed(4),
      )
    }

    // control: the hottest body run CLOSED (no wake) forms no comparable record
    const hottest = heat(base, TEMPERATURES[TEMPERATURES.length - 1]!)
    const closedTrajectory = pointerTrajectory({
      init: hottest,
      forward,
      table,
      beats: BEATS,
      open: false,
      frontierX: FRONTIER_X,
    })

    const closedRecord = tailMean(closedTrajectory)

    const recordForms = minRecord > 0.5
    const recordPersists = maxDrift < 0.02
    const wakeMakesIt = minRecord > closedRecord + 0.3
    const ok = recordForms && recordPersists && wakeMakesIt

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a definite classical record forms and holds (low late drift) at every temperature up to 40 percent of tones flipped, so the outcome is immune to thermal noise (the warm prong of the Tegmark objection), and the closed control from the same hot body forms no comparable record, so the outcome is made by the settling on the wake, not by the hot body',
      metrics: {
        temperatures: TEMPERATURES.length,
        minRecord: Number(minRecord.toFixed(4)),
        maxDrift: Number(maxDrift.toExponential(2)),
        closedRecord: Number(closedRecord.toFixed(4)),
        ...perTemp,
      },
      // CONTROL: closed run from the hottest body, no wake, so a much weaker record.
      control: { closedRecord: Number(closedRecord.toFixed(4)) },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh), and it reports a whole-mesh quantity (a cell count, fraction, distance or coverage), so half of the cells counted belong to the component the seed never reaches. Read the number as a two-component figure until roadmap item 0017 decides whether to switch to an odd side. ' +
        "Hameroff / Orch-OR bridge (author-bridges/stuart-hameroff.md, point 6), the warm prong. Companion to decoherence-immunity (the wet prong). Together they show vibe's definite outcome carries neither the warm nor the coherence bill.",
    })
  },
})
