// The string paid by the light's drift ALONE (E-SPN-0086, 0087): n LOCKED STAND-IN tokens on a husk ring of L docks,
// every link's center flux a trit, and NO store. The rule of code/rule/flux-store-line with the store and its bounce
// taken out: nothing is counted, nothing is capped, and the only thing the string does is cost.
//
// THE REGISTERS. A token: its dock x and its role label j (0 and 1 the doublet, 2 the line). A link l (dock l to
// dock l + 1): its center flux f_l in Z_3, one trit, held as the port pair of its end slots (E-FRC-0229). There is
// no other register: no store, no reel, no count.
//
// GAUSS, mod 3: f_x - f_(x-1) = the charge on dock x (a love +1, a fear -1). A token that copies itself across
// link l records the copy there (f_l - q forward, f_l + q back, the recorded hop of E-FRC-0230), so Gauss holds
// after every copy. With no store there is no bounce: every copy is made, and the stream is a permutation of ALL
// register configurations.
//
// THE COST. Each link multiplies the amplitude by its own drift phase zeta_M^(-c bal(f_l)^2) every beat
// (code/rule/plaquette-ladder's drift term read on the link). With c = N and M = 2 N^2, N = 2D + 1 the light's
// column (E-FRC-0207, 0245), that is zeta_(2N)^(-1) on every link that holds flux, pi / N per link per beat. The
// product over links is zeta_(2N)^(-l), l the number of links with flux. Each factor reads one link and nothing else.
//
// EXACT ARITHMETIC. Every amplitude lies in Z[x] / (x^K - 1), K = lcm(M, 3), read in Z[zeta_K]. Every piece
// multiplies by a uniform integer: the coin 2C per token (2^n), a like meeting 2U (2 per like pair), the love-fear
// meeting 1 ('knit' under C) or 3V ('dock'), the cost 1.
//
// Index: ((p 3^n + r) 3^L + f), p the positions (token 0 most significant, base L), r the labels (base 3), f the
// link fluxes (link l the digit of 3^l).

import {
  stepTable,
  type Convention,
  type Vibe,
} from '@/code/rule/locked-token-line'

export type DriftCostSpec = {
  readonly ring: number
  readonly kinds: readonly Vibe[]
  readonly convention: Convention
  readonly unlike: 'knit' | 'dock'
  // c and M: the cost zeta_M^(-c bal(f)^2) per link per beat (c = 0: no cost)
  readonly cost: number
  readonly root: number
  readonly meet?: boolean
}

export type DriftRegisters = { x: number[]; j: number[]; f: number[] }

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const chargeOf = (kind: Vibe): number =>
  kind === 'love' ? 1 : -1

export const registerCount = (s: DriftCostSpec): number =>
  s.ring ** s.kinds.length * 3 ** s.kinds.length * 3 ** s.ring

export function decodeDrift(
  s: DriftCostSpec,
  index: number,
): DriftRegisters {
  const n = s.kinds.length
  const L = s.ring

  let rest = index

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

  return { x, j, f }
}

export function encodeDrift(
  s: DriftCostSpec,
  r: DriftRegisters,
): number {
  const n = s.kinds.length
  const L = s.ring

  let p = 0

  for (let t = 0; t < n; t++) {
    p = p * L + r.x[t]!
  }

  let lab = 0

  for (let t = 0; t < n; t++) {
    lab = lab * 3 + r.j[t]!
  }

  let fl = 0

  for (let l = L - 1; l >= 0; l--) {
    fl = fl * 3 + r.f[l]!
  }

  return (p * 3 ** n + lab) * 3 ** L + fl
}

// l = sum over links of bal(f)^2: the number of links with nonzero center flux
export const fluxLinks = (f: readonly number[]): number =>
  f.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

export function gaussHoldsDrift(
  s: DriftCostSpec,
  r: DriftRegisters,
): boolean {
  const L = s.ring
  const q = new Array<number>(L).fill(0)

  s.kinds.forEach((k, t) => {
    q[r.x[t]!] = q[r.x[t]!]! + chargeOf(k)
  })

  for (let x = 0; x < L; x++) {
    if (mod(r.f[x]! - r.f[mod(x - 1, L)]! - q[x]!, 3) !== 0) {
      return false
    }
  }

  return true
}

// tokens placed on an arc that does not cross the ring's seam: the Gauss flux with none outside the arc
export function placedDrift(
  s: DriftCostSpec,
  x: readonly number[],
  j: readonly number[],
): DriftRegisters {
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
      'drift-cost-line: the placed tokens are not a center singlet',
    )
  }

  return { x: x.slice(), j: j.slice(), f }
}

// the stream: every token copied by its label's step, the copy recorded on the crossed link; no bounce
export function streamDrift(
  s: DriftCostSpec,
  r: DriftRegisters,
): DriftRegisters {
  const L = s.ring
  const y = r.x.slice()
  const f = r.f.slice()

  s.kinds.forEach((k, t) => {
    const step = stepTable(k, s.convention)[r.j[t]!]!
    const q = chargeOf(k)

    if (step === 1) {
      f[r.x[t]!] = mod(f[r.x[t]!]! - q, 3)
    }

    if (step === -1) {
      f[mod(r.x[t]! - 1, L)] = mod(f[mod(r.x[t]! - 1, L)]! + q, 3)
    }

    y[t] = mod(r.x[t]! + step, L)
  })

  return { x: y, j: r.j.slice(), f }
}

// the inverse stream: every token copied back by its label's step, the record undone
export function streamDriftBack(
  s: DriftCostSpec,
  r: DriftRegisters,
): DriftRegisters {
  const L = s.ring
  const y = r.x.slice()
  const f = r.f.slice()

  s.kinds.forEach((k, t) => {
    const step = stepTable(k, s.convention)[r.j[t]!]!
    const q = chargeOf(k)
    const from = mod(r.x[t]! - step, L)

    if (step === 1) {
      f[from] = mod(f[from]! + q, 3)
    }

    if (step === -1) {
      f[mod(from - 1, L)] = mod(f[mod(from - 1, L)]! - q, 3)
    }

    y[t] = from
  })

  return { x: y, j: r.j.slice(), f }
}

// ---------------------------------------------------------------------------------------------------------
// exact amplitudes in Z[x] / (x^K - 1)

const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b)

export const driftRoot = (s: DriftCostSpec): number =>
  (s.root * 3) / gcd(s.root, 3)

export type DriftExact = {
  readonly spec: DriftCostSpec
  readonly k: number
  den: bigint
  amp: Map<number, bigint[]>
}

function addTerms(
  out: bigint[],
  v: readonly bigint[],
  terms: readonly (readonly [bigint, number])[],
  k: number,
): void {
  for (const [c, a] of terms) {
    if (c === 0n) {
      continue
    }

    const sh = mod(a, k)

    for (let i = 0; i < k; i++) {
      const x = v[i]!

      if (x !== 0n) {
        out[(i + sh) % k] = out[(i + sh) % k]! + c * x
      }
    }
  }
}

const zero = (k: number): bigint[] => new Array<bigint>(k).fill(0n)

export function driftStart(
  s: DriftCostSpec,
  start: readonly { registers: DriftRegisters; weight: bigint }[],
): DriftExact {
  const k = driftRoot(s)
  const amp = new Map<number, bigint[]>()

  for (const e of start) {
    const v = zero(k)

    v[0] = e.weight
    amp.set(encodeDrift(s, e.registers), v)
  }

  return { spec: s, k, den: 1n, amp }
}

function labelPiece(
  st: DriftExact,
  apply: (
    r: DriftRegisters,
  ) => { j: number[]; terms: (readonly [bigint, number])[] }[],
): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const r = decodeDrift(st.spec, i)

    for (const o of apply(r)) {
      const key = encodeDrift(st.spec, { ...r, j: o.j })

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

const meetingScale = (s: DriftCostSpec): bigint => {
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

export const driftBeatScale = (s: DriftCostSpec): bigint =>
  2n ** BigInt(s.kinds.length) * meetingScale(s)

// the cost: one factor per link, each reading that link's own flux trit
function costPiece(st: DriftExact, adjoint: boolean): void {
  const s = st.spec

  if (s.cost === 0) {
    return
  }

  const unit = st.k / s.root
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const r = decodeDrift(s, i)

    let exponent = 0

    for (let l = 0; l < s.ring; l++) {
      exponent += r.f[l] === 0 ? 0 : 1
    }

    const target = zero(st.k)

    addTerms(
      target,
      v,
      [[1n, (adjoint ? 1 : -1) * s.cost * exponent * unit]],
      st.k,
    )
    out.set(i, target)
  }

  st.amp = out
}

function meetOne(
  s: DriftCostSpec,
  a: number,
  b: number,
  r: DriftRegisters,
  j: number[],
  w3: number,
  adjoint: boolean,
): { j: number[]; terms: (readonly [bigint, number])[] }[] {
  const like = s.kinds[a] === s.kinds[b]
  const same = r.x[a] === r.x[b]
  const w = adjoint ? -w3 : w3

  if (like) {
    if (!same) {
      return [{ j, terms: [[2n, 0]] }]
    }

    const swapped = j.slice()

    swapped[a] = j[b]!
    swapped[b] = j[a]!

    return [
      {
        j,
        terms: [
          [1n, 0],
          [1n, w],
        ],
      },
      {
        j: swapped,
        terms: [
          [1n, 0],
          [-1n, w],
        ],
      },
    ]
  }

  if (s.unlike === 'knit') {
    return [{ j, terms: [[1n, 0]] }]
  }

  if (!same) {
    return [{ j, terms: [[3n, 0]] }]
  }

  const out: { j: number[]; terms: (readonly [bigint, number])[] }[] = [
    { j, terms: [[3n, 0]] },
  ]

  if (j[a] === j[b]) {
    for (let k = 0; k < 3; k++) {
      const t = j.slice()

      t[a] = k
      t[b] = k
      out.push({
        j: t,
        terms: [
          [1n, w],
          [-1n, 0],
        ],
      })
    }
  }

  return out
}

function meetingPiece(st: DriftExact, adjoint: boolean): void {
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
    labelPiece(st, r => meetOne(s, a, b, r, r.j, w3, adjoint))
  }
}

function coinPiece(st: DriftExact, adjoint: boolean): void {
  const n = st.spec.kinds.length
  const w = (adjoint ? -1 : 1) * (st.k / 3)

  for (let t = 0; t < n; t++) {
    labelPiece(st, r => {
      const jt = r.j[t]!

      if (jt === 2) {
        return [{ j: r.j, terms: [[2n, 0]] }]
      }

      const same = r.j.slice()
      const other = r.j.slice()

      other[t] = 1 - jt

      return [
        {
          j: same,
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

function streamPiece(st: DriftExact, back: boolean): void {
  const out = new Map<number, bigint[]>()

  for (const [i, v] of st.amp) {
    const r = decodeDrift(st.spec, i)

    out.set(
      encodeDrift(
        st.spec,
        back ? streamDriftBack(st.spec, r) : streamDrift(st.spec, r),
      ),
      v,
    )
  }

  if (out.size !== st.amp.size) {
    throw new Error(
      'drift-cost-line: the stream merged two configurations',
    )
  }

  st.amp = out
}

export function driftBeat(st: DriftExact): void {
  costPiece(st, false)
  meetingPiece(st, false)
  coinPiece(st, false)
  streamPiece(st, false)
  st.den *= driftBeatScale(st.spec)
}

export function driftBeatBack(st: DriftExact): void {
  streamPiece(st, true)
  coinPiece(st, true)
  meetingPiece(st, true)
  costPiece(st, true)
  st.den *= driftBeatScale(st.spec)
}
