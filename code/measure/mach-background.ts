// A PROBE IN A BACKGROUND OF MATTER (E-SPN-0124). Readings for Pretko's Mach question in the working knit: a lone hub is
// pinned (E-SPN-0119's star theorem), but can a composite move by exchange with a uniform background of other composites?
//
// THE BACKGROUND (`periodicHubs`): hubs at X + p v for every box vector v, p dividing the side, so on the unbounded mesh
// the array is X + p D4. THE TRACK (`machTrack`): the joint run (background plus probe) and the background run in
// lockstep through hub-star's `starBeat`, so every firing of K is recorded, one keyed path (one term of the all-open
// rule, code/measure/full-key-paths). Per beat:
//  - the probe's CHARGE EXCESS on every dock, the joint run's vibes minus the background run's (a love +1, a fear -1;
//    a stored pair carries tone 0), and its total (conserved: it must stay the probe's charge)
//  - the probe's charge centroid, a Cartesian 4-vector from the probe's dock P (minimal image, code/measure/two-hub-bound
//    `cartesianOffset`), weighted by the excess
//  - the WEIGHT of the probe's difference (slot and store readings where the joint run differs from the background
//    run) that lies off the mesh lines through P, and its footprint (docks holding a difference)
//  - the K firings of the joint run off the hubs and off P
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line). NOTHING MOVES: every piece hands
// a value to a slot, and the stream takes it one dock along.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import {
  starBeat,
  starLines,
  type KEvent,
} from '@/code/measure/hub-star'
import { storeLine } from '@/code/measure/planon-lines'
import { cartesianOffset } from '@/code/measure/two-hub-bound'
import {
  d4BoxCell,
  d4BoxCoordinates,
} from '@/code/substrate/d4-box-integer'

// the docks X + p v, v over the box's (side / p)^4 coarse vectors, in box coordinates
export function periodicHubs(
  side: number,
  anchor: number,
  period: number,
): number[] {
  if (side % period !== 0) {
    throw new Error(
      `periodicHubs: period ${period} does not divide side ${side}`,
    )
  }

  const n = side / period
  const c = d4BoxCoordinates({ cell: anchor, side })
  const out: number[] = []

  for (let k = 0; k < n ** 4; k++) {
    out.push(
      d4BoxCell({
        coordinates: c.map(
          (x, i) => x + period * (Math.floor(k / n ** i) % n),
        ),
        side,
      }),
    )
  }

  return out
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

export type MachTrack = {
  // per beat (index t is after beat t + 1)
  centroid: number[][]
  charge: number[]
  wake: number[]
  offStar: number[]
  footprint: number[]
  // K firings in the joint run off the hubs and the probe's dock, and the docks they fired on
  offHubEvents: number
  offHubDocks: number
  // K firings in the background run, per hub and off every hub
  backgroundEvents: KEvent[]
  backgroundOffHub: number
  last: Configuration
}

export function machTrack(input: {
  tables: LockedTables
  background: Configuration
  start: Configuration
  lines: MeshLines
  hubs: readonly number[]
  probe: number
  key: PathKey
  threshold: number
  beats: number
  side: number
}): MachTrack {
  const {
    tables,
    background,
    start,
    lines,
    hubs,
    probe,
    key,
    threshold,
    beats,
    side,
  } = input
  const offsets = Array.from({ length: tables.cells }, (_, x) =>
    cartesianOffset(side, probe, x),
  )
  const inStar = starLines(lines, [probe])
  const own = new Set([...hubs, probe])
  const bgHubs = new Set(hubs)

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(background)
  let q = cloneConfiguration(background)

  const events: KEvent[] = []
  const backgroundEvents: KEvent[] = []
  const fired = new Set<number>()
  const out: MachTrack = {
    centroid: [],
    charge: [],
    wake: [],
    offStar: [],
    footprint: [],
    offHubEvents: 0,
    offHubDocks: 0,
    backgroundEvents,
    backgroundOffHub: 0,
    last: a,
  }

  let seen = 0

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    starBeat(tables, p, q, key, threshold, t, backgroundEvents)

    ;[a, b] = [b, a]

    ;[p, q] = [q, p]

    for (; seen < events.length; seen++) {
      const d = events[seen]!.dock

      if (own.has(d)) {
        continue
      }

      out.offHubEvents++
      fired.add(d)
    }

    const sum = [0, 0, 0, 0]

    let charge = 0
    let wake = 0
    let offStar = 0
    let docks = 0

    for (let x = 0; x < tables.cells; x++) {
      let here = 0
      let rho = 0

      for (let d = 0; d < 24; d++) {
        const i = x * 24 + d

        rho += a.vibe[i]! - p.vibe[i]!

        if (sameSlot(a, p, i)) {
          continue
        }

        here++

        if (!inStar[lines.lineOf[i]!]) {
          offStar++
        }
      }

      for (let l = 0; l < 12; l++) {
        const s = x * 12 + l

        if (sameStore(a, p, s)) {
          continue
        }

        here++

        if (!inStar[storeLine(lines, s)]) {
          offStar++
        }
      }

      if (here > 0) {
        docks++
      }

      wake += here
      charge += rho

      if (rho !== 0) {
        offsets[x]!.forEach((v, k) => (sum[k]! += rho * v))
      }
    }

    out.centroid.push(sum.map(v => (charge === 0 ? 0 : v / charge)))
    out.charge.push(charge)
    out.wake.push(wake)
    out.offStar.push(offStar)
    out.footprint.push(docks)
  }

  out.offHubDocks = fired.size
  out.backgroundOffHub = backgroundEvents.filter(
    e => !bgHubs.has(e.dock),
  ).length
  out.last = a

  return out
}

// ---- readings over an ensemble of terms ----

// the least-squares slope of log y against log t over the beats t in [from, to] where y > 0 (NaN if fewer than two)
export function growthExponent(
  y: readonly number[],
  from: number,
  to: number,
): number {
  const pts: [number, number][] = []

  for (let t = from; t <= to; t++) {
    const v = y[t - 1]!

    if (v > 0) {
      pts.push([Math.log(t), Math.log(v)])
    }
  }

  if (pts.length < 2) {
    return Number.NaN
  }

  const mx = pts.reduce((s, [x]) => s + x, 0) / pts.length
  const my = pts.reduce((s, [, v]) => s + v, 0) / pts.length
  const sxx = pts.reduce((s, [x]) => s + (x - mx) ** 2, 0)

  return sxx === 0
    ? Number.NaN
    : pts.reduce((s, [x, v]) => s + (x - mx) * (v - my), 0) / sxx
}

// the anisotropy of a set of displacement vectors: the Frobenius norm of their second-moment tensor's traceless part
// over its trace (0 for an isotropic set, e.g. the 24 D4 roots, a spherical 5-design; sqrt(1 - 1 / d) for vectors
// along one line, 0.866 in 4d); NaN for an empty or zero set
export function secondMomentAnisotropy(
  vectors: readonly number[][],
): number {
  const d = vectors[0]?.length ?? 0
  const m = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) =>
      vectors.reduce((s, v) => s + v[i]! * v[j]!, 0),
    ),
  )
  const trace = m.reduce((s, row, i) => s + row[i]!, 0)

  if (d === 0 || trace === 0) {
    return Number.NaN
  }

  let f = 0

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      f += (m[i]![j]! - (i === j ? trace / d : 0)) ** 2
    }
  }

  return Math.sqrt(f) / trace
}
