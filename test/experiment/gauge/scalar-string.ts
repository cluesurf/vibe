// A SEPARATION STRING IN THE MASS CHANNEL: DOES IT KEEP THE MIRROR AND LOCALIZE TWO WALKERS' SEPARATION? (note/project/
// vibe/roadmap/moving-matter item 0099, E-FRC-0311, decision 021 point 3, research/confinement-many-walker.md section 2,
// candidate S). Explores whether a pair piece that grows with separation could bound two walkers' separation when it
// enters the coin's mixing angle (a position-dependent mass) instead of a phase per beat (a vector potential). The phase
// channel failed both ways on this instrument (E-FRC-0307 unreversed localizes but breaks the E -> -E mirror, E-FRC-0308;
// reversed keeps it and is ballistic). This is the walk form of the Klein paradox: a linear vector potential does not
// confine a Dirac particle, a linear scalar one does.
//
// THE INSTRUMENT is E-FRC-0307's line (test/experiment/gauge/string-localize.ts, read-only, copied here, not imported):
// two distinguishable walkers, each with a two-state coin (its direction of motion), one beat = the coin on each walker,
// both move one site, then the pair phase (0 for a scalar string). At centre-of-mass momentum K the relative walk lives on
// the even r of a line of S sites, r in [-S/2, S/2 - 2], 4 internal states each, hard walls turn both walkers around.
//
// STEP 0, THE MIRROR OPERATOR (L1, derived before the run, checked by reads). At K = 0 every shift is real.
//   hadamard   C(theta) = [[cos theta, sin theta], [sin theta, -cos theta]], theta0 = pi/4 (H). Every beat is a real
//              matrix, so Gamma = K (complex conjugation in the (position, c1, c2) basis) commutes with it: an antiunitary
//              C with E -> -E. The family is real for every theta, so Gamma holds for every theta.
//   rstar      E-FRC-0307's line coin: Q0 = X P_S = (1/2)[[u - 1, u + 1], [u + 1, u - 1]], Q1 the same with conj u
//              (string-localize.ts:120-131), u = e^(i theta0), theta0 = arg u = arg ringUnit(-1, 4). Q0 = e^(i theta/2)
//              M(theta), Q1 = e^(-i theta/2) M(theta), with M(theta) = [[i sin(theta/2), cos(theta/2)], [cos(theta/2),
//              i sin(theta/2)]] (straight i sin(theta/2), bounce cos(theta/2): the mixing angle, det M = -1). Per walker
//              -sz conj(M) sz = M and -sz conj(Q0) sz = Q1, so on the pair Z = sz (x) sz:
//                mass family (rstar)       Z conj(B_b) Z = B_b each beat: Gamma = Z K commutes with every beat
//                literal pieces (rstarfull) Z conj(B0) Z = B1: Gamma = B0^dag Z K on the cycle (B1 B0 -> B0 B1 ~ W)
//              The literal pieces at theta(r) carry e^(+i theta(r)) on the pair in beat 1 and e^(-i theta(r)) in beat 2,
//              a REVERSED vector string riding on the mass one, so the gated rstar family is M(theta) on both beats (the
//              same cycle as the literal pieces at constant theta: e^(-i theta/2) e^(i theta/2) = 1 a walker). The
//              literal family is read beside it, ungated.
//   A phase string e^(i a(r)) breaks K and Z K (a -> -a), unless beat 2 carries e^(-i a) on the rstar coin: E-FRC-0307's
//   two vector reads are reproduced here (unreversed bounded and mirror broken, reversed ballistic and mirror kept).
// STEP 1, THE SCALAR STRING: each walker's coin is C(theta0 + mu |x1 - x2|), mu in {arg u, 1, sqrt 2, 2 pi/3, 0}.
//
// READS. (m) the mirror: t_m = tr W(0)^m, m = 1..32, over the whole line (S 512 and 2048), residual max_m 2 |Im t_m| /
// dim (spectrum closed under E -> -E <=> every t_m real); and the beat-level Gamma residual on a hashed vector.
// (a) rms(r) from r = 0 to t 1e5 on S 4096, each of 16 K, mixed start, edge weight checked every beat (E-FRC-0307).
// (b) every eigenvector's participation on S 2048 and 4096 (E-FRC-0307's banded route). (c) the centre-of-mass speed of
// the most localized eigenvector within S/4 of r = 0 (walker 2's mean step a beat, checked by Hellmann-Feynman).
//
// GATES, fixed 2026-10-10 in the item, made operational here before any read:
//   SCALAR-CONFINES  at mu = arg u on both coins: the mirror holds to 1e-10, max_t rms(r) < 20 to t 1e5 (edge weight
//                    <= 1e-12 throughout) on all 16 K, the largest participation over all eigenvectors and 16 K is below 50
//                    on S 4096 with ratio 4096/2048 <= 1.2, every eigenvector finite, and mu = 0 is ballistic with rms
//                    slope above 0.1 site a beat on every K of both coins
//   SCALAR-FAILS     the mirror holds and, at mu = arg u, some K of either coin has the rms exponent above 0.5
//   OPEN             otherwise, naming the clause (bounded but wider than the gates is OPEN, as in E-FRC-0307)
// UNGATED, printed: mu = 2 pi/3 (predicted ballistic, period 3), mu = 1 and sqrt 2, the literal rstar pieces at arg u.
// INSTRUMENT (a failure makes the verdict open): the family keeps Gamma to 1e-12 on 64 theta; the free walk's mirror holds
// to 1e-10; the vector reads reproduce E-FRC-0307 (unreversed bounded, exponent below 0.1, reversed exponent above 0.5)
// with mirror residuals unreversed above 1e-6 and reversed below 1e-10; the scalar family at mu = 0 is E-FRC-0307's free
// cycle (rstar: B1 B0 equal to 1e-12 on a hashed vector).
// Lead's prediction: SCALAR-CONFINES for arg u, 1 and sqrt 2.
//
// DETERMINISM: no random numbers (fixed integer hashes). FLOAT: measurement; every verdict is a number against a fixed
// tolerance. LIMIT: a two-walker line instrument (the relative walk at fixed K), not R*'s 4d cycle or its colour channels.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { tridiagonalEigenvalues } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

const TAU = 2 * Math.PI
const K_COUNT = 16
const T_MAX = 100000
const S_DYN = 4096
const S_EIG = [2048, 4096] as const
const S_MIRROR = [512, 2048] as const
const MOMENTS = 32
const EDGE = 32
const EDGE_TOL = 1e-12
const DROP = 1e-80
const THETAS = [Math.SQRT2 - 1, Math.sqrt(3) - 1, (Math.sqrt(5) - 1) / 2, Math.PI / 7 + 0.1]
const CLUSTER = 1e-10
const RMS_GATE = 20
const PR_GATE = 50
const PR_GROWTH = 1.2
const SLOPE_GATE = 0.1
const EXPONENT_GATE = 0.5
const MIRROR_HOLDS = 1e-10
const MIRROR_BROKEN = 1e-6
const FAMILY_TOL = 1e-12

export const MU_U = unitAngle(ringUnit(-1, 4))

// ---- strings and coins ----

export type MuName = 'argu' | 'one' | 'sqrt2' | 'z3' | 'zero'

export function muOf(mu: MuName): number {
  switch (mu) {
    case 'argu':
      return MU_U
    case 'one':
      return 1
    case 'sqrt2':
      return Math.SQRT2
    case 'z3':
      return TAU / 3
    case 'zero':
      return 0
  }
}

// a 2 x 2 complex matrix, row-major
type C2 = { re: [number, number, number, number]; im: [number, number, number, number] }

export type Family = 'hadamard' | 'rstar' | 'rstarfull'

export function theta0Of(family: Family): number {
  return family === 'hadamard' ? Math.PI / 4 : MU_U
}

export function beatsOf(family: Family): number {
  return family === 'hadamard' ? 1 : 2
}

// the family's coin for beat b at angle theta
export function familyCoin(family: Family, b: number, theta: number): C2 {
  if (family === 'hadamard') {
    const c = Math.cos(theta)
    const s = Math.sin(theta)

    return { re: [c, s, s, -c], im: [0, 0, 0, 0] }
  }

  // M(theta) = [[i sin(theta/2), cos(theta/2)], [cos(theta/2), i sin(theta/2)]]
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)

  if (family === 'rstar') {
    return { re: [0, c, c, 0], im: [s, 0, 0, s] }
  }

  // literal pieces: Q0 = e^(i theta/2) M = (1/2)[[e - 1, e + 1], ...], Q1 = e^(-i theta/2) M, e = e^(+-i theta)
  const er = Math.cos(theta)
  const ei = b % 2 === 0 ? Math.sin(theta) : -Math.sin(theta)

  return b % 2 === 0
    ? { re: [(er - 1) / 2, (er + 1) / 2, (er + 1) / 2, (er - 1) / 2], im: [ei / 2, ei / 2, ei / 2, ei / 2] }
    : { re: [(1 - er) / 2, (1 + er) / 2, (1 + er) / 2, (1 - er) / 2], im: [-ei / 2, ei / 2, ei / 2, -ei / 2] }
}

// E-FRC-0307's own coins for the vector reads (string-localize.ts:113-134, copied)
function vectorCoin(family: Family, b: number): C2 {
  if (family === 'hadamard') {
    const h = Math.SQRT1_2

    return { re: [h, h, h, -h], im: [0, 0, 0, 0] }
  }

  const ur = Math.cos(MU_U)
  const ui = Math.sin(MU_U)

  return b % 2 === 0
    ? { re: [(ur - 1) / 2, (ur + 1) / 2, (ur + 1) / 2, (ur - 1) / 2], im: [ui / 2, ui / 2, ui / 2, ui / 2] }
    : { re: [(1 - ur) / 2, (1 + ur) / 2, (1 + ur) / 2, (1 - ur) / 2], im: [ui / 2, -ui / 2, -ui / 2, ui / 2] }
}

// ---- the walk ----

export type WalkSpec = {
  family: Family
  mu: MuName
  // scalar: the coin angle theta0 + mu |r|, no phase; vector: E-FRC-0307's coin, the phase e^(i mu |r|) after the move
  channel: 'scalar' | 'vector'
  // vector only: beat 2 takes e^(-i mu |r|)
  reverse: boolean
}

export type Walk = {
  nb: number
  J: number
  S: number
  K: number
  kr: number
  ki: number
  // per beat, per position: the coin (4 entries) and the pair phase's cos and sin
  cre: Float64Array[]
  cim: Float64Array[]
  pc: Float64Array[]
  ps: Float64Array[]
}

export function makeWalk(spec: WalkSpec, S: number, K: number): Walk {
  const nb = beatsOf(spec.family)
  const J = S / 2
  const mu = muOf(spec.mu)
  const th0 = theta0Of(spec.family)
  const cre: Float64Array[] = []
  const cim: Float64Array[] = []
  const pc: Float64Array[] = []
  const ps: Float64Array[] = []

  for (let b = 0; b < nb; b++) {
    const re = new Float64Array(J * 4)
    const im = new Float64Array(J * 4)
    const c = new Float64Array(J)
    const s = new Float64Array(J)

    for (let j = 0; j < J; j++) {
      const a = Math.abs(2 * j - S / 2)
      let C: C2

      if (spec.channel === 'scalar') {
        C = familyCoin(spec.family, b, th0 + mu * a)
        c[j] = 1
        s[j] = 0
      } else {
        C = vectorCoin(spec.family, b)

        const t = spec.reverse && b % 2 === 1 ? -(mu * a) : mu * a

        c[j] = Math.cos(t)
        s[j] = Math.sin(t)
      }

      for (let q = 0; q < 4; q++) {
        re[j * 4 + q] = C.re[q]!
        im[j * 4 + q] = C.im[q]!
      }
    }

    cre.push(re)
    cim.push(im)
    pc.push(c)
    ps.push(s)
  }

  return { nb, J, S, K, kr: Math.cos(K), ki: -Math.sin(K), cre, cim, pc, ps }
}

// internal index c = 2 c1 + c2, c_i = 0 moves +1, 1 moves -1
const D1 = [1, 1, -1, -1]
const D2 = [1, -1, 1, -1]
const DJ = [0, 1, -1, 0]

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
  const bb = b % w.nb
  const CR = w.cre[bb]!
  const CI = w.cim[bb]!
  const PC = w.pc[bb]!
  const PS = w.ps[bb]!
  const olo = Math.max(0, lo - 1)
  const ohi = Math.min(w.J - 1, hi + 1)

  or.fill(0, olo * 4, (ohi + 1) * 4)
  oi.fill(0, olo * 4, (ohi + 1) * 4)

  for (let j = lo; j <= hi; j++) {
    const o = j * 4
    const a0r = CR[o]!
    const a1r = CR[o + 1]!
    const a2r = CR[o + 2]!
    const a3r = CR[o + 3]!
    const a0i = CI[o]!
    const a1i = CI[o + 1]!
    const a2i = CI[o + 2]!
    const a3i = CI[o + 3]!
    const v0r = ir[o]!
    const v1r = ir[o + 1]!
    const v2r = ir[o + 2]!
    const v3r = ir[o + 3]!
    const v0i = ii[o]!
    const v1i = ii[o + 1]!
    const v2i = ii[o + 2]!
    const v3i = ii[o + 3]!
    // the coin on walker 2 (index c2): pairs (0, 1) and (2, 3)
    const t0r = a0r * v0r - a0i * v0i + a1r * v1r - a1i * v1i
    const t0i = a0r * v0i + a0i * v0r + a1r * v1i + a1i * v1r
    const t1r = a2r * v0r - a2i * v0i + a3r * v1r - a3i * v1i
    const t1i = a2r * v0i + a2i * v0r + a3r * v1i + a3i * v1r
    const t2r = a0r * v2r - a0i * v2i + a1r * v3r - a1i * v3i
    const t2i = a0r * v2i + a0i * v2r + a1r * v3i + a1i * v3r
    const t3r = a2r * v2r - a2i * v2i + a3r * v3r - a3i * v3i
    const t3i = a2r * v2i + a2i * v2r + a3r * v3i + a3i * v3r
    // the coin on walker 1 (index c1): pairs (0, 2) and (1, 3)
    const ur = [
      a0r * t0r - a0i * t0i + a1r * t2r - a1i * t2i,
      a0r * t1r - a0i * t1i + a1r * t3r - a1i * t3i,
      a2r * t0r - a2i * t0i + a3r * t2r - a3i * t2i,
      a2r * t1r - a2i * t1i + a3r * t3r - a3i * t3i,
    ]
    const ui = [
      a0r * t0i + a0i * t0r + a1r * t2i + a1i * t2r,
      a0r * t1i + a0i * t1r + a1r * t3i + a1i * t3r,
      a2r * t0i + a2i * t0r + a3r * t2i + a3i * t2r,
      a2r * t1i + a2i * t1r + a3r * t3i + a3i * t3r,
    ]

    for (let c = 0; c < 4; c++) {
      let jt = j + DJ[c]!
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

      const xr = ur[c]! * pr - ui[c]! * pi
      const xi = ur[c]! * pi + ui[c]! * pr
      const cr = PC[jt]!
      const ci = PS[jt]!
      const k = jt * 4 + ct

      or[k]! += xr * cr - xi * ci
      oi[k]! += xr * ci + xi * cr
    }
  }
}

// apply the cycle to a full vector
export function applyCycle(w: Walk, xr: Float64Array, xi: Float64Array): { re: Float64Array; im: Float64Array } {
  let ar = Float64Array.from(xr)
  let ai = Float64Array.from(xi)
  let br = new Float64Array(xr.length)
  let bi = new Float64Array(xr.length)

  for (let s = 0; s < w.nb; s++) {
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

// ---- STEP 0: the family keeps Gamma, the beat-level Gamma, the free cycle, and the mirror by trace moments ----

// the pair-level Gamma image of a coin pair: hadamard K (conj), rstar families Z K (Z = sz (x) sz on the pair, which is
// sz conj(.) sz per walker up to the pair's sign, and -sz conj(.) sz per walker since the two minus signs cancel)
function gammaCoin(family: Family, C: C2): C2 {
  if (family === 'hadamard') {
    return { re: [...C.re], im: [-C.im[0], -C.im[1], -C.im[2], -C.im[3]] }
  }

  // -sz conj(C) sz: diagonal -conj, off-diagonal +conj
  return {
    re: [-C.re[0], C.re[1], C.re[2], -C.re[3]],
    im: [C.im[0], -C.im[1], -C.im[2], C.im[3]],
  }
}

function coinGap(A: C2, B: C2): number {
  let g = 0

  for (let q = 0; q < 4; q++) {
    g = Math.max(g, Math.hypot(A.re[q]! - B.re[q]!, A.im[q]! - B.im[q]!))
  }

  return g
}

function unitarityGap(C: C2): number {
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

  return g
}

// max over 64 theta of the coin family's Gamma residual: hadamard and rstar Gamma C(theta) Gamma^-1 = C(theta) on every
// beat; rstarfull Gamma Q0 Gamma^-1 = Q1 (the beat swap); and the unitarity of each coin
export function familyGamma(family: Family): { gamma: number; unitary: number; detSpread: number } {
  let gamma = 0
  let unitary = 0
  let dMin = Infinity
  let dMax = -Infinity

  for (let q = 0; q < 64; q++) {
    const th = (TAU * q) / 64 + 0.0137
    const nb = beatsOf(family)

    for (let b = 0; b < nb; b++) {
      const C = familyCoin(family, b, th)
      const target = family === 'rstarfull' ? familyCoin(family, b + 1, th) : C

      gamma = Math.max(gamma, coinGap(gammaCoin(family, C), target))
      unitary = Math.max(unitary, unitarityGap(C))

      // det C's phase (a mass-only family keeps it fixed)
      const dr = C.re[0] * C.re[3] - C.im[0] * C.im[3] - (C.re[1] * C.re[2] - C.im[1] * C.im[2])
      const di = C.re[0] * C.im[3] + C.im[0] * C.re[3] - (C.re[1] * C.im[2] + C.im[1] * C.re[2])
      const ph = Math.atan2(di, dr)

      dMin = Math.min(dMin, Math.abs(ph))
      dMax = Math.max(dMax, Math.abs(ph))
    }
  }

  return { gamma, unitary, detSpread: dMax - dMin }
}

// Gamma on a full vector: conj, then Z for the rstar families (sign (-1)^(c1 + c2))
const ZSIGN = [1, -1, -1, 1]

function gammaVec(family: Family, xr: Float64Array, xi: Float64Array): { re: Float64Array; im: Float64Array } {
  const re = Float64Array.from(xr)
  const im = new Float64Array(xi.length)

  for (let i = 0; i < xi.length; i++) {
    im[i] = -xi[i]!

    if (family !== 'hadamard') {
      re[i]! *= ZSIGN[i % 4]!
      im[i]! *= ZSIGN[i % 4]!
    }
  }

  return { re, im }
}

// the beat-level Gamma residual at K 0 on a hashed vector: |Gamma B_b Gamma^-1 x - B_(b') x| / |x|, with b' = b (one
// family member a beat) or the other beat (rstarfull, and E-FRC-0307's rstar vector coin)
export function beatGamma(spec: WalkSpec, S: number): number {
  const w = makeWalk(spec, S, 0)
  const n = w.J * 4
  const x = hashStart(n, 3)
  let nx = 0

  for (let i = 0; i < n; i++) {
    nx += x.re[i]! ** 2 + x.im[i]! ** 2
  }

  const swap = spec.family !== 'hadamard' && (spec.family === 'rstarfull' || spec.channel === 'vector')
  let g = 0

  for (let b = 0; b < w.nb; b++) {
    // Gamma^-1 = Gamma (Gamma^2 = 1)
    const gx = gammaVec(spec.family, x.re, x.im)
    const yr = new Float64Array(n)
    const yi = new Float64Array(n)

    beat(w, b, gx.re, gx.im, yr, yi, 0, w.J - 1)

    const lhs = gammaVec(spec.family, yr, yi)
    const zr = new Float64Array(n)
    const zi = new Float64Array(n)

    beat(w, swap ? b + 1 : b, x.re, x.im, zr, zi, 0, w.J - 1)

    let d = 0

    for (let i = 0; i < n; i++) {
      d += (lhs.re[i]! - zr[i]!) ** 2 + (lhs.im[i]! - zi[i]!) ** 2
    }

    g = Math.max(g, Math.sqrt(d / nx))
  }

  return g
}

// the scalar family at mu 0 is E-FRC-0307's free cycle: |W_scalar x - W_0307 x| / |x| at K 0.3 on a hashed vector
export function freeMatch(family: Family, S: number): number {
  const a = makeWalk({ family, mu: 'zero', channel: 'scalar', reverse: false }, S, 0.3)
  const b = makeWalk({ family, mu: 'zero', channel: 'vector', reverse: false }, S, 0.3)
  const x = hashStart(a.J * 4, 5)
  const ya = applyCycle(a, x.re, x.im)
  const yb = applyCycle(b, x.re, x.im)
  let d = 0
  let nx = 0

  for (let i = 0; i < x.re.length; i++) {
    d += (ya.re[i]! - yb.re[i]!) ** 2 + (ya.im[i]! - yb.im[i]!) ** 2
    nx += x.re[i]! ** 2 + x.im[i]! ** 2
  }

  return Math.sqrt(d / nx)
}

export type MirrorRead = { spec: WalkSpec; S: number; dim: number; residual: number; reMax: number; normGap: number }

// t_m = tr W(0)^m, m = 1..MOMENTS, over every basis state of the line; residual max_m 2 |Im t_m| / dim
export function mirrorRead(spec: WalkSpec, S: number): MirrorRead {
  const w = makeWalk(spec, S, 0)
  const n = w.J * 4
  const tr = new Float64Array(MOMENTS)
  const ti = new Float64Array(MOMENTS)
  let normGap = 0
  let xr = new Float64Array(n)
  let xi = new Float64Array(n)
  let yr = new Float64Array(n)
  let yi = new Float64Array(n)

  for (let k = 0; k < n; k++) {
    const j0 = Math.floor(k / 4)

    xr.fill(0)
    xi.fill(0)
    xr[k] = 1

    let lo = j0
    let hi = j0

    for (let m = 0; m < MOMENTS; m++) {
      for (let s = 0; s < w.nb; s++) {
        beat(w, s, xr, xi, yr, yi, lo, hi)
        lo = Math.max(0, lo - 1)
        hi = Math.min(w.J - 1, hi + 1)

        const a = xr
        const c = xi

        xr = yr
        xi = yi
        yr = a
        yi = c
      }

      tr[m]! += xr[k]!
      ti[m]! += xi[k]!
    }

    let nn = 0

    for (let i = lo * 4; i < (hi + 1) * 4; i++) {
      nn += xr[i]! ** 2 + xi[i]! ** 2
    }

    normGap = Math.max(normGap, Math.abs(nn - 1))
  }

  let residual = 0
  let reMax = 0

  for (let m = 0; m < MOMENTS; m++) {
    residual = Math.max(residual, (2 * Math.abs(ti[m]!)) / n)
    reMax = Math.max(reMax, Math.abs(tr[m]!) / n)
  }

  return { spec, S, dim: n, residual, reMax, normGap }
}

// ---- STEP 1 (a): rms(r) from r = 0 (E-FRC-0307's dynRead, tight loops) ----

export type DynRead = {
  K: number
  rmsMax: number
  tEnd: number
  edgeHit: boolean
  edgeMax: number
  exponent: number
  slope: number
  samples: [number, number][]
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

export function dynRead(spec: WalkSpec, m: number, tMax = T_MAX): DynRead {
  const K = (TAU * m) / K_COUNT
  const w = makeWalk(spec, S_DYN, K)
  const J = w.J
  const j0 = S_DYN / 4
  const times = logTimes(tMax)
  const st = [0, 1, 2, 3].map(c => {
    const re = new Float64Array(J * 4)
    const im = new Float64Array(J * 4)

    re[j0 * 4 + c] = 1

    return { re, im, or: new Float64Array(J * 4), oi: new Float64Array(J * 4) }
  })
  const pw = new Float64Array(J)
  let lo = j0
  let hi = j0
  let rmsMax = 0
  let tEnd = 0
  let edgeHit = false
  let edgeMax = 0
  let dropped = 0
  let normDrift = 0
  let lastRms = 0
  const samples: [number, number][] = []
  const p0 = new Float64Array(tMax + 1)

  for (let t = 1; t <= tMax; t++) {
    const b = (t - 1) % w.nb

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

    // position weights (sum over the four starts)
    for (let j = lo; j <= hi; j++) {
      let x = 0

      for (const s of st) {
        const o = j * 4

        x +=
          s.re[o]! ** 2 + s.im[o]! ** 2 + s.re[o + 1]! ** 2 + s.im[o + 1]! ** 2 +
          s.re[o + 2]! ** 2 + s.im[o + 2]! ** 2 + s.re[o + 3]! ** 2 + s.im[o + 3]! ** 2
      }

      pw[j] = x
    }

    // trim the window's tiny frontier (the weight dropped is counted)
    while (lo < j0 && pw[lo]! < DROP) {
      dropped += pw[lo]!

      for (const s of st) {
        s.re.fill(0, lo * 4, lo * 4 + 4)
        s.im.fill(0, lo * 4, lo * 4 + 4)
      }

      lo++
    }

    while (hi > j0 && pw[hi]! < DROP) {
      dropped += pw[hi]!

      for (const s of st) {
        s.re.fill(0, hi * 4, hi * 4 + 4)
        s.im.fill(0, hi * 4, hi * 4 + 4)
      }

      hi--
    }

    let norm = 0
    let r2 = 0
    let edge = 0

    for (let j = lo; j <= hi; j++) {
      const p = pw[j]! / 4
      const r = 2 * j - S_DYN / 2

      norm += p
      r2 += p * r * r

      if (j < EDGE || j >= J - EDGE) {
        edge += p
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
    p0[t] = lo <= j0 && j0 <= hi ? pw[j0]! / 4 : 0

    if (times.has(t)) {
      samples.push([t, rms])
    }
  }

  if (samples.length === 0 || samples[samples.length - 1]![0] !== tEnd) {
    samples.push([tEnd, lastRms])
  }

  let p0Late = 0

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

// ---- UNGATED: the tail on a long line (S 65536) until anything above 1e-20 reaches the walls ----

export type TailRead = {
  K: number
  S: number
  tEnd: number
  // [t, rms, weight beyond |r| 64, weight beyond |r| 512, the farthest |r| holding a position weight above 1e-12]
  samples: [number, number, number, number, number][]
  // log-log slopes over t >= tEnd / 30: rms, and the tail weights
  rmsExponent: number
  tail64Exponent: number
  tail512Exponent: number
  frontSpeed: number
}

export function tailRead(spec: WalkSpec, m: number, S = 65536, tMax = 40000): TailRead {
  const K = (TAU * m) / K_COUNT
  const w = makeWalk(spec, S, K)
  const J = w.J
  const j0 = S / 4
  const times = logTimes(tMax)
  const st = [0, 1, 2, 3].map(c => {
    const re = new Float64Array(J * 4)
    const im = new Float64Array(J * 4)

    re[j0 * 4 + c] = 1

    return { re, im, or: new Float64Array(J * 4), oi: new Float64Array(J * 4) }
  })
  let lo = j0
  let hi = j0
  let tEnd = 0
  const samples: [number, number, number, number, number][] = []

  for (let t = 1; t <= tMax; t++) {
    const b = (t - 1) % w.nb

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

    const pAt = (j: number): number => {
      let x = 0

      for (const s of st) {
        for (let c = 0; c < 4; c++) {
          x += s.re[j * 4 + c]! ** 2 + s.im[j * 4 + c]! ** 2
        }
      }

      return x / 4
    }

    if ((lo < EDGE && pAt(lo) > 1e-20) || (hi >= J - EDGE && pAt(hi) > 1e-20)) {
      break
    }

    tEnd = t

    if (times.has(t)) {
      let norm = 0
      let r2 = 0
      let t64 = 0
      let t512 = 0
      let front = 0

      for (let j = lo; j <= hi; j++) {
        const p = pAt(j)
        const r = 2 * j - S / 2

        norm += p
        r2 += p * r * r

        if (Math.abs(r) > 64) {
          t64 += p
        }

        if (Math.abs(r) > 512) {
          t512 += p
        }

        if (p > 1e-12) {
          front = Math.max(front, Math.abs(r))
        }
      }

      samples.push([t, Math.sqrt(r2 / norm), t64, t512, front])
    }
  }

  const late = samples.filter(([t]) => t >= tEnd / 30)
  const slope = (k: 1 | 2 | 3): number =>
    fitLine(
      late.filter(x => x[k] > 0).map(([t]) => Math.log(t)),
      late.filter(x => x[k] > 0).map(x => Math.log(x[k])),
    )

  return {
    K,
    S,
    tEnd,
    samples,
    rmsExponent: slope(1),
    tail64Exponent: slope(2),
    tail512Exponent: slope(3),
    frontSpeed: fitLine(late.map(([t]) => t), late.map(x => x[4])),
  }
}

// ---- STEP 1 (b): the cycle as a band, its Hermitian part, tridiagonal reduction, inverse iteration (E-FRC-0307) ----

type Band = { n: number; b: number; re: Float64Array; im: Float64Array }

export function cycleBand(w: Walk): Band {
  const nb = w.nb
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

type Lower = { n: number; b: number; B: number; re: Float64Array; im: Float64Array }

export function hermitianPart(W: Band, theta: number): Lower {
  const { n, b } = W
  const B = b + 1
  const width = 2 * b + 1
  const L: Lower = { n, b, B, re: new Float64Array(n * (B + 1)), im: new Float64Array(n * (B + 1)) }
  const cr = Math.cos(theta)
  const ci = -Math.sin(theta)

  for (let i = 0; i < n; i++) {
    for (let d = 0; d <= b && i - d >= 0; d++) {
      const j = i - d
      const wr = W.re[i * width + j - i + b]!
      const wi = W.im[i * width + j - i + b]!
      const vr = W.re[j * width + i - j + b]!
      const vi = -W.im[j * width + i - j + b]!

      L.re[i * (B + 1) + d] = (cr * wr - ci * wi + cr * vr + ci * vi) / 2
      L.im[i * (B + 1) + d] = (cr * wi + ci * wr + cr * vi - ci * vr) / 2
    }
  }

  return L
}

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
      sr = (yr * xr + yi * xi) / (ax * r)
      si = (yr * xi - yi * xr) / (ax * r)
    }

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

      R[ak] = c * ar + sr * br - si * bi
      I[ak] = c * ai + sr * bi + si * br
      R[bk] = -(sr * ar + si * ai) + c * br
      I[bk] = -(sr * ai - si * ar) + c * bi
    }

    const a = R[at(p, p)]!
    const dd = R[at(q, q)]!
    const btr = R[at(q, p)]!
    const bti = I[at(q, p)]!
    const g00r = c * a + (sr * btr - si * bti)
    const g01r = c * btr + sr * dd
    const g01i = -c * bti + si * dd
    const g10r = -sr * a + c * btr
    const g10i = si * a + c * bti
    const g11r = -(sr * btr - si * bti) + c * dd
    const g11i = sr * bti + si * btr
    const mpp = g00r * c + (g01r * sr + g01i * si)
    const mqpr = g10r * c + (g11r * sr + g11i * si)
    const mqpi = g10i * c + (g11i * sr - g11r * si)
    const mqq = -(g10r * sr - g10i * si) + g11r * c

    R[at(p, p)] = mpp
    I[at(p, p)] = 0
    R[at(q, q)] = mqq
    I[at(q, q)] = 0
    R[at(q, p)] = mqpr
    I[at(q, p)] = mqpi

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

// implicit QL (tql1, as code/algebra/linear/eig-hermitian-tridiagonal.ts:137-217) with an absolute deflation floor
// eps * 1e-3 * |T| added to the relative test and 600 sweeps; null when it still does not converge
function qlFloor(d0: Float64Array, e0: Float64Array): number[] | null {
  const n = d0.length
  const d = Float64Array.from(d0)
  const e = new Float64Array(n)
  let norm = 0

  e.set(e0)

  for (let i = 0; i < n; i++) {
    norm = Math.max(norm, Math.abs(d[i]!) + Math.abs(e[i]!) + (i > 0 ? Math.abs(e[i - 1]!) : 0))
  }

  const floor = Number.EPSILON * 1e-3 * norm

  for (let l = 0; l < n; l++) {
    let iter = 0

    for (;;) {
      let m = l

      for (; m < n - 1; m++) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)

        if (Math.abs(e[m]!) <= Number.EPSILON * dd + floor) {
          break
        }
      }

      if (m === l) {
        break
      }

      if (++iter > 600) {
        return null
      }

      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)

      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? Math.abs(r) : -Math.abs(r)))

      let s = 1
      let c = 1
      let p = 0
      let i = m - 1

      for (; i >= l; i--) {
        let f = s * e[i]!
        const bb = c * e[i]!

        r = Math.hypot(f, g)
        e[i + 1] = r

        if (r === 0) {
          d[i + 1] = d[i + 1]! - p
          e[m] = 0
          break
        }

        s = f / r
        c = g / r
        g = d[i + 1]! - p
        r = (d[i]! - g) * s + 2 * c * bb
        p = s * r
        d[i + 1] = g + p
        g = c * r - bb
        f = 0
        void f
      }

      if (r === 0 && i >= l) {
        continue
      }

      d[l] = d[l]! - p
      e[l] = g
      e[m] = 0
    }
  }

  const out = Array.from(d).sort((a, b) => a - b)

  return out.every(Number.isFinite) ? out : null
}

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

export type EigRead = {
  K: number
  S: number
  n: number
  // a QL failure leaves the read without vectors (failed 1)
  failed: number
  // the angle of A = Re(e^(-i theta) W) whose QL converged
  theta?: number
  traceGap: number
  frobGap: number
  offBand: number
  residualA: number
  residualW: number
  badW: number
  retries: number
  nanVectors: number
  prMax: number
  prMaxCentre: number
  // the most extended vector's weight on the coin singlet (|+-> - |-+>)/sqrt 2, where C (x) C = det C for any C, and
  // the second largest participation
  prMaxSinglet?: number
  prSecond?: number
  prMedian: number
  prMinBulk: number
  locCentre: number
  locPhase: number
  locVelocity: number
  locVelocityFD: number
  prHist: [number, number, number, number]
  seconds: number
}

export function eigRead(spec: WalkSpec, S: number, m: number): EigRead {
  const t0 = Date.now()
  const K = (TAU * m) / K_COUNT
  const w = makeWalk(spec, S, K)
  const W = cycleBand(w)
  const nb = w.nb
  // A = Re(e^(-i theta) W) at the first theta whose tridiagonal QL converges (E-FRC-0307 used sqrt 2 - 1 only and lost
  // its free and Z3 controls to QL failures)
  let found: { F: Band; n: number; b: number; trace: number; frob: number; offBand: number; lam: number[]; theta: number } | null = null

  for (const theta of THETAS) {
    const L = hermitianPart(W, theta)
    const n = L.n
    const b = L.b
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

    try {
      const lam = tridiagonalEigenvalues(tri.d, tri.e.subarray(0, n - 1)).sort((x, y) => x - y)

      found = { F, n, b, trace, frob, offBand: tri.offBand, lam, theta }
      break
    } catch {
      // the last angle: the local QL with an absolute deflation floor (sstr traps: 474 of 1023 off-diagonals below
      // 1e-14 at hadamard arg u K 0, a near-decoupled tridiagonal on which the shared tql1 never deflates)
      if (theta === THETAS[THETAS.length - 1]) {
        const lam = qlFloor(tri.d, tri.e.subarray(0, n - 1))

        if (lam) {
          found = { F, n, b, trace, frob, offBand: tri.offBand, lam, theta: -theta }
        }
      }
    }
  }

  if (!found) {
    return {
      K, S, n: W.n, failed: 1, theta: NaN, traceGap: NaN, frobGap: NaN, offBand: NaN, residualA: NaN, residualW: NaN,
      badW: 0, retries: 0, nanVectors: 0, prMax: NaN, prMaxCentre: NaN, prMaxSinglet: NaN, prSecond: NaN,
      prMedian: NaN, prMinBulk: NaN, locCentre: NaN, locPhase: NaN, locVelocity: NaN, locVelocityFD: NaN,
      prHist: [0, 0, 0, 0], seconds: (Date.now() - t0) / 1000,
    }
  }

  const { F, n, b, trace, frob, lam } = found
  const fw = 2 * b + 1
  const tri = { offBand: found.offBand }

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
  let prMaxSinglet = NaN
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
      prMaxSinglet = 0

      for (let j = 0; j < w.J; j++) {
        prMaxSinglet += ((x.re[j * 4 + 1]! - x.re[j * 4 + 2]!) ** 2 + (x.im[j * 4 + 1]! - x.im[j * 4 + 2]!) ** 2) / 2
      }
    }

    if (Math.abs(centre) < S / 4 && (!best || pr < best.pr)) {
      best = { pr, re: Float64Array.from(x.re), im: Float64Array.from(x.im), centre }
    }
  }

  prs.sort((x, y) => x - y)

  // the most localized bulk vector: walker 2's mean step a beat (position-dependent coin), and the FD of its phase
  let locVelocity = NaN
  let locVelocityFD = NaN
  let locPhase = NaN

  if (best) {
    let vr = Float64Array.from(best.re)
    let vi = Float64Array.from(best.im)
    let v = 0

    for (let s = 0; s < nb; s++) {
      const CR = w.cre[s]!
      const CI = w.cim[s]!

      for (let j = 0; j < w.J; j++) {
        const o = j * 4
        const ar = [0, 0, 0, 0]
        const ai = [0, 0, 0, 0]

        for (let c1 = 0; c1 < 2; c1++) {
          for (let c2 = 0; c2 < 2; c2++) {
            let sr = 0
            let si = 0

            for (let a1 = 0; a1 < 2; a1++) {
              for (let a2 = 0; a2 < 2; a2++) {
                const g1r = CR[o + c1 * 2 + a1]!
                const g1i = CI[o + c1 * 2 + a1]!
                const g2r = CR[o + c2 * 2 + a2]!
                const g2i = CI[o + c2 * 2 + a2]!
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
          const jt = j + DJ[c]!

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
      const wk = makeWalk(spec, S, K + dk)
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
    failed: 0,
    theta: found.theta,
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
    prMaxSinglet,
    prSecond: prs[prs.length - 2] ?? NaN,
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

export type SstrStage =
  | { kind: 'dyn'; name: string; spec: WalkSpec; reads: DynRead[] }
  | { kind: 'eig'; name: string; spec: WalkSpec; reads: EigRead[] }
  | { kind: 'mirror'; name: string; reads: MirrorRead[] }
  | { kind: 'tail'; name: string; spec: WalkSpec; reads: TailRead[] }
  | { kind: 'inst'; name: string; metrics: Record<string, number> }

export type SstrSpec = { name: string; run: () => SstrStage }

const ALL_K = Array.from({ length: K_COUNT }, (_, m) => m)
const CONTROL_K = [0, 4, 8, 12]
const GATED: Family[] = ['hadamard', 'rstar']
const STEP1_MU: MuName[] = ['argu', 'one', 'sqrt2', 'z3', 'zero']

const scalar = (family: Family, mu: MuName): WalkSpec => ({ family, mu, channel: 'scalar', reverse: false })
const vector = (family: Family, reverse: boolean): WalkSpec => ({ family, mu: 'argu', channel: 'vector', reverse })

// the vector reads of STEP 0 (E-FRC-0307's two reads at arg u, and its Hadamard unreversed one)
const VECTOR_SPECS: { key: string; spec: WalkSpec }[] = [
  { key: 'vec-hadamard', spec: vector('hadamard', false) },
  { key: 'vec-rstar', spec: vector('rstar', false) },
  { key: 'vec-rstar-rev', spec: vector('rstar', true) },
]

function specKey(s: WalkSpec): string {
  return s.channel === 'vector' ? `vec-${s.family}${s.reverse ? '-rev' : ''}` : `${s.family}-${s.mu}`
}

function instruments(): Record<string, number> {
  const out: Record<string, number> = { mu: MU_U, theta0Hadamard: Math.PI / 4, theta0Rstar: MU_U }

  for (const family of ['hadamard', 'rstar', 'rstarfull'] as Family[]) {
    const f = familyGamma(family)

    out[`${family}FamilyGamma`] = f.gamma
    out[`${family}FamilyUnitary`] = f.unitary
    out[`${family}FamilyDetSpread`] = f.detSpread
    out[`${family}FreeMatch`] = freeMatch(family, 64)

    for (const mu of STEP1_MU) {
      out[`${family}_${mu}_beatGamma`] = beatGamma(scalar(family, mu), 64)
    }
  }

  for (const { key, spec } of VECTOR_SPECS) {
    out[`${key}_beatGamma`] = beatGamma(spec, 64)
  }

  // the beat is unitary with the walls: a hashed start on S 64, 50 cycles, norm kept
  for (const family of ['hadamard', 'rstar', 'rstarfull'] as Family[]) {
    const w = makeWalk(scalar(family, 'argu'), 64, 0.3)
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

    out[`${family}WallNormGap`] = Math.abs(nrm / nrm0 - 1)
  }

  return out
}

export function sstrSpecs(): SstrSpec[] {
  const specs: SstrSpec[] = [{ name: 'inst', run: () => ({ kind: 'inst', name: 'inst', metrics: instruments() }) }]
  const mirrorSpecs: WalkSpec[] = [
    ...(['hadamard', 'rstar', 'rstarfull'] as Family[]).flatMap(f => STEP1_MU.map(mu => scalar(f, mu))),
    ...VECTOR_SPECS.map(v => v.spec),
  ]

  for (const S of S_MIRROR) {
    specs.push({ name: `mirror-${S}`, run: () => ({ kind: 'mirror', name: `mirror-${S}`, reads: mirrorSpecs.map(s => mirrorRead(s, S)) }) })
  }

  for (const { key, spec } of VECTOR_SPECS) {
    const name = `dyn-${key}`

    specs.push({ name, run: () => ({ kind: 'dyn', name, spec, reads: CONTROL_K.map(m => dynRead(spec, m)) }) })
  }

  for (const family of [...GATED, 'rstarfull'] as Family[]) {
    for (const mu of family === 'rstarfull' ? (['argu'] as MuName[]) : STEP1_MU) {
      const spec = scalar(family, mu)

      if (mu !== 'zero' && mu !== 'z3') {
        const name = `tail-${family}-${mu}`

        specs.push({ name, run: () => ({ kind: 'tail', name, spec, reads: CONTROL_K.map(m => tailRead(spec, m)) }) })
      }

      for (const half of [0, 1]) {
        const name = `dyn-${family}-${mu}-${half}`
        const ks = ALL_K.filter(m => m % 2 === half)

        specs.push({ name, run: () => ({ kind: 'dyn', name, spec, reads: ks.map(m => dynRead(spec, m)) }) })
      }

      for (const S of S_EIG) {
        const ks = mu === 'argu' ? ALL_K : CONTROL_K

        for (const half of [0, 1]) {
          const name = `eig-${family}-${mu}-${S}-${half}`
          const sub = ks.filter((_, i) => i % 2 === half)

          specs.push({ name, run: () => ({ kind: 'eig', name, spec, reads: sub.map(m => eigRead(spec, S, m)) }) })
        }

        // one K alone: a re-read that replaces that K's read in the half stages
        for (const m of ALL_K) {
          const name = `eig-${family}-${mu}-${S}-k${m}`

          specs.push({ name, run: () => ({ kind: 'eig', name, spec, reads: [eigRead(spec, S, m)] }) })

          const qname = `eig-${family}-${mu}-${S}-q${m}`

          specs.push({ name: qname, run: () => ({ kind: 'eig', name: qname, spec, reads: [eigRead(spec, S, m)] }) })
        }
      }
    }
  }

  return specs
}

// ---- the verdict ----

export function sstrVerdict(stages: SstrStage[]): Verdict {
  const sameSpec = (a: WalkSpec, b: WalkSpec): boolean =>
    a.family === b.family && a.mu === b.mu && a.channel === b.channel && a.reverse === b.reverse
  const dyn = (spec: WalkSpec): DynRead[] => {
    const byK = new Map<number, DynRead>()

    for (const s of stages) {
      if (s.kind === 'dyn' && sameSpec(s.spec, spec)) {
        for (const r of s.reads) {
          byK.set(Math.round((r.K * K_COUNT) / TAU), r)
        }
      }
    }

    return [...byK.values()]
  }
  const eig = (spec: WalkSpec, S: number): EigRead[] => {
    const own = stages.filter((s): s is Extract<SstrStage, { kind: 'eig' }> => s.kind === 'eig' && sameSpec(s.spec, spec))
    const byK = new Map<number, EigRead>()

    // half stages, then single-K re-reads (-k), then re-reads with the QL fallback (-q): the later wins
    const rank = (name: string): number => (/-q\d+$/.test(name) ? 2 : /-k\d+$/.test(name) ? 1 : 0)

    for (const s of [...own].sort((a, b) => rank(a.name) - rank(b.name))) {
      for (const r of s.reads) {
        if (r.S === S) {
          byK.set(Math.round((r.K * K_COUNT) / TAU), r)
        }
      }
    }

    return [...byK.values()]
  }
  const mirror = (spec: WalkSpec): number => {
    const rs = stages.flatMap(s => (s.kind === 'mirror' ? s.reads.filter(r => sameSpec(r.spec, spec)) : []))

    return rs.length === S_MIRROR.length ? Math.max(...rs.map(r => r.residual)) : NaN
  }
  const metrics: Record<string, number> = {}
  const failing: string[] = []
  const instFail: string[] = []
  const lines: string[] = []
  const inst = stages.find((s): s is Extract<SstrStage, { kind: 'inst' }> => s.kind === 'inst')

  if (inst) {
    Object.assign(metrics, Object.fromEntries(Object.entries(inst.metrics).map(([k, v]) => [`inst_${k}`, v])))

    for (const f of ['hadamard', 'rstar', 'rstarfull']) {
      if (!(inst.metrics[`${f}FamilyGamma`]! <= FAMILY_TOL && inst.metrics[`${f}FamilyUnitary`]! <= FAMILY_TOL)) {
        instFail.push(`${f} family Gamma ${inst.metrics[`${f}FamilyGamma`]}`)
      }

      if (!(inst.metrics[`${f}FreeMatch`]! <= FAMILY_TOL)) {
        instFail.push(`${f} mu 0 is not E-FRC-0307's free cycle (${inst.metrics[`${f}FreeMatch`]})`)
      }

      for (const mu of STEP1_MU) {
        if (!(inst.metrics[`${f}_${mu}_beatGamma`]! <= FAMILY_TOL)) {
          instFail.push(`${f} ${mu} beat Gamma ${inst.metrics[`${f}_${mu}_beatGamma`]}`)
        }
      }
    }
  } else {
    instFail.push('no inst stage')
  }

  // STEP 0: the mirror on every spec, the free control, and the vector reads
  for (const f of ['hadamard', 'rstar', 'rstarfull'] as Family[]) {
    for (const mu of STEP1_MU) {
      metrics[`mirror_${f}_${mu}`] = mirror(scalar(f, mu))
    }
  }

  for (const { key, spec } of VECTOR_SPECS) {
    metrics[`mirror_${key}`] = mirror(spec)
  }

  for (const f of GATED) {
    if (!(metrics[`mirror_${f}_zero`]! <= MIRROR_HOLDS)) {
      instFail.push(`free ${f} mirror ${metrics[`mirror_${f}_zero`]}`)
    }
  }

  if (!(metrics['mirror_vec-hadamard']! > MIRROR_BROKEN && metrics['mirror_vec-rstar']! > MIRROR_BROKEN)) {
    instFail.push('the unreversed vector string does not break the mirror')
  }

  if (!(metrics['mirror_vec-rstar-rev']! <= MIRROR_HOLDS)) {
    instFail.push('the reversed vector string does not keep the mirror')
  }

  for (const { key, spec } of VECTOR_SPECS) {
    const d = dyn(spec)

    if (d.length < CONTROL_K.length) {
      instFail.push(`${key} dyn missing`)
      continue
    }

    metrics[`${key}_rmsMax`] = Math.max(...d.map(r => r.rmsMax))
    metrics[`${key}_exponentMax`] = Math.max(...d.map(r => r.exponent))
    metrics[`${key}_tEndMin`] = Math.min(...d.map(r => r.tEnd))

    const bounded = d.every(r => !r.edgeHit && r.tEnd === T_MAX) && metrics[`${key}_exponentMax`]! < 0.1
    const ballistic = metrics[`${key}_exponentMax`]! > EXPONENT_GATE

    if (key.endsWith('-rev') ? !ballistic : !bounded) {
      instFail.push(`${key} does not reproduce E-FRC-0307 (${key.endsWith('-rev') ? 'ballistic' : 'bounded'} expected)`)
    }

    lines.push(`${key}: rms max ${metrics[`${key}_rmsMax`]!.toFixed(2)}, exponent max ${metrics[`${key}_exponentMax`]!.toFixed(3)}, t end min ${metrics[`${key}_tEndMin`]}, mirror ${metrics[`mirror_${key}`]!.toExponential(2)}`)
  }

  // STEP 1
  let complete = true
  let confines = true
  let fails = false

  for (const family of [...GATED, 'rstarfull'] as Family[]) {
    for (const mu of family === 'rstarfull' ? (['argu'] as MuName[]) : STEP1_MU) {
      const spec = scalar(family, mu)
      const d = dyn(spec)
      const key = `${family}_${mu}`

      if (d.length === 0) {
        if (family !== 'rstarfull') {
          complete = false
        }

        continue
      }

      const rmsMax = Math.max(...d.map(r => r.rmsMax))
      const allRead = d.length === K_COUNT && d.every(r => !r.edgeHit && r.tEnd === T_MAX)
      const expMax = Math.max(...d.map(r => r.exponent))
      const slopeMin = Math.min(...d.map(r => r.slope))

      metrics[`${key}_rmsMax`] = rmsMax
      metrics[`${key}_allRead`] = allRead ? 1 : 0
      metrics[`${key}_exponentMax`] = expMax
      metrics[`${key}_exponentMin`] = Math.min(...d.map(r => r.exponent))
      metrics[`${key}_slopeMin`] = slopeMin
      metrics[`${key}_tEndMin`] = Math.min(...d.map(r => r.tEnd))
      metrics[`${key}_p0LateMax`] = Math.max(...d.map(r => r.p0Late))
      metrics[`${key}_normDrift`] = Math.max(...d.map(r => r.normDrift))
      metrics[`${key}_kRead`] = d.length

      const e4 = eig(spec, 4096).filter(r => !r.failed)
      const e2 = eig(spec, 2048).filter(r => !r.failed)
      const pr4 = e4.length ? Math.max(...e4.map(r => r.prMax)) : NaN
      const pr2 = e2.length ? Math.max(...e2.map(r => r.prMax)) : NaN

      metrics[`${key}_prMax4096`] = pr4
      metrics[`${key}_prMax2048`] = pr2
      metrics[`${key}_prGrowth`] = pr4 / pr2
      metrics[`${key}_eigFailed`] = [...eig(spec, 4096), ...eig(spec, 2048)].filter(r => r.failed).length

      if (e4.length) {
        metrics[`${key}_eigResidualW`] = Math.max(...e4.map(r => r.residualW), ...e2.map(r => r.residualW))
        metrics[`${key}_eigBadW`] = [...e4, ...e2].reduce((a, r) => a + r.badW, 0)
        metrics[`${key}_eigFrobGap`] = Math.max(...e4.map(r => r.frobGap), ...e2.map(r => r.frobGap))
        metrics[`${key}_velocityFDGap`] = Math.max(...e4.map(r => Math.abs(r.locVelocity - r.locVelocityFD)))
        metrics[`${key}_locVelocityAbsMax`] = Math.max(...e4.map(r => Math.abs(r.locVelocity)))
        metrics[`${key}_prMinBulkMax`] = Math.max(...e4.map(r => r.prMinBulk))

        const withSecond = [...e4, ...e2].filter(r => r.prSecond !== undefined)

        if (withSecond.length) {
          metrics[`${key}_prSecondMax`] = Math.max(...withSecond.map(r => r.prSecond!))
          metrics[`${key}_prMaxSingletMin`] = Math.min(...withSecond.map(r => r.prMaxSinglet!))
          metrics[`${key}_prSecondReads`] = withSecond.length

          // K 0 and pi apart from the generic K (ungated, for the mechanism)
          const edgeK = (r: EigRead): boolean => Math.abs(Math.sin(r.K)) < 1e-9
          const generic = withSecond.filter(r => !edgeK(r))
          const special = withSecond.filter(edgeK)

          if (generic.length) {
            metrics[`${key}_genericPrMax`] = Math.max(...generic.map(r => r.prMax))
            metrics[`${key}_genericPrSecondMax`] = Math.max(...generic.map(r => r.prSecond!))
            metrics[`${key}_genericSingletMin`] = Math.min(...generic.map(r => r.prMaxSinglet!))
            metrics[`${key}_genericPrMedianMax`] = Math.max(...generic.map(r => r.prMedian))
          }

          if (special.length) {
            metrics[`${key}_k0piPrMedianMin`] = Math.min(...special.map(r => r.prMedian))
            metrics[`${key}_k0piExtendedFractionMin`] = Math.min(...special.map(r => r.prHist[3] / r.n))
          }
        }
      }

      const tails = stages.flatMap(s => (s.kind === 'tail' && sameSpec(s.spec, spec) ? s.reads : []))

      if (tails.length) {
        metrics[`${key}_tailRmsExponentMax`] = Math.max(...tails.map(r => r.rmsExponent))
        metrics[`${key}_tail64ExponentMax`] = Math.max(...tails.map(r => r.tail64Exponent))
        metrics[`${key}_tail512Max`] = Math.max(...tails.map(r => r.samples[r.samples.length - 1]![3]))
        metrics[`${key}_tailFrontSpeedMin`] = Math.min(...tails.map(r => r.frontSpeed))
        metrics[`${key}_tailTEndMin`] = Math.min(...tails.map(r => r.tEnd))
      }

      lines.push(
        `${key}: mirror ${metrics[`mirror_${key}`]!.toExponential(2)}, rms max ${rmsMax.toFixed(2)} (${allRead ? 'all 16 K read to 1e5' : `${d.length} K, edge from t ${metrics[`${key}_tEndMin`]}`}), exponent ${metrics[`${key}_exponentMin`]!.toFixed(3)}..${expMax.toFixed(3)}, slope min ${slopeMin.toExponential(2)}, PR max ${pr2.toFixed(1)} (2048) ${pr4.toFixed(1)} (4096), loc |v| max ${(metrics[`${key}_locVelocityAbsMax`] ?? NaN).toFixed(3)}`,
      )

      if (tails.length) {
        lines.push(
          `${key} tail (S 65536, ungated): rms exponent max ${metrics[`${key}_tailRmsExponentMax`]!.toFixed(3)}, weight beyond 512 max ${metrics[`${key}_tail512Max`]!.toExponential(2)} at t ${metrics[`${key}_tailTEndMin`]}, 1e-12 front speed min ${metrics[`${key}_tailFrontSpeedMin`]!.toFixed(3)} site a beat`,
        )
      }

      if (family === 'rstarfull') {
        continue
      }

      if (mu === 'argu') {
        const all = [...eig(spec, 4096), ...eig(spec, 2048)]
        const nonFinite = all.filter(r => r.failed || !Number.isFinite(r.residualA) || r.nanVectors > 0).length

        metrics[`${key}_eigNonFiniteReads`] = nonFinite

        if (!(d.length === K_COUNT && e4.length === K_COUNT && e2.length === K_COUNT && nonFinite === 0)) {
          complete = false
        }

        const mirrorOk = metrics[`mirror_${key}`]! <= MIRROR_HOLDS

        if (!mirrorOk) {
          confines = false
          failing.push(`${family} mirror ${metrics[`mirror_${key}`]}`)
        }

        if (!allRead) {
          confines = false
          failing.push(`${family} rms not read to 1e5 on all 16 K`)
        }

        if (!(rmsMax < RMS_GATE)) {
          confines = false
          failing.push(`${family} rms max ${rmsMax.toFixed(2)} >= ${RMS_GATE}`)
        }

        if (!(pr4 < PR_GATE)) {
          confines = false
          failing.push(`${family} PR max ${pr4.toFixed(1)} >= ${PR_GATE}`)
        }

        if (!(pr4 <= PR_GROWTH * pr2)) {
          confines = false
          failing.push(`${family} PR ratio ${(pr4 / pr2).toFixed(3)} > ${PR_GROWTH}`)
        }

        if (mirrorOk && expMax > EXPONENT_GATE) {
          fails = true
        }
      }

      if (mu === 'zero' && !(slopeMin > SLOPE_GATE && d.length === K_COUNT)) {
        confines = false
        failing.push(`control mu 0 on ${family}: slope min ${slopeMin}`)
      }
    }
  }

  const word = instFail.length ? 'INSTRUMENT-FAIL' : !complete ? 'INCOMPLETE' : confines ? 'SCALAR-CONFINES' : fails ? 'SCALAR-FAILS' : 'OPEN'
  const status: Verdict['status'] = word === 'SCALAR-CONFINES' ? 'pass' : word === 'SCALAR-FAILS' ? 'fail' : 'open'

  return verdict({
    status,
    claim: `scalar-string ${word} at mu = arg u = ${MU_U.toFixed(6)}${failing.length && word === 'OPEN' ? ` (clauses failing: ${failing.join('; ')})` : ''}: ${lines.join('; ')}.`,
    metrics,
    control: {
      hadamardZeroSlopeMin: metrics.hadamard_zero_slopeMin ?? NaN,
      rstarZeroSlopeMin: metrics.rstar_zero_slopeMin ?? NaN,
      freeMirrorHadamard: metrics.mirror_hadamard_zero ?? NaN,
      freeMirrorRstar: metrics.mirror_rstar_zero ?? NaN,
      vectorMirrorUnreversed: metrics['mirror_vec-rstar'] ?? NaN,
      vectorMirrorReversed: metrics['mirror_vec-rstar-rev'] ?? NaN,
    },
    notes: [
      'A two-walker line instrument (the relative walk at fixed centre-of-mass momentum), not R*s 4d cycle. The gated rstar family is the mixing angle M(theta) on both beats (det fixed); the literal pieces with u = e^(i theta(r)) add a reversed vector string and are read ungated (rstarfull).',
      ...instFail.map(s => `INSTRUMENT: ${s}.`),
      ...failing.map(s => `clause: ${s}.`),
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/scalar-string',
  code: 'E-FRC-0311',
  title: 'explores whether a pair piece linear in separation in the coins mixing angle could keep the mirror and localize two walkers separation',
  category: 'gauge',
  substrates: ['line'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (long; the stage runner deck/vibe/tmp/sstr.sh splits it)
    return sstrVerdict(sstrSpecs().map(s => s.run()))
  },
})
