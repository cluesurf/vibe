// The port conversion exists: the projective wall converts phase into number for dressed
// packets, which is the interferometer half of the Born mechanism (the counter half is
// E-FND-0123 and E-FND-0124). A dressed interacting packet seeded ADJACENT to an offset-two
// slab (the geometry that keeps everything inside the window: the first version of this
// probe read a strong signal at a distant slab and the window check exposed it as wrap
// contamination, the massive packet never reached the slab at all, recorded here because
// the window rule caught our own instrument) splits its outgoing excitation number across
// the slab according to its PREPARED PHASE:
//
//   - HEAVY SPECIES: the particle preparation transmits one excitation at every readout
//     beat, the antiparticle preparation transmits three to four, and with no slab NOTHING
//     crosses in either preparation at any beat, the exact null. The split is identical at
//     two transverse seed positions, the translation control.
//   - MIDDLEWEIGHT SPECIES: the same ordering (zero transmitted for the particle, two to
//     four for the antiparticle, at every beat), with the honest caveat that this faster
//     species drifts across the line naturally, so its no-slab null is imperfect (one to
//     two crossings) and only the with-slab difference is gated.
//
// Physical reading, stated plainly: the projective wall is CHARGE-ASYMMETRIC, transmitting
// the antiparticle packet preferentially, which is the interacting sector's C violation
// (E-FND-0115) expressed as a number-splitting port. Together with the number-operator law
// this gives the Born programme its concrete route: phase enters a port, the port converts
// it to number, and the counter counts. What remains for the full Born rule is the
// quantitative form of the conversion (does the split fraction reproduce the squared
// projection), which is now a measurement programme rather than a mystery. Depth L2,
// deterministic, the no-slab null and the translation invariance the controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 25

export default experiment({
  id: 'foundations/port-conversion',
  code: 'E-FND-0125',
  title:
    'the projective wall converts phase into number for dressed packets, the interferometer half of the Born mechanism: seeded adjacent to the offset-two slab, the heavy species transmits one excitation when prepared as the particle and three to four when prepared as the antiparticle at every readout beat, with the no-slab null exactly zero and the split identical at two seed positions, the middleweight species shows the same ordering with its imperfect natural-drift null reported, and the charge asymmetry of the port is the interacting sector C violation expressed as number splitting, so what remains of the Born derivation is the quantitative form of the conversion rather than its existence',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3
    const mid = 12

    const slabCells = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 13) {
        slabCells.add(c)
      }
    }

    const run = (
      dir: number,
      lane: number[],
      tone: number,
      withSlab: boolean,
    ): number[] => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const far: number[] = []

      for (let t = 0; t < 13; t++) {
        if (t === 3) {
          const slot = cellAt(lane) * 24 + dir
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + tone + 4) % 3) - 1) as -1 | 0 | 1
        }

        const active = (c: number): boolean =>
          withSlab && slabCells.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        if (t >= 9) {
          let f = 0

          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              const x = coordinate(Math.floor(i / 24), 0)

              if (x >= 14 && x <= 20) {
                f++
              }
            }
          }

          far.push(f)
        }
      }

      return far
    }

    const laneA = [12, 4, mid, mid]
    const laneB = [12, 8, 6, mid]

    // heavy species, both lanes
    const heavyPlusA = run(8, laneA, 1, true)
    const heavyMinusA = run(8, laneA, -1, true)
    const heavyPlusB = run(8, laneB, 1, true)
    const heavyMinusB = run(8, laneB, -1, true)
    const heavyNullPlus = run(8, laneA, 1, false)
    const heavyNullMinus = run(8, laneA, -1, false)

    // middleweight species
    const midPlus = run(4, laneA, 1, true)
    const midMinus = run(4, laneA, -1, true)

    const everyBeat = (
      xs: number[],
      predicate: (x: number, i: number) => boolean,
    ): boolean => xs.every(predicate)

    const heavySplit =
      everyBeat(heavyPlusA, x => x >= 1) &&
      everyBeat(heavyMinusA, (x, i) => x > heavyPlusA[i]!) &&
      everyBeat(heavyMinusA, (x, i) => x >= 3 * heavyPlusA[i]!)
    const heavyNullExact =
      everyBeat(heavyNullPlus, x => x === 0) &&
      everyBeat(heavyNullMinus, x => x === 0)
    const translationInvariant =
      heavyPlusA.join() === heavyPlusB.join() &&
      heavyMinusA.join() === heavyMinusB.join()
    const middleweightSplit = everyBeat(
      midMinus,
      (x, i) => x > midPlus[i]!,
    )

    const ok =
      heavySplit &&
      heavyNullExact &&
      translationInvariant &&
      middleweightSplit

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the heavy antiparticle preparation transmits at least three times the particle preparation at every readout beat with the no-slab null exactly zero and the split identical at both seed positions, and the middleweight species shows the same ordering at every beat',
      metrics: {
        heavyParticleFar: heavyPlusA[3]!,
        heavyAntiparticleFar: heavyMinusA[3]!,
        middleweightParticleFar: midPlus[3]!,
        middleweightAntiparticleFar: midMinus[3]!,
        heavyNullWorst: Math.max(
          ...heavyNullPlus,
          ...heavyNullMinus,
        ),
      },
      // CONTROL: the exact no-slab null for the heavy species and the translation invariance
      control: {
        nullExact: heavyNullExact ? 1 : 0,
        translationInvariant: translationInvariant ? 1 : 0,
      },
      notes:
        'the middleweight no-slab null is imperfect (the faster species drifts across the readout line naturally, one to two crossings), stated rather than gated. The first version of this measurement was window-contaminated (a distant slab the massive packet never reached, with wrapped radiation read as transmission) and is recorded as the window rule catching its own instrument. The quantitative Born question, whether the split fraction follows the squared projection of the prepared state onto the wall class, is the named next derivation.',
    })
  },
})
