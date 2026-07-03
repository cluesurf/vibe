// Conformance for code/operator/maxwell-lattice: the lattice Maxwell (curl-curl) operator on a
// periodic L^3 torus of U(1) link variables. Re-derivable facts:
//   - The operator (sum of plaquette grad-F grad-F^T) is positive semidefinite: every omega^2
//     eigenvalue is >= 0.
//   - It has a large kernel of exact zero modes. The kernel dimension is the gauge modes plus
//     the first cohomology of the 3-torus: (L^3 - 1) pure-gauge gradients (mod the global shift)
//     plus b1(T^3) = 3 harmonic modes, so dim ker = L^3 + 2. For L = 2 that is exactly 10.
//   - A Proca mass m lifts every mode by m^2, so the spectrum becomes strictly gapped with NO
//     zero modes and minimum eigenvalue exactly m^2 (the gauge modes had eigenvalue 0).

import { suite, check, equal, ok, close } from '@/test/code/harness'
import { maxwellLatticeSpectrum } from '@/code/operator/maxwell-lattice'

suite('operator/maxwell-lattice: gauge zero modes', [
  check(
    'the spectrum is positive semidefinite with the right degrees of freedom',
    () => {
      const L = 2
      const spectrum = maxwellLatticeSpectrum({ side: L, mass: 0 })
      equal(
        spectrum.length,
        3 * L * L * L,
        'degrees of freedom = 3 L^3',
      )

      for (const v of spectrum) {ok(v > -1e-8, `eigenvalue ${v} >= 0`)}
    },
  ),
  check(
    'the kernel dimension is L^3 + 2 = 10 (gauge modes + b1(T^3))',
    () => {
      const L = 2
      const spectrum = maxwellLatticeSpectrum({ side: L, mass: 0 })
      const zeroModes = spectrum.filter(v => Math.abs(v) < 1e-8).length
      equal(zeroModes, L * L * L + 2, 'zero-mode count')
    },
  ),
])

suite('operator/maxwell-lattice: Proca mass', [
  check(
    'a photon mass lifts every mode by m^2: no zero modes, minimum eigenvalue m^2',
    () => {
      const L = 2
      const mass = 0.5
      const spectrum = maxwellLatticeSpectrum({ side: L, mass })
      const zeroModes = spectrum.filter(v => Math.abs(v) < 1e-8).length
      equal(zeroModes, 0, 'no zero modes with a mass')
      close(
        Math.min(...spectrum),
        mass * mass,
        1e-9,
        'lifted gauge modes sit at m^2',
      )
    },
  ),
  check(
    'the massive spectrum is the massless spectrum shifted up by m^2',
    () => {
      const L = 2
      const mass = 0.7
      const massless = maxwellLatticeSpectrum({ side: L, mass: 0 })
      const massive = maxwellLatticeSpectrum({ side: L, mass })

      for (let i = 0; i < massless.length; i++) {
        close(
          massive[i] ?? NaN,
          (massless[i] ?? 0) + mass * mass,
          1e-9,
          `shifted eigenvalue ${i}`,
        )
      }
    },
  ),
])
