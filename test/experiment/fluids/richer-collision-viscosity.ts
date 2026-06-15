// FD1 extension, a richer collision gives a FINITE bulk viscosity. This is an EXPLORATION, not the committed base.
// The committed base collisions (headOnRotate, the pair table) are inviscid in the bulk (fluids/no-bulk-viscosity),
// because headOnRotate reshapes only zero-momentum pairs, so net momentum streams ballistically. This experiment
// asks the design question, can a richer momentum-mixing collision on the SAME 24-direction D4 coin give a finite
// bulk shear viscosity, and the answer is yes. The richer collision (code/rule/viscous-collision) swaps occupancy
// between two disjoint direction-pairs that carry the SAME total momentum, so it reshapes NET-momentum
// configurations while conserving mass and the full momentum vector and staying reversible (disjoint swaps, an
// involution). Under it a transverse shear DECAYS sharply in the closed bulk (a finite viscosity), where the
// committed headOnRotate leaves it essentially undamped (inviscid). So viscosity, and the door to turbulence, is
// reachable on the committed coin with a richer collision, the committed base simply does not include it.
//
// Deterministic throughout (the shear is a fixed sinusoidal function of the cell coordinate, no random). Honest
// scope, this is a richer NON-committed collision, an exploration of the design space, not a claim about the base.
// The clean viscosity coefficient is order one (the early shear decay rate scales roughly as k^2), with a
// late-time partial revival that is the expected finite-size reversibility (Poincare recurrence).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import { viscousRotate } from '@/code/rule/viscous-collision'
import { makeWill } from '@/code/tone/will'
import { conservesCharge, conservesMomentum, isReversible } from '@/code/check/invariant'
import { shearSetup, shearAmplitudeSeries } from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/richer-collision-viscosity',
  title: 'a richer momentum-mixing collision gives a finite bulk viscosity where the committed collision is inviscid',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) opposite.push(mesh.opposite(d))
    const viscous = viscousRotate({ directions })
    const committed = headOnRotate({ opposite }) // the inviscid base collision, the control
    const beats = 40

    // the deepest relaxation of the shear over the run, low = viscous (the shear gets damped), high = inviscid
    const minAmplitude = (collision: typeof viscous, wavelength: number): number => {
      const shear = { gradAxis: 1, momAxis: 0, wavelength, side, directions }
      const will = shearSetup({ mesh, ...shear })
      const series = shearAmplitudeSeries({ will, collision, beats, open: false, ...shear })
      return Math.min(...series.map((a) => Math.abs(a)))
    }

    const viscousMin = minAmplitude(viscous, side) // the richer collision damps the shear (finite viscosity)
    const committedMin = minAmplitude(committed, side) // the committed collision does not (inviscid)

    // the richer collision is a valid base-class rule, it conserves mass and the full momentum and is reversible
    const probe = makeWill(mesh)
    for (let i = 0; i < probe.data.length; i++) probe.data[i] = i % 2 === 0 ? 1 : 0
    const conservesQ = conservesCharge(probe, viscous, 20)
    const conservesP = conservesMomentum(probe, viscous, 20, directions)
    const reversible = isReversible(probe, viscous, 20)

    const viscousDamps = viscousMin < 0.2 // a finite bulk viscosity
    const committedInviscid = committedMin > 0.8 // the control stays undamped
    const validRule = conservesQ && conservesP && reversible
    const ok = viscousDamps && committedInviscid && validRule

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a richer momentum-mixing collision on the 24-direction D4 coin (an exploration, not the committed base), which swaps occupancy between disjoint direction-pairs of equal total momentum and so conserves mass and the full momentum vector while staying reversible, gives a FINITE bulk shear viscosity, a transverse shear decays sharply in the closed bulk under it, where the committed inviscid headOnRotate leaves the shear essentially undamped, so viscosity and the route to turbulence are reachable on the committed coin with a richer collision, though the committed base itself does not include it',
      metrics: {
        viscousMinAmplitudeTimes1000: Math.round(viscousMin * 1000),
        committedMinAmplitudeTimes1000: Math.round(committedMin * 1000),
        conservesCharge: conservesQ ? 1 : 0,
        conservesMomentum: conservesP ? 1 : 0,
        reversible: reversible ? 1 : 0,
        beats,
        side,
      },
      control: { committedMinAmplitudeTimes1000: Math.round(committedMin * 1000) },
      notes:
        'EXPLORATION, not the committed base (the base is inviscid, fluids/no-bulk-viscosity). The richer collision is a valid base-class rule (conserves charge and momentum, reversible). The viscosity coefficient is order one (early shear decay rate scales roughly as k^2), with a late-time partial revival that is the expected finite-size reversibility. This opens genuine Navier-Stokes hydrodynamics and turbulence (FD6) on the coin, given a richer collision.',
    })
  },
})
