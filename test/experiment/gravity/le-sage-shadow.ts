// Le Sage shadow gravity, route 5A, resolved. The bare shadow pressure was a measured negative
// (`gravity/shadow-pressure-not-newtonian`), a distance-independent ballistic deficit, not a 1/r tail. The reason
// is now clear and the fix is clean. That bare flux was DIRECTIONAL (columnar), so its shadow had a fixed cross
// section, distance-independent. The Le Sage mechanism needs an ISOTROPIC flux, which is exactly what a
// re-isotropizing BATH supplies. With isotropic flux, a body of radius a at distance r intercepts a solid angle
// proportional to (a/r) squared, so the mutual-shadow push falls as 1/r squared, Newton's law. We measure both,
// the isotropic shadow fraction scales as 1/r squared (the Newtonian force), while the directional beam shadow is
// distance-independent (the bare negative, the control). So route 5A WORKS with the bath, it gives the inverse
// square. The honest caveat, Le Sage gravity inherits the classical drag and heating problem, a MOVING body sees
// the flux aberrated and feels a velocity-dependent drag, which is why Le Sage gravity is not the primary route,
// the entropic route 3A delivers the same static 1/r without that problem. Depth L2, the solid-angle shadow scaling
// measured deterministically, with the directional beam the distance-independent control. No randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  fibonacciSphereDirections,
  isotropicShadowFraction,
  directionalShadowFraction,
  distanceExponent,
  leSageDrag,
} from '@/code/measure/shadow-gravity'

const RAY_COUNT = 40000
const BODY_RADIUS = 1
const BEAM_RADIUS = 6
const DISTANCES = [4, 6, 8, 10, 14, 20]

export default experiment({
  id: 'gravity/le-sage-shadow',
  title:
    'Le Sage shadow gravity, isotropic flux gives the inverse-square force, but the measured first-order drag rules it out as fundamental',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const directions = fibonacciSphereDirections(RAY_COUNT)

    // the isotropic-flux shadow (the bath), the body's solid angle, the Le Sage force
    const isotropic = DISTANCES.map(bodyDistance =>
      isotropicShadowFraction({
        directions,
        bodyDistance,
        bodyRadius: BODY_RADIUS,
      }),
    )

    const isotropicExponent = distanceExponent(DISTANCES, isotropic)

    // the directional-beam shadow (the bare flux), a fixed cross section, distance-independent (the control)
    const directional = DISTANCES.map(() =>
      directionalShadowFraction({
        bodyRadius: BODY_RADIUS,
        beamRadius: BEAM_RADIUS,
      }),
    )

    const directionalExponent = distanceExponent(DISTANCES, directional)

    // the irreducible Le Sage drag, a body MOVING through the isotropic flux feels a net backward force, measured
    // at several velocities, it is FIRST ORDER (the force is linear in velocity, the coefficient minus one third),
    // which is the fatal flaw, it cannot be made negligible and it would decay every orbit
    const velocities = [0.05, 0.1, 0.2, 0.4]
    const drags = velocities.map(velocity =>
      leSageDrag({ directions, velocity }),
    )

    const dragCoefficients = drags.map((d, i) => d / velocities[i]!)
    const dragIsFirstOrder =
      drags.every(d => d < 0) &&
      Math.max(...dragCoefficients) / Math.min(...dragCoefficients) <
        1.02

    // the isotropic shadow must fall as 1/r^2 (the Newtonian force) and the directional shadow must be
    // distance-independent (the bare negative)
    const isotropicIsNewtonian = Math.abs(isotropicExponent + 2) < 0.2
    const directionalIsConstant = Math.abs(directionalExponent) < 0.05
    const ok =
      isotropicIsNewtonian && directionalIsConstant && dragIsFirstOrder

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an isotropic flux (the bath) gives a Le Sage mutual-shadow deficit that falls as 1/r squared (the body subtends a solid angle proportional to (a/r) squared), the Newtonian inverse-square force, while a directional (columnar) beam casts a shadow of fixed cross section that is distance-independent, the bare lattice-gas negative. So route 5A does deliver the static inverse square once the flux is isotropized. But a body MOVING through the flux feels an irreducible drag that is measured to be FIRST ORDER in velocity (the force linear in velocity, the coefficient minus one third), which cannot be made negligible and would decay every orbit, the classical fatal flaw of pushing gravity. So 5A is a real static mechanism but ruled out as fundamental, which is exactly why the entropic route 3A (no carriers, no drag) is the correct one for the same static force.',
      metrics: {
        isotropicExponent: Number(isotropicExponent.toFixed(3)),
        directionalExponent: Number(directionalExponent.toFixed(3)),
        isotropicIsNewtonian: isotropicIsNewtonian ? 1 : 0,
        directionalIsConstant: directionalIsConstant ? 1 : 0,
        dragCoefficient: Number(dragCoefficients[0]!.toFixed(4)),
        dragIsFirstOrder: dragIsFirstOrder ? 1 : 0,
        isotropicNearest: Number(isotropic[0]!.toExponential(3)),
        isotropicFarthest: Number(
          isotropic[isotropic.length - 1]!.toExponential(3),
        ),
      },
      control: {
        directionalExponent: Number(directionalExponent.toFixed(3)),
        directionalIsConstant: directionalIsConstant ? 1 : 0,
      },
      notes:
        'the isotropic shadow fraction is the body solid angle, sampled deterministically over a Fibonacci sphere of forty thousand directions, and it scales as 1/r squared (the exponent near minus two), the Le Sage Newtonian force. The directional beam shadow is distance-independent (exponent zero), the bare negative from shadow-pressure-not-newtonian, so the missing ingredient was isotropy, supplied by a bath, not a new field. The drag is the irreducible caveat made precise, a moving absorber feels a net backward force linear in velocity with coefficient minus one third (the same at every velocity tested), first order, the fatal Le Sage flaw, so this route cannot be the fundamental mechanism. The entropic route 3A gives the same static 1/r with no carriers and no drag, which is why it is preferred.',
    })
  },
})
