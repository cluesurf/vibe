// The distinguishability measure is FORCED, not chosen, by Chentsov's theorem, which removes the
// fragility that a wrong hand-picked readout caused.
//
// The problem. The TD bridge was sensitive to how "distinguishability" is read off the substrate.
// Reading a cell's content as its net charge (the signed slot sum) made balanced cells read as
// empty and produced a spurious clock. The fix (occupancy) works, but it looked like an ad-hoc
// choice, and a bridge number that depends on a hand-picked readout is not a property of the
// physics.
//
// The resolution, in two honestly separated parts. The MEASURED part, the necessary condition: a
// legitimate distinguishability must be invariant under the 24-cell symmetry (the group's
// relabelings of the 24 directions), and Fisher-Rao satisfies this exactly (deviation at machine
// precision) while a direction-weighted ad-hoc measure fails it (a definite nonzero deviation).
// This alone kills the fragile hand-weighted readouts. The CITED part, the uniqueness: relabeling
// invariance alone does not single out Fisher-Rao (the unweighted L1 is also relabeling-invariant),
// Chentsov's theorem does, under its full hypothesis, invariance under every sufficiency-preserving
// Markov embedding between simplexes, of which the relabelings measured here are the special case
// living on one simplex. So the measure is forced by necessity (measured) plus Chentsov (cited),
// the same theorem that makes TD's primitive non-arbitrary.
//
// CONTROL: the ad-hoc weighted measure. It privileges particular directions, so a 24-cell symmetry
// changes its value (a nonzero deviation), the discriminator that the necessary condition has
// teeth. The uniqueness on top is Chentsov's theorem, cited, not re-proven here.
//
// Depth L2, the group-invariance necessary condition measured against an ad-hoc measure on the
// 24-direction simplex, with Chentsov's uniqueness cited for the rest.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  normalizeDistribution,
  fisherRaoSymmetryDeviation,
  adHocSymmetryDeviation,
} from '@/code/measure/direction-distinguishability'

export default experiment({
  id: 'foundations/chentsov-forced-distinguishability',
  code: 'E-FND-0057',
  title:
    'the distinguishability readout is pinned in two honest parts: the measured necessary condition (24-cell relabeling invariance, which Fisher-Rao passes at machine precision and any direction-weighted ad-hoc measure fails) plus Chentsov uniqueness under the full Markov-embedding class (cited, not re-proven), so the fragile hand-weighted readouts are killed by measurement and Fisher-Rao is singled out by the theorem',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // two deterministic distributions over the 24 directions (per-direction occupancy patterns)
    const p = normalizeDistribution(
      Array.from({ length: 24 }, (_, i) => (i % 3) + 1),
    )

    const q = normalizeDistribution(
      Array.from({ length: 24 }, (_, i) => ((i * 2) % 5) + 1),
    )

    // Fisher-Rao is invariant under the 24-cell symmetry (deviation essentially zero)
    const fisherRaoDeviation = fisherRaoSymmetryDeviation({ p, q })
    const fisherRaoInvariant = fisherRaoDeviation < 1e-12

    // an ad-hoc weighted measure is NOT invariant (a nonzero deviation under the same symmetry)
    const weights = Array.from({ length: 24 }, (_, i) => i + 1)
    const adHocDeviation = adHocSymmetryDeviation({ p, q, weights })
    const adHocNotInvariant = adHocDeviation > 1e-6

    const solved = fisherRaoInvariant && adHocNotInvariant

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the distinguishability readout is pinned in two honestly separated parts. Measured, the necessary condition: any legitimate readout must be invariant under the 24-cell symmetry relabeling of the directions, and the Fisher-Rao distance passes at machine precision while a direction-weighted ad-hoc measure fails with a definite nonzero deviation, which alone kills the fragile hand-weighted readouts. Cited, the uniqueness: relabeling invariance does not by itself single out Fisher-Rao (the unweighted L1 also passes it), Chentsov theorem does, under its full hypothesis of invariance under every sufficiency-preserving Markov embedding between simplexes, of which the relabelings measured here are the one-simplex special case. So the measure is forced by the measured necessity plus the cited theorem, the same theorem that makes TD distinguishability primitive non-arbitrary, and the fragility a hand-picked readout caused is removed.',
      metrics: {
        fisherRaoSymmetryDeviation: Number(
          fisherRaoDeviation.toExponential(3),
        ),
        adHocSymmetryDeviation: Number(adHocDeviation.toFixed(6)),
        directionCount: 24,
        symmetriesTested: 5,
      },
      control: {
        // the ad-hoc measure changes under the symmetry (not invariant) while Fisher-Rao does not,
        // so the necessary condition has teeth; the uniqueness on top is Chentsov, cited
        fisherRaoDeviation: Number(fisherRaoDeviation.toExponential(3)),
        adHocDeviation: Number(adHocDeviation.toFixed(6)),
      },
      notes:
        'L2, the relabeling-invariance necessary condition measured on the 24-direction simplex, reusing code/measure/direction-distinguishability (built on code/measure/fisher-rao). The honest split, after the audit: what is MEASURED is that Fisher-Rao is invariant under the 24-cell relabelings (deviation at machine precision) and a direction-weighted ad-hoc measure is not, which is a necessary-condition test that kills hand-weighted readouts. What is CITED is Chentsov uniqueness, whose hypothesis is the larger class of sufficiency-preserving Markov embeddings, since relabeling invariance alone is also satisfied by the unweighted L1 and so cannot force Fisher-Rao by itself. This resolves the fragility exposed when the net-charge readout gave a spurious result, with the claim now stated at exactly the strength the measurement supports. Deterministic distributions, no random.',
    })
  },
})
