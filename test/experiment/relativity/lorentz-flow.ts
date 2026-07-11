// P125: does the residual lattice anisotropy SHRINK with scale (Lorentz restoration)? (P124.)
//
// P124 showed the one-step diffusion tensor is isotropic (rank-2). But the regular lattice can still be
// anisotropic at HIGHER order (the measure/lorentz sprinkling test). The question for emergent Lorentz:
// does that higher-order anisotropy wash out as a charge propagates over more steps (coarse time)? The
// central limit theorem says it should, an isotropic rank-2 step drives the multi-step distribution toward
// an isotropic Gaussian, killing higher cumulants.
//
// We measure the ANGULAR anisotropy at orders 2, 4, 6, that is the spread of <(n.u)^p> over many axes u,
// where n is the charge's direction from the ball origin (directions are conformally faithful from the
// origin, so no Poincare distortion). We do it after 1, 2, 4, 8 steps and check the higher-order
// anisotropy decreases. Run: npx tsx code/experiment/p125-lorentz-flow.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { dot } from '@/code/algebra/vector'
import { innermostCell } from '@/code/substrate/radial-tree'
import { angularAnisotropy } from '@/code/measure/isotropy'
import { randomWalkEndpoint } from '@/code/dynamics/random-walk'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function lorentzFlow(input?: {
  maxCells?: number
  runs?: number
}): {
  cellCount: number
  steps: number[]
  a2: number[]
  a4: number[]
  a6: number[]
  a4Shrinks: boolean
  a6Shrinks: boolean
  rank2AtFloor: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 9000
  const runs = input?.runs ?? 6000
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const N = g.cellCount
  const origin = innermostCell(
    Array.from({ length: N }, (_, i) =>
      dot(g.coords[i]!, g.coords[i]!),
    ),
  )

  const c0 = g.coords[origin]!

  // a fixed set of probe axes (unit vectors): coordinate axes plus random directions
  const axRng = makeRng({ seed: 1 })
  const axes: number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]

  for (let a = 0; a < 40; a++) {
    let x = axRng.next() * 2 - 1
    let y = axRng.next() * 2 - 1
    let z = axRng.next() * 2 - 1

    const len = Math.hypot(x, y, z) || 1

    x /= len
    y /= len
    z /= len
    axes.push([x, y, z])
  }

  const steps = [1, 2, 4, 8]
  const a2: number[] = []
  const a4: number[] = []
  const a6: number[] = []

  for (const k of steps) {
    const dirs: number[][] = []

    for (let run = 0; run < runs; run++) {
      // single charge random walk from the origin cell for k steps
      const rng = makeRng({ seed: 7000 + run * 17 + k })
      const cur = randomWalkEndpoint({
        neighbors: g.neighbors,
        start: origin,
        steps: k,
        rng,
      })

      const d = [
        g.coords[cur]![0]! - c0[0]!,
        g.coords[cur]![1]! - c0[1]!,
        g.coords[cur]![2]! - c0[2]!,
      ]

      const len = Math.hypot(d[0]!, d[1]!, d[2]!)

      if (len < 1e-9) continue

      dirs.push([d[0]! / len, d[1]! / len, d[2]! / len])
    }

    a2.push(angularAnisotropy({ directions: dirs, axes, order: 2 }))
    a4.push(angularAnisotropy({ directions: dirs, axes, order: 4 }))
    a6.push(angularAnisotropy({ directions: dirs, axes, order: 6 }))
  }

  // Lorentz restoration: the higher-order angular anisotropy (rank-4 and rank-6) shrinks with scale,
  // while rank-2 already sits at the measurement floor (icosahedral isotropy at leading order)
  const a4Shrinks = a4[a4.length - 1]! < a4[0]! * 0.8
  const a6Shrinks = a6[a6.length - 1]! < a6[0]! * 0.8
  const rank2AtFloor = Math.max(...a2) < 0.12
  const solved = a4Shrinks && a6Shrinks && rank2AtFloor

  return {
    cellCount: N,
    steps,
    a2,
    a4,
    a6,
    a4Shrinks,
    a6Shrinks,
    rank2AtFloor,
    solved,
  }
}

export default experiment({
  id: 'relativity/lorentz-flow',
  code: 'E-RLT-0020',
  title:
    'higher-order angular anisotropy washes out under coarse-graining',
  category: 'relativity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = lorentzFlow({ maxCells: 9000 })
    const ok = r.solved && r.a4Shrinks && r.a6Shrinks && r.rank2AtFloor

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'rank-4 and rank-6 angular anisotropy shrink as a charge spreads over more steps while rank-2 sits at the floor',
      metrics: {
        rank4First: r.a4[0] ?? 0,
        rank4Last: r.a4[r.a4.length - 1] ?? 0,
        rank6First: r.a6[0] ?? 0,
        rank6Last: r.a6[r.a6.length - 1] ?? 0,
      },
    })
  },
})
