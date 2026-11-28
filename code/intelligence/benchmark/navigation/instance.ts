/**
 * One instance of benchmark family A: a problem on one lab geometry, the
 * operators that act on it, the heuristic the informed baselines may use
 * (with what building it cost), and, where one exists, an exact answer
 * computed outside the search machinery.
 *
 * An instance hides its state type behind `grade`, so instances of every
 * kind (an agent among walls, a field of moving walls, tokens, a box) sit
 * in one list. Every grade comes from the outside evaluator.
 */

import { candidate, evaluate, registerPrimitives, sealEstimate, type CandidateSpec, type MeshMeter } from '@/code/intelligence/problem/evaluate'
import type { Operator } from '@/code/intelligence/operator/operator'
import type { Budget, Problem } from '@/code/intelligence/problem/problem'
import type { Heuristic } from '@/code/intelligence/solver/search/expand'
import type { QuantumLedger } from '@/code/intelligence/solver/solver'
import type { LabCurvature, LabGeometryName } from '@/code/substrate/lab-geometry'

export type NavigationKind =
  | 'maze'
  | 'obstacle'
  | 'dynamicMaze'
  | 'tokenSliding'
  | 'sokoban'
  | 'tour'

export const NAVIGATION_KINDS: readonly NavigationKind[] = [
  'maze',
  'obstacle',
  'dynamicMaze',
  'tokenSliding',
  'sokoban',
  'tour',
]

/**
 * `base`: the instance as generated. `blocked`: a copy with the middle cell
 * of its optimal path walled, the robustness probe. `sealed`: a copy with
 * every neighbor of the goal walled, which has no solution, the accuracy
 * probe (a solver must not claim it).
 */
export type InstanceVariant = 'base' | 'blocked' | 'sealed'

export type BaselineName = 'breadthFirst' | 'aStar' | 'idaStar' | 'greedy'

export const BASELINES: readonly BaselineName[] = ['breadthFirst', 'aStar', 'idaStar', 'greedy']

/** The same budget for every instance, so solvers are compared on equal terms. */
export const NAVIGATION_BUDGET: Budget = {
  steps: 100_000,
  expansions: 50_000,
  memoryBytes: 64 * 1024 * 1024,
}

/** The numbers of one evaluator grade, without the path. Every number is the evaluator's own measurement. */
export interface GradeSummary {
  solverId: string
  /** verified by the evaluator */
  solved: boolean
  claimedSolved: boolean
  pathValid: boolean
  withinBudget: boolean
  /** the evaluator's recomputed cost, null when the path is invalid */
  cost: number | null
  steps: number
  /** operator calls the evaluator counted itself */
  operatorCalls: number
  /** distinct states the evaluator saw an operator consulted on */
  expansions: number
  /** what the solver's ledger said, for comparison only */
  ledgerExpansions: number
  /** the preprocessing the evaluator charged: the sealed tables the solve read */
  preprocessingExpansions: number
  /**
   * bytes charged against the budget: the larger of the ledger's peak and the measured peak, plus the charged
   * preprocessing bytes (the meter gives a floor on memory, never the whole of it, so a ledger may only raise it)
   */
  bytes: number
  /** the measured floor alone: the most bytes live at once in the call trace, plus the charged preprocessing bytes */
  measuredBytes: number
  /** measured peak of live states */
  peakStates: number
  /** the ledger's own peak bytes, for comparison only */
  ledgerPeakBytes: number
  /** a quantum solver's typed ledger as the evaluator read and checked it, null for a classical solver */
  quantum: QuantumLedger | null
  /** the mesh runs the evaluator executed for the solve, empty for a solver that asked for none */
  mesh: MeshMeter
  violations: string[]
}

export interface NavigationInstance {
  id: string
  kind: NavigationKind
  geometry: LabGeometryName
  curvature: LabCurvature
  cells: number
  variant: InstanceVariant
  /** the optimum computed outside the search machinery, or null when none is computed */
  oracleCost: number | null
  /** whether the oracle found the instance solvable, null when no oracle */
  oracleSolvable: boolean | null
  /** grade one baseline on this instance */
  grade: (baseline: BaselineName) => GradeSummary
  /** grade any candidate solver that works over every state type, handed the instance heuristic */
  gradeRecipe: (recipe: SolverRecipe) => GradeSummary
}

/**
 * A solver for any state type, named as an isolated candidate: a module and
 * its factory, with arguments. The instance adds `heuristic` (its id and
 * charge, as data) to the arguments and hands its sealed estimate in as the
 * artifact `estimate`.
 */
export interface SolverRecipe {
  module: string
  export: string
  args?: Readonly<Record<string, unknown>>
}

export function summarize<S>(
  source: CandidateSpec,
  problem: Problem<S>,
  operators: readonly Operator<S>[],
): GradeSummary {
  const grade = evaluate(source, problem, operators)
  return {
    solverId: grade.solverId,
    solved: grade.solved,
    claimedSolved: grade.claimedSolved,
    pathValid: grade.pathValid,
    withinBudget: grade.withinBudget,
    cost: grade.cost,
    steps: grade.steps,
    operatorCalls: grade.counted.applicable + grade.counted.apply + grade.counted.cost,
    expansions: grade.measured.expansions,
    ledgerExpansions: grade.ledger.expansions,
    preprocessingExpansions: grade.charge.expansions,
    bytes: Math.max(grade.ledger.peakBytes, grade.measured.peakBytes) + grade.charge.memoryBytes,
    measuredBytes: grade.measured.peakBytes + grade.charge.memoryBytes,
    peakStates: grade.measured.peakStates,
    ledgerPeakBytes: grade.ledger.peakBytes,
    quantum: grade.ledger.quantum ?? null,
    mesh: grade.mesh,
    violations: grade.violations,
  }
}

export const SOLVER_CATALOG = 'code/intelligence/solver/catalog'

/** A recipe as a candidate on this instance: the heuristic's id and charge as data, its sealed estimate as an artifact. */
export function recipeCandidate<S>(recipe: SolverRecipe, heuristic: Heuristic<S>): CandidateSpec {
  return candidate(
    recipe.module,
    recipe.export,
    { ...recipe.args, heuristic: { id: heuristic.id, estimate: 'estimate', preprocessing: { ...heuristic.preprocessing } } },
    { estimate: heuristic.estimate },
  )
}

/** A baseline as a candidate: the catalog's factory of the same name. */
export function baselineCandidate<S>(baseline: BaselineName, heuristic: Heuristic<S>): CandidateSpec {
  return recipeCandidate({ module: SOLVER_CATALOG, export: baseline }, heuristic)
}

export function defineInstance<S>(input: {
  id: string
  kind: NavigationKind
  geometry: LabGeometryName
  curvature: LabCurvature
  cells: number
  variant: InstanceVariant
  oracleCost: number | null
  oracleSolvable: boolean | null
  problem: Problem<S>
  operators: readonly Operator<S>[]
  heuristic: Heuristic<S>
}): NavigationInstance {
  // the problem's estimate and the heuristic are one table: sealed once, with what building it cost, so the
  // evaluator charges any solve that reads it by either route
  if (input.problem.distance !== input.heuristic.estimate) {
    throw new Error(`defineInstance ${input.id}: the problem distance and the heuristic must be the same table`)
  }
  const estimate = sealEstimate(`${input.heuristic.id}:${input.id}`, input.heuristic.estimate, input.heuristic.preprocessing)
  const problem: Problem<S> = { ...input.problem, distance: estimate }
  const heuristic: Heuristic<S> = { ...input.heuristic, estimate }
  const operators = registerPrimitives([...input.operators])
  return {
    id: input.id,
    kind: input.kind,
    geometry: input.geometry,
    curvature: input.curvature,
    cells: input.cells,
    variant: input.variant,
    oracleCost: input.oracleCost,
    oracleSolvable: input.oracleSolvable,
    grade: baseline => summarize(baselineCandidate(baseline, heuristic), problem, operators),
    gradeRecipe: recipe => summarize(recipeCandidate(recipe, heuristic), problem, operators),
  }
}
