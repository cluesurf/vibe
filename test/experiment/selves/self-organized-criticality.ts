// P135: self-organized criticality. (self-organized-criticality.md, conditions-for-automatic-intelligence.md.)
//
// The minimal feedback for automatic maximal intelligence: DEMAND-DRIVEN creation, the arrow fires where
// it is quiet and is suppressed where it is busy (c_local = c0 * (1 - local activity)). This is the
// homeostatic loop. We test the two SOC fingerprints:
//   (a) SELF-TUNING, from very different starting densities the activity converges to the SAME interior
//       level (the system finds its own set-point, no external tuning),
//   (b) SCALE-FREE AVALANCHES, perturbing the self-organized state produces damage of all sizes (a
//       heavy-tailed distribution), versus a uniform-creation control whose response is not scale-free.
// Run: npx tsx code/experiment/p135-self-organized-criticality.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { socEdgeSweep } from '@/code/dynamics/soc-sweep'
import {
  avalancheSizes,
  toneDensity as density,
} from '@/code/measure/avalanche'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function selfOrganizedCriticality(input?: { n?: number }): {
  n: number
  lowFinal: number
  highFinal: number
  setPoint: number
  selfTunes: boolean
  avalancheMedian: number
  avalancheMax: number
  avalancheScaleSpan: number
  controlScaleSpan: number
  scaleFree: boolean
  solved: boolean
} {
  const n = input?.n ?? 15000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const c0 = 0.02 // SLOW drive (timescale separation), so the system hovers near the absorbing edge

  // (a) self-tuning: run from low and high initial density, both should converge to the same set-point
  const runTo = (
    initRho: number,
    seed: number,
  ): { tone: Int8Array; finalRho: number } => {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed })

    for (let i = 0; i < N; i++) {
      tone[i] = rng.next() < initRho ? (rng.next() < 0.5 ? 1 : -1) : 0
    }

    let last = 0

    for (let t = 0; t < 160; t++) {
      socEdgeSweep({
        tone,
        offsets: g.offsets,
        adj: g.adj,
        eu,
        ev,
        moved,
        rng,
        arrow: c0,
        uniform: false,
      })

      if (t >= 150) {
        last += density(tone) / 10
      }
    }

    return { tone, finalRho: last }
  }

  const low = runTo(0.05, 11)
  const high = runTo(0.7, 22)
  const lowFinal = low.finalRho
  const highFinal = high.finalRho
  const setPoint = (lowFinal + highFinal) / 2
  const selfTunes =
    Math.abs(lowFinal - highFinal) < 0.05 &&
    setPoint > 0.03 &&
    setPoint < 0.9

  // (b) avalanches via damage spreading at the self-organized state, and a uniform-creation control
  const avalancheRun = (uniform: boolean): number[] => {
    const base = new Int8Array(N)
    const rng0 = makeRng({ seed: 5 })

    for (let i = 0; i < N; i++) {
      base[i] = rng0.next() < 0.1 ? (rng0.next() < 0.5 ? 1 : -1) : 0
    }

    for (let t = 0; t < 120; t++) {
      socEdgeSweep({
        tone: base,
        offsets: g.offsets,
        adj: g.adj,
        eu,
        ev,
        moved,
        rng: rng0,
        arrow: c0,
        uniform,
      })
    } // settle

    // relax with creation OFF, so we measure the PURE perturbation cascade (the avalanche) through the
    // self-organized background, not creation noise
    return avalancheSizes({
      base,
      steps: 22,
      trials: 120,
      perturbSeed: 9000,
      streamSeed: 333,
      makeRng: seed => makeRng({ seed }),
      relax: (state, rng) =>
        socEdgeSweep({
          tone: state,
          offsets: g.offsets,
          adj: g.adj,
          eu,
          ev,
          moved,
          rng,
          arrow: 0,
          uniform,
        }),
      mode: 'final',
    })
  }

  const soc = avalancheRun(false)
  const ctrl = avalancheRun(true)
  const median = (a: number[]): number => a[Math.floor(a.length / 2)]!
  const avalancheMedian = median(soc)
  const avalancheMax = soc[soc.length - 1]!
  const avalancheScaleSpan = avalancheMax / Math.max(avalancheMedian, 1)
  const controlScaleSpan =
    ctrl[ctrl.length - 1]! / Math.max(median(ctrl), 1)

  // NOTE: the damage spreads BALLISTICALLY (the lightcone, P123), so a fixed-window perturbation reaches a
  // roughly fixed radius, the size span is narrow (not scale-free). This metric measures ballistic spread,
  // not terminating avalanches, so it does NOT resolve criticality, that needs a terminating-cascade
  // protocol the continuous hop dynamics resists. Criticality is therefore UNDETERMINED here.
  const scaleFree =
    avalancheScaleSpan > 5 &&
    avalancheScaleSpan > controlScaleSpan * 1.5

  // the ROBUST, demonstrated result is SELF-ORGANIZATION (homeostasis to a set-point with no external
  // tuning). Whether that set-point is precisely critical is left open by the ballistic confound.
  const solved = selfTunes

  return {
    n: N,
    lowFinal,
    highFinal,
    setPoint,
    selfTunes,
    avalancheMedian,
    avalancheMax,
    avalancheScaleSpan,
    controlScaleSpan,
    scaleFree,
    solved,
  }
}

export default experiment({
  id: 'selves/self-organized-criticality',
  code: 'E-SLF-0117',
  title:
    'demand-driven creation self-tunes the activity to one interior set-point from any start',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: false,
  run() {
    const r = selfOrganizedCriticality({ n: 3000 })
    const ok = r.solved && r.selfTunes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'demand-driven creation makes the activity self-tune to the same interior set-point from any starting density with no external knob',
      metrics: {
        lowFinal: r.lowFinal,
        highFinal: r.highFinal,
        setPoint: r.setPoint,
      },
      notes:
        'whether the set-point is precisely critical is left open, the damage-spreading metric is confounded by ballistic propagation',
    })
  },
})
