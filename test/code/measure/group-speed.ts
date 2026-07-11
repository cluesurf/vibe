// Conformance for code/measure/group-speed. The group velocity is grad_k omega, computed by central
// finite difference. We check it against dispersions whose gradient is known in closed form:
// omega = |k| has group speed 1 in every direction (Lorentz safe, isotropic), omega = k^2 has
// d omega / d k = 2k, omega = sin k has cos k. The anisotropy of the |k| cone is ~ 0.

import { suite, check, close } from '@/test/code/harness'
import {
  groupSpeed,
  groupVelocity1d,
  groupSpeedAnisotropy,
} from '@/code/measure/group-speed'

suite('measure/group-speed: groupVelocity1d', [
  check('omega = k^2 has v = 2k (exact for central difference)', () => {
    close(groupVelocity1d({ omega: k => k * k, k: 3 }), 6, 1e-6)
    close(groupVelocity1d({ omega: k => k * k, k: -2 }), -4, 1e-6)
  }),
  check('omega = sin k has v = cos k', () => {
    close(
      groupVelocity1d({ omega: Math.sin, k: 0.7 }),
      Math.cos(0.7),
      1e-6,
    )
  }),
  check('a linear (massless) mode omega = k has v = 1', () => {
    close(groupVelocity1d({ omega: k => k, k: 5 }), 1, 1e-6)
  }),
])

suite('measure/group-speed: groupSpeed (2D)', [
  check(
    'omega = |k| has group speed 1 everywhere off the origin',
    () => {
      const omega = (kx: number, ky: number) => Math.hypot(kx, ky)

      close(groupSpeed({ omega, kx: 3, ky: 4 }), 1, 1e-4)
      close(groupSpeed({ omega, kx: 1, ky: 0 }), 1, 1e-4)
    },
  ),
  check('omega = kx^2 + ky^2 has |grad| = 2|k|', () => {
    const omega = (kx: number, ky: number) => kx * kx + ky * ky

    close(groupSpeed({ omega, kx: 1, ky: 0 }), 2, 1e-4)
    close(groupSpeed({ omega, kx: 3, ky: 4 }), 2 * 5, 1e-4)
  }),
])

suite('measure/group-speed: groupSpeedAnisotropy', [
  check(
    'the |k| cone is isotropic: anisotropy ~ 0, mean speed ~ 1',
    () => {
      const out = groupSpeedAnisotropy({
        omega: (kx, ky) => Math.hypot(kx, ky),
        kMag: 1,
      })

      close(out.meanSpeed, 1, 1e-4)
      close(out.anisotropy, 0, 1e-3)
    },
  ),
])
