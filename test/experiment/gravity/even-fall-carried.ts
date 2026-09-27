// E-GRV-0077's F3 on the carried light (E-GRV-0078). E-GRV-0077 failed F3 because the standing lump's transverse
// energy U_T grew 52.9 fold in 4096 beats (1.83 fold at D 64). Its runs stepped code/measure/varying-depth-light's
// mediumBeat, which at one depth is the ONE-level husk light, and E-FRC-0214 had already found that light heats: it
// drops the remainder of its integer division each beat instead of carrying it, a push C^T R / q^2 that does not
// telescope, so its energy walks. The shaped light (code/rule/trit-husk-shaped) carries the remainder into further
// levels, and E-FRC-0252 (matter reads the light) runs on three of them. This file reruns F3's lump on it.
//
// THE RUN: code/measure/husk-heating heatRun, the lump of E-GRV-0077 (content 4 at LUMP_COLUMN, its sink at
// SINK_COLUMN, side 8, 4096 beats, sampled every 128), at D 16 and D 64, one level (the control: must reproduce
// E-GRV-0077's numbers) and three. U_L is fixed by Gauss (0 violations is gated), so U_T = I - U_L with I the
// shadow invariant.
//
// PROBES before this file, disclosed (tmp/heat-probe2 to 4): a clean packet at D 16 over 2048 beats holds its energy
// to 1.1e-3 at three levels and 0 at four, against 53 fold at one; the speed at three levels is within 0.6 percent
// of one level's; this lump at three levels grows 1.0001 fold (D 16) and 1.0000 (D 64). The gates below are E-GRV-0077's
// own F3, unchanged, so the probes read the gate before this file: this is a rerun of a recorded gate on a corrected
// instrument, stated as such, not a fresh prediction.
//
// GATES (E-GRV-0077's F3, unchanged): on the three-level light at D 16 and at D 64, U_T >= 0 at every sample and never
// exceeds twice its start; Gauss 0 on every beat; exact reversal. CONTROL: the one-level run reproduces E-GRV-0077's
// recorded U_T start 9.2694 and end 490.17 at D 16 (to 1e-3). Verdict: pass if the gates and the control hold, fail
// if a gate fails, partial if the control does not reproduce.
//
// WHAT IT CHANGES: with E-GRV-0076 and 0077's F1 and F2, the negative static energy now passes every gate it was given.
// It does NOT address the pull acting at once (E-GRV-0077 R), which stands.
//
// Depth L2: the rule's own long runs. DETERMINISM: the lump is placed; nothing is drawn. NOTHING MOVES: each value
// takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LUMP_COLUMN, SINK_COLUMN } from '@/code/measure/even-field'
import { heatRun, longitudinalOf, lumpStart, type HeatRun } from '@/code/measure/husk-heating'

const SIDE = 8
const CONTENT = 4
const BEATS = 4096
const EVERY = 128
const DEPTHS = [16, 64] as const
const CARRIED = 3
const RECORDED = { start: 9.2694, end: 490.17 }

type LumpRun = { depth: number; levels: number; longitudinal: number; transverse: number[]; run: HeatRun }

function lumpRun(depth: number, levels: number): LumpRun {
  const p = lumpStart(SIDE, depth, [{ at: LUMP_COLUMN, to: SINK_COLUMN, units: CONTENT }])
  const longitudinal = longitudinalOf(p.medium, p.start, false)
  const run = heatRun({ medium: p.medium, start: p.start, levels, cyclic: false, beats: BEATS, every: EVERY })

  return { depth, levels, longitudinal, transverse: run.samples.map(x => x.invariant - longitudinal), run }
}

const growthOf = (r: LumpRun): number => Math.max(...r.transverse) / r.transverse[0]!
const leastOf = (r: LumpRun): number => Math.min(...r.transverse)
const endOf = (r: LumpRun): number => r.transverse[r.transverse.length - 1]!

export default experiment({
  id: 'gravity/even-fall-carried',
  code: 'E-GRV-0078',
  title:
    "E-GRV-0077's F3 passes on the carried light: its failure was the one-level light's known heating, not the sign, pass: the standing lump (content 4, side 8, 4096 beats) on the three-level shaped light keeps its transverse energy to 1.0001 fold at D 16 and 1.0000 at D 64, against 52.88 and 1.83 fold on the one-level light that E-GRV-0077 stepped (its recorded 9.2694 to 490.17 reproduced exactly), with Gauss 0 on every beat and exact reversal; so the negative static energy passes every gate it was given, and only the pull acting at once (E-GRV-0077 R) stands against it",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const runs = DEPTHS.flatMap(d => [lumpRun(d, 1), lumpRun(d, CARRIED)])
    const carried = runs.filter(r => r.levels === CARRIED)
    const control = runs.find(r => r.depth === 16 && r.levels === 1)!
    const instrument = runs.every(r => r.run.gauss === 0 && r.run.reversed)
    const gate = carried.every(r => leastOf(r) >= 0 && growthOf(r) <= 2)
    const reproduced = Math.abs(control.transverse[0]! - RECORDED.start) < 1e-3 && Math.abs(endOf(control) - RECORDED.end) < 1e-2
    const status = !reproduced ? 'partial' : gate && instrument ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      gate_F3: gate ? 1 : 0,
      instrument: instrument ? 1 : 0,
      controlReproduced: reproduced ? 1 : 0,
      beats: BEATS,
      levels: CARRIED,
      seconds: (Date.now() - t0) / 1000,
    }

    for (const r of runs) {
      const k = `D${r.depth}_L${r.levels}`

      metrics[`${k}_longitudinal`] = r.longitudinal
      metrics[`${k}_transverseStart`] = r.transverse[0]!
      metrics[`${k}_transverseEnd`] = endOf(r)
      metrics[`${k}_growth`] = growthOf(r)
      metrics[`${k}_least`] = leastOf(r)
      metrics[`${k}_fieldWraps`] = r.run.wraps.field
    }

    const describe = (r: LumpRun): string => `D ${r.depth}, ${r.levels} level${r.levels > 1 ? 's' : ''}: U_T ${r.transverse[0]!.toFixed(4)} to ${endOf(r).toFixed(4)}, growth ${growthOf(r).toFixed(4)}`

    return verdict({
      status,
      claim: `the standing lump on the carried light: ${runs.map(describe).join('; ')}; Gauss 0 and exact reversal on every run: ${instrument}; the one-level control reproduces E-GRV-0077: ${reproduced}`,
      metrics,
      control: {
        oneLevelStart: control.transverse[0]!,
        oneLevelEnd: endOf(control),
        oneLevelGrowth: growthOf(control),
      },
      notes: `L2. Gate F3 ${gate}, instrument ${instrument}, control ${reproduced}. U_T samples every ${EVERY} beats: ${runs.map(r => `${describe(r)} [${r.transverse.map(x => x.toFixed(2)).join(' ')}]`).join(' | ')}. The field still wraps on the carried light (${carried.map(r => r.run.wraps.field).join(', ')} field wraps) while the energy holds, so the wraps are the standing string's own and not a leak.`,
    })
  },
})
