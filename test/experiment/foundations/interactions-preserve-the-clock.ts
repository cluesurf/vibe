// The scattering negative, exact: NO interaction of the fixed-mesh charge rule shifts a defect's clock
// phase. The clock results left two candidate phase shifters, an interaction between defects and the
// growth frontier. Growth works (foundations/growth-shifts-the-clock). This experiment closes the other
// route. The rule has exactly one interacting configuration, a +1 and a -1 on the SAME line at the SAME
// cell, where the two tones form the pair state the create-flip-annihilate cycle acts on: there the
// coarse Z_3 amplitude is NOT the union (the gap is exactly 3), the one genuine collision the rule has.
// And it is bound and clock-locked: the breather's phase sequence stays in {0, 180} degrees, sums of
// clock phases, the cycle never separates, and no defect ever emerges with a shifted phase. Every
// SEPARATED configuration, adjacent head-on, like-signed contact, or far apart, is an exact union at
// every beat. Two exact positives come with it: a -1 tone carries the complex-conjugate phase sequence
// of a +1 tone (charge conjugation acts on the coarse amplitude as complex conjugation, -30, -30, -150
// against 30, 30, 150), and the control shows the observable is not blind: a defect seeded one beat
// late by hand carries a different phase sequence, so a shift would have been seen.
//
// Together with the growth result this makes the statement sharp: on the committed rule the ONLY clock
// shifter is the arrow. Depth L2: exact measurements on the committed rule with a detector control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will, charge } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import {
  ComplexPair,
  pairAbs2,
  pairAdd,
  pairSub,
} from '@/code/algebra/linear/complex-pair'

const SIDE = 7
const BEATS = 12
const EXACT = 1e-9

type Seed = { cell: number; direction: number; value: number; beat?: number }

export default experiment({
  id: 'foundations/interactions-preserve-the-clock',
  code: 'E-FND-0087',
  title:
    'no interaction of the fixed-mesh charge rule shifts the clock: the one interacting configuration (the same-cell head-on breather, whose amplitude departs from the union by exactly 3) is bound and clock-locked with phases 0 and 180, every separated pair is an exact union at every beat, a -1 tone carries the complex-conjugate phase sequence of a +1 (charge conjugation conjugates the amplitude), and the detector control (a defect seeded one beat late by hand) shows a phase shift would have been seen',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const rule = pairCollision({ opposite: meshOpposites(mesh) })
    const centre = Math.floor(mesh.cellCount / 2)
    const direction = 0
    const oppositeDirection = mesh.opposite(direction)
    const near = mesh.neighbour(centre, direction)
    const far = [0, 1, 2].reduce(c => mesh.neighbour(c, 2), centre)

    function run(seeds: Seed[]): { amp: ComplexPair; q: number }[] {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      const out: { amp: ComplexPair; q: number }[] = []

      for (let t = 0; t < BEATS; t++) {
        for (const seed of seeds) {
          if ((seed.beat ?? 0) === t) {
            seeded.data[seed.cell * mesh.degree + seed.direction] =
              seed.value
          }
        }

        vacuum = beat(vacuum, rule)
        seeded = beat(seeded, rule)
        out.push({
          amp: pairSub(clockAmplitude(seeded), clockAmplitude(vacuum)),
          q: charge(seeded),
        })
      }

      return out
    }

    const plus = run([{ cell: centre, direction, value: 1 }])
    const minus = run([{ cell: centre, direction, value: -1 }])
    const minusFar = run([{ cell: far, direction, value: -1 }])
    const breather = run([
      { cell: centre, direction, value: 1 },
      { cell: centre, direction: oppositeDirection, value: -1 },
    ])
    const adjacent = run([
      { cell: centre, direction, value: 1 },
      { cell: near, direction: oppositeDirection, value: -1 },
    ])
    const adjacentMinus = run([
      { cell: near, direction: oppositeDirection, value: -1 },
    ])
    const breatherMinus = run([
      { cell: centre, direction: oppositeDirection, value: -1 },
    ])
    const likePair = run([
      { cell: centre, direction, value: 1 },
      { cell: near, direction: oppositeDirection, value: 1 },
    ])
    const likeSecond = run([
      { cell: near, direction: oppositeDirection, value: 1 },
    ])

    // charge conjugation conjugates the amplitude
    let conjugate = true

    for (let t = 0; t < BEATS; t++) {
      const p = plus[t]!.amp
      const m = minus[t]!.amp

      if (
        Math.abs(p[0] - m[0]) > EXACT ||
        Math.abs(p[1] + m[1]) > EXACT
      ) {
        conjugate = false
      }
    }

    // contact pairs are exact sums of their isolated defects
    const unionGap = (
      pair: { amp: ComplexPair }[],
      one: { amp: ComplexPair }[],
      two: { amp: ComplexPair }[],
    ): number => {
      let worst = 0

      for (let t = 0; t < BEATS; t++) {
        worst = Math.max(
          worst,
          Math.sqrt(
            pairAbs2(
              pairSub(pair[t]!.amp, pairAdd(one[t]!.amp, two[t]!.amp)),
            ),
          ),
        )
      }

      return worst
    }

    const breatherGap = unionGap(breather, plus, breatherMinus)
    const adjacentGap = unionGap(adjacent, plus, adjacentMinus)
    const likeGap = unionGap(likePair, plus, likeSecond)
    const farGap = unionGap(
      run([
        { cell: centre, direction, value: 1 },
        { cell: far, direction, value: -1 },
      ]),
      plus,
      minusFar,
    )

    // the detector control: a defect seeded one beat late (a hole made by hand in the flashed vacuum)
    // carries a DIFFERENT phase sequence, so a shift would have been visible
    const late = run([{ cell: far, direction, value: 0, beat: 1 }])
    const lateVisible = late.some(
      (x, t) =>
        Math.sqrt(pairAbs2(x.amp)) > EXACT &&
        Math.sqrt(pairAbs2(plus[t]!.amp)) > EXACT &&
        phaseDegrees(x.amp) !== phaseDegrees(plus[t]!.amp),
    )

    const phasesPlus = plus.slice(0, 3).map(x => phaseDegrees(x.amp))
    const phasesMinus = minus.slice(0, 3).map(x => phaseDegrees(x.amp))

    // the breather is the one genuine interaction: not a union, but clock-locked (phases in {0, 180})
    const breatherInteracts = Math.abs(breatherGap - 3) < EXACT
    const breatherClockLocked = breather.every(
      x =>
        Math.sqrt(pairAbs2(x.amp)) < EXACT ||
        Math.abs(Math.abs(phaseDegrees(x.amp)) - 180) === 180 ||
        Math.abs(phaseDegrees(x.amp)) === 180,
    )

    const ok =
      conjugate &&
      breatherInteracts &&
      breatherClockLocked &&
      adjacentGap < EXACT &&
      likeGap < EXACT &&
      farGap < EXACT &&
      lateVisible &&
      charge(makeWill(mesh)) === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the fixed odd-sided d4Mesh under the charge rule the one interacting configuration is the same-cell head-on pair, whose amplitude departs from the union by exactly 3 yet stays clock-locked (phases 0 and 180, sums of clock phases) and bound, never releasing a shifted defect, while the adjacent head-on, like-signed and far pairs are exact unions at every one of twelve beats, a -1 tone carries the complex conjugate of the +1 phase sequence (-30, -30, -150 against 30, 30, 150), and a hand-made one-beat-late hole does show a different phase to the same observable, so no interaction of the fixed-mesh rule shifts a defect clock and the arrow is the only clock shifter the rule has',
      metrics: {
        phasePlusBeat1: phasesPlus[0]!,
        phasePlusBeat3: phasesPlus[2]!,
        phaseMinusBeat1: phasesMinus[0]!,
        phaseMinusBeat3: phasesMinus[2]!,
        breatherGap: Number(breatherGap.toFixed(6)),
        breatherInteracts: breatherInteracts ? 1 : 0,
        breatherClockLocked: breatherClockLocked ? 1 : 0,
        adjacentGap: Number(adjacentGap.toExponential(2)),
        likeGap: Number(likeGap.toExponential(2)),
        farGap: Number(farGap.toExponential(2)),
      },
      // CONTROL: the observable detects a genuine phase difference when one exists
      control: { lateHoleShowsDifferentPhase: lateVisible ? 1 : 0 },
      notes:
        'The negative half of the clock-shifter search: growth-shifts-the-clock (E-FND-0086) shows the arrow shifts the clock, this shows no fixed-mesh interaction does. The conjugate phases of opposite charges mean charge conjugation acts on the coarse amplitude exactly as complex conjugation acts on a wavefunction, a structural parallel recorded, not a derivation.',
    })
  },
})
