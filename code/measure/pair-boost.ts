// THE LIGHT REGISTER PAIR AT A FINITE TOTAL MOMENTUM (E-MTR-0029).
//
// readBoost reads the pair's lines in the sector of total momentum K along a husk direction, the way readMotion
// (code/measure/register-track) reads them at K 0.04 and 0.02, with one change: the energy window is moved up by the
// free threshold's rise, 2 E_member(K / 2) - 2 M0, from the member's exact band (code/measure/spinor-register
// diracPhase), so a level that moves with K stays inside it. The shift is read off the lone member, never off the pair,
// so no answer about the pair places its own window. The start is readMotion's (the K = 0 hydrogenic start unfolded
// onto the K sector, left unnormalized), and each line's overlap is divided by its own correlation's x_0.
//
// boostLevels names the levels by overlap rank: the genuine line of largest overlap is the ground, the next the
// 2s-like level, the identity readZero uses at K = 0. relativisticEnergy is sqrt(E0^2 + c^2 K^2) and galileanEnergy
// E0 + a K^2 with c^2 = 2 a E0, the two forms a curvature a fixes; relativityFraction is where a read sits between
// them, 1 on the relativistic form and 0 on the Galilean.

import { filterDiagonalize, type FilterLine } from '@/code/algebra/linear/filter-diagonalization'
import type { KernelOptions } from '@/code/kernel/index'
import { weightedLeastSquares } from '@/code/measure/regression'
import {
  alphaOf,
  genuine,
  HALF_OVERLAP,
  HALF_PHASE,
  windowOf,
  type LineOut,
  type Setup,
  type TrackPoint,
  type ZeroRead,
} from '@/code/measure/register-track'
import {
  littleGroup,
  reducedCounts,
  reducedEngine,
  reducedHydrogenStart,
  referenceCorrelation,
  referenceLines,
  sector,
  unfold,
  type ReducedCount,
  type Sector,
} from '@/code/measure/register-reduced'
import { diracPhase } from '@/code/measure/spinor-register'

export type BoostRead = {
  K: number
  direction: [number, number, number]
  NK: number
  shift: number
  repsK: number
  lines: LineOut[]
  seconds: number
}

// the free threshold's rise at total momentum K: two lone members each at K / 2
export function thresholdRise(su: Setup, K: number): number {
  return 2 * diracPhase([K / 2, 0, 0, 0], su.M0) - 2 * su.M0
}

export function readBoost(
  su: Setup,
  p: TrackPoint,
  zero: ZeroRead,
  K: number,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
  // the same diagnostic transform of the count as readZero's (code/measure/contact-core softenContact)
  transform?: (s: Sector, c: ReducedCount) => ReducedCount,
  direction: readonly [number, number, number] = [1, 0, 0],
): BoostRead {
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
  const along = [K * direction[0], K * direction[1], K * direction[2], 0]
  const sk = sector(su.group, littleGroup(su.group, along), p.R)
  const rk = unfold(s, r, sk)
  const ruleCount = reducedCounts(sk, su.table, alpha, su.theta)
  const count = transform ? transform(sk, ruleCount) : ruleCount
  const shift = thresholdRise(su, K)
  const center = w.center + shift
  const e = reducedEngine(sk, su.u, along, count, 'vector', opts)
  const x = referenceCorrelation(e, rk, NK + w.S - 1)

  log(`${p.name} K ${K}: correlation read, window shift ${shift}`)

  const lines = referenceLines(x, NK, center, w.L, center, w.S)
    .map(l => ({
      E: l.E,
      modulus: l.modulus,
      weight: l.weight,
      transfer: l.transfer,
      overlap: l.overlap,
      scaled: (2 * su.M0 - l.E) * 2 * su.mu * p.aB * p.aB,
    }))
    .sort((a, b) => a.E - b.E)

  return {
    K,
    direction: [direction[0], direction[1], direction[2]],
    NK,
    shift,
    repsK: sk.count,
    lines,
    seconds: (Date.now() - started) / 1000,
  }
}

// the pair's own autocorrelation x_l = <r_K | G U_K^l r_K>, l = 0 .. n, in the sector of total momentum K, with readBoost's
// start (the K = 0 hydrogenic start unfolded onto the K sector), for code/algebra/linear/filter-diagonalization
export function boostCorrelation(
  su: Setup,
  p: TrackPoint,
  K: number,
  n: number,
  opts: KernelOptions,
  transform?: (s: Sector, c: ReducedCount) => ReducedCount,
  direction: readonly [number, number, number] = [1, 0, 0],
): { K: number; n: number; re: number[]; im: number[]; seconds: number } {
  const started = Date.now()
  const oh = [...su.group.elements.keys()]
  const s = sector(su.group, oh, p.R)
  const r = reducedHydrogenStart(s, p.aB)
  const along = [K * direction[0], K * direction[1], K * direction[2], 0]
  const sk = sector(su.group, littleGroup(su.group, along), p.R)
  const rk = unfold(s, r, sk)
  const ruleCount = reducedCounts(sk, su.table, alphaOf(su, p.aB), su.theta)
  const count = transform ? transform(sk, ruleCount) : ruleCount
  const e = reducedEngine(sk, su.u, along, count, 'vector', opts)
  const x = referenceCorrelation(e, rk, n)

  return {
    K,
    n,
    re: [...x.re],
    im: [...x.im],
    seconds: (Date.now() - started) / 1000,
  }
}

// the genuine lines by overlap rank: [ground, 2s-like, third]
export function boostLevels(lines: readonly LineOut[]): LineOut[] {
  return lines.filter(genuine).sort((a, b) => b.overlap - a.overlap)
}

export function relativisticEnergy(input: {
  E0: number
  a: number
  K: number
}): number {
  return Math.sqrt(input.E0 ** 2 + 2 * input.a * input.E0 * input.K ** 2)
}

export function galileanEnergy(input: {
  E0: number
  a: number
  K: number
}): number {
  return input.E0 + input.a * input.K ** 2
}

export function relativityFraction(input: {
  E: number
  E0: number
  a: number
  K: number
}): number {
  const g = galileanEnergy(input)

  return (g - input.E) / (g - relativisticEnergy(input))
}

// ---- the sector eigensolver's read of one level over several settings (E-MTR-0031, E-MTR-0032) ----

// one solver setting: the filter length S, the basis density (J per 0.02 of window, at least `floor` states) and a shift
// of the whole window
export type FilterSetting = { S: number; density: number; shift: number }

export type LevelPick = 'lowest' | 'heaviest'

// the level in the window [lo, hi] at each setting: the lowest line whose weight is at least `least` (the ground, since a
// bound sector's ground is its lowest level), or the heaviest line; the first setting's line is the read, and the
// half-spread of its energy over all settings is its stability
export function levelOverSettings(input: {
  x: { re: ArrayLike<number>; im: ArrayLike<number> }
  lo: number
  hi: number
  settings: readonly FilterSetting[]
  pick: LevelPick
  least?: number
  floor?: number
}): { line: FilterLine | undefined; half: number; reads: (FilterLine | undefined)[]; lines: FilterLine[] } {
  const least = input.least ?? 0.1
  const floor = input.floor ?? 60
  const all: FilterLine[][] = input.settings.map(s =>
    filterDiagonalize({
      x: input.x,
      lo: input.lo + s.shift,
      hi: input.hi + s.shift,
      basis: Math.max(floor, Math.round((s.density * (input.hi - input.lo)) / 0.02)),
      length: s.S,
    }),
  )
  const reads = all.map(ls => {
    if (input.pick === 'heaviest') {
      return ls.length === 0 ? undefined : ls.reduce((b, l) => (l.weight > b.weight ? l : b))
    }

    return ls.filter(l => l.weight >= least).sort((a, b) => a.E - b.E)[0]
  })
  const Es = reads.map(l => l?.E ?? NaN)

  return {
    line: reads[0],
    half: (Math.max(...Es) - Math.min(...Es)) / 2,
    reads,
    lines: all[0] ?? [],
  }
}

// the lone member's own quartic as a fraction of relativity's at total momentum K (each member at K / 2, its exact band
// against its own Galilean and relativistic forms)
export function memberQuarticFraction(su: Setup, K: number): number {
  const cm2 = 2 * su.aMember * su.M0
  const k = K / 2
  const E = diracPhase([k, 0, 0, 0], su.M0)
  const gal = su.M0 + (cm2 / (2 * su.M0)) * k * k
  const rel = Math.sqrt(su.M0 ** 2 + cm2 * k * k)

  return (gal - E) / (gal - rel)
}

// one quartic fraction rho through the reads E(K), E0 fixed: E = E_gal - rho (E_gal - E_rel), (a, rho) by Gauss-Newton
// from (a0, rho0), the errors scaled by the larger of sigma and the residual's own scatter (E-MTR-0031's fit)
export function quarticFractionFit(input: {
  E0: number
  points: readonly { K: number; E: number }[]
  a0: number
  rho0?: number
  sigma: number
}): { a: number; rho: number; sigmaA: number; sigmaRho: number; rms: number; perK: { K: number; rho: number }[] } {
  const { E0, points, sigma } = input
  const model = (a: number, rho: number, K: number): number =>
    galileanEnergy({ E0, a, K }) - rho * (galileanEnergy({ E0, a, K }) - relativisticEnergy({ E0, a, K }))

  let a = input.a0
  let rho = input.rho0 ?? 1.5
  let errs = [NaN, NaN]
  let rms = NaN

  for (let it = 0; it < 50; it++) {
    const h = 1e-7
    const rows = points.map(p => [
      (model(a + h, rho, p.K) - model(a - h, rho, p.K)) / (2 * h),
      -(galileanEnergy({ E0, a, K: p.K }) - relativisticEnergy({ E0, a, K: p.K })),
    ])
    const ys = points.map(p => p.E - model(a, rho, p.K))
    const step = weightedLeastSquares({ rows, ys, errors: points.map(() => 1) })

    a += step.coefficients[0] ?? 0
    rho += step.coefficients[1] ?? 0

    const resid = points.map(p => p.E - model(a, rho, p.K))
    const ss = resid.reduce((s, x) => s + x * x, 0)

    rms = Math.sqrt(ss / points.length)
    errs = step.errors.map(e => e * Math.max(sigma, Math.sqrt(ss / Math.max(1, points.length - 2))))

    if (Math.abs(step.coefficients[0] ?? 0) < 1e-14 && Math.abs(step.coefficients[1] ?? 0) < 1e-12) break
  }

  return {
    a,
    rho,
    sigmaA: errs[0] ?? NaN,
    sigmaRho: errs[1] ?? NaN,
    rms,
    perK: points.map(p => ({ K: p.K, rho: relativityFraction({ E: p.E, E0, a, K: p.K }) })),
  }
}
