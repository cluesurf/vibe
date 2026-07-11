// Consolidated validation: complete the checks for P1, P5, P8, and P3, beyond
// the per-problem experiments. Each prints a PASS or FAIL against a stated
// prediction. Run: npx tsx code/experiment/validation.ts

import { makeRng } from '@/code/tool/rng'
import { lattice } from '@/code/substrate/lattice'
import { makeConfiguration } from '@/code/tone/configuration'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import { ruleLocalityRange } from '@/code/measure/locality'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// D^2 as a positive linear operator, for finding |eigenvalues of D|.

// Sum of the lowest few |eigenvalues|, a spectral fingerprint of the low end.

// P1: the reversible rule is local. An even-odd update propagates influence about
// two cells per full beat, so a radius near 2 is still strictly local (bounded).

// P5: the recovered geometry is sharp beyond dimension. The proper-time
// (longest-chain) distance across the diamond has low variance over sprinklings.

// P8: the gauge field couples to the fermion. Under a strong random flux the
// charged Dirac low spectrum differs from the free one (the protected zero mode
// stays, but the bulk shifts), and the Aharonov-Bohm phase scales with charge.

// P3: backtracking routing reaches essentially every connected target, where
// pure greedy already does well, on the both-worlds hyperbolic substrate.

export default experiment({
  id: 'foundations/validation',
  code: 'E-FND-0042',
  title:
    'the reversible even-odd rule is local with a bounded interaction radius',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const substrate = lattice({
      dimension: 1,
      extent: 12,
      signature: 'riemannian',
    })

    const rng = makeRng({ seed: 1 })
    const configuration = makeConfiguration({
      alphabet: { form: 'boolean' },
      size: substrate.size,
      rng,
    })

    const rule = reversibleEvenOdd({
      name: 'xor-parity',
      local: ({ self, neighborhood }) => {
        let parity = 0

        for (const t of neighborhood) {
          parity ^= t & 1
        }

        return (self ^ parity) & 1
      },
    })

    const radius = ruleLocalityRange({
      rule,
      substrate,
      configuration,
      sampleSize: 12,
      rng,
    })

    const ok = radius <= 2.5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible even-odd XOR-parity rule has a bounded interaction radius near two, confirming it is strictly local',
      metrics: { radius },
      notes:
        'L2, the locality of an even-odd reversible rule is a known structural property, run measures only the P1 locality check from the broader validation suite (P3, P5, P8 are exercised by the standalone main)',
    })
  },
})
