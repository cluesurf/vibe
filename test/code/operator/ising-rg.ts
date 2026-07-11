// Conformance for code/operator/ising-rg: the exact 1D Ising real-space RG. Facts:
//   - the direct-summation decimation equals the closed form K' = (1/2) ln cosh(2K).
//   - the beta function vanishes at the Gaussian fixed point K = 0 and is negative for
//     K > 0 (the coupling flows toward disorder).
//   - nearestNeighborCorrelation matches a hand-computed value.
//   - the Monte-Carlo block-spin coupling obeys tanh K' = tanh^2 K (loose, sampled).
//   - a sampled chain's correlation approaches tanh K (loose, sampled).

import { suite, check, close, ok } from '@/test/code/harness'
import {
  isingDecimationBySummation,
  isingDecimationFormula,
  isingBetaFunction,
  sampleIsingChain,
  nearestNeighborCorrelation,
  measuredBlockSpinCoupling,
} from '@/code/operator/ising-rg'
import { makeRng } from '@/code/tool/rng'

suite('operator/ising-rg: exact decimation', [
  check(
    'direct summation equals the closed form (1/2) ln cosh(2K)',
    () => {
      for (const k of [0, 0.1, 0.3, 0.5, 1.0, 1.7]) {
        close(
          isingDecimationBySummation(k),
          isingDecimationFormula(k),
          1e-12,
          `decimation at K=${k}`,
        )

        close(
          isingDecimationFormula(k),
          0.5 * Math.log(Math.cosh(2 * k)),
          1e-12,
          `formula at K=${k}`,
        )
      }
    },
  ),
  check('the formula vanishes at K = 0', () => {
    close(
      isingDecimationFormula(0),
      0,
      1e-12,
      'K=0 is a fixed point of decimation',
    )
  }),
])

suite('operator/ising-rg: beta function', [
  check('zero at K = 0, negative for K > 0', () => {
    close(isingBetaFunction(0), 0, 1e-12, 'Gaussian fixed point')

    for (const k of [0.2, 0.5, 1.0, 2.0])
      ok(isingBetaFunction(k) < 0, `coupling decreases at K=${k}`)
  }),
])

suite('operator/ising-rg: correlation', [
  check('nearestNeighborCorrelation matches a hand value', () => {
    // [1,1,-1,-1]: products 1*1, 1*-1, -1*-1 = 1,-1,1 -> sum 1 over 3 bonds.
    close(
      nearestNeighborCorrelation(Int8Array.from([1, 1, -1, -1])),
      1 / 3,
      1e-12,
      'hand-computed',
    )

    close(
      nearestNeighborCorrelation(Int8Array.from([1, 1, 1, 1])),
      1,
      1e-12,
      'fully aligned',
    )
  }),
  check('a sampled chain correlation approaches tanh K', () => {
    const k = 0.6
    const rng = makeRng({ seed: 2 })

    let acc = 0

    const trials = 200

    for (let i = 0; i < trials; i++)
      acc += nearestNeighborCorrelation(sampleIsingChain(400, k, rng))

    close(
      acc / trials,
      Math.tanh(k),
      0.03,
      'mean correlation near tanh K (Monte Carlo)',
    )
  }),
])

suite('operator/ising-rg: block-spin recursion', [
  check(
    "the measured block-spin coupling obeys tanh K' = tanh^2 K",
    () => {
      const k = 0.5
      const measured = measuredBlockSpinCoupling({
        length: 400,
        coupling: k,
        samples: 400,
        seed: 9,
      })

      const expected = Math.atanh(Math.tanh(k) ** 2)

      close(
        measured,
        expected,
        0.03,
        'keep-every-other coupling matches the exact recursion (Monte Carlo)',
      )
    },
  ),
])
