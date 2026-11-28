// Intelligence level 7, slice 1 (item vibe-computation-intelligence-0009, level7.md of vibe/computation/intelligence):
// does a problem-solving component develop from a primitive start? A primitive start (a window of at most three tones on
// a quiet rule-background cell of the line) is run forward; the frame after T rounds is a device that a fixed A*
// template reads, one metered run per generated successor, to break ties from the word [t, d] (t: the learned table
// holds the successor; d: the sign of the base estimate's change). Three parts, every criterion fixed in level7.md
// before the first run.
//
// Part R (judge side, exact): the capacity of all 64 preference functions of the word, ranked on the training starts,
// reported on the held-out starts (the ceiling of every device, developed or placed: D4).
// Part C (judge side, the line): every development of every primitive start on the 56 quiet cells to 6 rounds, the
// functions each developed device and its undeveloped start realize, the growth and bijection theorems (D1, D2), and the
// identity census (D3: the identity device realizes exactly the functions of one input).
// Part L (isolated candidates, the outside evaluator, every round metered): the selected developed device against the
// same start undeveloped, the identity knockout, the best wire and level-1 A*, with a smuggler and a misdeveloped
// control, every honest solve recomputed by the judge (development reads, device window, decisions, SHA-256 chains,
// background).
//
// Algebra: spin-1 tones. Regime: pure. Exact integers, no random numbers.

import { resolve } from 'node:path'
import { splitCell, type CellKind, type SpeciesType } from '@/code/compute/lab/counter'
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
import {
  developmentLayout,
  deviceLayout,
  PREFERENCE_SPREAD,
  undevelopedWindow,
  wordIndex,
  type DevelopArgs,
  type DevelopLayout,
  type DevelopMode,
} from '@/code/intelligence/solver/develop/develop-router'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { NO_PREPROCESSING } from '@/code/intelligence/solver/solver'
import { PriorityQueue } from '@/code/intelligence/solver/search/priority-queue'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const ARM_MODULE = 'code/intelligence/solver/develop/develop-catalog'
const IDENTITY_RULE = 'id.ABC.id'

// ---------------------------------------------------------------- parameters (level7.md, fixed before the first run)

const START_WIDTH = 3
const T_DEV = 6
const SPAN_MAX = 10
const R_READ = 6
const PAD = 1

/** the 6 nonempty proper tone sets, as bit masks over tone + 1 */
const TONE_SETS = [1, 2, 4, 3, 5, 6] as const
const toneSet = (mask: number): number[] => [-1, 0, 1].filter(t => ((mask >> (t + 1)) & 1) === 1)

/** the 6 words [t, d], in mask order: index (d + 1) * 2 + t */
const WORDS: readonly (readonly [number, number])[] = Array.from({ length: 6 }, (_, w) => [w & 1, (w >> 1) - 1] as const)
const FUNCTIONS = 64

/** whether g depends on at most one input (the set F1) */
function oneInput(g: number): boolean {
  const bit = (t: number, d: number): number => (g >> wordIndex(t, d)) & 1
  const noT = [-1, 0, 1].every(d => bit(0, d) === bit(1, d))
  const noD = [0, 1].every(t => bit(t, -1) === bit(t, 0) && bit(t, 0) === bit(t, 1))

  return noT || noD
}

const F1 = Array.from({ length: FUNCTIONS }, (_, g) => g).filter(oneInput)

// ---------------------------------------------------------------- the cells

interface Cell {
  index: number
  name: string
  rule: GateRule
  background: number
  kind: CellKind
  type: SpeciesType | null
}

function allRules(): GateRule[] {
  return pairRulesFromFibers().map(r => gateRule(r.name, r.table))
}

function allCells(): Cell[] {
  const out: Cell[] = []

  for (const rule of allRules()) {
    for (const background of [-1, 0, 1]) {
      const split = splitCell(rule, background)

      out.push({ index: out.length, name: `${rule.name}/${background}`, rule, background, kind: split.kind, type: split.type })
    }
  }

  return out
}

/** every primitive start: width 1 to 3, both end cells off the background, tones in lexicographic order */
function primitiveStarts(background: number): number[][] {
  const out: number[][] = []

  for (let width = 1; width <= START_WIDTH; width++) {
    for (let code = 0; code < 3 ** width; code++) {
      const tones = Array.from({ length: width }, (_, i) => (Math.floor(code / 3 ** (width - 1 - i)) % 3) - 1)

      if (tones[0] !== background && tones[width - 1] !== background) {
        out.push(tones)
      }
    }
  }

  return out
}

const startPositionOf = (parity: number): number => 2 * T_DEV + 2 + parity

// ---------------------------------------------------------------- Part C: the realized functions of one window

interface Placement {
  inputs: [number, number]
  readRound: number
  readPosition: number
  prefer: number[]
}

/** the first placement (fixed order) realizing each function, for a window at absolute cell `lo` */
function realized(rule: GateRule, background: number, lo: number, window: readonly number[], counter: { runs: number }): Map<number, Placement> {
  const out = new Map<number, Placement>()
  const reads = new Int8Array(6)

  for (let i = 0; i < window.length; i++) {
    for (let j = 0; j < window.length; j++) {
      if (i === j) {
        continue
      }

      const runs = WORDS.map(([t, d]) => {
        const w = window.slice()

        w[i] = t
        w[j] = d
        counter.runs++

        return lineBrickRun({ rule, background, start: lo, window: w, rounds: R_READ })
      })
      const pad = runs[0]!.pad

      for (let round = 1; round <= R_READ; round++) {
        for (let p = lo - 2 * round; p <= lo + window.length - 1 + 2 * round; p++) {
          for (let w = 0; w < 6; w++) {
            reads[w] = runs[w]!.frames[round]![p + pad]!
          }

          for (const set of TONE_SETS) {
            let g = 0

            for (let w = 0; w < 6; w++) {
              if (((set >> (reads[w]! + 1)) & 1) === 1) {
                g |= 1 << w
              }
            }

            if (!out.has(g)) {
              out.set(g, { inputs: [i, j], readRound: round, readPosition: p, prefer: toneSet(set) })
            }
          }
        }
      }
    }
  }

  return out
}

interface Development {
  cell: Cell
  start: number[]
  parity: number
  rounds: number
  spanLo: number
  developed: number[]
  undeveloped: number[]
}

interface CellCensus {
  name: string
  kind: CellKind
  type: SpeciesType | null
  starts: number
  developments: number
  probed: number
  tooWide: number
  grown: number
  growthBreaks: number
  collisions: number
  distinctDevices: number
  runs: number
  developedFunctions: number[]
  undevelopedFunctions: number[]
  /** functions outside F1 some developed device realizes and no undeveloped start of this cell does */
  onlyDeveloped: number[]
  digest: string
}

interface Census {
  cells: CellCensus[]
  developments: Development[]
  /** per window key (cell, parity, window), the first placement of every function */
  windows: Map<string, Map<number, Placement>>
  identity: Set<number>
  identityRuns: number
}

const windowKey = (cell: Cell, lo: number, window: readonly number[]): string => `${cell.index}|${lo & 1}|${window.join(',')}`

function census(cells: readonly Cell[]): Census {
  const identityRule = allRules().find(r => r.name === IDENTITY_RULE)!
  const windows = new Map<string, Map<number, Placement>>()
  const identityWindows = new Set<string>()
  const identity = new Set<number>()
  const developments: Development[] = []
  const out: CellCensus[] = []
  const identityCounter = { runs: 0 }

  for (const cell of cells) {
    const b = cell.background
    const counter = { runs: 0 }
    const starts = primitiveStarts(b)
    const seen = new Map<string, string>()
    const developed = new Set<number>()
    const undeveloped = new Set<number>()
    const devices = new Set<string>()
    const row: CellCensus = {
      name: cell.name,
      kind: cell.kind,
      type: cell.type,
      starts: starts.length * 2,
      developments: 0,
      probed: 0,
      tooWide: 0,
      grown: 0,
      growthBreaks: 0,
      collisions: 0,
      distinctDevices: 0,
      runs: 0,
      developedFunctions: [],
      undevelopedFunctions: [],
      onlyDeveloped: [],
      digest: '',
    }
    const digestParts: string[] = []

    for (const start of starts) {
      for (const parity of [0, 1]) {
        const s0 = startPositionOf(parity)
        const run = lineBrickRun({ rule: cell.rule, background: b, start: s0, window: start, rounds: T_DEV })
        const pad = run.pad
        const n0 = start.filter(t => t !== b).length
        const charge = Math.abs(start.reduce((sum, t) => sum + (t - b), 0))

        for (let rounds = 1; rounds <= T_DEV; rounds++) {
          const frame = run.frames[rounds]!
          const live: number[] = []
          const parts: string[] = []

          for (let i = 0; i < frame.length; i++) {
            if (frame[i] !== b) {
              live.push(i - pad)
              parts.push(`${i - pad}:${frame[i]}`)
            }
          }

          row.developments++

          // D1
          if (live.length > n0) {
            row.grown++
          }

          if ((cell.kind === 'species' && live.length !== n0) || (cell.kind === 'reactive' && (live.length > charge || charge > 2 * n0))) {
            row.growthBreaks++
          }

          // D2
          const key = `${rounds}|${parts.join(' ')}`
          const owner = `${start.join(',')}@${parity}`
          const known = seen.get(key)

          if (known !== undefined && known !== owner) {
            row.collisions++
          }

          seen.set(key, owner)

          if (cell.kind === 'live_vacuum' || live.length === 0) {
            continue
          }

          const lo = Math.min(live[0]!, s0) - PAD
          const hi = Math.max(live[live.length - 1]!, s0 + start.length - 1) + PAD

          if (hi - lo + 1 > SPAN_MAX) {
            row.tooWide++
            continue
          }

          const dev: number[] = []
          const und: number[] = []

          for (let x = lo; x <= hi; x++) {
            dev.push(frame[x + pad]!)
            und.push(x >= s0 && x < s0 + start.length ? start[x - s0]! : b)
          }

          row.probed++
          developments.push({ cell, start, parity, rounds, spanLo: lo, developed: dev, undeveloped: und })

          for (const window of [dev, und]) {
            const wk = windowKey(cell, lo, window)

            devices.add(wk)

            if (!windows.has(wk)) {
              windows.set(wk, realized(cell.rule, b, lo, window, counter))
            }

            const ik = `${lo & 1}|${window.join(',')}|${b}`

            if (!identityWindows.has(ik)) {
              identityWindows.add(ik)

              for (const g of realized(identityRule, b, lo, window, identityCounter).keys()) {
                identity.add(g)
              }
            }
          }

          const gd = windows.get(windowKey(cell, lo, dev))!
          const gu = windows.get(windowKey(cell, lo, und))!

          gd.forEach((_, g) => developed.add(g))
          gu.forEach((_, g) => undeveloped.add(g))
          digestParts.push(`${owner}/${rounds}:${[...gd.keys()].sort((a, c) => a - c).join('.')}`)
        }
      }
    }

    row.distinctDevices = devices.size
    row.runs = counter.runs
    row.developedFunctions = [...developed].sort((a, c) => a - c)
    row.undevelopedFunctions = [...undeveloped].sort((a, c) => a - c)
    row.onlyDeveloped = row.developedFunctions.filter(g => !undeveloped.has(g) && !oneInput(g))
    row.digest = digestParts.join(';')
    out.push(row)
  }

  return { cells: out, developments, windows, identity, identityRuns: identityCounter.runs }
}

// ---------------------------------------------------------------- the judge's search (one template for every function)

interface GraphNode {
  state: MeshState
  h: number
  next: { key: string; cost: number }[] | null
}

/** the environment's configuration graph, memoized by canonical key (the judge applies the operators itself) */
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

/** a device as the judge recomputes it: per word index, the read and the final frame hash */
interface JudgeDevice {
  rule: string
  layout: DevelopLayout
  values: number[]
  hashes: number[]
  prefer: Set<number>
}

interface JudgeSearch {
  pathKeys: string[]
  expanded: number
  runs: number
  digest: number
}

/** A* with the preference bit from `g` (mask) or from a recomputed device; the chain folded when a device is given. */
function judgeAStar(graph: Graph, problem: Problem<MeshState>, table: ReadonlyMap<string, number>, g: number, device: JudgeDevice | null): JudgeSearch {
  const best = new Map<string, number>()
  const parent = new Map<string, string | null>()
  const closed = new Set<string>()
  const expandedKeys = new Set<string>()
  const open = new PriorityQueue<string>()
  const out: JudgeSearch = { pathKeys: [], expanded: 0, runs: 0, digest: 0 }
  const chain = device === null ? null : meshChain(device.rule, device.layout)
  const initialKey = problem.key(problem.initial)
  const root = graph.node(initialKey, problem.initial)

  let expansions = 0

  best.set(initialKey, 0)
  parent.set(initialKey, null)
  open.push(root.h, PREFERENCE_SPREAD + root.h, initialKey)

  while (open.size > 0) {
    const entry = open.pop()!
    const key = entry.value
    const gKey = best.get(key)!

    if (entry.primary - (entry.secondary % PREFERENCE_SPREAD) !== gKey || closed.has(key)) {
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
    const runs: MeshDigestRun[] = []

    for (const next of batch) {
      const t = table.has(next.key) ? 1 : 0
      const d = Math.sign(graph.nodes.get(next.key)!.h - node.h)
      const w = wordIndex(t, d)

      if (device === null) {
        preferred.push(((g >> w) & 1) === 1)
      } else {
        preferred.push(device.prefer.has(device.values[w]!))
        runs.push({ keyHash: meshKeyHash(next.key), word: [t, d], frameHash: device.hashes[w]!, value: device.values[w]! })
        out.runs++
      }
    }

    if (chain !== null && runs.length > 0) {
      out.digest = chain.fold(expansions, runs)
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

      open.push(nextG + h, (preferred[i] ? 0 : PREFERENCE_SPREAD) + h, next.key)
    })
  }

  out.expanded = expandedKeys.size

  return out
}

// ---------------------------------------------------------------- the judge's mesh runs

const ruleTables = new Map(allRules().map(r => [r.name, r]))

function judgeRun(rule: string, layout: DevelopLayout, word: readonly number[]): { value: number; frameHash: number } {
  const gate = ruleTables.get(rule)

  if (gate === undefined) {
    throw new Error(`develop: no rule ${rule}`)
  }

  const window = layout.window.slice()

  layout.inputs.forEach((offset, j) => {
    window[offset] = word[j]!
  })

  const run = lineBrickRun({ rule: gate, background: layout.background, start: layout.start, window, rounds: layout.readRound })
  const frame = run.frames[layout.readRound]!

  return { value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length) }
}

interface ExpectedEntry {
  rule: string
  layout: DevelopLayout
  runs: number
  rounds: number
  digest: number
}

/** The honest arm's development, recomputed: one entry per span cell, and the device window from the recomputed reads. */
function judgeDevelopment(args: DevelopArgs, initialKey: string): { entries: ExpectedEntry[]; window: number[] } {
  if (args.rounds === 0) {
    return { entries: [], window: undevelopedWindow(args) }
  }

  const entries: ExpectedEntry[] = []
  const window: number[] = []

  for (let k = 0; k < args.spanWidth; k++) {
    const layout = developmentLayout(args, args.spanLo + k)
    const run = judgeRun(args.rule, layout, [args.background])
    const chain = meshChain(args.rule, layout)

    entries.push({
      rule: args.rule,
      layout,
      runs: 1,
      rounds: args.rounds,
      digest: chain.fold(0, [{ keyHash: meshKeyHash(initialKey), word: [args.background], frameHash: run.frameHash, value: run.value }]),
    })
    window.push(run.value)
  }

  return { entries, window }
}

function judgeDevice(args: DevelopArgs, window: readonly number[]): JudgeDevice {
  const layout = deviceLayout(args, window)
  const runs = WORDS.map(word => judgeRun(args.rule, layout, word))

  return { rule: args.rule, layout, values: runs.map(r => r.value), hashes: runs.map(r => r.frameHash), prefer: new Set(args.prefer) }
}

const sameLayout = (a: DevelopLayout, c: { start: number; window: readonly number[]; inputs: readonly number[]; readPosition: number; readRound: number; background?: number }): boolean =>
  a.start === c.start &&
  a.readPosition === c.readPosition &&
  a.readRound === c.readRound &&
  a.background === c.background &&
  a.window.join(',') === Array.from(c.window).join(',') &&
  a.inputs.join(',') === Array.from(c.inputs).join(',')

/** '' when the grade is certified against the claimed arm, recomputed from the instance; the reason otherwise. */
function certify(args: DevelopArgs, grade: Grade<MeshState>, problem: Problem<MeshState>, graph: Graph, table: ReadonlyMap<string, number>): string {
  const initialKey = problem.key(problem.initial)
  const development = judgeDevelopment(args, initialKey)
  const device = judgeDevice(args, development.window)
  const search = judgeAStar(graph, problem, table, 0, device)
  const pathKeys = grade.solution.states.map(state => problem.key(state))

  if (pathKeys.join('|') !== search.pathKeys.join('|')) {
    return 'the path differs from the recomputed search'
  }

  if (grade.measured.expansions !== search.expanded) {
    return `measured expansions ${grade.measured.expansions}, recomputed ${search.expanded}`
  }

  const expected = [...development.entries]

  if (search.runs > 0) {
    expected.push({ rule: args.rule, layout: device.layout, runs: search.runs, rounds: search.runs * args.readRound, digest: search.digest })
  }

  const metered = grade.mesh.layouts

  if (metered.length !== expected.length) {
    return `${metered.length} metered layouts, ${expected.length} expected`
  }

  for (let i = 0; i < expected.length; i++) {
    const want = expected[i]!
    const got = metered[i]!

    // the background, checked on the entry itself (audit 3, m1); it is also bound into the chain's seed
    if (got.layout.background !== args.background) {
      return `entry ${i} metered on background ${String(got.layout.background)}, the cell's is ${args.background}`
    }

    if (got.rule !== want.rule || !sameLayout(want.layout, got.layout)) {
      return `entry ${i}: rule or layout differs from the recomputed ${i < development.entries.length ? 'development' : 'device'}`
    }

    if (got.runs !== want.runs || got.rounds !== want.rounds || got.frameDigest !== want.digest) {
      return `entry ${i}: metered runs ${got.runs}, rounds ${got.rounds}, digest ${got.frameDigest}; recomputed ${want.runs}, ${want.rounds}, ${want.digest}`
    }
  }

  return ''
}

// ---------------------------------------------------------------- the arms

// 'shifted' and 'shiftedMisdeveloped' were added after the first run (disclosed in level7.md): the selected development
// left its window unchanged, so the misdeveloped control could not fail; these run the first development realizing
// g_dev whose window the rounds do change, and its misdeveloped twin.
type Arm = 'developed' | 'undeveloped' | 'knockout' | 'wire' | 'smuggler' | 'misdeveloped' | 'shifted' | 'shiftedMisdeveloped'

const ARMS: readonly Arm[] = ['developed', 'undeveloped', 'knockout', 'wire', 'smuggler', 'misdeveloped', 'shifted', 'shiftedMisdeveloped']
const HONEST: readonly Arm[] = ['developed', 'undeveloped', 'knockout', 'wire', 'shifted']

type Base = Omit<DevelopArgs, 'preprocessing'>

interface Selection {
  gDev: number
  gDevOutsideF1: boolean
  gWire: number
  development: Development
  placement: Placement
  /** whether the undeveloped window of the same development realizes g_dev with some placement */
  undevelopedRealizes: boolean
  arms: Record<Arm, Base>
}

function armsFor(gDev: number, gWire: number, dev: Development, placement: Placement): Record<Exclude<Arm, 'shifted' | 'shiftedMisdeveloped'>, Base> {
  const developed: Base = {
    id: 'develop-router',
    rule: dev.cell.rule.name,
    background: dev.cell.background,
    start: dev.start,
    startPosition: startPositionOf(dev.parity),
    rounds: dev.rounds,
    spanLo: dev.spanLo,
    spanWidth: dev.developed.length,
    inputs: placement.inputs,
    readPosition: placement.readPosition,
    readRound: placement.readRound,
    prefer: placement.prefer,
    mode: 'mesh' as DevelopMode,
    mask: gDev,
  }
  const wireSets: number[] = []

  // the wire: the identity device [b, b] at cell 2, t at offset 0, d at offset 1, reading the input g_wire depends on
  const noT = [-1, 0, 1].every(d => ((gWire >> wordIndex(0, d)) & 1) === ((gWire >> wordIndex(1, d)) & 1))

  for (const tone of [-1, 0, 1]) {
    const w = noT ? wordIndex(0, tone) : wordIndex(tone === 1 ? 1 : 0, -1)

    if ((noT || tone !== -1) && ((gWire >> w) & 1) === 1) {
      wireSets.push(tone)
    }
  }

  const wire: Base = {
    ...developed,
    id: 'develop-wire',
    rule: IDENTITY_RULE,
    start: [],
    startPosition: 2,
    rounds: 0,
    spanLo: 2,
    spanWidth: 2,
    inputs: [0, 1],
    readPosition: noT ? 3 : 2,
    readRound: 1,
    prefer: wireSets,
    mask: gWire,
  }

  return {
    developed,
    undeveloped: { ...developed, id: 'develop-undeveloped', rounds: 0 },
    knockout: { ...developed, id: 'develop-knockout', rule: IDENTITY_RULE },
    wire,
    smuggler: { ...developed, mode: 'code' },
    misdeveloped: { ...developed, mode: 'misdeveloped' },
  }
}

const baseHeuristic = (environment: LearningEnvironment) => ({ id: environment.base.id, estimate: 'base', preprocessing: environment.base.preprocessing })

const aStarOn = (environment: LearningEnvironment): CandidateSpec =>
  candidate(SOLVER_CATALOG, 'aStar', { heuristic: baseHeuristic(environment) }, { base: environment.base.estimate })

const valueTable = candidate('code/intelligence/experience/learner/catalog', 'valueTable')
const breadthFirst = candidate(SOLVER_CATALOG, 'breadthFirst')

function armSpec(base: Base, environment: LearningEnvironment, learned: LearningGrade<MeshState>): CandidateSpec {
  const args: DevelopArgs = { ...base, preprocessing: addPreprocessing(environment.base.preprocessing, learned.charge) }

  return candidate(ARM_MODULE, 'developRouter', args, { base: environment.base.estimate, table: learned.table })
}

const pairUpdatesOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.pairUpdates, 0)
const runsOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.runs, 0)
const roundsOf = (grade: Grade<MeshState>): number => grade.mesh.layouts.reduce((sum, layout) => sum + layout.rounds, 0)

interface Row {
  starts: number
  expansions: number
  runs: number
  rounds: number
  pairUpdates: number
}

const NO_ROW: Row = { starts: 0, expansions: 0, runs: 0, rounds: 0, pairUpdates: 0 }
const addRow = (a: Row, c: Row): Row => ({
  starts: a.starts + c.starts,
  expansions: a.expansions + c.expansions,
  runs: a.runs + c.runs,
  rounds: a.rounds + c.rounds,
  pairUpdates: a.pairUpdates + c.pairUpdates,
})

type Solver = 'aStar' | Arm

const SOLVERS: readonly Solver[] = ['aStar', ...ARMS]

const emptyRows = (): Record<Solver, Row> => Object.fromEntries(SOLVERS.map(name => [name, NO_ROW])) as Record<Solver, Row>

// ---------------------------------------------------------------- the experiment

interface Prepared {
  environment: LearningEnvironment
  learned: LearningGrade<MeshState>
  graph: Graph
}

export default experiment({
  id: 'intelligence/develop',
  code: 'E-CMP-0096',
  title:
    'intelligence level 7, slice 1: whether a tie-breaking device develops from a primitive start; the capacity of all 64 preference functions of the word [taught, estimate change] on family A, every development of every primitive start of width at most 3 on the 56 quiet cells of the line to 6 rounds with the functions it realizes, the growth, bijection and wire theorems, and the selected developed device against its start undeveloped, the identity knockout, the best wire and level-1 A*, every round metered by the outside evaluator and recomputed by a judge',
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

    // ---- G1, the split
    const cells = allCells()
    const kindCount = (kind: CellKind): number => cells.filter(c => c.kind === kind).length
    const types = (['T0', 'T1', 'T2', 'T3', 'T4', 'T5'] as const).map(type => cells.filter(c => c.type === type).length)

    if (kindCount('species') !== 24 || kindCount('reactive') !== 32 || kindCount('live_vacuum') !== 16) {
      fail(`split ${kindCount('species')} species, ${kindCount('reactive')} reactive, ${kindCount('live_vacuum')} live vacuum`)
    }

    if (types.join(',') !== '3,3,3,3,6,6') {
      fail(`species types ${types.join(',')}, M6 has 3,3,3,3,6,6`)
    }

    if (F1.length !== 10) {
      fail(`F1 holds ${F1.length} functions, 10 expected`)
    }

    // ---- Part R: environments, learned tables, the ranking
    const prepared: Prepared[] = learningEnvironments()
      .filter(e => e.training.length > 0 && e.heldOut.length > 0)
      .map(environment => {
        const learned = evaluateLearning({ build: valueTable, teacher: aStarOn(environment), training: environment.training, operators: environment.operators })

        if (!learned.accepted) {
          fail(`${environment.id}: the value table was rejected: ${learned.violations[0]}`)
        }

        return { environment, learned, graph: new Graph(environment) }
      })

    const cTrain = new Array<number>(FUNCTIONS).fill(0)
    const cTest = new Array<number>(FUNCTIONS).fill(0)
    const cTestOutside = new Array<number>(FUNCTIONS).fill(0)

    for (const { environment, learned, graph } of prepared) {
      for (let g = 0; g < FUNCTIONS; g++) {
        for (const problem of environment.training) {
          cTrain[g] = cTrain[g]! + judgeAStar(graph, problem, learned.table, g, null).expanded
        }

        for (const problem of environment.heldOut) {
          const expanded = judgeAStar(graph, problem, learned.table, g, null).expanded

          cTest[g] = cTest[g]! + expanded

          if (!learned.table.has(problem.key(problem.initial))) {
            cTestOutside[g] = cTestOutside[g]! + expanded
          }
        }
      }
    }

    const argmin = (list: readonly number[], score: readonly number[]): number =>
      list.reduce((bestG, g) => (score[g]! < score[bestG]! ? g : bestG), list[0]!)
    const allFunctions = Array.from({ length: FUNCTIONS }, (_, g) => g)
    const twoInput = allFunctions.filter(g => !oneInput(g))
    const bestTest = argmin(allFunctions, cTest)
    const bestF1Test = argmin(F1, cTest)
    const bestTwoTest = argmin(twoInput, cTest)
    const gWire = argmin(F1, cTrain)

    if (cTest[0] !== cTest[FUNCTIONS - 1]) {
      fail(`the two constant functions differ on held-out starts (${cTest[0]}, ${cTest[FUNCTIONS - 1]}): a uniform preference must be level-1 A*`)
    }

    // ---- Part C: the census
    const quiet = cells.filter(c => c.kind !== 'live_vacuum')
    const result = census(quiet)
    const sum = (pick: (c: CellCensus) => number, list: readonly CellCensus[] = result.cells): number => list.reduce((s, c) => s + pick(c), 0)

    // G2, G3
    if (sum(c => c.growthBreaks) > 0) {
      fail(`D1 broken in ${result.cells.filter(c => c.growthBreaks > 0).map(c => c.name).join(', ')}`)
    }

    if (sum(c => c.collisions) > 0) {
      fail(`D2 broken: developed frames collide in ${result.cells.filter(c => c.collisions > 0).map(c => c.name).join(', ')}`)
    }

    // G4
    const identity = [...result.identity].sort((a, c) => a - c)

    if (identity.join(',') !== F1.join(',')) {
      fail(`D3: the identity census realizes ${identity.length} functions (${identity.filter(g => !oneInput(g)).length} outside F1), F1 has ${F1.length}`)
    }

    // the determinism of the census
    const twoCells = quiet.filter(c => c.name === 'id.CBA.id/0' || c.name === 'id.BCA.id/1')
    const again = census(twoCells).cells
    const first = result.cells.filter(c => c.name === 'id.CBA.id/0' || c.name === 'id.BCA.id/1')

    if (again.length !== 2 || again.some((c, i) => c.digest !== first[i]?.digest)) {
      fail('a second census of two cells gave a different digest')
    }

    // ---- selection (fixed rule, before any held-out grade)
    const rDev = new Set<number>()
    const r0 = new Set<number>()

    result.cells.forEach(c => {
      c.developedFunctions.forEach(g => rDev.add(g))
      c.undevelopedFunctions.forEach(g => r0.add(g))
    })

    const rDevTwo = [...rDev].filter(g => !oneInput(g)).sort((a, c) => a - c)
    const candidatesDev = rDevTwo.length > 0 ? rDevTwo : [...rDev].filter(g => g !== 0 && g !== FUNCTIONS - 1).sort((a, c) => a - c)
    const gDev = argmin(candidatesDev, cTrain)
    const chosen = result.developments.find(d => result.windows.get(windowKey(d.cell, d.spanLo, d.developed))!.has(gDev))

    if (chosen === undefined) {
      fail(`no development realizes the selected function ${gDev}`)

      return verdict({ status: 'fail', claim: 'intelligence level 7, slice 1: the selection found no device', metrics, control, notes: failures.join('; ') })
    }

    const placement = result.windows.get(windowKey(chosen.cell, chosen.spanLo, chosen.developed))!.get(gDev)!

    // added after the first run: the first development realizing g_dev whose rounds change its window
    const shiftedDev = result.developments.find(
      d => d.developed.join(',') !== d.undeveloped.join(',') && result.windows.get(windowKey(d.cell, d.spanLo, d.developed))!.has(gDev),
    )

    if (shiftedDev === undefined) {
      fail(`no development that changes its window realizes ${gDev}: the shifted control cannot run`)

      return verdict({ status: 'fail', claim: 'intelligence level 7, slice 1: no shifted device', metrics, control, notes: failures.join('; ') })
    }

    const shiftedPlacement = result.windows.get(windowKey(shiftedDev.cell, shiftedDev.spanLo, shiftedDev.developed))!.get(gDev)!
    const shiftedArms = armsFor(gDev, gWire, shiftedDev, shiftedPlacement)
    const selection: Selection = {
      gDev,
      gDevOutsideF1: !oneInput(gDev),
      gWire,
      development: chosen,
      placement,
      undevelopedRealizes: result.windows.get(windowKey(chosen.cell, chosen.spanLo, chosen.undeveloped))!.has(gDev),
      arms: {
        ...armsFor(gDev, gWire, chosen, placement),
        shifted: { ...shiftedArms.developed, id: 'develop-shifted' },
        shiftedMisdeveloped: { ...shiftedArms.developed, id: 'develop-shifted', mode: 'misdeveloped' },
      },
    }

    // G5, the runners on the selected device and the wire
    let runnerDifferences = 0

    for (const name of ['developed', 'wire'] as const) {
      const base = selection.arms[name]
      const window = name === 'developed' ? chosen.developed : undevelopedWindow({ ...base, preprocessing: NO_PREPROCESSING })
      const layout = deviceLayout({ ...base, preprocessing: NO_PREPROCESSING }, window)
      const mask = name === 'developed' ? gDev : gWire

      WORDS.forEach((word, w) => {
        const judged = judgeRun(base.rule, layout, word)
        const cellsLine = new Int8Array(meshLineLength(layout))
        const evaluator = meshLineRun(ruleTables.get(base.rule)!.table, layout, word, cellsLine)

        if (judged.value !== evaluator.value || judged.frameHash !== evaluator.frameHash) {
          runnerDifferences++
        }

        if (base.prefer.includes(evaluator.value) !== (((mask >> w) & 1) === 1)) {
          fail(`G5: the ${name} device under the evaluator's runner does not realize ${mask} on word ${word.join(',')}`)
        }
      })
    }

    if (runnerDifferences > 0) {
      fail(`G5: lineBrickRun and the evaluator's meshLineRun differ on ${runnerDifferences} runs`)
    }

    // the selected development, as the evaluator would compute it
    const developedCheck = judgeDevelopment({ ...selection.arms.developed, preprocessing: NO_PREPROCESSING }, 'probe')

    if (developedCheck.window.join(',') !== chosen.developed.join(',')) {
      fail('G5: the recomputed development differs from the census device')
    }

    // G10, bundles
    const bundled = candidateBundle(ARM_MODULE, 'developRouter', 'solver')

    if (!bundled.ok) {
      fail(`the developRouter bundle was refused: ${bundled.reason}`)
    }

    // ---- Part L: capacity through the isolated evaluator
    const outside = emptyRows()
    const inside = emptyRows()
    const certified = Object.fromEntries(ARMS.map(name => [name, 0])) as Record<Arm, number>

    let heldOut = 0
    let charge = 0
    let judgeEqualsAStar = 0
    let smugglerExternal = 0
    let smugglerSameExpansions = 0
    let smugglerAccepted = 0
    let misdevelopedRefused = 0
    let misdevelopedAsked = 0
    let developedDiffersFromUndeveloped = 0
    let shiftedMisAsked = 0
    let shiftedMisRefused = 0

    const windowsDiffer = chosen.developed.join(',') !== chosen.undeveloped.join(',')

    for (const { environment, learned, graph } of prepared) {
      charge += learned.charge.expansions

      for (const problem of environment.heldOut) {
        heldOut++

        const truth = environment.oracle[environment.startOf.get(problem.id)!]!
        const bfs = evaluate(breadthFirst, problem, environment.operators)
        const grades = { aStar: evaluate(aStarOn(environment), problem, environment.operators) } as Record<Solver, Grade<MeshState>>

        for (const name of ARMS) {
          grades[name] = evaluate(armSpec(selection.arms[name], environment, learned), problem, environment.operators)
        }

        if (!bfs.solved || bfs.violations.length > 0 || bfs.cost !== truth) {
          fail(`${problem.id} BFS solved ${bfs.solved}, cost ${bfs.cost}, oracle ${truth}`)
        }

        // G6
        for (const name of SOLVERS) {
          const grade = grades[name]

          if (!grade.solved || grade.violations.length > 0 || grade.cost !== bfs.cost) {
            fail(`${problem.id} ${name}: solved ${grade.solved}, cost ${grade.cost} (BFS ${bfs.cost}), ${grade.violations[0] ?? 'no violation'}`)
          }
        }

        if (judgeAStar(graph, problem, learned.table, 0, null).expanded === grades.aStar.measured.expansions) {
          judgeEqualsAStar++
        }

        // G7
        for (const name of HONEST) {
          const reason = certify({ ...selection.arms[name], preprocessing: NO_PREPROCESSING }, grades[name], problem, graph, learned.table)

          if (reason === '') {
            certified[name]++
          } else {
            fail(`${problem.id} ${name} not certified: ${reason}`)
          }
        }

        // G8
        const smuggler = grades.smuggler

        smugglerExternal += smuggler.mesh.layouts.length === 0 ? 1 : 0
        smugglerSameExpansions += smuggler.measured.expansions === grades.developed.measured.expansions ? 1 : 0
        smugglerAccepted += smuggler.solved && smuggler.violations.length === 0 ? 1 : 0

        // G9: the misdeveloped control against the developed claim
        const asked = runsOf(grades.misdeveloped) > (selection.arms.developed.rounds > 0 ? selection.arms.developed.spanWidth : 0)

        if (asked) {
          misdevelopedAsked++

          const refused = certify({ ...selection.arms.developed, preprocessing: NO_PREPROCESSING }, grades.misdeveloped, problem, graph, learned.table) !== ''

          misdevelopedRefused += refused ? 1 : 0
          certified.misdeveloped += refused ? 0 : 1
        }

        // the shifted misdeveloped twin (added after the first run): its window differs from the claimed development
        const shiftedArgs = { ...selection.arms.shifted, preprocessing: NO_PREPROCESSING }

        if (runsOf(grades.shiftedMisdeveloped) > shiftedArgs.spanWidth) {
          shiftedMisAsked++

          const refused = certify(shiftedArgs, grades.shiftedMisdeveloped, problem, graph, learned.table) !== ''

          shiftedMisRefused += refused ? 1 : 0
          certified.shiftedMisdeveloped += refused ? 0 : 1
        }

        certified.smuggler += smuggler.mesh.layouts.length === 0 ? 0 : 1

        if (grades.developed.measured.expansions !== grades.undeveloped.measured.expansions) {
          developedDiffersFromUndeveloped++
        }

        const rows = learned.table.has(problem.key(problem.initial)) ? inside : outside

        for (const name of SOLVERS) {
          const grade = grades[name]

          rows[name] = addRow(rows[name], {
            starts: 1,
            expansions: grade.measured.expansions,
            runs: runsOf(grade),
            rounds: roundsOf(grade),
            pairUpdates: pairUpdatesOf(grade),
          })
        }
      }
    }

    if (judgeEqualsAStar !== heldOut) {
      fail(`G6: the judge's A* with a constant function equals level-1 A* on ${judgeEqualsAStar} of ${heldOut} solves`)
    }

    if (smugglerExternal !== heldOut || smugglerSameExpansions !== heldOut || smugglerAccepted !== heldOut) {
      fail(`G8: smuggler external on ${smugglerExternal}, same expansions on ${smugglerSameExpansions}, accepted on ${smugglerAccepted}, of ${heldOut}`)
    }

    if (windowsDiffer && misdevelopedRefused !== misdevelopedAsked) {
      fail(`G9: the misdeveloped control was certified on ${misdevelopedAsked - misdevelopedRefused} of ${misdevelopedAsked} solves`)
    }

    if (shiftedMisAsked === 0 || shiftedMisRefused !== shiftedMisAsked) {
      fail(`G9 (shifted): the misdeveloped twin was refused on ${shiftedMisRefused} of ${shiftedMisAsked} solves that asked a decision run`)
    }

    // G10, determinism of a solve
    const probe = prepared.find(p => p.environment.id === 'maze-{4,4}') ?? prepared[0]!
    const solveDigest = (): string =>
      probe.environment.heldOut
        .slice(0, 2)
        .map(problem => {
          const grade = evaluate(armSpec(selection.arms.developed, probe.environment, probe.learned), problem, probe.environment.operators)

          return `${grade.measured.expansions}:${grade.cost}:${JSON.stringify(grade.mesh)}`
        })
        .join(';')

    if (solveDigest() !== solveDigest()) {
      fail('two solves of the developed arm gave different grades')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/develop.ts'])

    if (findings.length > 0) {
      fail(`random number or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // ---- the verdict's numbers
    const all = (name: Solver): Row => addRow(outside[name], inside[name])
    const rivals: readonly Solver[] = ['undeveloped', 'knockout', 'wire', 'aStar']
    const rivalBest = Math.min(...rivals.map(name => all(name).expansions))
    const credit = rivalBest - all('developed').expansions
    const templateNoGo = cTest[bestTest] === cTest[bestF1Test]
    const construction = failures.length === 0 && selection.gDevOutsideF1 && credit > 0
    const species = result.cells.filter(c => c.kind === 'species')
    const reactive = result.cells.filter(c => c.kind === 'reactive')
    const onlyDeveloped = new Set<number>()

    result.cells.forEach(c => c.onlyDeveloped.forEach(g => onlyDeveloped.add(g)))

    const globalOnlyDeveloped = rDevTwo.filter(g => !r0.has(g))

    metrics.cells = cells.length
    metrics.quietCells = quiet.length
    metrics.developments = sum(c => c.developments)
    metrics.probedDevelopments = sum(c => c.probed)
    metrics.tooWide = sum(c => c.tooWide)
    metrics.distinctDevices = sum(c => c.distinctDevices)
    metrics.censusRuns = sum(c => c.runs)
    metrics.identityRuns = result.identityRuns
    metrics.speciesGrown = sum(c => c.grown, species)
    metrics.reactiveGrown = sum(c => c.grown, reactive)
    metrics.growthBreaks = sum(c => c.growthBreaks)
    metrics.collisions = sum(c => c.collisions)
    metrics.identityFunctions = identity.length
    metrics.developedFunctions = rDev.size
    metrics.undevelopedFunctions = r0.size
    metrics.developedTwoInput = rDevTwo.length
    metrics.undevelopedTwoInput = [...r0].filter(g => !oneInput(g)).length
    metrics.onlyDevelopedPerCell = onlyDeveloped.size
    metrics.onlyDevelopedGlobal = globalOnlyDeveloped.length
    metrics.speciesTwoInput = new Set(species.flatMap(c => c.developedFunctions.filter(g => !oneInput(g)))).size
    metrics.reactiveTwoInput = new Set(reactive.flatMap(c => c.developedFunctions.filter(g => !oneInput(g)))).size
    metrics.levelOneTest = cTest[0]!
    metrics.bestTest = cTest[bestTest]!
    metrics.bestF1Test = cTest[bestF1Test]!
    metrics.bestTwoInputTest = cTest[bestTwoTest]!
    metrics.bestTestFunction = bestTest
    metrics.bestF1TestFunction = bestF1Test
    metrics.gDev = gDev
    metrics.gDevTrain = cTrain[gDev]!
    metrics.gDevTest = cTest[gDev]!
    metrics.gWire = gWire
    metrics.gWireTrain = cTrain[gWire]!
    metrics.gWireTest = cTest[gWire]!
    metrics.gDevOutsideF1 = selection.gDevOutsideF1 ? 1 : 0
    metrics.undevelopedRealizesGDev = selection.undevelopedRealizes ? 1 : 0
    metrics.chosenRounds = chosen.rounds
    metrics.environments = prepared.length
    metrics.heldOut = heldOut
    metrics.outsideStarts = outside.aStar.starts
    metrics.credit = credit
    metrics.learningCharge = charge
    metrics.runnerDifferences = runnerDifferences
    metrics.developedDiffersFromUndeveloped = developedDiffersFromUndeveloped

    for (const name of SOLVERS) {
      metrics[`${name}Expansions`] = all(name).expansions
      metrics[`${name}OutsideExpansions`] = outside[name].expansions
      metrics[`${name}Runs`] = all(name).runs
      metrics[`${name}Rounds`] = all(name).rounds
      metrics[`${name}PairUpdates`] = all(name).pairUpdates
    }

    for (const name of ARMS) {
      metrics[`${name}Certified`] = certified[name]
    }

    control.smugglerExternal = smugglerExternal
    control.smugglerSameExpansions = smugglerSameExpansions
    control.smugglerEvaluatorAccepted = smugglerAccepted
    control.misdevelopedAsked = misdevelopedAsked
    control.misdevelopedRefused = misdevelopedRefused
    control.windowsDiffer = windowsDiffer ? 1 : 0
    control.shiftedMisdevelopedAsked = shiftedMisAsked
    control.shiftedMisdevelopedRefused = shiftedMisRefused
    metrics.shiftedDevelopmentRounds = shiftedDev.rounds
    metrics.sourceFilesScanned = files.length

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0
    const ceilingRows = allFunctions.map(g => `${g}${oneInput(g) ? '*' : ''}:${cTrain[g]}/${cTest[g]}/${cTestOutside[g]}`).join(' ')
    const cellRows = result.cells
      .map(c => `${c.name} ${c.type ?? c.kind}: ${c.developments} developments, ${c.probed} probed, ${c.tooWide} too wide, grown ${c.grown}, devices ${c.distinctDevices}, functions developed ${c.developedFunctions.length} (two-input ${c.developedFunctions.filter(g => !oneInput(g)).length}), undeveloped ${c.undevelopedFunctions.length}, only developed ${c.onlyDeveloped.length}`)
      .join('; ')
    const dev = chosen
    const verdictText = construction
      ? `a construction lead: the developed device beats every rival by ${credit} expansions (to be traced before it is written as a gain)`
      : templateNoGo
        ? `a sharp no-go for the template: the best of all 64 preference functions on the held-out starts (${cTest[bestTest]} expansions) is no better than the best function of one input (${cTest[bestF1Test]}), so no device of any cell, start or round count, developed or placed, can beat the best wire (D3, D4); the developed device's credit is ${credit}`
        : `a bounded absence: a two-input function would beat the best wire on held-out starts (${cTest[bestTwoTest]} against ${cTest[bestF1Test]}), but the selected developed device's credit is ${credit}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 7, slice 1: ${verdictText}; ${rDevTwo.length} functions of both inputs are realized by developed devices and ${[...r0].filter(g => !oneInput(g)).length} by undeveloped starts (${globalOnlyDeveloped.length} only after development) over ${metrics.probedDevelopments} developments of primitive starts on ${quiet.length} quiet cells; growth: species ${metrics.speciesGrown} (D1: none can), reactive ${metrics.reactiveGrown} developments larger than their start, 0 above twice; ${metrics.collisions} collisions between developments (D2); the identity device realizes exactly the ${identity.length} one-input functions (D3); held-out expansions developed ${all('developed').expansions}, undeveloped ${all('undeveloped').expansions}, knockout ${all('knockout').expansions}, wire ${all('wire').expansions}, level-1 A* ${all('aStar').expansions} on ${heldOut} starts; every honest solve certified by a judge recomputing development reads, device window, decisions, background and SHA-256 chains; a smuggler deciding in code is classified external on ${smugglerExternal} of ${heldOut}, ${windowsDiffer ? `a misdeveloped device refused on ${misdevelopedRefused} of ${misdevelopedAsked}` : `the selected development leaves its window unchanged, so on the first development whose rounds change it (${shiftedDev.cell.name}, ${shiftedDev.rounds} rounds, held-out ${all('shifted').expansions}) a misdeveloped twin is refused on ${shiftedMisRefused} of ${shiftedMisAsked}`}; the undeveloped starts alone realize ${r0.size} of the 64 functions, so the best no-development device already reaches the ceiling (D4); the item's clause (M10 reproduction and adaptation) stays a sharp no-go in the species cells and a bounded absence elsewhere pending models-0062`,
      metrics,
      control,
      notes: `L2. Selected: g_dev ${gDev} (${selection.gDevOutsideF1 ? 'two inputs' : 'one input'}; train ${cTrain[gDev]}, held-out ${cTest[gDev]}), from ${dev.cell.name} start [${dev.start.join(',')}] parity ${dev.parity}, ${dev.rounds} rounds, span ${dev.spanLo}..${dev.spanLo + dev.developed.length - 1}, developed [${dev.developed.join(',')}], undeveloped [${dev.undeveloped.join(',')}], inputs ${placement.inputs.join(',')}, read ${placement.readPosition} at round ${placement.readRound}, prefer {${placement.prefer.join(',')}}; undeveloped realizes it with some placement: ${selection.undevelopedRealizes}. Shifted (added after the first run): ${shiftedDev.cell.name} start [${shiftedDev.start.join(',')}] parity ${shiftedDev.parity}, ${shiftedDev.rounds} rounds, span ${shiftedDev.spanLo}, developed [${shiftedDev.developed.join(',')}], undeveloped [${shiftedDev.undeveloped.join(',')}], inputs ${shiftedPlacement.inputs.join(',')}, read ${shiftedPlacement.readPosition} at round ${shiftedPlacement.readRound}, prefer {${shiftedPlacement.prefer.join(',')}}. g_wire ${gWire} (train ${cTrain[gWire]}, held-out ${cTest[gWire]}). Ceiling (function: train / held-out / held-out outside the table; * one input): ${ceilingRows}. Per arm (all held-out / outside / metered runs / rounds / pair updates): ${SOLVERS.map(n => `${n} ${all(n).expansions} / ${outside[n].expansions} / ${all(n).runs} / ${all(n).rounds} / ${all(n).pairUpdates}`).join('; ')}. Table charge ${charge} expansions (every arm but level-1 A* reads the table). Certified: ${ARMS.map(n => `${n} ${certified[n]}`).join(', ')}. Census: ${cellRows}. ${metrics.isolatedSessions} isolated contexts, ${metrics.isolatedRequests} requests. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
