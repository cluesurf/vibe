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

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

export default defineExperiment({
  id: 'gauge/photon',
  title:
    'the free U(1) gauge field is massless and gauge-invariant with about a third gauge zero modes',
  category: 'gauge',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const a = photonStudy({ side: 3 })
    const b = photonStudy({ side: 4 })
    const gaugeFraction = a.gauge / a.dof
    const ok =
      gaugeFraction > 0.25 &&
      gaugeFraction < 0.42 &&
      b.minPhysicalOmega2 < a.minPhysicalOmega2 &&
      a.massiveMinOmega2 > 0.9 &&
      a.massiveMinOmega2 < 1.1
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the assumed lattice Maxwell operator has about a third gauge zero modes, a gapless physical spectrum, and a fixed gap when a mass term is added',
      metrics: {
        gaugeFraction,
        minPhysicalOmega2Small: a.minPhysicalOmega2,
        minPhysicalOmega2Large: b.minPhysicalOmega2,
        massiveMinOmega2: a.massiveMinOmega2,
      },
      notes:
        'an analytic spectrum of the assumed lattice Maxwell curl-curl operator, not a derivation of the photon from the substrate',
    })
  },
})
