// The prize of theory-v0.8.0 the-genesis-of-the-arrow: derive the creation bias from GROWTH, with NO arrow
// parameter and NO rng. The wake gives every cell a growth-depth (radial distance from the seed). The
// wake-driven rule polarizes a peace-peace edge that straddles a depth gradient, deterministically, the
// frontier-side cell +1 and the inner cell -1. From the all-peace void this brings a living, charge-zero
// universe to life. The CONTROL flattens the depth (no growth gradient), and the void stays dead. So the arrow
// is not a posited number, it is the radial gradient of the growing mesh, the wake itself.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import {
  wakeTrajectory,
  growthRate,
  genesisProfile,
} from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/arrow-from-the-wake',
  code: 'E-CSM-0001',
  title:
    'the arrow derived from growth, the wake gradient alone creates a living universe with no arrow parameter',
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

    let center = 0

    for (let i = 1; i < n; i++) {
      if (mesh.neighbors[i]!.length > mesh.neighbors[center]!.length)
        center = i
    }

    const depth = neighborDistances({
      neighbors: mesh.neighbors,
      size: n,
      source: center,
    }) // the wake's radial structure

    const flat = new Int32Array(n) // CONTROL: no growth gradient, all the same depth
    const rate = growthRate(depth) // the per-beat creation rate READ OFF the growth geometry (the frontier fraction), not a knob

    const live = wakeTrajectory({
      neighbors: mesh.neighbors,
      depth,
      initial: new Int8Array(n),
      beats: 120,
      rate,
    })

    const dead = wakeTrajectory({
      neighbors: mesh.neighbors,
      depth: flat,
      initial: new Int8Array(n),
      beats: 120,
      rate,
    })

    const g = genesisProfile({ trajectory: live.trajectory, cells: n })
    const deadEnd = dead.trajectory[dead.trajectory.length - 1]!

    const wakeCreatesLife =
      g.start === 0 && g.rose && g.alive && g.sustained

    const conservedAtZero = live.qStart === 0 && live.qEnd === 0
    const flatStaysDead = deadEnd === 0
    const ok = wakeCreatesLife && conservedAtZero && flatStaysDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with NO arrow parameter and NO rng, the wake (the radial growth-depth gradient) alone polarizes the peace void into a living, charge-zero universe, while a flattened depth (no growth gradient) stays dead, so the arrow is the growth gradient itself, not a posited number',
      metrics: {
        cells: n,
        growthRate: Number(rate.toFixed(4)),
        voidStart: g.start,
        peak: g.peak,
        lifeEnd: g.end,
        qStart: live.qStart,
        qEnd: live.qEnd,
      },
      // CONTROL: flatten the depth (kill the growth gradient) and the void never comes alive, isolating the wake as the engine.
      control: { flatDepthEnd: deadEnd },
      notes:
        'Derives the arrow from growth (Layer 1 of the-genesis-of-the-arrow). Static mesh with a precomputed radial depth as the wake proxy, a full growing-mesh simulation is the next refinement.',
    })
  },
})
