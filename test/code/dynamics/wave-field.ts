// Conformance for code/dynamics/wave-field: the reduced integer second-order field (discrete
// Klein/sine-Gordon at wave speed one), u(t+1) = left + right - u(t-1) + accel(u(t)). Invariants:
//   - EXACT INTEGER REVERSIBILITY for ANY accel: u(t-1) = left + right - u(t+1) + accel(u(t)).
//   - FLAT FIXED POINT: a constant field with accel(c) = 0 is unchanged (periodic).
//   - doubleWellAccel has zeros at 0 and +/-amplitude, pushes toward the vacua, saturates when asked.
//   - domainWallCount and fieldMaxAbs are read off correctly.
//   - DETERMINISM.

import { suite, check, exactArray, equal } from '@/test/code/harness'
import {
  makeWaveField,
  stepWaveField,
  doubleWellAccel,
  fieldMaxAbs,
  domainWallCount,
  WaveField,
} from '@/code/dynamics/wave-field'

const SIZE = 14
const zeroAccel = (): number => 0
const periodic = { form: 'periodic' as const }

// A deterministic structured field (no RNG).
const fill = (i: number): number => ((i * 5 + 3) % 7) - 3

suite('dynamics/wave-field: exact integer reversibility', [
  check(
    'one beat then the reversed beat recovers the previous slice (zero force)',
    () => {
      const field = makeWaveField({ size: SIZE, fill })
      const prev0 = field.prev.slice()
      const after = stepWaveField({
        field,
        accel: zeroAccel,
        boundary: periodic,
      })

      // after = { prev: curr0, curr: next }. Reverse by stepping the swapped pair:
      // a field whose curr = next and prev = curr0 evolves to recover prev0.
      const reversed: WaveField = {
        prev: after.curr,
        curr: after.prev,
        size: SIZE,
      }

      const back = stepWaveField({
        field: reversed,
        accel: zeroAccel,
        boundary: periodic,
      })

      exactArray(back.curr, prev0, 'recovered original previous slice')
    },
  ),
  check('reversibility holds for a NONLINEAR accel too', () => {
    const accel = (v: number): number => (v > 0 ? -1 : v < 0 ? 1 : 0) // a bounded restoring force
    const field = makeWaveField({ size: SIZE, fill })
    const prev0 = field.prev.slice()
    const after = stepWaveField({ field, accel, boundary: periodic })
    const reversed: WaveField = {
      prev: after.curr,
      curr: after.prev,
      size: SIZE,
    }

    const back = stepWaveField({
      field: reversed,
      accel,
      boundary: periodic,
    })

    exactArray(back.curr, prev0, 'recovered with nonlinear force')
  }),
])

suite('dynamics/wave-field: fixed point and determinism', [
  check(
    'a constant field with accel(c)=0 is a fixed point (periodic)',
    () => {
      const c = 4
      const field: WaveField = {
        prev: new Int32Array(SIZE).fill(c),
        curr: new Int32Array(SIZE).fill(c),
        size: SIZE,
      }

      const after = stepWaveField({
        field,
        accel: zeroAccel,
        boundary: periodic,
      })

      exactArray(
        after.curr,
        new Int32Array(SIZE).fill(c),
        'constant field unchanged',
      )
    },
  ),
  check('two identical beats are bit-for-bit equal', () => {
    const a = stepWaveField({
      field: makeWaveField({ size: SIZE, fill }),
      accel: zeroAccel,
      boundary: periodic,
    })

    const b = stepWaveField({
      field: makeWaveField({ size: SIZE, fill }),
      accel: zeroAccel,
      boundary: periodic,
    })

    exactArray(a.curr, b.curr, 'deterministic')
  }),
])

suite('dynamics/wave-field: accel and measures', [
  check(
    'doubleWellAccel: zeros at 0 and +/-amplitude, pushes toward the vacua',
    () => {
      const accel = doubleWellAccel({ amplitude: 5, saturating: true })

      equal(accel(0), 0, 'zero at the barrier')
      equal(accel(5), 0, 'zero at +vacuum')
      equal(accel(-5), 0, 'zero at -vacuum')
      equal(accel(3), 1, 'push out toward +vacuum')
      equal(accel(-3), -1, 'push out toward -vacuum')
      equal(accel(8), -1, 'saturated pull-back beyond +vacuum')
    },
  ),
  check(
    'non-saturating accel pulls back linearly beyond a vacuum',
    () => {
      const accel = doubleWellAccel({ amplitude: 5, saturating: false })

      equal(accel(8), -3, 'pull-back = -(magnitude - amplitude)')
    },
  ),
  check(
    'fieldMaxAbs and domainWallCount read the configuration',
    () => {
      const u = Int32Array.from([0, 2, -3, 0, 4, -1])

      equal(fieldMaxAbs(u), 4, 'max absolute value')
      // sign changes between adjacent nonzero cells: 2->-3, 4->-1 (0s break the run)
      equal(domainWallCount(u), 2, 'two domain walls')
    },
  ),
])
