/**
 * Level 3 discovery: candidate macros read off solved paths.
 *
 * The source's subsystem 12: a system that keeps executing a, then b, then
 * c can make the operator m = c . b . a, a reusable solution fragment. This
 * discoverer observes verified experiences and counts every contiguous run
 * of `minLength` to `maxLength` steps of each path. A step may itself be a
 * macro already held, so a run of macros is a macro of macros (named by its
 * primitive steps, flat), and a run naming a macro already held is skipped.
 * A run seen at least `minCount` times is a candidate. Candidates come out in one fixed order:
 * more occurrences first, then longer, then by name, and at most `limit`
 * of them. No random numbers anywhere.
 *
 * Each candidate is confirmed before it is proposed: the macro is composed
 * from the operators handed in and applied at the state where the run first
 * began, and it must land on the state the path reached at the run's end.
 *
 * It is a candidate generator only. Whether a macro is worth keeping is
 * decided outside, by the evaluator, on starts it never saw. It sees
 * nothing but the operators it is handed (the evaluator's metered copies),
 * the key and the experiences: it imports no benchmark, geometry, graph or
 * evaluator module (check:layers forbids it). It counts every call it makes
 * through its own counting layer and every state it consults, and reports
 * them in `spent`; it keeps no value table, and its memory is the bytes of
 * the macro names it holds plus its table of runs.
 */

import type { Experience, Learner } from '@/code/intelligence/experience/experience'
import { buildMacros, flattenPath, isMacroId, macroId } from '@/code/intelligence/operator/discovery/macro'
import { operatorIndex, type Operator } from '@/code/intelligence/operator/operator'
import type { Preprocessing } from '@/code/intelligence/solver/solver'

export interface DiscoveryOptions {
  minLength: number
  maxLength: number
  /** a run must recur at least this often to be a candidate */
  minCount: number
  /** most candidates proposed */
  limit: number
}

export const DEFAULT_DISCOVERY: DiscoveryOptions = {
  minLength: 2,
  maxLength: 4,
  minCount: 2,
  limit: 12,
}

export interface MacroCandidate {
  id: string
  steps: string[]
  /** occurrences across the verified paths observed */
  count: number
}

interface Occurrence<S> {
  count: number
  steps: string[]
  from: S
  to: S
}

export type PathMacroDiscoverer<S> = Learner<S> & {
  /** no value table: level 3 learns operators, so this is always empty */
  table: () => ReadonlyMap<string, number>
  /** the confirmed candidates, in the fixed order, as step lists (call after proposeOperators) */
  candidates: () => MacroCandidate[]
}

export function pathMacroDiscoverer<S>(
  operators: readonly Operator<S>[],
  key: (state: S) => string,
  options: DiscoveryOptions = DEFAULT_DISCOVERY,
): PathMacroDiscoverer<S> {
  if (options.minLength < 2 || options.maxLength < options.minLength || options.limit < 0) {
    throw new Error('pathMacroDiscoverer: bad options')
  }

  let operatorCalls = 0

  const consulted = new Set<S>()

  // every call the discoverer makes goes through this counting layer
  const counted: Operator<S>[] = operators.map(operator => ({
    id: operator.id,
    applicable(state) {
      operatorCalls++
      consulted.add(state)

      return operator.applicable(state)
    },
    apply(state) {
      operatorCalls++
      consulted.add(state)

      return operator.apply(state)
    },
    cost(state) {
      operatorCalls++
      consulted.add(state)

      return operator.cost(state)
    },
  }))
  const known = operatorIndex(counted)
  const primitives = counted.filter(operator => !isMacroId(operator.id))
  const runs = new Map<string, Occurrence<S>>()

  let confirmed: MacroCandidate[] | null = null
  let proposed: Operator<S>[] = []

  function observe(experience: Experience<S>): void {
    if (experience.utility <= 0) {
      return
    }

    const { states, operators: ids } = experience.solution

    for (const id of ids) {
      if (!known.has(id)) {
        return
      }
    }

    // a run counts the path's own steps, a macro already held being one step, so macros compose again
    for (let length = options.minLength; length <= options.maxLength; length++) {
      for (let start = 0; start + length <= ids.length; start++) {
        const steps = flattenPath(ids.slice(start, start + length))
        const id = macroId(steps)

        if (known.has(id)) {
          continue
        }

        const run = runs.get(id)

        if (run === undefined) {
          runs.set(id, { count: 1, steps, from: states[start]!, to: states[start + length]! })
        } else {
          run.count++
        }
      }
    }

    confirmed = null
  }

  function confirm(): MacroCandidate[] {
    if (confirmed !== null) {
      return confirmed
    }

    const ordered = [...runs.entries()]
      .filter(([, run]) => run.count >= options.minCount)
      .sort(([a, x], [b, y]) => y.count - x.count || y.steps.length - x.steps.length || (a < b ? -1 : a > b ? 1 : 0))

    const out: MacroCandidate[] = []
    const operatorsOut: Operator<S>[] = []

    for (const [id, run] of ordered) {
      if (out.length >= options.limit) {
        break
      }

      const macro = buildMacros([run.steps], primitives)[0]

      if (!macro?.applicable(run.from)) {
        continue
      }

      if (key(macro.apply(run.from)) !== key(run.to)) {
        continue
      }

      out.push({ id, steps: run.steps, count: run.count })
      operatorsOut.push(macro)
    }

    confirmed = out
    proposed = operatorsOut

    return out
  }

  function spent(): Preprocessing {
    let memoryBytes = 0

    for (const candidate of confirmed ?? []) {
      memoryBytes += 2 * candidate.id.length + 8
    }

    // the run table it holds while it learns: each run's name, its count and two state references
    for (const id of runs.keys()) {
      memoryBytes += 2 * id.length + 24
    }

    return { expansions: consulted.size, operatorCalls, memoryBytes }
  }

  return {
    id: 'path-macro-discoverer',
    observe,
    proposeOperators() {
      confirm()

      return proposed
    },
    spent,
    table: () => new Map<string, number>(),
    candidates: () => confirm(),
  }
}
