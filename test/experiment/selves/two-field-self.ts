// The resolution of the bind-versus-radiate obstruction (substrate-self-obstruction), and the candidate design
// for a substrate-native self. The obstruction was that one field cannot both confine a body and radiate its
// excess. The resolution is TWO fields, a confined matter field (the body) coupled to a separate PROPAGATING
// field (the photon, the coin's 8v sector). The body confines, the photon carries the radiation away to the
// bath. This is how an excited atom decays, it does not shed its charge, it emits a photon. The reduced model's
// bath chain IS that photon field.
//
// The testable condition this puts on the radiating field, it must PROPAGATE (be massless). We hold the body and
// the absorbing bath fixed and vary only the field's wave speed.
//   PROPAGATING field (wave speed > 0), the photon carries the body's excess to the bath, the body settles, a
//     SELF (identity and a corrective attractor).
//   LOCAL field (wave speed 0, a massive or frozen field), the excess has nowhere to propagate, it sloshes
//     locally and returns, the body never settles even WITH the absorbing bath, no self.
// So a confined body becomes a self only when coupled to a propagating massless field, the photon. That is the
// candidate rule for the substrate, matter (pair-table-confined) plus the 8v photon (free-streaming) plus
// minimal coupling, on the open lattice.
//
// Depth L2, the self appears only with a propagating radiating field, the non-propagating field is the control,
// isolating that the photon's masslessness is what lets the body radiate and become a self.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  oscillatorBathTrajectory,
  lateAmplitude,
} from '@/code/dynamics/oscillator-bath'

export default experiment({
  id: 'selves/two-field-self',
  title:
    'a confined body becomes a self only when coupled to a PROPAGATING field (the photon), not a local one',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const steps = 8000
    const stiffness = 1.0
    const starts = [0.5, 1.0, 1.5, 2.0]

    // basin spread across initial conditions (does the body settle to one ground state, an attractor) for a
    // given field wave speed, with the absorbing bath always on.
    const basinSpread = (fieldSpeed2: number): number => {
      const amps = starts.map(start =>
        lateAmplitude(
          oscillatorBathTrajectory({
            absorbing: true,
            stiffness,
            start,
            steps,
            fieldSpeed2,
          }),
        ),
      )
      return Math.max(...amps) - Math.min(...amps)
    }
    const settledTo = (fieldSpeed2: number): number =>
      Math.max(
        ...starts.map(start =>
          lateAmplitude(
            oscillatorBathTrajectory({
              absorbing: true,
              stiffness,
              start,
              steps,
              fieldSpeed2,
            }),
          ),
        ),
      )

    // PROPAGATING field (the photon, massless), wave speed > 0.
    const propagatingSpread = basinSpread(1.0)
    const propagatingSettle = settledTo(1.0)
    // LOCAL field (massive or frozen), wave speed 0, cannot carry radiation away.
    const localSpread = basinSpread(0.0)
    const localSettle = settledTo(0.0)

    // a corrective response, kick the settled body, does it recover, for each field.
    const afterKick = (fieldSpeed2: number): number =>
      lateAmplitude(
        oscillatorBathTrajectory({
          absorbing: true,
          stiffness,
          start: 0,
          velocity: 0,
          steps,
          kickStep: Math.floor(steps / 2),
          kickVelocity: 1.0,
          fieldSpeed2,
        }),
      )
    const propagatingAfterKick = afterKick(1.0)
    const localAfterKick = afterKick(0.0)

    // the propagating field gives a self (settles to one attractor, corrects a kick), the local field does not.
    const propagatingIsSelf =
      propagatingSpread < 0.1 &&
      propagatingSettle < 0.1 &&
      propagatingAfterKick < 0.1
    const localIsNotSelf = localSettle > 0.3 || localAfterKick > 0.3

    const ok = propagatingIsSelf && localIsNotSelf
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the same confined body and the same absorbing bath, a PROPAGATING field (the photon, wave speed positive) carries the body excess away so the body settles to a single attractor and recovers from a kick, a self, while a LOCAL non-propagating field (wave speed zero) cannot carry the excess off so the body never settles, so a confined body becomes a self only when coupled to a propagating massless field, the photon, which resolves the bind-versus-radiate tension, binding and radiating live in two different fields',
      metrics: {
        propagatingBasinSpread: propagatingSpread,
        propagatingSettle,
        propagatingAfterKick,
        localBasinSpread: localSpread,
        localSettle,
        localAfterKick,
        propagatingIsSelf: propagatingIsSelf ? 1 : 0,
        localIsNotSelf: localIsNotSelf ? 1 : 0,
        steps,
      },
      control: { localSettle, localAfterKick },
      notes:
        'the bind-versus-radiate obstruction dissolves with TWO fields, a confined matter body plus a propagating massless field (the photon, the 8v sector). The body radiates PHOTONS, not its charge, like an excited atom decaying. The radiating field MUST propagate, a local (massive) field cannot carry the excess away and gives no self even with the bath. The substrate candidate, pair-table-confined matter plus the free-streaming 8v photon plus minimal coupling on the open lattice',
    })
  },
})
