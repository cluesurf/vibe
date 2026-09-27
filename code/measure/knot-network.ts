// THE KNOT NETWORK (E-GRV-0083, E-GRV-0084): the EXACT superposed state of a veto-'none' knit, held as a product of
// the components its like meetings have joined, so that the entanglement of any region can be read from the amplitudes.
//
// WHY THIS IS THE RULE'S STATE, NOT A MODEL OF IT. Under the no-veto store (code/rule/occupation-veto-knit, kind 'none')
// no piece of the beat reads a point (the autonomy theorem, E-RLT-0100 T2, read in E-RLT-0103 Q4: one occupation among
// the terms), so the occupation history is one classical history, the same on every term. What the terms differ in is
// the point each vibe carries. A vibe is therefore a REGISTER (a nine-valued point) riding a fixed world line, and the
// beat acts on the registers by exactly three things:
//   the like meeting   on the two registers of a full like line of two open vibes, U = (1 + w)/2 I - (1 - w)/2 SWAP
//                      (keep 1/4, exchange 3/4, equal points the phase w: code/rule/doublet-locked-knit's meeting);
//   the collision      a permutation of which slot or store holds which register (point-blind under 'none');
//   the stream         each register's point taken through its link's grid move (a permutation of nine values).
// A register is named a TOKEN here; tokens are followed through the collision by running the rule's own collideVeto on
// copies of the configuration whose points hold the token numbers in base 9 (the collision carries a point with its
// vibe and a stored word 9 s + q with its line, and reads none of them), so no second copy of the collision exists.
//
// THE STATE. Tokens that no meeting has joined are in a product state (the vacuum starts as one configuration, a
// product of definite points). A meeting joins its two tokens' COMPONENTS into one; a component holds every value
// assignment of its tokens with an Eisenstein amplitude (a + b w) / 2^k, k shared by the component. The whole state is
// the exact tensor product of the components, with no approximation and no independence assumed: components are
// independent because nothing has yet acted on two of them together. The coin (code/rule/coined-locked-knit) acts only
// on a line of ONE open vibe; `halfOpen` counts such lines at every beat, and where it is 0 the coined rule differs
// from this one by the full-line determinants, which depend on the occupation alone and are one global phase.
//
// ENTANGLEMENT OF A REGION. S(A) = sum over components of the entropy of the component's A part: the Schmidt weights of
// its amplitude matrix, rows the A tokens' values, columns the rest. A token belongs to the dock that holds it (its
// slot's dock or its stored line's dock). Exact integers everywhere; floats only in the Schmidt weights (measurement).
//
// NOTHING MOVES: each slot takes its neighbor's value one dock along; a token is a name for the value a line of slots
// takes, beat after beat, never a thing that travels.

import { collideVeto, pairWord, wordFirst, wordSecond, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { cloneConfiguration, streamConfiguration, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { hermitianEigenvaluesTridiagonal } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] as number)

// one knot's entropy in nats, Schmidt weights 3/4 and 1/4
export const KNOT_ENTROPY = -(0.75 * Math.log(0.75) + 0.25 * Math.log(0.25))

// the meeting's numerators over 2 (forward, adjoint): keep (1 + w), -w; exchange -(1 - w), -(2 + w); equal points w
// written over 2 as 2 w, adjoint 2 w^2 = -2 - 2 w
const KEEP: readonly (readonly [bigint, bigint])[] = [
  [1n, 1n],
  [0n, -1n],
]
const EXCHANGE: readonly (readonly [bigint, bigint])[] = [
  [-1n, 1n],
  [-2n, -1n],
]
const PHASE2: readonly (readonly [bigint, bigint])[] = [
  [0n, 2n],
  [-2n, -2n],
]

// (x + y w)(u + v w), w^2 = -1 - w
const mulA = (x: bigint, y: bigint, u: bigint, v: bigint): bigint => x * u - y * v
const mulB = (x: bigint, y: bigint, u: bigint, v: bigint): bigint => x * v + y * u - y * v
const eisensteinNorm = (a: bigint, b: bigint): bigint => a * a - a * b + b * b

// a component: its tokens, and per branch the tokens' values as one base-9 code (member i the digit of 9^i), with the
// amplitude (a + b w) / 2^k; at most 16 members (9^16 < 2^53), a guard never reached in the runs this file serves
export type Component = { members: number[]; codes: number[]; a: bigint[]; b: bigint[]; k: number }

export const MEMBER_LIMIT = 16

const POW9: readonly number[] = Array.from({ length: MEMBER_LIMIT + 1 }, (_, i) => 9 ** i)

// the value of member i in a code
export const digitOf = (code: number, i: number): number => Math.floor(code / (POW9[i] as number)) % 9

export type NetworkTally = { gates: number; equal: number; merges: number; halfOpen: number; halfOpenBeats: number; largest: number; branchesMax: number }

// THE RULE THE NETWORK FOLLOWS (E-GRV-0087). By default the veto knit's collideVeto on a Configuration. A rule with
// registers of its own (code/rule/plaquette-store-knit's units, which hold four vibes' points while stored) supplies
// its clone and collision and its HALVES: one per point a register can hold, each read (-1 when empty) and written, and
// the dock that holds it. The collision must be point-blind, as the veto 'none' is, so every term shares one occupation.
export type NetworkRule = {
  readonly clone: (c: Configuration) => Configuration
  readonly collide: (tables: LockedTables, c: Configuration, t: number, inverse: boolean) => void
  readonly halves: (c: Configuration) => number
  readonly readHalf: (c: Configuration, h: number) => number
  readonly writeHalf: (c: Configuration, h: number, v: number) => void
  readonly dockOfHalf: (h: number) => number
}

const vetoRule = (kind: VetoKind): NetworkRule => ({
  clone: cloneConfiguration,
  collide: (tables, c, t, inverse) => collideVeto(kind, tables, c, t, inverse),
  halves: () => 0,
  readHalf: () => -1,
  writeHalf: () => undefined,
  dockOfHalf: () => -1,
})

export type KnotNetwork = {
  readonly tokens: number
  readonly tables: LockedTables
  readonly kind: VetoKind
  readonly rule: NetworkRule
  // each token's value at beat 0
  readonly initial: Int8Array
  config: Configuration
  slotToken: Int32Array
  storeToken: Int32Array
  // the token on each register half of the rule (empty for the veto rule)
  extraToken: Int32Array
  open: Uint8Array
  comp: Int32Array
  pos: Int32Array
  components: (Component | undefined)[]
  beat: number
  tally: NetworkTally
}

// the network of a configuration: one token per stored unit's two halves (first slot's, second slot's) and per
// occupied slot, each its own component with its one value
export function knotNetwork(kind: VetoKind, tables: LockedTables, start: Configuration, rule: NetworkRule = vetoRule(kind)): KnotNetwork {
  // the 'point' and 'pairing' vetoes read points, so their occupation differs between terms: not a network
  if (kind !== 'none' && kind !== 'occupation') throw new Error(`knot-network: the veto '${kind}' reads points; the network holds only a point-blind rule`)

  const config = rule.clone(start)
  const slotToken = new Int32Array(config.vibe.length).fill(-1)
  const storeToken = new Int32Array(config.store.length * 2).fill(-1)
  const values: number[] = []
  const opens: number[] = []

  for (let l = 0; l < config.store.length; l++) {
    if (config.store[l] === 0) continue

    const w = config.spoint[l] as number
    const o = config.sopen[l] as number

    storeToken[2 * l] = values.length
    values.push(wordFirst(w))
    opens.push(o & 1)
    storeToken[2 * l + 1] = values.length
    values.push(wordSecond(w))
    opens.push((o >> 1) & 1)
  }

  for (let s = 0; s < config.vibe.length; s++) {
    if (config.vibe[s] === 0) continue
    slotToken[s] = values.length
    values.push(config.point[s] as number)
    opens.push(config.open[s] as number)
  }

  // a register half's token is open (the runs this serves open every vibe; a closed stored vibe would need its bit)
  const extraToken = new Int32Array(rule.halves(config)).fill(-1)

  for (let h = 0; h < extraToken.length; h++) {
    const v = rule.readHalf(config, h)

    if (v < 0) continue
    extraToken[h] = values.length
    values.push(v)
    opens.push(1)
  }

  const tokens = values.length
  const components: (Component | undefined)[] = values.map((v, t) => ({ members: [t], codes: [v], a: [1n], b: [0n], k: 0 }))

  return {
    tokens,
    tables,
    kind,
    rule,
    initial: Int8Array.from(values),
    config,
    slotToken,
    storeToken,
    extraToken,
    open: Uint8Array.from(opens),
    comp: Int32Array.from({ length: tokens }, (_, t) => t),
    pos: new Int32Array(tokens),
    components,
    beat: 0,
    tally: { gates: 0, equal: 0, merges: 0, halfOpen: 0, halfOpenBeats: 0, largest: 1, branchesMax: 1 },
  }
}

function merge(n: KnotNetwork, ci: number, cj: number): number {
  const A = n.components[ci] as Component
  const B = n.components[cj] as Component

  if (A.members.length + B.members.length > MEMBER_LIMIT) throw new Error(`knot-network: a component of ${A.members.length + B.members.length} tokens, over the guard ${MEMBER_LIMIT}`)

  const shift = POW9[A.members.length] as number
  const codes: number[] = []
  const a: bigint[] = []
  const b: bigint[] = []

  for (let p = 0; p < A.codes.length; p++) {
    for (let q = 0; q < B.codes.length; q++) {
      codes.push((A.codes[p] as number) + (B.codes[q] as number) * shift)
      a.push(mulA(A.a[p] as bigint, A.b[p] as bigint, B.a[q] as bigint, B.b[q] as bigint))
      b.push(mulB(A.a[p] as bigint, A.b[p] as bigint, B.a[q] as bigint, B.b[q] as bigint))
    }
  }

  const members = [...A.members, ...B.members]

  members.forEach((t, i) => {
    n.comp[t] = ci
    n.pos[t] = i
  })
  n.components[ci] = { members, codes, a, b, k: A.k + B.k }
  n.components[cj] = undefined
  n.tally.merges++

  return ci
}

function reduce(c: Component): void {
  while (c.k > 0 && c.a.every(x => x % 2n === 0n) && c.b.every(x => x % 2n === 0n)) {
    for (let i = 0; i < c.a.length; i++) {
      c.a[i] = (c.a[i] as bigint) / 2n
      c.b[i] = (c.b[i] as bigint) / 2n
    }

    c.k--
  }
}

// the meeting on tokens ti, tj (forward, or its adjoint for the inverse beat)
function gate(n: KnotNetwork, ti: number, tj: number, adjoint: boolean): void {
  let ci = n.comp[ti] as number
  const cj = n.comp[tj] as number

  if (ci !== cj) ci = merge(n, ci, cj)

  const c = n.components[ci] as Component
  const pi = n.pos[ti] as number
  const pj = n.pos[tj] as number
  const side = adjoint ? 1 : 0
  const [ku, kv] = KEEP[side] as [bigint, bigint]
  const [eu, ev] = EXCHANGE[side] as [bigint, bigint]
  const [qu, qv] = PHASE2[side] as [bigint, bigint]
  const index = new Map<number, number>()
  const codes: number[] = []
  const a: bigint[] = []
  const b: bigint[] = []
  const add = (code: number, x: bigint, y: bigint): void => {
    const at = index.get(code)

    if (at === undefined) {
      index.set(code, codes.length)
      codes.push(code)
      a.push(x)
      b.push(y)
    } else {
      a[at] = (a[at] as bigint) + x
      b[at] = (b[at] as bigint) + y
    }
  }
  const wi = POW9[pi] as number
  const wj = POW9[pj] as number

  for (let r = 0; r < c.codes.length; r++) {
    const code = c.codes[r] as number
    const x = c.a[r] as bigint
    const y = c.b[r] as bigint
    const vi = digitOf(code, pi)
    const vj = digitOf(code, pj)

    if (vi === vj) {
      add(code, mulA(x, y, qu, qv), mulB(x, y, qu, qv))
      if (!adjoint) n.tally.equal++
      continue
    }

    add(code, mulA(x, y, ku, kv), mulB(x, y, ku, kv))
    add(code + (vj - vi) * wi + (vi - vj) * wj, mulA(x, y, eu, ev), mulB(x, y, eu, ev))
  }

  const keep = a.map((x, i) => x !== 0n || b[i] !== 0n)

  c.codes = codes.filter((_, i) => keep[i])
  c.a = a.filter((_, i) => keep[i])
  c.b = b.filter((_, i) => keep[i])
  c.k++
  reduce(c)

  if (!adjoint) {
    n.tally.gates++
    n.tally.largest = Math.max(n.tally.largest, c.members.length)
    n.tally.branchesMax = Math.max(n.tally.branchesMax, c.codes.length)
  }
}

// every full like line of two open vibes: [first token, second token]
function meetingsOf(n: KnotNetwork): [number, number][] {
  const c = n.config
  const out: [number, number][] = []

  for (let x = 0; x < n.tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (LINE_SECONDS[l] as number)
      const vi = c.vibe[i] as number

      if (vi === 0 || vi !== c.vibe[j]) continue

      const ti = n.slotToken[i] as number
      const tj = n.slotToken[j] as number

      if (n.open[ti] && n.open[tj]) out.push([ti, tj])
    }
  }

  return out
}

// lines holding exactly one open vibe (where the coin would split a position)
function halfOpenLines(n: KnotNetwork): number {
  const c = n.config
  let count = 0

  for (let x = 0; x < n.tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (LINE_SECONDS[l] as number)
      const hi = c.vibe[i] !== 0
      const hj = c.vibe[j] !== 0

      if (hi !== hj && n.open[(hi ? n.slotToken[i] : n.slotToken[j]) as number]) count++
    }
  }

  return count
}

// the collision's action on the token names: the rule's own collideVeto on base-9 digit copies
function collideTokens(n: KnotNetwork, t: number, inverse: boolean): void {
  const digits = Math.max(1, Math.ceil(Math.log(Math.max(2, n.tokens)) / Math.log(9)))
  const slotNext = new Int32Array(n.slotToken.length).fill(-1)
  const storeNext = new Int32Array(n.storeToken.length).fill(-1)
  const extraNext = new Int32Array(n.extraToken.length).fill(-1)
  let scale = 1

  for (let d = 0; d < digits; d++) {
    const copy = n.rule.clone(n.config)
    const digit = (token: number): number => Math.floor(token / scale) % 9

    for (let s = 0; s < copy.vibe.length; s++) if (copy.vibe[s] !== 0) copy.point[s] = digit(n.slotToken[s] as number)
    for (let l = 0; l < copy.store.length; l++) if (copy.store[l] !== 0) copy.spoint[l] = pairWord(digit(n.storeToken[2 * l] as number), digit(n.storeToken[2 * l + 1] as number))
    for (let h = 0; h < n.extraToken.length; h++) if ((n.extraToken[h] as number) >= 0) n.rule.writeHalf(copy, h, digit(n.extraToken[h] as number))

    n.rule.collide(n.tables, copy, t, inverse)

    for (let s = 0; s < copy.vibe.length; s++) if (copy.vibe[s] !== 0) slotNext[s] = (d === 0 ? 0 : (slotNext[s] as number)) + (copy.point[s] as number) * scale
    for (let l = 0; l < copy.store.length; l++) {
      if (copy.store[l] === 0) continue

      const w = copy.spoint[l] as number

      storeNext[2 * l] = (d === 0 ? 0 : (storeNext[2 * l] as number)) + wordFirst(w) * scale
      storeNext[2 * l + 1] = (d === 0 ? 0 : (storeNext[2 * l + 1] as number)) + wordSecond(w) * scale
    }

    for (let h = 0; h < extraNext.length; h++) {
      const v = n.rule.readHalf(copy, h)

      if (v >= 0) extraNext[h] = (d === 0 ? 0 : (extraNext[h] as number)) + v * scale
    }

    scale *= 9
  }

  n.rule.collide(n.tables, n.config, t, inverse)

  for (let s = 0; s < slotNext.length; s++) if ((n.config.vibe[s] !== 0) !== (slotNext[s] !== -1)) throw new Error('knot-network: a digit copy of the collision left another occupation')
  for (let h = 0; h < extraNext.length; h++) if ((n.rule.readHalf(n.config, h) >= 0) !== (extraNext[h] !== -1)) throw new Error('knot-network: a digit copy of the collision left other registers')

  n.slotToken = slotNext
  n.storeToken = storeNext
  n.extraToken = extraNext
}

// every branch of the token's component: its value taken through a permutation of the nine points
function permuteToken(n: KnotNetwork, token: number, perm: Int8Array, at: number): void {
  const c = n.components[n.comp[token] as number] as Component
  const p = n.pos[token] as number
  const w = POW9[p] as number

  for (let r = 0; r < c.codes.length; r++) {
    const code = c.codes[r] as number
    const v = digitOf(code, p)

    c.codes[r] = code + ((perm[at + v] as number) - v) * w
  }
}

function streamTokens(n: KnotNetwork, inverse: boolean): void {
  const { target, source, move, back } = n.tables
  const next = new Int32Array(n.slotToken.length).fill(-1)

  for (let s = 0; s < n.slotToken.length; s++) {
    const token = n.slotToken[s] as number

    if (token < 0) continue

    const to = (inverse ? source[s] : target[s]) as number

    next[to] = token
    permuteToken(n, token, inverse ? back : move, s * 9)
  }

  n.slotToken = next
  streamConfiguration(n.tables, n.config, inverse)
}

// one beat t = n.beat: the meetings, the collision, the stream
export function networkBeat(n: KnotNetwork): void {
  const half = halfOpenLines(n)

  n.tally.halfOpen += half
  n.tally.halfOpenBeats += half > 0 ? 1 : 0

  for (const [ti, tj] of meetingsOf(n)) gate(n, ti, tj, false)

  collideTokens(n, n.beat, false)
  streamTokens(n, false)
  n.beat++
}

// the exact inverse of the last beat
export function networkBeatBack(n: KnotNetwork): void {
  n.beat--
  streamTokens(n, true)
  collideTokens(n, n.beat, true)

  for (const [ti, tj] of meetingsOf(n)) gate(n, ti, tj, true)
}

// every live component
export const componentsOf = (n: KnotNetwork): Component[] => n.components.filter((c): c is Component => c !== undefined)

// sum over branches of N(a + b w) against 4^k, per component: true when every component is exactly normalized
export function networkNormExact(n: KnotNetwork): boolean {
  return componentsOf(n).every(c => c.a.reduce((s, x, i) => s + eisensteinNorm(x, c.b[i] as bigint), 0n) === 1n << BigInt(2 * c.k))
}

// after as many inverse beats as beats: every component one branch of amplitude exactly 1, every token on its beat-0
// value, and every token back on its beat-0 slot or store
export function networkReturned(n: KnotNetwork, start: KnotNetwork): boolean {
  if (n.beat !== 0) return false

  for (let s = 0; s < n.slotToken.length; s++) if (n.slotToken[s] !== start.slotToken[s]) return false
  for (let h = 0; h < n.storeToken.length; h++) if (n.storeToken[h] !== start.storeToken[h]) return false
  for (let h = 0; h < n.extraToken.length; h++) if (n.extraToken[h] !== start.extraToken[h]) return false

  return componentsOf(n).every(c => c.codes.length === 1 && c.a[0] === 1n && c.b[0] === 0n && c.k === 0 && c.members.every((t, i) => digitOf(c.codes[0] as number, i) === n.initial[t]))
}

// the network against the rule's own superposed state (a LockedState of the same rule on the same start): the joint
// amplitudes of the open tokens (the tensor product of their components) equal the rule's branch amplitudes up to one
// global unit, branch for branch, read through the tokens' slots and stored words. Closed tokens never split, so the
// rule's branches differ only on open tokens. For a check on starts with few open tokens (the product is formed)
export function sameAsBranches(n: KnotNetwork, s: LockedState): boolean {
  const open: number[] = []

  for (let t = 0; t < n.tokens; t++) if (n.open[t]) open.push(t)

  let joint: { key: number[]; a: bigint; b: bigint; k: number }[] = [{ key: [], a: 1n, b: 0n, k: 0 }]

  for (const ci of [...new Set(open.map(t => n.comp[t] as number))]) {
    const c = n.components[ci] as Component
    const next: typeof joint = []

    for (const j of joint) {
      c.codes.forEach((code, r) => {
        const key = [...j.key]

        c.members.forEach((t, i) => {
          if (n.open[t]) key[open.indexOf(t)] = digitOf(code, i)
        })
        next.push({ key, a: mulA(j.a, j.b, c.a[r] as bigint, c.b[r] as bigint), b: mulB(j.a, j.b, c.a[r] as bigint, c.b[r] as bigint), k: j.k + c.k })
      })
    }

    joint = next
  }

  if (joint.length !== s.branches.length) return false

  const slotOf = new Map<number, number>()
  const halfOf = new Map<number, number>()

  for (let x = 0; x < n.slotToken.length; x++) if ((n.slotToken[x] as number) >= 0) slotOf.set(n.slotToken[x] as number, x)
  for (let h = 0; h < n.storeToken.length; h++) if ((n.storeToken[h] as number) >= 0) halfOf.set(n.storeToken[h] as number, h)

  const byKey = new Map(joint.map(j => [j.key.join(','), j]))
  let ref: { ra: bigint; rb: bigint; rk: number; na: bigint; nb: bigint; nk: number } | undefined

  for (const b of s.branches) {
    const key = open.map(t => {
      const x = slotOf.get(t)

      if (x !== undefined) return b.point[x] as number

      const h = halfOf.get(t) as number
      const w = b.spoint[h >> 1] as number

      return h % 2 === 0 ? wordFirst(w) : wordSecond(w)
    })
    const j = byKey.get(key.join(','))

    if (!j) return false

    if (!ref) {
      ref = { ra: b.a, rb: b.b, rk: b.k, na: j.a, nb: j.b, nk: j.k }
      continue
    }

    // rule_i net_0 = rule_0 net_i, on a common power of two
    const e1 = b.k + ref.nk
    const e2 = ref.rk + j.k
    const m = Math.max(e1, e2)

    if (mulA(b.a, b.b, ref.na, ref.nb) << BigInt(m - e1) !== mulA(ref.ra, ref.rb, j.a, j.b) << BigInt(m - e2)) return false
    if (mulB(b.a, b.b, ref.na, ref.nb) << BigInt(m - e1) !== mulB(ref.ra, ref.rb, j.a, j.b) << BigInt(m - e2)) return false
  }

  return true
}

// the dock holding each token now
export function tokenDocks(n: KnotNetwork): Int32Array {
  const out = new Int32Array(n.tokens).fill(-1)

  for (let s = 0; s < n.slotToken.length; s++) if ((n.slotToken[s] as number) >= 0) out[n.slotToken[s] as number] = Math.floor(s / 24)
  for (let h = 0; h < n.storeToken.length; h++) if ((n.storeToken[h] as number) >= 0) out[n.storeToken[h] as number] = Math.floor(h / 24)
  for (let h = 0; h < n.extraToken.length; h++) if ((n.extraToken[h] as number) >= 0) out[n.extraToken[h] as number] = n.rule.dockOfHalf(h)

  return out
}

// the slot each token's line is read at now (a slot token its own slot; a line store's half the first slot of its line;
// a register half, through `slotOfHalf`, the first slot of the line it will be released onto), -1 where none is given
export function tokenSlots(n: KnotNetwork, slotOfHalf?: (c: Configuration, h: number) => number): Int32Array {
  const out = new Int32Array(n.tokens).fill(-1)

  for (let s = 0; s < n.slotToken.length; s++) if ((n.slotToken[s] as number) >= 0) out[n.slotToken[s] as number] = s
  for (let h = 0; h < n.storeToken.length; h++) {
    if ((n.storeToken[h] as number) < 0) continue

    const line = h >> 1

    out[n.storeToken[h] as number] = Math.floor(line / 12) * 24 + (LINE_FIRSTS[line % 12] as number)
  }

  if (slotOfHalf) for (let h = 0; h < n.extraToken.length; h++) if ((n.extraToken[h] as number) >= 0) out[n.extraToken[h] as number] = slotOfHalf(n.config, h)

  return out
}

// the value each token holds on a one-branch component (undefined where a token's component has several branches)
export function tokenValues(n: KnotNetwork): (number | undefined)[] {
  return Array.from({ length: n.tokens }, (_, t) => {
    const c = n.components[n.comp[t] as number] as Component

    return c.codes.length === 1 ? digitOf(c.codes[0] as number, n.pos[t] as number) : undefined
  })
}

export type RegionEntropy = { entropy: number; cut: number; knots: number; rowsMax: number }

// the entropy (nats) of a component's members marked by `mask` (bit i for member i) against its other members: the
// eigenvalues of rho = M M^dagger, M the amplitude matrix with the smaller side as rows; and that side's size
export function componentEntropy(c: Component, mask: number): { entropy: number; rows: number } {
  const m = c.members.length
  // the code's digits on the members of one side (as a code of their own)
  const sideKey = (code: number, want: number): number => {
    let key = 0
    let w = 1

    for (let i = 0; i < m; i++) {
      if (((mask >> i) & 1) !== want) continue
      key += digitOf(code, i) * w
      w *= 9
    }

    return key
  }
  const rIndex = new Map<number, number>()
  const cIndex = new Map<number, number>()

  for (const code of c.codes) {
    const r = sideKey(code, 1)
    const q = sideKey(code, 0)

    if (!rIndex.has(r)) rIndex.set(r, rIndex.size)
    if (!cIndex.has(q)) cIndex.set(q, cIndex.size)
  }

  const flip = rIndex.size > cIndex.size
  const nr = flip ? cIndex.size : rIndex.size
  const nc = flip ? rIndex.size : cIndex.size
  const mr = new Float64Array(nr * nc)
  const mi = new Float64Array(nr * nc)
  const scale = 2 ** -c.k
  const half = Math.sqrt(3) / 2

  c.codes.forEach((code, i) => {
    const r = rIndex.get(sideKey(code, 1)) as number
    const q = cIndex.get(sideKey(code, 0)) as number
    const x = Number(c.a[i] as bigint)
    const y = Number(c.b[i] as bigint)
    const at = flip ? q * nc + r : r * nc + q

    mr[at] = (mr[at] as number) + (x - y / 2) * scale
    mi[at] = (mi[at] as number) + y * half * scale
  })

  // rho = M M^dagger
  const hr = new Float64Array(nr * nr)
  const hi = new Float64Array(nr * nr)

  for (let p = 0; p < nr; p++) {
    for (let q = p; q < nr; q++) {
      let sr = 0
      let si = 0

      for (let s = 0; s < nc; s++) {
        const ar = mr[p * nc + s] as number
        const ai = mi[p * nc + s] as number
        const br = mr[q * nc + s] as number
        const bi = mi[q * nc + s] as number

        sr += ar * br + ai * bi
        si += ai * br - ar * bi
      }

      hr[p * nr + q] = sr
      hi[p * nr + q] = si
      hr[q * nr + p] = sr
      hi[q * nr + p] = -si
    }
  }

  let entropy = 0

  for (const l of hermitianEigenvaluesTridiagonal(nr, hr, hi)) if (l > 1e-15) entropy -= l * Math.log(l)

  return { entropy, rows: nr }
}

// the entanglement entropy (nats) of the tokens `inside` marks against the rest, summed over the components it cuts.
// `knots` counts the cut components of exactly two tokens (a lone knot). `cache` (one per beat: the state must not
// change while it is used) keeps each (component, mask) entropy, since many regions cut one component alike
export function regionEntropy(n: KnotNetwork, inside: (token: number) => boolean, cache?: Map<number, { entropy: number; rows: number }>): RegionEntropy {
  let entropy = 0
  let cut = 0
  let knots = 0
  let rowsMax = 0

  n.components.forEach((c, ci) => {
    if (!c || c.members.length < 2) return

    let mask = 0

    c.members.forEach((t, i) => {
      if (inside(t)) mask |= 1 << i
    })

    if (mask === 0 || mask === (1 << c.members.length) - 1) return
    cut++
    if (c.members.length === 2) knots++

    // a cut and its complement have one entropy: key the one holding member 0
    const canonical = mask & 1 ? mask : (1 << c.members.length) - 1 - mask
    const key = ci * 65536 + canonical
    let e = cache?.get(key)

    if (!e) {
      e = componentEntropy(c, canonical)
      cache?.set(key, e)
    }

    entropy += e.entropy
    rowsMax = Math.max(rowsMax, e.rows)
  })

  return { entropy, cut, knots, rowsMax }
}

// ---- husk regions ----

// a region of husk columns on the side^3 husk torus: its columns, its volume and its area (unit faces between a
// column inside and one outside across the six axis links)
export type HuskRegion = { readonly name: string; readonly inside: Uint8Array; readonly volume: number; readonly area: number }

export function huskRegion(name: string, side: number, member: (c0: number, c1: number, c2: number) => boolean): HuskRegion {
  const inside = new Uint8Array(side ** 3)
  const at = (a: number, b: number, c: number): number => ((a + side) % side) + side * ((b + side) % side) + side * side * ((c + side) % side)
  let volume = 0
  let area = 0

  for (let c = 0; c < side; c++) for (let b = 0; b < side; b++) for (let a = 0; a < side; a++) inside[at(a, b, c)] = member(a, b, c) ? 1 : 0

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        const v = inside[at(a, b, c)] as number

        volume += v
        area += v !== inside[at(a + 1, b, c)] ? 1 : 0
        area += v !== inside[at(a, b + 1, c)] ? 1 : 0
        area += v !== inside[at(a, b, c + 1)] ? 1 : 0
      }
    }
  }

  return { name, inside, volume, area }
}

// the region family of the area-law readings, every size up to half the box (a pure state gives a region and its
// complement one entropy, so past half a size repeats a smaller one): slabs of width w across each axis (area 2 side^2
// for every w, volume w side^2), rods of a x a through the box along each axis (area 4 a side, volume a^2 side), cubes
// of a at the corner and at (1, 2, 3) (area 6 a^2, volume a^3)
export function huskRegionFamily(side: number): HuskRegion[] {
  const out: HuskRegion[] = []
  const half = Math.floor(side / 2)

  for (let axis = 0; axis < 3; axis++) {
    for (let w = 1; w <= half; w++) out.push(huskRegion(`slab${axis}-${w}`, side, (a, b, c) => ([a, b, c][axis] as number) < w))
    for (let w = 1; w <= half; w++) out.push(huskRegion(`rod${axis}-${w}`, side, (a, b, c) => [a, b, c].filter((_, k) => k !== axis).every(v => v < w)))
  }

  for (const o of [
    [0, 0, 0],
    [1, 2, 3],
  ]) {
    for (let w = 1; w <= half; w++) out.push(huskRegion(`cube${o.join('')}-${w}`, side, (a, b, c) => [a, b, c].every((v, k) => (v - (o[k] as number) + side) % side < w)))
  }

  return out
}

// a cube of a about a husk column (its low corner floor(a / 2) steps below the column on every axis)
export function huskCubeAbout(side: number, column: number, a: number): HuskRegion {
  const at = [column % side, Math.floor(column / side) % side, Math.floor(column / (side * side))]

  return huskRegion(`about-${a}`, side, (x, y, z) => [x, y, z].every((v, k) => (v - (at[k] as number) + Math.floor(a / 2) + side) % side < a))
}
