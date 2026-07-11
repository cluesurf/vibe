// Conformance for code/dynamics/shell-model: the GOY shell model of turbulence. Invariants:
//   - spectrumSlope is the exact least-squares log-log slope: a k^(-2/3) energy spectrum gives slope -2/3.
//   - DETERMINISM of goyShellSpectrum.
//   - the nonlinear advection (the cascade) produces a DIFFERENT spectrum from the linear control.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  goyShellSpectrum,
  spectrumSlope,
} from '@/code/dynamics/shell-model'

suite('dynamics/shell-model: spectrumSlope closed form', [
  check('a k^(-2/3) spectrum has log-log slope exactly -2/3', () => {
    // spectrum[i] = C * (2^i)^(-2/3)
    const spectrum = Array.from(
      { length: 10 },
      (_, i) => 5 * Math.pow(2, i) ** (-2 / 3),
    )

    close(
      spectrumSlope({ spectrum, lo: 1, hi: 8 }),
      -2 / 3,
      1e-9,
      'slope = -2/3',
    )
  }),
  check('a k^(-2) spectrum has slope -2', () => {
    const spectrum = Array.from(
      { length: 10 },
      (_, i) => 3 * Math.pow(2, i) ** -2,
    )

    close(
      spectrumSlope({ spectrum, lo: 1, hi: 8 }),
      -2,
      1e-9,
      'slope = -2',
    )
  }),
])

suite('dynamics/shell-model: dynamics', [
  // viscosity / dt chosen so the explicit integrator is stable across all shells
  // (nu * k_max^2 * dt << 1, k_max = 2^(shells-1)).
  check('goyShellSpectrum is deterministic and finite', () => {
    const opts = {
      shells: 12,
      viscosity: 1e-7,
      dt: 1e-4,
      steps: 4000,
      nonlinear: true,
    }

    const a = goyShellSpectrum(opts)
    const b = goyShellSpectrum(opts)

    for (let i = 0; i < a.length; i++) {
      ok(Number.isFinite(a[i]!), `shell ${i} finite`)
      close(a[i]!, b[i]!, 0, `shell ${i} reproducible`)
    }
  }),
  check(
    'the nonlinear cascade gives a different spectrum than the linear control',
    () => {
      const common = {
        shells: 12,
        viscosity: 1e-7,
        dt: 1e-4,
        steps: 4000,
      }

      const cascade = goyShellSpectrum({ ...common, nonlinear: true })
      const control = goyShellSpectrum({ ...common, nonlinear: false })

      let diff = 0

      for (let i = 0; i < cascade.length; i++) {
        diff += Math.abs(cascade[i]! - control[i]!)
      }

      ok(diff > 0, 'cascade changes the spectrum')
    },
  ),
])
