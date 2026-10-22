// A CLOCK OF TWO BOUND LEVELS OF THE REGISTER PAIR (E-SPN-0213, E-SPN-0214).
//
// The clock's rate is Delta E(K) = E_2(K) - E_1(K), and Delta E(K) / Delta E(0) = 1 - alpha K^2 with alpha = (a_1 -
// a_2) / (E_2 - E_1), a_i each level's K^2 coefficient. Relativity with one speed c*: alpha_SR = c*^2 / (2 E_1 E_2),
// positive (a moving clock ticks slower). The 2s partner of the tracked 1s-like level is a line of the identity read
// bound like hydrogen's 2s (scaled binding 2 mu a_B^2 (2M - E) in a band around 0.25), carrying real overlap with the
// hydrogenic reference, and isolated: at least twice the overlap of any other genuine line in the same band.

import type { Follow, LineOut, ZeroRead } from '@/code/measure/register-track'

export type ClockBands = {
  // the 2s binding band, the 2s line's least overlap, and how much it must exceed every other line in the band
  band: readonly [number, number]
  overlap: number
  isolation: number
}

export const CLOCK_BANDS: ClockBands = {
  band: [0.15, 0.5],
  overlap: 0.05,
  isolation: 2,
}

const genuine = (l: LineOut): boolean => Math.abs(l.modulus - 1) <= 1e-6

// the identity read's 2s-like line, or null when none is isolated
export function twoSLine(z: ZeroRead, b: ClockBands = CLOCK_BANDS): LineOut | null {
  const inBand = z.lines.filter(
    l => genuine(l) && l.scaled >= b.band[0] && l.scaled <= b.band[1],
  )
  const sorted = [...inBand].sort((x, y) => y.overlap - x.overlap)
  const top = sorted[0]
  const second = sorted[1]?.overlap ?? 0

  if (!top || top.overlap < b.overlap || top.overlap < b.isolation * second) {
    return null
  }

  return top
}

// THE CLOCK'S ERROR, TAKEN APART (E-SPN-0217). With R_n = 1 + eps_n, alpha / alpha_SR = (E_2 / R_1 - E_1 / R_2) /
// Delta E = 1 - eps_1 - Q + O(eps^2), Q = E_1 (eps_1 - eps_2) / Delta E. The static class (code/measure/darwin-exchange
// staticR, the pair held by an instantaneous pull: members' band, binding, no transverse light) already gives each level
// R_static,n = (2 tan m + (5/3) e_n) / (2m - e_n), e_n = (2 M0 - E_n) / 2 a beat, so its share of Q is
// Q_static = E_1 (R_static,1 - R_static,2) / Delta E, about (2/3) E_1 / m = 8/3 for any size: a level-dependent inertia
// the instantaneous pull cannot cancel. The Darwin exchange (the transverse light, darwinR) removes it at S = 1 (its
// continuum value): R_full,n = R_n + darwinR(S) - staticR. What is left, Q - Q_static, is the levels' lattice remainder.
export function clockDecomposition(input: {
  m: number
  M0: number
  E1: number
  E2: number
  R1: number
  R2: number
  S?: number
  cStar2?: number
}): { Qstatic: number; Qlattice: number; Q: number; ratio: number; ratioDarwin: number; R1full: number; R2full: number } {
  const { m, M0, E1, E2, R1, R2 } = input
  const S = input.S ?? 1
  const dE = E2 - E1
  const e1 = (2 * M0 - E1) / 2
  const e2 = (2 * M0 - E2) / 2
  const s1 = (2 * Math.tan(m) + (5 / 3) * e1) / (2 * m - e1)
  const s2 = (2 * Math.tan(m) + (5 / 3) * e2) / (2 * m - e2)
  const d1 = (2 * Math.tan(m) + (5 / 3) * e1 - (8 / 3) * e1 * S) / (2 * m - e1)
  const d2 = (2 * Math.tan(m) + (5 / 3) * e2 - (8 / 3) * e2 * S) / (2 * m - e2)
  const R1full = R1 + d1 - s1
  const R2full = R2 + d2 - s2
  const Q = (E1 * (R1 - R2)) / dE
  const Qstatic = (E1 * (s1 - s2)) / dE

  return {
    Qstatic,
    Qlattice: Q - Qstatic,
    Q,
    ratio: (E2 / R1 - E1 / R2) / dE,
    ratioDarwin: (E2 / R1full - E1 / R2full) / dE,
    R1full,
    R2full,
  }
}

export function clockOf(
  lo: Follow,
  hi: Follow,
  cStar2 = 0.5,
): { alpha: number; alphaSR: number; ratio: number } {
  const [a, c] = lo.E < hi.E ? [lo, hi] : [hi, lo]
  const alpha = (a.a - c.a) / (c.E - a.E)
  const alphaSR = cStar2 / (2 * a.E * c.E)

  return { alpha, alphaSR, ratio: alpha / alphaSR }
}
