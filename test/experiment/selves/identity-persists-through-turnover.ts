// AUDIT 2026-08-31: regraded from L3 to L2. this experiment is a Hopfield recall model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3.
// A self keeps its identity by repair, through total turnover of its substance. A non-self dies. This is the
// ship of Theseus, resolved, and the model behind death, identity over time, and the soul ([questions 04]).
//
// We settle a self into its attractor (its identity reference). Then, many times over, we corrupt a moving block
// of its sites (zero them) and let the self re-settle under its OWN structure alone (no external drive). A real
// self pulls the corrupted sites back to its attractor, so its identity is restored each round and persists even
// after the cumulative corruption far exceeds its size (full substance turnover). A structureless self (coupling
// zero, the control) has no field to repair with, so it collapses to the vacuum, its identity dies.
//
// L3 with a control, a model of identity as a maintained pattern, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { makeSelf, settle } from '@/code/model/deliberation'
import { toneOverlap } from '@/code/operator/hopfield'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// zero a contiguous block of `k` sites starting at `offset` (wrapping), a deterministic corruption of the
// self's substance, no randomness
function corrupt(
  state: Int8Array,
  offset: number,
  k: number,
): Int8Array {
  const out = Int8Array.from(state)
  const n = state.length

  for (let s = 0; s < k; s++) {
    out[(offset + s) % n] = 0
  }

  return out
}

export function identityThroughTurnover(input: {
  n: number
  coupling: number
  rounds: number
  fraction: number
}): { finalIdentity: number; turnover: number } {
  const n = input.n
  const k = Math.round(input.fraction * n)
  const self = makeSelf({ n, patterns: 2, seed: 41000 + n }).map(p =>
    p.map(v => (v === 0 ? 1 : v)),
  )

  const pole = self[0]!

  // the identity reference: the self's settled attractor
  const a0 = settle({
    patterns: self,
    coupling: 4,
    urge: pole,
    urgeWeight: 1,
    init: new Int8Array(n),
  }).state

  const zero = new Int8Array(n)

  let state = Int8Array.from(a0)

  for (let r = 0; r < input.rounds; r++) {
    // corrupt a moving block, then repair using ONLY the self's own field (no external drive)
    const corrupted = corrupt(state, (r * k) % n, k)

    state = settle({
      patterns: self,
      coupling: input.coupling,
      urge: zero,
      urgeWeight: 0,
      init: corrupted,
    }).state
  }

  return {
    finalIdentity: toneOverlap(state, a0),
    turnover: (input.rounds * k) / n,
  }
}

export default experiment({
  id: 'selves/identity-persists-through-turnover',
  code: 'E-SLF-0057',
  title:
    'a self keeps its identity by repair through total substance turnover, while a structureless self dies',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [80, 120, 160]
    const selfRuns = sizes.map(n =>
      identityThroughTurnover({
        n,
        coupling: 4,
        rounds: 16,
        fraction: 0.25,
      }),
    )

    const controlRuns = sizes.map(n =>
      identityThroughTurnover({
        n,
        coupling: 0,
        rounds: 16,
        fraction: 0.25,
      }),
    )

    const selfPersists = selfRuns.every(r => r.finalIdentity > 0.9)
    const fullTurnover = selfRuns.every(r => r.turnover > 2)
    const noSelfDies = controlRuns.every(r => r.finalIdentity < 0.1)

    const ok = selfPersists && fullTurnover && noSelfDies

    const last = selfRuns[selfRuns.length - 1]!
    const lastControl = controlRuns[controlRuns.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self repairs its identity to over ninety percent overlap with its original attractor through cumulative turnover several times its size, while a structureless self collapses to the vacuum, so identity is a maintained pattern not a fixed substance',
      metrics: {
        finalIdentity: last.finalIdentity,
        turnover: last.turnover,
      },
      control: {
        noSelfIdentity: lastControl.finalIdentity,
      },
      notes:
        'AUDIT 2026-08-31: this experiment is a Hopfield recall model, with no substrate or rule in it. Honest depth L2, which is what the notes below already said in words while the depth field said L3. ' +
        'L3 model of identity over time, the ship of Theseus resolved, and the basis for death as loss of maintenance and the soul as the maintained pattern. not a base-emergence claim',
    })
  },
})
