// Intelligence level 6, slice 4:
// the carrier between selecting and steering, and an improve loop whose proposer adapts only through the mesh. In the
// first reactive cell (census order) with a tie-holding three-level selector and a mux, one adaptive proposer step is
// one metered solve: the selector's 32 runs pick the incumbent's or the child's content (genome word and tag), the read
// tag is carried into the control cell of 5 mux runs, and the mux reads the next lead (the child's edit when it won,
// the old lead when it lost). The lead proposer tries the lead edit first and hears nothing else. Every run names the
// cell's background; the judge checks it on every metered entry and recomputes every digest with meshRunDigest.
//
// Algebra: spin-1 tones for the steps, puzzle labels for family A. Regime: pure. Schedule: the brick line.
//
// Gates, fixed before the first run (slice 4), each able to fail:
// - G1 a reactive cell is found; under lineBrickRun and meshLineRun (frame for frame, on the background) the selector
//   reads the better content on every strictly ordered input and A on every tie, the mux copies P at B's tag and Q at A's.
// - G2 every step of the adaptive and reactive-fixed arms is mesh-realized and keeps the chain; 0 carrier failures.
// - G3 the smuggler: 0 metered runs and external on every step, same choices and leads as the adaptive arm.
// - G4 forged-carrier refused where the true tag is A's, realized elsewhere; forged-scores refused where its tones
//   differ from the evaluator's, realized elsewhere.
// - G5 the knockout: every step metered under id.ABC.id on the background and recomputed, solved or not.
// - G6 fixed-external reproduces E-CMP-0031 (6/52, 0.905); t1-mesh reproduces E-CMP-0078 (2 of 60, held-out 0.822).
// - G7 0 held-out grades during the loops, valid finals, a fresh-judge rerun of the adaptive arm gives the same digest,
//   no random or clock source.
// - G8 the lead proposer with the lead pinned to none gives exactly the reactive-fixed arm's digest.
//
// Changed after an audit, each disclosed:
// - the scale is fitted on 'validation-overlap', the validation fit reported beside it;
// - the lead proposer runs isolated and hears only the genome and the lead; the face hands the loop no grade;
// - G5 also fails when the knockout changes no step's reads or adopts as many children as the adaptive arm, and a
//   planted knockout under the cell's own rule must fail that gate;
// - the external arms: the same loop decided outside the mesh by the face's levels under five tie patterns,
//   A/A/A the rule fixed before the first run and the layout's pattern the external win-stay arm, reported;
// - the step-fitting forger (0037) is refused on every replay that a pre-0037 judge would have accepted.

import { resolve } from 'node:path'
import { splitCell } from '@/code/compute/lab/counter'
import { gateRule, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import { EXHAUSTIVE_GENOME, SEED_GENOME, copyGenome, genomeKey, validateGenome, type IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Evaluation } from '@/code/intelligence/improve/evaluation'
import { improveEpisodes, type Episode } from '@/code/intelligence/improve/improve'
import { fitLegacyStep, legacyDigest, legacyKeyHash } from '@/code/intelligence/control/mesh-step-forger'
import { genomeJudge, type GenomeJudge } from '@/code/intelligence/improve/judge/genome-judge'
import { sandboxedLeadProposer, type SandboxedLeadProposer } from '@/code/intelligence/improve/judge/lead-session'
import { sandboxedMetaLearner } from '@/code/intelligence/improve/judge/meta-session'
import { EDITS } from '@/code/intelligence/improve/meta-learner'
import {
  LEAD_BITS,
  LEAD_NONE,
  STEP_CONTENT_TRITS,
  adaptiveDigest,
  adaptiveEpisodes,
  bitsOf,
  editIndex,
  toneWord,
  type AdaptiveEpisode,
  type AdaptiveFace,
  type Excitations,
  type LeadProposer,
} from '@/code/intelligence/improve/mesh/adaptive-loop'
import { findMux, findTieSelector, type MuxLayout, type TieSelector } from '@/code/intelligence/improve/mesh/adaptive-layouts'
import { SELECT_STEP, STEER_STEP, WRITES, stepKey, type StepArgs, type StepInstance, type StepLayout } from '@/code/intelligence/improve/mesh/adaptive-step'
import { meshDigest, meshImproveEpisodes, type MeshSelectionFace } from '@/code/intelligence/improve/mesh/mesh-loop'
import { encodeGenome } from '@/code/intelligence/improve/mesh/content-code'
import {
  CODE_A as T1_CODE_A,
  CODE_B as T1_CODE_B,
  SELECT_LAYOUT as T1_LAYOUT,
  SELECT_RULE as T1_RULE,
  SELECT_STEP as T1_STEP,
  WRITE_MINUS as T1_WRITE_MINUS,
  WRITE_PLUS as T1_WRITE_PLUS,
  selectionKey,
  type SelectionInstance,
} from '@/code/intelligence/improve/mesh/select-solver'
import type { Operator } from '@/code/intelligence/operator/operator'
import {
  callTotal,
  candidate,
  evaluate,
  heldOutGraded,
  meshFrameHash,
  meshLineLength,
  meshLineRun,
  registerPrimitives,
  type CandidateSpec,
  type Grade,
  type MeshLayoutMeter,
  type MeshLayoutSpec,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { pairRuleCensus, pairRulesFromFibers } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

// ---- parameters, fixed before the first run ----

const ROUNDS = 4
const PROPOSALS = 3
const LEVELS = 3
const CENSUS_ROUNDS = 8
const SELECT_WIDTHS = [4, 6] as const
const MUX_WIDTHS = [3, 7] as const
const IDENTITY_RULE = 'id.ABC.id'
const META = 'code/intelligence/improve/meta-learner'
const STEPS = 'code/intelligence/improve/mesh/adaptive-step'
const LOOP = 'code/intelligence/improve/mesh/adaptive-loop'
const FORGER = 'code/intelligence/control/mesh-step-forger'
// the step-fitting forger is replayed on the first this many adaptive steps; fixed with the control
const FORGED_STEP_REPLAYS = 8
const T1_SELECTORS = 'code/intelligence/improve/mesh/select-solver'
const CENSUS_PAD = 2 * CENSUS_ROUNDS + 2
// the tie patterns the external arms run (the audit's probe): ties at levels 0/1/2 to A or B
const TIE_PATTERNS = ['A/B/A', 'A/A/A', 'B/B/B', 'A/A/B', 'B/A/A'] as const
const PRE_FIXED_PATTERN = 'A/A/A'

function variant(change: (genome: IntelligenceGenome) => void): IntelligenceGenome {
  const genome = copyGenome(SEED_GENOME, 0)

  change(genome)

  return genome
}

/** E-CMP-0031's seeds, in its order (copied: an experiment never imports another) */
const SEEDS: readonly [string, IntelligenceGenome][] = [
  ['a-star-hop', SEED_GENOME],
  [
    'a-star-learned-16',
    variant(g => {
      g.search.heuristic = 'learned'
      g.learning.strategy = 'value-table'
      g.learning.experiences = 16
    }),
  ],
  [
    'a-star-hop-library',
    variant(g => {
      g.operators.library = 'discovered'
      g.operators.limit = 12
    }),
  ],
  [
    'ida-hop',
    variant(g => {
      g.search.strategy = 'iterative-deepening'
    }),
  ],
  [
    'a-star-learned-32-library',
    variant(g => {
      g.search.heuristic = 'learned'
      g.learning.strategy = 'value-table'
      g.learning.experiences = 32
      g.operators.library = 'discovered'
      g.operators.limit = 6
    }),
  ],
  ['exhaustive', EXHAUSTIVE_GENOME],
]

// ---- the rules, as the evaluator and the judge hold them ----

const FIBERS = new Map(pairRulesFromFibers().map(rule => [rule.name, rule]))

function gateOf(name: string): GateRule {
  const rule = FIBERS.get(name)

  if (rule === undefined) {
    throw new Error(`mesh-adaptive-loop: no pair rule ${name}`)
  }

  return gateRule(rule.name, rule.table)
}

const tableOf = (name: string): Int8Array => Int8Array.from(FIBERS.get(name)!.table)

/** The judge's own run of one word (lineBrickRun), its read and its final frame hash. */
function judgeRun(rule: string, layout: MeshLayoutSpec, word: readonly number[]): { value: number; frameHash: number; frames: Int8Array[] } {
  const window = layout.window.slice()

  layout.inputs.forEach((offset, j) => {
    window[offset] = word[j]!
  })

  const run = lineBrickRun({ rule: gateOf(rule), background: layout.background ?? 0, start: layout.start, window, rounds: layout.readRound })
  const frame = run.frames[layout.readRound]!

  return { value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length), frames: run.frames }
}

const sameLayout = (a: MeshLayoutSpec, b: MeshLayoutSpec): boolean =>
  a.start === b.start &&
  a.readPosition === b.readPosition &&
  a.readRound === b.readRound &&
  a.window.join(',') === b.window.join(',') &&
  a.inputs.join(',') === b.inputs.join(',')

// ---- the cell ----

interface Cell {
  name: string
  background: number
  ex: Excitations
  selector: TieSelector
  mux: MuxLayout
  select: StepLayout
  steer: StepLayout
  tagA: number
  tagB: number
}

function selectLayoutOf(s: TieSelector, background: number): StepLayout {
  const at = s.skeleton.at

  return {
    start: s.skeleton.start,
    window: [...s.skeleton.constants],
    inputs: [at.contentA, at.contentB, at.scoreA, at.scoreB],
    readPosition: s.cell - CENSUS_PAD,
    readRound: s.round,
    background,
  }
}

function steerLayoutOf(m: MuxLayout, background: number): StepLayout {
  return { start: m.start, window: [...m.constants], inputs: [...m.at], readPosition: m.cell - CENSUS_PAD, readRound: m.round, background }
}

// ---- the step problem (evaluator side) ----

const writeOperator = (id: string, tone: number): Operator<StepInstance> => ({
  id,
  applicable: state => state.out.length < state.a.length + state.q.length,
  apply: state => ({ ...state, out: [...state.out, tone] }),
  cost: () => 1,
})

const STEP_OPERATORS = registerPrimitives([-1, 0, 1].map(t => writeOperator(WRITES[t]!, t)))

function stepProblem(id: string, instance: StepInstance): Problem<StepInstance> {
  const n = instance.a.length
  const total = n + instance.q.length
  const a = instance.a.join(',')
  const b = instance.b.join(',')

  return {
    id,
    regime: 'pure',
    initial: instance,
    goal: state => {
      if (state.out.length !== total) {
        return false
      }

      const head = state.out.slice(0, n).join(',')

      return head === a || head === b
    },
    distance: () => 0,
    budget: { steps: total, expansions: 4 * total + 8, memoryBytes: 1_000_000 },
    key: stepKey,
    links: () => null,
    bytes: state => 2 * stepKey(state).length,
  }
}

// the T1 selection problem, as E-CMP-0078 poses it
const t1Write = (id: string, tone: number): Operator<SelectionInstance> => ({
  id,
  applicable: state => state.out.length < state.a.length,
  apply: state => ({ ...state, out: [...state.out, tone] }),
  cost: () => 1,
})

const T1_OPERATORS = registerPrimitives([t1Write(T1_WRITE_MINUS, -1), t1Write(T1_WRITE_PLUS, 1)])

function t1Problem(id: string, instance: SelectionInstance): Problem<SelectionInstance> {
  const n = instance.a.length
  const a = instance.a.join(',')
  const b = instance.b.join(',')

  return {
    id,
    regime: 'pure',
    initial: instance,
    goal: state => state.out.length === n && (state.out.join(',') === a || state.out.join(',') === b),
    distance: () => 0,
    budget: { steps: n, expansions: 4 * n + 8, memoryBytes: 1_000_000 },
    key: selectionKey,
    links: () => null,
    bytes: state => 2 * selectionKey(state).length,
  }
}

// ---- provenance (from the meter and the instance alone) ----

interface Provenance {
  realized: boolean
  reason: string
  reads: number[]
  runs: number
  rounds: number
  pairUpdates: number
  backgroundsChecked: number
}

function checkEntry(
  entry: MeshLayoutMeter | undefined,
  rule: string,
  layout: MeshLayoutSpec,
  runs: number,
  digest: number,
  label: string,
): string {
  if (entry === undefined) {
    return `${label}: no metered entry`
  }

  if (entry.rule !== rule || !sameLayout(entry.layout, layout)) {
    return `${label}: metered ${entry.rule} on another layout`
  }

  // the background is checked on every metered entry, never assumed
  if (entry.layout.background !== (layout.background ?? 0)) {
    return `${label}: metered on background ${String(entry.layout.background)}, not ${layout.background ?? 0}`
  }

  if (entry.runs !== runs || entry.rounds !== runs * layout.readRound || entry.requests !== 1) {
    return `${label}: metered ${entry.runs} runs, ${entry.rounds} rounds, ${entry.requests} requests`
  }

  if (entry.frameDigest !== digest) {
    return `${label}: metered digest ${entry.frameDigest}, recomputed ${digest}`
  }

  return ''
}

function stepProvenance(grade: Grade<StepInstance>, instance: StepInstance, rule: string, cell: Cell, steer: boolean, requireSolved: boolean): Provenance {
  const hash = meshKeyHash(stepKey(instance))
  const n = instance.a.length
  const m = steer ? instance.p.length : 0
  const reads: number[] = []
  const select: MeshDigestRun[] = []

  for (let k = 0; k < n; k++) {
    const word = [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB]
    const run = judgeRun(rule, cell.select, word)

    reads.push(run.value)
    select.push({ keyHash: hash, word, frameHash: run.frameHash, value: run.value })
  }

  const tag = reads[n - 1]!
  const steerRuns: MeshDigestRun[] = []

  for (let j = 0; j < m; j++) {
    const word = [tag, instance.p[j]!, instance.q[j]!]
    const run = judgeRun(rule, cell.steer, word)

    reads.push(run.value)
    steerRuns.push({ keyHash: hash, word, frameHash: run.frameHash, value: run.value })
  }

  // one request per stage, the chain seeded by the rule and whole layout, binding step, trit order and words
  const digest1 = meshChain(rule, cell.select).fold(SELECT_STEP, select)
  const digest2 = m > 0 ? meshChain(rule, cell.steer).fold(STEER_STEP, steerRuns) : 0

  const layouts = grade.mesh.layouts
  const out = grade.solution.states[grade.solution.states.length - 1]?.out ?? []
  const metered = {
    runs: layouts.reduce((s, e) => s + e.runs, 0),
    rounds: layouts.reduce((s, e) => s + e.rounds, 0),
    pairUpdates: layouts.reduce((s, e) => s + e.pairUpdates, 0),
  }

  let reason = ''

  if (grade.violations.length > 0 || (requireSolved && !grade.solved)) {
    reason = `not a clean solve: ${grade.violations[0] ?? 'unsolved'}`
  } else if (layouts.length !== (steer ? 2 : 1)) {
    reason = `${layouts.length} metered layouts`
  } else {
    reason = checkEntry(layouts[0], rule, cell.select, n, digest1, 'select')

    if (reason === '' && steer) {
      reason = checkEntry(layouts[1], rule, cell.steer, m, digest2, 'steer')
    }

    if (reason === '' && out.join(',') !== reads.join(',')) {
      reason = 'the output is not the recomputed reads'
    }
  }

  return { realized: reason === '', reason, reads, ...metered, backgroundsChecked: layouts.length }
}

/** The judge's reads of one adaptive step's instance under `rule` (select, then steer on its own tag read). */
function replayReads(instance: StepInstance, rule: string, cell: Cell): number[] {
  const n = instance.a.length
  const reads = Array.from({ length: n }, (_, k) => judgeRun(rule, cell.select, [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB]).value)
  const tag = reads[n - 1]!

  for (let j = 0; j < instance.p.length; j++) {
    reads.push(judgeRun(rule, cell.steer, [tag, instance.p[j]!, instance.q[j]!]).value)
  }

  return reads
}

function t1Provenance(grade: Grade<SelectionInstance>, instance: SelectionInstance): Provenance {
  const hash = meshKeyHash(selectionKey(instance))
  const reads: number[] = []
  const request: MeshDigestRun[] = []

  for (let k = 0; k < instance.a.length; k++) {
    const word = [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB]
    const run = judgeRun(T1_RULE, T1_LAYOUT, word)

    reads.push(run.value)
    request.push({ keyHash: hash, word, frameHash: run.frameHash, value: run.value })
  }

  const digest = meshChain(T1_RULE, { ...T1_LAYOUT, background: 0 }).fold(T1_STEP, request)

  const layouts = grade.mesh.layouts
  const out = grade.solution.states[grade.solution.states.length - 1]?.out ?? []
  const entry = layouts[0]

  let reason = ''

  if (grade.violations.length > 0 || !grade.solved) {
    reason = `not a clean solve: ${grade.violations[0] ?? 'unsolved'}`
  } else if (layouts.length !== 1) {
    reason = `${layouts.length} metered layouts`
  } else {
    reason = checkEntry(entry, T1_RULE, { ...T1_LAYOUT, background: 0 }, instance.a.length, digest, 'select')

    if (reason === '' && out.join(',') !== reads.join(',')) {
      reason = 'the output is not the recomputed reads'
    }
  }

  return {
    realized: reason === '',
    reason,
    reads,
    runs: entry?.runs ?? 0,
    rounds: entry?.rounds ?? 0,
    pairUpdates: entry?.pairUpdates ?? 0,
    backgroundsChecked: layouts.length,
  }
}

// ---- the scale ----

interface Scale {
  t1: number
  t2: number
  graded: number
  nonViolating: number
}

/**
 * The tertiles of Q over the seeds and their one-edit children, on `split`. As fixed before the
 * first run the split was 'validation', the one the loop grades, so the cut points sat on the children's own values.
 * Now the scale is fitted on 'validation-overlap': the same genomes on the validation starts
 * inside the taught tables, problems the loop never grades. The validation-fitted scale is reported beside it.
 */
function scaleOf(judge: GenomeJudge, split: 'validation' | 'validation-overlap'): Scale {
  const genomes = new Map<string, IntelligenceGenome>()

  for (const [, seed] of SEEDS) {
    genomes.set(genomeKey(seed), seed)

    for (const e of EDITS) {
      const child = e.apply(seed)

      if (child !== null && validateGenome(child).length === 0) {
        genomes.set(genomeKey(child), child)
      }
    }
  }

  const qs: number[] = []

  for (const genome of genomes.values()) {
    const evaluation = judge.evaluate(genome, split)

    if (evaluation.violations === 0) {
      qs.push(evaluation.meanQ)
    }
  }

  qs.sort((x, y) => x - y)

  const n = qs.length

  if (n < 3) {
    throw new Error('mesh-adaptive-loop: the neighbourhood has fewer than three graded genomes')
  }

  return { t1: qs[Math.floor(n / 3)]!, t2: qs[Math.floor((2 * n) / 3)]!, graded: genomes.size, nonViolating: n }
}

function newLevel(evaluation: Evaluation, scale: Scale): number {
  if (evaluation.violations > 0 || evaluation.meanQ < scale.t1) {
    return 0
  }

  return evaluation.meanQ < scale.t2 ? 1 : 2
}

function oldLevel(evaluation: Evaluation, seedQ: number): number {
  if (evaluation.violations > 0 || evaluation.meanQ < 1) {
    return 0
  }

  return evaluation.meanQ < seedQ ? 1 : 2
}

// ---- faces ----

interface StepRecord {
  instance: StepInstance
  edit: string
  levelA: number
  levelB: number
  chosenChild: boolean
  verdictChild: boolean
  provenance: Provenance
  operatorCalls: number
}

function stepArgs(cell: Cell, rule: string, steer: boolean, mode: StepArgs['mode'], id: string): StepArgs {
  return {
    id,
    rule,
    select: cell.select,
    steer: steer ? cell.steer : null,
    mode,
    routesB: [...cell.selector.routesB],
    copyPAt: cell.tagB,
    forged: { scoreA: cell.selector.codeA[0]!, scoreB: cell.selector.codeB[LEVELS - 1]! },
  }
}

function stepFace(
  judge: GenomeJudge,
  scale: Scale,
  cell: Cell,
  spec: CandidateSpec,
  rule: string,
  steer: boolean,
  requireSolved: boolean,
  log: StepRecord[],
  asked: Set<string>,
): AdaptiveFace {
  return {
    evaluate(genome) {
      // the evaluator grades it; the loop is told nothing
      asked.add(genomeKey(genome))
      judge.evaluate(genome, 'validation')
    },
    step(incumbent, challenger, edit, lead) {
      const a = judge.evaluate(incumbent, 'validation')
      const b = judge.evaluate(challenger, 'validation')
      const levelA = newLevel(a, scale)
      const levelB = newLevel(b, scale)
      const instance: StepInstance = {
        a: [...toneWord(incumbent, cell.ex), cell.tagA],
        b: [...toneWord(challenger, cell.ex), cell.tagB],
        scoreA: cell.selector.codeA[levelA]!,
        scoreB: cell.selector.codeB[levelB]!,
        p: steer ? bitsOf(editIndex(edit), LEAD_BITS, cell.ex) : [],
        q: steer ? [...lead] : [],
        out: [],
      }
      const grade = evaluate(spec, stepProblem(`step-${log.length}`, instance), STEP_OPERATORS)
      const last = grade.solution.states[grade.solution.states.length - 1]
      const word = grade.pathValid && last !== undefined ? last.out.slice() : null

      log.push({
        instance,
        edit,
        levelA,
        levelB,
        chosenChild: word !== null && word.slice(0, STEP_CONTENT_TRITS).join(',') === instance.b.join(','),
        verdictChild: judge.verdict(b, a).accepted,
        provenance: stepProvenance(grade, instance, rule, cell, steer, requireSolved),
        operatorCalls: callTotal(grade.elementary),
      })

      return word
    },
  }
}

interface TieRecord { levelA: number; levelB: number; chosenChild: boolean }

/**
 * The external arm (a control): the step decided
 * OUTSIDE the mesh, by the face's own levels on the same scale: the child wins on a strictly higher level, and on a tie
 * at level l iff `tieB[l]`. The lead is win-stay: the child's edit when it won, the old lead when not. No run, no
 * selector. With tieB the layout's pattern, this is the external win-stay arm the mesh arm is compared against.
 */
function externalTieFace(judge: GenomeJudge, scale: Scale, cell: Cell, tieB: readonly boolean[], steer: boolean, log: TieRecord[], asked: Set<string>): AdaptiveFace {
  return {
    evaluate(genome) {
      asked.add(genomeKey(genome))
      judge.evaluate(genome, 'validation')
    },
    step(incumbent, challenger, edit, lead) {
      const levelA = newLevel(judge.evaluate(incumbent, 'validation'), scale)
      const levelB = newLevel(judge.evaluate(challenger, 'validation'), scale)
      const child = levelB > levelA || (levelA === levelB && tieB[levelA] === true)

      log.push({ levelA, levelB, chosenChild: child })

      const content = child ? [...toneWord(challenger, cell.ex), cell.tagB] : [...toneWord(incumbent, cell.ex), cell.tagA]

      return steer ? [...content, ...(child ? bitsOf(editIndex(edit), LEAD_BITS, cell.ex) : [...lead])] : content
    },
  }
}

interface T1Record {
  instance: SelectionInstance
  levelA: number
  levelB: number
  chosenChild: boolean
  verdictChild: boolean
  provenance: Provenance
  operatorCalls: number
}

function t1Face(judge: GenomeJudge, level: (e: Evaluation) => number, log: T1Record[], asked: Set<string>): MeshSelectionFace {
  const spec = candidate(T1_SELECTORS, 'meshSelector')

  return {
    evaluate(genome) {
      asked.add(genomeKey(genome))

      return judge.evaluate(genome, 'validation')
    },
    select(incumbent, challenger) {
      const a = judge.evaluate(incumbent, 'validation')
      const b = judge.evaluate(challenger, 'validation')
      const levelA = level(a)
      const levelB = level(b)
      const instance: SelectionInstance = {
        a: encodeGenome(incumbent),
        b: encodeGenome(challenger),
        scoreA: T1_CODE_A[levelA]!,
        scoreB: T1_CODE_B[levelB]!,
        out: [],
      }
      const grade = evaluate(spec, t1Problem(`t1-${log.length}`, instance), T1_OPERATORS)
      const last = grade.solution.states[grade.solution.states.length - 1]
      const word = grade.pathValid && last !== undefined ? last.out.slice() : null

      log.push({
        instance,
        levelA,
        levelB,
        chosenChild: word !== null && word.join(',') === instance.b.join(','),
        verdictChild: judge.verdict(b, a).accepted,
        provenance: t1Provenance(grade, instance),
        operatorCalls: callTotal(grade.elementary),
      })

      return word
    },
  }
}

// ---- arms ----

interface ArmReport {
  name: string
  finals: IntelligenceGenome[]
  finalValidationQ: number[]
  finalTestQ: number[]
  proposals: number
  chosen: number
  evaluated: number
  carrierFailures: number
  digest: string
  leadFirst: number
  leadChanges: number
}

const mean = (values: readonly number[]): number => (values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length)
const fixed = (value: number, digits = 3): number => Number(value.toFixed(digits))

/**
 * E-CMP-0031's fixed-order proposer, isolated. The meta-learner protocol hands it the parent's validation grade (as in
 * E-CMP-0031); with learns: false it never reads it.
 */
function fixedAdapter(judge: GenomeJudge): LeadProposer & { close: () => void } {
  const meta = sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns: false, proposals: PROPOSALS }))

  return { id: 'fixed-order-proposer', propose: genome => meta.propose(genome, judge.evaluate(genome, 'validation')), close: () => meta.close() }
}

/** The lead proposer, isolated: it is told the parent genome and the lead, nothing else. */
function leadAdapter(cell: Cell, pinNone: boolean): SandboxedLeadProposer {
  return sandboxedLeadProposer(candidate(LOOP, 'leadProposerCandidate', { proposals: PROPOSALS, ex: [...cell.ex], pinNone }))
}

function summarize(name: string, judge: GenomeJudge, episodes: readonly AdaptiveEpisode[], evaluated: number, leadFirst: number): ArmReport {
  const finals = episodes.map(e => e.rounds[e.rounds.length - 1]!.best)
  const all = episodes.flatMap(e => e.rounds.flatMap(r => r.proposals))

  let leadChanges = 0

  for (let i = 1; i < all.length; i++) {
    if (all[i]!.lead !== all[i - 1]!.lead) {
      leadChanges++
    }
  }

  return {
    name,
    finals,
    finalValidationQ: finals.map(g => judge.evaluate(g, 'validation').meanQ),
    finalTestQ: [],
    proposals: all.length,
    chosen: all.filter(p => p.chosen).length,
    evaluated,
    carrierFailures: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.carrierFailures, 0), 0),
    digest: adaptiveDigest(episodes),
    leadFirst,
    leadChanges,
  }
}

/** An external tie-pattern arm: the lead or the pinned proposer, the step decided by `tieB`. */
function externalTieArm(name: string, judge: GenomeJudge, scale: Scale, cell: Cell, tieB: readonly boolean[], steer: boolean, log: TieRecord[]): ArmReport {
  const asked = new Set<string>()
  const proposer = leadAdapter(cell, !steer)
  const episodes = adaptiveEpisodes(
    SEEDS.map(([, seed]) => seed),
    proposer,
    externalTieFace(judge, scale, cell, tieB, steer, log, asked),
    ROUNDS,
    { ex: cell.ex, tagA: cell.tagA, tagB: cell.tagB, steer },
  )
  const leadFirst = proposer.leadFirst()

  proposer.close()

  return summarize(name, judge, episodes, asked.size, leadFirst)
}

function stepArm(input: {
  name: string
  judge: GenomeJudge
  scale: Scale
  cell: Cell
  exportName: string
  mode: StepArgs['mode']
  rule: string
  steer: boolean
  proposer: 'lead' | 'pinned' | 'fixed'
  requireSolved: boolean
  log: StepRecord[]
}): ArmReport {
  const { name, judge, scale, cell, exportName, mode, rule, steer, proposer, requireSolved, log } = input
  const asked = new Set<string>()
  const spec = candidate(STEPS, exportName, stepArgs(cell, rule, steer, mode, `${name}-step`))
  const face = stepFace(judge, scale, cell, spec, rule, steer, requireSolved, log, asked)
  const lead = proposer === 'fixed' ? null : leadAdapter(cell, proposer === 'pinned')
  const fixedOne = proposer === 'fixed' ? fixedAdapter(judge) : null
  const episodes: AdaptiveEpisode[] = adaptiveEpisodes(
    SEEDS.map(([, seed]) => seed),
    (lead ?? fixedOne)!,
    face,
    ROUNDS,
    { ex: cell.ex, tagA: cell.tagA, tagB: cell.tagB, steer },
  )
  const leadFirst = lead?.leadFirst() ?? 0

  fixedOne?.close()
  lead?.close()

  return summarize(name, judge, episodes, asked.size, leadFirst)
}

function t1Arm(name: string, judge: GenomeJudge, level: (e: Evaluation) => number, log: T1Record[]): ArmReport {
  const meta = sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns: false, proposals: PROPOSALS }))
  const asked = new Set<string>()
  const episodes = meshImproveEpisodes(
    SEEDS.map(([, seed]) => seed),
    meta,
    t1Face(judge, level, log, asked),
    ROUNDS,
  )

  meta.close()

  const finals = episodes.map(e => e.rounds[e.rounds.length - 1]!.best)

  return {
    name,
    finals,
    finalValidationQ: finals.map(g => judge.evaluate(g, 'validation').meanQ),
    finalTestQ: [],
    proposals: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.length, 0), 0),
    chosen: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.filter(p => p.chosen).length, 0), 0),
    evaluated: asked.size,
    carrierFailures: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.carrierFailures, 0), 0),
    digest: meshDigest(episodes),
    leadFirst: 0,
    leadChanges: 0,
  }
}

function externalArm(judge: GenomeJudge): ArmReport {
  const meta = sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns: false, proposals: PROPOSALS }))
  const asked = new Set<string>()
  const evaluator = judge.evaluator()
  const episodes: Episode[] = improveEpisodes(
    SEEDS.map(([, seed]) => seed),
    meta,
    {
      evaluate(genome) {
        asked.add(genomeKey(genome))

        return evaluator.evaluate(genome)
      },
      compare: evaluator.compare,
    },
    ROUNDS,
  )

  meta.close()

  const finals = episodes.map(e => e.rounds[e.rounds.length - 1]!.best)

  return {
    name: 'fixed-external',
    finals,
    finalValidationQ: finals.map(g => judge.evaluate(g, 'validation').meanQ),
    finalTestQ: [],
    proposals: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.length, 0), 0),
    chosen: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.filter(p => p.hit).length, 0), 0),
    evaluated: asked.size,
    carrierFailures: 0,
    digest: '',
    leadFirst: 0,
    leadChanges: 0,
  }
}

/** the chain: every P is the child's edit, every Q the previous step's recomputed lead (the sentinel first) */
function chainBreaks(log: readonly StepRecord[], cell: Cell): number {
  let breaks = 0
  let lead = bitsOf(LEAD_NONE, LEAD_BITS, cell.ex)

  for (const r of log) {
    if (r.instance.p.join(',') !== bitsOf(editIndex(r.edit), LEAD_BITS, cell.ex).join(',') || r.instance.q.join(',') !== lead.join(',')) {
      breaks++
    }

    lead = r.provenance.reads.slice(r.instance.a.length)
  }

  return breaks
}

const sumOf = <R extends { provenance: Provenance }>(log: readonly R[], pick: (r: R) => number): number => log.reduce((s, r) => s + pick(r), 0)

export default experiment({
  id: 'intelligence/mesh-adaptive-loop',
  code: 'E-CMP-0090',
  title:
    'intelligence level 6, slice 4: the carrier between selection and steering in a reactive cell and an improve loop whose proposer hears only the mesh: a three-level selector whose ties read one candidate wholesale (none holds ties for the incumbent, Lemma T) and a mux in the first reactive cell that has both, one metered adaptive step per child (32 select runs, the read tag carried into 5 mux runs that read the next lead), every run on the cell background and recomputed by a judge; held-out Q against the same cell select-only with the fixed order, the same loop decided outside the mesh under five tie patterns (the external win-stay arm), the fixed-order loop with external selection, the frozen seeds and E-CMP-0078, with smuggled, forged, step-forged and knockout controls',
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

    // ---- the census of reactive cells and the choice ----
    const census = pairRuleCensus()
    const found: string[] = []

    let reactiveCells = 0
    let withSelector = 0
    let withWholesale = 0
    let withMux = 0
    let censusRuns = 0
    let chosen: Cell | null = null

    for (const r of census.rules) {
      const rule = gateRule(r.name, r.table)

      for (const background of [-1, 0, 1]) {
        if (splitCell(rule, background).kind !== 'reactive') {
          continue
        }

        reactiveCells++

        const ex = [-1, 0, 1].filter(t => t !== background) as unknown as Excitations
        const sel = findTieSelector({ rule, background, minWidth: SELECT_WIDTHS[0], maxWidth: SELECT_WIDTHS[1], rounds: CENSUS_ROUNDS, levels: LEVELS })
        const mux = findMux({ rule, background, minWidth: MUX_WIDTHS[0], maxWidth: MUX_WIDTHS[1], rounds: CENSUS_ROUNDS })

        censusRuns += sel.runs

        if (sel.selector !== null) {
          withSelector++
        }

        if (sel.wholesale !== null) {
          withWholesale++
        }

        if (mux.mux !== null) {
          withMux++
        }

        // after the first run: no cell holds ties for A (Lemma T), so the step takes ties as the layout reads them
        if (sel.wholesale !== null && mux.mux !== null) {
          found.push(`${r.name}/${background}`)

          if (chosen === null && FIBERS.get(r.name)?.table.join(',') === Array.from(r.table).join(',')) {
            const tagB = mux.mux.copyPAt

            chosen = {
              name: r.name,
              background,
              ex,
              selector: sel.wholesale,
              mux: mux.mux,
              select: selectLayoutOf(sel.wholesale, background),
              steer: steerLayoutOf(mux.mux, background),
              tagA: tagB === ex[0] ? ex[1] : ex[0],
              tagB,
            }
          }
        }
      }
    }

    control.reactiveCells = reactiveCells
    // reported, not gated: Lemma T says a tie-holding three-level selector needs both codes to be bijections
    metrics.reactiveTieHoldingSelectors = withSelector
    control.reactiveWholesaleSelectors = withWholesale
    control.reactiveMuxes = withMux
    control.reactiveBoth = found.length
    metrics.censusRuns = censusRuns

    if (reactiveCells !== 32) {
      fail(`G1: ${reactiveCells} reactive cells, not 32`)
    }

    if (chosen === null) {
      fail('G1: no reactive cell has both a three-level selector with wholesale ties and a mux within the bounds (bounded absence)')

      return verdict({
        status: 'fail',
        claim: `bounded absence: no reactive cell has a three-level selector with wholesale ties (widths ${SELECT_WIDTHS.join(' to ')}) and a mux (widths ${MUX_WIDTHS.join(' to ')}); no loop run`,
        metrics,
        control,
        notes: failures.join('; '),
      })
    }

    const cell = chosen

    // ---- G1 the layouts, under the evaluator's table and the judge's runner, on the background ----
    const table = tableOf(cell.name)

    let strictWrong = 0
    let tieWrong = 0
    let muxWrong = 0
    let frameDifferences = 0
    let layoutInputs = 0

    const compare = (layout: StepLayout, word: number[]): number => {
      const cells = new Int8Array(meshLineLength(layout))
      const frames: Int8Array[] = []
      const metered = meshLineRun(table, layout, word, cells, frames)
      const judged = judgeRun(cell.name, layout, word)

      layoutInputs++

      for (let t = 0; t <= layout.readRound; t++) {
        if (frames[t]!.join(',') !== judged.frames[t]!.join(',')) {
          frameDifferences++
        }
      }

      if (metered.value !== judged.value) {
        frameDifferences++
      }

      return judged.value
    }

    // the tie read per level, as the census recorded it (A or B wholesale)
    const tieB = Array.from({ length: LEVELS }, (_, i) => cell.selector.routesB[(cell.selector.codeA[i]! + 1) * 3 + cell.selector.codeB[i]! + 1] === 1)

    for (let levelA = 0; levelA < LEVELS; levelA++) {
      for (let levelB = 0; levelB < LEVELS; levelB++) {
        for (const a of cell.ex) {
          for (const b of cell.ex) {
            const read = compare(cell.select, [a, b, cell.selector.codeA[levelA]!, cell.selector.codeB[levelB]!])

            if (levelA !== levelB) {
              if (read !== (levelA > levelB ? a : b)) {
                strictWrong++
              }
            } else if (read !== (tieB[levelA] ? b : a)) {
              tieWrong++
            }
          }
        }
      }
    }

    for (const c of cell.ex) {
      for (const p of cell.ex) {
        for (const q of cell.ex) {
          if (compare(cell.steer, [c, p, q]) !== (c === cell.tagB ? p : q)) {
            muxWrong++
          }
        }
      }
    }

    control.layoutInputs = layoutInputs
    control.layoutStrictWrong = strictWrong
    control.layoutTieWrong = tieWrong
    control.layoutMuxWrong = muxWrong
    control.layoutFrameDifferences = frameDifferences

    if (strictWrong + tieWrong + muxWrong + frameDifferences > 0 || layoutInputs !== LEVELS * LEVELS * 4 + 8) {
      fail(`G1: selector ${strictWrong} strict and ${tieWrong} tie misreads, mux ${muxWrong}, ${frameDifferences} frames differ`)
    }

    // ---- the evaluator, the scales ----
    const judge = genomeJudge()
    const seedQ = judge.evaluate(SEED_GENOME, 'validation').meanQ
    // fitted on problems the loop never grades; the validation fit of the first runs reported
    const scale = scaleOf(judge, 'validation-overlap')
    const gradedFit = scaleOf(judge, 'validation')

    metrics.scaleT1 = fixed(scale.t1, 4)
    metrics.scaleT2 = fixed(scale.t2, 4)
    metrics.scaleGenomesGraded = scale.graded
    metrics.scaleNonViolating = scale.nonViolating
    metrics.validationFitScaleT1 = fixed(gradedFit.t1, 4)
    metrics.validationFitScaleT2 = fixed(gradedFit.t2, 4)
    metrics.oldScaleSeedQ = fixed(seedQ, 4)

    // ---- the arms ----
    const heldOutBefore = heldOutGraded()
    const external = externalArm(judge)
    const adaptiveLog: StepRecord[] = []
    const adaptive = stepArm({ name: 'adaptive', judge, scale, cell, exportName: 'adaptiveStep', mode: 'mesh', rule: cell.name, steer: true, proposer: 'lead', requireSolved: true, log: adaptiveLog })
    const reactiveLog: StepRecord[] = []
    const reactiveFixed = stepArm({ name: 'reactive-fixed', judge, scale, cell, exportName: 'adaptiveStep', mode: 'mesh', rule: cell.name, steer: false, proposer: 'fixed', requireSolved: true, log: reactiveLog })
    const pinnedLog: StepRecord[] = []
    const pinned = stepArm({ name: 'lead-none', judge, scale, cell, exportName: 'adaptiveStep', mode: 'mesh', rule: cell.name, steer: false, proposer: 'pinned', requireSolved: true, log: pinnedLog })
    const smuggledLog: StepRecord[] = []
    const smuggled = stepArm({ name: 'smuggled', judge, scale, cell, exportName: 'smuggledStep', mode: 'smuggled', rule: cell.name, steer: true, proposer: 'lead', requireSolved: true, log: smuggledLog })
    const knockoutLog: StepRecord[] = []
    const knockout = stepArm({ name: 'knockout', judge, scale, cell, exportName: 'adaptiveStep', mode: 'mesh', rule: IDENTITY_RULE, steer: true, proposer: 'lead', requireSolved: false, log: knockoutLog })
    const t1OldLog: T1Record[] = []
    const t1Old = t1Arm('t1-mesh', judge, e => oldLevel(e, seedQ), t1OldLog)
    const t1NewLog: T1Record[] = []
    const t1New = t1Arm('t1-new-scale', judge, e => newLevel(e, scale), t1NewLog)

    // the step decided outside the mesh by the face's levels under each tie
    // pattern, the lead arm (win-stay) against the pinned (fixed-order) one; A/A/A is the rule fixed before the first run
    const layoutPattern = tieB.map(b => (b ? 'B' : 'A')).join('/')
    const patterns = [layoutPattern, ...TIE_PATTERNS.filter(p => p !== layoutPattern)]
    const tieArmsOn = (on: Scale) =>
      patterns.map(pattern => {
        const ties = pattern.split('/').map(x => x === 'B')
        const leadLog: TieRecord[] = []
        const fixedLog: TieRecord[] = []

        return {
          pattern,
          lead: externalTieArm(`external-${pattern}-lead`, judge, on, cell, ties, true, leadLog),
          fixed: externalTieArm(`external-${pattern}-fixed`, judge, on, cell, ties, false, fixedLog),
          leadLog,
          fixedLog,
        }
      })
    const tieArms = tieArmsOn(scale)
    // the same on the validation-fit scale of the first runs (the audit's case): the external A/B/A arm there reproduces
    // the mesh run the audit reran, so its rows are the relaxed-tie run, reported, never the headline
    const gradedTieArms = tieArmsOn(gradedFit)
    const heldOutDuring = heldOutGraded() - heldOutBefore

    control.heldOutGradesDuringLoops = heldOutDuring

    if (heldOutDuring !== 0) {
      fail(`G7: the loops caused ${heldOutDuring} graded solves of held-out problems`)
    }

    const arms = [adaptive, reactiveFixed, t1New, t1Old, external, knockout, smuggled]

    for (const arm of [...arms, ...[...tieArms, ...gradedTieArms].flatMap(t => [t.lead, t.fixed])]) {
      arm.finalTestQ = arm.finals.map(g => judge.evaluate(g, 'test').meanQ)
    }

    const frozenValidation = SEEDS.map(([, seed]) => judge.evaluate(seed, 'validation').meanQ)
    const frozenTest = SEEDS.map(([, seed]) => judge.evaluate(seed, 'test').meanQ)

    // ---- G2 provenance and the chain ----
    for (const [label, log, arm] of [
      ['adaptive', adaptiveLog, adaptive],
      ['reactive-fixed', reactiveLog, reactiveFixed],
    ] as const) {
      const realized = log.filter(r => r.provenance.realized).length

      control[`${label === 'adaptive' ? 'adaptive' : 'reactiveFixed'}Realized`] = realized
      control[`${label === 'adaptive' ? 'adaptive' : 'reactiveFixed'}Steps`] = log.length
      control[`${label === 'adaptive' ? 'adaptive' : 'reactiveFixed'}CarrierFailures`] = arm.carrierFailures

      if (realized !== log.length || log.length === 0) {
        fail(`G2: ${label} ${realized} of ${log.length} steps mesh-realized (${log.find(r => !r.provenance.realized)?.provenance.reason ?? ''})`)
      }

      if (arm.carrierFailures !== 0) {
        fail(`G2: ${label} ${arm.carrierFailures} carrier failures`)
      }
    }

    const breaks = chainBreaks(adaptiveLog, cell)

    control.adaptiveChainBreaks = breaks
    control.adaptiveBackgroundsChecked = sumOf(adaptiveLog, r => r.provenance.backgroundsChecked)

    if (breaks !== 0) {
      fail(`G2: the adaptive chain breaks ${breaks} times`)
    }

    // ---- G3 the smuggler ----
    const smuggledRuns = sumOf(smuggledLog, r => r.provenance.runs)
    const smuggledExternal = smuggledLog.filter(r => !r.provenance.realized && r.provenance.runs === 0).length
    const smuggledSame = smuggled.digest === adaptive.digest && smuggledLog.length === adaptiveLog.length

    control.smuggledSteps = smuggledLog.length
    control.smuggledMeteredRuns = smuggledRuns
    control.smuggledClassifiedExternal = smuggledExternal
    control.smuggledSameAsAdaptive = smuggledSame ? 1 : 0

    if (smuggledRuns !== 0 || smuggledExternal !== smuggledLog.length || smuggledLog.length === 0 || !smuggledSame) {
      fail(`G3: smuggler ${smuggledRuns} runs, ${smuggledExternal} of ${smuggledLog.length} external, same choices ${smuggledSame}`)
    }

    // ---- G4 the forgers, replayed on every adaptive instance ----
    const forgedCarrierSpec = candidate(STEPS, 'forgedCarrierStep', stepArgs(cell, cell.name, true, 'forged-carrier', 'adaptive-step'))
    const forgedScoresSpec = candidate(STEPS, 'forgedScoresStep', stepArgs(cell, cell.name, true, 'forged-scores', 'adaptive-step'))
    const forged = { carrierRefused: 0, carrierHonest: 0, scoresRefused: 0, scoresHonest: 0, wrong: 0 }

    adaptiveLog.forEach((record, i) => {
      const trueTag = record.provenance.reads[record.instance.a.length - 1]
      const gc = evaluate(forgedCarrierSpec, stepProblem(`forged-carrier-${i}`, record.instance), STEP_OPERATORS)
      const pc = stepProvenance(gc, record.instance, cell.name, cell, true, true)

      if (trueTag === cell.tagB) {
        forged.carrierHonest++
        forged.wrong += pc.realized ? 0 : 1
      } else if (pc.realized) {
        forged.wrong++
      } else {
        forged.carrierRefused++
      }

      const gs = evaluate(forgedScoresSpec, stepProblem(`forged-scores-${i}`, record.instance), STEP_OPERATORS)
      const ps = stepProvenance(gs, record.instance, cell.name, cell, true, true)
      const honest = record.instance.scoreA === cell.selector.codeA[0] && record.instance.scoreB === cell.selector.codeB[LEVELS - 1]

      if (honest) {
        forged.scoresHonest++
        forged.wrong += ps.realized ? 0 : 1
      } else if (ps.realized) {
        forged.wrong++
      } else {
        forged.scoresRefused++
      }
    })

    control.forgedReplayed = adaptiveLog.length
    control.forgedCarrierRefused = forged.carrierRefused
    control.forgedCarrierHonest = forged.carrierHonest
    control.forgedScoresRefused = forged.scoresRefused
    control.forgedScoresHonest = forged.scoresHonest

    if (forged.wrong > 0) {
      fail(`G4: ${forged.wrong} forged steps misclassified`)
    }

    // ---- G5 the knockout ----
    const knockoutRealized = knockoutLog.filter(r => r.provenance.realized).length

    control.knockoutSteps = knockoutLog.length
    control.knockoutRealized = knockoutRealized
    control.knockoutCarrierFailures = knockout.carrierFailures

    if (knockoutRealized !== knockoutLog.length || knockoutLog.length === 0) {
      fail(`G5: knockout ${knockoutRealized} of ${knockoutLog.length} metered and recomputed (${knockoutLog.find(r => !r.provenance.realized)?.provenance.reason ?? ''})`)
    }

    // the knockout must change behavior (the knockout rule). The judge replays every adaptive
    // step's instance under the knockout rule; the gate fails when no step's reads change, or when the knockout adopts
    // exactly as many children as the adaptive arm. The planted control runs the same gate on a knockout that is the
    // cell's own rule (the adaptive arm against itself), which must fail it.
    const behaviour = (rule: string, other: { chosen: number }): { differing: number; passes: boolean } => {
      const differing = adaptiveLog.filter(r => replayReads(r.instance, rule, cell).join(',') !== r.provenance.reads.join(',')).length

      return { differing, passes: differing > 0 && other.chosen !== adaptive.chosen }
    }
    const knockoutBehaviour = behaviour(IDENTITY_RULE, knockout)
    const plantedBehaviour = behaviour(cell.name, adaptive)

    control.knockoutStepsReadsDiffer = knockoutBehaviour.differing
    control.knockoutAdoptions = knockout.chosen
    control.plantedKnockoutStepsReadsDiffer = plantedBehaviour.differing
    control.plantedKnockoutRefusedByGate = plantedBehaviour.passes ? 0 : 1

    if (!knockoutBehaviour.passes) {
      fail(`G5: the knockout changes no behaviour (${knockoutBehaviour.differing} of ${adaptiveLog.length} steps read differently, adoptions ${knockout.chosen} against ${adaptive.chosen})`)
    }

    if (plantedBehaviour.passes) {
      fail('G5: the planted knockout (the cell\'s own rule) passes the behaviour gate, so the gate cannot fail')
    }

    // ---- the step-fitting forger, replayed on the first adaptive steps ----
    // It asks for the select runs on wrong words with the step fitted so the pre-0037 sum equals the judge's target, the
    // steer runs as the honest step does, and writes the honest reads (decided in its own code). A pre-0037 judge would
    // have taken it as mesh-realized; the chain must refuse it.
    const forging = { tried: 0, fitted: 0, legacyAccepted: 0, refused: 0, tries: 0 }
    const frameOf = new Map<string, number>()
    const selectFrame = (word: readonly number[]): number => {
      const key = word.join(',')
      let hash = frameOf.get(key)

      if (hash === undefined) {
        hash = judgeRun(cell.name, cell.select, word).frameHash
        frameOf.set(key, hash)
      }

      return hash
    }
    const allWords = [-1, 0, 1].flatMap(x => [-1, 0, 1].flatMap(y => [-1, 0, 1].flatMap(z => [-1, 0, 1].map(w => [x, y, z, w]))))

    adaptiveLog.slice(0, FORGED_STEP_REPLAYS).forEach((record, i) => {
      const instance = record.instance
      const n = instance.a.length
      const key = stepKey(instance)
      const legacyHash = legacyKeyHash(key)
      const honestWords = Array.from({ length: n }, (_, k) => [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB])
      const target = legacyDigest(honestWords.map(w => ({ keyHash: legacyHash, frameHash: selectFrame(w), step: SELECT_STEP })), cell.background)
      const alternatives = honestWords.map(h => allWords.filter(w => w.join(',') !== h.join(',')).map(w => ({ word: w, frameHash: selectFrame(w) })))

      forging.tried++

      const fit = fitLegacyStep({ keyHash: legacyHash, background: cell.background, target, alternatives, limit: 1_000_000 })

      if (fit === null) {
        return
      }

      forging.fitted++
      forging.tries += fit.tries

      const forgedWords = fit.choice.map((c, k) => alternatives[k]![c]!.word)
      const reads = record.provenance.reads
      const steerWords = Array.from({ length: instance.p.length }, (_, j) => [reads[n - 1]!, instance.p[j]!, instance.q[j]!])
      const spec = candidate(FORGER, 'stepForger', {
        id: 'adaptive-step',
        requests: [
          { rule: cell.name, layout: { ...cell.select }, step: fit.step, words: forgedWords.flat(), arity: 4 },
          { rule: cell.name, layout: { ...cell.steer }, step: STEER_STEP, words: steerWords.flat(), arity: 3 },
        ],
        writes: reads.map(v => WRITES[v]!),
      })
      const grade = evaluate(spec, stepProblem(`forged-step-${i}`, instance), STEP_OPERATORS)
      const judged = stepProvenance(grade, instance, cell.name, cell, true, true)
      const [select, steerEntry] = grade.mesh.layouts
      const out = grade.solution.states[grade.solution.states.length - 1]?.out ?? []
      // every check a pre-0037 judge made, the select digest the pre-0037 sum of the runs the forger asked for
      const legacyOk =
        grade.violations.length === 0 &&
        grade.solved &&
        grade.mesh.layouts.length === 2 &&
        select !== undefined &&
        steerEntry !== undefined &&
        select.rule === cell.name &&
        sameLayout(select.layout, cell.select) &&
        select.layout.background === cell.background &&
        select.runs === n &&
        select.rounds === n * cell.select.readRound &&
        legacyDigest(forgedWords.map(w => ({ keyHash: legacyHash, frameHash: selectFrame(w), step: fit.step })), cell.background) === target &&
        steerEntry.rule === cell.name &&
        sameLayout(steerEntry.layout, cell.steer) &&
        steerEntry.runs === instance.p.length &&
        out.join(',') === reads.join(',')

      forging.legacyAccepted += legacyOk ? 1 : 0
      forging.refused += judged.realized ? 0 : 1
    })

    control.forgedStepTried = forging.tried
    control.forgedStepFitted = forging.fitted
    control.forgedStepFitTries = forging.tries
    control.forgedStepLegacyAccepted = forging.legacyAccepted
    control.forgedStepRefused = forging.refused

    if (forging.tried === 0 || forging.fitted !== forging.tried || forging.legacyAccepted !== forging.fitted || forging.refused !== forging.fitted) {
      fail(`step forger tried ${forging.tried}, fitted ${forging.fitted}, a pre-0037 judge accepts ${forging.legacyAccepted}, refused ${forging.refused}`)
    }

    // ---- G6 reproductions ----
    const t1Realized = [...t1OldLog, ...t1NewLog].filter(r => r.provenance.realized).length

    control.t1Steps = t1OldLog.length + t1NewLog.length
    control.t1Realized = t1Realized

    if (t1Realized !== t1OldLog.length + t1NewLog.length) {
      fail(`G2: ${t1Realized} of ${t1OldLog.length + t1NewLog.length} T1 selections realized (${[...t1OldLog, ...t1NewLog].find(r => !r.provenance.realized)?.provenance.reason ?? ''})`)
    }

    if (external.chosen !== 6 || external.proposals !== 52 || fixed(mean(external.finalValidationQ)) !== 0.905) {
      fail(`G6: external ${external.chosen}/${external.proposals}, mean final Q ${mean(external.finalValidationQ)}, not 6/52 and 0.905`)
    }

    if (t1Old.chosen !== 2 || t1Old.proposals !== 60 || fixed(mean(t1Old.finalTestQ)) !== 0.822) {
      fail(`G6: t1-mesh ${t1Old.chosen}/${t1Old.proposals}, held-out ${mean(t1Old.finalTestQ)}, not E-CMP-0078's 2/60 and 0.822`)
    }

    // ---- G8 the proposer ----
    control.leadNoneSameAsFixed = pinned.digest === reactiveFixed.digest ? 1 : 0

    if (pinned.digest !== reactiveFixed.digest || pinnedLog.length !== reactiveLog.length) {
      fail('G8: the lead proposer pinned to no lead differs from the fixed-order proposer')
    }

    // ---- G7 hygiene ----
    let invalidFinals = 0

    for (const arm of arms) {
      for (const g of arm.finals) {
        if (validateGenome(g).length > 0) {
          invalidFinals++
        }
      }
    }

    control.invalidFinals = invalidFinals

    if (invalidFinals > 0) {
      fail(`G7: ${invalidFinals} invalid finals`)
    }

    const freshJudge = genomeJudge()
    const freshScale = scaleOf(freshJudge, 'validation-overlap')
    const againLog: StepRecord[] = []
    const again = stepArm({ name: 'adaptive', judge: freshJudge, scale: freshScale, cell, exportName: 'adaptiveStep', mode: 'mesh', rule: cell.name, steer: true, proposer: 'lead', requireSolved: true, log: againLog })
    const deterministic =
      again.digest === adaptive.digest &&
      freshScale.t1 === scale.t1 &&
      freshScale.t2 === scale.t2 &&
      againLog.length === adaptiveLog.length &&
      againLog.every((r, i) => r.provenance.realized && r.provenance.reads.join(',') === adaptiveLog[i]!.provenance.reads.join(','))

    metrics.deterministic = deterministic ? 1 : 0

    if (!deterministic) {
      fail('G7: a fresh-judge rerun of the adaptive arm differs')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/mesh-adaptive-loop.ts'])

    metrics.sourceFilesScanned = files.length

    for (const finding of findings) {
      fail(`G7: random number or clock source: ${finding.file}:${finding.line} ${finding.kind}`)
    }

    // ---- reported ----
    for (const arm of arms) {
      const key = arm.name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()).replace(/^t1/, 'tOne')

      metrics[`${key}MeanFinalValidationQ`] = fixed(mean(arm.finalValidationQ))
      metrics[`${key}MeanFinalTestQ`] = fixed(mean(arm.finalTestQ))
      metrics[`${key}Adoptions`] = arm.chosen
      metrics[`${key}Proposals`] = arm.proposals
      metrics[`${key}GenomesEvaluated`] = arm.evaluated
    }

    metrics.frozenMeanValidationQ = fixed(mean(frozenValidation))
    metrics.frozenMeanTestQ = fixed(mean(frozenTest))

    const testOf = (arm: ArmReport): number => mean(arm.finalTestQ)
    const adaptiveTest = testOf(adaptive)
    const word = (x: number, y: number): string => (x > y ? 'above' : x === y ? 'equal to' : 'below')

    metrics.adaptationGainTestQ = fixed(adaptiveTest - testOf(reactiveFixed), 4)
    metrics.adaptiveMinusExternalTestQ = fixed(adaptiveTest - testOf(external), 4)
    metrics.adaptiveMinusFrozenTestQ = fixed(adaptiveTest - mean(frozenTest), 4)
    metrics.adaptiveMinusT1MeshTestQ = fixed(adaptiveTest - testOf(t1Old), 4)
    metrics.adaptiveMinusKnockoutTestQ = fixed(adaptiveTest - testOf(knockout), 4)
    metrics.adaptiveLeadFirstRounds = adaptive.leadFirst
    metrics.adaptiveLeadChanges = adaptive.leadChanges

    const levelsOf = (log: readonly { levelB: number }[]): number[] => [0, 1, 2].map(l => log.filter(r => r.levelB === l).length)
    const adaptiveLevels = levelsOf(adaptiveLog)
    const reactiveLevels = levelsOf(reactiveLog)
    const t1NewLevels = levelsOf(t1NewLog)
    const t1OldLevels = levelsOf(t1OldLog)
    const scaleAvoided = 2 * adaptiveLevels[0]! <= adaptiveLog.length

    metrics.adaptiveChildLevel0 = adaptiveLevels[0]!
    metrics.adaptiveChildLevel1 = adaptiveLevels[1]!
    metrics.adaptiveChildLevel2 = adaptiveLevels[2]!
    metrics.scaleFailureModeAvoided = scaleAvoided ? 1 : 0
    metrics.adaptiveTies = adaptiveLog.filter(r => r.levelA === r.levelB).length
    metrics.adaptiveAgreesWithExternalVerdict = adaptiveLog.filter(r => r.chosenChild === r.verdictChild).length
    metrics.adaptiveMeteredRuns = sumOf(adaptiveLog, r => r.provenance.runs)
    metrics.adaptiveMeteredRounds = sumOf(adaptiveLog, r => r.provenance.rounds)
    metrics.adaptivePairUpdates = sumOf(adaptiveLog, r => r.provenance.pairUpdates)
    metrics.adaptiveOperatorCalls = adaptiveLog.reduce((s, r) => s + r.operatorCalls, 0)
    metrics.reactiveFixedMeteredRuns = sumOf(reactiveLog, r => r.provenance.runs)
    metrics.reactiveFixedMeteredRounds = sumOf(reactiveLog, r => r.provenance.rounds)
    metrics.reactiveFixedPairUpdates = sumOf(reactiveLog, r => r.provenance.pairUpdates)
    metrics.knockoutMeteredRuns = sumOf(knockoutLog, r => r.provenance.runs)
    metrics.tOneMeteredRuns = sumOf([...t1OldLog, ...t1NewLog], r => r.provenance.runs)

    const lines: string[] = []

    SEEDS.forEach(([name], e) => {
      const parts = [adaptive, reactiveFixed, t1New, t1Old, external, knockout].map(
        arm => `${arm.name} ${arm.finalValidationQ[e]!.toFixed(3)}/${arm.finalTestQ[e]!.toFixed(3)} (${genomeKey(arm.finals[e]!)})`,
      )

      lines.push(`${name}: frozen ${frozenValidation[e]!.toFixed(3)}/${frozenTest[e]!.toFixed(3)}; ${parts.join('; ')}`)
    })

    // ---- the tie patterns, and the mesh against the external win-stay arm ----
    const rowsOf = (arms: typeof tieArms, prefix: string) =>
      arms.map(t => {
        const lead = testOf(t.lead)
        const fixedOrder = testOf(t.fixed)
        const row = { pattern: t.pattern, lead, fixedOrder, gain: lead - fixedOrder, leadFirst: t.lead.leadFirst, leadAdoptions: t.lead.chosen, leadProposals: t.lead.proposals, fixedAdoptions: t.fixed.chosen, fixedProposals: t.fixed.proposals }
        const key = t.pattern.replaceAll('/', '')

        metrics[`${prefix}${key}AdaptiveTestQ`] = fixed(lead)
        metrics[`${prefix}${key}FixedOrderTestQ`] = fixed(fixedOrder)
        metrics[`${prefix}${key}GainTestQ`] = fixed(row.gain, 4)
        metrics[`${prefix}${key}LeadReorders`] = row.leadFirst

        return row
      })
    const tieRows = rowsOf(tieArms, 'tie')
    const gradedRows = rowsOf(gradedTieArms, 'validationFitTie')
    const gradedGains = gradedRows.map(r => r.gain)
    const gradedPreFixed = gradedRows.find(r => r.pattern === PRE_FIXED_PATTERN)!
    const gradedLayout = gradedRows[0]!

    metrics.validationFitPreFixedTieRuleGainTestQ = fixed(gradedPreFixed.gain, 4)
    metrics.validationFitLayoutTieRuleGainTestQ = fixed(gradedLayout.gain, 4)
    metrics.validationFitTieGainMin = fixed(Math.min(...gradedGains), 4)
    metrics.validationFitTieGainMax = fixed(Math.max(...gradedGains), 4)

    const preFixed = tieRows.find(r => r.pattern === PRE_FIXED_PATTERN)!
    const layoutRow = tieRows[0]!
    const winStay = tieArms[0]!
    const gains = tieRows.map(r => r.gain)
    const meshDecisionsDiffering =
      winStay.leadLog.length === adaptiveLog.length ? adaptiveLog.filter((r, i) => r.chosenChild !== winStay.leadLog[i]!.chosenChild).length : adaptiveLog.length

    metrics.preFixedTieRuleGainTestQ = fixed(preFixed.gain, 4)
    metrics.layoutTieRuleGainTestQ = fixed(layoutRow.gain, 4)
    metrics.tieGainMin = fixed(Math.min(...gains), 4)
    metrics.tieGainMax = fixed(Math.max(...gains), 4)
    metrics.meshMinusExternalWinStayTestQ = fixed(adaptiveTest - layoutRow.lead, 4)
    metrics.reactiveFixedMinusExternalFixedTestQ = fixed(testOf(reactiveFixed) - layoutRow.fixedOrder, 4)
    metrics.meshDecisionsDifferingFromExternal = meshDecisionsDiffering
    control.externalWinStaySameAsMesh = winStay.lead.digest === adaptive.digest ? 1 : 0
    control.externalFixedSameAsReactiveFixed = winStay.fixed.digest === reactiveFixed.digest ? 1 : 0

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0
    const tableOfRows = (rows: typeof tieRows): string =>
      rows
        .map(r => `${r.pattern}${r.pattern === layoutPattern ? ' (the layout)' : r.pattern === PRE_FIXED_PATTERN ? ' (fixed before the first run)' : ''}: lead ${r.lead.toFixed(3)} (${r.leadAdoptions}/${r.leadProposals} adopted, ${r.leadFirst} reordered), fixed order ${r.fixedOrder.toFixed(3)} (${r.fixedAdoptions}/${r.fixedProposals}), gain ${r.gain.toFixed(4)}`)
        .join('; ')
    const tieTable = `on the overlap-fit scale: ${tableOfRows(tieRows)}. On the validation-fit scale of the first runs (t1 ${gradedFit.t1.toFixed(4)}, t2 ${gradedFit.t2.toFixed(4)}): ${tableOfRows(gradedRows)}`
    const meshIsExternal = winStay.lead.digest === adaptive.digest && winStay.fixed.digest === reactiveFixed.digest
    const s = cell.selector
    const describe = `${cell.name} on ${cell.background}: selector window [${cell.select.window.join(' ')}] parity ${cell.select.start}, roles a ${s.skeleton.at.contentA} b ${s.skeleton.at.contentB} sA ${s.skeleton.at.scoreA} sB ${s.skeleton.at.scoreB}, read at position ${cell.select.readPosition} after ${cell.select.readRound} rounds, codes A ${s.codeA.join(',')} B ${s.codeB.join(',')}, ties at levels 0/1/2 read ${tieB.map(x => (x ? 'B' : 'A')).join('/')}; mux window [${cell.steer.window.join(' ')}] parity ${cell.steer.start}, roles c ${cell.mux.at[0]} P ${cell.mux.at[1]} Q ${cell.mux.at[2]}, read at position ${cell.steer.readPosition} after ${cell.steer.readRound} rounds; tag A ${cell.tagA}, tag B ${cell.tagB}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the carrier between selecting and steering is built in the reactive cell ${cell.name} on ${cell.background} as an evaluator-metered handoff: in each of ${adaptiveLog.length} adaptive proposer steps the evaluator ran 32 selector runs and 5 mux runs on the background (${metrics.adaptiveMeteredRuns} runs, ${metrics.adaptivePairUpdates} pair updates), the judge recomputed every digest and checked the background on every entry and the chain, and the mux's lead reordered the proposals in ${adaptive.leadFirst} rounds; adaptation through the mesh is not shown: under the tie rule fixed before the first run (the incumbent keeps ties, ${PRE_FIXED_PATTERN}) no reactive cell has a selector (${withSelector} of ${reactiveCells}, Lemma T), and the same loop decided outside the mesh with ties held gains ${preFixed.gain.toFixed(4)} held-out Q over the fixed order; with the layout's ties (${layoutPattern}) the mesh loop's mean held-out Q ${adaptiveTest.toFixed(3)} is ${word(adaptiveTest, testOf(reactiveFixed))} the same cell with the fixed order (${testOf(reactiveFixed).toFixed(3)}), a difference of ${(adaptiveTest - testOf(reactiveFixed)).toFixed(4)} that belongs to the tie rule, not to adaptation: across ${tieRows.length} tie patterns the external win-stay gain runs from ${Math.min(...gains).toFixed(4)} to ${Math.max(...gains).toFixed(4)}; the selector computes the face's own level comparison under the ${layoutPattern} tie rule, and an external win-stay arm with that rule ${meshIsExternal ? 'reproduces both mesh arms decision for decision' : `differs from the mesh arm in ${meshDecisionsDiffering} decisions`} (mesh minus external ${(adaptiveTest - layoutRow.lead).toFixed(4)}), so the mesh's share is the tie pattern only (scale fitted on the validation starts inside the taught tables, ${adaptiveLevels.join('/')} children at levels 0/1/2, E-CMP-0078's failure mode ${scaleAvoided ? 'avoided' : 'not avoided'}); on the validation-fit scale of the first runs the same external arms give ${gradedPreFixed.gain.toFixed(4)} with ties held, ${gradedLayout.gain.toFixed(4)} with the layout's ties (the relaxed-tie run of the first report, a tie artefact) and ${Math.min(...gradedGains).toFixed(4)} to ${Math.max(...gradedGains).toFixed(4)} across the patterns; the adaptive loop is ${word(adaptiveTest, testOf(external))} the fixed-order loop with external selection (${testOf(external).toFixed(3)}), ${word(adaptiveTest, mean(frozenTest))} the frozen seeds (${mean(frozenTest).toFixed(3)}) and ${word(adaptiveTest, testOf(t1Old))} E-CMP-0078's T1 loop (${testOf(t1Old).toFixed(3)}); the no-dynamics knockout scores ${testOf(knockout).toFixed(3)} and changes the reads of ${knockoutBehaviour.differing} of ${adaptiveLog.length} steps (a planted knockout under the cell's own rule fails that gate); a step computing its outputs in its own code makes the same choices with 0 metered runs and is classified external, both forgers are refused wherever they differ, and a forger that fits the step to the pre-0037 digest with wrong words is refused ${forging.refused} of ${forging.fitted} (a pre-0037 judge accepts ${forging.legacyAccepted})`,
      metrics,
      control,
      notes: `Cell census: ${reactiveCells} reactive cells, ${withSelector} with a tie-holding three-level selector (Lemma T), ${withWholesale} with a three-level selector whose ties read one candidate wholesale (widths ${SELECT_WIDTHS.join(' to ')}), ${withMux} with a mux (widths ${MUX_WIDTHS.join(' to ')}), both: ${found.join(', ') || 'none'}. Chosen: ${describe}. Scale: tertiles of Q on the validation starts inside the taught tables (problems the loop never grades) over ${scale.nonViolating} non-violating of ${scale.graded} seeds and one-edit children, t1 ${scale.t1.toFixed(4)}, t2 ${scale.t2.toFixed(4)}; the validation fit of the first runs would be t1 ${gradedFit.t1.toFixed(4)}, t2 ${gradedFit.t2.toFixed(4)}; old scale seed Q ${seedQ.toFixed(4)}. Tie patterns, the step decided outside the mesh by the face's levels (held-out Q, lead proposer against the pinned fixed order): ${tieTable}. External win-stay arm with the layout's ties: same digest as the mesh adaptive arm ${winStay.lead.digest === adaptive.digest}, as reactive-fixed ${winStay.fixed.digest === reactiveFixed.digest}, ${meshDecisionsDiffering} decisions differ. Knockout behaviour gate: ${knockoutBehaviour.differing} of ${adaptiveLog.length} steps read differently under ${IDENTITY_RULE}, adoptions ${knockout.chosen} against ${adaptive.chosen}; the planted knockout (the cell's own rule) reads differently on ${plantedBehaviour.differing} and is refused by the gate. Step forger: ${forging.fitted} of ${forging.tried} replays fitted to the pre-0037 digest in ${forging.tries} tries, accepted by every pre-0037 check ${forging.legacyAccepted}, refused by the chain ${forging.refused}. Children by level: adaptive ${adaptiveLevels.join('/')}, reactive-fixed ${reactiveLevels.join('/')}, t1-new-scale ${t1NewLevels.join('/')}, t1-mesh ${t1OldLevels.join('/')}; E-CMP-0078's failure mode ${scaleAvoided ? 'avoided' : 'not avoided'}. Adoptions: adaptive ${adaptive.chosen}/${adaptive.proposals}, reactive-fixed ${reactiveFixed.chosen}/${reactiveFixed.proposals}, t1-new-scale ${t1New.chosen}/${t1New.proposals}, t1-mesh ${t1Old.chosen}/${t1Old.proposals}, external ${external.chosen}/${external.proposals}, knockout ${knockout.chosen}/${knockout.proposals} (${knockout.carrierFailures} carrier failures). Lead: reordered ${adaptive.leadFirst} rounds, changed ${adaptive.leadChanges} times. Validation/test Q per episode: ${lines.join('. ')}. Costs beside Q (not folded in, as E-CMP-0031): scale ${scale.graded} genome evaluations; genomes evaluated adaptive ${adaptive.evaluated}, reactive-fixed ${reactiveFixed.evaluated}, external ${external.evaluated}; adaptive ${metrics.adaptiveMeteredRuns} runs, ${metrics.adaptiveMeteredRounds} rounds, ${metrics.adaptivePairUpdates} pair updates, ${metrics.adaptiveOperatorCalls} operator calls; reactive-fixed ${metrics.reactiveFixedMeteredRuns} runs, ${metrics.reactiveFixedMeteredRounds} rounds. Controls: smuggler ${smuggledRuns} runs, ${smuggledExternal}/${smuggledLog.length} external; forged carrier refused ${forged.carrierRefused} (${forged.carrierHonest} honest), forged scores refused ${forged.scoresRefused} (${forged.scoresHonest} honest) of ${adaptiveLog.length}; knockout ${knockoutRealized}/${knockoutLog.length} recomputed under ${IDENTITY_RULE}; lead-none equals the fixed order ${pinned.digest === reactiveFixed.digest}. Limits: the carrier is the metered handoff checked by the judge, not a wire inside one run; one score trit, three levels; the lead is one edit (win-stay); the proposer runs isolated and hears only the genome and the lead, and the face hands the loop no grade; a run may be requested and its answer ignored, so 'mesh-realized' means the evaluator ran the decision's runs and the chain binds them to it, not that the solver's branch read them. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
