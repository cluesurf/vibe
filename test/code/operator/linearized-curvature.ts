// Conformance for code/operator/linearized-curvature: the momentum-space linearized curvature
// pipeline Christoffel -> Ricci -> Einstein from a metric perturbation h_ij at wavevector k.
// Re-derivable facts of the linearized Einstein operator G:
//   - Diffeomorphism (gauge) invariance: a pure-gauge perturbation h = k xi + xi k is
//     annihilated, G[k xi + xi k] = 0, for any k and xi.
//   - On a transverse-traceless perturbation G[h] = (1/2)|k|^2 h (the two massless graviton
//     modes), checked for k along an axis and for an off-axis k.
//   - Linearity (the pipeline is linear in h).

import { suite, check, close } from '@/test/code/harness'
import { linearizedEinsteinTensor } from '@/code/operator/linearized-curvature'

type T3 = number[][]

const zero = (): T3 => [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
]

function maxAbs(t: T3): number {
  let m = 0

  for (const row of t) {
    for (const v of row) m = Math.max(m, Math.abs(v))
  }

  return m
}

suite('operator/linearized-curvature: gauge invariance', [
  check(
    'pure-gauge perturbations h = k xi + xi k are annihilated',
    () => {
      const cases: { k: number[]; xi: number[] }[] = [
        { k: [0, 0, 1.3], xi: [0.7, -0.3, 0.5] },
        { k: [0.4, 0.9, -0.2], xi: [0.7, -0.3, 0.5] },
        { k: [1.1, -0.6, 0.2], xi: [-0.2, 0.8, 0.1] },
      ]

      for (const { k, xi } of cases) {
        const h = zero()

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            h[i]![j] =
              (k[i] ?? 0) * (xi[j] ?? 0) + (k[j] ?? 0) * (xi[i] ?? 0)
          }
        }

        close(
          maxAbs(linearizedEinsteinTensor(h, k)),
          0,
          1e-12,
          `gauge G for k=${String(k)}`,
        )
      }
    },
  ),
])

suite(
  'operator/linearized-curvature: transverse-traceless eigenvalue',
  [
    check('G[h_TT] = (1/2)|k|^2 h_TT for k along z', () => {
      const kz = 1.3
      const k = [0, 0, kz]
      const h: T3 = [
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ]

      const G = linearizedEinsteinTensor(h, k)
      const lambda = 0.5 * kz * kz

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          close(
            G[i]![j] ?? 0,
            lambda * (h[i]![j] ?? 0),
            1e-12,
            `TT(z) [${i}][${j}]`,
          )
        }
      }
    }),
    check('G[h_TT] = (1/2)|k|^2 h_TT for k along x', () => {
      const k = [1, 0, 0]
      const h: T3 = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, -1],
      ]

      const G = linearizedEinsteinTensor(h, k)
      const lambda = 0.5

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          close(
            G[i]![j] ?? 0,
            lambda * (h[i]![j] ?? 0),
            1e-12,
            `TT(x) [${i}][${j}]`,
          )
        }
      }
    }),
    check('the operator is linear in h', () => {
      const k = [0.4, 0.9, -0.2]
      const a: T3 = [
        [1, 0.2, 0],
        [0.2, -1, 0.3],
        [0, 0.3, 0.5],
      ]

      const b: T3 = [
        [0.1, 0, 0.4],
        [0, 0.6, -0.2],
        [0.4, -0.2, -0.7],
      ]

      const sum = zero()

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++)
          sum[i]![j] = 2 * (a[i]![j] ?? 0) - 3 * (b[i]![j] ?? 0)
      }

      const Ga = linearizedEinsteinTensor(a, k)
      const Gb = linearizedEinsteinTensor(b, k)
      const Gsum = linearizedEinsteinTensor(sum, k)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          close(
            Gsum[i]![j] ?? 0,
            2 * (Ga[i]![j] ?? 0) - 3 * (Gb[i]![j] ?? 0),
            1e-12,
            `linearity [${i}][${j}]`,
          )
        }
      }
    }),
  ],
)
