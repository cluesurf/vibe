// Conformance for code/dynamics/friedmann: the FLRW scale-factor dynamics (RK4). Invariants:
//   - COMOVING CONSERVATION: the continuity equation keeps rho_i * a^{3(1+w_i)} constant along the
//     trajectory (matter ~ a^-3, radiation ~ a^-4).
//   - decelerationParameter q = -a'' a / a'^2 is the exact central-difference formula (q = -1/2 for a ~ t^2).
//   - de Sitter (w = -1): the density is constant and the expansion accelerates (q ~ -1).
//   - DETERMINISM.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  integrateFriedmann,
  decelerationParameter,
} from '@/code/dynamics/friedmann'

suite('dynamics/friedmann: comoving conservation', [
  check('matter density scales as a^-3 (rho a^3 conserved)', () => {
    const out = integrateFriedmann({
      comps: [{ rho: 1, w: 0 }],
      a0: 1,
      t0: 1,
      tMax: 3,
      dt: 0.001,
    })

    const c0 = out.rho[0]! * out.a[0]! ** 3

    for (let i = 0; i < out.a.length; i += 200) {
      close(
        out.rho[i]! * out.a[i]! ** 3,
        c0,
        c0 * 2e-3,
        `rho a^3 at ${i}`,
      )
    }
  }),
  check('radiation density scales as a^-4 (rho a^4 conserved)', () => {
    const out = integrateFriedmann({
      comps: [{ rho: 1, w: 1 / 3 }],
      a0: 1,
      t0: 1,
      tMax: 3,
      dt: 0.001,
    })

    const c0 = out.rho[0]! * out.a[0]! ** 4

    for (let i = 0; i < out.a.length; i += 200) {
      close(
        out.rho[i]! * out.a[i]! ** 4,
        c0,
        c0 * 2e-3,
        `rho a^4 at ${i}`,
      )
    }
  }),
])

suite('dynamics/friedmann: deceleration parameter', [
  check(
    'q = -1/2 for a ~ t^2 (exact central-difference closed form)',
    () => {
      const dt = 0.1
      const a = Array.from({ length: 9 }, (_, i) => (1 + i * dt) ** 2)

      close(
        decelerationParameter({ a, index: 4, dt }),
        -0.5,
        1e-9,
        'q = -1/2 for a ~ t^2',
      )
    },
  ),
  check(
    'de Sitter (w = -1) has constant density and accelerates (q ~ -1)',
    () => {
      const out = integrateFriedmann({
        comps: [{ rho: 1, w: -1 }],
        a0: 1,
        t0: 0,
        tMax: 2,
        dt: 0.001,
      })

      const mid = Math.floor(out.a.length / 2)

      close(out.rho[mid]!, 1, 1e-3, 'density stays constant')
      close(
        decelerationParameter({ a: out.a, index: mid, dt: 0.001 }),
        -1,
        0.02,
        'q ~ -1',
      )
    },
  ),
])

suite('dynamics/friedmann: determinism', [
  check('two identical integrations agree', () => {
    const opts = {
      comps: [{ rho: 1, w: 0 }],
      a0: 1,
      t0: 1,
      tMax: 2,
      dt: 0.01,
    }

    const a = integrateFriedmann(opts)
    const b = integrateFriedmann(opts)

    equal(a.a.length, b.a.length, 'same length')

    for (let i = 0; i < a.a.length; i++) {
      equal(a.a[i]!, b.a[i]!, `a[${i}]`)
    }
  }),
])
