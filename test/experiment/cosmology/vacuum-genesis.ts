// Piece A of theory-v0.8.0 plans/the-initial-state-from-nothing: is the peace vacuum unstable under the arrow?
// From the literal void (all peace, Q = 0), the arrow alone polarizes peace into balanced (+1, -1) pairs and
// the other conserving moves spread them into a dynamic balance, so a living universe SELF-CREATES from nothing
// but the rule, with total charge held at zero throughout. With the arrow off the void stays dead peace. This
// is the self-creating-vacuum model, the prize outcome of the genesis program.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { chargeTrajectory, genesisProfile } from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/vacuum-genesis',
  title: 'the peace vacuum is unstable under the arrow, a living charge-zero universe self-creates from the void',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
    const n = mesh.cellCount
    const theVoid = new Int8Array(n) // all peace, the literal nothing, Q = 0
    const live = chargeTrajectory({ neighbors: mesh.neighbors, initial: theVoid, beats: 120, arrow: 0.1, seed: 9 })
    const dead = chargeTrajectory({ neighbors: mesh.neighbors, initial: theVoid, beats: 120, arrow: 0, seed: 9 })
    const g = genesisProfile({ trajectory: live.trajectory, cells: n })
    const deadEnd = dead.trajectory[dead.trajectory.length - 1]!

    const selfCreates = g.start === 0 && g.rose && g.alive && g.sustained
    const conservedAtZero = live.qStart === 0 && live.qEnd === 0
    const controlDead = deadEnd === 0
    const ok = selfCreates && conservedAtZero && controlDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'from the all-peace void (Q=0) the arrow alone makes a living universe self-create and settle to a dynamic balance, conserving total charge at zero, while without the arrow the void stays dead, so the peace vacuum is unstable under the arrow and the universe needs nothing but the rule',
      metrics: { cells: n, voidStart: g.start, peak: g.peak, lifeEnd: g.end, qStart: live.qStart, qEnd: live.qEnd },
      // CONTROL: the same void with the arrow OFF stays dead peace, so the genesis is the arrow, not the rng or the mesh.
      control: { deadEnd },
      notes:
        'Piece A of the-initial-state-from-nothing. The arrow as the creation rate is still a posited parameter here, deriving it from growth is the genesis-of-the-arrow frontier.',
    })
  },
})
