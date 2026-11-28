// Intelligence level 3: the solver discovers reusable operators. A deterministic discoverer reads verified A* paths on
// family A's maze and obstacle fields and proposes macros, contiguous runs of steps that recur (the source's sections
// 12 and 15.5: a found path fragment composed into one operator). The outside evaluator keeps a macro only when it cuts
// the primitive work of A* on validation starts by more than the macro's share of the whole generation's discovery
// cost, teacher solves included, then measures the kept library on test starts no step of learning used, on its own
// geometry and, unchanged, on the degree-matched control (decision 001 pairs {4,5}/{4,4}, {6,4}/{6,3}, {3,7}/{3,6},
// {3,4,3,4}/{3,4,3,3}), both ways. Three generations: each teaches with the library so far, so later macros are built
// from earlier ones, and the learning rate L = test gain / charge is read per generation.
//
// Two currencies, both measured by the evaluator. Planning decisions: one call for every operator consulted, a macro
// counting one (the source's section 12 cost, branching times depth). Primitive work: every call that reaches a
// primitive operator, a macro's inner steps included (the evaluator composes every macro itself over its metered
// primitives, so nothing a macro does is hidden). Selection and the claim are judged in primitive work, the real cost;
// decisions are reported beside it.
//
// Algebra: none; the tones are puzzle labels (agent +1, wall -1, open 0). Regime: pure. Schedule and boundary: the open
// ball of family A's walk radius, structured walls, never random.
//
// Starts, fixed by the geometry before any learning: the cells that reach the goal, in cell order; position p is
// training when p mod 4 = 0 (dealt to generation p/4 mod 3), validation when p mod 4 = 1, test when p mod 4 = 2 (the
// level-2 held-out set). A test start is far when its walking distance to every cell of every level-1 taught path is at
// least 2, outside the path and its one ring.
//
// Charges, all owned by the evaluator: every generation's discovery runs through evaluateLearning (teacher solves, the
// tables and libraries they read, the discoverer's own calls); the selection's validation solves are recorded in an
// evaluator judging account; the kept library is sealed with the union of both (sealLibrary), and every solve handed
// the library is charged all of it as required preprocessing within the shared budget. A broken budget is reported.
//
// Gates, each able to fail:
// - discovery is metered: every generation's discoverer is accepted (it reports at least the meter).
// - optimal: every test solve, native or transferred, is graded clean (within budget) and costs exactly the oracle's
//   walking distance (plain graph breadth-first search outside the machinery).
// - discovery pays on unseen starts, net of its full cost: at least one macro is kept, and total test primitive work
//   with the final libraries is below level-1 A*'s.
// - the evaluator's primitive count equals an independent recount (macros composed over counting primitives outside the
//   evaluator) on every environment with a library.
// - an overfit operator is caught: taught paths as operators bound to the training layout (the whole wall field) are
//   kept by a lenient selection on the training layout's validation starts in some environment, and rejected on a
//   variant layout in every environment where they were kept.
// - determinism: a second run of one pair gives identical numbers; no random number or clock source in code/intelligence
//   or here.
// Reported, not gated: the state-keyed memorized control (a taught path usable at its training start state), which on
// this family is a real route a search from elsewhere can pass through, so validation may keep it.

import { resolve } from 'node:path'
import { AGENT, OPEN, WALL, agentCell } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { addPreprocessing } from '@/code/intelligence/experience/learner/learned-heuristic'
import { learningEnvironments, type LearningEnvironment } from '@/code/intelligence/experience/learner/navigation-split'
import type { MacroCandidate } from '@/code/intelligence/operator/discovery/path-macro-discoverer'
import { buildMacros } from '@/code/intelligence/operator/discovery/macro'
import type { Operator } from '@/code/intelligence/operator/operator'
import {
  artifactCharge,
  callTotal,
  candidate,
  evaluate,
  evaluateLearning,
  newJudging,
  sealControlLibrary,
  sealLibrary,
  type CandidateSpec,
  type Grade,
  type Judging,
  type LearningGrade,
  type SealedLibrary,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { NO_PREPROCESSING, type Preprocessing } from '@/code/intelligence/solver/solver'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
// the independent recount runs the same search outside the evaluator, on counting primitives of its own
import { aStarSolver } from '@/code/intelligence/solver/search/best-first'
import type { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

/** A* over a heuristic, as an isolated candidate: the heuristic's charge declared, its sealed estimate handed in */
function aStarOn(heuristic: Heuristic<MeshState>): CandidateSpec {
  return candidate(
    SOLVER_CATALOG,
    'aStar',
    { heuristic: { id: heuristic.id, estimate: 'base', preprocessing: heuristic.preprocessing } },
    { base: heuristic.estimate },
  )
}

/** the confirmed candidates the discoverer reported at hand-over */
function candidatesOf(report: unknown): MacroCandidate[] {
  const list = (report as { candidates?: unknown } | null)?.candidates

  return Array.isArray(list) ? (list as MacroCandidate[]) : []
}

const PAIRS: readonly (readonly [LabGeometryName, LabGeometryName])[] = [
  ['{4,5}', '{4,4}'],
  ['{6,4}', '{6,3}'],
  ['{3,7}', '{3,6}'],
  ['{3,4,3,4}', '{3,4,3,3}'],
]
const HYPERBOLIC = new Set<string>(PAIRS.map(pair => pair[0]))
const KINDS = ['maze', 'obstacle'] as const
const GENERATIONS = 3
const PERIOD = 4
const TRAINING_PHASE = 0
const VALIDATION_PHASE = 1
const FAR = 2

/** work as the evaluator measured it: states consulted, planning decisions, primitive calls */
interface Work { expansions: number; calls: number; elementary: number }

const NO_WORK: Work = { expansions: 0, calls: 0, elementary: 0 }
const addWork = (a: Work, b: Work): Work => ({
  expansions: a.expansions + b.expansions,
  calls: a.calls + b.calls,
  elementary: a.elementary + b.elementary,
})
const subWork = (a: Work, b: Work): Work => ({
  expansions: a.expansions - b.expansions,
  calls: a.calls - b.calls,
  elementary: a.elementary - b.elementary,
})

function measured(grade: Grade<MeshState>): Work {
  return { expansions: grade.measured.expansions, calls: callTotal(grade.counted), elementary: callTotal(grade.elementary) }
}

interface Field {
  environment: LearningEnvironment
  /** training starts dealt to each generation */
  slices: Problem<MeshState>[][]
  validation: Problem<MeshState>[]
  test: Problem<MeshState>[]
  /** problem id to start cell */
  startOf: Map<string, number>
  far: Set<string>
}

function moveAgent(template: Problem<MeshState>, start: number, id: string): Problem<MeshState> {
  const cells = template.initial.cells.slice()

  cells[agentCell(template.initial)] = OPEN
  cells[start] = AGENT

  return { ...template, id, initial: { cells } }
}

/** walking distance from the nearest of `sources` (agent cells), through the operators, by cell */
function walkDistance(
  template: Problem<MeshState>,
  operators: readonly Operator<MeshState>[],
  sources: Iterable<number>,
): Map<number, number> {
  const distance = new Map<number, number>()
  const queue: MeshState[] = []

  for (const cell of sources) {
    if (!distance.has(cell)) {
      distance.set(cell, 0)
      queue.push(moveAgent(template, cell, 'walk').initial)
    }
  }

  // a for-of over a growing array visits the pushed states too: the breadth-first queue
  for (const state of queue) {
    const here = distance.get(agentCell(state))!

    for (const operator of operators) {
      if (operator.applicable(state)) {
        const next = operator.apply(state)
        const cell = agentCell(next)

        if (!distance.has(cell)) {
          distance.set(cell, here + 1)
          queue.push(next)
        }
      }
    }
  }

  return distance
}

function fieldOf(environment: LearningEnvironment): Field | null {
  const template = environment.training[0]

  if (template === undefined || environment.heldOut.length === 0) {
    return null
  }

  const startOf = new Map(environment.startOf)
  const slices: Problem<MeshState>[][] = Array.from({ length: GENERATIONS }, () => [])
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
      validation.push(problem)
    } else if (phase === TRAINING_PHASE) {
      const problem = environment.training[trainingIndex]!

      if (startOf.get(problem.id) !== cell) {
        throw new Error(`${environment.id}: training start ${cell} out of order`)
      }

      slices[trainingIndex % GENERATIONS]!.push(problem)
      trainingIndex++
    }
  }

  if (trainingIndex !== environment.training.length) {
    throw new Error(`${environment.id}: ${trainingIndex} training starts rebuilt, ${environment.training.length} given`)
  }

  // the cells level-1 A* walks from every training start
  const taught = new Set<number>()

  for (const problem of environment.training) {
    for (const state of evaluate(aStarOn(environment.base), problem, environment.operators).solution.states) {
      taught.add(agentCell(state))
    }
  }

  const distance = walkDistance(template, environment.operators, taught)
  const far = new Set<string>()

  for (const problem of environment.heldOut) {
    if ((distance.get(startOf.get(problem.id)!) ?? Infinity) >= FAR) {
      far.add(problem.id)
    }
  }

  return { environment, slices, validation, test: environment.heldOut, startOf, far }
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
  far: Work
  /** solves whose path used at least one macro, macro steps on the paths, distinct macros used */
  usingMacro: number
  macroSteps: number
  macrosUsed: Set<string>
  /** solves refused only for running over the budget */
  overBudget: number
  /** solves that failed, or cost more than the oracle */
  wrong: number
}

/**
 * A* over the bare-hop estimate with the libraries handed to the evaluator, every solve graded and checked optimal
 * against the oracle unless `check` is false (a variant world with no oracle). The solver declares the libraries'
 * charge; the evaluator applies it whether declared or not.
 */
function solveAll(
  field: Field,
  problems: readonly Problem<MeshState>[],
  libraries: readonly SealedLibrary[],
  fail: (message: string) => void,
  options: { judging?: Judging; check?: boolean } = {},
): SolveRun {
  const environment = field.environment
  const heuristic = declaring(environment.base, libraries)
  const primitives = new Set(environment.operators.map(operator => operator.id))
  const out: SolveRun = { work: NO_WORK, far: NO_WORK, usingMacro: 0, macroSteps: 0, macrosUsed: new Set(), overBudget: 0, wrong: 0 }
  const check = options.check ?? true

  for (const problem of problems) {
    const grade = evaluate(aStarOn(heuristic), problem, environment.operators, {
      libraries,
      ...(options.judging === undefined ? {} : { judging: options.judging }),
    })

    if (!grade.solved) {
      if (grade.violations.length > 0 && grade.violations.every(v => v.startsWith('over budget'))) {
        out.overBudget++
      } else {
        out.wrong++
        fail(`${problem.id}: solved ${grade.solved}, ${grade.violations[0] ?? 'no violation'}`)
      }
    } else if (check && grade.cost !== environment.oracle[field.startOf.get(problem.id)!]) {
      out.wrong++
      fail(`${problem.id}: cost ${grade.cost}, oracle ${environment.oracle[field.startOf.get(problem.id)!]}`)
    }

    const work = measured(grade)

    out.work = addWork(out.work, work)

    if (field.far.has(problem.id)) {
      out.far = addWork(out.far, work)
    }

    const used = grade.solution.operators.filter(id => !primitives.has(id))

    if (used.length > 0) {
      out.usingMacro++
    }

    out.macroSteps += used.length
    used.forEach(id => out.macrosUsed.add(id))
  }

  return out
}

/** primitive calls of the same test searches run outside the evaluator, macros composed over counting primitives */
function recountElementary(field: Field, library: SealedLibrary): number {
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
  // the same composition the evaluator uses: one run per state asked, remembered for cost and apply
  const macros = buildMacros(library.steps(), counting, { memo: true }).filter((m): m is Operator<MeshState> => m !== null)
  const heuristic = declaring(field.environment.base, [library])

  for (const problem of field.test) {
    aStarSolver(heuristic).solve(problem, [...counting, ...macros])
  }

  return calls
}

interface Generation {
  candidates: number
  kept: string[]
  /** this generation's own discovery (teacher solves and the discoverer), without what it read */
  discovery: Preprocessing
  teacher: Preprocessing
  /** the selection's validation solves, as the evaluator's judging account recorded them */
  selection: Preprocessing
  /** test work with the library after this generation */
  test: SolveRun
}

interface EnvironmentResult {
  field: Field
  generations: Generation[]
  library: SealedLibrary | null
  /** the library's whole charge, discovery and selection, as sealed */
  charge: Preprocessing
  /** everything spent on discovery and selection, kept or not */
  spent: Preprocessing
  base: SolveRun
  recountMatches: boolean | null
  failures: string[]
}

function runEnvironment(field: Field): EnvironmentResult {
  const failures: string[] = []

  const fail = (message: string): void => {
    if (failures.length < 10) {
      failures.push(message)
    }
  }

  const environment = field.environment
  const kept: string[][] = []
  const sources: LearningGrade<MeshState>[] = []
  const judgings: Judging[] = []
  const generations: Generation[] = []
  const spent: Preprocessing = { ...NO_PREPROCESSING }

  let library: SealedLibrary | null = null

  const base = solveAll(field, field.test, [], fail)
  const sealed = (steps: readonly (readonly string[])[], id: string, accounts: readonly Judging[]): SealedLibrary =>
    sealLibrary({ id, steps, sources, judging: accounts })

  for (let generation = 0; generation < GENERATIONS; generation++) {
    const slice = field.slices[generation]!

    if (slice.length === 0) {
      continue
    }

    const libraries = library === null ? [] : [library]
    const learning = evaluateLearning({
      build: candidate('code/intelligence/experience/learner/catalog', 'pathMacros'),
      teacher: aStarOn(declaring(environment.base, libraries)),
      training: slice,
      operators: environment.operators,
      libraries,
    })

    if (!learning.accepted) {
      fail(`${environment.id} generation ${generation + 1}: discovery rejected, ${learning.violations[0]}`)
    }

    if (learning.training.some(grade => !grade.solved)) {
      fail(`${environment.id} generation ${generation + 1}: a teacher solve failed`)
    }

    sources.push(learning)

    // the candidates as proposed under the meter, reported at hand-over (cached by the discoverer, so reading them costs nothing more)
    const candidates: MacroCandidate[] = candidatesOf(learning.report)

    if (candidates.length !== learning.proposed) {
      fail(`${environment.id}: ${candidates.length} candidates, ${learning.proposed} proposed under the meter`)
    }

    // this generation's own cost: the learning charge less what the teacher read (the base table, the library so far)
    const discovery: Preprocessing = {
      expansions: learning.charge.expansions - learning.teacherArtifacts.expansions,
      operatorCalls: learning.charge.operatorCalls - learning.teacherArtifacts.operatorCalls,
      memoryBytes: learning.charge.memoryBytes - learning.teacherArtifacts.memoryBytes,
    }

    addInto(spent, discovery)

    // a candidate's own cost: its equal share of the whole generation's discovery, teacher solves included
    const ownCost = candidates.length === 0 ? 0 : discovery.operatorCalls / candidates.length
    const judging = newJudging(`${environment.id}-generation-${generation + 1}`)

    // forward selection on the validation starts, candidates in the discoverer's fixed order, judged in primitive work
    let current = solveAll(field, field.validation, libraries, fail, { judging })

    const keptHere: string[] = []

    for (const candidate of candidates) {
      const trialLibrary = sealed([...kept, candidate.steps], `${environment.id}-trial`, judgings)
      // a trial that fails is simply not kept, so its failures are not the experiment's
      const trial = solveAll(field, field.validation, [trialLibrary], ignore, { judging })

      if (trial.wrong === 0 && trial.overBudget === 0 && current.work.elementary - trial.work.elementary > ownCost) {
        kept.push(candidate.steps)
        keptHere.push(candidate.id)
        current = trial
      }
    }

    judgings.push(judging)

    const selection = judging.work()

    addInto(spent, selection)

    if (kept.length > 0) {
      library = sealed(kept, `${environment.id}-library-${generation + 1}`, judgings)
    }

    generations.push({
      candidates: candidates.length,
      kept: keptHere,
      discovery,
      teacher: learning.teacherMetered,
      selection,
      test: library === null ? base : solveAll(field, field.test, [library], fail),
    })
  }

  let recountMatches: boolean | null = null

  if (library !== null) {
    const final = generations[generations.length - 1]!.test

    recountMatches = recountElementary(field, library) === final.work.elementary
  }

  return {
    field,
    generations,
    library,
    charge: library === null ? { ...NO_PREPROCESSING } : artifactCharge(library)!,
    spent,
    base,
    recountMatches,
    failures,
  }
}

function ignore(message: string): string {
  return message
}

function addInto(into: Preprocessing, add: Preprocessing): void {
  into.expansions += add.expansions
  into.operatorCalls += add.operatorCalls
  into.memoryBytes += add.memoryBytes
}

const finalRun = (r: EnvironmentResult): SolveRun => r.generations[r.generations.length - 1]?.test ?? r.base

interface Transfer {
  from: string
  to: string
  kept: number
  rebuilt: number
  base: SolveRun
  moved: SolveRun
  native: SolveRun
  tests: number
}

/** the source environment's final library, handed unchanged to the target's solves (macros exist there by name) */
function transfer(from: EnvironmentResult, to: EnvironmentResult, fail: (message: string) => void): Transfer | null {
  if (from.library === null) {
    return null
  }

  const steps = from.library.steps()
  const rebuilt = buildMacros(steps, to.field.environment.operators).filter(m => m !== null).length

  return {
    from: from.field.environment.id,
    to: to.field.environment.id,
    kept: steps.length,
    rebuilt,
    base: to.base,
    moved: solveAll(to.field, to.field.test, [from.library], fail),
    native: finalRun(to),
    tests: to.field.test.length,
  }
}

/** the walls of a state: every cell's wall-or-not, the agent ignored */
function sameWalls(a: Int8Array, b: Int8Array): boolean {
  for (let cell = 0; cell < a.length; cell++) {
    if ((a[cell] === WALL) !== (b[cell] === WALL)) {
      return false
    }
  }

  return true
}

/** the validation starts on a variant layout: every wall on a cell c with c mod 7 = 3 opened, the goal unchanged */
function variantValidation(field: Field): Problem<MeshState>[] | null {
  const template = field.environment.training[0]!
  const cells = template.initial.cells.slice()

  let opened = 0

  for (let cell = 0; cell < cells.length; cell++) {
    if (cells[cell] === WALL && cell % 7 === 3) {
      cells[cell] = OPEN
      opened++
    }
  }

  if (opened === 0) {
    return null
  }

  const variant: Problem<MeshState> = { ...template, id: `${field.environment.id}-variant`, initial: { cells } }

  return field.validation.map(problem => moveAgent(variant, field.startOf.get(problem.id)!, `${problem.id}-variant`))
}

interface ControlResult {
  stateTrainingGain: Work
  stateValidationGain: Work
  /** the layout-bound operators: kept on the training layout, kept on the variant layout */
  layoutKeptSame: boolean
  layoutKeptVariant: boolean | null
  layoutSameGain: Work
  layoutVariantGain: Work | null
}

/**
 * Each generation-1 taught path as one operator, twice: bound to its training start state (state-keyed, a real
 * route on this family), and bound to the training layout, the whole wall field (an overfit to the instance). Each is
 * judged by a lenient selection (any gain in primitive work keeps it) on validation starts.
 */
function memorizedControl(field: Field, fail: (message: string) => void): ControlResult | null {
  const environment = field.environment
  const slice = field.slices[0]!
  const key = slice[0]?.key
  const walls = environment.training[0]!.initial.cells
  const stateKeyed: { name: string; steps: string[]; guard: (state: MeshState) => boolean }[] = []
  const layoutKeyed: { name: string; steps: string[]; guard: (state: MeshState) => boolean }[] = []

  for (const problem of slice) {
    const path = evaluate(aStarOn(environment.base), problem, environment.operators).solution.operators

    if (path.length < 2 || key === undefined) {
      continue
    }

    const startKey = key(problem.initial)

    stateKeyed.push({ name: `state-${problem.id}`, steps: path, guard: state => key(state) === startKey })
    layoutKeyed.push({ name: `layout-${problem.id}`, steps: path, guard: state => sameWalls(state.cells, walls) })
  }

  if (stateKeyed.length === 0) {
    return null
  }

  const stateLibrary = sealControlLibrary(`${environment.id}-state-keyed`, stateKeyed)
  const layoutLibrary = sealControlLibrary(`${environment.id}-layout-keyed`, layoutKeyed)
  const gain = (problems: readonly Problem<MeshState>[], library: SealedLibrary, check: boolean): Work =>
    subWork(solveAll(field, problems, [], fail, { check }).work, solveAll(field, problems, [library], fail, { check }).work)
  const variant = variantValidation(field)
  const layoutSameGain = gain(field.validation, layoutLibrary, true)
  const layoutVariantGain = variant === null ? null : gain(variant, layoutLibrary, false)

  return {
    stateTrainingGain: gain(slice, stateLibrary, true),
    stateValidationGain: gain(field.validation, stateLibrary, true),
    layoutKeptSame: layoutSameGain.elementary > 0,
    layoutKeptVariant: layoutVariantGain === null ? null : layoutVariantGain.elementary > 0,
    layoutSameGain,
    layoutVariantGain,
  }
}

function digest(results: readonly EnvironmentResult[]): string {
  return results
    .map(
      r =>
        `${r.field.environment.id}:${(r.library?.steps() ?? []).map(s => s.join('.')).join('|')}:${r.charge.expansions}:${r.charge.operatorCalls}:${r.generations.map(g => `${g.test.work.elementary}/${g.test.work.calls}/${g.test.work.expansions}/${g.discovery.operatorCalls}/${g.selection.operatorCalls}`).join(',')}`,
    )
    .join(';')
}

const ratio = (gain: number, cost: number): number => (cost > 0 ? gain / cost : 0)
const fixed = (value: number): number => Number(value.toFixed(4))

function fieldsOf(names: readonly LabGeometryName[]): Field[] {
  return learningEnvironments(names)
    .map(fieldOf)
    .filter((field): field is Field => field !== null)
}

const geometryOf = (id: string): string => id.replace(/^[a-z]+-/, '')

export default experiment({
  id: 'intelligence/discovery',
  code: 'E-CMP-0030',
  title:
    'intelligence level 3: a deterministic discoverer proposes macros, recurring runs of steps on verified A* paths over the maze and obstacle fields of the four degree-matched geometry pairs; the outside evaluator composes every macro over its metered primitives, keeps a macro only when it cuts validation primitive work by more than its share of the whole generation discovery cost, charges discovery and selection to every solve that uses the library, and measures reuse, transfer to the degree-matched control both ways, gains on starts far from any taught path, and the learning rate over three generations',
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

    const fields = fieldsOf(PAIRS.flatMap(pair => [...pair]))
    const results = fields.map(runEnvironment)

    results.forEach(result => result.failures.forEach(fail))

    const byId = new Map(results.map(r => [r.field.environment.id, r]))
    const transfers: Transfer[] = []

    for (const [hyperbolic, flat] of PAIRS) {
      for (const kind of KINDS) {
        const a = byId.get(`${kind}-${hyperbolic}`)
        const b = byId.get(`${kind}-${flat}`)

        if (a !== undefined && b !== undefined) {
          for (const moved of [transfer(a, b, fail), transfer(b, a, fail)]) {
            if (moved !== null) {
              transfers.push(moved)
            }
          }
        }
      }
    }

    const total = <T>(list: readonly T[], pick: (item: T) => number): number => list.reduce((sum, item) => sum + pick(item), 0)
    const totalWork = <T>(list: readonly T[], pick: (item: T) => Work): Work => list.reduce((sum, item) => addWork(sum, pick(item)), NO_WORK)

    const base = totalWork(results, r => r.base.work)
    const final = totalWork(results, r => finalRun(r).work)
    const farBase = totalWork(results, r => r.base.far)
    const farFinal = totalWork(results, r => finalRun(r).far)
    const gain = subWork(base, final)
    const farGain = subWork(farBase, farFinal)
    const kept = total(results, r => r.library?.entries.length ?? 0)
    const candidates = total(results, r => total(r.generations, g => g.candidates))
    const discovery = { expansions: total(results, r => total(r.generations, g => g.discovery.expansions)), calls: total(results, r => total(r.generations, g => g.discovery.operatorCalls)) }
    const teacher = total(results, r => total(r.generations, g => g.teacher.operatorCalls))
    const selection = { expansions: total(results, r => total(r.generations, g => g.selection.expansions)), calls: total(results, r => total(r.generations, g => g.selection.operatorCalls)) }
    const spent = { expansions: total(results, r => r.spent.expansions), calls: total(results, r => r.spent.operatorCalls) }
    const tests = total(results, r => r.field.test.length)
    const farTests = total(results, r => r.field.far.size)
    const usingMacro = total(results, r => finalRun(r).usingMacro)
    const macroSteps = total(results, r => finalRun(r).macroSteps)
    const macrosUsed = total(results, r => finalRun(r).macrosUsed.size)
    const overBudget = total(results, r => total(r.generations, g => g.test.overBudget))
    const largestCharge = Math.max(0, ...results.map(r => r.charge.expansions))
    const recounted = results.filter(r => r.recountMatches !== null)
    const recountMismatches = recounted.filter(r => r.recountMatches === false).length

    if (overBudget > 0) {
      fail(`${overBudget} test solves ran over the shared budget once the library's full charge was counted`)
    }

    // the level-3 claim, net of every cost: kept macros, and less primitive work on unseen starts
    const claimHolds = kept > 0 && final.elementary < base.elementary

    if (kept === 0) {
      fail('no macro paid its share of the generation cost on validation: none kept anywhere')
    } else if (final.elementary >= base.elementary) {
      fail(`test primitive work ${final.elementary} with macros, ${base.elementary} level-1 A*: no cut`)
    }

    if (recountMismatches > 0) {
      fail(`the evaluator's primitive count differs from the independent recount on ${recountMismatches} environments`)
    }

    // the learning rate by generation: the generation's own test gain over its own discovery and selection
    const rates: string[] = []
    const rateValues: number[] = []

    for (let generation = 0; generation < GENERATIONS; generation++) {
      const present = results.filter(r => r.generations.length > generation)
      const before = totalWork(present, r => (generation === 0 ? r.base : r.generations[generation - 1]!.test).work)
      const after = totalWork(present, r => r.generations[generation]!.test.work)
      const discoveryCalls = total(present, r => r.generations[generation]!.discovery.operatorCalls)
      const selectionCalls = total(present, r => r.generations[generation]!.selection.operatorCalls)
      const keptHere = total(present, r => r.generations[generation]!.kept.length)
      const step = subWork(before, after)
      const rate = ratio(step.elementary, discoveryCalls)
      const name = `gen${generation + 1}`

      rateValues.push(rate)
      metrics[`${name}Environments`] = present.length
      metrics[`${name}Kept`] = keptHere
      metrics[`${name}GainElementary`] = step.elementary
      metrics[`${name}GainDecisions`] = step.calls
      metrics[`${name}GainExpansions`] = step.expansions
      metrics[`${name}DiscoveryCalls`] = discoveryCalls
      metrics[`${name}SelectionCalls`] = selectionCalls
      metrics[`${name}L`] = fixed(rate)
      metrics[`${name}LWithSelection`] = fixed(ratio(step.elementary, discoveryCalls + selectionCalls))
      metrics[`${name}LDecisions`] = fixed(ratio(step.calls, discoveryCalls))
      rates.push(
        `generation ${generation + 1}: ${keptHere} kept, gain ${step.elementary} primitive calls (${step.calls} decisions, ${step.expansions} expansions), discovery ${discoveryCalls} calls, selection ${selectionCalls}; L ${rate.toFixed(4)} in primitive calls, ${ratio(step.elementary, discoveryCalls + selectionCalls).toFixed(4)} with the selection, ${ratio(step.calls, discoveryCalls).toFixed(4)} in decisions`,
      )
    }

    const rising = rateValues.every((rate, index) => index === 0 || rate > rateValues[index - 1]!)

    // controls: memorized answers, state-keyed (reported) and layout-keyed (gated)
    let memorizedTried = 0
    let stateKeptByValidation = 0
    let stateKeptByTraining = 0
    let layoutKeptSame = 0
    let layoutRejectedVariant = 0
    let layoutVariantTried = 0
    let stateTrainingGain = NO_WORK
    let stateValidationGain = NO_WORK
    let layoutSameGain = NO_WORK
    let layoutVariantGain = NO_WORK

    for (const field of fields) {
      const result = memorizedControl(field, fail)

      if (result === null) {
        continue
      }

      memorizedTried++
      stateTrainingGain = addWork(stateTrainingGain, result.stateTrainingGain)
      stateValidationGain = addWork(stateValidationGain, result.stateValidationGain)
      stateKeptByTraining += result.stateTrainingGain.elementary > 0 ? 1 : 0
      stateKeptByValidation += result.stateValidationGain.elementary > 0 ? 1 : 0

      if (result.layoutKeptSame) {
        layoutKeptSame++
        layoutSameGain = addWork(layoutSameGain, result.layoutSameGain)

        if (result.layoutKeptVariant !== null) {
          layoutVariantTried++
          layoutVariantGain = addWork(layoutVariantGain, result.layoutVariantGain!)

          if (!result.layoutKeptVariant) {
            layoutRejectedVariant++
          } else {
            fail(`layout-bound operators kept on a variant layout in ${field.environment.id}`)
          }
        }
      }
    }

    control.memorizedTried = memorizedTried
    control.stateKeyedKeptByTraining = stateKeptByTraining
    control.stateKeyedKeptByValidation = stateKeptByValidation
    control.stateKeyedTrainingGainElementary = stateTrainingGain.elementary
    control.stateKeyedValidationGainElementary = stateValidationGain.elementary
    control.layoutKeyedKeptSameLayout = layoutKeptSame
    control.layoutKeyedVariantTried = layoutVariantTried
    control.layoutKeyedRejectedOnVariant = layoutRejectedVariant
    control.layoutKeyedSameGainElementary = layoutSameGain.elementary
    control.layoutKeyedVariantGainElementary = layoutVariantGain.elementary

    if (layoutKeptSame === 0 || layoutVariantTried === 0) {
      fail(`layout-bound control never kept on its own layout (${layoutKeptSame}) or never tried on a variant (${layoutVariantTried}): it shows nothing`)
    }

    // control: a discoverer hiding one operator call, rejected by the meter
    let hiddenCallRejected = 0
    let meterControls = 0

    for (const result of results.slice(0, 4)) {
      const environment = result.field.environment

      meterControls++

      const hiding = evaluateLearning({
        build: candidate('code/intelligence/control/learner-controls', 'hidingOneCallDiscoverer'),
        teacher: aStarOn(environment.base),
        training: result.field.slices[0]!,
        operators: environment.operators,
      })

      if (!hiding.accepted) {
        hiddenCallRejected++
      }
    }

    control.meterControls = meterControls
    control.hiddenCallRejected = hiddenCallRejected

    // control (audit M3): a macro library appended as plain operators, never sealed, is refused by the evaluator
    let unsealedRefused = 0
    let unsealedTried = 0

    for (const result of results.filter(r => r.library !== null).slice(0, 4)) {
      const environment = result.field.environment
      const macros = buildMacros(result.library!.steps(), environment.operators).filter((m): m is Operator<MeshState> => m !== null)

      unsealedTried++

      if (!evaluate(aStarOn(environment.base), result.field.test[0]!, [...environment.operators, ...macros]).solved) {
        unsealedRefused++
      }
    }

    control.unsealedLibraryTried = unsealedTried
    control.unsealedLibraryRefused = unsealedRefused

    if (hiddenCallRejected !== meterControls || unsealedRefused !== unsealedTried) {
      fail(`meter controls: ${hiddenCallRejected} of ${meterControls} and ${unsealedRefused} of ${unsealedTried} rejected`)
    }

    // determinism: one pair again
    const again = fieldsOf(['{4,5}', '{4,4}']).map(runEnvironment)
    const ids = new Set(again.map(r => r.field.environment.id))
    const deterministic = again.length > 0 && digest(again) === digest(results.filter(r => ids.has(r.field.environment.id)))

    if (!deterministic) {
      fail('a second discovery and grading gave different numbers')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/discovery.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // transfer, both directions
    const direction = (fromHyperbolic: boolean) => {
      const list = transfers.filter(t => HYPERBOLIC.has(geometryOf(t.from)) === fromHyperbolic)

      return {
        count: list.length,
        moved: subWork(totalWork(list, t => t.base.work), totalWork(list, t => t.moved.work)),
        native: subWork(totalWork(list, t => t.base.work), totalWork(list, t => t.native.work)),
      }
    }
    const toFlat = direction(true)
    const toHyperbolic = direction(false)
    const transferLines = transfers.map(t => {
      const moved = subWork(t.base.work, t.moved.work)
      const native = subWork(t.base.work, t.native.work)

      return `${t.from} to ${t.to}: ${t.rebuilt} of ${t.kept} macros exist there, gain ${moved.elementary} primitive calls (target's own library ${native.elementary}), ${t.moved.usingMacro} of ${t.tests} solves used a moved macro`
    })

    metrics.environments = results.length
    metrics.transfers = transfers.length
    metrics.candidates = candidates
    metrics.macrosKept = kept
    metrics.testStarts = tests
    metrics.farTestStarts = farTests
    metrics.baseTestElementary = base.elementary
    metrics.finalTestElementary = final.elementary
    metrics.baseTestDecisions = base.calls
    metrics.finalTestDecisions = final.calls
    metrics.baseTestExpansions = base.expansions
    metrics.finalTestExpansions = final.expansions
    metrics.gainElementary = gain.elementary
    metrics.gainDecisions = gain.calls
    metrics.gainExpansions = gain.expansions
    metrics.farGainElementary = farGain.elementary
    metrics.farBaseElementary = farBase.elementary
    metrics.discoveryCalls = discovery.calls
    metrics.discoveryExpansions = discovery.expansions
    metrics.teacherCalls = teacher
    metrics.selectionCalls = selection.calls
    metrics.selectionExpansions = selection.expansions
    metrics.spentCalls = spent.calls
    metrics.spentExpansions = spent.expansions
    metrics.largestLibraryChargeExpansions = largestCharge
    metrics.testSolvesOverBudget = overBudget
    metrics.cumulativeL = fixed(ratio(gain.elementary, discovery.calls))
    metrics.cumulativeLWithSelection = fixed(ratio(gain.elementary, spent.calls))
    metrics.cumulativeLDecisions = fixed(ratio(gain.calls, discovery.calls))
    metrics.cumulativeLDecisionsWithSelection = fixed(ratio(gain.calls, spent.calls))
    metrics.learningRateRises = rising ? 1 : 0
    metrics.testSolvesUsingMacro = usingMacro
    metrics.macroStepsInTestPaths = macroSteps
    metrics.distinctMacrosUsed = macrosUsed
    metrics.recountEnvironments = recounted.length
    metrics.recountMismatches = recountMismatches
    metrics.transferGainHyperbolicToFlat = toFlat.moved.elementary
    metrics.ownGainFlatTargets = toFlat.native.elementary
    metrics.transferGainFlatToHyperbolic = toHyperbolic.moved.elementary
    metrics.ownGainHyperbolicTargets = toHyperbolic.native.elementary
    for (const kind of KINDS) {
      for (const [curvature, hyperbolic] of [
        ['Hyperbolic', true],
        ['Flat', false],
      ] as const) {
        const list = results.filter(
          r => r.field.environment.kind === kind && HYPERBOLIC.has(geometryOf(r.field.environment.id)) === hyperbolic,
        )

        metrics[`${kind}${curvature}BaseElementary`] = totalWork(list, r => r.base.work).elementary
        metrics[`${kind}${curvature}GainElementary`] = subWork(totalWork(list, r => r.base.work), totalWork(list, r => finalRun(r).work)).elementary
        metrics[`${kind}${curvature}Kept`] = total(list, r => r.library?.entries.length ?? 0)
      }
    }

    metrics.claimHolds = claimHolds ? 1 : 0
    metrics.paysForDiscovery = gain.elementary > discovery.calls ? 1 : 0
    metrics.paysForDiscoveryAndSelection = gain.elementary > spent.calls ? 1 : 0
    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length
    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a solver discovers reusable operators (intelligence level 3): macros read off verified paths, composed by the evaluator over its metered primitives and kept only when their validation cut in primitive work exceeds their share of the whole generation discovery cost (teacher solves included), cut A* primitive work on unseen test starts with every solve still optimal and inside the budget once discovery and selection are both charged; whether the cut repays the discovery and selection that found it (L above 1) is measured and reported, not claimed, as are reuse, transfer to the degree-matched control both ways, far-start gains and the learning rate per generation',
      metrics,
      control,
      notes: `L2 discovery on family A's maze and obstacle fields of the four degree-matched pairs: ${results.length} environments (obstacle fields with no training or test start are absent), ${tests} test starts, ${farTests} far from every taught path. ${candidates} candidates over ${GENERATIONS} generations, ${kept} kept. The gated claim (kept macros cut test primitive work) ${claimHolds ? 'holds' : 'does not hold at these sizes'}; net of its cost the discovery ${gain.elementary > spent.calls ? 'pays' : 'does not pay'} for itself at these sizes (gain ${gain.elementary} primitive calls against ${discovery.calls} of discovery and ${spent.calls} with the selection). Test work, level-1 A* then the final libraries: primitive calls ${base.elementary} to ${final.elementary} (gain ${gain.elementary}; far starts ${farGain.elementary} of ${farBase.elementary}), planning decisions ${base.calls} to ${final.calls}, expansions ${base.expansions} to ${final.expansions}. Reuse: ${usingMacro} of ${tests} test solves used a macro, ${macroSteps} macro steps, ${macrosUsed} distinct macros. A macro saves planning decisions; every consult still runs its steps until one fails, which the evaluator now counts, since it composes each macro over its own metered primitives (a macro's run is remembered for the cost and apply that follow, one run per state, not three). The evaluator's primitive count equals an independent recount on ${recounted.length - recountMismatches} of ${recounted.length} environments with a library. Cost, all metered by the evaluator: discovery ${discovery.calls} primitive calls and ${discovery.expansions} expansions (teacher ${teacher} calls), selection ${selection.calls} calls and ${selection.expansions} expansions of validation solves, ${spent.calls} calls in all; a kept library is sealed with both and charged whole to every solve that uses it (largest library charge ${largestCharge} expansions of the 50,000 budget; ${overBudget} test solves over budget). L = test gain / discovery = ${ratio(gain.elementary, discovery.calls).toFixed(4)} in primitive calls, ${ratio(gain.elementary, spent.calls).toFixed(4)} with the selection counted; in planning decisions ${ratio(gain.calls, discovery.calls).toFixed(4)} and ${ratio(gain.calls, spent.calls).toFixed(4)}. By generation: ${rates.join('; ')}; the learning rate ${rising ? 'rises with every generation' : 'does not rise with every generation'}. Transfer, each library moved unchanged and charged in full: ${transferLines.length === 0 ? 'none (no library kept)' : transferLines.join('; ')}. Hyperbolic to flat: ${toFlat.moved.elementary} primitive calls against ${toFlat.native.elementary} from the targets' own libraries over ${toFlat.count} moves; flat to hyperbolic: ${toHyperbolic.moved.elementary} against ${toHyperbolic.native.elementary} over ${toHyperbolic.count}. A macro is named by port indices, numbered by neighbor cell order on the breadth-first-numbered ball, so transfer measures that labeling as much as the geometry. Memorized answers (${memorizedTried} environments, each generation-1 taught path as one operator, judged by a lenient selection that keeps any gain): bound to its start state, it gained ${stateTrainingGain.elementary} primitive calls on its training starts and ${stateValidationGain.elementary} on validation, kept by validation in ${stateKeptByValidation} environments, a real route here, reported not gated; bound to the training layout, it was kept on that layout's validation starts in ${layoutKeptSame} of ${memorizedTried} environments (gain there ${layoutSameGain.elementary}; elsewhere its consults cost more than it saved) and rejected on a variant layout (walls on cells c mod 7 = 3 opened) in ${layoutRejectedVariant} of ${layoutVariantTried} (gain ${layoutVariantGain.elementary}). A macro library appended as plain operators is refused (${unsealedRefused} of ${unsealedTried}). Every discoverer and solver ran isolated in its own context of a worker (${metrics.isolatedSessions} contexts, ${metrics.isolatedRequests} requests served), holding handles to states the evaluator issued. Limits: training, validation and test starts are disjoint; the bare-hop table's charge is declared by the benchmark when it seals the table; one family (walking on fixed walls). ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
