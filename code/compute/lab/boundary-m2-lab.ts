// M9 slice 2 lab (item vibe-computation-models-0058): the boxes, rule families and readings of m9-boundaries.md
// slice 2, shared by the laptop experiment (test/experiment/computation/m2-boundaries.ts) and the M3 driver
// (task/m3/m2-boundaries.ts), so both read with the same code and differ only in sizes. Algebra: spin-one tones; the
// Z3-linear rules read them as residues mod 3.
//
// FAMILIES. Z3-linear (26 classes of the 48 invertible matrices under swap conjugation), Q2R / Blume-Capel (J = 1, the
// declared crystal fields and the D-kept control Delta = degree + 1), and the 12 M1 classes at start size 3.
// SCHEDULES. Pair rules on matchings (brick line, lifted colorings 0 and 1, the 4D generator and step-parity colorings);
// Q2R on the canonical vertex colorings greedy and greedy-shifted of every box.

import {
  BoundaryRun,
  HORIZON,
  findStructures as slice1Structures,
  perturbationFamily as slice1Family,
  readPerturbation as slice1Read,
} from '@/code/compute/lab/boundary'
import {
  BoxSpace,
  COUNT_LEDGER,
  CellClass,
  Dynamics,
  Ledger,
  Reading,
  SizedStructure,
  START_CELLS_MAX_LARGE,
  START_CELLS_MAX_SMALL,
  WALL_RADIUS,
  WalledReading,
  addDeviation,
  chargeLedger,
  deviationStart,
  energyLedger,
  excitationLedger,
  exportReading,
  findStructures,
  pairDynamics,
  perturbationFamily,
  phaseAheadMisreads,
  q2rDynamics,
  readPerturbation,
  readWalled,
  residueSumLedger,
  round,
  stateKey,
  structureOf,
} from '@/code/compute/lab/boundary-m2'
import { harnessRule, lazySpaceFactory } from '@/code/compute/lab/harness'
import { cosetSpace } from '@/code/compute/lab/lazy-space'
import { walledSpace } from '@/code/compute/lab/memory'
import { CensusRule, Tones, lineSpace, sameTones } from '@/code/measure/particle-census'
import { conservesExcitation, fixesVacuum, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { BlumeCapel, q2rMove } from '@/code/rule/spin-one-q2r'
import {
  Z3LinearRule,
  Z3Matrix,
  z3ConservesSum,
  z3Det,
  z3FixesUniform,
  z3IsMonomial,
  z3LinearRule,
  z3MatrixName,
} from '@/code/rule/z3-linear-pair'
import {
  CanonicalColoringKind,
  CanonicalGraph,
  CanonicalVertexColoring,
  checkProper,
} from '@/code/substrate/coxeter/canonical-vertex-coloring'

export const SHARE_GAP = 1 / 10
export const M1_IDENTITY = 'id.ABC.id'
export const Z3_IDENTITY_NAME = 'z3.1001'
export const COLORING_CHECK_RADIUS = 4

export type Family = 'm1' | 'z3' | 'q2r'

export type SliceSizes = {
  readonly columns: readonly string[]
  readonly families: readonly Family[]
  // the largest start size on the line and on the tilings
  readonly lineStart: number
  readonly tilingStart: number
  readonly doubles: boolean
  readonly walled: boolean
  // Q2R crystal fields besides the D-kept control
  readonly deltas: readonly number[]
  // rule names to read (all when absent)
  readonly rules?: readonly string[]
}

export const LAPTOP_SIZES: SliceSizes = {
  columns: ['line', '{4,4}', '{4,5}'],
  families: ['z3', 'q2r', 'm1'],
  lineStart: 3,
  tilingStart: 2,
  doubles: true,
  walled: true,
  deltas: [1, 2],
}

export const ALL_COLUMNS = ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{3,4,3,3}', '{3,4,3,4}']

export const MATCHED: readonly { flat: string; hyperbolic: string; twoDimensional: boolean }[] = [
  { flat: '{4,4}', hyperbolic: '{4,5}', twoDimensional: true },
  { flat: '{3,6}', hyperbolic: '{3,7}', twoDimensional: true },
  { flat: '{6,3}', hyperbolic: '{6,4}', twoDimensional: true },
  { flat: '{3,4,3,3}', hyperbolic: '{3,4,3,4}', twoDimensional: false },
]

// ---- boxes ----

type PairBox = { space: BoxSpace; colors: number[] }

function lineBox(): BoxSpace {
  const l = lineSpace()

  return {
    ...l,
    compare: (a, b) => l.distance(a) - l.distance(b) || l.position(a) - l.position(b),
    address: c => `${l.position(c)}`,
    fromAddress: a => l.at(Number(a)),
  }
}

const allColors = (space: BoxSpace): number[] => Array.from({ length: space.colorCount }, (_, k) => k)

type ColumnDef = {
  column: string
  curvature: 'flat' | 'hyperbolic'
  pair: string | null
  base: () => BoxSpace
  schedules: { name: string; make: () => PairBox }[]
}

function columnDef(column: string): ColumnDef {
  const matched = MATCHED.find(m => m.flat === column || m.hyperbolic === column)
  const pair = matched ? `${matched.flat}/${matched.hyperbolic}` : null
  const curvature = matched?.hyperbolic === column ? 'hyperbolic' : 'flat'

  if (column === 'line') {
    return { column, curvature, pair, base: lineBox, schedules: [{ name: 'brick', make: () => ({ space: lineBox(), colors: [0, 1] }) }] }
  }

  if (column === '{3,4,3,4}' || column === '{3,4,3,3}') {
    const factory = lazySpaceFactory(column)

    if (!factory) {
      throw new Error(`boundary-m2-lab: no lazy space for ${column}`)
    }

    const name = column === '{3,4,3,4}' ? 'generator' : 'step-parity'

    return {
      column,
      curvature,
      pair,
      base: factory,
      schedules: [{ name, make: () => { const space = factory(); return { space, colors: allColors(space) } } }],
    }
  }

  const symbol = /^\{(\d+),(\d+)\}$/.exec(column)

  if (!symbol) {
    throw new Error(`boundary-m2-lab: unknown column ${column}`)
  }

  const [p, q] = [Number(symbol[1]), Number(symbol[2])]
  const coset = (variant: number): BoxSpace => cosetSpace({ name: `${column}/coset-${variant}`, p, q, variant })

  return {
    column,
    curvature,
    pair,
    base: () => coset(0),
    schedules: [0, 1].map(variant => ({
      name: `lifted-${variant}`,
      make: () => { const space = coset(variant); return { space, colors: allColors(space) } },
    })),
  }
}

export function canonicalGraph(space: BoxSpace): CanonicalGraph {
  return {
    degree: space.degree,
    neighbors: c => space.neighbors(c),
    distance: c => space.distance(c),
    compare: (a, b) => space.compare(a, b),
  }
}

const VERTEX_KINDS: readonly CanonicalColoringKind[] = ['greedy', 'greedy-shifted']

// A box instance: what a rule needs to build its open and walled dynamics.
type Instance = { space: BoxSpace; colors: number[] | null; coloring: CanonicalVertexColoring | null }

type BoxDef = {
  key: string
  column: string
  curvature: 'flat' | 'hyperbolic'
  pair: string | null
  schedule: string
  scheduleIndex: number
  kind: 'pair' | 'vertex'
  make: () => Instance
}

function boxDefs(columns: readonly string[]): BoxDef[] {
  const out: BoxDef[] = []

  for (const column of columns) {
    const def = columnDef(column)

    def.schedules.forEach((s, i) => {
      out.push({
        key: `${column}~${s.name}`,
        column,
        curvature: def.curvature,
        pair: def.pair,
        schedule: s.name,
        scheduleIndex: i,
        kind: 'pair',
        make: () => {
          const b = s.make()

          return { space: b.space, colors: b.colors, coloring: null }
        },
      })
    })

    VERTEX_KINDS.forEach((kind, i) => {
      out.push({
        key: `${column}~${kind}`,
        column,
        curvature: def.curvature,
        pair: def.pair,
        schedule: kind,
        scheduleIndex: i,
        kind: 'vertex',
        make: () => {
          const space = def.base()

          return { space, colors: null, coloring: new CanonicalVertexColoring({ graph: canonicalGraph(space), kind }) }
        },
      })
    })
  }

  return out
}

function walledBox(space: BoxSpace): BoxSpace {
  const w = walledSpace(space, WALL_RADIUS)

  return {
    ...w,
    degree: space.degree,
    compare: (a, b) => space.compare(a, b),
    address: c => space.address(c),
    fromAddress: a => space.fromAddress(a),
  }
}

// ---- rules ----

type RuleDef = {
  family: Family
  name: string
  identity: boolean
  kind: 'pair' | 'vertex'
  linear: boolean
  backgrounds(degree: number): number[]
  // the open dynamics, or the walled one
  dynamics(inst: Instance, background: number, walled: boolean): Dynamics
}

function pairRuleDef(input: {
  family: 'm1' | 'z3'
  name: string
  rule: CensusRule
  identity: boolean
  backgrounds: number[]
  ledgers: (background: number) => Ledger[]
  linear: boolean
}): RuleDef {
  return {
    family: input.family,
    name: input.name,
    identity: input.identity,
    kind: 'pair',
    linear: input.linear,
    backgrounds: () => input.backgrounds,
    dynamics: (inst, background, walled) =>
      pairDynamics({
        space: walled ? walledBox(inst.space) : inst.space,
        colors: inst.colors!,
        rule: input.rule,
        background,
        ledgers: input.ledgers(background),
      }),
  }
}

export function m1Rules(): { rules: RuleDef[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })

  return {
    ruleCount: census.rules.length,
    classCount: classes.length,
    rules: classes.map(c => {
      const { name, table } = c.representative
      const keepsD = conservesExcitation(table)

      return pairRuleDef({
        family: 'm1',
        name,
        rule: harnessRule({ name, table }),
        identity: name === M1_IDENTITY,
        backgrounds: fixesVacuum(table) ? [-1, 0, 1] : [-1, 1],
        ledgers: b => [chargeLedger(b), ...(keepsD ? [excitationLedger(b)] : [])],
        linear: false,
      })
    }),
  }
}

// P m P for m = [a b; c d] is [d c; b a]
const swapConjugate = (m: Z3Matrix): Z3Matrix => [m[3], m[2], m[1], m[0]]

export function z3Classes(): { invertible: Z3LinearRule[]; classes: Z3LinearRule[] } {
  const invertible: Z3LinearRule[] = []

  for (let code = 0; code < 81; code++) {
    const m: Z3Matrix = [code % 3, Math.floor(code / 3) % 3, Math.floor(code / 9) % 3, Math.floor(code / 27) % 3]

    if (z3Det(m) !== 0) {
      invertible.push(z3LinearRule(m))
    }
  }

  const reps = new Map<string, Z3LinearRule>()

  for (const r of invertible) {
    const other = z3MatrixName(swapConjugate(r.matrix))
    const rep = r.name < other ? r.name : other

    if (rep === r.name) {
      reps.set(rep, r)
    }
  }

  return { invertible, classes: [...reps.values()].sort((a, b) => (a.name < b.name ? -1 : 1)) }
}

export function z3Rules(): { rules: RuleDef[]; ruleCount: number; classCount: number } {
  const { invertible, classes } = z3Classes()

  return {
    ruleCount: invertible.length,
    classCount: classes.length,
    rules: classes.map(r =>
      pairRuleDef({
        family: 'z3',
        name: r.name,
        rule: harnessRule({ name: r.name, table: r.table }),
        identity: r.name === Z3_IDENTITY_NAME,
        backgrounds: z3FixesUniform(r.matrix) ? [-1, 0, 1] : [0],
        ledgers: b => [
          ...(z3ConservesSum(r.matrix) ? [residueSumLedger(b)] : []),
          ...(z3IsMonomial(r.matrix) ? [COUNT_LEDGER] : []),
        ],
        linear: true,
      }),
    ),
  }
}

// Q2R at a fixed crystal field, or (delta null) the D-kept control Delta = degree + 1 of each box.
function q2rRule(delta: number | null): RuleDef {
  const modelFor = (degree: number): BlumeCapel => ({ coupling: 1, crystalField: delta ?? degree + 1 })

  return {
    family: 'q2r',
    name: delta === null ? 'q2r.J1.Dz+1' : `q2r.J1.D${delta}`,
    identity: false,
    kind: 'vertex',
    linear: false,
    backgrounds: degree => [-1, 0, 1].filter(b => q2rMove(b, b * degree, modelFor(degree)) === b),
    dynamics: (inst, background, walled) => {
      const model = modelFor(inst.space.degree)
      const coloring = inst.coloring!

      return q2rDynamics({
        space: inst.space,
        coloring,
        model,
        background,
        wall: walled ? WALL_RADIUS : null,
        ledgers: [
          energyLedger({ model, background, neighbors: c => coloring.neighbors(c) }),
          ...(delta === null ? [excitationLedger(background)] : []),
        ],
      })
    },
  }
}

export function q2rRules(deltas: readonly number[]): RuleDef[] {
  return [...deltas.map(d => q2rRule(d)), q2rRule(null)]
}

export function isQ2rControl(name: string): boolean {
  return name === 'q2r.J1.Dz+1'
}

// ---- reading one structure ----

export type HitTally = { held: number; orbit: number; transit: number; double: number }

export type ExportSummary = { phase: number; ensemble: number; multiplicities: readonly number[]; debris: number[] }

export type RepairNote = { phase: number; kind: string; cellClass: CellClass; cells: string; lastWrong: number }

export type StructureResult = {
  start: string
  size: number
  period: number
  regionSize: number
  hits: HitTally
  repaired: HitTally
  immune: number
  broken: number
  budget: number
  contacts: number
  keptContacts: number
  keeps: boolean
  exports: ExportSummary[]
  repairs: RepairNote[]
  ledgerFailures: number
  exportMismatches: number
  notDistinctPhases: number
  superpositionChecked: number
  superpositionFailures: number
  theoremFailures: number
  replayFailures: number
  walled: WalledReading[]
  walledOrbitSame: boolean | null
  phaseAheadMissed: boolean
}

const addressKey = (space: BoxSpace, state: Tones): string =>
  [...state]
    .map(([c, t]) => `${space.address(c)}=${t}`)
    .sort()
    .join(';')

const tally = (): HitTally => ({ held: 0, orbit: 0, transit: 0, double: 0 })

const slot = (r: Reading): keyof HitTally =>
  r.perturbation.kind === 'double' ? 'double' : (r.perturbation.cellClass as 'held' | 'orbit' | 'transit')

function readStructure(input: {
  box: BoxDef
  rule: RuleDef
  background: number
  inst: Instance
  dyn: Dynamics
  structure: SizedStructure
  sizes: SliceSizes
}): StructureResult {
  const { box, rule, background, inst, dyn, structure: s, sizes } = input
  const maxCells = s.size <= 2 ? START_CELLS_MAX_SMALL : START_CELLS_MAX_LARGE
  const hits = tally()
  const repairedTally = tally()
  const exports: ExportSummary[] = []
  const repairs: RepairNote[] = []
  const repairedAll: Reading[] = []

  let immune = 0
  let broken = 0
  let budget = 0
  let contacts = 0
  let keptContacts = 0
  let ledgerFailures = 0
  let exportMismatches = 0
  let notDistinctPhases = 0
  let superpositionChecked = 0
  let superpositionFailures = 0
  let theoremFailures = 0

  // the lone perturbation's run on the vacuum, for Z3 superposition
  const deviationDyn = rule.linear
    ? pairDynamics({ space: inst.space, colors: inst.colors!, rule: (dyn as unknown as { rule?: CensusRule }).rule ?? ruleOf(rule, inst), background: 0, ledgers: [] })
    : null

  for (let phase = 0; phase < s.period; phase++) {
    const family = perturbationFamily(dyn, s, phase, sizes.doubles)
    const readings = family.map(p => readPerturbation(dyn, s, p))
    const nullFinal = s.orbit[(phase + HORIZON) % s.period]!
    const repaired: Reading[] = []

    for (const r of readings) {
      ledgerFailures += r.kept.filter(k => !k).length

      if (r.perturbation.kind === 'contact') {
        contacts++
        keptContacts += r.outcome === 'immune' || r.outcome === 'repaired' ? 1 : 0
      } else {
        hits[slot(r)]++
        immune += r.outcome === 'immune' ? 1 : 0
        broken += r.outcome === 'broken' ? 1 : 0
        budget += r.outcome === 'budget' ? 1 : 0

        if (r.outcome === 'repaired') {
          repaired.push(r)
          repairedTally[slot(r)]++
          repairs.push({
            phase,
            kind: r.perturbation.kind,
            cellClass: r.perturbation.cellClass,
            cells: r.perturbation.changes.map(c => `${inst.space.address(c.cell) || 'origin'}:${c.was}->${c.tone}`).join('+'),
            lastWrong: r.lastWrong,
          })
        }
      }

      if (deviationDyn && r.outcome !== 'budget') {
        const alone = deviationStart(r.perturbation.changes)

        let over = false

        for (let t = 1; t <= HORIZON && !over; t++) {
          round(deviationDyn, alone)
          over = alone.size > 600
        }

        if (!over) {
          superpositionChecked++

          if (!sameTones(addDeviation(nullFinal, alone, background), r.final)) {
            superpositionFailures++
          }
        }
      }
    }

    const finals = readings.filter(r => r.outcome !== 'budget').map(r => stateKey(r.final))

    if (new Set([...finals, stateKey(nullFinal)]).size !== finals.length + 1) {
      notDistinctPhases++
    }

    if (repaired.length > 0) {
      const e = exportReading(dyn, s, phase, repaired)

      exportMismatches += e.hits.reduce((t, h) => t + h.ledgers.filter(l => !l.equal).length, 0)
      exportMismatches += e.multiplicities.length === e.ensemble ? 0 : 1
      theoremFailures += e.hits.reduce((t, h) => t + h.positiveChange.filter(ok => !ok).length, 0)
      exports.push({ phase, ensemble: e.ensemble, multiplicities: e.multiplicities, debris: e.hits.map(h => h.debris) })
      repairedAll.push(...repaired)
    }
  }

  // replay every repaired reading on a freshly built box through addresses
  let replayFailures = 0

  if (repairedAll.length > 0) {
    const fresh = box.make()
    const freshDyn = rule.dynamics(fresh, background, false)
    const map = (c: number): number => fresh.space.fromAddress(inst.space.address(c))
    const freshStructure = structureOf(freshDyn, new Map([...s.start].map(([c, t]) => [map(c), t])), maxCells)

    for (const r of repairedAll) {
      const p = r.perturbation
      const again = freshStructure
        ? readPerturbation(freshDyn, freshStructure, { ...p, changes: p.changes.map(c => ({ ...c, cell: map(c.cell) })) })
        : null

      if (again?.outcome !== r.outcome || addressKey(fresh.space, again.final) !== addressKey(inst.space, r.final)) {
        replayFailures++
      }
    }
  }

  // the sink control behind the wall, under the same coloring
  let walled: WalledReading[] = []
  let walledOrbitSame: boolean | null = null

  if (sizes.walled && repairedAll.length > 0) {
    const walledDyn = rule.dynamics(inst, background, true)
    const behind = structureOf(walledDyn, s.start, maxCells)

    walledOrbitSame =
      behind !== null && behind.period === s.period && behind.orbit.every((o, i) => sameTones(o, s.orbit[i]!))

    if (walledOrbitSame) {
      walled = repairedAll.map(r => readWalled(walledDyn, s, r.perturbation))
    }
  }

  const singles = hits.held + hits.orbit + hits.transit
  const singlesRepaired = repairedTally.held + repairedTally.orbit + repairedTally.transit

  return {
    start: addressKey(inst.space, s.start),
    size: s.size,
    period: s.period,
    regionSize: s.region.length,
    hits,
    repaired: repairedTally,
    immune,
    broken,
    budget,
    contacts,
    keptContacts,
    keeps: singlesRepaired === singles && repairedTally.double === hits.double && keptContacts === contacts,
    exports,
    repairs,
    ledgerFailures,
    exportMismatches,
    notDistinctPhases,
    superpositionChecked,
    superpositionFailures,
    theoremFailures,
    replayFailures,
    walled,
    walledOrbitSame,
    phaseAheadMissed: s.period > 1 && !phaseAheadMisreads(dyn, s),
  }
}

// the census rule of a linear rule definition (Z3 only), rebuilt from its name
function ruleOf(rule: RuleDef, _inst: Instance): CensusRule {
  const found = z3Classes().classes.find(r => r.name === rule.name)

  if (!found) {
    throw new Error(`boundary-m2-lab: ${rule.name} is not a Z3 class representative`)
  }

  return harnessRule({ name: found.name, table: found.table })
}

// ---- cells ----

export type Cell = {
  box: string
  column: string
  curvature: 'flat' | 'hyperbolic'
  pair: string | null
  schedule: string
  scheduleIndex: number
  family: Family
  rule: string
  identity: boolean
  background: number
  seeds: Record<number, number>
  structures: StructureResult[]
}

function startSizes(rule: RuleDef, column: string, sizes: SliceSizes): number[] {
  const most = column === 'line' ? sizes.lineStart : sizes.tilingStart

  if (rule.family === 'm1') {
    return most >= 3 ? [3] : []
  }

  return Array.from({ length: most }, (_, i) => i + 1)
}

function readCell(box: BoxDef, rule: RuleDef, background: number, sizes: SliceSizes): Cell {
  const inst = box.make()
  const dyn = rule.dynamics(inst, background, false)
  const { seeds, structures } = findStructures(dyn, startSizes(rule, box.column, sizes))

  return {
    box: box.key,
    column: box.column,
    curvature: box.curvature,
    pair: box.pair,
    schedule: box.schedule,
    scheduleIndex: box.scheduleIndex,
    family: rule.family,
    rule: rule.name,
    identity: rule.identity,
    background,
    seeds,
    structures: structures.map(structure => readStructure({ box, rule, background, inst, dyn, structure, sizes })),
  }
}

// ---- curvature ----

export type Fields = {
  structures: number
  keeping: number
  hitShare: number | null
  heldShare: number | null
  contactShare: number | null
}

export type FieldName = keyof Fields

export const FIELD_NAMES: readonly FieldName[] = ['structures', 'keeping', 'hitShare', 'heldShare', 'contactShare']

export function fieldsOf(c: Cell): Fields {
  const sum = (f: (s: StructureResult) => number): number => c.structures.reduce((t, s) => t + f(s), 0)
  const all = (h: HitTally): number => h.held + h.orbit + h.transit + h.double
  const hits = sum(s => all(s.hits))
  const held = sum(s => s.hits.held + s.hits.double)
  const contacts = sum(s => s.contacts)

  return {
    structures: c.structures.length,
    keeping: c.structures.filter(s => s.keeps).length,
    hitShare: hits === 0 ? null : sum(s => all(s.repaired)) / hits,
    heldShare: held === 0 ? null : sum(s => s.repaired.held + s.repaired.double) / held,
    contactShare: contacts === 0 ? null : sum(s => s.keptContacts) / contacts,
  }
}

// +1 hyperbolic larger, -1 flat larger, 0 same
function direction(name: FieldName, flat: Fields, hyperbolic: Fields): number {
  const a = flat[name]
  const b = hyperbolic[name]

  if (a === null || b === null) {
    return a === b ? 0 : Number.NaN
  }

  if (name === 'structures' || name === 'keeping') {
    return Math.sign(b - a)
  }

  return Math.abs(b - a) >= SHARE_GAP ? Math.sign(b - a) : 0
}

export type CurvatureReading = {
  family: Family
  pair: string
  rule: string
  background: number
  field: FieldName
  reading: 'curvature' | 'schedule' | 'same'
  sign: number
}

export function curvatureReadings(cells: readonly Cell[]): CurvatureReading[] {
  const out: CurvatureReading[] = []
  const find = (column: string, family: Family, index: number, rule: string, background: number): Cell | undefined =>
    cells.find(c => c.column === column && c.family === family && c.scheduleIndex === index && c.rule === rule && c.background === background)

  for (const m of MATCHED) {
    const pair = `${m.flat}/${m.hyperbolic}`

    for (const c of cells.filter(x => x.column === m.flat && x.scheduleIndex === 0)) {
      // the 4D pair is one family only under Q2R
      if (!m.twoDimensional && c.family !== 'q2r') {
        continue
      }

      const dirs = new Map<FieldName, number[]>(FIELD_NAMES.map(n => [n, []]))

      for (const index of [0, 1]) {
        const f = find(m.flat, c.family, index, c.rule, c.background)
        const h = find(m.hyperbolic, c.family, index, c.rule, c.background)

        if (!f || !h) {
          continue
        }

        for (const name of FIELD_NAMES) {
          dirs.get(name)!.push(direction(name, fieldsOf(f), fieldsOf(h)))
        }
      }

      for (const name of FIELD_NAMES) {
        const [d0, d1] = dirs.get(name)!

        if (d0 === undefined || d1 === undefined) {
          continue
        }

        const both = d0 !== 0 && d0 === d1 && !Number.isNaN(d0)
        const one = !both && (d0 !== 0 || d1 !== 0)

        out.push({ family: c.family, pair, rule: c.rule, background: c.background, field: name, reading: both ? 'curvature' : one ? 'schedule' : 'same', sign: both ? d0 : 0 })
      }
    }
  }

  return out
}

// per family, a field is credited only when its curvature-sensitive readings point one way in all three 2D pairs
export function creditedFields(readings: readonly CurvatureReading[]): string[] {
  const out: string[] = []

  for (const family of ['m1', 'z3', 'q2r'] as const) {
    for (const name of FIELD_NAMES) {
      const signs = MATCHED.filter(m => m.twoDimensional).map(m => {
        const pair = `${m.flat}/${m.hyperbolic}`

        return new Set(readings.filter(r => r.family === family && r.pair === pair && r.field === name && r.reading === 'curvature').map(r => r.sign))
      })
      const all = new Set(signs.flatMap(s => [...s]))

      if (all.size === 1 && signs.every(s => s.size === 1)) {
        out.push(`${family}:${name}`)
      }
    }
  }

  return out
}

// ---- the slice ----

export type SliceLab = {
  m1RuleCount: number
  m1ClassCount: number
  z3RuleCount: number
  z3ClassCount: number
  cells: Cell[]
  // Q2R backgrounds not fixed on a box (not run)
  skipped: string[]
  // conflicts of each Q2R coloring on the radius-COLORING_CHECK_RADIUS ball
  coloringConflicts: { box: string; cells: number; conflicts: number; used: number }[]
  curvature: CurvatureReading[]
  credited: string[]
  serialized: string
}

export function boundarySlice(sizes: SliceSizes, log?: (line: string) => void): SliceLab {
  const m1 = m1Rules()
  const z3 = z3Rules()
  const rules: RuleDef[] = [
    ...(sizes.families.includes('z3') ? z3.rules : []),
    ...(sizes.families.includes('q2r') ? q2rRules(sizes.deltas) : []),
    ...(sizes.families.includes('m1') ? m1.rules : []),
  ].filter(r => !sizes.rules || sizes.rules.includes(r.name))
  const cells: Cell[] = []
  const skipped: string[] = []
  const coloringConflicts: SliceLab['coloringConflicts'] = []

  for (const box of boxDefs(sizes.columns)) {
    const forBox = rules.filter(r => r.kind === box.kind && startSizes(r, box.column, sizes).length > 0)

    if (forBox.length === 0) {
      continue
    }

    if (box.kind === 'vertex') {
      const inst = box.make()
      const check = checkProper(inst.coloring!, canonicalGraph(inst.space), COLORING_CHECK_RADIUS)

      coloringConflicts.push({ box: box.key, cells: check.cells, conflicts: check.conflicts, used: check.used })
    }

    const degree = box.make().space.degree

    for (const rule of forBox) {
      const backgrounds = rule.backgrounds(degree)

      for (const b of [-1, 0, 1]) {
        if (rule.kind === 'vertex' && !backgrounds.includes(b)) {
          skipped.push(`${box.key} ${rule.name} b${b}`)
        }
      }

      for (const background of backgrounds) {
        const t0 = performance.now()
        const cell = readCell(box, rule, background, sizes)

        cells.push(cell)
        log?.(
          `${box.key} ${rule.name} b${background}: ${cell.structures.length} structures, ${cell.structures.reduce((t, s) => t + s.repaired.held + s.repaired.orbit + s.repaired.transit + s.repaired.double, 0)} repaired, ${Math.round(performance.now() - t0)} ms`,
        )
      }
    }
  }

  const curvature = curvatureReadings(cells)
  const serialized = JSON.stringify(
    cells.map(c => [
      c.box,
      c.rule,
      c.background,
      c.structures.map(s => [s.start, s.period, s.regionSize, s.hits, s.repaired, s.immune, s.broken, s.budget, s.keptContacts, s.exports.map(e => e.multiplicities)]),
    ]),
  )

  return {
    m1RuleCount: m1.ruleCount,
    m1ClassCount: m1.classCount,
    z3RuleCount: z3.ruleCount,
    z3ClassCount: z3.classCount,
    cells,
    skipped,
    coloringConflicts,
    curvature,
    credited: creditedFields(curvature),
    serialized,
  }
}

// ---- totals ----

export type FamilyTotals = {
  cells: number
  structures: number
  nonIdentityStructures: number
  keeping: number
  hits: HitTally
  repaired: HitTally
  immune: number
  broken: number
  budget: number
  contacts: number
  keptContacts: number
  largestEnsemble: number
  largestBits: number
  walled: number
  walledRebroken: number
  walledReturned: number
  walledBudget: number
}

const bits = (multiplicities: readonly number[]): number => {
  const n = multiplicities.reduce((s, x) => s + x, 0)

  return n === 0 ? 0 : multiplicities.reduce((s, x) => s - (x / n) * Math.log2(x / n), 0)
}

export function familyTotals(cells: readonly Cell[], family: Family | 'all'): FamilyTotals {
  const chosen = cells.filter(c => family === 'all' || c.family === family)
  const live = chosen.filter(c => !c.identity).flatMap(c => c.structures)
  const add = (f: (h: HitTally) => void): HitTally => {
    const t = tally()

    f(t)

    return t
  }
  const sumTally = (pick: (s: StructureResult) => HitTally): HitTally =>
    add(t => {
      for (const s of live) {
        const h = pick(s)

        t.held += h.held
        t.orbit += h.orbit
        t.transit += h.transit
        t.double += h.double
      }
    })
  const exports = live.flatMap(s => s.exports)
  const walled = live.flatMap(s => s.walled)

  return {
    cells: chosen.length,
    structures: chosen.reduce((t, c) => t + c.structures.length, 0),
    nonIdentityStructures: live.length,
    keeping: live.filter(s => s.keeps).length,
    hits: sumTally(s => s.hits),
    repaired: sumTally(s => s.repaired),
    immune: live.reduce((t, s) => t + s.immune, 0),
    broken: live.reduce((t, s) => t + s.broken, 0),
    budget: live.reduce((t, s) => t + s.budget, 0),
    contacts: live.reduce((t, s) => t + s.contacts, 0),
    keptContacts: live.reduce((t, s) => t + s.keptContacts, 0),
    largestEnsemble: exports.reduce((m, e) => Math.max(m, e.ensemble), 0),
    largestBits: exports.reduce((m, e) => Math.max(m, bits(e.multiplicities)), 0),
    walled: walled.length,
    walledRebroken: walled.filter(w => w.rebroken).length,
    walledReturned: walled.filter(w => w.returned > 0).length,
    walledBudget: walled.filter(w => w.budget).length,
  }
}

export const entropyOf = bits

// ---- reproduction of slice 1 (positive control) ----

// On {6,4} lifted-0, the class id.ACB.swap on -1, boundary.ts's phase-0 single-cell family read against this module's,
// on the same space: outcome for outcome and final for final. Slice 1 found repairs there.
export function reproduceSlice1(): { structures: number; readings: number; mismatches: number; repairs: number } {
  const m1 = m1Rules()
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })
  const rep = classes.find(c => c.representative.name === 'id.ACB.swap')?.representative

  if (!rep || !m1.rules.some(r => r.name === 'id.ACB.swap')) {
    throw new Error('boundary-m2-lab: id.ACB.swap is not a class representative')
  }

  const space = cosetSpace({ name: '{6,4}/coset-0', p: 6, q: 4, variant: 0 }) as BoxSpace
  const colors = allColors(space)
  const rule = harnessRule({ name: rep.name, table: rep.table })
  const background = -1
  const run: BoundaryRun = { space, colors, rule, background, keepsExcitation: conservesExcitation(rep.table) }
  const dyn = pairDynamics({ space, colors, rule, background, ledgers: [chargeLedger(background)] })
  const old = slice1Structures(run).structures

  let readings = 0
  let mismatches = 0
  let repairs = 0

  for (const s of old) {
    const mine = structureOf(dyn, s.start, START_CELLS_MAX_SMALL)
    const theirs = slice1Family(run, s)

    if (!mine || mine.period !== s.period || mine.region.join() !== s.region.join()) {
      mismatches++
      continue
    }

    const ours = perturbationFamily(dyn, mine, 0, false)

    if (ours.length !== theirs.length) {
      mismatches++
      continue
    }

    theirs.forEach((p, i) => {
      const q = ours[i]!
      const a = slice1Read(run, s, p)
      const b = readPerturbation(dyn, mine, q)

      readings++
      repairs += a.outcome === 'repaired' ? 1 : 0

      if (q.changes.length !== 1 || q.changes[0]!.cell !== p.cell || q.changes[0]!.tone !== p.tone || a.outcome !== b.outcome || !sameTones(a.final, b.final)) {
        mismatches++
      }
    })
  }

  return { structures: old.length, readings, mismatches, repairs }
}
