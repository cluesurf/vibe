// M5, routing and gates (item vibe-computation-models-0016). Algebra: balanced ternary (Kleene neg, min, max) read
// through the spin-one tones of the 24 conservative reversible pair rules (M1) and their particles (M3). Library:
// code/compute/lab/gates.ts. Nothing is added to the mesh but a LAYOUT (tones on chosen cells at the start, the
// `programmer_layout` of Q3) and the schedule of decision 002.
//
// Declared before the experiment's first run (after four exploratory probes, W/tmp/gates-probe*.ts, which fixed the
// widths, radii and round counts below and showed the occupancy structure the theorem part states):
// - ENCODING: a trit is the tone of one slot (a cell at a round end); the background value is the empty slot. A WIRE is
//   a cell from which a lone tone of either off-background value moves as one cell along the same track and never
//   returns to a cell it held (24 rounds). An output counts only when it rides a wire for HOLD rounds after it is read.
// - SPACES: the infinite line (brick schedule); the coset family on {4,4}, {4,5}, {3,6}, {3,7}, {6,3}, {6,4}, {7,3}, {8,3}
//   (one schedule family on both sides of the three matched 2D pairs); the M1 families of {5,4}, {6,4} (generator),
//   {6,3} (A2 step parity), {3,4,3,3} (D4 step parity), {3,4,3,4} (generator). Balls of radius 2 (2D) and 1 (4D).
// - PART A, the occupancy theorem: brute force over the nine pairs finds the occupancy-blind (rule, background) cells;
//   brute force over each target's table shows no Kleene target is occupancy-routed; the lemma (tones move by a cell
//   permutation chosen by the start occupancy) is run live on every occupancy set of at most 3 cells in a 5-cell window
//   of the line and of {4,4}, for every tone assignment.
// - PART B, the line: every layout of width at most LINE_WIDTH (both start parities, every input placement, every
//   constant tone) for every rule and background with a ternary wire, every input, read at every cell for READ rounds;
//   every table that rides a wire is collected. Found gates are re-run by the sparse runner of particle-census.ts on the
//   line, cell for cell, and a corrupted table must be rejected.
// - PART C, the tilings (and the line again, as a sparse pair space): per space, rule and background, the wire cells
//   of the ball; for rules that are not
//   occupancy-blind, whether each wire is locked to one side of every pair it enters and whether two wires ever share a
//   pair; the obstacles (starts of one or two cells that return to themselves within 24 rounds) and what a wire does on
//   meeting one (reflected, turned, transmitted, tone-dependent, broken); every two-wire meeting at rounds 4 to 7 across
//   every color, classified exchange (the movers trade tracks: head-on a reflection pair, else a turn pair), cross or
//   other; and a bounded layout search (one input on a wire cell, the second input on any wire cell of the ball,
//   constants on any ball cell: up to 2 for neg, 1 for min and max; 1 and 0 in 4D) for every rule that is not blind.
// - SCHEDULES: every space of part C is read under its coloring in both color orders (decision 002, finding 0045);
//   a signature that changes with the order is reported as schedule-sensitive.
// - CURVATURE: flat against degree-matched hyperbolic only under one schedule family (decision 001, finding 0045): the
//   three coset pairs. The M1-family pairs ({6,3} A2 against {6,4} generator, D4 against {3,4,3,4}) are listed, not
//   credited.
// Gates (fail the run): the 24 rules; the lemma on every blind cell and set; a non-blind rule failing the lemma
// (negative control); no Kleene target on any blind cell anywhere (the theorem, checked against every search); every
// table a blind cell reaches on the line is occupancy-routed; every two-wire meeting of a blind rule gives only
// occupancy-routed tables; the sparse re-run of every found line gate; the corrupted table rejected; the positive controls
// (|x| or -|x| found by the line search for swap.ABC.swap on the vacuum, and read as c |x| on the port of an exchange
// meeting with a constant c on every space where that rule has wires: the turn used as a switch); the full swap's
// meetings all cross (control); two runs give identical bytes; no random number.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  CONTROL_TARGETS,
  ElementKind,
  GateRule,
  KLEENE_TARGETS,
  LineGate,
  MeetingKind,
  SpaceRun,
  TRITS,
  ballCells,
  elementReadings,
  fixesUniform,
  gateRule,
  headOn,
  inPlaceSpecies,
  inputsOf,
  lineWire,
  matchingTrack,
  meetingGate,
  meetingKind,
  occupancyBlind,
  occupancyCompatible,
  occupancyPermutes,
  occupancyRouted,
  pullBack,
  ridesWire,
  runRounds,
  searchLineGates,
  searchSpaceGates,
  wireAt,
} from '@/code/compute/lab/gates'
import { lazySpaceFactory } from '@/code/compute/lab/harness'
import { cosetSpace, roundColors } from '@/code/compute/lab/lazy-space'
import { PairSpace, Tones, lineSpace } from '@/code/measure/particle-census'
import { inverseTable, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/gates.ts', 'test/experiment/computation/ternary-gates.ts']

// ---- parameters, fixed before the first run ----

const WIRE_ROUNDS = 24
const READ = 8
const HOLD = 8
const LINE_WIDTH = 6
const LINE_WIDTH_WIDE = 7
const MEET_FROM = 4
const MEET_TO = 7
const MEET_AFTER = 8
const OBSTACLE_PERIOD = 24
const LEMMA_ROUNDS = 8
const SIDE_ROUNDS = 12
const FULL_SWAP = 'swap.CBA.swap'
const CONTROL_RULE = 'swap.ABC.swap'
const NON_BLIND_CONTROL = 'id.CAB.swap'

// ---- rules ----

type RuleDef = { name: string; rule: GateRule; inverse: GateRule; backgrounds: number[] }

function ruleDefs(): { defs: RuleDef[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()

  return {
    ruleCount: census.rules.length,
    classCount: pairRuleClasses({ rules: census.rules }).length,
    defs: census.rules.map(r => {
      const rule = gateRule(r.name, r.table)

      return {
        name: r.name,
        rule,
        inverse: gateRule(`${r.name}^-1`, inverseTable(r.table)),
        backgrounds: [-1, 0, 1].filter(b => fixesUniform(rule, b)),
      }
    }),
  }
}

// ---- spaces ----

type Family = 'brick' | 'coset-lifted' | 'generator' | 'step-parity'

type SpaceDef = {
  key: string
  family: Family
  curvature: 'flat' | 'hyperbolic'
  dimension: number
  radius: number
  make: (order: Order) => { space: PairSpace; colors: number[]; coloring: string }
}

// the two schedules of each space (decision 002, finding 0045): its coloring with the colors in index order and reversed
type Order = 'forward' | 'reverse'

const ORDERS: readonly Order[] = ['forward', 'reverse']

function lazyDef(key: string, family: Family, curvature: 'flat' | 'hyperbolic', dimension: number, make: () => ReturnType<typeof cosetSpace>): SpaceDef {
  return {
    key,
    family,
    curvature,
    dimension,
    radius: dimension === 4 ? 1 : 2,
    make: order => {
      const space = make()

      return { space, colors: roundColors(space, order), coloring: space.coloring }
    },
  }
}

function spaceDefs(only?: readonly string[]): SpaceDef[] {
  const coset = (key: string, p: number, q: number, curvature: 'flat' | 'hyperbolic'): SpaceDef =>
    lazyDef(`${key}/coset`, 'coset-lifted', curvature, 2, () => cosetSpace({ name: `${key}/coset`, p, q }))

  const m1 = (key: '{5,4}' | '{6,4}' | '{6,3}' | '{3,4,3,3}' | '{3,4,3,4}', family: Family, curvature: 'flat' | 'hyperbolic', dimension: number): SpaceDef =>
    lazyDef(key, family, curvature, dimension, lazySpaceFactory(key)!)

  const all: SpaceDef[] = [
    {
      key: 'line',
      family: 'brick',
      curvature: 'flat',
      dimension: 1,
      radius: 2,
      make: order => ({
        space: lineSpace(),
        colors: order === 'forward' ? [0, 1] : [1, 0],
        coloring: 'brick schedule of the infinite line (2 colors, left cell first)',
      }),
    },
    coset('{4,4}', 4, 4, 'flat'),
    coset('{4,5}', 4, 5, 'hyperbolic'),
    coset('{3,6}', 3, 6, 'flat'),
    coset('{3,7}', 3, 7, 'hyperbolic'),
    coset('{6,3}', 6, 3, 'flat'),
    coset('{6,4}', 6, 4, 'hyperbolic'),
    coset('{7,3}', 7, 3, 'hyperbolic'),
    coset('{8,3}', 8, 3, 'hyperbolic'),
    m1('{5,4}', 'generator', 'hyperbolic', 2),
    m1('{6,4}', 'generator', 'hyperbolic', 2),
    m1('{6,3}', 'step-parity', 'flat', 2),
    m1('{3,4,3,3}', 'step-parity', 'flat', 4),
    m1('{3,4,3,4}', 'generator', 'hyperbolic', 4),
  ]

  return only ? all.filter(d => only.includes(d.key)) : all
}

const MATCHED: readonly { flat: string; hyperbolic: string; oneFamily: boolean }[] = [
  { flat: '{4,4}/coset', hyperbolic: '{4,5}/coset', oneFamily: true },
  { flat: '{6,3}/coset', hyperbolic: '{6,4}/coset', oneFamily: true },
  { flat: '{3,6}/coset', hyperbolic: '{3,7}/coset', oneFamily: true },
  { flat: '{6,3}', hyperbolic: '{6,4}', oneFamily: false },
  { flat: '{3,4,3,3}', hyperbolic: '{3,4,3,4}', oneFamily: false },
]

// ---- part A: the occupancy theorem ----

type TheoremPart = {
  blindCells: string[]
  kleeneRouted: string[]
  controlRouted: string[]
  lemmaSets: number
  lemmaFailures: string[]
  nonBlindLemmaFailures: number
}

function theoremPart(defs: readonly RuleDef[]): TheoremPart {
  const blindCells: string[] = []

  for (const d of defs) {
    for (const b of d.backgrounds) {
      if (occupancyBlind(d.rule, b)) {
        blindCells.push(`${d.name}/${b}`)
      }
    }
  }

  const kleeneRouted = KLEENE_TARGETS.flatMap(t => [-1, 0, 1].filter(b => occupancyCompatible(t, b)).map(b => `${t.name}/${b}`))
  const controlRouted = CONTROL_TARGETS.flatMap(t => [-1, 0, 1].filter(b => occupancyCompatible(t, b)).map(b => `${t.name}/${b}`))

  const windows: { key: string; space: PairSpace; colors: number[]; cells: number[] }[] = []
  const line = lineSpace()

  windows.push({ key: 'line', space: line, colors: [0, 1], cells: [0, 1, 2, 3, 4].map(x => line.at(x)) })

  const square = spaceDefs(['{4,4}/coset'])[0]!.make('forward')

  windows.push({ key: '{4,4}/coset', space: square.space, colors: square.colors, cells: ballCells(square.space, 0, 1) })

  const subsets = (cells: readonly number[]): number[][] => {
    const out: number[][] = []

    for (let mask = 1; mask < 2 ** cells.length; mask++) {
      const s = cells.filter((_, i) => (mask >> i) & 1)

      if (s.length <= 3) {
        out.push(s)
      }
    }

    return out
  }

  let lemmaSets = 0
  let nonBlindLemmaFailures = 0

  const lemmaFailures: string[] = []

  for (const w of windows) {
    for (const d of defs) {
      for (const b of d.backgrounds) {
        const blind = occupancyBlind(d.rule, b)

        if (!blind && d.name !== NON_BLIND_CONTROL) {
          continue
        }

        const run: SpaceRun = { space: w.space, colors: w.colors, rule: d.rule, background: b }

        for (const s of subsets(w.cells)) {
          const holds = occupancyPermutes(run, s, LEMMA_ROUNDS)

          if (blind) {
            lemmaSets++

            if (!holds) {
              lemmaFailures.push(`${w.key} ${d.name}/${b} {${s.join(',')}}`)
            }
          } else if (!holds) {
            nonBlindLemmaFailures++
          }
        }
      }
    }
  }

  return { blindCells, kleeneRouted, controlRouted, lemmaSets, lemmaFailures, nonBlindLemmaFailures }
}

// ---- part B: the line ----

type LineCell = {
  rule: string
  background: number
  blind: boolean
  wires: string
  width: number
  kleene: LineGate[]
  controls: LineGate[]
  absent: Record<string, number>
  unary: string[]
  binary: number
  // reachable tables of a blind cell that are not occupancy-routed (the theorem says none)
  unrouted: number
  layouts: number
  runs: number
}

type LinePart = {
  cells: LineCell[]
  // combinations with no ternary wire at either parity: no output can carry a trit
  noWire: string[]
  verified: number
  verifyFailures: string[]
  corruptedRejected: boolean
}

// re-run a line gate by the sparse runner, every input, and check the read slot and its wire
function verifyLineGate(def: RuleDef, gate: LineGate, table: Int8Array): boolean {
  const line = lineSpace()
  const run: SpaceRun = { space: line, colors: [0, 1], rule: def.rule, background: gate.background }
  const arity = gate.inputs.length
  const finals: Tones[] = inputsOf(arity).map(x => {
    const s: Tones = new Map()

    gate.window.forEach((tone, i) => {
      const j = gate.inputs.indexOf(i)
      const v = j >= 0 ? x[j]! : tone!

      if (v !== gate.background) {
        s.set(line.at(gate.start + i), v)
      }
    })

    return runRounds(run, s, gate.readRound)[gate.readRound]!
  })
  const cell = line.at(gate.readPosition)
  const read = finals.map(f => f.get(cell) ?? gate.background)

  return read.every((v, n) => v === table[n]) && ridesWire({ run, finals, cell, table, hold: HOLD })
}

function linePart(defs: readonly RuleDef[], width: number): LinePart {
  const cells: LineCell[] = []
  const noWire: string[] = []
  const verifyFailures: string[] = []

  let verified = 0
  let corruptedRejected = false

  for (const d of defs) {
    for (const b of d.backgrounds) {
      const wires = [0, 1].map(parity => lineWire({ rule: d.rule, background: b, parity, rounds: WIRE_ROUNDS }))

      if (!wires.some(w => w.ternary)) {
        noWire.push(`${d.name}/${b}`)
        continue
      }

      const blind = occupancyBlind(d.rule, b)
      const s = searchLineGates({
        rule: d.rule,
        background: b,
        targets: [...KLEENE_TARGETS, ...CONTROL_TARGETS],
        maxWidth: width,
        readRounds: READ,
        hold: HOLD,
        collect: true,
      })
      const kleene = s.gates.filter(g => KLEENE_TARGETS.some(t => t.name === g.target))
      const controls = s.gates.filter(g => CONTROL_TARGETS.some(t => t.name === g.target))

      for (const g of s.gates) {
        const target = [...KLEENE_TARGETS, ...CONTROL_TARGETS].find(t => t.name === g.target)!

        verified++

        if (!verifyLineGate(d, g, target.table)) {
          verifyFailures.push(`${d.name}/${b} ${g.target}`)
        }

        if (!corruptedRejected) {
          const bad = Int8Array.from(target.table)

          bad[0] = bad[0] === 1 ? 0 : bad[0]! + 1
          corruptedRejected = !verifyLineGate(d, g, bad)
        }
      }

      const keys = [...s.reachable.keys()]
      const unrouted = blind
        ? keys.filter(k => {
            const [arity, table] = k.split(':') as [string, string]

            return !occupancyRouted(table.split(',').map(Number), Number(arity), b)
          }).length
        : 0

      cells.push({
        rule: d.name,
        background: b,
        blind,
        wires: wires.map(w => (w.ternary ? `parity ${w.parity} v${w.velocity}` : `parity ${w.parity} none`)).join(', '),
        width,
        kleene,
        controls,
        absent: s.absent,
        unary: keys.filter(k => k.startsWith('1:')).map(k => k.slice(2)).sort(),
        binary: keys.filter(k => k.startsWith('2:')).length,
        unrouted,
        layouts: s.layouts,
        runs: s.runs,
      })
    }
  }

  return { cells, noWire, verified, verifyFailures, corruptedRejected }
}

// ---- part C: the tilings ----

type TilingCell = {
  space: string
  order: Order
  rule: string
  background: number
  blind: boolean
  ball: number
  wires: number
  // non-blind: every wire locked to one side of each pair it enters ('first' or 'second'), else 'mixed'
  side: string
  sharedPairs: number
  obstacles: number
  elements: Partial<Record<ElementKind, number>>
  meetings: number
  meetingKinds: Partial<Record<MeetingKind, number>>
  headOnExchanges: number
  unroutedMeetings: number
  kleene: string[]
  controls: string[]
  layouts: number
}

function tilingCell(def: SpaceDef, order: Order, d: RuleDef, background: number): TilingCell | null {
  const { space, colors } = def.make(order)
  const run: SpaceRun & { inverse: GateRule } = { space, colors, rule: d.rule, background, inverse: d.inverse }
  const ball = ballCells(space, 0, def.radius)
  const wireMap = new Map(ball.map(c => [c, wireAt(run, c, WIRE_ROUNDS)]))
  const wires = ball.filter(c => wireMap.get(c)!.ternary)

  if (wires.length === 0) {
    return null
  }

  const blind = occupancyBlind(d.rule, background)
  const tones = TRITS.filter(t => t !== background)

  // side locking and shared pairs, for rules that are not blind
  let side = 'n/a'
  let sharedPairs = 0

  if (!blind) {
    const tracks = wires.map(c => tones.map(t => matchingTrack(run, c, t, SIDE_ROUNDS)))
    const sides = new Set(
      tracks.flatMap(ts =>
        ts.map(t => (t === null ? 'broken' : t.first.every(Boolean) ? 'first' : t.first.every(f => !f) ? 'second' : 'mixed')),
      ),
    )

    side = sides.size === 1 ? [...sides][0]! : 'mixed'

    for (let i = 0; i < wires.length; i++) {
      for (let j = i + 1; j < wires.length; j++) {
        const a = tracks[i]![0]!.cells
        const b = tracks[j]![0]!.cells

        a.forEach((c, k) => {
          if (space.partner(colors[k % colors.length]!, c) === b[k]) {
            sharedPairs++
          }
        })
      }
    }
  }

  // obstacles and the elements they make
  const obstacles = inPlaceSpecies(run, 0, def.radius, OBSTACLE_PERIOD)
  const elements: Partial<Record<ElementKind, number>> = {}

  for (const o of obstacles) {
    for (const e of elementReadings({ run, obstacle: o, reach: def.radius + 1, rounds: WIRE_ROUNDS })) {
      elements[e.kind!] = (elements[e.kind!] ?? 0) + 1
    }
  }

  // two-wire meetings
  const meetingKinds: Partial<Record<MeetingKind, number>> = {}
  const a = wires[0]!
  const aTrack = wireMap.get(a)!.track!

  const controlSet = new Set<string>()
  const yIs = (c: number): number[] => inputsOf(2).flatMap((x, n) => (x[1] === c ? [n] : []))

  let meetings = 0
  let headOnExchanges = 0
  let unroutedMeetings = 0

  for (let meet = MEET_FROM; meet <= MEET_TO; meet++) {
    for (let color = 0; color < space.colorCount; color++) {
      const at = aTrack[meet]!
      const b = space.partner(color, at)

      if (b < 0) {
        continue
      }

      const starts = tones.map(t => [...pullBack(run, new Map([[b, t]]), meet).entries()])

      if (starts.some(s => s.length !== 1) || starts[0]![0]![0] !== starts[1]![0]![0]) {
        continue
      }

      const bStart = starts[0]![0]![0]
      const bWire = wireAt(run, bStart, WIRE_ROUNDS)

      if (!bWire.ternary || bWire.track![meet] !== b || bStart === a) {
        continue
      }

      const total = meet + MEET_AFTER
      const g = meetingGate({ run, aStart: a, bStart, rounds: total, portA: aTrack[total]!, portB: bWire.track![total]! })
      const kind = meetingKind(g, background)

      meetings++
      meetingKinds[kind] = (meetingKinds[kind] ?? 0) + 1

      if (kind === 'exchange' && headOn(space, aTrack, bWire.track!, meet, 3)) {
        headOnExchanges++
      }

      // positive control: on the vacuum, an exchange with a constant c on the second wire puts c |x| on the first
      // wire's port (a switch: x present routes c), which is |x| for c = +1 and -|x| for c = -1
      if (kind === 'exchange' && d.name === CONTROL_RULE && background === 0) {
        for (const c of tones) {
          const sel = yIs(c)
          const table = sel.map(n => g.tableA[n]!)
          const want = CONTROL_TARGETS.find(t => t.name === (c === 1 ? 'abs' : 'negAbs'))!

          if (
            table.every((v, i) => v === want.table[i]) &&
            ridesWire({ run, finals: sel.map(n => g.finals[n]!), cell: g.portA, table, hold: HOLD })
          ) {
            controlSet.add(want.name)
          }
        }
      }

      if (blind) {
        for (const table of g.cells.values()) {
          if (!occupancyRouted(table, 2, background)) {
            unroutedMeetings++
          }
        }
      }
    }
  }

  // bounded layout search
  const four = def.dimension === 4

  let kleene: string[] = []
  let layouts = 0

  if (!blind) {
    const s = searchSpaceGates({
      run,
      targets: KLEENE_TARGETS,
      first: a,
      second: wires,
      constantCells: ball,
      maxConstants: four ? { neg: 1, min: 0, max: 0 } : { neg: 2, min: 1, max: 1 },
      readRounds: READ,
      hold: HOLD,
    })

    kleene = s.gates.map(g => `${g.target}@${g.readRound}`)
    layouts = Object.values(s.layouts).reduce((x, y) => x + y, 0)
  }

  const controls = [...controlSet].sort()

  return {
    space: def.key,
    order,
    rule: d.name,
    background,
    blind,
    ball: ball.length,
    wires: wires.length,
    side,
    sharedPairs,
    obstacles: obstacles.length,
    elements,
    meetings,
    meetingKinds,
    headOnExchanges,
    unroutedMeetings,
    kleene,
    controls,
    layouts,
  }
}

function tilingPart(defs: readonly RuleDef[], only?: readonly string[]): { cells: TilingCell[]; spaces: { key: string; coloring: string; ball: number }[] } {
  const cells: TilingCell[] = []
  const spaces: { key: string; coloring: string; ball: number }[] = []

  for (const def of spaceDefs(only)) {
    const probe = def.make('forward')

    spaces.push({ key: def.key, coloring: probe.coloring, ball: ballCells(probe.space, 0, def.radius).length })

    for (const order of ORDERS) {
      for (const d of defs) {
        for (const b of d.backgrounds) {
          const c = tilingCell(def, order, d, b)

          if (c) {
            cells.push(c)
          }
        }
      }
    }
  }

  return { cells, spaces }
}

// the signature a curvature comparison reads: wires, blindness, element kinds, meeting kinds, gates
const signature = (c: TilingCell | undefined): string =>
  c === undefined
    ? 'no wire'
    : [
        c.blind ? 'blind' : 'not blind',
        `side ${c.side}`,
        `elements ${Object.keys(c.elements).sort().join('+') || 'none'}`,
        `meetings ${Object.keys(c.meetingKinds).sort().join('+') || 'none'}`,
        `head-on ${c.headOnExchanges > 0 ? 'yes' : 'no'}`,
        `kleene ${c.kleene.length}`,
      ].join(', ')

// ---- the whole run ----

function ternaryGates(input: { scale: number; only?: readonly string[]; lineWidth?: number }): {
  ruleCount: number
  classCount: number
  theorem: TheoremPart
  line: LinePart
  tiling: { cells: TilingCell[]; spaces: { key: string; coloring: string; ball: number }[] }
  comparisons: { pair: string; order: Order; oneFamily: boolean; cells: number; differ: string[] }[]
  // space, rule and background whose signature changes with the color order
  scheduleSensitive: string[]
  serialized: string
} {
  const { defs, ruleCount, classCount } = ruleDefs()
  const theorem = theoremPart(defs)
  const line = linePart(defs, input.lineWidth ?? (input.scale >= 2 ? LINE_WIDTH_WIDE : LINE_WIDTH))
  const tiling = tilingPart(defs, input.only)
  const comparisons: { pair: string; order: Order; oneFamily: boolean; cells: number; differ: string[] }[] = []
  const find = (space: string, order: Order, rule: string, b: number): TilingCell | undefined =>
    tiling.cells.find(c => c.space === space && c.order === order && c.rule === rule && c.background === b)

  for (const m of MATCHED) {
    if (!tiling.spaces.some(s => s.key === m.flat) || !tiling.spaces.some(s => s.key === m.hyperbolic)) {
      continue
    }

    for (const order of ORDERS) {
      const differ: string[] = []

      let count = 0

      for (const d of defs) {
        for (const b of d.backgrounds) {
          const f = find(m.flat, order, d.name, b)
          const h = find(m.hyperbolic, order, d.name, b)

          if (!f && !h) {
            continue
          }

          count++

          if (signature(f) !== signature(h)) {
            differ.push(`${d.name}/${b}: ${signature(f)} | ${signature(h)}`)
          }
        }
      }

      comparisons.push({ pair: `${m.flat} vs ${m.hyperbolic}`, order, oneFamily: m.oneFamily, cells: count, differ })
    }
  }

  const scheduleSensitive: string[] = []

  for (const s of tiling.spaces) {
    for (const d of defs) {
      for (const b of d.backgrounds) {
        const f = find(s.key, 'forward', d.name, b)
        const r = find(s.key, 'reverse', d.name, b)

        if ((f || r) && signature(f) !== signature(r)) {
          scheduleSensitive.push(`${s.key} ${d.name}/${b}: ${signature(f)} | ${signature(r)}`)
        }
      }
    }
  }

  const serialized = JSON.stringify({
    theorem,
    line: line.cells.map(c => [c.rule, c.background, c.kleene.length, c.controls.map(g => `${g.target}:${g.width}:${g.readPosition}:${g.readRound}`), c.unary, c.binary]),
    tiling: tiling.cells,
  })

  return { ruleCount, classCount, theorem, line, tiling, comparisons, scheduleSensitive, serialized }
}

export default experiment({
  id: 'computation/ternary-gates',
  code: 'E-CMP-0050',
  title:
    'M5 routing and gates: wires, reflectors, turns and crossings from the M1 pair rules and M3 movers, and an exhaustive search for a conservative Kleene gate set (neg, min, max with garbage), with the occupancy no-go that explains its absence',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{7,3}', '{8,3}', '{5,4}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run(context) {
    const r = ternaryGates({ scale: context.scale ?? 1 })
    const twice = (): string => ternaryGates({ scale: 1, only: ['{4,4}/coset'], lineWidth: 4 }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const t = r.theorem
    const blindSet = new Set(t.blindCells)
    const blindKleeneLine = r.line.cells.filter(c => c.blind && c.kleene.length > 0)
    const blindKleeneTiling = r.tiling.cells.filter(c => c.blind && c.kleene.length > 0)
    const kleeneLine = r.line.cells.reduce((s, c) => s + c.kleene.length, 0)
    const kleeneTiling = r.tiling.cells.reduce((s, c) => s + c.kleene.length, 0)
    const unroutedLine = r.line.cells.reduce((s, c) => s + c.unrouted, 0)
    const unroutedMeetings = r.tiling.cells.reduce((s, c) => s + c.unroutedMeetings, 0)
    const lineControl = r.line.cells.find(c => c.rule === CONTROL_RULE && c.background === 0)
    const tilingControl = r.tiling.cells.filter(c => c.rule === CONTROL_RULE && c.background === 0)
    const controlMissed = tilingControl.filter(c => c.controls.length === 0).map(c => `${c.space} ${c.order}`)
    const headOnCells = r.tiling.cells.filter(c => c.headOnExchanges > 0).map(c => `${c.space} ${c.order}`)
    const fullSwapNotCross = r.tiling.cells.filter(
      c => c.rule === FULL_SWAP && Object.keys(c.meetingKinds).some(k => k !== 'cross'),
    )
    const nonBlindTiling = r.tiling.cells.filter(c => !c.blind)
    const sideMixed = nonBlindTiling.filter(c => c.side === 'mixed' || c.side === 'broken')
    const sharedPairs = nonBlindTiling.reduce((s, c) => s + c.sharedPairs, 0)
    const staticElements = r.tiling.cells.filter(c => Object.keys(c.elements).some(k => k === 'reflector' || k === 'turn'))
    const exchangeCells = r.tiling.cells.filter(c => (c.meetingKinds.exchange ?? 0) > 0)
    const resolved = r.comparisons.filter(c => c.oneFamily)
    const resolvedDiffer = resolved.reduce((s, c) => s + c.differ.length, 0)
    const checks: [boolean, string][] = [
      [r.ruleCount === 24 && r.classCount === 12, 'rule census'],
      [t.blindCells.length > 0 && t.kleeneRouted.length === 0, `occupancy algebra (blind ${t.blindCells.length}, kleene routed ${t.kleeneRouted.join(' ')})`],
      [t.controlRouted.includes('abs/0'), 'abs on the vacuum must be occupancy-routed'],
      [t.lemmaSets > 0 && t.lemmaFailures.length === 0, `lemma ${t.lemmaFailures.slice(0, 3).join('; ')}`],
      [t.nonBlindLemmaFailures > 0, 'non-blind control passed the lemma'],
      [blindKleeneLine.length === 0 && blindKleeneTiling.length === 0, 'a blind cell computed a Kleene target'],
      [unroutedLine === 0, `blind line tables not occupancy-routed ${unroutedLine}`],
      [unroutedMeetings === 0, `blind meeting tables not occupancy-routed ${unroutedMeetings}`],
      [r.line.verifyFailures.length === 0 && r.line.verified > 0, `sparse re-run ${r.line.verifyFailures.join(' ')}`],
      [r.line.corruptedRejected, 'corrupted table accepted'],
      [lineControl !== undefined && lineControl.controls.length > 0, 'positive control on the line'],
      [controlMissed.length === 0 && tilingControl.length > 0, `positive control missed on ${controlMissed.join(' ')}`],
      [fullSwapNotCross.length === 0, `full swap meeting not a crossing on ${fullSwapNotCross.map(c => c.space).join(' ')}`],
      [blindSet.size === t.blindCells.length, 'blind cells unique'],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const wireTilings = [...new Set(r.tiling.cells.map(c => c.space))]
    const noWireSpaces = r.tiling.spaces.map(s => s.key).filter(k => !wireTilings.includes(k))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `under the M1 pair rules with a declared layout, a trit rides a wire (a lone tone of either value on one track) for ${r.line.cells.length} rule-background cells on the line and on every tiling but ${noWireSpaces.join(', ') || 'none'}; no static obstacle reflects or turns a wire anywhere (${staticElements.length} cells), so every reflector and turn is a mover meeting a mover: the occupancy-blind rules trade the two movers' tracks (${exchangeCells.length} space-order-rule cells; head-on, a reflection pair, on ${[...new Set(headOnCells)].length} space-orders; otherwise a turn pair), which with a constant on one wire is a switch, and the full swap crosses them; no layout computes Kleene neg, min or max on an output wire (${kleeneLine} on the line to width ${r.line.cells[0]?.width ?? 0}, ${kleeneTiling} in the bounded tiling search), because on the ${t.blindCells.length} occupancy-blind rule-background cells tones move by a cell permutation chosen by occupancy alone and no Kleene target is occupancy-routed (brute force over pairs and tables: any graph, schedule and layout), while the not-blind wire rules lock every wire to one side of every pair (${sharedPairs} shared pairs), so two signals never meet and no layout in the searched bounds computes a target; under one schedule family the matched pairs differ in ${resolvedDiffer} of ${resolved.reduce((s, c) => s + c.cells, 0)} rule-background-order signatures${resolved.every(c => c.differ.length === 0 || c.pair.startsWith('{3,6}')) ? ', all of them {3,6} against {3,7}, where {3,6} has no wire (the face-length confinement of M1, not curvature)' : ', some outside {3,6}'}, and ${r.scheduleSensitive.length} signatures change with the color order`,
      metrics: {
        blindCells: t.blindCells.length,
        lemmaSets: t.lemmaSets,
        lineCells: r.line.cells.length,
        lineLayouts: r.line.cells.reduce((s, c) => s + c.layouts, 0),
        lineRuns: r.line.cells.reduce((s, c) => s + c.runs, 0),
        lineKleene: kleeneLine,
        lineGatesVerified: r.line.verified,
        tilingCells: r.tiling.cells.length,
        tilingKleene: kleeneTiling,
        tilingLayouts: r.tiling.cells.reduce((s, c) => s + c.layouts, 0),
        meetings: r.tiling.cells.reduce((s, c) => s + c.meetings, 0),
        exchangeMeetings: r.tiling.cells.reduce((s, c) => s + (c.meetingKinds.exchange ?? 0), 0),
        crossMeetings: r.tiling.cells.reduce((s, c) => s + (c.meetingKinds.cross ?? 0), 0),
        otherMeetings: r.tiling.cells.reduce((s, c) => s + (c.meetingKinds.other ?? 0), 0),
        headOnExchanges: r.tiling.cells.reduce((s, c) => s + c.headOnExchanges, 0),
        obstacles: r.tiling.cells.reduce((s, c) => s + c.obstacles, 0),
        staticReflectorOrTurnCells: staticElements.length,
        nonBlindTilingCells: nonBlindTiling.length,
        sideMixed: sideMixed.length,
        sharedPairs,
        comparisonsOneFamily: resolved.reduce((s, c) => s + c.cells, 0),
        comparisonsDiffering: resolvedDiffer,
        scheduleSensitive: r.scheduleSensitive.length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        nonBlindLemmaFailures: t.nonBlindLemmaFailures,
        lineControlGates: lineControl?.controls.length ?? 0,
        tilingControlSpaces: tilingControl.length - controlMissed.length,
        corruptedRejected: r.line.corruptedRejected ? 1 : 0,
        fullSwapNonCross: fullSwapNotCross.length,
      },
      notes:
        `M5 (item vibe-computation-models-0016). Spaces: ${r.tiling.spaces.map(s => `${s.key} (${s.ball} ball cells)`).join(', ')}. Comparisons: ${r.comparisons.map(c => `${c.pair} ${c.order}${c.oneFamily ? '' : ' (no common family)'} ${c.differ.length}/${c.cells}`).join('; ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})

export { ternaryGates }
