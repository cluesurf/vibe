// P20: the photon (the free U(1) gauge field's own propagation).
// The U(1) gauge field is already in the testbed as the force that couples to matter
// (P8: the covariant Dirac operator, the index theorem, the Aharonov-Bohm phase).
// What was missing is the FREE photon: its own propagation. The photon is the small
// fluctuation of the gauge field, governed by the lattice Maxwell action S = (1/2)
// sum over plaquettes of F^2, F = the curl of the link field. We build the Maxwell
// operator (curl-curl) on a periodic 3D lattice and read off the photon: a large
// space of exact zero modes (gauge invariance), a massless physical spectrum (the
// gap shrinks as the lattice grows, unlike a massive vector), and two transverse
// polarizations. See note/questions/frontiers.md. Run: npx tsx code/experiment/p20-photon.ts

import { pathToFileURL } from 'node:url'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

// The lattice Maxwell (curl-curl) operator on a periodic L^3 lattice. Degrees of
// freedom are link variables A[site, direction]. Returns the eigenvalues (omega^2).
export function maxwellSpectrum(input: { side: number; mass: number }): number[] {
  const L = input.side
  const sites = L * L * L
  const dof = 3 * sites
  const siteIndex = (x: number, y: number, z: number): number =>
    ((x + L) % L) + L * (((y + L) % L) + L * ((z + L) % L))
  const link = (x: number, y: number, z: number, d: number): number => d + 3 * siteIndex(x, y, z)
  const step = (x: number, y: number, z: number, d: number): [number, number, number] =>
    d === 0 ? [x + 1, y, z] : d === 1 ? [x, y + 1, z] : [x, y, z + 1]

  const H = makeDense({ rows: dof, cols: dof })
  // For each plaquette F = A[a] + A[b] - A[c] - A[d], add (grad F)(grad F)^T.
  for (let x = 0; x < L; x++) {
    for (let y = 0; y < L; y++) {
      for (let z = 0; z < L; z++) {
        for (const [d1, d2] of [[0, 1], [0, 2], [1, 2]] as const) {
          const [x1, y1, z1] = step(x, y, z, d1)
          const [x2, y2, z2] = step(x, y, z, d2)
          const links = [link(x, y, z, d1), link(x1, y1, z1, d2), link(x2, y2, z2, d1), link(x, y, z, d2)]
          const signs = [1, 1, -1, -1]
          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              const ia = links[a] ?? 0
              const ib = links[b] ?? 0
              H.data[ia * dof + ib] = (H.data[ia * dof + ib] ?? 0) + (signs[a] ?? 0) * (signs[b] ?? 0)
            }
          }
        }
      }
    }
  }
  // A photon mass term (Proca) adds m^2 to every diagonal, lifting the gauge modes.
  if (input.mass !== 0) {
    for (let i = 0; i < dof; i++) {
      H.data[i * dof + i] = (H.data[i * dof + i] ?? 0) + input.mass * input.mass
    }
  }
  return Array.from(eigSymmetric({ matrix: H }).values).sort((a, b) => a - b)
}

function summarize(values: number[]): { gauge: number; physical: number; minPhysical: number } {
  const tol = 1e-6
  let gauge = 0
  let physical = 0
  let minPhysical = Infinity
  for (const v of values) {
    if (v < tol) {
      gauge += 1
    } else {
      physical += 1
      minPhysical = Math.min(minPhysical, v)
    }
  }
  return { gauge, physical, minPhysical }
}

export function photonStudy(input: { side: number }): {
  side: number
  dof: number
  gauge: number
  physical: number
  minPhysicalOmega2: number
  massiveMinOmega2: number
} {
  const free = summarize(maxwellSpectrum({ side: input.side, mass: 0 }))
  const massive = summarize(maxwellSpectrum({ side: input.side, mass: 1 }))
  return {
    side: input.side,
    dof: 3 * input.side ** 3,
    gauge: free.gauge,
    physical: free.physical,
    minPhysicalOmega2: free.minPhysical,
    massiveMinOmega2: massive.minPhysical,
  }
}

export function main(): void {
  console.log('P20: the photon (free U(1) gauge field on a periodic 3D lattice)')
  console.log('')
  console.log('  L   links   gauge modes   physical modes   min physical omega^2   (massive: min omega^2)')
  for (const side of [3, 4, 5]) {
    const r = photonStudy({ side })
    console.log(
      `  ${side}   ${String(r.dof).padStart(5)}   ${String(r.gauge).padStart(11)}   ${String(r.physical).padStart(14)}   ${r.minPhysicalOmega2.toFixed(3).padStart(20)}   ${r.massiveMinOmega2.toFixed(2)}`,
    )
  }
  console.log('')
  console.log('  Three photon facts come straight out:')
  console.log('  - Gauge invariance: about one third of the modes (the gradient, longitudinal')
  console.log('    directions) are EXACT zero modes, the photon gauge freedom. The physical')
  console.log('    modes are the other two thirds, the two transverse polarizations.')
  console.log('  - Massless: the smallest physical omega^2 SHRINKS as the lattice grows (the')
  console.log('    lowest momentum 2pi/L falls), so the photon has no gap, omega -> 0 as k -> 0.')
  console.log('  - Contrast: a mass term (Proca) gives a fixed gap (min omega^2 near m^2 = 1),')
  console.log('    independent of L. The free gauge field is massless, a massive one is not.')
  console.log('')
  console.log('  So the photon is fully present: the U(1) gauge field couples to matter (P8) and')
  console.log('  propagates as a massless, gauge-invariant, two-polarization field. The graviton')
  console.log('  (a propagating spin-2 mode) and a Higgs scalar are the fields still to add.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
