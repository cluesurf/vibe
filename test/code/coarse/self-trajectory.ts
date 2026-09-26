// Conformance for code/coarse/self-trajectory: the micro source for the coarse-graining experiments.
// The stream (makeStream) is re-derived against the Kronecker formula it states; positionBin is the
// fixed-width bin of the positive-charge centroid; and the trajectory builders are checked for
// reproducibility and label range.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  makeStream,
  positionBin,
  selfTrajectory,
  selfUnitTrajectory,
} from '@/code/coarse/self-trajectory'

suite('coarse/self-trajectory: the stream', [
  // Independent reference: draw k < 64 of the stream at start 0 is frac(sqrt(q_k 401)), q_k the k-th
  // prime and 401 the prime start 0 owns, to the fixed-point rounding of the irrational.
  check('makeStream at start 0 is the Kronecker sequence of sqrt(q 401)', () => {
    const stream = makeStream(0)
    const primes = [2, 3, 5, 7, 11, 13, 17, 19]

    for (const q of primes) {
      const root = Math.sqrt(q * 401)

      close(stream.next(), root - Math.floor(root), 2 ** -30, `sqrt(${q} 401)`)
    }
  }),
  check('values lie in [0,1) and the start is reproducible', () => {
    const a = makeStream(7)
    const b = makeStream(7)

    for (let i = 0; i < 50; i++) {
      const x = a.next()

      ok(x >= 0 && x < 1, 'value in [0,1)')
      close(b.next(), x, 0, 'same start, same sequence')
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
  check(
    'selfTrajectory is reproducible and labels are in range',
    () => {
      const make = (): ReturnType<typeof selfTrajectory> =>
        selfTrajectory({ L: 20, beats: 10, bins: 5, seed: 3 })

      const a = make()
      const b = make()

      equal(a.labels.length, 10)
      equal(a.centroids.length, 10)

      for (let i = 0; i < a.labels.length; i++) {
        equal(
          a.labels[i]!,
          b.labels[i]!,
          'same seed gives the same labels',
        )
        ok(a.labels[i]! >= 0 && a.labels[i]! < 5, 'label in [0,bins)')
      }

      ok(a.meanSelfSize >= 0, 'mean self size is non-negative')
    },
  ),
  check('selfUnitTrajectory is reproducible', () => {
    const a = selfUnitTrajectory({ L: 20, beats: 8, seed: 11 })
    const b = selfUnitTrajectory({ L: 20, beats: 8, seed: 11 })

    equal(a.centroids.length, 8)

    for (let i = 0; i < a.centroids.length; i++) {
      close(
        a.centroids[i]!,
        b.centroids[i]!,
        0,
        'reproducible centroid',
      )
    }
  }),
])
