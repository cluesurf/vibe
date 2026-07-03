// Conformance for code/dynamics/renormalization-group: one-loop RG running and unification (closed forms).
// Invariants:
//   - oneLoopInverseCoupling is linear in t.
//   - couplingMeetingTime is the exact t where the two inverse couplings are equal (self-consistency).
//   - oneLoopStrongCoupling returns the reference coupling at the reference scale (ln = 0).
//   - qcdRunningMassFactor = 1 when the anomalous dimension is 0, and > 1 for a coloured quark run down.
//   - predictWeinbergAngle gives the bare 3/8 when b1 = b2 and the hypercharge norm is 3/5.
//   - protonLifetimeYears scales as M_X^4.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  oneLoopInverseCoupling,
  couplingMeetingTime,
  oneLoopStrongCoupling,
  qcdRunningMassFactor,
  predictWeinbergAngle,
  protonLifetimeYears,
} from '@/code/dynamics/renormalization-group'

suite('dynamics/renormalization-group: linear running and meeting', [
  check('oneLoopInverseCoupling is linear in t', () => {
    const a = oneLoopInverseCoupling({
      inverseAtZero: 50,
      beta: 4,
      t: 0,
    })

    const b = oneLoopInverseCoupling({
      inverseAtZero: 50,
      beta: 4,
      t: 2,
    })

    const c = oneLoopInverseCoupling({
      inverseAtZero: 50,
      beta: 4,
      t: 4,
    })

    close(a, 50, 1e-12, 'value at t=0')
    close(b - a, c - b, 1e-12, 'constant slope')
  }),
  check(
    'couplingMeetingTime is where the two inverse couplings coincide',
    () => {
      const args = {
        inverseAtZeroFirst: 60,
        inverseAtZeroSecond: 40,
        betaFirst: -2,
        betaSecond: 6,
      }

      const t = couplingMeetingTime(args)
      const c1 = oneLoopInverseCoupling({
        inverseAtZero: args.inverseAtZeroFirst,
        beta: args.betaFirst,
        t,
      })

      const c2 = oneLoopInverseCoupling({
        inverseAtZero: args.inverseAtZeroSecond,
        beta: args.betaSecond,
        t,
      })

      close(c1, c2, 1e-9, 'inverse couplings equal at the meeting time')
    },
  ),
])

suite(
  'dynamics/renormalization-group: strong coupling and mass running',
  [
    check(
      'oneLoopStrongCoupling returns the reference value at the reference scale',
      () => {
        const alpha = oneLoopStrongCoupling({
          couplingAtReference: 0.118,
          beta3: -7,
          scale: 91.19,
          referenceScale: 91.19,
        })

        close(alpha, 0.118, 1e-12, 'alpha_s(mu_0) = reference')
      },
    ),
    check(
      'qcdRunningMassFactor is 1 for zero anomalous dimension and > 1 for a coloured quark',
      () => {
        const common = {
          couplingAtReference: 0.118,
          beta3: -7,
          referenceScale: 2,
          highScale: 1000,
        }

        close(
          qcdRunningMassFactor({ ...common, anomalousDimension: 0 }),
          1,
          1e-12,
          'no enhancement',
        )
        ok(
          qcdRunningMassFactor({ ...common }) > 1,
          'colour enhances the running mass',
        )
      },
    ),
  ],
)

suite('dynamics/renormalization-group: predictions', [
  check(
    'the bare weak mixing angle is 3/8 when b1 = b2 and h = 3/5',
    () => {
      const sin2 = predictWeinbergAngle({
        alphaEmInverse: 128,
        alphaStrongInverse: 8.5,
        beta: [5, 5, -7],
        hyperchargeNorm: 3 / 5,
      })

      close(sin2, 3 / 8, 1e-12, 'sin^2 = 3/8 (b1 = b2)')
    },
  ),
  check('the proton lifetime scales as M_X^4', () => {
    const a = protonLifetimeYears({
      gutScaleGeV: 1e16,
      unifiedInverseCoupling: 25,
    })

    const b = protonLifetimeYears({
      gutScaleGeV: 2e16,
      unifiedInverseCoupling: 25,
    })

    ok(a > 0, 'positive lifetime')
    close(b / a, 16, 1e-6, 'doubling M_X multiplies the lifetime by 16')
  }),
])
