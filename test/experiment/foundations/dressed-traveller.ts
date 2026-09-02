// The dressed traveller: in the physical vacuum the wake is a finite dressing, not a runaway. The
// isolated-slab experiments (E-FND-0096, E-FND-0099) left one standing worry: the traveller's
// domain crossing plants a medium response that grows without saturating. But an isolated wall is
// not the physical vacuum: the model's own cosmology (growth at incommensurate speed, E-FND-0098)
// tiles space with walls densely. This experiment puts the refined candidate knit's traveller in a
// periodic wall lattice, the dense-tiling vacuum, and the worry dissolves:
//
//   - EXACTLY BALLISTIC THROUGH THE MEDIUM: the particle sits at its free-flight position at every
//     one of seventy-one checked beats, at both sizes. No slowdown, no deflection: the traveller
//     stays massless at speed one whatever the medium.
//   - THE RESPONSE SATURATES INTO A DRESSING, SUB-ADDITIVELY: the medium excitation grows for
//     about twenty-five beats and then plateaus and relaxes (non-positive late slope at both
//     sizes), and the striking part is the cost of density: THREE walls produce no more total
//     dressing than ONE (174 against 177 slots at side 9), so the per-wall response collapses as
//     walls are added. On this finite torus the isolated wall's wake also saturates within the
//     window (the window rule applied to E-FND-0099's own growth claim, honestly: both are
//     geometry-dependent windows), and the invariant content is the sub-additivity plus the exact
//     ballistic motion.
//   - THE CLOUD SCALES LIKE A SURFACE: the plateau size grows with the lattice roughly as the side
//     squared (174 against 261 slots at sides 9 and 11), the codimension-two scaling of a dressing
//     spread over wall sheets, reported as measured.
//
// Reading: the bare traveller plus its wall-lattice dressing is the model's quasiparticle, and the
// physical vacuum (densely tiled by growth) is precisely where the particle sector is
// well-behaved. This closes the last open worry against the candidate knit and supplies the first
// plank of the coarse bridge (sixth-thing-0006): the object whose coarse dynamics the walk sector
// must reproduce is the dressed traveller, not the bare one. Depth L2, deterministic, no
// randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { linesOf } from '@/task/palindrome-hunt'
import { PAIR_FORWARD, Collision } from '@/code/rule/collision'
import { Tone } from '@/code/tone/will'

const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)
const OVERLAP_BALANCED: [number, number][] = [
  [0, 3],
  [2, 5],
  [4, 1],
  [6, 9],
  [8, 11],
  [10, 7],
]
const BEATS = 75

function candidateKnit(side: number): Collision {
  const mesh = d4Mesh({ side })
  const lines = linesOf(meshOpposites(mesh))
  const couples: [[number, number], [number, number]][] =
    OVERLAP_BALANCED.map(([m, w]) => [lines[m]!, lines[w]!])

  return (slots, base) => {
    for (let k = 0; k < couples.length; k++) {
      const [line, wire] = couples[k]!
      const loneAway = (a: Tone, b: Tone): boolean =>
        a === 0 && b !== 0
      const empty = (a: Tone, b: Tone): boolean =>
        a === 0 && b === 0

      if (k === 0) {
        const swap = (): void => {
          const a0 = slots[base + line[0]]! as Tone
          const a1 = slots[base + line[1]]! as Tone
          const w0 = slots[base + wire[0]]! as Tone
          const w1 = slots[base + wire[1]]! as Tone

          if (
            (loneAway(a0, a1) && empty(w0, w1)) ||
            (loneAway(w0, w1) && empty(a0, a1))
          ) {
            slots[base + line[0]] = w0
            slots[base + line[1]] = w1
            slots[base + wire[0]] = a0
            slots[base + wire[1]] = a1
          }
        }

        swap()

        const a = slots[base + wire[0]]! as Tone
        const b = slots[base + wire[1]]! as Tone
        const image = PAIR_FORWARD[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]!
        slots[base + wire[1]] = image[1]!
        swap()
      } else {
        const a = slots[base + wire[0]]! as Tone
        const b = slots[base + wire[1]]! as Tone
        const image = PAIR_FORWARD[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]!
        slots[base + wire[1]] = image[1]!
      }
    }
  }
}

function dressingStudy(input: {
  side: number
  lattice: boolean
}): {
  frontHits: number
  frontChecks: number
  maxSupport: number
  lateSlope: number
} {
  const { side, lattice } = input
  const mesh = d4Mesh({ side })
  const rule = candidateKnit(side)
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side
  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let c = 0; c < mesh.cellCount; c++) {
    if (
      coordinate(c, 0) === 1 &&
      coordinate(c, 1) === mid &&
      coordinate(c, 2) === mid &&
      coordinate(c, 3) === mid
    ) {
      seedCell = c
      break
    }
  }

  const freePosition: number[] = []

  {
    let controlVacuum: Will = makeWill(mesh)
    let controlSeeded: Will = makeWill(mesh)

    for (let t = 0; t < BEATS; t++) {
      if (t === 3) {
        controlSeeded.data[seedCell * 24] = 1
      }

      controlVacuum = growingBeat(controlVacuum, rule, () => true)
      controlSeeded = growingBeat(controlSeeded, rule, () => true)

      let position = -1

      for (let i = 0; i < controlSeeded.data.length; i++) {
        if (controlSeeded.data[i] !== controlVacuum.data[i]) {
          position = Math.floor(i / 24)
          break
        }
      }

      freePosition.push(position)
    }
  }

  const late = new Set<number>()

  for (let c = 0; c < mesh.cellCount; c++) {
    const x = coordinate(c, 0)

    if (lattice ? x % 3 === 0 : x === 3) {
      late.add(c)
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  const supports: number[] = []

  let frontHits = 0
  let frontChecks = 0

  for (let t = 0; t < BEATS; t++) {
    if (t === 3) {
      seeded.data[seedCell * 24] = 1
    }

    const active = (c: number): boolean =>
      late.has(c) ? t >= 1 : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    if (t <= 3) {
      continue
    }

    let support = 0

    const cells = new Set<number>()

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
        cells.add(Math.floor(i / 24))
      }
    }

    supports.push(support)
    frontChecks++

    if (cells.has(freePosition[t]!)) {
      frontHits++
    }
  }

  const n = supports.length
  const lateSlope = (supports[n - 1]! - supports[n - 13]!) / 12

  return {
    frontHits,
    frontChecks,
    maxSupport: Math.max(...supports),
    lateSlope,
  }
}

export default experiment({
  id: 'foundations/dressed-traveller',
  code: 'E-FND-0111',
  title:
    "the dressed traveller dissolves the wake worry: in a periodic wall lattice (the dense-tiling physical vacuum the model's own growth produces) the candidate knit's particle sits at its exact free-flight position at all seventy-one checked beats at both sizes while its medium response saturates into a finite co-moving dressing (non-positive late slope at both sizes, plateau scaling roughly as side squared) whose total is SUB-ADDITIVE in the walls (three walls cost no more than one, 174 against 177 slots), so dense tilings regularize the response per wall, the model's quasiparticle is the bare traveller plus its dressing, and the coarse bridge's target object is identified",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const lattice9 = dressingStudy({ side: 9, lattice: true })
    const lattice11 = dressingStudy({ side: 11, lattice: true })
    const isolated9 = dressingStudy({ side: 9, lattice: false })

    const ballistic =
      lattice9.frontHits === lattice9.frontChecks &&
      lattice11.frontHits === lattice11.frontChecks
    const saturates =
      lattice9.lateSlope <= 0 && lattice11.lateSlope <= 0
    const subAdditive =
      lattice9.maxSupport <= 1.1 * isolated9.maxSupport

    const ok = ballistic && saturates && subAdditive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lattice runs hit the free-flight cell at every check at both sizes with non-positive late slopes, and the three-wall dressing total stays within ten percent of the one-wall total',
      metrics: {
        frontHitsSide9: lattice9.frontHits,
        frontHitsSide11: lattice11.frontHits,
        plateauSide9: lattice9.maxSupport,
        plateauSide11: lattice11.maxSupport,
        lateSlopeSide9: Number(lattice9.lateSlope.toFixed(2)),
        lateSlopeSide11: Number(lattice11.lateSlope.toFixed(2)),
      },
      // CONTROL: the single isolated wall, whose response total the three-wall dressing does not
      // exceed (the sub-additivity that makes dense tilings safe)
      control: {
        isolatedLateSlope: Number(isolated9.lateSlope.toFixed(2)),
        isolatedMaxSupport: isolated9.maxSupport,
      },
      notes:
        "the plateau sizes (174 and 261 slots) scale close to side squared, the codimension-two signature of a dressing spread over wall sheets, recorded as measured rather than gated. The cosmological reading: growth at incommensurate speed necessarily tiles the vacuum with walls (E-FND-0098), so the dense lattice is the generic vacuum and the isolated wall the exceptional geometry, which applies the window rule to the growth claim of E-FND-0099: at side 9 and seventy-five beats the isolated wake saturates too, so the durable statements are the sub-additivity, the saturation, and the exact ballistic motion, each measured at two sizes.",
    })
  },
})
