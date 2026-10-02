// THE LIGHT REGISTER PAIR UNDER A WEAK PULL, ONE LEVEL TRACKED BY ITS OVERLAP (OPEN-MOT-01; the code checked free with
// task/next-code immediately before registering). E-SPN-0173 held a light register pair (m 0.427) with the husk light's
// Coulomb pull and found it binds like hydrogen but moves 8 to 16 times too heavily (R static 8.46 at a_B 3.5, 16.45 at
// a_B 3). The weak-pull gate (spin/register-coulomb-weak, run in the open-pieces worktree) read the same pair at a_B 6, 8
// and 12 on the cubic-symmetry reduction, and its excess over the static formula went 5.93 (a_B 3.5), not quadratic
// (a_B 6), 8.37 (a_B 8), 0.169 (a_B 12): not monotone. Its "main line" is the heaviest line of a FILTERED level, whose
// filters are centred on the level's running mean phase, so a line's weight there is its overlap with the start times
// every filter's transfer at its phase. This file asks one question with the level held fixed: does the inertia over
// rest energy R of ONE bound level fall to the relativistic value tan m / m as the pull weakens?
//
// DERIVED BEFORE ANY RUN (code/measure/register-reduced, the engine and its sectors as E-SPN-0173 and the weak-pull gate).
// 1. THE REFERENCE. r = the hydrogenic start of E-SPN-0173 at each a_B: both members in S, the registers paired by delta,
//    the profile exp(-|y| / a_B), normalized in the Gram metric. It is invariant under all of O_h, so every line it
//    reaches is in the O_h-trivial sector (the level's symmetry at K = 0 is that sector's, A1 of the combined spatial and
//    register action, the same for every line read here). It is the same function of y / a_B at every coupling: the
//    fixed reference the level is carried by.
// 2. THE OVERLAP, WITH NO FILTER BIAS. x_l = <r | G U^l r> is read for l = 0 .. N + S - 1, one inner product a cycle
//    against G r formed once (referenceCorrelation). A Blackman-Harris filter F of length S at phase p is applied
//    afterwards, exactly: c_l = <F r | G U^l F r> = sum_d A_d e^(-i p d) x_(l + d). Harmonic inversion of c over N lags
//    gives each line's phase E_j and its weight in F r, and its overlap with r is o_j = |<psi_j | G r>|^2 = weight_j
//    c_0 / |F(E_j)|^2 (referenceLines). The filter only keeps lines outside the window out of the inversion; it cannot
//    rank the lines, because its transfer is divided out.
// 3. THE TRACKING RULE. The tracked level at a coupling is the line of largest overlap o with r among the genuine lines
//    (|u| within 1e-6 of 1). Not the heaviest line of a filtered level and not the lowest or nearest line. Its identity
//    is unambiguous when o is at least 0.2 and at least twice the next line's. Across couplings the level is the same
//    level while it stays the line r overlaps most, because r is the same function of y / a_B throughout; a change of
//    which line holds the largest overlap between two couplings is a level crossing, and is reported as one.
// 4. THE WINDOW. Every line r reaches with real weight must be in it, or the largest overlap could lie outside. The
//    gate's logs (probe 1) put its lines at scaled binding E_b 2 mu a_B^2 from 0.82 to 1.93, but r's own lines (probes
//    4 and 5) reach far deeper at strong coupling: at a_B 3.5 its largest overlap, 0.164, is a line at E_b 0.219
//    (scaled 2.44) that E-SPN-0173's filters never reached, and at a_B 6 (ball 16) the deepest line of overlap 0.01 or
//    more is at E_b 0.082. So the window is [2M - 0.15, 2M + 0.5 E_c], E_c = 1 / (2 mu a_B^2) the continuum's binding,
//    L = ceil(width / (2 pi / N)) phases 2 pi / N apart around its centre, and the filter at the centre with its main
//    lobe (half-width 8 pi / S) 1.25 times the window's half-width. The genuine lines' overlaps are summed, so a window
//    that misses weight shows it.
// 5. THE MOTION, FOLLOWED CONTINUOUSLY. On the axis (C4v, the little group of K along x), the reference unfolded into
//    the C4v sector has the same correlation at K = 0 (the cycle commutes with O_h), and at K it is r_K's own
//    correlation, so a K line's overlap is again with the fixed reference. The continuation of the tracked line b at K
//    is the K line nearest b in phase among the genuine lines whose overlap is within 20% of b's (to second order in K
//    the tracked eigenvector's overlap with r changes by O((K p / Delta)^2); a line of another O_h representation
//    enters with overlap O(K^2), so it cannot be mistaken for b). R = c*^2 / (2 a E), a = (4 d(K / 2) / (K / 2)^2 -
//    d(K) / K^2) / 3, d the continuation's shift, read against b at the same number of lags.
// 6. WHICH REMEDY FOR THE AXIS MIXING THAT BROKE a_B 6. The C4v sector at K holds the O_h representations whose
//    restriction to C4v contains A1: A1g, Eg and T1u (C3v on the body diagonal: A1g, T2g, A2u, T1u; C2v on the face
//    diagonal: A1g, Eg, T2g, T1u, A2u, B-types). The FIRST-order coupling of an A1g level, K . p, reaches T1u only (p is
//    a vector), and reaches it in EVERY direction. A direction change alters only the second-order direct couplings
//    (Eg on the axis, T2g on the body diagonal, both on the face diagonal). So when a T1u line lies within K p of the
//    level, no direction helps and only a smaller K keeps the mixing second order (the leaked weight is (K p / Delta)^2,
//    quartered by halving K). The rule: read on the axis at K 0.04 and 0.02 (the gate's), and where the ratio test
//    fails, at K 0.02 and 0.01 as well; the smaller pair is read only then. The face diagonal is the worst direction
//    (both second-order couplings), and C3v costs 30% more than C4v for no gain against T1u.
// 7. THE STATIC FORMULA AND THE DARWIN EXCHANGE are E-SPN-0155's and E-SPN-0169's, per beat: R_formula = (2 tan m +
//    (5/3) E_b) / (2 m - E_b), R_full = R_static - (8/3) E_b S / (2 m - E_b), E_b per beat half the tracked line's cycle
//    binding 2M - E. S is read from the REFERENCE's density (the tracked eigenvector is not stored); over the measured
//    S of 0.997 to 1.005 this moves R_full by under 1e-3 at every point read here.
// 8. RESOLUTION. N = 8192 lags at K = 0 (bins 7.7e-4). The tracked line must read the same from the first 4096 lags
//    (phase within 1e-7, overlap within 5%); where it does, the K reads use 4096 lags (and the K = 0 phase they are
//    compared with is re-read at 4096 from the same x), else 8192.
// 9. COST (probe 2, tmp/mw-probe2-40.log, native kernel 12 threads on the loaded machine): 23 us a representative a
//    cycle in O_h and C4v alike. A K read costs six times the K = 0 read.
//
// GATES (fixed in this header before the gate run; a hard gate that fails fails the experiment):
//   H0 the witness, at a_B 3.5 on the ball of 24 (6.9 a_B): referenceCorrelation on the native kernel byte for byte
//      its JavaScript path over 16 lags; against the engine's own autocorrelation (G applied every lag) every lag within
//      1e-7 of x_0; and filteredCorrelation against the filter applied to the state (reducedFilter, S 64) then
//      autocorrelation, every lag within 1e-7 of c_0. The two identities used (G self-adjoint, U unitary in G) hold
//      only away from the ball's edge: probe 3 measured both mismatches falling with the ball as the edge's own
//      one-cycle norm defect does (radius 10, 16, 20, 24: correlation 1.1e-5, 9.7e-7, 1.5e-7, 2.2e-8 against the
//      defect 6.7e-6, 6.2e-7, 9.5e-8, 1.4e-8). A bound line has no weight at the edge, so its overlap is unaffected
//   C1 the control (not hard): E-SPN-0173's two heavy points on the reduced native engine, its filters 128, 512, 2048
//      and its differential K read (K filter 256, axis): E_L within 1e-9 and R within 1e-6 (relative) of the recorded
//      1.6133573497836755 and 8.459326179870311 (a_B 3.5, ball 16) and 1.5685474773273518 and 16.4538835851102 (a_B 3,
//      ball 14)
//   C2 the control that could fail (not hard): the pull off (alpha 0) at a_B 8's ball and window, the reference holds
//      no bound line: every genuine line of overlap 1e-3 or more at E >= 2M - 1e-6
//   T1 identity, at every scan point: the tracked line is genuine and its overlap is at least 0.2
//   T2 resolution, at every motion point: the tracked line from 4096 lags within 1e-7 in phase and 5% in overlap of
//      the 8192-lag read
//   Q  quadratic, at every motion point: the continuation exists at K and K / 2 and d(K) / d(K / 2) is within 0.1 of 4
//      (at K 0.04, or, failing that, at K 0.02)
//   M  the trend: the tracked excess R_static / R_formula - 1 falls strictly from each motion point to the next weaker,
//      or where it does not, the identity is ambiguous (the tracked overlap under twice the next line's) at one end
//   A  the approach: R_full at the weakest motion point within 0.1 of tan m / m, and R_inf of the least-squares fit
//      R_full = R_inf + c / a_B^2 over the motion points with a_B >= 8 within 0.05 of tan m / m
//   I1, I2 the member instrument (not hard): E-SPN-0173's
//
// PLAN. Identity (K = 0, O_h) at a_B 6, 7, 8, 9, 10, 11, 12, then 14 and 16, each on the ball of radius ceil(4.5 a_B)
//   with N 8192. Motion (K reads, C4v) at a_B 6, 8, 10 and 12 only: a K read at a_B 12 (ball 54, about 88,000 C4v
//   representatives, 2 s a cycle) is 2 x 5,400 cycles, about 6 hours, and at a_B 16 (ball 72, about 208,000, 5 s) with
//   the 16,384 lags its line spacing needs, about 50 hours. So the motion subset is 6, 8, 10, 12, which resolves the
//   trend at four couplings, and 14 and 16 read the level's identity and binding only. One job at a time.
//
// PROBES (all before the gate run, none read a tracked R; logs in tmp/mw-*):
//   1 the gate's own K = 0 lines with the filters' transfer divided out (no engine run): at a_B 8 the line at
//     1.674964 carries 23 times the start overlap of the gate's main line 1.681188 (its filtered weight 0.023 was the
//     transfer, 9.4e-4, of a 2048 filter centred 2.2 bins above it); at a_B 3.5 the deepest line 1.604842 carries 1.8
//     times the main line's; at a_B 12 the main line holds the largest overlap of the eight printed. So the gate's main
//     line was set by where its filters were centred
//   2 the cost (above)
//   3 the witness's identities against the ball (H0 above): an edge effect, the size of the edge's own norm defect
//   4 the pipeline at a_B 3.5 on the ball of 16 (not a gate point; tmp/mw-probe4-*.log): r's lines spread over E_b
//     0.07 to 0.32 (a deep, core-bound family), the largest overlap 0.164 at E_b 0.219; on the window of point 4 the
//     tracked line 1.582683 (overlap 0.112) follows to K 0.04 and 0.02 with ratio 3.993 (the continuation rule works)
//   5 r's lines over a wide window on the ball of 16 (tmp/mw-probe5-16.log): at a_B 6 the deepest line of overlap
//     0.01 or more is at E_b 0.082 (overlap 0.29 at E_b 0.067); at a_B 8 and 12 the ball of 16 is too small to read
//
// All of these came before the gate run, and no probe read the motion at a gate point.
//
// FIRST RUN (below, after the gate run).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { darwinR, staticR } from '@/code/measure/darwin-exchange'
import {
  autocorrelation,
  canonicalGreen,
  cloneState,
  filteredCorrelation,
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedCycle,
  reducedEngine,
  reducedFilter,
  reducedHydrogenStart,
  reducedNorm2,
  reducedRead,
  reducedS,
  reducedShells,
  referenceCorrelation,
  referenceLines,
  repWeights,
  sector,
  unfold,
  type ReducedCount,
  type RefLine,
  type RState,
} from '@/code/measure/register-reduced'
import {
  memberInstrument,
  RECORDED,
  setup,
  type Setup,
} from '@/test/experiment/spin/register-coulomb-weak'
import type { KernelOptions } from '@/code/kernel/index'

const C_STAR2 = 0.5
const GENUINE = 1e-6
const IDENTITY = 0.2
const AMBIGUOUS = 2
const FOLLOW = 0.2
const HALF_PHASE = 1e-7
const HALF_OVERLAP = 0.05
const QUADRATIC = 0.1
const WEAKEST_BAND = 0.1
const LIMIT_BAND = 0.05
const LIGHT_OFF_OVERLAP = 1e-3
const LIGHT_OFF_PHASE = 1e-6
const WITNESS_TOL = 1e-7

// E-SPN-0173's stronger point (tmp/rch-exp-run1.log in open-pieces)
export const RECORDED_STRONG = {
  EL: 1.5685474773273518,
  Rstatic: 16.4538835851102,
}

export type TrackPoint = {
  name: string
  aB: number
  R: number
  N: number
  motion: boolean
}

export const radiusOf = (aB: number): number => Math.ceil(4.5 * aB)

export const alphaOf = (su: Setup, aB: number): number =>
  (24 * Math.PI) / (su.mu * aB)

// the window [2M - DEEP, 2M + 0.5 E_c] (derivation point 4)
const DEEP = 0.15

export function windowOf(
  su: Setup,
  aB: number,
  N: number,
): { Ec: number; center: number; S: number; L: number } {
  const Ec = 1 / (2 * su.mu * aB * aB)
  const lo = 2 * su.M0 - DEEP
  const hi = 2 * su.M0 + 0.5 * Ec
  const half = (hi - lo) / 2

  return {
    Ec,
    center: (lo + hi) / 2,
    S: Math.round((8 * Math.PI) / (1.25 * half)),
    L: Math.ceil((hi - lo) / ((2 * Math.PI) / N)),
  }
}

export type LineOut = {
  E: number
  modulus: number
  weight: number
  transfer: number
  overlap: number
  scaled: number
}

const lineOut = (su: Setup, aB: number, l: RefLine): LineOut => ({
  E: l.E,
  modulus: l.modulus,
  weight: l.weight,
  transfer: l.transfer,
  overlap: l.overlap,
  scaled: (2 * su.M0 - l.E) * 2 * su.mu * aB * aB,
})

const genuine = (l: { modulus: number }): boolean =>
  Math.abs(l.modulus - 1) <= GENUINE

// the tracked line (the genuine line of largest overlap) and the next line's overlap
export function trackedOf(lines: LineOut[]): {
  tracked: LineOut
  next: number
} {
  const g = lines.filter(genuine).sort((a, b) => b.overlap - a.overlap)
  // no genuine line at all (the pull off: the free continuum reaches the ball's edge): a line that is nothing
  const none: LineOut = {
    E: NaN,
    modulus: NaN,
    weight: 0,
    transfer: NaN,
    overlap: 0,
    scaled: NaN,
  }

  return { tracked: g[0] ?? none, next: g[1]?.overlap ?? 0 }
}

export type Correlation = { re: number[]; im: number[] }

const plain = (x: { re: Float64Array; im: Float64Array }): Correlation => ({
  re: [...x.re],
  im: [...x.im],
})

const typed = (x: Correlation): { re: Float64Array; im: Float64Array } => ({
  re: Float64Array.from(x.re),
  im: Float64Array.from(x.im),
})

export function linesOf(
  su: Setup,
  aB: number,
  x: Correlation,
  n: number,
): LineOut[] {
  const w = windowOf(su, aB, n)

  return referenceLines(typed(x), n, w.center, w.L, w.center, w.S)
    .map(l => lineOut(su, aB, l))
    .sort((a, b) => a.E - b.E)
}

// ---- the identity read: K = 0, O_h ----

export type ZeroRead = {
  name: string
  aB: number
  R: number
  N: number
  reps: number
  sites: number
  alpha: number
  alphaG1: number
  countTop: number
  Ec: number
  center: number
  S: number
  L: number
  lines: LineOut[]
  tracked: LineOut
  next: number
  overlapSum: number
  half: LineOut
  refEdge: number
  darwinS: number
  x: Correlation
  seconds: number
}

export function readZero(
  su: Setup,
  p: TrackPoint,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
  alphaScale = 1,
): ZeroRead {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, p.aB) * alphaScale
  const s = sector(su.group, oh, p.R)
  const count = reducedCounts(s, su.table, alpha, su.theta)
  const e = reducedEngine(s, su.u, [0, 0, 0, 0], count, 'vector', opts)
  const r = reducedHydrogenStart(s, p.aB)
  const w = windowOf(su, p.aB, p.N)

  normalizeState(e, r)
  log(`${p.name}: ${s.count} representatives, S ${w.S}, L ${w.L}`)

  const x = plain(referenceCorrelation(e, r, p.N + w.S - 1))

  log(`${p.name}: correlation read`)

  const lines = linesOf(su, p.aB, x, p.N)
  const { tracked, next } = trackedOf(lines)
  const half = trackedOf(linesOf(su, p.aB, x, p.N / 2)).tracked
  const weights = repWeights(s, r)
  const sh = reducedShells(s, weights)
  const T = 2 ** Math.ceil(Math.log2(2 * p.R + 2))
  const dS = reducedS(s, weights, T)

  log(
    `${p.name} lines: ${lines.map(l => `${l.E.toFixed(9)} (Eb scaled ${l.scaled.toFixed(4)}, o ${l.overlap.toExponential(3)}, |u| ${l.modulus.toFixed(9)})`).join(', ')}`,
  )
  log(
    `${p.name} tracked ${tracked.E} overlap ${tracked.overlap} next ${next}; at N / 2 ${half.E} overlap ${half.overlap}`,
  )

  return {
    name: p.name,
    aB: p.aB,
    R: p.R,
    N: p.N,
    reps: s.count,
    sites: s.sites,
    alpha,
    alphaG1: alpha * canonicalGreen(su.table, 1, 0, 0),
    countTop: count.top,
    Ec: w.Ec,
    center: w.center,
    S: w.S,
    L: w.L,
    lines,
    tracked,
    next,
    overlapSum: lines.reduce((t, l) => t + l.overlap, 0),
    half,
    refEdge: sh.edge,
    darwinS: dS.S,
    x,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the motion read: K and K / 2 on the axis, C4v ----

export type Follow = {
  E: number
  overlap: number
  d1: number
  d2: number
  o1: number
  o2: number
  ratio: number
  a: number
  R: number
  Rformula: number
  excess: number
}

export type MotionRead = {
  name: string
  aB: number
  NK: number
  kappa: number
  repsK: number
  base: LineOut[]
  at1: LineOut[]
  at2: LineOut[]
  tracked: Follow | null
  others: (Follow | null)[]
  retried: boolean
  Rfull: number
  seconds: number
}

// the continuation of b among the K lines: genuine, overlap within FOLLOW of b's, nearest in phase
const continuation = (b: LineOut, ls: LineOut[]): LineOut | null => {
  const c = ls.filter(
    l => genuine(l) && Math.abs(l.overlap / b.overlap - 1) <= FOLLOW,
  )

  return c.length === 0
    ? null
    : c.reduce((q, l) => (Math.abs(l.E - b.E) < Math.abs(q.E - b.E) ? l : q))
}

export function followOf(
  su: Setup,
  b: LineOut,
  at1: LineOut[],
  at2: LineOut[],
  kappa: number,
): Follow | null {
  const c1 = continuation(b, at1)
  const c2 = continuation(b, at2)

  if (!c1 || !c2) {
    return null
  }

  const d1 = c1.E - b.E
  const d2 = c2.E - b.E
  const a = (4 * (d2 / (kappa / 2) ** 2) - d1 / kappa ** 2) / 3
  const R = C_STAR2 / (2 * a * b.E)
  const Rformula = staticR(su.m, (2 * su.M0 - b.E) / 2)

  return {
    E: b.E,
    overlap: b.overlap,
    d1,
    d2,
    o1: c1.overlap,
    o2: c2.overlap,
    ratio: d1 / d2,
    a,
    R,
    Rformula,
    excess: R / Rformula - 1,
  }
}

const quadratic = (f: Follow | null): boolean =>
  f !== null && Math.abs(f.ratio - 4) <= QUADRATIC

export function readMotion(
  su: Setup,
  p: TrackPoint,
  zero: ZeroRead,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): MotionRead {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, p.aB)
  const s = sector(su.group, oh, p.R)
  const r = reducedHydrogenStart(s, p.aB)
  const converged =
    Math.abs(zero.half.E - zero.tracked.E) <= HALF_PHASE &&
    Math.abs(zero.half.overlap / zero.tracked.overlap - 1) <= HALF_OVERLAP
  const NK = converged ? p.N / 2 : p.N
  const w = windowOf(su, p.aB, NK)
  const base = linesOf(su, p.aB, zero.x, NK)
  const b = trackedOf(base).tracked
  // (the reference is left unnormalized here: a K line's overlap is divided by its own correlation's x_0)
  const sk = sector(su.group, littleGroup(su.group, [0.04, 0, 0, 0]), p.R)
  const rk = unfold(s, r, sk)
  const countK: ReducedCount = reducedCounts(sk, su.table, alpha, su.theta)

  // each K read once: the retry's K / 2 pair shares K 0.02 with the first pair, and the read is deterministic, so the
  // second read of it would return the same lines byte for byte
  const memo = new Map<number, LineOut[]>()
  const linesAt = (k: number): LineOut[] => {
    const seen = memo.get(k)

    if (seen) {
      return seen
    }

    const ek = reducedEngine(sk, su.u, [k, 0, 0, 0], countK, 'vector', opts)
    const x = plain(referenceCorrelation(ek, rk, NK + w.S - 1))

    log(`${p.name} K ${k}: correlation read`)

    const ls = linesOf(su, p.aB, x, NK)

    memo.set(k, ls)

    return ls
  }

  const readAt = (kappa: number): {
    at1: LineOut[]
    at2: LineOut[]
    tracked: Follow | null
  } => {
    const at1 = linesAt(kappa)
    const at2 = linesAt(kappa / 2)
    const tracked = followOf(su, b, at1, at2, kappa)

    log(
      `${p.name} kappa ${kappa}: tracked ${b.E} -> ${tracked ? `d1 ${tracked.d1} d2 ${tracked.d2} ratio ${tracked.ratio} R ${tracked.R} excess ${tracked.excess}` : 'no continuation'}`,
    )

    return { at1, at2, tracked }
  }

  let kappa = 0.04
  let read = readAt(kappa)
  let retried = false

  if (!quadratic(read.tracked)) {
    retried = true
    kappa = 0.02
    read = readAt(kappa)
  }

  const others = base
    .filter(l => genuine(l) && l.overlap >= 0.02 && l.E !== b.E)
    .map(l => followOf(su, l, read.at1, read.at2, kappa))
  const Eb = read.tracked ? 2 * su.M0 - read.tracked.E : NaN
  const Rfull = read.tracked
    ? read.tracked.R +
      darwinR(su.m, Eb / 2, zero.darwinS, 1) -
      staticR(su.m, Eb / 2)
    : NaN

  return {
    name: p.name,
    aB: p.aB,
    NK,
    kappa,
    repsK: sk.count,
    base,
    at1: read.at1,
    at2: read.at2,
    tracked: read.tracked,
    others,
    retried,
    Rfull,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the witness and the controls ----

export type Witness = {
  correlation: number
  filtered: number
  bytes: number
  defect: number
}

export const WITNESS_BALL = 24

export function witnessRun(su: Setup, opts: KernelOptions): Witness {
  const oh = [...su.group.elements.keys()]
  const aB = 3.5
  const s = sector(su.group, oh, WITNESS_BALL)
  const count = reducedCounts(s, su.table, alphaOf(su, aB), su.theta)
  const js = reducedEngine(s, su.u, [0, 0, 0, 0], count, 'vector')
  const fast = reducedEngine(s, su.u, [0, 0, 0, 0], count, 'vector', opts)
  const r = reducedHydrogenStart(s, aB)

  normalizeState(js, r)

  const mine = referenceCorrelation(fast, r, 16)
  const mineJs = referenceCorrelation(js, r, 16)
  const ref = autocorrelation(js, r, 16)

  let correlation = 0
  let bytes = 0

  for (let l = 0; l <= 16; l++) {
    correlation = Math.max(
      correlation,
      Math.hypot(mine.re[l]! - ref.re[l]!, mine.im[l]! - ref.im[l]!) /
        ref.re[0]!,
    )

    if (
      !Object.is(mine.re[l], mineJs.re[l]) ||
      !Object.is(mine.im[l], mineJs.im[l])
    ) {
      bytes++
    }
  }

  // the ball edge's own unitarity defect on r over one cycle, for scale
  const u1 = cloneState(r)

  reducedCycle(js, u1)

  const defect = Math.abs(reducedNorm2(js, u1) / reducedNorm2(js, r) - 1)

  // the filter applied afterwards against the filter applied to the state
  const S = 64
  const p = 1.6
  const x = referenceCorrelation(js, r, 16 + S - 1)
  const c = filteredCorrelation(x, p, S, 16)
  const v: RState = reducedFilter(js, cloneState(r), p, S)
  const direct = autocorrelation(js, v, 16)

  let filtered = 0

  for (let l = 0; l <= 16; l++) {
    filtered = Math.max(
      filtered,
      Math.hypot(c.re[l]! - direct.re[l]!, c.im[l]! - direct.im[l]!) /
        direct.re[0]!,
    )
  }

  return { correlation, filtered, bytes, defect }
}

export type HeavyRead = {
  aB: number
  R: number
  EL: number
  Rstatic: number
}

// E-SPN-0173's level and differential read, on the reduced engine
export function heavyRead(
  su: Setup,
  aB: number,
  R: number,
  opts: KernelOptions,
): HeavyRead {
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, aB)
  const s = sector(su.group, oh, R)
  const e = reducedEngine(
    s,
    su.u,
    [0, 0, 0, 0],
    reducedCounts(s, su.table, alpha, su.theta),
    'vector',
    opts,
  )

  let v = reducedHydrogenStart(s, aB)
  let phase = 2 * su.M0 - 1 / (2 * su.mu * aB * aB)

  normalizeState(e, v)

  for (const S of [128, 512, 2048]) {
    v = reducedFilter(e, v, phase, S)
    normalizeState(e, v)
    phase = reducedRead(e, v).phase
  }

  const EL = phase
  const sk = sector(su.group, littleGroup(su.group, [0.04, 0, 0, 0]), R)
  const vk = unfold(s, v, sk)
  const countK = reducedCounts(sk, su.table, alpha, su.theta)
  const eAt = (k: number): number => {
    const ek = reducedEngine(sk, su.u, [k, 0, 0, 0], countK, 'vector', opts)
    const f = reducedFilter(ek, vk, EL, 256)

    normalizeState(ek, f)

    return reducedRead(ek, f).phase
  }
  const base = eAt(0)
  const d1 = eAt(0.04) - base
  const d2 = eAt(0.02) - base
  const a = (4 * (d2 / 0.02 ** 2) - d1 / 0.04 ** 2) / 3

  return { aB, R, EL, Rstatic: C_STAR2 / (2 * a * base) }
}

// ---- the plan and the verdict ----

export const TRACK_PLAN: TrackPoint[] = [
  { name: 'a6', aB: 6, R: radiusOf(6), N: 8192, motion: true },
  { name: 'a7', aB: 7, R: radiusOf(7), N: 8192, motion: false },
  { name: 'a8', aB: 8, R: radiusOf(8), N: 8192, motion: true },
  { name: 'a9', aB: 9, R: radiusOf(9), N: 8192, motion: false },
  { name: 'a10', aB: 10, R: radiusOf(10), N: 8192, motion: true },
  { name: 'a11', aB: 11, R: radiusOf(11), N: 8192, motion: false },
  { name: 'a12', aB: 12, R: radiusOf(12), N: 8192, motion: true },
  { name: 'a14', aB: 14, R: radiusOf(14), N: 8192, motion: false },
  { name: 'a16', aB: 16, R: radiusOf(16), N: 8192, motion: false },
]

// the light-off control's point: a_B 8's ball and window, alpha 0
export const LIGHT_OFF: TrackPoint = {
  name: 'off8',
  aB: 8,
  R: radiusOf(8),
  N: 4096,
  motion: false,
}

export type Parts = {
  witness: Witness
  heavy: HeavyRead[]
  off: ZeroRead
  instrument: ReturnType<typeof memberInstrument>
}

const flag = (b: boolean): number => (b ? 1 : 0)

// least squares R = R_inf + c / a_B^2
export function limitFit(pts: { aB: number; R: number }[]): {
  Rinf: number
  c: number
} {
  const n = pts.length
  const xs = pts.map(p => 1 / p.aB ** 2)
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = pts.reduce((a, p) => a + p.R, 0) / n

  let sxy = 0
  let sxx = 0

  pts.forEach((p, i) => {
    sxy += (xs[i]! - mx) * (p.R - my)
    sxx += (xs[i]! - mx) ** 2
  })

  const c = sxy / sxx

  return { Rinf: my - c * mx, c }
}

export function combine(
  su: Setup,
  zeros: ZeroRead[],
  motions: MotionRead[],
  parts: Parts,
): Verdict {
  const w = parts.witness
  const H0 =
    w.bytes === 0 &&
    w.correlation <= WITNESS_TOL &&
    w.filtered <= WITNESS_TOL
  const heavyOk = (h: HeavyRead): boolean => {
    const rec = h.aB === 3.5 ? RECORDED : RECORDED_STRONG

    return (
      Math.abs(h.EL - rec.EL) <= 1e-9 &&
      Math.abs(h.Rstatic / rec.Rstatic - 1) <= 1e-6
    )
  }
  const C1 = parts.heavy.length === 2 && parts.heavy.every(heavyOk)
  const C2 = parts.off.lines
    .filter(l => genuine(l) && l.overlap >= LIGHT_OFF_OVERLAP)
    .every(l => l.E >= 2 * su.M0 - LIGHT_OFF_PHASE)
  const byAB = [...zeros].sort((a, b) => a.aB - b.aB)
  const T1 = byAB.every(
    z => genuine(z.tracked) && z.tracked.overlap >= IDENTITY,
  )
  const motion = [...motions].sort((a, b) => a.aB - b.aB)
  const zeroOf = (aB: number): ZeroRead => byAB.find(z => z.aB === aB)!
  const T2 = motion.every(m => {
    const z = zeroOf(m.aB)

    return (
      Math.abs(z.half.E - z.tracked.E) <= HALF_PHASE &&
      Math.abs(z.half.overlap / z.tracked.overlap - 1) <= HALF_OVERLAP
    )
  })
  const Q = motion.every(m => quadratic(m.tracked))
  const ambiguous = (aB: number): boolean => {
    const z = zeroOf(aB)

    return z.tracked.overlap < AMBIGUOUS * z.next
  }
  const excessOf = (m: MotionRead): number => m.tracked?.excess ?? NaN
  const M = motion.every(
    (m, i) =>
      i === 0 ||
      excessOf(m) < excessOf(motion[i - 1]!) ||
      ambiguous(m.aB) ||
      ambiguous(motion[i - 1]!.aB),
  )
  const weakest = motion[motion.length - 1]!
  const fit = limitFit(
    motion
      .filter(m => m.aB >= 8 && Number.isFinite(m.Rfull))
      .map(m => ({ aB: m.aB, R: m.Rfull })),
  )
  const A =
    Math.abs(weakest.Rfull - su.tanOver) <= WEAKEST_BAND &&
    Math.abs(fit.Rinf - su.tanOver) <= LIMIT_BAND
  const instrument = parts.instrument.I1 && parts.instrument.I2
  const hard = H0 && T1 && T2 && Q && M && A
  const status = !hard ? 'fail' : !instrument || !C1 || !C2 ? 'partial' : 'pass'
  const zeroClaim = (z: ZeroRead): string =>
    `a_B ${z.aB} (ball ${z.R}, ${z.reps} representatives of ${z.sites} sites, alpha G(1) ${z.alphaG1.toFixed(4)}, count top ${z.countTop}, window centre ${z.center.toFixed(6)}, S ${z.S}, L ${z.L}, N ${z.N}): tracked ${z.tracked.E.toFixed(10)} (E_b 2 mu a_B^2 ${z.tracked.scaled.toFixed(4)}, overlap ${z.tracked.overlap.toFixed(4)}, next ${z.next.toFixed(4)}, at N / 2 ${z.half.E.toFixed(10)} and ${z.half.overlap.toFixed(4)}); overlap sum ${z.overlapSum.toFixed(4)}; lines ${z.lines
      .filter(l => l.overlap >= 1e-3)
      .map(l => `${l.E.toFixed(7)} (${l.scaled.toFixed(3)}, ${l.overlap.toFixed(4)})`)
      .join(' ')}; reference edge ${z.refEdge.toExponential(2)}; ${z.seconds.toFixed(0)} s`
  const followClaim = (f: Follow | null): string =>
    f
      ? `E ${f.E.toFixed(10)} (overlap ${f.overlap.toFixed(4)}, at K ${f.o1.toFixed(4)}, at K / 2 ${f.o2.toFixed(4)}): d(K) ${f.d1.toExponential(5)}, d(K / 2) ${f.d2.toExponential(5)}, ratio ${f.ratio.toFixed(4)}, R ${f.R.toFixed(5)} against ${f.Rformula.toFixed(5)} (excess ${f.excess.toFixed(4)})`
      : 'no continuation'
  const motionClaim = (m: MotionRead): string =>
    `a_B ${m.aB} (${m.repsK} C4v representatives, ${m.NK} lags, K ${m.kappa}${m.retried ? ', retried at the smaller K' : ''}): tracked ${followClaim(m.tracked)}, R_full ${m.Rfull.toFixed(5)}; other lines ${m.others.map(followClaim).join('; ')}; ${m.seconds.toFixed(0)} s`

  return verdict({
    status,
    claim: `H0 ${H0} (native against JavaScript: ${w.bytes} lags differ; correlation ${w.correlation.toExponential(2)}, filter afterwards ${w.filtered.toExponential(2)}, the edge's one-cycle norm defect ${w.defect.toExponential(2)}); C1 ${C1} (${parts.heavy.map(h => `a_B ${h.aB}: E_L ${h.EL} R ${h.Rstatic}`).join('; ')}); C2 ${C2} (light off: lines ${parts.off.lines
      .filter(l => l.overlap >= LIGHT_OFF_OVERLAP)
      .map(l => `${l.E.toFixed(8)} (${l.overlap.toFixed(4)})`)
      .join(' ')} against 2M ${(2 * su.M0).toFixed(8)}); T1 ${T1}; T2 ${T2}; Q ${Q}; M ${M}; A ${A} (weakest R_full ${weakest.Rfull.toFixed(5)}, R_inf ${fit.Rinf.toFixed(5)}, c ${fit.c.toFixed(3)}, against tan m / m ${su.tanOver.toFixed(6)}). IDENTITY ${byAB.map(zeroClaim).join('. ')}. MOTION ${motion.map(motionClaim).join('. ')}. Instrument I1 ${parts.instrument.I1} I2 ${parts.instrument.I2}`,
    metrics: {
      H0: flag(H0),
      C1: flag(C1),
      C2: flag(C2),
      T1: flag(T1),
      T2: flag(T2),
      Q: flag(Q),
      M: flag(M),
      A: flag(A),
      I1: flag(parts.instrument.I1),
      I2: flag(parts.instrument.I2),
      Rinf: fit.Rinf,
      ...Object.fromEntries(
        byAB.flatMap(z => [
          [`a${z.aB}_E`, z.tracked.E],
          [`a${z.aB}_overlap`, z.tracked.overlap],
          [`a${z.aB}_scaled`, z.tracked.scaled],
        ]),
      ),
      ...Object.fromEntries(
        motion.flatMap(m => [
          [`a${m.aB}_Rstatic`, m.tracked?.R ?? NaN],
          [`a${m.aB}_excess`, m.tracked?.excess ?? NaN],
          [`a${m.aB}_Rfull`, m.Rfull],
        ]),
      ),
    },
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
    notes: `L2. The light member m 0.427029 (tan m / m ${su.tanOver.toFixed(9)}), E-SPN-0173's Coulomb count in the vector form, on the cubic-symmetry reduction of the husk quotient, run on the native kernel; one level followed by its overlap with a fixed hydrogenic reference.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 12 }

export function registerCoulombTrackRun(): Verdict {
  const su = setup()
  const parts: Parts = {
    witness: witnessRun(su, NATIVE),
    heavy: [heavyRead(su, 3.5, 16, NATIVE), heavyRead(su, 3, 14, NATIVE)],
    off: readZero(su, LIGHT_OFF, NATIVE, () => {}, 0),
    instrument: memberInstrument(su),
  }
  const zeros = TRACK_PLAN.map(p => readZero(su, p, NATIVE))
  const motions = TRACK_PLAN.filter(p => p.motion).map(p =>
    readMotion(su, p, zeros.find(z => z.name === p.name)!, NATIVE),
  )

  return combine(su, zeros, motions, parts)
}

export default experiment({
  id: 'spin/register-coulomb-track',
  code: 'E-SPN-0000',
  title:
    'a light register pair under a weak Coulomb pull, one level tracked by its overlap with a fixed reference (not yet run)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerCoulombTrackRun()
  },
})
