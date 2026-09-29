// The frame mixer lifted to a dock's whole occupation (E-SPN-0096): the second-quantized lift Gamma(U) of a one-vibe
// map U on the knit's fermion modes (one vibe a slot, the modes ordered as code/rule/coined-locked-knit modeIndex), and
// the three ways it can carry a vibe's content when a frame holds two contents.
//
// THE SPACE. A dock's occupation is a 24-bit mask (bit d: slot d holds a vibe). Gamma(U) sends e_S (the wedge of the
// occupied modes in mode order) to sum_T det U[T, S] e_T (rows T, columns S, both in mode order): the exterior powers.
// A slot map g acts SIGNED (the knit's canonical fermionic lift: e_S -> sign e_(g S), the sign the parity of the
// occupied modes' reordering) or UNSIGNED (the configuration code's literal permutation).
//
// FOR G = I - (1/4) J on each frame (J all ones on the frame's eight slots): Gamma(G) = 1 - (1/4) sum_(i, j in frame)
// c_i^dag c_j = (-1)^(N_u). On a frame of n vibes it keeps with (4 - n)/4 and takes one vibe to one empty frame slot
// with -1/4 times (-1)^(occupied modes strictly between the two slots). Here it is written by that formula (liftDock)
// and checked against the minors.
//
// CONTENT. A term of Gamma(G) moves at most one vibe, so a frame of ONE content lifts with no choice. With two
// contents (a love and a fear) three constructions are read: species-blind with the content carried by the moving
// vibe (hopContent), species by species (a love field and a fear field, which puts two vibes on one slot), and
// species-blind with the contents assigned by rank in mode order (rankContent).
//
// Exact: integer numerators over powers of 4 (Z[1/2]); Eisenstein integers over 2^p for the ring unitaries, BigInt
// where a product can grow.

import { modeIndex, FRAME_SLOTS } from '@/code/rule/coined-locked-knit'
import { eMul, eSub, type Eis } from '@/code/measure/covariant-coin'

export const MODE: readonly number[] = Array.from(
  { length: 24 },
  (_, d) => modeIndex(d),
)

// a dock's occupation fits in 24 bits
const bit = (d: number): number => 1 << d
const has = (m: number, d: number): boolean => ((m >>> d) & 1) === 1

export const slotsOfMask = (m: number): number[] => {
  const out: number[] = []

  for (let d = 0; d < 24; d++) {
    if (has(m, d)) {
      out.push(d)
    }
  }

  return out
}

// the slots in mode order
const MODE_ORDER: readonly number[] = Array.from(
  { length: 24 },
  (_, d) => d,
).sort((p, q) => MODE[p]! - MODE[q]!)
const SEQ = new Int32Array(24)

// a slot map on an occupation, signed (fermionic: the parity of the occupied modes' reordering) or not
export function act(
  g: readonly number[],
  m: number,
  signed: boolean,
): { mask: number; sign: number } {
  let mask = 0
  let n = 0

  for (const d of MODE_ORDER) {
    if (!has(m, d)) {
      continue
    }

    const e = g[d]!

    mask |= bit(e)
    SEQ[n++] = MODE[e]!
  }

  let inv = 0

  if (signed) {
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (SEQ[p]! > SEQ[q]!) {
          inv++
        }
      }
    }
  }

  return { mask, sign: inv % 2 === 0 ? 1 : -1 }
}

// (-1)^(occupied modes strictly between `from` and `to`)
export function hopSignMask(
  m: number,
  from: number,
  to: number,
): number {
  const lo = Math.min(MODE[from]!, MODE[to]!)
  const hi = Math.max(MODE[from]!, MODE[to]!)

  let between = 0

  for (let d = 0; d < 24; d++) {
    if (has(m, d) && MODE[d]! > lo && MODE[d]! < hi) {
      between++
    }
  }

  return between % 2 === 0 ? 1 : -1
}

const addTo = (
  map: Map<number, number>,
  k: number,
  v: number,
): void => {
  const n = (map.get(k) ?? 0) + v

  if (n === 0) {
    map.delete(k)
  } else {
    map.set(k, n)
  }
}

// Gamma(G) on a dock occupation (every vibe of one content): numerators over 64 (4 per frame). `signs` false drops the
// fermion sign of the hops (the hard-core boson version, a control)
export function liftDock(
  mask: number,
  signs = true,
): Map<number, number> {
  let terms = new Map<number, number>([[mask, 1]])

  for (let f = 0; f < 3; f++) {
    const ss = FRAME_SLOTS[f]!
    const next = new Map<number, number>()

    for (const [m, a] of terms) {
      const held = ss.filter(d => has(m, d))
      const n = held.length

      if (n === 0) {
        addTo(next, m, 4 * a)
        continue
      }

      if (n !== 4) {
        addTo(next, m, (4 - n) * a)
      }

      for (const from of held) {
        for (const to of ss) {
          if (has(m, to)) {
            continue
          }

          addTo(
            next,
            m - bit(from) + bit(to),
            -(signs ? hopSignMask(m, from, to) : 1) * a,
          )
        }
      }
    }

    terms = next
  }

  return terms
}

export const sameMap = (
  a: Map<number | string, number>,
  b: Map<number | string, number>,
): boolean =>
  a.size === b.size && [...a].every(([k, v]) => b.get(k) === v)

// Gamma(G) against a slot map: g Gamma(x) and Gamma(g x) on one occupation
export function liftCommutes(
  g: readonly number[],
  m: number,
  signed: boolean,
): boolean {
  const img = act(g, m, signed)
  const left = new Map<number, number>()

  for (const [t, a] of liftDock(img.mask)) {
    left.set(t, a * img.sign)
  }

  const right = new Map<number, number>()

  for (const [t, a] of liftDock(m)) {
    const i = act(g, t, signed)

    addTo(right, i.mask, a * i.sign)
  }

  return sameMap(left, right)
}

// ---- exact determinants ----

// det of a square integer matrix (BigInt, Bareiss)
export function detInt(rows: readonly (readonly number[])[]): bigint {
  const n = rows.length

  if (n === 0) {
    return 1n
  }

  const a = rows.map(r => r.map(v => BigInt(v)))

  let sign = 1n
  let prev = 1n

  for (let k = 0; k < n - 1; k++) {
    if (a[k]![k] === 0n) {
      const p = a.findIndex((r, i) => i > k && r[k] !== 0n)

      if (p < 0) {
        return 0n
      }

      ;[a[k], a[p]] = [a[p]!, a[k]!]
      sign = -sign
    }

    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        a[i]![j] =
          (a[i]![j]! * a[k]![k]! - a[i]![k]! * a[k]![j]!) / prev
      }

      a[i]![k] = 0n
    }

    prev = a[k]![k]!
  }

  return sign * a[n - 1]![n - 1]!
}

// det of a square Eisenstein matrix (Laplace along the first row, memoized on the columns left)
export function detEis(
  entry: (i: number, j: number) => Eis,
  rows: readonly number[],
  cols: readonly number[],
): Eis {
  const memo = new Map<number, Eis>()
  const n = rows.length

  const go = (r: number, used: number): Eis => {
    if (r === n) {
      return [1, 0]
    }

    const hit = memo.get(used)

    if (hit) {
      return hit
    }

    let s: Eis = [0, 0]
    let seen = 0

    for (let c = 0; c < n; c++) {
      if ((used >> c) & 1) {
        continue
      }

      const term = eMul(
        entry(rows[r]!, cols[c]!),
        go(r + 1, used | (1 << c)),
      )

      s =
        seen % 2 === 0
          ? [s[0] + term[0], s[1] + term[1]]
          : eSub(s, term)
      seen++
    }

    memo.set(used, s)

    return s
  }

  return go(0, 0)
}

export const eNormBig = (z: Eis): bigint =>
  BigInt(z[0]) * BigInt(z[0]) -
  BigInt(z[0]) * BigInt(z[1]) +
  BigInt(z[1]) * BigInt(z[1])

// ---- two contents in one frame: a love on slot a, a fear on slot b ----

export type Labelled = Map<string, number>

const key = (love: number, fear: number): string => `${love},${fear}`

// species-blind, the content carried by the moving vibe: numerators over 4
export function hopContent(love: number, fear: number): Labelled {
  const f = FRAME_SLOTS.findIndex(ss => ss.includes(love))
  const ss = FRAME_SLOTS[f]!
  const m = bit(love) + bit(fear)
  const out: Labelled = new Map([[key(love, fear), 2]])

  for (const to of ss) {
    if (to === love || to === fear) {
      continue
    }

    out.set(key(to, fear), -hopSignMask(m, love, to))
    out.set(key(love, to), -hopSignMask(m, fear, to))
  }

  return out
}

// species-blind, the contents assigned by rank in mode order: det G[T, S] over 16 on every pair T of the frame
export function rankContent(love: number, fear: number): Labelled {
  const f = FRAME_SLOTS.findIndex(ss => ss.includes(love))
  const ss = FRAME_SLOTS[f]!
  const S = [love, fear].sort((p, q) => MODE[p]! - MODE[q]!)
  const loveFirst = S[0] === love
  const g = (i: number, j: number): number => (i === j ? 4 : 0) - 1
  const out: Labelled = new Map()

  for (const t1 of ss) {
    for (const t2 of ss) {
      if (MODE[t1]! >= MODE[t2]!) {
        continue
      }

      const d = Number(
        detInt([
          [g(t1, S[0]!), g(t1, S[1]!)],
          [g(t2, S[0]!), g(t2, S[1]!)],
        ]),
      )

      if (d !== 0) {
        out.set(loveFirst ? key(t1, t2) : key(t2, t1), d)
      }
    }
  }

  return out
}

// a slot map on a love-and-fear configuration, signed
export function actLabelled(
  g: readonly number[],
  x: Labelled,
): Labelled {
  const out: Labelled = new Map()

  for (const [k, v] of x) {
    const [love, fear] = k.split(',').map(Number) as [number, number]
    const before = MODE[love]! < MODE[fear]!
    const after = MODE[g[love]!]! < MODE[g[fear]!]!

    out.set(key(g[love]!, g[fear]!), before === after ? v : -v)
  }

  return out
}

export const innerLabelled = (x: Labelled, y: Labelled): number =>
  [...x].reduce((s, [k, v]) => s + v * (y.get(k) ?? 0), 0)
