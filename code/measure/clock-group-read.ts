// THE 1s-2s CLOCK READ FROM LEVEL-GROUP CENTROIDS, AT ANY SETTINGS (E-SPN-0217's read, generalized for E-SPN-0219).
//
// Each level n is its group's centroid (code/measure/level-group): the 1s group is the lowest peak of weight at least
// `least`, the 2s group the next peak of weight at least `next` above it. Its curvature comes from E_n(K) = E_n(0) +
// a_n K^2 + c_n K^4 over the K reads (weighted least squares, sigma_E the largest half-spread of that level's centroid
// over the settings, floor 1e-6), R_n = c*^2 / (2 a_n E_n), and the clock alpha = (a_1 - a_2) / (E_2 - E_1) against
// relativity's c*^2 / (2 E_1 E_2). Each setting gives its own clock; the main read is the first setting's, and the
// half-spread over settings joins the fit error in quadrature. The continuum extrapolation is E-SPN-0217's X: eps_1 and
// eps_1 - eps_2 each a weighted line in x = (tan m / m - 1) / a_B, alpha_inf / alpha_SR = 1 - C_1 - Lambda C_delta,
// Lambda the mean E_1 / Delta E, both raw and with each level's Darwin exchange restored at S (code/measure/pair-clock).
//
// Measurement only (floats). DETERMINISM: no random numbers.

import { groupOverSettings, type Correlation, type GroupSetting } from '@/code/measure/level-group'
import { clockDecomposition } from '@/code/measure/pair-clock'
import { thresholdRise } from '@/code/measure/pair-boost'
import { weightedLeastSquares, weightedLinearFit } from '@/code/measure/regression'
import type { Setup } from '@/code/measure/register-track'

const C_STAR2 = 0.5
const SIGMA_FLOOR = 1e-6

export type ClockInstrument = {
  settings: readonly GroupSetting[]
  least: number
  next: number
  below: number
  above: number
}

export type LevelPair = {
  one: ReturnType<typeof groupOverSettings>
  two: ReturnType<typeof groupOverSettings>
}

// the 1s and 2s groups of one correlation at total momentum K, searched in E-SPN-0217's range
export function levelPairAt(su: Setup, x: Correlation, K: number, ins: ClockInstrument): LevelPair {
  const rise = thresholdRise(su, K)
  const base = {
    x,
    lo: 2 * su.M0 - 0.08 + 0.3 * rise,
    hi: 2 * su.M0 + 1.2 * rise + 0.03,
    settings: ins.settings,
    least: ins.least,
    next: ins.next,
    below: ins.below,
    above: ins.above,
  }

  return { one: groupOverSettings({ ...base, rank: 0 }), two: groupOverSettings({ ...base, rank: 1 }) }
}

const curvature = (E0: number, pts: { K: number; E: number }[], sigma: number) => {
  const f = weightedLeastSquares({ rows: pts.map(p => [p.K ** 2, p.K ** 4]), ys: pts.map(p => p.E - E0), errors: pts.map(() => sigma) })

  return { a: f.coefficients[0]!, c: f.coefficients[1]!, sigmaA: f.errors[0]! }
}

const spread = (xs: number[]): number => (Math.max(...xs) - Math.min(...xs)) / 2

export type ClockPoint = {
  name: string
  m: number
  aB: number
  E1: number
  E2: number
  R1: number
  R2: number
  sigmaR1: number
  sigmaR2: number
  ratio: number
  sigmaRatio: number
  Q: number
  Qstatic: number
  R1full: number
  R2full: number
  ratioDarwin: number
  groups: { K: number; g: LevelPair }[]
}

// one point's clock from its K = 0 groups and its K reads' groups
export function clockFromGroups(input: {
  name: string
  su: Setup
  aB: number
  zero: LevelPair
  reads: readonly { K: number; g: LevelPair }[]
  S?: number
}): ClockPoint {
  const { su, zero, reads } = input
  const all = [{ K: 0, g: zero }, ...reads]
  const s1 = Math.max(SIGMA_FLOOR, ...all.map(r => r.g.one.half))
  const s2 = Math.max(SIGMA_FLOOR, ...all.map(r => r.g.two.half))
  const per = zero.one.reads.map((_, s) => {
    const E1 = zero.one.reads[s]?.centroid ?? NaN
    const E2 = zero.two.reads[s]?.centroid ?? NaN
    const l1 = curvature(E1, reads.map(({ K, g }) => ({ K, E: g.one.reads[s]?.centroid ?? NaN })), s1)
    const l2 = curvature(E2, reads.map(({ K, g }) => ({ K, E: g.two.reads[s]?.centroid ?? NaN })), s2)
    const R1 = C_STAR2 / (2 * l1.a * E1)
    const R2 = C_STAR2 / (2 * l2.a * E2)
    const alpha = (l1.a - l2.a) / (E2 - E1)
    const alphaSR = C_STAR2 / (2 * E1 * E2)

    return { E1, E2, l1, l2, R1, R2, alphaSR, ratio: alpha / alphaSR }
  })
  const main = per[0]!
  const dE = main.E2 - main.E1
  const sigmaR1 = Math.hypot((main.R1 * main.l1.sigmaA) / main.l1.a, spread(per.map(p => p.R1)))
  const sigmaR2 = Math.hypot((main.R2 * main.l2.sigmaA) / main.l2.a, spread(per.map(p => p.R2)))
  const sigmaRatio = Math.hypot(Math.hypot(main.l1.sigmaA, main.l2.sigmaA) / dE / main.alphaSR, spread(per.map(p => p.ratio)))
  const parts = clockDecomposition({ m: su.m, M0: su.M0, E1: main.E1, E2: main.E2, R1: main.R1, R2: main.R2, S: input.S })

  return {
    name: input.name,
    m: su.m,
    aB: input.aB,
    E1: main.E1,
    E2: main.E2,
    R1: main.R1,
    R2: main.R2,
    sigmaR1,
    sigmaR2,
    ratio: main.ratio,
    sigmaRatio,
    Q: (main.E1 * (main.R1 - main.R2)) / dE,
    Qstatic: parts.Qstatic,
    R1full: parts.R1full,
    R2full: parts.R2full,
    ratioDarwin: parts.ratioDarwin,
    groups: all,
  }
}

const lattice = (m: number, aB: number): number => (Math.tan(m) / m - 1) / aB

export type ClockLimit = { ratioInf: number; sigmaInf: number; C1: number; Cdelta: number; sigmaCdelta: number; chi2delta: number; Lambda: number }

// E-SPN-0217's extrapolation in x = (tan m / m - 1) / a_B, raw (darwin false) or with the Darwin exchange restored
export function clockLimit(points: readonly ClockPoint[], darwin: boolean): ClockLimit {
  const xs = points.map(r => lattice(r.m, r.aB))
  const f1 = weightedLinearFit({ xs, ys: points.map(r => (darwin ? r.R1full : r.R1) - 1), errors: points.map(r => Math.max(1e-6, r.sigmaR1)) })
  const fd = weightedLinearFit({
    xs,
    ys: points.map(r => (darwin ? r.R1full - r.R2full : r.R1 - r.R2)),
    errors: points.map(r => Math.max(1e-6, Math.hypot(r.sigmaR1, r.sigmaR2))),
  })
  const Lambda = points.reduce((s, r) => s + r.E1 / (r.E2 - r.E1), 0) / points.length

  return {
    ratioInf: 1 - f1.intercept - Lambda * fd.intercept,
    sigmaInf: Math.hypot(f1.interceptError, Lambda * fd.interceptError),
    C1: f1.intercept,
    Cdelta: fd.intercept,
    sigmaCdelta: fd.interceptError,
    chi2delta: fd.chi2,
    Lambda,
  }
}
