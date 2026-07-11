// Conformance for code/measure/isotropy: the angular anisotropy estimators. Each is
// fed an input whose anisotropy is known exactly from symmetry: the six cubic axes are
// isotropic to the order-2 moment (all probe axes see the same), a single direction is
// maximally anisotropic, and an evenly sampled circle satisfies the continuum order-4
// identity <cos^4> = 3 <cos^2 sin^2>.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  angularAnisotropy,
  directionFourthMoments,
  harmonicAnisotropy,
  diffusionTensorAnisotropy,
  nearestLinkHarmonicAnisotropy,
} from '@/code/measure/isotropy'

const TOL = 1e-9

const AXES3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

const CUBIC6 = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

suite('measure/isotropy: angular moment anisotropy', [
  // For the six cubic axes each probe sees <(n.u)^2> = 2/6 = 1/3, so max == min == mean
  // and the anisotropy is exactly 0.
  check('cubic axes are isotropic to the order-2 moment', () => {
    close(
      angularAnisotropy({ directions: CUBIC6, axes: AXES3, order: 2 }),
      0,
      TOL,
    )
  }),
  // A single +x direction: probe x sees 1, probes y,z see 0; mean = 1/3, range = 1,
  // so anisotropy = (1-0)/(1/3) = 3.
  check('a single direction is maximally anisotropic (=3)', () => {
    close(
      angularAnisotropy({
        directions: [[1, 0, 0]],
        axes: AXES3,
        order: 2,
      }),
      3,
      TOL,
    )
  }),
])

suite('measure/isotropy: order-4 moments', [
  // The six cubic axes: sum d_x^4 = 2 (the +/- x pair), sum d_x^2 d_y^2 = 0 (no axis has
  // two nonzero components), so |diag - 3 mixed| = 2.
  check('cubic axes carry an order-4 anisotropy of exactly 2', () => {
    const m = directionFourthMoments(CUBIC6)

    close(m.diagonal, 2, TOL)
    close(m.mixed, 0, TOL)
    close(m.anisotropy, 2, TOL)
  }),
  // An evenly sampled circle is isotropic to order 4: by discrete orthogonality (N > 4)
  // sum cos^4 = 3N/8 and sum cos^2 sin^2 = N/8, so diag = 3 mixed exactly.
  check(
    'an 8-fold circle satisfies diag = 3 mixed (anisotropy 0)',
    () => {
      const dirs = Array.from({ length: 8 }, (_, k) => {
        const t = (2 * Math.PI * k) / 8

        return [Math.cos(t), Math.sin(t)]
      })

      const m = directionFourthMoments(dirs)

      close(m.diagonal, 3, TOL)
      close(m.mixed, 1, TOL)
      close(m.anisotropy, 0, TOL)
    },
  ),
])

suite('measure/isotropy: harmonic and lattice anisotropy', [
  // A flat profile has no angular harmonic: every Fourier component sums to 0 over the
  // full period, so the worst-harmonic magnitude is 0.
  check('a flat angular profile has zero harmonic anisotropy', () => {
    close(
      harmonicAnisotropy({ profile: new Array(12).fill(5) }),
      0,
      TOL,
    )
  }),
  // A square lattice: each point's nearest neighbour lies along an axis, angle a multiple
  // of pi/2, so cos(4 ang) = 1 for all and the 4-fold magnitude is exactly 1.
  check('a square lattice shows a 4-fold link harmonic of 1', () => {
    const points: { x: number; y: number }[] = []

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) points.push({ x, y })
    }

    close(nearestLinkHarmonicAnisotropy({ points }), 1, TOL)
  }),
])

suite('measure/isotropy: diffusion tensor', [
  // The six cubic neighbours: the unit-displacement covariance is (1/3) I, so the three
  // eigenvalues are equal and the anisotropy is 0.
  check('cubic neighbours give an isotropic diffusion tensor', () => {
    const coords = [
      [0, 0, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ]

    const neighbors = [[1, 2, 3, 4, 5, 6], [], [], [], [], [], []]
    const result = diffusionTensorAnisotropy({
      coords,
      neighbors,
      cells: [0],
    })

    close(result.anisotropy, 0, TOL)
    equal(result.count, 6)

    for (const e of result.eigenvalues) close(e, 1 / 3, 1e-6)
  }),
  // Neighbours only along x: covariance = diag(1,0,0), eigenvalues {0,0,1}, mean 1/3,
  // anisotropy (1-0)/(1/3) = 3.
  check('a one-axis walk is maximally anisotropic (=3)', () => {
    const coords = [
      [0, 0, 0],
      [1, 0, 0],
      [-1, 0, 0],
    ]

    const neighbors = [[1, 2], [], []]
    const result = diffusionTensorAnisotropy({
      coords,
      neighbors,
      cells: [0],
    })

    close(result.anisotropy, 3, 1e-6)
  }),
])
