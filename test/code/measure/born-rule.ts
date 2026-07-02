// Conformance for code/measure/born-rule. The model's only input is amplitude = sqrt(count).
// From that, the exponent 2 in P = |a|^p is FORCED by the functional equation
// (a1^2 + a2^2)^(p/2) = a1^p + a2^p, which is an identity only at p = 2 and fails elsewhere.
// Every expected value here is re-derived by hand from the definitions, never from the impl.

import { suite, check, close, equal, ok } from '@/test/code/harness'
// quadrature residual is zero up to one floating sqrt round-trip (sqrt(n)^2 != n exactly in f64).
import {
  patchesFromAmplitudes,
  quadratureAdditivityResidual,
  exponentResidual,
  fairSampleFrequencies,
} from '@/code/measure/born-rule'

const TIGHT = 1e-12

suite('measure/born-rule: patchesFromAmplitudes', [
  check('counts = round(c^2 * scale), total is their sum', () => {
    // c = [1, 2], scale = 10 -> round(1*10)=10, round(4*10)=40, total 50.
    const out = patchesFromAmplitudes([1, 2], 10)
    equal(out.counts[0], 10)
    equal(out.counts[1], 40)
    equal(out.total, 50)
  }),
  check('a tiny amplitude is clamped up to at least one vibe', () => {
    // c = 0 would round to 0; the floor of 1 keeps every patch non-empty.
    const out = patchesFromAmplitudes([0, 0], 10)
    equal(out.counts[0], 1)
    equal(out.counts[1], 1)
    equal(out.total, 2)
  }),
])

suite('measure/born-rule: quadratureAdditivityResidual', [
  check(
    'disjoint counts add, so the quadrature residual is zero (to f64 round-off)',
    () => {
      // sqrt(n1+n2)^2 - (n1 + n2) = 0 analytically; only a single sqrt round-trip separates it from 0.
      close(quadratureAdditivityResidual([1, 2, 3], 100), 0, 1e-9)
      close(quadratureAdditivityResidual([5, 0.3, 7.1, 2], 50), 0, 1e-9)
    },
  ),
])

suite(
  'measure/born-rule: exponentResidual (the exponent is selected, not assumed)',
  [
    check('p = 2 is an exact identity: residual ~ 0', () => {
      // (a1^2 + a2^2)^1 = a1^2 + a2^2 for every pair, so the worst relative gap is ~ 0.
      close(exponentResidual({ p: 2, seed: 3 }), 0, 1e-12)
    }),
    check(
      'p = 1 is NOT an identity: residual stays well away from zero',
      () => {
        // sqrt(a1^2 + a2^2) != a1 + a2 (triangle, strict for positive a), so the gap is sizable.
        ok(
          exponentResidual({ p: 1, seed: 3 }) > 0.1,
          'p=1 must give a large residual',
        )
      },
    ),
    check('p = 3 is NOT an identity either', () => {
      ok(
        exponentResidual({ p: 3, seed: 3 }) > 0.05,
        'p=3 must give a nonzero residual',
      )
    }),
    check(
      'p = 2 residual is far below any neighbouring exponent',
      () => {
        const at2 = exponentResidual({ p: 2, seed: 9 })
        const at1p5 = exponentResidual({ p: 1.5, seed: 9 })
        const at2p5 = exponentResidual({ p: 2.5, seed: 9 })
        ok(
          at2 < at1p5 && at2 < at2p5,
          'p=2 is the unique minimiser of the residual',
        )
      },
    ),
  ],
)

suite(
  'measure/born-rule: fairSampleFrequencies converge to count/total = |c|^2',
  [
    check('equal amplitudes give equal frequencies 1/2', () => {
      // c = [1, 1], scale 100 -> counts [100, 100], so each frequency -> 0.5.
      const f = fairSampleFrequencies({
        amps: [1, 1],
        scale: 100,
        draws: 40000,
        seed: 1,
      })

      close(f[0]!, 0.5, 0.02)
      close(f[1]!, 0.5, 0.02)
    }),
    check(
      'amplitudes [1, 2] give frequencies [1/5, 4/5] (= |c|^2 normalised)',
      () => {
        // counts [100, 400], total 500 -> [0.2, 0.8].
        const f = fairSampleFrequencies({
          amps: [1, 2],
          scale: 100,
          draws: 40000,
          seed: 7,
        })

        close(f[0]!, 0.2, 0.02)
        close(f[1]!, 0.8, 0.02)
        close(f[0]! + f[1]!, 1, TIGHT) // probabilities sum to one
      },
    ),
  ],
)
