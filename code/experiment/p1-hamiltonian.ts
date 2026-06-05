// P1: a local rule whose energy is bounded below.
// Build a small reversible cellular automaton, form its global permutation, and
// read the energy spectrum off the cycle structure.
// Run: npx tsx code/experiment/p1-hamiltonian.ts

import { pathToFileURL } from 'node:url'
import { lattice } from '~/substrate/lattice'
import { reversibleEvenOdd } from '~/rule/reversible'
import {
  makeStateSpace,
  permutationOfRule,
  hamiltonianFromPermutation,
} from '~/operator/evolution'
import { Alphabet } from '~/tone/alphabet'

export function main(): {
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
    Array.from(h.eigenvalues, (x) => Math.round(x * 1e6) / 1e6),
  ).size

  console.log('P1 Hamiltonian from a reversible rule')
  console.log('  state-space dimension:', space.dimension)
  console.log('  is a permutation     :', h.isPermutation)
  console.log('  bounded below        :', h.boundedBelow)
  console.log('  distinct energy levels:', levels)
  return { isPermutation: h.isPermutation, boundedBelow: h.boundedBelow, levels }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
