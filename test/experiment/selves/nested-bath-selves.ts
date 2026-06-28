// Nesting, the original goal (routes-to-nested-selves). A single bath-coupled body becomes a self, it has an
// attractor (identity) and corrects perturbations (agency, selves/bath-coupled-self). The question that started
// the whole arc is whether selves nest, whether selves of selves form. Here two bath-coupled bodies, mutually
// attracting and both radiating into a shared bath, BIND into one composite, a higher-order self with its own
// identity and agency, while each body remains a sub-body within it.
//
// We test three things under the absorbing bath, with the closed (reflecting) system as the control.
//  COMPOSITE IDENTITY, different initial conditions for the two bodies settle to the SAME joint ground state, so
//    the pair has one identity (an attractor for the whole), the degeneracy of a higher individual.
//  BINDING, the relative coordinate (the separation of the two sub-bodies) settles to a fixed value, so the two
//    are bound into one object, not drifting apart.
//  COMPOSITE AGENCY, a kick to one sub-body is radiated away and the WHOLE composite returns to its joint ground
//    state, the higher self corrects a disturbance to its part.
// The closed control does none of these, the joint state keeps every initial condition's orbit and a kick
// persists. So selves nest, a bath-coupled pair of bodies is a self of selves.
//
// Depth L2, two bath-coupled bodies forming a higher composite self, with the closed reversible system as the
// no-nesting control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  twoBodyBathTrajectory,
  lateAmplitude,
} from '@/code/dynamics/oscillator-bath'

export default experiment({
  id: 'selves/nested-bath-selves',
  code: 'E-SLF-0078',
  title:
    'two bath-coupled bodies bind into a higher composite self with its own identity and agency, selves nest',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const steps = 8000
    const stiffness = 0.6
    const mutual = 0.8
    // several initial conditions for the two bodies (different placements and orientations).
    const inits: [number, number][] = [
      [1, 1],
      [2, -1],
      [-1.5, 1.5],
      [-2, -2],
    ]

    // the joint final state of the composite, the late amplitudes of both bodies and of their separation.
    const jointState = (
      absorbing: boolean,
      start1: number,
      start2: number,
    ): { body1: number; body2: number; relative: number } => {
      const { body1, body2 } = twoBodyBathTrajectory({
        absorbing,
        stiffness,
        mutual,
        start1,
        start2,
        steps,
      })

      const relative = body1.map((r1, i) => r1 - body2[i]!)

      return {
        body1: lateAmplitude(body1),
        body2: lateAmplitude(body2),
        relative: lateAmplitude(relative),
      }
    }

    // COMPOSITE IDENTITY, do all initial conditions settle to the same joint ground state (spread ~ 0)?
    const finalsBath = inits.map(([a, b]) => jointState(true, a, b))
    const finalsClosed = inits.map(([a, b]) => jointState(false, a, b))

    const spread = (
      finals: { body1: number; body2: number }[],
    ): number => {
      const amps = finals.map(f => Math.max(f.body1, f.body2))

      return Math.max(...amps) - Math.min(...amps)
    }

    const bathIdentitySpread = spread(finalsBath)
    const closedIdentitySpread = spread(finalsClosed)

    // BINDING, does the separation settle (the pair is one bound object) under the bath?
    const bathRelativeSettles =
      Math.max(...finalsBath.map(f => f.relative)) < 0.1

    const closedRelativeSettles =
      Math.max(...finalsClosed.map(f => f.relative)) < 0.1

    // COMPOSITE AGENCY, kick one sub-body, does the whole composite return to its joint ground state?
    const kickedComposite = (absorbing: boolean): number => {
      const { body1, body2 } = twoBodyBathTrajectory({
        absorbing,
        stiffness,
        mutual,
        start1: 0,
        start2: 0,
        steps,
        kickStep: Math.floor(steps / 2),
        kickVelocity: 1.0,
      })

      return Math.max(lateAmplitude(body1), lateAmplitude(body2))
    }

    const bathAfterKick = kickedComposite(true)
    const closedAfterKick = kickedComposite(false)

    const compositeIdentity =
      bathIdentitySpread < 0.1 && closedIdentitySpread > 0.5

    const bound = bathRelativeSettles && !closedRelativeSettles
    const compositeAgency = bathAfterKick < 0.1 && closedAfterKick > 0.3

    const ok = compositeIdentity && bound && compositeAgency

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two bath-coupled bodies that mutually attract bind into one composite, all initial conditions settle to the same joint ground state (a composite identity), their separation settles (they are bound into one object), and a kick to one sub-body is radiated away so the whole composite returns to its ground state (composite agency), while the closed reversible system does none of these, so selves nest, a bath-coupled pair is a self of selves',
      metrics: {
        bathIdentitySpread,
        closedIdentitySpread,
        bathRelativeFinal: Math.max(...finalsBath.map(f => f.relative)),
        closedRelativeFinal: Math.max(
          ...finalsClosed.map(f => f.relative),
        ),
        bathAfterKick,
        closedAfterKick,
        compositeIdentity: compositeIdentity ? 1 : 0,
        bound: bound ? 1 : 0,
        compositeAgency: compositeAgency ? 1 : 0,
        steps,
      },
      control: { closedIdentitySpread, closedAfterKick },
      notes:
        'selves nest. Two bath-coupled bodies bind into a higher composite with its own attractor (identity), its own bound separation (it is one object), and its own corrective response (agency). The closed reversible control has none. So the chain completes, body (capture) then self (bath-coupled attractor) then self of selves (mutually coupled bath-coupled bodies). The bath is what makes each level',
    })
  },
})
