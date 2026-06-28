// Conformance for code/measure/doubly-special.
//   - continuumDispersion is sqrt(m^2 + k^2).
//   - scanDispersionBand on the massless continuum omega = k is UNBOUNDED in frequency (maxOmega =
//     kMax) with group velocity pinned at 1 everywhere (the control: no second invariant).
//   - scanDispersionBand on a lattice band omega = 2 sin(k/2) over [0, pi] caps the frequency at 2
//     (the cell-scale second invariant) and the group velocity COLLAPSES to ~0 at the band edge
//     (cos(k/2) -> 0 at k = pi), the doubly-special signature. Both re-derived by hand.

import { suite, check, close } from '@/test/code/harness'
import { continuumDispersion, scanDispersionBand } from '@/code/measure/doubly-special'

const TIGHT = 1e-9

suite('measure/doubly-special: continuumDispersion', [
  check('sqrt(m^2 + k^2): m=0 -> |k|, and a 3-4-5', () => {
    close(continuumDispersion(3, 0), 3, TIGHT)
    close(continuumDispersion(4, 3), 5, TIGHT)
  }),
])

suite('measure/doubly-special: continuum control (no caps)', [
  check('massless continuum: maxOmega = kMax, group velocity = 1 throughout', () => {
    const band = scanDispersionBand({
      omega: k => continuumDispersion(k, 0),
      m: 0,
      samples: 1000,
      kMax: Math.PI,
    })

    close(band.maxOmega, Math.PI, TIGHT)
    close(band.maxGroupVelocity, 1, TIGHT)
    close(band.groupVelocityAtEdge, 1, TIGHT)
  }),
])

suite('measure/doubly-special: lattice band signatures', [
  check('omega = 2 sin(k/2) caps maxOmega at 2 and collapses the edge velocity to ~0', () => {
    const band = scanDispersionBand({
      omega: k => 2 * Math.sin(k / 2),
      m: 0,
      samples: 2000,
      kMax: Math.PI,
    })

    close(band.maxOmega, 2, 1e-6) // frequency cap at the cell scale
    close(band.maxGroupVelocity, 1, 1e-3) // speed still capped at c near k = 0
    close(band.groupVelocityAtEdge, 0, 1e-2) // signal speed collapses at the band edge
  }),
])
