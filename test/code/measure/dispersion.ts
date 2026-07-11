// Conformance for code/measure/dispersion.
//   - relativisticDispersionFit recovers (speedSquared, massSquared) from omega^2 = c^2 k^2 + m^2.
//   - latticeDispersion is sum_d (1 - cos(k.d)); for the 4-neighbour square set along an axis it is
//     exactly 2(1 - cos k), re-derived here.
//   - waveModeFrequency reads omega = k off the reversible recurrence q(t+1) = 2 cos(k) q(t) - q(t-1),
//     whose bounded solution oscillates at frequency k (half-period pi/k).
//   - dispersionSpeedDeviation has infrared speed -> 1 and a zero deviation at the first wavenumber.
//   - dispersionAxisDiagonalAnisotropy matches the closed form for the square set.

import { suite, check, close, equal, ok } from '@/test/code/harness'
import {
  relativisticDispersionFit,
  latticeDispersion,
  waveModeFrequency,
  dispersionSpeedDeviation,
  dispersionAxisDiagonalAnisotropy,
} from '@/code/measure/dispersion'

const TIGHT = 1e-9
const SQUARE = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

suite('measure/dispersion: relativisticDispersionFit', [
  check(
    'omega^2 = k^2 + 4 recovers speedSquared 1, massSquared 4',
    () => {
      const wavenumbers = [0, 1, 2, 3, 4]
      const frequencies = wavenumbers.map(k => Math.sqrt(k * k + 4))
      const fit = relativisticDispersionFit({
        wavenumbers,
        frequencies,
      })

      close(fit.speedSquared, 1, TIGHT)
      close(fit.massSquared, 4, TIGHT)
    },
  ),
  check(
    'a faster (c^2 = 9), massless mode recovers slope 9, intercept 0',
    () => {
      const wavenumbers = [1, 2, 3, 4, 5]
      const frequencies = wavenumbers.map(k => 3 * k)
      const fit = relativisticDispersionFit({
        wavenumbers,
        frequencies,
      })

      close(fit.speedSquared, 9, TIGHT)
      close(fit.massSquared, 0, TIGHT)
    },
  ),
])

suite('measure/dispersion: latticeDispersion', [
  check('square set along an axis is 2(1 - cos k)', () => {
    for (const k of [0.3, 1.0, 2.0, Math.PI]) {
      close(
        latticeDispersion({ directions: SQUARE, wave: [k, 0] }),
        2 * (1 - Math.cos(k)),
        TIGHT,
      )
    }
  }),
  check('zero wave gives zero dispersion', () => {
    close(
      latticeDispersion({ directions: SQUARE, wave: [0, 0] }),
      0,
      TIGHT,
    )
  }),
])

suite('measure/dispersion: waveModeFrequency reads omega = k', [
  check('a bounded mode oscillates at its own wavenumber', () => {
    for (const k of [0.4, 0.7, 1.1]) {
      const out = waveModeFrequency({ wavenumber: k })

      ok(out.oscillates, `k=${k} must oscillate`)
      ok(out.bounded, `k=${k} must stay bounded`)
      close(out.omega, k, 1e-2)
    }
  }),
])

suite('measure/dispersion: dispersionSpeedDeviation', [
  check(
    'infrared phase speed -> 1 and the first deviation is exactly 0',
    () => {
      const wavenumbers = [0.01, 0.1, 0.5, 1.0, 1.5, 2.0]
      const out = dispersionSpeedDeviation({
        directions: SQUARE,
        axis: [1, 0],
        wavenumbers,
      })

      close(out.infraredSpeed, 1, 1e-3)
      equal(out.deviations[0], 0)
      // the deviation grows as the lattice bends omega below c at larger k
      ok(
        out.deviations[out.deviations.length - 1]! > out.deviations[1]!,
        'deviation must rise with k',
      )
    },
  ),
])

suite('measure/dispersion: dispersionAxisDiagonalAnisotropy', [
  check(
    'matches the closed form for the square set at magnitude 2',
    () => {
      const q = 2
      const axisOmega = (1 - Math.cos(q)) / 2
      const diagOmega = 1 - Math.cos(q / Math.sqrt(2))
      const expected =
        Math.abs(axisOmega - diagOmega) / ((axisOmega + diagOmega) / 2)

      const got = dispersionAxisDiagonalAnisotropy({
        directions: SQUARE,
        dimension: 2,
        magnitude: q,
      })

      close(got, expected, TIGHT)
    },
  ),
  check('anisotropy vanishes in the infrared (small magnitude)', () => {
    const got = dispersionAxisDiagonalAnisotropy({
      directions: SQUARE,
      dimension: 2,
      magnitude: 0.01,
    })

    close(got, 0, 1e-4)
  }),
])
