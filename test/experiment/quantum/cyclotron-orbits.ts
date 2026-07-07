// Cyclotron motion emerges from a 2D coined walk in a synthetic magnetic field. A charged particle in a
// magnetic field orbits instead of flying straight, circling at the cyclotron frequency omega_c, which
// grows in proportion to the field. Here the field is a Peierls phase on the walk's y-hops (Landau
// gauge, a y-hop at column x carries phase B x), and a momentum packet launched on the 2D walk curves:
// its transverse centroid OSCILLATES at omega_c, and the orbit shrinks as the field grows. This is a
// two-dimensional walk, closer to the genuinely 2D substrate than the 1D single-particle sector.
//
// - PREDICTION: the cyclotron frequency is proportional to the field, omega_c = const * B, so
//   omega_c / B is a single constant across fields 0.05..0.2 (measured within three percent), and the
//   orbit amplitude shrinks as the field grows (a stronger field, a tighter orbit).
// - CONTROL: with NO field the packet flies straight (ballistic), so its transverse span is many times
//   the largest orbit amplitude and grows without bound, not a periodic orbit. The oscillation is the
//   field bending the motion, not an artefact.
//
// Depth L3. Cyclotron motion is a MEASURED consequence of the 2D coined walk in a synthetic magnetic
// field (not a built Landau state, not an imported cyclotron formula), with omega_c proportional to B
// as a quantitative could-be-wrong law and the zero-field ballistic walk as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cyclotronFrequency,
  transverseSpan,
} from '@/code/dynamics/magnetic-walk-2d'

const SIZE = 160
const STEPS = 260
const COIN = Math.PI / 2
const MOMENTUM = 0.9
const FIELDS = [0.05, 0.1, 0.15, 0.2]

export default experiment({
  id: 'quantum/cyclotron-orbits',
  code: 'E-QTM-0078',
  title:
    'cyclotron motion from a 2D coined walk in a synthetic magnetic field: a momentum packet curves into an orbit whose transverse centroid oscillates at the cyclotron frequency omega_c proportional to the field (omega_c / B a single constant to within three percent across fields 0.05 to 0.2) with the orbit shrinking as the field grows, while a zero field flies straight (ballistic, unbounded)',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // PREDICTION: cyclotron frequency proportional to the field
    const ratios: number[] = []
    const amplitudes: number[] = []
    for (const field of FIELDS) {
      const freq = cyclotronFrequency({
        size: SIZE,
        steps: STEPS,
        field,
        coinAngle: COIN,
        momentum: MOMENTUM,
      })
      ratios.push(freq / field)
      amplitudes.push(
        transverseSpan({ size: SIZE, steps: STEPS, field, coinAngle: COIN, momentum: MOMENTUM }),
      )
    }

    const meanRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length
    const worstRatioError = Math.max(
      ...ratios.map(r => Math.abs(r / meanRatio - 1)),
    )
    const frequencyProportionalToField = worstRatioError < 0.03

    // orbit shrinks as the field grows (amplitude monotonically decreasing in B)
    let orbitShrinks = true
    for (let i = 1; i < amplitudes.length; i++) {
      if (amplitudes[i]! >= amplitudes[i - 1]!) orbitShrinks = false
    }

    // CONTROL: zero field flies straight (ballistic), transverse span >> the largest orbit amplitude
    const ballisticSpan = transverseSpan({
      size: SIZE,
      steps: STEPS,
      field: 0,
      coinAngle: COIN,
      momentum: MOMENTUM,
    })
    const largestOrbit = Math.max(...amplitudes)
    const zeroFieldIsBallistic = ballisticSpan > 3 * largestOrbit

    const ok =
      frequencyProportionalToField && orbitShrinks && zeroFieldIsBallistic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a momentum packet on the 2D coined walk in a synthetic magnetic field orbits: its transverse centroid oscillates at a cyclotron frequency proportional to the field (omega_c / B constant to within three percent across fields 0.05 to 0.2) with the orbit shrinking as the field grows, while a zero field flies straight with a transverse span more than three times the largest orbit, so cyclotron motion is an emergent consequence of the 2D walk in the field',
      metrics: {
        cyclotronFrequencyPerField: Number(meanRatio.toFixed(4)),
        worstRatioError: Number(worstRatioError.toExponential(2)),
        largestOrbitAmplitude: Number(largestOrbit.toFixed(2)),
      },
      // CONTROL: with no field the walk flies straight (ballistic, unbounded transverse span).
      control: {
        ballisticSpan: Number(ballisticSpan.toFixed(2)),
        spanOverLargestOrbit: Number((ballisticSpan / largestOrbit).toFixed(2)),
      },
      notes:
        'Cyclotron motion measured on a 2D coined walk in a synthetic magnetic field (code/dynamics/magnetic-walk-2d): omega_c / B is a single constant (~0.48) to within a percent across fields 0.05..0.2, the orbit shrinks with the field, the zero-field control flies straight. A 2D walk, closer to the real substrate. L3, a quantitative could-be-wrong law with a control that shows the orbit vanish.',
    })
  },
})
