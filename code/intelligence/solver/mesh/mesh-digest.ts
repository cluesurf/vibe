/**
 * The metered mesh digest, as tightened against the step-fitting forger.
 *
 * Before the tightening an entry's digest was a sum over its runs of key x (frame + 1) x (step + 1) mod 2^31 - 1: the step was
 * a free multiplier (a candidate could run other words and pick the step that hits the judge's target), and the sum was
 * blind to order (runs could be moved between decisions). Now the evaluator folds every request into an order-sensitive
 * chain of SHA-256:
 *
 * - the entry's seed is SHA-256 of its rule and whole layout (start, window, inputs, read cell, read round, background);
 * - a request is folded as chain' = SHA-256(chain || step || runs || each run's tuple), the runs sorted stably by the key
 *   hash of the state they name, so the tuple of a run is bound to its decision: the state's key hash, its occurrence
 *   among the request's runs on that state (a decision id when one state carries many decisions), its input word, its
 *   final frame hash and its read;
 * - the digest the meter shows is the chain's first 48 bits.
 *
 * So a step is one more hashed field, never a multiplier, a run cannot change decision, layout, step or background
 * without changing the chain, and fitting the chain by choosing a step needs a 48-bit preimage per try (10^6 steps give
 * about 10^6 / 2^48, 3.6 x 10^-9). The key hash is the first 48 bits of SHA-256 of the key (was a polynomial mod
 * 1,000,003, where two keys collide by about 1,000 states).
 *
 * Import-free and pure, so the evaluator, every judge and any candidate (the lookup control of E-CMP-0060) fold the same
 * chain. Certified against node:crypto's SHA-256 in E-CMP-0084. Exact integer arithmetic (32-bit words), no random
 * numbers.
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

const W = new Uint32Array(64)

const rotr = (x: number, n: number): number => (x >>> n) | (x << (32 - n))

/** SHA-256 of `bytes` (FIPS 180-4), 32 bytes. */
export function sha256(bytes: Uint8Array): Uint8Array {
  const length = bytes.length
  const blocks = Math.ceil((length + 9) / 64)
  const padded = new Uint8Array(blocks * 64)

  padded.set(bytes)
  padded[length] = 0x80

  // the bit length, big-endian, in the last 8 bytes (exact below 2^53 bits)
  const bits = length * 8
  const high = Math.floor(bits / 0x100000000)
  const low = bits >>> 0
  const end = padded.length

  padded[end - 8] = (high >>> 24) & 0xff
  padded[end - 7] = (high >>> 16) & 0xff
  padded[end - 6] = (high >>> 8) & 0xff
  padded[end - 5] = high & 0xff
  padded[end - 4] = (low >>> 24) & 0xff
  padded[end - 3] = (low >>> 16) & 0xff
  padded[end - 2] = (low >>> 8) & 0xff
  padded[end - 1] = low & 0xff

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  for (let block = 0; block < blocks; block++) {
    const base = block * 64

    for (let t = 0; t < 16; t++) {
      const at = base + 4 * t

      W[t] = (padded[at]! << 24) | (padded[at + 1]! << 16) | (padded[at + 2]! << 8) | padded[at + 3]!
    }

    for (let t = 16; t < 64; t++) {
      const w15 = W[t - 15]!
      const w2 = W[t - 2]!
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10)

      W[t] = (W[t - 16]! + s0 + W[t - 7]! + s1) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7

    for (let t = 0; t < 64; t++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + s1 + ch + K[t]! + W[t]!) >>> 0
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (s0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  const out = new Uint8Array(32)
  const words = [h0, h1, h2, h3, h4, h5, h6, h7]

  for (let i = 0; i < 8; i++) {
    out[4 * i] = (words[i]! >>> 24) & 0xff
    out[4 * i + 1] = (words[i]! >>> 16) & 0xff
    out[4 * i + 2] = (words[i]! >>> 8) & 0xff
    out[4 * i + 3] = words[i]! & 0xff
  }

  return out
}

/** A text as bytes: each UTF-16 code unit as two bytes, big-endian. */
export function textBytes(text: string): Uint8Array {
  const out = new Uint8Array(2 * text.length)

  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i)

    out[2 * i] = unit >>> 8
    out[2 * i + 1] = unit & 0xff
  }

  return out
}

/** The first 48 bits of a hash as an exact integer (below 2^48). */
export function first48(hash: Uint8Array): number {
  let value = 0

  for (let i = 0; i < 6; i++) {
    value = value * 256 + hash[i]!
  }

  return value
}

/** The key hash of a state: the first 48 bits of SHA-256 of its key. */
export function meshKeyHash(key: string): number {
  return first48(sha256(textBytes(key)))
}

/** A layout as the digest reads it (the evaluator's validated fields). */
export interface MeshDigestLayout {
  start: number
  window: ArrayLike<number>
  inputs: ArrayLike<number>
  readPosition: number
  readRound: number
  background?: number
}

/** One run as the digest reads it. */
export interface MeshDigestRun {
  keyHash: number
  word: ArrayLike<number>
  frameHash: number
  /** the read cell's tone */
  value: number
}

/** The seed of an entry's chain: SHA-256 of the rule and the whole layout, the background stated (0 when left out). */
export function meshEntrySeed(rule: string, layout: MeshDigestLayout): Uint8Array {
  const text = [
    'mesh-entry',
    rule,
    layout.start,
    Array.from(layout.window).join(','),
    Array.from(layout.inputs).join(','),
    layout.readPosition,
    layout.readRound,
    layout.background ?? 0,
  ].join('|')

  return sha256(textBytes(text))
}

const put32 = (out: Uint8Array, at: number, value: number): void => {
  out[at] = (value >>> 24) & 0xff
  out[at + 1] = (value >>> 16) & 0xff
  out[at + 2] = (value >>> 8) & 0xff
  out[at + 3] = value & 0xff
}

/**
 * Fold one request into a chain: SHA-256(chain || step || run count || runs), the runs sorted stably by key hash, each
 * as its key hash (6 bytes), its occurrence among this request's runs on that key (4), its word (length, then each tone
 * + 1), its frame hash (4) and its read + 1 (1).
 */
export function meshRequestFold(chain: Uint8Array, step: number, runs: readonly MeshDigestRun[]): Uint8Array {
  if (!Number.isInteger(step) || step < 0 || step > 0xffffffff) {
    throw new Error(`mesh-digest: step ${step} is not a 32-bit count`)
  }

  const order = runs.map((_, i) => i)

  // stable: runs on one key keep their request order, which is their occurrence
  order.sort((x, y) => runs[x]!.keyHash - runs[y]!.keyHash)

  let size = 32 + 8

  for (const run of runs) {
    size += 6 + 4 + 1 + run.word.length + 4 + 1
  }

  const bytes = new Uint8Array(size)

  bytes.set(chain, 0)
  put32(bytes, 32, step)
  put32(bytes, 36, runs.length)

  let at = 40
  let previous = -1
  let occurrence = 0

  for (const i of order) {
    const run = runs[i]!

    occurrence = run.keyHash === previous ? occurrence + 1 : 0
    previous = run.keyHash

    let key = run.keyHash

    for (let b = 5; b >= 0; b--) {
      bytes[at + b] = key % 256
      key = Math.floor(key / 256)
    }

    at += 6
    put32(bytes, at, occurrence)
    at += 4
    bytes[at++] = run.word.length

    for (const tone of Array.from(run.word)) {
      bytes[at++] = tone + 1
    }

    put32(bytes, at, run.frameHash)
    at += 4
    bytes[at++] = run.value + 1
  }

  return sha256(bytes)
}

/** The digest a meter shows: the chain's first 48 bits. */
export const meshDigestValue = (chain: Uint8Array): number => first48(chain)

/** A chain for one rule and layout, folded request by request, as the evaluator meters it and a judge recomputes it. */
export function meshChain(rule: string, layout: MeshDigestLayout): { fold: (step: number, runs: readonly MeshDigestRun[]) => number; value: () => number } {
  let chain = meshEntrySeed(rule, layout)

  return {
    fold(step, runs) {
      chain = meshRequestFold(chain, step, runs)

      return first48(chain)
    },
    value: () => first48(chain),
  }
}
