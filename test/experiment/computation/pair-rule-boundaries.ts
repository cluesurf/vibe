// M9 self-maintaining boundaries (item vibe-computation-models-0020). Algebra: spin-one. For each of the 12 pair-rule
// classes, every in-place structure made by a start of at most two cells near the origin is perturbed by an enumerated
// family (one cell changed at round 0: every cell of its region B, the hits, and every cell one facet from B, the
// contacts) and left to the forward rule. A structure keeps its boundary when every hit is repaired (B wrong, then right
// for the whole last window) and every contact is kept. The entropy a repair exports through the boundary of B is counted
// exactly: the configurations outside B at the horizon over the ensemble of repaired hits.
//
// Declared before the first run (m9-boundaries.md, re-plan):
// - RULES: the 12 class representatives, forward round only; vacuum-fixing rules on -1, 0, +1, creating rules on -1, +1.
// - BOXES: open, the infinite line (brick schedule) and {4,4}/{4,5}, {3,6}/{3,7}, {6,3}/{6,4} on the exact coset lazy
//   windows under the lifted coloring, variants 0 and 1 (one family on both sides of each pair). Sink control: the same
//   tiling and schedule behind a reflecting wall at WALL_RADIUS, for the line and variant 0.
// - STRUCTURES, PERTURBATIONS, PREDICATE, EXPORT: code/compute/lab/boundary.ts.
// - CURVATURE: per pair, variant, class and background, the fields structures, keeping, hit repair share, contact kept
//   share; differs when integers differ or shares by >= SHARE_GAP; curvature-sensitive under both variants in the same
//   direction, schedule-sensitive under one; credited to curvature only when one direction holds across all three pairs.
// Gates (each can fail): 24 rules in 12 classes; Q in every run, D in every run of a D-keeping rule; the final states of
// one structure's perturbations and its unperturbed run pairwise distinct; every repaired hit exports exactly its change of
// Q (and D); the distinct exterior count equals the ensemble (the export is log2 N bits); every repaired reading replays
// byte for byte on a freshly built space through addresses; boundary.ts holds no reverse-time round; identical bytes over
// two runs; no random number. Negative controls: the identity repairs no hit and keeps every contact immune; a predicate
// one phase ahead misreads the unperturbed run of every structure with period above 1.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  BoundaryRun,
  ExportReading,
  HORIZON,
  PerturbationReading,
  Structure,
  WalledReading,
  entropyBits,
  exportReading,
  findStructures,
  perturbationFamily,
  phaseAheadMisreads,
  readPerturbation,
  readWalled,
  structureOf,
} from '@/code/compute/lab/boundary'
import { harnessRule } from '@/code/compute/lab/harness'
import { cosetSpace } from '@/code/compute/lab/lazy-space'
import { walledSpace } from '@/code/compute/lab/memory'
import { PairSpace, Tones, lineSpace, sameTones } from '@/code/measure/particle-census'
import { conservesExcitation, fixesVacuum, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LIBRARY = 'code/compute/lab/boundary.ts'
const LAB_FILES = [LIBRARY, 'test/experiment/computation/pair-rule-boundaries.ts']

// ---- parameters, fixed before the first run ----

const WALL_RADIUS = 6
const SHARE_GAP = 1 / 10
const IDENTITY = 'id.ABC.id'

const MATCHED: readonly { flat: [string, number, number]; hyperbolic: [string, number, number] }[] = [
  { flat: ['{4,4}', 4, 4], hyperbolic: ['{4,5}', 4, 5] },
  { flat: ['{3,6}', 3, 6], hyperbolic: ['{3,7}', 3, 7] },
  { flat: ['{6,3}', 6, 3], hyperbolic: ['{6,4}', 6, 4] },
]

// ---- boxes ----

type Space = PairSpace & { address(cell: number): string; fromAddress(address: string): number }

type BoxDef = {
  key: string
  column: string
  curvature: 'flat' | 'hyperbolic'
  variant: number | null
  pair: string | null
  walled: boolean
  make: () => { space: Space; colors: number[] }
}

function lineBox(): { space: Space; colors: number[] } {
  const l = lineSpace()

  return {
    space: { ...l, address: c => `${l.position(c)}`, fromAddress: a => l.at(Number(a)) },
    colors: [0, 1],
  }
}

function boxDefs(only?: readonly string[]): BoxDef[] {
  const out: BoxDef[] = [
    { key: 'line', column: 'line', curvature: 'flat', variant: null, pair: null, walled: true, make: lineBox },
  ]

  for (const variant of [0, 1]) {
    for (const m of MATCHED) {
      for (const [side, curvature] of [
        [m.flat, 'flat'],
        [m.hyperbolic, 'hyperbolic'],
      ] as const) {
        const [column, p, q] = side

        out.push({
          key: `${column}~lifted-${variant}`,
          column,
          curvature,
          variant,
          pair: `${m.flat[0]}/${m.hyperbolic[0]}`,
          walled: variant === 0,
          make: () => {
            const space = cosetSpace({ name: `${column}/coset-${variant}`, p, q, variant })

            return { space, colors: Array.from({ length: space.colorCount }, (_, k) => k) }
          },
        })
      }
    }
  }

  return only ? out.filter(d => only.includes(d.key)) : out
}

// ---- classes ----

type ClassDef = { name: string; forward: ReturnType<typeof harnessRule>; keepsExcitation: boolean; backgrounds: number[] }

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
        forward: harnessRule({ name, table }),
        keepsExcitation: conservesExcitation(table),
        backgrounds: fixesVacuum(table) ? [-1, 0, 1] : [-1, 1],
      }
    }),
  }
}

// ---- one box, class and background ----

type StructureResult = {
  start: string
  period: number
  regionSize: number
  hits: number
  contacts: number
  repairedHits: number
  immuneHits: number
  brokenHits: number
  budgetHits: number
  keptContacts: number
  keeps: boolean
  exported: ExportReading | null
  walled: WalledReading[]
  walledOrbitSame: boolean | null
  distinctFinals: boolean
  chargeFailures: number
  excitationFailures: number
  exportMismatches: number
  replayFailures: number
  phaseAheadMissed: boolean
  // each repaired hit: the cell's address, its tone at round 0 and the new tone (a structure cell when was is off
  // background), and the round B was last wrong
  repairs: { cell: string; was: number; tone: number; lastWrong: number }[]
  // hits on a cell the structure holds off background at round 0
  structureCellHits: number
}

type Cell = {
  box: string
  column: string
  curvature: 'flat' | 'hyperbolic'
  variant: number | null
  pair: string | null
  className: string
  background: number
  seeds: number
  structures: StructureResult[]
}

const key = (space: Space, state: Tones): string =>
  [...state]
    .map(([c, t]) => `${space.address(c)}=${t}`)
    .sort()
    .join(';')

function readStructure(input: {
  def: BoxDef
  space: Space
  run: BoundaryRun
  structure: Structure
}): StructureResult {
  const { def, space, run, structure } = input
  const family = perturbationFamily(run, structure)
  const readings: PerturbationReading[] = family.map(p => readPerturbation(run, structure, p))
  const hits = readings.filter(r => r.perturbation.kind === 'hit')
  const contacts = readings.filter(r => r.perturbation.kind === 'contact')
  const repaired = hits.filter(r => r.outcome === 'repaired')
  const keptContacts = contacts.filter(r => r.outcome === 'immune' || r.outcome === 'repaired').length
  const exported = repaired.length > 0 ? exportReading({ run, structure, repaired }) : null

  // injectivity: every final (with the unperturbed run's) distinct, read only where no run stopped on the budget
  const finals = readings.filter(r => r.outcome !== 'budget').map(r => key(space, r.final))
  const nullFinal = key(space, structure.orbit[HORIZON % structure.period]!)
  const distinctFinals = new Set([...finals, nullFinal]).size === finals.length + 1

  const exportMismatches =
    exported === null
      ? 0
      : exported.charges.filter(
          c => c.exportedQ !== c.deltaQ || (run.keepsExcitation && c.exportedD !== c.deltaD),
        ).length + (exported.multiplicities.length === exported.ensemble ? 0 : 1)

  // replay every repaired reading on a fresh space through addresses
  let replayFailures = 0

  if (repaired.length > 0) {
    const fresh = def.make()
    const freshRun: BoundaryRun = { ...run, space: fresh.space, colors: fresh.colors }
    const freshStart: Tones = new Map(
      [...structure.start].map(([c, t]) => [fresh.space.fromAddress(space.address(c)), t]),
    )
    const freshStructure = structureOf(freshRun, freshStart)

    for (const r of repaired) {
      const p = r.perturbation
      const again = freshStructure
        ? readPerturbation(freshRun, freshStructure, { ...p, cell: fresh.space.fromAddress(space.address(p.cell)) })
        : null

      if (again?.outcome !== r.outcome || key(fresh.space, again.final) !== key(space, r.final)) {
        replayFailures++
      }
    }
  }

  // the sink control: each repaired hit behind the wall
  let walled: WalledReading[] = []
  let walledOrbitSame: boolean | null = null

  if (def.walled && repaired.length > 0) {
    const walledRun: BoundaryRun = { ...run, space: walledSpace(space, WALL_RADIUS) }
    const behind = structureOf(walledRun, structure.start)

    walledOrbitSame =
      behind !== null && behind.period === structure.period && behind.orbit.every((s, i) => sameTones(s, structure.orbit[i]!))

    if (walledOrbitSame) {
      walled = repaired.map(r => readWalled(walledRun, structure, r.perturbation))
    }
  }

  return {
    start: key(space, structure.start),
    period: structure.period,
    regionSize: structure.region.length,
    hits: hits.length,
    contacts: contacts.length,
    repairedHits: repaired.length,
    immuneHits: hits.filter(r => r.outcome === 'immune').length,
    brokenHits: hits.filter(r => r.outcome === 'broken').length,
    budgetHits: hits.filter(r => r.outcome === 'budget').length,
    keptContacts,
    keeps: repaired.length === hits.length && keptContacts === contacts.length,
    exported,
    walled,
    walledOrbitSame,
    distinctFinals,
    chargeFailures: readings.filter(r => !r.chargeKept).length,
    excitationFailures: run.keepsExcitation ? readings.filter(r => !r.excitationKept).length : 0,
    exportMismatches,
    replayFailures,
    phaseAheadMissed: structure.period > 1 && !phaseAheadMisreads(run, structure),
    repairs: repaired.map(r => ({
      cell: space.address(r.perturbation.cell),
      was: r.perturbation.was,
      tone: r.perturbation.tone,
      lastWrong: r.lastWrong,
    })),
    structureCellHits: hits.filter(r => r.perturbation.was !== run.background).length,
  }
}

function readCell(def: BoxDef, cls: ClassDef, background: number): Cell {
  const { space, colors } = def.make()
  const run: BoundaryRun = { space, colors, rule: cls.forward, background, keepsExcitation: cls.keepsExcitation }
  const { seeds, structures } = findStructures(run)

  return {
    box: def.key,
    column: def.column,
    curvature: def.curvature,
    variant: def.variant,
    pair: def.pair,
    className: cls.name,
    background,
    seeds,
    structures: structures.map(structure => readStructure({ def, space, run, structure })),
  }
}

// ---- curvature ----

type Fields = { structures: number; keeping: number; hitShare: number | null; contactShare: number | null }

const fieldsOf = (c: Cell): Fields => {
  const sum = (f: (s: StructureResult) => number): number => c.structures.reduce((t, s) => t + f(s), 0)
  const hits = sum(s => s.hits)
  const contacts = sum(s => s.contacts)

  return {
    structures: c.structures.length,
    keeping: c.structures.filter(s => s.keeps).length,
    hitShare: hits === 0 ? null : sum(s => s.repairedHits) / hits,
    contactShare: contacts === 0 ? null : sum(s => s.keptContacts) / contacts,
  }
}

type FieldName = keyof Fields

// +1 hyperbolic larger, -1 flat larger, 0 same
const direction = (name: FieldName, flat: Fields, hyperbolic: Fields): number => {
  const a = flat[name]
  const b = hyperbolic[name]

  if (a === null || b === null) {
    return a === b ? 0 : Number.NaN
  }

  if (name === 'hitShare' || name === 'contactShare') {
    return Math.abs(b - a) >= SHARE_GAP ? Math.sign(b - a) : 0
  }

  return Math.sign(b - a)
}

type CurvatureReading = { pair: string; className: string; background: number; field: FieldName; reading: 'curvature' | 'schedule' | 'same'; sign: number }

function curvatureReadings(cells: readonly Cell[]): CurvatureReading[] {
  const out: CurvatureReading[] = []
  const find = (column: string, variant: number, className: string, background: number): Cell | undefined =>
    cells.find(c => c.column === column && c.variant === variant && c.className === className && c.background === background)

  for (const m of MATCHED) {
    const pair = `${m.flat[0]}/${m.hyperbolic[0]}`

    for (const c of cells.filter(x => x.column === m.flat[0] && x.variant === 0)) {
      const dirs: Record<FieldName, number[]> = { structures: [], keeping: [], hitShare: [], contactShare: [] }

      for (const variant of [0, 1]) {
        const f = find(m.flat[0], variant, c.className, c.background)
        const h = find(m.hyperbolic[0], variant, c.className, c.background)

        if (!f || !h) {
          continue
        }

        for (const name of Object.keys(dirs) as FieldName[]) {
          dirs[name].push(direction(name, fieldsOf(f), fieldsOf(h)))
        }
      }

      for (const name of Object.keys(dirs) as FieldName[]) {
        const [d0, d1] = dirs[name]

        if (d0 === undefined || d1 === undefined) {
          continue
        }

        const both = d0 !== 0 && d0 === d1 && !Number.isNaN(d0)
        const one = !both && (d0 !== 0 || d1 !== 0)

        out.push({ pair, className: c.className, background: c.background, field: name, reading: both ? 'curvature' : one ? 'schedule' : 'same', sign: both ? d0 : 0 })
      }
    }
  }

  return out
}

// a field is credited to curvature only when its curvature-sensitive readings point one way in all three pairs
function creditedFields(readings: readonly CurvatureReading[]): FieldName[] {
  const names: FieldName[] = ['structures', 'keeping', 'hitShare', 'contactShare']

  return names.filter(name => {
    const signs = MATCHED.map(m => {
      const pair = `${m.flat[0]}/${m.hyperbolic[0]}`

      return new Set(readings.filter(r => r.pair === pair && r.field === name && r.reading === 'curvature').map(r => r.sign))
    })
    const all = new Set(signs.flatMap(s => [...s]))

    return all.size === 1 && signs.every(s => s.size === 1)
  })
}

// ---- the lab ----

type BoundaryLab = {
  ruleCount: number
  classCount: number
  cells: Cell[]
  curvature: CurvatureReading[]
  credited: FieldName[]
  serialized: string
}

export function pairRuleBoundaries(input: { only?: readonly string[] }): BoundaryLab {
  const { classes, ruleCount, classCount } = classDefs()
  const cells: Cell[] = []

  for (const def of boxDefs(input.only)) {
    for (const cls of classes) {
      for (const background of cls.backgrounds) {
        cells.push(readCell(def, cls, background))
      }
    }
  }

  const curvature = curvatureReadings(cells)
  const serialized = JSON.stringify(
    cells.map(c => [
      c.box,
      c.className,
      c.background,
      c.structures.map(s => [s.start, s.period, s.regionSize, s.repairedHits, s.immuneHits, s.brokenHits, s.budgetHits, s.keptContacts, s.exported?.multiplicities ?? null]),
    ]),
  )

  return { ruleCount, classCount, cells, curvature, credited: creditedFields(curvature), serialized }
}

export default experiment({
  id: 'computation/pair-rule-boundaries',
  code: 'E-CMP-0053',
  title:
    'M9 self-maintaining boundaries: every in-place structure of the 12 pair-rule classes perturbed by an enumerated one-cell family, forward rule only, in the open window and behind a reflecting wall; which structures repair their region, and the entropy each repair exports through its boundary, counted exactly; flat against degree-matched hyperbolic under two colorings of one family',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = pairRuleBoundaries({})
    const twice = (): string => pairRuleBoundaries({ only: ['line', '{4,4}~lifted-0'] }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const libraryReverse = /inverse|reverse|backward/i.test(readFileSync(resolve(BASE, LIBRARY), 'utf8'))
    const all = r.cells.flatMap(c => c.structures.map(s => ({ cell: c, s })))
    const sum = (f: (s: StructureResult) => number, xs = all): number => xs.reduce((t, x) => t + f(x.s), 0)
    const nonIdentity = all.filter(x => x.cell.className !== IDENTITY)
    const identity = all.filter(x => x.cell.className === IDENTITY)
    const identityBad = identity.filter(x => x.s.repairedHits > 0 || x.s.immuneHits > 0 || x.s.keptContacts !== x.s.contacts)
    const phaseTried = all.filter(x => x.s.period > 1)
    const phaseMissed = all.filter(x => x.s.phaseAheadMissed)
    const notDistinct = all.filter(x => !x.s.distinctFinals)
    const chargeFailures = sum(s => s.chargeFailures)
    const excitationFailures = sum(s => s.excitationFailures)
    const exportMismatches = sum(s => s.exportMismatches)
    const replayFailures = sum(s => s.replayFailures)
    const keeping = nonIdentity.filter(x => x.s.keeps)
    const repairing = nonIdentity.filter(x => x.s.repairedHits > 0)
    const hits = sum(s => s.hits, nonIdentity)
    const repairedHits = sum(s => s.repairedHits, nonIdentity)
    const brokenHits = sum(s => s.brokenHits, nonIdentity)
    const budgetHits = sum(s => s.budgetHits, nonIdentity)
    const immuneHits = sum(s => s.immuneHits, nonIdentity)
    const structureCellRepairs = nonIdentity.reduce(
      (t, x) => t + x.s.repairs.filter(p => p.was !== x.cell.background).length,
      0,
    )
    const structureCellHits = r.cells
      .filter(c => c.className !== IDENTITY)
      .reduce((t, c) => t + c.structures.reduce((u, s) => u + s.structureCellHits, 0), 0)
    const walled = all.flatMap(x => x.s.walled)
    const walledRebroken = walled.filter(w => w.rebroken).length
    const walledReturned = walled.filter(w => w.returned > 0).length
    const walledBudget = walled.filter(w => w.budget).length
    const walledOrbitChanged = all.filter(x => x.s.walledOrbitSame === false).length
    const exports = repairing.map(x => ({ x, e: x.s.exported! }))
    const best = [...exports].sort((a, b) => b.e.ensemble - a.e.ensemble)[0]
    const ok =
      r.ruleCount === 24 &&
      r.classCount === 12 &&
      identity.length > 0 &&
      identityBad.length === 0 &&
      phaseTried.length > 0 &&
      phaseMissed.length === 0 &&
      notDistinct.length === 0 &&
      chargeFailures === 0 &&
      excitationFailures === 0 &&
      exportMismatches === 0 &&
      replayFailures === 0 &&
      !libraryReverse &&
      identicalBytes &&
      findings.length === 0
    const failures = [
      ...(r.ruleCount === 24 && r.classCount === 12 ? [] : ['rule census']),
      ...identityBad.map(x => `identity ${x.cell.box} b${x.cell.background} ${x.s.start}`),
      ...(phaseTried.length > 0 ? [] : ['no period above 1']),
      ...phaseMissed.map(x => `phase ${x.cell.box} ${x.cell.className} ${x.s.start}`),
      ...notDistinct.map(x => `not distinct ${x.cell.box} ${x.cell.className} ${x.s.start}`),
      ...(chargeFailures === 0 ? [] : [`charge ${chargeFailures}`]),
      ...(excitationFailures === 0 ? [] : [`excitation ${excitationFailures}`]),
      ...(exportMismatches === 0 ? [] : [`export ${exportMismatches}`]),
      ...(replayFailures === 0 ? [] : [`replay ${replayFailures}`]),
      ...(libraryReverse ? ['library holds a reverse-time round'] : []),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]
    const curvatureSensitive = r.curvature.filter(c => c.reading === 'curvature')
    const scheduleSensitive = r.curvature.filter(c => c.reading === 'schedule').length
    const describe = (x: { cell: Cell; s: StructureResult }): string =>
      `${x.cell.box} ${x.cell.className} b${x.cell.background} [${x.s.start}] P${x.s.period} |B|=${x.s.regionSize}: hits ${x.s.repairedHits} repaired/${x.s.immuneHits} immune/${x.s.brokenHits} broken/${x.s.budgetHits} budget of ${x.s.hits}, contacts kept ${x.s.keptContacts}/${x.s.contacts}` +
      `, repairs ${x.s.repairs.map(p => `@${p.cell || 'origin'} ${p.was}->${p.tone} last wrong ${p.lastWrong}`).join('/')}` +
      (x.s.exported
        ? `, export N=${x.s.exported.ensemble} ${entropyBits(x.s.exported.multiplicities).toFixed(3)} bits, debris ${x.s.exported.charges.map(c => c.debris).join('/')}`
        : '') +
      (x.s.walled.length > 0 ? `, walled rebroken ${x.s.walled.filter(w => w.rebroken).length}/${x.s.walled.length} (at ${x.s.walled.map(w => w.rebrokenAt).join('/')}, returned ${x.s.walled.map(w => w.returned).join('/')})` : '')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${nonIdentity.length} in-place structures of the 11 non-identity pair-rule classes were perturbed by every one-cell change of their region and its rim (${hits} hits), forward rule only: ${keeping.length} keep their boundary against the whole family, ${repairing.length} repair at least one hit (${repairedHits} repaired, ${structureCellRepairs} of them on a cell the structure held, of ${structureCellHits} such hits; ${immuneHits} immune, ${brokenHits} broken, ${budgetHits} budget); every repair exports exactly log2 N bits through the boundary (the distinct exterior count equals the ensemble in every case) and exactly the perturbation's charge${best ? `, the largest ensemble N = ${best.e.ensemble}` : ''}; behind the wall ${walledRebroken} of ${walled.length} open repairs are rebroken (${walledReturned} whole states return, ${walledBudget} budget); ${r.credited.length === 0 ? 'nothing is credited to curvature' : `credited to curvature: ${r.credited.join(', ')}`} (${curvatureSensitive.length} fields differ under both colorings, ${scheduleSensitive} under one)`,
      metrics: {
        cells: r.cells.length,
        structures: all.length,
        nonIdentityStructures: nonIdentity.length,
        keeping: keeping.length,
        repairing: repairing.length,
        hits,
        repairedHits,
        immuneHits,
        structureCellHits,
        structureCellRepairs,
        brokenHits,
        budgetHits,
        walledReadings: walled.length,
        walledRebroken,
        walledReturned,
        walledBudget,
        walledOrbitChanged,
        largestEnsemble: best?.e.ensemble ?? 0,
        curvatureFields: curvatureSensitive.length,
        scheduleFields: scheduleSensitive,
        creditedFields: r.credited.length,
        chargeFailures,
        excitationFailures,
        exportMismatches,
        replayFailures,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityStructures: identity.length,
        identityFailures: identityBad.length,
        phaseTried: phaseTried.length,
        phaseMissed: phaseMissed.length,
      },
      notes: `M9 (item vibe-computation-models-0020). Repairing: ${repairing.slice(0, 30).map(describe).join(' || ') || 'none'}. Curvature-sensitive: ${curvatureSensitive.slice(0, 30).map(c => `${c.pair} ${c.className} b${c.background} ${c.field} ${c.sign > 0 ? 'hyperbolic' : 'flat'} larger`).join('; ') || 'none'}. ${ok ? '' : `Failures: ${failures.slice(0, 16).join('; ')}`}`.trim(),
    })
  },
})
