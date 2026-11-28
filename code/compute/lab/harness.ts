// The M1 classification harness: one conservative reversible pair rule on one lab geometry, under one schedule and
// one boundary, read into one row of measured numbers and one of the four labels. Algebra: spin-one.
//
// Instances. Every lab geometry is read twice where valid:
//   - openBall: the ball of radius R around a tile, vacuum (or a uniform +-1 background) outside. Run only for the 8
//     vacuum-fixing rules, whose background pairs (b, b) never move, so the ball is a window on the infinite tiling.
//     The window is checked, never assumed: a run is EXACT through round t when no cell of the outer shell (the cells
//     at distance R, the only ones with facets outside) has left the background at any matching of rounds 1..t. Every
//     reading uses exact rounds only, and the rounds read are recorded beside it.
//   - closed: a boundary-free quotient (the ring for the line, the tori and regular maps of tiling-quotient), run for
//     all 24 rules. Every closed hyperbolic quotient has a small systole, so a closed reading past a few hops sees
//     finite wrap-around and is never credited to curvature.
//
// Schedules. The greedy edge coloring of the instance graph, applied in forward and in reversed color
// order. Orientation: left to right on the ring, the lower cell index first everywhere else. A rule that does not
// commute with the cell swap P sees the orientation; its P-conjugate is the same rule under the reversed orientation,
// so the P-members of a class are read as an orientation variant, while the C-members (negation) must read the same
// numbers exactly, every start set being closed under negation.
//
// Measures per run: small-support seeds on the three uniform backgrounds (static, ballistic or spreading), pairwise
// collisions of seeds (superpose or scatter), damage of a one-cell flip (front speed against the c-hops-per-round
// ceiling, fill of the reached ball), and on closed instances the pair entropy from low-entropy starts against its
// sector ceiling, the exact recurrence time of those starts, the vacuum period, and V, A, B, T. Periods cannot grow
// with N on a geometry read at one size, so outside the line ring (exact cycle structure on rings of 6 and 12 cells,
// as E-CMP-0025) the exponential-period test is UNDECIDED: such a run is never labeled mixing, and a run whose
// measured mixing tests all pass carries `mixingOpen` (mixing not excluded). Labels and thresholds come from
// classifyDynamics, unchanged. Collisions are aimed: the second seed sits where the first one's mover is half way
// through its read rounds, so movers meet on every geometry, not only on the line.
//
// Seeds and starts are structured, never random: fixed seed shapes along an outward chain of tiles, de Bruijn
// backgrounds, half-ball domain walls.

import {
  DifferenceTrack,
  DynamicsLabel,
  DynamicsVerdict,
  LabReading,
  SeedMotion,
  classifyDynamics,
  deBruijnTones,
  graphDistances,
  labReading,
  maxToneEntropy,
  pairEntropy,
  periodGrowthFit,
  seedMotion,
  toneEntropy,
} from '@/code/measure/lab-measures'
import {
  PairTable,
  commutesWithNegation,
  commutesWithSwap,
  conservesExcitation,
  fixesVacuum,
  inverseTable,
  pairTones,
} from '@/code/rule/pair-rule'
import {
  PartitionSchedule,
  buildPartitionSchedule,
  checkSchedule,
  ringSchedule,
} from '@/code/rule/partition-schedule'
import { cycleStructure, globalPermutation } from '@/code/rule/partitioned-pair'
import {
  LazyRun,
  LazySpace,
  cosetSpace,
  latticeSpace,
  permutedSpace,
  rightAngledSpace,
  roundColors,
  spaceBall,
} from '@/code/compute/lab/lazy-space'
import {
  clearChamberComplexes,
  tilingSystem,
} from '@/code/substrate/coxeter/chamber-tiling'
import {
  LAB_GEOMETRIES,
  LabGeometryName,
  LabGeometrySpec,
  labGeometry,
} from '@/code/substrate/lab-geometry'
import {
  REFERENCE_CELLS,
  ballSystole,
  closedQuotients,
  d4Torus,
  findRotaryMap,
  hexagonTorus,
  referenceTiling,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { torusGrid } from '@/code/substrate/torus-grid'
import { spinCharge, spinExcitation } from '@/code/tone/algebra'

// ---- parameters, fixed before the first run ----

export const SEED_ROUNDS = 24
// a seed, collision or damage run read over fewer exact rounds than this counts as unread
export const MIN_READ_ROUNDS = 4
export const COLLISION_GAP = 16
export const DAMAGE_ROUNDS = 40
export const DAMAGE_SITES = 8
// entropy rounds = clamp(ENTROPY_WORK / edges, 64, 2048), late window the last quarter
export const ENTROPY_WORK = 500_000
// a start counts as low-entropy only when its own pair entropy is at most this fraction of the sector ceiling: on a
// small quotient graph a half-ball wall cuts so many edges that it starts near the ceiling and cannot show a rise
export const ENTROPY_LOW_START = 0.6
export const ENTROPY_MIN_ROUNDS = 64
export const ENTROPY_MAX_ROUNDS = 2048
// recurrence budget = clamp(RECURRENCE_WORK / edges, entropy rounds, RECURRENCE_MAX_ROUNDS)
export const RECURRENCE_WORK = 1_000_000
export const RECURRENCE_MAX_ROUNDS = 100_000
// dense collision runs on a live vacuum are capped at COLLISION_WORK / (3 * SEED_ROUNDS * edges) orbits, at least 4
export const COLLISION_WORK = 40_000_000
export const COLLISION_MIN_ORBITS = 4
// the line ring: the order-5 de Bruijn length plus one, an even ring, as E-CMP-0025's damage ring
export const LINE_RING = 244
// rings whose exact cycle structure gives the line's period exponent (a least-squares fit over all four),
// and the exponent ceiling (E-CMP-0025)
export const LINE_EXPONENT_SIZES = [6, 8, 10, 12] as const
export const PERIOD_EXPONENT_CEILING = 3
// open balls: hyperbolic radius as large as the source patch holds, flat radius large enough for the a-priori window
// up to this many cells, the flat 4D ball at a fixed radius
export const OPEN_HYPERBOLIC_MAX_RADIUS = 24
export const OPEN_FLAT_CELL_CAP = 90_000
export const OPEN_HYPERBOLIC_CELL_CAP = OPEN_FLAT_CELL_CAP
export const OPEN_FLAT_4D_RADIUS = 7
// lazy open windows: a run whose support passes this many cells stops, its rounds
// so far exact; the stop is a budget, recorded apart from any window
export const LAZY_SUPPORT_CAP = 20_000

export type ColorOrder = 'forward' | 'reverse'

export const COLOR_ORDERS: readonly ColorOrder[] = ['forward', 'reverse']

// ---- rules ----

export type HarnessRule = {
  name: string
  table: PairTable
  // the decoded output tones of every pair index
  first: Int8Array
  second: Int8Array
  vacuumFixing: boolean
  swapSymmetric: boolean
  negationSymmetric: boolean
}

export function harnessRule(input: {
  name: string
  table: PairTable
}): HarnessRule {
  const first = new Int8Array(9)
  const second = new Int8Array(9)

  for (let p = 0; p < 9; p++) {
    const [a, b] = pairTones(input.table[p]!)

    first[p] = a
    second[p] = b
  }

  return {
    name: input.name,
    table: input.table,
    first,
    second,
    vacuumFixing: fixesVacuum(input.table),
    swapSymmetric: commutesWithSwap(input.table),
    negationSymmetric: commutesWithNegation(input.table),
  }
}

// whether the rule leaves the uniform pair (b, b) in place: always for b = +-1 (the only pair of its charge), and for
// b = 0 exactly when the rule fixes the vacuum
export function fixesBackground(rule: HarnessRule, bg: number): boolean {
  const p = (bg + 1) * 4

  return rule.first[p] === bg && rule.second[p] === bg
}

// ---- schedules ----

export type LabSchedule = {
  schedule: PartitionSchedule
  // partner[c][v]: the cell matched with v in the c-th matching of the round, -1 when none
  partner: Int32Array[]
  // isFirst[c][v] = 1 when v is the first cell of its pair in matching c
  isFirst: Uint8Array[]
  // every oriented pair of the round, all matchings concatenated
  pairs: Int32Array
}

function labSchedule(schedule: PartitionSchedule): LabSchedule {
  const n = schedule.size
  const partner: Int32Array[] = []
  const isFirst: Uint8Array[] = []
  const all: number[] = []

  for (const m of schedule.matchings) {
    const p = new Int32Array(n).fill(-1)
    const f = new Uint8Array(n)

    for (let k = 0; k < m.length; k += 2) {
      const i = m[k]!
      const j = m[k + 1]!

      p[i] = j
      p[j] = i
      f[i] = 1
      all.push(i, j)
    }

    partner.push(p)
    isFirst.push(f)
  }

  return { schedule, partner, isFirst, pairs: Int32Array.from(all) }
}

// ---- instances ----

export type LabBoundaryKind = 'openBall' | 'closed'

export type LabInstance = {
  key: string
  column: LabGeometryName
  name: string
  boundary: LabBoundaryKind
  degree: number
  curvature: 'flat' | 'hyperbolic'
  matchedControl: LabGeometryName | null
  size: number
  neighbors: number[][]
  // hop distance from cell 0 (the origin) and the number of cells within r hops of it
  distance: Int32Array
  ballSize: Int32Array
  // open: the ball radius and the outer shell; closed: -1 and no shell
  radius: number
  shell: Uint8Array | null
  // closed: the injectivity radius (ballSystole: every ball of this radius is the tiling's), whether it is only a lower
  // bound, and the loop systole L (the shortest non-contractible loop); quotient distance equals cover distance up to
  // L / 2 (tiling-quotient.ts)
  systole: number | null
  systoleLowerBound: boolean
  loopSystole: number | null
  // the schedule's family (generator, step-parity, lifted, greedy, ring) and which variant of it (base, a lifted
  // coloring's place in the search order, a color-order permutation)
  scheduleFamily: string
  scheduleVariant: string
  construction: string
  orientation: string
  // an automorphism that maps every matching to itself with its orientation reversed (the ring's reflection), so start
  // sets can be closed under it; null when none is known
  mirror: Int32Array | null
  schedules: Record<ColorOrder, LabSchedule>
  // the forward schedule with every pair's orientation reversed (the P gate)
  reversedOrientation: LabSchedule
  colorCount: number
  edges: number
  // the anchor of the second seed of a collision, and its distance from the origin
  collisionAnchor: number
  collisionGap: number
  // open balls: cells within this radius of the origin form the dense damage patch
  patchRadius: number
  // closed: the partner instance of equal size and degree and the other curvature, by name
  partner: string | null
  // a lazy open window: readings run on the infinite tiling grown where the excitation is, and the instance's own
  // graph is its materialized ball of radius `radius` (cells in the space's canonical order), kept for the gates, for
  // the collision gap and patch, and as the dense side of the lazy-equals-dense gate
  lazy: LazyOpen | null
}

export type LazyOpen = {
  // a fresh space each call (a reading's memory is dropped with it)
  makeSpace: () => LazySpace
  // the address of every ball cell, in instance index order
  addresses: string[]
}

const lowerFirst = (u: number, v: number): [number, number] =>
  u < v ? [u, v] : [v, u]

function bfsOrder(distance: Int32Array): number[] {
  return Array.from(distance.keys())
    .filter(v => distance[v]! >= 0)
    .sort((a, b) => distance[a]! - distance[b]! || a - b)
}

function cumulativeBall(distance: Int32Array): Int32Array {
  let max = 0

  for (const d of distance) {
    max = Math.max(max, d)
  }

  const out = new Int32Array(max + 2)

  for (const d of distance) {
    if (d >= 0) {
      out[d] = out[d]! + 1
    }
  }

  for (let d = 1; d < out.length; d++) {
    out[d] = out[d]! + out[d - 1]!
  }

  return out
}

function makeInstance(input: {
  column: LabGeometryName
  name: string
  boundary: LabBoundaryKind
  spec: LabGeometrySpec
  degree: number
  curvature: 'flat' | 'hyperbolic'
  neighbors: number[][]
  radius: number
  systole: number | null
  systoleLowerBound?: boolean
  loopSystole?: number | null
  scheduleFamily: string
  scheduleVariant?: string
  construction: string
  ring: boolean
  gap: number
  patchRadius: number
  partner: string | null
  // a schedule given by the tiling (the lazy spaces' coloring restricted to the ball): its matchings in forward color
  // order, each pair (first, second)
  given?: {
    matchings: Int32Array[]
    orientation: string
    method?: PartitionSchedule['method']
  }
  lazy?: LazyOpen
}): LabInstance {
  const neighbors = input.neighbors
  const n = neighbors.length
  const distance = graphDistances({ neighbors, origin: 0 })
  const orient = input.ring
    ? (u: number, v: number): [number, number] =>
        v === u + 1 ? [u, v] : [v, u]
    : lowerFirst
  const given = input.given
  const orientation = given
    ? given.orientation
    : input.ring
      ? 'left-to-right (i, i + 1 mod n)'
      : 'lower cell index first'

  const fromGiven = (order: ColorOrder, reverse: boolean): PartitionSchedule => {
    const colors = given!.matchings.map((_, c) => c)
    const colorOrder = order === 'forward' ? colors : [...colors].reverse()

    return {
      size: n,
      matchings: colorOrder.map(c => {
        const m = given!.matchings[c]!

        if (!reverse) {
          return m
        }

        const out = new Int32Array(m.length)

        for (let k = 0; k < m.length; k += 2) {
          out[k] = m[k + 1]!
          out[k + 1] = m[k]!
        }

        return out
      }),
      method: given!.method ?? 'generator-coloring',
      colorCount: colors.length,
      colorOrder,
      orientation: reverse ? `reversed ${orientation}` : orientation,
    }
  }

  const build = (order: ColorOrder, reverse: boolean): LabSchedule =>
    labSchedule(
      given
        ? fromGiven(order, reverse)
        : input.ring && !reverse
          ? ringSchedule({ neighbors, colorOrder: order })
          : buildPartitionSchedule({
              neighbors,
              orient: reverse
                ? (u, v) => {
                    const [a, b] = orient(u, v)

                    return [b, a]
                  }
                : orient,
              orientation: reverse ? `reversed ${orientation}` : orientation,
              colorOrder: order,
            }),
    )
  const schedules = {
    forward: build('forward', false),
    reverse: build('reverse', false),
  }
  const shell =
    input.boundary === 'openBall'
      ? Uint8Array.from(distance, d => (d === input.radius ? 1 : 0))
      : null

  // the collision anchor: the LAST cell (highest index) at the gap distance, so it lies off the origin's chain
  let anchor = -1

  for (let v = 0; v < n; v++) {
    if (distance[v] === input.gap) {
      anchor = v
    }
  }

  const mirror = input.ring
    ? Int32Array.from({ length: n }, (_, i) => n - 1 - i)
    : null

  let edges = 0

  for (const row of neighbors) {
    edges += row.length
  }

  return {
    key: `${input.column}|${input.boundary}|${input.name}`,
    systoleLowerBound: input.systoleLowerBound ?? false,
    loopSystole: input.loopSystole ?? null,
    scheduleFamily: input.scheduleFamily,
    scheduleVariant: input.scheduleVariant ?? 'base',
    column: input.column,
    name: input.name,
    boundary: input.boundary,
    degree: input.degree,
    curvature: input.curvature,
    matchedControl: input.spec.matchedControl,
    size: n,
    neighbors,
    distance,
    ballSize: cumulativeBall(distance),
    radius: input.radius,
    shell,
    systole: input.systole,
    construction: input.construction,
    orientation,
    mirror,
    schedules,
    reversedOrientation: build('forward', true),
    colorCount: schedules.forward.schedule.colorCount,
    edges: edges / 2,
    collisionAnchor: anchor,
    collisionGap: input.gap,
    patchRadius: input.patchRadius,
    partner: input.partner,
    lazy: input.lazy ?? null,
  }
}

function tryOpen(name: LabGeometryName, radius: number): number[][] | null {
  try {
    // hyperbolic balls come from the exact chamber tiling, capped at the flat balls' cell budget
    const g = labGeometry({
      name,
      boundary: 'openBall',
      radius,
      exact: true,
      maxCells: OPEN_HYPERBOLIC_CELL_CAP,
    })

    return g.graph.neighbors.map(row => Array.from(row))
  } catch {
    return null
  }
}

// The geometries read on coset tilings (E-CMP-0035): the q-odd tilings with no
// right-angled tile group, and the flat partners of {4,5} and {3,7}, so every matched pair is read on lazy windows.
export const COSET_LAZY_GEOMETRIES: ReadonlySet<LabGeometryName> = new Set<LabGeometryName>([
  '{7,3}',
  '{8,3}',
  '{4,5}',
  '{3,7}',
  '{4,4}',
  '{3,6}',
])

// The lazy space of a geometry, or null when it has none: the right-angled tile groups ({5,4}, {6,4}, {3,4,3,4}), the
// flat lattices of the matched controls {6,3} and {3,4,3,3}, and the coset tilings of COSET_LAZY_GEOMETRIES.
export function lazySpaceFactory(name: LabGeometryName): (() => LazySpace) | null {
  if (COSET_LAZY_GEOMETRIES.has(name)) {
    const [p, q] = LAB_GEOMETRIES.find(g => g.name === name)!.symbol as [number, number]

    return () => cosetSpace({ name: `${name}/coset`, p, q })
  }

  if (name === '{5,4}' || name === '{6,4}' || name === '{3,4,3,4}') {
    const system = tilingSystem(
      LAB_GEOMETRIES.find(g => g.name === name)!.symbol,
      'tile',
    )!

    return () => rightAngledSpace({ name: system.name, coxeter: system.coxeter })
  }

  if (name === '{6,3}') {
    return () => latticeSpace({ name: '{6,3}/a2', kind: 'a2' })
  }

  if (name === '{3,4,3,3}') {
    return () => latticeSpace({ name: '{3,4,3,3}/d4', kind: 'd4' })
  }

  return null
}

// The family of a geometry's base lazy schedule.
export function lazyFamily(name: LabGeometryName): string {
  return COSET_LAZY_GEOMETRIES.has(name)
    ? 'lifted'
    : name === '{6,3}' || name === '{3,4,3,3}'
      ? 'step-parity'
      : 'generator'
}

export type LazyVariant = { variant: string; family: string; make: () => LazySpace }

// A color-order permutation that is neither a rotation nor a reversal of the base order (a rotation only shifts the
// round's phase): k -> s k mod c for the least s >= 2 prime to c other than c - 1. Exists for c >= 5.
export function strideOrder(c: number): number[] | null {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

  for (let s = 2; s < c - 1; s++) {
    if (gcd(s, c) === 1) {
      return Array.from({ length: c }, (_, k) => (k * s) % c)
    }
  }

  return null
}

// The schedule variants of a geometry's lazy window beyond its base: a second
// lifted coloring for every coset tiling; lifted colorings for {5,4}, {6,4} and {6,3}, so the degree-6 pair is also read
// in ONE family; a color-order permutation for the two degree-24 spaces, which have no second family here.
export function lazyVariants(name: LabGeometryName): LazyVariant[] {
  const [p, q] = LAB_GEOMETRIES.find(g => g.name === name)!.symbol as [number, number]
  const lifted = (variant: number): LazyVariant => ({
    variant: `lifted-${variant}`,
    family: 'lifted',
    make: () => cosetSpace({ name: `${name}/coset-${variant}`, p, q, variant }),
  })

  if (COSET_LAZY_GEOMETRIES.has(name)) {
    return [lifted(1)]
  }

  if (name === '{5,4}') {
    return [lifted(0)]
  }

  if (name === '{6,4}' || name === '{6,3}') {
    return [lifted(0), lifted(1)]
  }

  if (name === '{3,4,3,4}' || name === '{3,4,3,3}') {
    const base = lazySpaceFactory(name)!
    const order = strideOrder(base().colorCount)!
    const label = `stride-${order[1]}`

    return [
      {
        variant: label,
        family: lazyFamily(name),
        make: () => permutedSpace(base(), order, label),
      },
    ]
  }

  return []
}

// the largest hyperbolic radius the source patch holds whole
function hyperbolicRadius(name: LabGeometryName): number {
  let best = 0

  const make = lazySpaceFactory(name)
  const space = make ? make() : null

  for (let r = 2; r <= OPEN_HYPERBOLIC_MAX_RADIUS; r++) {
    if (
      space
        ? !spaceBall(space, r, OPEN_HYPERBOLIC_CELL_CAP)
        : !tryOpen(name, r)
    ) {
      break
    }

    best = r
  }

  if (best < 2) {
    throw new Error(`harness: ${name} holds no open ball of radius 2`)
  }

  return best
}

// gap and patch radius for a ball of radius R: the second seed's whole chain (four cells) inside R - 2 when the ball
// allows, the patch two hops deep at most and two hops inside the shell
function openGap(radius: number): number {
  return Math.min(COLLISION_GAP, Math.max(1, radius - 5))
}

function openPatch(radius: number): number {
  return Math.max(0, Math.min(2, radius - 2))
}

// A lazy open instance: readings run on the space's infinite tiling; the instance's graph is the space's own ball (the
// flat balls at the a-priori radius under the cell cap, the hyperbolic ones at the radius the exact balls had), with the
// space's schedule restricted to it.
function lazyInstance(input: {
  spec: LabGeometrySpec
  make: () => LazySpace
  gap: number
  patchRadius: number
  radius: number
  family: string
  variant: string
}): LabInstance {
  const { spec } = input
  const space = input.make()

  let radius =
    spec.curvature === 'hyperbolic'
      ? input.radius
      : spec.dimension === 4
        ? OPEN_FLAT_4D_RADIUS
        : input.gap + 3 + spec.degree * SEED_ROUNDS + 2
  let ball = spaceBall(space, radius, OPEN_FLAT_CELL_CAP)

  while (!ball && radius > 2) {
    radius--
    ball = spaceBall(space, radius, OPEN_FLAT_CELL_CAP)
  }

  if (!ball) {
    throw new Error(`harness: ${spec.name} lazy ball failed`)
  }

  return makeInstance({
    column: spec.name,
    name: input.variant === 'base' ? `lazy-${spec.name}` : `lazy-${spec.name}~${input.variant}`,
    boundary: 'openBall',
    spec,
    degree: spec.degree,
    curvature: spec.curvature,
    neighbors: ball.neighbors,
    radius,
    systole: null,
    scheduleFamily: input.family,
    scheduleVariant: input.variant,
    construction: `lazy exact tiling ${space.name}, grown where the excitation is; ${space.coloring}; gate ball of radius ${radius}`,
    ring: false,
    gap: input.gap,
    patchRadius: input.patchRadius,
    partner: null,
    given: { matchings: ball.matchings, orientation: space.orientation },
    lazy: {
      makeSpace: input.make,
      addresses: ball.cells.map(c => space.address(c)),
    },
  })
}

export function openInstances(): LabInstance[] {
  const hyperbolic = new Map<LabGeometryName, number>()

  for (const spec of LAB_GEOMETRIES) {
    if (spec.curvature === 'hyperbolic') {
      hyperbolic.set(spec.name, hyperbolicRadius(spec.name))
    }
  }

  const instances = LAB_GEOMETRIES.map(spec => {
    // a matched pair shares its collision gap and patch radius, set by the smaller (hyperbolic) ball
    const pairRadius =
      spec.curvature === 'hyperbolic'
        ? hyperbolic.get(spec.name)!
        : spec.matchedControl
          ? hyperbolic.get(spec.matchedControl)!
          : 2 * COLLISION_GAP
    const gap = spec.name === 'line' ? COLLISION_GAP : openGap(pairRadius)
    const patchRadius = openPatch(pairRadius)

    let radius = hyperbolic.get(spec.name) ?? 0
    let neighbors: number[][] | null = null

    const make = lazySpaceFactory(spec.name)

    if (make) {
      return lazyInstance({
        spec,
        make,
        gap,
        patchRadius,
        radius,
        family: lazyFamily(spec.name),
        variant: 'base',
      })
    }

    if (spec.curvature === 'flat') {
      // the a-priori window: the farthest seed cell (gap + 3) plus c * T hops plus the shell
      radius =
        spec.dimension === 4
          ? OPEN_FLAT_4D_RADIUS
          : gap + 3 + spec.degree * SEED_ROUNDS + 2
    }

    neighbors = tryOpen(spec.name, radius)

    while (
      spec.curvature === 'flat' &&
      (!neighbors || neighbors.length > OPEN_FLAT_CELL_CAP) &&
      radius > 2
    ) {
      radius--
      neighbors = tryOpen(spec.name, radius)
    }

    if (!neighbors) {
      throw new Error(`harness: ${spec.name} open ball of radius ${radius} failed`)
    }

    return makeInstance({
      column: spec.name,
      name: `ball-${spec.name}-r${radius}`,
      boundary: 'openBall',
      spec,
      degree: spec.degree,
      curvature: spec.curvature,
      neighbors,
      radius,
      systole: null,
      scheduleFamily: 'greedy',
      construction: `open ball of radius ${radius} from ${spec.curvature === 'hyperbolic' ? 'the exact chamber tiling' : spec.source}`,
      ring: false,
      gap,
      patchRadius,
      partner: null,
    })
  })

  // the lazily grown chamber complexes are only needed to cut the balls
  clearChamberComplexes()

  return instances
}

// The open instances of every schedule variant (lazyVariants), each with its base instance's gap, patch and radius.
export function openVariantInstances(base: readonly LabInstance[]): LabInstance[] {
  const out: LabInstance[] = []

  for (const b of base) {
    if (!b.lazy) {
      continue
    }

    const spec = LAB_GEOMETRIES.find(g => g.name === b.column)!

    for (const v of lazyVariants(b.column)) {
      out.push(
        lazyInstance({
          spec,
          make: v.make,
          gap: b.collisionGap,
          patchRadius: b.patchRadius,
          radius: b.radius,
          family: v.family,
          variant: v.variant,
        }),
      )
    }
  }

  return out
}

// The greedy edge coloring of a closed instance with the cells taken in reversed index order (cell v colored as
// n - 1 - v): another greedy coloring of the same graph, oriented lower cell index first as the base.
function relabelledGreedy(neighbors: readonly number[][]): Int32Array[] {
  const n = neighbors.length
  const flip = (v: number): number => n - 1 - v
  const relabelled = Array.from({ length: n }, (_, v) => neighbors[flip(v)]!.map(flip))
  const schedule = buildPartitionSchedule({
    neighbors: relabelled,
    orient: (u, v) => [flip(u), flip(v)],
    orientation: 'lower cell index first',
    colorOrder: 'forward',
  })

  return schedule.matchings.map(m => {
    const out = new Int32Array(m.length)

    for (let k = 0; k < m.length; k += 2) {
      const [a, b] = lowerFirst(m[k]!, m[k + 1]!)

      out[k] = a
      out[k + 1] = b
    }

    return out
  })
}

// One schedule variant per closed quotient (not the ring, whose line schedules E-CMP-0025 varies): the greedy coloring of
// the cells in reversed index order.
export function closedVariantInstances(closed: readonly LabInstance[]): LabInstance[] {
  return closed
    .filter(i => i.column !== 'line')
    .map(i =>
      makeInstance({
        column: i.column,
        name: `${i.name}~greedy-reversed`,
        boundary: 'closed',
        spec: LAB_GEOMETRIES.find(g => g.name === i.column)!,
        degree: i.degree,
        curvature: i.curvature,
        neighbors: i.neighbors,
        radius: -1,
        systole: i.systole,
        systoleLowerBound: i.systoleLowerBound,
        loopSystole: i.loopSystole,
        scheduleFamily: 'greedy',
        scheduleVariant: 'greedy-reversed',
        construction: `${i.construction}; greedy coloring of the cells in reversed index order`,
        ring: false,
        gap: i.collisionGap,
        patchRadius: 0,
        partner: i.partner,
        given: {
          matchings: relabelledGreedy(i.neighbors),
          orientation: 'lower cell index first',
          method: 'greedy-edge-coloring',
        },
      }),
    )
}

// The injectivity radius and loop systole of the ring of n cells against the infinite line (a path with the origin in
// the middle), computed like every quotient's, never typed.
export function ringSystole(n: number): { systole: number; lowerBound: boolean; loopSystole: number | null } {
  const half = n + 4
  // cell 0 the origin, cell 2k - 1 at +k, cell 2k at -k
  const index = (x: number): number => (x === 0 ? 0 : x > 0 ? 2 * x - 1 : -2 * x)
  const path: number[][] = []

  for (let x = -half; x <= half; x++) {
    path[index(x)] = [x - 1, x + 1].filter(y => Math.abs(y) <= half).map(index)
  }

  const s = ballSystole({
    neighbors: torusGrid(1, n).map(row => Array.from(row)),
    reference: path,
    referenceDegree: 2,
    centers: [0],
  })

  return { systole: s.systole, lowerBound: s.lowerBound, loopSystole: s.loopSystole }
}

const SYMBOL_COLUMN = new Map<string, LabGeometryName>(
  LAB_GEOMETRIES.map(g => [g.symbol.join(','), g.name]),
)

export function closedInstances(): LabInstance[] {
  const line = LAB_GEOMETRIES.find(g => g.name === 'line')!
  const lineSystole = ringSystole(LINE_RING)
  const ring = makeInstance({
    column: 'line',
    name: `ring-${LINE_RING}`,
    boundary: 'closed',
    spec: line,
    degree: 2,
    curvature: 'flat',
    neighbors: torusGrid(1, LINE_RING).map(row => Array.from(row)),
    radius: -1,
    systole: lineSystole.systole,
    systoleLowerBound: lineSystole.lowerBound,
    loopSystole: lineSystole.loopSystole,
    scheduleFamily: 'ring',
    construction: `ring of ${LINE_RING} cells (torusGrid)`,
    ring: true,
    gap: COLLISION_GAP,
    patchRadius: 0,
    partner: null,
  })
  const out = [ring]

  for (const entry of closedQuotients()) {
    const q = entry.quotient
    const column = SYMBOL_COLUMN.get(q.symbol.join(','))

    if (!column) {
      throw new Error(`harness: no lab column for ${q.name}`)
    }

    const spec = LAB_GEOMETRIES.find(g => g.name === column)!
    const distance = graphDistances({ neighbors: q.neighbors, origin: 0 })

    let eccentricity = 0

    for (const d of distance) {
      eccentricity = Math.max(eccentricity, d)
    }

    out.push(
      makeInstance({
        column,
        name: q.name,
        boundary: 'closed',
        spec,
        degree: q.degree,
        curvature: q.curvature,
        neighbors: q.neighbors.map(row => [...row]),
        radius: -1,
        systole: q.systole,
        systoleLowerBound: q.systoleLowerBound,
        loopSystole: q.loopSystole,
        scheduleFamily: 'greedy',
        construction: q.construction,
        ring: false,
        gap: Math.min(COLLISION_GAP, eccentricity),
        patchRadius: 0,
        partner: q.partner,
      }),
    )
  }

  return out
}

// ---- seeds ----

// A seed: one or two cells set off a uniform background, placed on a chain of tiles c0, c1, c2, c3 that walks away
// from the origin (each step the neighbor farthest from cell 0 not yet on the chain, ties by lowest index). The six
// shapes are the line's: single cells at c0 and c1, pairs (c0 c1), (c0 c2), (c1 c2), (c1 c3).
export const SEED_SHAPES: readonly { name: string; cells: number[] }[] = [
  { name: 'a', cells: [0] },
  { name: 'b', cells: [1] },
  { name: 'ab', cells: [0, 1] },
  { name: 'ac', cells: [0, 2] },
  { name: 'bc', cells: [1, 2] },
  { name: 'bd', cells: [1, 3] },
]

export type SeedDef = {
  key: string
  background: number
  shape: string
  // chain positions and the tones put there
  positions: number[]
  values: number[]
  // positions index the breadth-first order of the anchor's ball instead of the chain (the extended census)
  ball?: boolean
}

export function seedDefinitions(): SeedDef[] {
  const out: SeedDef[] = []

  for (const background of [-1, 0, 1]) {
    const tones = [-1, 0, 1].filter(t => t !== background)

    for (const shape of SEED_SHAPES) {
      const combos: number[][] =
        shape.cells.length === 1
          ? tones.map(t => [t])
          : tones.flatMap(t => tones.map(u => [t, u]))

      for (const values of combos) {
        out.push({
          key: `${background}|${shape.name}:${values.join(',')}`,
          background,
          shape: shape.name,
          positions: shape.cells,
          values,
        })
      }
    }
  }

  return out
}

export const SEEDS = seedDefinitions()

export function negatedSeedKey(s: SeedDef): string {
  return `${-s.background}|${s.shape}:${s.values.map(v => -v).join(',')}`
}

export function chain(inst: LabInstance, anchor: number): number[] {
  const out = [anchor]

  while (out.length < 4) {
    const last = out[out.length - 1]!

    let best = -1

    for (const w of inst.neighbors[last]!) {
      if (out.includes(w)) {
        continue
      }

      if (
        best < 0 ||
        inst.distance[w]! > inst.distance[best]! ||
        (inst.distance[w] === inst.distance[best] && w < best)
      ) {
        best = w
      }
    }

    if (best < 0) {
      break
    }

    out.push(best)
  }

  return out
}

// The first `count` cells of the anchor's breadth-first order (neighbors in the instance's own order), with the hop
// distance of each from the anchor: the frame the extended census places its supports in.
export function ballOrder(inst: LabInstance, anchor: number, count: number): number[] {
  return ballLayers(inst, anchor, count).cells
}

function ballLayers(
  inst: LabInstance,
  anchor: number,
  count: number,
): { cells: number[]; hops: number[] } {
  const cells = [anchor]
  const hops = [0]
  const seen = new Set(cells)

  for (let k = 0; k < cells.length && cells.length < count; k++) {
    for (const w of inst.neighbors[cells[k]!]!) {
      if (!seen.has(w) && cells.length < count) {
        seen.add(w)
        cells.push(w)
        hops.push(hops[k]! + 1)
      }
    }
  }

  return { cells, hops }
}

// ---- the extended seed census ----
//
// A closed reading that the 60 seeds leave unresolved with no collidable pair is read again on a larger seed set,
// built systematically and never chosen by hand: every support that contains the anchor and lies inside its
// radius-`radius` ball, with at most `size` cells, every off-background tone on every cell, on all three uniform
// backgrounds. The family is closed under the negation C (all backgrounds, all tones) and the orientation reversal P
// reads the same family, since a support is a set of cells. Levels run in this fixed order and the family at a level is
// the union of every level read so far; the census stops at the first level where a collidable pair exists, else it
// reports the levels read as its exhaustive bound. The collisions it runs are the pairs with a one-cell member.
// A live (dense) background costs a full-instance run per seed, so it is searched only up to DENSE_LEVEL_LIMIT cells
// of support, and a level whose family holds more than EXTENDED_SEED_BUDGET seeds is not run (the census stops at the
// level before it): the bound reached is stated with every result.
export const EXTENDED_SEED_LEVELS: readonly { radius: number; size: number }[] = [
  { radius: 1, size: 2 },
  { radius: 1, size: 3 },
  { radius: 2, size: 2 },
  { radius: 2, size: 3 },
  { radius: 2, size: 4 },
  { radius: 3, size: 4 },
  { radius: 3, size: 5 },
]
export const DENSE_LEVEL_LIMIT = 2
export const EXTENDED_SEED_BUDGET = 200_000

export type ExtendedLevel = { radius: number; size: number }

// the seeds of one level of the extended census on one instance, in canonical order (background, support size,
// positions lexicographic, tones lexicographic)
export function extendedSeeds(inst: LabInstance, level: ExtendedLevel, denseBackground: (bg: number) => boolean): SeedDef[] {
  const { cells, hops } = ballLayers(inst, 0, Number.POSITIVE_INFINITY)
  const inside = cells.filter((_, k) => hops[k]! <= level.radius).length
  const out: SeedDef[] = []
  const supports: number[][] = []

  const grow = (support: number[]): void => {
    supports.push(support)

    if (support.length >= level.size) {
      return
    }

    for (let p = support[support.length - 1]! + 1; p < inside; p++) {
      grow([...support, p])
    }
  }

  grow([0])
  supports.sort((a, b) => a.length - b.length || compareLists(a, b))

  for (const background of [-1, 0, 1]) {
    const tones = [-1, 0, 1].filter(t => t !== background)
    const sizeCap = denseBackground(background) ? Math.min(level.size, DENSE_LEVEL_LIMIT) : level.size

    for (const positions of supports) {
      if (positions.length > sizeCap) {
        continue
      }

      const combos = positions.reduce<number[][]>(
        acc => acc.flatMap(c => tones.map(t => [...c, t])),
        [[]],
      )

      for (const values of combos) {
        out.push({
          key: `${background}|x${positions.join('.')}:${values.join(',')}`,
          background,
          shape: `x${positions.join('.')}`,
          positions,
          values,
          ball: true,
        })
      }
    }
  }

  return out
}

// the number of seeds extendedSeeds would return, counted without building them
export function extendedSeedCount(
  inst: LabInstance,
  level: ExtendedLevel,
  denseBackground: (bg: number) => boolean,
): number {
  const { hops } = ballLayers(inst, 0, Number.POSITIVE_INFINITY)
  const others = hops.filter(h => h <= level.radius).length - 1

  let total = 0

  for (const background of [-1, 0, 1]) {
    const sizeCap = denseBackground(background) ? Math.min(level.size, DENSE_LEVEL_LIMIT) : level.size

    // supports through the anchor with k further cells, two tones on each of the k + 1 cells
    let choose = 1

    for (let k = 0; k < sizeCap; k++) {
      total += choose * 2 ** (k + 1)
      choose = (choose * (others - k)) / (k + 1)
    }
  }

  return total
}

function compareLists(a: readonly number[], b: readonly number[]): number {
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    if (a[k] !== b[k]) {
      return a[k]! - b[k]!
    }
  }

  return a.length - b.length
}

// the cells of a seed placed at an anchor, or null when its chain is too short or (open ball) a cell lies within two
// hops of the shell, where a static seed could already touch the edge
function seedCells(
  inst: LabInstance,
  seed: SeedDef,
  anchor: number,
): number[] | null {
  if (anchor < 0) {
    return null
  }

  const c = seed.ball
    ? ballOrder(inst, anchor, Math.max(...seed.positions) + 1)
    : chain(inst, anchor)
  const cells: number[] = []

  for (const p of seed.positions) {
    const cell = c[p]

    if (cell === undefined) {
      return null
    }

    if (inst.shell && inst.distance[cell]! > inst.radius - 2) {
      return null
    }

    cells.push(cell)
  }

  return cells
}

// ---- runs ----

// one dense round in place
export function denseRound(
  rule: HarnessRule,
  s: LabSchedule,
  state: Int8Array,
): void {
  const { first, second } = rule

  for (const m of s.schedule.matchings) {
    for (let k = 0; k < m.length; k += 2) {
      const i = m[k]!
      const j = m[k + 1]!
      const p = (state[i]! + 1) * 3 + state[j]! + 1

      state[i] = first[p]!
      state[j] = second[p]!
    }
  }
}

export function denseInverseRound(
  inverse: HarnessRule,
  s: LabSchedule,
  state: Int8Array,
): void {
  const m = s.schedule.matchings

  for (let c = m.length - 1; c >= 0; c--) {
    const pairs = m[c]!

    for (let k = 0; k < pairs.length; k += 2) {
      const i = pairs[k]!
      const j = pairs[k + 1]!
      const p = (state[i]! + 1) * 3 + state[j]! + 1

      state[i] = inverse.first[p]!
      state[j] = inverse.second[p]!
    }
  }
}

// A run on a background the rule leaves in place: only pairs with a cell off the background are updated. With a
// shell (open ball) it also watches the window: `broken` is set the moment a shell cell leaves the background.
export class SparseRun {
  readonly state: Int8Array
  readonly background: number
  list: Int32Array
  count = 0
  readonly inList: Uint8Array
  readonly stamp: Int32Array
  tick = 0
  broken = false
  // rounds completed with the window intact
  exact = 0
  readonly shell: Uint8Array | null

  constructor(size: number, background: number, shell: Uint8Array | null) {
    this.state = new Int8Array(size).fill(background)
    this.background = background
    this.list = new Int32Array(size)
    this.inList = new Uint8Array(size)
    this.stamp = new Int32Array(size)
    this.shell = shell
  }

  set(cell: number, tone: number): void {
    this.state[cell] = tone

    if (tone !== this.background && !this.inList[cell]) {
      this.list[this.count++] = cell
      this.inList[cell] = 1
    }

    if (this.shell?.[cell] && tone !== this.background) {
      this.broken = true
    }
  }

  compact(): void {
    let n = 0

    for (let k = 0; k < this.count; k++) {
      const v = this.list[k]!

      if (this.state[v] !== this.background) {
        this.list[n++] = v
      } else {
        this.inList[v] = 0
      }
    }

    this.count = n
  }

  round(rule: HarnessRule, s: LabSchedule): void {
    const { first, second } = rule
    const { state, shell, background } = this

    for (let c = 0; c < s.partner.length; c++) {
      const partner = s.partner[c]!
      const isFirst = s.isFirst[c]!

      this.compact()
      this.tick++

      const end = this.count

      for (let k = 0; k < end; k++) {
        const u = this.list[k]!
        const v = partner[u]!

        if (v < 0 || this.stamp[u] === this.tick) {
          continue
        }

        this.stamp[u] = this.tick
        this.stamp[v] = this.tick

        const i = isFirst[u] ? u : v
        const j = i === u ? v : u
        const p = (state[i]! + 1) * 3 + state[j]! + 1

        state[i] = first[p]!
        state[j] = second[p]!

        if (state[v] !== background && !this.inList[v]) {
          this.list[this.count++] = v
          this.inList[v] = 1
        }

        if (
          shell &&
          ((shell[i] && state[i] !== background) ||
            (shell[j] && state[j] !== background))
        ) {
          this.broken = true
        }
      }
    }

    this.compact()

    if (!this.broken) {
      this.exact++
    }
  }
}

function emptyTrack(): DifferenceTrack {
  return { count: [], radius: [], innerRadius: [], fill: [] }
}

function pushRead(
  track: DifferenceTrack,
  count: number,
  radius: number,
  inner: number,
  ballSize: Int32Array,
): void {
  track.count.push(count)
  track.radius.push(radius)
  track.innerRadius.push(inner)
  track.fill.push(
    radius < 0 ? 0 : count / ballSize[Math.min(radius, ballSize.length - 1)]!,
  )
}

// the difference of a sparse run from its own uniform background
function readSparse(
  run: SparseRun,
  distance: Int32Array,
  ballSize: Int32Array,
  track: DifferenceTrack,
): void {
  let radius = -1
  let inner = -1

  for (let k = 0; k < run.count; k++) {
    const d = distance[run.list[k]!]!

    radius = Math.max(radius, d)
    inner = inner < 0 ? d : Math.min(inner, d)
  }

  pushRead(track, run.count, radius, inner, ballSize)
}

// the difference of two sparse runs on the same background
function readSparsePair(
  a: SparseRun,
  b: SparseRun,
  distance: Int32Array,
  ballSize: Int32Array,
  track: DifferenceTrack,
  mark: Int32Array,
  tick: number,
): void {
  let count = 0
  let radius = -1
  let inner = -1

  for (const run of [a, b]) {
    for (let k = 0; k < run.count; k++) {
      const v = run.list[k]!

      if (mark[v] === tick) {
        continue
      }

      mark[v] = tick

      if (a.state[v] !== b.state[v]) {
        const d = distance[v]!

        count++
        radius = Math.max(radius, d)
        inner = inner < 0 ? d : Math.min(inner, d)
      }
    }
  }

  pushRead(track, count, radius, inner, ballSize)
}

function readDense(
  a: Int8Array,
  b: Int8Array,
  distance: Int32Array,
  ballSize: Int32Array,
  track: DifferenceTrack,
): void {
  let count = 0
  let radius = -1
  let inner = -1

  for (let v = 0; v < a.length; v++) {
    if (a[v] !== b[v]) {
      const d = distance[v]!

      count++
      radius = Math.max(radius, d)
      inner = inner < 0 ? d : Math.min(inner, d)
    }
  }

  pushRead(track, count, radius, inner, ballSize)
}

function equalStates(a: Int8Array, b: Int8Array): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

// ---- readings ----

export type SeedReading = {
  key: string
  // the rounds read exactly (SEED_ROUNDS on a closed instance)
  exact: number
  initialRadius: number
  track: DifferenceTrack
}

export type CollisionReading = {
  first: string
  second: string
  testable: boolean
  exact: number
  // the first round at which the joint run differs from the sum of the two single runs, -1 when none was seen
  firstFailure: number
}

export type DamageReading = {
  // start (0 the dense start, 1 its negation, 2 and 3 the mirror images), flip site index and tone shift
  start: number
  site: number
  delta: number
  exact: number
  track: DifferenceTrack
  ceilingViolations: number
}

export type EntropyReading = {
  rounds: number
  window: number
  // per start: the late ratio and the start's own ratio
  ratios: number[]
  startRatios: number[]
  // the lowest late ratio over the low-entropy starts, null when no start is low-entropy
  ratio: number | null
  recurrenceBudget: number
  // the exact recurrence time of each low-entropy start, -1 when it did not return within the budget
  recurrence: number[]
  vacuumPeriod: number
  readingStart: LabReading
  readingEnd: LabReading
}

export type HarnessNumbers = {
  seedKinds: Record<SeedMotion['kind'] | 'unread', number>
  seedsRun: number
  collisionsTested: number
  collisionsScattered: number
  collisionsUnread: number
  damageRuns: number
  damageUnread: number
  damageSpeed: number
  damageFill: number
  damageRadius: number
  damageRounds: number
  ceilingViolations: number
  entropyRatio: number | null
  periodExponent: number | null
  recurrenceMin: number | null
  recurrenceBudget: number | null
  vacuumPeriod: number | null
}

// The four labels of classifyDynamics plus two gated readings, given only to a reading classifyDynamics
// left unresolved and only with their proof: `confined` (open window: every seed's run returns exactly to its start,
// so its support stays in the union of the orbit's cells for every round) and `surface_limited` (closed quotient: no
// collidable pair exists here while a larger quotient of the same tiling has one, so the surface causes it; or every
// non-localized seed is a bounded particle whose quotient radius passed half the loop systole, past which quotient
// distance and cover distance can differ, so the radius track no longer reads distance on the cover).
export type HarnessLabelName = DynamicsLabel | 'confined' | 'surface_limited'

// the rounds a confined orbit may take to close
export const CONFINED_MAX_ROUNDS = 4 * SEED_ROUNDS

export type ConfinedOrbit = {
  seed: string
  // the least round at which the run's state equals its start, and the cells it holds at round ends over one period
  period: number
  cells: number
  // the cells reachable inside a round from those round-end supports through the round's matchings in order: an exact
  // bound on every intermediate support (a matching moves a tone only to its partner)
  hull: number
}

export type SurfaceMover = {
  seed: string
  maxRadius: number
  maxCount: number
}

// the larger quotient a no-collidable-pair gate was compared with, and the collidable pairs the same rule has there
export type LargerQuotient = { instance: string; cells: number; loopSystole: number | null; pairs: number }

export type LabelGate =
  | { kind: 'confined'; budget: number; orbits: ConfinedOrbit[] }
  | {
      kind: 'surface_limited'
      reason: 'no_collidable_pair'
      pairs: 0
      seedsRead: number
      larger: LargerQuotient
    }
  | {
      kind: 'surface_limited'
      reason: 'systole'
      injectivityRadius: number
      loopSystole: number
      movers: SurfaceMover[]
    }

export type HarnessLabel = {
  label: HarnessLabelName
  // mixing is undecided here and every measured part of it passes
  mixingOpen: boolean
  verdict: DynamicsVerdict
  numbers: HarnessNumbers
  // the proof behind a confined or surface_limited label, null for every other label
  gate: LabelGate | null
  // why a gate was tried on an unresolved reading and refused (null when none was tried or one was given)
  refused: string | null
}

export type HarnessReading = {
  rule: string
  instance: string
  order: ColorOrder
  boundary: LabBoundaryKind
  seeds: SeedReading[]
  collisions: CollisionReading[]
  damage: DamageReading[]
  damageCeiling: number
  entropy: EntropyReading | null
  periodExponent: number | null
  // exact rounds of the window gate (open): every round the sub-ball run called exact agreed with the full ball; on a
  // lazy instance, the light-cone gate (no run reached a cell beyond r0 + c t)
  windowAgreement: boolean
  result: HarnessLabel
  lazy: LazyStats | null
  // the extended census, when the 60 seeds left the reading unresolved with no collidable pair
  extended?: ExtendedSummary | null
}

export type ExtendedSummary = {
  level: ExtendedLevel
  levelIndex: number
  seeds: number
  seedsPerBackground: [number, number, number]
  pairs: number
  exists: boolean
  levels: ExtendedLevel[]
}

export type LazyStats = {
  runs: number
  // runs stopped on LAZY_SUPPORT_CAP (their rounds so far stay exact)
  budgetStops: number
  // the farthest partner beyond r0 + c t over every run (<= 0 when the light cone holds)
  coneExcess: number
  // partner lookups and the most cells one space held
  lookups: number
  maxCells: number
  // the farthest cell any seed reached from the origin, and its round
  maxSeedRadius: number
}

// ---- seeds and collisions on one run ----

type SeedRun = {
  // every state of the run, rounds 0..exact (dense runs and the window gate)
  sparse: SparseRun | null
  dense: Int8Array | null
}

function placeSeed(
  inst: LabInstance,
  rule: HarnessRule,
  seed: SeedDef,
  cells: number[],
  vacuum: Int8Array[] | null,
): SeedRun {
  if (fixesBackground(rule, seed.background)) {
    const run = new SparseRun(inst.size, seed.background, inst.shell)

    cells.forEach((c, k) => run.set(c, seed.values[k]!))

    return { sparse: run, dense: null }
  }

  // a live background (the vacuum of a creating rule, closed instances only): run densely against its history
  if (!vacuum || inst.shell) {
    throw new Error('harness: a live background needs a closed instance')
  }

  const state = Int8Array.from(vacuum[0]!)

  cells.forEach((c, k) => {
    state[c] = seed.values[k]!
  })

  return { sparse: null, dense: state }
}

function stepSeed(run: SeedRun, rule: HarnessRule, s: LabSchedule): void {
  if (run.sparse) {
    run.sparse.round(rule, s)
  } else {
    denseRound(rule, s, run.dense!)
  }
}

function seedReading(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
  seed: SeedDef,
  vacuum: Int8Array[] | null,
): SeedReading | null {
  const cells = seedCells(inst, seed, 0)

  if (!cells) {
    return null
  }

  const run = placeSeed(inst, rule, seed, cells, vacuum)
  const track = emptyTrack()
  const initialRadius = Math.max(...cells.map(c => inst.distance[c]!))

  let exact = 0

  const read = (t: number): void => {
    if (run.sparse) {
      readSparse(run.sparse, inst.distance, inst.ballSize, track)
    } else {
      readDense(run.dense!, vacuum![t]!, inst.distance, inst.ballSize, track)
    }
  }

  read(0)

  for (let t = 1; t <= SEED_ROUNDS; t++) {
    stepSeed(run, rule, s)

    if (run.sparse?.broken) {
      break
    }

    read(t)
    exact = t
  }

  return { key: seed.key, exact, initialRadius, track }
}

// Where to put the second seed so the first one's mover meets it: the farthest cell (from the origin, lowest index on
// ties) where the first seed's run differs from its background after half the rounds it is read for. A static or
// unmoved first seed gets the fixed collision anchor instead. On the line this is the fixed gap's reading; on a
// tiling of two or more dimensions a fixed anchor is mostly off the mover's path and nothing would ever meet.
export function aimedAnchor(input: {
  inst: LabInstance
  rule: HarnessRule
  s: LabSchedule
  seed: SeedDef
  reading: SeedReading | undefined
  vacuum: Int8Array[] | null
}): number {
  const { inst, rule, s, seed, reading, vacuum } = input

  if (!reading) {
    return inst.collisionAnchor
  }

  const rounds = Math.floor(Math.min(SEED_ROUNDS, reading.exact) / 2)

  if (rounds < 1 || seedKindAt(reading, Math.min(SEED_ROUNDS, reading.exact)) === 'static') {
    return inst.collisionAnchor
  }

  const cells = seedCells(inst, seed, 0)!
  const run = placeSeed(inst, rule, seed, cells, vacuum)

  for (let t = 0; t < rounds; t++) {
    stepSeed(run, rule, s)
  }

  let best = -1

  const consider = (v: number): void => {
    if (
      best < 0 ||
      inst.distance[v]! > inst.distance[best]! ||
      (inst.distance[v] === inst.distance[best] && v < best)
    ) {
      best = v
    }
  }

  if (run.sparse) {
    for (let k = 0; k < run.sparse.count; k++) {
      consider(run.sparse.list[k]!)
    }
  } else {
    for (let v = 0; v < inst.size; v++) {
      if (run.dense![v] !== vacuum![rounds]![v]) {
        consider(v)
      }
    }
  }

  return best >= 0 && inst.distance[best]! > reading.initialRadius
    ? best
    : inst.collisionAnchor
}

function collisionReading(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
  a: SeedDef,
  b: SeedDef,
  vacuum: Int8Array[] | null,
  anchor: number,
): CollisionReading | null {
  const ca = seedCells(inst, a, 0)
  const cb = seedCells(inst, b, anchor)

  if (!ca || !cb) {
    return null
  }

  const bg = a.background
  const one = placeSeed(inst, rule, a, ca, vacuum)
  const two = placeSeed(inst, rule, b, cb, vacuum)
  // the joint start: the two differences added on the background, testable only when every tone stays in range
  const both = placeSeed(inst, rule, a, ca, vacuum)
  const base = (v: number, t: number): number =>
    vacuum && !one.sparse ? vacuum[t]![v]! : bg
  const value = (r: SeedRun, v: number): number =>
    r.sparse ? r.sparse.state[v]! : r.dense![v]!

  for (const [k, c] of cb.entries()) {
    const sum = value(both, c) + b.values[k]! - base(c, 0)

    if (sum < -1 || sum > 1) {
      return {
        first: a.key,
        second: b.key,
        testable: false,
        exact: 0,
        firstFailure: -1,
      }
    }

    if (both.sparse) {
      both.sparse.set(c, sum)
    } else {
      both.dense![c] = sum
    }
  }

  const mark = new Int32Array(inst.size)

  let exact = 0
  let firstFailure = -1

  for (let t = 1; t <= SEED_ROUNDS && firstFailure < 0; t++) {
    for (const r of [one, two, both]) {
      stepSeed(r, rule, s)
    }

    if (one.sparse?.broken || two.sparse?.broken || both.sparse?.broken) {
      break
    }

    exact = t

    const check = (v: number): boolean =>
      value(both, v) - base(v, t) ===
      value(one, v) - base(v, t) + (value(two, v) - base(v, t))

    if (one.sparse) {
      for (const r of [one, two, both]) {
        for (let k = 0; k < r.sparse!.count; k++) {
          const v = r.sparse!.list[k]!

          if (mark[v] !== t) {
            mark[v] = t

            if (!check(v)) {
              firstFailure = t
            }
          }
        }
      }
    } else {
      for (let v = 0; v < inst.size; v++) {
        if (!check(v)) {
          firstFailure = t
          break
        }
      }
    }
  }

  return { first: a.key, second: b.key, testable: true, exact, firstFailure }
}

// ---- damage ----

function denseStart(inst: LabInstance): Int8Array {
  let k = 1

  while (3 ** k < inst.size) {
    k++
  }

  const tones = deBruijnTones(k)

  return Int8Array.from({ length: inst.size }, (_, v) => tones[v]!)
}

type DamageStart = { state: Int8Array; sites: number[] }

function damageStarts(inst: LabInstance): DamageStart[] {
  const negate = (s: Int8Array): Int8Array => s.map(x => -x)

  if (inst.boundary === 'closed') {
    const dense = denseStart(inst)
    const sites = Array.from({ length: DAMAGE_SITES }, (_, k) =>
      Math.floor((k * inst.size) / DAMAGE_SITES),
    )
    const out: DamageStart[] = [
      { state: dense, sites },
      { state: negate(dense), sites },
    ]
    const m = inst.mirror

    if (m) {
      const mirrored = Int8Array.from(dense, (_, v) => dense[m[v]!]!)
      const mirroredSites = sites.map(s => m[s]!)

      out.push(
        { state: mirrored, sites: mirroredSites },
        { state: negate(mirrored), sites: mirroredSites },
      )
    }

    return out
  }

  // open: a dense patch of the de Bruijn tones on the cells within patchRadius, vacuum outside
  const patch = bfsOrder(inst.distance).filter(
    v => inst.distance[v]! <= inst.patchRadius,
  )

  let k = 1

  while (3 ** k < patch.length) {
    k++
  }

  const tones = deBruijnTones(k)
  const state = new Int8Array(inst.size)

  patch.forEach((v, i) => {
    state[v] = tones[i]!
  })

  const sites = [
    ...new Set(
      Array.from(
        { length: DAMAGE_SITES },
        (_, j) => patch[Math.floor((j * patch.length) / DAMAGE_SITES)]!,
      ),
    ),
  ]

  return [
    { state, sites },
    { state: negate(state), sites },
  ]
}

function damageReadings(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
): DamageReading[] {
  const c = s.schedule.colorCount
  const out: DamageReading[] = []
  const starts = damageStarts(inst)

  starts.forEach((start, startIndex) => {
    start.sites.forEach((site, siteIndex) => {
      const distance = graphDistances({ neighbors: inst.neighbors, origin: site })
      const ballSize = cumulativeBall(distance)

      let eccentricity = 0

      for (const d of distance) {
        eccentricity = Math.max(eccentricity, d)
      }

      // closed: read until the front could wrap (eccentricity / c rounds, at least 1, at most DAMAGE_ROUNDS)
      const rounds =
        inst.boundary === 'closed'
          ? Math.min(DAMAGE_ROUNDS, Math.max(1, Math.floor(eccentricity / c)))
          : DAMAGE_ROUNDS

      for (const delta of [1, 2]) {
        const flipped = ((start.state[site]! + 1 + delta) % 3) - 1
        const track = emptyTrack()

        let exact = 0
        let ceilingViolations = 0

        if (inst.boundary === 'closed') {
          const a = Int8Array.from(start.state)
          const b = Int8Array.from(start.state)

          a[site] = flipped
          readDense(a, b, distance, ballSize, track)

          for (let t = 1; t <= rounds; t++) {
            denseRound(rule, s, a)
            denseRound(rule, s, b)
            readDense(a, b, distance, ballSize, track)
            exact = t
          }
        } else {
          const a = new SparseRun(inst.size, 0, inst.shell)
          const b = new SparseRun(inst.size, 0, inst.shell)

          start.state.forEach((tone, v) => {
            if (tone !== 0) {
              a.set(v, tone)
              b.set(v, tone)
            }
          })
          a.set(site, flipped)

          const mark = new Int32Array(inst.size)

          readSparsePair(a, b, distance, ballSize, track, mark, 1)

          for (let t = 1; t <= rounds; t++) {
            a.round(rule, s)
            b.round(rule, s)

            if (a.broken || b.broken) {
              break
            }

            readSparsePair(a, b, distance, ballSize, track, mark, t + 1)
            exact = t
          }
        }

        track.radius.forEach((r, t) => {
          if (r > c * t) {
            ceilingViolations++
          }
        })

        out.push({
          start: startIndex,
          site: siteIndex,
          delta,
          exact,
          track,
          ceilingViolations,
        })
      }
    })
  })

  return out
}

// ---- entropy, recurrence and the vacuum (closed) ----

function halfBallStarts(inst: LabInstance): Int8Array[] {
  const order = bfsOrder(inst.distance)
  const inside = new Uint8Array(inst.size)

  order.slice(0, Math.floor(inst.size / 2)).forEach(v => {
    inside[v] = 1
  })

  const wall = (a: number, b: number): Int8Array =>
    Int8Array.from(inside, x => (x ? a : b))
  const starts = [wall(1, -1), wall(-1, 1), wall(1, 0), wall(-1, 0)]
  const m = inst.mirror

  if (m) {
    return [
      ...starts,
      ...starts.map(s => Int8Array.from(s, (_, v) => s[m[v]!]!)),
    ]
  }

  return starts
}

function entropyReading(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
): EntropyReading {
  const rounds = Math.min(
    ENTROPY_MAX_ROUNDS,
    Math.max(ENTROPY_MIN_ROUNDS, Math.floor(ENTROPY_WORK / inst.edges)),
  )
  const window = rounds / 4
  const budget = Math.min(
    RECURRENCE_MAX_ROUNDS,
    Math.max(rounds, Math.floor(RECURRENCE_WORK / inst.edges)),
  )
  const dConserved = conservesExcitation(rule.table)
  const starts = halfBallStarts(inst)
  const ratios: number[] = []
  const startRatios: number[] = []
  const recurrence: number[] = []
  const edgeList: [number, number][] = []

  for (let k = 0; k < s.pairs.length; k += 2) {
    edgeList.push([s.pairs[k]!, s.pairs[k + 1]!])
  }

  let readingEnd: LabReading | null = null

  for (const start of starts) {
    const ceiling =
      2 *
      (dConserved
        ? toneEntropy(start)
        : maxToneEntropy(spinCharge(start) / inst.size))
    const state = Int8Array.from(start)

    startRatios.push(pairEntropy({ state, pairs: s.pairs }) / ceiling)

    let late = 0
    let back = -1

    for (let t = 1; t <= budget; t++) {
      denseRound(rule, s, state)

      if (t > rounds - window && t <= rounds) {
        late += pairEntropy({ state, pairs: s.pairs })
      }

      if (t === rounds && !readingEnd) {
        readingEnd = labReading({ state, edges: edgeList })
      }

      if (back < 0 && equalStates(state, start)) {
        back = t
      }

      if (t >= rounds && back >= 0) {
        break
      }
    }

    ratios.push(late / window / ceiling)
    recurrence.push(back)
  }

  const vacuum = new Int8Array(inst.size)
  const v = new Int8Array(inst.size)

  let vacuumPeriod = -1

  for (let t = 1; t <= budget; t++) {
    denseRound(rule, s, v)

    if (equalStates(v, vacuum)) {
      vacuumPeriod = t
      break
    }
  }

  const low = ratios.filter((_, k) => startRatios[k]! <= ENTROPY_LOW_START)

  return {
    rounds,
    window,
    ratios,
    startRatios,
    ratio: low.length > 0 ? Math.min(...low) : null,
    recurrenceBudget: budget,
    recurrence,
    vacuumPeriod,
    readingStart: labReading({ state: starts[0]!, edges: edgeList }),
    readingEnd: readingEnd!,
  }
}

// ---- the line's exact period exponent (the ring column only) ----

const lineSchedules = new Map<string, PartitionSchedule>()

export function linePeriodExponent(
  rule: HarnessRule,
  order: ColorOrder,
): number {
  const msp = LINE_EXPONENT_SIZES.map(n => {
    const key = `${n}:${order}`

    let schedule = lineSchedules.get(key)

    if (!schedule) {
      schedule = ringSchedule({ neighbors: torusGrid(1, n), colorOrder: order })
      lineSchedules.set(key, schedule)
    }

    const c = cycleStructure(globalPermutation({ table: rule.table, schedule }))

    if (!c.isPermutation) {
      throw new Error(`harness: ${rule.name} is not a permutation on ring ${n}`)
    }

    return c.meanStatePeriod
  })

  return periodGrowthFit({ sizes: LINE_EXPONENT_SIZES, meanPeriods: msp }).exponent
}

// ---- labels ----

export type ReadCaps = {
  // per seed key, per collision `${first}>${second}`, per damage `${start}:${site}:${delta}`: the rounds to read
  seed: (key: string) => number
  collision: (key: string) => number
  damage: (key: string) => number
}

export const collisionKey = (c: { first: string; second: string }): string =>
  `${c.first}>${c.second}`

export const damageKey = (d: {
  start: number
  site: number
  delta: number
}): string => `${d.start}:${d.site}:${d.delta}`

function slice(track: DifferenceTrack, rounds: number): DifferenceTrack {
  return {
    count: track.count.slice(0, rounds + 1),
    radius: track.radius.slice(0, rounds + 1),
    innerRadius: track.innerRadius.slice(0, rounds + 1),
    fill: track.fill.slice(0, rounds + 1),
  }
}

// The label of a reading, every item read to min(its own exact rounds, its cap; the cap defaults to the item's own
// exact rounds). A seed or collision read over fewer than MIN_READ_ROUNDS counts as `unread`; an unread seed goes to
// classifyDynamics as wandering, so it can never support frozen or ballistic, and ballistic with any unread collision
// or damage run is unresolved. Mixing needs exponential periods, which are undecided off the line ring (and entropy,
// undecided on an open ball or without a low-entropy start): classifyDynamics then never says mixing, and
// `mixingOpen` marks a run whose MEASURED mixing parts all pass, so mixing is not excluded there.
export function labelReading(input: {
  seeds: readonly SeedReading[]
  collisions: readonly CollisionReading[]
  damage: readonly DamageReading[]
  damageCeiling: number
  entropyRatio: number | null
  periodExponent: number | null
  recurrence: { min: number | null; budget: number | null; vacuum: number | null }
  caps: ReadCaps | null
}): HarnessLabel {
  const seedKinds: HarnessNumbers['seedKinds'] = {
    static: 0,
    ballistic: 0,
    spreading: 0,
    vanished: 0,
    wandering: 0,
    unread: 0,
  }
  const evidenceKinds: SeedMotion['kind'][] = []

  for (const s of input.seeds) {
    const read = Math.min(
      SEED_ROUNDS,
      s.exact,
      input.caps ? input.caps.seed(s.key) : s.exact,
    )
    const kind = seedKindAt(s, read)

    seedKinds[kind]++
    evidenceKinds.push(kind === 'unread' ? 'wandering' : kind)
  }

  let collisionsTested = 0
  let collisionsScattered = 0
  let collisionsUnread = 0

  for (const c of input.collisions) {
    if (!c.testable) {
      continue
    }

    const read = Math.min(
      SEED_ROUNDS,
      c.exact,
      input.caps ? input.caps.collision(collisionKey(c)) : c.exact,
    )

    if (c.firstFailure >= 1 && c.firstFailure <= read) {
      collisionsTested++
      collisionsScattered++
    } else if (read >= MIN_READ_ROUNDS) {
      collisionsTested++
    } else {
      collisionsUnread++
    }
  }

  let speedSum = 0
  let fillSum = 0
  let damageRadius = 0
  let damageRuns = 0
  let damageUnread = 0
  let damageRounds = 0
  let ceilingViolations = 0

  for (const d of input.damage) {
    ceilingViolations += d.ceilingViolations

    const cap = input.caps ? input.caps.damage(damageKey(d)) : DAMAGE_ROUNDS
    const h = Math.min(cap, d.exact)

    if (h < 1) {
      damageUnread++
      continue
    }

    const r = Math.max(d.track.radius[h]!, 0)

    speedSum += r / h
    fillSum += d.track.fill[h]!
    damageRadius = Math.max(damageRadius, r)
    damageRounds = Math.max(damageRounds, h)
    damageRuns++
  }

  const damageSpeed = damageRuns > 0 ? speedSum / damageRuns : 0
  const damageFill = damageRuns > 0 ? fillSum / damageRuns : 0
  const verdict = classifyDynamics({
    periodExponent: input.periodExponent ?? Number.NaN,
    periodExponentCeiling: PERIOD_EXPONENT_CEILING,
    seedKinds: evidenceKinds,
    collisionsTested,
    collisionsScattered,
    damageSpeed,
    damageCeiling: input.damageCeiling,
    damageFill,
    damageRadius,
    entropyRatio: input.entropyRatio ?? Number.NaN,
  })

  let label = verdict.label

  const mixingOpen =
    label !== 'mixing' &&
    (input.periodExponent === null || input.entropyRatio === null) &&
    verdict.fillsCone &&
    (input.entropyRatio === null || verdict.entropyRises) &&
    (input.periodExponent === null || verdict.exponentialPeriods)

  if (label === 'ballistic' && (collisionsUnread > 0 || damageUnread > 0)) {
    label = 'unresolved'
  }

  if (label === 'frozen' && damageRuns === 0) {
    label = 'unresolved'
  }

  return {
    label,
    mixingOpen,
    verdict,
    gate: null,
    refused: null,
    numbers: {
      seedKinds,
      seedsRun: input.seeds.length,
      collisionsTested,
      collisionsScattered,
      collisionsUnread,
      damageRuns,
      damageUnread,
      damageSpeed,
      damageFill,
      damageRadius,
      damageRounds,
      ceilingViolations,
      entropyRatio: input.entropyRatio,
      periodExponent: input.periodExponent,
      recurrenceMin: input.recurrence.min,
      recurrenceBudget: input.recurrence.budget,
      vacuumPeriod: input.recurrence.vacuum,
    },
  }
}

// ---- one run ----

export function seedKindsOf(
  seeds: readonly SeedReading[],
): Map<string, SeedMotion['kind'] | 'unread'> {
  const out = new Map<string, SeedMotion['kind'] | 'unread'>()

  for (const s of seeds) {
    out.set(s.key, seedKindAt(s, Math.min(SEED_ROUNDS, s.exact)))
  }

  return out
}

// a seed's kind over its first `read` rounds, unread below MIN_READ_ROUNDS
function seedKindAt(
  s: SeedReading,
  read: number,
): SeedMotion['kind'] | 'unread' {
  if (read < MIN_READ_ROUNDS) {
    return 'unread'
  }

  return seedMotion({
    track: slice(s.track, read),
    initialRadius: s.initialRadius,
    boundedCount: 4,
  }).kind
}

// The collision pairs of a run: every ordered pair of seeds on one background where one is localized (static or
// ballistic) and one moves, as on the line. Pairs are taken in orbits {(a, b), (Ca, Cb)} under the negation, so the
// set (and any cap) is the same for the two C-members of a class. Dense runs (a live vacuum) are capped at `cap`
// orbits; runs on a background the rule fixes are not capped.
export function collisionPairs(input: {
  kinds: Map<string, SeedMotion['kind'] | 'unread'>
  available: Set<string>
  denseBackground: (bg: number) => boolean
  cap: number
  // the seed family (the 60 seeds unless given; the extended census passes its own, closed under C)
  seeds?: readonly SeedDef[]
  // a cap on the orbits taken on a background the rule fixes too (the extended census only; none for the 60 seeds)
  fixedCap?: number
  // a further condition on a pair (the extended census only), applied before eligibility
  restrict?: (a: SeedDef, b: SeedDef) => boolean
}): [SeedDef, SeedDef][] {
  const family = input.seeds ?? SEEDS
  const byKey = new Map(family.map(s => [s.key, s]))

  const localized = (s: SeedDef): boolean => {
    const k = input.kinds.get(s.key)

    return k === 'static' || k === 'ballistic'
  }

  const moving = (s: SeedDef): boolean => {
    const k = input.kinds.get(s.key)

    return k !== undefined && k !== 'static'
  }

  const eligible = (a: SeedDef, b: SeedDef): boolean =>
    input.available.has(a.key) &&
    input.available.has(b.key) &&
    (localized(a) || localized(b)) &&
    (moving(a) || moving(b))
  const out: [SeedDef, SeedDef][] = []
  const denseOrbits = new Map<number, number>()
  const fixedOrbits = new Map<number, number>()
  // an orbit {(a, b), (Ca, Cb)} is taken once, at its member met first in the family's order
  const index = new Map(family.map((s, k) => [s.key, k]))
  const negated = family.map(s => {
    const c = byKey.get(negatedSeedKey(s))

    if (!c) {
      throw new Error(`harness: seed family not closed under negation at ${s.key}`)
    }

    return c
  })

  // A pair is eligible only with a moving member, so for a first seed whose orbit has no mover only the seeds whose
  // orbit moves need visiting; the visit order (index order) and so every cap stay those of the full double loop.
  const orbitMoves = family.map((s, k) => moving(s) || moving(negated[k]!))
  const byBackground = new Map<number, number[]>()
  const movingByBackground = new Map<number, number[]>()

  const listOf = (m: Map<number, number[]>, bg: number): number[] => {
    let list = m.get(bg)

    if (!list) {
      list = []
      m.set(bg, list)
    }

    return list
  }

  for (const [k, s] of family.entries()) {
    listOf(byBackground, s.background).push(k)

    if (orbitMoves[k]) {
      listOf(movingByBackground, s.background).push(k)
    }
  }

  for (const [ia, a] of family.entries()) {
    const ca = negated[ia]!
    const ica = index.get(ca.key)!

    if (ica < ia) {
      continue
    }

    const partners = (orbitMoves[ia] ? byBackground : movingByBackground).get(a.background) ?? []

    for (const ib of partners) {
      const b = family[ib]!
      const cb = negated[ib]!

      if (ica === ia && index.get(cb.key)! < ib) {
        continue
      }

      const members: [SeedDef, SeedDef][] =
        ca.key === a.key && cb.key === b.key
          ? [[a, b]]
          : [
              [a, b],
              [ca, cb],
            ]
      const picked = members.filter(([x, y]) => (!input.restrict || input.restrict(x, y)) && eligible(x, y))

      if (picked.length === 0) {
        continue
      }

      // the orbit's background class: 0 stays 0 under C, +-1 swap
      const bgClass = Math.abs(a.background)

      if (input.denseBackground(a.background)) {
        const used = denseOrbits.get(bgClass) ?? 0

        if (used >= input.cap) {
          continue
        }

        denseOrbits.set(bgClass, used + 1)
      } else if (input.fixedCap !== undefined) {
        const used = fixedOrbits.get(bgClass) ?? 0

        if (used >= input.fixedCap) {
          continue
        }

        fixedOrbits.set(bgClass, used + 1)
      }

      out.push(...picked)
    }
  }

  return out
}

const vacuumHistories = new WeakMap<LabSchedule, Map<string, Int8Array[]>>()

function vacuumHistory(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
): Int8Array[] {
  let byRule = vacuumHistories.get(s)

  if (!byRule) {
    byRule = new Map()
    vacuumHistories.set(s, byRule)
  }

  let h = byRule.get(rule.name)

  if (!h) {
    const state = new Int8Array(inst.size)

    h = [Int8Array.from(state)]

    for (let t = 1; t <= SEED_ROUNDS; t++) {
      denseRound(rule, s, state)
      h.push(Int8Array.from(state))
    }

    byRule.set(rule.name, h)
  }

  return h
}

// The window gate of an open ball: the same seed run on the sub-ball of radius R - 1 (a BFS prefix, with the full
// ball's matchings restricted to it) must agree with the full-ball run on every sub-ball cell for every round the
// sub-ball run calls exact. A wrong window watch fails it.
function windowAgreement(
  inst: LabInstance,
  rule: HarnessRule,
  s: LabSchedule,
  seeds: readonly SeedDef[],
): boolean {
  const sub = inst.ballSize[inst.radius - 1]!

  for (let v = 0; v < inst.size; v++) {
    if ((v < sub) !== inst.distance[v]! <= inst.radius - 1) {
      return false
    }
  }

  const matchings = s.schedule.matchings.map(m => {
    const kept: number[] = []

    for (let k = 0; k < m.length; k += 2) {
      if (m[k]! < sub && m[k + 1]! < sub) {
        kept.push(m[k]!, m[k + 1]!)
      }
    }

    return Int32Array.from(kept)
  })
  const subSchedule = labSchedule({
    ...s.schedule,
    size: sub,
    matchings,
  })
  const subShell = Uint8Array.from({ length: sub }, (_, v) =>
    inst.distance[v] === inst.radius - 1 ? 1 : 0,
  )

  for (const seed of seeds) {
    const cells = seedCells(inst, seed, 0)

    if (!cells || cells.some(c => inst.distance[c]! > inst.radius - 3)) {
      continue
    }

    const full = new SparseRun(inst.size, seed.background, inst.shell)
    const small = new SparseRun(sub, seed.background, subShell)

    cells.forEach((c, k) => {
      full.set(c, seed.values[k]!)
      small.set(c, seed.values[k]!)
    })

    for (let t = 1; t <= SEED_ROUNDS; t++) {
      full.round(rule, s)
      small.round(rule, subSchedule)

      if (small.broken) {
        break
      }

      for (let v = 0; v < sub; v++) {
        if (full.state[v] !== small.state[v]) {
          return false
        }
      }
    }
  }

  return true
}

// ---- lazy open readings ----
//
// The same seeds, aimed collisions and damage starts as an open ball, read on a lazy space: no shell, so a run is exact
// for every round it completes, and it stops only on LAZY_SUPPORT_CAP. Ties are broken by the space's canonical order,
// the order the instance's own ball is numbered in, so the readings are those of the ball wherever the ball is exact.

export type LazyContext = {
  inst: LabInstance
  space: LazySpace
  colors: number[]
  stats: LazyStats
}

export function lazyContext(inst: LabInstance, order: ColorOrder): LazyContext {
  if (!inst.lazy) {
    throw new Error(`harness: ${inst.name} is not lazy`)
  }

  const space = inst.lazy.makeSpace()

  return {
    inst,
    space,
    colors: roundColors(space, order),
    stats: {
      runs: 0,
      budgetStops: 0,
      coneExcess: Number.NEGATIVE_INFINITY,
      lookups: 0,
      maxCells: 0,
      maxSeedRadius: 0,
    },
  }
}

export function lazyRun(ctx: LazyContext, background: number): LazyRun {
  ctx.stats.runs++

  return new LazyRun({
    space: ctx.space,
    background,
    colors: ctx.colors,
    supportCap: LAZY_SUPPORT_CAP,
  })
}

function closeRun(ctx: LazyContext, run: LazyRun): void {
  ctx.stats.budgetStops += run.stopped ? 1 : 0
  ctx.stats.coneExcess = Math.max(ctx.stats.coneExcess, run.coneExcess)
  ctx.stats.lookups += run.lookups
  ctx.stats.maxCells = Math.max(ctx.stats.maxCells, ctx.space.cells())
}

// the farther of two cells from the origin, ties by the canonical order (lower first)
function fartherFirst(space: LazySpace, a: number, b: number): boolean {
  const d = space.distance(a) - space.distance(b)

  return d > 0 || (d === 0 && space.compare(a, b) < 0)
}

export function lazyChain(space: LazySpace, anchor: number): number[] {
  const out = [anchor]

  while (out.length < 4) {
    let best = -1

    for (const w of space.neighbors(out[out.length - 1]!)) {
      if (!out.includes(w) && (best < 0 || fartherFirst(space, w, best))) {
        best = w
      }
    }

    out.push(best)
  }

  return out
}

export function lazySeedCells(space: LazySpace, seed: SeedDef, anchor: number): number[] {
  const c = lazyChain(space, anchor)

  return seed.positions.map(p => c[p]!)
}

function readLazy(
  space: LazySpace,
  cells: Iterable<number>,
  distance: (v: number) => number,
  track: DifferenceTrack,
): void {
  let count = 0
  let radius = -1
  let inner = -1

  for (const v of cells) {
    const d = distance(v)

    count++
    radius = Math.max(radius, d)
    inner = inner < 0 ? d : Math.min(inner, d)
  }

  track.count.push(count)
  track.radius.push(radius)
  track.innerRadius.push(inner)
  track.fill.push(radius < 0 ? 0 : count / space.ballSize(radius))
}

function placeLazySeed(ctx: LazyContext, seed: SeedDef, cells: number[]): LazyRun {
  const run = lazyRun(ctx, seed.background)

  cells.forEach((c, k) => run.set(c, seed.values[k]!))

  return run
}

function lazySeedReading(
  ctx: LazyContext,
  rule: HarnessRule,
  seed: SeedDef,
): SeedReading {
  const { space } = ctx
  const cells = lazySeedCells(space, seed, 0)
  const run = placeLazySeed(ctx, seed, cells)
  const track = emptyTrack()
  const initialRadius = Math.max(...cells.map(c => space.distance(c)))
  const distance = (v: number): number => space.distance(v)

  let exact = 0

  readLazy(space, run.state.keys(), distance, track)

  for (let t = 1; t <= SEED_ROUNDS; t++) {
    if (!run.round(rule)) {
      break
    }

    readLazy(space, run.state.keys(), distance, track)
    exact = t
  }

  closeRun(ctx, run)
  ctx.stats.maxSeedRadius = Math.max(ctx.stats.maxSeedRadius, ...track.radius)

  return { key: seed.key, exact, initialRadius, track }
}

function lazyFixedAnchor(ctx: LazyContext): number {
  return ctx.space.fromAddress(ctx.inst.lazy!.addresses[ctx.inst.collisionAnchor]!)
}

export function lazyAimedAnchor(input: {
  ctx: LazyContext
  rule: HarnessRule
  seed: SeedDef
  reading: SeedReading | undefined
}): number {
  const { ctx, rule, seed, reading } = input
  const { space } = ctx

  if (!reading) {
    return lazyFixedAnchor(ctx)
  }

  const rounds = Math.floor(Math.min(SEED_ROUNDS, reading.exact) / 2)

  if (rounds < 1 || seedKindAt(reading, Math.min(SEED_ROUNDS, reading.exact)) === 'static') {
    return lazyFixedAnchor(ctx)
  }

  const run = placeLazySeed(ctx, seed, lazySeedCells(space, seed, 0))

  for (let t = 0; t < rounds; t++) {
    run.round(rule)
  }

  closeRun(ctx, run)

  let best = -1

  for (const v of run.state.keys()) {
    if (best < 0 || fartherFirst(space, v, best)) {
      best = v
    }
  }

  return best >= 0 && space.distance(best) > reading.initialRadius
    ? best
    : lazyFixedAnchor(ctx)
}

export function lazyCollisionReading(
  ctx: LazyContext,
  rule: HarnessRule,
  a: SeedDef,
  b: SeedDef,
  anchor: number,
): CollisionReading {
  const { space } = ctx
  const ca = lazySeedCells(space, a, 0)
  const cb = lazySeedCells(space, b, anchor)
  const bg = a.background
  const one = placeLazySeed(ctx, a, ca)
  const two = placeLazySeed(ctx, b, cb)
  const both = placeLazySeed(ctx, a, ca)

  for (const [k, c] of cb.entries()) {
    const sum = both.get(c) + b.values[k]! - bg

    if (sum < -1 || sum > 1) {
      return { first: a.key, second: b.key, testable: false, exact: 0, firstFailure: -1 }
    }

    both.set(c, sum)
  }

  let exact = 0
  let firstFailure = -1

  for (let t = 1; t <= SEED_ROUNDS && firstFailure < 0; t++) {
    const ok = [one, two, both].map(r => r.round(rule))

    if (ok.some(x => !x)) {
      break
    }

    exact = t

    for (const r of [one, two, both]) {
      for (const v of r.state.keys()) {
        if (both.get(v) - bg !== one.get(v) - bg + (two.get(v) - bg)) {
          firstFailure = t
        }
      }
    }
  }

  for (const r of [one, two, both]) {
    closeRun(ctx, r)
  }

  return { first: a.key, second: b.key, testable: true, exact, firstFailure }
}

// the open damage starts on a lazy space: the de Bruijn patch on the cells within patchRadius in canonical order, its
// negation, and the sites spread over the patch (the open ball's starts, numbered the same way)
export function lazyDamageStarts(ctx: LazyContext): {
  patch: number[]
  tones: Int8Array[]
  sites: number[]
} {
  const { space } = ctx
  const ball = spaceBall(space, ctx.inst.patchRadius, Number.POSITIVE_INFINITY)!
  const patch = ball.cells

  let k = 1

  while (3 ** k < patch.length) {
    k++
  }

  const de = deBruijnTones(k)
  const tones = Int8Array.from(patch, (_, i) => de[i]!)
  const sites = [
    ...new Set(
      Array.from(
        { length: DAMAGE_SITES },
        (_, j) => patch[Math.floor((j * patch.length) / DAMAGE_SITES)]!,
      ),
    ),
  ]

  return { patch, tones: [tones, tones.map(x => -x)], sites }
}

function lazyDamageReadings(ctx: LazyContext, rule: HarnessRule): DamageReading[] {
  const { space } = ctx
  const c = ctx.colors.length
  const out: DamageReading[] = []
  const { patch, tones, sites } = lazyDamageStarts(ctx)

  tones.forEach((state, startIndex) => {
    sites.forEach((site, siteIndex) => {
      const cache = new Map<number, number>()

      const distance = (v: number): number => {
        let d = cache.get(v)

        if (d === undefined) {
          d = space.distanceBetween(site, v)
          cache.set(v, d)
        }

        return d
      }

      const at = patch.indexOf(site)

      for (const delta of [1, 2]) {
        const flipped = ((state[at]! + 1 + delta) % 3) - 1
        const a = lazyRun(ctx, 0)
        const b = lazyRun(ctx, 0)

        patch.forEach((v, i) => {
          if (state[i] !== 0) {
            a.set(v, state[i]!)
            b.set(v, state[i]!)
          }
        })
        a.set(site, flipped)

        const track = emptyTrack()

        const differing = (): number[] => {
          const out: number[] = []
          const seen = new Set<number>()

          for (const r of [a, b]) {
            for (const v of r.state.keys()) {
              if (!seen.has(v)) {
                seen.add(v)

                if (a.get(v) !== b.get(v)) {
                  out.push(v)
                }
              }
            }
          }

          return out
        }

        let exact = 0
        let ceilingViolations = 0

        readLazy(space, differing(), distance, track)

        for (let t = 1; t <= DAMAGE_ROUNDS; t++) {
          const ok = [a.round(rule), b.round(rule)]

          if (ok.some(x => !x)) {
            break
          }

          readLazy(space, differing(), distance, track)
          exact = t
        }

        closeRun(ctx, a)
        closeRun(ctx, b)

        track.radius.forEach((r, t) => {
          if (r > c * t) {
            ceilingViolations++
          }
        })

        out.push({
          start: startIndex,
          site: siteIndex,
          delta,
          exact,
          track,
          ceilingViolations,
        })
      }
    })
  })

  return out
}

// ---- gated readings ----

function sameState(a: ReadonlyMap<number, number>, b: ReadonlyMap<number, number>): boolean {
  if (a.size !== b.size) {
    return false
  }

  for (const [k, v] of a) {
    if (b.get(k) !== v) {
      return false
    }
  }

  return true
}

// The exact periodic orbit of one seed on a lazy window: the least round P <= budget at which the whole state equals
// the start, cell for cell and tone for tone, and the cells visited over one period. A round is a bijection of
// finite-support states under a fixed color sequence, so state(P) = state(0) gives state(t + P) = state(t) for every t:
// the support stays inside those cells forever. Null when the state does not return within the budget (a ballistic
// mover never does), 'stopped' when the run stopped on its support cap first (a stopped run
// says nothing either way).
export function confinedOrbit(
  ctx: LazyContext,
  rule: HarnessRule,
  seed: SeedDef,
  budget: number,
): ConfinedOrbit | 'stopped' | null {
  const run = placeLazySeed(ctx, seed, lazySeedCells(ctx.space, seed, 0))
  const start = new Map(run.state)
  const visited = new Set(run.state.keys())
  const hull = new Set<number>()

  // every cell a tone can occupy during the next round, starting from the current round-end support
  const addHull = (): void => {
    let reach = new Set(run.state.keys())

    for (const color of ctx.colors) {
      const next = new Set(reach)

      for (const u of reach) {
        next.add(ctx.space.partner(color, u))
      }

      reach = next
    }

    for (const v of reach) {
      hull.add(v)
    }
  }

  let found: ConfinedOrbit | 'stopped' | null = null

  addHull()

  for (let t = 1; t <= budget; t++) {
    if (!run.round(rule)) {
      found = 'stopped'
      break
    }

    if (sameState(run.state, start)) {
      found = { seed: seed.key, period: t, cells: visited.size, hull: hull.size }
      break
    }

    for (const v of run.state.keys()) {
      visited.add(v)
    }

    addHull()
  }

  closeRun(ctx, run)

  return found
}

// Every seed's exact orbit, or null as soon as one seed has none within the budget.
export function confinedOrbits(
  ctx: LazyContext,
  rule: HarnessRule,
  budget: number,
): ConfinedOrbit[] | null {
  const out: ConfinedOrbit[] = []

  for (const seed of SEEDS) {
    const o = confinedOrbit(ctx, rule, seed, budget)

    if (!o || o === 'stopped') {
      return null
    }

    out.push(o)
  }

  return out
}

// The confined gate of an open reading: classifyDynamics left it unresolved with every collision and damage run read,
// no collision scattered, some seed moved, and every seed has an exact periodic orbit.
function confinedGate(
  ctx: LazyContext,
  rule: HarnessRule,
  result: HarnessLabel,
): HarnessLabel {
  const n = result.numbers

  if (
    result.label !== 'unresolved' ||
    n.collisionsUnread > 0 ||
    n.damageUnread > 0 ||
    n.collisionsScattered > 0 ||
    n.seedKinds.static === n.seedsRun
  ) {
    return result
  }

  const orbits = confinedOrbits(ctx, rule, CONFINED_MAX_ROUNDS)

  return orbits
    ? { ...result, label: 'confined', gate: { kind: 'confined', budget: CONFINED_MAX_ROUNDS, orbits } }
    : { ...result, refused: `confined: some seed has no exact periodic orbit within ${CONFINED_MAX_ROUNDS} rounds` }
}

// The systole evidence of a closed reading: every seed that does not read static or ballistic is a bounded particle
// (at most 4 cells at every read round, the ballistic count bound) whose quotient radius passed half the LOOP systole
// L. Quotient distance equals cover distance for every cover distance up to L / 2 and the quotient distance never
// exceeds the cover distance, so a quotient radius m with 2 m > L proves the cover distance passed L / 2: only from
// there can the radius track stop reading the cover distance, and the ballistic radius test cannot be decided. (The
// gate first halved the injectivity radius r, a threshold any one-hop mover met.)
// Null when the loop systole is unknown or only a lower bound, when some such seed fails, or when there is none.
// `loopSystole` overrides the instance's own (a planted control only).
export function systoleMovers(
  inst: LabInstance,
  seeds: readonly SeedReading[],
  loopSystole: number | null = inst.loopSystole,
): SurfaceMover[] | null {
  if (inst.boundary !== 'closed' || loopSystole === null || inst.systoleLowerBound) {
    return null
  }

  const movers: SurfaceMover[] = []

  for (const s of seeds) {
    const read = Math.min(SEED_ROUNDS, s.exact)
    const kind = seedKindAt(s, read)

    if (kind === 'static' || kind === 'ballistic') {
      continue
    }

    const maxCount = Math.max(...s.track.count.slice(0, read + 1))
    const maxRadius = Math.max(...s.track.radius.slice(0, read + 1))

    if (kind === 'unread' || maxCount > 4 || 2 * maxRadius <= loopSystole) {
      return null
    }

    movers.push({ seed: s.key, maxRadius, maxCount })
  }

  return movers.length > 0 ? movers : null
}

// The seeds of one reading (the harness's own seed runs, from a fresh start every call).
export function seedReadings(input: {
  rule: HarnessRule
  instance: LabInstance
  order: ColorOrder
}): SeedReading[] {
  const { rule, instance: inst, order } = input

  if (inst.lazy) {
    const ctx = lazyContext(inst, order)

    return SEEDS.map(seed => lazySeedReading(ctx, rule, seed))
  }

  const s = inst.schedules[order]
  const vacuum = rule.vacuumFixing ? null : vacuumHistory(inst, rule, s)
  const out: SeedReading[] = []

  for (const seed of SEEDS) {
    const r = seedReading(inst, rule, s, seed, vacuum)

    if (r) {
      out.push(r)
    }
  }

  return out
}

// Every collidable pair of a reading's seeds, uncapped: the exhaustive search the no-collidable-pair gate rests on.
export function collidablePairCount(input: {
  rule: HarnessRule
  seeds: readonly SeedReading[]
}): number {
  return collisionPairs({
    kinds: seedKindsOf(input.seeds),
    available: new Set(input.seeds.map(r => r.key)),
    denseBackground: () => false,
    cap: Number.POSITIVE_INFINITY,
  }).length
}

// The collidable pairs of a rule on a (larger) quotient: the 60 seeds first, then, when they find none and the reading
// it is compared with ran the extended census, the census on that quotient too, so both sides read one seed family.
export function largerPairCount(input: {
  rule: HarnessRule
  instance: LabInstance
  order: ColorOrder
  extended: boolean
  // the extended census's seed budget (default EXTENDED_SEED_BUDGET)
  budget?: number
}): { pairs: number; bound: string | null } {
  const pairs = collidablePairCount({
    rule: input.rule,
    seeds: seedReadings({ rule: input.rule, instance: input.instance, order: input.order }),
  })

  if (pairs > 0 || !input.extended) {
    return { pairs, bound: null }
  }

  const c = extendedCensus({
    rule: input.rule,
    instance: input.instance,
    order: input.order,
    budget: input.budget,
  })

  return { pairs: c.exists ? Math.max(c.pairs.length, 1) : 0, bound: censusBound(c) }
}

// The reference patch a quotient's systole is read against: the catalog's (tiling-quotient.ts), larger for the D4
// honeycomb, whose balls grow fastest of the flat tilings, and for {3,4,3,4}, whose radius-2 cells need the whole
// radius-3 ball (8857 tiles) to be complete, below the float build's wall.
const referenceCellsOf = (column: LabGeometryName): number =>
  column === '{3,4,3,3}' ? 20_000 : column === '{3,4,3,4}' ? 10_000 : REFERENCE_CELLS

// The injectivity radius and loop systole of a closed graph of a lab tiling, computed afresh from its cells against the
// tiling (ballSystole; the ring against the line). A recheck never reads the instance's own systole fields.
export function graphSystole(input: {
  column: LabGeometryName
  neighbors: readonly (readonly number[])[]
  centers?: readonly number[]
  referenceCells?: number
}): { systole: number; lowerBound: boolean; loopSystole: number | null } {
  if (input.column === 'line') {
    return ringSystole(input.neighbors.length)
  }

  const spec = LAB_GEOMETRIES.find(g => g.name === input.column)!
  const sys = ballSystole({
    neighbors: input.neighbors,
    reference: referenceTiling(spec.symbol, input.referenceCells ?? referenceCellsOf(input.column)),
    referenceDegree: spec.degree,
    centers: input.centers,
  })

  return { systole: sys.systole, lowerBound: sys.lowerBound, loopSystole: sys.loopSystole }
}

const closedFrom = (input: {
  column: LabGeometryName
  name: string
  neighbors: number[][]
  construction: string
  systoleCenters: readonly number[] | undefined
  referenceCells?: number
}): LabInstance => {
  const spec = LAB_GEOMETRIES.find(g => g.name === input.column)!
  const sys = graphSystole({
    column: input.column,
    neighbors: input.neighbors,
    centers: input.systoleCenters,
    referenceCells: input.referenceCells,
  })
  const distance = graphDistances({ neighbors: input.neighbors, origin: 0 })

  let eccentricity = 0

  for (const d of distance) {
    eccentricity = Math.max(eccentricity, d)
  }

  return makeInstance({
    column: input.column,
    name: input.name,
    boundary: 'closed',
    spec,
    degree: spec.degree,
    curvature: spec.curvature,
    neighbors: input.neighbors,
    radius: -1,
    systole: sys.systole,
    systoleLowerBound: sys.lowerBound,
    loopSystole: sys.loopSystole,
    scheduleFamily: 'greedy',
    construction: input.construction,
    ring: false,
    gap: Math.min(COLLISION_GAP, eccentricity),
    patchRadius: 0,
    partner: null,
  })
}

// A square torus of the {4,4} tiling as a closed instance, its systoles computed from centre 0 (a torus is transitive
// under its translations): the systole controls of E-CMP-0027.
export function squareTorusInstance(a: number, b: number, referenceCells?: number): LabInstance {
  return closedFrom({
    referenceCells,
    column: '{4,4}',
    name: `torus-4-4-${a}x${b}`,
    neighbors: squareTorus(a, b).analysis.neighbors,
    construction: `flat {4,4} torus of ${a} x ${b} tiles`,
    systoleCenters: [0],
  })
}

const largerCache = new Map<string, LabInstance | null>()

// A larger closed quotient of the same tiling: the flat tori with both sides
// doubled (the D4 torus two sides up), the {3,7} map of PSL(2,13), the next {3,4,3,4} level when the catalog holds it.
// Null when none is built here.
export function largerQuotient(inst: LabInstance, catalog: readonly LabInstance[]): LabInstance | null {
  if (largerCache.has(inst.key)) {
    return largerCache.get(inst.key)!
  }

  // a schedule variant shares its base's graph and name stem
  const stem = inst.name.replace(/~.*$/, '')
  const sides = /-(\d+)x(\d+)$/.exec(stem)
  const twice = sides ? [2 * Number(sides[1]), 2 * Number(sides[2])] : null

  let out: LabInstance | null = null

  if (twice && inst.column === '{4,4}') {
    out = closedFrom({
      column: '{4,4}',
      name: `torus-4-4-${twice[0]}x${twice[1]}`,
      neighbors: squareTorus(twice[0]!, twice[1]!).analysis.neighbors,
      construction: `flat {4,4} torus of ${twice.join(' x ')} tiles`,
      systoleCenters: [0],
    })
  } else if (twice && inst.column === '{6,3}') {
    out = closedFrom({
      column: '{6,3}',
      name: `torus-6-3-${twice[0]}x${twice[1]}`,
      neighbors: hexagonTorus(twice[0]!, twice[1]!).analysis.neighbors,
      construction: `flat {6,3} torus of ${twice.join(' x ')} tiles`,
      systoleCenters: [0],
    })
  } else if (twice && inst.column === '{3,6}') {
    // up and down triangles are two cell orbits of the translations
    out = closedFrom({
      column: '{3,6}',
      name: `torus-3-6-${twice[0]}x${twice[1]}`,
      neighbors: triangleTorus(twice[0]!, twice[1]!).analysis.neighbors,
      construction: `flat {3,6} torus of ${twice.join(' x ')} rhombi`,
      systoleCenters: [0, 1],
    })
  } else if (inst.column === '{3,4,3,3}') {
    const side = /side-(\d+)$/.exec(stem)

    if (side) {
      const next = Number(side[1]) + 2
      const torus = d4Torus(next)

      out = closedFrom({
        column: '{3,4,3,3}',
        name: `torus-3-4-3-3-side-${next}`,
        neighbors: torus.neighbors,
        construction: `flat D4 lattice modulo ${next}`,
        systoleCenters: [0],
      })
    }
  } else if (inst.column === '{3,7}') {
    const reference = referenceTiling([3, 7], REFERENCE_CELLS)
    const map = findRotaryMap({ p: 3, q: 7, moduli: [13], reference, minSystole: 1 })

    if (map) {
      out = closedFrom({
        column: '{3,7}',
        name: `surface-3-7-genus-${map.analysis.genus}`,
        neighbors: map.analysis.neighbors,
        construction: `regular map of the (2,3,7) rotation group in PGL(2,13), order ${map.groupOrder}`,
        systoleCenters: undefined,
      })
    }
  } else if (inst.column === '{3,4,3,4}') {
    const level = /level-(\d+)$/.exec(stem)

    out =
      (level &&
        catalog.find(
          i =>
            i.column === '{3,4,3,4}' &&
            i.scheduleVariant === inst.scheduleVariant &&
            i.name.replace(/~.*$/, '') === `honeycomb-3-4-3-4-level-${Number(level[1]) + 1}`,
        )) ??
      null
  }

  if (out && out.scheduleVariant !== inst.scheduleVariant && inst.scheduleVariant === 'greedy-reversed') {
    out = closedVariantInstances([out])[0]!
  }

  largerCache.set(inst.key, out)

  return out
}

// The surface_limited gate of a closed reading left unresolved with every collision and damage run read:
//   - no collidable pair: the exhaustive pair search found none here, AND the same rule under the same order has a
//     collidable pair on a larger quotient of the same tiling (largerQuotient), so the surface, not the seed set, causes
//     it; with no larger quotient, or none with a pair, the gate is refused and the
//     reading stays unresolved;
//   - systole: no collision scattered and every non-localized seed passes the systole evidence (systoleMovers).
function surfaceGate(input: {
  inst: LabInstance
  rule: HarnessRule
  order: ColorOrder
  seeds: readonly SeedReading[]
  pairs: number
  result: HarnessLabel
  catalog: readonly LabInstance[]
  // the extended census already read here (null when the 60 seeds found a pair or decided the reading)
  census: ExtendedCensus | null
  budget?: number
}): HarnessLabel {
  const { inst, rule, order, seeds, pairs, result } = input
  const n = result.numbers

  if (
    inst.boundary !== 'closed' ||
    result.label !== 'unresolved' ||
    n.collisionsUnread > 0 ||
    n.damageUnread > 0
  ) {
    return result
  }

  if (pairs === 0) {
    const here = input.census ? `, none among ${censusBound(input.census)} here` : ''
    const bigger = largerQuotient(inst, input.catalog)

    if (!bigger) {
      return { ...result, refused: `no_collidable_pair: no larger quotient of this tiling is built${here}` }
    }

    const there = largerPairCount({
      rule,
      instance: bigger,
      order,
      extended: input.census !== null,
      budget: input.budget,
    })

    if (there.pairs === 0) {
      return {
        ...result,
        refused:
          `no_collidable_pair: none on the larger ${bigger.name} either${here}` +
          `${there.bound ? ` and among ${there.bound} there` : ''}, a seed-set limit, not the surface`,
      }
    }

    return {
      ...result,
      label: 'surface_limited',
      gate: {
        kind: 'surface_limited',
        reason: 'no_collidable_pair',
        pairs: 0,
        seedsRead: seeds.length,
        larger: { instance: bigger.name, cells: bigger.size, loopSystole: bigger.loopSystole, pairs: there.pairs },
      },
    }
  }

  const movers = n.collisionsScattered === 0 ? systoleMovers(inst, seeds) : null

  return movers
    ? {
        ...result,
        label: 'surface_limited',
        gate: {
          kind: 'surface_limited',
          reason: 'systole',
          injectivityRadius: inst.systole!,
          loopSystole: inst.loopSystole!,
          movers,
        },
      }
    : { ...result, refused: n.collisionsScattered > 0 ? null : 'systole: some non-localized seed did not pass L / 2' }
}

export type ExtendedCensus = {
  // the level the census stopped at (the first with a collidable pair, else the last: the exhaustive bound)
  level: ExtendedLevel
  levelIndex: number
  // every level read, in order (the family is their union)
  levels: ExtendedLevel[]
  // seeds placed per background (-1, 0, +1) over those levels
  seedsPerBackground: [number, number, number]
  seeds: SeedDef[]
  readings: SeedReading[]
  // the collision pairs run (every collidable pair with a one-cell member), and whether any collidable pair exists
  pairs: [SeedDef, SeedDef][]
  exists: boolean
}

// The extended census of one closed reading: the levels of EXTENDED_SEED_LEVELS in order, each read from a fresh start,
// stopping at the first level with a collidable pair. Dense collision orbits are capped as in harnessReading.
export function extendedCensus(input: {
  rule: HarnessRule
  instance: LabInstance
  order: ColorOrder
  // the largest family a level may hold and still be run (default EXTENDED_SEED_BUDGET; a larger run raises it)
  budget?: number
}): ExtendedCensus {
  const { rule, instance: inst, order } = input
  const budget = input.budget ?? EXTENDED_SEED_BUDGET

  if (inst.boundary !== 'closed' || inst.lazy) {
    throw new Error(`harness: the extended census reads closed quotients only, not ${inst.name}`)
  }

  const s = inst.schedules[order]
  const vacuum = rule.vacuumFixing ? null : vacuumHistory(inst, rule, s)
  const denseBackground = (bg: number): boolean => !fixesBackground(rule, bg)
  const cap = Math.max(
    COLLISION_MIN_ORBITS,
    Math.floor(COLLISION_WORK / (3 * SEED_ROUNDS * inst.edges)),
  )
  // the union of every level read so far, in first-appearance order (each level's own order canonical)
  const family: SeedDef[] = []
  const inFamily = new Set<string>()
  const placed: SeedDef[] = []
  const readings: SeedReading[] = []
  const levelsRead: ExtendedLevel[] = []

  let last: ExtendedCensus | null = null

  for (const [levelIndex, level] of EXTENDED_SEED_LEVELS.entries()) {
    if (last && extendedSeedCount(inst, level, denseBackground) > budget) {
      break
    }

    for (const seed of extendedSeeds(inst, level, denseBackground)) {
      if (inFamily.has(seed.key)) {
        continue
      }

      inFamily.add(seed.key)
      family.push(seed)

      const r = seedReading(inst, rule, s, seed, vacuum)

      if (r) {
        readings.push(r)
        placed.push(seed)
      }
    }

    levelsRead.push(level)

    const kinds = seedKindsOf(readings)
    const available = new Set(readings.map(r => r.key))
    // whether any collidable pair exists at all: one orbit per background class settles it
    const exists =
      collisionPairs({ kinds, available, denseBackground, cap: 1, seeds: family, fixedCap: 1 }).length > 0
    // the collisions run: every collidable pair with a one-cell member (each mover against every one-cell localized
    // seed of its background, and each one-cell mover against every localized seed), dense orbits capped as in
    // harnessReading
    const pairs = exists
      ? collisionPairs({
          kinds,
          available,
          denseBackground,
          cap,
          seeds: family,
          restrict: (a, b) => a.positions.length === 1 || b.positions.length === 1,
        })
      : []
    const perBackground: [number, number, number] = [0, 0, 0]

    for (const seed of placed) {
      perBackground[seed.background + 1]! += 1
    }

    last = {
      level,
      levelIndex,
      levels: [...levelsRead],
      seedsPerBackground: perBackground,
      seeds: [...placed],
      readings: [...readings],
      pairs,
      exists,
    }

    if (exists) {
      break
    }
  }

  return last!
}

// A short statement of a census's bound, for refusals and the note.
export function censusBound(c: ExtendedCensus): string {
  const [m, z, p] = c.seedsPerBackground

  return (
    `${c.readings.length} extended seeds (every support through the anchor at levels ` +
    `${c.levels.map(l => `(${l.radius}, ${l.size})`).join(', ')} as (radius, cells), at most ` +
    `${DENSE_LEVEL_LIMIT} cells on a live background; ${m}/${z}/${p} on -1/0/+1)`
  )
}

function lazyHarnessReading(input: {
  rule: HarnessRule
  instance: LabInstance
  order: ColorOrder
}): HarnessReading {
  const { rule, instance: inst, order } = input
  const ctx = lazyContext(inst, order)
  const seeds = SEEDS.map(seed => lazySeedReading(ctx, rule, seed))
  const available = new Set(seeds.map(r => r.key))
  const pairs = collisionPairs({
    kinds: seedKindsOf(seeds),
    available,
    denseBackground: () => false,
    cap: 0,
  })
  const seedByKey = new Map(seeds.map(x => [x.key, x]))
  const anchors = new Map<string, number>()
  const collisions = pairs.map(([a, b]) => {
    let anchor = anchors.get(a.key)

    if (anchor === undefined) {
      anchor = lazyAimedAnchor({ ctx, rule, seed: a, reading: seedByKey.get(a.key) })
      anchors.set(a.key, anchor)
    }

    return lazyCollisionReading(ctx, rule, a, b, anchor)
  })
  const damage = lazyDamageReadings(ctx, rule)
  const result = confinedGate(
    ctx,
    rule,
    labelReading({
      seeds,
      collisions,
      damage,
      damageCeiling: ctx.colors.length,
      entropyRatio: null,
      periodExponent: null,
      recurrence: { min: null, budget: null, vacuum: null },
      caps: null,
    }),
  )

  return {
    rule: rule.name,
    instance: inst.key,
    order,
    boundary: inst.boundary,
    seeds,
    collisions,
    damage,
    damageCeiling: ctx.colors.length,
    entropy: null,
    periodExponent: null,
    windowAgreement: ctx.stats.coneExcess <= 0,
    result,
    lazy: ctx.stats,
  }
}

export function harnessReading(input: {
  rule: HarnessRule
  instance: LabInstance
  order: ColorOrder
  // read a lazy instance on its materialized ball instead (the dense side of the lazy-equals-dense gate)
  dense?: boolean
  // the closed instances a no-collidable-pair gate may take a larger quotient from
  catalog?: readonly LabInstance[]
  // the extended census's seed budget (default EXTENDED_SEED_BUDGET)
  extendedBudget?: number
}): HarnessReading {
  const { rule, instance: inst, order } = input
  const s = inst.schedules[order]
  const open = inst.boundary === 'openBall'

  if (open && !rule.vacuumFixing) {
    throw new Error(
      `harness: ${rule.name} creates from the vacuum, an open ball is no window for it`,
    )
  }

  if (inst.lazy && !input.dense) {
    return lazyHarnessReading(input)
  }

  const live = !rule.vacuumFixing
  const vacuum = live ? vacuumHistory(inst, rule, s) : null
  const seeds: SeedReading[] = []

  for (const seed of SEEDS) {
    const r = seedReading(inst, rule, s, seed, vacuum)

    if (r) {
      seeds.push(r)
    }
  }

  const available = new Set(seeds.map(r => r.key))
  const denseBackground = (bg: number): boolean => !fixesBackground(rule, bg)
  const cap = Math.max(
    COLLISION_MIN_ORBITS,
    Math.floor(COLLISION_WORK / (3 * SEED_ROUNDS * inst.edges)),
  )
  const pairs = collisionPairs({
    kinds: seedKindsOf(seeds),
    available,
    denseBackground,
    cap,
  })
  const collisions: CollisionReading[] = []
  const seedByKey = new Map(seeds.map(x => [x.key, x]))
  const anchors = new Map<string, number>()

  const anchorOf = (a: SeedDef): number => {
    let anchor = anchors.get(a.key)

    if (anchor === undefined) {
      anchor = aimedAnchor({
        inst,
        rule,
        s,
        seed: a,
        reading: seedByKey.get(a.key),
        vacuum,
      })
      anchors.set(a.key, anchor)
    }

    return anchor
  }

  for (const [a, b] of pairs) {
    const r = collisionReading(inst, rule, s, a, b, vacuum, anchorOf(a))

    if (r) {
      collisions.push(r)
    }
  }

  const damage = damageReadings(inst, rule, s)
  const entropy = open ? null : entropyReading(inst, rule, s)
  const periodExponent =
    !open && inst.column === 'line' ? linePeriodExponent(rule, order) : null
  const returned = entropy
    ? entropy.recurrence.filter(t => t >= 0)
    : []
  const windowOk = open
    ? windowAgreement(
        inst,
        rule,
        s,
        SEEDS.filter(x => fixesBackground(rule, x.background)),
      )
    : true
  const label = (evidence: readonly SeedReading[], runs: readonly CollisionReading[]): HarnessLabel =>
    labelReading({
      seeds: evidence,
      collisions: runs,
      damage,
      damageCeiling: s.schedule.colorCount,
      entropyRatio: entropy ? entropy.ratio : null,
      periodExponent,
      recurrence: {
        min: returned.length > 0 ? Math.min(...returned) : null,
        budget: entropy ? entropy.recurrenceBudget : null,
        vacuum: entropy ? entropy.vacuumPeriod : null,
      },
      caps: null,
    })

  let base = label(seeds, collisions)
  let census: ExtendedCensus | null = null
  let evidence = seeds
  let pairCount = pairs.length

  // the extended census (see EXTENDED_SEED_LEVELS): only where the 60 seeds found no collidable pair and left the
  // reading unresolved, so no reading the 60 seeds decide changes
  if (!open && base.label === 'unresolved' && pairs.length === 0) {
    census = extendedCensus({ rule, instance: inst, order, budget: input.extendedBudget })

    if (census.exists) {
      const extendedByKey = new Map(census.readings.map(x => [x.key, x]))

      for (const [a, b] of census.pairs) {
        let anchor = anchors.get(a.key)

        if (anchor === undefined) {
          anchor = aimedAnchor({ inst, rule, s, seed: a, reading: extendedByKey.get(a.key), vacuum })
          anchors.set(a.key, anchor)
        }

        const r = collisionReading(inst, rule, s, a, b, vacuum, anchor)

        if (r) {
          collisions.push(r)
        }
      }

      evidence = [...seeds, ...census.readings]
      // a collidable pair exists, so the no-collidable-pair gate must not apply even if none has a one-cell member
      pairCount = Math.max(census.pairs.length, 1)
      base = label(evidence, collisions)
    }
  }

  const result = surfaceGate({
    inst,
    rule,
    order,
    seeds: evidence,
    pairs: pairCount,
    catalog: input.catalog ?? [],
    census,
    budget: input.extendedBudget,
    result: base,
  })

  return {
    rule: rule.name,
    instance: inst.key,
    order,
    boundary: inst.boundary,
    seeds: evidence,
    collisions,
    damage,
    damageCeiling: s.schedule.colorCount,
    entropy,
    periodExponent,
    windowAgreement: windowOk,
    result,
    lazy: null,
    extended: census
      ? {
          level: census.level,
          levelIndex: census.levelIndex,
          seeds: census.readings.length,
          seedsPerBackground: census.seedsPerBackground,
          pairs: census.pairs.length,
          exists: census.exists,
          levels: census.levels,
        }
      : null,
  }
}

// ---- the degree-matched open comparison ----

// The labels of a flat open reading and its degree-matched hyperbolic one, read under the SAME window: every seed,
// collision and damage run to the fewer exact rounds of the two, over the seeds both balls hold. Collisions run on one
// side only (eligible there, not on the other) are run on the other side too, so both read one set.
export function matchedOpenLabels(input: {
  rule: HarnessRule
  order: ColorOrder
  flat: { instance: LabInstance; reading: HarnessReading }
  hyperbolic: { instance: LabInstance; reading: HarnessReading }
}): { flat: HarnessLabel; hyperbolic: HarnessLabel; sharedSeeds: number } {
  const sides = [input.flat, input.hyperbolic]
  const seedKeys = sides.map(x => new Set(x.reading.seeds.map(s => s.key)))
  const shared = new Set([...seedKeys[0]!].filter(k => seedKeys[1]!.has(k)))
  const byKey = new Map(SEEDS.map(s => [s.key, s]))
  // the union of both sides' collision pairs, each run on both sides
  const pairKeys = new Set(
    sides.flatMap(x => x.reading.collisions.map(collisionKey)),
  )
  const collisions = sides.map(x => {
    const have = new Map(x.reading.collisions.map(c => [collisionKey(c), c]))
    const out: CollisionReading[] = []
    const ctx = x.instance.lazy ? lazyContext(x.instance, input.order) : null

    for (const key of pairKeys) {
      const [a, b] = key.split('>')

      if (!shared.has(a!) || !shared.has(b!)) {
        continue
      }

      if (ctx && !have.has(key)) {
        const first = byKey.get(a!)!

        out.push(
          lazyCollisionReading(
            ctx,
            input.rule,
            first,
            byKey.get(b!)!,
            lazyAimedAnchor({
              ctx,
              rule: input.rule,
              seed: first,
              reading: x.reading.seeds.find(r => r.key === a),
            }),
          ),
        )
        continue
      }

      const s = x.instance.schedules[input.order]
      const c =
        have.get(key) ??
        collisionReading(
          x.instance,
          input.rule,
          s,
          byKey.get(a!)!,
          byKey.get(b!)!,
          null,
          aimedAnchor({
            inst: x.instance,
            rule: input.rule,
            s,
            seed: byKey.get(a!)!,
            reading: x.reading.seeds.find(r => r.key === a),
            vacuum: null,
          }),
        )

      if (c) {
        out.push(c)
      }
    }

    return out
  })
  const exactOf = <T>(
    list: readonly T[],
    key: (t: T) => string,
    exact: (t: T) => number,
  ): Map<string, number> => new Map(list.map(t => [key(t), exact(t)]))
  const seedExact = sides.map(x =>
    exactOf(x.reading.seeds, s => s.key, s => s.exact),
  )
  const collisionExact = collisions.map(list =>
    exactOf(list, collisionKey, c => c.exact),
  )
  const damageExact = sides.map(x =>
    exactOf(x.reading.damage, damageKey, d => d.exact),
  )
  const both = (maps: Map<string, number>[], key: string): number =>
    Math.min(maps[0]!.get(key) ?? -1, maps[1]!.get(key) ?? -1)
  const caps: ReadCaps = {
    seed: key => both(seedExact, key),
    collision: key => both(collisionExact, key),
    damage: key => both(damageExact, key),
  }
  const labels = sides.map((x, k) =>
    labelReading({
      seeds: x.reading.seeds.filter(s => shared.has(s.key)),
      collisions: collisions[k]!,
      damage: x.reading.damage,
      damageCeiling: x.reading.damageCeiling,
      entropyRatio: null,
      periodExponent: null,
      recurrence: { min: null, budget: null, vacuum: null },
      caps,
    }),
  )

  return {
    flat: labels[0]!,
    hyperbolic: labels[1]!,
    sharedSeeds: shared.size,
  }
}

// ---- gates on one rule and instance ----

export type InstanceGates = {
  schedulesValid: boolean
  // every cell inside the shell (open) or every cell (closed) has the tiling's degree
  degreeExact: boolean
  // the ring's mirror maps every matching to itself (only where a mirror is used)
  mirrorValid: boolean
  inverseRestores: boolean
  chargeConstant: boolean
  excitationConstant: boolean
  excitationMoves: boolean
  negationCommutes: boolean
  negationBreaks: boolean
  orientationIgnored: boolean
  orientationMatters: boolean
  // the P-conjugate rule under the forward orientation equals this rule under the reversed one, on every start
  swapIsOrientationReversal: boolean
  // sparse runs equal dense runs on the same graph (the background-skipping update is only an optimization)
  sparseEqualsDense: boolean
}

export function instanceGates(input: {
  rule: HarnessRule
  swapConjugate: HarnessRule
  instance: LabInstance
}): InstanceGates {
  const { rule, instance: inst } = input
  const inverse = harnessRule({
    name: `${rule.name}^-1`,
    table: inverseTable(rule.table),
  })
  const dense = denseStart(inst)
  const shifted = Int8Array.from(dense, (_, v) => dense[(v + 1) % inst.size]!)
  const starts = [dense, shifted, Int8Array.from(dense, x => (x === 0 ? 1 : x))]

  let schedulesValid = true

  for (const s of [
    inst.schedules.forward,
    inst.schedules.reverse,
    inst.reversedOrientation,
  ]) {
    const check = checkSchedule({ schedule: s.schedule, neighbors: inst.neighbors })

    schedulesValid &&= check.everyColorIsMatching && check.coversEveryEdgeOnce
  }

  // the reversed orientation keeps the forward matchings, pair by pair reversed
  const fwd = inst.schedules.forward.schedule.matchings
  const rev = inst.reversedOrientation.schedule.matchings

  schedulesValid &&=
    fwd.length === rev.length &&
    fwd.every((m, c) =>
      m.every((x, k) => x === rev[c]![k % 2 === 0 ? k + 1 : k - 1]),
    )

  let degreeExact = true

  for (let v = 0; v < inst.size; v++) {
    if (
      (inst.boundary === 'closed' || inst.distance[v]! < inst.radius) &&
      inst.neighbors[v]!.length !== inst.degree
    ) {
      degreeExact = false
    }
  }

  let mirrorValid = true

  if (inst.mirror) {
    const m = inst.mirror

    for (const pairs of fwd) {
      const set = new Set<string>()

      for (let k = 0; k < pairs.length; k += 2) {
        set.add(`${pairs[k]},${pairs[k + 1]}`)
      }

      for (let k = 0; k < pairs.length; k += 2) {
        // the mirror image of the oriented pair (i, j) is (m j, m i)
        mirrorValid &&= set.has(`${m[pairs[k + 1]!]},${m[pairs[k]!]}`)
      }
    }
  }

  let inverseRestores = true
  let chargeConstant = true
  let excitationConstant = true
  let excitationMoves = false

  for (const order of COLOR_ORDERS) {
    const s = inst.schedules[order]

    for (const start of starts) {
      const state = Int8Array.from(start)

      for (let t = 0; t < 6; t++) {
        denseRound(rule, s, state)
        chargeConstant &&= spinCharge(state) === spinCharge(start)

        const same = spinExcitation(state) === spinExcitation(start)

        excitationConstant &&= same
        excitationMoves ||= !same
      }

      for (let t = 0; t < 6; t++) {
        denseInverseRound(inverse, s, state)
      }

      inverseRestores &&= equalStates(state, start)
    }
  }

  let negationCommutes = true
  let negationBreaks = false
  let orientationIgnored = true
  let orientationMatters = false
  let swapIsOrientationReversal = true

  const s = inst.schedules.forward

  for (const start of starts) {
    const fx = Int8Array.from(start)

    denseRound(rule, s, fx)

    const neg = Int8Array.from(start, x => -x)

    denseRound(rule, s, neg)

    const commutes = neg.every((x, v) => x === -fx[v]!)

    negationCommutes &&= commutes
    negationBreaks ||= !commutes

    const reversed = Int8Array.from(start)

    denseRound(rule, inst.reversedOrientation, reversed)

    const same = equalStates(reversed, fx)

    orientationIgnored &&= same
    orientationMatters ||= !same

    const conjugate = Int8Array.from(start)

    denseRound(input.swapConjugate, s, conjugate)
    swapIsOrientationReversal &&= equalStates(conjugate, reversed)
  }

  let sparseEqualsDense = true

  for (const bg of [-1, 0, 1]) {
    if (!fixesBackground(rule, bg)) {
      continue
    }

    const cells = chain(inst, 0)
    const sparse = new SparseRun(inst.size, bg, null)
    const state = new Int8Array(inst.size).fill(bg)

    cells.forEach((c, k) => {
      const tone = [-1, 0, 1].filter(t => t !== bg)[k % 2]!

      sparse.set(c, tone)
      state[c] = tone
    })

    for (let t = 0; t < 6; t++) {
      sparse.round(rule, s)
      denseRound(rule, s, state)
      sparseEqualsDense &&= equalStates(sparse.state, state)
    }
  }

  return {
    schedulesValid,
    degreeExact,
    mirrorValid,
    inverseRestores,
    chargeConstant,
    excitationConstant,
    excitationMoves,
    negationCommutes,
    negationBreaks,
    orientationIgnored,
    orientationMatters,
    swapIsOrientationReversal,
    sparseEqualsDense,
  }
}
