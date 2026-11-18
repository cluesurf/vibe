// Write the railway the site's figure draws: `add` with r0 = 1 and r1 = 2, laid on the {7,3} band exactly as
// E-CMP-0022 lays it (code/compute/railway-band.ts), with the band's geometry, the circuit's switches, the
// wiring of every tile in use, and what the run should end with. The figure steps the same automaton rule
// on this data in the browser and checks it reaches the same end.
//
//   pnpm call task/railway-site.ts --out <file.json>
//
// Reports by default; writes only with --commit.

import { writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import {
  PROGRAMS,
  copyCircuit,
  evaluateProgram,
  registerValue,
} from '@/code/compute/railway-circuit'
import { BAND_PRESETS, layProgramOnBand, presetBand } from '@/code/compute/railway-band'
import { runRailway } from '@/code/compute/railway-lay'

/** Significant digits kept for the geometry: far below a pixel at any zoom the figure uses. */
const DIGITS = 8

const round = (value: number) => Number(value.toPrecision(DIGITS))

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    commit: { type: 'boolean', default: false },
  },
})

const PROGRAM = PROGRAMS.add!
const INITIAL = [1, 2]
const UNITS = [3, 2]

const preset = BAND_PRESETS.heptagrid
const band = presetBand(preset)
const { compiled, layout } = layProgramOnBand({
  preset,
  band,
  program: PROGRAM,
  initial: INITIAL,
  units: UNITS,
})
const run = runRailway({
  circuit: copyCircuit(compiled.circuit),
  layout,
  start: compiled.start,
  limit: 1_000_000,
})
const ended = copyCircuit(compiled.circuit)

for (const [node, entry] of ended.nodes.entries()) {
  if (entry.form === 'switch') {
    entry.selected = run.state.selected[layout.tileOf[node]!] as 1 | 2
  }
}

const registers = compiled.registers.map(r => registerValue(ended, r))
const direct = evaluateProgram({ program: PROGRAM, initial: INITIAL, limit: 1000 })

// the periods the circuit reaches, so the site draws no more of the band than it needs
const lastPeriod = Math.max(...layout.live.map(t => band.period[t]!)) + 1
const count = band.base.filter((_, t) => band.period[t] === 0).length

const data = {
  experiment: 'E-CMP-0022',
  tiling: preset.label,
  program: {
    name: 'add',
    code: PROGRAM.code,
    initial: INITIAL,
    units: UNITS,
  },
  expect: {
    steps: run.steps,
    ending: run.ending,
    crossings: run.visits.length,
    registers,
    direct: direct.registers,
  },
  band: {
    count,
    periods: lastPeriod,
    step: band.step.map(round),
    center: band.baseCenter.map(p => p.map(round)),
    corners: band.baseCorners.map(list => list.map(p => p.map(round))),
  },
  nodes: compiled.circuit.nodes.map(node =>
    node.form === 'switch'
      ? { kind: node.kind, selected: node.selected, label: node.label }
      : { kind: node.kind, label: node.label },
  ),
  registers: compiled.registers.map(r => r.units.map(u => u.inc.holder)),
  // each tile in use as [band index, role (1 track, 2 two tracks, 3 node), circuit node or -1, then its
  // joined tiles in side order]
  tiles: layout.live.map(tile => [
    tile,
    layout.role[tile]!,
    layout.nodeOf[tile]!,
    ...layout.sides[tile]!,
  ]),
  layout: {
    tiles: layout.used,
    crossings: layout.crossings,
    doubles: layout.doubles,
    switches: compiled.circuit.nodes.filter(n => n.form === 'switch').length,
  },
}

console.log(
  `add ${INITIAL.join(' + ')} on ${preset.label}: ${run.ending} after ${run.steps} steps, ${run.visits.length} switch crossings, registers ${registers.join(', ')} (direct ${direct.registers.join(', ')}), ${layout.used} tiles, ${lastPeriod} periods of ${count}`,
)

if (!values.commit || !values.out) {
  console.log('report only. Pass --out <file> --commit to write')
} else {
  writeFileSync(values.out, `${JSON.stringify(data)}\n`)
  console.log(`wrote ${values.out}`)
}
