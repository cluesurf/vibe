/**
 * The meta-learner: it proposes edits to a genome and learns which edits
 * pay (the source's section 15.7 and level 4 of its operational ladder,
 * meta-learning: improving how it improves).
 *
 * An edit changes one named thing in the record (the source's section 7
 * table: search heuristic, planner, learning rule, operator library,
 * resource allocation), always to a neighbor on that field's list or ladder,
 * so every proposal is a small, inspectable step. Edits are listed in one
 * fixed order. A meta-learner proposes, for the genome it is given, the
 * first `proposals` edits that make a valid genome never proposed or
 * evaluated before, in an order that is:
 *
 * - `learns: false`: the fixed list order, always (the control).
 * - `learns: true`: by the edit's adoption rate so far, (hits + 1) / (tries + 2),
 *   then by its mean gain in Q when adopted, then the fixed order. An edit
 *   never tried scores 1/2, so a learner starts exactly like the control and
 *   departs from it only by what results have taught it.
 *
 * No random numbers: ties fall to the fixed order. Candidate side: it never
 * imports the evaluator or a held-out split; all it learns arrives through
 * `learn`, as the evaluator's evaluation and verdict.
 */

import {
  EXPANSION_CAPS,
  EXPERIENCES,
  MACRO_COUNTS,
  MACRO_LENGTHS,
  MACRO_LIMITS,
  WEIGHTS,
  copyGenome,
  genomeKey,
  validateGenome,
  type HeuristicName,
  type IntelligenceGenome,
  type SearchStrategy,
} from '@/code/intelligence/genome/genome'
import type { Candidate, Evaluation, MetaLearner } from '@/code/intelligence/improve/evaluation'

export interface Edit {
  id: string
  /** what the edit changes, in the source's section 7 terms */
  mechanism: string
  apply: (genome: IntelligenceGenome) => IntelligenceGenome | null
}

/** The neighbor of `value` on `ladder`, `step` places away, or null off the end. */
function along(ladder: readonly number[], value: number, step: number): number | null {
  const index = ladder.indexOf(value)

  return index === -1 ? null : (ladder[index + step] ?? null)
}

function edit(id: string, mechanism: string, change: (genome: IntelligenceGenome) => boolean): Edit {
  return {
    id,
    mechanism,
    apply(genome) {
      const child = copyGenome(genome, genome.version + 1)

      return change(child) ? child : null
    },
  }
}

const strategyEdit = (strategy: SearchStrategy): Edit =>
  edit(`strategy-${strategy}`, 'planner', genome => {
    if (genome.search.strategy === strategy) {
      return false
    }

    genome.search.strategy = strategy

    return true
  })

const heuristicEdit = (heuristic: HeuristicName): Edit =>
  edit(`heuristic-${heuristic}`, 'search heuristic', genome => {
    if (genome.search.heuristic === heuristic) {
      return false
    }

    genome.search.heuristic = heuristic

    // the learned estimate is read from the value table, so choosing it switches the table on
    if (heuristic === 'learned') {
      genome.learning.strategy = 'value-table'
    }

    return true
  })

function ladderEdit(
  id: string,
  mechanism: string,
  ladder: readonly number[],
  step: number,
  get: (genome: IntelligenceGenome) => number,
  set: (genome: IntelligenceGenome, value: number) => void,
): Edit {
  return edit(id, mechanism, genome => {
    const next = along(ladder, get(genome), step)

    if (next === null) {
      return false
    }

    set(genome, next)

    return true
  })
}

/** Every edit, in the one fixed order. */
export const EDITS: readonly Edit[] = [
  strategyEdit('a-star'),
  strategyEdit('greedy'),
  strategyEdit('iterative-deepening'),
  strategyEdit('breadth-first'),
  heuristicEdit('bare-hop'),
  heuristicEdit('learned'),
  heuristicEdit('none'),
  ladderEdit('weight-up', 'search heuristic', WEIGHTS, 1, g => g.search.weight, (g, v) => (g.search.weight = v)),
  ladderEdit('weight-down', 'search heuristic', WEIGHTS, -1, g => g.search.weight, (g, v) => (g.search.weight = v)),
  edit('learning-on', 'learning rule', genome => {
    if (genome.learning.strategy === 'value-table') {
      return false
    }

    genome.learning.strategy = 'value-table'

    return true
  }),
  edit('learning-off', 'learning rule', genome => {
    if (genome.learning.strategy === 'none') {
      return false
    }

    genome.learning.strategy = 'none'

    if (genome.search.heuristic === 'learned') {
      genome.search.heuristic = 'bare-hop'
    }

    return true
  }),
  ladderEdit('experiences-up', 'memory', EXPERIENCES, 1, g => g.learning.experiences, (g, v) => (g.learning.experiences = v)),
  ladderEdit('experiences-down', 'memory', EXPERIENCES, -1, g => g.learning.experiences, (g, v) => (g.learning.experiences = v)),
  edit('library-on', 'operator library', genome => {
    if (genome.operators.library === 'discovered') {
      return false
    }

    genome.operators.library = 'discovered'

    return true
  }),
  edit('library-off', 'operator library', genome => {
    if (genome.operators.library === 'none') {
      return false
    }

    genome.operators.library = 'none'

    return true
  }),
  ladderEdit('macros-more', 'operator library', MACRO_LIMITS, 1, g => g.operators.limit, (g, v) => (g.operators.limit = v)),
  ladderEdit('macros-fewer', 'operator library', MACRO_LIMITS, -1, g => g.operators.limit, (g, v) => (g.operators.limit = v)),
  ladderEdit('macro-longer', 'operator library', MACRO_LENGTHS, 1, g => g.operators.maxLength, (g, v) => (g.operators.maxLength = v)),
  ladderEdit('macro-shorter', 'operator library', MACRO_LENGTHS, -1, g => g.operators.maxLength, (g, v) => (g.operators.maxLength = v)),
  ladderEdit('macro-commoner', 'operator library', MACRO_COUNTS, 1, g => g.operators.minCount, (g, v) => (g.operators.minCount = v)),
  ladderEdit('macro-rarer', 'operator library', MACRO_COUNTS, -1, g => g.operators.minCount, (g, v) => (g.operators.minCount = v)),
  ladderEdit('budget-down', 'resource allocation', EXPANSION_CAPS, -1, g => g.budget.expansions, (g, v) => (g.budget.expansions = v)),
  ladderEdit('budget-up', 'resource allocation', EXPANSION_CAPS, 1, g => g.budget.expansions, (g, v) => (g.budget.expansions = v)),
]

export interface EditStats {
  tries: number
  hits: number
  /** summed gain in mean Q over the parent, over adopted tries */
  gain: number
}

export type EditMetaLearner = MetaLearner & {
  /** each edit's record, in the fixed order */
  stats: () => { id: string; mechanism: string; stats: EditStats }[]
  /** the order the next proposal would try edits in */
  order: () => string[]
}

export function editMetaLearner(options: { learns: boolean; proposals: number; edits?: readonly Edit[] }): EditMetaLearner {
  const edits = options.edits ?? EDITS
  const stats = new Map<string, EditStats>(edits.map(e => [e.id, { tries: 0, hits: 0, gain: 0 }]))
  const seen = new Set<string>()
  const parentQ = new Map<string, number>()

  const score = (id: string): number => {
    const s = stats.get(id)!

    return (s.hits + 1) / (s.tries + 2)
  }
  const meanGain = (id: string): number => {
    const s = stats.get(id)!

    return s.hits === 0 ? 0 : s.gain / s.hits
  }

  function ordered(): Edit[] {
    const indexed = edits.map((e, index) => ({ e, index }))

    if (options.learns) {
      indexed.sort((a, b) => score(b.e.id) - score(a.e.id) || meanGain(b.e.id) - meanGain(a.e.id) || a.index - b.index)
    }

    return indexed.map(item => item.e)
  }

  return {
    id: options.learns ? 'edit-meta-learner' : 'fixed-order-proposer',
    propose(genome: IntelligenceGenome, evaluation: Evaluation): Candidate[] {
      seen.add(genomeKey(genome))

      const out: Candidate[] = []

      for (const e of ordered()) {
        if (out.length >= options.proposals) {
          break
        }

        const child = e.apply(genome)

        if (child === null || validateGenome(child).length > 0) {
          continue
        }

        const key = genomeKey(child)

        if (seen.has(key)) {
          continue
        }

        seen.add(key)
        parentQ.set(key, evaluation.meanQ)
        out.push({ genome: child, parentVersion: genome.version, edit: e.id, description: `${e.id} (${e.mechanism})` })
      }

      return out
    },
    learn(candidate: Candidate, result: Evaluation, adopted: boolean) {
      const s = stats.get(candidate.edit)

      // the control keeps the same record for the report, but never reads it to order its proposals
      if (s === undefined) {
        return
      }

      s.tries++

      if (adopted) {
        s.hits++
        s.gain += result.meanQ - (parentQ.get(genomeKey(candidate.genome)) ?? result.meanQ)
      }
    },
    stats: () => edits.map(e => ({ id: e.id, mechanism: e.mechanism, stats: { ...stats.get(e.id)! } })),
    order: () => ordered().map(e => e.id),
  }
}
