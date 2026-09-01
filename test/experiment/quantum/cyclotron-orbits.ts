// AUDIT 2026-08-31: regraded from L3 to L2. this experiment runs a hand-written 2D square-lattice coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph.
// Cyclotron confinement emerges from a 2D coined walk in a synthetic magnetic field. A charged particle
// in a magnetic field does not escape, it orbits: the field bends its velocity into a closed loop of
// radius the cyclotron radius, which SHRINKS as the field grows. Here the field is a Peierls phase on
// the walk's y-hops (Landau gauge, a y-hop at column x carries phase B x), and a momentum packet
// launched on the 2D walk is trapped: its transverse extent stays BOUNDED and time-independent (a
// closed orbit), and the orbit radius scales as 1 / B. With no field the same packet flies straight and
// its transverse extent grows without bound. This is a two-dimensional walk, closer to the genuinely 2D
// substrate than the 1D single-particle sector.
//
// - PREDICTION 1 (confinement): with a field the transverse span is BOUNDED and time-independent (the
//   span at 600 steps equals the span at 200 steps to within five percent, for every field), a closed
//   orbit, not a spreading cloud.
// - PREDICTION 2 (radius ~ 1 / B): the orbit radius scales inversely with the field, so amplitude times
//   field is a constant (to within twelve percent across fields 0.10..0.20) and the amplitude halves as
//   the field doubles.
// - CONTROL: with NO field the walk flies straight (ballistic), so its transverse span keeps growing
//   with time and reaches many times the largest orbit. The confinement is the field, not an artefact.
//
// Depth L3. Cyclotron confinement is a MEASURED consequence of the 2D coined walk in a synthetic
// magnetic field (not a built Landau state, not an imported cyclotron formula), with a bounded orbit
// whose radius scales as 1 / B as a quantitative could-be-wrong law and the zero-field ballistic walk as
// the control. The cyclotron FREQUENCY is deliberately not asserted: on this lattice it is contaminated
// by harmonics and band curvature, so only the robust confinement and radius law are claimed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { transverseSpan } from '@/code/dynamics/magnetic-walk-2d'

const SIZE = 240
const COIN = Math.PI / 2
const MOMENTUM = 0.9
const FIELDS = [0.1, 0.12, 0.14, 0.16, 0.18, 0.2]
const STEPS_SHORT = 200
const STEPS_LONG = 600

function span(field: number, steps: number): number {
  return transverseSpan({
    size: SIZE,
    steps,
    field,
    coinAngle: COIN,
    momentum: MOMENTUM,
  })
}

export default experiment({
  id: 'quantum/cyclotron-orbits',
  code: 'E-QTM-0078',
  title:
    'cyclotron confinement from a 2D coined walk in a synthetic magnetic field: the field traps a momentum packet in a bounded orbit (transverse span time-independent to within five percent) whose radius scales as 1 / B (amplitude times field constant to within twelve percent across fields 0.10 to 0.20, amplitude halving as the field doubles), while a zero field flies straight (ballistic, unbounded)',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // PREDICTION 1: the orbit is bounded (span time-independent) for every field
    const amplitudes: number[] = []

    let worstBoundError = 0

    for (const field of FIELDS) {
      const short = span(field, STEPS_SHORT)
      const long = span(field, STEPS_LONG)

      amplitudes.push(long)
      worstBoundError = Math.max(
        worstBoundError,
        Math.abs(long / short - 1),
      )
    }

    const orbitBounded = worstBoundError < 0.05

    // PREDICTION 2: radius ~ 1 / B (amplitude * field constant, amplitude halves as field doubles)
    const radii = FIELDS.map((field, i) => amplitudes[i]! * field)
    const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length
    const worstRadiusError = Math.max(
      ...radii.map(r => Math.abs(r / meanRadius - 1)),
    )

    const radiusInverseField = worstRadiusError < 0.12
    const halvingRatio =
      amplitudes[0]! / amplitudes[amplitudes.length - 1]! // amp(0.1)/amp(0.2)

    const amplitudeHalves = halvingRatio > 1.8 && halvingRatio < 2.3

    // CONTROL: zero field flies straight (ballistic), span grows with time and dwarfs any orbit
    const ballisticShort = span(0, 150) // 150 steps: escaped far, still not wrapped (L/2 = 120)
    const ballisticShorter = span(0, 75) // 75 steps
    const ballisticGrows = ballisticShort > 1.6 * ballisticShorter
    const largestOrbit = Math.max(...amplitudes)
    const dwarfsOrbit = ballisticShort > 4 * largestOrbit

    const ok =
      orbitBounded &&
      radiusInverseField &&
      amplitudeHalves &&
      ballisticGrows &&
      dwarfsOrbit

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a momentum packet on the 2D coined walk in a synthetic magnetic field is trapped in a bounded orbit (transverse span time-independent to within five percent) whose radius scales as 1 / B (amplitude times field constant to within twelve percent, amplitude halving as the field doubles), while a zero field flies straight with a growing transverse span more than four times the largest orbit, so cyclotron confinement is an emergent consequence of the 2D walk in the field',
      metrics: {
        worstBoundError: Number(worstBoundError.toExponential(2)),
        cyclotronRadiusTimesField: Number(meanRadius.toFixed(3)),
        worstRadiusError: Number(worstRadiusError.toExponential(2)),
        amplitudeHalvingRatio: Number(halvingRatio.toFixed(3)),
      },
      // CONTROL: with no field the walk flies straight (ballistic, span grows and dwarfs the orbit).
      control: {
        ballisticSpan150: Number(ballisticShort.toFixed(2)),
        ballisticSpan75: Number(ballisticShorter.toFixed(2)),
        spanOverLargestOrbit: Number(
          (ballisticShort / largestOrbit).toFixed(2),
        ),
      },
      notes:
        'AUDIT 2026-08-31: this experiment runs a hand-written 2D square-lattice coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph. ' +
        'Cyclotron confinement measured on a 2D coined walk in a synthetic magnetic field (code/dynamics/magnetic-walk-2d): with a field the transverse span is time-independent (bounded orbit) and the radius scales as 1 / B (amplitude halves as the field doubles), the zero-field control flies straight. The frequency is not claimed (harmonic/band-curvature contaminated). A 2D walk, closer to the real substrate. L3, a quantitative could-be-wrong law with a control that shows the confinement vanish.',
    })
  },
})
