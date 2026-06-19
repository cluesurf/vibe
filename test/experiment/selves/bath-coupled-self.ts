// The agency layer (the-capture-program-results, the-degeneracy-trick). A captured composite is a BODY, but a
// reversible one is a periodic orbit with no degeneracy, so it has no attractor, no identity, and cannot correct
// a perturbation (selves/composite-self-level, selves/l3-breather-self-criteria, both negative). The missing
// ingredient is the bath, coupling the body to the bath makes its dynamics effectively irreversible and gives it
// an ATTRACTOR. That attractor is the two things a self needs.
//   IDENTITY (degeneracy), many different initial conditions settle to the SAME ground state, a basin, so the
//     macro state "the body at rest" is many-to-one over the micro, the degeneracy a reversible orbit lacks.
//   AGENCY (a corrective response), a perturbation kicked into the settled body is radiated away to the bath and
//     the body RETURNS to its ground state, it corrects the disturbance, a cognitive-light-cone response.
// The closed (reflecting) control does neither, each initial condition keeps its own orbit (no basin) and a kick
// persists forever (no correction). So the bath-coupled body is a SELF where the reversible body is only a body.
//
// Depth L2, the bath gives a captured body an attractor (identity) and a corrective response (agency), with the
// closed reversible system as the no-attractor, no-correction control. This is the body becoming a self.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  oscillatorBathTrajectory,
  lateAmplitude,
} from '@/code/dynamics/oscillator-bath'

export default experiment({
  id: 'selves/bath-coupled-self',
  title:
    'coupling a captured body to the bath gives it an attractor (identity) and a corrective response (agency)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const steps = 8000
    const stiffness = 1.0
    const starts = [0.5, 1.0, 1.5, 2.0]

    // IDENTITY, many initial conditions, where do they settle? The basin is the spread of late amplitudes.
    const settle = (absorbing: boolean): number => {
      const lateAmps = starts.map(start =>
        lateAmplitude(
          oscillatorBathTrajectory({
            absorbing,
            stiffness,
            start,
            steps,
          }),
        ),
      )
      return Math.max(...lateAmps) - Math.min(...lateAmps)
    }
    const bathSpread = settle(true) // bath, all should converge to ~0 (one attractor)
    const closedSpread = settle(false) // closed, each keeps its own orbit (no attractor)
    const bathSettlesToZero =
      Math.max(
        ...starts.map(start =>
          lateAmplitude(
            oscillatorBathTrajectory({
              absorbing: true,
              stiffness,
              start,
              steps,
            }),
          ),
        ),
      ) < 0.1

    // AGENCY, start at the ground state, kick it, does it recover? Late amplitude after the kick.
    const kicked = (absorbing: boolean): number =>
      lateAmplitude(
        oscillatorBathTrajectory({
          absorbing,
          stiffness,
          start: 0,
          velocity: 0,
          steps,
          kickStep: Math.floor(steps / 2),
          kickVelocity: 1.0,
        }),
      )
    const bathAfterKick = kicked(true) // bath, should return to ~0 (corrected)
    const closedAfterKick = kicked(false) // closed, the kick persists (not corrected)

    const hasIdentity =
      bathSpread < 0.1 && bathSettlesToZero && closedSpread > 0.5
    const hasAgency = bathAfterKick < 0.1 && closedAfterKick > 0.3

    const ok = hasIdentity && hasAgency
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'coupling a captured body to the bath gives it an attractor, many different initial conditions settle to the same ground state (an identity, a basin, the degeneracy a reversible orbit lacks) and a kicked perturbation is radiated away so the body returns to its ground state (a corrective, light-cone response), while the closed reversible system keeps every initial condition on its own orbit and never corrects a kick, so the bath turns the body into a self',
      metrics: {
        bathBasinSpread: bathSpread,
        closedBasinSpread: closedSpread,
        bathAfterKick,
        closedAfterKick,
        hasIdentity: hasIdentity ? 1 : 0,
        hasAgency: hasAgency ? 1 : 0,
        steps,
      },
      control: { closedBasinSpread: closedSpread, closedAfterKick },
      notes:
        'the bath gives the captured body the two things a reversible orbit cannot have, an ATTRACTOR (many initial conditions to one ground state, the degeneracy and identity) and a CORRECTIVE response (a kick radiates away and the body returns). The closed reversible control has neither. So the self-level is the bath-coupled, dissipative description of the captured body, the body becomes a self when coupled to the bath. The bath enters twice, once for capture, once for agency',
    })
  },
})
