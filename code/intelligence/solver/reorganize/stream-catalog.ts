/**
 * The level-5 slice-2 solvers as isolated candidates: one stream router in six arms. Each factory takes
 * its arguments as plain data and the host the evaluator hands in (sealed estimate, learned table, metered mesh runs).
 *
 * Candidate side.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Solver } from '@/code/intelligence/solver/solver'
import {
  ARRIVAL_LAYOUT,
  COUNTER_LAYOUT,
  COUNTER_RULE,
  IDENTITY_RULE,
  MOVER_TONE,
  STATIC_TONE,
  streamRouterSolver,
  type RouterArgs,
  type RouterHost,
  type RouterSettings,
} from '@/code/intelligence/solver/reorganize/stream-router'

export const ROUTER_ARMS: Readonly<Record<string, RouterSettings>> = {
  meshRouter: { id: 'mesh-router', rule: COUNTER_RULE, layout: ARRIVAL_LAYOUT, readTone: MOVER_TONE, stream: true, decisions: 'mesh' },
  routerKnockout: { id: 'router-knockout', rule: IDENTITY_RULE, layout: ARRIVAL_LAYOUT, readTone: MOVER_TONE, stream: true, decisions: 'mesh' },
  routerFrozen: { id: 'router-frozen', rule: COUNTER_RULE, layout: ARRIVAL_LAYOUT, readTone: MOVER_TONE, stream: false, decisions: 'mesh' },
  routerSmuggler: { id: 'mesh-router', rule: COUNTER_RULE, layout: ARRIVAL_LAYOUT, readTone: MOVER_TONE, stream: true, decisions: 'table' },
  counterRead: { id: 'counter-read', rule: COUNTER_RULE, layout: COUNTER_LAYOUT, readTone: STATIC_TONE, stream: true, decisions: 'mesh' },
  counterKnockout: { id: 'counter-knockout', rule: IDENTITY_RULE, layout: COUNTER_LAYOUT, readTone: STATIC_TONE, stream: true, decisions: 'mesh' },
}

type Host<S> = CandidateHost<S> & RouterHost<S>

const arm = (name: string): RouterSettings => {
  const settings = ROUTER_ARMS[name]

  if (settings === undefined) {
    throw new Error(`stream-catalog: no arm ${name}`)
  }

  return settings
}

export function meshRouter<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('meshRouter'), args, host)
}

export function routerKnockout<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('routerKnockout'), args, host)
}

export function routerFrozen<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('routerFrozen'), args, host)
}

/** Claims to be the router (same id, same metered runs); prefers from its own table read, ignoring every run. */
export function routerSmuggler<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('routerSmuggler'), args, host)
}

export function counterRead<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('counterRead'), args, host)
}

export function counterKnockout<S>(args: RouterArgs, host: Host<S>): Solver<S> {
  return streamRouterSolver(arm('counterKnockout'), args, host)
}
