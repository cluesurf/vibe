// THE MOTION OF A LINEON BY DIRECTION, BRANCH BY BRANCH, READ ON THE HUSK. On the working rule a vibe keeps its line
// (the line law), so a state of 3d momentum K = kappa n is a set of twelve branches, one a line class u, that never mix:
// branch u carries the 1d momentum k = kappa n . u and moves along u at its band's slope, v_u = E_1'(k) u. Read on the
// husk, v_u is its first three components (the depth drops; the two depth classes e_a +- e_4 cast the same axis and
// their depth parts cancel in any sum over branches). This file reads, for one direction:
//
//   drift        the branches' mean velocity (1/12) sum_u v_u, and its length (a massless lineon's group speed)
//   branchSpeed  the mean SPEED of the branches, (1/12) sum_u |v_u|: how fast the parts of the state actually move
//   spread       the branches' rms distance from the drift (the splitting a beam would show)
//   still        the share of branches that do not move (n . u = 0)
//   aligned      the share of branches moving within `tolerance` radians of n itself
//
// and directionSpread summarizes any per-direction number as (max - min) / mean.
//
// DETERMINISM: no random numbers. FLOATS: measurement on a closed-form band.

import { lineClasses } from '@/code/measure/crossing-lines'

export type LineonBranches = {
  drift: number[]
  groupSpeed: number
  branchSpeed: number
  spread: number
  still: number
  aligned: number
}

const LINES = lineClasses()

// a husk direction (three components) as a unit 4d vector with depth 0
export const huskUnit = (n: readonly number[]): number[] => {
  const l = Math.hypot(n[0]!, n[1]!, n[2]!)

  return [n[0]! / l, n[1]! / l, n[2]! / l, 0]
}

export function lineonBranches(input: {
  direction: readonly number[]
  kappa: number
  band: (k: number) => { energy: number; slope: number }
  tolerance: number
}): LineonBranches {
  const n = huskUnit(input.direction)
  const drift = [0, 0, 0]
  const velocities: number[][] = []

  for (const u of LINES) {
    const k = input.kappa * u.reduce((s, x, c) => s + x * n[c]!, 0)
    const slope = k === 0 ? 0 : input.band(k).slope
    const v = [u[0]! * slope, u[1]! * slope, u[2]! * slope]

    velocities.push(v)
    v.forEach((x, c) => (drift[c] = drift[c]! + x / LINES.length))
  }

  let branchSpeed = 0
  let spread = 0
  let still = 0
  let aligned = 0

  for (const v of velocities) {
    const speed = Math.hypot(v[0]!, v[1]!, v[2]!)

    branchSpeed += speed / LINES.length
    spread +=
      v.reduce((s, x, c) => s + (x - drift[c]!) ** 2, 0) / LINES.length

    if (speed === 0) {
      still += 1 / LINES.length
      continue
    }

    const cos = (v[0]! * n[0]! + v[1]! * n[1]! + v[2]! * n[2]!) / speed

    if (Math.acos(Math.min(1, cos)) <= input.tolerance) {
      aligned += 1 / LINES.length
    }
  }

  return {
    drift,
    groupSpeed: Math.hypot(drift[0]!, drift[1]!, drift[2]!),
    branchSpeed,
    spread: Math.sqrt(spread),
    still,
    aligned,
  }
}

// the shifts 4 a kappa^2 (n . u)^2 of the twelve branches of a lineon composite whose class-averaged K^2 coefficient is a
export const branchShifts = (input: {
  direction: readonly number[]
  kappa: number
  a: number
}): number[] => {
  const n = huskUnit(input.direction)

  return LINES.map(
    u => 4 * input.a * input.kappa ** 2 * u.reduce((s, x, c) => s + x * n[c]!, 0) ** 2,
  )
}

// the autocorrelation x_l = (1/12) sum_u e^(i (E + s_u) l), l = 0 .. length, of an equal-weight lineon composite at
// rest energy E: what a pair made of line branches would hand the filter diagonalization (the instrument's control)
export function lineonCorrelation(input: {
  E: number
  shifts: readonly number[]
  length: number
}): { re: number[]; im: number[] } {
  const re: number[] = []
  const im: number[] = []

  for (let l = 0; l <= input.length; l++) {
    let r = 0
    let i = 0

    for (const s of input.shifts) {
      r += Math.cos((input.E + s) * l) / input.shifts.length
      i += Math.sin((input.E + s) * l) / input.shifts.length
    }

    re.push(r)
    im.push(i)
  }

  return { re, im }
}

export type DirectionSpread = {
  min: number
  max: number
  mean: number
  spread: number
}

// (max - min) / |mean| of a per-direction number
export function directionSpread(values: readonly number[]): DirectionSpread {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length

  return { min, max, mean, spread: (max - min) / Math.abs(mean) }
}
