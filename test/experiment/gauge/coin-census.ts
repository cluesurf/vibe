// A CENSUS OF CONSTANT-FREE COINS WITH A NILPOTENT STRAIGHT BLOCK (note/project/vibe/roadmap/moving-matter item 0090,
// research/nilpotent-step.md section 4, decision 019 point 3). Explores whether ANY coin built from the canonical
// slot-harmonic and Clifford projectors of R*'s dock, with phases from a finite set fixed in advance, could give a
// lone-third front that a Z3 centre field might cancel.
//
// THE FAMILY. Orthogonal projectors on C^24 (x) C^8 (slot d, register a; index d * 8 + a; R*'s own gamma):
//   P0 = Q_S (degree-0 slot harmonic (x) 1), QD (the Dirac p-wave E E^T), P1' = P1 (x) 1 - QD, P2, P3, P4 (degree-l
//   functions on the 24 roots, each orthogonal to every lower degree, (x) 1), and the three triality images of QD
//   (QD with its slots permuted by an order-3 element of W(F4) outside W(D4)), used only if they are orthogonal.
// THE PHASES. Ph = {1, -1, omega, conj omega, u, conj u}, u = ringUnit(-1, 4). A coin is G = 1 + sum (w_i - 1) P_i, a
// cycle two hops T X G1, T X G2 (U = T X G2 T X G1, the engine's form). T moves slot d by r_d and keeps the slot, X sends
// slot d to slot -d, so a walker that last moved along b moves next along e through the block G_(-e, b).
//
// STEPS.
//   STEP 0 controls, exact to 1e-12: R*'s G1 = 1 + (u - 1) Q_S, G2 = 1 + (conj u - 1) Q_D gives |N| = 3/448; merged
//          Q_S + Q_D with one phase gives straight 0 and turn norms |w - 1| sqrt(2 - r.r')/24; conj omega on Q_S, omega
//          on QD gives a 60-degree turn block of half rank.
//   STEP 1 per hop the straight block is sum (w_i - 1) (P_i)_(-a,a), a scalar c(G) on every slot, and the cycle's straight
//          block N_a = Pi_a Q1 Pi_a Q0 is nilpotent on every start iff c(G1) c(G2) = 0. Read exactly in Z[omega].
//   STEP 2 the front from the one-dock start (slot-uniform register mode 0), for n 1..6 cycles, per extreme direction: the
//          farthest (dock, final slot) with amplitude above 1e-12 of its path scale, and its paths on the 0/1 support.
//   STEP 3 for cycles whose every extremal nonzero (dock, final slot) at n 6 has 3 or more paths: their flux classes.
//
// GATES, fixed 2026-10-09 before any read (item 0090):
//   SURVIVOR  some cycle passes STEP 1 and at n 6 every extremal nonzero (dock, final slot) has 3 or more paths in three
//             flux classes
//   KILL      every STEP 1 survivor has some extremal nonzero (dock, final slot) with 2 or fewer paths, or no cycle passes
//             STEP 1
//   OPEN      STEP 0 fails or the census is incomplete (the covered fraction is reported)
//
// HOW STEP 2 IS READ. For a generic direction v the farthest dock in direction v is reached only by paths that maximize
// v . (displacement), and along those paths (hop k, slot) fixes the dock (a tie between two docks would need
// v . (x - x') = 0 on the integer mesh). So the farthest point of the 0/1 support, its paths and its amplitude are read by
// a max-plus pass over the 24 slots with path counts, and the amplitude by the sum over those paths of the block products.
// A single path whose blocks are all invertible has a nonzero amplitude exactly (the first hop puts w0 / sqrt 24 on mode
// 0 of every slot), so a whole class of cycles with the same block support and rank pattern is decided by one geometric
// read; every other class is read cycle by cycle. The instrument: the full dictionary evolution of the walk on the
// unbounded mesh, on sample cycles, must give the same farthest point and amplitude to 1e-12.
//
// DETERMINISM: no random numbers (directions come from a fixed Weyl sequence). FLOAT: measurement; STEP 1 is exact
// integer arithmetic in Z[omega], every other verdict a norm against a fixed tolerance or a count.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { partnerBasis } from '@/code/measure/register-meson'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const S = 24
const R = 8
const N = S * R
const REL = 1e-12
const ROOTS: readonly (readonly number[])[] = DOCK_ROOTS
const OPP: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -r[k]!)))
const dot4 = (a: readonly number[], b: readonly number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]! + a[3]! * b[3]!
// the turn type of a hop from last direction b to next direction e: index of r_e . r_b in [2, 1, 0, -1, -2]
const TURN_T = [2, 1, 0, -1, -2] as const
const TURN_NAME = ['straight', 'turn60', 'turn90', 'turn120', 'bounce'] as const
const turnOf = (e: number, b: number): number => 2 - dot4(ROOTS[e]!, ROOTS[b]!)

// ---- phases: exact (7 (w - 1) in Z[omega] as [x, y] = x + y omega) and float ----

export const PHASE_NAMES = ['1', '-1', 'omega', 'conj omega', 'u', 'conj u'] as const

export type Phase = { name: string; re: number; im: number; exact7: [number, number] }

export function phases(): Phase[] {
  const u = ringUnit(-1, 4)
  const a = Number(u.num[0])
  const b = Number(u.num[1])
  const den = Number(u.den)

  if (den !== 7) {
    throw new Error(`ringUnit(-1, 4) has denominator ${den}, not 7`)
  }

  const th = unitAngle(u)
  const s3 = Math.sqrt(3) / 2

  return [
    { name: '1', re: 1, im: 0, exact7: [0, 0] },
    { name: '-1', re: -1, im: 0, exact7: [-14, 0] },
    { name: 'omega', re: -0.5, im: s3, exact7: [-7, 7] },
    { name: 'conj omega', re: -0.5, im: -s3, exact7: [-14, -7] },
    { name: 'u', re: Math.cos(th), im: Math.sin(th), exact7: [a - 7, b] },
    // conj(a + b omega) = (a - b) - b omega
    { name: 'conj u', re: Math.cos(th), im: -Math.sin(th), exact7: [a - b - 7, -b] },
  ]
}

// the exact phases against their floats: x + y omega = (x - y/2) + i (y sqrt3 / 2), over 7, plus 1
export function phaseGap(ph: readonly Phase[]): number {
  let g = 0

  for (const p of ph) {
    const re = 1 + (p.exact7[0] - p.exact7[1] / 2) / 7
    const im = (p.exact7[1] * Math.sqrt(3)) / 2 / 7

    g = Math.max(g, Math.hypot(re - p.re, im - p.im), Math.abs(Math.hypot(p.re, p.im) - 1))
  }

  return g
}

// ---- the projector family ----

export type Family = {
  name: string
  names: string[]
  // real symmetric N x N projectors
  P: Float64Array[]
  dims: number[]
  // 24 (P_i)_(-a,a) as an integer (the antipodal block is that over 24 times 1, checked)
  antipodal24: number[]
  checks: Record<string, number>
}

function slotHarmonics(): { P: Float64Array[]; dims: number[] } {
  const basis: Float64Array[] = []
  const P: Float64Array[] = []
  const dims: number[] = []

  for (let l = 0; l <= 4; l++) {
    const fresh: Float64Array[] = []

    for (let e0 = 0; e0 <= l; e0++) {
      for (let e1 = 0; e0 + e1 <= l; e1++) {
        for (let e2 = 0; e0 + e1 + e2 <= l; e2++) {
          const e3 = l - e0 - e1 - e2
          const v = new Float64Array(S)

          for (let d = 0; d < S; d++) {
            const r = ROOTS[d]!

            v[d] = r[0]! ** e0 * r[1]! ** e1 * r[2]! ** e2 * r[3]! ** e3
          }

          const n0 = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

          for (let pass = 0; pass < 2; pass++) {
            for (const q of [...basis, ...fresh]) {
              let c = 0

              for (let d = 0; d < S; d++) {
                c += q[d]! * v[d]!
              }

              for (let d = 0; d < S; d++) {
                v[d]! -= c * q[d]!
              }
            }
          }

          const nv = Math.sqrt(v.reduce((s, x) => s + x * x, 0))

          if (nv > 1e-9 * Math.max(1, n0)) {
            fresh.push(v.map(x => x / nv))
          }
        }
      }
    }

    const Pl = new Float64Array(N * N)

    for (const q of fresh) {
      for (let c = 0; c < S; c++) {
        for (let b = 0; b < S; b++) {
          const x = q[c]! * q[b]!

          for (let a = 0; a < R; a++) {
            Pl[(c * R + a) * N + b * R + a]! += x
          }
        }
      }
    }

    basis.push(...fresh)
    P.push(Pl)
    dims.push(fresh.length)
  }

  return { P, dims }
}

function qdProjector(slotPerm?: readonly number[]): Float64Array {
  const E = partnerBasis()
  const Q = new Float64Array(N * N)

  // Q_(i, j) = sum_eta E[i][eta] E[j][eta]; a slot permutation p puts slot d's row at slot p[d]
  for (let i = 0; i < N; i++) {
    const pi = slotPerm ? slotPerm[Math.floor(i / R)]! * R + (i % R) : i

    for (let j = 0; j < N; j++) {
      const pj = slotPerm ? slotPerm[Math.floor(j / R)]! * R + (j % R) : j

      let s = 0

      for (let eta = 0; eta < R; eta++) {
        s += E[i * R + eta]! * E[j * R + eta]!
      }

      Q[pi * N + pj] = s
    }
  }

  return Q
}

function realMul(A: Float64Array, B: Float64Array): Float64Array {
  const O = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let l = 0; l < N; l++) {
      const a = A[i * N + l]!

      if (a === 0) {
        continue
      }

      for (let j = 0; j < N; j++) {
        O[i * N + j]! += a * B[l * N + j]!
      }
    }
  }

  return O
}

const maxAbsDiff = (A: Float64Array, B: Float64Array): number => {
  let g = 0

  for (let i = 0; i < A.length; i++) {
    g = Math.max(g, Math.abs(A[i]! - B[i]!))
  }

  return g
}

const maxAbs = (A: Float64Array): number => A.reduce((g, x) => Math.max(g, Math.abs(x)), 0)

const trace = (A: Float64Array): number => {
  let t = 0

  for (let i = 0; i < N; i++) {
    t += A[i * N + i]!
  }

  return t
}

// an order-3 element of W(F4) outside W(D4): a matrix with entries +-1/2 that maps the root set to itself and cubes to 1
// (the first in a fixed sign order); returned as the slot permutation d -> sigma(d)
export function trialityPermutation(): { matrix: number[][]; perm: number[] } {
  const key = (r: readonly number[]): string => r.join(',')
  const index = new Map(ROOTS.map((r, d) => [key(r), d]))

  for (let mask = 0; mask < 1 << 16; mask++) {
    const M = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => ((mask >> (i * 4 + j)) & 1 ? -0.5 : 0.5)))
    const mul = (A: number[][], B: number[][]): number[][] =>
      A.map((row, i) => row.map((_, j) => A[i]!.reduce((s, x, k) => s + x * B[k]![j]!, 0)))
    const MMt = mul(M, M.map((_, i) => M.map(row => row[i]!)))

    if (!MMt.every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-12))) {
      continue
    }

    const M3 = mul(mul(M, M), M)

    if (!M3.every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-12))) {
      continue
    }

    const perm: number[] = []

    for (const r of ROOTS) {
      const img = M.map(row => row.reduce((s, x, k) => s + x * r[k]!, 0))
      const d = index.get(key(img.map(x => Math.round(x))))

      if (d === undefined || img.some(x => Math.abs(x - Math.round(x)) > 1e-12)) {
        break
      }

      perm.push(d)
    }

    if (perm.length === S) {
      return { matrix: M, perm }
    }
  }

  throw new Error('no order-3 triality in W(F4) found')
}

export function familyChecks(name: string, names: string[], P: Float64Array[], dims: number[]): Family {
  const checks: Record<string, number> = {}
  const I = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    I[i * N + i] = 1
  }

  let idem = 0
  let orth = 0
  let sym = 0

  for (let i = 0; i < P.length; i++) {
    idem = Math.max(idem, maxAbsDiff(realMul(P[i]!, P[i]!), P[i]!))

    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        sym = Math.max(sym, Math.abs(P[i]![j * N + k]! - P[i]![k * N + j]!))
      }
    }

    for (let j = i + 1; j < P.length; j++) {
      orth = Math.max(orth, maxAbs(realMul(P[i]!, P[j]!)))
    }
  }

  const sum = new Float64Array(N * N)

  for (const Pi of P) {
    for (let k = 0; k < N * N; k++) {
      sum[k]! += Pi[k]!
    }
  }

  checks.idempotent = idem
  checks.orthogonal = orth
  checks.symmetric = sym
  checks.sumToOne = maxAbsDiff(sum, I)
  checks.traceGap = Math.max(...P.map((Pi, i) => Math.abs(trace(Pi) - dims[i]! * R)))

  // antipodal blocks: (P_i)_(-a, a) = (k / 24) 1 on every slot a
  const antipodal24: number[] = []
  let antiGap = 0

  for (const Pi of P) {
    const k = Pi[OPP[0]! * R * N + 0]! * 24
    const kr = Math.round(k)

    antiGap = Math.max(antiGap, Math.abs(k - kr))

    for (let a = 0; a < S; a++) {
      for (let x = 0; x < R; x++) {
        for (let y = 0; y < R; y++) {
          const v = Pi[(OPP[a]! * R + x) * N + a * R + y]!

          antiGap = Math.max(antiGap, Math.abs(v - (x === y ? kr / 24 : 0)))
        }
      }
    }

    antipodal24.push(kr)
  }

  checks.antipodalGap = antiGap

  return { name, names, P, dims, antipodal24, checks }
}

export type FamilyRead = {
  harmonicDims: number[]
  main: Family
  // the triality images: |QD QD_sigma|, |QD QD_sigma^2|, |QD_sigma QD_sigma^2| (0 if orthogonal), and their projector gaps
  triality: { matrix: number[][]; perm: number[]; overlap: number[]; idempotent: number; inP1: number; antipodal24: number[] }
  // the triality family, built only when the three images are orthogonal
  tri?: Family
  qdInP1: number
}

export function buildFamilies(): FamilyRead {
  const h = slotHarmonics()
  const QD = qdProjector()
  const P1 = h.P[1]!
  const P1p = P1.map((x, k) => x - QD[k]!)
  const main = familyChecks('main', ['P0 (Q_S)', 'QD', "P1'", 'P2', 'P3', 'P4'], [h.P[0]!, QD, P1p, h.P[2]!, h.P[3]!, h.P[4]!], [
    h.dims[0]!,
    1,
    h.dims[1]! - 1,
    h.dims[2]!,
    h.dims[3]!,
    h.dims[4]!,
  ])

  // QD inside P1 (x) 1
  const qdInP1 = maxAbsDiff(realMul(P1, QD), QD)
  const tr = trialityPermutation()
  const p2 = tr.perm.map(d => tr.perm[d]!)
  const Q1 = qdProjector(tr.perm)
  const Q2 = qdProjector(p2)
  const overlap = [maxAbs(realMul(QD, Q1)), maxAbs(realMul(QD, Q2)), maxAbs(realMul(Q1, Q2))]
  const idempotent = Math.max(maxAbsDiff(realMul(Q1, Q1), Q1), maxAbsDiff(realMul(Q2, Q2), Q2))
  const inP1 = Math.max(maxAbsDiff(realMul(P1, Q1), Q1), maxAbsDiff(realMul(P1, Q2), Q2))
  const anti = [Q1, Q2].map(Q => Math.round(Q[OPP[0]! * R * N]! * 24))
  const read: FamilyRead = {
    harmonicDims: h.dims,
    main,
    triality: { matrix: tr.matrix, perm: tr.perm, overlap, idempotent, inP1, antipodal24: anti },
    qdInP1,
  }

  if (Math.max(...overlap) < 1e-12) {
    const rest = P1.map((x, k) => x - QD[k]! - Q1[k]! - Q2[k]!)

    read.tri = familyChecks(
      'triality',
      ['P0 (Q_S)', 'QD', 'QD sigma', 'QD sigma^2', "P1''", 'P2', 'P3', 'P4'],
      [h.P[0]!, QD, Q1, Q2, rest, h.P[2]!, h.P[3]!, h.P[4]!],
      [h.dims[0]!, 1, 1, 1, h.dims[1]! - 3, h.dims[2]!, h.dims[3]!, h.dims[4]!],
    )
  }

  return read
}

// ---- coins and their slot blocks ----

// a coin: one phase index per projector of the family
export type Coin = Int8Array

// the 8 x 8 complex block G_(c, b) of G = 1 + sum (w_i - 1) P_i, as [re 64, im 64]
export function coinBlock(fam: Family, ph: readonly Phase[], coin: Coin, c: number, b: number): Float64Array {
  const out = new Float64Array(2 * R * R)

  for (let x = 0; x < R; x++) {
    for (let y = 0; y < R; y++) {
      let re = c === b && x === y ? 1 : 0
      let im = 0

      for (let i = 0; i < fam.P.length; i++) {
        const w = ph[coin[i]!]!
        const p = fam.P[i]![(c * R + x) * N + b * R + y]!

        re += (w.re - 1) * p
        im += w.im * p
      }

      out[x * R + y] = re
      out[R * R + x * R + y] = im
    }
  }

  return out
}

// the straight scalar of one hop, exactly: 168 c(G) = sum antipodal24_i * 7 (w_i - 1) in Z[omega]
export function straightExact(fam: Family, ph: readonly Phase[], coin: Coin): [number, number] {
  let x = 0
  let y = 0

  for (let i = 0; i < fam.P.length; i++) {
    const e = ph[coin[i]!]!.exact7

    x += fam.antipodal24[i]! * e[0]
    y += fam.antipodal24[i]! * e[1]
  }

  return [x, y]
}

// singular values squared of an 8 x 8 complex block (eigenvalues of B^dag B by a cyclic Jacobi on its 16 x 16 real form)
export function blockSingular2(B: Float64Array): number[] {
  const n = 2 * R
  const A = new Float64Array(n * n)

  // H = B^dag B (Hermitian), real form [[Hr, -Hi], [Hi, Hr]]
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < R; j++) {
      let hr = 0
      let hi = 0

      for (let k = 0; k < R; k++) {
        const ar = B[k * R + i]!
        const ai = -B[R * R + k * R + i]!
        const br = B[k * R + j]!
        const bi = B[R * R + k * R + j]!

        hr += ar * br - ai * bi
        hi += ar * bi + ai * br
      }

      A[i * n + j] = hr
      A[(i + R) * n + j + R] = hr
      A[(i + R) * n + j] = hi
      A[i * n + j + R] = -hi
    }
  }

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += A[p * n + q]! ** 2
      }
    }

    if (off < 1e-34) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q]!

        if (Math.abs(apq) < 1e-300) {
          continue
        }

        const theta = (A[q * n + q]! - A[p * n + p]!) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const akp = A[k * n + p]!
          const akq = A[k * n + q]!

          A[k * n + p] = c * akp - s * akq
          A[k * n + q] = s * akp + c * akq
        }

        for (let k = 0; k < n; k++) {
          const apk = A[p * n + k]!
          const aqk = A[q * n + k]!

          A[p * n + k] = c * apk - s * aqk
          A[q * n + k] = s * apk + c * aqk
        }
      }
    }
  }

  // each eigenvalue of H appears twice in the real form
  const ev = Array.from({ length: n }, (_, i) => Math.max(0, A[i * n + i]!)).sort((a, b) => b - a)

  return ev.filter((_, i) => i % 2 === 0)
}

// the rank of a block, counted above tol times the coin's scale (1)
const RANK_TOL2 = 1e-20

export function blockRank(B: Float64Array): { rank: number; least: number } {
  const sv = blockSingular2(B)
  const kept = sv.filter(x => x > RANK_TOL2)

  return { rank: kept.length, least: kept.length ? Math.sqrt(kept[kept.length - 1]!) : 0 }
}

// per turn type, the rank of G_(-e, b) on every pair of that type: one rank per type, or -1 if pairs disagree. Also the
// least nonzero singular value seen and the greatest zero one
export type CoinSignature = { ranks: number[]; least: number; zeroMax: number; uniform: boolean }

export function coinSignature(fam: Family, ph: readonly Phase[], coin: Coin, allPairs: boolean): CoinSignature {
  const ranks = [-2, -2, -2, -2, -2]
  let least = Infinity
  let zeroMax = 0
  let uniform = true

  for (let b = 0; b < S; b++) {
    for (let e = 0; e < S; e++) {
      const t = turnOf(e, b)

      if (!allPairs && ranks[t] !== -2) {
        continue
      }

      const B = coinBlock(fam, ph, coin, OPP[e]!, b)
      const sv = blockSingular2(B)

      for (const x of sv) {
        if (x > RANK_TOL2) {
          least = Math.min(least, Math.sqrt(x))
        } else {
          zeroMax = Math.max(zeroMax, Math.sqrt(x))
        }
      }

      const r = sv.filter(x => x > RANK_TOL2).length

      if (ranks[t] === -2) {
        ranks[t] = r
      } else if (ranks[t] !== r) {
        uniform = false
        ranks[t] = -1
      }
    }

    if (!allPairs && b === 0) {
      break
    }
  }

  return { ranks, least, zeroMax, uniform }
}

// ---- the front on the unbounded mesh: a dictionary of (dock, slot) ----

const keyOf = (x: readonly number[]): number => ((x[0]! + 64) * 128 + (x[1]! + 64)) * 16384 + (x[2]! + 64) * 128 + (x[3]! + 64)
const coordsOf = (k: number): number[] => {
  const hi = Math.floor(k / 16384)
  const lo = k % 16384

  return [Math.floor(hi / 128) - 64, (hi % 128) - 64, Math.floor(lo / 128) - 64, (lo % 128) - 64]
}

// the full block table of a coin: blocks[e * 24 + b] = G_(-e, b) (the move from last direction b to next direction e),
// or null when it is zero
export type HopTable = (Float64Array | null)[]

export function hopTable(fam: Family, ph: readonly Phase[], coin: Coin): HopTable {
  const out: HopTable = []

  for (let e = 0; e < S; e++) {
    for (let b = 0; b < S; b++) {
      const B = coinBlock(fam, ph, coin, OPP[e]!, b)
      const sv = blockSingular2(B)

      out.push(sv[0]! > RANK_TOL2 ? B : null)
    }
  }

  return out
}

// the one-dock start: slot-uniform, register mode 0
export function startVector(): Float64Array {
  const s = new Float64Array(2 * N)

  for (let d = 0; d < S; d++) {
    s[d * R] = 1 / Math.sqrt(S)
  }

  return s
}

// the full dictionary evolution of 2n hops: the state maps a dock key to a 2N vector (slot = last direction). The first hop
// applies G1 to the start's dock vector, then X and T
export function evolveFull(
  fam: Family,
  ph: readonly Phase[],
  G1: Coin,
  G2: Coin,
  hops: number,
): Map<number, Float64Array> {
  const full = (coin: Coin): Float64Array => {
    const G = new Float64Array(2 * N * N)

    for (let c = 0; c < S; c++) {
      for (let b = 0; b < S; b++) {
        const B = coinBlock(fam, ph, coin, c, b)

        for (let x = 0; x < R; x++) {
          for (let y = 0; y < R; y++) {
            G[(c * R + x) * N + b * R + y] = B[x * R + y]!
            G[N * N + (c * R + x) * N + b * R + y] = B[R * R + x * R + y]!
          }
        }
      }
    }

    return G
  }
  const Gs = [full(G1), full(G2)]

  let state = new Map<number, Float64Array>([[keyOf([0, 0, 0, 0]), startVector()]])

  for (let k = 0; k < hops; k++) {
    const G = Gs[k % 2]!
    const next = new Map<number, Float64Array>()

    for (const [key, v] of state) {
      const x = coordsOf(key)
      // w = G v, then slot c goes to slot -c and moves by r_(-c)
      const w = new Float64Array(2 * N)

      for (let i = 0; i < N; i++) {
        let re = 0
        let im = 0

        for (let j = 0; j < N; j++) {
          const vr = v[j]!
          const vi = v[N + j]!

          if (vr === 0 && vi === 0) {
            continue
          }

          const gr = G[i * N + j]!
          const gi = G[N * N + i * N + j]!

          re += gr * vr - gi * vi
          im += gr * vi + gi * vr
        }

        w[i] = re
        w[N + i] = im
      }

      for (let c = 0; c < S; c++) {
        const e = OPP[c]!

        let nz = false

        for (let a = 0; a < R; a++) {
          if (w[c * R + a] !== 0 || w[N + c * R + a] !== 0) {
            nz = true
            break
          }
        }

        if (!nz) {
          continue
        }

        const y = x.map((z, i) => z + ROOTS[e]![i]!)
        const ky = keyOf(y)

        let t = next.get(ky)

        if (!t) {
          t = new Float64Array(2 * N)
          next.set(ky, t)
        }

        for (let a = 0; a < R; a++) {
          t[e * R + a]! += w[c * R + a]!
          t[N + e * R + a]! += w[N + c * R + a]!
        }
      }
    }

    state = next
  }

  return state
}

// ---- the geometric front read: max-plus over the slots with path counts and amplitudes ----

export type FrontPoint = {
  // projection v . x of the farthest point, the final slots there with their path counts and amplitude norms
  value: number
  slots: number[]
  paths: number[]
  amplitude: number[]
  // the path scale per final slot (sum over its paths of the product of block norms, times |start|)
  scale: number[]
}

// directions: the 24 roots, 8 axes, 16 (+-1,+-1,+-1,+-1), 96 (2,1,1,0)-type, each perturbed by a fixed small generic vector,
// plus 400 Weyl-sequence directions
export function frontDirections(): number[][] {
  const out: number[][] = []
  const pert = [0.0123, 0.00731, 0.00419, 0.00187]
  const add = (v: number[]): void => {
    const n = Math.hypot(...v)

    out.push(v.map((x, i) => x / n + pert[i]!))
  }

  for (const r of ROOTS) {
    add([...r])
  }

  for (let i = 0; i < 4; i++) {
    for (const s of [1, -1]) {
      const v = [0, 0, 0, 0]

      v[i] = s
      add(v)
    }
  }

  for (let m = 0; m < 16; m++) {
    add([0, 1, 2, 3].map(i => ((m >> i) & 1 ? -1 : 1)))
  }

  const perms = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 2, 1, 3],
    [0, 2, 3, 1],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [1, 2, 0, 3],
    [1, 2, 3, 0],
    [1, 3, 0, 2],
    [1, 3, 2, 0],
    [2, 0, 1, 3],
    [2, 0, 3, 1],
    [2, 1, 0, 3],
    [2, 1, 3, 0],
    [2, 3, 0, 1],
    [2, 3, 1, 0],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [3, 1, 0, 2],
    [3, 1, 2, 0],
    [3, 2, 0, 1],
    [3, 2, 1, 0],
  ]
  const seen = new Set<string>()

  for (const p of perms) {
    for (let m = 0; m < 8; m++) {
      const base = [2, 1, 1, 0]
      const v = [0, 0, 0, 0]

      for (let i = 0; i < 4; i++) {
        v[p[i]!] = base[i]! * ((m >> Math.min(i, 2)) & 1 ? -1 : 1)
      }

      const k = v.join(',')

      if (!seen.has(k)) {
        seen.add(k)
        add(v)
      }
    }
  }

  const alpha = [0.7548776662466927, 0.5698402909980532, 0.4301597090019468, 0.3247179572447460]

  for (let j = 1; j <= 400; j++) {
    // a deterministic quasi-uniform direction on the 3-sphere from four Weyl coordinates (inverse normal by Box-Muller)
    const u = alpha.map(a => (j * a) % 1)
    const g = [
      Math.sqrt(-2 * Math.log(Math.max(1e-12, u[0]!))) * Math.cos(2 * Math.PI * u[1]!),
      Math.sqrt(-2 * Math.log(Math.max(1e-12, u[0]!))) * Math.sin(2 * Math.PI * u[1]!),
      Math.sqrt(-2 * Math.log(Math.max(1e-12, u[2]!))) * Math.cos(2 * Math.PI * u[3]!),
      Math.sqrt(-2 * Math.log(Math.max(1e-12, u[2]!))) * Math.sin(2 * Math.PI * u[3]!),
    ]

    add(g)
  }

  return out
}

// the support of a coin: allowed[e * 24 + b] when the block G_(-e, b) is nonzero, per turn type from the signature
export function supportOf(sig: CoinSignature): Uint8Array {
  const out = new Uint8Array(S * S)

  for (let e = 0; e < S; e++) {
    for (let b = 0; b < S; b++) {
      out[e * S + b] = sig.ranks[turnOf(e, b)]! !== 0 ? 1 : 0
    }
  }

  return out
}

// max-plus over 2n hops in direction v on the support (the first hop goes to every slot): the farthest value, and for
// each final slot at that value its path count; plus the optimal edges per hop for the amplitude pass
export type GeoFront = { value: number; finals: { slot: number; paths: number }[]; F: Float64Array[]; Bk: Float64Array[] }

const EPS_V = 1e-9

export function geoFront(sup: readonly Uint8Array[], v: readonly number[], hops: number): GeoFront {
  const proj = ROOTS.map(r => dot4(r, v))
  // F[k][s]: the best projection after k + 1 hops ending in slot s, -Infinity if unreachable
  const F: Float64Array[] = []
  const first = new Float64Array(S)

  for (let s = 0; s < S; s++) {
    first[s] = proj[s]!
  }

  F.push(first)

  for (let k = 1; k < hops; k++) {
    const A = sup[k % 2]!
    const prev = F[k - 1]!
    const cur = new Float64Array(S).fill(-Infinity)

    for (let e = 0; e < S; e++) {
      for (let b = 0; b < S; b++) {
        if (A[e * S + b] && prev[b]! > -Infinity) {
          cur[e] = Math.max(cur[e]!, prev[b]! + proj[e]!)
        }
      }
    }

    F.push(cur)
  }

  const last = F[hops - 1]!
  const value = Math.max(...last)
  // backward: Bk[k][s] the best remaining gain from slot s after hop k + 1
  const Bk: Float64Array[] = Array.from({ length: hops }, () => new Float64Array(S))

  Bk[hops - 1] = new Float64Array(S).fill(0)

  for (let k = hops - 2; k >= 0; k--) {
    const A = sup[(k + 1) % 2]!
    const cur = new Float64Array(S).fill(-Infinity)

    for (let b = 0; b < S; b++) {
      for (let e = 0; e < S; e++) {
        if (A[e * S + b] && Bk[k + 1]![e]! > -Infinity) {
          cur[b] = Math.max(cur[b]!, proj[e]! + Bk[k + 1]![e]!)
        }
      }
    }

    Bk[k] = cur
  }

  // path counts on optimal edges
  let cnt = new Float64Array(S)

  for (let s = 0; s < S; s++) {
    cnt[s] = Math.abs(F[0]![s]! + Bk[0]![s]! - value) < EPS_V ? 1 : 0
  }

  for (let k = 1; k < hops; k++) {
    const A = sup[k % 2]!
    const nx = new Float64Array(S)

    for (let e = 0; e < S; e++) {
      if (Math.abs(F[k]![e]! + Bk[k]![e]! - value) >= EPS_V) {
        continue
      }

      for (let b = 0; b < S; b++) {
        if (A[e * S + b] && cnt[b]! > 0 && Math.abs(F[k - 1]![b]! + proj[e]! - F[k]![e]!) < EPS_V) {
          nx[e]! += cnt[b]!
        }
      }
    }

    cnt = nx
  }

  const finals: { slot: number; paths: number }[] = []

  for (let s = 0; s < S; s++) {
    if (Math.abs(last[s]! - value) < EPS_V && cnt[s]! > 0) {
      finals.push({ slot: s, paths: cnt[s]! })
    }
  }

  return { value, finals, F, Bk }
}

// the amplitude at each optimal final slot: the sum over optimal paths of the block products on the start, by a pass over
// optimal edges only (on optimal paths (hop, slot) fixes the dock for a generic v)
export type BlockGetter = (e: number, b: number) => Float64Array | null

export function geoAmplitude(
  tables: readonly BlockGetter[],
  sup: readonly Uint8Array[],
  v: readonly number[],
  hops: number,
  g: GeoFront,
  start0: Float64Array,
): { slot: number; paths: number; amp: number; scale: number }[] {
  const proj = ROOTS.map(r => dot4(r, v))
  const opt = (k: number, s: number): boolean => Math.abs(g.F[k]![s]! + g.Bk[k]![s]! - g.value) < EPS_V
  // amplitude after the first hop in slot e: (G1 s0)_(-e), the 8-vector
  let amp: (Float64Array | null)[] = []
  let scl = new Float64Array(S)
  const sn = Math.sqrt(start0.reduce((s, x) => s + x * x, 0))

  for (let e = 0; e < S; e++) {
    if (!opt(0, e)) {
      amp.push(null)
      continue
    }

    const w = new Float64Array(2 * R)

    for (let b = 0; b < S; b++) {
      const B = tables[0]!(e, b)

      if (!B) {
        continue
      }

      for (let x = 0; x < R; x++) {
        for (let y = 0; y < R; y++) {
          const br = B[x * R + y]!
          const bi = B[R * R + x * R + y]!
          const sr = start0[b * R + y]!
          const si = start0[N + b * R + y]!

          w[x]! += br * sr - bi * si
          w[R + x]! += br * si + bi * sr
        }
      }
    }

    amp.push(w)
    scl[e] = sn
  }

  for (let k = 1; k < hops; k++) {
    const T = tables[k % 2]!
    const A = sup[k % 2]!
    const nx: (Float64Array | null)[] = []
    const ns = new Float64Array(S)

    for (let e = 0; e < S; e++) {
      if (!opt(k, e)) {
        nx.push(null)
        continue
      }

      const w = new Float64Array(2 * R)

      for (let b = 0; b < S; b++) {
        const a = amp[b]

        if (!a || !A[e * S + b] || Math.abs(g.F[k - 1]![b]! + proj[e]! - g.F[k]![e]!) >= EPS_V) {
          continue
        }

        const B = T(e, b)

        if (!B) {
          continue
        }

        let bn = 0

        for (let x = 0; x < 2 * R * R; x++) {
          bn += B[x]! ** 2
        }

        ns[e]! += scl[b]! * Math.sqrt(bn)

        for (let x = 0; x < R; x++) {
          for (let y = 0; y < R; y++) {
            const br = B[x * R + y]!
            const bi = B[R * R + x * R + y]!

            w[x]! += br * a[y]! - bi * a[R + y]!
            w[R + x]! += br * a[R + y]! + bi * a[y]!
          }
        }
      }

      nx.push(w)
    }

    amp = nx
    scl = ns
  }

  return g.finals.map(f => {
    const a = amp[f.slot]!

    return { slot: f.slot, paths: f.paths, amp: Math.sqrt(a.reduce((s, x) => s + x * x, 0)), scale: scl[f.slot]! }
  })
}

// the farthest nonzero point of a full evolution in direction v: value, and per final slot the amplitude norm
export function fullFront(
  state: Map<number, Float64Array>,
  v: readonly number[],
): { value: number; slots: { slot: number; amp: number; dock: number[] }[] } {
  let best = -Infinity
  const rows: { val: number; slot: number; amp: number; dock: number[] }[] = []

  for (const [key, w] of state) {
    const x = coordsOf(key)
    const val = dot4(x, v)

    for (let s = 0; s < S; s++) {
      let p = 0

      for (let a = 0; a < R; a++) {
        p += w[s * R + a]! ** 2 + w[N + s * R + a]! ** 2
      }

      if (p > 0) {
        rows.push({ val, slot: s, amp: Math.sqrt(p), dock: x })
      }
    }
  }

  // amplitudes above 1e-12 of the largest (the full read's own relative floor)
  const top = Math.max(...rows.map(r => r.amp))

  for (const r of rows) {
    if (r.amp > REL * top) {
      best = Math.max(best, r.val)
    }
  }

  return {
    value: best,
    slots: rows.filter(r => Math.abs(r.val - best) < EPS_V && r.amp > REL * top).map(r => ({ slot: r.slot, amp: r.amp, dock: r.dock })),
  }
}

// ---- STEP 0: the controls ----

const coinOf = (fam: Family, assign: Record<string, number>): Coin => {
  const c = new Int8Array(fam.P.length)

  for (const [name, p] of Object.entries(assign)) {
    const i = fam.names.indexOf(name)

    if (i < 0) {
      throw new Error(`no projector ${name}`)
    }

    c[i] = p
  }

  return c
}

// 8 x 8 complex product and the gap of a block from z times 1
function blockMul(A: Float64Array, B: Float64Array): Float64Array {
  const O = new Float64Array(2 * R * R)

  for (let i = 0; i < R; i++) {
    for (let l = 0; l < R; l++) {
      const ar = A[i * R + l]!
      const ai = A[R * R + i * R + l]!

      for (let j = 0; j < R; j++) {
        O[i * R + j]! += ar * B[l * R + j]! - ai * B[R * R + l * R + j]!
        O[R * R + i * R + j]! += ar * B[R * R + l * R + j]! + ai * B[l * R + j]!
      }
    }
  }

  return O
}

const scalarGap = (B: Float64Array, zr: number, zi: number): number => {
  let g = 0

  for (let x = 0; x < R; x++) {
    for (let y = 0; y < R; y++) {
      g = Math.max(g, Math.hypot(B[x * R + y]! - (x === y ? zr : 0), B[R * R + x * R + y]! - (x === y ? zi : 0)))
    }
  }

  return g
}

export type Step0 = {
  phaseGap: number
  // R*: |N_a| per slot against 3/448, and N_a's gap from a scalar
  rstarN: number
  rstarGap: number
  rstarScalarGap: number
  rstarExact: [number, number][]
  // merged Q_S + Q_D, one phase w (every w != 1): the straight block's largest entry, and the worst gap of every turn
  // block's singular values from |w - 1| sqrt(2 - t)/24
  mergedStraight: number
  mergedTurnGap: number
  mergedTurnNorms: number[]
  // conj omega on Q_S, omega on QD: ranks of the 60, 90, 120 degree turns over all pairs, the straight scalar
  ternaryRanks: number[]
  ternaryUniform: boolean
  ternaryStraight: [number, number]
  ternaryStraightGap: number
  pass: boolean
}

export function step0(fam: Family): Step0 {
  const ph = phases()
  const U = 4
  const Ubar = 5
  const G1 = coinOf(fam, { 'P0 (Q_S)': U })
  const G2 = coinOf(fam, { QD: Ubar })
  const want = 3 / 448

  let rstarGap = 0
  let rstarScalarGap = 0
  let rstarN = 0

  for (let a = 0; a < S; a++) {
    const Nb = blockMul(coinBlock(fam, ph, G2, OPP[a]!, a), coinBlock(fam, ph, G1, OPP[a]!, a))
    const zr = Nb[0]!
    const zi = Nb[R * R]!

    rstarN = Math.hypot(zr, zi)
    rstarGap = Math.max(rstarGap, Math.abs(rstarN - want))
    rstarScalarGap = Math.max(rstarScalarGap, scalarGap(Nb, zr, zi))
  }

  // merged
  let mergedStraight = 0
  let mergedTurnGap = 0
  const mergedTurnNorms = [0, 0, 0]

  for (let p = 1; p < 6; p++) {
    const coin = coinOf(fam, { 'P0 (Q_S)': p, QD: p })
    const w1 = Math.hypot(ph[p]!.re - 1, ph[p]!.im)

    for (let b = 0; b < S; b++) {
      for (let e = 0; e < S; e++) {
        const t = dot4(ROOTS[e]!, ROOTS[b]!)
        const B = coinBlock(fam, ph, coin, OPP[e]!, b)

        if (t === 2) {
          mergedStraight = Math.max(mergedStraight, maxAbs(B))
          continue
        }

        if (t === -2) {
          continue
        }

        const sv = blockSingular2(B).map(Math.sqrt)
        const target = (w1 * Math.sqrt(2 - t)) / 24

        for (const s of sv) {
          mergedTurnGap = Math.max(mergedTurnGap, Math.abs(s - target))
        }

        if (p === 4) {
          mergedTurnNorms[1 - t] = sv[0]!
        }
      }
    }
  }

  // ternary
  const tern = coinOf(fam, { 'P0 (Q_S)': 3, QD: 2 })
  const sig = coinSignature(fam, ph, tern, true)
  const st = coinBlock(fam, ph, tern, OPP[0]!, 0)
  const ternaryStraightGap = scalarGap(st, 0, -Math.sqrt(3) / 24)
  const phaseGapV = phaseGap(ph)
  const pass =
    phaseGapV < 1e-12 &&
    rstarGap < 1e-12 &&
    rstarScalarGap < 1e-12 &&
    mergedStraight < 1e-12 &&
    mergedTurnGap < 1e-12 &&
    sig.uniform &&
    sig.ranks[1] === 4 &&
    ternaryStraightGap < 1e-12

  return {
    phaseGap: phaseGapV,
    rstarN,
    rstarGap,
    rstarScalarGap,
    rstarExact: [straightExact(fam, ph, G1), straightExact(fam, ph, G2)],
    mergedStraight,
    mergedTurnGap,
    mergedTurnNorms,
    ternaryRanks: sig.ranks.slice(1, 4),
    ternaryUniform: sig.uniform,
    ternaryStraight: [st[0]!, st[R * R]!],
    ternaryStraightGap,
    pass,
  }
}

// ---- STEP 1: the exact straight filter and the coin signatures ----

export type CoinClass = {
  // the rank signature per turn type (straight, 60, 90, 120, bounce), and how many coins carry it, with straight zero and not
  ranks: number[]
  zero: number
  nonzero: number
  // the first coins of each kind (phase indices), for reads and samples
  zeroCoins: number[][]
  nonzeroCoins: number[][]
  // the least nonzero singular value and the greatest zero one, over the class
  least: number
  zeroMax: number
}

export type Step1 = {
  family: string
  coins: number
  zeroStraight: number
  classes: CoinClass[]
  // cycles passing STEP 1: (G1, G2) with c(G1) c(G2) = 0
  cycles: number
  // the separation of the rank tolerance: least nonzero and greatest zero singular value over every coin
  least: number
  zeroMax: number
  // every class representative read on all 576 pairs: ranks uniform per turn type
  uniform: boolean
  seconds: number
}

const SAMPLE = 64

export function step1(fam: Family): Step1 {
  const t0 = Date.now()
  const ph = phases()
  const m = fam.P.length
  const total = 6 ** m
  const classes = new Map<string, CoinClass>()

  let zeroStraight = 0
  let least = Infinity
  let zeroMax = 0

  for (let idx = 0; idx < total; idx++) {
    const coin = new Int8Array(m)

    let r = idx

    for (let i = 0; i < m; i++) {
      coin[i] = r % 6
      r = Math.floor(r / 6)
    }

    const [x, y] = straightExact(fam, ph, coin)
    const zero = x === 0 && y === 0
    const sig = coinSignature(fam, ph, coin, false)
    const key = sig.ranks.join('')

    let c = classes.get(key)

    if (!c) {
      c = { ranks: sig.ranks, zero: 0, nonzero: 0, zeroCoins: [], nonzeroCoins: [], least: Infinity, zeroMax: 0 }
      classes.set(key, c)
    }

    if (zero) {
      zeroStraight++
      c.zero++

      if (c.zeroCoins.length < SAMPLE) {
        c.zeroCoins.push(Array.from(coin))
      }
    } else {
      c.nonzero++

      if (c.nonzeroCoins.length < SAMPLE) {
        c.nonzeroCoins.push(Array.from(coin))
      }
    }

    c.least = Math.min(c.least, sig.least)
    c.zeroMax = Math.max(c.zeroMax, sig.zeroMax)
    least = Math.min(least, sig.least)
    zeroMax = Math.max(zeroMax, sig.zeroMax)
  }

  // the zero-straight filter must agree with the float straight block (exact witness): straight rank 0 iff exact zero
  let uniform = true

  for (const c of classes.values()) {
    for (const coin of [...c.zeroCoins.slice(0, 4), ...c.nonzeroCoins.slice(0, 4)]) {
      const sig = coinSignature(fam, ph, Int8Array.from(coin), true)

      if (!sig.uniform || sig.ranks.join('') !== c.ranks.join('')) {
        uniform = false
      }
    }

    if (c.zero > 0 && c.ranks[0] !== 0) {
      uniform = false
    }

    if (c.nonzero > 0 && c.ranks[0] === 0) {
      uniform = false
    }
  }

  return {
    family: fam.name,
    coins: total,
    zeroStraight,
    classes: [...classes.values()],
    cycles: 2 * zeroStraight * total - zeroStraight * zeroStraight,
    least,
    zeroMax,
    uniform,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- STEP 2: the slot-resolved front per class pair ----

export function blockGetter(fam: Family, ph: readonly Phase[], coin: Coin): BlockGetter {
  const cache = new Map<number, Float64Array>()

  return (e, b) => {
    const k = e * S + b
    let B = cache.get(k)

    if (!B) {
      B = coinBlock(fam, ph, coin, OPP[e]!, b)
      cache.set(k, B)
    }

    return B
  }
}

// the unique optimal path's slots (when the final slot has one path)
function uniquePath(sup: readonly Uint8Array[], v: readonly number[], hops: number, g: GeoFront, slot: number): number[] {
  const proj = ROOTS.map(r => dot4(r, v))
  const path = [slot]

  for (let k = hops - 1; k >= 1; k--) {
    const e = path[0]!
    const A = sup[k % 2]!
    const prev: number[] = []

    for (let b = 0; b < S; b++) {
      if (A[e * S + b] && Math.abs(g.F[k - 1]![b]! + proj[e]! - g.F[k]![e]!) < EPS_V && Math.abs(g.F[k - 1]![b]! + g.Bk[k - 1]![b]! - g.value) < EPS_V) {
        prev.push(b)
      }
    }

    if (prev.length !== 1) {
      throw new Error(`path not unique at hop ${k}: ${prev.length}`)
    }

    path.unshift(prev[0]!)
  }

  return path
}

export type Witness = { dir: number; slot: number; paths: number; exact: boolean }

export type ClassPair = {
  c1: number
  c2: number
  ranks1: number[]
  ranks2: number[]
  cycles: number
  // per n 1..6: the least, over directions, of the least path count over the farthest final slots; and the greatest
  leastPaths: number[]
  mostPaths: number[]
  // directions at n 6 with some farthest final slot on 2 or fewer paths
  witnessDirs: number
  // the first witness: one path through full-rank blocks only (exact for every cycle of the pair) or not
  witness: Witness | null
  exact: boolean
  // sampled cycles: how many were read, how many have a nonzero witness (amplitude above 1e-12 of its path scale), the
  // least amplitude / scale over the sample at the witness used
  sampled: number
  sampledWitnessed: number
  leastRel: number
  // the support reach: farthest value per n along the first direction, to tell a frozen walk (bounded) from a moving one
  reach: number[]
}

const NMAX = 6

export function step2(fam: Family, s1: Step1, pairSample: number): { pairs: ClassPair[]; directions: number; seconds: number } {
  const t0 = Date.now()
  const ph = phases()
  const dirs = frontDirections()
  const start = startVector()
  const pairs: ClassPair[] = []

  s1.classes.forEach((c1, i1) => {
    s1.classes.forEach((c2, i2) => {
      const n1 = c1.zero + c1.nonzero
      const n2 = c2.zero + c2.nonzero

      if (c1.zero === 0 && c2.zero === 0) {
        return
      }

      const sup = [supportOf({ ranks: c1.ranks, least: 0, zeroMax: 0, uniform: true }), supportOf({ ranks: c2.ranks, least: 0, zeroMax: 0, uniform: true })]
      const leastPaths: number[] = []
      const mostPaths: number[] = []
      const reach: number[] = []
      const witnesses: Witness[] = []

      for (let n = 1; n <= NMAX; n++) {
        let lo = Infinity
        let hi = 0

        dirs.forEach((v, di) => {
          const g = geoFront(sup, v, 2 * n)
          const pmin = Math.min(...g.finals.map(f => f.paths))

          lo = Math.min(lo, pmin)
          hi = Math.max(hi, pmin)

          if (di === 0) {
            reach.push(g.value)
          }

          if (n === NMAX) {
            for (const f of g.finals) {
              if (f.paths <= 2) {
                let exact = false

                if (f.paths === 1) {
                  const path = uniquePath(sup, v, 2 * n, g, f.slot)

                  exact = path.every((e, k) => k === 0 || (k % 2 === 0 ? c1 : c2).ranks[turnOf(e, path[k - 1]!)] === R)
                }

                witnesses.push({ dir: di, slot: f.slot, paths: f.paths, exact })
              }
            }
          }
        })

        leastPaths.push(lo)
        mostPaths.push(hi)
      }

      witnesses.sort((a, b) => Number(b.exact) - Number(a.exact) || a.paths - b.paths)

      // the sample: cycles (G1, G2) from the classes' stored coins
      const l1 = c1.zero > 0 ? c1.zeroCoins : c1.nonzeroCoins
      const l2 = c2.zero > 0 ? c2.zeroCoins : c2.nonzeroCoins
      const k1 = Math.min(l1.length, pairSample)
      const k2 = Math.min(l2.length, pairSample)

      let sampled = 0
      let sampledWitnessed = 0
      let leastRel = Infinity

      for (let a = 0; a < k1; a++) {
        for (let b = 0; b < k2; b++) {
          const getters = [blockGetter(fam, ph, Int8Array.from(l1[a]!)), blockGetter(fam, ph, Int8Array.from(l2[b]!))]

          sampled++

          for (const w of witnesses.slice(0, 16)) {
            const v = dirs[w.dir]!
            const g = geoFront(sup, v, 2 * NMAX)
            const amps = geoAmplitude(getters, sup, v, 2 * NMAX, g, start)
            const hit = amps.find(x => x.slot === w.slot)!
            const rel = hit.amp / hit.scale

            if (rel > REL) {
              sampledWitnessed++
              leastRel = Math.min(leastRel, rel)
              break
            }
          }
        }
      }

      pairs.push({
        c1: i1,
        c2: i2,
        ranks1: c1.ranks,
        ranks2: c2.ranks,
        cycles: n1 * n2,
        leastPaths,
        mostPaths,
        witnessDirs: new Set(witnesses.map(w => w.dir)).size,
        witness: witnesses[0] ?? null,
        exact: witnesses[0]?.exact ?? false,
        sampled,
        sampledWitnessed,
        leastRel,
        reach,
      })
    })
  })

  return { pairs, directions: dirs.length, seconds: (Date.now() - t0) / 1000 }
}

// the instrument: the full dictionary evolution against the geometric read, for a cycle, over the first directions
export type Instrument = { cycle: string; hops: number; directions: number; valueGap: number; ampGap: number; slotMismatch: number; docks: number }

export function instrument(fam: Family, G1: Coin, G2: Coin, hops: number, nd: number): Instrument {
  const ph = phases()
  const dirs = frontDirections().slice(0, nd)
  const s1 = coinSignature(fam, ph, G1, false)
  const s2 = coinSignature(fam, ph, G2, false)
  const sup = [supportOf(s1), supportOf(s2)]
  const getters = [blockGetter(fam, ph, G1), blockGetter(fam, ph, G2)]
  const state = evolveFull(fam, ph, G1, G2, hops)

  let valueGap = 0
  let ampGap = 0
  let slotMismatch = 0

  for (const v of dirs) {
    const ff = fullFront(state, v)
    const g = geoFront(sup, v, hops)
    const amps = geoAmplitude(getters, sup, v, hops, g, startVector()).filter(a => a.amp > REL * a.scale)

    valueGap = Math.max(valueGap, Math.abs(ff.value - g.value))

    if (amps.length !== ff.slots.length) {
      slotMismatch++
    }

    for (const a of amps) {
      const f = ff.slots.find(x => x.slot === a.slot)

      if (!f) {
        slotMismatch++
        continue
      }

      ampGap = Math.max(ampGap, Math.abs(f.amp - a.amp))
    }
  }

  return { cycle: `${Array.from(G1).join('')}/${Array.from(G2).join('')}`, hops, directions: dirs.length, valueGap, ampGap, slotMismatch, docks: state.size }
}

export const census = {
  S,
  R,
  N,
  ROOTS,
  OPP,
  TURN_T,
  TURN_NAME,
  turnOf,
  keyOf,
  coordsOf,
}

export default experiment({
  id: 'gauge/coin-census',
  code: 'E-FRC-0000',
  title: 'explores whether any constant-free coin from R*s slot-harmonic and Clifford projectors could give a cageable front',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run(): Verdict {
    // the census runs in stages (deck/vibe/tmp/ncoin.sh); the suite run reads only the family instruments
    const f = buildFamilies()

    return verdict({
      status: 'open',
      claim: `coin-census family: harmonic dims ${f.harmonicDims.join(', ')}; run the staged census for the verdict`,
      metrics: f.main.checks,
    })
  },
})
