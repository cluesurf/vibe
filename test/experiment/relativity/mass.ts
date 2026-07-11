// P14: ANALYTIC / CONSISTENCY CHECK of the lattice Dirac dispersion.
// This is NOT an emergent test of the vibe substrate. It does NOT show the substrate
// produces mass or the relativistic energy-momentum relation. It ASSUMES the 1D lattice
// Dirac Hamiltonian H(k) = m*sigma_z + sin(k)*sigma_x, a hand-built 2x2 matrix, and reads
// off its eigenvalues. Those eigenvalues are the closed form +/- sqrt(m^2 + sin^2 k), so
// the gap at k = 0 equals m and the small-k dispersion is omega^2 = k^2 + m^2 by algebra.
// The relativistic form E^2 = p^2 + m^2 is a property of the assumed matrix, not evidence
// that the substrate generates mass. Connecting any such mass term to the substrate is
// not done here.
// See note/questions/next-version.md (P14). Run: npx tsx code/experiment/p14-mass.ts

import { latticeDiracEnergy1d } from '@/code/operator/lattice-fermion'
import { relativisticDispersionFit } from '@/code/measure/dispersion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Positive-energy branch of the 1D lattice Dirac Hamiltonian at momentum k.
// H(k) = [[m, sin k], [sin k, -m]], eigenvalues +/- sqrt(m^2 + sin^2 k).
function diracEnergy(input: { k: number; m: number }): number {
  return latticeDiracEnergy1d(input)
}

// Least squares fit omega^2 = a * k^2 + b. The relativistic dispersion has a = 1
// (the speed of light) and b = m^2 (the rest energy squared).
function fitDispersion(
  ks: number[],
  omegas: number[],
): { a: number; b: number } {
  const fit = relativisticDispersionFit({
    wavenumbers: ks,
    frequencies: omegas,
  })

  return { a: fit.speedSquared, b: fit.massSquared }
}

export function massStudy(input: { m: number }): {
  gap: number
  a: number
  b: number
} {
  // Small-momentum window, where the lattice dispersion is closest to continuum.
  const ks: number[] = []

  for (let k = 0.02; k <= 0.32 + 1e-9; k += 0.03) {
    ks.push(k)
  }

  const omegas = ks.map(k => diracEnergy({ k, m: input.m }))
  const gap = diracEnergy({ k: 0, m: input.m })
  const fit = fitDispersion(ks, omegas)

  return { gap, a: fit.a, b: fit.b }
}

export default experiment({
  id: 'relativity/mass-dispersion',
  code: 'E-RLT-0024',
  title: 'mass gives a gap = m and a relativistic dispersion b ~ m^2',
  category: 'relativity',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const s = massStudy({ m: 0.3 })
    const ok =
      Math.abs(s.gap - 0.3) < 0.01 &&
      Math.abs(s.b - 0.09) < 0.02 &&
      s.a > 0.9 &&
      s.a < 1.05

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an assumed 1D lattice Dirac matrix has gap = m and dispersion omega^2 = a k^2 + b with a ~ 1 and b ~ m^2',
      metrics: { gap: s.gap, a: s.a, b: s.b },
      notes:
        'analytic consistency check of the assumed lattice Dirac H(k), not a derivation of mass from the substrate',
    })
  },
})
