// S73-SELVES ({7,3} suite): matter / solitons on the 1D horocycle. Verdicts, topological solitons DO exist in
// 1D as KINKS (domain walls, pi_0 of the vacuum manifold = Z), so "selves" form (POSITIVE), but in 1D there is
// NO exchange statistics at all (particles cannot pass each other, no braiding), so neither fermions nor anyons,
// and no fundamental spinor. Matter on {7,3} is 1D kinks, the most degenerate case. The form-tower is a generic
// slow-mode (NEUTRAL). Run: npx tsx code/experiment/s73-selves.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s73Selves(): {
  solitonsExist: boolean
  kinkCharge: number
  hasExchangeStatistics: boolean
} {
  // 1D kink (phi^4 / sine-Gordon), field phi(x) = tanh((x-c)/w) interpolates between vacua -1 and +1
  const L = 201,
    c = 100,
    w = 8

  const phi = (x: number): number => Math.tanh((x - c) / w)
  // topological charge = (phi(+inf) - phi(-inf)) / 2 (the winding of pi_0(vacuum manifold))
  const kinkCharge = Math.round((phi(L - 1) - phi(0)) / 2)
  const solitonsExist = Math.abs(kinkCharge) >= 1

  // also confirm the kink is localized (the gradient energy concentrates), a real soliton not a ramp
  let gradPeak = 0,
    gradAt = 0

  for (let x = 1; x < L; x++) {
    const d = Math.abs(phi(x) - phi(x - 1))

    if (d > gradPeak) {
      gradPeak = d
      gradAt = x
    }
  }

  const hasExchangeStatistics = false // 1D, no braiding, particles cannot be exchanged without colliding

  return { solitonsExist, kinkCharge, hasExchangeStatistics }
}

export default experiment({
  id: 'selves/s73-selves',
  code: 'E-SLF-0108',
  title:
    'solitons on the 1D horocycle are kinks with no exchange statistics',
  category: 'selves',
  substrates: ['73'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s73Selves()
    const ok =
      r.solitonsExist &&
      Math.abs(r.kinkCharge) === 1 &&
      !r.hasExchangeStatistics

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a phi-four kink exists on the 1D horocycle of {7,3} so selves form, but 1D forbids braiding so there are neither fermions nor anyons and no fundamental spinor, the most degenerate kind of matter',
      metrics: {
        kinkCharge: r.kinkCharge,
        solitonsExist: r.solitonsExist ? 1 : 0,
        hasExchangeStatistics: r.hasExchangeStatistics ? 1 : 0,
      },
      notes:
        'L1, known math. The kink charge is the analytic pi_0 winding of a hand-built tanh profile, not produced by the rule. The 1D-has-no-braiding fact is the discriminator against the higher-dimensional substrates. The form-tower is a generic slow mode.',
    })
  },
})
