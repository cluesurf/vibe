// Conformance for code/dynamics/wang-landau: the free-energy post-processing of a density
// of states, plus the determinism of the WL walk. The DOS estimation itself is stochastic,
// so we re-derive the deterministic free-energy mechanics on a HAND-built result:
//   - manifoldFractionAt = logistic of the manifold/layered log-weight gap, where each
//     log-weight is a logsumexp of logG - beta*meanAction over the relevant heights.
//   - entropyGap = layered minus manifold log-weight at beta = 0.
//   - crossingBeta solves manifoldFractionAt = 1/2, returning null when it is never reached.
// And the WL walk is deterministic under a fixed seed.

import { suite, check, equal, close, exactArray } from '@/test/code/harness'
import {
  wangLandauHeight,
  manifoldFractionAt,
  entropyGap,
  crossingBeta,
  WangLandauResult,
} from '@/code/dynamics/wang-landau'
import { makeRng } from '@/code/tool/rng'

// A hand result on N=4 (sqrt N = 2): heights 1,2 are layered, height 3 is manifold.
// Flat log g, and a manifold action of -1 so higher beta favours the manifold phase.
const wl: WangLandauResult = {
  size: 4,
  heights: [1, 2, 3],
  logG: [0, 0, 0],
  meanAction: [0, 0, -1],
  visited: [true, true, true],
  converged: true,
}

const log2 = Math.log(2)

suite('dynamics/wang-landau: free-energy post-processing', [
  check('manifold fraction at beta=0 is 1/3', () => {
    // manifold log-weight = log g(3) = 0; layered = logsumexp(0,0) = log 2.
    // fraction = 1 / (1 + exp(log2 - 0)) = 1/3.
    close(manifoldFractionAt(wl, 0), 1 / 3, 1e-12, 'beta=0 manifold fraction')
  }),
  check('entropy gap at beta=0 is log 2', () => {
    close(entropyGap(wl), log2, 1e-12, 'layered minus manifold log-weight')
  }),
  check('manifold fraction at beta = log 2 is 1/2', () => {
    // manifold log-weight = beta; equals layered log2 when beta = log2.
    close(manifoldFractionAt(wl, log2), 1 / 2, 1e-12, 'crossing point fraction')
  }),
  check('crossing beta is log 2', () => {
    const star = crossingBeta(wl, 5)
    close(star ?? NaN, log2, 1e-6, 'bisection finds beta* = log 2')
  }),
  check('crossing beta is null when the manifold never reaches half weight', () => {
    const disfavored: WangLandauResult = { ...wl, meanAction: [0, 0, 5] }
    equal(crossingBeta(disfavored, 5), null, 'no crossing -> null')
  }),
])

suite('dynamics/wang-landau: determinism', [
  check('two WL runs with the same seed give identical log g', () => {
    const run = (): WangLandauResult =>
      wangLandauHeight({
        size: 5,
        epsilon: 0.2,
        minHeight: 2,
        maxHeight: 3,
        rng: makeRng({ seed: 31 }),
        maxSteps: 1500,
      })
    const a = run()
    const b = run()
    exactArray(a.heights, b.heights, 'height bins')
    exactArray(a.logG, b.logG, 'log g per height')
    equal(a.converged, b.converged, 'converged flag')
  }),
  check('height bins span [minHeight, maxHeight]', () => {
    const result = wangLandauHeight({
      size: 5,
      epsilon: 0.2,
      minHeight: 2,
      maxHeight: 3,
      rng: makeRng({ seed: 31 }),
      maxSteps: 500,
    })
    exactArray(result.heights, [2, 3], 'heights = [minHeight..maxHeight]')
  }),
])
