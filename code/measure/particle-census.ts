// The M3 particle census (item vibe-computation-models-0012). Algebra: spin-one. A conservative reversible pair rule
// runs on a cell graph under a partition schedule (decision 002); this module reads, from exact sparse runs, which
// small starts become persistent localized structures (species), how they move, and what two of them do when they meet.
//
// SPACE. Any graph with a schedule: `PairSpace` gives the partner of a cell in each color (-1 when the color leaves it
// unmatched), which cell of a pair is first (the orientation), the facet distance from the origin, and the facet
// neighbours. The lazy windows of code/compute/lab/lazy-space.ts satisfy it as they are; a closed quotient satisfies it
// through its schedule arrays; `lineSpace` below is the infinite line. Nothing here builds or imports a tiling, so the
// module stays in layer 1.
//
// RUNS. A state is a map from cell to tone over the cells off a uniform background the rule fixes; a round applies the
// rule to every matched pair of each color in order (`sparseRound`). Every round of a bijective rule is a bijection of
// finite-support states, so a state that returns to its start is periodic forever.
//
// SPECIES (declared before the first run). A start is LOCALIZED over a run when at every round end its support has at
// most SPECIES_MAX_CELLS cells and forms ONE cluster, two cells being linked when they are at most LINK_DISTANCE facets
// apart (read exactly through the neighbour lists: equal, adjacent, sharing a neighbour, or farther). Its reading:
//   - static: the state returns exactly after 1 round; periodic: it returns exactly after P > 1 rounds (in place);
//   - ballistic: in the late window (rounds LATE_FROM to the end) its shape key repeats with period P and its distance
//     from the origin (the nearest support cell) grows by the same positive amount every P rounds, speed = that amount
//     over P, an exact fraction in hops per round;
//   - wandering: localized, none of the above.
// The shape key is an exact invariant of the configuration under every tiling automorphism: the sorted tones and the
// sorted (tone, tone, capped distance) of every pair of support cells. The species key is the background, the motion,
// the period, the speed and the set of shape keys in the late window. A two-cell start whose run equals, at every
// round, the union of the two one-cell runs is a FREE PAIR (two independent species side by side) and not a species.
//
// COLLISIONS. A mover A starts at its seed; B is placed, at round H, next to the cell A then occupies (its partner in
// one color), and run back H rounds with the inverse rule and the reversed colors, so that without interaction the two
// would sit side by side at round H. The joint run, A alone and B alone run H + W rounds. TRANSPARENT: the joint state
// is the union of the two lone states at every round. SCATTER: it is not; the products are the shape keys of the joint
// state's clusters at the end. OVERLAP: the two starts touch (within LINK_DISTANCE), so the start is not a collision.

export type PairSpace = {
  readonly colorCount: number
  partner(color: number, cell: number): number
  isFirst(color: number, cell: number): boolean
  distance(cell: number): number
  neighbors(cell: number): readonly number[]
}

// the decoded output tones of every pair index p = (a + 1) * 3 + (b + 1)
export type CensusRule = {
  readonly first: Int8Array
  readonly second: Int8Array
}

export type Tones = Map<number, number>

// ---- parameters, fixed before the first run ----

export const CENSUS_ROUNDS = 100
export const SPECIES_MAX_CELLS = 4
export const LINK_DISTANCE = 2
export const LATE_FROM = 50
export const MAX_SHAPE_PERIOD = 25

// ---- runs ----

export function sparseRound(input: {
  space: PairSpace
  colors: readonly number[]
  rule: CensusRule
  background: number
  state: Tones
}): void {
  const { space, colors, rule, background, state } = input

  for (const color of colors) {
    const done = new Set<number>()

    for (const u of [...state.keys()]) {
      if (done.has(u)) {
        continue
      }

      const v = space.partner(color, u)

      done.add(u)

      if (v < 0) {
        continue
      }

      done.add(v)

      const [i, j] = space.isFirst(color, u) ? [u, v] : [v, u]
      const p = ((state.get(i) ?? background) + 1) * 3 + (state.get(j) ?? background) + 1
      const a = rule.first[p]!
      const b = rule.second[p]!

      if (a === background) {
        state.delete(i)
      } else {
        state.set(i, a)
      }

      if (b === background) {
        state.delete(j)
      } else {
        state.set(j, b)
      }
    }
  }
}

export function sameTones(a: Tones, b: Tones): boolean {
  if (a.size !== b.size) {
    return false
  }

  for (const [cell, tone] of a) {
    if (b.get(cell) !== tone) {
      return false
    }
  }

  return true
}

// the union of two states, or null when they share a cell
export function unionTones(a: Tones, b: Tones): Tones | null {
  const out = new Map(a)

  for (const [cell, tone] of b) {
    if (out.has(cell)) {
      return null
    }

    out.set(cell, tone)
  }

  return out
}

// the facet distance between two cells, capped: 0, 1, 2 or 3 (meaning more than 2)
export function cappedDistance(space: PairSpace, a: number, b: number): number {
  if (a === b) {
    return 0
  }

  const na = space.neighbors(a)

  if (na.includes(b)) {
    return 1
  }

  const nb = new Set(space.neighbors(b))

  return na.some(w => nb.has(w)) ? 2 : 3
}

// the clusters of a state's cells, two cells linked when at most LINK_DISTANCE apart, each cluster in cell order
export function clusters(space: PairSpace, state: Tones): number[][] {
  const cells = [...state.keys()].sort((x, y) => x - y)
  const group = cells.map((_, i) => i)
  const find = (i: number): number => (group[i] === i ? i : (group[i] = find(group[i]!)))

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      if (find(i) !== find(j) && cappedDistance(space, cells[i]!, cells[j]!) <= LINK_DISTANCE) {
        group[find(i)] = find(j)
      }
    }
  }

  const out = new Map<number, number[]>()

  cells.forEach((c, i) => {
    const r = find(i)
    const list = out.get(r) ?? []

    list.push(c)
    out.set(r, list)
  })

  return [...out.values()]
}

export function shapeKey(space: PairSpace, state: Tones, cells?: readonly number[]): string {
  const list = cells ?? [...state.keys()]
  const tones = list.map(c => state.get(c)!).sort((x, y) => x - y)
  const pairs: string[] = []

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = state.get(list[i]!)!
      const b = state.get(list[j]!)!

      pairs.push(`${Math.min(a, b)}${Math.max(a, b)}d${cappedDistance(space, list[i]!, list[j]!)}`)
    }
  }

  return `[${tones.join(',')}${pairs.length > 0 ? ';' : ''}${pairs.sort().join(',')}]`
}

const charge = (state: Tones, background: number): number => {
  let q = 0

  for (const t of state.values()) {
    q += t - background
  }

  return q
}

const excitation = (state: Tones, background: number): number => {
  let d = 0

  for (const t of state.values()) {
    d += t * t - background * background
  }

  return d
}

const nearest = (space: PairSpace, state: Tones): number => {
  let r = Number.POSITIVE_INFINITY

  for (const c of state.keys()) {
    r = Math.min(r, space.distance(c))
  }

  return r
}

export type SeedTrace = {
  localized: boolean
  // rounds read while localized (CENSUS_ROUNDS when localized throughout)
  roundsRead: number
  // the smallest t >= 1 with state(t) = state(0), 0 when none within the rounds read
  exactPeriod: number
  shapes: string[]
  radius: number[]
  maxCells: number
  chargeKept: boolean
  excitationKept: boolean
}

// One start run for `rounds` rounds, read at every round end; the run stops at the first round it is not localized.
export function traceSeed(input: {
  space: PairSpace
  colors: readonly number[]
  rule: CensusRule
  background: number
  start: Tones
  rounds: number
}): SeedTrace {
  const { space, colors, rule, background, start, rounds } = input
  const state = new Map(start)
  const q0 = charge(start, background)
  const d0 = excitation(start, background)
  const shapes = [shapeKey(space, state)]
  const radius = [nearest(space, state)]

  let exactPeriod = 0
  let maxCells = state.size
  let chargeKept = true
  let excitationKept = true
  let localized = state.size <= SPECIES_MAX_CELLS && clusters(space, state).length === 1
  let roundsRead = 0

  for (let t = 1; t <= rounds && localized; t++) {
    sparseRound({ space, colors, rule, background, state })
    chargeKept &&= charge(state, background) === q0
    excitationKept &&= excitation(state, background) === d0
    maxCells = Math.max(maxCells, state.size)

    if (state.size > SPECIES_MAX_CELLS || clusters(space, state).length !== 1) {
      localized = false
      break
    }

    roundsRead = t
    shapes.push(shapeKey(space, state))
    radius.push(nearest(space, state))

    if (exactPeriod === 0 && sameTones(state, start)) {
      exactPeriod = t
    }
  }

  return { localized, roundsRead, exactPeriod, shapes, radius, maxCells, chargeKept, excitationKept }
}

export type Motion = 'static' | 'periodic' | 'ballistic' | 'wandering'

export type SpeciesReading = {
  motion: Motion
  period: number
  // speed in hops per round, an exact fraction
  speed: string
  lateShapes: string[]
  key: string
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function readSpecies(trace: SeedTrace, background: number): SpeciesReading {
  const { shapes, radius, roundsRead: end } = trace
  const lateShapes = [...new Set(shapes.slice(LATE_FROM))].sort()

  let motion: Motion = 'wandering'
  let period = 0
  let speed = '0'

  if (trace.exactPeriod === 1) {
    motion = 'static'
    period = 1
  } else if (trace.exactPeriod > 1) {
    motion = 'periodic'
    period = trace.exactPeriod
  } else {
    // the smallest P whose shapes repeat with radius gaining the same positive step every P rounds (ballistic), else
    // the smallest P whose shapes alone repeat (wandering with that shape period)
    for (let p = 1; p <= MAX_SHAPE_PERIOD && motion === 'wandering'; p++) {
      let repeats = true

      for (let t = LATE_FROM; t + p <= end && repeats; t++) {
        repeats = shapes[t] === shapes[t + p]
      }

      if (!repeats) {
        continue
      }

      if (period === 0) {
        period = p
      }

      const step = radius[LATE_FROM + p]! - radius[LATE_FROM]!

      let linear = step > 0

      for (let t = LATE_FROM; t + p <= end && linear; t++) {
        const gain = radius[t + p]! - radius[t]!

        linear = gain === step
      }

      if (linear) {
        const g = gcd(step, p)

        motion = 'ballistic'
        period = p
        speed = p / g === 1 ? `${step / g}` : `${step / g}/${p / g}`
      }
    }
  }

  return {
    motion,
    period,
    speed,
    lateShapes,
    key: `${background}|${motion}|${period}|${speed}|${lateShapes.join(' ')}`,
  }
}

// Whether a start of several parts runs, at every round, as the union of its parts run alone.
export function isFreeComposite(input: {
  space: PairSpace
  colors: readonly number[]
  rule: CensusRule
  background: number
  parts: readonly Tones[]
  rounds: number
}): boolean {
  const { space, colors, rule, background, rounds } = input
  const parts = input.parts.map(p => new Map(p))
  const joint = new Map<number, number>()

  for (const p of parts) {
    for (const [c, t] of p) {
      joint.set(c, t)
    }
  }

  for (let t = 0; t < rounds; t++) {
    sparseRound({ space, colors, rule, background, state: joint })

    let union: Tones | null = new Map()

    for (const p of parts) {
      sparseRound({ space, colors, rule, background, state: p })
      union = union ? unionTones(union, p) : null
    }

    if (!union || !sameTones(union, joint)) {
      return false
    }
  }

  return true
}

// ---- collisions ----

export type CollisionKind = 'transparent' | 'scatter' | 'overlap'

export type CollisionReading = {
  kind: CollisionKind
  // the shape keys of the joint state's clusters at the end (scatter only), sorted
  products: string[]
  // the joint run came back to B's placement exactly when B alone was run forward from its pulled-back start
  inverseExact: boolean
  // the closest the two lone runs came, capped distance (0 to 3)
  closest: number
}

export function collide(input: {
  space: PairSpace
  colors: readonly number[]
  rule: CensusRule
  inverse: CensusRule
  background: number
  a: Tones
  // B as it should stand at round `meet`
  bAtMeet: Tones
  meet: number
  after: number
}): CollisionReading {
  const { space, colors, rule, inverse, background, a, bAtMeet, meet, after } = input
  const back = [...colors].reverse()
  const bStart = new Map(bAtMeet)

  for (let t = 0; t < meet; t++) {
    sparseRound({ space, colors: back, rule: inverse, background, state: bStart })
  }

  const check = new Map(bStart)

  for (let t = 0; t < meet; t++) {
    sparseRound({ space, colors, rule, background, state: check })
  }

  const inverseExact = sameTones(check, bAtMeet)
  const start = unionTones(a, bStart)

  const touching = (x: Tones, y: Tones): number => {
    let best = 3

    for (const u of x.keys()) {
      for (const v of y.keys()) {
        best = Math.min(best, cappedDistance(space, u, v))
      }
    }

    return best
  }

  if (!start || touching(a, bStart) <= LINK_DISTANCE) {
    return { kind: 'overlap', products: [], inverseExact, closest: 0 }
  }

  const joint = start
  const aAlone = new Map(a)
  const bAlone = new Map(bStart)

  let transparent = true
  let closest = 3

  for (let t = 1; t <= meet + after; t++) {
    sparseRound({ space, colors, rule, background, state: joint })
    sparseRound({ space, colors, rule, background, state: aAlone })
    sparseRound({ space, colors, rule, background, state: bAlone })
    closest = Math.min(closest, touching(aAlone, bAlone))

    if (transparent) {
      const union = unionTones(aAlone, bAlone)

      transparent = union !== null && sameTones(union, joint)
    }
  }

  if (transparent) {
    return { kind: 'transparent', products: [], inverseExact, closest }
  }

  const products = clusters(space, joint)
    .map(cells => shapeKey(space, joint, cells))
    .sort()

  return { kind: 'scatter', products, inverseExact, closest }
}

// ---- the infinite line ----
//
// Cells are the integers, id 2x for x >= 0 and -2x - 1 for x < 0, so the origin is id 0. Color 0 pairs (2k, 2k + 1),
// color 1 pairs (2k + 1, 2k + 2); the left cell is first (the line's left to right, E-CMP-0025).

export type LineSpace = PairSpace & {
  readonly name: string
  readonly degree: number
  at(x: number): number
  position(cell: number): number
}

export function lineSpace(): LineSpace {
  const at = (x: number): number => (x >= 0 ? 2 * x : -2 * x - 1)
  const position = (c: number): number => (c % 2 === 0 ? c / 2 : -(c + 1) / 2)

  const partnerOf = (color: number, x: number): number => {
    const even = ((x % 2) + 2) % 2 === 0

    return color === 0 ? (even ? x + 1 : x - 1) : even ? x - 1 : x + 1
  }

  return {
    name: 'line',
    degree: 2,
    colorCount: 2,
    at,
    position,
    partner: (color, c) => at(partnerOf(color, position(c))),
    isFirst: (color, c) => partnerOf(color, position(c)) > position(c),
    distance: c => Math.abs(position(c)),
    neighbors: c => [at(position(c) - 1), at(position(c) + 1)],
  }
}
