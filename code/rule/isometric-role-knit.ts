// The isometric knit carrying the three-trit roles: the classical collision is the W(F4)-covariant isometric
// knit (or the pair-making one), and the role layer is the knit's own, links as grid moves and the comoving fear
// beat at meetings (E-RLT-0066).
//
// Every slot carries a TOKEN, the name of the role point it holds, exactly as code/rule/combined-knit carries
// them: tokens ride with their vibes through every copy the collision makes (the coin map w copies slot d to
// slot w(d), and the token with it) and through the stream; a closed token's classical role point is moved by
// the grid move of every link it crosses, and an open token's crossing is recorded for the whole.
//
// A MEETING is recorded as combined-knit records it at a wire: where both slots of one line of a dock hold a vibe
// before the collision acts, the two tokens (first slot's, then second's) and their signs. Lines are disjoint,
// so the meetings of one beat touch disjoint pairs of tokens. The coin map keeps every vibe's sign and moves
// tokens with their vibes, so no token is exchanged at a like meeting (the 'first-sign' convention,
// fearKernels likeExchanged false), and no token changes sign.
//
// The classical layer never reads a role point or the whole, with one stated exception: the NEUTRAL pair move
// (a control of E-RLT-0066, for closed tokens only) acts on a line only where its two slots' tokens hold the same
// classical role point.
//
// Backward: unstream (tokens back through the inverse links), then the collision (its own inverse), then the
// meetings, read from the state before the forward collision, which is the state the backward collision returns.

import { type ColorWeave } from '@/code/rule/color-weave'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { pairDockCollide, type PairKnit, type PairTally, type PairVeto } from '@/code/rule/pair-making-knit'

const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type RoleKnitState = {
  readonly vibe: Int8Array
  readonly store: Int8Array
  readonly token: Int32Array
  readonly point: Int8Array
}

export type RoleKnit = {
  readonly weave: ColorWeave
  readonly knit: PairKnit
  // the neutral pair move: pairs made and unmade only between two slots whose tokens hold one role point
  readonly neutral: boolean
}

export function roleKnitState(input: { vibe: Int8Array; point: Int8Array; store?: Int8Array; cells: number }): RoleKnitState {
  return {
    vibe: Int8Array.from(input.vibe),
    store: input.store ? Int8Array.from(input.store) : new Int8Array(input.cells * 12),
    token: Int32Array.from({ length: input.vibe.length }, (_, i) => i),
    point: Int8Array.from(input.point),
  }
}

function meetingsOf(state: { vibe: Int8Array; token: Int32Array }, open: Uint8Array, cells: number, meetings: [number, number][], signs: [number, number][]): void {
  for (let x = 0; x < cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + (LINE_FIRSTS[l] as number)
      const j = base + (LINE_SECONDS[l] as number)
      const a = state.vibe[i] as number
      const b = state.vibe[j] as number

      if (a === 0 || b === 0) continue

      const ti = state.token[i] as number
      const tj = state.token[j] as number

      if (open[ti] === 1 && open[tj] === 1) {
        meetings.push([ti, tj])
        signs.push([a, b])
      }
    }
  }
}

function vetoOf(knit: RoleKnit, state: { token: Int32Array; point: Int8Array }): PairVeto | undefined {
  if (!knit.neutral) return undefined

  return (base, l) => state.point[state.token[base + (LINE_FIRSTS[l] as number)] as number] === state.point[state.token[base + (LINE_SECONDS[l] as number)] as number]
}

// one beat forward: meetings, collision, stream. Returns the record the whole reads
export function roleKnitBeat(knit: RoleKnit, state: RoleKnitState, open: Uint8Array, tally?: PairTally): { state: RoleKnitState; record: BeatRecord } {
  const cells = knit.weave.mesh.cellCount
  const vibe = Int8Array.from(state.vibe)
  const store = Int8Array.from(state.store)
  const token = Int32Array.from(state.token)
  const point = Int8Array.from(state.point)
  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf({ vibe, token }, open, cells, meetings, signs)

  const allow = vetoOf(knit, { token, point })

  for (let x = 0; x < cells; x++) pairDockCollide(knit.knit, { vibe, store }, x, token, tally, allow)

  const { moves, links } = knit.weave
  const streamedVibe = new Int8Array(vibe.length)
  const streamedToken = new Int32Array(token.length)
  const crossings: [number, number][] = []

  for (let s = 0; s < vibe.length; s++) {
    const tk = token[s] as number
    const g = links[s] ?? moves.identity
    const to = knit.knit.target[s] as number

    streamedVibe[to] = vibe[s] as number
    streamedToken[to] = tk

    if (open[tk] === 1) crossings.push([tk, g])
    else point[tk] = moves.act[g]?.[point[tk] as number] ?? 0
  }

  return { state: { vibe: streamedVibe, store, token: streamedToken, point }, record: { meetings, crossings, signs } }
}

// one beat backward, the exact inverse of roleKnitBeat
export function roleKnitBeatBack(knit: RoleKnit, state: RoleKnitState, open: Uint8Array): { state: RoleKnitState; record: BeatRecord } {
  const cells = knit.weave.mesh.cellCount
  const { moves, links } = knit.weave
  const vibe = new Int8Array(state.vibe.length)
  const token = new Int32Array(state.token.length)
  const point = Int8Array.from(state.point)
  const store = Int8Array.from(state.store)
  const crossings: [number, number][] = []

  for (let s = 0; s < vibe.length; s++) {
    const from = knit.knit.target[s] as number
    const tk = state.token[from] as number
    const g = moves.inverse[links[s] ?? moves.identity] ?? moves.identity

    vibe[s] = state.vibe[from] as number
    token[s] = tk

    if (open[tk] === 1) crossings.push([tk, g])
    else point[tk] = moves.act[g]?.[point[tk] as number] ?? 0
  }

  const allow = vetoOf(knit, { token, point })

  for (let x = 0; x < cells; x++) pairDockCollide(knit.knit, { vibe, store }, x, token, undefined, allow)

  const meetings: [number, number][] = []
  const signs: [number, number][] = []

  meetingsOf({ vibe, token }, open, cells, meetings, signs)

  return { state: { vibe, store, token, point }, record: { meetings, crossings, signs } }
}

// each slot's classical role point, read through its token
export function roleKnitRoles(state: RoleKnitState): Int8Array {
  return Int8Array.from(state.token, tk => state.point[tk] ?? 0)
}
