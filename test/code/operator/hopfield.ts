// Conformance for code/operator/hopfield: dense ternary Hopfield memory. Facts:
//   - hebbianFills is symmetric, ternary, and zero on the diagonal (exact).
//   - a single stored pattern is a fixed point of one beat (exact).
//   - a noisy cue (a few flipped bits) is recalled to the stored pattern (exact).
//   - toneOverlap of a +/-1 vector with itself is 1; clamped cells are held (exact).
//   - nearestPattern picks the stored pattern.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  sign,
  hebbianFills,
  toneOverlap,
  nearestPattern,
  hopfieldStep,
} from '@/code/operator/hopfield'

const size = 16
const pattern = Int8Array.from(
  { length: size },
  (_, i) => ((i * 5 + 1) % 7 < 3 ? -1 : 1),
)
const J = hebbianFills([pattern], size)
const zero = new Float64Array(size)

suite('operator/hopfield: Hebbian coupling', [
  check('sign maps to -1/0/+1', () => {
    equal(sign(5), 1, 'positive -> +1')
    equal(sign(-2), -1, 'negative -> -1')
    equal(sign(0), 0, 'zero -> 0')
  }),
  check('hebbianFills is symmetric, ternary, zero diagonal', () => {
    for (let i = 0; i < size; i++) {
      equal(J[i]![i], 0, `diagonal ${i} is zero`)
      for (let j = 0; j < size; j++) {
        equal(J[i]![j], J[j]![i], `symmetric (${i},${j})`)
        const f = J[i]![j]!
        ok(f === -1 || f === 0 || f === 1, 'coupling is ternary')
      }
    }
  }),
])

suite('operator/hopfield: recall', [
  check('a single stored pattern is a fixed point', () => {
    const next = hopfieldStep(J, pattern, zero, null)
    ok(next.every((v, i) => v === pattern[i]), 'one beat leaves the stored pattern fixed')
  }),
  check('a noisy cue is recalled to the stored pattern', () => {
    const cue = Int8Array.from(pattern)
    cue[0] = -cue[0]! as -1 | 1
    cue[3] = -cue[3]! as -1 | 1
    cue[9] = -cue[9]! as -1 | 1
    let state = cue
    for (let t = 0; t < 5; t++) {
      state = hopfieldStep(J, state, zero, null)
    }
    ok(state.every((v, i) => v === pattern[i]), 'the memory recalls the stored pattern')
  }),
  check('toneOverlap with self is 1 for a +/-1 vector', () => {
    equal(toneOverlap(pattern, pattern), 1, 'normalized self-overlap is 1')
  }),
  check('clamped cells are held to their clamp value', () => {
    const clamp = new Int8Array(size)
    clamp[0] = 1
    clamp[1] = -1
    const start = Int8Array.from(pattern)
    const next = hopfieldStep(J, start, zero, clamp)
    equal(next[0], 1, 'clamped cell 0 forced to +1')
    equal(next[1], -1, 'clamped cell 1 forced to -1')
  }),
  check('nearestPattern picks the stored pattern', () => {
    const banks = [pattern, Int8Array.from(pattern, v => -v as -1 | 1)]
    const { index, overlap } = nearestPattern(pattern, banks)
    equal(index, 0, 'the exact match is nearest')
    equal(overlap, 1, 'full overlap')
  }),
])
