import { makeRng } from '@/code/tool/rng'

// Recalling a memory as a coarse-to-fine walk down the bulk hierarchy. Memories are stored at the
// leaves of the bulk tree, and each tree level owns a disjoint block of the pattern coordinates: a
// leaf's pattern is the concatenation of the block features along its root-to-leaf path, so the
// bulk internal node at depth L literally holds the COARSE-GRAINED memory (the blocks fixed by the
// shared prefix, the rest unresolved). To recall from a noisy cue a self descends: at each level it
// reads that level's block of the cue and steps to the child whose block feature matches better, so
// recall takes log(N) mental steps (the tree depth), not the N of a flat scan. Scrambling the
// coarse patterns so they no longer predict their subtrees (a bulk with no meaningful hierarchy)
// destroys the descent.

export type RecallModel = {
  depth: number
  blockSize: number
  feature: number[][][] // feature[level][bit] = block of +-1 values
}

// Build the stored hierarchy: a fixed block feature per (level, child bit), deterministic from the
// seed (no randomness in the claim, only in fixed feature construction).
export function buildRecallModel(input: {
  depth: number
  blockSize: number
  seed: number
}): RecallModel {
  const { depth, blockSize, seed } = input
  const rng = makeRng({ seed })
  const feature: number[][][] = []

  for (let level = 0; level < depth; level++) {
    feature.push([[], []])

    for (let bit = 0; bit < 2; bit++) {
      for (let d = 0; d < blockSize; d++) {
        feature[level]![bit]!.push(rng.next() < 0.5 ? -1 : 1)
      }
    }
  }

  return { depth, blockSize, feature }
}

// The stored pattern of a leaf (memory index): the concatenation of the block features along its
// root-to-leaf address.
export function leafPattern(
  model: RecallModel,
  leaf: number,
): number[] {
  const pattern: number[] = []

  for (let level = 0; level < model.depth; level++) {
    const bit = (leaf >> (model.depth - 1 - level)) & 1
    pattern.push(...model.feature[level]![bit]!)
  }

  return pattern
}

// Recall a leaf from a cue that is its pattern with a fraction of coordinates flipped, by greedy
// coarse-to-fine descent. When `scramble` is set the coarse child features are permuted so they no
// longer predict their subtrees (the no-hierarchy control). Returns the recalled leaf index and the
// number of descent steps (always the tree depth).
export function recall(input: {
  model: RecallModel
  leaf: number
  noiseFraction: number
  scramble: boolean
  seed: number
}): { recalled: number; steps: number } {
  const { model, leaf, noiseFraction, scramble, seed } = input
  const { depth, blockSize, feature } = model

  const target = leafPattern(model, leaf)
  const rng = makeRng({ seed })
  const cue = target.map(value =>
    rng.next() < noiseFraction ? -value : value,
  )

  const childFeature = (level: number, bit: number): number[] => {
    if (!scramble) {
      return feature[level]![bit]!
    }

    // a scrambled coarse feature that no longer matches either real child
    return feature[level]![bit]!.map(
      (unused, d) =>
        feature[level]![0]![(d * 4 + 1) % blockSize]! *
        (d % 2 ? -1 : 1),
    )
  }

  let recalled = 0

  for (let level = 0; level < depth; level++) {
    const cueBlock = cue.slice(
      level * blockSize,
      (level + 1) * blockSize,
    )

    let overlap0 = 0
    let overlap1 = 0

    for (let d = 0; d < blockSize; d++) {
      overlap0 += cueBlock[d]! * childFeature(level, 0)[d]!
      overlap1 += cueBlock[d]! * childFeature(level, 1)[d]!
    }

    recalled = (recalled << 1) | (overlap1 > overlap0 ? 1 : 0)
  }

  return { recalled, steps: depth }
}
