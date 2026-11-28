// Intelligence level 6, slice 2 (item vibe-computation-intelligence-0029, level6.md of vibe/computation/intelligence):
// selection with each candidate's score written into two cells, the slice-1 selector census on matched coset tilings,
// and whether a selected content can STEER a later proposal (adaptation to past grades), per cell class.
//
// Algebra: spin-1 tones. Regime: pure. All 56 quiet rule-background cells of the 24 pair rules.
//   A  two-trit scores on the brick line: width 6, the six role cells in all 720 orders, both parities, reads to 8.
//   B  one score trit on coset {3,6}, {3,7}, {4,4}, {4,5}, forward and reverse color order, radius-1 ball, reads to 6.
//   C  the steering census (control c, data P and Q): line widths 3 to 7, reads to 8; the same tilings, reads to 6.
//   D  the one-layout adaptive step (a, b, sA, sB, P, Q): line width 6, one score trit, levels 2 and 3, reads to 8.
//
// Gates, fixed in level6.md before the first run, each able to fail:
// - G1 the split: 24 species, 32 reactive, 16 live-vacuum cells; types T0 3, T1 3, T2 3, T3 3, T4 6, T5 6.
// - G2 Lemma K: abstract max levels = min(a + b - 1, 2a, 2b) for a, b in 1..4, and no census read exceeds its bound.
// - G3 Lemma P live: 0 selectors in every T0, T3, T4, T5 cell in A and on every space and order of B.
// - G4 Lemma X live: 0 steering reads in C (line, every space and order) and 0 adaptive steps in D in T0 to T3.
// - G5 positive controls: id.CBA.id on the vacuum reaches >= 3 levels in A; the classifier accepts a hand mux and a
//   hand gate and refuses a copy, a constant and a copy whose source changes with the other data cell.
// - G6 independent replay of the first example per cell (A under lineBrickRun, B under counter.ts stepRun, C and D
//   likewise); the space runner equals stepRun at every round of every B layout of every cell on {4,5} forward.
// - G7 corruption: kept selectors with reversed codes and kept steering reads with c's values exchanged are refused.
//   Audit 3 (m5): for a read that replays this holds by construction, so it is a checker check. Added after the audit
//   (disclosed in level6.md): every single code value of every kept selector (A and B) changed, judged by the census's
//   own runner and by the reference runner; the verdicts agree on every change and some change is refused.
// - G8 every cell with a D step has a C line steering read at width <= 6; a second run of A and C on two cells gives
//   the same digests; no random or clock source in the new files.

import { resolve } from 'node:path'
import { splitCell, stepRun, type SpeciesType } from '@/code/compute/lab/counter'
import { gateRule, lineBrickRun, occupancyBlind, type GateRule } from '@/code/compute/lab/gates'
import { cosetSpace, roundColors, type LazySpace } from '@/code/compute/lab/lazy-space'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import {
  abstractMaxLevels,
  alphabetBound,
  digestText,
  lineFrames,
  maskKey,
  maxLevelsOver,
  placements,
  selectionMasks,
  toneTuples,
  type CodePair,
  type RunFrames,
} from '@/code/intelligence/improve/mesh/multi-score'
import { runLine } from '@/code/intelligence/improve/mesh/selection'
import { CachedGraph, runSpace, spaceFrames, unitBall } from '@/code/intelligence/improve/mesh/space-run'
import {
  adaptivePatterns,
  behaviourOf,
  COPY_P,
  COPY_Q,
  expectedRead,
  isMux,
  solveAdaptive,
  steeringReads,
  steers,
  type AdaptiveStep,
  type Behaviour,
} from '@/code/intelligence/improve/mesh/steering'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const NEW_FILES = [
  'code/intelligence/improve/mesh/multi-score.ts',
  'code/intelligence/improve/mesh/space-run.ts',
  'code/intelligence/improve/mesh/steering.ts',
  'test/experiment/intelligence/mesh-adaptation.ts',
]

// ---- parameters, fixed before the first run (level6.md, slice 2) ----

const LINE_ROUNDS = 8
const SPACE_ROUNDS = 6
const A_WIDTH = 6
const A_CAP = 8
const B_CAP = 5
const C_MIN_WIDTH = 3
const C_MAX_WIDTH = 7
const D_WIDTH = 6
const D_LEVELS = [2, 3] as const
const SPACES = [
  { p: 3, q: 6 },
  { p: 3, q: 7 },
  { p: 4, q: 4 },
  { p: 4, q: 5 },
] as const
const ORDERS = ['forward', 'reverse'] as const
const PINNED: readonly SpeciesType[] = ['T0', 'T3', 'T4', 'T5']
const BLIND_TYPES: readonly SpeciesType[] = ['T0', 'T1', 'T2', 'T3']

type Order = (typeof ORDERS)[number]

interface Cell {
  rule: GateRule
  name: string
  background: number
  kind: string
  type: SpeciesType | null
  blind: boolean
  ex: [number, number]
  label: string
}

// ---- A: two-trit scores on the line ----

interface LineLayout {
  width: number
  start: number
  constants: number[]
  /** window index of each role */
  at: number[]
}

interface TupleSelector {
  layout: LineLayout
  levels: number
  codes: CodePair
  /** padded index of the read, and its round */
  cell: number
  round: number
}

interface ACensus {
  maxLevels: number
  readsAtLeast3: number
  readsAtLeast4: number
  example: TupleSelector | null
  digest: string
  runs: number
}

const TUPLES2 = toneTuples(2)
const memoA = new Map<string, { levels: number; codes: CodePair | null }>()

function lineLayouts(width: number, roles: number, background: number): LineLayout[] {
  const out: LineLayout[] = []

  for (const at of placements(width, roles)) {
    const free = Array.from({ length: width }, (_, i) => i).filter(i => !at.includes(i))

    for (let code = 0; code < 3 ** free.length; code++) {
      const constants = Array.from({ length: width }, () => background)
      let x = code

      for (const i of free) {
        constants[i] = (x % 3) - 1
        x = Math.floor(x / 3)
      }

      for (const start of [0, 1]) {
        out.push({ width, start, constants, at })
      }
    }
  }

  return out
}

function lineWindow(layout: LineLayout, values: readonly number[]): number[] {
  const w = [...layout.constants]

  layout.at.forEach((i, r) => {
    w[i] = values[r]!
  })

  return w
}

// roles: a, b, sA1, sA2, sB1, sB2
function tupleWindowValues(a: number, b: number, vA: number, vB: number): number[] {
  return [a, b, TUPLES2[vA]![0]!, TUPLES2[vA]![1]!, TUPLES2[vB]![0]!, TUPLES2[vB]![1]!]
}

function censusA(cell: Cell): ACensus {
  const pairs = cell.ex.flatMap(a => cell.ex.map(b => [a, b] as const))
  const trail: string[] = []
  let maxLevels = 1
  let readsAtLeast3 = 0
  let readsAtLeast4 = 0
  let example: TupleSelector | null = null
  let runs = 0

  lineLayouts(A_WIDTH, 6, cell.background).forEach((layout, li) => {
    const frames: RunFrames[] = []

    for (let vA = 0; vA < 9; vA++) {
      for (let vB = 0; vB < 9; vB++) {
        for (const [a, b] of pairs) {
          runs++
          frames.push(
            lineFrames(
              runLine({ rule: cell.rule, background: cell.background, start: layout.start, window: lineWindow(layout, tupleWindowValues(a, b, vA, vB)), rounds: LINE_ROUNDS }),
              cell.background,
            ),
          )
        }
      }
    }

    selectionMasks({
      runs: frames,
      n: 9,
      pairs,
      rounds: LINE_ROUNDS,
      each: (round, c, okA, okB) => {
        const key = maskKey(okA, okB)
        let solved = memoA.get(key)

        if (solved === undefined) {
          solved = maxLevelsOver(9, okA, okB, A_CAP)
          memoA.set(key, solved)
        }

        if (solved.levels < 2) {
          return
        }

        trail.push(`${li}:${round}:${c}:${solved.levels}`)

        if (solved.levels >= 3) {
          readsAtLeast3++
        }

        if (solved.levels >= 4) {
          readsAtLeast4++
        }

        if (solved.levels > maxLevels) {
          maxLevels = solved.levels
          example = { layout, levels: solved.levels, codes: solved.codes!, cell: c, round }
        }
      },
    })
  })

  return { maxLevels, readsAtLeast3, readsAtLeast4, example, digest: digestText(trail.join('|')), runs }
}

const brickFrames = (cell: Cell, layout: LineLayout, values: readonly number[]): Int8Array[] =>
  lineBrickRun({ rule: cell.rule, background: cell.background, start: layout.start, window: lineWindow(layout, values), rounds: LINE_ROUNDS }).frames

// the census's own import-free runner, for the single-change cross-check (audit 3, m5)
const censusLineFrames = (cell: Cell, layout: LineLayout, values: readonly number[]): Int8Array[] =>
  runLine({ rule: cell.rule, background: cell.background, start: layout.start, window: lineWindow(layout, values), rounds: LINE_ROUNDS })

function holdsTuple(cell: Cell, s: TupleSelector, codes: CodePair, frames: typeof brickFrames = brickFrames): number {
  const brickFrames = frames
  let wrong = 0

  for (let sA = 0; sA < s.levels; sA++) {
    for (let sB = 0; sB < s.levels; sB++) {
      if (sA === sB) {
        continue
      }

      for (const a of cell.ex) {
        for (const b of cell.ex) {
          const read = brickFrames(cell, s.layout, tupleWindowValues(a, b, codes.codeA[sA]!, codes.codeB[sB]!))[s.round]![s.cell]

          if (read !== (sA > sB ? a : b)) {
            wrong++
          }
        }
      }
    }
  }

  return wrong
}

// ---- B: one trit on the tilings ----

interface SpaceSetup {
  name: string
  space: LazySpace
  graph: CachedGraph
  ball: number[]
}

interface SpaceLayout {
  roles: number[]
  constants: [number, number][]
}

interface SpaceSelector {
  layout: SpaceLayout
  levels: number
  codes: CodePair
  cell: number
  round: number
}

interface BCensus {
  maxLevels: number
  example: SpaceSelector | null
  layouts: number
}

const memoB = new Map<string, { levels: number; codes: CodePair | null }>()

function spaceLayouts(ball: readonly number[], roles: number): SpaceLayout[] {
  const out: SpaceLayout[] = []

  for (const at of placements(ball.length, roles)) {
    const free = ball.filter((_, i) => !at.includes(i))

    for (let code = 0; code < 3 ** free.length; code++) {
      let x = code
      const constants: [number, number][] = []

      for (const c of free) {
        constants.push([c, (x % 3) - 1])
        x = Math.floor(x / 3)
      }

      out.push({ roles: at.map(i => ball[i]!), constants })
    }
  }

  return out
}

function spaceStart(layout: SpaceLayout, values: readonly number[]): [number, number][] {
  return [...layout.constants, ...layout.roles.map((c, r) => [c, values[r]!] as [number, number])]
}

function runOn(setup: SpaceSetup, order: Order, cell: Cell, start: [number, number][]): RunFrames {
  return spaceFrames(
    runSpace({ graph: setup.graph, order: roundColors(setup.space, order), rule: cell.rule, background: cell.background, start, rounds: SPACE_ROUNDS }),
    cell.background,
  )
}

function censusB(setup: SpaceSetup, order: Order, cell: Cell): BCensus {
  const pairs = cell.ex.flatMap(a => cell.ex.map(b => [a, b] as const))
  const layouts = spaceLayouts(setup.ball, 4)
  let maxLevels = 1
  let example: SpaceSelector | null = null

  for (const layout of layouts) {
    const frames: RunFrames[] = []

    for (let tA = -1; tA <= 1; tA++) {
      for (let tB = -1; tB <= 1; tB++) {
        for (const [a, b] of pairs) {
          frames.push(runOn(setup, order, cell, spaceStart(layout, [a, b, tA, tB])))
        }
      }
    }

    selectionMasks({
      runs: frames,
      n: 3,
      pairs,
      rounds: SPACE_ROUNDS,
      each: (round, c, okA, okB) => {
        const key = maskKey(okA, okB)
        let solved = memoB.get(key)

        if (solved === undefined) {
          solved = maxLevelsOver(3, okA, okB, B_CAP)
          memoB.set(key, solved)
        }

        if (solved.levels > maxLevels) {
          maxLevels = solved.levels
          example = { layout, levels: solved.levels, codes: solved.codes!, cell: c, round }
        }
      },
    })
  }

  return { maxLevels, example, layouts: layouts.length }
}

// stepRun of counter.ts, read at round ends
function referenceRead(setup: SpaceSetup, order: Order, cell: Cell, start: [number, number][], round: number, at: number): number {
  const colors = roundColors(setup.space, order)
  const states = stepRun(cell.rule, cell.background, { space: setup.space, colors }, new Map(start.filter(([, t]) => t !== cell.background)), round * colors.length)

  return states[round * colors.length]!.get(at) ?? cell.background
}

// the census's own sparse runner read at a round end, for the single-change cross-check (audit 3, m5)
function censusSpaceRead(setup: SpaceSetup, order: Order, cell: Cell, start: [number, number][], round: number, at: number): number {
  return runOn(setup, order, cell, start).value(round, at)
}

function holdsSpace(setup: SpaceSetup, order: Order, cell: Cell, s: SpaceSelector, codes: CodePair, read: typeof referenceRead = referenceRead): number {
  const referenceRead = read
  let wrong = 0

  for (let sA = 0; sA < s.levels; sA++) {
    for (let sB = 0; sB < s.levels; sB++) {
      if (sA === sB) {
        continue
      }

      for (const a of cell.ex) {
        for (const b of cell.ex) {
          const read = referenceRead(setup, order, cell, spaceStart(s.layout, [a, b, codes.codeA[sA]! - 1, codes.codeB[sB]! - 1]), s.round, s.cell)

          if (read !== (sA > sB ? a : b)) {
            wrong++
          }
        }
      }
    }
  }

  return wrong
}

const reversedCodes = (c: CodePair): CodePair => ({ codeA: [...c.codeA].reverse(), codeB: [...c.codeB].reverse() })

// ---- C: the steering census ----

interface SteerRead<L> {
  layout: L
  round: number
  cell: number
  bu: Behaviour
  bv: Behaviour
}

interface CCensus<L> {
  steering: number
  mux: number
  minWidth: number | null
  example: SteerRead<L> | null
  digest: string
}

function censusCLine(cell: Cell, minWidth: number, maxWidth: number): CCensus<LineLayout> {
  const trail: string[] = []
  let steering = 0
  let mux = 0
  let min: number | null = null
  let example: SteerRead<LineLayout> | null = null
  let li = 0

  for (let width = minWidth; width <= maxWidth; width++) {
    for (const layout of lineLayouts(width, 3, cell.background)) {
      const frames: RunFrames[] = []

      for (let c = 0; c < 2; c++) {
        for (let P = 0; P < 2; P++) {
          for (let Q = 0; Q < 2; Q++) {
            frames.push(
              lineFrames(
                runLine({ rule: cell.rule, background: cell.background, start: layout.start, window: lineWindow(layout, [cell.ex[c]!, cell.ex[P]!, cell.ex[Q]!]), rounds: LINE_ROUNDS }),
                cell.background,
              ),
            )
          }
        }
      }

      steeringReads({
        runs: frames,
        ex: cell.ex,
        rounds: LINE_ROUNDS,
        each: (round, at, bu, bv) => {
          steering++

          if (isMux(bu, bv)) {
            mux++
          }

          trail.push(`${li}:${round}:${at}:${bu}:${bv}`)
          min = min === null ? width : Math.min(min, width)
          example ??= { layout, round, cell: at, bu, bv }
        },
      })
      li++
    }
  }

  return { steering, mux, minWidth: min, example, digest: digestText(trail.join('|')) }
}

function censusCSpace(setup: SpaceSetup, order: Order, cell: Cell): CCensus<SpaceLayout> {
  let steering = 0
  let mux = 0
  let example: SteerRead<SpaceLayout> | null = null

  for (const layout of spaceLayouts(setup.ball, 3)) {
    const frames: RunFrames[] = []

    for (let c = 0; c < 2; c++) {
      for (let P = 0; P < 2; P++) {
        for (let Q = 0; Q < 2; Q++) {
          frames.push(runOn(setup, order, cell, spaceStart(layout, [cell.ex[c]!, cell.ex[P]!, cell.ex[Q]!])))
        }
      }
    }

    steeringReads({
      runs: frames,
      ex: cell.ex,
      rounds: SPACE_ROUNDS,
      each: (round, at, bu, bv) => {
        steering++

        if (isMux(bu, bv)) {
          mux++
        }

        example ??= { layout, round, cell: at, bu, bv }
      },
    })
  }

  return { steering, mux, minWidth: null, example, digest: '' }
}

// wrong reads of a steering read under the reference runner, with its behaviours possibly exchanged
function steerWrongLine(cell: Cell, s: SteerRead<LineLayout>, exchanged: boolean): number {
  let wrong = 0

  for (let c = 0; c < 2; c++) {
    const b = (c === 0) !== exchanged ? s.bu : s.bv

    for (let P = 0; P < 2; P++) {
      for (let Q = 0; Q < 2; Q++) {
        const read = brickFrames(cell, s.layout, [cell.ex[c]!, cell.ex[P]!, cell.ex[Q]!])[s.round]![s.cell]

        if (read !== expectedRead(b, cell.ex, P, Q)) {
          wrong++
        }
      }
    }
  }

  return wrong
}

function steerWrongSpace(setup: SpaceSetup, order: Order, cell: Cell, s: SteerRead<SpaceLayout>, exchanged: boolean): number {
  let wrong = 0

  for (let c = 0; c < 2; c++) {
    const b = (c === 0) !== exchanged ? s.bu : s.bv

    for (let P = 0; P < 2; P++) {
      for (let Q = 0; Q < 2; Q++) {
        const read = referenceRead(setup, order, cell, spaceStart(s.layout, [cell.ex[c]!, cell.ex[P]!, cell.ex[Q]!]), s.round, s.cell)

        if (read !== expectedRead(b, cell.ex, P, Q)) {
          wrong++
        }
      }
    }
  }

  return wrong
}

// ---- D: the one-layout adaptive step ----

interface DStep {
  layout: LineLayout
  round: number
  cell: number
  step: AdaptiveStep
}

interface DCensus {
  steps: Record<number, number>
  example: DStep | null
}

const memoD = new Map<string, (AdaptiveStep | null)[]>()

// roles: a, b, sA, sB, P, Q
function censusD(cell: Cell): DCensus {
  const steps: Record<number, number> = {}
  let example: DStep | null = null

  for (const L of D_LEVELS) {
    steps[L] = 0
  }

  for (const layout of lineLayouts(D_WIDTH, 6, cell.background)) {
    const frames: RunFrames[] = []

    for (let tA = -1; tA <= 1; tA++) {
      for (let tB = -1; tB <= 1; tB++) {
        for (let a = 0; a < 2; a++) {
          for (let b = 0; b < 2; b++) {
            for (let P = 0; P < 2; P++) {
              for (let Q = 0; Q < 2; Q++) {
                frames.push(
                  lineFrames(
                    runLine({
                      rule: cell.rule,
                      background: cell.background,
                      start: layout.start,
                      window: lineWindow(layout, [cell.ex[a]!, cell.ex[b]!, tA, tB, cell.ex[P]!, cell.ex[Q]!]),
                      rounds: LINE_ROUNDS,
                    }),
                    cell.background,
                  ),
                )
              }
            }
          }
        }
      }
    }

    for (let round = 1; round <= LINE_ROUNDS; round++) {
      const cells = new Set<number>()

      for (const f of frames) {
        for (const c of f.occupied(round)) {
          cells.add(c)
        }
      }

      for (const at of [...cells].sort((x, y) => x - y)) {
        const { byA, byB } = adaptivePatterns(frames, cell.ex, round, at)

        if (byA.every(p => p < 0) || byB.every(p => p < 0)) {
          continue
        }

        const key = `${byA.join(',')}|${byB.join(',')}`
        let solved = memoD.get(key)

        if (solved === undefined) {
          solved = D_LEVELS.map(L => solveAdaptive(L, byA, byB))
          memoD.set(key, solved)
        }

        D_LEVELS.forEach((L, i) => {
          const s = solved[i]

          if (s === null || s === undefined) {
            return
          }

          steps[L] = steps[L]! + 1
          example ??= { layout, round, cell: at, step: s }
        })
      }
    }
  }

  return { steps, example }
}

function dWrong(cell: Cell, d: DStep, exchanged: boolean): number {
  const { codeA, codeB, pattern, levels } = d.step
  const bu = Math.floor(pattern / 8)
  const bv = pattern % 8
  let wrong = 0

  for (let sA = 0; sA < levels; sA++) {
    for (let sB = 0; sB < levels; sB++) {
      if (sA === sB) {
        continue
      }

      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          const winner = sA > sB ? a : b
          const beh = (winner === 0) !== exchanged ? bu : bv

          for (let P = 0; P < 2; P++) {
            for (let Q = 0; Q < 2; Q++) {
              const values = [cell.ex[a]!, cell.ex[b]!, codeA[sA]! - 1, codeB[sB]! - 1, cell.ex[P]!, cell.ex[Q]!]
              const read = brickFrames(cell, d.layout, values)[d.round]![d.cell]

              if (read !== expectedRead(beh, cell.ex, P, Q)) {
                wrong++
              }
            }
          }
        }
      }
    }
  }

  return wrong
}

// ---- the classifier controls (G5) ----

function classifierControls(): { accepted: string[]; refused: string[]; wrong: string[] } {
  const ex: [number, number] = [-1, 1]
  const tables: { name: string; want: 'mux' | 'gate' | 'none'; read: (c: number, P: number, Q: number) => number }[] = [
    { name: 'mux', want: 'mux', read: (c, P, Q) => (c === 0 ? ex[P]! : ex[Q]!) },
    { name: 'gate', want: 'gate', read: (c, P) => (c === 0 ? ex[P]! : 0) },
    { name: 'copy', want: 'none', read: (_c, P) => ex[P]! },
    { name: 'constant', want: 'none', read: () => 1 },
    { name: 'source-moves', want: 'none', read: (c, P, Q) => (c === 0 ? (Q === 0 ? ex[P]! : ex[Q]!) : 0) },
  ]
  const accepted: string[] = []
  const refused: string[] = []
  const wrong: string[] = []

  for (const t of tables) {
    const b = [0, 1].map(c => behaviourOf([0, 1, 2, 3].map(d => t.read(c, d >> 1, d & 1)), ex))
    const got = !steers(b[0]!, b[1]!) ? 'none' : isMux(b[0]!, b[1]!) ? 'mux' : 'gate'

    ;(got === 'none' ? refused : accepted).push(t.name)

    if (got !== t.want) {
      wrong.push(`${t.name}: ${got}, want ${t.want}`)
    }
  }

  return { accepted, refused, wrong }
}

function describeLine(layout: LineLayout, roles: readonly string[]): string {
  return `[${layout.constants.map((t, i) => (layout.at.includes(i) ? roles[layout.at.indexOf(i)]! : String(t))).join(' ')}] parity ${layout.start}`
}

const behaviourName = (b: Behaviour): string => (b === COPY_P ? 'P' : b === COPY_Q ? 'Q' : `const ${b - 4}`)

export default experiment({
  id: 'intelligence/mesh-adaptation',
  code: 'E-CMP-0075',
  title:
    'intelligence level 6, slice 2: selection with two-trit scores on the line, the selector census on matched coset tilings, and whether a selected content can steer a later proposal (adaptation to past grades) per cell class, with the alphabet bound, the pinned-content lemma, the select-or-steer lemma for species cells and independent replays',
  category: 'computation',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    const failures: string[] = []
    const fail = (why: string): void => {
      failures.push(why)
    }

    // ---- G1 the split ----

    const census = pairRuleCensus()
    const cells: Cell[] = []
    const kinds: Record<string, number> = { species: 0, reactive: 0, live_vacuum: 0 }
    const types: Record<string, number> = {}

    for (const r of census.rules) {
      const rule = gateRule(r.name, r.table)

      for (const background of [-1, 0, 1]) {
        const split = splitCell(rule, background)

        kinds[split.kind] = kinds[split.kind]! + 1

        if (split.type !== null) {
          types[split.type] = (types[split.type] ?? 0) + 1
        }

        if (split.kind === 'live_vacuum') {
          continue
        }

        const ex = [-1, 0, 1].filter(t => t !== background) as [number, number]

        cells.push({
          rule,
          name: r.name,
          background,
          kind: split.kind,
          type: split.type,
          blind: occupancyBlind(rule, background),
          ex,
          label: `${r.name}/${background > 0 ? '+1' : background}${split.type === null ? ' (reactive)' : ` (${split.type})`}`,
        })
      }
    }

    const wantTypes: Record<string, number> = { T0: 3, T1: 3, T2: 3, T3: 3, T4: 6, T5: 6 }

    if (kinds.species !== 24 || kinds.reactive !== 32 || kinds.live_vacuum !== 16) {
      fail(`split ${JSON.stringify(kinds)}`)
    }

    for (const [t, n] of Object.entries(wantTypes)) {
      if (types[t] !== n) {
        fail(`type ${t}: ${types[t] ?? 0} cells, want ${n}`)
      }
    }

    const blindMismatch = cells.filter(c => c.blind !== (c.type !== null && BLIND_TYPES.includes(c.type)))

    if (blindMismatch.length > 0) {
      fail(`occupancy-blind cells differ from T0..T3: ${blindMismatch.map(c => c.label).join(', ')}`)
    }

    const isPinned = (c: Cell): boolean => c.type !== null && PINNED.includes(c.type)
    const isBlind = (c: Cell): boolean => c.type !== null && BLIND_TYPES.includes(c.type)

    // ---- G2 Lemma K, abstract ----

    let lemmaChecked = 0

    for (let a = 1; a <= 4; a++) {
      for (let b = 1; b <= 4; b++) {
        lemmaChecked++

        const got = abstractMaxLevels(a, b, 2 * Math.max(a, b) + 2)

        if (got !== alphabetBound(a, b)) {
          fail(`Lemma K: a ${a} b ${b} gives ${got}, closed form ${alphabetBound(a, b)}`)
        }
      }
    }

    control.lemmaKPairsChecked = lemmaChecked

    // ---- G5 classifier controls ----

    const classifier = classifierControls()

    for (const w of classifier.wrong) {
      fail(`classifier: ${w}`)
    }

    control.classifierAccepted = classifier.accepted.length
    control.classifierRefused = classifier.refused.length

    // ---- A ----

    const aRows = cells.map(c => ({ cell: c, a: censusA(c) }))

    for (const { cell, a } of aRows) {
      const bound = alphabetBound(cell.blind ? 4 : 9, cell.blind ? 4 : 9)

      if (a.maxLevels > bound) {
        fail(`A ${cell.label}: ${a.maxLevels} levels above Lemma K's ${bound}`)
      }

      if (isPinned(cell) && a.maxLevels >= 2) {
        fail(`A ${cell.label}: a selector in a pinned cell (Lemma P)`)
      }
    }

    const register = aRows.find(r => r.cell.name === 'id.CBA.id' && r.cell.background === 0)

    if (register === undefined || register.a.maxLevels < 3) {
      fail('positive control: id.CBA.id on the vacuum below 3 levels with two-trit scores')
    }

    // ---- B ----

    const setups: SpaceSetup[] = SPACES.map(({ p, q }) => {
      const space = cosetSpace({ name: `{${p},${q}}/coset`, p, q })
      const graph = new CachedGraph(space, space.colorCount)

      return { name: `{${p},${q}}`, space, graph, ball: unitBall(space, 0) }
    })
    const bRows: { cell: Cell; setup: SpaceSetup; order: Order; b: BCensus }[] = []

    for (const setup of setups) {
      for (const order of ORDERS) {
        for (const cell of cells) {
          const b = censusB(setup, order, cell)

          bRows.push({ cell, setup, order, b })

          if (b.maxLevels > alphabetBound(cell.blind ? 2 : 3, cell.blind ? 2 : 3)) {
            fail(`B ${cell.label} ${setup.name} ${order}: ${b.maxLevels} levels above Lemma K`)
          }

          if (isPinned(cell) && b.maxLevels >= 2) {
            fail(`B ${cell.label} ${setup.name} ${order}: a selector in a pinned cell (Lemma P)`)
          }
        }
      }
    }

    // the space runner against stepRun on every B layout of every cell, {4,5} forward, one input
    const h45 = setups.find(s => s.name === '{4,5}')!
    let spaceFramesCompared = 0
    let spaceMismatches = 0

    for (const cell of cells) {
      const colors = roundColors(h45.space, 'forward')

      for (const layout of spaceLayouts(h45.ball, 4)) {
        const start = spaceStart(layout, [cell.ex[0], cell.ex[1], cell.ex[1], cell.ex[0]])
        const mine = runSpace({ graph: h45.graph, order: colors, rule: cell.rule, background: cell.background, start, rounds: SPACE_ROUNDS })
        const theirs = stepRun(cell.rule, cell.background, { space: h45.space, colors }, new Map(start.filter(([, t]) => t !== cell.background)), SPACE_ROUNDS * colors.length)

        for (let t = 0; t <= SPACE_ROUNDS; t++) {
          const ref = theirs[t * colors.length]!
          const f = mine[t]!

          spaceFramesCompared++

          if (f.cells.length !== ref.size || Array.from(f.cells).some((c, i) => ref.get(c) !== f.tones[i])) {
            spaceMismatches++
          }
        }
      }
    }

    if (spaceMismatches !== 0) {
      fail(`space runner differs from stepRun on ${spaceMismatches} of ${spaceFramesCompared} frames`)
    }

    // ---- C ----

    const cLine = cells.map(c => ({ cell: c, c: censusCLine(c, C_MIN_WIDTH, C_MAX_WIDTH) }))
    const cSpace: { cell: Cell; setup: SpaceSetup; order: Order; c: CCensus<SpaceLayout> }[] = []

    for (const setup of setups) {
      for (const order of ORDERS) {
        for (const cell of cells) {
          cSpace.push({ cell, setup, order, c: censusCSpace(setup, order, cell) })
        }
      }
    }

    // ---- D ----

    const dRows = cells.map(c => ({ cell: c, d: censusD(c) }))

    // ---- G4 Lemma X ----

    const blindSteer =
      cLine.filter(r => isBlind(r.cell)).reduce((n, r) => n + r.c.steering, 0) + cSpace.filter(r => isBlind(r.cell)).reduce((n, r) => n + r.c.steering, 0)
    const blindSteps = dRows.filter(r => isBlind(r.cell)).reduce((n, r) => n + D_LEVELS.reduce((m, L) => m + r.d.steps[L]!, 0), 0)

    if (blindSteer !== 0) {
      fail(`${blindSteer} steering reads in T0..T3 cells (Lemma X says none)`)
    }

    if (blindSteps !== 0) {
      fail(`${blindSteps} adaptive steps in T0..T3 cells (Lemma X says none)`)
    }

    // ---- G6, G7 replays and corruption ----

    let replayed = 0
    let refused = 0

    const replay = (what: string, wrong: number, corrupted: number): void => {
      replayed++

      if (wrong !== 0) {
        fail(`${what}: replay wrong on ${wrong} inputs`)
      }

      // a checker check (audit 3, m5): reversed codes and exchanged control values are refused by construction for a
      // read that replays, so a miss means the checker is broken
      if (corrupted > 0) {
        refused++
      } else {
        fail(`${what}: corruption not refused (the replay checker is broken)`)
      }
    }

    // audit 3, m5: the reversed codes of a selector that replays pick the worse content on every strictly ordered pair by
    // construction, so they are a checker check. The control that can fail: every single code value of every kept
    // selector changed, judged by the census's own runner and by the reference runner; the verdicts must agree on every
    // change, and some change must be refused
    const single = { changes: 0, stillValid: 0, disagree: 0 }
    const singleChanges = (codes: CodePair, alphabet: number): CodePair[] => {
      const out: CodePair[] = []

      for (const side of ['codeA', 'codeB'] as const) {
        for (let level = 0; level < codes[side].length; level++) {
          for (let symbol = 0; symbol < alphabet; symbol++) {
            if (symbol !== codes[side][level]) {
              out.push({ ...codes, [side]: codes[side].map((v, i) => (i === level ? symbol : v)) })
            }
          }
        }
      }

      return out
    }
    const crossCheck = (what: string, census: number, reference: number): void => {
      single.changes++
      single.stillValid += census === 0 ? 1 : 0

      if ((census === 0) !== (reference === 0)) {
        single.disagree++
        fail(`${what}: a changed code is ${census === 0 ? 'valid' : 'refused'} by the census runner and ${reference === 0 ? 'valid' : 'refused'} by the reference`)
      }
    }

    for (const { cell, a } of aRows) {
      if (a.example !== null) {
        const example = a.example

        replay(`A ${cell.label}`, holdsTuple(cell, example, example.codes), holdsTuple(cell, example, reversedCodes(example.codes)))

        for (const codes of singleChanges(example.codes, TUPLES2.length)) {
          crossCheck(`A ${cell.label}`, holdsTuple(cell, example, codes, censusLineFrames), holdsTuple(cell, example, codes))
        }
      }
    }

    for (const { cell, setup, order, b } of bRows) {
      if (b.example !== null) {
        const example = b.example

        replay(`B ${cell.label} ${setup.name} ${order}`, holdsSpace(setup, order, cell, example, example.codes), holdsSpace(setup, order, cell, example, reversedCodes(example.codes)))

        for (const codes of singleChanges(example.codes, 3)) {
          crossCheck(`B ${cell.label} ${setup.name} ${order}`, holdsSpace(setup, order, cell, example, codes, censusSpaceRead), holdsSpace(setup, order, cell, example, codes))
        }
      }
    }

    control.singleCodeChanges = single.changes
    control.singleCodeChangesStillValid = single.stillValid
    control.singleCodeChangesRefused = single.changes - single.stillValid
    control.singleCodeChangesRunnersDisagree = single.disagree

    if (single.changes === 0 || single.changes === single.stillValid) {
      fail(`single code changes: ${single.changes} tried, none refused, so the replay does not discriminate`)
    }

    for (const { cell, c } of cLine) {
      if (c.example !== null) {
        replay(`C ${cell.label} line`, steerWrongLine(cell, c.example, false), steerWrongLine(cell, c.example, true))
      }
    }

    for (const { cell, setup, order, c } of cSpace) {
      if (c.example !== null) {
        replay(`C ${cell.label} ${setup.name} ${order}`, steerWrongSpace(setup, order, cell, c.example, false), steerWrongSpace(setup, order, cell, c.example, true))
      }
    }

    for (const { cell, d } of dRows) {
      if (d.example !== null) {
        replay(`D ${cell.label}`, dWrong(cell, d.example, false), dWrong(cell, d.example, true))
      }
    }

    // ---- G8 consistency, determinism, sources ----

    for (const { cell, d } of dRows) {
      const hasStep = D_LEVELS.some(L => d.steps[L]! > 0)
      const c = cLine.find(r => r.cell === cell)!.c

      if (hasStep && (c.minWidth === null || c.minWidth > D_WIDTH)) {
        fail(`D ${cell.label} has an adaptive step but C has no steering read at width <= ${D_WIDTH}`)
      }
    }

    const twice = cells.filter(c => (c.name === 'id.CBA.id' && c.background === 0) || (c.name === 'id.ACB.swap' && c.background === -1))
    let digestsMatched = 0

    for (const cell of twice) {
      const a1 = aRows.find(r => r.cell === cell)!.a.digest
      const c1 = cLine.find(r => r.cell === cell)!.c.digest

      if (censusA(cell).digest === a1 && censusCLine(cell, C_MIN_WIDTH, C_MAX_WIDTH).digest === c1) {
        digestsMatched++
      } else {
        fail(`${cell.label}: a second run gave a different digest`)
      }
    }

    if (twice.length !== 2) {
      fail(`determinism: ${twice.length} cells, want 2`)
    }

    const { files, findings } = scanIntelligenceSources(BASE, NEW_FILES.slice(3))

    if (findings.length > 0) {
      fail(`random or clock source: ${findings.map(f => `${f.file}:${f.line} ${f.kind}`).join(', ')}`)
    }

    // ---- what was found ----

    const reactive = cells.filter(c => c.kind === 'reactive')
    const t2 = cells.filter(c => c.type === 'T2')
    const aMax = (c: Cell): number => aRows.find(r => r.cell === c)!.a.maxLevels
    const bMax = (c: Cell, s: SpaceSetup, o: Order): number => bRows.find(r => r.cell === c && r.setup === s && r.order === o)!.b.maxLevels
    const cOf = (c: Cell) => cLine.find(r => r.cell === c)!.c
    const cSpaceSteer = (c: Cell): number => cSpace.filter(r => r.cell === c).reduce((n, r) => n + r.c.steering, 0)
    const dOf = (c: Cell) => dRows.find(r => r.cell === c)!.d
    const aFour = aRows.filter(r => r.a.maxLevels >= 4)
    const aHistogram: Record<number, number> = {}

    for (const r of aRows) {
      aHistogram[r.a.maxLevels] = (aHistogram[r.a.maxLevels] ?? 0) + 1
    }

    const spaceTable = setups
      .flatMap(s =>
        ORDERS.map(o => {
          const rows = cells.filter(c => !isPinned(c)).map(c => bMax(c, s, o))
          const at3 = rows.filter(x => x >= 3).length
          const at4 = rows.filter(x => x >= 4).length
          const t2best = Math.max(...t2.map(c => bMax(c, s, o)))

          return `${s.name} ${o}: >=2 levels ${rows.filter(x => x >= 2).length}, >=3 ${at3}, >=4 ${at4}, T2 best ${t2best}`
        }),
      )
      .join('; ')
    const pairsCompared: string[] = []
    let curvatureDiffs = 0

    for (const [flat, hyp] of [
      ['{3,6}', '{3,7}'],
      ['{4,4}', '{4,5}'],
    ] as const) {
      const sf = setups.find(s => s.name === flat)!
      const sh = setups.find(s => s.name === hyp)!

      for (const o of ORDERS) {
        const diff = cells.filter(c => bMax(c, sf, o) !== bMax(c, sh, o))

        curvatureDiffs += diff.length
        pairsCompared.push(`${flat}/${hyp} ${o}: ${diff.length} cells differ${diff.length > 0 ? ` (${diff.slice(0, 6).map(c => `${c.label} ${bMax(c, sf, o)}/${bMax(c, sh, o)}`).join(', ')})` : ''}`)
      }
    }

    // per-cell set of differing cells in every pair and order: credited to curvature only then
    const alwaysDiffer = cells.filter(c =>
      [
        ['{3,6}', '{3,7}'],
        ['{4,4}', '{4,5}'],
      ].every(([f, h]) =>
        ORDERS.every(o => {
          const sf = setups.find(s => s.name === f)!
          const sh = setups.find(s => s.name === h)!

          return bMax(c, sf, o) !== bMax(c, sh, o)
        }),
      ),
    )

    const t2TilingThree = t2.filter(c => setups.some(s => ORDERS.some(o => bMax(c, s, o) >= 3)))
    const steerT45 = cells.filter(c => (c.type === 'T4' || c.type === 'T5') && (cOf(c).steering > 0 || cSpaceSteer(c) > 0))
    const reactiveSelect = reactive.filter(c => aMax(c) >= 2 || setups.some(s => ORDERS.some(o => bMax(c, s, o) >= 2)))
    const reactiveSteer = reactive.filter(c => cOf(c).steering > 0 || cSpaceSteer(c) > 0)
    const twoStage = reactive.filter(c => reactiveSelect.includes(c) && reactiveSteer.includes(c))
    const oneLayout = cells.filter(c => D_LEVELS.some(L => dOf(c).steps[L]! > 0))
    const oneLayout3 = cells.filter(c => dOf(c).steps[3]! > 0)

    metrics.cells = cells.length
    metrics.aLayoutsPerCell = lineLayouts(A_WIDTH, 6, 0).length
    metrics.aRuns = aRows.reduce((n, r) => n + r.a.runs, 0)
    metrics.aCellsAtLeast3 = aRows.filter(r => r.a.maxLevels >= 3).length
    metrics.aCellsAtLeast4 = aFour.length
    metrics.aReadsAtLeast4 = aRows.reduce((n, r) => n + r.a.readsAtLeast4, 0)
    metrics.aBestLevels = Math.max(...aRows.map(r => r.a.maxLevels))
    metrics.aBestBlind = Math.max(...aRows.filter(r => r.cell.blind).map(r => r.a.maxLevels))
    metrics.aBestReactive = Math.max(...aRows.filter(r => r.cell.kind === 'reactive').map(r => r.a.maxLevels))
    metrics.bLayouts = bRows.reduce((n, r) => n + r.b.layouts, 0)
    metrics.bBestLevels = Math.max(...bRows.map(r => r.b.maxLevels))
    metrics.bT2CellsAtThree = t2TilingThree.length
    metrics.bCurvatureDiffs = curvatureDiffs
    metrics.bAlwaysDiffer = alwaysDiffer.length
    metrics.cLineSteeringReads = cLine.reduce((n, r) => n + r.c.steering, 0)
    metrics.cLineMuxReads = cLine.reduce((n, r) => n + r.c.mux, 0)
    metrics.cSpaceSteeringReads = cSpace.reduce((n, r) => n + r.c.steering, 0)
    metrics.cCellsSteering = cells.filter(c => cOf(c).steering > 0 || cSpaceSteer(c) > 0).length
    metrics.cT4T5CellsSteering = steerT45.length
    metrics.reactiveCellsSelecting = reactiveSelect.length
    metrics.reactiveCellsSteering = reactiveSteer.length
    metrics.reactiveTwoStageLeads = twoStage.length
    metrics.dCellsWithStep = oneLayout.length
    metrics.dCellsWithStepL3 = oneLayout3.length
    metrics.dStepsL2 = dRows.reduce((n, r) => n + r.d.steps[2]!, 0)
    metrics.dStepsL3 = dRows.reduce((n, r) => n + r.d.steps[3]!, 0)
    metrics.blindSteeringReads = blindSteer
    metrics.blindAdaptiveSteps = blindSteps
    metrics.spaceFramesCompared = spaceFramesCompared
    metrics.spaceMismatches = spaceMismatches
    metrics.examplesReplayed = replayed
    metrics.sourceFilesScanned = files.length
    metrics.failures = failures.length
    control.corruptionsRefused = refused
    control.corruptionsTried = replayed
    control.digestsMatched = digestsMatched

    const aTable = aRows
      .filter(r => r.a.maxLevels >= 2)
      .map(r => `${r.cell.label} ${r.a.maxLevels}`)
      .join(', ')
    const aExample = (() => {
      const best = [...aRows].sort((x, y) => y.a.maxLevels - x.a.maxLevels)[0]!
      const e = best.a.example

      if (e === null) {
        return 'none'
      }

      const tuple = (v: number) => TUPLES2[v]!.join('')

      return `${best.cell.label}: ${describeLine(e.layout, ['a', 'b', 'sA1', 'sA2', 'sB1', 'sB2'])}, ${e.levels} levels, codes A ${e.codes.codeA.map(tuple).join(' ')} B ${e.codes.codeB.map(tuple).join(' ')}, read window cell ${e.cell - (e.layout.start + 2 * LINE_ROUNDS + 2)} at round ${e.round}`
    })()
    const dExample = (() => {
      const row = dRows.find(r => r.d.example !== null)

      if (row === undefined) {
        return 'none'
      }

      const e = row.d.example!

      return `${row.cell.label}: ${describeLine(e.layout, ['a', 'b', 'sA', 'sB', 'P', 'Q'])}, ${e.step.levels} levels, codes A ${e.step.codeA.map(t => t - 1).join(',')} B ${e.step.codeB.map(t => t - 1).join(',')}, winner u -> ${behaviourName(Math.floor(e.step.pattern / 8))}, winner v -> ${behaviourName(e.step.pattern % 8)}, read window cell ${e.cell - (e.layout.start + 2 * LINE_ROUNDS + 2)} at round ${e.round}`
    })()
    const cExample = (() => {
      const row = cLine.find(r => r.cell.kind === 'reactive' && r.c.example !== null)

      if (row === undefined) {
        return 'none'
      }

      const e = row.c.example!

      return `${row.cell.label}: ${describeLine(e.layout, ['c', 'P', 'Q'])}, c = u -> ${behaviourName(e.bu)}, c = v -> ${behaviourName(e.bv)}, read window cell ${e.cell - (e.layout.start + 2 * LINE_ROUNDS + 2)} at round ${e.round}`
    })()
    const ok = failures.length === 0
    const multiVerdict =
      aFour.length > 0
        ? `a construction lead: ${aFour.length} cells select four or more levels from two-trit scores (best ${metrics.aBestLevels})`
        : `a bounded absence: no cell selects four levels from two-trit scores at width ${A_WIDTH} (best ${metrics.aBestLevels})`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `intelligence level 6, slice 2: with each candidate's score written into two cells, ${multiVerdict}, in ${metrics.aCellsAtLeast3} cells three or more; Lemma K (a selector whose read sees a values of A's score and b of B's orders at most min(a + b - 1, 2a, 2b) levels, any rule, graph and schedule; checked by exact backtracking for a, b to 4) makes three levels per score cell the ceiling of every occupancy-blind cell on every graph and bounds two cells by 7 there and 17 elsewhere; Lemma P holds for any number of score cells (0 selectors in the 18 T0, T3, T4, T5 cells, line and tilings); on matched coset tilings {3,6}/{3,7} and {4,4}/{4,5}, both color orders, the best one-trit selector reaches ${metrics.bBestLevels} levels, T2 reaches three levels in ${t2TilingThree.length} of 3 cells, and ${alwaysDiffer.length} cells differ between flat and hyperbolic in both pairs and both orders; adaptation: no species cell can adapt on any graph (Lemma X: T0 to T3 never steer, ${blindSteer} steering reads found, and T4, T5 never select), while ${reactiveSteer.length} of 32 reactive cells steer and ${twoStage.length} both select and steer (a two-stage lead with an unbuilt carrier), and ${oneLayout.length} cells hold a one-layout adaptive step at width ${D_WIDTH} (${oneLayout3.length} at three levels); every kept example replays under the reference runners (the corruption check, ${refused} of ${replayed} refused, is a checker check only), and every single code change of every kept selector gets the same verdict from the census's runner and the reference (${single.changes} changes, ${single.changes - single.stillValid} refused, ${single.stillValid} still selectors, ${single.disagree} disagreements)`,
      metrics,
      control,
      notes: `L2. A: cells with a selector, largest level count: ${aTable || 'none'}; histogram ${JSON.stringify(aHistogram)}; best example ${aExample}. B: ${spaceTable}. Matched pairs: ${pairsCompared.join('; ')}${alwaysDiffer.length > 0 ? `; differ everywhere: ${alwaysDiffer.map(c => c.label).join(', ')}` : ''}. C: steering cells on the line ${cells.filter(c => cOf(c).steering > 0).map(c => `${c.label} ${cOf(c).steering} (mux ${cOf(c).mux}, w${cOf(c).minWidth})`).join(', ') || 'none'}; on the tilings ${cells.filter(c => cSpaceSteer(c) > 0).map(c => `${c.label} ${cSpaceSteer(c)}`).join(', ') || 'none'}; T4/T5 cells that steer: ${steerT45.map(c => c.label).join(', ') || 'none'}; example ${cExample}. D: ${oneLayout.map(c => `${c.label} L2 ${dOf(c).steps[2]} L3 ${dOf(c).steps[3]}`).join(', ') || 'none'}; example ${dExample}. Two-stage reactive leads: ${twoStage.map(c => c.label).join(', ') || 'none'}. Bounds: A width ${A_WIDTH} (${metrics.aLayoutsPerCell} layouts, ${metrics.aRuns} runs), cap ${A_CAP}; B radius-1 balls, reads to ${SPACE_ROUNDS}, cap ${B_CAP}; C line widths ${C_MIN_WIDTH} to ${C_MAX_WIDTH}; D width ${D_WIDTH}, levels ${D_LEVELS.join(' and ')}. Not run: width 7 with two-trit scores, {6,3}/{6,4}, two-trit scores on the tilings (M3), a carrier, metered rounds, held-out Q. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
