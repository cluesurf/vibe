// M6, universality from the M1 rules alone (item vibe-computation-models-0017). Algebra: spin-one tones read as
// particle species, balanced ternary for register values. Library: code/compute/lab/counter.ts. Nothing is added to
// the mesh but a LAYOUT; the railway CA (Paper 0012) is not used. Criteria fixed before the first run in
// note/project/vibe/computation/models/m6-universality.md (G1 to G7), after two exploratory probes
// (W/tmp/m6-probe.ts, W/tmp/m6-probe2.ts) that read the split counts, the register's sign and the census size.
//
// G1  the split of the 72 rule-background cells: 24 species-conserving (types T0..T5), 32 reactive, 16 without a
//     quiet background; the M5 occupancy-blind cells are exactly the T0..T3 cells.
// G2  the no-feedback lemma: pair-level brute force, then live on the line and two tilings: the driving layer follows
//     its fixed permutation, and the backward tracer (single-cell walks only, logspace) equals the joint run.
// G4  the line: every start of width <= 6 ends its free interactions by round width + 2; cavities return exactly.
// G5  T2: the tones' left-to-right order never changes on the line (no controlled transposition, no Fredkin gate).
// G6  the T5 register: ADD and SUB equal direct evaluation on 0..8 x 0..8; movers never read it (no zero test).
// G7  the reactive cells: the bounded Minsky-ingredient census on the line.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  CellSplit,
  LineStart,
  Schedule,
  applyStep,
  driverCells,
  lemmaBreaks,
  lineOrders,
  lineStarts,
  lineTransient,
  predictedDriver,
  reactiveIngredients,
  registerRun,
  splitCell,
  stepRun,
  traceTone,
} from '@/code/compute/lab/counter'
import { GateRule, gateRule, occupancyBlind } from '@/code/compute/lab/gates'
import { cosetSpace, roundColors } from '@/code/compute/lab/lazy-space'
import { Tones, lineSpace } from '@/code/measure/particle-census'
import { inverseTable, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/counter.ts', 'test/experiment/computation/universality-m1.ts']

// ---- parameters, fixed before the first run ----

const LINE_WIDTH = 6
const TRACER_WIDTH = 4
const TRACER_ROUNDS = 8
const TILING_ROUNDS = 4
const CAVITY_CAP = 60
const ORDER_ROUNDS = 16
const REGISTER_RANGE = 8
const REVERSE_ROUNDS = 12
const T5_RULE = 'id.CBA.swap'
const T2_RULE = 'swap.ABC.swap'
const T3_RULE = 'swap.CBA.swap'
const REACTIVE_CONTROL = 'id.CAB.swap'

type Rule = { name: string; rule: GateRule; inverse: GateRule }

function rules(): { list: Rule[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()

  return {
    ruleCount: census.rules.length,
    classCount: pairRuleClasses({ rules: census.rules }).length,
    list: census.rules.map(r => ({
      name: r.name,
      rule: gateRule(r.name, r.table),
      inverse: gateRule(`${r.name}^-1`, inverseTable(r.table)),
    })),
  }
}

// the start as sparse tones: background cells are left out (a sparse state never holds the background)
function lineTones(s: LineStart, background: number): Tones {
  const line = lineSpace()

  return new Map(
    s.window.flatMap((t, i): [number, number][] => (t === background ? [] : [[line.at(s.start + i), t]])),
  )
}

function sameCells(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

// G2 on one schedule: driving layer and tracer against the joint run; returns the failures
function tracerCheck(input: {
  rule: GateRule
  split: CellSplit
  schedule: Schedule
  starts: readonly Tones[]
  rounds: number
}): { reads: number; failures: string[] } {
  const { rule, split, schedule, starts, rounds } = input
  const L = schedule.colors.length
  const failures: string[] = []

  let reads = 0

  for (const start of starts) {
    const run = stepRun(rule, split.background, schedule, start, rounds * L)

    for (let r = 1; r <= rounds; r++) {
      const k = r * L
      const state = run[k]!

      if (!sameCells(driverCells(split, state), predictedDriver(split, schedule, start, k))) {
        failures.push(`${split.rule}/${split.background} driver r${r}`)
      }

      const cells = new Set<number>()

      for (const c of state.keys()) {
        cells.add(c)

        for (const n of schedule.space.neighbors(c)) {
          cells.add(n)
        }
      }

      for (const c of cells) {
        reads++

        if (traceTone(split, schedule, start, k, c) !== (state.get(c) ?? split.background)) {
          failures.push(`${split.rule}/${split.background} tracer r${r} cell ${c}`)
          break
        }
      }

      if (state.size !== start.size && split.kind === 'species') {
        failures.push(`${split.rule}/${split.background} count`)
      }
    }
  }

  return { reads, failures }
}

function tilingStarts(schedule: Schedule, background: number): Tones[] {
  const off = [-1, 0, 1].filter(t => t !== background)
  const ring = [...schedule.space.neighbors(0)]
  const supports: number[][] = [[0]]

  for (let i = 0; i < ring.length; i++) {
    supports.push([0, ring[i]!])

    for (let j = i + 1; j < ring.length; j++) {
      supports.push([0, ring[i]!, ring[j]!])
    }
  }

  const out: Tones[] = []

  for (const s of supports) {
    for (let code = 0; code < 2 ** s.length; code++) {
      out.push(new Map(s.map((c, i) => [c, off[(code >> i) & 1]!])))
    }
  }

  return out
}

function reversible(r: Rule, background: number, schedule: Schedule, start: Tones, steps: number): boolean {
  const state = new Map(start)

  for (let k = 0; k < steps; k++) {
    applyStep(r.rule, background, schedule, k, state)
  }

  for (let k = steps - 1; k >= 0; k--) {
    applyStep(r.inverse, background, schedule, k, state)
  }

  return state.size === start.size && [...start].every(([c, t]) => state.get(c) === t)
}

function universalityM1(input: { lineWidth: number; tracerWidth: number; tilings: boolean }) {
  const { list, ruleCount, classCount } = rules()
  const line: Schedule = { space: lineSpace(), colors: [0, 1] }
  const cells = list.flatMap(r => [-1, 0, 1].map(b => ({ r, b, split: splitCell(r.rule, b) })))
  const species = cells.filter(c => c.split.kind === 'species')
  const reactive = cells.filter(c => c.split.kind === 'reactive')
  const live = cells.filter(c => c.split.kind === 'live_vacuum')
  const types: Record<string, string[]> = {}

  for (const c of species) {
    ;(types[c.split.type!] ??= []).push(`${c.r.name}/${c.b}`)
  }

  // G1: the M5 blind cells against T0..T3
  const blind = cells.filter(c => occupancyBlind(c.r.rule, c.b) && c.split.kind !== 'live_vacuum').map(c => `${c.r.name}/${c.b}`)
  const blindTypes = species.filter(c => ['T0', 'T1', 'T2', 'T3'].includes(c.split.type!)).map(c => `${c.r.name}/${c.b}`)
  const blindMatch = [...blind].sort().join(' ') === [...blindTypes].sort().join(' ')

  // G2: pair-level lemma
  const lemma = species.flatMap(c => lemmaBreaks(c.r.rule, c.split).map(x => `${c.r.name}/${c.b} ${x}`))

  // G2: live, line
  const tracerStarts = (b: number): Tones[] => lineStarts(b, input.tracerWidth).map(s => lineTones(s, b))
  const lineTracer = species.map(c =>
    tracerCheck({ rule: c.r.rule, split: c.split, schedule: line, starts: tracerStarts(c.b), rounds: TRACER_ROUNDS }),
  )

  // G2: live, tilings
  const tilingReads: { space: string; reads: number; failures: string[] }[] = []

  if (input.tilings) {
    for (const [p, q] of [
      [4, 4],
      [4, 5],
    ] as const) {
      const space = cosetSpace({ name: `{${p},${q}}/coset`, p, q })
      const schedule: Schedule = { space, colors: roundColors(space, 'forward') }

      let reads = 0

      const failures: string[] = []

      for (const c of species) {
        const r = tracerCheck({
          rule: c.r.rule,
          split: c.split,
          schedule,
          starts: tilingStarts(schedule, c.b),
          rounds: TILING_ROUNDS,
        })

        reads += r.reads
        failures.push(...r.failures)
      }

      tilingReads.push({ space: `{${p},${q}}/coset`, reads, failures })
    }
  }

  // G2 negative control: a reactive cell traced as if it were T2
  const control = list.find(r => r.name === REACTIVE_CONTROL)!
  const fake: CellSplit = { ...splitCell(control.rule, 1), kind: 'species', type: 'T2' }
  const controlFailures = tracerCheck({
    rule: control.rule,
    split: fake,
    schedule: line,
    starts: tracerStarts(1),
    rounds: TRACER_ROUNDS,
  }).failures.length

  // G4: the line transient
  const transient: string[] = []

  let transientStarts = 0
  let maxLast = -1

  for (const c of species) {
    for (const s of lineStarts(c.b, input.lineWidth)) {
      const w = s.window.length
      const t = lineTransient({ rule: c.r.rule, split: c.split, start: s, from: w + 2, cap: CAVITY_CAP })

      transientStarts++
      maxLast = Math.max(maxLast, t.lastFreeEvent - w)

      const needsPeriod = c.split.type === 'T0' || c.split.type === 'T1' || c.split.type === 'T4'

      if (t.lastFreeEvent > w + 1 || (needsPeriod && t.cavityPeriod === null)) {
        transient.push(`${c.r.name}/${c.b} ${s.start}:${s.window.join(',')} last ${t.lastFreeEvent} period ${t.cavityPeriod}`)
      }
    }
  }

  // G5: order of tones on the line under T2, and the T3 control
  const t2 = list.find(r => r.name === T2_RULE)!
  const t3 = list.find(r => r.name === T3_RULE)!

  let orderBroken = 0
  let orderStarts = 0
  let controlOrderChanges = 0

  for (const s of lineStarts(0, input.lineWidth)) {
    const o = lineOrders(t2.rule, 0, s, ORDER_ROUNDS)

    orderStarts++
    orderBroken += o.some(x => x !== o[0]) ? 1 : 0
    controlOrderChanges += lineOrders(t3.rule, 0, s, ORDER_ROUNDS).some((x, i, all) => x !== all[0]) ? 1 : 0
  }

  // G6: the T5 register
  const t5 = list.find(r => r.name === T5_RULE)!
  const t5Split = splitCell(t5.rule, 0)
  const unit = registerRun({ rule: t5.rule, split: t5Split, a: 0, n: 1, from: 'right' }).value
  const addSide: 'left' | 'right' = unit === 1 ? 'right' : 'left'
  const subSide: 'left' | 'right' = addSide === 'right' ? 'left' : 'right'
  const register: string[] = []

  let registerCases = 0
  let moversRead = 0
  let corruptedAccepted = 0
  let t2RegisterMatches = 0

  const t2Split = splitCell(t2.rule, 0)

  for (let a = 0; a <= REGISTER_RANGE; a++) {
    for (let n = 0; n <= REGISTER_RANGE; n++) {
      const add = registerRun({ rule: t5.rule, split: t5Split, a, n, from: addSide })
      const sub = registerRun({ rule: t5.rule, split: t5Split, a, n, from: subSide })

      registerCases += 2

      if (add.value !== a + n) {
        register.push(`add ${a} ${n} -> ${add.value}`)
      }

      if (sub.value !== a - n) {
        register.push(`sub ${a} ${n} -> ${sub.value}`)
      }

      moversRead += (add.moversFree ? 0 : 1) + (sub.moversFree ? 0 : 1)
      corruptedAccepted += add.value === a + n + 1 ? 1 : 0

      // control: the same layout under the T2 exchange (still and mover both move) must not keep a register
      const ctl = registerRun({ rule: t2.rule, split: { ...t2Split, mover: 1, still: -1 }, a, n, from: addSide })

      t2RegisterMatches += n > 0 && ctl.value === a + n ? 1 : 0
    }
  }

  // G7: reactive census
  const census = reactive.map(c => ({ cell: `${c.r.name}/${c.b}`, ...reactiveIngredients(c.r.rule, c.b) }))

  // common: reversibility
  let reverseRuns = 0
  let reverseFailures = 0

  for (const c of [...species, ...reactive]) {
    const starts = lineStarts(c.b, 3).slice(0, c.split.kind === 'reactive' ? 32 : 1000)

    for (const s of starts) {
      reverseRuns++
      reverseFailures += reversible(c.r, c.b, line, lineTones(s, c.b), 2 * REVERSE_ROUNDS) ? 0 : 1
    }
  }

  const serialized = JSON.stringify({
    types,
    lemma,
    lineTracer: lineTracer.map(x => [x.reads, x.failures.length]),
    tilingReads,
    transient,
    orderBroken,
    register,
    census: census.map(c => [c.cell, c.statics, c.movers, c.collisions, c.transparent, c.shifts, c.counter?.delta ?? 0, c.reference, c.lead]),
  })

  return {
    ruleCount,
    classCount,
    counts: { species: species.length, reactive: reactive.length, live: live.length },
    types,
    blind,
    blindTypes,
    blindMatch,
    lemma,
    lineTracer,
    tilingReads,
    controlFailures,
    transient,
    transientStarts,
    maxLast,
    orderBroken,
    orderStarts,
    controlOrderChanges,
    addSide,
    register,
    registerCases,
    moversRead,
    corruptedAccepted,
    t2RegisterMatches,
    census,
    reverseRuns,
    reverseFailures,
    serialized,
  }
}

export default experiment({
  id: 'computation/universality-m1',
  code: 'E-CMP-0057',
  title:
    'M6 universality from the M1 pair rules alone: the split of the 72 rule-background cells, the no-feedback lemma with a logspace backward tracer for the 24 species-conserving cells, the line no-go, the T5 particle-position register without a zero test, and the bounded Minsky-ingredient census of the 32 reactive cells',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = universalityM1({ lineWidth: LINE_WIDTH, tracerWidth: TRACER_WIDTH, tilings: true })
    const twice = (): string => universalityM1({ lineWidth: 3, tracerWidth: 2, tilings: false }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const lineFailures = r.lineTracer.flatMap(x => x.failures)
    const lineReads = r.lineTracer.reduce((s, x) => s + x.reads, 0)
    const tilingFailures = r.tilingReads.flatMap(x => x.failures)
    const leads = r.census.filter(c => c.lead).map(c => c.cell)
    const counters = r.census.filter(c => c.counter !== null).map(c => c.cell)
    const references = r.census.filter(c => c.reference !== null).map(c => c.cell)
    const reactiveCollisions = r.census.reduce((s, c) => s + c.collisions, 0)
    const reactiveTransparent = r.census.reduce((s, c) => s + c.transparent, 0)
    const reactiveShifts = r.census.reduce((s, c) => s + c.shifts, 0)
    const checks: [boolean, string][] = [
      [r.ruleCount === 24 && r.classCount === 12, 'rule census'],
      [r.counts.species === 24 && r.counts.reactive === 32 && r.counts.live === 16, `split ${JSON.stringify(r.counts)}`],
      [Object.keys(r.types).length === 6, `types ${Object.keys(r.types).join(' ')}`],
      [r.blindMatch, `blind cells ${r.blind.length} against T0..T3 ${r.blindTypes.length}`],
      [r.lemma.length === 0, `lemma ${r.lemma.slice(0, 3).join('; ')}`],
      [lineFailures.length === 0 && lineReads > 0, `line tracer ${lineFailures.slice(0, 3).join('; ')}`],
      [tilingFailures.length === 0 && r.tilingReads.length === 2, `tiling tracer ${tilingFailures.slice(0, 3).join('; ')}`],
      [r.controlFailures > 0, 'the tracer passed a reactive cell'],
      [r.transient.length === 0, `line transient ${r.transient.slice(0, 3).join('; ')}`],
      [r.orderBroken === 0, `T2 order broken on ${r.orderBroken}`],
      [r.controlOrderChanges > 0, 'T3 control never changed the order'],
      [r.register.length === 0, `register ${r.register.slice(0, 3).join('; ')}`],
      [r.moversRead === 0, `movers left free flight ${r.moversRead}`],
      [r.corruptedAccepted === 0, 'corrupted register value accepted'],
      // the control fails when the T2 exchange does not reproduce the register on every case with a mover
      [r.t2RegisterMatches < (REGISTER_RANGE + 1) * REGISTER_RANGE, `T2 control kept a register ${r.t2RegisterMatches}`],
      [r.reverseFailures === 0 && r.reverseRuns > 0, `reversibility ${r.reverseFailures}`],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `of the 72 rule-background cells of the M1 pair rules, ${r.counts.species} conserve each species (types ${Object.entries(r.types).map(([k, v]) => `${k} ${v.length}`).join(', ')}), ${r.counts.reactive} react (two 0 tones fuse on a +-1 background) and ${r.counts.live} have no quiet background; in every species cell whether a pair swaps is fixed by a driving layer that moves by a fixed cell permutation (occupancy, or the mover set in free flight or among static mirrors) and nothing acts back on it (brute force over the nine pairs, any graph and schedule), so a backward tracer that holds one cell and one step at a time reproduces every read cell of the joint run (${lineReads} line reads, ${r.tilingReads.map(x => `${x.reads} on ${x.space}`).join(', ')}, 0 mismatches; it fails on a reactive control): the state at round T is a logspace function of the start, so a layout simulating a Turing machine with polynomial overhead would give P = L; on the line every one of ${r.transientStarts} starts of width <= ${LINE_WIDTH} ends its free interactions by round width ${r.maxLast >= 0 ? '+' : '-'} ${Math.abs(r.maxLast)} and the rest is periodic, so every long-term question is decidable there; the T2 exchange never changes the tones' order on the line (0 of ${r.orderStarts}), so no controlled transposition and no Fredkin gate on tones exist there, and its outputs never become controls anywhere; in ${T5_RULE} on the vacuum a static -1 is a register whose value is its position: +1s sent from the ${r.addSide} add, from the other side subtract, equal to direct evaluation on all ${r.registerCases} cases, but every +1 keeps its free-flight track for every value, so no zero test and no multiplication exist; in the reactive cells the line census (statics and movers of width <= 3) finds ${reactiveShifts} shifts and ${reactiveTransparent} transparent meetings in ${reactiveCollisions}, increment and decrement on ${counters.length} cells but no reference static (${references.length}), so no zero test and no counter lead (${leads.length}): a bounded absence`,
      metrics: {
        speciesCells: r.counts.species,
        reactiveCells: r.counts.reactive,
        liveVacuumCells: r.counts.live,
        lemmaBreaks: r.lemma.length,
        lineTracerReads: lineReads,
        tilingTracerReads: r.tilingReads.reduce((s, x) => s + x.reads, 0),
        tracerFailures: lineFailures.length + tilingFailures.length,
        transientStarts: r.transientStarts,
        transientFailures: r.transient.length,
        maxLastEventMinusWidth: r.maxLast,
        orderStarts: r.orderStarts,
        orderBroken: r.orderBroken,
        registerCases: r.registerCases,
        registerFailures: r.register.length,
        reactiveCollisions,
        reactiveShifts,
        reactiveTransparent,
        counterCells: counters.length,
        referenceCells: references.length,
        leads: leads.length,
        reverseRuns: r.reverseRuns,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        reactiveTracerFailures: r.controlFailures,
        t3OrderChanges: r.controlOrderChanges,
        corruptedAccepted: r.corruptedAccepted,
        t2RegisterMatches: r.t2RegisterMatches,
      },
      notes:
        `M6 (item vibe-computation-models-0017). Types: ${Object.entries(r.types).map(([k, v]) => `${k}: ${v.join(' ')}`).join('; ')}. Reactive census: ${r.census.map(c => `${c.cell} s${c.statics} m${c.movers} c${c.collisions} sh${c.shifts}${c.counter ? ' ctr' : ''}`).join(', ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})

export { universalityM1 }
