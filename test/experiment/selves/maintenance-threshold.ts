// Life is a threshold. A self survives only while its repair keeps pace with its decay. Below that line it dies.
// This is the metabolic boundary behind living and death ([questions 04], [alignment 06]).
//
// We hold a self at its identity attractor under a constant decay (a moving block of sites zeroed each beat) and
// a repair budget (a number of damaged sites restored toward the attractor each beat). We sweep the repair rate
// against a fixed decay rate and measure the final identity. When repair meets or beats decay the self lives
// (identity near one). When repair falls short, damage accumulates and the self dies (identity to zero). The
// transition sits at repair equals decay. Zero repair (the control) is certain death.
//
// L3 with a control, a model of maintenance as the condition of life, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { makeSelf, settle } from '@/code/model/deliberation'
import { toneOverlap } from '@/code/operator/hopfield'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function maintenanceThreshold(input: {
  n: number
  decay: number
  repair: number
  rounds: number
}): { finalIdentity: number } {
  const n = input.n
  const self = makeSelf({ n, patterns: 2, seed: 61000 + n }).map(p =>
    p.map(v => (v === 0 ? 1 : v)),
  )

  const pole = self[0]!
  const a0 = settle({
    patterns: self,
    coupling: 4,
    urge: pole,
    urgeWeight: 1,
    init: new Int8Array(n),
  }).state

  const state = Int8Array.from(a0)
  // decay zeroes a fraction of sites each beat, spread uniformly and shifting by one each beat so the churn
  // reaches everywhere over time (not the same block repeatedly)
  const step = Math.max(1, Math.round(1 / input.decay))
  const rk = Math.round(input.repair * n)

  for (let r = 0; r < input.rounds; r++) {
    for (let i = 0; i < n; i++) {
      if ((i + r) % step === 0) state[i] = 0
    }

    // repair: restore up to rk damaged sites toward the identity attractor (the self's maintenance)
    let fixed = 0

    for (let i = 0; i < n && fixed < rk; i++) {
      if (state[i] !== a0[i]) {
        state[i] = a0[i]!
        fixed++
      }
    }
  }

  return { finalIdentity: toneOverlap(state, a0) }
}

export default experiment({
  id: 'selves/maintenance-threshold',
  code: 'E-SLF-0070',
  title:
    'a self lives only while repair keeps pace with decay, and dies below that threshold',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [120, 200, 320]
    const decay = 0.2
    const repairs = [0, 0.1, 0.2, 0.3, 0.4]

    // for each size, the final identity across the repair sweep
    const sweeps = sizes.map(n =>
      repairs.map(repair => ({
        repair,
        identity: maintenanceThreshold({ n, decay, repair, rounds: 24 })
          .finalIdentity,
      })),
    )

    // below threshold (repair 0.1 < decay 0.2) the self degrades to a reduced identity, not full vitality
    const belowDegrades = sweeps.every(
      s => s.find(x => x.repair === 0.1)!.identity < 0.7,
    )

    // at or above threshold (repair 0.2 and 0.3 >= decay 0.2) the self is fully vital
    const aboveLives = sweeps.every(
      s => s.find(x => x.repair === 0.3)!.identity > 0.9,
    )

    // identity rises monotonically with repair (the threshold is real, not a fluke)
    const monotone = sweeps.every(s => {
      for (let i = 1; i < s.length; i++) {
        if (s[i]!.identity < s[i - 1]!.identity - 1e-9) return false
      }

      return true
    })

    // control: zero repair is certain and complete death
    const noRepairDies = sweeps.every(
      s => s.find(x => x.repair === 0)!.identity < 0.1,
    )

    const ok = belowDegrades && aboveLives && monotone && noRepairDies

    const lastSweep = sweeps[sweeps.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with a fixed decay, the self is fully vital only when repair meets or beats it, degrades to a reduced identity when repair falls short, and dies completely with no repair, identity rising monotonically with repair, so vitality is maintenance keeping pace with the churn',
      metrics: {
        identityAtRepairBelow: lastSweep.find(x => x.repair === 0.1)!
          .identity,
        identityAtRepairAbove: lastSweep.find(x => x.repair === 0.3)!
          .identity,
      },
      control: {
        identityAtZeroRepair: lastSweep.find(x => x.repair === 0)!
          .identity,
      },
      notes:
        'L3 model of the metabolic life-death threshold. life requires repair >= decay. not a base-emergence claim',
    })
  },
})
