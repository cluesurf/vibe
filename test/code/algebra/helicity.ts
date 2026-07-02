// Conformance for code/algebra/helicity: the spin-2 helicity of a gravitational-wave
// polarization, read off how the transverse-traceless plus/cross tensors transform under
// a z-rotation. A spin-2 tensor's self-overlap is cos(2 theta) (period 180 deg) and its
// plus->cross overlap is sin(2 theta) (=1 at 45 deg). Every expected value is the spin-2
// trigonometric identity, re-derived independently, not the implementation's output.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  rotationZ,
  conjugateTensor,
  tensorInner,
  PLUS_POLARIZATION,
  CROSS_POLARIZATION,
  plusSelfOverlap,
  plusToCrossOverlap,
  type Matrix3,
} from '@/code/algebra/helicity'

const TOL = 1e-12

suite('algebra/helicity: rotationZ is a proper rotation', [
  check('rotationZ is orthogonal with trace 1 + 2 cos theta', () => {
    for (const t of [0.3, 1.0, Math.PI / 2, 2.5]) {
      const R = rotationZ(t)

      // R R^T = I
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const dot =
            R[i]![0]! * R[j]![0]! +
            R[i]![1]! * R[j]![1]! +
            R[i]![2]! * R[j]![2]!

          close(dot, i === j ? 1 : 0, TOL, 'orthonormal')
        }
      }

      close(
        R[0][0]! + R[1][1]! + R[2][2]!,
        1 + 2 * Math.cos(t),
        TOL,
        'trace',
      )
    }
  }),
])

suite('algebra/helicity: the polarization tensors', [
  check(
    'plus and cross are traceless, unit-Frobenius^2 = 2, orthogonal',
    () => {
      const plusTrace =
        PLUS_POLARIZATION[0][0]! +
        PLUS_POLARIZATION[1][1]! +
        PLUS_POLARIZATION[2][2]!

      const crossTrace =
        CROSS_POLARIZATION[0][0]! +
        CROSS_POLARIZATION[1][1]! +
        CROSS_POLARIZATION[2][2]!

      equal(plusTrace, 0, 'plus is traceless')
      equal(crossTrace, 0, 'cross is traceless')
      equal(
        tensorInner(PLUS_POLARIZATION, PLUS_POLARIZATION),
        2,
        '|plus|^2 = 2',
      )
      equal(
        tensorInner(CROSS_POLARIZATION, CROSS_POLARIZATION),
        2,
        '|cross|^2 = 2',
      )
      equal(
        tensorInner(PLUS_POLARIZATION, CROSS_POLARIZATION),
        0,
        'plus _|_ cross',
      )
    },
  ),
  check('conjugating by the identity rotation is a no-op', () => {
    const identity: Matrix3 = rotationZ(0)
    const out = conjugateTensor(identity, PLUS_POLARIZATION)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        close(
          out[i]![j]!,
          PLUS_POLARIZATION[i]![j]!,
          TOL,
          'R(0) e R(0)^T = e',
        )
      }
    }
  }),
])

suite('algebra/helicity: spin-2 overlaps', [
  check('plusSelfOverlap(theta) = cos(2 theta), period 180 deg', () => {
    for (const t of [0, 0.4, Math.PI / 6, 1.2, 2.7]) {
      close(plusSelfOverlap(t), Math.cos(2 * t), 1e-12, 'self overlap')
    }

    close(plusSelfOverlap(0), 1, 1e-12, 'theta=0 -> 1')
    close(plusSelfOverlap(Math.PI / 4), 0, 1e-12, '45 deg -> 0')
    close(plusSelfOverlap(Math.PI / 2), -1, 1e-12, '90 deg -> -1')
    close(
      plusSelfOverlap(Math.PI),
      1,
      1e-12,
      '180 deg -> back to +1 (period)',
    )
  }),
  check(
    'plusToCrossOverlap(theta) = sin(2 theta), = 1 at 45 deg',
    () => {
      for (const t of [0, 0.4, Math.PI / 6, 1.2]) {
        close(
          plusToCrossOverlap(t),
          Math.sin(2 * t),
          1e-12,
          'cross overlap',
        )
      }

      close(plusToCrossOverlap(0), 0, 1e-12, 'theta=0 -> 0')
      close(
        plusToCrossOverlap(Math.PI / 4),
        1,
        1e-12,
        'plus rotates into cross at 45',
      )
    },
  ),
  check('the two overlaps satisfy cos^2 + sin^2 = 1', () => {
    for (const t of [0.2, 0.9, 1.7, 2.4]) {
      const c = plusSelfOverlap(t)
      const s = plusToCrossOverlap(t)
      close(c * c + s * s, 1, 1e-12, 'unit circle')
    }
  }),
])
