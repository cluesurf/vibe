/**
 * The level-8 reading-B solver as an isolated candidate (level8.md): one collective tie-break router, every arm (joint,
 * apart, knockout, wire, smuggler, wrongWords) told apart only by its plain-data arguments, which the experiment fixes
 * from its census before any held-out grade.
 *
 * Candidate side.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Solver } from '@/code/intelligence/solver/solver'
import { collectiveRouterSolver, type CollectiveArgs, type CollectiveHost } from '@/code/intelligence/solver/collective/collective-router'

export function collectiveRouter<S>(args: CollectiveArgs, host: CandidateHost<S> & CollectiveHost<S>): Solver<S> {
  return collectiveRouterSolver(args, host)
}
