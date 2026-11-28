// M10, self-reproduction and adaptation from the M1 rules alone. Algebra: spin-one.
// Library: code/compute/lab/reproduction.ts. Control: E-CMP-0009 (code/dynamics/replication.ts, a copying constructor).
// Nothing is added to the mesh but a LAYOUT (a structure and an enumerated environment beside it). Criteria fixed before
// the first run.
//
// P1  no reproduction without food on any quiet cell (charge of one sign on +-1, species counts on the vacuum): the line
//     search over every start of width <= 5 finds 0 events.
// P2  no hereditary reproduction in a species cell (a point mutation's mark lands on exactly one cell, in the driving set
//     or in the whole state, at the predicted cell): live on the line and on three degree-matched coset pairs.
// S1  reactive cells with one food item (line), every event tested for heredity.
// S2  the 16 creating rules on their live vacuum (ring), every event tested for heredity.
// S3  species cells with one food item (line): hereditary events must be 0 (P2), raw events reported.
// S4  reactive cells on the three coset pairs: copy candidates by cluster shape (a sound absence when 0).
// A1  the response of a population's census to an environment (reported, never credited); A2 follows from heredity.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import { CellSplit, LineRun, LineStart, Schedule, lineStarts, splitCell } from '@/code/compute/lab/counter'
import { GateRule, gateRule } from '@/code/compute/lab/gates'
import { cosetSpace, roundColors } from '@/code/compute/lab/lazy-space'
import {
  EnvironmentCache,
  LineWindow,
  ReproductionEvent,
  censusResponse,
  censusSignature,
  distinctWindows,
  foodBeside,
  frameView,
  laidOut,
  layoutOf,
  lineBreedsTrue,
  lineCensus,
  lineCopies,
  lineReproduction,
  markCheck,
  markSpread,
  pointMutations,
  ringBack,
  ringRounds,
  ringSize,
  tilingReproduction,
  tilingRounds,
  vacuumBreedsTrue,
  vacuumOrbit,
  vacuumReproduction,
} from '@/code/compute/lab/reproduction'
import { replicate } from '@/code/dynamics/replication'
import { PairSpace, Tones, lineSpace } from '@/code/measure/particle-census'
import { inverseTable, pairRuleCensus, pairRuleClasses } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/reproduction.ts', 'test/experiment/computation/pair-rule-reproduction.ts']

// ---- parameters, fixed before the first run ----

const W_ALONE = 5
const W_FOOD = 3
const FOOD_WIDTH = 2
const GAP = 4
const ROUNDS = 48
const W_MARK = 4
const R_MARK = 16
const R_TILE = 6
const R_TILE_SEARCH = 10
const POPULATION_GAP = 6
const FOOD_REPEATS = 3
const CONTROL_GENERATIONS = 8
const IDENTITY = 'id.ABC.id'

const MATCHED: readonly { pair: string; flat: [string, number, number]; hyperbolic: [string, number, number] }[] = [
  { pair: '{4,4}/{4,5}', flat: ['{4,4}', 4, 4], hyperbolic: ['{4,5}', 4, 5] },
  { pair: '{3,6}/{3,7}', flat: ['{3,6}', 3, 6], hyperbolic: ['{3,7}', 3, 7] },
  { pair: '{6,3}/{6,4}', flat: ['{6,3}', 6, 3], hyperbolic: ['{6,4}', 6, 4] },
]

type Rule = { name: string; rule: GateRule; inverse: GateRule }
type Cell = { r: Rule; b: number; split: CellSplit }

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

const cellName = (c: Cell): string => `${c.r.name}/${c.b}`

// a sparse start (background cells left out) on a pair space, from line positions
function lineTones(s: LineStart, background: number): Tones {
  const line = lineSpace()

  return new Map(
    s.window.flatMap((t, i): [number, number][] => (t === background ? [] : [[line.at(s.start + i), t]])),
  )
}

// ---- searches on the line ----

type Hit = {
  cell: string
  kind: string
  structure: LineWindow
  environment: LineWindow[]
  event: ReproductionEvent
  mutations: number
  breedTrue: number
}

type LineSearch = { runs: number; events: number; chargeBreaks: number; maxCopies: number; hits: Hit[] }

function emptySearch(): LineSearch {
  return { runs: 0, events: 0, chargeBreaks: 0, maxCopies: 0, hits: [] }
}

function searchLine(input: {
  cell: Cell
  structures: readonly LineStart[]
  environments: (s: LineStart) => LineWindow[][]
  out: LineSearch
}): void {
  const { cell, structures, environments, out } = input
  const cache = new EnvironmentCache()

  for (const s of structures) {
    for (const environment of environments(s)) {
      const run = lineReproduction({
        rule: cell.r.rule,
        background: cell.b,
        structure: s,
        environment,
        rounds: ROUNDS,
        cache,
      })

      out.runs++
      out.chargeBreaks += run.chargeKept ? 0 : 1
      out.maxCopies = Math.max(out.maxCopies, run.maxCopies)

      if (run.event === null) {
        continue
      }

      out.events++

      const mutants = pointMutations(s.window, cell.b)
      const event = run.event
      const breedTrue = mutants.filter(m =>
        lineBreedsTrue({ rule: cell.r.rule, background: cell.b, structure: s, mutant: m, environment, event }),
      ).length

      out.hits.push({
        cell: cellName(cell),
        kind: cell.split.kind,
        structure: s,
        environment,
        event,
        mutations: mutants.length,
        breedTrue,
      })
    }
  }
}

function foodEnvironments(background: number): (s: LineStart) => LineWindow[][] {
  const foods = distinctWindows(background, FOOD_WIDTH)

  return s => {
    const out: LineWindow[][] = []

    for (const food of foods) {
      for (const side of ['left', 'right'] as const) {
        for (let gap = 1; gap <= GAP; gap++) {
          out.push([foodBeside(s, food, side, gap)])
        }
      }
    }

    return out
  }
}

// ---- the ring against the open line, fixed backgrounds ----

function ringAgrees(cell: Cell, s: LineStart): boolean {
  const n = ringSize(W_FOOD, ROUNDS)
  const off = n / 2 - ((n / 2) % 2)
  const start = new Int8Array(n).fill(cell.b)

  s.window.forEach((t, i) => {
    start[off + s.start + i] = t
  })

  const ring = ringRounds(cell.r.rule, start, ROUNDS)
  const frames = new LineRun(cell.r.rule, cell.b, layoutOf([s], cell.b), ROUNDS).frames

  for (let t = 0; t <= ROUNDS; t++) {
    const view = frameView(frames[t]!, cell.b)

    for (let x = 0; x < n; x++) {
      if (ring[t]![x] !== view.tone(x - off)) {
        return false
      }
    }
  }

  return true
}

// ---- tilings ----

type TilingSpace = { name: string; pair: string; curvature: 'flat' | 'hyperbolic'; schedule: Schedule }

function tilingSpaces(): TilingSpace[] {
  const out: TilingSpace[] = []

  for (const m of MATCHED) {
    for (const [side, curvature] of [
      [m.flat, 'flat'],
      [m.hyperbolic, 'hyperbolic'],
    ] as const) {
      const [name, p, q] = side
      const space = cosetSpace({ name: `${name}/coset-0`, p, q, variant: 0 })

      out.push({ name, pair: m.pair, curvature, schedule: { space, colors: roundColors(space, 'forward') } })
    }
  }

  return out
}

// supports of at most 2 cells containing the origin within 1 facet, every off-background tone
function tilingStructures(space: PairSpace, background: number): Tones[] {
  const off = [-1, 0, 1].filter(t => t !== background)
  const out: Tones[] = off.map(t => new Map([[0, t]]))

  for (const n of space.neighbors(0)) {
    for (const a of off) {
      for (const b of off) {
        out.push(
          new Map([
            [0, a],
            [n, b],
          ]),
        )
      }
    }
  }

  return out
}

function shell(space: PairSpace, radius: number): number[] {
  let frontier = [0]

  const seen = new Set([0])

  for (let r = 0; r < radius; r++) {
    const next: number[] = []

    for (const c of frontier) {
      for (const n of space.neighbors(c)) {
        if (!seen.has(n)) {
          seen.add(n)
          next.push(n)
        }
      }
    }

    frontier = next
  }

  return frontier.filter(c => space.distance(c) === radius)
}

type MarkTally = { reads: number; breaks: number; driving: number; state: number; cases: number }

function emptyTally(): MarkTally {
  return { reads: 0, breaks: 0, driving: 0, state: 0, cases: 0 }
}

function markCases(cell: Cell, schedule: Schedule, starts: readonly Tones[], cells: (start: Tones) => number[], rounds: number, tally: MarkTally): void {
  for (const start of starts) {
    for (const c of cells(start)) {
      for (const tone of [-1, 0, 1]) {
        if (tone === (start.get(c) ?? cell.b)) {
          continue
        }

        const m = markCheck({ rule: cell.r.rule, split: cell.split, schedule, start, cell: c, tone, rounds })

        tally.cases++
        tally.reads += rounds
        tally.breaks += m.breaks
        tally[m.layer]++
      }
    }
  }
}

// ---- the experiment ----

function reproductionM10(input: { wAlone: number; wFood: number; tilings: boolean; vacuumWidth: number }) {
  const { list, ruleCount, classCount } = rules()
  const cells: Cell[] = list.flatMap(r => [-1, 0, 1].map(b => ({ r, b, split: splitCell(r.rule, b) })))
  const species = cells.filter(c => c.split.kind === 'species')
  const reactive = cells.filter(c => c.split.kind === 'reactive')
  const live = cells.filter(c => c.split.kind === 'live_vacuum')
  const quiet = [...species, ...reactive]
  const typeCount = new Set(species.map(c => c.split.type)).size

  // P1: no food, every quiet cell
  const alone = { species: emptySearch(), reactive: emptySearch() }

  for (const cell of quiet) {
    searchLine({
      cell,
      structures: lineStarts(cell.b, input.wAlone),
      environments: () => [[]],
      out: cell.split.kind === 'species' ? alone.species : alone.reactive,
    })
  }

  // S1 and S3: one food item
  const food = { species: emptySearch(), reactive: emptySearch() }

  for (const cell of quiet) {
    searchLine({
      cell,
      structures: lineStarts(cell.b, input.wFood),
      environments: foodEnvironments(cell.b),
      out: cell.split.kind === 'species' ? food.species : food.reactive,
    })
  }

  // S2: the live vacuum
  const vacuum = { runs: 0, events: 0, chargeBreaks: 0, reverseFailures: 0, maxCopies: 0, periods: [] as string[], hits: [] as Hit[] }

  for (const cell of live) {
    const n = ringSize(input.vacuumWidth, ROUNDS)
    const orbit = vacuumOrbit(cell.r.rule, n, ROUNDS)
    const period = orbit.aligned.findIndex((a, t) => t > 0 && a)

    vacuum.periods.push(`${cellName(cell)}:${period}`)

    for (const window of distinctWindows(0, input.vacuumWidth)) {
      for (const parity of [0, 1]) {
        const run = vacuumReproduction({ rule: cell.r.rule, window, parity, rounds: ROUNDS, orbit })

        vacuum.runs++
        vacuum.chargeBreaks += run.chargeKept ? 0 : 1
        vacuum.maxCopies = Math.max(vacuum.maxCopies, run.maxCopies)

        // the ring is reversible: back from the last round to the start
        const start = new Int8Array(n)

        window.forEach((t, i) => {
          start[run.place + i] = t
        })

        const end = ringRounds(cell.r.rule, start, ROUNDS)[ROUNDS]!
        const back = ringBack(cell.r.inverse, end, ROUNDS)

        vacuum.reverseFailures += back.every((t, i) => t === start[i]) ? 0 : 1

        if (run.event === null) {
          continue
        }

        vacuum.events++

        const event = run.event
        const mutants = pointMutations(window, 0)
        const breedTrue = mutants.filter(m =>
          vacuumBreedsTrue({ rule: cell.r.rule, mutant: m, place: run.place, orbit, event }),
        ).length

        vacuum.hits.push({
          cell: cellName(cell),
          kind: 'live_vacuum',
          structure: { start: run.place, window },
          environment: [],
          event,
          mutations: mutants.length,
          breedTrue,
        })
      }
    }
  }

  // ring against the open line (fixed backgrounds)
  let ringRuns = 0
  let ringFailures = 0

  for (const cell of quiet) {
    for (const s of lineStarts(cell.b, input.wFood)) {
      ringRuns++
      ringFailures += ringAgrees(cell, s) ? 0 : 1
    }
  }

  // P2 on the line
  const line: Schedule = { space: lineSpace(), colors: [0, 1] }
  const lineMark = emptyTally()
  const ls = lineSpace()

  for (const cell of species) {
    const starts = lineStarts(cell.b, W_MARK)

    for (const s of starts) {
      const start = lineTones(s, cell.b)
      const around = Array.from({ length: s.window.length + 2 }, (_, i) => ls.at(s.start - 1 + i))

      markCases(cell, line, [start], () => around, R_MARK, lineMark)
    }
  }

  // P2 negative control: reactive marks spread
  let spreadCases = 0
  let spreadWide = 0

  for (const cell of reactive) {
    for (const s of lineStarts(cell.b, 3)) {
      const start = lineTones(s, cell.b)

      for (let i = 0; i < s.window.length; i++) {
        for (const tone of [-1, 0, 1]) {
          if (tone === s.window[i]) {
            continue
          }

          spreadCases++
          spreadWide +=
            markSpread({ rule: cell.r.rule, background: cell.b, schedule: line, start, cell: ls.at(s.start + i), tone, rounds: R_MARK }) >= 2
              ? 1
              : 0
        }
      }
    }
  }

  // P2 on the tilings and S4
  const tilingMark: Record<string, MarkTally> = {}
  const tilingSearch: Record<string, { runs: number; candidates: number; chargeBreaks: number; examples: string[] }> = {}

  if (input.tilings) {
    for (const t of tilingSpaces()) {
      const space = t.schedule.space
      const ball = [0, ...space.neighbors(0)]
      const tally = emptyTally()

      for (const cell of species) {
        markCases(cell, t.schedule, tilingStructures(space, cell.b), () => ball, R_TILE, tally)
      }

      tilingMark[t.name] = tally

      const search = { runs: 0, candidates: 0, chargeBreaks: 0, examples: [] as string[] }
      const ring2 = shell(space, 2)

      for (const cell of reactive) {
        const off = [-1, 0, 1].filter(x => x !== cell.b)
        const foods: (Tones | null)[] = [null, ...ring2.flatMap(c => off.map(x => new Map([[c, x]])))]

        for (const f of foods) {
          const environmentRounds =
            f === null
              ? null
              : tilingRounds({ rule: cell.r.rule, background: cell.b, space, colors: t.schedule.colors, start: f, rounds: R_TILE_SEARCH })

          for (const structure of tilingStructures(space, cell.b)) {
            const r = tilingReproduction({
              rule: cell.r.rule,
              background: cell.b,
              space,
              colors: t.schedule.colors,
              structure,
              environment: f,
              environmentRounds,
              rounds: R_TILE_SEARCH,
            })

            search.runs++
            search.chargeBreaks += r.chargeKept ? 0 : 1

            if (r.candidate !== null) {
              search.candidates++

              if (search.examples.length < 4) {
                search.examples.push(`${cellName(cell)} r${r.candidate.round} n${r.candidate.candidates}`)
              }
            }
          }
        }
      }

      tilingSearch[t.name] = search
    }
  }

  // A1: census response on the line
  const adaptation: { cell: string; kind: string; responsive: number; distinct: number }[] = []

  for (const cell of quiet) {
    const windows = distinctWindows(cell.b, 2)
    const population = laidOut(windows, 0, POPULATION_GAP)
    const last = population[population.length - 1]!
    const from = last.start + last.window.length + POPULATION_GAP
    const popRun = new LineRun(cell.r.rule, cell.b, layoutOf(population, cell.b), ROUNDS).frames[ROUNDS]!
    const popCensus = lineCensus(popRun, cell.b)
    const signatures = new Set<string>()

    let responsive = 0

    for (const f of windows) {
      const environment = laidOut(Array.from({ length: FOOD_REPEATS }, () => f), from, POPULATION_GAP)
      const envCensus = lineCensus(new LineRun(cell.r.rule, cell.b, layoutOf(environment, cell.b), ROUNDS).frames[ROUNDS]!, cell.b)
      const joint = lineCensus(
        new LineRun(cell.r.rule, cell.b, layoutOf([...population, ...environment], cell.b), ROUNDS).frames[ROUNDS]!,
        cell.b,
      )

      if (censusResponse(joint, popCensus, envCensus) > 0) {
        responsive++
        signatures.add(censusSignature(joint, popCensus, envCensus))
      }
    }

    adaptation.push({ cell: cellName(cell), kind: cell.split.kind, responsive, distinct: signatures.size })
  }

  const serialized = JSON.stringify({
    alone: [alone.species.events, alone.reactive.events, alone.species.runs, alone.reactive.runs],
    food: [food.species.events, food.reactive.events, food.species.hits.map(h => h.breedTrue), food.reactive.hits.map(h => h.breedTrue)],
    vacuum: [vacuum.events, vacuum.periods, vacuum.hits.map(h => [h.cell, h.event.round, h.breedTrue])],
    lineMark,
    tilingMark,
    tilingSearch,
    adaptation,
    spreadWide,
  })

  return {
    ruleCount,
    classCount,
    counts: { species: species.length, reactive: reactive.length, live: live.length },
    typeCount,
    alone,
    food,
    vacuum,
    ringRuns,
    ringFailures,
    lineMark,
    spreadCases,
    spreadWide,
    tilingMark,
    tilingSearch,
    adaptation,
    serialized,
  }
}

// the copy counter's planted controls
function copyControls(): { planted: boolean; oddRejected: boolean; debrisRejected: boolean } {
  const frame = (cells: [number, number][]): { lo: number; tones: Int8Array } => {
    const lo = Math.min(...cells.map(c => c[0]))
    const hi = Math.max(...cells.map(c => c[0]))
    const tones = new Int8Array(hi - lo + 1)

    for (const [x, t] of cells) {
      tones[x - lo] = t
    }

    return { lo, tones }
  }

  const pattern = [1, -1]
  const two = lineCopies(frameView(frame([[0, 1], [1, -1], [10, 1], [11, -1]]), 0), pattern, 0)
  const odd = lineCopies(frameView(frame([[0, 1], [1, -1], [9, 1], [10, -1]]), 0), pattern, 0)
  const debris = lineCopies(frameView(frame([[0, 1], [1, -1], [10, 1], [11, -1], [13, 1]]), 0), pattern, 0)

  return {
    planted: two.length === 2 && two[0] === 0 && two[1] === 10,
    oddRejected: odd.length === 1 && odd[0] === 0,
    debrisRejected: debris.length === 1 && debris[0] === 0,
  }
}

// E-CMP-0009's constructor carries a point mutation of its template into every copy
function constructorControl(): { copies: number; markedCopies: number } {
  const template = Int8Array.from({ length: 64 }, (_, i) => ((i * i + i) % 3) - 1).map(v => (v === 0 ? 1 : v))
  const mutant = Int8Array.from(template)

  mutant[5] = -mutant[5]!

  const r = replicate({ template: mutant, generations: CONTROL_GENERATIONS, faithful: true })

  return { copies: r.copies, markedCopies: r.allIdentical ? r.copies : 0 }
}

// every hit replays from a fresh run
function replays(hits: readonly Hit[], lookup: (name: string) => Rule): number {
  let bad = 0

  for (const h of hits) {
    const [name, bText] = [h.cell.slice(0, h.cell.lastIndexOf('/')), h.cell.slice(h.cell.lastIndexOf('/') + 1)]
    const r = lookup(name)
    const b = Number(bText)

    if (h.kind === 'live_vacuum') {
      const orbit = vacuumOrbit(r.rule, ringSize(W_ALONE, ROUNDS), ROUNDS)
      const run = vacuumReproduction({ rule: r.rule, window: h.structure.window, parity: h.structure.start % 2, rounds: ROUNDS, orbit })

      bad += JSON.stringify(run.event) === JSON.stringify(h.event) ? 0 : 1
    } else {
      const run = lineReproduction({
        rule: r.rule,
        background: b,
        structure: h.structure,
        environment: h.environment,
        rounds: ROUNDS,
        cache: new EnvironmentCache(),
      })

      bad += JSON.stringify(run.event) === JSON.stringify(h.event) ? 0 : 1
    }
  }

  return bad
}

export default experiment({
  id: 'computation/pair-rule-reproduction',
  code: 'E-CMP-0059',
  title:
    'M10 self-reproduction and adaptation from the M1 pair rules: no reproduction without food on any quiet background, a point mutation marks exactly one cell in every species cell so no mutant breeds true, and bounded searches of the reactive cells with food, the creating rules on their live vacuum and the three degree-matched coset pairs, against E-CMP-0009 as control',
  category: 'computation',
  substrates: ['line', '{4,4}', '{4,5}', '{3,6}', '{3,7}', '{6,3}', '{6,4}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = reproductionM10({ wAlone: W_ALONE, wFood: W_FOOD, tilings: true, vacuumWidth: W_ALONE })
    const twice = (): string => reproductionM10({ wAlone: 2, wFood: 1, tilings: false, vacuumWidth: 2 }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const { list } = rules()
    const lookup = (name: string): Rule => list.find(x => x.name === name)!
    const allHits = [...r.food.species.hits, ...r.food.reactive.hits, ...r.vacuum.hits, ...r.alone.species.hits, ...r.alone.reactive.hits]
    const replayFailures = replays(allHits, lookup)
    const copies = copyControls()
    const ctl = constructorControl()
    const hereditary = (hits: readonly Hit[]): number => hits.filter(h => h.breedTrue > 0).length
    const hereditarySpecies = hereditary(r.food.species.hits) + hereditary(r.alone.species.hits)
    const hereditaryReactive = hereditary(r.food.reactive.hits) + hereditary(r.alone.reactive.hits)
    const hereditaryLive = hereditary(r.vacuum.hits)
    const tilingMarkBreaks = Object.values(r.tilingMark).reduce((s, x) => s + x.breaks, 0)
    const tilingMarkReads = Object.values(r.tilingMark).reduce((s, x) => s + x.reads, 0)
    const tilingCandidates = Object.values(r.tilingSearch).reduce((s, x) => s + x.candidates, 0)
    const tilingRuns = Object.values(r.tilingSearch).reduce((s, x) => s + x.runs, 0)
    const tilingCharge = Object.values(r.tilingSearch).reduce((s, x) => s + x.chargeBreaks, 0)
    const identityA1 = r.adaptation.filter(a => a.cell.startsWith(`${IDENTITY}/`))
    const responsiveCells = r.adaptation.filter(a => a.responsive > 0 && !a.cell.startsWith(`${IDENTITY}/`))

    // curvature: per pair, candidates and mark breaks flat against hyperbolic
    const curvature = MATCHED.map(m => {
      const f = r.tilingSearch[m.flat[0]]
      const h = r.tilingSearch[m.hyperbolic[0]]

      return { pair: m.pair, flat: f?.candidates ?? 0, hyperbolic: h?.candidates ?? 0 }
    })
    const direction = curvature.map(c => Math.sign(c.hyperbolic - c.flat))
    const curvatureCredited = direction.every(d => d !== 0 && d === direction[0])
    const chargeBreaks =
      r.alone.species.chargeBreaks + r.alone.reactive.chargeBreaks + r.food.species.chargeBreaks + r.food.reactive.chargeBreaks + r.vacuum.chargeBreaks + tilingCharge
    const checks: [boolean, string][] = [
      [r.ruleCount === 24 && r.classCount === 12, 'rule census'],
      [r.counts.species === 24 && r.counts.reactive === 32 && r.counts.live === 16, `split ${JSON.stringify(r.counts)}`],
      [r.typeCount === 6, `species types ${r.typeCount}`],
      [r.alone.species.events + r.alone.reactive.events === 0, `P1: ${r.alone.species.events + r.alone.reactive.events} events without food`],
      [r.alone.species.runs + r.alone.reactive.runs > 0, 'P1 ran nothing'],
      [r.lineMark.breaks === 0 && r.lineMark.cases > 0, `P2 line: ${r.lineMark.breaks} breaks`],
      [tilingMarkBreaks === 0 && Object.keys(r.tilingMark).length === 6 && tilingMarkReads > 0, `P2 tilings: ${tilingMarkBreaks} breaks`],
      [hereditarySpecies === 0, `S3: ${hereditarySpecies} hereditary species events`],
      [r.spreadWide > 0, 'negative control: no reactive mark spread to two cells'],
      [ctl.markedCopies === 2 ** CONTROL_GENERATIONS, `E-CMP-0009 control: ${ctl.markedCopies} marked copies`],
      [copies.planted && copies.oddRejected && copies.debrisRejected, `copy counter ${JSON.stringify(copies)}`],
      [chargeBreaks === 0, `charge broken in ${chargeBreaks} runs`],
      [r.ringFailures === 0 && r.ringRuns > 0, `ring against the open line: ${r.ringFailures}`],
      [r.vacuum.reverseFailures === 0 && r.vacuum.runs > 0, `ring reversibility: ${r.vacuum.reverseFailures}`],
      [identityA1.length === 3 && identityA1.every(a => a.responsive === 0), 'A1 identity control responded'],
      [replayFailures === 0, `replay: ${replayFailures}`],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const construction = hereditaryReactive + hereditaryLive > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `self-reproduction from the M1 pair rules, spin-one, brick schedule on the line and lifted coset colorings on three degree-matched 2D pairs: without food no structure on any of the 56 quiet rule-background cells makes a copy (charge of one sign on +-1, species counts on the vacuum; ${r.alone.species.runs + r.alone.reactive.runs} line starts of width <= ${W_ALONE}, 0 events); in every one of the 24 species-conserving cells a point mutation marks exactly one cell at every round (the driving set when it changes it, else the whole state, at the cell the M6 lemma predicts: ${r.lineMark.cases} line cases and ${Object.values(r.tilingMark).reduce((s, x) => s + x.cases, 0)} tiling cases, 0 breaks), so no mutant can breed true at two places: a sharp no-go for hereditary reproduction, hence for Darwinian adaptation, on any graph and schedule; with one food item the species cells assemble ${r.food.species.events} raw copy events, none hereditary; the 32 reactive cells give ${r.food.reactive.events} events with food (${hereditaryReactive} hereditary) and the 16 creating rules on their live vacuum give ${r.vacuum.events} events (${hereditaryLive} hereditary) on starts of width <= ${W_ALONE}, ${ROUNDS} rounds; on the tilings the reactive cells give ${tilingCandidates} copy candidates in ${tilingRuns} runs; ${construction ? 'a hereditary reproducer was found and needs its construction verified' : 'so no construction, a bounded absence in the reactive and live-vacuum cells'}; the E-CMP-0009 constructor carries a mutation into all ${ctl.copies} copies; a population's census responds to some environment in ${responsiveCells.length} of 53 non-identity quiet cells (reported, not credited); copy candidates per pair flat/hyperbolic ${curvature.map(c => `${c.flat}/${c.hyperbolic}`).join(', ')}: ${curvatureCredited ? `one direction on all three pairs, credited to curvature by the fixed rule, as a count of shape coincidences, never of copies` : 'not credited to curvature'}`,
      metrics: {
        aloneRuns: r.alone.species.runs + r.alone.reactive.runs,
        aloneEvents: r.alone.species.events + r.alone.reactive.events,
        foodRunsSpecies: r.food.species.runs,
        foodEventsSpecies: r.food.species.events,
        foodRunsReactive: r.food.reactive.runs,
        foodEventsReactive: r.food.reactive.events,
        hereditarySpecies,
        hereditaryReactive,
        vacuumRuns: r.vacuum.runs,
        vacuumEvents: r.vacuum.events,
        hereditaryLive,
        maxCopiesFood: Math.max(r.food.species.maxCopies, r.food.reactive.maxCopies),
        maxCopiesVacuum: r.vacuum.maxCopies,
        lineMarkCases: r.lineMark.cases,
        lineMarkDriving: r.lineMark.driving,
        lineMarkState: r.lineMark.state,
        lineMarkReads: r.lineMark.reads,
        lineMarkBreaks: r.lineMark.breaks,
        tilingMarkReads,
        tilingMarkBreaks,
        tilingRuns,
        tilingCandidates,
        ringRuns: r.ringRuns,
        responsiveCells: responsiveCells.length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        reactiveSpreadCases: r.spreadCases,
        reactiveSpreadWide: r.spreadWide,
        constructorMarkedCopies: ctl.markedCopies,
        identityResponsive: identityA1.reduce((s, a) => s + a.responsive, 0),
      },
      notes:
        `M10. Vacuum periods: ${r.vacuum.periods.join(' ')}. Tilings: ${Object.entries(r.tilingSearch).map(([k, v]) => `${k} runs ${v.runs} candidates ${v.candidates}${v.examples.length > 0 ? ` (${v.examples.join(', ')})` : ''}; marks ${r.tilingMark[k]?.cases ?? 0} cases ${r.tilingMark[k]?.breaks ?? 0} breaks`).join('; ')}. Curvature: ${curvature.map(c => `${c.pair} ${c.flat}/${c.hyperbolic}`).join(', ')}. Hits: species ${r.food.species.hits.slice(0, 6).map(h => `${h.cell} ${h.structure.window.join('')}@${h.structure.start} r${h.event.round} x${h.event.copies.length} true ${h.breedTrue}/${h.mutations}`).join(', ')}; reactive ${r.food.reactive.hits.slice(0, 6).map(h => `${h.cell} ${h.structure.window.join('')} r${h.event.round} x${h.event.copies.length} true ${h.breedTrue}/${h.mutations}`).join(', ')}; live ${r.vacuum.hits.slice(0, 6).map(h => `${h.cell} ${h.structure.window.join('')} r${h.event.round} x${h.event.copies.length} true ${h.breedTrue}/${h.mutations}`).join(', ')}. A1: ${r.adaptation.filter(a => a.responsive > 0).map(a => `${a.cell} ${a.responsive}/${a.distinct}`).join(' ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})

export { reproductionM10 }
