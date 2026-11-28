// M7 association without per-cell weights (item vibe-computation-models-0018). Algebra: spin-one. Does a fixed rule
// (the 12 M1 pair-rule classes, the M2-B reversible Blume-Capel rule) plus the open window's outward sink complete
// partial patterns on a readout region, as a Hopfield network with per-cell weights does? Library
// code/compute/lab/association.ts, which states the definitions and the conservation bound.
//
// Declared before the first run (note/project/vibe/computation/models/m7-association.md):
// - REGION R: the radius-1 ball of the origin in the box's canonical order (the line: radius 2, 5 cells). Readout
//   FIELD-REALIZED (the tones of R at a round end). The nearest stored word is an EXTERNAL readout, also read at round 0.
// - CUES: every word on R when |R| <= 7, else every word with at most 2 off-background cells; forward rule only, 48
//   rounds, late trace rounds 24..48.
// - BOXES: open lazy windows and the same tiling and schedule behind a wall at radius 7 (vacuum-fixing classes, every
//   background each fixes), on the line and the matched pairs {4,4}/{4,5}, {3,6}/{3,7}, {6,3}/{6,4} under the lifted
//   colouring, variants 0 and 1; closed quotients (first per column of the matched pairs and the 4D pair) for all 12
//   classes; M2-B (J = 1, Delta 1 and 2, greedy-bfs) on the same quotients.
// - HOPFIELD positive control on the same region graphs (sparse induced edges, dense all pairs) through the same census
//   with one pattern, and its capacity; sparse Hopfield on each whole quotient graph.
// - GATES: 24 rules in 12 classes; Q kept in every pair-rule run, D in every run of a D-keeping rule; energy kept in every
//   Blume-Capel run; every pair-rule completion meets the conservation bound and runs back to its cue under the inverse
//   rule (verification only); every closed-box completion checked for exact return within 512 rounds; two runs give
//   identical bytes; no file draws a random number. NEGATIVE: the identity has no merge and no completion; zero-weight
//   Hopfield completes nothing; no pure erase or pure flip completion for a D-keeping rule on the vacuum. POSITIVE: the
//   Hopfield region systems complete cues through the same census.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  Hopfield,
  RETURN_CAP,
  RegionCensus,
  RegionSystem,
  SparseBlumeCapel,
  allPairs,
  bitPlanePatterns,
  cachedSpace,
  blumeCapelSystem,
  chargeAbout,
  graphHopfield,
  hebbian,
  hopfieldCapacity,
  hopfieldSystem,
  inverseReturns,
  keyWord,
  outsideFeasible,
  pairReturn,
  pairRuleSystem,
  regionCensus,
  regionCues,
  spreadPatterns,
  tonesCharge,
} from '@/code/compute/lab/association'
import { closedInstances, harnessRule, LabInstance } from '@/code/compute/lab/harness'
import { cosetSpace, LazySpace } from '@/code/compute/lab/lazy-space'
import { MemoryRule, Run, walledSpace } from '@/code/compute/lab/memory'
import { PairSpace, lineSpace } from '@/code/measure/particle-census'
import { conservesExcitation, fixesVacuum, inverseTable, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { breadthFirstOrder, cellGraph, independentSetSchedule } from '@/code/rule/spin-one-q2r'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/association.ts', 'test/experiment/computation/association-without-weights.ts']

// ---- parameters, fixed before the first run ----

const WALL_RADIUS = 7
const IDENTITY = 'id.ABC.id'
const CRYSTAL_FIELDS = [1, 2]
const QUOTIENT_COLUMNS: readonly LabGeometryName[] = ['{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{3,4,3,3}', '{3,4,3,4}']

const MATCHED: readonly { flat: [LabGeometryName, number, number]; hyperbolic: [LabGeometryName, number, number] }[] = [
  { flat: ['{4,4}', 4, 4], hyperbolic: ['{4,5}', 4, 5] },
  { flat: ['{3,6}', 3, 6], hyperbolic: ['{3,7}', 3, 7] },
  { flat: ['{6,3}', 6, 3], hyperbolic: ['{6,4}', 6, 4] },
]

// ---- boxes ----

type BoxKind = 'open' | 'walled' | 'quotient'

type Box = {
  key: string
  kind: BoxKind
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  family: string
  // matched-pair key without the box kind, or null
  pair: string | null
  space: PairSpace
  colors: number[]
  region: number[]
  // the induced edges of the region, as index pairs
  regionEdges: [number, number][]
  instance: LabInstance | null
}

function regionEdgesOf(region: readonly number[], neighbors: (cell: number) => readonly number[]): [number, number][] {
  const index = new Map(region.map((c, i) => [c, i]))
  const out: [number, number][] = []

  region.forEach((c, i) => {
    for (const w of neighbors(c)) {
      const j = index.get(w)

      if (j !== undefined && j > i) {
        out.push([i, j])
      }
    }
  })

  return out
}

function lineBox(kind: 'open' | 'walled'): Box {
  const l = lineSpace()
  const region = [-2, -1, 0, 1, 2].map(x => l.at(x))
  const space = kind === 'walled' ? walledSpace(l, WALL_RADIUS) : l

  return {
    key: `${kind}:line`,
    kind,
    column: 'line',
    curvature: 'flat',
    family: 'brick',
    pair: null,
    space,
    colors: [0, 1],
    region,
    regionEdges: regionEdgesOf(region, c => l.neighbors(c)),
    instance: null,
  }
}

function lazyBox(input: { kind: 'open' | 'walled'; column: LabGeometryName; p: number; q: number; variant: number; curvature: 'flat' | 'hyperbolic'; pair: string }): Box {
  const lazy: LazySpace = cosetSpace({ name: `${input.column}/coset-${input.variant}`, p: input.p, q: input.q, variant: input.variant })
  const region = [0, ...[...lazy.neighbors(0)].sort((a, b) => lazy.compare(a, b))]

  return {
    key: `${input.kind}:${input.column}~lifted-${input.variant}`,
    kind: input.kind,
    column: input.column,
    curvature: input.curvature,
    family: `lifted-${input.variant}`,
    pair: `${input.pair}~lifted-${input.variant}`,
    space: cachedSpace(input.kind === 'walled' ? walledSpace(lazy, WALL_RADIUS) : lazy),
    colors: Array.from({ length: lazy.colorCount }, (_, k) => k),
    region,
    regionEdges: regionEdgesOf(region, c => lazy.neighbors(c)),
    instance: null,
  }
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

  const region = [0, ...inst.neighbors[0]!]
  const pairOf = MATCHED.find(m => m.flat[0] === inst.column || m.hyperbolic[0] === inst.column)
  const pair4 = inst.column === '{3,4,3,3}' || inst.column === '{3,4,3,4}'

  return {
    key: `quotient:${inst.name}`,
    kind: 'quotient',
    column: inst.column,
    curvature: inst.curvature,
    family: 'greedy',
    pair: pairOf ? `${pairOf.flat[0]}/${pairOf.hyperbolic[0]}~greedy` : pair4 ? '{3,4,3,3}/{3,4,3,4}~greedy' : null,
    space,
    colors: Array.from({ length: space.colorCount }, (_, k) => k),
    region,
    regionEdges: regionEdgesOf(region, c => inst.neighbors[c]!),
    instance: inst,
  }
}

type BoxDef = { key: string; kind: BoxKind; make: () => Box }

function boxDefs(only?: readonly string[], quotients?: readonly LabInstance[]): BoxDef[] {
  const out: BoxDef[] = []

  for (const kind of ['open', 'walled'] as const) {
    out.push({ key: `${kind}:line`, kind, make: () => lineBox(kind) })

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
            make: () => lazyBox({ kind, column, p, q, variant, curvature, pair: `${m.flat[0]}/${m.hyperbolic[0]}` }),
          })
        }
      }
    }
  }

  for (const inst of quotients ?? []) {
    out.push({ key: `quotient:${inst.name}`, kind: 'quotient', make: () => quotientBox(inst) })
  }

  return only ? out.filter(d => only.includes(d.key)) : out
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

// ---- classes ----

type ClassDef = { name: string; rule: MemoryRule; vacuumFixing: boolean; backgrounds: number[] }

function classDefs(): { classes: ClassDef[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })

  return {
    ruleCount: census.rules.length,
    classCount: classes.length,
    classes: classes.map(c => {
      const { name, table } = c.representative

      return {
        name,
        rule: {
          forward: harnessRule({ name, table }),
          inverse: harnessRule({ name: `${name}^-1`, table: inverseTable(table) }),
          keepsExcitation: conservesExcitation(table),
        },
        vacuumFixing: fixesVacuum(table),
        backgrounds: fixesVacuum(table) ? [-1, 0, 1] : [-1, 1],
      }
    }),
  }
}

// ---- readings ----

type Summary = {
  cues: number
  stored: number
  completions: number
  byKind: Record<string, number>
  completing: number
  completingEvery: Record<string, number>
  forgotten: number
  merges: number
  periodicMerges: number
  nearAll: number
  nearRight: number
  nearByKind: Record<string, [number, number]>
  nearWrong: number
  externalEnd: number
  externalStart: number
}

// a mixed completion split by its parts: erase with add only (a tone the cue held elsewhere moved into place), or one
// that holds a flip
function mixedParts(cue: string, target: string, background: number): 'mixedEraseAdd' | 'mixedFlip' {
  const c = keyWord(cue)
  const p = keyWord(target)

  for (let i = 0; i < c.length; i++) {
    if (c[i] !== p[i] && c[i] !== background && p[i] !== background) {
      return 'mixedFlip'
    }
  }

  return 'mixedEraseAdd'
}

function summarize(c: RegionCensus, background: number): Summary {
  const byKind: Record<string, number> = { erase: 0, flip: 0, add: 0, mixed: 0, mixedEraseAdd: 0, mixedFlip: 0 }

  for (const x of c.completions) {
    byKind[x.kind] = (byKind[x.kind] ?? 0) + 1

    if (x.kind === 'mixed') {
      const part = mixedParts(x.cue, x.target, background)

      byKind[part] = (byKind[part] ?? 0) + 1
    }
  }

  return {
    cues: c.cues,
    stored: c.stored.length,
    completions: c.completions.length,
    byKind,
    completing: c.completing,
    completingEvery: { ...c.completingEvery },
    forgotten: c.forgotten,
    merges: c.merges,
    periodicMerges: c.periodicMerges,
    nearAll: c.near.all,
    nearRight: c.near.right,
    nearByKind: {
      erase: [c.near.byKind.erase.right, c.near.byKind.erase.all],
      flip: [c.near.byKind.flip.right, c.near.byKind.flip.all],
      add: [c.near.byKind.add.right, c.near.byKind.add.all],
    },
    nearWrong: c.near.wrong,
    externalEnd: c.near.externalEnd,
    externalStart: c.near.externalStart,
  }
}

type PairReading = {
  box: string
  boxKind: BoxKind
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  family: string
  pair: string | null
  className: string
  background: number
  keepsD: boolean
  summary: Summary
  completionKeys: string[]
  conservationFailures: number
  boundFailures: number
  inverseFailures: number
  // closed boxes: completions whose whole state returns exactly within RETURN_CAP, and those that do not
  transient: number
  notReturned: number
  pureEraseFlipVacuum: number
  serialized: string
}

function conservingSystem(system: RegionSystem, background: number, keepsD: boolean, failures: { n: number }): RegionSystem {
  return {
    region: system.region,
    background,
    runCue(cue) {
      const r = system.runCue(cue)
      const a = tonesCharge(r.start, background)
      const b = tonesCharge(r.final, background)

      if (a.q !== b.q || (keepsD && a.d !== b.d)) {
        failures.n++
      }

      return r
    },
  }
}

function readPairRule(box: Box, cls: ClassDef, background: number): PairReading {
  const run: Run = { space: box.space, colors: box.colors, rule: cls.rule, background }
  const keepsD = cls.rule.keepsExcitation
  const failures = { n: 0 }
  const system = conservingSystem(pairRuleSystem(run, box.region), background, keepsD, failures)
  const census = regionCensus(system, regionCues(box.region.length, background))

  let boundFailures = 0
  let inverseFailures = 0
  let transient = 0
  let notReturned = 0
  let pureEraseFlipVacuum = 0

  for (const c of census.completions) {
    const cw = chargeAbout(keyWord(c.cue), background)
    const pw = chargeAbout(keyWord(c.target), background)

    if (!outsideFeasible({ background, qOut: cw.q - pw.q, dOut: cw.d - pw.d, keepsD })) {
      boundFailures++
    }

    if (!inverseReturns(run, c.final, c.start)) {
      inverseFailures++
    }

    if (keepsD && background === 0 && (c.kind === 'erase' || c.kind === 'flip')) {
      pureEraseFlipVacuum++
    }

    if (box.kind !== 'open') {
      if (pairReturn(run, c.start, RETURN_CAP) > 0) {
        transient++
      } else {
        notReturned++
      }
    }
  }

  return {
    box: box.key,
    boxKind: box.kind,
    column: box.column,
    curvature: box.curvature,
    family: box.family,
    pair: box.pair,
    className: cls.name,
    background,
    keepsD,
    summary: summarize(census, background),
    completionKeys: census.completions.map(c => `${c.cue}>${c.target}`),
    conservationFailures: failures.n,
    boundFailures,
    inverseFailures,
    transient,
    notReturned,
    pureEraseFlipVacuum,
    serialized: census.serialized,
  }
}

type BlumeReading = {
  box: string
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  pair: string | null
  crystalField: number
  summary: Summary
  energyFailures: number
  transient: number
  notReturned: number
  serialized: string
}

function readBlumeCapel(box: Box, crystalField: number): BlumeReading {
  const inst = box.instance!
  const graph = cellGraph(inst.neighbors)
  const rule = new SparseBlumeCapel({
    graph,
    schedule: independentSetSchedule({ graph, method: 'greedy-bfs', colorOrder: 'forward' }),
    model: { coupling: 1, crystalField },
  })

  const base = blumeCapelSystem(rule, box.region)
  const failures = { n: 0 }
  const system: RegionSystem = {
    region: base.region,
    background: 0,
    runCue(cue) {
      const r = base.runCue(cue)

      if (rule.energy(r.start) !== rule.energy(r.final)) {
        failures.n++
      }

      return r
    },
  }

  const census = regionCensus(system, regionCues(box.region.length, 0))

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
    box: box.key,
    column: box.column,
    curvature: box.curvature,
    pair: box.pair,
    crystalField,
    summary: summarize(census, 0),
    energyFailures: failures.n,
    transient,
    notReturned,
    serialized: census.serialized,
  }
}

type HopfieldReading = {
  box: string
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  regionSize: number
  regionEdges: number
  // one pattern through the census: sparse (induced edges), dense (all pairs), zero weights (negative control)
  sparse: Summary
  dense: Summary
  zero: Summary
  sparseCapacity: number
  denseCapacity: number
  capacityRows: { sparse: unknown; dense: unknown }
}

function regionPatterns(n: number): Int8Array[] {
  if (n <= 7) {
    return spreadPatterns(n)
  }

  // bit planes of the region index (declared for |R| > 7)
  return bitPlanePatterns(n)
}

function readHopfield(box: Box): HopfieldReading {
  const n = box.region.length
  const patterns = regionPatterns(n)
  const one = patterns.slice(0, 1)
  const cues = regionCues(n, 0)
  const sparseNet = hebbian(n, one, box.regionEdges)
  const denseNet = hebbian(n, one, allPairs(n))
  const zeroNet: Hopfield = { n, weights: new Int32Array(n * n) }
  const sparseCap = hopfieldCapacity({ n, patterns, pairs: box.regionEdges })
  const denseCap = hopfieldCapacity({ n, patterns, pairs: allPairs(n) })

  return {
    box: box.key,
    column: box.column,
    curvature: box.curvature,
    regionSize: n,
    regionEdges: box.regionEdges.length,
    sparse: summarize(regionCensus(hopfieldSystem(sparseNet, box.region), cues), 0),
    dense: summarize(regionCensus(hopfieldSystem(denseNet, box.region), cues), 0),
    zero: summarize(regionCensus(hopfieldSystem(zeroNet, box.region), cues), 0),
    sparseCapacity: sparseCap.capacity,
    denseCapacity: denseCap.capacity,
    capacityRows: { sparse: sparseCap.rows, dense: denseCap.rows },
  }
}

type GraphHopfieldReading = {
  box: string
  column: LabGeometryName
  curvature: 'flat' | 'hyperbolic'
  pair: string | null
  cells: number
  systole: number | null
  loopSystole: number | null
  capacity: number
  rows: { k: number; fixed: number; eraseRight: number; flipRight: number; cues: number }[]
}

function readGraphHopfield(box: Box): GraphHopfieldReading {
  const inst = box.instance!
  const order = Array.from(breadthFirstOrder(cellGraph(inst.neighbors)))
  const g = graphHopfield({ neighbors: inst.neighbors, order })

  return {
    box: box.key,
    column: box.column,
    curvature: box.curvature,
    pair: box.pair,
    cells: inst.size,
    systole: inst.systole,
    loopSystole: inst.loopSystole,
    capacity: g.capacity,
    rows: g.rows,
  }
}

// ---- the whole run ----

type CurvatureField = 'stored' | 'completions' | 'merges' | 'forgotten' | 'nearRight'

const CURVATURE_FIELDS: readonly CurvatureField[] = ['stored', 'completions', 'merges', 'forgotten', 'nearRight']

type CurvatureReading = {
  pair: string
  className: string
  background: number
  // per field: 'curvature:+' (flat larger under both variants), 'curvature:-', 'schedule', 'same'
  fields: Record<CurvatureField, string>
}

type Result = {
  ruleCount: number
  classCount: number
  pairReadings: PairReading[]
  blume: BlumeReading[]
  hopfield: HopfieldReading[]
  graphHopfield: GraphHopfieldReading[]
  sink: { box: string; className: string; background: number; rescues: number; losses: number }[]
  curvature: CurvatureReading[]
  quotientNotes: string[]
  serialized: string
}

export function associationRun(input:{ only?: readonly string[]; withQuotients: boolean }): Result {
  const { classes, ruleCount, classCount } = classDefs()
  const quotients = input.withQuotients ? quotientPicks() : []
  const defs = boxDefs(input.only, quotients)
  const pairReadings: PairReading[] = []
  const blume: BlumeReading[] = []
  const hopfield: HopfieldReading[] = []
  const graphHopfield: GraphHopfieldReading[] = []
  const quotientNotes: string[] = []

  for (const def of defs) {
    const box = def.make()

    for (const cls of classes) {
      if (box.kind !== 'quotient' && !cls.vacuumFixing) {
        continue
      }

      for (const bg of cls.backgrounds) {
        pairReadings.push(readPairRule(box, cls, bg))
      }
    }

    if (box.kind !== 'walled' && (box.kind === 'quotient' || box.family !== 'lifted-1')) {
      hopfield.push(readHopfield(box))
    }

    if (box.kind === 'quotient') {
      for (const delta of CRYSTAL_FIELDS) {
        blume.push(readBlumeCapel(box, delta))
      }

      graphHopfield.push(readGraphHopfield(box))

      const inst = box.instance!

      quotientNotes.push(`${inst.name} (${inst.size} cells, degree ${inst.degree}, injectivity radius ${inst.systole}${inst.systoleLowerBound ? ' lower bound' : ''}, loop systole ${inst.loopSystole})`)
    }
  }

  // sink: open against walled, same tiling, colouring, class and background, per cue
  const sink: Result['sink'] = []

  for (const o of pairReadings.filter(r => r.boxKind === 'open')) {
    const w = pairReadings.find(r => r.boxKind === 'walled' && r.box === o.box.replace('open:', 'walled:') && r.className === o.className && r.background === o.background)

    if (!w) {
      continue
    }

    const ws = new Set(w.completionKeys)
    const os = new Set(o.completionKeys)

    sink.push({
      box: o.box,
      className: o.className,
      background: o.background,
      rescues: o.completionKeys.filter(k => !ws.has(k)).length,
      losses: w.completionKeys.filter(k => !os.has(k)).length,
    })
  }

  // curvature: open windows, per matched pair, class and background, under both variants
  const curvature: CurvatureReading[] = []
  const fieldOf = (r: PairReading, f: CurvatureField): number =>
    f === 'stored' ? r.summary.stored : f === 'completions' ? r.summary.completions : f === 'merges' ? r.summary.merges : f === 'forgotten' ? r.summary.forgotten : r.summary.nearRight

  for (const m of MATCHED) {
    const pair = `${m.flat[0]}/${m.hyperbolic[0]}`

    for (const cls of classes.filter(c => c.vacuumFixing)) {
      for (const bg of cls.backgrounds) {
        const get = (column: LabGeometryName, v: number): PairReading | undefined =>
          pairReadings.find(r => r.boxKind === 'open' && r.box === `open:${column}~lifted-${v}` && r.className === cls.name && r.background === bg)
        const f0 = get(m.flat[0], 0)
        const h0 = get(m.hyperbolic[0], 0)
        const f1 = get(m.flat[0], 1)
        const h1 = get(m.hyperbolic[0], 1)

        if (!f0 || !h0 || !f1 || !h1) {
          continue
        }

        const fields = {} as Record<CurvatureField, string>

        for (const f of CURVATURE_FIELDS) {
          const s0 = Math.sign(fieldOf(f0, f) - fieldOf(h0, f))
          const s1 = Math.sign(fieldOf(f1, f) - fieldOf(h1, f))

          fields[f] = s0 === 0 && s1 === 0 ? 'same' : s0 === s1 ? `curvature:${s0 > 0 ? '+' : '-'}` : 'schedule'
        }

        curvature.push({ pair, className: cls.name, background: bg, fields })
      }
    }
  }

  const serialized = JSON.stringify({
    pair: pairReadings.map(r => [r.box, r.className, r.background, r.serialized]),
    blume: blume.map(r => [r.box, r.crystalField, r.serialized]),
    hopfield: hopfield.map(r => [r.box, r.sparse, r.dense, r.sparseCapacity, r.denseCapacity]),
    graph: graphHopfield.map(r => [r.box, r.capacity, r.rows]),
  })

  return { ruleCount, classCount, pairReadings, blume, hopfield, graphHopfield, sink, curvature, quotientNotes, serialized }
}

// a curvature direction is credited only when a field is curvature-sensitive with one sign in at least two of the
// three pairs and the opposite sign in none (any class and background)
function curvatureCredits(curvature: readonly CurvatureReading[]): string[] {
  const out: string[] = []

  for (const f of CURVATURE_FIELDS) {
    const plus = new Set(curvature.filter(c => c.fields[f] === 'curvature:+').map(c => c.pair))
    const minus = new Set(curvature.filter(c => c.fields[f] === 'curvature:-').map(c => c.pair))

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
  id: 'computation/association-without-weights',
  code: 'E-CMP-0055',
  title:
    'M7 association without per-cell weights: does a fixed pair rule or the reversible Blume-Capel rule, with the open window\'s outward sink, complete partial patterns on a readout region, against Hopfield with per-cell weights on the same region graphs and quotients, open against walled, flat against degree-matched hyperbolic under one colouring family, systoles beside the closed results',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = associationRun({ withQuotients: true })
    const twice = (): string => associationRun({ only: ['open:line', 'open:{4,4}~lifted-0', 'walled:{4,4}~lifted-0'], withQuotients: false }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const sum = (rs: readonly PairReading[], f: (x: PairReading) => number): number => rs.reduce((s, x) => s + f(x), 0)
    const prs = r.pairReadings
    const nonId = prs.filter(x => x.className !== IDENTITY)
    const byKind = (rs: readonly PairReading[], k: string): number => sum(rs, x => x.summary.byKind[k] ?? 0)
    const openNon = nonId.filter(x => x.boxKind === 'open')
    const walledNon = nonId.filter(x => x.boxKind === 'walled')
    const quotNon = nonId.filter(x => x.boxKind === 'quotient')
    const recallOpen = byKind(openNon, 'erase') + byKind(openNon, 'flip')
    const cleanOpen = byKind(openNon, 'add')
    const mixedOpen = byKind(openNon, 'mixed')

    // gates
    const conservationFailures = sum(prs, x => x.conservationFailures)
    const boundFailures = sum(prs, x => x.boundFailures)
    const inverseFailures = sum(prs, x => x.inverseFailures)
    const energyFailures = r.blume.reduce((s, x) => s + x.energyFailures, 0)
    const pureVacuum = sum(prs, x => x.pureEraseFlipVacuum)
    const identity = prs.filter(x => x.className === IDENTITY)
    const identityBad = identity.filter(x => x.summary.merges > 0 || x.summary.completions > 0)
    const zeroBad = r.hopfield.filter(h => h.zero.completions > 0 || h.zero.merges > 0)
    const hopfieldBlind = r.hopfield.filter(h => h.dense.completions === 0)
    const ok =
      r.ruleCount === 24 &&
      r.classCount === 12 &&
      conservationFailures === 0 &&
      boundFailures === 0 &&
      inverseFailures === 0 &&
      energyFailures === 0 &&
      pureVacuum === 0 &&
      identity.length > 0 &&
      identityBad.length === 0 &&
      zeroBad.length === 0 &&
      hopfieldBlind.length === 0 &&
      identicalBytes &&
      findings.length === 0

    const failures = [
      ...(r.ruleCount === 24 && r.classCount === 12 ? [] : ['rule census']),
      ...(conservationFailures === 0 ? [] : [`conservation ${conservationFailures}`]),
      ...(boundFailures === 0 ? [] : [`bound ${boundFailures}`]),
      ...(inverseFailures === 0 ? [] : [`inverse ${inverseFailures}`]),
      ...(energyFailures === 0 ? [] : [`energy ${energyFailures}`]),
      ...(pureVacuum === 0 ? [] : [`pure erase or flip on the vacuum ${pureVacuum}`]),
      ...identityBad.map(x => `identity ${x.box} b${x.background}`),
      ...zeroBad.map(h => `zero-weight Hopfield ${h.box}`),
      ...hopfieldBlind.map(h => `dense Hopfield completes nothing on ${h.box}`),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]

    const rescues = r.sink.filter(s => s.className !== IDENTITY).reduce((s, x) => s + x.rescues, 0)
    const losses = r.sink.filter(s => s.className !== IDENTITY).reduce((s, x) => s + x.losses, 0)
    const credits = curvatureCredits(r.curvature)
    const curvatureFields = r.curvature.flatMap(c => Object.entries(c.fields).filter(([, v]) => v.startsWith('curvature')).map(([k, v]) => `${c.pair} ${c.className} b${c.background} ${k} ${v}`))
    const scheduleFields = r.curvature.flatMap(c => Object.values(c.fields).filter(v => v === 'schedule')).length
    const blumeCompletions = r.blume.reduce((s, x) => s + x.summary.completions, 0)
    const blumeTransient = r.blume.reduce((s, x) => s + x.transient, 0)
    const blumeRecall = r.blume.reduce((s, x) => s + (x.summary.byKind.erase ?? 0) + (x.summary.byKind.flip ?? 0), 0)
    const closedTransient = sum(nonId.filter(x => x.boxKind !== 'open'), x => x.transient)
    const closedNotReturned = sum(nonId.filter(x => x.boxKind !== 'open'), x => x.notReturned)
    const nearAll = (rs: readonly PairReading[]): number => sum(rs, x => x.summary.nearAll)
    const nearRight = (rs: readonly PairReading[]): number => sum(rs, x => x.summary.nearRight)
    const hopDense = r.hopfield.reduce((s, h) => s + h.dense.nearRight, 0)
    const hopDenseAll = r.hopfield.reduce((s, h) => s + h.dense.nearAll, 0)
    const hopSparse = r.hopfield.reduce((s, h) => s + h.sparse.nearRight, 0)
    const hopSparseAll = r.hopfield.reduce((s, h) => s + h.sparse.nearAll, 0)
    const verdictWord = recallOpen > 0 ? 'recall' : mixedOpen > 0 ? 'no recall, cleaning and relocation only' : cleanOpen > 0 ? 'no recall, cleaning only' : 'no association'
    const fraction = (a: number, b: number): string => `${a}/${b}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `open windows (${openNon.length} non-identity vacuum-fixing class x background x box readings): ${verdictWord}; completions from erase or flip cues ${recallOpen}, from add cues ${cleanOpen}, mixed ${mixedOpen} (${byKind(openNon, 'mixedEraseAdd')} erase with add, a tone the cue held moving into place; ${byKind(openNon, 'mixedFlip')} with a flip); field-realized distance-1 recall ${fraction(nearRight(openNon), nearAll(openNon))} open, ${fraction(nearRight(walledNon), nearAll(walledNon))} walled, ${fraction(nearRight(quotNon), nearAll(quotNon))} on quotients, against Hopfield on the same region graphs ${fraction(hopDense, hopDenseAll)} dense and ${fraction(hopSparse, hopSparseAll)} sparse with one pattern; the sink adds ${rescues} completions the wall lacks and removes ${losses}; closed-box completions ${closedTransient} transient (whole state returns within ${RETURN_CAP}) and ${closedNotReturned} not seen to return; Blume-Capel on the quotients ${blumeCompletions} completions (${blumeRecall} erase or flip, ${blumeTransient} transient); conservation bound met by every completion; curvature credited: ${credits.length === 0 ? 'none' : credits.join(', ')}`,
      metrics: {
        readings: prs.length,
        openReadings: openNon.length,
        openCompletions: sum(openNon, x => x.summary.completions),
        openRecallCompletions: recallOpen,
        openCleaningCompletions: cleanOpen,
        openMixedCompletions: mixedOpen,
        openMixedEraseAdd: byKind(openNon, 'mixedEraseAdd'),
        openMixedFlip: byKind(openNon, 'mixedFlip'),
        walledCompletions: sum(walledNon, x => x.summary.completions),
        quotientCompletions: sum(quotNon, x => x.summary.completions),
        quotientRecallCompletions: byKind(quotNon, 'erase') + byKind(quotNon, 'flip'),
        openMerges: sum(openNon, x => x.summary.merges),
        openForgotten: sum(openNon, x => x.summary.forgotten),
        openNearAll: nearAll(openNon),
        openNearRight: nearRight(openNon),
        openExternalEnd: sum(openNon, x => x.summary.externalEnd),
        openExternalStart: sum(openNon, x => x.summary.externalStart),
        walledNearRight: nearRight(walledNon),
        quotientNearRight: nearRight(quotNon),
        sinkRescues: rescues,
        sinkLosses: losses,
        closedTransient,
        closedNotReturned,
        blumeCompletions,
        blumeRecall,
        blumeTransient,
        hopfieldDenseNearRight: hopDense,
        hopfieldDenseNearAll: hopDenseAll,
        hopfieldSparseNearRight: hopSparse,
        hopfieldSparseNearAll: hopSparseAll,
        curvatureFields: curvatureFields.length,
        scheduleFields,
        curvatureCredits: credits.length,
        conservationFailures,
        boundFailures,
        inverseFailures,
        energyFailures,
        pureEraseFlipVacuum: pureVacuum,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityReadings: identity.length,
        identityFailures: identityBad.length,
        zeroWeightFailures: zeroBad.length,
        hopfieldBlind: hopfieldBlind.length,
      },
      notes:
        `M7 (item vibe-computation-models-0018). Readout field-realized (tones of R); the nearest stored word is external. Hopfield capacity per region (sparse/dense): ${r.hopfield.map(h => `${h.box} |R|=${h.regionSize} ${h.sparseCapacity}/${h.denseCapacity}`).join('; ')}. Whole-quotient sparse Hopfield capacity: ${r.graphHopfield.map(g => `${g.box} ${g.capacity}`).join('; ')}. Curvature fields under both colourings: ${curvatureFields.slice(0, 40).join('; ') || 'none'}. Quotients: ${r.quotientNotes.join(', ')}. ${ok ? '' : `Failures: ${failures.slice(0, 16).join('; ')}`}`.trim(),
    })
  },
})
