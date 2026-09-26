// The bounce knit: the living-pair knit (code/rule/living-pair-knit: the pair move P once per beat on alternate sides
// of the coin map, the store that returns the unmade pair's own tokens, the neutral veto) with its coin map K replaced
// by the BOUNCE collision B, which reverses every full line and applies the isometric map only to the rest
// (E-RLT-0084, E-RLT-0085).
//
// WHY. E-RLT-0080 to E-RLT-0082 proved that isotropic husk transport needs a vacuum storing all twelve lines equally,
// that such a vacuum puts many vacuum vibes on one dock at one beat, and measured that a lone vibe arriving there
// scatters them into a box-filling wake. The scattering is K's: K is the isometric coin map w_P of the dock's WHOLE
// occupation momentum P (code/rule/isometric-knit), and a dock holding vacuum pairs plus one lone vibe of root r has
// P = r, so K = w_r = -s_r, which carries every vacuum pair at 60 degrees to r onto another line.
//
// THE COLLISION B, on one dock. Read only the occupation (a love and a fear alike). Each line is EMPTY, SINGLE (one
// slot held) or FULL (both slots held). Let F be the set of full lines, P the occupation momentum (full lines add 0,
// so P is the singles' momentum) and w = w_P the isometric coin map (the identity where the isometric table leaves
// the dock alone). Then
//      B = -1 on the slots of every full line (the two vibes of a full line swap slots), and
//          w on the slots of every other line      if w carries F onto itself,
//          the identity on them                     otherwise.
// B is a slot permutation of the dock (w permutes lines, so when w(F) = F it carries the non-full lines onto
// themselves), copied with the tokens riding along.
//
// WHAT IS KEPT, derived (E-RLT-0084 measures each):
//  - NO LABEL. F and P are read from the occupation, which K already reads. A full line of matter bounces exactly as a
//    vacuum pair does: B cannot tell them apart and does not need to. The store tokens carry labels (the unit's
//    orientation), but B never reads a token.
//  - AN INVOLUTION. B keeps F (full lines stay full) and P (w fixes P, and -1 on a full line keeps its zero momentum),
//    so the same case applies again: -1 twice and w twice (an involution) are the identity. So every beat still
//    reverses exactly, by the living-pair knit's argument with K replaced by B.
//  - W(F4) AND C. For a coin map g: F -> g F, P -> g P, w_(gP) = g w_P g^-1 (E-RLT-0061), so w_(gP)(g F) = g w_P(F),
//    and the case and the map are carried by g; -1 is central. B reads occupation only, so it commutes with charge
//    conjugation. So B commutes with all 1,152 coin maps and with C, and the motion reversal T = S R (R the -1 coin
//    map on every dock) and CPT of living-pair-knit carry over unchanged: they used only R K R = K, R P R = P, the
//    covariance and K an involution.
//  - THE LAWS. B is a slot permutation, so the love and fear counts (charge, count) are kept; momentum is kept (w
//    fixes P, full lines hold 0). The energy E = count + 2 sum |tau| is P's, unchanged.
//  - THE VACUUM. On a dock whose occupation momentum is 0 with every held line full (every hot-vacuum dock at every
//    beat, when (Z) holds), w = -1 carries F to itself and B = -1 = K. So every living vacuum of E-RLT-0074 to
//    E-RLT-0082 runs exactly as before: conditions (Z) and (A) are unchanged.
//  - THE LONE VIBE, derived. A lone vibe of root r on a dock whose other held lines are all full: P = r, w_r fixes r,
//    and in either case the lone vibe keeps its slot, while every full line reverses as it would without it. So a
//    lone vibe goes straight through any dock of vacuum pairs and leaves them as the vacuum would. What remains is P:
//    a lone vibe on a slot of a stored unit's own line blocks the unit's pair (or meets one of its members), which
//    touches only that LINE, and B never carries a vibe from a single line onto a full one. So its wake is confined
//    to the vibes and stores of the lines it shares.
//  - WHAT IT GIVES UP. B scatters less than K: a dock holding full lines and singles scatters its singles only when w
//    keeps the full lines, and never turns a full line. Whether the husk transport stays isotropic on a vacuum is a
//    MEASUREMENT (E-RLT-0085); on a W(F4)-invariant background it is forced by the covariance, as for K.
//
// STORAGE: living-pair-knit's (per line a store trit and two place tokens that never stream; the beat's parity as the
// schedule's global clock bit). B adds nothing. Nothing is stored on a link.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer tokens, role points moved by grid-move tables.

import { type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { isometricTable, LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, type MomentumTable } from '@/code/rule/isometric-knit'
import { makePairKnit, type PairKnit } from '@/code/rule/pair-making-knit'
import { collisionOrder, pairDock, type LivingSchedule, type LivingTally } from '@/code/rule/living-pair-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { cloneStoreState, transformStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'

const ROOTS = rootsD4()
const R0 = Int32Array.from(ROOTS, r => r[0] ?? 0)
const R1 = Int32Array.from(ROOTS, r => r[1] ?? 0)
const R2 = Int32Array.from(ROOTS, r => r[2] ?? 0)
const R3 = Int32Array.from(ROOTS, r => r[3] ?? 0)
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const LINE_OF_SLOT = Int32Array.from(LINE_OF)
const OPPOSITE_SLOT = Int32Array.from(OPPOSITE)

// 'bounce': B on every dock. 'lone': B on a dock holding at most one single line, K on every other dock.
// 'isometric': K (the living-pair knit, the control and the reference)
export type CollisionKind = 'bounce' | 'lone' | 'isometric'

// The dock permutation of B (or of K) for the dock's occupation (vibe[base .. base + 23], read as held or not),
// written into `out` (out[d] is the slot slot d is copied to). Returns 0 when the permutation is the identity, 1 when
// the isometric map acts on the non-full lines (w keeps F, or K), 2 when only the full lines turn (w does not keep F)
export function bouncePermutation(table: MomentumTable, kind: CollisionKind, vibe: Int8Array, base: number, out: Int32Array): number {
  let p0 = 0
  let p1 = 0
  let p2 = 0
  let p3 = 0
  let full = 0
  let singles = 0

  for (let l = 0; l < 12; l++) {
    const f = LINE_FIRSTS[l] as number
    const s = LINE_SECONDS[l] as number
    const a = vibe[base + f] !== 0
    const b = vibe[base + s] !== 0

    if (a && b) full |= 1 << l
    else if (a) {
      singles++
      p0 += R0[f] as number
      p1 += R1[f] as number
      p2 += R2[f] as number
      p3 += R3[f] as number
    } else if (b) {
      singles++
      p0 += R0[s] as number
      p1 += R1[s] as number
      p2 += R2[s] as number
      p3 += R3[s] as number
    }
  }

  const w = table[momentumKey([p0, p1, p2, p3])]

  if (kind === 'isometric' || (kind === 'lone' && singles > 1)) {
    if (!w) return 0

    for (let d = 0; d < 24; d++) out[d] = w[d] as number

    return 1
  }

  let keeps = true

  if (w) {
    for (let l = 0; l < 12 && keeps; l++) {
      if ((full >> l) & 1) keeps = ((full >> (LINE_OF_SLOT[w[LINE_FIRSTS[l] as number] as number] as number)) & 1) === 1
    }
  }

  if (full === 0 && !w) return 0

  for (let d = 0; d < 24; d++) {
    const l = LINE_OF_SLOT[d] as number

    out[d] = (full >> l) & 1 ? (OPPOSITE_SLOT[d] as number) : w && keeps ? (w[d] as number) : d
  }

  return w && keeps ? 1 : 2
}

export type BounceKnit = {
  readonly weave: ColorWeave
  readonly knit: PairKnit
  readonly schedule: LivingSchedule
  readonly veto: boolean
  readonly collision: CollisionKind
}

export function makeBounceKnit(weave: ColorWeave, schedule: LivingSchedule = 'alternate', veto = true, collision: CollisionKind = 'bounce'): BounceKnit {
  return { weave, knit: makePairKnit({ mesh: weave.mesh }), schedule, veto, collision }
}

const PERM = new Int32Array(24)
const SCRATCH_V = new Int8Array(24)
const SCRATCH_T = new Int32Array(24)

// B (or K) on dock x, the tokens riding along
export function bounceDock(k: BounceKnit, s: TokenStoreState, x: number): number {
  const base = x * 24
  const kind = bouncePermutation(k.knit.table, k.collision, s.vibe, base, PERM)

  if (kind === 0) return 0

  for (let d = 0; d < 24; d++) {
    SCRATCH_V[PERM[d] as number] = s.vibe[base + d] as number
    SCRATCH_T[PERM[d] as number] = s.token[base + d] as number
  }

  for (let d = 0; d < 24; d++) {
    s.vibe[base + d] = SCRATCH_V[d] as number
    s.token[base + d] = SCRATCH_T[d] as number
  }

  return kind
}

// beat t's collision on dock x, forward, or its inverse (the pieces in the other order, each its own inverse)
export function bounceCollide(k: BounceKnit, s: TokenStoreState, x: number, t: number, inverse = false, tally?: LivingTally): void {
  const order = collisionOrder(k.schedule, t)
  const pieces = inverse ? [...order].reverse() : order

  for (const piece of pieces) {
    if (piece === 'P') pairDock(k, s, x, tally)
    else bounceDock(k, s, x)
  }
}

// the meetings of two open tokens: both slots of one line of a dock held, before the collision
function meetingsOf(s: TokenStoreState, open: Uint8Array, cells: number, meetings: [number, number][], signs: [number, number][]): void {
  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (LINE_SECONDS[l] as number)
      const a = s.vibe[i] as number
      const b = s.vibe[j] as number

      if (a === 0 || b === 0) continue

      const ti = s.token[i] as number
      const tj = s.token[j] as number

      if (open[ti] === 1 && open[tj] === 1) {
        meetings.push([ti, tj])
        signs.push([a, b])
      }
    }
  }
}

// the stream: every slot's vibe and token copied one dock along its root, each token's point moved by the link
function stream(k: BounceKnit, s: TokenStoreState, open: Uint8Array, crossings: [number, number][]): TokenStoreState {
  const { moves, links } = k.weave
  const vibe = new Int8Array(s.vibe.length)
  const token = new Int32Array(s.token.length)

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const tk = s.token[slot] as number
    const g = links[slot] ?? moves.identity
    const to = k.knit.target[slot] as number

    vibe[to] = s.vibe[slot] as number
    token[to] = tk
    s.point[tk] = moves.act[g]?.[s.point[tk] as number] ?? 0

    if (open[tk] === 1) crossings.push([tk, g])
  }

  return { ...s, vibe, token }
}

function unstream(k: BounceKnit, s: TokenStoreState, open: Uint8Array, crossings: [number, number][]): TokenStoreState {
  const { moves, links } = k.weave
  const vibe = new Int8Array(s.vibe.length)
  const token = new Int32Array(s.token.length)

  for (let slot = 0; slot < vibe.length; slot++) {
    const from = k.knit.target[slot] as number
    const tk = s.token[from] as number
    const g = moves.inverse[links[slot] ?? moves.identity] ?? moves.identity

    vibe[slot] = s.vibe[from] as number
    token[slot] = tk
    s.point[tk] = moves.act[g]?.[s.point[tk] as number] ?? 0

    if (open[tk] === 1) crossings.push([tk, g])
  }

  return { ...s, vibe, token }
}

// beat t forward: meetings, collision, stream
export function bounceBeat(k: BounceKnit, state: TokenStoreState, open: Uint8Array, t: number, tally?: LivingTally): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const s = cloneStoreState(state)
  const meetings: [number, number][] = []
  const signs: [number, number][] = []
  const crossings: [number, number][] = []

  meetingsOf(s, open, cells, meetings, signs)

  for (let x = 0; x < cells; x++) bounceCollide(k, s, x, t, false, tally)

  return { state: stream(k, s, open, crossings), record: { meetings, crossings, signs } }
}

// the exact inverse of beat t
export function bounceBeatBack(k: BounceKnit, state: TokenStoreState, open: Uint8Array, t: number): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const crossings: [number, number][] = []
  const out = unstream(k, cloneStoreState(state), open, crossings)

  for (let x = 0; x < cells; x++) bounceCollide(k, out, x, t, true)

  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf(out, open, cells, meetings, signs)

  return { state: out, record: { meetings, crossings, signs } }
}

// the motion reversal T = S R ('alternate' and 'first'), or R then beat t's collision ('palindrome')
export function bounceMotionReversal(k: BounceKnit, s: TokenStoreState, t: number): TokenStoreState {
  const identityCells = Array.from({ length: k.weave.mesh.cellCount }, (_, x) => x)
  const reversed = transformStoreState(s, identityCells, OPPOSITE)

  if (k.schedule === 'palindrome') {
    for (let x = 0; x < k.weave.mesh.cellCount; x++) bounceCollide(k, reversed, x, t)

    return reversed
  }

  return stream(k, reversed, new Uint8Array(s.point.length), [])
}

// the isometric table, re-exported so a caller can build B's permutation without importing the knit
export const BOUNCE_TABLE: MomentumTable = isometricTable()
