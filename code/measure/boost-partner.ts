// THE BOOST'S PARTNERS OF A BOUND LEVEL (a read of E-SPN-0206, from test/record/E-SPN-0206/run/spn-partner-part.ts). A bound level's band curvature at K = 0 has two parts: the members'
// own curvature, and the second-order coupling K . p of the level to the internal levels of the opposite parity (the
// T1u lines of an A1g level). A partner line just ABOVE the level pushes it down at K (heavier), one just BELOW pushes
// it up (lighter), each by its coupling squared over the gap. In the "matter as machine" picture these are the internal
// states a boost has to update: the level is light only when its boost partners are far from it.
//
// The partners are read without diagonalizing anything: the state y_K psi (the reference multiplied by its coordinate
// along the boost axis) is the leading part of the boost's image of psi, and on the little group's sector at K = 0 it
// lies in the partners' representation. Its autocorrelation, inverted into lines (register-reduced's referenceLines),
// gives every partner line near the level with its weight. The sum PULL = sum_n w_n / (E_n - E) over those lines is the
// sign and size of the second-order push: positive when the weight sits above the level (heavier).

import type { RState, Sector } from '@/code/measure/register-reduced'

const SITE = 256

// st multiplied, representative by representative, by the representative's coordinate on `axis` (0, 1 or 2); every
// element of a little group of an axis fixes that coordinate, so the product stays in the sector
export function axisMoment(s: Sector, st: RState, axis: number): RState {
  const re = new Float64Array(new SharedArrayBuffer(8 * st.re.length))
  const im = new Float64Array(new SharedArrayBuffer(8 * st.im.length))

  for (let i = 0; i < s.count; i++) {
    const x = s.reps[3 * i + axis]!

    for (let k = 0; k < SITE; k++) {
      re[i * SITE + k] = x * st.re[i * SITE + k]!
      im[i * SITE + k] = x * st.im[i * SITE + k]!
    }
  }

  return { re, im }
}

export type PartnerLine = { E: number; weight: number }

export type PartnerPull = {
  // sum of w / (E_n - E) over the lines, the weights normalized to the lines' total
  pull: number
  // the nearest line above and below, with their weights
  above: PartnerLine | null
  below: PartnerLine | null
  total: number
}

export function partnerPull(
  E: number,
  lines: readonly PartnerLine[],
  floor: number,
): PartnerPull {
  const used = lines.filter(l => l.weight >= floor && l.E !== E)
  const total = used.reduce((t, l) => t + l.weight, 0)
  const pull = used.reduce((t, l) => t + l.weight / total / (l.E - E), 0)
  const up = used.filter(l => l.E > E).sort((a, b) => a.E - b.E)
  const down = used.filter(l => l.E < E).sort((a, b) => b.E - a.E)

  return { pull, above: up[0] ?? null, below: down[0] ?? null, total }
}
