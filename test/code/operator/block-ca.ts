// Conformance for code/operator/block-ca: partitioned reversible CA, its global
// permutation, and the commuting-block Hamiltonian. Re-derivable facts:
//   - cnotGate and toffoliGate are involutions (their own inverse) and bijections.
//   - blockCaPermutation is a permutation (reversible), and the disjoint-block
//     layer (offsets = 1) equals applying the gate to each block independently.
//   - commutingBlockHamiltonian is real symmetric (Hermitian) and equals
//     sum_p (pi/2)(I - G_p), where the per-block terms G_p genuinely commute.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  cnotGate,
  toffoliGate,
  blockCaPermutation,
  commutingBlockHamiltonian,
  BlockGate,
} from '@/code/operator/block-ca'
import { matrixProduct } from '@/code/algebra/linear/dense'

function isInvolution(gate: BlockGate, size: number): boolean {
  for (let v = 0; v < size; v++) {
    if (gate(gate(v)) !== v) {
      return false
    }
  }

  return true
}

function isBijection(gate: BlockGate, size: number): boolean {
  const seen = new Set<number>()

  for (let v = 0; v < size; v++) {
    const w = gate(v)

    if (w < 0 || w >= size) {
      return false
    }

    seen.add(w)
  }

  return seen.size === size
}

function isPermutation(values: Int32Array): boolean {
  const seen = new Set<number>()

  for (const v of values) {
    seen.add(v)
  }

  return seen.size === values.length
}

// Independent reconstruction of one disjoint-block sweep (offsets = 1): apply the
// gate to each block at start positions 0, blockSize, 2*blockSize, ...
function disjointSweep(input: {
  state: number
  cells: number
  blockSize: number
  gate: BlockGate
}): number {
  let state = input.state

  for (let start = 0; start < input.cells; start += input.blockSize) {
    let v = 0

    for (let j = 0; j < input.blockSize; j++) {
      const pos = (start + j) % input.cells
      v |= ((state >> pos) & 1) << j
    }

    const w = input.gate(v)

    for (let j = 0; j < input.blockSize; j++) {
      const pos = (start + j) % input.cells
      const bit = (w >> j) & 1

      if (((state >> pos) & 1) !== bit) {
        state ^= 1 << pos
      }
    }
  }

  return state
}

// The permutation matrix G_p of the gate acting on the block at offset p: G[g(c)][c] = 1.
function blockGateMatrix(input: {
  cells: number
  blockSize: number
  gate: BlockGate
  offset: number
}): number[][] {
  const n = 1 << input.cells
  const G = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )

  for (let c = 0; c < n; c++) {
    let v = 0

    for (let j = 0; j < input.blockSize; j++) {
      v |= ((c >> ((input.offset + j) % input.cells)) & 1) << j
    }

    const w = input.gate(v)

    let target = c

    for (let j = 0; j < input.blockSize; j++) {
      const pos = (input.offset + j) % input.cells
      const bit = (w >> j) & 1

      if (((target >> pos) & 1) !== bit) {
        target ^= 1 << pos
      }
    }

    G[target]![c] = 1
  }

  return G
}

// (pi/2)(I - G).
function termMatrix(G: number[][]): number[][] {
  const n = G.length
  const half = Math.PI / 2

  return Array.from({ length: n }, (_, i) =>
    Array.from(
      { length: n },
      (_, j) => half * ((i === j ? 1 : 0) - (G[i]![j] ?? 0)),
    ),
  )
}

suite('operator/block-ca: gates', [
  check('cnotGate is an involution and a bijection on 0..3', () => {
    ok(isInvolution(cnotGate, 4), 'cnot is its own inverse')
    ok(isBijection(cnotGate, 4), 'cnot permutes the 4 block values')
  }),
  check('toffoliGate is an involution and a bijection on 0..7', () => {
    ok(isInvolution(toffoliGate, 8), 'toffoli is its own inverse')
    ok(
      isBijection(toffoliGate, 8),
      'toffoli permutes the 8 block values',
    )
  }),
])

suite('operator/block-ca: global permutation', [
  check(
    'blockCaPermutation is a permutation (reversible) for cnot and toffoli',
    () => {
      const configs = [
        { cells: 4, blockSize: 2, gate: cnotGate },
        { cells: 6, blockSize: 3, gate: toffoliGate },
      ]

      for (const config of configs) {
        // default offsets (fully propagating) and the single disjoint layer.
        ok(
          isPermutation(blockCaPermutation(config)),
          `propagating perm cells=${config.cells}`,
        )
        ok(
          isPermutation(blockCaPermutation({ ...config, offsets: 1 })),
          `disjoint perm cells=${config.cells}`,
        )
      }
    },
  ),
  check(
    'the disjoint-block layer equals applying the gate to each block independently',
    () => {
      const cells = 4
      const blockSize = 2
      const got = blockCaPermutation({
        cells,
        blockSize,
        gate: cnotGate,
        offsets: 1,
      })

      for (let s = 0; s < 1 << cells; s++) {
        equal(
          got[s] ?? -1,
          disjointSweep({ state: s, cells, blockSize, gate: cnotGate }),
          `disjoint sweep on state ${s}`,
        )
      }
    },
  ),
])

suite('operator/block-ca: commuting-block Hamiltonian', [
  check('H is real symmetric (Hermitian)', () => {
    const h = commutingBlockHamiltonian({
      cells: 4,
      blockSize: 2,
      gate: cnotGate,
    })

    const n = h.rows

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(
          h.re[i * n + j] ?? 0,
          h.re[j * n + i] ?? 0,
          1e-12,
          `re sym (${i},${j})`,
        )
        equal(h.im[i * n + j] ?? 0, 0, `im must be zero (${i},${j})`)
      }
    }
  }),
  check('the per-block terms commute and sum to H', () => {
    const cells = 4
    const blockSize = 2
    // disjoint blocks live at offsets 0 and 2.
    const G0 = blockGateMatrix({
      cells,
      blockSize,
      gate: cnotGate,
      offset: 0,
    })

    const G2 = blockGateMatrix({
      cells,
      blockSize,
      gate: cnotGate,
      offset: 2,
    })

    const T0 = termMatrix(G0)
    const T2 = termMatrix(G2)

    const ab = matrixProduct(T0, T2)
    const ba = matrixProduct(T2, T0)
    const n = T0.length

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(
          ab[i]![j] ?? 0,
          ba[i]![j] ?? 0,
          1e-12,
          `[T0,T2] = 0 at (${i},${j})`,
        )
      }
    }

    // T0 + T2 must equal the assembled Hamiltonian.
    const h = commutingBlockHamiltonian({
      cells,
      blockSize,
      gate: cnotGate,
    })

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(
          h.re[i * n + j] ?? 0,
          (T0[i]![j] ?? 0) + (T2[i]![j] ?? 0),
          1e-12,
          `H = T0 + T2 at (${i},${j})`,
        )
      }
    }
  }),
])
