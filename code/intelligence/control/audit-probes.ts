/**
 * The candidates of the second audit's probes, ported to the isolated
 * evaluator, each one a control that must be refused:
 *
 * - P1 (K2) `scratchState`: breadth-first search that keeps its frontier as
 *   keys and asks the operators about a state it builds itself (a scratch
 *   handle) instead of the states the evaluator issued.
 * - P2 (K3) `patchingIntrinsics`: A* on the sealed estimate that patches
 *   Set.prototype.add, Map.prototype.set and WeakMap.prototype.get during
 *   its solve, declares no charge and no expansions.
 * - P4 (K1) `forgingMetaLearner`: proposes a worse genome and, when told the
 *   result, rewrites every number of it to the best values.
 *
 * P3 (a solver rebuilding the world from the substrate and the hop-distance
 * oracle) cannot live in this tree: check:layers refuses the file. Its
 * fixture is outside this tree, and the bundle refuses it at run time.
 *
 * Candidate side.
 */

import type { IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Candidate, Evaluation } from '@/code/intelligence/improve/evaluation'
import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import { heuristicOf, type SearchArgs } from '@/code/intelligence/solver/catalog'
import { emptyLedger, NO_PREPROCESSING, type Solver } from '@/code/intelligence/solver/solver'
import { aStarSolver } from '@/code/intelligence/solver/search/best-first'

/** P1: every expansion asks the operators about one scratch state of its own making. */
export function scratchState<S>(args: { scratch: 'number' | 'object' }): Solver<S> {
  return {
    id: 'scratch-state',
    solve(problem, operators) {
      // a state the evaluator never issued: the next handle number, or an object holding the start's key
      const scratch = (args.scratch === 'number' ? 1_000_000 : { key: problem.key(problem.initial) }) as unknown as S
      const ledger = emptyLedger()

      for (const operator of operators) {
        ledger.operatorCalls++
        operator.applicable(scratch)
      }

      return { states: [problem.initial], operators: [], cost: 0, solved: false, ledger: { ...ledger, expansions: 1, peakStates: 1 } }
    },
  }
}

/** P2: patch the realm's intrinsics around an A* solve on the sealed estimate, declaring nothing. */
export function patchingIntrinsics<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  const heuristic = heuristicOf(args.heuristic, host)

  return {
    id: 'patching-intrinsics',
    solve(problem, operators) {
      // the originals, kept to put back (called with an explicit receiver)
      const setAdd = Reflect.get(Set.prototype, 'add') as (this: Set<unknown>, value: unknown) => Set<unknown>
      const mapSet = Reflect.get(Map.prototype, 'set') as (this: Map<unknown, unknown>, key: unknown, value: unknown) => Map<unknown, unknown>
      const weakGet: unknown = Reflect.get(WeakMap.prototype, 'get')

      // the original skipped every state object; here a state is a handle, so Set.add skips numbers and Map.set objects
      Set.prototype.add = function add(this: Set<unknown>, value: unknown) {
        return typeof value === 'number' ? this : setAdd.call(this, value)
      } as typeof Set.prototype.add
      Map.prototype.set = function set(this: Map<unknown, unknown>, key: unknown, value: unknown) {
        return typeof key === 'object' && key !== null ? this : mapSet.call(this, key, value)
      } as typeof Map.prototype.set
      WeakMap.prototype.get = function get() {
        return undefined
      } as typeof WeakMap.prototype.get

      try {
        const solution = aStarSolver<S>({ ...heuristic, preprocessing: { ...NO_PREPROCESSING } }).solve(problem, operators)

        solution.ledger = { ...emptyLedger(), operatorCalls: solution.ledger.operatorCalls, generated: solution.ledger.generated }

        return solution
      } finally {
        Reflect.set(Set.prototype, 'add', setAdd)
        Reflect.set(Map.prototype, 'set', mapSet)
        Reflect.set(WeakMap.prototype, 'get', weakGet)
      }
    },
  }
}

/** P4: a meta-learner that forges its grades and edits its genome after proposing it. */
export function forgingMetaLearner(args: { worse: IntelligenceGenome }) {
  const proposed: Candidate[] = []

  return {
    id: 'forging-meta-learner',
    propose(genome: IntelligenceGenome): Candidate[] {
      const candidate: Candidate = { genome: { ...args.worse, version: genome.version + 1 }, parentVersion: genome.version, edit: 'strategy-breadth-first', description: 'forger' }

      proposed.push(candidate)

      return [candidate]
    },
    learn(candidate: Candidate, result: Evaluation) {
      result.meanQ = 1e9
      result.worstQ = 1e9

      for (const score of result.environments) {
        score.q = 1e9
        score.success = 1
        score.optimality = 1
      }

      // and the genome it proposed, after the judge graded it
      candidate.genome.search.strategy = 'greedy'

      for (const mine of proposed) {
        mine.genome.search.strategy = 'greedy'
      }
    },
    order: () => ['forger'],
  }
}
