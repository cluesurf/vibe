/**
 * Dishonest learners and discoverers for the level-2 and level-3
 * experiments, as isolated candidates. Each must be refused by the meter or
 * the hand-over.
 *
 * Candidate side: each runs in its own context and sees only handles.
 */

import type { Experience, TableLearner } from '@/code/intelligence/experience/experience'
import { valueTableLearner } from '@/code/intelligence/experience/learner/value-table'
import { pathMacroDiscoverer } from '@/code/intelligence/operator/discovery/path-macro-discoverer'
import type { Operator } from '@/code/intelligence/operator/operator'
import { NO_PREPROCESSING, type Preprocessing } from '@/code/intelligence/solver/solver'

type Change = (spent: Preprocessing) => Preprocessing

const CHANGES: Record<string, Change> = {
  hideAll: () => ({ ...NO_PREPROCESSING }),
  hideOneCall: spent => ({ ...spent, operatorCalls: spent.operatorCalls - 1 }),
  hideOneExpansion: spent => ({ ...spent, expansions: spent.expansions - 1 }),
  hideOneByte: spent => ({ ...spent, memoryBytes: spent.memoryBytes - 1 }),
}

/** The value table reporting less work than it did: `args.change` names how. */
export function underReporting<S>(args: { change: string }, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const inner = valueTableLearner(operators, key)
  const change = CHANGES[args.change]

  if (change === undefined) {
    throw new Error(`underReporting: no change ${args.change}`)
  }

  return { ...inner, id: 'under-reporting', spent: () => change(inner.spent()) }
}

/**
 * Adds a zero estimate for the agent on every open cell of each taught start,
 * for states it makes itself by editing the start's key (one char per cell:
 * agent 1, open 0), never through an operator.
 */
export function unmetered<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const inner = valueTableLearner(operators, key)
  const made = new Map<string, number>()
  const agent = String.fromCharCode(1)
  const open = String.fromCharCode(0)

  return {
    ...inner,
    id: 'unmetered',
    observe(experience: Experience<S>) {
      inner.observe(experience)

      const start = key(experience.initial)
      const at = start.indexOf(agent)

      for (let cell = 0; cell < start.length; cell++) {
        if (start[cell] === open) {
          const chars = start.split('')

          chars[at] = open
          chars[cell] = agent
          made.set(chars.join(''), 0)
        }
      }
    },
    table() {
      const out = new Map(inner.table())

      for (const [entry, value] of made) {
        if (!out.has(entry)) {
          out.set(entry, value)
        }
      }

      return out
    },
  }
}

/**
 * A table that lists nothing but answers `get` by a breadth-first
 * search at lookup time, through the operators the learner kept. The
 * evaluator copies a table out as plain data and closes the learner's context
 * at hand-over, so it must be refused (not a plain Map) and answer nothing.
 */
export function lazy<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const goals = new Set<string>()

  class LazyTable extends Map<string, number> {
    override get(entry: string): number | undefined {
      return goals.has(entry) ? 0 : operators.length
    }
  }

  return {
    id: 'lazy',
    observe(experience) {
      goals.add(key(experience.outcome))
    },
    proposeOperators: () => [],
    spent: () => ({ ...NO_PREPROCESSING }),
    table: () => new LazyTable(),
  }
}

/** The honest table handed over behind a Proxy, which passes every plainness test it can trap. */
export function proxyTable<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const inner = valueTableLearner(operators, key)

  return { ...inner, id: 'proxy-table', table: () => new Proxy(inner.table(), {}) }
}

/** A discoverer reporting one operator call fewer than it made. */
export function hidingOneCallDiscoverer<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const inner = pathMacroDiscoverer(operators, key)

  return { ...inner, id: 'hiding-one-call', spent: () => ({ ...inner.spent(), operatorCalls: inner.spent().operatorCalls - 1 }) }
}
