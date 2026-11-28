// The measure suite of the computation lab, read off partitioned pair dynamics on any cell graph (spin-one
// algebra). Every measure is a plain reading of configurations: no fit decides a label without its numbers being
// returned beside it.
//
//   labReading        V (valence, sum s), A (excitation, sum s^2), B = 1 - |V / N|, T (tension over edges)
//   pairEntropy       Shannon entropy (nats) of the oriented-pair pattern histogram, a coarse block entropy
//   maxToneEntropy    the largest one-cell entropy a charge sector allows (the sector ceiling for pairEntropy / 2)
//   differenceTrack   a difference against a reference run, as count and graph radius from its origin per round
//   seedMotion        static, ballistic (with speed) or spreading, from a difference track
//   superposes        whether two differences add exactly (passing through) or scatter
//   lineConservedSearch  exact rational search for additive conserved quantities of support at most 2 cells
//   classifyDynamics  the four labels (frozen, ballistic, interacting, mixing) from the numbers above
//
// Seeds are structured: `deBruijnTones` gives a ternary de Bruijn string, every window of length k exactly once.

import { PAIR_COUNT, PairTable } from '@/code/rule/pair-rule'
import { PartitionSchedule } from '@/code/rule/partition-schedule'
import { forwardRoundInPlace } from '@/code/rule/partitioned-pair'
import {
  Tones,
  spinCharge,
  spinExcitation,
  spinTension,
} from '@/code/tone/algebra'

export type LabReading = {
  valence: number
  excitation: number
  balance: number
  tension: number
}

export function labReading(input: {
  state: Tones
  edges: readonly (readonly [number, number])[]
}): LabReading {
  const n = input.state.length
  const valence = spinCharge(input.state)

  return {
    valence,
    excitation: spinExcitation(input.state),
    balance: 1 - Math.abs(valence / n),
    tension: spinTension(input),
  }
}

// entropy in nats of the histogram of the nine oriented pair patterns over `pairs` (flat first, second, ...)
export function pairEntropy(input: {
  state: Tones
  pairs: Int32Array
}): number {
  const counts = new Float64Array(PAIR_COUNT)
  const m = input.pairs.length / 2

  for (let k = 0; k < input.pairs.length; k += 2) {
    const p =
      (input.state[input.pairs[k]!]! + 1) * 3 +
      (input.state[input.pairs[k + 1]!]! + 1)

    counts[p] = counts[p]! + 1
  }

  let h = 0

  for (const c of counts) {
    if (c > 0) {
      h -= (c / m) * Math.log(c / m)
    }
  }

  return h
}

// The largest entropy of one tone with mean charge q per cell (p+ - p- = q): p+- proportional to e^(+-x), p0 to 1,
// with x found by bisection on the mean.
export function maxToneEntropy(q: number): number {
  if (Math.abs(q) >= 1) {
    return 0
  }

  const mean = (x: number): number =>
    (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + 1 + Math.exp(-x))

  let lo = -50
  let hi = 50

  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2

    if (mean(mid) < q) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const x = (lo + hi) / 2
  const z = Math.exp(x) + 1 + Math.exp(-x)
  const ps = [Math.exp(x) / z, 1 / z, Math.exp(-x) / z]

  return -ps.reduce((h, p) => (p > 0 ? h + p * Math.log(p) : h), 0)
}

// the one-cell entropy (nats) of a configuration's tone histogram
export function toneEntropy(state: Tones): number {
  const counts = [0, 0, 0]

  for (const s of state) {
    counts[s + 1]!++
  }

  return -counts.reduce((h, c) => {
    const p = c / state.length

    return p > 0 ? h + p * Math.log(p) : h
  }, 0)
}

// breadth-first distances from one cell
export function graphDistances(input: {
  neighbors: readonly (Uint32Array | readonly number[])[]
  origin: number
}): Int32Array {
  const n = input.neighbors.length
  const dist = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)

  let head = 0
  let tail = 0

  dist[input.origin] = 0
  queue[tail++] = input.origin

  while (head < tail) {
    const v = queue[head++]!

    for (const w of input.neighbors[v]!) {
      if (dist[w] === -1) {
        dist[w] = dist[v]! + 1
        queue[tail++] = w
      }
    }
  }

  return dist
}

export type DifferenceTrack = {
  // number of differing cells per round, rounds 0 to T
  count: number[]
  // the largest and smallest graph distance from the origin of a differing cell per round (-1 when none)
  radius: number[]
  innerRadius: number[]
  // differing cells inside the ball of the current radius, divided by the ball's size, per round
  fill: number[]
}

// Runs a state and a reference state side by side and tracks where they differ.
export function differenceTrack(input: {
  table: PairTable
  schedule: PartitionSchedule
  state: Int8Array
  reference: Int8Array
  rounds: number
  distances: Int32Array
}): DifferenceTrack {
  const a = Int8Array.from(input.state)
  const b = Int8Array.from(input.reference)
  const n = a.length
  const ballSize = new Int32Array(n + 1)

  for (let i = 0; i < n; i++) {
    const d = input.distances[i]!

    if (d >= 0) {
      ballSize[d] = ballSize[d]! + 1
    }
  }

  for (let d = 1; d <= n; d++) {
    ballSize[d] = ballSize[d]! + ballSize[d - 1]!
  }

  const track: DifferenceTrack = {
    count: [],
    radius: [],
    innerRadius: [],
    fill: [],
  }

  const read = (): void => {
    let count = 0
    let radius = -1
    let inner = -1

    for (let i = 0; i < n; i++) {
      if (a[i] !== b[i]) {
        const d = input.distances[i]!

        count++
        radius = Math.max(radius, d)
        inner = inner < 0 ? d : Math.min(inner, d)
      }
    }

    track.count.push(count)
    track.radius.push(radius)
    track.innerRadius.push(inner)
    track.fill.push(radius < 0 ? 0 : count / ballSize[radius]!)
  }

  read()

  for (let t = 0; t < input.rounds; t++) {
    forwardRoundInPlace({ table: input.table, schedule: input.schedule, state: a })
    forwardRoundInPlace({ table: input.table, schedule: input.schedule, state: b })
    read()
  }

  return track
}

export type SeedMotion = {
  kind: 'static' | 'ballistic' | 'spreading' | 'vanished' | 'wandering'
  // radius at the last round over the rounds, exact as a pair
  speedNumerator: number
  speedDenominator: number
  maxCount: number
}

// Static: the difference stays within `initialRadius + 1` of its origin. Ballistic: its cell count stays at most
// `boundedCount` and it leaves the origin, inner radius at the end at least half the outer one. Spreading: its count
// at the end is at least a quarter of the rounds. Vanished: it disappears (cannot happen for a bijection, so it is a
// fault the caller gates on). Anything else is wandering.
export function seedMotion(input: {
  track: DifferenceTrack
  initialRadius: number
  boundedCount: number
}): SeedMotion {
  const { track } = input
  const T = track.count.length - 1
  const maxCount = Math.max(...track.count)
  const finalCount = track.count[T]!
  const radius = track.radius[T]!
  const inner = track.innerRadius[T]!
  const maxRadius = Math.max(...track.radius)
  const kind: SeedMotion['kind'] =
    finalCount === 0
      ? 'vanished'
      : maxRadius <= input.initialRadius + 1
        ? 'static'
        : maxCount <= input.boundedCount && 2 * inner >= radius
          ? 'ballistic'
          : 4 * finalCount >= T
            ? 'spreading'
            : 'wandering'

  return {
    kind,
    speedNumerator: Math.max(radius, 0),
    speedDenominator: T,
    maxCount,
  }
}

// Whether two seeds (differences against a reference run) pass through each other: at every round the combined
// run's difference equals the sum of the two single runs' differences, cell by cell, as integers.
export function superposes(input: {
  table: PairTable
  schedule: PartitionSchedule
  reference: Int8Array
  first: Int8Array
  second: Int8Array
  rounds: number
}): { testable: boolean; superposes: boolean; firstFailure: number } {
  const ref = Int8Array.from(input.reference)
  const one = Int8Array.from(input.first)
  const two = Int8Array.from(input.second)
  const both = Int8Array.from(input.reference)

  // the two seeds overlap into a tone outside {-1, 0, +1}: no combined start exists
  for (let i = 0; i < both.length; i++) {
    const sum = ref[i]! + (one[i]! - ref[i]!) + (two[i]! - ref[i]!)

    if (sum < -1 || sum > 1) {
      return { testable: false, superposes: false, firstFailure: 0 }
    }

    both[i] = sum
  }

  for (let t = 1; t <= input.rounds; t++) {
    for (const s of [ref, one, two, both]) {
      forwardRoundInPlace({ table: input.table, schedule: input.schedule, state: s })
    }

    for (let i = 0; i < both.length; i++) {
      if (both[i]! - ref[i]! !== one[i]! - ref[i]! + (two[i]! - ref[i]!)) {
        return { testable: true, superposes: false, firstFailure: t }
      }
    }
  }

  return { testable: true, superposes: true, firstFailure: -1 }
}

// The ternary de Bruijn string of order k (length 3^k), as tones, by the Fredricksen-Kessler-Maiorana algorithm.
export function deBruijnTones(k: number): Int8Array {
  const a = new Int32Array(k + 1)
  const out: number[] = []

  const generate = (t: number, p: number): void => {
    if (t > k) {
      if (k % p === 0) {
        for (let j = 1; j <= p; j++) {
          out.push(a[j]! - 1)
        }
      }

      return
    }

    a[t] = a[t - p]!
    generate(t + 1, p)

    for (let j = a[t - p]! + 1; j < 3; j++) {
      a[t] = j
      generate(t + 1, t)
    }
  }

  generate(1, 1)

  return Int8Array.from(out)
}

// ---- exact search for additive conserved quantities ----

function gcd(x: bigint, y: bigint): bigint {
  let a = x < 0n ? -x : x
  let b = y < 0n ? -y : y

  while (b !== 0n) {
    const t = a % b

    a = b
    b = t
  }

  return a
}

// the rank of a set of integer rows, by exact fraction-free elimination into an echelon basis
export function integerRank(rows: readonly (readonly number[])[]): number {
  const basis: { pivot: number; row: bigint[] }[] = []

  for (const raw of rows) {
    let row = raw.map(BigInt)

    for (const b of basis) {
      const x = row[b.pivot]!

      if (x !== 0n) {
        const y = b.row[b.pivot]!

        row = row.map((v, j) => v * y - b.row[j]! * x)
      }
    }

    const pivot = row.findIndex(v => v !== 0n)

    if (pivot < 0) {
      continue
    }

    const g = row.reduce((acc, v) => gcd(acc, v), 0n)

    basis.push({ pivot, row: row.map(v => v / g) })
  }

  return basis.length
}

export type ConservedSearch = {
  // the bond period: 1 for translation-invariant densities, 2 for densities that may differ on even and odd bonds
  period: number
  // configurations whose before-and-after pattern counts gave an equation
  equations: number
  // the dimension of bond functions phi with Phi conserved, the trivial ones included
  nullity: number
  // the dimension of the trivial and known ones: coboundaries (Phi = 0 on every ring), constants, Q, and D when the
  // rule conserves it
  known: number
  // every known vector satisfies every equation (the search can see Q, and D where it holds)
  knownConserved: boolean
  // conserved quantities beyond the known ones
  extra: number
}

// Additive conserved quantities of support at most 2 cells on the line. A bond function phi_r on the nine oriented
// patterns, one per bond class r = i mod period of the bond (i, i + 1), gives Phi(x) = sum over bonds of
// phi_r(x_i, x_i+1). Phi is conserved when the pattern counts per class before and after a round agree on phi, and
// every configuration of every given ring (sizes divisible by the period) is one exact integer equation. The null
// space holds the trivial and known quantities, whose span is computed (never assumed), and anything beyond is extra.
export function lineConservedSearch(input: {
  table: PairTable
  schedules: readonly PartitionSchedule[]
  period: number
  conservesExcitation: boolean
}): ConservedSearch {
  const p = input.period
  const dim = PAIR_COUNT * p
  // equal rows add no rank, so each distinct count change is kept once
  const rows = new Map<string, number[]>()

  let equations = 0

  const histogram = (state: Int8Array): number[] => {
    const h = new Array<number>(dim).fill(0)
    const n = state.length

    for (let i = 0; i < n; i++) {
      h[(i % p) * PAIR_COUNT + (state[i]! + 1) * 3 + (state[(i + 1) % n]! + 1)]!++
    }

    return h
  }

  for (const schedule of input.schedules) {
    const n = schedule.size

    if (n % p !== 0) {
      throw new Error(`lineConservedSearch: ring ${n} is not a multiple of ${p}`)
    }

    const total = 3 ** n
    const state = new Int8Array(n)

    for (let x = 0; x < total; x++) {
      let y = x

      for (let i = 0; i < n; i++) {
        state[i] = (y % 3) - 1
        y = (y - (y % 3)) / 3
      }

      const before = histogram(state)

      forwardRoundInPlace({ table: input.table, schedule, state })

      const after = histogram(state)
      const row = after.map((v, j) => v - before[j]!)

      equations++
      rows.set(row.join(','), row)
    }
  }

  // the known vectors: coboundaries g_r(a) - g_(r+1)(b), a constant per class, Q, and D when the rule keeps it
  const knownVectors: number[][] = []
  const at = (r: number, a: number, b: number): number =>
    (r % p) * PAIR_COUNT + (a + 1) * 3 + (b + 1)
  const tones = [-1, 0, 1]

  for (let r = 0; r < p; r++) {
    for (const t of tones) {
      const v = new Array<number>(dim).fill(0)

      for (const a of tones) {
        for (const b of tones) {
          if (a === t) {
            v[at(r, a, b)]! += 1
          }

          if (b === t) {
            v[at(r + p - 1, a, b)]! -= 1
          }
        }
      }

      knownVectors.push(v)
    }

    const constant = new Array<number>(dim).fill(0)

    for (const a of tones) {
      for (const b of tones) {
        constant[at(r, a, b)] = 1
      }
    }

    knownVectors.push(constant)
  }

  const density = (f: (a: number) => number): number[] => {
    const v = new Array<number>(dim).fill(0)

    for (let r = 0; r < p; r++) {
      for (const a of tones) {
        for (const b of tones) {
          v[at(r, a, b)] = f(a)
        }
      }
    }

    return v
  }

  knownVectors.push(density(a => a))

  if (input.conservesExcitation) {
    knownVectors.push(density(a => a * a))
  }

  const eqs = [...rows.values()]
  const knownConserved = knownVectors.every(v =>
    eqs.every(row => row.reduce((s, x, j) => s + x * v[j]!, 0) === 0),
  )
  const nullity = dim - integerRank(eqs)
  const known = integerRank(knownVectors)

  return {
    period: p,
    equations,
    nullity,
    known,
    knownConserved,
    extra: nullity - known,
  }
}

// ---- period growth ----

// The effective power of period growth over EVERY ring size measured: the least-squares slope of ln(mean state
// period) against ln(n) (item vibe-computation-models-0047; a two-point exponent between the smallest and largest ring
// rested on two points). Also the slope of ln(period) against n, the rate an exponential fit would give, and the
// residual sums of both fits, so a reader can see which form the points follow. Needs at least two sizes.
export type PeriodGrowthFit = {
  exponent: number
  exponentialRate: number
  powerResidual: number
  exponentialResidual: number
}

export function periodGrowthFit(input: {
  sizes: readonly number[]
  meanPeriods: readonly number[]
}): PeriodGrowthFit {
  const { sizes, meanPeriods } = input

  if (sizes.length < 2 || sizes.length !== meanPeriods.length) {
    throw new Error('periodGrowthFit: needs two or more sizes, one period each')
  }

  const y = meanPeriods.map(p => Math.log(p))

  const fit = (x: readonly number[]): { slope: number; residual: number } => {
    const n = x.length
    const mx = x.reduce((a, b) => a + b, 0) / n
    const my = y.reduce((a, b) => a + b, 0) / n

    let sxy = 0
    let sxx = 0

    for (let k = 0; k < n; k++) {
      sxy += (x[k]! - mx) * (y[k]! - my)
      sxx += (x[k]! - mx) ** 2
    }

    const slope = sxy / sxx

    let residual = 0

    for (let k = 0; k < n; k++) {
      residual += (y[k]! - my - slope * (x[k]! - mx)) ** 2
    }

    return { slope, residual }
  }

  const power = fit(sizes.map(n => Math.log(n)))
  const exponential = fit(sizes)

  return {
    exponent: power.slope,
    exponentialRate: exponential.slope,
    powerResidual: power.residual,
    exponentialResidual: exponential.residual,
  }
}

// ---- labels ----

export type DynamicsLabel =
  | 'frozen'
  | 'ballistic'
  | 'interacting'
  | 'mixing'
  | 'unresolved'

export type DynamicsEvidence = {
  // effective power of the mean state period over the rings measured (periodGrowthFit)
  periodExponent: number
  // the period exponent above which period growth counts as exponential
  periodExponentCeiling: number
  seedKinds: SeedMotion['kind'][]
  collisionsTested: number
  collisionsScattered: number
  // mean front speed per side on a dense background (hops per round) and the color ceiling c
  damageSpeed: number
  damageCeiling: number
  damageFill: number
  // the farthest any dense-background damage reached at the last round
  damageRadius: number
  // late pair entropy over its sector ceiling, lowest over the low-entropy seeds
  entropyRatio: number
}

export type DynamicsVerdict = {
  label: DynamicsLabel
  exponentialPeriods: boolean
  fillsCone: boolean
  entropyRises: boolean
  someSeedMoves: boolean
  everySeedLocalized: boolean
}

// The decision, fixed before the runs: mixing needs all three of exponential periods, damage filling the cone (front
// at least half a hop per round and at least a quarter of the reached cells differing) and pair entropy reaching 0.9
// of its sector ceiling. Frozen: no seed moves and no dense damage gets more than 2 hops from its cell. Ballistic:
// some seed moves, every seed stays localized, every collision superposes. Interacting: some seed stays localized and
// some collision scatters. Anything else is unresolved, an honest gap, never forced into a label.
export function classifyDynamics(e: DynamicsEvidence): DynamicsVerdict {
  const exponentialPeriods = e.periodExponent > e.periodExponentCeiling
  const fillsCone = e.damageSpeed >= 0.5 && e.damageFill >= 0.25
  const entropyRises = e.entropyRatio >= 0.9
  const someSeedMoves = e.seedKinds.some(k => k !== 'static')
  const everySeedLocalized = e.seedKinds.every(
    k => k === 'static' || k === 'ballistic',
  )
  const someSeedLocalized = e.seedKinds.some(
    k => k === 'static' || k === 'ballistic',
  )
  const label: DynamicsLabel =
    exponentialPeriods && fillsCone && entropyRises
      ? 'mixing'
      : !someSeedMoves && e.damageRadius <= 2
        ? 'frozen'
        : someSeedMoves &&
            everySeedLocalized &&
            e.collisionsScattered === 0
          ? 'ballistic'
          : someSeedLocalized && e.collisionsScattered > 0
            ? 'interacting'
            : 'unresolved'

  return {
    label,
    exponentialPeriods,
    fillsCone,
    entropyRises,
    someSeedMoves,
    everySeedLocalized,
  }
}
