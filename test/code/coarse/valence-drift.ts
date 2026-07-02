// Conformance for code/coarse/valence-drift: the approach-avoid drift of a self in a tone dipole. The
// clean derivable fact is the CONTROL: with dynamics off the self cannot move (no beat is applied and
// the clamped boundary strips are masked out of the centroid), so the drift is exactly 0 and the
// valence differential is exactly 0. The driven run is checked for reproducibility. The sign-tracks-
// gradient physics claim is an experiment, not a math identity.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  valenceDrift,
  valenceDifferential,
} from '@/code/coarse/valence-drift'

suite('coarse/valence-drift: the no-dynamics control', [
  // No beat means the masked self never moves, so the start and end centroids coincide: drift 0.
  check('drift is exactly 0 without dynamics, either gradient', () => {
    for (const plusSide of ['right', 'left'] as const) {
      const d = valenceDrift({
        L: 30,
        beats: 10,
        seed: 1,
        plusSide,
        withDynamics: false,
      })

      close(d, 0, 1e-12, 'a still self does not drift')
    }
  }),
  check(
    'the valence differential is exactly 0 without dynamics',
    () => {
      close(
        valenceDifferential({
          L: 30,
          beats: 10,
          seed: 1,
          withDynamics: false,
        }),
        0,
        1e-12,
      )
    },
  ),
])

suite('coarse/valence-drift: reproducibility', [
  check('the driven drift is reproducible for a fixed seed', () => {
    const opts = {
      L: 30,
      beats: 10,
      seed: 6,
      plusSide: 'right' as const,
      withDynamics: true,
    }

    equal(
      valenceDrift(opts),
      valenceDrift(opts),
      'same seed, same drift',
    )
  }),
])
