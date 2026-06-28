// Conformance for code/measure/agreement. Agreement / disagreement are exact entry-count fractions,
// target fidelity is the signed projection onto a target, and clusterMajority is the per-cluster sign
// of the tone sum. Each value is hand-tallied.

import { suite, check, equal, close, exactArray } from '@/test/code/harness'
import {
  agreementFraction,
  disagreementFraction,
  targetFidelity,
  clusterMajority,
} from '@/code/measure/agreement'

const TOL = 1e-12

suite('measure/agreement: agreement / disagreement', [
  check('fraction of equal entries is exact', () => {
    // [1,0,-1,1] vs [1,1,-1,0]: equal at indices 0 and 2 -> 2/4.
    const a = Int8Array.from([1, 0, -1, 1])
    const b = Int8Array.from([1, 1, -1, 0])
    equal(agreementFraction(a, b), 0.5)
    equal(disagreementFraction(a, b), 0.5)
  }),
  check('identical vectors agree fully', () => {
    const a = Int8Array.from([1, -1, 0])
    equal(agreementFraction(a, a), 1)
    equal(disagreementFraction(a, a), 0)
  }),
])

suite('measure/agreement: targetFidelity', [
  check('a field equal to its target scores +1', () => {
    const t = Int8Array.from([1, -1, 1])
    equal(targetFidelity(t, t), 1)
  }),
  check('an anti-aligned field scores -1', () => {
    const target = Int8Array.from([1, -1, 1])
    const tone = Int8Array.from([-1, 1, -1])
    close(targetFidelity(tone, target), -1, TOL)
  }),
  check('a zero target gives 0, not NaN', () => {
    equal(targetFidelity(Int8Array.from([1, 1]), Int8Array.from([0, 0])), 0)
  }),
  check('partial overlap is dot / target-norm', () => {
    // tone=[1,1,0], target=[1,0,1]: dot=1, ||target||^2=2 -> 0.5.
    close(
      targetFidelity(Int8Array.from([1, 1, 0]), Int8Array.from([1, 0, 1])),
      0.5,
      TOL,
    )
  }),
])

suite('measure/agreement: clusterMajority', [
  check('each cluster takes the sign of its tone sum', () => {
    // cluster 0 holds cells {0,1} tones {1,1} -> sum 2 -> +1;
    // cluster 1 holds cell {2} tone {-1} -> -1.
    const out = clusterMajority(
      Int32Array.from([0, 0, 1]),
      2,
      Int8Array.from([1, 1, -1]),
    )
    exactArray(out, [1, -1])
  }),
  check('a tied cluster reads 0 (rest)', () => {
    const out = clusterMajority(
      Int32Array.from([0, 0]),
      1,
      Int8Array.from([1, -1]),
    )
    exactArray(out, [0])
  }),
])
