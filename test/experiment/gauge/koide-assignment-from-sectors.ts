// The root-to-mass campaign, phase four: grounding the one assignment E-FRC-0061 left as an
// input, in the triality-sector geometry. This removes the free assignment, at the cost of
// the (open) identification of the three sectors with three generations.
//
// E-FRC-0061 realized the Koide relation Q = 2/3 from a chiral octonion operator with diagonal
// at the long-root scale sqrt(2) and coupling at the short-root scale 1, but flagged that the
// assignment (diagonal = long, coupling = short) was a physically motivated INPUT, not forced.
// This grounds it.
//
// The three generations, on Boyle's identification, are the three triality sectors of the
// 24-cell: 8v (the unit vectors +-e_i), 8s and 8c (the half-integer vectors with an even and
// odd number of minus signs). Compute the natural distance scales:
//   - WITHIN a sector, the nearest-neighbour difference has norm sqrt(2), the LONG root.
//   - BETWEEN two sectors, the nearest-neighbour difference has norm 1, the SHORT root.
// So the intra-generation (self, diagonal) scale is intrinsically the long root, and the
// inter-generation (coupling, off-diagonal) scale is intrinsically the short root. The mass
// operator's diagonal a is a self term (within-sector, long) and its coupling |c| is a between
// term (between-sector, short), so |c| / a = 1 / sqrt(2) is FORCED by the sector geometry, not
// assigned. And that gives Q = 2/3 (E-FRC-0061). The assignment is removed.
//
// HONEST scope, the two residual assumptions stated plainly:
//   - It uses the NEAREST-NEIGHBOUR sector scale. The within-sector differences are {sqrt(2),
//     2} and the between-sector are {1, sqrt(3)}, so taking the minimal (nearest-neighbour)
//     scale gives the long and short roots and the ratio 1/sqrt(2). This is the standard
//     tight-binding choice (on-site self, nearest-neighbour coupling), but it is a choice, and
//     other scale pairings give other ratios. Flagged, not hidden.
//   - It rests on identifying the three triality sectors with three generations, which is
//     Boyle's conjecture and is OPEN (E-SPN-0016). So the campaign has traded a free assignment
//     for this identification plus the nearest-neighbour choice, which is genuine progress but
//     not a first-principles derivation from nothing.
//
// The net: the Koide relation Q = 2/3 now follows from the triality-sector structure of the
// 24-cell (nearest-neighbour within-sector = long, between-sector = short) plus the octonion
// chirality, with the residual assumptions being the sector-to-generation identification and
// the nearest-neighbour scale. The one free assignment of E-FRC-0061 is gone.
//
// Grade L1: the within/between nearest-neighbour scales are exact geometry (Tier A), the
// forced |c|/a = 1/sqrt(2) and Q = 2/3 follow (Tier A), the identification of diagonal-with-
// within and coupling-with-between is natural (Tier B), and the two residual assumptions are
// labelled. A control confirms the between scale is genuinely shorter than the within scale.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the three triality sectors of the 24-cell in the norm-1 realization
function sectors(): { v: number[][]; s: number[][]; c: number[][] } {
  const v: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (const sign of [1, -1]) {
      const x = [0, 0, 0, 0]
      x[i] = sign
      v.push(x)
    }
  }

  const s: number[][] = []
  const c: number[][] = []

  for (let mask = 0; mask < 16; mask++) {
    const x = [0, 1, 2, 3].map(i => ((mask >> i) & 1 ? -0.5 : 0.5))
    const minusCount = x.filter(t => t < 0).length

    if (minusCount % 2 === 0) {
      s.push(x)
    } else {
      c.push(x)
    }
  }

  return { v, s, c }
}

const norm = (a: number[]): number =>
  Math.sqrt(a.reduce((t, x) => t + x * x, 0))

// the nearest-neighbour (minimal nonzero) difference norm within or between sectors
function nearestNeighbour(a: number[][], b: number[][], same: boolean): number {
  let min = Infinity

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (same && i === j) {
        continue
      }

      const d = norm(a[i]!.map((x, k) => x - b[j]![k]!))

      if (d > 1e-9 && d < min) {
        min = d
      }
    }
  }

  return min
}

export default experiment({
  id: 'gauge/koide-assignment-from-sectors',
  code: 'E-FRC-0062',
  title:
    'the Koide assignment is grounded in the triality-sector geometry: within a sector the nearest-neighbour scale is the long root sqrt(2) and between sectors it is the short root 1, forcing the mass-operator ratio |c|/a = 1/sqrt(2) hence Q = 2/3 without a free assignment, resting now on the sector-to-generation identification (Boyle) and the nearest-neighbour choice',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const { v, s, c } = sectors()

    // within-sector nearest-neighbour scale (the self / diagonal scale)
    const withinV = nearestNeighbour(v, v, true)
    const withinS = nearestNeighbour(s, s, true)
    const withinC = nearestNeighbour(c, c, true)
    const withinScale = Math.max(withinV, withinS, withinC)

    // between-sector nearest-neighbour scale (the coupling / off-diagonal scale)
    const betweenVS = nearestNeighbour(v, s, false)
    const betweenVC = nearestNeighbour(v, c, false)
    const betweenSC = nearestNeighbour(s, c, false)
    const betweenScale = Math.max(betweenVS, betweenVC, betweenSC)

    // the forced coupling ratio and the resulting Koide Q
    const couplingRatio = betweenScale / withinScale
    const bOverA = 2 * couplingRatio
    const Q = 1 / 3 + (bOverA * bOverA) / 6

    // 1. within-sector nearest-neighbour scale is the long root sqrt(2) in all three sectors.
    const withinIsLong =
      Math.abs(withinV - Math.SQRT2) < 1e-9 &&
      Math.abs(withinS - Math.SQRT2) < 1e-9 &&
      Math.abs(withinC - Math.SQRT2) < 1e-9

    // 2. between-sector nearest-neighbour scale is the short root 1 in all three pairs.
    const betweenIsShort =
      Math.abs(betweenVS - 1) < 1e-9 &&
      Math.abs(betweenVC - 1) < 1e-9 &&
      Math.abs(betweenSC - 1) < 1e-9

    // 3. so the ratio is forced to 1/sqrt(2) and Q comes out 2/3.
    const ratioForced = Math.abs(couplingRatio - 1 / Math.SQRT2) < 1e-9
    const qIsTwoThirds = Math.abs(Q - 2 / 3) < 1e-9

    const solved =
      withinIsLong && betweenIsShort && ratioForced && qIsTwoThirds

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the three triality sectors of the 24-cell have within-sector nearest-neighbour scale equal to the long root sqrt(2) and between-sector nearest-neighbour scale equal to the short root 1, so a mass operator with diagonal at the within-sector self scale and coupling at the between-sector scale has |c|/a = 1/sqrt(2) FORCED by the sector geometry, giving Q = 2/3 without the free assignment E-FRC-0061 flagged, at the cost of two named assumptions: the nearest-neighbour scale choice (standard tight-binding, but a choice) and the identification of the three sectors with three generations (Boyle, open)',
      metrics: {
        withinScale: Number(withinScale.toFixed(6)),
        betweenScale: Number(betweenScale.toFixed(6)),
        couplingRatio: Number(couplingRatio.toFixed(6)),
        oneOverSqrt2: Number((1 / Math.SQRT2).toFixed(6)),
        bOverA: Number(bOverA.toFixed(6)),
        Q: Number(Q.toFixed(6)),
      },
      control: {
        // the between-sector scale (1) is strictly shorter than the within-sector scale
        // (sqrt2), so the coupling is genuinely smaller than the self term, the physically
        // sensible ordering, and it is forced by the geometry, not chosen. If within and
        // between had been equal, the ratio would be 1 and Q would not be 2/3.
        betweenShorterThanWithin: betweenScale < withinScale - 1e-9 ? 1 : 0,
        withinScale: Number(withinScale.toFixed(6)),
        betweenScale: Number(betweenScale.toFixed(6)),
      },
      notes:
        'L1. Tier A: the within-sector and between-sector nearest-neighbour scales ARE the long root sqrt(2) and the short root 1, computed, so |c|/a = 1/sqrt(2) and Q = 2/3 are forced by the sector geometry, removing the free assignment of E-FRC-0061. Two residual assumptions, both flagged: (1) the nearest-neighbour scale choice (within-sector norms are sqrt(2) and 2, between-sector are 1 and sqrt(3); taking the minimal gives the roots and the ratio, the standard tight-binding choice but a choice), and (2) the identification of the three triality sectors with three generations, Boyle conjecture, open (E-SPN-0016). Net: the Koide relation now follows from the 24-cell triality-sector structure plus octonion chirality, with the residual being Boyle and the nearest-neighbour choice, not a free assignment. The phase delta = 2/9 and the absolute scale remain free.',
    })
  },
})
