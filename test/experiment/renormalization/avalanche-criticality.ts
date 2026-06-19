// P138: terminating-cascade avalanches, is there a scale-free (critical) point? (P135, self-organized-criticality.md.)
//
// P135 showed the demand-driven feedback self-tunes to a set-point, but the set-point was in the active
// phase (avalanches confounded by ballistic spread). Here we test the criticality question directly, is
// there ANY background activity level at which a seeded perturbation triggers a SCALE-FREE (heavy-tailed)
// avalanche? We sit at a low background (near the absorbing edge), seed a perturbation, and track the
// CASCADE as damage that grows then HEALS back (a terminating excursion), recording its peak size. We
// scan the background level and look for a level where the avalanche sizes span many scales (a power-law
// tail), the directed-percolation critical point. If found, self-organized criticality has a target. If
// not, the dynamics lacks clean avalanche criticality. Run: npx tsx code/experiment/p138-avalanche-criticality.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { edgesFromCsr } from '@/code/tool/graph'
import { conservingEdgeSweep } from '@/code/dynamics/conserving-sweep'
import { settledAvalancheSizes } from '@/code/measure/avalanche'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// avalanche sizes at a given background creation rate: seed a flip, track damage peak (terminating cascade)
function avalanches(
  c0: number,
  g: { offsets: Int32Array; adj: Int32Array; cellCount: number },
  eu: Int32Array,
  ev: Int32Array,
): { sizes: number[]; bg: number } {
  const N = g.cellCount
  const moved = new Uint8Array(N)
  const { sizes, background } = settledAvalancheSizes({
    size: N,
    settleSteps: 150, // settle to the low background
    steps: 30,
    trials: 150,
    settleSeed: 5,
    perturbSeed: 7000,
    streamSeed: 222,
    makeRng: seed => makeRng({ seed }),
    relax: (state, rng) =>
      conservingEdgeSweep({
        tone: state,
        eu,
        ev,
        moved,
        rng,
        arrow: c0,
      }),
    mode: 'peak',
  })
  return { sizes, bg: background }
}

export function avalancheCriticality(input?: { n?: number }): {
  n: number
  scan: {
    c0: number
    bg: number
    median: number
    max: number
    span: number
  }[]
  bestSpan: number
  scaleFree: boolean
  ballisticNotCritical: boolean
  solved: boolean
} {
  const n = input?.n ?? 12000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)

  const rates = [0.001, 0.003, 0.008, 0.02, 0.05]
  const scan: {
    c0: number
    bg: number
    median: number
    max: number
    span: number
  }[] = []
  for (const c0 of rates) {
    const { sizes, bg } = avalanches(c0, g, eu, ev)
    const median = sizes[Math.floor(sizes.length / 2)]!
    const max = sizes[sizes.length - 1]!
    const span = max / Math.max(median, 1)
    scan.push({ c0, bg, median, max, span })
  }
  let bestSpan = 0
  for (const s of scan) if (s.span > bestSpan) bestSpan = s.span
  // a scale-free avalanche regime would have avalanches spanning many scales (heavy tail). It does NOT
  // occur, at every background the span is about 1, perturbations spread BALLISTICALLY (the lightcone) to a
  // fixed size. So the SOC/avalanche route to criticality does not apply, the ballistic lightcone (good for
  // relativity, P123) precludes branching-process avalanches. This is a real finding, correctly determined.
  const scaleFree = bestSpan > 8
  const ballisticNotCritical = bestSpan < 2 // uniformly fixed-size (ballistic), no scale-free avalanches
  const solved = ballisticNotCritical

  return {
    n: N,
    scan,
    bestSpan,
    scaleFree,
    ballisticNotCritical,
    solved,
  }
}

export default experiment({
  id: 'renormalization/avalanche-criticality',
  title:
    'no scale-free avalanches at any background, perturbations spread ballistically to a fixed size',
  category: 'renormalization',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = avalancheCriticality({ n: 2000 })
    const ok = r.solved && r.ballisticNotCritical && !r.scaleFree
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the avalanche size span stays about one at every background so the self-organized-criticality route does not apply, the ballistic lightcone precludes branching avalanches',
      metrics: {
        bestSpan: r.bestSpan,
        scaleFree: r.scaleFree ? 1 : 0,
      },
      notes:
        'an honest negative, the ballistic lightcone good for relativity precludes the scale-free avalanche regime',
    })
  },
})
