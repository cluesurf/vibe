// Conformance for code/dynamics/static-metric-photon: deriving the spatial metric by the self-consistent
// bootstrap and the photon deflection on a general static metric. Invariants:
//   - BOOTSTRAP fixed point: B_{n+1} = 1 + x B_n converges to 1/(1 - x), the resummed g_rr.
//   - THE SPATIAL METRIC CONTRIBUTES HALF THE BENDING: the full deflection is ~ twice the time-only
//     (flat-spatial) deflection in the weak field (the famous factor of two).

import { suite, check, close, ok } from '@/test/code/harness'
import {
  spatialMetricBootstrap,
  staticMetricPhotonDeflection,
} from '@/code/dynamics/static-metric-photon'

suite('dynamics/static-metric-photon: bootstrap fixed point', [
  check('B_{n+1} = 1 + x B_n converges to 1/(1 - x)', () => {
    for (const x of [0.1, 0.3, 0.5]) {
      const trail = spatialMetricBootstrap({ x, iterations: 200 })

      close(
        trail[trail.length - 1]!,
        1 / (1 - x),
        1e-9,
        `fixed point at x=${x}`,
      )
    }
  }),
  check(
    'the first iterate is 1 + x (one order of curvature energy)',
    () => {
      const trail = spatialMetricBootstrap({ x: 0.4, iterations: 3 })

      close(trail[0]!, 1.4, 1e-12, 'B_1 = 1 + x')
    },
  ),
])

suite('dynamics/static-metric-photon: factor-of-two bending', [
  check(
    'the full spatial metric roughly doubles the time-only deflection',
    () => {
      const rs = 1
      const b = 100
      const full = staticMetricPhotonDeflection({
        schwarzschildRadius: rs,
        impactParameter: b,
        spatialMetric: 'full',
      })

      const flat = staticMetricPhotonDeflection({
        schwarzschildRadius: rs,
        impactParameter: b,
        spatialMetric: 'flat',
      })

      ok(full !== null && flat !== null, 'both escape at large b')
      close(full! / flat!, 2, 0.1, 'full ~ 2 x flat')
    },
  ),
  check('the time-only weak-field deflection is ~ r_s / b', () => {
    const rs = 1
    const b = 200
    const flat = staticMetricPhotonDeflection({
      schwarzschildRadius: rs,
      impactParameter: b,
      spatialMetric: 'flat',
    })

    ok(flat !== null, 'escapes')
    close(flat!, rs / b, (rs / b) * 0.08, 'flat ~ r_s / b')
  }),
])
