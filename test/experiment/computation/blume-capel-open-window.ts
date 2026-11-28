// M7 follow-up. Algebra: spin-one. Does the reversible Blume-Capel rule (M2-B), which
// keeps energy but neither the charge Q nor the excitation D, restore erased or flipped tones on a readout region in the
// OPEN window, where M7 saw it do so only transiently on the closed flat {6,3} torus? Library
// code/compute/lab/open-blume-capel.ts (the open and walled rule) and code/substrate/coxeter/canonical-vertex-coloring.ts
// (the proper vertex coloring of the infinite tiling it needs); the census is M7's (code/compute/lab/association.ts).
//
// Declared before the first full run:
// - M7'S CRITERIA UNCHANGED: R the radius-1 ball of the origin in canonical order, every cue on R, 48 rounds, late trace
//   rounds 24..48, field-realized readout (the external nearest-word decoder labeled), J = 1, Delta in {1, 2}.
// - BOXES: the open lazy coset window and the same tiling and coloring behind a wall at radius 7 (the induced ball, a
//   closed box), on {4,4}/{4,5}, {3,6}/{3,7}, {6,3}/{6,4}; colorings 'greedy' and 'greedy-shifted' of the canonical
//   (breadth-first) order on both sides of every pair, colors in forward order: the open counterpart of the quotients'
//   greedy-bfs family.
// - BUDGET: a run whose support passes SUPPORT_CAP stops and its cue is never read. FRONT GATE: before an open census,
//   the lone +1 at the origin runs 48 rounds; if it passes the budget, that open census is not run and the reason is
//   recorded (the light cone of a hyperbolic tiling holds exponentially many cells).
// - PERSISTENCE: every open completion runs on to round PERSIST_UNTIL; every walled completion is checked for exact
//   return within 512 rounds (transient).
// - QUOTIENTS (reproduction and positive control): the M7 quotients of the six columns with SparseBlumeCapel exactly as
//   M7 ran it, systoles beside each.
// - GATES: the coloring is proper on the radius-5 ball of every space and coloring and gives the same colors when the
//   cells are built in another order; energy kept in every completed run; light cone respected; the walled box, run
//   densely for speed, equals the sparse walled rule on its first 8 cues; two runs of the {3,7} pair give identical
//   bytes; no file draws a random number. NEGATIVE: a frozen system (the identity) has no merge and no
//   completion; Blume-Capel at Delta = degree + 1, where no vacancy move is possible so D is kept, has no pure erase and
//   no pure flip completion in any box (the M7 conservation bound, D alone). POSITIVE: the census sees the quotient
//   completions M7 reported (22 and 50 on the {6,3} torus).

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  RETURN_CAP,
  RegionCensus,
  RegionSystem,
  SparseBlumeCapel,
  blumeCapelSystem,
  chargeAbout,
  keyWord,
  regionCensus,
  regionCues,
} from '@/code/compute/lab/association'
import { LabInstance, closedInstances } from '@/code/compute/lab/harness'
import { LazySpace, cosetSpace } from '@/code/compute/lab/lazy-space'
import {
  OpenBlumeCapel,
  OpenRunStats,
  WalledBlumeCapel,
  openBlumeCapelSystem,
  walledBlumeCapelSystem,
} from '@/code/compute/lab/open-blume-capel'
import { sameTones } from '@/code/measure/particle-census'
import { cellGraph, independentSetSchedule } from '@/code/rule/spin-one-q2r'
import {
  CanonicalColoringKind,
  CanonicalGraph,
  CanonicalVertexColoring,
  checkProper,
} from '@/code/substrate/coxeter/canonical-vertex-coloring'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/compute/lab/open-blume-capel.ts',
  'code/substrate/coxeter/canonical-vertex-coloring.ts',
  'test/experiment/computation/blume-capel-open-window.ts',
]

// ---- parameters, fixed before the first full run ----

const WALL_RADIUS = 7
const CRYSTAL_FIELDS = [1, 2]
const COLORINGS: readonly CanonicalColoringKind[] = ['greedy', 'greedy-shifted']
const SUPPORT_CAP = 40_000
const PERSIST_UNTIL = 96
const CHECK_RADIUS = 5
const ORDER_RADIUS = 4
const DENSE_CHECK = 8

const MATCHED: readonly { flat: [LabGeometryName, number, number]; hyperbolic: [LabGeometryName, number, number] }[] = [
  { flat: ['{4,4}', 4, 4], hyperbolic: ['{4,5}', 4, 5] },
  { flat: ['{3,6}', 3, 6], hyperbolic: ['{3,7}', 3, 7] },
  { flat: ['{6,3}', 6, 3], hyperbolic: ['{6,4}', 6, 4] },
]

const QUOTIENT_COLUMNS: readonly LabGeometryName[] = ['{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}']

// ---- spaces ----

function canonicalGraph(space: LazySpace): CanonicalGraph {
  return {
    degree: space.degree,
    neighbors: c => space.neighbors(c),
    distance: c => space.distance(c),
    compare: (a, b) => space.compare(a, b),
  }
}

type Column = {
  column: LabGeometryName
  p: number
  q: number
  curvature: 'flat' | 'hyperbolic'
  pair: string
}

function columns(): Column[] {
  return MATCHED.flatMap(m => [
    { column: m.flat[0], p: m.flat[1], q: m.flat[2], curvature: 'flat' as const, pair: `${m.flat[0]}/${m.hyperbolic[0]}` },
    { column: m.hyperbolic[0], p: m.hyperbolic[1], q: m.hyperbolic[2], curvature: 'hyperbolic' as const, pair: `${m.flat[0]}/${m.hyperbolic[0]}` },
  ])
}

type ColoringGate = { space: string; kind: CanonicalColoringKind; cells: number; conflicts: number; used: number; colors: number; orderMismatches: number; orderCells: number }

// Proper on the radius-CHECK_RADIUS ball; the same colors (by address) when a fresh space builds and colors the
// radius-ORDER_RADIUS ball farthest cell first.
function coloringGate(col: Column, kind: CanonicalColoringKind): ColoringGate {
  const space = cosetSpace({ name: col.column, p: col.p, q: col.q })
  const graph = canonicalGraph(space)
  const coloring = new CanonicalVertexColoring({ graph, kind })
  const check = checkProper(coloring, graph, CHECK_RADIUS)
  const seen = new Set<number>([0])
  const queue = [0]

  for (const u of queue) {
    if (space.distance(u) >= ORDER_RADIUS) {
      continue
    }

    for (const w of space.neighbors(u)) {
      if (!seen.has(w)) {
        seen.add(w)
        queue.push(w)
      }
    }
  }

  const addresses = queue.sort((a, b) => space.compare(b, a)).map(c => [space.address(c), coloring.colorOf(c)] as const)
  const fresh = cosetSpace({ name: col.column, p: col.p, q: col.q })
  const freshColoring = new CanonicalVertexColoring({ graph: canonicalGraph(fresh), kind })
  const cells = addresses.map(([a]) => fresh.fromAddress(a))

  let orderMismatches = 0

  addresses.forEach(([, c], i) => {
    if (freshColoring.colorOf(cells[i]!) !== c) {
      orderMismatches++
    }
  })

  return { space: col.column, kind, cells: check.cells, conflicts: check.conflicts, used: check.used, colors: coloring.colors, orderMismatches, orderCells: addresses.length }
}

// ---- readings ----

type Summary = {
  cues: number
  stored: number
  completions: number
  byKind: Record<string, number>
  forgotten: number
  merges: number
  nearAll: number
  nearRight: number
  nearByKind: Record<string, [number, number]>
  externalEnd: number
  externalStart: number
}

function summarize(c: RegionCensus): Summary {
  const byKind: Record<string, number> = { erase: 0, flip: 0, add: 0, mixed: 0 }

  for (const x of c.completions) {
    byKind[x.kind] = (byKind[x.kind] ?? 0) + 1
  }

  return {
    cues: c.cues,
    stored: c.stored.length,
    completions: c.completions.length,
    byKind,
    forgotten: c.forgotten,
    merges: c.merges,
    nearAll: c.near.all,
    nearRight: c.near.right,
    nearByKind: {
      erase: [c.near.byKind.erase.right, c.near.byKind.erase.all],
      flip: [c.near.byKind.flip.right, c.near.byKind.flip.all],
      add: [c.near.byKind.add.right, c.near.byKind.add.all],
    },
    externalEnd: c.near.externalEnd,
    externalStart: c.near.externalStart,
  }
}

// Conservation reading of an erase or flip completion: what the outside of R must carry, Q_out = Q(c) - Q(p) and
// D_out = D(c) - D(p) taken over the cue and the target words, and whether a D-keeping rule could ever leave that
// outside (D_out >= |Q_out| needs D kept AND Q kept; D_out >= 0 needs D kept alone, with D_out = 0 forcing an empty
// outside). `dKeptPossible` is false when no rule keeping D could make this completion.
type Ledger = { cue: string; target: string; kind: string; qOut: number; dOut: number; dFinal: number; dStart: number; dKeptPossible: boolean }

function ledger(c: RegionCensus['completions'][number]): Ledger {
  const cw = chargeAbout(keyWord(c.cue), 0)
  const pw = chargeAbout(keyWord(c.target), 0)
  const dOut = cw.d - pw.d

  return {
    cue: c.cue,
    target: c.target,
    kind: c.kind,
    qOut: cw.q - pw.q,
    dOut,
    dStart: [...c.start.values()].reduce((s, t) => s + t * t, 0),
    dFinal: [...c.final.values()].reduce((s, t) => s + t * t, 0),
    // dOut < 0 is impossible with D kept; dOut = 0 forces the whole final state to be p alone, which a bijection
    // forbids for c != p (p's own run, keeping p on R and D, is p alone too)
    dKeptPossible: dOut > 0,
  }
}

type BoxKind = 'open' | 'walled'

type Reading = {
  box: string
  boxKind: BoxKind
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  pair: string
  coloring: CanonicalColoringKind
  colors: number
  crystalField: number
  // null when the front gate refused the open census
  summary: Summary | null
  refused: string | null
  stopped: number
  energyFailures: number
  coneExcess: number
  maxSupport: number
  completionKeys: string[]
  recall: Ledger[]
  // walled: completions returning within RETURN_CAP and not; open: completions persisting to PERSIST_UNTIL and not
  transient: number
  notReturned: number
  persistent: number
  faded: number
  // walled: cues among the first DENSE_CHECK whose dense and sparse runs differ (must be 0)
  denseMismatches: number
  serialized: string
}

function frontGate(rule: OpenBlumeCapel): string | null {
  const state = new Map<number, number>([[0, 1]])

  for (let t = 1; t <= 48; t++) {
    if (!rule.round(state)) {
      return `the lone +1 at the origin passes ${SUPPORT_CAP} cells at round ${t}`
    }
  }

  return null
}

function readBox(input: { col: Column; kind: CanonicalColoringKind; crystalField: number; boxKind: BoxKind; coloring: CanonicalVertexColoring; space: LazySpace }): Reading {
  const { col, kind, crystalField, boxKind, coloring, space } = input
  const region = [0, ...[...space.neighbors(0)].sort((a, b) => space.compare(a, b))]
  const make = (): OpenBlumeCapel =>
    new OpenBlumeCapel({
      model: { coupling: 1, crystalField },
      coloring,
      distance: c => space.distance(c),
      wall: boxKind === 'walled' ? WALL_RADIUS : null,
      supportCap: SUPPORT_CAP,
      colorOrder: 'forward',
    })
  const rule = make()
  const base: Omit<Reading, 'summary' | 'refused' | 'serialized'> = {
    box: `${boxKind}:${col.column}~${kind}`,
    boxKind,
    column: col.column,
    curvature: col.curvature,
    pair: col.pair,
    coloring: kind,
    colors: coloring.colors,
    crystalField,
    stopped: 0,
    energyFailures: 0,
    coneExcess: Number.NEGATIVE_INFINITY,
    maxSupport: 0,
    completionKeys: [],
    recall: [],
    transient: 0,
    notReturned: 0,
    persistent: 0,
    faded: 0,
    denseMismatches: 0,
  }

  const refused = boxKind === 'open' ? frontGate(make()) : null

  if (refused) {
    return { ...base, summary: null, refused, serialized: JSON.stringify([base.box, crystalField, refused]) }
  }

  const stats: OpenRunStats = { stopped: [], energyFailures: 0, maxSupport: 0 }
  const dense =
    boxKind === 'walled'
      ? new WalledBlumeCapel({ model: { coupling: 1, crystalField }, coloring, distance: c => space.distance(c), wall: WALL_RADIUS, colorOrder: 'forward' })
      : null
  const cues = regionCues(region.length, 0)
  const census = regionCensus(dense ? walledBlumeCapelSystem(dense, region, stats) : openBlumeCapelSystem(rule, region, stats), cues)

  // gate: the dense walled run equals the sparse walled rule on the first DENSE_CHECK cues
  let denseMismatches = 0

  if (dense) {
    const sparseStats: OpenRunStats = { stopped: [], energyFailures: 0, maxSupport: 0 }
    const sparse = openBlumeCapelSystem(rule, region, sparseStats)
    const fast = walledBlumeCapelSystem(dense, region, { stopped: [], energyFailures: 0, maxSupport: 0 })

    for (const cue of cues.slice(0, DENSE_CHECK)) {
      const a = sparse.runCue(cue)
      const b = fast.runCue(cue)

      if (a.words.join('|') !== b.words.join('|') || !sameTones(a.final, b.final)) {
        denseMismatches++
      }
    }
  }

  const recall = census.completions.filter(c => c.kind === 'erase' || c.kind === 'flip').map(ledger)

  let transient = 0
  let notReturned = 0
  let persistent = 0
  let faded = 0

  for (const c of census.completions) {
    if (dense) {
      if (dense.returnTime(c.start, RETURN_CAP) > 0) {
        transient++
      } else {
        notReturned++
      }
    } else if (rule.persists({ final: c.final, region, word: c.target, until: PERSIST_UNTIL }).persists) {
      persistent++
    } else {
      faded++
    }
  }

  return {
    ...base,
    summary: summarize(census),
    refused: null,
    stopped: stats.stopped.length,
    energyFailures: stats.energyFailures,
    coneExcess: rule.coneExcess,
    maxSupport: stats.maxSupport,
    completionKeys: census.completions.map(c => `${c.cue}>${c.target}`),
    recall,
    transient,
    notReturned,
    persistent,
    faded,
    denseMismatches,
    serialized: JSON.stringify([base.box, crystalField, census.serialized, stats.stopped.length]),
  }
}

// ---- controls ----

// a frozen system: every round keeps the cue (no merge, no completion is possible)
function frozenSystem(region: readonly number[]): RegionSystem {
  return {
    region,
    background: 0,
    runCue(cue) {
      const start = new Map<number, number>()

      region.forEach((cell, i) => {
        if (cue[i] !== 0) {
          start.set(cell, cue[i]!)
        }
      })

      const key = Array.from(cue, t => 'nzp'[t + 1]).join('')

      return { words: Array.from({ length: 49 }, () => key), final: new Map(start), start }
    },
  }
}

type DKeptControl = { box: string; crystalField: number; eraseFlip: number; completions: number; stopped: number; refused: string | null }

// Delta = degree + 1: |J h| <= degree < Delta, so no vacancy move happens and D is kept; the M7 bound then forbids every
// pure erase and pure flip completion in any box
function dKeptControl(col: Column, coloring: CanonicalVertexColoring, space: LazySpace, boxKind: BoxKind): DKeptControl {
  const r = readBox({ col, kind: coloring.kind, crystalField: space.degree + 1, boxKind, coloring, space })

  return {
    box: r.box,
    crystalField: space.degree + 1,
    eraseFlip: r.summary ? r.summary.byKind.erase! + r.summary.byKind.flip! : 0,
    completions: r.summary?.completions ?? 0,
    stopped: r.stopped,
    refused: r.refused,
  }
}

type QuotientReading = {
  name: string
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  cells: number
  systole: number | null
  loopSystole: number | null
  crystalField: number
  completions: number
  recall: number
  transient: number
  notReturned: number
  energyFailures: number
}

function quotientPicks(): LabInstance[] {
  const seen = new Set<string>()
  const out: LabInstance[] = []

  for (const inst of closedInstances()) {
    if (!QUOTIENT_COLUMNS.includes(inst.column) || seen.has(inst.column)) {
      continue
    }

    seen.add(inst.column)
    out.push(inst)
  }

  return out
}

// M7's quotient run, unchanged (SparseBlumeCapel, greedy-bfs, forward)
function readQuotient(inst: LabInstance, crystalField: number): QuotientReading {
  const graph = cellGraph(inst.neighbors)
  const rule = new SparseBlumeCapel({
    graph,
    schedule: independentSetSchedule({ graph, method: 'greedy-bfs', colorOrder: 'forward' }),
    model: { coupling: 1, crystalField },
  })
  const region = [0, ...inst.neighbors[0]!]
  const base = blumeCapelSystem(rule, region)
  const failures = { n: 0 }
  const system: RegionSystem = {
    region,
    background: 0,
    runCue(cue) {
      const r = base.runCue(cue)

      if (rule.energy(r.start) !== rule.energy(r.final)) {
        failures.n++
      }

      return r
    },
  }

  const census = regionCensus(system, regionCues(region.length, 0))

  let transient = 0
  let notReturned = 0

  for (const c of census.completions) {
    if (rule.returnTime(c.start, RETURN_CAP) > 0) {
      transient++
    } else {
      notReturned++
    }
  }

  return {
    name: inst.name,
    column: inst.column,
    curvature: inst.curvature,
    cells: inst.size,
    systole: inst.systole,
    loopSystole: inst.loopSystole,
    crystalField,
    completions: census.completions.length,
    recall: census.completions.filter(c => c.kind === 'erase' || c.kind === 'flip').length,
    transient,
    notReturned,
    energyFailures: failures.n,
  }
}

// ---- the whole run ----

type CurvatureField = 'stored' | 'completions' | 'merges' | 'forgotten' | 'nearRight'

const CURVATURE_FIELDS: readonly CurvatureField[] = ['stored', 'completions', 'merges', 'forgotten', 'nearRight']

type CurvatureReading = { pair: string; crystalField: number; fields: Record<CurvatureField, string> | null; reason: string | null }

type Result = {
  gates: ColoringGate[]
  readings: Reading[]
  dKept: DKeptControl[]
  frozen: { box: string; completions: number; merges: number }[]
  quotients: QuotientReading[]
  sink: { box: string; crystalField: number; rescues: number; losses: number }[]
  curvature: CurvatureReading[]
  serialized: string
}

export function blumeCapelOpenRun(input: { only?: readonly LabGeometryName[]; withQuotients: boolean }): Result {
  const gates: ColoringGate[] = []
  const readings: Reading[] = []
  const dKept: DKeptControl[] = []
  const frozen: Result['frozen'] = []

  for (const col of columns().filter(c => !input.only || input.only.includes(c.column))) {
    for (const kind of COLORINGS) {
      gates.push(coloringGate(col, kind))

      const space = cosetSpace({ name: col.column, p: col.p, q: col.q })
      const coloring = new CanonicalVertexColoring({ graph: canonicalGraph(space), kind })

      for (const boxKind of ['open', 'walled'] as const) {
        for (const delta of CRYSTAL_FIELDS) {
          readings.push(readBox({ col, kind, crystalField: delta, boxKind, coloring, space }))
        }

        dKept.push(dKeptControl(col, coloring, space, boxKind))
      }

      if (kind === 'greedy') {
        const region = [0, ...[...space.neighbors(0)].sort((a, b) => space.compare(a, b))]
        const c = regionCensus(frozenSystem(region), regionCues(region.length, 0))

        frozen.push({ box: `frozen:${col.column}`, completions: c.completions.length, merges: c.merges })
      }
    }
  }

  const quotients: QuotientReading[] = []

  if (input.withQuotients) {
    for (const inst of quotientPicks()) {
      for (const delta of CRYSTAL_FIELDS) {
        quotients.push(readQuotient(inst, delta))
      }
    }
  }

  // sink: open against walled, same tiling, coloring and Delta, per cue (only where the open census ran)
  const sink: Result['sink'] = []

  for (const o of readings.filter(r => r.boxKind === 'open' && r.summary)) {
    const w = readings.find(r => r.boxKind === 'walled' && r.box === o.box.replace('open:', 'walled:') && r.crystalField === o.crystalField)

    if (!w) {
      continue
    }

    const ws = new Set(w.completionKeys)
    const os = new Set(o.completionKeys)

    sink.push({ box: o.box, crystalField: o.crystalField, rescues: o.completionKeys.filter(k => !ws.has(k)).length, losses: w.completionKeys.filter(k => !os.has(k)).length })
  }

  const curvature: CurvatureReading[] = []
  const fieldOf = (s: Summary, f: CurvatureField): number =>
    f === 'stored' ? s.stored : f === 'completions' ? s.completions : f === 'merges' ? s.merges : f === 'forgotten' ? s.forgotten : s.nearRight

  for (const m of MATCHED) {
    const pair = `${m.flat[0]}/${m.hyperbolic[0]}`

    for (const delta of CRYSTAL_FIELDS) {
      const get = (column: LabGeometryName, kind: CanonicalColoringKind): Reading | undefined =>
        readings.find(r => r.boxKind === 'open' && r.box === `open:${column}~${kind}` && r.crystalField === delta)
      const four = [get(m.flat[0], 'greedy'), get(m.hyperbolic[0], 'greedy'), get(m.flat[0], 'greedy-shifted'), get(m.hyperbolic[0], 'greedy-shifted')]

      if (four.some(r => !r)) {
        continue
      }

      const missing = four.filter(r => !r!.summary || r!.stopped > 0)

      if (missing.length > 0) {
        curvature.push({ pair, crystalField: delta, fields: null, reason: missing.map(r => `${r!.box} ${r!.refused ?? `${r!.stopped} cues stopped`}`).join('; ') })
        continue
      }

      const [f0, h0, f1, h1] = four.map(r => r!.summary!) as [Summary, Summary, Summary, Summary]
      const fields = {} as Record<CurvatureField, string>

      for (const f of CURVATURE_FIELDS) {
        const s0 = Math.sign(fieldOf(f0, f) - fieldOf(h0, f))
        const s1 = Math.sign(fieldOf(f1, f) - fieldOf(h1, f))

        fields[f] = s0 === 0 && s1 === 0 ? 'same' : s0 === s1 ? `curvature:${s0 > 0 ? '+' : '-'}` : 'schedule'
      }

      curvature.push({ pair, crystalField: delta, fields, reason: null })
    }
  }

  const serialized = JSON.stringify({
    gates,
    readings: readings.map(r => r.serialized),
    dKept,
    quotients,
  })

  return { gates, readings, dKept, frozen, quotients, sink, curvature, serialized }
}

function curvatureCredits(curvature: readonly CurvatureReading[]): string[] {
  const out: string[] = []

  for (const f of CURVATURE_FIELDS) {
    const plus = new Set(curvature.filter(c => c.fields?.[f] === 'curvature:+').map(c => c.pair))
    const minus = new Set(curvature.filter(c => c.fields?.[f] === 'curvature:-').map(c => c.pair))

    if (plus.size >= 2 && minus.size === 0) {
      out.push(`${f}: flat larger`)
    }

    if (minus.size >= 2 && plus.size === 0) {
      out.push(`${f}: hyperbolic larger`)
    }
  }

  return out
}

export default experiment({
  id: 'computation/blume-capel-open-window',
  code: 'E-CMP-0067',
  title:
    'M7 follow-up: does the reversible Blume-Capel rule, which keeps energy but not the excitation count, restore erased or flipped tones on a readout region in the open window, under a proper vertex coloring of the infinite tiling, open against walled, flat against degree-matched hyperbolic under one coloring family, beside the closed quotients and their systoles',
  category: 'computation',
  substrates: ['{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = blumeCapelOpenRun({ withQuotients: true })
    const twice = (): string => blumeCapelOpenRun({ only: ['{3,7}'], withQuotients: false }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const sum = <T>(xs: readonly T[], f: (x: T) => number): number => xs.reduce((s, x) => s + f(x), 0)
    const ran = r.readings.filter(x => x.summary)
    const open = ran.filter(x => x.boxKind === 'open')
    const walled = ran.filter(x => x.boxKind === 'walled')
    const refused = r.readings.filter(x => x.refused)
    const kind = (xs: readonly Reading[], k: string): number => sum(xs, x => x.summary!.byKind[k] ?? 0)
    const openRecall = kind(open, 'erase') + kind(open, 'flip')
    const walledRecall = kind(walled, 'erase') + kind(walled, 'flip')
    const recallLedgers = ran.flatMap(x => x.recall)
    const dKeptImpossible = recallLedgers.filter(l => !l.dKeptPossible).length

    // gates
    const coloringBad = r.gates.filter(g => g.conflicts > 0 || g.used > g.colors || g.orderMismatches > 0)
    const energyFailures = sum(ran, x => x.energyFailures) + sum(r.quotients, x => x.energyFailures)
    const coneBad = ran.filter(x => x.boxKind === 'open' && x.coneExcess > 0)
    const frozenBad = r.frozen.filter(f => f.completions > 0 || f.merges > 0)
    const dKeptBad = r.dKept.filter(d => d.eraseFlip > 0)
    const q63 = r.quotients.filter(q => q.column === '{6,3}')
    const reproduced = q63.length === 2 && q63.find(q => q.crystalField === 1)?.recall === 22 && q63.find(q => q.crystalField === 2)?.recall === 50
    const stoppedRan = sum(ran, x => x.stopped)
    const denseBad = ran.filter(x => x.denseMismatches > 0)
    const ok = denseBad.length === 0 && coloringBad.length === 0 && energyFailures === 0 && coneBad.length === 0 && frozenBad.length === 0 && dKeptBad.length === 0 && reproduced && identicalBytes && findings.length === 0

    const failures = [
      ...denseBad.map(x => `dense walled run differs from sparse ${x.box} D${x.crystalField}`),
      ...coloringBad.map(g => `coloring ${g.space} ${g.kind}`),
      ...(energyFailures === 0 ? [] : [`energy ${energyFailures}`]),
      ...coneBad.map(x => `light cone ${x.box} D${x.crystalField}`),
      ...frozenBad.map(f => `frozen ${f.box}`),
      ...dKeptBad.map(d => `D-kept control ${d.box}`),
      ...(reproduced ? [] : [`quotient reproduction ${q63.map(q => `D${q.crystalField} ${q.recall}`).join(', ')}`]),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]

    const rescues = sum(r.sink, x => x.rescues)
    const losses = sum(r.sink, x => x.losses)
    const credits = curvatureCredits(r.curvature)
    const openPersistent = sum(open, x => x.persistent)
    const openFaded = sum(open, x => x.faded)
    const walledTransient = sum(walled, x => x.transient)
    const walledNotReturned = sum(walled, x => x.notReturned)
    const perBox = (xs: readonly Reading[]): string =>
      xs.map(x => `${x.box} D${x.crystalField}: ${x.summary ? `stored ${x.summary.stored}, completions ${x.summary.completions} (erase ${x.summary.byKind.erase}, flip ${x.summary.byKind.flip}, add ${x.summary.byKind.add}, mixed ${x.summary.byKind.mixed}), forgotten ${x.summary.forgotten}, merges ${x.summary.merges}, stopped ${x.stopped}, max support ${x.maxSupport}` : `refused (${x.refused})`}`).join('; ')
    const recallWord = openRecall > 0 ? (openPersistent > 0 ? 'recall in the open window' : 'transient recall in the open window') : 'no recall in the open window'
    const curvatureText = r.curvature.map(c => `${c.pair} D${c.crystalField}: ${c.fields ? Object.entries(c.fields).map(([k, v]) => `${k} ${v}`).join(', ') : `not compared (${c.reason})`}`).join('; ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `reversible Blume-Capel (J = 1, Delta 1 and 2) under a proper vertex coloring of the infinite tiling (greedy in canonical order and its shifted twin): ${recallWord}; open erase or flip completions ${openRecall} over ${open.length} open censuses (${openPersistent} of ${openPersistent + openFaded} open completions persist to round ${PERSIST_UNTIL}), walled ${walledRecall} (${walledTransient} return within ${RETURN_CAP}, ${walledNotReturned} not seen to); ${refused.length} open censuses refused because a lone excitation's front passes ${SUPPORT_CAP} cells before round 48 (Delta = 1 on every hyperbolic tiling and wherever noted); the sink adds ${rescues} completions the wall lacks and removes ${losses}; ${dKeptImpossible} of ${recallLedgers.length} erase or flip completions need an outside that no D-keeping rule can leave, and the D-keeping control (Delta = degree + 1) completes ${sum(r.dKept, d => d.eraseFlip)} erase or flip cues; quotient reproduction ${q63.map(q => `{6,3} D${q.crystalField} ${q.recall}`).join(', ')}; curvature credited: ${credits.length === 0 ? 'none' : credits.join(', ')}`,
      metrics: {
        openCensuses: open.length,
        walledCensuses: walled.length,
        refusedCensuses: refused.length,
        openRecallCompletions: openRecall,
        openCompletions: sum(open, x => x.summary!.completions),
        openPersistent,
        openFaded,
        walledRecallCompletions: walledRecall,
        walledCompletions: sum(walled, x => x.summary!.completions),
        walledTransient,
        walledNotReturned,
        stoppedCues: stoppedRan,
        sinkRescues: rescues,
        sinkLosses: losses,
        recallLedgers: recallLedgers.length,
        recallNeedingDChange: dKeptImpossible,
        dKeptEraseFlip: sum(r.dKept, d => d.eraseFlip),
        dKeptCompletions: sum(r.dKept, d => d.completions),
        quotientCompletions: sum(r.quotients, q => q.completions),
        quotientRecall: sum(r.quotients, q => q.recall),
        denseMismatches: sum(ran, x => x.denseMismatches),
        coloringConflicts: sum(r.gates, g => g.conflicts),
        coloringOrderMismatches: sum(r.gates, g => g.orderMismatches),
        energyFailures,
        curvatureCredits: credits.length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        frozenFailures: frozenBad.length,
        dKeptFailures: dKeptBad.length,
        quotientReproduced: reproduced ? 1 : 0,
      },
      notes:
        `Colorings: ${r.gates.map(g => `${g.space} ${g.kind} ${g.used}/${g.colors} colors on ${g.cells} cells, order check ${g.orderCells} cells`).join('; ')}. Open: ${perBox(r.readings.filter(x => x.boxKind === 'open'))}. Walled: ${perBox(walled)}. Recall ledgers: ${recallLedgers.slice(0, 24).map(l => `${l.cue}>${l.target} ${l.kind} Qout ${l.qOut} Dout ${l.dOut} D ${l.dStart}->${l.dFinal}`).join('; ')}. D-kept control: ${r.dKept.map(d => `${d.box} D${d.crystalField} ${d.completions}/${d.eraseFlip}${d.refused ? ' refused' : ''}`).join('; ')}. Quotients: ${r.quotients.map(q => `${q.name} (${q.cells} cells, injectivity ${q.systole}, loop systole ${q.loopSystole}) D${q.crystalField} completions ${q.completions}, erase or flip ${q.recall}, returned ${q.transient}`).join('; ')}. Curvature: ${curvatureText}. ${ok ? '' : `Failures: ${failures.slice(0, 16).join('; ')}`}`.trim(),
    })
  },
})
