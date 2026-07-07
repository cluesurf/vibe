// Reduced density matrices and their information measures for a small many-qubit pure state,
// by exact partial trace. Given a pure state as flat real and imaginary amplitude arrays over
// `qubitCount` qubits (index = sum_i bit_i 2^i, qubit i the i-th bit), this traces out the
// complement of a kept qubit set to form the reduced density matrix, and reads the von Neumann
// entropy and the quantum mutual information off it. The partial trace is real linear algebra, so
// everything here is deterministic and exact. Used by the emergent-classicality experiments to
// measure decoherence and the redundancy of records from the actual reduced state, not a
// factorized formula. Sizes are small (a system qubit plus a handful of environment qubits), so
// the dense 2^k density matrices are cheap.

import {
  makeComplexMatrix,
  type ComplexMatrix,
} from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'

// Scatter the `count` low bits of `value` onto the qubit `positions` (ascending), returning the
// full-state index contribution. positions[j] receives bit j of value.
function scatterBits(input: {
  value: number
  positions: number[]
}): number {
  const { value, positions } = input
  let index = 0

  for (let j = 0; j < positions.length; j++) {
    if ((value >> j) & 1) {
      index |= 1 << positions[j]!
    }
  }

  return index
}

// The reduced density matrix on the kept qubits, tracing out the rest. `keep` is a list of qubit
// indices (any order); the returned matrix is 2^keep.length square, row-major, in the basis whose
// bit j is qubit keep[j].
export function reducedDensityMatrix(input: {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
  keep: number[]
}): ComplexMatrix {
  const { real, imag, qubitCount, keep } = input
  const keptCount = keep.length
  const traced: number[] = []

  for (let q = 0; q < qubitCount; q++) {
    if (!keep.includes(q)) {
      traced.push(q)
    }
  }

  const keptDim = 1 << keptCount
  const tracedDim = 1 << traced.length
  const rho = makeComplexMatrix({ rows: keptDim, cols: keptDim })

  for (let e = 0; e < tracedDim; e++) {
    const envIndex = scatterBits({ value: e, positions: traced })

    for (let a = 0; a < keptDim; a++) {
      const indexA = envIndex | scatterBits({ value: a, positions: keep })
      const reA = real[indexA]!
      const imA = imag[indexA]!

      for (let b = 0; b < keptDim; b++) {
        const indexB = envIndex | scatterBits({ value: b, positions: keep })
        const reB = real[indexB]!
        const imB = imag[indexB]!
        // rho_ab += psi_a conj(psi_b)
        rho.re[a * keptDim + b]! += reA * reB + imA * imB
        rho.im[a * keptDim + b]! += imA * reB - reA * imB
      }
    }
  }

  return rho
}

// The von Neumann entropy in bits of a density matrix: -sum lambda log2 lambda over its
// eigenvalues. Negative or tiny eigenvalues (numerical dust) are clamped away.
export function vonNeumannEntropyBits(input: {
  matrix: ComplexMatrix
}): number {
  const eigen = eigHermitian({ matrix: input.matrix })
  let entropy = 0

  for (let i = 0; i < eigen.values.length; i++) {
    const lambda = eigen.values[i]!

    if (lambda > 1e-12) {
      entropy -= lambda * Math.log2(lambda)
    }
  }

  return entropy
}

// The entropy in bits of the reduced state on `keep`, straight from the pure state.
export function subsystemEntropyBits(input: {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
  keep: number[]
}): number {
  return vonNeumannEntropyBits({
    matrix: reducedDensityMatrix(input),
  })
}

// The quantum mutual information I(A : B) = S(A) + S(B) - S(A cup B) in bits between two disjoint
// qubit groups of a pure state.
export function mutualInformationBits(input: {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
  groupA: number[]
  groupB: number[]
}): number {
  const { real, imag, qubitCount, groupA, groupB } = input
  const entropyA = subsystemEntropyBits({ real, imag, qubitCount, keep: groupA })
  const entropyB = subsystemEntropyBits({ real, imag, qubitCount, keep: groupB })
  const entropyJoint = subsystemEntropyBits({
    real,
    imag,
    qubitCount,
    keep: [...groupA, ...groupB],
  })

  return entropyA + entropyB - entropyJoint
}

// The trace distance (1/2) ||rhoA - rhoB||_1 between two same-size density matrices, the maximal
// probability of telling them apart by any measurement. Zero when identical, one when orthogonal.
// Computed as half the sum of the absolute eigenvalues of the Hermitian difference.
export function traceDistance(input: {
  matrixA: ComplexMatrix
  matrixB: ComplexMatrix
}): number {
  const { matrixA, matrixB } = input
  const n = matrixA.rows
  const difference = makeComplexMatrix({ rows: n, cols: n })

  for (let i = 0; i < n * n; i++) {
    difference.re[i] = matrixA.re[i]! - matrixB.re[i]!
    difference.im[i] = matrixA.im[i]! - matrixB.im[i]!
  }

  const eigen = eigHermitian({ matrix: difference })
  let sum = 0

  for (let i = 0; i < eigen.values.length; i++) {
    sum += Math.abs(eigen.values[i]!)
  }

  return sum / 2
}

// How strongly a fragment of qubits records a distinction between two pure states of the same
// register: the trace distance between the fragment's reduced density matrix under each state. For
// a copied record it is large even for a one-cell fragment (redundant), for a global cat-state
// record it is zero on every fragment short of the whole (not objective).
export function fragmentRecordDistance(input: {
  stateA: { real: Float64Array; imag: Float64Array; qubitCount: number }
  stateB: { real: Float64Array; imag: Float64Array; qubitCount: number }
  fragment: number[]
}): number {
  const { stateA, stateB, fragment } = input

  return traceDistance({
    matrixA: reducedDensityMatrix({
      real: stateA.real,
      imag: stateA.imag,
      qubitCount: stateA.qubitCount,
      keep: fragment,
    }),
    matrixB: reducedDensityMatrix({
      real: stateB.real,
      imag: stateB.imag,
      qubitCount: stateB.qubitCount,
      keep: fragment,
    }),
  })
}

// The magnitude of the system's off-diagonal coherence: for a single qubit (qubit 0) reduced
// state, |rho_01|. Zero means fully decohered in that basis, one half means maximally coherent.
export function systemCoherence(input: {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
  systemQubit: number
}): number {
  const rho = reducedDensityMatrix({
    real: input.real,
    imag: input.imag,
    qubitCount: input.qubitCount,
    keep: [input.systemQubit],
  })

  return Math.hypot(rho.re[1]!, rho.im[1]!)
}
