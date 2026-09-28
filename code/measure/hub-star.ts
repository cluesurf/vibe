// THE STAR OF A HUB (E-SPN-0119). Readings for the theorem that a composite whose difference from the vacuum lies on
// the mesh lines through one dock X (its STAR) keeps it there at every beat of the working knit, vacuum included, so
// recruiting vacuum pairs cannot step its hub.
//
// THE THEOREM (derived in test/experiment/spin/hub-star, read here beat by beat). Let V be the vacuum's run, with no
// single line on any dock at any beat (condition Z). Let S be the twelve mesh lines through X, and suppose no dock
// other than X lies on two lines of S (true in the unbounded mesh, since two distinct lines share at most one dock; on
// a box it is read by `starCrossings`). If a start equals V's start off S then, on the contacts 'pass' and 'lone',
// veto 'none', the keyed coin and meeting, and no mixer, the run equals V off S at every beat. Every piece but the
// coin piece acts line by line. The coin piece at X permutes X's own slots, each of which lies on a line of S. At a
// dock y other than X, at most one of y's twelve lines is a line of S, so y holds at most one single (Z holds for the
// rest), K never fires there, and B acts on y's other lines as it does in the vacuum. So the star is closed, and
// a hub can never step: a new hub needs two differing lines crossing off X.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line). The rule is exact integers.
// NOTHING MOVES: every piece hands a value to a slot, and the stream takes it one dock along.

import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { keyedCoin, keyedMeet, keyedRunner, type MeshLines, type PathKey } from '@/code/measure/full-key-paths'
import { storeLine } from '@/code/measure/planon-lines'
import { d4BoxCoordinates } from '@/code/substrate/d4-box-integer'

const PERM = new Int32Array(24)

// the mesh lines of a set of docks' slots (a dock's star is its own twelve)
export function starLines(lines: MeshLines, docks: readonly number[]): Uint8Array {
  const inStar = new Uint8Array(lines.count)

  for (const x of docks) for (let d = 0; d < 24; d++) inStar[lines.lineOf[x * 24 + d] as number] = 1

  return inStar
}

// the docks outside `docks` that lie on two or more lines of the star (where K could fire off the hub)
export function starCrossings(cells: number, lines: MeshLines, inStar: Uint8Array, docks: readonly number[]): number[] {
  const own = new Set(docks)
  const out: number[] = []

  for (let y = 0; y < cells; y++) {
    if (own.has(y)) continue

    let n = 0

    for (let l = 0; l < 12; l++) if (inStar[lines.lineOf[y * 24 + (LINE_FIRSTS[l] as number)] as number]) n++
    if (n >= 2) out.push(y)
  }

  return out
}

// the singles on dock x
export function singlesAt(c: Configuration, x: number): number {
  let n = 0

  for (let l = 0; l < 12; l++) {
    const f = LINE_FIRSTS[l] as number

    if ((c.vibe[x * 24 + f] !== 0) !== (c.vibe[x * 24 + (OPPOSITE[f] as number)] !== 0)) n++
  }

  return n
}

// the full lines K carries onto another line of its dock, for the dock's occupation (0 if K does not fire)
export function recruitedAt(vibe: Int8Array, base: number, perm: Int32Array): number {
  let n = 0

  for (let l = 0; l < 12; l++) {
    const f = LINE_FIRSTS[l] as number

    if (vibe[base + f] === 0 || vibe[base + (OPPOSITE[f] as number)] === 0) continue
    if (LINE_OF[perm[f] as number] !== l) n++
  }

  return n
}

export type KEvent = { beat: number; dock: number; singles: number; recruited: number }

// one beat of the working knit (keyedRunner's pieces: coin, meeting, collision with veto 'none', stream), with every
// firing of K (a dock of two or more singles whose bounce permutation is not the identity) recorded before it acts
export function starBeat(tables: LockedTables, a: Configuration, b: Configuration, key: PathKey, threshold: number, t: number, events: KEvent[]): void {
  keyedCoin(tables, a, key, threshold, t)
  keyedMeet(tables, a, key, threshold, t)

  const order = collisionOrder('alternate', t)

  for (let x = 0; x < tables.cells; x++) {
    for (const piece of order) {
      if (piece === 'P') {
        pairPiece('none', a, x)
        continue
      }

      const singles = singlesAt(a, x)

      if (singles >= 2 && bouncePermutation(BOUNCE_TABLE, tables.collision, a.vibe, x * 24, PERM) !== 0) events.push({ beat: t, dock: x, singles, recruited: recruitedAt(a.vibe, x * 24, PERM) })
      coinPiece(tables, a, x)
    }
  }

  streamInto(tables, a, b)
}

const sameSlot = (p: Configuration, q: Configuration, i: number): boolean => p.vibe[i] === q.vibe[i] && (p.vibe[i] === 0 || (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (p: Configuration, q: Configuration, s: number): boolean => p.store[s] === q.store[s] && (p.store[s] === 0 || (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

export type StarReading = {
  // slot and store readings where the run differs from the vacuum, off and on the star, summed over beats
  offStar: number
  onStar: number
  firstOff: number
  // the readings on the star at the last beat, and the most at any beat
  onStarLast: number
  onStarPeak: number
  // every firing of K; those off the hub docks; full lines K carried onto another line
  events: KEvent[]
  offHub: number
  recruited: number
  // K firings in the vacuum run (condition Z says 0) and its single lines, summed over beats
  vacuumEvents: number
  vacuumSingles: number
  // readings where this stepper and keyedRunner differ (the stepper must be the rule's beat, bit for bit)
  stepperDiffer: number
  // the star lines holding a difference at some beat, and the largest box step of a differing slot from the hub
  linesTouched: number
  reach: number
  // the differing slots' mean box offset from the hub, per beat (its spread says the content moves along lines)
  centroidSpread: number
  // readings differing from the vacuum at each beat (on and off the star)
  wake: number[]
}

// the joint run and the vacuum run in lockstep, with keyedRunner on the start beside them as the check
export function starRun(input: { tables: LockedTables; vacuum: Configuration; start: Configuration; lines: MeshLines; hub: readonly number[]; key: PathKey; threshold: number; beats: number; side: number }): StarReading {
  const { tables, vacuum, start, lines, hub, key, threshold, beats, side } = input
  const inStar = starLines(lines, hub)
  const hubs = new Set(hub)
  const origin = d4BoxCoordinates({ cell: hub[0] as number, side })
  const offset = (x: number): number[] =>
    d4BoxCoordinates({ cell: x, side }).map((v, k) => {
      const d = (((v - (origin[k] as number)) % side) + side) % side

      return d > side / 2 ? d - side : d
    })
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(vacuum)
  let q = cloneConfiguration(vacuum)
  const check = keyedRunner(tables, start, { key, threshold })
  const events: KEvent[] = []
  const vacuumEvents: KEvent[] = []
  const touched = new Set<number>()
  const stores = tables.cells * 12
  const centroids: number[][] = []
  const wake: number[] = []
  const out = { offStar: 0, onStar: 0, firstOff: -1, onStarLast: 0, onStarPeak: 0, vacuumSingles: 0, stepperDiffer: 0, reach: 0 }

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    starBeat(tables, p, q, key, threshold, t, vacuumEvents)
    ;[a, b] = [b, a]
    ;[p, q] = [q, p]
    check.beat()

    const c = check.state()
    const offBefore = out.offStar
    let on = 0
    const sum = [0, 0, 0, 0]
    let count = 0

    for (let x = 0; x < tables.cells; x++) out.vacuumSingles += singlesAt(p, x)

    for (let i = 0; i < a.vibe.length; i++) {
      if (!sameSlot(a, c, i)) out.stepperDiffer++
      if (sameSlot(a, p, i)) continue

      const L = lines.lineOf[i] as number

      if (!inStar[L]) {
        out.offStar++
        if (out.firstOff < 0) out.firstOff = t + 1
        continue
      }

      on++
      touched.add(L)

      const o = offset(Math.floor(i / 24))

      out.reach = Math.max(out.reach, ...o.map(Math.abs))
      o.forEach((v, k) => (sum[k]! += v))
      count++
    }

    for (let s = 0; s < stores; s++) {
      if (!sameStore(a, c, s)) out.stepperDiffer++
      if (sameStore(a, p, s)) continue

      if (!inStar[storeLine(lines, s)]) {
        out.offStar++
        if (out.firstOff < 0) out.firstOff = t + 1
      } else on++
    }

    wake.push(on + out.offStar - offBefore)
    out.onStar += on
    out.onStarLast = on
    out.onStarPeak = Math.max(out.onStarPeak, on)
    if (count > 0) centroids.push(sum.map(v => v / count))
  }

  const mean = [0, 1, 2, 3].map(k => centroids.reduce((s, v) => s + (v[k] as number), 0) / Math.max(1, centroids.length))
  const centroidSpread = Math.sqrt(centroids.reduce((s, v) => s + v.reduce((u, x, k) => u + (x - (mean[k] as number)) ** 2, 0), 0) / Math.max(1, centroids.length))

  return {
    ...out,
    events,
    offHub: events.filter(e => !hubs.has(e.dock)).length,
    recruited: events.reduce((s, e) => s + e.recruited, 0),
    vacuumEvents: vacuumEvents.length,
    linesTouched: touched.size,
    centroidSpread,
    wake,
  }
}

// K on every dock holding `m` singles (loves) on m distinct lines and any set of full lines among the others: how many
// docks it fires on, on how many it carries a full line onto another line (a recruited vacuum pair), the most full
// lines it carries at once, how many send a single off the singles' own lines, and how many images leave the dock
// (every image is a slot of the same dock, so this must be 0: the recruit lands on a line through the dock)
// `recruit` counts docks where some full line lands on another line (full or not); `recruitNew` those where some full
// line lands on a line that was not full (E-SPN-0118's `fullMoved`), so a vacuum pair takes a line it did not hold
export function recruitCensus(m: number, collision: LockedTables['collision']): { docks: number; fires: number; recruit: number; recruitNew: number; maxRecruited: number; singlesLeft: number; offDock: number } {
  const out = { docks: 0, fires: 0, recruit: 0, recruitNew: 0, maxRecruited: 0, singlesLeft: 0, offDock: 0 }
  const vibe = new Int8Array(24)
  const pick = (from: number, acc: number[]): void => {
    if (acc.length === m) {
      const own = new Set(acc.map(d => LINE_OF[d] as number))

      if (own.size < m) return

      const others = Array.from({ length: 12 }, (_, l) => l).filter(l => !own.has(l))

      for (let mask = 0; mask < 1 << others.length; mask++) {
        vibe.fill(0)
        for (const d of acc) vibe[d] = 1
        others.forEach((l, i) => {
          if (((mask >> i) & 1) === 0) return
          vibe[LINE_FIRSTS[l] as number] = 1
          vibe[OPPOSITE[LINE_FIRSTS[l] as number] as number] = -1
        })
        out.docks++
        if (bouncePermutation(BOUNCE_TABLE, collision, vibe, 0, PERM) === 0) continue
        out.fires++

        for (let d = 0; d < 24; d++) if ((PERM[d] as number) < 0 || (PERM[d] as number) >= 24) out.offDock++

        const moved = recruitedAt(vibe, 0, PERM)

        if (moved > 0) out.recruit++
        if (
          Array.from({ length: 12 }, (_, l) => l).some(l => {
            const f = LINE_FIRSTS[l] as number

            if (vibe[f] === 0 || vibe[OPPOSITE[f] as number] === 0) return false

            const to = LINE_FIRSTS[LINE_OF[PERM[f] as number] as number] as number

            return vibe[to] === 0 || vibe[OPPOSITE[to] as number] === 0
          })
        )
          out.recruitNew++
        out.maxRecruited = Math.max(out.maxRecruited, moved)
        if (m === 2 && acc.some(d => !own.has(LINE_OF[PERM[d] as number] as number))) out.singlesLeft++
      }

      return
    }

    for (let d = from; d < 24; d++) pick(d + 1, [...acc, d])
  }

  pick(0, [])

  return out
}

// loves placed on the vacuum: each on its slot at its dock, the slot's dock line cleared first (both slots, its store)
export function placeLoves(vacuum: Configuration, loves: readonly { dock: number; slot: number }[]): Configuration {
  const s = cloneConfiguration(vacuum)

  for (const { dock, slot } of loves) {
    const l = LINE_OF[slot] as number

    for (const d of [LINE_FIRSTS[l] as number, OPPOSITE[LINE_FIRSTS[l] as number] as number]) {
      s.vibe[dock * 24 + d] = 0
      s.point[dock * 24 + d] = 0
      s.open[dock * 24 + d] = 0
    }
    s.store[dock * 12 + l] = 0
    s.spoint[dock * 12 + l] = 0
    s.sopen[dock * 12 + l] = 0
  }

  for (const { dock, slot } of loves) {
    s.vibe[dock * 24 + slot] = 1
    s.open[dock * 24 + slot] = 1
  }

  return s
}
