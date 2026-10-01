// AN ENERGY LEDGER FOR THE REGISTER RULE: THE PRIME-UNIT COUNT (E-FND-0159). A reversible cycle has no ground state
// by fiat: its eigenvalues lie on the unit circle. But every unit the register rule multiplies by is a power of ONE
// prime unit rho = (3 + w) / (3 + conj w) = ringUnit(1, 0) times a sixth root of 1 (ringUnit(k, j) = rho^k w^j, and rho
// has infinite order). So the exponent of rho in a cycle's eigenvalue is an integer, not an angle. This file reads that
// integer on stationary seas, and on the Slater seas the vacuum question compares.
//
//   the ledger          E(psi) = -d arg(lambda) / d theta, theta the angle of rho, every unit rho^k w^j of the rule
//                       held as e^(i (k theta + j pi / 3)). On a sea whose eigenvalue is rho^n w^j it is -n exactly. By
//                       Hellmann-Feynman on the product of beats (each piece is rho^(k_p C_p), the stream and the coin
//                       carry no rho) it is -sum_p k_p <C_p - C_p(full sea)>, each count read at the beat where p acts:
//                       for a mixer C = N_Q, so a hole in Q adds +k; for a pair piece C = (N_x - r)(N_y - r) = h_x h_y,
//                       so it adds -k h_x h_y. The full sea is 0. No branch cut enters, since nothing is taken mod 2 pi
//   ledgerBlocks        per torus momentum: the one-body cycle's eigenvalue clusters, and for each cluster, restricted
//                       to a register projector Pi that commutes with the rule (the half P+, or one SU(2)+ eigenspace),
//                       its dimension, its hole count sum_p k_p Tr(P Pi Q~_p) and its 8 x 8 sector blocks E^dag P Pi E
//                       (S at beat 1, D at beat 2, where the pair pieces act)
//   seaLedger           a Slater sea of holes, given as a choice of (cluster, part) per momentum: the one-body count, the
//                       pair count of the sector string and contact by Wick's theorem (direct and exchange), and each
//                       sector's SU(2)+ Casimir at one dock
//
// DETERMINISM: no random numbers. EXACT: the projectors are integer matrices over 24 and 48, the units ring units; the
// spectra and the Wick sums are floats, as measurement.

import { cycleMatrix } from '@/code/measure/swap-cone'
import { MODES, REGISTER_ROOTS } from '@/code/measure/spinor-register'
import { unitaryEigen, type Dense } from '@/code/measure/wilson-register'
import { type CMatrix } from '@/code/measure/dock-mixer'
import { type Torus } from '@/code/measure/register-sea'

const REG = 8

// a mixer of one beat: its sector projector (192 x 192, real) and the exponent of rho in its unit
export type LedgerMixer = { q: Float64Array; k: number }

export type LedgerRule = {
  name: string
  pieces: readonly CMatrix[]
  beat1: readonly LedgerMixer[]
  beat2: readonly LedgerMixer[]
  // the sector string's exponent per unit of min(V, cap), and the contact's at V = 0 (E-SPN-0175's physical angles:
  // ringUnit(-2, 1) a unit of V, so -2, and v^2 with v = ringUnit(2, 0), so 4); beat 1 on Q_S, beat 2 on Q_D reversed
  string: number
  contact: number
  cap: number
  // the sector bases, 192 x 8 real, Q = E E^T: S (beat 1) and D (beat 2)
  ES: Float64Array
  ED: Float64Array
}

// a register projector on the 192 modes, 1 (x) pi with pi 8 x 8 complex
export type RegisterProjector = { re: number[][]; im: number[][] }

export type Part = {
  dim: number
  // sum_p k_p Tr(P Pi Q~_p), Q~_p = Q_p at beat 1 and B1^dag Q_p B1 at beat 2
  count: number
  // E_S^dag P Pi E_S and E_D^dag B1 P Pi B1^dag E_D, 8 x 8 complex, row-major
  AS: Dense
  AD: Dense
}

export type Cluster = { phase: number; size: number; parts: Part[] }

export type Block = { K: readonly number[]; clusters: Cluster[] }

const lift = (p: RegisterProjector): Dense => {
  const re = new Float64Array(MODES * MODES)
  const im = new Float64Array(MODES * MODES)

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < REG; a++) {
      for (let b = 0; b < REG; b++) {
        re[(d * REG + a) * MODES + d * REG + b] = p.re[a]![b]!
        im[(d * REG + a) * MODES + d * REG + b] = p.im[a]![b]!
      }
    }
  }

  return { re, im }
}

// C = A B for n x n complex (A, B dense); B may be real (im null)
function mul(
  A: Dense,
  Bre: Float64Array,
  Bim: Float64Array | null,
  n: number,
  m: number,
): Dense {
  // A n x n, B n x m
  const re = new Float64Array(n * m)
  const im = new Float64Array(n * m)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!
      const ai = A.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < m; j++) {
        const br = Bre[k * m + j]!
        const bi = Bim ? Bim[k * m + j]! : 0

        re[i * m + j]! += ar * br - ai * bi
        im[i * m + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// (1 (x) p) Z for Z 192 x m: each dock slot's 8 register rows mixed by p (24 times cheaper than a dense product)
function liftMul(p: RegisterProjector, Z: Dense, m: number): Dense {
  const re = new Float64Array(MODES * m)
  const im = new Float64Array(MODES * m)

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < REG; a++) {
      const row = (d * REG + a) * m

      for (let b = 0; b < REG; b++) {
        const pr = p.re[a]![b]!
        const pi = p.im[a]![b]!

        if (pr === 0 && pi === 0) {
          continue
        }

        const src = (d * REG + b) * m

        for (let j = 0; j < m; j++) {
          const zr = Z.re[src + j]!
          const zi = Z.im[src + j]!

          re[row + j]! += pr * zr - pi * zi
          im[row + j]! += pr * zi + pi * zr
        }
      }
    }
  }

  return { re, im }
}

// A^dag for n x n
function dagger(A: Dense, n: number): Dense {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      re[j * n + i] = A.re[i * n + j]!
      im[j * n + i] = -A.im[i * n + j]!
    }
  }

  return { re, im }
}

const realDense = (q: Float64Array): Dense => ({
  re: q,
  im: new Float64Array(q.length),
})

// the spectral projector of a cluster, P = V V^dag over the given eigenvector columns
function clusterProjector(
  vre: Float64Array,
  vim: Float64Array,
  cols: readonly number[],
): Dense {
  const n = MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (const k of cols) {
    for (let i = 0; i < n; i++) {
      const ar = vre[i * n + k]!
      const ai = vim[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = vre[j * n + k]!
        const bi = -vim[j * n + k]!

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// Re Tr(G Z), n x n
function traceOf(G: Dense, Z: Dense): number {
  const n = MODES

  let s = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      s += G.re[i * n + j]! * Z.re[j * n + i]! - G.im[i * n + j]! * Z.im[j * n + i]!
    }
  }

  return s
}

// F^dag P H, 8 x 8, for F and H 192 x 8 complex
function sectorBlock(P: Dense, F: Dense, H: Dense): Dense {
  const n = MODES
  const PH = mul(P, H.re, H.im, n, REG)
  const re = new Float64Array(REG * REG)
  const im = new Float64Array(REG * REG)

  for (let a = 0; a < n; a++) {
    for (let e = 0; e < REG; e++) {
      const fr = F.re[a * REG + e]!
      const fi = -F.im[a * REG + e]!

      if (fr === 0 && fi === 0) {
        continue
      }

      for (let f = 0; f < REG; f++) {
        const hr = PH.re[a * REG + f]!
        const hi = PH.im[a * REG + f]!

        re[e * REG + f]! += fr * hr - fi * hi
        im[e * REG + f]! += fr * hi + fi * hr
      }
    }
  }

  return { re, im }
}

// the blocks at every momentum of the torus, for each register projector in `projectors` (one part per projector)
export function ledgerBlocks(
  rule: LedgerRule,
  t: Torus,
  projectors: readonly RegisterProjector[],
  clusterTolerance = 1e-7,
  momenta?: readonly number[],
): Block[] {
  const n = MODES
  const lifted = projectors.map(lift)
  const out: Block[] = []
  const which = momenta ?? t.momenta.map((_, j) => j)

  for (const j of which) {
    const K = t.momenta[j]!
    const U = cycleMatrix(rule.pieces, REGISTER_ROOTS, K)
    const B1 = cycleMatrix([rule.pieces[0]!], REGISTER_ROOTS, K)
    const B1d = dagger(B1, n)
    const e = unitaryEigen(U, n)
    // Q~ for the beat-2 mixers: B1^dag Q B1
    const tilde = rule.beat2.map(m => {
      const QB = mul(realDense(m.q), B1.re, B1.im, n, n)

      return { k: m.k, Z: mul(B1d, QB.re, QB.im, n, n) }
    })
    const beat1 = rule.beat1.map(m => ({ k: m.k, Z: realDense(m.q) }))
    // F_D = B1^dag E_D (192 x 8)
    const FD = mul(B1d, rule.ED, null, n, REG)
    const FS = realDense(rule.ES)
    const order = e.phases.map((p, k) => ({ p, k })).sort((a, b) => a.p - b.p)
    const groups: { phase: number; cols: number[] }[] = []

    for (const o of order) {
      const last = groups[groups.length - 1]

      if (last && Math.abs(o.p - last.phase) < clusterTolerance) {
        last.cols.push(o.k)
      } else {
        groups.push({ phase: o.p, cols: [o.k] })
      }
    }

    const perProjector = lifted.map((Pi, p) => ({
      Pi,
      zs: [...beat1, ...tilde].map(x => ({
        k: x.k,
        Z: liftMul(projectors[p]!, x.Z, n),
      })),
      PiES: liftMul(projectors[p]!, FS, REG),
      PiFD: liftMul(projectors[p]!, FD, REG),
    }))

    const clusters: Cluster[] = groups.map(g => {
      const P = clusterProjector(e.vre, e.vim, g.cols)

      return {
        phase: g.phase,
        size: g.cols.length,
        parts: perProjector.map(pp => ({
          dim: traceOf(P, pp.Pi),
          count: pp.zs.reduce((s, z) => s + z.k * traceOf(P, z.Z), 0),
          AS: sectorBlock(P, FS, pp.PiES),
          AD: sectorBlock(P, FD, pp.PiFD),
        })),
      }
    })

    out.push({ K, clusters })
  }

  return out
}

// ---- the Wick sums ----

export type Choice = { cluster: number; part: number }

export type SeaReading = {
  // per dock
  oneBody: number
  pair: number
  total: number
  // the mean hole count in each sector, and the variance of the count at one dock
  nS: number
  nD: number
  varS: number
  varD: number
  // the pair count's pieces per dock: string (direct, exchange) and contact, S minus D
  stringDirect: number
  stringExchange: number
  contactPart: number
  // holes per dock
  holes: number
  // <T^2> at one dock in each sector, when isospin generators are given (the SU(2)+ Casimir of the holes there)
  casimirS: number
  casimirD: number
}

// Hermitian 8 x 8 generators in each sector's coordinates, t = (i / 2) E^dag (1 (x) X_k) E
export type SectorIsospin = { S: Dense[]; D: Dense[] }

// the sector coordinates of 1 (x) x for an 8 x 8 register matrix x (real), E 192 x 8 real: E^T (1 (x) x) E
export function sectorImage(E: Float64Array, x: readonly (readonly number[])[]): number[][] {
  const out = Array.from({ length: REG }, () => Array<number>(REG).fill(0))

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < REG; a++) {
      for (let b = 0; b < REG; b++) {
        const xab = x[a]![b]!

        if (xab === 0) {
          continue
        }

        for (let e = 0; e < REG; e++) {
          const ea = E[(d * REG + a) * REG + e]!

          if (ea === 0) {
            continue
          }

          for (let f = 0; f < REG; f++) {
            out[e]![f]! += ea * xab * E[(d * REG + b) * REG + f]!
          }
        }
      }
    }
  }

  return out
}

// C = A B for 8 x 8 complex
const mul8c = (A: Dense, B: Dense): Dense => {
  const re = new Float64Array(64)
  const im = new Float64Array(64)

  for (let i = 0; i < REG; i++) {
    for (let k = 0; k < REG; k++) {
      const ar = A.re[i * REG + k]!
      const ai = A.im[i * REG + k]!

      for (let j = 0; j < REG; j++) {
        re[i * REG + j]! += ar * B.re[k * REG + j]! - ai * B.im[k * REG + j]!
        im[i * REG + j]! += ar * B.im[k * REG + j]! + ai * B.re[k * REG + j]!
      }
    }
  }

  return { re, im }
}

// <sum_k T_k T_k> for a Slater state with one-dock density rho (8 x 8, in the sector's coordinates, rho_ab =
// <h_b^dag h_a>): sum_k Tr(t rho)^2 + Tr(t rho t) - Tr(t rho t rho)
function casimir(rho: Dense, t: readonly Dense[]): number {
  let s = 0

  for (const g of t) {
    const gr = mul8c(g, rho)
    let tr = 0

    for (let i = 0; i < REG; i++) {
      tr += gr.re[i * REG + i]!
    }

    const grg = mul8c(gr, g)
    let a = 0

    for (let i = 0; i < REG; i++) {
      a += grg.re[i * REG + i]!
    }

    s += tr * tr + a - traceProduct(grg, rho)
  }

  return s
}

// w^(q_j - q_j') = sum_i min(V_i, cap) cos((q_j - q_j') . site_i), row-major over the momenta used
export function stringKernel(t: Torus, cap: number): Float64Array {
  const M = t.momenta.length
  const N = t.sites.length
  const C = new Float64Array(M * N)
  const S = new Float64Array(M * N)
  const w = Array.from({ length: N }, (_, i) => Math.min(t.V[i]!, cap))

  t.momenta.forEach((q, j) => {
    t.sites.forEach((s, i) => {
      const ph = q[0]! * s[0]! + q[1]! * s[1]! + q[2]! * s[2]! + q[3]! * s[3]!

      C[j * N + i] = Math.cos(ph)
      S[j * N + i] = Math.sin(ph)
    })
  })

  const out = new Float64Array(M * M)

  for (let a = 0; a < M; a++) {
    for (let b = a; b < M; b++) {
      let s = 0

      for (let i = 0; i < N; i++) {
        s += w[i]! * (C[a * N + i]! * C[b * N + i]! + S[a * N + i]! * S[b * N + i]!)
      }

      out[a * M + b] = s
      out[b * M + a] = s
    }
  }

  return out
}

const addInto = (acc: Dense, x: Dense): void => {
  for (let i = 0; i < acc.re.length; i++) {
    acc.re[i]! += x.re[i]!
    acc.im[i]! += x.im[i]!
  }
}

// Tr(A B), 8 x 8 complex, real part (the Wick sums are real)
const traceProduct = (A: Dense, B: Dense): number => {
  let s = 0

  for (let i = 0; i < REG; i++) {
    for (let k = 0; k < REG; k++) {
      s +=
        A.re[i * REG + k]! * B.re[k * REG + i]! -
        A.im[i * REG + k]! * B.im[k * REG + i]!
    }
  }

  return s
}

// the ledger of the Slater sea whose holes are the chosen (cluster, part) at each block; kernel from stringKernel over
// the same momenta as the blocks (a full torus)
export function seaLedger(
  rule: LedgerRule,
  t: Torus,
  blocks: readonly Block[],
  choose: (b: Block, j: number) => readonly Choice[],
  kernel: Float64Array,
  isospin?: SectorIsospin,
): SeaReading {
  const M = blocks.length
  const V = t.sites.length

  if (M !== V) {
    throw new Error('energy-ledger: the Wick sums need every momentum of the torus')
  }

  const AS: Dense[] = []
  const AD: Dense[] = []

  let oneBody = 0
  let holes = 0

  blocks.forEach((b, j) => {
    const s = { re: new Float64Array(64), im: new Float64Array(64) }
    const d = { re: new Float64Array(64), im: new Float64Array(64) }

    for (const c of choose(b, j)) {
      const p = b.clusters[c.cluster]!.parts[c.part]!

      oneBody += p.count
      holes += p.dim
      addInto(s, p.AS)
      addInto(d, p.AD)
    }

    AS.push(s)
    AD.push(d)
  })

  let wSum = 0

  for (let i = 0; i < V; i++) {
    wSum += Math.min(t.V[i]!, rule.cap)
  }

  const sector = (A: Dense[]): {
    n: number
    pairs: number
    exchange: number
    direct: number
    contact: number
    variance: number
    mean: Dense
  } => {
    const mean = { re: new Float64Array(64), im: new Float64Array(64) }

    A.forEach(a => addInto(mean, a))

    for (let i = 0; i < 64; i++) {
      mean.re[i]! /= V
      mean.im[i]! /= V
    }

    let n = 0

    for (let i = 0; i < REG; i++) {
      n += mean.re[i * REG + i]!
    }

    let X = 0

    for (let a = 0; a < M; a++) {
      for (let b = 0; b < M; b++) {
        const k = kernel[a * M + b]!

        if (k !== 0) {
          X += k * traceProduct(A[a]!, A[b]!)
        }
      }
    }

    X /= V

    const trMean2 = traceProduct(mean, mean)
    // sum over unordered pairs x < y of w <h_x h_y>, and sum over x of <h_x (h_x - 1) / 2>
    const direct = (V * n * n * wSum) / 2
    const exchange = X / 2

    return {
      n,
      direct,
      exchange,
      pairs: direct - exchange,
      contact: (V * (n * n - trMean2)) / 2,
      variance: n - trMean2,
      mean,
    }
  }

  const s = sector(AS)
  const d = sector(AD)
  // the pair pieces multiply a configuration by rho^(k h_x h_y) (beat 1, S) and rho^(-k h_x h_y) (beat 2, D), h the
  // hole counts, since (N - r)(N' - r) = h h'; E = -d arg / d theta, so a pair count adds -k to the ledger. The
  // one-body part has the opposite sign because a hole REMOVES the mode's phase
  const stringDirect = -rule.string * (s.direct - d.direct)
  const stringExchange = rule.string * (s.exchange - d.exchange)
  const contactPart = -rule.contact * (s.contact - d.contact)
  const pair = stringDirect + stringExchange + contactPart

  return {
    oneBody: oneBody / V,
    pair: pair / V,
    total: (oneBody + pair) / V,
    nS: s.n,
    nD: d.n,
    varS: s.variance,
    varD: d.variance,
    stringDirect: stringDirect / V,
    stringExchange: stringExchange / V,
    contactPart: contactPart / V,
    holes: holes / V,
    casimirS: isospin ? casimir(s.mean, isospin.S) : 0,
    casimirD: isospin ? casimir(d.mean, isospin.D) : 0,
  }
}
