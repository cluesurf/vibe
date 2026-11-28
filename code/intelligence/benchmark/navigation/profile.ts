/**
 * The profile of a solver over benchmark family A: eight dimensions, each
 * measured apart and never summed into one score.
 *
 * The reference on every instance is breadth-first search, graded by the
 * outside evaluator like every other solver: its cost is the optimum (all
 * steps cost 1), and when it runs out of states inside the budget it has
 * proved the instance has no solution. An instance it neither solves nor
 * exhausts is undecided and leaves accuracy alone.
 *
 * - breadth: the share of the six kinds with at least one verified solve.
 * - depth: the longest optimal path (in steps) among its verified solves.
 * - speed: the mean operator calls per instance, as the evaluator counted
 *   them (lower is faster; no clock, so two runs give the same number).
 * - efficiency: the mean bytes per instance charged against the budget:
 *   the larger of the ledger's peak and the floor the evaluator read from
 *   the call trace, plus the preprocessing bytes it charged (lower is
 *   leaner). `measuredEfficiency` is the floor alone.
 * - accuracy: the share of decided instances with the right verdict: a
 *   verified solve where one exists, no claim where none does.
 * - optimality: the share of its verified solves that cost exactly the
 *   breadth-first optimum.
 * - robustness: accuracy restricted to the changed worlds, the blocked
 *   and sealed variants and the dynamic maze.
 * - generalization: the worst accuracy over the twelve geometries.
 */

import {
  BASELINES,
  NAVIGATION_BUDGET,
  NAVIGATION_KINDS,
  type BaselineName,
  type GradeSummary,
  type NavigationInstance,
} from '@/code/intelligence/benchmark/navigation/instance'

export interface Reference {
  /** breadth-first cost, null when it found no path */
  cost: number | null
  /** true: solvable, false: proved unsolvable, null: undecided within the budget */
  solvable: boolean | null
}

export interface GradedInstance {
  instance: NavigationInstance
  grades: Record<BaselineName, GradeSummary>
  reference: Reference
}

export interface Profile {
  breadth: number
  depth: number
  speed: number
  efficiency: number
  measuredEfficiency: number
  accuracy: number
  optimality: number
  robustness: number
  generalization: number
  /** counts behind the shares */
  solved: number
  decided: number
  optimalSolves: number
  preprocessingExpansions: number
}

export function referenceOf(grade: GradeSummary): Reference {
  if (grade.solved) {
    return { cost: grade.cost, solvable: true }
  }
  // exhaustion read from the evaluator's own count of states consulted, never from the solver's ledger
  const exhausted =
    !grade.claimedSolved && grade.violations.length === 0 && grade.expansions + grade.preprocessingExpansions < NAVIGATION_BUDGET.expansions
  return { cost: null, solvable: exhausted ? false : null }
}

export function gradeFamily(instances: readonly NavigationInstance[]): GradedInstance[] {
  return instances.map(instance => {
    const grades = {} as Record<BaselineName, GradeSummary>
    for (const baseline of BASELINES) {
      grades[baseline] = instance.grade(baseline)
    }
    return { instance, grades, reference: referenceOf(grades.breadthFirst) }
  })
}

/** Whether a grade gives the right verdict on a decided instance; null when undecided. */
export function correctVerdict(grade: GradeSummary, reference: Reference): boolean | null {
  if (reference.solvable === null) {
    return null
  }
  return reference.solvable ? grade.solved : !grade.claimedSolved
}

function share(hits: number, total: number): number {
  return total === 0 ? 0 : hits / total
}

export function profileOf(graded: readonly GradedInstance[], baseline: BaselineName): Profile {
  const kinds = new Set<string>()
  let depth = 0
  let calls = 0
  let bytes = 0
  let measuredBytes = 0
  let decided = 0
  let right = 0
  let changedDecided = 0
  let changedRight = 0
  let solved = 0
  let optimalSolves = 0
  let preprocessingExpansions = 0
  const byGeometry = new Map<string, { decided: number; right: number }>()

  for (const { instance, grades, reference } of graded) {
    const grade = grades[baseline]
    calls += grade.operatorCalls
    bytes += grade.bytes
    measuredBytes += grade.measuredBytes
    preprocessingExpansions += grade.preprocessingExpansions
    if (grade.solved) {
      solved++
      kinds.add(instance.kind)
      if (reference.cost !== null) {
        depth = Math.max(depth, reference.cost)
        if (grade.cost === reference.cost) {
          optimalSolves++
        }
      }
    }
    const verdict = correctVerdict(grade, reference)
    if (verdict === null) {
      continue
    }
    decided++
    right += verdict ? 1 : 0
    if (instance.variant !== 'base' || instance.kind === 'dynamicMaze') {
      changedDecided++
      changedRight += verdict ? 1 : 0
    }
    const tally = byGeometry.get(instance.geometry) ?? { decided: 0, right: 0 }
    tally.decided++
    tally.right += verdict ? 1 : 0
    byGeometry.set(instance.geometry, tally)
  }

  let generalization = 1
  for (const tally of byGeometry.values()) {
    generalization = Math.min(generalization, share(tally.right, tally.decided))
  }

  return {
    breadth: share(kinds.size, NAVIGATION_KINDS.length),
    depth,
    speed: share(calls, graded.length),
    efficiency: share(bytes, graded.length),
    measuredEfficiency: share(measuredBytes, graded.length),
    accuracy: share(right, decided),
    optimality: share(optimalSolves, solved),
    robustness: share(changedRight, changedDecided),
    generalization: byGeometry.size === 0 ? 0 : generalization,
    solved,
    decided,
    optimalSolves,
    preprocessingExpansions,
  }
}
