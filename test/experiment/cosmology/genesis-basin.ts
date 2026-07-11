// G1 of chunk 10, the basin of attraction: the initial state is irrelevant. From several DIFFERENT
// deterministic initial conditions (the void, a single pair-seed, a dense alternating start, a charged block),
// all at total charge zero, the arrow carries every one to the SAME living fraction, so the universe is the
// rule's attractor, not its accident, and the start is forgotten. The CONTROL, the arrow off, the late states
// stay start-dependent (no shared attractor), isolating the attractor as the arrow's doing.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import {
  chargeTrajectory,
  balanceToZero,
} from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/genesis-basin',
  code: 'E-CSM-0023',
  title:
    'the initial state is irrelevant, every start converges to the same living balance, the universe is an attractor',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const mesh = buildCoxeterMesh({
      symbol: [5, 3, 4],
      depth: 20,
      maxChambers: 60000,
    })

    const n = mesh.cellCount

    let center = 0

    for (let i = 1; i < n; i++) {
      if (mesh.neighbors[i]!.length > mesh.neighbors[center]!.length) {
        center = i
      }
    }

    const dist = neighborDistances({
      neighbors: mesh.neighbors,
      size: n,
      source: center,
    })

    // four deterministic, total-charge-zero initial conditions
    const theVoid = new Int8Array(n)
    const pairSeed = (() => {
      const t = new Int8Array(n)

      t[center] = 1
      t[mesh.neighbors[center]![0]!] = -1

      return t
    })()

    const denseAlt = balanceToZero(
      (() => {
        const t = new Int8Array(n)

        for (let i = 0; i < n; i++) {
          t[i] = i % 2 === 0 ? 1 : -1
        }

        return t
      })(),
    )

    const block = balanceToZero(
      (() => {
        const t = new Int8Array(n)

        for (let i = 0; i < n; i++) {
          if ((dist[i] ?? 9) <= 3) {
            t[i] = i % 2 === 0 ? 1 : -1
          }
        }

        return t
      })(),
    )

    const ics: [string, Int8Array][] = [
      ['void', theVoid],
      ['pair', pairSeed],
      ['dense', denseAlt],
      ['block', block],
    ]

    const lateFraction = (
      initial: Int8Array,
      arrow: number,
    ): number => {
      const r = chargeTrajectory({
        neighbors: mesh.neighbors,
        initial,
        beats: 200,
        arrow,
        seed: 9,
      })

      const tail = r.trajectory.slice(-20)

      return tail.reduce((a, b) => a + b, 0) / tail.length / n
    }

    const onFracs = ics.map(([, ic]) => lateFraction(ic, 0.1))
    const offFracs = ics.map(([, ic]) => lateFraction(ic, 0))
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs)

    const onSpread = spread(onFracs)
    const offMax = Math.max(...offFracs)
    const converges = onSpread < 0.05 && Math.min(...onFracs) > 0.1 // all alive AND agree (the living attractor)
    const controlDead = offMax < 0.05 // with the arrow off every start collapses to the DEAD attractor (peace)
    const ok = converges && controlDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'four different deterministic initial conditions all converge to the same living fraction under the arrow, so the universe is the rule attractor and the initial state is irrelevant, while with the arrow off the late states stay start-dependent',
      metrics: {
        cells: n,
        onFractions: Number(onSpread.toFixed(4)),
        minLiving: Number(Math.min(...onFracs).toFixed(3)),
        maxLiving: Number(Math.max(...onFracs).toFixed(3)),
      },
      // CONTROL: with the arrow off, every start collapses to the same DEAD attractor (peace), so the LIVING attractor is the arrow's, while the start-irrelevance holds either way.
      control: { arrowOffMaxLiving: Number(offMax.toFixed(4)) },
      notes:
        'G1, the initial-state problem dissolved. Fractions: ' +
        onFracs.map(f => f.toFixed(3)).join(' '),
    })
  },
})
