// A causal set: a locally finite partial order. The fundamental substrate of
// causal-set theory (Bombelli) and the carrier of the vibe beat / causal order.
// Stored as a transitive-closure bit matrix plus extracted covering relations.

import {
  BitMatrix,
  makeBitMatrix,
  setBit,
  getBit,
  popcountRow,
  forEachSetBit,
} from '@/code/tool/bitset'
import { Embedding } from '@/code/tool/embedding'

export type Poset = {
  readonly form: 'poset'
  readonly size: number
  // covering relations (links): links[a] is the sorted list of b with a immediately precedes b
  readonly links: readonly Uint32Array[]
  // transitive closure: future bit b set in row a iff a precedes b
  readonly future: BitMatrix
  readonly embedding?: Embedding
}

function trailingZeros(word: number): number {
  const lsb = (word & -word) >>> 0

  return 31 - Math.clz32(lsb)
}

// Build a Poset from a transitive-closure matrix, extracting the covering
// relations by transitive reduction (links[a] = future[a] minus indirect reach).
export function makePosetFromFuture(input: {
  size: number
  future: BitMatrix
  embedding?: Embedding
}): Poset {
  const n = input.size
  const f = input.future
  const stride = f.stride
  const links: Uint32Array[] = []
  const acc = new Uint32Array(stride)

  for (let a = 0; a < n; a++) {
    acc.fill(0)
    forEachSetBit(f, {
      row: a,
      visit: c => {
        const cb = c * stride

        for (let w = 0; w < stride; w++) {
          acc[w] = (acc[w] ?? 0) | (f.words[cb + w] ?? 0)
        }
      },
    })

    const base = a * stride
    const row: number[] = []

    for (let w = 0; w < stride; w++) {
      let bits = ((f.words[base + w] ?? 0) & ~(acc[w] ?? 0)) >>> 0

      while (bits !== 0) {
        row.push((w << 5) + trailingZeros(bits))
        bits = (bits & (bits - 1)) >>> 0
      }
    }

    links.push(Uint32Array.from(row))
  }

  return {
    form: 'poset',
    size: n,
    links,
    future: f,
    embedding: input.embedding,
  }
}

// Build a Poset from an explicit precedence predicate over already time-sorted
// elements (a precedes b only if a < b in the given order).
export function makePosetFromRelation(input: {
  size: number
  precedes: (input: { a: number; b: number }) => boolean
  embedding?: Embedding
}): Poset {
  const future = makeBitMatrix({ rows: input.size, cols: input.size })

  for (let a = 0; a < input.size; a++) {
    for (let b = a + 1; b < input.size; b++) {
      if (input.precedes({ a, b })) {
        setBit(future, { row: a, col: b })
      }
    }
  }

  return makePosetFromFuture({
    size: input.size,
    future,
    embedding: input.embedding,
  })
}

export function precedes(
  p: Poset,
  input: { a: number; b: number },
): boolean {
  return getBit(p.future, { row: input.a, col: input.b })
}

// Total number of related (ordered) pairs.
export function relationCount(p: Poset): number {
  let total = 0

  for (let a = 0; a < p.size; a++) {
    total += popcountRow(p.future, { row: a })
  }

  return total
}

// Size of the Alexandrov interval A(a, b): elements c with a precedes c precedes b.
// Equals the number of common elements in future(a) and past(b). Pass the past
// matrix from pastMatrix(p) so repeated queries do not rebuild it.
export function intervalSize(
  p: Poset,
  input: { a: number; b: number; past: BitMatrix },
): number {
  return popcountAndRows(p.future, input.past, {
    rowA: input.a,
    rowB: input.b,
  })
}

function popcountAndRows(
  m: BitMatrix,
  n: BitMatrix,
  input: { rowA: number; rowB: number },
): number {
  const a = input.rowA * m.stride
  const b = input.rowB * n.stride

  let total = 0

  for (let w = 0; w < m.stride; w++) {
    const x = (m.words[a + w] ?? 0) & (n.words[b + w] ?? 0)

    let v = x - ((x >>> 1) & 0x55555555)
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
    total += (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24
  }

  return total
}

// The past matrix is the transpose of future: past bit a set in row b iff a precedes b.
export function pastMatrix(p: Poset): BitMatrix {
  const past = makeBitMatrix({ rows: p.size, cols: p.size })

  for (let a = 0; a < p.size; a++) {
    forEachSetBit(p.future, {
      row: a,
      visit: b => setBit(past, { row: b, col: a }),
    })
  }

  return past
}

// Restrict the poset to a subset of elements (relabelled 0..k-1), preserving order.
export function subPoset(
  p: Poset,
  input: { elements: readonly number[] },
): Poset {
  const els = input.elements
  const k = els.length
  const future = makeBitMatrix({ rows: k, cols: k })

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const a = els[i] ?? 0
      const b = els[j] ?? 0

      if (i !== j && precedes(p, { a, b })) {
        setBit(future, { row: i, col: j })
      }
    }
  }

  return makePosetFromFuture({ size: k, future })
}
