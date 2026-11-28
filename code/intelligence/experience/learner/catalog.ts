/**
 * The learners and the discoverer as isolated candidates: each factory takes
 * its arguments as plain data and the metered operators and key the
 * evaluator hands it, inside the candidate's own context.
 *
 * Candidate side.
 */

import type { TableLearner } from '@/code/intelligence/experience/experience'
import { valueTableLearner } from '@/code/intelligence/experience/learner/value-table'
import { DEFAULT_DISCOVERY, pathMacroDiscoverer, type DiscoveryOptions } from '@/code/intelligence/operator/discovery/path-macro-discoverer'
import type { Operator } from '@/code/intelligence/operator/operator'

/** Level 2: the value table. */
export function valueTable<S>(_args: unknown, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  return valueTableLearner(operators, key)
}

/** Level 3: the path-macro discoverer; its report is the confirmed candidates, in its fixed order. */
export function pathMacros<S>(args: Partial<DiscoveryOptions> | null, operators: readonly Operator<S>[], key: (state: S) => string): TableLearner<S> {
  const discoverer = pathMacroDiscoverer(operators, key, { ...DEFAULT_DISCOVERY, ...args })

  return { ...discoverer, report: () => ({ candidates: discoverer.candidates() }) }
}
