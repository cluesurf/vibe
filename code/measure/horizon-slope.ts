// The clock horizon's radius law against the stack's massive modes and the box (E-GRV-0117). Real numbers live here
// only. Theory and readings, no rule: every function takes the stack's modes (code/measure/open-husk stackModes) or a
// solved static field and returns numbers.
//
// THE DERIVATION. On the layered stack a unit of content on the husk has the husk depth
//   G(r) = (w_0 / 4 pi r) g(r),   g(r) = 1 + sum_n beta_n e^(-r / l_n),   beta_n = w_n / w_0,   l_n = 1 / m_n,
// the zero mode's 1/r and the massive modes' Yukawa parts. The clock horizon of E-GRV-0111 joins where the excess over a
// reference dock at r_ref reaches the cap: M [G(r_h) - G(r_ref)] = CAP. Differentiating at fixed r_ref,
//   s = d ln r_h / d ln M = [g(r_h) - rho g(r_ref)] / [1 + sum_n beta_n (1 + x_n) e^(-x_n)],   x_n = r_h / l_n,
//   rho = r_h / r_ref.
// With one massive mode: s = [1 + beta e^(-x) - rho (1 + beta e^(-x / rho))] / [1 + beta (1 + x) e^(-x)], and to first
// order in both small parts the shortfall is 1 - s = rho + beta x e^(-x). The box costs rho; the massive part costs
// beta x e^(-x), which is largest at x = 1 (beta / e) and falls on BOTH sides: s -> 1 as x -> infinity (the modes have
// died) and as x -> 0 (every mode is still 1/r there, with a larger coefficient). So the slope rises toward 1 with r_h / l
// only past r_h = l.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: this file reads values only.

import { huskDistance, type StackMode } from '@/code/measure/open-husk'
import type { OpenMesh } from '@/code/rule/open-husk'
import { linearFit } from '@/code/measure/regression'

// E-GRV-0117's far background: the husk docks at distance >= side / 4 from `center`, dock 0 (the reference) excluded
export function backgroundDocks(
  mesh: OpenMesh,
  center: readonly number[],
): number[] {
  const far: number[] = []

  for (let y = 1; y < mesh.huskDocks; y++) {
    if (huskDistance(mesh, y, center) >= mesh.side / 4) {
      far.push(y)
    }
  }

  return far
}

// the unit source and its far background: +1 at `at` (any dock), -1/N on each of the N background docks
export function unitWithBackground(
  mesh: OpenMesh,
  center: readonly number[],
  at: number,
  far: readonly number[] = backgroundDocks(mesh, center),
): Float64Array {
  const rho = new Float64Array(mesh.docks)

  for (const y of far) {
    rho[y] = -1 / far.length
  }

  rho[at] = rho[at]! + 1

  return rho
}

// the zero mode is the lightest (its eigenvalue is 0 up to rounding, which on a deep stack leaves a mass of order 1e-8)
const ZERO = 1e-6

const massiveOf = (
  modes: readonly StackMode[],
): { w0: number; massive: StackMode[] } => {
  const lightest = modes.reduce(
    (a, m) => (m.mass < a.mass ? m : a),
    modes[0]!,
  )

  if (lightest.mass >= ZERO) {
    throw new Error('horizon-slope: no zero mode')
  }

  return {
    w0: lightest.weight,
    massive: modes.filter(m => m !== lightest),
  }
}

// g(r): the husk depth of a unit over the zero mode's 1/(4 pi r) share, 1 + sum beta_n e^(-m_n r)
export function modeFactor(
  modes: readonly StackMode[],
  r: number,
): number {
  const { w0, massive } = massiveOf(modes)

  return (
    1 +
    massive.reduce(
      (t, m) => t + (m.weight / w0) * Math.exp(-m.mass * r),
      0,
    )
  )
}

// the predicted excess of a unit over the reference, in units of w_0 / (4 pi): g(r) / r - g(r_ref) / r_ref (r_ref
// Infinity: the reference at infinity)
export const predictedExcess = (
  modes: readonly StackMode[],
  r: number,
  ref: number,
): number =>
  modeFactor(modes, r) / r -
  (Number.isFinite(ref) ? modeFactor(modes, ref) / ref : 0)

// the derived local slope d ln r_h / d ln M at r_h = r (the formula above)
export function derivedSlope(
  modes: readonly StackMode[],
  r: number,
  ref: number,
): number {
  const { w0, massive } = massiveOf(modes)
  const below =
    1 +
    massive.reduce(
      (t, m) =>
        t + (m.weight / w0) * (1 + m.mass * r) * Math.exp(-m.mass * r),
      0,
    )
  const rho = Number.isFinite(ref) ? r / ref : 0

  return (
    (modeFactor(modes, r) -
      (Number.isFinite(ref) ? rho * modeFactor(modes, ref) : 0)) /
    below
  )
}

// the range of the lightest massive mode, 1 / m_1, and the massive weight over the zero mode's, sum beta_n
export function lightestRange(modes: readonly StackMode[]): number {
  const { massive } = massiveOf(modes)

  return 1 / Math.min(...massive.map(m => m.mass))
}

export function massiveWeight(modes: readonly StackMode[]): number {
  const { w0, massive } = massiveOf(modes)

  return massive.reduce((t, m) => t + m.weight / w0, 0)
}

// THE READING. Given an excess profile E(r) > 0 at integer radii (the husk's axis mean of a unit's static excess over
// the reference), the horizon along the axes reaches r at M_r = CAP / E(r), so the log slope of r_h against M between
// two radii is ln(r_b / r_a) / ln(E(r_a) / E(r_b)); CAP cancels, and so does the unit's normalization.
export const pairSlope = (
  ra: number,
  ea: number,
  rb: number,
  eb: number,
): number => Math.log(rb / ra) / Math.log(ea / eb)

// the least-squares slope of ln r against ln M = -ln E + const over the radii given
export const profileSlope = (
  rs: readonly number[],
  es: readonly number[],
): number =>
  linearFit({
    xs: es.map(e => -Math.log(e)),
    ys: rs.map(r => Math.log(r)),
  }).slope

// the smallest husk side (reference at the corner, sqrt 3 side / 2 away) on which the derived local slope reaches
// `target` at some radius, searching radii 1 .. side / 4 and sides by doubling then bisection; Infinity when even the
// reference at infinity never reaches it below `most`
export function sideFor(
  modes: readonly StackMode[],
  target: number,
  most = 1 << 20,
): { side: number; radius: number } {
  const best = (side: number): { slope: number; radius: number } => {
    let top = { slope: -Infinity, radius: 0 }

    const ref = (Math.sqrt(3) * side) / 2

    for (let r = 1; r <= side / 4; r *= 1.02) {
      const s = derivedSlope(modes, r, ref)

      if (s > top.slope) {
        top = { slope: s, radius: r }
      }
    }

    return top
  }

  let hi = 16

  while (hi <= most && best(hi).slope < target) {
    hi *= 2
  }

  if (hi > most) {
    return { side: Infinity, radius: NaN }
  }

  let lo = hi / 2

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2)

    if (best(mid).slope >= target) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return { side: hi, radius: best(hi).radius }
}

// the decay rate of a difference profile D(r) > 0 (a fit of ln (r D(r)) against r): the mass of the Yukawa that carries
// it; NaN if D changes sign on the radii given
export function yukawaRate(
  rs: readonly number[],
  ds: readonly number[],
): number {
  if (ds.some(d => !(d > 0))) {
    return NaN
  }

  return -linearFit({
    xs: [...rs],
    ys: ds.map((d, i) => Math.log(rs[i]! * d)),
  }).slope
}
