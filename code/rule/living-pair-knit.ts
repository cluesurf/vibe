// The living-pair knit: the candidate knit (code/rule/token-store-knit, 'returned-neutral': the pair-making isometric
// knit, the store that returns the unmade pair's own tokens, the neutral veto) with the pair move applied ONCE per
// beat, on alternate sides of the coin map, so a pair made from the store streams before it can be unmade
// (E-RLT-0074 to E-RLT-0076).
//
// WHY THE CANDIDATE'S VACUUM PAIRS NEVER STREAM (a theorem, E-RLT-0070's blocker). The candidate's collision is
// P K P. On a calm dock whose every store holds a unit, the first P makes all twelve pairs, so the dock is full and
// its occupation momentum is 0, where K is the -1 coin map. P commutes with every coin map, so P(-y) = -P(y): the
// second P returns the calm dock with every store negated. The same holds for ANY covariant K whose value on the
// full zero-momentum dock is -1 or the identity, which is every coin map a covariant rule can apply there. So any
// collision that applies P on both sides of K makes and unmakes the vacuum's pairs inside itself, and nothing in the
// vacuum ever meets.
//
// THE MOVE HERE. Apply P once per beat, alternately before and after K:
//   beat t even:  U_0 = S K P   (P, then K, then the stream)
//   beat t odd:   U_1 = S P K   (K, then P, then the stream)
// So between two applications of P there is always a stream, and a pair made by one P streams at least one beat
// before the next P can unmake it.
//
// WHAT IS KEPT, derived (E-RLT-0074 measures each):
//  - W(F4) and charge conjugation: P and K each commute with all 1,152 coin maps and with charge conjugation
//    (E-RLT-0064, E-RLT-0067), so both collisions K P and P K do, and the stream commutes with every box
//    automorphism that carries the links. The rule is covariant on every beat.
//  - A bijection: every beat is a composition of bijections. Its inverse is the unstream, then the collision's
//    inverse (P K for K P and back), so every beat reverses exactly.
//  - Motion reversal. With R the -1 coin map on every dock, R P R = P, R K R = K and R S R = S^-1 (the color weave's
//    links obey link(y, -d) = link(x, d)^-1). Let T = S R, an involution: (S R)^2 = S (R S R) = 1. Then
//      T U_0 T = S R S K P R S^-1 = K P S^-1 = U_1^-1,   T U_1 T = S R S P K R S^-1 = P K S^-1 = U_0^-1.
//    So T carries the forward history onto the backward one with the phase shifted by one beat: motion reversal is
//    one stream after the velocity reversal, where the palindrome's was one collision (C R). The one-phase schedule
//    (S K P every beat, 'first') has no such T: T U T = U^-1 with T = S R needs S^-1 K P = ... P K S^-1, i.e. K and P
//    to commute, which they do not. It is kept as the control that the reversal gate can fail.
//  - CPT: charge conjugation commutes with everything above, and the orientation-reversing coin maps are among the
//    1,152, so C P T = (charge conjugation) (the inversion with its cell map) (S R).
//  - The laws (charge, momentum, energy E = count + 2 sum |tau|), the held color through each collision (the
//    neutral veto), the fermion number and no sign flip (the store returns the tokens), exactly as in E-RLT-0067:
//    they are properties of P and K one at a time.
//
// THE HOT VACUUM, derived. Every line's store holds +1 in its own orientation, no vibe. Beat 0 (P first): every line
// makes its pair, love on the first slot; K = -1 sends the love to the second slot; the stream copies the love one
// dock along -r and the fear along +r. Beat 1 (K first): every dock is full (it received a vibe on every slot), so
// K = -1 turns each vibe round; P then sees on every line a love and a fear from DIFFERENT units (the unit of x and
// the unit of x - 2r); the neutral veto must refuse it; the stream copies each vibe back home. Beat 2 (P first): each
// line holds its own unit's love on the first slot and fear on the second, their points returned exactly (a link
// then its inverse), so P unmakes them into the store with +1. Beats 3 to 5 repeat it the other way round (made
// after K, the love goes along +r). So the hot vacuum has period 6, the store reads +1 at every calm beat, and every
// vacuum pair lives two beats and meets its partner again. The veto at beat 1 needs the two units that meet to hold
// different points after transport: for every line l with first slot f, second slot s and root r, and every dock x,
//      link(x, f) p(x) != link(x + 2r, s) p(x + 2r).                                                    (A)
// Each unit is constrained by its two neighbours along its line, so 9 points always suffice: separatedLayout finds
// the layout greedily in dock order. The constraint is frame covariant (a frame change moves both sides by the frame
// at x + r). A layout that breaks (A) somewhere lets two units' members pair off across the vacuum at that dock.
//
// STORAGE, stated: E-RLT-0067's, and nothing more. Per line a store trit and two store places (tokens with role
// points) that never stream. The schedule's phase is the beat's parity, which every dock reads the same (a global
// clock bit, as the palindromic schedules of earlier knits have). Nothing is stored on a link.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer tokens, role points moved by grid-move tables.

import { type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { applyCoinMap, dockCoinMap, makePairKnit, type PairKnit } from '@/code/rule/pair-making-knit'
import { cloneStoreState, transformStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

// 'alternate': P K on even beats, K P on odd beats (the rule). 'palindrome': P K P every beat (E-RLT-0067's
// candidate, the control). 'first': P K every beat (the control without a motion reversal)
export type LivingSchedule = 'alternate' | 'palindrome' | 'first'

export type LivingKnit = {
  readonly weave: ColorWeave
  readonly knit: PairKnit
  readonly schedule: LivingSchedule
  // the neutral veto (on unless false; off is a control)
  readonly veto: boolean
}

export function makeLivingKnit(weave: ColorWeave, schedule: LivingSchedule = 'alternate', veto = true): LivingKnit {
  return { weave, knit: makePairKnit({ mesh: weave.mesh }), schedule, veto }
}

export type LivingTally = { made: number; unmade: number; vetoed: number }

// the pair move on line l of dock x: store 'returned' (the unmade pair's tokens go into the line's two places, a
// made pair takes them back) with the neutral veto (a pair is made or unmade only where its two tokens hold one point)
function pairLine(veto: boolean, s: TokenStoreState, x: number, l: number, tally?: LivingTally): void {
  const i = x * 24 + (LINE_FIRSTS[l] as number)
  const j = x * 24 + (LINE_SECONDS[l] as number)
  const a = s.vibe[i] as number
  const b = s.vibe[j] as number
  const tau = s.store[x * 12 + l] as number
  let make: boolean

  if (tau === 0) {
    if (a === 0 || b !== -a) return
    make = false
  } else {
    if (a !== 0 || b !== 0) return
    make = true
  }

  const p0 = x * 24 + 2 * l
  const p1 = p0 + 1
  const hi = make ? (s.place[p0] as number) : (s.token[i] as number)
  const hj = make ? (s.place[p1] as number) : (s.token[j] as number)

  if (veto && s.point[hi] !== s.point[hj]) {
    if (tally) tally.vetoed++
    return
  }

  if (make) {
    s.vibe[i] = tau
    s.vibe[j] = -tau
    s.store[x * 12 + l] = 0
    if (tally) tally.made++
  } else {
    s.vibe[i] = 0
    s.vibe[j] = 0
    s.store[x * 12 + l] = a
    if (tally) tally.unmade++
  }

  const ti = s.token[i] as number
  const tj = s.token[j] as number

  s.token[i] = s.place[p0] as number
  s.token[j] = s.place[p1] as number
  s.place[p0] = ti
  s.place[p1] = tj
}

export function pairDock(k: LivingKnit, s: TokenStoreState, x: number, tally?: LivingTally): void {
  for (let l = 0; l < 12; l++) pairLine(k.veto, s, x, l, tally)
}

export function coinDock(k: LivingKnit, s: TokenStoreState, x: number): void {
  const w = dockCoinMap(k.knit.table, s.vibe, x * 24)

  if (w) applyCoinMap(w, s.vibe, x * 24, s.token)
}

// the order of the pieces of beat t's collision, 'P' and 'K', in the order they act
export function collisionOrder(schedule: LivingSchedule, t: number): readonly ('P' | 'K')[] {
  if (schedule === 'palindrome') return ['P', 'K', 'P']
  if (schedule === 'first') return ['P', 'K']

  return t % 2 === 0 ? ['P', 'K'] : ['K', 'P']
}

// beat t's collision on dock x, forward, or its inverse (the pieces in the other order, each its own inverse)
export function livingCollide(k: LivingKnit, s: TokenStoreState, x: number, t: number, inverse = false, tally?: LivingTally): void {
  const order = collisionOrder(k.schedule, t)
  const pieces = inverse ? [...order].reverse() : order

  for (const piece of pieces) {
    if (piece === 'P') pairDock(k, s, x, tally)
    else coinDock(k, s, x)
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
function stream(k: LivingKnit, s: TokenStoreState, open: Uint8Array, crossings: [number, number][]): TokenStoreState {
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

// the inverse stream
function unstream(k: LivingKnit, s: TokenStoreState, open: Uint8Array, crossings: [number, number][]): TokenStoreState {
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
export function livingBeat(k: LivingKnit, state: TokenStoreState, open: Uint8Array, t: number, tally?: LivingTally): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const s = cloneStoreState(state)
  const meetings: [number, number][] = []
  const signs: [number, number][] = []
  const crossings: [number, number][] = []

  meetingsOf(s, open, cells, meetings, signs)

  for (let x = 0; x < cells; x++) livingCollide(k, s, x, t, false, tally)

  return { state: stream(k, s, open, crossings), record: { meetings, crossings, signs } }
}

// the exact inverse of beat t
export function livingBeatBack(k: LivingKnit, state: TokenStoreState, open: Uint8Array, t: number): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const crossings: [number, number][] = []
  const out = unstream(k, cloneStoreState(state), open, crossings)

  for (let x = 0; x < cells; x++) livingCollide(k, out, x, t, true)

  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf(out, open, cells, meetings, signs)

  return { state: out, record: { meetings, crossings, signs } }
}

// the motion reversal T: R (the -1 coin map on every dock), then one stream ('alternate' and 'first'), or R then beat
// t's collision ('palindrome', E-RLT-0067's C R)
export function livingMotionReversal(k: LivingKnit, s: TokenStoreState, t: number): TokenStoreState {
  const identityCells = Array.from({ length: k.weave.mesh.cellCount }, (_, x) => x)
  const reversed = transformStoreState(s, identityCells, OPPOSITE)

  if (k.schedule === 'palindrome') {
    for (let x = 0; x < k.weave.mesh.cellCount; x++) livingCollide(k, reversed, x, t)

    return reversed
  }

  return stream(k, reversed, new Uint8Array(s.point.length), [])
}

// ---- the hot vacuum ----

// The separated point layout: one role point per line of every dock, chosen dock by dock (in dock order unless an
// order is given) as the least point that breaks condition (A) with both neighbours along the line already chosen.
// Always exists (two constraints, nine points)
export function separatedLayout(weave: ColorWeave, order?: readonly number[]): Int8Array {
  const { mesh, moves, links } = weave
  const cells = mesh.cellCount
  const layout = new Int8Array(cells * 12).fill(-1)
  const act = (g: number, p: number): number => moves.act[g]?.[p] ?? p
  const inverseAct = (g: number, p: number): number => moves.act[moves.inverse[g] ?? moves.identity]?.[p] ?? p

  for (let i = 0; i < cells; i++) {
    const x = order ? (order[i] as number) : i

    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l] as number
      const s = LINE_SECONDS[l] as number
      const up = mesh.neighbour(mesh.neighbour(x, f), f)
      const down = mesh.neighbour(mesh.neighbour(x, s), s)
      const forbidden = new Set<number>()

      // (A) at x: link(x, f) p(x) != link(up, s) p(up)
      if (layout[up * 12 + l] !== -1) forbidden.add(inverseAct(links[x * 24 + f] ?? moves.identity, act(links[up * 24 + s] ?? moves.identity, layout[up * 12 + l] as number)))
      // (A) at down: link(down, f) p(down) != link(x, s) p(x)
      if (layout[down * 12 + l] !== -1) forbidden.add(inverseAct(links[x * 24 + s] ?? moves.identity, act(links[down * 24 + f] ?? moves.identity, layout[down * 12 + l] as number)))

      let p = 0

      while (forbidden.has(p)) p++

      layout[x * 12 + l] = p
    }
  }

  return layout
}

// the docks and lines where condition (A) fails for a layout (0 for a separated one)
export function layoutViolations(weave: ColorWeave, layout: Int8Array): number {
  const { mesh, moves, links } = weave
  let bad = 0

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l] as number
      const s = LINE_SECONDS[l] as number
      const up = mesh.neighbour(mesh.neighbour(x, f), f)
      const left = moves.act[links[x * 24 + f] ?? moves.identity]?.[layout[x * 12 + l] as number]
      const right = moves.act[links[up * 24 + s] ?? moves.identity]?.[layout[up * 12 + l] as number]

      bad += left === right ? 1 : 0
    }
  }

  return bad
}

// A full state on the weave: the given vibes and slot points, every line's store at tau with both place tokens at the
// layout's point. Slot tokens 0 .. slots - 1, place tokens after them; labels unread (the vibes' signs, the stored
// units' orientation)
export function livingState(input: { vibe: Int8Array; point: Int8Array; tau: number; layout: Int8Array }): TokenStoreState {
  const slots = input.vibe.length
  const cells = slots / 24
  const point = new Int8Array(slots * 2)
  const label = new Int8Array(slots * 2)

  for (let i = 0; i < slots; i++) {
    point[i] = input.point[i] as number
    label[i] = input.vibe[i] as number
  }

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const p = input.layout[x * 12 + l] as number

      point[slots + x * 24 + 2 * l] = p
      point[slots + x * 24 + 2 * l + 1] = p
      label[slots + x * 24 + 2 * l] = input.tau
      label[slots + x * 24 + 2 * l + 1] = -input.tau
    }
  }

  return {
    vibe: Int8Array.from(input.vibe),
    store: new Int8Array(cells * 12).fill(input.tau),
    token: Int32Array.from({ length: slots }, (_, i) => i),
    place: Int32Array.from({ length: slots }, (_, i) => slots + i),
    point,
    label,
  }
}
