// THE STRING-GATED LINE MIXER (E-SPN-0121). note/research/vibe/roadmap/remaining-pieces.md, "Two hubs bound by the
// string" (E-SPN-0120): free 3d motion of bound matter needs a change to the rule itself, and the first candidate
// named there is a line mixer that acts only on non-vacuum states and still cannot cascade.
//
// THE PIECE. On a dock that holds exactly ONE single (a dock line with one vibe), whose frame (the four mutually
// orthogonal lines of code/rule/coined-locked-knit that hold it) holds that one vibe and nothing else, open, and where
// the drift cost's register on the frame's eight links at the dock differs from the vacuum's (the single drags
// string), apply
//     M_n = I + (e^(i theta) - 1) J / 8,   2 - 2 cos theta = n,
// on the frame's eight slots, J the all-ones matrix. M_n = Pi_+ + e^(i theta) Pi_-, with Pi_+- = (I +- G)/2 and
// G = I - J/4 the frame mixer of E-SPN-0094 (the one W(F4)-covariant line mixer in the rule's ring). n = 0 is the
// identity, n = 1 is theta = pi/3, n = 3 is theta = 2 pi/3 (the coin's own w: M = (1 + w)/2 I + (1 - w)/2 G, entries in
// Z[w][1/2]), n = 4 is theta = pi (G itself). The single keeps with |1 + (e^(i theta) - 1)/8|^2 = 1 - 7 n/64 and takes
// each of the other seven frame slots with n/64, so on a keyed path it is code/measure/full-key-paths keyedMix at move
// rate 7 n / 64, restricted by the gate.
//
// WHY THE GATE IS INVARIANT. M_n moves one vibe among the eight slots of one frame of one dock. After it the frame still
// holds exactly one vibe (on a line that was empty, so that line now holds one and the old line none), so the dock
// still holds exactly one single, the frame is still lone, and no link register is touched. So the gate is a function
// the piece leaves unchanged: the piece is sum_g |g><g| (x) U_g, a controlled unitary, and its inverse is the same
// control with M_n^+ = I + (e^(-i theta) - 1) J / 8. Reading "the single's own link" alone would NOT be invariant (the
// single's line changes), which is why the gate reads the frame's eight links, a set that contains the single's own two
// and that the piece keeps.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, frame). NOTHING MOVES: the piece hands
// a vibe's value, point and open bit to another slot of its own frame on its own dock; the stream takes it one dock
// along.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  FRAME_LINES,
  FRAME_SLOTS,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  keyedCoin,
  keyedMeet,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  singlesAt,
  starBeat,
  type KEvent,
} from '@/code/measure/hub-star'
import {
  cartesianOffset,
  unequalLikeMeetings,
  writeFluxAfterStream,
} from '@/code/measure/two-hub-bound'

// the eight links of frame f's lines at dock x: (x, l) joins x to the dock its line's first slot streams into, and
// (y, l) joins the dock y whose first slot streams into x, to x
export function frameLinks(
  tables: LockedTables,
  x: number,
  f: number,
): number[] {
  const out: number[] = []

  for (const l of FRAME_LINES[f]!) {
    const first = LINE_FIRSTS[l]!

    out.push(x * 12 + l)
    out.push(Math.floor(tables.source[x * 24 + first]! / 24) * 12 + l)
  }

  return out
}

export type MixTally = {
  gated: number
  moved: number
  ungatedLone: number
}

export const newMixTally = (): MixTally => ({
  gated: 0,
  moved: 0,
  ungatedLone: 0,
})

// the dock's lone frame holding its one single, or -1: the frame index and the frame slot q
export function gatedFrame(
  c: Configuration,
  x: number,
): { f: number; q: number } {
  if (singlesAt(c, x) !== 1) {
    return { f: -1, q: -1 }
  }

  for (let f = 0; f < 3; f++) {
    const ss = FRAME_SLOTS[f]!

    let held = 0
    let at = -1

    for (let q = 0; q < 8; q++) {
      if (c.vibe[x * 24 + ss[q]!] !== 0) {
        held++
        at = q
      }
    }

    if (held !== 1) {
      continue
    }

    // a lone frame's vibe is alone on its line (both slots of a line lie in its frame), so it is the dock's one single
    if (!c.open[x * 24 + ss[at]!]) {
      return { f: -1, q: -1 }
    }

    return { f, q: at }
  }

  return { f: -1, q: -1 }
}

// THE KEYED PIECE: on every gated dock, keep (bins 0 .. 63 - 7 n) or hand the single to frame slot q XOR o (n bins for
// each o = 1 .. 7), bins read from the key's frame slot; `stringless` drops the string clause (a control)
export function gatedMix(
  tables: LockedTables,
  c: Configuration,
  flux: Int8Array,
  vacuumFlux: Int8Array,
  key: PathKey,
  t: number,
  n: number,
  tally: MixTally,
  stringless = false,
): void {
  if (n <= 0) {
    return
  }

  if (n > 9) {
    throw new Error(
      'string-gated-mixer: a move rate above 63/64 has no keep bin',
    )
  }

  const keep = 64 - 7 * n

  for (let x = 0; x < tables.cells; x++) {
    const { f, q } = gatedFrame(c, x)

    if (f < 0) {
      continue
    }

    if (
      !stringless &&
      !frameLinks(tables, x, f).some(k => flux[k] !== vacuumFlux[k])
    ) {
      tally.ungatedLone++
      continue
    }

    tally.gated++

    const b = Math.floor(key.frame(t, x, f) / 1024)

    if (b < keep) {
      continue
    }

    const o = Math.floor((b - keep) / n) + 1
    const ss = FRAME_SLOTS[f]!
    const from = x * 24 + ss[q]!
    const to = x * 24 + ss[q ^ o]!

    c.vibe[to] = c.vibe[from]!
    c.point[to] = c.point[from]!
    c.open[to] = c.open[from]!
    c.vibe[from] = 0
    c.point[from] = 0
    c.open[from] = 0
    tally.moved++
  }
}

// ---- the track: the joint run and the vacuum run in lockstep, the mixer first in each beat ----

export type MixTrack = {
  // per beat (index t is after beat t + 1): readings differing from the vacuum, docks holding one, docks K has fired on
  // so far, single lines in the joint run, gated docks and mixer moves that beat, the wake centroid from `hub`
  wake: number[]
  footprint: number[]
  kDocks: number[]
  singles: number[]
  gated: number[]
  moved: number[]
  centroid: number[][]
  events: KEvent[]
  // the vacuum run: its single lines and K firings summed over beats, and the mixer's gated docks there (0 by Z)
  vacuumSingles: number
  vacuumEvents: number
  vacuumGated: number
  vacuumSplits: number
  // lone frames refused by the string clause alone, summed
  ungatedLone: number
  // slots where the piece applied twice differs from the configuration before it, summed over beats (must be 0)
  reversalDiffer: number
  last: Configuration
  vacuumLast: Configuration
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

export function mixTrack(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  hub: number
  key: PathKey
  threshold: number
  beats: number
  side: number
  n: number
  stringless?: boolean
}): MixTrack {
  const {
    tables,
    vacuum,
    start,
    hub,
    key,
    threshold,
    beats,
    side,
    n,
    stringless = false,
  } = input
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
  const tally = newMixTally()
  const vacuumTally = newMixTally()

  let firedCount = 0
  let seen = 0

  const out: MixTrack = {
    wake: [],
    footprint: [],
    kDocks: [],
    singles: [],
    gated: [],
    moved: [],
    centroid: [],
    events,
    vacuumSingles: 0,
    vacuumEvents: 0,
    vacuumGated: 0,
    vacuumSplits: 0,
    ungatedLone: 0,
    reversalDiffer: 0,
    last: a,
    vacuumLast: p,
  }

  for (let t = 0; t < beats; t++) {
    const g0 = tally.gated
    const m0 = tally.moved

    // THE REVERSAL: on a keyed path the piece at beat t is an involution (the gate is kept and q -> q XOR o twice is q),
    // so applying it twice to a copy must give the configuration back, bit for bit
    const twice = cloneConfiguration(a)
    const scratch = newMixTally()

    gatedMix(
      tables,
      twice,
      flux,
      vacuumFlux,
      key,
      t,
      n,
      scratch,
      stringless,
    )

    gatedMix(
      tables,
      twice,
      flux,
      vacuumFlux,
      key,
      t,
      n,
      scratch,
      stringless,
    )

    for (let i = 0; i < a.vibe.length; i++) {
      if (!sameSlot(a, twice, i)) {
        out.reversalDiffer++
      }
    }

    gatedMix(tables, a, flux, vacuumFlux, key, t, n, tally, stringless)
    // the vacuum run carries the same piece on its own register, with the string clause dropped: condition Z alone
    gatedMix(
      tables,
      p,
      vacuumFlux,
      vacuumFlux,
      key,
      t,
      n,
      vacuumTally,
      true,
    )
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

    for (; seen < events.length; seen++) {
      const d = events[seen]!.dock

      if (!fired[d]) {
        fired[d] = 1
        firedCount++
      }
    }

    let wake = 0
    let docks = 0
    let singles = 0

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
      singles += singlesAt(a, x)

      if (here === 0) {
        continue
      }

      wake += here
      docks++
      offsets[x]!.forEach((v, k) => (sum[k]! += here * v))
    }

    out.wake.push(wake)
    out.footprint.push(docks)
    out.kDocks.push(firedCount)
    out.singles.push(singles)
    out.gated.push(tally.gated - g0)
    out.moved.push(tally.moved - m0)
    out.centroid.push(sum.map(v => (wake === 0 ? 0 : v / wake)))
  }

  out.vacuumEvents = vacuumEvents.length
  out.vacuumGated = vacuumTally.gated
  out.ungatedLone = tally.ungatedLone
  out.last = a
  out.vacuumLast = p

  return out
}

// ---- where singles are made: every piece of the beat, the single lines it changes dock by dock ----

export type PieceCensus = {
  mix: number
  coin: number
  meet: number
  pair: number
  bounce: number
  stream: number
  streamNet: number
}

const countSingles = (cells: number, c: Configuration): number => {
  let s = 0

  for (let x = 0; x < cells; x++) {
    s += singlesAt(c, x)
  }

  return s
}

// the joint run with the mixer, beat by beat: for each piece the sum over docks of |singles after - singles before|
// (the stream moves vibes between docks, so it is read as the change of the total, and its net sum)
export function pieceCensus(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  key: PathKey
  threshold: number
  beats: number
  n: number
}): PieceCensus {
  const { tables, vacuum, start, key, threshold, beats, n } = input

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(vacuum)
  let q = cloneConfiguration(vacuum)

  const flux = new Int8Array(tables.cells * 12)
  const vacuumFlux = new Int8Array(tables.cells * 12)
  const out: PieceCensus = {
    mix: 0,
    coin: 0,
    meet: 0,
    pair: 0,
    bounce: 0,
    stream: 0,
    streamNet: 0,
  }

  const per = (fn: () => void): number => {
    const before = Array.from({ length: tables.cells }, (_, x) =>
      singlesAt(a, x),
    )

    fn()

    return before.reduce(
      (s, v, x) => s + Math.abs(singlesAt(a, x) - v),
      0,
    )
  }

  const tally = newMixTally()
  const events: KEvent[] = []

  for (let t = 0; t < beats; t++) {
    out.mix += per(() =>
      gatedMix(tables, a, flux, vacuumFlux, key, t, n, tally),
    )
    out.coin += per(() => keyedCoin(tables, a, key, threshold, t))
    out.meet += per(() => keyedMeet(tables, a, key, threshold, t))

    for (const piece of collisionOrder('alternate', t)) {
      if (piece === 'P') {
        out.pair += per(() => {
          for (let x = 0; x < tables.cells; x++) {
            pairPiece('none', a, x)
          }
        })
      } else {
        out.bounce += per(() => {
          for (let x = 0; x < tables.cells; x++) {
            coinPiece(tables, a, x)
          }
        })
      }
    }

    const s0 = countSingles(tables.cells, a)

    streamInto(tables, a, b)
    ;[a, b] = [b, a]

    const s1 = countSingles(tables.cells, a)

    out.stream += Math.abs(s1 - s0)
    out.streamNet += s1 - s0
    writeFluxAfterStream(tables, a, flux)
    starBeat(tables, p, q, key, threshold, t, events)
    ;[p, q] = [q, p]
    writeFluxAfterStream(tables, p, vacuumFlux)
  }

  return out
}
