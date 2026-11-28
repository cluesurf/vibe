// Intelligence level 5, slice 2 (item vibe-computation-intelligence-0025, level5.md of vibe/computation/intelligence):
// pair-rule structures that a stream of movers rewrites (M5, M6: a mover meeting a static changes it). Does such a
// structure, rewritten by a fixed stream that encodes taught paths, route a LATER mover differently, and better on
// held-out inputs? Two parts.
//
// Part C, the census (judge side, the line): every quiet rule-background cell in a fixed order, every static of M6's
// width-3 census as a structure, every mover as a stream of 0 to 3 copies (the unary code of a taught count), then every
// mover at every phase as a later probe. What the stream leaves inside the structure's zone is its only memory; the
// probe's exit (where it changes the frame outside the zone) says whether the memory routes it.
//
// Part L, the routing task (sandbox candidates, graded by the outside evaluator): the T5 counter on the vacuum
// (id.CBA.swap), one structure per generated successor, its stream one +1 when the level-2 table holds the successor,
// then a probe; the read decides A*'s ties. Every run is the evaluator's metered round (decision 003). A dynamics
// knockout (the identity rule), a frozen twin (no stream), a smuggler (preference from candidate code, runs ignored)
// and a counter read (the static's tone: a register read, the instrument's positive control) say what the mesh adds.
//
// Algebra: spin-1 tones. Regime: pure. Gates C1 to C6 and L1 to L7, fixed in level5.md before the first run.

import { resolve } from 'node:path'
import { LineRun, lineSpecies, splitCell, type Frame, type Species, type SpeciesType } from '@/code/compute/lab/counter'
import { gateRule, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { addPreprocessing } from '@/code/intelligence/experience/learner/learned-heuristic'
import { learningEnvironments, type LearningEnvironment } from '@/code/intelligence/experience/learner/navigation-split'
import {
  candidate,
  evaluate,
  evaluateLearning,
  meshFrameHash,
  meshLineLength,
  meshLineRun,
  type CandidateSpec,
  type Grade,
  type LearningGrade,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { ROUTER_ARMS } from '@/code/intelligence/solver/reorganize/stream-catalog'
import {
  ARRIVAL_LAYOUT,
  COUNTER_LAYOUT,
  COUNTER_RULE,
  IDENTITY_RULE,
  MOVER_TONE,
  PREFERENCE_SPREAD,
  STATIC_TONE,
  type RouterLayout,
  type RouterSettings,
} from '@/code/intelligence/solver/reorganize/stream-router'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const ARM_MODULE = 'code/intelligence/solver/reorganize/stream-catalog'
const HONEST = ['meshRouter', 'routerKnockout', 'routerFrozen', 'counterRead', 'counterKnockout'] as const
const ARMS = [...HONEST, 'routerSmuggler'] as const

type Arm = (typeof ARMS)[number]

// ---------------------------------------------------------------- Part C parameters (level5.md)

const SPECIES_WIDTH = 3
const SPECIES_PERIOD = 24
const ZONE = 32
const GAP = 4
const STREAM_MAX = 3
const ROUND_CAP = 800
const INSIDE_MARGIN = 4

function rules(): GateRule[] {
  return pairRulesFromFibers().map(r => gateRule(r.name, r.table))
}

const toneAt = (f: Frame, x: number, b: number): number => {
  const i = x - f.lo

  return i >= 0 && i < f.tones.length ? f.tones[i]! : b
}

/** Where a mover (orbit phase `phase`) starts so that it approaches [lo, hi] from its side, GAP cells away, plus `extra`. */
function placeMover(m: Species, phase: number, lo: number, hi: number, extra: number): number {
  const f = m.orbit[phase]!

  if (m.shift > 0) {
    let d = lo - GAP - 1 - (f.lo + f.tones.length - 1)

    if ((d & 1) !== 0) {
      d--
    }

    return d - extra
  }

  let d = hi + GAP + 1 - f.lo

  if ((d & 1) !== 0) {
    d++
  }

  return d + extra
}

function put(layout: Map<number, number>, f: Frame, d: number, b: number): boolean {
  for (let i = 0; i < f.tones.length; i++) {
    const t = f.tones[i]!

    if (t === b) {
      continue
    }

    if (layout.has(f.lo + d + i)) {
      return false
    }

    layout.set(f.lo + d + i, t)
  }

  return true
}

/** runs whose round count the cap shortened (reported: a capped probe may not reach the structure) */
let roundCapBound = 0

function roundsFor(m: Species, distance: number): number {
  const want = Math.ceil((distance * m.period) / Math.abs(m.shift)) + 2 * m.period

  if (want > ROUND_CAP) {
    roundCapBound++
  }

  return Math.min(ROUND_CAP, want)
}

function zoneOf(f: Frame, lo: number, hi: number, b: number): Map<number, number> {
  const zone = new Map<number, number>()

  for (let x = lo; x <= hi; x++) {
    const t = toneAt(f, x, b)

    if (t !== b) {
      zone.set(x, t)
    }
  }

  return zone
}

const zoneKey = (zone: ReadonlyMap<number, number>): string =>
  [...zone]
    .sort((a, c) => a[0] - c[0])
    .map(([x, t]) => `${x}:${t}`)
    .join(' ')

/** The cells outside [lo, hi] where the frame with the probe differs from the one without, with the probe run's tone. */
function exitOf(without: Frame, withProbe: Frame, lo: number, hi: number, b: number): string {
  const xs = new Set<number>()

  for (const f of [without, withProbe]) {
    for (let i = 0; i < f.tones.length; i++) {
      xs.add(f.lo + i)
    }
  }

  return [...xs]
    .filter(x => (x < lo || x > hi) && toneAt(without, x, b) !== toneAt(withProbe, x, b))
    .sort((p, q) => p - q)
    .map(x => `${x}:${toneAt(withProbe, x, b)}`)
    .join(' ')
}

/** Whether `zone` holds exactly one frame of the static's orbit, translated, and nothing else; the static's hull if so. */
function cleanStatic(zone: ReadonlyMap<number, number>, s: Species, b: number): { lo: number; hi: number } | null {
  if (zone.size === 0) {
    return null
  }

  const xs = [...zone.keys()]
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)

  for (const f of s.orbit) {
    const live: number[] = []

    for (let i = 0; i < f.tones.length; i++) {
      if (f.tones[i] !== b) {
        live.push(i)
      }
    }

    if (live.length !== zone.size) {
      continue
    }

    const d = lo - (f.lo + live[0]!)

    if (live.every(i => zone.get(f.lo + i + d) === f.tones[i])) {
      return { lo, hi }
    }
  }

  return null
}

interface CellCensus {
  cell: string
  kind: string
  type: SpeciesType | null
  statics: number
  movers: number
  /** (static, stream mover) pairs */
  pairs: number
  rewritten: number
  /** (pair, n >= 1) zones that are a clean translate of the static */
  cleanZones: number
  dirtyZones: number
  placements: number
  sensitive: number
  sensitiveClean: number
  /** sensitive, not clean, and the stream alone leaves the zone empty */
  needsStatic: number
  capable: number
  planted: number
  /** clean zones whose static sits within INSIDE_MARGIN of the zone's edge */
  edge: number
  runs: number
  /** a digest of every exit, for the determinism gate */
  digest: number
  example: string
}

function censusCell(rule: GateRule, b: number): CellCensus {
  const split = splitCell(rule, b)
  const species = lineSpecies(rule, b, SPECIES_WIDTH, SPECIES_PERIOD)
  const statics = species.filter(s => s.motion === 'static')
  const movers = species.filter(s => s.motion === 'mover')
  const out: CellCensus = {
    cell: `${rule.name}/${b}`,
    kind: split.kind,
    type: split.type,
    statics: statics.length,
    movers: movers.length,
    pairs: 0,
    rewritten: 0,
    cleanZones: 0,
    dirtyZones: 0,
    placements: 0,
    sensitive: 0,
    sensitiveClean: 0,
    needsStatic: 0,
    capable: 0,
    planted: 0,
    edge: 0,
    runs: 0,
    digest: 7,
    example: '',
  }

  const fold = (text: string): void => {
    for (let i = 0; i < text.length; i++) {
      out.digest = (out.digest * 31 + text.charCodeAt(i)) % 1_000_003
    }
  }

  for (const s of statics) {
    const s0 = s.orbit[0]!
    const lo = s0.lo - ZONE
    const hi = s0.lo + s0.tones.length - 1 + ZONE

    for (const m of movers) {
      out.pairs++

      const head = m.orbit[0]!
      const spacing = head.tones.length + 4 + ((head.tones.length + 4) & 1)

      const streamZone = (n: number, withStatic: boolean): Map<number, number> => {
        const layout = new Map<number, number>()

        if (withStatic) {
          put(layout, s0, 0, b)
        }

        for (let k = 0; k < n; k++) {
          if (!put(layout, head, placeMover(m, 0, lo, hi, k * spacing), b)) {
            throw new Error(`stream-routing: stream copies overlap in ${out.cell}`)
          }
        }

        const rounds = roundsFor(m, hi - lo + 1 + 2 * GAP + n * spacing + 8)

        out.runs++

        return zoneOf(new LineRun(rule, b, layout, rounds).frames[rounds]!, lo, hi, b)
      }

      const zones: Map<number, number>[] = []
      const clean: boolean[] = []

      for (let n = 0; n <= STREAM_MAX; n++) {
        const zone = streamZone(n, true)
        const hull = cleanStatic(zone, s, b)

        zones.push(zone)
        clean.push(hull !== null)

        if (hull !== null && (hull.lo < lo + INSIDE_MARGIN || hull.hi > hi - INSIDE_MARGIN)) {
          out.edge++
        }

        if (n > 0) {
          out.cleanZones += hull !== null ? 1 : 0
          out.dirtyZones += hull !== null ? 0 : 1
        }
      }

      const keys = zones.map(zoneKey)

      out.rewritten += keys.some(k => k !== keys[0]) ? 1 : 0

      let aloneEmpty: boolean | null = null

      for (const p of movers) {
        for (let phase = 0; phase < p.period; phase++) {
          for (const extra of [0, 2]) {
            out.placements++

            const d = placeMover(p, phase, lo, hi, extra)
            const rounds = roundsFor(p, hi - lo + 1 + 2 * GAP + 2 * ZONE)

            const exit = (zone: ReadonlyMap<number, number>): string => {
              const without = new LineRun(rule, b, zone, rounds)
              const layout = new Map(zone)

              if (!put(layout, p.orbit[phase]!, d, b)) {
                throw new Error(`stream-routing: a probe overlaps the zone in ${out.cell}`)
              }

              out.runs += 2

              return exitOf(without.frames[rounds]!, new LineRun(rule, b, layout, rounds).frames[rounds]!, lo, hi, b)
            }

            const exits = zones.map(exit)
            const free = exit(new Map())
            const planted = exit(new Map([...zones[0]!].map(([x, t]) => [x + 2, t] as [number, number])))
            const sensitive = exits.some(e => e !== exits[0])
            const cleanExits = exits.filter((_, n) => n === 0 || clean[n])
            const sensitiveClean = cleanExits.some(e => e !== cleanExits[0])

            exits.forEach(fold)
            out.sensitive += sensitive ? 1 : 0
            out.sensitiveClean += sensitiveClean ? 1 : 0
            out.capable += exits[0] !== free ? 1 : 0
            out.planted += planted !== exits[0] ? 1 : 0

            if (sensitive && !sensitiveClean) {
              aloneEmpty ??= [1, 2, 3].every(n => streamZone(n, false).size === 0)

              out.needsStatic += aloneEmpty ? 1 : 0
            }

            if (sensitive && out.example === '') {
              out.example = `static ${s.key}, stream ${m.key}, probe ${p.key} phase ${phase} extra ${extra}: zones ${keys.map(k => `[${k}]`).join(' ')}; exits ${exits.map(e => `[${e}]`).join(' ')}`
            }
          }
        }
      }
    }
  }

  return out
}

function census(only?: ReadonlySet<string>): CellCensus[] {
  const out: CellCensus[] = []

  for (const rule of rules()) {
    for (const b of [-1, 0, 1]) {
      if (only !== undefined && !only.has(`${rule.name}/${b}`)) {
        continue
      }

      if (splitCell(rule, b).kind === 'live_vacuum') {
        // no finite start exists on a background the rule does not fix: no species, no structure
        out.push({
          cell: `${rule.name}/${b}`,
          kind: 'live_vacuum',
          type: null,
          statics: 0,
          movers: 0,
          pairs: 0,
          rewritten: 0,
          cleanZones: 0,
          dirtyZones: 0,
          placements: 0,
          sensitive: 0,
          sensitiveClean: 0,
          needsStatic: 0,
          capable: 0,
          planted: 0,
          edge: 0,
          runs: 0,
          digest: 7,
          example: '',
        })
        continue
      }

      out.push(censusCell(rule, b))
    }
  }

  return out
}

// ---------------------------------------------------------------- Part L: the judge's mesh runs (original rule)

interface JudgeRead {
  value: number
  frameHash: number
}

function judgeReader(): (rule: string, layout: RouterLayout, word: readonly number[]) => JudgeRead {
  const tables = new Map(rules().map(r => [r.name, r]))
  const cache = new Map<string, JudgeRead>()

  return (rule, layout, word) => {
    const key = `${rule}|${JSON.stringify(layout)}|${word.join(',')}`
    const known = cache.get(key)

    if (known !== undefined) {
      return known
    }

    const gate = tables.get(rule)

    if (gate === undefined) {
      throw new Error(`stream-routing: no rule ${rule}`)
    }

    const window = layout.window.slice()

    layout.inputs.forEach((offset, j) => {
      window[offset] = word[j]!
    })

    const run = lineBrickRun({ rule: gate, background: 0, start: layout.start, window, rounds: layout.readRound })
    const frame = run.frames[layout.readRound]!
    const read = { value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length) }

    cache.set(key, read)

    return read
  }
}

interface JudgeSearch {
  pathKeys: string[]
  expanded: number
  runs: number
  rounds: number
  frameDigest: number
  /** runs whose decision differs from the same layout and word under the identity rule */
  differFromIdentity: number
}

/** The honest arm's whole search, recomputed from the instance with the judge's own runs (level5.md, Part L). */
function judgeSearch(
  settings: RouterSettings,
  problem: Problem<MeshState>,
  environment: LearningEnvironment,
  table: ReadonlyMap<string, number> | null,
  read: ReturnType<typeof judgeReader>,
): JudgeSearch {
  const base = environment.base.estimate
  const parents = new Map<string, { state: MeshState; parent: string | null }>()
  const best = new Map<string, number>()
  const closed = new Set<string>()
  const expandedKeys = new Set<string>()
  const open: { f: number; secondary: number; order: number; key: string }[] = []
  const out: JudgeSearch = { pathKeys: [], expanded: 0, runs: 0, rounds: 0, frameDigest: 0, differFromIdentity: 0 }
  const chain = meshChain(settings.rule, { ...settings.layout, background: 0 })

  let order = 0
  let expansions = 0

  const push = (f: number, secondary: number, key: string): void => {
    open.push({ f, secondary, order: order++, key })
  }

  const pop = (): { f: number; secondary: number; order: number; key: string } => {
    let at = 0

    for (let i = 1; i < open.length; i++) {
      const a = open[i]!
      const c = open[at]!

      if (a.f < c.f || (a.f === c.f && (a.secondary < c.secondary || (a.secondary === c.secondary && a.order < c.order)))) {
        at = i
      }
    }

    return open.splice(at, 1)[0]!
  }

  const initialKey = problem.key(problem.initial)

  parents.set(initialKey, { state: problem.initial, parent: null })
  best.set(initialKey, 0)

  const h0 = base(problem.initial)

  push(h0, PREFERENCE_SPREAD + h0, initialKey)

  while (open.length > 0) {
    const entry = pop()
    const key = entry.key
    const g = best.get(key)!

    if (entry.f - (entry.secondary % PREFERENCE_SPREAD) !== g || closed.has(key)) {
      continue
    }

    const state = parents.get(key)!.state

    if (problem.goal(state)) {
      for (let cursor: string | null = key; cursor !== null; cursor = parents.get(cursor)!.parent) {
        out.pathKeys.push(cursor)
      }

      out.pathKeys.reverse()
      break
    }

    closed.add(key)
    expandedKeys.add(key)
    expansions++

    const batch: { state: MeshState; cost: number }[] = []

    for (const operator of environment.operators) {
      if (operator.applicable(state)) {
        batch.push({ cost: operator.cost(state), state: operator.apply(state) })
      }
    }

    const preferred: boolean[] = []
    const request: MeshDigestRun[] = []

    for (const next of batch) {
      const nextKey = problem.key(next.state)
      const taught = table?.has(nextKey) === true
      const word = [settings.stream && taught ? MOVER_TONE : 0, MOVER_TONE]
      const run = read(settings.rule, settings.layout, word)

      out.runs++
      out.rounds += settings.layout.readRound
      request.push({ keyHash: meshKeyHash(nextKey), word, frameHash: run.frameHash, value: run.value })

      const decision = settings.decisions === 'table' ? taught : run.value === settings.readTone

      preferred.push(decision)

      if (decision !== (read(IDENTITY_RULE, settings.layout, word).value === settings.readTone)) {
        out.differFromIdentity++
      }
    }

    // one request per expansion, its step the expansion count (item 0037: the chain binds step, key, word and read)
    if (request.length > 0) {
      out.frameDigest = chain.fold(expansions, request)
    }

    batch.forEach((next, i) => {
      const nextKey = problem.key(next.state)
      const nextG = g + next.cost
      const known = best.get(nextKey)

      if (known !== undefined && known <= nextG) {
        return
      }

      if (parents.has(nextKey)) {
        closed.delete(nextKey)
      }

      parents.set(nextKey, { state: next.state, parent: key })
      best.set(nextKey, nextG)

      const h = base(next.state)

      push(nextG + h, (preferred[i] ? 0 : PREFERENCE_SPREAD) + h, nextKey)
    })
  }

  out.expanded = expandedKeys.size

  return out
}

function certify(grade: Grade<MeshState>, problem: Problem<MeshState>, judged: JudgeSearch): string {
  const pathKeys = grade.solution.states.map(state => problem.key(state))

  if (pathKeys.join('|') !== judged.pathKeys.join('|')) {
    return 'the path differs from the recomputed search'
  }

  if (grade.measured.expansions !== judged.expanded) {
    return `measured expansions ${grade.measured.expansions}, recomputed ${judged.expanded}`
  }

  const layouts = grade.mesh.layouts

  if (judged.runs === 0) {
    return layouts.length === 0 ? '' : 'mesh runs metered where the recomputation has none'
  }

  if (layouts.length !== 1) {
    return `${layouts.length} metered layouts, one expected`
  }

  const [metered] = layouts

  // the vacuum, checked on the entry (audit 3, m1); the rule and layout are also bound into the digest's seed
  if (metered!.layout.background !== 0) {
    return `metered on background ${String(metered!.layout.background)}, not the vacuum`
  }

  if (metered!.runs !== judged.runs || metered!.rounds !== judged.rounds || metered!.frameDigest !== judged.frameDigest) {
    return `metered runs ${metered!.runs}, rounds ${metered!.rounds}, digest ${metered!.frameDigest}; recomputed ${judged.runs}, ${judged.rounds}, ${judged.frameDigest}`
  }

  return ''
}

// ---------------------------------------------------------------- Part L: environments

const valueTable = candidate('code/intelligence/experience/learner/catalog', 'valueTable')
const breadthFirst = candidate(SOLVER_CATALOG, 'breadthFirst')

const baseHeuristic = (environment: LearningEnvironment) => ({ id: environment.base.id, estimate: 'base', preprocessing: environment.base.preprocessing })

const aStarOn = (environment: LearningEnvironment): CandidateSpec =>
  candidate(SOLVER_CATALOG, 'aStar', { heuristic: baseHeuristic(environment) }, { base: environment.base.estimate })

function armSpec(name: Arm, environment: LearningEnvironment, learned: LearningGrade<MeshState>): CandidateSpec {
  const reads = ROUTER_ARMS[name]!.stream || ROUTER_ARMS[name]!.decisions === 'table'

  return candidate(
    ARM_MODULE,
    name,
    { preprocessing: reads ? addPreprocessing(environment.base.preprocessing, learned.charge) : environment.base.preprocessing },
    reads ? { base: environment.base.estimate, table: learned.table } : { base: environment.base.estimate },
  )
}

interface Row {
  starts: number
  expansions: number
  calls: number
  optimal: number
  pairUpdates: number
}

const NO_ROW: Row = { starts: 0, expansions: 0, calls: 0, optimal: 0, pairUpdates: 0 }

const addRow = (a: Row, c: Row): Row => ({
  starts: a.starts + c.starts,
  expansions: a.expansions + c.expansions,
  calls: a.calls + c.calls,
  optimal: a.optimal + c.optimal,
  pairUpdates: a.pairUpdates + c.pairUpdates,
})

const callsOf = (grade: Grade<MeshState>): number => grade.counted.applicable + grade.counted.apply + grade.counted.cost
const pairUpdatesOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.pairUpdates, 0)

type Solver = 'aStar' | Arm

const SOLVERS: readonly Solver[] = ['aStar', ...ARMS]

const emptyRows = (): Record<Solver, Row> => Object.fromEntries(SOLVERS.map(name => [name, NO_ROW])) as Record<Solver, Row>

interface EnvironmentResult {
  id: string
  heldOut: number
  outside: Record<Solver, Row>
  inside: Record<Solver, Row>
  charge: number
  certified: Record<Arm, number>
  smugglerAccepted: number
  smugglerRefused: number
  /** smuggler solves whose path or measured expansions differ from meshRouter's grade */
  smugglerDiverged: number
  smugglerDivergedRefused: number
  counterDiffersFromIdentity: number
  failures: string[]
}

function runEnvironment(environment: LearningEnvironment, read: ReturnType<typeof judgeReader>): EnvironmentResult {
  const failures: string[] = []

  const fail = (message: string): void => {
    if (failures.length < 10) {
      failures.push(`${environment.id}: ${message}`)
    }
  }

  const learned = evaluateLearning({ build: valueTable, teacher: aStarOn(environment), training: environment.training, operators: environment.operators })

  if (!learned.accepted) {
    fail(`the value table was rejected: ${learned.violations[0]}`)
  }

  const support = learned.table
  const outside = emptyRows()
  const inside = emptyRows()
  const certified = Object.fromEntries(ARMS.map(name => [name, 0])) as Record<Arm, number>

  let smugglerAccepted = 0
  let smugglerRefused = 0
  let smugglerDiverged = 0
  let smugglerDivergedRefused = 0
  let counterDiffersFromIdentity = 0

  for (const problem of environment.heldOut) {
    const truth = environment.oracle[environment.startOf.get(problem.id)!]!
    const bfs = evaluate(breadthFirst, problem, environment.operators)
    const grades = { aStar: evaluate(aStarOn(environment), problem, environment.operators) } as Record<Solver, Grade<MeshState>>

    for (const name of ARMS) {
      grades[name] = evaluate(armSpec(name, environment, learned), problem, environment.operators)
    }

    if (!bfs.solved || bfs.violations.length > 0 || bfs.cost !== truth) {
      fail(`${problem.id} BFS solved ${bfs.solved}, cost ${bfs.cost}, oracle ${truth}`)
    }

    // L2
    for (const name of SOLVERS) {
      const grade = grades[name]

      if (!grade.solved || grade.violations.length > 0) {
        fail(`${problem.id} ${name}: solved ${grade.solved}, ${grade.violations[0] ?? 'no violation'}`)
      }

      if (grade.cost !== bfs.cost) {
        fail(`${problem.id} ${name} cost ${grade.cost}, BFS ${bfs.cost}`)
      }
    }

    // L3: the judge recomputes every honest arm, and the router the smuggler claims to be
    for (const name of HONEST) {
      const judged = judgeSearch(ROUTER_ARMS[name]!, problem, environment, ROUTER_ARMS[name]!.stream ? support : null, read)
      const reason = certify(grades[name], problem, judged)

      if (reason === '') {
        certified[name]++
      } else {
        fail(`${problem.id} ${name} not certified: ${reason}`)
      }

      if (name === 'counterRead') {
        counterDiffersFromIdentity += judged.differFromIdentity
      }
    }

    const claimed = judgeSearch(ROUTER_ARMS.meshRouter!, problem, environment, support, read)
    const smuggler = grades.routerSmuggler
    const refused = certify(smuggler, problem, claimed) !== ''
    const router = grades.meshRouter
    const diverged =
      smuggler.measured.expansions !== router.measured.expansions ||
      smuggler.solution.states.map(state => problem.key(state)).join('|') !== router.solution.states.map(state => problem.key(state)).join('|')

    certified.routerSmuggler += refused ? 0 : 1
    smugglerAccepted += smuggler.solved && smuggler.violations.length === 0 ? 1 : 0
    smugglerRefused += refused ? 1 : 0
    smugglerDiverged += diverged ? 1 : 0
    smugglerDivergedRefused += diverged && refused ? 1 : 0

    // L4
    if (grades.routerFrozen.measured.expansions !== grades.aStar.measured.expansions) {
      fail(`${problem.id}: frozen ${grades.routerFrozen.measured.expansions} expansions, level-1 A* ${grades.aStar.measured.expansions}`)
    }

    const rows = support.has(problem.key(problem.initial)) ? inside : outside

    for (const name of SOLVERS) {
      const grade = grades[name]

      rows[name] = addRow(rows[name], {
        starts: 1,
        expansions: grade.measured.expansions,
        calls: callsOf(grade),
        optimal: grade.solved && grade.cost === bfs.cost ? 1 : 0,
        pairUpdates: pairUpdatesOf(grade),
      })
    }
  }

  return {
    id: environment.id,
    heldOut: environment.heldOut.length,
    outside,
    inside,
    charge: learned.charge.expansions,
    certified,
    smugglerAccepted,
    smugglerRefused,
    smugglerDiverged,
    smugglerDivergedRefused,
    counterDiffersFromIdentity,
    failures,
  }
}

// ---------------------------------------------------------------- L1: the layouts

interface LayoutCertificate {
  failures: string[]
  runnerDifferences: number
}

function certifyLayouts(read: ReturnType<typeof judgeReader>): LayoutCertificate {
  const failures: string[] = []
  const tables = new Map(rules().map(r => [r.name, r]))

  let runnerDifferences = 0

  for (const rule of [COUNTER_RULE, IDENTITY_RULE]) {
    if (!tables.has(rule)) {
      failures.push(`no rule ${rule} in pairRulesFromFibers`)
      continue
    }

    for (const layout of [ARRIVAL_LAYOUT, COUNTER_LAYOUT]) {
      for (const stream of [0, MOVER_TONE]) {
        for (const probe of [0, MOVER_TONE]) {
          const word = [stream, probe]
          const judged = read(rule, layout, word)
          const cells = new Int8Array(meshLineLength(layout))
          const evaluator = meshLineRun(tables.get(rule)!.table, layout, word, cells)

          if (evaluator.value !== judged.value || evaluator.frameHash !== judged.frameHash) {
            runnerDifferences++
          }

          const want =
            rule === IDENTITY_RULE ? 0 : layout === ARRIVAL_LAYOUT ? (probe === MOVER_TONE ? MOVER_TONE : 0) : stream === MOVER_TONE && probe === MOVER_TONE ? STATIC_TONE : null

          if (want !== null && judged.value !== want) {
            failures.push(`${rule} ${layout === ARRIVAL_LAYOUT ? 'arrival' : 'counter'} word ${word.join(',')} reads ${judged.value}, want ${want}`)
          }

          // the counter read without the stream (probe present) must not read the static's tone
          if (rule === COUNTER_RULE && layout === COUNTER_LAYOUT && probe === MOVER_TONE && stream === 0 && judged.value === STATIC_TONE) {
            failures.push('the counter read sees the static without a stream')
          }
        }
      }
    }
  }

  if (runnerDifferences > 0) {
    failures.push(`the evaluator's meshLineRun and lineBrickRun differ on ${runnerDifferences} runs`)
  }

  return { failures, runnerDifferences }
}

// ---------------------------------------------------------------- the experiment

export default experiment({
  id: 'intelligence/stream-routing',
  code: 'E-CMP-0076',
  title:
    'intelligence level 5, slice 2: whether a pair-rule structure that a stream of movers rewrites routes a later mover better on held-out inputs; a census over every quiet cell, static, stream and probe placement on the line, and the T5 counter on the vacuum as a router of A*, every run the evaluator\'s metered round, with a dynamics knockout, a frozen twin, a smuggler and a counter read, all isolated candidates recomputed by a judge with the original rule',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const isolationBefore = isolationCounts()
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []

    const fail = (message: string): void => {
      if (failures.length < 40) {
        failures.push(message)
      }
    }

    // ---- Part C
    roundCapBound = 0

    const cells = census()
    const capBoundFirstCensus = roundCapBound
    const quiet = cells.filter(c => c.kind !== 'live_vacuum')
    const count = (pick: (c: CellCensus) => boolean): number => cells.filter(pick).length
    const typeCount = (type: SpeciesType): number => count(c => c.type === type)

    // C1
    if (count(c => c.kind === 'species') !== 24 || count(c => c.kind === 'reactive') !== 32 || count(c => c.kind === 'live_vacuum') !== 16) {
      fail(`split ${count(c => c.kind === 'species')} species, ${count(c => c.kind === 'reactive')} reactive, ${count(c => c.kind === 'live_vacuum')} live vacuum`)
    }

    const types = (['T0', 'T1', 'T2', 'T3', 'T4', 'T5'] as const).map(typeCount)

    if (types.join(',') !== '3,3,3,3,6,6') {
      fail(`species types ${types.join(',')}, M6 has 3,3,3,3,6,6`)
    }

    // C2
    const structured = quiet.filter(c => c.pairs > 0)
    const structuredReactive = structured.filter(c => c.kind === 'reactive')

    if (structured.some(c => c.type === 'T0' || c.type === 'T1' || c.type === 'T2' || c.type === 'T3')) {
      fail('a T0 to T3 cell has a static and a mover')
    }

    if (structured.filter(c => c.type === 'T4' || c.type === 'T5').length !== 12 || structuredReactive.length !== 8) {
      fail(`cells with a static and a mover: ${structured.filter(c => c.type === 'T4' || c.type === 'T5').length} T4/T5 (12), ${structuredReactive.length} reactive (8)`)
    }

    // C3
    const t4 = structured.filter(c => c.type === 'T4')
    const t5 = structured.filter(c => c.type === 'T5')

    if (t4.some(c => c.rewritten > 0)) {
      fail(`a T4 structure was rewritten: ${t4.filter(c => c.rewritten > 0).map(c => c.cell).join(', ')}`)
    }

    if (t5.some(c => c.sensitive > 0 || c.capable > 0)) {
      fail(`a T5 probe depends on the structure: ${t5.filter(c => c.sensitive > 0 || c.capable > 0).map(c => c.cell).join(', ')}`)
    }

    // C4
    if (!t4.some(c => c.capable > 0) || !t4.some(c => c.planted > 0)) {
      fail('no T4 structure routes a probe, or no planted move changes an exit: the reader cannot see routing')
    }

    // C5
    if (cells.some(c => c.edge > 0)) {
      fail(`a clean zone's static reached the zone's edge: ${cells.filter(c => c.edge > 0).map(c => c.cell).join(', ')}`)
    }

    // C6
    const pickedCells = new Set(['id.BCA.id/1', 'id.CBA.swap/0'])
    const again = census(pickedCells)
    const first = cells.filter(c => pickedCells.has(c.cell))

    if (again.length !== 2 || again.some((c, i) => JSON.stringify(c) !== JSON.stringify(first[i]))) {
      fail('a second census gave different counts or exits')
    }

    // ---- Part L
    const read = judgeReader()
    const layouts = certifyLayouts(read)

    layouts.failures.forEach(f => fail(`L1: ${f}`))

    // L7
    for (const name of ARMS) {
      const bundled = candidateBundle(ARM_MODULE, name, 'solver')

      if (!bundled.ok) {
        fail(`the ${name} bundle was refused: ${bundled.reason}`)
      }
    }

    const environments = learningEnvironments().filter(e => e.training.length > 0 && e.heldOut.length > 0)
    const results = environments.map(environment => runEnvironment(environment, read))

    results.forEach(r => r.failures.forEach(fail))

    const total = (pick: (r: EnvironmentResult) => Row): Row => results.reduce((row, r) => addRow(row, pick(r)), NO_ROW)
    const outside = Object.fromEntries(SOLVERS.map(name => [name, total(r => r.outside[name])])) as Record<Solver, Row>
    const inside = Object.fromEntries(SOLVERS.map(name => [name, total(r => r.inside[name])])) as Record<Solver, Row>
    const all = (name: Solver): Row => addRow(outside[name], inside[name])
    const heldOut = results.reduce((sum, r) => sum + r.heldOut, 0)
    const charge = results.reduce((sum, r) => sum + r.charge, 0)
    const net = (name: Arm): number => all('aStar').expansions - (all(name).expansions + (name === 'routerFrozen' ? 0 : charge))

    // L3, the smuggler
    const diverged = results.reduce((sum, r) => sum + r.smugglerDiverged, 0)
    const divergedRefused = results.reduce((sum, r) => sum + r.smugglerDivergedRefused, 0)
    const smugglerRefused = results.reduce((sum, r) => sum + r.smugglerRefused, 0)
    const smugglerAccepted = results.reduce((sum, r) => sum + r.smugglerAccepted, 0)

    if (diverged === 0) {
      fail('the smuggler never diverged from the router: the control is empty')
    }

    if (divergedRefused !== diverged) {
      fail(`the judge certified ${diverged - divergedRefused} smuggler solves that diverged from the router`)
    }

    if (smugglerAccepted !== heldOut) {
      fail(`the evaluator alone accepted the smuggler on ${smugglerAccepted} of ${heldOut} solves`)
    }

    // L5
    const counterDiffers = results.reduce((sum, r) => sum + r.counterDiffersFromIdentity, 0)

    if (counterDiffers === 0) {
      fail('the counter read never differs from its identity read: the instrument cannot see experience in the dynamics')
    }

    // L6
    const probeEnvironment = environments.find(e => e.id === 'maze-{4,4}')

    if (probeEnvironment === undefined) {
      fail('maze-{4,4} missing for the determinism check')
    } else {
      const learned = evaluateLearning({ build: valueTable, teacher: aStarOn(probeEnvironment), training: probeEnvironment.training, operators: probeEnvironment.operators })
      const digest = (): string =>
        probeEnvironment.heldOut
          .slice(0, 2)
          .map(problem => {
            const grade = evaluate(armSpec('meshRouter', probeEnvironment, learned), problem, probeEnvironment.operators)

            return `${grade.measured.expansions}:${grade.cost}:${JSON.stringify(grade.mesh)}`
          })
          .join(';')

      if (digest() !== digest()) {
        fail('two solves of meshRouter gave different grades')
      }
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/stream-routing.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // ---- the verdict's numbers
    const credit = Math.min(outside.routerKnockout.expansions, outside.routerFrozen.expansions) - outside.meshRouter.expansions
    const creditInside = Math.min(inside.routerKnockout.expansions, inside.routerFrozen.expansions) - inside.meshRouter.expansions
    const counterCredit = outside.counterKnockout.expansions - outside.counterRead.expansions
    const counterCreditAll = all('counterKnockout').expansions - all('counterRead').expansions
    const reactive = structuredReactive
    const sensitiveCells = reactive.filter(c => c.sensitive > 0)
    const sensitiveCleanCells = quiet.filter(c => c.sensitiveClean > 0)
    const sum = (list: readonly CellCensus[], pick: (c: CellCensus) => number): number => list.reduce((s, c) => s + pick(c), 0)

    metrics.cells = cells.length
    metrics.quietCells = quiet.length
    metrics.cellsWithStructure = structured.length
    metrics.structures = sum(quiet, c => c.statics)
    metrics.pairs = sum(quiet, c => c.pairs)
    metrics.placements = sum(quiet, c => c.placements)
    metrics.censusRuns = sum(cells, c => c.runs)
    metrics.roundCapBound = capBoundFirstCensus
    metrics.t4Rewritten = sum(t4, c => c.rewritten)
    metrics.t4Capable = sum(t4, c => c.capable)
    metrics.t4Planted = sum(t4, c => c.planted)
    metrics.t5Rewritten = sum(t5, c => c.rewritten)
    metrics.t5Sensitive = sum(t5, c => c.sensitive)
    metrics.t5Capable = sum(t5, c => c.capable)
    metrics.reactiveRewritten = sum(reactive, c => c.rewritten)
    metrics.reactiveCleanZones = sum(reactive, c => c.cleanZones)
    metrics.reactiveDirtyZones = sum(reactive, c => c.dirtyZones)
    metrics.reactiveCapable = sum(reactive, c => c.capable)
    metrics.reactivePlanted = sum(reactive, c => c.planted)
    metrics.reactiveSensitive = sum(reactive, c => c.sensitive)
    metrics.reactiveSensitiveClean = sum(reactive, c => c.sensitiveClean)
    metrics.reactiveSensitiveNeedsStatic = sum(reactive, c => c.needsStatic)
    metrics.reactiveSensitiveCells = sensitiveCells.length
    metrics.sensitiveCleanCells = sensitiveCleanCells.length
    metrics.environments = results.length
    metrics.heldOut = heldOut
    metrics.outsideStarts = outside.aStar.starts
    metrics.insideStarts = inside.aStar.starts
    metrics.credit = credit
    metrics.creditInside = creditInside
    metrics.counterCredit = counterCredit
    metrics.counterCreditAll = counterCreditAll
    metrics.learningCharge = charge
    metrics.layoutRunnerDifferences = layouts.runnerDifferences
    metrics.counterDiffersFromIdentity = counterDiffers

    for (const name of SOLVERS) {
      metrics[`${name}OutsideExpansions`] = outside[name].expansions
      metrics[`${name}InsideExpansions`] = inside[name].expansions
      metrics[`${name}OutsideCalls`] = outside[name].calls
      metrics[`${name}Optimal`] = all(name).optimal
      metrics[`${name}PairUpdates`] = all(name).pairUpdates
    }

    for (const name of ARMS) {
      metrics[`${name}Certified`] = results.reduce((s, r) => s + r.certified[name], 0)
      metrics[`${name}NetGain`] = net(name)
    }

    control.smugglerDiverged = diverged
    control.smugglerDivergedRefused = divergedRefused
    control.smugglerRefused = smugglerRefused
    control.smugglerEvaluatorAccepted = smugglerAccepted
    control.frozenOutsideExpansions = outside.routerFrozen.expansions
    control.levelOneOutsideExpansions = outside.aStar.expansions

    metrics.sourceFilesScanned = files.length

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0
    const constructed = credit > 0
    const sameAsControls = (['routerKnockout', 'routerFrozen'] as const).every(
      name =>
        all(name).expansions === all('meshRouter').expansions &&
        outside[name].expansions === outside.meshRouter.expansions &&
        outside[name].calls === outside.meshRouter.calls,
    )
    const reactiveVerdict =
      sensitiveCleanCells.length > 0
        ? `open: a clean rewrite changes a later mover's exit in ${sensitiveCleanCells.length} cells (${sensitiveCleanCells.map(c => c.cell).join(', ')}), filed`
        : sensitiveCells.length > 0
          ? `a bounded absence for clean memory (0 of ${metrics.reactiveSensitive} sensitive placements follow a clean rewrite); in ${sensitiveCells.length} cells (${sensitiveCells.map(c => c.cell).join(', ')}) a probe's exit follows the debris a stream leaves (${metrics.reactiveSensitive} placements, ${metrics.reactiveSensitiveNeedsStatic} of them debris that needs the static), routing that follows damage, filed as a lead: the metered round runs +1 and -1 backgrounds since item 0032 (E-CMP-0084), but no router in a reactive cell is built here`
          : 'a bounded absence: no probe exit depends on the stream'
    const cellTable = structured
      .map(c => `${c.cell} ${c.type ?? 'reactive'}: ${c.statics} statics, ${c.movers} movers, rewritten ${c.rewritten} of ${c.pairs}, clean zones ${c.cleanZones}, dirty ${c.dirtyZones}, sensitive ${c.sensitive} (clean ${c.sensitiveClean}, needs the static ${c.needsStatic}) of ${c.placements}, capable ${c.capable}, planted ${c.planted}`)
      .join('; ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 5, slice 2: ${constructed ? `a construction, the T5 counter routes with credit ${credit}` : `the mesh is credited with ${credit} expansions`} on the ${outside.aStar.starts} held-out starts outside the taught table (${results.length} environments, ${heldOut} starts): the T5 counter on the vacuum, rewritten per successor by one +1 when the table holds it and read by a later +1's arrival, ${sameAsControls ? 'decides A*\'s ties exactly as its dynamics knockout and its frozen twin do' : 'decides A*\'s ties differently from its dynamics knockout or its frozen twin'} (${outside.meshRouter.expansions}, ${outside.routerKnockout.expansions}, ${outside.routerFrozen.expansions} expansions; level-1 A* ${outside.aStar.expansions}), because by M6's no-feedback lemma the probe flies free whatever the static did; on the line no T4 structure is ever rewritten (${metrics.t4Rewritten} of ${sum(t4, c => c.pairs)}) though it routes probes (${metrics.t4Capable} placements), and no T5 probe depends on a rewritten structure (${metrics.t5Sensitive} sensitive, ${metrics.t5Capable} routed, of ${sum(t5, c => c.placements)}): a sharp no-go for the species-conserving cells; reactive cells: ${reactiveVerdict}; reading the static's tone instead (a register read through the counter, not routing) the knockout loses ${counterCreditAll} expansions over all starts (${counterCredit} outside), so the instrument sees dynamics-carried experience; the judge recomputes every honest search and its metered digest from the instance and refuses a smuggler that routes from candidate code in ${divergedRefused} of ${diverged} diverging solves, which the evaluator alone accepts in ${smugglerAccepted} of ${heldOut}`,
      metrics,
      control,
      notes: `L2. Part C (line, width-3 species, 1 static per structure, streams of 0 to ${STREAM_MAX} copies, zone ${ZONE}, probes at every phase): ${cellTable}. Example sensitive placement: ${sensitiveCells[0]?.example ?? 'none'}. Part L outside the table (expansions / operator calls / optimal of starts / metered pair updates): ${SOLVERS.map(n => `${n} ${outside[n].expansions} / ${outside[n].calls} / ${outside[n].optimal} of ${outside[n].starts} / ${outside[n].pairUpdates}`).join('; ')}. Inside: ${SOLVERS.map(n => `${n} ${inside[n].expansions} / ${inside[n].optimal} of ${inside[n].starts}`).join('; ')}. Learning charge ${charge} expansions; net gain against level-1 A* over all held-out starts: ${ARMS.map(n => `${n} ${net(n)}`).join(', ')}. Certified by the judge: ${ARMS.map(n => `${n} ${metrics[`${n}Certified`]} of ${heldOut}`).join(', ')}. Layouts: the arrival read is +1 exactly when the probe is present, for both stream values; the counter read is -1 exactly when the stream mover is present; under id.ABC.id both read 0; the evaluator's runner equals lineBrickRun on all 16 runs. Limits: one structure in Part L, on the vacuum (built before item 0032 gave the metered round a background; every reactive cell lives on +1 or -1, and no reactive router is built here); a tie-break of A* as the use of a decision; held-out starts in trained environments; the census on the line only. ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
