// A STRING PHASE AT R*'S OWN ANGLE: DOES IT LOCALIZE TWO WALKERS' SEPARATION? (note/project/vibe/roadmap/moving-matter
// item 0093, E-FRC-0307, decision 020 point 5, research/one-walker-costs.md section 2b rank 1). Explores whether a pair phase linear in
// separation, at R*'s own irrational angle mu = arg u (u = ringUnit(-1, 4), cos mu = -13/14), could bound two walkers'
// separation while their centre of mass moves. The front lemma (decision 019 point 3) forbids cages, not localization,
// so the target is a pure-point relative spectrum with exponential tails. At a Z3 angle the phase is periodic in the
// separation and Bloch makes the relative walk ballistic (decision 019 point 5, Cedzich et al. PRL 111 160601 (2013)).
//
// THE WALK (STEP 1, the instrument on a line). Two distinguishable walkers on a line, each with a two-state coin whose
// state is its direction of motion (+1 or -1). One beat: the coin on each walker, both move one site along their state,
// then the pair phase e^(i s_b angle(|x1 - x2|)) with s_b = +1 every beat (the item's rule). Two coins:
//   hadamard   H = [[1, 1], [1, -1]] / sqrt 2 every beat (a one-beat cycle)
//   rstar      R*'s cage-engine pieces on one root line (a two-beat cycle). The engine's beats are Q0 = X P_S and
//              Q1 = X P_D (test/experiment/gauge/cage-front.ts:289-333 engineWalk, read-only), P_S = 1 + (u - 1) S S^dag
//              with S slot-uniform, P_D = 1 + (conj u - 1) D D^dag with D the partner state r_d . gamma
//              (code/measure/register-meson.ts:862-882 partnerBasis), X the slot swap d -> -d. On the 24 slots the
//              straight block Pi_d Q Pi_d is (u - 1)/24 and is not unitary on one line (cage-front.ts:372-385). On the
//              line's own two slots S is (1, 1)/sqrt 2 and D, odd under d -> -d, is (1, -1)/sqrt 2, so
//                Q0 = [[(u - 1)/2, (u + 1)/2], [(u + 1)/2, (u - 1)/2]]          straight (u - 1)/2, bounce (u + 1)/2
//                Q1 = [[(1 - conj u)/2, (1 + conj u)/2], [(1 + conj u)/2, (1 - conj u)/2]]
//              both unitary, |straight|^2 = |u - 1|^2 / 4 = 27/28. That is the coin "R*'s cycle gives on one root line".
// THE REDUCTION. The walk commutes with a joint translation, so at centre-of-mass momentum K the amplitude is
// e^(i K x2) phi(r, c1, c2) with r = x1 - x2. A beat moves r by d1 - d2 in {0, +-2} and multiplies by e^(-i K d2). From
// r = 0 only even r is reached, so the relative walk lives on the even positions of a line of S sites,
// r in [-S/2, S/2 - 2], 4 internal states each. Hard walls: a pair at the last position whose move would leave turns
// both walkers around in place (the (+, -) -> (-, +) swap, phase 1), which keeps the beat unitary and the cycle banded.
//
// READS. (a) rms(r) = sqrt(<r^2>) in line sites from r = 0, for the internally mixed start (I/4 over the four coin
// basis states, the mean of their <r^2>), every beat up to t = 1e5 on S = 4096, each of 16 K = 2 pi m / 16; the edge
// weight (positions within 32 of a wall) checked every beat, and a run stops being read at the first beat it passes
// 1e-12. (b) Every eigenvector of the relative cycle W(K) on S = 2048 and 4096, its participation 1 / sum p_r^2 over the
// even positions r (the walk's sites), from the banded Hermitian A = (e^(-i theta) W + e^(i theta) W^dag) / 2,
// theta = sqrt 2 - 1 (no eigenvalue pairing in A), reduced to tridiagonal by Givens bulge chasing, eigenvalues by
// implicit QL, vectors by inverse iteration on the band; each vector is checked against W itself. (c) The centre-of-mass
// velocity of the most localized eigenvector whose centre lies within S/4 of r = 0: the mean displacement of walker 2 a
// beat in that stationary state, which is -d eps/dK per beat by Hellmann-Feynman, checked by a finite difference of the
// Rayleigh phase.
//
// GATES, fixed 2026-10-09 in the item, made operational here before any read:
//   CONFINED   at mu = arg u on both coins: max_t rms(r) < 20 for every t up to 1e5 (edge weight <= 1e-12 throughout)
//              on all 16 K; the largest participation over all eigenvectors and all 16 K is below 50 positions on
//              S = 4096 and does not grow from S = 2048 (ratio <= 1.2); and the controls behave: mu = 0 ballistic, its
//              rms slope above 0.1 site a beat on every K of both coins
//   BALLISTIC  CONFINED fails and, at mu = arg u, some K of either coin has rms growing with fitted exponent above 0.5
//              (log rms against log t over the last two decades read)
//   OPEN       otherwise (sub-ballistic growth, or participation that grows with the line)
// UNGATED, printed: mu = 2 pi/3 (predicted ballistic with revivals, Cedzich et al. 2013), mu = 1 and sqrt 2 (lead's
// prediction CONFINED for arg u, 1, sqrt 2; BALLISTIC for 2 pi/3), and R*'s beat-2 reversal (register-holes.ts:1063-1069
// applies e^(+i angle) on beat 1 and e^(-i angle) on beat 2) on the rstar coin.
// STEP 2, only on CONFINED: R*'s own string, string min(V, cap) + contact at V = 0 (register-holes.ts:1076-1086), with
// E-SPN-0175's values (test/experiment/spin/register-sea.ts:166-169, 529-537: string -arg ringUnit(-2, 1) a unit of V,
// cap 8, contact -2 arg ringUnit(2, 0)), V = |r| on the line; read capped and uncapped.
//
// DETERMINISM: no random numbers (inverse iteration starts from a fixed integer hash). FLOAT: measurement; every verdict
// is a number against a fixed tolerance.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { tridiagonalEigenvalues } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

const TAU = 2 * Math.PI
const K_COUNT = 16
const T_MAX = 100000
const S_DYN = 4096
const S_EIG = [2048, 4096] as const
const EDGE = 32
const EDGE_TOL = 1e-12
const DROP = 1e-80
const THETA = Math.SQRT2 - 1
const CLUSTER = 1e-10
const RMS_GATE = 20
const PR_GATE = 50
const PR_GROWTH = 1.2
const SLOPE_GATE = 0.1
const EXPONENT_GATE = 0.5

// ---- angles ----

export const MU_U = unitAngle(ringUnit(-1, 4))

const STRING_UNIT = -unitAngle(ringUnit(-2, 1))
const CONTACT = -2 * unitAngle(ringUnit(2, 0))
const CAP = 8

export type MuName = 'argu' | 'z3' | 'zero' | 'one' | 'sqrt2' | 'rstar' | 'rstarfree'

// the pair angle at |r| (line sites) for each named string
export function angleOf(mu: MuName): (a: number) => number {
  switch (mu) {
    case 'argu':
      return a => MU_U * a
    case 'z3':
      return a => (TAU / 3) * a
    case 'zero':
      return () => 0
    case 'one':
      return a => a
    case 'sqrt2':
      return a => Math.SQRT2 * a
    case 'rstar':
      return a => STRING_UNIT * Math.min(a, CAP) + (a === 0 ? CONTACT : 0)
    case 'rstarfree':
      return a => STRING_UNIT * a + (a === 0 ? CONTACT : 0)
  }
}

// ---- coins ----

type C2 = { re: [number, number, number, number]; im: [number, number, number, number] }

export type CoinName = 'hadamard' | 'rstar'

export function coinsOf(coin: CoinName): C2[] {
  if (coin === 'hadamard') {
    const h = Math.SQRT1_2

    return [{ re: [h, h, h, -h], im: [0, 0, 0, 0] }]
  }

  const ur = Math.cos(MU_U)
  const ui = Math.sin(MU_U)
  // Q0 = X P_S: straight (u - 1)/2, bounce (u + 1)/2
  const q0: C2 = {
    re: [(ur - 1) / 2, (ur + 1) / 2, (ur + 1) / 2, (ur - 1) / 2],
    im: [ui / 2, ui / 2, ui / 2, ui / 2],
  }
  // Q1 = X P_D: straight (1 - conj u)/2, bounce (1 + conj u)/2
  const q1: C2 = {
    re: [(1 - ur) / 2, (1 + ur) / 2, (1 + ur) / 2, (1 - ur) / 2],
    im: [ui / 2, -ui / 2, -ui / 2, ui / 2],
  }

  return [q0, q1]
}

// ---- the walk ----

export type Walk = {
  coins: C2[]
  // the pair angle at |r| for each beat (already signed)
  angles: Float64Array[]
  // positions (even r), J = S / 2; position j holds r = 2 j - S / 2
  J: number
  S: number
  K: number
  // e^(-i K d2) for d2 = +1 and -1
  kr: number
  ki: number
}

export function makeWalk(coin: CoinName, mu: MuName, S: number, K: number, reverse = false): Walk {
  const coins = coinsOf(coin)
  const f = angleOf(mu)
  const J = S / 2
  const base = Float64Array.from({ length: J }, (_, j) => f(Math.abs(2 * j - S / 2)))
  const angles = coins.map((_, b) => (reverse && b % 2 === 1 ? base.map(x => -x) : base))

  return { coins, angles, J, S, K, kr: Math.cos(K), ki: -Math.sin(K) }
}

// internal index c = 2 c1 + c2, c_i = 0 moves +1, 1 moves -1
const D1 = [1, 1, -1, -1]
const D2 = [1, -1, 1, -1]

// one beat on positions [lo, hi] of (ir, ii) into (or, oi), which it zeroes on [lo - 1, hi + 1] first
export function beat(
  w: Walk,
  b: number,
  ir: Float64Array,
  ii: Float64Array,
  or: Float64Array,
  oi: Float64Array,
  lo: number,
  hi: number,
): void {
  const C = w.coins[b % w.coins.length]!
  const ang = w.angles[b % w.coins.length]!
  const olo = Math.max(0, lo - 1)
  const ohi = Math.min(w.J - 1, hi + 1)

  for (let k = olo * 4; k < (ohi + 1) * 4; k++) {
    or[k] = 0
    oi[k] = 0
  }

  const [a0r, a1r, a2r, a3r] = C.re
  const [a0i, a1i, a2i, a3i] = C.im
  const vr = [0, 0, 0, 0]
  const vi = [0, 0, 0, 0]
  const tr = [0, 0, 0, 0]
  const ti = [0, 0, 0, 0]

  for (let j = lo; j <= hi; j++) {
    const o = j * 4

    for (let c = 0; c < 4; c++) {
      vr[c] = ir[o + c]!
      vi[c] = ii[o + c]!
    }

    // the coin on walker 2 (index c2): pairs (0, 1) and (2, 3)
    for (let h = 0; h < 4; h += 2) {
      const xr = vr[h]!
      const xi = vi[h]!
      const yr = vr[h + 1]!
      const yi = vi[h + 1]!

      tr[h] = a0r * xr - a0i * xi + a1r * yr - a1i * yi
      ti[h] = a0r * xi + a0i * xr + a1r * yi + a1i * yr
      tr[h + 1] = a2r * xr - a2i * xi + a3r * yr - a3i * yi
      ti[h + 1] = a2r * xi + a2i * xr + a3r * yi + a3i * yr
    }

    // the coin on walker 1 (index c1): pairs (0, 2) and (1, 3)
    for (let h = 0; h < 2; h++) {
      const xr = tr[h]!
      const xi = ti[h]!
      const yr = tr[h + 2]!
      const yi = ti[h + 2]!

      vr[h] = a0r * xr - a0i * xi + a1r * yr - a1i * yi
      vi[h] = a0r * xi + a0i * xr + a1r * yi + a1i * yr
      vr[h + 2] = a2r * xr - a2i * xi + a3r * yr - a3i * yi
      vi[h + 2] = a2r * xi + a2i * xr + a3r * yi + a3i * yr
    }

    for (let c = 0; c < 4; c++) {
      const dj = (D1[c]! - D2[c]!) / 2
      let jt = j + dj
      let ct = c
      let pr = 1
      let pi = 0

      if (jt < 0 || jt >= w.J) {
        // the wall: both walkers turn around in place
        jt = j
        ct = 3 - c
      } else {
        pr = w.kr
        pi = D2[c]! > 0 ? w.ki : -w.ki
      }

      const xr = vr[c]! * pr - vi[c]! * pi
      const xi = vr[c]! * pi + vi[c]! * pr
      const t = ang[jt]!
      const cr = Math.cos(t)
      const ci = Math.sin(t)
      const k = jt * 4 + ct

      or[k]! += xr * cr - xi * ci
      oi[k]! += xr * ci + xi * cr
    }
  }
}

// ---- STEP 1 (a): rms(r) from r = 0 ----

export type DynRead = {
  K: number
  // max over beats read of the mixed-start rms (line sites), the last beat read, and whether the edge stopped it
  rmsMax: number
  tEnd: number
  edgeHit: boolean
  edgeMax: number
  // fits over the read beats: exponent of rms in t (last two decades), slope (sites a beat, last quarter)
  exponent: number
  slope: number
  // log-spaced samples [t, rms]
  samples: [number, number][]
  // the return weight at r = 0 (mixed start): max over the second half of the read, min over the first half after t 8
  p0Late: number
  normDrift: number
  dropped: number
  window: number
}

function logTimes(tMax: number): Set<number> {
  const s = new Set<number>()

  for (let k = 0; k <= 400; k++) {
    const t = Math.round(10 ** (k / 80))

    if (t >= 1 && t <= tMax) {
      s.add(t)
    }
  }

  s.add(tMax)

  return s
}

function fitLine(x: number[], y: number[]): number {
  const n = x.length

  if (n < 2) {
    return NaN
  }

  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0

  for (let i = 0; i < n; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my)
    sxx += (x[i]! - mx) ** 2
  }

  return sxy / sxx
}

export function dynRead(coin: CoinName, mu: MuName, m: number, tMax = T_MAX, reverse = false): DynRead {
  const K = (TAU * m) / K_COUNT
  const w = makeWalk(coin, mu, S_DYN, K, reverse)
  const J = w.J
  const j0 = S_DYN / 4
  const times = logTimes(tMax)
  // four starts, one per coin basis state, evolved together (their weights summed = the mixed start, times 4)
  const st = [0, 1, 2, 3].map(c => {
    const re = new Float64Array(J * 4)
    const im = new Float64Array(J * 4)

    re[j0 * 4 + c] = 1

    return { re, im, or: new Float64Array(J * 4), oi: new Float64Array(J * 4) }
  })
  let lo = j0
  let hi = j0
  let rmsMax = 0
  let tEnd = 0
  let edgeHit = false
  let edgeMax = 0
  let dropped = 0
  let normDrift = 0
  let p0Late = 0
  let lastRms = 0
  const samples: [number, number][] = []
  const p0: number[] = []

  for (let t = 1; t <= tMax; t++) {
    const b = (t - 1) % w.coins.length

    for (const s of st) {
      beat(w, b, s.re, s.im, s.or, s.oi, lo, hi)

      const xr = s.re
      const xi = s.im

      s.re = s.or
      s.im = s.oi
      s.or = xr
      s.oi = xi
    }

    lo = Math.max(0, lo - 1)
    hi = Math.min(J - 1, hi + 1)

    // trim the window's tiny frontier (the weight dropped is counted)
    const posWeight = (j: number): number => {
      let x = 0

      for (const s of st) {
        for (let c = 0; c < 4; c++) {
          x += s.re[j * 4 + c]! ** 2 + s.im[j * 4 + c]! ** 2
        }
      }

      return x
    }

    while (lo < j0 && posWeight(lo) < DROP) {
      dropped += posWeight(lo)

      for (const s of st) {
        for (let c = 0; c < 4; c++) {
          s.re[lo * 4 + c] = 0
          s.im[lo * 4 + c] = 0
        }
      }

      lo++
    }

    while (hi > j0 && posWeight(hi) < DROP) {
      dropped += posWeight(hi)

      for (const s of st) {
        for (let c = 0; c < 4; c++) {
          s.re[hi * 4 + c] = 0
          s.im[hi * 4 + c] = 0
        }
      }

      hi--
    }

    let norm = 0
    let r2 = 0
    let edge = 0
    let at0 = 0

    for (let j = lo; j <= hi; j++) {
      const p = posWeight(j) / 4
      const r = 2 * j - S_DYN / 2

      norm += p
      r2 += p * r * r

      if (j < EDGE || j >= J - EDGE) {
        edge += p
      }

      if (j === j0) {
        at0 = p
      }
    }

    if (edge > EDGE_TOL) {
      edgeHit = true
      break
    }

    edgeMax = Math.max(edgeMax, edge)
    normDrift = Math.max(normDrift, Math.abs(norm - 1))

    const rms = Math.sqrt(r2 / norm)

    rmsMax = Math.max(rmsMax, rms)
    tEnd = t
    lastRms = rms
    p0.push(at0)

    if (times.has(t)) {
      samples.push([t, rms])
    }
  }

  if (samples.length === 0 || samples[samples.length - 1]![0] !== tEnd) {
    samples.push([tEnd, lastRms])
  }

  for (let i = Math.floor(tEnd / 2); i < tEnd; i++) {
    p0Late = Math.max(p0Late, p0[i] ?? 0)
  }

  const exp = samples.filter(([t]) => t >= Math.max(8, tEnd / 100) && t <= tEnd)
  const lin = samples.filter(([t]) => t >= tEnd / 4 && t <= tEnd)

  return {
    K,
    rmsMax,
    tEnd,
    edgeHit,
    edgeMax,
    exponent: fitLine(exp.map(([t]) => Math.log(t)), exp.map(([, r]) => Math.log(r))),
    slope: fitLine(lin.map(([t]) => t), lin.map(([, r]) => r)),
    samples,
    p0Late,
    normDrift,
    dropped,
    window: hi - lo + 1,
  }
}

// ---- STEP 1 (b): the cycle as a band, its Hermitian part, tridiagonal reduction, inverse iteration ----

type Band = { n: number; b: number; re: Float64Array; im: Float64Array }

// W's band: W[i][k] at re[i * (2b + 1) + k - i + b]
export function cycleBand(w: Walk): Band {
  const nb = w.coins.length
  const n = w.J * 4
  const b = 4 * nb + 3
  const width = 2 * b + 1
  const out: Band = { n, b, re: new Float64Array(n * width), im: new Float64Array(n * width) }
  let xr = new Float64Array(n)
  let xi = new Float64Array(n)
  let yr = new Float64Array(n)
  let yi = new Float64Array(n)

  for (let k = 0; k < n; k++) {
    const j = Math.floor(k / 4)

    // clear a window big enough for the spread
    for (let q = Math.max(0, (j - nb - 1) * 4); q < Math.min(n, (j + nb + 2) * 4); q++) {
      xr[q] = 0
      xi[q] = 0
      yr[q] = 0
      yi[q] = 0
    }

    xr[k] = 1

    let lo = j
    let hi = j

    for (let s = 0; s < nb; s++) {
      beat(w, s, xr, xi, yr, yi, lo, hi)
      lo = Math.max(0, lo - 1)
      hi = Math.min(w.J - 1, hi + 1)

      const tr = xr
      const ti = xi

      xr = yr
      xi = yi
      yr = tr
      yi = ti
    }

    for (let i = lo * 4; i < (hi + 1) * 4; i++) {
      const d = k - i + b

      if (d < 0 || d >= width) {
        if (xr[i] !== 0 || xi[i] !== 0) {
          throw new Error('cycleBand: an entry outside the band')
        }

        continue
      }

      out.re[i * width + d] = xr[i]!
      out.im[i * width + d] = xi[i]!
    }
  }

  return out
}

// apply the cycle to a full vector
export function applyCycle(w: Walk, xr: Float64Array, xi: Float64Array): { re: Float64Array; im: Float64Array } {
  let ar = Float64Array.from(xr)
  let ai = Float64Array.from(xi)
  let br = new Float64Array(xr.length)
  let bi = new Float64Array(xr.length)

  for (let s = 0; s < w.coins.length; s++) {
    beat(w, s, ar, ai, br, bi, 0, w.J - 1)

    const tr = ar
    const ti = ai

    ar = br
    ai = bi
    br = tr
    bi = ti
  }

  return { re: ar, im: ai }
}

// A = (e^(-i theta) W + e^(i theta) W^dag)/2, Hermitian, lower band with one extra diagonal for the bulge:
// A[i][j] (i >= j, i - j <= b + 1) at re[i * (b + 2) + i - j]
type Lower = { n: number; b: number; B: number; re: Float64Array; im: Float64Array }

export function hermitianPart(W: Band): Lower {
  const { n, b } = W
  const B = b + 1
  const width = 2 * b + 1
  const L: Lower = { n, b, B, re: new Float64Array(n * (B + 1)), im: new Float64Array(n * (B + 1)) }
  const cr = Math.cos(THETA)
  const ci = -Math.sin(THETA)

  for (let i = 0; i < n; i++) {
    for (let d = 0; d <= b && i - d >= 0; d++) {
      const j = i - d
      // W[i][j]
      const wr = W.re[i * width + j - i + b]!
      const wi = W.im[i * width + j - i + b]!
      // conj(W[j][i])
      const vr = W.re[j * width + i - j + b]!
      const vi = -W.im[j * width + i - j + b]!

      L.re[i * (B + 1) + d] = (cr * wr - ci * wi + cr * vr + ci * vi) / 2
      L.im[i * (B + 1) + d] = (cr * wi + ci * wr + cr * vi - ci * vr) / 2
    }
  }

  return L
}

// the Hermitian part as a full band (lower and upper): A[i][j] (|i - j| <= b) at re[i * (2b + 1) + j - i + b]
function fullBandOf(L: Lower): Band {
  const { n, b } = L
  const width = 2 * b + 1
  const out: Band = { n, b, re: new Float64Array(n * width), im: new Float64Array(n * width) }

  for (let i = 0; i < n; i++) {
    for (let j = Math.max(0, i - b); j <= Math.min(n - 1, i + b); j++) {
      const k = i >= j ? i * (L.B + 1) + i - j : j * (L.B + 1) + j - i

      out.re[i * width + j - i + b] = L.re[k]!
      out.im[i * width + j - i + b] = i >= j ? L.im[k]! : -L.im[k]!
    }
  }

  return out
}

// Givens bulge chasing (Schwarz): reduce the Hermitian band to a real symmetric tridiagonal (d, |e|); destroys L
export function bandToTridiagonal(L: Lower): { d: Float64Array; e: Float64Array; offBand: number } {
  const { n, b, B } = L
  const w = B + 1
  const R = L.re
  const I = L.im
  const at = (i: number, j: number): number => i * w + i - j

  const rotate = (p: number, zc: number): void => {
    const q = p + 1
    const xk = at(p, zc)
    const yk = at(q, zc)
    const xr = R[xk]!
    const xi = I[xk]!
    const yr = R[yk]!
    const yi = I[yk]!
    const ay = Math.hypot(yr, yi)

    if (ay === 0) {
      return
    }

    const ax = Math.hypot(xr, xi)
    let c: number
    let sr: number
    let si: number

    if (ax === 0) {
      c = 0
      sr = 1
      si = 0
    } else {
      const r = Math.hypot(ax, ay)

      c = ax / r
      // s = conj(y) x / (|x| r)
      sr = (yr * xr + yi * xi) / (ax * r)
      si = (yr * xi - yi * xr) / (ax * r)
    }

    // rows p, q at columns jj < p
    const left = Math.max(0, p - b)

    if (p - B >= 0 && (R[at(p, p - B)] !== 0 || I[at(p, p - B)] !== 0)) {
      throw new Error(`bandToTridiagonal: fill beyond the bulge at row ${q}`)
    }

    for (let jj = left; jj < p; jj++) {
      const ak = at(p, jj)
      const bk = at(q, jj)
      const ar = R[ak]!
      const ai = I[ak]!
      const br = R[bk]!
      const bi = I[bk]!

      // A'[p] = c a + s b ; A'[q] = -conj(s) a + c b
      R[ak] = c * ar + sr * br - si * bi
      I[ak] = c * ai + sr * bi + si * br
      R[bk] = -(sr * ar + si * ai) + c * br
      I[bk] = -(sr * ai - si * ar) + c * bi
    }

    // the 2 x 2 block
    const a = R[at(p, p)]!
    const dd = R[at(q, q)]!
    const btr = R[at(q, p)]!
    const bti = I[at(q, p)]!
    // GM row p: [c a + s beta, c conj(beta) + s d]; row q: [-conj(s) a + c beta, -conj(s) conj(beta) + c d]
    const g00r = c * a + (sr * btr - si * bti)
    const g00i = sr * bti + si * btr
    const g01r = c * btr + sr * dd
    const g01i = -c * bti + si * dd
    const g10r = -sr * a + c * btr
    const g10i = si * a + c * bti
    // -conj(s) conj(beta) = -conj(s beta)
    const g11r = -(sr * btr - si * bti) + c * dd
    const g11i = sr * bti + si * btr
    // (GM) G^dag, G^dag = [[c, -s], [conj(s), c]]
    // M'pp = g00 c + g01 conj(s)
    const mpp = g00r * c + (g01r * sr + g01i * si)
    // M'qp = g10 c + g11 conj(s)
    const mqpr = g10r * c + (g11r * sr + g11i * si)
    const mqpi = g10i * c + (g11i * sr - g11r * si)
    // M'qq = g10 (-s) + g11 c
    const mqq = -(g10r * sr - g10i * si) + g11r * c

    void g00i
    R[at(p, p)] = mpp
    I[at(p, p)] = 0
    R[at(q, q)] = mqq
    I[at(q, q)] = 0
    R[at(q, p)] = mqpr
    I[at(q, p)] = mqpi

    // columns p, q at rows jj > q
    const right = Math.min(n - 1, p + B)

    if (q + B <= n - 1 && (R[at(q + B, q)] !== 0 || I[at(q + B, q)] !== 0)) {
      throw new Error(`bandToTridiagonal: fill beyond the bulge at column ${p}`)
    }

    for (let jj = q + 1; jj <= right; jj++) {
      const ak = at(jj, p)
      const bk = at(jj, q)
      const ar = R[ak]!
      const ai = I[ak]!
      const br = R[bk]!
      const bi = I[bk]!

      // A'[jj][p] = c a + conj(s) b ; A'[jj][q] = -s a + c b
      R[ak] = c * ar + sr * br + si * bi
      I[ak] = c * ai + sr * bi - si * br
      R[bk] = -(sr * ar - si * ai) + c * br
      I[bk] = -(sr * ai + si * ar) + c * bi
    }

    R[yk] = 0
    I[yk] = 0
  }

  for (let j = 0; j < n - 2; j++) {
    for (let k = Math.min(b, n - 1 - j); k >= 2; k--) {
      const r = j + k

      rotate(r - 1, j)

      let col = r - 1
      let row = col + B

      while (row < n) {
        const kk = at(row, col)

        if (R[kk] === 0 && I[kk] === 0) {
          break
        }

        rotate(row - 1, col)
        col = row - 1
        row = col + B
      }
    }
  }

  const d = new Float64Array(n)
  const e = new Float64Array(n)
  let offBand = 0

  for (let i = 0; i < n; i++) {
    d[i] = R[at(i, i)]!

    if (i + 1 < n) {
      e[i] = Math.hypot(R[at(i + 1, i)]!, I[at(i + 1, i)]!)
    }

    for (let dist = 2; dist <= B && i - dist >= 0; dist++) {
      offBand = Math.max(offBand, Math.hypot(R[at(i, i - dist)]!, I[at(i, i - dist)]!))
    }
  }

  return { d, e, offBand }
}

// banded LU of (A - sigma) with partial pivoting, rows store columns [i - b, i + 2b]
type BandLU = { n: number; b: number; re: Float64Array; im: Float64Array; piv: Int32Array }

function bandLU(F: Band, sigma: number, lu?: BandLU): BandLU {
  const { n, b } = F
  const w = 3 * b + 1
  const fw = 2 * b + 1
  const out: BandLU = lu ?? { n, b, re: new Float64Array(n * w), im: new Float64Array(n * w), piv: new Int32Array(n) }
  const R = out.re
  const I = out.im

  R.fill(0)
  I.fill(0)

  for (let i = 0; i < n; i++) {
    // columns i - b .. i + b sit at the same offsets in both layouts
    for (let o = 0; o < fw; o++) {
      R[i * w + o] = F.re[i * fw + o]!
      I[i * w + o] = F.im[i * fw + o]!
    }

    R[i * w + b]! -= sigma
  }

  const tiny = 1e-300 + Number.EPSILON

  for (let k = 0; k < n; k++) {
    let p = k
    let best = -1

    for (let i = k; i <= Math.min(n - 1, k + b); i++) {
      const v = Math.hypot(R[i * w + k - i + b]!, I[i * w + k - i + b]!)

      if (v > best) {
        best = v
        p = i
      }
    }

    out.piv[k] = p

    const top = Math.min(n - 1, k + 2 * b)

    if (p !== k) {
      for (let j = k; j <= top; j++) {
        const a = k * w + j - k + b
        const c = p * w + j - p + b
        const tr = R[a]!
        const ti = I[a]!

        R[a] = R[c]!
        I[a] = I[c]!
        R[c] = tr
        I[c] = ti
      }
    }

    let pr = R[k * w + b]!
    let pi = I[k * w + b]!

    if (Math.hypot(pr, pi) < tiny) {
      pr = tiny
      pi = 0
      R[k * w + b] = pr
      I[k * w + b] = 0
    }

    const den = pr * pr + pi * pi

    for (let i = k + 1; i <= Math.min(n - 1, k + b); i++) {
      const ik = i * w + k - i + b
      const xr = R[ik]!
      const xi = I[ik]!

      if (xr === 0 && xi === 0) {
        continue
      }

      // l = x / pivot
      const lr = (xr * pr + xi * pi) / den
      const li = (xi * pr - xr * pi) / den

      R[ik] = lr
      I[ik] = li

      for (let j = k + 1; j <= top; j++) {
        const kj = k * w + j - k + b
        const ur = R[kj]!
        const ui = I[kj]!

        if (ur === 0 && ui === 0) {
          continue
        }

        const ij = i * w + j - i + b

        R[ij]! -= lr * ur - li * ui
        I[ij]! -= lr * ui + li * ur
      }
    }
  }

  return out
}

function bandSolve(lu: BandLU, xr: Float64Array, xi: Float64Array): void {
  const { n, b, re: R, im: I, piv } = lu
  const w = 3 * b + 1

  for (let k = 0; k < n; k++) {
    const p = piv[k]!

    if (p !== k) {
      const tr = xr[k]!
      const ti = xi[k]!

      xr[k] = xr[p]!
      xi[k] = xi[p]!
      xr[p] = tr
      xi[p] = ti
    }

    const br = xr[k]!
    const bi = xi[k]!

    for (let i = k + 1; i <= Math.min(n - 1, k + b); i++) {
      const ik = i * w + k - i + b

      xr[i]! -= R[ik]! * br - I[ik]! * bi
      xi[i]! -= R[ik]! * bi + I[ik]! * br
    }
  }

  for (let k = n - 1; k >= 0; k--) {
    let sr = xr[k]!
    let si = xi[k]!

    for (let j = k + 1; j <= Math.min(n - 1, k + 2 * b); j++) {
      const kj = k * w + j - k + b

      sr -= R[kj]! * xr[j]! - I[kj]! * xi[j]!
      si -= R[kj]! * xi[j]! + I[kj]! * xr[j]!
    }

    const pr = R[k * w + b]!
    const pi = I[k * w + b]!
    const den = pr * pr + pi * pi

    xr[k] = (sr * pr + si * pi) / den
    xi[k] = (si * pr - sr * pi) / den
  }
}

function hashStart(n: number, salt: number): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let h = (i * 2654435761 + salt * 40503 + 12345) >>> 0

    h ^= h >>> 16
    h = Math.imul(h, 0x85ebca6b) >>> 0
    h ^= h >>> 13
    h = Math.imul(h, 0xc2b2ae35) >>> 0
    h ^= h >>> 16
    re[i] = (h & 0xffff) / 65536 - 0.5
    im[i] = (h >>> 16) / 65536 - 0.5
  }

  return { re, im }
}

export type EigRead = {
  K: number
  S: number
  n: number
  // instruments
  traceGap: number
  frobGap: number
  offBand: number
  residualA: number
  residualW: number
  badW: number
  // inverse-iteration restarts (an overflowing or emptied solve) and vectors that still came out non-finite
  retries?: number
  nanVectors?: number
  // participation (positions of even r)
  prMax: number
  prMaxCentre: number
  prMedian: number
  prMinBulk: number
  // the most localized bulk vector: its centre (line sites), eigenphase, velocity a beat, the finite-difference check
  locCentre: number
  locPhase: number
  locVelocity: number
  locVelocityFD: number
  // a histogram of participations: counts below 10, 10-50, 50-200, 200+
  prHist: [number, number, number, number]
  seconds: number
}

export function eigRead(coin: CoinName, mu: MuName, S: number, m: number): EigRead {
  const t0 = Date.now()
  const K = (TAU * m) / K_COUNT
  const w = makeWalk(coin, mu, S, K)
  const W = cycleBand(w)
  const L = hermitianPart(W)
  const n = L.n
  const b = L.b
  const nb = w.coins.length
  const F = fullBandOf(L)
  const fw = 2 * b + 1
  let trace = 0
  let frob = 0

  for (let i = 0; i < n; i++) {
    trace += F.re[i * fw + b]!

    for (let o = 0; o < fw; o++) {
      frob += F.re[i * fw + o]! ** 2 + F.im[i * fw + o]! ** 2
    }
  }

  const tri = bandToTridiagonal({ ...L, re: Float64Array.from(L.re), im: Float64Array.from(L.im) })
  const lam = tridiagonalEigenvalues(tri.d, tri.e.subarray(0, n - 1)).sort((x, y) => x - y)
  const traceGap = Math.abs(lam.reduce((a, x) => a + x, 0) - trace)
  const frobGap = Math.abs(lam.reduce((a, x) => a + x * x, 0) - frob) / frob
  const applyA = (xr: Float64Array, xi: Float64Array): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(n)
    const im = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let sr = 0
      let si = 0

      for (let j = Math.max(0, i - b); j <= Math.min(n - 1, i + b); j++) {
        const vr = F.re[i * fw + j - i + b]!
        const vi = F.im[i * fw + j - i + b]!

        sr += vr * xr[j]! - vi * xi[j]!
        si += vr * xi[j]! + vi * xr[j]!
      }

      re[i] = sr
      im[i] = si
    }

    return { re, im }
  }

  let lu: BandLU | undefined
  let residualA = 0
  let residualW = 0
  let badW = 0
  let retries = 0
  let nanVectors = 0
  const prs: number[] = []
  let prMax = 0
  let prMaxCentre = 0
  let best: { pr: number; re: Float64Array; im: Float64Array; centre: number } | null = null
  let cluster: { re: Float64Array; im: Float64Array }[] = []

  for (let k = 0; k < n; k++) {
    if (k > 0 && lam[k]! - lam[k - 1]! >= CLUSTER) {
      cluster = []
    }

    lu = bandLU(F, lam[k]!, lu)

    let x = hashStart(n, k)
    let res = Infinity
    let attempt = 0

    for (let it = 0; it < 6; it++) {
      bandSolve(lu, x.re, x.im)

      // an exactly singular shift on an exactly degenerate cluster can overflow the solve or leave nothing after
      // the cluster is projected out: restart from another start with the shift moved off the level by 1e-13
      let pre = 0

      for (let i = 0; i < n; i++) {
        pre += x.re[i]! ** 2 + x.im[i]! ** 2
      }

      if (!Number.isFinite(pre) && attempt < 4) {
        attempt++
        retries++
        lu = bandLU(F, lam[k]! + 1e-13 * attempt, lu)
        x = hashStart(n, k + 7919 * attempt)
        it = -1
        continue
      }

      for (const v of cluster) {
        let cr = 0
        let ci = 0

        for (let i = 0; i < n; i++) {
          cr += v.re[i]! * x.re[i]! + v.im[i]! * x.im[i]!
          ci += v.re[i]! * x.im[i]! - v.im[i]! * x.re[i]!
        }

        for (let i = 0; i < n; i++) {
          x.re[i]! -= cr * v.re[i]! - ci * v.im[i]!
          x.im[i]! -= cr * v.im[i]! + ci * v.re[i]!
        }
      }

      let nn = 0

      for (let i = 0; i < n; i++) {
        nn += x.re[i]! ** 2 + x.im[i]! ** 2
      }

      nn = Math.sqrt(nn)

      if ((!Number.isFinite(nn) || nn < 1e-8) && attempt < 4) {
        attempt++
        retries++
        lu = bandLU(F, lam[k]! + 1e-13 * attempt, lu)
        x = hashStart(n, k + 7919 * attempt)
        it = -1
        continue
      }

      for (let i = 0; i < n; i++) {
        x.re[i]! /= nn
        x.im[i]! /= nn
      }

      if (it >= 1) {
        const ax = applyA(x.re, x.im)

        res = 0

        for (let i = 0; i < n; i++) {
          res += (ax.re[i]! - lam[k]! * x.re[i]!) ** 2 + (ax.im[i]! - lam[k]! * x.im[i]!) ** 2
        }

        res = Math.sqrt(res)

        if (res < 1e-12) {
          break
        }
      }
    }

    residualA = Math.max(residualA, res)
    cluster.push({ re: Float64Array.from(x.re), im: Float64Array.from(x.im) })

    // check against W itself
    const wx = applyCycle(w, x.re, x.im)
    let lr = 0
    let li = 0

    for (let i = 0; i < n; i++) {
      lr += x.re[i]! * wx.re[i]! + x.im[i]! * wx.im[i]!
      li += x.re[i]! * wx.im[i]! - x.im[i]! * wx.re[i]!
    }

    let rw = 0

    for (let i = 0; i < n; i++) {
      rw += (wx.re[i]! - (lr * x.re[i]! - li * x.im[i]!)) ** 2 + (wx.im[i]! - (lr * x.im[i]! + li * x.re[i]!)) ** 2
    }

    rw = Math.sqrt(rw)
    residualW = Math.max(residualW, rw)

    if (rw > 1e-8) {
      badW++
    }

    // participation over positions, and the centre (line sites)
    let s2 = 0
    let centre = 0

    for (let j = 0; j < w.J; j++) {
      let p = 0

      for (let c = 0; c < 4; c++) {
        p += x.re[j * 4 + c]! ** 2 + x.im[j * 4 + c]! ** 2
      }

      s2 += p * p
      centre += p * (2 * j - S / 2)
    }

    const pr = 1 / s2

    if (!Number.isFinite(pr)) {
      nanVectors++
    }

    prs.push(pr)

    if (pr > prMax) {
      prMax = pr
      prMaxCentre = centre
    }

    if (Math.abs(centre) < S / 4 && (!best || pr < best.pr)) {
      best = { pr, re: Float64Array.from(x.re), im: Float64Array.from(x.im), centre }
    }
  }

  prs.sort((x, y) => x - y)

  // the most localized bulk vector: velocity a beat (walker 2's mean displacement), and the FD of its Rayleigh phase
  let locVelocity = NaN
  let locVelocityFD = NaN
  let locPhase = NaN

  if (best) {
    let vr = Float64Array.from(best.re)
    let vi = Float64Array.from(best.im)
    let v = 0

    for (let s = 0; s < nb; s++) {
      const C = w.coins[s]!
      // the coined state, then each component's walker-2 move (0 where the wall turns it)
      for (let j = 0; j < w.J; j++) {
        const o = j * 4
        // coin (x) coin on this position
        const ar = [0, 0, 0, 0]
        const ai = [0, 0, 0, 0]

        for (let c1 = 0; c1 < 2; c1++) {
          for (let c2 = 0; c2 < 2; c2++) {
            let sr = 0
            let si = 0

            for (let a1 = 0; a1 < 2; a1++) {
              for (let a2 = 0; a2 < 2; a2++) {
                const g1r = C.re[c1 * 2 + a1]!
                const g1i = C.im[c1 * 2 + a1]!
                const g2r = C.re[c2 * 2 + a2]!
                const g2i = C.im[c2 * 2 + a2]!
                const gr = g1r * g2r - g1i * g2i
                const gi = g1r * g2i + g1i * g2r
                const xr = vr[o + a1 * 2 + a2]!
                const xi = vi[o + a1 * 2 + a2]!

                sr += gr * xr - gi * xi
                si += gr * xi + gi * xr
              }
            }

            ar[c1 * 2 + c2] = sr
            ai[c1 * 2 + c2] = si
          }
        }

        for (let c = 0; c < 4; c++) {
          const jt = j + (D1[c]! - D2[c]!) / 2

          if (jt >= 0 && jt < w.J) {
            v += (ar[c]! ** 2 + ai[c]! ** 2) * D2[c]!
          }
        }
      }

      const next = { re: new Float64Array(n), im: new Float64Array(n) }

      beat(w, s, vr, vi, next.re, next.im, 0, w.J - 1)
      vr = next.re
      vi = next.im
    }

    locVelocity = v / nb

    const phaseAt = (dk: number): number => {
      const wk = makeWalk(coin, mu, S, K + dk)
      const y = applyCycle(wk, best!.re, best!.im)
      let r = 0
      let i = 0

      for (let q = 0; q < n; q++) {
        r += best!.re[q]! * y.re[q]! + best!.im[q]! * y.im[q]!
        i += best!.re[q]! * y.im[q]! - best!.im[q]! * y.re[q]!
      }

      return Math.atan2(i, r)
    }
    const dk = 1e-5
    let dphi = phaseAt(dk) - phaseAt(-dk)

    dphi = Math.atan2(Math.sin(dphi), Math.cos(dphi))
    // v = -d eps / dK per cycle, per beat divide by the beats
    locVelocityFD = -dphi / (2 * dk) / nb
    locPhase = phaseAt(0)
  }

  const prHist: [number, number, number, number] = [0, 0, 0, 0]

  for (const p of prs) {
    prHist[p < 10 ? 0 : p < 50 ? 1 : p < 200 ? 2 : 3]!++
  }

  return {
    K,
    S,
    n,
    traceGap,
    frobGap,
    offBand: tri.offBand,
    residualA,
    residualW,
    badW,
    retries,
    nanVectors,
    prMax,
    prMaxCentre,
    prMedian: prs[Math.floor(prs.length / 2)]!,
    prMinBulk: best?.pr ?? NaN,
    locCentre: best?.centre ?? NaN,
    locPhase,
    locVelocity,
    locVelocityFD,
    prHist,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- stages ----

export type SlocStage =
  | { kind: 'dyn'; name: string; coin: CoinName; mu: MuName; reverse: boolean; reads: DynRead[] }
  | { kind: 'eig'; name: string; coin: CoinName; mu: MuName; reads: EigRead[] }
  | { kind: 'inst'; name: string; metrics: Record<string, number> }

export type SlocSpec = { name: string; run: () => SlocStage }

const ALL_K = Array.from({ length: K_COUNT }, (_, m) => m)
const CONTROL_K = [0, 4, 8, 12]
const COINS: CoinName[] = ['hadamard', 'rstar']
const STEP1_MU: MuName[] = ['argu', 'z3', 'zero', 'one', 'sqrt2']

// the line coins: unitarity and R*'s straight amplitude (u - 1)/2
function instruments(): Record<string, number> {
  const out: Record<string, number> = { mu: MU_U, cosMu: Math.cos(MU_U), stringUnit: STRING_UNIT, contact: CONTACT }

  for (const coin of COINS) {
    coinsOf(coin).forEach((C, s) => {
      // C C^dag - 1
      let g = 0

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          let r = 0
          let im = 0

          for (let k = 0; k < 2; k++) {
            r += C.re[i * 2 + k]! * C.re[j * 2 + k]! + C.im[i * 2 + k]! * C.im[j * 2 + k]!
            im += C.im[i * 2 + k]! * C.re[j * 2 + k]! - C.re[i * 2 + k]! * C.im[j * 2 + k]!
          }

          g = Math.max(g, Math.hypot(r - (i === j ? 1 : 0), im))
        }
      }

      out[`${coin}${s}Unitary`] = g
      out[`${coin}${s}Straight2`] = C.re[0]! ** 2 + C.im[0]! ** 2
    })
  }

  // the beat is unitary with the walls: a hashed start on S 64, 100 beats, norm kept
  for (const coin of COINS) {
    const w = makeWalk(coin, 'argu', 64, 0.3)
    const x = hashStart(w.J * 4, 7)
    let nrm0 = 0

    for (let i = 0; i < x.re.length; i++) {
      nrm0 += x.re[i]! ** 2 + x.im[i]! ** 2
    }

    let y = x

    for (let t = 0; t < 50; t++) {
      y = applyCycle(w, y.re, y.im)
    }

    let nrm = 0

    for (let i = 0; i < y.re.length; i++) {
      nrm += y.re[i]! ** 2 + y.im[i]! ** 2
    }

    out[`${coin}WallNormGap`] = Math.abs(nrm / nrm0 - 1)
  }

  return out
}

export function slocSpecs(): SlocSpec[] {
  const specs: SlocSpec[] = [{ name: 'inst', run: () => ({ kind: 'inst', name: 'inst', metrics: instruments() }) }]

  for (const coin of COINS) {
    for (const mu of STEP1_MU) {
      specs.push({
        name: `dyn-${coin}-${mu}`,
        run: () => ({ kind: 'dyn', name: `dyn-${coin}-${mu}`, coin, mu, reverse: false, reads: ALL_K.map(m => dynRead(coin, mu, m)) }),
      })
    }

    for (const mu of ['argu', 'rstar', 'rstarfree'] as MuName[]) {
      // the reversal acts on beat 2, so only the two-beat rstar coin has one
      if (coin === 'rstar') {
        specs.push({
          name: `dyn-${coin}-${mu}-rev`,
          run: () => ({ kind: 'dyn', name: `dyn-${coin}-${mu}-rev`, coin, mu, reverse: true, reads: ALL_K.map(m => dynRead(coin, mu, m, T_MAX, true)) }),
        })
      }
    }

    for (const mu of ['rstar', 'rstarfree'] as MuName[]) {
      specs.push({
        name: `dyn-${coin}-${mu}`,
        run: () => ({ kind: 'dyn', name: `dyn-${coin}-${mu}`, coin, mu, reverse: false, reads: ALL_K.map(m => dynRead(coin, mu, m)) }),
      })
    }

    for (const mu of [...STEP1_MU, 'rstar', 'rstarfree'] as MuName[]) {
      for (const S of S_EIG) {
        const ks = mu === 'argu' ? ALL_K : CONTROL_K

        for (const half of [0, 1]) {
          const sub = ks.filter((_, i) => i % 2 === half)
          const name = `eig-${coin}-${mu}-${S}-${half}`

          specs.push({ name, run: () => ({ kind: 'eig', name, coin, mu, reads: sub.map(m => eigRead(coin, mu, S, m)) }) })
        }

        // one K alone: a re-read that replaces that K's read in the half stages (verdict: a single-K stage wins)
        for (const m of ALL_K) {
          const name = `eig-${coin}-${mu}-${S}-k${m}`

          specs.push({ name, run: () => ({ kind: 'eig', name, coin, mu, reads: [eigRead(coin, mu, S, m)] }) })
        }
      }
    }
  }

  return specs
}

// ---- the verdict ----

export function slocVerdict(stages: SlocStage[]): Verdict {
  const dyn = (coin: CoinName, mu: MuName, reverse = false): DynRead[] =>
    stages
      .filter((s): s is Extract<SlocStage, { kind: 'dyn' }> => s.kind === 'dyn' && s.coin === coin && s.mu === mu && s.reverse === reverse)
      .flatMap(s => s.reads)
  const eig = (coin: CoinName, mu: MuName, S: number): EigRead[] => {
    const own = stages.filter((s): s is Extract<SlocStage, { kind: 'eig' }> => s.kind === 'eig' && s.coin === coin && s.mu === mu)
    const byK = new Map<number, EigRead>()

    // half stages first, then single-K re-reads over them
    for (const s of [...own.filter(s => !/-k\d+$/.test(s.name)), ...own.filter(s => /-k\d+$/.test(s.name))]) {
      for (const r of s.reads) {
        if (r.S === S) {
          byK.set(Math.round((r.K * K_COUNT) / TAU), r)
        }
      }
    }

    return [...byK.values()]
  }
  const metrics: Record<string, number> = {}
  const notes: string[] = []
  const inst = stages.find((s): s is Extract<SlocStage, { kind: 'inst' }> => s.kind === 'inst')

  if (inst) {
    Object.assign(metrics, Object.fromEntries(Object.entries(inst.metrics).map(([k, v]) => [`inst_${k}`, v])))
  }

  let confined = true
  let ballistic = false
  let complete = true
  const lines: string[] = []

  for (const coin of COINS) {
    for (const mu of [...STEP1_MU, 'rstar', 'rstarfree'] as MuName[]) {
      const d = dyn(coin, mu)

      if (d.length === 0) {
        continue
      }

      const rmsMax = Math.max(...d.map(r => r.rmsMax))
      const allRead = d.every(r => !r.edgeHit && r.tEnd === T_MAX)
      const expMax = Math.max(...d.map(r => r.exponent))
      const slopeMin = Math.min(...d.map(r => r.slope))
      const key = `${coin}_${mu}`

      metrics[`${key}_rmsMax`] = rmsMax
      metrics[`${key}_allRead`] = allRead ? 1 : 0
      metrics[`${key}_exponentMax`] = expMax
      metrics[`${key}_exponentMin`] = Math.min(...d.map(r => r.exponent))
      metrics[`${key}_slopeMin`] = slopeMin
      metrics[`${key}_tEndMin`] = Math.min(...d.map(r => r.tEnd))
      metrics[`${key}_p0LateMax`] = Math.max(...d.map(r => r.p0Late))
      metrics[`${key}_normDrift`] = Math.max(...d.map(r => r.normDrift))
      metrics[`${key}_dropped`] = Math.max(...d.map(r => r.dropped))

      const e4 = eig(coin, mu, 4096)
      const e2 = eig(coin, mu, 2048)
      const pr4 = e4.length ? Math.max(...e4.map(r => r.prMax)) : NaN
      const pr2 = e2.length ? Math.max(...e2.map(r => r.prMax)) : NaN

      metrics[`${key}_prMax4096`] = pr4
      metrics[`${key}_prMax2048`] = pr2
      metrics[`${key}_prGrowth`] = pr4 / pr2

      if (e4.length) {
        metrics[`${key}_eigResidualW`] = Math.max(...e4.map(r => r.residualW), ...e2.map(r => r.residualW))
        metrics[`${key}_eigBadW`] = [...e4, ...e2].reduce((a, r) => a + r.badW, 0)
        metrics[`${key}_eigFrobGap`] = Math.max(...e4.map(r => r.frobGap), ...e2.map(r => r.frobGap))
        metrics[`${key}_velocityFDGap`] = Math.max(...e4.map(r => Math.abs(r.locVelocity - r.locVelocityFD)))
        metrics[`${key}_locVelocityAbsMax`] = Math.max(...e4.map(r => Math.abs(r.locVelocity)))
      }

      lines.push(
        `${key}: rms max ${rmsMax.toFixed(2)} (${allRead ? 'all K read to 1e5' : `edge from t ${metrics[`${key}_tEndMin`]}`}), exponent ${metrics[`${key}_exponentMin`]!.toFixed(3)}..${expMax.toFixed(3)}, slope min ${slopeMin.toExponential(2)}, PR max ${pr2.toFixed(1)} (2048) ${pr4.toFixed(1)} (4096)`,
      )

      if (mu === 'argu') {
        // every eigenvector finite (a non-finite residual marks a read whose participation is not known)
        const nonFinite = [...e4, ...e2].filter(r => !Number.isFinite(r.residualA) || (r.nanVectors ?? 0) > 0).length

        metrics[`${key}_eigNonFiniteReads`] = nonFinite

        const k16 = d.length === K_COUNT && e4.length === K_COUNT && e2.length === K_COUNT && nonFinite === 0

        complete = complete && k16

        if (!(allRead && rmsMax < RMS_GATE && pr4 < PR_GATE && pr4 <= PR_GROWTH * pr2)) {
          confined = false
        }

        if (expMax > EXPONENT_GATE) {
          ballistic = true
        }
      }

      if (mu === 'zero' && !(slopeMin > SLOPE_GATE && d.length === K_COUNT)) {
        confined = false
        notes.push(`control mu 0 on ${coin} fails: slope min ${slopeMin}`)
      }
    }

    for (const mu of ['argu', 'rstar', 'rstarfree'] as MuName[]) {
      const d = dyn(coin, mu, true)

      if (d.length) {
        const key = `${coin}_${mu}_rev`

        metrics[`${key}_rmsMax`] = Math.max(...d.map(r => r.rmsMax))
        metrics[`${key}_exponentMax`] = Math.max(...d.map(r => r.exponent))
        metrics[`${key}_tEndMin`] = Math.min(...d.map(r => r.tEnd))
      }
    }
  }

  const word = !complete ? 'INCOMPLETE' : confined ? 'CONFINED' : ballistic ? 'BALLISTIC' : 'OPEN'
  const status: Verdict['status'] = !complete ? 'open' : confined ? 'pass' : ballistic ? 'fail' : 'open'

  return verdict({
    status,
    claim: `string-localize ${word} at mu = arg u = ${MU_U.toFixed(6)}: ${lines.join('; ')}.`,
    metrics,
    control: {
      hadamardZeroSlopeMin: metrics.hadamard_zero_slopeMin ?? NaN,
      rstarZeroSlopeMin: metrics.rstar_zero_slopeMin ?? NaN,
      hadamardZ3ExponentMax: metrics.hadamard_z3_exponentMax ?? NaN,
      rstarZ3ExponentMax: metrics.rstar_z3_exponentMax ?? NaN,
    },
    notes: [
      'A two-walker line instrument (the relative walk at fixed centre-of-mass momentum), not R*s 4d cycle; the rstar coin is the cage engine pieces restricted to one root line.',
      ...notes,
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/string-localize',
  code: 'E-FRC-0307',
  title: 'explores whether a pair phase linear in separation at R*s own angle could localize two walkers separation',
  category: 'gauge',
  substrates: ['line'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (hours; the stage runner deck/vibe/tmp/sloc.sh splits it)
    return slocVerdict(slocSpecs().map(s => s.run()))
  },
})
