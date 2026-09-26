// The pair-making isometric knit: the W(F4)-covariant isometric knit with a covariant pair move paid from an
// oriented line store (E-RLT-0064 to E-RLT-0066).
//
// WHY THE STORE IS ORIENTED (the theorem this rule is built around). A dock map C that commutes with every coin
// map g keeps every state's stabilizer: Stab(x) is inside Stab(C(x)). W(F4) is transitive on the 24 slots, so
// the only dock states it fixes are all calm, all love and all fear, and a charge-keeping C sends the calm dock
// to itself. A store that W(F4) leaves alone (one integer per dock, or one per line with the same value on every
// line) is fixed as well, so the calm dock with any such store is a fixed point: no W(F4)-covariant rule makes a
// pair from the symmetric vacuum, whatever it pays with. A love-fear pair on one line breaks the line's
// orientation (the -1 coin map carries a love on the first slot to a love on the second), so the pair can come
// only from a store that holds that orientation.
//
// THE STORE. Each dock holds one trit per line, tau_l in {-1, 0, +1}, read in the line's own orientation (+1
// toward the first slot, LINE_FIRSTS). A coin map carries it as it carries the line: tau'_(line of g(first l)) =
// side(g(first l)) tau_l. Charge conjugation negates it. It is dock storage, one trit per line of the dock, never
// link storage: it does not stream.
//
// THE PAIR MOVE P, on every line of the dock at once (the lines are disjoint, so the order is immaterial):
//   love on the side sigma, fear on the other, tau = 0   <->   both calm, tau = sigma
// So a calm line whose store holds a unit makes the pair oriented by the store, and a love-fear pair on one line
// (the love on side sigma) is unmade into the store. Every other line state is left alone. P is an involution,
// keeps the charge (the pair is neutral), the occupation momentum (the pair's two roots cancel), every line
// momentum n_l = |first| - |second| (a pair and a calm line both read 0), and the energy
//   E = count + 2 sum_l |tau_l|,
// the pair's two masses against the store's two units. It commutes with every coin map by construction.
//
// THE COLLISION is P K P, K the isometric knit's coin map w(P) (code/rule/isometric-knit). It is an involution
// (P and K are). K keeps charge, count and P; P keeps charge, P and E; so the collision keeps charge, P and E,
// and changes the count by the pairs made or unmade. It commutes with all 1,152 coin maps, and with charge
// conjugation. The beat is the collision then the stream: the stream copies each slot's vibe one dock along its
// root, and the store stays. (K P K, the other palindrome, is useless: P keeps every line momentum, so both K
// apply the same w, and K P K keeps all twelve line momenta, which undoes the isometric scattering. A probe found
// 25 invariants for it, tmp/pair-probe-linear.log.)
//
// THE REVERSAL. With R the -1 coin map on every dock (velocity reversal, which negates the store), R S R = S^-1
// and R C R = C, so (C R) U (C R)^-1 = U^-1 for U = S C: the motion reversal is C R.
//
// NO ROUNDING, NO CONTINUITY: the rule is permutations of trits and a trit store. The control variant
// ('first-mirror') uses the first-mirror coin map for K (E-RLT-0061's control), which keeps every law but not
// W(F4).

import { type Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { firstMirrorTable, isometricTable, LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type PairKnitVariant = 'isometric' | 'first-mirror'

export type PairKnit = {
  readonly mesh: Mesh
  readonly variant: PairKnitVariant
  readonly table: MomentumTable
  // the slot each slot streams into
  readonly target: Int32Array
  // whether the pair move runs (off: the isometric knit with an idle store, a control)
  readonly pairs: boolean
}

// the state: a vibe per slot (dock * 24 + d) and a store trit per line (dock * 12 + l)
export type PairState = {
  readonly vibe: Int8Array
  readonly store: Int8Array
}

export function makePairKnit(input: { mesh: Mesh; variant?: PairKnitVariant; pairs?: boolean }): PairKnit {
  const { mesh } = input
  const variant = input.variant ?? 'isometric'
  const target = new Int32Array(mesh.cellCount * 24)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) target[x * 24 + d] = mesh.neighbour(x, d) * 24 + d
  }

  return { mesh, variant, table: variant === 'first-mirror' ? firstMirrorTable() : isometricTable(), target, pairs: input.pairs ?? true }
}

// the coin map the dock's occupation momentum selects, or undefined for none
export function dockCoinMap(table: MomentumTable, vibe: Int8Array, base: number): Int32Array | undefined {
  let p0 = 0
  let p1 = 0
  let p2 = 0
  let p3 = 0

  for (let d = 0; d < 24; d++) {
    if (vibe[base + d] !== 0) {
      const r = ROOTS[d] as number[]

      p0 += r[0] as number
      p1 += r[1] as number
      p2 += r[2] as number
      p3 += r[3] as number
    }
  }

  return table[momentumKey([p0, p1, p2, p3])]
}

const SCRATCH = new Int8Array(24)
const SCRATCH_TOKEN = new Int32Array(24)

// copy slot d to slot w(d) in one dock, with the tokens riding along when given
export function applyCoinMap(w: Int32Array, vibe: Int8Array, base: number, token?: Int32Array): void {
  for (let d = 0; d < 24; d++) SCRATCH[w[d] as number] = vibe[base + d] as number
  for (let d = 0; d < 24; d++) vibe[base + d] = SCRATCH[d] as number

  if (token) {
    for (let d = 0; d < 24; d++) SCRATCH_TOKEN[w[d] as number] = token[base + d] as number
    for (let d = 0; d < 24; d++) token[base + d] = SCRATCH_TOKEN[d] as number
  }
}

// pairs made and unmade, counted by the pair move when a tally is passed
export type PairTally = { made: number; unmade: number }

// an optional veto per line: the pair move acts on line l of the dock only where it returns true (the neutral
// variant of E-RLT-0066 passes one that reads the two slots' role points)
export type PairVeto = (base: number, l: number) => boolean

// the pair move on every line of one dock
export function pairMove(vibe: Int8Array, base: number, store: Int8Array, lineBase: number, tally?: PairTally, allow?: PairVeto): void {
  for (let l = 0; l < 12; l++) {
    if (allow && !allow(base, l)) continue

    const i = base + (LINE_FIRSTS[l] as number)
    const j = base + (LINE_SECONDS[l] as number)
    const a = vibe[i] as number
    const b = vibe[j] as number
    const tau = store[lineBase + l] as number

    if (tau === 0) {
      if (a !== 0 && b === -a) {
        // a love on the side sigma = a, the fear on the other: unmade into the store
        vibe[i] = 0
        vibe[j] = 0
        store[lineBase + l] = a
        if (tally) tally.unmade++
      }
    } else if (a === 0 && b === 0) {
      vibe[i] = tau
      vibe[j] = -tau
      store[lineBase + l] = 0
      if (tally) tally.made++
    }
  }
}

// the dock collision P K P (its own inverse), tokens riding with their vibes when given
export function pairDockCollide(knit: PairKnit, state: PairState, x: number, token?: Int32Array, tally?: PairTally, allow?: PairVeto): void {
  const base = x * 24

  if (knit.pairs) pairMove(state.vibe, base, state.store, x * 12, tally, allow)

  const w = dockCoinMap(knit.table, state.vibe, base)

  if (w) applyCoinMap(w, state.vibe, base, token)

  if (knit.pairs) pairMove(state.vibe, base, state.store, x * 12, tally, allow)
}

// one beat: collide every dock, then stream. Returns the new state and the pairs made and unmade
export function pairBeat(knit: PairKnit, state: PairState): { state: PairState; made: number; unmade: number } {
  const vibe = Int8Array.from(state.vibe)
  const store = Int8Array.from(state.store)
  const next: PairState = { vibe, store }
  const tally: PairTally = { made: 0, unmade: 0 }

  for (let x = 0; x < knit.mesh.cellCount; x++) pairDockCollide(knit, next, x, undefined, tally)

  const streamed = new Int8Array(vibe.length)

  for (let s = 0; s < vibe.length; s++) streamed[knit.target[s] as number] = vibe[s] as number

  return { state: { vibe: streamed, store }, made: tally.made, unmade: tally.unmade }
}

// one beat backward: unstream, then collide (the collision is its own inverse)
export function pairBeatBack(knit: PairKnit, state: PairState): PairState {
  const vibe = new Int8Array(state.vibe.length)
  const store = Int8Array.from(state.store)

  for (let s = 0; s < vibe.length; s++) vibe[s] = state.vibe[knit.target[s] as number] as number

  const out: PairState = { vibe, store }

  for (let x = 0; x < knit.mesh.cellCount; x++) pairDockCollide(knit, out, x)

  return out
}

// ---- conserved quantities ----

export function pairEnergy(state: PairState): number {
  let e = 0

  for (let i = 0; i < state.vibe.length; i++) e += state.vibe[i] !== 0 ? 1 : 0
  for (let i = 0; i < state.store.length; i++) e += 2 * Math.abs(state.store[i] as number)

  return e
}

export function pairCharge(state: PairState): number {
  let q = 0

  for (let i = 0; i < state.vibe.length; i++) q += state.vibe[i] as number

  return q
}

export function pairCount(state: PairState): number {
  let n = 0

  for (let i = 0; i < state.vibe.length; i++) n += state.vibe[i] !== 0 ? 1 : 0

  return n
}

// the occupation momentum P = sum over held slots of the slot's root
export function pairMomentum(state: PairState): number[] {
  const p = [0, 0, 0, 0]

  for (let i = 0; i < state.vibe.length; i++) {
    if (state.vibe[i] !== 0) {
      const r = ROOTS[i % 24] as number[]

      for (let k = 0; k < 4; k++) p[k] = (p[k] as number) + (r[k] as number)
    }
  }

  return p
}

// ---- symmetries ----

// a coin map g (slot permutation) with a cell map acting on a whole state: slot (x, d) -> (cellMap x, g d), store
// line l of dock x -> line of g(first l) of dock cellMap x, times the side of g(first l); sign -1 composes with
// charge conjugation
export function transformPairState(state: PairState, cellMap: readonly number[], g: readonly number[], sign = 1): PairState {
  const vibe = new Int8Array(state.vibe.length)
  const store = new Int8Array(state.store.length)
  const lineImage = LINE_FIRSTS.map(f => LINE_OF[g[f] as number] as number)
  const lineSign = LINE_FIRSTS.map(f => SIDE[g[f] as number] as number)

  for (let x = 0; x < cellMap.length; x++) {
    const y = cellMap[x] as number

    for (let d = 0; d < 24; d++) vibe[y * 24 + (g[d] as number)] = sign * (state.vibe[x * 24 + d] as number)
    for (let l = 0; l < 12; l++) store[y * 12 + (lineImage[l] as number)] = sign * (lineSign[l] as number) * (state.store[x * 12 + l] as number)
  }

  return { vibe, store }
}

export function samePairState(a: PairState, b: PairState): boolean {
  if (a.vibe.length !== b.vibe.length || a.store.length !== b.store.length) return false

  for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i]) return false
  for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i]) return false

  return true
}

// the motion reversal C R of the beat U = S C: R the -1 coin map on every dock, then the collision
export function motionReversal(knit: PairKnit, state: PairState): PairState {
  const minus = OPPOSITE as readonly number[]
  const identityCells = Array.from({ length: knit.mesh.cellCount }, (_, x) => x)
  const reversed = transformPairState(state, identityCells, minus)

  for (let x = 0; x < knit.mesh.cellCount; x++) pairDockCollide(knit, reversed, x)

  return reversed
}
