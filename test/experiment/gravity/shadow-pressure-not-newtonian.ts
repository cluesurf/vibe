// The honest negative on emergent gravity from the knit dynamics. A 1/r Newtonian tail derived from the bare
// knit (a coarse-grained shadow-pressure force, not a lattice Laplacian solve) is NOT there. The shadow
// pressure of a body, measured on the committed 24-direction D4 coin with the body's OWN self-generated active
// vacuum, is a real attraction (the net momentum at a test plane points toward the body), but it is
// DISTANCE-INDEPENDENT, a constant ballistic flux deficit behind the body, not a 1/r or 1/r^2 falloff. So the
// shadow-pressure mechanism does not produce a Newtonian tail, which confirms the model's stance that gravity
// is an ADDED effective field (the completed-self field, gravity/gravity-bound-self) and that the Einstein
// STRUCTURE comes from the measured area law (gravity/gr-einstein-equations), not from a 1/r emergent in the
// bare rule. This is a clean MEASURED negative with a no-body control, the value is in pinning down exactly
// where the bare dynamics stops. Deterministic throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { selfContainedShadowD4 } from '@/code/dynamics/shadow-pressure'

const SIDE = 24
const BEATS = 30
const BODY_LO = 6
const BODY_HI = 10
const DISTANCES = [1, 3, 5, 8, 11]

export default experiment({
  id: 'gravity/shadow-pressure-not-newtonian',
  title:
    'the bare shadow pressure is a distance-independent ballistic deficit, not a 1/r Newtonian tail',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the attraction (net x-momentum toward the body) at increasing distance behind the body, from the body's
    // own self-generated active vacuum
    const momenta = DISTANCES.map(dist =>
      selfContainedShadowD4({
        side: SIDE,
        beats: BEATS,
        bodyLoX: BODY_LO,
        bodyHiX: BODY_HI,
        testX: BODY_HI + dist,
        body: true,
      }),
    )
    // the control, no body means no shadow and no net momentum at any distance
    const control = DISTANCES.map(dist =>
      selfContainedShadowD4({
        side: SIDE,
        beats: BEATS,
        bodyLoX: BODY_LO,
        bodyHiX: BODY_HI,
        testX: BODY_HI + dist,
        body: false,
      }),
    )

    // the falloff exponent from a log-log fit of |momentum| versus distance, near zero means distance
    // independent (ballistic), a Newtonian tail would be near -1 (1/r) or -2 (1/r^2)
    const logD = DISTANCES.map(d => Math.log(d))
    const logM = momenta.map(m => Math.log(Math.abs(m) + 1e-9))
    const meanX = logD.reduce((a, b) => a + b, 0) / logD.length
    const meanY = logM.reduce((a, b) => a + b, 0) / logM.length
    let num = 0
    let den = 0
    for (let i = 0; i < logD.length; i++) {
      num += (logD[i]! - meanX) * (logM[i]! - meanY)
      den += (logD[i]! - meanX) ** 2
    }

    const falloffExponent = den > 0 ? num / den : 0

    const attractionPresent = momenta.every(m => m < -0.5) // a real attraction at every distance
    const distanceIndependent = Math.abs(falloffExponent) < 0.3 // constant, not Newtonian (which is near 1 or 2)
    const controlZero = control.every(m => Math.abs(m) < 0.5) // no body, no force
    const ok = attractionPresent && distanceIndependent && controlZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bare knit shadow pressure gives a real attraction (the net momentum points toward the body at every distance) but it is distance-independent (a constant ballistic flux deficit, falloff exponent near zero), not a 1/r or 1/r^2 Newtonian tail, so a Newtonian gravity tail is not emergent from the shadow-pressure dynamics and gravity is an added effective field',
      metrics: {
        falloffExponent,
        newtonianExponent: -2,
        momentumNear: momenta[0]!,
        momentumFar: momenta[momenta.length - 1]!,
        controlMax: Math.max(...control.map(m => Math.abs(m))),
      },
      control: {
        controlMax: Math.max(...control.map(m => Math.abs(m))),
      },
      notes:
        'a clean measured NEGATIVE. The shadow is a ballistic deficit, so the force is constant with distance (exponent near zero), not the Newtonian 1/r (exponent 1) or 1/r^2 (exponent 2). The 1/r limit comes instead from the added effective field (gravity-bound-self) and the Einstein structure from the measured area law (gr-einstein-equations). This pins down where the bare dynamics stops.',
    })
  },
})
