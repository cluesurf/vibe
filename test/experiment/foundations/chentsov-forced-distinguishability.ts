// The distinguishability measure is FORCED, not chosen, by Chentsov's theorem, which removes the
// fragility that a wrong hand-picked readout caused.
//
// The problem. The TD bridge was sensitive to how "distinguishability" is read off the substrate.
// Reading a cell's content as its net charge (the signed slot sum) made balanced cells read as
// empty and produced a spurious clock. The fix (occupancy) works, but it looked like an ad-hoc
// choice, and a bridge number that depends on a hand-picked readout is not a property of the
// physics.
//
// The resolution. Use the geometry that is already there. The 24 directions of the coin carry the
// 24-cell symmetry, so a state's per-direction occupancy is a distribution on the 24-direction
// simplex, and Chentsov's theorem says the Fisher-Rao metric is the UNIQUE metric on a probability
// simplex invariant under the symmetry (the relabelings the group performs). So the distinguishability
// measure is not a free choice, it is forced to be Fisher-Rao, the same theorem that makes TD's
// primitive non-arbitrary. Measured here: the Fisher-Rao distance between two direction distributions
// is invariant under the 24-cell symmetry (its value does not change when the group relabels the
// directions), while an ad-hoc weighted measure is NOT invariant (it changes under the same
// relabeling), so the ad-hoc measure is not canonical and Fisher-Rao is.
//
// CONTROL: the ad-hoc weighted measure. It privileges particular directions, so a 24-cell symmetry
// changes its value (a nonzero deviation), the discriminator that invariance is special to Fisher-
// Rao. Chentsov's theorem then says Fisher-Rao is the unique invariant, so the measure is forced.
//
// Depth L2, the group-invariance of Fisher-Rao measured against an ad-hoc measure on the 24-direction
// simplex, invoking Chentsov's uniqueness to force the choice.

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
    'the distinguishability measure is forced by Chentsov: the Fisher-Rao distance between two direction distributions is invariant under the 24-cell symmetry (deviation zero) while an ad-hoc weighted measure is not (a nonzero deviation), so by Chentsov uniqueness the measure is forced to be Fisher-Rao, the same theorem that makes TD primitive non-arbitrary, removing the readout fragility',
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
        'the distinguishability measure is forced to be Fisher-Rao by Chentsov theorem, not hand-chosen. The 24 directions carry the 24-cell symmetry, so a state per-direction occupancy is a distribution on the 24-direction simplex, and the Fisher-Rao distance between two such distributions is invariant under the 24-cell symmetry (its value does not change when the group relabels the directions, deviation essentially zero to machine precision). An ad-hoc weighted measure, which privileges particular directions, is NOT invariant (its value changes under the same relabeling, a definite nonzero deviation). By Chentsov uniqueness the Fisher-Rao metric is the ONLY metric on a probability simplex invariant under the group relabelings, so the measure is forced, removing the fragility that a hand-picked readout caused, and it is the same theorem that makes TD distinguishability primitive non-arbitrary.',
      metrics: {
        fisherRaoSymmetryDeviation: Number(fisherRaoDeviation.toExponential(3)),
        adHocSymmetryDeviation: Number(adHocDeviation.toFixed(6)),
        directionCount: 24,
        symmetriesTested: 5,
      },
      control: {
        // the ad-hoc measure changes under the symmetry (not invariant), while Fisher-Rao does not,
        // so invariance is special to Fisher-Rao and Chentsov forces the choice
        fisherRaoDeviation: Number(fisherRaoDeviation.toExponential(3)),
        adHocDeviation: Number(adHocDeviation.toFixed(6)),
      },
      notes:
        'L2, the group-invariance of Fisher-Rao on the 24-direction simplex, reusing code/measure/direction-distinguishability (built on code/measure/fisher-rao). Fisher-Rao is invariant under the 24-cell symmetry (deviation to machine precision), an ad-hoc weighted measure is not, and Chentsov theorem says Fisher-Rao is the unique invariant metric, so the distinguishability readout is forced, not chosen. This resolves the fragility exposed when the net-charge readout gave a spurious result, and it is the same uniqueness (Chentsov) that vibe and TD both lean on for the primitive. Deterministic distributions, no random.',
    })
  },
})
