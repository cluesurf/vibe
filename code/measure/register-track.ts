// THE LIGHT REGISTER PAIR UNDER THE HUSK LIGHT'S COULOMB PULL: ITS SETUP AND THE TRACKED SCAN'S READS.
//
// Moved here unchanged from the experiments spin/register-coulomb-weak (the member, the count's unit, the Green table,
// the member instrument, E-SPN-0173's recorded point) and spin/register-coulomb-track (the identity read at K = 0 on
// the cubic group, the motion read at K and K / 2 on the axis, one level followed by its overlap with a fixed
// hydrogenic reference), so that experiments share them through code/ and none imports another. The derivations,
// gates and runs stay in those experiments' headers (E-SPN-0183, E-SPN-0200); readZero and readMotion take an optional
// diagnostic transform of the count (E-SPN-0206, E-SPN-0208), the identity when absent.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import type { KernelOptions } from '@/code/kernel/index'
import { darwinR, staticR } from '@/code/measure/darwin-exchange'
import { wrap } from '@/code/measure/dock-mixer'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { huskGreenTable, type GreenTable } from '@/code/measure/husk-meson'
import { memberCycle } from '@/code/measure/register-meson'
import {
  canonicalGreen,
  cubicGroup,
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  reducedHydrogenStart,
  reducedS,
  reducedShells,
  referenceCorrelation,
  referenceLines,
  repWeights,
  sector,
  unfold,
  type CubicGroup,
  type ReducedCount,
  type RefLine,
  type Sector,
} from '@/code/measure/register-reduced'
import { diracPhase } from '@/code/measure/spinor-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

// the member's light unit and the count's step, both ring units
export const MEMBER_LIGHT: readonly [number, number] = [-5, 1]
export const COUNT_UNIT: readonly [number, number] = [11, 5]
const LIGHT = MEMBER_LIGHT
const UNIT = COUNT_UNIT
const C_STAR2 = 0.5
const I1_MOMENTA: readonly number[][] = [
  [0, 0, 0, 0],
  [0.3, 0.1, -0.2, 0],
  [1.1, -0.7, 0.4, 0],
  [2.5, 0.3, 0.3, 0],
  [0.01, 0, 0, 0],
]
// the tracking rule's tolerances (E-SPN-0200's derivation points 3, 5 and 8)
export const GENUINE = 1e-6
export const FOLLOW = 0.2
export const HALF_PHASE = 1e-7
export const HALF_OVERLAP = 0.05
export const QUADRATIC = 0.1

// E-SPN-0173's recorded main point (tmp/rch-exp-run1.log): the control
export const RECORDED = {
  EL: 1.6133573497836755,
  Rstatic: 8.459326179870311,
  Eb: 0.09475961475246364,
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

export const genuine = (l: { modulus: number }): boolean =>
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
  // a diagnostic transform of the count (E-SPN-0206's softened cores); the identity when absent
  transform?: (s: Sector, c: ReducedCount) => ReducedCount,
): ZeroRead {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const alpha = alphaOf(su, p.aB) * alphaScale
  const s = sector(su.group, oh, p.R)
  const ruleCount = reducedCounts(s, su.table, alpha, su.theta)
  const count = transform ? transform(s, ruleCount) : ruleCount
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

export const quadratic = (f: Follow | null): boolean =>
  f !== null && Math.abs(f.ratio - 4) <= QUADRATIC

export function readMotion(
  su: Setup,
  p: TrackPoint,
  zero: ZeroRead,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
  // the same diagnostic transform as readZero's
  transform?: (s: Sector, c: ReducedCount) => ReducedCount,
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
  const ruleCountK: ReducedCount = reducedCounts(sk, su.table, alpha, su.theta)
  const countK = transform ? transform(sk, ruleCountK) : ruleCountK

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
