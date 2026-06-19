// Deterministic Bloom-filter false-positive measurement, for the boundary-sketch data-structure experiment.
// A Bloom filter over `cells` bits stores `items` keys (each set at `hashes` positions), then the
// false-positive rate is measured over `queries` non-member keys. As the boundary (cells) grows, the
// false-positive rate falls, which on a hyperbolic tessellation means it falls exponentially with radius. The
// hashing is a fixed integer mix, so the whole measurement is deterministic (no randomness).

// A strong integer avalanche hash (the Hash Function Prospector finalizer), so sequential keys spread
// uniformly across the slots.
const mix = (key: number, salt: number, modulus: number): number => {
  let h = (key ^ Math.imul(salt + 1, 0x9e3779b9)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97) >>> 0
  h = (h ^ (h >>> 15)) >>> 0
  return h % modulus
}

// Hash a key to a cell address (a slot). Deterministic. The cell IS the hash slot, no modulo table.
export function cellHash(key: number, cells: number): number {
  return mix(key, 0, cells)
}

// Open-addressing hash table over `cells` slots, insert `keys` keys with linear probing to the next free cell,
// and report the collision rate and the mean probe length. At a load below 1 the mean probe is O(1).
export function hashTableProbeStats(input: {
  cells: number
  keys: number
}): { collisionRate: number; meanProbe: number } {
  const slot = new Int32Array(input.cells).fill(-1)
  let collisions = 0
  let totalProbe = 0
  for (let key = 0; key < input.keys; key++) {
    let position = cellHash(key, input.cells)
    let probe = 1
    while (slot[position] !== -1 && probe <= input.cells) {
      position = (position + 1) % input.cells
      probe += 1
    }
    if (probe > 1) collisions += 1
    slot[position] = key
    totalProbe += probe
  }
  return {
    collisionRate: collisions / Math.max(1, input.keys),
    meanProbe: totalProbe / Math.max(1, input.keys),
  }
}

export function bloomFalsePositiveRate(input: {
  cells: number
  items: number
  hashes: number
  queries: number
}): number {
  const bits = new Uint8Array(input.cells)
  for (let key = 0; key < input.items; key++) {
    for (let salt = 0; salt < input.hashes; salt++) {
      bits[mix(key, salt, input.cells)] = 1
    }
  }
  let falsePositives = 0
  for (let query = 0; query < input.queries; query++) {
    const key = input.items + query // a key never inserted
    let allSet = true
    for (let salt = 0; salt < input.hashes; salt++) {
      if (bits[mix(key, salt, input.cells)] === 0) {
        allSet = false
        break
      }
    }
    if (allSet) {
      falsePositives += 1
    }
  }
  return falsePositives / Math.max(1, input.queries)
}
