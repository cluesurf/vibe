// Conformance for code/coarse/self-trajectory: the micro source for the coarse-graining experiments.
// The local LCG (makeRng) is re-derived against an independent reference implementation of the same
// recurrence; positionBin is the fixed-width bin of the positive-charge centroid; and the stochastic
// trajectory builders are checked for reproducibility (same seed -> identical) and label range, the
// determinism the methodology requires (claims are L2, robustness comes from size not seeds).

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  makeRng,
  positionBin,
  selfTrajectory,
  selfUnitTrajectory,
} from '@/code/coarse/self-trajectory'

suite('coarse/self-trajectory: the LCG', [
  // Independent reference: s' = (s * 1664525 + 1013904223) mod 2^32, return s'/2^32. This re-derives
  // the documented recurrence rather than the implementation.
  check('makeRng matches the reference LCG recurrence', () => {
    const rng = makeRng(12345)
    let s = 12345 >>> 0
    for (let i = 0; i < 20; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      const expected = s / 4294967296
      close(rng.next(), expected, 0, `draw ${i}`)
    }
  }),
  check('draws lie in [0,1) and the seed is reproducible', () => {
    const a = makeRng(7)
    const b = makeRng(7)
    for (let i = 0; i < 50; i++) {
      const x = a.next()
      ok(x >= 0 && x < 1, 'draw in [0,1)')
      close(b.next(), x, 0, 'same seed, same sequence')
    }
  }),
])

suite('coarse/self-trajectory: position bin', [
  // An all-plus 4x4 lattice: centroid x is the mean column = (0+1+2+3)/4 = 1.5. With 4 bins,
  // floor((1.5/4)*4) = floor(1.5) = 1.
  check('an all-plus field bins by its centroid column', () => {
    const tone = new Int8Array(16).fill(1)
    equal(positionBin({ tone, L: 4, bins: 4 }), 1)
  }),
  // An empty field defaults the centroid to L/2 = 2, binning to floor((2/4)*4) = 2.
  check('an empty field falls back to the centre bin', () => {
    const tone = new Int8Array(16)
    equal(positionBin({ tone, L: 4, bins: 4 }), 2)
  }),
])

suite('coarse/self-trajectory: trajectory reproducibility', [
  check('selfTrajectory is reproducible and labels are in range', () => {
    const make = (): ReturnType<typeof selfTrajectory> =>
      selfTrajectory({ L: 20, beats: 10, bins: 5, seed: 3 })
    const a = make()
    const b = make()
    equal(a.labels.length, 10)
    equal(a.centroids.length, 10)
    for (let i = 0; i < a.labels.length; i++) {
      equal(a.labels[i]!, b.labels[i]!, 'same seed gives the same labels')
      ok(a.labels[i]! >= 0 && a.labels[i]! < 5, 'label in [0,bins)')
    }
    ok(a.meanSelfSize >= 0, 'mean self size is non-negative')
  }),
  check('selfUnitTrajectory is reproducible', () => {
    const a = selfUnitTrajectory({ L: 20, beats: 8, seed: 11 })
    const b = selfUnitTrajectory({ L: 20, beats: 8, seed: 11 })
    equal(a.centroids.length, 8)
    for (let i = 0; i < a.centroids.length; i++) {
      close(a.centroids[i]!, b.centroids[i]!, 0, 'reproducible centroid')
    }
  }),
])
