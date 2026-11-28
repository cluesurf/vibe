// Intelligence level 3, the bounded improvement loop (the source's sections 15.6 and 15.7): a solver is described by
// an IntelligenceGenome, a plain inspectable record (search strategy, estimate and its weight, the value-table
// learner and how many experiences it is taught, the macro library and the discoverer's settings, an expansion cap),
// never executable source. A deterministic meta-learner proposes one-field edits to it in a fixed order and learns
// which edits pay; an evaluator outside every candidate grades each genome on validation starts of family A's maze
// and obstacle fields on the twelve lab geometries, keeps held-out test starts the loop never sees, counts work in
// operator calls it meters itself (a macro's inner primitive calls included) plus every preprocessing charge
// (teaching, discovery, the base distance table), and adopts a candidate only when it raises Q without harming any
// environment. Q is the mean over environments of q = success x optimality x (exhaustive search's work / work), so
// exhaustive breadth-first search scores 1.
//
// Algebra: none; the tones are puzzle labels (agent +1, wall -1, open 0). Regime: pure. Schedule and boundary: the
// open ball of family A's walk radius, structured walls, never random.
//
// Gates, each able to fail:
// - the genome is data: a JSON round trip is the identity, and the schema refuses an unknown field (a self-written
//   score), a function, a class instance, an off-ladder value and contradictory settings.
// - a self-grading candidate is rejected: a genome carrying its own score fails the schema; a solver claiming every
//   problem solved at no cost is graded at Q 0 with violations, while a grader trusting its claims would have
//   adopted it; a learner reporting zero learning work, and a solver dropping the learning charge from its ledger,
//   are rejected.
// - a candidate that raises the mean by wrecking one environment is rejected by the harm rule and accepted by the
//   mean-only rule (the control showing the hole is real).
// - costs moved into preprocessing count: a taught genome's Q with preprocessing is below the Q that ignores it; a
//   library genome's search work includes its macros' inner primitive calls; a learned table handed over lazily
//   (values computed on demand, no entries listed) is graded as no table at all.
// - the loop only ever sees validation: no test evaluation is computed while it runs, and every adopted genome is
//   violation-free with no environment harmed against its parent.
// - candidates cannot reach the evaluator: the transitive import closure of the genome, meta-learner and loop files
//   reaches no evaluator, judge, benchmark, split, geometry, substrate or tool module, no barrel and no file system.
// - determinism: a second run with a fresh evaluator gives the same digest; no random or time source in the scanned
//   files.
// Reported, not gated: Q by round on validation and test, the meta-learner's hit rate by round and by episode beside
// the fixed-order control's, and the held-out harm of each episode's final genome against its seed.

import { readFileSync, existsSync } from 'node:fs'
import { join, posix, resolve } from 'node:path'
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
import { improve, improveEpisodes, roundsDigest, type Episode } from '@/code/intelligence/improve/improve'
import { genomeJudge, DEFAULT_REALIZATION, type GenomeJudge, type RealizationSpec } from '@/code/intelligence/improve/judge/genome-judge'
import { sandboxedMetaLearner, type SandboxedMetaLearner } from '@/code/intelligence/improve/judge/meta-session'
import { candidate, heldOutGraded } from '@/code/intelligence/problem/evaluate'
import { isolationCounts } from '@/code/intelligence/sandbox/channel'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')

const ROUNDS = 4
const PROPOSALS = 3

/** candidate-side files: the record, its one reading, the meta-learner, the loop and the controls */
const CANDIDATE_FILES = [
  'code/intelligence/genome/genome.ts',
  'code/intelligence/genome/realize.ts',
  'code/intelligence/improve/evaluation.ts',
  'code/intelligence/improve/improve.ts',
  'code/intelligence/improve/meta-learner.ts',
  'code/intelligence/control/genome-controls.ts',
  'code/intelligence/control/audit-probes.ts',
]
const FORBIDDEN_PREFIXES = [
  'code/intelligence/improve/judge/',
  'code/intelligence/problem/evaluate',
  'code/intelligence/sandbox/',
  'code/intelligence/benchmark/',
  'code/intelligence/experience/learner/navigation-split',
  'code/substrate/',
  'code/geometry/',
  'code/tool/',
]
const FORBIDDEN_EXACT = new Set(['code', 'code/index'])
const FORBIDDEN_BARE = new Set(['node:fs', 'fs', 'node:child_process', 'child_process', 'node:module', 'module', 'node:worker_threads', 'worker_threads', 'node:fs/promises', 'fs/promises', 'node:vm', 'vm'])

function variant(change: (genome: IntelligenceGenome) => void): IntelligenceGenome {
  const genome = copyGenome(SEED_GENOME, 0)

  change(genome)

  return genome
}

const LEARNED_16 = variant(g => {
  g.search.heuristic = 'learned'
  g.learning.strategy = 'value-table'
  g.learning.experiences = 16
})
const LIBRARY_12 = variant(g => {
  g.operators.library = 'discovered'
  g.operators.limit = 12
})
const IDA_HOP = variant(g => {
  g.search.strategy = 'iterative-deepening'
})
const LEARNED_LIBRARY = variant(g => {
  g.search.heuristic = 'learned'
  g.learning.strategy = 'value-table'
  g.learning.experiences = 32
  g.operators.library = 'discovered'
  g.operators.limit = 6
})
const GREEDY_HOP = variant(g => {
  g.search.strategy = 'greedy'
})
const BREADTH_FIRST = variant(g => {
  g.search.strategy = 'breadth-first'
  g.search.heuristic = 'none'
})

/** the episodes' seeds, in the one fixed order */
const SEEDS: readonly [string, IntelligenceGenome][] = [
  ['a-star-hop', SEED_GENOME],
  ['a-star-learned-16', LEARNED_16],
  ['a-star-hop-library', LIBRARY_12],
  ['ida-hop', IDA_HOP],
  ['a-star-learned-32-library', LEARNED_LIBRARY],
  ['exhaustive', EXHAUSTIVE_GENOME],
]

// ---- candidate controls (each a realization a dishonest candidate could ship, run isolated) ----

const CONTROLS = 'code/intelligence/control/genome-controls'
const control = (learner: string | null, solver: string | null): RealizationSpec => ({
  learner: learner === null ? DEFAULT_REALIZATION.learner : { module: CONTROLS, export: learner },
  solver: solver === null ? DEFAULT_REALIZATION.solver : { module: CONTROLS, export: solver },
})

/** claims every problem solved where it starts, at no cost and no work */
const selfGrading = control(null, 'selfGradingSolver')
/** reports no learning work at all */
const hidingLearning = control('hidingLearningLearner', null)
/** drops the learning charge from every ledger, keeping only the base table */
const hidingCharge = control(null, 'hidingChargeSolver')
/** honest everywhere but one environment, where it searches greedily: its twin is the honest realization */
const wrecking = control(null, 'wreckingSolver')
/** a learned table handed over with its lookups overridden */
const lazyTable = control('lazyTableLearner', null)
/** the same learner handing over an empty table: what the lazy one must be graded as */
const emptyTable = control('emptyTableLearner', null)

const META = 'code/intelligence/improve/meta-learner'
/** the environment the wrecking control gives up on (genome-controls WRECKED, an environment with headline starts) */
const WRECKED_ENVIRONMENT = 'obstacle-{6,4}'

// ---- import closure ----

function resolveImport(from: string, specifier: string): string {
  if (specifier.startsWith('@/')) {
    return posix.normalize(specifier.slice(2))
  }

  if (specifier.startsWith('.')) {
    return posix.normalize(posix.join(posix.dirname(from), specifier))
  }

  return specifier
}

function sourceOf(path: string): string | null {
  for (const candidate of [`${path}.ts`, `${path}/index.ts`, path]) {
    if (candidate.endsWith('.ts') && existsSync(join(BASE, candidate))) {
      return candidate
    }
  }

  return null
}

/** every module the candidate files reach, and every forbidden reach with its route */
function importClosure(roots: readonly string[]): { files: number; forbidden: string[] } {
  const seen = new Set<string>()
  const queue = roots.map(root => ({ file: root, route: root }))
  const forbidden: string[] = []

  while (queue.length > 0) {
    const { file, route } = queue.shift()!

    if (seen.has(file)) {
      continue
    }

    seen.add(file)

    const text = readFileSync(join(BASE, file), 'utf8')

    if (/\bimport\s*\(\s*[^'"\s]/.test(text) || /\brequire\s*\(/.test(text)) {
      forbidden.push(`${route}: a non-literal import or require`)
    }

    for (const match of text.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const target = resolveImport(file, match[1]!)
      const where = `${route} -> ${match[1]}`

      if (FORBIDDEN_BARE.has(target) || FORBIDDEN_EXACT.has(target) || FORBIDDEN_PREFIXES.some(prefix => target.startsWith(prefix) || `${target}/` === prefix)) {
        forbidden.push(where)
        continue
      }

      if (!target.startsWith('code/') && !target.startsWith('test/')) {
        continue
      }

      const source = sourceOf(target)

      if (source === null) {
        forbidden.push(`${where}: unresolved`)
        continue
      }

      queue.push({ file: source, route: where })
    }
  }

  return { files: seen.size, forbidden }
}

// ---- reports ----

interface RunReport {
  episodes: Episode[]
  meta: SandboxedMetaLearner
  /** hits and proposals by round, summed over episodes */
  byRound: { hits: number; proposals: number }[]
  byEpisode: { hits: number; proposals: number }[]
  /** proposals evaluated before each episode's final genome was first adopted */
  toBest: number[]
}

function run(judge: GenomeJudge, learns: boolean): RunReport {
  // the meta-learner is a candidate: it runs isolated and hears only copies
  const meta = sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns, proposals: PROPOSALS }))
  const episodes = improveEpisodes(
    SEEDS.map(([, seed]) => seed),
    meta,
    judge.evaluator(),
    ROUNDS,
  )
  const byRound = Array.from({ length: ROUNDS }, () => ({ hits: 0, proposals: 0 }))
  const byEpisode = episodes.map(() => ({ hits: 0, proposals: 0 }))
  const toBest: number[] = []

  episodes.forEach((episode, e) => {
    let evaluated = 0
    let atBest = 0

    episode.rounds.forEach((round, r) => {
      for (const proposal of round.proposals) {
        evaluated++
        byRound[r]!.proposals++
        byEpisode[e]!.proposals++

        if (proposal.hit) {
          byRound[r]!.hits++
          byEpisode[e]!.hits++
        }

        if (genomeKey(proposal.candidate.genome) === genomeKey(round.best) && proposal.hit) {
          atBest = evaluated
        }
      }
    })

    toBest.push(atBest)
  })

  return { episodes, meta, byRound, byEpisode, toBest }
}

const rate = (part: { hits: number; proposals: number }): string =>
  part.proposals === 0 ? '-' : `${part.hits}/${part.proposals}`

const fixed = (value: number, digits = 3): number => Number(value.toFixed(digits))

function runDigest(report: RunReport): string {
  return report.episodes.map(episode => roundsDigest(episode.rounds)).join('|')
}

/** environments where `after` harms `before`: success falls, or q falls by more than a tenth */
function harmed(before: Evaluation, after: Evaluation): string[] {
  const old = new Map(before.environments.map(s => [s.id, s]))

  return after.environments
    .filter(s => {
      const o = old.get(s.id)

      return o !== undefined && (s.success < o.success || s.q < o.q * 0.9)
    })
    .map(s => s.id)
}

export default experiment({
  id: 'intelligence/improve',
  code: 'E-CMP-0031',
  title:
    'intelligence level 3, the bounded improvement loop: a solver described by an inspectable genome (search, estimate, learner, macro library, budget) is improved by a deterministic meta-learner proposing one-field edits, graded by an evaluator outside the candidate on validation starts with held-out test starts, work in operator calls it meters (preprocessing and macro inner calls counted), harm constraints and per-environment measures; self-grading and environment-wrecking candidates are rejected',
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

    // ---- the genome is data ----
    let schemaRefused = 0

    for (const [, seed] of SEEDS) {
      const copy = JSON.parse(JSON.stringify(seed)) as unknown

      if (validateGenome(copy).length > 0 || JSON.stringify(copy) !== JSON.stringify(seed)) {
        fail(`genome ${genomeKey(seed)} does not survive a JSON round trip as a valid genome`)
      }
    }

    class Boxed {
      search = SEED_GENOME.search
    }

    const malformed: [string, unknown][] = [
      ['selfScore', { ...SEED_GENOME, selfScore: { meanQ: 99 } }],
      ['nestedScore', { ...SEED_GENOME, search: { ...SEED_GENOME.search, score: 99 } }],
      ['function', { ...SEED_GENOME, search: { ...SEED_GENOME.search, heuristic: () => 0 } }],
      ['classInstance', Object.assign(new Boxed(), SEED_GENOME)],
      ['offLadder', { ...SEED_GENOME, search: { ...SEED_GENOME.search, weight: 1.25 } }],
      ['contradiction', { ...SEED_GENOME, search: { ...SEED_GENOME.search, heuristic: 'learned' } }],
      ['source', 'function solve() { return 1 }'],
    ]

    for (const [name, value] of malformed) {
      if (validateGenome(value).length > 0) {
        schemaRefused++
      } else {
        fail(`schema accepted the ${name} control`)
      }
    }

    control.schemaRefused = schemaRefused
    control.schemaControls = malformed.length

    // ---- the evaluator and the seed ----
    const judge = genomeJudge()
    const seed = judge.evaluate(SEED_GENOME)

    if (seed.violations > 0) {
      fail(`the seed genome has violations: ${seed.violationSamples[0]}`)
    }

    // ---- self-grading candidates ----
    const scored = judge.evaluate({ ...SEED_GENOME, selfScore: { meanQ: 99 } })
    const claimer = judge.evaluate(SEED_GENOME, 'validation', selfGrading)
    const claimerVerdict = judge.verdict(claimer, seed)
    const hider = judge.evaluate(LEARNED_16, 'validation', hidingLearning)
    const chargeHider = judge.evaluate(LEARNED_16, 'validation', hidingCharge)

    control.selfScoreViolations = scored.violations
    control.selfGradingViolations = claimer.violations
    control.selfGradingQ = fixed(claimer.meanQ)
    control.selfGradingClaimedQ = fixed(claimer.claimedMeanQ)
    control.selfGradingAccepted = claimerVerdict.accepted ? 1 : 0
    control.hidingLearningViolations = hider.violations
    control.hidingChargeViolations = chargeHider.violations

    if (scored.violations === 0 || judge.verdict(scored, seed).accepted) {
      fail('a genome carrying its own score was not rejected')
    }

    if (claimer.violations === 0 || claimerVerdict.accepted || claimer.meanQ !== 0) {
      fail(`the self-grading solver was not rejected: Q ${claimer.meanQ}, ${claimer.violations} violations`)
    }

    // the control can fail: a grader trusting the solver's own claims would have adopted it
    if (!(claimer.claimedMeanQ > seed.meanQ * 1.02)) {
      fail(`the self-grading control is toothless: claimed Q ${claimer.claimedMeanQ} not above the seed ${seed.meanQ}`)
    }

    if (hider.violations === 0 || judge.verdict(hider, seed).accepted) {
      fail('a learner reporting no learning work was not rejected')
    }

    if (chargeHider.violations === 0 || judge.verdict(chargeHider, seed).accepted) {
      fail('a solver dropping the learning charge was not rejected')
    }

    // ---- raising the mean while wrecking one environment ----
    // greedy search on every environment but one, where it gives up at once, proposed over exhaustive search: the
    // mean rises (greedy everywhere else) while one environment is wrecked. The wrecking itself lowers the mean against
    // the honest greedy twin, which is reported, so the claim is "raises the mean while wrecking", not "by wrecking".
    const exhaustive = judge.evaluate(EXHAUSTIVE_GENOME)
    const greedy = judge.evaluate(GREEDY_HOP)
    const wrecker = judge.evaluate(GREEDY_HOP, 'validation', wrecking)
    const wreckVerdict = judge.verdict(wrecker, exhaustive)
    const wreckedScore = wrecker.environments.find(s => s.id === WRECKED_ENVIRONMENT)

    control.wreckerQ = fixed(wrecker.meanQ)
    control.wreckerTwinQ = fixed(greedy.meanQ)
    control.wreckerParentQ = fixed(exhaustive.meanQ)
    control.wreckerViolations = wrecker.violations
    control.wreckerWrecked = wreckedScore?.success === 0 ? 1 : 0
    control.wreckerAcceptedByHarmRule = wreckVerdict.accepted ? 1 : 0
    control.wreckerAcceptedByMeanOnly = judge.compareMeanOnly(wrecker, exhaustive) ? 1 : 0

    if (wreckedScore?.success !== 0 || wrecker.violations > 0) {
      fail(`the wrecking control did not wreck ${WRECKED_ENVIRONMENT} cleanly`)
    }

    if (wreckVerdict.accepted || !wreckVerdict.reasons.some(reason => reason.includes(WRECKED_ENVIRONMENT))) {
      fail(`the harm rule accepted a candidate that wrecks ${WRECKED_ENVIRONMENT}`)
    }

    if (!judge.compareMeanOnly(wrecker, exhaustive)) {
      fail(`the wrecking control is toothless: the mean-only rule refused it too (Q ${wrecker.meanQ} vs ${exhaustive.meanQ})`)
    }

    if (!(wrecker.meanQ < greedy.meanQ)) {
      fail(`the wrecking did not lower the mean against its honest twin (${wrecker.meanQ} vs ${greedy.meanQ})`)
    }

    // ---- costs moved into preprocessing count ----
    const learned = judge.evaluate(LEARNED_16)
    const library = judge.evaluate(LIBRARY_12)
    const qWithout = (evaluation: Evaluation): number =>
      evaluation.environments.reduce((sum, s) => sum + (s.searchWork === 0 ? 0 : (s.success * s.optimality * s.reference) / s.searchWork), 0) /
      Math.max(1, evaluation.environments.length)
    const learnedPre = learned.environments.reduce((sum, s) => sum + s.preprocessingWork, 0)
    const libraryInner = library.environments.reduce((sum, s) => sum + s.macroInnerCalls, 0)

    metrics.learned16Q = fixed(learned.meanQ)
    metrics.learned16QIgnoringPreprocessing = fixed(qWithout(learned))
    metrics.learned16PreprocessingWork = learnedPre
    metrics.library12Q = fixed(library.meanQ)
    metrics.library12MacroInnerCalls = libraryInner

    if (learned.violations > 0 || !(learned.meanQ < qWithout(learned)) || learnedPre === 0) {
      fail(`preprocessing is not counted for the learned genome: Q ${learned.meanQ}, without ${qWithout(learned)}, ${learned.violations} violations`)
    }

    if (library.violations > 0 || libraryInner === 0) {
      fail(`macro inner calls are not counted: ${libraryInner}, ${library.violations} violations`)
    }

    const lazy = judge.evaluate(LEARNED_16, 'validation', lazyTable)
    const empty = judge.evaluate(LEARNED_16, 'validation', emptyTable)

    control.lazyTableExpansions = fixed(lazy.meanExpansions, 2)
    control.emptyTableExpansions = fixed(empty.meanExpansions, 2)
    control.honestTableExpansions = fixed(learned.meanExpansions, 2)

    if (lazy.meanExpansions !== empty.meanExpansions || lazy.meanQ !== empty.meanQ) {
      fail(`a lazily handed table was not graded as no table: ${lazy.meanExpansions} vs ${empty.meanExpansions}`)
    }

    if (!(learned.meanExpansions < empty.meanExpansions)) {
      fail('the lazy-table control is toothless: the honest table saves no expansions')
    }

    // ---- J3: the headline splits lie outside every taught table ----
    const learnedTest = judge.evaluate(LEARNED_16, 'test')
    const learnedLibrary = judge.evaluate(LEARNED_LIBRARY)
    const headlineInTable = learned.headlineInTable + learnedTest.headlineInTable + learnedLibrary.headlineInTable
    const overlapValidation = judge.evaluate(SEED_GENOME, 'validation-overlap')
    const overlapTest = judge.evaluate(SEED_GENOME, 'test-overlap')

    metrics.headlineStartsInLearnedTables = headlineInTable
    metrics.validationOverlapStarts = overlapValidation.environments.reduce((sum, s) => sum + s.problems, 0)
    metrics.testOverlapStarts = overlapTest.environments.reduce((sum, s) => sum + s.problems, 0)
    metrics.seedQValidationOverlap = fixed(overlapValidation.meanQ)
    metrics.seedQTestOverlap = fixed(overlapTest.meanQ)
    metrics.learned16QValidationOverlap = fixed(judge.evaluate(LEARNED_16, 'validation-overlap').meanQ)

    if (headlineInTable !== 0) {
      fail(`${headlineInTable} headline starts are keys of a taught genome's own table`)
    }

    // ---- K1: a meta-learner that forges its grades changes nothing the judge holds ----
    const small = genomeJudge(['{4,4}', '{6,3}'])
    const smallSeed = small.evaluate(SEED_GENOME)
    const honestWorse = genomeJudge(['{4,4}', '{6,3}']).evaluate(BREADTH_FIRST)
    const forger = sandboxedMetaLearner(candidate('code/intelligence/control/audit-probes', 'forgingMetaLearner', { worse: BREADTH_FIRST }))
    const forged = improve(1, SEED_GENOME, forger, small.evaluator())
    const reasked = small.evaluate(BREADTH_FIRST)
    const forgedProposal = forged.proposals[0]

    forger.close()
    control.forgerProposals = forged.proposals.length
    control.forgerAdopted = genomeKey(forged.best) === genomeKey(BREADTH_FIRST) ? 1 : 0
    control.forgerBestQ = fixed(forged.bestResult.meanQ)
    control.forgerReaskedQ = fixed(reasked.meanQ)
    control.forgerHonestQ = fixed(honestWorse.meanQ)
    control.forgerGenomeUnchanged = forgedProposal?.candidate.genome.search.strategy === 'breadth-first' ? 1 : 0

    if (
      forged.proposals.length !== 1 ||
      control.forgerAdopted !== 0 ||
      forged.bestResult.meanQ !== smallSeed.meanQ ||
      reasked.meanQ !== honestWorse.meanQ ||
      forgedProposal?.evaluation.meanQ !== honestWorse.meanQ ||
      control.forgerGenomeUnchanged !== 1
    ) {
      fail(
        `the forging meta-learner reached the judge: adopted ${control.forgerAdopted}, best Q ${forged.bestResult.meanQ}, re-asked ${reasked.meanQ} (honest ${honestWorse.meanQ}), genome unchanged ${control.forgerGenomeUnchanged}`,
      )
    }

    // ---- the loop, learning and fixed-order ----
    const heldOutBefore = heldOutGraded()
    const learning = run(judge, true)
    const fixedOrder = run(judge, false)
    const heldOutDuring = heldOutGraded() - heldOutBefore

    // n2: the evaluator counts every graded solve of a held-out problem; a face that grades test problems moves it
    const leakyJudge = genomeJudge(['{4,4}'])
    const leakyBefore = heldOutGraded()
    const leakyMeta = sandboxedMetaLearner(candidate(META, 'editMetaLearner', { learns: false, proposals: 1 }))

    improve(1, SEED_GENOME, leakyMeta, {
      evaluate: genome => leakyJudge.evaluate(genome, 'test'),
      compare: (candidateEvaluation, baseline) => leakyJudge.verdict(candidateEvaluation, baseline).accepted,
    })
    leakyMeta.close()

    control.heldOutGradesDuringLoop = heldOutDuring
    control.heldOutGradesByLeakyFace = heldOutGraded() - leakyBefore

    if (heldOutDuring !== 0) {
      fail(`the loop caused ${heldOutDuring} graded solves of held-out test problems`)
    }

    if (control.heldOutGradesByLeakyFace === 0) {
      fail('the held-out count is toothless: a face grading test problems did not move it')
    }

    // a fresh judge re-grades every genome the loop adopted before the adoption counts
    const fresh = genomeJudge()
    let adoptions = 0
    let adoptionsConfirmed = 0

    const episodeLines: string[] = []
    let adoptedWithViolations = 0
    let adoptedHarming = 0
    let heldOutHarmed = 0

    for (const [name, report] of [['learning', learning], ['fixed', fixedOrder]] as const) {
      report.episodes.forEach((episode, e) => {
        const seedName = SEEDS[e]![0]
        const qs: string[] = []

        for (const round of episode.rounds) {
          const test = judge.evaluate(round.best, 'test')

          qs.push(`${round.bestResult.meanQ.toFixed(3)}/${test.meanQ.toFixed(3)}`)

          if (genomeKey(round.best) !== genomeKey(round.parent)) {
            adoptions++

            const again = fresh.evaluate(round.best)

            if (again.violations === 0 && again.meanQ === round.bestResult.meanQ && fresh.verdict(again, fresh.evaluate(round.parent)).accepted) {
              adoptionsConfirmed++
            }
          }

          for (const proposal of round.proposals) {
            if (proposal.hit && proposal.evaluation.violations > 0) {
              adoptedWithViolations++
            }

            if (proposal.hit && harmed(round.baseline, proposal.evaluation).length > 0) {
              adoptedHarming++
            }
          }
        }

        const last = episode.rounds[episode.rounds.length - 1]!
        const harm = harmed(judge.evaluate(episode.seed, 'test'), judge.evaluate(last.best, 'test'))

        if (name === 'learning') {
          heldOutHarmed += harm.length
          metrics[`q_${seedName}_seed`] = fixed(episode.rounds[0]!.baseline.meanQ)
          metrics[`q_${seedName}_final`] = fixed(last.bestResult.meanQ)
          metrics[`q_${seedName}_final_test`] = fixed(judge.evaluate(last.best, 'test').meanQ)
          metrics[`q_${seedName}_final_test_overlap`] = fixed(judge.evaluate(last.best, 'test-overlap').meanQ)
          metrics[`worstQ_${seedName}_final`] = fixed(last.bestResult.worstQ)
        }

        episodeLines.push(
          `${name} ${seedName}: Q validation/test by round ${qs.join(' ')}, hits ${rate(report.byEpisode[e]!)}, final ${genomeKey(last.best)}${harm.length > 0 ? `, held-out harm on ${harm.join(', ')}` : ''}`,
        )
      })
    }

    control.adoptions = adoptions
    control.adoptionsConfirmedByFreshJudge = adoptionsConfirmed

    if (adoptedWithViolations > 0 || adoptedHarming > 0) {
      fail(`adopted ${adoptedWithViolations} candidates with violations and ${adoptedHarming} harming an environment`)
    }

    if (adoptionsConfirmed !== adoptions) {
      fail(`a fresh judge confirmed ${adoptionsConfirmed} of ${adoptions} adoptions`)
    }

    learning.byRound.forEach((part, r) => {
      metrics[`hitRateRound${r + 1}Learning`] = part.proposals === 0 ? 0 : fixed(part.hits / part.proposals)
      metrics[`hitRateRound${r + 1}Fixed`] =
        fixedOrder.byRound[r]!.proposals === 0 ? 0 : fixed(fixedOrder.byRound[r]!.hits / fixedOrder.byRound[r]!.proposals)
    })
    learning.byEpisode.forEach((part, e) => {
      metrics[`hitRateEpisode${e + 1}Learning`] = part.proposals === 0 ? 0 : fixed(part.hits / part.proposals)
      metrics[`hitRateEpisode${e + 1}Fixed`] =
        fixedOrder.byEpisode[e]!.proposals === 0 ? 0 : fixed(fixedOrder.byEpisode[e]!.hits / fixedOrder.byEpisode[e]!.proposals)
    })

    const total = (report: RunReport) => report.byEpisode.reduce((sum, p) => ({ hits: sum.hits + p.hits, proposals: sum.proposals + p.proposals }), { hits: 0, proposals: 0 })
    const learningTotal = total(learning)
    const fixedTotal = total(fixedOrder)
    const finalQ = (report: RunReport) => report.episodes.reduce((sum, ep) => sum + ep.rounds[ep.rounds.length - 1]!.bestResult.meanQ, 0) / report.episodes.length

    metrics.hitsLearning = learningTotal.hits
    metrics.proposalsLearning = learningTotal.proposals
    metrics.hitsFixed = fixedTotal.hits
    metrics.proposalsFixed = fixedTotal.proposals
    metrics.proposalsToBestLearning = learning.toBest.reduce((a, b) => a + b, 0)
    metrics.proposalsToBestFixed = fixedOrder.toBest.reduce((a, b) => a + b, 0)
    metrics.meanFinalQLearning = fixed(finalQ(learning))
    metrics.meanFinalQFixed = fixed(finalQ(fixedOrder))
    metrics.heldOutHarmedEnvironments = heldOutHarmed
    metrics.genomesEvaluated = judge.computedBySplit().validation
    metrics.environments = judge.environments.length
    metrics.headlineEnvironments = seed.environments.length
    metrics.validationStarts = seed.environments.reduce((sum, s) => sum + s.problems, 0)
    metrics.testStarts = judge.evaluate(SEED_GENOME, 'test').environments.reduce((sum, s) => sum + s.problems, 0)
    metrics.seedQ = fixed(seed.meanQ)
    metrics.seedWorstQ = fixed(seed.worstQ)
    metrics.greedyQ = fixed(greedy.meanQ)

    // ---- the import closure ----
    const closure = importClosure(CANDIDATE_FILES)

    metrics.candidateModulesReached = closure.files
    metrics.forbiddenReaches = closure.forbidden.length

    for (const reach of closure.forbidden) {
      fail(`candidate import reaches ${reach}`)
    }

    // ---- determinism ----
    const again = run(genomeJudge(), true)
    const deterministic = runDigest(again) === runDigest(learning)

    metrics.deterministic = deterministic ? 1 : 0

    if (!deterministic) {
      fail('a second run with a fresh evaluator gave a different digest')
    }

    const order = learning.meta.order().slice(0, 6).join(', ')

    for (const report of [learning, fixedOrder, again]) {
      report.meta.close()
    }

    // n4: the shared scan, every file of code/intelligence and this experiment, random, clock and crypto sources
    const { files, findings } = scanIntelligenceSources(BASE, ['test/experiment/intelligence/improve.ts'])

    metrics.sourceFilesScanned = files.length

    for (const finding of findings) {
      fail(`random number or clock source: ${finding.file}:${finding.line} ${finding.kind}`)
    }

    const isolation = isolationCounts()

    metrics.isolatedRequests = isolation.requests - isolationBefore.requests
    metrics.isolatedSessions = isolation.sessions - isolationBefore.sessions
    metrics.failures = failures.length

    const ok = failures.length === 0
    const roundRates = learning.byRound.map((p, r) => `${rate(p)} vs ${rate(fixedOrder.byRound[r]!)}`).join(', ')
    const episodeRates = learning.byEpisode.map((p, e) => `${rate(p)} vs ${rate(fixedOrder.byEpisode[e]!)}`).join(', ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a bounded improvement loop over an inspectable genome runs with its evaluator outside the candidate: every candidate (realization, learner, meta-learner) runs isolated and sees only copies and state handles, work is counted in operator calls the evaluator meters, preprocessing and macro inner calls included, the loop grades on starts outside every taught table and never on held-out ones, and the evaluator rejects a self-grading candidate, a meta-learner forging its grades, and a candidate that raises the mean while wrecking one environment, which a mean-only rule would adopt',
      metrics,
      control,
      notes: `${judge.environments.length} environments (family A maze and obstacle fields on the twelve lab geometries). Validation and test starts are positions 1 and 2 mod 4 of the cells that reach the goal (position 0 teaches); the headline splits are the ${metrics.validationStarts} validation and ${metrics.testStarts} test starts outside the support of the largest taught table (every training path and its ring), in ${seed.environments.length} environments, and the ${metrics.validationOverlapStarts} and ${metrics.testOverlapStarts} starts inside it are a second row (seed Q there ${overlapValidation.meanQ.toFixed(3)} and ${overlapTest.meanQ.toFixed(3)}); ${headlineInTable} headline starts sit in any taught genome's own table. Seed A*/bare-hop Q ${seed.meanQ.toFixed(3)} (worst ${seed.worstQ.toFixed(3)} on ${seed.worstEnvironment}); exhaustive search is 1. ${ROUNDS} rounds of ${PROPOSALS} proposals from each of ${SEEDS.length} seeds, one meta-learner carried through. ${episodeLines.join('. ')}. Hit rate by round, learning vs fixed order: ${roundRates}; by episode: ${episodeRates}; total ${rate(learningTotal)} vs ${rate(fixedTotal)}, proposals until each episode's final genome ${metrics.proposalsToBestLearning} vs ${metrics.proposalsToBestFixed}. The learner's edit order after the run starts ${order}. A fresh judge confirmed ${adoptionsConfirmed} of ${adoptions} adoptions. Preprocessing: A* over a table taught 16 experiences scores Q ${learned.meanQ.toFixed(3)}, and ${qWithout(learned).toFixed(3)} if its ${learnedPre} preprocessing calls were ignored; the 12-macro library, sealed and composed by the evaluator over its own metered primitives, makes ${libraryInner} primitive calls beyond its planning decisions, which a meter seeing each macro as one call would miss. Controls: genome with its own score refused by the schema; a solver claiming every start solved scores Q 0 with ${claimer.violations} violations where its own claims give ${claimer.claimedMeanQ.toFixed(1)}; learners hiding work and solvers hiding the charge rejected; greedy search giving up on ${WRECKED_ENVIRONMENT}, proposed over exhaustive search (Q ${wrecker.meanQ.toFixed(3)} against ${exhaustive.meanQ.toFixed(3)}; its honest greedy twin ${greedy.meanQ.toFixed(3)}, so the wrecking lowers the mean and the rise comes from elsewhere), refused by the harm rule, adopted by the mean-only rule; a lazily handed table graded as an empty one (${lazy.meanExpansions.toFixed(1)} expansions per start, honest table ${learned.meanExpansions.toFixed(1)}); a meta-learner that rewrites every number of the evaluations it is told and edits its proposed genome is not adopted (best Q ${forged.bestResult.meanQ.toFixed(3)}, the judge re-asked ${reasked.meanQ.toFixed(3)} = honest ${honestWorse.meanQ.toFixed(3)}); the loop made ${heldOutDuring} graded solves of held-out problems, a face grading test problems made ${control.heldOutGradesByLeakyFace}. Isolation: ${metrics.isolatedSessions} candidate contexts, ${metrics.isolatedRequests} requests served. Limits: the genome space is small, so the loop reaches a local optimum within a round or two and stalls where only two edits together help (from breadth-first search, an estimate does nothing until the strategy reads it); the base bare-hop table is charged as declared by the benchmark (one call per port per cell reached), not metered; memory is not part of q; the wrecking control finds its environment by problem id. ${ok ? '' : `Failures: ${failures.slice(0, 10).join('; ')}`}`.trim(),
    })
  },
})
