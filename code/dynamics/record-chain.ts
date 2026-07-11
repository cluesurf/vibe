// The record chain: a system qubit whose pointer value gets written into a bath of environment
// cells, built as exact pure states so the reduced density matrices are read off real linear
// algebra (code/tool/density-matrix), not a factorized formula. Two ways to write the record,
// which is the whole point of the objectivity experiment.
//
// - 'copy' (local, redundant): each environment cell independently copies the pointer, imperfectly.
//   The two pointer-conditional cell states overlap by `overlap` per cell, so for pointer 0 a cell
//   is |0> and for pointer 1 it is c|0> + sqrt(1-c^2)|1>. Every cell carries a partial copy, so any
//   small fragment already distinguishes the pointer, and the record is redundant. Quantum
//   Darwinism (Zurek).
// - 'global' (a cat-state record): the two pointer-conditional bath states are the two GHZ phases,
//   (|0...0> + |1...1>)/sqrt2 and (|0...0> - |1...1>)/sqrt2. Any fragment smaller than the whole
//   bath has the SAME reduced state for both pointer values (the sign is a global property that a
//   partial trace erases), so no fragment short of the whole bath can tell the pointer, and the
//   record is not redundant. This is the control: a record that exists only globally is not
//   objective.
//
// Both decohere the system pointer, and both are deterministic. The chain exposes the joint state
// (system qubit 0, bath qubits 1..N) for the coherence, and the two pointer-conditional bath states
// for the distinguishability of the record in a fragment.

export type PureState = {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
}

export type RecordChain = {
  joint: PureState
  systemQubit: number
  environmentQubits: number[]
  // the bath's pure state conditioned on each pointer value, over `environmentCount` qubits
  environmentGivenPointer0: PureState
  environmentGivenPointer1: PureState
}

export function buildRecordChain(input: {
  environmentCount: number
  overlap: number
  weight0: number
  weight1: number
  form: 'copy' | 'global'
}): RecordChain {
  const { environmentCount, overlap, weight0, weight1, form } = input
  const bathDimension = 1 << environmentCount
  const bath0Real = new Float64Array(bathDimension)
  const bath1Real = new Float64Array(bathDimension)
  const bath0Imag = new Float64Array(bathDimension)
  const bath1Imag = new Float64Array(bathDimension)

  if (form === 'copy') {
    const stay = overlap
    const flip = Math.sqrt(Math.max(0, 1 - overlap * overlap))

    // pointer 0: every cell |0>, so only the all-zero bath string
    bath0Real[0] = 1

    // pointer 1: each cell c|0> + s|1>, amplitude is the product over cells
    for (let e = 0; e < bathDimension; e++) {
      let value = 1

      for (let cell = 0; cell < environmentCount; cell++) {
        value *= (e >> cell) & 1 ? flip : stay
      }

      bath1Real[e] = value
    }
  } else {
    // global: the two GHZ phases
    const allOnes = bathDimension - 1
    const norm = Math.SQRT1_2

    bath0Real[0] = norm
    bath0Real[allOnes] = norm
    bath1Real[0] = norm
    bath1Real[allOnes] = -norm
  }

  // assemble the joint state sqrt(w0) |0> (x) bath0 + sqrt(w1) |1> (x) bath1, system as qubit 0
  const qubitCount = environmentCount + 1
  const jointDimension = 1 << qubitCount
  const jointReal = new Float64Array(jointDimension)
  const jointImag = new Float64Array(jointDimension)
  const amplitude0 = Math.sqrt(weight0)
  const amplitude1 = Math.sqrt(weight1)

  for (let e = 0; e < bathDimension; e++) {
    const index0 = e << 1 // system bit 0
    const index1 = (e << 1) | 1 // system bit 1

    jointReal[index0] = amplitude0 * bath0Real[e]!
    jointImag[index0] = amplitude0 * bath0Imag[e]!
    jointReal[index1] = amplitude1 * bath1Real[e]!
    jointImag[index1] = amplitude1 * bath1Imag[e]!
  }

  const environmentQubits: number[] = []

  for (let cell = 1; cell <= environmentCount; cell++) {
    environmentQubits.push(cell)
  }

  return {
    joint: { real: jointReal, imag: jointImag, qubitCount },
    systemQubit: 0,
    environmentQubits,
    environmentGivenPointer0: {
      real: bath0Real,
      imag: bath0Imag,
      qubitCount: environmentCount,
    },
    environmentGivenPointer1: {
      real: bath1Real,
      imag: bath1Imag,
      qubitCount: environmentCount,
    },
  }
}
