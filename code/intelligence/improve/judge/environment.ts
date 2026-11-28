/**
 * The evaluator's problems for the improvement loop, fixed before any
 * candidate exists: on each environment of the level-2 split (family A's
 * maze and obstacle fields), the starts that reach the goal in cell order,
 * position p being training when p mod 4 = 0 (taught to a candidate's
 * learner), validation when p mod 4 = 1 (the loop's evaluation) and test
 * when p mod 4 = 2 (held out: graded only to report, never shown to the
 * loop or the meta-learner). The three sets are disjoint.
 *
 * Validation and test are each cut in two by the support of the largest
 * table a genome can be taught (audit 2, J3): the value table the
 * level-2 learner builds from every training start (each taught path and
 * its one ring). A taught genome learns from the first k training starts
 * with the same teacher, so its table is a subset: a start outside this
 * support is outside every taught genome's table. Those starts are the
 * headline splits (`validation`, `test`), where only generalization helps;
 * the starts inside it are the secondary rows (`validation-overlap`,
 * `test-overlap`). Every test problem is tagged held out with the evaluator.
 *
 * Evaluator side. No candidate module may import this folder (check:layers).
 */

import { AGENT, OPEN, agentCell } from '@/code/intelligence/benchmark/navigation/agent-mesh'
import { SOLVER_CATALOG } from '@/code/intelligence/benchmark/navigation/instance'
import { learningEnvironments, type LearningEnvironment } from '@/code/intelligence/experience/learner/navigation-split'
import { candidate, evaluateLearning, markHeldOut } from '@/code/intelligence/problem/evaluate'
import type { Problem } from '@/code/intelligence/problem/problem'
import type { MeshState } from '@/code/intelligence/problem/state'
import type { LabGeometryName } from '@/code/substrate/lab-geometry'

const PERIOD = 4
const VALIDATION_PHASE = 1

export type Split = 'validation' | 'test' | 'validation-overlap' | 'test-overlap'

export const SPLITS: readonly Split[] = ['validation', 'test', 'validation-overlap', 'test-overlap']

export interface JudgeEnvironment {
  environment: LearningEnvironment
  training: Problem<MeshState>[]
  /** validation and test starts outside the largest taught table's support (the headline) */
  validation: Problem<MeshState>[]
  test: Problem<MeshState>[]
  /** validation and test starts inside it (the secondary rows) */
  validationOverlap: Problem<MeshState>[]
  testOverlap: Problem<MeshState>[]
  /** keys of the largest taught table */
  support: ReadonlySet<string>
  /** problem id to start cell, every split */
  startOf: Map<string, number>
}

export function problemsOf(judged: JudgeEnvironment, split: Split): Problem<MeshState>[] {
  switch (split) {
    case 'validation':
      return judged.validation
    case 'test':
      return judged.test
    case 'validation-overlap':
      return judged.validationOverlap
    case 'test-overlap':
      return judged.testOverlap
  }
}

function moveAgent(template: Problem<MeshState>, start: number, id: string): Problem<MeshState> {
  const cells = template.initial.cells.slice()

  cells[agentCell(template.initial)] = OPEN
  cells[start] = AGENT

  return { ...template, id, initial: { cells } }
}

/** The keys of the value table taught from every training start: a superset of every taught genome's table. */
function supportOf(environment: LearningEnvironment): Set<string> {
  const base = environment.base
  const learning = evaluateLearning({
    build: candidate('code/intelligence/experience/learner/catalog', 'valueTable'),
    teacher: candidate(SOLVER_CATALOG, 'aStar', { heuristic: { id: base.id, estimate: 'base', preprocessing: base.preprocessing } }, { base: base.estimate }),
    training: environment.training,
    operators: environment.operators,
  })

  if (!learning.accepted) {
    throw new Error(`judge environment ${environment.id}: the support learning was refused: ${learning.violations[0]}`)
  }

  return new Set(learning.table.keys())
}

function judgeEnvironment(environment: LearningEnvironment): JudgeEnvironment | null {
  const template = environment.training[0]

  if (template === undefined || environment.heldOut.length === 0) {
    return null
  }

  const startOf = new Map(environment.startOf)
  const validation: Problem<MeshState>[] = []

  let position = 0

  for (let cell = 0; cell < environment.oracle.length; cell++) {
    if (environment.oracle[cell]! <= 0) {
      continue
    }

    if (position % PERIOD === VALIDATION_PHASE) {
      const problem = moveAgent(template, cell, `${environment.id}-validation-${cell}`)

      startOf.set(problem.id, cell)
      validation.push(problem)
    }

    position++
  }

  if (validation.length === 0) {
    return null
  }

  const support = supportOf(environment)
  const outside = (problem: Problem<MeshState>): boolean => !support.has(problem.key(problem.initial))
  const test = environment.heldOut

  markHeldOut(test)

  return {
    environment,
    training: environment.training,
    validation: validation.filter(outside),
    test: test.filter(outside),
    validationOverlap: validation.filter(problem => !outside(problem)),
    testOverlap: test.filter(problem => !outside(problem)),
    support,
    startOf,
  }
}

/** The judge's environments on the given geometries (all twelve by default); fields with an empty split are left out. */
export function judgeEnvironments(names?: readonly LabGeometryName[]): JudgeEnvironment[] {
  return learningEnvironments(names)
    .map(judgeEnvironment)
    .filter((environment): environment is JudgeEnvironment => environment !== null)
}
