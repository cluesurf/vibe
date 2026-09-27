// The pair-making isometric knit with its role tokens, and the pair moves that decide what a token does when its
// vibe is unmade into the store (E-RLT-0067, E-RLT-0068).
//
// THE OPEN FORK (E-RLT-0066). In code/rule/isometric-role-knit a token rides its vibe, and a pair unmade into the
// store leaves its two tokens on the two calm slots, where the coin map and the stream carry them off. A later
// pair made from the store takes whatever calm tokens then sit on the line, so a token can come back with the
// other sign. The whole then rewrites that coordinate by the reflection (a, b) -> (a, -b), and E-QTM-0123 proved
// that no permutation of the 9 role points but the identity commutes with all 216 grid moves: a rewrite at a flip
// is never frame covariant, and the identity (no rewrite) is the partial conjugation that leaves non-states. So a
// covariant, state-keeping role layer needs a pair move under which NO TOKEN EVER CHANGES SIGN.
//
// THE VARIANTS (the classical rule is P K P then the stream, code/rule/pair-making-knit, with the pair move P
// changed as named; K, the store trit and the stream are the knit's own):
//   'plain'     the knit's P: the E-RLT-0066 baseline (tokens stay on slots, any calm tokens make a pair)
//   'neutral'   P only on a line whose two tokens hold one role point (the neutral move, on every token's own
//               point), tokens staying on slots: the flip is still possible
//   'returned'  the store keeps the tokens: a pair unmade into the store takes its two tokens with it into the
//               line's two STORE PLACES and the two calm tokens there come out onto the slots; a pair made from
//               the store puts the same two tokens back, the love on the side the store's sign names. So a
//               remade token gets its own point back from the store, and its sign
//   'returned-neutral'  'returned' and neutral: a pair is made or unmade only when its two tokens hold one point
//   'labeled'   every token carries a latent sign (its label), and P acts on a line only where the tokens that
//               would be held carry the signs they would get: the move that never flips a sign, tokens on slots
//   'labeled-neutral'  'labeled' and neutral
//
// A token's OWN POINT is its role point moved by the grid move of every link it crosses (open or closed), the
// record data the comoving beat carries (code/rule/comoving-weave): for a closed token it is the classical point
// isometric-role-knit already moves, and the whole's own point for an open one agrees with it until the whole
// rewrites the coordinate at a flip. The neutral veto reads it, so it is covariant: a frame change moves both
// tokens of one dock by one grid move.
//
// STORAGE, stated. 'returned' holds per line the store trit and two store places, each a token with its role
// point (a calm token's point, or a stored pair's two points), and the places never stream: 12 trits and 24 role
// points per dock beside the 24 slots. 'labeled' holds one latent sign per slot beside its three trits (a calm
// slot is then two states per role point, so the slot is no longer three trits). Neither stores anything on a
// link.
//
// P is an involution in every variant: its condition reads the tokens that are held on the line or would be held
// after it acts (the line's tokens for an unmake, the store places' for a make in 'returned', the line's for a
// make otherwise), and it maps each case onto the other with the same tokens in the same places. It commutes with
// every coin map: a coin map carries a line with its places (first to first, or first to second with the store
// negated and the places exchanged) and a token keeps its point and its label.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer tokens, role points moved by grid-move tables.

import { type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { applyCoinMap, dockCoinMap, type PairKnit } from '@/code/rule/pair-making-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type StoreVariant = 'plain' | 'neutral' | 'returned' | 'returned-neutral' | 'labeled' | 'labeled-neutral'

export type TokenStoreKnit = {
  readonly weave: ColorWeave
  readonly knit: PairKnit
  readonly variant: StoreVariant
}

// vibe and token per slot (x * 24 + d), store trit per line (x * 12 + l), the token in each store place
// (x * 24 + 2 l + k, k 0 paired with the line's first slot), and per token its own point (grid index) and label
export type TokenStoreState = {
  readonly vibe: Int8Array
  readonly store: Int8Array
  readonly token: Int32Array
  readonly place: Int32Array
  readonly point: Int8Array
  readonly label: Int8Array
}

export const returns = (v: StoreVariant): boolean => v === 'returned' || v === 'returned-neutral'
export const isNeutral = (v: StoreVariant): boolean => v === 'neutral' || v === 'returned-neutral' || v === 'labeled-neutral'
export const isLabeled = (v: StoreVariant): boolean => v === 'labeled' || v === 'labeled-neutral'

export function cloneStoreState(s: TokenStoreState): TokenStoreState {
  return {
    vibe: Int8Array.from(s.vibe),
    store: Int8Array.from(s.store),
    token: Int32Array.from(s.token),
    place: Int32Array.from(s.place),
    point: Int8Array.from(s.point),
    label: Int8Array.from(s.label),
  }
}

export function sameStoreState(a: TokenStoreState, b: TokenStoreState): boolean {
  const same = (x: ArrayLike<number>, y: ArrayLike<number>): boolean => {
    if (x.length !== y.length) return false

    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false

    return true
  }

  return same(a.vibe, b.vibe) && same(a.store, b.store) && same(a.token, b.token) && same(a.place, b.place) && same(a.point, b.point) && same(a.label, b.label)
}

// pairs made and unmade, and the tokens they moved
export type StoreTally = { made: number; unmade: number }

// the pair move on line l of dock x
function pairLine(variant: StoreVariant, s: TokenStoreState, x: number, l: number, tally?: StoreTally): void {
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
  const back = returns(variant)
  const hi = back && make ? (s.place[p0] as number) : (s.token[i] as number)
  const hj = back && make ? (s.place[p1] as number) : (s.token[j] as number)
  // the sign the first slot's vibe has (unmake) or will have (make)
  const first = make ? tau : a

  if (isNeutral(variant) && s.point[hi] !== s.point[hj]) return
  if (isLabeled(variant) && (s.label[hi] !== first || s.label[hj] !== -first)) return

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

  if (back) {
    const ti = s.token[i] as number
    const tj = s.token[j] as number

    s.token[i] = s.place[p0] as number
    s.token[j] = s.place[p1] as number
    s.place[p0] = ti
    s.place[p1] = tj
  }
}

// the dock collision P K P, its own inverse
export function storeDockCollide(k: TokenStoreKnit, s: TokenStoreState, x: number, tally?: StoreTally): void {
  const base = x * 24

  for (let l = 0; l < 12; l++) pairLine(k.variant, s, x, l, tally)

  const w = dockCoinMap(k.knit.table, s.vibe, base)

  if (w) applyCoinMap(w, s.vibe, base, s.token)

  for (let l = 0; l < 12; l++) pairLine(k.variant, s, x, l, tally)
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

// one beat forward: meetings, collision, stream (every token's own point moved by the link it crosses)
export function storeBeat(k: TokenStoreKnit, state: TokenStoreState, open: Uint8Array, tally?: StoreTally): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const s = cloneStoreState(state)
  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf(s, open, cells, meetings, signs)

  for (let x = 0; x < cells; x++) storeDockCollide(k, s, x, tally)

  const { moves, links } = k.weave
  const vibe = new Int8Array(s.vibe.length)
  const token = new Int32Array(s.token.length)
  const crossings: [number, number][] = []

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const tk = s.token[slot] as number
    const g = links[slot] ?? moves.identity
    const to = k.knit.target[slot] as number

    vibe[to] = s.vibe[slot] as number
    token[to] = tk
    s.point[tk] = moves.act[g]?.[s.point[tk] as number] ?? 0

    if (open[tk] === 1) crossings.push([tk, g])
  }

  return { state: { ...s, vibe, token }, record: { meetings, crossings, signs } }
}

// one beat backward, the exact inverse of storeBeat
export function storeBeatBack(k: TokenStoreKnit, state: TokenStoreState, open: Uint8Array): { state: TokenStoreState; record: BeatRecord } {
  const cells = k.weave.mesh.cellCount
  const { moves, links } = k.weave
  const s = cloneStoreState(state)
  const vibe = new Int8Array(s.vibe.length)
  const token = new Int32Array(s.token.length)
  const crossings: [number, number][] = []

  for (let slot = 0; slot < vibe.length; slot++) {
    const from = k.knit.target[slot] as number
    const tk = s.token[from] as number
    const g = moves.inverse[links[slot] ?? moves.identity] ?? moves.identity

    vibe[slot] = s.vibe[from] as number
    token[slot] = tk
    s.point[tk] = moves.act[g]?.[s.point[tk] as number] ?? 0

    if (open[tk] === 1) crossings.push([tk, g])
  }

  const out: TokenStoreState = { ...s, vibe, token }

  for (let x = 0; x < cells; x++) storeDockCollide(k, out, x)

  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf(out, open, cells, meetings, signs)

  return { state: out, record: { meetings, crossings, signs } }
}

// ---- symmetries ----

// a coin map g with a cell map on a whole state: slot (x, d) -> (cellMap x, g d), store line l -> line of g(first
// l) with the side sign, its places with it (exchanged when the line is reversed); tokens keep their points; sign
// -1 composes charge conjugation (vibes, store and labels negated)
export function transformStoreState(s: TokenStoreState, cellMap: readonly number[], g: readonly number[], sign = 1): TokenStoreState {
  const vibe = new Int8Array(s.vibe.length)
  const token = new Int32Array(s.token.length)
  const store = new Int8Array(s.store.length)
  const place = new Int32Array(s.place.length)
  const lineImage = LINE_FIRSTS.map(f => LINE_OF[g[f] as number] as number)
  const lineSign = LINE_FIRSTS.map(f => SIDE[g[f] as number] as number)

  for (let x = 0; x < cellMap.length; x++) {
    const y = cellMap[x] as number

    for (let d = 0; d < 24; d++) {
      vibe[y * 24 + (g[d] as number)] = sign * (s.vibe[x * 24 + d] as number)
      token[y * 24 + (g[d] as number)] = s.token[x * 24 + d] as number
    }

    for (let l = 0; l < 12; l++) {
      const m = lineImage[l] as number
      const flip = lineSign[l] === -1

      store[y * 12 + m] = sign * (lineSign[l] as number) * (s.store[x * 12 + l] as number)
      place[y * 24 + 2 * m + (flip ? 1 : 0)] = s.place[x * 24 + 2 * l] as number
      place[y * 24 + 2 * m + (flip ? 0 : 1)] = s.place[x * 24 + 2 * l + 1] as number
    }
  }

  return { vibe, store, token, place, point: Int8Array.from(s.point), label: Int8Array.from(s.label, v => sign * v) }
}

// the links a coin map g with a cell map carries: the link on (x, d) goes to (cellMap x, g d)
export function transformLinks(links: Int16Array, cellMap: readonly number[], g: readonly number[]): Int16Array {
  const out = new Int16Array(links.length)

  for (let x = 0; x < cellMap.length; x++) {
    for (let d = 0; d < 24; d++) out[(cellMap[x] as number) * 24 + (g[d] as number)] = links[x * 24 + d] as number
  }

  return out
}

// the motion reversal C R of the beat U = S C: R the -1 coin map on every dock, then the collision. With links
// that obey link(y, -d) = link(x, d)^-1 (the color weave's), R S R = S^-1 on vibes, tokens and points
export function storeMotionReversal(k: TokenStoreKnit, s: TokenStoreState): TokenStoreState {
  const identityCells = Array.from({ length: k.weave.mesh.cellCount }, (_, x) => x)
  const reversed = transformStoreState(s, identityCells, OPPOSITE)

  for (let x = 0; x < k.weave.mesh.cellCount; x++) storeDockCollide(k, reversed, x)

  return reversed
}

// ---- conserved quantities ----

export function storeEnergy(s: TokenStoreState): number {
  let e = 0

  for (let i = 0; i < s.vibe.length; i++) e += s.vibe[i] !== 0 ? 1 : 0
  for (let i = 0; i < s.store.length; i++) e += 2 * Math.abs(s.store[i] as number)

  return e
}

export function storeCharge(s: TokenStoreState): number {
  let q = 0

  for (let i = 0; i < s.vibe.length; i++) q += s.vibe[i] as number

  return q
}
