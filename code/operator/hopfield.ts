// Dense ternary Hopfield memory: stored patterns become attractors of a fully
// connected signed-Hebbian coupling. Each cell holds a tone in {-1, 0, +1}. The
// coupling J[i][j] is the sign of the correlation of cells i and j across the stored
// patterns, so each pattern is a fixed point and the couplings stay ternary. A beat
// sets each cell to the sign of its local field (the Hebbian recall plus an optional
// bias), with clamped cells held fixed and ties keeping the current tone.

import { Rng, makeRng } from '@/code/tool/rng'

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

// Two unlinked Hopfield subsystems (no couplings between them) driven by the SAME ambient rhythm (a
// shared mode sequence). Each subsystem has its own pattern bank (pA, pB) and its own random initial
// state. During the first `cueHold` phases of each dwell window the system is cued toward its own
// pattern for the current mode, then it relaxes. Returns the mean end-of-window state overlap |<a,b>|
// across windows, the synchronized-transition correlation between the two subsystems. They share no
// link, so any correlation is inherited from how similar pA and pB are (their common ancestry).
export function runHopfieldPair(input: { size: number; pA: Int8Array[]; pB: Int8Array[]; modeSeq: number[]; seed: number }): number {
  const { size, pA, pB, modeSeq } = input
  const Ja = hebbianFills(pA, size)
  const Jb = hebbianFills(pB, size)
  const ra = makeRng({ seed: input.seed })
  const rb = makeRng({ seed: input.seed + 1 })
  let a = Int8Array.from({ length: size }, () => (ra.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  let b = Int8Array.from({ length: size }, () => (rb.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  const zero = new Float64Array(size)
  const cueCount = Math.round(0.55 * size)
  const cueHold = 4
  const dwell = 30
  const overlaps: number[] = []
  for (let t = 0; t < modeSeq.length * dwell; t++) {
    const phase = t % dwell
    const m = modeSeq[Math.floor(t / dwell)] ?? 0
    let cueA: Int8Array | null = null
    let cueB: Int8Array | null = null
    if (phase < cueHold) {
      cueA = new Int8Array(size)
      cueB = new Int8Array(size)
      const qa = pA[m] ?? new Int8Array(size)
      const qb = pB[m] ?? new Int8Array(size)
      for (let i = 0; i < cueCount; i++) {
        cueA[i] = qa[i] as -1 | 0 | 1
        cueB[i] = qb[i] as -1 | 0 | 1
      }
    }
    a = hopfieldStep(Ja, a, zero, cueA)
    b = hopfieldStep(Jb, b, zero, cueB)
    if (phase === dwell - 1) overlaps.push(Math.abs(toneOverlap(a, b)))
  }
  return overlaps.reduce((x, y) => x + y, 0) / Math.max(1, overlaps.length)
}
