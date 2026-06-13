// A content-addressable associative memory on any cell graph, Potter's SITDAC model realized on a
// tessellation. Each cell holds a ternary WORD (slots in {0,1,2}). You broadcast a COMPARAND (a query word
// with an optional don't-care mask), every cell compares it to its own word in parallel, and the matching
// cells are the RESPONDERS. This is the base-layer (reversible-rule-compatible) flavor, a parallel search,
// not an attractor relaxation. See note/research/vibe/notes/theory-v0.7.0/plans/associative-engine-architecture.md.

import { bfsShells } from '@/code/measure/shells'

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

export interface AssociativeMemory {
  cellCount: number
  wordBits: number
  // flat cellCount * wordBits ternary words, slot k of cell c at words[c * wordBits + k]
  words: Int8Array
  // 1 if a word is stored at the cell
  occupied: Uint8Array
  neighbors: Neighbors
}

export function makeAssociativeMemory(input: {
  neighbors: Neighbors
  wordBits: number
}): AssociativeMemory {
  const cellCount = input.neighbors.length
  return {
    cellCount,
    wordBits: input.wordBits,
    words: new Int8Array(cellCount * input.wordBits),
    occupied: new Uint8Array(cellCount),
    neighbors: input.neighbors,
  }
}

// A distinct, well-spread ternary word for an index. A bijective multiplicative hash (Knuth) decorrelates
// neighbouring indices, then the result is read out in base 3, so the words are distinct and far apart in
// content. wordBits must be at least 21 to represent the full 32-bit hash without collision.
export function ternaryWord(index: number, wordBits: number): Int8Array {
  const mixed = (Math.imul(index, 2654435761) >>> 0)
  const word = new Int8Array(wordBits)
  let p = 1
  for (let k = 0; k < wordBits; k++) {
    word[k] = Math.floor(mixed / p) % 3
    p *= 3
  }
  return word
}

export function storeWord(mem: AssociativeMemory, cell: number, word: ArrayLike<number>): void {
  const base = cell * mem.wordBits
  for (let k = 0; k < mem.wordBits; k++) mem.words[base + k] = word[k]! as number
  mem.occupied[cell] = 1
}

export function readWord(mem: AssociativeMemory, cell: number): Int8Array {
  return mem.words.slice(cell * mem.wordBits, (cell + 1) * mem.wordBits)
}

// The number of slots that are actually compared (all of them unless a mask restricts).
export function comparedSlots(wordBits: number, mask?: ArrayLike<number>): number {
  if (!mask) return wordBits
  let n = 0
  for (let k = 0; k < wordBits; k++) if (mask[k]) n++
  return n
}

// The match score of a cell against a comparand, the count of equal compared slots. Returns -1 for an empty
// cell. This is the per-cell "note", one vibe reading the query.
export function matchScore(
  mem: AssociativeMemory,
  cell: number,
  comparand: ArrayLike<number>,
  mask?: ArrayLike<number>,
): number {
  if (!mem.occupied[cell]) return -1
  const base = cell * mem.wordBits
  let s = 0
  for (let k = 0; k < mem.wordBits; k++) {
    if (mask && !mask[k]) continue
    if (mem.words[base + k] === comparand[k]) s++
  }
  return s
}

// The parallel content search, every occupied cell whose match score is at least minScore. The CPU-sequential
// ground truth (a scan), the maximally parallel and GPU builds compute the identical responder set.
export function search(input: {
  mem: AssociativeMemory
  comparand: ArrayLike<number>
  mask?: ArrayLike<number>
  minScore: number
}): number[] {
  const { mem, comparand, mask, minScore } = input
  const out: number[] = []
  for (let c = 0; c < mem.cellCount; c++) {
    if (matchScore(mem, c, comparand, mask) >= minScore) out.push(c)
  }
  return out
}

// Exact-match search, the responders whose every compared slot equals the comparand.
export function searchExact(input: {
  mem: AssociativeMemory
  comparand: ArrayLike<number>
  mask?: ArrayLike<number>
}): number[] {
  return search({ ...input, minScore: comparedSlots(input.mem.wordBits, input.mask) })
}

// The single best responder, the occupied cell with the highest match score (the nearest content). Ties go
// to the lowest index. Returns cell -1 if the memory is empty.
export function searchBest(input: {
  mem: AssociativeMemory
  comparand: ArrayLike<number>
  mask?: ArrayLike<number>
}): { cell: number; score: number } {
  const { mem, comparand, mask } = input
  let bestCell = -1
  let bestScore = -1
  for (let c = 0; c < mem.cellCount; c++) {
    const s = matchScore(mem, c, comparand, mask)
    if (s > bestScore) {
      bestScore = s
      bestCell = c
    }
  }
  return { cell: bestCell, score: bestScore }
}

// Responder selection, the responder nearest the seed by graph distance (Potter's pick-one).
export function pickNearest(input: {
  responders: number[]
  seed: number
  neighbors: Neighbors
}): number {
  const depth = bfsShells({ neighbors: input.neighbors, root: input.seed }).depth
  let best = -1
  let bestD = Infinity
  for (const r of input.responders) {
    const d = depth[r]!
    if (d >= 0 && d < bestD) {
      bestD = d
      best = r
    }
  }
  return best
}

// The geometric broadcast, a query wave from the seed spreading one ring per beat (the bucket brigade). The
// arrival beat of each cell is its graph distance from the seed. The first beat a responder is reached is the
// SEARCH LATENCY, and the coverage beat is when the whole built region is reached. On a hyperbolic graph the
// coverage beat is O(log N), where on a flat lattice it is O(N^(1/d)).
export function broadcastWave(input: {
  neighbors: Neighbors
  seed: number
  responders: number[]
}): { arrivalBeat: Int32Array; firstResponderBeat: number; coverageBeat: number } {
  const depth = bfsShells({ neighbors: input.neighbors, root: input.seed }).depth
  let first = Infinity
  for (const r of input.responders) {
    const d = depth[r]!
    if (d >= 0 && d < first) first = d
  }
  let coverage = 0
  for (let c = 0; c < depth.length; c++) {
    const d = depth[c]!
    if (d > coverage) coverage = d
  }
  return {
    arrivalBeat: depth,
    firstResponderBeat: first === Infinity ? -1 : first,
    coverageBeat: coverage,
  }
}
