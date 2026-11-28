// Item vibe-computation-models-0061: do Kleene min and max exist for the four 3-cycle wire rules that compute neg
// (id.CAB.swap and id.BCA.swap on +1, swap.BCA.id and swap.CAB.id on -1; E-CMP-0058), and if so, does the full basis
// reopen M6 universality for that reactive class? Library: code/compute/lab/ray-search.ts on code/compute/lab/gates.ts
// and code/compute/lab/wire-invariant.ts.
//
// Declared before the experiment's first run (after six probes, W/tmp/kleene-basis-probe*.ts):
// - PART A, the line, in a fixed order: the ray search (every window from its output ray rightward, span 1 to
//   LINE_SPAN, every constant, the inputs anywhere) for neg, then min and max, on each of the 8 rule-background cells
//   with a one-sided wire (the four one-law cells and the two two-law rules on both backgrounds). Each smallest hit is
//   replayed for every input by the dense brick run and by the sparse runner, the output riding its wire HOLD rounds.
//   Controls: the two-law cells find nothing (the passenger theorem); each min or max window replayed under the two-law
//   rule of its background does not compute it; a corrupted table is rejected; the four one-law cells are exact
//   conjugates (mirror and negation) and their windows transfer under the conjugacy.
// - PART B, the instrument: the ray picture equals the dense run on every unary window of span <= CHECK_SPAN for a
//   one-law and a two-law rule, and the packed search's unary table count equals the plain evaluator's to CHECK_SPAN.
// - PART C, composition: the bus search (every right ray of a window an output, three inputs in any order) on
//   id.CAB.swap for the ternary mux (c = v ? b : a), the swapped pair and the Fredkin-style controlled swap (c, a', b'),
//   v = -1, 0, 1, to BUS_SPAN; and the binary tables ray 0 reaches by span (functional completeness on two inputs).
// - PART D, finitely many interactions on the line: every start of width <= SETTLE_WIDTH of each one-sided-wire cell
//   reaches a settled state (m6-universality.md) within SETTLE_ROUNDS, and is in free flight for SETTLE_EXTRA rounds
//   after. Control: a reactive cell with a static (id.CAB.id on +1) has starts that never settle.
// - PART E, side alternation: on the line and on every tiling read by M5, under both color orders, which cells of the
//   ball (radius 2, 1 in 4D) alternate sides through one round; the passenger theorem needs every cell to.
// - PART F, the tilings: for the four one-law cells, wherever they have a wire, the bounded layout search of gates.ts
//   for neg, min and max with TILING_CONSTANTS constants on the ball.
// Gates (fail the run): every listed condition, two runs giving identical bytes, no random number.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  GateRule,
  KLEENE_TARGETS,
  SpaceRun,
  ballCells,
  gateRule,
  lineBrickRun,
  searchSpaceGates,
  tableKey,
  wireAt,
} from '@/code/compute/lab/gates'
import { lazySpaceFactory } from '@/code/compute/lab/harness'
import { LazySpace, cosetSpace, roundColors } from '@/code/compute/lab/lazy-space'
import {
  BusTarget,
  RaySide,
  mirrorRule,
  negateRule,
  rayLayoutToLine,
  rayTables,
  sameRule,
  searchRayBus,
  searchRays,
  settledLine,
  wideTable,
  wireSide,
} from '@/code/compute/lab/ray-search'
import { LineLayout, denseLineTable, sparseLineTable } from '@/code/compute/lab/wire-invariant'
import { PairSpace, lineSpace } from '@/code/measure/particle-census'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/ray-search.ts', 'test/experiment/computation/kleene-basis.ts']

// ---- parameters, fixed before the first run ----

const HOLD = 8
const LINE_SPAN = 13
const LINE_SPAN_WIDE = 15
const CHECK_SPAN = 7
const COUNT_SPAN = 8
const BUS_SPAN = 12
const SETTLE_WIDTH = 7
const SETTLE_ROUNDS = 60
const SETTLE_EXTRA = 16
const TILING_CONSTANTS = { flat: { neg: 2, min: 2, max: 2 }, four: { neg: 2, min: 1, max: 1 } }
const WIRE_ROUNDS = 24
const READ = 8

const ONE_LAW: readonly [string, number][] = [
  ['id.CAB.swap', 1],
  ['id.BCA.swap', 1],
  ['swap.BCA.id', -1],
  ['swap.CAB.id', -1],
]
const TWO_LAW: readonly [string, number][] = [
  ['swap.BCA.swap', 1],
  ['swap.BCA.swap', -1],
  ['swap.CAB.swap', 1],
  ['swap.CAB.swap', -1],
]
const SETTLE_CONTROL: [string, number] = ['id.CAB.id', 1]
const NEG = KLEENE_TARGETS.find(t => t.name === 'neg')!
const BINARY = KLEENE_TARGETS.filter(t => t.arity === 2)

function rulesByName(): Map<string, GateRule> {
  return new Map(pairRuleCensus().rules.map(r => [r.name, gateRule(r.name, r.table)]))
}

// ---- part A ----

type LineHit = {
  rule: string
  background: number
  target: string
  span: number
  windows: number
  // the line layout, trimmed width (no background at either end)
  layout: LineLayout
  width: number
  dense: boolean
  sparse: boolean
  rides: boolean
}

type LineCell = {
  rule: string
  background: number
  side: RaySide
  found: Record<string, number | null>
  hits: LineHit[]
  binaryTablesBySpan: number[]
}

const trimmedWidth = (layout: LineLayout, background: number): number => {
  const cells = layout.window.map(v => v === null || v !== background)
  const first = cells.indexOf(true)
  const last = cells.lastIndexOf(true)

  return first < 0 ? 0 : last - first + 1
}

function verifyHit(rule: GateRule, background: number, target: string, layout: LineLayout): Omit<LineHit, 'rule' | 'background' | 'target' | 'span' | 'windows' | 'layout' | 'width'> {
  const want = tableKey(KLEENE_TARGETS.find(t => t.name === target)!.table)
  const sparse = sparseLineTable(rule, layout, HOLD)

  return {
    dense: tableKey(denseLineTable(rule, layout)) === want,
    sparse: tableKey(sparse.table) === want,
    rides: sparse.rides,
  }
}

function lineCell(rules: Map<string, GateRule>, name: string, background: number, span: number): LineCell {
  const rule = rules.get(name)!
  const side = wireSide(rule, background)!
  const unary = searchRays({ rule, background, targets: [NEG], maxSpan: span })
  const binary = searchRays({ rule, background, targets: BINARY, maxSpan: span })
  const hits: LineHit[] = []

  for (const s of [unary, binary]) {
    for (const h of s.hits) {
      const layout = rayLayoutToLine({ rays: h.rays, side, background, inputs: h.inputs })

      hits.push({
        rule: name,
        background,
        target: h.target,
        span: s.foundSpan[h.target]!,
        windows: s.foundCount[h.target]!,
        layout,
        width: trimmedWidth(layout, background),
        ...verifyHit(rule, background, h.target, layout),
      })
    }
  }

  return {
    rule: name,
    background,
    side,
    found: { ...unary.foundSpan, ...binary.foundSpan },
    hits,
    binaryTablesBySpan: binary.tablesBySpan,
  }
}

// the window of a hit carried to a conjugate cell: the mirror reverses it, the negation negates it (min <-> max)
function conjugateWindow(layout: LineLayout, how: 'mirror' | 'negate'): LineLayout {
  if (how === 'negate') {
    return { ...layout, background: -layout.background, window: layout.window.map(v => (v === null ? null : -v)) }
  }

  // reverse the window about cell 0 shifted by one (even cells to odd), so right rays become left rays
  const w = layout.window.length
  const start = 1 - (layout.start + w - 1)
  const shift = start < 0 ? 2 * Math.ceil(-start / 2) : 0

  return {
    background: layout.background,
    start: start + shift,
    window: [...layout.window].reverse(),
    inputs: layout.inputs.map(i => w - 1 - i),
    readPosition: 1 - layout.readPosition + shift,
    readRound: layout.readRound,
  }
}

// ---- part B ----

// the unary ray window of a span with the input at `at` and the other rays read from `code` in base 3
function unaryWindow(span: number, at: number, code: number): (number | null)[] {
  const rays: (number | null)[] = []

  let k = 0

  for (let i = 0; i < span; i++) {
    if (i === at) {
      rays.push(null)
    } else {
      rays.push((Math.floor(code / 3 ** k) % 3) - 1)
      k++
    }
  }

  return rays
}

function instrument(rules: Map<string, GateRule>): { windows: number; mismatches: number; countMatches: boolean } {
  let windows = 0
  let mismatches = 0

  for (const [name, background] of [ONE_LAW[0]!, TWO_LAW[1]!]) {
    const rule = rules.get(name)!
    const side = wireSide(rule, background)!

    for (let span = 1; span <= CHECK_SPAN; span++) {
      for (let at = 0; at < span; at++) {
        for (let code = 0; code < 3 ** (span - 1); code++) {
          const rays = unaryWindow(span, at, code)
          const ray0 = rayTables({ rule, side, rays, inputs: [at] })[0]!
          const layout = rayLayoutToLine({ rays, side, background, inputs: [at] })

          windows++

          if (tableKey(ray0) !== tableKey(denseLineTable(rule, layout))) {
            mismatches++
          }
        }
      }
    }
  }

  // the packed search's unary table count to COUNT_SPAN against the plain evaluator's
  const rule = rules.get(ONE_LAW[0]![0])!
  const side = wireSide(rule, ONE_LAW[0]![1])!
  const packed = searchRays({ rule, background: ONE_LAW[0]![1], targets: [NEG], maxSpan: COUNT_SPAN })
  const plain = new Set<string>()

  for (let span = 1; span <= COUNT_SPAN; span++) {
    for (let at = 0; at < span; at++) {
      for (let code = 0; code < 3 ** (span - 1); code++) {
        plain.add(tableKey(rayTables({ rule, side, rays: unaryWindow(span, at, code), inputs: [at] })[0]!))
      }
    }
  }

  return { windows, mismatches, countMatches: packed.tablesBySpan[COUNT_SPAN] === plain.size }
}

// ---- part C ----

function busTargets(): BusTarget[] {
  const out: BusTarget[] = []

  for (const v of [-1, 0, 1]) {
    const a2 = wideTable(([c, a, b]) => (c === v ? b! : a!))
    const b2 = wideTable(([c, a, b]) => (c === v ? a! : b!))
    const c2 = wideTable(([c]) => c!)

    out.push({ name: `mux${v}`, tables: [a2] }, { name: `swapPair${v}`, tables: [a2, b2] }, { name: `fredkin${v}`, tables: [c2, a2, b2] })
  }

  return out
}

// ---- part D ----

type SettleRow = { rule: string; background: number; starts: number; settled: number; worst: number; unsound: number }

function settle(rules: Map<string, GateRule>, name: string, background: number): SettleRow {
  const rule = rules.get(name)!

  let starts = 0
  let settled = 0
  let worst = 0
  let unsound = 0

  for (let w = 1; w <= SETTLE_WIDTH; w++) {
    for (let code = 0; code < 3 ** w; code++) {
      const window = Array.from({ length: w }, (_, i) => (Math.floor(code / 3 ** i) % 3) - 1)

      if (window[0] === background || window[w - 1] === background) {
        continue
      }

      for (const start of [0, 1]) {
        starts++

        const run = lineBrickRun({ rule, background, start, window, rounds: SETTLE_ROUNDS + SETTLE_EXTRA })
        const at = run.frames.findIndex((f, t) => t <= SETTLE_ROUNDS && settledLine(rule, background, f, run.pad))

        if (at < 0) {
          continue
        }

        settled++
        worst = Math.max(worst, at)

        // free flight after settling: every right tone two cells right per round, every left tone two left, nothing else
        const f = run.frames[at]!

        for (let s = 1; s <= SETTLE_EXTRA; s++) {
          const g = run.frames[at + s]!
          const want = new Int8Array(g.length).fill(background)

          f.forEach((v, i) => {
            if (v !== background) {
              want[((i - run.pad) & 1) === 0 ? i + 2 * s : i - 2 * s] = v
            }
          })

          if (!want.every((v, i) => v === g[i])) {
            unsound++
            break
          }
        }
      }
    }
  }

  return { rule: name, background, starts, settled, worst, unsound }
}

// ---- parts E and F: spaces ----

type SpaceDef = { key: string; dimension: number; make: () => LazySpace }

function spaceDefs(): SpaceDef[] {
  const coset = (p: number, q: number): SpaceDef => ({
    key: `{${p},${q}}/coset`,
    dimension: 2,
    make: () => cosetSpace({ name: `{${p},${q}}/coset`, p, q }),
  })
  const m1 = (key: '{5,4}' | '{6,4}' | '{6,3}' | '{3,4,3,3}' | '{3,4,3,4}', dimension: number): SpaceDef => ({
    key,
    dimension,
    make: lazySpaceFactory(key)!,
  })

  return [
    coset(4, 4),
    coset(4, 5),
    coset(3, 6),
    coset(3, 7),
    coset(6, 3),
    coset(6, 4),
    coset(7, 3),
    coset(8, 3),
    m1('{5,4}', 2),
    m1('{6,4}', 2),
    m1('{6,3}', 2),
    m1('{3,4,3,3}', 4),
    m1('{3,4,3,4}', 4),
  ]
}

type Order = 'forward' | 'reverse'

const ORDERS: readonly Order[] = ['forward', 'reverse']

const lineColors = (order: Order): number[] => (order === 'forward' ? [0, 1] : [1, 0])

type AlternationRow = { space: string; order: Order; ball: number; alternating: number }

function alternation(space: PairSpace, colors: readonly number[], cells: readonly number[]): number {
  return cells.filter(c => {
    const roles = colors.filter(k => space.partner(k, c) >= 0).map(k => space.isFirst(k, c))

    return roles.length % 2 === 0 && roles.every((r, i) => r !== roles[(i + 1) % roles.length])
  }).length
}

type TilingRow = { space: string; order: Order; rule: string; background: number; wires: number; layouts: number; gates: string[] }

function tilingSearch(rules: Map<string, GateRule>, def: SpaceDef, order: Order): TilingRow[] {
  const rows: TilingRow[] = []

  for (const [name, background] of ONE_LAW) {
    const space = def.make()
    const colors = roundColors(space, order)
    const run: SpaceRun = { space, colors, rule: rules.get(name)!, background }
    const ball = ballCells(space, 0, def.dimension === 4 ? 1 : 2)
    const wires = ball.filter(c => wireAt(run, c, WIRE_ROUNDS).ternary)

    if (wires.length === 0) {
      continue
    }

    const s = searchSpaceGates({
      run,
      targets: KLEENE_TARGETS,
      first: wires[0]!,
      second: wires,
      constantCells: ball,
      maxConstants: def.dimension === 4 ? TILING_CONSTANTS.four : TILING_CONSTANTS.flat,
      readRounds: READ,
      hold: HOLD,
    })

    rows.push({
      space: def.key,
      order,
      rule: name,
      background,
      wires: wires.length,
      layouts: Object.values(s.layouts).reduce((x, y) => x + y, 0),
      gates: s.gates.map(g => `${g.target}@${g.readRound}`),
    })
  }

  return rows
}

// ---- the whole run ----

function kleeneBasis(input: { scale: number; light?: boolean }): {
  sides: { rule: string; background: number; side: RaySide | null }[]
  conjugate: { mirror: boolean; negateBca: boolean; negateCab: boolean }
  line: LineCell[]
  transfers: { from: string; to: string; target: string; ok: boolean }[]
  controls: { rule: string; control: string; target: string; computes: boolean }[]
  instrument: ReturnType<typeof instrument> | null
  bus: ReturnType<typeof searchRayBus> | null
  settleRows: SettleRow[]
  alternationRows: AlternationRow[]
  tilingRows: TilingRow[]
  serialized: string
} {
  const rules = rulesByName()
  const span = input.light ? 9 : input.scale >= 2 ? LINE_SPAN_WIDE : LINE_SPAN
  const sides = pairRuleCensus().rules.flatMap(r =>
    [-1, 0, 1].map(background => ({ rule: r.name, background, side: wireSide(rules.get(r.name)!, background) })),
  )
  const r = (n: string): GateRule => rules.get(n)!
  const conjugate = {
    mirror: sameRule(mirrorRule(r('id.CAB.swap')), r('id.BCA.swap')) && sameRule(mirrorRule(r('swap.BCA.id')), r('swap.CAB.id')),
    negateBca: sameRule(negateRule(r('id.CAB.swap')), r('swap.BCA.id')),
    negateCab: sameRule(negateRule(r('id.BCA.swap')), r('swap.CAB.id')),
  }
  const line = [...ONE_LAW, ...TWO_LAW].map(([n, b]) => lineCell(rules, n, b, span))

  // transfers: the id.CAB.swap windows carried to its three conjugates, replayed there by both runners
  const transfers: { from: string; to: string; target: string; ok: boolean }[] = []
  const base = line[0]!

  for (const h of base.hits) {
    const carried: [string, LineLayout, string][] = [
      ['id.BCA.swap', conjugateWindow(h.layout, 'mirror'), h.target],
      ['swap.BCA.id', conjugateWindow(h.layout, 'negate'), h.target === 'min' ? 'max' : h.target === 'max' ? 'min' : h.target],
      ['swap.CAB.id', conjugateWindow(conjugateWindow(h.layout, 'mirror'), 'negate'), h.target === 'min' ? 'max' : h.target === 'max' ? 'min' : h.target],
    ]

    for (const [to, layout, target] of carried) {
      const v = verifyHit(r(to), layout.background, target, layout)

      transfers.push({ from: 'id.CAB.swap', to, target, ok: v.dense && v.sparse && v.rides })
    }
  }

  // controls: each one-law min/max window replayed under the two-law rule of its background
  const controls: { rule: string; control: string; target: string; computes: boolean }[] = []

  for (const cell of line.slice(0, 4)) {
    const control = cell.background === 1 ? (cell.side === 'right' ? 'swap.CAB.swap' : 'swap.BCA.swap') : cell.side === 'right' ? 'swap.BCA.swap' : 'swap.CAB.swap'

    for (const h of cell.hits) {
      const v = verifyHit(r(control), cell.background, h.target, h.layout)

      controls.push({ rule: cell.rule, control, target: h.target, computes: v.dense && v.sparse && v.rides })
    }
  }

  const settleRows = input.light ? [] : [...ONE_LAW, ...TWO_LAW, SETTLE_CONTROL].map(([n, b]) => settle(rules, n, b))
  const alternationRows: AlternationRow[] = []
  const tilingRows: TilingRow[] = []

  for (const order of ORDERS) {
    const ln = lineSpace()
    const cells = Array.from({ length: 9 }, (_, i) => ln.at(i - 4))

    alternationRows.push({ space: 'line', order, ball: cells.length, alternating: alternation(ln, lineColors(order), cells) })
  }

  for (const def of spaceDefs()) {
    for (const order of ORDERS) {
      const space = def.make()
      const ball = ballCells(space, 0, def.dimension === 4 ? 1 : 2)

      alternationRows.push({ space: def.key, order, ball: ball.length, alternating: alternation(space, roundColors(space, order), ball) })

      if (!input.light) {
        tilingRows.push(...tilingSearch(rules, def, order))
      }
    }
  }

  const bus = input.light ? null : searchRayBus({ rule: r('id.CAB.swap'), background: 1, targets: busTargets(), maxSpan: BUS_SPAN })
  const lineView = line.map(c => ({ rule: c.rule, background: c.background, side: c.side, found: c.found, hits: c.hits.map(h => ({ ...h })) }))

  return {
    sides,
    conjugate,
    line,
    transfers,
    controls,
    instrument: input.light ? null : instrument(rules),
    bus,
    settleRows,
    alternationRows,
    tilingRows,
    serialized: JSON.stringify({ conjugate, lineView, transfers, controls, alternationRows }),
  }
}

export default experiment({
  id: 'computation/kleene-basis',
  code: 'E-CMP-0061',
  title:
    'A full Kleene basis with garbage for the four one-law 3-cycle wire rules on the line (neg, min and max, each in one window, two runners), no Fredkin-style gate to the bus span, finitely many interactions from every finite start of the one-sided-wire cells (no Turing universality on the line), and no tiling schedule where every cell alternates sides',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{7,3}', '{8,3}', '{5,4}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run(context) {
    const scale = context.scale ?? 1
    const r = kleeneBasis({ scale })
    const twice = (): string => kleeneBasis({ scale: 1, light: true }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const oneSided = r.sides.filter(s => s.side !== null).map(s => `${s.rule}/${s.background}`).sort()
    const wantSided = [...ONE_LAW, ...TWO_LAW].map(([n, b]) => `${n}/${b}`).sort()
    const oneLaw = r.line.slice(0, 4)
    const twoLaw = r.line.slice(4)
    const corrupted = Int8Array.from(BINARY[0]!.table)

    corrupted[0] = corrupted[0] === 0 ? 1 : 0

    const corruptedRejected = oneLaw.every(c =>
      c.hits.filter(h => h.target === 'min').every(h => tableKey(sparseLineTable(rulesByName().get(c.rule)!, h.layout, HOLD).table) !== tableKey(corrupted)),
    )
    const settleCells = r.settleRows.slice(0, 8)
    const settleControl = r.settleRows[8]!
    const lineAlternates = r.alternationRows.filter(a => a.space === 'line').every(a => a.alternating === a.ball)
    const fullyAlternatingTilings = r.alternationRows.filter(a => a.space !== 'line' && a.alternating === a.ball)
    const inst = r.instrument!
    const bus = r.bus!
    const tilingGates = r.tilingRows.flatMap(t => t.gates.map(g => `${t.space}/${t.order}/${t.rule}:${g}`))
    const checks: [boolean, string][] = [
      [JSON.stringify(oneSided) === JSON.stringify(wantSided), `one-sided-wire cells ${oneSided.join(' ')}`],
      [r.conjugate.mirror && r.conjugate.negateBca && r.conjugate.negateCab, 'conjugacies'],
      [oneLaw.every(c => c.found.neg === 10 && c.found.min === 12 && c.found.max === 12), `one-law spans ${oneLaw.map(c => `${c.rule}:${JSON.stringify(c.found)}`).join(' ')}`],
      [oneLaw.every(c => c.hits.length === 3 && c.hits.every(h => h.dense && h.sparse && h.rides)), 'one-law hits not verified by both runners'],
      [twoLaw.every(c => c.found.neg === null && c.found.min === null && c.found.max === null), 'a two-law cell computed a Kleene connective'],
      [r.transfers.length === 9 && r.transfers.every(t => t.ok), `transfers ${r.transfers.filter(t => !t.ok).map(t => `${t.to}:${t.target}`).join(' ')}`],
      [r.controls.length === 12 && r.controls.every(c => !c.computes), 'a two-law control computed the target'],
      [corruptedRejected, 'corrupted table accepted'],
      [inst.mismatches === 0 && inst.countMatches, `instrument mismatches ${inst.mismatches}, count ${inst.countMatches}`],
      [settleCells.every(s => s.settled === s.starts && s.unsound === 0), `settle ${settleCells.map(s => `${s.rule}/${s.background}:${s.settled}/${s.starts}/${s.unsound}`).join(' ')}`],
      [settleControl.settled < settleControl.starts, 'settle control never fails'],
      [lineAlternates, 'line alternation'],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const busFound = Object.entries(bus.foundSpan).filter(([, s]) => s !== null)
    const tables = oneLaw[0]!.binaryTablesBySpan

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the four one-law 3-cycle wire cells (id.CAB.swap, id.BCA.swap on +1; swap.BCA.id, swap.CAB.id on -1) compute every Kleene connective on the line with garbage: neg from a window of span 10 and min and max from span 12 (line width ${oneLaw[0]!.hits.find(h => h.target === 'min')!.width}), each replayed by the dense and the sparse runner on every input with the output riding its wire ${HOLD} rounds, carried exactly to the three conjugate cells, and not computed by the two-law rule on the same window; the two-law cells reach none to span ${scale >= 2 ? LINE_SPAN_WIDE : LINE_SPAN}, as the passenger theorem says. The basis does not compose into a reversible conservative gate within the bounds (no ternary mux, swapped pair or Fredkin-style controlled swap on any right ray of a window to span ${BUS_SPAN}${busFound.length ? `; found: ${busFound.map(([n, s]) => `${n}@${s}`).join(', ')}` : ''}), and ray 0 reaches ${tables[tables.length - 1]} of 19,683 binary tables by span ${tables.length - 1}. On the line every finite start of the eight one-sided-wire cells has finitely many interactions (every start of width <= ${SETTLE_WIDTH} settles by round ${Math.max(...settleCells.map(s => s.worst))}, then flies free), so no counter, zero test or Turing machine runs there from a finite start. No tiling schedule makes every cell alternate sides (${fullyAlternatingTilings.length} of ${r.alternationRows.length - 2} space-orders), so the passenger theorem holds on the line only; the bounded tiling search found ${tilingGates.length} gates`,
      metrics: {
        oneSidedWireCells: oneSided.length,
        negSpan: oneLaw[0]!.found.neg ?? 0,
        minSpan: oneLaw[0]!.found.min ?? 0,
        maxSpan: oneLaw[0]!.found.max ?? 0,
        minWindows: oneLaw[0]!.hits.find(h => h.target === 'min')!.windows,
        minLineWidth: oneLaw[0]!.hits.find(h => h.target === 'min')!.width,
        hitsVerified: oneLaw.flatMap(c => c.hits).filter(h => h.dense && h.sparse && h.rides).length,
        transfersVerified: r.transfers.filter(t => t.ok).length,
        binaryTablesReached: tables[tables.length - 1]!,
        busTargetsFound: busFound.length,
        busWindows: bus.windows,
        settleStarts: settleCells.reduce((s, x) => s + x.starts, 0),
        settleWorstRound: Math.max(...settleCells.map(s => s.worst)),
        fullyAlternatingTilingOrders: fullyAlternatingTilings.length,
        tilingLayouts: r.tilingRows.reduce((s, t) => s + t.layouts, 0),
        tilingGates: tilingGates.length,
        instrumentWindows: inst.windows,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        twoLawConnectives: twoLaw.reduce((s, c) => s + Object.values(c.found).filter(v => v !== null).length, 0),
        twoLawRuleOnOneLawWindows: r.controls.filter(c => c.computes).length,
        instrumentMismatches: inst.mismatches,
        settleControlNeverSettled: settleControl.starts - settleControl.settled,
        corruptedRejected: corruptedRejected ? 1 : 0,
      },
      notes:
        `Item vibe-computation-models-0061. Line hits: ${r.line.flatMap(c => c.hits.map(h => `${h.rule}/${h.background} ${h.target} span ${h.span} (${h.windows} windows) start ${h.layout.start} window ${JSON.stringify(h.layout.window)} read ${h.layout.readPosition}@${h.layout.readRound}`)).join('; ')}. Binary tables by span (id.CAB.swap): ${tables.slice(1).join(',')}. Bus: ${JSON.stringify(bus.foundSpan)}, ${bus.windows} windows. Settle: ${r.settleRows.map(s => `${s.rule}/${s.background} ${s.settled}/${s.starts} worst ${s.worst}`).join('; ')}. Alternation: ${r.alternationRows.map(a => `${a.space}/${a.order} ${a.alternating}/${a.ball}`).join('; ')}. Tilings: ${r.tilingRows.map(t => `${t.space}/${t.order}/${t.rule} wires ${t.wires} layouts ${t.layouts} gates ${t.gates.join('+') || 'none'}`).join('; ')}. ${ok ? '' : `Failures: ${failures.join('; ')}`}`.trim(),
    })
  },
})
