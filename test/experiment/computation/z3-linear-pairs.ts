// M2-A, the different-algebra control: the 48 Z3-linear reversible pair rules,
// (x, y) -> (a x + b y, c x + d y) mod 3 for [a b; c d] in GL(2,3), against the 24 spin-one rules of M1. Algebra: Z3
// cyclic, the tones -1, 0, +1 read as residues 2, 0, 1. Rule module: code/rule/z3-linear-pair.
//
// Gates (any failure fails the experiment):
//   - census: brute force over all 9! permutations of the nine pairs finds exactly 48 additive ones, and they are the
//     tables of the 48 matrices with det != 0 among all 81; the 48 are closed under product and inverse, the inverse
//     matrix's table is the inverse table; under {1, P, C, PC} they form 26 classes (C = -I is central, so every rule
//     commutes with negation and only P acts; 4 rules commute with P); 6 fix all three uniform pairs (row sums 1), 6
//     conserve the sum mod 3 (column sums 1), 8 are monomial and conserve D; only the identity and the swap are also
//     spin-one rules (conserve Q)
//   - exhaustive rings of 4, 6 and 8 cells, both color orders, every rule: the round is a permutation of all 3^n
//     configurations; the inverse matrix's round restores every configuration; the sum mod 3 is conserved on every
//     configuration by the 6 column-sum-1 rules (and broken by some other rule: the test can fail); step(-x) = -step(x)
//     on every configuration (live C commutation); step(x + y) = step(x) + step(y) mod 3 on every pair (ring 4) and on
//     every (x, shifted x) pair (rings 6, 8) (live linearity); reversing the orientation changes nothing for the 4
//     P-symmetric rules (and something for some other rule), and the P-conjugate rule equals the rule under the
//     reversed orientation (live P commutation); the uniform +1 configuration is fixed by the 6 row-sum-1 rules. A pair
//     property implies its round property; the converse fails for some rules on the ring, where every cell is first in
//     one matching and second in the other, and those round-level coincidences are counted and reported, not gated
//   - negative controls: a spin-one rule that is not Z3-linear fails additivity and live linearity; the singular
//     matrix [1 1; 1 1] is no bijection and its round is no permutation; the transpose of a non-orthogonal matrix,
//     used as its inverse, fails to restore
//   - harness (code/compute/lab/harness, unchanged): the rules the harness can read, every lab instance (open lazy
//     windows, closed quotients, schedule variants), both color orders, the per-rule instance gates as in E-CMP-0027
//     (with Q and D expected exactly where the matrix conserves them), plus per instance: the inverse matrix restores,
//     the sum mod 3 is constant exactly for column-sum-1 rules, live linearity
//   - every gated (confined, surface_limited) reading re-derived from scratch, as E-CMP-0027 does
//   - two runs give identical bytes on the closed slice, and no file of the lab draws a random number
//
// Bounded slice (a full run of every instance did not finish in 22 hours and was stopped): the open windows of the ten
// 2D tilings (base schedules, plus the variants of the three degree-matched 2D pairs), and closed only the ring and the
// hyperbolic regular maps below 48 cells, under both colorings. The degree-24 windows, the flat tori, the {3,7} surface
// and every larger quotient are left to a larger run.
//
// The harness reads only 6 of the 48 rules. Its seeds sit on all three uniform backgrounds, and it runs a seed on a
// background the rule does not fix only against a live vacuum on a closed instance; a Z3-linear rule always fixes the
// vacuum, and it fixes the +1 and -1 backgrounds only when its row sums are 1. For the other 42 the dense path throws
// (recorded as a refusal probe here) and the lazy path would treat the moving background as fixed and read a wrong run
// silently (recorded as a probe: the uniform +1 state moves under one dense round while a lazy run on background +1
// reports nothing). So the 42 are not read here; that needs a harness change. Also measured for
// all 26 classes, with no harness reading: the ring's exact period growth exponent (linePeriodExponent).
//
// A readable rule that is not a cell permutation spreads a lone excitation through the whole light cone. On a lazy
// window the harness checks its support budget only at the end of a round, so on a degree-24 window one round can grow
// the tiling past what a Map holds and the run throws. Such a reading is recorded as a harness failure with its message
// and carries no label (never a guessed one); its matched curvature comparison is skipped.
//
// Two readings of the harness are spin-one by construction and are reported, not changed: a collision counts as
// scattered when the joint run differs from the INTEGER sum of the two single runs (a Z3-linear rule superposes mod 3
// exactly, gated live above, so every scattering of a Z3-linear rule is a wrap 1 + 1 = -1 the spin-one reading counts
// as interaction), and the entropy ceiling is the spin-one Q sector's, which a rule that does not conserve Q can pass.
//
// Curvature: as E-CMP-0027, only on open windows under one schedule family (matchedOpenLabels); closed differences are
// reported, never credited.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  COLOR_ORDERS,
  CONFINED_MAX_ROUNDS,
  ColorOrder,
  HarnessReading,
  HarnessRule,
  LabInstance,
  PERIOD_EXPONENT_CEILING,
  SEEDS,
  closedInstances,
  closedVariantInstances,
  collidablePairCount,
  denseInverseRound,
  denseRound,
  fixesBackground,
  graphSystole,
  harnessReading,
  harnessRule,
  instanceGates,
  largerQuotient,
  lazyContext,
  lazyRun,
  lazySeedCells,
  linePeriodExponent,
  matchedOpenLabels,
  openInstances,
  openVariantInstances,
  seedReadings,
} from '@/code/compute/lab/harness'
import { deBruijnTones } from '@/code/measure/lab-measures'
import {
  commutesWithNegation,
  commutesWithSwap,
  conjugateTable,
  conservesCharge,
  conservesExcitation,
  inverseTable,
  isBijection,
  pairRuleCensus,
  pairRuleClasses,
  sameTable,
  swapPair,
  tableKey,
} from '@/code/rule/pair-rule'
import {
  PartitionSchedule,
  buildPartitionSchedule,
  ringSchedule,
} from '@/code/rule/partition-schedule'
import {
  cycleStructure,
  decodeState,
  encodeState,
  globalPermutation,
  inverseRoundInPlace,
} from '@/code/rule/partitioned-pair'
import {
  Z3LinearRule,
  Z3Matrix,
  Z3_IDENTITY,
  Z3_SWAP,
  isZ3Additive,
  z3CommutesWithSwap,
  z3ConservesSum,
  z3FixesUniform,
  z3Inverse,
  z3IsMonomial,
  z3LinearCensus,
  z3MatrixName,
  z3MatrixOfTable,
  z3MatrixTable,
  z3Multiply,
} from '@/code/rule/z3-linear-pair'
import { torusGrid } from '@/code/substrate/torus-grid'
import { fromZ3, toZ3, z3Sum } from '@/code/tone/algebra'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/tone/algebra.ts',
  'code/rule/pair-rule.ts',
  'code/rule/z3-linear-pair.ts',
  'code/rule/partition-schedule.ts',
  'code/rule/partitioned-pair.ts',
  'code/measure/lab-measures.ts',
  'code/compute/lab/harness.ts',
  'code/compute/lab/lazy-space.ts',
  'test/experiment/computation/z3-linear-pairs.ts',
]

const RING_SIZES = [4, 6, 8] as const
// the bounded slice: open windows not read, and open columns whose schedule variants are read
const SLICE_EXCLUDED_COLUMNS: ReadonlySet<string> = new Set(['{3,4,3,4}', '{3,4,3,3}'])
const SLICE_VARIANT_COLUMNS: ReadonlySet<string> = new Set(['{4,4}', '{4,5}', '{6,3}', '{6,4}', '{3,6}', '{3,7}'])
// the closed slice: the ring (line control) and the hyperbolic regular maps below this many cells ({7,3} 24, {5,4} 24,
// {4,5} 30, {8,3} 42), each under both colorings; the {3,7} surface (56) and the flat tori of 30 and 56 cells took about
// 9 minutes per reading under the harness's extended census and go to a larger run with the larger instances
const CLOSED_SLICE_MAX_CELLS = 48

let progressSink: ((line: string) => void) | null = null
let lastFull: Z3Run | null = null

// a tmp runner sets a progress sink and reads the full pass back for the note's tables
export function setZ3Progress(sink: ((line: string) => void) | null): void {
  progressSink = sink
}

export function lastFullZ3Run(): Z3Run | null {
  return lastFull
}

const INSTANCE_ROUNDS = 6

// the negative controls
const SINGULAR: Z3Matrix = [1, 1, 1, 1]
const SHEAR: Z3Matrix = [1, 1, 0, 1]
const NONLINEAR_SPIN_ONE = 'id.CBA.id'
// the rule the refusal probes use (row sums 2 and 1: the +1 background moves)
const PROBE: Z3Matrix = SHEAR

export type Z3ClassResult = {
  representative: string
  members: string[]
  matrix: Z3Matrix
  swapSymmetric: boolean
  conservesSum: boolean
  fixesUniform: boolean
  monomial: boolean
  spinOne: boolean
  // the ring's exact period growth exponent (rings 6 to 12, brick2, forward order), harness-free
  periodExponent: number
  harnessReadable: boolean
}

// a reading the unchanged harness could not finish (it threw), so it carries no label
const HARNESS_FAILURE = 'harness_failure'

export type CellLabel = { label: string; mixingOpen: boolean }

export type Z3Cell = {
  representative: string
  instance: string
  column: string
  boundary: string
  family: string
  variant: string
  labels: Record<ColorOrder, CellLabel>
  // the P-member (the rule under reversed orientation), when the class has one
  member: { name: string; labels: Record<ColorOrder, string> } | null
}

export type Z3CurvatureRow = {
  flat: string
  hyperbolic: string
  boundary: 'openBall' | 'closed'
  representative: string
  flatSchedule: string
  hyperbolicSchedule: string
  sameFamily: boolean
  matched: Record<ColorOrder, { flat: string; hyperbolic: string }> | null
  flatLabel: string
  hyperbolicLabel: string
  differs: boolean
  credited: boolean
}

export type Z3CurvatureVerdict = {
  flat: string
  hyperbolic: string
  representative: string
  sameFamilyComparisons: number
  verdict: 'null' | 'differs' | 'schedule_dependent' | 'unmatched'
}

export type Z3Run = {
  census: {
    permutationsChecked: number
    additive: number
    matricesChecked: number
    invertible: number
    sameSet: boolean
    groupClosed: boolean
    inverseTables: boolean
    classCount: number
    swapSymmetric: number
    negationCommuting: number
    fixesUniform: number
    conservesSum: number
    both: string[]
    monomial: number
    spinOneOverlap: string[]
  }
  ringFailures: string[]
  ringChecks: number
  ringCoincidences: string[]
  ringSumBreaks: number
  ringOrientationMatters: number
  negativeControls: { name: string; failedAsExpected: boolean }[]
  classes: Z3ClassResult[]
  readableRules: string[]
  instances: number
  cells: Z3Cell[]
  gateFailures: string[]
  readingFailures: string[]
  harnessFailures: string[]
  gateProofFailures: string[]
  gatedReadings: number
  curvature: Z3CurvatureRow[]
  curvatureVerdicts: Z3CurvatureVerdict[]
  readingLabels: Record<string, number>
  unresolvedReadings: { reading: string; refused: string | null }[]
  // collisions the harness counts as scattered, and how many of those differ from the integer sum only by a mod-3 wrap
  scatter: { scattered: number }
  refusal: { denseThrew: boolean; denseMessage: string; lazyFrozeMovingBackground: boolean }
  serialized: string
}

// ---- exhaustive ring gates ----

function ring(n: number): Uint32Array[] {
  return torusGrid(1, n)
}

function ringReversed(n: number, order: ColorOrder): PartitionSchedule {
  return buildPartitionSchedule({
    neighbors: ring(n),
    orient: (u, v) => (v === u + 1 ? [v, u] : [u, v]),
    orientation: 'right-to-left (i + 1 mod n, i)',
    colorOrder: order,
  })
}

function negateCode(x: number, n: number): number {
  return encodeState(decodeState(x, n).map(t => -t))
}

function addCodes(x: number, y: number, n: number): number {
  const a = decodeState(x, n)
  const b = decodeState(y, n)

  return encodeState(a.map((t, i) => fromZ3(toZ3(t) + toZ3(b[i]!))))
}

function shiftCode(x: number, n: number): number {
  const a = decodeState(x, n)

  return encodeState(a.map((_, i) => a[(i + 1) % n]!))
}

type RingResult = {
  failures: string[]
  checks: number
  // round-level properties no pair map has (see ringGates)
  coincidences: string[]
  // rules whose round breaks the sum mod 3, or changes with the orientation, on some ring and order
  sumBreaks: number
  orientationMatters: number
}

export function ringGates(rules: readonly Z3LinearRule[]): RingResult {
  const failures: string[] = []
  const coincidences: string[] = []
  const sumBreaks = new Set<string>()
  const orientationMatters = new Set<string>()

  let checks = 0

  const expect = (ok: boolean, what: string): void => {
    checks++

    if (!ok) {
      failures.push(what)
    }
  }

  for (const n of RING_SIZES) {
    const total = 3 ** n
    const plusOne = encodeState(new Int8Array(n).fill(1))

    for (const order of COLOR_ORDERS) {
      const schedule = ringSchedule({ neighbors: ring(n), colorOrder: order })
      const reversed = ringReversed(n, order)

      for (const rule of rules) {
        const where = `${rule.name}@ring${n}/${order}`
        const image = globalPermutation({ table: rule.table, schedule })
        const cs = cycleStructure(image)

        expect(cs.isPermutation, `${where}:permutation`)

        // the inverse matrix restores every configuration
        const inverse = z3MatrixTable(z3Inverse(rule.matrix))
        const state = new Int8Array(n)

        let restores = true
        let sumKept = true

        for (let x = 0; x < total; x++) {
          state.set(decodeState(image[x]!, n))
          inverseRoundInPlace({ inverse, schedule, state })
          restores &&= encodeState(state) === x
          sumKept &&= z3Sum(decodeState(image[x]!, n)) === z3Sum(decodeState(x, n))
        }

        expect(restores, `${where}:inverse-matrix`)
        expect(!z3ConservesSum(rule.matrix) || sumKept, `${where}:sum-mod-3`)

        // live C commutation
        let negation = true

        for (let x = 0; x < total; x++) {
          negation &&= image[negateCode(x, n)] === negateCode(image[x]!, n)
        }

        expect(negation, `${where}:negation`)

        // live linearity
        let linear = true

        if (n === 4) {
          for (let x = 0; x < total && linear; x++) {
            for (let y = 0; y < total; y++) {
              if (image[addCodes(x, y, n)] !== addCodes(image[x]!, image[y]!, n)) {
                linear = false
                break
              }
            }
          }
        } else {
          for (let x = 0; x < total; x++) {
            const y = shiftCode(x, n)

            linear &&= image[addCodes(x, y, n)] === addCodes(image[x]!, image[y]!, n)
          }
        }

        expect(linear, `${where}:linearity`)

        // live P commutation: orientation reversal, and the P-conjugate equals the reversed orientation
        const reversedImage = globalPermutation({ table: rule.table, schedule: reversed })
        const conjugateImage = globalPermutation({
          table: conjugateTable(rule.table, swapPair),
          schedule,
        })

        let same = true
        let conjugateIsReversal = true

        for (let x = 0; x < total; x++) {
          same &&= reversedImage[x] === image[x]
          conjugateIsReversal &&= conjugateImage[x] === reversedImage[x]
        }

        // a pair property implies its round property; the converse can fail on the ring, where every cell is first
        // in one matching and second in the other, so the round can keep what no single pair map keeps (a coincidence,
        // counted, not a failure)
        expect(!z3CommutesWithSwap(rule.matrix) || same, `${where}:orientation`)
        expect(conjugateIsReversal, `${where}:swap-is-reversal`)
        expect(!z3FixesUniform(rule.matrix) || image[plusOne] === plusOne, `${where}:uniform`)

        if (sumKept && !z3ConservesSum(rule.matrix)) {
          coincidences.push(`${where}:sum-mod-3`)
        } else if (!sumKept) {
          sumBreaks.add(rule.name)
        }

        if (same && !z3CommutesWithSwap(rule.matrix)) {
          coincidences.push(`${where}:orientation`)
        } else if (!same) {
          orientationMatters.add(rule.name)
        }

        if (image[plusOne] === plusOne && !z3FixesUniform(rule.matrix)) {
          coincidences.push(`${where}:uniform`)
        }
      }
    }
  }

  return { failures, checks, coincidences, sumBreaks: sumBreaks.size, orientationMatters: orientationMatters.size }
}

function negativeControls(): { name: string; failedAsExpected: boolean }[] {
  const n = 4
  const schedule = ringSchedule({ neighbors: ring(n), colorOrder: 'forward' })
  const total = 3 ** n
  const out: { name: string; failedAsExpected: boolean }[] = []
  const spin = pairRuleCensus().rules.find(r => r.name === NONLINEAR_SPIN_ONE)

  if (!spin) {
    return [{ name: 'spin-one rule missing', failedAsExpected: false }]
  }

  const spinImage = globalPermutation({ table: spin.table, schedule })

  let linear = true

  for (let x = 0; x < total && linear; x++) {
    for (let y = 0; y < total; y++) {
      if (spinImage[addCodes(x, y, n)] !== addCodes(spinImage[x]!, spinImage[y]!, n)) {
        linear = false
        break
      }
    }
  }

  out.push({
    name: `${NONLINEAR_SPIN_ONE} is not additive and fails live linearity`,
    failedAsExpected: !isZ3Additive(spin.table) && !linear,
  })

  const singular = z3MatrixTable(SINGULAR)

  out.push({
    name: `[${SINGULAR.join(' ')}] is no bijection and its round is no permutation`,
    failedAsExpected:
      !isBijection(singular) && !cycleStructure(globalPermutation({ table: singular, schedule })).isPermutation,
  })

  const shear = z3MatrixTable(SHEAR)
  const transpose = z3MatrixTable([SHEAR[0], SHEAR[2], SHEAR[1], SHEAR[3]])
  const image = globalPermutation({ table: shear, schedule })
  const state = new Int8Array(n)

  let restores = true

  for (let x = 0; x < total; x++) {
    state.set(decodeState(image[x]!, n))
    inverseRoundInPlace({ inverse: transpose, schedule, state })
    restores &&= encodeState(state) === x
  }

  out.push({ name: `the transpose of [${SHEAR.join(' ')}] does not invert it`, failedAsExpected: !restores })

  return out
}

// ---- per-instance Z3 gates ----

function z3Starts(inst: LabInstance): Int8Array[] {
  let k = 1

  while (3 ** k < inst.size) {
    k++
  }

  const tones = deBruijnTones(k)
  const a = Int8Array.from({ length: inst.size }, (_, v) => tones[v % tones.length]!)
  const b = Int8Array.from({ length: inst.size }, (_, v) => a[(v + 1) % inst.size]!)

  return [a, b, Int8Array.from(a, x => (x === 0 ? 1 : x))]
}

function z3InstanceGates(rule: Z3LinearRule, hr: HarnessRule, inst: LabInstance): string[] {
  const out: string[] = []
  const inverse = harnessRule({ name: `${rule.name}^-1`, table: z3MatrixTable(z3Inverse(rule.matrix)) })
  const starts = z3Starts(inst)

  for (const order of COLOR_ORDERS) {
    const s = inst.schedules[order]

    let restores = true
    let sumKept = true
    let linear = true

    for (const start of starts) {
      const state = Int8Array.from(start)

      for (let t = 0; t < INSTANCE_ROUNDS; t++) {
        denseRound(hr, s, state)
        sumKept &&= z3Sum(state) === z3Sum(start)
      }

      for (let t = 0; t < INSTANCE_ROUNDS; t++) {
        denseInverseRound(inverse, s, state)
      }

      restores &&= state.every((x, v) => x === start[v])
    }

    const [x0, y0] = starts as [Int8Array, Int8Array]
    const x = Int8Array.from(x0)
    const y = Int8Array.from(y0)
    const sum = Int8Array.from(x0, (t, v) => fromZ3(toZ3(t) + toZ3(y0[v]!)))

    for (let t = 0; t < INSTANCE_ROUNDS; t++) {
      denseRound(hr, s, x)
      denseRound(hr, s, y)
      denseRound(hr, s, sum)
      linear &&= sum.every((z, v) => z === fromZ3(toZ3(x[v]!) + toZ3(y[v]!)))
    }

    const where = `${rule.name}@${inst.name}/${order}`

    if (!restores) {
      out.push(`${where}:inverse-matrix`)
    }

    // the pair property implies the round property, not the converse (the ring's round keeps the sum for some rules
    // whose pair maps do not)
    if (z3ConservesSum(rule.matrix) && !sumKept) {
      out.push(`${where}:sum-mod-3`)
    }

    if (!linear) {
      out.push(`${where}:linearity`)
    }
  }

  return out
}

// ---- gated labels, re-derived from scratch (as E-CMP-0027) ----

function replayPeriod(inst: LabInstance, order: ColorOrder, rule: HarnessRule, seedKey: string): { period: number; moved: boolean } | null {
  const ctx = lazyContext(inst, order)
  const seed = SEEDS.find(s => s.key === seedKey)

  if (!seed) {
    return null
  }

  const run = lazyRun(ctx, seed.background)

  lazySeedCells(ctx.space, seed, 0).forEach((c, k) => run.set(c, seed.values[k]!))

  const start = [...run.state.entries()].sort((a, b) => a[0] - b[0])
  const startCells = start.map(([c]) => c).join(',')

  let moved = false

  for (let t = 1; t <= CONFINED_MAX_ROUNDS; t++) {
    if (!run.round(rule)) {
      return null
    }

    const now = [...run.state.entries()].sort((a, b) => a[0] - b[0])

    moved ||= now.map(([c]) => c).join(',') !== startCells

    if (now.length === start.length && now.every(([c, v], k) => c === start[k]![0] && v === start[k]![1])) {
      return { period: t, moved }
    }
  }

  return null
}

function gateProofFailure(
  r: HarnessReading,
  inst: LabInstance,
  rule: HarnessRule,
  catalog: readonly LabInstance[],
): string | null {
  const { label, gate, verdict: v, numbers: n } = r.result
  const where = `${r.rule}@${r.instance}/${r.order}`

  if (label !== 'confined' && label !== 'surface_limited') {
    return gate === null ? null : `${where}:gate-on-${label}`
  }

  if (v.label !== 'unresolved' || gate?.kind !== label || n.collisionsUnread > 0 || n.damageUnread > 0) {
    return `${where}:${label}-without-proof`
  }

  if (gate.kind === 'confined') {
    if (r.boundary !== 'openBall' || !inst.lazy || n.collisionsScattered > 0) {
      return `${where}:confined-proof`
    }

    let someMoved = false

    for (const o of gate.orbits) {
      const replay = replayPeriod(inst, r.order, rule, o.seed)

      if (replay?.period !== o.period) {
        return `${where}:confined-replay:${o.seed}`
      }

      someMoved ||= replay.moved
    }

    return someMoved && gate.orbits.length === SEEDS.length ? null : `${where}:confined-orbits`
  }

  if (r.boundary !== 'closed') {
    return `${where}:surface-open`
  }

  if (gate.reason === 'no_collidable_pair') {
    if (collidablePairCount({ rule, seeds: seedReadings({ rule, instance: inst, order: r.order }) }) !== 0) {
      return `${where}:pair-proof`
    }

    const bigger = largerQuotient(inst, catalog)

    return bigger?.name === gate.larger.instance && gate.larger.pairs > 0 ? null : `${where}:pair-larger`
  }

  const sys = graphSystole({ column: inst.column, neighbors: inst.neighbors })

  return !sys.lowerBound && sys.loopSystole !== null && sys.loopSystole === gate.loopSystole && n.collisionsScattered === 0
    ? null
    : `${where}:systole-recomputed`
}

// ---- the run ----

function summary(r: HarnessReading): unknown {
  return {
    rule: r.rule,
    instance: r.instance,
    order: r.order,
    label: r.result.label,
    numbers: r.result.numbers,
    window: r.windowAgreement,
  }
}

export function z3LinearPairs(input: { rerunSubset: boolean }): Z3Run {
  const census = z3LinearCensus()
  const rules = census.invertible
  const byKey = new Map(rules.map(r => [tableKey(r.table), r]))
  const sameSet =
    census.additive.length === rules.length &&
    census.additive.every((r, k) => sameTable(r.table, rules[k]!.table) && r.name === rules[k]!.name)
  const groupClosed = rules.every(m =>
    rules.every(n => byKey.has(tableKey(z3MatrixTable(z3Multiply(m.matrix, n.matrix))))),
  )
  const inverseTables = rules.every(
    r =>
      sameTable(z3MatrixTable(z3Inverse(r.matrix)), inverseTable(r.table)) &&
      tableKey(z3MatrixTable(z3Multiply(z3Inverse(r.matrix), r.matrix))) === tableKey(z3MatrixTable(Z3_IDENTITY)) &&
      tableKey(z3MatrixTable(z3MatrixOfTable(r.table))) === tableKey(r.table),
  )
  const classes = pairRuleClasses({ rules })
  const spinTables = new Set(pairRuleCensus().rules.map(r => tableKey(r.table)))
  const spinOneOverlap = rules.filter(r => spinTables.has(tableKey(r.table))).map(r => r.name)
  const ruleOf = (name: string): Z3LinearRule => rules.find(r => r.name === name)!
  const harness = new Map(rules.map(r => [r.name, harnessRule({ name: r.name, table: r.table })]))
  const readable = rules.filter(r => [-1, 0, 1].every(bg => fixesBackground(harness.get(r.name)!, bg)))
  const readableNames = new Set(readable.map(r => r.name))

  const censusResult: Z3Run['census'] = {
    permutationsChecked: census.permutationsChecked,
    additive: census.additive.length,
    matricesChecked: census.matricesChecked,
    invertible: rules.length,
    sameSet,
    groupClosed,
    inverseTables,
    classCount: classes.length,
    swapSymmetric: rules.filter(r => z3CommutesWithSwap(r.matrix) && commutesWithSwap(r.table)).length,
    negationCommuting: rules.filter(r => commutesWithNegation(r.table)).length,
    fixesUniform: rules.filter(r => z3FixesUniform(r.matrix)).length,
    conservesSum: rules.filter(r => z3ConservesSum(r.matrix)).length,
    both: rules.filter(r => z3FixesUniform(r.matrix) && z3ConservesSum(r.matrix)).map(r => r.name),
    monomial: rules.filter(r => z3IsMonomial(r.matrix) && conservesExcitation(r.table)).length,
    spinOneOverlap,
  }

  const ringResult: RingResult = input.rerunSubset
    ? { failures: [], checks: 0, coincidences: [], sumBreaks: 0, orientationMatters: 0 }
    : ringGates(rules)
  const controls = input.rerunSubset ? [] : negativeControls()

  const classResults: Z3ClassResult[] = classes.map(c => {
    const rep = ruleOf(c.representative.name)

    return {
      representative: rep.name,
      members: c.members.map(m => m.name),
      matrix: rep.matrix,
      swapSymmetric: z3CommutesWithSwap(rep.matrix),
      conservesSum: z3ConservesSum(rep.matrix),
      fixesUniform: z3FixesUniform(rep.matrix),
      monomial: z3IsMonomial(rep.matrix),
      spinOne: spinTables.has(tableKey(rep.table)),
      periodExponent: input.rerunSubset ? 0 : linePeriodExponent(harness.get(rep.name)!, 'forward'),
      harnessReadable: readableNames.has(rep.name),
    }
  })

  // the harness readings
  const open = openInstances()
  const openVariants = openVariantInstances(open)
  const closedAll = closedInstances()
  const closedAllVariants = closedVariantInstances(closedAll)
  // the bounded slice (bounded on the coordinator's instruction after a 22-hour full run was stopped):
  // closed instances of at most 256 cells, open windows of the 2D tilings only (base schedules, plus the variants of the
  // three degree-matched 2D pairs); the degree-24 windows and the 2048- and 16384-cell quotients are left to a larger run
  const small = (i: LabInstance): boolean =>
    i.column === 'line' || (i.curvature === 'hyperbolic' && i.size < CLOSED_SLICE_MAX_CELLS)
  const catalog = [...closedAll, ...closedAllVariants]
  const openSlice = open.filter(i => !SLICE_EXCLUDED_COLUMNS.has(i.column))
  const variantSlice = openVariants.filter(i => SLICE_VARIANT_COLUMNS.has(i.column))
  // the identical-bytes rerun covers the closed slice
  const instances = [
    ...(input.rerunSubset ? [] : [...openSlice, ...variantSlice]),
    ...closedAll.filter(small),
    ...closedAllVariants.filter(small),
  ]
  // the identity and the swap are the spin-one tables id.ABC.id and swap.CBA.swap (gated above), so every harness
  // reading of them is E-CMP-0027's; they are read here only on the ring, as the line control
  const spinOneRule = (name: string): boolean => spinTables.has(tableKey(ruleOf(name).table))
  const readsOn = (name: string, inst: LabInstance): boolean =>
    !spinOneRule(name) || (inst.column === 'line' && inst.boundary === 'closed')
  const gateFailures: string[] = []
  const readingFailures: string[] = []
  const harnessFailures: string[] = []
  const readings = new Map<string, HarnessReading>()
  const key = (rule: string, inst: string, order: ColorOrder): string => `${rule}#${inst}#${order}`

  for (const inst of instances) {
    for (const rule of readable.filter(r => readsOn(r.name, inst))) {
      const hr = harness.get(rule.name)!

      if (!input.rerunSubset) {
        const g = instanceGates({
          rule: hr,
          swapConjugate: harnessRule({ name: `${rule.name}^P`, table: conjugateTable(rule.table, swapPair) }),
          instance: inst,
        })
        const checks: [string, boolean][] = [
          ['schedules', g.schedulesValid],
          ['degree', g.degreeExact],
          ['mirror', g.mirrorValid],
          ['inverse', g.inverseRestores],
          ['charge', conservesCharge(rule.table) ? g.chargeConstant : !g.chargeConstant],
          ['excitation', conservesExcitation(rule.table) ? g.excitationConstant : g.excitationMoves],
          ['negation', g.negationCommutes],
          ['orientation', hr.swapSymmetric ? g.orientationIgnored : g.orientationMatters],
          ['swap-is-reversal', g.swapIsOrientationReversal],
          ['sparse', g.sparseEqualsDense],
        ]

        for (const [name, ok] of checks) {
          if (!ok) {
            gateFailures.push(`${rule.name}@${inst.name}:${name}`)
          }
        }

        gateFailures.push(...z3InstanceGates(rule, hr, inst))
      }

      for (const order of COLOR_ORDERS) {
        let r: HarnessReading

        try {
          r = harnessReading({ rule: hr, instance: inst, order, catalog })
        } catch (e) {
          // a run the unchanged harness cannot finish (a lazy space overflowing inside one round): recorded, no label
          harnessFailures.push(`${rule.name}@${inst.name}/${order}: ${e instanceof Error ? e.message : String(e)}`)
          continue
        }

        readings.set(key(rule.name, inst.key, order), r)
        progressSink?.(`${input.rerunSubset ? 'rerun' : 'full'} ${rule.name} ${inst.name} ${order} ${r.result.label}`)

        const n = r.result.numbers

        if (n.ceilingViolations > 0) {
          readingFailures.push(`${rule.name}@${inst.name}/${order}:ceiling`)
        }

        if (n.seedKinds.vanished > 0) {
          readingFailures.push(`${rule.name}@${inst.name}/${order}:vanished`)
        }

        if (!r.windowAgreement) {
          readingFailures.push(`${rule.name}@${inst.name}/${order}:window`)
        }
      }
    }
  }

  // cells, one per readable class and instance, with the P-member beside it
  const cells: Z3Cell[] = []

  for (const c of classResults.filter(x => x.harnessReadable)) {
    const member = c.members.find(m => m !== c.representative) ?? null

    for (const inst of instances.filter(i => readsOn(c.representative, i))) {
      const get = (name: string, order: ColorOrder): CellLabel => {
        const r = readings.get(key(name, inst.key, order))

        return r ? { label: r.result.label, mixingOpen: r.result.mixingOpen } : { label: HARNESS_FAILURE, mixingOpen: false }
      }

      cells.push({
        representative: c.representative,
        instance: inst.key,
        column: inst.column,
        boundary: inst.boundary,
        family: inst.scheduleFamily,
        variant: inst.scheduleVariant,
        labels: { forward: get(c.representative, 'forward'), reverse: get(c.representative, 'reverse') },
        member: member
          ? {
              name: member,
              labels: {
                forward: get(member, 'forward').label,
                reverse: get(member, 'reverse').label,
              },
            }
          : null,
      })
    }
  }

  // curvature, open windows: each flat schedule against the control's schedule of the same variant name
  const curvature: Z3CurvatureRow[] = []
  const openAll = input.rerunSubset ? [] : [...openSlice, ...variantSlice]
  const compared = classResults.filter(x => x.harnessReadable && !x.spinOne)

  for (const flat of openAll.filter(i => i.curvature === 'flat' && i.lazy && open.some(o => o.column === i.column && o.matchedControl))) {
    const control = open.find(o => o.column === flat.column)!.matchedControl
    const hyp = openAll.find(i => i.column === control && i.scheduleVariant === flat.scheduleVariant)

    if (!hyp) {
      continue
    }

    for (const c of compared) {
      const rule = harness.get(c.representative)!
      const matched = {} as Record<ColorOrder, { flat: string; hyperbolic: string }>

      for (const order of COLOR_ORDERS) {
        const fr = readings.get(key(rule.name, flat.key, order))
        const hr = readings.get(key(rule.name, hyp.key, order))

        matched[order] = { flat: HARNESS_FAILURE, hyperbolic: HARNESS_FAILURE }

        if (!fr || !hr) {
          continue
        }

        try {
          const m = matchedOpenLabels({
            rule,
            order,
            flat: { instance: flat, reading: fr },
            hyperbolic: { instance: hyp, reading: hr },
          })

          matched[order] = { flat: m.flat.label, hyperbolic: m.hyperbolic.label }
        } catch (e) {
          harnessFailures.push(`${rule.name}@${flat.name}|${hyp.name}/${order} matched: ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      const labelOf = (inst: LabInstance): string =>
        readings.get(key(rule.name, inst.key, 'forward'))?.result.label ?? HARNESS_FAILURE
      const failed = COLOR_ORDERS.some(o => matched[o].flat === HARNESS_FAILURE || matched[o].hyperbolic === HARNESS_FAILURE)

      const differs = COLOR_ORDERS.some(o => matched[o].flat !== matched[o].hyperbolic)
      const sameFamily = flat.scheduleFamily === hyp.scheduleFamily

      curvature.push({
        flat: flat.column,
        hyperbolic: hyp.column,
        boundary: 'openBall',
        representative: c.representative,
        flatSchedule: `${flat.scheduleFamily}/${flat.scheduleVariant}`,
        hyperbolicSchedule: `${hyp.scheduleFamily}/${hyp.scheduleVariant}`,
        sameFamily: sameFamily && !failed,
        matched,
        flatLabel: labelOf(flat),
        hyperbolicLabel: labelOf(hyp),
        differs,
        credited:
          sameFamily &&
          !failed &&
          COLOR_ORDERS.every(
            o =>
              matched[o].flat !== matched[o].hyperbolic &&
              matched[o].flat !== 'unresolved' &&
              matched[o].hyperbolic !== 'unresolved',
          ),
      })
    }
  }

  const curvatureVerdicts: Z3CurvatureVerdict[] = []
  const pairClass = new Map<string, Z3CurvatureRow[]>()

  for (const row of curvature) {
    const k = `${row.flat}|${row.hyperbolic}|${row.representative}`

    pairClass.set(k, [...(pairClass.get(k) ?? []), row])
  }

  for (const [k, rows] of pairClass) {
    const [flat, hyperbolic, representative] = k.split('|')
    const same = rows.filter(r => r.sameFamily)

    curvatureVerdicts.push({
      flat: flat!,
      hyperbolic: hyperbolic!,
      representative: representative!,
      sameFamilyComparisons: same.length,
      verdict:
        same.length === 0
          ? 'unmatched'
          : same.every(r => !r.differs)
            ? 'null'
            : same.every(r => r.credited)
              ? 'differs'
              : 'schedule_dependent',
    })
  }

  // closed partners, never credited
  const closed = closedAll.filter(small)

  for (const hyp of closed.filter(i => i.curvature === 'hyperbolic' && i.partner)) {
    const flat = closed.find(i => i.name === hyp.partner)

    if (!flat) {
      continue
    }

    for (const c of compared) {
      const flatLabel = readings.get(key(c.representative, flat.key, 'forward'))?.result.label ?? HARNESS_FAILURE
      const hyperbolicLabel = readings.get(key(c.representative, hyp.key, 'forward'))?.result.label ?? HARNESS_FAILURE

      curvature.push({
        flat: flat.column,
        hyperbolic: hyp.column,
        boundary: 'closed',
        representative: c.representative,
        flatSchedule: 'greedy/base',
        hyperbolicSchedule: 'greedy/base',
        sameFamily: true,
        matched: null,
        flatLabel,
        hyperbolicLabel,
        differs: flatLabel !== hyperbolicLabel,
        credited: false,
      })
    }
  }

  // gated readings re-derived
  const instanceByKey = new Map([...instances, ...catalog].map(i => [i.key, i]))
  const gateProofFailures: string[] = []
  const gated = [...readings.values()].filter(r => r.result.gate !== null)

  if (!input.rerunSubset) {
    for (const r of readings.values()) {
      const f = gateProofFailure(r, instanceByKey.get(r.instance)!, harness.get(r.rule)!, catalog)

      if (f) {
        gateProofFailures.push(f)
      }
    }
  }

  const readingLabels: Record<string, number> = {}
  const unresolvedReadings: { reading: string; refused: string | null }[] = []

  let scattered = 0

  for (const [k, r] of readings) {
    readingLabels[r.result.label] = (readingLabels[r.result.label] ?? 0) + 1
    scattered += r.result.numbers.collisionsScattered

    if (r.result.label === 'unresolved') {
      unresolvedReadings.push({ reading: k, refused: r.result.refused })
    }
  }

  // refusal probes for a rule whose +1 background moves (never read on a lazy window)
  const probe = harnessRule({ name: z3MatrixName(PROBE), table: z3MatrixTable(PROBE) })
  const ringInstance = closedAll.find(i => i.column === 'line')!

  let denseThrew = false
  let denseMessage = ''

  try {
    harnessReading({ rule: probe, instance: ringInstance, order: 'forward', catalog })
  } catch (e) {
    denseThrew = true
    denseMessage = e instanceof Error ? e.message : String(e)
  }

  const lazyProbeInstance = open.find(i => i.lazy)!
  const lazy = lazyRun(lazyContext(lazyProbeInstance, 'forward'), 1)

  lazy.round(probe)

  const uniform = new Int8Array(ringInstance.size).fill(1)

  denseRound(probe, ringInstance.schedules.forward, uniform)

  const lazyFrozeMovingBackground = lazy.state.size === 0 && uniform.some(t => t !== 1)

  const result: Z3Run = {
    census: censusResult,
    ringFailures: ringResult.failures,
    ringChecks: ringResult.checks,
    ringCoincidences: ringResult.coincidences,
    ringSumBreaks: ringResult.sumBreaks,
    ringOrientationMatters: ringResult.orientationMatters,
    negativeControls: controls,
    classes: classResults,
    readableRules: readable.map(r => r.name),
    instances: instances.length,
    cells,
    gateFailures,
    readingFailures,
    harnessFailures,
    gateProofFailures,
    gatedReadings: gated.length,
    curvature,
    curvatureVerdicts,
    readingLabels,
    unresolvedReadings,
    scatter: { scattered },
    refusal: { denseThrew, denseMessage, lazyFrozeMovingBackground },
    serialized: JSON.stringify([...readings.values()].map(summary)),
  }

  if (!input.rerunSubset) {
    lastFull = result
  }

  return result
}

// ---- the classification tables (Z3 section) ----

const SHORT: Record<string, string> = {
  frozen: 'F',
  ballistic: 'B',
  interacting: 'I',
  mixing: 'M',
  confined: 'C',
  surface_limited: 'S',
  unresolved: 'U',
  [HARNESS_FAILURE]: 'X',
}

const COLUMNS = ['line', '{4,4}', '{6,3}', '{3,6}', '{5,4}', '{7,3}', '{8,3}', '{3,4,3,4}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,3}']

export function z3Tables(run: Z3Run): string {
  const lines: string[] = []

  lines.push('| class | members | P-sym | sum mod 3 | uniform fixed | monomial | spin-one | ring period exponent | read by harness |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |')

  for (const c of run.classes) {
    const yes = (b: boolean): string => (b ? 'yes' : '-')

    lines.push(
      `| ${c.representative} | ${c.members.join(', ')} | ${yes(c.swapSymmetric)} | ${yes(c.conservesSum)} | ${yes(c.fixesUniform)} | ${yes(c.monomial)} | ${yes(c.spinOne)} | ${c.periodExponent.toFixed(2)}${c.periodExponent > PERIOD_EXPONENT_CEILING ? ' (above ceiling)' : ''} | ${yes(c.harnessReadable)} |`,
    )
  }

  lines.push('')
  lines.push(`| class | ${COLUMNS.join(' | ')} |`)
  lines.push(`| --- | ${COLUMNS.map(() => '---').join(' | ')} |`)

  const reps = [...new Set(run.cells.map(c => c.representative))]

  for (const rep of reps) {
    const row = COLUMNS.map(col => {
      const pick = (boundary: string): string => {
        const xs = run.cells.filter(c => c.representative === rep && c.column === col && c.boundary === boundary && c.variant === 'base')

        if (xs.length === 0) {
          return '-'
        }

        return xs
          .map(c => {
            const f = c.labels.forward
            const flags = `${f.mixingOpen ? ' m' : ''}${f.label !== c.labels.reverse.label ? ' s' : ''}${c.member && (c.member.labels.forward !== f.label || c.member.labels.reverse !== c.labels.reverse.label) ? ' o' : ''}`

            return `${SHORT[f.label] ?? f.label}${flags}`
          })
          .join(', ')
      }

      return `${pick('openBall')} / ${pick('closed')}`
    })

    lines.push(`| ${rep} | ${row.join(' | ')} |`)
  }

  lines.push('')
  lines.push('| class | geometry | boundary | labels (schedule order: label) |')
  lines.push('| --- | --- | --- | --- |')

  for (const rep of reps) {
    for (const col of COLUMNS) {
      for (const boundary of ['openBall', 'closed']) {
        const xs = run.cells.filter(c => c.representative === rep && c.column === col && c.boundary === boundary)
        const labels = xs.flatMap(c =>
          COLOR_ORDERS.map(o => `${c.family}/${c.variant} ${o[0]}: ${SHORT[c.labels[o].label] ?? c.labels[o].label}`),
        )

        if (new Set(xs.flatMap(c => COLOR_ORDERS.map(o => c.labels[o].label))).size > 1) {
          lines.push(`| ${rep} | ${col} | ${boundary === 'openBall' ? 'open' : 'closed'} | ${labels.join(', ')} |`)
        }
      }
    }
  }

  lines.push('')
  lines.push('| flat | hyperbolic | class | same-family comparisons | verdict |')
  lines.push('| --- | --- | --- | --- | --- |')

  for (const v of run.curvatureVerdicts) {
    lines.push(`| ${v.flat} | ${v.hyperbolic} | ${v.representative} | ${v.sameFamilyComparisons} | ${v.verdict} |`)
  }

  lines.push('')
  lines.push('| flat | hyperbolic | boundary | class | flat schedule | hyperbolic schedule | matched f | matched r |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')

  for (const r of run.curvature) {
    const m = (o: ColorOrder): string =>
      r.matched ? `${SHORT[r.matched[o].flat]}/${SHORT[r.matched[o].hyperbolic]}` : `${SHORT[r.flatLabel]}/${SHORT[r.hyperbolicLabel]}`

    lines.push(`| ${r.flat} | ${r.hyperbolic} | ${r.boundary === 'openBall' ? 'open' : 'closed'} | ${r.representative} | ${r.flatSchedule} | ${r.hyperbolicSchedule} | ${m('forward')} | ${m('reverse')} |`)
  }

  return lines.join('\n')
}

export default experiment({
  id: 'computation/z3-linear-pairs',
  code: 'E-CMP-0052',
  title:
    'the 48 Z3-linear reversible pair rules (GL(2,3)) through the M1 harness on every lab geometry, the different-algebra control for the 24 spin-one rules',
  category: 'computation',
  substrates: ['line', '{4,4}', '{6,3}', '{3,6}', '{5,4}', '{7,3}', '{8,3}', '{3,4,3,4}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = z3LinearPairs({ rerunSubset: false })
    const again = z3LinearPairs({ rerunSubset: true })
    const subsetKeys = new Set(
      (JSON.parse(again.serialized) as { instance: string }[]).map(x => x.instance),
    )
    const identicalBytes =
      JSON.stringify((JSON.parse(r.serialized) as { instance: string }[]).filter(x => subsetKeys.has(x.instance))) ===
      again.serialized
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const c = r.census
    const structural =
      c.permutationsChecked === 362880 &&
      c.additive === 48 &&
      c.matricesChecked === 81 &&
      c.invertible === 48 &&
      c.sameSet &&
      c.groupClosed &&
      c.inverseTables &&
      c.classCount === 26 &&
      c.swapSymmetric === 4 &&
      c.negationCommuting === 48 &&
      c.fixesUniform === 6 &&
      c.conservesSum === 6 &&
      c.both.length === 2 &&
      c.monomial === 8 &&
      c.spinOneOverlap.length === 2 &&
      c.spinOneOverlap.includes(z3MatrixName(Z3_IDENTITY)) &&
      c.spinOneOverlap.includes(z3MatrixName(Z3_SWAP))
    const controlsHold = r.negativeControls.length === 3 && r.negativeControls.every(x => x.failedAsExpected)
    const lineIdentity = r.cells.find(x => x.representative === z3MatrixName(Z3_IDENTITY) && x.column === 'line' && x.boundary === 'closed')
    const lineSwap = r.cells.find(x => x.representative === z3MatrixName(Z3_SWAP) && x.column === 'line' && x.boundary === 'closed')
    const lineControl = lineIdentity?.labels.forward.label === 'frozen' && lineSwap?.labels.forward.label === 'ballistic'
    const gatesPass =
      structural &&
      controlsHold &&
      r.ringFailures.length === 0 &&
      r.ringSumBreaks > 0 &&
      r.ringOrientationMatters > 0 &&
      r.gateFailures.length === 0 &&
      r.readingFailures.length === 0 &&
      r.gateProofFailures.length === 0 &&
      r.readableRules.length === 6 &&
      lineControl &&
      r.refusal.denseThrew &&
      r.refusal.lazyFrozeMovingBackground &&
      identicalBytes &&
      findings.length === 0
    const readings = Object.values(r.readingLabels).reduce((a, b) => a + b, 0)
    // 42 of the 48 rules cannot be read by the unchanged harness, so the run is partial at best
    const status = !gatesPass ? 'fail' : 'partial'
    const verdictCount = (v: Z3CurvatureVerdict['verdict']): number => r.curvatureVerdicts.filter(x => x.verdict === v).length
    const base = r.cells.filter(x => x.variant === 'base')
    const count = (boundary: string, l: string): number =>
      base.filter(x => x.boundary === boundary && x.labels.forward.label === l).length

    return verdict({
      status,
      claim:
        'the 48 Z3-linear reversible pair rules are GL(2,3) by brute force (26 classes, C trivial, sum mod 3 conserved by 6, all three uniform backgrounds fixed by 6, Q only by the identity and the swap), every algebraic property is gated live on rings and lab instances, and the 6 rules the unchanged M1 harness can read get labels on a bounded slice (2D open windows, the ring and the hyperbolic regular maps below 48 cells); the other 42 move the +-1 backgrounds, which the harness cannot read (dense refuses, lazy would silently freeze them)',
      metrics: {
        permutationsChecked: c.permutationsChecked,
        rules: c.invertible,
        classes: c.classCount,
        swapSymmetric: c.swapSymmetric,
        conservesSum: c.conservesSum,
        fixesUniform: c.fixesUniform,
        monomial: c.monomial,
        ringChecks: r.ringChecks,
        ringFailures: r.ringFailures.length,
        ringCoincidences: r.ringCoincidences.length,
        ringSumBreakingRules: r.ringSumBreaks,
        ringOrientationSensitiveRules: r.ringOrientationMatters,
        readableRules: r.readableRules.length,
        unreadableRules: c.invertible - r.readableRules.length,
        instances: r.instances,
        readings,
        readingsUnresolved: r.unresolvedReadings.length,
        openFrozen: count('openBall', 'frozen'),
        openBallistic: count('openBall', 'ballistic'),
        openInteracting: count('openBall', 'interacting'),
        openConfined: count('openBall', 'confined'),
        openUnresolved: count('openBall', 'unresolved'),
        closedFrozen: count('closed', 'frozen'),
        closedBallistic: count('closed', 'ballistic'),
        closedInteracting: count('closed', 'interacting'),
        closedSurfaceLimited: count('closed', 'surface_limited'),
        closedUnresolved: count('closed', 'unresolved'),
        collisionsScattered: r.scatter.scattered,
        gatedReadings: r.gatedReadings,
        gateProofFailures: r.gateProofFailures.length,
        curvatureNull: verdictCount('null'),
        curvatureDiffers: verdictCount('differs'),
        curvatureScheduleDependent: verdictCount('schedule_dependent'),
        curvatureUnmatched: verdictCount('unmatched'),
        curvatureCredited: r.curvature.filter(x => x.credited).length,
        closedPartnerDiffers: r.curvature.filter(x => x.boundary === 'closed' && x.differs).length,
        gateFailures: r.gateFailures.length,
        readingFailures: r.readingFailures.length,
        harnessFailures: r.harnessFailures.length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        negativeControlsFailingAsExpected: r.negativeControls.filter(x => x.failedAsExpected).length,
        lineControl: lineControl ? 1 : 0,
        denseRefusal: r.refusal.denseThrew ? 1 : 0,
        lazySilentFreeze: r.refusal.lazyFrozeMovingBackground ? 1 : 0,
      },
      notes:
        `Bounded slice: open windows of the ten 2D tilings (base schedules, plus the schedule variants of {4,4}, {4,5}, {6,3}, {6,4}, {3,6}, {3,7}), closed: the ring and the hyperbolic regular maps below ${CLOSED_SLICE_MAX_CELLS} cells ({7,3} 24, {5,4} 24, {4,5} 30, {8,3} 42) under both colorings; not read: the {3,4,3,4} and {3,4,3,3} windows, every flat torus, the {3,7} surface, the {6,4} surface and larger quotients, the open variants of {5,4}, {7,3}, {8,3}. The identity and the swap are E-CMP-0027's tables and are read only on the ring. The identical-bytes rerun covers the closed slice. ` +
        `Algebra Z3 cyclic. Readable by the harness: ${r.readableRules.join(', ')}. Classes: ${r.classes.map(x => `${x.representative} (exp ${x.periodExponent.toFixed(2)})`).join(', ')}. ` +
        `Schedules and boundaries as E-CMP-0027 (both color orders, every variant). Curvature verdicts over same-family schedules: ${verdictCount('null')} null, ${verdictCount('differs')} differ, ${verdictCount('schedule_dependent')} schedule-dependent, ${verdictCount('unmatched')} unmatched. ` +
        `The harness's collision test is integer superposition and its entropy ceiling the spin-one Q sector's; a Z3-linear rule superposes exactly mod 3 (gated), so its ${r.scatter.scattered} scattered collisions are mod-3 wraps read as interaction. ` +
        `Refusal probe ${z3MatrixName(PROBE)}: dense ${r.refusal.denseThrew ? `threw (${r.refusal.denseMessage})` : 'did not throw'}; lazy froze the moving +1 background ${r.refusal.lazyFrozeMovingBackground}. ` +
        `Round-level coincidences on the rings (a round keeps what no pair map keeps: every ring cell is first in one matching and second in the other): ${r.ringCoincidences.length} (${[...new Set(r.ringCoincidences.map(x => `${x.split('@')[0]}:${x.split(':').pop()}`))].join(', ') || 'none'}); ${r.ringSumBreaks} rules break the sum mod 3 and ${r.ringOrientationMatters} see the orientation somewhere. ` +
        `Harness failures (runs the unchanged harness could not finish, no label): ${r.harnessFailures.length}${r.harnessFailures.length > 0 ? ` (${r.harnessFailures.slice(0, 12).join('; ')})` : ''}. ` +
        `Unresolved readings: ${r.unresolvedReadings.length}${r.unresolvedReadings.length > 0 ? ` (${r.unresolvedReadings.slice(0, 12).map(u => `${u.reading}${u.refused ? ` [${u.refused}]` : ''}`).join('; ')})` : ''}. ` +
        `Failures: ${[...r.ringFailures, ...r.gateFailures, ...r.readingFailures, ...r.gateProofFailures, ...r.negativeControls.filter(x => !x.failedAsExpected).map(x => `control:${x.name}`)].slice(0, 40).join(', ') || 'none'}. ` +
        `Random findings: ${findings.map(f => `${f.file}:${f.line}`).join(', ') || 'none'}.`,
    })
  },
})
