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

import { maxwellLatticeSpectrum } from '@/code/operator/maxwell-lattice'
import { zeroModeCensus } from '@/code/measure/spectrum'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The lattice Maxwell (curl-curl) spectrum on a periodic L^3 lattice (omega^2 eigenvalues).
export function maxwellSpectrum(input: { side: number; mass: number }): number[] {
  return maxwellLatticeSpectrum(input)
}

// Gauge zero modes versus physical (nonzero) modes, with the smallest physical omega^2.
function summarize(values: number[]): { gauge: number; physical: number; minPhysical: number } {
  const census = zeroModeCensus(values)
  return { gauge: census.zero, physical: census.nonzero, minPhysical: census.minNonzero }
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
  depth: 'L1',
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
        'the lattice Maxwell curl-curl operator has about a third gauge zero modes (gauge invariance), a gapless physical spectrum that closes as the lattice grows (a massless photon), and a fixed gap when a mass term is added (the massive-vector control)',
      metrics: {
        gaugeFraction,
        minPhysicalOmega2Small: a.minPhysicalOmega2,
        minPhysicalOmega2Large: b.minPhysicalOmega2,
        massiveMinOmega2: a.massiveMinOmega2,
      },
      notes:
        'L1, known physics. This reads the spectrum of the standard lattice Maxwell curl-curl operator and confirms the free U(1) field is massless and gauge-invariant, with the massive vector as the discriminating control that could have failed. The operator is the textbook construction, so this reproduces free lattice electromagnetism, it does not DERIVE the photon from the substrate rule. The substrate-emergent photon (the 8v sector under the actual rule) is gauge/ph-photon-3434.',
    })
  },
})
