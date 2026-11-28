/**
 * Level 8, reading B: a collective of two mesh devices on one line, entity
 * 1 holding the input t and entity 2 the input d, read by a fixed A* template to break ties. Per generated successor the
 * word is [t, d]: t = +1 when the learned table holds the successor, else 0; d = the sign of the base estimate's change
 * from the parent. A preferred successor wins ties of f = g + h before h does, so the search stays optimal and only its
 * order can change.
 *
 * Modes (the candidate never runs a round):
 * - 'joint': one metered run of the whole window, both inputs written, per successor;
 * - 'apart': the same two devices run separately, two metered runs per successor (device 1 with only t, device 2 with
 *   only d, the other device's start cells at the background); the decision reads the run of the device nearer the read
 *   cell (device 1 on ties);
 * - 'code': the smuggler, the preference from the fixed function `mask` in candidate code, no run asked;
 * - 'wrongWords': a control the judge must refuse, the joint layout run on [t, 0] in place of [t, d].
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
export interface CollectiveLayout {
  start: number
  window: number[]
  inputs: number[]
  readPosition: number
  readRound: number
  background: number
}

export interface CollectiveRunsReply {
  values: number[]
  pairUpdates: number
  frameDigest: number
}

/** The metered mesh round the sandbox bridge adds to every solver's host. */
export interface CollectiveHost<S> {
  meshRuns: (rule: string, layout: CollectiveLayout, step: number, nodes: readonly S[], words: readonly number[]) => CollectiveRunsReply
}

export type CollectiveMode = 'joint' | 'apart' | 'code' | 'wrongWords'

export interface CollectiveArgs {
  id: string
  /** the pair rule of every decision run, by fiber name */
  rule: string
  background: number
  /** the collective's window: its absolute left cell and its tones */
  windowLo: number
  window: number[]
  /** window offsets of each device's region (inclusive ends) */
  region1: [number, number]
  region2: [number, number]
  /** window offsets of each device's start tones (set to the background when the other device runs alone) */
  start1: number[]
  start2: number[]
  /** window offsets of the inputs t (in region 1) and d (in region 2) */
  inputs: [number, number]
  /** the decision read: an absolute cell and a round */
  readPosition: number
  readRound: number
  /** a successor is preferred when its read lies in this tone set */
  prefer: number[]
  mode: CollectiveMode
  /** the smuggler's function: bit (d + 1) * 2 + (t === 1 ? 1 : 0) set means prefer */
  mask: number
  preprocessing: Preprocessing
}

/** The word's index in a preference mask. */
export const collectiveWordIndex = (t: number, d: number): number => (d + 1) * 2 + (t === 1 ? 1 : 0)

/** The secondary key spread: a preference bit sits above every estimate value. */
export const COLLECTIVE_SPREAD = 1_000_000

/** The joint layout: the whole window, both inputs. */
export function jointLayout(args: CollectiveArgs): CollectiveLayout {
  return {
    start: args.windowLo,
    window: [...args.window],
    inputs: [...args.inputs],
    readPosition: args.readPosition,
    readRound: args.readRound,
    background: args.background,
  }
}

/** The two apart layouts: device k alone (the other device's start cells at the background), only input k written. */
export function apartLayouts(args: CollectiveArgs): [CollectiveLayout, CollectiveLayout] {
  const alone = (blank: readonly number[], input: number): CollectiveLayout => {
    const window = [...args.window]

    for (const offset of blank) {
      window[offset] = args.background
    }

    return {
      start: args.windowLo,
      window,
      inputs: [input],
      readPosition: args.readPosition,
      readRound: args.readRound,
      background: args.background,
    }
  }

  return [alone(args.start2, args.inputs[0]), alone(args.start1, args.inputs[1])]
}

/** Which apart run the decision reads: 0 when the read cell is no farther from region 1 than from region 2, else 1. */
export function apartSide(args: CollectiveArgs): 0 | 1 {
  const distance = (region: readonly [number, number]): number => {
    const lo = args.windowLo + region[0]
    const hi = args.windowLo + region[1]

    return args.readPosition < lo ? lo - args.readPosition : args.readPosition > hi ? args.readPosition - hi : 0
  }

  return distance(args.region1) <= distance(args.region2) ? 0 : 1
}

export function collectiveRouterSolver<S>(args: CollectiveArgs, host: CandidateHost<S> & CollectiveHost<S>): Solver<S> {
  return {
    id: args.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()

      ledger.preprocessing = { ...args.preprocessing }

      const base = host.estimate('base')
      const table = host.table('table')
      const prefer = new Set(args.prefer)
      const joint = jointLayout(args)
      const apart = apartLayouts(args)
      const side = apartSide(args)

      const estimate = (state: S): number => {
        const h = base(state)

        if (!Number.isInteger(h) || h < 0 || h >= COLLECTIVE_SPREAD) {
          throw new Error(`collective-router: estimate ${h} is not an integer in [0, ${COLLECTIVE_SPREAD})`)
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

      open.push(h0, COLLECTIVE_SPREAD + h0, initialKey)

      while (open.size > 0) {
        const entry = open.pop()!
        const key = entry.value
        const g = best.get(key)!

        if (entry.primary - (entry.secondary % COLLECTIVE_SPREAD) !== g || closed.has(key)) {
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

        const ts: number[] = []
        const ds: number[] = []
        const hs: number[] = []

        for (const next of batch) {
          const h = estimate(next.state)

          hs.push(h)
          ts.push(table.has(problem.key(next.state)) ? 1 : 0)
          ds.push(Math.sign(h - hParent))
        }

        const preferred: boolean[] = []

        if (batch.length > 0) {
          const nodes = batch.map(next => next.state)
          const read = (reply: CollectiveRunsReply): number[] => {
            if (reply.values.length !== batch.length) {
              throw new Error('collective-router: the evaluator answered a different number of runs')
            }

            return reply.values
          }

          if (args.mode === 'code') {
            for (let i = 0; i < batch.length; i++) {
              preferred.push(((args.mask >> collectiveWordIndex(ts[i]!, ds[i]!)) & 1) === 1)
            }
          } else if (args.mode === 'apart') {
            const first = read(host.meshRuns(args.rule, apart[0], ledger.expansions, nodes, ts))
            const second = read(host.meshRuns(args.rule, apart[1], ledger.expansions, nodes, ds))
            const values = side === 0 ? first : second

            values.forEach(value => preferred.push(prefer.has(value)))
          } else {
            const words: number[] = []

            for (let i = 0; i < batch.length; i++) {
              words.push(ts[i]!, args.mode === 'wrongWords' ? 0 : ds[i]!)
            }

            read(host.meshRuns(args.rule, joint, ledger.expansions, nodes, words)).forEach(value => preferred.push(prefer.has(value)))
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

          open.push(nextG + hs[i]!, (preferred[i] ? 0 : COLLECTIVE_SPREAD) + hs[i]!, nextKey)
        }
      }

      return unsolved(problem, ledger)
    },
  }
}
