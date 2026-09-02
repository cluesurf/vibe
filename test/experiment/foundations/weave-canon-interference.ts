// Canon under the weave, part one: interference and counting weights on the committed rule. The
// adoption (2026-09-02) obliges the canon re-derivation programme (sixth-thing-0007): measure the
// old pillars on lineWeave rather than assume they carry. This experiment re-derives the two most
// load-bearing quantum pillars, and one comes back richer than the original:
//
//   - CROSS-SPECIES INTERFERENCE, EXACT: under the weave every x-moving matter particle couples to
//     x-walls (its wire plane contains x), so the free branch of a two-path experiment must be a
//     DIFFERENT SPECIES, the x-blind traveller of another couple. A kicked x-coupled branch (root
//     three at 30 after its wall kick) against a free x-blind branch (root three at 150) gives the
//     joint amplitude exactly root three at 90 at the co-recoherence beats, and exactly two root
//     three at 150 when both read the intrinsic class: two different particle species interfering
//     as exact complex arithmetic, with branch additivity at machine precision throughout.
//   - COUNTING WEIGHTS, EXACT: the offset-2 wall's response to one, two, and three well-separated
//     defects is exactly proportional, ratios 2.000 and 3.000 to the slot, the E-FND-0091 counting
//     law carried to the committed rule unchanged.
//
// The geometry lesson is recorded because it will bite again: under the weave there is no x-moving
// free branch (the polarization law makes every same-couple traveller see the same walls), so
// interference experiments on the committed rule are naturally CROSS-SPECIES, which is also the
// physically interesting case. Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import { linesOf } from '@/task/palindrome-hunt'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const SIDE = 13

export default experiment({
  id: 'foundations/weave-canon-interference',
  code: 'E-FND-0112',
  title:
    'canon under the weave, part one: cross-species two-path interference is exact on the committed rule (a kicked x-coupled branch at 30 degrees against a free x-blind branch of another species at 150 gives the joint amplitude exactly root three at 90 at co-recoherence beats and exactly two root three at 150 when aligned, additivity at machine precision), the counting-weight law carries unchanged (wall response to one, two, three defects in exact ratios 2.000 and 3.000), and the recorded geometry lesson is that the polarization law makes committed-rule interference naturally cross-species, since every same-couple traveller sees the same walls',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const lines = linesOf(opposite)
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const mid = Math.floor(SIDE / 2)
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3

    const seedB = { cell: cellAt([1, 0, mid, mid]), dir: lines[0]![0] }
    const seedA = { cell: cellAt([8, 8, 2, 2]), dir: lines[6]![0] }
    const wall = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 4) {
        wall.add(c)
      }
    }

    const run = (
      seeds: { cell: number; dir: number }[],
    ): { re: number[]; im: number[] } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const re: number[] = []
      const im: number[] = []

      for (let t = 0; t < 20; t++) {
        if (t === 3) {
          for (const seed of seeds) {
            seeded.data[seed.cell * 24 + seed.dir] = 1
          }
        }

        const active = (c: number): boolean =>
          wall.has(c) ? t >= 1 : true

        vacuum = growingBeat(vacuum, rule, active)
        seeded = growingBeat(seeded, rule, active)

        const difference = pairSub(
          clockAmplitude(seeded),
          clockAmplitude(vacuum),
        )

        re.push(difference[0])
        im.push(difference[1])
      }

      return { re, im }
    }

    const branchA = run([seedA])
    const branchB = run([seedB])
    const joint = run([seedA, seedB])

    let additivityWorst = 0
    let destructive = 0
    let constructive = 0

    for (let t = 3; t < 20; t++) {
      additivityWorst = Math.max(
        additivityWorst,
        Math.hypot(
          joint.re[t]! - branchA.re[t]! - branchB.re[t]!,
          joint.im[t]! - branchA.im[t]! - branchB.im[t]!,
        ),
      )

      const magnitudeA = Math.hypot(branchA.re[t]!, branchA.im[t]!)
      const magnitudeB = Math.hypot(branchB.re[t]!, branchB.im[t]!)
      const magnitudeJoint = Math.hypot(joint.re[t]!, joint.im[t]!)

      if (
        Math.abs(magnitudeA - ROOT3) < 1e-9 &&
        Math.abs(magnitudeB - ROOT3) < 1e-9
      ) {
        const phaseA = Math.round(
          phaseDegrees([branchA.re[t]!, branchA.im[t]!]),
        )
        const phaseB = Math.round(
          phaseDegrees([branchB.re[t]!, branchB.im[t]!]),
        )

        if (
          phaseA === 150 &&
          phaseB === 30 &&
          Math.abs(magnitudeJoint - ROOT3) < 1e-9
        ) {
          destructive++
        }

        if (
          phaseA === 150 &&
          phaseB === 150 &&
          Math.abs(magnitudeJoint - 2 * ROOT3) < 1e-9
        ) {
          constructive++
        }
      }
    }

    // counting weights: the offset-2 wall response to one, two, three separated defects
    const slab = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      const x = coordinate(c, 0)

      if (x >= 4 && x <= 6) {
        slab.add(c)
      }
    }

    const response = (cells: number[]): number => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let max = 0

      for (let t = 0; t < 22; t++) {
        if (t === 3) {
          for (const cell of cells) {
            seeded.data[cell * 24] = 1
          }
        }

        const active = (c: number): boolean =>
          slab.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule, active)
        seeded = growingBeat(seeded, rule, active)

        let support = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            support++
          }
        }

        max = Math.max(max, support)
      }

      return max
    }

    const one = response([cellAt([1, 2, 2, 2])])
    const two = response([cellAt([1, 2, 2, 2]), cellAt([1, 6, 6, 6])])
    const three = response([
      cellAt([1, 2, 2, 2]),
      cellAt([1, 6, 6, 6]),
      cellAt([1, 10, 10, 10]),
    ])

    const interferes =
      additivityWorst < 1e-9 && destructive >= 2 && constructive >= 2
    const counts = two === 2 * one && three === 3 * one && one > 20

    const ok = interferes && counts

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'branch additivity holds under 1e-9 at every beat with at least two exact destructive and two exact constructive co-recoherence beats across species, and the wall response to one, two, three defects is exactly proportional',
      metrics: {
        additivityWorst: Number(additivityWorst.toExponential(2)),
        destructiveBeats: destructive,
        constructiveBeats: constructive,
        responseOneDefect: one,
        responseTwoDefects: two,
        responseThreeDefects: three,
      },
      // CONTROL: the constructive beats, where the same arithmetic doubles instead of halving, so
      // the destructive halving is the relative phase and not the method
      control: {
        countingRatioTwo: Number((two / one).toFixed(3)),
        countingRatioThree: Number((three / one).toFixed(3)),
      },
      notes:
        'the first attempt used two same-species branches and failed silently: under the weave every x-mover shares the x-coupled wire plane, so the intended free branch kicked too (recorded as the geometry lesson). The cross-species design is not a workaround but the physical statement: interference in the committed rule happens between amplitudes regardless of species, exactly as quantum mechanics requires of a universal amplitude.',
    })
  },
})
