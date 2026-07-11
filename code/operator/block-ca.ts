// Partitioned (Margolus-style) reversible cellular automata. The ring is tiled
// into consecutive blocks, a reversible gate is applied to each block, and the
// tiling is shifted by one cell and repeated until every offset is covered. This
// gives a local, reversible, information-propagating rule whose global update is a
// basis permutation. We use it to ask whether a generic (non-Clifford) local rule
// has a more local Hamiltonian than the linear XOR-parity rule. See
// note/questions/roadmap.md and note/experiment/results/p1-locality.md.

import {
  ComplexMatrix,
  makeComplexMatrix,
} from '@/code/algebra/linear/dense'

// A reversible gate on a block of `blockSize` cells, given as a permutation of the
// 2^blockSize block values.
export type BlockGate = (value: number) => number

// CNOT on a 2-cell block: flip cell 1 if cell 0 is set (Clifford).
export function cnotGate(value: number): number {
  const b0 = value & 1
  const b1 = (value >> 1) & 1

  return b0 | ((b1 ^ b0) << 1)
}

// Toffoli on a 3-cell block: flip cell 2 if cells 0 and 1 are both set
// (non-Clifford, universal for classical reversible computing).
export function toffoliGate(value: number): number {
  const b0 = value & 1
  const b1 = (value >> 1) & 1
  const b2 = (value >> 2) & 1

  return b0 | (b1 << 1) | ((b2 ^ (b0 & b1)) << 2)
}

function applySweep(input: {
  state: number
  cells: number
  blockSize: number
  gate: BlockGate
  offsets: number
}): number {
  let state = input.state

  const { cells, blockSize, gate } = input

  // offsets = 1 is a single disjoint-block layer (no propagation, block-local H).
  // offsets = blockSize covers every shift, so information propagates.
  for (let offset = 0; offset < input.offsets; offset++) {
    for (
      let start = offset;
      start < offset + cells;
      start += blockSize
    ) {
      // Extract the block value from positions (start + j) mod cells.
      let v = 0

      for (let j = 0; j < blockSize; j++) {
        const pos = (start + j) % cells

        v |= ((state >> pos) & 1) << j
      }

      const w = gate(v)

      // Write the gated block back.
      for (let j = 0; j < blockSize; j++) {
        const pos = (start + j) % cells
        const bit = (w >> j) & 1

        if (((state >> pos) & 1) !== bit) {
          state ^= 1 << pos
        }
      }
    }
  }

  return state
}

// The explicit LOCAL branch of the Hamiltonian for a single disjoint-block layer
// (an involution gate): H = sum over blocks of (pi/2)(I - G_block). Because the
// blocks are disjoint and the gates are involutions, these terms commute and
// e^{-iH} = product of the gates = U, so this is a genuine log of U. Each term is
// block-local, so H is local AND bounded below (energies in [0, blocks * pi]).
// This is the branch the principal-branch construction misses. Requires the gate
// to be an involution (CNOT and Toffoli are).
export function commutingBlockHamiltonian(input: {
  cells: number
  blockSize: number
  gate: BlockGate
}): ComplexMatrix {
  const { cells, blockSize, gate } = input
  const n = 1 << cells
  const h = makeComplexMatrix({ rows: n, cols: n })
  const half = Math.PI / 2

  for (let p = 0; p < cells; p += blockSize) {
    for (let c = 0; c < n; c++) {
      // Apply the gate to the block at p only.
      let v = 0

      for (let j = 0; j < blockSize; j++) {
        v |= ((c >> ((p + j) % cells)) & 1) << j
      }

      const w = gate(v)

      let target = c

      for (let j = 0; j < blockSize; j++) {
        const pos = (p + j) % cells
        const bit = (w >> j) & 1

        if (((target >> pos) & 1) !== bit) {
          target ^= 1 << pos
        }
      }

      // (pi/2)(I - G_block): +pi/2 on the diagonal, -pi/2 at [g(c)][c].
      h.re[c * n + c] = (h.re[c * n + c] ?? 0) + half
      h.re[target * n + c] = (h.re[target * n + c] ?? 0) - half
    }
  }

  return h
}

// The global permutation of a partitioned block CA over `cells` cells. `offsets`
// defaults to blockSize (a fully propagating rule); pass 1 for a single
// disjoint-block layer (a block-local, non-propagating control).
export function blockCaPermutation(input: {
  cells: number
  blockSize: number
  gate: BlockGate
  offsets?: number
}): Int32Array {
  const n = 1 << input.cells
  const perm = new Int32Array(n)
  const offsets = input.offsets ?? input.blockSize

  for (let s = 0; s < n; s++) {
    perm[s] = applySweep({
      state: s,
      cells: input.cells,
      blockSize: input.blockSize,
      gate: input.gate,
      offsets,
    })
  }

  return perm
}
