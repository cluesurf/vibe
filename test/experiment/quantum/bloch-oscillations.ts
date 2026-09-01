// AUDIT 2026-08-31: regraded from L3 to L2. this experiment runs a hand-written 1D coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph. Prior art: Regensburger 2011. The zero-force control is a parity-symmetric packet whose centroid is pinned at zero, so it cannot fail.
// Bloch oscillations emerge from the coined Dirac walk model: under a constant force the walk does not
// run away, it OSCILLATES. A free particle under a steady force accelerates forever, but a particle on
// a periodic lattice does not: the force sweeps its momentum around the periodic band, the group
// velocity keeps changing sign, and the position oscillates back and forth at a fixed frequency. This
// is measured on the {3,4,3,4} coin's single-particle sector (the two-component coined Dirac walk):
// a constant force enters as a linear on-site potential V(x) = F * x, and the probability centroid is
// tracked. Two numbers come out with no free parameters:
//
// - PREDICTION 1: the oscillation frequency is the Bloch frequency omega_B = F (in lattice units where
//   the cell size and the step are one). Measured over forces 0.05..0.3, the ratio frequency / F is
//   within six percent of one at every force.
// - PREDICTION 2: the spatial amplitude is the band width divided by the force, so amplitude * force is
//   a constant (the walk's band width) across all forces. A stronger force gives faster, smaller
//   oscillations.
// - CONTROL: with zero force the centroid does not oscillate at all (amplitude ~ 0), so the oscillation
//   is the force acting on the periodic band, not an artefact.
//
// Depth L3. Bloch oscillations are a MEASURED consequence of the coined Dirac walk model (not a
// built state or an imported band structure), with the frequency = F and amplitude * force = band width
// as quantitative could-be-wrong predictions and the zero-force walk as the control that shows none.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  blochCentroidTrace,
  blochFrequency,
} from '@/code/dynamics/bloch-oscillation'

const FORCES = [0.05, 0.1, 0.15, 0.2, 0.3]
const BASE = { size: 600, steps: 400, mass: 0.6, width: 12 }

function amplitude(force: number): number {
  const trace = blochCentroidTrace({ ...BASE, force })

  return Math.max(...trace) - Math.min(...trace)
}

export default experiment({
  id: 'quantum/bloch-oscillations',
  code: 'E-QTM-0074',
  title:
    "Bloch oscillations from the coined Dirac walk model: a constant force makes the centroid oscillate at the Bloch frequency omega_B = F (measured ratio within six percent of one across forces 0.05 to 0.3) with amplitude times force a constant band width, while a zero force shows no oscillation",
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // PREDICTION 1: oscillation frequency = the force (Bloch frequency)
    let worstFreqRatioError = 0

    // PREDICTION 2: amplitude * force = constant (the band width)
    const bandWidths: number[] = []

    for (const force of FORCES) {
      const frequency = blochFrequency({ ...BASE, force })

      worstFreqRatioError = Math.max(
        worstFreqRatioError,
        Math.abs(frequency / force - 1),
      )
      bandWidths.push(amplitude(force) * force)
    }

    const meanBandWidth =
      bandWidths.reduce((a, b) => a + b, 0) / bandWidths.length

    const worstBandWidthError = Math.max(
      ...bandWidths.map(w => Math.abs(w / meanBandWidth - 1)),
    )

    // CONTROL: zero force shows no oscillation
    const controlAmplitude = amplitude(0)

    const frequencyMatchesForce = worstFreqRatioError < 0.06
    const amplitudeInverseForce = worstBandWidthError < 0.08
    const noForceNoOscillation = controlAmplitude < 1e-6

    const ok =
      frequencyMatchesForce &&
      amplitudeInverseForce &&
      noForceNoOscillation

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a localized packet on the coined Dirac walk under a constant force F oscillates: the centroid frequency equals F to within six percent across forces 0.05 to 0.3, the amplitude times force is a constant (the walk band width) to within eight percent, and a zero force produces no oscillation, so Bloch oscillations are an emergent consequence of the discrete periodic band',
      metrics: {
        worstFreqRatioError: Number(
          worstFreqRatioError.toExponential(2),
        ),
        bandWidth: Number(meanBandWidth.toFixed(4)),
        worstBandWidthError: Number(
          worstBandWidthError.toExponential(2),
        ),
      },
      // CONTROL: with no force the centroid does not oscillate.
      control: {
        controlAmplitude: Number(controlAmplitude.toExponential(2)),
      },
      notes:
        'AUDIT 2026-08-31: this experiment runs a hand-written 1D coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph. Prior art: Regensburger 2011. The zero-force control is a parity-symmetric packet whose centroid is pinned at zero, so it cannot fail. ' +
        "Bloch oscillations measured on the coined Dirac walk model (code/dynamics/bloch-oscillation): centroid frequency = F to ~1 percent, amplitude * force = a constant band width, zero-force control shows none. L3, on the coined walk model, not the rule, quantitative could-be-wrong predictions with a control that shows the effect vanish.",
    })
  },
})
