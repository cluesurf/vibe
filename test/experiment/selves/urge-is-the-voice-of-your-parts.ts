// An urge is not injected from outside. It is the voice of your parts. And the self, not the urge, resolves it.
//
// The worry: my choice comes from an urge, the urge comes from chemistry or signals from elsewhere, so what am I
// choosing. This experiment grounds the urge and shows where the choosing actually is. The urge a self feels is
// the coarse aggregate of its sub-selves (its drives, its body's lower layers). We test:
//   1. Parts are causal: flip one sub-self and the resulting choice changes. The parts really are the source.
//   2. A muted part does nothing (control): adding a silent sub-self changes neither the urge nor the choice, so
//      it is the ACTIVE parts that form the urge, not the harness.
//   3. The self still authors: the same parts (the same urge) given to a different upper self yield a different
//      choice. So the urge does not dictate the act. The self's own structure resolves it. That resolving is the
//      choosing, and it bears the self's signature.
//
// L3 with a control, a model of where urges come from and where the choosing is, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import {
  makeSelf,
  settle,
  aggregateUrge,
  hammingFraction,
  ternaryVector,
} from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function voiceOfParts(input: {
  n: number
  parts: number
  trials: number
}): {
  partsCausal: number
  mutedNoEffect: number
  selfAuthors: number
} {
  const n = input.n
  const init = new Int8Array(n)

  let partsCausal = 0
  let mutedDiffered = 0
  let selfAuthored = 0

  for (let k = 0; k < input.trials; k++) {
    const parts = Array.from({ length: input.parts }, (_, j) =>
      ternaryVector(n, makeRng({ seed: 1000 + k * 17 + j })),
    )
    const self = makeSelf({ n, patterns: 2, seed: 4000 + k })

    const urge = aggregateUrge(parts)
    const base = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init,
    }).state

    // 1. flip one part, re-aggregate, re-settle, did the choice change
    const flipped = parts.map((p, j) => (j === 0 ? p.map(v => -v) : p))
    const flippedUrge = aggregateUrge(flipped)
    const flippedChoice = settle({
      patterns: self,
      coupling: 2,
      urge: flippedUrge,
      urgeWeight: 1,
      init,
    }).state

    if (hammingFraction(base, flippedChoice) > 0.1) {
      partsCausal++
    }

    // 2. add a muted (all-zero) part, the urge and choice should be unchanged (control)
    const muted = [...parts, new Int8Array(n)]
    const mutedUrge = aggregateUrge(muted)
    const mutedChoice = settle({
      patterns: self,
      coupling: 2,
      urge: mutedUrge,
      urgeWeight: 1,
      init,
    }).state

    if (hammingFraction(base, mutedChoice) > 0.1) {
      mutedDiffered++
    }

    // 3. same urge, a different upper self, does the choice differ (the self resolves, not the urge)
    const otherSelf = makeSelf({ n, patterns: 2, seed: 7000 + k })
    const otherChoice = settle({
      patterns: otherSelf,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init,
    }).state

    if (hammingFraction(base, otherChoice) > 0.1) {
      selfAuthored++
    }
  }

  return {
    partsCausal: partsCausal / input.trials,
    mutedNoEffect: 1 - mutedDiffered / input.trials,
    selfAuthors: selfAuthored / input.trials,
  }
}

export default experiment({
  id: 'selves/urge-is-the-voice-of-your-parts',
  title:
    'the urge is the aggregate of a self parts, the parts are real causes, and the self not the urge resolves the choice',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [60, 90, 120]
    const runs = sizes.map(n => voiceOfParts({ n, parts: 5, trials: 30 }))

    const partsAreCausal = runs.every(r => r.partsCausal > 0.6)
    const mutedSilent = runs.every(r => r.mutedNoEffect > 0.98)
    const selfResolves = runs.every(r => r.selfAuthors > 0.6)

    const ok = partsAreCausal && mutedSilent && selfResolves

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the urge is the coarse aggregate of the self parts, flipping a part changes the choice, a muted part changes nothing, and the same urge given a different self gives a different choice, so the self does the resolving',
      metrics: {
        partsCausal: last.partsCausal,
        selfAuthors: last.selfAuthors,
      },
      control: {
        mutedNoEffect: last.mutedNoEffect,
      },
      notes:
        'L3 model. urges come from your parts, the parts are causes, and the choosing is the self resolving them, not an inner picker. not a base-emergence claim',
    })
  },
})
