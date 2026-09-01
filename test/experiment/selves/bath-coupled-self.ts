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
// closed reversible system as the no-attractor, no-correction control, and a non-propagating bath (fieldSpeed2
// zero) as the mechanism control, no radiation means no attractor, so the radiation channel is the cause. This
// is the body becoming a self.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  oscillatorBathTrajectory,
  lateAmplitude,
} from '@/code/dynamics/oscillator-bath'

export default experiment({
  id: 'selves/bath-coupled-self',
  code: 'E-SLF-0009',
  title:
    'coupling a captured body to the bath gives it an attractor (identity) and a corrective response (agency)',
  category: 'selves',
  substrates: 'any',
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

    // MECHANISM control: a NON-PROPAGATING bath (fieldSpeed2 = 0) cannot carry radiation away, so even with
    // the absorbing end the attractor must vanish, each late amplitude stays at its start. This pins the
    // radiation channel as the cause of the attractor, not the absorbing end by itself.
    const localBathLateAmps = starts.map(start =>
      lateAmplitude(
        oscillatorBathTrajectory({
          absorbing: true,
          stiffness,
          start,
          steps,
          fieldSpeed2: 0,
        }),
      ),
    )

    const localBathSpread =
      Math.max(...localBathLateAmps) - Math.min(...localBathLateAmps)

    const nonPropagatingBathKillsAttractor =
      localBathSpread > 0.5 &&
      localBathLateAmps.every((amp, i) => amp >= starts[i]! * 0.8)

    const hasIdentity =
      bathSpread < 0.1 && bathSettlesToZero && closedSpread > 0.5

    const hasAgency = bathAfterKick < 0.1 && closedAfterKick > 0.3

    const ok =
      hasIdentity && hasAgency && nonPropagatingBathKillsAttractor

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'coupling a captured body to the bath gives it an attractor, many different initial conditions settle to the same ground state (an identity, a basin, the degeneracy a reversible orbit lacks) and a kicked perturbation is radiated away so the body returns to its ground state (a corrective, light-cone response), while the closed reversible system keeps every initial condition on its own orbit and never corrects a kick, and a non-propagating bath (fieldSpeed2 zero) kills the attractor with late amplitudes staying at their starts, so the radiation channel is the mechanism and the bath turns the body into a self',
      metrics: {
        bathBasinSpread: bathSpread,
        closedBasinSpread: closedSpread,
        bathAfterKick,
        closedAfterKick,
        hasIdentity: hasIdentity ? 1 : 0,
        hasAgency: hasAgency ? 1 : 0,
        nonPropagatingBathKillsAttractor:
          nonPropagatingBathKillsAttractor ? 1 : 0,
        steps,
      },
      control: {
        closedBasinSpread: closedSpread,
        closedAfterKick,
        localBathSpread,
        localBathLateAmpFromHalfStart: localBathLateAmps[0]!,
      },
      notes:
        'the bath gives the captured body the two things a reversible orbit cannot have, an ATTRACTOR (many initial conditions to one ground state, the degeneracy and identity) and a CORRECTIVE response (a kick radiates away and the body returns). The closed reversible control has neither. The mechanism control (promoted from the June 2026 audit probe) sets the bath field speed to zero, a non-propagating bath cannot radiate, so even with the absorbing end every late amplitude stays at its start and the attractor vanishes, pinning radiation as the cause. So the self-level is the bath-coupled, dissipative description of the captured body, the body becomes a self when coupled to the bath. The bath enters twice, once for capture, once for agency. Prior art: the Caldeira-Leggett oscillator-bath model, a coordinate coupled to a harmonic bath acquires effective dissipation exactly this way',
    })
  },
})
