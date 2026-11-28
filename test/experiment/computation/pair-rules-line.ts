// M1 on the line: the 24 conservative reversible ternary pair rules, their 12 classes, and what each class does
// on a ring of tiles under a partition schedule. Algebra: spin-one (Q = sum s conserved, D = sum s^2 for some).
// Schedules, two families, each in forward and in reversed color order, every matched pair oriented left to right:
//   - brick2: the greedy edge coloring of the ring (2 matchings on an even ring, 3 on an odd one). On an even ring the
//     reversed order is the forward one translated by one cell, so its two orders are one schedule.
//   - brick3: the period-3 brick coloring, edge (i, i + 1) of color i mod 3, on
//     rings whose size is a multiple of 3. Its reversed order (2, 1, 0) is no translate of the forward order (0, 1, 2)
//     under any shift or round phase (a gate checks this directly), so it is a second schedule.
// Boundary: the closed ring; a ring of n > 2 c T + seed cells is also an exact window on the infinite line for T
// rounds, so the seed, collision and damage runs read the open line too.
//
// Gates (any failure fails the experiment):
//   - brute force over all 9! permutations of the nine pairs finds exactly 24 charge-conserving ones, equal to the
//     fiber construction, in 12 classes under {1, P, C, PC}, and adding time reversal merges none
//   - fixing the vacuum pair, conserving D and commuting with the swap coincide: 8 rules have all three, 16 none
//   - every schedule color is a matching and the colors cover every ring edge once, under both families
//   - translation control: the brick2 reversed order IS a translate of its forward order on every even ring, and the
//     brick3 reversed order is NOT a translate of its forward order (so brick3 can show schedule sensitivity)
//   - the inverse round restores every configuration of every ring n <= 8 exhaustively (brick3: n = 3, 6), and a
//     dense de Bruijn ring after 40 rounds
//   - Q is constant on every configuration of every ring n <= 8, D too for the 8 vacuum-fixing rules, and D moves
//     on some configuration for each of the 16 creating rules (the negative control of the D gate)
//   - live symmetry commutation on every configuration of rings n = 4, 6, 8 (brick2): step(R x) = R step(x) for the
//     swap-symmetric rules (R the reflection that keeps the matchings and reverses orientation), step(-x) = -step(x)
//     for the negation-symmetric ones, step(-R x) = -R step(x) for the swap-negation-symmetric ones, and each
//     fails on some configuration for every rule without that symmetry
//   - every round is a bijection of all 3^n configurations, n <= 12, under both families
//   - no damage front outruns the ceiling of c hops per round
//   - brick2: every member of a class gets the class's label under both orders; brick3: every C-member gets the
//     representative's label under the same order (the brick3 mirror maps the schedule to its reversed order with a
//     round phase shift, so P-members are compared with the reversed order and reported, not gated)
//   - two full runs give identical bytes, and no file of this lab draws a random number
//
// Measures per class: exact cycle structure on rings n = 3..12 (brick3: 3, 6, 9, 12), the period exponent as a
// least-squares fit over every ring of the fit (brick2 6, 8, 10, 12; brick3 6, 9, 12), small-support seeds
// (static, ballistic or spreading), pairwise collisions of moving seeds (superpose or scatter), damage on a dense de
// Bruijn background, pair entropy from three low-entropy starts against the sector ceiling (the label's input), V,
// A, B, T, and an exact rational search for additive conserved quantities of support at most 2 cells. For the
// representatives, entropy is also read from more start families closed under P and C (de Bruijn eighths, block walls)
// and reported start by start against the 0.9 threshold. Labels and their thresholds are fixed in
// classifyDynamics (code/measure/lab-measures).

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  ConservedSearch,
  DynamicsVerdict,
  LabReading,
  SeedMotion,
  classifyDynamics,
  deBruijnTones,
  differenceTrack,
  graphDistances,
  labReading,
  lineConservedSearch,
  maxToneEntropy,
  pairEntropy,
  periodGrowthFit,
  seedMotion,
  superposes,
  toneEntropy,
} from '@/code/measure/lab-measures'
import {
  PairRule,
  PairTable,
  commutesWithNegation,
  commutesWithSwap,
  commutesWithSwapNegation,
  conjugateTable,
  conservesExcitation,
  fixesVacuum,
  inverseTable,
  isBijection,
  negatePair,
  pairRuleCensus,
  pairRuleClasses,
  pairRulesFromFibers,
  sameTable,
  tableKey,
} from '@/code/rule/pair-rule'
import {
  PartitionSchedule,
  checkSchedule,
  ringSchedule,
} from '@/code/rule/partition-schedule'
import {
  cycleStructure,
  forwardRoundInPlace,
  forwardRounds,
  globalPermutation,
  inverseRoundInPlace,
  inverseRounds,
} from '@/code/rule/partitioned-pair'
import { torusGrid } from '@/code/substrate/torus-grid'
import { spinCharge, spinExcitation } from '@/code/tone/algebra'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/tone/algebra.ts',
  'code/rule/pair-rule.ts',
  'code/rule/partition-schedule.ts',
  'code/rule/partitioned-pair.ts',
  'code/measure/lab-measures.ts',
  'test/experiment/computation/pair-rules-line.ts',
]

type ColorOrder = 'forward' | 'reverse'
type ScheduleKind = 'brick2' | 'brick3'

const KINDS: readonly ScheduleKind[] = ['brick2', 'brick3']
const ORDERS: readonly ColorOrder[] = ['forward', 'reverse']

// the effective power of period growth above which it counts as exponential (faster than cubic)
const PERIOD_EXPONENT_CEILING = 3
// the old two-point exponent's rings, reported beside the fit
const EXPONENT_SMALL = 6
const EXPONENT_LARGE = 12
// exhaustive inverse, conservation and symmetry gates
const EXHAUSTIVE_SIZES = [3, 4, 5, 6, 7, 8]
const EXHAUSTIVE_SIZES_3 = [3, 6]
const SYMMETRY_SIZES = [4, 6, 8]
const SEED_ROUNDS = 24
const COLLISION_GAP = 16
// damage: the order-5 ternary de Bruijn string plus vacuum cells (one for brick2: an even ring of 244; three for
// brick3: 246, a multiple of 3)
const DAMAGE_ORDER = 5
const DAMAGE_ROUNDS = 40
const DAMAGE_SITES = 8
const ENTROPY_ROUNDS = 2048
const ENTROPY_WINDOW = 512
// entropy reported per start: a start counts when its own ratio is at most ENTROPY_LOW_START (as in the
// harness), the threshold is classifyDynamics' 0.9, and a verdict is clear only ENTROPY_MARGIN away from it; all three
// fixed before the first run of the families
const ENTROPY_THRESHOLD = 0.9
const ENTROPY_LOW_START = 0.6
const ENTROPY_MARGIN = 0.05
// 4 blocks, not 8: at 8 a block wall start sits exactly on the 0.6 cut and is counted or not by float rounding
const ENTROPY_BLOCKS = 4

// ring sizes per schedule family; brick3 sizes are multiples of 3, its seed ring wider for 3 colors (n > 2 c T + 5)
const RINGS: Record<
  ScheduleKind,
  {
    cycles: number[]
    fit: number[]
    seed: number
    origin: number
    damagePad: number
    entropy: number
    conserved: number[]
    conservedPeriods: number[]
  }
> = {
  brick2: {
    cycles: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    fit: [6, 8, 10, 12],
    seed: 128,
    origin: 64,
    damagePad: 1,
    entropy: 256,
    conserved: [4, 5, 6, 7, 8],
    conservedPeriods: [1, 2],
  },
  brick3: {
    cycles: [3, 6, 9, 12],
    fit: [6, 9, 12],
    seed: 150,
    origin: 75,
    damagePad: 3,
    entropy: 258,
    conserved: [3, 6, 9],
    conservedPeriods: [1, 3],
  },
}

const scheduleCache = new Map<string, PartitionSchedule>()
const neighborCache = new Map<number, Uint32Array[]>()

function ring(n: number): Uint32Array[] {
  let g = neighborCache.get(n)

  if (!g) {
    g = torusGrid(1, n)
    neighborCache.set(n, g)
  }

  return g
}

// The period-3 brick coloring: edge (i, i + 1 mod n) has color i mod 3, oriented left to right. A proper coloring of
// the infinite line, restricted to a ring whose size is a multiple of 3.
function brick3Schedule(n: number, order: ColorOrder): PartitionSchedule {
  if (n % 3 !== 0) {
    throw new Error(`pair-rules-line: brick3 needs a multiple of 3, got ${n}`)
  }

  const colors = order === 'forward' ? [0, 1, 2] : [2, 1, 0]

  return {
    size: n,
    matchings: colors.map(c => {
      const flat: number[] = []

      for (let i = c; i < n; i += 3) {
        flat.push(i, (i + 1) % n)
      }

      return Int32Array.from(flat)
    }),
    method: 'generator-coloring',
    colorCount: 3,
    colorOrder: colors,
    orientation: 'left-to-right (i, i + 1 mod n), period-3 brick coloring',
  }
}

function schedule(
  n: number,
  order: ColorOrder,
  kind: ScheduleKind = 'brick2',
): PartitionSchedule {
  const key = `${kind}:${n}:${order}`

  let s = scheduleCache.get(key)

  if (!s) {
    s =
      kind === 'brick2'
        ? ringSchedule({ neighbors: ring(n), colorOrder: order })
        : brick3Schedule(n, order)
    scheduleCache.set(key, s)
  }

  return s
}

// Whether the second schedule is the first one translated: some shift k and round phase j with matching t of the
// second equal to matching t + j of the first shifted by k, as oriented pair sets. A translate is the same schedule.
export function isTranslate(a: PartitionSchedule, b: PartitionSchedule): boolean {
  const n = a.size
  const c = a.matchings.length

  if (b.size !== n || b.matchings.length !== c) {
    return false
  }

  const asSet = (m: Int32Array, k: number): Set<string> => {
    const out = new Set<string>()

    for (let x = 0; x < m.length; x += 2) {
      out.add(`${(m[x]! + k) % n},${(m[x + 1]! + k) % n}`)
    }

    return out
  }

  const same = (x: Set<string>, y: Set<string>): boolean =>
    x.size === y.size && [...x].every(e => y.has(e))

  for (let k = 0; k < n; k++) {
    for (let j = 0; j < c; j++) {
      if (
        b.matchings.every((m, t) =>
          same(asSet(m, 0), asSet(a.matchings[(t + j) % c]!, k)),
        )
      ) {
        return true
      }
    }
  }

  return false
}

function ringPairs(n: number): Int32Array {
  const pairs = new Int32Array(2 * n)

  for (let i = 0; i < n; i++) {
    pairs[2 * i] = i
    pairs[2 * i + 1] = (i + 1) % n
  }

  return pairs
}

function ringEdges(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [i, (i + 1) % n])
}

function decodeInto(x: number, state: Int8Array): void {
  let y = x

  for (let i = 0; i < state.length; i++) {
    state[i] = (y % 3) - 1
    y = (y - (y % 3)) / 3
  }
}

function equal(a: Int8Array, b: Int8Array): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

// ---- gates on one rule ----

type RuleGates = {
  inverseRestores: boolean
  chargeConstant: boolean
  excitationConstant: boolean
  excitationMoves: boolean
  bijectiveUpTo12: boolean
  swapCommutes: boolean
  swapBreaks: boolean
  negationCommutes: boolean
  negationBreaks: boolean
  swapNegationCommutes: boolean
  swapNegationBreaks: boolean
}

function ruleGates(table: PairTable, bijectiveUpTo12: boolean): RuleGates {
  const inverse = inverseTable(table)

  let inverseRestores = true
  let chargeConstant = true
  let excitationConstant = true
  let excitationMoves = false

  const exhaustive: [ScheduleKind, number[]][] = [
    ['brick2', EXHAUSTIVE_SIZES],
    ['brick3', EXHAUSTIVE_SIZES_3],
  ]

  for (const [kind, sizes] of exhaustive) {
    for (const order of ORDERS) {
      for (const n of sizes) {
        const s = schedule(n, order, kind)
        const state = new Int8Array(n)
        const start = new Int8Array(n)

        for (let x = 0; x < 3 ** n; x++) {
          decodeInto(x, state)
          start.set(state)
          forwardRoundInPlace({ table, schedule: s, state })

          if (spinCharge(state) !== spinCharge(start)) {
            chargeConstant = false
          }

          if (spinExcitation(state) !== spinExcitation(start)) {
            excitationConstant = false
            excitationMoves = true
          }

          inverseRoundInPlace({ inverse, schedule: s, state })

          if (!equal(state, start)) {
            inverseRestores = false
          }
        }
      }
    }
  }

  // the reflection R(i) = n - 1 - i keeps the even ring's matchings and reverses every orientation
  let swapCommutes = true
  let swapBreaks = false
  let negationCommutes = true
  let negationBreaks = false
  let swapNegationCommutes = true
  let swapNegationBreaks = false

  for (const n of SYMMETRY_SIZES) {
    const s = schedule(n, 'forward')
    const x = new Int8Array(n)
    const fx = new Int8Array(n)
    const g = new Int8Array(n)
    const want = new Int8Array(n)
    const transforms: [(i: number) => number, number][] = [
      [i => n - 1 - i, 1],
      [i => i, -1],
      [i => n - 1 - i, -1],
    ]

    for (let v = 0; v < 3 ** n; v++) {
      decodeInto(v, x)
      fx.set(x)
      forwardRoundInPlace({ table, schedule: s, state: fx })

      transforms.forEach(([place, sign], k) => {
        for (let i = 0; i < n; i++) {
          g[place(i)] = sign * x[i]!
          want[place(i)] = sign * fx[i]!
        }

        forwardRoundInPlace({ table, schedule: s, state: g })

        const commutes = equal(g, want)

        if (k === 0) {
          swapCommutes &&= commutes
          swapBreaks ||= !commutes
        } else if (k === 1) {
          negationCommutes &&= commutes
          negationBreaks ||= !commutes
        } else {
          swapNegationCommutes &&= commutes
          swapNegationBreaks ||= !commutes
        }
      })
    }
  }

  return {
    inverseRestores,
    chargeConstant,
    excitationConstant,
    excitationMoves,
    bijectiveUpTo12,
    swapCommutes,
    swapBreaks,
    negationCommutes,
    negationBreaks,
    swapNegationCommutes,
    swapNegationBreaks,
  }
}

// ---- measures on one rule under one schedule ----

// A seed is one or two cells set off a uniform background. Each of the three uniform states (all -1, all 0, all +1)
// is a fixed point of every conservative pair rule or, for the creating rules, the start of a live vacuum, so each
// is a background the seeds are read against: an excitation is a cell off its background.
type SeedDef = {
  background: number
  offsets: number[]
  values: number[]
  radius: number
}

function seedDefinitions(): SeedDef[] {
  const out: SeedDef[] = []

  for (const background of [-1, 0, 1]) {
    const tones = [-1, 0, 1].filter(t => t !== background)

    for (const shift of [0, 1]) {
      for (const v of tones) {
        out.push({ background, offsets: [shift], values: [v], radius: shift })
      }

      for (const gap of [1, 2]) {
        for (const v of tones) {
          for (const w of tones) {
            out.push({
              background,
              offsets: [shift, shift + gap],
              values: [v, w],
              radius: shift + gap,
            })
          }
        }
      }
    }
  }

  return out
}

const SEEDS = seedDefinitions()

type RingMeasure = {
  cycles: {
    n: number
    isPermutation: boolean
    cycles: number
    maxPeriod: number
    meanStatePeriod: number
  }[]
  // the least-squares fit over the family's fit rings (the label's input), and the old two-point exponent 6 -> 12
  periodExponent: number
  periodExponentTwoPoint: number
  powerResidual: number
  exponentialRate: number
  exponentialResidual: number
  vacuumPeriod: number
  seeds: (SeedMotion & { seed: string })[]
  collisionsTested: number
  collisionsScattered: number
  damageSpeed: number
  damageFill: number
  damageRadius: number
  ceilingViolations: number
  damageRestores: boolean
  entropyRatio: number
  entropyRatios: number[]
  entropyStart: number
  conserved: ConservedSearch[]
  readingStart: LabReading
  readingEnd: LabReading
  verdict: DynamicsVerdict
}

function placeSeed(
  vacuum: Int8Array,
  seed: SeedDef,
  origin: number,
): Int8Array {
  const state = Int8Array.from(vacuum)

  seed.offsets.forEach((o, k) => {
    state[origin + o] = seed.values[k]!
  })

  return state
}

// the late pair entropy of one start over its sector ceiling, and the start's own ratio
function entropyOf(
  table: PairTable,
  sched: PartitionSchedule,
  start: Int8Array,
): { start: number; late: number } {
  const n = start.length
  const pairs = ringPairs(n)
  // the sector ceiling: with D conserved the tone histogram is conserved and the pair entropy is at most twice its
  // entropy; otherwise at most twice the largest tone entropy the charge allows
  const ceiling =
    2 *
    (conservesExcitation(table)
      ? toneEntropy(start)
      : maxToneEntropy(spinCharge(start) / n))
  const state = Int8Array.from(start)

  let late = 0

  const own = pairEntropy({ state, pairs }) / ceiling

  for (let t = 1; t <= ENTROPY_ROUNDS; t++) {
    forwardRoundInPlace({ table, schedule: sched, state })

    if (t > ENTROPY_ROUNDS - ENTROPY_WINDOW) {
      late += pairEntropy({ state, pairs })
    }
  }

  return { start: own, late: late / ENTROPY_WINDOW / ceiling }
}

// the label's three low-entropy starts, closed under P and C: a domain wall (+1 | -1) and the half blocks (+1 | 0)
// and (-1 | 0)
function wallStarts(n: number): Int8Array[] {
  const half = n / 2

  return [
    Int8Array.from({ length: n }, (_, i) => (i < half ? 1 : -1)),
    Int8Array.from({ length: n }, (_, i) => (i < half ? 1 : 0)),
    Int8Array.from({ length: n }, (_, i) => (i < half ? -1 : 0)),
  ]
}

function measureRing(
  table: PairTable,
  order: ColorOrder,
  kind: ScheduleKind,
): RingMeasure {
  const rings = RINGS[kind]
  // exact cycle structure
  const cycles = rings.cycles.map(n => {
    const c = cycleStructure(
      globalPermutation({ table, schedule: schedule(n, order, kind) }),
    )

    return {
      n,
      isPermutation: c.isPermutation,
      cycles: c.cycles,
      maxPeriod: c.maxPeriod,
      meanStatePeriod: c.meanStatePeriod,
    }
  })
  const msp = (n: number): number =>
    cycles.find(c => c.n === n)!.meanStatePeriod
  const fit = periodGrowthFit({
    sizes: rings.fit,
    meanPeriods: rings.fit.map(msp),
  })
  const periodExponent = fit.exponent
  const periodExponentTwoPoint =
    Math.log(msp(EXPONENT_LARGE) / msp(EXPONENT_SMALL)) /
    Math.log(EXPONENT_LARGE / EXPONENT_SMALL)

  // the vacuum's recurrence on the seed ring
  const seedRing = rings.seed
  const seedOrigin = rings.origin
  const seedSchedule = schedule(seedRing, order, kind)
  const vacuum = new Int8Array(seedRing)
  const v = Int8Array.from(vacuum)

  let vacuumPeriod = 0

  do {
    forwardRoundInPlace({ table, schedule: seedSchedule, state: v })
    vacuumPeriod++
  } while (!equal(v, vacuum) && vacuumPeriod < 10000)

  // small-support seeds against the run of their uniform background
  const distances = graphDistances({
    neighbors: ring(seedRing),
    origin: seedOrigin,
  })
  const uniform = (tone: number): Int8Array =>
    new Int8Array(seedRing).fill(tone)
  const seeds = SEEDS.map(seed => {
    const track = differenceTrack({
      table,
      schedule: seedSchedule,
      state: placeSeed(uniform(seed.background), seed, seedOrigin),
      reference: uniform(seed.background),
      rounds: SEED_ROUNDS,
      distances,
    })

    return {
      ...seedMotion({
        track,
        initialRadius: seed.radius,
        boundedCount: 4,
      }),
      seed: `${seed.background}|${seed.offsets.join('+')}:${seed.values.join(',')}`,
    }
  })

  // collisions: every ordered pair of seeds on the same background where at least one is localized (static or
  // ballistic) and at least one moves (anything but static), the second COLLISION_GAP cells to the right, so a
  // mover (a particle, or the front of a spreading seed) meets a particle or a static structure
  const kindOf = new Map(SEEDS.map((s, k) => [s, seeds[k]!.kind]))
  const isLocalized = (s: SeedDef): boolean =>
    kindOf.get(s) === 'ballistic' || kindOf.get(s) === 'static'
  const isMoving = (s: SeedDef): boolean => kindOf.get(s) !== 'static'

  let collisionsTested = 0
  let collisionsScattered = 0

  for (const a of SEEDS) {
    for (const b of SEEDS) {
      if (
        a.background !== b.background ||
        !(isLocalized(a) || isLocalized(b)) ||
        !(isMoving(a) || isMoving(b))
      ) {
        continue
      }

      const reference = uniform(a.background)
      const r = superposes({
        table,
        schedule: seedSchedule,
        reference,
        first: placeSeed(reference, a, seedOrigin - COLLISION_GAP / 2),
        second: placeSeed(reference, b, seedOrigin + COLLISION_GAP / 2),
        rounds: SEED_ROUNDS,
      })

      if (r.testable) {
        collisionsTested++

        if (!r.superposes) {
          collisionsScattered++
        }
      }
    }
  }

  // damage on a dense background: the de Bruijn string plus vacuum cells, its negation, its mirror image and the
  // negated mirror, with the flip sites mirrored too, so the damage readings are the same for every member of a
  // class (the start set is closed under P and C)
  const background = Int8Array.from([
    ...deBruijnTones(DAMAGE_ORDER),
    ...new Array<number>(rings.damagePad).fill(0),
  ])
  const dn = background.length
  const damageSchedule = schedule(dn, order, kind)
  const c = damageSchedule.colorCount
  const sites = Array.from({ length: DAMAGE_SITES }, (_, k) =>
    Math.floor((k * dn) / DAMAGE_SITES),
  )
  const mirror = (s: Int8Array): Int8Array =>
    Int8Array.from({ length: dn }, (_, i) => s[dn - 1 - i]!)
  const negate = (s: Int8Array): Int8Array => s.map(x => -x)
  const damageStarts: [Int8Array, number[]][] = [
    [background, sites],
    [negate(background), sites],
    [mirror(background), sites.map(s => dn - 1 - s)],
    [negate(mirror(background)), sites.map(s => dn - 1 - s)],
  ]

  let speedSum = 0
  let fillSum = 0
  let damageRadius = 0
  let ceilingViolations = 0
  let runs = 0

  const flips = damageStarts.flatMap(([start, flipSites]) =>
    flipSites.map(site => ({ start, site })),
  )

  for (const { start, site } of flips) {
    const siteDistances = graphDistances({ neighbors: ring(dn), origin: site })

    for (const delta of [1, 2]) {
      const flipped = Int8Array.from(start)

      flipped[site] = ((start[site]! + 1 + delta) % 3) - 1

      const track = differenceTrack({
        table,
        schedule: damageSchedule,
        state: flipped,
        reference: start,
        rounds: DAMAGE_ROUNDS,
        distances: siteDistances,
      })

      track.radius.forEach((r, t) => {
        if (r > c * t) {
          ceilingViolations++
        }
      })

      speedSum += Math.max(track.radius[DAMAGE_ROUNDS]!, 0) / DAMAGE_ROUNDS
      fillSum += track.fill[DAMAGE_ROUNDS]!
      damageRadius = Math.max(damageRadius, track.radius[DAMAGE_ROUNDS]!)
      runs++
    }
  }

  const forward = forwardRounds({
    table,
    schedule: damageSchedule,
    state: background,
    rounds: DAMAGE_ROUNDS,
  })
  const damageRestores = equal(
    inverseRounds({
      table,
      schedule: damageSchedule,
      state: forward,
      rounds: DAMAGE_ROUNDS,
    }),
    background,
  )

  // entropy from the three low-entropy starts closed under P and C (each mirror image and each negation is a
  // translate by a multiple of the schedule's period: half of 256 or of 258)
  const entropyRing = rings.entropy
  const entropySchedule = schedule(entropyRing, order, kind)
  const starts = wallStarts(entropyRing)
  const entropyRatios: number[] = []

  let entropyStart = 0

  for (const start of starts) {
    const e = entropyOf(table, entropySchedule, start)

    entropyStart = Math.max(entropyStart, e.start)
    entropyRatios.push(e.late)
  }

  const entropyRatio = Math.min(...entropyRatios)

  const edges = ringEdges(entropyRing)
  const readingStart = labReading({ state: starts[0]!, edges })
  const readingEnd = labReading({
    state: forwardRounds({
      table,
      schedule: entropySchedule,
      state: starts[0]!,
      rounds: ENTROPY_ROUNDS,
    }),
    edges,
  })

  // translation-invariant densities, and densities free to differ on bonds of each class mod the schedule's period
  // (brick2: even and odd bonds; brick3: bonds mod 3)
  const dConserved = conservesExcitation(table)
  const conserved = rings.conservedPeriods.map(period =>
    lineConservedSearch({
      table,
      schedules: rings.conserved
        .filter(n => n % period === 0)
        .map(n => schedule(n, order, kind)),
      period,
      conservesExcitation: dConserved,
    }),
  )

  const damageSpeed = speedSum / runs
  const damageFill = fillSum / runs
  const result = classifyDynamics({
    periodExponent,
    periodExponentCeiling: PERIOD_EXPONENT_CEILING,
    seedKinds: seeds.map(s => s.kind),
    collisionsTested,
    collisionsScattered,
    damageSpeed,
    damageCeiling: c,
    damageFill,
    damageRadius,
    entropyRatio,
  })

  return {
    cycles,
    periodExponent,
    periodExponentTwoPoint,
    powerResidual: fit.powerResidual,
    exponentialRate: fit.exponentialRate,
    exponentialResidual: fit.exponentialResidual,
    vacuumPeriod,
    seeds,
    collisionsTested,
    collisionsScattered,
    damageSpeed,
    damageFill,
    damageRadius,
    ceilingViolations,
    damageRestores,
    entropyRatio,
    entropyRatios,
    entropyStart,
    conserved,
    readingStart,
    readingEnd,
    verdict: result,
  }
}

// ---- entropy start families, per start ----

export type EntropyStartReading = {
  family: string
  start: number
  startRatio: number
  late: number
  // late minus the 0.9 threshold
  margin: number
  counted: boolean
}

export type EntropyFamilies = {
  starts: EntropyStartReading[]
  // over the counted starts: 'high' when every one is at least ENTROPY_MARGIN above 0.9, 'low' when every one is at
  // least ENTROPY_MARGIN below, else 'open'
  status: 'high' | 'low' | 'open'
}

// Start families closed under P (mirror) and C (negation), each start with its mirror, negation and negated mirror:
// the label's walls, de Bruijn eighths (the order-4 string on the first eighth, vacuum on the rest; a half started above 0.6 everywhere) and block walls
// (ENTROPY_BLOCKS alternating blocks of +1 and -1, and of +1 and 0).
function entropyFamilyStarts(n: number): { family: string; state: Int8Array }[] {
  const close = (family: string, s: Int8Array): { family: string; state: Int8Array }[] => {
    const mirror = Int8Array.from({ length: n }, (_, i) => s[n - 1 - i]!)

    return [s, s.map(x => -x), mirror, mirror.map(x => -x)].map(state => ({
      family,
      state: Int8Array.from(state),
    }))
  }

  const eighth = Math.floor(n / 8)
  const de = deBruijnTones(4)
  const block = (i: number): number => Math.floor((ENTROPY_BLOCKS * i) / n) % 2

  return [
    ...wallStarts(n).flatMap(s => close('wall', s)),
    ...close('de-bruijn-eighth', Int8Array.from({ length: n }, (_, i) => (i < eighth ? de[i]! : 0))),
    ...close('blocks-plus-minus', Int8Array.from({ length: n }, (_, i) => (block(i) === 0 ? 1 : -1))),
    ...close('blocks-plus-zero', Int8Array.from({ length: n }, (_, i) => (block(i) === 0 ? 1 : 0))),
  ]
}

function entropyFamilies(
  table: PairTable,
  order: ColorOrder,
  kind: ScheduleKind,
): EntropyFamilies {
  const n = RINGS[kind].entropy
  const sched = schedule(n, order, kind)
  const starts = entropyFamilyStarts(n).map(({ family, state }, k) => {
    const e = entropyOf(table, sched, state)

    return {
      family,
      start: k,
      startRatio: e.start,
      late: e.late,
      margin: e.late - ENTROPY_THRESHOLD,
      counted: e.start <= ENTROPY_LOW_START,
    }
  })
  const counted = starts.filter(s => s.counted)
  const status =
    counted.length > 0 && counted.every(s => s.margin >= ENTROPY_MARGIN)
      ? 'high'
      : counted.length > 0 && counted.every(s => s.margin <= -ENTROPY_MARGIN)
        ? 'low'
        : 'open'

  return { starts, status }
}

// ---- entropy scaling near the threshold ----
//
// A reading whose label entropy (the least late ratio of the three wall starts on the entropy ring) could mix by
// periods and damage and lies within ENTROPY_MARGIN of 0.9 is read again on four ring sizes, from every wall start
// closed under P and C (12 starts) at every phase of the schedule (the start rotated by 0 .. colors - 1 cells), so a
// threshold reading is not decided by one ring and one start. The rule, fixed before its first run: mixing when every
// counted start on every ring reads at least 0.9 + ENTROPY_MARGIN, non-mixing when every one reads at most
// 0.9 - ENTROPY_MARGIN, else open. The threshold 0.9 and the label's own reading do not change.
const SCALING_RINGS: Record<ScheduleKind, number[]> = {
  brick2: [256, 512, 768, 1024],
  brick3: [258, 516, 774, 1032],
}

export type EntropyScalingRing = {
  n: number
  counted: number
  min: number
  max: number
  below: number
}

export type EntropyScaling = {
  rings: EntropyScalingRing[]
  counted: number
  min: number
  max: number
  // counted starts reading below 0.9
  below: number
  // the least late ratio minus 0.9
  margin: number
  status: 'mixing' | 'non-mixing' | 'open'
}

function entropyScaling(table: PairTable, order: ColorOrder, kind: ScheduleKind): EntropyScaling {
  const phases = kind === 'brick2' ? 2 : 3
  const rings = SCALING_RINGS[kind].map(n => {
    const sched = schedule(n, order, kind)
    const lates: number[] = []

    for (const base of wallStarts(n)) {
      const mirror = Int8Array.from({ length: n }, (_, i) => base[n - 1 - i]!)

      for (const s of [base, base.map(x => -x), mirror, mirror.map(x => -x)]) {
        for (let k = 0; k < phases; k++) {
          const e = entropyOf(table, sched, Int8Array.from({ length: n }, (_, i) => s[(i + k) % n]!))

          if (e.start <= ENTROPY_LOW_START) {
            lates.push(e.late)
          }
        }
      }
    }

    return {
      n,
      counted: lates.length,
      min: Math.min(...lates),
      max: Math.max(...lates),
      below: lates.filter(x => x < ENTROPY_THRESHOLD).length,
    }
  })
  const min = Math.min(...rings.map(r => r.min))
  const max = Math.max(...rings.map(r => r.max))

  return {
    rings,
    counted: rings.reduce((s, r) => s + r.counted, 0),
    min,
    max,
    below: rings.reduce((s, r) => s + r.below, 0),
    margin: min - ENTROPY_THRESHOLD,
    status:
      min >= ENTROPY_THRESHOLD + ENTROPY_MARGIN
        ? 'mixing'
        : max <= ENTROPY_THRESHOLD - ENTROPY_MARGIN
          ? 'non-mixing'
          : 'open',
  }
}

// ---- the whole run ----

type ReadingKey = `${ScheduleKind}:${ColorOrder}`

const READINGS: readonly ReadingKey[] = KINDS.flatMap(k =>
  ORDERS.map((o): ReadingKey => `${k}:${o}`),
)

type ClassRow = {
  representative: string
  members: string[]
  vacuumFixing: boolean
  swapSymmetric: boolean
  negationSymmetric: boolean
  forward: RingMeasure
  reverse: RingMeasure
  // every schedule family and order, the representative
  readings: Record<ReadingKey, RingMeasure>
  families: Record<ReadingKey, EntropyFamilies>
  memberLabels: string[]
  // brick3: C-members' labels against the representative under the same order (gated), P-members' labels against
  // the representative under the reversed order (reported)
  brick3CMismatches: number
  brick3PMismatches: number
  // the representative's label differs between any two of the four readings
  scheduleSensitive: boolean
  // the old reading: brick2 forward against brick2 reverse only
  brick2OrderSensitive: boolean
  // whether the class could mix by periods and damage (every reading), and what the entropy families then say
  mixingStatus: Record<ReadingKey, 'non-mixing' | 'mixing' | 'open'>
  // the readings whose label entropy sits within ENTROPY_MARGIN of 0.9 while periods and damage could mix, re-read
  // on four rings from every wall start and phase
  entropyScaling: Partial<Record<ReadingKey, EntropyScaling>>
}

export function pairRulesLine(): {
  census: { permutationsChecked: number; conservative: number }
  censusMatchesFibers: boolean
  allBijections: boolean
  classCount: number
  classCountWithInverse: number
  inverseMergesNone: boolean
  equivalenceHolds: boolean
  propertyRules: number
  propertyClasses: number
  chiralCreation: boolean
  schedulesValid: boolean
  translation: { brick2Translates: boolean; brick3Translates: boolean }
  gates: { rule: string; gates: RuleGates; symmetric: boolean[] }[]
  classes: ClassRow[]
} {
  const census = pairRuleCensus()
  const fibers = pairRulesFromFibers()
  const censusMatchesFibers =
    census.rules.length === fibers.length &&
    census.rules.every((r, k) => sameTable(r.table, fibers[k]!.table))
  const allBijections = census.rules.every(r => isBijection(r.table))
  const classes = pairRuleClasses({ rules: census.rules })
  const withInverse = pairRuleClasses({
    rules: census.rules,
    withInverse: true,
  })
  const partition = (cs: typeof classes): string =>
    cs
      .map(c => c.members.map(m => tableKey(m.table)).join('|'))
      .join('/')
  const inverseMergesNone = partition(classes) === partition(withInverse)

  const props = (r: PairRule): boolean[] => [
    fixesVacuum(r.table),
    conservesExcitation(r.table),
    commutesWithSwap(r.table),
  ]
  const equivalenceHolds = census.rules.every(r => {
    const p = props(r)

    return p[0] === p[1] && p[1] === p[2]
  })
  const propertyRules = census.rules.filter(r => fixesVacuum(r.table)).length
  const propertyClasses = classes.filter(c =>
    fixesVacuum(c.representative.table),
  ).length
  const chiralCreation = census.rules
    .filter(r => !fixesVacuum(r.table))
    .every(r => !commutesWithSwap(r.table))

  let schedulesValid = true

  for (const kind of KINDS) {
    const rings = RINGS[kind]
    const sizes = [
      ...rings.cycles,
      rings.seed,
      rings.entropy,
      3 ** DAMAGE_ORDER + rings.damagePad,
    ]

    for (const n of sizes) {
      for (const order of ORDERS) {
        const check = checkSchedule({
          schedule: schedule(n, order, kind),
          neighbors: ring(n),
        })

        schedulesValid &&=
          check.everyColorIsMatching &&
          check.coversEveryEdgeOnce &&
          check.edgeCount === n
      }
    }
  }

  // the reflection gate needs the even rings' matchings to be reflection-invariant
  for (const n of SYMMETRY_SIZES) {
    for (const m of schedule(n, 'forward').matchings) {
      const set = new Set<string>()

      for (let k = 0; k < m.length; k += 2) {
        set.add([m[k]!, m[k + 1]!].sort((x, y) => x - y).join(','))
      }

      for (let k = 0; k < m.length; k += 2) {
        const image = [n - 1 - m[k]!, n - 1 - m[k + 1]!]
          .sort((x, y) => x - y)
          .join(',')

        schedulesValid &&= set.has(image)
      }
    }
  }

  // translation control: brick2's two orders are one schedule on every even ring it reads, brick3's are
  // not on any ring it reads
  const evenRings = [
    ...RINGS.brick2.cycles.filter(n => n % 2 === 0),
    RINGS.brick2.seed,
    RINGS.brick2.entropy,
    3 ** DAMAGE_ORDER + RINGS.brick2.damagePad,
  ]
  const brick3Rings = [
    ...RINGS.brick3.cycles.filter(n => n >= 6),
    RINGS.brick3.seed,
    RINGS.brick3.entropy,
    3 ** DAMAGE_ORDER + RINGS.brick3.damagePad,
  ]
  const translation = {
    brick2Translates: evenRings.every(n =>
      isTranslate(schedule(n, 'forward'), schedule(n, 'reverse')),
    ),
    brick3Translates: brick3Rings.some(n =>
      isTranslate(
        schedule(n, 'forward', 'brick3'),
        schedule(n, 'reverse', 'brick3'),
      ),
    ),
  }

  // every rule measured under every family and order, once
  const measures = new Map<string, RingMeasure>()

  for (const r of census.rules) {
    for (const key of READINGS) {
      const [kind, order] = key.split(':') as [ScheduleKind, ColorOrder]

      measures.set(`${tableKey(r.table)}:${key}`, measureRing(r.table, order, kind))
    }
  }

  const measure = (t: PairTable, key: ReadingKey): RingMeasure =>
    measures.get(`${tableKey(t)}:${key}`)!

  const gates = census.rules.map(r => ({
    rule: r.name,
    gates: ruleGates(
      r.table,
      READINGS.every(key => measure(r.table, key).cycles.every(c => c.isPermutation)),
    ),
    symmetric: [
      commutesWithSwap(r.table),
      commutesWithNegation(r.table),
      commutesWithSwapNegation(r.table),
      fixesVacuum(r.table),
    ],
  }))

  const rows: ClassRow[] = classes.map(c => {
    const rep = c.representative.table
    const readings = Object.fromEntries(
      READINGS.map(key => [key, measure(rep, key)]),
    ) as Record<ReadingKey, RingMeasure>
    const families = Object.fromEntries(
      READINGS.map(key => {
        const [kind, order] = key.split(':') as [ScheduleKind, ColorOrder]

        return [key, entropyFamilies(rep, order, kind)]
      }),
    ) as Record<ReadingKey, EntropyFamilies>
    const forward = readings['brick2:forward']
    const reverse = readings['brick2:reverse']
    const negated = conjugateTable(rep, negatePair)
    const isC = (m: PairTable): boolean => sameTable(m, rep) || sameTable(m, negated)

    let brick3CMismatches = 0
    let brick3PMismatches = 0

    for (const m of c.members) {
      for (const order of ORDERS) {
        const own = measure(m.table, `brick3:${order}`).verdict.label

        if (isC(m.table)) {
          brick3CMismatches += own === readings[`brick3:${order}`].verdict.label ? 0 : 1
        } else {
          const other = order === 'forward' ? 'reverse' : 'forward'

          brick3PMismatches += own === readings[`brick3:${other}`].verdict.label ? 0 : 1
        }
      }
    }

    const labels = new Set(READINGS.map(key => readings[key].verdict.label))
    const mixingStatus = Object.fromEntries(
      READINGS.map(key => {
        const v = readings[key].verdict

        return [
          key,
          !v.exponentialPeriods || !v.fillsCone
            ? 'non-mixing'
            : families[key].status === 'high'
              ? 'mixing'
              : families[key].status === 'low'
                ? 'non-mixing'
                : 'open',
        ]
      }),
    ) as ClassRow['mixingStatus']
    const entropyScalingRows: ClassRow['entropyScaling'] = {}

    for (const key of READINGS) {
      const v = readings[key].verdict
      const ratio = readings[key].entropyRatio

      if (v.exponentialPeriods && v.fillsCone && Math.abs(ratio - ENTROPY_THRESHOLD) < ENTROPY_MARGIN) {
        const [kind, order] = key.split(':') as [ScheduleKind, ColorOrder]

        entropyScalingRows[key] = entropyScaling(rep, order, kind)
      }
    }

    return {
      representative: c.representative.name,
      members: c.members.map(m => m.name),
      vacuumFixing: fixesVacuum(rep),
      swapSymmetric: commutesWithSwap(rep),
      negationSymmetric: commutesWithNegation(rep),
      forward,
      reverse,
      readings,
      families,
      memberLabels: c.members.flatMap(m => [
        measure(m.table, 'brick2:forward').verdict.label,
        measure(m.table, 'brick2:reverse').verdict.label,
      ]),
      brick3CMismatches,
      brick3PMismatches,
      scheduleSensitive: labels.size > 1,
      brick2OrderSensitive: forward.verdict.label !== reverse.verdict.label,
      mixingStatus,
      entropyScaling: entropyScalingRows,
    }
  })

  return {
    census: {
      permutationsChecked: census.permutationsChecked,
      conservative: census.rules.length,
    },
    censusMatchesFibers,
    allBijections,
    classCount: classes.length,
    classCountWithInverse: withInverse.length,
    inverseMergesNone,
    equivalenceHolds,
    propertyRules,
    propertyClasses,
    chiralCreation,
    schedulesValid,
    translation,
    gates,
    classes: rows,
  }
}

function serialize(value: unknown): string {
  return JSON.stringify(value, (_, v: unknown) =>
    v instanceof Map ? [...(v as Map<unknown, unknown>).entries()] : v,
  )
}

const SHORT: Record<string, string> = {
  frozen: 'F',
  ballistic: 'B',
  interacting: 'I',
  mixing: 'M',
  unresolved: 'U',
}

export default experiment({
  id: 'computation/pair-rules-line',
  code: 'E-CMP-0025',
  title:
    'the 24 conservative reversible ternary pair rules fall into 12 classes, and on the line each class is frozen, ballistic, interacting or mixing',
  category: 'computation',
  substrates: ['line'],
  depth: 'L2',
  paper: false,
  run() {
    const first = pairRulesLine()
    const second = pairRulesLine()
    const identicalBytes = serialize(first) === serialize(second)
    const findings = LAB_FILES.flatMap(f =>
      scanSource(f, readFileSync(resolve(BASE, f), 'utf8')),
    )
    const r = first

    // per-rule gates: symmetric rules commute, every rule without a symmetry breaks it (negative controls)
    const gateFailures: string[] = []

    for (const g of r.gates) {
      const [swap, neg, swapNeg, vacuumFixing] = g.symmetric
      const x = g.gates
      const checks: [string, boolean][] = [
        ['inverse', x.inverseRestores],
        ['charge', x.chargeConstant],
        ['excitation', vacuumFixing ? x.excitationConstant : x.excitationMoves],
        ['bijective', x.bijectiveUpTo12],
        ['swap', swap ? x.swapCommutes : x.swapBreaks],
        ['negation', neg ? x.negationCommutes : x.negationBreaks],
        ['swap-negation', swapNeg ? x.swapNegationCommutes : x.swapNegationBreaks],
      ]

      for (const [name, ok] of checks) {
        if (!ok) {
          gateFailures.push(`${g.rule}:${name}`)
        }
      }
    }

    const measureFailures: string[] = []

    for (const c of r.classes) {
      for (const key of READINGS) {
        const m = c.readings[key]

        if (m.ceilingViolations > 0) {
          measureFailures.push(`${c.representative}/${key}:ceiling`)
        }

        if (!m.damageRestores) {
          measureFailures.push(`${c.representative}/${key}:damage-inverse`)
        }

        if (m.seeds.some(s => s.kind === 'vanished')) {
          measureFailures.push(`${c.representative}/${key}:vanished`)
        }

        if (m.conserved.some(s => !s.knownConserved || s.extra < 0)) {
          measureFailures.push(`${c.representative}/${key}:conserved-known`)
        }
      }

      if (c.memberLabels.some(l => l !== c.forward.verdict.label)) {
        measureFailures.push(`${c.representative}:member-labels`)
      }

      if (c.brick3CMismatches > 0) {
        measureFailures.push(`${c.representative}:brick3-C-members`)
      }
    }

    const structural =
      r.census.permutationsChecked === 362880 &&
      r.census.conservative === 24 &&
      r.censusMatchesFibers &&
      r.allBijections &&
      r.classCount === 12 &&
      r.classCountWithInverse === 12 &&
      r.inverseMergesNone &&
      r.equivalenceHolds &&
      r.propertyRules === 8 &&
      r.propertyClasses === 6 &&
      r.chiralCreation &&
      r.schedulesValid &&
      // the planted translation control: brick2's orders are translates, brick3's are not
      r.translation.brick2Translates &&
      !r.translation.brick3Translates
    const unresolved = r.classes.filter(c =>
      READINGS.some(key => c.readings[key].verdict.label === 'unresolved'),
    )
    const gatesPass =
      structural &&
      gateFailures.length === 0 &&
      measureFailures.length === 0 &&
      identicalBytes &&
      findings.length === 0
    const status = !gatesPass
      ? 'fail'
      : unresolved.length > 0
        ? 'partial'
        : 'pass'
    const count = (label: string): number =>
      r.classes.filter(c => c.forward.verdict.label === label).length
    const labelsOf = (c: ClassRow): string =>
      READINGS.map(key => SHORT[c.readings[key].verdict.label]).join('')
    const table = r.classes
      .map(c => {
        const f = c.forward
        const b3 = c.readings['brick3:forward']

        return (
          `${c.representative} [${c.members.length}] ${f.verdict.label} (b2f b2r b3f b3r ${labelsOf(c)})` +
          `${c.scheduleSensitive ? ' schedule-sensitive' : ''}` +
          ` (p fit ${f.periodExponent.toFixed(2)} (two-point ${f.periodExponentTwoPoint.toFixed(2)}, residuals power ${f.powerResidual.toFixed(3)} exp ${f.exponentialResidual.toFixed(3)}), b3 p fit ${b3.periodExponent.toFixed(2)}, maxPeriod12=${f.cycles.at(-1)!.maxPeriod}, ` +
          `seeds ${f.seeds.filter(s => s.kind === 'ballistic').length} moving ${f.seeds.filter(s => s.kind === 'static').length} static ${f.seeds.filter(s => s.kind === 'spreading').length} spreading, ` +
          `collisions ${f.collisionsScattered}/${f.collisionsTested} scatter, ` +
          `damage speed ${f.damageSpeed.toFixed(2)} fill ${f.damageFill.toFixed(2)}, ` +
          `entropy ${f.entropyRatios.map(x => x.toFixed(2)).join('/')}, extra conserved ${f.conserved.map(s => s.extra).join('/')}, ` +
          `mixing ${READINGS.map(key => c.mixingStatus[key]).join('/')}, b3 P-member differs ${c.brick3PMismatches}` +
          READINGS.filter(key => c.entropyScaling[key])
            .map(key => {
              const e = c.entropyScaling[key]!

              return (
                `, scaling ${key} ${e.status} (min ${e.min.toFixed(4)}, max ${e.max.toFixed(4)}, margin ${e.margin.toFixed(4)}, ` +
                `${e.below}/${e.counted} below 0.9, per ring ${e.rings.map(g => `n ${g.n}: ${g.min.toFixed(4)}..${g.max.toFixed(4)} (${g.below}/${g.counted})`).join(', ')})`
              )
            })
            .join('') +
          ')'
        )
      })
      .join('; ')

    return verdict({
      status,
      claim:
        'brute force over 9! permutations finds 24 conservative reversible pair rules in 12 swap-negation classes, with vacuum fixing, D conservation and swap symmetry coinciding on 8, and on the ring every class is labeled from exact cycle structure, seeds, collisions, damage and entropy under two schedule families (2-color and period-3 bricks) in both color orders',
      metrics: {
        permutationsChecked: r.census.permutationsChecked,
        conservativeRules: r.census.conservative,
        classes: r.classCount,
        classesWithTimeReversal: r.classCountWithInverse,
        vacuumFixingRules: r.propertyRules,
        vacuumFixingClasses: r.propertyClasses,
        gateFailures: gateFailures.length,
        measureFailures: measureFailures.length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
        frozen: count('frozen'),
        ballistic: count('ballistic'),
        interacting: count('interacting'),
        mixing: count('mixing'),
        unresolved: unresolved.length,
        scheduleSensitive: r.classes.filter(c => c.scheduleSensitive).length,
        brick2OrderSensitive: r.classes.filter(c => c.brick2OrderSensitive).length,
        brick3Frozen: r.classes.filter(c => c.readings['brick3:forward'].verdict.label === 'frozen').length,
        brick3Ballistic: r.classes.filter(c => c.readings['brick3:forward'].verdict.label === 'ballistic').length,
        brick3Interacting: r.classes.filter(c => c.readings['brick3:forward'].verdict.label === 'interacting').length,
        brick3Mixing: r.classes.filter(c => c.readings['brick3:forward'].verdict.label === 'mixing').length,
        brick3PMemberMismatches: r.classes.reduce((s, c) => s + c.brick3PMismatches, 0),
        mixingOpenReadings: r.classes.reduce(
          (s, c) => s + READINGS.filter(key => c.mixingStatus[key] === 'open').length,
          0,
        ),
        // threshold readings re-read on four rings from every wall start and phase, and how many of them read mixing
        entropyScalingReadings: r.classes.reduce((s, c) => s + Object.keys(c.entropyScaling).length, 0),
        entropyScalingMixing: r.classes.reduce(
          (s, c) => s + Object.values(c.entropyScaling).filter(e => e.status === 'mixing').length,
          0,
        ),
        classesWithExtraConserved: r.classes.filter(
          c => c.forward.conserved.some(s => s.extra > 0),
        ).length,
      },
      control: {
        // the 16 creating rules must move D and break swap commutation: the D and swap gates can fail
        creatingRulesMovingD: r.gates.filter(
          g => !g.symmetric[3] && g.gates.excitationMoves,
        ).length,
        swapBreakingRules: r.gates.filter(
          g => !g.symmetric[0] && g.gates.swapBreaks,
        ).length,
        negationBreakingRules: r.gates.filter(
          g => !g.symmetric[1] && g.gates.negationBreaks,
        ).length,
        // planted: the brick2 orders are translates (1), the brick3 orders are not (0)
        brick2OrdersTranslate: r.translation.brick2Translates ? 1 : 0,
        brick3OrdersTranslate: r.translation.brick3Translates ? 1 : 0,
      },
      notes:
        `Algebra spin-one; schedules: brick2 (greedy edge coloring of the ring, 2 colors even, 3 odd) and brick3 (period-3 brick coloring, edge i of color i mod 3, rings a multiple of 3), each forward and reversed, pairs oriented left to right; boundary the closed ring, which is also an exact window on the line for the rounds run. ` +
        `On even rings the brick2 reversed order is the forward one translated by one cell (gated), so brick2 alone cannot show schedule sensitivity; the brick3 reversed order is no translate of its forward order (gated), so the four readings can disagree. ` +
        `Period exponent: least-squares slope of ln(mean period) on ln(n) over rings 6, 8, 10, 12 (brick3 6, 9, 12), the old two-point value beside it. ` +
        `Entropy per start (families wall, de Bruijn eighth, block walls, each closed under P and C; counted when the start is at most ${ENTROPY_LOW_START} of its ceiling; clear only ${ENTROPY_MARGIN} from ${ENTROPY_THRESHOLD}): mixing status per reading is non-mixing when periods or damage fail, else mixing, non-mixing or open by the entropy families. ` +
        `Classes: ${table}. ` +
        `Gate failures: ${[...gateFailures, ...measureFailures].join(', ') || 'none'}. Random findings: ${findings.map(f => `${f.file}:${f.line}`).join(', ') || 'none'}.`,
    })
  },
})
