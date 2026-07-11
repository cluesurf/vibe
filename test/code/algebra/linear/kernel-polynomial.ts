// Conformance for code/algebra/linear/kernel-polynomial: the Chebyshev moment
// machinery of the KPM. Three independent checks. (1) The |x| Chebyshev coefficients
// match the closed form c0 = 2/pi, c_2k = -(4/pi)(-1)^k/(4k^2-1), odd = 0. (2) The
// Jackson kernel's leading weight is exactly 1. (3) The moment recurrence: on a 1x1
// operator H = [y] with unit probe, the n-th moment must equal the Chebyshev
// polynomial T_n(y), which we re-derive as cos(n arccos y). spectralBound on a
// diagonal operator returns the largest lambda^2.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  absoluteValueCoefficients,
  jacksonKernel,
  chebyshevMoments,
  spectralBound,
  HermitianOperator,
} from '@/code/algebra/linear/kernel-polynomial'
import { Cx } from '@/code/algebra/linear/complex-vector'

suite('algebra/linear/kernel-polynomial: |x| coefficients', [
  check(
    'c0 = 2/pi and the even coefficients match the closed form',
    () => {
      const c = absoluteValueCoefficients(6)

      close(c[0]!, 2 / Math.PI, 1e-15, 'c0 = 2/pi')
      // k=1: -(4/pi)(-1)^1/(4-1) = 4/(3 pi)
      close(c[2]!, 4 / (3 * Math.PI), 1e-15, 'c2 = 4/(3 pi)')
      // k=2: -(4/pi)(+1)/(16-1) = -4/(15 pi)
      close(c[4]!, -4 / (15 * Math.PI), 1e-15, 'c4 = -4/(15 pi)')
    },
  ),
  check('all odd coefficients are zero (|x| is even)', () => {
    const c = absoluteValueCoefficients(7)

    equal(c[1], 0, 'c1 = 0')
    equal(c[3], 0, 'c3 = 0')
    equal(c[5], 0, 'c5 = 0')
  }),
])

suite('algebra/linear/kernel-polynomial: Jackson kernel', [
  check('the leading Jackson weight g0 is exactly 1', () => {
    close(jacksonKernel(8)[0]!, 1, 1e-12, 'g0 = 1')
  }),
  check('all Jackson weights lie in [0, 1]', () => {
    for (const g of jacksonKernel(16))
      close(Math.max(0, Math.min(1, g)), g, 1e-12, 'g in [0,1]')
  }),
])

suite('algebra/linear/kernel-polynomial: Chebyshev moment recurrence', [
  check('on H=[y] the moments are T_n(y) = cos(n arccos y)', () => {
    const y = 0.5

    const operator: HermitianOperator = (
      input: Cx,
      output: Cx,
    ): void => {
      output.re[0] = y * input.re[0]!
      output.im[0] = y * input.im[0]!
    }

    const probe: Cx = {
      re: Float64Array.from([1]),
      im: Float64Array.from([0]),
    }

    const count = 6
    const mu = chebyshevMoments({
      operator,
      scale: 1,
      probe,
      count,
      dim: 1,
    })

    for (let n = 0; n < count; n++) {
      const tn = Math.cos(n * Math.acos(y))

      close(mu[n]!, tn, 1e-12, `mu_${n} = T_${n}(0.5)`)
    }
  }),
  check(
    'the scale factor folds H into [-1,1]: moments of H/scale = T_n(h/scale)',
    () => {
      const h = 2
      const scale = 4 // h/scale = 0.5

      const operator: HermitianOperator = (
        input: Cx,
        output: Cx,
      ): void => {
        output.re[0] = h * input.re[0]!
        output.im[0] = h * input.im[0]!
      }

      const probe: Cx = {
        re: Float64Array.from([1]),
        im: Float64Array.from([0]),
      }

      const mu = chebyshevMoments({
        operator,
        scale,
        probe,
        count: 5,
        dim: 1,
      })

      for (let n = 0; n < 5; n++)
        close(mu[n]!, Math.cos(n * Math.acos(0.5)), 1e-12, `mu_${n}`)
    },
  ),
])

suite('algebra/linear/kernel-polynomial: spectral bound', [
  check(
    'spectralBound of diag(-3,1,2) is the largest lambda^2 = 9',
    () => {
      const d = [-3, 1, 2]

      const operator: HermitianOperator = (
        input: Cx,
        output: Cx,
      ): void => {
        for (let i = 0; i < d.length; i++) {
          output.re[i] = d[i]! * input.re[i]!
          output.im[i] = d[i]! * input.im[i]!
        }
      }

      const bound = spectralBound({ operator, dim: d.length })

      close(bound, 9, 1e-6, 'max(lambda^2) = 9')
    },
  ),
])
