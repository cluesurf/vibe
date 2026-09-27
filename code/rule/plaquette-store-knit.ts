// THE PLAQUETTE STORE (E-RLT-0107, E-GRV-0087): the working vacuum's rule (the doublet-locked knit with the no-veto
// two-point store under the pass contact, code/rule/occupation-veto-knit kind 'none', the covariant coin) with one
// piece added: a dock may also store, as ONE unit, two full lines of one frame, each holding a love and a fear, and
// release them as one unit. Exact integers, reversible, deterministic. No float, no rounding, no random number.
//
// WHY (step-back.md, the last paragraph of "Measured (E-GRV-0083, 0084)"). The vacuum's units are love-fear pairs on
// one line, so its knots are rings along single lines and its entanglement a volume law. A single pair across two lines
// cannot be a vacuum unit (its occupation momentum r + s is 0 only for s = -r), but a unit of four vibes on roots r, -r,
// s, -s of one dock has momentum 0 for every two lines. This file is the smallest rule that holds such units.
//
// THE DESIGN CHOICES, each with its why:
//  1. WHICH TWO LINES: two lines of one FRAME (the three sets of four mutually orthogonal lines, code/rule/coined-locked-
//     knit FRAME_LINES), so 6 line pairs a frame, 18 a dock. Why: the line pairs of a dock fall into two W(F4) orbits by
//     angle (90 and 60 degrees); the orthogonal orbit is the one every covariant mixer of the ring reaches (E-SPN-0094)
//     and the one the vacuum already stores together (every stored vacuum dock holds exactly one whole frame, 4 lines,
//     tmp/plaq-probe1). The stabilizer of a frame (order 1,152 / 3 = 384) acts on its four lines as the full S4, so no
//     pairing of a frame's lines is singled out, and the unit is keyed by the SET of its two lines.
//  2. WHEN IT IS MADE: a frame of a dock with an empty plaquette register, in which EXACTLY two lines hold a love and a
//     fear on their two slots with an empty line store (the line piece's own unmake condition), is stored as one unit
//     and its four slots emptied. Why exactly two: with three or four such lines, choosing two of them is choosing a
//     pairing, and no choice is covariant (the S4 above); the line store takes them, as before.
//  3. WHEN IT IS RELEASED: a full register whose two lines have all four slots empty and empty line stores, in a frame
//     whose other two lines do not hold such a pair, puts the four vibes back (value, point, open bit, each on the slot
//     it came from). Why these conditions: they are exactly the making condition read after the release, so the piece
//     is an INVOLUTION (made then released is the identity, and released then made): the release holds only when the
//     released frame would be made again as the same unit.
//  4. WHAT IS STORED: the line pair (1 of 6), each line's orientation tau (the vibe on its first slot, the line store's
//     trit), and each line's pair word 9 s + q (the line store's own word) with its two open bits: unit = 1 + 4 k + (tau_i
//     < 0) + 2 (tau_j < 0), word = 81 w_i + w_j (0 .. 6,560), open = o_i + 4 o_j, i before j in FRAME_LINES order. Why:
//     it is the line store's content for each of the two lines, so nothing is lost and the release restores the dock
//     exactly; keyed by the frame's own line order, a coin map g that carries frame f to g f carries the unit to the unit
//     of the image lines (read from the other side where g turns a line, as the line store is), so W(F4) permutes units.
//  5. THE SCHEDULE: the plaquette piece Q stands beside the line piece P: Q P K on even beats and K P Q on odd beats (the
//     alternate schedule's P K and K P with Q next to P). Why: Q must see a frame's love-fear lines before P stores them
//     one by one, or it never acts; and each beat's collision is then the previous beat's reversed, the mirror property
//     the alternate schedule has for P and K. Every piece is an involution, so the inverse collision is the pieces in
//     the other order and the beat reverses exactly. So a unit is made only at the start of an even beat's collision;
//     released on an odd beat (after P) its pairs stream away, released on an even beat (before P) P stores its two
//     pairs as two line stores in the same collision. That is the rule this schedule gives, stated, not chosen per case.
//  6. THE LAWS: Q removes or restores a love and a fear on each of two lines of one dock, so it keeps charge (love minus
//     fear), count (a unit counts 4) and the dock's occupation momentum (r - r + s - s = 0); it reads only the
//     occupation and the line stores, so it commutes with charge conjugation (tau negates, words kept) and reads no
//     point (the occupation history stays one history on every term, the autonomy theorem of E-RLT-0100 T2).
//  7. WHAT IT DOES NOT DO: Q never takes a vibe onto another line: it releases every vibe onto the slot it came from, on
//     the dock where it was stored. So each mesh line's tone (a unit is tone 0 on each of its two lines) is kept by Q; if
//     lines join, they join through the TIMING (a unit waits for both lines), which changes which vibes meet and when.
//
// STORAGE: per dock and frame a register (unit, word, open), 3 a dock, beside the 12 line stores. Stores never stream.
//
// NOTHING MOVES: the store takes the four values of its two lines and gives them back; the stream takes each slot's
// value one dock along.

import { cloneConfiguration, newTally, type Configuration, type LockedTables, type LockedTally } from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece, pairWord, wordFirst, wordSecond, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { FRAME_LINES, FRAME_OF_LINE } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] as number)

// the six line pairs of a frame, as places in FRAME_LINES[f]
export const FRAME_PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]

export type PlaquetteConfiguration = Configuration & {
  // per dock and frame (x * 3 + f): 0 empty, else 1 + 4 k + (tau_i < 0) + 2 (tau_j < 0)
  punit: Int8Array
  // 81 w_i + w_j, w the line's pair word 9 s + q
  pword: Int16Array
  // o_i + 4 o_j, o the line's two open bits (first slot bit 0, second bit 1)
  popen: Uint8Array
}

// the line piece's counts (made: a line store released, unmade: a pair stored) and the units'
export type PlaquetteTally = LockedTally & { plaquettesMade: number; plaquettesUnmade: number }

export const newPlaquetteTally = (): PlaquetteTally => ({ ...newTally(), plaquettesMade: 0, plaquettesUnmade: 0 })

// a configuration with empty plaquette registers
export function withPlaquettes(c: Configuration): PlaquetteConfiguration {
  const docks = c.vibe.length / 24

  return { ...cloneConfiguration(c), punit: new Int8Array(docks * 3), pword: new Int16Array(docks * 3), popen: new Uint8Array(docks * 3) }
}

export function clonePlaquettes(c: PlaquetteConfiguration): PlaquetteConfiguration {
  return { ...cloneConfiguration(c), punit: Int8Array.from(c.punit), pword: Int16Array.from(c.pword), popen: Uint8Array.from(c.popen) }
}

// a unit's two lines and orientations
export function unitLines(frame: number, unit: number): { i: number; j: number; ti: number; tj: number } {
  const code = unit - 1
  const [pi, pj] = FRAME_PAIRS[code >> 2] as readonly [number, number]
  const ls = FRAME_LINES[frame] as readonly number[]

  return { i: ls[pi] as number, j: ls[pj] as number, ti: code & 1 ? -1 : 1, tj: code & 2 ? -1 : 1 }
}

// a line of dock x holding a love and a fear on its two slots with an empty line store (the line piece's unmake case)
function loveFearLine(c: Configuration, x: number, l: number): boolean {
  const a = c.vibe[x * 24 + (LINE_FIRSTS[l] as number)] as number

  return a !== 0 && c.vibe[x * 24 + (LINE_SECONDS[l] as number)] === -a && c.store[x * 12 + l] === 0
}

const lineEmpty = (c: Configuration, x: number, l: number): boolean => c.vibe[x * 24 + (LINE_FIRSTS[l] as number)] === 0 && c.vibe[x * 24 + (LINE_SECONDS[l] as number)] === 0 && c.store[x * 12 + l] === 0

// Q on dock x: every frame made or released (an involution, design choices 2 and 3)
export function plaquettePiece(c: PlaquetteConfiguration, x: number, tally?: PlaquetteTally): void {
  for (let f = 0; f < 3; f++) {
    const at = x * 3 + f
    const ls = FRAME_LINES[f] as readonly number[]
    let pairs = 0
    let first = -1
    let second = -1

    for (let p = 0; p < 4; p++) {
      if (!loveFearLine(c, x, ls[p] as number)) continue
      pairs++
      if (first < 0) first = p
      else second = p
    }

    const unit = c.punit[at] as number

    if (unit === 0) {
      if (pairs !== 2) continue

      const k = FRAME_PAIRS.findIndex(([a, b]) => a === first && b === second)
      const words: number[] = []
      const opens: number[] = []
      const taus: number[] = []

      for (const p of [first, second]) {
        const l = ls[p] as number
        const s = x * 24 + (LINE_FIRSTS[l] as number)
        const q = x * 24 + (LINE_SECONDS[l] as number)

        taus.push(c.vibe[s] as number)
        words.push(pairWord(c.point[s] as number, c.point[q] as number))
        opens.push((c.open[s] as number) | ((c.open[q] as number) << 1))
        c.vibe[s] = 0
        c.vibe[q] = 0
        c.open[s] = 0
        c.open[q] = 0
      }

      c.punit[at] = 1 + 4 * k + ((taus[0] as number) < 0 ? 1 : 0) + ((taus[1] as number) < 0 ? 2 : 0)
      c.pword[at] = 81 * (words[0] as number) + (words[1] as number)
      c.popen[at] = (opens[0] as number) | ((opens[1] as number) << 2)
      if (tally) tally.plaquettesUnmade++
      continue
    }

    const { i, j, ti, tj } = unitLines(f, unit)

    if (pairs !== 0 || !lineEmpty(c, x, i) || !lineEmpty(c, x, j)) continue

    const word = c.pword[at] as number
    const open = c.popen[at] as number

    for (const [l, tau, w, o] of [
      [i, ti, Math.floor(word / 81), open & 3],
      [j, tj, word % 81, (open >> 2) & 3],
    ] as const) {
      const s = x * 24 + (LINE_FIRSTS[l] as number)
      const q = x * 24 + (LINE_SECONDS[l] as number)

      c.vibe[s] = tau
      c.vibe[q] = -tau
      c.point[s] = wordFirst(w)
      c.point[q] = wordSecond(w)
      c.open[s] = o & 1
      c.open[q] = (o >> 1) & 1
    }

    c.punit[at] = 0
    c.pword[at] = 0
    c.popen[at] = 0
    if (tally) tally.plaquettesMade++
  }
}

// the collision's pieces at beat t (design choice 5): Q P K on even beats, K P Q on odd beats; `plaquettes` false gives
// the working vacuum's P K / K P
export function plaquetteSchedule(beat: number, plaquettes = true): readonly ('P' | 'Q' | 'K')[] {
  const order = collisionOrder('alternate', beat)

  if (!plaquettes) return order

  return beat % 2 === 0 ? ['Q', ...order] : [...order, 'Q']
}

export function collidePlaquette(tables: LockedTables, c: PlaquetteConfiguration, beat: number, inverse: boolean, tally?: PlaquetteTally, plaquettes = true, kind: VetoKind = 'none'): void {
  const order = plaquetteSchedule(beat, plaquettes)
  const pieces = inverse ? [...order].reverse() : order
  const count = inverse ? undefined : tally

  for (let x = 0; x < tables.cells; x++) {
    for (const piece of pieces) {
      if (piece === 'P') pairPiece(kind, c, x, count)
      else if (piece === 'Q') plaquettePiece(c, x, count)
      else coinPiece(tables, c, x)
    }
  }
}

// ---- comparing and mapping configurations ----

// every slot, line store and unit, with points and words where held
export function samePlaquettes(a: PlaquetteConfiguration, b: PlaquetteConfiguration): boolean {
  for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] || (a.vibe[i] !== 0 && (a.point[i] !== b.point[i] || a.open[i] !== b.open[i]))) return false
  for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i] || (a.store[i] !== 0 && (a.spoint[i] !== b.spoint[i] || a.sopen[i] !== b.sopen[i]))) return false
  for (let i = 0; i < a.punit.length; i++) if (a.punit[i] !== b.punit[i] || (a.punit[i] !== 0 && (a.pword[i] !== b.pword[i] || a.popen[i] !== b.popen[i]))) return false

  return true
}

// the occupation only (vibe trits, line store trits, unit codes)
export function sameOccupationPlaquettes(a: PlaquetteConfiguration, b: PlaquetteConfiguration): boolean {
  for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i]) return false
  for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i]) return false
  for (let i = 0; i < a.punit.length; i++) if (a.punit[i] !== b.punit[i]) return false

  return true
}

// charge conjugation: every vibe and store trit negated, and each unit's two orientations; points and words kept
export function conjugatePlaquettes(c: PlaquetteConfiguration): PlaquetteConfiguration {
  const out = clonePlaquettes(c)

  for (let i = 0; i < out.vibe.length; i++) out.vibe[i] = -(c.vibe[i] as number)
  for (let i = 0; i < out.store.length; i++) out.store[i] = -(c.store[i] as number)
  // tau negates on both lines: bits 0 and 1 of unit - 1 flip
  for (let i = 0; i < out.punit.length; i++) if (c.punit[i] !== 0) out.punit[i] = 1 + (((c.punit[i] as number) - 1) ^ 3)

  return out
}

// ---- one dock on its own (the collision reads and writes one dock only) ----

export function plaquetteDockOf(c: PlaquetteConfiguration, x: number): PlaquetteConfiguration {
  return {
    vibe: c.vibe.slice(x * 24, x * 24 + 24),
    point: c.point.slice(x * 24, x * 24 + 24),
    open: c.open.slice(x * 24, x * 24 + 24),
    store: c.store.slice(x * 12, x * 12 + 12),
    spoint: c.spoint.slice(x * 12, x * 12 + 12),
    sopen: c.sopen.slice(x * 12, x * 12 + 12),
    punit: c.punit.slice(x * 3, x * 3 + 3),
    pword: c.pword.slice(x * 3, x * 3 + 3),
    popen: c.popen.slice(x * 3, x * 3 + 3),
  }
}

export function plaquetteDockKey(c: PlaquetteConfiguration): string {
  const parts: number[] = []

  for (let d = 0; d < 24; d++) parts.push(c.vibe[d] === 0 ? 0 : (c.vibe[d] as number) * 32 + (c.point[d] as number) * 2 + (c.open[d] as number))
  for (let l = 0; l < 12; l++) parts.push(c.store[l] === 0 ? 0 : (c.store[l] as number) * 1024 + (c.spoint[l] as number) * 4 + (c.sopen[l] as number))
  for (let f = 0; f < 3; f++) parts.push(c.punit[f] === 0 ? 0 : ((c.punit[f] as number) * 8192 + (c.pword[f] as number)) * 16 + (c.popen[f] as number))

  return parts.join(',')
}

const SLOT_SIDE: readonly number[] = LINE_OF.map((l, d) => (LINE_FIRSTS[l] === d ? 0 : 1))

// a coin map g (a permutation of the 24 slots) on a one-dock configuration: slots and line stores as
// code/measure/occupation-veto-readings slotMapDock, and each unit to the unit of its two image lines, each line's tau,
// word and open bits read from the other side where g turns that line, the two lines put in the image frame's order
export function slotMapPlaquetteDock(c: PlaquetteConfiguration, g: readonly number[]): PlaquetteConfiguration {
  const out: PlaquetteConfiguration = { vibe: new Int8Array(24), point: new Int8Array(24), open: new Uint8Array(24), store: new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12), punit: new Int8Array(3), pword: new Int16Array(3), popen: new Uint8Array(3) }
  const flipWord = (w: number): number => 9 * (w % 9) + ((w / 9) | 0)
  const flipOpen = (o: number): number => ((o & 1) << 1) | (o >> 1)

  for (let d = 0; d < 24; d++) {
    const e = g[d] as number

    out.vibe[e] = c.vibe[d] as number
    out.point[e] = c.point[d] as number
    out.open[e] = c.open[d] as number
  }

  for (let l = 0; l < 12; l++) {
    const e = g[LINE_FIRSTS[l] as number] as number
    const m = LINE_OF[e] as number
    const flipped = SLOT_SIDE[e] === 1

    out.store[m] = flipped ? -(c.store[l] as number) : (c.store[l] as number)
    out.spoint[m] = flipped ? flipWord(c.spoint[l] as number) : (c.spoint[l] as number)
    out.sopen[m] = flipped ? flipOpen(c.sopen[l] as number) : (c.sopen[l] as number)
  }

  for (let f = 0; f < 3; f++) {
    const unit = c.punit[f] as number

    if (unit === 0) continue

    const { i, j, ti, tj } = unitLines(f, unit)
    const word = c.pword[f] as number
    const open = c.popen[f] as number
    const halves = [
      { l: i, tau: ti, w: Math.floor(word / 81), o: open & 3 },
      { l: j, tau: tj, w: word % 81, o: (open >> 2) & 3 },
    ].map(h => {
      const e = g[LINE_FIRSTS[h.l] as number] as number
      const flipped = SLOT_SIDE[e] === 1

      return { l: LINE_OF[e] as number, tau: flipped ? -h.tau : h.tau, w: flipped ? flipWord(h.w) : h.w, o: flipped ? flipOpen(h.o) : h.o }
    })
    const frame = FRAME_OF_LINE[halves[0]!.l] as number
    const ls = FRAME_LINES[frame] as readonly number[]

    halves.sort((p, q) => ls.indexOf(p.l) - ls.indexOf(q.l))

    const [hi, hj] = halves as [(typeof halves)[0], (typeof halves)[0]]
    const k = FRAME_PAIRS.findIndex(([a, b]) => a === ls.indexOf(hi.l) && b === ls.indexOf(hj.l))

    out.punit[frame] = 1 + 4 * k + (hi.tau < 0 ? 1 : 0) + (hj.tau < 0 ? 2 : 0)
    out.pword[frame] = 81 * hi.w + hj.w
    out.popen[frame] = hi.o | (hj.o << 2)
  }

  return out
}

// the collision of beat `beat` (or its inverse) on a one-dock configuration, a fresh copy
export function collidePlaquetteDock(tables: LockedTables, c: PlaquetteConfiguration, beat: number, inverse: boolean, plaquettes = true): PlaquetteConfiguration {
  const out = clonePlaquettes(c)

  collidePlaquette({ ...tables, cells: 1 }, out, beat, inverse, undefined, plaquettes)

  return out
}
