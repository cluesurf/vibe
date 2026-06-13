// P13 refinement: cosmological expansion from an expanding geometry.
// Plain transitive percolation gives the arrow of time but not expansion (its
// slices narrow). Here we sprinkle into an expanding 2D de Sitter / FRW universe,
// ds^2 = -dtau^2 + a(tau)^2 dx^2 with a(tau) = e^{H tau}, and show the resulting
// causal order EXPANDS: its intrinsic spatial slices grow with proper time. This
// demonstrates that the causal-set framework faithfully represents an expanding
// universe (the committed eternal-expansion fate as a geometry). Deriving this
// expansion from a pure microscopic growth rule (no imposed metric) remains the
// deepest open cosmological problem. See note/questions/next-version.md (P13).
// Run: npx tsx code/experiment/p13-expansion.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleDeSitter } from '@/code/substrate/sprinkle-desitter'
import { causalSliceWidths } from '@/code/measure/order-stats'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function deSitterExpansion(input: { count: number; hubble: number; seed: number }): {
  earlyWidth: number
  lateWidth: number
  expands: boolean
  dimension: number
} {
  const { poset } = sprinkleDeSitter({
    count: input.count,
    hubble: input.hubble,
    properTime: 4,
    comovingWidth: 1.0,
    rng: makeRng({ seed: input.seed }),
  })
  const widths = causalSliceWidths({ poset })
  // Compare the first third of cosmic time to the last third (avoid the very ends).
  const a = Math.floor(widths.length / 3)
  const mean = (arr: number[]): number => (arr.length ? arr.reduce((p, q) => p + q, 0) / arr.length : 0)
  const earlyWidth = mean(widths.slice(0, a))
  const lateWidth = mean(widths.slice(widths.length - a))
  return {
    earlyWidth,
    lateWidth,
    expands: lateWidth > earlyWidth,
    dimension: myrheimMeyerDimension({ poset }),
  }
}

export default defineExperiment({
  id: 'cosmology/expansion',
  title: 'expanding geometry gives an expanding causal order',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = deSitterExpansion({ count: 500, hubble: 1, seed: 1 })
    const ok = r.expands && r.lateWidth > 1.5 * r.earlyWidth && r.dimension > 0 && r.dimension < 6
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a causal set sprinkled into an expanding de Sitter universe has spatial slices that grow with proper time',
      metrics: { earlyWidth: r.earlyWidth, lateWidth: r.lateWidth, dimension: r.dimension },
      notes:
        'the de Sitter metric is imposed, deriving expansion from a pure microscopic growth rule remains open',
    })
  },
})
