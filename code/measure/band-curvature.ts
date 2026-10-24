// THE BOUND REGISTER PAIR'S BAND, LINE BY LINE, AT SMALL TOTAL MOMENTUM IN ANY HUSK DIRECTION (E-RLT-0119).
//
// The reads (code/measure/pair-direction's pairCorrelation): the autocorrelation x_l = <v | G U^l v> of the pair's
// K = 0 level v (pairLevel, on the O_h sector) unfolded into the sector of the little group of K = kappa n and run at
// K = k n. One sector serves every k on the ray, since the little group depends on n alone. bandRun runs a plan of
// such reads and hands each one over as it lands, so a long run keeps what it has:
//
//   zero    the K = 0 correlation in the sector of n (the reference at full length; the other sectors at a shorter
//           length, as the check that they reproduce it)
//   moved   the correlation at K = kappa n for each kappa of the plan, at full length
//   image   the correlation at K = kappa (g n) for a cubic image g n of n, at a short length: with the start O_h-invariant
//           and the cycle cubic-covariant it equals the read along n lag for lag, so it is a direct test of the cycle's
//           cubic symmetry at K != 0 that no sector assumes when both sectors are the identity's
//
// and the fits:
//
//   curvatureFit     the least-squares fit d(kappa) = A kappa^2 + C kappa^4 of a direction's line shifts, its
//                    coefficients, the residual sum of squares and the fit's own standard error of A (from the
//                    residuals, with n - 2 degrees of freedom; NaN with two points)
//   quarticHarmonic  sum_i n_i^4 of the unit husk direction: the cubic harmonic a cubic-invariant quartic form depends on
//                    (C(n) = alpha + beta sum_i n_i^4 for any O_h-invariant K^4 term)
//   harmonicFit      the fit C(n) = alpha + beta sum_i n_i^4 over directions and its rms residual
//
// DETERMINISM: no random numbers; the start is placed. FLOATS: measurement on exact pieces (code/measure/register-reduced).

import type { KernelOptions } from '@/code/kernel/index'
import { pairCorrelation, pairLevel, type PairLevel } from '@/code/measure/pair-direction'
import { weightedLeastSquares } from '@/code/measure/regression'
import type { Setup } from '@/code/measure/register-track'

export type Plain = { re: number[]; im: number[] }

export type BandPlan = {
  name: string
  n: readonly number[]
  zeroLags: number
  kappas: readonly number[]
  lags: number
  images: readonly { name: string; n: readonly number[]; kappa: number; lags: number }[]
}

export type BandPart = {
  EL: number
  // the level's own one-cycle residual (pairLevel), the witness of the reference correlation's first lag (E-RLT-0120;
  // absent from E-RLT-0119's parts, which predate it)
  residual?: number
  zero: Record<string, Plain>
  moved: { name: string; kappa: number; x: Plain }[]
  image: { name: string; of: string; kappa: number; x: Plain }[]
  reps: Record<string, number>
  seconds: number
}

const plain = (x: { re: number[]; im: number[] }): Plain => ({ re: x.re, im: x.im })

export function bandRun(input: {
  su: Setup
  aB: number
  R: number
  plans: readonly BandPlan[]
  opts: KernelOptions
  have?: BandPart
  log?: (what: string) => void
  landed?: (part: BandPart) => void
}): BandPart {
  const started = Date.now()
  const log = input.log ?? (() => {})
  const { su, opts } = input
  const level: PairLevel = pairLevel({ su, aB: input.aB, R: input.R, opts })
  const zero: Record<string, Plain> = { ...(input.have?.zero ?? {}) }
  const moved: BandPart['moved'] = [...(input.have?.moved ?? [])]
  const image: BandPart['image'] = [...(input.have?.image ?? [])]
  const reps: Record<string, number> = { ...(input.have?.reps ?? {}) }
  const before = input.have?.seconds ?? 0
  const now = (): BandPart => ({
    EL: level.EL,
    residual: level.residual,
    zero,
    moved: [...moved],
    image: [...image],
    reps,
    seconds: before + (Date.now() - started) / 1000,
  })
  // the sector is fixed by the ray; its kappa only picks the little group
  const read = (n: readonly number[], k: number, length: number): { re: number[]; im: number[]; reps: number } =>
    pairCorrelation({ su, level, direction: n, kappa: 1, k, length, opts })

  log(`level ${level.EL}`)

  for (const p of input.plans) {
    if (!zero[p.name]) {
      const x = read(p.n, 0, p.zeroLags)

      zero[p.name] = plain(x)
      reps[p.name] = x.reps
      log(`${p.name} zero read (${p.zeroLags} lags, ${x.reps} representatives)`)
      input.landed?.(now())
    }

    for (const kappa of p.kappas) {
      if (moved.some(m => m.name === p.name && m.kappa === kappa)) {
        continue
      }

      moved.push({ name: p.name, kappa, x: plain(read(p.n, kappa, p.lags)) })
      log(`${p.name} kappa ${kappa} read`)
      input.landed?.(now())
    }

    for (const g of p.images) {
      if (image.some(m => m.name === g.name)) {
        continue
      }

      image.push({ name: g.name, of: p.name, kappa: g.kappa, x: plain(read(g.n, g.kappa, g.lags)) })
      log(`${g.name} image of ${p.name} at kappa ${g.kappa} read`)
      input.landed?.(now())
    }
  }

  return now()
}

// recorded parts of one band run merged into one (every part reads the same level; the first part's level and residual
// stand for all, and a check that they agree belongs to the reader)
export function mergeBandParts(parts: readonly BandPart[]): BandPart {
  return {
    EL: parts[0]!.EL,
    residual: parts[0]!.residual,
    zero: Object.assign({}, ...parts.map(p => p.zero)),
    moved: parts.flatMap(p => p.moved),
    image: parts.flatMap(p => p.image),
    reps: Object.assign({}, ...parts.map(p => p.reps)),
    seconds: parts.reduce((s, p) => s + p.seconds, 0),
  }
}

export type CurvatureFit ={ A: number; C: number; rss: number; sigmaA: number }

export function curvatureFit(input: { kappas: readonly number[]; shifts: readonly number[] }): CurvatureFit {
  const { kappas, shifts } = input

  if (kappas.length < 2) {
    return { A: NaN, C: NaN, rss: NaN, sigmaA: NaN }
  }

  const rows = kappas.map(k => [k ** 2, k ** 4])
  const fit = weightedLeastSquares({ rows, ys: shifts, errors: kappas.map(() => 1) })
  const [A, C] = fit.coefficients as [number, number]
  const rss = fit.chi2
  const dof = kappas.length - 2
  // with unit errors the returned errors are sqrt((X^T X)^-1); scaled by the residual variance s^2 = rss / dof
  const sigmaA = dof > 0 ? fit.errors[0]! * Math.sqrt(rss / dof) : NaN

  return { A, C, rss, sigmaA }
}

export const quarticHarmonic = (n: readonly number[]): number => {
  const l = Math.hypot(...n)

  return n.reduce((s, x) => s + (x / l) ** 4, 0)
}

export function harmonicFit(input: { ns: readonly (readonly number[])[]; Cs: readonly number[] }): {
  alpha: number
  beta: number
  rms: number
} {
  const rows = input.ns.map(n => [1, quarticHarmonic(n)])
  const fit = weightedLeastSquares({ rows, ys: input.Cs, errors: input.ns.map(() => 1) })
  const [alpha, beta] = fit.coefficients as [number, number]

  return { alpha, beta, rms: Math.sqrt(fit.chi2 / input.ns.length) }
}
