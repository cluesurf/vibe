/**
 * Level 5, slice 2: a structure that a stream of movers rewrites, asked to route a later mover. On the
 * vacuum under `id.CBA.swap` (M6's T5 counter) a static -1 is shifted one cell by every +1 that crosses it. Each
 * successor a search generates gets one such structure: its experience stream is one +1 mover when the learned table
 * holds the successor (a state on or beside a taught path, level 2), none otherwise; then a probe +1 is sent after it,
 * and the read cell at the read round says whether the successor is preferred. A preferred successor wins ties of A*
 * (equal g + h): the search stays optimal, and only its order, so its expansions, can change.
 *
 * The candidate never runs a round. Every run is asked of the evaluator through `meshRuns`, which names
 * the rule, gives the layout as data and per successor the issued state and the input word [stream, probe]; the
 * evaluator executes and meters every round. So the structure is rebuilt in every run from the static, its stream and
 * the probe: what the stream left is carried by the mesh's own dynamics inside the run, never by candidate code.
 *
 * Arms (catalog in stream-catalog.ts): the honest router reads the probe's arrival at a target (`readTone` +1, the
 * probe's tone); its knockout runs the same layout and words under the identity rule `id.ABC.id` (same ports, no
 * dynamics); its frozen twin never writes a stream; the smuggler asks for the same runs and ignores them, preferring
 * the successors its table holds (routing from candidate code). A second layout reads the static's tone where one
 * stream mover leaves it (`readTone` -1): a register read through the counter, the positive control of the credit
 * instrument, never routing.
 *
 * Candidate side: imports only interfaces and the search helpers. Exact integers, no random numbers.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { emptyLedger, type Preprocessing, type Solver } from '@/code/intelligence/solver/solver'
import {
  canExpand,
  hold,
  holdBatch,
  readPath,
  release,
  successors,
  unsolved,
  type Held,
  type ParentEntry,
} from '@/code/intelligence/solver/search/expand'
import { PriorityQueue } from '@/code/intelligence/solver/search/priority-queue'

/** A brick-line layout as the evaluator takes it: window cell i at position start + i, inputs written per run. */
export interface RouterLayout {
  start: number
  window: number[]
  /** window offsets of the inputs: [stream mover cell, probe cell] */
  inputs: number[]
  readPosition: number
  readRound: number
}

/** What the evaluator answers for one batch of metered runs. */
export interface RouterRunsReply {
  values: number[]
  pairUpdates: number
  frameDigest: number
}

/** The metered mesh round: the sandbox bridge adds this to every solver's host. */
export interface RouterHost<S> {
  meshRuns: (rule: string, layout: RouterLayout, step: number, nodes: readonly S[], words: readonly number[]) => RouterRunsReply
}

/** The counter's tones on the vacuum: +1 moves, -1 stays until a +1 crosses it (M6, T5). */
export const MOVER_TONE = 1
export const STATIC_TONE = -1

/** The T5 counter cell the honest arms run, and the identity rule of the knockout. */
export const COUNTER_RULE = 'id.CBA.swap'
export const IDENTITY_RULE = 'id.ABC.id'

const WINDOW = [STATIC_TONE, 0, 0, 0, 0, 0, 0, 0]
const STREAM_OFFSET = 3
const PROBE_OFFSET = 7
const START = 10
const READ_ROUND = 8

/**
 * The probe's target: a +1 started at position 17 (odd, moving left two cells a round) is at position 1 after 8
 * rounds, whatever the static did. Fixed from the exploratory probe (tmp/level5-slice2/probe.ts) and certified in the
 * experiment against `id.CBA.swap` of code/rule through code/compute/lab/gates.ts.
 */
export const ARRIVAL_LAYOUT: RouterLayout = {
  start: START,
  window: WINDOW,
  inputs: [STREAM_OFFSET, PROBE_OFFSET],
  readPosition: 1,
  readRound: READ_ROUND,
}

/** Where the static -1 (start position 10) sits after the stream mover and the probe both crossed it: position 12. */
export const COUNTER_LAYOUT: RouterLayout = {
  start: START,
  window: WINDOW,
  inputs: [STREAM_OFFSET, PROBE_OFFSET],
  readPosition: 12,
  readRound: READ_ROUND,
}

export interface RouterSettings {
  id: string
  rule: string
  layout: RouterLayout
  /** a successor is preferred when its run reads this tone at the read cell */
  readTone: number
  /** false: the frozen structure, no stream is ever written */
  stream: boolean
  /** 'table': the smuggler, its preference from candidate code, the runs asked for and ignored */
  decisions: 'mesh' | 'table'
}

export interface RouterArgs {
  /** what the solver declares in its ledger: the base estimate's charge, and the table's when it reads one */
  preprocessing: Preprocessing
}

/** The secondary key spread: a preference bit sits above every estimate value. */
export const PREFERENCE_SPREAD = 1_000_000

export function streamRouterSolver<S>(settings: RouterSettings, args: RouterArgs, host: CandidateHost<S> & RouterHost<S>): Solver<S> {
  return {
    id: settings.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()

      ledger.preprocessing = { ...args.preprocessing }

      const base = host.estimate('base')
      const table = settings.stream || settings.decisions === 'table' ? host.table('table') : null
      const held: Held = { states: 0, bytes: 0 }
      const parents = new Map<string, ParentEntry<S>>()
      const best = new Map<string, number>()
      const closed = new Set<string>()
      const open = new PriorityQueue<string>()
      const initialKey = problem.key(problem.initial)

      const estimate = (state: S): number => {
        const h = base(state)

        if (!Number.isInteger(h) || h < 0 || h >= PREFERENCE_SPREAD) {
          throw new Error(`stream-router: estimate ${h} is not an integer in [0, ${PREFERENCE_SPREAD})`)
        }

        return h
      }

      parents.set(initialKey, { state: problem.initial, parent: null, operatorId: '', stepCost: 0 })
      best.set(initialKey, 0)
      hold(problem, held, ledger, problem.initial)

      const h0 = estimate(problem.initial)

      open.push(h0, PREFERENCE_SPREAD + h0, initialKey)

      while (open.size > 0) {
        const entry = open.pop()!
        const key = entry.value
        const g = best.get(key)!

        // a stale entry: the state was queued again at a lower g after this one
        if (entry.primary - (entry.secondary % PREFERENCE_SPREAD) !== g || closed.has(key)) {
          continue
        }

        const state = parents.get(key)!.state

        if (problem.goal(state)) {
          return { ...readPath(parents, key), solved: true, ledger }
        }

        if (!canExpand(problem, ledger)) {
          return unsolved(problem, ledger)
        }

        closed.add(key)
        ledger.expansions++

        const batch = successors(state, operators, ledger)

        holdBatch(problem, held, ledger, batch)

        // one metered run per successor: the word is [stream mover, probe]
        const words: number[] = []

        for (const next of batch) {
          const taught = table?.has(problem.key(next.state)) === true

          words.push(settings.stream && taught ? MOVER_TONE : 0, MOVER_TONE)
        }

        const preferred: boolean[] = []

        if (batch.length > 0) {
          const reply = host.meshRuns(settings.rule, settings.layout, ledger.expansions, batch.map(next => next.state), words)

          if (reply.values.length !== batch.length) {
            throw new Error('stream-router: the evaluator answered a different number of runs')
          }

          for (let i = 0; i < batch.length; i++) {
            preferred.push(
              settings.decisions === 'table'
                ? table?.has(problem.key(batch[i]!.state)) === true
                : reply.values[i] === settings.readTone,
            )
          }
        }

        for (let i = 0; i < batch.length; i++) {
          const next = batch[i]!
          const nextKey = problem.key(next.state)
          const nextG = g + next.cost
          const known = best.get(nextKey)

          if (known !== undefined && known <= nextG) {
            continue
          }

          const previous = parents.get(nextKey)

          if (previous !== undefined) {
            release(problem, held, previous.state)
            closed.delete(nextKey)
          }

          parents.set(nextKey, { state: next.state, parent: key, operatorId: next.operatorId, stepCost: next.cost })
          best.set(nextKey, nextG)
          hold(problem, held, ledger, next.state)

          const h = estimate(next.state)

          open.push(nextG + h, (preferred[i] ? 0 : PREFERENCE_SPREAD) + h, nextKey)
        }
      }

      return unsolved(problem, ledger)
    },
  }
}
