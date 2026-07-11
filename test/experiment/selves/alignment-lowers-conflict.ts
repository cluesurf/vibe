// An aligned self has low internal conflict and a clear, decisive urge. A fragmented self has high conflict and
// is torn. This is the measured form of "coherence feels like peace, conflict feels like being torn."
//
// A self is built from parts (sub-selves). We build it two ways from the same seeds and compare:
//   - aligned: the parts are noisy copies of one shared pattern, so they agree.
//   - fragmented: the parts split into two opposed camps, so they fight.
// We measure internal conflict (mean pairwise opposition among parts) and decisiveness (the strength of their
// aggregate urge). The aligned self has low conflict and high decisiveness, the fragmented self the reverse.
// The fragmented self is the control: the case where conflict is high and the urge is torn.
//
// L1, a measure consistency check. No dynamics is run, the aligned/fragmented contrast is definitional
// (near-copies versus opposed camps are constructed, then the measures read that construction back out), so
// this verifies the conflict/decisiveness measures behave as intended, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { ternaryVector } from '@/code/model/deliberation'
import {
  meanPairwiseConflict,
  decisiveness,
} from '@/code/measure/alignment'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// flip a fraction of a pattern's sites deterministically (a moving offset), a fixed structured perturbation
function noisy(
  base: Int8Array,
  fraction: number,
  offset: number,
): Int8Array {
  const out = Int8Array.from(base)
  const n = base.length
  const flips = Math.round(fraction * n)

  for (let s = 0; s < flips; s++) {
    const i = (offset * 7 + s * 13) % n

    out[i] = -out[i]!
  }

  return out
}

export function alignmentConflict(input: {
  n: number
  parts: number
  trials: number
}): {
  alignedConflict: number
  fragmentedConflict: number
  alignedDecisive: number
  fragmentedDecisive: number
} {
  let ac = 0
  let fc = 0
  let ad = 0
  let fd = 0

  for (let k = 0; k < input.trials; k++) {
    // a dense plus-or-minus-one shared pattern (no rest sites), so agreement and opposition are clean
    const base = ternaryVector(
      input.n,
      makeRng({ seed: 11000 + k }),
    ).map(v => (v === 0 ? 1 : v))

    // aligned: every part is a lightly noisy copy of the one shared pattern
    const aligned = Array.from({ length: input.parts }, (_, j) =>
      noisy(base, 0.03, j + 1),
    )

    // fragmented: parts split into two opposed camps (base versus its mirror)
    const fragmented = Array.from({ length: input.parts }, (_, j) =>
      noisy(j % 2 === 0 ? base : base.map(v => -v), 0.03, j + 1),
    )

    ac += meanPairwiseConflict(aligned)
    fc += meanPairwiseConflict(fragmented)
    ad += decisiveness(aligned)
    fd += decisiveness(fragmented)
  }

  return {
    alignedConflict: ac / input.trials,
    fragmentedConflict: fc / input.trials,
    alignedDecisive: ad / input.trials,
    fragmentedDecisive: fd / input.trials,
  }
}

export default experiment({
  id: 'selves/alignment-lowers-conflict',
  code: 'E-SLF-0003',
  title:
    'an aligned self has low internal conflict and a decisive urge, a fragmented self is in conflict and torn',
  category: 'selves',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const sizes = [80, 120, 160]
    const runs = sizes.map(n =>
      alignmentConflict({ n, parts: 6, trials: 24 }),
    )

    const lowerConflict = runs.every(
      r => r.alignedConflict < 0.1 && r.fragmentedConflict > 0.3,
    )

    const moreDecisive = runs.every(
      r => r.alignedDecisive > 0.6 && r.fragmentedDecisive < 0.35,
    )

    const ok = lowerConflict && moreDecisive

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'aligned parts give low internal conflict and a strong decisive urge, while fragmented parts give high conflict and a weak torn urge, the measured form of coherence as peace and fragmentation as being torn',
      metrics: {
        alignedConflict: last.alignedConflict,
        alignedDecisive: last.alignedDecisive,
      },
      control: {
        fragmentedConflict: last.fragmentedConflict,
        fragmentedDecisive: last.fragmentedDecisive,
      },
      notes:
        'L1, a measure consistency check on the conflict/decisiveness measures. No dynamics is run, the aligned/fragmented contrast is definitional (near-copies versus opposed camps are constructed and read back out), and the measured numbers match the analytic expectation, for flip fraction f=0.03 the aligned conflict is about 2f(1-f)=0.058 and the fragmented conflict about (9(1-2f(1-f))+6*2f(1-f))/15=0.588 for 6 parts in two camps. Internal conflict is opposed-tone density, decisiveness is aggregate-urge strength. Not a base-emergence claim',
    })
  },
})
