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
// So under the nearest-neighbour scale reading, the intra-generation (self, diagonal) scale is
// the long root and the inter-generation (coupling, off-diagonal) scale is the short root. The
// mass operator's diagonal a is a self term (within-sector) and its coupling |c| is a between
// term (between-sector), so |c| / a = 1 / sqrt(2) is SELECTED by the nearest-neighbour scale
// reading. And that gives Q = 2/3 (E-FRC-0061). The free assignment of E-FRC-0061 becomes a
// named scale-reading choice, exercised against the alternative pairings as controls.
//
// HONEST scope, the residual assumptions stated plainly:
//   - The NEAREST-NEIGHBOUR scale reading is the LOAD-BEARING input. The within-sector
//     differences are {sqrt(2), 2} and the between-sector are {1, sqrt(3)}, so taking the
//     minimal (nearest-neighbour) scale gives the long and short roots and the ratio
//     1/sqrt(2). This is the standard tight-binding choice (on-site self, nearest-neighbour
//     coupling), but it is a choice: the max-based (farthest) pairing gives a ratio sqrt(3)/2
//     and Q = 5/6, wrong, computed here as an in-experiment control so the choice is
//     exercised, not just flagged.
//   - It rests on identifying the three triality sectors with three generations, which is
//     Boyle's conjecture and is OPEN (E-SPN-0016). So the campaign has traded a free assignment
//     for this identification plus the nearest-neighbour choice, which is genuine progress but
//     not a first-principles derivation from nothing.
//
// The net: the Koide relation Q = 2/3 now follows from the triality-sector structure of the
// 24-cell (nearest-neighbour within-sector = long, between-sector = short) plus the octonion
// chirality, with the residual assumptions being the sector-to-generation identification and
// the nearest-neighbour scale reading. The one free assignment of E-FRC-0061 is replaced by
// that named, control-tested choice.
//
// Grade L1: the within/between nearest-neighbour scales are exact geometry (Tier A), the
// selected |c|/a = 1/sqrt(2) and Q = 2/3 follow (Tier A), the identification of diagonal-with-
// within and coupling-with-between is natural (Tier B), and the residual assumptions are
// labelled. Controls: the between scale is genuinely shorter than the within scale, and the
// alternative max-based pairing gives Q = 5/6, wrong, so the nearest-neighbour choice is doing
// real work.

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
function nearestNeighbour(
  a: number[][],
  b: number[][],
  same: boolean,
): number {
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

// the farthest (maximal) difference norm within or between sectors, the alternative
// scale pairing used as a control
function farthestNeighbour(
  a: number[][],
  b: number[][],
  same: boolean,
): number {
  let max = 0

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (same && i === j) {
        continue
      }

      const d = norm(a[i]!.map((x, k) => x - b[j]![k]!))

      if (d > max) {
        max = d
      }
    }
  }

  return max
}

// Koide Q from a coupling ratio |c|/a via Q = 1/3 + (2 |c|/a)^2 / 6
function koideQFromRatio(couplingRatio: number): number {
  const bOverA = 2 * couplingRatio

  return 1 / 3 + (bOverA * bOverA) / 6
}

export default experiment({
  id: 'gauge/koide-assignment-from-sectors',
  code: 'E-FRC-0062',
  title:
    'the Koide assignment is grounded in the triality-sector geometry: within a sector the nearest-neighbour scale is the long root sqrt(2) and between sectors it is the short root 1, so the mass-operator ratio |c|/a = 1/sqrt(2) hence Q = 2/3 is selected by the nearest-neighbour scale reading, with the alternative pairings as controls giving wrong Q (max-based gives 5/6), resting on the sector-to-generation identification (Boyle) and the load-bearing nearest-neighbour choice',
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

    // the selected coupling ratio and the resulting Koide Q
    const couplingRatio = betweenScale / withinScale
    const bOverA = 2 * couplingRatio
    const Q = koideQFromRatio(couplingRatio)

    // the alternative (max-based) scale pairing, the control: farthest within-sector
    // scale 2 and farthest between-sector scale sqrt(3) give ratio sqrt(3)/2 and Q = 5/6
    const maxWithinScale = Math.max(
      farthestNeighbour(v, v, true),
      farthestNeighbour(s, s, true),
      farthestNeighbour(c, c, true),
    )

    const maxBetweenScale = Math.max(
      farthestNeighbour(v, s, false),
      farthestNeighbour(v, c, false),
      farthestNeighbour(s, c, false),
    )

    const maxCouplingRatio = maxBetweenScale / maxWithinScale
    const qMaxPairing = koideQFromRatio(maxCouplingRatio)

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

    // 3. so the nearest-neighbour reading selects the ratio 1/sqrt(2) and Q comes out 2/3.
    const ratioSelected =
      Math.abs(couplingRatio - 1 / Math.SQRT2) < 1e-9

    const qIsTwoThirds = Math.abs(Q - 2 / 3) < 1e-9

    // 4. the control: the alternative max-based pairing gives a wrong Q (5/6), so the
    //    nearest-neighbour choice is exercised, not just asserted.
    const altPairingWrong =
      Math.abs(qMaxPairing - 5 / 6) < 1e-9 &&
      Math.abs(qMaxPairing - 2 / 3) > 0.1

    const solved =
      withinIsLong &&
      betweenIsShort &&
      ratioSelected &&
      qIsTwoThirds &&
      altPairingWrong

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the three triality sectors of the 24-cell have within-sector nearest-neighbour scale equal to the long root sqrt(2) and between-sector nearest-neighbour scale equal to the short root 1, so a mass operator with diagonal at the within-sector self scale and coupling at the between-sector scale has |c|/a = 1/sqrt(2) selected by the nearest-neighbour scale reading, giving Q = 2/3, where the alternative max-based pairing (farthest scales 2 and sqrt(3)) gives Q = 5/6, wrong, computed as an in-experiment control, so the nearest-neighbour choice is the load-bearing input, exercised rather than just flagged, alongside the identification of the three sectors with three generations (Boyle, open)',
      metrics: {
        withinScale: Number(withinScale.toFixed(6)),
        betweenScale: Number(betweenScale.toFixed(6)),
        couplingRatio: Number(couplingRatio.toFixed(6)),
        oneOverSqrt2: Number((1 / Math.SQRT2).toFixed(6)),
        bOverA: Number(bOverA.toFixed(6)),
        Q: Number(Q.toFixed(6)),
        maxWithinScale: Number(maxWithinScale.toFixed(6)),
        maxBetweenScale: Number(maxBetweenScale.toFixed(6)),
        qMaxPairingControl: Number(qMaxPairing.toFixed(6)),
      },
      control: {
        // the between-sector scale (1) is strictly shorter than the within-sector scale
        // (sqrt2), so the coupling is genuinely smaller than the self term, the physically
        // sensible ordering. And the alternative max-based scale pairing (farthest within 2,
        // farthest between sqrt(3)) gives Q = 5/6, far from 2/3, so the nearest-neighbour
        // reading is doing real work: a different pairing choice gives a wrong Q.
        betweenShorterThanWithin:
          betweenScale < withinScale - 1e-9 ? 1 : 0,
        withinScale: Number(withinScale.toFixed(6)),
        betweenScale: Number(betweenScale.toFixed(6)),
        qMaxPairingControl: Number(qMaxPairing.toFixed(6)),
      },
      notes:
        'L1. Tier A: the within-sector and between-sector nearest-neighbour scales ARE the long root sqrt(2) and the short root 1, computed, so |c|/a = 1/sqrt(2) and Q = 2/3 follow under the nearest-neighbour scale reading, which replaces the free assignment of E-FRC-0061 with a named choice. The nearest-neighbour choice is the LOAD-BEARING input: within-sector norms are {sqrt(2), 2} and between-sector are {1, sqrt(3)}, taking the minimal gives the roots and the ratio (the standard tight-binding choice), while the max-based pairing gives ratio sqrt(3)/2 and Q = 5/6, wrong, computed here as an in-experiment control so the choice is exercised. Second residual assumption: the identification of the three triality sectors with three generations, Boyle conjecture, open (E-SPN-0016). Net: the Koide relation follows from the 24-cell triality-sector structure plus octonion chirality, with the residual being Boyle and the load-bearing nearest-neighbour reading. The phase delta = 2/9 and the absolute scale remain free.',
    })
  },
})
