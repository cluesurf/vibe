// A TEMPERATURE READ OFF A ONE-BODY OCCUPATION BY LEVEL (E-FND-0165). A few particles with a discrete one-body spectrum
// (the register member's band levels E on a torus) relax to an occupation n(q) per momentum class. This module averages
// it over the classes of each level and fits the two textbook forms in the level energy:
//   Gibbs         n_l = A exp(-beta E_l), a straight line in ln n_l
//   Fermi-Dirac   f_l = n_l / g = 1 / (exp(beta (E_l - mu)) + 1), a straight line in ln(1 / f_l - 1), g the modes a class
// Both fits weight each level by its number of classes (a level of 96 classes is 96 independent reads, a level of 24 is
// 24), and report the weighted RMS residual in the log, the same for the flat line (beta = 0, infinite temperature), and
// beta's standard error scaled by the residual. At a filling f << 1 the two forms agree to O(f) in the log, so which one
// the data follow cannot be told apart there; the difference of the two residuals is returned so a caller can say so.
//
// DETERMINISM: pure arithmetic on its inputs.

import { weightedLinearFit } from '@/code/measure/regression'

export type LevelOccupation = {
  // the distinct levels, ascending, their class counts, and the mean occupation per class of each
  levels: number[]
  counts: number[]
  perClass: number[]
}

// group a per-class occupation by level; levels are distinct values of E to `digits` decimals
export function levelOccupation(
  E: ArrayLike<number>,
  occupation: ArrayLike<number>,
  digits = 6,
): LevelOccupation {
  const keys = [...new Set(Array.from(E, x => x.toFixed(digits)))].sort((a, b) => Number(a) - Number(b))
  const counts = keys.map(() => 0)
  const sums = keys.map(() => 0)

  for (let j = 0; j < E.length; j++) {
    const l = keys.indexOf(E[j]!.toFixed(digits))

    counts[l]!++
    sums[l]! += occupation[j]!
  }

  return {
    levels: keys.map(Number),
    counts,
    perClass: sums.map((x, l) => x / counts[l]!),
  }
}

// the same occupation with some levels (by index) left out, for a fit on the levels a start did not occupy
export const withoutLevels = (o: LevelOccupation, drop: readonly number[]): LevelOccupation => {
  const keep = o.levels.map((_, l) => l).filter(l => !drop.includes(l))

  return {
    levels: keep.map(l => o.levels[l]!),
    counts: keep.map(l => o.counts[l]!),
    perClass: keep.map(l => o.perClass[l]!),
  }
}

export type LevelFit = {
  beta: number
  // the intercept: ln A for Gibbs, beta mu for Fermi-Dirac
  intercept: number
  betaError: number
  // weighted RMS residual of the fitted log, and of the flat line through the same log
  rms: number
  flatRms: number
}

function fitLine(o: LevelOccupation, ys: number[]): LevelFit {
  const errors = o.counts.map(c => 1 / Math.sqrt(c))
  const fit = weightedLinearFit({ xs: o.levels, ys, errors })
  const total = o.counts.reduce((a, c) => a + c, 0)
  const mean = ys.reduce((a, y, l) => a + o.counts[l]! * y, 0) / total

  let flat = 0

  ys.forEach((y, l) => (flat += o.counts[l]! * (y - mean) ** 2))

  const dof = Math.max(1, o.levels.length - 2)

  return {
    beta: -fit.slope,
    intercept: fit.intercept,
    betaError: fit.slopeError * Math.sqrt(fit.chi2 / dof),
    rms: Math.sqrt(fit.chi2 / total),
    flatRms: Math.sqrt(flat / total),
  }
}

// n_l = A exp(-beta E_l)
export const gibbsFit = (o: LevelOccupation): LevelFit => fitLine(o, o.perClass.map(n => Math.log(n)))

// f_l = n_l / g = 1 / (exp(beta (E_l - mu)) + 1): ln(1 / f - 1) = beta E - beta mu. The returned intercept is -beta mu,
// and the sign of beta follows gibbsFit's (a line falling in E is a positive beta in both)
export function fermiFit(o: LevelOccupation, g: number): LevelFit {
  const fit = fitLine(
    o,
    o.perClass.map(n => Math.log(g / n - 1)),
  )

  // fitLine reads the slope of ln(1 / f - 1) as -beta; for Fermi-Dirac that slope is +beta
  return { ...fit, beta: -fit.beta }
}
