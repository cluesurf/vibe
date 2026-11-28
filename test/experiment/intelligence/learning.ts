// Intelligence level 2: the solver learns from experience within the mesh. A deterministic learner observes family A
// experiences (verified A* solves from training starts on the maze and obstacle fields of all twelve lab geometries)
// and learns a value table: the exact cost-to-go along each taught path, plus a one-ring lower bound for the states
// next to it (the triangle inequality). A* over the larger of family A's bare-hop estimate and the learned table then
// solves held-out starts, fixed by the geometry before any learning, and the outside evaluator grades every solve and
// charges all the learning. The learned object is a value table (an estimate), not a new operator.
//
// Every environment has one fixed goal, so the table is a partial map of distance to it, and most held-out starts sit
// on a taught path or its ring: there the table already holds the answer. The headline is therefore the held-out
// starts OUTSIDE the table's support (disjoint from every taught state and its ring), where only generalization
// helps; the starts inside it are reported as a second row.
//
// Algebra: none; the tones are puzzle labels (agent +1, wall -1, open 0). Regime: pure. Schedule and boundary: the open
// ball of family A's walk radius, structured walls, never random.
//
// Gates, each able to fail:
// - learning is metered, not reported: the evaluator runs the teacher, hands the learner only metered operators and
//   the experiences it wrote, copies the table out as plain data at hand-over, revokes the learner's operators,
//   measures the table's bytes, and accepts the learner only if it reports at least the meter and every table entry
//   names a state met through a metered channel.
// - the learned table is right: every entry on a taught path equals the oracle's exact cost-to-go (plain graph BFS
//   through the open cells, outside the machinery), and no entry exceeds it (admissible).
// - optimality against BFS: on every held-out start, BFS, level-1 A* and learned A* are graded clean and solved, BFS
//   equals the oracle, and both A* costs equal BFS.
// - learning cuts search where it must generalize: measured search expansions of learned A* on the held-out starts
//   outside the table's support are below level-1 A*'s.
// - every held-out solve over the table is charged by the evaluator itself, from the sealed table it read.
// - determinism: a second learning and grading of two geometries gives identical numbers; no random number or clock
//   source anywhere in code/intelligence or this file.
// Controls that must be caught (each passed the evaluator before the 2026-11-26 audit fixes): learners reporting zero
// work, one operator call less, one expansion less or one byte less; a learner adding entries for states it made
// itself, not through an operator; a lazy learner whose table is not plain data and computes at lookup time through
// operators it kept (audit C1), whose kept operators must also stop working; a learned A* hiding its search behind its
// preprocessing charge (C2); a solver reading the table while declaring only the base charge, with no charge passed
// in by the caller (M3; accepted on an unsealed copy, which shows the hole was real); a solver hiding its search
// expansions; a learner taught by greedy search, whose suboptimal paths make the table inadmissible.

import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { addPreprocessing } from '@/code/intelligence/experience/learner/learned-heuristic'
import {
  agentOfKey,
  learningEnvironments,
  type LearningEnvironment,
} from '@/code/intelligence/experience/learner/navigation-split'
import {
  candidate,
  evaluate,
  evaluateLearning,
  openCandidate,
  type CandidateSpec,
  type Grade,
  type LearningGrade,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import type { Preprocessing } from '@/code/intelligence/solver/solver'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

/** the learner's own modules: they may import only interfaces, never the world (check:layers is the full gate) */
const LEARNER_FILES = [
  'code/intelligence/experience/learner/value-table.ts',
  'code/intelligence/experience/learner/learned-heuristic.ts',
  'code/intelligence/experience/learner/catalog.ts',
]
const FORBIDDEN_IMPORTS = [
  'code/intelligence/benchmark',
  'code/intelligence/problem/evaluate',
  'code/intelligence/sandbox',
  'code/substrate',
  'code/tool',
  'code/rule',
  'code/geometry',
  'code/intelligence/experience/learner/navigation-split',
]

const CONTROL_ENVIRONMENTS = new Set(['maze-{4,4}', 'maze-{7,3}', 'maze-{3,4,3,4}', 'obstacle-{5,4}'])

type Learned = LearningGrade<MeshState>

// every learner and solver is an isolated candidate, named by its module and factory
const LEARNERS = 'code/intelligence/experience/learner/catalog'
const LEARNER_CONTROLS = 'code/intelligence/control/learner-controls'
const SOLVER_CONTROLS = 'code/intelligence/control/navigation-controls'

const honest = candidate(LEARNERS, 'valueTable')

const baseHeuristic = (environment: LearningEnvironment) => ({
  id: environment.base.id,
  estimate: 'base',
  preprocessing: environment.base.preprocessing,
})

const searchOn = (name: string, environment: LearningEnvironment): CandidateSpec =>
  candidate(SOLVER_CATALOG, name, { heuristic: baseHeuristic(environment) }, { base: environment.base.estimate })

const breadthFirst = candidate(SOLVER_CATALOG, 'breadthFirst')

/** A* (or a control) over the larger of the base estimate and a learned table, declaring `preprocessing` */
function overTable(
  environment: LearningEnvironment,
  table: ReadonlyMap<string, number>,
  preprocessing: Preprocessing,
  module = SOLVER_CATALOG,
  name = 'aStar',
): CandidateSpec {
  return candidate(
    module,
    name,
    { heuristic: { id: `${environment.base.id}+learned`, estimate: 'base', table: 'table', preprocessing } },
    { base: environment.base.estimate, table },
  )
}

// A* over the learned table whose ledger declares only the base table: the learning charge is hidden
const hidingCharge = (environment: LearningEnvironment, table: ReadonlyMap<string, number>): CandidateSpec =>
  overTable(environment, table, environment.base.preprocessing)

// BFS that reports its operator calls but no expansions
const hidingExpansions = candidate(SOLVER_CONTROLS, 'hidingExpansions')

function importsOf(file: string): string[] {
  const out: string[] = []

  for (const match of readFileSync(join(BASE, file), 'utf8').matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)) {
    out.push(match[1]!)
  }

  return out
}

/** One row of held-out results: level-1 A* against learned A*, in measured expansions and counted calls. */
interface Row { starts: number; aStar: number; learned: number; aStarCalls: number; learnedCalls: number; worse: number }

const NO_ROW: Row = { starts: 0, aStar: 0, learned: 0, aStarCalls: 0, learnedCalls: 0, worse: 0 }

function addRow(a: Row, b: Row): Row {
  return {
    starts: a.starts + b.starts,
    aStar: a.aStar + b.aStar,
    learned: a.learned + b.learned,
    aStarCalls: a.aStarCalls + b.aStarCalls,
    learnedCalls: a.learnedCalls + b.learnedCalls,
    worse: a.worse + b.worse,
  }
}

interface EnvironmentResult {
  environment: LearningEnvironment
  learned: Learned
  heldOut: number
  bfsExpansions: number
  /** held-out starts outside the table's support (the headline) and inside it */
  outside: Row
  inside: Row
  /** held-out learned expansions over a table learned from the first half of the training starts, all starts */
  halfLearned: number
  halfOutsideLearned: number
  halfCharge: Preprocessing
  /** what the teacher's solves read, charged once (the base table), and charged once per solve (the old convention) */
  teacherTablesOnce: number
  teacherTablesPerSolve: number
  failures: string[]
}

const callsOf = (grade: Grade<MeshState>): number => grade.counted.applicable + grade.counted.apply + grade.counted.cost

function learnOn(environment: LearningEnvironment, training = environment.training): Learned {
  return evaluateLearning({
    build: honest,
    teacher: searchOn('aStar', environment),
    training,
    operators: environment.operators,
  })
}

function learnedGrade(environment: LearningEnvironment, learned: Learned, problem: Problem<MeshState>): Grade<MeshState> {
  return evaluate(overTable(environment, learned.table, addPreprocessing(environment.base.preprocessing, learned.charge)), problem, environment.operators)
}

function runEnvironment(environment: LearningEnvironment): EnvironmentResult {
  const failures: string[] = []

  const fail = (message: string): void => {
    if (failures.length < 10) {
      failures.push(message)
    }
  }

  const key = environment.training[0]!.key
  const learned = learnOn(environment)

  if (!learned.accepted) {
    fail(`${environment.id} learning rejected: ${learned.violations[0]}`)
  }

  if (learned.training.some(grade => !grade.solved)) {
    fail(`${environment.id}: a teacher solve failed`)
  }

  if (learned.proposed !== 0) {
    fail(`${environment.id}: a level-2 learner proposed ${learned.proposed} operators`)
  }

  // the table is right: exact on taught paths, admissible everywhere
  for (const [entry, value] of learned.table) {
    const truth = environment.oracle[agentOfKey(entry)]!

    if (truth < 0 || value > truth) {
      fail(`${environment.id}: table value ${value} above the exact ${truth}`)
    }
  }

  for (const grade of learned.training) {
    for (const state of grade.solution.states) {
      const truth = environment.oracle[agentOfKey(key(state))]!

      if (learned.table.get(key(state)) !== truth) {
        fail(`${environment.id}: taught path value ${learned.table.get(key(state))}, exact ${truth}`)
      }
    }
  }

  const half = learnOn(environment, environment.training.slice(0, Math.max(1, Math.ceil(environment.training.length / 2))))

  if (!half.accepted) {
    fail(`${environment.id} half learning rejected: ${half.violations[0]}`)
  }

  let bfsExpansions = 0
  let outside = NO_ROW
  let inside = NO_ROW
  let halfLearned = 0
  let halfOutsideLearned = 0

  for (const problem of environment.heldOut) {
    const truth = environment.oracle[environment.startOf.get(problem.id)!]!
    const bfs = evaluate(breadthFirst, problem, environment.operators)
    const aStar = evaluate(searchOn('aStar', environment), problem, environment.operators)
    const mine = learnedGrade(environment, learned, problem)
    const halfGrade = learnedGrade(environment, half, problem)

    for (const [name, grade] of [
      ['BFS', bfs],
      ['A*', aStar],
      ['learned A*', mine],
      ['half-learned A*', halfGrade],
    ] as const) {
      if (!grade.solved || grade.violations.length > 0) {
        fail(`${problem.id} ${name}: solved ${grade.solved}, ${grade.violations[0] ?? 'no violation'}`)
      }
    }

    if (bfs.cost !== truth) {
      fail(`${problem.id}: BFS ${bfs.cost}, oracle ${truth}`)
    }

    if (aStar.cost !== bfs.cost || mine.cost !== bfs.cost || halfGrade.cost !== bfs.cost) {
      fail(`${problem.id}: A* ${aStar.cost}, learned A* ${mine.cost}, half ${halfGrade.cost}, BFS ${bfs.cost}`)
    }

    // the evaluator charged the learning itself, from the sealed table the solve read
    if (mine.charge.expansions < learned.charge.expansions) {
      fail(`${problem.id}: learned A* charged ${mine.charge.expansions}, the learning cost ${learned.charge.expansions}`)
    }

    bfsExpansions += bfs.measured.expansions

    const row: Row = {
      starts: 1,
      aStar: aStar.measured.expansions,
      learned: mine.measured.expansions,
      aStarCalls: callsOf(aStar),
      learnedCalls: callsOf(mine),
      worse: mine.measured.expansions > aStar.measured.expansions ? 1 : 0,
    }
    const inTable = learned.table.has(problem.key(problem.initial))

    if (inTable) {
      inside = addRow(inside, row)
    } else {
      outside = addRow(outside, row)
      halfOutsideLearned += halfGrade.measured.expansions
    }

    halfLearned += halfGrade.measured.expansions
  }

  return {
    environment,
    learned,
    heldOut: environment.heldOut.length,
    bfsExpansions,
    outside,
    inside,
    halfLearned,
    halfOutsideLearned,
    halfCharge: half.charge,
    teacherTablesOnce: learned.teacherArtifacts.expansions,
    teacherTablesPerSolve: learned.training.reduce((total, grade) => total + grade.charge.expansions, 0),
    failures,
  }
}

function digest(results: readonly EnvironmentResult[]): string {
  return results
    .map(
      r =>
        `${r.environment.id}:${r.learned.table.size}:${r.learned.tableBytes}:${r.learned.charge.expansions}:${r.learned.charge.operatorCalls}:${r.outside.learned}:${r.inside.learned}:${r.outside.aStar}:${r.inside.learnedCalls}:${[...r.learned.table].map(([k, v]) => `${agentOfKey(k)}=${v}`).join('.')}`,
    )
    .join(';')
}

const ratio = (gain: number, cost: number): number => (cost > 0 ? gain / cost : 0)
const fixed = (value: number): number => Number(value.toFixed(4))

export default experiment({
  id: 'intelligence/learning',
  code: 'E-CMP-0028',
  title:
    'intelligence level 2: a deterministic learner observes verified A* experiences on the maze and obstacle fields of the twelve lab geometries and learns an exact cost-to-go table with one-ring lower bounds; A* over it solves held-out starts, fixed before learning, optimally (checked against breadth-first search), and the headline is the cut in measured search on the held-out starts outside the table, while the outside evaluator meters and charges all the learning itself and rejects every learner or solver that hides it',
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

    const environments = learningEnvironments()
    const results: EnvironmentResult[] = []

    let skipped = 0

    for (const environment of environments) {
      if (environment.training.length === 0 || environment.heldOut.length === 0) {
        skipped++
        continue
      }

      const result = runEnvironment(environment)

      result.failures.forEach(fail)
      results.push(result)
    }

    const sum = (pick: (r: EnvironmentResult) => number): number => results.reduce((total, r) => total + pick(r), 0)
    const outside = results.reduce((row, r) => addRow(row, r.outside), NO_ROW)
    const inside = results.reduce((row, r) => addRow(row, r.inside), NO_ROW)
    const all = addRow(outside, inside)
    const heldOut = sum(r => r.heldOut)
    const trainingStarts = sum(r => r.environment.training.length)
    const bfsExpansions = sum(r => r.bfsExpansions)
    const halfLearned = sum(r => r.halfLearned)
    const halfOutsideLearned = sum(r => r.halfOutsideLearned)
    const learningExpansions = sum(r => r.learned.charge.expansions)
    const learningCalls = sum(r => r.learned.charge.operatorCalls)
    const learnerOwnExpansions = sum(r => r.learned.learnerMetered.expansions)
    const learnerOwnCalls = sum(r => r.learned.learnerMetered.operatorCalls)
    const halfLearningExpansions = sum(r => r.halfCharge.expansions)
    const tableEntries = sum(r => r.learned.table.size)
    const tableBytes = sum(r => r.learned.tableBytes)
    const teacherTablesOnce = sum(r => r.teacherTablesOnce)
    const teacherTablesPerSolve = sum(r => r.teacherTablesPerSolve)
    const learningPerSolveTables = learningExpansions - teacherTablesOnce + teacherTablesPerSolve
    const environmentsCutOutside = results.filter(r => r.outside.starts > 0 && r.outside.learned < r.outside.aStar).length
    const environmentsWithOutside = results.filter(r => r.outside.starts > 0).length

    // the headline gate: search falls where the table must generalize
    if (outside.starts === 0) {
      fail('no held-out start lies outside the table: nothing tests generalization')
    } else if (outside.learned >= outside.aStar) {
      fail(`held-out starts outside the table: learned A* ${outside.learned} expansions, level-1 A* ${outside.aStar}: no cut`)
    }

    const outsideGain = outside.aStar - outside.learned
    const allGain = all.aStar - all.learned
    const allGainCalls = all.aStarCalls - all.learnedCalls

    // controls the meter must catch, on four environments
    const controlResults = results.filter(r => CONTROL_ENVIRONMENTS.has(r.environment.id))

    if (controlResults.length !== CONTROL_ENVIRONMENTS.size) {
      fail(`control environments: ${controlResults.length} of ${CONTROL_ENVIRONMENTS.size} present`)
    }

    const learnerControls: [string, CandidateSpec][] = [
      ['hideAll', candidate(LEARNER_CONTROLS, 'underReporting', { change: 'hideAll' })],
      ['hideOneCall', candidate(LEARNER_CONTROLS, 'underReporting', { change: 'hideOneCall' })],
      ['hideOneExpansion', candidate(LEARNER_CONTROLS, 'underReporting', { change: 'hideOneExpansion' })],
      ['hideOneByte', candidate(LEARNER_CONTROLS, 'underReporting', { change: 'hideOneByte' })],
      ['unmeteredStates', candidate(LEARNER_CONTROLS, 'unmetered')],
    ]

    for (const [name, build] of learnerControls) {
      let rejected = 0

      for (const { environment } of controlResults) {
        const grade = evaluateLearning({
          build,
          teacher: searchOn('aStar', environment),
          training: environment.training,
          operators: environment.operators,
        })

        if (!grade.accepted) {
          rejected++
        }
      }

      control[`${name}Rejected`] = rejected

      if (rejected !== controlResults.length) {
        fail(`control ${name}: ${rejected} of ${controlResults.length} rejected`)
      }
    }

    // audit C1: the lazy table is refused and answers nothing; the learner's context is closed at hand-over, and a
    // closed context takes no more calls (shown on a candidate object closed the same way)
    let lazyRejected = 0
    let lazyLookupAnswers = 0
    let proxyRejected = 0

    for (const { environment } of controlResults) {
      const grade = evaluateLearning({
        build: candidate(LEARNER_CONTROLS, 'lazy'),
        teacher: searchOn('aStar', environment),
        training: environment.training,
        operators: environment.operators,
      })

      if (!grade.accepted && grade.violations.some(v => v.includes('not a plain Map'))) {
        lazyRejected++
      }

      for (const problem of environment.heldOut) {
        if (grade.table.get(problem.key(problem.initial)) !== undefined) {
          lazyLookupAnswers++
        }
      }

      // audit 2, n6: a Proxy over the honest table passes every plainness test it traps; the copy fails, and the
      // evaluator records that as a violation instead of throwing
      const proxied = evaluateLearning({
        build: candidate(LEARNER_CONTROLS, 'proxyTable'),
        teacher: searchOn('aStar', environment),
        training: environment.training,
        operators: environment.operators,
      })

      if (!proxied.accepted && proxied.table.size === 0) {
        proxyRejected++
      }
    }

    const closed = openCandidate(candidate('code/intelligence/improve/meta-learner', 'editMetaLearner', { learns: false, proposals: 1 }))

    closed.close()

    let closedContextRefuses = 0

    try {
      closed.call('order')
    } catch {
      closedContextRefuses = 1
    }

    control.lazyTableRejected = lazyRejected
    control.lazyTableAnswersAfterHandOver = lazyLookupAnswers
    control.proxyTableRejected = proxyRejected
    control.closedContextRefusesCalls = closedContextRefuses

    if (lazyRejected !== controlResults.length || lazyLookupAnswers !== 0 || proxyRejected !== controlResults.length || closedContextRefuses !== 1) {
      fail(
        `lazy-table control: ${lazyRejected} rejected of ${controlResults.length}, ${lazyLookupAnswers} lookups answered; proxy table ${proxyRejected} rejected; closed context refuses ${closedContextRefuses}`,
      )
    }

    let hiddenChargeRejected = 0
    let hiddenChargeAcceptedUnsealed = 0
    let hiddenExpansionsRejected = 0
    let hiddenSearchRejected = 0
    let hiddenSearchOldGatePasses = 0
    let solveControls = 0

    for (const { environment, learned } of controlResults) {
      const unsealed = new Map([...learned.table])

      for (const problem of environment.heldOut) {
        solveControls++

        // audit M3: no charge passed in by the caller; the evaluator charges the sealed table it saw read
        if (!evaluate(hidingCharge(environment, learned.table), problem, environment.operators).solved) {
          hiddenChargeRejected++
        }

        // the same solver on a plain copy the evaluator never sealed: accepted, so the hole was real
        if (evaluate(hidingCharge(environment, unsealed), problem, environment.operators).solved) {
          hiddenChargeAcceptedUnsealed++
        }

        if (!evaluate(hidingExpansions, problem, environment.operators).solved) {
          hiddenExpansionsRejected++
        }

        // audit C2: learned A*, its learning charged, reports zero search expansions
        const liar = overTable(environment, learned.table, addPreprocessing(environment.base.preprocessing, learned.charge), SOLVER_CONTROLS, 'hidingSearch')
        const lying = evaluate(liar, problem, environment.operators)

        if (!lying.solved) {
          hiddenSearchRejected++
        }

        // the pre-fix gate: ledger search plus ledger preprocessing at least the states probed
        if (lying.ledger.expansions + lying.ledger.preprocessing.expansions >= lying.measured.expansions) {
          hiddenSearchOldGatePasses++
        }
      }
    }

    control.solveControls = solveControls
    control.hiddenChargeRejected = hiddenChargeRejected
    control.hiddenChargeAcceptedOnUnsealedCopy = hiddenChargeAcceptedUnsealed
    control.hiddenExpansionsRejected = hiddenExpansionsRejected
    control.hiddenSearchLearnedAStarRejected = hiddenSearchRejected
    control.hiddenSearchOldGatePasses = hiddenSearchOldGatePasses

    if (
      solveControls === 0 ||
      hiddenChargeRejected !== solveControls ||
      hiddenExpansionsRejected !== solveControls ||
      hiddenSearchRejected !== solveControls
    ) {
      fail(`solve controls: ${hiddenChargeRejected}, ${hiddenExpansionsRejected} and ${hiddenSearchRejected} of ${solveControls} rejected`)
    }

    if (hiddenChargeAcceptedUnsealed === 0 || hiddenSearchOldGatePasses === 0) {
      fail('a hiding control never showed its hole (unsealed copy never accepted, or the old gate never passed it)')
    }

    // a greedy teacher: suboptimal paths must show up as inadmissible table entries
    let greedyInadmissible = 0
    let greedyEnvironmentsCaught = 0

    for (const { environment } of results) {
      const grade = evaluateLearning({
        build: honest,
        teacher: searchOn('greedy', environment),
        training: environment.training,
        operators: environment.operators,
      })

      let caught = 0

      for (const [entry, value] of grade.table) {
        if (value > environment.oracle[agentOfKey(entry)]!) {
          caught++
        }
      }

      greedyInadmissible += caught

      if (caught > 0) {
        greedyEnvironmentsCaught++
      }
    }

    control.greedyTeacherInadmissibleEntries = greedyInadmissible
    control.greedyTeacherEnvironmentsCaught = greedyEnvironmentsCaught

    if (greedyEnvironmentsCaught === 0) {
      fail('greedy-teacher control: the exactness gate never caught a suboptimal teacher')
    }

    // determinism
    const again = learningEnvironments(['line', '{7,3}']).filter(e => e.training.length > 0 && e.heldOut.length > 0).map(runEnvironment)
    const ids = new Set(again.map(r => r.environment.id))
    const deterministic = again.length > 0 && digest(again) === digest(results.filter(r => ids.has(r.environment.id)))

    if (!deterministic) {
      fail('a second learning and grading gave different numbers')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/learning.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    let forbiddenImports = 0

    for (const file of LEARNER_FILES) {
      for (const target of importsOf(file)) {
        if (target === '@/code' || target.startsWith('node:') || FORBIDDEN_IMPORTS.some(prefix => target.includes(prefix))) {
          forbiddenImports++
          fail(`${file} imports ${target}`)
        }
      }
    }

    const rateOutside = ratio(outsideGain, learningExpansions)
    const rateAll = ratio(allGain, learningExpansions)
    const rateAllCalls = ratio(allGainCalls, learningCalls)
    const rateAllPerSolveTables = ratio(allGain, learningPerSolveTables)

    metrics.environments = results.length
    metrics.environmentsSkipped = skipped
    metrics.trainingStarts = trainingStarts
    metrics.heldOutStarts = heldOut
    metrics.outsideStarts = outside.starts
    metrics.outsideAStarExpansions = outside.aStar
    metrics.outsideLearnedExpansions = outside.learned
    metrics.outsideHalfLearnedExpansions = halfOutsideLearned
    metrics.outsideAStarCalls = outside.aStarCalls
    metrics.outsideLearnedCalls = outside.learnedCalls
    metrics.outsideExpansionCut = fixed(outside.aStar === 0 ? 0 : 1 - outside.learned / outside.aStar)
    metrics.outsideStartsWorse = outside.worse
    metrics.environmentsWithOutsideStarts = environmentsWithOutside
    metrics.environmentsCutOutside = environmentsCutOutside
    metrics.insideStarts = inside.starts
    metrics.insideAStarExpansions = inside.aStar
    metrics.insideLearnedExpansions = inside.learned
    metrics.allAStarExpansions = all.aStar
    metrics.allLearnedExpansions = all.learned
    metrics.allHalfLearnedExpansions = halfLearned
    metrics.allAStarCalls = all.aStarCalls
    metrics.allLearnedCalls = all.learnedCalls
    metrics.allExpansionCut = fixed(all.aStar === 0 ? 0 : 1 - all.learned / all.aStar)
    metrics.bfsHeldOutExpansions = bfsExpansions
    metrics.tableEntries = tableEntries
    metrics.tableBytes = tableBytes
    metrics.learningChargeExpansions = learningExpansions
    metrics.learningChargeCalls = learningCalls
    metrics.learnerOwnExpansions = learnerOwnExpansions
    metrics.learnerOwnCalls = learnerOwnCalls
    metrics.halfLearningChargeExpansions = halfLearningExpansions
    metrics.teacherTablesChargedOnce = teacherTablesOnce
    metrics.learningChargeTablesPerTeacherSolve = learningPerSolveTables
    metrics.outsideGainExpansions = outsideGain
    metrics.allGainExpansions = allGain
    metrics.allGainCalls = allGainCalls
    metrics.netExpansionsAll = allGain - learningExpansions
    metrics.learningRateOutside = fixed(rateOutside)
    metrics.learningRateAll = fixed(rateAll)
    metrics.learningRateAllCalls = fixed(rateAllCalls)
    metrics.learningRateAllTablesPerSolve = fixed(rateAllPerSolveTables)
    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length
    metrics.forbiddenImports = forbiddenImports
    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a solver learns from experience within the mesh (intelligence level 2): from verified experiences on training starts, a deterministic learner builds an exact cost-to-go table with one-ring lower bounds (a learned estimate, not a new operator), and A* over it solves every held-out start optimally (equal to breadth-first search and an independent oracle) with fewer measured expansions than level-1 A* on the held-out starts outside the table, where only generalization helps; the outside evaluator meters the learning, seals the table as plain data, charges every solve that reads it, and rejects every learner or solver that hides any of it',
      metrics,
      control,
      notes: `L2 learning on the maze and obstacle fields of family A, ${results.length} environments (${skipped} skipped with no training or held-out start), ${trainingStarts} training and ${heldOut} held-out starts (positions 0 and 2 mod 4 of the cells that reach the goal, fixed before learning). Every environment has one goal, so the table is a partial distance map to it: ${inside.starts} held-out starts are table keys already (on a taught path or its ring) and ${outside.starts} lie outside it. Headline, the ${outside.starts} starts outside the table (${environmentsWithOutside} environments have any): measured search expansions level-1 A* ${outside.aStar}, learned A* ${outside.learned} (cut ${(100 * (outside.aStar === 0 ? 0 : 1 - outside.learned / outside.aStar)).toFixed(1)}%, ${environmentsCutOutside} of ${environmentsWithOutside} environments cut, ${outside.worse} starts worse; from half the experience ${halfOutsideLearned}). Second row, the ${inside.starts} starts inside the table, where A* reads the answer: level-1 A* ${inside.aStar}, learned A* ${inside.learned}. All held-out starts: BFS ${bfsExpansions}, level-1 A* ${all.aStar}, learned A* ${all.learned} (cut ${(100 * (all.aStar === 0 ? 0 : 1 - all.learned / all.aStar)).toFixed(1)}%), operator calls ${all.aStarCalls} to ${all.learnedCalls}. Every number is the evaluator's: expansions are distinct states it saw consulted (search alone), and the charge of each learned solve is the sealed table's, applied by the evaluator because the solve read it. Learning charged in full: ${learningExpansions} expansions and ${learningCalls} primitive operator calls (teacher solves, the bare-hop table they read counted once per environment (${teacherTablesOnce}), and the learner's own ${learnerOwnExpansions} expansions and ${learnerOwnCalls} calls), table ${tableEntries} entries, ${tableBytes} bytes (two per key code unit plus eight per value). Learning rate L = gain / learning charge: ${rateOutside.toFixed(4)} on the outside starts, ${rateAll.toFixed(4)} on all held-out starts (${rateAllCalls.toFixed(4)} in calls), net ${allGain - learningExpansions} expansions; with the old convention, the table counted once per teacher solve (charge ${learningPerSolveTables}), L = ${rateAllPerSolveTables.toFixed(4)}. Limits: the teacher is level-1 A*, optimal on unit costs, and the learner trusts that its paths are shortest (the greedy-teacher control shows the exactness gate catches a teacher that is not); the meter covers everything that passes through the evaluator (operator calls, states consulted, the plain-data table handed over, every sealed table read); every learner and solver runs isolated in its own context of a worker (${metrics.isolatedSessions} contexts, ${metrics.isolatedRequests} requests served), holding handles to states the evaluator issued, with no file, module or process access, so what it can know beyond the meter is only what its own bundle holds (refused at run time if it reaches the world, and statically by check:layers); the base bare-hop table's charge is declared by the benchmark when it seals the table, not built through metered operators. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
