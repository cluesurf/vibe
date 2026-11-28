/**
 * Level 7, slice 1 (level7.md of vibe/computation/intelligence): a tie-breaking device that develops from a primitive
 * start. Before the search the solver asks the evaluator to run a primitive start (a window of at most three tones) for
 * `rounds` rounds of the claimed pair rule, reading every cell of the device span at that round (one metered run per
 * cell); the reads are the device window (the evaluator-metered handoff of level 6, slice 4). With `rounds` 0 the window
 * is the start itself on the same span (the no-development control). Then A* runs over the evaluator's operators, and per
 * generated successor one metered run of the device decides a preference bit from the word [t, d]: t = +1 when the
 * learned table holds the successor, else 0; d = the sign of the base estimate's change from the parent. A preferred
 * successor wins ties of f = g + h before h does, so the search stays optimal and only its order can change.
 *
 * The candidate never runs a round (decision 003). Modes: 'mesh' (honest), 'code' (the smuggler: the preference from
 * the fixed function `mask` in candidate code, no run asked), 'misdeveloped' (the development runs are asked, then the
 * undeveloped window is used while the developed one is claimed: a control the judge must refuse).
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

/** A brick-line layout as the evaluator takes it, the background always stated. */
export interface DevelopLayout {
  start: number
  window: number[]
  inputs: number[]
  readPosition: number
  readRound: number
  background: number
}

export interface DevelopRunsReply {
  values: number[]
  pairUpdates: number
  frameDigest: number
}

/** The metered mesh round the sandbox bridge adds to every solver's host. */
export interface DevelopHost<S> {
  meshRuns: (rule: string, layout: DevelopLayout, step: number, nodes: readonly S[], words: readonly number[]) => DevelopRunsReply
}

export type DevelopMode = 'mesh' | 'code' | 'misdeveloped'

export interface DevelopArgs {
  id: string
  /** the pair rule of the development and of the decisions, by fiber name */
  rule: string
  background: number
  /** the primitive start, its tones from position `startPosition` on (empty for a device with no start) */
  start: number[]
  startPosition: number
  /** development rounds; 0 is the no-development control */
  rounds: number
  /** the device span: absolute left cell and width */
  spanLo: number
  spanWidth: number
  /** span offsets of the inputs t and d */
  inputs: [number, number]
  /** the decision read: an absolute cell and a round */
  readPosition: number
  readRound: number
  /** a successor is preferred when its read lies in this tone set */
  prefer: number[]
  mode: DevelopMode
  /** the smuggler's function: bit (d + 1) * 2 + (t === 1 ? 1 : 0) set means prefer */
  mask: number
  preprocessing: Preprocessing
}

/** The word's index in a preference mask. */
export const wordIndex = (t: number, d: number): number => (d + 1) * 2 + (t === 1 ? 1 : 0)

/** The secondary key spread: a preference bit sits above every estimate value. */
export const PREFERENCE_SPREAD = 1_000_000

/** The development layout for one span cell: the start padded by one background cell each side, its input inert. */
export function developmentLayout(args: DevelopArgs, readPosition: number): DevelopLayout {
  const b = args.background

  return {
    start: args.startPosition - 1,
    window: [b, ...args.start, b],
    inputs: [0],
    readPosition,
    readRound: args.rounds,
    background: b,
  }
}

/** The undeveloped device: the start's tones on the span, the background elsewhere. */
export function undevelopedWindow(args: DevelopArgs): number[] {
  const window: number[] = []

  for (let k = 0; k < args.spanWidth; k++) {
    const at = args.spanLo + k - args.startPosition

    window.push(at >= 0 && at < args.start.length ? args.start[at]! : args.background)
  }

  return window
}

export function deviceLayout(args: DevelopArgs, window: readonly number[]): DevelopLayout {
  return {
    start: args.spanLo,
    window: [...window],
    inputs: [...args.inputs],
    readPosition: args.readPosition,
    readRound: args.readRound,
    background: args.background,
  }
}

export function developRouterSolver<S>(args: DevelopArgs, host: CandidateHost<S> & DevelopHost<S>): Solver<S> {
  return {
    id: args.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()

      ledger.preprocessing = { ...args.preprocessing }

      const base = host.estimate('base')
      const table = host.table('table')
      const prefer = new Set(args.prefer)

      // ---- the development: one metered run per span cell, read at round `rounds`
      let window = undevelopedWindow(args)

      if (args.mode !== 'code' && args.rounds > 0) {
        const reads: number[] = []

        for (let k = 0; k < args.spanWidth; k++) {
          const reply = host.meshRuns(args.rule, developmentLayout(args, args.spanLo + k), 0, [problem.initial], [args.background])

          if (reply.values.length !== 1) {
            throw new Error('develop-router: the evaluator answered a different number of development runs')
          }

          reads.push(reply.values[0]!)
        }

        if (args.mode === 'mesh') {
          window = reads
        }
      }

      const layout = deviceLayout(args, window)

      const estimate = (state: S): number => {
        const h = base(state)

        if (!Number.isInteger(h) || h < 0 || h >= PREFERENCE_SPREAD) {
          throw new Error(`develop-router: estimate ${h} is not an integer in [0, ${PREFERENCE_SPREAD})`)
        }

        return h
      }

      const held: Held = { states: 0, bytes: 0 }
      const parents = new Map<string, ParentEntry<S>>()
      const best = new Map<string, number>()
      const closed = new Set<string>()
      const open = new PriorityQueue<string>()
      const initialKey = problem.key(problem.initial)

      parents.set(initialKey, { state: problem.initial, parent: null, operatorId: '', stepCost: 0 })
      best.set(initialKey, 0)
      hold(problem, held, ledger, problem.initial)

      const h0 = estimate(problem.initial)

      open.push(h0, PREFERENCE_SPREAD + h0, initialKey)

      while (open.size > 0) {
        const entry = open.pop()!
        const key = entry.value
        const g = best.get(key)!

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

        const hParent = estimate(state)
        const batch = successors(state, operators, ledger)

        holdBatch(problem, held, ledger, batch)

        const words: number[] = []
        const hs: number[] = []

        for (const next of batch) {
          const h = estimate(next.state)
          const t = table.has(problem.key(next.state)) ? 1 : 0

          hs.push(h)
          words.push(t, Math.sign(h - hParent))
        }

        const preferred: boolean[] = []

        if (batch.length > 0) {
          if (args.mode === 'code') {
            for (let i = 0; i < batch.length; i++) {
              preferred.push(((args.mask >> wordIndex(words[2 * i]!, words[2 * i + 1]!)) & 1) === 1)
            }
          } else {
            const reply = host.meshRuns(args.rule, layout, ledger.expansions, batch.map(next => next.state), words)

            if (reply.values.length !== batch.length) {
              throw new Error('develop-router: the evaluator answered a different number of runs')
            }

            for (const value of reply.values) {
              preferred.push(prefer.has(value))
            }
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

          const h = hs[i]!

          open.push(nextG + h, (preferred[i] ? 0 : PREFERENCE_SPREAD) + h, nextKey)
        }
      }

      return unsolved(problem, ledger)
    },
  }
}
