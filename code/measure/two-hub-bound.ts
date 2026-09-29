// A TWO-HUB COMPOSITE UNDER THE DRIFT COST (E-SPN-0120). Readings for the question whether the drift cost's string
// confines the K-cascade two hubs set off (E-SPN-0119) to a wake that travels with the composite.
//
// THE TRACK (`twoHubTrack`): one term of the all-open rule (a keyed path, code/measure/full-key-paths), the joint run
// and the vacuum run in lockstep through hub-star's `starBeat`, so every firing of K is recorded. Per beat:
//  - the wake: slot and store readings that differ from the vacuum run, and its footprint, the docks holding one
//  - the docks K has fired on so far
//  - the wake's centroid, weighted by readings, as a Cartesian 4-vector from the hub X (minimal image per box
//    coordinate, then code/substrate/d4-box-integer d4Vector), and the centroid of that beat's K firings
//  - THE DRIFT COST'S REGISTER on every link. An OPEN vibe copied across a link writes the recorded hop of E-FRC-0230
//    there (f - q forward, f + q back, mod 3), so on one line with a closed vacuum this is code/rule/bound-line-pieces'
//    register exactly. The working vacuum's vibes are open too (wordVacuum 'all'), so the vacuum writes flux of its
//    own; the cost counts the links where the joint run's register differs from the vacuum run's, so the vacuum pays
//    nothing and a vibe displaced from its vacuum history drags string. `costly` is that count per beat and `cost` its
//    running sum, the integer k of the phase zeta^(-k), zeta = e^(i pi / (2 D + 1)), at every tension D at once.
// The cost is a phase diagonal in the configuration: it moves no vibe, so a term's configurations are the same at
// every tension (the track reads them once) and only its phase depends on D.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line). NOTHING MOVES: every piece
// hands a value to a slot, the stream takes it one dock along, and the register is written by the stream's copies.

import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { type PathKey } from '@/code/measure/full-key-paths'
import {
  singlesAt,
  starBeat,
  type KEvent,
} from '@/code/measure/hub-star'
import {
  d4BoxCoordinates,
  d4Vector,
} from '@/code/substrate/d4-box-integer'

// vibes placed on the vacuum: each on its slot at its dock (1 a love, -1 a fear), open, point 0, the slot's dock line
// cleared first (both slots and its store), as hub-star's placeLoves does for loves
export function placeVibes(
  vacuum: Configuration,
  vibes: readonly { dock: number; slot: number; vibe: number }[],
): Configuration {
  const s = cloneConfiguration(vacuum)

  for (const { dock, slot } of vibes) {
    const l = LINE_OF[slot]!

    for (const d of [LINE_FIRSTS[l]!, OPPOSITE[LINE_FIRSTS[l]!]!]) {
      s.vibe[dock * 24 + d] = 0
      s.point[dock * 24 + d] = 0
      s.open[dock * 24 + d] = 0
    }

    s.store[dock * 12 + l] = 0
    s.spoint[dock * 12 + l] = 0
    s.sopen[dock * 12 + l] = 0
  }

  for (const { dock, slot, vibe } of vibes) {
    s.vibe[dock * 24 + slot] = vibe
    s.open[dock * 24 + slot] = 1
  }

  return s
}

// ---- geometry ----

// minimal-image box offset of dock x from dock o, in box coordinates, then as a Cartesian 4-vector
export function cartesianOffset(
  side: number,
  o: number,
  x: number,
): number[] {
  const a = d4BoxCoordinates({ cell: o, side })
  const b = d4BoxCoordinates({ cell: x, side })

  return d4Vector(
    b.map((v, k) => {
      const d = (((v - a[k]!) % side) + side) % side

      return d > side / 2 ? d - side : d
    }),
  )
}

// the twelve line classes as Cartesian 4-vectors, read from the stream: the offset of each line's first slot's target
export function lineDirections(
  tables: LockedTables,
  side: number,
  x: number,
): number[][] {
  return LINE_FIRSTS.map(f =>
    cartesianOffset(
      side,
      x,
      Math.floor(tables.target[x * 24 + f]! / 24),
    ),
  )
}

// the distance of v from the nearest line class through the origin (the part of v off every single line)
export function offLine(
  v: readonly number[],
  lines: readonly number[][],
): number {
  let best = Infinity

  for (const r of lines) {
    const rr = r.reduce((s, x) => s + x * x, 0)
    const vr = r.reduce((s, x, k) => s + x * v[k]!, 0)
    const perp = v.reduce(
      (s, x, k) => s + (x - (vr / rr) * r[k]!) ** 2,
      0,
    )

    best = Math.min(best, Math.sqrt(Math.max(0, perp)))
  }

  return best
}

// the docks other than `own` lying on two or more of the mesh lines `lines` (where two of them cross)
export function lineCrossings(
  cells: number,
  lineOf: Int32Array,
  lines: readonly number[],
  own: readonly number[],
): number[] {
  const set = new Set(lines)
  const skip = new Set(own)
  const out: number[] = []

  for (let y = 0; y < cells; y++) {
    if (skip.has(y)) {
      continue
    }

    let n = 0

    for (let l = 0; l < 12; l++) {
      if (set.has(lineOf[y * 24 + LINE_FIRSTS[l]!]!)) {
        n++
      }
    }

    if (n >= 2) {
      out.push(y)
    }
  }

  return out
}

// the numerical rank of a set of vectors (Gram matrix eigenvalues above `tolerance` of the largest), by Jacobi sweeps
export function numericalRank(
  vectors: readonly number[][],
  tolerance = 1e-6,
): number {
  const n = vectors[0]?.length ?? 0
  const g = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      vectors.reduce((s, v) => s + v[i]! * v[j]!, 0),
    ),
  )

  for (let sweep = 0; sweep < 50; sweep++) {
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const gpq = g[p]![q]!

        if (Math.abs(gpq) < 1e-300) {
          continue
        }

        const theta = (g[q]![q]! - g[p]![p]!) / (2 * gpq)
        const t =
          Math.sign(theta || 1) /
          (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const gkp = g[k]![p]!
          const gkq = g[k]![q]!

          g[k]![p] = c * gkp - s * gkq
          g[k]![q] = s * gkp + c * gkq
        }

        for (let k = 0; k < n; k++) {
          const gpk = g[p]![k]!
          const gqk = g[q]![k]!

          g[p]![k] = c * gpk - s * gqk
          g[q]![k] = s * gpk + c * gqk
        }
      }
    }
  }

  const eig = g.map((row, i) => row[i]!)
  const top = Math.max(0, ...eig)

  return top === 0 ? 0 : eig.filter(e => e > tolerance * top).length
}

// ---- the drift cost's register ----

const mod3 = (v: number): number => ((v % 3) + 3) % 3

// the register written by the stream's copies of the OPEN vibes, read on the configuration AFTER the stream (every
// vibe on a first slot came forward across the link from its source dock, every vibe on a second slot came back
// across the link from its own dock): link (x, l) joins x to the dock its line's first slot streams into
export function writeFluxAfterStream(
  tables: LockedTables,
  c: Configuration,
  flux: Int8Array,
): void {
  for (let i = 0; i < c.vibe.length; i++) {
    const q = c.vibe[i]!

    if (q === 0 || !c.open[i]) {
      continue
    }

    const d = i % 24
    const l = LINE_OF[d]!

    if (d === LINE_FIRSTS[l]) {
      const link = Math.floor(tables.source[i]! / 24) * 12 + l

      flux[link] = mod3(flux[link]! - q)
    } else {
      const link = Math.floor(i / 24) * 12 + l

      flux[link] = mod3(flux[link]! + q)
    }
  }
}

// the open like meetings of unequal points on a configuration: where the superposed rule splits a branch in two
export function unequalLikeMeetings(c: Configuration): number {
  let n = 0

  for (let x = 0; x * 24 < c.vibe.length; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + OPPOSITE[LINE_FIRSTS[l]!]!

      if (
        c.vibe[i] !== 0 &&
        c.vibe[i] === c.vibe[j] &&
        c.open[i] &&
        c.open[j] &&
        c.point[i] !== c.point[j]
      ) {
        n++
      }
    }
  }

  return n
}

// ---- the track ----

export type TwoHubTrack = {
  // per beat (index t is after beat t + 1): readings differing from the vacuum, docks holding one, docks K has fired
  // on so far, the wake centroid from X (Cartesian), the centroid of that beat's K firings (empty if none fired)
  wake: number[]
  footprint: number[]
  kDocks: number[]
  centroid: number[][]
  kCentroid: (number[] | undefined)[]
  // the drift cost: links whose register differs from the vacuum run's, per beat, and the running sum k
  costly: number[]
  cost: number[]
  events: KEvent[]
  // K firings and single lines in the vacuum run
  vacuumEvents: number
  vacuumSingles: number
  // the most open like meetings of unequal points the vacuum run holds at the start of a beat (where the superposed
  // rule splits a branch in two)
  vacuumSplits: number
  // the joint run's configuration after the last beat
  last: Configuration
}

const sameSlot = (
  p: Configuration,
  q: Configuration,
  i: number,
): boolean =>
  p.vibe[i] === q.vibe[i] &&
  (p.vibe[i] === 0 ||
    (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (
  p: Configuration,
  q: Configuration,
  s: number,
): boolean =>
  p.store[s] === q.store[s] &&
  (p.store[s] === 0 ||
    (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

export function twoHubTrack(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  hub: number
  key: PathKey
  threshold: number
  beats: number
  side: number
}): TwoHubTrack {
  const { tables, vacuum, start, hub, key, threshold, beats, side } =
    input
  const offsets = Array.from({ length: tables.cells }, (_, x) =>
    cartesianOffset(side, hub, x),
  )

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(vacuum)
  let q = cloneConfiguration(vacuum)

  const events: KEvent[] = []
  const vacuumEvents: KEvent[] = []
  const fired = new Uint8Array(tables.cells)
  const flux = new Int8Array(tables.cells * 12)
  const vacuumFlux = new Int8Array(tables.cells * 12)

  let firedCount = 0
  let seen = 0
  let cost = 0

  const out: TwoHubTrack = {
    wake: [],
    footprint: [],
    kDocks: [],
    centroid: [],
    kCentroid: [],
    costly: [],
    cost: [],
    events,
    vacuumEvents: 0,
    vacuumSingles: 0,
    vacuumSplits: unequalLikeMeetings(vacuum),
    last: a,
  }

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    starBeat(tables, p, q, key, threshold, t, vacuumEvents)

    ;[a, b] = [b, a]

    ;[p, q] = [q, p]
    writeFluxAfterStream(tables, a, flux)
    writeFluxAfterStream(tables, p, vacuumFlux)
    out.vacuumSplits = Math.max(
      out.vacuumSplits,
      unequalLikeMeetings(p),
    )

    const kSum = [0, 0, 0, 0]

    let kCount = 0

    for (; seen < events.length; seen++) {
      const d = events[seen]!.dock

      offsets[d]!.forEach((v, k) => (kSum[k]! += v))
      kCount++

      if (!fired[d]) {
        fired[d] = 1
        firedCount++
      }
    }

    let wake = 0
    let docks = 0

    const sum = [0, 0, 0, 0]

    for (let x = 0; x < tables.cells; x++) {
      let here = 0

      for (let d = 0; d < 24; d++) {
        if (!sameSlot(a, p, x * 24 + d)) {
          here++
        }
      }

      for (let l = 0; l < 12; l++) {
        if (!sameStore(a, p, x * 12 + l)) {
          here++
        }
      }

      out.vacuumSingles += singlesAt(p, x)

      if (here === 0) {
        continue
      }

      wake += here
      docks++
      offsets[x]!.forEach((v, k) => (sum[k]! += here * v))
    }

    let costly = 0

    for (let i = 0; i < flux.length; i++) {
      if (flux[i] !== vacuumFlux[i]) {
        costly++
      }
    }

    cost += costly

    out.wake.push(wake)
    out.footprint.push(docks)
    out.kDocks.push(firedCount)
    out.centroid.push(sum.map(v => (wake === 0 ? 0 : v / wake)))
    out.kCentroid.push(
      kCount === 0 ? undefined : kSum.map(v => v / kCount),
    )
    out.costly.push(costly)
    out.cost.push(cost)
  }

  out.vacuumEvents = vacuumEvents.length
  out.last = a

  return out
}
