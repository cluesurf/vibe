// THE ORIGIN-GATED BOUNCE (E-SPN-0128). note/research/vibe/roadmap/remaining-pieces.md, "Angle 4, the origin trit".
// E-SPN-0123 (code/measure/origin-gated-mixer) put a trit ORIGIN on every vibe (vacuum-born or matter-born) and let the
// line mixer turn only a matter-born single. The mixer's own cascade stopped, but K still fired between vacuum-born
// singles where two disturbed stars crossed. The change here gates K on origin too.
//
// THE COLLISION, on one dock, contact 'pass'. Let m be the dock's single lines whose vibe is matter-born.
//   K (the isometric map w_P on the whole dock)   where the dock holds two or more singles AND m >= 2,
//   B (the line-keeping bounce, 'pass' form)       on every other dock:
//        -1 on a full line of a love and a fear, +1 on a full line of two like vibes, and on the other lines w_P when
//        w_P carries the full lines onto themselves, the identity otherwise (code/rule/bounce-pair-knit).
// On a dock of at most one single this is the working rule's collision exactly ('pass' uses B there already). The one
// change: a dock of two or more singles with fewer than two matter-born among them bounces with B instead of K.
// Gate 'none' drops the origin clause and is E-SPN-0123's collision, bit for bit.
//
// WHY THE PIECE KEEPS ITS GATE. K and B each permute the dock's slots, carrying lines to lines (w permutes lines, -1
// and +1 keep a line), so a single line goes to a single line and a full line to a full line; the origin rides with
// the vibe; w_P fixes P, so P and the full set F are the same after as before. So the number of singles and the number
// of matter-born singles are the same after, the gate picks the same map, and the map is an involution (w^2 = 1,
// (-1)^2 = 1). `gatedCollide` re-reads the gate after every firing and counts any disagreement.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line, frame). NOTHING MOVES: every piece
// hands a vibe, its point, its open bit and its origin to a slot, and the stream takes it one dock along.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import {
  keyedCoin,
  keyedMeet,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  recruitedAt,
  singlesAt,
  type KEvent,
} from '@/code/measure/hub-star'
import { writeFluxAfterStream } from '@/code/measure/two-hub-bound'
import { newMixTally } from '@/code/measure/string-gated-mixer'
import { storeLine } from '@/code/measure/planon-lines'
import {
  cloneOrigins,
  EMPTY,
  MATTER_BORN,
  matterBorn,
  originMismatch,
  originMix,
  originsOf,
  singlesByOrigin,
  type OriginGate,
  type Origins,
} from '@/code/measure/origin-gated-mixer'

const SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const PERM = new Int32Array(24)
const AGAIN = new Int32Array(24)
const SV = new Int8Array(24)
const SP = new Int8Array(24)
const SOPEN = new Uint8Array(24)
const SO = new Uint8Array(24)

// 'matter': K only where two or more matter-born singles share the dock (this experiment); 'none': K on every dock of
// two or more singles (E-SPN-0123's collision, the control)
export type KGate = 'matter' | 'none'

// what the collision did, summed: K firings, B firings on docks of two or more singles (the docks the gate took from
// K), and on those, singles B kept on their own line, moved to another single line of the dock (a swap), or moved onto
// a line that held no single (a line left); `off` counts docks where the re-read gate or map disagreed after firing
export type CollideTally = {
  k: number
  bMulti: number
  bKept: number
  bSwapped: number
  bLeft: number
  refusedK: number
  off: number
}

export const newCollideTally = (): CollideTally => ({
  k: 0,
  bMulti: 0,
  bKept: 0,
  bSwapped: 0,
  bLeft: 0,
  refusedK: 0,
  off: 0,
})

// matter-born singles on dock x
function matterSingles(
  c: Configuration,
  o: Origins,
  base: number,
): number {
  let n = 0

  for (let l = 0; l < 12; l++) {
    const i = base + LINE_FIRSTS[l]!
    const j = base + SECONDS[l]!
    const hi = c.vibe[i] !== 0

    if (hi === (c.vibe[j] !== 0)) {
      continue
    }

    if (o.slot[hi ? i : j] === MATTER_BORN) {
      n++
    }
  }

  return n
}

// B in its 'pass' form on any dock, written into out: 0 the identity, else the map's case
function passBounce(
  vibe: Int8Array,
  base: number,
  out: Int32Array,
): number {
  const kind = bouncePermutation(
    BOUNCE_TABLE,
    'bounce',
    vibe,
    base,
    out,
  )

  if (kind === 0) {
    for (let d = 0; d < 24; d++) {
      out[d] = d
    }
  }

  let moved = false

  for (let d = 0; d < 24; d++) {
    const e = OPPOSITE[d]!

    if (vibe[base + d] !== 0 && vibe[base + d] === vibe[base + e]) {
      out[d] = d
    }

    if (out[d] !== d) {
      moved = true
    }
  }

  return moved ? Math.max(1, kind) : 0
}

// the dock's map under the gate: 'K', 'B' or '' (the identity), written into out
function gatedMap(
  c: Configuration,
  o: Origins,
  base: number,
  gate: KGate,
  out: Int32Array,
): { map: '' | 'K' | 'B'; singles: number; refused: boolean } {
  const singles = singlesAt(c, base / 24)

  if (singles < 2) {
    return {
      map:
        bouncePermutation(BOUNCE_TABLE, 'pass', c.vibe, base, out) === 0
          ? ''
          : 'B',
      singles,
      refused: false,
    }
  }

  const useK = gate === 'none' || matterSingles(c, o, base) >= 2

  if (useK) {
    return {
      map:
        bouncePermutation(BOUNCE_TABLE, 'pass', c.vibe, base, out) === 0
          ? ''
          : 'K',
      singles,
      refused: false,
    }
  }

  const k =
    bouncePermutation(BOUNCE_TABLE, 'pass', c.vibe, base, AGAIN) !== 0

  return {
    map: passBounce(c.vibe, base, out) === 0 ? '' : 'B',
    singles,
    refused: k,
  }
}

// the collision's bounce on dock x under the gate, origins carried; K firings recorded before K acts (as hub-star's
// starBeat records them)
export function gatedCollide(
  tables: LockedTables,
  c: Configuration,
  o: Origins,
  x: number,
  gate: KGate,
  tally: CollideTally,
  events: KEvent[],
  t: number,
): void {
  const base = x * 24
  const g = gatedMap(c, o, base, gate, PERM)

  if (g.refused) {
    tally.refusedK++
  }

  if (g.map === '') {
    return
  }

  if (g.map === 'K') {
    tally.k++
    events.push({
      beat: t,
      dock: x,
      singles: g.singles,
      recruited: recruitedAt(c.vibe, base, PERM),
    })
  } else if (g.singles >= 2) {
    tally.bMulti++

    for (let d = 0; d < 24; d++) {
      if (c.vibe[base + d] === 0 || c.vibe[base + OPPOSITE[d]!] !== 0) {
        continue
      }

      const to = PERM[d]!
      const lt = LINE_OF[to]!

      if (lt === LINE_OF[d]) {
        tally.bKept++
      } else {
        const f = LINE_FIRSTS[lt]!
        const single =
          (c.vibe[base + f] !== 0) !==
          (c.vibe[base + OPPOSITE[f]!] !== 0)

        if (single) {
          tally.bSwapped++
        } else {
          tally.bLeft++
        }
      }
    }
  }

  for (let d = 0; d < 24; d++) {
    const to = PERM[d]!

    SV[to] = c.vibe[base + d]!
    SP[to] = c.point[base + d]!
    SOPEN[to] = c.open[base + d]!
    SO[to] = o.slot[base + d]!
  }

  for (let d = 0; d < 24; d++) {
    c.vibe[base + d] = SV[d]!
    c.point[base + d] = SP[d]!
    c.open[base + d] = SOPEN[d]!
    o.slot[base + d] = SO[d]!
  }

  // the gate kept: the same map read again, and an involution
  const first = Int32Array.from(PERM)
  const again = gatedMap(c, o, base, gate, PERM)

  let off = again.map !== g.map

  for (let d = 0; d < 24 && !off; d++) {
    if (PERM[d] !== first[d] || first[first[d]!] !== d) {
      off = true
    }
  }

  if (off) {
    tally.off++
  }
}

// ---- the other pieces, each E-SPN-0123's with the origin carried (code/measure/origin-gated-mixer) ----

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

// one beat of the working knit with the gated collision: coin, meeting, collision (veto 'none'), stream
export function gatedBeat(
  tables: LockedTables,
  a: Configuration,
  b: Configuration,
  oa: Origins,
  ob: Origins,
  key: PathKey,
  threshold: number,
  t: number,
  gate: KGate,
  tally: CollideTally,
  events: KEvent[],
): void {
  originCoin(tables, a, oa, key, threshold, t)
  keyedMeet(tables, a, key, threshold, t)

  const order = collisionOrder('alternate', t)

  for (let x = 0; x < tables.cells; x++) {
    for (const piece of order) {
      if (piece === 'P') {
        originPair(a, oa, x)
      } else {
        gatedCollide(tables, a, oa, x, gate, tally, events, t)
      }
    }
  }

  originStream(tables, a, b, oa, ob)
}

// ---- the track: the joint run and the vacuum run in lockstep, the mixer first in each beat ----

export type GatedTrack = {
  // per beat (index t is after beat t + 1): readings off the vacuum run (vibes, points, open bits, stores), docks holding
  // one, docks K has fired on so far, mesh lines holding one, singles by origin, mixer moves
  wake: number[]
  footprint: number[]
  kDocks: number[]
  lines: number[]
  matterSingles: number[]
  vacuumSingles: number[]
  moved: number[]
  refused: number[]
  events: KEvent[]
  collide: CollideTally
  // readings off the vacuum run on lines outside `star` (when given), summed over beats
  offStar: number
  // the vacuum run: singles summed over beats, docks the mixer's first clauses passed there, matter-born vacuum vibes,
  // and its collision tally (condition Z: no dock of two singles, so K and the gated B never fire there)
  vacuumRunSingles: number
  vacuumGated: number
  vacuumMatter: number
  vacuumCollide: CollideTally
  mismatch: number
  matterDrift: number
  matterStart: number
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

export function gatedTrack(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  matter: readonly number[]
  key: PathKey
  threshold: number
  beats: number
  n: number
  gate: OriginGate
  kGate: KGate
  lines: MeshLines
  star?: Uint8Array
}): GatedTrack {
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
    kGate,
    lines,
    star,
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
  const collide = newCollideTally()
  const vacuumCollide = newCollideTally()
  const touched = new Uint8Array(lines.count)
  const matterStart = matterBorn(oa)

  let firedCount = 0
  let seen = 0

  const out: GatedTrack = {
    wake: [],
    footprint: [],
    kDocks: [],
    lines: [],
    matterSingles: [],
    vacuumSingles: [],
    moved: [],
    refused: [],
    events,
    collide,
    offStar: 0,
    vacuumRunSingles: 0,
    vacuumGated: 0,
    vacuumMatter: 0,
    vacuumCollide,
    mismatch: 0,
    matterDrift: 0,
    matterStart,
    reversalDiffer: 0,
    last: a,
    lastOrigins: oa,
    vacuumLast: p,
  }

  for (let t = 0; t < beats; t++) {
    const m0 = tally.moved
    const r0 = tally.vacuumBornRefused

    // the mixer applied twice gives the configuration and origins back
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

    gatedBeat(
      tables,
      a,
      b,
      oa,
      ob,
      key,
      threshold,
      t,
      kGate,
      collide,
      events,
    )

    gatedBeat(
      tables,
      p,
      q,
      op,
      oq,
      key,
      threshold,
      t,
      kGate,
      vacuumCollide,
      vacuumEvents,
    )

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

    touched.fill(0)

    let wake = 0
    let docks = 0
    let ms = 0
    let vs = 0

    for (let x = 0; x < tables.cells; x++) {
      let here = 0

      for (let d = 0; d < 24; d++) {
        const i = x * 24 + d

        if (sameSlot(a, p, i)) {
          continue
        }

        here++

        const L = lines.lineOf[i]!

        touched[L] = 1

        if (star && !star[L]) {
          out.offStar++
        }
      }

      for (let l = 0; l < 12; l++) {
        const s = x * 12 + l

        if (sameStore(a, p, s)) {
          continue
        }

        here++

        const L = storeLine(lines, s)

        touched[L] = 1

        if (star && !star[L]) {
          out.offStar++
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

    let lineCount = 0

    for (let L = 0; L < lines.count; L++) {
      lineCount += touched[L]!
    }

    out.wake.push(wake)
    out.footprint.push(docks)
    out.kDocks.push(firedCount)
    out.lines.push(lineCount)
    out.matterSingles.push(ms)
    out.vacuumSingles.push(vs)
    out.moved.push(tally.moved - m0)
    out.refused.push(tally.vacuumBornRefused - r0)
  }

  out.vacuumGated =
    vacuumTally.gated +
    vacuumTally.ungatedLone +
    vacuumTally.vacuumBornRefused
  out.last = a
  out.lastOrigins = oa
  out.vacuumLast = p

  return out
}
