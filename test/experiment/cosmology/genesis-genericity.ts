// Piece E of the-initial-state-from-nothing: is genesis GENERIC, not a finite-size artifact or a tuned seed.
// The self-creating vacuum is run from the all-peace void at a ladder of lattice SIZES (per methodology, vary
// size not seeds). If the living fraction is high and roughly constant across sizes, genesis is generic, the
// universe self-creates regardless of scale, with no tuning. The arrow-off control stays dead at every size.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { chargeTrajectory } from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/genesis-genericity',
  code: 'E-CSM-0025',
  title:
    'genesis is generic, the peace void self-creates a living universe at every lattice size, not a finite-size fluke',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const caps = [4000, 12000, 30000, 60000] // a ladder of sizes, vary SIZE not seed
    const fractions: number[] = []
    const sizes: number[] = []

    let allConserved = true
    let allControlsDead = true

    for (const maxChambers of caps) {
      const mesh = buildCoxeterMesh({
        symbol: [5, 3, 4],
        depth: 24,
        maxChambers,
      })

      const n = mesh.cellCount

      sizes.push(n)

      const live = chargeTrajectory({
        neighbors: mesh.neighbors,
        initial: new Int8Array(n),
        beats: 120,
        arrow: 0.1,
        seed: 9,
      })

      const dead = chargeTrajectory({
        neighbors: mesh.neighbors,
        initial: new Int8Array(n),
        beats: 120,
        arrow: 0,
        seed: 9,
      })

      fractions.push(live.trajectory[live.trajectory.length - 1]! / n)

      if (live.qEnd !== 0) allConserved = false

      if (dead.trajectory[dead.trajectory.length - 1]! !== 0)
        allControlsDead = false
    }

    const minF = Math.min(...fractions)
    const maxF = Math.max(...fractions)
    const spread = maxF - minF
    const aliveEverywhere = minF > 0.1 // a living universe at every size
    const stable = spread < 0.1 // the living fraction barely moves with size (generic, not a finite-size effect)
    const ok =
      aliveEverywhere && stable && allConserved && allControlsDead

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the peace void self-creates a living universe at every lattice size with a near-constant living fraction, so genesis is generic and scale-independent, not a finite-size artifact, and total charge stays zero at every size',
      metrics: {
        smallestSize: sizes[0]!,
        largestSize: sizes[sizes.length - 1]!,
        minFraction: Number(minF.toFixed(3)),
        maxFraction: Number(maxF.toFixed(3)),
        spread: Number(spread.toFixed(3)),
      },
      // CONTROL: the arrow-off void stays dead at every size, so the constant living fraction is the arrow, not the mesh.
      control: {
        allControlsDead: allControlsDead ? 1 : 0,
        allConserved: allConserved ? 1 : 0,
      },
      notes: `Piece E. Vary SIZE not seeds. sizes [${sizes.join(' ')}], living fractions [${fractions.map(f => f.toFixed(3)).join(' ')}].`,
    })
  },
})
