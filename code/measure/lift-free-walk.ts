// The lift-free line walk (vibe/roadmap/moving-matter, research/confinement-many-walker.md section 3c, decision 022).
// Distinguishable walkers on a ring, each with a two-state coin (slot 0 moves +1, slot 1 moves -1) and a triality t in Z3.
// One beat: the coin on every walker, then the move. At each link (x, x + 1) the walkers in the two facing slots, (x, +)
// and (x + 1, -), carry the ORIENTED triality flux F = sum t forward - sum t backward. If F = 0 mod 3 every facing walker
// crosses; otherwise
//   reflect   every facing walker stays at its site with its slot map e^(i a) F (F the slot flip), a = phase * pi / 2,
//             so phase 0 is the bare reflection of E-FRC-0312, phase +1 is i F and phase -1 is -i F (decision 022)
//   stay      every facing walker stays with its slot unchanged (not a bijection on three walkers, E-FRC-0312)
//   free      (control) every walker always crosses.
// Each crossing / reflecting map is a bijection on configurations times a phase i^(phase r), r the number of walkers
// that reflect in that configuration. Generalized from test/experiment/gauge/projective-colour.ts:666-1377 (E-FRC-0312)
// with the reflection's phase carried; the coins are E-FRC-0307's line coin (string-localize.ts:111-134).

import { ringUnit, unitAngle } from '@/code/measure/swap-string'

export type CoinName = 'hadamard' | 'rstar'
export type Cross = 'reflect' | 'stay' | 'free'
// the reflected walker's slot map is i^phase F
export type Phase = 0 | 1 | -1
export type LineRule = { cross: Cross; phase: Phase }

// a 2 x 2 coin, row-major: new[c] = sum_c' C[c][c'] old[c'], c = 0 moves +1, c = 1 moves -1
export type C2 = { re: number[]; im: number[] }

const MU = unitAngle(ringUnit(-1, 4))

// i^q for q mod 4
const QRE = [1, 0, -1, 0] as const
const QIM = [0, 1, 0, -1] as const

export const mod = (a: number, m: number): number => ((a % m) + m) % m

export const fmix = (h0: number): number => {
  let h = h0 | 0

  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return (h >>> 0) / 4294967296 - 0.5
}

export function coinsOf(coin: CoinName): C2[] {
  if (coin === 'hadamard') {
    const h = Math.SQRT1_2

    return [{ re: [h, h, h, -h], im: [0, 0, 0, 0] }]
  }

  const ur = Math.cos(MU)
  const ui = Math.sin(MU)

  // Q0 = X P_S, Q1 = X P_D (string-localize.ts:121-131)
  return [
    { re: [(ur - 1) / 2, (ur + 1) / 2, (ur + 1) / 2, (ur - 1) / 2], im: [ui / 2, ui / 2, ui / 2, ui / 2] },
    { re: [(1 - ur) / 2, (1 + ur) / 2, (1 + ur) / 2, (1 - ur) / 2], im: [ui / 2, -ui / 2, -ui / 2, ui / 2] },
  ]
}

// the move of one configuration: pos (n sites), coins (bit i = walker i's slot, 1 moves -1). Writes out, returns the new
// coins and the quarter turns (the phase i^q this configuration picks up)
export function moveConfig(S: number, t: readonly number[], pos: ArrayLike<number>, coins: number, rule: LineRule, out: Int32Array): { coins: number; q: number } {
  const n = t.length
  let next = coins
  let reflected = 0

  for (let i = 0; i < n; i++) {
    const back = (coins >> i) & 1
    const p = pos[i]!
    const link = back ? mod(p - 1, S) : p
    let F = 0

    for (let j = 0; j < n; j++) {
      const bj = (coins >> j) & 1
      const lj = bj ? mod(pos[j]! - 1, S) : pos[j]!

      if (lj === link) {
        F += bj ? -t[j]! : t[j]!
      }
    }

    if (rule.cross === 'free' || mod(F, 3) === 0) {
      out[i] = mod(p + (back ? -1 : 1), S)
    } else if (rule.cross === 'reflect') {
      out[i] = p
      next ^= 1 << i
      reflected++
    } else {
      out[i] = p
    }
  }

  return { coins: next, q: mod(rule.phase * reflected, 4) }
}

// apply one coin per walker to a block of 2^n amplitudes (in place)
export function coinBlock(n: number, C: C2, re: Float64Array, im: Float64Array, o: number): void {
  const B = 1 << n
  const [a0r, a1r, a2r, a3r] = C.re as [number, number, number, number]
  const [a0i, a1i, a2i, a3i] = C.im as [number, number, number, number]

  for (let i = 0; i < n; i++) {
    const bit = 1 << i

    for (let c = 0; c < B; c++) {
      if (c & bit) {
        continue
      }

      const p = o + c
      const q = o + (c | bit)
      const xr = re[p]!
      const xi = im[p]!
      const yr = re[q]!
      const yi = im[q]!

      re[p] = a0r * xr - a0i * xi + a1r * yr - a1i * yi
      im[p] = a0r * xi + a0i * xr + a1r * yi + a1i * yr
      re[q] = a2r * xr - a2i * xi + a3r * yr - a3i * yi
      im[q] = a2r * xi + a2i * xr + a3r * yi + a3i * yr
    }
  }
}

// ---- the relative (one total momentum) sector, dense: the last walker at site 0 ----

export type RelSector = {
  n: number
  S: number
  B: number
  blocks: number
  D: number
  // perm[i]: the image of basis state i under the move (translated back so the last walker sits at 0)
  perm: Int32Array
  // the phase of that transition: i^q times (at total momentum pi) the sign (-1)^s of the last walker's step s
  gRe: Float64Array
  gIm: Float64Array
  // the quarter turns alone (momentum 0), for the symmetry check of T'
  q: Int8Array
}

export function relSector(S: number, t: readonly number[], rule: LineRule, kPi = false): RelSector {
  const n = t.length
  const B = 1 << n
  const blocks = S ** (n - 1)
  const D = blocks * B
  const perm = new Int32Array(D)
  const gRe = new Float64Array(D)
  const gIm = new Float64Array(D)
  const qs = new Int8Array(D)
  const pos = new Int32Array(n)
  const out = new Int32Array(n)

  for (let b = 0; b < blocks; b++) {
    for (let i = 0; i < n - 1; i++) {
      pos[i] = Math.floor(b / S ** i) % S
    }

    pos[n - 1] = 0

    for (let c = 0; c < B; c++) {
      const m = moveConfig(S, t, pos, c, rule, out)
      const shift = out[n - 1]!
      let b2 = 0

      for (let i = 0; i < n - 1; i++) {
        b2 += mod(out[i]! - shift, S) * S ** i
      }

      const s = kPi && shift !== 0 ? -1 : 1

      perm[b * B + c] = b2 * B + m.coins
      gRe[b * B + c] = s * QRE[m.q]!
      gIm[b * B + c] = s * QIM[m.q]!
      qs[b * B + c] = m.q
    }
  }

  return { n, S, B, blocks, D, perm, gRe, gIm, q: qs }
}

// the number of basis states hit twice (0 for a permutation)
export function permDefect(perm: Int32Array): number {
  const hit = new Uint8Array(perm.length)
  let bad = 0

  for (const j of perm) {
    if (hit[j]) {
      bad++
    }

    hit[j] = 1
  }

  return bad
}

// max | |g| - 1 | over the transition phases (a permutation times unit phases is unitary)
export function phaseDefect(rs: RelSector): number {
  let d = 0

  for (let i = 0; i < rs.D; i++) {
    d = Math.max(d, Math.abs(Math.hypot(rs.gRe[i]!, rs.gIm[i]!) - 1))
  }

  return d
}

// T' = move after the all-walker slot swap X, with its phases: complex symmetric (T'(i) = j with phase g iff T'(j) = i with
// the same g) is what J = (P_S^(x)n)^dag K needs (K T' K = T'^dag); returns the states where that fails
export function symmetryDefect(rs: RelSector): number {
  const { D, B, perm, q } = rs
  const src = (i: number): number => i - (i % B) + ((B - 1) ^ (i % B))
  let bad = 0

  for (let i = 0; i < D; i++) {
    const j = perm[src(i)]!
    const back = perm[src(j)]!

    if (back !== i || q[src(i)] !== q[src(j)]) {
      bad++
    }
  }

  return bad
}

// one beat in place: coin on every block, then the phased permutation
export function relBeat(rs: RelSector, C: C2, s: { re: Float64Array; im: Float64Array; sr: Float64Array; si: Float64Array }): void {
  const { n, B, blocks, D, perm, gRe, gIm } = rs

  for (let b = 0; b < blocks; b++) {
    coinBlock(n, C, s.re, s.im, b * B)
  }

  s.sr.fill(0)
  s.si.fill(0)

  for (let i = 0; i < D; i++) {
    const gr = gRe[i]!
    const gi = gIm[i]!
    const xr = s.re[i]!
    const xi = s.im[i]!

    // += : the stay rule is not a permutation on three walkers, and is then read as the linear map it is
    s.sr[perm[i]!]! += gr * xr - gi * xi
    s.si[perm[i]!]! += gr * xi + gi * xr
  }

  s.re.set(s.sr)
  s.im.set(s.si)
}

// the whole-sector unitarity read: one cycle on two hashed vectors, max of |<U a, U b> - <a, b>| and the norm changes
export function unitarityRead(rs: RelSector, coin: CoinName): number {
  const D = rs.D
  const vec = (seed: number): { re: Float64Array; im: Float64Array; sr: Float64Array; si: Float64Array } => ({
    re: Float64Array.from({ length: D }, (_, i) => fmix(11 * i + seed)),
    im: Float64Array.from({ length: D }, (_, i) => fmix(13 * i + seed + 1)),
    sr: new Float64Array(D),
    si: new Float64Array(D),
  })
  const inner = (a: { re: Float64Array; im: Float64Array }, b: { re: Float64Array; im: Float64Array }): [number, number] => {
    let r = 0
    let m = 0

    for (let i = 0; i < D; i++) {
      r += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
      m += a.re[i]! * b.im[i]! - a.im[i]! * b.re[i]!
    }

    return [r, m]
  }
  const a = vec(5)
  const b = vec(9)
  const before = [inner(a, a), inner(b, b), inner(a, b)]
  const scale = Math.max(before[0]![0], before[1]![0])

  for (const C of coinsOf(coin)) {
    relBeat(rs, C, a)
    relBeat(rs, C, b)
  }

  const after = [inner(a, a), inner(b, b), inner(a, b)]

  return Math.max(...before.map((x, k) => Math.hypot(x[0] - after[k]![0], x[1] - after[k]![1]) / scale))
}

export type Moments = { dim: number; re: number[]; im: number[]; mirror: number; closedLeak: number }

type Active = {
  re: Float64Array
  im: Float64Array
  sr: Float64Array
  si: Float64Array
  mark: Int32Array
  stamp: number
  list: Int32Array
  next: Int32Array
  count: number
}

function sparseBeat(rs: RelSector, C: C2, a: Active): void {
  const { n, B, perm, gRe, gIm } = rs

  a.stamp++

  let nc = 0

  for (let q = 0; q < a.count; q++) {
    const b = a.list[q]!

    coinBlock(n, C, a.re, a.im, b * B)

    for (let c = 0; c < B; c++) {
      const i = b * B + c
      const vr = a.re[i]!
      const vi = a.im[i]!

      a.re[i] = 0
      a.im[i] = 0

      if (vr === 0 && vi === 0) {
        continue
      }

      const j = perm[i]!
      const bj = (j / B) | 0
      const gr = gRe[i]!
      const gi = gIm[i]!

      a.sr[j]! += gr * vr - gi * vi
      a.si[j]! += gr * vi + gi * vr

      if (a.mark[bj] !== a.stamp) {
        a.mark[bj] = a.stamp
        a.next[nc++] = bj
      }
    }
  }

  for (let q = 0; q < nc; q++) {
    const b = a.next[q]!

    for (let c = 0; c < B; c++) {
      const i = b * B + c

      a.re[i] = a.sr[i]!
      a.im[i] = a.si[i]!
      a.sr[i] = 0
      a.si[i] = 0
    }
  }

  const t = a.list

  a.list = a.next
  a.next = t
  a.count = nc
}

// t_m = tr U^m over the whole sector (only = undefined) or over the co-located block (only = 0), m = 1..M cycles;
// mirror = max_m |t_m - conj t_m| / dim
export function traceMoments(rs: RelSector, coin: CoinName, M: number, only?: number): Moments {
  const coins = coinsOf(coin)
  const starts = only === undefined ? Array.from({ length: rs.D }, (_, i) => i) : Array.from({ length: rs.B }, (_, c) => only * rs.B + c)
  const tre = Array<number>(M).fill(0)
  const tim = Array<number>(M).fill(0)
  const a: Active = {
    re: new Float64Array(rs.D),
    im: new Float64Array(rs.D),
    sr: new Float64Array(rs.D),
    si: new Float64Array(rs.D),
    mark: new Int32Array(rs.blocks).fill(-1),
    stamp: 0,
    list: new Int32Array(rs.blocks),
    next: new Int32Array(rs.blocks),
    count: 0,
  }
  let closedLeak = 0

  for (const i of starts) {
    a.re[i] = 1
    a.list[0] = (i / rs.B) | 0
    a.count = 1

    for (let m = 0; m < M; m++) {
      for (const C of coins) {
        sparseBeat(rs, C, a)
      }

      tre[m]! += a.re[i]!
      tim[m]! += a.im[i]!
    }

    let w = 0

    for (let q = 0; q < a.count; q++) {
      const b = a.list[q]!

      for (let c = 0; c < rs.B; c++) {
        const j = b * rs.B + c

        if (only !== undefined && b !== only) {
          w += a.re[j]! ** 2 + a.im[j]! ** 2
        }

        a.re[j] = 0
        a.im[j] = 0
      }
    }

    closedLeak = Math.max(closedLeak, w)
  }

  const dim = starts.length
  const mirror = Math.max(...tim.map(x => (2 * Math.abs(x)) / dim))

  return { dim, re: tre, im: tim, mirror, closedLeak }
}

// max_m |a_m - conj b_m| / dim (conj = true) or |a_m - b_m| / dim
export function momentGap(a: Moments, b: Moments, conj: boolean): number {
  return Math.max(...a.re.map((x, m) => Math.hypot(x - b.re[m]!, a.im[m]! - (conj ? -1 : 1) * b.im[m]!) / a.dim))
}

// J = (P_S^(x)n)^dag K on the rstar coin (P_S = X Q0), read |U J U phi - J phi| / |phi| on a hashed phi, and J0 = K alone
export function jRead(rs: RelSector): { residual: number; control: number; symmetry: number } {
  const [q0, q1] = coinsOf('rstar') as [C2, C2]
  // P_S[c][c'] = Q0[1 - c][c'], and its dagger
  const ps: C2 = { re: [q0.re[2]!, q0.re[3]!, q0.re[0]!, q0.re[1]!], im: [q0.im[2]!, q0.im[3]!, q0.im[0]!, q0.im[1]!] }
  const psd: C2 = { re: [ps.re[0]!, ps.re[2]!, ps.re[1]!, ps.re[3]!], im: [-ps.im[0]!, -ps.im[2]!, -ps.im[1]!, -ps.im[3]!] }
  const D = rs.D
  const cycle = (re: Float64Array, im: Float64Array): void => {
    const s = { re, im, sr: new Float64Array(D), si: new Float64Array(D) }

    relBeat(rs, q0, s)
    relBeat(rs, q1, s)
  }
  const J = (re: Float64Array, im: Float64Array, withB: boolean): void => {
    for (let i = 0; i < D; i++) {
      im[i] = -im[i]!
    }

    if (withB) {
      for (let b = 0; b < rs.blocks; b++) {
        coinBlock(rs.n, psd, re, im, b * rs.B)
      }
    }
  }
  const read = (withB: boolean): number => {
    const pr = Float64Array.from({ length: D }, (_, i) => fmix(7 * i + 3))
    const pi = Float64Array.from({ length: D }, (_, i) => fmix(7 * i + 4))
    const ar = Float64Array.from(pr)
    const ai = Float64Array.from(pi)

    cycle(ar, ai)
    J(ar, ai, withB)
    cycle(ar, ai)

    const br = Float64Array.from(pr)
    const bi = Float64Array.from(pi)

    J(br, bi, withB)

    let num = 0
    let den = 0

    for (let i = 0; i < D; i++) {
      num += (ar[i]! - br[i]!) ** 2 + (ai[i]! - bi[i]!) ** 2
      den += pr[i]! ** 2 + pi[i]! ** 2
    }

    return Math.sqrt(num / den)
  }

  return { residual: read(true), control: read(false), symmetry: symmetryDefect(rs) }
}

// ---- the dynamics on the ring, sparse over configurations ----

type Sparse = { keys: Map<number, number>; pos: Int32Array; re: Float64Array; im: Float64Array; count: number }

const newSparse = (n: number, cap: number): Sparse => ({
  keys: new Map(),
  pos: new Int32Array(cap * n),
  re: new Float64Array(cap * (1 << n)),
  im: new Float64Array(cap * (1 << n)),
  count: 0,
})

function blockOf(sp: Sparse, n: number, S: number, pos: ArrayLike<number>): { sp: Sparse; b: number } {
  let key = 0

  for (let i = n - 1; i >= 0; i--) {
    key = key * S + pos[i]!
  }

  const hit = sp.keys.get(key)

  if (hit !== undefined) {
    return { sp, b: hit }
  }

  let s = sp
  const B = 1 << n

  if (s.count * n >= s.pos.length) {
    const cap = 2 * s.count
    const g: Sparse = { keys: s.keys, pos: new Int32Array(cap * n), re: new Float64Array(cap * B), im: new Float64Array(cap * B), count: s.count }

    g.pos.set(s.pos)
    g.re.set(s.re)
    g.im.set(s.im)
    s = g
  }

  const b = s.count++

  for (let i = 0; i < n; i++) {
    s.pos[b * n + i] = pos[i]!
  }

  s.keys.set(key, b)

  return { sp: s, b }
}

export type DynRead = {
  coin: CoinName
  rule: LineRule
  t: number[]
  S: number
  T: number
  normDrift: number
  beatDrift: number
  tEdge: number
  comRms: number
  exponent: number
  speed: number
  spreadMax: number
  rmsMax: number
  final?: Record<string, number[]>
  curve: [number, number][]
  seconds: number
}

const READ_TIMES = ((): Set<number> => {
  const s = new Set<number>()

  for (let e = 0; e <= 4; e += 0.02) {
    s.add(Math.round(10 ** e))
  }

  return s
})()

// the mixed start I / 2^n at site 0, run to T beats, every coin basis start in turn. Reads: per-beat norm change; each
// walker's rms from the cluster centre (minimum image); the centre's rms from the start, its exponent (log rms against
// log t over the last decade before any weight reaches within edge sites of the antipode, edgeTol) and speed (rms / t)
export function dynRead(input: { coin: CoinName; rule: LineRule; t: readonly number[]; S: number; T: number; edge: number; edgeTol: number; keepFinal?: boolean }): DynRead {
  const { coin, rule, S, T, edge: EDGE, edgeTol } = input
  const t0 = Date.now()
  const t = input.t
  const n = t.length
  const B = 1 << n
  const coins = coinsOf(coin)
  const half = S / 2
  const mi = (d: number): number => mod(d + half, S) - half
  const com2 = new Float64Array(T + 1)
  const edge = new Float64Array(T + 1)
  let normDrift = 0
  let beatDrift = 0
  let spreadMax = 0
  let rmsMax = 0
  const final: Record<string, number[]> = {}
  const out = new Int32Array(n)
  const rel = new Float64Array(n)

  for (let c0 = 0; c0 < B; c0++) {
    let sp = newSparse(n, 64)
    const r0 = blockOf(sp, n, S, Array<number>(n).fill(0))

    sp = r0.sp
    sp.re[r0.b * B + c0] = 1

    let last = 1

    for (let beat = 1; beat <= T; beat++) {
      const C = coins[(beat - 1) % coins.length]!

      for (let b = 0; b < sp.count; b++) {
        coinBlock(n, C, sp.re, sp.im, b * B)
      }

      let next = newSparse(n, Math.max(64, sp.count))

      for (let b = 0; b < sp.count; b++) {
        const pos = sp.pos.subarray(b * n, b * n + n)

        for (let c = 0; c < B; c++) {
          const ar = sp.re[b * B + c]!
          const ai = sp.im[b * B + c]!

          if (ar === 0 && ai === 0) {
            continue
          }

          const m = moveConfig(S, t, pos, c, rule, out)
          const r = blockOf(next, n, S, out)
          const gr = QRE[m.q]!
          const gi = QIM[m.q]!

          next = r.sp
          next.re[r.b * B + m.coins]! += gr * ar - gi * ai
          next.im[r.b * B + m.coins]! += gr * ai + gi * ar
        }
      }

      sp = next

      let norm = 0
      let w2 = 0
      let s2 = 0
      let e = 0

      for (let b = 0; b < sp.count; b++) {
        let p = 0

        for (let c = 0; c < B; c++) {
          p += sp.re[b * B + c]! ** 2 + sp.im[b * B + c]! ** 2
        }

        if (p === 0) {
          continue
        }

        norm += p

        const p0 = sp.pos[b * n]!
        let mean = 0
        let far = false

        for (let i = 0; i < n; i++) {
          rel[i] = mi(sp.pos[b * n + i]! - p0)
          mean += rel[i]! / n

          if (Math.abs(mi(sp.pos[b * n + i]!)) >= half - EDGE) {
            far = true
          }
        }

        const cm = mi(p0) + mean
        let sp2 = 0

        for (let i = 0; i < n; i++) {
          sp2 += (rel[i]! - mean) ** 2 / n
        }

        w2 += p * cm * cm
        s2 += p * sp2

        if (far) {
          e += p
        }
      }

      normDrift = Math.max(normDrift, Math.abs(norm - 1))
      beatDrift = Math.max(beatDrift, Math.abs(norm - last))
      last = norm
      com2[beat]! += w2 / B
      edge[beat]! += e / B
      spreadMax = Math.max(spreadMax, Math.sqrt(s2))
      rmsMax = Math.max(rmsMax, Math.sqrt(w2))
    }

    if (input.keepFinal) {
      for (let b = 0; b < sp.count; b++) {
        const key = `${c0}:${Array.from(sp.pos.subarray(b * n, b * n + n)).join(',')}`

        final[key] = Array.from({ length: 2 * B }, (_, q) => (q % 2 === 0 ? sp.re[b * B + (q >> 1)]! : sp.im[b * B + (q >> 1)]!))
      }
    }
  }

  let tEdge = 0

  for (let beat = 1; beat <= T && edge[beat]! <= edgeTol; beat++) {
    tEdge = beat
  }

  const curve: [number, number][] = []

  for (let beat = 1; beat <= T; beat++) {
    if (READ_TIMES.has(beat) || beat === tEdge) {
      curve.push([beat, Math.sqrt(com2[beat]!)])
    }
  }

  const xs: number[] = []
  const ys: number[] = []

  for (let beat = Math.max(10, Math.floor(tEdge / 10)); beat <= tEdge; beat++) {
    const r = Math.sqrt(com2[beat]!)

    if (r > 0) {
      xs.push(Math.log(beat))
      ys.push(Math.log(r))
    }
  }

  const mx = xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
  const my = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length)
  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i]! - my)
    sxx += (x - mx) ** 2
  })

  const comRms = tEdge > 0 ? Math.sqrt(com2[tEdge]!) : 0

  return {
    coin,
    rule,
    t: [...t],
    S,
    T,
    normDrift,
    beatDrift,
    tEdge,
    comRms,
    exponent: sxx > 0 ? sxy / sxx : 0,
    speed: tEdge > 0 ? comRms / tEdge : 0,
    spreadMax,
    rmsMax,
    final: input.keepFinal ? final : undefined,
    curve,
    seconds: (Date.now() - t0) / 1000,
  }
}

// max |a - b| over the union of two final-amplitude maps
export function finalGap(a: Record<string, number[]>, b: Record<string, number[]>): number {
  let g = 0

  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k]
    const y = b[k]
    const len = Math.max(x?.length ?? 0, y?.length ?? 0)

    for (let q = 0; q < len; q++) {
      g = Math.max(g, Math.abs((x?.[q] ?? 0) - (y?.[q] ?? 0)))
    }
  }

  return g
}
