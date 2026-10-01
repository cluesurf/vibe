// Measurement for the ratio-alone split test (test/experiment/gauge/ratio-balance): the Planck departure of the
// plaquette ladder's quantum light read as a function of the split's RATIO rho = f / s alone, its split-to-split
// spread, and the Gaussian-tail model of where the Planck-optimal split sits at finite N.
//
// ONE OPERATOR PER RATIO. The beat's phases are 2 pi (c E mod M) / M for the drift and 2 pi (r E mod M) / M for
// the force, so the beat is a function of c / M = s / (2 N) and r / M = f / (2 N). With s f = 2 / N that is a
// function of rho alone, and every exact split of one ratio (they are the multiples (k c, k r, k w) of the least one,
// since rho = 2 N w^2 / c^2 fixes c / w) is ONE operator. `ratioSpec` writes the same beat for any real rho with
// root 1 and fractional exponents; at an exact split it is that split's beat up to the rounding of one phase.
//
// THE SPREAD. The grid is uniform in ln rho. A sub-grid takes every `stride`-th point from one offset, so the
// `stride` sub-grids are the same density of ratios as E-FRC-0269's exact splits, each sampled at shifted ratios.
// Each sub-grid's optimum is the argmin of a running median of |departure| over `width` of its own points. The
// spread is the standard deviation of ln rho* over the sub-grids: how far the optimum moves when the ratios
// sampled move. Doubles throughout: this is measurement.

import type { LadderSpec } from '@/code/rule/plaquette-ladder'
import { planckRatios } from '@/code/measure/quantum-balance'

/** The ladder beat at the real ratio rho with kappa = 2 / n: root 1, drift s / 2n, force f / 2n. */
export function ratioSpec(n: number, plaquettes: number, rho: number): LadderSpec {
  const s = Math.sqrt(2 / (n * rho))
  const f = Math.sqrt((2 * rho) / n)

  return { n, plaquettes, root: 1, drift: s / (2 * n), force: f / (2 * n) }
}

/** rho on a grid uniform in ln rho, `steps` + 1 points from `from` to `to`. */
export const ratioGrid = (from: number, to: number, steps: number): number[] =>
  Array.from({ length: steps + 1 }, (_, i) =>
    Math.exp(Math.log(from) + ((Math.log(to) - Math.log(from)) * i) / steps),
  )

/** The signed Planck departure (ratio - 1) of every grid ratio at every temperature: [temperature][ratio]. */
export function departureGrid(
  n: number,
  plaquettes: number,
  rhos: readonly number[],
  temperatures: readonly number[],
): number[][] {
  const out = temperatures.map(() => [] as number[])

  for (const rho of rhos) {
    planckRatios(ratioSpec(n, plaquettes, rho), temperatures).ratios.forEach(
      (r, j) => out[j]!.push(r - 1),
    )
  }

  return out
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1

  return s.length % 2 === 1 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

/** A running median of `width` points (odd), truncated at the ends. */
export function runningMedian(xs: readonly number[], width: number): number[] {
  const h = (width - 1) / 2

  return xs.map((_, i) =>
    median(xs.slice(Math.max(0, i - h), Math.min(xs.length, i + h + 1))),
  )
}

/**
 * Per offset 0 .. stride - 1: the grid index of the optimum of that sub-grid, the argmin of the running median
 * (over `width` sub-grid points) of |departure|. width 1 is the raw argmin.
 */
export function offsetOptima(
  departures: readonly number[],
  stride: number,
  width: number,
): number[] {
  const out: number[] = []

  for (let o = 0; o < stride; o++) {
    const index: number[] = []

    for (let i = o; i < departures.length; i += stride) {
      index.push(i)
    }

    const smooth = runningMedian(
      index.map(i => Math.abs(departures[i]!)),
      width,
    )

    let best = 0

    smooth.forEach((v, k) => {
      if (v < smooth[best]!) {
        best = k
      }
    })
    out.push(index[best]!)
  }

  return out
}

export const meanOf = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / xs.length

export const standardDeviation = (xs: readonly number[]): number => {
  const m = meanOf(xs)

  return Math.sqrt(meanOf(xs.map(x => (x - m) ** 2)))
}

/** Least squares ln y = a + b ln x. */
export function powerFit(
  xs: readonly number[],
  ys: readonly number[],
): { a: number; b: number } {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = meanOf(lx)
  const my = meanOf(ly)

  let sxy = 0
  let sxx = 0

  lx.forEach((x, i) => {
    sxy += (x - mx) * (ly[i]! - my)
    sxx += (x - mx) ** 2
  })

  const b = sxy / sxx

  return { a: my - b * mx, b }
}

// ---------------------------------------------------------------------------------------------------------
// the Gaussian-tail model (read only): each register of a periodic ladder box a Gaussian with its exact harmonic
// thermal variance (Planck-weighted mode sums, hbar = N / 2 pi, E-FRC-0234's leapfrog two-point function), its
// seam weight erfc(N / (2 sqrt 2 sigma)); the model's optimum minimizes the summed seam weight over rho

const erfc = (x: number): number => {
  // Numerical Recipes erfcc, fractional error below 1.2e-7
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const poly =
    -1.26551223 +
    t *
      (1.00002368 +
        t *
          (0.37409196 +
            t *
              (0.09678418 +
                t *
                  (-0.18628806 +
                    t *
                      (0.27886807 +
                        t *
                          (-1.13520398 +
                            t *
                              (1.48851587 +
                                t * (-0.82215223 + t * 0.17087277))))))))
  const r = t * Math.exp(-z * z + poly)

  return x >= 0 ? r : 2 - r
}

const logErfc = (x: number): number =>
  x < 20
    ? Math.log(erfc(x))
    : -x * x -
      Math.log(x * Math.sqrt(Math.PI)) +
      Math.log(1 - 1 / (2 * x * x))

/** The thermal variances of a box's rails, rungs and squares, with their counts. */
export function registerVariances(
  n: number,
  plaquettes: number,
  rho: number,
  T: number,
): { sigma2: number; count: number }[] {
  const L = plaquettes
  const hbar = n / (2 * Math.PI)
  const s = Math.sqrt(2 / (n * rho))
  const f = Math.sqrt((2 * rho) / n)
  const kappa = s * f

  let rail = 0
  let rung = 0
  let square = 0

  for (let j = 0; j < L; j++) {
    const k = (2 * Math.PI * j) / L
    const K = 4 - 2 * Math.cos(k)
    const g = 1 - (kappa * K) / 4
    const omega = Math.acos(1 - (kappa * K) / 2)
    const occupation = 1 / Math.tanh(omega / (2 * T))

    rail += ((hbar / 2) * occupation * Math.sqrt(f / (s * K * g))) / L
    rung += ((K - 2) * (hbar / 2) * occupation * Math.sqrt(f / (s * K * g))) / L
    square += ((hbar / 2) * occupation * Math.sqrt((s * K) / (f * g))) / L
  }

  return [
    { sigma2: rail, count: 2 * L },
    { sigma2: rung, count: L },
    { sigma2: square, count: L },
  ]
}

/** ln of the summed seam weight of a box at rho and T. */
export function logSeamWeight(
  n: number,
  plaquettes: number,
  rho: number,
  T: number,
): number {
  const terms = registerVariances(n, plaquettes, rho, T).map(
    r => Math.log(r.count) + logErfc(n / (2 * Math.sqrt(2 * r.sigma2))),
  )
  const m = Math.max(...terms)

  return m + Math.log(terms.reduce((acc, t) => acc + Math.exp(t - m), 0))
}

/** The model's optimum: the rho in [1, 6] of least summed seam weight (ternary search in ln rho). */
export function tailOptimum(n: number, plaquettes: number, T: number): number {
  let lo = 0
  let hi = Math.log(6)

  for (let it = 0; it < 200; it++) {
    const a = lo + (hi - lo) / 3
    const b = hi - (hi - lo) / 3

    if (
      logSeamWeight(n, plaquettes, Math.exp(a), T) <
      logSeamWeight(n, plaquettes, Math.exp(b), T)
    ) {
      hi = b
    } else {
      lo = a
    }
  }

  return Math.exp((lo + hi) / 2)
}
