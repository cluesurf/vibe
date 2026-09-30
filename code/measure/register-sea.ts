// THE MANY-BODY REGISTER RULE RUN WITH THE SEA PRESENT (E-SPN-0175). E-SPN-0163 wrote the many-body rule with registers
// as the second quantization Gamma(P) of E-SPN-0160's one-body pieces, and read it on the full sea and on one hole.
// This file runs it with the sea present and with pair pieces on, in the only way a filled sea can be run: through its
// holes. By Jacobi, the (M - n)-member block of Gamma(P) is det(P) times the n-hole block of Gamma(conj P), and a pair
// piece built from sector counts maps under particle-hole to the same piece in hole counts (plus a one-body Hartree
// term, which counting from the sea removes). So n holes in the sea are n fermions under conj(P), and the complex
// conjugate of that is n fermions under P with every pair angle reversed. The experiment checks the map exactly on
// small Fock spaces and on the real 192-mode pieces, then runs two holes here.
//
//   torus            the D4 lattice (even coordinate sum) modulo L in each coordinate, L even: L^4 / 2 docks, the
//                    relative moves p + r_d - r_e, the D4 string length of the shortest image, and the L^4 / 2 distinct
//                    Bloch momenta (q and q + pi (1, 1, 1, 1) agree on every D4 point)
//   the pair         two holes at total momentum 0 in relative coordinates, psi(y)[m1][m2], y = x1 - x2, m = slot * 8 +
//                    register: 192 x 192 amplitudes a relative dock (the full slot-and-register space, no reduction)
//   one beat         (the control's dock contact), then at every relative dock the member mixers with the pair piece
//                    (code/measure/register-meson pieceAt: 1 + alpha (Q (x) 1 + 1 (x) Q) + beta Q (x) Q, the sector string
//                    and the sector contact inside beta), then the swap coin and the stream on the torus (exact, no edge)
//   moving blocks    W(q) = range(U(q) - 1), the 16 moving states of one member at each torus momentum, and its
//                    complement F(q), the 176 flat states on which the free cycle is the identity
//   flat count       N_F = the expected number of holes in F, read at cycle boundaries by a Fourier transform over the
//                    relative docks (member 1 at q, member 2 at -q)
//   triggers         the lifted K and store triggers, counted over every two-hole configuration exhaustively
//
// DETERMINISM: no random numbers; starts are fixed modes projected exactly. FLOATS here are measurement on exact pieces
// (the projectors are integer matrices over 24 and 48, the units are ring units).

import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import { d4Steps } from '@/code/measure/swap-sector'
import { cycleMatrix } from '@/code/measure/swap-cone'
import { LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { REGISTER_ROOTS } from '@/code/measure/spinor-register'
import { betaOf, partnerBasis } from '@/code/measure/register-meson'

const REG = 8
const MODES = 24 * REG
const FULL = MODES * MODES
const NR = 24

// ---- the torus ----

export type Torus = {
  L: number
  sites: number[][]
  index: Map<string, number>
  origin: number
  // move[i * 576 + d * 24 + e]: the relative dock of sites[i] + r_d - r_e
  move: Int32Array
  // neg[i]: the relative dock of -sites[i]
  neg: Int32Array
  // the D4 string length of the shortest image
  V: Int32Array
  // the Bloch momenta (one per class) and, for each, the index of its negative
  momenta: number[][]
  negMomentum: Int32Array
}

const mod = (x: number, L: number): number => ((x % L) + L) % L

export function torus(L: number): Torus {
  if (L % 2 !== 0 || L < 2) {
    throw new Error(`register-sea: the torus side must be even, got ${L}`)
  }

  const sites: number[][] = []

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let e = 0; e < L; e++) {
          if ((a + b + c + e) % 2 === 0) {
            sites.push([a, b, c, e])
          }
        }
      }
    }
  }

  const key = (p: readonly number[]): string =>
    p.map(x => mod(x, L)).join(',')
  const index = new Map(sites.map((p, i) => [key(p), i]))
  const at = (p: readonly number[]): number => index.get(key(p))!
  const move = new Int32Array(sites.length * NR * NR)
  const neg = new Int32Array(sites.length)
  const V = new Int32Array(sites.length)

  sites.forEach((p, i) => {
    for (let d = 0; d < NR; d++) {
      const r = DOCK_ROOTS[d] as number[]

      for (let e = 0; e < NR; e++) {
        const s = DOCK_ROOTS[e] as number[]

        move[i * NR * NR + d * NR + e] = at(
          p.map((x, k) => x + r[k]! - s[k]!),
        )
      }
    }

    neg[i] = at(p.map(x => -x))

    let best = Infinity

    for (let m = 0; m < 16; m++) {
      const img = p.map((x, k) => ((m >> k) & 1 ? x - L : x))

      best = Math.min(best, d4Steps(img))
    }

    V[i] = best
  })

  const momenta: number[][] = []
  const kIndex = new Map<string, number>()
  const half = L / 2
  const rep = (k: readonly number[]): number[] => {
    const m = k.map(x => mod(x, L))

    return m[3]! >= half ? m.map(x => mod(x - half, L)) : m
  }

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let e = 0; e < half; e++) {
          kIndex.set([a, b, c, e].join(','), momenta.length)
          momenta.push([a, b, c, e].map(x => (2 * Math.PI * x) / L))
        }
      }
    }
  }

  const negMomentum = new Int32Array(momenta.length)

  momenta.forEach((q, j) => {
    const k = q.map(x => Math.round((x * L) / (2 * Math.PI)))

    negMomentum[j] = kIndex.get(rep(k.map(x => -x)).join(','))!
  })

  return {
    L,
    sites,
    index,
    origin: at([0, 0, 0, 0]),
    move,
    neg,
    V,
    momenta,
    negMomentum,
  }
}

// the parity of the stream on the box's M = 192 V modes: the slot stream (d, x) -> (d, x + r_d) taken on each of the
// 8 register components; returns the slot stream's parity and the whole stream's
export function streamParity(t: Torus): { slot: number; whole: number } {
  const n = t.sites.length * NR
  const seen = new Uint8Array(n)
  const at = (p: readonly number[]): number =>
    t.index.get(p.map(x => mod(x, t.L)).join(','))!

  let parity = 0

  for (let s = 0; s < n; s++) {
    let j = s
    let len = 0

    while (!seen[j]) {
      seen[j] = 1

      const site = Math.floor(j / NR)
      const d = j % NR
      const r = DOCK_ROOTS[d] as number[]

      j = at(t.sites[site]!.map((x, k) => x + r[k]!)) * NR + d
      len++
    }

    if (len > 0) {
      parity ^= (len - 1) & 1
    }
  }

  return { slot: parity, whole: (parity * REG) & 1 }
}

// ---- the pair of holes ----

export type Pair = { re: Float64Array; im: Float64Array }

export const newPair = (t: Torus): Pair => ({
  re: new Float64Array(t.sites.length * FULL),
  im: new Float64Array(t.sites.length * FULL),
})

export type SeaRule = {
  // the member's mixer unit: u on Q_S in beat 1, conj u on Q_D in beat 2 (E-SPN-0160's schedule)
  u: readonly [number, number]
  // the sector string: a pair with both members in the beat's sector takes e^(+- i string min(V, cap)) (E-SPN-0162's
  // form, counted from the sea, so it acts on hole pairs only)
  string: number
  cap: number
  // the sector contact vertex: at V = 0 the same pair takes a further e^(+- i contact) (E-SPN-0163's register exchange
  // restricted to the beat's sector: on an antisymmetric pair it is this phase)
  contact: number
  // CONTROL: E-SPN-0163's register exchange placed as a dock contact, v^(1 - swap) with the swap exchanging two members'
  // registers and keeping their slots, applied at V = 0 before each beat's pieces
  dock: readonly [number, number] | null
  // CONTROL: E-SPN-0147's member string, each member's own unit u e^(i phi / 2) whatever the other's sector
  member: boolean
}

// E-SPN-0163's vertex as a dock contact at the origin: psi[(d, a)][(e, b)] and psi[(d, b)][(e, a)] mix as
// (1 + swap) / 2 + v^2 (1 - swap) / 2
function dockContact(
  t: Torus,
  s: Pair,
  v: readonly [number, number],
): void {
  const o = t.origin * FULL
  const v2r = v[0] * v[0] - v[1] * v[1]
  const v2i = 2 * v[0] * v[1]

  for (let d = 0; d < NR; d++) {
    for (let e = 0; e < NR; e++) {
      for (let a = 0; a < REG; a++) {
        for (let b = a + 1; b < REG; b++) {
          const i = o + (d * REG + a) * MODES + e * REG + b
          const j = o + (d * REG + b) * MODES + e * REG + a
          const sr = (s.re[i]! + s.re[j]!) / 2
          const si = (s.im[i]! + s.im[j]!) / 2
          const ar = (s.re[i]! - s.re[j]!) / 2
          const ai = (s.im[i]! - s.im[j]!) / 2
          const wr = v2r * ar - v2i * ai
          const wi = v2r * ai + v2i * ar

          s.re[i] = sr + wr
          s.im[i] = si + wi
          s.re[j] = sr - wr
          s.im[j] = si - wi
        }
      }
    }
  }
}

// THE SECTOR BASES, 192 x 8 real, Q = E E^T: the singlet E_S[(d, a)][a'] = delta(a, a') / sqrt 24, and E-SPN-0160's
// partner E_D (code/measure/register-meson's partnerBasis)
export function singletBasis(): Float64Array {
  const E = new Float64Array(MODES * REG)
  const s = 1 / Math.sqrt(24)

  for (let d = 0; d < NR; d++) {
    for (let a = 0; a < REG; a++) {
      E[(d * REG + a) * REG + a] = s
    }
  }

  return E
}

// the pair piece at one relative dock, psi <- psi + alpha (Q psi + psi Q) + beta Q psi Q with Q = E E^T (the same map
// as code/measure/register-meson's pieceAt, which the experiment checks, written through the 8-dimensional sector
// coordinates: L = E^T psi, R = psi E, C = E^T psi E)
export function sectorPiece(
  re: Float64Array,
  im: Float64Array,
  off: number,
  E: Float64Array,
  alpha: readonly [number, number],
  beta: readonly [number, number],
): void {
  const Lr = new Float64Array(REG * MODES)
  const Li = new Float64Array(REG * MODES)
  const Rr = new Float64Array(MODES * REG)
  const Ri = new Float64Array(MODES * REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    const o = off + s1 * MODES

    for (let eta = 0; eta < REG; eta++) {
      const w = E[s1 * REG + eta]!

      if (w === 0) {
        continue
      }

      const lo = eta * MODES

      for (let s2 = 0; s2 < MODES; s2++) {
        Lr[lo + s2]! += w * re[o + s2]!
        Li[lo + s2]! += w * im[o + s2]!
      }
    }

    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = re[o + s2]!
      const xi = im[o + s2]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s2 * REG + eta]!

        Rr[s1 * REG + eta]! += w * xr
        Ri[s1 * REG + eta]! += w * xi
      }
    }
  }

  // C = L E
  const Cr = new Float64Array(REG * REG)
  const Ci = new Float64Array(REG * REG)

  for (let eta = 0; eta < REG; eta++) {
    for (let s2 = 0; s2 < MODES; s2++) {
      const xr = Lr[eta * MODES + s2]!
      const xi = Li[eta * MODES + s2]!

      for (let z = 0; z < REG; z++) {
        const w = E[s2 * REG + z]!

        Cr[eta * REG + z]! += w * xr
        Ci[eta * REG + z]! += w * xi
      }
    }
  }

  const [ar, ai] = alpha
  const [br, bi] = beta
  const gr = new Float64Array(REG)
  const gi = new Float64Array(REG)

  for (let s1 = 0; s1 < MODES; s1++) {
    // g[z] = alpha R[s1][z] + beta (E[s1] C)[z], so psi' = psi + alpha E[s1] L + E[s2] . g
    for (let z = 0; z < REG; z++) {
      let cr = 0
      let ci = 0

      for (let eta = 0; eta < REG; eta++) {
        const w = E[s1 * REG + eta]!

        cr += w * Cr[eta * REG + z]!
        ci += w * Ci[eta * REG + z]!
      }

      const rr = Rr[s1 * REG + z]!
      const ri = Ri[s1 * REG + z]!

      gr[z] = ar * rr - ai * ri + br * cr - bi * ci
      gi[z] = ar * ri + ai * rr + br * ci + bi * cr
    }

    const o = off + s1 * MODES

    for (let s2 = 0; s2 < MODES; s2++) {
      let sr = 0
      let si = 0

      for (let eta = 0; eta < REG; eta++) {
        const w1 = E[s1 * REG + eta]!
        const w2 = E[s2 * REG + eta]!

        if (w1 !== 0) {
          const lr = Lr[eta * MODES + s2]!
          const li = Li[eta * MODES + s2]!

          sr += w1 * (ar * lr - ai * li)
          si += w1 * (ar * li + ai * lr)
        }

        if (w2 !== 0) {
          sr += w2 * gr[eta]!
          si += w2 * gi[eta]!
        }
      }

      re[o + s2]! += sr
      im[o + s2]! += si
    }
  }
}

// one beat, in place on the pieces and returning the streamed state
export type SectorBases = { S: Float64Array; D: Float64Array }

export const sectorBases = (): SectorBases => ({
  S: singletBasis(),
  D: partnerBasis(),
})

export function seaBeat(
  t: Torus,
  rule: SeaRule,
  E: SectorBases,
  s: Pair,
  beat: 1 | 2,
  into?: Pair,
): Pair {
  const N = t.sites.length
  const [ur, ui] = rule.u
  const w: [number, number] = beat === 1 ? [ur, ui] : [ur, -ui]
  const sign = beat === 1 ? 1 : -1
  const basis = beat === 1 ? E.S : E.D

  if (rule.dock) {
    dockContact(t, s, rule.dock)
  }

  for (let i = 0; i < N; i++) {
    const V = t.V[i]!
    const phi =
      sign *
      (rule.string * Math.min(V, rule.cap) +
        (V === 0 ? rule.contact : 0))

    if (rule.member) {
      // each member takes w e^(i phi / 2): alpha = w' - 1 on each, beta = alpha^2
      const wr = w[0] * Math.cos(phi / 2) - w[1] * Math.sin(phi / 2)
      const wi = w[0] * Math.sin(phi / 2) + w[1] * Math.cos(phi / 2)

      sectorPiece(
        s.re,
        s.im,
        i * FULL,
        basis,
        [wr - 1, wi],
        [(wr - 1) ** 2 - wi * wi, 2 * (wr - 1) * wi],
      )
    } else {
      sectorPiece(
        s.re,
        s.im,
        i * FULL,
        basis,
        [w[0] - 1, w[1]],
        betaOf(w[0], w[1], phi),
      )
    }
  }

  // the swap coin (slot d takes its opposite's value, the register kept) and the stream: member 1's slot d one root
  // r_d, member 2's slot e one root r_e, so the relative dock moves r_d - r_e. The move is a bijection on the entries,
  // so a reused buffer needs no clearing
  const out = into ?? newPair(t)

  for (let i = 0; i < N; i++) {
    for (let d = 0; d < NR; d++) {
      const from1 = OPPOSITE[d]!

      for (let e = 0; e < NR; e++) {
        const j = t.move[i * NR * NR + d * NR + e]!
        const from2 = OPPOSITE[e]!

        for (let a = 0; a < REG; a++) {
          const src = i * FULL + (from1 * REG + a) * MODES + from2 * REG
          const dst = j * FULL + (d * REG + a) * MODES + e * REG

          for (let b = 0; b < REG; b++) {
            out.re[dst + b] = s.re[src + b]!
            out.im[dst + b] = s.im[src + b]!
          }
        }
      }
    }
  }

  return out
}

export function seaCycle(
  t: Torus,
  rule: SeaRule,
  E: SectorBases,
  s: Pair,
  spare?: Pair,
): Pair {
  // beat 1 streams s into the spare, beat 2 streams the spare back into s: two buffers for the whole run
  const mid = seaBeat(t, rule, E, s, 1, spare ?? newPair(t))

  return seaBeat(t, rule, E, mid, 2, s)
}

export const pairNorm = (s: Pair): number => {
  let n = 0

  for (let k = 0; k < s.re.length; k++) {
    n += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  return n
}

// ---- the moving blocks W(q) and the flats F(q) ----

export type Moving = {
  // per momentum: an orthonormal basis of W(q), 192 rows by rank columns, row-major [row * rank + col]
  re: Float64Array[]
  im: Float64Array[]
  rank: number[]
  // the smallest residual Gram-Schmidt accepted and the largest it rejected (a clean rank has a wide gap)
  accepted: number
  rejected: number
  // the largest entry of S_a - P_W S_a over the momenta and registers (W contains S, so this is 0)
  sOutsideW: number
}

export function movingBlocks(t: Torus, Ps: readonly CMatrix[]): Moving {
  const re: Float64Array[] = []
  const im: Float64Array[] = []
  const rank: number[] = []

  let accepted = Infinity
  let rejected = 0
  let sOutsideW = 0

  for (const q of t.momenta) {
    const U = cycleMatrix(Ps, REGISTER_ROOTS, q)
    const cols: { re: Float64Array; im: Float64Array }[] = []

    for (let j = 0; j < MODES; j++) {
      const vr = new Float64Array(MODES)
      const vi = new Float64Array(MODES)

      for (let i = 0; i < MODES; i++) {
        vr[i] = U.re[i * MODES + j]! - (i === j ? 1 : 0)
        vi[i] = U.im[i * MODES + j]!
      }

      // two passes of classical Gram-Schmidt
      for (let pass = 0; pass < 2; pass++) {
        for (const c of cols) {
          let dr = 0
          let di = 0

          for (let i = 0; i < MODES; i++) {
            dr += c.re[i]! * vr[i]! + c.im[i]! * vi[i]!
            di += c.re[i]! * vi[i]! - c.im[i]! * vr[i]!
          }

          for (let i = 0; i < MODES; i++) {
            vr[i]! -= dr * c.re[i]! - di * c.im[i]!
            vi[i]! -= dr * c.im[i]! + di * c.re[i]!
          }
        }
      }

      let n = 0

      for (let i = 0; i < MODES; i++) {
        n += vr[i]! ** 2 + vi[i]! ** 2
      }

      n = Math.sqrt(n)

      if (n > 1e-6) {
        accepted = Math.min(accepted, n)
        cols.push({ re: vr.map(x => x / n), im: vi.map(x => x / n) })
      } else {
        rejected = Math.max(rejected, n)
      }
    }

    const k = cols.length
    const Br = new Float64Array(MODES * k)
    const Bi = new Float64Array(MODES * k)

    cols.forEach((c, col) => {
      for (let i = 0; i < MODES; i++) {
        Br[i * k + col] = c.re[i]!
        Bi[i * k + col] = c.im[i]!
      }
    })

    // S lies in W exactly when P_W S_a = S_a for the 8 singlet states S_a (the uniform slot mode times register a);
    // then Q_S P_W = P_W Q_S = Q_S, which is what keeps the sector pieces off the flats
    for (let a = 0; a < REG; a++) {
      const sr = new Float64Array(MODES)

      for (let d = 0; d < NR; d++) {
        sr[d * REG + a] = 1 / Math.sqrt(24)
      }

      // residual of S_a after projecting on W
      const pr = new Float64Array(MODES)
      const pi = new Float64Array(MODES)

      for (let col = 0; col < k; col++) {
        let dr = 0
        let di = 0

        for (let i = 0; i < MODES; i++) {
          dr += Br[i * k + col]! * sr[i]!
          di -= Bi[i * k + col]! * sr[i]!
        }

        for (let i = 0; i < MODES; i++) {
          pr[i]! += Br[i * k + col]! * dr - Bi[i * k + col]! * di
          pi[i]! += Br[i * k + col]! * di + Bi[i * k + col]! * dr
        }
      }

      for (let i = 0; i < MODES; i++) {
        sOutsideW = Math.max(
          sOutsideW,
          Math.hypot(pr[i]! - sr[i]!, pi[i]!),
        )
      }
    }

    re.push(Br)
    im.push(Bi)
    rank.push(k)
  }

  return { re, im, rank, accepted, rejected, sOutsideW }
}

// the Fourier transform of the pair at momentum index j: M[m1][m2] = sum_y e^(-i q . y) psi(y)[m1][m2]
export function pairAt(
  t: Torus,
  s: Pair,
  j: number,
): { re: Float64Array; im: Float64Array } {
  const q = t.momenta[j]!
  const Mr = new Float64Array(FULL)
  const Mi = new Float64Array(FULL)

  t.sites.forEach((y, i) => {
    const ph = -(q[0]! * y[0]! + q[1]! * y[1]! + q[2]! * y[2]! + q[3]! * y[3]!)
    const c = Math.cos(ph)
    const sn = Math.sin(ph)
    const o = i * FULL

    for (let k = 0; k < FULL; k++) {
      const xr = s.re[o + k]!
      const xi = s.im[o + k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      Mr[k]! += c * xr - sn * xi
      Mi[k]! += c * xi + sn * xr
    }
  })

  return { re: Mr, im: Mi }
}

// ||B^dag M||^2 (member 1 in W) and ||M conj(B')||^2 (member 2 in W), B at q and B' at -q
function movingWeights(
  mv: Moving,
  j: number,
  jn: number,
  M: { re: Float64Array; im: Float64Array },
): { total: number; w1: number; w2: number } {
  const k1 = mv.rank[j]!
  const k2 = mv.rank[jn]!
  const Br = mv.re[j]!
  const Bi = mv.im[j]!
  const Cr = mv.re[jn]!
  const Ci = mv.im[jn]!

  let total = 0
  let w1 = 0
  let w2 = 0

  for (let x = 0; x < FULL; x++) {
    total += M.re[x]! ** 2 + M.im[x]! ** 2
  }

  // (B^dag M)[col][m2] = sum_m1 conj(B[m1][col]) M[m1][m2]
  for (let col = 0; col < k1; col++) {
    const ar = new Float64Array(MODES)
    const ai = new Float64Array(MODES)

    for (let m1 = 0; m1 < MODES; m1++) {
      const br = Br[m1 * k1 + col]!
      const bi = -Bi[m1 * k1 + col]!

      if (br === 0 && bi === 0) {
        continue
      }

      const o = m1 * MODES

      for (let m2 = 0; m2 < MODES; m2++) {
        const xr = M.re[o + m2]!
        const xi = M.im[o + m2]!

        ar[m2]! += br * xr - bi * xi
        ai[m2]! += br * xi + bi * xr
      }
    }

    for (let m2 = 0; m2 < MODES; m2++) {
      w1 += ar[m2]! ** 2 + ai[m2]! ** 2
    }
  }

  // (M conj(C))[m1][col] = sum_m2 M[m1][m2] conj(C[m2][col])
  for (let m1 = 0; m1 < MODES; m1++) {
    const o = m1 * MODES

    for (let col = 0; col < k2; col++) {
      let sr = 0
      let si = 0

      for (let m2 = 0; m2 < MODES; m2++) {
        const cr = Cr[m2 * k2 + col]!
        const ci = -Ci[m2 * k2 + col]!
        const xr = M.re[o + m2]!
        const xi = M.im[o + m2]!

        sr += xr * cr - xi * ci
        si += xr * ci + xi * cr
      }

      w2 += sr * sr + si * si
    }
  }

  return { total, w1, w2 }
}

// N_F, the expected number of holes in the flats, and the Fourier norm (Parseval: sites times the pair norm)
export function flatCount(
  t: Torus,
  mv: Moving,
  s: Pair,
): { nF: number; fourier: number } {
  let total = 0
  let flat = 0

  for (let j = 0; j < t.momenta.length; j++) {
    const M = pairAt(t, s, j)
    const w = movingWeights(mv, j, t.negMomentum[j]!, M)

    total += w.total
    flat += 2 * w.total - w.w1 - w.w2
  }

  return { nF: flat / total, fourier: total }
}

// ---- starts ----

export type Kind = 'W' | 'F'

// P_kind(q) e_m as a 192-vector
function projected(
  mv: Moving,
  j: number,
  kind: Kind,
  m: number,
): { re: Float64Array; im: Float64Array } {
  const k = mv.rank[j]!
  const Br = mv.re[j]!
  const Bi = mv.im[j]!
  const re = new Float64Array(MODES)
  const im = new Float64Array(MODES)

  // P_W e_m = B conj(B[m, :])^T
  for (let col = 0; col < k; col++) {
    const cr = Br[m * k + col]!
    const ci = -Bi[m * k + col]!

    for (let i = 0; i < MODES; i++) {
      const br = Br[i * k + col]!
      const bi = Bi[i * k + col]!

      re[i]! += br * cr - bi * ci
      im[i]! += br * ci + bi * cr
    }
  }

  if (kind === 'F') {
    for (let i = 0; i < MODES; i++) {
      re[i] = (i === m ? 1 : 0) - re[i]!
      im[i] = -im[i]!
    }
  }

  return { re, im }
}

// the antisymmetric pair whose Fourier components are P_k1(q) e_m1 (x) P_k2(-q) e_m2 at every q (a pair at contact,
// projected), normalized. symmetry -1 (the default) antisymmetrizes, +1 symmetrizes, 0 keeps the two members
// distinguishable (the raw product, member 1 the first index)
export function pairStart(
  t: Torus,
  mv: Moving,
  k1: Kind,
  m1: number,
  k2: Kind,
  m2: number,
  symmetry: -1 | 0 | 1 = -1,
): Pair {
  const raw = newPair(t)
  const N = t.sites.length

  t.momenta.forEach((q, j) => {
    const a = projected(mv, j, k1, m1)
    const b = projected(mv, t.negMomentum[j]!, k2, m2)
    const Mr = new Float64Array(FULL)
    const Mi = new Float64Array(FULL)

    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        Mr[x * MODES + z] = a.re[x]! * b.re[z]! - a.im[x]! * b.im[z]!
        Mi[x * MODES + z] = a.re[x]! * b.im[z]! + a.im[x]! * b.re[z]!
      }
    }

    t.sites.forEach((y, i) => {
      const ph =
        q[0]! * y[0]! + q[1]! * y[1]! + q[2]! * y[2]! + q[3]! * y[3]!
      const c = Math.cos(ph) / N
      const sn = Math.sin(ph) / N
      const o = i * FULL

      for (let k = 0; k < FULL; k++) {
        raw.re[o + k]! += c * Mr[k]! - sn * Mi[k]!
        raw.im[o + k]! += c * Mi[k]! + sn * Mr[k]!
      }
    })
  })

  const out = newPair(t)

  for (let i = 0; i < N; i++) {
    const n = t.neg[i]!

    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        const k = i * FULL + x * MODES + z
        const kk = n * FULL + z * MODES + x

        out.re[k] = raw.re[k]! + symmetry * raw.re[kk]!
        out.im[k] = raw.im[k]! + symmetry * raw.im[kk]!
      }
    }
  }

  const nrm = Math.sqrt(pairNorm(out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! /= nrm
    out.im[k]! /= nrm
  }

  return out
}

// ---- readings ----

// the weight at contact (both holes on one dock) and on the configurations where a HOLE-RELATIVE lift of K would fire
// (both on one dock, on two different lines: two lines each short one member)
export function contactWeights(
  t: Torus,
  s: Pair,
): { contact: number; twoLines: number } {
  const o = t.origin * FULL

  let contact = 0
  let twoLines = 0

  for (let d = 0; d < NR; d++) {
    for (let e = 0; e < NR; e++) {
      for (let a = 0; a < REG; a++) {
        for (let b = 0; b < REG; b++) {
          const k = o + (d * REG + a) * MODES + e * REG + b
          const w = s.re[k]! ** 2 + s.im[k]! ** 2

          contact += w

          if (LINE_OF[d] !== LINE_OF[e]) {
            twoLines += w
          }
        }
      }
    }
  }

  return { contact, twoLines }
}

// THE LIFTED TRIGGERS, over every configuration of n holes in the full sea that the box allows. A slot holds 8 members
// minus the holes on it. The slot rule's K fires at a dock with two or more SINGLE lines (a line with one slot empty and
// the other not), and the store acts on an EMPTY line (both slots empty). Returned: the least occupancy any slot reaches,
// and the number of configurations on which K's or the store's trigger appears. For two holes this is exhaustive over
// (relative dock, slot 1, slot 2); registers do not change a slot's count. `capacity` is the members a slot holds on the
// full sea (8, one per register component; E-FND-0160's roles and tones make it 8 x 3 x 2 = 48), and the configuration
// count stays per register pair.
export function seaTriggers(
  t: Torus,
  capacity = REG,
): {
  configurations: number
  leastOccupancy: number
  kTriggers: number
  storeTriggers: number
} {
  let configurations = 0
  let least = capacity
  let k = 0
  let store = 0

  for (let i = 0; i < t.sites.length; i++) {
    for (let d = 0; d < NR; d++) {
      for (let e = 0; e < NR; e++) {
        configurations++

        // occupancy of the slots of the dock holding member 1 (the dock of member 2 is the same when i is the origin)
        const occ = new Int32Array(NR).fill(capacity)

        occ[d]!--

        if (i === t.origin) {
          occ[e]!--
        }

        let singles = 0

        for (let l = 0; l < NR; l++) {
          const o = OPPOSITE[l]!

          least = Math.min(least, occ[l]!)

          if (l < o) {
            if ((occ[l] === 0) !== (occ[o] === 0)) {
              singles++
            }

            if (occ[l] === 0 && occ[o] === 0) {
              store++
            }
          }
        }

        if (singles >= 2) {
          k++
        }
      }
    }
  }

  return {
    configurations: configurations * REG * REG,
    leastOccupancy: least,
    kTriggers: k * REG * REG,
    storeTriggers: store * REG * REG,
  }
}

export { FULL, MODES }
