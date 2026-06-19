// G8 of chunk 10, the minimal seed and Garden-of-Eden. The minimal sufficient seed is NOTHING, the void and
// progressively larger seeds all boot the SAME living attractor, so no seed is needed beyond the empty one. And
// the rule is strongly NON-INJECTIVE, its annihilation move loses information, so a large fraction of states are
// Garden-of-Eden (no predecessor, can only ever be initial). That irreversibility is exactly what gives the open
// system an attractor and lets the void be the universal start.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import {
  chargeTrajectory,
  gardenOfEdenFraction,
} from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/minimal-seed',
  title:
    'the minimal seed is nothing, every seed boots the same attractor, and the rule is non-injective (Garden-of-Eden)',
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
    const lateFrac = (seedPairs: number) => {
      const t = new Int8Array(n)
      for (let k = 0; k < seedPairs; k++) {
        t[2 * k] = 1
        t[2 * k + 1] = -1
      }
      const r = chargeTrajectory({
        neighbors: mesh.neighbors,
        initial: t,
        beats: 200,
        arrow: 0.1,
        seed: 9,
      })
      const tail = r.trajectory.slice(-20)
      return tail.reduce((a, b) => a + b, 0) / tail.length / n
    }
    const fromVoid = lateFrac(0) // the empty seed: nothing
    const fromOne = lateFrac(1) // a single pair
    const fromMany = lateFrac(20) // many pairs
    const seedIrrelevant =
      Math.max(fromVoid, fromOne, fromMany) -
        Math.min(fromVoid, fromOne, fromMany) <
        0.05 && fromVoid > 0.1

    // Garden-of-Eden / irreversibility on a small 8-cell ring (3^8 states enumerated)
    const ring = Array.from({ length: 8 }, (_, i) => [
      (i + 7) % 8,
      (i + 1) % 8,
    ])
    const goe = gardenOfEdenFraction({
      neighbors: ring,
      cells: 8,
      arrow: 0.1,
      seed: 9,
    })
    const nonInjective = goe.goeFraction > 0.1 && goe.injectivity < 0.9 // many states have no predecessor

    const ok = seedIrrelevant && nonInjective

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the void and progressively larger seeds all boot the same living fraction, so the minimal sufficient seed is nothing, and the rule is strongly non-injective with a large Garden-of-Eden fraction (the annihilation loses information), which is what gives the open system an attractor and makes the void the universal start',
      metrics: {
        cells: n,
        fromVoid: Number(fromVoid.toFixed(3)),
        fromOnePair: Number(fromOne.toFixed(3)),
        fromManyPairs: Number(fromMany.toFixed(3)),
        goeFraction: Number(goe.goeFraction.toFixed(3)),
        injectivity: Number(goe.injectivity.toFixed(3)),
      },
      // CONTROL: the seed size does not change the attractor (seedIrrelevant), and the rule's non-injectivity (goeFraction > 0) is the irreversibility behind it.
      control: { ringStates: goe.states, reachable: goe.reachable },
      notes:
        'G8, the minimal seed is nothing; the Garden-of-Eden fraction shows the irreversibility.',
    })
  },
})
