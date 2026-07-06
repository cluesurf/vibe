// The Hong-Ou-Mandel effect: exchange statistics decide what happens at a balanced splitter. Two
// identical bosons entering the two ports NEVER come out separately (the coincidence amplitude is
// the PERMANENT of the splitter matrix, which vanishes at balance), two identical fermions ALWAYS
// do (the amplitude is the DETERMINANT, magnitude one at balance), and distinguishable particles
// sit at one half. The walk coin at the balanced angle IS such a splitter, so the emergent layer
// carries the effect. The deep content is the permanent-determinant split, the algebraic face of
// exchange statistics.
//
// The control is the distinguishable pair: no exchange term, coincidence one half, so the zero
// and the one are specifically the interference of exchange, not splitter bookkeeping.
//
// Depth L1. It confirms the exact permanent (boson) and determinant (fermion) coincidence values
// at the balanced splitter, the Hong-Ou-Mandel dip and the fermion anti-dip, known quantum optics
// at the emergent layer.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  balancedSplitter,
  permanent2,
  determinant2,
  cAbs2,
} from '@/code/measure/exchange-statistics'

export default experiment({
  id: 'quantum/hong-ou-mandel',
  code: 'E-QTM-0063',
  title:
    'bosons never coincide at the balanced splitter (permanent zero, the Hong-Ou-Mandel dip), fermions always do (determinant one), distinguishable particles sit at one half',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const splitter = balancedSplitter()

    const bosonCoincidence = cAbs2(permanent2(splitter))
    const fermionCoincidence = cAbs2(determinant2(splitter))

    // CONTROL: distinguishable particles, no exchange term, the two paths add classically
    const distinguishable =
      cAbs2(splitter[0]![0]!) * cAbs2(splitter[1]![1]!) +
      cAbs2(splitter[0]![1]!) * cAbs2(splitter[1]![0]!)

    const dip = bosonCoincidence < 1e-12
    const antiDip = Math.abs(fermionCoincidence - 1) < 1e-12
    const half = Math.abs(distinguishable - 0.5) < 1e-12

    const ok = dip && antiDip && half

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'at the balanced splitter (the walk coin at the balanced angle) the boson coincidence probability is the squared permanent, exactly zero (the two exchange paths cancel, the Hong-Ou-Mandel dip, the pair always bunches), the fermion coincidence is the squared determinant, exactly one (the pair always antibunches, Pauli at the splitter), and distinguishable particles with no exchange term sit at exactly one half, so exchange statistics on the emergent layer are the permanent-determinant split',
      metrics: {
        bosonCoincidence: Number(bosonCoincidence.toExponential(2)),
        fermionCoincidence: Number(fermionCoincidence.toFixed(6)),
        distinguishableCoincidence: Number(distinguishable.toFixed(6)),
      },
      // CONTROL: distinguishable particles sit at one half, the exchange term is the effect.
      control: {
        distinguishableCoincidence: Number(distinguishable.toFixed(6)),
      },
      notes:
        'Hong-Ou-Mandel dip and fermion anti-dip via permanent versus determinant. Fills the bunching gap in the quantum coverage map. Companion to the Fock-structure result (E-QTM-0064).',
    })
  },
})
