// THE LINE-LIQUID VACUUM AND ONE LOVE ON IT (E-SPN-0137). note/research/vibe/roadmap/remaining-pieces.md, "Six angles on
// 3d motion", angle 3: a vacuum whose state is a superposition over line assignments, itself invariant under the frame
// mixer, so a mixer turning matter has nothing fixed to disturb. This file holds the two instruments the experiment
// test/experiment/spin/line-liquid-vacuum reads.
//
// 1. THE VACUUM'S IMAGES. The working vacuum (code/measure/mixed-vacuum-readings wordVacuum on contactFresh 'pass') is a
//    bundle of stored pairs: on three docks in four a whole frame (the four mutually orthogonal lines of one frame) holds
//    a stored pair on every line, the frame and the four tones set by the dock's place in a 4 x 4 x 4 x 4 cell. An image
//    is the vacuum carried by a W(F4) element g about dock 0: the dock with coordinates c goes to the dock of 2M c / 2,
//    slot d to g(d), and a stored pair on line l to the line of g(first l), with its tone negated where g sends the
//    first slot to a second slot (the stored love sat on the first slot). `vacuumImage` builds it; `occupationKey`
//    compares two configurations on their occupation (vibe and store trits) alone.
//
// 2. THE ONE-POINT OCCUPATION STAND-IN (`liquidBeat`). The working rule's beat (the order of code/measure/
//    string-gated-mixer's track: the mixer, the coin, the meeting, the collision with veto 'none' on contact 'pass', the
//    stream) on a SUPERPOSITION of configurations with amplitudes, held as each term's difference from the vacuum's own
//    run. What it keeps and what it drops, stated:
//    - OCCUPATION, EXACT. Under veto 'none' no piece reads a point: the coin reads held-or-not, the pair move and the
//      bounce read trits, the stream's target is the mesh's, and the mixer reads occupation (the string clause of
//      E-SPN-0121 is dropped, as in its 'stringless' control, which also cascaded). So the occupation of every term is
//      the rule's, and on a keyed path the stand-in's configuration equals the rule's slot for slot (the experiment
//      checks this against the rule's own pieces).
//    - AMPLITUDES OF THE PIECES THAT MOVE OCCUPATION, EXACT: the coin on a line of one vibe keeps with (1 + w)/2 and
//      crosses with (1 - w)/2 (code/rule/coined-locked-knit), and the mixer M_n = I + (e^(i theta) - 1) J / 8 on a gated
//      single's frame (code/measure/string-gated-mixer, 2 - 2 cos theta = n). The coin's determinant on a full line of
//      two vibes is the phase w.
//    - POINTS, DROPPED: every vibe carries one point. The meeting then acts on every like full line as the equal-point
//      phase w (the rule's own value there) and never splits. This is a stand-in: in the rule the like meetings of
//      unequal points split the point register (7,680 of them a beat in the side-8 vacuum, E-SPN-0120), which never
//      feeds back into the occupation but entangles with it, so interference between occupation histories is what the
//      stand-in holds coherently and the rule may hold less coherently. A keyed path of the rule is the other limit
//      (every history apart, no interference at all), so the two together bracket the rule on this question.
//    - NO FERMION SIGN: the working rule on the no-veto store is the configuration code plus the coin (code/rule/
//      coined-locked-knit coinedVetoBeat: its vibes exchange as hard-core bosons), and so is this.
//    Every phase is taken relative to the vacuum's own at the same beat, so the vacuum is the state of amplitude 1 and a
//    term is its difference from it.
//
// THE MESH HERE IS UNBOUNDED (to a modulus far past the reach of any run) and the vacuum is read from a side-8 box by
// coordinates mod 8, which is exact because the vacuum's occupation has period 4 in every box coordinate (the
// experiment reads the 16 box translations that fix it). A term is canonicalized modulo the period lattice 4 Z^4 (box
// coordinates) with the Bloch phase e^(-i K . lambda) (K Cartesian, per dock), so a state is a Bloch state of total
// momentum K of the love and the vacuum's disturbance together, as code/measure/frame-meson holds the meson relative to
// its love. A term holding more than `cut` single lines is dropped and its weight counted as escaped; with no cut the
// beat is unitary.
//
// DETERMINISM: no random numbers; starts are placed. NOTHING MOVES: the coin and the mixer hand a value between slots of
// one dock, the collision permutes a dock's slots and stores, and the stream takes each value one dock along.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { gatedFrame } from '@/code/measure/string-gated-mixer'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4Vector,
  linearMapOfDoubled,
  boxCellMapDoubled,
} from '@/code/substrate/d4-box-integer'
import { type PathKey } from '@/code/measure/full-key-paths'

export const VACUUM_PERIOD = 12
// the vacuum's period lattice in box coordinates (read by the experiment on the side-8 box)
export const CELL = 4
// coordinates are held mod MODULUS (far past any run's reach), four 8-bit fields
export const MODULUS = 256

const W: [number, number] = [-0.5, Math.sqrt(3) / 2]
const KEEP: [number, number] = [(1 + W[0]) / 2, W[1] / 2]
const CROSS: [number, number] = [(1 - W[0]) / 2, -W[1] / 2]
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f]!,
)

// ---- occupation ----

export const occupationKey = (c: Configuration): string =>
  `${c.vibe.join(',')}|${c.store.join(',')}`

// the single lines and the full lines of one dock's 24 slots
export function lineCounts(
  vibe: Int8Array,
  base: number,
): { singles: number; full: number; like: number } {
  let singles = 0
  let full = 0
  let like = 0

  for (let l = 0; l < 12; l++) {
    const a = vibe[base + LINE_FIRSTS[l]!]!
    const b = vibe[base + LINE_SECONDS[l]!]!

    if (a !== 0 && b !== 0) {
      full++

      if (a === b) {
        like++
      }
    } else if (a !== 0 || b !== 0) {
      singles++
    }
  }

  return { singles, full, like }
}

// ---- the vacuum's run and its images ----

// the rule's occupation beat on a whole box with no single anywhere (condition Z): no coin or mixer acts, the meeting
// keeps the occupation, so the beat is the collision and the stream
export function vacuumBeat(
  tables: LockedTables,
  a: Configuration,
  b: Configuration,
  t: number,
): void {
  const order = collisionOrder('alternate', t)

  for (let x = 0; x < tables.cells; x++) {
    for (const p of order) {
      p === 'P' ? pairPiece('none', a, x) : coinPiece(tables, a, x)
    }
  }

  streamInto(tables, a, b)
}

// the vacuum's occupation at beats 0 .. period, and the single lines it ever holds
export function vacuumOrbit(
  tables: LockedTables,
  vacuum: Configuration,
  beats: number,
): { states: Configuration[]; singles: number } {
  let a = cloneConfiguration(vacuum)
  let b = cloneConfiguration(vacuum)

  const states = [cloneConfiguration(a)]

  let singles = 0

  for (let t = 0; t < beats; t++) {
    vacuumBeat(tables, a, b, t)
    ;[a, b] = [b, a]

    for (let x = 0; x < tables.cells; x++) {
      singles += lineCounts(a.vibe, x * 24).singles
    }

    states.push(cloneConfiguration(a))
  }

  return { states, singles }
}

// a W(F4) element (a slot permutation) carried to the box: its dock map about dock 0, or undefined off the box
export function boxSymmetry(
  g: readonly number[],
  side: number,
): { slots: readonly number[]; docks: number[] } | undefined {
  const doubled = linearMapOfDoubled(g)

  if (!doubled) {
    return undefined
  }

  const docks = boxCellMapDoubled({ doubled, side })

  return docks ? { slots: g, docks } : undefined
}

// the image of a configuration's occupation under a box symmetry (points, words and open bits reset: occupation only)
export function vacuumImage(
  c: Configuration,
  s: { slots: readonly number[]; docks: readonly number[] },
): Configuration {
  const cells = s.docks.length
  const out: Configuration = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }

  for (let x = 0; x < cells; x++) {
    const y = s.docks[x]!

    for (let d = 0; d < 24; d++) {
      const v = c.vibe[x * 24 + d]!

      if (v === 0) {
        continue
      }

      out.vibe[y * 24 + s.slots[d]!] = v
      out.open[y * 24 + s.slots[d]!] = 1
    }

    for (let l = 0; l < 12; l++) {
      const tau = c.store[x * 12 + l]!

      if (tau === 0) {
        continue
      }

      const image = s.slots[LINE_FIRSTS[l]!]!
      const m = LINE_OF[image]!

      out.store[y * 12 + m] = LINE_FIRSTS[m] === image ? tau : -tau
      out.sopen[y * 12 + m] = 3
    }
  }

  return out
}

// ---- the liquid vacuum: the symmetric Floquet state over the vacuum's images ----
//
// On a vacuum configuration (no single line) the mixer and the coin's crossing never act, the meeting and the coin's
// determinant are phases (w per full line, w again per like full line, the one-point stand-in), and the collision and
// stream permute the occupation. So one beat sends a vacuum configuration to ONE configuration times a phase, and the
// beat depends on t only through its parity (the collision order), so V = U_(2j+1) U_(2j) is the beat pair. Over one
// image's 12-beat orbit V has period 6, and Phi = sum over images i, j = 0 .. 5 of phi_j |image_i(2 j)>, with
// phi_(j+1) = phi_j q_j / mu (q_j the pair's phase, mu^6 their product), is an eigenvector of V by construction. The
// experiment does not assume it: it runs every image 64 + 12 beats with the rule's own pieces and reads the overlap.

export type LiquidVacuum = {
  images: number
  // per image: the orbit's occupation keys at beats 0 .. 11, and single lines, gated docks over 76 beats
  singles: number
  gated: number
  periodic: number
  // the overlap |<Phi| U^64 |Phi>| / <Phi|Phi>, the generators of W(F4) read and the size of the group they
  // generate, and the largest amplitude change of Phi under any generator about dock 0 (0: invariant under the group)
  overlap64: number
  reflections: number
  generated: number
  reflectionChange: number
  // the fewest docks at which two distinct images differ at beat 0, of the box's docks
  minApart: number
  cells: number
}

// the size of the group a set of slot permutations generates (breadth first over products)
export function closureSize(
  gens: readonly (readonly number[])[],
): number {
  const seen = new Set<string>()
  const identity = Array.from({ length: 24 }, (_, d) => d)

  let frontier: number[][] = [identity]

  seen.add(identity.join(','))

  while (frontier.length > 0) {
    const next: number[][] = []

    for (const p of frontier) {
      for (const g of gens) {
        const q = p.map(v => g[v]!)
        const k = q.join(',')

        if (seen.has(k)) {
          continue
        }

        seen.add(k)
        next.push(q)
      }
    }

    frontier = next
  }

  return seen.size
}

// generators taken in order, each kept only when it enlarges the generated group, until it is the whole group
export function generatingSet(
  group: readonly (readonly number[])[],
): (readonly number[])[] {
  const gens: (readonly number[])[] = []

  let size = 1

  for (const g of group) {
    if (size === group.length) {
      break
    }

    const bigger = closureSize([...gens, g])

    if (bigger > size) {
      gens.push(g)
      size = bigger
    }
  }

  return gens
}

const beatPhase = (c: Configuration, cells: number): number => {
  let n = 0

  for (let x = 0; x < cells; x++) {
    const k = lineCounts(c.vibe, x * 24)

    n += k.full + k.like
  }

  return n % 3
}

export function liquidVacuum(
  tables: LockedTables,
  vacuum: Configuration,
  side: number,
  group: readonly (readonly number[])[],
  beats = 64,
): LiquidVacuum {
  const cells = tables.cells
  const seen = new Map<string, Configuration>()

  for (const g of group) {
    const s = boxSymmetry(g, side)

    if (!s) {
      throw new Error('line-liquid: a W(F4) element leaves the box')
    }

    const im = vacuumImage(vacuum, s)
    const k = occupationKey(im)

    if (!seen.has(k)) {
      seen.set(k, im)
    }
  }

  const images = [...seen.values()]
  const out: LiquidVacuum = {
    images: images.length,
    singles: 0,
    gated: 0,
    periodic: 0,
    overlap64: 0,
    reflections: 0,
    generated: 0,
    reflectionChange: 0,
    minApart: cells,
    cells,
  }
  // phi: occupation key -> amplitude [re, im]; and U^beats phi
  const phi = new Map<string, [number, number]>()
  const moved = new Map<string, [number, number]>()
  const total = beats + VACUUM_PERIOD

  let mu: [number, number] | undefined
  let q0: number[] | undefined

  const orbitStates: Configuration[][] = []

  for (const start of images) {
    let a = cloneConfiguration(start)
    let b = cloneConfiguration(start)

    const keys = [occupationKey(a)]
    const phase = [beatPhase(a, cells)]
    const states = [cloneConfiguration(a)]

    orbitStates.push(states)

    for (let t = 0; t < total; t++) {
      for (let x = 0; x < cells; x++) {
        const k = lineCounts(a.vibe, x * 24)

        out.singles += k.singles

        if (gatedFrame(a, x).f >= 0) {
          out.gated++
        }
      }

      vacuumBeat(tables, a, b, t)
      ;[a, b] = [b, a]
      keys.push(occupationKey(a))
      phase.push(beatPhase(a, cells))
    }

    if (keys[VACUUM_PERIOD] === keys[0]) {
      out.periodic++
    }

    // the pair phases q_j (in thirds of a turn), the same for every image by covariance (checked: a mismatch throws)
    const q = Array.from(
      { length: VACUUM_PERIOD / 2 },
      (_, j) => (phase[2 * j]! + phase[2 * j + 1]!) % 3,
    )

    if (!q0) {
      q0 = q

      const turns =
        q.reduce((s, v) => s + v, 0) / 3 / (VACUUM_PERIOD / 2)

      mu = [
        Math.cos(2 * Math.PI * turns),
        Math.sin(2 * Math.PI * turns),
      ]
    } else if (q.some((v, j) => v !== q0![j])) {
      throw new Error(
        'line-liquid: two images carry different pair phases',
      )
    }

    // phi_j and the phase U^beats carries from beat 2 j (the product of the beat phases over 2 j .. 2 j + beats - 1)
    let amp: [number, number] = [1, 0]

    for (let j = 0; j < VACUUM_PERIOD / 2; j++) {
      phi.set(keys[2 * j]!, amp)

      let turns = 0

      for (let t = 2 * j; t < 2 * j + beats; t++) {
        turns += phase[t]!
      }

      const ang = (2 * Math.PI * turns) / 3
      const after = keys[2 * j + beats]!
      const prev = moved.get(after) ?? [0, 0]

      moved.set(after, [
        prev[0] + amp[0] * Math.cos(ang) - amp[1] * Math.sin(ang),
        prev[1] + amp[0] * Math.sin(ang) + amp[1] * Math.cos(ang),
      ])

      const qa = (2 * Math.PI * q[j]!) / 3
      const nr = amp[0] * Math.cos(qa) - amp[1] * Math.sin(qa)
      const ni = amp[0] * Math.sin(qa) + amp[1] * Math.cos(qa)

      // divide by mu
      amp = [nr * mu![0] + ni * mu![1], ni * mu![0] - nr * mu![1]]
    }
  }

  let nr = 0
  let ni = 0
  let norm = 0

  for (const [k, a] of phi) {
    norm += a[0] ** 2 + a[1] ** 2

    const b = moved.get(k)

    if (!b) {
      continue
    }

    nr += a[0] * b[0] + a[1] * b[1]
    ni += a[0] * b[1] - a[1] * b[0]
  }

  out.overlap64 = Math.hypot(nr, ni) / norm

  // a generating set of the group, taken greedily in the group's order until the closure of the chosen slot
  // permutations holds every element (read, not assumed): Phi unchanged by each generator is unchanged by the group
  const reflections = generatingSet(group)

  out.reflections = reflections.length
  out.generated = closureSize(reflections)

  // Phi carries the same amplitude phi_j on every image at beat 2 j, and the images at beat 2 j are the images of the
  // vacuum's beat-2j state (covariance, checked on side 8 by tmp/liquid-probe4). So Phi is invariant under g exactly when
  // g carries the set of images at beat 0 onto itself, amplitudes included: read here for every reflection
  for (const g of reflections) {
    const s = boxSymmetry(g, side)!

    for (const states of orbitStates) {
      const here = phi.get(occupationKey(states[0]!))!
      const there = phi.get(occupationKey(vacuumImage(states[0]!, s)))

      out.reflectionChange = Math.max(
        out.reflectionChange,
        there
          ? Math.hypot(here[0] - there[0], here[1] - there[1])
          : Math.hypot(here[0], here[1]),
      )
    }
  }

  // how far apart two distinct images sit
  for (let i = 0; i < images.length; i++) {
    for (let j = i + 1; j < images.length; j++) {
      let apart = 0

      const p = images[i]!
      const r = images[j]!

      for (let x = 0; x < cells; x++) {
        for (let l = 0; l < 12; l++) {
          if (p.store[x * 12 + l] !== r.store[x * 12 + l]) {
            apart++
            break
          }
        }
      }

      out.minApart = Math.min(out.minApart, apart)
    }
  }

  return out
}

// ---- the stand-in's lattice ----

export type LiquidLattice = {
  readonly tables: LockedTables
  // occupation of the side-8 vacuum at beats 0 .. VACUUM_PERIOD - 1
  readonly vibe: Int8Array[]
  readonly store: Int8Array[]
  // the box coordinate step of each slot's stream, and the Cartesian (D4) vector of a box coordinate step
  readonly step: number[][]
  readonly side: number
  // coordinates are held mod this: MODULUS for the unbounded mesh, the box side for a check against the rule's box
  readonly modulus: number
}

const mod = (v: number, m: number): number => ((v % m) + m) % m

export function liquidLattice(
  tables: LockedTables,
  vacuum: Configuration,
  side: number,
  modulus = MODULUS,
): LiquidLattice {
  const orbit = vacuumOrbit(tables, vacuum, VACUUM_PERIOD).states
  const x0 = 0
  const c0 = d4BoxCoordinates({ cell: x0, side })
  const step = Array.from({ length: 24 }, (_, d) => {
    const c1 = d4BoxCoordinates({
      cell: Math.floor(tables.target[x0 * 24 + d]! / 24),
      side,
    })

    return c1.map((v, k) => {
      const u = mod(v - c0[k]!, side)

      return u > side / 2 ? u - side : u
    })
  })

  return {
    tables,
    vibe: orbit.slice(0, VACUUM_PERIOD).map(c => c.vibe),
    store: orbit.slice(0, VACUUM_PERIOD).map(c => c.store),
    step,
    side,
    modulus,
  }
}

export const packDock = (c: readonly number[], m: number): number =>
  mod(c[0]!, m) +
  m * (mod(c[1]!, m) + m * (mod(c[2]!, m) + m * mod(c[3]!, m)))
export const unpackDock = (k: number, m: number): number[] => [
  k % m,
  Math.floor(k / m) % m,
  Math.floor(k / m ** 2) % m,
  Math.floor(k / m ** 3) % m,
]

const boxCell = (L: LiquidLattice, k: number): number =>
  d4BoxCell({ coordinates: unpackDock(k, L.modulus), side: L.side })

// ---- terms ----

// a term: the docks where it differs from the vacuum at its beat (sorted dock keys) and their 36 values (24 slot trits,
// 12 store trits), with an amplitude
export type LiquidTerm = {
  docks: number[]
  values: Int8Array
  re: number
  im: number
}
export type LiquidState = Map<string, LiquidTerm>

const termKey = (docks: readonly number[], values: Int8Array): string =>
  `${docks.join(',')}|${values.join('')}`

export function liquidWeight(
  s: LiquidState,
  classical = false,
): number {
  let w = 0

  for (const t of s.values()) {
    w += classical ? t.re : t.re * t.re + t.im * t.im
  }

  return w
}

export function liquidOverlap(
  u: LiquidState,
  v: LiquidState,
): [number, number] {
  let r = 0
  let i = 0

  for (const [k, a] of u) {
    const b = v.get(k)

    if (!b) {
      continue
    }

    r += a.re * b.re + a.im * b.im
    i += a.re * b.im - a.im * b.re
  }

  return [r, i]
}

// the single lines a term holds
export function termSingles(t: LiquidTerm): number {
  let n = 0

  for (let k = 0; k < t.docks.length; k++) {
    n += lineCounts(t.values, k * 36).singles
  }

  return n
}

export type LiquidSpec = {
  // the mixer's rate (0 none) and whether a term is canonicalized modulo the period lattice (with the Bloch phase)
  readonly n: number
  readonly bloch: boolean
  // Cartesian total momentum (per dock step)
  readonly K: readonly number[]
  // drop a term holding more single lines than this (Infinity: none dropped)
  readonly cut: number
  // a keyed path instead of the superposition: every split takes the rule's keyed choice (a check against the rule)
  readonly key?: PathKey
  readonly threshold?: number
  // the decoherent limit: every split carries its Born weight |amplitude|^2 and coincident terms add weights, with no
  // phase anywhere (the sum over histories with no interference, which the rule's keyed paths sample)
  readonly classical?: boolean
}

// a term's weight: |amplitude|^2, or its probability in the decoherent limit
export const termWeight = (t: LiquidTerm, classical = false): number =>
  classical ? t.re : t.re * t.re + t.im * t.im

export type LiquidTally = {
  escaped: number
  terms: number
  splits: number
  gated: number
}

export const newLiquidTally = (): LiquidTally => ({
  escaped: 0,
  terms: 0,
  splits: 0,
  gated: 0,
})

// canonical translate of a term modulo CELL Z^4: the candidate shifts carry one of its docks into the fundamental cell;
// the least key wins. Returns the term's docks and values translated, and the Cartesian shift removed
function canonical(
  docks: number[],
  values: Int8Array,
  m: number,
): { docks: number[]; values: Int8Array; shift: number[] } {
  let best:
    | {
        docks: number[]
        values: Int8Array
        shift: number[]
        key: string
      }
    | undefined

  const seen = new Set<string>()

  for (const k of docks) {
    const c = unpackDock(k, m)
    const lambda = c.map(v => v - mod(v, CELL))
    const id = lambda.join(',')

    if (seen.has(id)) {
      continue
    }

    seen.add(id)

    const moved = docks.map((q, i) => ({
      q: packDock(
        unpackDock(q, m).map((v, j) => v - lambda[j]!),
        m,
      ),
      i,
    }))

    moved.sort((a, b) => a.q - b.q)

    const vs = new Int8Array(values.length)

    moved.forEach((e, j) =>
      vs.set(values.subarray(e.i * 36, e.i * 36 + 36), j * 36),
    )

    const ds = moved.map(e => e.q)
    const key = termKey(ds, vs)

    if (!best || key < best.key) {
      best = {
        docks: ds,
        values: vs,
        shift: lambda.map(v => (v > m / 2 ? v - m : v)),
        key,
      }
    }
  }

  if (!best) {
    return { docks, values, shift: [0, 0, 0, 0] }
  }

  return best
}

// a state from classical starts: each a configuration on the side-8 box at beat 0 differing from the vacuum near its
// docks, placed on the unbounded mesh at the same coordinates, with amplitude
export function liquidStart(
  L: LiquidLattice,
  spec: LiquidSpec,
  starts: readonly { config: Configuration; amp: [number, number] }[],
): LiquidState {
  const out: LiquidState = new Map()

  for (const { config, amp } of starts) {
    const docks: number[] = []
    const vals: number[] = []

    for (let x = 0; x < L.tables.cells; x++) {
      let differs = false

      for (let d = 0; d < 24 && !differs; d++) {
        if (config.vibe[x * 24 + d] !== L.vibe[0]![x * 24 + d]) {
          differs = true
        }
      }

      for (let l = 0; l < 12 && !differs; l++) {
        if (config.store[x * 12 + l] !== L.store[0]![x * 12 + l]) {
          differs = true
        }
      }

      if (!differs) {
        continue
      }

      docks.push(
        packDock(
          d4BoxCoordinates({ cell: x, side: L.side }),
          L.modulus,
        ),
      )

      vals.push(
        ...config.vibe.subarray(x * 24, x * 24 + 24),
        ...config.store.subarray(x * 12, x * 12 + 12),
      )
    }

    const order = docks
      .map((k, i) => ({ k, i }))
      .sort((a, b) => a.k - b.k)
    const values = new Int8Array(docks.length * 36)

    order.forEach((o, j) =>
      values.set(vals.slice(o.i * 36, o.i * 36 + 36), j * 36),
    )

    add(
      out,
      spec,
      L.modulus,
      order.map(o => o.k),
      values,
      amp[0],
      amp[1],
    )
  }

  return out
}

function add(
  out: LiquidState,
  spec: LiquidSpec,
  m: number,
  docks: number[],
  values: Int8Array,
  re: number,
  im: number,
): void {
  let ds = docks
  let vs = values
  let r = re
  let i = im

  if (spec.bloch) {
    const c = canonical(docks, values, m)
    const cart = d4Vector(c.shift)
    const ph = spec.classical
      ? 0
      : -cart.reduce((s, v, k) => s + v * spec.K[k]!, 0)
    const cr = Math.cos(ph)
    const ci = Math.sin(ph)

    ds = c.docks
    vs = c.values
    r = re * cr - im * ci
    i = re * ci + im * cr
  }

  const key = termKey(ds, vs)
  const found = out.get(key)

  if (found) {
    found.re += r
    found.im += i
  } else {
    out.set(key, { docks: ds, values: vs, re: r, im: i })
  }
}

// one dock's local configuration (24 slots, 12 stores; every vibe open on one point)
const LOCAL: Configuration = {
  vibe: new Int8Array(24),
  point: new Int8Array(24),
  open: new Uint8Array(24),
  store: new Int8Array(12),
  spoint: new Int8Array(12),
  sopen: new Uint8Array(12),
}

function loadLocal(values: Int8Array, offset: number): void {
  for (let d = 0; d < 24; d++) {
    const v = values[offset + d]!

    LOCAL.vibe[d] = v
    LOCAL.point[d] = 0
    LOCAL.open[d] = v !== 0 ? 1 : 0
  }

  for (let l = 0; l < 12; l++) {
    const s = values[offset + 24 + l]!

    LOCAL.store[l] = s
    LOCAL.spoint[l] = 0
    LOCAL.sopen[l] = s !== 0 ? 3 : 0
  }
}

type Local = {
  vibe: Int8Array
  store: Int8Array
  re: number
  im: number
}

// the mixer and the coin on one dock: its outcomes with amplitudes (keyed: the rule's one choice)
function splitDock(
  values: Int8Array,
  offset: number,
  t: number,
  cell: number,
  spec: LiquidSpec,
  tally: LiquidTally,
): Local[] {
  loadLocal(values, offset)

  let outs: Local[] = [
    {
      vibe: Int8Array.from(LOCAL.vibe),
      store: Int8Array.from(LOCAL.store),
      re: 1,
      im: 0,
    },
  ]

  if (spec.n > 0) {
    const { f, q } = gatedFrame(LOCAL, 0)

    if (f >= 0) {
      tally.gated++

      const ss = FRAME_SLOTS[f]!
      const theta = Math.acos(1 - spec.n / 2)
      const mr = (Math.cos(theta) - 1) / 8
      const mi = Math.sin(theta) / 8
      const base = outs[0]!
      const next: Local[] = []

      let only = -1

      if (spec.key) {
        const keep = 64 - 7 * spec.n
        const b = Math.floor(spec.key.frame(t, cell, f) / 1024)

        only = b < keep ? 0 : Math.floor((b - keep) / spec.n) + 1
      }

      for (let o = 0; o < 8; o++) {
        if (only >= 0 && o !== only) {
          continue
        }

        const v = Int8Array.from(base.vibe)
        const from = ss[q]!
        const to = ss[q ^ o]!
        const value = v[from]!

        v[from] = 0
        v[to] = value

        const ar = spec.key ? 1 : (o === 0 ? 1 : 0) + mr
        const ai = spec.key ? 0 : mi

        next.push({
          vibe: v,
          store: base.store,
          re: spec.classical ? ar * ar + ai * ai : ar,
          im: spec.classical ? 0 : ai,
        })
      }

      outs = next

      if (!spec.key) {
        tally.splits++
      }
    }
  }

  // the coin on every line of one vibe
  const coined: Local[] = []

  for (const o of outs) {
    let list: Local[] = [o]

    for (let l = 0; l < 12; l++) {
      const i = LINE_FIRSTS[l]!
      const j = LINE_SECONDS[l]!
      const hi = o.vibe[i] !== 0
      const hj = o.vibe[j] !== 0

      if (hi === hj) {
        continue
      }

      const from = hi ? i : j
      const to = hi ? j : i

      if (spec.key) {
        if (spec.key.line(t, cell, l) < spec.threshold!) {
          for (const e of list) {
            e.vibe[to] = e.vibe[from]!
            e.vibe[from] = 0
          }
        }

        continue
      }

      const next: Local[] = []
      const keep = spec.classical
        ? [KEEP[0] ** 2 + KEEP[1] ** 2, 0]
        : KEEP
      const cross = spec.classical
        ? [CROSS[0] ** 2 + CROSS[1] ** 2, 0]
        : CROSS

      for (const e of list) {
        next.push({
          vibe: Int8Array.from(e.vibe),
          store: e.store,
          re: e.re * keep[0]! - e.im * keep[1]!,
          im: e.re * keep[1]! + e.im * keep[0]!,
        })

        const v = Int8Array.from(e.vibe)

        v[to] = v[from]!
        v[from] = 0
        next.push({
          vibe: v,
          store: e.store,
          re: e.re * cross[0]! - e.im * cross[1]!,
          im: e.re * cross[1]! + e.im * cross[0]!,
        })
      }

      list = next
      tally.splits++
    }

    coined.push(...list)
  }

  return coined
}

// the phase exponent of w on a dock: the coin's determinant on every full line and the meeting on every like one
function phaseCount(vibe: Int8Array, base: number): number {
  const c = lineCounts(vibe, base)

  return c.full + c.like
}

// one beat t of the stand-in
export function liquidBeat(
  L: LiquidLattice,
  s: LiquidState,
  t: number,
  spec: LiquidSpec,
  tally: LiquidTally,
): LiquidState {
  const out: LiquidState = new Map()
  const now = t % VACUUM_PERIOD
  const next = (t + 1) % VACUUM_PERIOD
  const vNow = L.vibe[now]!
  const vNext = L.vibe[next]!
  const sNext = L.store[next]!
  const order = collisionOrder('alternate', t)

  for (const term of s.values()) {
    const n = term.docks.length
    const cells = term.docks.map(k => boxCell(L, k))

    // the phase relative to the vacuum's at the same docks
    let phase = 0

    for (let k = 0; k < n; k++) {
      phase +=
        phaseCount(term.values, k * 36) -
        phaseCount(vNow, cells[k]! * 24)
    }

    const splits = term.docks.map((_, k) =>
      splitDock(term.values, k * 36, t, cells[k]!, spec, tally),
    )
    const count = splits.reduce((p, x) => p * x.length, 1)
    const ang = spec.classical ? 0 : (2 * Math.PI * phase) / 3
    const pr = Math.cos(ang)
    const pi = Math.sin(ang)

    for (let code = 0; code < count; code++) {
      let rest = code
      let re = term.re * pr - term.im * pi
      let im = term.re * pi + term.im * pr

      // post-collision values per term dock
      const post = new Int8Array(n * 36)

      for (let k = 0; k < n; k++) {
        const opts = splits[k]!
        const pick = opts[rest % opts.length]!

        rest = Math.floor(rest / opts.length)

        const r = re * pick.re - im * pick.im

        im = re * pick.im + im * pick.re
        re = r
        LOCAL.vibe.set(pick.vibe)
        LOCAL.store.set(pick.store)

        for (let d = 0; d < 24; d++) {
          LOCAL.point[d] = 0
          LOCAL.open[d] = LOCAL.vibe[d] !== 0 ? 1 : 0
        }

        for (let l = 0; l < 12; l++) {
          LOCAL.spoint[l] = 0
          LOCAL.sopen[l] = LOCAL.store[l] !== 0 ? 3 : 0
        }

        for (const p of order) {
          p === 'P'
            ? pairPiece('none', LOCAL, 0)
            : coinPiece(L.tables, LOCAL, 0)
        }

        post.set(LOCAL.vibe, k * 36)
        post.set(LOCAL.store, k * 36 + 24)
      }

      // the stream: every candidate dock (the term's docks and their stream targets) read after the stream
      const index = new Map<number, number>()

      term.docks.forEach((q, k) => index.set(q, k))

      const candidates = new Set<number>(term.docks)

      term.docks.forEach(q => {
        const c = unpackDock(q, L.modulus)

        for (let d = 0; d < 24; d++) {
          candidates.add(
            packDock(
              c.map((v, j) => v + L.step[d]![j]!),
              L.modulus,
            ),
          )
        }
      })

      const docks: number[] = []
      const vals: number[] = []

      for (const y of [...candidates].sort((a, b) => a - b)) {
        const cy = unpackDock(y, L.modulus)
        const cell = boxCell(L, y)
        const row = new Int8Array(36)

        let differs = false

        for (let d = 0; d < 24; d++) {
          const from = packDock(
            cy.map((v, j) => v - L.step[d]![j]!),
            L.modulus,
          )
          const k = index.get(from)
          const v =
            k === undefined ? vNext[cell * 24 + d]! : post[k * 36 + d]!

          row[d] = v

          if (v !== vNext[cell * 24 + d]) {
            differs = true
          }
        }

        const ky = index.get(y)

        for (let l = 0; l < 12; l++) {
          const v =
            ky === undefined
              ? sNext[cell * 12 + l]!
              : post[ky * 36 + 24 + l]!

          row[24 + l] = v

          if (v !== sNext[cell * 12 + l]) {
            differs = true
          }
        }

        if (!differs) {
          continue
        }

        docks.push(y)
        vals.push(...row)
      }

      const values = Int8Array.from(vals)

      if (Number.isFinite(spec.cut)) {
        let singles = 0

        for (let k = 0; k < docks.length; k++) {
          singles += lineCounts(values, k * 36).singles
        }

        if (singles > spec.cut) {
          tally.escaped += spec.classical ? re : re * re + im * im
          continue
        }
      }

      add(out, spec, L.modulus, docks, values, re, im)
    }
  }

  for (const [k, v] of out) {
    if (v.re === 0 && v.im === 0) {
      out.delete(k)
    }
  }

  tally.terms = Math.max(tally.terms, out.size)

  return out
}

// ---- readings ----

// the mesh line of line class l through dock k: the dock moved along the line's step until the step's first unit axis
// reads 0, with the class
export function meshLineId(
  L: LiquidLattice,
  k: number,
  l: number,
): string {
  const s = L.step[LINE_FIRSTS[l]!]!
  const a = s.findIndex(v => Math.abs(v) === 1)

  if (a < 0) {
    throw new Error('line-liquid: a line step with no unit axis')
  }

  const y = unpackDock(k, L.modulus)
  const q = y[a]! * s[a]!

  return `${l}:${packDock(
    y.map((v, j) => v - q * s[j]!),
    L.modulus,
  )}`
}

export type LiquidReading = {
  weight: number
  // weight on terms whose mesh-line tones differ from the vacuum's on exactly one line (the love's own), the mean and
  // the most lines off, and weight on terms whose every difference lies on one given mesh line
  e1: number
  meanOff: number
  maxOff: number
  onLine: number
  terms: number
}

// the readings of a state after `t` beats (onLine: every difference of the term on one mesh line, whichever, since a
// Bloch representative is a translate)
export function liquidReading(
  L: LiquidLattice,
  s: LiquidState,
  t: number,
  classical = false,
): LiquidReading {
  const vv = L.vibe[t % VACUUM_PERIOD]!
  const vs = L.store[t % VACUUM_PERIOD]!
  const out: LiquidReading = {
    weight: 0,
    e1: 0,
    meanOff: 0,
    maxOff: 0,
    onLine: 0,
    terms: s.size,
  }

  for (const term of s.values()) {
    const w = termWeight(term, classical)
    const tone = new Map<string, number>()
    const touched = new Set<string>()

    term.docks.forEach((k, j) => {
      const cell = boxCell(L, k)

      for (let d = 0; d < 24; d++) {
        const v = term.values[j * 36 + d]!
        const u = vv[cell * 24 + d]!

        if (v === u) {
          continue
        }

        const id = meshLineId(L, k, LINE_OF[d]!)

        touched.add(id)
        tone.set(id, (tone.get(id) ?? 0) + v - u)
      }

      for (let l = 0; l < 12; l++) {
        if (term.values[j * 36 + 24 + l] !== vs[cell * 12 + l]) {
          touched.add(meshLineId(L, k, l))
        }
      }
    })

    const only = touched.size <= 1

    let off = 0

    for (const v of tone.values()) {
      if (v !== 0) {
        off++
      }
    }

    out.weight += w

    if (off === 1) {
      out.e1 += w
    }

    out.meanOff += w * off
    out.maxOff = Math.max(out.maxOff, off)

    if (only) {
      out.onLine += w
    }
  }

  if (out.weight > 0) {
    out.meanOff /= out.weight
  }

  return out
}

// the largest difference between two Bloch states' amplitude MODULI, term by term (a term missing from one counts in
// full). A term's Bloch phase depends on which cell its canonical translate starts from, a gauge; the moduli do not,
// so two momenta give equal moduli on every term exactly when no two histories reaching one term differ by a
// translation the momenta read differently (a lineon, for momenta differing across its line)
export function liquidDistance(u: LiquidState, v: LiquidState): number {
  let d = 0

  for (const [k, a] of u) {
    const b = v.get(k)

    d = Math.max(
      d,
      Math.abs(
        Math.hypot(a.re, a.im) - Math.hypot(b?.re ?? 0, b?.im ?? 0),
      ),
    )
  }

  for (const [k, b] of v) {
    if (!u.has(k)) {
      d = Math.max(d, Math.hypot(b.re, b.im))
    }
  }

  return d
}

// the configuration of a one-term state on the side-8 box (a keyed path's check against the rule): the vacuum at beat
// t with the term's docks overwritten
export function termOnBox(
  L: LiquidLattice,
  term: LiquidTerm,
  t: number,
): { vibe: Int8Array; store: Int8Array } {
  const vibe = Int8Array.from(L.vibe[t % VACUUM_PERIOD]!)
  const store = Int8Array.from(L.store[t % VACUUM_PERIOD]!)

  term.docks.forEach((k, j) => {
    const cell = boxCell(L, k)

    vibe.set(term.values.subarray(j * 36, j * 36 + 24), cell * 24)
    store.set(term.values.subarray(j * 36 + 24, j * 36 + 36), cell * 12)
  })

  return { vibe, store }
}
