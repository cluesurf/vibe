/**
 * What the bounded improvement loop passes around (the source's section
 * 15.7): an evaluation of a genome, a candidate edit, the meta-learner that
 * proposes edits and learns from their results, and the evaluator's face as
 * the loop sees it. Types only: the evaluator itself lives in
 * `improve/judge/`, which no candidate module may import.
 *
 * Changes from the source. An evaluation is a distribution, never one mean:
 * every environment keeps its own success, optimality, work and score, with
 * the worst case beside the mean, because a mean permits severe harm to one
 * for a small gain to many (readme rule 5). The work counted is the
 * evaluator's own: search operator calls it metered, plus every preprocessing
 * charge (teaching, discovery, the base table), so work moved out of the
 * search still counts. `learn` is told whether the evaluator adopted the
 * candidate over its parent, since the meta-learner may not grade it itself.
 * Evaluation is synchronous: every solve here is a deterministic computation.
 */

import type { IntelligenceGenome } from '@/code/intelligence/genome/genome'

/** One environment's share of an evaluation. */
export interface EnvironmentScore {
  id: string
  problems: number
  /** fraction of problems solved, as the evaluator verified it */
  success: number
  /** mean over solved problems of the true shortest cost over the path's cost (1 when every path is shortest) */
  optimality: number
  /** primitive operator calls the evaluator counted plus every preprocessing charge, in operator calls */
  work: number
  /** the search part of `work`: primitive calls the evaluator counted, a macro's inner steps included */
  searchWork: number
  /**
   * primitive calls beyond the planning decisions (`searchWork` less the calls on
   * the operators handed over, a macro counting one): what a meter seeing each
   * macro as one call would miss; zero without macros
   */
  macroInnerCalls: number
  /** the preprocessing part of `work`: teaching, discovery and the base table */
  preprocessingWork: number
  /** the same for exhaustive breadth-first search on the same problems */
  reference: number
  /** success x optimality x reference / work: 1 for exhaustive search, above 1 when better */
  q: number
}

export interface Evaluation {
  /** the genome's content key */
  genome: string
  /**
   * the problems graded: validation (the loop's) or test (held out, reported
   * only), each the starts outside every learned table's support; the
   * `-overlap` splits are the starts inside it, a secondary row
   */
  split: 'validation' | 'test' | 'validation-overlap' | 'test-overlap'
  /** Q, the mean of q over environments */
  meanQ: number
  /** the smallest q of any environment */
  worstQ: number
  worstEnvironment: string
  successRate: number
  /** mean path cost over solved problems, as the evaluator recomputed it */
  meanCost: number
  /** mean distinct states the evaluator saw operators consulted on, per problem */
  meanExpansions: number
  /** total work over every environment, preprocessing counted */
  resourceCost: number
  /** rules broken: genome schema, rejected learning, graded-solve violations */
  violations: number
  violationSamples: string[]
  environments: EnvironmentScore[]
}

export interface Candidate {
  genome: IntelligenceGenome
  parentVersion: number
  /** the edit that made it, by name */
  edit: string
  description: string
}

export interface MetaLearner {
  id: string
  propose: (genome: IntelligenceGenome, evaluation: Evaluation) => Candidate[]
  /** `adopted`: whether the evaluator judged the candidate better than its parent */
  learn: (candidate: Candidate, result: Evaluation, adopted: boolean) => void
}

/**
 * The evaluator as the loop holds it: grading on validation problems only.
 * Its evaluations are frozen copies, and `compare` reads the evaluator's own
 * records of the two genomes, never the numbers on the objects passed in.
 */
export interface Evaluator {
  evaluate: (genome: IntelligenceGenome) => Evaluation
  compare: (candidate: Evaluation, baseline: Evaluation) => boolean
}
