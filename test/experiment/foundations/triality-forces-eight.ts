// Triality forces dimension eight, independently of the maximal-differentiation premise.
//
// The from-nothing chain fixes the dimension at eight with two bounds. The CEILING (at most
// eight) is a theorem: past dimension eight the division tower gains zero divisors and
// reversibility fails. The FLOOR (eight rather than a smaller reversible rung, one, two, or
// four) was carried by a PREMISE, maximal differentiation, that the base realizes as much
// distinction as it reversibly can. This experiment replaces that premise with a second
// theorem, so the floor stops resting on a choice.
//
// The theorem: TRIALITY, the order-three symmetry of a Dynkin diagram (the S3 permuting the
// three eight-dimensional representations 8v, 8s, 8c, the vector and the two spinors, which is
// what a three-generation matter content needs), occurs at EXACTLY ONE dimension. Among the
// D_n family (the integer-native crystallographic lattices, the D-series that the 24-cell
// selection already lands in), only D4 has an order-three diagram symmetry. Every other D_n
// has only a Z2 (order two, no order-three element), and the A-series (the simplex family)
// likewise has only Z2. D4 is so(8), whose vector dimension is 2n = 8. So the dimension that
// carries triality is eight, and nothing smaller does, which floors the dimension at eight
// without appeal to maximal differentiation.
//
// So dimension eight is now pinched from BOTH ends by theorems: the reversibility ceiling from
// above (zero divisors appear past eight) and the triality floor from below (triality, and the
// three generations, appear only at eight). The maximal-differentiation premise is no longer
// load-bearing for the eight.
//
// CONTROLS, both run. The triality filter must reject: every D_n with n not four returns outer
// order two (no triality), shown across n = 5, 6, 7, 8, and the A-series (the 5-cell's A4)
// returns order two as well, so triality is genuinely unique to D4 and the eight is not free.
//
// Grade L1: a known group-theory fact (Out(D4) = S3 of order six, unique among simple types)
// confirmed by exhaustive computation, here used to force the floor of the dimension.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  hasTriality,
  dynkinAutomorphismOrder,
} from '@/code/measure/base-forcing'
import { outerAutomorphismOrder } from '@/code/algebra/group/automorphism'
import { rootsDn, rootsAn } from '@/code/algebra/group/root-system'

// the D_n family swept over rank, with n >= 4 where the diagram is a proper D-series diagram
const RANKS = [4, 5, 6, 7, 8]

export default experiment({
  id: 'foundations/triality-forces-eight',
  code: 'E-FND-0050',
  title:
    'triality forces the dimension floor at eight independently of maximal differentiation: among the D_n family only D4 (so(8), vector dimension eight) carries the order-three triality that the three generations need, while every other D_n and the A-series have only a Z2, so eight is pinched from both ends by theorems (the reversibility ceiling above, the triality floor below)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // the diagram automorphism order across the D_n family (the graph automorphism of the
    // Dynkin diagram), and which ranks carry triality (an order-three symmetry)
    const sweep = RANKS.map(n => ({
      rank: n,
      vectorDimension: 2 * n,
      diagramOrder: dynkinAutomorphismOrder(n),
      triality: hasTriality(n),
    }))

    const trialityRanks = sweep.filter(s => s.triality)

    // 1. exactly one rank carries triality, it is D4, and its vector dimension is eight
    const trialityIsUnique = trialityRanks.length === 1
    const trialityAtFour =
      trialityIsUnique && trialityRanks[0]!.rank === 4

    const trialityDimensionIsEight =
      trialityAtFour && trialityRanks[0]!.vectorDimension === 8

    // 2. rigorous cross-check by the root-system outer automorphism (|Aut| / |Weyl|), a second
    // independent method: D4 gives six (the S3 triality), D5 gives two. And the low degenerate
    // ranks, which the diagram sweep cannot reach (the D2 and D3 diagrams are A1 x A1 and A3),
    // are COMPUTED here too, closing the gap: both give order two, no order-three element, so
    // the smaller lossless dimensions four and six carry no triality either.
    const d2OuterOrder = outerAutomorphismOrder(rootsDn(2))
    const d3OuterOrder = outerAutomorphismOrder(rootsDn(3))
    const d4OuterOrder = outerAutomorphismOrder(rootsDn(4))
    const d5OuterOrder = outerAutomorphismOrder(rootsDn(5))
    const rigorousAgrees =
      d2OuterOrder === 2 &&
      d3OuterOrder === 2 &&
      d4OuterOrder === 6 &&
      d5OuterOrder === 2

    // 3. controls: every other D_n has order two (no triality), and the A-series (the 5-cell's
    // A4) likewise has order two, so triality is unique to D4, the eight is not free
    const otherDnAllTwo = sweep
      .filter(s => s.rank !== 4)
      .every(s => s.diagramOrder === 2 && !s.triality)

    const aSeriesNoTriality = outerAutomorphismOrder(rootsAn(5)) === 2

    // 4. the pinch: the ceiling (reversibility caps at eight, established in the ladder) and
    // this triality floor meet at eight, so the eight no longer rests on maximal differentiation
    const flooredAtEightByTriality = trialityDimensionIsEight

    const solved =
      trialityAtFour &&
      trialityDimensionIsEight &&
      rigorousAgrees &&
      otherDnAllTwo &&
      aSeriesNoTriality &&
      flooredAtEightByTriality

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'triality, the order-three Dynkin symmetry that permutes the three eight-dimensional representations 8v, 8s, 8c (the vector and the two spinors the three generations need), occurs at exactly one dimension. Sweeping the D_n family, only D4 has an order-three diagram symmetry (diagram order six, the S3), and every other D_n (n = 5, 6, 7, 8) and the A-series have only a Z2 of order two. D4 is so(8), whose vector dimension is eight, so the dimension carrying triality is eight and nothing smaller. This floors the dimension at eight WITHOUT the maximal-differentiation premise, and with the reversibility ceiling (zero divisors past eight) it pinches the dimension to eight from both ends by theorems. The root-system outer automorphism (|Aut| over |Weyl|) confirms it independently, six for D4 and two for D5.',
      metrics: {
        rankCount: sweep.length,
        trialityRankCount: trialityRanks.length,
        trialityRank: trialityRanks[0]?.rank ?? 0,
        trialityVectorDimension: trialityRanks[0]?.vectorDimension ?? 0,
        d4DiagramOrder: dynkinAutomorphismOrder(4),
        d2OuterOrder,
        d3OuterOrder,
        d4OuterOrder,
        d5OuterOrder,
        aSeriesOuterOrder: outerAutomorphismOrder(rootsAn(5)),
      },
      control: {
        // every non-four D_n and the A-series lack triality, so the eight is forced, not free
        otherDnAllOrderTwo: otherDnAllTwo ? 1 : 0,
        d5OuterOrder,
        aSeriesOuterOrder: outerAutomorphismOrder(rootsAn(5)),
      },
      notes:
        'L1, the known fact Out(D4) = S3 (order six), unique among all simple Lie types, confirmed two ways: the Dynkin-diagram graph automorphism (dynkinAutomorphismOrder) and the rigorous root-system outer automorphism |Aut| over |Weyl| (outerAutomorphismOrder), which agree (six for D4, two for D5). The contribution is turning the floor of the from-nothing pinch into a theorem: dimension eight is the unique dimension carrying triality (the three generations 8v, 8s, 8c), so the floor stops resting on the maximal-differentiation premise. The eight here is the D4 vector dimension, the same eight as the octonion dimension. Reuses code/measure/base-forcing and code/algebra/group/automorphism, no new library.',
    })
  },
})
