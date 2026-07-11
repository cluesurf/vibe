// The harder a self must deliberate, the more its outcome hides from any cheap predictor.
//
// "Hidden is not the same as open." A determined future can still be unknown to every fast
// in-system predictor. This experiment makes that quantitative: across many (self, urge)
// pairs we record how long the self takes to settle (its deliberation depth) and how badly a
// cheap one-step shortcut misses the settled choice. The claim is that the two rise together,
// shallow choices are predictable, deep choices are not, so the hiding is produced by the
// depth of the deliberation, not by noise.
//
// The control is the structureless self (coupling 0): it always settles in one beat and the
// shortcut is exact, so there is no depth and no hiding. Restoring the self creates both.
//
// L2 model. It exhibits computational irreducibility on the deliberation model (a known idea),
// it does not claim emergence from the base. Run via the suite: npx tsx test/run.ts

import {
  makeSelf,
  settle,
  oneStepGuess,
  hammingFraction,
  ternaryVector,
} from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Pearson correlation of two equal-length series
function correlation(xs: number[], ys: number[]): number {
  const n = xs.length

  if (n === 0) {
    return 0
  }

  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n

  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx
    const dy = ys[i]! - my

    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }

  const denom = Math.sqrt(sxx * syy)

  return denom > 1e-12 ? sxy / denom : 0
}

export function depthHidesOutcome(input: {
  n: number
  trials: number
}): {
  correlation: number
  shallowError: number
  deepError: number
  controlError: number
  controlMaxBeats: number
} {
  const n = input.n
  const init = new Int8Array(n)

  const beats: number[] = []
  const errors: number[] = []
  const shallow: number[] = []
  const deep: number[] = []

  let controlErrorSum = 0
  let controlMaxBeats = 0

  for (let k = 0; k < input.trials; k++) {
    // a richer self (more stored patterns) deliberates to varying depths across urges
    const self = makeSelf({ n, patterns: 3, seed: 200 + k })
    const urge = ternaryVector(n, makeRng({ seed: 7000 + k }))
    const guess = oneStepGuess(urge)

    const r = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init,
    })

    const err = hammingFraction(r.state, guess)

    beats.push(r.beats)
    errors.push(err)

    if (r.beats <= 2) {
      shallow.push(err)
    } else {
      deep.push(err)
    }

    // control: no self structure. One beat, outcome equals the shortcut.
    const c = settle({
      patterns: self,
      coupling: 0,
      urge,
      urgeWeight: 1,
      init,
    })

    controlErrorSum += hammingFraction(c.state, guess)
    controlMaxBeats = Math.max(controlMaxBeats, c.beats)
  }

  const mean = (xs: number[]): number =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0

  return {
    correlation: correlation(beats, errors),
    shallowError: mean(shallow),
    deepError: mean(deep),
    controlError: controlErrorSum / input.trials,
    controlMaxBeats,
  }
}

export default experiment({
  id: 'selves/deliberation-depth-hides-the-outcome',
  code: 'E-SLF-0036',
  title:
    'the deeper a self must deliberate, the more its determined outcome hides from a cheap predictor',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [80, 120]
    const runs = sizes.map(n => depthHidesOutcome({ n, trials: 60 }))

    const positiveLink = runs.every(r => r.correlation > 0.25)
    const deepHidesMore = runs.every(
      r => r.deepError > r.shallowError + 0.03,
    )

    // a structureless self is exactly the shortcut (zero error) and settles at once (the one
    // update plus its confirming beat), so it has neither real depth nor hiding
    const controlIsPredictable = runs.every(
      r => r.controlError < 0.02 && r.controlMaxBeats <= 2,
    )

    const ok = positiveLink && deepHidesMore && controlIsPredictable

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'deliberation depth and shortcut error rise together, deep choices hide from a cheap predictor while shallow ones do not, and a structureless self has neither depth nor hiding',
      metrics: {
        correlation: last.correlation,
        shallowError: last.shallowError,
        deepError: last.deepError,
      },
      control: {
        controlError: last.controlError,
        controlMaxBeats: last.controlMaxBeats,
      },
      notes:
        'L2 model of computational irreducibility on the deliberation engine, not a base-emergence claim',
    })
  },
})
