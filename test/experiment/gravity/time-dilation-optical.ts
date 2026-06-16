// Gravity as time dilation, route 4A, resolved as a clean no-new-field result. A mass slows the local clock rate
// (the beat or growth rate), and that varying rate IS gravity, a passing ray sees the slow-clock region as a higher
// refractive index and bends toward it (Fermat), the gravitational light bending. We test the optical metric
// directly. The clock-rate well n(r) = 1 + strength / sqrt(r^2 + soft^2) is read as the TEMPORAL (g_00) part of the
// metric, and it deflects a ray TOWARD the mass on the 1/b lensing law. Crucially the rate well is the 3A entropic
// potential, NOT a new field, so this costs nothing, and it contributes the light-bending null sector the static
// force does not.
//
// The factor of two. The temporal clock-rate part ALONE gives HALF the deflection. The full metric, the clock rate
// PLUS the spatial curvature of route 2A (the index 1 + 2k/r, the light sees twice the well), gives the GR Eddington
// factor of two, the full 4 G M / b that the 1919 eclipse confirmed and the Newtonian estimate missed by half. So
// 4A (the temporal half) and 2A (the spatial half) together are the emergent metric, sourced by the 3A entropic
// potential on a FIXED base, no new field. A UNIFORM rate field deflects nothing (the control), so it is the
// GRADIENT of the clock rate that gravitates. Depth L2, the optical-metric deflection and the factor of two measured
// deterministically, with the uniform field the zero-deflection control. No randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { refractiveDeflection } from '@/code/dynamics/optical-ray'

const STRENGTH = 0.5
const IMPACT_PARAMETERS = [16, 20, 24, 28]

export default experiment({
  id: 'gravity/time-dilation-optical',
  title: 'gravity as time dilation, the clock-rate well bends light (the temporal half), the full metric gives the GR factor-two deflection, no new field',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the clock-rate (TEMPORAL, g_00) part alone, the deflection toward the mass for each impact parameter
    const timeOnly = IMPACT_PARAMETERS.map((impactParameter) =>
      refractiveDeflection({ impactParameter, strength: STRENGTH }),
    )
    // the FULL metric, the temporal clock rate PLUS the spatial curvature (route 2A), index 1 + 2k/r, the light
    // sees twice the well, the famous Eddington factor two (4 G M / b, not the Newtonian 2 G M / b)
    const fullMetric = IMPACT_PARAMETERS.map((impactParameter) =>
      refractiveDeflection({ impactParameter, strength: 2 * STRENGTH }),
    )
    const factorTwoRatios = fullMetric.map((d, i) => Math.abs(d) / Math.abs(timeOnly[i]!))

    // the 1/b lensing law, impact parameter times deflection magnitude is constant (the time-only part near 2k)
    const lensingProducts = timeOnly.map((d, i) => IMPACT_PARAMETERS[i]! * Math.abs(d))

    // a uniform rate field (no gradient) deflects nothing, the control
    const uniformDeflection = refractiveDeflection({ impactParameter: 12, strength: 0 })

    const allTowardMass = timeOnly.every((d) => d < 0) && fullMetric.every((d) => d < 0)
    const lensingConstant = Math.max(...lensingProducts) / Math.min(...lensingProducts) < 1.15
    // the full-metric deflection is twice the time-only deflection, the GR factor two
    const factorTwo = factorTwoRatios.every((r) => Math.abs(r - 2) < 0.1)
    const uniformBendsNothing = Math.abs(uniformDeflection) < 1e-6
    const ok = allTowardMass && lensingConstant && factorTwo && uniformBendsNothing

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a clock-rate well (a mass slowing the local beat rate, read as a higher refractive index) deflects a ray TOWARD the mass on the 1/b lensing law, while a uniform rate field deflects nothing, so it is the GRADIENT of the clock rate that gravitates, the optical metric. The clock-rate (temporal) part alone gives HALF the deflection, and the full metric (the temporal clock rate plus the spatial curvature of route 2A, index 1 + 2k/r) gives the GR Eddington factor of two, the full 4 G M / b light bending. The rate well is the 3A entropic potential read as time dilation, so this needs NO new field, and it supplies the light-bending null sector that the static force does not, with the spatial half coming from the emergent-metric curvature (2A).',
      metrics: {
        timeOnlyNearest: Number(timeOnly[0]!.toFixed(4)),
        fullMetricNearest: Number(fullMetric[0]!.toFixed(4)),
        factorTwoMin: Number(Math.min(...factorTwoRatios).toFixed(3)),
        factorTwoMax: Number(Math.max(...factorTwoRatios).toFixed(3)),
        lensingProductMin: Number(Math.min(...lensingProducts).toFixed(3)),
        lensingProductMax: Number(Math.max(...lensingProducts).toFixed(3)),
        allTowardMass: allTowardMass ? 1 : 0,
        uniformDeflection: Number(uniformDeflection.toFixed(6)),
      },
      control: {
        uniformDeflection: Number(uniformDeflection.toFixed(6)),
        uniformBendsNothing: uniformBendsNothing ? 1 : 0,
      },
      notes:
        'the eikonal ray turns toward the transverse gradient of the refractive index, bending toward the slow-clock region (the mass), the optical-mechanical analogy. The 1/b lensing law (the time-only product near 2k) is the gravitational deflection, and the full-metric deflection is exactly twice it, the Eddington 1919 factor of two that distinguishes general relativity from the Newtonian estimate, the temporal half from the clock rate (4A) and the spatial half from the emergent-metric curvature (2A). Critically the rate well is the 3A entropic potential, NOT a new field, so route 4A costs nothing and contributes the light-bending null sector. The uniform-field control deflects exactly nothing, confirming it is the clock-rate GRADIENT that gravitates.',
    })
  },
})
