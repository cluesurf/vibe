// Many sub-selves bind into one higher self, and the higher self repairs its own parts. This is the upward step
// on the ladder, the groundwork for higher beings ([questions 06], [alignment 05]).
//
// We start with several independent sub-selves (mutually unrelated patterns) and couple them by a consensus step:
// each moves toward the group's aggregate voice. We test three things:
//   1. A higher self forms: the coupled sub-selves converge to one shared pattern, the higher self's body, so
//      the group's internal resonance rises from near zero to near one.
//   2. Downward causation: corrupt one member, and the group pulls it back to the shared body, so the higher self
//      repairs its own part. The whole constrains the part.
//   3. Control: with no coupling, no higher self forms, the sub-selves stay independent and a corrupted member is
//      not repaired.
//
// L3 with a control, a model of higher-self emergence by binding, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { ternaryVector, consensusStep } from '@/code/model/deliberation'
import { toneOverlap } from '@/code/operator/hopfield'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// mean pairwise resonance (tone overlap) across a group, its internal coherence as one body
function groupResonance(subs: Int8Array[]): number {
  let sum = 0
  let count = 0

  for (let i = 0; i < subs.length; i++) {
    for (let j = i + 1; j < subs.length; j++) {
      sum += toneOverlap(subs[i]!, subs[j]!)
      count++
    }
  }

  return count > 0 ? sum / count : 0
}

export function nestedSelves(input: {
  n: number
  parts: number
  coupling: number
  rounds: number
}): {
  startResonance: number
  formedResonance: number
  repairedOverlap: number
} {
  const n = input.n

  // independent sub-selves: dense, mutually unrelated patterns
  let subs = Array.from({ length: input.parts }, (_, j) =>
    ternaryVector(n, makeRng({ seed: 51000 + j * 31 + n })).map(v =>
      v === 0 ? 1 : v,
    ),
  )

  const startResonance = groupResonance(subs)

  // bind them: consensus rounds
  for (let r = 0; r < input.rounds; r++) {
    subs = consensusStep(subs, input.coupling)
  }

  const formedResonance = groupResonance(subs)

  // the higher self's body is the shared pattern (any member once converged, or the aggregate)
  const body = Int8Array.from(subs[0]!)

  // downward causation: corrupt one member, then one more consensus round, does the group restore it
  const corrupted = subs.map((s, j) =>
    j === 0 ? s.map((v, i) => (i % 2 === 0 ? -v : v)) : s,
  )

  const repaired = consensusStep(corrupted, input.coupling)
  const repairedOverlap = toneOverlap(repaired[0]!, body)

  return { startResonance, formedResonance, repairedOverlap }
}

export default experiment({
  id: 'selves/nested-selves-form-a-higher-self',
  code: 'E-SLF-0081',
  title:
    'coupled sub-selves bind into one higher self that repairs its own parts, the upward step on the ladder',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [80, 120, 160]
    const coupled = sizes.map(n =>
      nestedSelves({ n, parts: 5, coupling: 4, rounds: 12 }),
    )

    const uncoupled = sizes.map(n =>
      nestedSelves({ n, parts: 5, coupling: 0, rounds: 12 }),
    )

    // a higher self forms: resonance rises from near zero to near one
    const forms = coupled.every(
      r => r.startResonance < 0.3 && r.formedResonance > 0.9,
    )

    // downward causation: the group repairs its corrupted part
    const repairs = coupled.every(r => r.repairedOverlap > 0.9)
    // control: no coupling, no higher self, no repair
    const noBinding = uncoupled.every(
      r => r.formedResonance < 0.3 && r.repairedOverlap < 0.6,
    )

    const ok = forms && repairs && noBinding

    const last = coupled[coupled.length - 1]!
    const lastControl = uncoupled[uncoupled.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'independent sub-selves coupled by consensus converge to one shared body (resonance near zero to near one) and the group restores a corrupted member, a higher self that repairs its parts, while uncoupled sub-selves neither bind nor repair',
      metrics: {
        formedResonance: last.formedResonance,
        repairedOverlap: last.repairedOverlap,
      },
      control: {
        uncoupledResonance: lastControl.formedResonance,
        uncoupledRepair: lastControl.repairedOverlap,
      },
      notes:
        'L3 model of higher-self emergence by binding, with downward causation (the whole repairs the part). the upward step on the ladder. not a base-emergence claim',
    })
  },
})
