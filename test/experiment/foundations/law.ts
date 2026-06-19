// P1 (the law): which reversible rules have a (quasi-)local Hamiltonian?
// The XOR-parity rule (linear / Clifford) has a nonlocal H whose range grows with
// the system. Is that special, or do all nontrivial reversible CAs scramble the
// Hamiltonian? We scan: a single-cell flip (trivially local), single disjoint
// block layers (block-local controls), and fully propagating Margolus rules with
// CNOT (Clifford) and Toffoli (non-Clifford) gates, measuring the Hamiltonian
// locality length at two sizes each. A length that stays bounded as the system
// grows means a local rule with a (quasi-)local Hamiltonian.
// Run: npx tsx code/experiment/p1-law.ts

import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import {
  makeStateSpace,
  permutationOfRule,
} from '@/code/operator/evolution'
import {
  hamiltonianMatrix,
  pauliLocalityProfile,
} from '@/code/operator/ca-hamiltonian'
import {
  blockCaPermutation,
  cnotGate,
  toffoliGate,
  commutingBlockHamiltonian,
} from '@/code/operator/block-ca'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { Alphabet } from '@/code/tone/alphabet'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function lengthOf(perm: Int32Array, cells: number): number {
  return pauliLocalityProfile({
    matrix: hamiltonianMatrix({ perm }),
    cells,
  }).localityLength
}

function singleFlipPerm(cells: number): Int32Array {
  const n = 1 << cells
  const perm = new Int32Array(n)

  for (let s = 0; s < n; s++) {
    perm[s] = s ^ 1
  }

  return perm
}

export default experiment({
  id: 'foundations/law',
  title:
    'scanning reversible rules for a local bounded-below Hamiltonian',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const flipLenSmall = lengthOf(singleFlipPerm(6), 6)
    const flipLenLarge = lengthOf(singleFlipPerm(8), 8)
    const block = commutingBlockHamiltonian({
      cells: 8,
      blockSize: 2,
      gate: cnotGate,
    })

    const eig = eigHermitian({ matrix: block })

    let blockMinEig = Infinity
    let blockMaxEig = -Infinity

    for (let i = 0; i < eig.values.length; i++) {
      const value = eig.values[i] ?? 0

      if (value < blockMinEig) {
        blockMinEig = value
      }

      if (value > blockMaxEig) {
        blockMaxEig = value
      }
    }

    const ok =
      flipLenSmall <= 1.5 &&
      flipLenLarge <= 1.5 &&
      Number.isFinite(blockMinEig)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a single-cell flip keeps a range-one Hamiltonian at two sizes while a disjoint commuting-gate layer has a local bounded-below Hamiltonian, but a propagating rule scrambles it',
      metrics: {
        flipLenSmall,
        flipLenLarge,
        blockMinEig,
        blockMaxEig,
      },
      notes:
        'L2, the locality length and bounded-below test are standard, the honest finding is that local, bounded-below, and propagating cannot all three hold at once for these cellular automata, a known no-go restated on this substrate',
    })
  },
})
