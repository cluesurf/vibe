/**
 * What an isolated candidate is handed besides its problem and operators.
 *
 * Every candidate (solver, learner, discoverer, genome realization,
 * meta-learner) runs in its own context inside a worker, with no file,
 * module or process access, and talks to the evaluator only through plain
 * data. A state there is a handle the evaluator issued, never the state
 * itself: the candidate can read its key, but can make the evaluator act
 * only on states the evaluator made. Tables and estimates the evaluator
 * hands in are read through the host, and every read is metered and charged
 * by the evaluator.
 *
 * Types only, so a candidate may import it.
 */

export interface CandidateHost<S> {
  /** a sealed estimate the evaluator handed in under `name`; every read is metered */
  estimate: (name: string) => (state: S) => number
  /** a table the evaluator handed in under `name`; every read is metered */
  table: (name: string) => ReadonlyMap<string, number>
  /** whether the evaluator handed in an artifact under `name` */
  has: (name: string) => boolean
  /** the key of a state the evaluator issued */
  key: (state: S) => string
}
