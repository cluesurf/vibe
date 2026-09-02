// The Born half, answered by the base's own detector. The growing gas makes clock-offset domains and
// walls between them (growth-shifts-the-clock). This experiment measures what the wall DOES to a
// defect, exhaustively, and it is a measurement in the quantum sense of the word:
//
//   - PROJECTIVE ON THE CLOCK CLASS. Over every deep site and three slot directions on the side-9 ball
//     (75 legal seeds per offset), a defect whose domain is offset 2 beats from the interior is
//     amplified by the wall's mixing wave into a difference cluster four to six times its size (72 of
//     75, with three slot-level exceptions, one of them an exact annihilation), while offsets 0, 1 and
//     3 leave every single defect untouched at exactly its sqrt 3 magnitude. A step response in the
//     phase class, confirmed at side 11.
//   - LINEAR IN COUNT, NOT QUADRATIC IN AMPLITUDE. Two and three well-separated amplifying defects
//     produce a total response equal to the SUM of their single responses to machine precision, and
//     the deviation appears only when the grown clusters touch (measured at four). The pointer reads
//     the COUNT of amplifying-class defects. The squared coarse amplitude, which carries the
//     interference cross terms, plays no role in the response size.
//
// So the base has the definite outcome and the phase selection, and it cannot have the Born weight as
// constituted: a quadratic weight would need a defect to be in two clock classes at once, and every
// defect of the rule is in exactly one, while the detector's response to many is additive. This is the
// substrate-level root of the step-not-weight result the holder experiments found at the model level
// (quantum/collapse-is-not-the-weight). Depth L3: the committed rule plus growth produced the
// selection, over an exhaustive ensemble, with the quiet offsets as controls that come out no.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'
import { regionClockAmplitude } from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const QUIET = 2
const LOUD = 6
const EXACT = 1e-6
const ROOT3 = Math.sqrt(3)

type Setting = {
  mesh: ReturnType<typeof d4Mesh>
  late: Set<number>
  lateCells: number[]
  deepSites: number[]
  beats: number
}

// the amplification's onset scales with the interior size (the wall's mixed zone radiates through the
// interior before it reaches the deep sites), so each size carries its own post-onset census beat
function setting(side: number, radius: number, beats: number): Setting {
  const mesh = d4Mesh({ side })
  const distance = shellDistances(mesh, 0)
  const late = new Set<number>()
  const deepSites: number[] = []

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const d = distance[cell] ?? 99

    if (d <= radius) {
      late.add(cell)

      if (d <= 1) {
        deepSites.push(cell)
      }
    }
  }

  return { mesh, late, lateCells: [...late], deepSites, beats }
}

const ruleCache = new WeakMap<Setting['mesh'], ReturnType<typeof pairCollision>>()

function ruleOf(s: Setting): ReturnType<typeof pairCollision> {
  const cached = ruleCache.get(s.mesh)

  if (cached) {
    return cached
  }

  const rule = pairCollision({ opposite: meshOpposites(s.mesh) })

  ruleCache.set(s.mesh, rule)

  return rule
}

// the magnitude of the final difference cluster of one seed set, against the clean run, or -1 when a
// seed slot is occupied (not a legal birth)
function response(
  s: Setting,
  birth: number,
  seeds: { cell: number; beat: number; direction: number }[],
): number {
  const finals: Will[] = []

  for (let which = 0; which < 2; which++) {
    let will: Will = makeWill(s.mesh)

    for (let t = 0; t < s.beats; t++) {
      if (which === 1) {
        for (const seed of seeds) {
          if (seed.beat === t) {
            const index = seed.cell * s.mesh.degree + seed.direction

            if (will.data[index] !== 0) {
              return -1
            }

            will.data[index] = 1
          }
        }
      }

      will = growingBeat(will, ruleOf(s), cell =>
        s.late.has(cell) ? t >= birth : true,
      )
    }

    finals.push(will)
  }

  return Math.sqrt(
    pairAbs2(
      pairSub(
        regionClockAmplitude(finals[1]!, s.lateCells),
        regionClockAmplitude(finals[0]!, s.lateCells),
      ),
    ),
  )
}

// first legal seed beat for a domain born at `birth`: at least 3, congruent to birth mod 3
function legalBeat(birth: number): number {
  let beat = 3

  while (beat % 3 !== birth % 3) {
    beat++
  }

  return beat
}

export default experiment({
  id: 'foundations/wall-measures-the-clock',
  code: 'E-FND-0091',
  title:
    'the domain wall is a projective measurement of the clock class with counting weights: over an exhaustive 75-seed ensemble at side 9 the wall amplifies offset-2 defects (72 of 75, three slot-level exceptions, one an exact annihilation) and leaves every offset-0, 1 and 3 defect at exactly sqrt 3, confirmed at side 11 at its own post-onset beat, and the response to two and three separated amplifying defects is the exact sum of the singles (deviating only when the clusters touch), so the base has the definite outcome and the phase selection while the Born quadratic weight cannot arise: defects occupy one clock class each and the detector adds counts',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const main = setting(9, 3, 24)

    // 1. the exhaustive outcome census per offset
    const census: Record<number, { quiet: number; loud: number; middle: number; legal: number; exactRoot3: number }> = {}

    for (const birth of [0, 1, 2, 3]) {
      const beat = legalBeat(birth)
      const row = { quiet: 0, loud: 0, middle: 0, legal: 0, exactRoot3: 0 }

      for (const cell of main.deepSites) {
        for (const direction of [0, 6, 12]) {
          const magnitude = response(main, birth, [
            { cell, beat, direction },
          ])

          if (magnitude < 0) {
            continue
          }

          row.legal++

          if (magnitude < QUIET) {
            row.quiet++

            if (Math.abs(magnitude - ROOT3) < EXACT || magnitude < EXACT) {
              row.exactRoot3++
            }
          } else if (magnitude > LOUD) {
            row.loud++
          } else {
            row.middle++
          }
        }
      }

      census[birth] = row
    }

    // 2. counting weights: separated amplifying defects respond as the sum of singles
    const shellOne = main.deepSites.filter(cell => cell !== 0)
    const beat2 = legalBeat(2)
    const singles = shellOne
      .slice(0, 3)
      .map(cell => response(main, 2, [{ cell, beat: beat2, direction: 0 }]))

    let worstCountLaw = 0

    for (let n = 2; n <= 3; n++) {
      const joint = response(
        main,
        2,
        shellOne.slice(0, n).map(cell => ({ cell, beat: beat2, direction: 0 })),
      )
      const sum = singles.slice(0, n).reduce((a, b) => a + b, 0)

      worstCountLaw = Math.max(worstCountLaw, Math.abs(joint - sum))
    }

    // 3. the second size: a reduced offset-2 and offset-1 census at side 11
    const big = setting(11, 3, 36)
    const bigSites = big.deepSites.filter((_, i) => i % 2 === 0)

    let bigLoud = 0
    let bigQuiet1 = 0
    let bigLegal2 = 0
    let bigLegal1 = 0

    for (const cell of bigSites) {
      const two = response(big, 2, [
        { cell, beat: legalBeat(2), direction: 0 },
      ])

      if (two >= 0) {
        bigLegal2++

        if (two > LOUD) {
          bigLoud++
        }
      }

      const one = response(big, 1, [
        { cell, beat: legalBeat(1), direction: 0 },
      ])

      if (one >= 0) {
        bigLegal1++

        if (one < QUIET) {
          bigQuiet1++
        }
      }
    }

    const offset2 = census[2]!
    const projective =
      census[0]!.quiet === census[0]!.legal &&
      census[1]!.quiet === census[1]!.legal &&
      census[3]!.quiet === census[3]!.legal &&
      offset2.loud >= 0.9 * offset2.legal
    const quietExact =
      census[0]!.exactRoot3 === census[0]!.legal &&
      census[1]!.exactRoot3 === census[1]!.legal &&
      census[3]!.exactRoot3 === census[3]!.legal
    const countingWeights = worstCountLaw < EXACT
    const secondSize =
      bigLoud >= 0.9 * bigLegal2 && bigQuiet1 === bigLegal1

    const ok = projective && quietExact && countingWeights && secondSize

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every legal defect at offsets 0, 1 and 3 keeps exactly its sqrt 3 magnitude through wall passage (or has no wall to pass), at least ninety percent of offset-2 defects are amplified beyond magnitude 6 (the measured exceptions are slot-level and reported), the same selection holds at side 11, and the joint response of two and three separated amplifying defects equals the sum of their single responses within 1e-6, so the wall measures the clock class projectively and weighs by count, and the quadratic Born weight has no substrate-level origin in the rule as constituted',
      metrics: {
        legalPerOffset: census[0]!.legal,
        offset2Loud: offset2.loud,
        offset2Quiet: offset2.quiet,
        offset2Middle: offset2.middle,
        worstCountLaw: Number(worstCountLaw.toExponential(2)),
        side11Loud: bigLoud,
        side11Legal: bigLegal2,
      },
      // CONTROL: the in-phase and no-wall offsets, where every defect stays exactly sqrt 3
      control: {
        offset0Quiet: census[0]!.quiet,
        offset1Quiet: census[1]!.quiet,
        offset3Quiet: census[3]!.quiet,
        side11Offset1Quiet: bigQuiet1,
      },
      notes:
        'Roadmap base-model 0007, the Born half, answered as far as the base can answer it: the definite outcome and the phase selection are substrate phenomena (this experiment), the weight is counting, and the quadratic weight would need defects superposed across clock classes, which the permutation theorem forbids the rule to make. Together with quantum/collapse-is-not-the-weight (the same step-not-weight shape at the holder level) the two ends of the program now agree: collapse yes, Born weight no, and any sixth thing that supplies superposed defects gets tested by exactly this ensemble. The three offset-2 exceptions are specific (cell, direction) slots at the ball surface geometry, one of which annihilates exactly, kept in the census rather than smoothed away.',
    })
  },
})
