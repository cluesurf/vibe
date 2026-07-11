// Conformance for code/measure/unruh: the detector response and the temperature read off detailed
// balance. The temperature extractor is exercised against a SYNTHETIC response built to satisfy
// detailed balance F(E)/F(-E) = exp(-E/T0) exactly, so the recovered T must equal T0 with no
// reference to the kernel. The kernel transform itself is checked for finiteness and the even/odd
// symmetry forced by its definition.

import { suite, check, close, allFinite } from '@/test/code/harness'
import {
  unruhDetectorResponse,
  temperatureFromDetailedBalance,
} from '@/code/measure/unruh'

const TOL = 1e-9

suite('measure/unruh: temperature from detailed balance', [
  // A response exp(-E / (2 T0)) gives F(E)/F(-E) = exp(-E/T0), so -E / log(F(E)/F(-E)) = T0 for
  // every probe energy, and the average is exactly T0.
  check(
    'a synthetic detailed-balance response recovers its temperature',
    () => {
      const T0 = 0.37
      const T = temperatureFromDetailedBalance({
        kappa: 1,
        response: (E: number) => Math.exp(-E / (2 * T0)),
      })

      close(T, T0, TOL)
    },
  ),
  // Independent of kappa (kappa only sets the probe energies E = factor * kappa).
  check('the recovered temperature does not depend on kappa', () => {
    const T0 = 0.2
    const r = (E: number) => Math.exp(-E / (2 * T0))

    close(
      temperatureFromDetailedBalance({ kappa: 0.5, response: r }),
      T0,
      TOL,
    )

    close(
      temperatureFromDetailedBalance({ kappa: 3, response: r }),
      T0,
      TOL,
    )
  }),
  // Custom probe energies do not change the recovered temperature.
  check('custom energy factors give the same temperature', () => {
    const T0 = 0.9
    const r = (E: number) => Math.exp(-E / (2 * T0))

    close(
      temperatureFromDetailedBalance({
        kappa: 1,
        response: r,
        energyFactors: [0.3, 0.8, 2.1],
      }),
      T0,
      TOL,
    )
  }),
])

suite('measure/unruh: detector response kernel', [
  // The sinh^2 transform must return finite numbers over a symmetric energy sweep.
  check('the transform is finite across an energy sweep', () => {
    const values: number[] = []

    for (const E of [-1.5, -1, -0.5, 0.5, 1, 1.5]) {
      const r = unruhDetectorResponse({
        energy: E,
        kappa: 1,
        eps: 0.05,
        halfWindow: 12,
        step: 0.01,
      })

      values.push(r.real, r.imaginary)
    }

    allFinite(values)
  }),
  // W(-tau) = conj(W(tau)) for this kernel, so F(E) = integral e^{-iE tau} W(tau) is REAL: the
  // imaginary part of the transform vanishes (to discretization error).
  check('the transform is real (imaginary part vanishes)', () => {
    const r = unruhDetectorResponse({
      energy: 0.8,
      kappa: 1,
      eps: 0.05,
      halfWindow: 14,
      step: 0.005,
    })

    close(r.imaginary, 0, 1e-6)
  }),
  // The real response obeys detailed balance F(E)/F(-E) = exp(-E/T) with T = kappa/(2 pi), so the
  // detector reads the Unruh temperature off the kernel alone.
  check('the kernel detailed balance gives T = kappa / 2pi', () => {
    const kappa = 1
    const response = (E: number) =>
      unruhDetectorResponse({
        energy: E,
        kappa,
        eps: 0.02,
        halfWindow: 16,
        step: 0.004,
      }).real

    const T = temperatureFromDetailedBalance({
      kappa,
      response,
      energyFactors: [0.5, 1, 1.5],
    })

    close(T, kappa / (2 * Math.PI), 0.02)
  }),
])
