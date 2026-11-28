// Intelligence level 8, slice 1 (item vibe-computation-intelligence-0010, level8.md of vibe/computation/intelligence):
// do many entities together grow in problem-solving capacity? Two readings, every criterion fixed in level8.md before
// the first run.
//
// Part A (external solvers sharing an operator library, the isolated evaluator): three entities per environment of
// family A's maze and obstacle fields on the four degree-matched pairs, each with its own training slice, validation
// share and held-out share. Each discovers macros on its own slice (E-CMP-0030's discoverer, metered) and selects its
// own library on its own validation share. Arms on the held-out shares: no library, isolated, union (the kept lists
// pooled, the headline sharing arm, paying exactly the isolated discovery and selection), foreign (only the others'
// operators), pooled (one selection over every candidate) and cross (the union of both geometries of a matched pair).
// Family H kept apart from net: a harm-constraint violation is an entity whose held-out work under sharing exceeds its
// work isolated; per-entity gains are reported beside the net.
//
// Part B (a mesh-realized collective, every round metered by the evaluator): two devices on one line, entity 1 holding
// the input t and entity 2 the input d of level 7's tie-break word, read at one cell. The census asks which preference
// functions two devices realize run together (one window) and apart (two runs); theorem C2 says apart realizes only
// functions of one input. The selected collective runs against the same devices apart, its identity knockout, the best
// wire and level-1 A*, with a smuggler and a wrong-words forger, every honest solve recomputed by a judge (device reads,
// path, expansions, background, SHA-256 chains).
//
// Algebra: none in Part A (puzzle labels), spin-1 tones in Part B. Regime: pure. Exact integers, no random numbers.

import { resolve } from 'node:path'
import { splitCell, type CellKind } from '@/code/compute/lab/counter'
import { gateRule, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { AGENT, OPEN, agentCell } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { addPreprocessing } from '@/code/intelligence/experience/learner/learned-heuristic'
import { learningEnvironments, type LearningEnvironment } from '@/code/intelligence/experience/learner/navigation-split'
import { buildMacros } from '@/code/intelligence/operator/discovery/macro'
import type { MacroCandidate } from '@/code/intelligence/operator/discovery/path-macro-discoverer'
import type { Operator } from '@/code/intelligence/operator/operator'
import {
  artifactCharge,
  callTotal,
  candidate,
  evaluate,
  evaluateLearning,
  meshFrameHash,
  meshLineLength,
  meshLineRun,
  newJudging,
  sealLibrary,
  type CandidateSpec,
  type Grade,
  type Judging,
  type LearningGrade,
  type SealedLibrary,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import {
  apartLayouts,
  apartSide,
  COLLECTIVE_SPREAD,
  collectiveWordIndex,
  jointLayout,
  type CollectiveArgs,
  type CollectiveLayout,
  type CollectiveMode,
} from '@/code/intelligence/solver/collective/collective-router'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { NO_PREPROCESSING, type Preprocessing } from '@/code/intelligence/solver/solver'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
// the independent recount runs the same search outside the evaluator, on counting primitives of its own
import { aStarSolver } from '@/code/intelligence/solver/search/best-first'
import { PriorityQueue } from '@/code/intelligence/solver/search/priority-queue'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import type { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const SELF = 'test/experiment/intelligence/collective.ts'

// ================================================================ Part A: a shared operator library

const PAIRS: readonly (readonly [LabGeometryName, LabGeometryName])[] = [
  ['{4,5}', '{4,4}'],
  ['{6,4}', '{6,3}'],
  ['{3,7}', '{3,6}'],
  ['{3,4,3,4}', '{3,4,3,3}'],
]
const HYPERBOLIC = new Set<string>(PAIRS.map(pair => pair[0]))
const KINDS = ['maze', 'obstacle'] as const
const ENTITIES = 3
const PERIOD = 4
const TRAINING_PHASE = 0
const VALIDATION_PHASE = 1

/** work as the evaluator measured it: states consulted, planning decisions, primitive calls */
interface Work { expansions: number; calls: number; elementary: number }

const NO_WORK: Work = { expansions: 0, calls: 0, elementary: 0 }
const addWork = (a: Work, b: Work): Work => ({ expansions: a.expansions + b.expansions, calls: a.calls + b.calls, elementary: a.elementary + b.elementary })
const subWork = (a: Work, b: Work): Work => ({ expansions: a.expansions - b.expansions, calls: a.calls - b.calls, elementary: a.elementary - b.elementary })

function measured(grade: Grade<MeshState>): Work {
  return { expansions: grade.measured.expansions, calls: callTotal(grade.counted), elementary: callTotal(grade.elementary) }
}

interface Entity {
  index: number
  slice: Problem<MeshState>[]
  validation: Problem<MeshState>[]
  test: Problem<MeshState>[]
}

interface Field {
  environment: LearningEnvironment
  entities: Entity[]
  validation: Problem<MeshState>[]
  test: Problem<MeshState>[]
  startOf: Map<string, number>
}

function moveAgent(template: Problem<MeshState>, start: number, id: string): Problem<MeshState> {
  const cells = template.initial.cells.slice()

  cells[agentCell(template.initial)] = OPEN
  cells[start] = AGENT

  return { ...template, id, initial: { cells } }
}

/** E-CMP-0030's split, dealt to three entities: training by its slice, validation and held-out by j mod 3 */
function fieldOf(environment: LearningEnvironment): Field | null {
  const template = environment.training[0]

  if (template === undefined || environment.heldOut.length === 0) {
    return null
  }

  const startOf = new Map(environment.startOf)
  const entities: Entity[] = Array.from({ length: ENTITIES }, (_, index) => ({ index, slice: [], validation: [], test: [] }))
  const validation: Problem<MeshState>[] = []

  let trainingIndex = 0
  let position = 0

  for (let cell = 0; cell < environment.oracle.length; cell++) {
    if (environment.oracle[cell]! <= 0) {
      continue
    }

    const phase = position % PERIOD

    position++

    if (phase === VALIDATION_PHASE) {
      const problem = moveAgent(template, cell, `${environment.id}-validation-${cell}`)

      startOf.set(problem.id, cell)
      entities[validation.length % ENTITIES]!.validation.push(problem)
      validation.push(problem)
    } else if (phase === TRAINING_PHASE) {
      const problem = environment.training[trainingIndex]!

      if (startOf.get(problem.id) !== cell) {
        throw new Error(`${environment.id}: training start ${cell} out of order`)
      }

      entities[trainingIndex % ENTITIES]!.slice.push(problem)
      trainingIndex++
    }
  }

  if (trainingIndex !== environment.training.length) {
    throw new Error(`${environment.id}: ${trainingIndex} training starts rebuilt, ${environment.training.length} given`)
  }

  environment.heldOut.forEach((problem, j) => entities[j % ENTITIES]!.test.push(problem))

  return { environment, entities, validation, test: environment.heldOut, startOf }
}

/** A* over a heuristic, as an isolated candidate: the heuristic's charge declared, its sealed estimate handed in */
function aStarOn(heuristic: Heuristic<MeshState>): CandidateSpec {
  return candidate(SOLVER_CATALOG, 'aStar', { heuristic: { id: heuristic.id, estimate: 'base', preprocessing: heuristic.preprocessing } }, { base: heuristic.estimate })
}

/** the base estimate declaring, besides its own table, the whole charge of the libraries handed in */
function declaring(base: Heuristic<MeshState>, libraries: readonly SealedLibrary[]): Heuristic<MeshState> {
  let preprocessing = base.preprocessing

  for (const library of libraries) {
    preprocessing = addPreprocessing(preprocessing, artifactCharge(library) ?? NO_PREPROCESSING)
  }

  return { ...base, id: `${base.id}+macros`, preprocessing }
}

interface SolveRun {
  work: Work
  overBudget: number
  wrong: number
  /** solves whose path used a macro */
  usingMacro: number
}

const NO_RUN: SolveRun = { work: NO_WORK, overBudget: 0, wrong: 0, usingMacro: 0 }
const addRun = (a: SolveRun, b: SolveRun): SolveRun => ({
  work: addWork(a.work, b.work),
  overBudget: a.overBudget + b.overBudget,
  wrong: a.wrong + b.wrong,
  usingMacro: a.usingMacro + b.usingMacro,
})

function solveAll(
  field: Field,
  problems: readonly Problem<MeshState>[],
  libraries: readonly SealedLibrary[],
  fail: (message: string) => void,
  judging?: Judging,
): SolveRun {
  const environment = field.environment
  const heuristic = declaring(environment.base, libraries)
  const primitives = new Set(environment.operators.map(operator => operator.id))
  const out: SolveRun = { work: NO_WORK, overBudget: 0, wrong: 0, usingMacro: 0 }

  for (const problem of problems) {
    const grade = evaluate(aStarOn(heuristic), problem, environment.operators, { libraries, ...(judging === undefined ? {} : { judging }) })

    if (!grade.solved) {
      if (grade.violations.length > 0 && grade.violations.every(v => v.startsWith('over budget'))) {
        out.overBudget++
      } else {
        out.wrong++
        fail(`${problem.id}: solved ${grade.solved}, ${grade.violations[0] ?? 'no violation'}`)
      }
    } else if (grade.cost !== environment.oracle[field.startOf.get(problem.id)!]) {
      out.wrong++
      fail(`${problem.id}: cost ${grade.cost}, oracle ${environment.oracle[field.startOf.get(problem.id)!]}`)
    }

    out.work = addWork(out.work, measured(grade))
    out.usingMacro += grade.solution.operators.some(id => !primitives.has(id)) ? 1 : 0
  }

  return out
}

/** primitive calls of the same searches run outside the evaluator, macros composed over counting primitives */
function recountElementary(field: Field, library: SealedLibrary, problems: readonly Problem<MeshState>[]): number {
  let calls = 0

  const counting: Operator<MeshState>[] = field.environment.operators.map(operator => ({
    id: operator.id,
    applicable(state) {
      calls++

      return operator.applicable(state)
    },
    apply(state) {
      calls++

      return operator.apply(state)
    },
    cost(state) {
      calls++

      return operator.cost(state)
    },
  }))
  const macros = buildMacros(library.steps(), counting, { memo: true }).filter((m): m is Operator<MeshState> => m !== null)
  const heuristic = declaring(field.environment.base, [library])

  for (const problem of problems) {
    aStarSolver(heuristic).solve(problem, [...counting, ...macros])
  }

  return calls
}

function candidatesOf(report: unknown): MacroCandidate[] {
  const list = (report as { candidates?: unknown } | null)?.candidates

  return Array.isArray(list) ? (list as MacroCandidate[]) : []
}

const stepsKey = (steps: readonly string[]): string => steps.join('.')

/** E-CMP-0030's forward selection: a candidate is kept when its validation cut in primitive work exceeds its own cost */
function selectForward(
  field: Field,
  candidates: readonly MacroCandidate[],
  ownCost: number,
  validation: readonly Problem<MeshState>[],
  sources: readonly LearningGrade<MeshState>[],
  judging: Judging,
  fail: (message: string) => void,
): string[][] {
  const kept: string[][] = []

  if (validation.length === 0 || candidates.length === 0) {
    return kept
  }

  let current = solveAll(field, validation, [], fail, judging)

  for (const proposal of candidates) {
    const trial = sealLibrary({ id: `${field.environment.id}-trial`, steps: [...kept, proposal.steps], sources })
    const result = solveAll(field, validation, [trial], ignore, judging)

    if (result.wrong === 0 && result.overBudget === 0 && current.work.elementary - result.work.elementary > ownCost) {
      kept.push([...proposal.steps])
      current = result
    }
  }

  return kept
}

function ignore(message: string): string {
  return message
}

const ARMS_A = ['none', 'isolated', 'union', 'foreign', 'pooled'] as const

type ArmA = (typeof ARMS_A)[number]

interface EntityResult {
  candidates: number
  kept: string[][]
  discovery: Preprocessing
  selection: Preprocessing
  runs: Record<ArmA | 'cross', SolveRun>
}

interface EnvironmentResult {
  field: Field
  learnings: LearningGrade<MeshState>[]
  judgings: Judging[]
  entities: EntityResult[]
  union: { steps: string[][]; library: SealedLibrary | null }
  pooledKept: string[][]
  pooledSelection: Preprocessing
  recountMatches: boolean | null
  failures: string[]
}

function seal(id: string, steps: readonly string[][], sources: readonly LearningGrade<MeshState>[], judging: readonly Judging[]): SealedLibrary | null {
  return steps.length === 0 ? null : sealLibrary({ id, steps, sources, judging })
}

/** the kept lists in order, a repeated macro kept once */
function unite(lists: readonly (readonly string[][])[]): string[][] {
  const seen = new Set<string>()
  const out: string[][] = []

  for (const list of lists) {
    for (const steps of list) {
      if (!seen.has(stepsKey(steps))) {
        seen.add(stepsKey(steps))
        out.push(steps)
      }
    }
  }

  return out
}

function runEnvironmentA(field: Field): EnvironmentResult {
  const failures: string[] = []

  const fail = (message: string): void => {
    if (failures.length < 10) {
      failures.push(message)
    }
  }

  const environment = field.environment
  const learnings: LearningGrade<MeshState>[] = []
  const judgings: Judging[] = []
  const entities: EntityResult[] = []

  // discovery and isolated selection, entity by entity
  for (const entity of field.entities) {
    const learning = evaluateLearning({
      build: candidate('code/intelligence/experience/learner/catalog', 'pathMacros'),
      teacher: aStarOn(environment.base),
      training: entity.slice,
      operators: environment.operators,
    })

    if (!learning.accepted) {
      fail(`${environment.id} entity ${entity.index}: discovery rejected, ${learning.violations[0]}`)
    }

    if (learning.training.some(grade => !grade.solved)) {
      fail(`${environment.id} entity ${entity.index}: a teacher solve failed`)
    }

    const candidates = candidatesOf(learning.report)

    if (candidates.length !== learning.proposed) {
      fail(`${environment.id} entity ${entity.index}: ${candidates.length} candidates, ${learning.proposed} proposed under the meter`)
    }

    const discovery: Preprocessing = {
      expansions: learning.charge.expansions - learning.teacherArtifacts.expansions,
      operatorCalls: learning.charge.operatorCalls - learning.teacherArtifacts.operatorCalls,
      memoryBytes: learning.charge.memoryBytes - learning.teacherArtifacts.memoryBytes,
    }
    const judging = newJudging(`${environment.id}-entity-${entity.index}`)
    const ownCost = candidates.length === 0 ? 0 : discovery.operatorCalls / candidates.length
    const kept = selectForward(field, candidates, ownCost, entity.validation, [learning], judging, fail)

    learnings.push(learning)
    judgings.push(judging)
    entities.push({
      candidates: candidates.length,
      kept,
      discovery,
      selection: judging.work(),
      runs: { none: NO_RUN, isolated: NO_RUN, union: NO_RUN, foreign: NO_RUN, pooled: NO_RUN, cross: NO_RUN },
    })
  }

  // the pooled selection: every candidate in entity order on the whole validation set
  const pooledCandidates: MacroCandidate[] = []
  const seen = new Set<string>()

  learnings.forEach(learning =>
    candidatesOf(learning.report).forEach(proposal => {
      if (!seen.has(stepsKey(proposal.steps))) {
        seen.add(stepsKey(proposal.steps))
        pooledCandidates.push(proposal)
      }
    }),
  )

  const totalDiscovery = entities.reduce((sum, e) => sum + e.discovery.operatorCalls, 0)
  const pooledJudging = newJudging(`${environment.id}-pooled`)
  const pooledKept = selectForward(
    field,
    pooledCandidates,
    pooledCandidates.length === 0 ? 0 : totalDiscovery / pooledCandidates.length,
    field.validation,
    learnings,
    pooledJudging,
    fail,
  )

  const unionSteps = unite(entities.map(e => e.kept))
  const union = seal(`${environment.id}-union`, unionSteps, learnings, judgings)
  const pooled = seal(`${environment.id}-pooled`, pooledKept, learnings, [pooledJudging])

  field.entities.forEach((entity, k) => {
    const own = seal(`${environment.id}-entity-${k}`, entities[k]!.kept, [learnings[k]!], [judgings[k]!])
    const others = field.entities.map((_, i) => i).filter(i => i !== k)
    const foreign = seal(
      `${environment.id}-foreign-${k}`,
      unite(others.map(i => entities[i]!.kept)),
      others.map(i => learnings[i]!),
      others.map(i => judgings[i]!),
    )
    const runs = entities[k]!.runs
    const list = (library: SealedLibrary | null): SealedLibrary[] => (library === null ? [] : [library])

    runs.none = solveAll(field, entity.test, [], fail)
    runs.isolated = solveAll(field, entity.test, list(own), fail)
    runs.union = solveAll(field, entity.test, list(union), fail)
    runs.foreign = solveAll(field, entity.test, list(foreign), fail)
    runs.pooled = solveAll(field, entity.test, list(pooled), fail)
  })

  const unionElementary = entities.reduce((sum, e) => sum + e.runs.union.work.elementary, 0)
  const recountMatches = union === null ? null : recountElementary(field, union, field.entities.flatMap(e => e.test)) === unionElementary

  return {
    field,
    learnings,
    judgings,
    entities,
    union: { steps: unionSteps, library: union },
    pooledKept,
    pooledSelection: pooledJudging.work(),
    recountMatches,
    failures,
  }
}

/** cross: the union of both geometries of a matched pair, handed to every entity of both */
function runCross(a: EnvironmentResult, b: EnvironmentResult, fail: (message: string) => void): void {
  const steps = unite([a.union.steps, b.union.steps])
  const library = seal(`${a.field.environment.id}+${b.field.environment.id}-cross`, steps, [...a.learnings, ...b.learnings], [...a.judgings, ...b.judgings])

  for (const result of [a, b]) {
    result.field.entities.forEach((entity, k) => {
      result.entities[k]!.runs.cross = solveAll(result.field, entity.test, library === null ? [] : [library], fail)
    })
  }
}

/** the other geometry's union alone, on every held-out start of the target */
function foreignGeometry(from: EnvironmentResult, to: EnvironmentResult, fail: (message: string) => void): SolveRun {
  return solveAll(to.field, to.field.test, from.union.library === null ? [] : [from.union.library], fail)
}

function digestA(results: readonly EnvironmentResult[]): string {
  return results
    .map(
      r =>
        `${r.field.environment.id}:${r.entities.map(e => `${e.kept.map(stepsKey).join('|')}/${ARMS_A.map(arm => e.runs[arm].work.elementary).join(',')}`).join(';')}:${r.pooledKept.map(stepsKey).join('|')}`,
    )
    .join('#')
}

function fieldsOf(names: readonly LabGeometryName[]): Field[] {
  return learningEnvironments(names)
    .map(fieldOf)
    .filter((field): field is Field => field !== null)
}

const geometryOf = (id: string): string => id.replace(/^[a-z]+-/, '')

// ================================================================ Part B: a mesh-realized collective

const IDENTITY_RULE = 'id.ABC.id'
const COLLECTIVE_MODULE = 'code/intelligence/solver/collective/collective-catalog'
const DEVICE_WIDTH = 2
const GAPS = [0, 1, 2] as const
const R_READ = 6

/** the 6 nonempty proper tone sets, as bit masks over tone + 1 */
const TONE_SETS = [1, 2, 4, 3, 5, 6] as const
const toneSet = (mask: number): number[] => [-1, 0, 1].filter(t => ((mask >> (t + 1)) & 1) === 1)

/** the 6 words [t, d], in mask order: index (d + 1) * 2 + t */
const WORDS: readonly (readonly [number, number])[] = Array.from({ length: 6 }, (_, w) => [w & 1, (w >> 1) - 1] as const)
const FUNCTIONS = 64

function oneInput(g: number): boolean {
  const bit = (t: number, d: number): number => (g >> collectiveWordIndex(t, d)) & 1
  const noT = [-1, 0, 1].every(d => bit(0, d) === bit(1, d))
  const noD = [0, 1].every(t => bit(t, -1) === bit(t, 0) && bit(t, 0) === bit(t, 1))

  return noT || noD
}

const F1 = Array.from({ length: FUNCTIONS }, (_, g) => g).filter(oneInput)

interface Cell {
  index: number
  name: string
  rule: GateRule
  background: number
  kind: CellKind
}

function allRules(): GateRule[] {
  return pairRulesFromFibers().map(r => gateRule(r.name, r.table))
}

function allCells(): Cell[] {
  const out: Cell[] = []

  for (const rule of allRules()) {
    for (const background of [-1, 0, 1]) {
      out.push({ index: out.length, name: `${rule.name}/${background}`, rule, background, kind: splitCell(rule, background).kind })
    }
  }

  return out
}

/** every device start: width 1 or 2, both end cells off the background, in lexicographic order */
function deviceStarts(background: number): number[][] {
  const out: number[][] = []

  for (let width = 1; width <= DEVICE_WIDTH; width++) {
    for (let code = 0; code < 3 ** width; code++) {
      const tones = Array.from({ length: width }, (_, i) => (Math.floor(code / 3 ** (width - 1 - i)) % 3) - 1)

      if (tones[0] !== background && tones[width - 1] !== background) {
        out.push(tones)
      }
    }
  }

  return out
}

/** a collective: two devices on one window */
interface Collective {
  window: number[]
  region1: [number, number]
  region2: [number, number]
  start1: number[]
  start2: number[]
}

function collectiveOf(background: number, s1: readonly number[], s2: readonly number[], gap: number): Collective {
  const b = background
  const window = [b, ...s1, b, ...new Array<number>(gap).fill(b), b, ...s2, b]
  const w = window.length

  return {
    window,
    region1: [0, s1.length + 1],
    region2: [w - s2.length - 2, w - 1],
    start1: s1.map((_, i) => 1 + i),
    start2: s2.map((_, i) => w - s2.length - 1 + i),
  }
}

interface CollectivePlacement {
  cell: Cell
  s1: number[]
  s2: number[]
  gap: number
  parity: number
  inputs: [number, number]
  readRound: number
  readPosition: number
  prefer: number[]
}

interface CellCensusB {
  name: string
  kind: CellKind
  layouts: number
  runs: number
  joint: Map<number, CollectivePlacement>
  apart: Set<number>
  /** placements (layout, inputs, read, set) where the joint and apart decisions differ on some word */
  interacting: number
  placements: number
  digest: string
}

/** the read side of an apart decision, as the router computes it */
function sideOf(lo: number, c: Collective, readPosition: number): 0 | 1 {
  const distance = (region: readonly [number, number]): number => {
    const a = lo + region[0]
    const z = lo + region[1]

    return readPosition < a ? a - readPosition : readPosition > z ? readPosition - z : 0
  }

  return distance(c.region1) <= distance(c.region2) ? 0 : 1
}

function censusB(cells: readonly Cell[], identityOut: Set<number>, identityCounter: { runs: number }): CellCensusB[] {
  const identityRule = allRules().find(r => r.name === IDENTITY_RULE)!
  const identitySeen = new Set<string>()
  const out: CellCensusB[] = []
  const jointReads = new Int8Array(6)
  const apartReads = new Int8Array(6)

  for (const cell of cells) {
    const b = cell.background
    const starts = deviceStarts(b)
    const row: CellCensusB = { name: cell.name, kind: cell.kind, layouts: 0, runs: 0, joint: new Map(), apart: new Set(), interacting: 0, placements: 0, digest: '' }
    const digestParts: string[] = []

    for (const s1 of starts) {
      for (const s2 of starts) {
        for (const gap of GAPS) {
          for (const parity of [0, 1]) {
            const c = collectiveOf(b, s1, s2, gap)
            const lo = 2 + parity
            const w = c.window.length
            const alone1 = c.window.slice()
            const alone2 = c.window.slice()

            c.start2.forEach(o => (alone1[o] = b))
            c.start1.forEach(o => (alone2[o] = b))
            row.layouts++

            const found: number[] = []

            for (let i = c.region1[0]; i <= c.region1[1]; i++) {
              for (let j = c.region2[0]; j <= c.region2[1]; j++) {
                const joint = WORDS.map(([t, d]) => {
                  const x = c.window.slice()

                  x[i] = t
                  x[j] = d
                  row.runs++

                  return lineBrickRun({ rule: cell.rule, background: b, start: lo, window: x, rounds: R_READ })
                })
                const first = [0, 1].map(t => {
                  const x = alone1.slice()

                  x[i] = t
                  row.runs++

                  return lineBrickRun({ rule: cell.rule, background: b, start: lo, window: x, rounds: R_READ })
                })
                const second = [-1, 0, 1].map(d => {
                  const x = alone2.slice()

                  x[j] = d
                  row.runs++

                  return lineBrickRun({ rule: cell.rule, background: b, start: lo, window: x, rounds: R_READ })
                })
                const pad = joint[0]!.pad

                for (let round = 1; round <= R_READ; round++) {
                  for (let p = lo - 2 * round; p <= lo + w - 1 + 2 * round; p++) {
                    const side = sideOf(lo, c, p)

                    for (let k = 0; k < 6; k++) {
                      const [t, d] = WORDS[k]!

                      jointReads[k] = joint[k]!.frames[round]![p + pad]!
                      apartReads[k] = side === 0 ? first[t]!.frames[round]![p + pad]! : second[d + 1]!.frames[round]![p + pad]!
                    }

                    for (const set of TONE_SETS) {
                      let gJoint = 0
                      let gApart = 0

                      for (let k = 0; k < 6; k++) {
                        if (((set >> (jointReads[k]! + 1)) & 1) === 1) {
                          gJoint |= 1 << k
                        }

                        if (((set >> (apartReads[k]! + 1)) & 1) === 1) {
                          gApart |= 1 << k
                        }
                      }

                      row.placements++
                      row.interacting += gJoint === gApart ? 0 : 1
                      row.apart.add(gApart)

                      if (!row.joint.has(gJoint)) {
                        row.joint.set(gJoint, { cell, s1, s2, gap, parity, inputs: [i, j], readRound: round, readPosition: p, prefer: toneSet(set) })
                        found.push(gJoint)
                      }
                    }
                  }
                }

                // the identity census of the same window (D3 on collectives), once per window and inputs
                const ik = `${parity}|${c.window.join(',')}|${b}|${i}|${j}`

                if (!identitySeen.has(ik)) {
                  identitySeen.add(ik)

                  const runs = WORDS.map(([t, d]) => {
                    const x = c.window.slice()

                    x[i] = t
                    x[j] = d
                    identityCounter.runs++

                    return lineBrickRun({ rule: identityRule, background: b, start: lo, window: x, rounds: R_READ })
                  })

                  for (let round = 1; round <= R_READ; round++) {
                    for (let p = lo - 2 * round; p <= lo + w - 1 + 2 * round; p++) {
                      for (const set of TONE_SETS) {
                        let g = 0

                        for (let k = 0; k < 6; k++) {
                          if (((set >> (runs[k]!.frames[round]![p + pad]! + 1)) & 1) === 1) {
                            g |= 1 << k
                          }
                        }

                        identityOut.add(g)
                      }
                    }
                  }
                }
              }
            }

            digestParts.push(`${s1.join(',')}|${s2.join(',')}|${gap}|${parity}:${found.join('.')}`)
          }
        }
      }
    }

    row.digest = digestParts.join(';')
    out.push(row)
  }

  return out
}

// ---------------------------------------------------------------- the judge's search

interface GraphNode {
  state: MeshState
  h: number
  next: { key: string; cost: number }[] | null
}

class Graph {
  readonly nodes = new Map<string, GraphNode>()

  constructor(private readonly environment: LearningEnvironment) {}

  node(key: string, state: MeshState): GraphNode {
    let node = this.nodes.get(key)

    if (node === undefined) {
      node = { state, h: this.environment.base.estimate(state), next: null }
      this.nodes.set(key, node)
    }

    return node
  }

  successors(problem: Problem<MeshState>, key: string): { key: string; cost: number }[] {
    const node = this.nodes.get(key)!

    if (node.next === null) {
      node.next = []

      for (const operator of this.environment.operators) {
        if (operator.applicable(node.state)) {
          const cost = operator.cost(node.state)
          const state = operator.apply(node.state)
          const nextKey = problem.key(state)

          this.node(nextKey, state)
          node.next.push({ key: nextKey, cost })
        }
      }
    }

    return node.next
  }
}

const ruleTables = new Map(allRules().map(r => [r.name, r]))

function judgeRun(rule: string, layout: CollectiveLayout, word: readonly number[]): { value: number; frameHash: number } {
  const gate = ruleTables.get(rule)

  if (gate === undefined) {
    throw new Error(`collective: no rule ${rule}`)
  }

  const window = layout.window.slice()

  layout.inputs.forEach((offset, j) => {
    window[offset] = word[j]!
  })

  const run = lineBrickRun({ rule: gate, background: layout.background, start: layout.start, window, rounds: layout.readRound })
  const frame = run.frames[layout.readRound]!

  return { value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length) }
}

/** a device as the judge recomputes it from the claimed arguments: its metered layouts and, per word, the decision */
interface JudgeDevice {
  rule: string
  /** one layout (joint) or two (apart), in the order the router asks them */
  layouts: CollectiveLayout[]
  /** per layout, per word index: the word that layout is run on, its read and its final frame hash */
  runs: { word: number[]; value: number; frameHash: number }[][]
  /** per word index, the read the decision takes */
  decision: number[]
  prefer: Set<number>
}

function judgeDevice(args: CollectiveArgs): JudgeDevice {
  const prefer = new Set(args.prefer)

  if (args.mode === 'apart') {
    const [a1, a2] = apartLayouts(args)
    const runs1 = WORDS.map(([t]) => ({ word: [t], ...judgeRun(args.rule, a1, [t]) }))
    const runs2 = WORDS.map(([, d]) => ({ word: [d], ...judgeRun(args.rule, a2, [d]) }))
    const side = apartSide(args)

    return { rule: args.rule, layouts: [a1, a2], runs: [runs1, runs2], decision: (side === 0 ? runs1 : runs2).map(r => r.value), prefer }
  }

  const layout = jointLayout(args)
  const runs = WORDS.map(([t, d]) => ({ word: [t, d], ...judgeRun(args.rule, layout, [t, d]) }))

  return { rule: args.rule, layouts: [layout], runs: [runs], decision: runs.map(r => r.value), prefer }
}

const deviceFunction = (device: JudgeDevice): number => device.decision.reduce((g, value, w) => (device.prefer.has(value) ? g | (1 << w) : g), 0)

interface JudgeSearch {
  pathKeys: string[]
  expanded: number
  /** per layout: runs and the chain value */
  runs: number[]
  digests: number[]
  /** successor decisions where `compare` would have preferred differently */
  differing: number
}

/** A* with the preference bit from `g` (mask) or from a recomputed device; each layout's chain folded per request */
function judgeAStar(
  graph: Graph,
  problem: Problem<MeshState>,
  table: ReadonlyMap<string, number>,
  g: number,
  device: JudgeDevice | null,
  compare: JudgeDevice | null = null,
): JudgeSearch {
  const best = new Map<string, number>()
  const parent = new Map<string, string | null>()
  const closed = new Set<string>()
  const expandedKeys = new Set<string>()
  const open = new PriorityQueue<string>()
  const chains = device === null ? [] : device.layouts.map(layout => meshChain(device.rule, layout))
  const out: JudgeSearch = { pathKeys: [], expanded: 0, runs: chains.map(() => 0), digests: chains.map(c => c.value()), differing: 0 }
  const initialKey = problem.key(problem.initial)
  const root = graph.node(initialKey, problem.initial)

  let expansions = 0

  best.set(initialKey, 0)
  parent.set(initialKey, null)
  open.push(root.h, COLLECTIVE_SPREAD + root.h, initialKey)

  while (open.size > 0) {
    const entry = open.pop()!
    const key = entry.value
    const gKey = best.get(key)!

    if (entry.primary - (entry.secondary % COLLECTIVE_SPREAD) !== gKey || closed.has(key)) {
      continue
    }

    const node = graph.nodes.get(key)!

    if (problem.goal(node.state)) {
      for (let cursor: string | null = key; cursor !== null; cursor = parent.get(cursor)!) {
        out.pathKeys.push(cursor)
      }

      out.pathKeys.reverse()
      break
    }

    closed.add(key)
    expandedKeys.add(key)
    expansions++

    const batch = graph.successors(problem, key)
    const preferred: boolean[] = []
    const runs: MeshDigestRun[][] = chains.map(() => [])

    for (const next of batch) {
      const t = table.has(next.key) ? 1 : 0
      const d = Math.sign(graph.nodes.get(next.key)!.h - node.h)
      const w = collectiveWordIndex(t, d)

      if (device === null) {
        preferred.push(((g >> w) & 1) === 1)
      } else {
        preferred.push(device.prefer.has(device.decision[w]!))
        device.runs.forEach((perWord, l) => {
          const run = perWord[w]!

          runs[l]!.push({ keyHash: meshKeyHash(next.key), word: run.word, frameHash: run.frameHash, value: run.value })
          out.runs[l]!++
        })
      }

      if (compare !== null && compare.prefer.has(compare.decision[w]!) !== preferred[preferred.length - 1]) {
        out.differing++
      }
    }

    if (batch.length > 0) {
      chains.forEach((chain, l) => {
        out.digests[l] = chain.fold(expansions, runs[l]!)
      })
    }

    batch.forEach((next, i) => {
      const nextG = gKey + next.cost
      const known = best.get(next.key)

      if (known !== undefined && known <= nextG) {
        return
      }

      closed.delete(next.key)
      parent.set(next.key, key)
      best.set(next.key, nextG)

      const h = graph.nodes.get(next.key)!.h

      open.push(nextG + h, (preferred[i] ? 0 : COLLECTIVE_SPREAD) + h, next.key)
    })
  }

  out.expanded = expandedKeys.size

  return out
}

const sameLayout = (a: CollectiveLayout, c: { start: number; window: readonly number[]; inputs: readonly number[]; readPosition: number; readRound: number; background?: number }): boolean =>
  a.start === c.start &&
  a.readPosition === c.readPosition &&
  a.readRound === c.readRound &&
  a.background === c.background &&
  a.window.join(',') === Array.from(c.window).join(',') &&
  a.inputs.join(',') === Array.from(c.inputs).join(',')

/** '' when the grade is certified against the claimed arm, recomputed from the instance; the reason otherwise */
function certify(args: CollectiveArgs, grade: Grade<MeshState>, problem: Problem<MeshState>, graph: Graph, table: ReadonlyMap<string, number>): string {
  const device = judgeDevice(args)
  const search = judgeAStar(graph, problem, table, 0, device)
  const pathKeys = grade.solution.states.map(state => problem.key(state))

  if (pathKeys.join('|') !== search.pathKeys.join('|')) {
    return 'the path differs from the recomputed search'
  }

  if (grade.measured.expansions !== search.expanded) {
    return `measured expansions ${grade.measured.expansions}, recomputed ${search.expanded}`
  }

  const expected = device.layouts.map((layout, l) => ({ layout, runs: search.runs[l]!, digest: search.digests[l]! })).filter(e => e.runs > 0)
  const metered = grade.mesh.layouts

  if (metered.length !== expected.length) {
    return `${metered.length} metered layouts, ${expected.length} expected`
  }

  for (let i = 0; i < expected.length; i++) {
    const want = expected[i]!
    const got = metered[i]!

    if (got.layout.background !== args.background) {
      return `entry ${i} metered on background ${String(got.layout.background)}, the cell's is ${args.background}`
    }

    if (got.rule !== args.rule || !sameLayout(want.layout, got.layout)) {
      return `entry ${i}: rule or layout differs from the recomputed device`
    }

    if (got.runs !== want.runs || got.rounds !== want.runs * args.readRound || got.frameDigest !== want.digest) {
      return `entry ${i}: metered runs ${got.runs}, rounds ${got.rounds}, digest ${got.frameDigest}; recomputed ${want.runs}, ${want.runs * args.readRound}, ${want.digest}`
    }
  }

  return ''
}

// ---------------------------------------------------------------- the arms of Part B

type ArmB = 'joint' | 'apart' | 'knockout' | 'wire' | 'smuggler' | 'wrongWords'

const ARMS_B: readonly ArmB[] = ['joint', 'apart', 'knockout', 'wire', 'smuggler', 'wrongWords']
const HONEST_B: readonly ArmB[] = ['joint', 'apart', 'knockout', 'wire']

type BaseArgs = Omit<CollectiveArgs, 'preprocessing'>

function armsFor(gCol: number, gWire: number, placement: CollectivePlacement): Record<ArmB, BaseArgs> {
  const c = collectiveOf(placement.cell.background, placement.s1, placement.s2, placement.gap)
  const joint: BaseArgs = {
    id: 'collective-joint',
    rule: placement.cell.rule.name,
    background: placement.cell.background,
    windowLo: 2 + placement.parity,
    window: c.window,
    region1: c.region1,
    region2: c.region2,
    start1: c.start1,
    start2: c.start2,
    inputs: placement.inputs,
    readPosition: placement.readPosition,
    readRound: placement.readRound,
    prefer: placement.prefer,
    mode: 'joint' as CollectiveMode,
    mask: gCol,
  }
  // the wire: the identity device [b, b] at cell 2, t at offset 0, d at offset 1, reading the input g_wire depends on
  const noT = [-1, 0, 1].every(d => ((gWire >> collectiveWordIndex(0, d)) & 1) === ((gWire >> collectiveWordIndex(1, d)) & 1))
  const wireSets: number[] = []

  for (const tone of [-1, 0, 1]) {
    const w = noT ? collectiveWordIndex(0, tone) : collectiveWordIndex(tone === 1 ? 1 : 0, -1)

    if ((noT || tone !== -1) && ((gWire >> w) & 1) === 1) {
      wireSets.push(tone)
    }
  }

  const b = placement.cell.background

  return {
    joint,
    apart: { ...joint, id: 'collective-apart', mode: 'apart' },
    knockout: { ...joint, id: 'collective-knockout', rule: IDENTITY_RULE },
    wire: {
      ...joint,
      id: 'collective-wire',
      rule: IDENTITY_RULE,
      windowLo: 2,
      window: [b, b],
      region1: [0, 0],
      region2: [1, 1],
      start1: [],
      start2: [],
      inputs: [0, 1],
      readPosition: noT ? 3 : 2,
      readRound: 1,
      prefer: wireSets,
      mask: gWire,
    },
    smuggler: { ...joint, mode: 'code' },
    wrongWords: { ...joint, mode: 'wrongWords' },
  }
}

const baseHeuristic = (environment: LearningEnvironment) => ({ id: environment.base.id, estimate: 'base', preprocessing: environment.base.preprocessing })
const aStarPlain = (environment: LearningEnvironment): CandidateSpec =>
  candidate(SOLVER_CATALOG, 'aStar', { heuristic: baseHeuristic(environment) }, { base: environment.base.estimate })
const valueTable = candidate('code/intelligence/experience/learner/catalog', 'valueTable')
const breadthFirst = candidate(SOLVER_CATALOG, 'breadthFirst')

function armSpec(base: BaseArgs, environment: LearningEnvironment, learned: LearningGrade<MeshState>): CandidateSpec {
  const args: CollectiveArgs = { ...base, preprocessing: addPreprocessing(environment.base.preprocessing, learned.charge) }

  return candidate(COLLECTIVE_MODULE, 'collectiveRouter', args, { base: environment.base.estimate, table: learned.table })
}

const plain = (base: BaseArgs): CollectiveArgs => ({ ...base, preprocessing: NO_PREPROCESSING })
const runsOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.runs, 0)
const roundsOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.rounds, 0)
const pairUpdatesOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.pairUpdates, 0)

interface Row { starts: number; expansions: number; runs: number; rounds: number; pairUpdates: number }

const NO_ROW: Row = { starts: 0, expansions: 0, runs: 0, rounds: 0, pairUpdates: 0 }
const addRow = (a: Row, c: Row): Row => ({
  starts: a.starts + c.starts,
  expansions: a.expansions + c.expansions,
  runs: a.runs + c.runs,
  rounds: a.rounds + c.rounds,
  pairUpdates: a.pairUpdates + c.pairUpdates,
})

type SolverB = 'aStar' | ArmB

const SOLVERS_B: readonly SolverB[] = ['aStar', ...ARMS_B]

// ================================================================ the experiment

export default experiment({
  id: 'intelligence/collective',
  code: 'E-CMP-0097',
  title:
    'intelligence level 8, slice 1: whether many entities together grow in problem-solving capacity; (A) three external solvers per environment of family A on the four degree-matched pairs, each discovering and selecting macros on its own starts, against the same solvers sharing their kept operators (union), only the others\' operators, one pooled selection and the union across a matched pair, with family H harm violations and per-entity gains kept apart from net; (B) two mesh devices on the line, each holding one input of level 7\'s tie-break word, run together and apart, the census of the preference functions each realizes on the 56 quiet cells, and the selected collective against the same devices apart, its identity knockout, the best wire and level-1 A*, every round metered by the outside evaluator and recomputed by a judge',
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

    // ============================================================ Part A
    const fieldsA = fieldsOf(PAIRS.flatMap(pair => [...pair]))
    const resultsA = fieldsA.map(runEnvironmentA)

    resultsA.forEach(r => r.failures.forEach(fail))

    const byId = new Map(resultsA.map(r => [r.field.environment.id, r]))
    const transferLines: string[] = []
    const transfer = { toFlat: { cross: 0, alone: 0, count: 0 }, toHyperbolic: { cross: 0, alone: 0, count: 0 } }

    for (const [hyperbolic, flat] of PAIRS) {
      for (const kind of KINDS) {
        const a = byId.get(`${kind}-${hyperbolic}`)
        const b = byId.get(`${kind}-${flat}`)

        if (a === undefined || b === undefined) {
          continue
        }

        runCross(a, b, fail)

        for (const [from, to] of [
          [a, b],
          [b, a],
        ] as const) {
          const sum = (arm: ArmA | 'cross'): number => to.entities.reduce((s, e) => s + e.runs[arm].work.elementary, 0)
          const crossAdds = sum('union') - sum('cross')
          const alone = sum('none') - foreignGeometry(from, to, fail).work.elementary
          const bucket = HYPERBOLIC.has(geometryOf(from.field.environment.id)) ? transfer.toFlat : transfer.toHyperbolic

          bucket.cross += crossAdds
          bucket.alone += alone
          bucket.count++
          transferLines.push(
            `${from.field.environment.id} to ${to.field.environment.id}: the other geometry's operators add ${crossAdds} primitive calls to the target's union (target union gain ${sum('none') - sum('union')}), its union alone gains ${alone}`,
          )
        }
      }
    }

    // capacity, cost, harm
    const entityRows = resultsA.flatMap(r => r.entities.map((e, k) => ({ id: `${r.field.environment.id}#${k}`, e })))
    const armWork = (arm: ArmA | 'cross'): Work => entityRows.reduce((sum, row) => addWork(sum, row.e.runs[arm].work), NO_WORK)
    const armOver = (arm: ArmA | 'cross'): number => entityRows.reduce((sum, row) => sum + row.e.runs[arm].overBudget, 0)
    const armWrong = (arm: ArmA | 'cross'): number => entityRows.reduce((sum, row) => sum + row.e.runs[arm].wrong, 0)
    const armMacro = (arm: ArmA | 'cross'): number => entityRows.reduce((sum, row) => sum + row.e.runs[arm].usingMacro, 0)
    const none = armWork('none')
    const gainOf = (arm: ArmA | 'cross'): Work => subWork(none, armWork(arm))
    const discoveryCalls = entityRows.reduce((sum, row) => sum + row.e.discovery.operatorCalls, 0)
    const isolatedSelection = entityRows.reduce((sum, row) => sum + row.e.selection.operatorCalls, 0)
    const pooledSelection = resultsA.reduce((sum, r) => sum + r.pooledSelection.operatorCalls, 0)
    const spent = { isolated: discoveryCalls + isolatedSelection, union: discoveryCalls + isolatedSelection, pooled: discoveryCalls + pooledSelection }
    const ratio = (gain: number, cost: number): number => (cost > 0 ? gain / cost : 0)
    const fixed = (value: number): number => Number(value.toFixed(6))

    const harmOf = (arm: ArmA | 'cross') => {
      const gains = entityRows.map(row => row.e.runs.isolated.work.elementary - row.e.runs[arm].work.elementary)
      const harmed = entityRows.filter((_, i) => gains[i]! < 0).map(row => row.id)

      return {
        violations: harmed.length,
        better: gains.filter(g => g > 0).length,
        equal: gains.filter(g => g === 0).length,
        worst: Math.min(0, ...gains),
        min: Math.min(...gains),
        harmed,
      }
    }

    const harm = { union: harmOf('union'), foreign: harmOf('foreign'), pooled: harmOf('pooled'), cross: harmOf('cross') }

    // A2: over budget in none, isolated, union
    for (const arm of ['none', 'isolated', 'union'] as const) {
      if (armOver(arm) > 0) {
        fail(`A2: ${armOver(arm)} ${arm} held-out solves over the budget`)
      }
    }

    // A3: the recount
    const recounted = resultsA.filter(r => r.recountMatches !== null)
    const recountMismatches = recounted.filter(r => r.recountMatches === false).length

    if (recountMismatches > 0) {
      fail(`A3: the evaluator's primitive count of the union differs from the recount on ${recountMismatches} environments`)
    }

    // A4: the harm meter can fire (none against isolated)
    const helped = entityRows.filter(row => row.e.runs.isolated.work.elementary < row.e.runs.none.work.elementary).length
    const flaggedNone = entityRows.filter(row => row.e.runs.none.work.elementary - row.e.runs.isolated.work.elementary > 0).length

    if (helped === 0 || flaggedNone !== helped) {
      fail(`A4: the harm meter flags ${flaggedNone} entities on the no-library arm, ${helped} were helped by their own library`)
    }

    // A5: a discoverer hiding one operator call is rejected
    let hiddenRejected = 0
    let hiddenTried = 0

    for (const r of resultsA.slice(0, 4)) {
      hiddenTried++

      const hiding = evaluateLearning({
        build: candidate('code/intelligence/control/learner-controls', 'hidingOneCallDiscoverer'),
        teacher: aStarOn(r.field.environment.base),
        training: r.field.entities[0]!.slice,
        operators: r.field.environment.operators,
      })

      hiddenRejected += hiding.accepted ? 0 : 1
    }

    if (hiddenRejected !== hiddenTried) {
      fail(`A5: the hiding discoverer was rejected on ${hiddenRejected} of ${hiddenTried}`)
    }

    // A6: determinism of one pair
    const againA = fieldsOf(['{4,5}', '{4,4}']).map(runEnvironmentA)
    const againIds = new Set(againA.map(r => r.field.environment.id))
    const deterministicA = againA.length > 0 && digestA(againA) === digestA(resultsA.filter(r => againIds.has(r.field.environment.id)))

    if (!deterministicA) {
      fail('A6: a second run of the pair {4,5}/{4,4} gave different numbers')
    }

    const gainUnion = gainOf('union').elementary
    const gainIsolated = gainOf('isolated').elementary
    const creditA = gainUnion - gainIsolated
    const failuresBeforeB = failures.length
    const verdictA =
      failuresBeforeB === 0 && creditA > 0 && harm.union.violations === 0
        ? 'construction'
        : creditA > 0 && harm.union.violations > 0
          ? 'harmful gain'
          : 'bounded absence'

    // ============================================================ Part B
    const cells = allCells()
    const kindCount = (kind: CellKind): number => cells.filter(c => c.kind === kind).length

    if (kindCount('species') !== 24 || kindCount('reactive') !== 32 || kindCount('live_vacuum') !== 16) {
      fail(`B1: split ${kindCount('species')} species, ${kindCount('reactive')} reactive, ${kindCount('live_vacuum')} live vacuum`)
    }

    if (F1.length !== 10) {
      fail(`F1 holds ${F1.length} functions, 10 expected`)
    }

    // Part R
    const prepared = learningEnvironments()
      .filter(e => e.training.length > 0 && e.heldOut.length > 0)
      .map(environment => {
        const learned = evaluateLearning({ build: valueTable, teacher: aStarPlain(environment), training: environment.training, operators: environment.operators })

        if (!learned.accepted) {
          fail(`${environment.id}: the value table was rejected: ${learned.violations[0]}`)
        }

        return { environment, learned, graph: new Graph(environment) }
      })

    const cTrain = new Array<number>(FUNCTIONS).fill(0)
    const cTest = new Array<number>(FUNCTIONS).fill(0)

    for (const { environment, learned, graph } of prepared) {
      for (let g = 0; g < FUNCTIONS; g++) {
        for (const problem of environment.training) {
          cTrain[g] = cTrain[g]! + judgeAStar(graph, problem, learned.table, g, null).expanded
        }

        for (const problem of environment.heldOut) {
          cTest[g] = cTest[g]! + judgeAStar(graph, problem, learned.table, g, null).expanded
        }
      }
    }

    const argmin = (list: readonly number[], score: readonly number[]): number => list.reduce((bestG, g) => (score[g]! < score[bestG]! ? g : bestG), list[0]!)
    const allFunctions = Array.from({ length: FUNCTIONS }, (_, g) => g)
    const twoInput = allFunctions.filter(g => !oneInput(g))
    const bestTest = argmin(allFunctions, cTest)
    const bestF1Test = argmin(F1, cTest)
    const bestTrain = argmin(allFunctions, cTrain)
    const bestF1Train = argmin(F1, cTrain)
    const gWire = bestF1Train

    if (cTest[0] !== cTest[FUNCTIONS - 1]) {
      fail(`the two constant functions differ on held-out starts (${cTest[0]}, ${cTest[FUNCTIONS - 1]})`)
    }

    // Part C, the census
    const quiet = cells.filter(c => c.kind !== 'live_vacuum')
    const identity = new Set<number>()
    const identityCounter = { runs: 0 }
    const census = censusB(quiet, identity, identityCounter)
    const rJ = new Set<number>()
    const rA = new Set<number>()

    census.forEach(row => {
      row.joint.forEach((_, g) => rJ.add(g))
      row.apart.forEach(g => rA.add(g))
    })

    // B2, B3
    const identitySorted = [...identity].sort((a, c) => a - c)

    if (identitySorted.join(',') !== F1.join(',')) {
      fail(`B2: the identity census realizes ${identitySorted.length} functions (${identitySorted.filter(g => !oneInput(g)).length} outside F1)`)
    }

    const apartOutside = [...rA].filter(g => !oneInput(g))

    if (apartOutside.length > 0) {
      fail(`B3: the apart census realizes ${apartOutside.length} functions outside F1 (${apartOutside.join(',')})`)
    }

    // determinism of the census
    const twoCells = quiet.filter(c => c.name === 'id.CBA.id/0' || c.name === 'id.BCA.id/1')
    const againCensus = censusB(twoCells, new Set(), { runs: 0 })
    const firstCensus = census.filter(c => c.name === 'id.CBA.id/0' || c.name === 'id.BCA.id/1')

    if (againCensus.length !== 2 || againCensus.some((c, i) => c.digest !== firstCensus[i]?.digest)) {
      fail('B10: a second census of two cells gave a different digest')
    }

    // selection
    const rJTwo = [...rJ].filter(g => !oneInput(g)).sort((a, c) => a - c)

    if (rJTwo.length === 0) {
      fail('no collective realizes a function of both inputs: the selection has nothing to pick')

      return verdict({ status: 'fail', claim: 'intelligence level 8, slice 1: the census found no interacting collective', metrics, control, notes: failures.join('; ') })
    }

    const gCol = argmin(rJTwo, cTrain)
    const chosenRow = census.find(row => row.joint.has(gCol))!
    const placement = chosenRow.joint.get(gCol)!
    const arms = armsFor(gCol, gWire, placement)
    const devices = Object.fromEntries(HONEST_B.map(name => [name, judgeDevice(plain(arms[name]))])) as Record<'joint' | 'apart' | 'knockout' | 'wire', JudgeDevice>
    const fApart = deviceFunction(devices.apart)
    const fKnockout = deviceFunction(devices.knockout)

    // B4: runners agree; the joint device realizes g_col under the evaluator's runner
    let runnerDifferences = 0

    for (const name of HONEST_B) {
      const device = devices[name]

      device.layouts.forEach((layout, l) => {
        device.runs[l]!.forEach(run => {
          const line = new Int8Array(meshLineLength(layout))
          const evaluator = meshLineRun(ruleTables.get(device.rule)!.table, layout, run.word, line)

          if (evaluator.value !== run.value || evaluator.frameHash !== run.frameHash) {
            runnerDifferences++
          }
        })
      })
    }

    if (runnerDifferences > 0) {
      fail(`B4: lineBrickRun and the evaluator's meshLineRun differ on ${runnerDifferences} runs`)
    }

    if (deviceFunction(devices.joint) !== gCol) {
      fail(`B4: the joint device realizes ${deviceFunction(devices.joint)}, selected ${gCol}`)
    }

    if (deviceFunction(devices.wire) !== gWire) {
      fail(`B4: the wire realizes ${deviceFunction(devices.wire)}, selected ${gWire}`)
    }

    // B9 (device functions)
    if (fApart === gCol || fKnockout === gCol || !oneInput(fApart)) {
      fail(`B9: apart realizes ${fApart}, knockout ${fKnockout}, joint ${gCol}: a knockout that changes nothing, or apart outside F1`)
    }

    const bundled = candidateBundle(COLLECTIVE_MODULE, 'collectiveRouter', 'solver')

    if (!bundled.ok) {
      fail(`B10: the collectiveRouter bundle was refused: ${bundled.reason}`)
    }

    // Part L
    const rows = Object.fromEntries(SOLVERS_B.map(name => [name, NO_ROW])) as Record<SolverB, Row>
    const certified = Object.fromEntries(ARMS_B.map(name => [name, 0])) as Record<ArmB, number>

    let heldOut = 0
    let judgeEqualsAStar = 0
    let smugglerExternal = 0
    let smugglerSame = 0
    let smugglerAccepted = 0
    let wrongAsked = 0
    let wrongRefused = 0
    let differing = 0
    let charge = 0

    for (const { environment, learned, graph } of prepared) {
      charge += learned.charge.expansions

      for (const problem of environment.heldOut) {
        heldOut++

        const truth = environment.oracle[environment.startOf.get(problem.id)!]!
        const bfs = evaluate(breadthFirst, problem, environment.operators)
        const grades = { aStar: evaluate(aStarPlain(environment), problem, environment.operators) } as Record<SolverB, Grade<MeshState>>

        for (const name of ARMS_B) {
          grades[name] = evaluate(armSpec(arms[name], environment, learned), problem, environment.operators)
        }

        if (!bfs.solved || bfs.violations.length > 0 || bfs.cost !== truth) {
          fail(`${problem.id} BFS solved ${bfs.solved}, cost ${bfs.cost}, oracle ${truth}`)
        }

        // B5
        for (const name of SOLVERS_B) {
          const grade = grades[name]

          if (!grade.solved || grade.violations.length > 0 || grade.cost !== bfs.cost) {
            fail(`${problem.id} ${name}: solved ${grade.solved}, cost ${grade.cost} (BFS ${bfs.cost}), ${grade.violations[0] ?? 'no violation'}`)
          }
        }

        if (judgeAStar(graph, problem, learned.table, 0, null).expanded === grades.aStar.measured.expansions) {
          judgeEqualsAStar++
        }

        // B6
        for (const name of HONEST_B) {
          const reason = certify(plain(arms[name]), grades[name], problem, graph, learned.table)

          if (reason === '') {
            certified[name]++
          } else {
            fail(`${problem.id} ${name} not certified: ${reason}`)
          }
        }

        // B9: decisions where apart would prefer differently along the joint search
        differing += judgeAStar(graph, problem, learned.table, 0, devices.joint, devices.apart).differing

        // B7
        const smuggler = grades.smuggler

        smugglerExternal += smuggler.mesh.layouts.length === 0 ? 1 : 0
        smugglerSame += smuggler.measured.expansions === grades.joint.measured.expansions ? 1 : 0
        smugglerAccepted += smuggler.solved && smuggler.violations.length === 0 ? 1 : 0
        certified.smuggler += smuggler.mesh.layouts.length === 0 ? 0 : 1

        // B8
        if (runsOf(grades.wrongWords) > 0) {
          wrongAsked++

          const refused = certify(plain(arms.joint), grades.wrongWords, problem, graph, learned.table) !== ''

          wrongRefused += refused ? 1 : 0
          certified.wrongWords += refused ? 0 : 1
        }

        for (const name of SOLVERS_B) {
          const grade = grades[name]

          rows[name] = addRow(rows[name], { starts: 1, expansions: grade.measured.expansions, runs: runsOf(grade), rounds: roundsOf(grade), pairUpdates: pairUpdatesOf(grade) })
        }
      }
    }

    if (judgeEqualsAStar !== heldOut) {
      fail(`B5: the judge's constant-function A* equals level-1 A* on ${judgeEqualsAStar} of ${heldOut}`)
    }

    if (smugglerExternal !== heldOut || smugglerSame !== heldOut || smugglerAccepted !== heldOut) {
      fail(`B7: smuggler external ${smugglerExternal}, same expansions ${smugglerSame}, accepted ${smugglerAccepted}, of ${heldOut}`)
    }

    if (wrongAsked === 0 || wrongRefused !== wrongAsked) {
      fail(`B8: the wrong-words forger was refused on ${wrongRefused} of ${wrongAsked} solves that asked a run`)
    }

    if (differing === 0) {
      fail('B9: apart prefers exactly as joint on every successor decision of every held-out solve')
    }

    // B10, determinism of a solve
    const probe = prepared.find(p => p.environment.id === 'maze-{4,4}') ?? prepared[0]!
    const solveDigest = (): string =>
      probe.environment.heldOut
        .slice(0, 2)
        .map(problem => {
          const grade = evaluate(armSpec(arms.joint, probe.environment, probe.learned), problem, probe.environment.operators)

          return `${grade.measured.expansions}:${grade.cost}:${JSON.stringify(grade.mesh)}`
        })
        .join(';')

    if (solveDigest() !== solveDigest()) {
      fail('B10: two solves of the joint arm gave different grades')
    }

    const { files, findings } = scanIntelligenceSources(BASE, [SELF])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    const rivals: readonly SolverB[] = ['apart', 'knockout', 'wire', 'aStar']
    const rivalBest = Math.min(...rivals.map(name => rows[name].expansions))
    const creditB = rivalBest - rows.joint.expansions
    const templateNoGo = cTest[bestTest] === cTest[bestF1Test]
    const ok = failures.length === 0
    const verdictB = ok && !oneInput(gCol) && creditB > 0 ? 'construction' : templateNoGo ? 'sharp no-go for the template' : 'bounded absence'
    const headroomTest = cTest[bestF1Test]! - cTest[bestTest]!
    const headroomTrain = cTrain[bestF1Train]! - cTrain[bestTrain]!
    const species = census.filter(c => c.kind === 'species')
    const reactive = census.filter(c => c.kind === 'reactive')
    const twoOf = (list: readonly CellCensusB[]): number => new Set(list.flatMap(c => [...c.joint.keys()].filter(g => !oneInput(g)))).size
    const sumB = (pick: (c: CellCensusB) => number, list: readonly CellCensusB[] = census): number => list.reduce((s, c) => s + pick(c), 0)

    // ---- metrics
    metrics.environmentsA = resultsA.length
    metrics.entitiesA = entityRows.length
    metrics.heldOutA = resultsA.reduce((s, r) => s + r.field.test.length, 0)
    metrics.candidatesA = entityRows.reduce((s, row) => s + row.e.candidates, 0)
    metrics.keptIsolated = entityRows.reduce((s, row) => s + row.e.kept.length, 0)
    metrics.keptUnion = resultsA.reduce((s, r) => s + r.union.steps.length, 0)
    metrics.keptPooled = resultsA.reduce((s, r) => s + r.pooledKept.length, 0)
    metrics.noneElementary = none.elementary

    for (const arm of [...ARMS_A, 'cross'] as const) {
      metrics[`${arm}Elementary`] = armWork(arm).elementary
      metrics[`${arm}Decisions`] = armWork(arm).calls
      metrics[`${arm}ExpansionsA`] = armWork(arm).expansions
      metrics[`${arm}GainElementary`] = gainOf(arm).elementary
      metrics[`${arm}OverBudget`] = armOver(arm)
      metrics[`${arm}Wrong`] = armWrong(arm)
      metrics[`${arm}UsingMacro`] = armMacro(arm)
    }

    metrics.discoveryCalls = discoveryCalls
    metrics.isolatedSelectionCalls = isolatedSelection
    metrics.pooledSelectionCalls = pooledSelection
    metrics.isolatedL = fixed(ratio(gainIsolated, spent.isolated))
    metrics.unionL = fixed(ratio(gainUnion, spent.union))
    metrics.pooledL = fixed(ratio(gainOf('pooled').elementary, spent.pooled))
    metrics.isolatedLDiscoveryOnly = fixed(ratio(gainIsolated, discoveryCalls))
    metrics.unionLDiscoveryOnly = fixed(ratio(gainUnion, discoveryCalls))
    metrics.creditA = creditA
    metrics.unionHarmViolations = harm.union.violations
    metrics.unionEntitiesBetter = harm.union.better
    metrics.unionEntitiesEqual = harm.union.equal
    metrics.unionWorstLoss = harm.union.worst
    metrics.foreignHarmViolations = harm.foreign.violations
    metrics.pooledHarmViolations = harm.pooled.violations
    metrics.crossHarmViolations = harm.cross.violations
    metrics.transferHyperbolicToFlatCross = transfer.toFlat.cross
    metrics.transferHyperbolicToFlatAlone = transfer.toFlat.alone
    metrics.transferFlatToHyperbolicCross = transfer.toHyperbolic.cross
    metrics.transferFlatToHyperbolicAlone = transfer.toHyperbolic.alone
    metrics.recountEnvironments = recounted.length
    metrics.recountMismatches = recountMismatches
    metrics.deterministicA = deterministicA ? 1 : 0
    metrics.verdictAConstruction = verdictA === 'construction' ? 1 : 0
    metrics.verdictAHarmfulGain = verdictA === 'harmful gain' ? 1 : 0
    control.harmMeterHelped = helped
    control.harmMeterFlaggedNone = flaggedNone
    control.hiddenCallTried = hiddenTried
    control.hiddenCallRejected = hiddenRejected

    metrics.quietCells = quiet.length
    metrics.collectiveLayouts = sumB(c => c.layouts)
    metrics.censusRuns = sumB(c => c.runs)
    metrics.identityRuns = identityCounter.runs
    metrics.censusPlacements = sumB(c => c.placements)
    metrics.interactingPlacements = sumB(c => c.interacting)
    metrics.jointFunctions = rJ.size
    metrics.jointTwoInput = rJTwo.length
    metrics.apartFunctions = rA.size
    metrics.apartOutsideF1 = apartOutside.length
    metrics.identityFunctions = identitySorted.length
    metrics.speciesTwoInput = twoOf(species)
    metrics.reactiveTwoInput = twoOf(reactive)
    metrics.levelOneTest = cTest[0]!
    metrics.bestTest = cTest[bestTest]!
    metrics.bestF1Test = cTest[bestF1Test]!
    metrics.bestTestFunction = bestTest
    metrics.bestTrain = cTrain[bestTrain]!
    metrics.bestF1Train = cTrain[bestF1Train]!
    metrics.headroomTest = headroomTest
    metrics.headroomTrain = headroomTrain
    metrics.gCol = gCol
    metrics.gColTrain = cTrain[gCol]!
    metrics.gColTest = cTest[gCol]!
    metrics.gWire = gWire
    metrics.gWireTrain = cTrain[gWire]!
    metrics.gWireTest = cTest[gWire]!
    metrics.apartFunction = fApart
    metrics.knockoutFunction = fKnockout
    metrics.heldOutB = heldOut
    metrics.creditB = creditB
    metrics.differingDecisions = differing
    metrics.runnerDifferences = runnerDifferences
    metrics.tableCharge = charge

    for (const name of SOLVERS_B) {
      metrics[`${name}Expansions`] = rows[name].expansions
      metrics[`${name}Runs`] = rows[name].runs
      metrics[`${name}Rounds`] = rows[name].rounds
      metrics[`${name}PairUpdates`] = rows[name].pairUpdates
    }

    for (const name of ARMS_B) {
      metrics[`${name}Certified`] = certified[name]
    }

    control.smugglerExternal = smugglerExternal
    control.smugglerSameExpansions = smugglerSame
    control.smugglerEvaluatorAccepted = smugglerAccepted
    control.wrongWordsAsked = wrongAsked
    control.wrongWordsRefused = wrongRefused
    metrics.sourceFilesScanned = files.length

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const p = placement
    const entityLines = entityRows
      .map(row => `${row.id} ${ARMS_A.map(arm => `${arm} ${row.e.runs[arm].work.elementary}`).join(' ')} cross ${row.e.runs.cross.work.elementary} (kept ${row.e.kept.length} of ${row.e.candidates})`)
      .join('; ')
    const ceilingRows = allFunctions.map(g => `${g}${oneInput(g) ? '*' : ''}:${cTrain[g]}/${cTest[g]}`).join(' ')
    const cellRows = census.map(c => `${c.name} ${c.kind}: joint ${c.joint.size} (two-input ${[...c.joint.keys()].filter(g => !oneInput(g)).length}), apart ${c.apart.size}, interacting ${c.interacting} of ${c.placements}`).join('; ')
    const textA =
      verdictA === 'construction'
        ? `a construction: sharing kept operators (union) gains ${gainUnion} held-out primitive calls against ${gainIsolated} isolated at the same metered cost, credit ${creditA}, with 0 harm violations`
        : verdictA === 'harmful gain'
          ? `a harmful gain: union gains ${gainUnion} against ${gainIsolated} isolated (credit ${creditA}) but ${harm.union.violations} entities do worse than alone`
          : `a bounded absence: union gains ${gainUnion} held-out primitive calls against ${gainIsolated} isolated at the same metered cost (credit ${creditA}), ${harm.union.violations} harm violations`
    const textB =
      verdictB === 'construction'
        ? `a construction lead: the collective beats every rival by ${creditB} expansions (to be traced before it is written as a gain)`
        : verdictB === 'sharp no-go for the template'
          ? `a sharp no-go for the template: the best of all 64 functions on held-out starts (${cTest[bestTest]}) is no better than the best function of one input (${cTest[bestF1Test]}), so no collective of any size beats the best apart arrangement (C1, C2); credit ${creditB}`
          : `a bounded absence: interaction can buy at most ${headroomTest} held-out expansions (${cTest[bestTest]} against ${cTest[bestF1Test]}; ${headroomTrain} on training starts), and the selected collective's credit is ${creditB}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 8, slice 1. (A) ${textA}; per unit cost L ${ratio(gainIsolated, spent.isolated).toFixed(6)} isolated, ${ratio(gainUnion, spent.union).toFixed(6)} union, ${ratio(gainOf('pooled').elementary, spent.pooled).toFixed(6)} pooled (its own selection ${pooledSelection} calls against ${isolatedSelection}); ${entityRows.length} entities in ${resultsA.length} environments, union better for ${harm.union.better}, equal for ${harm.union.equal}, worse for ${harm.union.violations} (largest loss ${-harm.union.worst}); the other geometry's operators add ${transfer.toFlat.cross} primitive calls hyperbolic to flat and ${transfer.toHyperbolic.cross} flat to hyperbolic, the other geometry's union alone gains ${transfer.toFlat.alone} and ${transfer.toHyperbolic.alone}; every held-out solve optimal. (B) ${textB}; two devices run together realize ${rJTwo.length} functions of both inputs over ${metrics.collectiveLayouts} collectives on ${quiet.length} quiet cells (species ${twoOf(species)}, reactive ${twoOf(reactive)}), run apart ${apartOutside.length} (C2), the identity collective exactly the ${identitySorted.length} one-input functions; held-out expansions joint ${rows.joint.expansions}, apart ${rows.apart.expansions}, knockout ${rows.knockout.expansions}, wire ${rows.wire.expansions}, level-1 A* ${rows.aStar.expansions} on ${heldOut} starts; every honest solve certified by a judge recomputing device reads, path, expansions, background and SHA-256 chains, a smuggler external on ${smugglerExternal} of ${heldOut}, a wrong-words forger refused on ${wrongRefused} of ${wrongAsked}; growth in the mesh stays assembled from M10 (sharp in species cells), level 6, level 7 and M11 (a higher-scale collective is a declared contract)`,
      metrics,
      control,
      notes: `L2. Part A per entity (held-out primitive calls by arm): ${entityLines}. Transfer: ${transferLines.join('; ')}. Union harm: ${harm.union.harmed.join(', ') || 'none'}; foreign harm ${harm.foreign.violations}, pooled ${harm.pooled.violations}, cross ${harm.cross.violations}. Cost: discovery ${discoveryCalls} calls, isolated selection ${isolatedSelection}, pooled selection ${pooledSelection}. Recount ${recounted.length - recountMismatches} of ${recounted.length}. Part B selected: g_col ${gCol} (train ${cTrain[gCol]}, held-out ${cTest[gCol]}) from ${p.cell.name}, s1 [${p.s1.join(',')}], s2 [${p.s2.join(',')}], gap ${p.gap}, parity ${p.parity}, inputs ${p.inputs.join(',')}, read ${p.readPosition} at round ${p.readRound}, prefer {${p.prefer.join(',')}}; apart realizes ${fApart}, knockout ${fKnockout}; g_wire ${gWire} (train ${cTrain[gWire]}, held-out ${cTest[gWire]}); differing successor decisions ${differing}. Ceiling (function: train / held-out; * one input): ${ceilingRows}. Per arm (expansions / runs / rounds / pair updates): ${SOLVERS_B.map(n => `${n} ${rows[n].expansions} / ${rows[n].runs} / ${rows[n].rounds} / ${rows[n].pairUpdates}`).join('; ')}. Certified: ${ARMS_B.map(n => `${n} ${certified[n]}`).join(', ')}. Census: ${cellRows}. ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
