// M4 memory. Algebra: spin-one. Trits are written into the M3 lone excitation of
// each pair-rule class (one cell's tone set to the trit, the background value the empty slot), left to the fixed rule
// for T rounds, and read back by a decoder declared outside the mesh (code/compute/lab/memory.ts): the slot positions,
// the lone-run table of every value at every slot, and a clock for the phase. That decoder is added structure, and so is
// the partition schedule.
//
// Declared before the first run:
// - CLASSES: the 12 class representatives (pair-rule.ts), each on every uniform background it fixes (vacuum-fixing
//   rules on -1, 0, +1; creating rules on -1, +1). Forward color order only.
// - BOXES, three per tiling:
//   OPEN: the exact lazy window of the infinite tiling (lazy-space.ts), and the infinite line (brick schedule);
//   WALLED: the same tiling and the same schedule cut at WALL_RADIUS facets from the origin, every pair crossing the
//     wall left out: a finite closed reversible box under exactly the open window's local schedule, so open against
//     walled isolates the outward sink;
//   QUOTIENT: the M1 closed quotient of each column (harness.ts closedInstances, first per column, plus the ring of
//     244) under its greedy coloring, with its injectivity radius and loop systole beside every result.
// - SCHEDULE FAMILY: every 2D matched pair, {4,4}/{4,5}, {3,6}/{3,7}, {6,3}/{6,4}, is read on the
//   coset tilings under the lifted coloring on BOTH sides, under two colorings of that family (variants 0 and 1), open
//   and walled. The quotient pairs are read under the greedy family on both sides and are never credited to curvature
//   (point 5 of the gated labels). The 4D pair has no common open family and is read on its quotients only.
// - MEMORY KIND at the origin: in_place (both off-background lone writes are localized and exactly periodic within
//   CODE_MAX_PERIOD rounds), moves (localized, no return), spreads (not localized).
// - CAPACITY (in-place kinds): the least slot spacing s in 1..MAX_SPACING at which a register of REGISTER_SLOTS slots
//   (breadth-first anchors from the origin, each with an in-place code, at least s facets apart) reads all 3^4 words
//   right at every round 0..READ_ROUNDS, phase-aware, forward rule only. A word whose whole state returns exactly within
//   the rounds is kept forever. On quotients also the PACKED capacity: every cell slotted greedily at spacing s*,
//   read on the declared structured word set (constants, cyclic words, singletons on the first 64 slots), as trits per
//   cell.
// - READ LATENCY: phase-aware 0 (the decoder holds the clock); phase-blind (no clock: wait for the written pattern to
//   come round) max P - 1 over the slots' values at s*. Delay line: the exact return round of a lone write within
//   RETURN_CAP rounds (forward rule only); on an open window a write that moves away does not come back.
// - DAMAGE TOLERANCE (in-place kinds, register at s*, the cyclic word -1 0 1 -1): every cell within DAMAGE_RADIUS of an
//   anchor set to each other tone at DAMAGE_ROUND, run to HEAL_ROUNDS; outcome immune, healed (wrong somewhere, right in
//   the whole last HEAL_WINDOW rounds), corrupted, budget. Forward decoder. Beside it the inverse read: the inverse rule
//   run back from HEAL_ROUNDS to round 0 reads the written word or not.
// - CRITERIA. Curvature: per class and background, a field (kind, s*, phase-blind latency, tolerated share =
//   (immune + healed) / all, healed share) differs between flat and hyperbolic under a coloring when the kinds or the
//   integers differ, or the shares differ by at least 1/10. Curvature-sensitive: differs under both colorings, numbers
//   in the same direction; schedule-sensitive: under one. Sink: on the same tiling and coloring, a damage healed or
//   immune in the open window and corrupted in the walled box is a sink rescue, the reverse a sink loss, counted only
//   where both boxes chose the same anchors (by address).
// Gates (each can fail): 24 rules in 12 classes; Q kept in every register run, D in every run of a D-keeping rule;
// every lone write and every register comes back exactly under the inverse rule; two runs give identical bytes; no file
// draws a random number. Negative controls: the identity is in place everywhere with s* = 1, every damage on a slot
// corrupts and every damage beside one is immune, and open and walled read it identically (no sink effect without
// motion); a phase-shifted decoder (round + 1) misreads a register with a period above 1; a planted wrong word is caught.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import { closedInstances, harnessRule, LabInstance } from '@/code/compute/lab/harness'
import { cosetSpace, LazySpace } from '@/code/compute/lab/lazy-space'
import {
  CANDIDATE_RADIUS,
  DamageReading,
  Decoder,
  INVERSE_ROUNDS,
  MAX_SPACING,
  MemoryRule,
  READ_ROUNDS,
  REGISTER_SLOTS,
  RETURN_CAP,
  Run,
  WordsReading,
  WriteKind,
  allWords,
  damageSet,
  excursion,
  forwardRound,
  inverseRecovers,
  loneWrite,
  makeDecoder,
  pickSlots,
  readsWord,
  readWords,
  returnTime,
  structuredWords,
  walledSpace,
  writeKind,
  writeWord,
} from '@/code/compute/lab/memory'
import { PairSpace, lineSpace } from '@/code/measure/particle-census'
import {
  conservesExcitation,
  fixesVacuum,
  inverseTable,
  pairRuleCensus,
  pairRuleClasses,
} from '@/code/rule/pair-rule'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/memory.ts', 'test/experiment/computation/pair-rule-memory.ts']

// ---- parameters, fixed before the first run ----

const WALL_RADIUS = 7
const CANDIDATE_CAP = 400
const PACK_SINGLETONS = 64
const SHARE_GAP = 1 / 10
const IDENTITY = 'id.ABC.id'
const FULL_SWAP = 'swap.CBA.swap'

// ---- boxes ----

type BoxKind = 'open' | 'walled' | 'quotient'

type Box = {
  space: PairSpace
  colors: number[]
  address: (cell: number) => string
  // quotients: every cell in breadth-first order from cell 0; otherwise null (candidates grow lazily)
  allCells: number[] | null
}

type BoxDef = {
  key: string
  kind: BoxKind
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  degree: number
  family: string
  // the matched-pair key (same for both sides of a pair under one coloring and box kind), or null
  pair: string | null
  make: () => Box
  systole: number | null
  loopSystole: number | null
  systoleLowerBound: boolean
  cells: number | null
}

const MATCHED: readonly { flat: [LabGeometryName, number, number]; hyperbolic: [LabGeometryName, number, number] }[] = [
  { flat: ['{4,4}', 4, 4], hyperbolic: ['{4,5}', 4, 5] },
  { flat: ['{3,6}', 3, 6], hyperbolic: ['{3,7}', 3, 7] },
  { flat: ['{6,3}', 6, 3], hyperbolic: ['{6,4}', 6, 4] },
]

const lazyBox = (space: LazySpace, walled: boolean): Box => ({
  space: walled ? walledSpace(space, WALL_RADIUS) : space,
  colors: Array.from({ length: space.colorCount }, (_, k) => k),
  address: c => space.address(c),
  allCells: null,
})

function bfsCells(neighbors: readonly (readonly number[])[]): number[] {
  const seen = new Set<number>([0])
  const queue = [0]

  for (const u of queue) {
    for (const w of neighbors[u]!) {
      if (!seen.has(w)) {
        seen.add(w)
        queue.push(w)
      }
    }
  }

  return queue
}

function quotientBox(inst: LabInstance): Box {
  const s = inst.schedules.forward
  const space: PairSpace = {
    colorCount: s.partner.length,
    partner: (color, cell) => s.partner[color]![cell]!,
    isFirst: (color, cell) => s.isFirst[color]![cell] === 1,
    distance: cell => inst.distance[cell]!,
    neighbors: cell => inst.neighbors[cell]!,
  }

  return {
    space,
    colors: Array.from({ length: space.colorCount }, (_, k) => k),
    address: c => `${c}`,
    allCells: bfsCells(inst.neighbors),
  }
}

function boxDefs(only?: readonly string[]): BoxDef[] {
  const out: BoxDef[] = []
  const none = { systole: null, loopSystole: null, systoleLowerBound: false, cells: null }

  for (const kind of ['open', 'walled'] as const) {
    out.push({
      key: `${kind}:line`,
      kind,
      column: 'line',
      curvature: 'flat',
      degree: 2,
      family: 'brick',
      pair: null,
      make: () => {
        const l = lineSpace()

        return {
          space: kind === 'walled' ? walledSpace(l, WALL_RADIUS) : l,
          colors: [0, 1],
          address: c => `${l.position(c)}`,
          allCells: null,
        }
      },
      ...none,
    })

    for (const variant of [0, 1]) {
      for (const m of MATCHED) {
        for (const [side, curvature] of [
          [m.flat, 'flat'],
          [m.hyperbolic, 'hyperbolic'],
        ] as const) {
          const [column, p, q] = side

          out.push({
            key: `${kind}:${column}~lifted-${variant}`,
            kind,
            column,
            curvature,
            degree: p,
            family: `lifted-${variant}`,
            pair: `${kind}:${m.flat[0]}/${m.hyperbolic[0]}~lifted-${variant}`,
            make: () => lazyBox(cosetSpace({ name: `${column}/coset-${variant}`, p, q, variant }), kind === 'walled'),
            ...none,
          })
        }
      }
    }
  }

  const seen = new Set<string>()

  for (const inst of closedInstances()) {
    if (seen.has(inst.column)) {
      continue
    }

    seen.add(inst.column)

    const pairOf = MATCHED.find(m => m.flat[0] === inst.column || m.hyperbolic[0] === inst.column)
    const pair4 = inst.column === '{3,4,3,3}' || inst.column === '{3,4,3,4}'

    out.push({
      key: `quotient:${inst.name}`,
      kind: 'quotient',
      column: inst.column,
      curvature: inst.curvature,
      degree: inst.degree,
      family: 'greedy',
      pair: pairOf
        ? `quotient:${pairOf.flat[0]}/${pairOf.hyperbolic[0]}~greedy`
        : pair4
          ? 'quotient:{3,4,3,3}/{3,4,3,4}~greedy'
          : null,
      make: () => quotientBox(inst),
      systole: inst.systole,
      loopSystole: inst.loopSystole,
      systoleLowerBound: inst.systoleLowerBound,
      cells: inst.size,
    })
  }

  return only ? out.filter(d => only.includes(d.key)) : out
}

// ---- classes ----

type ClassDef = { name: string; rule: MemoryRule; backgrounds: number[] }

function classDefs(): { classes: ClassDef[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })

  return {
    ruleCount: census.rules.length,
    classCount: classes.length,
    classes: classes.map(c => {
      const { name, table } = c.representative
      const f = harnessRule({ name, table })
      const b = harnessRule({ name: `${name}^-1`, table: inverseTable(table) })

      return {
        name,
        rule: { forward: f, inverse: b, keepsExcitation: conservesExcitation(table) },
        backgrounds: fixesVacuum(table) ? [-1, 0, 1] : [-1, 1],
      }
    }),
  }
}

// ---- one box, class and background ----

type DamageCounts = { immune: number; healed: number; corrupted: number; budget: number; total: number }

type Cell = {
  box: string
  boxKind: BoxKind
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  family: string
  pair: string | null
  className: string
  background: number
  kind: WriteKind
  periods: number[]
  capacity: { spacing: number; slots: number; reading: WordsReading | null }[]
  sStar: number | null
  anchors: string[]
  latencyBlind: number | null
  damage: DamageCounts | null
  damageReadings: { key: string; outcome: string; reach: number; inverseReads: boolean }[]
  inverseDamageReads: number
  // per off-background tone: the exact return round of a lone write at the origin (0 none within the cap, -1 budget),
  // whether that write is in place, and the farthest it gets in INVERSE_ROUNDS rounds
  returns: number[]
  tonesInPlace: boolean[]
  farthest: number[]
  inverseFailures: number
  chargeFailures: number
  excitationFailures: number
  packed: { slots: number; cells: number; reading: WordsReading } | null
  phaseControl: { tried: boolean; misread: boolean }
  plantedCaught: boolean | null
}

function* candidates(box: Box): Generator<number> {
  if (box.allCells) {
    yield* box.allCells

    return
  }

  const depth = new Map<number, number>([[0, 0]])
  const queue = [0]

  let read = 0

  for (const u of queue) {
    yield u
    read++

    if (read >= CANDIDATE_CAP) {
      return
    }

    if (depth.get(u)! >= CANDIDATE_RADIUS) {
      continue
    }

    for (const w of box.space.neighbors(u)) {
      if (!depth.has(w)) {
        depth.set(w, depth.get(u)! + 1)
        queue.push(w)
      }
    }
  }
}

const tally = (rs: readonly DamageReading[]): DamageCounts => ({
  immune: rs.filter(r => r.outcome === 'immune').length,
  healed: rs.filter(r => r.outcome === 'healed').length,
  corrupted: rs.filter(r => r.outcome === 'corrupted').length,
  budget: rs.filter(r => r.outcome === 'budget').length,
  total: rs.length,
})

// a decoder read with its clock one round ahead must misread some word at some round when some value has period > 1
function phaseShiftMisreads(run: Run, decoder: Decoder): { tried: boolean; misread: boolean } {
  if (!decoder.slots.some(s => s.periods.some(p => p > 1))) {
    return { tried: false, misread: false }
  }

  for (const word of allWords(decoder.slots.length)) {
    const state = writeWord(decoder, word)

    for (let t = 1; t <= READ_ROUNDS; t++) {
      forwardRound(run, state)

      if (!readsWord(decoder, word, state, t + 1)) {
        return { tried: true, misread: true }
      }
    }
  }

  return { tried: true, misread: false }
}

function readCell(def: BoxDef, cls: ClassDef, background: number): Cell {
  const box = def.make()
  const run: Run = { space: box.space, colors: box.colors, rule: cls.rule, background }
  const { kind, periods } = writeKind(run, 0)
  const offTones = [-1, 0, 1].filter(t => t !== background)
  const cell: Cell = {
    box: def.key,
    boxKind: def.kind,
    column: def.column,
    curvature: def.curvature,
    family: def.family,
    pair: def.pair,
    className: cls.name,
    background,
    kind,
    periods,
    capacity: [],
    sStar: null,
    anchors: [],
    latencyBlind: null,
    damage: null,
    damageReadings: [],
    inverseDamageReads: 0,
    returns: [],
    tonesInPlace: [],
    farthest: [],
    inverseFailures: 0,
    chargeFailures: 0,
    excitationFailures: 0,
    packed: null,
    phaseControl: { tried: false, misread: false },
    plantedCaught: null,
  }

  // delay lines and the inverse rule, for every kind
  for (const t of offTones) {
    const start = new Map([[0, t]])

    cell.returns.push(returnTime(run, start, RETURN_CAP))
    cell.tonesInPlace.push(loneWrite(run, 0, t).inPlace)
    cell.farthest.push(excursion(run, start, INVERSE_ROUNDS).farthest)
    cell.inverseFailures += inverseRecovers(run, start, INVERSE_ROUNDS) ? 0 : 1
  }

  if (kind !== 'in_place') {
    return cell
  }

  let decoder: Decoder | null = null

  for (let s = 1; s <= MAX_SPACING; s++) {
    const slots = pickSlots({ run, spacing: s, count: REGISTER_SLOTS, candidates: [...candidates(box)] })

    if (slots.length < REGISTER_SLOTS) {
      cell.capacity.push({ spacing: s, slots: slots.length, reading: null })
      continue
    }

    const d = makeDecoder(background, slots)
    const reading = readWords(run, d, allWords(REGISTER_SLOTS), READ_ROUNDS)

    cell.capacity.push({ spacing: s, slots: slots.length, reading })
    cell.chargeFailures += reading.chargeFailures
    cell.excitationFailures += reading.excitationFailures

    if (reading.wrong === 0) {
      cell.sStar = s
      decoder = d
      break
    }
  }

  if (!decoder) {
    return cell
  }

  cell.anchors = decoder.slots.map(s => box.address(s.anchor))
  cell.latencyBlind = Math.max(...decoder.slots.flatMap(s => s.periods)) - 1

  const word = Array.from({ length: REGISTER_SLOTS }, (_, k) => (k % 3) - 1)

  cell.inverseFailures += inverseRecovers(run, writeWord(decoder, word), INVERSE_ROUNDS) ? 0 : 1

  const damage = damageSet(run, decoder, word)

  cell.damage = tally(damage)
  cell.inverseDamageReads = damage.filter(r => r.inverseReads).length
  cell.damageReadings = damage.map(r => ({
    key: `${box.address(r.cell)}>${r.tone}`,
    outcome: r.outcome,
    reach: r.reach,
    inverseReads: r.inverseReads,
  }))
  cell.phaseControl = phaseShiftMisreads(run, decoder)

  // planted: the register read against a word with one slot changed must read wrong at round 0
  const wrongWord = word.map((v, k) => (k === 0 ? (v === 1 ? -1 : v + 1) : v))

  cell.plantedCaught = !readsWord(decoder, wrongWord, writeWord(decoder, word), 0)

  if (def.kind === 'quotient' && box.allCells) {
    const all = pickSlots({ run, spacing: cell.sStar!, count: box.allCells.length, candidates: box.allCells })
    const d = makeDecoder(background, all)
    const reading = readWords(run, d, structuredWords(all.length, background, PACK_SINGLETONS), READ_ROUNDS)

    cell.packed = { slots: all.length, cells: box.allCells.length, reading }
    cell.chargeFailures += reading.chargeFailures
    cell.excitationFailures += reading.excitationFailures
  }

  return cell
}

// ---- comparisons ----

const share = (n: number, d: number): number => (d === 0 ? 0 : n / d)

const tolerated = (c: Cell): number | null =>
  c.damage ? share(c.damage.immune + c.damage.healed, c.damage.total) : null

const healedShare = (c: Cell): number | null => (c.damage ? share(c.damage.healed, c.damage.total) : null)

type FieldDiff = { differs: boolean; sign: number }

function fieldDiffs(f: Cell, h: Cell): Record<string, FieldDiff> {
  const num = (a: number | null, b: number | null, gap: number): FieldDiff =>
    a === null || b === null
      ? { differs: a !== b, sign: 0 }
      : { differs: Math.abs(a - b) >= gap && a !== b, sign: Math.sign(b - a) }

  return {
    kind: { differs: f.kind !== h.kind, sign: 0 },
    sStar: num(f.sStar, h.sStar, 1),
    latency: num(f.latencyBlind, h.latencyBlind, 1),
    tolerated: num(tolerated(f), tolerated(h), SHARE_GAP),
    healed: num(healedShare(f), healedShare(h), SHARE_GAP),
  }
}

type PairVerdict = {
  pair: string
  boxKind: BoxKind
  className: string
  background: number
  fields: Record<string, 'curvature' | 'schedule' | 'same'>
}

function curvatureVerdicts(cells: readonly Cell[], boxKind: 'open' | 'walled'): PairVerdict[] {
  const out: PairVerdict[] = []
  const find = (pair: string, curvature: string, className: string, background: number): Cell | undefined =>
    cells.find(c => c.pair === pair && c.curvature === curvature && c.className === className && c.background === background)

  for (const m of MATCHED) {
    const base = `${boxKind}:${m.flat[0]}/${m.hyperbolic[0]}`

    for (const c of cells.filter(x => x.pair === `${base}~lifted-0` && x.curvature === 'flat')) {
      const diffs = [0, 1].map(v => {
        const f = find(`${base}~lifted-${v}`, 'flat', c.className, c.background)
        const h = find(`${base}~lifted-${v}`, 'hyperbolic', c.className, c.background)

        return f && h ? fieldDiffs(f, h) : null
      })

      if (!diffs[0] || !diffs[1]) {
        continue
      }

      const fields: PairVerdict['fields'] = {}

      for (const k of Object.keys(diffs[0])) {
        const a = diffs[0][k]!
        const b = diffs[1][k]!

        fields[k] =
          a.differs && b.differs && a.sign === b.sign ? 'curvature' : a.differs || b.differs ? 'schedule' : 'same'
      }

      out.push({ pair: base, boxKind, className: c.className, background: c.background, fields })
    }
  }

  return out
}

type SinkReading = {
  box: string
  className: string
  background: number
  matched: boolean
  rescues: number
  losses: number
  same: number
  // delay line: lone writes that come back in the walled box and not in the open window
  delayOnlyWalled: number
}

function sinkReadings(cells: readonly Cell[]): SinkReading[] {
  const out: SinkReading[] = []

  for (const o of cells.filter(c => c.boxKind === 'open')) {
    const w = cells.find(
      c => c.boxKind === 'walled' && c.box === o.box.replace('open:', 'walled:') && c.className === o.className && c.background === o.background,
    )

    if (!w) {
      continue
    }

    const delayOnlyWalled = o.returns.filter((r, i) => !o.tonesInPlace[i] && r <= 0 && w.returns[i]! > 0).length
    const matched = o.anchors.length > 0 && o.anchors.join('|') === w.anchors.join('|')

    let rescues = 0
    let losses = 0
    let same = 0

    if (matched) {
      const wm = new Map(w.damageReadings.map(r => [r.key, r.outcome]))

      for (const r of o.damageReadings) {
        const other = wm.get(r.key)

        if (other === undefined) {
          continue
        }

        const okOpen = r.outcome === 'immune' || r.outcome === 'healed'
        const okWalled = other === 'immune' || other === 'healed'

        if (okOpen && other === 'corrupted') {
          rescues++
        } else if (okWalled && r.outcome === 'corrupted') {
          losses++
        } else {
          same++
        }
      }
    }

    out.push({ box: o.box, className: o.className, background: o.background, matched, rescues, losses, same, delayOnlyWalled })
  }

  return out
}

// ---- the whole reading ----

type MemoryLab = {
  ruleCount: number
  classCount: number
  boxes: BoxDef[]
  cells: Cell[]
  curvature: PairVerdict[]
  sink: SinkReading[]
  serialized: string
}

export function pairRuleMemory(input: { only?: readonly string[] }): MemoryLab {
  const { classes, ruleCount, classCount } = classDefs()
  const boxes = boxDefs(input.only)
  const cells: Cell[] = []

  for (const def of boxes) {
    for (const cls of classes) {
      for (const background of cls.backgrounds) {
        cells.push(readCell(def, cls, background))
      }
    }
  }

  const curvature = [...curvatureVerdicts(cells, 'open'), ...curvatureVerdicts(cells, 'walled')]
  const sink = sinkReadings(cells)
  const serialized = JSON.stringify(
    cells.map(c => [
      c.box,
      c.className,
      c.background,
      c.kind,
      c.periods,
      c.sStar,
      c.anchors,
      c.damage,
      c.returns,
      c.capacity.map(x => [x.spacing, x.slots, x.reading?.wrong ?? null, x.reading?.forever ?? null]),
      c.packed ? [c.packed.slots, c.packed.reading.wrong] : null,
    ]),
  )

  return { ruleCount, classCount, boxes, cells, curvature, sink, serialized }
}

const fraction = (n: number, d: number): string => `${n}/${d}`

export default experiment({
  id: 'computation/pair-rule-memory',
  code: 'E-CMP-0051',
  title:
    'M4 memory: trits written into the M3 lone excitations of the 12 pair-rule classes, read back after T rounds by a declared decoder; capacity, read latency, damage tolerance and delay lines in the open window, in the same tiling and schedule behind a reflecting wall, and on the closed quotients, flat against degree-matched hyperbolic under two colorings of one family',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{5,4}', '{7,3}', '{8,3}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = pairRuleMemory({})
    const twice = (): string => pairRuleMemory({ only: ['open:line', 'open:{4,4}~lifted-0', 'walled:{4,4}~lifted-0'] }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const sum = (f: (c: Cell) => number): number => r.cells.reduce((s, c) => s + f(c), 0)
    const inPlace = r.cells.filter(c => c.kind === 'in_place')
    const withRegister = r.cells.filter(c => c.sStar !== null)

    // identity control
    const identity = r.cells.filter(c => c.className === IDENTITY)
    const identityBad = identity.filter(
      c =>
        c.sStar !== 1 ||
        c.damageReadings.some(d => (d.reach === 0 ? d.outcome !== 'corrupted' : d.outcome !== 'immune')),
    )
    const identitySink = r.sink.filter(s => s.className === IDENTITY && (s.rescues > 0 || s.losses > 0 || !s.matched))
    const phaseTried = withRegister.filter(c => c.phaseControl.tried)
    const phaseMissed = phaseTried.filter(c => !c.phaseControl.misread)
    const plantedMissed = withRegister.filter(c => c.plantedCaught === false)
    const inverseFailures = sum(c => c.inverseFailures)
    const chargeFailures = sum(c => c.chargeFailures)
    const excitationFailures = sum(c => c.excitationFailures)
    const ok =
      r.ruleCount === 24 &&
      r.classCount === 12 &&
      withRegister.length > 0 &&
      identityBad.length === 0 &&
      identity.length > 0 &&
      identitySink.length === 0 &&
      phaseTried.length > 0 &&
      phaseMissed.length === 0 &&
      plantedMissed.length === 0 &&
      inverseFailures === 0 &&
      chargeFailures === 0 &&
      excitationFailures === 0 &&
      identicalBytes &&
      findings.length === 0

    const failures = [
      ...(r.ruleCount === 24 && r.classCount === 12 ? [] : ['rule census']),
      ...(withRegister.length > 0 ? [] : ['no register read anywhere']),
      ...identityBad.map(c => `identity ${c.box} b${c.background}`),
      ...identitySink.map(s => `identity sink ${s.box} b${s.background}`),
      ...(phaseTried.length > 0 ? [] : ['no period above 1 for the phase control']),
      ...phaseMissed.map(c => `phase control ${c.box} ${c.className} b${c.background}`),
      ...plantedMissed.map(c => `planted word ${c.box} ${c.className} b${c.background}`),
      ...(inverseFailures === 0 ? [] : [`inverse ${inverseFailures}`]),
      ...(chargeFailures === 0 ? [] : [`charge ${chargeFailures}`]),
      ...(excitationFailures === 0 ? [] : [`excitation ${excitationFailures}`]),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]

    const damageSum = (cells: readonly Cell[]): DamageCounts =>
      cells.reduce(
        (s, c) =>
          c.damage
            ? {
                immune: s.immune + c.damage.immune,
                healed: s.healed + c.damage.healed,
                corrupted: s.corrupted + c.damage.corrupted,
                budget: s.budget + c.damage.budget,
                total: s.total + c.damage.total,
              }
            : s,
        { immune: 0, healed: 0, corrupted: 0, budget: 0, total: 0 },
      )
    const nonIdentity = (k: BoxKind): Cell[] => withRegister.filter(c => c.boxKind === k && c.className !== IDENTITY)
    const dOpen = damageSum(nonIdentity('open'))
    const dWalled = damageSum(nonIdentity('walled'))
    const dQuotient = damageSum(nonIdentity('quotient'))
    const sinkNon = r.sink.filter(s => s.className !== IDENTITY && s.matched)
    const rescues = sinkNon.reduce((s, x) => s + x.rescues, 0)
    const losses = sinkNon.reduce((s, x) => s + x.losses, 0)
    const delayOnlyWalled = r.sink.reduce((s, x) => s + x.delayOnlyWalled, 0)

    // lone writes that are not in place, per box kind: how many come back exactly within RETURN_CAP (delay lines)
    const movers = (k: BoxKind): { tones: number; returned: number; budget: number; rounds: number[] } => {
      const cs = r.cells.filter(c => c.boxKind === k && c.className !== IDENTITY)
      const rs = cs.flatMap(c => c.returns.filter((_, i) => !c.tonesInPlace[i]))

      return {
        tones: rs.length,
        returned: rs.filter(x => x > 0).length,
        budget: rs.filter(x => x < 0).length,
        rounds: rs.filter(x => x > 0).sort((a, b) => a - b),
      }
    }

    const delayOpen = movers('open')
    const delayWalled = movers('walled')
    const delayQuotient = movers('quotient')
    const openMoverReturns = delayOpen.returned
    const healedAll = dOpen.healed + dWalled.healed + dQuotient.healed
    const median = (xs: readonly number[]): number => (xs.length === 0 ? 0 : xs[Math.floor(xs.length / 2)]!)
    const inverseReadsBy = (k: BoxKind): number => nonIdentity(k).reduce((s, c) => s + c.inverseDamageReads, 0)
    const curvatureFields = r.curvature.flatMap(v => Object.entries(v.fields).filter(([, x]) => x === 'curvature').map(([k]) => `${v.boxKind} ${v.pair} ${v.className} b${v.background} ${k}`))
    const scheduleFields = r.curvature.flatMap(v => Object.values(v.fields).filter(x => x === 'schedule')).length
    const quotientNotes = r.boxes
      .filter(b => b.kind === 'quotient')
      .map(b => `${b.key} (${b.cells} cells, injectivity radius ${b.systole}${b.systoleLowerBound ? ' lower bound' : ''}, loop systole ${b.loopSystole})`)
    const packed = r.cells.filter(c => c.packed?.reading.wrong === 0 && c.className !== IDENTITY)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `a trit written as one cell's tone is kept in place (phase-aware decoder, forward rule only) in ${inPlace.filter(c => c.className !== IDENTITY).length} of ${r.cells.filter(c => c.className !== IDENTITY).length} non-identity class x background x box readings, a 4-slot register reads every word for ${READ_ROUNDS} rounds in ${withRegister.filter(c => c.className !== IDENTITY).length}; under single-cell damage the open windows tolerate ${fraction(dOpen.immune + dOpen.healed, dOpen.total)} (healed ${dOpen.healed}), the walled boxes under the same schedule ${fraction(dWalled.immune + dWalled.healed, dWalled.total)} (healed ${dWalled.healed}), the quotients ${fraction(dQuotient.immune + dQuotient.healed, dQuotient.total)}; ${healedAll === 0 ? 'no damage heals in any box' : `${healedAll} damages heal`}, and on matched anchors the sink rescues ${rescues} damages the wall loses and loses ${losses}; of the lone writes that are not in place, ${delayOpen.returned} of ${delayOpen.tones} come back in an open window, ${delayWalled.returned} of ${delayWalled.tones} behind the wall (delay lines, median ${median(delayWalled.rounds)} rounds, ${delayOnlyWalled} only there) and ${delayQuotient.returned} of ${delayQuotient.tones} on the quotients (median ${median(delayQuotient.rounds)}); every write comes back exactly under the inverse rule; ${curvatureFields.length} flat-against-hyperbolic fields differ under both colorings of the lifted family (${scheduleFields} under one only)`,
      metrics: {
        readings: r.cells.length,
        inPlace: inPlace.length,
        registers: withRegister.length,
        openDamage: dOpen.total,
        openTolerated: dOpen.immune + dOpen.healed,
        openHealed: dOpen.healed,
        openBudget: dOpen.budget,
        walledDamage: dWalled.total,
        walledTolerated: dWalled.immune + dWalled.healed,
        walledHealed: dWalled.healed,
        quotientDamage: dQuotient.total,
        quotientTolerated: dQuotient.immune + dQuotient.healed,
        quotientHealed: dQuotient.healed,
        sinkMatchedRegisters: sinkNon.length,
        sinkRescues: rescues,
        sinkLosses: losses,
        delayOnlyWalled,
        openMoverReturns,
        moverTonesOpen: delayOpen.tones,
        moverTonesWalled: delayWalled.tones,
        moverReturnsWalled: delayWalled.returned,
        moverBudgetWalled: delayWalled.budget,
        moverReturnMedianWalled: median(delayWalled.rounds),
        moverReturnMaxWalled: delayWalled.rounds.at(-1) ?? 0,
        moverTonesQuotient: delayQuotient.tones,
        moverReturnsQuotient: delayQuotient.returned,
        moverBudgetQuotient: delayQuotient.budget,
        moverReturnMedianQuotient: median(delayQuotient.rounds),
        moverReturnMaxQuotient: delayQuotient.rounds.at(-1) ?? 0,
        inverseDamageReadsOpen: inverseReadsBy('open'),
        inverseDamageReadsWalled: inverseReadsBy('walled'),
        inverseDamageReadsQuotient: inverseReadsBy('quotient'),
        packedRegisters: packed.length,
        curvatureFields: curvatureFields.length,
        scheduleFields,
        inverseFailures,
        chargeFailures,
        excitationFailures,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityReadings: identity.length,
        identityFailures: identityBad.length,
        identitySinkEffects: identitySink.length,
        phaseControlTried: phaseTried.length,
        phaseControlMissed: phaseMissed.length,
        plantedMissed: plantedMissed.length,
        fullSwapInPlace: r.cells.filter(c => c.className === FULL_SWAP && c.kind === 'in_place').length,
      },
      notes:
        `M4. Decoder: slot positions, lone-run table, clock (added structure); every damage and capacity reading uses the forward rule only, the inverse reads are counted apart. Curvature fields under both colorings: ${curvatureFields.slice(0, 40).join('; ') || 'none'}. Quotients: ${quotientNotes.join(', ')}. Walled radius ${WALL_RADIUS}. ${ok ? '' : `Failures: ${failures.slice(0, 16).join('; ')}`}`.trim(),
    })
  },
})
