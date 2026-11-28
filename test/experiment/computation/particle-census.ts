// M3-A, the particle census. Algebra: spin-one. For every M1 class labeled
// interacting or ballistic (E-CMP-0025, E-CMP-0027: every class but the identity, which is frozen everywhere), on every
// lab geometry, this reads which small starts become persistent localized structures (species), their speed and
// period, and the outcome of every collision of two species at several phase offsets (code/measure/particle-census.ts).
//
// Schedules, boundaries and seeds, declared before the first run:
// - OPEN: the lazy exact windows of E-CMP-0032 and E-CMP-0035 (code/compute/lab/lazy-space.ts, read only), each with
//   its M1 schedule family: generator coloring ({5,4}, {6,4}, {3,4,3,4}), step-parity coloring ({6,3} as A2,
//   {3,4,3,3} as D4), the coloring lifted from a finite quotient (the coset tilings), and the brick schedule of the
//   infinite line. A rule runs on a background it fixes: the 8 vacuum-fixing rules on all three uniform backgrounds,
//   the 16 creating rules on +1 and -1 only (no rule moves (b, b) for b = +-1, so those runs are exact open windows
//   too; the creating rules see the declared orientation, the shorter tile first).
// - CLOSED: the M1 closed quotient of the same column (code/compute/lab/harness.ts closedInstances, read only), under
//   its greedy coloring, with its systole field (ballSystole, an injectivity radius) beside it.
// - SEEDS: every support of at most two cells containing the origin and lying within SEED_RADIUS facets of it, with
//   every off-background tone. SEED_RADIUS = 2 is the span of the widest M1 seed shapes (ac and bd: two cells two hops
//   apart). The 4D pair at scale 1 reads radius 1 (both sides alike); scale >= 1.5 reads radius 2 there too.
// - A SPECIES is a localized reading (particle-census.ts) that persists CENSUS_ROUNDS = 100 rounds on the open window
//   AND, from at least one placement of its seed (the first CLOSED_ANCHORS cells of the quotient, each with every
//   partner cell at the seed's distance), on the closed quotient. Free pairs (two independent species side by side)
//   are counted apart.
// - COLLISIONS: every mover A (ballistic or wandering) against every species B of its class, geometry and background,
//   at meeting rounds H = MEET_ROUND + k for the PHASES phase offsets k, with B placed next to A's leading cell across
//   each of the first COLLISION_COLORS colors, read AFTER_ROUNDS rounds past the meeting. B is carried to the meeting
//   cell by address: left multiplication on the tile groups (an automorphism of the coloring), translation on the
//   lattices and the line, the address path on the coset tilings (not an automorphism there, so a placement whose shape
//   changes is counted as a mismatch and left out).
//
// Curvature: a comparison counts only between a flat tiling and its degree-matched
// hyperbolic control under ONE schedule family. The three 2D pairs are read on the coset family on both sides ({6,3}
// and {6,4} are rebuilt as coset tilings for this, beside their M1 families), under both color orders. The 4D pair has
// no common family (step-parity D4 against the generator coloring of {3,4,3,4}), so it is reported unresolved, with its
// raw differences.
//
// Gates, each able to fail: the 24 rules in 12 classes; the sparse runner equals the lazy run of lazy-space.ts cell for
// cell; Q is kept in every run and D in every run of a D-conserving rule; every pulled-back collision start returns
// exactly; on negation-symmetric classes the +1 and -1 backgrounds give the same species counts by motion and speed;
// two runs of the line and the {4,4} census give identical bytes; no file draws a random number.
// Negative controls: the identity (frozen) has no mover and every two-cell start a free pair; the full swap, a fixed
// permutation of cells, scatters in no collision; a comparison of a side against itself with one species removed must
// read as different. Positive control: id.ABC.swap, which scattered 320 of 600 collisions on the M1 ring, scatters on
// the line.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  HarnessRule,
  LabInstance,
  closedInstances,
  harnessRule,
  lazySpaceFactory,
} from '@/code/compute/lab/harness'
import { LazyRun, LazySpace, cosetSpace } from '@/code/compute/lab/lazy-space'
import {
  CENSUS_ROUNDS,
  CollisionReading,
  PairSpace,
  SeedTrace,
  SpeciesReading,
  Tones,
  cappedDistance,
  collide,
  isFreeComposite,
  lineSpace,
  readSpecies,
  shapeKey,
  sparseRound,
  traceSeed,
} from '@/code/measure/particle-census'
import {
  conservesExcitation,
  fixesVacuum,
  inverseTable,
  pairRuleCensus,
  pairRuleClasses,
  commutesWithNegation,
} from '@/code/rule/pair-rule'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/measure/particle-census.ts',
  'test/experiment/computation/particle-census.ts',
]

// ---- parameters, fixed before the first run ----

const SEED_RADIUS = 2
const SEED_RADIUS_4D = 1
const CLOSED_ANCHORS = 8
const MEET_ROUND = 16
const AFTER_ROUNDS = 16
const PHASES = 4
const COLLISION_COLORS = 8
const RESET_CELLS = 200_000
// E-CMP-0027: the identity is the only class frozen on every geometry
const M1_FROZEN = 'id.ABC.id'
const FULL_SWAP = 'swap.CBA.swap'
const SCATTER_CONTROL = 'id.ABC.swap'

// ---- spaces ----

type Family = 'brick' | 'generator' | 'step-parity' | 'coset-lifted'

type Addressed = PairSpace & {
  cells(): number
  address(cell: number): string
  fromAddress(address: string): number
}

type SpaceDef = {
  key: string
  column: LabGeometryName
  family: Family
  curvature: 'flat' | 'hyperbolic'
  degree: number
  dimension: number
  make: () => Addressed
  lazy: (() => LazySpace) | null
  coloring: string
}

const joinPath = (a: string, b: string): string => (a === '' ? b : b === '' ? a : `${a}.${b}`)

// carry a cell given by its address from the origin to the anchor
function transplant(def: SpaceDef, space: Addressed, anchor: number, address: string): number {
  if (def.family === 'brick' || def.family === 'step-parity') {
    const a = space.address(anchor).split(',').map(Number)
    const b = address.split(',').map(Number)

    return space.fromAddress(a.map((x, i) => x + b[i]!).join(','))
  }

  return space.fromAddress(joinPath(space.address(anchor), address))
}

function lineAddressed(): Addressed {
  const line = lineSpace()

  return {
    ...line,
    cells: () => 0,
    address: c => `${line.position(c)}`,
    fromAddress: a => line.at(Number(a)),
  }
}

function spaceDefs(): SpaceDef[] {
  const lazyDef = (input: {
    key: string
    column: LabGeometryName
    family: Family
    curvature: 'flat' | 'hyperbolic'
    dimension: number
    make: () => LazySpace
  }): SpaceDef => {
    const probe = input.make()

    return {
      ...input,
      degree: probe.degree,
      lazy: input.make,
      coloring: probe.coloring,
      make: input.make,
    }
  }

  const m1 = (column: LabGeometryName, family: Family, curvature: 'flat' | 'hyperbolic', dimension: number): SpaceDef =>
    lazyDef({ key: column, column, family, curvature, dimension, make: lazySpaceFactory(column)! })

  const coset = (column: LabGeometryName, p: number, q: number, curvature: 'flat' | 'hyperbolic'): SpaceDef =>
    lazyDef({
      key: `${column}/coset`,
      column,
      family: 'coset-lifted',
      curvature,
      dimension: 2,
      make: () => cosetSpace({ name: `${column}/coset`, p, q }),
    })

  return [
    {
      key: 'line',
      column: 'line',
      family: 'brick',
      curvature: 'flat',
      degree: 2,
      dimension: 1,
      make: lineAddressed,
      lazy: null,
      coloring: 'brick schedule of the infinite line (2 colors, left cell first)',
    },
    m1('{4,4}', 'coset-lifted', 'flat', 2),
    m1('{6,3}', 'step-parity', 'flat', 2),
    coset('{6,3}', 6, 3, 'flat'),
    m1('{3,6}', 'coset-lifted', 'flat', 2),
    m1('{5,4}', 'generator', 'hyperbolic', 2),
    m1('{7,3}', 'coset-lifted', 'hyperbolic', 2),
    m1('{8,3}', 'coset-lifted', 'hyperbolic', 2),
    m1('{4,5}', 'coset-lifted', 'hyperbolic', 2),
    m1('{6,4}', 'generator', 'hyperbolic', 2),
    coset('{6,4}', 6, 4, 'hyperbolic'),
    m1('{3,7}', 'coset-lifted', 'hyperbolic', 2),
    m1('{3,4,3,3}', 'step-parity', 'flat', 4),
    m1('{3,4,3,4}', 'generator', 'hyperbolic', 4),
  ]
}

// the matched pairs, each under one family where one exists
const MATCHED: readonly { flat: string; hyperbolic: string; family: Family | null }[] = [
  { flat: '{4,4}', hyperbolic: '{4,5}', family: 'coset-lifted' },
  { flat: '{6,3}/coset', hyperbolic: '{6,4}/coset', family: 'coset-lifted' },
  { flat: '{3,6}', hyperbolic: '{3,7}', family: 'coset-lifted' },
  { flat: '{6,3}', hyperbolic: '{6,4}', family: null },
  { flat: '{3,4,3,3}', hyperbolic: '{3,4,3,4}', family: null },
]

// ---- classes ----

type ClassDef = {
  name: string
  rule: HarnessRule
  inverse: HarnessRule
  backgrounds: number[]
  keepsExcitation: boolean
  negationSymmetric: boolean
}

function classDefs(): { classes: ClassDef[]; ruleCount: number; classCount: number } {
  const census = pairRuleCensus()
  const classes = pairRuleClasses({ rules: census.rules })

  return {
    ruleCount: census.rules.length,
    classCount: classes.length,
    classes: classes.map(c => {
      const { name, table } = c.representative

      return {
        name,
        rule: harnessRule({ name, table }),
        inverse: harnessRule({ name: `${name}^-1`, table: inverseTable(table) }),
        backgrounds: fixesVacuum(table) ? [-1, 0, 1] : [-1, 1],
        keepsExcitation: conservesExcitation(table),
        negationSymmetric: commutesWithNegation(table),
      }
    }),
  }
}

// ---- seeds ----

type Seed = { cells: { address: string; tone: number }[] }

// the addresses of the ball of radius r around the origin, in breadth-first order
function ballAddresses(space: Addressed, r: number): string[] {
  const depth = new Map<number, number>([[0, 0]])
  const queue = [0]

  for (const u of queue) {
    if (depth.get(u)! >= r) {
      continue
    }

    for (const w of space.neighbors(u)) {
      if (!depth.has(w)) {
        depth.set(w, depth.get(u)! + 1)
        queue.push(w)
      }
    }
  }

  return queue.map(c => space.address(c))
}

function seedsFor(ball: readonly string[], background: number): Seed[] {
  const tones = [-1, 0, 1].filter(t => t !== background)
  const out: Seed[] = tones.map(t => ({ cells: [{ address: ball[0]!, tone: t }] }))

  for (const address of ball.slice(1)) {
    for (const t of tones) {
      for (const u of tones) {
        out.push({ cells: [{ address: ball[0]!, tone: t }, { address, tone: u }] })
      }
    }
  }

  return out
}

const place = (space: Addressed, seed: Seed): Tones =>
  new Map(seed.cells.map(c => [space.fromAddress(c.address), c.tone]))

// ---- census of one space, class, background and order ----

type Species = {
  reading: SpeciesReading
  seed: Seed
  seeds: number
  closed: { tried: number; persisted: number } | null
  // background, motion, speed and charge Q: the species with its period and shapes forgotten
  coarse: string
}

const coarseKey = (reading: SpeciesReading, seed: Seed, background: number): string =>
  `${background}|${reading.motion}|${reading.speed}|Q${seed.cells.reduce((s, c) => s + c.tone - background, 0)}`

type CensusCell = {
  space: string
  column: LabGeometryName
  family: Family
  curvature: 'flat' | 'hyperbolic'
  className: string
  background: number
  order: 'forward' | 'reverse'
  seedRadius: number
  seeds: number
  delocalized: number
  free: number
  openSpecies: Species[]
  species: Species[]
  collisions: { a: string; b: string; ac: string; bc: string; phase: number; color: number; outcome: string }[]
  counts: { transparent: number; scatter: number; overlap: number; mismatch: number }
  chargeFailures: number
  excitationFailures: number
  inverseFailures: number
  missed: number
}

type Holder = { def: SpaceDef; space: Addressed }

function fresh(holder: Holder): Addressed {
  if (holder.space.cells() > RESET_CELLS) {
    holder.space = holder.def.make()
  }

  return holder.space
}

const colorsOf = (n: number, order: 'forward' | 'reverse'): number[] => {
  const c = Array.from({ length: n }, (_, k) => k)

  return order === 'forward' ? c : c.reverse()
}

function closedSpace(inst: LabInstance): PairSpace {
  const s = inst.schedules.forward

  return {
    colorCount: s.partner.length,
    partner: (color, cell) => s.partner[color]![cell]!,
    isFirst: (color, cell) => s.isFirst[color]![cell] === 1,
    distance: cell => inst.distance[cell]!,
    neighbors: cell => inst.neighbors[cell]!,
  }
}

// a species persists on the closed quotient when one placement of its seed stays localized for CENSUS_ROUNDS
function closedPersistence(
  inst: LabInstance,
  cls: ClassDef,
  background: number,
  seedSpace: Addressed,
  seed: Seed,
): { tried: number; persisted: number } {
  const space = closedSpace(inst)
  const colors = colorsOf(space.colorCount, 'forward')
  const seen = new Set<number>([0])

  // anchors: the first cells in breadth-first order from cell 0
  const queue = [0]

  for (const u of queue) {
    if (queue.length >= CLOSED_ANCHORS) {
      break
    }

    for (const w of inst.neighbors[u]!) {
      if (!seen.has(w) && queue.length < CLOSED_ANCHORS) {
        seen.add(w)
        queue.push(w)
      }
    }
  }

  const tones = seed.cells.map(c => c.tone)
  const d =
    seed.cells.length === 1
      ? 0
      : capped(seedSpace, seedSpace.fromAddress(seed.cells[0]!.address), seedSpace.fromAddress(seed.cells[1]!.address))

  let tried = 0
  let persisted = 0

  for (const anchor of queue) {
    const near = [...new Set(inst.neighbors[anchor]!.flatMap(w => [w, ...inst.neighbors[w]!]))].sort((x, y) => x - y)
    const partners = d === 0 ? [-1] : near.filter(v => v !== anchor && capped(space, anchor, v) === d)

    for (const v of partners) {
      const start: Tones = new Map([[anchor, tones[0]!]])

      if (v >= 0) {
        start.set(v, tones[1]!)
      }

      tried++

      const trace = traceSeed({ space, colors, rule: cls.rule, background, start, rounds: CENSUS_ROUNDS })

      if (trace.localized) {
        persisted++
      }
    }

    if (persisted > 0) {
      break
    }
  }

  return { tried, persisted }
}

const capped = cappedDistance

function leadingCell(space: Addressed, state: Tones): number {
  let best = -1
  let bestD = -1
  let bestA = ''

  for (const c of state.keys()) {
    const d = space.distance(c)
    const a = space.address(c)

    if (d > bestD || (d === bestD && a < bestA)) {
      best = c
      bestD = d
      bestA = a
    }
  }

  return best
}

function censusCell(input: {
  def: SpaceDef
  cls: ClassDef
  background: number
  order: 'forward' | 'reverse'
  seedRadius: number
  closed: LabInstance | null
  withCollisions: boolean
}): CensusCell {
  const { def, cls, background, order, seedRadius, closed } = input
  const holder: Holder = { def, space: def.make() }
  const colors = colorsOf(holder.space.colorCount, order)
  const ball = ballAddresses(holder.space, seedRadius)
  const seeds = seedsFor(ball, background)
  const bySpecies = new Map<string, Species>()
  const run = (space: Addressed, start: Tones): SeedTrace =>
    traceSeed({ space, colors, rule: cls.rule, background, start, rounds: CENSUS_ROUNDS })

  let delocalized = 0
  let free = 0
  let chargeFailures = 0
  let excitationFailures = 0

  for (const seed of seeds) {
    const space = fresh(holder)
    const start = place(space, seed)
    const trace = run(space, start)

    if (!trace.chargeKept) {
      chargeFailures++
    }

    if (cls.keepsExcitation && !trace.excitationKept) {
      excitationFailures++
    }

    if (!trace.localized) {
      delocalized++
      continue
    }

    if (
      seed.cells.length === 2 &&
      isFreeComposite({
        space,
        colors,
        rule: cls.rule,
        background,
        parts: [...start].map(([c, t]) => new Map([[c, t]])),
        rounds: CENSUS_ROUNDS,
      })
    ) {
      free++
      continue
    }

    const reading = readSpecies(trace, background)
    const known = bySpecies.get(reading.key)

    if (known) {
      known.seeds++
    } else {
      bySpecies.set(reading.key, { reading, seed, seeds: 1, closed: null, coarse: coarseKey(reading, seed, background) })
    }
  }

  const openSpecies = [...bySpecies.values()].sort((x, y) => (x.reading.key < y.reading.key ? -1 : 1))

  for (const s of openSpecies) {
    s.closed = closed ? closedPersistence(closed, cls, background, fresh(holder), s.seed) : null
  }

  const species = openSpecies.filter(s => s.closed !== null && s.closed.persisted > 0)
  const collisions: CensusCell['collisions'] = []
  const counts = { transparent: 0, scatter: 0, overlap: 0, mismatch: 0 }

  let inverseFailures = 0
  let missed = 0

  if (input.withCollisions) {
    const movers = species.filter(s => s.reading.motion === 'ballistic' || s.reading.motion === 'wandering')

    for (const a of movers) {
      for (const b of species) {
        for (let k = 0; k < PHASES; k++) {
          const meet = MEET_ROUND + k
          const space = fresh(holder)
          const aStart = place(space, a.seed)
          const aAt = new Map(aStart)

          for (let t = 0; t < meet; t++) {
            sparseRound({ space, colors, rule: cls.rule, background, state: aAt })
          }

          const lead = leadingCell(space, aAt)
          const bShape = shapeKey(space, place(space, b.seed))

          for (let color = 0; color < Math.min(COLLISION_COLORS, space.colorCount); color++) {
            const target = space.partner(color, lead)

            const record = (outcome: string): void => {
              collisions.push({ a: a.reading.key, b: b.reading.key, ac: a.coarse, bc: b.coarse, phase: k, color, outcome })
            }

            if (target < 0 || aAt.has(target)) {
              counts.overlap++
              record('overlap')
              continue
            }

            const bAtMeet: Tones = new Map(
              b.seed.cells.map((c, i) => [i === 0 ? target : transplant(def, space, target, c.address), c.tone]),
            )

            if (bAtMeet.size !== b.seed.cells.length || shapeKey(space, bAtMeet) !== bShape) {
              counts.mismatch++
              record('mismatch')
              continue
            }

            const r: CollisionReading = collide({
              space,
              colors,
              rule: cls.rule,
              inverse: cls.inverse,
              background,
              a: aStart,
              bAtMeet,
              meet,
              after: AFTER_ROUNDS,
            })

            if (!r.inverseExact) {
              inverseFailures++
            }

            if (r.kind !== 'overlap' && r.closest > 1) {
              missed++
            }

            counts[r.kind]++
            record(r.kind === 'scatter' ? `scatter ${r.products.join(' ')}` : r.kind)
          }
        }
      }
    }
  }

  return {
    space: def.key,
    column: def.column,
    family: def.family,
    curvature: def.curvature,
    className: cls.name,
    background,
    order,
    seedRadius,
    seeds: seeds.length,
    delocalized,
    free,
    openSpecies,
    species,
    collisions,
    counts,
    chargeFailures,
    excitationFailures,
    inverseFailures,
    missed,
  }
}

// ---- gates ----

// the sparse runner against the lazy run of lazy-space.ts, cell for cell, every round
function sparseEqualsLazy(def: SpaceDef, cls: ClassDef, background: number): { runs: number; failures: number } {
  if (!def.lazy) {
    return { runs: 0, failures: 0 }
  }

  const space = def.lazy()
  const seeds = seedsFor(ballAddresses(space, 1), background).slice(0, 20)
  const colors = colorsOf(space.colorCount, 'forward')

  let failures = 0

  for (const seed of seeds) {
    const start = place(space, seed)
    const lazy = new LazyRun({ space, background, colors, supportCap: 1_000_000 })
    const state = new Map(start)

    for (const [c, t] of start) {
      lazy.set(c, t)
    }

    for (let t = 0; t < 30; t++) {
      lazy.round(cls.rule)
      sparseRound({ space, colors, rule: cls.rule, background, state })

      if (lazy.state.size !== state.size || [...state].some(([c, v]) => lazy.get(c) !== v)) {
        failures++
        break
      }
    }
  }

  return { runs: seeds.length, failures }
}

const motionSignature = (cell: CensusCell): string =>
  cell.species
    .map(s => `${s.reading.motion}|${s.reading.period}|${s.reading.speed}`)
    .sort()
    .join(';')

type Comparison = {
  pair: string
  family: Family | null
  className: string
  background: number
  order: 'forward' | 'reverse'
  flatSpecies: number
  hyperbolicSpecies: number
  speciesOnlyFlat: string[]
  speciesOnlyHyperbolic: string[]
  sharedPairs: number
  outcomeDifferences: string[]
  differs: boolean
  // the same, with each species read by its coarse key and each outcome by its kind
  coarseOnlyFlat: string[]
  coarseOnlyHyperbolic: string[]
  coarseSharedPairs: number
  coarseOutcomeDifferences: string[]
  coarseDiffers: boolean
}

function outcomeSets(cell: CensusCell, coarse: boolean): Map<string, string> {
  const sets = new Map<string, Set<string>>()

  for (const c of cell.collisions) {
    const key = coarse ? `${c.ac} x ${c.bc}` : `${c.a} x ${c.b}`
    const set = sets.get(key) ?? new Set<string>()

    set.add(coarse ? c.outcome.split(' ')[0]! : c.outcome)
    sets.set(key, set)
  }

  return new Map([...sets].map(([k, s]) => [k, [...s].sort().join(' / ')]))
}

function sideDifference(
  flat: CensusCell,
  hyperbolic: CensusCell,
  coarse: boolean,
): { onlyFlat: string[]; onlyHyperbolic: string[]; shared: number; outcomes: string[] } {
  const key = (s: Species): string => (coarse ? s.coarse : s.reading.key)
  const fKeys = new Set(flat.species.map(key))
  const hKeys = new Set(hyperbolic.species.map(key))
  const fOut = outcomeSets(flat, coarse)
  const hOut = outcomeSets(hyperbolic, coarse)
  const shared = [...fOut.keys()].filter(k => hOut.has(k))

  return {
    onlyFlat: [...fKeys].filter(k => !hKeys.has(k)).sort(),
    onlyHyperbolic: [...hKeys].filter(k => !fKeys.has(k)).sort(),
    shared: shared.length,
    outcomes: shared.filter(k => fOut.get(k) !== hOut.get(k)).map(k => `${k}: ${fOut.get(k)} against ${hOut.get(k)}`),
  }
}

function compare(flat: CensusCell, hyperbolic: CensusCell, pair: string, family: Family | null): Comparison {
  const exact = sideDifference(flat, hyperbolic, false)
  const coarse = sideDifference(flat, hyperbolic, true)

  return {
    pair,
    family,
    className: flat.className,
    background: flat.background,
    order: flat.order,
    flatSpecies: flat.species.length,
    hyperbolicSpecies: hyperbolic.species.length,
    speciesOnlyFlat: exact.onlyFlat,
    speciesOnlyHyperbolic: exact.onlyHyperbolic,
    sharedPairs: exact.shared,
    outcomeDifferences: exact.outcomes,
    differs: exact.onlyFlat.length + exact.onlyHyperbolic.length + exact.outcomes.length > 0,
    coarseOnlyFlat: coarse.onlyFlat,
    coarseOnlyHyperbolic: coarse.onlyHyperbolic,
    coarseSharedPairs: coarse.shared,
    coarseOutcomeDifferences: coarse.outcomes,
    coarseDiffers: coarse.onlyFlat.length + coarse.onlyHyperbolic.length + coarse.outcomes.length > 0,
  }
}

// ---- the census ----

export type ParticleCensus = {
  ruleCount: number
  classCount: number
  cells: CensusCell[]
  comparisons: Comparison[]
  closedInfo: { column: LabGeometryName; name: string; size: number; colors: number; systole: number | null }[]
  spaceInfo: { key: string; family: Family; curvature: string; degree: number; coloring: string; seedRadius: number }[]
  sparseLazy: { runs: number; failures: number }
  identityMovers: number
  identityNonFree: number
  identityNonStatic: number
  fullSwapScatter: number
  scatterControl: number
  plantedDifferenceCaught: boolean
  negationFailures: string[]
  serialized: string
}

export function particleCensus(input: { scale: number; only?: readonly string[] }): ParticleCensus {
  const { classes, ruleCount, classCount } = classDefs()
  const defs = spaceDefs().filter(d => !input.only || input.only.includes(d.key))
  const closedByColumn = new Map<LabGeometryName, LabInstance>()

  for (const inst of closedInstances()) {
    if (!closedByColumn.has(inst.column)) {
      closedByColumn.set(inst.column, inst)
    }
  }

  const identity = classes.find(c => c.name === M1_FROZEN)!
  const read = classes.filter(c => c.name !== M1_FROZEN)
  const cells: CensusCell[] = []
  const pairedKeys = new Set(MATCHED.filter(m => m.family).flatMap(m => [m.flat, m.hyperbolic]))

  let identityMovers = 0
  let identityNonFree = 0
  let identityNonStatic = 0

  const spaceInfo: ParticleCensus['spaceInfo'] = []
  const sparseLazy = { runs: 0, failures: 0 }

  for (const def of defs) {
    const seedRadius = def.dimension === 4 && input.scale < 1.5 ? SEED_RADIUS_4D : SEED_RADIUS
    const closed = closedByColumn.get(def.column) ?? null
    const orders: ('forward' | 'reverse')[] = pairedKeys.has(def.key) ? ['forward', 'reverse'] : ['forward']

    spaceInfo.push({
      key: def.key,
      family: def.family,
      curvature: def.curvature,
      degree: def.degree,
      coloring: def.coloring,
      seedRadius,
    })

    for (const cls of [identity, read.find(c => c.name === SCATTER_CONTROL)!, read.find(c => !c.keepsExcitation)!]) {
      const g = sparseEqualsLazy(def, cls, cls.backgrounds.includes(0) ? 0 : 1)

      sparseLazy.runs += g.runs
      sparseLazy.failures += g.failures
    }

    for (const background of identity.backgrounds) {
      const cell = censusCell({ def, cls: identity, background, order: 'forward', seedRadius, closed, withCollisions: false })

      identityMovers += cell.openSpecies.filter(s => s.reading.motion !== 'static').length
      identityNonStatic += cell.delocalized
      identityNonFree += cell.openSpecies.filter(s => s.seed.cells.length === 2).length
    }

    for (const order of orders) {
      for (const cls of read) {
        for (const background of cls.backgrounds) {
          cells.push(censusCell({ def, cls, background, order, seedRadius, closed, withCollisions: true }))
        }
      }
    }
  }

  const find = (space: string, className: string, background: number, order: string): CensusCell | undefined =>
    cells.find(c => c.space === space && c.className === className && c.background === background && c.order === order)

  const comparisons: Comparison[] = []

  for (const m of MATCHED) {
    for (const cls of read) {
      for (const background of cls.backgrounds) {
        for (const order of ['forward', 'reverse'] as const) {
          const f = find(m.flat, cls.name, background, order)
          const h = find(m.hyperbolic, cls.name, background, order)

          if (f && h) {
            comparisons.push(compare(f, h, `${m.flat} vs ${m.hyperbolic}`, m.family))
          }
        }
      }
    }
  }

  // planted: a side against itself with one species removed must differ
  const sample = cells.find(c => c.species.length > 0)
  const plantedDifferenceCaught = sample
    ? compare(sample, { ...sample, species: sample.species.slice(1) }, 'planted', null).differs &&
      !compare(sample, sample, 'self', null).differs
    : false

  const fullSwapScatter = cells.filter(c => c.className === FULL_SWAP).reduce((s, c) => s + c.counts.scatter, 0)
  const scatterControl = cells
    .filter(c => c.space === 'line' && c.className === SCATTER_CONTROL)
    .reduce((s, c) => s + c.counts.scatter, 0)

  // negation symmetry: the +1 and -1 backgrounds give the same species by motion, period and speed
  const negationFailures: string[] = []

  for (const c of cells) {
    const cls = read.find(x => x.name === c.className)!

    if (!cls.negationSymmetric || c.background !== 1) {
      continue
    }

    const minus = find(c.space, c.className, -1, c.order)

    if (!minus || motionSignature(minus) !== motionSignature(c)) {
      negationFailures.push(`${c.space} ${c.className} ${c.order}`)
    }
  }

  const closedInfo = [...closedByColumn.values()].map(inst => ({
    column: inst.column,
    name: inst.name,
    size: inst.size,
    colors: inst.schedules.forward.partner.length,
    systole: inst.systole,
  }))

  const serialized = JSON.stringify(
    cells.map(c => ({
      s: c.space,
      c: c.className,
      b: c.background,
      o: c.order,
      sp: c.openSpecies.map(x => [x.reading.key, x.seeds, x.closed]),
      col: c.collisions.map(x => `${x.a}>${x.b}>${x.phase}>${x.color}>${x.outcome}`),
      d: c.delocalized,
      f: c.free,
    })),
  )

  return {
    ruleCount,
    classCount,
    cells,
    comparisons,
    closedInfo,
    spaceInfo,
    sparseLazy,
    identityMovers,
    identityNonFree,
    identityNonStatic,
    fullSwapScatter,
    scatterControl,
    plantedDifferenceCaught,
    negationFailures,
    serialized,
  }
}

export default experiment({
  id: 'computation/particle-census',
  code: 'E-CMP-0043',
  title:
    'M3 particle census: the persistent localized structures of the interacting and ballistic pair-rule classes on every lab geometry, their speeds and periods, and every two-species collision by phase offset, flat against degree-matched hyperbolic under one schedule family',
  category: 'computation',
  substrates: ['line', '{4,4}', '{6,3}', '{3,6}', '{5,4}', '{7,3}', '{8,3}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run(context) {
    const r = particleCensus({ scale: context.scale ?? 1 })
    const twice = (): string => particleCensus({ scale: 1, only: ['line', '{4,4}'] }).serialized
    const identicalBytes = twice() === twice()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const sum = (f: (c: CensusCell) => number): number => r.cells.reduce((s, c) => s + f(c), 0)
    const chargeFailures = sum(c => c.chargeFailures)
    const excitationFailures = sum(c => c.excitationFailures)
    const inverseFailures = sum(c => c.inverseFailures)
    const resolved = r.comparisons.filter(c => c.family !== null)
    const differing = resolved.filter(c => c.differs)
    const coarseDiffering = resolved.filter(c => c.coarseDiffers)
    const ok =
      r.ruleCount === 24 &&
      r.classCount === 12 &&
      r.sparseLazy.runs > 0 &&
      r.sparseLazy.failures === 0 &&
      chargeFailures === 0 &&
      excitationFailures === 0 &&
      inverseFailures === 0 &&
      r.identityMovers === 0 &&
      r.identityNonFree === 0 &&
      r.identityNonStatic === 0 &&
      r.fullSwapScatter === 0 &&
      r.scatterControl > 0 &&
      r.plantedDifferenceCaught &&
      r.negationFailures.length === 0 &&
      identicalBytes &&
      findings.length === 0
    const failures = [
      ...(r.ruleCount === 24 && r.classCount === 12 ? [] : ['rule census']),
      ...(r.sparseLazy.failures === 0 && r.sparseLazy.runs > 0 ? [] : [`sparse vs lazy ${r.sparseLazy.failures}`]),
      ...(chargeFailures === 0 ? [] : [`charge ${chargeFailures}`]),
      ...(excitationFailures === 0 ? [] : [`excitation ${excitationFailures}`]),
      ...(inverseFailures === 0 ? [] : [`inverse ${inverseFailures}`]),
      ...(r.identityMovers === 0 && r.identityNonFree === 0 && r.identityNonStatic === 0
        ? []
        : [`identity control ${r.identityMovers}/${r.identityNonFree}/${r.identityNonStatic}`]),
      ...(r.fullSwapScatter === 0 ? [] : [`full swap scattered ${r.fullSwapScatter}`]),
      ...(r.scatterControl > 0 ? [] : ['id.ABC.swap scattered nothing on the line']),
      ...(r.plantedDifferenceCaught ? [] : ['planted comparison']),
      ...r.negationFailures.map(n => `negation ${n}`),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]
    const species = sum(c => c.species.length)
    const openOnly = sum(c => c.openSpecies.length - c.species.length)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the interacting and ballistic pair-rule classes carry ${species} species (class x geometry x background x order cells summed) that persist 100 rounds on the exact open window and on a closed quotient; of ${resolved.length} flat-against-hyperbolic comparisons under one schedule family (the coset coloring, both orders), ${differing.length} differ in exact species or collision outcomes and ${coarseDiffering.length} still differ with species read by motion, speed and charge and outcomes by kind; the 4D pair and the M1-family {6,3} against {6,4} have no common schedule family and stay unresolved`,
      metrics: {
        cells: r.cells.length,
        seeds: sum(c => c.seeds),
        species,
        openOnlySpecies: openOnly,
        freePairs: sum(c => c.free),
        delocalized: sum(c => c.delocalized),
        collisions: sum(c => c.collisions.length),
        transparent: sum(c => c.counts.transparent),
        scatter: sum(c => c.counts.scatter),
        overlap: sum(c => c.counts.overlap),
        mismatch: sum(c => c.counts.mismatch),
        missed: sum(c => c.missed),
        comparisonsOneFamily: resolved.length,
        comparisonsDiffering: differing.length,
        comparisonsDifferingCoarse: coarseDiffering.length,
        comparisonsUnresolved: r.comparisons.length - resolved.length,
        sparseLazyRuns: r.sparseLazy.runs,
        chargeFailures,
        excitationFailures,
        inverseFailures,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityMovers: r.identityMovers,
        identityNonFree: r.identityNonFree,
        fullSwapScatter: r.fullSwapScatter,
        scatterControlOnLine: r.scatterControl,
        plantedDifferenceCaught: r.plantedDifferenceCaught ? 1 : 0,
      },
      notes:
        `M3-A. Spaces: ${r.spaceInfo.map(s => `${s.key} ${s.family} r${s.seedRadius}`).join(', ')}. Closed quotients: ${r.closedInfo.map(c => `${c.name} (${c.size} cells, ${c.colors} colors, systole field ${c.systole})`).join(', ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
