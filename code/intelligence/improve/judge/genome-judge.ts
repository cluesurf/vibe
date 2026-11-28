/**
 * The evaluator of genomes: it stands outside every candidate. It reads a
 * genome as data, checks it against the schema, copies and freezes it,
 * teaches the candidate's learner under `evaluateLearning`'s meter (the
 * learner runs isolated), seals the macros the discoverer confirmed as a
 * library (`sealLibrary`, names only, each one the learning proposed under
 * the meter), and grades every solve with `evaluate`, which runs the
 * candidate's solver isolated, composes the library over its own metered
 * primitives, replays the path, and requires the ledger to carry the
 * preprocessing the evaluator measured. Nothing the candidate says about
 * itself is believed.
 *
 * Its measure is a distribution. On each environment:
 *
 *   q = success x optimality x reference / work
 *
 * where success is the fraction of problems solved (verified), optimality
 * the mean of true shortest cost over path cost on the solved ones, work
 * the primitive operator calls the evaluator counted (a macro's inner steps
 * included, by the evaluator's own meter), plus every preprocessing
 * charge in operator calls (the metered teaching and discovery, and the
 * base distance table at one call per port of each of its expansions, once
 * per environment when anything reads it), and reference the same work for
 * exhaustive breadth-first search on the same problems. Exhaustive search
 * scores q = 1 everywhere. Q is the mean of q over environments, reported
 * with the worst environment beside it.
 *
 * The headline splits (`validation`, `test`) are the starts outside the
 * largest taught table's support (judge/environment.ts); an environment with
 * no such start is left out of that split. The `-overlap` splits are the
 * starts inside it.
 *
 * A candidate is accepted over a baseline only when it has no violation,
 * raises Q by more than a margin, and harms no environment: in every one,
 * success does not fall, q falls by at most a tenth, and optimality stays
 * at or above 0.9. The mean-only rule is kept as a control, to show the hole
 * the harm constraints close.
 *
 * Its records are its own: an evaluation handed out is a deep
 * frozen copy, the cache keeps the original, and the face handed to the loop
 * compares the judge's own records of the two genomes, never the objects it
 * is passed.
 *
 * Evaluator side. No candidate module may import this folder (check:layers).
 */

import { type IntelligenceGenome, genomeKey, isTaught, readsBaseTable, validateGenome } from '@/code/intelligence/genome/genome'
import type { EnvironmentScore, Evaluation, Evaluator } from '@/code/intelligence/improve/evaluation'
import { judgeEnvironments, problemsOf, type JudgeEnvironment, type Split } from '@/code/intelligence/improve/judge/environment'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import {
  artifactCharge,
  artifactId,
  callTotal,
  candidate,
  evaluate,
  evaluateLearning,
  type SealedLibrary,
  sealLibrary,
} from '@/code/intelligence/problem/evaluate'
import { NO_PREPROCESSING, type Preprocessing } from '@/code/intelligence/solver/solver'
import type { LabGeometryName } from '@/code/substrate/lab-geometry'

export const HARM_TOLERANCE = 0.1
export const OPTIMALITY_FLOOR = 0.9
export const IMPROVEMENT_MARGIN = 0.02

/** A candidate factory by module and export name. */
export interface FactoryName { module: string; export: string }

/** How a genome becomes behavior: the learner and the solver factories, both isolated candidates. */
export interface RealizationSpec { learner: FactoryName; solver: FactoryName }

const REALIZE = 'code/intelligence/genome/realize'

export const DEFAULT_REALIZATION: RealizationSpec = {
  learner: { module: REALIZE, export: 'realizedLearner' },
  solver: { module: REALIZE, export: 'realizedSolver' },
}

/** An evaluation with what a grader trusting the candidate's own claims would have scored. */
export type JudgeEvaluation = Evaluation & {
  /** fraction of solves the solver claimed solved */
  claimedSuccess: number
  /** mean q computed from the solver's claims and its own ledger, as a self-grader would */
  claimedMeanQ: number
  /** headline problems whose start was a key of the genome's own learned table (zero by construction for every taught genome) */
  headlineInTable: number
}

export interface Verdict { accepted: boolean; reasons: string[] }

export interface GenomeJudge {
  environments: readonly JudgeEnvironment[]
  /** grade a genome (any value: a non-genome is graded as a violation) on a split, with a realization */
  evaluate: (genome: unknown, split?: Split, realization?: RealizationSpec) => JudgeEvaluation
  /** the harm-aware rule, with every reason a candidate is refused */
  verdict: (candidate: Evaluation, baseline: Evaluation) => Verdict
  /** the control rule: no violation and a higher mean, harm ignored */
  compareMeanOnly: (candidate: Evaluation, baseline: Evaluation) => boolean
  /** the face handed to the loop: validation problems only, the harm-aware rule on the judge's own records */
  evaluator: () => Evaluator
  /** evaluations actually computed (cached repeats not counted) */
  computed: () => number
  /** the same, by split */
  computedBySplit: () => Record<Split, number>
}

const fraction = (part: number, whole: number): number => (whole === 0 ? 0 : part / whole)

/** A deep copy that no one can change: what the judge hands out. */
export function frozenCopy<T>(value: T): T {
  const copy = structuredClone(value)

  const freeze = (item: unknown): void => {
    if (typeof item === 'object' && item !== null && !Object.isFrozen(item)) {
      Object.freeze(item)
      Object.values(item).forEach(freeze)
    }
  }

  freeze(copy)

  return copy
}

/** The charge a solve under `genome` must carry, decided here from the record, never by the candidate's code. */
function requiredCharge(genome: IntelligenceGenome, base: Preprocessing, learning: Preprocessing): Preprocessing {
  const read = readsBaseTable(genome) ? base : NO_PREPROCESSING

  return {
    expansions: read.expansions + learning.expansions,
    operatorCalls: read.operatorCalls + learning.operatorCalls,
    memoryBytes: read.memoryBytes + learning.memoryBytes,
  }
}

function rejected(genome: unknown, split: Split, violations: string[]): JudgeEvaluation {
  return {
    genome: typeof genome === 'object' && genome !== null ? 'invalid' : String(genome),
    split,
    meanQ: 0,
    worstQ: 0,
    worstEnvironment: '',
    successRate: 0,
    meanCost: 0,
    meanExpansions: 0,
    resourceCost: 0,
    violations: violations.length,
    violationSamples: violations.slice(0, 5),
    environments: [],
    claimedSuccess: 0,
    claimedMeanQ: 0,
    headlineInTable: 0,
  }
}

function asSteps(report: unknown): string[][] {
  const steps = (report as { macroSteps?: unknown } | null)?.macroSteps

  if (!Array.isArray(steps)) {
    return []
  }

  return steps.filter((list): list is string[] => Array.isArray(list) && list.every(step => typeof step === 'string'))
}

export function genomeJudge(names?: readonly LabGeometryName[]): GenomeJudge {
  const environments = judgeEnvironments(names)
  const references = new Map<string, number>()
  const records = new Map<string, JudgeEvaluation>()

  let computed = 0

  const bySplit: Record<Split, number> = { validation: 0, test: 0, 'validation-overlap': 0, 'test-overlap': 0 }

  /** exhaustive breadth-first search's search calls on a split, as the evaluator counts them */
  function reference(judged: JudgeEnvironment, split: Split): number {
    const id = `${judged.environment.id}|${split}`
    const known = references.get(id)

    if (known !== undefined) {
      return known
    }

    let calls = 0

    for (const problem of problemsOf(judged, split)) {
      const grade = evaluate(candidate(SOLVER_CATALOG, 'breadthFirst'), problem, judged.environment.operators)

      if (!grade.solved) {
        throw new Error(`genomeJudge: breadth-first search failed ${problem.id}, the reference is undefined`)
      }

      calls += callTotal(grade.elementary)
    }

    references.set(id, calls)

    return calls
  }

  function gradeEnvironment(
    genome: IntelligenceGenome,
    judged: JudgeEnvironment,
    split: Split,
    realization: RealizationSpec,
    violations: string[],
  ): { score: EnvironmentScore; costs: number[]; probed: number; claimedSolved: number; claimedQ: number; inTable: number } {
    const environment = judged.environment
    const base = environment.base
    const taught = isTaught(genome)
    const problems = problemsOf(judged, split)

    let table: ReadonlyMap<string, number> = new Map()
    let charge: Preprocessing = { ...NO_PREPROCESSING }
    let libraries: SealedLibrary[] = []
    let inTable = 0

    if (taught) {
      const learning = evaluateLearning({
        build: candidate(realization.learner.module, realization.learner.export, genome),
        teacher: candidate(SOLVER_CATALOG, 'aStar', { heuristic: { id: base.id, estimate: 'base', preprocessing: base.preprocessing } }, { base: base.estimate }),
        training: judged.training.slice(0, genome.learning.experiences),
        operators: environment.operators,
      })

      for (const violation of learning.violations) {
        violations.push(`${environment.id} learning: ${violation}`)
      }

      // the sealed table itself: every read a solve makes is charged by the evaluator
      table = learning.table
      charge = learning.charge

      const steps = asSteps(learning.report)

      // the confirmed macros, sealed by name from what the learning proposed under the meter; the evaluator
      // composes them over its own metered primitives, counts their inner calls, and charges the library whole
      if (steps.length > 0) {
        try {
          const library = sealLibrary({ id: `${environment.id}:${genomeKey(genome)}`, steps, sources: [learning] })

          libraries = [library]
          // the library's charge holds the learning's (its source) plus the bytes of the names it keeps
          charge = artifactCharge(library) ?? charge
        } catch (error) {
          violations.push(`${environment.id} library: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      if (split === 'validation' || split === 'test') {
        const key = environment.training[0]!.key

        // read outside any solve, so it charges nothing
        inTable = problems.filter(problem => learning.table.has(key(problem.initial))).length
      }
    }

    const solver = candidate(
      realization.solver.module,
      realization.solver.export,
      { genome, base: { id: base.id, preprocessing: base.preprocessing }, learningCharge: charge },
      { base: base.estimate, table },
    )
    const required = requiredCharge(genome, base.preprocessing, charge)
    const operators = environment.operators
    const costs: number[] = []

    let solved = 0
    let ratioSum = 0
    let searchCalls = 0
    let decisions = 0
    let probed = 0
    let claimedSolved = 0
    let claimedRatio = 0
    let claimedCalls = 0
    let readBase = false

    const baseId = artifactId(base.estimate)

    for (const problem of problems) {
      // a fresh isolated context for every solve, so nothing the solver caches carries from one problem to the next
      const grade = evaluate(solver, problem, operators, { charge: required, libraries })
      const truth = environment.oracle[judged.startOf.get(problem.id)!]!

      for (const violation of grade.violations) {
        violations.push(`${problem.id}: ${violation}`)
      }

      // primitive work, a macro's inner steps included, as the evaluator's own meter counted it
      searchCalls += callTotal(grade.elementary)
      decisions += callTotal(grade.counted)
      readBase ||= baseId !== null && grade.artifacts.includes(baseId)
      probed += grade.probedStates
      claimedCalls += Number.isFinite(grade.ledger.operatorCalls) ? grade.ledger.operatorCalls : 0

      if (grade.claimedSolved) {
        claimedSolved++
        claimedRatio += grade.solution.cost > 0 ? Math.min(1, truth / grade.solution.cost) : 1
      }

      if (grade.solved && grade.cost !== null) {
        solved++
        ratioSum += truth / grade.cost
        costs.push(grade.cost)
      }
    }

    // preprocessing in operator calls: the metered teaching and discovery, and the base table once when anything reads
    // it, by the record or by the evaluator's own account of what the solves read (a realization reading the table
    // under a genome that says it does not still pays for it)
    const baseCalls = readsBaseTable(genome) || taught || readBase ? base.preprocessing.expansions * environment.operators.length : 0
    const work = searchCalls + charge.operatorCalls + baseCalls
    const ref = reference(judged, split)
    const success = fraction(solved, problems.length)
    const optimality = solved === 0 ? 0 : ratioSum / solved
    const claimedSuccess = fraction(claimedSolved, problems.length)
    const claimedOptimality = claimedSolved === 0 ? 0 : claimedRatio / claimedSolved

    return {
      score: {
        id: environment.id,
        problems: problems.length,
        success,
        optimality,
        work,
        searchWork: searchCalls,
        macroInnerCalls: searchCalls - decisions,
        preprocessingWork: charge.operatorCalls + baseCalls,
        reference: ref,
        q: work === 0 ? 0 : (success * optimality * ref) / work,
      },
      costs,
      probed,
      claimedSolved,
      claimedQ: (claimedSuccess * claimedOptimality * ref) / Math.max(1, claimedCalls),
      inTable,
    }
  }

  const realizationKey = (realization: RealizationSpec): string =>
    `${realization.learner.module}#${realization.learner.export}|${realization.solver.module}#${realization.solver.export}`
  const DEFAULT_KEY = realizationKey(DEFAULT_REALIZATION)

  function evaluateGenome(value: unknown, split: Split = 'validation', realization: RealizationSpec = DEFAULT_REALIZATION): JudgeEvaluation {
    const schema = validateGenome(value)

    if (schema.length > 0) {
      return frozenCopy(rejected(value, split, schema.map(s => `genome: ${s}`)))
    }

    // the judge grades its own frozen copy, so nothing the proposer holds can change what was graded
    const genome = frozenCopy(value as IntelligenceGenome)
    const cacheable = realizationKey(realization) === DEFAULT_KEY
    const id = `${genomeKey(genome)}|${split}`

    if (cacheable) {
      const known = records.get(id)

      if (known !== undefined) {
        return frozenCopy(known)
      }
    }

    computed++
    bySplit[split]++

    const violations: string[] = []
    const scores: EnvironmentScore[] = []
    const costs: number[] = []

    let probed = 0
    let problems = 0
    let claimedSolved = 0
    let claimedQ = 0
    let inTable = 0

    for (const judged of environments) {
      if (problemsOf(judged, split).length === 0) {
        continue
      }

      const result = gradeEnvironment(genome, judged, split, realization, violations)

      scores.push(result.score)
      costs.push(...result.costs)
      probed += result.probed
      problems += result.score.problems
      claimedSolved += result.claimedSolved
      claimedQ += result.claimedQ
      inTable += result.inTable
    }

    let worst = scores[0]

    for (const score of scores) {
      if (worst === undefined || score.q < worst.q) {
        worst = score
      }
    }

    const evaluation: JudgeEvaluation = {
      genome: genomeKey(genome),
      split,
      meanQ: scores.length === 0 ? 0 : scores.reduce((sum, s) => sum + s.q, 0) / scores.length,
      worstQ: worst?.q ?? 0,
      worstEnvironment: worst?.id ?? '',
      successRate: fraction(
        scores.reduce((sum, s) => sum + s.success * s.problems, 0),
        problems,
      ),
      meanCost: costs.length === 0 ? 0 : costs.reduce((sum, c) => sum + c, 0) / costs.length,
      meanExpansions: fraction(probed, problems),
      resourceCost: scores.reduce((sum, s) => sum + s.work, 0),
      violations: violations.length,
      violationSamples: violations.slice(0, 5),
      environments: scores,
      claimedSuccess: fraction(claimedSolved, problems),
      claimedMeanQ: scores.length === 0 ? 0 : claimedQ / scores.length,
      headlineInTable: inTable,
    }
    const kept = frozenCopy(evaluation)

    if (cacheable) {
      records.set(id, kept)
    }

    return frozenCopy(kept)
  }

  function verdict(candidateEvaluation: Evaluation, baseline: Evaluation): Verdict {
    const reasons: string[] = []

    if (candidateEvaluation.violations > 0) {
      reasons.push(`${candidateEvaluation.violations} violations (${candidateEvaluation.violationSamples[0] ?? ''})`)

      return { accepted: false, reasons }
    }

    const before = new Map(baseline.environments.map(s => [s.id, s]))

    if (candidateEvaluation.environments.length !== baseline.environments.length) {
      reasons.push('graded on different environments than the baseline')
    }

    for (const score of candidateEvaluation.environments) {
      const old = before.get(score.id)

      if (old === undefined) {
        reasons.push(`${score.id}: not in the baseline`)
        continue
      }

      if (score.success < old.success) {
        reasons.push(`harm on ${score.id}: success ${score.success.toFixed(3)} below ${old.success.toFixed(3)}`)
      }

      if (score.q < old.q * (1 - HARM_TOLERANCE)) {
        reasons.push(`harm on ${score.id}: q ${score.q.toFixed(3)} below ${old.q.toFixed(3)} by more than a tenth`)
      }

      if (score.optimality < OPTIMALITY_FLOOR) {
        reasons.push(`harm on ${score.id}: optimality ${score.optimality.toFixed(3)} below ${OPTIMALITY_FLOOR}`)
      }
    }

    if (!(candidateEvaluation.meanQ > baseline.meanQ * (1 + IMPROVEMENT_MARGIN))) {
      reasons.push(`Q ${candidateEvaluation.meanQ.toFixed(4)} not above ${baseline.meanQ.toFixed(4)} by the margin`)
    }

    return { accepted: reasons.length === 0, reasons }
  }

  const compareMeanOnly = (candidateEvaluation: Evaluation, baseline: Evaluation): boolean =>
    candidateEvaluation.violations === 0 && candidateEvaluation.meanQ > baseline.meanQ * (1 + IMPROVEMENT_MARGIN)

  /** the judge's own record of an evaluation it handed out on the loop's split, or null */
  const ownRecord = (evaluation: Evaluation): JudgeEvaluation | null =>
    evaluation.split === 'validation' ? (records.get(`${evaluation.genome}|validation`) ?? null) : null

  return {
    environments,
    evaluate: evaluateGenome,
    verdict,
    compareMeanOnly,
    evaluator: () => ({
      evaluate: genome => evaluateGenome(genome, 'validation'),
      compare(candidateEvaluation, baseline) {
        const mine = ownRecord(candidateEvaluation)
        const theirs = ownRecord(baseline)

        return mine !== null && theirs !== null && verdict(mine, theirs).accepted
      },
    }),
    computed: () => computed,
    computedBySplit: () => ({ ...bySplit }),
  }
}
