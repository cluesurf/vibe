// Conformance for code/dynamics/oscillator-bath: a bound coordinate coupled to a radiative field chain.
// Invariant (the open vs closed contrast): with an ABSORBING far end the body radiates its energy away and
// SETTLES (small late amplitude), with a REFLECTING end the energy returns and it oscillates forever (large
// late amplitude). lateAmplitude reads the settled vs oscillating state. Deterministic (no RNG).

import { suite, check, ok, equal } from '@/test/code/harness'
import {
  oscillatorBathTrajectory,
  lateAmplitude,
} from '@/code/dynamics/oscillator-bath'

const common = { stiffness: 0.5, start: 1, steps: 1500 }

suite('dynamics/oscillator-bath: settle vs oscillate', [
  check(
    'an absorbing bath lets the body settle far below the reflecting case',
    () => {
      const absorbing = lateAmplitude(
        oscillatorBathTrajectory({ ...common, absorbing: true }),
      )

      const reflecting = lateAmplitude(
        oscillatorBathTrajectory({ ...common, absorbing: false }),
      )

      ok(absorbing < reflecting, 'absorbing settles below reflecting')
      ok(
        absorbing < 0.5 * common.start,
        'absorbing decays well below the start amplitude',
      )
    },
  ),
  check(
    'a local (non-propagating) field cannot radiate even with an absorbing end',
    () => {
      // fieldSpeed2 = 0: the bath field does not propagate, so energy has nowhere to go
      const local = lateAmplitude(
        oscillatorBathTrajectory({
          ...common,
          absorbing: true,
          fieldSpeed2: 0,
        }),
      )

      const propagating = lateAmplitude(
        oscillatorBathTrajectory({
          ...common,
          absorbing: true,
          fieldSpeed2: 1,
        }),
      )

      ok(local > propagating, 'a non-propagating field radiates less')
    },
  ),
])

suite('dynamics/oscillator-bath: determinism', [
  check('two identical runs agree', () => {
    const a = oscillatorBathTrajectory({ ...common, absorbing: true })
    const b = oscillatorBathTrajectory({ ...common, absorbing: true })

    equal(a.length, b.length, 'same length')

    for (let i = 0; i < a.length; i++) equal(a[i]!, b[i]!, `step ${i}`)
  }),
])
