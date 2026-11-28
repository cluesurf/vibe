// Partitioned pair dynamics on any cell graph: one round applies a pair rule to every oriented pair of the first
// matching of a partition schedule, then the second, and so on. The matchings are disjoint pairs, so each one is a
// product of independent pair maps, and a bijective pair rule gives a bijective round whose inverse applies the
// inverse table to the matchings in reverse order.
//
// State is an Int8Array of spin-one tones in {-1, 0, +1}. On rings small enough to list, `globalPermutation`
// writes the round as a permutation of all 3^n configurations (index = sum (s_i + 1) 3^i) for exact cycle
// structure.

import { PairTable, inverseTable } from '@/code/rule/pair-rule'
import { PartitionSchedule } from '@/code/rule/partition-schedule'

// apply one matching in place
function applyMatching(
  table: PairTable,
  matching: Int32Array,
  state: Int8Array,
): void {
  for (let k = 0; k < matching.length; k += 2) {
    const i = matching[k]!
    const j = matching[k + 1]!
    const out = table[(state[i]! + 1) * 3 + (state[j]! + 1)]!

    state[i] = Math.floor(out / 3) - 1
    state[j] = (out % 3) - 1
  }
}

// one forward round in place
export function forwardRoundInPlace(input: {
  table: PairTable
  schedule: PartitionSchedule
  state: Int8Array
}): void {
  for (const matching of input.schedule.matchings) {
    applyMatching(input.table, matching, input.state)
  }
}

// one inverse round in place: the inverse table on the matchings in reverse order
export function inverseRoundInPlace(input: {
  inverse: PairTable
  schedule: PartitionSchedule
  state: Int8Array
}): void {
  const m = input.schedule.matchings

  for (let c = m.length - 1; c >= 0; c--) {
    applyMatching(input.inverse, m[c]!, input.state)
  }
}

export function forwardRounds(input: {
  table: PairTable
  schedule: PartitionSchedule
  state: Int8Array
  rounds: number
}): Int8Array {
  const state = Int8Array.from(input.state)

  for (let t = 0; t < input.rounds; t++) {
    forwardRoundInPlace({ table: input.table, schedule: input.schedule, state })
  }

  return state
}

export function inverseRounds(input: {
  table: PairTable
  schedule: PartitionSchedule
  state: Int8Array
  rounds: number
}): Int8Array {
  const inverse = inverseTable(input.table)
  const state = Int8Array.from(input.state)

  for (let t = 0; t < input.rounds; t++) {
    inverseRoundInPlace({ inverse, schedule: input.schedule, state })
  }

  return state
}

// every state of the run, rounds 0 to `rounds`
export function history(input: {
  table: PairTable
  schedule: PartitionSchedule
  state: Int8Array
  rounds: number
}): Int8Array[] {
  const out = [Int8Array.from(input.state)]
  const state = Int8Array.from(input.state)

  for (let t = 0; t < input.rounds; t++) {
    forwardRoundInPlace({ table: input.table, schedule: input.schedule, state })
    out.push(Int8Array.from(state))
  }

  return out
}

export function encodeState(state: Int8Array | readonly number[]): number {
  let index = 0
  let weight = 1

  for (const s of state) {
    index += (s + 1) * weight
    weight *= 3
  }

  return index
}

export function decodeState(index: number, n: number): Int8Array {
  const state = new Int8Array(n)

  let x = index

  for (let i = 0; i < n; i++) {
    state[i] = (x % 3) - 1
    x = Math.floor(x / 3)
  }

  return state
}

// The round as a permutation of all 3^n configurations (n at most 14). `image[x]` is the code of the round's
// image of configuration x. The caller checks that it is a bijection.
export function globalPermutation(input: {
  table: PairTable
  schedule: PartitionSchedule
}): Int32Array {
  const n = input.schedule.size

  if (n > 14) {
    throw new Error(`globalPermutation: 3^${n} states is too many`)
  }

  const total = 3 ** n
  const image = new Int32Array(total)
  const state = new Int8Array(n)

  for (let x = 0; x < total; x++) {
    let y = x

    for (let i = 0; i < n; i++) {
      state[i] = (y % 3) - 1
      y = (y - (y % 3)) / 3
    }

    forwardRoundInPlace({ table: input.table, schedule: input.schedule, state })
    image[x] = encodeState(state)
  }

  return image
}

export type CycleStructure = {
  isPermutation: boolean
  states: number
  cycles: number
  // period -> number of cycles of that period
  periodCounts: Map<number, number>
  maxPeriod: number
  // the mean period seen from a state, sum over cycles of period^2 / states
  meanStatePeriod: number
}

export function cycleStructure(image: Int32Array): CycleStructure {
  const total = image.length
  const hits = new Uint8Array(total)

  let isPermutation = true

  for (let x = 0; x < total; x++) {
    const y = image[x]!

    if (y < 0 || y >= total || hits[y] === 1) {
      isPermutation = false
      break
    }

    hits[y] = 1
  }

  const periodCounts = new Map<number, number>()

  if (!isPermutation) {
    return {
      isPermutation,
      states: total,
      cycles: 0,
      periodCounts,
      maxPeriod: 0,
      meanStatePeriod: 0,
    }
  }

  const seen = new Uint8Array(total)

  let cycles = 0
  let maxPeriod = 0
  let weighted = 0

  for (let x = 0; x < total; x++) {
    if (seen[x] === 1) {
      continue
    }

    let period = 0
    let y = x

    while (seen[y] === 0) {
      seen[y] = 1
      y = image[y]!
      period++
    }

    cycles++
    periodCounts.set(period, (periodCounts.get(period) ?? 0) + 1)
    maxPeriod = Math.max(maxPeriod, period)
    weighted += period * period
  }

  return {
    isPermutation,
    states: total,
    cycles,
    periodCounts,
    maxPeriod,
    meanStatePeriod: weighted / total,
  }
}
