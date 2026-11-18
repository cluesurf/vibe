// MARGENSTERN'S RAILWAY ON THE TILES: the switch-level circuits of E-CMP-0021 laid on the heptagrid {7,3}
// and the pentagrid {5,4}, and run as a cellular automaton whose locomotive advances one tile a step.
//
// The tiling is a BAND: the tiles within a fixed distance of one geodesic, made long by a translation of
// the tiling (code/substrate/band.ts), since a ball of the tiling is almost all rim and goes wrong past
// radius 8 in floating point. Each switch and terminal takes a tile, each track a path of tiles, and two
// tracks may share a tile on four different sides, crossing when their sides alternate
// (code/compute/railway-lay.ts). The automaton's rule reads a tile and its joined neighbors only: a head
// becomes a tail, a tail empties, an empty tile becomes the head when a joined head leaves toward it, and a
// switch tile updates its setting as the head leaves it.
//
// What is checked, per program and tiling:
//   1. the band: every adjacency two-way, every full tile's corners as the tiling has them
//   2. the layout: every joined pair are neighbors in the tiling, joined both ways, no open port
//   3. the run: exactly one head at every step, each step onto a tile joined to the last, halting on the
//      halt tile, the switch crossings in the same order as the switch-level run, and every register equal
//      to direct evaluation of the machine
//   4. controls: the same layout with the memory switches made fixed must not give the right answer, and
//      the automaton started from other inputs must give their own direct-evaluation answers
//
// Depth L2: a known construction reproduced on the tilings it was made for, run cell by cell. The rule's
// state is larger than Margenstern's (the wiring is part of each tile's state), so nothing here bears on
// his state counts. No randomness.

import {
  PROGRAMS,
  type Program,
  compileProgram,
  copyCircuit,
  evaluateProgram,
  registerValue,
  replaceSwitchKind,
  runCircuit,
  type Visit,
} from '@/code/compute/railway-circuit'
import {
  BAND_PRESETS,
  layProgramOnBand,
  presetBand,
} from '@/code/compute/railway-band'
import {
  type Layout,
  checkLayout,
  runRailway,
} from '@/code/compute/railway-lay'
import { type Band } from '@/code/substrate/band'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

/** Steps a run may take before it counts as not halting. */
const LIMIT = 200_000


/** The runs: a program, its input, its register sizes, and the tilings it is laid on. */
const RUNS: {
  name: string
  program: Program
  initial: number[]
  units: number[]
  on: string[]
}[] = [
  { name: 'add 1 + 2', program: PROGRAMS.add!, initial: [1, 2], units: [3, 2], on: ['{7,3}', '{5,4}'] },
  { name: 'double 2', program: PROGRAMS.double!, initial: [2, 0], units: [2, 4], on: ['{7,3}'] },
  { name: 'parity 3', program: PROGRAMS.parity!, initial: [3, 0], units: [3, 1], on: ['{7,3}'] },
]

/** Every full tile's corners as the tiling has them, and every adjacency two-way. */
function bandSound(band: Band): boolean {
  const [p, q] = band.symbol

  return band.neighbors.every((list, tile) => {
    if (!list.every(n => band.neighbors[n]!.includes(tile))) {
      return false
    }

    if (list.length !== p) {
      return true
    }

    const ring = band.ring[tile]!

    return ring.every((c1, i) => {
      const c2 = ring[(i + 1) % p]!
      const touching = band.neighbors[c1]!.includes(c2)
      const shared = band.neighbors[c1]!.filter(
        n => n !== tile && band.neighbors[c2]!.includes(n),
      ).length

      // at a corner a missing tile past the band's edge can hide the shared one, so only a wrong count fails
      return q === 3 ? touching : !touching && shared <= 1
    })
  })
}

/** The switch-level crossings of a run, and the registers it ends with. */
function switchLevel({
  program,
  initial,
  units,
}: {
  program: Program
  initial: number[]
  units: number[]
}): { visits: Visit[]; registers: number[] } {
  const compiled = compileProgram({ program, initial, units })
  const visits: Visit[] = []

  runCircuit({
    circuit: compiled.circuit,
    start: compiled.start,
    limit: LIMIT,
    onVisit: v => visits.push(v),
  })

  return {
    visits,
    registers: compiled.registers.map(r => registerValue(compiled.circuit, r)),
  }
}

/** Run the automaton on a layout from the circuit compiled with `initial`, and read its registers. */
function cellLevel({
  program,
  initial,
  units,
  layout,
  memoryAsFixed,
}: {
  program: Program
  initial: number[]
  units: number[]
  layout: Layout
  memoryAsFixed: boolean
}) {
  const compiled = compileProgram({ program, initial, units })
  const circuit = memoryAsFixed
    ? replaceSwitchKind({ circuit: compiled.circuit, from: 'memory', to: 'fixed' })
    : copyCircuit(compiled.circuit)
  const run = runRailway({ circuit, layout, start: compiled.start, limit: LIMIT })

  // the registers read off the automaton's final switch settings
  for (const [node, entry] of circuit.nodes.entries()) {
    if (entry.form === 'switch') {
      entry.selected = run.state.selected[layout.tileOf[node]!] as 1 | 2
    }
  }

  return {
    run,
    registers: compiled.registers.map(r => registerValue(circuit, r)),
  }
}

export function railwayOnTiles() {
  const bands = new Map(
    Object.values(BAND_PRESETS).map(preset => [
      preset.label,
      { preset, band: presetBand(preset) },
    ]),
  )
  const rows: {
    run: string
    on: string
    sound: boolean
    layoutProblems: number
    tiles: number
    crossings: number
    doubles: number
    steps: number
    halted: boolean
    oneHead: boolean
    sameCrossings: boolean
    correct: boolean
    controlCorrect: boolean
    otherInputsCorrect: boolean
  }[] = []

  for (const test of RUNS) {
    for (const on of test.on) {
      const { preset, band } = bands.get(on)!
      const { layout } = layProgramOnBand({
        preset,
        band,
        program: test.program,
        initial: test.initial,
        units: test.units,
      })
      const reference = switchLevel(test)
      const want = evaluateProgram({
        program: test.program,
        initial: test.initial,
        limit: LIMIT,
      })
      const cells = cellLevel({ ...test, layout, memoryAsFixed: false })
      const control = cellLevel({ ...test, layout, memoryAsFixed: true })

      // the same layout run from other inputs that fit its registers: the wiring is fixed, only the
      // switch settings differ, as in Margenstern's circuits
      const others = otherInputs(test).map(initial => {
        const run = cellLevel({ ...test, initial, layout, memoryAsFixed: false })
        const direct = evaluateProgram({ program: test.program, initial, limit: LIMIT })

        return (
          run.run.ending === 'halt' &&
          run.registers.every((v, r) => v === direct.registers[r])
        )
      })

      rows.push({
        run: test.name,
        on,
        sound: bandSound(band),
        layoutProblems: checkLayout({ layout, tiling: band }).length,
        tiles: layout.used,
        crossings: layout.crossings,
        doubles: layout.doubles,
        steps: cells.run.steps,
        halted: cells.run.ending === 'halt',
        oneHead: cells.run.heads === 1,
        sameCrossings:
          cells.run.visits.length === reference.visits.length &&
          cells.run.visits.every(
            (v, i) =>
              v.node === reference.visits[i]!.node &&
              v.entry === reference.visits[i]!.entry,
          ),
        correct: cells.registers.every((v, r) => v === want.registers[r]),
        controlCorrect:
          control.run.ending === 'halt' &&
          control.registers.every((v, r) => v === want.registers[r]),
        otherInputsCorrect: others.every(Boolean),
      })
    }
  }

  return rows
}

/** Inputs other than the laid one that the same registers hold: every smaller first register value. */
function otherInputs(test: (typeof RUNS)[number]): number[][] {
  const inputs: number[][] = []

  for (let v = 0; v < test.initial[0]!; v++) {
    const initial = [...test.initial]

    initial[0] = v
    inputs.push(initial)
  }

  return inputs
}

export default experiment({
  id: 'computation/railway-heptagrid',
  code: 'E-CMP-0022',
  title:
    "Margenstern's railway laid on the heptagrid {7,3} and the pentagrid {5,4} and run as a cellular automaton: one locomotive, one tile a step, crosses the switches in the switch-level order and ends with every register equal to direct evaluation",
  category: 'computation',
  substrates: ['73', '54'],
  depth: 'L2',
  paper: false,
  run() {
    const rows = railwayOnTiles()
    const ok = rows.every(
      r =>
        r.sound &&
        r.layoutProblems === 0 &&
        r.halted &&
        r.oneHead &&
        r.sameCrossings &&
        r.correct &&
        !r.controlCorrect &&
        r.otherInputsCorrect,
    )
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}

    for (const r of rows) {
      const key = `${r.run} on ${r.on}`

      metrics[`${key}: steps`] = r.steps
      metrics[`${key}: tiles`] = r.tiles
      metrics[`${key}: crossings`] = r.crossings
      metrics[`${key}: side by side`] = r.doubles
      metrics[`${key}: correct`] = r.correct && r.sameCrossings && r.oneHead ? 1 : 0
      metrics[`${key}: other inputs correct`] = r.otherInputsCorrect ? 1 : 0
      control[`${key}: memory as fixed correct`] = r.controlCorrect ? 1 : 0
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${rows.filter(r => r.correct && r.sameCrossings).length} of ${rows.length} railway circuits laid on {7,3} and {5,4} ran as a cellular automaton, one tile a step, crossed their switches in the same order as the switch-level run and ended equal to direct evaluation. With the memory switches made fixed ${rows.filter(r => r.controlCorrect).length} of ${rows.length} did`,
      metrics,
      control,
      notes:
        'L2, a known construction run on the tilings it was made for. The tiling is a band along a geodesic, built exactly by a translation of the tiling. Tile state holds the wiring, so the alphabet is larger than Margenstern\'s 4 states on {7,3} and 2 to 9 on {5,4}, and two tracks may share a tile side by side, which his automata never do. Both counts are reported.',
    })
  },
})
