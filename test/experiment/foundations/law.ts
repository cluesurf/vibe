// P1 (the law): which reversible rules have a (quasi-)local Hamiltonian?
// The XOR-parity rule (linear / Clifford) has a nonlocal H whose range grows with
// the system. Is that special, or do all nontrivial reversible CAs scramble the
// Hamiltonian? We scan: a single-cell flip (trivially local), single disjoint
// block layers (block-local controls), and fully propagating Margolus rules with
// CNOT (Clifford) and Toffoli (non-Clifford) gates, measuring the Hamiltonian
// locality length at two sizes each. A length that stays bounded as the system
// grows means a local rule with a (quasi-)local Hamiltonian.
// Run: npx tsx code/experiment/p1-law.ts

import { pathToFileURL } from 'node:url'
import { lattice } from '@/code/substrate/lattice'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import { makeStateSpace, permutationOfRule } from '@/code/operator/evolution'
import { hamiltonianMatrix, pauliLocalityProfile } from '@/code/operator/ca-hamiltonian'
import {
  blockCaPermutation,
  cnotGate,
  toffoliGate,
  commutingBlockHamiltonian,
} from '@/code/operator/block-ca'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { Alphabet } from '@/code/tone/alphabet'

function lengthOf(perm: Int32Array, cells: number): number {
  return pauliLocalityProfile({ matrix: hamiltonianMatrix({ perm }), cells })
    .localityLength
}

function singleFlipPerm(cells: number): Int32Array {
  const n = 1 << cells
  const perm = new Int32Array(n)
  for (let s = 0; s < n; s++) {
    perm[s] = s ^ 1
  }
  return perm
}

function xorParityPerm(cells: number): Int32Array {
  const substrate = lattice({ dimension: 1, extent: cells, signature: 'riemannian' })
  const alphabet: Alphabet = { form: 'boolean' }
  const space = makeStateSpace({ cells, alphabet })
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
  return permutationOfRule({ rule, substrate, space })
}

export function main(): void {
  console.log('P1 (the law): Hamiltonian locality length across reversible rules')
  console.log('  rule                          length@small  length@large  grows?')

  const rows: Array<{ name: string; small: number; large: number; sizes: string }> = []

  rows.push({
    name: 'single-cell flip (control)',
    small: lengthOf(singleFlipPerm(6), 6),
    large: lengthOf(singleFlipPerm(8), 8),
    sizes: '6,8',
  })
  rows.push({
    name: 'disjoint CNOT layer (control)',
    small: lengthOf(blockCaPermutation({ cells: 6, blockSize: 2, gate: cnotGate, offsets: 1 }), 6),
    large: lengthOf(blockCaPermutation({ cells: 8, blockSize: 2, gate: cnotGate, offsets: 1 }), 8),
    sizes: '6,8',
  })
  rows.push({
    name: 'disjoint Toffoli layer (control)',
    small: lengthOf(blockCaPermutation({ cells: 6, blockSize: 3, gate: toffoliGate, offsets: 1 }), 6),
    large: lengthOf(blockCaPermutation({ cells: 9, blockSize: 3, gate: toffoliGate, offsets: 1 }), 9),
    sizes: '6,9',
  })
  rows.push({
    name: 'propagating CNOT (Margolus)',
    small: lengthOf(blockCaPermutation({ cells: 6, blockSize: 2, gate: cnotGate }), 6),
    large: lengthOf(blockCaPermutation({ cells: 8, blockSize: 2, gate: cnotGate }), 8),
    sizes: '6,8',
  })
  rows.push({
    name: 'propagating Toffoli (Margolus)',
    small: lengthOf(blockCaPermutation({ cells: 6, blockSize: 3, gate: toffoliGate }), 6),
    large: lengthOf(blockCaPermutation({ cells: 9, blockSize: 3, gate: toffoliGate }), 9),
    sizes: '6,9',
  })
  rows.push({
    name: 'XOR-parity (linear/Clifford)',
    small: lengthOf(xorParityPerm(6), 6),
    large: lengthOf(xorParityPerm(8), 8),
    sizes: '6,8',
  })

  for (const r of rows) {
    const grows = r.large > r.small + 0.5 ? 'YES' : 'no'
    console.log(
      `  ${r.name.padEnd(30)} ${r.small.toFixed(2).padStart(11)}  ${r.large.toFixed(2).padStart(12)}  ${grows.padStart(5)}  (N=${r.sizes})`,
    )
  }
  console.log('')
  console.log('  bounded length (no growth) = a (quasi-)local Hamiltonian.')
  console.log('  length growing with N = the rule scrambles H across the system.')

  // The local branch: for a disjoint commuting-gate layer, an explicit LOCAL log
  // exists (the principal branch above misses it). Show it is local and bounded
  // below for both sizes.
  console.log('')
  console.log('  --- the local branch (disjoint CNOT layer, H = sum of block logs) ---')
  for (const cells of [6, 8]) {
    const h = commutingBlockHamiltonian({ cells, blockSize: 2, gate: cnotGate })
    const length = pauliLocalityProfile({ matrix: h, cells }).localityLength
    const eig = eigHermitian({ matrix: h })
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i < eig.values.length; i++) {
      const v = eig.values[i] ?? 0
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    console.log(
      `  N=${cells}: locality length ${length.toFixed(2)} (bounded), energy in [${lo.toFixed(2)}, ${hi.toFixed(2)}] (bounded below)`,
    )
  }
  console.log('')
  console.log('  So: a local AND bounded-below Hamiltonian exists for commuting-gate')
  console.log('  rules, but only the principal (minimal-energy) branch is unique, and')
  console.log('  that branch is nonlocal once the rule propagates. Local, bounded-below,')
  console.log('  and propagating cannot all three hold at once for these CAs.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
