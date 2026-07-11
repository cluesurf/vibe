// A coarse recording window over a per-cell tone, the substrate form of Timeless Dynamics'
// recordability capacity. A window sees the cells only at block resolution: it partitions the N
// cells into B contiguous blocks and records the + charge per block, so the finest distinction it
// can register is which block, never which cell. Its recorded distinguishability is therefore
// bounded by the block count's Shannon capacity, ln(B) nats, no matter how much finer structure
// the input carries. This is TD's condition that a region records at most its Shannon capacity,
// c(q), with the excess distinction living below the window at a scale the window cannot see.

// The + charge in each of B contiguous blocks of a per-cell tone. The coarse readout the window
// records, everything finer than a block is invisible to it.
export function blockPlusCounts(
  tone: Int8Array,
  blocks: number,
): number[] {
  const n = tone.length
  const blockSize = Math.ceil(n / blocks)
  const counts = new Array<number>(blocks).fill(0)

  for (let i = 0; i < n; i++) {
    if (tone[i] === 1) {
      const block = Math.min(blocks - 1, Math.floor(i / blockSize))

      counts[block]! += 1
    }
  }

  return counts
}

// The Shannon entropy (in nats) of a count vector, the recorded distinguishability of the
// distribution it represents. Bounded above by ln(number of nonzero-capable bins), which is the
// window capacity when the bins are the recording blocks. Zero for an empty or single-bin vector.
export function shannonEntropy(counts: readonly number[]): number {
  let total = 0

  for (const c of counts) total += c

  if (total === 0) return 0

  let entropy = 0

  for (const c of counts) {
    if (c > 0) {
      const p = c / total

      entropy -= p * Math.log(p)
    }
  }

  return entropy
}
