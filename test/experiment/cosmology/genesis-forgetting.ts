// G2 of chunk 10, the forgetting rate: the deep past washes out. Two very different deterministic starts (a
// dense charged field and a sparse one) are run under the arrow. Their MACROSCOPIC state, the living fraction,
// starts far apart and CONVERGES, the universe forgetting how much charge it began with. The microscopic
// configurations land on different points of the same attractor (a residual Hamming difference), so the memory
// that is lost is the macroscopic one, exactly the observable a universe is identified by. The sanity control,
// two identical starts keep zero difference.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import {
  chargeTrajectory,
  differenceTrajectory,
  balanceToZero,
} from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/genesis-forgetting',
  title:
    'the deep past washes out, two different starts converge to the same macroscopic state under the arrow',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = buildCoxeterMesh({
      symbol: [5, 3, 4],
      depth: 20,
      maxChambers: 60000,
    })
    const n = mesh.cellCount
    const dense = balanceToZero(
      (() => {
        const t = new Int8Array(n)
        for (let i = 0; i < n; i++) {
          t[i] = i % 2 === 0 ? 1 : -1
        }

        return t
      })(),
    )
    const sparse = balanceToZero(
      (() => {
        const t = new Int8Array(n)
        for (let i = 0; i < n; i += 9) {
          t[i] = (i / 9) % 2 === 0 ? 1 : -1
        }

        return t
      })(),
    )

    const A = chargeTrajectory({
      neighbors: mesh.neighbors,
      initial: dense,
      beats: 200,
      arrow: 0.1,
      seed: 9,
    })
    const B = chargeTrajectory({
      neighbors: mesh.neighbors,
      initial: sparse,
      beats: 200,
      arrow: 0.1,
      seed: 9,
    })
    const fracDiff = (i: number) =>
      Math.abs(A.trajectory[i]! - B.trajectory[i]!) / n
    const startFracDiff = fracDiff(0)
    const endFracDiff = fracDiff(A.trajectory.length - 1)
    // microscopic difference (secondary): the residual is the attractor manifold spread, not start-memory
    const micro = differenceTrajectory({
      neighbors: mesh.neighbors,
      initialA: dense,
      initialB: sparse,
      beats: 200,
      arrow: 0.1,
      seed: 9,
    })
    const same = differenceTrajectory({
      neighbors: mesh.neighbors,
      initialA: dense,
      initialB: dense.slice(),
      beats: 30,
      arrow: 0.1,
      seed: 9,
    })

    const macroForgets = startFracDiff > 0.3 && endFracDiff < 0.05 // the living fraction starts far apart and converges
    const microDecays = micro.endDiff < micro.startDiff // the configuration difference also drops (toward the attractor manifold)
    const sanityZero = same.endDiff === 0
    const ok = macroForgets && microDecays && sanityZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two very different starts converge to the same living fraction under the arrow, so the macroscopic state (the universe identity) forgets how it began, while the microscopic difference drops to the attractor-manifold spread and identical starts stay identical',
      metrics: {
        cells: n,
        startFractionGap: Number(startFracDiff.toFixed(3)),
        endFractionGap: Number(endFracDiff.toFixed(3)),
        microStart: micro.startDiff,
        microEnd: micro.endDiff,
      },
      // CONTROL: identical starts keep difference exactly zero, so the convergence is real forgetting, not drift.
      control: { identicalStartsEndDiff: same.endDiff },
      notes:
        'G2, the forgetting rate. The macroscopic observable forgets; the residual microscopic difference is the attractor manifold, not start-memory.',
    })
  },
})
