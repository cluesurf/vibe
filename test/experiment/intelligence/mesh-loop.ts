// Intelligence level 6, slice 3 (item vibe-computation-intelligence-0028, level6.md of vibe/computation/intelligence):
// E-CMP-0031's bounded improvement loop with its SELECTION made by the mesh and metered by the evaluator (decision 003).
// The fixed-order proposer proposes one-field edits; the evaluator grades each candidate alone on validation and
// quantizes the grade to three levels on a scale fixed in advance (violations or Q < 1, Q below the level-1 solver's,
// at least the level-1 solver's); a tournament in proposal order runs one selection solve per child, in which the
// selector asks the evaluator for one run per content trit of E-CMP-0068's T1 selector (id.CBA.id on the vacuum,
// window [a b sA sB], read at b's cell after 3 rounds) and writes the read trits out (the carrier). A content is the
// genome itself, 31 trits; the loop decodes the written word into the next incumbent.
//
// Algebra: spin-1 tones for the selection, puzzle labels for family A. Regime: pure. Schedule: the brick line.
//
// Gates, fixed in level6.md before the first run, each able to fail:
// - G1 the layout reads the better content on all 24 strictly ordered inputs under the evaluator's table, meshLineRun
//   equals lineBrickRun frame for frame on all 36 inputs, ties read A at levels 0 and 2 and B at level 1.
// - G2 every selection of the mesh arm is mesh-realized (meter: one entry, the rule, the layout, 31 runs, 93 rounds,
//   the frame digest recomputed from the instance with lineBrickRun, the output equal to the recomputed reads); 0
//   carrier failures.
// - G3 the smuggled control: 0 metered runs and classified external on every selection, its choices equal the mesh arm's.
// - G4 the forged control: refused on every replayed instance whose true tones differ from the forged ones, realized on
//   the rest.
// - G5 the knockout: every selection metered and recomputed under id.ABC.id, and the child adopted every time.
// - G6 the external arm reproduces E-CMP-0031's fixed-order numbers: 6 hits in 52 proposals, mean final Q 0.905.
// - G7 0 held-out graded solves during the loops, every final genome valid, a second mesh run with a fresh judge gives
//   the same digest, no random or clock source in the scanned files.
// Reported, not gated: mean final validation and held-out test Q per arm (mesh, fixed-external, frozen, smuggled,
// knockout), the loop's costs (genome evaluations, selection solves, operator calls, metered runs, rounds, pair
// updates), tie decisions and the mesh arm's agreement with the external verdict.

import { resolve } from 'node:path'
import { gateRule, lineBrickRun, type GateRule } from '@/code/compute/lab/gates'
import { scanIntelligenceSources } from '@/code/intelligence/benchmark/source-scan'
import {
  EXHAUSTIVE_GENOME,
  SEED_GENOME,
  copyGenome,
  genomeKey,
  validateGenome,
  type IntelligenceGenome,
} from '@/code/intelligence/genome/genome'
import type { Evaluation } from '@/code/intelligence/improve/evaluation'
import { improveEpisodes, type Episode } from '@/code/intelligence/improve/improve'
import { genomeJudge, type GenomeJudge } from '@/code/intelligence/improve/judge/genome-judge'
import { sandboxedMetaLearner, type SandboxedMetaLearner } from '@/code/intelligence/improve/judge/meta-session'
import { CONTENT_TRITS, decodeGenome, encodeGenome } from '@/code/intelligence/improve/mesh/content-code'
import { meshDigest, meshImproveEpisodes, type MeshEpisode, type MeshSelectionFace } from '@/code/intelligence/improve/mesh/mesh-loop'
import {
  CODE_A,
  CODE_B,
  FORGED_SCORES,
  IDENTITY_RULE,
  SELECT_LAYOUT,
  SELECT_RULE,
  SELECT_STEP,
  WRITE_MINUS,
  WRITE_PLUS,
  parseSelectionKey,
  selectionKey,
  type SelectionInstance,
} from '@/code/intelligence/improve/mesh/select-solver'
import { fitLegacyStep, legacyDigest, legacyKeyHash } from '@/code/intelligence/control/mesh-step-forger'
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
  type MeshLayoutSpec,
} from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { meshChain, meshKeyHash, type MeshDigestRun } from '@/code/intelligence/solver/mesh/mesh-digest'
import { pairRulesFromFibers } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

// ---- parameters, fixed before the first run (level6.md, slice 3) ----

const ROUNDS = 4
const PROPOSALS = 3
const META = 'code/intelligence/improve/meta-learner'
const SELECTORS = 'code/intelligence/improve/mesh/select-solver'
const FORGER = 'code/intelligence/control/mesh-step-forger'
// the step-fitting forger (item 0037) is replayed on the first this many mesh-arm selections; fixed with the control
const FORGED_STEP_REPLAYS = 8

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

// ---- the selection problem (evaluator side) ----

const writeOperator = (id: string, tone: number): Operator<SelectionInstance> => ({
  id,
  applicable: state => state.out.length < state.a.length,
  apply: state => ({ ...state, out: [...state.out, tone] }),
  cost: () => 1,
})

const OPERATORS = registerPrimitives([writeOperator(WRITE_MINUS, -1), writeOperator(WRITE_PLUS, 1)])

function selectionProblem(id: string, instance: SelectionInstance): Problem<SelectionInstance> {
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

// ---- the rules, as the evaluator and the judge hold them ----

const FIBERS = new Map(pairRulesFromFibers().map(rule => [rule.name, rule]))

function gateOf(name: string): GateRule {
  const rule = FIBERS.get(name)

  if (rule === undefined) {
    throw new Error(`mesh-loop: no pair rule ${name}`)
  }

  return gateRule(rule.name, rule.table)
}

const GATES = new Map([SELECT_RULE, IDENTITY_RULE].map(name => [name, gateOf(name)]))

/** The judge's own run of one trit (lineBrickRun), its read and its final frame hash. */
function judgeRun(rule: string, word: readonly number[]): { value: number; frameHash: number } {
  const layout = SELECT_LAYOUT
  const window = layout.window.slice()

  layout.inputs.forEach((offset, j) => {
    window[offset] = word[j]!
  })

  const run = lineBrickRun({ rule: GATES.get(rule)!, background: 0, start: layout.start, window, rounds: layout.readRound })
  const frame = run.frames[layout.readRound]!

  return { value: frame[layout.readPosition + run.pad]!, frameHash: meshFrameHash(frame, frame.length) }
}

interface Provenance {
  realized: boolean
  reason: string
  reads: number[]
  runs: number
  rounds: number
  pairUpdates: number
}

const sameLayout = (a: MeshLayoutSpec, b: MeshLayoutSpec): boolean =>
  a.start === b.start &&
  a.readPosition === b.readPosition &&
  a.readRound === b.readRound &&
  a.window.join(',') === b.window.join(',') &&
  a.inputs.join(',') === b.inputs.join(',')

/** Decision 003's provenance, from the meter and the instance alone; never from the candidate's report. */
function provenance(grade: Grade<SelectionInstance>, instance: SelectionInstance, rule: string): Provenance {
  const hash = meshKeyHash(selectionKey(instance))
  const reads: number[] = []
  const request: MeshDigestRun[] = []

  for (let k = 0; k < instance.a.length; k++) {
    const word = [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB]
    const run = judgeRun(rule, word)

    reads.push(run.value)
    request.push({ keyHash: hash, word, frameHash: run.frameHash, value: run.value })
  }

  // one request of the selector's runs in trit order, at SELECT_STEP, on the vacuum (item 0037: bound to each trit)
  const digest = meshChain(rule, { ...SELECT_LAYOUT, background: 0 }).fold(SELECT_STEP, request)

  const layouts = grade.mesh.layouts
  const entry = layouts[0]
  const out = grade.solution.states[grade.solution.states.length - 1]?.out ?? []
  const metered = { runs: entry?.runs ?? 0, rounds: entry?.rounds ?? 0, pairUpdates: entry?.pairUpdates ?? 0 }
  const n = instance.a.length

  let reason = ''

  if (grade.violations.length > 0 || !grade.solved) {
    reason = `not a clean solve: ${grade.violations[0] ?? 'unsolved'}`
  } else if (layouts.length !== 1 || entry === undefined) {
    reason = `${layouts.length} metered layouts`
  } else if (entry.rule !== rule || !sameLayout(entry.layout, SELECT_LAYOUT)) {
    reason = `metered ${entry.rule} on another layout`
  } else if (entry.layout.background !== 0) {
    // the vacuum, checked on the entry (audit 3, m1)
    reason = `metered on background ${String(entry.layout.background)}, not the vacuum`
  } else if (entry.requests !== 1) {
    reason = `metered ${entry.requests} requests, not one`
  } else if (entry.runs !== n || entry.rounds !== n * SELECT_LAYOUT.readRound) {
    reason = `metered ${entry.runs} runs, ${entry.rounds} rounds`
  } else if (entry.frameDigest !== digest) {
    reason = `metered digest ${entry.frameDigest}, recomputed ${digest}`
  } else if (out.join(',') !== reads.join(',')) {
    reason = 'the output is not the recomputed reads'
  }

  return { realized: reason === '', reason, reads, ...metered }
}

// ---- the face: the evaluator writes levels, runs a selection solve, records it ----

interface SelectionRecord {
  instance: SelectionInstance
  levelA: number
  levelB: number
  chosenChild: boolean
  /** the external verdict: the child accepted over the incumbent by the harm rule and the margin */
  verdictChild: boolean
  provenance: Provenance
  operatorCalls: number
  violations: number
}

function levelOf(evaluation: Evaluation, seedQ: number): number {
  if (evaluation.violations > 0 || evaluation.meanQ < 1) {
    return 0
  }

  return evaluation.meanQ < seedQ ? 1 : 2
}

function makeFace(judge: GenomeJudge, seedQ: number, spec: CandidateSpec, rule: string, log: SelectionRecord[]): MeshSelectionFace {
  return {
    evaluate: genome => judge.evaluate(genome, 'validation'),
    select(incumbent, challenger) {
      const a = judge.evaluate(incumbent, 'validation')
      const b = judge.evaluate(challenger, 'validation')
      const levelA = levelOf(a, seedQ)
      const levelB = levelOf(b, seedQ)
      const instance: SelectionInstance = {
        a: encodeGenome(incumbent),
        b: encodeGenome(challenger),
        scoreA: CODE_A[levelA]!,
        scoreB: CODE_B[levelB]!,
        out: [],
      }
      const grade = evaluate(spec, selectionProblem(`select-${log.length}`, instance), OPERATORS)
      const last = grade.solution.states[grade.solution.states.length - 1]
      const word = grade.pathValid && last !== undefined ? last.out.slice() : null

      log.push({
        instance,
        levelA,
        levelB,
        chosenChild: word !== null && word.join(',') === instance.b.join(','),
        verdictChild: judge.verdict(b, a).accepted,
        provenance: provenance(grade, instance, rule),
        operatorCalls: callTotal(grade.elementary),
        violations: grade.violations.length,
      })

      return word
    },
  }
}

// ---- reports ----

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
}

const mean = (values: readonly number[]): number => (values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length)
const fixed = (value: number, digits = 3): number => Number(value.toFixed(digits))

function fixedProposer(): SandboxedMetaLearner {
  return sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns: false, proposals: PROPOSALS }))
}

function meshArm(name: string, judge: GenomeJudge, seedQ: number, selector: string, rule: string, log: SelectionRecord[]): ArmReport {
  const meta = fixedProposer()
  const asked = new Set<string>()
  const face = makeFace(judge, seedQ, candidate(SELECTORS, selector), rule, log)
  const counting: MeshSelectionFace = {
    evaluate(genome) {
      asked.add(genomeKey(genome))

      return face.evaluate(genome)
    },
    select: face.select,
  }
  const episodes: MeshEpisode[] = meshImproveEpisodes(
    SEEDS.map(([, seed]) => seed),
    meta,
    counting,
    ROUNDS,
  )

  meta.close()

  const finals = episodes.map(e => e.rounds[e.rounds.length - 1]!.best)

  return {
    name,
    finals,
    finalValidationQ: finals.map(g => judge.evaluate(g, 'validation').meanQ),
    // graded on test only after every loop has run, outside the held-out window (testQ)
    finalTestQ: [],
    proposals: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.length, 0), 0),
    chosen: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.proposals.filter(p => p.chosen).length, 0), 0),
    evaluated: asked.size,
    carrierFailures: episodes.reduce((s, e) => s + e.rounds.reduce((t, r) => t + r.carrierFailures, 0), 0),
    digest: meshDigest(episodes),
  }
}

function externalArm(judge: GenomeJudge): ArmReport {
  const meta = fixedProposer()
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
  }
}

/** environments where `after` harms `before` on the test split: success falls, or q falls by more than a tenth */
function harmed(before: Evaluation, after: Evaluation): string[] {
  const old = new Map(before.environments.map(s => [s.id, s]))

  return after.environments
    .filter(s => {
      const o = old.get(s.id)

      return o !== undefined && (s.success < o.success || s.q < o.q * 0.9)
    })
    .map(s => s.id)
}

const sumOf = (log: readonly SelectionRecord[], pick: (r: SelectionRecord) => number): number => log.reduce((s, r) => s + pick(r), 0)

export default experiment({
  id: 'intelligence/mesh-loop',
  code: 'E-CMP-0078',
  title:
    'intelligence level 6, slice 3: the bounded improvement loop with its selection made by the mesh and metered by the evaluator: the fixed-order proposer, the evaluator grading each candidate alone and quantizing the grade to three levels, a tournament of E-CMP-0068 T1 selector runs (id.CBA.id on the vacuum) over 31-trit genome contents asked of the evaluator, the read trits written out as the next incumbent; held-out Q against the fixed-order loop with external selection and the frozen seeds, with smuggled, forged and knockout controls',
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

    // ---- G1 the layout, under the evaluator's table and the judge's runner ----
    const table = Int8Array.from(FIBERS.get(SELECT_RULE)!.table)
    const cells = new Int8Array(meshLineLength(SELECT_LAYOUT))
    let strictWrong = 0
    let frameDifferences = 0
    let tieWrong = 0
    let layoutInputs = 0

    for (let levelA = 0; levelA < 3; levelA++) {
      for (let levelB = 0; levelB < 3; levelB++) {
        for (const a of [-1, 1]) {
          for (const b of [-1, 1]) {
            const word = [a, b, CODE_A[levelA]!, CODE_B[levelB]!]
            const frames: Int8Array[] = []
            const metered = meshLineRun(table, SELECT_LAYOUT, word, cells, frames)
            const window = SELECT_LAYOUT.window.slice()

            SELECT_LAYOUT.inputs.forEach((offset, j) => {
              window[offset] = word[j]!
            })

            const judged = lineBrickRun({ rule: GATES.get(SELECT_RULE)!, background: 0, start: SELECT_LAYOUT.start, window, rounds: SELECT_LAYOUT.readRound })

            layoutInputs++

            for (let t = 0; t <= SELECT_LAYOUT.readRound; t++) {
              if (frames[t]!.join(',') !== judged.frames[t]!.join(',')) {
                frameDifferences++
              }
            }

            if (levelA !== levelB) {
              if (metered.value !== (levelA > levelB ? a : b)) {
                strictWrong++
              }
            } else if (metered.value !== (levelA === 1 ? b : a)) {
              tieWrong++
            }
          }
        }
      }
    }

    control.layoutInputs = layoutInputs
    control.layoutStrictWrong = strictWrong
    control.layoutTieWrong = tieWrong
    control.layoutFrameDifferences = frameDifferences

    if (strictWrong > 0 || tieWrong > 0 || frameDifferences > 0 || layoutInputs !== 36) {
      fail(`G1: the layout misreads ${strictWrong} strict and ${tieWrong} tied inputs, ${frameDifferences} frames differ`)
    }

    // the content code is a bijection on every genome the run touches (checked below) and has the declared width
    metrics.contentTrits = CONTENT_TRITS

    if (CONTENT_TRITS !== 31) {
      fail(`content words are ${CONTENT_TRITS} trits, not the declared 31`)
    }

    // ---- the evaluator, the scale ----
    const judge = genomeJudge()
    const seedQ = judge.evaluate(SEED_GENOME, 'validation').meanQ

    metrics.scaleSeedQ = fixed(seedQ, 4)

    // ---- the arms ----
    const heldOutBefore = heldOutGraded()
    const external = externalArm(judge)
    const meshLog: SelectionRecord[] = []
    const mesh = meshArm('mesh', judge, seedQ, 'meshSelector', SELECT_RULE, meshLog)
    const smuggledLog: SelectionRecord[] = []
    const smuggled = meshArm('smuggled', judge, seedQ, 'smuggledSelector', SELECT_RULE, smuggledLog)
    const knockoutLog: SelectionRecord[] = []
    const knockout = meshArm('knockout', judge, seedQ, 'knockoutSelector', IDENTITY_RULE, knockoutLog)
    const heldOutDuring = heldOutGraded() - heldOutBefore

    control.heldOutGradesDuringLoops = heldOutDuring

    if (heldOutDuring !== 0) {
      fail(`G7: the loops caused ${heldOutDuring} graded solves of held-out problems`)
    }

    // the held-out grades, only now that no loop runs
    for (const arm of [external, mesh, smuggled, knockout]) {
      arm.finalTestQ = arm.finals.map(g => judge.evaluate(g, 'test').meanQ)
    }

    const frozenValidation = SEEDS.map(([, seed]) => judge.evaluate(seed, 'validation').meanQ)
    const frozenTest = SEEDS.map(([, seed]) => judge.evaluate(seed, 'test').meanQ)

    // ---- G2 provenance of the mesh arm ----
    const meshRealized = meshLog.filter(r => r.provenance.realized).length

    control.meshSelections = meshLog.length
    control.meshRealized = meshRealized
    control.meshCarrierFailures = mesh.carrierFailures

    if (meshRealized !== meshLog.length || meshLog.length === 0) {
      fail(`G2: ${meshRealized} of ${meshLog.length} mesh selections mesh-realized (${meshLog.find(r => !r.provenance.realized)?.provenance.reason ?? ''})`)
    }

    if (mesh.carrierFailures !== 0) {
      fail(`G2: ${mesh.carrierFailures} carrier failures`)
    }

    // ---- G3 the smuggled control ----
    const smuggledRuns = sumOf(smuggledLog, r => r.provenance.runs)
    const smuggledExternal = smuggledLog.filter(r => !r.provenance.realized && r.provenance.runs === 0).length
    const smuggledSameChoices =
      smuggled.digest === mesh.digest &&
      smuggledLog.length === meshLog.length &&
      smuggledLog.every((r, i) => r.chosenChild === meshLog[i]!.chosenChild)

    control.smuggledSelections = smuggledLog.length
    control.smuggledMeteredRuns = smuggledRuns
    control.smuggledClassifiedExternal = smuggledExternal
    control.smuggledSameChoicesAsMesh = smuggledSameChoices ? 1 : 0

    if (smuggledRuns !== 0 || smuggledExternal !== smuggledLog.length || smuggledLog.length === 0) {
      fail(`G3: the smuggler made ${smuggledRuns} metered runs, ${smuggledExternal} of ${smuggledLog.length} classified external`)
    }

    if (!smuggledSameChoices) {
      fail('G3: the smuggler chose differently from the mesh arm, so the control does not show the outcome alone is blind')
    }

    // ---- G4 the forged control, replayed on every mesh-arm instance ----
    const forgedSpec = candidate(SELECTORS, 'forgedSelector')
    let forgedRefused = 0
    let forgedHonest = 0
    let forgedWrong = 0

    meshLog.forEach((record, i) => {
      const grade = evaluate(forgedSpec, selectionProblem(`forged-${i}`, record.instance), OPERATORS)
      const judged = provenance(grade, record.instance, SELECT_RULE)
      const honest = record.instance.scoreA === FORGED_SCORES.scoreA && record.instance.scoreB === FORGED_SCORES.scoreB

      if (honest) {
        forgedHonest++

        if (!judged.realized) {
          forgedWrong++
        }
      } else if (judged.realized) {
        forgedWrong++
      } else {
        forgedRefused++
      }
    })

    control.forgedReplayed = meshLog.length
    control.forgedRefused = forgedRefused
    control.forgedTonesHonest = forgedHonest

    if (forgedWrong > 0) {
      fail(`G4: ${forgedWrong} forged selections misclassified`)
    }

    // ---- item 0037 (audit 3, M2): the step-fitting forger, on the first mesh-arm instances ----
    // It runs wrong words with the step fitted so the pre-0037 sum equals the judge's target, pays every round, and writes
    // the honest reads (decided in its own code). Every pre-0037 check accepts it; the chain must refuse it.
    const forging = { tried: 0, fitted: 0, legacyAccepted: 0, refused: 0, tries: 0 }
    const frameOf = new Map<string, number>()
    const frame = (word: readonly number[]): number => {
      const key = word.join(',')
      let hash = frameOf.get(key)

      if (hash === undefined) {
        hash = judgeRun(SELECT_RULE, word).frameHash
        frameOf.set(key, hash)
      }

      return hash
    }
    const allWords = [-1, 0, 1].flatMap(x => [-1, 0, 1].flatMap(y => [-1, 0, 1].flatMap(z => [-1, 0, 1].map(w => [x, y, z, w]))))

    meshLog.slice(0, FORGED_STEP_REPLAYS).forEach((record, i) => {
      const instance = record.instance
      const n = instance.a.length
      const legacyHash = legacyKeyHash(selectionKey(instance))
      const honestWords = Array.from({ length: n }, (_, k) => [instance.a[k]!, instance.b[k]!, instance.scoreA, instance.scoreB])
      const target = legacyDigest(honestWords.map(w => ({ keyHash: legacyHash, frameHash: frame(w), step: SELECT_STEP })), 0)
      const alternatives = honestWords.map(h => allWords.filter(w => w.join(',') !== h.join(',')).map(w => ({ word: w, frameHash: frame(w) })))

      forging.tried++

      // limit raised from 10^6 after the first run, where one replay found no fit (the pre-0037 factors are multiples of
      // one key factor, so a fit needs the frame sums in near-ratio and the odometer's first 10^6 sums lie close)
      const fit = fitLegacyStep({ keyHash: legacyHash, background: 0, target, alternatives, limit: 10_000_000 })

      if (fit === null) {
        return
      }

      forging.fitted++
      forging.tries += fit.tries

      const forgedWords = fit.choice.map((c, k) => alternatives[k]![c]!.word)
      const reads = record.provenance.reads
      const spec = candidate(FORGER, 'stepForger', {
        id: 'mesh-selector',
        requests: [{ rule: SELECT_RULE, layout: { ...SELECT_LAYOUT }, step: fit.step, words: forgedWords.flat(), arity: 4 }],
        writes: reads.map(v => (v === 1 ? WRITE_PLUS : WRITE_MINUS)),
      })
      const grade = evaluate(spec, selectionProblem(`forged-step-${i}`, instance), OPERATORS)
      const judged = provenance(grade, instance, SELECT_RULE)
      const entry = grade.mesh.layouts[0]
      const out = grade.solution.states[grade.solution.states.length - 1]?.out ?? []
      // every check a pre-0037 judge made, the digest the pre-0037 sum of the runs the forger asked for
      const legacyOk =
        grade.violations.length === 0 &&
        grade.solved &&
        grade.mesh.layouts.length === 1 &&
        entry?.rule === SELECT_RULE &&
        sameLayout(entry.layout, SELECT_LAYOUT) &&
        entry.runs === n &&
        entry.rounds === n * SELECT_LAYOUT.readRound &&
        legacyDigest(forgedWords.map(w => ({ keyHash: legacyHash, frameHash: frame(w), step: fit.step })), 0) === target &&
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
      fail(`item 0037: step forger tried ${forging.tried}, fitted ${forging.fitted}, a pre-0037 judge accepts ${forging.legacyAccepted}, refused ${forging.refused}`)
    }

    // ---- G5 the knockout ----
    const knockoutRealized = knockoutLog.filter(r => r.provenance.realized).length
    const knockoutChild = knockoutLog.filter(r => r.chosenChild).length

    control.knockoutSelections = knockoutLog.length
    control.knockoutRealized = knockoutRealized
    control.knockoutChildAdopted = knockoutChild

    if (knockoutRealized !== knockoutLog.length || knockoutChild !== knockoutLog.length || knockoutLog.length === 0) {
      fail(`G5: knockout ${knockoutRealized} realized and ${knockoutChild} child adoptions of ${knockoutLog.length}`)
    }

    // ---- G6 the external arm reproduces E-CMP-0031 ----
    metrics.externalHits = external.chosen
    metrics.externalProposals = external.proposals
    metrics.externalMeanFinalValidationQ = fixed(mean(external.finalValidationQ))

    if (external.chosen !== 6 || external.proposals !== 52 || fixed(mean(external.finalValidationQ)) !== 0.905) {
      fail(`G6: the external arm made ${external.chosen}/${external.proposals} hits, mean final Q ${mean(external.finalValidationQ)}, not E-CMP-0031's 6/52 and 0.905`)
    }

    // ---- G7 hygiene: valid finals, carried genomes decode, determinism, sources ----
    let invalidFinals = 0

    for (const arm of [external, mesh, smuggled, knockout]) {
      for (const g of arm.finals) {
        if (validateGenome(g).length > 0) {
          invalidFinals++
        }
      }
    }

    let codeRoundTrips = 0

    for (const record of meshLog) {
      for (const word of [record.instance.a, record.instance.b]) {
        const back = decodeGenome(word)

        if (back !== null && encodeGenome(back).join(',') === word.join(',')) {
          codeRoundTrips++
        }
      }

      if (parseSelectionKey(selectionKey(record.instance))?.a.join(',') !== record.instance.a.join(',')) {
        fail('the selection key does not round-trip')
      }
    }

    control.invalidFinals = invalidFinals
    control.contentRoundTrips = codeRoundTrips

    if (invalidFinals > 0 || codeRoundTrips !== 2 * meshLog.length) {
      fail(`G7: ${invalidFinals} invalid finals, ${codeRoundTrips} of ${2 * meshLog.length} content words round-trip`)
    }

    const againLog: SelectionRecord[] = []
    const freshJudge = genomeJudge()
    const again = meshArm('mesh-again', freshJudge, freshJudge.evaluate(SEED_GENOME, 'validation').meanQ, 'meshSelector', SELECT_RULE, againLog)
    const deterministic =
      again.digest === mesh.digest &&
      againLog.length === meshLog.length &&
      againLog.every((r, i) => r.provenance.reads.join(',') === meshLog[i]!.provenance.reads.join(',') && r.provenance.realized)

    metrics.deterministic = deterministic ? 1 : 0

    if (!deterministic) {
      fail('G7: a second mesh run with a fresh judge gave a different digest')
    }

    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/mesh-loop.ts'])

    metrics.sourceFilesScanned = files.length

    for (const finding of findings) {
      fail(`G7: random number or clock source: ${finding.file}:${finding.line} ${finding.kind}`)
    }

    // ---- reported: Q per arm, costs, ties, agreement ----
    const arms = [mesh, external, smuggled, knockout]

    for (const arm of arms) {
      const key = arm.name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

      metrics[`${key}MeanFinalValidationQ`] = fixed(mean(arm.finalValidationQ))
      metrics[`${key}MeanFinalTestQ`] = fixed(mean(arm.finalTestQ))
      metrics[`${key}Adoptions`] = arm.chosen
      metrics[`${key}Proposals`] = arm.proposals
      metrics[`${key}GenomesEvaluated`] = arm.evaluated
    }

    metrics.frozenMeanValidationQ = fixed(mean(frozenValidation))
    metrics.frozenMeanTestQ = fixed(mean(frozenTest))

    const meshTest = mean(mesh.finalTestQ)
    const externalTest = mean(external.finalTestQ)
    const knockoutTest = mean(knockout.finalTestQ)
    const frozenTestMean = mean(frozenTest)
    const headline = meshTest > externalTest ? 'beats' : meshTest === externalTest ? 'ties' : 'below'

    metrics.headlineMeshMinusExternalTestQ = fixed(meshTest - externalTest, 4)
    metrics.meshMinusKnockoutTestQ = fixed(meshTest - knockoutTest, 4)
    metrics.meshMinusFrozenTestQ = fixed(meshTest - frozenTestMean, 4)

    const ties = meshLog.filter(r => r.levelA === r.levelB)
    const agreement = meshLog.filter(r => r.chosenChild === r.verdictChild).length

    metrics.meshTieDecisions = ties.length
    metrics.meshTieChildAdopted = ties.filter(r => r.chosenChild).length
    metrics.meshAgreesWithExternalVerdict = agreement
    metrics.meshChildAdoptedAgainstVerdict = meshLog.filter(r => r.chosenChild && !r.verdictChild).length
    metrics.meshChildRefusedAgainstVerdict = meshLog.filter(r => !r.chosenChild && r.verdictChild).length
    metrics.meshMeteredRuns = sumOf(meshLog, r => r.provenance.runs)
    metrics.meshMeteredRounds = sumOf(meshLog, r => r.provenance.rounds)
    metrics.meshPairUpdates = sumOf(meshLog, r => r.provenance.pairUpdates)
    metrics.meshSelectionOperatorCalls = sumOf(meshLog, r => r.operatorCalls)
    metrics.knockoutMeteredRuns = sumOf(knockoutLog, r => r.provenance.runs)
    metrics.knockoutPairUpdates = sumOf(knockoutLog, r => r.provenance.pairUpdates)
    metrics.smuggledSelectionOperatorCalls = sumOf(smuggledLog, r => r.operatorCalls)

    const levelCounts = [0, 1, 2].map(l => meshLog.filter(r => r.levelB === l).length)

    metrics.meshChildLevel0 = levelCounts[0]!
    metrics.meshChildLevel1 = levelCounts[1]!
    metrics.meshChildLevel2 = levelCounts[2]!

    const lines: string[] = []

    SEEDS.forEach(([name, seed], e) => {
      const seedTest = judge.evaluate(seed, 'test')
      const parts = [external, mesh, knockout].map(arm => {
        const g = arm.finals[e]!
        const harm = harmed(seedTest, judge.evaluate(g, 'test'))

        return `${arm.name} ${arm.finalValidationQ[e]!.toFixed(3)}/${arm.finalTestQ[e]!.toFixed(3)} (${genomeKey(g)}${harm.length > 0 ? `, held-out harm on ${harm.join(', ')}` : ''})`
      })

      lines.push(`${name}: frozen ${frozenValidation[e]!.toFixed(3)}/${frozenTest[e]!.toFixed(3)}; ${parts.join('; ')}`)
    })

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the selection step of the improve loop runs as metered mesh rounds: every one of ${meshLog.length} selections is made by E-CMP-0068's id.CBA.id selector run by the evaluator (${metrics.meshMeteredRuns} runs, ${metrics.meshPairUpdates} pair updates) and its read trits carry the winner's whole genome to the next generation; what the selector computes is the face's own comparison of the two levels it wrote, under a fixed tie rule (ties to the incumbent at levels 0 and 2, to the child at level 1), so the choice is the evaluator's comparison and the mesh's share is the tie pattern (it agrees with the external verdict on ${agreement} of ${meshLog.length}); with the fixed-order proposer and three levels per score, the mesh-selected loop's mean held-out Q ${meshTest.toFixed(3)} ${headline === 'ties' ? 'ties' : headline === 'beats' ? 'is above' : 'is below'} the fixed-order loop with external selection (${externalTest.toFixed(3)}), against ${frozenTestMean.toFixed(3)} frozen and ${knockoutTest.toFixed(3)} for the no-dynamics knockout; a selector deciding in its own code shows 0 metered runs and is classified external though its choices are identical, and one that runs wrong words with the step fitted to the pre-0037 digest is refused by the chain on ${forging.refused} of ${forging.fitted} replays (every pre-0037 check accepts ${forging.legacyAccepted})`,
      metrics,
      control,
      notes: `Scale fixed before the run: level 0 for violations or Q < 1, level 1 for 1 <= Q < ${seedQ.toFixed(4)} (the level-1 solver's validation Q), level 2 above; codes A -1,-1,0 and B -1,0,0; layout [a b sA sB] at start parity 0, read at b's cell after 3 rounds; ties hold A at levels 0 and 2 and B at level 1. Validation/test Q of each episode's final genome: ${lines.join('. ')}. Mesh arm: ${mesh.chosen} of ${mesh.proposals} children adopted, ${ties.length} tie decisions (${metrics.meshTieChildAdopted} adopted the child), children by level ${levelCounts.join('/')}, agreement with the external verdict ${agreement} of ${meshLog.length} (${metrics.meshChildAdoptedAgainstVerdict} adopted against it, ${metrics.meshChildRefusedAgainstVerdict} refused against it); genomes evaluated mesh ${mesh.evaluated}, external ${external.evaluated}, knockout ${knockout.evaluated}; selection solves ${meshLog.length}, ${metrics.meshSelectionOperatorCalls} operator calls, ${metrics.meshMeteredRounds} metered rounds. External arm ${external.chosen}/${external.proposals} hits (E-CMP-0031's fixed-order control). Controls: the smuggler ${smuggledRuns} runs, ${smuggledExternal} of ${smuggledLog.length} external, same choices ${smuggledSameChoices}; the forger refused on ${forgedRefused} of ${meshLog.length} replays (${forgedHonest} had the forged tones already); the knockout under id.ABC.id adopts every child (${knockoutChild} of ${knockoutLog.length}); the step forger (item 0037) fitted ${forging.fitted} of ${forging.tried} replays to the pre-0037 digest in ${forging.tries} tries, every pre-0037 check accepts ${forging.legacyAccepted}, the chain refuses ${forging.refused}. Headline: ${headline}. Limits: one score trit (three levels, Lemma K); the selector copies the written tones into its run words and the digest checks the copy; the carrier decode and the proposer are outside the mesh; no harm rule in the mesh arm. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
