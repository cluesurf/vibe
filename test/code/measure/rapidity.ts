// Conformance for code/measure/rapidity.
//   - addVelocities is the relativistic sum (v+u)/(1+uv), capped at c = 1.
//   - relativisticEnergy is sqrt(m^2 + p^2) (a 3-4-5 triangle).
//   - boostEnergyMomentum preserves the invariant omega^2 - k^2 and keeps lightlike vectors lightlike;
//     rapidities add (boost by a then b = boost by a+b).
//   - boostCoords preserves t^2 - x^2.
//   - linkRapidities returns atanh(dx/dt) for timelike links and skips spacelike ones.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  addVelocities,
  relativisticEnergy,
  boostEnergyMomentum,
  boostCoords,
  linkRapidities,
} from '@/code/measure/rapidity'

const TIGHT = 1e-12

suite('measure/rapidity: addVelocities', [
  check('0.5 and 0.5 add to 0.8, not 1.0', () => {
    close(addVelocities({ velocity: 0.5, frame: 0.5 }), 0.8, TIGHT)
  }),
  check('the light speed is invariant: v = 1 stays 1', () => {
    close(addVelocities({ velocity: 1, frame: 0.3 }), 1, TIGHT)
  }),
  check('zero frame leaves the velocity unchanged', () => {
    close(addVelocities({ velocity: 0.42, frame: 0 }), 0.42, TIGHT)
  }),
])

suite('measure/rapidity: relativisticEnergy', [
  check('m = 3, p = 4 gives E = 5', () => {
    close(relativisticEnergy({ mass: 3, momentum: 4 }), 5, TIGHT)
  }),
  check('massless: E = |p|', () => {
    close(relativisticEnergy({ mass: 0, momentum: 7 }), 7, TIGHT)
  }),
])

suite('measure/rapidity: boostEnergyMomentum', [
  check('preserves the invariant omega^2 - k^2', () => {
    const out = boostEnergyMomentum({
      omega: 2,
      wavenumber: 1,
      rapidity: 0.6,
    })

    close(
      out.omega * out.omega - out.wavenumber * out.wavenumber,
      4 - 1,
      1e-10,
    )
  }),
  check('a lightlike vector stays lightlike under any boost', () => {
    const out = boostEnergyMomentum({
      omega: 1,
      wavenumber: 1,
      rapidity: 1.3,
    })

    close(Math.abs(out.omega), Math.abs(out.wavenumber), 1e-10)
  }),
  check('rapidities add: boost(a) then boost(b) == boost(a+b)', () => {
    const once = boostEnergyMomentum({
      omega: 2,
      wavenumber: 0.5,
      rapidity: 0.3 + 0.4,
    })

    const twice = boostEnergyMomentum({
      ...boostEnergyMomentum({
        omega: 2,
        wavenumber: 0.5,
        rapidity: 0.3,
      }),
      rapidity: 0.4,
    })

    close(twice.omega, once.omega, 1e-10)
    close(twice.wavenumber, once.wavenumber, 1e-10)
  }),
])

suite('measure/rapidity: boostCoords', [
  check('preserves the interval t^2 - x^2', () => {
    const out = boostCoords({
      coords: Float64Array.from([2, 1]),
      rapidity: 0.5,
    })

    close(out[0]! * out[0]! - out[1]! * out[1]!, 4 - 1, 1e-10)
  }),
])

suite('measure/rapidity: linkRapidities', [
  check(
    'a timelike link of velocity tanh(0.7) has rapidity 0.7',
    () => {
      // elem0 at (0,0), elem1 at (1, tanh 0.7): v = tanh 0.7, atanh(v) = 0.7.
      const coords = Float64Array.from([0, 0, 1, Math.tanh(0.7)])
      const links = [Uint32Array.from([1]), Uint32Array.from([])]
      const out = linkRapidities({ coords, links, band: null })

      equal(out.length, 1)
      close(out[0]!, 0.7, 1e-10)
    },
  ),
  check('a spacelike link (|v| >= 1) is skipped', () => {
    // elem0 -> elem1 timelike (rapidity 0.5), elem0 -> elem2 spacelike (dt 0.5, dx 0.6, v=1.2).
    const coords = Float64Array.from([
      0,
      0,
      1,
      Math.tanh(0.5),
      0.5,
      0.6,
    ])

    const links = [
      Uint32Array.from([1, 2]),
      Uint32Array.from([]),
      Uint32Array.from([]),
    ]

    const out = linkRapidities({ coords, links, band: null })

    equal(out.length, 1)
    close(out[0]!, 0.5, 1e-10)
  }),
])
