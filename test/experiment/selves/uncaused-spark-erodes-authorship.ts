// An uncaused spark does not create freedom. It erodes authorship. The deterministic self is the most yours.
//
// People imagine free will as an uncaused spark, a bit of the choice that comes from nothing, not from your
// causes. This experiment shows that is backwards. We settle a self deterministically and measure how much the
// act IS one of the self's own options (its self-coherence, the overlap with its stored attractors). Then we
// inject an exogenous signal, uncorrelated with the self, a stand-in for an uncaused not-by-you input, over a
// rising fraction of the act. We test:
//   1. The deterministic self (no injection) is the MOST self-coherent, the act is most fully its own.
//   2. As the uncaused fraction rises, self-coherence falls monotonically. The more the act comes from nothing-
//      to-do-with-you, the less it is your choice.
// Control: zero injection, the fully determined self, which scores highest.
//
// The lesson: authorship is determinism resolving your own structure. An uncaused spark would replace you with
// noise. Freedom is not indeterminism.
//
// L3 with a control, a model, not a base-emergence claim. Run via the suite: npx tsx test/run.ts

import {
  makeSelf,
  settleWithInjection,
  selfCoherence,
  ternaryVector,
} from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function sparkErodes(input: { n: number; trials: number }): {
  coherenceByFraction: { fraction: number; coherence: number }[]
  monotoneDown: boolean
  deterministicHighest: boolean
  bigDrop: boolean
} {
  const n = input.n
  const init = new Int8Array(n)
  const fractions = [0, 0.15, 0.35, 0.6]

  const coherenceByFraction = fractions.map(fraction => {
    let sum = 0

    for (let k = 0; k < input.trials; k++) {
      // dense plus-or-minus-one attractors (no rest sites), so the self settles cleanly into one of its own
      // options and self-coherence near one means the act is fully its own
      const self = makeSelf({ n, patterns: 2, seed: 2000 + k }).map(p =>
        p.map(v => (v === 0 ? 1 : v)),
      )

      const urge = ternaryVector(n, makeRng({ seed: 6000 + k }))
      // an exogenous dense pattern, uncorrelated with the self: the uncaused, not-by-you input
      const exogenous = ternaryVector(
        n,
        makeRng({ seed: 90000 + k }),
      ).map(v => (v === 0 ? 1 : v))

      const r = settleWithInjection({
        patterns: self,
        coupling: 4,
        urge,
        urgeWeight: 1,
        init,
        inject: exogenous,
        injectSites: Math.round(fraction * n),
      })

      sum += selfCoherence(r.state, self)
    }

    return { fraction, coherence: sum / input.trials }
  })

  let monotoneDown = true

  for (let i = 1; i < coherenceByFraction.length; i++) {
    if (
      coherenceByFraction[i]!.coherence >
      coherenceByFraction[i - 1]!.coherence - 1e-9
    ) {
      monotoneDown = false
    }
  }

  const first = coherenceByFraction[0]!.coherence
  const last =
    coherenceByFraction[coherenceByFraction.length - 1]!.coherence

  // the determined self is clearly coherent (far above the near-zero chance overlap of random dense patterns)
  const deterministicHighest =
    coherenceByFraction.every(c => c.coherence <= first + 1e-9) &&
    first > 0.4

  // a high uncaused fraction erodes authorship by more than a third, judged relative to the determined baseline
  const bigDrop = last < first * 0.62

  return {
    coherenceByFraction,
    monotoneDown,
    deterministicHighest,
    bigDrop,
  }
}

export default experiment({
  id: 'selves/uncaused-spark-erodes-authorship',
  code: 'E-SLF-0145',
  title:
    'an uncaused spark lowers self-coherence, so the deterministic self is the most self-authored',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [80, 120]
    const runs = sizes.map(n => sparkErodes({ n, trials: 24 }))

    const monotone = runs.every(r => r.monotoneDown)
    const determinismWins = runs.every(r => r.deterministicHighest)
    const drop = runs.every(r => r.bigDrop)

    const ok = monotone && determinismWins && drop

    const last = runs[runs.length - 1]!
    const f0 = last.coherenceByFraction[0]!.coherence
    const fHigh =
      last.coherenceByFraction[last.coherenceByFraction.length - 1]!
        .coherence

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'self-coherence is highest with no uncaused injection and falls monotonically as the uncaused fraction rises, so an uncaused spark erodes authorship rather than creating freedom',
      metrics: {
        coherenceDeterministic: f0,
        coherenceHighInjection: fHigh,
        drop: f0 - fHigh,
      },
      control: {
        coherenceDeterministic: f0,
      },
      notes:
        'L3 model. freedom is not indeterminism. an uncaused spark replaces the self with noise. the determined self resolving its own structure is the most authored. not a base-emergence claim',
    })
  },
})
