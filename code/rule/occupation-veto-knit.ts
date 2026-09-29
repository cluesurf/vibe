// THE DOUBLET-LOCKED KNIT WITH A VETO THE EXCHANGE CANNOT SEE (E-RLT-0100, E-RLT-0101). The adopted doublet-locked knit
// (code/rule/doublet-locked-knit) with one piece changed: what the neutral veto of the pair move reads. Exact integers
// in Z[omega], reversible, deterministic. No float, no rounding, no random number anywhere.
//
// WHY. Under the lock two like vibes on one line keep (weight 1/4) or exchange (3/4) their grid points, and the old
// veto refuses to unmake a love and a fear whose points differ. So on an exchanged term a returning pair reads a
// foreign point, is refused, and the coset-union vacuum melts (E-RLT-0098). The fix to test: a veto that reads only
// what the exchange keeps.
//
// WHAT THE LIKE MEETING KEEPS, exactly (E-RLT-0100 T1). On the two like vibes' points the meeting is (1 + w)/2 on the
// kept term and -(1 - w)/2 on the exchanged one (the fermion sign), so U = w P_sym + P_anti: it keeps (1) the
// occupation, every slot's vibe trit and every line's store trit, so charge (love minus fear), count and occupation
// momentum; (2) the unordered pair of points on its line, so the multiset of love points and of fear points at its
// dock; (3) the exchange-antisymmetric part of the two registers, and the symmetric part up to the phase w (equal
// points, the Phi pairing's support, read w). It keeps no point of any single vibe.
//
// THE THREE VETOES (the kind is fixed for a run):
//   'point'       the old veto: a love and a fear on a line with an empty store are unmade only when their points are
//                 equal. Kept as the control; with the two-point store below it is the old knit bit for bit.
//   'occupation'  CANDIDATE A: the pair move acts only in a NEUTRAL DOCK, one whose every line holds charge 0 (empty,
//                 a love and a fear, or a stored unit with its slots empty). A dock holding a lone vibe or a like pair
//                 makes and unmakes nothing that beat. It reads vibe trits only.
//   'pairing'     CANDIDATE B: the pair move acts only in a dock whose love points and fear points agree as multisets
//                 (the loves on its slots and in its stores against the fears likewise): the dock's vibes are Phi-paired,
//                 love to fear, up to which love holds which point. It reads points, but only through the dock's
//                 multisets, which the like exchange at that dock keeps.
// Both candidates read a quantity the pair move itself keeps (a stored unit's two points count in the multisets, a
// neutral line stays neutral), so the dock's decision is the same before and after the move and the pair piece is an
// involution. Both also unmake a love and a fear whose points differ, so the store keeps BOTH points: the stored pair
// word is 9 s + q (s the first slot's point, q the second's), one exact integer 0 to 80. A pair made from the store gets
// s and q back. Under the point veto every stored pair has s = q, the word is 10 s, and nothing else changes.
//
// WHY A IS SEEN ALIKE BY EVERY TERM (the autonomy theorem, E-RLT-0100 T2). Under 'occupation' no piece of the beat
// reads a point: the meeting keeps the occupation, the coin reads held-or-not (code/rule/bounce-pair-knit), the pair
// move reads trits, the stream's target is the mesh's. So the occupation at beat t is a function of the occupation at
// beat 0 alone, the same on every term of the sum over histories and on every link start. Every term sees the same
// veto decision at every beat, by construction. The price is the same sentence read backwards: no term's occupation
// differs from another's, so positions carry no amplitude (E-RLT-0099 Q4 is lost, necessarily).
//
// NOTHING MOVES: each slot takes its neighbor's value one dock along; a stored pair word is the dock's line's, never a
// link's.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  cloneConfiguration,
  mergeBranches,
  streamConfiguration,
  times,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)

// 'none' (no veto at all, the two-point store) is a probe of E-RLT-0101's lead, not one of the two candidates
export type VetoKind = 'point' | 'occupation' | 'pairing' | 'none'

export const VETO_KINDS: readonly VetoKind[] = [
  'point',
  'occupation',
  'pairing',
]

// the stored pair word of two points, and its two points back
export const pairWord = (s: number, q: number): number => 9 * s + q
export const wordFirst = (w: number): number => (w / 9) | 0
export const wordSecond = (w: number): number => w % 9

// a configuration of the old knit (store points 0 to 8, every stored pair on one point) in pair words, and back
export function toWords(c: Configuration): Configuration {
  const out = cloneConfiguration(c)

  for (let i = 0; i < out.spoint.length; i++) {
    out.spoint[i] = pairWord(c.spoint[i]!, c.spoint[i]!)
  }

  return out
}

// ---- the dock's decision ----

const LOVES = new Int32Array(9)
const FEARS = new Int32Array(9)

// true when the pair move may act at dock x (the per-line point test of the old veto is applied inside the move)
export function dockAllows(
  kind: VetoKind,
  c: Configuration,
  x: number,
): boolean {
  if (kind === 'point' || kind === 'none') {
    return true
  }

  const base = x * 24
  const lineBase = x * 12

  if (kind === 'occupation') {
    for (let l = 0; l < 12; l++) {
      if (
        c.vibe[base + LINE_FIRSTS[l]!]! +
          c.vibe[base + LINE_SECONDS[l]!]! !==
        0
      ) {
        return false
      }
    }

    return true
  }

  LOVES.fill(0)
  FEARS.fill(0)

  for (let d = 0; d < 24; d++) {
    const v = c.vibe[base + d]!

    if (v > 0) {
      LOVES[c.point[base + d]!]!++
    } else if (v < 0) {
      FEARS[c.point[base + d]!]!++
    }
  }

  for (let l = 0; l < 12; l++) {
    const tau = c.store[lineBase + l]!

    if (tau === 0) {
      continue
    }

    const w = c.spoint[lineBase + l]!
    const first = wordFirst(w)
    const second = wordSecond(w)

    // the first slot held the vibe tau, the second -tau
    ;(tau > 0 ? LOVES : FEARS)[first]!++
    ;(tau > 0 ? FEARS : LOVES)[second]!++
  }

  for (let p = 0; p < 9; p++) {
    if (LOVES[p] !== FEARS[p]) {
      return false
    }
  }

  return true
}

// ---- the pair move and the coin piece ----

// the pair move at one dock (an involution for every kind: the dock's decision reads what the move keeps)
export function pairPiece(
  kind: VetoKind,
  c: Configuration,
  x: number,
  tally?: LockedTally,
): void {
  const base = x * 24
  const lineBase = x * 12
  const allowed = dockAllows(kind, c, x)

  for (let l = 0; l < 12; l++) {
    const i = base + LINE_FIRSTS[l]!
    const j = base + LINE_SECONDS[l]!
    const a = c.vibe[i]!
    const b = c.vibe[j]!
    const tau = c.store[lineBase + l]!
    const unmake = tau === 0 && a !== 0 && b === -a
    const make = tau !== 0 && a === 0 && b === 0

    if (!unmake && !make) {
      continue
    }

    if (
      !allowed ||
      (unmake && kind === 'point' && c.point[i] !== c.point[j])
    ) {
      if (tally) {
        tally.vetoed++
      }

      continue
    }

    if (unmake) {
      c.vibe[i] = 0
      c.vibe[j] = 0
      c.store[lineBase + l] = a
      c.spoint[lineBase + l] = pairWord(c.point[i]!, c.point[j]!)
      c.sopen[lineBase + l] = (c.open[i] ? 1 : 0) | (c.open[j] ? 2 : 0)
      c.open[i] = 0
      c.open[j] = 0

      if (tally) {
        tally.unmade++
      }
    } else {
      const w = c.spoint[lineBase + l]!
      const o = c.sopen[lineBase + l]!

      c.vibe[i] = tau
      c.vibe[j] = -tau
      c.point[i] = wordFirst(w)
      c.point[j] = wordSecond(w)
      c.open[i] = o & 1
      c.open[j] = (o >> 1) & 1
      c.store[lineBase + l] = 0
      c.sopen[lineBase + l] = 0

      if (tally) {
        tally.made++
      }
    }
  }
}

const PERM = new Int32Array(24)
const SV = new Int8Array(24)
const SP = new Int8Array(24)
const SO = new Uint8Array(24)

// the collision's second piece at one dock: the dock's whole occupation permuted by the bounce table (the contact's K
// or B), exported so a reading can step it apart from the pair move (E-SPN-0098 attributes line breaks to it)
export function coinPiece(
  t: LockedTables,
  c: Configuration,
  x: number,
): void {
  const base = x * 24

  if (
    bouncePermutation(BOUNCE_TABLE, t.collision, c.vibe, base, PERM) ===
    0
  ) {
    return
  }

  for (let d = 0; d < 24; d++) {
    const to = PERM[d]!

    SV[to] = c.vibe[base + d]!
    SP[to] = c.point[base + d]!
    SO[to] = c.open[base + d]!
  }

  for (let d = 0; d < 24; d++) {
    c.vibe[base + d] = SV[d]!
    c.point[base + d] = SP[d]!
    c.open[base + d] = SO[d]!
  }
}

export function collideVeto(
  kind: VetoKind,
  t: LockedTables,
  c: Configuration,
  beat: number,
  inverse: boolean,
  tally?: LockedTally,
): void {
  const order = collisionOrder('alternate', beat)
  const pieces = inverse ? [...order].reverse() : order

  for (let x = 0; x < t.cells; x++) {
    for (const piece of pieces) {
      if (piece === 'P') {
        pairPiece(kind, c, x, inverse ? undefined : tally)
      } else {
        coinPiece(t, c, x)
      }
    }
  }
}

// ---- the meetings (the doublet-locked knit's, unchanged) ----

// keep (1 + w)/2, exchange -(1 - w)/2, equal points w; the adjoint row for the inverse beat
const KEEP: readonly [bigint, bigint][] = [
  [1n, 1n],
  [0n, -1n],
]
const EXCHANGE: readonly [bigint, bigint][] = [
  [-1n, 1n],
  [-2n, -1n],
]
const PHASE: readonly [bigint, bigint][] = [
  [0n, 1n],
  [-1n, -1n],
]

export const SPLIT_LIMIT = 16

const cloneBranch = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

// the like meetings of one term (the open vibes only), split into its keep and exchange terms
export function meetBranch(
  br: Branch,
  cells: number,
  adjoint: boolean,
  tally?: LockedTally,
): Branch[] {
  const side = adjoint ? 1 : 0
  const split: [number, number][] = []

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + LINE_SECONDS[l]!
      const vi = br.vibe[i]!

      if (vi === 0 || br.vibe[j] === 0 || !br.open[i] || !br.open[j]) {
        continue
      }

      if (vi !== br.vibe[j]) {
        if (tally) {
          tally.unlikeMeetings++
        }

        continue
      }

      if (tally) {
        tally.likeMeetings++
      }

      if (br.point[i] === br.point[j]) {
        const [u, v] = PHASE[side]!

        times(br, u, v)

        if (tally) {
          tally.phaseMeetings++
        }
      } else {
        split.push([i, j])
      }
    }
  }

  if (split.length === 0) {
    return [br]
  }

  if (split.length > SPLIT_LIMIT) {
    throw new Error(
      `a branch meets at ${split.length} unequal-point like meetings in one beat, over the guard ${SPLIT_LIMIT}`,
    )
  }

  if (tally) {
    tally.splitMeetings += split.length
  }

  const [ku, kv] = KEEP[side]!
  const [eu, ev] = EXCHANGE[side]!
  const out: Branch[] = []

  for (let mask = 0; mask < 1 << split.length; mask++) {
    const b = mask === (1 << split.length) - 1 ? br : cloneBranch(br)

    split.forEach(([i, j], n) => {
      if ((mask >> n) & 1) {
        const p = b.point[i]!

        b.point[i] = b.point[j]!
        b.point[j] = p
        times(b, eu, ev)
      } else {
        times(b, ku, kv)
      }
    })

    b.k += split.length
    out.push(b)
  }

  return out
}

// ---- one beat of the superposed state, and its exact inverse ----

export function vetoBeat(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
  tally?: LockedTally,
): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    for (const b of meetBranch(
      cloneBranch(br),
      t.cells,
      false,
      tally,
    )) {
      collideVeto(kind, t, b, beat, false, tally)
      streamConfiguration(t, b, false)
      next.push(b)
    }
  }

  return { branches: mergeBranches(next, tally) }
}

export function vetoBeatBack(
  kind: VetoKind,
  t: LockedTables,
  s: LockedState,
  beat: number,
): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    const b = cloneBranch(br)

    streamConfiguration(t, b, true)
    collideVeto(kind, t, b, beat, true)
    next.push(...meetBranch(b, t.cells, true))
  }

  return { branches: mergeBranches(next) }
}
