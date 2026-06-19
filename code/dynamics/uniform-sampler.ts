// A correct uniform-measure sampler for causal sets. The old Monte Carlo toggled
// a raw relation bit and then took the transitive closure, which changes many
// pairs at once and breaks detailed balance, so it did not sample the uniform
// measure. The fix: propose toggling a SINGLE pair and accept only if the result
// is still a valid (transitive) poset. That proposal is symmetric, so with a flat
// target it samples the uniform measure exactly, and with weight e^{-beta S} it
// samples the causal-set Gibbs ensemble. This is the sampler P2 / P6 needs to
// reach the large-N entropic regime. See note/questions/p2-p6-optimal-path.md.

import {
  makeBitMatrix,
  BitMatrix,
  getBit,
  setBit,
} from '@/code/tool/bitset'
import { Rng } from '@/code/tool/rng'

// The 2D smeared Benincasa-Dowker kernel (inlined to avoid Poset construction).
function smearedKernel2D(n: number, eps: number): number {
  const oneMinus = 1 - eps

  if (oneMinus <= 0) {
    return n === 0 ? 1 : 0
  }

  const base = Math.pow(oneMinus, n)
  const term =
    1 -
    (2 * eps * n) / oneMinus +
    (eps * eps * n * (n - 1)) / (2 * oneMinus * oneMinus)

  return base * term
}

function popcount32(x: number): number {
  let v = x - ((x >>> 1) & 0x55555555)
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
  v = (v + (v >>> 4)) & 0x0f0f0f0f

  return (v * 0x01010101) >>> 24
}

export interface State {
  size: number
  stride: number
  future: BitMatrix // future.words[a*stride + w]: b's that a precedes
  past: BitMatrix // past.words[b*stride + w]: a's that precede b
}

export function makeState(
  size: number,
  startFuture?: BitMatrix,
): State {
  const future = makeBitMatrix({ rows: size, cols: size })
  const past = makeBitMatrix({ rows: size, cols: size })

  if (startFuture) {
    // Seed from a transitive future relation, building past as its transpose.
    for (let a = 0; a < size; a++) {
      for (let b = a + 1; b < size; b++) {
        if (getBit(startFuture, { row: a, col: b })) {
          setBit(future, { row: a, col: b })
          setBit(past, { row: b, col: a })
        }
      }
    }
  }

  return { size, stride: future.stride, future, past }
}

// future[i] subset of future[j]? i.e. (future[i] & ~future[j]) == 0.
function rowSubset(
  words: Uint32Array,
  aBase: number,
  bBase: number,
  stride: number,
): boolean {
  for (let w = 0; w < stride; w++) {
    const a = words[aBase + w] ?? 0
    const b = words[bBase + w] ?? 0

    if ((a & ~b) !== 0) {
      return false
    }
  }

  return true
}

// (rowA & rowB) over two different matrices is empty?
function rowsDisjoint(
  wordsA: Uint32Array,
  aBase: number,
  wordsB: Uint32Array,
  bBase: number,
  stride: number,
): boolean {
  for (let w = 0; w < stride; w++) {
    if (((wordsA[aBase + w] ?? 0) & (wordsB[bBase + w] ?? 0)) !== 0) {
      return false
    }
  }

  return true
}

export function isRelated(state: State, i: number, j: number): boolean {
  const word = state.future.words[i * state.stride + (j >>> 5)] ?? 0

  return (word & (1 << (j & 31))) !== 0
}

// Toggle the single pair i precedes j in both future and past.
export function toggle(state: State, i: number, j: number): void {
  const fi = i * state.stride + (j >>> 5)
  state.future.words[fi] =
    (state.future.words[fi] ?? 0) ^ (1 << (j & 31))

  const pi = j * state.stride + (i >>> 5)
  state.past.words[pi] = (state.past.words[pi] ?? 0) ^ (1 << (i & 31))
}

// Adding i<j keeps transitivity iff past(i) subset past(j) and future(j) subset
// future(i). Removing i<j keeps it iff no k with i<k<j (future(i) and past(j)
// disjoint).
export function toggleKeepsValid(
  state: State,
  i: number,
  j: number,
  related: boolean,
): boolean {
  const s = state.stride

  if (related) {
    return rowsDisjoint(
      state.future.words,
      i * s,
      state.past.words,
      j * s,
      s,
    )
  }

  return (
    rowSubset(state.past.words, i * s, j * s, s) &&
    rowSubset(state.future.words, j * s, i * s, s)
  )
}

function relationCount(state: State): number {
  let total = 0

  const words = state.future.words

  for (let i = 0; i < words.length; i++) {
    total += popcount32(words[i] ?? 0)
  }

  return total
}

// Longest chain (height) via DP in index order (the labelling is topological).
export function height(state: State): number {
  const n = state.size
  const longest = new Int32Array(n).fill(1)

  let max = n > 0 ? 1 : 0

  const s = state.stride

  for (let v = 0; v < n; v++) {
    const lv = longest[v] ?? 1
    const base = v * s

    for (let w = 0; w < s; w++) {
      let bits = state.future.words[base + w] ?? 0

      while (bits !== 0) {
        const bit = bits & -bits
        const idx = w * 32 + (31 - Math.clz32(bit))

        if (lv + 1 > (longest[idx] ?? 1)) {
          longest[idx] = lv + 1

          if (lv + 1 > max) {
            max = lv + 1
          }
        }

        bits ^= bit
      }
    }
  }

  return max
}

// Smeared 2D Benincasa-Dowker action on the bit state.
export function smearedAction(state: State, eps: number): number {
  const n = state.size
  const s = state.stride

  let sum = 0

  for (let a = 0; a < n; a++) {
    const aBase = a * s

    for (let w = 0; w < s; w++) {
      let bits = state.future.words[aBase + w] ?? 0

      while (bits !== 0) {
        const bit = bits & -bits
        const b = w * 32 + (31 - Math.clz32(bit))

        // interval size = |future(a) intersect past(b)|
        let inter = 0

        const bBase = b * s

        for (let v = 0; v < s; v++) {
          inter += popcount32(
            (state.future.words[aBase + v] ?? 0) &
              (state.past.words[bBase + v] ?? 0),
          )
        }

        sum += smearedKernel2D(inter, eps)
        bits ^= bit
      }
    }
  }

  return -n / 2 + eps * sum
}

// Sample causal sets under the correct uniform-measure move, weighted by
// e^{-beta * S} with the smeared action (beta = 0 gives the pure uniform measure).
export function sampleUniform(input: {
  size: number
  beta: number
  epsilon: number
  steps: number
  rng: Rng
  sampleEvery?: number
  startFuture?: BitMatrix
}): {
  manifoldFraction: number
  meanHeightRatio: number
  meanOrderingFraction: number
  meanAction: number
  // Action averaged within each phase class (manifold = height ratio > 1), so the
  // per-phase action is well defined even when a branch is only metastable. NaN if
  // the run produced no samples of that class.
  meanActionManifold: number
  meanActionLayered: number
  manifoldSamples: number
  layeredSamples: number
  acceptance: number
} {
  const state = makeState(input.size, input.startFuture)
  const n = input.size
  const pairsTotal = (n * (n - 1)) / 2
  const useAction = input.beta > 0

  let currentS = useAction ? smearedAction(state, input.epsilon) : 0

  const burnIn = Math.floor(input.steps / 2)
  const sampleEvery = input.sampleEvery ?? 1

  let manifoldHits = 0
  let hrSum = 0
  let ofSum = 0
  let actionSum = 0
  let actManSum = 0
  let actManN = 0
  let actLaySum = 0
  let actLayN = 0
  let samples = 0
  let accepts = 0

  for (let step = 0; step < input.steps; step++) {
    const i = input.rng.nextInt({ max: n })

    let j = input.rng.nextInt({ max: n })

    if (i === j) {
      j = (j + 1) % n
    }

    const lo = Math.min(i, j)
    const hi = Math.max(i, j)

    if (lo === hi) {
      continue
    }

    const related = isRelated(state, lo, hi)

    if (toggleKeepsValid(state, lo, hi, related)) {
      if (!useAction) {
        toggle(state, lo, hi)
        accepts += 1
      } else {
        toggle(state, lo, hi)

        const candidateS = smearedAction(state, input.epsilon)
        const deltaS = candidateS - currentS

        if (
          deltaS <= 0 ||
          input.rng.next() < Math.exp(-input.beta * deltaS)
        ) {
          currentS = candidateS
          accepts += 1
        } else {
          toggle(state, lo, hi) // revert
        }
      }
    }

    if (step >= burnIn && step % sampleEvery === 0) {
      const h = height(state)
      const hr = n > 1 ? h / Math.sqrt(n) : 0
      hrSum += hr

      const act = useAction
        ? currentS
        : smearedAction(state, input.epsilon)

      if (hr > 1) {
        manifoldHits += 1
        actManSum += act
        actManN += 1
      } else {
        actLaySum += act
        actLayN += 1
      }

      ofSum += pairsTotal > 0 ? relationCount(state) / pairsTotal : 0
      actionSum += act
      samples += 1
    }
  }

  return {
    manifoldFraction: samples > 0 ? manifoldHits / samples : 0,
    meanHeightRatio: samples > 0 ? hrSum / samples : 0,
    meanOrderingFraction: samples > 0 ? ofSum / samples : 0,
    meanAction: samples > 0 ? actionSum / samples : 0,
    meanActionManifold: actManN > 0 ? actManSum / actManN : NaN,
    meanActionLayered: actLayN > 0 ? actLaySum / actLayN : NaN,
    manifoldSamples: actManN,
    layeredSamples: actLayN,
    acceptance: input.steps > 0 ? accepts / input.steps : 0,
  }
}
