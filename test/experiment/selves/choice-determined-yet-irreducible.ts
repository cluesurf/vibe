// A choice is fully determined yet cannot be read off in one step, and the irreducibility is
// caused by the self's own structure.
//
// The deterministic-universe worry is that if the next state is fixed, choice is an illusion.
// The answer modeled here is that "fixed" and "readable in advance" are different things. We
// settle a self (a Hopfield attractor) under an urge (a bias field) and test three things:
//   1. Determined: the same self and urge always settle to the exact same choice (replay-exact).
//   2. Irreducible: a cheap one-step shortcut from the urge alone does NOT match the settled
//      choice, and settling takes several beats, so the outcome must be lived out, not read off.
//   3. Caused by the self: a structureless self (coupling 0) settles in one beat and IS the
//      shortcut, so the irreducibility is produced by the self's structure, not by noise.
// The third point is the control: remove the self and the shortcut becomes exact.
//
// This is an L2 model. It exhibits the compatibilist structure (determined yet irreducible)
// with a Hopfield attractor, it does not claim the self emerges from the five base things.
// Run via the suite: npx tsx test/run.ts

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

// at one size: replay-exact determinism, the shortcut miss rate with a real self, and the
// shortcut miss rate with no self (the control). A trial is one (self, urge) pair.
export function irreducibility(input: { n: number; trials: number }): {
  replayExact: boolean
  meanBeatsWithSelf: number
  shortcutMissWithSelf: number
  shortcutMissNoSelf: number
} {
  const n = input.n
  const init = new Int8Array(n) // a neutral, all-peace start

  // determinism: one self and urge, settled twice, compared site by site
  const selfA = makeSelf({ n, patterns: 2, seed: 1 })
  const urgeA = ternaryVector(n, makeRng({ seed: 2 }))
  const first = settle({
    patterns: selfA,
    coupling: 1,
    urge: urgeA,
    urgeWeight: 1,
    init,
  })
  const second = settle({
    patterns: selfA,
    coupling: 1,
    urge: urgeA,
    urgeWeight: 1,
    init,
  })
  const replayExact = hammingFraction(first.state, second.state) === 0

  let beatSum = 0
  let missWithSelf = 0
  let missNoSelf = 0

  for (let k = 0; k < input.trials; k++) {
    const self = makeSelf({ n, patterns: 2, seed: 100 + k })
    const urge = ternaryVector(n, makeRng({ seed: 5000 + k }))
    const guess = oneStepGuess(urge)

    // with a real self: structure pulls the outcome away from the bare urge
    const withSelf = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init,
    })
    beatSum += withSelf.beats

    if (hammingFraction(withSelf.state, guess) > 0.1) {
      missWithSelf++
    }

    // control: no self structure (coupling 0). The field is the urge alone, so the outcome
    // is exactly the one-step guess and settles in a single beat.
    const noSelf = settle({
      patterns: self,
      coupling: 0,
      urge,
      urgeWeight: 1,
      init,
    })

    if (hammingFraction(noSelf.state, guess) > 0.1) {
      missNoSelf++
    }
  }

  return {
    replayExact,
    meanBeatsWithSelf: beatSum / input.trials,
    shortcutMissWithSelf: missWithSelf / input.trials,
    shortcutMissNoSelf: missNoSelf / input.trials,
  }
}

export default experiment({
  id: 'selves/choice-determined-yet-irreducible',
  title:
    'a choice replays exactly yet resists a one-step shortcut, and the self structure is what makes it irreducible',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // robustness by SIZE, not by seeds: the claim must hold at every size
    const sizes = [60, 90, 120]
    const runs = sizes.map(n => irreducibility({ n, trials: 24 }))

    const replayExact = runs.every(r => r.replayExact)
    const irreducibleWithSelf = runs.every(
      r => r.shortcutMissWithSelf > 0.6 && r.meanBeatsWithSelf > 1.5,
    )
    const shortcutWorksNoSelf = runs.every(
      r => r.shortcutMissNoSelf < 0.02,
    )

    const ok = replayExact && irreducibleWithSelf && shortcutWorksNoSelf

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the same self and urge always settle to the identical choice, yet a cheap shortcut misses it and settling takes several beats, and removing the self makes the shortcut exact',
      metrics: {
        shortcutMissWithSelf: last.shortcutMissWithSelf,
        meanBeatsWithSelf: last.meanBeatsWithSelf,
      },
      control: {
        shortcutMissNoSelf: last.shortcutMissNoSelf,
      },
      notes:
        'L2 phenomenological model. determined and irreducible are shown to be compatible, the self structure causes the irreducibility, this is not a claim of emergence from the base',
    })
  },
})
