/**
 * Level 6, slice 3 (level6.md): a genome as a word of content trits, and back. Every field is its index on its list or
 * ladder in fixed-width binary, most significant bit first, then the version in 6 bits; a 0 bit is the vacuum
 * excitation -1 and a 1 bit is +1, the two contents a T1 selector routes. The map is fixed and exact, so the word the
 * mesh's read cells hand on decodes to exactly one genome or to none: the carrier decides nothing.
 *
 * Candidate side: imports only the genome record.
 */

import {
  EXPANSION_CAPS,
  EXPERIENCES,
  HEURISTICS,
  LEARNING_STRATEGIES,
  LIBRARIES,
  MACRO_COUNTS,
  MACRO_LENGTHS,
  MACRO_LIMITS,
  SEARCH_STRATEGIES,
  WEIGHTS,
  validateGenome,
  type IntelligenceGenome,
} from '@/code/intelligence/genome/genome'

const VERSION_BITS = 6

interface Field {
  values: readonly (string | number)[]
  bits: number
  get: (genome: IntelligenceGenome) => string | number
}

const width = (count: number): number => {
  let bits = 1

  while (2 ** bits < count) {
    bits++
  }

  return bits
}

const field = (values: readonly (string | number)[], get: (genome: IntelligenceGenome) => string | number): Field => ({
  values,
  bits: width(values.length),
  get,
})

const FIELDS: readonly Field[] = [
  field(SEARCH_STRATEGIES, g => g.search.strategy),
  field(HEURISTICS, g => g.search.heuristic),
  field(WEIGHTS, g => g.search.weight),
  field(LEARNING_STRATEGIES, g => g.learning.strategy),
  field(EXPERIENCES, g => g.learning.experiences),
  field(LIBRARIES, g => g.operators.library),
  field(MACRO_LENGTHS, g => g.operators.minLength),
  field(MACRO_LENGTHS, g => g.operators.maxLength),
  field(MACRO_COUNTS, g => g.operators.minCount),
  field(MACRO_LIMITS, g => g.operators.limit),
  field(EXPANSION_CAPS, g => g.budget.expansions),
]

/** content trits per genome */
export const CONTENT_TRITS = FIELDS.reduce((sum, f) => sum + f.bits, 0) + VERSION_BITS

function pushBits(out: number[], value: number, bits: number): void {
  for (let b = bits - 1; b >= 0; b--) {
    out.push(Math.floor(value / 2 ** b) % 2 === 1 ? 1 : -1)
  }
}

/** The content word of a valid genome; throws on a genome off its lists or a version past 6 bits. */
export function encodeGenome(genome: IntelligenceGenome): number[] {
  const problems = validateGenome(genome)

  if (problems.length > 0) {
    throw new Error(`content-code: not a genome (${problems[0]})`)
  }

  if (genome.version >= 2 ** VERSION_BITS) {
    throw new Error(`content-code: version ${genome.version} needs more than ${VERSION_BITS} bits`)
  }

  const out: number[] = []

  for (const f of FIELDS) {
    pushBits(out, f.values.indexOf(f.get(genome)), f.bits)
  }

  pushBits(out, genome.version, VERSION_BITS)

  return out
}

/** The genome a content word names, or null when the word is malformed or names no valid genome. */
export function decodeGenome(word: readonly number[]): IntelligenceGenome | null {
  if (word.length !== CONTENT_TRITS || !word.every(t => t === -1 || t === 1)) {
    return null
  }

  let at = 0

  const take = (bits: number): number => {
    let value = 0

    for (let b = 0; b < bits; b++) {
      value = value * 2 + (word[at++] === 1 ? 1 : 0)
    }

    return value
  }

  const values: (string | number)[] = []

  for (const f of FIELDS) {
    const index = take(f.bits)

    if (index >= f.values.length) {
      return null
    }

    values.push(f.values[index]!)
  }

  const genome = {
    version: take(VERSION_BITS),
    search: { strategy: values[0], heuristic: values[1], weight: values[2] },
    learning: { strategy: values[3], experiences: values[4] },
    operators: { library: values[5], minLength: values[6], maxLength: values[7], minCount: values[8], limit: values[9] },
    budget: { expansions: values[10] },
  }

  return validateGenome(genome).length === 0 ? (genome as IntelligenceGenome) : null
}

/** Whether two genomes are the same record, field for field, version included. */
export function sameGenome(a: IntelligenceGenome, b: IntelligenceGenome): boolean {
  return encodeGenome(a).join(',') === encodeGenome(b).join(',')
}
