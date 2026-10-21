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
