// THE DOUBLET-LOCKED KNIT (E-RLT-0097 to E-RLT-0099): the adopted knit (the lone-bounce collision L, the pair move with
// its neutral veto, the stream) with every vibe's copy direction set by its role's doublet, the user's decision of
// 2026-09-26 (E-SPN-0081's theorem: a role-reading copy covariant under a husk line's stabilizer has a one-dimensional
// generator, zero on the role's scalar line, so the only covariant way a vibe moves with amplitudes is this lock).
// Exact integers in Z[omega], reversible, deterministic. No float, no rounding, no random number anywhere.
//
// THE LOCK IN THE KNIT, derived. A slot of a dock is one side of one of the dock's twelve lines. The stream copies the
// first slot's vibe one dock along +r and the second slot's along -r. So a line already holds a two-valued copy label,
// and the lock says which one a vibe holds: the label IS the vibe's role doublet component, read on the line it sits on
// (E-SPN-0081's generator: the doublet's +1 eigenvector copies forward, its -1 eigenvector back, the scalar line not at
// all). So
//      e0 (the doublet's forward vector)   <->  the line's first slot
//      e1 (the doublet's backward vector)  <->  the line's second slot
//      o  (the role's scalar line)         <->  resting on the line, copied nowhere
// A CLASSICAL configuration (every vibe on a slot, nothing on o: the lock's line block empty) is a state of the lock,
// and on it the lock's stream IS the old stream, slot for slot. No piece of the rule ever writes o (the collision and
// the pair move are slot permutations, the meeting below maps two doublet labels into two doublet labels), so the
// rest state is never populated: the lock's line block stays 0 on every state the rule reaches.
//
// WHAT READS THE LABEL, the frame. The label is read in the vibe's own comoving frame (its own role point, carried by
// every link the vibe crosses, E-SPN-0062/0066). It must be: a link's grid move is a color frame, and a lock read in a
// fixed frame would change a vibe's copy direction under a change of the color frame at a dock, which is not a
// physical change. Transported, the frame never mixes the two labels, so links act on the classical sector exactly as
// in the old knit (they move the point), and nothing new is stored: the frame is the point the knit already holds.
//
// WHY ONE PERMUTATION PER BEAT, not an order (the coordinator's E-SPN-0083 / E-RLT-0096 point). A spin-steered copy
// (one doublet read on several lines at once) cannot be simultaneous: the lock generators of two husk lines anticommute,
// so their copies need an order, and E-SPN-0079's T = 0 principle would fix it (the 16-beat nested palindrome). THIS
// lock is SLOT-steered: each vibe copies only along the one line its slot lies on, so the twelve per-line copies move
// disjoint sets of slots and every order of them is the same permutation. The ordering term T vanishes identically,
// at period one, with no order chosen. The price, stated: the spin never enters the band (a lone vibe's band is the
// old knit's). The spin-steered alternative has no classical sector at all (no role is an eigenvector of two
// anticommuting generators), so it cannot reduce to the old knit; E-RLT-0097 checks both facts.
//
// THE ONE NEW PIECE: the meeting. Two vibes on one line of one dock (the line full, before the collision) hold
// opposite labels, e0 and e1. The locked meeting (code/rule/locked-token-line, E-SPN-0072):
//   a love and a fear   the user's convention C (the fear runs the love's rule in its conjugate coordinates): opposite
//                        labels are orthogonal to Phi = sum_k |k k> / sqrt 3, so the knit's meeting V = 1 + (omega - 1)
//                        |Phi><Phi| is the IDENTITY there. Every love-fear meeting does nothing (helicity suppression,
//                        E-SPN-0073, now in the knit)
//   two loves, or two fears   2 U = (1 + omega) + (1 - omega) SWAP on the two labels. Swapping two identical vibes'
//                        labels keeps the occupation and exchanges what the two carry (their points), with the fermion
//                        sign of the exchange: (1 + omega)|f: pA, s: pB> - (1 - omega)|f: pB, s: pA>, over 2. Where the
//                        two points agree the two terms are one configuration: 2 omega / 2 = omega, a phase.
// So a like meeting of two vibes with different points KEEPS (weight 1/4) or EXCHANGES their points (weight 3/4), and
// the occupation is the same in both terms. Nothing else in the rule is new.
//
// THE STATE: a finite sum of classical configurations (the knit's reduced state: per slot a vibe trit and a point, per
// line a store trit and a point), each with an Eisenstein amplitude (a + b omega) / 2^k. Configurations that coincide are
// added. The OPEN mask (per slot, and per line for a stored pair) marks the vibes that carry amplitude; the physical rule
// has every vibe open, and the mask is the knit's bookkeeping (code/rule/fear-weave: "letting every token be open is
// the same rule"), used where the all-open state is too large to hold. With no open vibe the rule is the old knit, bit
// for bit.
//
// ONE BEAT t: the meetings (on the configuration before the collision), then the collision (the pair move P and the
// coin piece in the order of collisionOrder('alternate', t)), then the stream. The inverse beat: unstream, the pieces
// in the other order (each is an involution), then the meetings with the conjugate amplitudes.
//
// NOTHING MOVES: the stream copies each slot's value one dock along; a link holds nothing (the point a vibe carries is
// the vibe's, moved by the link's grid move as it is copied).

import { type ColorWeave } from '@/code/rule/color-weave'
import { bouncePermutation, BOUNCE_TABLE, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type LockedTables = {
  readonly cells: number
  readonly collision: CollisionKind
  readonly veto: boolean
  // slot -> the slot it streams into; the slot it streams from
  readonly target: Int32Array
  readonly source: Int32Array
  // per slot: the grid move of its link, and of the link it came through, as point tables (9 entries each)
  readonly move: Int8Array
  readonly back: Int8Array
}

// the rule's tables from a weave (the kernel's, with the inverse stream added); `links` replaces the weave's links
export function lockedTables(weave: ColorWeave, collision: CollisionKind = 'lone', links?: Int16Array, veto = true): LockedTables {
  const cells = weave.mesh.cellCount
  const slots = cells * 24
  const target = new Int32Array(slots)
  const source = new Int32Array(slots)
  const move = new Int8Array(slots * 9)
  const back = new Int8Array(slots * 9)
  const use = links ?? weave.links
  const { act, inverse, identity } = weave.moves

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d
      const to = weave.mesh.neighbour(x, d) * 24 + d
      const g = use[slot] ?? identity
      const forward = act[g] as Int8Array
      const reverse = act[inverse[g] ?? identity] as Int8Array

      target[slot] = to
      source[to] = slot

      for (let p = 0; p < 9; p++) {
        move[slot * 9 + p] = forward[p] as number
        // the vibe now at `to` came through slot's link: undo it
        back[to * 9 + p] = reverse[p] as number
      }
    }
  }

  return { cells, collision, veto, target, source, move, back }
}

export type Configuration = {
  vibe: Int8Array
  point: Int8Array
  open: Uint8Array
  store: Int8Array
  spoint: Int8Array
  // per line, bit 0: the stored pair's first-slot vibe was open, bit 1: its second-slot vibe
  sopen: Uint8Array
}

export type Branch = Configuration & { a: bigint; b: bigint; k: number }

export type LockedState = { branches: Branch[] }

export type LockedTally = { likeMeetings: number; splitMeetings: number; phaseMeetings: number; unlikeMeetings: number; made: number; unmade: number; vetoed: number; merged: number }

export const newTally = (): LockedTally => ({ likeMeetings: 0, splitMeetings: 0, phaseMeetings: 0, unlikeMeetings: 0, made: 0, unmade: 0, vetoed: 0, merged: 0 })

// ---- Eisenstein arithmetic: (x + y w)(u + v w), w^2 = -1 - w ----
const mulA = (x: bigint, y: bigint, u: bigint, v: bigint): bigint => x * u - y * v
const mulB = (x: bigint, y: bigint, u: bigint, v: bigint): bigint => x * v + y * u - y * v

export function times(br: { a: bigint; b: bigint }, u: bigint, v: bigint): void {
  const a = mulA(br.a, br.b, u, v)
  const b = mulB(br.a, br.b, u, v)

  br.a = a
  br.b = b
}

export const norm = (a: bigint, b: bigint): bigint => a * a - a * b + b * b

// the meeting's coefficients (numerators over 2, except the phase, which is exact): forward and adjoint
//   keep       (1 + w) / 2        adjoint (1 + w^2) / 2 = -w / 2
//   exchange  -(1 - w) / 2        adjoint -(1 - w^2) / 2 = -(2 + w) / 2
//   same point  w                 adjoint w^2 = -1 - w
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

export function cloneConfiguration(c: Configuration): Configuration {
  return { vibe: Int8Array.from(c.vibe), point: Int8Array.from(c.point), open: Uint8Array.from(c.open), store: Int8Array.from(c.store), spoint: Int8Array.from(c.spoint), sopen: Uint8Array.from(c.sopen) }
}

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// a classical configuration with amplitude 1
export function lockedState(c: Configuration): LockedState {
  return { branches: [{ ...cloneConfiguration(c), a: 1n, b: 0n, k: 0 }] }
}

// ---- the meetings ----

type Meeting = { i: number; j: number; same: boolean }

// the meetings of two open vibes on one line (before the collision); like ones returned, unlike ones counted
function meetingsOf(c: Configuration, cells: number, tally?: LockedTally): Meeting[] {
  const out: Meeting[] = []

  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + (LINE_FIRSTS[l] as number)
      const j = base + (LINE_SECONDS[l] as number)
      const vi = c.vibe[i] as number
      const vj = c.vibe[j] as number

      if (vi === 0 || vj === 0 || !c.open[i] || !c.open[j]) continue

      if (vi !== vj) {
        if (tally) tally.unlikeMeetings++
        continue
      }

      out.push({ i, j, same: c.point[i] === c.point[j] })
    }
  }

  return out
}

// the most unequal-point meetings one branch may split at in one beat (2^limit terms), a guard, never reached in the
// runs this file is used for
export const SPLIT_LIMIT = 16

function meetBranch(br: Branch, cells: number, adjoint: boolean, tally?: LockedTally): Branch[] {
  const meetings = meetingsOf(br, cells, tally)
  const side = adjoint ? 1 : 0
  const [pu, pv] = PHASE[side] as [bigint, bigint]
  const split: Meeting[] = []

  for (const m of meetings) {
    if (tally) tally.likeMeetings++

    if (m.same) {
      times(br, pu, pv)
      if (tally) tally.phaseMeetings++
    } else split.push(m)
  }

  if (split.length === 0) return [br]
  if (split.length > SPLIT_LIMIT) throw new Error(`a branch meets at ${split.length} unequal-point like meetings in one beat, over the guard ${SPLIT_LIMIT}`)
  if (tally) tally.splitMeetings += split.length

  const [ku, kv] = KEEP[side] as [bigint, bigint]
  const [eu, ev] = EXCHANGE[side] as [bigint, bigint]
  const out: Branch[] = []

  for (let mask = 0; mask < 1 << split.length; mask++) {
    const b = mask === (1 << split.length) - 1 ? br : cloneBranch(br)

    split.forEach((m, n) => {
      if ((mask >> n) & 1) {
        const p = b.point[m.i] as number

        b.point[m.i] = b.point[m.j] as number
        b.point[m.j] = p
        times(b, eu, ev)
      } else times(b, ku, kv)
    })

    b.k += split.length
    out.push(b)
  }

  return out
}

// ---- the collision: the pair move and the coin piece, the old knit's, with the open mask riding along ----

function pairPiece(t: LockedTables, c: Configuration, x: number, tally?: LockedTally): void {
  const base = x * 24
  const lineBase = x * 12

  for (let l = 0; l < 12; l++) {
    const i = base + (LINE_FIRSTS[l] as number)
    const j = base + (LINE_SECONDS[l] as number)
    const a = c.vibe[i] as number
    const b = c.vibe[j] as number
    const tau = c.store[lineBase + l] as number

    if (tau === 0) {
      if (a === 0 || b !== -a) continue

      if (t.veto && c.point[i] !== c.point[j]) {
        if (tally) tally.vetoed++
        continue
      }

      c.vibe[i] = 0
      c.vibe[j] = 0
      c.store[lineBase + l] = a
      c.spoint[lineBase + l] = c.point[i] as number
      c.sopen[lineBase + l] = (c.open[i] ? 1 : 0) | (c.open[j] ? 2 : 0)
      c.open[i] = 0
      c.open[j] = 0
      if (tally) tally.unmade++
    } else if (a === 0 && b === 0) {
      const p = c.spoint[lineBase + l] as number
      const o = c.sopen[lineBase + l] as number

      c.vibe[i] = tau
      c.vibe[j] = -tau
      c.point[i] = p
      c.point[j] = p
      c.open[i] = o & 1
      c.open[j] = (o >> 1) & 1
      c.store[lineBase + l] = 0
      c.sopen[lineBase + l] = 0
      if (tally) tally.made++
    }
  }
}

const PERM = new Int32Array(24)
const SV = new Int8Array(24)
const SP = new Int8Array(24)
const SO = new Uint8Array(24)

function coinPiece(t: LockedTables, c: Configuration, x: number): void {
  const base = x * 24
  const kind = bouncePermutation(BOUNCE_TABLE, t.collision, c.vibe, base, PERM)

  if (kind === 0) return

  for (let d = 0; d < 24; d++) {
    const to = PERM[d] as number

    SV[to] = c.vibe[base + d] as number
    SP[to] = c.point[base + d] as number
    SO[to] = c.open[base + d] as number
  }

  for (let d = 0; d < 24; d++) {
    c.vibe[base + d] = SV[d] as number
    c.point[base + d] = SP[d] as number
    c.open[base + d] = SO[d] as number
  }
}

export function collideConfiguration(t: LockedTables, c: Configuration, beat: number, inverse: boolean, tally?: LockedTally): void {
  const order = collisionOrder('alternate', beat)
  const pieces = inverse ? [...order].reverse() : order

  for (let x = 0; x < t.cells; x++) {
    for (const piece of pieces) {
      if (piece === 'P') pairPiece(t, c, x, inverse ? undefined : tally)
      else coinPiece(t, c, x)
    }
  }
}

// ---- the stream (the lock's copy: the first slot forward, the second back, nothing rests) ----

export function streamConfiguration(t: LockedTables, c: Configuration, inverse: boolean): void {
  const vibe = new Int8Array(c.vibe.length)
  const point = new Int8Array(c.point.length)
  const open = new Uint8Array(c.open.length)

  for (let slot = 0; slot < vibe.length; slot++) {
    const v = c.vibe[slot] as number

    if (v === 0) continue

    const to = (inverse ? t.source[slot] : t.target[slot]) as number
    const p = c.point[slot] as number

    vibe[to] = v
    point[to] = (inverse ? t.back[slot * 9 + p] : t.move[slot * 9 + p]) as number
    open[to] = c.open[slot] as number
  }

  c.vibe = vibe
  c.point = point
  c.open = open
}

// ---- adding coincident configurations ----

function hashOf(c: Configuration): string {
  let h1 = 2166136261
  let h2 = 5381

  const mix = (v: number): void => {
    h1 = Math.imul(h1 ^ (v & 0xff), 16777619) >>> 0
    h2 = (Math.imul(h2, 33) + (v & 0xff)) >>> 0
  }

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i] as number

    if (v === 0) continue
    mix(i)
    mix(i >> 8)
    mix(i >> 16)
    mix(v)
    mix(c.point[i] as number)
    mix(c.open[i] as number)
  }

  mix(255)

  for (let i = 0; i < c.store.length; i++) {
    const v = c.store[i] as number

    if (v === 0) continue
    mix(i)
    mix(i >> 8)
    mix(i >> 16)
    mix(v)
    mix(c.spoint[i] as number)
    mix(c.sopen[i] as number)
  }

  return `${h1}:${h2}`
}

export function sameConfiguration(a: Configuration, b: Configuration): boolean {
  for (let i = 0; i < a.vibe.length; i++) {
    const v = a.vibe[i] as number

    if (v !== b.vibe[i]) return false
    if (v !== 0 && (a.point[i] !== b.point[i] || a.open[i] !== b.open[i])) return false
  }

  for (let i = 0; i < a.store.length; i++) {
    const v = a.store[i] as number

    if (v !== b.store[i]) return false
    if (v !== 0 && (a.spoint[i] !== b.spoint[i] || a.sopen[i] !== b.sopen[i])) return false
  }

  return true
}

function reduceBranch(b: Branch): void {
  while (b.k > 0 && b.a % 2n === 0n && b.b % 2n === 0n) {
    b.a /= 2n
    b.b /= 2n
    b.k--
  }
}

export function mergeBranches(list: Branch[], tally?: LockedTally): Branch[] {
  if (list.length === 1) {
    reduceBranch(list[0] as Branch)

    return list
  }

  const buckets = new Map<string, Branch[]>()
  const out: Branch[] = []

  for (const b of list) {
    const key = hashOf(b)
    const bucket = buckets.get(key)
    const twin = bucket?.find(o => sameConfiguration(o, b))

    if (!twin) {
      if (bucket) bucket.push(b)
      else buckets.set(key, [b])
      out.push(b)
      continue
    }

    if (tally) tally.merged++

    const k = Math.max(twin.k, b.k)
    const s1 = 1n << BigInt(k - twin.k)
    const s2 = 1n << BigInt(k - b.k)

    twin.a = twin.a * s1 + b.a * s2
    twin.b = twin.b * s1 + b.b * s2
    twin.k = k
  }

  return out.filter(b => {
    reduceBranch(b)

    return b.a !== 0n || b.b !== 0n
  })
}

// ---- one beat, and its exact inverse ----

export function lockedBeat(t: LockedTables, s: LockedState, beat: number, tally?: LockedTally): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    for (const b of meetBranch(cloneBranch(br), t.cells, false, tally)) {
      collideConfiguration(t, b, beat, false, tally)
      streamConfiguration(t, b, false)
      next.push(b)
    }
  }

  return { branches: mergeBranches(next, tally) }
}

export function lockedBeatBack(t: LockedTables, s: LockedState, beat: number): LockedState {
  const next: Branch[] = []

  for (const br of s.branches) {
    const b = cloneBranch(br)

    streamConfiguration(t, b, true)
    collideConfiguration(t, b, beat, true)
    next.push(...meetBranch(b, t.cells, true))
  }

  return { branches: mergeBranches(next) }
}

// sum over branches of N(a + b w) 4^(K - k), and 4^K: equal exactly when the state is normalized
export function lockedNorm(s: LockedState): { total: bigint; unit: bigint } {
  const K = Math.max(0, ...s.branches.map(b => b.k))
  let total = 0n

  for (const b of s.branches) total += norm(b.a, b.b) * (1n << BigInt(2 * (K - b.k)))

  return { total, unit: 1n << BigInt(2 * K) }
}

// ---- the line data, for the comparison with the locked token (code/rule/locked-token-line) ----

// the lock's copy step of each label on a line: the first slot +1, the second -1, the scalar line 0
export const LINE_STEP: readonly [number, number, number] = [1, -1, 0]

// the locked meeting on two labels (first-quantized: distinguishable tokens, as code/rule/locked-token-line holds
// them), times its scale: like vibes 2U = (1 + w) + (1 - w) SWAP on every label pair; a love and a fear under C with
// the knit's meeting, 1. Returns the terms (j1', j2', a, b)
export function lineMeeting(like: boolean, j1: number, j2: number): [number, number, bigint, bigint][] {
  if (!like) return [[j1, j2, 1n, 0n]]
  if (j1 === j2) return [[j1, j2, 2n, 0n]]

  return [
    [j1, j2, 1n, 1n],
    [j2, j1, 1n, -1n],
  ]
}
