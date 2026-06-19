// P1: a local rule whose energy is bounded below.
// Build a small reversible cellular automaton, form its global permutation, and
// read the energy spectrum off the cycle structure.
// Run: npx tsx code/experiment/p1-hamiltonian.ts

import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import {
  makeStateSpace,
  permutationOfRule,
  hamiltonianFromPermutation,
} from '@/code/operator/evolution'
import { Alphabet } from '@/code/tone/alphabet'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function study(): {
  isPermutation: boolean
  boundedBelow: boolean
  levels: number
} {
  const cells = 8
  const substrate = lattice({
    dimension: 1,
    extent: cells,
    signature: 'riemannian',
  })
  const alphabet: Alphabet = { form: 'boolean' }
  const space = makeStateSpace({ cells, alphabet })

  // self XOR parity(neighbors): a linear, reversible-flavoured rule.
  const rule = reversibleEvenOdd({
    name: 'xor-parity',
    local: ({ self, neighborhood }) => {
      let parity = 0
      for (const t of neighborhood) {
        parity ^= t & 1
      }
      return (self ^ parity) & 1
    },
  })

  const perm = permutationOfRule({ rule, substrate, space })
  const h = hamiltonianFromPermutation({ perm })
  const levels = new Set(
    Array.from(h.eigenvalues, x => Math.round(x * 1e6) / 1e6),
  ).size

  return {
    isPermutation: h.isPermutation,
    boundedBelow: h.boundedBelow,
    levels,
  }
}

export default experiment({
  id: 'foundations/hamiltonian',
  title:
    'a reversible cellular automaton gives a permutation Hamiltonian bounded below',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = study()
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
