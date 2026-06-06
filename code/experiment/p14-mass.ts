// P14: mass and the relativistic dispersion (a rung of the matter sector).
// The matter so far is massless. A mass term in the Dirac Hamiltonian should open a
// spectral gap equal to the rest energy and bend the dispersion into the
// relativistic form E^2 = p^2 + m^2. We build the 1D lattice Dirac Hamiltonian
// H(k) = m*sigma_z + sin(k)*sigma_x and read off the gap and the dispersion.
// See note/questions/next-version.md (P14). Run: npx tsx code/experiment/p14-mass.ts

import { pathToFileURL } from 'node:url'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

// Positive-energy branch of the 1D lattice Dirac Hamiltonian at momentum k.
// H(k) = [[m, sin k], [sin k, -m]], eigenvalues +/- sqrt(m^2 + sin^2 k).
function diracEnergy(input: { k: number; m: number }): number {
  const h = makeDense({ rows: 2, cols: 2 })
  h.data[0] = input.m
  h.data[1] = Math.sin(input.k)
  h.data[2] = Math.sin(input.k)
  h.data[3] = -input.m
  const eig = eigSymmetric({ matrix: h })
  return Math.max(eig.values[0] ?? 0, eig.values[1] ?? 0)
}

// Least squares fit omega^2 = a * k^2 + b. The relativistic dispersion has a = 1
// (the speed of light) and b = m^2 (the rest energy squared).
function fitDispersion(ks: number[], omegas: number[]): { a: number; b: number } {
  const x = ks.map((k) => k * k)
  const y = omegas.map((w) => w * w)
  const n = x.length
  const mx = x.reduce((p, q) => p + q, 0) / n
  const my = y.reduce((p, q) => p + q, 0) / n
  let cov = 0
  let varx = 0
  for (let i = 0; i < n; i++) {
    cov += ((x[i] ?? 0) - mx) * ((y[i] ?? 0) - my)
    varx += ((x[i] ?? 0) - mx) * ((x[i] ?? 0) - mx)
  }
  const a = varx === 0 ? 0 : cov / varx
  return { a, b: my - a * mx }
}

export function massStudy(input: { m: number }): { gap: number; a: number; b: number } {
  // Small-momentum window, where the lattice dispersion is closest to continuum.
  const ks: number[] = []
  for (let k = 0.02; k <= 0.32 + 1e-9; k += 0.03) {
    ks.push(k)
  }
  const omegas = ks.map((k) => diracEnergy({ k, m: input.m }))
  const gap = diracEnergy({ k: 0, m: input.m })
  const fit = fitDispersion(ks, omegas)
  return { gap, a: fit.a, b: fit.b }
}

export function main(): void {
  console.log('P14: mass and the relativistic dispersion E^2 = p^2 + m^2')
  console.log('  1D lattice Dirac H(k) = m*sigma_z + sin(k)*sigma_x')
  console.log('  m      gap = omega(0)    dispersion fit omega^2 = a*k^2 + b')
  for (const m of [0, 0.3, 0.6]) {
    const s = massStudy({ m })
    console.log(
      `  ${m.toFixed(1)}    ${s.gap.toFixed(3).padStart(10)}        a = ${s.a.toFixed(3)}, b = ${s.b.toFixed(3)} (m^2 = ${(m * m).toFixed(3)})`,
    )
  }
  console.log('')
  console.log('  The gap at zero momentum equals the mass m (the rest energy), and the')
  console.log('  dispersion is relativistic: omega^2 = a*k^2 + b with a near 1 (the speed of')
  console.log('  light) and b near m^2 (the rest energy squared). At m = 0 the gap vanishes and')
  console.log('  omega = |k|, a massless light-cone mode. So a mass term gives matter a rest')
  console.log('  energy and the correct relativistic energy-momentum relation. Connecting this')
  console.log('  gap to the internal clock-tone frequency is the next step.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
