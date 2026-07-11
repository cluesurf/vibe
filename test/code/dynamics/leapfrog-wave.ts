// Conformance for code/dynamics/leapfrog-wave: the continuous-amplitude reversible (leapfrog) wave on
// a periodic ring. Invariants:
//   - REVERSIBILITY: next = 2u - uPrev + r2*lap(u), so leapfrogWaveStep(u, next, r2) = uPrev (the step
//     is its own inverse with the slices swapped). Exact in real arithmetic up to rounding (tight tol).
//   - FLAT FIXED POINT: a spatially constant slice pair is unchanged (the Laplacian is zero) -> a wave
//     with no gradient does not move.
//   - blockAverage is the exact arithmetic mean over consecutive blocks.
//   - DETERMINISM of evolveLeapfrogWave.

import { suite, check, closeArray, equal } from '@/test/code/harness'
import {
  leapfrogWaveStep,
  blockAverage,
  evolveLeapfrogWave,
} from '@/code/dynamics/leapfrog-wave'

const TOL = 1e-9

// A deterministic smooth ring slice (a low-frequency sine, so it stays well resolved).
function sineSlice(L: number, phase: number): Float64Array {
  return Float64Array.from({ length: L }, (_, i) =>
    Math.sin((2 * Math.PI * i) / L + phase),
  )
}

suite('dynamics/leapfrog-wave: reversibility', [
  check('one step is its own inverse with the slices swapped', () => {
    const L = 16
    const r2 = 0.25
    const u = sineSlice(L, 0)
    const uPrev = sineSlice(L, -0.3)
    const next = leapfrogWaveStep(u, uPrev, r2)
    // reverse: 2u - next + r2 lap(u) = uPrev, which is exactly leapfrogWaveStep(u, next, r2)
    const back = leapfrogWaveStep(u, next, r2)

    closeArray(back, uPrev, TOL, 'recovered previous slice')
  }),
  check(
    'a multi-step forward then backward round trip recovers the start',
    () => {
      const L = 24
      const r2 = 0.3
      const steps = 20

      // start state (u_0 with its predecessor u_-1)
      let u = sineSlice(L, 0)
      let uPrev = sineSlice(L, -0.2)

      const u0 = u.slice()
      const uPrev0 = uPrev.slice()

      // forward: (u_n, u_{n-1}) -> u_{n+1} = step(u_n, u_{n-1})
      for (let t = 0; t < steps; t++) {
        const next = leapfrogWaveStep(u, uPrev, r2)

        uPrev = u
        u = next
      }

      // backward: from (u_n, u_{n-1}) recover u_{n-2} = step(u_{n-1}, u_n) (the step is its own inverse)
      for (let t = 0; t < steps; t++) {
        const earlier = leapfrogWaveStep(uPrev, u, r2)

        u = uPrev
        uPrev = earlier
      }

      // back to the start pair (u_0, u_-1)
      closeArray(u, u0, 1e-7, 'reversed slice')
      closeArray(uPrev, uPrev0, 1e-7, 'reversed previous slice')
    },
  ),
])

suite('dynamics/leapfrog-wave: known limits and helpers', [
  check(
    'a flat (constant) field is a fixed point: no gradient, no motion',
    () => {
      const L = 10
      const c = 3.5
      const u = new Float64Array(L).fill(c)
      const uPrev = new Float64Array(L).fill(c)
      const next = leapfrogWaveStep(u, uPrev, 0.4)

      closeArray(next, u, TOL, 'flat field unchanged')
    },
  ),
  check(
    'blockAverage is the exact mean over consecutive blocks',
    () => {
      const u = Float64Array.from([1, 3, 10, 20, 100, 200])
      const out = blockAverage(u, 2)

      closeArray(
        out,
        Float64Array.from([2, 15, 150]),
        TOL,
        'block means',
      )
      equal(out.length, 3, 'one coarse cell per block')
    },
  ),
  check('evolveLeapfrogWave is deterministic', () => {
    const L = 16
    const run = (): Float64Array =>
      evolveLeapfrogWave({
        u: sineSlice(L, 0),
        uPrev: sineSlice(L, -0.1),
        r2: 0.25,
        steps: 30,
      })

    closeArray(
      run(),
      run(),
      0,
      'identical inputs give identical output',
    )
  }),
])
