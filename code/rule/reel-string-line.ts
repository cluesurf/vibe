// The string's store held at the string's ENDS (E-SPN-0081, 0082): n LOCKED STAND-IN tokens on a husk ring of L
// docks, every link's center flux a recorded trit (as in code/rule/flux-store-line), and each token's own column of
// D bulk trits its REEL: the string that token has paid out or taken back. Nothing is held at a port and nothing is
// read farther than the link a copy crosses.
//
// WHY THE ENDS (E-SPN-0081 proves each step). On a line, Gauss fixes every link's flux to the charge on one side of
// it, whatever the separation, so no bound on a link's own registers, or on any finite window of them, can tell a
// string of length 2D from one of length 2D + 1: a per-link bound confines everything or nothing. Confinement at a
// range needs a COUNT. E-SPN-0075's count sits at one port and its bounce reads the other end of the string in the
// same beat, up to 2D docks away, which no husk-local rule can do. A count that a growing end pays from in one beat
// must sit within one dock of that end, and the end of a string is a charge. So the count sits on the charges: each
// token's own column. This is the yo-yo string: each end carries what it has paid out, and the ends trade it only
// through the string's length.
//
// THE REGISTERS. A token: its dock x, its role label j (0 and 1 the doublet, copied forward and back, 2 the line,
// not copied), and its reel r in -D .. D, a column of D bulk trits in the thermometer code, starting calm (r = 0).
// A link l (dock l to dock l + 1): its center flux f_l in Z_3, held as the port pair of its end slots (E-FRC-0229).
//
// THE STREAM. Each token's label says which link its copy would cross (forward: link x, back: link x - 1, the line:
// none). The tokens that would cross one link form that link's GROUP. A group's copy records the crossings on the
// link (f - q forward, f + q back, so Gauss mod 3 holds after every copy), and changes the string count l (the links
// with nonzero flux, the exponent of the light's drift) by Delta = [f' != 0] - [f != 0] in -1 .. 1. The group's
// members pay Delta in EQUAL SHARES of whole half-links from their reels: each reel moves by -2 Delta / k, k the
// group's size. A group that cannot pay (a share that is not a whole half-link, or a reel pushed past -D or D) is
// not copied: its members stay and flip their doublet labels (0 <-> 1, 2 stays), E-SPN-0074's bounce, now decided
// per link. Equal shares are the only split that does not order two identical tokens crossing together, which is
// why the unit is a half-link. Every decision reads one link's flux, the tokens on its two docks and their reels.
//
// KEPT: sum of reels + 2 l, exactly, on every copy. From contact (every reel calm, no flux) the reels hold -2 l in
// total, each at least -D, so l <= floor(n D / 2): the columns are the string's capacity, held at its ends. A lone
// end pays a whole link (two half-links), so it pulls floor(D / 2) links: a love-fear pair reaches 2 floor(D / 2),
// three loves (two of which can cross together, a half-link each) reach floor(3D / 2) (E-SPN-0081).
//
// THE COST AND THE MEETINGS are code/rule/flux-store-line's, unchanged: the light's drift zeta_M^(-c l) per beat
// (each link with flux contributes its own factor, so it is local), two loves on one dock meet through 2U, a love
// and a fear through the knit's meeting ('knit', the identity on the states C reaches) or 3V ('dock'), and the coin
// 2C. 2U's swap exchanges the two vibes' whole contents, role and reel (the reel is the vibe's own column), so on
// the exchange-antisymmetric states it is 2 omega per like pair on a dock, as before: a swap of the roles alone
// would not commute with relabeling three identical tokens once their reels differ. Every amplitude lies in
// Z[x] / (x^K - 1), K = lcm(M, 3).
//
// Index: (((p 3^n + lab) 3^L + fl) (2D + 1)^n + reels), p the positions (token 0 most significant, base L), lab the
// labels (base 3), fl the link fluxes (link l the digit of 3^l), reels (token 0 most significant, digit r + D).

import {
  stepTable,
  type Convention,
  type Vibe,
} from '@/code/rule/locked-token-line'

export type ReelSpec = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  // D: each reel is a column of D trits, -D .. D half-links
  readonly depth: number
  // c and M: the cost zeta_M^(-c l) per beat (c = 0: no cost)
  readonly cost: number
  readonly root: number
  readonly meet?: boolean
}

export type ReelRegisters = {
  x: number[]
  j: number[]
  f: number[]
  r: number[]
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const chargeOf = (kind: Vibe): number =>
  kind === 'love' ? 1 : -1

export const reelLevels = (s: ReelSpec): number => 2 * s.depth + 1

export const registerSize = (s: ReelSpec): number =>
  s.ring ** s.kinds.length *
  3 ** s.kinds.length *
  3 ** s.ring *
  reelLevels(s) ** s.kinds.length

export function decodeRegisters(
  s: ReelSpec,
  index: number,
): ReelRegisters {
  const n = s.kinds.length
  const L = s.ring
  const V = reelLevels(s)

  let rest = index

  const r = new Array<number>(n)

  for (let t = n - 1; t >= 0; t--) {
    r[t] = (rest % V) - s.depth
    rest = Math.floor(rest / V)
  }

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

  return { x, j, f, r }
}

export function encodeRegisters(s: ReelSpec, g: ReelRegisters): number {
  const n = s.kinds.length
  const L = s.ring
  const V = reelLevels(s)

  let p = 0

  for (let t = 0; t < n; t++) {
    p = p * L + g.x[t]!
  }

  let lab = 0

  for (let t = 0; t < n; t++) {
    lab = lab * 3 + g.j[t]!
  }

  let fl = 0

  for (let l = L - 1; l >= 0; l--) {
    fl = fl * 3 + g.f[l]!
  }

  let reels = 0

  for (let t = 0; t < n; t++) {
    reels = reels * V + (g.r[t]! + s.depth)
  }

  return ((p * 3 ** n + lab) * 3 ** L + fl) * V ** n + reels
}

// l: the count of links with nonzero center flux
export const stringCount = (f: readonly number[]): number =>
  f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

export const reelSum = (r: readonly number[]): number =>
  r.reduce((a, v) => a + v, 0)

export function gaussHolds(s: ReelSpec, g: ReelRegisters): boolean {
  const L = s.ring
  const q = new Array<number>(L).fill(0)

  s.kinds.forEach((k, t) => {
    q[g.x[t]!] = q[g.x[t]!]! + chargeOf(k)
  })

  for (let x = 0; x < L; x++) {
    if (mod(g.f[x]! - g.f[mod(x - 1, L)]! - q[x]!, 3) !== 0) {
      return false
    }
  }

  return true
}

// tokens placed on an arc that does not cross the seam (dock L - 1 to dock 0): the Gauss flux with none outside the
// arc, and the given reels (calm when omitted, which is the contact start's value)
export function placedRegisters(
  s: ReelSpec,
  x: readonly number[],
  j: readonly number[],
  r?: readonly number[],
): ReelRegisters {
  const f = new Array<number>(s.ring).fill(0)

  let cum = 0

  for (let l = 0; l < s.ring; l++) {
    s.kinds.forEach((k, t) => {
      if (x[t] === l) {
        cum += chargeOf(k)
      }
    })
    f[l] = mod(cum, 3)
  }

  if (f[s.ring - 1] !== 0) {
    throw new Error(
      'reel-string-line: the placed tokens are not a center singlet',
    )
  }

  return {
    x: x.slice(),
    j: j.slice(),
    f,
    r: r ? r.slice() : new Array<number>(s.kinds.length).fill(0),
  }
}

const FLIP = [1, 0, 2] as const

// the stream with the per-link groups and their bounces, as a map of register configurations
export function streamRegisters(
  s: ReelSpec,
  g: ReelRegisters,
): ReelRegisters {
  const L = s.ring
  const n = s.kinds.length
  const x = g.x.slice()
  const j = g.j.slice()
  const f = g.f.slice()
  const r = g.r.slice()
  const steps = g.j.map(
    (lab, t) => stepTable(s.kinds[t]!, s.convention)[lab]!,
  )
  // the link each token would cross, or -1
  const crossing = steps.map((st, t) =>
    st === 1 ? g.x[t]! : st === -1 ? mod(g.x[t]! - 1, L) : -1,
  )
  const done = new Array<boolean>(n).fill(false)

  for (let t = 0; t < n; t++) {
    if (done[t] || crossing[t]! < 0) {
      continue
    }

    const link = crossing[t]!
    const group: number[] = []

    for (let u = 0; u < n; u++) {
      if (crossing[u] === link) {
        group.push(u)
      }
    }

    group.forEach(u => {
      done[u] = true
    })

    let fNew = g.f[link]!

    for (const u of group) {
      fNew = mod(fNew - steps[u]! * chargeOf(s.kinds[u]!), 3)
    }

    const delta = (fNew === 0 ? 0 : 1) - (g.f[link] === 0 ? 0 : 1)
    const k = group.length
    const whole = (2 * delta) % k === 0
    const share = whole ? (2 * delta) / k : 0
    const fits =
      whole &&
      group.every(
        u => g.r[u]! - share >= -s.depth && g.r[u]! - share <= s.depth,
      )

    if (!fits) {
      for (const u of group) {
        j[u] = FLIP[g.j[u] as 0 | 1 | 2]
      }

      continue
    }

    f[link] = fNew

    for (const u of group) {
      x[u] = mod(g.x[u]! + steps[u]!, L)
      r[u] = g.r[u]! - share
    }
  }

  return { x, j, f, r }
}

export const streamIndex = (s: ReelSpec, index: number): number =>
  encodeRegisters(s, streamRegisters(s, decodeRegisters(s, index)))

// the inverse stream: flip every label, stream, flip back
export function streamIndexBack(s: ReelSpec, index: number): number {
  const g = decodeRegisters(s, index)
  const out = streamRegisters(s, {
    ...g,
    j: g.j.map(v => FLIP[v as 0 | 1 | 2] as number),
  })

  return encodeRegisters(s, {
    ...out,
    j: out.j.map(v => FLIP[v as 0 | 1 | 2] as number),
  })
}

// ---------------------------------------------------------------------------------------------------------
// exact amplitudes in Z[x] / (x^K - 1)

const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b)

export const exactRoot = (s: ReelSpec): number =>
  (s.root * 3) / gcd(s.root, 3)

export type ExactReelState = {
  readonly spec: ReelSpec
  readonly k: number
  den: bigint
  amp: Map<number, bigint[]>
}

type Term = readonly [bigint, number]

function addTerms(
  out: bigint[],
  v: readonly bigint[],
  terms: readonly Term[],
  k: number,
): void {
  for (const [c, a] of terms) {
    if (c === 0n) {
      continue
    }

    const sh = mod(a, k)

    for (let i = 0; i < k; i++) {
      const y = v[i]!

      if (y !== 0n) {
        out[(i + sh) % k] = out[(i + sh) % k]! + c * y
      }
    }
  }
}

const zero = (k: number): bigint[] => new Array<bigint>(k).fill(0n)

export function exactReelStart(
  s: ReelSpec,
  start: readonly { registers: ReelRegisters; weight: bigint }[],
): ExactReelState {
  const k = exactRoot(s)
  const amp = new Map<number, bigint[]>()

  for (const e of start) {
    const v = zero(k)

    v[0] = e.weight
    amp.set(encodeRegisters(s, e.registers), v)
  }

  return { spec: s, k, den: 1n, amp }
}

function labelPiece(
  st: ExactReelState,
  apply: (g: ReelRegisters) => { j: number[]; terms: Term[] }[],
): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const g = decodeRegisters(st.spec, i)

    for (const o of apply(g)) {
      const key = encodeRegisters(st.spec, { ...g, j: o.j })

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

const meetingScale = (s: ReelSpec): bigint => {
  if (s.meet === false) {
    return 1n
  }

  let scale = 1n

  const n = s.kinds.length

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (s.kinds[a] === s.kinds[b]) {
        scale *= 2n
      } else if (s.unlike === 'dock') {
        scale *= 3n
      }
    }
  }

  return scale
}

export const exactReelBeatScale = (s: ReelSpec): bigint =>
  2n ** BigInt(s.kinds.length) * meetingScale(s)

function costPiece(st: ExactReelState, adjoint: boolean): void {
  const s = st.spec

  if (s.cost === 0) {
    return
  }

  const unit = st.k / s.root
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const target = zero(st.k)

    addTerms(
      target,
      v,
      [
        [
          1n,
          (adjoint ? 1 : -1) *
            s.cost *
            stringCount(decodeRegisters(s, i).f) *
            unit,
        ],
      ],
      st.k,
    )
    out.set(i, target)
  }

  st.amp = out
}

// one pair's meeting. Two like vibes on one dock: 2U = (1 + w) + (1 - w) SWAP, where SWAP exchanges the two vibes'
// whole contents (role and reel: the reel is the vibe's own column), so on the exchange-antisymmetric states that
// identical fermions hold it is 2 omega, as in E-SPN-0072 to 0077. A love and a fear: the knit's meeting or 3V.
function meetOne(
  s: ReelSpec,
  a: number,
  b: number,
  g: ReelRegisters,
  w3: number,
  adjoint: boolean,
): { g: ReelRegisters; terms: Term[] }[] {
  const like = s.kinds[a] === s.kinds[b]
  const same = g.x[a] === g.x[b]
  const w = adjoint ? -w3 : w3

  if (like) {
    if (!same) {
      return [{ g, terms: [[2n, 0]] }]
    }

    const j = g.j.slice()
    const r = g.r.slice()

    j[a] = g.j[b]!
    j[b] = g.j[a]!
    r[a] = g.r[b]!
    r[b] = g.r[a]!

    return [
      {
        g,
        terms: [
          [1n, 0],
          [1n, w],
        ],
      },
      {
        g: { ...g, j, r },
        terms: [
          [1n, 0],
          [-1n, w],
        ],
      },
    ]
  }

  if (s.unlike === 'knit') {
    return [{ g, terms: [[1n, 0]] }]
  }

  if (!same) {
    return [{ g, terms: [[3n, 0]] }]
  }

  const out: { g: ReelRegisters; terms: Term[] }[] = [
    { g, terms: [[3n, 0]] },
  ]

  if (g.j[a] === g.j[b]) {
    for (let k = 0; k < 3; k++) {
      const t = g.j.slice()

      t[a] = k
      t[b] = k
      out.push({
        g: { ...g, j: t },
        terms: [
          [1n, w],
          [-1n, 0],
        ],
      })
    }
  }

  return out
}

function registerPiece(
  st: ExactReelState,
  apply: (g: ReelRegisters) => { g: ReelRegisters; terms: Term[] }[],
): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    for (const o of apply(decodeRegisters(st.spec, i))) {
      const key = encodeRegisters(st.spec, o.g)

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

function meetingPiece(st: ExactReelState, adjoint: boolean): void {
  const s = st.spec

  if (s.meet === false) {
    return
  }

  const n = s.kinds.length
  const w3 = st.k / 3
  const pairs: [number, number][] = []

  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      pairs.push([a, b])
    }
  }

  const order = adjoint ? pairs.slice().reverse() : pairs

  for (const [a, b] of order) {
    registerPiece(st, g => meetOne(s, a, b, g, w3, adjoint))
  }
}

function coinPiece(st: ExactReelState, adjoint: boolean): void {
  const n = st.spec.kinds.length
  const w = (adjoint ? -1 : 1) * (st.k / 3)

  for (let t = 0; t < n; t++) {
    labelPiece(st, g => {
      const jt = g.j[t]!

      if (jt === 2) {
        return [{ j: g.j, terms: [[2n, 0]] }]
      }

      const other = g.j.slice()

      other[t] = 1 - jt

      return [
        {
          j: g.j.slice(),
          terms: [
            [1n, 0],
            [1n, w],
          ],
        },
        {
          j: other,
          terms: [
            [1n, 0],
            [-1n, w],
          ],
        },
      ]
    })
  }
}

function streamPiece(st: ExactReelState, back: boolean): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    out.set(
      back ? streamIndexBack(st.spec, i) : streamIndex(st.spec, i),
      v,
    )
  }

  if (out.size !== st.amp.size) {
    throw new Error(
      'reel-string-line: the stream merged two configurations',
    )
  }

  st.amp = out
}

export function exactReelBeat(st: ExactReelState): void {
  costPiece(st, false)
  meetingPiece(st, false)
  coinPiece(st, false)
  streamPiece(st, false)
  st.den *= exactReelBeatScale(st.spec)
}

export function exactReelBeatBack(st: ExactReelState): void {
  streamPiece(st, true)
  coinPiece(st, true)
  meetingPiece(st, true)
  costPiece(st, true)
  st.den *= exactReelBeatScale(st.spec)
}
