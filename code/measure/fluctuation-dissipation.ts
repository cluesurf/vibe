// Fluctuation and dissipation of the husk's block energy on the adopted knit (E-FND-0156), and the coarse end state
// (E-FND-0155), on the second-law box of code/measure/second-law-husk.
//
// THE STATIC RELATION. In a canonical state at inverse temperature beta, a block's energy fluctuates with variance
// Var(E_b) = - dE_b / dbeta (the heat capacity times T^2). The knit conserves the total energy exactly, so the blocks
// are microcanonical as a whole: for B equal blocks the variance each shows is (1 - 1/B) of the canonical one. So the
// noise side is (B / (B - 1)) Var(E_b), read from one run, and the dissipation side is - dE_b / dbeta, read from two
// runs at two total energies, with beta from the husk's slot thermometer (b_slot + ln 9, E-FND-0148). They measure the
// same number only if one temperature governs both.
//
// THE DYNAMIC RELATION (Onsager regression). The mean relaxation of a small added excess in one block, normalized to
// its start, equals the block energy's equilibrium autocorrelation, normalized to its variance. The response is read
// from twins: the same state with and without the excess, run by the same rule, whose block-0 energies differ by the
// response exactly.
//
// THE FLOOR. Near equal filling the coarse deficit ln B - H is (B / 2) sum_b (dp_b)^2, so its equilibrium mean is
// (B - 1) F / (2 E), with F = Var(E_b) / mean(E_b) the block Fano factor and E the total energy: the end state of a
// fixed box is the maximum coarse entropy less this fluctuation term, both read independently.
//
// Reals appear only in readers. The rule and the added excess are integers, placed by Weyl sequences.

import type { Reduced } from '@/code/measure/living-pair-kernel'
import { cloneReduced } from '@/code/measure/living-pair-kernel'
import type { ArrowBox } from '@/code/measure/second-law-husk'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const frac = (x: number): number => x - Math.floor(x)

// a copy of s with `count` extra vibes on calm slots of the docks of one husk block, alternately love and fear in the
// order of a Weyl ranking of phase `phase`, each with a Weyl role point: a small excess of energy in that block with
// charge 0 or 1
export function addExcess(input: { box: ArrowBox; state: Reduced; block: number; count: number; phase: number; points?: number }): Reduced {
  const { box, state, block, count, phase } = input
  const points = input.points ?? 9
  const out = cloneReduced(state)
  const calm: { slot: number; u: number }[] = []

  for (let x = 0; x < box.cells; x++) {
    if (box.block[x] !== block) continue

    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      if (out.vibe[slot] === 0) calm.push({ slot, u: frac((slot + 1) * GOLDEN + phase * SILVER) })
    }
  }

  calm.sort((p, q) => p.u - q.u || p.slot - q.slot)

  for (let r = 0; r < count && r < calm.length; r++) {
    const slot = (calm[r] as { slot: number }).slot

    out.vibe[slot] = r % 2 === 0 ? 1 : -1
    out.point[slot] = Math.floor(points * frac((slot + 1) * SILVER + phase * GOLDEN))
  }

  return out
}

// the normalized autocorrelation of a set of equally long series (one per block), pooled over blocks and time origins,
// for lags 0 .. maxLag
export function autocorrelation(series: Float64Array[], maxLag: number): number[] {
  const out: number[] = []
  let mean = 0
  let n = 0

  for (const s of series) {
    for (const v of s) {
      mean += v
      n++
    }
  }

  mean /= n

  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0
    let count = 0

    for (const s of series) {
      for (let t = 0; t + lag < s.length; t++) {
        sum += ((s[t] as number) - mean) * ((s[t + lag] as number) - mean)
        count++
      }
    }

    out.push(sum / count)
  }

  const c0 = out[0] as number

  return out.map(c => c / c0)
}

export function variance(values: number[]): { mean: number; variance: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length

  return { mean, variance }
}
