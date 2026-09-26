// The string's store ON THE FLUX (E-SPN-0075 to 0078): n LOCKED STAND-IN tokens on a husk ring of L docks, with
// every link's center flux held as a register and the string's store held as one column of D bulk trits, all in
// exact integers. The rule of code/rule/locked-token-line (cost, meeting, coin, stream), with the paid string of
// E-SPN-0074 read off the flux instead of put in by hand.
//
// THE REGISTERS. A token: its dock x and its role label j (0 and 1 the doublet, 2 the line). A link l (dock l to
// dock l + 1): its center flux f_l in Z_3, one trit, held as the port pair of its end slots (u at the tail, -u at
// the head, E-FRC-0229); the rule reads and writes u. The string's store: one value sigma in -D .. D, a column of
// D bulk trits in the thermometer code (code/rule/plaquette-ladder), held at the string's end port like any
// relation (its mirror port holds -sigma; nothing is held by the string itself).
//
// GAUSS, mod 3 (the center flux, E-FRC-0129, 0144): f_x - f_(x-1) = sum of the charges on dock x, a love +1 and a
// fear -1. Nothing moves: a token that copies itself across link l records the copy on that link, f_l - q going
// forward and f_l + q going back (the recorded hop of E-FRC-0230), so Gauss holds after every copy.
//
// THE STORE. The string's length is the count of links with nonzero flux, l = sum bal(f)^2, which is the exponent
// of the light's own drift term. The store holds sigma = D - l on every state the rule reaches from contact: a copy
// that lengthens the string by one copies one unit out of the column, one that shortens it copies one back, so
// sigma + l is kept. A copy that would push sigma past -D is not made: every token stays and its doublet label
// flips (0 <-> 1, 2 stays), E-SPN-0074's bounce. So the column's range is the string's capacity and l <= 2D.
// Why 2D and not D: the store counts the flux's SQUARES (the drift's exponent), which do not see the flux's sign,
// so one signed column of 2D + 1 values covers the lengths 0 .. 2D. A store holding the signed line integral of
// the flux instead would stop at D.
//
// THE COST. The light's drift term, zeta_M^(-c sum bal(e)^2) (code/rule/plaquette-ladder), read on the string's
// links: zeta_M^(-c l) per beat, c an integer, M = 2 N^2, N = 2D + 1. With c = N (the classical light's own split,
// E-FRC-0207) that is zeta_(2N)^(-l), pi / N per unit of flux per beat, and the longest string the column allows
// costs 2D pi / (2D + 1) < pi: inside the column the cost never wraps.
//
// EXACT ARITHMETIC. Every amplitude lies in Z[x] / (x^K - 1), K = lcm(M, 3), read in Z[zeta_K] (omega = x^(K/3)).
// Every piece multiplies by a uniform integer: the coin 2C per token (2^n), a like meeting 2U (2 per like pair),
// the love-fear meeting 1 ('knit' under C, the identity on the states it reaches) or 3V ('dock'), the cost 1.
//
// Index: ((p 3^n + r) 3^L + f) (2D + 1) + (sigma + D), p the positions (token 0 most significant, base L), r the
// labels (base 3), f the link fluxes (link l the digit of 3^l).

import { stepTable, type Convention, type Vibe } from '@/code/rule/locked-token-line'

export type FluxStoreSpec = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  // D: the store column holds -D .. D
  readonly depth: number
  // c and M: the cost zeta_M^(-c l) per beat (c = 0: no cost)
  readonly cost: number
  readonly root: number
  // no meeting at all (a control)
  readonly meet?: boolean
}

export type FluxRegisters = { x: number[]; j: number[]; f: number[]; sigma: number }

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const chargeOf = (kind: Vibe): number => (kind === 'love' ? 1 : -1)

export const registerSize = (s: FluxStoreSpec): number => s.ring ** s.kinds.length * 3 ** s.kinds.length * 3 ** s.ring * (2 * s.depth + 1)

export function decodeRegisters(s: FluxStoreSpec, index: number): FluxRegisters {
  const n = s.kinds.length
  const L = s.ring
  const levels = 2 * s.depth + 1
  let rest = index
  const sigma = (rest % levels) - s.depth

  rest = Math.floor(rest / levels)

  const f = new Array<number>(L)

  for (let l = 0; l < L; l++) {
    f[l] = rest % 3
    rest = Math.floor(rest / 3)
  }

  const j = new Array<number>(n)

  for (let t = n - 1; t >= 0; t--) {
    j[t] = rest % 3
    rest = Math.floor(rest / 3)
  }

  const x = new Array<number>(n)

  for (let t = n - 1; t >= 0; t--) {
    x[t] = rest % L
    rest = Math.floor(rest / L)
  }

  return { x, j, f, sigma }
}

export function encodeRegisters(s: FluxStoreSpec, r: FluxRegisters): number {
  const n = s.kinds.length
  const L = s.ring
  let p = 0

  for (let t = 0; t < n; t++) p = p * L + r.x[t]!

  let lab = 0

  for (let t = 0; t < n; t++) lab = lab * 3 + r.j[t]!

  let fl = 0

  for (let l = L - 1; l >= 0; l--) fl = fl * 3 + r.f[l]!

  return ((p * 3 ** n + lab) * 3 ** L + fl) * (2 * s.depth + 1) + (r.sigma + s.depth)
}

// l = sum over links of bal(f)^2: the count of links with nonzero center flux
export const stringCount = (f: readonly number[]): number => f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

// Gauss mod 3 at every dock
export function gaussHolds(s: FluxStoreSpec, r: FluxRegisters): boolean {
  const L = s.ring
  const q = new Array<number>(L).fill(0)

  s.kinds.forEach((k, t) => {
    q[r.x[t]!] = q[r.x[t]!]! + chargeOf(k)
  })

  for (let x = 0; x < L; x++) if (mod(r.f[x]! - r.f[mod(x - 1, L)]! - q[x]!, 3) !== 0) return false

  return true
}

const FLIP = [1, 0, 2] as const

// the stream with the store's bounce, as a map of register configurations
export function streamRegisters(s: FluxStoreSpec, r: FluxRegisters): FluxRegisters {
  const L = s.ring
  const y = r.x.slice()
  const f = r.f.slice()

  s.kinds.forEach((k, t) => {
    const step = stepTable(k, s.convention)[r.j[t]!]!
    const q = chargeOf(k)

    if (step === 1) f[r.x[t]!] = mod(f[r.x[t]!]! - q, 3)
    if (step === -1) f[mod(r.x[t]! - 1, L)] = mod(f[mod(r.x[t]! - 1, L)]! + q, 3)

    y[t] = mod(r.x[t]! + step, L)
  })

  const sigma = r.sigma - (stringCount(f) - stringCount(r.f))

  if (sigma < -s.depth || sigma > s.depth) return { x: r.x.slice(), j: r.j.map(v => FLIP[v as 0 | 1 | 2]), f: r.f.slice(), sigma: r.sigma }

  return { x: y, j: r.j.slice(), f, sigma }
}

export const streamIndex = (s: FluxStoreSpec, index: number): number => encodeRegisters(s, streamRegisters(s, decodeRegisters(s, index)))

// the inverse stream: flip every label, stream, flip back (the bounce rule is then its own inverse's mirror)
export function streamIndexBack(s: FluxStoreSpec, index: number): number {
  const r = decodeRegisters(s, index)
  const flipped = { ...r, j: r.j.map(v => FLIP[v as 0 | 1 | 2] as number) }
  const out = streamRegisters(s, flipped)

  return encodeRegisters(s, { ...out, j: out.j.map(v => FLIP[v as 0 | 1 | 2] as number) })
}

// ---------------------------------------------------------------------------------------------------------
// exact amplitudes in Z[x] / (x^K - 1)

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

export const exactRoot = (s: FluxStoreSpec): number => (s.root * 3) / gcd(s.root, 3)

export type ExactState = { readonly spec: FluxStoreSpec; readonly k: number; den: bigint; amp: Map<number, bigint[]> }

// a sum of terms c x^a applied to v, added into out
function addTerms(out: bigint[], v: readonly bigint[], terms: readonly (readonly [bigint, number])[], k: number): void {
  for (const [c, a] of terms) {
    if (c === 0n) continue

    const sh = mod(a, k)

    for (let i = 0; i < k; i++) {
      const x = v[i]!

      if (x !== 0n) out[(i + sh) % k] = out[(i + sh) % k]! + c * x
    }
  }
}

const zero = (k: number): bigint[] => new Array<bigint>(k).fill(0n)

export function exactStart(s: FluxStoreSpec, start: readonly { registers: FluxRegisters; weight: bigint }[]): ExactState {
  const k = exactRoot(s)
  const amp = new Map<number, bigint[]>()

  for (const e of start) {
    const v = zero(k)

    v[0] = e.weight
    amp.set(encodeRegisters(s, e.registers), v)
  }

  return { spec: s, k, den: 1n, amp }
}

// a label operator on the whole role tensor at each non-label configuration: `apply(labels) -> [labels', terms][]`
function labelPiece(st: ExactState, apply: (r: FluxRegisters) => { j: number[]; terms: (readonly [bigint, number])[] }[]): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const r = decodeRegisters(st.spec, i)

    for (const o of apply(r)) {
      const key = encodeRegisters(st.spec, { ...r, j: o.j })
      let target = out.get(key)

      if (!target) {
        target = zero(st.k)
        out.set(key, target)
      }

      addTerms(target, v, o.terms, st.k)
    }
  }

  st.amp = out
}

const meetingScale = (s: FluxStoreSpec): bigint => {
  if (s.meet === false) return 1n

  let scale = 1n
  const n = s.kinds.length

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (s.kinds[a] === s.kinds[b]) scale *= 2n
      else if (s.unlike === 'dock') scale *= 3n
    }
  }

  return scale
}

export const exactBeatScale = (s: FluxStoreSpec): bigint => 2n ** BigInt(s.kinds.length) * meetingScale(s)

function costPiece(st: ExactState, adjoint: boolean): void {
  const s = st.spec

  if (s.cost === 0) return

  const unit = st.k / s.root
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const r = decodeRegisters(s, i)
    const target = zero(st.k)

    addTerms(target, v, [[1n, (adjoint ? 1 : -1) * s.cost * stringCount(r.f) * unit]], st.k)
    out.set(i, target)
  }

  st.amp = out
}

// one pair's meeting, applied in the order a < b: returns the label images of labels j
function meetOne(s: FluxStoreSpec, a: number, b: number, r: FluxRegisters, j: number[], w3: number, adjoint: boolean): { j: number[]; terms: (readonly [bigint, number])[] }[] {
  const like = s.kinds[a] === s.kinds[b]
  const same = r.x[a] === r.x[b]
  const w = adjoint ? -w3 : w3

  if (like) {
    if (!same) return [{ j, terms: [[2n, 0]] }]

    // 2U |ij> = (1 + w)|ij> + (1 - w)|ji>
    const swapped = j.slice()

    swapped[a] = j[b]!
    swapped[b] = j[a]!

    return [
      { j, terms: [[1n, 0], [1n, w]] },
      { j: swapped, terms: [[1n, 0], [-1n, w]] },
    ]
  }

  if (s.unlike === 'knit') return [{ j, terms: [[1n, 0]] }]

  if (!same) return [{ j, terms: [[3n, 0]] }]

  // 3V = 3 + (w - 1) J on the three |kk>
  const out: { j: number[]; terms: (readonly [bigint, number])[] }[] = [{ j, terms: [[3n, 0]] }]

  if (j[a] === j[b]) {
    for (let k = 0; k < 3; k++) {
      const t = j.slice()

      t[a] = k
      t[b] = k
      out.push({ j: t, terms: [[1n, w], [-1n, 0]] })
    }
  }

  return out
}

function meetingPiece(st: ExactState, adjoint: boolean): void {
  const s = st.spec

  if (s.meet === false) return

  const n = s.kinds.length
  const w3 = st.k / 3
  const pairs: [number, number][] = []

  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b])

  // the adjoint applies the pairs in reverse order
  const order = adjoint ? pairs.slice().reverse() : pairs

  for (const [a, b] of order) labelPiece(st, r => meetOne(s, a, b, r, r.j, w3, adjoint))
}

// 2C on each token's (0, 1) labels, 2 on label 2 (2C is symmetric: its adjoint conjugates the entries)
function coinPiece(st: ExactState, adjoint: boolean): void {
  const n = st.spec.kinds.length
  const w = (adjoint ? -1 : 1) * (st.k / 3)

  for (let t = 0; t < n; t++) {
    labelPiece(st, r => {
      const jt = r.j[t]!

      if (jt === 2) return [{ j: r.j, terms: [[2n, 0]] }]

      const same = r.j.slice()
      const other = r.j.slice()

      other[t] = 1 - jt

      return [
        { j: same, terms: [[1n, 0], [1n, w]] },
        { j: other, terms: [[1n, 0], [-1n, w]] },
      ]
    })
  }
}

function streamPiece(st: ExactState, back: boolean): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) out.set(back ? streamIndexBack(st.spec, i) : streamIndex(st.spec, i), v)

  if (out.size !== st.amp.size) throw new Error('flux-store-line: the stream merged two configurations')

  st.amp = out
}

export function exactBeat(st: ExactState): void {
  costPiece(st, false)
  meetingPiece(st, false)
  coinPiece(st, false)
  streamPiece(st, false)
  st.den *= exactBeatScale(st.spec)
}

export function exactBeatBack(st: ExactState): void {
  streamPiece(st, true)
  coinPiece(st, true)
  meetingPiece(st, true)
  costPiece(st, true)
  st.den *= exactBeatScale(st.spec)
}

// the thermometer column of the store: sigma as D trits (the first |sigma| are sign sigma, the rest 0), and back
export function storeColumn(sigma: number, depth: number): Int8Array {
  const t = new Int8Array(depth)

  for (let d = 0; d < Math.abs(sigma); d++) t[d] = Math.sign(sigma)

  return t
}
