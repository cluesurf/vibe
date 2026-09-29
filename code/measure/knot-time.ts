// Time near a held knot on the adopted knit: the local clock and the signal delay (E-GRV-0058). Gravity as geometry
// asks whether anything local runs slower near a knot. This file builds the readers; the knot, its stream and its fills
// are code/measure/held-knot's, unchanged.
//
// THE KNIT. The coset-union vacuum under the lone bounce collision, run by the bounce kernel with the knot's stream
// (code/measure/held-knot, E-GRV-0056). Side 24 by default (331,776 docks).
//
// THREE CONFIGURATIONS, run side by side from one start:
//   none     the plain stream, no knot
//   surface  the held husk ball of radius 2 with NOTHING inside (lump = false): a surface only, zero content
//   knot     the same held ball with the dense lump inside (lump = true), E-GRV-0056's knot
// Knot minus surface is the content's effect; surface minus none is the surface's. Every beat of every surface and
// knot run is compared outside the ball, slot by slot and line by line (E-GRV-0056's invisibility, checked again).
//
// THE CLOCK. The vacuum (no gas) is a pair exchange: a store emits a love and fear pair, which stream to a hub and are
// taken back. Its local state per husk column (every slot's vibe and point and every line's store and point on the
// column's docks) is periodic. A column's LOCAL PERIOD is the least p <= maxPeriod with the column's state at beat
// t + p equal to its state at t for every t in the window; 0 when there is none. Equality is read through two
// independent 32-bit hashes of the column state (a reader, disclosed: a collision would read a false period). A
// clock that runs slower near the knot has a longer local period there. THE PHASE, reported: for a column with the
// no-knot period, the least shift s in 0 .. P0 - 1 with its state at t equal to the no-knot column's at t + s over
// the window (s > 0: the clock is behind), or none.
//
// THE SIGNAL. A one-slot change against a twin run: one love vibe added to a calm slot of a +x axis root (a root
// casting husk direction (1, 0, 0)) on the lowest-depth dock of the SOURCE column (-a, b, 0), the knot at the
// origin. Its ARRIVAL is the first beat at which the DETECTOR column (a, b, 0) differs between the twin and the
// base run (every slot and line of the column compared); maxBeats + 1 when it never does. Straight along +x the
// distance is 2a columns and no root advances x by more than one column per beat, so 2a is the least possible
// arrival; the way round the torus is side - 2a. Two backgrounds: the vacuum (a lone change travels only along its
// own line, a theorem of the collision) and the gas of E-GRV-0056 (8 of 24 slots per dock, so a change spreads by
// scattering). THE DELAY: arrival with the surface (or knot) minus arrival with none, per member (a Shapiro-style
// delay); b = 0 puts the knot on the straight path.
//
// NO ROUNDING in the rule (permutations of trits and integer points). Reals and hashes only in the readers.
// DETERMINISM: the 17 link starts of code/measure/start-ensemble and Weyl fills; nothing is drawn. NOTHING MOVES: the
// stream copies each vibe one dock along its root, and a reflected vibe takes the opposite slot of its own dock.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  arrowBox,
  chargeOf,
  energyOf,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import {
  columnPosition,
  knotRunner,
  knotStart,
  knotStream,
  ring,
  type KnotStream,
} from '@/code/measure/held-knot'
import {
  cloneReduced,
  type Reduced,
} from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

const ROOTS = rootsD4()

// the slot directions casting husk +x
export const PLUS_X_ROOTS: readonly number[] = ROOTS.map((r, d) =>
  r[0] === 1 && r[1] === 0 && r[2] === 0 ? d : -1,
).filter(d => d >= 0)

export type TimeSettings = {
  readonly side: number
  readonly radius: number
  readonly offsets: number
  readonly gasPerDock: number
  // the clock: beats run, the window [clockFrom, clockFrom + clockSpan), the longest period searched
  readonly clockBeats: number
  readonly clockFrom: number
  readonly clockSpan: number
  readonly maxPeriod: number
  // the signal: source (-reach, b, 0), detector (reach, b, 0)
  readonly reach: number
  readonly impacts: readonly number[]
  readonly signalBeats: number
  readonly shells: readonly number[]
}

// fixed before the first run of E-GRV-0058
export const TIME: TimeSettings = {
  side: 24,
  radius: 2,
  offsets: 16,
  gasPerDock: 8,
  clockBeats: 96,
  clockFrom: 48,
  clockSpan: 24,
  maxPeriod: 24,
  reach: 5,
  impacts: [0, 3, 4, 5, 6],
  signalBeats: 24,
  shells: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export type Config = 'none' | 'surface' | 'knot'
export const CONFIGS: readonly Config[] = ['none', 'surface', 'knot']
export type Background = 'vacuum' | 'gas'

export type TimeMember = {
  name: string
  // per config: the local period of every husk column (0: none within maxPeriod)
  period: Record<Config, Int32Array>
  // per config other than none: per column the phase shift against the no-knot clock (-1: none, -2: not at P0)
  phase: Record<'surface' | 'knot', Int32Array>
  // per background, config, impact index: the arrival beat
  arrival: Record<Background, Record<Config, number[]>>
  exact: boolean
  knotHeld: boolean
  // every surface and knot run equal outside the ball at every beat, and the number of beats compared
  contentBlind: boolean
  blindBeats: number
  seconds: number
}

// two independent 32-bit hashes of every husk column's local state, into a and b (length side^3)
export function columnHashes(
  box: ArrowBox,
  s: Reduced,
  a: Int32Array,
  b: Int32Array,
): void {
  a.fill(0)
  b.fill(0)

  for (let x = 0; x < box.cells; x++) {
    const c = box.column[x]!
    const d4 = box.depth[x]!

    let ha = a[c]!
    let hb = b[c]!

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d]! * 16 + s.point[x * 24 + d]! + 40

      ha = Math.imul(ha ^ (v + d4 * 131 + d * 7), 0x9e3779b1)
      hb =
        Math.imul(hb + v * 31 + d4 * 17 + d, 0x85ebca6b) ^ (hb >>> 13)
    }

    for (let l = 0; l < 12; l++) {
      const v = s.store[x * 12 + l]! * 16 + s.spoint[x * 12 + l]! + 40

      ha = Math.imul(ha ^ (v + d4 * 131 + l * 11 + 500), 0x9e3779b1)
      hb =
        Math.imul(hb + v * 37 + d4 * 19 + l + 500, 0x85ebca6b) ^
        (hb >>> 13)
    }

    a[c] = ha
    b[c] = hb
  }
}

// the local period of every column from per-beat hashes (index t - 1 holds beat t)
export function localPeriods(
  ha: readonly Int32Array[],
  hb: readonly Int32Array[],
  from: number,
  span: number,
  maxPeriod: number,
): Int32Array {
  const columns = ha[0]!.length
  const out = new Int32Array(columns)

  for (let c = 0; c < columns; c++) {
    for (
      let p = 1;
      p <= maxPeriod && from + span + p <= ha.length;
      p++
    ) {
      let ok = true

      for (let t = from; t < from + span && ok; t++) {
        if (
          ha[t]![c] !== ha[t + p]![c] ||
          hb[t]![c] !== hb[t + p]![c]
        ) {
          ok = false
        }
      }

      if (ok) {
        out[c] = p
        break
      }
    }
  }

  return out
}

// the phase shift of each column against a reference run's hashes (-1 none, -2 when the column's own period is not p0)
export function phaseShifts(
  ha: readonly Int32Array[],
  hb: readonly Int32Array[],
  ra: readonly Int32Array[],
  rb: readonly Int32Array[],
  period: Int32Array,
  p0: number,
  from: number,
  span: number,
): Int32Array {
  const out = new Int32Array(period.length)

  for (let c = 0; c < period.length; c++) {
    if (period[c] !== p0) {
      out[c] = -2
      continue
    }

    out[c] = -1

    for (let s = 0; s < p0; s++) {
      let ok = true

      for (let t = from; t < from + span && ok; t++) {
        if (
          ha[t]![c] !== ra[t + s]![c] ||
          hb[t]![c] !== rb[t + s]![c]
        ) {
          ok = false
        }
      }

      if (ok) {
        out[c] = s
        break
      }
    }
  }

  return out
}

// the docks of a husk column, lowest depth first
export function docksOfColumn(box: ArrowBox, column: number): number[] {
  const out: number[] = []

  for (let x = 0; x < box.cells; x++) {
    if (box.column[x] === column) {
      out.push(x)
    }
  }

  return out.sort((x, y) => box.depth[x]! - box.depth[y]!)
}

const columnIndex = (side: number, p: readonly number[]): number => {
  const m = (v: number): number => ((v % side) + side) % side

  return m(p[0]!) + side * m(p[1]!) + side * side * m(p[2]!)
}

// the twin start: one love vibe on the first calm +x slot of the lowest-depth dock of the source column that has one
export function twinStart(
  box: ArrowBox,
  base: Reduced,
  source: readonly number[],
): Reduced {
  const out = cloneReduced(base)

  for (const x of docksOfColumn(box, columnIndex(box.side, source))) {
    for (const d of PLUS_X_ROOTS) {
      if (out.vibe[x * 24 + d] === 0) {
        out.vibe[x * 24 + d] = 1
        out.point[x * 24 + d] = 0

        return out
      }
    }
  }

  throw new Error('no calm +x slot in the source column')
}

// the column's local state, flat (for comparing a twin against its base)
function columnState(s: Reduced, docks: readonly number[]): Int8Array {
  const out = new Int8Array(docks.length * 72)

  let i = 0

  for (const x of docks) {
    for (let d = 0; d < 24; d++) {
      out[i++] = s.vibe[x * 24 + d]!
      out[i++] = s.vibe[x * 24 + d] !== 0 ? s.point[x * 24 + d]! : 0
    }

    for (let l = 0; l < 12; l++) {
      out[i++] = s.store[x * 12 + l]!
      out[i++] = s.store[x * 12 + l] !== 0 ? s.spoint[x * 12 + l]! : 0
    }
  }

  return out
}

const sameArray = (a: Int8Array, b: Int8Array): boolean =>
  a.every((v, i) => v === b[i])

// the outside of two knot runs compared slot by slot and line by line (occupied points and stored points too)
function sameOutside(k: KnotStream, a: Reduced, b: Reduced): boolean {
  for (let x = 0; x < k.box.cells; x++) {
    if (k.held[x]) {
      continue
    }

    for (let d = 0; d < 24; d++) {
      const i = x * 24 + d

      if (
        a.vibe[i] !== b.vibe[i] ||
        (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
      ) {
        return false
      }
    }

    for (let l = 0; l < 12; l++) {
      const i = x * 12 + l

      if (
        a.store[i] !== b.store[i] ||
        (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])
      ) {
        return false
      }
    }
  }

  return true
}

function timeMember(
  member: ReturnType<typeof startFamily>[number],
  phase: number,
  S: TimeSettings,
): TimeMember {
  const started = Date.now()
  const box = withStart(member, () => arrowBox(S.side, 4))
  const columns = S.side ** 3
  const streams: Record<Config, KnotStream> = {
    none: knotStream(box, -1, [0, 0, 0]),
    surface: knotStream(box, S.radius, [0, 0, 0]),
    knot: knotStream(box, S.radius, [0, 0, 0]),
  }
  const lump: Record<Config, boolean> = {
    none: true,
    surface: false,
    knot: true,
  }

  let exact = true
  let knotHeld = true
  let contentBlind = true
  let blindBeats = 0

  // run the three configurations from one background in lockstep, calling `each` after every beat
  const lockstep = (
    starts: Record<Config, Reduced>,
    beats: number,
    each: (t: number, states: Record<Config, Reduced>) => void,
  ): void => {
    const runners = {
      none: knotRunner(streams.none, starts.none),
      surface: knotRunner(streams.surface, starts.surface),
      knot: knotRunner(streams.knot, starts.knot),
    }
    const e0 = {
      none: energyOf(starts.none),
      surface: energyOf(starts.surface),
      knot: energyOf(starts.knot),
    }
    const q0 = {
      none: chargeOf(starts.none),
      surface: chargeOf(starts.surface),
      knot: chargeOf(starts.knot),
    }

    for (let t = 1; t <= beats; t++) {
      for (const c of CONFIGS) {
        runners[c].forward()
        exact =
          exact &&
          energyOf(runners[c].state()) === e0[c] &&
          chargeOf(runners[c].state()) === q0[c]
      }

      const states = {
        none: runners.none.state(),
        surface: runners.surface.state(),
        knot: runners.knot.state(),
      }
      const same = sameOutside(
        streams.knot,
        states.surface,
        states.knot,
      )

      contentBlind = contentBlind && same

      if (same) {
        blindBeats++
      }

      each(t, states)
    }

    // the held ball unchanged after the run
    for (const c of ['surface', 'knot'] as const) {
      const s = runners[c].state()

      for (let x = 0; x < box.cells; x++) {
        if (!streams[c].held[x]) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          if (
            s.vibe[x * 24 + d] !== starts[c].vibe[x * 24 + d] ||
            s.point[x * 24 + d] !== starts[c].point[x * 24 + d]
          ) {
            knotHeld = false
          }
        }

        for (let l = 0; l < 12; l++) {
          if (s.store[x * 12 + l] !== starts[c].store[x * 12 + l]) {
            knotHeld = false
          }
        }
      }
    }
  }

  const startsOf = (perDock: number): Record<Config, Reduced> => ({
    none: knotStart(streams.none, { perDock, phase, lump: lump.none }),
    surface: knotStart(streams.surface, {
      perDock,
      phase,
      lump: lump.surface,
    }),
    knot: knotStart(streams.knot, { perDock, phase, lump: lump.knot }),
  })

  // THE CLOCK: the vacuum, per-beat column hashes
  const ha: Record<Config, Int32Array[]> = {
    none: [],
    surface: [],
    knot: [],
  }
  const hb: Record<Config, Int32Array[]> = {
    none: [],
    surface: [],
    knot: [],
  }

  lockstep(startsOf(0), S.clockBeats, (_, states) => {
    for (const c of CONFIGS) {
      const a = new Int32Array(columns)
      const b = new Int32Array(columns)

      columnHashes(box, states[c], a, b)
      ha[c].push(a)
      hb[c].push(b)
    }
  })

  const period = {
    none: localPeriods(
      ha.none,
      hb.none,
      S.clockFrom,
      S.clockSpan,
      S.maxPeriod,
    ),
    surface: localPeriods(
      ha.surface,
      hb.surface,
      S.clockFrom,
      S.clockSpan,
      S.maxPeriod,
    ),
    knot: localPeriods(
      ha.knot,
      hb.knot,
      S.clockFrom,
      S.clockSpan,
      S.maxPeriod,
    ),
  }
  // the no-knot clock's period, read at the column farthest from the origin (the experiment gates that every column
  // of the no-knot run shares it)
  const p0 =
    period.none[
      columnIndex(S.side, [S.side / 2, S.side / 2, S.side / 2])
    ]!
  const phaseOf = (c: 'surface' | 'knot'): Int32Array =>
    phaseShifts(
      ha[c],
      hb[c],
      ha.none,
      hb.none,
      period[c],
      p0,
      S.clockFrom,
      S.clockSpan,
    )
  const phaseRead = {
    surface: phaseOf('surface'),
    knot: phaseOf('knot'),
  }

  // THE SIGNAL, in both backgrounds
  const arrival: Record<Background, Record<Config, number[]>> = {
    vacuum: { none: [], surface: [], knot: [] },
    gas: { none: [], surface: [], knot: [] },
  }

  for (const background of ['vacuum', 'gas'] as const) {
    const base = startsOf(background === 'gas' ? S.gasPerDock : 0)
    const detectors = S.impacts.map(b =>
      docksOfColumn(box, columnIndex(S.side, [S.reach, b, 0])),
    )
    // the base runs' detector states per beat: [config][impact][beat - 1]
    const kept: Record<Config, Int8Array[][]> = {
      none: detectors.map(() => []),
      surface: detectors.map(() => []),
      knot: detectors.map(() => []),
    }

    lockstep(base, S.signalBeats, (_, states) => {
      for (const c of CONFIGS) {
        detectors.forEach((docks, i) =>
          kept[c][i]!.push(columnState(states[c], docks)),
        )
      }
    })

    S.impacts.forEach((b, i) => {
      const source = [-S.reach, b, 0]
      const twins = {
        none: twinStart(box, base.none, source),
        surface: twinStart(box, base.surface, source),
        knot: twinStart(box, base.knot, source),
      }
      const first: Record<Config, number> = {
        none: S.signalBeats + 1,
        surface: S.signalBeats + 1,
        knot: S.signalBeats + 1,
      }

      lockstep(twins, S.signalBeats, (t, states) => {
        for (const c of CONFIGS) {
          if (first[c] <= S.signalBeats) {
            continue
          }

          if (
            !sameArray(
              columnState(states[c], detectors[i]!),
              kept[c][i]![t - 1]!,
            )
          ) {
            first[c] = t
          }
        }
      })

      for (const c of CONFIGS) {
        arrival[background][c].push(first[c])
      }
    })
  }

  return {
    name: member.name,
    period,
    phase: phaseRead,
    arrival,
    exact,
    knotHeld,
    contentBlind,
    blindBeats,
    seconds: (Date.now() - started) / 1000,
  }
}

let cached: TimeMember[] | undefined

// the survey over the start family (Weyl phase of the gas = the member's index), memoized for the fixed settings
export function knotTimeSurvey(
  log?: (what: string) => void,
  settings: TimeSettings = TIME,
): TimeMember[] {
  if (settings === TIME && cached) {
    return cached
  }

  const members = startFamily(settings.offsets).map((member, k) => {
    const m = timeMember(member, k, settings)

    log?.(`${m.name} ${m.seconds.toFixed(0)}s`)

    return m
  })

  if (settings === TIME) {
    cached = members
  }

  return members
}

// the shell of every column (rounded min-image distance to the knot's center at the origin), for a side: the same
// binning as held-knot's shellOf, without building a box
export function shellsOf(side: number): Int32Array {
  return Int32Array.from({ length: side ** 3 }, (_, c) =>
    Math.round(
      Math.sqrt(
        columnPosition(c, side).reduce(
          (acc, x) => acc + ring(x, side) ** 2,
          0,
        ),
      ),
    ),
  )
}

// the total beats one member runs (for the record)
export const beatsPerMember = (S: TimeSettings): number =>
  CONFIGS.length *
  (S.clockBeats + 2 * S.signalBeats * (1 + S.impacts.length))
