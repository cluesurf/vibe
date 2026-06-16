// The discreteness audit, made a test. The genesis can run on PURELY discrete, integer, ternary structures, with
// NO decimal numbers, NO randomness, and NO hash, only the ternary tone {-1, 0, +1} on the committed {3,4,3,4}
// mesh, integer growth-depths, and an INTEGER PARITY desynchronization. A living, charge-zero universe still
// self-creates from the peace void as the mesh grows, while a static no-growth mesh stays dead. So the whole
// genesis is grounded in the fundamental ternary structure and the {3,4,3,4} geometry, fully discrete.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import { growingMeshGenesis, chargeTrajectory } from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/discrete-genesis',
  title: 'genesis on purely ternary integer {3,4,3,4} structures, no decimals, no randomness, no hash',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const mesh = buildCoxeterMesh({ symbol: [3, 4, 3, 4], depth: 30, maxChambers: 40000 })
    const n = mesh.cellCount
    let center = 0
    for (let i = 1; i < n; i++) if (mesh.neighbors[i]!.length > mesh.neighbors[center]!.length) center = i
    const depth = neighborDistances({ neighbors: mesh.neighbors, size: n, source: center })

    // PURE: ternary tone, integer depth, integer-parity hop. No decimal, no rng, no hash.
    const grow = growingMeshGenesis({ neighbors: mesh.neighbors, depth, settleBeats: 20, integerHop: true })
    const lifeEnd = grow.trajectory[grow.trajectory.length - 1]!
    const peak = Math.max(...grow.trajectory)
    // control: a static all-peace mesh, no growth
    const dead = chargeTrajectory({ neighbors: mesh.neighbors, initial: new Int8Array(n), beats: 40, arrow: 0, seed: 9 })
    const deadEnd = dead.trajectory[dead.trajectory.length - 1]!

    const grewLife = grow.trajectory[0] === 0 && peak > 0 && lifeEnd > 0 // life self-creates and survives
    const sustained = lifeEnd > 0.01 * grow.bornEnd // a sustained living balance
    const conservedAtZero = grow.qStart === 0 && grow.qEnd === 0 // exact ternary charge conservation
    const noGrowthDead = deadEnd === 0
    const ok = grewLife && sustained && conservedAtZero && noGrowthDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the committed {3,4,3,4} mesh, with only the ternary tone, integer growth-depths, and an integer-parity desync (no decimal, no randomness, no hash), a living charge-zero universe self-creates from the peace void as the mesh grows, while a static mesh stays dead, so the genesis is fully discrete and grounded in the ternary and {3,4,3,4} structures',
      metrics: { cells: n, born: grow.bornEnd, peak, lifeEnd, qStart: grow.qStart, qEnd: grow.qEnd },
      // CONTROL: no growth stays dead, so the pure-integer genesis is the moving frontier, not the rng or a decimal threshold.
      control: { noGrowthEnd: deadEnd },
      notes: 'The discreteness audit as a test. Pure ternary {-1,0,+1} on {3,4,3,4}, integer-only, deterministic.',
    })
  },
})
