// Streaming shell counter for the {p,q,r,...} Coxeter cell graph. Counts the cells at each breadth-first shell
// (graph distance from a root cell) WITHOUT storing the whole graph, so it reaches far deeper than a full build. The
// only thing kept across a shell step is the current frontier (the cells of the previous shell, as group-element
// matrices, needed to generate the next shell) plus a compact hashed "seen" set (a 64-bit hash of each cell's
// position, in an open-addressing BigInt64Array, about 8 bytes per cell instead of a Map's hundred). For the final
// shell the matrices are not even stored, only counted, so the peak memory is the frontier of the second-to-last
// shell plus the seen set. This is what reaches shell 6 of {3,4,3,4} (about 51 million cells) on a single machine.
//
// The growth rate (the warp factor lambda) is the limit of the shell-count ratios, so more shells means a sharper
// lambda and more terms to fit the growth recurrence (the closed-form minimal polynomial, GM1).

import { coxeterCellFrame } from '@/code/substrate/coxeter/frame'
import { type Mat, matMul, matVec, identity, toPoincare, pointKey } from '@/code/substrate/coxeter/minkowski'

// a 64-bit FNV-1a hash of the position key (forced nonzero, since 0 marks an empty slot)
function hashKey(s: string): bigint {
  let h = 1469598103934665603n
  const mask = 0xffffffffffffffffn
  for (let i = 0; i < s.length; i++) {
    h ^= BigInt(s.charCodeAt(i))
    h = (h * 1099511628211n) & mask
  }
  return h === 0n ? 1n : h
}

// an open-addressing hash set of 64-bit values, backed by a BigInt64Array (signed), 0 marks empty
class HashedKeySet {
  private slots: BigInt64Array
  private mask: number
  size = 0
  constructor(capacityPow2: number) {
    this.slots = new BigInt64Array(1 << capacityPow2)
    this.mask = (1 << capacityPow2) - 1
  }
  // returns true if newly added, false if already present
  addIfNew(h: bigint): boolean {
    const value = BigInt.asIntN(64, h)
    let i = Number(h & BigInt(this.mask))
    for (;;) {
      const slot = this.slots[i]!
      if (slot === 0n) {
        this.slots[i] = value
        this.size++
        return true
      }
      if (slot === value) return false
      i = (i + 1) & this.mask
    }
  }
}

// the cells-per-shell counts of the {symbol} cell graph, by streaming breadth-first search from the root cell, up to
// maxShell. seenCapacityPow2 sizes the hash table (default 2^27 = 134M slots, holding about 60M cells at load 0.45).
export function streamingShellCounts(input: {
  symbol: number[]
  maxShell: number
  seenCapacityPow2?: number
}): number[] {
  const { timeAxis, dim, faces, center } = coxeterCellFrame(input.symbol)
  const seen = new HashedKeySet(input.seenCapacityPow2 ?? 27)
  const positionKey = (g: Mat): string => pointKey(toPoincare(matVec(g, center), timeAxis))

  const root = identity(dim)
  seen.addIfNew(hashKey(positionKey(root)))
  let frontier: Mat[] = [root]
  const counts: number[] = [1]

  for (let shell = 1; shell <= input.maxShell; shell++) {
    const storeMatrices = shell < input.maxShell // the last shell is counted but not stored
    const next: Mat[] = []
    let count = 0
    for (const g of frontier) {
      for (let fi = 0; fi < faces.length; fi++) {
        const child = matMul(g, faces[fi]!)
        if (seen.addIfNew(hashKey(positionKey(child)))) {
          count++
          if (storeMatrices) next.push(child)
        }
      }
    }
    counts.push(count)
    frontier = next
    if (!storeMatrices) break
  }
  return counts
}
