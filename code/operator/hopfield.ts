// Dense ternary Hopfield memory: stored patterns become attractors of a fully
// connected signed-Hebbian coupling. Each cell holds a tone in {-1, 0, +1}. The
// coupling J[i][j] is the sign of the correlation of cells i and j across the stored
// patterns, so each pattern is a fixed point and the couplings stay ternary. A beat
// sets each cell to the sign of its local field (the Hebbian recall plus an optional
// bias), with clamped cells held fixed and ties keeping the current tone.

import { Rng } from '@/code/tool/rng'

export const sign = (h: number): -1 | 0 | 1 => (h > 0 ? 1 : h < 0 ? -1 : 0)

// Random ternary patterns of +/-1 (no zero), one per stored memory.
export function storedPatterns(count: number, size: number, rng: Rng): Int8Array[] {
  return Array.from({ length: count }, () =>
    Int8Array.from({ length: size }, () => (rng.next() < 0.5 ? -1 : 1)),
  )
}

// Signed Hebbian coupling: J[i][j] = sign(sum_p p[i] p[j]) over stored patterns, so
// every stored pattern is an attractor and the couplings stay ternary.
export function hebbianFills(patterns: Int8Array[], size: number): Int8Array[] {
  const J: Int8Array[] = Array.from({ length: size }, () => new Int8Array(size))
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      let s = 0
      for (const p of patterns) {
        s += (p[i] ?? 0) * (p[j] ?? 0)
      }
      const f = sign(s)
      J[i]![j] = f
      J[j]![i] = f
    }
  }
  return J
}

// Normalized ternary overlap (the Hopfield projection): dot product divided by length,
// so a vector with itself over +/-1 patterns is 1.
export function toneOverlap(a: Int8Array, b: Int8Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s / a.length
}

// Diverge a stored pattern from its ancestor: flip each site independently with
// probability `rate` to a fresh random sign. The common-ancestry mechanism, two
// banks mutated separately from a shared root share inherited correlation.
export function mutatePattern(input: { pattern: Int8Array; rate: number; rng: Rng }): Int8Array {
  const { pattern, rate, rng } = input
  const out = Int8Array.from(pattern)
  for (let i = 0; i < out.length; i++) if (rng.next() < rate) out[i] = (rng.next() < 0.5 ? -1 : 1) as -1 | 1
  return out
}

// Mean absolute overlap between two pattern banks (the inherited shared-ancestry
// signal), averaged pattern-by-pattern.
export function bankOverlap(a: Int8Array[], b: Int8Array[]): number {
  let s = 0
  for (let m = 0; m < a.length; m++) s += Math.abs(toneOverlap(a[m] ?? new Int8Array(0), b[m] ?? new Int8Array(0)))
  return s / Math.max(1, a.length)
}

// The stored pattern most aligned with a tone, by absolute overlap (so an inverted
// recall counts as the same memory).
export function nearestPattern(tone: Int8Array, patterns: Int8Array[]): { index: number; overlap: number } {
  let best = -1
  let bestOv = -2
  patterns.forEach((p, k) => {
    const o = Math.abs(toneOverlap(tone, p))
    if (o > bestOv) {
      bestOv = o
      best = k
    }
  })
  return { index: best, overlap: bestOv }
}

// One synchronous dense Hopfield beat. next[i] = sign( bias[i] + sum_j J[i][j] tone[j] ),
// with clamped cells (clamp[i] != 0) held to their clamp value and ties keeping tone[i].
export function hopfieldStep(J: Int8Array[], tone: Int8Array, bias: Float64Array, clamp: Int8Array | null): Int8Array {
  const n = tone.length
  const next = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    if (clamp && clamp[i] !== 0) {
      next[i] = clamp[i] as -1 | 0 | 1
      continue
    }
    const row = J[i] ?? new Int8Array(0)
    let h = bias[i] ?? 0
    for (let j = 0; j < n; j++) {
      h += (row[j] ?? 0) * (tone[j] ?? 0)
    }
    next[i] = h > 0 ? 1 : h < 0 ? -1 : (tone[i] ?? 0)
  }
  return next
}
