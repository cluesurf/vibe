// A network of Bell pairs as an exact pure state, for reading entanglement entropies off real
// partial traces (code/tool/density-matrix). Each pair (a, b) is (|0>_a|0>_b + |1>_a|1>_b)/sqrt2, and
// the state is the product over all pairs, so a computational-basis string has a nonzero amplitude
// exactly when the two qubits of every pair agree. Deterministic and normalized. Used by the Page-
// curve experiment: pairing qubit i with qubit N-1-i (cross-cut) gives the tent-shaped Page curve
// S(first k) = min(k, N-k); pairing neighbors (local) does not.

export type PureState = {
  real: Float64Array
  imag: Float64Array
  qubitCount: number
}

export function buildBellNetwork(input: {
  qubitCount: number
  pairs: [number, number][]
}): PureState {
  const { qubitCount, pairs } = input
  const dimension = 1 << qubitCount
  const real = new Float64Array(dimension)
  const imag = new Float64Array(dimension)
  const amplitude = Math.pow(Math.SQRT1_2, pairs.length)

  for (let index = 0; index < dimension; index++) {
    let agrees = true

    for (const [a, b] of pairs) {
      if (((index >> a) & 1) !== ((index >> b) & 1)) {
        agrees = false
        break
      }
    }

    if (agrees) real[index] = amplitude
  }

  return { real, imag, qubitCount }
}

// The cross-cut pairing i <-> N-1-i (every pair straddles the center), which scrambles entanglement
// across any cut and yields the Page tent.
export function crossCutPairs(qubitCount: number): [number, number][] {
  const pairs: [number, number][] = []

  for (let i = 0; i < qubitCount / 2; i++)
    pairs.push([i, qubitCount - 1 - i])

  return pairs
}

// The local pairing 2i <-> 2i+1 (each pair sits on adjacent qubits), which keeps entanglement local
// and never builds up across a cut.
export function localPairs(qubitCount: number): [number, number][] {
  const pairs: [number, number][] = []

  for (let i = 0; i < qubitCount; i += 2) pairs.push([i, i + 1])

  return pairs
}
