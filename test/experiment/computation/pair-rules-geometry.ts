// M1 across geometries: the 12 classes of conservative reversible ternary pair rules on every lab geometry (the line,
// {4,4}, {6,3}, {3,6}, {5,4}, {7,3}, {8,3}, {3,4,3,4} and the degree-matched controls {4,5}, {6,4}, {3,7},
// {3,4,3,3}), under several schedules and two boundaries. Algebra: spin-one (Q = sum s conserved, D = sum s^2 for the 8
// vacuum-fixing rules). Schedule (every one read in forward and reversed color order): the greedy edge
// coloring of each closed instance graph, plus a second greedy coloring with the cells taken in reversed order; pairs
// oriented left to right on the ring and lower cell index first elsewhere; on the lazy open windows the coloring the
// infinite tiling defines (the generators of the right-angled tile group for {5,4}, {6,4}, {3,4,3,4}, the step
// parities of the A2 and D4 lattices for {6,3}, {3,4,3,3}, colorings lifted from finite quotients of the coset tilings
// for the rest), the shorter tile or the -r end first, plus schedule variants: a
// second lifted coloring of every coset tiling, lifted colorings of {5,4}, {6,4} and {6,3} (so the degree-6 pair is read
// in one family), and a color-order permutation of the two degree-24 spaces, which have no second family here.
// Boundary: an open ball with uniform background outside, for the 8 vacuum-fixing rules only, read only over rounds the
// window stays exact (on the lazy windows, grown where the excitation is: every round exact, E-CMP-0032); and the closed
// quotients of tiling-quotient (regular maps, tori, the {3,4,3,4} levels) plus the ring, for all 24 rules. The harness
// is code/compute/lab/harness.
//
// Gates (any failure fails the experiment):
//   - brute force finds 24 conservative rules in 12 classes; vacuum fixing, D conservation and swap symmetry coincide
//   - on every instance every schedule color is a matching covering each edge once, the reversed orientation keeps
//     the matchings pair by pair, every cell inside the shell has the tiling's degree, the ring's mirror keeps every
//     matching with its orientation reversed
//   - for every rule on every instance: the inverse round restores three dense starts after 6 rounds under both
//     orders, Q never moves, D never moves for the vacuum-fixing rules and moves for every creating one (negative
//     control), step(-x) = -step(x) exactly for the negation-symmetric rules and fails for the others (negative
//     control), the reversed orientation changes nothing for swap-symmetric rules and something for the others
//     (negative control), the P-conjugate rule equals the rule under the reversed orientation, and the sparse update
//     equals the dense one
//   - every open reading's window agrees with a run on the ball one hop smaller wherever that run calls itself exact
//   - no damage front outruns c hops per round, no seed vanishes
//   - the C-members of a class read the same label and the same numbers (to 1e-9) on every instance and order
//   - line control: on the ring the harness gives E-CMP-0025's labels (1 frozen, 1 ballistic, 10 interacting), and
//     the P-members of every class agree with it there, as the ring's mirror makes them equivalent
//   - the gated labels, re-derived independently: every confined reading's orbits are
//     replayed from a fresh lazy space (state(P) = state(0), no earlier return, some seed moving); every
//     no-collidable-pair reading's pair search is redone from fresh seed runs, here and on the larger quotient that must
//     have a pair; every systole reading's loop systole is recomputed from the instance's cells and its
//     movers from fresh seed runs. Planted bad gates (a wrong period, a confined gate on ballistic seeds, a no-pair gate
//     where pairs exist, a systole gate under a too-large systole) must all be rejected.
//   - controls of the gated labels: no ballistic seed of the full swap on {3,7} closes an orbit; on a square torus whose
//     loop systole exceeds 2 c T no mover passes half of it (negative), the same seeds pass under a planted loop systole
//     of 4 (the negative control can flip), and on a small square torus the full swap's movers pass (positive)
//   - two runs give identical bytes on the open balls and on every closed instance of at most 256 cells, and no file
//     of the lab draws a random number
//
// Status: pass only when every reading (every member of every class, both orders,
// every schedule) carries one of the six labels.
//
// Curvature: a class is curvature-sensitive only when its label differs between a flat geometry and the hyperbolic
// one of the SAME degree on open windows read under the same window and the SAME schedule family (matchedOpenLabels),
// under every same-family schedule. A pair with no shared family is unmatched and never called null or positive.
// Closed quotients differ in systole, so a closed difference is reported and never credited.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  COLOR_ORDERS,
  CONFINED_MAX_ROUNDS,
  ColorOrder,
  HarnessLabel,
  HarnessReading,
  HarnessRule,
  InstanceGates,
  LAZY_SUPPORT_CAP,
  LabInstance,
  LabelGate,
  SEEDS,
  SEED_ROUNDS,
  SeedReading,
  closedInstances,
  closedVariantInstances,
  collidablePairCount,
  confinedOrbit,
  extendedCensus,
  graphSystole,
  harnessReading,
  harnessRule,
  instanceGates,
  largerPairCount,
  largerQuotient,
  lazyContext,
  lazyRun,
  lazySeedCells,
  matchedOpenLabels,
  openInstances,
  openVariantInstances,
  seedKindsOf,
  seedReadings,
  squareTorusInstance,
} from '@/code/compute/lab/harness'
import { seedMotion } from '@/code/measure/lab-measures'
import {
  PairTable,
  conjugateTable,
  negatePair,
  pairRuleCensus,
  pairRuleClasses,
  sameTable,
  swapNegatePair,
  swapPair,
} from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/tone/algebra.ts',
  'code/rule/pair-rule.ts',
  'code/rule/partition-schedule.ts',
  'code/rule/partitioned-pair.ts',
  'code/measure/lab-measures.ts',
  'code/substrate/lab-geometry.ts',
  'code/substrate/tiling-quotient.ts',
  'code/compute/lab/harness.ts',
  'code/compute/lab/lazy-space.ts',
  'code/substrate/coxeter/right-angled-tiling.ts',
  'code/substrate/coxeter/lazy-lattice.ts',
  'code/substrate/coxeter/coset-tiling.ts',
  'code/substrate/coxeter/lifted-coloring.ts',
  'code/substrate/coxeter/small-roots.ts',
  'code/substrate/coxeter/cosine-ring.ts',
  'test/experiment/computation/pair-rules-geometry.ts',
]

// E-CMP-0025's labels on the line, the harness's positive control
const LINE_LABELS: Record<string, string> = {
  'id.ABC.id': 'frozen',
  'swap.CBA.swap': 'ballistic',
}

// the closed instances the identical-bytes rerun covers
const RERUN_MAX_CELLS = 256

// the systole controls: a square torus whose loop systole exceeds 2 c T for every
// greedy coloring of up to 5 colors (L = 242 > 2 x 5 x 24), read against a reference patch large enough to see its
// injectivity radius; a small square torus whose loop systole a full-swap mover passes within its rounds; the planted
// loop systole under which the large torus's movers must pass
const SYSTOLE_CONTROL_LARGE = [242, 242] as const
const SYSTOLE_CONTROL_REFERENCE = 40_000
const SYSTOLE_CONTROL_SMALL = [6, 7] as const
const SYSTOLE_CONTROL_PLANTED = 4

type Relation = '1' | 'P' | 'C' | 'PC'

type MemberRow = {
  name: string
  relation: Relation
  labels: Record<ColorOrder, string>
}

export type CellRow = {
  instance: string
  column: string
  boundary: string
  family: string
  variant: string
  representative: Record<ColorOrder, HarnessLabel>
  members: MemberRow[]
  scheduleSensitive: boolean
  orientationSensitive: boolean
}

export type ClassResult = {
  representative: string
  members: string[]
  vacuumFixing: boolean
  swapSymmetric: boolean
  negationSymmetric: boolean
  cells: CellRow[]
}

export type CurvatureRow = {
  flat: string
  hyperbolic: string
  boundary: 'openBall' | 'closed'
  representative: string
  // the schedule of each side (family and variant) and whether the two share a family
  flatSchedule: string
  hyperbolicSchedule: string
  sameFamily: boolean
  flatLabel: string
  hyperbolicLabel: string
  // open: the labels under the shared window; closed: null
  matched: Record<ColorOrder, { flat: string; hyperbolic: string; sharedSeeds: number }> | null
  differs: boolean
  credited: boolean
  loopSystoles: [number | null, number | null]
}

// one verdict per matched pair and class over every same-family schedule
export type CurvatureVerdict = {
  flat: string
  hyperbolic: string
  representative: string
  sameFamilyComparisons: number
  verdict: 'null' | 'differs' | 'schedule_dependent' | 'unmatched'
}

// a class whose label on one geometry and boundary changes with the schedule (variant or color order)
export type ScheduleDependence = {
  representative: string
  column: string
  boundary: string
  labels: { schedule: string; order: ColorOrder; label: string }[]
}

export type InstanceRow = {
  key: string
  column: string
  name: string
  boundary: string
  family: string
  variant: string
  cells: number
  degree: number
  colors: number
  radius: number
  systole: number | null
  loopSystole: number | null
  systoleLowerBound: boolean
  gap: number
  patchRadius: number
  orientation: string
  construction: string
  partner: string | null
}

export type SystoleControl = {
  instance: string
  loopSystole: number | null
  colors: number
  // the arithmetic bound the negative control rests on, L > 2 c T, checked
  boundHolds: boolean
  movers: number
  passing: number
  plantedPassing: number
}

export type GeometryRun = {
  census: { permutationsChecked: number; conservative: number }
  classCount: number
  equivalenceHolds: boolean
  instances: InstanceRow[]
  classes: ClassResult[]
  curvature: CurvatureRow[]
  curvatureVerdicts: CurvatureVerdict[]
  scheduleDependence: ScheduleDependence[]
  gateFailures: string[]
  readingFailures: string[]
  memberFailures: string[]
  lineControl: { representative: string; expected: string; got: string; members: string[] }[]
  // lazy open windows: runs stopped on the support budget, and the farthest any run got past r0 + c t (<= 0 holds)
  lazyBudgetStops: number
  lazyConeExcess: number
  // gated labels: every confined or surface_limited reading re-derived independently, and the planted bad gates
  gateProofFailures: string[]
  gatedReadings: number
  plantedGates: { name: string; rejected: boolean }[]
  // every reading over every member, order and schedule, by label, and the unresolved ones by why a gate was refused
  readingLabels: Record<string, number>
  unresolvedReadings: { reading: string; refused: string | null }[]
  // every reading the extended census ran on: the level it stopped at, its seeds and pairs, the label
  extendedReadings: {
    reading: string
    instance: string
    order: ColorOrder
    rule: string
    level: string
    seeds: number
    seedsPerBackground: [number, number, number]
    pairs: number
    exists: boolean
    scattered: number
    tested: number
    label: string
  }[]
  // the ballistic seeds of the full swap on the lazy {3,7} window, and how many of them closed an orbit (must be 0)
  confinedControl: { ballisticSeeds: number; closedOrbits: number; stopped: number }
  systoleControl: { large: SystoleControl; small: SystoleControl }
  serialized: string
}

// ---- independent re-derivation of the gated labels ----

// The least round P <= budget at which a seed's state on a FRESH lazy space equals its start, cell for cell, and
// whether its state ever differed from the start in which cells it holds; null when it never returns.
function replayOrbit(input: {
  inst: LabInstance
  order: ColorOrder
  rule: HarnessRule
  seedKey: string
  budget: number
}): { period: number; moved: boolean } | null {
  const ctx = lazyContext(input.inst, input.order)
  const seed = SEEDS.find(s => s.key === input.seedKey)

  if (!seed) {
    return null
  }

  const run = lazyRun(ctx, seed.background)

  lazySeedCells(ctx.space, seed, 0).forEach((c, k) => run.set(c, seed.values[k]!))

  const start = [...run.state.entries()].sort((a, b) => a[0] - b[0])
  const startCells = start.map(([c]) => c).join(',')

  let moved = false

  for (let t = 1; t <= input.budget; t++) {
    if (!run.round(input.rule)) {
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

// the scattered collisions of a reading, counted from its raw collision runs
function scatteredOf(r: HarnessReading): number {
  return r.collisions.filter(
    c => c.testable && c.firstFailure >= 1 && c.firstFailure <= Math.min(SEED_ROUNDS, c.exact),
  ).length
}

type Recheck = {
  instances: Map<string, LabInstance>
  rules: Map<string, HarnessRule>
  catalog: readonly LabInstance[]
  systoles: Map<string, { systole: number; lowerBound: boolean; loopSystole: number | null }>
}

function freshSystole(ctx: Recheck, inst: LabInstance): { lowerBound: boolean; loopSystole: number | null } {
  // a schedule variant shares its graph with its base
  const key = `${inst.column}|${inst.name.replace(/~.*$/, '')}`

  let s = ctx.systoles.get(key)

  if (!s) {
    s = graphSystole({ column: inst.column, neighbors: inst.neighbors })
    ctx.systoles.set(key, s)
  }

  return s
}

// A gated label must sit on a reading classifyDynamics left unresolved, and its proof must hold when derived again
// from scratch: nothing here reads a number the gate itself computed.
function gateProofFailure(ctx: Recheck, r: HarnessReading): string | null {
  const { label, gate, verdict, numbers: n } = r.result
  const where = `${r.rule}@${r.instance}/${r.order}`

  if (label !== 'confined' && label !== 'surface_limited') {
    return gate === null ? null : `${where}:gate-on-${label}`
  }

  if (verdict.label !== 'unresolved' || gate?.kind !== label) {
    return `${where}:${label}-without-proof`
  }

  if (n.collisionsUnread > 0 || n.damageUnread > 0) {
    return `${where}:${label}-unread`
  }

  const inst = ctx.instances.get(r.instance)
  const rule = ctx.rules.get(r.rule)

  if (!inst || !rule) {
    return `${where}:unknown-instance-or-rule`
  }

  if (gate.kind === 'confined') {
    if (r.boundary !== 'openBall' || !inst.lazy || scatteredOf(r) > 0 || gate.orbits.length !== SEEDS.length) {
      return `${where}:confined-proof`
    }

    let someMoved = false

    for (const [k, o] of gate.orbits.entries()) {
      const replay = replayOrbit({ inst, order: r.order, rule, seedKey: SEEDS[k]!.key, budget: CONFINED_MAX_ROUNDS })

      if (o.seed !== SEEDS[k]!.key || replay?.period !== o.period) {
        return `${where}:confined-replay:${SEEDS[k]!.key}`
      }

      someMoved ||= replay.moved
    }

    return someMoved ? null : `${where}:confined-nothing-moves`
  }

  if (r.boundary !== 'closed') {
    return `${where}:surface-open`
  }

  const seeds = seedReadings({ rule, instance: inst, order: r.order })

  if (gate.reason === 'no_collidable_pair') {
    // the 60 seeds, and (when the reading ran it) the extended census, both read afresh
    const extended = Boolean(r.extended)

    if (
      collidablePairCount({ rule, seeds }) !== 0 ||
      (extended && extendedCensus({ rule, instance: inst, order: r.order }).exists)
    ) {
      return `${where}:pair-proof`
    }

    const bigger = largerQuotient(inst, ctx.catalog)

    if (bigger?.name !== gate.larger.instance) {
      return `${where}:pair-no-larger`
    }

    const there = largerPairCount({ rule, instance: bigger, order: r.order, extended }).pairs

    return there > 0 && there === gate.larger.pairs ? null : `${where}:pair-larger-proof`
  }

  const sys = freshSystole(ctx, inst)

  if (sys.lowerBound || sys.loopSystole === null || sys.loopSystole !== gate.loopSystole || scatteredOf(r) > 0) {
    return `${where}:systole-recomputed`
  }

  const kinds = seedKindsOf(seeds)
  const movers = seeds.filter(s => {
    const kind = kinds.get(s.key)

    return kind !== 'static' && kind !== 'ballistic'
  })

  const passes = (s: SeedReading): boolean => {
    const read = Math.min(SEED_ROUNDS, s.exact)

    return (
      kinds.get(s.key) !== 'unread' &&
      Math.max(...s.track.count.slice(0, read + 1)) <= 4 &&
      2 * Math.max(...s.track.radius.slice(0, read + 1)) > sys.loopSystole!
    )
  }

  return movers.length > 0 && movers.length === gate.movers.length && movers.every(passes)
    ? null
    : `${where}:systole-movers`
}

function relationOf(rep: PairTable, member: PairTable): Relation {
  if (sameTable(rep, member)) {
    return '1'
  }

  if (sameTable(conjugateTable(rep, swapPair), member)) {
    return 'P'
  }

  if (sameTable(conjugateTable(rep, negatePair), member)) {
    return 'C'
  }

  if (sameTable(conjugateTable(rep, swapNegatePair), member)) {
    return 'PC'
  }

  throw new Error('pair-rules-geometry: a member outside its class orbit')
}

// numbers equal within 1e-9 (sums run in a different order for a C-member)
function sameNumbers(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a))
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a)

    return (
      ka.length === Object.keys(b).length &&
      ka.every(k =>
        sameNumbers(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
        ),
      )
    )
  }

  return a === b
}

function instanceRow(inst: LabInstance): InstanceRow {
  return {
    key: inst.key,
    column: inst.column,
    name: inst.name,
    boundary: inst.boundary,
    family: inst.scheduleFamily,
    variant: inst.scheduleVariant,
    cells: inst.size,
    degree: inst.degree,
    colors: inst.colorCount,
    radius: inst.radius,
    systole: inst.systole,
    loopSystole: inst.loopSystole,
    systoleLowerBound: inst.systoleLowerBound,
    gap: inst.collisionGap,
    patchRadius: inst.patchRadius,
    orientation: inst.orientation,
    construction: inst.construction,
    partner: inst.partner,
  }
}

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

// The systole control on one square torus: every moving seed (its quotient radius grew past its start by more than one)
// of the vacuum-fixing rules under both orders, those whose radius passed half the computed loop systole, and those
// passing under a planted loop systole.
function systoleControl(input: {
  inst: LabInstance
  rules: readonly HarnessRule[]
  planted: number
}): SystoleControl {
  const { inst } = input
  const out: SystoleControl = {
    instance: inst.name,
    loopSystole: inst.loopSystole,
    colors: inst.colorCount,
    boundHolds: inst.loopSystole !== null && !inst.systoleLowerBound && inst.loopSystole > 2 * inst.colorCount * SEED_ROUNDS,
    movers: 0,
    passing: 0,
    plantedPassing: 0,
  }

  for (const rule of input.rules) {
    for (const order of COLOR_ORDERS) {
      for (const s of seedReadings({ rule, instance: inst, order })) {
        const read = Math.min(SEED_ROUNDS, s.exact)
        const maxRadius = Math.max(...s.track.radius.slice(0, read + 1))

        if (maxRadius <= s.initialRadius + 1) {
          continue
        }

        out.movers++

        if (inst.loopSystole !== null && !inst.systoleLowerBound && 2 * maxRadius > inst.loopSystole) {
          out.passing++
        }

        if (2 * maxRadius > input.planted) {
          out.plantedPassing++
        }
      }
    }
  }

  return out
}

export function pairRulesGeometry(input: { rerunSubset: boolean }): GeometryRun {
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })
  const rules = new Map<string, HarnessRule>(
    census.rules.map(r => [r.name, harnessRule(r)]),
  )
  const equivalenceHolds = [...rules.values()].every(
    r => r.vacuumFixing === r.swapSymmetric,
  )
  const open = openInstances()
  const openVariants = openVariantInstances(open)
  const closedAll = closedInstances()
  const closedAllVariants = closedVariantInstances(closedAll)
  const small = (i: LabInstance): boolean => !input.rerunSubset || i.size <= RERUN_MAX_CELLS
  const closed = closedAll.filter(small)
  const closedVariants = closedAllVariants.filter(small)
  const catalog = [...closedAll, ...closedAllVariants]
  const instances = [...open, ...openVariants, ...closed, ...closedVariants]
  const gateFailures: string[] = []
  const readingFailures: string[] = []
  const readings = new Map<string, HarnessReading>()
  const key = (rule: string, inst: string, order: ColorOrder): string =>
    `${rule}#${inst}#${order}`

  for (const inst of instances) {
    for (const rule of rules.values()) {
      if (inst.boundary === 'openBall' && !rule.vacuumFixing) {
        continue
      }

      if (!input.rerunSubset) {
        const conjugate = harnessRule({
          name: `${rule.name}^P`,
          table: conjugateTable(rule.table, swapPair),
        })
        const g: InstanceGates = instanceGates({
          rule,
          swapConjugate: conjugate,
          instance: inst,
        })
        const checks: [string, boolean][] = [
          ['schedules', g.schedulesValid],
          ['degree', g.degreeExact],
          ['mirror', g.mirrorValid],
          ['inverse', g.inverseRestores],
          ['charge', g.chargeConstant],
          [
            'excitation',
            rule.vacuumFixing ? g.excitationConstant : g.excitationMoves,
          ],
          [
            'negation',
            rule.negationSymmetric ? g.negationCommutes : g.negationBreaks,
          ],
          [
            'orientation',
            rule.swapSymmetric ? g.orientationIgnored : g.orientationMatters,
          ],
          ['swap-is-reversal', g.swapIsOrientationReversal],
          ['sparse', g.sparseEqualsDense],
        ]

        for (const [name, ok] of checks) {
          if (!ok) {
            gateFailures.push(`${rule.name}@${inst.name}:${name}`)
          }
        }
      }

      for (const order of COLOR_ORDERS) {
        const r = harnessReading({ rule, instance: inst, order, catalog })

        readings.set(key(rule.name, inst.key, order), r)

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

  const memberFailures: string[] = []
  const classResults: ClassResult[] = classes.map(c => {
    const rep = c.representative
    const members = c.members.map(m => ({
      name: m.name,
      relation: relationOf(rep.table, m.table),
    }))
    const pMember = members.find(m => m.relation === 'P')
    const vacuumFixing = rules.get(rep.name)!.vacuumFixing
    const cells: CellRow[] = []

    for (const inst of instances) {
      if (inst.boundary === 'openBall' && !vacuumFixing) {
        continue
      }

      const get = (name: string, order: ColorOrder): HarnessReading =>
        readings.get(key(name, inst.key, order))!
      const representative = {
        forward: get(rep.name, 'forward').result,
        reverse: get(rep.name, 'reverse').result,
      }
      const memberRows: MemberRow[] = members.map(m => ({
        name: m.name,
        relation: m.relation,
        labels: {
          forward: get(m.name, 'forward').result.label,
          reverse: get(m.name, 'reverse').result.label,
        },
      }))

      // C gate: a C-member reads exactly what its partner without C reads (rep for C, the P-member for PC)
      for (const m of members) {
        if (m.relation !== 'C' && m.relation !== 'PC') {
          continue
        }

        const partner = m.relation === 'C' ? rep.name : pMember?.name

        if (!partner) {
          memberFailures.push(`${m.name}@${inst.name}:no-partner`)
          continue
        }

        for (const order of COLOR_ORDERS) {
          const a = get(m.name, order).result
          const b = get(partner, order).result

          if (a.label !== b.label || !sameNumbers(a.numbers, b.numbers)) {
            memberFailures.push(`${m.name}@${inst.name}/${order}:C`)
          }
        }
      }

      cells.push({
        instance: inst.key,
        column: inst.column,
        boundary: inst.boundary,
        family: inst.scheduleFamily,
        variant: inst.scheduleVariant,
        representative,
        members: memberRows,
        scheduleSensitive:
          representative.forward.label !== representative.reverse.label,
        orientationSensitive: memberRows.some(
          m =>
            (m.relation === 'P' || m.relation === 'PC') &&
            (m.labels.forward !== representative.forward.label ||
              m.labels.reverse !== representative.reverse.label),
        ),
      })
    }

    return {
      representative: rep.name,
      members: c.members.map(m => m.name),
      vacuumFixing,
      swapSymmetric: rules.get(rep.name)!.swapSymmetric,
      negationSymmetric: rules.get(rep.name)!.negationSymmetric,
      cells,
    }
  })

  // line control
  const ring = closed.find(i => i.column === 'line')!
  const lineControl = classResults.map(c => {
    const cell = c.cells.find(x => x.instance === ring.key)!

    return {
      representative: c.representative,
      expected: LINE_LABELS[c.representative] ?? 'interacting',
      got: cell.representative.forward.label,
      members: cell.members.flatMap(m => [m.labels.forward, m.labels.reverse]),
    }
  })

  // schedule dependence: a class whose label on one column and boundary changes across schedules and color orders
  const scheduleDependence: ScheduleDependence[] = []

  for (const c of classResults) {
    const groups = new Map<string, CellRow[]>()

    for (const cell of c.cells) {
      const g = `${cell.column}|${cell.boundary}`

      groups.set(g, [...(groups.get(g) ?? []), cell])
    }

    for (const [g, cells] of groups) {
      const labels = cells.flatMap(cell =>
        COLOR_ORDERS.map(order => ({
          schedule: `${cell.family}/${cell.variant}`,
          order,
          label: cell.representative[order].label,
        })),
      )

      if (new Set(labels.map(l => l.label)).size > 1) {
        const [column, boundary] = g.split('|')

        scheduleDependence.push({ representative: c.representative, column: column!, boundary: boundary!, labels })
      }
    }
  }

  // curvature, open windows: each flat schedule against the hyperbolic control's schedule of the same variant name
  const curvature: CurvatureRow[] = []
  const openAll = [...open, ...openVariants]

  for (const flat of openAll.filter(i => i.curvature === 'flat' && i.lazy && open.some(o => o.column === i.column && o.matchedControl))) {
    const control = open.find(o => o.column === flat.column)!.matchedControl
    const hyp = openAll.find(i => i.column === control && i.scheduleVariant === flat.scheduleVariant)

    if (!hyp) {
      continue
    }

    for (const c of classResults.filter(x => x.vacuumFixing)) {
      const rule = rules.get(c.representative)!
      const matched = {} as Record<
        ColorOrder,
        { flat: string; hyperbolic: string; sharedSeeds: number }
      >

      for (const order of COLOR_ORDERS) {
        const m = matchedOpenLabels({
          rule,
          order,
          flat: {
            instance: flat,
            reading: readings.get(key(rule.name, flat.key, order))!,
          },
          hyperbolic: {
            instance: hyp,
            reading: readings.get(key(rule.name, hyp.key, order))!,
          },
        })

        matched[order] = {
          flat: m.flat.label,
          hyperbolic: m.hyperbolic.label,
          sharedSeeds: m.sharedSeeds,
        }
      }

      const differs = COLOR_ORDERS.some(
        o => matched[o].flat !== matched[o].hyperbolic,
      )
      const sameFamily = flat.scheduleFamily === hyp.scheduleFamily
      const credited =
        sameFamily &&
        COLOR_ORDERS.every(
          o =>
            matched[o].flat !== matched[o].hyperbolic &&
            matched[o].flat !== 'unresolved' &&
            matched[o].hyperbolic !== 'unresolved',
        )

      curvature.push({
        flat: flat.column,
        hyperbolic: hyp.column,
        boundary: 'openBall',
        representative: c.representative,
        flatSchedule: `${flat.scheduleFamily}/${flat.scheduleVariant}`,
        hyperbolicSchedule: `${hyp.scheduleFamily}/${hyp.scheduleVariant}`,
        sameFamily,
        flatLabel: readings.get(key(rule.name, flat.key, 'forward'))!.result.label,
        hyperbolicLabel: readings.get(key(rule.name, hyp.key, 'forward'))!.result.label,
        matched,
        differs,
        credited,
        loopSystoles: [null, null],
      })
    }
  }

  // one verdict per open pair and class over its same-family comparisons
  const curvatureVerdicts: CurvatureVerdict[] = []
  const pairClass = new Map<string, CurvatureRow[]>()

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

  // curvature, closed: each hyperbolic quotient against its flat partner of equal size and degree, never credited
  for (const hyp of closed.filter(i => i.curvature === 'hyperbolic' && i.partner)) {
    const flat = closed.find(i => i.name === hyp.partner)

    if (!flat) {
      continue
    }

    for (const c of classResults) {
      const flatLabel = readings.get(key(c.representative, flat.key, 'forward'))!
        .result.label
      const hyperbolicLabel = readings.get(
        key(c.representative, hyp.key, 'forward'),
      )!.result.label

      curvature.push({
        flat: flat.column,
        hyperbolic: hyp.column,
        boundary: 'closed',
        representative: c.representative,
        flatSchedule: 'greedy/base',
        hyperbolicSchedule: 'greedy/base',
        sameFamily: true,
        flatLabel,
        hyperbolicLabel,
        matched: null,
        differs: flatLabel !== hyperbolicLabel,
        credited: false,
        loopSystoles: [flat.loopSystole, hyp.loopSystole],
      })
    }
  }

  // gated labels, re-derived from scratch
  const recheck: Recheck = {
    instances: new Map([...instances, ...catalog].map(i => [i.key, i])),
    rules,
    catalog,
    systoles: new Map(),
  }
  const gateProofFailures: string[] = []
  const gated = [...readings.values()].filter(r => r.result.gate !== null)

  for (const r of [...readings.values()]) {
    const f = gateProofFailure(recheck, r)

    if (f) {
      gateProofFailures.push(f)
    }
  }

  // planted bad gates: each must be rejected by the same re-derivation
  const plantedGates: { name: string; rejected: boolean }[] = []
  const fullSwap = rules.get('swap.CBA.swap')!

  const plant = (name: string, base: HarnessReading | undefined, label: 'confined' | 'surface_limited', gate: LabelGate): void => {
    if (!base) {
      plantedGates.push({ name: `${name}:missing`, rejected: false })

      return
    }

    const fake: HarnessReading = {
      ...base,
      result: {
        ...base.result,
        label,
        verdict: { ...base.result.verdict, label: 'unresolved' },
        numbers: { ...base.result.numbers, collisionsUnread: 0, damageUnread: 0 },
        gate,
      },
    }

    plantedGates.push({ name, rejected: gateProofFailure(recheck, fake) !== null })
  }

  if (!input.rerunSubset) {
    const lazy37 = open.find(i => i.column === '{3,7}')
    const torus44 = closed.find(i => i.column === '{4,4}')

    plant(
      'confined gate on the ballistic {3,7} full swap',
      lazy37 && readings.get(key(fullSwap.name, lazy37.key, 'forward')),
      'confined',
      {
        kind: 'confined',
        budget: CONFINED_MAX_ROUNDS,
        orbits: SEEDS.map(s => ({ seed: s.key, period: 2, cells: 2, hull: 6 })),
      },
    )

    const realConfined = gated.find(r => r.result.gate?.kind === 'confined')

    if (realConfined && realConfined.result.gate?.kind === 'confined') {
      const g = realConfined.result.gate

      plant('a real confined gate with one period off by one', realConfined, 'confined', {
        ...g,
        orbits: g.orbits.map((o, k) => (k === 0 ? { ...o, period: o.period + 1 } : o)),
      })
    }

    const withPairs = torus44 && readings.get(key('id.ABC.swap', torus44.key, 'forward'))

    plant('no-pair gate where collidable pairs exist', withPairs, 'surface_limited', {
      kind: 'surface_limited',
      reason: 'no_collidable_pair',
      pairs: 0,
      seedsRead: SEEDS.length,
      larger: { instance: `${torus44?.name}-larger`, cells: 0, loopSystole: null, pairs: 1 },
    })

    plant(
      'systole gate under a loop systole the movers never pass',
      torus44 && readings.get(key(fullSwap.name, torus44.key, 'forward')),
      'surface_limited',
      {
        kind: 'surface_limited',
        reason: 'systole',
        injectivityRadius: 999,
        loopSystole: 999,
        movers: [{ seed: SEEDS[0]!.key, maxRadius: 1, maxCount: 1 }],
      },
    )
  }

  // negative control, confined: a ballistic mover never closes an orbit (the full swap on the lazy {3,7} window)
  const confinedControl = { ballisticSeeds: 0, closedOrbits: 0, stopped: 0 }
  const lazy37 = open.find(i => i.column === '{3,7}')

  if (!input.rerunSubset && lazy37) {
    const reading = readings.get(key(fullSwap.name, lazy37.key, 'forward'))!
    const ctx = lazyContext(lazy37, 'forward')

    for (const s of reading.seeds) {
      const kind = seedMotion({
        track: {
          count: s.track.count.slice(0, SEED_ROUNDS + 1),
          radius: s.track.radius.slice(0, SEED_ROUNDS + 1),
          innerRadius: s.track.innerRadius.slice(0, SEED_ROUNDS + 1),
          fill: s.track.fill.slice(0, SEED_ROUNDS + 1),
        },
        initialRadius: s.initialRadius,
        boundedCount: 4,
      }).kind

      if (kind !== 'ballistic' || s.exact < SEED_ROUNDS) {
        continue
      }

      confinedControl.ballisticSeeds++

      const seed = SEEDS.find(x => x.key === s.key)!
      const o = confinedOrbit(ctx, fullSwap, seed, CONFINED_MAX_ROUNDS)

      if (o === 'stopped') {
        confinedControl.stopped++
      } else if (o) {
        confinedControl.closedOrbits++
      }
    }
  } else if (!input.rerunSubset) {
    gateProofFailures.push('confined-control:no-lazy-{3,7}')
  }

  // systole controls on square tori of {4,4}: the large one negative and flippable, the small one positive
  const vacuumFixingRules = [...rules.values()].filter(r => r.vacuumFixing)
  const emptyControl = (name: string): SystoleControl => ({
    instance: name,
    loopSystole: null,
    colors: 0,
    boundHolds: false,
    movers: 0,
    passing: 0,
    plantedPassing: 0,
  })
  const systoleControls = input.rerunSubset
    ? { large: emptyControl('skipped'), small: emptyControl('skipped') }
    : {
        large: systoleControl({
          inst: squareTorusInstance(...SYSTOLE_CONTROL_LARGE, SYSTOLE_CONTROL_REFERENCE),
          rules: vacuumFixingRules,
          planted: SYSTOLE_CONTROL_PLANTED,
        }),
        small: systoleControl({
          inst: squareTorusInstance(...SYSTOLE_CONTROL_SMALL),
          rules: [fullSwap],
          planted: SYSTOLE_CONTROL_PLANTED,
        }),
      }

  // every reading by label, and the unresolved ones with the gate refusal behind them
  const readingLabels: Record<string, number> = {}
  const unresolvedReadings: { reading: string; refused: string | null }[] = []

  // the readings the extended census ran on (the 60 seeds left them unresolved with no collidable pair)
  const extendedReadings: GeometryRun['extendedReadings'] = []
  const instanceOfKey = new Map([...instances, ...catalog].map(i => [i.key, i.name]))

  for (const [k, r] of readings) {
    readingLabels[r.result.label] = (readingLabels[r.result.label] ?? 0) + 1

    if (r.result.label === 'unresolved') {
      unresolvedReadings.push({ reading: k, refused: r.result.refused })
    }

    if (r.extended) {
      extendedReadings.push({
        reading: k,
        instance: instanceOfKey.get(r.instance) ?? r.instance,
        order: r.order,
        rule: r.rule,
        level: r.extended.levels.map(l => `(${l.radius}, ${l.size})`).join(' '),
        seeds: r.extended.seeds,
        seedsPerBackground: r.extended.seedsPerBackground,
        pairs: r.extended.pairs,
        exists: r.extended.exists,
        scattered: r.result.numbers.collisionsScattered,
        tested: r.result.numbers.collisionsTested,
        label: r.result.label,
      })
    }
  }

  const serialized = JSON.stringify(
    [...readings.values()].map(summary),
  )

  return {
    census: {
      permutationsChecked: census.permutationsChecked,
      conservative: census.rules.length,
    },
    classCount: classes.length,
    equivalenceHolds,
    instances: instances.map(instanceRow),
    classes: classResults,
    curvature,
    curvatureVerdicts,
    scheduleDependence,
    gateFailures,
    readingFailures,
    memberFailures,
    lineControl,
    lazyBudgetStops: [...readings.values()].reduce(
      (s, x) => s + (x.lazy?.budgetStops ?? 0),
      0,
    ),
    lazyConeExcess: Math.max(
      Number.NEGATIVE_INFINITY,
      ...[...readings.values()].map(
        x => x.lazy?.coneExcess ?? Number.NEGATIVE_INFINITY,
      ),
    ),
    gateProofFailures,
    gatedReadings: gated.length,
    plantedGates,
    readingLabels,
    unresolvedReadings,
    extendedReadings,
    confinedControl,
    systoleControl: systoleControls,
    serialized,
  }
}

// ---- the classification tables ----

const SHORT: Record<string, string> = {
  frozen: 'F',
  ballistic: 'B',
  interacting: 'I',
  mixing: 'M',
  confined: 'C',
  surface_limited: 'S',
  unresolved: 'U',
}

function fmt(x: number | null, digits = 2): string {
  return x === null || Number.isNaN(x) ? '-' : x.toFixed(digits)
}

function labelCell(cell: CellRow | undefined): string {
  if (!cell) {
    return '-'
  }

  const flags = `${cell.representative.forward.mixingOpen ? 'm' : ''}${cell.scheduleSensitive ? 's' : ''}${cell.orientationSensitive ? 'o' : ''}`

  return `${SHORT[cell.representative.forward.label]}${flags ? ` ${flags}` : ''}`
}

function gateProof(g: LabelGate): string {
  return g.kind === 'confined'
    ? `${g.orbits.length} orbits within ${g.budget} rounds, periods ${[...new Set(g.orbits.map(o => o.period))].sort((a, b) => a - b).join(', ')}, at most ${Math.max(...g.orbits.map(o => o.cells))} cells at round ends and ${Math.max(...g.orbits.map(o => o.hull))} within rounds`
    : g.reason === 'no_collidable_pair'
      ? `no collidable pair among ${g.seedsRead} seeds; ${g.larger.pairs} on the larger ${g.larger.instance} (${g.larger.cells} cells, L ${g.larger.loopSystole ?? '-'})`
      : `injectivity radius ${g.injectivityRadius}, loop systole ${g.loopSystole}: ${g.movers.length} movers, radius ${Math.min(...g.movers.map(m => m.maxRadius))} to ${Math.max(...g.movers.map(m => m.maxRadius))}, at most ${Math.max(...g.movers.map(m => m.maxCount))} cells`
}

export function m1Tables(run: GeometryRun): string {
  const base = run.instances.filter(i => i.variant === 'base')
  const columns = [...new Set(base.map(i => i.column))]
  const instanceOf = new Map(run.instances.map(i => [i.key, i]))
  const lines: string[] = []

  lines.push('#### Instances', '')
  lines.push(
    'Every instance read, schedule variants included. systole: the injectivity radius r (every r-ball is the ' +
      "tiling's); L: the loop systole (shortest non-contractible loop, 2r + 2 or 2r + 3), past half of which quotient " +
      'and cover distance can differ.',
    '',
  )

  lines.push(
    '| geometry | boundary | instance | schedule | cells | degree | colors | radius | systole r | loop L | gap | patch | partner |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )

  for (const i of run.instances) {
    lines.push(
      `| ${i.column} | ${i.boundary === 'openBall' ? 'open' : 'closed'} | ${i.name} | ${i.family}/${i.variant} | ${i.cells} | ${i.degree} | ${i.colors} | ${i.radius < 0 ? '-' : i.radius} | ${i.systole ?? '-'}${i.systoleLowerBound ? '+' : ''} | ${i.loopSystole ?? '-'} | ${i.gap} | ${i.boundary === 'openBall' ? i.patchRadius : '-'} | ${i.partner ?? '-'} |`,
    )
  }

  lines.push('', '#### Labels, classes x geometries', '')
  lines.push(
    'Each cell: open window / closed quotient, base schedule, forward color order. F frozen, B ballistic, I interacting, M mixing, ' +
      'C confined, S surface-limited (both gated), U unresolved, - not run (creating rules have no open window). Flags: m mixing not excluded (periods undecided ' +
      'at one size, every measured mixing test passes), s schedule-sensitive (forward and reversed ' +
      'color order disagree), o orientation-sensitive (a P-member, the rule under reversed orientation, disagrees). ' +
      '{3,4,3,4} closed shows level 4 then level 5. Schedule variants are in their own table below.',
    '',
  )

  lines.push(
    `| class | ${columns.join(' | ')} |`,
    `| --- | ${columns.map(() => '---').join(' | ')} |`,
  )

  for (const c of run.classes) {
    const row = columns.map(col => {
      const cells = c.cells.filter(x => x.column === col && x.variant === 'base')
      const openCell = cells.find(x => x.boundary === 'openBall')
      const closedCells = cells.filter(x => x.boundary === 'closed')

      return `${labelCell(openCell)} / ${closedCells.length > 0 ? closedCells.map(labelCell).join(', ') : '-'}`
    })

    lines.push(`| ${c.representative} | ${row.join(' | ')} |`)
  }

  lines.push('', '#### Schedule dependence', '')
  lines.push(
    'Every class whose label on one geometry and boundary changes with the schedule (family/variant) or the color ' +
      'order, representative. The full swap is state-independent: each round is a fixed permutation of the cells, the ' +
      'product of the matchings, so its row measures the schedule, never the rule.',
    '',
  )
  lines.push('| class | geometry | boundary | labels (schedule order: label) |', '| --- | --- | --- | --- |')

  for (const d of run.scheduleDependence) {
    lines.push(
      `| ${d.representative} | ${d.column} | ${d.boundary === 'openBall' ? 'open' : 'closed'} | ${d.labels.map(l => `${l.schedule} ${l.order === 'forward' ? 'f' : 'r'}: ${SHORT[l.label]}`).join(', ')} |`,
    )
  }

  lines.push('', '#### Numbers, one row per class and instance', '')
  lines.push(
    'Forward color order, representative. seeds: static/ballistic/spreading/wandering/unread. collisions: ' +
      'scattered/tested (unread). damage: mean front speed in hops per round, fill, rounds read (ceiling c). entropy: ' +
      'lowest late pair entropy over its sector ceiling. rec: shortest exact recurrence of the low-entropy starts ' +
      '(> budget when none returned). vac: vacuum period. rev, P: the label under the reversed color order and of the ' +
      'P-member (reversed orientation).',
    '',
  )

  lines.push(
    '| class | instance | label | rev | P | seeds | collisions | damage | entropy | p-exp | rec | vac |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )

  for (const c of run.classes) {
    for (const cell of c.cells) {
      const inst = instanceOf.get(cell.instance)!
      const f = cell.representative.forward
      const n = f.numbers
      const k = n.seedKinds
      const p = cell.members.find(m => m.relation === 'P')

      lines.push(
        `| ${c.representative} | ${inst.name} | ${f.label}${f.mixingOpen ? ' (m)' : ''} | ${cell.representative.reverse.label} | ${p ? p.labels.forward : '-'} | ` +
          `${k.static}/${k.ballistic}/${k.spreading}/${k.wandering}/${k.unread} | ` +
          `${n.collisionsScattered}/${n.collisionsTested} (${n.collisionsUnread}) | ` +
          `${fmt(n.damageSpeed)}, ${fmt(n.damageFill)}, ${n.damageRounds} (c ${inst.colors}) | ` +
          `${fmt(n.entropyRatio)} | ${fmt(n.periodExponent)} | ` +
          `${n.recurrenceBudget === null ? '-' : (n.recurrenceMin ?? `>${n.recurrenceBudget}`)} | ` +
          `${n.vacuumPeriod === null ? '-' : n.vacuumPeriod < 0 ? `>${n.recurrenceBudget}` : n.vacuumPeriod} |`,
      )
    }
  }

  lines.push('', '#### Gated and refused cells', '')
  lines.push(
    'Every cell, representative, both color orders, every schedule, that is gated (confined or surface-limited, with ' +
      'its proof) or unresolved (with the gate refusal behind it, if any). confined: the exact periodic orbit of every ' +
      'seed, replayed in the experiment. surface-limited: no collidable pair here while the larger quotient has one, ' +
      'or the systole bound (every non-localized seed a bounded particle whose quotient radius passed half the loop ' +
      'systole L).',
    '',
  )

  lines.push(
    '| class | instance | order | label | proof or refusal |',
    '| --- | --- | --- | --- | --- |',
  )

  for (const c of run.classes) {
    for (const cell of c.cells) {
      const inst = instanceOf.get(cell.instance)!

      for (const order of ['forward', 'reverse'] as const) {
        const l = cell.representative[order]

        if (!l.gate && l.label !== 'unresolved') {
          continue
        }

        lines.push(
          `| ${c.representative} | ${inst.name} | ${order} | ${l.label} | ${l.gate ? gateProof(l.gate) : (l.refused ?? 'no gate applies')} |`,
        )
      }
    }
  }

  lines.push('', '#### Extended seed census', '')
  lines.push(
    'Every reading (every member, both orders, every schedule) that the 60 seeds left unresolved with no collidable ' +
      'pair, re-read on every support that contains the anchor and lies in its radius-r ball with at most k cells, ' +
      'every off-background tone on every cell, on all three backgrounds (a live background only to 2 cells), ' +
      'levels (r, k) = (1, 2), (1, 3), (2, 2), (2, 3), (2, 4), (3, 4), (3, 5) in order, the family the union of the ' +
      'levels read, stopping at the first level with a collidable pair, or before the first level whose family holds ' +
      'more than 200,000 seeds (the levels read are the exhaustive bound). seeds: placed, and per background ' +
      '-1/0/+1. pairs: the collidable pairs run, those with a one-cell member; collisions: scattered/tested.',
    '',
  )

  lines.push(
    '| rule | instance | order | level | seeds | per background | pairs | collisions | label |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )

  for (const x of run.extendedReadings) {
    lines.push(
      `| ${x.rule} | ${x.instance} | ${x.order} | ${x.level} | ${x.seeds} | ${x.seedsPerBackground.join('/')} | ${x.pairs} | ${x.scattered}/${x.tested} | ${x.label} |`,
    )
  }

  lines.push('', '#### Curvature against the degree-matched control', '')
  lines.push(
    'Open: each side read under the shared window (every seed, collision and damage run to the fewer exact rounds ' +
      'of the two windows), one row per schedule pair (the flat schedule against the hyperbolic schedule of the same ' +
      'variant name). Credited only when both share a schedule family and the shared-window labels differ under both ' +
      'color orders with neither unresolved. Closed: never credited (loop systoles in brackets, flat then hyperbolic).',
    '',
  )

  lines.push(
    '| pair | boundary | schedules flat, hyperbolic | same family | class | own labels flat, hyperbolic | shared window forward | shared window reverse | differs | credited |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )

  for (const r of run.curvature) {
    const shared = (o: ColorOrder): string =>
      r.matched
        ? `${r.matched[o].flat}, ${r.matched[o].hyperbolic} (${r.matched[o].sharedSeeds} seeds)`
        : '-'

    lines.push(
      `| ${r.flat} vs ${r.hyperbolic} | ${r.boundary === 'openBall' ? 'open' : `closed [${r.loopSystoles[0]}, ${r.loopSystoles[1]}]`} | ${r.flatSchedule}, ${r.hyperbolicSchedule} | ${r.sameFamily ? 'yes' : 'no'} | ${r.representative} | ` +
        `${r.flatLabel}, ${r.hyperbolicLabel} | ${shared('forward')} | ${shared('reverse')} | ${r.differs ? 'yes' : 'no'} | ${r.credited ? 'yes' : 'no'} |`,
    )
  }

  lines.push('', '#### Curvature verdicts', '')
  lines.push(
    'Per open pair and class, over every same-family schedule pair: null (all agree), differs (all credited), ' +
      'schedule_dependent (some agree, some differ), unmatched (no shared family, never called null or positive).',
    '',
  )
  lines.push('| pair | class | same-family comparisons | verdict |', '| --- | --- | --- | --- |')

  for (const v of run.curvatureVerdicts) {
    lines.push(`| ${v.flat} vs ${v.hyperbolic} | ${v.representative} | ${v.sameFamilyComparisons} | ${v.verdict} |`)
  }

  return lines.join('\n')
}

export default experiment({
  id: 'computation/pair-rules-geometry',
  code: 'E-CMP-0027',
  title:
    'the 12 classes of conservative reversible ternary pair rules on every lab geometry, under several schedules, on exact open windows and closed quotients',
  category: 'computation',
  substrates: [
    'line',
    '{4,4}',
    '{6,3}',
    '{3,6}',
    '{5,4}',
    '{7,3}',
    '{8,3}',
    '{3,4,3,4}',
    '{4,5}',
    '{6,4}',
    '{3,7}',
    '{3,4,3,3}',
  ],
  depth: 'L2',
  paper: false,
  run() {
    const r = pairRulesGeometry({ rerunSubset: false })
    const again = pairRulesGeometry({ rerunSubset: true })
    const subsetKeys = new Set(again.instances.map(i => i.key))
    const subsetOfFirst = JSON.stringify(
      (JSON.parse(r.serialized) as { instance: string }[]).filter(x =>
        subsetKeys.has(x.instance),
      ),
    )
    const identicalBytes = subsetOfFirst === again.serialized
    const findings = LAB_FILES.flatMap(f =>
      scanSource(f, readFileSync(resolve(BASE, f), 'utf8')),
    )
    const lineControlFailures = r.lineControl.filter(
      l => l.got !== l.expected || l.members.some(m => m !== l.expected),
    )
    const structural =
      r.census.permutationsChecked === 362880 &&
      r.census.conservative === 24 &&
      r.classCount === 12 &&
      r.equivalenceHolds
    const { large, small } = r.systoleControl
    const systoleControlsHold =
      large.boundHolds &&
      large.movers > 0 &&
      large.passing === 0 &&
      large.plantedPassing > 0 &&
      small.loopSystole !== null &&
      small.passing > 0
    const plantedRejected = r.plantedGates.length >= 3 && r.plantedGates.every(p => p.rejected)
    const gatesPass =
      structural &&
      r.gateFailures.length === 0 &&
      r.readingFailures.length === 0 &&
      r.memberFailures.length === 0 &&
      lineControlFailures.length === 0 &&
      identicalBytes &&
      findings.length === 0 &&
      r.gateProofFailures.length === 0 &&
      plantedRejected &&
      r.confinedControl.ballisticSeeds > 0 &&
      r.confinedControl.closedOrbits === 0 &&
      systoleControlsHold
    const cells = r.classes.flatMap(c => c.cells)
    const baseCells = cells.filter(x => x.variant === 'base')
    const label = (boundary: string, l: string): number =>
      baseCells.filter(
        x => x.boundary === boundary && x.representative.forward.label === l,
      ).length
    // every reading: every member, both orders, every schedule
    const status = !gatesPass ? 'fail' : r.unresolvedReadings.length > 0 ? 'partial' : 'pass'
    const credited = r.curvature.filter(x => x.credited)
    const verdictCount = (v: CurvatureVerdict['verdict']): number =>
      r.curvatureVerdicts.filter(x => x.verdict === v).length

    return verdict({
      status,
      claim:
        'every class of the 24 conservative reversible pair rules gets a label (frozen, ballistic, interacting, mixing, or the gated confined and surface_limited, each only with a proof re-derived from scratch) on every lab geometry, on exact open windows for the 8 vacuum-fixing rules and on closed quotients for all 24, in every reading (every member, both color orders, every schedule variant), with curvature judged only against the degree-matched control under a shared window and a shared schedule family',
      metrics: {
        instances: r.instances.length,
        cells: cells.length,
        baseCells: baseCells.length,
        readings: Object.values(r.readingLabels).reduce((a, b) => a + b, 0),
        readingsUnresolved: r.unresolvedReadings.length,
        readingsConfined: r.readingLabels.confined ?? 0,
        readingsSurfaceLimited: r.readingLabels.surface_limited ?? 0,
        openFrozen: label('openBall', 'frozen'),
        openBallistic: label('openBall', 'ballistic'),
        openInteracting: label('openBall', 'interacting'),
        openMixing: label('openBall', 'mixing'),
        openConfined: label('openBall', 'confined'),
        openSurfaceLimited: label('openBall', 'surface_limited'),
        openUnresolved: label('openBall', 'unresolved'),
        closedFrozen: label('closed', 'frozen'),
        closedBallistic: label('closed', 'ballistic'),
        closedInteracting: label('closed', 'interacting'),
        closedMixing: label('closed', 'mixing'),
        closedConfined: label('closed', 'confined'),
        closedSurfaceLimited: label('closed', 'surface_limited'),
        closedUnresolved: label('closed', 'unresolved'),
        gatedReadings: r.gatedReadings,
        gateProofFailures: r.gateProofFailures.length,
        plantedGates: r.plantedGates.length,
        plantedGatesRejected: r.plantedGates.filter(p => p.rejected).length,
        confinedControlBallisticSeeds: r.confinedControl.ballisticSeeds,
        confinedControlClosedOrbits: r.confinedControl.closedOrbits,
        confinedControlStopped: r.confinedControl.stopped,
        systoleLargeLoop: large.loopSystole ?? -1,
        systoleLargeColors: large.colors,
        systoleLargeMovers: large.movers,
        systoleLargePassing: large.passing,
        systoleLargePlantedPassing: large.plantedPassing,
        systoleSmallLoop: small.loopSystole ?? -1,
        systoleSmallMovers: small.movers,
        systoleSmallPassing: small.passing,
        scheduleSensitive: cells.filter(x => x.scheduleSensitive).length,
        scheduleDependentClassCells: r.scheduleDependence.length,
        orientationSensitive: cells.filter(x => x.orientationSensitive).length,
        curvatureDiffersOpen: r.curvature.filter(
          x => x.boundary === 'openBall' && x.differs,
        ).length,
        curvatureCredited: credited.length,
        curvatureNull: verdictCount('null'),
        curvatureDiffers: verdictCount('differs'),
        curvatureScheduleDependent: verdictCount('schedule_dependent'),
        curvatureUnmatched: verdictCount('unmatched'),
        mixingNotExcluded: baseCells.filter(
          x => x.representative.forward.mixingOpen,
        ).length,
        closedPartnerDiffers: r.curvature.filter(
          x => x.boundary === 'closed' && x.differs,
        ).length,
        gateFailures: r.gateFailures.length,
        readingFailures: r.readingFailures.length,
        memberFailures: r.memberFailures.length,
        lineControlFailures: lineControlFailures.length,
        lazyBudgetStops: r.lazyBudgetStops,
        extendedCensusReadings: r.extendedReadings.length,
        extendedCensusWithPairs: r.extendedReadings.filter(x => x.exists).length,
        extendedCensusResolved: r.extendedReadings.filter(x => x.label !== 'unresolved').length,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        // the line control reproduces E-CMP-0025, and the negative controls of the per-rule gates can fail
        lineClassesAgreeing: r.lineControl.length - lineControlFailures.length,
        creatingRulesChecked: 16,
      },
      notes:
        `Algebra spin-one; schedules (each in forward and reversed color order): greedy edge coloring per closed instance plus a greedy coloring of the cells in reversed order; on the lazy windows the base coloring of the infinite tiling (generator for {5,4}, {6,4}, {3,4,3,4}; step parity for {6,3}, {3,4,3,3}; lifted from finite quotients of the coset tilings for {7,3}, {8,3}, {4,5}, {3,7}, {4,4}, {3,6}) plus variants: a second lifted coloring of every coset tiling, lifted colorings of {5,4}, {6,4}, {6,3}, a color-order permutation of the degree-24 spaces. Orientation left to right on the ring, lower cell index first elsewhere, shorter tile (ties by the canonical order) or -r end first on the lazy windows; boundaries: open windows (vacuum-fixing rules; lazy runs stop only on a support of ${LAZY_SUPPORT_CAP} cells, budget stops ${r.lazyBudgetStops}) and closed quotients (all rules). ` +
        `Periods grow with N only on the ring, so mixing is undecided off it and a run passing its measured mixing tests carries mixing-not-excluded. ` +
        `Curvature verdicts over same-family schedules: ${verdictCount('null')} null, ${verdictCount('differs')} differ, ${verdictCount('schedule_dependent')} schedule-dependent, ${verdictCount('unmatched')} unmatched (no shared family); credited: ${credited.map(x => `${x.representative} ${x.flat}/${x.hyperbolic} ${x.flatSchedule}`).join(', ') || 'none'}. ` +
        `Schedule-dependent class cells: ${r.scheduleDependence.length} (${r.scheduleDependence.map(d => `${d.representative}@${d.column}/${d.boundary === 'openBall' ? 'open' : 'closed'}`).join(', ') || 'none'}). ` +
        `Gated labels (re-derived from scratch): ${r.gatedReadings} gated readings, ${r.gateProofFailures.length} proof failures, ${r.plantedGates.filter(p => p.rejected).length} of ${r.plantedGates.length} planted bad gates rejected. Controls: ${r.confinedControl.closedOrbits} of ${r.confinedControl.ballisticSeeds} ballistic {3,7} full-swap seeds closed an orbit (${r.confinedControl.stopped} stopped on the cap); on ${large.instance} (L ${large.loopSystole}, ${large.colors} colors, L > 2cT ${large.boundHolds}) ${large.passing} of ${large.movers} movers passed L/2 and ${large.plantedPassing} passed a planted L of ${SYSTOLE_CONTROL_PLANTED}; on ${small.instance} (L ${small.loopSystole}) ${small.passing} of ${small.movers} full-swap movers passed L/2. ` +
        `Extended census (readings the 60 seeds left unresolved with no collidable pair, re-read on every support through the anchor up to the stated radius and size, closed under C): ${r.extendedReadings.length} readings, ${r.extendedReadings.filter(x => x.exists).length} found pairs, ${r.extendedReadings.filter(x => x.label !== 'unresolved').length} resolved. ` +
        `Unresolved readings: ${r.unresolvedReadings.length}${r.unresolvedReadings.length > 0 ? ` (${r.unresolvedReadings.slice(0, 12).map(u => `${u.reading}${u.refused ? ` [${u.refused}]` : ''}`).join('; ')})` : ''}. ` +
        `Failures: ${[...r.gateFailures, ...r.readingFailures, ...r.memberFailures, ...r.gateProofFailures, ...r.plantedGates.filter(p => !p.rejected).map(p => `planted:${p.name}`), ...lineControlFailures.map(l => `line:${l.representative}:${l.got}`)].slice(0, 40).join(', ') || 'none'}. ` +
        `Random findings: ${findings.map(f => `${f.file}:${f.line}`).join(', ') || 'none'}.`,
    })
  },
})
