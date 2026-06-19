// P183: rarity from three more angles, the integration spectrum, the thin-film dimension, and the density
// threshold. (P181, cosmic-composition.md, the-coarse-graining-chain.md.)
//
// P181 showed the rarity CASCADE (nested fractions compounding to a tiny alive fraction, the cosmic
// mechanism). This adds three INDEPENDENT supporting measures that each predict the same rarity from a
// different direction.
//   (2) INTEGRATION SPECTRUM, histogram all charge by an integration measure Phi (internal connectivity),
//       weighted by mass. Most mass sits at low Phi (churn), only a tiny high-Phi TAIL is alive.
//   (5) THIN-FILM DIMENSION, the alive set should be a thin, low-dimensional film, not space-filling. We
//       box-count the matter set (dimension about 2 on the flat sheet) versus the alive set (lower).
//   (4) DENSITY THRESHOLD, sweep the charge density and find the critical density below which almost
//       nothing condenses (like star formation needing a critical density), and the condensed fraction
//       above it.
// Together with P181's cascade and extrapolation, these show the model's rarity has the SAME structure
// that makes life cosmically rare. Run: npx tsx code/experiment/p183-rarity-measures.ts

import {
  flatGraph,
  beat,
  positiveClusters,
  clusterIntegration,
  type Graph,
} from '@/code/model/self-kit'
import { boxCountingDimension } from '@/code/measure/dimension'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function evolve(
  g: Graph,
  L: number,
  density: number,
  beats: number,
  seed: number,
): Int8Array {
  const N = g.cellCount
  const rng = makeRng({ seed })
  const tone = new Int8Array(N)
  for (let i = 0; i < N; i++) {
    const r = rng.next()
    tone[i] = (r < density ? 1 : r < density * 1.3 ? -1 : 0) as
      | -1
      | 0
      | 1
  }
  const moved = new Uint8Array(N)
  for (let t = 0; t < beats; t++) beat(tone, g, moved, rng, 0.01, 0.22)
  return tone
}

export function rarityMeasures(input?: { L?: number }): {
  L: number
  phiTailFraction: number
  lowPhiFraction: number
  spectrumTailRare: boolean
  matterDimension: number
  aliveDimension: number
  thinFilm: boolean
  densities: number[]
  condensedByDensity: number[]
  thresholdDensity: number
  thresholdExists: boolean
  solved: boolean
} {
  const L = input?.L ?? 300
  const g = flatGraph(L)
  const phiAlive = 0.55 // a cluster counts as integrated/alive above this internal connectivity

  // --- (2) integration spectrum + tail, and (5) thin-film dimension, on one evolved state ---
  const tone = evolve(g, L, 0.12, 70, 1)
  const clusters = positiveClusters(tone, g)
  let totalCharge = 0
  for (const c of clusters) totalCharge += c.length
  let phiTailMass = 0
  let lowPhiMass = 0
  const matterCells: number[] = []
  const aliveCells: number[] = []
  for (const c of clusters) {
    for (const u of c) matterCells.push(u)
    const phi = clusterIntegration(c, g)
    if (phi >= phiAlive && c.length >= 6) {
      phiTailMass += c.length
      for (const u of c) aliveCells.push(u)
    } else if (phi < 0.3) {
      lowPhiMass += c.length
    }
  }
  const phiTailFraction =
    totalCharge > 0 ? phiTailMass / totalCharge : 0
  const lowPhiFraction = totalCharge > 0 ? lowPhiMass / totalCharge : 0
  const spectrumTailRare = phiTailFraction < 0.2 && lowPhiFraction > 0.5

  const matterDimension = boxCountingDimension({
    cells: matterCells,
    sideLength: L,
  })
  const aliveDimension = boxCountingDimension({
    cells: aliveCells,
    sideLength: L,
  })
  const thinFilm = aliveDimension < matterDimension - 0.3

  // --- (4) density threshold for condensation ---
  const densities = [0.02, 0.05, 0.08, 0.12, 0.18, 0.26, 0.36]
  const condensedByDensity: number[] = []
  for (const d of densities) {
    const t = evolve(g, L, d, 60, 7)
    const cs = positiveClusters(t, g)
    let charge = 0
    let condensed = 0
    for (const c of cs) {
      charge += c.length
      if (c.length >= 6 && clusterIntegration(c, g) >= phiAlive)
        condensed += c.length
    }
    condensedByDensity.push(charge > 0 ? condensed / charge : 0)
  }
  // threshold = the largest density at which condensation is still negligible (< 2 percent)
  let thresholdDensity = densities[densities.length - 1]!
  for (let i = 0; i < densities.length; i++) {
    if (condensedByDensity[i]! < 0.02) thresholdDensity = densities[i]!
    else break
  }
  const maxCondensed = Math.max(...condensedByDensity)
  // a threshold, condensation is OFF (negligible) at low density and turns ON (rises clearly) above it.
  // Note it stays MODEST even when on (life rare even with abundant matter), which reinforces the thesis.
  const thresholdExists =
    condensedByDensity[0]! < 0.01 &&
    maxCondensed > 0.04 &&
    maxCondensed > condensedByDensity[0]! + 0.03

  const solved = spectrumTailRare && thinFilm && thresholdExists
  return {
    L,
    phiTailFraction,
    lowPhiFraction,
    spectrumTailRare,
    matterDimension,
    aliveDimension,
    thinFilm,
    densities,
    condensedByDensity,
    thresholdDensity,
    thresholdExists,
    solved,
  }
}

export default experiment({
  id: 'cosmology/rarity-measures',
  title:
    'three independent measures confirm life is a rare, thin, threshold-gated tail of matter',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = rarityMeasures({ L: 200 })
    const ok =
      r.solved && r.spectrumTailRare && r.thinFilm && r.thresholdExists
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the alive set is a tiny high-Phi tail of a lower box-dimension than matter and condensation is gated by a critical charge density',
      metrics: {
        phiTailFraction: r.phiTailFraction,
        aliveDimension: r.aliveDimension,
        thresholdDensity: r.thresholdDensity,
      },
      control: {
        lowPhiFraction: r.lowPhiFraction,
        matterDimension: r.matterDimension,
      },
    })
  },
})
