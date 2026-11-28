// Intelligence level 5, slice 1:
// do the level-4 mesh structures reorganize so that a held-out gain follows from the reorganization? Tested by
// intervention. The level-4 memory (an M4 line register of the static carrier id.CBA.id) is kept across the episodes
// of a learning phase and holds the level-2 value table in balanced ternary; the same learner runs with the forward
// rule knocked out (no rounds), with the structure frozen (no writes), with an adjacent layout whose dynamics do act,
// and as a smuggler whose ring bounds come from candidate code. The mesh is credited only with what the knockout
// loses. Beside it, two judge-side theorem checks: the register's rule is the identity on every valid layout, and the
// M3-B wave's propagator ignores every field an earlier episode left (superposition over F3).
//
// Algebra: spin-1 tones (register), Z3 (wave). Regime: pure. The evaluator (evaluate.ts, isolated candidates) runs the
// teacher, meters and charges the learning, seals the table and grades every held-out solve.
//
// Gates, fixed before the first run, each able to fail:
// - G1 every 6-slot word at spacing 2 reads back unchanged at every round 1 to 48, copy and judge; at spacing 1 some
//   read changes.
// - G2 the candidate's table equals id.CBA.id of pairRulesFromFibers; its round equals a pairTones round.
// - G3 superposition of the linear self-0 wave over every graph, prior, seed and step 1 to 40; the square law fails it.
// - G4 the evaluator accepts every learning of every arm but meshAdjacent, the smuggler included (changed after the
//   first run, disclosed: the evaluator refuses the adjacent arm's negative values, a reported control).
// - G5 the judge certifies every honest arm's report and refuses the smuggler wherever the table holds an off-path
//   ring bound (a nonempty set).
// - G6 meshRegister's sealed table equals meshKnockout's and valueTable's everywhere; their held-out grades are equal.
// - G7 the frozen arm's held-out expansions equal level-1 A*'s on every start.
// - G8 BFS, level-1 A* and the four honest arms graded clean and solved on every held-out start; BFS equals the oracle;
//   meshRegister and meshKnockout costs equal BFS.
// - G9 determinism (a second learning of two environments) and no random or clock source.
// - G10 the sandbox bundle accepts every reorganize arm.

import { resolve } from 'node:path'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { addPreprocessing } from '@/code/intelligence/experience/learner/learned-heuristic'
import { learningEnvironments, type LearningEnvironment } from '@/code/intelligence/experience/learner/navigation-split'
import {
  candidate,
  evaluate,
  evaluateLearning,
  type CandidateSpec,
  type Grade,
  type LearningGrade,
} from '@/code/intelligence/problem/evaluate'
import type { MeshState } from '@/code/intelligence/problem/state'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { ARMS, ROUNDS_PER_OBSERVATION } from '@/code/intelligence/solver/reorganize/catalog'
import {
  BLOCK_DIGITS,
  STATIC_CARRIER,
  cellDigest,
  grow,
  newRegister,
  readCell,
  roundOn,
  writeCell,
} from '@/code/intelligence/solver/reorganize/register-copy'
import type { RegisterReport } from '@/code/intelligence/solver/reorganize/register-learner'
import { pairRulesFromFibers, pairTones } from '@/code/rule/pair-rule'
import { secondOrderZ3Step, type SecondOrderZ3Law } from '@/code/rule/second-order-z3'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const ARM_MODULE = 'code/intelligence/solver/reorganize/catalog'
const HONEST_ARMS = ['meshRegister', 'meshKnockout', 'meshFrozen', 'meshAdjacent'] as const
const ALL_ARMS = [...HONEST_ARMS, 'meshSmuggler'] as const

type ArmName = (typeof ALL_ARMS)[number]

const WORD_SLOTS = 6
const READ_ROUNDS = 48
const WAVE_STEPS = 40
const EPISODES = 4
const EPISODE_STEPS = 7

// ---------------------------------------------------------------- the judge's register round (original rule)

function judgeTable(): Int8Array {
  const rule = pairRulesFromFibers().find(r => r.name === 'id.CBA.id')

  if (rule === undefined) {
    throw new Error('reorganize: id.CBA.id not found')
  }

  return rule.table
}

function judgeRound(cells: number[], table: Int8Array): void {
  for (let color = 0; color < 2; color++) {
    for (let i = color; i + 1 < cells.length; i += 2) {
      const [a, b] = pairTones(table[(cells[i]! + 1) * 3 + cells[i + 1]! + 1]!)

      cells[i] = a
      cells[i + 1] = b
    }
  }
}

// ---------------------------------------------------------------- Part R: every word, every round

interface WordReading { words: number; changedCopy: number; changedJudge: number; copyJudgeDiffer: number }

function readEveryWord(spacing: number, table: Int8Array): WordReading {
  let changedCopy = 0
  let changedJudge = 0
  let copyJudgeDiffer = 0

  const words = 3 ** WORD_SLOTS

  for (let code = 0; code < words; code++) {
    const word = Array.from({ length: WORD_SLOTS }, (_, k) => (Math.floor(code / 3 ** k) % 3) - 1)
    const register = newRegister(spacing)

    grow(register, WORD_SLOTS)
    word.forEach((tone, slot) => writeCell(register, slot, tone))

    const judged = register.cells.slice()

    let copyWrong = false
    let judgeWrong = false
    let differ = false

    for (let r = 0; r < READ_ROUNDS; r++) {
      roundOn(register.cells, STATIC_CARRIER)
      judgeRound(judged, table)

      for (let slot = 0; slot < WORD_SLOTS; slot++) {
        copyWrong ||= readCell(register, slot) !== word[slot]
        judgeWrong ||= (judged[slot * spacing] ?? 0) !== word[slot]
      }

      differ ||= judged.some((tone, i) => tone !== register.cells[i])
    }

    changedCopy += copyWrong ? 1 : 0
    changedJudge += judgeWrong ? 1 : 0
    copyJudgeDiffer += differ ? 1 : 0
  }

  return { words, changedCopy, changedJudge, copyJudgeDiffer }
}

// ---------------------------------------------------------------- Part W: superposition of the wave

function ringNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, v) => [(v + 1) % n, (v + n - 1) % n])
}

function torusNeighbors(side: number): number[][] {
  const at = (x: number, y: number): number => ((y + side) % side) * side + ((x + side) % side)

  return Array.from({ length: side * side }, (_, v) => {
    const x = v % side
    const y = (v - x) / side

    return [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)]
  })
}

function cubeNeighbors(dimension: number): number[][] {
  return Array.from({ length: 2 ** dimension }, (_, v) => Array.from({ length: dimension }, (_, bit) => v ^ (1 << bit)))
}

function completeNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, v) => Array.from({ length: n }, (_, u) => u).filter(u => u !== v))
}

interface Pair { previous: Uint8Array; current: Uint8Array }

function stepPair(neighbors: number[][], pair: Pair, law: SecondOrderZ3Law): Pair {
  return { previous: pair.current, current: secondOrderZ3Step({ neighbors, previous: pair.previous, current: pair.current, law }) }
}

/** The fields episodes leave: episode k adds a seed at vertex k - 1 to the current slice and runs EPISODE_STEPS. */
function priorsOf(neighbors: number[][], law: SecondOrderZ3Law): Pair[] {
  const n = neighbors.length

  let pair: Pair = { previous: new Uint8Array(n), current: new Uint8Array(n) }

  const priors: Pair[] = []

  for (let k = 0; k < EPISODES; k++) {
    const current = pair.current.slice()

    current[k % n] = (current[k % n]! + 1) % 3
    pair = { previous: pair.previous.slice(), current }

    for (let t = 0; t < EPISODE_STEPS; t++) {
      pair = stepPair(neighbors, pair, law)
    }

    priors.push(pair)
  }

  return priors
}

interface Superposition { checks: number; failures: number }

function superposition(neighbors: number[][], law: SecondOrderZ3Law, stopAtFirst: boolean): Superposition {
  const n = neighbors.length

  let checks = 0
  let failures = 0

  for (const prior of priorsOf(neighbors, law)) {
    for (let u = 0; u < n; u++) {
      const seededCurrent = prior.current.slice()

      seededCurrent[u] = (seededCurrent[u]! + 1) % 3

      let both: Pair = { previous: prior.previous, current: seededCurrent }
      let old: Pair = prior

      const lone = new Uint8Array(n)

      lone[u] = 1

      let fresh: Pair = { previous: new Uint8Array(n), current: lone }

      for (let t = 0; t < WAVE_STEPS; t++) {
        both = stepPair(neighbors, both, law)
        old = stepPair(neighbors, old, law)
        fresh = stepPair(neighbors, fresh, law)
        checks++

        for (let i = 0; i < n; i++) {
          if ((both.current[i]! + 3 - old.current[i]!) % 3 !== fresh.current[i]) {
            failures++

            if (stopAtFirst) {
              return { checks, failures }
            }

            break
          }
        }
      }
    }
  }

  return { checks, failures }
}

// ---------------------------------------------------------------- Part L: the judge's replay of a register report

function readRegisterReport(raw: unknown): RegisterReport | null {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  const r = raw as Record<string, unknown>
  const integers = ['spacing', 'rounds', 'blockDigits', 'roundsRun', 'pairUpdates', 'writes', 'finalCells', 'finalDigest']

  if (r.kind !== 'mesh-register' || integers.some(name => !Number.isInteger(r[name])) || typeof r.overflow !== 'boolean') {
    return null
  }

  if (!Array.isArray(r.keys) || r.keys.some(k => typeof k !== 'string') || !Array.isArray(r.observations)) {
    return null
  }

  for (const o of r.observations as unknown[]) {
    const obs = o as Record<string, unknown>

    if (typeof o !== 'object' || o === null || !Number.isInteger(obs.cells) || !Array.isArray(obs.writes) || obs.writes.some(w => !Number.isInteger(w))) {
      return null
    }
  }

  return raw as RegisterReport
}

interface Replay {
  /** the decoded table, or null with a reason when the report cannot be replayed */
  table: Map<string, number> | null
  reason: string
  /** the same writes with the rounds knocked out */
  knockout: Map<string, number> | null
}

function replay(report: RegisterReport, table: Int8Array, rounds: number): { decoded: Map<string, number> | null; reason: string; cells: number[] } {
  const cells: number[] = []
  const slots = report.keys.length * report.blockDigits

  let roundsRun = 0

  for (const obs of report.observations) {
    if (obs.cells < cells.length || obs.writes.length % 2 !== 0) {
      return { decoded: null, reason: 'register shrank or a write is unpaired', cells }
    }

    while (cells.length < obs.cells) {
      cells.push(0)
    }

    for (let w = 0; w < obs.writes.length; w += 2) {
      const slot = obs.writes[w]!
      const tone = obs.writes[w + 1]!
      const at = slot * report.spacing

      if (slot < 0 || slot >= slots || at >= cells.length || tone < -1 || tone > 1) {
        return { decoded: null, reason: `write outside the register (slot ${slot}, tone ${tone})`, cells }
      }

      cells[at] = tone
    }

    for (let k = 0; k < rounds; k++) {
      judgeRound(cells, table)
      roundsRun++
    }
  }

  if (rounds === report.rounds && (roundsRun !== report.roundsRun || cells.length !== report.finalCells || cellDigest(cells) !== report.finalDigest)) {
    return { decoded: null, reason: 'replayed rounds, length or final cells differ from the report', cells }
  }

  const decoded = new Map<string, number>()

  for (let block = 0; block < report.keys.length; block++) {
    let value = 0

    for (let k = report.blockDigits - 1; k >= 0; k--) {
      value = value * 3 + (cells[(block * report.blockDigits + k) * report.spacing] ?? 0)
    }

    decoded.set(report.keys[block]!, value)
  }

  return { decoded, reason: '', cells }
}

function sameTable(a: ReadonlyMap<string, number>, b: ReadonlyMap<string, number>): boolean {
  if (a.size !== b.size) {
    return false
  }

  for (const [key, value] of a) {
    if (b.get(key) !== value) {
      return false
    }
  }

  return true
}

function differing(a: ReadonlyMap<string, number>, b: ReadonlyMap<string, number>): number {
  let count = 0

  for (const [key, value] of a) {
    if (b.get(key) !== value) {
      count++
    }
  }

  return count + [...b.keys()].filter(key => !a.has(key)).length
}

function judge(name: ArmName, learned: LearningGrade<MeshState>, table: Int8Array): Replay {
  const settings = ARMS[name]!
  const report = readRegisterReport(learned.report)

  if (report === null) {
    return { table: null, reason: 'no readable register report', knockout: null }
  }

  if (report.spacing !== settings.spacing || report.rounds !== settings.rounds || report.blockDigits !== BLOCK_DIGITS || report.overflow) {
    return { table: null, reason: 'the report does not claim the arm it is', knockout: null }
  }

  const run = replay(report, table, report.rounds)

  if (run.decoded === null) {
    return { table: null, reason: run.reason, knockout: null }
  }

  const knockout = replay(report, table, 0).decoded

  if (!sameTable(run.decoded, learned.table)) {
    return { table: null, reason: `the replayed register decodes to a different table (${differing(run.decoded, learned.table)} entries)`, knockout }
  }

  return { table: run.decoded, reason: '', knockout }
}

// ---------------------------------------------------------------- Part L: environments

const valueTable = candidate('code/intelligence/experience/learner/catalog', 'valueTable')
const breadthFirst = candidate(SOLVER_CATALOG, 'breadthFirst')

const baseHeuristic = (environment: LearningEnvironment) => ({ id: environment.base.id, estimate: 'base', preprocessing: environment.base.preprocessing })

const aStarOn = (environment: LearningEnvironment): CandidateSpec =>
  candidate(SOLVER_CATALOG, 'aStar', { heuristic: baseHeuristic(environment) }, { base: environment.base.estimate })

function overTable(environment: LearningEnvironment, learned: LearningGrade<MeshState>): CandidateSpec {
  return candidate(
    SOLVER_CATALOG,
    'aStar',
    { heuristic: { id: `${environment.base.id}+learned`, estimate: 'base', table: 'table', preprocessing: addPreprocessing(environment.base.preprocessing, learned.charge) } },
    { base: environment.base.estimate, table: learned.table },
  )
}

function learn(environment: LearningEnvironment, build: CandidateSpec): LearningGrade<MeshState> {
  return evaluateLearning({ build, teacher: aStarOn(environment), training: environment.training, operators: environment.operators })
}

interface Row { starts: number; expansions: number; calls: number; optimal: number; clean: number }

const NO_ROW: Row = { starts: 0, expansions: 0, calls: 0, optimal: 0, clean: 0 }

const addRow = (a: Row, b: Row): Row => ({
  starts: a.starts + b.starts,
  expansions: a.expansions + b.expansions,
  calls: a.calls + b.calls,
  optimal: a.optimal + b.optimal,
  clean: a.clean + b.clean,
})

const callsOf = (grade: Grade<MeshState>): number => grade.counted.applicable + grade.counted.apply + grade.counted.cost

type Solver = 'aStar' | (typeof HONEST_ARMS)[number]

const SOLVERS: readonly Solver[] = ['aStar', ...HONEST_ARMS]

interface EnvironmentResult {
  id: string
  heldOut: number
  outside: Record<Solver, Row>
  inside: Record<Solver, Row>
  charge: Record<(typeof HONEST_ARMS)[number], number>
  accepted: Record<ArmName, boolean>
  certified: Record<ArmName, boolean>
  /** entries the forward rule changed (replay with rounds against replay without) */
  dynamicsChanged: Record<ArmName, number>
  offPathBounds: number
  failures: string[]
}

const emptyRows = (): Record<Solver, Row> => ({ aStar: NO_ROW, meshRegister: NO_ROW, meshKnockout: NO_ROW, meshFrozen: NO_ROW, meshAdjacent: NO_ROW })

function runEnvironment(environment: LearningEnvironment, table: Int8Array): EnvironmentResult {
  const failures: string[] = []

  const fail = (message: string): void => {
    if (failures.length < 10) {
      failures.push(`${environment.id}: ${message}`)
    }
  }

  const reference = learn(environment, valueTable)
  const learned = {} as Record<ArmName, LearningGrade<MeshState>>
  const accepted = {} as Record<ArmName, boolean>
  const certified = {} as Record<ArmName, boolean>
  const dynamicsChanged = {} as Record<ArmName, number>

  for (const name of ALL_ARMS) {
    const grade = learn(environment, candidate(ARM_MODULE, name))
    const verdictOf = judge(name, grade, table)

    learned[name] = grade
    accepted[name] = grade.accepted
    certified[name] = verdictOf.table !== null

    // the smuggler must be refused for the one reason it should be: its register decodes to less than its table
    if (name === 'meshSmuggler' && verdictOf.table === null && !verdictOf.reason.startsWith('the replayed register decodes')) {
      fail(`the smuggler was refused for another reason: ${verdictOf.reason}`)
    }

    dynamicsChanged[name] = verdictOf.table !== null && verdictOf.knockout !== null ? differing(verdictOf.table, verdictOf.knockout) : -1

    // meshAdjacent is exempt: its forward rule can turn digits into a
    // negative cost-to-go, which the evaluator rightly refuses; that refusal is reported as a control
    if (!grade.accepted && name !== 'meshAdjacent') {
      fail(`${name} learning rejected by the evaluator: ${grade.violations[0]}`)
    }

    if (name !== 'meshSmuggler' && verdictOf.table === null) {
      fail(`${name} report refused by the judge: ${verdictOf.reason}`)
    }
  }

  // off-path ring bounds: entries of the value table on no taught path
  const pathKeys = new Set<string>()

  // the learner's own definition: states of experiences the evaluator verified (utility above 0)
  for (const experience of reference.experiences) {
    if (experience.utility > 0) {
      for (const state of experience.solution.states) {
        pathKeys.add(environment.training[0]!.key(state))
      }
    }
  }

  const offPathBounds = [...reference.table.keys()].filter(key => !pathKeys.has(key)).length

  if (!sameTable(learned.meshSmuggler.table, reference.table)) {
    fail('the smuggler table is not the value table')
  }

  if (offPathBounds > 0 && certified.meshSmuggler) {
    fail('the judge certified the smuggler, whose ring bounds never were in the register')
  }

  // G6: the knockout is the mesh
  if (!sameTable(learned.meshRegister.table, learned.meshKnockout.table) || !sameTable(learned.meshKnockout.table, reference.table)) {
    fail('meshRegister, meshKnockout and valueTable tables differ')
  }

  const support = learned.meshKnockout.table
  const outside = emptyRows()
  const inside = emptyRows()

  for (const problem of environment.heldOut) {
    const truth = environment.oracle[environment.startOf.get(problem.id)!]!
    const bfs = evaluate(breadthFirst, problem, environment.operators)
    const grades: Record<Solver, Grade<MeshState>> = {
      aStar: evaluate(aStarOn(environment), problem, environment.operators),
      meshRegister: evaluate(overTable(environment, learned.meshRegister), problem, environment.operators),
      meshKnockout: evaluate(overTable(environment, learned.meshKnockout), problem, environment.operators),
      meshFrozen: evaluate(overTable(environment, learned.meshFrozen), problem, environment.operators),
      meshAdjacent: evaluate(overTable(environment, learned.meshAdjacent), problem, environment.operators),
    }

    if (!bfs.solved || bfs.violations.length > 0 || bfs.cost !== truth) {
      fail(`${problem.id} BFS solved ${bfs.solved}, cost ${bfs.cost}, oracle ${truth}`)
    }

    for (const name of SOLVERS) {
      const grade = grades[name]

      if (!grade.solved || grade.violations.length > 0) {
        fail(`${problem.id} ${name}: solved ${grade.solved}, ${grade.violations[0] ?? 'no violation'}`)
      }
    }

    for (const name of ['aStar', 'meshRegister', 'meshKnockout'] as const) {
      if (grades[name].cost !== bfs.cost) {
        fail(`${problem.id} ${name} cost ${grades[name].cost}, BFS ${bfs.cost}`)
      }
    }

    const m = grades.meshRegister
    const k = grades.meshKnockout

    if (m.measured.expansions !== k.measured.expansions || callsOf(m) !== callsOf(k) || m.cost !== k.cost) {
      fail(`${problem.id}: meshRegister and meshKnockout grades differ`)
    }

    if (grades.meshFrozen.measured.expansions !== grades.aStar.measured.expansions) {
      fail(`${problem.id}: frozen ${grades.meshFrozen.measured.expansions} expansions, level-1 A* ${grades.aStar.measured.expansions}`)
    }

    const rows = support.has(problem.key(problem.initial)) ? inside : outside

    for (const name of SOLVERS) {
      const grade = grades[name]

      rows[name] = addRow(rows[name], {
        starts: 1,
        expansions: grade.measured.expansions,
        calls: callsOf(grade),
        optimal: grade.solved && grade.cost === bfs.cost ? 1 : 0,
        clean: grade.violations.length === 0 ? 1 : 0,
      })
    }
  }

  return {
    id: environment.id,
    heldOut: environment.heldOut.length,
    outside,
    inside,
    charge: {
      meshRegister: learned.meshRegister.charge.expansions,
      meshKnockout: learned.meshKnockout.charge.expansions,
      meshFrozen: learned.meshFrozen.charge.expansions,
      meshAdjacent: learned.meshAdjacent.charge.expansions,
    },
    accepted,
    certified,
    dynamicsChanged,
    offPathBounds,
    failures,
  }
}

function learningDigest(environments: readonly LearningEnvironment[]): string {
  return environments
    .map(environment => {
      const grade = learn(environment, candidate(ARM_MODULE, 'meshRegister'))
      const report = readRegisterReport(grade.report)

      return `${environment.id}:${grade.table.size}:${[...grade.table].map(([k, v]) => `${k}.${v}`).join(',')}:${report?.finalDigest}:${report?.pairUpdates}`
    })
    .join(';')
}

export default experiment({
  id: 'intelligence/reorganize',
  code: 'E-CMP-0064',
  title:
    'intelligence level 5, slice 1: whether the level-4 mesh structures reorganize so that a held-out gain follows; the M4 register kept across a learning phase holds the level-2 value table, and a dynamics knockout, a frozen structure, an adjacent layout and a smuggler, all isolated candidates graded by the outside evaluator and replayed by a judge with the original rule, say what the mesh itself contributes; beside it the register is the identity on every valid layout and the M3-B wave obeys superposition, so its propagator ignores every earlier episode',
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

    const table = judgeTable()

    // G2: the copy certificate
    if (Array.from(table).join(',') !== STATIC_CARRIER.join(',')) {
      fail('the register copy is not id.CBA.id')
    }

    let roundDifferences = 0
    let probe = Array.from({ length: 24 }, (_, i) => ((i * 7) % 3) - 1)

    for (let r = 0; r < 10; r++) {
      const mine = probe.slice()

      roundOn(mine, STATIC_CARRIER)
      judgeRound(probe, table)

      if (probe.some((tone, i) => tone !== mine[i])) {
        roundDifferences++
      }

      probe = mine
    }

    if (roundDifferences > 0) {
      fail(`the register round differs from the pairTones round at ${roundDifferences} of 10 rounds`)
    }

    // G1: Part R
    const spaced = readEveryWord(2, table)
    const adjacent = readEveryWord(1, table)

    if (spaced.changedCopy > 0 || spaced.changedJudge > 0 || spaced.copyJudgeDiffer > 0) {
      fail(`spacing 2: ${spaced.changedCopy} words changed (copy), ${spaced.changedJudge} (judge), ${spaced.copyJudgeDiffer} differ`)
    }

    if (adjacent.changedJudge === 0) {
      fail('spacing 1: no word ever changed (the read cannot see dynamics)')
    }

    // G3: Part W
    const graphs: [string, number[][]][] = [
      ['C16', ringNeighbors(16)],
      ['torus 8x8', torusNeighbors(8)],
      ['Q6', cubeNeighbors(6)],
      ['K9', completeNeighbors(9)],
    ]
    const linear: SecondOrderZ3Law = { kind: 'linear', self: 0 }
    const square: SecondOrderZ3Law = { kind: 'square', self: 0 }

    let superChecks = 0
    let superFailures = 0
    let squareFailures = 0

    for (const [name, neighbors] of graphs) {
      const reading = superposition(neighbors, linear, false)

      superChecks += reading.checks
      superFailures += reading.failures

      if (reading.failures > 0) {
        fail(`${name}: superposition fails at ${reading.failures} of ${reading.checks} steps`)
      }

      squareFailures += superposition(neighbors, square, true).failures
    }

    if (squareFailures === 0) {
      fail('the square law obeys superposition everywhere: the check cannot fail')
    }

    // G10: the bundle
    for (const name of ALL_ARMS) {
      const bundled = candidateBundle(ARM_MODULE, name, 'learner')

      if (!bundled.ok) {
        fail(`the ${name} bundle was refused: ${bundled.reason}`)
      }
    }

    // Part L
    const environments = learningEnvironments().filter(e => e.training.length > 0 && e.heldOut.length > 0)
    const results = environments.map(environment => runEnvironment(environment, table))

    results.forEach(r => r.failures.forEach(fail))

    const total = (pick: (r: EnvironmentResult) => Row): Row => results.reduce((row, r) => addRow(row, pick(r)), NO_ROW)
    const outside = Object.fromEntries(SOLVERS.map(name => [name, total(r => r.outside[name])])) as Record<Solver, Row>
    const inside = Object.fromEntries(SOLVERS.map(name => [name, total(r => r.inside[name])])) as Record<Solver, Row>
    const charge = (name: (typeof HONEST_ARMS)[number]): number => results.reduce((sum, r) => sum + r.charge[name], 0)

    for (const name of ALL_ARMS) {
      const acceptedCount = results.filter(r => r.accepted[name]).length
      const certifiedCount = results.filter(r => r.certified[name]).length

      metrics[`${name}Accepted`] = acceptedCount
      metrics[`${name}Certified`] = certifiedCount
      metrics[`${name}DynamicsChangedEntries`] = results.reduce((sum, r) => sum + Math.max(0, r.dynamicsChanged[name]), 0)
    }

    const smugglerSet = results.filter(r => r.offPathBounds > 0)
    const smugglerRefused = smugglerSet.filter(r => !r.certified.meshSmuggler).length

    if (smugglerSet.length === 0) {
      fail('no environment has an off-path ring bound: the smuggler control is empty')
    }

    control.smugglerEnvironments = smugglerSet.length
    control.smugglerEvaluatorAccepted = results.filter(r => r.accepted.meshSmuggler).length
    control.smugglerJudgeRefused = smugglerRefused
    control.adjacentEvaluatorRejected = results.filter(r => !r.accepted.meshAdjacent).length
    control.frozenOutsideExpansions = outside.meshFrozen.expansions
    control.levelOneOutsideExpansions = outside.aStar.expansions

    // the credit the mesh earns: what the knockout loses, on the outside row (clean and optimal everywhere, G8)
    const credit = outside.meshKnockout.expansions - outside.meshRegister.expansions
    const creditInside = inside.meshKnockout.expansions - inside.meshRegister.expansions
    const adjacentCredit = outside.meshKnockout.expansions - outside.meshAdjacent.expansions
    const adjacentNonOptimal = outside.meshAdjacent.starts - outside.meshAdjacent.optimal + inside.meshAdjacent.starts - inside.meshAdjacent.optimal
    const environmentsDynamicsActed = results.filter(r => r.dynamicsChanged.meshAdjacent > 0).length
    const heldOut = results.reduce((sum, r) => sum + r.heldOut, 0)
    const all = (name: Solver): Row => addRow(outside[name], inside[name])
    const net = (name: (typeof HONEST_ARMS)[number]): number => all('aStar').expansions - (all(name).expansions + charge(name))

    if (results.some(r => r.dynamicsChanged.meshRegister !== 0)) {
      fail('the forward rule changed an entry of a spacing-2 register')
    }

    // G9
    const again = environments.filter(e => e.id === 'maze-{4,4}' || e.id === 'obstacle-{5,4}')

    if (again.length !== 2 || learningDigest(again) !== learningDigest(again)) {
      fail('a second learning gave a different table or register')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/reorganize.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    const constructed = credit > 0
    const ok = failures.length === 0

    metrics.environments = results.length
    metrics.heldOut = heldOut
    metrics.outsideStarts = outside.aStar.starts
    metrics.insideStarts = inside.aStar.starts
    metrics.registerWords = spaced.words
    metrics.registerWordsChangedSpacing2 = spaced.changedJudge
    metrics.registerWordsChangedSpacing1 = adjacent.changedJudge
    metrics.copyRoundDifferences = roundDifferences
    metrics.superpositionChecks = superChecks
    metrics.superpositionFailures = superFailures
    metrics.squareLawFailures = squareFailures
    metrics.credit = credit
    metrics.creditInside = creditInside
    metrics.adjacentCredit = adjacentCredit
    metrics.adjacentNonOptimal = adjacentNonOptimal
    metrics.environmentsDynamicsActed = environmentsDynamicsActed
    metrics.roundsPerObservation = ROUNDS_PER_OBSERVATION

    for (const name of SOLVERS) {
      metrics[`${name}OutsideExpansions`] = outside[name].expansions
      metrics[`${name}InsideExpansions`] = inside[name].expansions
      metrics[`${name}OutsideCalls`] = outside[name].calls
      metrics[`${name}Optimal`] = outside[name].optimal + inside[name].optimal
    }

    for (const name of HONEST_ARMS) {
      metrics[`${name}Charge`] = charge(name)
      metrics[`${name}NetGain`] = net(name)
    }

    metrics.deterministic = failures.some(f => f.startsWith('a second learning')) ? 0 : 1
    metrics.sourceFilesScanned = files.length

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const verdictText = constructed
      ? `the mesh is credited with ${credit} expansions on the outside row: a construction`
      : `the mesh is credited with ${credit} expansions on the outside row (the knockout loses nothing): a sharp no-go for the level-4 components`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 5, slice 1: kept across a learning phase on ${results.length} maze and obstacle environments, the M4 register holding the level-2 value table cuts level-1 A*'s search on the ${outside.aStar.starts} held-out starts outside its support from ${outside.aStar.expansions} to ${outside.meshRegister.expansions} expansions (net of the learning charge over all ${heldOut} starts: ${net('meshRegister')}), but its dynamics knockout cuts it exactly as far, so ${verdictText}: on every valid layout the register's rule is the identity (${spaced.words} words, 48 rounds, 0 changed reads; ${adjacent.changedJudge} change at spacing 1), and the M3-B wave obeys superposition over F3 (${superChecks} checks, 0 failures), so a new seed's front is the same whatever earlier episodes left; the frozen structure gains nothing (${outside.meshFrozen.expansions} against ${outside.aStar.expansions}); where the forward rule does act (spacing 1, ${environmentsDynamicsActed} environments changed) it only damages: the evaluator refuses ${control.adjacentEvaluatorRejected} of ${results.length} of its tables (negative cost-to-go values), and graded anyway its credit is ${adjacentCredit} with ${adjacentNonOptimal} non-optimal solves; the judge refuses the smuggler in ${smugglerRefused} of ${smugglerSet.length} environments, which the evaluator alone accepts`,
      metrics,
      control,
      notes: `L2. Causal test by intervention: the mesh is credited only with what the dynamics knockout (the same learner, ports and decisions, no rounds) loses. Outside the knockout table's support (the J3 headline) per solver, expansions / operator calls / optimal of starts: ${SOLVERS.map(n => `${n} ${outside[n].expansions} / ${outside[n].calls} / ${outside[n].optimal} of ${outside[n].starts}`).join('; ')}. Inside: ${SOLVERS.map(n => `${n} ${inside[n].expansions} / ${inside[n].optimal} of ${inside[n].starts}`).join('; ')}. Learning charge (expansions): ${HONEST_ARMS.map(n => `${n} ${charge(n)}`).join(', ')}; net gain against level-1 A* over all held-out starts (A* expansions minus the arm's expansions and its charge): ${HONEST_ARMS.map(n => `${n} ${net(n)}`).join(', ')}. Judge: every honest report replayed with id.CBA.id of pairRulesFromFibers through pairTones and decoded equal to the sealed table (${HONEST_ARMS.map(n => `${n} ${metrics[`${n}Certified`]} of ${results.length}`).join(', ')}); entries the forward rule changed (replay with against without rounds): ${ALL_ARMS.map(n => `${n} ${metrics[`${n}DynamicsChangedEntries`]}`).join(', ')}. Why no credit is possible for these components: the register's rule swaps only the sum-0 pairs (-1,+1) and (+1,-1), which no valid layout ever forms, so its knockout is itself; the wave is linear, so run(prior + seed) - run(prior) = run(seed) and its propagator ignores history; the models add that no fixed rule completes an erased or flipped tone (M7), no collective mode is credited (M8), damage never heals (M4, M9) and nothing breeds true (M10), so a structure the rule changes is a structure it damages, as the spacing-1 arm shows. Limits: the write policy is candidate code (the value-table logic); held-out means held-out starts in a trained environment; one encoding (balanced ternary, ${BLOCK_DIGITS} slots per entry) and ${ROUNDS_PER_OBSERVATION} rounds per observation; pair-rule structures rewritten by a stream of movers and the Blume-Capel open window are not read here (filed). ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
