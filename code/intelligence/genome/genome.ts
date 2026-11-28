/**
 * The intelligence genome: a structured, inspectable record of how a solver
 * is put together, never executable source (the source's section 15.6).
 *
 * Every field is a name from a fixed list or a number from a fixed ladder,
 * so a genome is plain data: it survives a JSON round trip unchanged, it
 * holds no function, and a field the schema does not know (a score the
 * candidate wrote about itself, a callback) makes it invalid. What a genome
 * does is decided by `genome/realize.ts`, one fixed reading of the record,
 * and how well it does is decided outside it, by the evaluator.
 *
 * From the source's record, with changes for level 3: `search` names one of
 * the four graph-search baselines and a heuristic, and a weight in place of
 * the exploration rate (no random numbers, so exploration is a fixed
 * weighting of the estimate, never a coin); `learning` is the level-2 value
 * table and how many training experiences it is taught; `operators` is the
 * level-3 macro library and the discoverer's settings; `budget` is the
 * solver's own cap on expansions, within the problem's. Representation,
 * memory kind and topology are absent: at level 3 they are fixed (a mesh
 * state, a key-value table, the cell graph), so a field for them would be a
 * knob that does nothing.
 */

export const SEARCH_STRATEGIES = ['breadth-first', 'a-star', 'greedy', 'iterative-deepening'] as const
export const HEURISTICS = ['none', 'bare-hop', 'learned'] as const
export const LEARNING_STRATEGIES = ['none', 'value-table'] as const
export const LIBRARIES = ['none', 'discovered'] as const

/** the estimate's weight: 1 keeps an admissible estimate admissible, above 1 trades optimality for speed */
export const WEIGHTS = [1, 1.5, 2, 3] as const
/** training experiences taught per environment */
export const EXPERIENCES = [1, 2, 4, 8, 16, 32] as const
export const MACRO_LENGTHS = [2, 3, 4, 5, 6] as const
export const MACRO_COUNTS = [2, 3, 4, 6] as const
export const MACRO_LIMITS = [0, 1, 2, 3, 6, 12, 24] as const
export const EXPANSION_CAPS = [3125, 6250, 12_500, 25_000, 50_000] as const

export type SearchStrategy = (typeof SEARCH_STRATEGIES)[number]
export type HeuristicName = (typeof HEURISTICS)[number]
export type LearningStrategy = (typeof LEARNING_STRATEGIES)[number]
export type LibraryChoice = (typeof LIBRARIES)[number]

export interface IntelligenceGenome {
  version: number
  search: {
    strategy: SearchStrategy
    heuristic: HeuristicName
    weight: number
  }
  learning: {
    strategy: LearningStrategy
    experiences: number
  }
  operators: {
    library: LibraryChoice
    minLength: number
    maxLength: number
    minCount: number
    limit: number
  }
  budget: {
    expansions: number
  }
}

/** Exhaustive search, nothing learned: where the source's section 8 starts, and the evaluator's reference. */
export const EXHAUSTIVE_GENOME: IntelligenceGenome = {
  version: 0,
  search: { strategy: 'breadth-first', heuristic: 'none', weight: 1 },
  learning: { strategy: 'none', experiences: 4 },
  operators: { library: 'none', minLength: 2, maxLength: 4, minCount: 2, limit: 12 },
  budget: { expansions: 50_000 },
}

/** The level-1 solver levels 2 and 3 built on: A* over the bare hop distance, nothing learned. */
export const SEED_GENOME: IntelligenceGenome = {
  ...EXHAUSTIVE_GENOME,
  search: { strategy: 'a-star', heuristic: 'bare-hop', weight: 1 },
}

type FieldRule = { kind: 'name'; values: readonly string[] } | { kind: 'number'; values: readonly number[] }

const SCHEMA: Record<string, Record<string, FieldRule>> = {
  search: {
    strategy: { kind: 'name', values: SEARCH_STRATEGIES },
    heuristic: { kind: 'name', values: HEURISTICS },
    weight: { kind: 'number', values: WEIGHTS },
  },
  learning: {
    strategy: { kind: 'name', values: LEARNING_STRATEGIES },
    experiences: { kind: 'number', values: EXPERIENCES },
  },
  operators: {
    library: { kind: 'name', values: LIBRARIES },
    minLength: { kind: 'number', values: MACRO_LENGTHS },
    maxLength: { kind: 'number', values: MACRO_LENGTHS },
    minCount: { kind: 'number', values: MACRO_COUNTS },
    limit: { kind: 'number', values: MACRO_LIMITS },
  },
  budget: {
    expansions: { kind: 'number', values: EXPANSION_CAPS },
  },
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

/**
 * Every way `value` fails to be a genome: a missing or unknown field, a
 * value off its list or ladder, a function, a class instance, or a setting
 * that contradicts another. Empty when it is a valid genome. Fail-closed:
 * anything the schema does not name is a violation.
 */
export function validateGenome(value: unknown): string[] {
  const out: string[] = []

  if (!plainObject(value)) {
    return ['the genome is not a plain record']
  }

  for (const name of Object.keys(value)) {
    if (name !== 'version' && !(name in SCHEMA)) {
      out.push(`unknown field ${name}`)
    }
  }

  const version = value.version

  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
    out.push('version is not a nonnegative integer')
  }

  for (const [group, fields] of Object.entries(SCHEMA)) {
    const record = value[group]

    if (!plainObject(record)) {
      out.push(`${group} is not a plain record`)
      continue
    }

    for (const name of Object.keys(record)) {
      if (!(name in fields)) {
        out.push(`unknown field ${group}.${name}`)
      }
    }

    for (const [name, rule] of Object.entries(fields)) {
      const field = record[name]
      const allowed =
        rule.kind === 'name'
          ? typeof field === 'string' && rule.values.includes(field)
          : typeof field === 'number' && rule.values.includes(field)

      if (!allowed) {
        out.push(`${group}.${name} is ${typeof field === 'function' ? 'a function' : JSON.stringify(field)}, not one of ${rule.values.join(', ')}`)
      }
    }
  }

  if (out.length > 0) {
    return out
  }

  const genome = value as unknown as IntelligenceGenome

  if (genome.search.heuristic === 'learned' && genome.learning.strategy !== 'value-table') {
    out.push('the learned heuristic needs the value-table learner')
  }

  if (genome.operators.maxLength < genome.operators.minLength) {
    out.push('operators.maxLength is below operators.minLength')
  }

  return out
}

/**
 * The genome with every setting that cannot change behavior reset to the
 * exhaustive genome's value: breadth-first search reads no estimate, a
 * missing estimate has no weight, greedy search orders by the estimate alone
 * (a positive weight keeps the order), an untaught genome reads no
 * experience count, and without a library the discoverer's settings are
 * unread. Two genomes with one canonical form solve every problem the same
 * way, so the loop never spends an evaluation telling them apart.
 */
export function canonicalGenome(genome: IntelligenceGenome): IntelligenceGenome {
  const out = copyGenome(genome, genome.version)

  if (out.search.strategy === 'breadth-first') {
    out.search.heuristic = 'none'
  }

  if (out.search.heuristic === 'none' || out.search.strategy === 'greedy') {
    out.search.weight = EXHAUSTIVE_GENOME.search.weight
  }

  if (!isTaught(out)) {
    out.learning.experiences = EXHAUSTIVE_GENOME.learning.experiences
  }

  if (out.operators.library === 'none') {
    out.operators = { ...EXHAUSTIVE_GENOME.operators }
  }

  return out
}

/** A key of a genome's canonical content, its version left out: equal keys, equal behavior. */
export function genomeKey(genome: IntelligenceGenome): string {
  const { search, learning, operators, budget } = canonicalGenome(genome)

  return [
    `search=${search.strategy}/${search.heuristic}/${search.weight}`,
    `learning=${learning.strategy}/${learning.experiences}`,
    `operators=${operators.library}/${operators.minLength}-${operators.maxLength}/${operators.minCount}/${operators.limit}`,
    `budget=${budget.expansions}`,
  ].join(' ')
}

/** Whether the solver reads the base distance table (the evaluator charges it when it does). */
export function readsBaseTable(genome: IntelligenceGenome): boolean {
  return genome.search.strategy !== 'breadth-first' && genome.search.heuristic !== 'none'
}

/** Whether the genome is taught experiences before it solves (a table, a library, or both). */
export function isTaught(genome: IntelligenceGenome): boolean {
  return genome.learning.strategy !== 'none' || genome.operators.library !== 'none'
}

/** A deep copy with the version set, so an edit never touches its parent. */
export function copyGenome(genome: IntelligenceGenome, version: number): IntelligenceGenome {
  return {
    version,
    search: { ...genome.search },
    learning: { ...genome.learning },
    operators: { ...genome.operators },
    budget: { ...genome.budget },
  }
}
