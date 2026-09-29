// THE ORIGIN-GATED LINE MIXER (E-SPN-0123). note/research/vibe/roadmap/remaining-pieces.md, "Six angles on 3d motion",
// angle 4. E-SPN-0121's string-gated mixer keeps the vacuum but cascades: where matter blocks the vacuum's pairs the
// stream leaves vacuum vibes unpaired, and its gate (one single, a lone frame, string on the frame's links) cannot tell
// those from matter. The change here adds ONE STORED FACT to the rule: every vibe carries a trit ORIGIN, and the mixer
// turns only a matter-born single.
//
// THE REGISTER. Per slot, a trit o in {0, 1, 2}: 0 on an empty slot, 1 vacuum-born, 2 matter-born (0 exactly where the
// slot's vibe is 0, so on an occupied slot it is one bit). Per stored pair, the two vibes' origins as one word 3 o_i + o_j
// (o_i the line's first slot, o_j its second), 0 when the store is empty, 4 .. 8 otherwise: the same shape as the pair
// word 9 s + q that already keeps both points. So the cost is one trit per vibe wherever the vibe sits, 24 slot trits
// and 12 store words of two trits per dock, 48 trits a dock.
//
// HOW EACH PIECE CARRIES IT (every piece of the rule moves whole vibes, so the origin rides with the vibe):
//   the coin      hands a vibe across its line: the origin goes with it.
//   the meeting   exchanges the POINTS of two like vibes on a line and keeps every slot's vibe and open bit: the origin
//                 is a fact of the vibe, like its open bit, and stays on its slot.
//   the pair move unmakes a love and a fear on a line into a store: the store's origin word keeps both origins, in slot
//                 order; it makes a pair from a store and gives each slot its stored origin back. A pair made from a
//                 vacuum store is vacuum-born on both slots, a pair made from a store that matter unmade gets matter's
//                 origin back. Nothing is born with an origin it did not carry in.
//   the bounce K  permutes a dock's whole occupation: the origins are permuted with the same permutation.
//   the stream    takes each vibe one dock along: the origin goes with it; stores stay on their dock, and so do their
//                 origin words.
//   the mixer     hands the single to another slot of its frame: the origin goes with it.
// So each piece is its old permutation of vibes, extended to act on (vibe, point, open, origin) as a whole. No piece's
// decision reads the origin except the mixer's gate, so on the old fields the rule is the old rule wherever the gate
// agrees with E-SPN-0121's.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, frame). NOTHING MOVES: every piece hands
// a vibe, its point, its open bit and its origin to a slot, and the stream takes it one dock along.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  keyedCoin,
  keyedMeet,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  recruitedAt,
  singlesAt,
  type KEvent,
} from '@/code/measure/hub-star'
import { writeFluxAfterStream } from '@/code/measure/two-hub-bound'
import {
  frameLinks,
  gatedFrame,
  newMixTally,
  type MixTally,
} from '@/code/measure/string-gated-mixer'

export const EMPTY = 0
export const VACUUM_BORN = 1
export const MATTER_BORN = 2

const SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const PERM = new Int32Array(24)
const SO = new Uint8Array(24)

// the origin register: a trit per slot, a word of two trits per stored pair
export type Origins = { slot: Uint8Array; store: Uint8Array }

export const cloneOrigins = (o: Origins): Origins => ({
  slot: Uint8Array.from(o.slot),
  store: Uint8Array.from(o.store),
})

// every vibe and stored pair of `base` vacuum-born, and the listed slots of `start` matter-born
export function originsOf(
  start: Configuration,
  matter: readonly number[],
): Origins {
  const o: Origins = {
    slot: new Uint8Array(start.vibe.length),
    store: new Uint8Array(start.store.length),
  }

  for (let i = 0; i < start.vibe.length; i++) {
    if (start.vibe[i] !== 0) {
      o.slot[i] = VACUUM_BORN
    }
  }

  for (let s = 0; s < start.store.length; s++) {
    if (start.store[s] !== 0) {
      o.store[s] = 3 * VACUUM_BORN + VACUUM_BORN
    }
  }

  for (const i of matter) {
    if (start.vibe[i] === 0) {
      throw new Error(
        'origin-gated-mixer: a matter-born slot holds no vibe',
      )
    }

    o.slot[i] = MATTER_BORN
  }

  return o
}

// ---- the pieces, each the rule's own piece with the origin carried ----

// the coin: the rule's keyedCoin, with the origin handed across wherever it hands a vibe. Each line's decision reads
// only that line's two slots, which no other line touches, so it is read before the rule's piece runs.
function originCoin(
  tables: LockedTables,
  c: Configuration,
  o: Origins,
  key: PathKey,
  threshold: number,
  t: number,
): void {
  const moves: number[] = []

  for (let x = 0; x < tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + SECONDS[l]!
      const hi = c.vibe[i] !== 0

      if (hi === (c.vibe[j] !== 0)) {
        continue
      }

      const from = hi ? i : j

      if (!c.open[from] || !(key.line(t, x, l) < threshold)) {
        continue
      }

      moves.push(from, hi ? j : i)
    }
  }

  keyedCoin(tables, c, key, threshold, t)

  for (let k = 0; k < moves.length; k += 2) {
    o.slot[moves[k + 1]!] = o.slot[moves[k]!]!
    o.slot[moves[k]!] = EMPTY
  }
}

// the pair move at one dock (veto 'none'): the rule's pairPiece, with the origins stored and given back
function originPair(c: Configuration, o: Origins, x: number): void {
  const events: [number, number, number, number][] = []

  for (let l = 0; l < 12; l++) {
    const i = x * 24 + LINE_FIRSTS[l]!
    const j = x * 24 + SECONDS[l]!
    const a = c.vibe[i]!
    const tau = c.store[x * 12 + l]!

    if (tau === 0 && a !== 0 && c.vibe[j] === -a) {
      events.push([0, i, j, x * 12 + l])
    } else if (tau !== 0 && a === 0 && c.vibe[j] === 0) {
      events.push([1, i, j, x * 12 + l])
    }
  }

  pairPiece('none', c, x)

  for (const [make, i, j, s] of events) {
    if (make) {
      const w = o.store[s]!

      o.slot[i] = Math.floor(w / 3)
      o.slot[j] = w % 3
      o.store[s] = 0
    } else {
      o.store[s] = 3 * o.slot[i]! + o.slot[j]!
      o.slot[i] = EMPTY
      o.slot[j] = EMPTY
    }
  }
}

// the bounce K at one dock: the rule's coinPiece, with the origins permuted alike; returns the permutation's firing
function originBounce(
  tables: LockedTables,
  c: Configuration,
  o: Origins,
  x: number,
): boolean {
  const base = x * 24

  if (
    bouncePermutation(
      BOUNCE_TABLE,
      tables.collision,
      c.vibe,
      base,
      PERM,
    ) === 0
  ) {
    return false
  }

  coinPiece(tables, c, x)

  for (let d = 0; d < 24; d++) {
    SO[PERM[d]!] = o.slot[base + d]!
  }

  for (let d = 0; d < 24; d++) {
    o.slot[base + d] = SO[d]!
  }

  return true
}

// the stream: the rule's streamInto, the origins taken along
function originStream(
  tables: LockedTables,
  a: Configuration,
  b: Configuration,
  oa: Origins,
  ob: Origins,
): void {
  streamInto(tables, a, b)
  ob.slot.fill(0)

  for (let i = 0; i < a.vibe.length; i++) {
    if (a.vibe[i] !== 0) {
      ob.slot[tables.target[i]!] = oa.slot[i]!
    }
  }

  ob.store.set(oa.store)
}

// one beat of the working knit (hub-star's starBeat: coin, meeting, collision with veto 'none', stream) with the origin
// carried, every firing of K recorded before it acts (as starBeat records it)
export function originBeat(
  tables: LockedTables,
  a: Configuration,
  b: Configuration,
  oa: Origins,
  ob: Origins,
  key: PathKey,
  threshold: number,
  t: number,
  events: KEvent[],
): void {
  originCoin(tables, a, oa, key, threshold, t)
  keyedMeet(tables, a, key, threshold, t)

  const order = collisionOrder('alternate', t)

  for (let x = 0; x < tables.cells; x++) {
    for (const piece of order) {
      if (piece === 'P') {
        originPair(a, oa, x)
        continue
      }

      const singles = singlesAt(a, x)

      if (
        singles >= 2 &&
        bouncePermutation(
          BOUNCE_TABLE,
          tables.collision,
          a.vibe,
          x * 24,
          PERM,
        ) !== 0
      ) {
        events.push({
          beat: t,
          dock: x,
          singles,
          recruited: recruitedAt(a.vibe, x * 24, PERM),
        })
      }

      originBounce(tables, a, oa, x)
    }
  }

  originStream(tables, a, b, oa, ob)
}

// ---- the mixer ----

// 'origin' turns only a matter-born single (this experiment's rule); 'none' drops the origin clause, which is E-SPN-0121's
// string-gated mixer exactly (the control)
export type OriginGate = 'origin' | 'none'

// E-SPN-0121's keyed piece (gatedMix) with the origin clause added and the origin handed with the vibe. The clause reads
// the single's origin, which the piece moves with it, so the gate stays a function the piece keeps.
export function originMix(
  tables: LockedTables,
  c: Configuration,
  o: Origins,
  flux: Int8Array,
  vacuumFlux: Int8Array,
  key: PathKey,
  t: number,
  n: number,
  gate: OriginGate,
  tally: MixTally & { vacuumBornRefused: number },
): void {
  if (n <= 0) {
    return
  }

  if (n > 9) {
    throw new Error(
      'origin-gated-mixer: a move rate above 63/64 has no keep bin',
    )
  }

  const keep = 64 - 7 * n

  for (let x = 0; x < tables.cells; x++) {
    const { f, q } = gatedFrame(c, x)

    if (f < 0) {
      continue
    }

    if (
      !frameLinks(tables, x, f).some(k => flux[k] !== vacuumFlux[k])
    ) {
      tally.ungatedLone++
      continue
    }

    const ss = FRAME_SLOTS[f]!
    const from = x * 24 + ss[q]!

    if (gate === 'origin' && o.slot[from] !== MATTER_BORN) {
      tally.vacuumBornRefused++
      continue
    }

    tally.gated++

    const b = Math.floor(key.frame(t, x, f) / 1024)

    if (b < keep) {
      continue
    }

    const to = x * 24 + ss[q ^ (Math.floor((b - keep) / n) + 1)]!

    c.vibe[to] = c.vibe[from]!
    c.point[to] = c.point[from]!
    c.open[to] = c.open[from]!
    o.slot[to] = o.slot[from]!
    c.vibe[from] = 0
    c.point[from] = 0
    c.open[from] = 0
    o.slot[from] = EMPTY
    tally.moved++
  }
}

// ---- the register's own invariants ----

// slots and stores where the origin register disagrees with occupation (an origin on an empty slot, or none on a vibe):
// must be 0 on every beat
export function originMismatch(c: Configuration, o: Origins): number {
  let n = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if ((c.vibe[i] !== 0) !== (o.slot[i] !== EMPTY)) {
      n++
    }
  }

  for (let s = 0; s < c.store.length; s++) {
    const w = o.store[s]!

    if (
      (c.store[s] !== 0) !== (w !== 0) ||
      (w !== 0 && (Math.floor(w / 3) === EMPTY || w % 3 === EMPTY))
    ) {
      n++
    }
  }

  return n
}

// matter-born vibes, on slots and in stores (two per store word per matter-born half)
export function matterBorn(o: Origins): number {
  let n = 0

  for (let i = 0; i < o.slot.length; i++) {
    if (o.slot[i] === MATTER_BORN) {
      n++
    }
  }

  for (let s = 0; s < o.store.length; s++) {
    const w = o.store[s]!

    if (w === 0) {
      continue
    }

    if (Math.floor(w / 3) === MATTER_BORN) {
      n++
    }

    if (w % 3 === MATTER_BORN) {
      n++
    }
  }

  return n
}

// singles on dock x split by the single vibe's origin
export function singlesByOrigin(
  c: Configuration,
  o: Origins,
  x: number,
): { matter: number; vacuum: number } {
  let matter = 0
  let vacuum = 0

  for (let l = 0; l < 12; l++) {
    const i = x * 24 + LINE_FIRSTS[l]!
    const j = x * 24 + SECONDS[l]!
    const hi = c.vibe[i] !== 0

    if (hi === (c.vibe[j] !== 0)) {
      continue
    }

    if (o.slot[hi ? i : j] === MATTER_BORN) {
      matter++
    } else {
      vacuum++
    }
  }

  return { matter, vacuum }
}

// ---- the track: the joint run and the vacuum run in lockstep, the mixer first in each beat ----

export type OriginTrack = {
  // per beat (index t is after beat t + 1): readings differing from the vacuum (vibes, points, open bits, stores; the
  // origin register is not counted, so a wake is comparable with E-SPN-0121's), docks holding one, docks K has fired on so
  // far, singles split by origin, gated docks and moves that beat
  wake: number[]
  footprint: number[]
  kDocks: number[]
  matterSingles: number[]
  vacuumSingles: number[]
  gated: number[]
  moved: number[]
  refused: number[]
  events: KEvent[]
  // the vacuum run: single lines summed over beats, docks the piece gated there, and origin slots not vacuum-born
  vacuumRunSingles: number
  vacuumGated: number
  vacuumMatter: number
  // the register's invariants summed over beats: mismatches with occupation, and matter-born count off its start
  mismatch: number
  matterDrift: number
  matterStart: number
  // slots and stores where the piece applied twice differs from before it (vibes, points, open bits and origins)
  reversalDiffer: number
  last: Configuration
  lastOrigins: Origins
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

export function originTrack(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  matter: readonly number[]
  key: PathKey
  threshold: number
  beats: number
  n: number
  gate: OriginGate
}): OriginTrack {
  const {
    tables,
    vacuum,
    start,
    matter,
    key,
    threshold,
    beats,
    n,
    gate,
  } = input

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(vacuum)
  let q = cloneConfiguration(vacuum)
  let oa = originsOf(start, matter)
  let ob = cloneOrigins(oa)
  let op = originsOf(vacuum, [])
  let oq = cloneOrigins(op)

  const events: KEvent[] = []
  const vacuumEvents: KEvent[] = []
  const fired = new Uint8Array(tables.cells)
  const flux = new Int8Array(tables.cells * 12)
  const vacuumFlux = new Int8Array(tables.cells * 12)
  const tally = { ...newMixTally(), vacuumBornRefused: 0 }
  const vacuumTally = { ...newMixTally(), vacuumBornRefused: 0 }
  const matterStart = matterBorn(oa)

  let firedCount = 0
  let seen = 0

  const out: OriginTrack = {
    wake: [],
    footprint: [],
    kDocks: [],
    matterSingles: [],
    vacuumSingles: [],
    gated: [],
    moved: [],
    refused: [],
    events,
    vacuumRunSingles: 0,
    vacuumGated: 0,
    vacuumMatter: 0,
    mismatch: 0,
    matterDrift: 0,
    matterStart,
    reversalDiffer: 0,
    last: a,
    lastOrigins: oa,
    vacuumLast: p,
  }

  for (let t = 0; t < beats; t++) {
    const g0 = tally.gated
    const m0 = tally.moved
    const r0 = tally.vacuumBornRefused

    // THE REVERSAL: on a keyed path the piece at beat t is an involution, origins included
    const twice = cloneConfiguration(a)
    const otwice = cloneOrigins(oa)
    const scratch = { ...newMixTally(), vacuumBornRefused: 0 }

    originMix(
      tables,
      twice,
      otwice,
      flux,
      vacuumFlux,
      key,
      t,
      n,
      gate,
      scratch,
    )

    originMix(
      tables,
      twice,
      otwice,
      flux,
      vacuumFlux,
      key,
      t,
      n,
      gate,
      scratch,
    )

    for (let i = 0; i < a.vibe.length; i++) {
      if (!sameSlot(a, twice, i) || oa.slot[i] !== otwice.slot[i]) {
        out.reversalDiffer++
      }
    }

    originMix(tables, a, oa, flux, vacuumFlux, key, t, n, gate, tally)
    // the vacuum run carries the same piece on its own register, the string clause read against itself (never true),
    // so a vacuum dock is refused on the string clause or, before it, on condition Z
    originMix(
      tables,
      p,
      op,
      vacuumFlux,
      vacuumFlux,
      key,
      t,
      n,
      gate,
      vacuumTally,
    )
    originBeat(tables, a, b, oa, ob, key, threshold, t, events)
    originBeat(tables, p, q, op, oq, key, threshold, t, vacuumEvents)
    ;[a, b] = [b, a]
    ;[p, q] = [q, p]
    ;[oa, ob] = [ob, oa]
    ;[op, oq] = [oq, op]
    writeFluxAfterStream(tables, a, flux)
    writeFluxAfterStream(tables, p, vacuumFlux)
    out.mismatch += originMismatch(a, oa) + originMismatch(p, op)
    out.matterDrift += Math.abs(matterBorn(oa) - matterStart)
    out.vacuumMatter += matterBorn(op)

    for (; seen < events.length; seen++) {
      const d = events[seen]!.dock

      if (!fired[d]) {
        fired[d] = 1
        firedCount++
      }
    }

    let wake = 0
    let docks = 0
    let ms = 0
    let vs = 0

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

      out.vacuumRunSingles += singlesAt(p, x)

      const s = singlesByOrigin(a, oa, x)

      ms += s.matter
      vs += s.vacuum

      if (here === 0) {
        continue
      }

      wake += here
      docks++
    }

    out.wake.push(wake)
    out.footprint.push(docks)
    out.kDocks.push(firedCount)
    out.matterSingles.push(ms)
    out.vacuumSingles.push(vs)
    out.gated.push(tally.gated - g0)
    out.moved.push(tally.moved - m0)
    out.refused.push(tally.vacuumBornRefused - r0)
  }

  // every vacuum dock where the gate's first clauses (one single, a lone frame) hold: 0 by condition Z
  out.vacuumGated =
    vacuumTally.gated +
    vacuumTally.ungatedLone +
    vacuumTally.vacuumBornRefused
  out.last = a
  out.lastOrigins = oa
  out.vacuumLast = p

  return out
}
