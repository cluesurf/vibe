// G7 of chunk 10, THE FULL PRIZE: genesis on a genuinely growing mesh with NO arrow parameter, NO creation
// rate, and NO hash-gated creation. The mesh grows one shell per beat, and creation happens ONLY where the
// fresh frontier (just born at peace) meets the older structure. Because the frontier MOVES outward each beat,
// it never hits the same cells twice, so the moving frontier itself is the desynchronization, the arrow's rate,
// direction, and timing are ALL the growth. A living, charge-zero universe emerges and sustains, with charges
// left behind the advancing edge. The CONTROL, a static all-peace mesh with no growth, stays dead. So the arrow
// is fully derived from growth, and the base reduces from five to four. Run on {7,3} (more shells = cleaner).

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import {
  growingMeshGenesis,
  chargeTrajectory,
} from '@/code/dynamics/genesis'
import { scaled } from '@/test/scaffold/scale'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/growing-mesh-genesis',
  code: 'E-CSM-0026',
  title:
    'the full prize, a growing mesh self-creates a living universe with no arrow parameter at all',
  category: 'cosmology',
  substrates: ['73'],
  depth: 'L3',
  paper: true,
  scales: true,
  run(context) {
    const scale = context.scale ?? 1
    const mesh = buildCoxeterMesh({
      symbol: [7, 3],
      // AUDIT 2026-08-31: depth 60 so the chamber cap is what binds. 6000 chambers is exactly the
      // depth-30 mesh (714 cells, verified identical neighbour by neighbour), and it scales.
      depth: 60,
      maxChambers: scaled(6000, scale),
    })

    const n = mesh.cellCount

    let center = 0

    for (let i = 1; i < n; i++) {
      if (mesh.neighbors[i]!.length > mesh.neighbors[center]!.length) {
        center = i
      }
    }

    const depth = neighborDistances({
      neighbors: mesh.neighbors,
      size: n,
      source: center,
    })

    const grow = growingMeshGenesis({
      neighbors: mesh.neighbors,
      depth,
      settleBeats: 20,
    })

    const traj = grow.trajectory
    const lifeEnd = traj[traj.length - 1]!
    const peak = Math.max(...traj)
    // the control: NO growth, the full mesh all-peace run with share and hop only, no moving frontier
    const dead = chargeTrajectory({
      neighbors: mesh.neighbors,
      initial: new Int8Array(n),
      beats: 60,
      arrow: 0,
      seed: 9,
    })

    const deadEnd = dead.trajectory[dead.trajectory.length - 1]!

    const grewLife = traj[0] === 0 && peak > 0.1 * grow.bornEnd
    const settled = lifeEnd > 0.1 * grow.bornEnd // a sustained living balance survives after growth completes
    const conservedAtZero = grow.qStart === 0 && grow.qEnd === 0
    const noGrowthDead = deadEnd === 0
    const ok = grewLife && settled && conservedAtZero && noGrowthDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a genuinely growing mesh, with no arrow parameter and no creation rate, the moving frontier alone polarizes the fresh peace it meets, a living charge-zero universe emerges and sustains after growth completes, while a static no-growth mesh stays dead, so the arrow is fully derived from growth',
      metrics: {
        cells: n,
        born: grow.bornEnd,
        maxDepth: grow.maxDepth,
        peak,
        lifeEnd,
        qStart: grow.qStart,
        qEnd: grow.qEnd,
      },
      // CONTROL: no growth (static all-peace, share and hop only) never comes alive, so the engine is the moving frontier.
      control: { noGrowthEnd: deadEnd },
      notes:
        'G7, the full prize. No arrow parameter, no rate, no creation hash, only the moving frontier. The base drops from five to four (arrow = theorem). {7,3} for its many shells; the principle transfers to {5,3,4}.',
    })
  },
})
