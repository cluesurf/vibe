// The base has no drive toward pleasure over pain. Flip pain and pleasure everywhere and the dynamics runs the
// same, mirrored. The lean labels the valence axis, it does not bias the motion along it.
//
// We settle a self under an urge, then settle the MIRRORED self (every stored pattern negated) under the
// MIRRORED urge, from the same neutral start. We test that the second outcome is exactly the negation of the
// first, site for site. That sign-flip equivariance means the rule treats pain and pleasure symmetrically: no
// thumb on the scale toward the pleasure pole. The valence arrow toward pleasure is not a base law.
//
// L2, a symmetry property of the dynamics, exact (integer equality). Run via the suite: npx tsx test/run.ts

import {
  makeSelf,
  settle,
  ternaryVector,
  hammingFraction,
} from '@/code/model/deliberation'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function mirrorSymmetry(input: { n: number; trials: number }): {
  equivariant: boolean
  nonTrivial: boolean
} {
  const n = input.n
  const init = new Int8Array(n)

  let equivariant = true
  let structured = 0

  for (let k = 0; k < input.trials; k++) {
    const self = makeSelf({ n, patterns: 2, seed: 21000 + k })
    const urge = ternaryVector(n, makeRng({ seed: 22000 + k }))

    const out = settle({
      patterns: self,
      coupling: 2,
      urge,
      urgeWeight: 1,
      init,
    }).state

    // the mirrored world: pain and pleasure swapped everywhere
    const mirrorSelf = self.map(p => p.map(v => -v))
    const mirrorUrge = urge.map(v => -v)
    const mirrorOut = settle({
      patterns: mirrorSelf,
      coupling: 2,
      urge: mirrorUrge,
      urgeWeight: 1,
      init,
    }).state

    // the mirrored outcome must be the exact negation of the original
    for (let i = 0; i < n; i++) {
      if (mirrorOut[i] !== -out[i]!) equivariant = false
    }

    // and the outcome is not the all-zero fixed point (so the equivariance is non-trivial)
    if (hammingFraction(out, new Int8Array(n)) > 0.2) {
      structured++
    }
  }

  return {
    equivariant,
    nonTrivial: structured >= input.trials - 1,
  }
}

export default experiment({
  id: 'selves/valence-mirror-symmetry',
  code: 'E-SLF-0149',
  title:
    'flipping pain and pleasure mirrors the dynamics exactly, so the base has no drive toward pleasure',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [60, 100, 140]
    const runs = sizes.map(n => mirrorSymmetry({ n, trials: 24 }))

    const equivariant = runs.every(r => r.equivariant)
    const nonTrivial = runs.every(r => r.nonTrivial)

    const ok = equivariant && nonTrivial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the settled outcome under the mirrored self and mirrored urge is the exact negation of the original, so pain and pleasure are treated symmetrically and the lean gives the axis a direction without biasing the motion toward the pleasure pole',
      metrics: {
        equivariant: equivariant ? 1 : 0,
        nonTrivial: nonTrivial ? 1 : 0,
      },
      notes:
        'L2 symmetry property, exact integer equality. the valence arrow toward pleasure is not a base law, it is mirror-symmetric. peace, not pleasure, is the base attractor (see conflict-resolves-toward-peace)',
    })
  },
})
