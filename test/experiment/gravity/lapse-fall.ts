// GRAVITY AS A LAPSE ON THE ONE-BODY REGISTER BAND (E-GRV-0149, OPEN-GRV-02, route H2a in ledger H). The route: let the
// depth set how much of one cycle each dock runs, a local step angle, instead of acting on a count. A band packet in a
// lapse N(x) then has dk/dt = -E grad N and falls at (d^2E/dk^2)(dk/dt), so at E / m* times grad N, and the fall is
// universal (every body at c^2 grad N, the rest-energy prediction) exactly when R = E / (m* c^2) = 1, OPEN-MOT-01's gate.
// This file runs it exactly on one hole of the register rule (the member, E-SPN-0163) and asks two things: does the
// packet fall at E / m* times the gradient, and is the equivalence ratio (its fall over the rest-energy prediction) 1 / R
// for the same object, so that the equivalence principle and R = 1 are one problem.
//
// DERIVED BEFORE ANY RUN.
// 1. THE LAPSE ON THE RULE. The hole's cycle is the two beats of code/measure/register-count (oneBeat): the sector
//    mixer with unit u = e^(i theta) on Q_S, then conj(u) on Q_D, each followed by the swap coin and the stream. The rest
//    gap is M = pi - |theta| (theta = -(pi - M), dM/dtheta = 1 exactly, probe 1), and a rest hole's cycle phase sits at
//    -pi + M, so "the part of a cycle a dock runs" is its rest gap: the stream moves one dock a beat and cannot run a
//    fraction of a hop, and the step angle is the one piece a dock can scale. So the rule's lapse is the local step
//    angle that makes the local rest gap N(x) M: theta(x) = theta + (N(x) - 1) M, carried by oneBeat's per-dock angle
//    (angle_S = +delta on the S unit, angle_D = -delta on the D unit, a uniform shift of theta, as E-GRV-0147 point 5).
//    N(x) = 1 + g (x - x0) along the first husk axis, sawtooth on the torus far from the packet.
// 2. THE FALL, AT FIRST ORDER IN g, EXACTLY. A packet of one band with momentum distribution P(k) under H = E(k) +
//    (1/2){x - x0, g G(k)} (G the band's response to the lapse) has, from [x, k] = i, d^2<x>/dt^2 = g <G_k E_k - G E_kk>
//    over P, constant in time at this order (P is kept by the free band). Three G's:
//      ROUTE   G = E, with the E_k G_k term dropped (the route's argument): a_route = -g <E E_kk>, at rest -g E / m*
//      FULL    G = E, both terms (a lapse that scaled the whole cycle): a_full = -g <E E_kk - E_k^2>
//      STEP    G = M E_M, the step angle of point 1 (Hellmann-Feynman: the band moves by dE/dM per unit of rest gap):
//              a_step = -g M <E_M E_kk - E_kM E_k>
//    At rest E = M and E_M = 1 (E-GRV-0147 G2), so all three give -g M / m*: there the step angle IS the lapse. Moving,
//    the step angle couples to the scalar density M E_M (E-GRV-0147's passive charge), not to E. E(k, M) is E-SPN-0160's
//    closed band (spinor-register diracPhase), and the derivatives are central differences (step 1e-4).
//    The REST-ENERGY prediction is the fall of a body whose inertia is its energy: a_rest = -c*^2 g, c*^2 = 1/2 (the
//    member's light speed squared in docks per cycle). The EQUIVALENCE RATIO is eps = a / a_rest. At rest eps = (E / m*)
//    / c*^2 = 1 / R, with R = c*^2 m* / E the band's own inertia over energy (tan(M/2) / (M/2) in closed form).
//    Probe 4 (the formulas, no run) gives per unit gradient, at k = 0, 0.2, 0.4:
//      M 0.2       1/R 0.99666   step/route 1, 1.0206, 1.5712    full/route 1, 0.4794, -2.5187
//      M 0.38025   1/R 0.98792   step/route 1, 1.0069, 1.1187    full/route 1, 0.8592, 0.3130
//      M 0.854058  1/R 0.93846   step/route 1, 1.0028, 1.0280    full/route 1, 0.9736, 0.8811
//      M 1.0       1/R 0.91524   step/route 1, 1.0025, 1.0226    full/route 1, 0.9812, 0.9159
//      M 2.0       1/R 0.64209   step/route 1, 1.0022, 1.0125    full/route 1, 0.9967, 0.9854
//    (M 0.854058 is the light register pair's member, m 0.427, E-SPN-0173; M 0.38025 is E-GRV-0147's hole.)
// 3. THE PACKETS. The strip: the D4 torus of side Lx = 2048 along the first husk axis and side 2 in the other three (a
//    state uniform across them is a K_perp = 0 state the rule keeps exactly, as E-GRV-0147's slab keeps a column), 8192
//    docks of 192 modes. A start e^(-(x - x0)^2 / (4 sigma^2)) e^(i k0 (x - x0)) times S_0 (band A, the run starting with
//    beat 1) or D_0 (band B, starting with beat 2), sigma 128, x0 = Lx / 2, projected on its band EXACTLY: at each
//    momentum the cycle has three eigenvalues (band A, band B, the flats at 1), so P_A = (U - lambda_B)(U - 1) / ((lambda_A
//    - lambda_B)(lambda_A - 1)), applied momentum by momentum through U psi, U^2 psi and an FFT along the strip, with the
//    lambdas from the closed band. The predictions of point 2 are averaged over the projected start's own P(k).
// 4. THE RUN AND THE READ. The lapse is switched on smoothly, g(t) = g sin^2(pi t / (2 Tr)) for t < Tr = 32 cycles and g
//    after (so no band is shaken into another), g = 1e-5, for T = 96 cycles, at +g and -g; Delta(t) = (<x>_+ - <x>_-) / 2
//    removes everything even in g (the free motion, its spread, O(g^2)). After the ramp the fall is constant, so Delta is
//    a parabola on t = Tr .. T: a least-squares A + B t + (a / 2) t^2 there gives a.
//
// HYPOTHESES AND GATES (fixed here before any run, never moved).
//   H1 (the route): a = a_route within 1e-3 (relative) at every rest gap (0.2, 0.38025, 0.854058, 1, 2) and momentum (0,
//      0.2, 0.4), band A. PREDICTED: holds at k 0, fails at k 0.2 and 0.4 (step/route - 1 from 0.0022 to 0.57)
//   H2 (equivalence is R): at k 0, eps R = 1 within 1e-3 at every rest gap, eps = a / a_rest. PREDICTED: holds, so the
//      bare holes fall at 0.997, 0.988, 0.938, 0.915 and 0.642 of a body whose inertia is its energy
//   H3 (the rule's step angle is a mass coupling): a = a_step within 1e-3 at every rest gap and momentum. PREDICTED: holds
//   H4 (antimatter): band B at rest falls as band A, a_B / a_A = 1 within 1e-3 at every rest gap. PREDICTED: holds
//   P (the falsifier): H1 fails. PREDICTED: holds (at the moving packets)
//   INSTRUMENT (a failure makes the verdict partial at best): I1 every projected start is its band's to 1e-9 (applying
//   the projector again moves it by under 1e-9 of its norm) and uniform across the strip to 1e-12; I2 every run keeps its
//   norm to 1e-10; I3 the parabola's rms residual under 1e-3 of its span over the window; I4 every packet's weight
//   within 128 docks of the sawtooth's jump under 1e-10.
//   CONTROL that could fail: C1 a uniform step angle of the same size as the ramp's at one packet width (N = 1 + g sigma
//   everywhere, at M 0.854058, k 0.4) gives a curvature under 1e-3 of the route's fall: no gradient, no fall.
// Verdict: fail if H1 fails; partial if H1 holds and an instrument or the control fails; pass otherwise.
//
// THE PAIR (derived, not run: the two-body engine holds a total momentum, so it cannot hold a gradient). A lapse that
// scales the pair's whole cycle at its centre gives dK/dt = -g E_pair (the operator identity of point 2 with H the pair's
// cycle generator), so the pair falls at E_pair / m*_pair, eps_pair = 1 / R_pair: 0.368 at a_B 6 and 0.654 at a_B 8
// (the tracked R 2.719 and 1.528). The rule's step angle lapses only the members' rest gaps, not the binding, so it
// would pull the pair by 2 M <E_M> rather than by E_pair.
//
// PROBES BEFORE THE GATE RUN: tmp/lx-probe1 (dM/dtheta = 1 at every rest gap here), tmp/lx-probe4 (the formulas of point
// 2, no run). No packet was run before the gate run.
//
// DEPTH: L2 (one hole of the rule in a static step-angle field, exact on the strip; the lapse's form is composed).
// DETERMINISM: no random numbers; every start is a fixed packet.
//
// FIRST RUN (tmp/lx-lapse-gate.log, 1,400 s on the loaded machine): FAIL on H1, as predicted. No gate moved and none
// was rerun.
//  - H1 holds at rest and fails moving: 5 of 15 points within 1e-3 of E / m* grad N. At k 0, a / a_route is 1.00001,
//    1.00000, 1.00000, 1.00000, 1.00000 at M 0.2, 0.38025, 0.854058, 1, 2. At k 0.2 it is 1.0206, 1.0069, 1.0028,
//    1.0025, 1.0022, and at k 0.4 it is 1.5711, 1.1188, 1.0281, 1.0226, 1.0125 (probe 4's step/route to 4 digits).
//  - H2 holds: at rest eps R = 0.99979, 0.99992, 0.99997, 0.99997, 0.99997, so the bare holes fall at eps = 0.99646,
//    0.98785, 0.93843 (the light pair's member), 0.91521 and 0.64208 of a body whose inertia is its energy. The
//    equivalence ratio is 1 / R to 3e-4 at every rest gap, and the weak principle fails between holes of different mass
//    by exactly their R - 1.
//  - H3 holds: a / a_step within 9e-5 at every rest gap and momentum. The rule's step angle couples to the scalar
//    density M dE/dM, so a moving hole falls by its mass, not its energy (eps 0.25 at M 0.2, k 0.4). The full lapse's
//    prediction misses moving packets by up to a factor 3.6 (a / a_full), as it must: the rule cannot scale a hop.
//  - H4 holds: band B at rest falls as band A, B / A = 1.00000 at every rest gap (unlike E-GRV-0147's count piece,
//    which a hole of the other band hardly feels).
//  - Instrument: projector defect at most 1.3e-13, uniform to 0, norm drift 7.1e-13, edge weight 2.1e-11, the
//    parabola's residual 4.1e-5 of its span. Control C1: a uniform step angle gives a curvature -2e-5 of the route's
//    fall.
// So the lapse turns the equivalence principle into R for every one-body object at rest: eps = 1 / R. A body falls
// universally only if its inertia equals its energy, which is OPEN-MOT-01's gate. For the light pair the same identity
// gives eps 0.368 (a_B 6) and 0.654 (a_B 8), derived and not run.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { diracPhase } from '@/code/measure/spinor-register'
import { sectorBases } from '@/code/measure/register-sea'
import {
  dockCount,
  newOne,
  oneBeat,
  type OneState,
  type OneTorus,
} from '@/code/measure/register-count'

const MODES = 192
const NR = 24
const C_STAR2 = 0.5
const DIFF = 1e-4
const H_TOL = 1e-3
const PROJECT_TOL = 1e-9
const UNIFORM_TOL = 1e-12
const NORM_TOL = 1e-10
const RESIDUAL_TOL = 1e-3
const EDGE_TOL = 1e-10
const EDGE_BAND = 128
const CONTROL_TOL = 1e-3

export type LapsePlan = {
  Lx: number
  sigma: number
  g: number
  ramp: number
  cycles: number
  gaps: number[]
  momenta: number[]
}

export const GATE_PLAN: LapsePlan = {
  Lx: 2048,
  sigma: 128,
  g: 1e-5,
  ramp: 32,
  cycles: 96,
  gaps: [0.2, 0.38025120669293333, 0.8540584822680696, 1.0, 2.0],
  momenta: [0, 0.2, 0.4],
}

type Band = 'A' | 'B'

const mod = (x: number, L: number): number => ((x % L) + L) % L

// the D4 torus of side Lx along the first husk axis and 2 along the other three (register-count oneTorus's layout)
export function stripTorus(Lx: number): OneTorus {
  const sides = [Lx, 2, 2, 2]
  const sites: number[][] = []

  for (let a = 0; a < Lx; a++) {
    for (let b = 0; b < 2; b++) {
      for (let c = 0; c < 2; c++) {
        for (let e = 0; e < 2; e++) {
          if ((a + b + c + e) % 2 === 0) {
            sites.push([a, b, c, e])
          }
        }
      }
    }
  }

  const key = (p: readonly number[]): string =>
    p.map((v, k) => mod(v, sides[k]!)).join(',')
  const index = new Map(sites.map((p, i) => [key(p), i]))
  const neighbor = new Int32Array(sites.length * NR)

  sites.forEach((p, i) => {
    for (let d = 0; d < NR; d++) {
      const r = DOCK_ROOTS[d]!

      neighbor[i * NR + d] = index.get(key(p.map((v, k) => v + r[k]!)))!
    }
  })

  return {
    L: Lx,
    sites,
    neighbor,
    column: Int32Array.from(sites, p => p[0]!),
    origin: index.get(key([0, 0, 0, 0]))!,
  }
}

// ---- the closed band and its derivatives ----

const bandE = (k: number, M: number): number => diracPhase([k, 0, 0, 0], M)

export type BandDerivatives = {
  E: number
  Ek: number
  Ekk: number
  EM: number
  EkM: number
}

export function bandAt(k: number, M: number): BandDerivatives {
  const h = DIFF
  const E = bandE(k, M)

  return {
    E,
    Ek: (bandE(k + h, M) - bandE(k - h, M)) / (2 * h),
    Ekk: (bandE(k + h, M) - 2 * E + bandE(k - h, M)) / (h * h),
    EM: (bandE(k, M + h) - bandE(k, M - h)) / (2 * h),
    EkM:
      (bandE(k + h, M + h) -
        bandE(k + h, M - h) -
        bandE(k - h, M + h) +
        bandE(k - h, M - h)) /
      (4 * h * h),
  }
}

// ---- the cycle on the strip ----

function cycle(
  o: OneTorus,
  band: Band,
  theta: number,
  bases: { S: Float64Array; D: Float64Array },
  s: OneState,
  t: OneState,
  angleS?: Float64Array,
  angleD?: Float64Array,
): OneState {
  const u: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const uc: [number, number] = [u[0], -u[1]]

  let a = s
  let b = t

  for (const beat of band === 'A' ? [1, 2] : [2, 1]) {
    if (beat === 1) {
      oneBeat(o, bases.S, u, a, b, angleS)
    } else {
      oneBeat(o, bases.D, uc, a, b, angleD)
    }

    ;[a, b] = [b, a]
  }

  return a
}

const copyState = (s: OneState): OneState => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

const norm2 = (s: OneState): number => {
  let n = 0

  for (let k = 0; k < s.re.length; k++) {
    n += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  return n
}

// ---- the FFT along the strip ----

function fft(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1

    for (; j & bit; bit >>= 1) {
      j ^= bit
    }

    j ^= bit

    if (i < j) {
      ;[re[i], re[j]] = [re[j]!, re[i]!]
      ;[im[i], im[j]] = [im[j]!, im[i]!]
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)

    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0

      for (let j = 0; j < len / 2; j++) {
        const ar = re[i + j]!
        const ai = im[i + j]!
        const br = re[i + j + len / 2]! * cr - im[i + j + len / 2]! * ci
        const bi = re[i + j + len / 2]! * ci + im[i + j + len / 2]! * cr

        re[i + j] = ar + br
        im[i + j] = ai + bi
        re[i + j + len / 2] = ar - br
        im[i + j + len / 2] = ai - bi

        const nr = cr * wr - ci * wi

        ci = cr * wi + ci * wr
        cr = nr
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i]! /= n
      im[i]! /= n
    }
  }
}

// the chain's site for each x (the first of the four docks at that x) and the uniformity defect of a state
const chainOf = (o: OneTorus): Int32Array => {
  const at = new Int32Array(o.L).fill(-1)

  o.sites.forEach((p, i) => {
    if (at[p[0]!] === -1) {
      at[p[0]!] = i
    }
  })

  return at
}

function uniformity(o: OneTorus, chain: Int32Array, s: OneState): number {
  let worst = 0

  o.sites.forEach((p, i) => {
    const j = chain[p[0]!]!

    for (let m = 0; m < MODES; m++) {
      worst = Math.max(
        worst,
        Math.abs(s.re[i * MODES + m]! - s.re[j * MODES + m]!),
        Math.abs(s.im[i * MODES + m]! - s.im[j * MODES + m]!),
      )
    }
  })

  return worst
}

// the band projector at each momentum, sum_n c_n(k) U^n psi, and the projected state's momentum weights
function project(
  o: OneTorus,
  band: Band,
  theta: number,
  M: number,
  bases: { S: Float64Array; D: Float64Array },
  psi: OneState,
): { out: OneState; weights: Float64Array } {
  const Lx = o.L
  const chain = chainOf(o)
  const u1 = cycle(o, band, theta, bases, copyState(psi), newOne(o))
  const u2 = cycle(o, band, theta, bases, copyState(u1), newOne(o))
  const terms = [psi, u1, u2]
  const coef = Array.from({ length: Lx }, (_, j) => {
    const k = j < Lx / 2 ? (2 * Math.PI * j) / Lx : (2 * Math.PI * (j - Lx)) / Lx
    const E = bandE(k, M)
    const lA: [number, number] = [Math.cos(E - Math.PI), Math.sin(E - Math.PI)]
    const lB: [number, number] = [Math.cos(Math.PI - E), Math.sin(Math.PI - E)]
    const [mine, other] = band === 'A' ? [lA, lB] : [lB, lA]
    // c2 U^2 + c1 U + c0 = (U - other)(U - 1) / ((mine - other)(mine - 1))
    const d1: [number, number] = [mine[0] - other[0], mine[1] - other[1]]
    const d2: [number, number] = [mine[0] - 1, mine[1]]
    const dr = d1[0] * d2[0] - d1[1] * d2[1]
    const di = d1[0] * d2[1] + d1[1] * d2[0]
    const dd = dr * dr + di * di
    const inv: [number, number] = [dr / dd, -di / dd]
    const times = (a: [number, number], b: [number, number]): [number, number] => [
      a[0] * b[0] - a[1] * b[1],
      a[0] * b[1] + a[1] * b[0],
    ]

    return [
      times(other, inv),
      times([-(other[0] + 1), -other[1]], inv),
      inv,
    ] as [number, number][]
  })
  const out = newOne(o)
  const weights = new Float64Array(Lx)
  const fr = new Float64Array(Lx)
  const fi = new Float64Array(Lx)
  const tr = new Float64Array(Lx)
  const ti = new Float64Array(Lx)

  for (let m = 0; m < MODES; m++) {
    fr.fill(0)
    fi.fill(0)

    terms.forEach((st, n) => {
      for (let x = 0; x < Lx; x++) {
        tr[x] = st.re[chain[x]! * MODES + m]!
        ti[x] = st.im[chain[x]! * MODES + m]!
      }

      fft(tr, ti, false)

      for (let j = 0; j < Lx; j++) {
        const [cr, ci] = coef[j]![n]!

        fr[j]! += cr * tr[j]! - ci * ti[j]!
        fi[j]! += cr * ti[j]! + ci * tr[j]!
      }
    })

    for (let j = 0; j < Lx; j++) {
      weights[j]! += fr[j]! ** 2 + fi[j]! ** 2
    }

    fft(fr, fi, true)

    o.sites.forEach((p, i) => {
      out.re[i * MODES + m] = fr[p[0]!]!
      out.im[i * MODES + m] = fi[p[0]!]!
    })
  }

  const n = Math.sqrt(norm2(out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! /= n
    out.im[k]! /= n
  }

  const total = weights.reduce((a, b) => a + b, 0)

  return { out, weights: weights.map(w => w / total) }
}

function startState(
  o: OneTorus,
  band: Band,
  bases: { S: Float64Array; D: Float64Array },
  sigma: number,
  k0: number,
): OneState {
  const E = band === 'A' ? bases.S : bases.D
  const x0 = o.L / 2
  const s = newOne(o)

  o.sites.forEach((p, i) => {
    const dx = p[0]! - x0
    const f = Math.exp(-(dx * dx) / (4 * sigma * sigma))
    const c = f * Math.cos(k0 * dx)
    const sn = f * Math.sin(k0 * dx)

    for (let m = 0; m < MODES; m++) {
      const v = E[m * 8]!

      s.re[i * MODES + m] = c * v
      s.im[i * MODES + m] = sn * v
    }
  })

  const n = Math.sqrt(norm2(s))

  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! /= n
    s.im[k]! /= n
  }

  return s
}

// the mean offset from x0 along the strip, the norm, and the weight near the sawtooth's jump
function readout(
  o: OneTorus,
  s: OneState,
): { x: number; weight: number; edge: number } {
  const d = dockCount(o, s)
  const x0 = o.L / 2

  let w = 0
  let x = 0
  let edge = 0

  o.sites.forEach((p, i) => {
    const dx = p[0]! - x0

    w += d[i]!
    x += d[i]! * dx

    if (Math.abs(dx) >= x0 - EDGE_BAND) {
      edge += d[i]!
    }
  })

  return { x: x / w, weight: w, edge: edge / w }
}

// one run: the projected start under the step-angle lapse of gradient g (ramped), the mean offset after each cycle
function lapseRun(input: {
  o: OneTorus
  band: Band
  theta: number
  M: number
  bases: { S: Float64Array; D: Float64Array }
  start: OneState
  g: number
  uniform: boolean
  plan: LapsePlan
}): { x: number[]; drift: number; edge: number } {
  const { o, band, theta, M, bases, start, g, uniform, plan } = input
  const x0 = o.L / 2
  const shape = Float64Array.from(o.sites, p =>
    uniform ? plan.sigma : p[0]! - x0,
  )
  const angleS = new Float64Array(o.sites.length)
  const angleD = new Float64Array(o.sites.length)
  const x: number[] = []

  let s = copyState(start)
  let t = newOne(o)
  let drift = 0
  let edge = 0

  for (let c = 0; c < plan.cycles; c++) {
    const r = c < plan.ramp ? Math.sin((Math.PI * c) / (2 * plan.ramp)) ** 2 : 1

    for (let i = 0; i < shape.length; i++) {
      const delta = g * r * M * shape[i]!

      angleS[i] = delta
      angleD[i] = -delta
    }

    const next = cycle(o, band, theta, bases, s, t, angleS, angleD)

    t = next === s ? t : s
    s = next

    const read = readout(o, s)

    drift = Math.max(drift, Math.abs(read.weight - 1))
    edge = Math.max(edge, read.edge)
    x.push(read.x)
  }

  return { x, drift, edge }
}

// least squares A + B t + C t^2 over t = from .. to (cycles counted from 1), the curvature 2C and the rms residual
function parabola(
  y: number[],
  from: number,
): { a: number; residual: number; span: number } {
  const ts: number[] = []
  const ys: number[] = []

  y.forEach((v, i) => {
    if (i + 1 >= from) {
      ts.push(i + 1)
      ys.push(v)
    }
  })

  const n = ts.length
  const S = [0, 0, 0, 0, 0]
  const T = [0, 0, 0]

  ts.forEach((t, i) => {
    for (let p = 0; p <= 4; p++) {
      S[p]! += t ** p
    }

    for (let p = 0; p <= 2; p++) {
      T[p]! += t ** p * ys[i]!
    }
  })

  // the 3 x 3 normal equations by Cramer's rule
  const m = [
    [S[0]!, S[1]!, S[2]!],
    [S[1]!, S[2]!, S[3]!],
    [S[2]!, S[3]!, S[4]!],
  ]
  const det = (q: number[][]): number =>
    q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) -
    q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) +
    q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!)
  const D = det(m)
  const col = (k: number): number[][] =>
    m.map((row, i) => row.map((v, j) => (j === k ? T[i]! : v)))
  const A = det(col(0)) / D
  const B = det(col(1)) / D
  const C = det(col(2)) / D

  let r = 0

  ts.forEach((t, i) => {
    r += (ys[i]! - (A + B * t + C * t * t)) ** 2
  })

  const t0 = ts[0]!
  const t1 = ts[n - 1]!

  return {
    a: 2 * C,
    residual: Math.sqrt(r / n),
    span: Math.abs(C * (t1 * t1 - t0 * t0)),
  }
}

// ---- one packet: project, run at +g and -g, read the fall and the predictions ----

export type Fall = {
  band: Band
  M: number
  k0: number
  a: number
  route: number
  full: number
  step: number
  rest: number
  R: number
  projectDefect: number
  uniformDefect: number
  drift: number
  edge: number
  residual: number
  span: number
}

export function fallOf(
  plan: LapsePlan,
  o: OneTorus,
  band: Band,
  M: number,
  k0: number,
  g: number,
  uniform = false,
): Fall {
  const bases = sectorBases()
  const theta = -(Math.PI - M)
  const raw = startState(o, band, bases, plan.sigma, k0)
  const { out: start, weights } = project(o, band, theta, M, bases, raw)
  const again = project(o, band, theta, M, bases, start).out

  let defect = 0

  for (let k = 0; k < start.re.length; k++) {
    defect += (again.re[k]! - start.re[k]!) ** 2 + (again.im[k]! - start.im[k]!) ** 2
  }

  const chain = chainOf(o)
  const uniformDefect = uniformity(o, chain, start)
  const common = { o, band, theta, M, bases, start, uniform, plan }
  const plus = lapseRun({ ...common, g })
  const minus = lapseRun({ ...common, g: -g })
  const delta = plus.x.map((v, i) => (v - minus.x[i]!) / 2)
  const fit = parabola(delta, plan.ramp)

  // the predictions averaged over the projected start's momenta
  let route = 0
  let full = 0
  let step = 0

  weights.forEach((w, j) => {
    if (w < 1e-30) {
      return
    }

    const k = j < o.L / 2 ? (2 * Math.PI * j) / o.L : (2 * Math.PI * (j - o.L)) / o.L
    const b = bandAt(k, M)

    route += w * b.E * b.Ekk
    full += w * (b.E * b.Ekk - b.Ek * b.Ek)
    step += w * M * (b.EM * b.Ekk - b.EkM * b.Ek)
  })

  const R = C_STAR2 / (bandAt(0, M).Ekk * M)

  return {
    band,
    M,
    k0,
    a: fit.a,
    route: -g * route,
    full: -g * full,
    step: -g * step,
    rest: -C_STAR2 * g,
    R,
    projectDefect: Math.sqrt(defect),
    uniformDefect,
    drift: Math.max(plus.drift, minus.drift),
    edge: Math.max(plus.edge, minus.edge),
    residual: fit.residual,
    span: fit.span,
  }
}

// ---- the verdict ----

const flag = (b: boolean): number => (b ? 1 : 0)

export function combine(
  plan: LapsePlan,
  falls: Fall[],
  bands: Fall[],
  control: Fall,
): Verdict {
  const rel = (x: number, y: number): number => Math.abs(x / y - 1)
  const H1rows = falls.map(f => ({ f, ok: rel(f.a, f.route) <= H_TOL }))
  const H1 = H1rows.every(r => r.ok)
  const rest = falls.filter(f => f.k0 === 0)
  const H2 = rest.every(f => Math.abs((f.a / f.rest) * f.R - 1) <= H_TOL)
  const H3 = falls.every(f => rel(f.a, f.step) <= H_TOL)
  const H4 = bands.every(b => {
    const a = rest.find(f => f.M === b.M)!

    return rel(b.a, a.a) <= H_TOL
  })
  const P = !H1
  const all = [...falls, ...bands, control]
  const I1 = all.every(f => f.projectDefect <= PROJECT_TOL && f.uniformDefect <= UNIFORM_TOL)
  const I2 = all.every(f => f.drift <= NORM_TOL)
  const I3 = [...falls, ...bands].every(f => f.residual <= RESIDUAL_TOL * f.span)
  const I4 = all.every(f => f.edge <= EDGE_TOL)
  const C1 = Math.abs(control.a) <= CONTROL_TOL * Math.abs(control.route)
  const instrument = I1 && I2 && I3 && I4
  const status = !H1 ? 'fail' : !instrument || !C1 ? 'partial' : 'pass'
  const e3 = (x: number): string => x.toExponential(3)
  const f5 = (x: number): string => x.toFixed(5)
  const fallText = falls
    .map(
      f =>
        `M ${f.M.toFixed(5)} k ${f.k0}: a ${e3(f.a)}, a/route ${f5(f.a / f.route)}, a/step ${f5(f.a / f.step)}, a/full ${f5(f.a / f.full)}, eps ${f5(f.a / f.rest)}${f.k0 === 0 ? `, eps R ${f5((f.a / f.rest) * f.R)} (R ${f5(f.R)})` : ''}`,
    )
    .join('; ')
  const bandText = bands
    .map(b => `M ${b.M.toFixed(5)}: B / A ${f5(b.a / rest.find(f => f.M === b.M)!.a)}`)
    .join('; ')
  const metrics: Record<string, number> = {
    H1: flag(H1),
    H2: flag(H2),
    H3: flag(H3),
    H4: flag(H4),
    P: flag(P),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    C1: flag(C1),
    controlRatio: control.a / control.route,
    worstProject: Math.max(...all.map(f => f.projectDefect)),
    worstUniform: Math.max(...all.map(f => f.uniformDefect)),
    worstDrift: Math.max(...all.map(f => f.drift)),
    worstEdge: Math.max(...all.map(f => f.edge)),
    worstResidual: Math.max(...[...falls, ...bands].map(f => f.residual / f.span)),
  }

  falls.forEach(f => {
    const tag = `M${f.M.toFixed(3)}_k${f.k0}`

    metrics[`${tag}_overRoute`] = f.a / f.route
    metrics[`${tag}_overStep`] = f.a / f.step
    metrics[`${tag}_eps`] = f.a / f.rest
  })

  return verdict({
    status,
    claim: `H1 ${H1} (${H1rows.filter(r => r.ok).length} of ${H1rows.length} within ${H_TOL} of E/m* grad N); H2 ${H2}; H3 ${H3}; H4 ${H4}; P ${P}. ${fallText}. Band B at rest: ${bandText}. Instrument I1 ${I1} I2 ${I2} I3 ${I3} I4 ${I4}; control C1 ${C1} (uniform step angle: curvature ${f5(control.a / control.route)} of the route's fall)`,
    metrics,
    control: { C1: flag(C1), instrument: flag(instrument) },
    notes: `L2. One hole of the register rule on the strip Lx ${plan.Lx} x 2 x 2 x 2, sigma ${plan.sigma}, the step-angle lapse g ${plan.g} ramped over ${plan.ramp} of ${plan.cycles} cycles, at +g and -g, the fall read as the parabola's curvature after the ramp. Worst projector defect ${e3(metrics.worstProject!)}, uniformity ${e3(metrics.worstUniform!)}, norm drift ${e3(metrics.worstDrift!)}, edge ${e3(metrics.worstEdge!)}, residual over span ${e3(metrics.worstResidual!)}.`,
  })
}

export function lapseFallRun(
  plan: LapsePlan,
  log: (what: string) => void = quiet,
): Verdict {
  const o = stripTorus(plan.Lx)
  const falls: Fall[] = []

  for (const M of plan.gaps) {
    for (const k0 of plan.momenta) {
      falls.push(fallOf(plan, o, 'A', M, k0, plan.g))
      log(`A M ${M} k ${k0}`)
    }
  }

  const bands = plan.gaps.map(M => {
    const b = fallOf(plan, o, 'B', M, 0, plan.g)

    log(`B M ${M}`)

    return b
  })
  const control = fallOf(plan, o, 'A', 0.8540584822680696, 0.4, plan.g, true)

  return combine(plan, falls, bands, control)
}

const quiet = (what: string): void => void what

export default experiment({
  id: 'gravity/lapse-fall',
  code: 'E-GRV-0149',
  title:
    'gravity as a lapse on the one-body register band, fail on H1 as predicted: the rule\'s own lapse (the local step angle) drops a packet at rest at exactly E/m* times the gradient (to 1e-5) and its equivalence ratio is 1/R to 3e-4 at five rest gaps (0.996 to 0.642), so universality is R = 1; a moving packet falls by its mass M dE/dM, not its energy (to 9e-5), up to 1.57 times E/m*; both bands fall alike',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return lapseFallRun(GATE_PLAN)
  },
})
