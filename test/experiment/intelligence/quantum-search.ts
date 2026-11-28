// Q7 of the quantum ladder (item vibe-computation-intelligence-0014; plan.md sections 7 and 11 of vibe/computation/models,
// decision 001 of vibe/computation/intelligence): what the intelligence lab gains from a quantum walk. The exact Grover walk
// of Q5 runs as a candidate solver (code/intelligence/solver/quantum, named in the solver catalog as quantumWalk) on every
// instance of benchmark family A (E-CMP-0026), isolated in the sandbox, graded by the same outside evaluator and resource
// ledger as the level-1 baselines (breadth-first, A*, IDA*, greedy), and reported as a profile.
//
// What the solver does. Its only access to a problem is the operators the evaluator hands over, so it sweeps the reachable
// state graph breadth first to exhaustion (every operator call metered, every state goal-tested once: the classical cost of
// loading the oracle), walks it with the goal states marked (coin (2/d) J - I, d the least 2^a 3^b at or above the largest
// degree, spare slots reflecting walls, marked coin -I, uniform start, first maximum as in Q5, else the window maximum
// within the cap 4 isqrt(N log2 N) + 16), and returns the breadth-first path to the marked state of largest weight at the
// measured beat. The walk cannot import code/compute/quantum/walk.ts: check:layers rule 2 forbids a candidate the quantum
// lab (and the rules walk.ts reaches), and the sandbox bundle refuses any module outside the candidate folders (gated
// below by the bundle's own refusal). So the solver carries its own exact walk, certified here against walk.ts.
//
// The quantum ledger (beats, success probability and expected repeats as exact numbers, amplitude bytes, arc updates, goal
// tests, states and cells touched) travels in the shared Ledger's typed `quantum` field (item 0021; it rode in the solver id
// before). The evaluator rejects any field it does not know, meters what it can (states swept and goal tests never below
// its count, the probability exactly in [0, 1], the repeats never below 1/p, by ninth-real-sign), and the judge below
// (evaluator side) checks the rest: a claimed success needs a measured probability in (0, 1], the states it walked
// must equal the states the evaluator metered, the walk must be exactly unitary, and on every maze and obstacle instance
// the judge rebuilds the state graph from the benchmark's own wall patterns and recomputes beat and probability with
// walk.ts, compared by ninth-real-sign. The repeats a success probability p < 1 needs are recomputed by the judge, never taken
// from the solver: expected runs 1/p (geometric, and the reported expectedRepeats must equal it exactly), expected oracle
// queries (T + 1)/p (T walk beats and one goal test of the measured state per run).
//
// Accountings, declared before the first full run:
// - every cost counted: the evaluator's operator calls, expansions and bytes (the ledger's peak includes the arc table and
//   the exact amplitude storage), plus the walk's arc updates, against each baseline's (whose walk work is 0); win when
//   solved where the baseline is not, or no worse on every cost and path cost and better on one; loss the mirror; tie
//   equal; split otherwise.
// - quantum queries only (the walk granted the graph as a free quantum oracle, the sweep and the simulation not counted):
//   expected oracle queries (T + 1)/p against the baseline's expansions, where both solve.
// - curvature: per degree-matched pair and kind (base instances, both sides walked), R = (T + 1)^2 / (p N); a difference
//   survives for a kind when its sign is the same in every pair with both sides walked and there are at least two.
//
// Gates, each able to fail: the walk module equals walk.ts at every beat on the hypercubes Q4, Q6, Q8, the square tori 4
// and 8, the cycle C16 and K9 (exact fractions, beat by beat), the no-oracle walk keeps a marked set at exactly M/N; every
// quantum grade clean (no evaluator violation) and accepted by the judge; BFS optimality: the quantum cost never below
// BFS, every instance BFS proves unsolvable never claimed; walk.ts recomputation equal on every wall instance walked;
// the bundle refuses walk.ts and accepts the solver with only candidate modules; determinism (a second grading of two
// geometries, identical ids and numbers); no random number or clock in the sources, no Math call in the quantum modules.
// Negative controls the judge must reject: a breadth-first solver claiming a quantum success with no probability (the
// evaluator alone grades it solved), the honest walk reporting probability 1, the honest walk reporting half its states.
// Negative controls the evaluator alone must reject, naming the field: the honest walk with one unknown field planted in its
// solution, its ledger, its quantum ledger and its preprocessing.

import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { ninth } from '@/code/algebra/ninth-field'
import { compareReal } from '@/code/algebra/ninth-real-sign'
import { arcGraph, groverCoin, groverSearch, hypercubeNeighbors, cycleNeighbors, completeNeighbors, searchCap } from '@/code/compute/quantum/walk'
import { familyGeometries, navigationFamily } from '@/code/intelligence/benchmark/navigation/family'
import {
  BASELINES,
  NAVIGATION_KINDS,
  SOLVER_CATALOG,
  type BaselineName,
  type GradeSummary,
  type NavigationInstance,
  type SolverRecipe,
} from '@/code/intelligence/benchmark/navigation/instance'
import { mazeWalls, obstacleWalls } from '@/code/intelligence/benchmark/navigation/maze'
import { hopDistances, shortestCellPath } from '@/code/intelligence/benchmark/navigation/mesh-distance'
import { gradeFamily, profileOf, type GradedInstance, type Profile } from '@/code/intelligence/benchmark/navigation/profile'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { exactOf } from '@/code/intelligence/problem/evaluate'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { type Fraction, compareFractions, reduced, walkGraph, walkSearch } from '@/code/intelligence/solver/quantum/exact-grover'
import type { ExactValue, QuantumLedger } from '@/code/intelligence/solver/solver'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const QUANTUM_FOLDER = 'code/intelligence/solver/quantum'

const QUANTUM: SolverRecipe = { module: SOLVER_CATALOG, export: 'quantumWalk' }
const CONTROLS = `${QUANTUM_FOLDER}/quantum-controls`
const NO_PROBABILITY: SolverRecipe = { module: CONTROLS, export: 'noProbability' }
const INFLATED: SolverRecipe = { module: CONTROLS, export: 'inflatedProbability' }
const UNDERSTATED: SolverRecipe = { module: CONTROLS, export: 'understatedStates' }
// a solver adding a field the evaluator does not know, at each level of the answer, and the name its refusal must give
const PLANTED: readonly (readonly [SolverRecipe, string])[] = [
  [{ module: CONTROLS, export: 'unknownSolutionField' }, 'solution field'],
  [{ module: CONTROLS, export: 'unknownLedgerField' }, 'ledger field'],
  [{ module: CONTROLS, export: 'unknownQuantumField' }, 'ledger.quantum field'],
  [{ module: CONTROLS, export: 'unknownPreprocessingField' }, 'ledger.preprocessing field'],
]
const CONTROL_GEOMETRIES = new Set(['{4,4}', '{7,3}', '{3,4,3,4}'])

const PAIRS: readonly (readonly [string, string])[] = [
  ['{4,4}', '{4,5}'],
  ['{6,3}', '{6,4}'],
  ['{3,6}', '{3,7}'],
  ['{3,4,3,3}', '{3,4,3,4}'],
]

const display = (f: Fraction): number => Number((f.num * 1_000_000n) / f.den) / 1_000_000
const asNinth = (f: Fraction) => ninth([f.num], f.den)

// ---------------------------------------------------------------- the judge (evaluator side)

interface Report {
  outcome: string
  statesExpanded: number
  states: number
  largestDegree: number
  degree: number
  marked: number
  goalTests: number
  beatsRun: number
  beats: number
  stoppedBy: string
  probability: Fraction | null
  unitaryDefects: number
  amplitudeBytes: number
  graphBytes: number
  arcUpdates: number
  statesTouched: number
  cellsTouched: number
}

/** A rational number of Q(zeta_9) as a fraction, or null when it is unreadable or not rational. */
function rationalOf(value: ExactValue | null): Fraction | null {
  const exact = value === null ? null : exactOf(value)

  if (exact === null || exact.n.slice(1).some(x => x !== 0n)) {
    return null
  }

  return { num: exact.n[0] ?? 0n, den: exact.d }
}

/** The quantum ledger the evaluator read (it has already refused unknown fields and bad integers), as the judge's report. */
function readReport(quantum: QuantumLedger | null): { report: Report | null; probabilityMissing: boolean; repeatsExact: boolean } {
  if (quantum === null) {
    return { report: null, probabilityMissing: true, repeatsExact: false }
  }

  const probability = rationalOf(quantum.successProbability)
  const repeats = rationalOf(quantum.expectedRepeats)
  // the judge's own repeats: 1/p exactly, null when p is missing or 0
  const repeatsExact =
    probability === null || probability.num === 0n
      ? quantum.expectedRepeats === null
      : repeats !== null && repeats.num * probability.num === repeats.den * probability.den

  const report: Report = {
    outcome: quantum.outcome,
    statesExpanded: quantum.statesExpanded,
    states: quantum.states,
    largestDegree: quantum.largestDegree,
    degree: quantum.degree,
    marked: quantum.marked,
    goalTests: quantum.goalTests,
    beatsRun: quantum.beatsRun,
    beats: quantum.beats,
    stoppedBy: quantum.stoppedBy,
    probability,
    unitaryDefects: quantum.unitaryDefects,
    amplitudeBytes: quantum.amplitudeBytes,
    graphBytes: quantum.graphBytes,
    arcUpdates: quantum.arcUpdates,
    statesTouched: quantum.statesTouched,
    cellsTouched: quantum.cellsTouched,
  }

  return { report, probabilityMissing: probability === null, repeatsExact }
}

/** What the judge recomputes on a wall instance: the walk on the rebuilt state graph, by walk.ts. */
interface Recomputed {
  states: number
  degree: number
  beat: number
  probability: Fraction
}

interface Judged {
  grade: GradeSummary
  report: Report | null
  accepted: boolean
  /** verified by the evaluator and accepted by the judge */
  solved: boolean
  reasons: string[]
  recomputed: boolean
}

function judge(grade: GradeSummary, recomputed: Recomputed | null): Judged {
  const reasons: string[] = []
  const { report, probabilityMissing, repeatsExact } = readReport(grade.quantum)

  for (const violation of grade.violations) {
    reasons.push(`evaluator: ${violation}`)
  }

  if (report === null) {
    reasons.push(grade.claimedSolved ? 'claims a quantum success with no quantum report' : 'no quantum report')
  } else {
    if (grade.claimedSolved) {
      if (report.outcome !== 'found' && report.outcome !== 'initialGoal') {
        reasons.push(`claims success with outcome ${report.outcome}`)
      }

      if (probabilityMissing) {
        reasons.push('claims a quantum success without a measured probability')
      } else if (report.probability!.num === 0n || report.probability!.num > report.probability!.den) {
        reasons.push('claims a success probability outside (0, 1]')
      }
    }

    if (report.statesExpanded !== grade.expansions) {
      reasons.push(`reports ${report.statesExpanded} states swept, the evaluator measured ${grade.expansions}`)
    }

    if ((report.outcome === 'found' || report.outcome === 'noGoal') && report.states !== report.statesExpanded) {
      reasons.push(`walked ${report.states} states of the ${report.statesExpanded} swept`)
    }

    if (report.unitaryDefects !== 0) {
      reasons.push(`${report.unitaryDefects} beats not exactly unitary`)
    }

    if (!repeatsExact) {
      reasons.push('the expected repeats are not exactly 1/p')
    }

    if (recomputed !== null && report.outcome === 'found') {
      if (report.states !== recomputed.states || report.degree !== recomputed.degree || report.beats !== recomputed.beat) {
        reasons.push(
          `walk shape ${report.states}/${report.degree}/${report.beats}, recomputed ${recomputed.states}/${recomputed.degree}/${recomputed.beat}`,
        )
      }

      if (report.probability === null || compareReal(asNinth(report.probability), asNinth(recomputed.probability)) !== 0) {
        reasons.push('the success probability differs from the recomputed walk')
      }
    }
  }

  const accepted = reasons.length === 0

  return { grade, report, accepted, solved: accepted && grade.solved, reasons, recomputed: recomputed !== null }
}

// ---------------------------------------------------------------- the wall instances, rebuilt from the benchmark's patterns

function farthestOpen(geometry: LabGeometry, walls: Uint8Array): number {
  const reach = hopDistances(geometry.graph, [0], cell => walls[cell] === 1).distance

  let goal = 0

  for (let cell = 0; cell < reach.length; cell++) {
    if (reach[cell]! > reach[goal]!) {
      goal = cell
    }
  }

  return goal
}

function highestOpen(walls: Uint8Array): number {
  for (let cell = walls.length - 1; cell > 0; cell--) {
    if (walls[cell] === 0) {
      return cell
    }
  }

  return 0
}

/** The least degree at or above `largest` whose Grover coin is exact, by walk.ts. */
function exactDegree(largest: number): number {
  let d = largest < 2 ? 2 : largest

  while (!groverCoin(d).exact) {
    d++
  }

  return d
}

/** The walk walk.ts makes on the agent's reachable open cells, goal marked, for one wall instance. */
function recomputeWall(geometry: LabGeometry, walls: Uint8Array, goal: number): Recomputed | null {
  const graph = geometry.graph
  const reach = hopDistances(graph, [0], cell => walls[cell] === 1).distance

  if (reach[goal] === -1) {
    return null
  }

  const cells: number[] = []

  for (let cell = 0; cell < graph.size; cell++) {
    if (reach[cell]! >= 0) {
      cells.push(cell)
    }
  }

  const at = new Map(cells.map((cell, index) => [cell, index]))
  const neighbors = cells.map(cell => Array.from(graph.neighbors[cell]!).filter(next => at.has(next)).map(next => at.get(next)!))
  const largest = neighbors.reduce((top, row) => (row.length > top ? row.length : top), 0)
  const degree = exactDegree(largest)
  const reading = groverSearch({ graph: arcGraph(neighbors, degree), marked: at.get(goal)!, cap: searchCap(cells.length) })
  const beat = reading.firstMaximumBeat ?? reading.windowMaximumBeat
  const p = reading.firstMaximum ?? reading.windowMaximum

  return { states: cells.length, degree, beat, probability: { num: p.n[0]!, den: p.d } }
}

function wallRecomputations(): Map<string, Recomputed | null> {
  const out = new Map<string, Recomputed | null>()

  for (const family of familyGeometries()) {
    const geometry = family.walk

    for (const kind of ['maze', 'obstacle'] as const) {
      const walls = kind === 'maze' ? mazeWalls(geometry) : obstacleWalls(geometry)

      walls[0] = 0

      const goal = kind === 'maze' ? farthestOpen(geometry, walls) : highestOpen(walls)

      out.set(`${kind}-base-${geometry.spec.name}`, recomputeWall(geometry, walls, goal))

      const path = shortestCellPath(geometry.graph, 0, goal, cell => walls[cell] === 1)

      if (path !== null && path.length >= 3) {
        const blocked = walls.slice()

        blocked[path[Math.floor(path.length / 2)]!] = 1
        out.set(`${kind}-blocked-${geometry.spec.name}`, recomputeWall(geometry, blocked, goal))
      }
    }
  }

  return out
}

// ---------------------------------------------------------------- the walk module against walk.ts

function torusNeighbors(side: number): number[][] {
  const at = (x: number, y: number): number => ((y + side) % side) * side + ((x + side) % side)

  return Array.from({ length: side * side }, (_, v) => {
    const x = v % side
    const y = (v - x) / side

    return [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)]
  })
}

/** Beats where the candidate's walk and walk.ts differ, over the whole cap, marked state 0. */
function certify(neighbors: number[][], degree: number): { beats: number; differences: number; defects: number } {
  const cap = searchCap(neighbors.length)
  const reference = groverSearch({ graph: arcGraph(neighbors, degree), marked: 0, cap, runToCap: true })
  const marked = new Uint8Array(neighbors.length)

  marked[0] = 1

  const ours = walkSearch({ graph: walkGraph(neighbors, degree), marked, cap, runToCap: true })

  let differences = reference.probability.length === ours.probability.length ? 0 : 1

  for (let t = 0; t < reference.probability.length && t < ours.probability.length; t++) {
    if (compareReal(asNinth(ours.probability[t]!), reference.probability[t]!) !== 0) {
      differences++
    }
  }

  if ((reference.firstMaximumBeat ?? -1) !== (ours.firstMaximumBeat ?? -1)) {
    differences++
  }

  return { beats: ours.beats, differences, defects: ours.unitaryDefects + reference.unitaryDefects }
}

// ---------------------------------------------------------------- comparisons

type Outcome = 'win' | 'loss' | 'tie' | 'split'

/**
 * Every cost counted: solved first, then path cost, operator calls, expansions (search plus charged preprocessing),
 * bytes (preprocessing bytes included) and walk arc updates.
 */
function compareAll(q: Judged, b: GradeSummary): Outcome {
  if (q.solved !== b.solved) {
    return q.solved ? 'win' : 'loss'
  }

  const ours = [q.grade.operatorCalls, q.grade.expansions + q.grade.preprocessingExpansions, q.grade.bytes, q.report?.arcUpdates ?? 0]
  const theirs = [b.operatorCalls, b.expansions + b.preprocessingExpansions, b.bytes, 0]

  if (q.solved) {
    ours.unshift(q.grade.cost ?? 0)
    theirs.unshift(b.cost ?? 0)
  }

  const better = ours.some((value, i) => value < theirs[i]!)
  const worse = ours.some((value, i) => value > theirs[i]!)

  return better && worse ? 'split' : better ? 'win' : worse ? 'loss' : 'tie'
}

/** Expected oracle queries (T + 1)/p of the walk, when it found. */
function expectedQueries(report: Report): Fraction | null {
  if (report.probability === null || report.probability.num === 0n) {
    return null
  }

  return reduced({ num: BigInt(report.beats + 1) * report.probability.den, den: report.probability.num })
}

/** Quantum queries only: (T + 1)/p against the baseline's expansions. */
function compareQueries(q: Judged, b: GradeSummary): Outcome | null {
  if (!q.solved || !b.solved || q.report?.outcome !== 'found') {
    return null
  }

  const queries = expectedQueries(q.report)

  if (queries === null) {
    return null
  }

  const order = compareFractions(queries, { num: BigInt(b.expansions), den: 1n })

  return order < 0 ? 'win' : order > 0 ? 'loss' : 'tie'
}

function rValue(report: Report): Fraction | null {
  if (report.probability === null || report.probability.num === 0n || report.outcome !== 'found') {
    return null
  }

  const t = BigInt(report.beats + 1)

  return reduced({ num: t * t * report.probability.den, den: report.probability.num * BigInt(report.states) })
}

interface Tally {
  win: number
  loss: number
  tie: number
  split: number
}

const emptyTally = (): Tally => ({ win: 0, loss: 0, tie: 0, split: 0 })
const tallyText = (t: Tally): string => `${t.win}/${t.loss}/${t.tie}/${t.split}`
const queryCount = (t: Tally): number => t.win + t.loss + t.tie + t.split

function tag(name: string): string {
  return name.replace(/[{}]/g, '').replace(/,/g, '-')
}

function digest(entries: readonly { instance: NavigationInstance; quantum: Judged }[]): string {
  return entries
    .map(
      ({ instance, quantum }) =>
        `${instance.id}:${quantum.grade.solverId}:${JSON.stringify(quantum.grade.quantum)}:${quantum.grade.cost}:${quantum.grade.operatorCalls}:${quantum.grade.bytes}`,
    )
    .join(';')
}

function quantumSources(): { files: number; mathCalls: string[] } {
  const mathCalls: string[] = []
  const names = readdirSync(resolve(BASE, QUANTUM_FOLDER)).filter(name => name.endsWith('.ts')).sort()

  for (const name of names) {
    readFileSync(resolve(BASE, QUANTUM_FOLDER, name), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (!/^\s*(\/\/|\*|\/\*)/.test(line) && /\bMath\s*[.[]/.test(line)) {
          mathCalls.push(`${name}:${index + 1}`)
        }
      })
  }

  return { files: names.length, mathCalls }
}

export default experiment({
  id: 'intelligence/quantum-search',
  code: 'E-CMP-0047',
  title:
    'Q7, what the intelligence lab gains from a quantum walk: the exact Grover walk of Q5 as an isolated candidate solver on every instance of benchmark family A, graded by the same outside evaluator and resource ledger as the breadth-first, A*, IDA* and greedy baselines, its quantum ledger (beats, exact success probability, amplitude storage, repeats) checked by a judge that recomputes the walk, reported as a profile with wins, losses and ties per task and geometry and flat against degree-matched hyperbolic',
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

    // gate: the bundle refuses walk.ts and holds the solver to candidate modules
    const refused = candidateBundle('code/compute/quantum/walk', 'groverSearch', 'solver')
    const accepted = candidateBundle(SOLVER_CATALOG, 'quantumWalk', 'solver')
    const refusal = refused.ok ? 'none' : refused.reason

    if (refused.ok) {
      fail('the sandbox bundle accepted code/compute/quantum/walk.ts as a candidate')
    }

    if (!accepted.ok) {
      fail(`the quantum solver's bundle was refused: ${accepted.reason}`)
    } else {
      metrics.solverBundleModules = accepted.bundle.modules.length
      metrics.solverBundleQuantumModules = accepted.bundle.modules.filter(path => path.startsWith(QUANTUM_FOLDER)).length

      if (accepted.bundle.modules.some(path => path.startsWith('code/compute/') || path.startsWith('code/rule/'))) {
        fail('the quantum solver bundle holds lab or rule code')
      }
    }

    // gate: the walk module equals walk.ts beat for beat
    const certified: [string, number[][], number][] = [
      ['Q4', hypercubeNeighbors(4), 4],
      ['Q6', hypercubeNeighbors(6), 6],
      ['Q8', hypercubeNeighbors(8), 8],
      ['T4', torusNeighbors(4), 4],
      ['T8', torusNeighbors(8), 4],
      ['C16', cycleNeighbors(16), 2],
      ['K9', completeNeighbors(9), 8],
    ]

    let certifiedBeats = 0

    for (const [name, neighbors, degree] of certified) {
      const result = certify(neighbors, degree)

      certifiedBeats += result.beats

      if (result.differences !== 0 || result.defects !== 0) {
        fail(`walk module against walk.ts on ${name}: ${result.differences} differences, ${result.defects} defects`)
      }
    }

    metrics.certifiedGraphs = certified.length
    metrics.certifiedBeats = certifiedBeats

    // negative control of the instrument: with no oracle the marked set keeps exactly M/N
    const freeMarked = new Uint8Array(64)

    for (const v of [0, 7, 21, 42, 63]) {
      freeMarked[v] = 1
    }

    const free = walkSearch({ graph: walkGraph(hypercubeNeighbors(6), 6), marked: freeMarked, cap: 40, oracle: false, runToCap: true })
    const freeOff = free.probability.filter(p => compareFractions(p, { num: 5n, den: 64n }) !== 0).length

    control.noOracleBeatsOffStart = freeOff

    if (freeOff !== 0 || free.unitaryDefects !== 0) {
      fail(`no-oracle walk: ${freeOff} beats off 5/64, ${free.unitaryDefects} defects`)
    }

    // the family, the baselines and the quantum solver
    const family = navigationFamily()
    const graded = gradeFamily(family.instances)
    const recomputations = wallRecomputations()
    const entries = graded.map(entry => {
      const recomputed = recomputations.get(entry.instance.id) ?? null

      return { ...entry, quantum: judge(entry.instance.gradeRecipe(QUANTUM), recomputed) }
    })

    // gates: clean grades, judge acceptance, BFS optimality, accuracy
    let rejected = 0
    let recomputedChecks = 0
    let optimalSolves = 0
    let longerSolves = 0
    let missedSolvable = 0

    const outcomes = new Map<string, number>()

    for (const { instance, reference, quantum } of entries) {
      const outcome = quantum.report?.outcome ?? 'none'

      outcomes.set(outcome, (outcomes.get(outcome) ?? 0) + 1)

      if (!quantum.accepted) {
        rejected++
        fail(`${instance.id} quantum: ${quantum.reasons[0]}`)
      }

      if (quantum.recomputed && outcome === 'found') {
        recomputedChecks++
      }

      if (reference.solvable === false && quantum.grade.claimedSolved) {
        fail(`${instance.id}: quantum claims an instance BFS proves unsolvable`)
      }

      if (reference.solvable === true && !quantum.solved) {
        missedSolvable++

        if (outcome !== 'expansionBudget' && outcome !== 'memoryBudget') {
          fail(`${instance.id}: BFS solves, quantum ${outcome}`)
        }
      }

      if (quantum.solved && reference.cost !== null) {
        const cost = quantum.grade.cost ?? -1

        if (cost < reference.cost) {
          fail(`${instance.id}: quantum cost ${cost} below BFS ${reference.cost}`)
        } else if (cost === reference.cost) {
          optimalSolves++
        } else {
          longerSolves++
        }
      }
    }

    const wallsWalked = entries.filter(e => (recomputations.get(e.instance.id) ?? null) !== null && e.quantum.report?.outcome === 'found').length

    if (recomputedChecks === 0 || recomputedChecks !== wallsWalked) {
      fail(`walk.ts recomputation covered ${recomputedChecks} of ${wallsWalked} walked wall instances`)
    }

    metrics.instances = entries.length
    metrics.quantumRejected = rejected
    metrics.quantumSolved = entries.filter(e => e.quantum.solved).length
    metrics.quantumOptimalSolves = optimalSolves
    metrics.quantumLongerSolves = longerSolves
    metrics.quantumMissedSolvable = missedSolvable
    metrics.wallRecomputations = recomputedChecks

    for (const [outcome, count] of outcomes) {
      metrics[`outcome_${outcome}`] = count
    }

    // controls the judge must catch
    let noProbabilityTried = 0
    let noProbabilityEvaluatorPassed = 0
    let noProbabilityRejected = 0
    let understatedTried = 0
    let understatedRejected = 0
    let inflatedTried = 0
    let inflatedRejected = 0
    let plantedTried = 0
    let plantedRejected = 0

    for (const { instance, reference, quantum } of entries) {
      if (instance.variant === 'base' && CONTROL_GEOMETRIES.has(instance.geometry) && reference.solvable === true) {
        noProbabilityTried++

        const lying = instance.gradeRecipe(NO_PROBABILITY)

        if (lying.solved) {
          noProbabilityEvaluatorPassed++
        }

        const verdictOf = judge(lying, null)

        if (!verdictOf.accepted && verdictOf.reasons.some(r => r.includes('without a measured probability'))) {
          noProbabilityRejected++
        }

        // planted unknown fields: the evaluator alone must refuse each, by name
        for (const [recipe, field] of PLANTED) {
          plantedTried++

          const planted = instance.gradeRecipe(recipe)

          if (!planted.solved && planted.violations.some(v => v.includes(`unknown ${field}`))) {
            plantedRejected++
          }
        }

        if (quantum.report?.outcome === 'found') {
          understatedTried++

          const shrunk = judge(instance.gradeRecipe(UNDERSTATED), null)

          if (!shrunk.accepted && shrunk.reasons.some(r => r.includes('states swept'))) {
            understatedRejected++
          }
        }
      }

      const recomputed = recomputations.get(instance.id) ?? null

      if (
        recomputed !== null &&
        instance.variant === 'base' &&
        quantum.report?.outcome === 'found' &&
        quantum.report.probability !== null &&
        quantum.report.probability.num < quantum.report.probability.den
      ) {
        inflatedTried++

        const inflated = judge(instance.gradeRecipe(INFLATED), recomputed)

        if (!inflated.accepted && inflated.reasons.some(r => r.includes('differs from the recomputed walk'))) {
          inflatedRejected++
        }
      }
    }

    control.noProbabilityTried = noProbabilityTried
    control.noProbabilityEvaluatorPassed = noProbabilityEvaluatorPassed
    control.noProbabilityRejected = noProbabilityRejected
    control.understatedStatesTried = understatedTried
    control.understatedStatesRejected = understatedRejected
    control.inflatedProbabilityTried = inflatedTried
    control.inflatedProbabilityRejected = inflatedRejected
    control.plantedUnknownFieldTried = plantedTried
    control.plantedUnknownFieldRejected = plantedRejected

    if (plantedTried === 0 || plantedRejected !== plantedTried) {
      fail(`planted unknown-field control: ${plantedRejected} of ${plantedTried} rejected by the evaluator`)
    }

    if (noProbabilityTried === 0 || noProbabilityRejected !== noProbabilityTried || noProbabilityEvaluatorPassed !== noProbabilityTried) {
      fail(`no-probability control: ${noProbabilityRejected} of ${noProbabilityTried} rejected, evaluator alone passed ${noProbabilityEvaluatorPassed}`)
    }

    if (understatedTried === 0 || understatedRejected !== understatedTried) {
      fail(`understated-states control: ${understatedRejected} of ${understatedTried} rejected`)
    }

    if (inflatedTried === 0 || inflatedRejected !== inflatedTried) {
      fail(`inflated-probability control: ${inflatedRejected} of ${inflatedTried} rejected`)
    }

    // wins, losses, ties per task and geometry, both accountings
    const allCosts = new Map<BaselineName, Tally>(BASELINES.map(b => [b, emptyTally()]))
    const queries = new Map<BaselineName, Tally>(BASELINES.map(b => [b, emptyTally()]))
    const byKind = new Map<string, Tally>()
    const byGeometry = new Map<string, Tally>()
    const queryByKind = new Map<string, Tally>()
    const queryByGeometry = new Map<string, Tally>()

    let beatsEveryCost = 0
    let winsWithWalk = 0
    let winsWithWalkBySolving = 0

    const walkWins: string[] = []

    for (const { instance, grades, quantum } of entries) {
      for (const baseline of BASELINES) {
        const all = compareAll(quantum, grades[baseline])

        allCosts.get(baseline)![all]++

        if (all === 'win') {
          beatsEveryCost++

          // a win where no walk ran is the sweep alone (breadth-first search run to exhaustion), never the walk
          if (quantum.report?.outcome === 'found') {
            winsWithWalk++

            const solvedOnly = !grades[baseline].solved

            winsWithWalkBySolving += solvedOnly ? 1 : 0
            walkWins.push(`${instance.id} vs ${baseline}${solvedOnly ? ' (baseline unsolved)' : ''}`)
          }
        }

        const query = compareQueries(quantum, grades[baseline])

        if (query !== null) {
          queries.get(baseline)![query]++
        }

        if (baseline === 'breadthFirst') {
          const kind = byKind.get(instance.kind) ?? emptyTally()
          const geometry = byGeometry.get(instance.geometry) ?? emptyTally()

          kind[all]++
          geometry[all]++
          byKind.set(instance.kind, kind)
          byGeometry.set(instance.geometry, geometry)

          if (query !== null) {
            const qk = queryByKind.get(instance.kind) ?? emptyTally()
            const qg = queryByGeometry.get(instance.geometry) ?? emptyTally()

            qk[query]++
            qg[query]++
            queryByKind.set(instance.kind, qk)
            queryByGeometry.set(instance.geometry, qg)
          }
        }
      }
    }

    for (const baseline of BASELINES) {
      const all = allCosts.get(baseline)!
      const query = queries.get(baseline)!

      metrics[`allCostsVs_${baseline}_win`] = all.win
      metrics[`allCostsVs_${baseline}_loss`] = all.loss
      metrics[`allCostsVs_${baseline}_tie`] = all.tie
      metrics[`allCostsVs_${baseline}_split`] = all.split
      metrics[`queriesVs_${baseline}_win`] = query.win
      metrics[`queriesVs_${baseline}_loss`] = query.loss
      metrics[`queriesVs_${baseline}_tie`] = query.tie
    }

    metrics.winsOnceEveryCostCounted = beatsEveryCost
    metrics.winsOnceEveryCostCountedWithWalk = winsWithWalk
    metrics.winsWithWalkWhereBaselineUnsolved = winsWithWalkBySolving

    // the walk itself: probabilities, beats, repeats, R
    const walked = entries.filter(e => e.quantum.solved && e.quantum.report?.outcome === 'found')

    let repeatsTotal = 0
    let ampBytesMax = 0

    for (const { quantum } of walked) {
      const report = quantum.report!
      const p = report.probability!

      repeatsTotal += Number((p.den + p.num - 1n) / p.num)
      ampBytesMax = Math.max(ampBytesMax, report.amplitudeBytes)
    }

    metrics.walks = walked.length
    metrics.walkRepeatsCeilSum = repeatsTotal
    metrics.amplitudeBytesMax = ampBytesMax

    // curvature: flat against degree-matched hyperbolic, base instances, both sides walked
    const curvatureRows: string[] = []
    const kindSigns = new Map<string, number[]>()
    // whether both sides of every compared pair of a kind had equal state count and walk degree (else the sign is confounded)
    const kindMatched = new Map<string, boolean>()

    for (const [flat, hyperbolic] of PAIRS) {
      for (const kind of NAVIGATION_KINDS) {
        const pick = (geometry: string) =>
          walked.find(e => e.instance.kind === kind && e.instance.variant === 'base' && e.instance.geometry === geometry)
        const f = pick(flat)
        const h = pick(hyperbolic)

        if (f === undefined || h === undefined) {
          curvatureRows.push(`${kind} ${flat}/${hyperbolic}: not both walked`)
          continue
        }

        const rf = rValue(f.quantum.report!)!
        const rh = rValue(h.quantum.report!)!
        const sign = compareReal(asNinth(rh), asNinth(rf))
        const signs = kindSigns.get(kind) ?? []

        signs.push(sign)
        kindSigns.set(kind, signs)
        kindMatched.set(
          kind,
          (kindMatched.get(kind) ?? true) &&
            f.quantum.report!.states === h.quantum.report!.states &&
            f.quantum.report!.degree === h.quantum.report!.degree,
        )
        metrics[`R_${kind}_${tag(flat)}`] = display(rf)
        metrics[`R_${kind}_${tag(hyperbolic)}`] = display(rh)

        const describe = (e: typeof f) =>
          `N ${e.quantum.report!.states}, d ${e.quantum.report!.degree}, T ${e.quantum.report!.beats}, p ${display(e.quantum.report!.probability!).toFixed(3)}, R ${display(rValue(e.quantum.report!)!).toFixed(2)}`

        curvatureRows.push(`${kind} ${flat} (${describe(f)}) / ${hyperbolic} (${describe(h)})`)
      }
    }

    let survivingKinds = 0
    let survivingMatched = 0
    let survivingHyperbolicSlower = 0

    const survivalText: string[] = []

    for (const [kind, signs] of kindSigns) {
      const same = signs.length >= 2 && signs.every(s => s === signs[0] && s !== 0)
      const matched = kindMatched.get(kind) === true

      if (same) {
        survivingKinds++
        survivingMatched += matched ? 1 : 0
        survivingHyperbolicSlower += signs[0]! > 0 ? 1 : 0
      }

      survivalText.push(
        `${kind}: hyperbolic R lower in ${signs.filter(s => s < 0).length}, higher in ${signs.filter(s => s > 0).length}, equal in ${signs.filter(s => s === 0).length} of ${signs.length}${same ? ` (survives${matched ? ', N and degree matched' : ', N or walk degree unequal: confounded'})` : ''}`,
      )
    }

    metrics.curvatureKindsCompared = kindSigns.size
    metrics.curvatureKindsSurviving = survivingKinds
    metrics.curvatureKindsSurvivingMatched = survivingMatched
    metrics.curvatureKindsSurvivingHyperbolicSlower = survivingHyperbolicSlower

    // the profile, each dimension apart, the quantum grades judged
    const asQuantum: GradedInstance[] = entries.map(({ instance, grades, reference, quantum }) => ({
      instance,
      reference,
      grades: { ...grades, breadthFirst: { ...quantum.grade, solved: quantum.solved } },
    }))
    const profiles: [string, Profile][] = [
      ['quantum', profileOf(asQuantum, 'breadthFirst')],
      ...BASELINES.map(baseline => [baseline, profileOf(graded, baseline)] as [string, Profile]),
    ]

    for (const [name, profile] of profiles) {
      metrics[`${name}Breadth`] = profile.breadth
      metrics[`${name}Depth`] = profile.depth
      metrics[`${name}Speed`] = Math.round(profile.speed)
      metrics[`${name}Efficiency`] = Math.round(profile.efficiency)
      metrics[`${name}Accuracy`] = profile.accuracy
      metrics[`${name}Optimality`] = profile.optimality
      metrics[`${name}Robustness`] = profile.robustness
      metrics[`${name}Generalization`] = profile.generalization
      metrics[`${name}Solved`] = profile.solved
    }

    // gate: determinism
    const againIds = new Set(entries.filter(e => e.instance.geometry === 'line' || e.instance.geometry === '{3,6}').map(e => e.instance.id))
    const again = navigationFamily(['line', '{3,6}']).instances.map(instance => ({
      instance,
      quantum: judge(instance.gradeRecipe(QUANTUM), recomputations.get(instance.id) ?? null),
    }))
    const deterministic = againIds.size > 0 && digest(entries.filter(e => againIds.has(e.instance.id))) === digest(again)

    if (!deterministic) {
      fail('a second grading gave different quantum numbers')
    }

    // gate: no random number or clock in the sources, no Math call in a quantum module
    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/quantum-search.ts'])
    const sources = quantumSources()

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    if (sources.mathCalls.length > 0) {
      fail(`Math call in a quantum module: ${sources.mathCalls.join(', ')}`)
    }

    const isolation = isolationCounts()

    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length
    metrics.quantumModulesScanned = sources.files
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.failures = failures.length

    const ok = failures.length === 0
    const profileLine = ([name, p]: [string, Profile]): string =>
      `${name}: solved ${p.solved}, breadth ${p.breadth.toFixed(2)}, depth ${p.depth}, speed ${Math.round(p.speed)} calls, efficiency ${Math.round(p.efficiency)} bytes, accuracy ${p.accuracy.toFixed(3)}, optimality ${p.optimality.toFixed(3)}, robustness ${p.robustness.toFixed(3)}, generalization ${p.generalization.toFixed(3)}`
    const tallies = (map: Map<string, Tally>): string =>
      [...map].map(([name, t]) => `${name} ${tallyText(t)}`).join(', ')
    const walkRows = walked
      .filter(e => e.instance.variant === 'base')
      .map(e => {
        const r = e.quantum.report!
        const bfs = e.grades.breadthFirst
        const q = expectedQueries(r)!

        const p = r.probability!
        const repeats = (p.den + p.num - 1n) / p.num

        return `${e.instance.id} N ${r.states} d ${r.degree} M ${r.marked} T ${r.beats} p ${display(p).toFixed(3)} repeats ${repeats} (T+1)/p ${display(q).toFixed(1)} vs BFS expansions ${bfs.expansions}, cells touched ${r.cellsTouched}, amplitude bytes ${r.amplitudeBytes}, calls ${e.quantum.grade.operatorCalls} vs ${bfs.operatorCalls}, bytes ${e.quantum.grade.bytes} vs ${bfs.bytes}, cost ${e.quantum.grade.cost} vs ${bfs.cost}`
      })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the exact Grover walk runs as an isolated candidate on every instance of benchmark family A under the level-1 evaluator and ledger, its walk equal to walk.ts beat for beat and its probabilities recomputed by the judge on every wall instance; once every cost is counted it beats breadth-first search on ${allCosts.get('breadthFirst')!.win} instances, and beats a classical baseline in ${winsWithWalk} of ${entries.length * BASELINES.length} instance-baseline comparisons where a walk ran (${winsWithWalkBySolving} of them only because that baseline failed to solve within the budget; ${beatsEveryCost} counting the unsolvable instances, where its sweep is breadth-first search to exhaustion without a heuristic table to pay for), because it must sweep the whole state graph through the operators before it can walk it and read its path from the sweep; granted the graph as a free quantum oracle, its expected oracle queries (T + 1)/p beat breadth-first expansions on ${queries.get('breadthFirst')!.win} of ${queryCount(queries.get('breadthFirst')!)} solved instances (token sliding and tours, where breadth-first search expands most of a large space); flat against degree-matched hyperbolic, ${survivingKinds} of ${kindSigns.size} kinds keep one sign of the walk's R = (T + 1)^2/(pN) across every pair (${survivingHyperbolicSlower} with the hyperbolic side slower), ${survivingMatched} of them at equal state count and walk degree${survivingMatched === 0 ? ', so no difference is credited to curvature' : ''}`,
      metrics,
      control,
      notes: `L2 benchmark under the Q7 accounting. Sandbox: the bundle refuses walk.ts (${refusal}); check:layers rule 2 forbids a candidate the quantum lab and the rules, so the solver carries its own exact walk (exact-grover.ts, no imports), equal to walk.ts on ${certified.length} graphs over ${certifiedBeats} beats. Outcomes: ${[...outcomes].map(([o, n]) => `${o} ${n}`).join(', ')}. The sweep is the classical price of the oracle: the walk needs the whole reachable graph, so the solver expands every state (BFS stops at its first goal) and its operator calls and bytes are at least breadth-first search's run to exhaustion, plus the arc table and amplitude storage (largest ${ampBytesMax} bytes); the walk then locates a goal state, and the path is the sweep's breadth-first path to it, longer than the optimum only where several goal states compete (dynamic maze, tour, Sokoban: ${longerSolves} longer, ${optimalSolves} optimal). Every cost counted, wins/losses/ties/splits per baseline: ${BASELINES.map(b => `${b} ${tallyText(allCosts.get(b)!)}`).join(', ')}; wins where a walk ran: ${walkWins.join(', ') || 'none'}; against BFS per kind ${tallies(byKind)}; per geometry ${tallies(byGeometry)}. Quantum queries only (walk granted the graph free, (T + 1)/p against expansions, where both solve), wins/losses/ties: ${BASELINES.map(b => `${b} ${tallyText(queries.get(b)!)}`).join(', ')}; against BFS per kind ${tallies(queryByKind)}; per geometry ${tallies(queryByGeometry)}. Walks on base instances: ${walkRows.join('; ')}. Curvature (R = (T + 1)^2/(pN), base instances): ${curvatureRows.join('; ')}. Survival: ${survivalText.join('; ')}. Profiles: ${profiles.map(profileLine).join('. ')}. Controls: a breadth-first solver claiming a quantum success with no probability passes the evaluator alone ${noProbabilityEvaluatorPassed} of ${noProbabilityTried} and the judge rejects it ${noProbabilityRejected} of ${noProbabilityTried}; the honest walk reporting probability 1 rejected ${inflatedRejected} of ${inflatedTried} (recomputed by walk.ts); half its states rejected ${understatedRejected} of ${understatedTried} (against the meter); a field the evaluator does not know, planted in the solution, the ledger, its quantum part and its preprocessing, refused by the evaluator alone ${plantedRejected} of ${plantedTried}; the no-oracle walk keeps a marked set at exactly 5/64 for 40 beats. Limits: no measurement is sampled (no random numbers), so the solver returns the most probable marked state and reports the whole set's probability, and the judge prices the repeats as expected runs 1/p; the probability is recomputed independently on maze and obstacle only (the other kinds' state graphs live inside the benchmark), and checked there for range, unitarity and the metered state count; the walk is on the undirected state graph, the operator steps taken both ways, with walls padding each state to a degree whose coin is exact; family sizes are the level-1 ones (budget 50,000 expansions, 64 MiB), so dynamic mazes past the budget are lost to the sweep. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
