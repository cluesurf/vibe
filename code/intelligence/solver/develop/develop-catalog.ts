/**
 * The level-7 slice-1 solver as an isolated candidate (level7.md): one developing tie-break router, every arm (developed,
 * undeveloped, knockout, wire, smuggler, misdeveloped) told apart only by its plain-data arguments, which the
 * experiment fixes from its census before any held-out grade.
 *
 * Candidate side.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Solver } from '@/code/intelligence/solver/solver'
import { developRouterSolver, type DevelopArgs, type DevelopHost } from '@/code/intelligence/solver/develop/develop-router'

export function developRouter<S>(args: DevelopArgs, host: CandidateHost<S> & DevelopHost<S>): Solver<S> {
  return developRouterSolver(args, host)
}
