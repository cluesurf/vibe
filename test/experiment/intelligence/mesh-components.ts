// Intelligence level 4, slice 1 (item vibe-computation-intelligence-0006, level4.md of vibe/computation/intelligence):
// the solver's components realized as mesh structures where the models allow it. The frontier is the M3-B Z3 wave
// s(t+1) = sum of in-neighbours - s(t-1) (mod 3) on the configuration graph the solver discovers through the
// evaluator's operators; the visited memory is an M4 line register of the static carrier id.CBA.id at slot spacing 2,
// run one round every wave step; every decision (lit test, expand gate, register write, goal test, stop test, path
// read-back) stays candidate code and is counted, and its truth table is classified by the M5 occupancy lemma
// (occupancyRouted, code/compute/lab/gates.ts): a table that is not occupancy-routed cannot be computed by any of the
// 12 occupancy-blind rule-background cells on any graph, schedule or layout. Same problems (benchmark family A of
// E-CMP-0026, all 104 instances) and the same outside evaluator as level 1, isolated in the sandbox.
//
// Gates, fixed in level4.md before the first run, each able to fail:
// - G1 every meshWave grade clean (no evaluator violation), no false claim.
// - G2 cost never below breadth-first search; no solve where BFS proves the instance unsolvable.
// - G3 exactness: on every judged instance with no hole (a state at distance k < d(goal) dark at step k), the cost
//   equals the BFS optimum.
// - G4 judge: on every maze and obstacle instance (base, blocked, sealed), rebuilt from the benchmark's wall patterns,
//   secondOrderZ3Step of code/rule recomputes the outcome, stop step, newly-lit digest, arrival digest and field digest,
//   all equal; on every instance the report reads, claims the honest components, has 0 register corruptions and its
//   expansions equal the evaluator's.
// - G5 copy certificate: the solver's wave step equals secondOrderZ3Step on C16, the 8 x 8 torus, Q6 and K9 for 40
//   steps (the self-1 law differs: control); the register table equals id.CBA.id of pairRulesFromFibers; a register
//   round equals a round built on pairTones; at spacing 2 every 4-slot word is held 48 rounds, at spacing 1 some word
//   is corrupted.
// - G6 controls, each graded clean by the evaluator alone: externalFrontier (breadth-first layers, a fabricated field)
//   and foreignLaw (self 1 claimed as self 0) rejected wherever their report differs from the recomputation, at least
//   once each; adjacentRegister (spacing 1) rejected at least once.
// - G7 the sandbox bundle refuses code/rule/second-order-z3 and code/compute/lab/memory and accepts meshWave.
// - G8 determinism (a second grading of two geometries, identical ids and numbers); no random or clock source.
// - the decision tables classify as level4.md says: lit test, expand gate and register write occupancy-routed; stop test
//   and min not.
// - knockout provenance (item 0030): a component counts as mesh-realized only if knocking out its rounds changes some
//   read. The wave's knockout must change reads (and agree with the judge's recomputation on every wall instance); the
//   register's must change none on the honest solves and on every 4-slot word, while the spacing-1 control's must change
//   some. The register is then labelled mesh storage with an identity round and left out of the mesh share.

import { resolve } from 'node:path'
import { occupancyRouted, truthTable } from '@/code/compute/lab/gates'
import { AGENT, OPEN, WALL, rawToneKey } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { familyGeometries, navigationFamily } from '@/code/intelligence/benchmark/navigation/family'
import {
  NAVIGATION_KINDS,
  SOLVER_CATALOG,
  type GradeSummary,
  type NavigationInstance,
  type SolverRecipe,
} from '@/code/intelligence/benchmark/navigation/instance'
import { mazeWalls, obstacleWalls } from '@/code/intelligence/benchmark/navigation/maze'
import { hopDistances, shortestCellPath } from '@/code/intelligence/benchmark/navigation/mesh-distance'
import { referenceOf, type Reference } from '@/code/intelligence/benchmark/navigation/profile'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { MESH_CLAIMS, MESH_ID_PREFIX, WAVE_WORK_CAP, type MeshReport } from '@/code/intelligence/solver/mesh/mesh-wave'
import { STATIC_CARRIER_TABLE, growRegister, lineRegister, readSlot, registerRound, writeSlot } from '@/code/intelligence/solver/mesh/register'
import { DIGEST_MODULUS, keyHash, waveStep } from '@/code/intelligence/solver/mesh/wave'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import { pairRulesFromFibers, pairTones } from '@/code/rule/pair-rule'
import { secondOrderZ3Step } from '@/code/rule/second-order-z3'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const MESH: SolverRecipe = { module: SOLVER_CATALOG, export: 'meshWave' }
const CONTROLS = 'code/intelligence/solver/mesh/mesh-controls'
const CONTROL_RECIPES: readonly (readonly [string, SolverRecipe])[] = [
  ['externalFrontier', { module: CONTROLS, export: 'externalFrontier' }],
  ['foreignLaw', { module: CONTROLS, export: 'foreignLaw' }],
  ['adjacentRegister', { module: CONTROLS, export: 'adjacentRegister' }],
]
const LAW = { kind: 'linear', self: 0 } as const

// ---------------------------------------------------------------- the report a solver id carries

const INTEGER_FIELDS = [
  'stopStep', 'states', 'expanded', 'widestFrontier', 'litSteps', 'litDigest', 'arrivalDigest', 'fieldDigest',
  'registerCorruptions', 'registerCells', 'registerRounds', 'registerPairUpdates', 'waveArcReads', 'waveCellUpdates',
  'litTests', 'expandGates', 'registerWrites', 'goalTests', 'stopTests', 'readbackComparisons', 'meshBytes',
] as const

const OUTCOMES = new Set(['found', 'initialGoal', 'waveExhausted', 'waveCap', 'expansionBudget'])

function readReport(id: string): MeshReport | null {
  if (!id.startsWith(MESH_ID_PREFIX)) {
    return null
  }

  let raw: Record<string, unknown>

  try {
    raw = JSON.parse(id.slice(MESH_ID_PREFIX.length)) as Record<string, unknown>
  } catch {
    return null
  }

  for (const name of INTEGER_FIELDS) {
    const value = raw[name]

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      return null
    }
  }

  if (raw.kind !== 'mesh-wave' || typeof raw.outcome !== 'string' || !OUTCOMES.has(raw.outcome)) {
    return null
  }

  return raw as unknown as MeshReport
}

// ---------------------------------------------------------------- the judge's recomputation of a wall instance

interface Expected {
  outcome: string
  stopStep: number
  litDigest: number
  arrivalDigest: number
  fieldDigest: number
  /** states at distance k < d(goal) dark at step k (null when the goal is not reached by the run) */
  holes: number | null
  goalDistance: number
  /** node values a step changed, summed over the steps: the reads each step's knockout (the identity) would leave as they were */
  waveChangedValues: number
}

interface WallCase {
  id: string
  geometry: string
  graph: LabGeometry['graph']
  walls: Uint8Array
  goal: number
}

/** The run E-CMP-0056's honest solver must make, recomputed with code/rule's step on the reachable open-cell graph. */
function recompute(wall: WallCase): Expected {
  const { graph, walls, goal } = wall
  const reach = hopDistances(graph, [0], cell => walls[cell] === 1).distance
  const cells: number[] = []

  for (let cell = 0; cell < graph.size; cell++) {
    if (reach[cell]! >= 0) {
      cells.push(cell)
    }
  }

  const at = new Map(cells.map((cell, index) => [cell, index]))
  const neighbors = cells.map(cell => Array.from(graph.neighbors[cell]!).filter(next => at.has(next)).map(next => at.get(next)!))
  const hashes = cells.map(cell => {
    const tones = new Int8Array(graph.size)

    for (let c = 0; c < graph.size; c++) {
      tones[c] = walls[c] === 1 ? WALL : OPEN
    }

    tones[cell] = AGENT

    return keyHash(rawToneKey(tones))
  })
  const n = cells.length
  const goalIndex = at.get(goal) ?? -1
  const goalDistance = goalIndex >= 0 ? reach[goal]! : -1
  const firstLit = new Int32Array(n).fill(-1)
  const arrivals = new Uint8Array(n)

  let previous = new Uint8Array(n)
  let current = new Uint8Array(n)
  let litDigest = 0
  let fieldDigest = 0
  let arcs = 0
  let waveReads = 0
  let outcome = ''
  let stopStep = 0
  let holes: number | null = null
  let waveChangedValues = 0

  current[0] = 1

  for (let step = 0; ; step++) {
    stopStep = step

    const lit: number[] = []

    for (let i = 0; i < n; i++) {
      if (current[i] !== 0) {
        fieldDigest = (fieldDigest + (hashes[i]! + 1) * current[i]! * (step + 1)) % DIGEST_MODULUS

        if (firstLit[i]! < 0) {
          lit.push(i)
        }
      }
    }

    litDigest = (litDigest * 1_000_003 + lit.length + 1) % DIGEST_MODULUS

    let found = false

    for (const i of lit) {
      firstLit[i] = step
      arrivals[i] = current[i]!
      arcs += neighbors[i]!.length

      if (neighbors[i]!.includes(goalIndex)) {
        found = true
      }
    }

    if (found) {
      outcome = 'found'
      break
    }

    if (waveReads + arcs > WAVE_WORK_CAP) {
      outcome = 'waveCap'
      break
    }

    waveReads += arcs

    const next = secondOrderZ3Step({ neighbors, previous, current, law: LAW })

    for (let i = 0; i < n; i++) {
      if (next[i] !== current[i]) {
        waveChangedValues++
      }
    }

    previous = current
    current = next

    let returned = true

    for (let i = 0; i < n && returned; i++) {
      returned = previous[i] === 0 && current[i] === (i === 0 ? 1 : 0)
    }

    if (returned) {
      outcome = 'waveExhausted'
      stopStep = step + 1
      break
    }
  }

  let arrivalDigest = 0

  for (let i = 0; i < n; i++) {
    if (firstLit[i]! >= 0) {
      // the arrival tone's residue is the field value the step it lit
      arrivalDigest = (arrivalDigest + (hashes[i]! * 3 + arrivals[i]!) * (firstLit[i]! + 1)) % DIGEST_MODULUS
    }
  }

  if (outcome === 'found') {
    holes = 0

    const distance = cells.map(cell => reach[cell]!)

    for (let i = 0; i < n; i++) {
      if (distance[i]! < goalDistance && firstLit[i] !== distance[i]) {
        holes++
      }
    }
  }

  return { outcome, stopStep, litDigest, arrivalDigest, fieldDigest, holes, goalDistance, waveChangedValues }
}

function farthestOpen(graph: LabGeometry['graph'], walls: Uint8Array): number {
  const reach = hopDistances(graph, [0], cell => walls[cell] === 1).distance

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

/** The wall instances, rebuilt from the benchmark's own patterns as code/intelligence/benchmark/navigation/maze builds them. */
function wallCases(names?: readonly string[]): Map<string, WallCase> {
  const out = new Map<string, WallCase>()

  for (const family of familyGeometries(names as never)) {
    const geometry = family.walk
    const graph = geometry.graph
    const name = geometry.spec.name

    for (const kind of ['maze', 'obstacle'] as const) {
      const walls = kind === 'maze' ? mazeWalls(geometry) : obstacleWalls(geometry)

      walls[0] = 0

      const goal = kind === 'maze' ? farthestOpen(graph, walls) : highestOpen(walls)

      out.set(`${kind}-base-${name}`, { id: `${kind}-base-${name}`, geometry: name, graph, walls, goal })

      const path = shortestCellPath(graph, 0, goal, cell => walls[cell] === 1)

      if (path !== null && path.length >= 3) {
        const blocked = walls.slice()

        blocked[path[Math.floor(path.length / 2)]!] = 1
        out.set(`${kind}-blocked-${name}`, { id: `${kind}-blocked-${name}`, geometry: name, graph, walls: blocked, goal })
      }

      if (kind === 'maze' && goal !== 0) {
        const sealed = walls.slice()

        for (const cell of graph.neighbors[goal]!) {
          if (cell !== 0) {
            sealed[cell] = 1
          }
        }

        out.set(`${kind}-sealed-${name}`, { id: `${kind}-sealed-${name}`, geometry: name, graph, walls: sealed, goal })
      }
    }
  }

  return out
}

/** The fields a judged report must match. */
function mismatches(report: MeshReport, expected: Expected): string[] {
  const out: string[] = []

  for (const field of ['outcome', 'stopStep', 'litDigest', 'arrivalDigest', 'fieldDigest'] as const) {
    if (report[field] !== expected[field]) {
      out.push(`${field} ${report[field]} against ${expected[field]}`)
    }
  }

  return out
}

// ---------------------------------------------------------------- the copy certificate

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

/** Steps where the solver's wave differs from code/rule's, over 40 steps from a one- and a two-source seed. */
function certify(neighbors: number[][], self: number): { steps: number; differences: number } {
  let differences = 0
  let steps = 0

  for (const sources of [[0], [0, neighbors.length >> 1]]) {
    let previous = new Uint8Array(neighbors.length)
    let current = new Uint8Array(neighbors.length)

    for (const s of sources) {
      current[s] = 1
    }

    let mine = Array.from(previous)
    let mineNow = Array.from(current)

    for (let t = 0; t < 40; t++) {
      const next = secondOrderZ3Step({ neighbors, previous, current, law: LAW })
      const ours = waveStep(neighbors, mine, mineNow, self)

      steps++

      if (ours.some((value, i) => value !== next[i])) {
        differences++
      }

      previous = current
      current = next
      mine = mineNow
      mineNow = ours
    }
  }

  return { steps, differences }
}

/** A register round built on code/rule's pairTones, the judge's own. */
function judgeRound(cells: number[], table: Int8Array): number[] {
  const out = cells.slice()

  for (let color = 0; color < 2; color++) {
    for (let i = color; i + 1 < out.length; i += 2) {
      const [a, b] = pairTones(table[(out[i]! + 1) * 3 + out[i + 1]! + 1]!)

      out[i] = a
      out[i + 1] = b
    }
  }

  return out
}

/**
 * Whether every 4-slot word at `spacing` reads back unchanged at every round 1 to 48 (M4's capacity reading). Read at
 * every round, not only the last: at spacing 1 an adjacent (-1, +1) pair trades cells once a round and is back in
 * place after any even number of rounds.
 */
function holdsEveryWord(spacing: number): { words: number; corrupted: number; reads: number; changedReads: number; changedPairs: number } {
  let corrupted = 0
  let words = 0
  // the knockout: with no rounds the register reads back what was written, so a read that differs from the written
  // tone is a read the rounds changed
  let reads = 0
  let changedReads = 0
  let changedPairs = 0

  for (let code = 0; code < 81; code++) {
    const register = lineRegister(spacing)
    const word = [0, 1, 2, 3].map(k => (Math.floor(code / 3 ** k) % 3) - 1)

    word.forEach((tone, slot) => {
      growRegister(register, slot)
      writeSlot(register, slot, tone)
    })

    let wrong = false

    for (let round = 0; round < 48; round++) {
      changedPairs += registerRound(register, STATIC_CARRIER_TABLE)

      word.forEach((tone, slot) => {
        reads++

        if (readSlot(register, slot) !== tone) {
          changedReads++
          wrong = true
        }
      })
    }

    words++

    if (wrong) {
      corrupted++
    }
  }

  return { words, corrupted, reads, changedReads, changedPairs }
}

// ---------------------------------------------------------------- the experiment

interface Graded {
  instance: NavigationInstance
  reference: Reference
  grade: GradeSummary
  report: MeshReport | null
}

function digest(entries: readonly Graded[]): string {
  return entries.map(e => `${e.instance.id}:${e.grade.solverId}:${e.grade.cost}:${e.grade.operatorCalls}:${e.grade.expansions}:${e.grade.bytes}`).join(';')
}

export default experiment({
  id: 'intelligence/mesh-components',
  code: 'E-CMP-0056',
  title:
    'intelligence level 4, slice 1: a solver whose frontier is the M3-B Z3 wave on the configuration graph it discovers and whose visited memory is an M4 static register (id.CBA.id, spacing 2), every decision kept as candidate code and classified by the M5 occupancy lemma, run on all of benchmark family A under the level-1 evaluator, with a judge that recomputes every wall instance with the original rule and a component provenance table',
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

    // G5: the copy certificate
    const graphs: readonly (readonly [string, number[][]])[] = [
      ['C16', ringNeighbors(16)],
      ['torus8', torusNeighbors(8)],
      ['Q6', cubeNeighbors(6)],
      ['K9', completeNeighbors(9)],
    ]

    let certifiedSteps = 0
    let foreignDifferences = 0

    for (const [name, neighbors] of graphs) {
      const honest = certify(neighbors, 0)

      certifiedSteps += honest.steps

      if (honest.differences > 0) {
        fail(`wave copy differs from secondOrderZ3Step on ${name} at ${honest.differences} steps`)
      }

      foreignDifferences += certify(neighbors, 1).differences
    }

    if (foreignDifferences === 0) {
      fail('the self-1 law never differed from the certified wave: the certificate cannot tell laws apart')
    }

    const staticCarrier = pairRulesFromFibers().find(rule => rule.name === 'id.CBA.id')

    if (staticCarrier === undefined || Array.from(staticCarrier.table).join(',') !== STATIC_CARRIER_TABLE.join(',')) {
      fail('the register table is not id.CBA.id')
    }

    let roundDifferences = 0
    let probe = Array.from({ length: 24 }, (_, i) => ((i * 7) % 3) - 1)

    for (let round = 0; round < 10; round++) {
      const register = { spacing: 1, cells: probe.slice(), pairUpdates: 0, rounds: 0 }

      registerRound(register, STATIC_CARRIER_TABLE)

      const judged = judgeRound(probe, staticCarrier?.table ?? new Int8Array(9))

      if (judged.some((tone, i) => tone !== register.cells[i])) {
        roundDifferences++
      }

      probe = judged
    }

    if (roundDifferences > 0) {
      fail(`the register round differs from the pairTones round at ${roundDifferences} rounds`)
    }

    const spaced = holdsEveryWord(2)
    const adjacent = holdsEveryWord(1)

    if (spaced.corrupted > 0) {
      fail(`spacing 2 corrupted ${spaced.corrupted} of ${spaced.words} words`)
    }

    if (adjacent.corrupted === 0) {
      fail('spacing 1 corrupted no word: the register control shows nothing')
    }

    // the register knockout, for a register of any length (item 0030): at spacing 2 every brick pair holds one slot
    // cell and one background cell, so the pairs a valid layout ever shows are (t, 0) and (0, t); the static carrier
    // fixes each, so every round is the identity on every reachable frame and knocking the rounds out changes no read
    const register = pairRulesFromFibers().find(rule => rule.name === 'id.CBA.id')
    const loneFixed = register !== undefined && [-1, 0, 1].every(t => {
      const left = (t + 1) * 3 + 1
      const right = 3 + t + 1

      return register.table[left] === left && register.table[right] === right
    })

    if (!loneFixed) {
      fail('id.CBA.id moves a lone tone beside the background: the register knockout argument fails')
    }

    if (spaced.changedReads !== 0 || spaced.changedPairs !== 0) {
      fail(`register knockout at spacing 2: ${spaced.changedReads} changed reads, ${spaced.changedPairs} changed pairs`)
    }

    if (adjacent.changedReads === 0) {
      fail('register knockout at spacing 1 changed no read: the knockout cannot see motion')
    }

    // the decision tables against the M5 occupancy lemma (background 0)
    const decisions = [
      { name: 'litTest', routed: occupancyRouted(truthTable(1, ([x]) => (x !== 0 ? 1 : 0)), 1, 0), expected: true },
      { name: 'expandGate', routed: occupancyRouted(truthTable(2, ([x, y]) => (x !== 0 && y === 0 ? 1 : 0)), 2, 0), expected: true },
      { name: 'registerWrite', routed: occupancyRouted(truthTable(2, ([x, g]) => (g !== 0 ? x! : 0)), 2, 0), expected: true },
      { name: 'stopTest', routed: occupancyRouted(truthTable(1, ([x]) => (x === 1 ? 1 : 0)), 1, 0), expected: false },
      { name: 'readbackMin', routed: occupancyRouted(truthTable(2, ([x, y]) => Math.min(x!, y!)), 2, 0), expected: false },
    ]

    for (const decision of decisions) {
      if (decision.routed !== decision.expected) {
        fail(`decision ${decision.name}: occupancy-routed ${decision.routed}, level4.md says ${decision.expected}`)
      }
    }

    // G7: the sandbox bundle
    const refusedWave = candidateBundle('code/rule/second-order-z3', 'secondOrderZ3Step', 'solver')
    const refusedMemory = candidateBundle('code/compute/lab/memory', 'forwardRound', 'solver')
    const accepted = candidateBundle(SOLVER_CATALOG, 'meshWave', 'solver')

    if (refusedWave.ok || refusedMemory.ok) {
      fail('the sandbox bundle accepted a rule or lab module as a candidate')
    }

    if (!accepted.ok) {
      fail(`the meshWave bundle was refused: ${accepted.reason}`)
    }

    // the family, graded
    const family = navigationFamily()
    const walls = wallCases()
    const expected = new Map<string, Expected>()

    for (const [id, wall] of walls) {
      expected.set(id, recompute(wall))
    }

    const graded: Graded[] = family.instances.map(instance => {
      const grade = instance.gradeRecipe(MESH)

      return { instance, reference: referenceOf(instance.grade('breadthFirst')), grade, report: readReport(grade.solverId) }
    })

    let violations = 0
    let falseClaims = 0
    let judged = 0
    let judgeRejected = 0

    const newSplit = () => ({ solves: 0, waveOps: 0, identityOps: 0, routedOps: 0, noGoOps: 0, ownOps: 0, knockout: 0 })
    const judgedSplit = newSplit()
    const unjudgedSplit = newSplit()
    let optimal = 0
    let longer = 0
    let missed = 0
    let provedUnsolvableKept = 0
    let holeFreeChecked = 0
    let holeFreeOptimal = 0
    let holedInstances = 0

    const outcomes = new Map<string, number>()
    const totals: Record<string, number> = {}

    const add = (name: string, value: number): void => {
      totals[name] = (totals[name] ?? 0) + value
    }

    const perKind = new Map<string, { optimal: number; longer: number; missed: number; unsolvable: number; meshCalls: number; bfsCalls: number; meshExpansions: number; bfsExpansions: number; meshBytes: number; bfsBytes: number; widest: number }>()
    const holesByGeometry = new Map<string, number>()

    for (const entry of graded) {
      const { instance, reference, grade, report } = entry
      const kind = perKind.get(instance.kind) ?? { optimal: 0, longer: 0, missed: 0, unsolvable: 0, meshCalls: 0, bfsCalls: 0, meshExpansions: 0, bfsExpansions: 0, meshBytes: 0, bfsBytes: 0, widest: 0 }

      perKind.set(instance.kind, kind)

      if (grade.violations.length > 0) {
        violations++
        fail(`${instance.id}: ${grade.violations[0]}`)
      }

      if (grade.claimedSolved && !grade.solved) {
        falseClaims++
      }

      if (report === null) {
        fail(`${instance.id}: no readable mesh report`)
        continue
      }

      outcomes.set(report.outcome, (outcomes.get(report.outcome) ?? 0) + 1)

      if (JSON.stringify(report.claims) !== JSON.stringify(MESH_CLAIMS)) {
        fail(`${instance.id}: claims ${JSON.stringify(report.claims)}`)
      }

      if (report.registerCorruptions !== 0) {
        fail(`${instance.id}: ${report.registerCorruptions} register corruptions`)
      }

      if (report.expanded !== grade.expansions) {
        fail(`${instance.id}: report expanded ${report.expanded}, evaluator ${grade.expansions}`)
      }

      // G2 and the optimality reading
      if (grade.solved && reference.cost !== null) {
        if (grade.cost! < reference.cost) {
          fail(`${instance.id}: cost ${grade.cost} below BFS ${reference.cost}`)
        }

        if (grade.cost === reference.cost) {
          optimal++
          kind.optimal++
        } else {
          longer++
          kind.longer++
        }
      } else if (reference.solvable === true) {
        missed++
        kind.missed++
      }

      if (reference.solvable === false) {
        kind.unsolvable++

        if (grade.solved) {
          fail(`${instance.id}: solved where BFS proves no solution`)
        } else {
          provedUnsolvableKept++
        }
      }

      kind.meshCalls += grade.operatorCalls
      kind.meshExpansions += grade.expansions
      kind.meshBytes += grade.bytes
      kind.widest = Math.max(kind.widest, report.widestFrontier)

      const bfs = instance.grade('breadthFirst')

      kind.bfsCalls += bfs.operatorCalls
      kind.bfsExpansions += bfs.expansions
      kind.bfsBytes += bfs.bytes

      for (const name of ['waveArcReads', 'waveCellUpdates', 'registerPairUpdates', 'litTests', 'expandGates', 'registerWrites', 'stopTests', 'readbackComparisons', 'goalTests'] as const) {
        add(name, report[name])
      }

      add('operatorCalls', grade.operatorCalls)

      // item 0036 (audit 3, M1): credit rests on the judge's recomputation, so the solver's own operations are split by
      // whether the judge recomputes the instance (the wall kinds) or only the candidate reports it (the directed kinds)
      const ownOps =
        report.waveArcReads + report.waveCellUpdates + report.registerPairUpdates + report.litTests + report.expandGates + report.registerWrites + report.stopTests + report.readbackComparisons
      const split = expected.has(instance.id) ? judgedSplit : unjudgedSplit

      split.solves++
      split.waveOps += report.waveArcReads + report.waveCellUpdates
      split.identityOps += report.registerPairUpdates
      split.routedOps += report.litTests + report.expandGates + report.registerWrites
      split.noGoOps += report.stopTests + report.readbackComparisons
      split.ownOps += ownOps
      split.knockout += report.knockout?.waveChangedValues ?? 0

      // the knockout reading (item 0030)
      const knock = report.knockout

      if (knock === undefined || !Number.isInteger(knock.waveChangedValues) || !Number.isInteger(knock.registerChangedPairs)) {
        fail(`${instance.id}: no knockout reading in the report`)
      } else {
        add('waveKnockoutChangedValues', knock.waveChangedValues)
        add('registerKnockoutChangedPairs', knock.registerChangedPairs)

        if (knock.waveChangedValues > 0) {
          add('waveKnockoutInstancesChanged', 1)
        }
      }

      // G4 and G3 on the judged wall instances
      const want = expected.get(instance.id)

      if (want !== undefined) {
        judged++

        if (knock !== undefined && knock.waveChangedValues !== want.waveChangedValues) {
          fail(`${instance.id}: wave knockout ${knock.waveChangedValues} changed values, the judge ${want.waveChangedValues}`)
        }

        add('judgeWaveKnockoutChangedValues', want.waveChangedValues)

        const wrong = mismatches(report, want)

        if (wrong.length > 0) {
          judgeRejected++
          fail(`${instance.id}: judge ${wrong.join(', ')}`)
        }

        if (want.holes !== null) {
          holesByGeometry.set(instance.geometry, (holesByGeometry.get(instance.geometry) ?? 0) + want.holes)

          if (want.holes === 0 && grade.solved && reference.cost !== null) {
            holeFreeChecked++

            if (grade.cost === reference.cost) {
              holeFreeOptimal++
            } else {
              fail(`${instance.id}: no hole, cost ${grade.cost}, BFS ${reference.cost}`)
            }
          } else if (want.holes > 0) {
            holedInstances++
          }
        }
      }
    }

    if (judged !== walls.size) {
      fail(`judged ${judged} of ${walls.size} wall instances`)
    }

    if (falseClaims > 0) {
      fail(`${falseClaims} false solve claims`)
    }

    // G6: the controls, on every judged wall instance
    const externalFrontierPassed: string[] = []

    for (const [name, recipe] of CONTROL_RECIPES) {
      let tried = 0
      let clean = 0
      let rejected = 0

      for (const entry of graded) {
        const want = expected.get(entry.instance.id)

        if (want === undefined) {
          continue
        }

        tried++

        const grade = entry.instance.gradeRecipe(recipe)
        const report = readReport(grade.solverId)

        if (grade.violations.length === 0) {
          clean++
        }

        if (report === null || mismatches(report, want).length > 0 || report.registerCorruptions > 0) {
          rejected++
        } else if (name === 'externalFrontier') {
          // audit 3, m6: where the breadth-first layer equals the wave, the control's report is the honest one
          externalFrontierPassed.push(`${entry.instance.id} (stop step ${report.stopStep})`)
        }

        if (name === 'adjacentRegister' && report !== null) {
          control.adjacentRegisterKnockoutChangedPairs = (control.adjacentRegisterKnockoutChangedPairs ?? 0) + (report.knockout?.registerChangedPairs ?? 0)
        }
      }

      control[`${name}Tried`] = tried
      control[`${name}EvaluatorClean`] = clean
      control[`${name}JudgeRejected`] = rejected

      if (rejected === 0) {
        fail(`control ${name}: the judge never rejected it`)
      }
    }

    // item 0036 (audit 3, M1; the probe tmp/audit-intelligence-3/wave-split.ts, now a control): on the directed kinds no
    // judge recomputes the wave, so externalFrontier (breadth-first layers claimed as the wave) is graded clean there with
    // reports that differ from the honest solver's. Under the credit rule before item 0036 (every solve credited) those
    // solves were credited unseen; the rule now credits only judged solves, and the gate below checks it.
    const externalFrontierRecipe = CONTROL_RECIPES.find(([name]) => name === 'externalFrontier')![1]
    const unjudgedExternal = { tried: 0, clean: 0, differing: 0 }

    for (const entry of graded) {
      if (expected.has(entry.instance.id) || entry.report === null) {
        continue
      }

      const grade = entry.instance.gradeRecipe(externalFrontierRecipe)
      const report = readReport(grade.solverId)
      const honest = entry.report

      unjudgedExternal.tried++
      unjudgedExternal.clean += grade.violations.length === 0 ? 1 : 0

      const same =
        report !== null &&
        report.fieldDigest === honest.fieldDigest &&
        report.litDigest === honest.litDigest &&
        report.arrivalDigest === honest.arrivalDigest &&
        report.stopStep === honest.stopStep &&
        report.outcome === honest.outcome

      unjudgedExternal.differing += same ? 0 : 1
    }

    // the credit split must partition the solves exactly as the judge did; the old rule credited every unjudged solve
    control.externalFrontierUnjudgedTried = unjudgedExternal.tried
    control.externalFrontierUnjudgedEvaluatorClean = unjudgedExternal.clean
    control.externalFrontierUnjudgedDiffering = unjudgedExternal.differing
    control.oldCreditRuleUnjudgedCredited = unjudgedSplit.solves

    if (judgedSplit.solves !== judged || judgedSplit.solves + unjudgedSplit.solves !== graded.length) {
      fail(`credit split ${judgedSplit.solves} judged + ${unjudgedSplit.solves} unjudged against ${judged} judged of ${graded.length}`)
    }

    if (unjudgedExternal.tried !== unjudgedSplit.solves || (unjudgedExternal.tried > 0 && unjudgedExternal.differing === 0)) {
      fail(`externalFrontier on the unjudged kinds: tried ${unjudgedExternal.tried} of ${unjudgedSplit.solves}, differing ${unjudgedExternal.differing}`)
    }

    // G8: determinism and the source scan
    const again = navigationFamily(['line', '{3,6}']).instances.map(instance => {
      const grade = instance.gradeRecipe(MESH)

      return { instance, reference: referenceOf(instance.grade('breadthFirst')), grade, report: readReport(grade.solverId) }
    })
    const againIds = new Set(again.map(entry => entry.instance.id))
    const deterministic = againIds.size > 0 && digest(again) === digest(graded.filter(entry => againIds.has(entry.instance.id)))

    if (!deterministic) {
      fail('a second grading gave different ids or numbers')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/mesh-components.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // the provenance table. The rule (item 0030, fixed before the run): a component counts as mesh-realized only if
    // knocking out its rounds changes some read. The wave's knockout changes reads on every instance that steps; the
    // register's changes none (0 changed pairs on every solve, and none possible on a valid layout), so its rounds are
    // mesh storage with an identity round, counted but not credited.
    const waveKnockout = totals.waveKnockoutChangedValues ?? 0
    const registerKnockout = totals.registerKnockoutChangedPairs ?? 0

    if (waveKnockout === 0) {
      fail('the wave knockout changed no read: the wave would not be mesh-realized')
    }

    if (registerKnockout !== 0) {
      fail(`the register knockout changed ${registerKnockout} pairs on the honest solves: the register rounds are not the identity`)
    }

    if ((control.adjacentRegisterKnockoutChangedPairs ?? 0) === 0) {
      fail('the spacing-1 control showed no changed register pair: the knockout counter cannot see motion')
    }

    const waveOps = totals.waveArcReads! + totals.waveCellUpdates!
    const identityStorageOps = totals.registerPairUpdates!
    const meshOps = waveOps
    const routedOps = totals.litTests! + totals.expandGates! + totals.registerWrites!
    const noGoOps = totals.stopTests! + totals.readbackComparisons!
    const interfaceOps = totals.operatorCalls! + totals.goalTests!
    const share = (part: number): string => (part / (waveOps + identityStorageOps + routedOps + noGoOps)).toFixed(4)
    // item 0036: the credited shares are over the judged solves only; over all solves they are candidate-reported
    const judgedShare = (part: number): string => (part / judgedSplit.ownOps).toFixed(4)
    const unjudgedShare = (part: number): string => (unjudgedSplit.ownOps === 0 ? 0 : part / unjudgedSplit.ownOps).toFixed(4)

    for (const [name, value] of Object.entries(totals)) {
      metrics[name] = value
    }

    metrics.instances = graded.length
    metrics.violations = violations
    metrics.falseClaims = falseClaims
    metrics.optimal = optimal
    metrics.longer = longer
    metrics.missed = missed
    metrics.provedUnsolvableKept = provedUnsolvableKept
    metrics.judged = judged
    metrics.judgeRejected = judgeRejected
    metrics.holeFreeChecked = holeFreeChecked
    metrics.holeFreeOptimal = holeFreeOptimal
    metrics.holedInstances = holedInstances
    metrics.certifiedSteps = certifiedSteps
    metrics.foreignLawDifferingSteps = foreignDifferences
    metrics.registerWordsHeldSpacing2 = spaced.words - spaced.corrupted
    metrics.registerWordsCorruptedSpacing1 = adjacent.corrupted
    metrics.registerKnockoutReads = spaced.reads
    metrics.registerKnockoutChangedReadsSpacing2 = spaced.changedReads
    metrics.registerKnockoutChangedReadsSpacing1 = adjacent.changedReads
    metrics.registerLoneTonesFixed = loneFixed ? 1 : 0
    metrics.meshOps = meshOps
    metrics.identityStorageOps = identityStorageOps
    // item 0036: the credited share, judged solves only; the all-solve share beside it is candidate-reported
    metrics.meshShare = Number(judgedShare(judgedSplit.waveOps))
    metrics.identityStorageShare = Number(judgedShare(judgedSplit.identityOps))
    metrics.judgedSolves = judgedSplit.solves
    metrics.judgedWaveOps = judgedSplit.waveOps
    metrics.judgedWaveKnockoutChangedValues = judgedSplit.knockout
    metrics.unjudgedSolves = unjudgedSplit.solves
    metrics.unjudgedWaveOpsCandidateReported = unjudgedSplit.waveOps
    metrics.unjudgedWaveKnockoutCandidateReported = unjudgedSplit.knockout
    metrics.unjudgedMeshShareCandidateReported = Number(unjudgedShare(unjudgedSplit.waveOps))
    metrics.allSolvesMeshShareCandidateReported = Number(share(meshOps))
    metrics.allSolvesIdentityStorageShareCandidateReported = Number(share(identityStorageOps))
    metrics.formerMeshShare = Number(share(meshOps + identityStorageOps))
    metrics.routedExternalOps = routedOps
    metrics.noGoExternalOps = noGoOps
    metrics.interfaceOps = interfaceOps
    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length

    for (const [outcome, count] of outcomes) {
      metrics[`outcome_${outcome}`] = count
    }

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const kindRows = NAVIGATION_KINDS.map(name => {
      const k = perKind.get(name)!

      return `${name}: optimal ${k.optimal}, longer ${k.longer}, missed ${k.missed}, proved unsolvable ${k.unsolvable}; operator calls ${k.meshCalls} against BFS ${k.bfsCalls}, expansions ${k.meshExpansions} against ${k.bfsExpansions}, bytes ${k.meshBytes} against ${k.bfsBytes}, widest frontier ${k.widest}`
    })
    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 4, slice 1: on all ${graded.length} instances of benchmark family A a solver whose frontier is the M3-B Z3 wave on the configuration graph it discovers and whose visited memory is held in an M4 static register is graded clean by the level-1 evaluator; it is never below breadth-first search and matches its optimum on ${optimal} of ${optimal + longer} solves (${longer} longer, ${missed} solvable instances missed), exactly where the wave front has no Lucas hole inside the goal's radius (${holeFreeOptimal} of ${holeFreeChecked} judged hole-free instances optimal); a judge recomputes all ${judged} wall instances with the original rule; counting a component as mesh-realized only if knocking out its rounds changes some read, and crediting only what the judge recomputed, transport is mesh-realized on the ${judgedSplit.solves} judged wall solves (${judgedShare(judgedSplit.waveOps)} of their own operations; the judge's wave knockout changes ${totals.judgeWaveKnockoutChangedValues ?? 0} node values there), while on the ${unjudgedSplit.solves} directed-kind solves the wave counts are the candidate's report and are not credited (${unjudgedSplit.waveOps} wave operations, share ${unjudgedShare(unjudgedSplit.waveOps)} candidate-reported; a breadth-first control is graded clean on ${unjudgedExternal.clean} of ${unjudgedExternal.tried} of them with reports differing from the honest solver's on ${unjudgedExternal.differing}, and no judge looks there), and the register is mesh storage with an identity round, counted but not credited (${judgedShare(judgedSplit.identityOps)} on the judged solves; its knockout changes ${registerKnockout} pairs on the solves and ${spaced.changedReads} of ${spaced.reads} reads over every 4-slot word, and none can change on a valid layout of any length), the lit test, expand gate and register write are occupancy-routed decisions left in candidate code (${judgedShare(judgedSplit.routedOps)}), and the stop test and path read-back need tables the M5 lemma forbids every occupancy-blind rule (${judgedShare(judgedSplit.noGoOps)}); over all ${graded.length} solves, candidate-reported, the shares are ${share(meshOps)}, ${share(identityStorageOps)}, ${share(routedOps)} and ${share(noGoOps)}`,
      metrics,
      control,
      notes: `L2. Provenance (every count summed over the ${graded.length} solves). The rule (fixed before the run): a component counts as mesh-realized only if knocking out its rounds (the identity in place of a round) changes some read. Mesh computation: frontier transport and fan-out by the M3-B wave (${totals.waveArcReads} arc reads, ${totals.waveCellUpdates} node updates; certified equal to secondOrderZ3Step on C16, the 8 x 8 torus, Q6 and K9 over ${certifiedSteps} steps, the self-1 law differing at ${foreignDifferences}); knocking out each step changes ${waveKnockout} node values in all, on ${totals.waveKnockoutInstancesChanged ?? 0} of ${graded.length} solves, the judge's recomputation agreeing on all ${judged} wall instances (${totals.judgeWaveKnockoutChangedValues ?? 0} there). Mesh storage with an identity round, not credited: the M4 line register of id.CBA.id at spacing 2 (${totals.registerPairUpdates} pair updates, ${registerKnockout} of them changing their pair; every 4-slot word held 48 rounds, ${spaced.changedReads} of ${spaced.reads} reads changed by the rounds, against ${adjacent.changedReads} at spacing 1, where ${adjacent.corrupted} of 81 words are corrupted; at spacing 2 a pair is always (t, 0) or (0, t) and id.CBA.id fixes all five, so the round is the identity on every valid layout and a plain array with the same ports computes the same function). Formerly the register was credited as mesh, giving a mesh share of ${share(meshOps + identityStorageOps)}. External but occupancy-routed, so not excluded by the M5 lemma (the lit test is the switch |x| M5 found; the expand gate and the write have no layout built): lit tests ${totals.litTests}, expand gates ${totals.expandGates}, register writes ${totals.registerWrites}. External and impossible for the 12 occupancy-blind cells (not occupancy-routed): stop tests (equality with +1) ${totals.stopTests}, read-back comparisons (min) ${totals.readbackComparisons}. The interface: operator calls ${totals.operatorCalls} and goal tests ${totals.goalTests}, the evaluator's. Shares of the solver's own operations on the judged solves: mesh computation ${judgedShare(judgedSplit.waveOps)}, identity-round storage ${judgedShare(judgedSplit.identityOps)}, routed external ${judgedShare(judgedSplit.routedOps)}, no-go external ${judgedShare(judgedSplit.noGoOps)}; over all solves, candidate-reported: ${share(meshOps)}, ${share(identityStorageOps)}, ${share(routedOps)}, ${share(noGoOps)}. Outcomes: ${[...outcomes].map(([o, n]) => `${o} ${n}`).join(', ')} (the wave work cap is ${WAVE_WORK_CAP} arc reads; exhausted means the field came back to its seed, so nothing more would ever light). Per kind: ${kindRows.join('; ')}. Holes inside the goal's radius on judged solved instances, per geometry: ${[...holesByGeometry].map(([g, n]) => `${g} ${n}`).join(', ')}; ${holedInstances} judged instances have one. The widest frontier is the number of movers a number-conserving M3-A transport would need placed at once: occupancy is conserved under the occupancy-blind rules, so one mover never fans out. Credit (item 0036, audit 3 M1): before the item every solve was credited, ${unjudgedSplit.solves} of them on the candidate's report alone (${unjudgedSplit.waveOps} wave operations, ${unjudgedSplit.knockout} knockout values); now the label, the knockout total and the shares rest on the ${judgedSplit.solves} judged solves (${judgedSplit.waveOps} wave operations, ${judgedSplit.knockout} knockout values reported, ${totals.judgeWaveKnockoutChangedValues ?? 0} recomputed). On the unjudged kinds externalFrontier is graded clean ${unjudgedExternal.clean} of ${unjudgedExternal.tried} and differs from the honest report on ${unjudgedExternal.differing}. Controls (the judged wall instances): externalFrontier graded clean by the evaluator ${control.externalFrontierEvaluatorClean} of ${control.externalFrontierTried}, judge rejected ${control.externalFrontierJudgeRejected} (it passes where the breadth-first layer equals the wave: ${externalFrontierPassed.join(', ') || 'none'}); foreignLaw clean ${control.foreignLawEvaluatorClean}, rejected ${control.foreignLawJudgeRejected} of ${control.foreignLawTried}; adjacentRegister clean ${control.adjacentRegisterEvaluatorClean}, rejected ${control.adjacentRegisterJudgeRejected} of ${control.adjacentRegisterTried} (the register is read once, at the stop step, and at spacing 1 an adjacent opposite pair trades cells once a round, so an even round count hides the corruption; the rest have no adjacent opposite pair). Limits: on a valid layout the static carrier is the identity, so a plain array computes the same function; the register is therefore not credited as mesh computation, and the judge can catch only an invalid layout. The wave runs on the configuration graph, the tiling's own open-cell graph only for maze and obstacle; on the directed kinds the in-neighbour sum is a declared extension of M3-B and is not recomputed by the judge. Sandbox: the bundle refuses code/rule/second-order-z3 (${refusedWave.ok ? 'accepted' : refusedWave.reason}). ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
