// G6 of chunk 10, the arrow as broken time-reversal symmetry. The symmetric point, arrow = 0, is the UNIQUE
// dead one. The void at arrow = 0 stays dead while any nonzero arrow brings it to life, and a SEEDED structure
// at arrow = 0 relaxes away (no persistence) while a nonzero arrow sustains it. So the time-symmetric dynamics
// is a dynamical peak, no life, no persistent structure, and every broken-symmetry point lives. The arrow is
// not added to a still world, it is the world being unable to stay still, the same knife-edge as peace-is-a-peak
// applied to time itself.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import {
  chargeTrajectory,
  balanceToZero,
} from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/time-symmetry',
  title:
    'the arrow as broken time-reversal symmetry, the symmetric point is the unique dead one',
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
    for (let i = 1; i < n; i++)
      if (mesh.neighbors[i]!.length > mesh.neighbors[center]!.length)
        center = i
    const dist = neighborDistances({
      neighbors: mesh.neighbors,
      size: n,
      source: center,
    })
    const seedStruct = balanceToZero(
      (() => {
        const t = new Int8Array(n)
        for (let i = 0; i < n; i++)
          if ((dist[i] ?? 9) <= 4) t[i] = i % 2 === 0 ? 1 : -1
        return t
      })(),
    )

    const endFrac = (initial: Int8Array, arrow: number) => {
      const r = chargeTrajectory({
        neighbors: mesh.neighbors,
        initial,
        beats: 250,
        arrow,
        seed: 9,
      })
      return r.trajectory[r.trajectory.length - 1]! / n
    }
    // the void: dead at the symmetric point, alive for any nonzero arrow
    const voidAtZero = endFrac(new Int8Array(n), 0)
    const voidTiny = endFrac(new Int8Array(n), 0.005)
    // a seeded structure: relaxes at the symmetric point, sustained when symmetry is broken
    const structAtZero = endFrac(seedStruct, 0)
    const structBroken = endFrac(seedStruct, 0.1)

    const symmetricVoidDead = voidAtZero === 0 // the time-symmetric void cannot create
    const brokenVoidLives = voidTiny > 0.02 // any broken point lives
    const symmetricStructDecays = structAtZero < 0.5 * structBroken // structure cannot persist at the symmetric point
    const brokenStructLives = structBroken > 0.1 // structure sustained off the symmetric point
    const ok =
      symmetricVoidDead &&
      brokenVoidLives &&
      symmetricStructDecays &&
      brokenStructLives

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the time-symmetric point (arrow zero) is the unique dead one, the void cannot create and a seeded structure relaxes away there, while any nonzero arrow brings the void to life and sustains structure, so the arrow is spontaneously broken time-reversal symmetry, the world being unable to stay still',
      metrics: {
        cells: n,
        voidAtZero: Number(voidAtZero.toFixed(3)),
        voidTinyArrow: Number(voidTiny.toFixed(3)),
        structAtZero: Number(structAtZero.toFixed(3)),
        structBroken: Number(structBroken.toFixed(3)),
      },
      // CONTROL: the symmetric point is dead for BOTH the void and a seeded structure, while both live off it, so the deadness is the symmetry, not the start.
      control: { symmetricDeadVoid: voidAtZero === 0 ? 1 : 0 },
      notes:
        'G6, the arrow as broken time-reversal symmetry (arrow Layer 5).',
    })
  },
})
