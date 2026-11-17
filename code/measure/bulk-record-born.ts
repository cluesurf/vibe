// BORN WEIGHTS AGAINST THE BULK'S RECORD CONFIGURATIONS. Instruments for reading a superposed state of the rule
// (code/rule/doublet-locked-knit LockedState, merged branches, so every branch is one base configuration with a nonzero
// amplitude) as records: each configuration carries one outcome (a husk count, a line, any label a bulk part fixes),
// and each outcome gets two weights.
//
// - Born: the sum of |amplitude|^2 over the configurations showing the outcome, a whole number over 4^K.
// - Count: the number of configurations showing the outcome, the bulk's own measure when every base configuration
//   weighs the same (the base step is a permutation of configurations, E-FND-0082, so a uniform measure is the one it
//   keeps).
// - Weighted counts: any weight that is a function of the configuration alone (depth, level, links), summed.
//
// recordTally reads one state; addTallies combines tallies of states whose configurations are disjoint (two lines run
// on two tubes) by lifting to a common K; sameShare compares two shares exactly as fractions; supportKeys gives a
// state's configurations as keys, so two states can be checked to hold the same records.
//
// MEASUREMENT: exact bigint arithmetic for Born and counts; weighted counts are floats (the weights are). No random
// numbers.

import type { Branch, LockedState } from '@/code/rule/doublet-locked-knit'
import { largestK } from '@/code/measure/husk-content'

export type RecordTally = {
  // Born numerators over 4^K, per outcome and in all
  readonly K: number
  readonly born: ReadonlyMap<string, bigint>
  readonly bornTotal: bigint
  // configurations per outcome and in all
  readonly count: ReadonlyMap<string, bigint>
  readonly countTotal: bigint
  // per weighting name, per outcome
  readonly weighted: ReadonlyMap<string, ReadonlyMap<string, number>>
}

export type Weighting = (branch: Branch) => number

export const eisensteinNorm = (a: bigint, b: bigint): bigint => a * a - a * b + b * b

export function recordTally(input: {
  state: LockedState
  outcomeOf: (branch: Branch) => string
  weightings?: Readonly<Record<string, Weighting>>
}): RecordTally {
  const { state, outcomeOf } = input
  const weightings = input.weightings ?? {}
  const K = largestK(state)
  const born = new Map<string, bigint>()
  const count = new Map<string, bigint>()
  const weighted = new Map<string, Map<string, number>>(
    Object.keys(weightings).map(n => [n, new Map<string, number>()]),
  )

  let bornTotal = 0n
  let countTotal = 0n

  for (const br of state.branches) {
    const w = eisensteinNorm(br.a, br.b) << BigInt(2 * (K - br.k))

    if (w === 0n) {
      continue
    }

    const o = outcomeOf(br)

    born.set(o, (born.get(o) ?? 0n) + w)
    count.set(o, (count.get(o) ?? 0n) + 1n)
    bornTotal += w
    countTotal += 1n

    for (const [name, f] of Object.entries(weightings)) {
      const m = weighted.get(name)!

      m.set(o, (m.get(o) ?? 0) + f(br))
    }
  }

  return { K, born, bornTotal, count, countTotal, weighted }
}

// combine tallies of states with disjoint configurations
export function addTallies(list: readonly RecordTally[]): RecordTally {
  const K = Math.max(0, ...list.map(t => t.K))
  const born = new Map<string, bigint>()
  const count = new Map<string, bigint>()
  const weighted = new Map<string, Map<string, number>>()

  let bornTotal = 0n
  let countTotal = 0n

  for (const t of list) {
    const lift = BigInt(2 * (K - t.K))

    for (const [o, w] of t.born) {
      born.set(o, (born.get(o) ?? 0n) + (w << lift))
    }

    for (const [o, n] of t.count) {
      count.set(o, (count.get(o) ?? 0n) + n)
    }

    for (const [name, m] of t.weighted) {
      const into = weighted.get(name) ?? new Map<string, number>()

      for (const [o, v] of m) {
        into.set(o, (into.get(o) ?? 0) + v)
      }

      weighted.set(name, into)
    }

    bornTotal += t.bornTotal << lift
    countTotal += t.countTotal
  }

  return { K, born, bornTotal, count, countTotal, weighted }
}

// whether x / xTotal equals y / yTotal exactly
export const sameShare = (x: bigint, xTotal: bigint, y: bigint, yTotal: bigint): boolean =>
  x * yTotal === y * xTotal

export const shareOf = (x: bigint, total: bigint): number =>
  total === 0n ? Number.NaN : Number((x * 10n ** 15n) / total) / 1e15

export function weightedShare(t: RecordTally, name: string, outcome: string): number {
  const m = t.weighted.get(name)

  if (!m) {
    return Number.NaN
  }

  let total = 0

  for (const v of m.values()) {
    total += v
  }

  return (m.get(outcome) ?? 0) / total
}

// a configuration as a key (every nonzero entry of every array)
export function configurationKey(br: Branch): string {
  const parts: string[] = []
  const add = (tag: string, a: Int8Array | Uint8Array): void => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== 0) {
        parts.push(`${tag}${i}:${a[i]}`)
      }
    }
  }

  add('v', br.vibe)
  add('p', br.point)
  add('o', br.open)
  add('s', br.store)
  add('q', br.spoint)
  add('u', br.sopen)

  return parts.join(',')
}

export function supportKeys(state: LockedState): Set<string> {
  const out = new Set<string>()

  for (const br of state.branches) {
    if (br.a !== 0n || br.b !== 0n) {
      out.add(configurationKey(br))
    }
  }

  return out
}

// a state with every amplitude of `state` multiplied by (a + b w) / 2^k
export function scaledState(state: LockedState, a: bigint, b: bigint, k: number): LockedState {
  return {
    branches: state.branches.map(br => ({
      ...br,
      // (x + y w)(a + b w) with w^2 = -1 - w
      a: br.a * a - br.b * b,
      b: br.a * b + br.b * a - br.b * b,
      k: br.k + k,
    })),
  }
}

// the same configurations, every amplitude set to 1: the uniform mixture's stand-in, whose Born tally must equal the count
export function flatState(state: LockedState): LockedState {
  return { branches: state.branches.map(br => ({ ...br, a: 1n, b: 0n, k: 0 })) }
}
