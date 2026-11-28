// M3 driver (item vibe-computation-models-0069 part d): the particle census of E-CMP-0043 (M3-A,
// test/experiment/computation/particle-census.ts) under a second coloring of every tiling, so that a flat against
// hyperbolic difference can be split from a coloring difference (audit finding 0045, P16 of m12-predictions.md).
//
//   pnpm call task/m3/census-second-coloring.ts [--colorings base|second|base,second] [--spaces 4.4,4.5,...]
//                                               [--scale 1]
//
// Spaces are columns written with dots ({4,4} is 4.4). Colorings:
// - base: E-CMP-0043's open window of the column (lazySpaceFactory: the lifted coloring variant 0 on the coset
//   tilings, the generator coloring on {5,4}, {6,4}, {3,4,3,4}, step-parity on {6,3} and {3,4,3,3}), plus the coset
//   rebuilds {6,3}/coset and {6,4}/coset (lifted variant 0), as the experiment.
// - second: code/compute/lab/harness.ts lazyVariants, the schedule variants item 0045 built for this: the lifted
//   coloring variant 1 (code/substrate/coxeter/lifted-coloring.ts, the next 1-factorization in search order) on every
//   coset tiling and on {6,3} and {6,4}; the lifted coloring variant 0 on {5,4} (its second family); and on the two
//   degree-24 spaces, which have no second coloring here, a color-order permutation (stride) of their base coloring.
// The census itself (seeds, species, closed persistence on the M1 quotient, collisions, the exact and coarse
// comparisons) is the experiment's, copied between pin markers (it is file-local there); the driver refuses to run
// unless each copied block occurs in the experiment's source, whitespace collapsed.
//
// Comparisons printed: (1) flat against degree-matched hyperbolic under the second coloring, both orders, on the three
// 2D pairs ({4,4}/{4,5}, {6,3}/{6,4}, {3,6}/{3,7}; the 4D pair under its stride order, unresolved as in E-CMP-0043);
// (2) each tiling's base coloring against its second (the coloring effect at fixed curvature), forward order. A
// pair difference that holds under both colorings, while the coloring effect on each side is smaller, is what P16
// needs before curvature is credited; that reading is left to the write-up.
//
// With no flags it reproduces E-CMP-0043's forward totals of every space but the line (species, collisions,
// transparent / scatter / overlap / mismatch) and its comparison rows. Each census cell prints one JSON line, each
// comparison one; the closing SUMMARY line holds the totals per space, coloring and order, the comparison tallies and
// the gate failures (charge or excitation not kept, an inexact pulled-back collision, the sparse runner against
// lazy-space.ts). Exit code 1 when a gate fails.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  type HarnessRule,
  type LabInstance,
  closedInstances,
  harnessRule,
  lazySpaceFactory,
  lazyVariants,
} from '@/code/compute/lab/harness'
import { type LazySpace, LazyRun, cosetSpace } from '@/code/compute/lab/lazy-space'
import {
  CENSUS_ROUNDS,
  type CollisionReading,
  type PairSpace,
  type SeedTrace,
  type SpeciesReading,
  type Tones,
  cappedDistance,
  collide,
  isFreeComposite,
  readSpecies,
  shapeKey,
  sparseRound,
  traceSeed,
} from '@/code/measure/particle-census'
import {
  commutesWithNegation,
  conservesExcitation,
  fixesVacuum,
  inverseTable,
  pairRuleCensus,
  pairRuleClasses,
} from '@/code/rule/pair-rule'
import { type LabGeometryName } from '@/code/substrate/lab-geometry'
import { flags, listFlag, seconds, summary } from './args'

// pin:start parameters
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
// pin:end parameters

// pin:start family
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
// pin:end family

// pin:start classes
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
// pin:end classes

// pin:start seeds
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
// pin:end seeds

// pin:start cell
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
// pin:end cell

// pin:start persistence
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
// pin:end persistence

// pin:start censusCell
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
// pin:end censusCell

// pin:start sparseEqualsLazy
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
// pin:end sparseEqualsLazy

// pin:start compare
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
// pin:end compare

// parameters, family, classes, seeds, cell, persistence, censusCell, sparseEqualsLazy, compare
const PINNED_BLOCKS = 9

function checkPins(): string[] {
  const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim()
  const own = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const experiment = collapse(
    readFileSync(fileURLToPath(new URL('../../test/experiment/computation/particle-census.ts', import.meta.url)), 'utf8'),
  )
  const blocks = [...own.matchAll(/\/\/ pin:start (\S+)\n([\s\S]*?)\/\/ pin:end \1\n/g)]
  const missing = blocks.filter(m => !experiment.includes(collapse(m[2]!))).map(m => m[1]!)

  if (blocks.length !== PINNED_BLOCKS) {
    missing.push(`${blocks.length} pinned blocks found, expected ${PINNED_BLOCKS}`)
  }

  return missing
}

// ---- the spaces of each coloring ----

type Coloring = 'base' | 'second'

type Column = { column: LabGeometryName; curvature: 'flat' | 'hyperbolic'; dimension: number; baseFamily: Family }

// E-CMP-0043's columns (the line has no second coloring and is left out)
const COLUMNS: readonly Column[] = [
  { column: '{4,4}', curvature: 'flat', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{6,3}', curvature: 'flat', dimension: 2, baseFamily: 'step-parity' },
  { column: '{3,6}', curvature: 'flat', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{5,4}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'generator' },
  { column: '{7,3}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{8,3}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{4,5}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{6,4}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'generator' },
  { column: '{3,7}', curvature: 'hyperbolic', dimension: 2, baseFamily: 'coset-lifted' },
  { column: '{3,4,3,3}', curvature: 'flat', dimension: 4, baseFamily: 'step-parity' },
  { column: '{3,4,3,4}', curvature: 'hyperbolic', dimension: 4, baseFamily: 'generator' },
]

const defOf = (input: Omit<SpaceDef, 'degree' | 'coloring' | 'lazy' | 'make'> & { make: () => LazySpace }): SpaceDef => {
  const probe = input.make()

  return { ...input, degree: probe.degree, coloring: probe.coloring, lazy: input.make, make: input.make }
}

// the spaces of one column under one coloring, with E-CMP-0043's keys for the base coloring
function spacesOf(col: Column, coloring: Coloring): SpaceDef[] {
  const { column, curvature, dimension } = col
  const symbol = column.slice(1, -1).split(',').map(Number)

  if (coloring === 'base') {
    const out = [defOf({ key: column, column, family: col.baseFamily, curvature, dimension, make: lazySpaceFactory(column)! })]

    if (column === '{6,3}' || column === '{6,4}') {
      out.push(
        defOf({
          key: `${column}/coset`,
          column,
          family: 'coset-lifted',
          curvature,
          dimension,
          make: () => cosetSpace({ name: `${column}/coset`, p: symbol[0]!, q: symbol[1]! }),
        }),
      )
    }

    return out
  }

  // second: every variant lazyVariants lists, but the lifted variant 0 of {6,3} and {6,4}, which is the base
  // coloring's {6,3}/coset and {6,4}/coset already
  return lazyVariants(column)
    .filter(v => !((column === '{6,3}' || column === '{6,4}') && v.variant === 'lifted-0'))
    .map(v =>
      defOf({
        key: `${column}/${v.variant}`,
        column,
        family: v.family === 'lifted' ? 'coset-lifted' : (v.family as Family),
        curvature,
        dimension,
        make: v.make,
      }),
    )
}

// the matched pairs: E-CMP-0043's (base) and the same pairs under the second coloring
const MATCHED: readonly { coloring: Coloring; flat: string; hyperbolic: string; family: Family | null }[] = [
  { coloring: 'base', flat: '{4,4}', hyperbolic: '{4,5}', family: 'coset-lifted' },
  { coloring: 'base', flat: '{6,3}/coset', hyperbolic: '{6,4}/coset', family: 'coset-lifted' },
  { coloring: 'base', flat: '{3,6}', hyperbolic: '{3,7}', family: 'coset-lifted' },
  { coloring: 'base', flat: '{6,3}', hyperbolic: '{6,4}', family: null },
  { coloring: 'base', flat: '{3,4,3,3}', hyperbolic: '{3,4,3,4}', family: null },
  { coloring: 'second', flat: '{4,4}/lifted-1', hyperbolic: '{4,5}/lifted-1', family: 'coset-lifted' },
  { coloring: 'second', flat: '{6,3}/lifted-1', hyperbolic: '{6,4}/lifted-1', family: 'coset-lifted' },
  { coloring: 'second', flat: '{3,6}/lifted-1', hyperbolic: '{3,7}/lifted-1', family: 'coset-lifted' },
  { coloring: 'second', flat: '{3,4,3,3}/stride-5', hyperbolic: '{3,4,3,4}/stride-5', family: null },
]

// ---- the run ----

const f = flags()
const coloringWords = listFlag(f, 'colorings', ['base'])

for (const c of coloringWords) {
  if (c !== 'base' && c !== 'second') {
    throw new Error(`census-second-coloring: --colorings takes base and second, got ${c}`)
  }
}

const colorings = coloringWords as Coloring[]
const only = listFlag(f, 'spaces', COLUMNS.map(c => c.column.slice(1, -1).replaceAll(',', '.'))).map(s => `{${s.replaceAll('.', ',')}}`)
const scale = Number(f.get('scale') ?? '1')
const start = performance.now()
const log = (line: string): void => console.log(`${line} (${seconds(start)} s)`)

const missingPins = checkPins()

if (missingPins.length > 0) {
  throw new Error(`census-second-coloring: pinned blocks differ from the experiment's source: ${missingPins.join(', ')}`)
}

const { classes, ruleCount, classCount } = classDefs()
const read = classes.filter(c => c.name !== M1_FROZEN)
const closedByColumn = new Map<LabGeometryName, LabInstance>()

for (const inst of closedInstances()) {
  if (!closedByColumn.has(inst.column)) {
    closedByColumn.set(inst.column, inst)
  }
}

const defs = COLUMNS.filter(c => only.includes(c.column)).flatMap(col =>
  colorings.flatMap(coloring => spacesOf(col, coloring).map(def => ({ def, coloring }))),
)
const pairedKeys = new Set(MATCHED.filter(m => m.family).flatMap(m => [m.flat, m.hyperbolic]))
const cells: (CensusCell & { coloring: Coloring })[] = []
const gate = { sparseRuns: 0, sparseFailures: 0, chargeFailures: 0, excitationFailures: 0, inverseFailures: 0 }

log(`rules ${ruleCount} in ${classCount} classes; colorings ${colorings.join(',')}; scale ${scale}; spaces ${defs.map(d => d.def.key).join(' ')}`)

for (const { def, coloring } of defs) {
  const t0 = performance.now()
  const seedRadius = def.dimension === 4 && scale < 1.5 ? SEED_RADIUS_4D : SEED_RADIUS
  const closed = closedByColumn.get(def.column) ?? null
  const orders: ('forward' | 'reverse')[] = pairedKeys.has(def.key) ? ['forward', 'reverse'] : ['forward']

  log(`${def.key} (${coloring}): ${def.coloring}; seed radius ${seedRadius}; orders ${orders.join(',')}`)

  for (const cls of [classes.find(c => c.name === M1_FROZEN)!, read.find(c => c.name === 'id.ABC.swap')!, read.find(c => !c.keepsExcitation)!]) {
    const g = sparseEqualsLazy(def, cls, cls.backgrounds.includes(0) ? 0 : 1)

    gate.sparseRuns += g.runs
    gate.sparseFailures += g.failures
  }

  for (const order of orders) {
    for (const cls of read) {
      for (const background of cls.backgrounds) {
        const cell = censusCell({ def, cls, background, order, seedRadius, closed, withCollisions: true })

        gate.chargeFailures += cell.chargeFailures
        gate.excitationFailures += cell.excitationFailures
        gate.inverseFailures += cell.inverseFailures
        cells.push({ ...cell, coloring })
        console.log(
          JSON.stringify({
            coloring,
            space: cell.space,
            className: cell.className,
            background: cell.background,
            order: cell.order,
            seedRadius: cell.seedRadius,
            seeds: cell.seeds,
            species: cell.species.length,
            openSpecies: cell.openSpecies.length,
            collisions: cell.collisions.length,
            counts: cell.counts,
            delocalized: cell.delocalized,
            free: cell.free,
          }),
        )
      }
    }
  }

  log(`${def.key} (${coloring}) done in ${seconds(t0)} s`)
}

const find = (space: string, className: string, background: number, order: string): CensusCell | undefined =>
  cells.find(c => c.space === space && c.className === className && c.background === background && c.order === order)

const comparisons: (Comparison & { kind: 'pair' | 'coloring'; coloring: string })[] = []

for (const m of MATCHED) {
  for (const cls of read) {
    for (const background of cls.backgrounds) {
      for (const order of ['forward', 'reverse'] as const) {
        const fc = find(m.flat, cls.name, background, order)
        const hc = find(m.hyperbolic, cls.name, background, order)

        if (fc && hc) {
          comparisons.push({ ...compare(fc, hc, `${m.flat} vs ${m.hyperbolic}`, m.family), kind: 'pair', coloring: m.coloring })
        }
      }
    }
  }
}

// the coloring effect at fixed curvature: each base space against each second space of its column, forward order
// (the flat/hyperbolic fields of a Comparison then read base/second)
for (const col of COLUMNS.filter(c => only.includes(c.column))) {
  if (!colorings.includes('base') || !colorings.includes('second')) {
    break
  }

  for (const b of spacesOf(col, 'base')) {
    for (const s of spacesOf(col, 'second')) {
      for (const cls of read) {
        for (const background of cls.backgrounds) {
          const bc = find(b.key, cls.name, background, 'forward')
          const sc = find(s.key, cls.name, background, 'forward')

          if (bc && sc) {
            comparisons.push({ ...compare(bc, sc, `${b.key} vs ${s.key}`, null), kind: 'coloring', coloring: 'base vs second' })
          }
        }
      }
    }
  }
}

for (const c of comparisons) {
  console.log(
    JSON.stringify({
      kind: c.kind,
      pair: c.pair,
      className: c.className,
      background: c.background,
      order: c.order,
      flatSpecies: c.flatSpecies,
      hyperbolicSpecies: c.hyperbolicSpecies,
      differs: c.differs,
      coarseDiffers: c.coarseDiffers,
      coarseSpeciesDiffer: c.coarseOnlyFlat.length + c.coarseOnlyHyperbolic.length > 0,
      coarseOutcomeKindsDiffer: c.coarseOutcomeDifferences.length > 0,
    }),
  )
}

// totals per space, coloring and order (the experiment's "Totals by space" columns)
const totals: object[] = []

for (const key of [...new Set(cells.map(c => `${c.coloring}|${c.space}|${c.order}`))]) {
  const [coloring, space, order] = key.split('|')
  const group = cells.filter(c => c.coloring === coloring && c.space === space && c.order === order)
  const species = group.flatMap(c => c.species)
  const motion = (m: string): number => species.filter(s => s.reading.motion === m).length
  const sum = (k: 'transparent' | 'scatter' | 'overlap' | 'mismatch'): number => group.reduce((n, c) => n + c.counts[k], 0)
  const row = {
    coloring,
    space,
    order,
    cells: group.length,
    species: species.length,
    motions: `${motion('static')} / ${motion('periodic')} / ${motion('ballistic')} / ${motion('wandering')}`,
    openOnly: group.reduce((n, c) => n + c.openSpecies.length - c.species.length, 0),
    free: group.reduce((n, c) => n + c.free, 0),
    delocalized: group.reduce((n, c) => n + c.delocalized, 0),
    collisions: group.reduce((n, c) => n + c.collisions.length, 0),
    outcomes: `${sum('transparent')} / ${sum('scatter')} / ${sum('overlap')} / ${sum('mismatch')}`,
  }

  totals.push(row)
  console.log(`totals ${JSON.stringify(row)}`)
}

// comparison tallies per pair and order (the experiment's "Flat against degree-matched hyperbolic" columns)
const tallies: object[] = []

for (const key of [...new Set(comparisons.map(c => `${c.kind}|${c.pair}|${c.order}`))]) {
  const [kind, pair, order] = key.split('|')
  const group = comparisons.filter(c => c.kind === kind && c.pair === pair && c.order === order)
  const row = {
    kind,
    pair,
    order,
    cells: group.length,
    exactDiffers: group.filter(c => c.differs).length,
    coarseDiffers: group.filter(c => c.coarseDiffers).length,
    coarseSpeciesDiffer: group.filter(c => c.coarseOnlyFlat.length + c.coarseOnlyHyperbolic.length > 0).length,
    coarseOutcomeKindsDiffer: group.filter(c => c.coarseOutcomeDifferences.length > 0).length,
  }

  tallies.push(row)
  console.log(`tally ${JSON.stringify(row)}`)
}

const failures = Object.entries(gate)
  .filter(([k, v]) => k !== 'sparseRuns' && v > 0)
  .map(([k, v]) => `${k} ${v}`)

log(`gates ${JSON.stringify(gate)}; failures: ${failures.length === 0 ? 'none' : failures.join(', ')}`)

summary({
  item: 'vibe-computation-models-0069',
  part: 'd',
  colorings,
  scale,
  spaces: defs.map(d => ({ key: d.def.key, coloring: d.coloring, family: d.def.family, description: d.def.coloring })),
  totals,
  tallies,
  gate,
  failures,
  seconds: seconds(start),
})

if (failures.length > 0) {
  process.exitCode = 1
}
