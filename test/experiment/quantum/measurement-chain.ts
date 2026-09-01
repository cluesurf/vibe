// The macroscopic measurement chain, made quantitative by quantum Darwinism. The open question
// was how a microscopic superposition becomes a macroscopic definite record. The chain: the
// system copies its pointer value onto many environment cells, each copy imperfect (the two
// pointer-conditional environment states overlap by a constant per cell). Three things then
// happen at once, all computed exactly because the branch overlaps factorize. The system's
// coherence decays exponentially in the number of copies (amplified decoherence, the branches
// become macroscopically distinct). Any SMALL fragment of the environment already carries
// essentially all the pointer information (the mutual information rises to the classical plateau
// within a few cells). And the record is redundant: many disjoint fragments each suffice, so many
// observers agree by reading different parts of the environment, which is what makes the outcome
// objective. That is the amplification chain from micro superposition to macroscopic redundant
// record.
//
// The control is the closed system (no copies): coherence stays exactly one and no environment
// fragment carries any information, so the chain is specifically the copying, not time passing.
//
// Depth L2. It computes the exact decoherence, plateau, and redundancy of the copy chain (the
// quantum Darwinism structure) with the no-copy control, the measurement chain at the model
// level made quantitative and scalable.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  fragmentMutualInformation,
  chainCoherence,
} from '@/code/measure/darwinism'

const WEIGHT0 = 0.36
const WEIGHT1 = 0.64
const OVERLAP = 0.8
const CELLS = 200

export default experiment({
  id: 'quantum/measurement-chain',
  code: 'E-QTM-0066',
  title:
    'the copy chain turns a micro superposition into a macroscopic record: coherence decays exponentially in the copies, a twenty-cell fragment of two hundred carries the full pointer information, and ten disjoint fragments each suffice (redundant objectivity)',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // amplified decoherence: the system coherence after the chain
    const coherence = chainCoherence({ overlap: OVERLAP, total: CELLS })

    // the classical plateau: pointer entropy the fragments can reach
    const plateau =
      -WEIGHT0 * Math.log2(WEIGHT0) - WEIGHT1 * Math.log2(WEIGHT1)

    const information = (fragment: number): number =>
      fragmentMutualInformation({
        weight0: WEIGHT0,
        weight1: WEIGHT1,
        overlap: OVERLAP,
        total: CELLS,
        fragment,
      })

    const smallFragment = information(20)
    const singleCell = information(1)

    // redundancy: the smallest fragment reaching ninety-nine percent of the plateau
    let sufficient = CELLS

    for (let k = 1; k <= CELLS; k++) {
      if (information(k) >= 0.99 * plateau) {
        sufficient = k
        break
      }
    }

    const redundancy = Math.floor(CELLS / sufficient)

    // CONTROL: the closed system, no copies, coherence exactly one and no information anywhere
    const closedCoherence = chainCoherence({
      overlap: OVERLAP,
      total: 0,
    })

    const closedInformation = fragmentMutualInformation({
      weight0: WEIGHT0,
      weight1: WEIGHT1,
      overlap: OVERLAP,
      total: 0,
      fragment: 0,
    })

    const decohered = coherence < 1e-15
    const plateauReached = smallFragment > 0.99 * plateau
    const risesFast = singleCell > 0.3 * plateau
    const redundant = redundancy >= 10
    const closedIntact =
      Math.abs(closedCoherence - 1) < 1e-15 &&
      Math.abs(closedInformation) < 1e-12

    const ok =
      decohered &&
      plateauReached &&
      risesFast &&
      redundant &&
      closedIntact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'copying the pointer value onto two hundred environment cells with imperfect per-cell copies kills the system coherence to below one part in a thousand trillion (exponential in the copy count, the branches macroscopically distinct), while a fragment of just twenty cells already carries ninety-nine percent of the classical pointer entropy (the Darwinism plateau, a single cell already forty-some percent) so at least ten disjoint fragments each independently reveal the outcome (redundant, hence objective, record), and the closed no-copy control keeps coherence exactly one with zero information in the environment, so the macroscopic measurement chain is the copying cascade: amplification, decoherence, and objectivity in one exactly-computed structure',
      metrics: {
        coherenceAfterChain: Number(coherence.toExponential(2)),
        plateauEntropy: Number(plateau.toFixed(4)),
        twentyCellInformation: Number(smallFragment.toFixed(4)),
        singleCellInformation: Number(singleCell.toFixed(4)),
        sufficientFragment: sufficient,
        redundancy,
      },
      // CONTROL: the closed system keeps coherence one, no record without copying.
      control: { closedCoherence: Number(closedCoherence.toFixed(6)) },
      notes:
        'Quantum Darwinism (Zurek): amplified decoherence, information plateau, redundancy. The macroscopic measurement chain at the model level, exact via factorized branch overlaps. Completes the chain items with definite outcomes (E-QTM-0043) and record immunity (E-QTM-0049, E-QTM-0050).',
    })
  },
})
