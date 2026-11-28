/**
 * The graph-search baselines as isolated candidates: each factory takes its
 * arguments as plain data and what the evaluator handed in through the host,
 * and builds a solver inside the candidate's own context.
 *
 * A heuristic is described as data: the estimate artifact it reads (by
 * name, null for none), a learned table it takes the larger value of (by
 * name), a weight, and the preprocessing the solver declares in its ledger.
 * The evaluator charges whatever sealed table the solve reads, whatever the
 * declaration says.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import { NO_PREPROCESSING, type Preprocessing, type Solver } from '@/code/intelligence/solver/solver'
import { aStarSolver, greedySolver } from '@/code/intelligence/solver/search/best-first'
import { breadthFirstSolver } from '@/code/intelligence/solver/search/breadth-first'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
import { iterativeDeepeningSolver } from '@/code/intelligence/solver/search/iterative-deepening'
import { quantumWalkSolver } from '@/code/intelligence/solver/quantum/quantum-search'
import { HONEST_SETTINGS, SWITCH_SETTINGS, meshWaveSolver } from '@/code/intelligence/solver/mesh/mesh-wave'
import type { MeshHost } from '@/code/intelligence/solver/mesh/switch'

export interface HeuristicData {
  id: string
  /** the estimate artifact read, by name; null reads nothing (the estimate is 0) */
  estimate: string | null
  /** a learned table artifact: the estimate is the larger of the base and the table's value */
  table?: string
  /** a multiplier on the estimate (1 keeps an admissible estimate admissible) */
  weight?: number
  /** what the solver declares in its ledger */
  preprocessing: Preprocessing
}

export interface SearchArgs { heuristic?: HeuristicData }

/** The heuristic `data` describes, reading through `host`. */
export function heuristicOf<S>(data: HeuristicData | undefined, host: CandidateHost<S>): Heuristic<S> {
  if (data === undefined) {
    return { id: 'none', estimate: () => 0, preprocessing: { ...NO_PREPROCESSING } }
  }

  const weight = data.weight ?? 1
  const base = data.estimate === null ? null : host.estimate(data.estimate)
  const table = data.table === undefined ? null : host.table(data.table)
  const estimate = (state: S): number => {
    const value = base === null ? 0 : base(state)
    const learned = table === null ? undefined : table.get(host.key(state))

    return weight * (learned === undefined || learned < value ? value : learned)
  }

  return { id: data.id, estimate, preprocessing: { ...data.preprocessing } }
}

export function breadthFirst<S>(): Solver<S> {
  return breadthFirstSolver<S>()
}

export function aStar<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  return aStarSolver(heuristicOf(args.heuristic, host))
}

export function greedy<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  return greedySolver(heuristicOf(args.heuristic, host))
}

export function idaStar<S>(args: SearchArgs, host: CandidateHost<S>): Solver<S> {
  return iterativeDeepeningSolver(heuristicOf(args.heuristic, host))
}

/** The Q7 quantum solver: the exact Grover walk over the swept state graph (solver/quantum). It reads no heuristic. */
export function quantumWalk<S>(): Solver<S> {
  return quantumWalkSolver<S>()
}

/** The level-4 solver: an M3-B wave frontier and an M4 register, decisions in candidate code (solver/mesh). */
export function meshWave<S>(): Solver<S> {
  return meshWaveSolver<S>(HONEST_SETTINGS)
}

/**
 * Level 4, slice 2: meshWave with the lit test and the expand gate run as M5 switch layouts (solver/mesh/switch),
 * every run executed and metered by the evaluator through the host.
 */
export function meshSwitch<S>(_args: unknown, host: CandidateHost<S> & MeshHost<S>): Solver<S> {
  return meshWaveSolver<S>(SWITCH_SETTINGS, host)
}
