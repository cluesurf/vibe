// Is there an invariant that keeps the sum-0-fiber 3-cycle wire rules (id.CAB.swap,
// id.BCA.swap, swap.BCA.*, swap.CAB.* on the +-1 backgrounds) from ever computing Kleene neg on an output wire? M5
// (E-CMP-0050) found none of them reaching neg on the line to width 6 (7 by probe) and suspected one.
//
// Three readings, all exact and exhaustive:
// - OCCUPANCY TRANSPORT. A brute force over the nine pairs: after the pair rule, is the first cell occupied (off the
//   background) exactly when the second cell was, or the second exactly when the first was? Where it holds, occupancy
//   rides one side of every pair as a fixed passenger on any graph and schedule (on the brick line: every left-moving,
//   or every right-moving, light ray keeps its occupancy for ever). It is the one occupancy law these rules keep.
// - SIDED CLOSURE. Every cell, at each moment, holds a table (its tone as a function of the input). When every cell
//   alternates sides from one pair to the next (the brick line), a table about to enter as a first cell can only come
//   out of a second cell and conversely, so the tables of each side lie in the least sets that hold the constants and
//   the identity and are closed under the rule applied to (first-side table, second-side table). If neg were outside
//   the wire side's set, that would be the invariant. The closure is computed, not assumed.
// - LAYOUTS. A line layout (the window of gates.ts) is replayed for every input by two independent runners: the dense
//   brick run of gates.ts and the sparse runner of particle-census.ts, with the read slot checked to ride its wire.

import {
  GateRule,
  LineGate,
  SpaceRun,
  TRITS,
  inputsOf,
  lineBrickRun,
  ridesWire,
  runRounds,
} from '@/code/compute/lab/gates'
import { Tones, lineSpace } from '@/code/measure/particle-census'

export type OccupancyTransport = {
  // occupied(first after) === occupied(second before), on all nine pairs
  firstFromSecond: boolean
  // occupied(second after) === occupied(first before), on all nine pairs
  secondFromFirst: boolean
}

export function occupancyTransport(rule: GateRule, background: number): OccupancyTransport {
  let firstFromSecond = true
  let secondFromFirst = true

  for (const a of TRITS) {
    for (const b of TRITS) {
      const p = (a + 1) * 3 + b + 1

      if ((rule.first[p] !== background) !== (b !== background)) {
        firstFromSecond = false
      }

      if ((rule.second[p] !== background) !== (a !== background)) {
        secondFromFirst = false
      }
    }
  }

  return { firstFromSecond, secondFromFirst }
}

// TONE TRANSPORT: for a tone v, after the pair rule the second cell holds v exactly when the first cell held it
// (`forward`), or the first cell holds v exactly when the second held it (`backward`). Such a tone is a fixed passenger
// of one side: under any schedule in which every cell alternates sides from one pair to the next (the brick line), the
// cells that will next enter as first (or as second) hold v along one light ray for ever, whatever crosses it.
export type ToneTransport = { tone: number; forward: boolean; backward: boolean }

export function toneTransport(rule: GateRule): ToneTransport[] {
  return TRITS.map(v => {
    let forward = true
    let backward = true

    for (const a of TRITS) {
      for (const b of TRITS) {
        const p = (a + 1) * 3 + b + 1

        if ((rule.second[p] === v) !== (a === v)) {
          forward = false
        }

        if ((rule.first[p] === v) !== (b === v)) {
          backward = false
        }
      }
    }

    return { tone: v, forward, backward }
  })
}

// Whether a table can sit on a side that carries tone v as a fixed passenger, with inputs placed anywhere: the set of
// inputs where the table reads v must be empty, everything, or exactly the inputs where one input reads v (the input
// whose own ray it is). Arity k, tables in inputsOf(k) order.
export function passengerCompatible(table: ArrayLike<number>, arity: number, tone: number): boolean {
  const inputs = inputsOf(arity)
  const hits = inputs.map((_, n) => table[n] === tone)

  if (hits.every(h => !h) || hits.every(h => h)) {
    return true
  }

  return Array.from({ length: arity }, (_, j) => j).some(j => inputs.every((x, n) => hits[n] === (x[j] === tone)))
}

const UNARY_KEYS: readonly string[] = Array.from({ length: 27 }, (_, c) =>
  [c % 3, Math.floor(c / 3) % 3, Math.floor(c / 9) % 3].map(d => d - 1).join(','),
)

export const unaryKeys = (): readonly string[] => UNARY_KEYS

export type SidedClosure = {
  // tables a cell can hold when it next enters a pair as the first cell, and as the second
  first: Set<string>
  second: Set<string>
}

// The least pair of table sets holding the constants and the identity, closed under the rule applied to (first-side
// table, second-side table): the first output feeds the second side, the second output the first side.
export function sidedUnaryClosure(rule: GateRule): SidedClosure {
  const seed = [[-1, -1, -1], [0, 0, 0], [1, 1, 1], [-1, 0, 1]]
  const first = new Map(seed.map(t => [t.join(','), t]))
  const second = new Map(seed.map(t => [t.join(','), t]))

  let grew = true

  while (grew) {
    grew = false

    for (const a of [...first.values()]) {
      for (const b of [...second.values()]) {
        const x: number[] = []
        const y: number[] = []

        for (let i = 0; i < 3; i++) {
          const p = (a[i]! + 1) * 3 + b[i]! + 1

          x.push(rule.first[p]!)
          y.push(rule.second[p]!)
        }

        if (!second.has(x.join(','))) {
          second.set(x.join(','), x)
          grew = true
        }

        if (!first.has(y.join(','))) {
          first.set(y.join(','), y)
          grew = true
        }
      }
    }
  }

  return { first: new Set(first.keys()), second: new Set(second.keys()) }
}

// The same closure with no sides: one set, both outputs of every pair of its tables added back.
export function unsidedUnaryClosure(rule: GateRule): Set<string> {
  const seed = [[-1, -1, -1], [0, 0, 0], [1, 1, 1], [-1, 0, 1]]
  const all = new Map(seed.map(t => [t.join(','), t]))

  let grew = true

  while (grew) {
    grew = false

    for (const a of [...all.values()]) {
      for (const b of [...all.values()]) {
        const x: number[] = []
        const y: number[] = []

        for (let i = 0; i < 3; i++) {
          const p = (a[i]! + 1) * 3 + b[i]! + 1

          x.push(rule.first[p]!)
          y.push(rule.second[p]!)
        }

        for (const t of [x, y]) {
          if (!all.has(t.join(','))) {
            all.set(t.join(','), t)
            grew = true
          }
        }
      }
    }
  }

  return new Set(all.keys())
}

export type LineLayout = Pick<LineGate, 'background' | 'start' | 'window' | 'inputs' | 'readPosition' | 'readRound'>

const windowFor = (layout: LineLayout, x: readonly number[]): number[] =>
  layout.window.map((tone, i) => {
    const j = layout.inputs.indexOf(i)

    return j >= 0 ? x[j]! : tone!
  })

// The read slot's table by the dense brick run of gates.ts.
export function denseLineTable(rule: GateRule, layout: LineLayout): Int8Array {
  return Int8Array.from(
    inputsOf(layout.inputs.length).map(x => {
      const run = lineBrickRun({
        rule,
        background: layout.background,
        start: layout.start,
        window: windowFor(layout, x),
        rounds: layout.readRound,
      })

      return run.frames[layout.readRound]![layout.readPosition + run.pad]!
    }),
  )
}

// The read slot's table by the sparse runner, and whether it rides its wire for `hold` rounds in every joint run.
export function sparseLineTable(
  rule: GateRule,
  layout: LineLayout,
  hold: number,
): { table: Int8Array; rides: boolean } {
  const line = lineSpace()
  const run: SpaceRun = { space: line, colors: [0, 1], rule, background: layout.background }
  const finals: Tones[] = inputsOf(layout.inputs.length).map(x => {
    const s: Tones = new Map()

    windowFor(layout, x).forEach((v, i) => {
      if (v !== layout.background) {
        s.set(line.at(layout.start + i), v)
      }
    })

    return runRounds(run, s, layout.readRound)[layout.readRound]!
  })
  const cell = line.at(layout.readPosition)
  const table = Int8Array.from(finals.map(f => f.get(cell) ?? layout.background))

  return { table, rides: ridesWire({ run, finals, cell, table, hold }) }
}
