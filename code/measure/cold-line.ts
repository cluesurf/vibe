// THE COLD LINE (B3). B1's dense line engine (E-SLF-0182,
// test/experiment/selves/attraction-in-a-bath) made reusable and carried to lines of up to 32 docks, closed or open.
//
// THE SECTOR. n loves on the 2L modes of one husk line (mode 2x + 1 the forward label 0, 2x the back label 1, the line
// block's order of code/rule/bound-line-pieces), ranked in colex order, held as two 32-bit words a configuration, times
// the cut trit c when the line is CLOSED (a ring: the cut-trit Gauss form f_l = c + Q(l), E-SPN-0103's drift cost).
//
// OPEN. An open line is a ring of L docks that no love crosses at its far link: then it is the infinite line exactly,
// since the cost reads every link with flux c + Q(l) and the far link's flux stays c = 0 (no love has crossed it, and
// the sector is neutral mod 3). The engine drops the cut trit there and reports, every beat, the weight on every
// configuration that would cross the far link at the next stream: exactly 0 while the run is the infinite line.
//
// THE BEAT (B1's): the cost zeta_14^(-links) and the full docks' phase w^2 (a = 28 of 42), the coin on every dock with
// one love (keep (1 + w)/2 ... as floats, B1's KEEP and CROSS), the line block's sign, the stream. With `split` the
// coin is D P D (D = C^(1/2): keep (2 + w)/2, cross -w/2); P is diagonal and constant on each coin pair,
// so the two agree, which the experiment checks.
//
// THE READING (B1's): F = sum_X <B_X^dag B_X>, B_X annihilating a trio in the level's relative state anchored at X,
// with its string (the cut trit left behind is c + the loves it carries past the cut). Indexed by the window of modes
// the level spans, so a read costs a few lookups per configuration.
//
// NOTHING MOVES the rule: every map here is B1's, in floats, as B1's I1 checked against E-SPN-0104's ring form.

import type { Placed } from '@/code/measure/held-cluster'

const SQ3 = Math.sqrt(3)

// [keep, cross], each [re, im]
export type Coin = readonly [readonly [number, number], readonly [number, number]]

export const FULL_COIN: Coin = [
  [0.25, SQ3 / 4],
  [0.75, -SQ3 / 4],
]
export const HALF_COIN: Coin = [
  [0.75, SQ3 / 4],
  [0.25, -SQ3 / 4],
]

const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) =>
  Math.cos((2 * Math.PI * a) / TURN),
)
const SIN = Float64Array.from({ length: TURN }, (_, a) =>
  Math.sin((2 * Math.PI * a) / TURN),
)
const MAX_N = 10

export function popcount(v: number): number {
  let x = v - ((v >>> 1) & 0x55555555)

  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333)
  x = (x + (x >>> 4)) & 0x0f0f0f0f

  return Math.imul(x, 0x01010101) >>> 24
}

// ---- two-word masks ----

export type Mask = [number, number]

const bitOf = (lo: number, hi: number, m: number): number =>
  m < 32 ? (lo >>> m) & 1 : (hi >>> (m - 32)) & 1

// the number of set modes below m
function below(lo: number, hi: number, m: number): number {
  if (m <= 0) {
    return 0
  }

  if (m < 32) {
    return popcount(lo & ((1 << m) - 1))
  }

  if (m === 32) {
    return popcount(lo)
  }

  if (m >= 64) {
    return popcount(lo) + popcount(hi)
  }

  return popcount(lo) + popcount(hi & ((1 << (m - 32)) - 1))
}

const setBit = (k: Mask, m: number): void => {
  if (m < 32) {
    k[0] |= 1 << m
  } else {
    k[1] |= 1 << (m - 32)
  }
}

// len <= 16 bits from mode s (s + len <= 64)
function extract(lo: number, hi: number, s: number, len: number): number {
  let v: number

  if (s === 0) {
    v = lo
  } else if (s >= 32) {
    v = hi >>> (s - 32)
  } else {
    v = (lo >>> s) | (hi << (32 - s))
  }

  return v & ((1 << len) - 1)
}

// the same, cyclic on 2L modes
function cyclic(
  lo: number,
  hi: number,
  modes: number,
  s: number,
  len: number,
): number {
  if (s + len <= modes) {
    return extract(lo, hi, s, len)
  }

  const first = modes - s

  return (
    extract(lo, hi, s, first) | (extract(lo, hi, 0, len - first) << first)
  )
}

// ---- the sector ----

export type LineSpace = {
  L: number
  n: number
  count: number
  lo: Int32Array
  hi: Int32Array
  binom: Float64Array[]
}

export function binomials(top: number): Float64Array[] {
  const C: Float64Array[] = []

  for (let a = 0; a <= top; a++) {
    C.push(new Float64Array(MAX_N + 2))
    C[a]![0] = 1

    for (let b = 1; b <= Math.min(a, MAX_N + 1); b++) {
      C[a]![b] = C[a - 1]![b - 1]! + (b <= a - 1 ? C[a - 1]![b]! : 0)
    }
  }

  return C
}

export function lineSpace(L: number, n: number): LineSpace {
  if (L > 32 || n > MAX_N || n < 1) {
    throw new Error(`cold-line: L ${L} and n ${n} out of range`)
  }

  const binom = binomials(2 * L)
  const count = binom[2 * L]![n]!
  const lo = new Int32Array(count)
  const hi = new Int32Array(count)
  const pos = Int32Array.from({ length: n }, (_, i) => i)

  for (let r = 0; r < count; r++) {
    let a = 0
    let b = 0

    for (let i = 0; i < n; i++) {
      const p = pos[i]!

      if (p < 32) {
        a |= 1 << p
      } else {
        b |= 1 << (p - 32)
      }
    }

    lo[r] = a
    hi[r] = b

    // the colex successor
    let i = 0

    while (i < n - 1 && pos[i]! + 1 === pos[i + 1]!) {
      i++
    }

    pos[i]!++

    for (let j = 0; j < i; j++) {
      pos[j] = j
    }
  }

  return { L, n, count, lo, hi, binom }
}

// the colex rank of any mask (any number of loves), with the space's binomials
export function rankOf(binom: Float64Array[], lo: number, hi: number): number {
  let r = 0
  let i = 0
  let m = lo

  while (m !== 0) {
    const low = m & -m

    i++
    r += binom[31 - Math.clz32(low)]![i]!
    m ^= low
  }

  m = hi

  while (m !== 0) {
    const low = m & -m

    i++
    r += binom[63 - Math.clz32(low)]![i]!
    m ^= low
  }

  return r
}

// ---- the engine ----

export type LineEngine = {
  sp: LineSpace
  // true: a ring with the cut trit (3 a configuration); false: an open line (1)
  closed: boolean
  cuts: number
  phase: Uint8Array
  target: Int32Array
  dc: Int8Array
  sign: Int8Array
  // open only: 1 where a love would cross the far link at the next stream
  crosses: Uint8Array
}

export function lineEngine(L: number, n: number, closed: boolean): LineEngine {
  const sp = lineSpace(L, n)
  const M = sp.count
  const cuts = closed ? 3 : 1
  const phase = new Uint8Array(M * cuts)
  const target = new Int32Array(M)
  const dc = new Int8Array(M)
  const sign = new Int8Array(M)
  const crosses = new Uint8Array(closed ? 0 : M)
  const q = new Int32Array(L)

  for (let r = 0; r < M; r++) {
    const lo = sp.lo[r]!
    const hi = sp.hi[r]!

    let full = 0

    for (let x = 0; x < L; x++) {
      const d = x < 16 ? (lo >>> (2 * x)) & 3 : (hi >>> (2 * x - 32)) & 3

      q[x] = d === 3 ? 2 : d === 0 ? 0 : 1
      full += d === 3 ? 1 : 0
    }

    for (let c = 0; c < cuts; c++) {
      let Q = 0
      let links = 0

      for (let l = 0; l < L; l++) {
        Q += q[l]!

        if ((c + Q) % 3 !== 0) {
          links++
        }
      }

      phase[r * cuts + c] = (((-3 * links + 28 * full) % TURN) + TURN) % TURN
    }

    // the stream, ascending modes: label 0 one dock forward, label 1 one back; the sign is the parity of the
    // reordering (B1's: each love counts the moved loves already placed above its new mode)
    const after: Mask = [0, 0]
    const seen: Mask = [0, 0]

    let inversions = 0
    let cut = 0
    let crossing = 0

    for (let b = 0; b < 2 * L; b++) {
      if (bitOf(lo, hi, b) === 0) {
        continue
      }

      const x = b >>> 1
      const forward = (b & 1) === 1
      const y = forward ? (x + 1) % L : (x - 1 + L) % L
      const nb = forward ? 2 * y + 1 : 2 * y

      if (forward && x === L - 1) {
        cut--
        crossing = 1
      }

      if (!forward && x === 0) {
        cut++
        crossing = 1
      }

      inversions +=
        popcount(seen[0]) + popcount(seen[1]) - below(seen[0], seen[1], nb + 1)
      setBit(seen, nb)
      setBit(after, nb)
    }

    target[r] = rankOf(sp.binom, after[0], after[1])
    dc[r] = closed ? ((cut % 3) + 3) % 3 : 0
    sign[r] = inversions % 2 === 0 ? 1 : -1

    if (!closed) {
      crosses[r] = crossing
    }
  }

  return { sp, closed, cuts, phase, target, dc, sign, crosses }
}

export type Amp = { re: Float64Array; im: Float64Array }

export const emptyAmp = (size: number): Amp => ({
  re: new Float64Array(size),
  im: new Float64Array(size),
})

export function coinPass(
  e: LineEngine,
  a: Amp,
  coin: Coin,
  adjoint: boolean,
): void {
  const { sp, cuts } = e
  const M = sp.count
  const kr = coin[0][0]
  const ki = adjoint ? -coin[0][1] : coin[0][1]
  const cr = coin[1][0]
  const ci = adjoint ? -coin[1][1] : coin[1][1]

  for (let x = 0; x < sp.L; x++) {
    const words = x < 16 ? sp.lo : sp.hi
    const shift = x < 16 ? 2 * x : 2 * x - 32
    const C1 = sp.binom[2 * x + 1]!
    const C0 = sp.binom[2 * x]!

    for (let r = 0; r < M; r++) {
      // front (mode 2x + 1) alone on the dock
      if (((words[r]! >>> shift) & 3) !== 2) {
        continue
      }

      const i = below(sp.lo[r]!, sp.hi[r]!, 2 * x) + 1
      const p = r - C1[i]! + C0[i]!

      for (let c = 0; c < cuts; c++) {
        const u = r * cuts + c
        const v = p * cuts + c
        const ar = a.re[u]!
        const ai = a.im[u]!
        const br = a.re[v]!
        const bi = a.im[v]!

        a.re[u] = kr * ar - ki * ai + (cr * br - ci * bi)
        a.im[u] = kr * ai + ki * ar + (cr * bi + ci * br)
        a.re[v] = cr * ar - ci * ai + (kr * br - ki * bi)
        a.im[v] = cr * ai + ci * ar + (kr * bi + ki * br)
      }
    }
  }
}

export function phasePass(e: LineEngine, a: Amp, conjugate: boolean): void {
  const size = e.phase.length

  for (let u = 0; u < size; u++) {
    const t = e.phase[u]!

    if (t === 0) {
      continue
    }

    const pr = COS[t]!
    const pi = conjugate ? -SIN[t]! : SIN[t]!
    const ar = a.re[u]!
    const ai = a.im[u]!

    a.re[u] = pr * ar - pi * ai
    a.im[u] = pr * ai + pi * ar
  }
}

// one beat; returns the weight that would cross an open line's far link (0 on a closed one)
export function lineBeat(
  e: LineEngine,
  a: Amp,
  out: Amp,
  split: boolean,
): number {
  if (split) {
    coinPass(e, a, HALF_COIN, false)
    phasePass(e, a, false)
    coinPass(e, a, HALF_COIN, false)
  } else {
    phasePass(e, a, false)
    coinPass(e, a, FULL_COIN, false)
  }

  const M = e.sp.count
  const cuts = e.cuts

  let crossing = 0

  for (let r = 0; r < M; r++) {
    const t = e.target[r]!
    const s = e.sign[r]!
    const d = e.dc[r]!

    for (let c = 0; c < cuts; c++) {
      const u = r * cuts + c
      const v = t * cuts + ((c + d) % cuts)
      const re = a.re[u]!
      const im = a.im[u]!

      if (!e.closed && e.crosses[r] === 1) {
        crossing += re * re + im * im
      }

      out.re[v] = s * re
      out.im[v] = s * im
    }
  }

  return crossing
}

export function lineBeatBack(
  e: LineEngine,
  a: Amp,
  out: Amp,
  split: boolean,
): void {
  const M = e.sp.count
  const cuts = e.cuts

  for (let r = 0; r < M; r++) {
    const t = e.target[r]!
    const s = e.sign[r]!
    const d = e.dc[r]!

    for (let c = 0; c < cuts; c++) {
      const v = t * cuts + ((c + d) % cuts)

      out.re[r * cuts + c] = s * a.re[v]!
      out.im[r * cuts + c] = s * a.im[v]!
    }
  }

  if (split) {
    coinPass(e, out, HALF_COIN, true)
    phasePass(e, out, true)
    coinPass(e, out, HALF_COIN, true)
  } else {
    coinPass(e, out, FULL_COIN, true)
    phasePass(e, out, true)
  }
}

export const normOf = (a: Amp): number => {
  let s = 0

  for (let u = 0; u < a.re.length; u++) {
    s += a.re[u]! ** 2 + a.im[u]! ** 2
  }

  return s
}

export function maxDifference(a: Amp, b: Amp): number {
  let worst = 0

  for (let u = 0; u < a.re.length; u++) {
    worst = Math.max(
      worst,
      Math.abs(a.re[u]! - b.re[u]!),
      Math.abs(a.im[u]! - b.im[u]!),
    )
  }

  return worst
}

// ---- starts ----

// the modes of loves at (position, label), taken mod L
export function modesOf(
  ts: readonly (readonly [number, number])[],
  L: number,
): Mask {
  const k: Mask = [0, 0]

  for (const [x, j] of ts) {
    const y = ((x % L) + L) % L

    setBit(k, j === 0 ? 2 * y + 1 : 2 * y)
  }

  return k
}

// the parity of normal-ordering A_dag B_dag (A's modes, then B's) into ascending order
export function mergeSign(a: Mask, b: Mask): number {
  let n = 0

  for (let m = 0; m < 64; m++) {
    if (bitOf(a[0], a[1], m) === 1) {
      n += below(b[0], b[1], m)
    }
  }

  return n % 2 === 0 ? 1 : -1
}

const overlaps = (a: Mask, b: Mask): boolean =>
  (a[0] & b[0]) !== 0 || (a[1] & b[1]) !== 0

// B1's bath for start s on a ring of W: free mode (s + floor(i M / k)) mod M of the modes at positions read + 1 .. W - 1,
// as (position, label) pairs
export function bathLoves(
  W: number,
  read: number,
  k: number,
  s: number,
): [number, number][] {
  const free: [number, number][] = []

  for (let x = read + 1; x < W; x++) {
    // mode 2x is label 1, 2x + 1 label 0, in B1's free-mode order
    free.push([x, 1], [x, 0])
  }

  const out: [number, number][] = []

  for (let i = 0; i < k; i++) {
    out.push(free[(s + Math.floor((i * free.length) / k)) % free.length]!)
  }

  return out
}

export type Start = { amp: Amp; dropped: number }

// B1's start on a closed ring of W (offset 0): the cluster at total momentum 0 over every anchor, wrapped translates
// carried by the cut trit, the bath's modes, Pauli overlaps dropped, normalized. `lift` instead puts the same
// superposition on the engine's line at `offset`, the translates unwrapped (anchors 0..W - 1) and the same translates
// dropped (by their overlap with the bath taken mod W), with c = 0
export function lineStart(input: {
  e: LineEngine
  W: number
  placed: readonly Placed[] | undefined
  bath: readonly (readonly [number, number])[]
  lift: boolean
  offset: number
}): Start {
  const { e, W, placed, bath, lift, offset } = input
  const L = e.sp.L
  const cuts = e.cuts
  const amp = emptyAmp(e.sp.count * cuts)
  const shift = (ts: readonly (readonly [number, number])[]) =>
    ts.map(([x, j]) => [x + offset, j] as const)
  const bathRing = modesOf(bath, W)
  const bathHere = modesOf(shift(bath), L)

  let dropped = 0

  if (placed === undefined) {
    amp.re[rankOf(e.sp.binom, bathHere[0], bathHere[1]) * cuts] = 1

    return { amp, dropped }
  }

  const w = 1 / Math.sqrt(W)

  for (let X = 0; X < W; X++) {
    for (const p of placed) {
      const ts = p.ts.map(([x, j]) => [x + X, j] as const)

      if (overlaps(modesOf(ts, W), bathRing)) {
        dropped += (p.re ** 2 + p.im ** 2) / W
        continue
      }

      if (lift && ts.some(([x]) => x + offset >= L)) {
        throw new Error('cold-line: a lifted translate leaves the line')
      }

      const m = modesOf(shift(ts), L)

      // on a line shorter than the translate's ring, a translate may meet the bath or itself: dropped the same way
      if (
        overlaps(m, bathHere) ||
        popcount(m[0]) + popcount(m[1]) !== ts.length
      ) {
        dropped += (p.re ** 2 + p.im ** 2) / W
        continue
      }

      const wrapped = lift
        ? 0
        : ts.reduce((n, [x]) => n + Math.floor((x + offset) / L), 0)
      const s = mergeSign(m, bathHere)
      const both: Mask = [m[0] | bathHere[0], m[1] | bathHere[1]]
      const u =
        rankOf(e.sp.binom, both[0], both[1]) * cuts +
        (cuts === 3 ? ((-wrapped % 3) + 3) % 3 : 0)

      amp.re[u]! += s * w * p.re
      amp.im[u]! += s * w * p.im
    }
  }

  const norm = Math.sqrt(normOf(amp))

  for (let u = 0; u < amp.re.length; u++) {
    amp.re[u]! /= norm
    amp.im[u]! /= norm
  }

  return { amp, dropped }
}

// ---- the reading ----

export type LineReader = {
  L: number
  read: number
  // anchors read: 0..L - 1 on a closed line, 0..L - 1 - read on an open one (a trio never wraps there)
  anchors: number
  closed: boolean
  // each placement: its modes relative to the anchor's mode 2X, its positions, the level's conjugate amplitude
  modes: number[][]
  positions: number[][]
  re: Float64Array
  im: Float64Array
  // the window width in modes and, per window value, the placements it contains
  width: number
  index: Int32Array[]
  // the anchor dock must be occupied (every placement's least position is 0)
  anchored: boolean
  weight: number
}

export function lineReader(
  placed: readonly Placed[],
  L: number,
  read: number,
  closed: boolean,
): LineReader {
  const kept = placed.filter(
    p =>
      Math.max(...p.ts.map(t => t[0])) <= read &&
      p.re ** 2 + p.im ** 2 > 1e-24,
  )
  const least = Math.min(...kept.flatMap(p => p.ts.map(t => t[0])))

  if (least < 0) {
    throw new Error('cold-line: a placement has a negative position')
  }

  const weight = kept.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0)
  const scale = 1 / Math.sqrt(weight)
  const width = 2 * (read + 1)
  const modes = kept.map(p =>
    p.ts.map(([x, j]) => (j === 0 ? 2 * x + 1 : 2 * x)).sort((a, b) => a - b),
  )
  const patterns = modes.map(ms => ms.reduce((v, m) => v | (1 << m), 0))
  const index: Int32Array[] = []

  for (let w = 0; w < 1 << width; w++) {
    const list: number[] = []

    patterns.forEach((pt, i) => {
      if ((w & pt) === pt) {
        list.push(i)
      }
    })
    index.push(Int32Array.from(list))
  }

  return {
    L,
    read,
    anchors: closed ? L : L - read,
    closed,
    modes,
    positions: kept.map(p => p.ts.map(t => t[0])),
    re: Float64Array.from(kept, p => p.re * scale),
    im: Float64Array.from(kept, p => -p.im * scale),
    width,
    index,
    anchored: kept.every(p => p.ts.some(t => t[0] === 0)),
    weight,
  }
}

export function boundCount(e: LineEngine, rd: LineReader, a: Amp): number {
  const { sp, cuts } = e
  const n = sp.n

  if (n < 3) {
    return 0
  }

  const L = sp.L
  const modesAll = 2 * L
  const R = sp.binom[2 * L]![n - 3]!
  const acc = emptyAmp(rd.anchors * R * cuts)
  const others: Mask = [0, 0]

  for (let r = 0; r < sp.count; r++) {
    let any = false

    for (let c = 0; c < cuts; c++) {
      if (a.re[r * cuts + c] !== 0 || a.im[r * cuts + c] !== 0) {
        any = true
      }
    }

    if (!any) {
      continue
    }

    const lo = sp.lo[r]!
    const hi = sp.hi[r]!

    for (let X = 0; X < rd.anchors; X++) {
      if (
        rd.anchored &&
        (X < 16 ? (lo >>> (2 * X)) & 3 : (hi >>> (2 * X - 32)) & 3) === 0
      ) {
        continue
      }

      const w = rd.closed
        ? cyclic(lo, hi, modesAll, 2 * X, rd.width)
        : extract(lo, hi, 2 * X, rd.width)
      const list = rd.index[w]!

      for (let li = 0; li < list.length; li++) {
        const t = list[li]!
        const ms = rd.modes[t]!

        others[0] = lo
        others[1] = hi

        let wrapped = 0

        for (const m of ms) {
          const g = 2 * X + m

          if (g >= modesAll) {
            wrapped++
          }

          const pm = g % modesAll

          if (pm < 32) {
            others[0] &= ~(1 << pm)
          } else {
            others[1] &= ~(1 << (pm - 32))
          }
        }

        let parity = 0

        for (const m of ms) {
          parity += below(others[0], others[1], (2 * X + m) % modesAll)
        }

        const s = parity % 2 === 0 ? 1 : -1
        const base =
          (X * R + rankOf(sp.binom, others[0], others[1])) * cuts
        const tr = rd.re[t]!
        const ti = rd.im[t]!

        for (let c = 0; c < cuts; c++) {
          const ar = a.re[r * cuts + c]!
          const ai = a.im[r * cuts + c]!
          const left = (c + wrapped) % cuts

          acc.re[base + left]! += s * (tr * ar - ti * ai)
          acc.im[base + left]! += s * (tr * ai + ti * ar)
        }
      }
    }
  }

  return normOf(acc)
}

// the expected number of loves outside docks [from, to]
export function lovesOutside(
  e: LineEngine,
  a: Amp,
  from: number,
  to: number,
): number {
  const inside: Mask = [0, 0]

  for (let x = from; x <= to; x++) {
    setBit(inside, 2 * x)
    setBit(inside, 2 * x + 1)
  }

  let total = 0

  for (let r = 0; r < e.sp.count; r++) {
    let w = 0

    for (let c = 0; c < e.cuts; c++) {
      w += a.re[r * e.cuts + c]! ** 2 + a.im[r * e.cuts + c]! ** 2
    }

    if (w === 0) {
      continue
    }

    const out =
      popcount(e.sp.lo[r]! & ~inside[0]) + popcount(e.sp.hi[r]! & ~inside[1])

    total += w * out
  }

  return total
}

// the bound-trio count of the infinite-temperature state of n loves on a ring of L (B1's floor)
export const thermal = (L: number, n: number): number =>
  (L * n * (n - 1) * (n - 2)) / (2 * L * (2 * L - 1) * (2 * L - 2))
