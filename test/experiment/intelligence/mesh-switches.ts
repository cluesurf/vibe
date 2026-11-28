// Intelligence level 4, slice 2 (item vibe-computation-intelligence-0022, level4.md of vibe/computation/intelligence):
// the decisions of the level-4 solver that a mesh layout can make, made by one. Slice 1 (E-CMP-0056) left every
// decision in candidate code. Here the lit test |x| and the expand gate run as M5 switch layouts of the occupancy-blind
// exchange rule swap.ABC.swap on the vacuum, on the line under the brick schedule, one run per decision, and the
// solver reads each decision at the layout's read cell. The solver carries its own copy of the rule table and the
// layouts (a candidate may not import code/rule or code/compute/lab); the judge checks them against pairRulesFromFibers
// and lineBrickRun cell for cell. The register write, the stop test and the path read-back stay external, each with
// its proof: by the M6 no-feedback lemma (G2, G5) the occupancy of every cell under an occupancy-blind cell is the
// start occupancy of one fixed cell, and the write needs the slot's occupancy to be "x and g" (or "x or s"); the
// stop test and min are not even occupancy-routed (M5). The expand gate's 0/1 form fails the same test, so it runs in
// signed form (+1 expand, -1 not), whose output cell is always occupied.
//
// Gates, fixed before the first run (level4.md, slice 2), each able to fail:
// - S1 certificate: the solver's table equals swap.ABC.swap (occupancy-blind on 0); for each layout and every input the
//   solver's run equals lineBrickRun at every round, cell for cell; the read cell gives the decision's truth table and
//   rides its wire for 8 more rounds; every run spends the same pair updates. Controls: a layout with one constant
//   flipped and the full swap's table each give a wrong table.
// - S2 the lemma: every occupancy-blind cell moves lone cells alike in both pair orders (so occupancy moves by one fixed
//   cell permutation); live on the line, every occupancy frame is a fixed start cell's occupancy over all starts (a
//   not-blind cell fails); the lit test and the signed expand gate pass the transport test, the 0/1 expand gate and both
//   register writes fail it while all five are occupancy-routed.
// - S3 every meshSwitch grade on family A clean, no false claim; on every instance its cost, outcome, stop step and
//   wave, register and field digests equal meshWave's (BFS optimality unchanged); runs equal decisions; pair updates
//   equal runs times the layout's constant.
// - S4 judge: on every wall instance the lit and expand frame digests and run counts equal the judge's recomputation
//   (its own frame hash over lineBrickRun frames, its own discovered set). Since decision 003 the evaluator runs every
//   switch round itself (a metered operator, rule by name, layout as data) and the judge reads the evaluator's meter,
//   not the report: a decision is mesh-realized only when the evaluator ran it on the certified layout (S3 gates that
//   every meshSwitch decision was, and that meshWave's meter is empty).
// - S5 controls, each graded clean by the evaluator alone: formulaDecisions (decided in candidate code, frame made up)
//   and extraConstantSwitch (a layout that is not the certified one) rejected by the judge at least once each;
//   lookupSwitch (each layout run once per input word in candidate code, every decision looked up, its report equal to
//   meshSwitch's field for field on every instance) classified external on every instance and rejected on every wall
//   instance.
// - S6 the sandbox bundle accepts meshSwitch and refuses code/compute/lab/gates; S7 determinism and no random or clock
//   source.

import { resolve } from 'node:path'
import { gateRule, inputsOf, lineBrickRun, lineLoneTrack, occupancyBlind, occupancyRouted, truthTable, type GateRule } from '@/code/compute/lab/gates'
import { AGENT, OPEN, WALL, rawToneKey } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { familyGeometries, navigationFamily } from '@/code/intelligence/benchmark/navigation/family'
import { SOLVER_CATALOG, type GradeSummary, type NavigationInstance, type SolverRecipe } from '@/code/intelligence/benchmark/navigation/instance'
import { mazeWalls, obstacleWalls } from '@/code/intelligence/benchmark/navigation/maze'
import { hopDistances, shortestCellPath } from '@/code/intelligence/benchmark/navigation/mesh-distance'
import { referenceOf } from '@/code/intelligence/benchmark/navigation/profile'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { meshLineRun, type MeshLayoutMeter, type MeshMeter } from '@/code/intelligence/problem/evaluate'
import { candidateBundle } from '@/code/intelligence/sandbox/bundle'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { MESH_ID_PREFIX, SWITCH_CLAIMS, WAVE_WORK_CAP, type MeshReport, type SwitchReport } from '@/code/intelligence/solver/mesh/mesh-wave'
import { EXCHANGE_RULE, EXCHANGE_TABLE, EXPAND_SWITCH, LIT_SWITCH, runSwitch, switchLength, type SwitchLayout } from '@/code/intelligence/solver/mesh/switch'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { toneOf } from '@/code/intelligence/solver/mesh/wave'
import type { LabGeometry } from '@/code/substrate/lab-geometry'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { secondOrderZ3Step } from '@/code/rule/second-order-z3'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const SWITCH: SolverRecipe = { module: SOLVER_CATALOG, export: 'meshSwitch' }
const WAVE: SolverRecipe = { module: SOLVER_CATALOG, export: 'meshWave' }
const CONTROLS = 'code/intelligence/solver/mesh/mesh-controls'
const CONTROL_RECIPES: readonly (readonly [string, SolverRecipe])[] = [
  ['formulaDecisions', { module: CONTROLS, export: 'formulaDecisions' }],
  ['extraConstantSwitch', { module: CONTROLS, export: 'extraConstantSwitch' }],
  ['lookupSwitch', { module: CONTROLS, export: 'lookupSwitch' }],
]
const LAW = { kind: 'linear', self: 0 } as const
const HOLD = 8

/** The decisions, as formulas (the judge's own), and the tables the solver's layouts must give. */
const litFormula = ([x]: readonly number[]): number => (x !== 0 ? 1 : 0)
const expandFormula = ([x, s]: readonly number[]): number => (x !== 0 && s === 0 ? 1 : -1)

// ---------------------------------------------------------------- the report a solver id carries

const INTEGER_FIELDS = [
  'stopStep', 'states', 'expanded', 'widestFrontier', 'litSteps', 'litDigest', 'arrivalDigest', 'fieldDigest',
  'registerCorruptions', 'registerCells', 'registerRounds', 'registerPairUpdates', 'waveArcReads', 'waveCellUpdates',
  'litTests', 'expandGates', 'registerWrites', 'goalTests', 'stopTests', 'readbackComparisons', 'meshBytes',
] as const

const SWITCH_FIELDS = ['litRuns', 'expandRuns', 'litPairUpdates', 'expandPairUpdates', 'litFrameDigest', 'expandFrameDigest'] as const

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

  if (raw.kind !== 'mesh-wave' || typeof raw.outcome !== 'string') {
    return null
  }

  return raw as unknown as MeshReport
}

/** The slice-2 part of a report, or null when it is missing or malformed. */
function switchesOf(report: MeshReport | null): SwitchReport | null {
  const raw = report?.switches as unknown as Record<string, unknown> | undefined

  if (raw === undefined || raw === null || typeof raw !== 'object') {
    return null
  }

  for (const name of SWITCH_FIELDS) {
    const value = raw[name]

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      return null
    }
  }

  return raw as unknown as SwitchReport
}

// ---------------------------------------------------------------- the judge's frames, from gates.ts

const EXCHANGE: GateRule = (() => {
  const found = pairRulesFromFibers().find(rule => rule.name === EXCHANGE_RULE)

  if (found === undefined) {
    throw new Error(`no pair rule ${EXCHANGE_RULE}`)
  }

  return gateRule(found.name, found.table)
})()

/** The judge's frame hash (its own code, the same polynomial the solver declares). */
function judgeFrameHash(frame: Int8Array): number {
  let h = 7

  for (const tone of frame) {
    h = (h * 31 + tone + 1) % 1_000_003
  }

  return h
}

/** lineBrickRun of a layout on one input word, to its read round. */
function judgeRun(layout: SwitchLayout, word: readonly number[], rule: GateRule = EXCHANGE, rounds = layout.readRound) {
  const window = Int8Array.from(layout.window)

  layout.inputs.forEach((at, j) => {
    window[at] = word[j]!
  })

  return lineBrickRun({ rule, background: 0, start: layout.start, window, rounds })
}

/** Per layout: the final-frame hash and the read of every input word, keyed by the word, from lineBrickRun. */
function judgeHashes(layout: SwitchLayout): Map<string, { frameHash: number; value: number }> {
  const out = new Map<string, { frameHash: number; value: number }>()

  for (const word of inputsOf(layout.inputs.length)) {
    const run = judgeRun(layout, word)
    const frame = run.frames[layout.readRound]!

    out.set(word.join(','), { frameHash: judgeFrameHash(frame), value: frame[layout.readPosition + run.pad]! })
  }

  return out
}

// ---------------------------------------------------------------- the knockout (item 0030)

/** The identity pair rule: a knockout puts it in place of every round of a layout. */
const IDENTITY: { gate: GateRule; table: readonly number[] } = (() => {
  const found = pairRulesFromFibers().find(rule => rule.name === 'id.ABC.id')

  if (found === undefined) {
    throw new Error('no pair rule id.ABC.id')
  }

  return { gate: gateRule(found.name, found.table), table: Array.from(found.table) }
})()

/**
 * Over every input word, whether the read cell after the layout's rounds differs from the read cell when every round
 * is knocked out (the identity in its place, which leaves the start frame). A layout counts as mesh computation only if
 * some word's read changes.
 */
function knockOut(layout: SwitchLayout): { words: number; changed: number; changedWords: string[] } {
  let words = 0
  let changed = 0

  const changedWords: string[] = []

  for (const word of inputsOf(layout.inputs.length)) {
    const honest = judgeRun(layout, word)
    const knocked = judgeRun(layout, word, IDENTITY.gate)

    words++

    if (honest.frames[layout.readRound]![layout.readPosition + honest.pad] !== knocked.frames[layout.readRound]![layout.readPosition + knocked.pad]) {
      changed++
      changedWords.push(word.join(','))
    }
  }

  return { words, changed, changedWords }
}

// ---------------------------------------------------------------- S1, the certificate

interface Certificate { inputs: number; frameDifferences: number; tableDifferences: number; notRiding: number; pairUpdates: number; pairUpdatesVary: boolean }

/** Whether the read cell of a layout equals its formula on every input, rides its wire for HOLD rounds, and the solver's run equals lineBrickRun. */
function certify(layout: SwitchLayout, formula: (x: readonly number[]) => number, table: readonly number[] = EXCHANGE_TABLE, rule: GateRule = EXCHANGE): Certificate {
  const cells = new Int8Array(switchLength(layout))
  const result: Certificate = { inputs: 0, frameDifferences: 0, tableDifferences: 0, notRiding: 0, pairUpdates: -1, pairUpdatesVary: false }

  inputsOf(layout.inputs.length).forEach((word, n) => {
    const frames: Int8Array[] = []
    const mine = runSwitch(layout, word, cells, table, frames)
    const judged = judgeRun(layout, word, rule)
    // the evaluator's own runner (decision 003), the one that executes every metered round
    const meteredFrames: Int8Array[] = []
    const metered = meshLineRun(table, layout, word, new Int8Array(switchLength(layout)), meteredFrames)
    const differ = (a: readonly Int8Array[], b: readonly Int8Array[]): boolean =>
      a.length !== b.length || a.some((frame, t) => frame.length !== b[t]!.length || frame.some((tone, i) => tone !== b[t]![i]))

    result.inputs++

    if (differ(judged.frames, frames) || differ(judged.frames, meteredFrames) || metered.pairUpdates !== mine.pairUpdates || metered.frameHash !== mine.frameHash) {
      result.frameDifferences++
    }

    const want = formula(word)
    const read = judged.frames[layout.readRound]![layout.readPosition + judged.pad]!

    if (read !== want || mine.value !== want || metered.value !== want || layout.table[n] !== want) {
      result.tableDifferences++
    }

    // the output rides its wire: the value follows the lone track of its parity for HOLD more rounds
    const long = judgeRun(layout, word, rule, layout.readRound + HOLD)
    const index = layout.readPosition + long.pad
    const track = want === 0 ? null : lineLoneTrack({ rule, background: 0, parity: ((layout.readPosition % 2) + 2) % 2, tone: want, rounds: HOLD })

    if (want !== 0) {
      if (track === null || track.every(step => step === 0)) {
        result.notRiding++
      } else {
        for (let k = 1; k <= HOLD; k++) {
          if (long.frames[layout.readRound + k]![index + track[k]! - track[0]!] !== want) {
            result.notRiding++
            break
          }
        }
      }
    }

    if (result.pairUpdates < 0) {
      result.pairUpdates = mine.pairUpdates
    } else if (result.pairUpdates !== mine.pairUpdates) {
      result.pairUpdatesVary = true
    }
  })

  return result
}

// ---------------------------------------------------------------- S2, occupancy transport (M6 G2, G5)

/** Whether a lone tone is kept or swapped alike in both pair orders, for every off-background tone (pair level). */
function loneMovesAlike(rule: GateRule, background: number): boolean {
  const moves = new Set<string>()

  for (let v = -1; v <= 1; v++) {
    if (v === background) {
      continue
    }

    for (const [a, b] of [[v, background], [background, v]] as const) {
      const p = (a + 1) * 3 + b + 1
      const x = rule.first[p]!
      const y = rule.second[p]!

      moves.add(x === a && y === b ? 'keep' : x === b && y === a ? 'swap' : 'other')
    }
  }

  return moves.size === 1 && !moves.has('other')
}

/**
 * Live on the line: over every window of `width` cells, each run `rounds` rounds, whether the occupancy of every cell at
 * every round is the start occupancy of one fixed cell (or always empty), the same for every start.
 */
function occupancyTransported(rule: GateRule, background: number, width: number, rounds: number): boolean {
  for (const start of [0, 1]) {
    const runs: { occupied: boolean[]; frames: Int8Array[]; pad: number }[] = []

    for (let code = 0; code < 3 ** width; code++) {
      const window = Array.from({ length: width }, (_, i) => (Math.floor(code / 3 ** i) % 3) - 1)
      const run = lineBrickRun({ rule, background, start, window, rounds })

      runs.push({ occupied: window.map(v => v !== background), frames: run.frames, pad: run.pad })
    }

    const length = runs[0]!.frames[0]!.length

    for (let t = 1; t <= rounds; t++) {
      for (let i = 0; i < length; i++) {
        const occupancy = runs.map(r => r.frames[t]![i] !== background)

        if (occupancy.every(o => !o)) {
          continue
        }

        const source = Array.from({ length: width }, (_, c) => c).some(c => runs.every((r, n) => r.occupied[c] === occupancy[n]))

        if (!source) {
          return false
        }
      }
    }
  }

  return true
}

/** A table passes the transport test when its output's occupancy is constant or one input's occupancy. */
function occupancyTransportable(table: ArrayLike<number>, arity: number, background: number): boolean {
  const inputs = inputsOf(arity)
  const occupied = inputs.map((_, n) => table[n] !== background)

  if (occupied.every(o => o === occupied[0])) {
    return true
  }

  return Array.from({ length: arity }, (_, j) => j).some(j => inputs.every((x, n) => (x[j] !== background) === occupied[n]))
}

// ---------------------------------------------------------------- S4, the judge's recomputation of a wall instance

interface WallCase { id: string; graph: LabGeometry['graph']; walls: Uint8Array; goal: number }

interface Expected {
  outcome: string
  stopStep: number
  litRuns: number
  expandRuns: number
  litFrameDigest: number
  expandFrameDigest: number
}

type JudgeHashes = Map<string, { frameHash: number; value: number }>

function recompute(wall: WallCase, litHash: JudgeHashes, expandHash: JudgeHashes): Expected {
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

    return meshKeyHash(rawToneKey(tones))
  })
  const n = cells.length
  const goalIndex = at.get(goal) ?? -1
  const firstLit = new Int32Array(n).fill(-1)
  const slot = new Int8Array(n)
  const discovered = new Uint8Array(n)
  // the evaluator's chain (item 0037), one request per step and layout: the lit request on every discovered node, the
  // expand request on the lit-read ones; the step, each node's key, word, frame hash and read are folded in
  const litChain = meshChain(EXCHANGE_RULE, { ...LIT_SWITCH, background: 0 })
  const expandChain = meshChain(EXCHANGE_RULE, { ...EXPAND_SWITCH, background: 0 })

  let previous = new Uint8Array(n)
  let current = new Uint8Array(n)
  let arcs = 0
  let waveReads = 0
  let outcome = ''
  let stopStep = 0
  let litRuns = 0
  let expandRuns = 0
  let litFrameDigest = 0
  let expandFrameDigest = 0

  current[0] = 1
  discovered[0] = 1

  for (let step = 0; ; step++) {
    stopStep = step

    const lit: number[] = []
    const litBatch: MeshDigestRun[] = []
    const expandBatch: MeshDigestRun[] = []

    for (let i = 0; i < n; i++) {
      if (discovered[i] === 0) {
        continue
      }

      const x = toneOf(current[i]!)
      const litRun = litHash.get(`${x}`)!

      litRuns++
      litBatch.push({ keyHash: hashes[i]!, word: [x], frameHash: litRun.frameHash, value: litRun.value })

      if (x === 0) {
        continue
      }

      const expandRun = expandHash.get(`${x},${slot[i]}`)!

      expandRuns++
      expandBatch.push({ keyHash: hashes[i]!, word: [x, slot[i]!], frameHash: expandRun.frameHash, value: expandRun.value })

      if (firstLit[i]! < 0) {
        lit.push(i)
      }
    }

    if (litBatch.length > 0) {
      litFrameDigest = litChain.fold(step, litBatch)
    }

    if (expandBatch.length > 0) {
      expandFrameDigest = expandChain.fold(step, expandBatch)
    }

    let found = false

    for (const i of lit) {
      firstLit[i] = step
      slot[i] = toneOf(current[i]!)
      arcs += neighbors[i]!.length

      for (const j of neighbors[i]!) {
        discovered[j] = 1
      }

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

  return { outcome, stopStep, litRuns, expandRuns, litFrameDigest, expandFrameDigest }
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

/** The wall instances, rebuilt from the benchmark's own patterns (as E-CMP-0056 rebuilds them). */
function wallCases(): Map<string, WallCase> {
  const out = new Map<string, WallCase>()

  for (const family of familyGeometries()) {
    const geometry = family.walk
    const graph = geometry.graph
    const name = geometry.spec.name

    for (const kind of ['maze', 'obstacle'] as const) {
      const walls = kind === 'maze' ? mazeWalls(geometry) : obstacleWalls(geometry)

      walls[0] = 0

      const goal = kind === 'maze' ? farthestOpen(graph, walls) : highestOpen(walls)

      out.set(`${kind}-base-${name}`, { id: `${kind}-base-${name}`, graph, walls, goal })

      const path = shortestCellPath(graph, 0, goal, cell => walls[cell] === 1)

      if (path !== null && path.length >= 3) {
        const blocked = walls.slice()

        blocked[path[Math.floor(path.length / 2)]!] = 1
        out.set(`${kind}-blocked-${name}`, { id: `${kind}-blocked-${name}`, graph, walls: blocked, goal })
      }

      if (kind === 'maze' && goal !== 0) {
        const sealed = walls.slice()

        for (const cell of graph.neighbors[goal]!) {
          if (cell !== 0) {
            sealed[cell] = 1
          }
        }

        out.set(`${kind}-sealed-${name}`, { id: `${kind}-sealed-${name}`, graph, walls: sealed, goal })
      }
    }
  }

  return out
}

// ---------------------------------------------------------------- the evaluator's mesh meter (decision 003)

/** Whether a metered layout is the certified one under the claimed rule. */
function isLayout(entry: MeshLayoutMeter, layout: SwitchLayout): boolean {
  return (
    entry.rule === EXCHANGE_RULE &&
    // the vacuum, checked on every entry (audit 3, m1), never assumed from the digest
    entry.layout.background === 0 &&
    entry.layout.start === layout.start &&
    entry.layout.readPosition === layout.readPosition &&
    entry.layout.readRound === layout.readRound &&
    entry.layout.window.join(',') === layout.window.join(',') &&
    entry.layout.inputs.join(',') === layout.inputs.join(',')
  )
}

interface Metered {
  lit: MeshLayoutMeter | null
  expand: MeshLayoutMeter | null
  /** metered entries that are neither certified layout under the claimed rule */
  other: number
  /** decisions the evaluator ran on a certified layout */
  litRuns: number
  expandRuns: number
}

function meteredOf(mesh: MeshMeter): Metered {
  const lit = mesh.layouts.find(entry => isLayout(entry, LIT_SWITCH)) ?? null
  const expand = mesh.layouts.find(entry => isLayout(entry, EXPAND_SWITCH)) ?? null

  return {
    lit,
    expand,
    other: mesh.layouts.length - (lit === null ? 0 : 1) - (expand === null ? 0 : 1),
    litRuns: lit?.runs ?? 0,
    expandRuns: expand?.runs ?? 0,
  }
}

/**
 * The judge (decision 003): it reads the evaluator's meter, never the report, for what the mesh ran. On a wall instance
 * the metered runs and frame digests of the certified layouts must equal its recomputation, nothing else may have been
 * run, the report's outcome and stop step must equal the recomputed wave's, and the report must agree with the meter.
 */
function switchMismatches(report: MeshReport | null, mesh: MeshMeter, expected: Expected): string[] {
  const switches = switchesOf(report)

  if (report === null || switches === null) {
    return ['no readable switch report']
  }

  const out: string[] = []
  const metered = meteredOf(mesh)

  if (JSON.stringify(switches.claims) !== JSON.stringify(SWITCH_CLAIMS)) {
    out.push(`claims ${JSON.stringify(switches.claims)}`)
  }

  if (report.outcome !== expected.outcome || report.stopStep !== expected.stopStep) {
    out.push(`outcome ${report.outcome} at ${report.stopStep} against ${expected.outcome} at ${expected.stopStep}`)
  }

  if (metered.other > 0) {
    out.push(`${metered.other} metered layouts that are not the certified ones`)
  }

  for (const [name, entry, runs, digest] of [
    ['lit', metered.lit, expected.litRuns, expected.litFrameDigest],
    ['expand', metered.expand, expected.expandRuns, expected.expandFrameDigest],
  ] as const) {
    if ((entry?.runs ?? 0) !== runs || (entry?.frameDigest ?? 0) !== digest) {
      out.push(`metered ${name} runs ${entry?.runs ?? 0} digest ${entry?.frameDigest ?? 0} against ${runs} and ${digest}`)
    }
  }

  if (
    switches.litRuns !== metered.litRuns ||
    switches.expandRuns !== metered.expandRuns ||
    switches.litPairUpdates !== (metered.lit?.pairUpdates ?? 0) ||
    switches.expandPairUpdates !== (metered.expand?.pairUpdates ?? 0) ||
    switches.litFrameDigest !== (metered.lit?.frameDigest ?? 0) ||
    switches.expandFrameDigest !== (metered.expand?.frameDigest ?? 0)
  ) {
    out.push('the report disagrees with the meter')
  }

  return out
}

// ---------------------------------------------------------------- the experiment

interface Graded { instance: NavigationInstance; grade: GradeSummary; report: MeshReport | null }

function digest(entries: readonly Graded[]): string {
  return entries
    .map(e => `${e.instance.id}:${e.grade.solverId}:${e.grade.cost}:${e.grade.operatorCalls}:${e.grade.expansions}:${e.grade.bytes}`)
    .join(';')
}

export default experiment({
  id: 'intelligence/mesh-switches',
  code: 'E-CMP-0060',
  title:
    'intelligence level 4, slice 2: the lit test and the expand gate of the level-4 solver run as M5 switch layouts of the occupancy-blind exchange swap.ABC.swap on the line, certified cell for cell against lineBrickRun, on all of benchmark family A under the level-1 evaluator, with the register write, stop test and read-back kept external by the M5 occupancy lemma and the M6 no-feedback lemma, and the provenance table before and after',
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

    // S1: the certificate
    const exchangeRule = pairRulesFromFibers().find(rule => rule.name === EXCHANGE_RULE)

    if (exchangeRule === undefined || Array.from(exchangeRule.table).join(',') !== EXCHANGE_TABLE.join(',')) {
      fail(`the switch table is not ${EXCHANGE_RULE}`)
    }

    if (!occupancyBlind(EXCHANGE, 0)) {
      fail(`${EXCHANGE_RULE} is not occupancy-blind on the vacuum`)
    }

    const litCertificate = certify(LIT_SWITCH, litFormula)
    const expandCertificate = certify(EXPAND_SWITCH, expandFormula)

    for (const [name, c] of [['lit', litCertificate], ['expand', expandCertificate]] as const) {
      if (c.frameDifferences > 0 || c.tableDifferences > 0 || c.notRiding > 0 || c.pairUpdatesVary || c.pairUpdates <= 0) {
        fail(`${name} certificate: ${JSON.stringify(c)}`)
      }
    }

    // certificate controls: a flipped constant, and the full swap's table, each give a wrong table
    const flipped: SwitchLayout = { ...EXPAND_SWITCH, window: EXPAND_SWITCH.window.map((tone, i) => (i === 2 ? -tone : tone)) }
    const flippedCertificate = certify(flipped, expandFormula)
    const fullSwapTable = pairRulesFromFibers().find(rule => rule.name === 'swap.CBA.swap')!
    const fullSwap = gateRule(fullSwapTable.name, fullSwapTable.table)
    const fullSwapCertificate = certify(EXPAND_SWITCH, expandFormula, Array.from(fullSwapTable.table), fullSwap)

    if (flippedCertificate.tableDifferences === 0) {
      fail('a layout with a flipped constant passed the certificate')
    }

    if (fullSwapCertificate.tableDifferences === 0) {
      fail('the full swap passed the expand certificate')
    }

    // the switch knockouts (item 0030): a layout is mesh computation only if knocking out its rounds changes some read
    if (IDENTITY.table.some((q, p) => q !== p)) {
      fail('id.ABC.id is not the identity, so it cannot stand in for a knocked-out round')
    }

    const litKnockout = knockOut(LIT_SWITCH)
    const expandKnockout = knockOut(EXPAND_SWITCH)

    if (litKnockout.changed === 0 || expandKnockout.changed === 0) {
      fail(`a switch knockout changed no read (lit ${litKnockout.changed} of ${litKnockout.words}, expand ${expandKnockout.changed} of ${expandKnockout.words}): that layout is not mesh computation`)
    }

    // the per-solve counts below rest on which words change: the lit read exactly where it reads 1, the expand read
    // exactly where it reads +1
    const litWant = inputsOf(1).filter(word => litFormula(word) === 1).map(word => word.join(',')).join(';')
    const expandWant = inputsOf(2).filter(word => expandFormula(word) === 1).map(word => word.join(',')).join(';')

    if (litKnockout.changedWords.join(';') !== litWant || expandKnockout.changedWords.join(';') !== expandWant) {
      fail(`switch knockout words: lit ${litKnockout.changedWords.join(';')} (want ${litWant}), expand ${expandKnockout.changedWords.join(';')} (want ${expandWant})`)
    }

    // S2: the transport lemma
    let blindCells = 0
    let blindLoneAlike = 0
    let liveTransported = 0

    for (const rule of pairRulesFromFibers()) {
      const gate = gateRule(rule.name, rule.table)

      for (const background of [-1, 0, 1]) {
        const p = (background + 1) * 4

        if (gate.first[p] !== background || gate.second[p] !== background || !occupancyBlind(gate, background)) {
          continue
        }

        blindCells++

        if (loneMovesAlike(gate, background)) {
          blindLoneAlike++
        }

        if (occupancyTransported(gate, background, 5, 6)) {
          liveTransported++
        }
      }
    }

    if (blindCells !== 12 || blindLoneAlike !== 12 || liveTransported !== 12) {
      fail(`transport lemma: blind ${blindCells}, lone moves alike ${blindLoneAlike}, live ${liveTransported} (want 12 each)`)
    }

    const reactive = pairRulesFromFibers().find(rule => rule.name === 'id.CAB.swap')!
    const reactiveTransported = occupancyTransported(gateRule(reactive.name, reactive.table), 1, 5, 6)

    if (reactiveTransported) {
      fail('the not-blind control id.CAB.swap on +1 passed the live transport test')
    }

    const decisions = [
      { name: 'litTest', arity: 1, table: truthTable(1, litFormula), mesh: true },
      { name: 'expandGateSigned', arity: 2, table: truthTable(2, expandFormula), mesh: true },
      { name: 'expandGateBit', arity: 2, table: truthTable(2, ([x, s]) => (x !== 0 && s === 0 ? 1 : 0)), mesh: false },
      { name: 'registerWriteGated', arity: 2, table: truthTable(2, ([x, g]) => (g !== 0 ? x! : 0)), mesh: false },
      { name: 'registerWriteMerge', arity: 2, table: truthTable(2, ([x, s]) => (s !== 0 ? s! : x!)), mesh: false },
    ]
    const classified: string[] = []

    for (const decision of decisions) {
      const routed = occupancyRouted(decision.table, decision.arity, 0)
      const transportable = occupancyTransportable(decision.table, decision.arity, 0)

      classified.push(`${decision.name} routed ${routed} transportable ${transportable}`)

      if (!routed || transportable !== decision.mesh) {
        fail(`decision ${decision.name}: routed ${routed}, transportable ${transportable}, slice 2 says routed and ${decision.mesh}`)
      }
    }

    if (Array.from(LIT_SWITCH.table).join(',') !== Array.from(decisions[0]!.table).join(',') || Array.from(EXPAND_SWITCH.table).join(',') !== Array.from(decisions[1]!.table).join(',')) {
      fail('a layout declares a table other than its decision')
    }

    // S6: the sandbox bundle
    const refusedGates = candidateBundle('code/compute/lab/gates', 'lineBrickRun', 'solver')
    const accepted = candidateBundle(SOLVER_CATALOG, 'meshSwitch', 'solver')

    if (refusedGates.ok) {
      fail('the sandbox bundle accepted code/compute/lab/gates as a candidate')
    }

    if (!accepted.ok) {
      fail(`the meshSwitch bundle was refused: ${accepted.reason}`)
    }

    // S3: the family, both solvers
    const family = navigationFamily()
    const walls = wallCases()
    const litHash = judgeHashes(LIT_SWITCH)
    const expandHash = judgeHashes(EXPAND_SWITCH)
    const expected = new Map<string, Expected>()

    for (const [id, wall] of walls) {
      expected.set(id, recompute(wall, litHash, expandHash))
    }

    const graded: Graded[] = family.instances.map(instance => {
      const grade = instance.gradeRecipe(SWITCH)

      return { instance, grade, report: readReport(grade.solverId) }
    })
    const baseline = new Map(family.instances.map(instance => {
      const grade = instance.gradeRecipe(WAVE)

      return [instance.id, { grade, report: readReport(grade.solverId) }] as const
    }))

    let violations = 0
    let falseClaims = 0
    let optimal = 0
    let longer = 0
    let missed = 0
    let behaviourDifferences = 0
    let judged = 0
    let judgeRejected = 0

    const totals: Record<string, number> = {}
    // item 0036 (audit 3, M1): the same sums over the judged wall instances only, where credit rests on recomputation
    const judgedTotals: Record<string, number> = {}

    let currentJudged = false

    const add = (name: string, value: number): void => {
      totals[name] = (totals[name] ?? 0) + value

      if (currentJudged) {
        judgedTotals[name] = (judgedTotals[name] ?? 0) + value
      }
    }

    for (const { instance, grade, report } of graded) {
      currentJudged = expected.has(instance.id)

      const switches = switchesOf(report)
      const old = baseline.get(instance.id)!
      const reference = referenceOf(instance.grade('breadthFirst'))

      if (grade.violations.length > 0) {
        violations++
        fail(`${instance.id}: ${grade.violations[0]}`)
      }

      if (grade.claimedSolved && !grade.solved) {
        falseClaims++
      }

      if (report === null || switches === null || old.report === null) {
        fail(`${instance.id}: no readable report`)
        continue
      }

      if (JSON.stringify(switches.claims) !== JSON.stringify(SWITCH_CLAIMS)) {
        fail(`${instance.id}: claims ${JSON.stringify(switches.claims)}`)
      }

      // the same search: every observable of the run equals meshWave's
      const same =
        grade.solved === old.grade.solved &&
        grade.cost === old.grade.cost &&
        grade.expansions === old.grade.expansions &&
        grade.operatorCalls === old.grade.operatorCalls &&
        (['outcome', 'stopStep', 'states', 'litDigest', 'arrivalDigest', 'fieldDigest', 'litTests', 'expandGates', 'registerWrites', 'registerPairUpdates', 'waveArcReads'] as const).every(
          field => report[field] === old.report![field],
        )

      if (!same) {
        behaviourDifferences++
        fail(`${instance.id}: meshSwitch differs from meshWave`)
      }

      if (report.registerCorruptions !== 0) {
        fail(`${instance.id}: ${report.registerCorruptions} register corruptions`)
      }

      if (switches.litRuns !== report.litTests || switches.expandRuns !== report.expandGates) {
        fail(`${instance.id}: runs ${switches.litRuns}/${switches.expandRuns} against decisions ${report.litTests}/${report.expandGates}`)
      }

      if (switches.litPairUpdates !== switches.litRuns * litCertificate.pairUpdates || switches.expandPairUpdates !== switches.expandRuns * expandCertificate.pairUpdates) {
        fail(`${instance.id}: pair updates are not runs times the layout's constant`)
      }

      // decision 003: every decision ran in the evaluator, on the certified layouts, and the report is the meter's
      const metered = meteredOf(grade.mesh)

      if (
        metered.other > 0 ||
        metered.litRuns !== report.litTests ||
        metered.expandRuns !== report.expandGates ||
        (metered.lit !== null && (metered.lit.rounds !== metered.lit.runs * LIT_SWITCH.readRound || metered.lit.pairUpdates !== metered.lit.runs * litCertificate.pairUpdates)) ||
        (metered.expand !== null && (metered.expand.rounds !== metered.expand.runs * EXPAND_SWITCH.readRound || metered.expand.pairUpdates !== metered.expand.runs * expandCertificate.pairUpdates)) ||
        switches.litFrameDigest !== (metered.lit?.frameDigest ?? 0) ||
        switches.expandFrameDigest !== (metered.expand?.frameDigest ?? 0) ||
        switches.litPairUpdates !== (metered.lit?.pairUpdates ?? 0) ||
        switches.expandPairUpdates !== (metered.expand?.pairUpdates ?? 0)
      ) {
        fail(`${instance.id}: the evaluator's mesh meter disagrees (${JSON.stringify({ lit: metered.litRuns, expand: metered.expandRuns, other: metered.other })})`)
      }

      add('meteredLitRuns', metered.litRuns)
      add('meteredExpandRuns', metered.expandRuns)
      add('meteredRounds', (metered.lit?.rounds ?? 0) + (metered.expand?.rounds ?? 0))
      add('meteredPairUpdates', (metered.lit?.pairUpdates ?? 0) + (metered.expand?.pairUpdates ?? 0))

      if (old.grade.mesh.layouts.length > 0) {
        fail(`${instance.id}: meshWave (decisions in candidate code) shows metered mesh runs`)
      }

      if (grade.solved && reference.cost !== null) {
        if (grade.cost! < reference.cost) {
          fail(`${instance.id}: cost ${grade.cost} below BFS ${reference.cost}`)
        }

        if (grade.cost === reference.cost) {
          optimal++
        } else {
          longer++
        }
      } else if (reference.solvable === true) {
        missed++
      }

      if (reference.solvable === false && grade.solved) {
        fail(`${instance.id}: solved where BFS proves no solution`)
      }

      for (const name of ['waveArcReads', 'waveCellUpdates', 'registerPairUpdates', 'litTests', 'expandGates', 'registerWrites', 'stopTests', 'readbackComparisons'] as const) {
        add(name, report[name])
      }

      add('litPairUpdates', switches.litPairUpdates)
      add('expandPairUpdates', switches.expandPairUpdates)

      // the knockout reading of the two step components (item 0030)
      const knock = report.knockout

      if (knock === undefined || !Number.isInteger(knock.waveChangedValues) || !Number.isInteger(knock.registerChangedPairs)) {
        fail(`${instance.id}: no knockout reading in the report`)
      } else {
        add('waveKnockoutChangedValues', knock.waveChangedValues)
        add('registerKnockoutChangedPairs', knock.registerChangedPairs)
      }

      // reads the switch knockouts change on this solve: a lit run changes exactly when x is non-zero (the runs that
      // pass to the expand gate, metered), an expand run exactly when it reads +1 (a newly lit node, one write each)
      add('litKnockoutChangedRuns', metered.expandRuns)
      add('expandKnockoutChangedRuns', report.outcome === 'initialGoal' ? 0 : report.registerWrites)

      // S4: the judge on wall instances
      const want = expected.get(instance.id)

      if (want !== undefined) {
        judged++

        const wrong = switchMismatches(report, grade.mesh, want)

        if (wrong.length > 0) {
          judgeRejected++
          fail(`${instance.id}: judge ${wrong.join(', ')}`)
        }
      }
    }

    if (judged !== walls.size) {
      fail(`judged ${judged} of ${walls.size} wall instances`)
    }

    if (falseClaims > 0) {
      fail(`${falseClaims} false solve claims`)
    }

    // S5: the controls, on every judged wall instance
    for (const [name, recipe] of CONTROL_RECIPES) {
      let tried = 0
      let clean = 0
      let rejected = 0

      for (const { instance } of graded) {
        const want = expected.get(instance.id)

        if (want === undefined) {
          continue
        }

        tried++

        const grade = instance.gradeRecipe(recipe)

        if (grade.violations.length === 0 && !(grade.claimedSolved && !grade.solved)) {
          clean++
        }

        if (switchMismatches(readReport(grade.solverId), grade.mesh, want).length > 0) {
          rejected++
        }
      }

      control[`${name}Tried`] = tried
      control[`${name}EvaluatorClean`] = clean
      control[`${name}JudgeRejected`] = rejected

      if (rejected === 0) {
        fail(`control ${name}: the judge never rejected it`)
      }

      if (name === 'lookupSwitch' && rejected !== tried) {
        fail(`control ${name}: rejected on ${rejected} of ${tried} wall instances, not every one`)
      }

      if (clean !== tried) {
        fail(`control ${name}: the evaluator flagged ${tried - clean} of ${tried}, so it does not isolate the judge`)
      }
    }

    // S5, the lookup control on every instance (decision 003): its report is the honest solver's field for field, so no
    // judge of the report alone can reject it; the evaluator's meter shows no run, so its decisions are external
    {
      const lookup = CONTROL_RECIPES.find(([name]) => name === 'lookupSwitch')![1]

      let reportIdentical = 0
      let external = 0
      let clean = 0

      for (const { instance, grade: honest } of graded) {
        const grade = instance.gradeRecipe(lookup)
        const metered = meteredOf(grade.mesh)

        if (grade.violations.length === 0 && !(grade.claimedSolved && !grade.solved)) {
          clean++
        }

        if (grade.solverId === honest.solverId && grade.cost === honest.cost && grade.expansions === honest.expansions && grade.operatorCalls === honest.operatorCalls) {
          reportIdentical++
        }

        if (metered.litRuns + metered.expandRuns === 0 && grade.mesh.layouts.length === 0) {
          external++
        }
      }

      control.lookupSwitchInstances = graded.length
      control.lookupSwitchEvaluatorCleanAll = clean
      control.lookupSwitchReportIdentical = reportIdentical
      control.lookupSwitchClassifiedExternal = external

      if (reportIdentical !== graded.length) {
        fail(`control lookupSwitch: its report equals the honest one on ${reportIdentical} of ${graded.length}, so it is not the strong control`)
      }

      if (external !== graded.length) {
        fail(`control lookupSwitch: classified external on ${external} of ${graded.length}`)
      }

      if (clean !== graded.length) {
        fail(`control lookupSwitch: the evaluator flagged ${graded.length - clean} of ${graded.length}`)
      }
    }

    // S7: determinism and the source scan
    const again = navigationFamily(['line', '{3,6}']).instances.map(instance => {
      const grade = instance.gradeRecipe(SWITCH)

      return { instance, grade, report: readReport(grade.solverId) }
    })
    const againIds = new Set(again.map(entry => entry.instance.id))
    const deterministic = againIds.size > 0 && digest(again) === digest(graded.filter(entry => againIds.has(entry.instance.id)))

    if (!deterministic) {
      fail('a second grading gave different ids or numbers')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/mesh-switches.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // the provenance table, slice 1 against slice 2, one count per operation as slice 1 counts. The rule (item 0030,
    // fixed before the run): a component counts as mesh-realized only if knocking out its rounds changes some read. The
    // wave and both switches pass; the M4 register's knockout changes nothing (its round is the identity at spacing 2),
    // so its pair updates are mesh storage with an identity round, counted in the whole but not credited.
    if ((totals.waveKnockoutChangedValues ?? 0) === 0) {
      fail('the wave knockout changed no read')
    }

    if ((totals.registerKnockoutChangedPairs ?? 0) !== 0) {
      fail(`the register knockout changed ${totals.registerKnockoutChangedPairs} pairs: the register rounds are not the identity`)
    }

    const wave = totals.waveArcReads! + totals.waveCellUpdates!
    const identityStorage = totals.registerPairUpdates!
    const lit = totals.litTests!
    const expand = totals.expandGates!
    // decision 003: a decision is mesh-realized only when the evaluator ran it; the rest are external though routed
    const meteredLit = totals.meteredLitRuns ?? 0
    const meteredExpand = totals.meteredExpandRuns ?? 0
    const unmetered = lit - meteredLit + (expand - meteredExpand)

    if (unmetered !== 0) {
      fail(`${unmetered} switch decisions the evaluator never ran`)
    }

    const writes = totals.registerWrites!
    const stopAndRead = totals.stopTests! + totals.readbackComparisons!
    const all = wave + identityStorage + lit + expand + writes + stopAndRead
    const share = (part: number, whole = all): string => (part / whole).toFixed(4)
    // the same table with each switch run counted at its pair updates instead of 1
    const weightedAll = wave + identityStorage + totals.litPairUpdates! + totals.expandPairUpdates! + writes + stopAndRead
    // item 0036: the credited shares over the judged wall solves only (the judge recomputes the wave and every metered
    // run there); over all solves the wave part is the candidate's report on the directed kinds
    const j = (name: string): number => judgedTotals[name] ?? 0
    const judgedWave = j('waveArcReads') + j('waveCellUpdates')
    const judgedSwitches = j('meteredLitRuns') + j('meteredExpandRuns')
    const judgedAll = judgedWave + j('registerPairUpdates') + j('litTests') + j('expandGates') + j('registerWrites') + j('stopTests') + j('readbackComparisons')
    const judgedWeightedAll = judgedWave + j('registerPairUpdates') + j('litPairUpdates') + j('expandPairUpdates') + j('registerWrites') + j('stopTests') + j('readbackComparisons')
    const judgedShare = (part: number, whole = judgedAll): string => (part / whole).toFixed(4)

    for (const [name, value] of Object.entries(totals)) {
      metrics[name] = value
    }

    metrics.instances = graded.length
    metrics.violations = violations
    metrics.falseClaims = falseClaims
    metrics.optimal = optimal
    metrics.longer = longer
    metrics.missed = missed
    metrics.behaviourDifferences = behaviourDifferences
    metrics.judged = judged
    metrics.judgeRejected = judgeRejected
    metrics.litLayoutWidth = LIT_SWITCH.window.length
    metrics.litLayoutConstants = LIT_SWITCH.window.filter((tone, i) => tone !== 0 && !LIT_SWITCH.inputs.includes(i)).length
    metrics.litLayoutRounds = LIT_SWITCH.readRound
    metrics.litPairUpdatesPerRun = litCertificate.pairUpdates
    metrics.expandLayoutWidth = EXPAND_SWITCH.window.length
    metrics.expandLayoutConstants = EXPAND_SWITCH.window.filter((tone, i) => tone !== 0 && !EXPAND_SWITCH.inputs.includes(i)).length
    metrics.expandLayoutRounds = EXPAND_SWITCH.readRound
    metrics.expandPairUpdatesPerRun = expandCertificate.pairUpdates
    metrics.certifiedInputs = litCertificate.inputs + expandCertificate.inputs
    metrics.blindCells = blindCells
    metrics.blindCellsTransportedLive = liveTransported
    metrics.litKnockoutChangedWords = litKnockout.changed
    metrics.litKnockoutWords = litKnockout.words
    metrics.expandKnockoutChangedWords = expandKnockout.changed
    metrics.expandKnockoutWords = expandKnockout.words
    metrics.identityStorageShare = Number(share(identityStorage))
    metrics.oldMeshShare = Number(share(wave))
    metrics.oldRoutedExternalShare = Number(share(lit + expand + writes))
    metrics.oldNoGoExternalShare = Number(share(stopAndRead))
    // item 0036: the credited share is the judged one; the all-solve one is candidate-reported on the directed kinds
    metrics.newMeshShare = Number(judgedShare(judgedWave + judgedSwitches))
    metrics.newMeshShareWeighted = Number(judgedShare(judgedWave + j('meteredPairUpdates'), judgedWeightedAll))
    metrics.judgedOldMeshShare = Number(judgedShare(judgedWave))
    metrics.judgedIdentityStorageShare = Number(judgedShare(j('registerPairUpdates')))
    metrics.judgedSolves = judged
    metrics.allSolvesNewMeshShareCandidateReported = Number(share(wave + meteredLit + meteredExpand))
    metrics.allSolvesNewMeshShareWeightedCandidateReported = Number(share(wave + (totals.meteredPairUpdates ?? 0), weightedAll))
    metrics.newRoutedExternalShare = Number(share(unmetered))
    metrics.newNoGoExternalShare = Number(share(writes + stopAndRead))
    metrics.identityStorageShareWeighted = Number(share(identityStorage, weightedAll))
    // the shares as they read before the knockout rule, with the register credited as mesh
    metrics.formerOldMeshShare = Number(share(wave + identityStorage))
    metrics.formerNewMeshShare = Number(share(wave + identityStorage + meteredLit + meteredExpand))
    metrics.formerNewMeshShareWeighted = Number(share(wave + identityStorage + (totals.meteredPairUpdates ?? 0), weightedAll))
    metrics.deterministic = deterministic ? 1 : 0
    metrics.sourceFilesScanned = files.length

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 4, slice 2: the lit test |x| and the expand gate (signed: +1 expand, -1 not) of the level-4 solver run as M5 switch layouts of the occupancy-blind exchange ${EXCHANGE_RULE} on the line (widths ${LIT_SWITCH.window.length} and ${EXPAND_SWITCH.window.length}, ${metrics.litLayoutConstants} and ${metrics.expandLayoutConstants} constants, read at rounds ${LIT_SWITCH.readRound} and ${EXPAND_SWITCH.readRound}, certified cell for cell against lineBrickRun on every input), one run per decision; on all ${graded.length} family-A instances the solver is graded clean and its search is unchanged (${behaviourDifferences} differences from slice 1; ${optimal} of ${optimal + longer} solves optimal); every switch run is executed and metered by the evaluator (${meteredLit + meteredExpand} runs, ${unmetered} decisions unmetered), and a judge reading that meter recomputes the frames of every run on all ${judged} wall instances, rejecting a lookup-table solver whose report is the honest one's on every wall instance; counting a component as mesh-realized only if knocking out its rounds changes some read (the lit switch on ${litKnockout.changed} of ${litKnockout.words} words, the expand gate on ${expandKnockout.changed} of ${expandKnockout.words}, the wave on ${totals.waveKnockoutChangedValues ?? 0} node values; the M4 register on 0, so it is mesh storage with an identity round, ${share(identityStorage)}, not credited), the mesh-realized share of the solver's own operations on the ${judged} judged wall solves rises from ${judgedShare(judgedWave)} to ${judgedShare(judgedWave + judgedSwitches)} (over all ${graded.length} solves ${share(wave)} to ${share(wave + meteredLit + meteredExpand)}, the wave part candidate-reported on the directed kinds, where no judge recomputes it); the register write joins the stop test and read-back as external with a proof (the M6 no-feedback lemma: an occupancy-blind cell's occupancy at any round is one fixed start cell's, and a write needs x and g, or x or s), ${share(writes + stopAndRead)}; the 0/1 expand gate fails the same test`,
      metrics,
      control,
      notes: `L2. Layouts (swap.ABC.swap on the vacuum, the brick line, start parity 0; window tones left to right, x and s the inputs): lit test [x, +1], read at position ${LIT_SWITCH.readPosition} after ${LIT_SWITCH.readRound} round, ${litCertificate.pairUpdates} pair updates a run; expand gate [x, 0, +1, -1, -1, s, 0, -1], read at position ${EXPAND_SWITCH.readPosition} after ${EXPAND_SWITCH.readRound} rounds, ${expandCertificate.pairUpdates} pair updates a run, output riding left. Each output rides its wire ${HOLD} rounds past the read. Why the expand layout works: on the line the exchange keeps the movers' order (M6 G5), so the read cell holds the tone of the k-th occupied start cell, k one more than the number of free tracks left of it; x's track crosses the read cell and s's does not, so x present moves k on by one and s present moves the list on by one, and the constants (+1, -1, -1, -1) sit so that only x present with s empty brings the +1. Certificate: ${litCertificate.inputs + expandCertificate.inputs} inputs, frame differences ${litCertificate.frameDifferences + expandCertificate.frameDifferences}, table differences ${litCertificate.tableDifferences + expandCertificate.tableDifferences}; a flipped constant gives ${flippedCertificate.tableDifferences} wrong entries, the full swap ${fullSwapCertificate.tableDifferences}. Transport lemma: ${blindCells} occupancy-blind cells, each moving a lone tone alike in both pair orders (bijectivity forces it), so occupancy moves by one fixed permutation (identity or the full swap) whatever the tones; live on the line (every width-5 window, 6 rounds, both parities) ${liveTransported} of ${blindCells}, the reactive control ${reactiveTransported ? 'passed (wrong)' : 'failed'}. Decision tables: ${classified.join('; ')}. A probe (exhaustive line search to width 10, read to round 16, held 8) found the signed expand gate first at width 8 (48 of 40,824 layouts) and the 0/1 gate and both writes at no width, as the lemma says. Provenance, slice 1 (E-CMP-0056) against slice 2, every count summed over the ${graded.length} solves, one count per operation. The rule (fixed before the run): a component counts as mesh-realized only if knocking out its rounds (id.ABC.id, the identity, in place of every round) changes some read. Knockouts: the lit switch changes its read on ${litKnockout.changed} of ${litKnockout.words} words (${litKnockout.changedWords.join(' and ')}; ${totals.litKnockoutChangedRuns} of ${meteredLit} runs on the solves), the expand gate on ${expandKnockout.changed} of ${expandKnockout.words} (${expandKnockout.changedWords.join(' and ')}; ${totals.expandKnockoutChangedRuns} of ${meteredExpand} runs), the wave on ${totals.waveKnockoutChangedValues} node values, the M4 register on ${totals.registerKnockoutChangedPairs} pairs of ${totals.registerPairUpdates} pair updates (at spacing 2 its round is the identity). So mesh computation ${share(wave)} -> ${share(wave + lit + expand)} (wave ${totals.waveArcReads} arc reads and ${totals.waveCellUpdates} node updates, now also ${lit} lit runs and ${expand} expand runs); mesh storage with an identity round, not credited, ${share(identityStorage)} in both (register ${totals.registerPairUpdates} pair updates; before this rule it was credited, and the mesh share read ${share(wave + identityStorage)} -> ${share(wave + identityStorage + lit + expand)}); external but routed ${share(lit + expand + writes)} -> 0; external with a proof ${share(stopAndRead)} -> ${share(writes + stopAndRead)} (register writes ${writes}: the M4 write port, and no blind layout can make the slot's occupancy x and g; stop tests and read-back comparisons ${stopAndRead}: not occupancy-routed). With each run counted at its pair updates (${totals.litPairUpdates} lit, ${totals.expandPairUpdates} expand) the mesh share is ${share(wave + totals.litPairUpdates! + totals.expandPairUpdates!, weightedAll)} (identity-round storage ${share(identityStorage, weightedAll)}; ${share(wave + identityStorage + totals.litPairUpdates! + totals.expandPairUpdates!, weightedAll)} with the register credited). Credit (item 0036, audit 3 M1): the shares above are over all solves; the credited ones rest on the ${judged} judged wall solves, where the judge recomputes the wave and every metered run: mesh computation ${judgedShare(judgedWave)} -> ${judgedShare(judgedWave + judgedSwitches)}, ${judgedShare(judgedWave + j('meteredPairUpdates'), judgedWeightedAll)} weighted, identity-round storage ${judgedShare(j('registerPairUpdates'))}. The added structure is the layout (programmer_layout): ${metrics.litLayoutConstants + metrics.expandLayoutConstants} constants per node per step and the read cells and rounds; each decision's garbage (the other cells of the final frame) is dropped. Controls (the judged wall instances): formulaDecisions clean by the evaluator ${control.formulaDecisionsEvaluatorClean} of ${control.formulaDecisionsTried}, judge rejected ${control.formulaDecisionsJudgeRejected}; extraConstantSwitch clean ${control.extraConstantSwitchEvaluatorClean}, rejected ${control.extraConstantSwitchJudgeRejected} of ${control.extraConstantSwitchTried}; lookupSwitch (each layout run once per input word in candidate code, 3 lit and 9 expand words, every decision looked up) clean ${control.lookupSwitchEvaluatorClean}, rejected ${control.lookupSwitchJudgeRejected} of ${control.lookupSwitchTried}, its report identical to meshSwitch's on ${control.lookupSwitchReportIdentical} of ${control.lookupSwitchInstances} instances and classified external (no metered run) on ${control.lookupSwitchClassifiedExternal} of ${control.lookupSwitchInstances}. Metered mesh rounds (decision 003: the evaluator executes every switch round, rule by name, layout as data, and the judge reads its meter): ${meteredLit} lit and ${meteredExpand} expand runs, ${totals.meteredRounds} rounds, ${totals.meteredPairUpdates} pair updates, ${unmetered} decisions unmetered. Limits: the layouts sit on the line beside the configuration graph, one per node per step, not inside the wave's own mesh, and their inputs are written and their outputs read by candidate code (ports, as M4's); the meter proves the evaluator ran each decision's layout, not that the candidate's branch read its answer (one that ran it and decided by its own table would pay every round and decide alike); the wave step and the M4 register round stay candidate code (the wave's field is recomputed whole by the judge; the register at spacing 2 is the identity, so it is not credited as mesh); the directed kinds are checked for consistency (runs equal decisions, pair updates) and against slice 1, not recomputed. ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
