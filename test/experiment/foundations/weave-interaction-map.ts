// The interaction map of the committed rule, measured as exact difference-field additivity. For
// each configuration, two defects are run jointly and solo, and the joint difference field is
// compared slot by slot against the mod-three sum of the solos: zero mismatch is the free field,
// any mismatch is genuine interaction. Four rows close the map:
//
//   - CLOCK-COUPLE MATTER, TRUE HEAD-ON: exactly free. Two excitations on a real collision course
//     (each seeded on the other's path) pass through each other with zero deviation at every beat.
//     Structural root: no collide term ever touches a clock couple's matter slots.
//   - SWAP-COUPLE MATTER, TRUE HEAD-ON: real scattering. Zero deviation before the crossing, then
//     the mismatch turns on and grows. The swap couple is an interacting field theory.
//   - SAME CELL, DIFFERENT COUPLES: exactly decoupled. The collide step of lineWeave reads and
//     writes only one couple's four slots and streaming preserves slot identity, so the six couples
//     are decoupled subsystems sharing only the active-cell geometry. Measured to zero here.
//   - SAME CELL, SAME COUPLE, MATTER PLUS WIRE: a contact vertex, mismatch from the first beat.
//     This is the matter-to-carrier coupling the gauge sector needs, and it is confined to the swap
//     couple's slots.
//
// The first and third rows are the negative controls (the theory says exactly free, the instrument
// reads exactly zero), the second and fourth are the positives. Depth L2 on the committed rule, no
// randomness, side twenty-five so the crossing happens far from wraparound.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import { linesOf } from '@/task/palindrome-hunt'

const SIDE = 25
const BEATS = 14

export default experiment({
  id: 'foundations/weave-interaction-map',
  code: 'E-FND-0114',
  title:
    'the exact interaction map of the committed rule: clock-couple matter passes through a true head-on collision with zero deviation at every beat (free by measurement and by construction), swap-couple matter genuinely scatters (zero deviation before the crossing, then a growing mismatch), two defects in different couples at the same cell are exactly decoupled (the six couples are independent subsystems sharing only the active-cell geometry), and matter plus wire of the swap couple at one cell is a contact vertex interacting from the first beat',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const lines = linesOf(opposite)
    const mid = Math.floor(SIDE / 2)
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const wrap = (d: number): number =>
      d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3
    const center = cellAt([mid, mid, mid, mid])
    const step = (dir: number): number[] => {
      const to = mesh.neighbour(center, dir)

      return [0, 1, 2, 3].map(a =>
        wrap(coordinate(to, a) - coordinate(center, a)),
      )
    }

    const runDiff = (seeds: [number, number][]): Int8Array[] => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (const [c, d] of seeds) {
        seeded.data[c * 24 + d] = 1
      }

      const out: Int8Array[] = []

      for (let t = 1; t <= BEATS; t++) {
        vacuum = growingBeat(vacuum, rule, () => true)
        seeded = growingBeat(seeded, rule, () => true)

        const diff = new Int8Array(seeded.data.length)

        for (let i = 0; i < seeded.data.length; i++) {
          diff[i] = (seeded.data[i]! - vacuum.data[i]! + 3) % 3
        }

        out.push(diff)
      }

      return out
    }

    const mismatches = (
      a: [number, number],
      b: [number, number],
    ): number[] => {
      const soloA = runDiff([a])
      const soloB = runDiff([b])
      const joint = runDiff([a, b])
      const out: number[] = []

      for (let t = 0; t < BEATS; t++) {
        let bad = 0

        for (let i = 0; i < joint[t]!.length; i++) {
          if (joint[t]![i] !== (soloA[t]![i]! + soloB[t]![i]!) % 3) {
            bad++
          }
        }

        out.push(bad)
      }

      return out
    }

    // head-on seeds five steps out on both sides of the center, along the line's own root
    const headOn = (line: number): number[] => {
      const dirF = lines[line]![0]!
      const dirB = lines[line]![1]!
      const v = step(dirF)
      const at = (k: number): number =>
        cellAt(
          [0, 1, 2, 3].map(
            a => (mid + k * v[a]! + SIDE) % SIDE,
          ) as number[],
        )

      return mismatches([at(-5), dirF], [at(5), dirB])
    }

    const clockHeadOn = headOn(2)
    const swapHeadOn = headOn(0)
    const crossCouple = mismatches(
      [center, lines[0]![0]!],
      [center, lines[2]![0]!],
    )
    const contactVertex = mismatches(
      [center, lines[0]![0]!],
      [center, lines[3]![0]!],
    )

    const clockFree = clockHeadOn.every(m => m === 0)
    const crossFree = crossCouple.every(m => m === 0)
    const swapBefore = swapHeadOn.slice(0, 5).every(m => m === 0)
    const swapAfter =
      swapHeadOn[BEATS - 1]! > 0 &&
      swapHeadOn[BEATS - 1]! > swapHeadOn[10]! - 1
    const contactNow = contactVertex[0]! > 0

    const ok =
      clockFree && crossFree && swapBefore && swapAfter && contactNow

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the two free rows read exactly zero mismatch at every beat, the swap head-on is exactly free before the crossing and interacting after it, and the same-couple contact vertex interacts from the first beat',
      metrics: {
        clockHeadOnWorst: Math.max(...clockHeadOn),
        crossCoupleWorst: Math.max(...crossCouple),
        swapHeadOnBeforeCrossing: Math.max(...swapHeadOn.slice(0, 5)),
        swapHeadOnFinal: swapHeadOn[BEATS - 1]!,
        contactVertexFirstBeat: contactVertex[0]!,
        contactVertexFinal: contactVertex[BEATS - 1]!,
      },
      // CONTROL: the free rows. The identical instrument that reads growing mismatch on the swap
      // couple reads exact zero on the clock couple and across couples
      control: {
        freeRowsExactlyZero: clockFree && crossFree ? 1 : 0,
      },
      notes:
        'the decoupling row is structural as well as measured: the collide of lineWeave touches only one couple per block and streaming preserves the slot index, so cross-couple dynamics cannot exist under this rule. Cross-species coupling therefore runs only through the shared active geometry, which is the architectural fact the gauge-universality question turns on.',
    })
  },
})
