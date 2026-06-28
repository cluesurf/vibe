// EXTERNAL THEORY: D'Ariano and Perinotti, doubly-special relativity from a quantum cellular automaton
// (author-bridges/dariano-perinotti.md, experiment E-FND-08 / E-DEC-01). Their claim: a FIXED discrete
// lattice does not break Lorentz invariance, it DEFORMS it, keeping two invariants instead of one (the
// low-energy speed c AND the cell scale), recovering ordinary relativity at low momentum. This is the
// fixed-lattice answer to the causal-set (Sorkin) challenge that you must randomize the lattice to keep
// boosts.
//
// Tested on vibe's emergent Dirac walk, whose dispersion cos(omega) = cos(m) cos(k) is read from the one-step
// walk operator (coinedWalkDispersion). Checks: (1) ordinary Lorentz recovered at low momentum, (2) a maximum
// frequency exists (a cell-scale second invariant), (3) the signal speed caps at c and collapses at the band
// edge. CONTROL: the continuum dispersion (scanDispersionBand over continuumDispersion) is unbounded, so it
// must give NO to "a maximum frequency exists", which is the discriminator.

import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import {
  continuumDispersion,
  scanDispersionBand,
} from '@/code/measure/doubly-special'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PI = Math.PI

export default experiment({
  id: 'relativity/doubly-special-dispersion',
  code: 'E-RLT-0010',
  title:
    "vibe's fixed-lattice dispersion recovers Lorentz at low momentum and deforms to a doubly-special form with a cell-scale maximum frequency (D'Ariano), absent in the continuum",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const m = 0.3 // a representative mass gap, in band units
    const samples = 4096
    const latticeOmega = (k: number, mass: number): number =>
      coinedWalkDispersion({ theta: mass, k })

    // (1) Lorentz recovered at low momentum: omega^2 - k^2 -> m^2 as k -> 0.
    const kLow = 0.01
    const wLow = latticeOmega(kLow, m)
    const lorentzResidual = Math.abs(wLow * wLow - kLow * kLow - m * m)
    const lorentzRecovered = lorentzResidual < 1e-3

    // (2) and (3): the lattice band capped near the cell scale, signal speed capped at c, collapsing at edge.
    const lattice = scanDispersionBand({
      omega: latticeOmega,
      m,
      samples,
    })

    // CONTROL: the continuum band scanned far past the cell scale exposes the absence of a cap.
    const continuum = scanDispersionBand({
      omega: continuumDispersion,
      m,
      samples,
      kMax: 200,
    })

    const maxFrequencyBounded =
      lattice.maxOmega < PI && lattice.maxOmega > m

    const speedCappedAtC = lattice.maxGroupVelocity <= 1 + 1e-6
    const groupVelocityCollapsesAtEdge =
      Math.abs(lattice.groupVelocityAtEdge) < 0.05

    const continuumUnbounded = continuum.maxOmega > 10 * PI

    const ok =
      lorentzRecovered &&
      maxFrequencyBounded &&
      speedCappedAtC &&
      groupVelocityCollapsesAtEdge &&
      continuumUnbounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "vibe's emergent walk dispersion recovers ordinary Lorentz at low momentum and develops a doubly-special deformation with a maximum frequency at the cell scale and a signal speed capped at c that collapses at the band edge, a second invariant the continuum lacks, validating the D'Ariano fixed-lattice route to relativity with no randomness",
      metrics: {
        lorentzResidual,
        latticeMaxOmega: lattice.maxOmega,
        latticeMaxGroupVelocity: lattice.maxGroupVelocity,
        latticeGroupVelocityAtEdge: lattice.groupVelocityAtEdge,
      },
      control: {
        continuumMaxOmega: continuum.maxOmega,
        continuumMaxGroupVelocity: continuum.maxGroupVelocity,
      },
      notes:
        "L2, reproduces the known doubly-special-from-a-quantum-cellular-automaton result (D'Ariano-Perinotti) on vibe's emergent walk. The dispersion is read from the closed-form one-step operator trace cos(omega)=cos(m)cos(k), a property of the emergent walk operator, not a stepped-simulation readout (see relativity/dirac-from-discrete for the DFT of the stepped walk). The continuum control (unbounded frequency) makes the cell-scale cap meaningful. This is the fixed-lattice answer to the causal-set (Sorkin) Lorentz challenge: a second invariant, not a preferred frame.",
    })
  },
})
