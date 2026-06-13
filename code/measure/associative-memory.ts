// Deterministic vector-symbolic (hyperdimensional) associative memory, for the capacity data-structure
// experiment. Key-value bindings are bound (elementwise product) and bundled (superposed) into one memory
// vector of dimension `dim`, then each value is recalled by unbinding and cleaning up to the nearest stored
// value. The recall capacity scales with the dimension, which on a hyperbolic tessellation is the cell count
// in a radius, exponential in the radius. The vectors are a fixed integer hash, so the measurement is
// deterministic (no randomness, vary `dim`, not a seed). References, Plate 1995, Kanerva 2009.

const hashBit = (id: number, index: number): number => {
  let h = (id ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97) >>> 0
  return ((h ^ (h >>> 15)) & 1) === 1 ? 1 : -1
}

const bipolar = (id: number, dim: number): Int8Array => {
  const v = new Int8Array(dim)
  for (let i = 0; i < dim; i++) v[i] = hashBit(id, i)
  return v
}

const dot = (a: Int8Array, b: Int8Array): number => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!
  return s
}

// store `items` key-value bindings in one bundled memory vector of dimension `dim`, then recall each and report
// the fraction correctly cleaned up to its stored value
export function vsaRecallAccuracy(input: { dim: number; items: number }): number {
  const { dim, items } = input
  const keys: Int8Array[] = []
  const values: Int8Array[] = []
  for (let i = 0; i < items; i++) {
    keys.push(bipolar(i * 2 + 1, dim))
    values.push(bipolar(i * 2 + 2, dim))
  }
  const accumulator = new Int32Array(dim)
  for (let i = 0; i < items; i++) {
    for (let j = 0; j < dim; j++) accumulator[j]! += keys[i]![j]! * values[i]![j]!
  }
  const memory = new Int8Array(dim)
  for (let j = 0; j < dim; j++) memory[j] = accumulator[j]! >= 0 ? 1 : -1

  let correct = 0
  const noisy = new Int8Array(dim)
  for (let i = 0; i < items; i++) {
    for (let j = 0; j < dim; j++) noisy[j] = memory[j]! * keys[i]![j]! // unbind
    let best = -1
    let bestDot = -Infinity
    for (let k = 0; k < items; k++) {
      const d = dot(noisy, values[k]!)
      if (d > bestDot) { bestDot = d; best = k }
    }
    if (best === i) correct += 1
  }
  return correct / items
}
