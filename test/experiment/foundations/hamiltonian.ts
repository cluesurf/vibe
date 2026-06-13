// P1: a local rule whose energy is bounded below.
// Build a small reversible cellular automaton, form its global permutation, and
// read the energy spectrum off the cycle structure.
// Run: npx tsx code/experiment/p1-hamiltonian.ts

import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeStateSpace,
  permutationOfRule,
  hamiltonianFromPermutation,
} from '@/code/operator/evolution'
import { Alphabet } from '@/code/tone/alphabet'

export default defineExperiment({
  id: 'foundations/hamiltonian',
  title: 'a reversible cellular automaton gives a permutation Hamiltonian bounded below',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = main()
    const ok = r.isPermutation && r.boundedBelow && r.levels > 0
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a reversible XOR-parity cellular automaton has a global permutation operator whose energy spectrum is bounded below',
      metrics: {
        isPermutation: r.isPermutation ? 1 : 0,
        boundedBelow: r.boundedBelow ? 1 : 0,
        levels: r.levels,
      },
      notes:
        'L2, a reversible cellular automaton yields a bounded-below Hamiltonian by construction (its log spectrum), a known property, not an emergent claim. Locality is not tested here',
    })
  },
})
