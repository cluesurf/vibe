// THE LIGHT REGISTER PAIR UNDER A WEAK PULL: DOES ITS INERTIA APPROACH ITS ENERGY? (E-SPN-0175, the code checked free
// immediately before registering). E-SPN-0173 held a light register pair (m 0.427) with the husk light's Coulomb pull and
// found it binds like hydrogen but moves 8 to 16 times too heavily (R static 8.46 at a_B 3.5, 16.45 at a_B 3), and read
// the cause as strong coupling across one link: a member moves only through its partner T D, one link away in the
// relative coordinate, and the pull's step over a link (alpha G(1) = 0.59 rad a cycle at a_B 3.5) is larger than the
// member's band (about 0.27). E-SPN-0174 found the same excess falling steeply as a string weakened. This file runs the
// same pair where the pull is weak across a link, a_B of 8 to 20, on balls of radius up to 7 a_B, by the cubic symmetry
// of the husk quotient (code/measure/register-reduced).
//
// DERIVED BEFORE THE RUN (code/measure/register-reduced, register-coulomb, register-meson; per cycle of two beats).
// 1. THE REDUCTION IS EXACT. The 48 signed permutations of the husk coordinates (depth kept) lie in W(F4), map roots to
//    roots and quotient points to quotient points, and act on the register by minors, which for a signed permutation is
//    a signed permutation of the even and of the odd blades; so C(g r) = rho_e(g) C(r) rho_o(g)^T and every piece of
//    the coordinate cycle, the Coulomb pair phases (the count read at canonical coordinates, the same integer on an
//    orbit) and the vector form's cross pieces commute with every element. The hydrogenic start (both members in S,
//    registers paired by delta, profile exp(-r / a_B)) is invariant, so the level lives in the invariant sector: psi(g
//    y) = rho(g) psi(y), stored once an orbit, a neighbour read as the signed index permutation of its representative.
//    At total momentum K the same holds for the little group of K (C4v on an axis, 8 elements; C2v on a face diagonal,
//    4), whose elements fix K and so the half-step phases. <a | G b> is the orbit-weighted sum. The reduced cycle is the
//    unreduced one up to the order of float summation (probe 1: 8e-16 over three cycles in all three sectors).
// 2. THE MEMBER AND THE COUNT are E-SPN-0173's: u = ringUnit(-5, 1) (m 0.427029, M0 0.854058, tan m / m 1.065572,
//    mu 0.455030), the Coulomb count n(y) = floor(alpha G(y) / theta) in steps of ringUnit(11, 5) (theta 0.006027),
//    alpha = 24 pi / (mu a_B), the vector form. Continuum hydrogen: E_b = mu alpha'^2 / 2 = 1 / (2 mu a_B^2).
// 3. WHERE THE PULL IS WEAK ACROSS A LINK. alpha G(1) scales as 1 / a_B: 0.59 at a_B 3.5, 0.26 at 8, 0.17 at 12, 0.10 at
//    20, against the member band of about 0.27.
// 4. THE EXCESS'S SCALING (the prediction). If the excess is the strong-coupling suppression of the centre's hop, it
//    falls at weak coupling as the square of the one-link step over the band, weighted by the pair's density near
//    contact, |psi(0)|^2 ~ 1 / a_B^3, with alpha^2 ~ 1 / a_B^2: excess ~ a_B^(-5). E-SPN-0173's two points give a local
//    power of 4.4 (excess 5.90 at a_B 3.5, 11.57 at 3). PREDICTED (from these alone, before any weak point was read):
//    the excess R / R_formula - 1 falls with power 4 to 5; at a_B 8 about 0.1 to 0.2, at 12 about 0.015 to 0.05.
// 5. THE STATIC FORMULA AND THE DARWIN EXCHANGE are E-SPN-0155's and E-SPN-0169's: R_formula = (2 tan m + (5/3) E_b) /
//    (2 m - E_b) per beat (E_b per beat half the cycle's), R_full = R_static - (8/3) E_b S / (2 m - E_b), S from the
//    level's measured relative density on a side-T husk torus (the O_h-canonical momenta).
//
// 6. READING R: BY LINES, NOT BY A FILTERED MEAN (derived after probes 2, 5 and 6, before the gate run). Neither sum rule
//    the directive offered is exact here: the f-sum and the centre-of-mass response give the curvature of the K = 0
//    level only to first order in K, and the second-order term runs through every state the K coupling reaches. What
//    is exact and cheap is to read the lines of the cycle at K = 0, K and K / 2 in the little group of K. The phase a
//    filter reads is the weighted mean of every line left in the filtered state, and E-SPN-0173's level holds several
//    lines of the trivial sector (the pair's register channels) closer together than any affordable filter separates:
//    the mean moves with K through the weights as well as through the lines, so the filter read of R depends on the
//    filter history (probe 6). Harmonic inversion of the autocorrelation c_l = <v | G U^l v> (register-reduced's
//    harmonicLines; U is unitary in the Gram metric, so N cycles give lags 0 .. N and no vector is stored) returns each
//    line's phase and weight, exact when the state holds no more lines in the window than the basis has phases.
//    R static is read from the main line's own phases: a = (4 d(K / 2) / (K / 2)^2 - d(K) / K^2) / 3, R = 1 / (4 a E).
//    K = 0.04 on the axis (C4v), and on the face diagonal (C2v) where read; the K = 0 autocorrelation is the O_h
//    sector's, the same numbers up to float summation.
//
// GATES (fixed before the gate run; a hard gate that fails fails the experiment):
//   H0 the witness: the reduced cycle against E-SPN-0173's unreduced engine on its ball of radius 10, three cycles, in
//      the O_h, C4v and C2v sectors, every entry within 1e-13 of the largest and the norms within 1e-12, no covariance
//      failure, the orbits partitioning the ball, the canonical counts equal to the native ones on the ball of 16
//   C1 the control (not hard): a_B 3.5 on the ball of 16 with E-SPN-0173's filters reproduces its E_L within 1e-9 and,
//      read by its own differential filter read (K filter 256), its R 8.459326 within 1e-6
//   H2 the hold, at every weak point: the level keeps its norm over 64 cycles within 1e-3, its edge density is under
//      1e-4, and its main line has |u| within 1e-6 of 1, a weight of 0.2 or more, and a ratio d(K) / d(K / 2) within
//      0.1 of 4
//   H3 isotropy: the main line's a on the face diagonal within 2e-2 of the axis's, at a_B 6
//   H4 the weakest point's static excess R / R_formula - 1 within 0.1 of zero (the lattice correction to the formula
//      at a_B 12 is of order 1 / a_B^2, under 0.01, and the strong-coupling excess predicted there under 0.05)
//   H5 the weakest point's R with the Darwin exchange within 0.05 of tan m / m
//   H6 the trend: the excess falls monotonically over a_B 3.5, 6, 8, 12
//   P  the prediction: the excess inside [0.4, 0.7] at a_B 6, [0.1, 0.2] at 8, [0.015, 0.05] at 12
//   I1, I2 the member instrument (not hard): E-SPN-0173's
//
// PLAN. a_B 3.5 (control, ball 16), 6 (ball 40), 8 (ball 48), 12 (ball 60), in four processes on 2, 4, 5 and 7 workers.
//    Every point's lines by N = 4096, L = 64. a_B 20 is NOT run: it needs a ball of about 120 (O_h 165,000
//    representatives, C4v about 820,000, about 3.4 GB a state) and, at the measured 3.3 s a cycle for 96,000 C4v
//    representatives, 8,192 cycles of the axis alone would take about 90 hours.
//
// PROBES (all before the gate run, none read a weak point's R by the gate's method; logs in tmp/rcw-*):
//   1 the witness at E-SPN-0173's ball, pooled against single-threaded bit for bit, and the cost (104 us a
//     representative a cycle single-threaded; 0.58 s a cycle at 20,585 representatives on 12 workers)
//   2 a_B 3.5 with the K levels read against the converged E_L (not the re-filtered base): R 14.99 with a K filter of
//     256, the ratio 5.6. Stopped
//   5 a_B 6 and 8, the same read, stopped after the level filters (a_B 6: E 1.6767 after 256; a_B 8: nothing read)
//   6 E-SPN-0173's differential read at a_B 3.5 after each level filter, K filters 256 and 1024: R -19.6 and -53.5
//     after 128, 10.74 and 30.66 after 512, 8.459326 and 8.98 after 2048. The filter read depends on the filter
//     history, which is what point 6 is about. At a_B 8, stopped after one level filter
//   7a harmonicLines on a synthetic signal: five lines, two 0.001 apart, returned to 1e-11
//   7 a_B 3.5 by lines, N 2048, L 32. After the filter 512 the level holds six lines of weight over 0.07 within
//     0.03 (1.60484, 1.61026, 1.61346, 1.62179, 1.62862, 1.63462), their R 7.46 (1.60484), 8.49 (1.61346) and 8.74
//     (1.62179). After the filter 2048 the lines agree to 4e-9 (1.613463076 and 1.613463079), their R 8.61, 12.67
//     and 9.41 (N 2048 resolving d to about 1 percent, the main line's ratio 4.08). a_B 8 on the ball of 56: the
//     K = 0 lines only, six of weight 0.07 to 0.35 within 0.016, the heaviest at 1.674966 (E_b 0.0332, the
//     continuum's 0.0172), |u| off 1 by up to 4e-6 at N 2048, so the gate run takes N 4096. Stopped before any K line
//
// FIRST RUN (below, after the gate run).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { darwinR, staticR } from '@/code/measure/darwin-exchange'
import { wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import {
  huskGreenTable,
  type GreenTable,
} from '@/code/measure/husk-meson'
import { memberCycle, norm2 } from '@/code/measure/register-meson'
import {
  coulombCounts,
  coulombCycle,
  coulombEngine,
  huskRelBall,
  hydrogenStart,
  type CoulombCount,
} from '@/code/measure/register-coulomb'
import {
  autocorrelation,
  harmonicLines,
  type Line,
  canonicalGreen,
  cubicGroup,
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedCycle,
  reducedEngine,
  reducedFilter,
  reducedHydrogenStart,
  reducedInner,
  reducedMeanGreen,
  reducedNorm2,
  reducedRead,
  reducedS,
  reducedShares,
  reducedShells,
  repWeights,
  sector,
  unfold,
  unfoldToPoints,
  cloneState,
  type CubicGroup,
  type ReducedEngine,
  type RState,
} from '@/code/measure/register-reduced'
import { diracPhase } from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const LIGHT: readonly [number, number] = [-5, 1]
const UNIT: readonly [number, number] = [11, 5]
const C_STAR2 = 0.5
const KAPPA = 0.04
// a K = 0 line is read when it carries this much of the level; a K line is followed when it carries this much
const LINE_WEIGHT = 0.02
const FOLLOW_WEIGHT = 1e-4
const I1_MOMENTA: readonly number[][] = [
  [0, 0, 0, 0],
  [0.3, 0.1, -0.2, 0],
  [1.1, -0.7, 0.4, 0],
  [2.5, 0.3, 0.3, 0],
  [0.01, 0, 0, 0],
]

// E-SPN-0173's recorded main point (tmp/rch-exp-run1.log): the control
export const RECORDED = {
  EL: 1.6133573497836755,
  Rstatic: 8.459326179870311,
  Eb: 0.09475961475246364,
}

export type Point = {
  name: string
  aB: number
  R: number
  filters: readonly number[]
  // the harmonic inversion: N cycles of autocorrelation, L phases 2 pi / N apart centred on the level
  N: number
  L: number
  // E-SPN-0173's differential filter read with this K filter as well (the control only, for C1)
  recordedKFilter: number
  hold: number
  sTorus: number
  face: boolean
  workers: number
}

// one line of the level, followed from K = 0 to K and K / 2
export type LineRead = {
  E: number
  weight: number
  modulus: number
  d1: number
  d2: number
  ratio: number
  a: number
  R: number
  Rformula: number
  excess: number
}

export type PointRead = {
  name: string
  aB: number
  R: number
  alpha: number
  alphaG1: number
  reps: number
  sites: number
  countTop: number
  nearest: number
  EL: number
  Eb: number
  EbContinuum: number
  energies: number[]
  residuals: number[]
  lambdaAbs: number
  residual: number
  lost: number
  least: number
  edge: number
  mean: number
  shares: number[]
  shellsHead: number[]
  meanG: number
  // the level's main line (the heaviest line at K = 0) on the axis, every line of weight >= LINE_WEIGHT
  // on the axis, the ground line on the face diagonal (null where not read), and the recorded differential read (NaN
  // where not read)
  ground: LineRead
  lines: LineRead[]
  faceGround: LineRead | null
  recordedR: number
  isotropy: number
  Rstatic: number
  RformulaStatic: number
  S: number
  meanK2: number
  wrapped: number
  Rfull: number
  RfullD5: number
  seconds: number
}

export type Setup = {
  u: [number, number]
  M0: number
  m: number
  tanOver: number
  mu: number
  aMember: number
  theta: number
  G0: number
  table: GreenTable
  group: CubicGroup
}

export function setup(): Setup {
  const theta0 = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(theta0), Math.sin(theta0)]
  const M0 = wrap(theta0 - Math.PI)
  const m = M0 / 2

  const sEps = (k: number): number => {
    const c = memberCycle(u, [k, 0, 0, 0])
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })

    return ev.re
      .map((x, i) => wrap(Math.atan2(ev.im[i]!, x) - Math.PI))
      .reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  }

  const aMember =
    (4 * ((sEps(0.01) - M0) / 0.01 ** 2) -
      (sEps(0.02) - M0) / 0.02 ** 2) /
    3
  const mu = C_STAR2 / (2 * aMember) / 2
  const G0 = infiniteGreenZero('husk', 64).value
  const table = huskGreenTable(128, 16, G0)

  return {
    u,
    M0,
    m,
    tanOver: Math.tan(m) / m,
    mu,
    aMember,
    theta: unitAngle(ringUnit(UNIT[0], UNIT[1])),
    G0,
    table,
    group: cubicGroup(),
  }
}

// the member instrument (E-SPN-0173's I1 and I2)
export function memberInstrument(su: Setup): {
  i1: number
  RMember: number
  I1: boolean
  I2: boolean
} {
  let i1 = 0

  for (const K of I1_MOMENTA) {
    const c = memberCycle(su.u, K)
    const ev = complexEigenvalues({ re: c.re, im: c.im, n: 16 })
    const ph = ev.re
      .map((x, i) => Math.atan2(ev.im[i]!, x))
      .sort((a, b) => a - b)
    const E = diracPhase(K, su.M0)
    const want = [
      ...Array(8).fill(wrap(Math.PI + E)),
      ...Array(8).fill(wrap(Math.PI - E)),
    ].sort((a, b) => a - b)

    i1 = Math.max(
      i1,
      ...ph.map((x, i) => Math.abs(wrap(x - (want[i] as number)))),
    )
  }

  const RMember = C_STAR2 / (2 * su.aMember * su.M0)

  return {
    i1,
    RMember,
    I1: i1 <= 1e-12,
    I2: Math.abs(RMember - su.tanOver) <= 1e-6,
  }
}

const alphaOf = (su: Setup, aB: number): number =>
  (24 * Math.PI) / (su.mu * aB)

// ---- the witness: the reduced engine against E-SPN-0173's unreduced engine ----

export type Witness = {
  covariance: number
  checked: number
  orbitsOk: boolean
  countsDiffer: number
  gaps: {
    label: string
    gap: number
    largest: number
    normU: number[]
    normR: number[]
  }[]
}

export function witnessRun(
  su: Setup,
  R: number,
  cycles: number,
): Witness {
  const oh = [...su.group.elements.keys()]
  const axisK = [KAPPA, 0, 0, 0]
  const faceK = [KAPPA / Math.SQRT2, KAPPA / Math.SQRT2, 0, 0]
  const alpha = alphaOf(su, 3.5)

  let orbitsOk = true

  for (const r of [10, 16, 30]) {
    const s = sector(su.group, oh, r)

    orbitsOk =
      orbitsOk &&
      s.orbit.reduce((a, b) => a + b, 0) === s.sites &&
      s.sites === huskRelBall(r).points.length
  }

  // canonical counts against E-SPN-0173's native counts on its own ball
  let countsDiffer = 0

  {
    const ball = huskRelBall(16)
    const native = coulombCounts(ball, su.table, alpha, su.theta)

    ball.points.forEach((p, i) => {
      if (
        Math.floor(
          (alpha * canonicalGreen(su.table, p[0]!, p[1]!, p[2]!)) /
            su.theta,
        ) !== native.counts[i]
      ) {
        countsDiffer++
      }
    })
  }

  const gaps: Witness['gaps'] = []

  for (const [label, members, K] of [
    ['O_h K 0', oh, [0, 0, 0, 0]],
    ['C4v axis', littleGroup(su.group, axisK), axisK],
    ['C2v face', littleGroup(su.group, faceK), faceK],
  ] as const) {
    const ball = huskRelBall(R)
    const counts = new Int32Array(ball.points.length)

    ball.points.forEach((p, i) => {
      counts[i] = Math.floor(
        (alpha * canonicalGreen(su.table, p[0]!, p[1]!, p[2]!)) /
          su.theta,
      )
    })

    const cc: CoulombCount = {
      alpha,
      theta: su.theta,
      counts,
      nearest: 0,
      top: 0,
    }
    const eu = coulombEngine(ball, su.u, K as number[], cc, 'vector')
    const full = hydrogenStart(ball, 3.5)
    const s = sector(su.group, members, R)
    const er = reducedEngine(
      s,
      su.u,
      K as number[],
      reducedCounts(s, su.table, alpha, su.theta),
      'vector',
    )
    const red = reducedHydrogenStart(s, 3.5)
    const normU = [norm2(eu, full)]
    const normR = [reducedNorm2(er, red)]

    let gap = 0
    let largest = 0

    for (let c = 0; c < cycles; c++) {
      coulombCycle(eu, full)
      reducedCycle(er, red)
    }

    const back = unfoldToPoints(s, red, ball.points)

    for (let i = 0; i < full.re.length; i++) {
      gap = Math.max(
        gap,
        Math.hypot(
          full.re[i]! - back.re[i]!,
          full.im[i]! - back.im[i]!,
        ),
      )
      largest = Math.max(largest, Math.hypot(full.re[i]!, full.im[i]!))
    }

    normU.push(norm2(eu, full))
    normR.push(reducedNorm2(er, red))
    gaps.push({ label, gap, largest, normU, normR })
  }

  return {
    covariance: su.group.covariance,
    checked: su.group.checked,
    orbitsOk,
    countsDiffer,
    gaps,
  }
}

// ---- one coupling point ----

export function readPoint(
  su: Setup,
  p: Point,
  log: (what: string) => void = () => {},
): PointRead {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, p.aB)
  const s = sector(su.group, oh, p.R)
  const count = reducedCounts(s, su.table, alpha, su.theta)
  const e = reducedEngine(s, su.u, [0, 0, 0, 0], count, 'vector')
  const EbContinuum = 1 / (2 * su.mu * p.aB * p.aB)

  let v: RState = reducedHydrogenStart(s, p.aB)

  normalizeState(e, v)

  let phase = 2 * su.M0 - EbContinuum
  let read = reducedRead(e, v)

  const energies: number[] = []
  const residuals: number[] = []

  for (const S of p.filters) {
    v = reducedFilter(e, v, phase, S)
    normalizeState(e, v)
    read = reducedRead(e, v)
    phase = read.phase
    energies.push(read.phase)
    residuals.push(read.residual)
    log(
      `${p.name} filter ${S}: E ${read.phase} residual ${read.residual.toExponential(3)}`,
    )
  }

  const EL = read.phase

  // the hold
  let least = 1

  const n0 = reducedNorm2(e, v)
  const hs = cloneState(v)

  for (let c = 1; c <= p.hold; c++) {
    reducedCycle(e, hs)

    const [fr, fi] = reducedInner(e, v, hs)

    least = Math.min(least, (fr * fr + fi * fi) / (n0 * n0))
  }

  const lost = 1 - reducedNorm2(e, hs) / n0
  const w = repWeights(s, v)
  const sh = reducedShells(s, w)

  log(`${p.name} hold: lost ${lost.toExponential(2)} least ${least}`)

  // the motion, by lines (derivation point 6): the level's autocorrelation at K = 0, and the unfolded level's at K and
  // K / 2 in the little group of K, its lines by harmonic inversion, each K = 0 line followed to the nearest line at K
  // and at K / 2. At K = 0 the cycle commutes with all of O_h and the level lies in its trivial sector, so the K = 0
  // autocorrelation is the O_h sector's (the little group's numbers up to float summation, at a fifth of the cost)
  const l0 = harmonicLines(
    autocorrelation(e, v, p.N),
    EL,
    p.L,
    (2 * Math.PI) / p.N,
  )

  log(
    `${p.name} K 0 lines: ${l0
      .slice(0, 8)
      .map(
        x =>
          `${x.E} (w ${x.weight.toExponential(3)}, |u| ${x.modulus})`,
      )
      .join(', ')}`,
  )

  const motion = (
    dir: readonly number[],
  ): { ground: LineRead; lines: LineRead[] } => {
    const members = littleGroup(
      su.group,
      dir.map(x => x * KAPPA),
    )
    const sk = sector(su.group, members, p.R)
    const vk = unfold(s, v, sk)
    const countK = reducedCounts(sk, su.table, alpha, su.theta)

    const linesAt = (k: number): Line[] => {
      const ek: ReducedEngine = reducedEngine(
        sk,
        su.u,
        dir.map(x => x * k),
        countK,
        'vector',
      )

      return harmonicLines(
        autocorrelation(ek, vk, p.N),
        EL,
        p.L,
        (2 * Math.PI) / p.N,
      )
    }

    const l1 = linesAt(KAPPA)
    const l2 = linesAt(KAPPA / 2)

    const follow = (b: Line): LineRead => {
      const near = (ls: Line[]): Line =>
        ls
          .filter(x => x.weight >= FOLLOW_WEIGHT)
          .reduce((q, x) =>
            Math.abs(x.E - b.E) < Math.abs(q.E - b.E) ? x : q,
          )
      const d1 = near(l1).E - b.E
      const d2 = near(l2).E - b.E
      const a = (4 * (d2 / (KAPPA / 2) ** 2) - d1 / KAPPA ** 2) / 3
      const R = C_STAR2 / (2 * a * b.E)
      const Rformula = staticR(su.m, (2 * su.M0 - b.E) / 2)

      return {
        E: b.E,
        weight: b.weight,
        modulus: b.modulus,
        d1,
        d2,
        ratio: d1 / d2,
        a,
        R,
        Rformula,
        excess: R / Rformula - 1,
      }
    }

    const heavy = l0
      .filter(x => x.weight >= LINE_WEIGHT)
      .sort((x, y) => x.E - y.E)
    const lines = heavy.map(follow)

    log(
      `${p.name} lines ${dir.join(',')}: ${lines.map(x => `E ${x.E} w ${x.weight.toExponential(3)} |u| ${x.modulus} ratio ${x.ratio.toFixed(5)} R ${x.R.toFixed(6)} excess ${x.excess.toFixed(5)}`).join('; ')}`,
    )

    return {
      ground: lines.reduce((q, x) => (x.weight > q.weight ? x : q)),
      lines,
    }
  }

  const axis = motion([1, 0, 0, 0])
  const face = p.face
    ? motion([Math.SQRT1_2, Math.SQRT1_2, 0, 0]).ground
    : null

  // E-SPN-0173's differential filter read (the control): the K = 0 base, K and K / 2 each filtered from the level by the
  // same K filter, on the axis
  let recordedR = NaN

  if (p.recordedKFilter > 0) {
    const sk = sector(
      su.group,
      littleGroup(su.group, [KAPPA, 0, 0, 0]),
      p.R,
    )
    const vk = unfold(s, v, sk)
    const countK = reducedCounts(sk, su.table, alpha, su.theta)

    const eAt = (k: number): number => {
      const ek: ReducedEngine = reducedEngine(
        sk,
        su.u,
        [k, 0, 0, 0],
        countK,
        'vector',
      )
      const f = reducedFilter(ek, vk, EL, p.recordedKFilter)

      normalizeState(ek, f)

      return reducedRead(ek, f).phase
    }

    const base = eAt(0)
    const d1 = eAt(KAPPA) - base
    const d2 = eAt(KAPPA / 2) - base

    recordedR =
      C_STAR2 /
      (2 * ((4 * (d2 / (KAPPA / 2) ** 2) - d1 / KAPPA ** 2) / 3) * base)
    log(`${p.name} recorded read: R ${recordedR}`)
  }

  const ground = axis.ground
  const Eb = 2 * su.M0 - ground.E
  const dS = reducedS(s, w, p.sTorus)
  const shift = (speed2: number): number =>
    darwinR(su.m, Eb / 2, dS.S, speed2) - staticR(su.m, Eb / 2)

  return {
    name: p.name,
    aB: p.aB,
    R: p.R,
    alpha,
    alphaG1: alpha * canonicalGreen(su.table, 1, 0, 0),
    reps: s.count,
    sites: s.sites,
    countTop: count.top,
    nearest: count.nearest,
    EL,
    Eb,
    EbContinuum,
    energies,
    residuals,
    lambdaAbs: Math.hypot(...read.lambda),
    residual: read.residual,
    lost,
    least,
    edge: sh.edge,
    mean: sh.mean,
    shares: reducedShares(s, v),
    shellsHead: sh.shells.slice(0, 8),
    meanG: reducedMeanGreen(s, su.table, w),
    ground,
    lines: axis.lines,
    faceGround: face,
    recordedR,
    isotropy: face ? Math.abs(face.a / ground.a - 1) : NaN,
    Rstatic: ground.R,
    RformulaStatic: ground.Rformula,
    S: dS.S,
    meanK2: dS.meanK2,
    wrapped: dS.wrapped,
    Rfull: ground.R + shift(1),
    RfullD5: ground.R + shift(1.03125),
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the gates ----

export const WITNESS_BALL = 10
export const WITNESS_CYCLES = 3

// the gate tolerances (fixed before the gate run; see the header)
export const TOL = {
  witnessEntry: 1e-13,
  witnessNorm: 1e-12,
  controlEL: 1e-9,
  controlR: 1e-6,
  lost: 1e-3,
  edge: 1e-4,
  lineModulus: 1e-6,
  lineWeight: 0.2,
  quadratic: 0.1,
  isotropy: 2e-2,
  staticBand: 0.1,
  fullBand: 0.05,
}

export type WeakPlan = {
  points: Point[]
  predicted: Record<string, [number, number]>
}

export type Parts = {
  witness: Witness
  instrument: ReturnType<typeof memberInstrument>
}

const flag = (b: boolean): number => (b ? 1 : 0)
const excess = (r: PointRead): number =>
  r.Rstatic / r.RformulaStatic - 1
const lineClaim = (x: LineRead): string =>
  `E ${x.E.toFixed(11)} (w ${x.weight.toExponential(3)}, |u| ${x.modulus.toFixed(9)}): d(K) ${x.d1.toExponential(5)}, d(K / 2) ${x.d2.toExponential(5)}, ratio ${x.ratio.toFixed(4)}, R ${x.R.toFixed(5)} against ${x.Rformula.toFixed(5)} (excess ${x.excess.toFixed(4)})`

export function combine(
  reads: PointRead[],
  parts: Parts,
  plan: WeakPlan,
  tanOver: number,
): Verdict {
  const control = reads.find(r => r.name === 'control')!
  const weak = reads
    .filter(r => r.name !== 'control')
    .sort((a, b) => a.aB - b.aB)
  const weakest = weak[weak.length - 1]!
  const w = parts.witness
  const H0 =
    w.covariance === 0 &&
    w.orbitsOk &&
    w.countsDiffer === 0 &&
    w.gaps.every(
      g =>
        g.gap / g.largest <= TOL.witnessEntry &&
        g.normU.every(
          (x, i) => Math.abs(x / g.normR[i]! - 1) <= TOL.witnessNorm,
        ),
    )
  const C1 =
    Math.abs(control.EL - RECORDED.EL) <= TOL.controlEL &&
    Math.abs(control.recordedR / RECORDED.Rstatic - 1) <= TOL.controlR
  // the hold, per point: the level keeps its norm, stays inside the ball, and its main line is a line of the cycle (|u| =
  // 1), carries a fifth of the level or more, and moves quadratically in K (ratio 4)
  const holds = (r: PointRead): boolean =>
    Math.abs(r.lost) <= TOL.lost &&
    r.edge <= TOL.edge &&
    Math.abs(r.ground.modulus - 1) <= TOL.lineModulus &&
    r.ground.weight >= TOL.lineWeight &&
    Math.abs(r.ground.ratio - 4) <= TOL.quadratic
  const H2 = weak.every(holds)
  const H3 = weak
    .filter(r => !Number.isNaN(r.isotropy))
    .every(r => r.isotropy <= TOL.isotropy)
  const H4 = Math.abs(excess(weakest)) <= TOL.staticBand
  const H5 = Math.abs(weakest.Rfull - tanOver) <= TOL.fullBand
  const chain = [control, ...weak]
  const H6 = chain.every(
    (r, i) => i === 0 || excess(r) < excess(chain[i - 1]!),
  )
  const P = weak.every(r => {
    const band = plan.predicted[r.name]

    return (
      band === undefined ||
      (excess(r) >= band[0] && excess(r) <= band[1])
    )
  })
  const instrument = parts.instrument.I1 && parts.instrument.I2
  const hard = H0 && H2 && H3 && H4 && H5 && H6 && P
  const status = !hard
    ? 'fail'
    : !instrument || !C1
      ? 'partial'
      : 'pass'
  const pointClaim = (r: PointRead): string =>
    `${r.name} a_B ${r.aB} (alpha ${r.alpha.toFixed(4)}, alpha G(1) ${r.alphaG1.toFixed(4)} rad, ball ${r.R}, ${r.reps} representatives of ${r.sites} sites, count top ${r.countTop}, nearest threshold ${r.nearest.toExponential(2)}): E_L ${r.EL.toFixed(10)}, E_b ${r.Eb.toFixed(7)} (continuum ${r.EbContinuum.toFixed(7)}), energies after each filter ${r.energies.map(x => x.toFixed(10)).join(', ')}, residuals ${r.residuals.map(x => x.toExponential(2)).join(', ')}, |lambda| ${r.lambdaAbs.toFixed(10)}, lost ${r.lost.toExponential(2)}, least fidelity ${r.least.toFixed(10)}, edge ${r.edge.toExponential(2)}, mean r ${r.mean.toFixed(3)}, shares ${r.shares.map(x => x.toFixed(4)).join(' ')}, <G> ${r.meanG.toFixed(6)}; lines on the axis ${r.lines.map(lineClaim).join('; ')}; main line E ${r.ground.E.toFixed(11)}, face diagonal ${r.faceGround ? lineClaim(r.faceGround) : 'not read'} (isotropy ${Number.isNaN(r.isotropy) ? 'not read' : r.isotropy.toExponential(2)}); the recorded differential read ${Number.isNaN(r.recordedR) ? 'not read' : r.recordedR.toFixed(6)}; R static ${r.Rstatic.toFixed(6)} against the formula ${r.RformulaStatic.toFixed(6)} (excess ${excess(r).toFixed(5)}); S ${r.S.toFixed(6)} (wrapped ${r.wrapped.toExponential(2)}); R with the Darwin exchange ${r.Rfull.toFixed(6)} (D 5 column ${r.RfullD5.toFixed(6)}) against tan m / m ${tanOver.toFixed(6)}; ${r.seconds.toFixed(0)} s`

  return verdict({
    status,
    claim: `H0 ${H0} (covariance failures ${w.covariance} of ${w.checked}, orbits ${w.orbitsOk}, canonical counts differ at ${w.countsDiffer}; ${w.gaps.map(g => `${g.label}: gap ${g.gap.toExponential(2)} of ${g.largest.toExponential(2)}, norms ${g.normU.map(x => x.toFixed(12)).join('/')} unreduced, ${g.normR.map(x => x.toFixed(12)).join('/')} reduced`).join('; ')}); C1 ${C1} (control E_L ${control.EL} against ${RECORDED.EL}, the recorded differential read's R ${control.recordedR} against ${RECORDED.Rstatic}); H2 ${H2}; H3 ${H3}; H4 ${H4} (weakest excess within ${TOL.staticBand}); H5 ${H5} (weakest R_full within ${TOL.fullBand} of tan m / m); H6 ${H6} (the excess falls monotonically); P ${P} (the excess inside the predicted band at ${Object.entries(
      plan.predicted,
    )
      .map(([k, v]) => `${k} [${v.join(', ')}]`)
      .join(
        ', ',
      )}). POINTS ${chain.map(pointClaim).join('. ')}. Instrument I1 ${parts.instrument.I1} (${parts.instrument.i1.toExponential(2)}) I2 ${parts.instrument.I2} (member R ${parts.instrument.RMember.toFixed(9)})`,
    metrics: {
      H0: flag(H0),
      C1: flag(C1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      H5: flag(H5),
      H6: flag(H6),
      P: flag(P),
      I1: flag(parts.instrument.I1),
      I2: flag(parts.instrument.I2),
      ...Object.fromEntries(
        chain.flatMap(r => [
          [`${r.name}_aB`, r.aB],
          [`${r.name}_EL`, r.EL],
          [`${r.name}_Eb`, r.Eb],
          [`${r.name}_residual`, r.residual],
          [`${r.name}_Rstatic`, r.Rstatic],
          [`${r.name}_Rformula`, r.RformulaStatic],
          [`${r.name}_excess`, excess(r)],
          [`${r.name}_Rfull`, r.Rfull],
        ]),
      ),
    },
    control: { C1: flag(C1), instrument: flag(instrument) },
    notes: `L2. The light member m 0.427029 (u = ringUnit(${LIGHT.join(', ')}), tan m / m ${tanOver.toFixed(9)}), the Coulomb count in steps of ringUnit(${UNIT.join(', ')}), the vector form, on the cubic-symmetry reduction of the husk quotient.`,
  })
}

export const GATE_PLAN: WeakPlan = {
  points: [
    {
      name: 'control',
      aB: 3.5,
      R: 16,
      filters: [128, 512, 2048],
      N: 4096,
      L: 64,
      recordedKFilter: 256,
      hold: 64,
      sTorus: 64,
      face: true,
      workers: 2,
    },
    {
      name: 'a6',
      aB: 6,
      R: 40,
      filters: [256, 1024, 2048],
      N: 4096,
      L: 64,
      recordedKFilter: 0,
      hold: 64,
      sTorus: 128,
      face: true,
      workers: 4,
    },
    {
      name: 'a8',
      aB: 8,
      R: 48,
      filters: [256, 1024, 2048],
      N: 4096,
      L: 64,
      recordedKFilter: 0,
      hold: 64,
      sTorus: 128,
      face: false,
      workers: 5,
    },
    {
      name: 'a12',
      aB: 12,
      R: 60,
      filters: [512, 2048, 4096],
      N: 4096,
      L: 64,
      recordedKFilter: 0,
      hold: 64,
      sTorus: 128,
      face: false,
      workers: 7,
    },
  ],
  // derivation point 4, from E-SPN-0173's two points alone (excess 5.90 at a_B 3.5), powers 4 to 5
  predicted: { a6: [0.4, 0.7], a8: [0.1, 0.2], a12: [0.015, 0.05] },
}

export function registerCoulombWeakRun(plan: WeakPlan): Verdict {
  const su = setup()
  const parts: Parts = {
    witness: witnessRun(su, WITNESS_BALL, WITNESS_CYCLES),
    instrument: memberInstrument(su),
  }
  const reads = plan.points.map(p => readPoint(su, p))

  return combine(reads, parts, plan, su.tanOver)
}

export default experiment({
  id: 'spin/register-coulomb-weak',
  code: 'E-SPN-0175',
  title:
    'a light register pair under a weak Coulomb pull, read on the cubic-symmetry reduction of the husk quotient (not yet run)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerCoulombWeakRun(GATE_PLAN)
  },
})
